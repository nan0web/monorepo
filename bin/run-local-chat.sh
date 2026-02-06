#!/usr/bin/env bash
# ------------------------------------------------------------
# run-local-chat.sh
# Runs the fused MLX model directly.
# Usage: ./run-local-chat.sh "Your prompt here"
# ------------------------------------------------------------

if [[ -f ".venv/bin/activate" ]]; then
  source ".venv/bin/activate"
fi

MODEL_PATH="${1:-models/fused_nan0web}"
PROMPT="${2:-How to install @nan0web/auth-core using pnpm?}"

echo "🤖 Loading model: $MODEL_PATH"
echo "📝 Prompt: $PROMPT"
echo "---"

# --max-tokens 512: достатньо для відповіді
# --temp 0.1: більш стабільний код
python -m mlx_lm generate \
  --model "$MODEL_PATH" \
  --prompt "$PROMPT" \
  --max-tokens 512 \
  --temp 0.1
