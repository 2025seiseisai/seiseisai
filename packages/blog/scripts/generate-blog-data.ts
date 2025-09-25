import * as fs from "fs";
import graymatter from "gray-matter";
import * as path from "path";

const cwd = path.join(__dirname, "..");
process.chdir(cwd);
let imageCnt = 0;
let imageImport = "";
let blogData = "export const blogDataRaw = {\n";
let resourceSize = "export const resourceSize: Readonly<Record<string, number>> = {\n";
const removeAlt = /^(!\[([^\]]+)\]\(([^)]+)\))\s*\r?\n([^\r\n]+)\s*$/gm;
const tweetLinkPattern = /^\[(https?:\/\/(?:x\.com|twitter\.com)\/[a-zA-Z0-9_]+\/status\/\d+)\]\(\1\)$/;
const detectStrong = /\*\*(.*?)\*\*/g;
for (const round of await fs.promises.readdir(path.join(cwd, "blog-assets"))) {
    if (
        !(await fs.promises.stat(path.join(cwd, "blog-assets", round))).isDirectory() ||
        (!Number.isInteger(Number(round)) && round !== "test")
    )
        continue;
    const folderPath = path.join(cwd, "blog-assets", round);
    for (const index of await fs.promises.readdir(folderPath)) {
        if (!(await fs.promises.stat(path.join(folderPath, index))).isDirectory()) {
            console.log(`WARNING: ${path.join(folderPath, index)} is not a directory`);
            continue;
        }
        let thumbnail = undefined;
        const images = [];
        for (const file of await fs.promises.readdir(path.join(folderPath, index))) {
            if (
                file.endsWith(".png") ||
                file.endsWith(".jpg") ||
                file.endsWith(".jpeg") ||
                file.endsWith(".webp") ||
                file.endsWith(".avif")
            ) {
                imageImport += `import Image${imageCnt} from "../blog-assets/${round}/${index}/${file}";\n`;
                if (file.split(".")[0] === "thumbnail") {
                    if (thumbnail !== undefined) {
                        console.log(`WARNING: ${path.join(folderPath, index)} has multiple thumbnail images`);
                    }
                    thumbnail = [file, imageCnt, file];
                } else {
                    images.push([file, imageCnt]);
                }
                imageCnt += 1;
            } else if (file !== "index.md" && file !== "index.mdx") {
                resourceSize += `    "${round}/${index}/${file}": ${(await fs.promises.stat(`./blog-assets/${round}/${index}/${file}`)).size},\n`;
            }
        }
        if (thumbnail === undefined) {
            console.log(`WARNING: ${path.join(folderPath, index)} does not have a thumbnail image`);
        }
        // Support both index.md and index.mdx
        const mdFilePath = path.join(folderPath, index, "index.md");
        if (!fs.existsSync(mdFilePath)) {
            console.log(`WARNING: ${path.join(folderPath, index)} does not have index.md`);
            continue;
        }
        const filestr = await fs.promises.readFile(mdFilePath, "utf-8");
        const result = graymatter(filestr);
        const data = result.data;
        let content = result.content;
        content = content.replaceAll("\r\n", "\n").replaceAll("\r", "\n");
        content = content.replaceAll(removeAlt, (match, md, alt1, url, alt2) => {
            if (alt2.replace(/\s+/g, "") === alt1.replace(/\s+/g, "")) {
                return `![$${alt1}](${url})\n`;
            } else {
                return `![${alt1}](${url})\n`;
            }
        });
        content = content.replaceAll(detectStrong, (match, text) => {
            return ` **${text}** `;
        });
        if (!content.includes("\n# 目次\n")) {
            console.log(`WARNING: ${path.join(folderPath, index)} does not have a table of contents`);
            content = "\n# 目次\n" + content;
        }
        const twitterEmbedded = (() => {
            const lines = content.split("\n");
            for (let i = 0; i < lines.length; ++i) {
                if (
                    tweetLinkPattern.test(lines[i].trim()) &&
                    (i == 0 || lines[i - 1].trim() === "") &&
                    (i == lines.length - 1 || lines[i + 1].trim()) === ""
                ) {
                    return true;
                }
            }
            return false;
        })();
        const [description, main_text] = content.split("\n# 目次\n");
        if (round === "test") {
            blogData += `    ...(process.env.NODE_ENV === "development"
        ? {
              "${round}/${index}": {
                  title: \`${data.title}\`,
                  date: \`${data.date}\`,
                  author: \`${data.author}\`,
                  topic: \`${data.topic}\`,
                  thumbnail: ${thumbnail !== undefined ? `Image${thumbnail[1]}` : "undefined"},
                  thumbnailPath: \`${thumbnail !== undefined ? `src/blogs/${round}/${index}/${thumbnail[2]}` : "undefined"}\`,
                  images: ${images.length !== 0 ? `{${images.map((image) => `\n                      "${encodeURIComponent(image[0])}": Image${image[1]},`).join("")}\n                  }` : `{}`},
                  twitterEmbedded: ${twitterEmbedded},
                  description: \`${description}\`,
                  content: \`${main_text}\`,
              },
          }
        : {}),
`;
        } else {
            blogData += `    "${round}/${index}": {
        title: \`${data.title}\`,
        date: \`${data.date}\`,
        author: \`${data.author}\`,
        topic: \`${data.topic}\`,
        thumbnail: ${thumbnail !== undefined ? `Image${thumbnail[1]}` : "undefined"},
        thumbnailPath: \`${thumbnail !== undefined ? `src/blogs/${round}/${index}/${thumbnail[2]}` : "undefined"}\`,
        images: ${images.length !== 0 ? `{${images.map((image) => `\n            "${encodeURIComponent(image[0])}": Image${image[1]},`).join("")}\n        }` : `{}`},
        twitterEmbedded: ${twitterEmbedded},
        description: \`${description}\`,
        content: \`${main_text}\`,
    },
`;
        }
    }
}
blogData += `} as const;
export type BlogKey = keyof typeof blogDataRaw;
export const blogData: Readonly<
    Record<
        string,
        Readonly<{
            title: string;
            date: string;
            author: string;
            topic: string;
            thumbnail: StaticImageData;
            thumbnailPath: string;
            images: Readonly<Record<string, StaticImageData>>;
            twitterEmbedded: boolean;
            description: string;
            content: string;
        }>
    >
> = blogDataRaw;
`;
resourceSize += "};\n";
const result =
    `// ===================================================================================\n` +
    `// This file is auto-generated by generate-blog-data.ts. Do not edit this file directly.\n` +
    `// ===================================================================================\n\n` +
    `import type { StaticImageData } from "next/image";\n` +
    imageImport +
    blogData +
    resourceSize;
await fs.promises.writeFile(path.join(cwd, "src", "data.ts"), result, "utf-8");
console.log("Blog data generated successfully.");
