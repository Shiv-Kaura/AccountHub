"use client";

import { useActionState, useState } from "react";
import { signIn, signUp, type AuthState } from "./actions";

const initialState: AuthState = { error: null };

export default function LoginPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [signInState, signInAction, signInPending] = useActionState(signIn, initialState);
  const [signUpState, signUpAction, signUpPending] = useActionState(signUp, initialState);

  const state = mode === "signin" ? signInState : signUpState;
  const action = mode === "signin" ? signInAction : signUpAction;
  const pending = mode === "signin" ? signInPending : signUpPending;

  return (
    <div className="flex min-h-screen items-center justify-center bg-white/[0.03] px-4">
      <div className="w-full max-w-sm rounded-xl border border-white/[0.07] bg-[#161618] p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-[#f2f2f4]">AccountHub</h1>
        <p className="mt-1 text-sm text-[#8c8f96]">
          {mode === "signin" ? "Sign in to your account." : "Create an account."}
        </p>

        <form action={action} className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm font-medium text-[#c7c9d0]">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="rounded-md border border-white/[0.10] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0496ff]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm font-medium text-[#c7c9d0]">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              className="rounded-md border border-white/[0.10] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0496ff]"
            />
          </div>

          {state.error && <p className="text-sm text-[#ff5c8a]">{state.error}</p>}

          <button
            type="submit"
            disabled={pending}
            className="mt-1 rounded-md bg-gradient-to-b from-[#0496ff] to-[#006ba6] px-3 py-2 text-sm font-medium text-white hover:brightness-110 disabled:opacity-60"
          >
            {pending ? "Working…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-4 text-sm text-[#8c8f96] hover:text-[#f2f2f4]"
        >
          {mode === "signin" ? "Need an account? Sign up" : "Have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}
