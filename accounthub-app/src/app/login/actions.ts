"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error: string | null };

// A hard cap on how long we'll wait for Supabase Auth before giving up and
// telling the user, instead of leaving the "Working..." button spinning
// forever. This is set well under Vercel's own ~300s function timeout, so a
// slow Auth backend (e.g. the Aug 2026 Supabase platform incident) fails
// visibly with a clear message rather than hanging until Vercel kills the
// request with a generic 504.
const AUTH_TIMEOUT_MS = 15_000;

function withTimeout<T>(promise: Promise<T>, ms: number, timeoutMessage: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(timeoutMessage)), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

const SLOW_LOGIN_MESSAGE =
  "Sign-in is taking longer than expected. This is usually a temporary issue with the login " +
  "service, not something wrong with your account — please wait a moment and try again.";

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");

  const supabase = await createClient();

  let result;
  try {
    result = await withTimeout(
      supabase.auth.signInWithPassword({ email, password }),
      AUTH_TIMEOUT_MS,
      SLOW_LOGIN_MESSAGE
    );
  } catch {
    return { error: SLOW_LOGIN_MESSAGE };
  }

  if (result.error) return { error: result.error.message };

  redirect("/accounts");
}

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");

  const supabase = await createClient();

  let result;
  try {
    result = await withTimeout(
      supabase.auth.signUp({ email, password }),
      AUTH_TIMEOUT_MS,
      SLOW_LOGIN_MESSAGE
    );
  } catch {
    return { error: SLOW_LOGIN_MESSAGE };
  }

  if (result.error) return { error: result.error.message };

  return { error: "Check your email to confirm your account, then sign in." };
}
