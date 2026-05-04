import { apiPost } from "../client";
import { API_ENDPOINTS } from "../endpoints";
import { ApiHttpError } from "../errors";
import type { AuthenticationResultDto, LoginRequestBody } from "../types/auth";

export type LoginResult = {
  message: string;
  data: AuthenticationResultDto;
};

/**
 * POST /api/Authentication/login — matches Vetra-be AuthenticationController.
 */
export async function login(credentials: LoginRequestBody): Promise<LoginResult> {
  const envelope = await apiPost<AuthenticationResultDto>(
    API_ENDPOINTS.auth.login,
    credentials
  );

  if (envelope.data === undefined) {
    throw new ApiHttpError("Login response missing data", 500);
  }

  return { message: envelope.message, data: envelope.data };
}
