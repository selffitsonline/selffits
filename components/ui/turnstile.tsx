"use client";

import React, { useEffect, useRef, useImperativeHandle, forwardRef, useState } from "react";

// Official Cloudflare Turnstile Always-Pass Testing Site Key:
const DEFAULT_TEST_SITE_KEY = "1x00000000000000000000AA";

export interface TurnstileRef {
  reset: () => void;
}

interface TurnstileProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: (error?: unknown) => void;
  theme?: "light" | "dark" | "auto";
  className?: string;
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "error-callback"?: () => void;
          "expired-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
          size?: "normal" | "compact" | "flexible";
        }
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId: string) => void;
    };
    onTurnstileScriptLoaded?: () => void;
  }
}

export const Turnstile = forwardRef<TurnstileRef, TurnstileProps>(function Turnstile(
  { onVerify, onExpire, onError, theme = "dark", className = "" },
  ref
) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);

  const siteKey =
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ||
    (process.env.NODE_ENV !== "production" ? DEFAULT_TEST_SITE_KEY : "");

  useImperativeHandle(ref, () => ({
    reset: () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.reset(widgetIdRef.current);
        } catch (e) {
          console.warn("[TURNSTILE] Reset warning:", e);
        }
      }
    },
  }));

  useEffect(() => {
    let isMounted = true;

    // Load Turnstile script if not already present
    const SCRIPT_ID = "cf-turnstile-script";
    let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;

    const renderWidget = () => {
      if (!isMounted || !containerRef.current || !window.turnstile) return;
      if (widgetIdRef.current) {
        try {
          window.turnstile.remove(widgetIdRef.current);
          widgetIdRef.current = null;
        } catch {
          // ignore
        }
      }

      if (!siteKey) {
        console.error("[TURNSTILE] NEXT_PUBLIC_TURNSTILE_SITE_KEY is not configured.");
        if (isMounted && onError) {
          onError(new Error("Turnstile Site Key is not configured."));
        }
        return;
      }

      try {
        const id = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme,
          size: "normal",
          callback: (token: string) => {
            if (isMounted) {
              onVerify(token);
            }
          },
          "error-callback": () => {
            if (isMounted && onError) {
              onError();
            }
          },
          "expired-callback": () => {
            if (isMounted && onExpire) {
              onExpire();
            }
          },
        });
        widgetIdRef.current = id;
      } catch (err) {
        console.warn("[TURNSTILE] Render error:", err);
      }
    };

    if (!script) {
      script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (isMounted) {
          renderWidget();
        }
      };
      document.head.appendChild(script);
    } else {
      if (window.turnstile) {
        renderWidget();
      } else {
        script.addEventListener("load", () => {
          if (isMounted) {
            renderWidget();
          }
        });
      }
    }

    return () => {
      isMounted = false;
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
          widgetIdRef.current = null;
        } catch {
          // ignore
        }
      }
    };
  }, [siteKey, theme, onVerify, onExpire, onError]);

  return (
    <div className={`flex flex-col items-center justify-center my-2 min-h-[65px] ${className}`}>
      <div ref={containerRef} />
    </div>
  );
});
