// Готовит нативный Android-проект из веб-сборки (dist/).
// Папка android/ не хранится в git: она полностью воспроизводится этим скриптом.
//
//   VERSION_CODE  целое число, должно расти с каждой сборкой (в CI — номер запуска)
//   VERSION_NAME  версия для пользователя (в CI — из тега v1.2.3), по умолчанию из package.json
import { execSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const run = cmd => { console.log('$ ' + cmd); execSync(cmd, { stdio: 'inherit' }); };
const pkg = JSON.parse(readFileSync('package.json', 'utf8'));

const versionCode = parseInt(process.env.VERSION_CODE || '1', 10);
const versionName = (process.env.VERSION_NAME || pkg.version).replace(/^v/, '');
if (!Number.isInteger(versionCode) || versionCode < 1 || versionCode > 2100000000) throw new Error('VERSION_CODE должен быть целым числом от 1');
if (!existsSync('dist/index.html')) throw new Error('Нет dist/: сначала выполните npm run build');

if (!existsSync('android')) run('npx cap add android');

// Иконка и заставка из assets/ (светлая и тёмная тема)
run("npx capacitor-assets generate --android --iconBackgroundColor '#F7F3EB' --iconBackgroundColorDark '#181716' --splashBackgroundColor '#F7F3EB' --splashBackgroundColorDark '#181716'");

// Версия приложения
const gradlePath = 'android/app/build.gradle';
let gradle = readFileSync(gradlePath, 'utf8');
gradle = gradle.replace(/versionCode \d+/, `versionCode ${versionCode}`).replace(/versionName "[^"]*"/, `versionName "${versionName}"`);
// Debug-сборки подписываются ключом debug.keystore из корня репозитория, а не случайным
// ключом машины сборки: иначе каждая новая тестовая сборка не ставится поверх предыдущей
// («подпись пакета и установленного приложения не совпадают»).
if (!gradle.includes('kuhnya-debug-signing')) {
  gradle = gradle.replace(/android\s*\{/, `android {
    // kuhnya-debug-signing
    signingConfigs {
        debug {
            storeFile rootProject.file('../debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
    }`);
}
writeFileSync(gradlePath, gradle);
console.log(`Версия: ${versionName} (code ${versionCode})`);

// Сервер Gradle иногда отвечает дольше 10 с по умолчанию — даём минуту
const wrapperPath = 'android/gradle/wrapper/gradle-wrapper.properties';
let wrapper = readFileSync(wrapperPath, 'utf8');
wrapper = /networkTimeout=/.test(wrapper) ? wrapper.replace(/networkTimeout=\d+/, 'networkTimeout=60000') : wrapper + '\nnetworkTimeout=60000\n';
writeFileSync(wrapperPath, wrapper);

// Точные будильники для кухонных таймеров: без них Android 12+ может присылать
// уведомление таймера с опозданием на несколько минут
const manifestPath = 'android/app/src/main/AndroidManifest.xml';
let manifest = readFileSync(manifestPath, 'utf8');
if (!manifest.includes('USE_EXACT_ALARM')) {
  manifest = manifest.replace('</manifest>', `    <uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" android:maxSdkVersion="32" />
    <uses-permission android:name="android.permission.USE_EXACT_ALARM" />
</manifest>`);
  writeFileSync(manifestPath, manifest);
}

run('npx cap sync android');
