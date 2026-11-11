import { apiRequest } from "./api";

export const createCustomRequest = (token, body) =>
  apiRequest("/custom-requests", { method: "POST", token, body });

export async function fetchMyCustomRequests(token) {
  const data = await apiRequest("/custom-requests/my", { token });
  return data.requests ?? [];
}

export const cancelCustomRequest = (token, id) =>
  apiRequest(`/custom-requests/${id}/cancel`, { method: "PATCH", token });

export const acceptCustomQuote = (token, id) =>
  apiRequest(`/custom-requests/${id}/accept`, { method: "PATCH", token });