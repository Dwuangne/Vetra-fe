"use client";

import { useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ApiHttpError, login } from "@/lib/api";
import { resolveApiErrorMessage } from "@/lib/i18n/resolve-api-error";
import { getPostLoginRedirectPath } from "@/lib/auth/roles";
import { useAuth } from "./use-auth";

export type LoginFeedback = { type: "ok" | "err"; text: string } | null;

export function useLoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<LoginFeedback>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login: loginSession } = useAuth();

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setLoading(true);
    try {
      const result = await login({ username, password });
      loginSession(result.data);
      setFeedback({
        type: "ok",
        text: `${result.message}`,
      });
      const next = searchParams.get("next");
      const target = getPostLoginRedirectPath(result.data.user.roles, next);
      router.replace(target);
    } catch (err) {
      if (err instanceof ApiHttpError) {
        setFeedback({
          type: "err",
          text: resolveApiErrorMessage(err),
        });
      } else {
        setFeedback({ type: "err", text: err instanceof Error ? err.message : "Unknown error" });
      }
    } finally {
      setLoading(false);
    }
  }, [loginSession, password, router, searchParams, username]);

  return {
    showPassword,
    setShowPassword,
    username,
    setUsername,
    password,
    setPassword,
    loading,
    feedback,
    handleSubmit,
  };
}
