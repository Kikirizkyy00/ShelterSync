"use client";

import { useEffect } from "react";

export function GlobalErrorHandler() {
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      console.error(
        "[ShelterSync] Unhandled promise rejection intercepted:",
        reason instanceof Error
          ? { message: reason.message, stack: reason.stack }
          : reason
      );
      event.preventDefault();
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    return () => {
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  return null;
}
