import axios from 'axios';

// Azure OneDrive API configuration - KHÔNG BAO GIỜ dùng password!
const AZURE_TENANT_ID = process.env.AZURE_TENANT_ID || '5f709bea-f82e-4544-857d-722eff5d6512';
const AZURE_CLIENT_ID = process.env.AZURE_CLIENT_ID || '117381fe-3f39-4d70-816e-052e44e79e7d';

// Microsoft Graph API endpoints
const GRAPH_API_BASE = 'https://graph.microsoft.com/v1.0';
const AUTH_ENDPOINT = `https://login.microsoftonline.com/${AZURE_TENANT_ID}/oauth2/v2.0/token`;

// Class quản lý authentication an toàn
class AzureOneDriveAuth {
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;

  async getAccessToken(): Promise<string> {
    // Kiểm tra token còn hạn
    if (this.accessToken && Date.now() < this.tokenExpiresAt) {
      console.log('Using cached access token');
      return this.accessToken;
    }

    console.log('Getting new access token from Azure...');
    console.log('Client ID:', AZURE_CLIENT_ID);
    console.log('Tenant ID:', AZURE_TENANT_ID);
    console.log('Client Secret exists:', !!process.env.AZURE_CLIENT_SECRET);
    console.log('Refresh Token exists:', !!process.env.AZURE_REFRESH_TOKEN);

    try {
      // Lấy token mới bằng refresh token
      const response = await axios.post(
        AUTH_ENDPOINT,
        new URLSearchParams({
          client_id: AZURE_CLIENT_ID,
          client_secret: process.env.AZURE_CLIENT_SECRET!,
          refresh_token: process.env.AZURE_REFRESH_TOKEN!,
          grant_type: 'refresh_token',
          scope: 'Files.ReadWrite.All offline_access'
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      console.log('Token response received:', {
        hasAccessToken: !!response.data.access_token,
        expiresIn: response.data.expires_in,
        tokenType: response.data.token_type
      });

      this.accessToken = response.data.access_token;
      this.tokenExpiresAt = Date.now() + (response.data.expires_in * 1000) - 60000;

      return this.accessToken;
    } catch (error) {
      console.error('Failed to get Azure access token:', error.response?.data || error.message);
      throw new Error('Failed to authenticate with Azure AD');
    }
  }
}

// Instance auth
const auth = new AzureOneDriveAuth();

// Hàm upload file lên OneDrive
export async function uploadFileToAzureOneDrive({
  issueId,
  file,
  filename
}: {
  issueId: string;
  file: Buffer;
  filename: string;
}): Promise<{ fileId: string; shareLink: string; downloadUrl: string }> {
  try {
    // Lấy access token an toàn
    const accessToken = await auth.getAccessToken();
    
    // Tạo thư mục Issue-{issueId}
    const folderName = `Issue-${issueId}`;
    
    // Tạo thư mục trong OneDrive
    let folderId = null;
    try {
      const { data: folder } = await axios.post(
        `${GRAPH_API_BASE}/me/drive/root/children`,
        {
          name: folderName,
          folder: {},
          '@microsoft.graph.conflictBehavior': 'rename'
        },
        {
          headers: { 
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      folderId = folder.id;
      console.log('Created folder:', folder.name, 'with ID:', folderId);
    } catch (err: any) {
      if (err.response && err.response.status === 409) {
        // Thư mục đã tồn tại, tìm ID
        const { data: children } = await axios.get(
          `${GRAPH_API_BASE}/me/drive/root/children?$filter=name eq '${folderName}' and folder ne null`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (children.value && children.value.length > 0) {
          folderId = children.value[0].id;
          console.log('Found existing folder:', children.value[0].name, 'with ID:', folderId);
        } else {
          throw new Error('Cannot find or create folder');
        }
      } else {
        throw err;
      }
    }
    
    // Upload file vào thư mục
    const uploadUrl = `${GRAPH_API_BASE}/me/drive/items/${folderId}:/${filename}:/content`;
    
    const uploadRes = await axios.put(uploadUrl, file, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/octet-stream'
      }
    });
    
    const fileId = uploadRes.data.id;
    const downloadUrl = uploadRes.data['@microsoft.graph.downloadUrl'];
    
    // Tạo link chia sẻ
    const shareRes = await axios.post(
      `${GRAPH_API_BASE}/me/drive/items/${fileId}/createLink`,
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
    
    console.log('Azure OneDrive upload successful:', {
      filename,
      fileId,
      shareLink,
      downloadUrl
    });

    return { fileId, shareLink, downloadUrl };
  } catch (error) {
    console.error('Azure OneDrive upload failed:', error);
    throw new Error('Failed to upload file to Azure OneDrive');
  }
}

// Hàm upload file cho documents
export async function uploadDocumentToAzureOneDrive({
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
    // Lấy access token an toàn
    const accessToken = await auth.getAccessToken();
    
    // Tạo cấu trúc thư mục: Project-{projectId}/Container-{containerId}
    const projectFolderName = `Project-${projectId}`;
    const containerFolderName = containerId ? `Container-${containerId}` : null;
    
    // Tạo thư mục project
    let projectFolderId = null;
    try {
      const { data: projectFolder } = await axios.post(
        `${GRAPH_API_BASE}/me/drive/root/children`,
        {
          name: projectFolderName,
          folder: {},
          '@microsoft.graph.conflictBehavior': 'rename'
        },
        {
          headers: { 
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      projectFolderId = projectFolder.id;
    } catch (err: any) {
      if (err.response && err.response.status === 409) {
        const { data: children } = await axios.get(
          `${GRAPH_API_BASE}/me/drive/root/children?$filter=name eq '${projectFolderName}' and folder ne null`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (children.value && children.value.length > 0) {
          projectFolderId = children.value[0].id;
        } else {
          throw new Error('Cannot find or create project folder');
        }
      } else {
        throw err;
      }
    }
    
    // Nếu có containerId, tạo thư mục container
    let targetFolderId = projectFolderId;
    if (containerId) {
      try {
        const { data: containerFolder } = await axios.post(
          `${GRAPH_API_BASE}/me/drive/items/${projectFolderId}/children`,
          {
            name: containerFolderName,
            folder: {},
            '@microsoft.graph.conflictBehavior': 'rename'
          },
          {
            headers: { 
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
        targetFolderId = containerFolder.id;
      } catch (err: any) {
        if (err.response && err.response.status === 409) {
          const { data: children } = await axios.get(
            `${GRAPH_API_BASE}/me/drive/items/${projectFolderId}/children?$filter=name eq '${containerFolderName}' and folder ne null`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );
          if (children.value && children.value.length > 0) {
            targetFolderId = children.value[0].id;
          } else {
            throw new Error('Cannot find or create container folder');
          }
        } else {
          throw err;
        }
      }
    }
    
    // Upload file
    const uploadUrl = `${GRAPH_API_BASE}/me/drive/items/${targetFolderId}:/${filename}:/content`;
    
    const uploadRes = await axios.put(uploadUrl, file, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/octet-stream'
      }
    });
    
    const fileId = uploadRes.data.id;
    const downloadUrl = uploadRes.data['@microsoft.graph.downloadUrl'];
    
    // Tạo link chia sẻ
    const shareRes = await axios.post(
      `${GRAPH_API_BASE}/me/drive/items/${fileId}/createLink`,
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
    
    console.log('Azure OneDrive document upload successful:', {
      filename,
      fileId,
      shareLink,
      downloadUrl
    });

    return { fileId, shareLink, downloadUrl };
  } catch (error) {
    console.error('Azure OneDrive document upload failed:', error);
    throw new Error('Failed to upload document to Azure OneDrive');
  }
} 