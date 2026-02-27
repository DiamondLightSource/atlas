import fs from "node:fs";

const prDir = process.argv[2];
const baseDir = process.argv[3];

const projects = fs.readdirSync(prDir).filter((file) => file.endsWith(".json"));

let failed = false;

for (const file of projects) {
  const prPath = `${prDir}/${file}`;
  const basePath = `${baseDir}/${file}`;

  if (!fs.existsSync(basePath)) {
    console.log(`⚠️ ${file.replace(".json", "")}: no baseline found, skipping`);
    continue;
  }

  const pr = JSON.parse(fs.readFileSync(prPath));
  const base = JSON.parse(fs.readFileSync(basePath));

  const prLines = pr.total.lines.pct;
  const baseLines = base.total.lines.pct;

  const delta = (prLines - baseLines).toFixed(2);
  const name = file.replace(".json", "");

  console.log(`\nProject: ${name}`);
  console.log(`Base: ${baseLines}%`);
  console.log(`PR:   ${prLines}%`);
  console.log(`Δ:    ${delta}%`);

  if (prLines < baseLines) {
    console.log("❌ Regression detected");
    failed = true;
  } else {
    console.log("✅ OK");
  }
}

if (failed) {
  process.exit(1);
}
