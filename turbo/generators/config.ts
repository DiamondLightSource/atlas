import type { PlopTypes } from "@turbo/gen";

export default function generator(plop: PlopTypes.NodePlopAPI) {
  plop.setGenerator("Science UI", {
    description: "Create a new Science UI instance",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "Beamline name",
      },
      {
        type: "input",
        name: "blueapiUrl",
        message: "Blueapi deployment URL",
      },
    ],
    actions: [
      {
        type: "addMany",
        destination: "apps/{{name}}",
        base: "templates/science-ui",
        templateFiles: "templates/science-ui/**",
      },
    ],
  });
}
