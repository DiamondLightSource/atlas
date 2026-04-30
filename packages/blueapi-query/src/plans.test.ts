import type { Api, Plan, PlansResponse } from "@atlas/blueapi";
import type { QueryClient } from "@tanstack/react-query";
import { createTestQueryClient, renderWithProviders } from "./testUtils";
import { waitFor } from "@atlas/vitest-conf";
import { usePlan, usePlans } from "./plans";
import { planKeys } from "./queryKeys";

describe("Plan hooks", () => {
  let api: Api;
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();

    api = {
      plans: {
        getAll: vi.fn(),
        get: vi.fn(),
      },
    } as unknown as Api;
  });

  it("calls blueapi.plans.getAll and uses planKeys.all on usePlans", async () => {
    const plans: PlansResponse = { plans: [] };
    (api.plans.getAll as any).mockResolvedValue(plans);

    const { result } = renderWithProviders(() => usePlans(), api, queryClient);

    await waitFor(() => {
      expect(result.current.data).toEqual(plans);
    });

    expect(api.plans.getAll).toHaveBeenCalledOnce();
    const cached = queryClient.getQueryCache().find({ queryKey: planKeys.all });
    expect(cached).toBeDefined();
  });

  it("calls blueapi.plans.get with plan name and uses planKeys.detail for usePlan", async () => {
    const planName = "scan";
    const plan: Plan = { name: planName, description: "do a scan", schema: {} };
    (api.plans.get as any).mockResolvedValue(plan);

    const { result } = renderWithProviders(
      () => usePlan(planName),
      api,
      queryClient,
    );

    await waitFor(() => {
      expect(result.current.data).toEqual(plan);
    });

    expect(api.plans.get).toHaveBeenCalledExactlyOnceWith(planName);

    const cached = queryClient
      .getQueryCache()
      .find({ queryKey: planKeys.detail(planName) });
    expect(cached).toBeDefined();
  });
});
