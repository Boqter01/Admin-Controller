export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";

export async function apiFetch(path: string, getToken: () => Promise<string | null>, options: RequestInit = {}) {
  const token = await getToken();

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error((error as any).message || `Request failed: ${res.status}`);
  }

  return res.json();
}

export async function logActivity(
  getToken: () => Promise<string | null>,
  payload: {
    action: string;
    entity?: string;
    details?: {
      route?: string;
      endpoint?: string;
      statusCode?: number;
      productName?: string;
    };
  }
) {
  try {
    const token = await getToken();
    await fetch(`${API_URL}/activity-logs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    console.error("Failed to log activity:", e);
  }
}