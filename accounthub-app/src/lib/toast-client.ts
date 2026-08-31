"use client";

export type ToastVariant = "success" | "error";

export const TOAST_EVENT = "accounthub:toast";

export function showToast(message: string, variant: ToastVariant = "success") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: { message, variant } }));
}
