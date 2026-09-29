import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, "../../..");
const outputPath = path.join(projectRoot, "src/data.json");

function mulberry32(seed) {
  return () => {
    let value = seed += 0x6D2B79F5;
    value = Math.imul(value ^ value >>> 15, value | 1);
    value ^= value + Math.imul(value ^ value >>> 7, value | 61);
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
}

const random = mulberry32(20260928);
const jitter = (range = 1) => (random() - 0.5) * 2 * range;
const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));
const round = (value, digits = 0) => Number(value.toFixed(digits));
const pad = value => String(value).padStart(2, "0");
const isoDate = date => `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
const addDays = (date, days) => new Date(date.getTime() + days * 86400000);

const startDate = new Date("2026-05-01T12:00:00Z");
const dayCount = 150;
const missingSleep = new Set([17, 58, 104]);

const dailyHealth = Array.from({ length: dayCount }, (_, index) => {
  const date = addDays(startDate, index);
  const weekday = date.toLocaleDateString("en-GB", { weekday: "long", timeZone: "UTC" });
  const weekend = [0, 6].includes(date.getUTCDay());
  const seasonal = Math.sin((index / dayCount) * Math.PI * 2);
  const activityTrend = index / (dayCount - 1);
  const sleepAvailable = !missingSleep.has(index);
  const sleepMinutes = sleepAvailable
    ? Math.round(clamp(425 + (weekend ? 32 : 0) + seasonal * 9 + activityTrend * 8 + jitter(34), 350, 515))
    : null;
  const awakeMinutes = sleepAvailable ? Math.round(clamp(31 + jitter(13), 12, 62)) : null;
  const deepMinutes = sleepAvailable ? Math.round(sleepMinutes * clamp(0.18 + jitter(0.025), 0.13, 0.23)) : null;
  const remMinutes = sleepAvailable ? Math.round(sleepMinutes * clamp(0.22 + jitter(0.025), 0.17, 0.28)) : null;
  const lightMinutes = sleepAvailable ? sleepMinutes - deepMinutes - remMinutes : null;
  const sleepQuality = sleepAvailable ? (sleepMinutes - 420) / 35 - awakeMinutes / 30 : 0;
  const steps = Math.round(clamp(6900 + activityTrend * 1700 + (weekend ? 900 : 0) + seasonal * 500 + jitter(2600), 2100, 16800));
  const activeMinutes = Math.round(clamp(33 + (steps - 7000) / 260 + jitter(14), 8, 92));
  const restingHeartRate = round(clamp(59.5 - activityTrend * 2.2 - sleepQuality * 0.65 + jitter(2.4), 52, 67), 0);
  const avgHrv = round(clamp(47 + activityTrend * 4.5 + sleepQuality * 2.7 + jitter(6), 31, 68), 0);
  const sleepHrv = round(clamp(avgHrv + 7 + jitter(4), 38, 78), 0);
  const avgHeartRate = round(clamp(restingHeartRate + 13 + steps / 4300 + jitter(2), 67, 83), 0);
  const sleepStartMinute = sleepAvailable ? Math.round(clamp(1405 + (weekend ? 24 : 0) + jitter(25), 1350, 1480)) : null;
  const sleepEndMinute = sleepAvailable ? (sleepStartMinute + sleepMinutes + awakeMinutes) % 1440 : null;
  const avgSpo2 = round(clamp(97.2 + jitter(0.55), 95.6, 98.5), 1);
  const wristTemperatureBaseline = 33.18;
  const wristTemperature = round(wristTemperatureBaseline + seasonal * 0.09 + jitter(0.18), 2);

  return {
    date: isoDate(date),
    weekday,
    sleepMinutes,
    sleepHours: sleepAvailable ? round(sleepMinutes / 60, 2) : null,
    sleepScore: sleepAvailable ? Math.round(clamp(77 + sleepQuality * 4 + jitter(5), 58, 94)) : null,
    deepMinutes,
    lightMinutes,
    remMinutes,
    awakeMinutes,
    stageMinutesTotal: sleepAvailable ? sleepMinutes + awakeMinutes : null,
    sleepStartMinute,
    sleepEndMinute,
    avgHeartRate,
    restingHeartRate,
    sleepBaseHeartRate: round(clamp(restingHeartRate - 3 + jitter(1.5), 49, 64), 0),
    minHeartRate: round(clamp(restingHeartRate - 8 + jitter(2), 44, 60), 0),
    maxHeartRate: round(clamp(118 + activeMinutes * 0.55 + jitter(18), 105, 176), 0),
    avgHrv,
    sleepHrv,
    avgStress: round(clamp(36 - sleepQuality * 2 + jitter(7), 20, 55), 0),
    avgSpo2,
    minSpo2: round(clamp(avgSpo2 - 2.2 + jitter(0.8), 92.5, 97), 1),
    sleepSpo2: round(clamp(avgSpo2 - 0.25 + jitter(0.35), 94.8, 98.2), 1),
    respiratoryRate: round(clamp(14.3 - sleepQuality * 0.08 + jitter(0.65), 12.4, 16.2), 1),
    respiratorySamples: 96,
    wristTemperature,
    wristTemperatureBaseline,
    steps,
    distanceKm: round(steps * 0.00072, 2),
    activeCaloriesKcal: Math.round(clamp(180 + activeMinutes * 5.4 + jitter(55), 160, 720)),
    activeMinutes,
    moveBreaks: Math.round(clamp(8 + steps / 2200 + jitter(2), 5, 16)),
    ahi: null,
    osaLevel: null,
  };
});

const workoutTypes = [
  ...Array(18).fill("Strength training"),
  ...Array(9).fill("Outdoor run"),
  ...Array(6).fill("Outdoor cycle"),
  ...Array(3).fill("Trail hiking"),
];

const workouts = workoutTypes.map((name, index) => {
  const dayIndex = Math.round(((index + 1) * (dayCount - 4)) / (workoutTypes.length + 1));
  const date = addDays(startDate, dayIndex);
  const dateString = isoDate(date);
  const weekend = [0, 6].includes(date.getUTCDay());
  const startHour = weekend ? 10 : 18;
  const durationBase = name === "Strength training" ? 58 : name === "Outdoor run" ? 43 : name === "Outdoor cycle" ? 72 : 112;
  const durationMinutes = Math.round(clamp(durationBase + jitter(name === "Trail hiking" ? 24 : 12), 28, 145));
  const avgBase = name === "Strength training" ? 119 : name === "Outdoor run" ? 146 : name === "Outdoor cycle" ? 132 : 116;
  const avgHeartRate = Math.round(avgBase + jitter(7));
  const start = `${dateString}T${pad(startHour)}:${pad((index * 7) % 50)}:00+01:00`;
  const endDate = new Date(`${dateString}T${pad(startHour)}:${pad((index * 7) % 50)}:00Z`);
  endDate.setUTCMinutes(endDate.getUTCMinutes() + durationMinutes);
  const end = `${isoDate(endDate)}T${pad(endDate.getUTCHours())}:${pad(endDate.getUTCMinutes())}:00+01:00`;
  const distanceKm = name === "Outdoor run" ? round(durationMinutes / 6.1, 2)
    : name === "Outdoor cycle" ? round(durationMinutes * 0.34, 2)
      : name === "Trail hiking" ? round(durationMinutes * 0.075, 2) : 0;
  return {
    start,
    end,
    date: dateString,
    name,
    sportType: name === "Strength training" ? 12 : name === "Outdoor run" ? 1 : name === "Outdoor cycle" ? 3 : 8,
    durationMinutes,
    avgHeartRate,
    maxHeartRate: Math.round(avgHeartRate + 24 + jitter(8)),
    caloriesKcal: Math.round(durationMinutes * (name === "Strength training" ? 6.2 : name === "Outdoor run" ? 9.1 : name === "Outdoor cycle" ? 7.4 : 5.7)),
    distanceKm,
    steps: name === "Outdoor run" || name === "Trail hiking" ? Math.round(distanceKm * 1320) : 0,
  };
}).sort((a, b) => a.start.localeCompare(b.start));

const latestDate = dailyHealth.at(-1).date;
const sleepStart = `${isoDate(addDays(startDate, dayCount - 2))}T23:18:00+01:00`;
const stagePattern = [
  ["awake", 12], ["light", 26], ["deep", 34], ["light", 21], ["deep", 24],
  ["light", 31], ["rem", 22], ["awake", 6], ["light", 28], ["deep", 29],
  ["light", 34], ["rem", 27], ["awake", 5], ["light", 36], ["deep", 20],
  ["light", 31], ["rem", 31], ["awake", 7], ["light", 34], ["deep", 13],
  ["light", 28], ["rem", 37], ["awake", 6], ["light", 25], ["rem", 32],
  ["light", 19], ["awake", 9],
].map(([stage, duration]) => [stage, stage === "awake" ? duration : Math.round(duration * 0.78)]);

let stageOffset = 0;
const latestSleepStages = stagePattern.map(([stage, durationMinutes], index) => {
  const start = new Date(new Date(sleepStart).getTime() + stageOffset * 60000);
  const end = new Date(start.getTime() + durationMinutes * 60000);
  const row = {
    index: index + 1,
    stage,
    stageCode: { deep: 2, rem: 3, light: 4, awake: 5 }[stage],
    start: start.toISOString(),
    end: end.toISOString(),
    startOffsetMinutes: stageOffset,
    endOffsetMinutes: stageOffset + durationMinutes,
    durationMinutes,
  };
  stageOffset += durationMinutes;
  return row;
});

const stageTotals = latestSleepStages.reduce((totals, row) => {
  totals[row.stage] = (totals[row.stage] || 0) + row.durationMinutes;
  return totals;
}, {});
const latestSleepMinutes = stageTotals.deep + stageTotals.light + stageTotals.rem;
const latestDaily = dailyHealth.at(-1);
Object.assign(latestDaily, {
  sleepMinutes: latestSleepMinutes,
  sleepHours: round(latestSleepMinutes / 60, 2),
  deepMinutes: stageTotals.deep,
  lightMinutes: stageTotals.light,
  remMinutes: stageTotals.rem,
  awakeMinutes: stageTotals.awake,
  stageMinutesTotal: stageOffset,
  sleepStartMinute: 23 * 60 + 18,
  sleepEndMinute: (23 * 60 + 18 + stageOffset) % 1440,
  sleepScore: 86,
});

const sleepEnd = new Date(new Date(sleepStart).getTime() + stageOffset * 60000).toISOString();
const latestSleepSummary = [{
  date: latestDate,
  start: sleepStart,
  end: sleepEnd,
  totalSleepMinutes: latestSleepMinutes,
  deepMinutes: stageTotals.deep,
  lightMinutes: stageTotals.light,
  remMinutes: stageTotals.rem,
  awakeMinutes: stageTotals.awake,
  wakeCount: latestSleepStages.filter(row => row.stage === "awake").length,
  sleepScore: 86,
}];

const weightValues = [72.4, 72.1, 71.8, 71.5, 71.2, 70.9];
const weightDates = ["2026-05-05", "2026-06-02", "2026-07-07", "2026-08-04", "2026-09-01", "2026-09-25"];
const heightM = 1.72;
const bodyMetrics = weightValues.map((weightKg, index) => ({
  timestamp: `${weightDates[index]}T07:3${index}:00+01:00`,
  date: weightDates[index],
  weightKg,
  heightM,
  bmi: round(weightKg / (heightM * heightM), 2),
  sourcePackage: "synthetic.demo.generator",
}));

const geneticVariants = [
  { id: "mthfr", gene: "MTHFR", variant: "rs1801133 (C677T)", genotype: "C/T", category: "Nutrient metabolism", actionability: "low" },
  { id: "hfe_c282y", gene: "HFE", variant: "rs1800562 (C282Y)", genotype: "G/G", category: "Iron handling", actionability: "informational" },
  { id: "hfe_h63d", gene: "HFE", variant: "rs1799945 (H63D)", genotype: "C/G", category: "Iron handling", actionability: "boundary" },
  { id: "cyp2c19", gene: "CYP2C19", variant: "*1/*1 demo diplotype", genotype: "Normal-function alleles", category: "Pharmacogenomics", actionability: "boundary" },
  { id: "slco1b1", gene: "SLCO1B1", variant: "*1/*1 demo diplotype", genotype: "Normal-function alleles", category: "Pharmacogenomics", actionability: "boundary" },
  { id: "apoe", gene: "APOE", variant: "rs429358 + rs7412", genotype: "ε3/ε3", category: "Common trait", actionability: "informational" },
  { id: "actn3", gene: "ACTN3", variant: "rs1815739", genotype: "C/T", category: "Sport trait", actionability: "low" },
  { id: "mcm6", gene: "MCM6/LCT", variant: "rs4988235", genotype: "C/T", category: "Food tolerance", actionability: "low" },
];

const bloodLabs = [
  { id: "hba1c", date: "2026-09-20", panel: "Glycaemic", value: 5.2, unit: "%", reference: "<5.7", status: "within" },
  { id: "fasting_glucose", date: "2026-09-20", panel: "Glycaemic", value: 5.0, unit: "mmol/L", reference: "3.9–5.5", status: "within" },
  { id: "total_cholesterol", date: "2026-09-20", panel: "Lipids", value: 4.5, unit: "mmol/L", reference: "<5.0", status: "within" },
  { id: "ldl", date: "2026-09-20", panel: "Lipids", value: 2.5, unit: "mmol/L", reference: "<3.0", status: "within" },
  { id: "hdl", date: "2026-09-20", panel: "Lipids", value: 1.45, unit: "mmol/L", reference: ">1.0", status: "within" },
  { id: "triglycerides", date: "2026-09-20", panel: "Lipids", value: 0.9, unit: "mmol/L", reference: "<1.7", status: "within" },
  { id: "apob", date: "2026-09-20", panel: "Lipids", value: 0.82, unit: "g/L", reference: "0.60–1.20", status: "within" },
  { id: "hs_crp", date: "2026-09-20", panel: "Inflammation", value: 0.7, unit: "mg/L", reference: "<3.0", status: "within" },
  { id: "haemoglobin", date: "2026-09-20", panel: "Haematology", value: 14.8, unit: "g/dL", reference: "13.5–17.5", status: "within" },
  { id: "ferritin", date: "2026-09-20", panel: "Iron", value: 72, unit: "µg/L", reference: "30–400", status: "within" },
  { id: "transferrin_saturation", date: "2026-09-20", panel: "Iron", value: 29, unit: "%", reference: "20–45", status: "within" },
  { id: "vitamin_d", date: "2026-09-20", panel: "Micronutrients", value: 52, unit: "nmol/L", reference: "50–125", status: "lower_edge" },
  { id: "vitamin_b12", date: "2026-09-20", panel: "Micronutrients", value: 410, unit: "pmol/L", reference: "145–569", status: "within" },
  { id: "folate", date: "2026-09-20", panel: "Micronutrients", value: 18.2, unit: "nmol/L", reference: "10–45", status: "within" },
  { id: "tsh", date: "2026-09-20", panel: "Thyroid", value: 2.1, unit: "mIU/L", reference: "0.4–4.0", status: "within" },
  { id: "alt", date: "2026-09-20", panel: "Liver", value: 24, unit: "U/L", reference: "0–45", status: "within" },
  { id: "creatinine", date: "2026-09-20", panel: "Kidney", value: 86, unit: "µmol/L", reference: "62–106", status: "within" },
];

const dataCoverage = [
  ["daily_health", "Daily health summaries", "Recovery", dailyHealth.length, "synthetic/daily-health.json"],
  ["sleep_stages", "Sleep-stage samples", "Sleep", 18420, "synthetic/sleep-stages.json"],
  ["heart_rate", "Heart-rate samples", "Heart", 42360, "synthetic/heart-rate.json"],
  ["hrv", "HRV samples", "Recovery", 7210, "synthetic/hrv.json"],
  ["spo2", "SpO₂ samples", "Oxygen", 14380, "synthetic/spo2.json"],
  ["respiration", "Respiratory-rate samples", "Respiration", 14400, "synthetic/respiration.json"],
  ["temperature", "Wrist-temperature samples", "Temperature", 9180, "synthetic/temperature.json"],
  ["steps", "Activity samples", "Activity", 31840, "synthetic/activity.json"],
  ["workouts", "Workout sessions", "Activity", workouts.length, "synthetic/workouts.json"],
  ["body_metrics", "Body measurements", "Assessment", bodyMetrics.length, "synthetic/body-metrics.json"],
  ["genetic_variants", "Genetic variants", "Genetics", geneticVariants.length, "synthetic/genetic-variants.json"],
  ["blood_labs", "Blood biomarkers", "Laboratory", bloodLabs.length, "synthetic/blood-labs.json"],
  ["sleep_summary", "Sleep summaries", "Sleep", dayCount - missingSleep.size, "synthetic/sleep-summary.json"],
  ["generator_manifest", "Generator manifest", "Other", 1, "src/content/shared/generate-synthetic-data.mjs"],
].map(([dataset, label, category, records, file]) => ({ dataset, label, category, records, file }));

const source = (files, extra = {}) => ({
  label: "Deterministic synthetic demo generator",
  files,
  classification: "synthetic-demo",
  generatedWithSeed: 20260928,
  caveats: [
    "Every measurement belongs to a fictional demo profile; no personal health record was used as an input.",
    "Values are plausible simulations for product demonstration and must not be used for medical decisions.",
    "Missing values are intentional and remain null rather than being converted to zero.",
  ],
  ...extra,
});

const recommendationEvidence = [
  {
    id: "activity_base", status: "maintain",
    personalBasis: "The fictional profile averages about 8,000 steps/day and includes 36 workouts, with both aerobic and resistance sessions.",
    evidence: "Public-health guidance supports 150–300 minutes/week of moderate aerobic activity plus muscle-strengthening on at least two days.",
    limitation: "The synthetic workout log does not quantify intensity zones or recovery needs precisely.",
    sourceTitle: "US Physical Activity Guidelines for Americans",
    sourceUrl: "https://odphp.health.gov/our-work/nutrition-physical-activity/physical-activity-guidelines/current-guidelines/top-10-things-know",
  },
  {
    id: "creatine", status: "consider",
    personalBasis: "18 of 36 fictional workouts are resistance-training sessions.",
    dose: "3–5 g/day is shown as an educational reference for a healthy fictional adult.",
    evidence: "Sports-nutrition evidence supports creatine for repeated high-intensity exercise.",
    limitation: "The synthetic wearable signals do not establish a deficiency or individual response.",
    caution: "Medical context is intentionally absent from the demo profile.",
    sourceTitle: "NIH Office of Dietary Supplements — Exercise and Athletic Performance",
    sourceUrl: "https://ods.od.nih.gov/factsheets/ExerciseAndAthleticPerformance-HealthProfessional/",
  },
  {
    id: "protein", status: "audit_first",
    personalBasis: "The fictional profile combines resistance training with a latest weight of 70.9 kg.",
    dose: "A 1.6 g/kg/day reference corresponds to about 113 g/day, pending a dietary audit.",
    evidence: "A meta-analysis found limited additional lean-mass benefit above roughly 1.6 g/kg/day.",
    limitation: "No fictional food diary is included, so a dietary gap is not established.",
    caution: "Clinical needs may differ substantially.",
    sourceTitle: "Morton et al. — systematic review and meta-analysis",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/28698222/",
  },
  {
    id: "vitamin_d", status: "seasonal",
    personalBasis: "Synthetic 25-OH vitamin D is 52 nmol/L, just above the demo laboratory's lower reference, and the profile location is Dublin.",
    dose: "The interface shows HSE population guidance of 15 µg (600 IU) in winter for ages 13–64, not a treatment dose.",
    evidence: "NIH describes 50 nmol/L or above as adequate for most people; HSE recommends seasonal supplementation in Ireland.",
    limitation: "One fictional result does not establish an individual target or explain symptoms.",
    caution: "High-dose treatment requires clinical review.",
    sourceTitle: "Health Service Executive Ireland — Vitamin D",
    sourceUrl: "https://www2.hse.ie/conditions/vitamins-and-minerals/vitamin-d/",
  },
  {
    id: "iron_hold", status: "not_indicated",
    personalBasis: "Synthetic haemoglobin, ferritin and transferrin saturation are inside the fictional lab ranges; HFE C282Y is not detected and H63D is heterozygous.",
    dose: "No iron supplement is proposed in the demo.",
    evidence: "Iron status needs multiple haematological measures; unnecessary high-dose iron can cause harm.",
    limitation: "A common HFE carrier result neither diagnoses nor excludes iron overload.",
    caution: "Real symptoms or abnormal results need clinician interpretation.",
    sourceTitle: "NIH Office of Dietary Supplements — Iron",
    sourceUrl: "https://ods.od.nih.gov/factsheets/Iron-HealthProfessional/",
  },
  {
    id: "mthfr_boundary", status: "not_indicated",
    personalBasis: "The synthetic MTHFR C677T genotype is C/T and synthetic folate is within the fictional reference range.",
    dose: "No genotype-specific methylfolate product is proposed.",
    evidence: "CDC states that common MTHFR variants can process folic acid and are not a reason to avoid it.",
    limitation: "A single common variant is not a diagnosis and does not define personal supplementation needs.",
    caution: "Pregnancy-related folic-acid guidance is separate and should follow official clinical advice.",
    sourceTitle: "CDC — MTHFR Gene Variant and Folic Acid Facts",
    sourceUrl: "https://www.cdc.gov/folic-acid/data-research/mthfr/index.html",
  },
  {
    id: "pgx_boundary", status: "confirm_first",
    personalBasis: "The showcase includes synthetic CYP2C19 and SLCO1B1 diplotypes but no medication list or clinically validated assay.",
    dose: "Do not start, stop or change any medicine from this demo.",
    evidence: "FDA says consumer pharmacogenetic results should be discussed with a professional and clinically confirmed before medical decisions.",
    limitation: "Synthetic genotypes are included only to demonstrate product behavior.",
    caution: "Medication decisions always require the exact drug, indication, dose, comorbidities and validated testing.",
    sourceTitle: "FDA — Direct-to-Consumer Tests",
    sourceUrl: "https://www.fda.gov/medical-devices/in-vitro-diagnostics/direct-consumer-tests",
  },
];

const snapshot = {
  surface: "dashboard",
  title: "Project Genome — Synthetic Showcase",
  generatedAt: "2026-09-29T14:00:00+01:00",
  buildStatus: "complete",
  status: "reviewed-synthetic",
  timezone: "Europe/Dublin",
  privacy: {
    synthetic: true,
    personalData: false,
    publicSafe: true,
    note: "This public demo contains deterministic fictional measurements and no personal health records.",
  },
  filters: [{
    id: "window",
    label: "Period",
    field: "date",
    mode: "trailing-days",
    defaultValue: 30,
    options: [30, 90, "all"],
    queryIds: ["daily_health", "workouts"],
  }],
  dateRange: { from: dailyHealth[0].date, to: dailyHealth.at(-1).date },
  queries: {
    daily_health: {
      title: "Synthetic daily health signals",
      description: "One fictional row per calendar day across sleep, recovery, oxygen, temperature and activity.",
      source: source(["synthetic/daily-health.json"]),
      method: "Generate deterministic daily signals with bounded noise, gradual fitness trends, weekend effects, cross-metric relationships and explicit missing sleep nights.",
      reviewStatus: "reviewed",
      rows: dailyHealth,
    },
    latest_sleep_summary: {
      title: "Synthetic latest-night sleep summary",
      description: "A fictional summary derived from the generated hypnogram.",
      source: source(["synthetic/sleep-summary.json"]),
      method: "Sum generated stage segments; awake time is displayed separately and excluded from total sleep time.",
      reviewStatus: "reviewed",
      rows: latestSleepSummary,
    },
    latest_sleep_stages: {
      title: "Synthetic latest-night hypnogram",
      description: "Chronological fictional sleep-stage segments for the latest demo night.",
      source: source(["synthetic/sleep-stages.json"]),
      method: "Generate a plausible sequence of awake, light, deep and REM segments and retain exact offsets for rendering.",
      reviewStatus: "reviewed",
      rows: latestSleepStages,
    },
    workouts: {
      title: "Synthetic workout sessions",
      description: "Fictional resistance, running, cycling and hiking sessions.",
      source: source(["synthetic/workouts.json"]),
      method: "Generate 36 deterministic sessions across the observation window with activity-specific duration, heart-rate, calorie and distance ranges.",
      reviewStatus: "reviewed",
      rows: workouts,
    },
    data_coverage: {
      title: "Synthetic data coverage",
      description: "Record counts for the fictional sources represented in the public demo.",
      source: source(["src/content/shared/generate-synthetic-data.mjs"]),
      method: "Count generated dashboard rows and declare simulated sample volumes for high-frequency wearable streams.",
      reviewStatus: "reviewed",
      rows: dataCoverage,
    },
    body_metrics: {
      title: "Synthetic body measurements",
      description: "Six fictional weight measurements, a fixed fictional profile height and locally calculated BMI.",
      source: source(["synthetic/body-metrics.json"], {
        metricDefinitions: [{
          label: "BMI",
          definition: "Fictional weight in kilograms divided by squared fictional profile height in metres.",
          formula: "weightKg / (heightM * heightM)",
          dependencies: ["weightKg", "heightM"],
          componentIds: ["body-bmi", "body-weight-trend"],
        }],
        evidenceFlow: [{
          title: "Synthetic generation",
          detail: "A deterministic sequence models a gradual 1.5 kg change across six fictional measurements; height remains fixed at 1.72 m.",
        }],
      }),
      methods: [{ language: "formula", code: "bmi = weightKg / (heightM * heightM)" }],
      reviewStatus: "reviewed",
      rows: bodyMetrics,
    },
    genetic_variants: {
      title: "Synthetic genotype panel",
      description: "Eight deterministic fictional variants spanning nutrient metabolism, iron handling, pharmacogenomics and common traits.",
      source: source([
        "synthetic/genetic-variants.json",
        "https://www.cdc.gov/folic-acid/data-research/mthfr/index.html",
        "https://www.fda.gov/medical-devices/in-vitro-diagnostics/direct-consumer-tests",
      ], {
        caveats: [
          "These genotypes are invented and do not belong to the dashboard owner or any other person.",
          "Trait variants have limited predictive value and must not be used for diagnosis, ancestry claims or medication changes.",
          "Clinically consequential findings require an accredited assay and qualified interpretation.",
        ],
      }),
      method: "Create a compact fictional genotype panel with explicit actionability boundaries; do not infer variants from wearable signals.",
      reviewStatus: "reviewed",
      rows: geneticVariants,
    },
    blood_labs: {
      title: "Synthetic blood laboratory panel",
      description: "Seventeen fictional biomarkers with units, date, reference intervals and an explicit synthetic classification.",
      source: source([
        "synthetic/blood-labs.json",
        "https://www.niddk.nih.gov/health-information/diagnostic-tests/a1c-test",
        "https://ods.od.nih.gov/factsheets/VitaminD-HealthProfessional/",
        "https://ods.od.nih.gov/factsheets/Iron-HealthProfessional/",
      ], {
        caveats: [
          "Reference intervals are fictional demo-lab ranges and can differ by laboratory, method, age, sex and clinical context.",
          "A status label describes only the supplied fictional range; it is not a diagnosis.",
          "Single measurements do not establish a trend or explain symptoms.",
        ],
      }),
      method: "Create one internally consistent fictional panel dated 2026-09-20; preserve units and supplied reference text without converting missing values to zero.",
      reviewStatus: "reviewed",
      rows: bloodLabs,
    },
    recommendation_evidence: {
      title: "Evidence-linked recommendations for a fictional profile",
      description: "Educational recommendations generated from synthetic wearable trends, activity, body metrics, blood biomarkers and genotype variants.",
      source: source([
        "src/content/shared/generate-synthetic-data.mjs",
        "https://odphp.health.gov/our-work/nutrition-physical-activity/physical-activity-guidelines/current-guidelines/top-10-things-know",
        "https://ods.od.nih.gov/factsheets/ExerciseAndAthleticPerformance-HealthProfessional/",
        "https://pubmed.ncbi.nlm.nih.gov/28698222/",
        "https://www2.hse.ie/conditions/vitamins-and-minerals/vitamin-d/",
        "https://ods.od.nih.gov/factsheets/VitaminD-HealthProfessional/",
        "https://ods.od.nih.gov/factsheets/Iron-HealthProfessional/",
        "https://www.cdc.gov/folic-acid/data-research/mthfr/index.html",
        "https://www.fda.gov/medical-devices/in-vitro-diagnostics/direct-consumer-tests",
      ], {
        caveats: [
          "Recommendations describe a fictional profile and are present only to demonstrate dashboard behavior.",
          "Wearable, laboratory and genotype values are all synthetic and cannot diagnose a real person.",
          "The interface is educational and does not replace a clinician, pharmacist or registered dietitian.",
        ],
      }),
      method: "Combine the fictional activity mix, body weight, wearable trends, laboratory panel and genotype panel; map each suggestion to an external source and preserve conservative clinical boundaries.",
      reviewStatus: "reviewed",
      rows: recommendationEvidence,
    },
    module_availability: {
      title: "Synthetic module availability",
      description: "Declares the fictional data available to each showcase module.",
      source: source(["src/content/shared/generate-synthetic-data.mjs"]),
      method: "Mark wearable, body, genetics and blood laboratory modules available and retain their exact synthetic row counts.",
      reviewStatus: "reviewed",
      rows: [
        { module: "wearable", status: "available", records: dailyHealth.length },
        { module: "body", status: "available", records: bodyMetrics.length },
        { module: "genetics", status: "available", records: geneticVariants.length },
        { module: "blood_labs", status: "available", records: bloodLabs.length },
      ],
    },
  },
  id: "dashboard:project-genome-synthetic-showcase-v1",
};

fs.writeFileSync(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
console.log(`Wrote ${outputPath}`);
