#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { parseArgs } from "node:util";
import childProcess from "child_process";
import prompts from "prompts";

import { Config } from "./config";

function getPackageManager() {
  const userAgent = process.env.npm_config_user_agent ?? "";
  if (/pnpm/.test(userAgent)) {
    return "pnpm";
  }

  if (/yarn/.test(userAgent)) {
    return "yarn";
  }

  return "npm";
}

function runCommand(cmd: string, args: string[], cwd: string) {
  return new Promise<void>((resolve, reject) => {
    const child = childProcess.spawn(cmd, args, {
      cwd,
      stdio: "inherit",
      shell: true,
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });
  });
}

async function init() {
  const args = process.argv.slice(2);
  const options = {
    template: { type: "string", alias: "t" },
  } as const;

  const { values: argv, positionals } = parseArgs({
    args,
    options,
    strict: false,
  });

  let targetDir = positionals[0];
  const defaultProjectName = !targetDir ? "workshop" : targetDir;

  let config: Config = {};
  try {
    config = await prompts(
      [
        {
          type: targetDir ? null : "text",
          name: "projectName",
          message: "Project name?",
          onState: (state) =>
            (targetDir = String(state.value).trim() || defaultProjectName),
        },
        {
          type: argv.template ? null : "select",
          name: "template",
          message: "Choose a template",
          choices: [
            {
              title: "Hello World",
              value: "hello-world",
            },
          ],
        },
      ],
      {
        onCancel: () => {
          throw new Error("Cancelled");
        },
      },
    );
  } catch (cancelled: any) {
    console.log(cancelled.message);
    process.exit(1);
  }

  const packageManager = getPackageManager();

  const projectName = config.projectName ?? defaultProjectName;
  const currentDir = process.cwd();
  const projectDir = path.join(currentDir, projectName);
  fs.mkdirSync(projectDir, { recursive: true });

  const defaultTemplate = "hello-world";
  const templateName =
    (argv.template as string) ?? config.template ?? defaultTemplate;
  const templateRoot = path.join(__dirname, "../templates");
  const templateDir = path.join(templateRoot, templateName);

  try {
    fs.accessSync(templateDir);
  } catch (e) {
    console.error(`Template "${templateName}" not found`);
    process.exit(1);
  }
  fs.cpSync(templateDir, projectDir, { recursive: true });

  const packageJsonPath = path.join(projectDir, "package.json");
  const packageJson = require(packageJsonPath);

  packageJson.name = projectName;
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

  console.log(`Installing dependencies...`);
  await runCommand(packageManager, ["install"], projectDir);

  console.log(`Project "${projectName}" created at ${projectDir}`);
}

init().catch((e) => {
  console.error(e);
});
