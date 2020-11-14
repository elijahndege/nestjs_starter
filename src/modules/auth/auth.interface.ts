import { Request as NestRequest } from '@nestjs/common';
import { MfaMethod } from '@prisma/client';
import { Request as ExpressRequest } from 'express';

export interface AccessTokenClaims {
  sub: string;
  id: number;
  scopes: string[];
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface TotpTokenResponse {
  totpToken: string;
  type: MfaMethod;
  multiFactorRequired: true;
}

export interface AccessTokenParsed {
  id: number;
  scopes: string[];
  type: 'user' | 'api-key';
}

export interface MfaTokenPayload {
  id: number;
  type: MfaMethod;
}

type CombinedRequest = ExpressRequest & typeof NestRequest;
export interface UserRequest extends CombinedRequest {
  user: AccessTokenParsed;
}
