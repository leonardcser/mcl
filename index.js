import { promises as fs } from "fs";
import { extname, parse, join, relative } from "path";
import hljs from "highlight.js";

async function isDirectory(path) {
  const stats = await fs.stat(path);
  return stats.isDirectory();
}

async function findCodeFiles(
  dir,
  extensions = [".js", ".ts", ".py", ".java", ".html", ".css", ".jsx", ".tsx"],
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

async function generateCodeSection(filePath, basePath = "") {
  const code = await fs.readFile(filePath, "utf-8");
  const extension = extname(filePath).slice(1);
  const highlighted = extension
    ? hljs.highlight(code, { language: extension }).value
    : hljs.highlightAuto(code).value;

  const relativePath = basePath
    ? join(parse(basePath).name, relative(basePath, filePath))
    : filePath;

  return `
    <div class="file-section">
        <h2 id="${relativePath}" class="file-heading">${relativePath}</h2>
        <div class="code-container">
            <pre><code class="hljs ${extension}">${highlighted}</code></pre>
        </div>
    </div>`;
}

async function renderCodeToHTML(input) {
  try {
    const isDir = await isDirectory(input);
    let codeFiles = [];
    let basePath = "";

    if (isDir) {
      basePath = input;
      codeFiles = await findCodeFiles(input);
      if (codeFiles.length === 0) {
        throw new Error("No code files found in the specified directory");
      }
    } else {
      codeFiles = [input];
    }

    const codeSections = await Promise.all(
      codeFiles.map((file) => generateCodeSection(file, basePath)),
    );

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Code Listing${isDir ? ` - ${parse(input).name}` : ""}</title>
    <style>
        body {
            margin: 0;
            padding: 2rem;
            background: white;
            color: black;
            font-family: monospace;
        }
        .file-section {
            max-width: 900px;
            margin: 2rem auto;
        }
        .file-heading {
            padding-top: 1rem;
            margin: 0;
            font-size: 8pt;
        }
        .code-container {
            overflow: hidden;
        }
        pre {
            margin: 0;
            padding: 0.5rem;
        }
        code {
            font-family: Consolas, monospace;
            font-size: 7pt;
        }
        #table-of-contents {
            max-width: 900px;
            margin: 0 auto 2rem auto;
        }
        #table-of-contents h1 {
            margin-top: 0;
            margin-bottom: 1.25rem;
            font-size: 14pt;
        }
        #table-of-contents h2 {
            margin-top: 0;
            font-size: 8pt;
        }
        #table-of-contents a {
            display: block;
            text-decoration: none;
            color: black;
            font-size: 7pt;
            margin: 0;
            margin-bottom: 0.4rem;
        }

        .hljs {
          background: white;
          color: black;
        }

        .hljs-comment,
        .hljs-quote,
        .hljs-variable {
          color: #008000;
        }

        .hljs-keyword,
        .hljs-selector-tag,
        .hljs-built_in,
        .hljs-name,
        .hljs-tag {
          color: #00f;
            font-weight: bold;
        }

        .hljs-string,
        .hljs-title,
        .hljs-section,
        .hljs-attribute,
        .hljs-literal,
        .hljs-template-tag,
        .hljs-template-variable,
        .hljs-type,
        .hljs-addition {
          color: #a31515;
        }
        .hljs-title {
            font-weight: bold;
        }

        .hljs-deletion,
        .hljs-selector-attr,
        .hljs-selector-pseudo,
        .hljs-meta {
          color: #2b91af;
        }

        .hljs-doctag {
          color: black;
            font-weight: 600;
        }

        .hljs-attr {
          color: #f00;
        }

        .hljs-symbol,
        .hljs-bullet,
        .hljs-link {
          color: #00b0e8;
        }

        .hljs-emphasis {
          font-style: italic;
        }

        .hljs-strong {
          font-weight: bold;
        }
    </style>
</head>
<body>
    ${
      isDir
        ? `
    <div id="table-of-contents">
        <h1>Folder ${parse(input).name}</h1>
        <h2>${codeFiles.length} printable files</h2>
            ${codeFiles
              .map((file) => {
                const relativePath = join(
                  parse(basePath).name,
                  relative(basePath, file),
                );
                return `<a href="#${relativePath}">${relativePath}</a>`;
              })
              .join("\n")}
    </div>
    `
        : ""
    }
    ${codeSections.join("\n")}
</body>
</html>`;

    const outputFile = `${parse(input).name}-code.html`;
    await fs.writeFile(outputFile, html);

    console.log(
      `Successfully rendered ${isDir ? "directory" : "file"} to ${outputFile}`,
    );
    return outputFile;
  } catch (error) {
    console.error("Error rendering code:", error);
    throw error;
  }
}

const input = process.argv[2];
if (!input) {
  console.error("Please provide an input file or directory path");
  process.exit(1);
}

renderCodeToHTML(input).catch((error) => {
  console.error(error);
  process.exit(1);
});
