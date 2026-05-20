import { useState, useEffect, useCallback, useRef } from "react";

export function useWakeLock() {
  const [isActive, setIsActive] = useState(false);
  const shouldHold = useRef(false);
  const sentinelRef = useRef<WakeLockSentinel | null>(null);

  const acquire = useCallback(async () => {
    if (!("wakeLock" in navigator)) return;
    try {
      const sentinel = await navigator.wakeLock.request("screen");
      sentinelRef.current = sentinel;
      setIsActive(true);
      shouldHold.current = true;
      sentinel.addEventListener("release", () => {
        setIsActive(false);
        sentinelRef.current = null;
        if (shouldHold.current && document.visibilityState === "visible") {
          acquire();
        }
      });
    } catch {
      setIsActive(false);
    }
  }, []);

  const release = useCallback(() => {
    shouldHold.current = false;
    sentinelRef.current?.release().catch(() => {});
    sentinelRef.current = null;
    setIsActive(false);
  }, []);

  useEffect(() => {
    const onVisible = () => {
      if (
        document.visibilityState === "visible" &&
        shouldHold.current &&
        !sentinelRef.current
      ) {
        acquire();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [acquire]);

  useEffect(() => {
    return () => {
      shouldHold.current = false;
      sentinelRef.current?.release().catch(() => {});
    };
  }, []);

  return {
    isActive,
    acquire,
    release,
    isSupported: "wakeLock" in navigator,
  };
}
