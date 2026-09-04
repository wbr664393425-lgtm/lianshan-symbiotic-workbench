import { readFile } from "node:fs/promises";
import process from "node:process";

const tracePath = process.argv[2] ?? "qa/single-subject-transition.json";
const trace = JSON.parse(await readFile(tracePath, "utf8"));
const states = trace.states ?? [];

if (!states.length) {
  throw new Error("single-subject trace has no states");
}

const failures = [];
for (const state of states) {
  const figures = state.figures ?? [];
  const visibleFigures = figures.filter((figure) => figure.visibility !== "hidden" && figure.opacity > 0.01);
  if (figures.length !== 1) {
    failures.push(`${state.name}: expected one companion image in the DOM, found ${figures.length}`);
  }
  if (visibleFigures.length !== 1) {
    failures.push(`${state.name}: expected one visible companion image, found ${visibleFigures.length}`);
  }
}

const settledHome = [...states].reverse().find((state) => state.name?.includes("home"));
if (!settledHome || settledHome.active !== "首页" || settledHome.homeOpacity !== 1 || settledHome.taskOpacity !== 0) {
  failures.push("settled home state is not fully restored");
}
if ((settledHome?.navCenterDelta ?? 0) > 1 || (settledHome?.navSizeDelta ?? 0) > 1) {
  failures.push(`settled home navigation is misaligned (${settledHome.navCenterDelta}px center, ${settledHome.navSizeDelta}px size)`);
}

if (failures.length) {
  console.error("FAIL: single-subject companion regression");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log("PASS: every checked state has one companion image and the settled home state is fully restored");
}
