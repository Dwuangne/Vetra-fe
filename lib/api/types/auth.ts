/** Request body for POST .../Authentication/login */

export type LoginRequestBody = {

  username: string;

  password: string;

};



/** Mirrors Vetra_be.Service.Models.AuthenticatedUser */

export type AuthenticatedUserDto = {

  userId: string;

  tenantId?: string;

  tenantName: string;

  username: string;

  roles: string[];

};



/** Mirrors Vetra_be.Service.Models.TokenPair (JSON camelCase expiresAtUtc) */

export type TokenPairDto = {

  accessToken: string;

  expiresAtUtc: string;

};



/** Mirrors Vetra_be.Service.Models.AuthenticationResult */

export type AuthenticationResultDto = {

  user: AuthenticatedUserDto;

  tokens: TokenPairDto;

};

