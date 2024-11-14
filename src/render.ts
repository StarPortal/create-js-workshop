import fs from "fs";
import path from "path";

export function renderTemplate(src: string, dest: string) {
  const stats = fs.statSync(src);

  if (stats.isDirectory()) {
    if (path.basename(src) === "node_modules") {
      return;
    }

    fs.mkdirSync(dest, { recursive: true });
    for (const item of fs.readdirSync(src)) {
      renderTemplate(path.resolve(src, item), path.resolve(dest, item));
    }
    return;
  }

  const filename = path.basename(src);

  if (filename.startsWith("_")) {
    dest = path.join(path.dirname(dest), filename.replace(/^_/, "."));
  }

  fs.copyFileSync(src, dest);
}
