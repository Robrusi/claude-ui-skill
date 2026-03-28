type CommandResult = {
  status: number;
  stdout: string;
  stderr: string;
};

function runCapture(command: string, args: string[], cwd = process.cwd()): CommandResult {
  const result = Bun.spawnSync([command, ...args], {
    cwd,
    env: process.env,
    stdout: "pipe",
    stderr: "pipe",
  });

  return {
    status: result.exitCode,
    stdout: result.stdout?.toString() ?? "",
    stderr: result.stderr?.toString() ?? "",
  };
}

function runPassthrough(command: string, args: string[], cwd = process.cwd()): number {
  const result = Bun.spawnSync([command, ...args], {
    cwd,
    env: process.env,
    stdout: "inherit",
    stderr: "inherit",
  });

  return result.exitCode;
}

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

function isLoggedInAuthStatus(output: string): boolean {
  try {
    const parsed = JSON.parse(output) as { loggedIn?: boolean };
    return parsed.loggedIn === true;
  } catch {
    return false;
  }
}

const userRequest = process.argv.slice(2).join(" ").trim();

if (!userRequest) {
  fail("Missing user request.");
}

const gitCheck = runCapture("git", ["rev-parse", "--show-toplevel"]);
if (gitCheck.status !== 0) {
  fail(
    "This skill must run inside the current Git checkout so Codex can show the diff."
  );
}

const repoRoot = gitCheck.stdout.trim();

if (!repoRoot) {
  fail("Could not determine the current Git repository root.");
}

const claudeVersion = runCapture("claude", ["--version"], repoRoot);
if (claudeVersion.status !== 0) {
  fail(
    "Claude Code CLI is not available. Install it and make sure `claude` is on PATH."
  );
}

const claudeAuth = runCapture("claude", ["auth", "status"], repoRoot);
if (claudeAuth.status !== 0 || !isLoggedInAuthStatus(claudeAuth.stdout)) {
  fail(
    [
      "Claude Code CLI auth is not available in this execution context.",
      "If `claude` works in your normal terminal, rerun this Bun command outside the Codex sandbox so it can use your existing local Claude login.",
      "Otherwise run `claude auth login` first.",
    ].join(" ")
  );
}

const prompt = [
  "You are working inside the current repository checkout.",
  "Inspect the repository yourself before making changes.",
  "Apply the requested UI change directly to files in this working tree.",
  "If you need to run package scripts or install dependencies, use Bun rather than npm.",
  "Keep the scope minimal and focused on the user's request.",
  "Do not return patches for someone else to apply unless you cannot edit files directly.",
  "",
  "User request:",
  userRequest,
].join("\n");

const claudeArgs = [
  "--print",
  prompt,
  "--allowedTools",
  "Bash,Read,Edit,Write,MultiEdit,Glob,Grep,LS",
  "--permission-mode",
  "acceptEdits",
  "--no-session-persistence",
];

console.log("Running Claude Code in:", repoRoot);
console.log("Delegated request:", userRequest);
console.log("");

const claudeExitCode = runPassthrough("claude", claudeArgs, repoRoot);

if (claudeExitCode !== 0) {
  process.exit(claudeExitCode);
}

const trackedChangedFiles = runCapture("git", ["diff", "--name-only", "--"], repoRoot);
const diffStat = runCapture("git", ["diff", "--stat", "--"], repoRoot);
const untrackedFiles = runCapture(
  "git",
  ["ls-files", "--others", "--exclude-standard"],
  repoRoot
);
const status = runCapture("git", ["status", "--short"], repoRoot);

console.log("");
console.log("Git status after Claude run:");
console.log(status.stdout.trim() || "(no changes)");

console.log("");
console.log("Changed files:");
console.log(trackedChangedFiles.stdout.trim() || "(no tracked file changes)");

console.log("");
console.log("Untracked files:");
console.log(untrackedFiles.stdout.trim() || "(no untracked files)");

console.log("");
console.log("Tracked diff stat:");
console.log(diffStat.stdout.trim() || "(no diff stat available)");
