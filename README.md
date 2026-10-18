<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/header-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="assets/header-light.svg">
  <img alt="Jeevan, full-stack TypeScript developer and open-source contributor" src="assets/header-dark.svg" width="100%">
</picture>

Full-stack developer working mostly in **TypeScript**: Next.js and React on the front, Node/Express and Supabase/Postgres or MongoDB behind it, deployed on Vercel and Cloudflare. I like shipping things people can actually open and use, and I contribute fixes to open-source projects I learn from.

**Portfolio:** [jeevan2410.github.io/Portfolio](https://jeevan2410.github.io/Portfolio/)

## Open-source contributions

Merged:

- **[libredb/libredb-studio#1522](https://github.com/libredb/libredb-studio/pull/1522)**: MongoDB whole-database Validate and Compact no longer crash on views; time series collections are handled and per-collection failures are reported (verified on MongoDB 7.0, 8.0 and 8.2).
- **[libredb/libredb-studio#1554](https://github.com/libredb/libredb-studio/pull/1554)**: MongoDB schema inference and the data profiler count fields missing from some documents as nullable.
- **[libredb/libredb-studio#1556](https://github.com/libredb/libredb-studio/pull/1556)**: Monitoring labels a Percona Server correctly instead of calling it MySQL.
- **[libredb/libredb-studio#1561](https://github.com/libredb/libredb-studio/pull/1561)**: running a selected statement in the editor drops its trailing terminator on engines that take none, such as Oracle and Elasticsearch.
- **[libredb/libredb-studio#1562](https://github.com/libredb/libredb-studio/pull/1562)**: LibreDB connections refuse `:memory:` and name a missing directory clearly.
- **[libredb/libredb-studio#1571](https://github.com/libredb/libredb-studio/pull/1571)**: ClickHouse, Druid, libSQL and Couchbase name the refusal and the address when a server cannot be reached, instead of "fetch failed".
- **[libredb/libredb-studio#1595](https://github.com/libredb/libredb-studio/pull/1595)**: CockroachDB functions and procedures no longer offer an Edit that every apply refused; the provider measures at connect whether the server runs the edit guard (verified on CockroachDB v26.3.2 and PostgreSQL 18.6).
- **[libredb/libredb-studio#1609](https://github.com/libredb/libredb-studio/pull/1609)**: the Explain panel works on Vitess 25, whose vtgate refuses to explain a statement that names no table; the connect-time probe now asks against a table of the keyspace (verified on Vitess 25 and 24, MySQL, MariaDB, TiDB and StarRocks).
- **[libredb/libredb-studio#1620](https://github.com/libredb/libredb-studio/pull/1620)**: inline row edit saves on StarRocks, which refuses to prepare an UPDATE; a statement refused that way is sent once more as text with its values safely written in (verified on StarRocks 4.1.6 and 3.3.22, MySQL and Doris).
- **[lingui/js-lingui#2703](https://github.com/lingui/js-lingui/pull/2703)**: the Vite plugin's native macro transform no longer fails on module ids with a query string (React Router framework mode).
- **[lingui/js-lingui#2718](https://github.com/lingui/js-lingui/pull/2718)**: the macro reference no longer documents a `format` prop that `<Plural>` and `<SelectOrdinal>` never had, and says how `#` is formatted.
- **[reticlehq/reticle#1574](https://github.com/reticlehq/reticle/pull/1574)**: `reticle init` finds a Next.js root layout that lives in a route group instead of reporting there is none.
- **[reticlehq/reticle#1603](https://github.com/reticlehq/reticle/pull/1603)**: `reticle init` names the route-group root layouts it left without `<ReticleDev />`, so no route goes unobserved silently.
- **[reticlehq/reticle#1719](https://github.com/reticlehq/reticle/pull/1719)**: `reticle init` leaves a `CLAUDE.md` that only imports `AGENTS.md` alone, so Claude Code no longer loads the Reticle rule twice.
- **[reticlehq/reticle#1720](https://github.com/reticlehq/reticle/pull/1720)**: `reticle init` and `setup mcp` no longer crash on Android (Termux), FreeBSD or OpenBSD; those hosts plan agent configs with the Linux paths.
- **[reticlehq/reticle#1730](https://github.com/reticlehq/reticle/pull/1730)**: the stale-response check no longer reports a page query and its count query that differ only in `page_size` (or `take`, `skip`, `$top` and other paging spellings) as a race.

Shipped in a release: [reticle#1402](https://github.com/reticlehq/reticle/pull/1402), an absent check on a hidden element names `state: hidden` ([Reticle 3.6.0](https://github.com/reticlehq/reticle/releases/tag/v3.6.0)).

Listed as a contributor in [LibreDB Studio's CONTRIBUTORS.md](https://github.com/libredb/libredb-studio/blob/main/CONTRIBUTORS.md) for 1.0.0.

In review: [reticle#1737](https://github.com/reticlehq/reticle/pull/1737), [corsair#1847](https://github.com/corsairdev/corsair/pull/1847).

## Projects

| Project | What it is | Stack |
|---|---|---|
| **[AdikeCast](https://github.com/Jeevan2410/price-forecasting)** · [live](https://adikecast.vercel.app) | Weekly arecanut price forecasts for Dakshina Kannada markets, turned into a plain Sell / Hold signal for farmers, in English and Kannada, with a free JSON API | Next.js 16, TypeScript, Zod |
| **[QuoteFlow](https://github.com/Jeevan2410/projrc)** | Quote-to-cash SaaS for small service businesses: enquiries, quotes, jobs and follow-ups | Next.js 16, TypeScript, Cloudflare Workers |
| **[CineGen API](https://github.com/Jeevan2410/CineGen-API)** | Backend for AI video and image generation: JWT auth and roles, credits, async jobs via queue, signed webhooks and a fallback poller | Node.js, Express, MongoDB, Cloudinary |
| **[Tiny Planet: Shrines of the Blight](https://github.com/Jeevan2410/Tiny-Planet-Action-RPG)** · [play](https://tiny-planet-action-rpg.vercel.app) | A 3D action-RPG on a tiny round world, with quests, gear, saves and a synthesised audio engine | Three.js, TypeScript, Vite, IndexedDB |
| **[Tiny Planet Courier](https://github.com/Jeevan2410/Tiny-Planet-Courier)** · [play](https://tiny-planet-courier.vercel.app) | Multiplayer browser delivery game with other players in real time | Three.js, Supabase Realtime |
| **[BookNest](https://github.com/Jeevan2410/BookNest)** · [live](https://book-nest-lemon-eight.vercel.app) | A bookstore and book-box subscription site: browse by genre, build a box, gifts, membership, accounts and checkout | React, Supabase, Framer Motion |
| **[achievement-tracker](https://github.com/Jeevan2410/achievement-tracker)** | CLI that shows progress toward GitHub achievement tiers | TypeScript, GitHub REST and GraphQL |

### My first college projects, rebuilt in 2026

| Project | What changed |
|---|---|
| **[Weather](https://github.com/Jeevan2410/WeatherApp)** · [live](https://weather-app-lac-iota-59.vercel.app) | Animated sky with canvas rain and snow; Open-Meteo instead of a committed API key |
| **[Calculator](https://github.com/Jeevan2410/Calculator)** · [live](https://calculator-six-iota-56.vercel.app) | A safe parser instead of `eval`, history, keyboard input, 3D tilt |
| **[To-do](https://github.com/Jeevan2410/TO-DO-LIST)** · [live](https://jeevan2410.github.io/TO-DO-LIST/) | Drag to reorder, undo, FLIP animations; JSON storage instead of saved HTML |
| **[Reelhouse](https://github.com/Jeevan2410/Netflix-Clone)** · [live](https://jeevan2410.github.io/Netflix-Clone/) | A copied sign-up page turned into an original TV show browser on TVmaze |
| **[Halcyon One](https://github.com/Jeevan2410/Landing-Page)** · [live](https://jeevan2410.github.io/Landing-Page/) | A concept smartwatch modelled in Three.js that turns as you scroll |
| **[Jeevan Travels](https://github.com/Jeevan2410/Travel-Website-)** · [live](https://travel-website-ashen-seven.vercel.app) | A trip planner on a 3D dotted globe with live weather and share links |
| **[JeevanKitchen](https://github.com/Jeevan2410/Food-Website)** · [live](https://food-website-lovat-pi.vercel.app) | Recipes with a cook mode, one-tap timers and a screen that stays awake |

## Tools I use

TypeScript · JavaScript · React · Next.js · Astro · Node.js · Express · Supabase · PostgreSQL · MongoDB · Tailwind CSS · Three.js · Vercel · Cloudflare

## Open to

Freelance projects and junior / internship roles in full-stack web development.

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/footer-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="assets/footer-light.svg">
  <img alt="" src="assets/footer-dark.svg" width="100%">
</picture>
