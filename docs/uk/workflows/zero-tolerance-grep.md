---
title: Zero Tolerance grep_search
description: Zero Tolerance grep_search to avoid .git, node_modules, venv, etc.
---

ABSOLUTE BAN: The AI agent MUST NOT use the `grep_search` tool without `Includes` bounds. ALWAYS restrict `grep_search` with glob patterns (`Includes: ['*.js', '*.ts', '*.md', '*.json', '*.yaml', '*.yml', '!**/node_modules/*', '!**/.git/*', '!**/venv/*', '!**/.cache/*', '!**/dist/*', '!**/types/*']`). NEVER search blindly across the entire monorepo or packages/ directory as it causes timeouts.

PRIMARY RULE FOR CLASSES/MODELS: When searching for classes, models, types, or domain logic (e.g. `class Language`), you MUST FIRST use the `mcp_nan0web-knowledge_search_knowledge_base` tool or the `nan0ai search` CLI command. These use AI vector embeddings and AST indexing, which is instant and accurate. Only fallback to strict `grep_search` if the knowledge base does not find the answer.
