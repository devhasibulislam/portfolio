"use client";

import { useActionState } from "react";
import { signInAction, type LoginState } from "./actions";

const initial: LoginState = null;

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(signInAction, initial);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        <span>Email</span>
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          className="rounded-md border border-white/10 bg-white/5 px-3 py-2 outline-none focus:border-white/30"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span>Password</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="rounded-md border border-white/10 bg-white/5 px-3 py-2 outline-none focus:border-white/30"
        />
      </label>

      {state?.error ? (
        <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {state.error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-[var(--color-brand-highlight)] px-3 py-2 text-sm font-medium text-black transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {isPending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
