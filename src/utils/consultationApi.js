import { apiRequest } from "./api";

export async function fetchMyConsultations(token) {
  const data = await apiRequest("/consultations/my", { token });
  return data.consultations ?? [];
}

export const cancelConsultation = (token, id) =>
  apiRequest(`/consultations/${id}/cancel`, { method: "PATCH", token });