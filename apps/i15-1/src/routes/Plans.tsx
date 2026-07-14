import { PlanBrowser } from "@atlas/blueapi-ui";
import { PlanParameters } from "@atlas/blueapi-ui";

function JsonFormsPlans() {
  return <PlanBrowser renderPlan={plan => <PlanParameters plan={plan} />} />;
}

export default JsonFormsPlans;
