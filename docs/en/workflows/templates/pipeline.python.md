# Pipeline for Release v1.0.0: Python / Mistral-Vibe Release

## 1. Fast-Fail Syntax Check
```bash
python -m py_compile test_task.py
```

## 2. Run Release Spec Contract Tests
```bash
pytest test_task.py -v
```

## 3. Execute Release Task (Direct)
```bash
vibe -p "Execute and implement release task.md according to test_task.py contract" --trust --auto-approve
```

## 4. Run Full Verification Suite
```bash
pytest tests/
```
