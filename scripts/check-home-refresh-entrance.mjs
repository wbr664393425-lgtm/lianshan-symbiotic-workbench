import fs from "node:fs";

const tracePath = process.argv[2];
if (!tracePath) {
  console.error("Usage: node scripts/check-home-refresh-entrance.mjs <trace.json>");
  process.exit(2);
}

const trace = JSON.parse(fs.readFileSync(tracePath, "utf8"));
const failures = [];

if (trace.figureCount !== 1) failures.push(`expected one companion figure, found ${trace.figureCount}`);
if (trace.introLayerCount !== 1) failures.push(`expected one isolated intro layer, found ${trace.introLayerCount}`);
if (!trace.imageReady) failures.push("companion image was not decoded when the entrance began");
if (trace.firstOpacity > 0.12) failures.push(`first sampled opacity ${trace.firstOpacity} should be at or below 0.12`);
if (trace.distinctOpacitySteps < 8) failures.push(`expected at least 8 opacity steps, found ${trace.distinctOpacitySteps}`);
if (trace.fullOpacityAtMs < 700 || trace.fullOpacityAtMs > 1500) {
  failures.push(`full opacity should arrive between 700ms and 1500ms, got ${trace.fullOpacityAtMs}ms`);
}
if (trace.maxOpacityDelta > 0.16) failures.push(`largest opacity step ${trace.maxOpacityDelta} is too abrupt`);
if (trace.maxVerticalDelta > 2.5) failures.push(`largest vertical step ${trace.maxVerticalDelta}px is too abrupt`);
if (trace.finalOpacity < 0.98) failures.push(`final opacity ${trace.finalOpacity} should be at least 0.98`);

if (failures.length) {
  console.error("FAIL: homepage companion refresh entrance regression");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("PASS: homepage companion enters from a decoded hidden state with continuous opacity and motion");
