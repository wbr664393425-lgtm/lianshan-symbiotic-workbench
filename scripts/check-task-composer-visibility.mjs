import fs from "node:fs";

const tracePath = process.argv[2];
if (!tracePath) {
  console.error("Usage: node scripts/check-task-composer-visibility.mjs <trace.json>");
  process.exit(2);
}

const trace = JSON.parse(fs.readFileSync(tracePath, "utf8"));
const failures = [];

if (trace.active !== "任务") failures.push(`expected task navigation to be active, found ${trace.active}`);
if (!trace.composerExists) failures.push("expected the shared composer to remain mounted");
if (trace.composerVisibility !== "visible") failures.push(`expected visible visibility, found ${trace.composerVisibility}`);
if (trace.composerOpacity < 0.98) failures.push(`expected composer opacity at least 0.98, found ${trace.composerOpacity}`);
if (trace.visibleArea <= 0) failures.push("expected the composer to intersect the viewport");

if (failures.length) {
  console.error("FAIL: task composer visibility regression");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("PASS: task composer remains visible after the home-to-task transition");
