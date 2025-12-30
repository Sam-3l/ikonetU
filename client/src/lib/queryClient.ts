import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { API_BASE_URL } from "@/config/api";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    // Handle 401 - token expired/invalid
    if (res.status === 401) {
      localStorage.removeItem('auth_token');
      // Redirect to login page
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown,
): Promise<Response> {
  const token = localStorage.getItem('auth_token');
  
  if (!token && !url.includes('/login') && !url.includes('/register')) {
    throw new Error("Authentication required. Please log in.");
  }
  
  const res = await fetch(`${API_BASE_URL}${url}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token && { "Authorization": `Bearer ${token}` }),
    },
    body: data ? JSON.stringify(data) : undefined,
  });
  
  await throwIfResNotOk(res);
  
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";

export const getQueryFn =
  <T>({ on401 }: { on401: UnauthorizedBehavior }): QueryFunction<T> =>
  async ({ queryKey }) => {
    const token = localStorage.getItem('auth_token');
    
    // Normalize base URL (remove trailing slashes)
    const base = API_BASE_URL.replace(/\/+$/, "");
    // Normalize path (remove leading slashes)
    const path = queryKey.join("/").replace(/^\/+/, "");
    const url = base ? `${base}/${path}` : `/${path}`;
    
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(token && { "Authorization": `Bearer ${token}` }),
      },
    });
    
    if (on401 === "returnNull" && res.status === 401) {
      return null;
    }
    
    if (res.status === 401) {
      localStorage.removeItem('auth_token');
      // Redirect to login page
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
      throw new Error('Session expired. Please log in again.');
    }
    
    await throwIfResNotOk(res);
    return res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: (failureCount, error) => {
        // Don't retry on 401 errors
        if (error.message.includes('401')) {
          return false;
        }
        // Retry other errors up to 2 times
        return failureCount < 2;
      },
    },
    mutations: {
      retry: (failureCount, error) => {
        // Don't retry on 401 errors
        if (error.message.includes('401')) {
          return false;
        }
        // Don't retry other errors either for mutations
        return false;
      },
    },
  },
});