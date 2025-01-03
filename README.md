# Make Code Listing (MCL)

Make Code Listing (MCL) is a command-line tool built with Node.js that
transforms source code files and directories into well-formatted HTML listings.
This tool simplifies the process of creating documentation by generating
syntax-highlighted code listings with organized navigation.

## Features

Make Code Listing provides a comprehensive set of features for generating code
documentation:

The tool automatically generates HTML files with syntax highlighting for your
source code. When processing directories, it creates a table of contents for
easy navigation through multiple files. The output is responsive and optimized
for readability across different devices.

The generated HTML includes syntax highlighting for multiple programming
languages, proper code formatting, and a clean, professional design that works
well for documentation purposes.

## Installation

To set up Make Code Listing on your system, follow these steps:

1. Clone the repository to your local machine
2. Install the required dependencies:

```bash
npm install
```

## Usage

Execute Make Code Listing using npm with the following syntax:

```bash
npm start -- <input-path>
```

You can use MCL in two ways:

For a single file:

```bash
npm start -- ./src/index.js
```

For an entire directory:

```bash
npm start -- ./src
```

The tool generates an HTML file named after your input with the suffix
"-code.html".

## Supported File Types

Make Code Listing provides syntax highlighting support for the following file
extensions:

- JavaScript (.js, .jsx)
- TypeScript (.ts, .tsx)
- Python (.py)
- Java (.java)
- HTML (.html)
- CSS (.css)

You can extend support for additional file types by modifying the configuration
in `src/config.js`.

## Project Structure

The project maintains a clear and organized structure:

```
src/
  templates/          # HTML template files
    base.html         # Main document template
    code-section.html # Code section template
    toc.html          # Navigation template
  utils/
    file.js           # File handling operations
    code.js           # Syntax highlighting logic
config.js             # Configuration settings
index.js              # Application entry point
```

## Customization

Make Code Listing supports customization through its template system. You can
modify the HTML templates located in the `src/templates` directory to adjust the
output format and styling. The templates use a straightforward {{PARAMETER}}
syntax for dynamic content insertion.

## License

This project is licensed under the MIT License.
