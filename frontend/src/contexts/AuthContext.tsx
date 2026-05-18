import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { apiPost } from "@/lib/api";
import type { AuthUser, LoginResponse, PermissionsMap } from "@/domain/permissions";
import { DEFAULT_PERMISSIONS } from "@/domain/permissions";

const AUTH_TOKEN_KEY = "auth_token";
const AUTH_USER_KEY = "auth_user";

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (usuario: string, contrasena: string) => Promise<void>;
  logout: () => void;
  hasPermission: (permisoId: string) => boolean;
  permissions: PermissionsMap;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const stored = localStorage.getItem(AUTH_USER_KEY);
    if (token && stored) {
      try {
        const user = JSON.parse(stored) as AuthUser;
        return { user, token, isAuthenticated: true, isLoading: false };
      } catch {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(AUTH_USER_KEY);
      }
    }
    return { user: null, token: null, isAuthenticated: false, isLoading: false };
  });

  const login = useCallback(async (usuario: string, contrasena: string) => {
    setState((s) => ({ ...s, isLoading: true }));
    try {
      const data = await apiPost<LoginResponse, { usuario: string; contrasena: string }>(
        "/api/v1/auth/login",
        { usuario, contrasena },
      );

      localStorage.setItem(AUTH_TOKEN_KEY, data.token);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.usuario));

      setState({
        user: data.usuario,
        token: data.token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
  }, []);

  const hasPermission = useCallback(
    (permisoId: string) => {
      return state.user?.permissions?.[permisoId] === true;
    },
    [state.user],
  );

  const permissions = useMemo(() => {
    return state.user?.permissions ?? DEFAULT_PERMISSIONS;
  }, [state.user]);

  useEffect(() => {
    if (!state.token) return;
    const stored = localStorage.getItem(AUTH_USER_KEY);
    if (!stored && state.user) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(state.user));
    }
  }, [state.token, state.user]);

  const value = useMemo<AuthContextValue>(
    () => ({ ...state, login, logout, hasPermission, permissions }),
    [state, login, logout, hasPermission, permissions],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  }
  return ctx;
}

export function usePermission(permisoId: string): boolean {
  const { hasPermission } = useAuth();
  return hasPermission(permisoId);
}

export function usePermissions(): PermissionsMap {
  const { permissions } = useAuth();
  return permissions;
}
