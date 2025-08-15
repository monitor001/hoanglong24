import { useSelector } from 'react-redux';
import { RootState } from '../store';

/**
 * Hook để lấy token từ Redux store thay vì localStorage
 */
export const useAuthToken = () => {
  const { token } = useSelector((state: RootState) => state.auth);
  
  return {
    token,
    hasToken: !!token,
    getAuthHeader: () => token ? `Bearer ${token}` : null
  };
};
