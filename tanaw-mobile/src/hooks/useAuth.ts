import { useAppSelector, useAppDispatch } from '../store';
import { loginThunk, logoutThunk, clearError } from '../store/slices/authSlice';

export function useAuth() {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((s) => s.auth);

  return {
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    isCheckingAuth: auth.isCheckingAuth,
    error: auth.error,
    login: (identifier: string, password: string) =>
      dispatch(loginThunk({ identifier, password })),
    logout: () => dispatch(logoutThunk()),
    clearError: () => dispatch(clearError()),
  };
}
