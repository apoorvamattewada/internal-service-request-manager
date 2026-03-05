import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { authApi } from '../api/authApi';
import { AuthState, User } from '../types';

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_FAILURE' }
  | { type: 'LOGOUT' };

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('isrm_token'),
  isAuthenticated: false,
  isLoading: true,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, isLoading: true };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'AUTH_FAILURE':
      return { ...state, isLoading: false };
    case 'LOGOUT':
      return { user: null, token: null, isAuthenticated: false, isLoading: false };
    default:
      return state;
  }
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Verify stored token on mount
  useEffect(() => {
    const token = localStorage.getItem('isrm_token');
    if (!token) {
      dispatch({ type: 'AUTH_FAILURE' });
      return;
    }

    authApi
      .getMe()
      .then((user) => {
        dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } });
      })
      .catch(() => {
        localStorage.removeItem('isrm_token');
        localStorage.removeItem('isrm_user');
        dispatch({ type: 'AUTH_FAILURE' });
      });
  }, []);

  // Listen for global auth:logout events (from axios interceptor)
  useEffect(() => {
    const handleLogout = (): void => logout();
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  });

  const login = useCallback(async (email: string, password: string): Promise<void> => {
    dispatch({ type: 'AUTH_START' });
    const { user, token } = await authApi.login({ email, password });
    localStorage.setItem('isrm_token', token);
    dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } });
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string): Promise<void> => {
      dispatch({ type: 'AUTH_START' });
      const { user, token } = await authApi.register({ name, email, password });
      localStorage.setItem('isrm_token', token);
      dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } });
    },
    []
  );

  const logout = useCallback((): void => {
    localStorage.removeItem('isrm_token');
    localStorage.removeItem('isrm_user');
    dispatch({ type: 'LOGOUT' });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
