#!/usr/bin/env bash
# ------------------------------------------------------------
# convert-to-gguf.sh
# Strategy:
# 1. Convert HF -> GGUF (F16) using Python script.
# 2. Quantize F16 -> Q4_K_M using C++ binary (llama-quantize).
# ------------------------------------------------------------

if [[ -f ".venv/bin/activate" ]]; then
  source ".venv/bin/activate"
fi

LLAMA_CPP_ROOT="${LLAMA_CPP_ROOT:-$HOME/i/src/llm/llama.cpp}"
CONVERTER_SCRIPT="$LLAMA_CPP_ROOT/convert_hf_to_gguf.py"

INPUT_DIR="$1"
OUTPUT_FILE="$2"

if [[ -z "$INPUT_DIR" ]] || [[ -z "$OUTPUT_FILE" ]]; then
  echo "Usage: $0 <input_model_dir> <output_file.gguf>"
  exit 1
fi

# ------------------------------------------------------------
# 1. Setup Intermediate File (F16)
# ------------------------------------------------------------
TEMP_FILE="${OUTPUT_FILE%.gguf}.tmp.f16.gguf"

echo "🔍 Using local llama.cpp: $LLAMA_CPP_ROOT"
echo "🔍 Checking Python dependencies..."
pip install -q torch transformers tokenizers sentencepiece protobuf 2>/dev/null

export PYTHONPATH="$LLAMA_CPP_ROOT/gguf-py:$PYTHONPATH"

echo "🔨 Step 1/2: Converting HF to F16 GGUF..."
python "$CONVERTER_SCRIPT" "$INPUT_DIR" \
  --outfile "$TEMP_FILE" \
  --outtype f16

if [ $? -ne 0 ] || [ ! -f "$TEMP_FILE" ]; then
  echo "❌ Conversion to F16 failed."
  exit 1
fi

# ------------------------------------------------------------
# 2. Find Quantize Binary
# ------------------------------------------------------------
QUANTIZE_BIN=""

# Priority 1: Check local build (standard cmake output)
if [[ -f "$LLAMA_CPP_ROOT/build/bin/llama-quantize" ]]; then
  QUANTIZE_BIN="$LLAMA_CPP_ROOT/build/bin/llama-quantize"
# Priority 2: Check source root (alternative build locations)
elif [[ -f "$LLAMA_CPP_ROOT/llama-quantize" ]]; then
  QUANTIZE_BIN="$LLAMA_CPP_ROOT/llama-quantize"
# Priority 3: System / Homebrew
elif command -v llama-quantize &> /dev/null; then
  QUANTIZE_BIN="llama-quantize"
fi

if [[ -z "$QUANTIZE_BIN" ]]; then
  echo "❌ 'llama-quantize' binary not found."
  echo "Please run 'cd $LLAMA_CPP_ROOT && cmake -B build && cmake --build build --target llama-quantize'"
  exit 1
fi

echo "🧊 Step 2/2: Quantizing F16 -> Q4_K_M using: $QUANTIZE_BIN"
"$QUANTIZE_BIN" "$TEMP_FILE" "$OUTPUT_FILE" q4_k_m

# ------------------------------------------------------------
# 3. Finalize
# ------------------------------------------------------------
if [ $? -eq 0 ] && [ -f "$OUTPUT_FILE" ]; then
  # Cleanup temp file only if success to save space
  rm "$TEMP_FILE"
  echo "✅ Conversion successful: $OUTPUT_FILE"
else
  echo "❌ Quantization failed. Temporary file kept at: $TEMP_FILE"
fi
