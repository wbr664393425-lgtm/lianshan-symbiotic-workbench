import fs from "node:fs";

const appSource = fs.readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
const styleSource = fs.readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");
const failures = [];

const focusBody = appSource.match(/focus\(active\)\s*\{([\s\S]*?)\n\s*\},/u)?.[1] ?? "";
if (!focusBody) failures.push("composer focus handler was not found");
if (/composer(?:Lift|Scale|X|Y)|scale[XY]?\s*\(|\by\s*\(/u.test(focusBody)) {
  failures.push("composer focus handler must not animate the outer dock transform");
}
if (!/composerOpacity\(active\s*\?\s*\.72\s*:\s*0\)/u.test(focusBody)) {
  failures.push("composer focus handler should retain the inner refractive response");
}

const previewBlock = styleSource.match(/\.companion-intent-preview\s*\{([\s\S]*?)\n\}/u)?.[1] ?? "";
if (!previewBlock) failures.push("task-navigation preview block was not found");
if (/mix-blend-mode|(?:^|\s)(?:-webkit-)?mask\s*:|will-change/u.test(previewBlock)) {
  failures.push("task-navigation preview must not allocate a full-size masked or persistent promoted layer");
}

if (!/const lifecycleDelay = pageProgress < \.98/u.test(appSource)) {
  failures.push("task lifecycle motion must wait for page-transition settlement");
}
if ((appSource.match(/gsap\.timeline\(\{ delay: lifecycleDelay/gu) ?? []).length < 2) {
  failures.push("both running and completion lifecycle timelines must use the route-settlement delay");
}
if ((appSource.match(/navMotionTweenRef\.current\?\.isActive\?\.\(\)/gu) ?? []).length < 2) {
  failures.push("task preview enter and leave handlers must ignore an active route transition");
}

const entranceBlock = appSource.match(/const entranceTargets = \[([\s\S]*?)const timeline = gsap\.timeline/u)?.[1] ?? "";
if (/\bframe,|willChange:\s*["']transform, opacity/u.test(entranceBlock)) {
  failures.push("homepage entrance must not promote both the full frame and all nested entrance targets");
}
if (/\.from\(frame,\s*\{[^}]*scale/u.test(appSource)) {
  failures.push("homepage refresh must not scale the full glass application frame");
}

if (failures.length) {
  console.error("FAIL: motion ownership regression");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("PASS: composer focus, refresh entrance, route handoff, and task lifecycle have separate motion owners");
