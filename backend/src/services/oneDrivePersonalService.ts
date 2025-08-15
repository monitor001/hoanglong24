import axios from 'axios';

// OneDrive Personal API configuration
const ONEDRIVE_CLIENT_ID = '000000004C12AE6F'; // Microsoft's public client ID for OneDrive Personal
const ONEDRIVE_USER_EMAIL = 'nguyenthanhvc@hotmail.com';
const ONEDRIVE_USER_PASSWORD = 'Ab5463698664#'; // ⚠️ Cần đổi password sau khi test

// OneDrive Personal API endpoints
const ONEDRIVE_API_BASE = 'https://api.onedrive.com/v1.0';
const AUTH_ENDPOINT = 'https://login.live.com/oauth20_token.srf';

// Class quản lý authentication cho OneDrive Personal
class OneDrivePersonalAuth {
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;

  async getAccessToken(): Promise<string> {
    // Kiểm tra token còn hạn
    if (this.accessToken && Date.now() < this.tokenExpiresAt) {
      console.log('Using cached OneDrive Personal access token');
      return this.accessToken;
    }

    console.log('Getting new OneDrive Personal access token...');

    try {
      // Sử dụng Resource Owner Password Credentials flow cho OneDrive Personal
      const response = await axios.post(
        AUTH_ENDPOINT,
        new URLSearchParams({
          client_id: ONEDRIVE_CLIENT_ID,
          scope: 'onedrive.readwrite',
          grant_type: 'password',
          username: ONEDRIVE_USER_EMAIL,
          password: ONEDRIVE_USER_PASSWORD
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      console.log('OneDrive Personal token response received:', {
        hasAccessToken: !!response.data.access_token,
        expiresIn: response.data.expires_in,
        tokenType: response.data.token_type
      });

      this.accessToken = response.data.access_token;
      this.tokenExpiresAt = Date.now() + (response.data.expires_in * 1000) - 60000;

      return this.accessToken;
    } catch (error) {
      console.error('Failed to get OneDrive Personal access token:', error.response?.data || error.message);
      throw new Error('Failed to authenticate with OneDrive Personal');
    }
  }
}

// Instance auth
const auth = new OneDrivePersonalAuth();

// Hàm upload file lên OneDrive Personal
export async function uploadFileToOneDrivePersonal({
  issueId,
  file,
  filename
}: {
  issueId: string;
  file: Buffer;
  filename: string;
}): Promise<{ fileId: string; shareLink: string; downloadUrl: string }> {
  try {
    // Lấy access token
    const accessToken = await auth.getAccessToken();
    
    // Tạo thư mục Issue-{issueId}
    const folderName = `Issue-${issueId}`;
    
    // Upload file trực tiếp vào thư mục (OneDrive Personal tự động tạo thư mục)
    const uploadUrl = `${ONEDRIVE_API_BASE}/drive/root:/${folderName}/${filename}:/content`;
    
    const uploadRes = await axios.put(uploadUrl, file, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/octet-stream'
      }
    });
    
    const fileId = uploadRes.data.id;
    const downloadUrl = uploadRes.data['@content.downloadUrl'];
    
    // Tạo link chia sẻ
    const shareRes = await axios.post(
      `${ONEDRIVE_API_BASE}/drive/items/${fileId}/action.createLink`,
      {
        type: 'view',
        scope: 'anonymous'
      },
      {
        headers: { 
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const shareLink = shareRes.data.link.webUrl;
    
    console.log('OneDrive Personal upload successful:', {
      filename,
      fileId,
      shareLink,
      downloadUrl
    });

    return { fileId, shareLink, downloadUrl };
  } catch (error) {
    console.error('OneDrive Personal upload failed:', error.response?.data || error.message);
    throw new Error('Failed to upload file to OneDrive Personal');
  }
}

// Hàm upload file cho documents
export async function uploadDocumentToOneDrivePersonal({
  projectId,
  containerId,
  file,
  filename
}: {
  projectId: string;
  containerId?: string;
  file: Buffer;
  filename: string;
}): Promise<{ fileId: string; shareLink: string; downloadUrl: string }> {
  try {
    // Lấy access token
    const accessToken = await auth.getAccessToken();
    
    // Tạo đường dẫn file
    let filePath = `Project-${projectId}`;
    if (containerId) {
      filePath += `/Container-${containerId}`;
    }
    filePath += `/${filename}`;
    
    // Upload file
    const uploadUrl = `${ONEDRIVE_API_BASE}/drive/root:/${filePath}:/content`;
    
    const uploadRes = await axios.put(uploadUrl, file, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/octet-stream'
      }
    });
    
    const fileId = uploadRes.data.id;
    const downloadUrl = uploadRes.data['@content.downloadUrl'];
    
    // Tạo link chia sẻ
    const shareRes = await axios.post(
      `${ONEDRIVE_API_BASE}/drive/items/${fileId}/action.createLink`,
      {
        type: 'view',
        scope: 'anonymous'
      },
      {
        headers: { 
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const shareLink = shareRes.data.link.webUrl;
    
    console.log('OneDrive Personal document upload successful:', {
      filename,
      fileId,
      shareLink,
      downloadUrl
    });

    return { fileId, shareLink, downloadUrl };
  } catch (error) {
    console.error('OneDrive Personal document upload failed:', error.response?.data || error.message);
    throw new Error('Failed to upload document to OneDrive Personal');
  }
} 