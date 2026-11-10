import { apiRequest } from "./api";

export const MAX_ADDRESSES = 10;

export async function fetchAddresses(token) {
  const data = await apiRequest("/addresses", { token });
  return data.addresses ?? [];
}

export const createAddress = (token, body) =>
  apiRequest("/addresses", { method: "POST", token, body });

export const updateAddress = (token, id, body) =>
  apiRequest(`/addresses/${id}`, { method: "PUT", token, body });

export const setDefaultAddress = (token, id) =>
  apiRequest(`/addresses/${id}/default`, { method: "PATCH", token });

export const deleteAddress = (token, id) =>
  apiRequest(`/addresses/${id}`, { method: "DELETE", token });