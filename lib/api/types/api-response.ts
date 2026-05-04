/**
 * Mirrors Vetra-be.API.Common.ApiResponse<T> (System.Text.Json camelCase).
 */
export type ApiResponse<T> = {
  message: string;
  data?: T;
  errors?: Record<string, string[]> | null;
  errorCode?: string | null;
  timestamp?: string;
};
