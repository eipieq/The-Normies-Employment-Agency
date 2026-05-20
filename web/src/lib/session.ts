import type { SessionOptions } from "iron-session";

export type SessionData = {
  address?: string; // verified via siwe
  nonce?: string;   // ephemeral, cleared after verify
};

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: "normie-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
  },
};
