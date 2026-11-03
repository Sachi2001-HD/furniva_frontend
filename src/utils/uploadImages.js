const API_URL = import.meta.env.VITE_API_URL;

const MAX_FILES = 5; 
const MAX_MB = 5; 

export async function uploadImages(files, token) {
  const list = Array.from(files);
  if (list.length === 0) return [];

  if (list.length > MAX_FILES) {
    throw new Error(`You can upload up to ${MAX_FILES} images at a time.`);
  }
  for (const file of list) {
    if (!file.type.startsWith("image/")) {
      throw new Error(`${file.name} is not an image.`);
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      throw new Error(`${file.name} is larger than ${MAX_MB} MB.`);
    }
  }

  const formData = new FormData();
  list.forEach((file) => formData.append("images", file));

  let res;
  try {
    res = await fetch(`${API_URL}/upload/images`, {
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

  return data.urls ?? [];
}