#!/bin/bash
echo "Пакування Zero-Hallucination Framework..."
rm -f nan0web-agent-core.zip
zip -r nan0web-agent-core.zip .agent/ templates/ > /dev/null
echo "Готово: nan0web-agent-core.zip (Цей архів можна віддавати клієнтам після оплати)"
