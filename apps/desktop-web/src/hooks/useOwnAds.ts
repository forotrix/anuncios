import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { adService, type OwnAdsFilters, type OwnAdsResponse } from "@/services/ad.service";

type UseOwnAdsParams = OwnAdsFilters & {
  accessToken?: string | null;
  enabled?: boolean;
};

type UseOwnAdsState = {
  data: OwnAdsResponse | null;
  loading: boolean;
  error: Error | null;
};

const idleState: UseOwnAdsState = {
  data: null,
  loading: false,
  error: null,
};

export function useOwnAds(params: UseOwnAdsParams = {}) {
  const { accessToken, page = 1, limit = 10, enabled = true } = params;
  const [state, setState] = useState<UseOwnAdsState>(idleState);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchAds = useCallback(async () => {
    if (!accessToken || !enabled) {
      if (mountedRef.current) {
        setState(idleState);
      }
      return;
    }

    if (mountedRef.current) {
      setState((prev) => ({ ...prev, loading: true, error: null }));
    }

    try {
      const data = await adService.fetchOwnAds(accessToken, { page, limit });
      if (mountedRef.current) {
        setState({ data, loading: false, error: null });
      }
    } catch (error) {
      if (mountedRef.current) {
        setState({ data: null, loading: false, error: error as Error });
      }
    }
  }, [accessToken, enabled, page, limit]);

  useEffect(() => {
    void fetchAds();
  }, [fetchAds]);

  return useMemo(
    () => ({
      ...state,
      refresh: fetchAds,
    }),
    [state, fetchAds],
  );
}
