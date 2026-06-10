const shouldJustBeStrings = [
  "bluesky.protocols.Readable",
  "bluesky.protocols.Movable",
];

const sanitizeSchema = (schema: object): object => {
  const entries = Object.entries(schema);

  const processed = entries.map(([key, value]) => {
    if (key == "type" && shouldJustBeStrings.includes(value)) {
      return [key, "string"];
    } else if (
      typeof value === "object" &&
      !Array.isArray(value) &&
      value !== null
    ) {
      return [key, sanitizeSchema(value)];
    } else {
      return [key, value];
    }
  });
  return Object.fromEntries(processed);
};

export default sanitizeSchema;
