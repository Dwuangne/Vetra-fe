import { apiPost } from "../client";
import { API_ENDPOINTS } from "../endpoints";
import { ApiHttpError } from "../errors";
import type { ApiResponse } from "../types/api-response";
import type {
  AuthenticationResultDto,
  ChangeOwnPasswordRequestBody,
  LoginRequestBody,
} from "../types/auth";

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

/**
 * POST /api/auths/change-password — authenticated; requires correct current password.
 */
export function changeOwnPassword(
  body: ChangeOwnPasswordRequestBody
): Promise<ApiResponse<null>> {
  return apiPost<null>(API_ENDPOINTS.auth.changePassword, body);
}
