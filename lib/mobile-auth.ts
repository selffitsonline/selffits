import crypto from "crypto";
import { SignJWT, jwtVerify } from "jose";
import { Role } from "@prisma/client";

export const MOBILE_JWT_ISSUER = "selffits-mobile-api";
export const MOBILE_JWT_AUDIENCE = "selffits-mobile-app";
export const MOBILE_TOKEN_TYPE = "mobile_access_token";
export const MOBILE_TOKEN_EXPIRATION = "30d"; // 30 Days matching website session duration
export const MOBILE_TOKEN_EXPIRATION_SECONDS = 30 * 24 * 60 * 60;

export interface MobileUserClaims {
  id: string;
  email: string;
  name: string;
  role: Role;
  isBlocked: boolean;
}

export interface MobileTokenPayload {
  sub: string;
  email: string;
  name: string;
  role: Role;
  isBlocked: boolean;
  token_type: string;
  iss: string;
  aud: string;
  iat?: number;
  exp?: number;
}

/**
 * Derives a cryptographically separated signing key for the mobile API.
 * 
 * Security Justification:
 * If MOBILE_JWT_SECRET is explicitly configured, it is used directly.
 * Otherwise, a distinct 256-bit key is derived from NEXTAUTH_SECRET using
 * HMAC-SHA256 with an explicit domain-separation context string.
 * This guarantees that mobile tokens and web session cookies are signed
 * with mathematically distinct keys, eliminating any token confusion risk
 * between web sessions and mobile bearer tokens.
 */
export function getMobileSigningKey(): Uint8Array {
  const envSecret = process.env.MOBILE_JWT_SECRET;
  if (envSecret && envSecret.trim().length >= 32) {
    return new TextEncoder().encode(envSecret.trim());
  }

  const baseSecret =
    process.env.NEXTAUTH_SECRET || "selffits-default-fallback-mobile-signing-key-32chars";

  const derived = crypto
    .createHmac("sha256", baseSecret)
    .update("selffits:mobile-api:v1:domain-separated-key")
    .digest();

  return new Uint8Array(derived);
}

/**
 * Issues a signed mobile access token with explicit issuer, audience, and type claims.
 */
export async function signMobileToken(user: MobileUserClaims): Promise<string> {
  const secret = getMobileSigningKey();

  return await new SignJWT({
    sub: user.id,
    email: user.email.toLowerCase().trim(),
    name: user.name,
    role: user.role,
    isBlocked: user.isBlocked,
    token_type: MOBILE_TOKEN_TYPE,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuer(MOBILE_JWT_ISSUER)
    .setAudience(MOBILE_JWT_AUDIENCE)
    .setExpirationTime(MOBILE_TOKEN_EXPIRATION)
    .setIssuedAt()
    .sign(secret);
}

export type VerifyMobileAuthResult =
  | {
      success: true;
      user: MobileUserClaims;
    }
  | {
      success: false;
      statusCode: 401 | 403;
      errorCode: string;
      message: string;
    };

/**
 * Validates a Bearer token from the HTTP Authorization header.
 * Enforces:
 * 1. Bearer format
 * 2. Signature verification with domain-separated mobile key
 * 3. Issuer: "selffits-mobile-api"
 * 4. Audience: "selffits-mobile-app"
 * 5. Token Type: "mobile_access_token"
 * 6. Non-expired status
 * 7. Active non-blocked account status
 */
export async function verifyMobileAuth(
  req: Request
): Promise<VerifyMobileAuthResult> {
  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");

  if (!authHeader) {
    return {
      success: false,
      statusCode: 401,
      errorCode: "MISSING_BEARER_TOKEN",
      message: "Authorization header with Bearer token is required.",
    };
  }

  const parts = authHeader.trim().split(/\s+/);
  if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") {
    return {
      success: false,
      statusCode: 401,
      errorCode: "INVALID_TOKEN_FORMAT",
      message: "Authorization header must be in 'Bearer <token>' format.",
    };
  }

  const token = parts[1];
  const secret = getMobileSigningKey();

  try {
    const { payload } = await jwtVerify(token, secret, {
      issuer: MOBILE_JWT_ISSUER,
      audience: MOBILE_JWT_AUDIENCE,
    });

    if (payload.token_type !== MOBILE_TOKEN_TYPE) {
      return {
        success: false,
        statusCode: 401,
        errorCode: "INVALID_TOKEN_TYPE",
        message: "Token is not a valid mobile access token.",
      };
    }

    if (!payload.sub || typeof payload.sub !== "string") {
      return {
        success: false,
        statusCode: 401,
        errorCode: "INVALID_TOKEN_CLAIMS",
        message: "Token contains invalid subject claim.",
      };
    }

    if (payload.isBlocked === true) {
      return {
        success: false,
        statusCode: 403,
        errorCode: "ACCOUNT_BLOCKED",
        message: "Your account has been suspended by an administrator.",
      };
    }

    const userClaims: MobileUserClaims = {
      id: payload.sub,
      email: (payload.email as string) || "",
      name: (payload.name as string) || "SELFFITS User",
      role: (payload.role as Role) || "STUDENT",
      isBlocked: !!payload.isBlocked,
    };

    return {
      success: true,
      user: userClaims,
    };
  } catch (err: any) {
    const errorName = err?.code || err?.name || "JWTVerificationError";

    if (errorName === "ERR_JWT_EXPIRED" || err?.message?.includes("expired")) {
      return {
        success: false,
        statusCode: 401,
        errorCode: "TOKEN_EXPIRED",
        message: "Mobile access token has expired. Please log in again.",
      };
    }

    if (
      errorName === "ERR_JWT_CLAIM_VALIDATION_FAILED" ||
      err?.message?.includes("claim") ||
      err?.message?.includes("audience") ||
      err?.message?.includes("issuer")
    ) {
      return {
        success: false,
        statusCode: 401,
        errorCode: "INVALID_TOKEN_CLAIMS",
        message: "Token claims do not match required mobile audience or issuer.",
      };
    }

    return {
      success: false,
      statusCode: 401,
      errorCode: "INVALID_TOKEN_SIGNATURE",
      message: "Mobile token signature is invalid or has been tampered with.",
    };
  }
}

/**
 * Enforces role-based authorization for an endpoint.
 */
export function enforceMobileRole(
  user: MobileUserClaims,
  allowedRoles: Role[]
): { allowed: boolean; errorResponse?: { statusCode: 403; errorCode: string; message: string } } {
  if (allowedRoles.includes(user.role)) {
    return { allowed: true };
  }

  return {
    allowed: false,
    errorResponse: {
      statusCode: 403,
      errorCode: "FORBIDDEN_ROLE",
      message: `Access denied. Endpoint requires one of: [${allowedRoles.join(", ")}]. Current role: ${user.role}.`,
    },
  };
}
