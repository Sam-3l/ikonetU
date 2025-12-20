import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient, getQueryFn } from "@/lib/queryClient";

interface User {
  id: string;
  email: string;
  name: string;
  role: "founder" | "investor" | "admin";
  avatar_url?: string;
  onboarding_complete: boolean;
  created_at: string;
}

interface FounderProfile {
  id: string;
  user: string;
  company_name: string;
  location?: string;
  bio?: string;
  sector?: string;
  stage?: string;
  funding_goal?: string;
  website?: string;
  linkedin?: string;
}

interface InvestorProfile {
  id: string;
  user: string;
  firm_name?: string;
  title?: string;
  thesis?: string;
  sectors?: string[];
  stages?: string[];
  check_size?: string;
  support_types?: string[];
  linkedin?: string;
}

interface AuthUser extends Omit<User, "password"> {}

interface AuthContextType {
  user: AuthUser | null;
  profile: FounderProfile | InvestorProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; name: string; role: "founder" | "investor" }) => Promise<void>;
  logout: () => Promise<void>;
  refetch: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<FounderProfile | InvestorProfile | null>(null);

  const { data, isLoading, refetch } = useQuery<{ user: AuthUser; profile: FounderProfile | InvestorProfile | null }>({
    queryKey: ["/api/auth/me"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    staleTime: Infinity,
    enabled: !!localStorage.getItem('auth_token'), // Only fetch if token exists
  });

  useEffect(() => {
    if (data) {
      setUser(data.user);
      setProfile(data.profile);
    } else {
      setUser(null);
      setProfile(null);
    }
  }, [data]);

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const res = await apiRequest("POST", "/api/auth/login", { email, password });
      const data = await res.json();
      
      console.log('Login response:', data); // DEBUG
      
      // Store token in localStorage FIRST
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
        console.log('Token stored:', data.token); // DEBUG
      }
      
      return data;
    },
    onSuccess: (data) => {
      console.log('Login success, refetching...'); // DEBUG
      setUser(data.user);
      // Force refetch /me with the new token
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      refetch();
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: { email: string; password: string; name: string; role: "founder" | "investor" }) => {
      const res = await apiRequest("POST", "/api/auth/register", data);
      const responseData = await res.json();
      
      // Store token in localStorage FIRST
      if (responseData.token) {
        localStorage.setItem('auth_token', responseData.token);
      }
      
      return responseData;
    },
    onSuccess: (data) => {
      setUser(data.user);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      refetch();
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      // Clear token from localStorage
      localStorage.removeItem('auth_token');
      setUser(null);
      setProfile(null);
      queryClient.clear();
    },
  });

  const login = async (email: string, password: string) => {
    await loginMutation.mutateAsync({ email, password });
  };

  const register = async (data: { email: string; password: string; name: string; role: "founder" | "investor" }) => {
    await registerMutation.mutateAsync(data);
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refetch,
      }}
    >
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