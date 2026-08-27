import { createContext, useContext, useEffect, type ReactNode } from "react";
import { useAuth } from "../hooks/useAuth";
import { useProfileContext } from "./ProfileContext";
import type { StudentProfile } from "../api/authApi";

interface User {
  id: string;
  email: string;
  firstName: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasProfile: boolean;
  setUser: (user: User | null, hasProfile?: boolean, profile?: StudentProfile | null) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const { setProfileFromAuth } = useProfileContext();

  // Register profile setter with useAuth hook
  useEffect(() => {
    auth.registerProfileSetter(setProfileFromAuth);
  }, [auth.registerProfileSetter, setProfileFromAuth]);

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
