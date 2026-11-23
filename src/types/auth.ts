export interface AuthUser {
  createdAt: string;
  email: string;
  id: string;
  isAdmin: boolean;
  name: string;
  onboardingCompleted: boolean;
}

export interface AuthSession {
  accessToken: string;
  accessTokenExpiresIn: number;
  refreshToken: string;
  refreshTokenExpiresIn: number;
  user: AuthUser;
}

export interface ApiErrorResponse {
  code?: string;
  message: string;
}

export interface AuthUserResponse {
  user: AuthUser;
}
