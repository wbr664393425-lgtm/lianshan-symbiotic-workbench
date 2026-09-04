import process from "node:process";

if (!process.argv[2]) {
  process.argv[2] = "qa/single-subject-transition.json";
}

await import("./check-single-subject-transition.mjs");
