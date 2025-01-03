import { promises as fs } from "fs";
import { parse } from "path";
import { config } from "./config.js";
import { isDirectory, findCodeFiles, loadTemplate } from "./src/utils/file.js";
import { generateCodeSection } from "./src/utils/code.js";

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

    // Load all required templates
    const [baseTemplate, codeSectionTemplate, tocTemplate] = await Promise.all([
      loadTemplate("base"),
      loadTemplate("code-section"),
      loadTemplate("toc"),
    ]);

    // Generate code sections
    const codeSections = await Promise.all(
      codeFiles.map(async (file) => {
        const code = await fs.readFile(file, config.encoding);
        const section = generateCodeSection(code, file, basePath);

        return codeSectionTemplate
          .replace(/{{FILE_PATH}}/g, section.path)
          .replace(/{{EXTENSION}}/g, section.extension)
          .replace(/{{CODE}}/g, section.highlighted);
      }),
    );

    // Generate table of contents if needed
    const toc = isDir
      ? tocTemplate
          .replace(/{{FOLDER_NAME}}/g, parse(input).name)
          .replace("{{FILE_COUNT}}", codeFiles.length.toString())
          .replace(
            "{{TOC_LINKS}}",
            codeFiles
              .map((file) => {
                const section = generateCodeSection("", file, basePath);
                return `<a href="#${section.path}">${section.path}</a>`;
              })
              .join("\n"),
          )
      : "";

    // Generate final HTML
    const html = baseTemplate
      .replace(
        "{{TITLE}}",
        `Code Listing${isDir ? ` - ${parse(input).name}` : ""}`,
      )
      .replace("{{TABLE_OF_CONTENTS}}", toc)
      .replace("{{CODE_SECTIONS}}", codeSections.join("\n"));

    const outputFile = `${parse(input).name}${config.outputSuffix}`;
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
