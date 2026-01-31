# Импорт проекта в GitHub и запуск на Vercel

Пошаговая инструкция: как выложить проект в GitHub и подключить его к [Vercel](https://vercel.com/).

---

## 1. Установите Git (если ещё не установлен)

- Скачайте: [https://git-scm.com/download/win](https://git-scm.com/download/win)
- Установите с настройками по умолчанию (в PATH должен быть добавлен `git`).

Проверка в терминале:

```bash
git --version
```

---

## 2. Импорт проекта в GitHub

### Вариант A: через сайт GitHub (без Git в системе)

1. Откройте [https://github.com/new](https://github.com/new).
2. Укажите имя репозитория (например, `nutrition-tracking-app`).
3. Выберите **Public**, не добавляйте README, .gitignore и лицензию.
4. Нажмите **Create repository**.
5. На странице репозитория нажмите **“uploading an existing file”** (или перетащите папку в область загрузки).
6. Загрузите **все файлы и папки** из папки проекта **кроме**:
   - `node_modules`
   - `dist`
   - `.env` (если есть)
7. Внизу страницы нажмите **Commit changes**.

Репозиторий будет создан и заполнен вашим кодом.

### Вариант B: через Git в терминале (рекомендуется)

Откройте терминал (PowerShell или cmd) в папке проекта:

```powershell
cd "C:\Users\camer\Desktop\New folder"
```

Инициализация репозитория и первый коммит:

```powershell
git init
git add .
git commit -m "Initial commit: Nutrition Tracking App"
```

Создание репозитория на GitHub:

1. Зайдите на [https://github.com/new](https://github.com/new).
2. Имя репозитория, например: `nutrition-tracking-app`.
3. **Не** ставьте галочки на README, .gitignore, License.
4. Нажмите **Create repository**.

Подключение удалённого репозитория и отправка кода (подставьте свой логин и имя репо):

```powershell
git remote add origin https://github.com/ВАШ_ЛОГИН/nutrition-tracking-app.git
git branch -M main
git push -u origin main
```

При первом `git push` браузер или Git запросит авторизацию на GitHub (логин/пароль или токен).

---

## 3. Запуск на Vercel

1. Откройте [https://vercel.com](https://vercel.com/) и войдите (удобно через **Continue with GitHub**).
2. Нажмите **Add New…** → **Project**.
3. Выберите репозиторий **nutrition-tracking-app** (или как вы его назвали).
4. Vercel подставит:
   - **Framework Preset:** Vite  
   - **Build Command:** `npm run build`  
   - **Output Directory:** `dist`  
   Оставьте как есть (в проекте уже есть `vercel.json` с этими настройками).
5. Если используете Supabase, в **Environment Variables** добавьте:
   - `VITE_SUPABASE_URL` — URL проекта Supabase  
   - `VITE_SUPABASE_ANON_KEY` — анонимный ключ  
   Для каждой переменной выберите окружения: Production, Preview (по желанию).
6. Нажмите **Deploy**.

После сборки приложение будет доступно по ссылке вида:

`https://nutrition-tracking-app-xxxx.vercel.app`

(или по вашему домену, если настроите в Vercel.)

---

## 4. Дальнейшие обновления

- При **загрузке через сайт GitHub**: обновляйте файлы через веб-интерфейс (Edit file / Upload files).
- При **работе через Git**: после изменений в проекте выполните:

```powershell
git add .
git commit -m "Описание изменений"
git push
```

Vercel автоматически соберёт и задеплоит новый вариант после каждого `git push` в ветку `main`.

---

## Что не попадает в GitHub (уже в .gitignore)

- `node_modules`
- `dist`
- `.env`, `.env.local`, `.env.production.local`

Секреты (Supabase URL и ключ) задавайте только в **Environment Variables** в Vercel, не в репозитории.
