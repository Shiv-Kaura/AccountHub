"use client";

import { useEffect, useState } from "react";
import { TOAST_EVENT, type ToastVariant } from "@/lib/toast-client";

type ToastItem = {
  id: number;
  message: string;
  variant: ToastVariant;
};

let nextId = 1;

export function Toaster() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    function handle(e: Event) {
      const { message, variant } = (e as CustomEvent<{ message: string; variant: ToastVariant }>).detail;
      const id = nextId++;
      setToasts((t) => [...t, { id, message, variant }]);
      setTimeout(() => {
        setToasts((t) => t.filter((x) => x.id !== id));
      }, 3000);
    }
    window.addEventListener(TOAST_EVENT, handle);
    return () => window.removeEventListener(TOAST_EVENT, handle);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`rounded-md px-4 py-2 text-sm font-medium text-white shadow-lg ${
            t.variant === "error" ? "bg-[#d81159]" : "bg-[#0496ff]"
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
