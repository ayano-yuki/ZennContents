// ---------------------------------------------------------
//
// generate-md.ts
// 実行コマンド:
//   /scrap内で以下のいずれかを実行（全体or単体）
//   pnpm exec node generate-md.ts
//   pnpm exec node generate-md.ts <input.json | input-directory>
// 
//   /で実行
//   pnpm run scrap:generate
//
// デフォルトでは ./json 内の JSON から ./ に Markdown を生成する
//
// ---------------------------------------------------------

const fs = require("node:fs") as typeof import("node:fs");
const path = require("node:path") as typeof import("node:path");

type ScrapComment = {
  author?: string;
  created_at?: string;
  body_markdown?: string;
  body_updated_at?: string;
};

type ScrapJson = {
  title?: string;
  created_at?: string;
  closed?: boolean;
  archived?: boolean;
  comments?: ScrapComment[];
};

const defaultInputDir = path.join(__dirname, "json");
const outputDir = __dirname;

function resolveInputPath(inputArg?: string): string {
  if (!inputArg) {
    return defaultInputDir;
  }

  return path.isAbsolute(inputArg)
    ? inputArg
    : path.resolve(process.cwd(), inputArg);
}

function getJsonFiles(inputPath: string): string[] {
  if (!fs.existsSync(inputPath)) {
    console.error(`File or directory not found: ${inputPath}`);
    process.exit(1);
  }

  const stat = fs.statSync(inputPath);

  if (stat.isDirectory()) {
    return fs
      .readdirSync(inputPath)
      .filter((fileName) => fileName.endsWith(".json"))
      .map((fileName) => path.join(inputPath, fileName))
      .sort();
  }

  if (!inputPath.endsWith(".json")) {
    console.error(`Input file must be a JSON file: ${inputPath}`);
    process.exit(1);
  }

  return [inputPath];
}

function buildMarkdown(json: ScrapJson): string {
  const title = json.title ?? "Untitled";
  const createdAt = json.created_at ?? "";
  const closed = json.closed ?? false;
  const archived = json.archived ?? false;
  const comments = Array.isArray(json.comments) ? json.comments : [];

  let markdown = `# ${title}\n\n`;
  markdown += `- Created at: ${createdAt}\n`;
  markdown += `- Closed: ${closed}\n`;
  markdown += `- Archived: ${archived}\n\n`;

  comments.forEach((comment) => {
    if (!comment.body_markdown) {
      return;
    }

    markdown += `---\n\n`;
    markdown += `${comment.body_markdown.trim()}\n\n`;
  });

  return markdown;
}

function convertJsonToMarkdown(inputPath: string): void {
  const raw = fs.readFileSync(inputPath, "utf-8");
  const json = JSON.parse(raw) as ScrapJson;
  const markdown = buildMarkdown(json);
  const outputPath = path.join(
    outputDir,
    `${path.basename(inputPath, ".json")}.md`,
  );

  fs.writeFileSync(outputPath, markdown, "utf-8");
  console.log(`Markdown file generated: ${outputPath}`);
}

const args = process.argv.slice(2);
const inputPath = resolveInputPath(args[0]);
const jsonFiles = getJsonFiles(inputPath);

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

if (jsonFiles.length === 0) {
  console.log(`No JSON files found: ${inputPath}`);
  process.exit(0);
}

jsonFiles.forEach((jsonFile) => {
  convertJsonToMarkdown(jsonFile);
});
