const API_URL = import.meta.env.VITE_API_URL;

export async function apiRequest(path, { method = "GET", token, body } = {}) {
  let res;

  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Cannot reach the server. Please try again.");
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const error = new Error(
      data.message || "Something went wrong. Please try again."
    );
    error.status = res.status;
    throw error;
  }

  return data;
}