import { promises as fs } from "fs";
import { extname, join, dirname } from "path";
import { fileURLToPath } from "url";
import { config } from "../../config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, "..", "..");

export async function isDirectory(path) {
  const stats = await fs.stat(path);
  return stats.isDirectory();
}

export async function findCodeFiles(
  dir,
  extensions = config.supportedExtensions,
) {
  const files = await fs.readdir(dir);
  const codeFiles = [];

  for (const file of files) {
    const fullPath = join(dir, file);
    const stats = await fs.stat(fullPath);

    if (stats.isDirectory()) {
      const nestedFiles = await findCodeFiles(fullPath, extensions);
      codeFiles.push(...nestedFiles);
    } else if (extensions.includes(extname(file).toLowerCase())) {
      codeFiles.push(fullPath);
    }
  }

  return codeFiles;
}

export async function loadTemplate(templateName) {
  const templatePath = join(
    PROJECT_ROOT,
    "src",
    "templates",
    `${templateName}.html`,
  );
  return await fs.readFile(templatePath, config.encoding);
}
