<style>
.ac { background: linear-gradient(33deg, #0003, #0093); padding: 1rem 2rem }
pre { background: linear-gradient(66deg, #fff9, #ff03); border: 2px solid #ff09; }
@media (prefers-color-scheme: dark) {
	pre { background: linear-gradient(66deg, #0009, #9003); border: 2px solid #9009; }
}
</style>

# v1.0.0 - 2025-08-18

## PM as a code

Project management as a code is real if you believe and do this way.

## CLI application

### 1. Git-Native & Version-Controlled Workflow [git-native.test.js]

- Treats project management like code: everything is versioned, auditable, reversible.
- No external tools or databases needed — just Git.
- Natural for developers; lowers barrier to entry for dev-centric teams.

<div class="ac">

#### Acceptance Criteria

- MUST verify that `git status` does not show any `releases/0/0/v0.0.0/*` files;
- MUST create all required files according to the structure:

```text
release.md                      ← Release notes (tasks, sections)
release.js                      ← Team, roles, config (class Release)
release.test.js                 ← Main test suite (CI entrypoint)
test/
  {username}/                   ← Optional scope
    tasks.test.js               ← User-specific tests
chat/                           ← Release-wide chat
  2025/08/18/
    162000420.{username}.md     ← Message (timestamp + user)
task/
  ux.logo/                      ← Task by slug
    config.json                 ← { assignee, priority, dependsOn }
    approved/
      ceo.json                  ← Approval record (GPG-signed)
    chat/
      2025/08/18/
        162000420.{username}.md ← Task-specific message
assets/                         ← Designs, docs, deliverables
retro.md                        ← Final reflection (sealed)
.cache/                         ← gitignored: read state, session
```

- MUST confirm with `git status` which files are ignored and which are tracked.

## </div>

### 2. Test-Driven Project Progress [testable.test.js]

- Tasks become testable units → Pass/fail defines completion.
- Automates status tracking via CI/CD: "Done" = test passes.
- Enables **automated QA gates in releases** — powerful for regulated environments.

<div class="ac">

#### Acceptance Criteria

- MUST write `release.md` inside the test folder `releases/0/0/v0.0.0/release.md` using proper formatting;
- MUST initialize the release with `nan0release init v0.0.0`;
- MUST check the generated tests and compare them against expected templates;
- MUST prepare tests generated from complete releases notes markdown file with command `nan0release prepare v0.0.0`
- MUST begin the workflow: all tests start in `todo`, transition states by modifying files and executing tests, validate each state (`todo`, `in progress`, `complete`, `approved`), verify release status and confirm `git tag` commands are executed once all tasks complete.
- MUST execute `nan0release [status] v0.0.0`
- MUST execute `nan0release todo v0.0.0`
- MUST execute `nan0release validate v0.0.0`
- MUST execute `nan0release seal v0.0.0`

</div>

---

### 3. Transparent & Predictable Progress Tracking [status-auto-updated.test.js]

- Real-time progress %, ETA, and velocity derived from commit history.
- Immediate visibility through stats (pending/pass/fail).
- Eliminates manual updates in Jira/Trello → reduces noise and inaccuracies.

<div class="ac">

#### Acceptance Criteria

- MUST validate updates occur upon commits (these may be simulated or run within an isolated temporary `.git` environment); ensure CI/CD generates reports which are both testable and consumable by UIs.

</div>

---

### 4. Integrated Team Communication [chat.test.js]

- Structured chat per release and task embedded directly in file system.
- Chronologically ordered, searchable, and version-controlled conversations.
- `.cache` supports user-specific read/unread states without requiring a central server.

<div class="ac">

#### Acceptance Criteria

- MUST test by verifying created files after running the following commands:
- `nan0release chat write "msg"`
- `nan0release chat write ux.logo "help needed"`
- `nan0release chat read`
- `nan0release chat find "help"`
- `nan0release chat --sender member@example.com`
- `nan0release chat unread`
- MUST test both output and resulting file content.

</div>

---

### 5. Self-Documenting Releases [docs.test.js]

- Structured, machine-readable release notes, always current.
- Markdown enhanced with YAML frontmatter enables metadata (assignees, dates, etc.).
- Facilitates automatic generation of changelogs, roadmaps, dashboards.

<div class="ac">

#### Acceptance Criteria

- MUST validate success and failure outcomes of `nan0release validate` when processing valid and invalid release note formats. It must exit with status code 1 on a failure.

</div>

---

### 6. Extensible & Composable & Office-First & Decentralized by Design [ci-cd.test.js]

- Assets such as designs, configurations, and logs stored within the release for full context.
- Supports custom scripts, hooks, templates (e.g., `pre-release.js`, `post-release.sh`).
- Seamlessly integrates into CI/CD pipelines.
- Works offline and independently of external services.
- No vendor lock-in — all data remains in the repository.

<div class="ac">

#### Acceptance Criteria

- MUST confirm context preservation by adding test files to assets and validating output of `git status`.

</div>
