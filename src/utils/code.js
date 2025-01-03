import hljs from "highlight.js";
import { extname, parse, join, relative } from "path";

export function highlightCode(code, extension) {
  return extension
    ? hljs.highlight(code, { language: extension }).value
    : hljs.highlightAuto(code).value;
}

export function generateCodeSection(code, filePath, basePath = "") {
  const extension = extname(filePath).slice(1);
  const highlighted = highlightCode(code, extension);
  const relativePath = basePath
    ? join(parse(basePath).name, relative(basePath, filePath))
    : filePath;

  return {
    path: relativePath,
    extension,
    highlighted,
  };
}
