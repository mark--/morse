import fs from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();
const configPath = path.join(rootDir, ".deploy", "sftp.config.json");
const dryRun = process.argv.includes("--dry-run");
const testConnection = process.argv.includes("--test-connection");

function toPosix(value) {
  return value.split(path.sep).join("/");
}

async function readConfig() {
  const raw = await fs.readFile(configPath, "utf8");
  return JSON.parse(raw);
}

function validateConfig(config) {
  const required = ["host", "username", "remotePath"];
  for (const key of required) {
    if (!config[key] || String(config[key]).trim() === "") {
      throw new Error(`Missing required config field: ${key}`);
    }
  }
  if (!config.password && !config.privateKeyPath) {
    throw new Error("Provide either password or privateKeyPath in .deploy/sftp.config.json");
  }
}

async function exists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function listFiles(basePath) {
  const result = [];
  const stat = await fs.stat(basePath);
  if (stat.isFile()) {
    result.push(basePath);
    return result;
  }

  const entries = await fs.readdir(basePath, { withFileTypes: true });
  for (const entry of entries) {
    const next = path.join(basePath, entry.name);
    if (entry.isDirectory()) {
      const nested = await listFiles(next);
      result.push(...nested);
    } else if (entry.isFile()) {
      result.push(next);
    }
  }
  return result;
}

async function collectFiles(config) {
  const localRoot = path.resolve(rootDir, config.localRoot || ".");
  const paths = Array.isArray(config.paths) && config.paths.length
    ? config.paths
    : ["index.html", "styles", "js", "data", "docs"];

  const files = [];
  for (const relativePath of paths) {
    const resolved = path.resolve(localRoot, relativePath);
    if (!(await exists(resolved))) {
      console.warn(`Skip missing path: ${relativePath}`);
      continue;
    }
    const listed = await listFiles(resolved);
    for (const filePath of listed) {
      const relativeToRoot = path.relative(localRoot, filePath);
      files.push({
        localPath: filePath,
        relativePath: toPosix(relativeToRoot)
      });
    }
  }

  const unique = new Map();
  for (const file of files) {
    unique.set(file.relativePath, file);
  }
  return Array.from(unique.values()).sort((a, b) => a.relativePath.localeCompare(b.relativePath));
}

async function connectSftp(config) {
  const { default: SftpClient } = await import("ssh2-sftp-client");
  const client = new SftpClient();

  const connectOptions = {
    host: config.host,
    port: Number(config.port || 22),
    username: config.username
  };

  if (config.password) {
    connectOptions.password = config.password;
  }

  if (config.privateKeyPath) {
    connectOptions.privateKey = await fs.readFile(path.resolve(rootDir, config.privateKeyPath), "utf8");
    if (config.passphrase) {
      connectOptions.passphrase = config.passphrase;
    }
  }

  await client.connect(connectOptions);
  return client;
}

async function ensureRemoteDir(client, dirPath) {
  const normalized = toPosix(dirPath);
  await client.mkdir(normalized, true);
}

async function uploadFiles(config, files) {
  const client = await connectSftp(config);
  try {
    const remoteRoot = toPosix(config.remotePath);
    await ensureRemoteDir(client, remoteRoot);

    for (const file of files) {
      const remoteFile = `${remoteRoot}/${file.relativePath}`;
      const remoteDir = remoteFile.substring(0, remoteFile.lastIndexOf("/"));
      await ensureRemoteDir(client, remoteDir);
      await client.fastPut(file.localPath, remoteFile);
      console.log(`Uploaded: ${file.relativePath}`);
    }
  } finally {
    await client.end();
  }
}

async function testSftp(config) {
  const client = await connectSftp(config);
  try {
    const remoteRoot = toPosix(config.remotePath);
    await ensureRemoteDir(client, remoteRoot);
    const list = await client.list(remoteRoot);
    console.log(`Connection OK. Remote path accessible: ${remoteRoot}`);
    console.log(`Entries found: ${list.length}`);
  } finally {
    await client.end();
  }
}

async function main() {
  const config = await readConfig();
  const files = await collectFiles(config);

  if (files.length === 0) {
    throw new Error("No files found for deployment. Check 'paths' in sftp.config.json");
  }

  console.log(`Planned files: ${files.length}`);

  if (dryRun) {
    for (const file of files) {
      console.log(`- ${file.relativePath}`);
    }
    return;
  }

  validateConfig(config);

  if (testConnection) {
    await testSftp(config);
    return;
  }

  await uploadFiles(config, files);
  console.log("Deploy completed.");
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
