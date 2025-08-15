import { message } from 'antd';

/**
 * Hiển thị thông báo quyền bị từ chối thống nhất
 * @param customMessage - Thông báo tùy chỉnh (tùy chọn)
 */
export const showPermissionDeniedMessage = (customMessage?: string) => {
  const defaultMessage = 'Bạn chưa được cấp quyền để thực hiện thao tác này!';
  message.error(customMessage || defaultMessage);
};

/**
 * Kiểm tra quyền và hiển thị thông báo nếu không có quyền
 * @param hasPermission - Kết quả kiểm tra quyền
 * @param customMessage - Thông báo tùy chỉnh (tùy chọn)
 * @returns true nếu có quyền, false nếu không có quyền
 */
export const checkPermissionAndShowMessage = (hasPermission: boolean, customMessage?: string): boolean => {
  if (!hasPermission) {
    showPermissionDeniedMessage(customMessage);
  }
  return hasPermission;
};
