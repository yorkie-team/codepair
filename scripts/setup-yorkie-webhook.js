#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const YORKIE_API_ADDR = process.env.YORKIE_API_ADDR || "localhost:8080";
const YORKIE_PROJECT_NAME = process.env.YORKIE_PROJECT_NAME || "codepair";
const YORKIE_USERNAME = process.env.YORKIE_USERNAME || "admin";
const YORKIE_PASSWORD = process.env.YORKIE_PASSWORD || "admin";
const WEBHOOK_URL =
  process.env.WEBHOOK_URL ||
  "http://localhost:3000/yorkie/document-events";
const BACKEND_ENV_FILE =
  process.env.BACKEND_ENV_FILE ||
  path.join(__dirname, "..", "packages", "backend", ".env.development");
const FRONTEND_ENV_FILE =
  process.env.FRONTEND_ENV_FILE ||
  path.join(__dirname, "..", "packages", "frontend", ".env.development");

function execCommand(command) {
  try {
    return execSync(command, {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    });
  } catch (error) {
    throw new Error(
      `Command failed: ${command}\n${error.stderr || error.message}`,
    );
  }
}

async function setupYorkieWebhook() {
  console.log("🔧 Setting up Yorkie webhook...");

  try {
    // Check if yorkie CLI is installed
    try {
      execSync("which yorkie", { stdio: "ignore" });
    } catch {
      console.error("❌ Yorkie CLI is not installed");
      console.error(
        "💡 Install it with: brew tap yorkie-team/yorkie && brew install yorkie",
      );
      console.error(
        "   Or download from: https://github.com/yorkie-team/yorkie/releases",
      );
      process.exit(1);
    }

    // Login to Yorkie
    console.log(`🔑 Logging in to Yorkie (${YORKIE_API_ADDR})...`);
    execCommand(
      `yorkie login -u ${YORKIE_USERNAME} -p ${YORKIE_PASSWORD} --insecure --rpc-addr ${YORKIE_API_ADDR}`,
    );
    console.log("✅ Logged in successfully");

    // Get project info
    console.log(`📡 Fetching project '${YORKIE_PROJECT_NAME}' information...`);
    const projectListOutput = execCommand(
      "yorkie project ls --verbose --output json",
    );

    // Parse JSON output
    let projects;
    try {
      projects = JSON.parse(projectListOutput);
    } catch (error) {
      console.error("❌ Failed to parse project list JSON:");
      console.error(projectListOutput);
      throw error;
    }

    // Find the target project
    let project = projects.find((p) => p.name === YORKIE_PROJECT_NAME);

    if (!project) {
      console.log(`📦 Project '${YORKIE_PROJECT_NAME}' not found. Creating...`);
      try {
        execCommand(`yorkie project create ${YORKIE_PROJECT_NAME}`);
        console.log(`✅ Project '${YORKIE_PROJECT_NAME}' created successfully`);

        // Fetch project list again to get the new project
        const updatedProjectListOutput = execCommand(
          "yorkie project ls --verbose --output json",
        );
        projects = JSON.parse(updatedProjectListOutput);
        project = projects.find((p) => p.name === YORKIE_PROJECT_NAME);

        if (!project) {
          console.error(
            `❌ Failed to find newly created project '${YORKIE_PROJECT_NAME}'`,
          );
          process.exit(1);
        }
      } catch (error) {
        console.error(`❌ Failed to create project '${YORKIE_PROJECT_NAME}'`);
        console.error(error.message);
        process.exit(1);
      }
    } else {
      console.log(`✅ Project '${YORKIE_PROJECT_NAME}' found`);
    }

    const secretKey = project.secret_key;
    const publicKey = project.public_key;

    if (!secretKey) {
      console.error("❌ Secret key not found in project data");
      console.error("Project data:", JSON.stringify(project, null, 2));
      process.exit(1);
    }

    if (!publicKey) {
      console.error("❌ Public key not found in project data");
      console.error("Project data:", JSON.stringify(project, null, 2));
      process.exit(1);
    }

    console.log(
      `✅ Project secret key retrieved: ${secretKey.substring(0, 10)}...`,
    );
    console.log(
      `✅ Project public key retrieved: ${publicKey.substring(0, 10)}...`,
    );

    // Update webhook using CLI (only if different from current)
    const currentWebhookUrl = project.event_webhook_url || "";
    if (currentWebhookUrl !== WEBHOOK_URL) {
      console.log(`🔗 Setting webhook URL: ${WEBHOOK_URL}`);
      execCommand(
        `yorkie project update ${YORKIE_PROJECT_NAME} --event-webhook-url "${WEBHOOK_URL}" --event-webhook-events-add "DocumentRootChanged"`,
      );
      console.log(
        "✅ Webhook configured successfully with DocumentRootChanged event",
      );
    } else {
      console.log(`✅ Webhook URL already set: ${WEBHOOK_URL}`);
      console.log(
        `🔗 Updating webhook methods to include DocumentRootChanged...`,
      );
      execCommand(
        `yorkie project update ${YORKIE_PROJECT_NAME} --event-webhook-events-add "DocumentRootChanged"`,
      );
      console.log("✅ Webhook methods updated");
    }

    // Update .env file
    console.log(`📝 Updating ${BACKEND_ENV_FILE}...`);

    let envContent = "";
    if (fs.existsSync(BACKEND_ENV_FILE)) {
      envContent = fs.readFileSync(BACKEND_ENV_FILE, "utf8");
    } else {
      const templatePath = path.join(__dirname, "..", "packages", "backend", ".env");
      if (fs.existsSync(templatePath)) {
        envContent = fs.readFileSync(templatePath, "utf8");
      }
    }

    const secretKeyLine = `YORKIE_PROJECT_SECRET_KEY="${secretKey}"`;
    if (envContent.includes("YORKIE_PROJECT_SECRET_KEY=")) {
      envContent = envContent.replace(
        /^YORKIE_PROJECT_SECRET_KEY=.*/m,
        secretKeyLine,
      );
    } else {
      envContent += `\n${secretKeyLine}\n`;
    }

    fs.writeFileSync(BACKEND_ENV_FILE, envContent);
    console.log("✅ Backend .env file updated");

    // Update frontend .env file
    console.log(`📝 Updating ${FRONTEND_ENV_FILE}...`);

    let frontendEnvContent = "";
    if (fs.existsSync(FRONTEND_ENV_FILE)) {
      frontendEnvContent = fs.readFileSync(FRONTEND_ENV_FILE, "utf8");
    }

    const publicKeyLine = `VITE_YORKIE_API_KEY="${publicKey}"`;
    if (frontendEnvContent.includes("VITE_YORKIE_API_KEY=")) {
      frontendEnvContent = frontendEnvContent.replace(
        /^VITE_YORKIE_API_KEY=.*/m,
        publicKeyLine,
      );
    } else {
      frontendEnvContent += `\n${publicKeyLine}\n`;
    }

    fs.writeFileSync(FRONTEND_ENV_FILE, frontendEnvContent);
    console.log("✅ Frontend .env file updated");

    console.log("\n✨ Setup complete!");
    console.log("\n📋 Next steps:");
    console.log("  1. Start backend: pnpm backend start:dev");
    console.log("  2. Start frontend: pnpm frontend dev");
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error("\n💡 Make sure:");
    console.error("  - Yorkie CLI is installed");
    console.error("  - Docker containers are running");
    console.error(`  - Yorkie server is accessible at ${YORKIE_API_ADDR}`);
    console.error(
      `  - Login credentials are correct (${YORKIE_USERNAME}:${YORKIE_PASSWORD})`,
    );
    process.exit(1);
  }
}

setupYorkieWebhook();
