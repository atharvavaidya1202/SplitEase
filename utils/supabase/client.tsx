import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { projectId, publicAnonKey } from "./info";

const supabaseUrl = `https://${projectId}.supabase.co`;

// Singleton instance to prevent multiple GoTrueClient instances
let supabaseInstance: ReturnType<typeof createSupabaseClient> | null = null;

export const createClient = () => {
  if (!supabaseInstance) {
    supabaseInstance = createSupabaseClient(supabaseUrl, publicAnonKey);
  }
  return supabaseInstance;
};

// Export a singleton instance for direct use
export const supabase = createClient();

export const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-9367668c`;

// Helper function to make authenticated API calls
export async function apiCall(
  endpoint: string,
  options: RequestInit = {},
  accessToken?: string
) {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  } else {
    headers["Authorization"] = `Bearer ${publicAnonKey}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}
