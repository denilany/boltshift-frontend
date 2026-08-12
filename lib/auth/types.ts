export type AuthGender = "male" | "female" | "other";

export type AuthUser = {
  id?: string | number;
  firstName?: string;
  lastName?: string;
  email?: string;
  avatar?: string;
  phone?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: AuthGender | "";
  isEmailVerified?: boolean;
  isVendor?: boolean;
  isCustomer?: boolean;
  fullName?: string;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type AuthSession = AuthTokens & {
  user?: AuthUser | null;
};

export type AuthFieldErrors = Record<string, string[]>;

export type NormalizedAuthError = {
  message: string;
  status?: number;
  fieldErrors?: AuthFieldErrors;
};
