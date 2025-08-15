import axios from 'axios';

// Hàm lấy access token từ OneDrive Personal API
async function getOneDriveAccessToken(): Promise<string> {
  const userEmail = process.env.ONEDRIVE_USER_EMAIL;
  const userPassword = process.env.ONEDRIVE_USER_PASSWORD;

  if (!userEmail || !userPassword) {
    throw new Error('OneDrive user credentials not configured');
  }

  try {
    // Sử dụng OneDrive Personal API với username/password
    const tokenResponse = await axios.post(
      'https://login.live.com/oauth20_token.srf',
      new URLSearchParams({
        client_id: '000000004C12AE6F', // OneDrive Personal client ID
        scope: 'onedrive.readwrite',
        grant_type: 'password',
        username: userEmail,
        password: userPassword
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    return tokenResponse.data.access_token;
  } catch (error) {
    console.error('Failed to get OneDrive access token:', error);
    throw new Error('Failed to authenticate with OneDrive');
  }
}

// Hàm upload file lên OneDrive
export async function uploadFileToOneDrive({
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
    const accessToken = await getOneDriveAccessToken();
    
    // Tạo thư mục Issue-{issueId}
    const folderName = `Issue-${issueId}`;
    
    // Upload file trực tiếp vào thư mục
    const uploadUrl = `https://api.onedrive.com/v1.0/drive/root:/Issue-${issueId}/${filename}:/content`;
    
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
      `https://api.onedrive.com/v1.0/drive/items/${fileId}/action.createLink`,
      {
        type: 'view',
        scope: 'anonymous'
      },
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );
    
    const shareLink = shareRes.data.link.webUrl;
    
    console.log('OneDrive upload successful:', {
      filename,
      fileId,
      shareLink,
      downloadUrl
    });

    return { fileId, shareLink, downloadUrl };
  } catch (error) {
    console.error('OneDrive upload failed:', error);
    throw new Error('Failed to upload file to OneDrive');
  }
}

// Hàm upload file cho documents
export async function uploadDocumentToOneDrive({
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
    const accessToken = await getOneDriveAccessToken();
    
    // Tạo cấu trúc thư mục: Project-{projectId}/Container-{containerId}
    const folderPath = containerId 
      ? `/Project-${projectId}/Container-${containerId}`
      : `/Project-${projectId}`;
    
    // Upload file
    const uploadUrl = `https://api.onedrive.com/v1.0/drive/root:${folderPath}/${filename}:/content`;
    
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
      `https://api.onedrive.com/v1.0/drive/items/${fileId}/action.createLink`,
      {
        type: 'view',
        scope: 'anonymous'
      },
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );
    
    const shareLink = shareRes.data.link.webUrl;
    
    console.log('OneDrive document upload successful:', {
      filename,
      fileId,
      shareLink,
      downloadUrl
    });

    return { fileId, shareLink, downloadUrl };
  } catch (error) {
    console.error('OneDrive document upload failed:', error);
    throw new Error('Failed to upload document to OneDrive');
  }
}