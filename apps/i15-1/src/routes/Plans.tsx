import { PlanBrowser } from "@atlas/blueapi-ui";
import { PlanParameters } from "@atlas/blueapi-ui";
import { usePlans } from "@atlas/blueapi-query";

function JsonFormsPlans() {
  const { data } = usePlans();

  return (
    <PlanBrowser
      plans={data ? data.plans : []}
      renderPlan={(plan) => <PlanParameters plan={plan} />}
    />
  );
}

export default JsonFormsPlans;
