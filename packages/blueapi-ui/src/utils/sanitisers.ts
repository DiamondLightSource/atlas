import type { Sanitiser, SchemaNode } from "./schema";

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
export const replaceUnknownEnumTypes: Sanitiser = (node) => {
  if (
    Array.isArray(node.enum) &&
    typeof node.type === "string" &&
    !JSON_SCHEMA_TYPES.has(node.type)
  ) {
    node.type = "string";
  }
  return node;
};

export const collapseAnyOfEnumBranches: Sanitiser = (node) => {
  if (!Array.isArray(node.anyOf)) {
    return node;
  }

  const branches = node.anyOf;

  const allEnumBranches = branches.every(
    (branch) =>
      typeof branch === "object" && Array.isArray((branch as SchemaNode).enum),
  );

  if (!allEnumBranches) return node;

  const values = [
    ...new Set(
      branches.flatMap((branch) => (branch as SchemaNode).enum as unknown[]),
    ),
  ];

  delete node.anyOf;
  node.type = "string";
  node.enum = values;
};
