
import { blueapiHandlers } from "./blueapi";
import { supergraphHandlers } from "./supergraph";

export const handlers = [
  ...blueapiHandlers,
  ...supergraphHandlers
];
