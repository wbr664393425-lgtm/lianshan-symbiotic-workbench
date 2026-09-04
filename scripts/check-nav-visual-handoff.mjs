import fs from "node:fs";

const tracePath = process.argv[2];
if (!tracePath) {
  console.error("Usage: node scripts/check-nav-visual-handoff.mjs <trace.json>");
  process.exit(2);
}

const trace = JSON.parse(fs.readFileSync(tracePath, "utf8"));
const failures = [];

if (trace.forwardStatusTaskOverlapMs > 50) {
  failures.push(`forward status/task overlap ${trace.forwardStatusTaskOverlapMs}ms exceeds 50ms`);
}
if (trace.reverseStatusTaskOverlapMs > 50) {
  failures.push(`reverse status/task overlap ${trace.reverseStatusTaskOverlapMs}ms exceeds 50ms`);
}
if (trace.reverseLightVisibleMs > 380) {
  failures.push(`reverse light remains visible for ${trace.reverseLightVisibleMs}ms; expected at most 380ms`);
}
if (trace.reverseLightFinalOpacity > 0.01) {
  failures.push(`reverse light final opacity ${trace.reverseLightFinalOpacity} should be at or below 0.01`);
}
if (trace.statusOpacityReversals !== 0) {
  failures.push(`status opacity reversed direction ${trace.statusOpacityReversals} times`);
}

if (failures.length) {
  console.error("FAIL: navigation visual handoff regression");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("PASS: status card hands off without overlap and reverse light settles promptly");
