import { apiRequest } from "./api";

export async function fetchMyConsultations(token) {
  const data = await apiRequest("/consultations/my", { token });
  return data.consultations ?? [];
}

export const createConsultation = (token, body) =>
  apiRequest("/consultation", { method: "POST", token, body });

export const cancelConsultation = (token, id) =>
  apiRequest(`/consultation/${id}/cancel`, { method: "PATCH", token });