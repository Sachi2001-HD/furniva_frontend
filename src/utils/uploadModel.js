const API_URL = import.meta.env.VITE_API_URL;
const MAX_MB = 10; // matches the backend limit

export async function uploadModel(file, token) {
  if (!/\.glb$/i.test(file.name)) {
    throw new Error("Please choose a .glb file.");
  }
  if (file.size > MAX_MB * 1024 * 1024) {
    throw new Error(`${file.name} is larger than ${MAX_MB} MB.`);
  }

  const formData = new FormData();
  formData.append("model", file);

  let res;
  try {
    res = await fetch(`${API_URL}/upload/model`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
  } catch {
    throw new Error("Cannot reach the server. Please try again.");
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message =
      res.status === 401 || res.status === 403
        ? "Your session has expired or you don't have access. Please log in again."
        : data.message || "Upload failed. Please try again.";
    const error = new Error(message);
    error.status = res.status;
    throw error;
  }

  return data.url;
}