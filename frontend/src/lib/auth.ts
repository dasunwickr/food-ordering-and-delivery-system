import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || "http://localhost:5000/api";

export async function verifyResetToken(token: string) {
  try {
    const response = await axios.get(`${API_URL}/auth/verify-reset-token/${token}`);
    return { valid: true, data: response.data };
  } catch (error) {
    console.error("Error verifying reset token:", error);
    return { valid: false, error };
  }
}

export async function resetPassword(token: string, newPassword: string) {
  const response = await axios.post(`${API_URL}/auth/reset-password`, {
    token,
    newPassword,
  });
  return response.data;
}