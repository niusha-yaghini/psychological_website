import { apiRequest } from "./api";

export async function getLandingData() {
  const response = await apiRequest("/landing");

  return response.data;
}
