#!/usr/bin/env bash
# ------------------------------------------------------------
# merge-adapter.sh (Final v2)
# 1. Cleans temp files.
# 2. Fuses adapter -> Final MLX directory (NO GGUF CONVERSION).
# ------------------------------------------------------------

if [[ -f ".venv/bin/activate" ]]; then
  source ".venv/bin/activate"
fi

MODEL_ID="${MODEL_ID:-GetSoloTech/Qwen3-Code-Reasoning-4B}"
ADAPTER_PATH="${ADAPTER_PATH:-adapters_nan0web.npz}"
# Save to a clear name, not temp
OUTPUT_DIR="${OUTPUT_DIR:-models/qwen3-nan0web-fused}"

while [[ "$#" -gt 0 ]]; do
  case $1 in
    --model)    MODEL_ID="$2"; shift ;;
    --adapter)  ADAPTER_PATH="$2"; shift ;;
    --output)   OUTPUT_DIR="$2"; shift ;;
    *) echo "❌ Unknown flag: $1"; exit 1 ;;
  esac
  shift
done

# 1. Auto-cleanup
echo "🧹 Cleaning old temp models..."
find models -type d -name "fused_temp_*" -maxdepth 1 -exec rm -rf {} + 2>/dev/null

# 2. Merge
echo "🔧 Fusing: $MODEL_ID + $ADAPTER_PATH -> $OUTPUT_DIR"

python -m mlx_lm fuse \
  --model "$MODEL_ID" \
  --adapter-path "$ADAPTER_PATH" \
  --save-path "$OUTPUT_DIR"

if [ $? -eq 0 ]; then
  echo "✅ Model ready (MLX format): $OUTPUT_DIR"
  echo "🧪 Test it now: bash bin/run-local-chat.sh \"$OUTPUT_DIR\" \"Твій запит\""
else
  echo "❌ Fusion failed"
  exit 1
fi
