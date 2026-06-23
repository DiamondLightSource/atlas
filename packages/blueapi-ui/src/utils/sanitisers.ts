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
    node.skip ||
    (Array.isArray(node.enum) &&
      typeof node.type === "string" &&
      !JSON_SCHEMA_TYPES.has(node.type))
  ) {
    node.type = "string";
  }
  return node;
};

export const collapseAnyOfEnumBranches: Sanitiser = (node) => {
  if (node.skip || !Array.isArray(node.anyOf)) {
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

const isRecursiveSchema = (node: SchemaNode): boolean => {
  // collect all definitions
  const defs = node.$defs;
  if (!defs || typeof defs !== "object") {
    return false;
  }

  // build graph: definition -> referenced definitions
  const graph = new Map<string, Set<string>>();
  for (const [name, def] of Object.entries(defs)) {
    graph.set(name, new Set());
    visit(def, (node) => {
      const ref = node.$ref;

      // we only care about recursion among local definitions so we look for #/$defs/
      if (typeof ref === "string" && ref.startsWith("#/$defs/")) {
        const target = ref.substring("#/$defs/".length);
        graph.get(name)!.add(target);
      }
    });
  }

  /** Nodes that have been completely processed */
  const visited = new Set<string>();

  /** Nodes we are currently exploring */
  const stack = new Set<string>();

  function dfs(node: string): boolean {
    if (stack.has(node)) {
      return true;
    }

    if (visited.has(node)) {
      return false;
    }

    visited.add(node);
    stack.add(node);

    for (const neighbour of graph.get(node) ?? []) {
      if (dfs(neighbour)) {
        return true;
      }
    }

    stack.delete(node);
    return false;
  }

  return [...graph.keys()].some(dfs);
};

/** recursive tree traversal using a visitor callback */
function visit(value: unknown, callback: (node: SchemaNode) => void): void {
  if (Array.isArray(value)) {
    value.forEach((v) => visit(v, callback));
    return;
  }

  if (value && typeof value === "object") {
    const node = value as SchemaNode;

    callback(node);

    Object.values(node).forEach((v) => visit(v, callback));
  }
}

/**
 * Detect recursive schemas and give them a skip prop.
 * This is a temporary measure to stop plan pages freezing;
 * plans which do not render should have either custom UI
 * or a generic JSON editor.
 */
export const skipRecursiveSchemas: Sanitiser = (node) => {
  node.skip = isRecursiveSchema(node);
};
