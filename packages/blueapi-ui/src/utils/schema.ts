import type { Plan } from "@atlas/blueapi";

const JSON_SCHEMA_TYPES = new Set([
  "string",
  "number",
  "integer",
  "boolean",
  "object",
  "array",
  "null",
]);

/** Replaces any unknown types for `string` when an enum field exists */
function replaceUnknownTypes(
  node: Record<string, unknown>,
): Record<string, unknown> {
  if (
    node.enum &&
    typeof node.type === "string" &&
    !JSON_SCHEMA_TYPES.has(node.type)
  ) {
    node.type = "string";
  }

  return node;
}

function sanitiseSchemaNode(node: unknown): unknown {
  if (Array.isArray(node)) {
    return node.map(sanitiseSchemaNode);
  }

  if (node && typeof node === "object") {
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(node)) {
      result[key] = sanitiseSchemaNode(value);
    }

    const validTypes = replaceUnknownTypes(result);

    return validTypes;
  }

  return node;
}

export function sanitisePlan(plan: Plan): Plan {
  return {
    ...plan,
    schema: sanitiseSchemaNode(plan.schema) as object,
  };
}
