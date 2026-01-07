import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AnalyticsSummary } from "@anuncios/shared";
import { analyticsService, type AnalyticsFilters } from "@/services/analytics.service";

type UseStatsParams = {
  accessToken?: string | null;
  filters?: AnalyticsFilters;
  enabled?: boolean;
};

type StatsState = {
  data: AnalyticsSummary | null;
  loading: boolean;
  error: Error | null;
};

const defaultState: StatsState = {
  data: null,
  loading: false,
  error: null,
};

export function useStatsSummary({ accessToken, filters, enabled = true }: UseStatsParams = {}) {
  const [state, setState] = useState<StatsState>(defaultState);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchSummary = useCallback(async () => {
    if (!accessToken || !enabled) {
      if (mountedRef.current) {
        setState(defaultState);
      }
      return;
    }

    if (mountedRef.current) {
      setState((prev) => ({ ...prev, loading: true, error: null }));
    }

    try {
      const data = await analyticsService.getSummary(accessToken, filters);
      if (mountedRef.current) {
        setState({ data, loading: false, error: null });
      }
    } catch (error) {
      if (mountedRef.current) {
        setState({ data: null, loading: false, error: error as Error });
      }
    }
  }, [accessToken, enabled, filters]);

  useEffect(() => {
    void fetchSummary();
  }, [fetchSummary]);

  return useMemo(
    () => ({
      ...state,
      refresh: fetchSummary,
    }),
    [state, fetchSummary],
  );
}
