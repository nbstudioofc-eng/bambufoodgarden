import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const requiredFiles = ["core.js", "observability.js", "runtime-config.js", "script.js", "index.html"];
const failures = [];
const files = Object.fromEntries(
  await Promise.all(requiredFiles.map(async (file) => [file, await readFile(resolve(root, file), "utf8")])),
);

if (/\b(?:window|document)\b/.test(files["core.js"])) failures.push("core.js must remain independent from browser DOM globals");

const order = ["runtime-config.js", "core.js", "observability.js", "script.js"].map((file) => files["index.html"].indexOf(file));
if (order.some((position) => position < 0) || order.some((position, index) => index > 0 && position <= order[index - 1])) {
  failures.push("Runtime scripts are missing or loaded outside the architecture contract order");
}

const secretPatterns = [/dsn:\s*["']https?:\/\//i, /apiKey:\s*["'][^"']+/i, /licenseKey:\s*["'][^"']+/i, /token:\s*["'][^"']+/i];
if (secretPatterns.some((pattern) => pattern.test(files["runtime-config.js"]))) failures.push("runtime-config.js appears to contain a credential");

if (failures.length > 0) {
  console.error(`Architecture contract failed:\n- ${failures.join("\n- ")}`);
  process.exitCode = 1;
} else console.log("Architecture contract passed.");
