# CMatrixLab — Windows setup

For someone setting up this project on a new Windows computer.

**Reviewed:** 26 October 2026. **Project baseline:** branch `predev`, commit `23647b8`. The repository's default branch is `master`, which contains a different version. The commands below explicitly select `predev`.

## 1. What you need

| Tool | When you need it | Installation |
| --- | --- | --- |
| Windows 11 and PowerShell | Recommended environment for the complete development and browser-test workflow | PowerShell is included with Windows; Windows Terminal is convenient but optional |
| Git for Windows | Downloading the repository and receiving updates | Section 2 |
| Node.js with npm | Running the local server and automated tests | Section 2; use a supported LTS release, preferably Node 24 LTS for this guide |
| Microsoft Edge or Google Chrome | Viewing and manually checking the website | Edge is normally already available on Windows |
| VS Code | Editing the project and using the Codex extension | Optional installation in section 2; setup in section 4 |
| Codex | AI-assisted review, edits, and browser QA | Optional; install the VS Code extension or CLI in section 4 |
| Playwright package | Automated browser checks | Already declared in the project; installed by `npm.cmd ci` |
| Playwright Chromium **and WebKit** | Running all configured browser checks | Section 6 |
| ngrok and an ngrok account | Giving someone outside your network a temporary HTTPS preview | Optional; section 8 |
| An MCP-capable coding assistant and Playwright MCP | Asking an assistant to operate a real browser | Optional; section 9 |

The current application is static HTML, CSS, and JavaScript. It has **no build step, backend database, application API keys, or runtime npm dependencies**. Node serves the pages; npm dependencies support development tests. React, Vite, Tailwind, Python, Docker, WSL, and a separate web server are not required for this checkout.

For viewing an already downloaded copy, you can simply open `index.html` in a browser. Follow the full setup below for serving, testing, and sharing it.

The current Playwright documentation lists Windows 11+ and supported Node release lines. Older Windows versions are not the validated target of this guide. See [Playwright system requirements](https://playwright.dev/docs/intro#system-requirements) and [Node.js downloads](https://nodejs.org/en/download).

## 2. Install the tools

Open **Start → Windows Terminal → PowerShell**, or open Windows PowerShell directly. Run commands one at a time and stop if a command reports an error.

### Option A: install with WinGet

Check whether WinGet is available:

```powershell
winget --version
```

If it is missing, install or update **App Installer** through the Microsoft Store, then reopen PowerShell. See [Microsoft's WinGet setup](https://learn.microsoft.com/en-us/windows/package-manager/winget/).

Install Git and Node.js LTS:

```powershell
winget install --id Git.Git --exact --source winget
winget install --id OpenJS.NodeJS.LTS --exact --source winget
```

The Node LTS package includes npm. WinGet's LTS package follows the available release; check `node --version` afterward. Use the Node website installer if you specifically need the recommended 24.x line.

Optional editor:

```powershell
winget install --id Microsoft.VisualStudioCode --exact --source winget
```

Accept the installer's normal prompts. Installer permissions can require an administrator, but the project itself does not need an administrator terminal.

Package references: [Git for Windows](https://git-scm.com/install/windows), [Node LTS WinGet manifest](https://github.com/microsoft/winget-pkgs/tree/master/manifests/o/OpenJS/NodeJS/LTS), [Microsoft's VS Code installation example](https://microsoft.github.io/vscode-essentials/en/01-getting-started.html).

### Option B: install using the graphical installers

Use this if WinGet or the Microsoft Store is unavailable:

1. Install [Git for Windows](https://git-scm.com/install/windows). Keep command-line integration enabled.
2. Install [Node.js LTS](https://nodejs.org/en/download), choosing Windows and the architecture matching your computer. Keep npm and the PATH option enabled.
3. Optionally install [VS Code for Windows](https://code.visualstudio.com/docs/setup/windows).

**Close and reopen PowerShell after installation**, then check:

```powershell
git --version
node --version
npm.cmd --version
npx.cmd --version
```

Each command should print a version. Use `npm.cmd` and `npx.cmd` throughout this guide: they avoid PowerShell's common `npm.ps1 cannot be loaded` execution-policy error without changing your execution policy.

## 3. Download the correct project version

For a **new copy**, choose a folder you own:

```powershell
$projectParent = Join-Path $env:USERPROFILE 'source'
New-Item -ItemType Directory -Force -Path $projectParent | Out-Null
Set-Location $projectParent
git clone --branch predev https://github.com/martingrossman/Metrics.git
Set-Location Metrics
git branch --show-current
git log -1 --oneline
```

The branch command should print `predev`. The commit may be newer than the baseline recorded above.

If a `Metrics` directory already exists, open that directory instead of cloning over it. Check `git status` before changing branches or pulling updates. These setup instructions do not discard local work.

If cloning asks for authentication, sign in with a GitHub account that has access to this repository. A private repository requires an invitation or other granted access. The HTTPS URL avoids needing the original author's SSH keys or SSH-over-port-443 configuration.

Optional: open the project in VS Code:

```powershell
code .
```

If `code` is unavailable, use the editor's **File → Open Folder** and select `Metrics`.

## 4. Set up VS Code and Codex

VS Code is the editor. **Codex** is the OpenAI coding assistant that can run in its VS Code extension, the Codex CLI, or the ChatGPT desktop app. For this project, the most practical setup is VS Code plus the Codex extension; the CLI is useful when you prefer a terminal workflow.

### VS Code workspace

Open the **folder** named `Metrics`, rather than opening an individual HTML file. In VS Code, use **Terminal → New Terminal** to get a terminal already located in the project, then run:

```powershell
git status
npm.cmd run serve
```

When VS Code asks whether to trust the authors of the folder, review the repository first and trust it only when you are comfortable running its tasks and extensions. The project uses plain HTML, CSS, and JavaScript, so no formatter, framework extension, or generated workspace configuration is required.

### Codex extension in VS Code

1. Open **Extensions** with **Ctrl+Shift+X** and search for `Codex`.
2. Install the extension published by **OpenAI**. On this computer it is supplied as the `openai.chatgpt` extension; from a terminal, the equivalent installation command is:

   ```powershell
   code.cmd --install-extension openai.chatgpt
   ```

3. Open the Codex sidebar. If its icon is not visible, press **Ctrl+Shift+P** and run **Codex: Open Codex Sidebar**.
4. Complete the sign-in prompt using the account and access method available to you. Do not put account credentials, API keys, or tokens into this repository.
5. Start with a read-only prompt such as: `Explain this project. Do not modify files.` Review the response and the Git changes panel before allowing edits.

The [Codex IDE extension guide](https://learn.chatgpt.com/docs/codex/ide) documents the sidebar workflow. Codex operates with the project instructions in [AGENT.md](AGENT.md), so open that file when you want to understand its project-specific guidance.

### Optional: Codex CLI

Install the command-line client when you want Codex from PowerShell as well as in VS Code:

```powershell
npm.cmd install --global @openai/codex@latest
codex.cmd --version
```

Use `codex.cmd` in PowerShell for the same reason this guide uses `npm.cmd`: it bypasses the `codex.ps1 cannot be loaded` execution-policy issue without changing your system policy. From the project folder, start `codex.cmd`, complete the sign-in flow, and use `/permissions` to review its access mode. The [Codex CLI guide](https://learn.chatgpt.com/docs/codex/cli) covers the first-run and permission workflow.

## 5. Start the website

In the project folder:

```powershell
npm.cmd run serve
```

Leave this terminal running. Open [http://localhost:8080/](http://localhost:8080/) in your browser.

| Page | Local address |
| --- | --- |
| Main simulator | [localhost:8080/](http://localhost:8080/) |
| Learning page | [localhost:8080/learn.html](http://localhost:8080/learn.html) |
| Metrics reference | [localhost:8080/reference.html](http://localhost:8080/reference.html) |
| Cheatsheet | [localhost:8080/cheatsheet.html](http://localhost:8080/cheatsheet.html) |

Expected result: CMatrixLab opens and changing a slider updates the displayed results. The Learn page may need its direct address because its entry links are currently removed from the main page.

Save an HTML edit and refresh the browser to see it. There is no build command and no automatic hot reload. Press **Ctrl+C in the server terminal** to stop it.

To use another port:

```powershell
npm.cmd run serve -- --port 8081
```

Then use `http://localhost:8081/`, including in any tunnel configuration.

**Current server behavior:** `scripts/serve.cjs` listens on all IPv4 interfaces, serves the named pages and additional existing HTML paths, and also attempts to listen on port 80. A port-80 bind failure is silently ignored. Use the explicit `:8080` address unless the terminal confirms port 80 is active. This is a development server with no built-in login.

## 6. Install and run the automated checks

Open a **second PowerShell terminal** in the same project folder:

```powershell
npm.cmd ci
npx.cmd playwright --version
npx.cmd playwright install chromium webkit
npm.cmd test
```

`npm ci` installs the versions recorded in `package-lock.json`; this baseline pins Playwright to **1.59.1**. It replaces an existing `node_modules` installation and does not update the dependency lockfile. See [npm ci](https://docs.npmjs.com/cli/v11/commands/npm-ci/).

Install **both** browser engines. They are separate from your everyday Edge/Chrome installation and must match the Playwright package. Several project tests skip when an engine is absent, so check for skipped tests as well as failures. See [Playwright browser installation](https://playwright.dev/docs/browsers).

This repository uses **Node's built-in test runner with the Playwright library**, followed by `scripts/check.cjs`. Its command is `npm.cmd test`; a newly generated Playwright Test project is unnecessary.

The tests open local files or start their own temporary local server. They do not need a separately running `:8080` server. Screenshots generated by existing tests go into ignored `artifacts/`.

An additional check exists outside the default npm test command:

```powershell
node --test scripts/p1.test.cjs
```

For the larger manual/assistant-driven QA campaign, use [tests/FULL_QA_PROMPT.md](tests/FULL_QA_PROMPT.md). Passing automated tests is not a full usability or mathematical release certification.

## 7. Open the site on a phone over the same Wi-Fi

1. Start `npm.cmd run serve` on your computer.
2. Connect the computer and phone to the same local network.
3. Find the terminal line beginning **Same Wi-Fi**.
4. Open its full address on the phone, for example `http://192.168.1.25:8080/`.

Use the actual IP printed on **your** computer. On the phone, `localhost` means the phone, not the computer.

If Windows Firewall prompts, allow Node on your trusted **Private** network. Keep the port in the address. Guest Wi-Fi, VPN routing, and network isolation can prevent devices reaching one another. Use ngrok for devices on different networks.

## 8. Share a temporary public preview with ngrok

ngrok is optional. It forwards a public HTTPS address to your running local website; it does not install, build, or permanently deploy the application.

### Install and authenticate once

Use the official Windows installation command:

```powershell
winget install ngrok -s msstore
```

Alternatively use the Microsoft Store link or standalone download on the [official ngrok Windows page](https://ngrok.com/download/windows). Reopen PowerShell and check:

```powershell
ngrok version
```

Create/sign in to your own [ngrok account](https://dashboard.ngrok.com/), find its agent authtoken, and register it locally:

```powershell
ngrok config add-authtoken "PASTE_YOUR_OWN_AUTHTOKEN_HERE"
ngrok config check
```

Replace the placeholder. Keep your real token out of source files, screenshots, shared logs, and Git commits. This uses an **authtoken**, not an ngrok API key. The CLI stores the setting in its local configuration. See [ngrok CLI configuration](https://ngrok.com/docs/gateway/agent/cli).

### Start a preview

**Terminal A — keep the website running:**

```powershell
npm.cmd run serve
```

**Terminal B — forward the matching port:**

```powershell
ngrok http http://127.0.0.1:8080
```

Copy the **HTTPS forwarding URL printed by ngrok** and open it on another device. Append `/learn.html`, `/reference.html`, or `/cheatsheet.html` for those pages. URL allocation and usage limits depend on your account; use the URL actually shown.

This command creates public access to the pages served on that port. There is no automatic password. Keep only material you intend to share in the served HTML paths; for restricted previews, configure ngrok's access controls before sharing. No firewall port forwarding on your router is needed.

The local request inspector is normally [http://127.0.0.1:4040](http://127.0.0.1:4040). It helps diagnose requests reaching ngrok but failing at the app. See [ngrok's inspection interface](https://ngrok.com/docs/gateway/agent/web-inspection-interface).

Keep both terminals and the computer running. **Ctrl+C in Terminal B stops the tunnel**; **Ctrl+C in Terminal A stops the website**. A tunnel is not a replacement for a permanent hosting setup.

## 9. Optional: connect Codex to Playwright MCP

The project Playwright dependency runs automated tests. **Playwright MCP** is a separate local server that gives Codex browser tools for navigation, console inspection, interaction, and screenshots. It is not the same thing as the project's `playwright` npm dependency.

### Choose the right configuration

| You are using | Configure it here | What shares the setting |
| --- | --- | --- |
| Codex extension in VS Code, Codex CLI, or ChatGPT desktop app | Codex MCP settings or `~/.codex/config.toml` | All three Codex clients on this computer |
| GitHub Copilot Agent in VS Code | VS Code's **MCP: Add Server** flow | Copilot's own configuration only |

These are separate clients and configuration formats. Adding Playwright through VS Code's generic MCP command configures the selected Copilot harness; it does not automatically add it to Codex. The [Codex MCP guide](https://learn.chatgpt.com/docs/extend/mcp?surface=cli) confirms that Codex's desktop app, CLI, and IDE extension share its local configuration.

### Recommended: add Playwright to Codex once

First start the website in a VS Code or PowerShell terminal:

```powershell
npm.cmd run serve
```

Then run this command in a second terminal. It registers the local server for Codex; it does not launch a browser until Codex makes a browser request.

```powershell
codex.cmd mcp add playwright -- npx.cmd -y @playwright/mcp@latest --browser msedge --isolated --output-dir .playwright-mcp
codex.cmd mcp list
```

Expected result: `codex.cmd mcp list` shows a server named `playwright`. Restart the Codex extension or open a new Codex chat after adding it. In the extension, you can also use its gear menu: **MCP servers → Add server → STDIO**, enter the same command and arguments, then restart the extension.

The command uses installed Microsoft Edge, an in-memory isolated browser profile, and saves unnamed screenshots or traces under the ignored `.playwright-mcp/` folder. `--isolated` prevents browser session data being retained on disk. The [Playwright MCP reference](https://github.com/microsoft/playwright-mcp) documents these options.

Codex stores personal MCP configuration in `~/.codex/config.toml`; a trusted project can instead use `.codex/config.toml`. Do not commit either configuration until the whole team has agreed on the command, package version, and browser policy. The CLI command above safely merges this server with the user's existing personal configuration.

### Verify the connection in Codex

In a new Codex chat, send this prompt:

> Use the Playwright MCP server to open http://localhost:8080/ and report the page title. Use its tools, not built-in browser tools. Do not change files.

Expand the resulting tool call. The setup is working only when it identifies the `playwright` MCP server and returns the requested title without a connection error. Then use the full QA prompt:

> Use Playwright MCP to open http://localhost:8080/. Check console errors, move a slider, and take screenshots at 1440 × 900 and 390 × 844. Do not modify files.

This follows the same tool-call verification method in [VS Code's MCP guidance](https://code.visualstudio.com/docs/agent-customization/mcp-servers). Review any server trust and browser-operation prompts before accepting them.

### Optional: configure Playwright for GitHub Copilot in VS Code

If you use Copilot Agent rather than Codex, press **Ctrl+Shift+P**, run **MCP: Add Server**, choose **Command (stdio)**, enter:

```text
npx.cmd -y @playwright/mcp@latest --browser msedge --isolated --output-dir .playwright-mcp
```

Give it the ID `playwright`, choose the configuration destination appropriate for you, and verify a tool call as above. VS Code's portable files use a top-level `mcpServers` object; the VS Code format uses `servers`. Do not copy one format into the other without converting it. See [VS Code's MCP configuration destinations and formats](https://code.visualstudio.com/docs/agent-customization/mcp-servers).

The `@latest` MCP package downloads on demand and is independent of the project's locked Playwright **1.59.1** version. For a repeatable team configuration, record and pin the MCP version after verifying it with the chosen client.

A remote/cloud assistant's `localhost` may refer to another computer. Run the MCP server on the computer that serves this project, or use an appropriately shared preview URL. An ngrok tunnel for the website is separate from the MCP server.

## 10. Normal daily workflow

From your project folder:

```powershell
git status
npm.cmd run serve
```

Edit, save, and refresh. Run `npm.cmd test` in another terminal when checking changes.

When your working tree is clean and you want the latest version of your current branch:

```powershell
git pull --ff-only
```

If dependency files changed, run:

```powershell
npm.cmd ci
npx.cmd playwright install chromium webkit
```

If Git reports local changes, conflicts, or divergent history, stop and resolve that state before updating. These commands do not require a new clone or branch reset.

## 11. Common problems

| Symptom | What to do |
| --- | --- |
| `node`, `git`, or `ngrok` is not recognized | Reopen PowerShell after installation. Check the installer/PATH setup; use `Get-Command node`, `Get-Command git`, or `Get-Command ngrok` |
| `npm.ps1 cannot be loaded` | Use `npm.cmd` and `npx.cmd` as shown above |
| `package.json` cannot be found | Use `Get-Location` and `Get-ChildItem package.json`; switch into the cloned `Metrics` folder |
| You see a different website | Run `git branch --show-current`; this guide targets `predev`, not the default `master` |
| `npm ci` reports a lockfile mismatch | Confirm you have the matching `package.json` and `package-lock.json` from the same checkout; do not regenerate dependencies just to bypass the error |
| Browser executable missing, or tests skip | Run `npx.cmd playwright install chromium webkit` after `npm.cmd ci` |
| Playwright downloads fail on a company network | Ask IT about proxy/certificate access to npm and Playwright downloads; use the [official network configuration guidance](https://playwright.dev/docs/browsers#install-behind-a-firewall-or-a-proxy) |
| `EADDRINUSE` / port already in use | Keep an already-running project server or choose `--port 8081`; match the browser and ngrok port. Do not stop an unidentified process |
| Phone cannot connect | Use the computer's LAN IP with `:8080`, the same network, and the appropriate Private-network firewall permission |
| ngrok authentication fails | Register your own valid agent authtoken and run `ngrok config check` |
| ngrok reports upstream connection failure | First open `http://localhost:8080/` locally; keep the server running and use the same port in ngrok |
| Page changes do not appear | Save the right file, confirm the correct branch/port, and refresh; the server rereads HTML on each request |
| Opening a report loses its images | Open the report's local HTML file with its screenshot folders intact; the app server is not a general static-file server for PNG/JSON/Markdown assets |
| An MCP server is configured but no tools appear | Check the client's server output, `npx.cmd` availability, installed Edge, and enabled tools; restart that server after correcting its configuration |

## 12. Useful project files

| File or folder | Purpose |
| --- | --- |
| [README.md](README.md) | Product overview and daily commands |
| [index.html](index.html) | Main application, including its CSS and JavaScript |
| [learn.html](learn.html), [reference.html](reference.html), [cheatsheet.html](cheatsheet.html) | Educational and reference pages |
| [scripts/serve.cjs](scripts/serve.cjs) | Development server |
| [package.json](package.json), [package-lock.json](package-lock.json) | Commands and reproducible npm dependency versions |
| [CMatrixLab_CODE_GUIDE.md](CMatrixLab_CODE_GUIDE.md) | Editing guidance |
| [tests/FULL_QA_PROMPT.md](tests/FULL_QA_PROMPT.md) | Full browser QA procedure |
| [test-results/CMATRIX_QA_REPORT.md](test-results/CMATRIX_QA_REPORT.md) | Recorded QA findings; check the report's version and limitations |
| [test-results/branch-review/CMATRIX_BRANCH_REVIEW.html](test-results/branch-review/CMATRIX_BRANCH_REVIEW.html) | Comparison of historical branches |
| [test-results/teaching-concept/CMATRIX_TEACHING_STRATEGY.md](test-results/teaching-concept/CMATRIX_TEACHING_STRATEGY.md) | Proposed teaching direction and factory-inspection example |
| `artifacts/`, `.playwright-mcp/` | Generated browser output; already ignored by Git |

The teaching concept is a separate sketch, not a replacement for `index.html`. Historical report-generation helpers are not required to run the app or its standard tests and may have machine-specific paths.

## 13. What was verified for this guide

On **26 October 2026**, the existing Windows checkout of `predev` at `23647b8` was checked:

- Node **25.9.0**, npm **11.12.1**, Git **2.52.0.windows.1**, ngrok **3.39.13**, and Playwright **1.59.1** were available.
- VS Code **1.143.1**, the OpenAI `openai.chatgpt` extension, and Codex CLI **0.118.0** were available. The guide's `codex.cmd mcp add` command was accepted and `codex.cmd mcp list` confirmed the enabled `playwright` server.
- Chromium **147.0.7727.15** and WebKit **26.4** were installed.
- `npm.cmd test` finished successfully: **21 tests passed, 0 failed, 0 skipped**, followed by **44,541 model combinations** and the final browser/responsive checks passing.
- Server routes and its additional port-80 listener were checked against the current implementation.
- Installation and configuration instructions were cross-checked against the linked official documentation.

Log: [test-results/windows-setup-validation.log](test-results/windows-setup-validation.log).

This was **not a fresh Windows installation**. WinGet installation, a clean clone/npm install, Node 24 execution, phone/firewall access, new ngrok authentication/public tunneling, Codex sign-in, and a browser tool call through the newly registered MCP server were not performed in this documentation task. The installed Node 25 version records the tested environment; a supported LTS is the recommendation for a new machine.
