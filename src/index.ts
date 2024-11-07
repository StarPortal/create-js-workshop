#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const projectName = "hello-world";
const currentDir = process.cwd();
const projectDir = path.join(currentDir, projectName);
fs.mkdirSync(projectDir, { recursive: true });

const templateName = "hello-world";
const templateRoot = path.join(__dirname, '../templates');
const templateDir = path.join(templateRoot, templateName);
fs.cpSync(templateDir, projectDir, { recursive: true });

console.log(`Project "${projectName}" created at ${projectDir}`);
