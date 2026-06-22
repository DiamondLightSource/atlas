import type { Plan } from "@atlas/blueapi";
import {
  collapseAnyOfEnumBranches,
  replaceUnknownEnumTypes,
  skipRecursiveSchemas,
} from "./sanitisers";

export type SchemaNode = Record<string, unknown>;

/** Mutating sanitising operation */
export type Sanitiser = (node: SchemaNode) => void;

const SANITISERS: Sanitiser[] = [
  skipRecursiveSchemas,
  collapseAnyOfEnumBranches,
  replaceUnknownEnumTypes,
];

function sanitiseNode(node: unknown): unknown {
  if (Array.isArray(node)) {
    return node.map(sanitiseNode);
  }

  if (node && typeof node === "object") {
    const record = Object.fromEntries(
      Object.entries(node).map(([key, value]) => [key, sanitiseNode(value)]),
    );

    SANITISERS.forEach((sanitiser) => sanitiser(record));

    return record;
  }

  return node;
}

export function sanitisePlan(plan: Plan): Plan {
  return {
    ...plan,
    schema: sanitiseNode(plan.schema) as object,
  };
}
