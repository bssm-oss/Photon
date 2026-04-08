#!/usr/bin/env node

import { readFileSync, writeFileSync, mkdirSync, cpSync, existsSync } from "fs";
import { resolve, join } from "path";
import { execSync } from "child_process";

const args = process.argv.slice(2);
const projectName = args[0] || "my-ion-game";
const template = args.includes("--tauri") ? "tauri"
  : args.includes("--electron") ? "electron"
  : "browser";

const cwd = resolve(projectName);

if (existsSync(cwd)) {
  console.error(`Directory "${projectName}" already exists.`);
  process.exit(1);
}

console.log(`\n  Creating Ion Engine project: ${projectName}`);
console.log(`  Template: ${template}\n`);

mkdirSync(cwd, { recursive: true });

const templatesDir = resolve(import.meta.dirname || __dirname, "..", "templates", template);
cpSync(templatesDir, cwd, { recursive: true });

const pkgJson = JSON.parse(
  readFileSync(join(cwd, "package.json"), "utf-8")
);
pkgJson.name = projectName;
delete pkgJson.private;
writeFileSync(join(cwd, "package.json"), JSON.stringify(pkgJson, null, 2));

console.log("  Installing dependencies...\n");
execSync(`npm install`, { cwd, stdio: "inherit" });

console.log(`\n  Done! Run:\n`);
console.log(`    cd ${projectName}`);
console.log(`    npm run dev\n`);
