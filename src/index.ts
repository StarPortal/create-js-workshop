#!/usr/bin/env node

import fs from "fs";
import path from "path";

import prompts from "prompts";

async function init() {
  const options = await prompts([
    {
      type: "text",
      name: "name",
      message: "Project name?",
    },
    {
      type: "select",
      name: "template",
      message: "Choose a template",
      choices: [{ title: "Hello World", value: "hello-world" }],
    },
  ]);

  const projectName = options.name;
  const currentDir = process.cwd();
  const projectDir = path.join(currentDir, projectName);
  fs.mkdirSync(projectDir, { recursive: true });

  const templateName = options.template;
  const templateRoot = path.join(__dirname, "../templates");
  const templateDir = path.join(templateRoot, templateName);
  fs.cpSync(templateDir, projectDir, { recursive: true });

  const packageJsonPath = path.join(projectDir, "package.json");
  const packageJson = require(packageJsonPath);

  packageJson.name = projectName;
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

  console.log(`Project "${projectName}" created at ${projectDir}`);
}

init().catch((e) => {
  console.error(e);
});
