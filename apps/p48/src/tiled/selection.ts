import type { TiledNode } from "./tiledService";

/** e.g. ["start", "motors"] */
export type MetadataField = string[];

export interface Selection {
  node: TiledNode;
  fields?: MetadataField[];
}

export const JSON_INDENT = 2;

/** The first and last line showing `field` in JSON.stringify(_, null, JSON_INDENT) */
export function findField(
  lines: string[],
  field: MetadataField,
): [number, number] | null {
  let first = 0;
  let last = lines.length - 1;
  for (const [depth, key] of field.entries()) {
    const indent = " ".repeat(JSON_INDENT * (depth + 1));
    const prefix = `${indent}${JSON.stringify(key)}: `;
    const line = lines.findIndex(
      (text, i) => i >= first && i <= last && text.startsWith(prefix),
    );
    if (line === -1) return null;
    first = line;
    // An object or array runs until the next line that isn't indented further
    last = /[[{]$/.test(lines[line])
      ? lines.findIndex((text, i) => i > line && !text.startsWith(`${indent} `))
      : line;
  }
  return [first, last];
}
