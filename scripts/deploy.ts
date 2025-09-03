import { execSync } from "child_process";

function runCommand(cmd: string, errorMsg: string, captureOutput = false) {
    try {
        console.log(`▶️ Running: ${cmd}`);
        if (captureOutput) {
            // 出力をキャプチャし、文字列として返す
            return execSync(cmd, { encoding: "utf-8" });
        } else {
            // コマンドの出力を直接コンソールに表示する
            execSync(cmd, { stdio: "inherit" });
            return undefined;
        }
    } catch {
        console.error(`❌ ${errorMsg}`);
        process.exit(1);
    }
}

if (process.argv.length < 3) {
    console.log("Usage: node deploy.mjs <branch-name>");
    process.exit(1);
}

const branch = process.argv[2];

console.log(`▶️ Switching to branch: ${branch}`);
runCommand("git fetch origin", "Failed to fetch origin");
runCommand(`git checkout ${branch}`, `Failed to checkout branch ${branch}`);
runCommand("git stash", "Failed to stash changes");
runCommand(`git pull origin ${branch}`, `Failed to pull latest changes from ${branch}`);

console.log("📦 Installing dependencies...");
runCommand("bun install", "bun install failed");

console.log("🔄 Running Prisma db push...");
runCommand("bun --bun run prisma:db-push --force", "Prisma db push failed");

console.log("🔨 Building project...");
runCommand("bun --bun run build --force", "Build failed");

console.log("🚀 Deploying with PM2...");
const pm2List = runCommand("pm2 list", "Failed to list PM2 processes", true);

if (pm2List && pm2List.includes(" seiseisai ")) {
    console.log("🔁 Restarting existing process: seiseisai");
    runCommand("pm2 restart seiseisai", "Failed to restart the project");
} else {
    console.log("🚀 Starting new process: seiseisai");
    runCommand('pm2 start bun --name "seiseisai" -- --bun run start', "Failed to start the project");
}

console.log(`✅ Deployment to branch ${branch} completed successfully!`);
