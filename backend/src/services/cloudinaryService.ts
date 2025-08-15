import { v2 as cloudinary } from 'cloudinary';

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'your-cloud-name',
  api_key: process.env.CLOUDINARY_API_KEY || 'your-api-key',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'your-api-secret'
});

// Upload file lên Cloudinary cho issues
export async function uploadFileToCloudinary({
  issueId,
  file,
  filename
}: {
  issueId: string;
  file: Buffer;
  filename: string;
}): Promise<{ fileId: string; shareLink: string; downloadUrl: string }> {
  try {
    console.log('Starting Cloudinary upload for file:', filename);
    
    // Xác định MIME type và resource_type dựa trên file extension
    const fileExtension = filename.toLowerCase().split('.').pop();
    let mimeType = 'application/octet-stream';
    let uploadOptions: any = { resource_type: 'raw' };
    
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(fileExtension || '')) {
      mimeType = `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`;
      uploadOptions.resource_type = 'image';
    } else if (fileExtension === 'pdf') {
      mimeType = 'application/pdf';
    } else if (['doc', 'docx'].includes(fileExtension || '')) {
      mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    } else if (['xls', 'xlsx'].includes(fileExtension || '')) {
      mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    } else if (['ppt', 'pptx'].includes(fileExtension || '')) {
      mimeType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    } else if (fileExtension === 'txt') {
      mimeType = 'text/plain';
    }
    
    // Convert buffer to base64
    const base64Data = file.toString('base64');
    const dataURI = `data:${mimeType};base64,${base64Data}`;
    
    const result = await cloudinary.uploader.upload(dataURI, uploadOptions);
    
    const fileId = result.public_id;
    const shareLink = result.secure_url;
    const downloadUrl = result.secure_url;
    
    console.log('Cloudinary upload completed:', {
      filename,
      fileId,
      shareLink,
      downloadUrl
    });

    return { fileId, shareLink, downloadUrl };
  } catch (error) {
    console.error('Cloudinary upload failed:', error);
    throw new Error('Failed to upload file to Cloudinary');
  }
}

// Upload file lên Cloudinary cho documents
export async function uploadDocumentToCloudinary({
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
    console.log('Starting Cloudinary document upload for file:', filename);
    
    // Xác định MIME type và resource_type dựa trên file extension
    const fileExtension = filename.toLowerCase().split('.').pop();
    let mimeType = 'application/octet-stream';
    let uploadOptions: any = { resource_type: 'raw' };
    
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(fileExtension || '')) {
      mimeType = `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`;
      uploadOptions.resource_type = 'image';
    } else if (fileExtension === 'pdf') {
      mimeType = 'application/pdf';
    } else if (['doc', 'docx'].includes(fileExtension || '')) {
      mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    } else if (['xls', 'xlsx'].includes(fileExtension || '')) {
      mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    } else if (['ppt', 'pptx'].includes(fileExtension || '')) {
      mimeType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    } else if (fileExtension === 'txt') {
      mimeType = 'text/plain';
    }
    
    // Convert buffer to base64
    const base64Data = file.toString('base64');
    const dataURI = `data:${mimeType};base64,${base64Data}`;
    
    const result = await cloudinary.uploader.upload(dataURI, uploadOptions);
    
    const fileId = result.public_id;
    const shareLink = result.secure_url;
    const downloadUrl = result.secure_url;
    
    console.log('Cloudinary document upload completed:', {
      filename,
      fileId,
      shareLink,
      downloadUrl
    });

    return { fileId, shareLink, downloadUrl };
  } catch (error) {
    console.error('Cloudinary document upload failed:', error);
    throw new Error('Failed to upload document to Cloudinary');
  }
}

// Delete file from Cloudinary
export async function deleteFileFromCloudinary(fileId: string): Promise<boolean> {
  try {
    console.log('Starting Cloudinary delete for file ID:', fileId);
    
    const result = await cloudinary.uploader.destroy(fileId);
    
    console.log('Cloudinary delete completed:', {
      fileId,
      result
    });

    return result.result === 'ok';
  } catch (error) {
    console.error('Cloudinary delete failed:', error);
    return false; // Return false instead of throwing to avoid breaking the flow
  }
} 