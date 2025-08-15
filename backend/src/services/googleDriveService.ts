import axios from 'axios';

// Google Drive API configuration
const GOOGLE_DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';
const GOOGLE_DRIVE_UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3';

// Hàm lấy access token từ Google Drive API
async function getGoogleDriveAccessToken(): Promise<string> {
  const userEmail = process.env.GOOGLE_DRIVE_USER_EMAIL;
  const userPassword = process.env.GOOGLE_DRIVE_USER_PASSWORD;
  const clientId = process.env.GOOGLE_DRIVE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_DRIVE_CLIENT_SECRET;

  if (!userEmail || !userPassword || !clientId || !clientSecret) {
    throw new Error('Google Drive credentials not configured');
  }

  try {
    // Sử dụng OAuth2 với Resource Owner Password Credentials
    const tokenResponse = await axios.post(
      'https://oauth2.googleapis.com/token',
      new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        scope: 'https://www.googleapis.com/auth/drive.file',
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
    console.error('Failed to get Google Drive access token:', error);
    throw new Error('Failed to authenticate with Google Drive');
  }
}

// Hàm upload file lên Google Drive
export async function uploadFileToGoogleDrive({
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
    const accessToken = await getGoogleDriveAccessToken();
    
    // Tạo thư mục Issue-{issueId}
    const folderName = `Issue-${issueId}`;
    
    // Tạo thư mục trong Google Drive
    let folderId = null;
    try {
      const { data: folder } = await axios.post(
        `${GOOGLE_DRIVE_API_BASE}/files`,
        {
          name: folderName,
          mimeType: 'application/vnd.google-apps.folder'
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
        const { data: files } = await axios.get(
          `${GOOGLE_DRIVE_API_BASE}/files?q=name='${folderName}' and mimeType='application/vnd.google-apps.folder'`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (files.files && files.files.length > 0) {
          folderId = files.files[0].id;
          console.log('Found existing folder:', files.files[0].name, 'with ID:', folderId);
        } else {
          throw new Error('Cannot find or create folder');
        }
      } else {
        throw err;
      }
    }
    
    // Upload file vào thư mục
    const uploadUrl = `${GOOGLE_DRIVE_UPLOAD_API}/files?uploadType=multipart`;
    
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
    const multipartBody = [
      `--${boundary}`,
      'Content-Type: application/json; charset=UTF-8',
      '',
      JSON.stringify({
        name: filename,
        parents: [folderId]
      }),
      `--${boundary}`,
      'Content-Type: application/octet-stream',
      '',
      file.toString('base64'),
      `--${boundary}--`
    ].join('\r\n');
    
    const uploadRes = await axios.post(uploadUrl, multipartBody, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`
      }
    });
    
    const fileId = uploadRes.data.id;
    const downloadUrl = `https://drive.google.com/uc?id=${fileId}`;
    
    // Tạo link chia sẻ
    const shareRes = await axios.post(
      `${GOOGLE_DRIVE_API_BASE}/files/${fileId}/permissions`,
      {
        role: 'reader',
        type: 'anyone'
      },
      {
        headers: { 
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const shareLink = `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
    
    console.log('Google Drive upload successful:', {
      filename,
      fileId,
      shareLink,
      downloadUrl
    });

    return { fileId, shareLink, downloadUrl };
  } catch (error) {
    console.error('Google Drive upload failed:', error);
    throw new Error('Failed to upload file to Google Drive');
  }
}

// Hàm upload file cho documents
export async function uploadDocumentToGoogleDrive({
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
    const accessToken = await getGoogleDriveAccessToken();
    
    // Tạo cấu trúc thư mục: Project-{projectId}/Container-{containerId}
    const projectFolderName = `Project-${projectId}`;
    const containerFolderName = containerId ? `Container-${containerId}` : null;
    
    // Tạo thư mục project
    let projectFolderId = null;
    try {
      const { data: projectFolder } = await axios.post(
        `${GOOGLE_DRIVE_API_BASE}/files`,
        {
          name: projectFolderName,
          mimeType: 'application/vnd.google-apps.folder'
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
        const { data: files } = await axios.get(
          `${GOOGLE_DRIVE_API_BASE}/files?q=name='${projectFolderName}' and mimeType='application/vnd.google-apps.folder'`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (files.files && files.files.length > 0) {
          projectFolderId = files.files[0].id;
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
          `${GOOGLE_DRIVE_API_BASE}/files`,
          {
            name: containerFolderName,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [projectFolderId]
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
          const { data: files } = await axios.get(
            `${GOOGLE_DRIVE_API_BASE}/files?q=name='${containerFolderName}' and mimeType='application/vnd.google-apps.folder' and '${projectFolderId}' in parents`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );
          if (files.files && files.files.length > 0) {
            targetFolderId = files.files[0].id;
          } else {
            throw new Error('Cannot find or create container folder');
          }
        } else {
          throw err;
        }
      }
    }
    
    // Upload file
    const uploadUrl = `${GOOGLE_DRIVE_UPLOAD_API}/files?uploadType=multipart`;
    
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
    const multipartBody = [
      `--${boundary}`,
      'Content-Type: application/json; charset=UTF-8',
      '',
      JSON.stringify({
        name: filename,
        parents: [targetFolderId]
      }),
      `--${boundary}`,
      'Content-Type: application/octet-stream',
      '',
      file.toString('base64'),
      `--${boundary}--`
    ].join('\r\n');
    
    const uploadRes = await axios.post(uploadUrl, multipartBody, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`
      }
    });
    
    const fileId = uploadRes.data.id;
    const downloadUrl = `https://drive.google.com/uc?id=${fileId}`;
    
    // Tạo link chia sẻ
    const shareRes = await axios.post(
      `${GOOGLE_DRIVE_API_BASE}/files/${fileId}/permissions`,
      {
        role: 'reader',
        type: 'anyone'
      },
      {
        headers: { 
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const shareLink = `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
    
    console.log('Google Drive document upload successful:', {
      filename,
      fileId,
      shareLink,
      downloadUrl
    });

    return { fileId, shareLink, downloadUrl };
  } catch (error) {
    console.error('Google Drive document upload failed:', error);
    throw new Error('Failed to upload document to Google Drive');
  }
} 