# Project Genome — Synthetic Health Dashboard

A public, multilingual showcase of a personal-health dashboard. It demonstrates
sleep architecture, recovery, heart rate, activity, workouts, weight/BMI,
fictional blood results, fictional genotype variants and evidence-linked
recommendations without containing any real person's health records.

The interface opens in English and supports Russian and Portuguese switching.

## Synthetic-data guarantee

- Every measurement in `src/data.json` is generated deterministically.
- The generator does not read the private dashboard or any health export.
- No account, device, application or person identifier is included.
- The fictional profile covers 150 days, 36 workouts, six body measurements,
  17 blood biomarkers and eight genotype variants.
- Genetic and laboratory fixtures are explicitly synthetic and include
  conservative interpretation boundaries; they are not copied from a person.

The values are plausible product-demo fixtures, not clinical observations and
not medical advice.

## Run locally

Requirements: Node.js 20 or newer and npm.

```bash
npm ci
npm run dev
```

Open the local address printed by Vite.

## Regenerate the demo data

The generator uses a fixed seed, so the output is reproducible:

```bash
node src/content/shared/generate-synthetic-data.mjs
```

The generated snapshot includes deliberate missing nights, gradual trends and
bounded relationships between sleep, HRV, resting heart rate and activity.

## Verify and build

```bash
npm run build
```

Generated builds, portable offline exports, environment files and local
dependencies are excluded from Git.

## Important files

- `src/content/dashboard/DashboardContent.jsx` — dashboard content and layout.
- `src/content/shared/generate-synthetic-data.mjs` — deterministic fixture generator.
- `src/data.json` — generated reviewed snapshot used by the dashboard.
- `src/theme.css` — visual theme tokens.
- `AGENTS.md` — runtime and authoring boundaries.

## License

MIT. See `LICENSE`.
