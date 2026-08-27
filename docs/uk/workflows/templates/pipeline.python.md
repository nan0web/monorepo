# Pipeline для Релізу v1.0.0: Python / Mistral-Vibe Реліз

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
vibe -p "Реалізуй та виконай реліз task.md відповідно до контракту test_task.py" --trust --auto-approve
```

## 4. Run Full Verification Suite
```bash
pytest tests/
```
