import crypto from 'crypto';

// Tạo license key duy nhất
export const generateLicenseKey = (): string => {
  // Tạo key 32 ký tự với format: XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX
  const segments = [];
  for (let i = 0; i < 8; i++) {
    segments.push(crypto.randomBytes(2).toString('hex').toUpperCase());
  }
  return segments.join('-');
};

// Tạo machine ID từ thông tin hệ thống
export const generateMachineId = (): string => {
  // Trong thực tế, bạn có thể sử dụng thông tin phần cứng
  // Ví dụ: CPU ID, Motherboard Serial, MAC Address, etc.
  // Ở đây tôi tạo một ID giả lập
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2);
  return `MACHINE-${timestamp}-${random}`.toUpperCase();
};

// Validate license key format
export const validateLicenseKey = (licenseKey: string): boolean => {
  const pattern = /^[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}$/;
  return pattern.test(licenseKey);
};

// Tính số ngày còn lại của license
export const calculateRemainingDays = (endDate: Date): number => {
  const now = new Date();
  const end = new Date(endDate);
  const diffTime = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};

// Kiểm tra license có sắp hết hạn không (trong 30 ngày)
export const isLicenseExpiringSoon = (endDate: Date, daysThreshold: number = 30): boolean => {
  const remainingDays = calculateRemainingDays(endDate);
  return remainingDays <= daysThreshold && remainingDays > 0;
};

// Format license status cho hiển thị
export const formatLicenseStatus = (status: string): { text: string; color: string } => {
  switch (status) {
    case 'ACTIVE':
      return { text: 'Đang hoạt động', color: 'green' };
    case 'EXPIRED':
      return { text: 'Đã hết hạn', color: 'red' };
    case 'SUSPENDED':
      return { text: 'Tạm ngưng', color: 'orange' };
    case 'REVOKED':
      return { text: 'Đã thu hồi', color: 'red' };
    default:
      return { text: 'Không xác định', color: 'default' };
  }
};

// Tạo QR code data cho license
export const generateLicenseQRData = (licenseKey: string, machineId: string): string => {
  const data = {
    licenseKey,
    machineId,
    timestamp: Date.now()
  };
  return JSON.stringify(data);
};

// Validate machine ID format
export const validateMachineId = (machineId: string): boolean => {
  // Kiểm tra format cơ bản
  return machineId.length >= 10 && /^[A-Z0-9-]+$/.test(machineId);
};

// Tạo license report data
export const generateLicenseReportData = (licenses: any[]) => {
  return licenses.map(license => ({
    'License Key': license.licenseKey,
    'Machine ID': license.machineId,
    'User Name': license.userName,
    'User Phone': license.userPhone || '',
    'User Email': license.userEmail || '',
    'Usage Days': license.usageDays,
    'Status': formatLicenseStatus(license.status).text,
    'Start Date': new Date(license.startDate).toLocaleDateString('vi-VN'),
    'End Date': new Date(license.endDate).toLocaleDateString('vi-VN'),
    'Last Used': license.lastUsed ? new Date(license.lastUsed).toLocaleDateString('vi-VN') : 'Chưa sử dụng',
    'Created By': license.createdBy?.name || '',
    'Created Date': new Date(license.createdAt).toLocaleDateString('vi-VN')
  }));
};
