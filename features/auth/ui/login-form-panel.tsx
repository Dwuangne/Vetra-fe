"use client";

import { VetraLogo } from "@/components/vetra-logo";

import { AUTH_APP_NAME, AUTH_BRAND_HEX } from "../constants";
import { useLoginForm } from "../hooks/use-login-form";
import { IconEye, IconEyeOff } from "./login-icons";

export function LoginFormPanel() {
  const {
    showPassword,
    setShowPassword,
    username,
    setUsername,
    password,
    setPassword,
    loading,
    feedback,
    handleSubmit,
  } = useLoginForm();

  return (
    <div className="flex w-full items-center justify-center bg-white p-8 text-neutral-900 lg:w-1/2">
      <div className="relative w-full max-w-md space-y-8">
        <div className="mb-8 text-center lg:hidden">
          <div className="flex items-center justify-center">
            <VetraLogo alt={`${AUTH_APP_NAME} logo`} className="size-10 rounded-sm" />
            <h1 className="ml-2 text-2xl font-bold">{AUTH_APP_NAME}</h1>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2 text-center">
            <h2 className="text-3xl">Welcome Back</h2>
            <p className="text-sm text-neutral-500 sm:text-base">
              Enter your username and password to access your account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                Username
              </label>
              <input
                id="username"
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
                className="h-12 w-full rounded-lg border border-neutral-200 bg-white px-3 outline-none ring-0 focus:border-[#000088]"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  className="h-12 w-full rounded-lg border border-neutral-200 bg-white pl-3 pr-10 outline-none focus:border-[#000088]"
                />
                <button
                  type="button"
                  className="absolute right-0 top-0 flex h-12 items-center px-3 text-neutral-500 hover:text-neutral-800"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="remember" className="h-4 w-4 cursor-pointer rounded border-neutral-300" />
              <label htmlFor="remember" className="cursor-pointer text-sm text-neutral-500">
                Remember Me
              </label>
            </div>

            {feedback ? (
              <p
                role="alert"
                className={`rounded-lg px-3 py-2 text-sm ${
                  feedback.type === "ok" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"
                }`}
              >
                {feedback.text}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-lg text-sm font-medium text-white shadow-none hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: AUTH_BRAND_HEX }}
            >
              {loading ? "Signing in…" : "Log In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
