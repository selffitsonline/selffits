"use client";

import React, {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  memo,
} from "react";

// Official Cloudflare Turnstile Always-Pass Testing Site Key:
const DEFAULT_TEST_SITE_KEY = "1x00000000000000000000AA";

export interface TurnstileRef {
  reset: () => void;
}

export interface TurnstileProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: (error?: unknown) => void;
  theme?: "light" | "dark" | "auto";
  size?: "normal" | "compact" | "flexible";
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
          "error-callback"?: (error?: unknown) => void;
          "expired-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
          size?: "normal" | "compact" | "flexible";
        }
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId: string) => void;
    };
    onTurnstileLoaded?: () => void;
  }
}

const SCRIPT_ID = "cf-turnstile-script";

export const Turnstile = memo(
  forwardRef<TurnstileRef, TurnstileProps>(function Turnstile(
    { onVerify, onExpire, onError, theme = "dark", size = "normal", className = "" },
    ref
  ) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const widgetIdRef = useRef<string | null>(null);

    // Keep stable callback references to avoid resetting Turnstile on parent re-renders
    const onVerifyRef = useRef(onVerify);
    onVerifyRef.current = onVerify;

    const onExpireRef = useRef(onExpire);
    onExpireRef.current = onExpire;

    const onErrorRef = useRef(onError);
    onErrorRef.current = onError;

    const siteKey =
      process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ||
      (process.env.NODE_ENV !== "production" ? DEFAULT_TEST_SITE_KEY : "");

    useImperativeHandle(
      ref,
      () => ({
        reset: () => {
          if (widgetIdRef.current && window.turnstile) {
            try {
              window.turnstile.reset(widgetIdRef.current);
            } catch (e) {
              console.warn("[TURNSTILE] Reset warning:", e);
            }
          }
        },
      }),
      []
    );

    useEffect(() => {
      let isMounted = true;

      if (!siteKey) {
        console.error("[TURNSTILE] NEXT_PUBLIC_TURNSTILE_SITE_KEY is not configured.");
        onErrorRef.current?.(new Error("Turnstile Site Key is not configured."));
        return;
      }

      const renderWidget = () => {
        if (!isMounted || !containerRef.current || !window.turnstile) return;

        // Prevent duplicate rendering in the same container
        if (widgetIdRef.current) return;

        try {
          const id = window.turnstile.render(containerRef.current, {
            sitekey: siteKey,
            theme,
            size,
            callback: (token: string) => {
              if (isMounted) {
                onVerifyRef.current(token);
              }
            },
            "expired-callback": () => {
              if (isMounted && onExpireRef.current) {
                onExpireRef.current();
              }
            },
            "error-callback": (err?: unknown) => {
              if (isMounted && onErrorRef.current) {
                onErrorRef.current(err);
              }
            },
          });
          widgetIdRef.current = id;
        } catch (err) {
          console.warn("[TURNSTILE] Render error:", err);
        }
      };

      // 1. If Turnstile runtime is already loaded, render immediately
      if (window.turnstile) {
        renderWidget();
      } else {
        // 2. Register global onload handler for Turnstile script
        const prevOnload = window.onTurnstileLoaded;
        window.onTurnstileLoaded = () => {
          if (typeof prevOnload === "function") {
            try { prevOnload(); } catch {}
          }
          if (isMounted) {
            renderWidget();
          }
        };

        // 3. Inject script tag if not present
        let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
        if (!script) {
          script = document.createElement("script");
          script.id = SCRIPT_ID;
          script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoaded&render=explicit";
          script.async = true;
          script.defer = true;
          document.head.appendChild(script);
        }

        // 4. Polling fallback (checks every 50ms) to ensure rendering even if onload already fired
        const pollInterval = setInterval(() => {
          if (!isMounted) {
            clearInterval(pollInterval);
            return;
          }
          if (window.turnstile) {
            clearInterval(pollInterval);
            renderWidget();
          }
        }, 50);

        // Clear poll interval after 10s
        setTimeout(() => clearInterval(pollInterval), 10000);
      }

      return () => {
        isMounted = false;
        if (widgetIdRef.current && window.turnstile) {
          try {
            window.turnstile.remove(widgetIdRef.current);
          } catch {
            // ignore
          }
          widgetIdRef.current = null;
        }
      };
    }, [siteKey, theme, size]);

    return (
      <div className={`flex flex-col items-center justify-center my-3 min-h-[65px] w-full ${className}`}>
        <div ref={containerRef} />
      </div>
    );
  })
);

Turnstile.displayName = "Turnstile";
