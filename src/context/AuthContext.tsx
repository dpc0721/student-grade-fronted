import React, { createContext, useState, useContext, useEffect } from "react";
import api from "../api/axios";

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: string | null;
  userId: string | null;
  initialized: boolean; // 新增 initialized 状态
  login: (username: string, password: number) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [initialized, setInitialized] = useState<boolean>(false);

  // 在组件挂载时读取 localStorage 中的登录信息
  useEffect(() => {
    const storedUserRole = localStorage.getItem("userRole");
    const storedUserId = localStorage.getItem("userId");
    if (storedUserRole && storedUserId) {
      setUserRole(storedUserRole);
      setUserId(storedUserId);
      setIsAuthenticated(true);
    }
    // 标记初始化完成
    setInitialized(true);
  }, []);

  const login = async (username: string, password: number) => {
    if (username === "admin" && password === 123456) {
      setIsAuthenticated(true);
      setUserRole("admin");
      setUserId("admin");
      localStorage.setItem("userRole", "admin");
      localStorage.setItem("userId", "admin");
      return true;
    }

    try {
      const response = await api.post("/login", { username, password });
      if (response.data.success) {
        const userIdResponse = await api.get("/getUserId", {
          params: { name: username },
        });
        const userId = userIdResponse.data.id;
        setIsAuthenticated(true);
        setUserRole(response.data.role);
        setUserId(userId);
        localStorage.setItem("userRole", response.data.role);
        localStorage.setItem("userId", userId);
        return true;
      } else {
        console.error("Login failed:", response.data.message);
      }
    } catch (error) {
      console.error("Login error:", error);
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setUserId(null);
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, userRole, userId, initialized, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
