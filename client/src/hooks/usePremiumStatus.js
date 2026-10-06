import { useCallback, useEffect, useState } from "react";
import { subscriptionsApi } from "../api/subscriptionsApi";

const MAX_TIMEOUT = 2_147_000_000;

export const usePremiumStatus = () => {
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async (force = false) => {
    try {
      const current = await subscriptionsApi.get({ force });
      setStatus(current);
      setError("");
      return current;
    } catch (requestError) {
      setError(requestError.message);
      throw requestError;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh().catch(() => {});
  }, [refresh]);

  useEffect(() => {
    const expiresAt = Date.parse(status?.subscription?.expiresAt || "");
    if (!status?.premium || !Number.isFinite(expiresAt)) return undefined;

    let timer;
    const scheduleExpiryCheck = () => {
      const remaining = expiresAt - Date.now();
      if (remaining > MAX_TIMEOUT) {
        timer = setTimeout(scheduleExpiryCheck, MAX_TIMEOUT);
        return;
      }

      timer = setTimeout(() => {
        setStatus((current) => current ? { ...current, premium: false } : current);
        refresh(true).catch(() => {});
      }, Math.max(0, remaining) + 50);
    };

    scheduleExpiryCheck();
    return () => clearTimeout(timer);
  }, [refresh, status?.premium, status?.subscription?.expiresAt]);

  return { status, premium: status?.premium === true, isLoading, error, refresh };
};