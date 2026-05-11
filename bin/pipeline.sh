#!/bin/bash
# bin/pipeline.sh — Nan0web Pipeline Runner
# Usage: ./bin/pipeline.sh <step> [project_dir]
# Steps: seed | model | contract | adapter | cli | chat | web | mobile | qa

set -e

STEP="${1:-seed}"
PROJECT="${2:-.}"
WF="packages/0HCnAI.framework/templates/workflows"
SESSION=".agent/session/workflows"

echo "⚡ Nan0web Pipeline: $STEP → $PROJECT"

# 1. Clean & prepare session
rm -rf .agent/session
mkdir -p "$SESSION"

# 2. Always-present foundation (14 files)
cp "$WF/architechnomag.md" "$SESSION/"
cp "$WF/code-style.md" "$SESSION/"
cp "$WF/anti-haste-protocol.md" "$SESSION/"
cp "$WF/zero-tolerance-git.md" "$SESSION/"
cp "$WF/zero-tolerance-grep.md" "$SESSION/"
cp "$WF/mcp-knowledge-base.md" "$SESSION/"
cp "$WF/cnai-context.md" "$SESSION/"
cp "$WF/task-pool.md" "$SESSION/"
cp "$WF/olm-ui-architecture.md" "$SESSION/"
cp "$WF/model-schema.md" "$SESSION/"
cp "$WF/data-architecture.md" "$SESSION/"
cp "$WF/i18n-standards.md" "$SESSION/"
cp "$WF/package-hygiene.md" "$SESSION/"
cp "$WF/subagent.md" "$SESSION/"

# 3. Step-specific workflows
case "$STEP" in
  seed)
    cp "$WF/pipeline-no1-seed.md" "$SESSION/"
    cp "$WF/seed-analysis.md" "$SESSION/"
    cp "$WF/project-md.md" "$SESSION/"
    cp "$WF/language-of-intent.md" "$SESSION/"
    cp "$WF/llimo.md" "$SESSION/"
    ;;
  model)
    cp "$WF/pipeline-no2-model.md" "$SESSION/"
    cp "$WF/inspect-models.md" "$SESSION/"
    cp "$WF/inspect-jsdoc.md" "$SESSION/"
    cp "$WF/inspect-bank.md" "$SESSION/"
    ;;
  contract)
    cp "$WF/pipeline-no3-contract.md" "$SESSION/"
    cp "$WF/olmui-scenario-test.md" "$SESSION/"
    cp "$WF/test-style-scanner.md" "$SESSION/"
    cp "$WF/anti-pattern-scanner.md" "$SESSION/"
    cp "$WF/fix.md" "$SESSION/"
    ;;
  adapter)
    cp "$WF/pipeline-no4-adapter.md" "$SESSION/"
    cp "$WF/prop-welder.md" "$SESSION/"
    cp "$WF/interface-welding.md" "$SESSION/"
    cp "$WF/inspect-structure.md" "$SESSION/"
    ;;
  cli)
    cp "$WF/pipeline-no5-ui-cli.md" "$SESSION/"
    cp "$WF/ui-cli-standards.md" "$SESSION/"
    cp "$WF/sandbox-template.md" "$SESSION/"
    cp "$WF/sandbox-verify.md" "$SESSION/"
    cp "$WF/gallery.md" "$SESSION/"
    cp "$WF/snapshot.md" "$SESSION/"
    ;;
  chat)
    cp "$WF/pipeline-no6-ui-chat.md" "$SESSION/"
    cp "$WF/voice-auth-protocol.md" "$SESSION/"
    cp "$WF/voice-feedback-protocol.md" "$SESSION/"
    ;;
  web)
    cp "$WF/pipeline-no7-ui-web.md" "$SESSION/"
    cp "$WF/inspect-web.md" "$SESSION/"
    cp "$WF/inspect-playground.md" "$SESSION/"
    cp "$WF/gallery.md" "$SESSION/"
    ;;
  mobile)
    cp "$WF/pipeline-no8-ui-mobile.md" "$SESSION/"
    ;;
  qa)
    cp "$WF/pipeline-no9-qa.md" "$SESSION/"
    cp "$WF/release.md" "$SESSION/"
    cp "$WF/commit.md" "$SESSION/"
    cp "$WF/check.md" "$SESSION/"
    cp "$WF/i18n-builder.md" "$SESSION/"
    cp "$WF/inspect-i18n.md" "$SESSION/"
    cp "$WF/indexator.md" "$SESSION/"
    cp "$WF/git-reviewer.md" "$SESSION/"
    cp "$WF/provendocs.md" "$SESSION/"
    cp "$WF/docs-site.md" "$SESSION/"
    ;;
  *)
    echo "Unknown step: $STEP"
    echo "Valid: seed | model | contract | adapter | cli | chat | web | mobile | qa"
    exit 1
    ;;
esac

# 4. Generate session index
echo "# Session: $STEP" > .agent/session/index.md
echo "" >> .agent/session/index.md
for f in "$SESSION"/*.md; do
  name=$(basename "$f" .md)
  echo "- [$name](./workflows/$name.md)" >> .agent/session/index.md
done

echo "✅ Session ready: .agent/session/index.md"
echo "📂 Workflows: $(ls "$SESSION" | wc -l) files"
echo "🚀 Open Continue and start working on step: $STEP"wc -l packages/0HCnAI.framework/templates/workflows/olm-ui-architecture*.mdwc -l packages/0HCnAI.framework/templates/workflows/olm-ui-architecture*.mdwc -l packages/0HCnAI.framework/templates/workflows/olm-ui-architecture*.mdwc -l packages/0HCnAI.framework/templates/workflows/olm-ui-architecture*.md
