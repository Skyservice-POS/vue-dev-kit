# Vue Dev Kit — Claude Notes

## Документація (VitePress)
Живий сайт: **https://74cfe434-a2b3-4d49-8fa7-db7343e399dc.apps.platform365.online/**

Джерело — папка `docs/`, локально: `npm run docs:dev`, збірка: `npm run docs:build`.
Деплой автоматичний: workflow `Deploy Docs` (`.github/workflows/deploy-docs.yml`)
на кожен пуш у `main`, що зачіпає `docs/**`, `src/**` або `package.json`. Архів
іде на платформу як Docker-образ (Dockerfile + `docs/nginx.conf` + `dist` у корені
zip), секрети — `DEPLOY_TOKEN` і `DEPLOYMENT_ID`, як у решти наших репо.

**Демо в доках імпортують компоненти напряму з `src`** (alias `@`), тож будь-яка
зміна API компонента одразу видно на сайті — але й ламає демо, якщо не оновити
його разом з компонентом.

## Реліз і публікація на npm
Публікація автоматична: пуш у `main` запускає workflow `Publish to npm`
(`.github/workflows/publish.yml`), який сам збирає й публікує пакет.

**Не запускати `npm publish` / `npm run release` руками.** Це займе номер версії
повз CI, і воркфлоу на наступному пуші просто пропустить публікацію, вирішивши,
що версія вже в реєстрі.

- **Випустити реліз** — бампнути `version` у `package.json` і змержити в `main`.
- **Залити зміни без релізу** — не чіпати `version`. Воркфлоу відпрацює, побачить
  версію в реєстрі й пропустить публікацію; джоба лишиться зеленою. Але поки
  версію не бампнули, споживачі змін не бачать.
- **Запустити вручну** — Actions → Publish to npm → Run workflow. Потрібно,
  коли зміни підпадають під `paths-ignore` (`**.md`, `.github/**`), бо такі
  пуші воркфлоу не тригерять.

Умова публікації одна: чи зайнятий уже цей номер версії (`npm view NAME@VERSION`).
Semver і доречність бампу CI не перевіряє.

**`package-lock.json` лежить у репозиторії** — раніше він був у `.gitignore`, що не
давало нічого, крім розбіжних збірок і `npm install` без кешу. Тепер `cache: npm`
у setup-node працює.

У CI лишається **`npm install`, не `npm ci`**: npm на раннері новіший за локальний і
хоче в локу опційний peer `search-insights` (Algolia у VitePress), якого локальний
npm туди не кладе — `npm ci` через це падає з `Missing … from lock file`. Якщо
переводити на `npm ci`, спершу треба зрівняти версії npm або додати `search-insights`
у devDependencies явно.

## Playground
**Папки `playground/` більше немає** — її замінили доки з живими демо
(`npm run docs:dev`) і галерея `/components/gallery`. Не відроджувати:
демо мають жити поряд з документацією, інакше вони розходяться.

## Додавання нового компонента
Коли додаєш новий компонент/фічу/віджет — **обов'язково оновлюй**:
1. **Експорт у layer's `index.ts`** (`src/shared/ui/index.ts`, `src/features/index.ts`, `src/widgets/index.ts`). Без цього компонент не потрапляє в публічний API і не імпортується з пакета.
2. **`README.md`**:
   - додати компонент у "Підключення → Компоненти + SDK (разом)" import-приклад;
   - додати окрему секцію з описом, prop-таблицею, slot/event-таблицями та CSS-змінними (якщо є);
   - оновити дерево в секції "Структура проекту".
3. **Демо в доках** (`npm run docs:dev`):
   - сторінка `docs/components/<component>.md` з описом, prop/slot/event-таблицями та CSS-змінними;
   - демо-компонент `docs/.vitepress/theme/demos/<Component>Demo.vue` з основними станами
     (default / disabled / варіанти) — він імпортує компонент напряму з `src`;
   - картка в галереї `docs/.vitepress/theme/ComponentGallery.vue` і пункт у сайдбарі `docs/.vitepress/config.mts`.

Це стосується і випадків, коли merge-иш PR з новими компонентами — пройдись по чек-листу і виправ, якщо щось пропустили.
