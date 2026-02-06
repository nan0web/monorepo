#!/usr/bin/env bash
# ------------------------------------------------------------
# run-server.sh
# Starts MLX model as an OpenAI-compatible HTTP server.
# ------------------------------------------------------------

if [[ -f ".venv/bin/activate" ]]; then
  source ".venv/bin/activate"
fi

# Defaults
MODEL_PATH="models/qwen3-nan0web-fused"
HOST="localhost"
PORT="1234"
MAX_TOKENS="32768" # Default 32k. Try 40960 if you have 64GB RAM.

while [[ "$#" -gt 0 ]]; do
  case $1 in
    --model)       MODEL_PATH="$2"; shift ;;
    --host)        HOST="$2"; shift ;;
    --port)        PORT="$2"; shift ;;
    --context)     MAX_TOKENS="$2"; shift ;;
    *) echo "❌ Unknown flag: $1"; exit 1 ;;
  esac
  shift
done

echo "🚀 Starting MLX Server"
echo "📦 Model:    $MODEL_PATH"
echo "🌐 URL:      http://$HOST:$PORT/v1"
echo "🧠 Context:  $MAX_TOKENS tokens"
echo "---"

# --gpu: MLX on Mac uses Metal by default.
python -m mlx_lm server \
  --model "$MODEL_PATH" \
  --host "$HOST" \
  --port "$PORT" \
  --max-tokens "$MAX_TOKENS" \
  --log-level INFO
