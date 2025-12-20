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
  const res = await fetch(`${API_BASE_URL}${url}`, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include", // This ensures cookies are sent
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
    // Normalize base URL (remove trailing slashes)
    const base = API_BASE_URL.replace(/\/+$/, "");
    // Normalize path (remove leading slashes)
    const path = queryKey.join("/").replace(/^\/+/, "");
    const url = base ? `${base}/${path}` : `/${path}`;
    
    const res = await fetch(url, {
      credentials: "include", // This ensures cookies are sent with queries
      headers: {
        "Content-Type": "application/json",
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
