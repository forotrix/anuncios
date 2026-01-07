"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { SubscriptionPlanDefinition, SubscriptionStatus } from "@anuncios/shared";
import { subscriptionsService } from "@/services/subscriptions.service";

type SubscriptionState = {
  plans: SubscriptionPlanDefinition[];
  current: SubscriptionStatus | null;
  loading: boolean;
  error: Error | null;
};

const initialState: SubscriptionState = {
  plans: [],
  current: null,
  loading: false,
  error: null,
};

type UseSubscriptionParams = {
  accessToken?: string | null;
  enabled?: boolean;
};

export function useSubscription({ accessToken, enabled = true }: UseSubscriptionParams = {}) {
  const [state, setState] = useState<SubscriptionState>(initialState);

  const fetchData = useCallback(async () => {
    if (!enabled) {
      setState(initialState);
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const plansPromise = subscriptionsService.getPlans();
      const statusPromise: Promise<SubscriptionStatus | null> =
        accessToken && enabled
          ? subscriptionsService.getCurrent(accessToken)
          : Promise.resolve(null);

      const [plans, current] = await Promise.all([plansPromise, statusPromise]);
      setState({ plans, current, loading: false, error: null });
    } catch (error) {
      setState((prev) => ({ ...prev, loading: false, error: error as Error }));
    }
  }, [accessToken, enabled]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  return useMemo(
    () => ({
      ...state,
      refresh: fetchData,
    }),
    [state, fetchData],
  );
}
