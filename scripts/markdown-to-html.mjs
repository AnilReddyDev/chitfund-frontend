import fs from "node:fs";

const [, , inputPath, outputPath] = process.argv;

if (!inputPath || !outputPath) {
  throw new Error("Usage: node scripts/markdown-to-html.mjs input.md output.html");
}

const markdown = fs.readFileSync(inputPath, "utf8");

const escapeHtml = (value) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const inline = (value) =>
  escapeHtml(value)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

let body = "";
let inUl = false;
let inOl = false;
let inCode = false;
let code = "";
let tableRows = [];

function closeLists() {
  if (inUl) {
    body += "</ul>";
    inUl = false;
  }

  if (inOl) {
    body += "</ol>";
    inOl = false;
  }
}

function flushTable() {
  if (tableRows.length === 0) return;

  body += "<table>";
  tableRows.forEach((row, index) => {
    if (index === 1 && /^[- |]+$/.test(row)) return;

    const cells = row
      .split("|")
      .slice(1, -1)
      .map((cell) => inline(cell.trim()));

    if (index === 0) {
      body += `<thead><tr>${cells.map((cell) => `<th>${cell}</th>`).join("")}</tr></thead><tbody>`;
      return;
    }

    body += `<tr>${cells.map((cell) => `<td>${cell}</td>`).join("")}</tr>`;
  });
  body += "</tbody></table>";
  tableRows = [];
}

for (const line of markdown.split(/\r?\n/)) {
  if (line.startsWith("```")) {
    if (inCode) {
      body += `<pre><code>${escapeHtml(code.trimEnd())}</code></pre>`;
      code = "";
      inCode = false;
    } else {
      closeLists();
      flushTable();
      inCode = true;
    }
    continue;
  }

  if (inCode) {
    code += `${line}\n`;
    continue;
  }

  if (/^\|.*\|$/.test(line)) {
    closeLists();
    tableRows.push(line);
    continue;
  }

  flushTable();

  if (!line.trim()) {
    closeLists();
    continue;
  }

  const heading = line.match(/^(#{1,6})\s+(.*)$/);
  if (heading) {
    closeLists();
    const level = heading[1].length;
    body += `<h${level}>${inline(heading[2])}</h${level}>`;
    continue;
  }

  const ordered = line.match(/^\d+\.\s+(.*)$/);
  if (ordered) {
    if (!inOl) {
      closeLists();
      body += "<ol>";
      inOl = true;
    }
    body += `<li>${inline(ordered[1])}</li>`;
    continue;
  }

  const unordered = line.match(/^-\s+(.*)$/);
  if (unordered) {
    if (!inUl) {
      closeLists();
      body += "<ul>";
      inUl = true;
    }
    body += `<li>${inline(unordered[1])}</li>`;
    continue;
  }

  closeLists();
  body += `<p>${inline(line.trim())}</p>`;
}

closeLists();
flushTable();

const document = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>ChitFund User Onboarding Guide</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        line-height: 1.55;
        color: #0f172a;
        max-width: 920px;
        margin: 0 auto;
        padding: 36px;
        background: #fff;
      }

      h1 {
        font-size: 34px;
        margin: 0 0 8px;
        color: #111827;
      }

      h2 {
        font-size: 24px;
        margin-top: 34px;
        border-bottom: 1px solid #e5e7eb;
        padding-bottom: 8px;
        color: #111827;
      }

      h3 {
        font-size: 18px;
        margin-top: 24px;
        color: #1f2937;
      }

      p {
        margin: 10px 0;
      }

      ul,
      ol {
        padding-left: 24px;
      }

      li {
        margin: 6px 0;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        margin: 14px 0 22px;
        font-size: 14px;
      }

      th,
      td {
        border: 1px solid #e5e7eb;
        padding: 8px 10px;
        vertical-align: top;
      }

      th {
        background: #f8fafc;
        text-align: left;
      }

      code {
        background: #f1f5f9;
        padding: 2px 5px;
        border-radius: 4px;
      }

      pre {
        background: #0f172a;
        color: #f8fafc;
        padding: 14px;
        border-radius: 8px;
        overflow: auto;
      }

      .cover {
        border: 1px solid #e5e7eb;
        border-radius: 10px;
        padding: 24px;
        margin-bottom: 28px;
        background: #f8fafc;
      }

      .cover p {
        color: #475569;
      }

      @media print {
        body {
          padding: 20px;
          max-width: none;
        }

        h2 {
          break-after: avoid;
        }

        table,
        pre {
          break-inside: avoid;
        }
      }
    </style>
  </head>
  <body>
    <div class="cover">
      <h1>ChitFund User Onboarding Guide</h1>
      <p>A beginner-friendly guide for learning the application workflow, features, roles, and daily usage.</p>
    </div>
    ${body.replace("<h1>ChitFund User Onboarding Guide</h1>", "")}
  </body>
</html>`;

fs.writeFileSync(outputPath, document);
