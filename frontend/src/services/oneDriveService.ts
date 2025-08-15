import { Client } from '@microsoft/microsoft-graph-client';
import { PublicClientApplication } from '@azure/msal-browser';

class OneDriveService {
  private msalConfig = {
    auth: {
      clientId: process.env.REACT_APP_AZURE_CLIENT_ID || '8f7b3c2a-1e4d-4f6a-9b8c-7d5e3f2a1b9c', // Demo Client ID
      authority: 'https://login.microsoftonline.com/common',
      redirectUri: window.location.origin
    }
  };

  private msalInstance!: PublicClientApplication;
  private graphClient: Client | null = null;
  private isInitialized = false;
  private isLoggingIn = false;
  private isOneDriveEnabled = true; // Enable OneDrive với demo Client ID

  constructor() {
    // Sử dụng demo Client ID để test
    this.isOneDriveEnabled = true;
    this.msalInstance = new PublicClientApplication(this.msalConfig);
    this.initialize();
    console.log('OneDrive service initialized with demo Client ID');
  }

  // Khởi tạo MSAL
  private async initialize() {
    try {
      await this.msalInstance.initialize();
      this.isInitialized = true;
    } catch (error) {
      console.error('MSAL initialization failed:', error);
    }
  }

  // Đảm bảo MSAL đã được khởi tạo
  private async ensureInitialized() {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  // Đăng nhập và lấy token
  async login() {
    if (!this.isOneDriveEnabled) {
      throw new Error('OneDrive is not configured. Please set REACT_APP_AZURE_CLIENT_ID');
    }

    try {
      // Kiểm tra nếu đang trong quá trình login
      if (this.isLoggingIn) {
        console.log('Login already in progress, please wait...');
        return;
      }

      await this.ensureInitialized();
      
      // Kiểm tra nếu đã có account đăng nhập
      const accounts = this.msalInstance.getAllAccounts();
      if (accounts.length > 0) {
        try {
          const silentRequest = {
            scopes: ['Files.ReadWrite', 'User.Read'],
            account: accounts[0]
          };
          const response = await this.msalInstance.acquireTokenSilent(silentRequest);
          this.initializeGraphClient(response.accessToken);
          return response;
        } catch (silentError) {
          console.log('Silent token acquisition failed, proceeding with popup login');
        }
      }

      this.isLoggingIn = true;
      
      const loginResponse = await this.msalInstance.loginPopup({
        scopes: ['Files.ReadWrite', 'User.Read']
      });
      
      this.initializeGraphClient(loginResponse.accessToken);
      this.isLoggingIn = false;
      return loginResponse;
    } catch (error) {
      this.isLoggingIn = false;
      console.error('Login failed:', error);
      throw error;
    }
  }

  // Khởi tạo Graph Client
  private initializeGraphClient(accessToken: string) {
    this.graphClient = Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      }
    });
  }

  // Upload file lên OneDrive
  async uploadFile(file: File, folderPath: string = '/QLDA/Issues'): Promise<any> {
    if (!this.graphClient) {
      throw new Error('Not authenticated');
    }

    try {
      // Tạo đường dẫn file
      const fileName = `${Date.now()}_${file.name}`;
      const filePath = `${folderPath}/${fileName}`;

      // Upload file nhỏ (< 4MB)
      if (file.size < 4 * 1024 * 1024) {
        const uploadResult = await this.graphClient
          .api(`/me/drive/root:${filePath}:/content`)
          .put(file);
        
        return {
          id: uploadResult.id,
          name: uploadResult.name,
          webUrl: uploadResult.webUrl,
          downloadUrl: uploadResult['@microsoft.graph.downloadUrl'],
          size: uploadResult.size,
          createdDateTime: uploadResult.createdDateTime
        };
      } else {
        // Upload file lớn với session
        return await this.uploadLargeFile(file, filePath);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    }
  }

  // Upload file lớn
  private async uploadLargeFile(file: File, filePath: string) {
    // Tạo upload session
    const uploadSession = await this.graphClient!
      .api(`/me/drive/root:${filePath}:/createUploadSession`)
      .post({
        item: {
          '@microsoft.graph.conflictBehavior': 'rename'
        }
      });

    const uploadUrl = uploadSession.uploadUrl;
    const fileSize = file.size;
    const chunkSize = 320 * 1024; // 320KB chunks
    let start = 0;

    while (start < fileSize) {
      const end = Math.min(start + chunkSize, fileSize);
      const chunk = file.slice(start, end);
      
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Length': `${end - start}`,
          'Content-Range': `bytes ${start}-${end - 1}/${fileSize}`
        },
        body: chunk
      });

      if (response.ok && response.status === 201) {
        const result = await response.json();
        return {
          id: result.id,
          name: result.name,
          webUrl: result.webUrl,
          downloadUrl: result['@microsoft.graph.downloadUrl'],
          size: result.size,
          createdDateTime: result.createdDateTime
        };
      }

      start = end;
    }
  }

  // Lấy link chia sẻ
  async createShareLink(fileId: string): Promise<string> {
    if (!this.graphClient) {
      throw new Error('Not authenticated');
    }

    const shareLink = await this.graphClient
      .api(`/me/drive/items/${fileId}/createLink`)
      .post({
        type: 'view',
        scope: 'anonymous'
      });

    return shareLink.link.webUrl;
  }

  // Download file
  async downloadFile(fileId: string): Promise<Blob> {
    if (!this.graphClient) {
      throw new Error('Not authenticated');
    }

    const response = await this.graphClient
      .api(`/me/drive/items/${fileId}/content`)
      .get();

    return response;
  }

  // Xóa file
  async deleteFile(fileId: string): Promise<void> {
    if (!this.graphClient) {
      throw new Error('Not authenticated');
    }

    await this.graphClient
      .api(`/me/drive/items/${fileId}`)
      .delete();
  }

  // Kiểm tra trạng thái đăng nhập
  async checkAuth(): Promise<boolean> {
    if (!this.isOneDriveEnabled) {
      return false;
    }

    try {
      await this.ensureInitialized();
      
      const accounts = this.msalInstance.getAllAccounts();
      if (accounts.length === 0) {
        return false;
      }

      // Kiểm tra token có hợp lệ không
      const silentRequest = {
        scopes: ['Files.ReadWrite', 'User.Read'],
        account: accounts[0]
      };

      await this.msalInstance.acquireTokenSilent(silentRequest);
      return true;
    } catch (error) {
      console.error('Auth check failed:', error);
      return false;
    }
  }

  // Lấy access token hiện tại
  async getAccessToken(): Promise<string> {
    if (!this.isOneDriveEnabled) {
      throw new Error('OneDrive is not configured. Please set REACT_APP_AZURE_CLIENT_ID');
    }

    try {
      await this.ensureInitialized();
      
      const accounts = this.msalInstance.getAllAccounts();
      if (accounts.length === 0) {
        // Nếu không có account, thử đăng nhập trước
        const loginResponse = await this.login();
        if (loginResponse && loginResponse.accessToken) {
          return loginResponse.accessToken;
        }
        throw new Error('Login failed - no access token received');
      }

      const silentRequest = {
        scopes: ['Files.ReadWrite', 'User.Read'],
        account: accounts[0]
      };

      const response = await this.msalInstance.acquireTokenSilent(silentRequest);
      return response.accessToken;
    } catch (error: any) {
      console.error('Get access token failed:', error);
      
      // Nếu silent token acquisition thất bại, thử đăng nhập lại
      if (error.errorCode === 'interaction_required' || error.errorCode === 'consent_required') {
        try {
          const loginResponse = await this.login();
          if (loginResponse && loginResponse.accessToken) {
            return loginResponse.accessToken;
          }
          throw new Error('Login failed - no access token received');
        } catch (loginError) {
          throw loginError;
        }
      }
      
      throw error;
    }
  }

  // Kiểm tra xem có đang đăng nhập không
  isLoggedIn(): boolean {
    try {
      const accounts = this.msalInstance.getAllAccounts();
      return accounts.length > 0;
    } catch (error) {
      return false;
    }
  }

  // Logout
  async logout() {
    try {
      await this.ensureInitialized();
      
      const accounts = this.msalInstance.getAllAccounts();
      if (accounts.length > 0) {
        await this.msalInstance.logoutPopup({
          account: accounts[0]
        });
      }
      
      this.graphClient = null;
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }
}

export default new OneDriveService(); 