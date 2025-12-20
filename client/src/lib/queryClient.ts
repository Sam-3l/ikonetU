import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { API_BASE_URL } from "@/config/api";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown,
): Promise<Response> {
  const token = localStorage.getItem('auth_token'); // GET TOKEN
  
  const res = await fetch(`${API_BASE_URL}${url}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token && { "Authorization": `Bearer ${token}` }), // ADD TOKEN TO HEADERS
    },
    body: data ? JSON.stringify(data) : undefined,
    // REMOVED credentials: "include" - not needed for tokens
  });
  
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
  
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";

export const getQueryFn =
  <T>({ on401 }: { on401: UnauthorizedBehavior }): QueryFunction<T> =>
  async ({ queryKey }) => {
    const token = localStorage.getItem('auth_token'); // GET TOKEN
    
    // Normalize base URL (remove trailing slashes)
    const base = API_BASE_URL.replace(/\/+$/, "");
    // Normalize path (remove leading slashes)
    const path = queryKey.join("/").replace(/^\/+/, "");
    const url = base ? `${base}/${path}` : `/${path}`;
    
    const res = await fetch(url, {
      // REMOVED credentials: "include"
      headers: {
        "Content-Type": "application/json",
        ...(token && { "Authorization": `Bearer ${token}` }), // ADD TOKEN TO HEADERS
      },
    });
    
    if (on401 === "returnNull" && res.status === 401) {
      return null;
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
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});