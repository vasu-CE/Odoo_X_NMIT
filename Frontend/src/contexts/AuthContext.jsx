import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        const storedUser = localStorage.getItem("manufacturing_user");
        const storedToken = localStorage.getItem("manufacturing_token");

        if (storedUser && storedToken) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        // Clear invalid data
        localStorage.removeItem("manufacturing_user");
        localStorage.removeItem("manufacturing_token");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (loginId, password) => {
    try {
      setLoading(true);

      // Simulate API call - replace with actual API endpoint
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ loginId, password }),
      });

      if (!response.ok) {
        // For demo purposes, simulate successful login with mock data
        if (loginId === "admin" && password === "admin123") {
          const mockUser = {
            id: 1,
            loginId: "admin",
            email: "admin@manufacturing.com",
            name: "Production Manager",
            role: "admin",
            avatar: null,
            createdAt: new Date().toISOString(),
          };

          const mockToken = "mock_jwt_token_" + Date.now();

          setUser(mockUser);
          setIsAuthenticated(true);
          localStorage.setItem("manufacturing_user", JSON.stringify(mockUser));
          localStorage.setItem("manufacturing_token", mockToken);

          return { success: true, user: mockUser };
        } else {
          throw new Error("Invalid credentials");
        }
      }

      const data = await response.json();

      setUser(data.user);
      setIsAuthenticated(true);
      localStorage.setItem("manufacturing_user", JSON.stringify(data.user));
      localStorage.setItem("manufacturing_token", data.token);

      return { success: true, user: data.user };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    try {
      setLoading(true);

      // Simulate API call - replace with actual API endpoint
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        // For demo purposes, simulate successful signup
        const mockUser = {
          id: Date.now(),
          loginId: userData.loginId,
          email: userData.email,
          name: userData.name,
          role: "user",
          avatar: null,
          createdAt: new Date().toISOString(),
        };

        const mockToken = "mock_jwt_token_" + Date.now();

        setUser(mockUser);
        setIsAuthenticated(true);
        localStorage.setItem("manufacturing_user", JSON.stringify(mockUser));
        localStorage.setItem("manufacturing_token", mockToken);

        return { success: true, user: mockUser };
      }

      const data = await response.json();

      setUser(data.user);
      setIsAuthenticated(true);
      localStorage.setItem("manufacturing_user", JSON.stringify(data.user));
      localStorage.setItem("manufacturing_token", data.token);

      return { success: true, user: data.user };
    } catch (error) {
      console.error("Signup error:", error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("manufacturing_user");
    localStorage.removeItem("manufacturing_token");
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("manufacturing_user", JSON.stringify(updatedUser));
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    signup,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
