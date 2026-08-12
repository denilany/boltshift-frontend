import type {
  AuthFieldErrors,
  AuthGender,
  AuthSession,
  AuthUser,
  NormalizedAuthError,
} from "@/lib/auth/types";
import {
  getStoredRefreshToken,
  readStoredSession,
  writeStoredSession,
} from "@/lib/auth/storage";

const AUTH_BASE_URL =
  process.env.NEXT_PUBLIC_AUTH_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "";

const AUTH_PREFIX = "/api/v1/auth";

export type SocialAuthProvider = "google" | "apple" | "facebook";

function buildAuthUrl(path: string) {
  if (!AUTH_BASE_URL) {
    return `${AUTH_PREFIX}${path}`;
  }

  return `${AUTH_BASE_URL.replace(/\/$/, "")}${AUTH_PREFIX}${path}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function toArray(value: unknown): string[] {
  if (typeof value === "string") {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) =>
      typeof item === "string" ? [item] : toArray(item),
    );
  }

  if (isRecord(value) && typeof value.message === "string") {
    return [value.message];
  }

  return [];
}

function normalizeFieldName(fieldName: string) {
  const aliases: Record<string, string> = {
    first_name: "firstName",
    last_name: "lastName",
    phone_number: "phoneNumber",
    date_of_birth: "dateOfBirth",
    confirm_password: "confirmPassword",
    password2: "confirmPassword",
    retype_password: "confirmPassword",
    terms_agreement: "termsAgreement",
    email_or_phone: "email",
    username: "email",
  };

  return aliases[fieldName] ?? fieldName;
}

function normalizeFieldErrors(value: unknown): AuthFieldErrors | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const fieldErrors: AuthFieldErrors = {};

  for (const [key, errorValue] of Object.entries(value)) {
    if (["detail", "message", "non_field_errors", "error"].includes(key)) {
      continue;
    }

    const messages = toArray(errorValue);

    if (messages.length > 0) {
      fieldErrors[normalizeFieldName(key)] = messages;
    }
  }

  return Object.keys(fieldErrors).length ? fieldErrors : undefined;
}

function normalizeUser(user: unknown): AuthUser | null {
  if (!isRecord(user)) {
    return null;
  }

  const firstName = user.firstName ?? user.first_name;
  const lastName = user.lastName ?? user.last_name;
  const email = user.email;
  const phoneNumber = user.phoneNumber ?? user.phone_number ?? user.phone;
  const dateOfBirth = user.dateOfBirth ?? user.date_of_birth;
  const gender = user.gender as AuthGender | "" | undefined;

  return {
    id: user.id as string | number | undefined,
    firstName: typeof firstName === "string" ? firstName : undefined,
    lastName: typeof lastName === "string" ? lastName : undefined,
    email: typeof email === "string" ? email : undefined,
    phoneNumber: typeof phoneNumber === "string" ? phoneNumber : undefined,
    dateOfBirth: typeof dateOfBirth === "string" ? dateOfBirth : undefined,
    gender:
      gender === "male" || gender === "female" || gender === "other"
        ? gender
        : "",
    isEmailVerified:
      typeof user.isEmailVerified === "boolean"
        ? user.isEmailVerified
        : typeof user.is_email_verified === "boolean"
          ? user.is_email_verified
          : undefined,
    fullName:
      typeof user.fullName === "string"
        ? user.fullName
        : typeof user.full_name === "string"
          ? user.full_name
          : [firstName, lastName].filter(Boolean).join(" ") || undefined,
  };
}

function readString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function extractSession(payload: unknown, fallbackUser?: AuthUser | null): AuthSession | null {
  if (!isRecord(payload)) {
    return null;
  }

  const tokens = isRecord(payload.tokens) ? payload.tokens : payload;
  const accessToken =
    readString(tokens.access) ||
    readString(tokens.access_token) ||
    readString(payload.token) ||
    readString(payload.access) ||
    readString(payload.access_token);

  const refreshToken =
    readString(tokens.refresh) ||
    readString(tokens.refresh_token) ||
    readString(payload.refresh) ||
    readString(payload.refresh_token);

  const payloadData = isRecord(payload.data) ? payload.data : null;

  const user = normalizeUser(
    payload.user ??
      payload.profile ??
      payload.account ??
      (payloadData ? payloadData.user : null) ??
      (payloadData ? payloadData.profile : null) ??
      fallbackUser ??
      null,
  );

  if (!accessToken || !refreshToken) {
    return null;
  }

  return {
    accessToken,
    refreshToken,
    user,
  };
}

async function readResponseJson(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    return null;
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}

function normalizeApiError(
  response: Response,
  payload: unknown,
  fallbackMessage: string,
): NormalizedAuthError {
  if (isRecord(payload)) {
    const fieldErrors = normalizeFieldErrors(payload);
    const detail =
      readString(payload.detail) ||
      readString(payload.message) ||
      readString(payload.error) ||
      readString(payload.non_field_errors);

    return {
      message:
        detail ??
        (fieldErrors ? "Please fix the highlighted fields." : fallbackMessage),
      status: response.status,
      fieldErrors,
    };
  }

  return {
    message: fallbackMessage,
    status: response.status,
  };
}

function toAuthError(
  error: unknown,
  fallbackMessage: string,
): NormalizedAuthError {
  if (error instanceof AuthApiError) {
    return error.payload;
  }

  if (error instanceof Error) {
    return {
      message: error.message,
    };
  }

  return {
    message: fallbackMessage,
  };
}

export class AuthApiError extends Error {
  payload: NormalizedAuthError;

  constructor(payload: NormalizedAuthError) {
    super(payload.message);
    this.name = "AuthApiError";
    this.payload = payload;
  }
}

async function refreshAccessToken() {
  const refreshToken = getStoredRefreshToken();

  if (!refreshToken) {
    return null;
  }

  const response = await fetch(buildAuthUrl("/token/refresh/"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh: refreshToken }),
  });

  const payload = await readResponseJson(response);

  if (!response.ok) {
    const error = normalizeApiError(
      response,
      payload,
      "Your session has expired. Please sign in again.",
    );
    writeStoredSession(null);
    throw new AuthApiError(error);
  }

  const session = extractSession(payload, readStoredSession()?.user ?? null);

  if (!session) {
    const error = {
      message: "Unexpected refresh response from the server.",
      status: response.status,
    };
    writeStoredSession(null);
    throw new AuthApiError(error);
  }

  writeStoredSession(session);
  return session;
}

type AuthRequestOptions = {
  retryOnUnauthorized?: boolean;
};

async function authJsonRequest<T>(
  path: string,
  init: RequestInit = {},
  options: AuthRequestOptions = {},
): Promise<T> {
  const session = readStoredSession();
  const headers = new Headers(init.headers);

  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }

  if (session?.accessToken) {
    headers.set("Authorization", `Bearer ${session.accessToken}`);
  }

  const response = await fetch(buildAuthUrl(path), {
    ...init,
    headers,
  });

  const payload = await readResponseJson(response);

  if (response.ok) {
    return payload as T;
  }

  if (response.status === 401 && options.retryOnUnauthorized !== false) {
    try {
      const refreshedSession = await refreshAccessToken();

      if (refreshedSession?.accessToken) {
        const retryHeaders = new Headers(init.headers);

        if (!retryHeaders.has("Content-Type") && init.body) {
          retryHeaders.set("Content-Type", "application/json");
        }

        retryHeaders.set(
          "Authorization",
          `Bearer ${refreshedSession.accessToken}`,
        );

        const retryResponse = await fetch(buildAuthUrl(path), {
          ...init,
          headers: retryHeaders,
        });

        const retryPayload = await readResponseJson(retryResponse);

        if (retryResponse.ok) {
          return retryPayload as T;
        }

        throw new AuthApiError(
          normalizeApiError(
            retryResponse,
            retryPayload,
            "We couldn't complete the request.",
          ),
        );
      }
    } catch (error) {
      throw new AuthApiError(
        toAuthError(error, "Your session expired. Please sign in again."),
      );
    }
  }

  throw new AuthApiError(
    normalizeApiError(response, payload, "We couldn't complete the request."),
  );
}

export type RegisterInput = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
};

export async function registerAccount(input: RegisterInput) {
  const payload = await authJsonRequest<unknown>("/register/", {
    method: "POST",
    body: JSON.stringify({
      email: input.email,
      first_name: input.firstName,
      last_name: input.lastName,
      phone: input.phoneNumber,
      password: input.password,
      confirm_password: input.password,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  }, { retryOnUnauthorized: false });

  const session = extractSession(payload);

  if (!session) {
    throw new AuthApiError({
      message: "Unexpected registration response from the server.",
    });
  }

  writeStoredSession(session);
  return session;
}

export type LoginInput = {
  email: string;
  password: string;
};

export async function loginAccount(input: LoginInput) {
  const payload = await authJsonRequest<unknown>("/login/", {
    method: "POST",
    body: JSON.stringify({
      email: input.email,
      password: input.password,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  }, { retryOnUnauthorized: false });

  const session = extractSession(payload);

  if (!session) {
    throw new AuthApiError({
      message: "Unexpected login response from the server.",
    });
  }

  writeStoredSession(session);
  return session;
}

export async function logoutAccount() {
  const session = readStoredSession();

  try {
    if (session?.refreshToken) {
      await authJsonRequest(
        "/logout/",
        {
          method: "POST",
          body: JSON.stringify({ refresh: session.refreshToken }),
          headers: {
            "Content-Type": "application/json",
          },
        },
        { retryOnUnauthorized: false },
      );
    }
  } finally {
    writeStoredSession(null);
  }
}

export async function getCurrentUser() {
  const payload = await authJsonRequest<unknown>("/profile/", {
    method: "GET",
  }, { retryOnUnauthorized: true });

  return normalizeUser(
    isRecord(payload) ? payload.user ?? payload.profile ?? payload : payload,
  );
}

export type UpdateProfileInput = Partial<{
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: AuthGender | "";
}>;

export async function updateProfile(input: UpdateProfileInput) {
  const payload = await authJsonRequest<unknown>("/profile/", {
    method: "PATCH",
    body: JSON.stringify({
      first_name: input.firstName,
      last_name: input.lastName,
      email: input.email,
      phone_number: input.phoneNumber,
      date_of_birth: input.dateOfBirth || undefined,
      gender: input.gender || undefined,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  }, { retryOnUnauthorized: true });

  const user = normalizeUser(
    isRecord(payload) ? payload.user ?? payload.profile ?? payload : payload,
  );

  if (!user) {
    throw new AuthApiError({
      message: "Unexpected profile response from the server.",
    });
  }

  const session = readStoredSession();

  if (session) {
    writeStoredSession({
      ...session,
      user,
    });
  }

  return user;
}

export async function requestPasswordReset(email: string) {
  return authJsonRequest("/password/reset/", {
    method: "POST",
    body: JSON.stringify({ email }),
    headers: {
      "Content-Type": "application/json",
    },
  }, { retryOnUnauthorized: false });
}

export type PasswordResetConfirmationInput = {
  uid?: string;
  token?: string;
  password: string;
  confirmPassword: string;
};

export async function confirmPasswordReset(
  input: PasswordResetConfirmationInput,
) {
  return authJsonRequest("/password/reset/confirm/", {
    method: "POST",
    body: JSON.stringify({
      uid: input.uid,
      token: input.token,
      new_password: input.password,
      re_new_password: input.confirmPassword,
      password: input.password,
      confirm_password: input.confirmPassword,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  }, { retryOnUnauthorized: false });
}

export function getSocialAuthUrl(provider: SocialAuthProvider) {
  const envMap: Record<SocialAuthProvider, string | undefined> = {
    google:
      process.env.NEXT_PUBLIC_AUTH_GOOGLE_URL ??
      process.env.NEXT_PUBLIC_GOOGLE_AUTH_URL,
    apple:
      process.env.NEXT_PUBLIC_AUTH_APPLE_URL ??
      process.env.NEXT_PUBLIC_APPLE_AUTH_URL,
    facebook:
      process.env.NEXT_PUBLIC_AUTH_FACEBOOK_URL ??
      process.env.NEXT_PUBLIC_FACEBOOK_AUTH_URL,
  };

  return envMap[provider] ?? null;
}

export async function startSocialAuth(provider: SocialAuthProvider) {
  const url = getSocialAuthUrl(provider);

  if (!url) {
    throw new AuthApiError({
      message: `${provider[0].toUpperCase()}${provider.slice(1)} sign-in is not configured yet.`,
    });
  }

  window.location.assign(url);
}

export function handleAuthError(error: unknown): NormalizedAuthError {
  return toAuthError(error, "Something went wrong. Please try again.");
}
