import { createContext, useContext, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getMe, login, register, User, LoginInput, RegisterInput, getGetMeQueryKey } from "@workspace/api-client-react";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (data: LoginInput) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("mq_token");
      if (token) {
        try {
          const userData = await getMe();
          setUser(userData);
        } catch (error) {
          localStorage.removeItem("mq_token");
          setUser(null);
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const handleLogin = async (data: LoginInput) => {
    const res = await login(data);
    localStorage.setItem("mq_token", res.token);
    setUser(res.user);
    queryClient.invalidateQueries();
  };

  const handleRegister = async (data: RegisterInput) => {
    const res = await register(data);
    localStorage.setItem("mq_token", res.token);
    setUser(res.user);
    queryClient.invalidateQueries();
  };

  const handleLogout = () => {
    localStorage.removeItem("mq_token");
    setUser(null);
    queryClient.clear();
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login: handleLogin, register: handleRegister, logout: handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
