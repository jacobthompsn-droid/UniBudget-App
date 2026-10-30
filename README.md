# UniBudget-App

UniBudget is a budgeting app made for college students. Plan a weekly budget, log spending in seconds, unlock local student discounts, and track savings goals, all in one simple app.

## Features

- **Weekly Budget Planner**: enter your weekly spending money and Auto plan splits it into Food, Transport, School, Fun and Other. Log expenses with an amount, category, note and date. Category bars turn amber at 80% and red when you go over, and the app warns you as you log. Browse past weeks.
- **Student Discounts**: search and filter local student deals, open a deal to see its code, and log each use so your savings add up.
- **Savings Tracker**: create goals, add or take out money, and track progress toward each target.
- **Privacy first**: no bank login and no account. All data stays in the browser on your device (localStorage). Back up and restore your data as a JSON file from Settings.
- **Installable**: works as a Progressive Web App. Add it to your home screen and it runs full screen, including offline.

## Project structure

```
index.html             App shell
css/app.css            Styles
js/data.js             Categories, pilot deals and goal icons (edit deals here)
js/app.js              App logic
sw.js                  Service worker for offline support
manifest.webmanifest   PWA manifest
icons/                 App icons and social preview image
_headers               Cloudflare Pages security and cache headers
```

There is no build step. Any static file host can serve the folder as is.

## Run locally

```
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Deploy (Cloudflare Pages)

Every push to `main` deploys to Cloudflare Pages through GitHub Actions (`.github/workflows/deploy.yml`), as the project `unibudgetsavingsapp` at https://unibudgetsavingsapp.pages.dev. The first run creates the Pages project.

One-time setup, in the repo's Settings > Secrets and variables > Actions:

- `CLOUDFLARE_API_TOKEN`: a Cloudflare API token with the "Cloudflare Pages: Edit" permission
- `CLOUDFLARE_ACCOUNT_ID`: your Cloudflare account ID

When you change any app file, bump `VERSION` in `sw.js` so installed copies pick up the update.

## Updating deals

The deals in `js/data.js` are pilot offers used while real partnerships are signed. Replace or add entries in the `deals` list with real partner offers.
