# Ассеты визуального оформления

## Файлы пользователя

- `ref.png` — референс атмосферы и интерфейса. Не используется как увеличенный скриншот страницы.
- `ania.png` → Аня; `maksim.png` → Максим; `lena.png` → Лена; `ilya.png` → Илья; `sofia.png` → София.
- `characters.png` — общий исходный лист; использован для визуальной сверки, не для сюжетных данных.
- `darles_logo.png` — небольшой знак студии в правом верхнем углу; ссылка на `https://darlesgames.github.io/` открывается в новой вкладке. Под логотипом — пометка «В разработке».

Отдельные портреты подключены целиком, без изменения исходных файлов. В карточке имя и профессия уже присутствуют в изображении, поэтому второй видимой подписи поверх изображения нет. Есть альтернативный текст и скрытые семантические заголовки. В разговоре имя отдельно присутствует в шапке чата для удобства навигации.

## Новые файлы

- `coworking-night.png` — декоративная ночная сцена для главной и оформления завязки. Создана встроенным инструментом `image_gen.imagegen` по навыку `imagegen`; API-ключи и библиотеки в продукт не добавлены. Сохранена в проекте, исходная генерация оставлена в каталоге Codex.
- `ui-icons.svg` — локальный набор из 10 SVG-символов: поиск, свидетели, подсказка, блокнот, назад, сброс, отправка, диалог, файл и подтверждение.
- `microphone.svg` — локальная иконка микрофона; подключена CSS-маской, поэтому не исчезает при изменении текста статуса.
- `favicon.svg` — значок вкладки.
- `paper-grain.svg` — процедурное зерно для ненавязчивой фактуры фона.

SVG созданы как код. Фоновая сцена и все декоративные элементы не являются новыми уликами. Истина и знания персонажей берутся из JSON истории.

## Финальный промпт фона

Reference image: `assets/ref.png`, reference only, not an edit target.

```text
Use case: stylized-concept. Asset type: wide illustrated background for a Russian language detective browser game. Reference image: assets/ref.png is a visual mood/layout reference ONLY, not an edit target. Create a single cinematic environment illustration, no UI and NO TEXT: the exterior of an old five-storey urban coworking building at night after rain, warm amber-lit windows, a mysterious small red glow at the entrance, wet pavement, cool desaturated teal moonlight and atmospheric mist, dark trees framing the edges. Hand-painted detailed graphic-novel detective art, grounded mystery rather than horror. Landscape composition, building on the right two-thirds, dark quiet negative space on the left for real HTML text; subtle vignette, tactile painterly textures. No people, no monsters, no signage, no letters, no logos, no collage, no watermark. Match the reference's warm/cold lighting and ink-black shadows. This is decorative setting only, no additional story evidence.
```
