#!/usr/bin/env bash
#
---
# run-llama-server.sh
# Runs llama.cpp in server mode for OpenAI‑compatible API.
# All configurable parameters are optional and can be passed
# via command‑line flags or fall back to sensible defaults.
#
---
# ──────────────────────── Defaults & Env overrides ────────────────────────
LLAMA_CPP_ROOT="${LLAMA_CPP_ROOT:-$HOME/i/src/llm/llama.cpp}"
BINARY="$LLAMA_CPP_ROOT/build/bin/llama-server"

# Default values (mirroring the original script)
DEFAULT_MODEL="${DEFAULT_MODEL:-$HOME/.lmstudio/models/nan0web/qwen3-nan0web.gguf}"
DEFAULT_PORT=8080
DEFAULT_HOST="127.0.0.1"
DEFAULT_ALIAS="nan0web-qwen"
DEFAULT_CTX_SIZE=8192
DEFAULT_NGL=99
DEFAULT_EMBEDDING=false   # changed default to false to support chat completions by default

# ──────────────────────── Helper & Usage ────────────────────────
print_usage() {
  cat <<EOF
Usage: ${0##*/} [options]

Options:
  -m <path>   Model file path (default: $DEFAULT_MODEL)
  -p <port>   Server port (default: $DEFAULT_PORT)
  -h <host>   Host address (default: $DEFAULT_HOST)
  -a <alias>  Model alias for API calls (default: $DEFAULT_ALIAS)
  -c <size>   Context size (default: $DEFAULT_CTX_SIZE)
  -g <layers> Number of GPU layers (default: $DEFAULT_NGL)
  -e          Enable embedding (by default embedding is disabled)
  -?, -H      Show this help and exit
EOF
}

# ──────────────────────── Parse arguments ────────────────────────
# Initialise variables with defaults
MODEL_PATH="$DEFAULT_MODEL"
PORT="$DEFAULT_PORT"
HOST="$DEFAULT_HOST"
ALIAS="$DEFAULT_ALIAS"
CTX_SIZE="$DEFAULT_CTX_SIZE"
NGL="$DEFAULT_NGL"
EMBEDDING="$DEFAULT_EMBEDDING"

while getopts ":m:p:h:a:c:g:e?H" opt; do
  case "$opt" in
    m) MODEL_PATH="$OPTARG" ;;
    p) PORT="$OPTARG" ;;
    h) HOST="$OPTARG" ;;
    a) ALIAS="$OPTARG" ;;
    c) CTX_SIZE="$OPTARG" ;;
    g) NGL="$OPTARG" ;;
    e) EMBEDDING=true ;;   # flag to *enable* embedding
    \?) print_usage; exit 0 ;;
    H) print_usage; exit 0 ;;
    :)
      echo "❌ Option -$OPTARG requires an argument."
      print_usage
      exit 1
      ;;
  esac
done
shift $((OPTIND-1))

# ──────────────────────── Validation ────────────────────────
if [[ ! -f "$MODEL_PATH" ]]; then
  echo "❌ Model not found: $MODEL_PATH"
  exit 1
fi

if [[ ! -f "$BINARY" ]]; then
  echo "❌ llama-server not found at: $BINARY"
  echo "Please build it:"
  echo "  cd $LLAMA_CPP_ROOT && cmake -B build && cmake --build build --target llama-server"
  exit 1
fi

# ──────────────────────── Run server ────────────────────────
echo "🚀 Starting llama.cpp server with:"
echo "   • model   : $MODEL_PATH"
echo "   • port    : $PORT"
echo "   • host    : $HOST"
echo "   • alias   : $ALIAS"
echo "   • ctx‑size: $CTX_SIZE"
echo "   • ngl     : $NGL"
echo "   • embedding: $EMBEDDING"

# Build argument list
ARGS=(
  --port "$PORT"
  --host "$HOST"
  --model "$MODEL_PATH"
  --alias "$ALIAS"
  --ctx-size "$CTX_SIZE"
  -ngl "$NGL"
)

# Add embedding flag only when enabled
if $EMBEDDING; then
  ARGS+=(--embedding)
fi

# Execute
exec "$BINARY" "${ARGS[@]}"
