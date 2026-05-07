/** Mirrors Vetra_be.Service.Models.TenantUserSummaryResult (System.Text.Json camelCase). */

export type TenantUserSummaryDto = {
  userId: string;
  username: string;
  role: string;
  isDisabled: boolean;
};

/** Mirrors Vetra_be.Service.Models.TenantUserResult (create user response). */

export type TenantUserResultDto = {
  userId: string;
  tenantId: string;
  tenantName: string;
  username: string;
  role: string;
};

/** Mirrors Vetra_be.API.Requests.CreateTenantUserRequest — role Supervisor | Operator. */

export type CreateTenantUserRequestBody = {
  username: string;
  password: string;
  role: string;
};

/** Mirrors Vetra_be.API.Requests.ResetTenantUserPasswordRequest */

export type ResetTenantUserPasswordRequestBody = {
  newPassword: string;
};
