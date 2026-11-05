#!/usr/bin/env bash
# Создаёт ключ подписи релизов и печатает значения для секретов GitHub.
# Запускайте ОДИН раз на своём компьютере. Файл ключа и пароли храните в надёжном месте:
# если их потерять, обновлять приложение в Google Play / RuStore станет невозможно.
set -euo pipefail
OUT="${1:-kuhnya-release.jks}"
ALIAS="kuhnya"
if [ -e "$OUT" ]; then echo "Файл $OUT уже существует — не перезаписываю." >&2; exit 1; fi
command -v keytool >/dev/null || { echo "Нужен keytool (входит в JDK)." >&2; exit 1; }

read -rsp "Придумайте пароль ключа (не короче 6 символов): " PASS; echo
read -rsp "Повторите пароль: " PASS2; echo
[ "$PASS" = "$PASS2" ] || { echo "Пароли не совпадают." >&2; exit 1; }

keytool -genkeypair -v -keystore "$OUT" -alias "$ALIAS" -keyalg RSA -keysize 4096 -validity 10000 \
  -storepass "$PASS" -keypass "$PASS" -dname "CN=Kuhnya, O=Kitchen Science, C=RU"

echo
echo "Готово: $OUT. Добавьте в GitHub → Settings → Secrets and variables → Actions:"
echo "  ANDROID_KEY_ALIAS          = $ALIAS"
echo "  ANDROID_KEYSTORE_PASSWORD  = (ваш пароль)"
echo "  ANDROID_KEY_PASSWORD       = (тот же пароль)"
echo "  ANDROID_KEYSTORE_BASE64    = содержимое файла $OUT.base64 (создан рядом)"
base64 -w0 "$OUT" > "$OUT.base64" 2>/dev/null || base64 -i "$OUT" -o "$OUT.base64"
echo "После добавления секрета удалите $OUT.base64. Сам $OUT сохраните в резервной копии, НЕ в репозитории."
