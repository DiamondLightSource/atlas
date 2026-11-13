import type { PlopTypes } from "@turbo/gen";

import fs from "node:fs";
import path from "node:path";
import { globSync } from "glob";

/* custom action to copy any non handlebar file over */
const copyRaw = (data: any) => {
  const src = path.resolve(__dirname, "templates/science-ui");
  const dest = path.resolve(process.cwd(), "apps", data.name);

  const files = globSync("**/*", {
    cwd: src,
    dot: true,
    nodir: true,
    ignore: "**/*.hbs",
  });

  for (const file of files) {
    const to = path.join(dest, file);
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.copyFileSync(path.join(src, file), to);
  }

  return `Copied ${files.length} files`;
};

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
        name: "description",
        message: "Write a short description for this app",
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
        destination: "apps/{{ dashCase name }}",
        base: "templates/science-ui",
        templateFiles: "templates/science-ui/**/*.hbs",
      },
      copyRaw,
    ],
  });
}
