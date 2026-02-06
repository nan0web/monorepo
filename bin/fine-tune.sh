#!/usr/bin/env bash
# ------------------------------------------------------------
# Fine‑tune Qwen3‑Code‑Reasoning‑4B‑i1 on the @nan0web dataset
# ------------------------------------------------------------
# Prerequisites (run once):
#   pip install -U mlx-lm tqdm
#   mkdir -p models adapters logs
#
# Usage:
#   ./fine-tune.sh [options]
#
# Options (defaults):
#   --model           qwen3-code-reasoning-4b-i1
#   --data            .datasets/training.jsonl
#   --lora-layers     8
#   --batch-size      4
#   --iters           500
#   --val-batches     20
#   --lr              1e-5
#   --steps-per-eval  100
#   --save-every      50
#   --adapter-file    adapters_nan0web.npz
#   --max-seq-length  2048
#   --log-dir         logs
#
# The script runs the training in the background (nohup) and
# writes stdout+stderr to $LOG_FILE.  It also creates a
# “keep‑awake” helper on macOS (`caffeinate`) or Linux
# (`systemd-inhibit`) so the notebook does not suspend.
# ------------------------------------------------------------

# ---------- Helper functions ----------
if [[ -f ".venv/bin/activate" ]]; then
  source ".venv/bin/activate"
  echo "🔧 venv активовано"
else
  echo "⚠️ .venv не знайдено – використовую системний Python"
fi

# ---------- Parse arguments ----------
MODEL=qwen3-code-reasoning-4b-i1
DATA=.datasets/training.jsonl
LORA_LAYERS=8
BATCH_SIZE=4
ITERS=500
VAL_BATCHES=20
LR=1e-5
STEPS_PER_EVAL=100
SAVE_EVERY=50
ADAPTER_FILE=adapters_nan0web.npz
MAX_SEQ=2048
LOG_DIR=logs

while [[ $# -gt 0 ]]; do
  case $1 in
    --model)          MODEL=$2; shift ;;
    --data)           DATA=$2; shift ;;
    --lora-layers)    LORA_LAYERS=$2; shift ;;
    --batch-size)     BATCH_SIZE=$2; shift ;;
    --iters)          ITERS=$2; shift ;;
    --val-batches)    VAL_BATCHES=$2; shift ;;
    --lr)             LR=$2; shift ;;
    --steps-per-eval) STEPS_PER_EVAL=$2; shift ;;
    --save-every)     SAVE_EVERY=$2; shift ;;
    --adapter-file)   ADAPTER_FILE=$2; shift ;;
    --max-seq-length)MAX_SEQ=$2; shift ;;
    --log-dir)        LOG_DIR=$2; shift ;;
    *) die "Unknown option: $1" ;;
  esac
  shift
done

# ---------- Prepare ----------
mkdir -p "$LOG_DIR"
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
LOG_FILE="$LOG_DIR/fine-tune-$TIMESTAMP.log"

# ---------- Keep‑awake wrapper ----------
# macOS → caffeinate, Linux → systemd‑inhibit, Windows → PowerShell “Add‑Power‑Scheme”
if command -v caffeinate >/dev/null; then
  KEEP_AWAKE="caffeinate -dims"
elif command -v systemd-inhibit >/dev/null; then
  KEEP_AWAKE="systemd-inhibit --what=handle-lid-switch:sleep --who=finetune --why='Fine‑tuning model' --mode=block"
else
  KEEP_AWAKE=""
fi

# ---------- Run training ----------
CMD="python -m mlx_lm.lora \
  --model $MODEL \
  --data $DATA \
  --lora-layers $LORA_LAYERS \
  --batch-size $BATCH_SIZE \
  --iters $ITERS \
  --val-batches $VAL_BATCHES \
  --learning-rate $LR \
  --steps-per-eval $STEPS_PER_EVAL \
  --save-every $SAVE_EVERY \
  --adapter-file $ADAPTER_FILE \
  --max-seq-length $MAX_SEQ"

echo "🚀 Starting fine‑tune at $(date)" | tee "$LOG_FILE"
echo "🔧 Command: $CMD" >>"$LOG_FILE"

# Run inside keep‑awake wrapper, detach with nohup
nohup $KEEP_AWAKE $CMD >>"$LOG_FILE" 2>&1 &

PID=$!
echo "🛠️ Training PID: $PID (logs → $LOG_FILE)" | tee -a "$LOG_FILE"
echo "💡 When finished the LoRA adapter will be saved as $ADAPTER_FILE"
echo "   To merge it into a single .gguf file you can run:" \
     "python -m mlx_lm.merge_adapters --base $MODEL --adapter $ADAPTER_FILE --output models/${MODEL}-finetuned.gguf"

echo "✅ Fine‑tune launched in background. Use 'tail -f $LOG_FILE' to watch progress."
