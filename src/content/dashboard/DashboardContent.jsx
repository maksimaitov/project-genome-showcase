import React, { createContext, useContext, useMemo, useState } from "react";
import {
  DataComponent,
  EvidenceChart,
  MetricCard,
  SegmentedControl,
  SortableItem,
  SortableRegion,
  useDataApp,
  useDashboardTabs,
} from "../../data-app-public.jsx";

const TAB_IDS = ["overview", "sleep", "recovery", "activity", "genome", "labs", "body", "recommendations", "data"];
const LOCALE_CODES = { ru: "ru-RU", en: "en-GB", pt: "pt-PT" };

const I18N = {
  ru: {
    language: "Русский", languageControl: "Язык интерфейса",
    tabs: { overview:"Обзор", sleep:"Сон", recovery:"Восстановление", activity:"Активность", genome:"Генетика", labs:"Кровь", body:"Тело", recommendations:"Рекомендации", data:"Данные" },
    period: "Период", periodAria: "Период данных", periods: { "30":"30 дней", "90":"90 дней", all:"Всё" },
    units: { day:"дней", hour:"ч", minute:"мин", ms:"мс", bpm:"уд/мин", perMinute:"/мин", km:"км", kcal:"ккал" },
    metricTrend: "выбранный период", metricNote: "Изменение сравнивается с непосредственно предшествующим периодом той же длины; знак не является медицинской оценкой.",
    hero: { eyebrow:"Personal health operating system", description:"Единый локальный обзор сна, восстановления, сердечного ритма и активности — собранный из прямой выгрузки wearable source.", observed:"дней наблюдений", workouts:"тренировок", records:"исходных записей", coverage:"Покрытие", timezone:"Часовой пояс", mode:"Режим", local:"Локально · без идентификаторов", dossier:"Текущий профиль · 30 дней", avgSleep:"Средний сон", avgHrv:"Средний HRV", restingHr:"Пульс в покое", steps:"Шаги в день" },
    overview: { current:"Текущий уровень", lastDays:"Последние {count} дней", note:"Средние значения за выбранный период. Серые дельты показывают только изменение относительно предыдущего окна.", metrics:"Основные показатели", avgSleep:"Средний сон", avgHrv:"Средний HRV", restingHr:"Пульс в покое", stepsDay:"Шаги в день", sleepDesc:"Среднее totalSleepTime из дневных сводок wearable source.", hrvDesc:"Среднее дневных значений avgHrv.", rhrDesc:"Среднее restHeartRate; нулевые и отсутствующие значения исключены.", stepsDesc:"Среднее complete daily activity summary, sportMode −2.", trends:"Тренды здоровья", sleepTrendLabel:"Сон и оценка сна", sleepDuration:"Продолжительность сна", sleepChartDesc:"Каждая точка — одна локальная дата; пропуски не заменяются нулями.", dailySteps:"Дневные шаги", stepsChartDesc:"Сумма шагов из полной дневной сводки wearable source. Последний день отражает состояние на момент экспорта.", integrity:"Целостность данных", direct:"Прямая выгрузка, не health platform", catalogRecords:"записей в каталоге", tables:"таблиц wearable source", identifiers:"идентификаторов в дашборде", localProcessing:"локальная обработка" },
    sleep: { eyebrow:"Sleep architecture", title:"Сон без потери фаз", intro:"Глубокий, REM, лёгкий сон и пробуждения восстановлены непосредственно из wearable source — 65 547 исходных интервалов, которых не было в health platform.", latest:"Последняя детальная ночь", metrics:"Показатели сна", avgDuration:"Средняя продолжительность", score:"Оценка сна", deep:"Глубокий сон", rem:"REM-сон", avgDurationDesc:"Средняя продолжительность сна за выбранный период.", scoreDesc:"Средняя device-computed sleepScore wearable source.", deepDesc:"Среднее время в точной фазе sleepType 2.", remDesc:"Среднее время в точной фазе sleepType 3.", phases:"Фазы сна", hypnogram:"Гипнограмма за", hypnogramDesc:"Точные последовательные интервалы из sleepMainData. Смежные интервалы одной фазы объединены только для отображения.", trends:"Тренды сна", composition:"Состав сна", compositionTitle:"Состав сна по ночам", compositionDesc:"Минуты по фазам. Awake добавлен отдельно и не включён в totalSleepTime.", scoreChartDesc:"Оценка рассчитана алгоритмом wearable source; один нулевой служебный результат исключён визуально как отсутствующий.", stages:{ awake:"Пробуждение", rem:"REM", light:"Лёгкий", deep:"Глубокий", out_of_bed:"Вне кровати" } },
    recovery: { eyebrow:"Recovery signals", title:"Восстановление и физиология", intro:"Наблюдаемые сигналы из часов. Дашборд сравнивает их только с вашей собственной предыдущей историей и не применяет клинические пороги.", metrics:"Показатели восстановления", restingHr:"Пульс в покое", respiratory:"Частота дыхания", metricDesc:"Среднее наблюдаемых дневных значений {field}; нули и пропуски исключены.", trends:"Тренды восстановления", pulse:"Пульс", heartDay:"Пульс за день", heartDesc:"Средний и покоящийся пульс, уд/мин.", average:"Средний", atRest:"В покое", hrvTitle:"Вариабельность ритма", hrvDesc:"Дневной HRV и HRV сна в миллисекундах.", dailyHrv:"Дневной HRV", sleepHrv:"HRV сна", oxygen:"Насыщение кислородом", oxygenDesc:"Среднее дневное и среднее ночное SpO₂; отображение начинается не с нуля.", day:"Днём", asleep:"Во сне", temperature:"Температура запястья", temperatureDesc:"Температура запястья в °C — носимый сенсор, а не измерение температуры тела.", wrist:"Запястье", baseline:"Базовая" },
    activity: { eyebrow:"Movement ledger", title:"Активность", intro:"Повседневное движение и записанные тренировки, отделённые друг от друга: шаги не выдаются за спортивные сессии.", metrics:"Показатели активности", stepsDay:"Шаги в день", distance:"Дистанция", activeDay:"Активность в день", workouts:"Тренировки", workoutCountDesc:"Число записанных onetimesport-сессий в выбранном окне.", metricDesc:"{title}, рассчитано по дневным сводкам wearable source.", trends:"Тренды активности", steps:"Шаги", stepsByDay:"Шаги по дням", stepsDesc:"Дневной totalSteps из полного activity summary.", activeMinutes:"Минуты активности", activeMinutesDesc:"totalDuration из дневной сводки, переведённый из миллисекунд в минуты.", recent:"Последние тренировки", sessionsDesc:"Сессии onetimesport из wearable source; калории и пульс рассчитаны устройством.", duration:"длительность", averageHr:"средний пульс", activeCalories:"активные калории", none:"За выбранный период тренировок нет.", names:{ "Strength training":"Силовая тренировка", "Outdoor cycle":"Велосипед на улице", "Trail hiking":"Поход по тропе", "Outdoor run":"Бег на улице" } },
    empty: { noData:"Данных пока нет", next:"Поддерживаемый следующий источник" },
    genetics: { eyebrow:"Genome modules", title:"Генетика — подготовлена, но не заполнена", intro:"Ни одна генетическая характеристика не вычисляется из данных часов. Эти области намеренно остаются пустыми до загрузки вашего сырого генотипа.", dna:"ДНК и метилирование", dnaDesc:"Карта хромосом, SNP и оценки метилирования не могут быть построены по телеметрии wearable device.", pharma:"Фармакогеномика", pharmaAccept:"валидированный генотип + клиническая интерпретация", pharmaDesc:"Метаболизм лекарств и дозировки не выводятся без генетических вариантов и профессиональной проверки.", risks:"Наследственные риски", risksAccept:"лабораторный генетический отчёт", risksDesc:"Риски заболеваний и онкологические маркеры не заполняются предположениями.", ancestry:"Происхождение", ancestryDesc:"Этнические компоненты, гаплогруппы и неандертальские варианты требуют генотипирования." },
    labs: { eyebrow:"Laboratory layer", title:"Анализы крови", intro:"Часы не измеряют лабораторные биомаркеры. Раздел готов принять результаты, но сейчас не показывает диапазоны, дефициты или диагнозы.", metrics:"Лабораторные показатели", accept:"PDF или CSV лаборатории с датами, единицами и референсами", description:"Нет данных по общему анализу крови, липидам, глюкозе, витаминам, минералам, гормонам и воспалительным маркерам." },
    body: { eyebrow:"Body measurements", title:"Вес и BMI", intro:"Четыре измерения веса извлечены из журнала synthetic source. Рост взят из профиля, а BMI пересчитан локально; неточные оценки состава тела намеренно исключены.", metrics:"Текущие показатели", weight:"Вес", height:"Рост", bmi:"BMI", dynamics:"Динамика веса", weightDescription:"Изменения веса по четырём записям synthetic source. health platform на момент проверки содержал 0 записей веса.", bmiDescription:"BMI = вес в кг / рост в метрах². Это скрининговый показатель, а не прямое измерение жира или здоровья.", heightDescription:"Рост 172 см сохранён в профиле synthetic source; это не повторное измерение весами.", firstToLast:"от первого измерения", records:"6 синтетических измерений · май–сентябрь 2026", excluded:"Не включены: жир, вода, мышцы, кости, висцеральный жир, BMR и «метаболический возраст» — их индивидуальная точность у бытовых BIA-весов недостаточна." },
    recommendations: { eyebrow:"Evidence before advice", title:"Практический протокол", intro:"Что разумно рассмотреть уже сейчас — на основе вашего тренировочного профиля, официальных рекомендаций для Ирландии и научных обзоров. Не диагностика и не назначение врача.", sleep:"Сон", restingHr:"Пульс в покое", steps:"Шаги", changed:"Что изменилось в данных", comparisonDesc:"Последнее выбранное окно сравнивается с непосредственно предшествующим окном той же длины. Знак изменения не является медицинской оценкой.", periods:"Сравнение периодов", neutral:"Нейтральные сдвиги", latestVsPrior:"Последнее окно против предыдущего окна той же длины.", insufficient:"недостаточно истории", protocol:"Что можно сделать", protocolDesc:"Каждая карточка отделяет персональную основу от внешней научной базы и ограничений данных.", basedOn:"Почему это релевантно вам", dose:"Практический ориентир", evidence:"Основание", boundary:"Что часы не доказывают", source:"Источник", statuses:{ consider:"Можно рассмотреть", audit_first:"Сначала проверить рацион", seasonal:"Сезонно · Ирландия", not_supported:"Пока не рекомендую" }, items:{ creatine:{ title:"Креатин моногидрат", basis:"18 из 36 записанных тренировок — силовые.", dose:"3–5 г ежедневно; загрузочная фаза не обязательна.", evidence:"Хорошая доказательная база для повторных высокоинтенсивных усилий и адаптации к силовым тренировкам у здоровых взрослых.", limitation:"Основание — тип тренировок, а не HRV, сон или предполагаемый дефицит.", caution:"При болезнях почек, беременности, возрасте до 18 лет или терапии с контролем функции почек — сначала обсудите с врачом." }, protein:{ title:"Белок: аудит до покупки", basis:"Силовые тренировки доминируют, но в данных нет массы тела и рациона.", dose:"Ориентир ≈1,6 г/кг/сутки общего белка; порошок нужен только чтобы закрыть посчитанный дефицит.", evidence:"Метаанализ 49 исследований: выше ≈1,6 г/кг/сутки дополнительный прирост безжировой массы обычно невелик.", limitation:"Без веса и дневника питания за 3–7 дней нельзя посчитать вашу норму в граммах.", caution:"Цель меняется при болезнях почек, беременности, снижении калорийности и лечебных диетах." }, vitamin_d:{ title:"Витамин D", basis:"Выгрузка использует Europe/Dublin; если вы живёте в Ирландии, применима рекомендация HSE.", dose:"13–64 года: 15 мкг (600 IU) ежедневно с 31 октября по 17 марта; группам риска — круглый год. 65+: круглый год.", evidence:"Популяционная рекомендация HSE для Ирландии, где зимнего солнца недостаточно для синтеза витамина D.", limitation:"Часы не измеряют витамин D. Для диагноза дефицита или лечебной дозы нужен анализ крови.", caution:"Не превышайте 100 мкг/сутки без врача; при некоторых состояниях допустимый предел ниже." }, withhold:{ title:"Магний, железо, B12, мелатонин", basis:"Сон и HRV не показывают, какого нутриента не хватает.", dose:"Рутинную дозу по текущим данным не назначаю.", evidence:"Для магния как стандартного лечения бессонницы результаты РКИ неоднородны, уверенность низкая или очень низкая.", limitation:"Нет рациона, симптомов, лекарств и лабораторных показателей.", caution:"Стойкую усталость или проблемы со сном лучше исследовать клинически, а не лечить показатель часов." } }, readiness:"Что добавить для более точных рекомендаций", readinessDesc:"Список основан на фактически отсутствующих модулях snapshot.", genetics:"Генетика", geneticsText:"Сырой генотип — только после проверки формата и происхождения файла.", labs:"Анализы крови", labsText:"Даты, единицы и лабораторные референсы; без них сравнения небезопасны.", body:"Состав тела", bodyText:"Повторные измерения одним методом для сопоставимой динамики.", modulesWaiting:"модуля ожидают источники", important:"Важно", medical:"Это образовательная, не медицинская рекомендация. Данные потребительских часов помогают видеть тенденции, но не подтверждают дефицит или заболевание. Если есть симптомы, хроническое заболевание, беременность или регулярные лекарства — проверьте план с врачом или фармацевтом." },
    data: { eyebrow:"Data lineage", title:"Каталог выгрузки", intro:"Какие таблицы действительно попали в проект, сколько в них записей и как они были преобразованы. Абсолютные локальные пути и идентификаторы скрыты.", tables:"26 таблиц wearable source", description:"Количество записей взято из проверенного catalog.json нормализованной выгрузки.", source:"Источник", category:"Категория", records:"Записи", relative:"Относительный объём", generated:"Сформировано", status:"Статус", privacy:"Приватность", privateRepository:"Приватный репозиторий GitHub", categories:{ Sleep:"Сон", Heart:"Сердце", Oxygen:"Кислород", Respiration:"Дыхание", Temperature:"Температура", Recovery:"Восстановление", Activity:"Активность", Assessment:"Оценки", "Raw archive":"Сырой архив", Other:"Другое" } },
    footer:"Персональные измерения · wearable source export · локальная обработка",
  },
  en: {
    language:"English", languageControl:"Interface language",
    tabs:{ overview:"Overview", sleep:"Sleep", recovery:"Recovery", activity:"Activity", genome:"Genetics", labs:"Blood", body:"Body", recommendations:"Recommendations", data:"Data" },
    period:"Period", periodAria:"Data period", periods:{ "30":"30 days", "90":"90 days", all:"All" },
    units:{ day:"days", hour:"h", minute:"min", ms:"ms", bpm:"bpm", perMinute:"/min", km:"km", kcal:"kcal" },
    metricTrend:"selected period", metricNote:"The change is compared with the immediately preceding period of the same length; its sign is not a medical assessment.",
    hero:{ eyebrow:"Personal health operating system", description:"A single local view of sleep, recovery, heart rate and activity — built from a direct wearable source export.", observed:"days observed", workouts:"workouts", records:"source records", coverage:"Coverage", timezone:"Time zone", mode:"Mode", local:"Local · identifiers removed", dossier:"Current profile · 30 days", avgSleep:"Average sleep", avgHrv:"Average HRV", restingHr:"Resting heart rate", steps:"Steps per day" },
    overview:{ current:"Current level", lastDays:"Last {count} days", note:"Averages for the selected period. Grey deltas show change against the preceding window only.", metrics:"Key metrics", avgSleep:"Average sleep", avgHrv:"Average HRV", restingHr:"Resting heart rate", stepsDay:"Steps per day", sleepDesc:"Average totalSleepTime from wearable source daily summaries.", hrvDesc:"Average daily avgHrv.", rhrDesc:"Average restHeartRate; zero and missing values are excluded.", stepsDesc:"Average complete daily activity summary, sportMode −2.", trends:"Health trends", sleepTrendLabel:"Sleep and sleep score", sleepDuration:"Sleep duration", sleepChartDesc:"Each point is one local date; missing observations are not replaced with zero.", dailySteps:"Daily steps", stepsChartDesc:"Step total from the complete wearable source daily summary. The last day reflects the time of export.", integrity:"Data integrity", direct:"Direct export, not health platform", catalogRecords:"records in the catalogue", tables:"wearable source tables", identifiers:"identifiers in the dashboard", localProcessing:"local processing" },
    sleep:{ eyebrow:"Sleep architecture", title:"Sleep with every stage intact", intro:"Deep, REM, light sleep and awakenings were restored directly from wearable source — 65,547 source intervals that were absent from health platform.", latest:"Latest detailed night", metrics:"Sleep metrics", avgDuration:"Average duration", score:"Sleep score", deep:"Deep sleep", rem:"REM sleep", avgDurationDesc:"Average sleep duration over the selected period.", scoreDesc:"Average device-computed wearable source sleepScore.", deepDesc:"Average time in exact sleepType 2.", remDesc:"Average time in exact sleepType 3.", phases:"Sleep stages", hypnogram:"Hypnogram for", hypnogramDesc:"Exact consecutive intervals from sleepMainData. Adjacent intervals of the same stage are merged for display only.", trends:"Sleep trends", composition:"Sleep composition", compositionTitle:"Nightly sleep composition", compositionDesc:"Minutes by stage. Awake is shown separately and is not included in totalSleepTime.", scoreChartDesc:"The score is calculated by wearable source; one zero service result is visually treated as missing.", stages:{ awake:"Awake", rem:"REM", light:"Light", deep:"Deep", out_of_bed:"Out of bed" } },
    recovery:{ eyebrow:"Recovery signals", title:"Recovery and physiology", intro:"Observed signals from the watch. The dashboard compares them only with your own prior history and applies no clinical thresholds.", metrics:"Recovery metrics", restingHr:"Resting heart rate", respiratory:"Respiratory rate", metricDesc:"Average observed daily {field}; zero and missing values are excluded.", trends:"Recovery trends", pulse:"Heart rate", heartDay:"Daily heart rate", heartDesc:"Average and resting heart rate, bpm.", average:"Average", atRest:"Resting", hrvTitle:"Heart-rate variability", hrvDesc:"Daily HRV and sleep HRV in milliseconds.", dailyHrv:"Daily HRV", sleepHrv:"Sleep HRV", oxygen:"Blood oxygen saturation", oxygenDesc:"Average daytime and sleep SpO₂; the display does not start at zero.", day:"Day", asleep:"Sleep", temperature:"Wrist temperature", temperatureDesc:"Wrist temperature in °C is a wearable-sensor reading, not core body temperature.", wrist:"Wrist", baseline:"Baseline" },
    activity:{ eyebrow:"Movement ledger", title:"Activity", intro:"Everyday movement and recorded workouts remain separate: steps are not presented as workout sessions.", metrics:"Activity metrics", stepsDay:"Steps per day", distance:"Distance", activeDay:"Activity per day", workouts:"Workouts", workoutCountDesc:"Number of recorded onetimesport sessions in the selected window.", metricDesc:"{title}, calculated from wearable source daily summaries.", trends:"Activity trends", steps:"Steps", stepsByDay:"Steps by day", stepsDesc:"Daily totalSteps from the complete activity summary.", activeMinutes:"Active minutes", activeMinutesDesc:"totalDuration from the daily summary, converted from milliseconds to minutes.", recent:"Recent workouts", sessionsDesc:"wearable source onetimesport sessions; calories and heart rate are device-computed.", duration:"duration", averageHr:"average heart rate", activeCalories:"active calories", none:"No workouts in the selected period.", names:{ "Strength training":"Strength training", "Outdoor cycle":"Outdoor cycling", "Trail hiking":"Trail hiking", "Outdoor run":"Outdoor run" } },
    empty:{ noData:"No data yet", next:"Supported next source" },
    genetics:{ eyebrow:"Genome modules", title:"Genetics is ready, but empty", intro:"No genetic trait is inferred from watch data. These areas intentionally remain empty until you upload your raw genotype.", dna:"DNA and methylation", dnaDesc:"A chromosome map, SNPs and methylation scores cannot be built from wearable device telemetry.", pharma:"Pharmacogenomics", pharmaAccept:"validated genotype + clinical interpretation", pharmaDesc:"Drug metabolism and dosing are not inferred without genetic variants and professional review.", risks:"Hereditary risks", risksAccept:"laboratory genetic report", risksDesc:"Disease and cancer-risk markers are not populated with assumptions.", ancestry:"Ancestry", ancestryDesc:"Ethnicity components, haplogroups and Neanderthal variants require genotyping." },
    labs:{ eyebrow:"Laboratory layer", title:"Blood tests", intro:"The watch does not measure laboratory biomarkers. This section is ready for results, but currently shows no ranges, deficiencies or diagnoses.", metrics:"Laboratory markers", accept:"lab PDF or CSV with dates, units and reference ranges", description:"No data is available for blood counts, lipids, glucose, vitamins, minerals, hormones or inflammatory markers." },
    body:{ eyebrow:"Body measurements", title:"Weight and BMI", intro:"Four weight measurements were extracted from the synthetic source history. Height comes from the profile and BMI is recalculated locally; unreliable body-composition estimates are deliberately excluded.", metrics:"Current measurements", weight:"Weight", height:"Height", bmi:"BMI", dynamics:"Weight trend", weightDescription:"Weight across four synthetic source records. health platform contained zero weight records when checked.", bmiDescription:"BMI = weight in kg / height in metres². It is a screening measure, not a direct measure of body fat or health.", heightDescription:"The 172 cm height is stored in the synthetic source profile; it is not a repeated scale measurement.", firstToLast:"from first measurement", records:"6 synthetic measurements · May–September 2026", excluded:"Excluded: body fat, water, muscle, bone mass, visceral fat, BMR and “metabolic age” because consumer BIA scales are not sufficiently accurate at the individual level." },
    recommendations:{ eyebrow:"Evidence before advice", title:"A practical protocol", intro:"What is reasonable to consider now, based on your training profile, official Irish guidance and scientific reviews. This is neither a diagnosis nor a prescription.", sleep:"Sleep", restingHr:"Resting heart rate", steps:"Steps", changed:"What changed in the data", comparisonDesc:"The latest selected window is compared with the immediately preceding window of the same length. The sign is not a medical assessment.", periods:"Period comparison", neutral:"Neutral shifts", latestVsPrior:"Latest window versus the preceding window of the same length.", insufficient:"insufficient history", protocol:"What you can do", protocolDesc:"Each card separates your personal basis from the external evidence and the limits of the data.", basedOn:"Why this is relevant to you", dose:"Practical target", evidence:"Evidence basis", boundary:"What the watch cannot prove", source:"Source", statuses:{ consider:"Worth considering", audit_first:"Audit diet first", seasonal:"Seasonal · Ireland", not_supported:"Not recommended yet" }, items:{ creatine:{ title:"Creatine monohydrate", basis:"18 of 36 recorded sessions are strength training.", dose:"3–5 g daily; a loading phase is optional.", evidence:"Strong evidence for repeated high-intensity work and resistance-training adaptation in healthy adults.", limitation:"This is based on workout type, not HRV, sleep or a presumed deficiency.", caution:"Discuss first if you have kidney disease, are pregnant, are under 18 or take treatment requiring renal monitoring." }, protein:{ title:"Protein: audit before buying", basis:"Resistance training dominates, but body weight and diet are missing.", dose:"Target about 1.6 g/kg/day total protein; use powder only to close a measured gap.", evidence:"A 49-study meta-analysis found little additional lean-mass benefit above about 1.6 g/kg/day.", limitation:"Without weight and a 3–7 day food log, your grams-per-day target cannot be calculated.", caution:"Targets differ with kidney disease, pregnancy, energy restriction and clinician-directed diets." }, vitamin_d:{ title:"Vitamin D", basis:"The export uses Europe/Dublin; if you live in Ireland, HSE guidance applies.", dose:"Age 13–64: 15 µg (600 IU) daily from 31 October to 17 March; year-round for higher-risk groups. Age 65+: year-round.", evidence:"HSE population guidance for Ireland, where winter sunlight is insufficient for vitamin D synthesis.", limitation:"The watch cannot measure vitamin D. Diagnosis or treatment dosing requires a blood test.", caution:"Do not exceed 100 µg/day without medical advice; some conditions require a lower limit." }, withhold:{ title:"Magnesium, iron, B12, melatonin", basis:"Sleep and HRV do not reveal which nutrient may be lacking.", dose:"No routine dose is supported by the current dataset.", evidence:"For magnesium as a routine insomnia treatment, RCT findings are inconsistent and certainty is low or very low.", limitation:"Diet, symptoms, medicines and laboratory values are absent.", caution:"Persistent fatigue or sleep problems should be assessed clinically, not treated as a wearable-derived deficiency." } }, readiness:"What to add for more precise recommendations", readinessDesc:"The list is based on modules that are actually missing from the snapshot.", genetics:"Genetics", geneticsText:"Raw genotype, after its format and origin are verified.", labs:"Blood tests", labsText:"Dates, units and laboratory ranges; comparisons are unsafe without them.", body:"Body composition", bodyText:"Repeated measurements using one method for a comparable trend.", modulesWaiting:"modules awaiting sources", important:"Important", medical:"This is educational guidance, not medical advice. Consumer-watch data can reveal trends but cannot confirm a deficiency or disease. If you have symptoms, chronic disease, pregnancy or regular medicines, review the plan with a clinician or pharmacist." },
    data:{ eyebrow:"Data lineage", title:"Export catalogue", intro:"Which tables actually entered the project, how many records they contain and how they were transformed. Absolute local paths and identifiers are hidden.", tables:"26 wearable source tables", description:"Record counts come from the reviewed catalog.json in the normalised export.", source:"Source", category:"Category", records:"Records", relative:"Relative volume", generated:"Generated", status:"Status", privacy:"Privacy", privateRepository:"Private GitHub repository", categories:{ Sleep:"Sleep", Heart:"Heart", Oxygen:"Oxygen", Respiration:"Respiration", Temperature:"Temperature", Recovery:"Recovery", Activity:"Activity", Assessment:"Assessment", "Raw archive":"Raw archive", Other:"Other" } },
    footer:"Personal measurements · wearable source export · local processing",
  },
  pt: {
    language:"Português", languageControl:"Idioma da interface",
    tabs:{ overview:"Visão geral", sleep:"Sono", recovery:"Recuperação", activity:"Atividade", genome:"Genética", labs:"Sangue", body:"Corpo", recommendations:"Recomendações", data:"Dados" },
    period:"Período", periodAria:"Período dos dados", periods:{ "30":"30 dias", "90":"90 dias", all:"Tudo" },
    units:{ day:"dias", hour:"h", minute:"min", ms:"ms", bpm:"bpm", perMinute:"/min", km:"km", kcal:"kcal" },
    metricTrend:"período selecionado", metricNote:"A alteração é comparada com o período imediatamente anterior da mesma duração; o sinal não é uma avaliação médica.",
    hero:{ eyebrow:"Personal health operating system", description:"Uma visão local única do sono, recuperação, frequência cardíaca e atividade — criada a partir de uma exportação direta do wearable source.", observed:"dias observados", workouts:"treinos", records:"registos de origem", coverage:"Cobertura", timezone:"Fuso horário", mode:"Modo", local:"Local · identificadores removidos", dossier:"Perfil atual · 30 dias", avgSleep:"Sono médio", avgHrv:"VFC média", restingHr:"Frequência em repouso", steps:"Passos por dia" },
    overview:{ current:"Nível atual", lastDays:"Últimos {count} dias", note:"Médias do período selecionado. Os deltas cinzentos mostram apenas a alteração face à janela anterior.", metrics:"Métricas principais", avgSleep:"Sono médio", avgHrv:"VFC média", restingHr:"Frequência em repouso", stepsDay:"Passos por dia", sleepDesc:"Média de totalSleepTime dos resumos diários do wearable source.", hrvDesc:"Média diária de avgHrv.", rhrDesc:"Média de restHeartRate; valores zero e em falta são excluídos.", stepsDesc:"Média do resumo diário completo de atividade, sportMode −2.", trends:"Tendências de saúde", sleepTrendLabel:"Sono e pontuação do sono", sleepDuration:"Duração do sono", sleepChartDesc:"Cada ponto é uma data local; observações em falta não são substituídas por zero.", dailySteps:"Passos diários", stepsChartDesc:"Total de passos do resumo diário completo do wearable source. O último dia reflete o momento da exportação.", integrity:"Integridade dos dados", direct:"Exportação direta, não health platform", catalogRecords:"registos no catálogo", tables:"tabelas do wearable source", identifiers:"identificadores no painel", localProcessing:"processamento local" },
    sleep:{ eyebrow:"Sleep architecture", title:"Sono com todas as fases", intro:"O sono profundo, REM, leve e os despertares foram recuperados diretamente do wearable source — 65 547 intervalos de origem ausentes do health platform.", latest:"Última noite detalhada", metrics:"Métricas do sono", avgDuration:"Duração média", score:"Pontuação do sono", deep:"Sono profundo", rem:"Sono REM", avgDurationDesc:"Duração média do sono no período selecionado.", scoreDesc:"Média da sleepScore calculada pelo dispositivo wearable source.", deepDesc:"Tempo médio na fase exata sleepType 2.", remDesc:"Tempo médio na fase exata sleepType 3.", phases:"Fases do sono", hypnogram:"Hipnograma de", hypnogramDesc:"Intervalos consecutivos exatos de sleepMainData. Intervalos adjacentes da mesma fase são unidos apenas para visualização.", trends:"Tendências do sono", composition:"Composição do sono", compositionTitle:"Composição do sono por noite", compositionDesc:"Minutos por fase. Awake é mostrado separadamente e não entra em totalSleepTime.", scoreChartDesc:"A pontuação é calculada pelo wearable source; um resultado técnico igual a zero é tratado visualmente como ausente.", stages:{ awake:"Desperto", rem:"REM", light:"Leve", deep:"Profundo", out_of_bed:"Fora da cama" } },
    recovery:{ eyebrow:"Recovery signals", title:"Recuperação e fisiologia", intro:"Sinais observados pelo relógio. O painel compara-os apenas com o seu próprio histórico anterior e não aplica limiares clínicos.", metrics:"Métricas de recuperação", restingHr:"Frequência em repouso", respiratory:"Frequência respiratória", metricDesc:"Média diária observada de {field}; valores zero e em falta são excluídos.", trends:"Tendências de recuperação", pulse:"Frequência cardíaca", heartDay:"Frequência cardíaca diária", heartDesc:"Frequência cardíaca média e em repouso, bpm.", average:"Média", atRest:"Em repouso", hrvTitle:"Variabilidade da frequência cardíaca", hrvDesc:"VFC diária e VFC do sono em milissegundos.", dailyHrv:"VFC diária", sleepHrv:"VFC do sono", oxygen:"Saturação de oxigénio", oxygenDesc:"SpO₂ média durante o dia e o sono; a escala não começa em zero.", day:"Dia", asleep:"Sono", temperature:"Temperatura do pulso", temperatureDesc:"A temperatura do pulso em °C é uma leitura do sensor wearable, não a temperatura corporal central.", wrist:"Pulso", baseline:"Referência" },
    activity:{ eyebrow:"Movement ledger", title:"Atividade", intro:"O movimento diário e os treinos registados permanecem separados: os passos não são apresentados como sessões de treino.", metrics:"Métricas de atividade", stepsDay:"Passos por dia", distance:"Distância", activeDay:"Atividade por dia", workouts:"Treinos", workoutCountDesc:"Número de sessões onetimesport registadas na janela selecionada.", metricDesc:"{title}, calculado a partir dos resumos diários do wearable source.", trends:"Tendências de atividade", steps:"Passos", stepsByDay:"Passos por dia", stepsDesc:"totalSteps diário do resumo completo de atividade.", activeMinutes:"Minutos de atividade", activeMinutesDesc:"totalDuration do resumo diário, convertido de milissegundos para minutos.", recent:"Treinos recentes", sessionsDesc:"Sessões onetimesport do wearable source; calorias e frequência cardíaca são calculadas pelo dispositivo.", duration:"duração", averageHr:"frequência média", activeCalories:"calorias ativas", none:"Não existem treinos no período selecionado.", names:{ "Strength training":"Treino de força", "Outdoor cycle":"Ciclismo ao ar livre", "Trail hiking":"Caminhada em trilho", "Outdoor run":"Corrida ao ar livre" } },
    empty:{ noData:"Ainda sem dados", next:"Próxima fonte compatível" },
    genetics:{ eyebrow:"Genome modules", title:"Genética preparada, mas vazia", intro:"Nenhuma característica genética é inferida a partir dos dados do relógio. Estas áreas permanecem vazias até carregar o genótipo bruto.", dna:"DNA e metilação", dnaDesc:"O mapa cromossómico, SNPs e pontuações de metilação não podem ser criados a partir da telemetria do wearable device.", pharma:"Farmacogenómica", pharmaAccept:"genótipo validado + interpretação clínica", pharmaDesc:"O metabolismo de medicamentos e as doses não são inferidos sem variantes genéticas e revisão profissional.", risks:"Riscos hereditários", risksAccept:"relatório genético laboratorial", risksDesc:"Os marcadores de risco de doença e cancro não são preenchidos com suposições.", ancestry:"Ancestralidade", ancestryDesc:"Componentes étnicos, haplogrupos e variantes neandertais requerem genotipagem." },
    labs:{ eyebrow:"Laboratory layer", title:"Análises ao sangue", intro:"O relógio não mede biomarcadores laboratoriais. A secção está pronta para receber resultados, mas ainda não mostra intervalos, défices ou diagnósticos.", metrics:"Marcadores laboratoriais", accept:"PDF ou CSV do laboratório com datas, unidades e referências", description:"Não existem dados para hemograma, lípidos, glicose, vitaminas, minerais, hormonas ou marcadores inflamatórios." },
    body:{ eyebrow:"Body measurements", title:"Peso e IMC", intro:"Foram extraídas quatro medições de peso do histórico synthetic source. A altura vem do perfil e o IMC foi recalculado localmente; as estimativas pouco fiáveis de composição corporal foram excluídas.", metrics:"Medições atuais", weight:"Peso", height:"Altura", bmi:"IMC", dynamics:"Evolução do peso", weightDescription:"Peso em quatro registos synthetic source. O health platform continha zero registos de peso no momento da verificação.", bmiDescription:"IMC = peso em kg / altura em metros². É uma medida de rastreio, não uma medição direta de gordura corporal ou saúde.", heightDescription:"A altura de 172 cm está guardada no perfil synthetic source; não é uma medição repetida pela balança.", firstToLast:"desde a primeira medição", records:"6 medições sintéticas · maio–setembro de 2026", excluded:"Excluídos: gordura, água, músculo, massa óssea, gordura visceral, TMB e “idade metabólica”, porque as balanças BIA de consumo não são suficientemente precisas a nível individual." },
    recommendations:{ eyebrow:"Evidence before advice", title:"Um protocolo prático", intro:"O que é razoável considerar agora, com base no seu perfil de treino, nas orientações oficiais irlandesas e em revisões científicas. Não é diagnóstico nem prescrição.", sleep:"Sono", restingHr:"Frequência em repouso", steps:"Passos", changed:"O que mudou nos dados", comparisonDesc:"A última janela selecionada é comparada com a janela imediatamente anterior da mesma duração. O sinal não é uma avaliação médica.", periods:"Comparação de períodos", neutral:"Alterações neutras", latestVsPrior:"Última janela versus a janela anterior da mesma duração.", insufficient:"histórico insuficiente", protocol:"O que pode fazer", protocolDesc:"Cada cartão separa a base pessoal da evidência externa e dos limites dos dados.", basedOn:"Porque é relevante para si", dose:"Referência prática", evidence:"Base científica", boundary:"O que o relógio não prova", source:"Fonte", statuses:{ consider:"Pode considerar", audit_first:"Avaliar primeiro a dieta", seasonal:"Sazonal · Irlanda", not_supported:"Ainda não recomendado" }, items:{ creatine:{ title:"Creatina monohidratada", basis:"18 de 36 sessões registadas são treino de força.", dose:"3–5 g por dia; a fase de carga é opcional.", evidence:"Boa evidência para esforços repetidos de alta intensidade e adaptação ao treino de força em adultos saudáveis.", limitation:"A base é o tipo de treino, não a VFC, o sono ou um défice presumido.", caution:"Fale primeiro com um médico em caso de doença renal, gravidez, idade inferior a 18 anos ou terapêutica com monitorização renal." }, protein:{ title:"Proteína: avaliar antes de comprar", basis:"O treino de força domina, mas faltam o peso corporal e a dieta.", dose:"Objetivo de cerca de 1,6 g/kg/dia de proteína total; use suplemento apenas para fechar uma lacuna medida.", evidence:"Uma meta-análise de 49 estudos encontrou pouco benefício adicional acima de cerca de 1,6 g/kg/dia.", limitation:"Sem peso e um diário alimentar de 3–7 dias não é possível calcular a meta em gramas.", caution:"A meta muda com doença renal, gravidez, restrição energética e dietas clínicas." }, vitamin_d:{ title:"Vitamina D", basis:"A exportação usa Europe/Dublin; se vive na Irlanda, aplica-se a orientação HSE.", dose:"13–64 anos: 15 µg (600 IU) por dia de 31 de outubro a 17 de março; grupos de risco durante todo o ano. 65+: todo o ano.", evidence:"Orientação populacional HSE para a Irlanda, onde o sol de inverno é insuficiente para a síntese de vitamina D.", limitation:"O relógio não mede vitamina D. Diagnóstico ou dose terapêutica requer análise ao sangue.", caution:"Não exceda 100 µg/dia sem orientação médica; alguns problemas exigem um limite inferior." }, withhold:{ title:"Magnésio, ferro, B12, melatonina", basis:"O sono e a VFC não revelam que nutriente pode estar em falta.", dose:"Os dados atuais não sustentam uma dose de rotina.", evidence:"Para magnésio como tratamento rotineiro da insónia, os resultados dos ensaios são inconsistentes e a certeza é baixa ou muito baixa.", limitation:"Faltam dieta, sintomas, medicamentos e valores laboratoriais.", caution:"Fadiga persistente ou problemas de sono devem ser avaliados clinicamente, não tratados como défice indicado pelo relógio." } }, readiness:"O que adicionar para recomendações mais precisas", readinessDesc:"A lista baseia-se nos módulos que estão realmente ausentes do snapshot.", genetics:"Genética", geneticsText:"Genótipo bruto, após validação do formato e da origem.", labs:"Análises ao sangue", labsText:"Datas, unidades e referências laboratoriais; sem isso, as comparações não são seguras.", body:"Composição corporal", bodyText:"Medições repetidas com o mesmo método para uma tendência comparável.", modulesWaiting:"módulos aguardam fontes", important:"Importante", medical:"Esta é uma orientação educativa, não aconselhamento médico. Os dados do relógio podem mostrar tendências, mas não confirmam défice ou doença. Se tiver sintomas, doença crónica, gravidez ou medicação regular, reveja o plano com um médico ou farmacêutico." },
    data:{ eyebrow:"Data lineage", title:"Catálogo da exportação", intro:"Que tabelas entraram realmente no projeto, quantos registos contêm e como foram transformadas. Caminhos locais absolutos e identificadores estão ocultos.", tables:"26 tabelas do wearable source", description:"As contagens vêm do catalog.json revisto da exportação normalizada.", source:"Fonte", category:"Categoria", records:"Registos", relative:"Volume relativo", generated:"Gerado", status:"Estado", privacy:"Privacidade", privateRepository:"Repositório privado do GitHub", categories:{ Sleep:"Sono", Heart:"Coração", Oxygen:"Oxigénio", Respiration:"Respiração", Temperature:"Temperatura", Recovery:"Recuperação", Activity:"Atividade", Assessment:"Avaliação", "Raw archive":"Arquivo bruto", Other:"Outro" } },
    footer:"Medições pessoais · exportação wearable source · processamento local",
  },
};

Object.assign(I18N.ru.hero, {
  eyebrow: "Синтетический health showcase",
  description: "Интерактивная демонстрация сна, восстановления, пульса и активности на правдоподобных вымышленных данных.",
  local: "Синтетика · без персональных данных",
  dossier: "Вымышленный профиль · 30 дней",
});
Object.assign(I18N.ru.overview, {
  sleepDesc: "Средняя продолжительность сна в синтетических дневных сводках.",
  stepsDesc: "Среднее число шагов в синтетических дневных сводках.",
  stepsChartDesc: "Каждый столбец — вымышленное дневное значение; последний день завершён полностью.",
  direct: "Детерминированный синтетический набор",
  catalogRecords: "синтетических записей",
  tables: "наборов данных",
  localProcessing: "воспроизводимая генерация",
});
Object.assign(I18N.ru.sleep, {
  title: "Архитектура сна",
  intro: "Глубокий, REM, лёгкий сон и пробуждения сгенерированы как последовательный сценарий, чтобы показать гипнограмму и тренды без реальных записей человека.",
  scoreDesc: "Средняя синтетическая оценка сна за выбранный период.",
  hypnogramDesc: "Последовательные вымышленные интервалы сна; время и длительность согласованы с итоговой сводкой.",
  scoreChartDesc: "Оценка сна моделируется из продолжительности, пробуждений и небольшого детерминированного шума.",
});
Object.assign(I18N.ru.recovery, { intro: "Синтетические сигналы восстановления сравниваются только с предыдущей историей вымышленного профиля; клинические пороги не применяются." });
Object.assign(I18N.ru.activity, {
  workoutCountDesc: "Число сгенерированных тренировочных сессий в выбранном окне.",
  metricDesc: "{title}, рассчитано по синтетическим дневным сводкам.",
  stepsDesc: "Синтетическое дневное число шагов.",
  activeMinutesDesc: "Синтетические минуты активности за день.",
  sessionsDesc: "Вымышленные силовые, беговые, велосипедные и пешие тренировки с правдоподобными диапазонами.",
});
Object.assign(I18N.ru.genetics, {
  intro: "В демо нет генетического источника, поэтому эти области намеренно остаются пустыми и ничего не выводят из данных носимого устройства.",
  dnaDesc: "Карта хромосом, SNP и оценки метилирования не могут быть построены по данным носимого устройства.",
});
Object.assign(I18N.ru.body, {
  intro: "Шесть синтетических измерений веса моделируют плавную динамику. Рост вымышленного профиля фиксирован, а BMI пересчитан локально.",
  weightDescription: "Динамика веса по шести синтетическим измерениям.",
  heightDescription: "Рост 172 см — фиксированное значение вымышленного профиля, а не измерение весами.",
  records: "6 синтетических измерений · май–сентябрь 2026",
  date: "Дата", source: "Источник", sourceName: "Synthetic demo",
});
Object.assign(I18N.ru.recommendations, {
  intro: "Демонстрационный протокол, рассчитанный для вымышленного тренировочного профиля и дополненный внешней научной базой. Не диагностика и не назначение врача.",
  protocolDesc: "Каждая карточка отделяет синтетическую персональную основу от внешней научной базы и ограничений.",
  basedOn: "Почему это показано в демо",
  medical: "Все персональные основания здесь синтетические. Это образовательная демонстрация интерфейса, а не медицинская рекомендация реальному человеку.",
});
Object.assign(I18N.ru.recommendations.items.creatine, { basis: "18 из 36 вымышленных тренировок — силовые." });
Object.assign(I18N.ru.recommendations.items.protein, {
  basis: "Вымышленный профиль сочетает силовые тренировки с последним синтетическим весом 70,9 кг; данных о рационе нет.",
  dose: "Ориентир ≈1,6 г/кг/сутки соответствует примерно 113 г общего белка в день; добавка нужна только для закрытия измеренного дефицита рациона.",
  limitation: "Расчёт демонстрационный: без пищевого дневника нельзя определить реальный дефицит.",
});
Object.assign(I18N.ru.recommendations.items.vitamin_d, { basis: "Демо использует Europe/Dublin, чтобы показать рекомендацию, зависящую от региона и сезона." });
Object.assign(I18N.ru.recommendations.items.withhold, { basis: "Синтетические сон и HRV не указывают на конкретный дефицит нутриентов." });
Object.assign(I18N.ru.data, {
  title: "Каталог синтетических данных",
  intro: "Какие вымышленные наборы питают демо, сколько в них записей и как они были созданы.",
  tables: "12 синтетических наборов",
  description: "Счётчики сгенерированного snapshot и моделируемых высокочастотных потоков.",
  publicDemo: "Публичное демо · без персональных данных",
  reviewedSynthetic: "Проверенный синтетический snapshot",
  categories: { ...I18N.ru.data.categories, Body: "Тело" },
});
I18N.ru.footer = "Синтетические измерения · публичный showcase · воспроизводимая генерация";

Object.assign(I18N.en.hero, {
  eyebrow: "Synthetic health showcase",
  description: "An interactive demonstration of sleep, recovery, heart rate and activity using plausible fictional data.",
  local: "Synthetic · no personal data",
  dossier: "Fictional profile · 30 days",
});
Object.assign(I18N.en.overview, {
  sleepDesc: "Average sleep duration across synthetic daily summaries.",
  stepsDesc: "Average step count across synthetic daily summaries.",
  stepsChartDesc: "Each bar is a fictional daily value; the final day is complete.",
  direct: "Deterministic synthetic dataset",
  catalogRecords: "synthetic records",
  tables: "datasets",
  localProcessing: "reproducible generation",
});
Object.assign(I18N.en.sleep, {
  title: "Sleep architecture",
  intro: "Deep, REM and light sleep plus awakenings are generated as a coherent scenario, demonstrating the hypnogram and trends without a real person's records.",
  scoreDesc: "Average synthetic sleep score over the selected period.",
  hypnogramDesc: "Sequential fictional sleep intervals; timing and duration reconcile with the summary.",
  scoreChartDesc: "The score is modelled from duration, awakenings and small deterministic variation.",
});
Object.assign(I18N.en.recovery, { intro: "Synthetic recovery signals are compared only with the fictional profile's preceding history; no clinical thresholds are applied." });
Object.assign(I18N.en.activity, {
  workoutCountDesc: "Number of generated workout sessions in the selected window.",
  metricDesc: "{title}, calculated from synthetic daily summaries.",
  stepsDesc: "Synthetic daily step count.",
  activeMinutesDesc: "Synthetic active minutes per day.",
  sessionsDesc: "Fictional resistance, running, cycling and hiking sessions with plausible ranges.",
});
Object.assign(I18N.en.genetics, {
  intro: "The demo has no genetic source, so these areas intentionally remain empty and infer nothing from wearable-device data.",
  dnaDesc: "A chromosome map, SNPs and methylation scores cannot be built from wearable-device data.",
});
Object.assign(I18N.en.body, {
  intro: "Six synthetic weight measurements model a gradual trend. The fictional profile height is fixed and BMI is recalculated locally.",
  weightDescription: "Weight trend across six synthetic measurements.",
  heightDescription: "The 172 cm height is a fixed fictional profile value, not a scale measurement.",
  records: "6 synthetic measurements · May–September 2026",
  date: "Date", source: "Source", sourceName: "Synthetic demo",
});
Object.assign(I18N.en.recommendations, {
  intro: "A demonstration protocol calculated for a fictional training profile and paired with external evidence. It is neither a diagnosis nor a prescription.",
  protocolDesc: "Each card separates the synthetic personal basis from external evidence and data limits.",
  basedOn: "Why this appears in the demo",
  medical: "Every personal premise shown here is synthetic. This is an educational interface demonstration, not medical advice for a real person.",
});
Object.assign(I18N.en.recommendations.items.creatine, { basis: "18 of 36 fictional workouts are resistance-training sessions." });
Object.assign(I18N.en.recommendations.items.protein, {
  basis: "The fictional profile combines resistance training with a latest synthetic weight of 70.9 kg; dietary intake is unknown.",
  dose: "A reference of about 1.6 g/kg/day is approximately 113 g/day of total protein; use a supplement only to close a measured dietary gap.",
  limitation: "This is a demonstration calculation; a food log would be needed to identify a real gap.",
});
Object.assign(I18N.en.recommendations.items.vitamin_d, { basis: "The demo uses Europe/Dublin to illustrate guidance that depends on region and season." });
Object.assign(I18N.en.recommendations.items.withhold, { basis: "Synthetic sleep and HRV trends do not identify a specific nutrient deficiency." });
Object.assign(I18N.en.data, {
  title: "Synthetic data catalogue",
  intro: "Which fictional datasets power the demo, how many records they contain and how they were created.",
  tables: "12 synthetic datasets",
  description: "Counts from the generated snapshot and simulated high-frequency streams.",
  publicDemo: "Public demo · no personal data",
  reviewedSynthetic: "Reviewed synthetic snapshot",
  categories: { ...I18N.en.data.categories, Body: "Body" },
});
I18N.en.footer = "Synthetic measurements · public showcase · reproducible generation";

Object.assign(I18N.pt.hero, {
  eyebrow: "Showcase de saúde sintética",
  description: "Uma demonstração interativa de sono, recuperação, frequência cardíaca e atividade com dados fictícios plausíveis.",
  local: "Sintético · sem dados pessoais",
  dossier: "Perfil fictício · 30 dias",
});
Object.assign(I18N.pt.overview, {
  sleepDesc: "Duração média do sono nos resumos diários sintéticos.",
  stepsDesc: "Média de passos nos resumos diários sintéticos.",
  stepsChartDesc: "Cada barra é um valor diário fictício; o último dia está completo.",
  direct: "Conjunto de dados sintético determinístico",
  catalogRecords: "registos sintéticos",
  tables: "conjuntos de dados",
  localProcessing: "geração reprodutível",
});
Object.assign(I18N.pt.sleep, {
  title: "Arquitetura do sono",
  intro: "Sono profundo, REM e leve, além de despertares, são gerados como um cenário coerente para demonstrar o hipnograma sem registos reais.",
  scoreDesc: "Pontuação média sintética do sono no período selecionado.",
  hypnogramDesc: "Intervalos fictícios sequenciais; horários e duração conciliam com o resumo.",
  scoreChartDesc: "A pontuação é modelada a partir da duração, despertares e pequena variação determinística.",
});
Object.assign(I18N.pt.recovery, { intro: "Os sinais sintéticos de recuperação são comparados apenas com o histórico anterior do perfil fictício; não são aplicados limiares clínicos." });
Object.assign(I18N.pt.activity, {
  workoutCountDesc: "Número de sessões de treino geradas na janela selecionada.",
  metricDesc: "{title}, calculado a partir de resumos diários sintéticos.",
  stepsDesc: "Número diário sintético de passos.",
  activeMinutesDesc: "Minutos de atividade sintéticos por dia.",
  sessionsDesc: "Sessões fictícias de força, corrida, ciclismo e caminhada com intervalos plausíveis.",
});
Object.assign(I18N.pt.genetics, {
  intro: "A demo não tem uma fonte genética, por isso estas áreas permanecem vazias e nada inferem a partir dos dados de um wearable.",
  dnaDesc: "Um mapa cromossómico, SNPs e pontuações de metilação não podem ser criados a partir de dados de um wearable.",
});
Object.assign(I18N.pt.body, {
  intro: "Seis medições sintéticas de peso modelam uma tendência gradual. A altura do perfil fictício é fixa e o IMC é recalculado localmente.",
  weightDescription: "Evolução do peso em seis medições sintéticas.",
  heightDescription: "A altura de 172 cm é um valor fixo do perfil fictício, não uma medição da balança.",
  records: "6 medições sintéticas · maio–setembro de 2026",
  date: "Data", source: "Fonte", sourceName: "Demo sintética",
});
Object.assign(I18N.pt.recommendations, {
  intro: "Um protocolo demonstrativo calculado para um perfil de treino fictício e associado a evidência externa. Não é diagnóstico nem prescrição.",
  protocolDesc: "Cada cartão separa a base pessoal sintética da evidência externa e dos limites dos dados.",
  basedOn: "Porque aparece na demo",
  medical: "Todas as premissas pessoais aqui apresentadas são sintéticas. Esta é uma demonstração educativa da interface, não aconselhamento médico para uma pessoa real.",
});
Object.assign(I18N.pt.recommendations.items.creatine, { basis: "18 de 36 treinos fictícios são sessões de força." });
Object.assign(I18N.pt.recommendations.items.protein, {
  basis: "O perfil fictício combina treino de força com um último peso sintético de 70,9 kg; a ingestão alimentar é desconhecida.",
  dose: "Uma referência de cerca de 1,6 g/kg/dia corresponde a aproximadamente 113 g/dia de proteína total; use suplemento apenas para fechar uma lacuna medida.",
  limitation: "Este é um cálculo demonstrativo; seria necessário um diário alimentar para identificar uma lacuna real.",
});
Object.assign(I18N.pt.recommendations.items.vitamin_d, { basis: "A demo usa Europe/Dublin para ilustrar orientação dependente da região e da estação." });
Object.assign(I18N.pt.recommendations.items.withhold, { basis: "As tendências sintéticas de sono e VFC não identificam uma deficiência nutricional específica." });
Object.assign(I18N.pt.data, {
  title: "Catálogo de dados sintéticos",
  intro: "Que conjuntos de dados fictícios alimentam a demo, quantos registos contêm e como foram criados.",
  tables: "12 conjuntos de dados sintéticos",
  description: "Contagens do snapshot gerado e de fluxos de alta frequência simulados.",
  publicDemo: "Demo pública · sem dados pessoais",
  reviewedSynthetic: "Snapshot sintético revisto",
  categories: { ...I18N.pt.data.categories, Body: "Corpo" },
});
I18N.pt.footer = "Medições sintéticas · showcase público · geração reprodutível";

const LanguageContext = createContext({ language: "ru", c: I18N.ru });
const useLocale = () => useContext(LanguageContext);

const STAGE_Y = { awake: 28, rem: 84, light: 140, deep: 196, out_of_bed: 28 };
const STAGE_COLOR = { awake: "#c0875b", rem: "#a48eb5", light: "#9aaf98", deep: "#3f5b51", out_of_bed: "#c0875b" };

const finite = value => Number.isFinite(Number(value));
const positive = value => finite(value) && Number(value) > 0;
const mean = (rows, field, { allowZero = false } = {}) => {
  const values = rows.map(row => Number(row[field])).filter(value => Number.isFinite(value) && (allowZero || value > 0));
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
};
const sum = (rows, field) => rows.reduce((total, row) => total + (finite(row[field]) ? Number(row[field]) : 0), 0);
const formatNumber = (value, digits = 0, language = "ru") => value == null ? "—" : new Intl.NumberFormat(LOCALE_CODES[language], { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(value);
const formatDate = (value, language = "ru") => {
  if (!value) return "—";
  const date = new Date(`${value}T12:00:00`);
  return new Intl.DateTimeFormat(LOCALE_CODES[language], { day: "numeric", month: "short", year: "numeric" }).format(date);
};
const formatDateTime = (value, language = "ru") => value ? new Intl.DateTimeFormat(LOCALE_CODES[language], { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(value)) : "—";
const formatMinutes = (value, language = "ru") => {
  if (!finite(value)) return "—";
  const minutes = Math.round(Number(value));
  const units = I18N[language].units;
  return `${Math.floor(minutes / 60)} ${units.hour} ${String(minutes % 60).padStart(2, "0")} ${units.minute}`;
};
const formatClockMinute = value => {
  if (!finite(value)) return "—";
  const minute = Math.round(Number(value)) % 1440;
  return `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;
};
const comparison = (current, previous, digits = 1, suffix = "%", language = "ru") => {
  if (!positive(current) || !positive(previous)) return null;
  const delta = ((current - previous) / previous) * 100;
  return `${delta >= 0 ? "+" : "−"}${formatNumber(Math.abs(delta), digits, language)}${suffix}`;
};
const absoluteComparison = (current, previous, digits = 1, suffix = "", language = "ru") => {
  if (!finite(current) || !finite(previous)) return null;
  const delta = current - previous;
  return `${delta >= 0 ? "+" : "−"}${formatNumber(Math.abs(delta), digits, language)}${suffix}`;
};

function Eyebrow({ children }) {
  return <p className="pg-eyebrow">{children}</p>;
}

function PageIntro({ eyebrow, title, children, aside }) {
  return <header className="pg-page-intro">
    <div>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h1>{title}</h1>
      {children && <p className="pg-deck">{children}</p>}
    </div>
    {aside}
  </header>;
}

function PeriodControl({ value, onChange }) {
  const { c } = useLocale();
  const options = Object.entries(c.periods).map(([optionValue, label]) => ({ value: optionValue, label }));
  return <div className="pg-period-control">
    <span>{c.period}</span>
    <SegmentedControl value={value} onChange={onChange} options={options} size="compact" ariaLabel={c.periodAria} />
  </div>;
}

function LanguageSwitcher({ language, onChange }) {
  const c = I18N[language];
  return <div className="pg-language-switcher" role="group" aria-label={c.languageControl}>
    {(["ru", "en", "pt"]).map(code => <button key={code} type="button" aria-pressed={language === code}
      aria-label={I18N[code].language} title={I18N[code].language} onClick={() => onChange(code)}>{code.toUpperCase()}</button>)}
  </div>;
}

function Metric({ id, title, value, unit, current, previous, sourceRows, trend, description, compareMode = "percent", digits = 1, queryId = "daily_health" }) {
  const { language, c } = useLocale();
  const delta = compareMode === "absolute" ? absoluteComparison(current, previous, digits, unit ? ` ${unit}` : "", language) : comparison(current, previous, 1, "%", language);
  return <MetricCard id={id} queryId={queryId} title={title}
    value={value} comparison={delta} deltaTone="neutral" trendValues={trend}
    trendLabel={`${title}, ${c.metricTrend}`} sourceRows={sourceRows} displayRows={sourceRows}
    description={`${description} ${c.metricNote}`} />;
}

function Hero({ snapshot, daily, coverage, workouts }) {
  const { language, c } = useLocale();
  const totalRecords = sum(coverage, "records");
  const latest = daily.slice(-30);
  const profile = [
    { label: c.hero.avgSleep, value: `${formatNumber(mean(latest, "sleepHours"), 1, language)} ${c.units.hour}` },
    { label: c.hero.avgHrv, value: `${formatNumber(mean(latest, "avgHrv"), 0, language)} ${c.units.ms}` },
    { label: c.hero.restingHr, value: `${formatNumber(mean(latest, "restingHeartRate"), 0, language)} ${c.units.bpm}` },
    { label: c.hero.steps, value: formatNumber(mean(latest, "steps"), 0, language) },
  ];
  return <section className="pg-hero">
    <div className="pg-hero-copy">
      <div className="pg-mark" aria-hidden="true"><span>P</span><span>G</span></div>
      <Eyebrow>{c.hero.eyebrow}</Eyebrow>
      <h1>Project Genome</h1>
      <p>{c.hero.description}</p>
      <div className="pg-hero-meta">
        <span><b>{daily.length}</b> {c.hero.observed}</span>
        <span><b>{workouts.length}</b> {c.hero.workouts}</span>
        <span><b>{formatNumber(totalRecords, 0, language)}</b> {c.hero.records}</span>
      </div>
    </div>
    <div className="pg-hero-panel">
      <div className="pg-profile-head">
        <span>{c.hero.dossier}</span><i aria-hidden="true" />
      </div>
      <div className="pg-profile-grid">
        {profile.map(item => <div key={item.label}><span>{item.label}</span><strong>{item.value}</strong></div>)}
      </div>
      <dl>
        <div><dt>{c.hero.coverage}</dt><dd>{formatDate(snapshot.dateRange?.from, language)} — {formatDate(snapshot.dateRange?.to, language)}</dd></div>
        <div><dt>{c.hero.timezone}</dt><dd>Europe / Dublin</dd></div>
        <div><dt>{c.hero.mode}</dt><dd>{c.hero.local}</dd></div>
      </dl>
    </div>
  </section>;
}

function Overview({ snapshot, rows, current, previous, coverage, workouts, period, setPeriod }) {
  const { language, c } = useLocale();
  const metrics = {
    sleep: mean(current, "sleepHours"),
    sleepPrevious: mean(previous, "sleepHours"),
    hrv: mean(current, "avgHrv"),
    hrvPrevious: mean(previous, "avgHrv"),
    rhr: mean(current, "restingHeartRate"),
    rhrPrevious: mean(previous, "restingHeartRate"),
    steps: mean(current, "steps"),
    stepsPrevious: mean(previous, "steps"),
  };
  const totalRecords = sum(coverage, "records");
  return <>
    <Hero snapshot={snapshot} daily={rows} coverage={coverage} workouts={workouts} />
    <div className="pg-control-row"><PeriodControl value={period} onChange={setPeriod} /></div>
    <section className="pg-section-heading">
      <div><Eyebrow>{c.overview.current}</Eyebrow><h2>{c.overview.lastDays.replace("{count}", period === "all" ? rows.length : period)}</h2></div>
      <p>{c.overview.note}</p>
    </section>
    <SortableRegion id="genome:overview:metrics" label={c.overview.metrics} variant="canvas" columns={12} spacing="standard"
      rows={[{ id: "overview-metrics", kind: "metrics", items: ["overview-sleep", "overview-hrv", "overview-rhr", "overview-steps"] }]}>
      <SortableItem id="overview-sleep" label={c.overview.avgSleep} kind="metric" span={3} minSpan={2}>
        <Metric id="overview-sleep" title={c.overview.avgSleep} value={`${formatNumber(metrics.sleep, 1, language)} ${c.units.hour}`} current={metrics.sleep} previous={metrics.sleepPrevious}
          sourceRows={current} trend={current.map(row => row.sleepHours)} description={c.overview.sleepDesc} />
      </SortableItem>
      <SortableItem id="overview-hrv" label={c.overview.avgHrv} kind="metric" span={3} minSpan={2}>
        <Metric id="overview-hrv" title={c.overview.avgHrv} value={`${formatNumber(metrics.hrv, 0, language)} ${c.units.ms}`} current={metrics.hrv} previous={metrics.hrvPrevious}
          sourceRows={current} trend={current.map(row => row.avgHrv)} description={c.overview.hrvDesc} />
      </SortableItem>
      <SortableItem id="overview-rhr" label={c.overview.restingHr} kind="metric" span={3} minSpan={2}>
        <Metric id="overview-rhr" title={c.overview.restingHr} value={`${formatNumber(metrics.rhr, 0, language)} ${c.units.bpm}`} current={metrics.rhr} previous={metrics.rhrPrevious}
          sourceRows={current} trend={current.map(row => row.restingHeartRate)} description={c.overview.rhrDesc} />
      </SortableItem>
      <SortableItem id="overview-steps" label={c.overview.stepsDay} kind="metric" span={3} minSpan={2}>
        <Metric id="overview-steps" title={c.overview.stepsDay} value={formatNumber(metrics.steps, 0, language)} current={metrics.steps} previous={metrics.stepsPrevious}
          sourceRows={current} trend={current.map(row => row.steps)} description={c.overview.stepsDesc} />
      </SortableItem>
    </SortableRegion>

    <SortableRegion id="genome:overview:trends" label={c.overview.trends} variant="canvas" columns={12} spacing="standard"
      rows={[{ id: "overview-trends", kind: "charts", items: ["overview-sleep-trend", "overview-activity-trend"] }]}>
      <SortableItem id="overview-sleep-trend" label={c.overview.sleepTrendLabel} kind="chart" span={6} minSpan={4}>
        <EvidenceChart id="overview-sleep-trend" queryId="daily_health" title={c.overview.sleepDuration} rows={current} sourceRows={current} height={260}
          description={c.overview.sleepChartDesc}
          spec={{ type: "area", x: "date", y: "sleepHours", startAtZero: false, showXAxisLabel: false, showYAxisLabel: false, valueDecimals: 1, colors: { sleepHours: "var(--chart-1)" } }} />
      </SortableItem>
      <SortableItem id="overview-activity-trend" label={c.overview.dailySteps} kind="chart" span={6} minSpan={4}>
        <EvidenceChart id="overview-activity-trend" queryId="daily_health" title={c.overview.dailySteps} rows={current} sourceRows={current} height={260}
          description={c.overview.stepsChartDesc}
          spec={{ type: "bar", x: "date", y: "steps", showXAxisLabel: false, showYAxisLabel: false, colors: { steps: "var(--chart-2)" } }} />
      </SortableItem>
    </SortableRegion>

    <section className="pg-ledger">
      <div><Eyebrow>{c.overview.integrity}</Eyebrow><h2>{c.overview.direct}</h2></div>
      <div className="pg-ledger-grid">
        <div><strong>{formatNumber(totalRecords, 0, language)}</strong><span>{c.overview.catalogRecords}</span></div>
        <div><strong>{coverage.length}</strong><span>{c.overview.tables}</span></div>
        <div><strong>0</strong><span>{c.overview.identifiers}</span></div>
        <div><strong>100%</strong><span>{c.overview.localProcessing}</span></div>
      </div>
    </section>
  </>;
}

function Hypnogram({ summary, segments }) {
  const { language, c } = useLocale();
  const total = Math.max(...segments.map(row => row.endOffsetMinutes), 1);
  const ticks = [0, .25, .5, .75, 1];
  return <DataComponent id="sleep-hypnogram" queryId="latest_sleep_stages" title={`${c.sleep.phases} · ${formatDate(summary.date, language)}`}
    kind="chart" variant="card" sourceRows={segments} displayRows={segments}
    description={c.sleep.hypnogramDesc}>
    <div className="pg-hypnogram" data-reviewed-rows>
      <svg viewBox="0 0 1040 256" role="img" aria-label={`${c.sleep.hypnogram} ${formatDate(summary.date, language)}`}>
        {Object.entries({ awake: 28, rem: 84, light: 140, deep: 196 }).map(([stage, y]) => <g key={stage}>
          <text x="0" y={y + 8} className="pg-hypno-label">{c.sleep.stages[stage]}</text>
          <line x1="108" x2="1024" y1={y} y2={y} className="pg-hypno-gridline" />
        </g>)}
        {segments.map((segment, index) => {
          const x = 108 + (segment.startOffsetMinutes / total) * 916;
          const width = Math.max(2.5, ((segment.endOffsetMinutes - segment.startOffsetMinutes) / total) * 916);
          const y = STAGE_Y[segment.stage] ?? 140;
          const prev = segments[index - 1];
          return <g key={`${segment.index}-${segment.start}`}>
            {prev && <line x1={x} x2={x} y1={STAGE_Y[prev.stage] + 8} y2={y + 8} stroke="#8d918b" strokeWidth="1" opacity=".48" />}
            <rect x={x} y={y} width={width} height="16" rx="3" fill={STAGE_COLOR[segment.stage] ?? "#8d918b"}>
              <title>{c.sleep.stages[segment.stage]} · {formatDateTime(segment.start, language)}–{formatDateTime(segment.end, language)} · {formatNumber(segment.durationMinutes, 0, language)} {c.units.minute}</title>
            </rect>
          </g>;
        })}
        {ticks.map(tick => {
          const x = 108 + tick * 916;
          const point = new Date(new Date(summary.start).getTime() + tick * total * 60000);
          return <g key={tick}><line x1={x} x2={x} y1="222" y2="228" className="pg-hypno-tick" />
            <text x={x} y="247" textAnchor={tick === 0 ? "start" : tick === 1 ? "end" : "middle"} className="pg-hypno-time">
              {point.toLocaleTimeString(LOCALE_CODES[language], { hour: "2-digit", minute: "2-digit" })}
            </text></g>;
        })}
      </svg>
    </div>
  </DataComponent>;
}

function Sleep({ current, previous, summary, segments, period, setPeriod }) {
  const { language, c } = useLocale();
  const avgSleep = mean(current, "sleepHours");
  const avgScore = mean(current, "sleepScore");
  const avgDeep = mean(current, "deepMinutes", { allowZero: true });
  const avgRem = mean(current, "remMinutes", { allowZero: true });
  return <>
    <PageIntro eyebrow={c.sleep.eyebrow} title={c.sleep.title}
      aside={<PeriodControl value={period} onChange={setPeriod} />}>
      {c.sleep.intro}
    </PageIntro>
    <div className="pg-night-note"><span>{c.sleep.latest}</span><strong>{formatClockMinute(current.at(-1)?.sleepStartMinute)} — {formatClockMinute(current.at(-1)?.sleepEndMinute)}</strong><em>{formatMinutes(summary.totalSleepMinutes, language)}</em></div>
    <SortableRegion id="genome:sleep:metrics" label={c.sleep.metrics} variant="canvas" columns={12} spacing="standard"
      rows={[{ id: "sleep-metrics", kind: "metrics", items: ["sleep-duration", "sleep-score", "sleep-deep", "sleep-rem"] }]}>
      <SortableItem id="sleep-duration" label={c.sleep.avgDuration} kind="metric" span={3}><Metric id="sleep-duration" title={c.sleep.avgDuration} value={`${formatNumber(avgSleep, 1, language)} ${c.units.hour}`} current={avgSleep} previous={mean(previous, "sleepHours")} sourceRows={current} trend={current.map(r => r.sleepHours)} description={c.sleep.avgDurationDesc} /></SortableItem>
      <SortableItem id="sleep-score" label={c.sleep.score} kind="metric" span={3}><Metric id="sleep-score" title={c.sleep.score} value={formatNumber(avgScore, 0, language)} current={avgScore} previous={mean(previous, "sleepScore")} sourceRows={current} trend={current.map(r => r.sleepScore)} description={c.sleep.scoreDesc} /></SortableItem>
      <SortableItem id="sleep-deep" label={c.sleep.deep} kind="metric" span={3}><Metric id="sleep-deep" title={c.sleep.deep} value={`${formatNumber(avgDeep, 0, language)} ${c.units.minute}`} current={avgDeep} previous={mean(previous, "deepMinutes", { allowZero: true })} sourceRows={current} trend={current.map(r => r.deepMinutes)} description={c.sleep.deepDesc} /></SortableItem>
      <SortableItem id="sleep-rem" label={c.sleep.rem} kind="metric" span={3}><Metric id="sleep-rem" title={c.sleep.rem} value={`${formatNumber(avgRem, 0, language)} ${c.units.minute}`} current={avgRem} previous={mean(previous, "remMinutes", { allowZero: true })} sourceRows={current} trend={current.map(r => r.remMinutes)} description={c.sleep.remDesc} /></SortableItem>
    </SortableRegion>
    <Hypnogram summary={summary} segments={segments} />
    <SortableRegion id="genome:sleep:trends" label={c.sleep.trends} variant="canvas" columns={12} spacing="standard"
      rows={[{ id: "sleep-trends", kind: "charts", items: ["sleep-stage-composition", "sleep-score-trend"] }]}>
      <SortableItem id="sleep-stage-composition" label={c.sleep.composition} kind="chart" span={7} minSpan={5}>
        <EvidenceChart id="sleep-stage-composition" queryId="daily_health" title={c.sleep.compositionTitle} rows={current} sourceRows={current} height={300}
          description={c.sleep.compositionDesc}
          spec={{ type: "stackedBar", x: "date", y: "deepMinutes", fields: ["deepMinutes", "remMinutes", "lightMinutes", "awakeMinutes"], showXAxisLabel: false, showYAxisLabel: false,
            colors: { deepMinutes: "#3f5b51", remMinutes: "#a48eb5", lightMinutes: "#9aaf98", awakeMinutes: "#c0875b" },
            legend: { labels: { deepMinutes: c.sleep.stages.deep, remMinutes: c.sleep.stages.rem, lightMinutes: c.sleep.stages.light, awakeMinutes: c.sleep.stages.awake } } }} />
      </SortableItem>
      <SortableItem id="sleep-score-trend" label={c.sleep.score} kind="chart" span={5} minSpan={4}>
        <EvidenceChart id="sleep-score-trend" queryId="daily_health" title={c.sleep.score} rows={current} sourceRows={current} height={300}
          description={c.sleep.scoreChartDesc}
          spec={{ type: "line", x: "date", y: "sleepScore", startAtZero: false, showXAxisLabel: false, showYAxisLabel: false, colors: { sleepScore: "var(--chart-3)" } }} />
      </SortableItem>
    </SortableRegion>
  </>;
}

function Recovery({ current, previous, period, setPeriod }) {
  const { language, c } = useLocale();
  const cards = [
    ["recovery-rhr", c.recovery.restingHr, "restingHeartRate", c.units.bpm, 0],
    ["recovery-hrv", "HRV", "avgHrv", c.units.ms, 0],
    ["recovery-spo2", "SpO₂", "avgSpo2", "%", 1],
    ["recovery-resp", c.recovery.respiratory, "respiratoryRate", c.units.perMinute, 1],
  ];
  return <>
    <PageIntro eyebrow={c.recovery.eyebrow} title={c.recovery.title} aside={<PeriodControl value={period} onChange={setPeriod} />}>
      {c.recovery.intro}
    </PageIntro>
    <SortableRegion id="genome:recovery:metrics" label={c.recovery.metrics} variant="canvas" columns={12} spacing="standard"
      rows={[{ id: "recovery-metrics", kind: "metrics", items: cards.map(card => card[0]) }]}>
      {cards.map(([id, title, field, unit, digits]) => {
        const currentValue = mean(current, field);
        const previousValue = mean(previous, field);
        return <SortableItem key={id} id={id} label={title} kind="metric" span={3}><Metric id={id} title={title} value={`${formatNumber(currentValue, digits, language)} ${unit}`} unit={unit}
          current={currentValue} previous={previousValue} sourceRows={current} trend={current.map(row => row[field])} compareMode="absolute" digits={digits}
          description={c.recovery.metricDesc.replace("{field}", field)} /></SortableItem>;
      })}
    </SortableRegion>
    <SortableRegion id="genome:recovery:charts" label={c.recovery.trends} variant="canvas" columns={12} spacing="standard"
      rows={[
        { id: "recovery-heart", kind: "charts", items: ["recovery-heart-rate", "recovery-hrv-chart"] },
        { id: "recovery-other", kind: "charts", items: ["recovery-spo2-chart", "recovery-temp-chart"] },
      ]}>
      <SortableItem id="recovery-heart-rate" label={c.recovery.pulse} kind="chart" span={6}><EvidenceChart id="recovery-heart-rate" queryId="daily_health" title={c.recovery.heartDay} rows={current} sourceRows={current} height={270}
        description={c.recovery.heartDesc} spec={{ type: "line", x: "date", y: "avgHeartRate", fields: ["avgHeartRate", "restingHeartRate"], startAtZero: false, stackable: false, showXAxisLabel: false, showYAxisLabel: false,
          colors: { avgHeartRate: "#c0875b", restingHeartRate: "#3f5b51" }, legend: { labels: { avgHeartRate: c.recovery.average, restingHeartRate: c.recovery.atRest } } }} /></SortableItem>
      <SortableItem id="recovery-hrv-chart" label="HRV" kind="chart" span={6}><EvidenceChart id="recovery-hrv-chart" queryId="daily_health" title={c.recovery.hrvTitle} rows={current} sourceRows={current} height={270}
        description={c.recovery.hrvDesc} spec={{ type: "area", x: "date", y: "avgHrv", fields: ["avgHrv", "sleepHrv"], startAtZero: false, stackable: false, showXAxisLabel: false, showYAxisLabel: false,
          colors: { avgHrv: "#718b7f", sleepHrv: "#a48eb5" }, legend: { labels: { avgHrv: c.recovery.dailyHrv, sleepHrv: c.recovery.sleepHrv } } }} /></SortableItem>
      <SortableItem id="recovery-spo2-chart" label="SpO₂" kind="chart" span={6}><EvidenceChart id="recovery-spo2-chart" queryId="daily_health" title={c.recovery.oxygen} rows={current} sourceRows={current} height={270}
        description={c.recovery.oxygenDesc} spec={{ type: "line", x: "date", y: "avgSpo2", fields: ["avgSpo2", "sleepSpo2"], startAtZero: false, stackable: false, showXAxisLabel: false, showYAxisLabel: false,
          colors: { avgSpo2: "#607f86", sleepSpo2: "#9aaf98" }, legend: { labels: { avgSpo2: c.recovery.day, sleepSpo2: c.recovery.asleep } } }} /></SortableItem>
      <SortableItem id="recovery-temp-chart" label={c.recovery.temperature} kind="chart" span={6}><EvidenceChart id="recovery-temp-chart" queryId="daily_health" title={c.recovery.temperature} rows={current} sourceRows={current} height={270}
        description={c.recovery.temperatureDesc} spec={{ type: "line", x: "date", y: "wristTemperature", fields: ["wristTemperature", "wristTemperatureBaseline"], startAtZero: false, stackable: false, valueDecimals: 2, showXAxisLabel: false, showYAxisLabel: false,
          colors: { wristTemperature: "#c0875b", wristTemperatureBaseline: "#8d918b" }, legend: { labels: { wristTemperature: c.recovery.wrist, wristTemperatureBaseline: c.recovery.baseline } } }} /></SortableItem>
    </SortableRegion>
  </>;
}

function WorkoutList({ workouts }) {
  const { language, c } = useLocale();
  return <DataComponent id="activity-workouts" queryId="workouts" title={c.activity.recent} kind="table" variant="card"
    sourceRows={workouts} displayRows={workouts} description={c.activity.sessionsDesc}>
    <div className="pg-workouts" data-reviewed-rows>
      {workouts.length ? workouts.slice(0, 12).map((workout, index) => <div className="pg-workout" key={`${workout.start}-${index}`}>
        <div className="pg-workout-index">{String(index + 1).padStart(2, "0")}</div>
        <div><strong>{c.activity.names[workout.name] ?? workout.name}</strong><span>{formatDateTime(workout.start, language)}</span></div>
        <div><strong>{formatNumber(workout.durationMinutes, 0, language)} {c.units.minute}</strong><span>{c.activity.duration}</span></div>
        <div><strong>{positive(workout.avgHeartRate) ? `${formatNumber(workout.avgHeartRate, 0, language)} ${c.units.bpm}` : "—"}</strong><span>{c.activity.averageHr}</span></div>
        <div><strong>{positive(workout.caloriesKcal) ? `${formatNumber(workout.caloriesKcal, 0, language)} ${c.units.kcal}` : "—"}</strong><span>{c.activity.activeCalories}</span></div>
      </div>) : <p className="pg-empty-inline">{c.activity.none}</p>}
    </div>
  </DataComponent>;
}

function Activity({ current, previous, workouts, period, setPeriod }) {
  const { language, c } = useLocale();
  const firstDate = current[0]?.date;
  const scopedWorkouts = workouts.filter(row => !firstDate || row.date >= firstDate);
  const metrics = [
    ["activity-steps", c.activity.stepsDay, mean(current, "steps"), mean(previous, "steps"), "", 0, current.map(r => r.steps), current, "daily_health"],
    ["activity-distance", c.activity.distance, sum(current, "distanceKm"), sum(previous, "distanceKm"), c.units.km, 1, current.map(r => r.distanceKm), current, "daily_health"],
    ["activity-minutes", c.activity.activeDay, mean(current, "activeMinutes"), mean(previous, "activeMinutes"), c.units.minute, 0, current.map(r => r.activeMinutes), current, "daily_health"],
    ["activity-sessions", c.activity.workouts, scopedWorkouts.length, workouts.filter(row => previous[0]?.date && row.date >= previous[0].date && row.date < firstDate).length, "", 0, [], scopedWorkouts, "workouts"],
  ];
  return <>
    <PageIntro eyebrow={c.activity.eyebrow} title={c.activity.title} aside={<PeriodControl value={period} onChange={setPeriod} />}>
      {c.activity.intro}
    </PageIntro>
    <SortableRegion id="genome:activity:metrics" label={c.activity.metrics} variant="canvas" columns={12} spacing="standard"
      rows={[{ id: "activity-metrics", kind: "metrics", items: metrics.map(row => row[0]) }]}>
      {metrics.map(([id, title, value, previousValue, unit, digits, trend, sourceRows, queryId]) => <SortableItem key={id} id={id} label={title} kind="metric" span={3}>
        <Metric id={id} title={title} value={`${formatNumber(value, digits, language)}${unit ? ` ${unit}` : ""}`} current={value} previous={previousValue} sourceRows={sourceRows} trend={trend} queryId={queryId}
          description={id === "activity-sessions" ? c.activity.workoutCountDesc : c.activity.metricDesc.replace("{title}", title)} />
      </SortableItem>)}
    </SortableRegion>
    <SortableRegion id="genome:activity:charts" label={c.activity.trends} variant="canvas" columns={12} spacing="standard"
      rows={[{ id: "activity-charts", kind: "charts", items: ["activity-steps-chart", "activity-minutes-chart"] }]}>
      <SortableItem id="activity-steps-chart" label={c.activity.steps} kind="chart" span={7}><EvidenceChart id="activity-steps-chart" queryId="daily_health" title={c.activity.stepsByDay} rows={current} sourceRows={current} height={300}
        description={c.activity.stepsDesc} spec={{ type: "area", x: "date", y: "steps", showXAxisLabel: false, showYAxisLabel: false, colors: { steps: "#718b7f" } }} /></SortableItem>
      <SortableItem id="activity-minutes-chart" label={c.activity.activeMinutes} kind="chart" span={5}><EvidenceChart id="activity-minutes-chart" queryId="daily_health" title={c.activity.activeMinutes} rows={current} sourceRows={current} height={300}
        description={c.activity.activeMinutesDesc} spec={{ type: "bar", x: "date", y: "activeMinutes", showXAxisLabel: false, showYAxisLabel: false, colors: { activeMinutes: "#c0875b" } }} /></SortableItem>
    </SortableRegion>
    <WorkoutList workouts={scopedWorkouts} />
  </>;
}

function EmptyModule({ id, title, eyebrow, description, accepts, row }) {
  const { c } = useLocale();
  return <DataComponent id={id} queryId="module_availability" title={title} kind="custom" variant="card"
    sourceRows={[row]} displayRows={[row]} description={description}>
    <div className="pg-empty-module" data-reviewed-rows>
      <div className="pg-empty-visual" aria-hidden="true"><span /><span /><span /></div>
      <div><Eyebrow>{eyebrow}</Eyebrow><h3>{c.empty.noData}</h3><p>{description}</p><div className="pg-accepts">{c.empty.next} <strong>{accepts}</strong></div></div>
    </div>
  </DataComponent>;
}

function Genetics({ availability }) {
  const { c } = useLocale();
  const row = availability.find(item => item.module === "genetics") ?? { module: "genetics", status: "missing", records: 0 };
  return <>
    <PageIntro eyebrow={c.genetics.eyebrow} title={c.genetics.title}>{c.genetics.intro}</PageIntro>
    <div className="pg-empty-grid">
      <EmptyModule id="genome-dna" title={c.genetics.dna} eyebrow="Genome explorer" row={row} accepts="23andMe / Ancestry raw genotype" description={c.genetics.dnaDesc} />
      <EmptyModule id="genome-pharma" title={c.genetics.pharma} eyebrow="Medication response" row={row} accepts={c.genetics.pharmaAccept} description={c.genetics.pharmaDesc} />
      <EmptyModule id="genome-risks" title={c.genetics.risks} eyebrow="Hereditary & cancer" row={row} accepts={c.genetics.risksAccept} description={c.genetics.risksDesc} />
      <EmptyModule id="genome-ancestry" title={c.genetics.ancestry} eyebrow="Ancestry" row={row} accepts="autosomal DNA file" description={c.genetics.ancestryDesc} />
    </div>
  </>;
}

function Labs({ availability }) {
  const { c } = useLocale();
  const row = availability.find(item => item.module === "blood_labs") ?? { module: "blood_labs", status: "missing", records: 0 };
  return <>
    <PageIntro eyebrow={c.labs.eyebrow} title={c.labs.title}>{c.labs.intro}</PageIntro>
    <EmptyModule id="labs-empty" title={c.labs.metrics} eyebrow="Blood panels" row={row} accepts={c.labs.accept} description={c.labs.description} />
  </>;
}

function Body({ rows }) {
  const { language, c } = useLocale();
  const latest = rows.at(-1);
  const first = rows[0];
  if (!latest) return <><PageIntro eyebrow={c.body.eyebrow} title={c.body.title}>{c.body.intro}</PageIntro></>;
  const weightDelta = latest.weightKg - first.weightKg;
  return <>
    <PageIntro eyebrow={c.body.eyebrow} title={c.body.title}>{c.body.intro}</PageIntro>
    <SortableRegion id="genome:body:metrics" label={c.body.metrics} variant="canvas" columns={12} spacing="standard"
      rows={[{ id: "body-metrics", kind: "metrics", items: ["body-weight", "body-height", "body-bmi"] }]}>
      <SortableItem id="body-weight" label={c.body.weight} kind="metric" span={4} minSpan={3}>
        <MetricCard id="body-weight" queryId="body_metrics" title={c.body.weight}
          value={`${formatNumber(latest.weightKg, 2, language)} kg`}
          comparison={`${weightDelta >= 0 ? "+" : "−"}${formatNumber(Math.abs(weightDelta), 2, language)} kg · ${c.body.firstToLast}`}
          deltaTone="neutral" trendValues={rows.map(row => row.weightKg)} trendLabel={c.body.weightDescription}
          sourceRows={rows} displayRows={rows} description={c.body.weightDescription} />
      </SortableItem>
      <SortableItem id="body-height" label={c.body.height} kind="metric" span={4} minSpan={3}>
        <MetricCard id="body-height" queryId="body_metrics" title={c.body.height}
          value={`${formatNumber(latest.heightM * 100, 0, language)} cm`}
          sourceRows={rows} displayRows={[latest]} description={c.body.heightDescription} />
      </SortableItem>
      <SortableItem id="body-bmi" label={c.body.bmi} kind="metric" span={4} minSpan={3}>
        <MetricCard id="body-bmi" queryId="body_metrics" title={c.body.bmi}
          value={formatNumber(latest.bmi, 1, language)} trendValues={rows.map(row => row.bmi)} trendLabel={c.body.bmiDescription}
          sourceRows={rows} displayRows={rows} description={c.body.bmiDescription} />
      </SortableItem>
    </SortableRegion>
    <SortableRegion id="genome:body:trend" label={c.body.dynamics} variant="canvas" columns={12} spacing="standard"
      rows={[{ id: "body-trend", kind: "charts", items: ["body-weight-trend"] }]}>
      <SortableItem id="body-weight-trend" label={c.body.dynamics} kind="chart" span={12} minSpan={6}>
        <EvidenceChart id="body-weight-trend" queryId="body_metrics" title={c.body.dynamics} rows={rows} sourceRows={rows} height={310}
          description={`${c.body.weightDescription} ${c.body.records}`}
          spec={{ type: "line", x: "date", y: "weightKg", startAtZero: false, showXAxisLabel: false, showYAxisLabel: false, valueDecimals: 2, colors: { weightKg: "var(--chart-1)" } }} />
      </SortableItem>
    </SortableRegion>
    <DataComponent id="body-records" queryId="body_metrics" title={c.body.records} kind="table" variant="card"
      sourceRows={rows} displayRows={rows} description={c.body.excluded}>
      <div className="pg-body-records" data-reviewed-rows>
        <p>{c.body.excluded}</p>
        <div className="pg-body-table" role="table">
          <div className="pg-body-table-head" role="row"><span>{c.body.date}</span><span>{c.body.weight}</span><span>{c.body.bmi}</span><span>{c.body.source}</span></div>
          {rows.map(row => <div className="pg-body-table-row" role="row" key={row.timestamp}>
            <span>{formatDate(row.date, language)}</span><b>{formatNumber(row.weightKg, 2, language)} kg</b><b>{formatNumber(row.bmi, 2, language)}</b><span>{c.body.sourceName}</span>
          </div>)}
        </div>
      </div>
    </DataComponent>
  </>;
}

function Recommendations({ current, previous, availability, evidence }) {
  const { language, c } = useLocale();
  const signals = [
    { label: c.recommendations.sleep, current: mean(current, "sleepHours"), previous: mean(previous, "sleepHours"), format: value => `${formatNumber(value, 1, language)} ${c.units.hour}` },
    { label: "HRV", current: mean(current, "avgHrv"), previous: mean(previous, "avgHrv"), format: value => `${formatNumber(value, 0, language)} ${c.units.ms}` },
    { label: c.recommendations.restingHr, current: mean(current, "restingHeartRate"), previous: mean(previous, "restingHeartRate"), format: value => `${formatNumber(value, 0, language)} ${c.units.bpm}` },
    { label: c.recommendations.steps, current: mean(current, "steps"), previous: mean(previous, "steps"), format: value => formatNumber(value, 0, language) },
  ];
  const missing = availability.filter(row => row.status === "missing");
  return <>
    <PageIntro eyebrow={c.recommendations.eyebrow} title={c.recommendations.title}>{c.recommendations.intro}</PageIntro>
    <DataComponent id="recommendation-protocol" queryId="recommendation_evidence" title={c.recommendations.protocol} kind="custom" variant="card"
      sourceRows={evidence} displayRows={evidence} description={c.recommendations.protocolDesc}>
      <div className="pg-protocol" data-reviewed-rows>
        {evidence.map((row, index) => {
          const copy = c.recommendations.items[row.id];
          if (!copy) return null;
          return <article className={`pg-recommendation pg-recommendation-${row.status}`} key={row.id}>
            <header><span>{String(index + 1).padStart(2, "0")}</span><em>{c.recommendations.statuses[row.status]}</em></header>
            <h2>{copy.title}</h2>
            <div className="pg-recommendation-body">
              <div><b>{c.recommendations.basedOn}</b><p>{copy.basis}</p></div>
              <div className="pg-recommendation-dose"><b>{c.recommendations.dose}</b><p>{copy.dose}</p></div>
              <div><b>{c.recommendations.evidence}</b><p>{copy.evidence}</p></div>
              <div><b>{c.recommendations.boundary}</b><p>{copy.limitation}</p><small>{copy.caution}</small></div>
            </div>
            <a href={row.sourceUrl} target="_blank" rel="noreferrer">{c.recommendations.source} ↗</a>
          </article>;
        })}
      </div>
    </DataComponent>
    <DataComponent id="recommendation-observations" queryId="daily_health" title={c.recommendations.changed} kind="custom" variant="card"
      sourceRows={[...previous, ...current]} displayRows={current} description={c.recommendations.comparisonDesc}>
      <div className="pg-observation-section" data-reviewed-rows>
        <div><Eyebrow>{c.recommendations.periods}</Eyebrow><h2>{c.recommendations.neutral}</h2><p>{c.recommendations.latestVsPrior}</p></div>
        <div className="pg-observations">
          {signals.map(signal => <div className="pg-observation" key={signal.label}>
            <span>{signal.label}</span><strong>{signal.format(signal.current)}</strong>
            <em>{comparison(signal.current, signal.previous, 1, "%", language) ?? c.recommendations.insufficient}</em>
          </div>)}
        </div>
      </div>
    </DataComponent>
    <DataComponent id="recommendation-readiness" queryId="module_availability" title={c.recommendations.readiness} kind="custom" variant="card"
      sourceRows={availability} displayRows={availability} description={c.recommendations.readinessDesc}>
      <div className="pg-readiness" data-reviewed-rows>
        <div><b>01</b><h3>{c.recommendations.genetics}</h3><p>{c.recommendations.geneticsText}</p></div>
        <div><b>02</b><h3>{c.recommendations.labs}</h3><p>{c.recommendations.labsText}</p></div>
        <div><b>03</b><h3>{c.recommendations.body}</h3><p>{c.recommendations.bodyText}</p></div>
        <div className="pg-readiness-status"><strong>{missing.length}</strong><span>{c.recommendations.modulesWaiting}</span></div>
      </div>
    </DataComponent>
    <div className="pg-medical-note"><strong>{c.recommendations.important}</strong><p>{c.recommendations.medical}</p></div>
  </>;
}

function DataInventory({ coverage, snapshot }) {
  const { language, c } = useLocale();
  const max = Math.max(...coverage.map(row => row.records), 1);
  const grouped = coverage.reduce((result, row) => ({ ...result, [row.category]: (result[row.category] ?? 0) + row.records }), {});
  return <>
    <PageIntro eyebrow={c.data.eyebrow} title={c.data.title}>{c.data.intro}</PageIntro>
    <div className="pg-category-strip">{Object.entries(grouped).sort((a,b) => b[1]-a[1]).map(([category, records]) => <div key={category}><span>{c.data.categories[category] ?? category}</span><strong>{formatNumber(records, 0, language)}</strong></div>)}</div>
    <DataComponent id="data-inventory" queryId="data_coverage" title={c.data.tables} kind="table" variant="card"
      sourceRows={coverage} displayRows={coverage} description={c.data.description}>
      <div className="pg-inventory" data-reviewed-rows>
        <div className="pg-inventory-head"><span>{c.data.source}</span><span>{c.data.category}</span><span>{c.data.records}</span><span>{c.data.relative}</span></div>
        {coverage.map(row => <div className="pg-inventory-row" key={row.dataset}>
          <div><strong>{row.label}</strong><small>{row.file}</small></div><span>{c.data.categories[row.category] ?? row.category}</span>
          <b>{formatNumber(row.records, 0, language)}</b><i><span style={{ width: `${Math.max(1, (row.records / max) * 100)}%` }} /></i>
        </div>)}
      </div>
    </DataComponent>
    <div className="pg-provenance"><div><span>{c.data.generated}</span><strong>{formatDateTime(snapshot.generatedAt, language)}</strong></div><div><span>{c.data.status}</span><strong>{c.data.reviewedSynthetic}</strong></div><div><span>{c.data.privacy}</span><strong>{c.data.publicDemo}</strong></div></div>
  </>;
}

function LocalizedDashboardBody({ initialView, snapshot, queries, current, previous, period, setPeriod, daily, latestSummary, latestSegments, workouts, coverage, availability, evidence, bodyRows }) {
  const { c } = useLocale();
  const tabs = useMemo(() => TAB_IDS.map(id => ({
    id,
    label: c.tabs[id],
    previousLabels: Object.values(I18N).map(dictionary => dictionary.tabs[id]).filter(label => label !== c.tabs[id]),
  })), [c]);
  const { activeTabId } = useDashboardTabs(tabs);
  const tab = initialView.tab ?? (tabs.some(item => item.id === activeTabId) ? activeTabId : "overview");
  const common = { current, previous, period, setPeriod };
  return tab === "sleep" ? <Sleep {...common} summary={latestSummary} segments={latestSegments} />
    : tab === "recovery" ? <Recovery {...common} />
      : tab === "activity" ? <Activity {...common} workouts={workouts} />
        : tab === "genome" ? <Genetics availability={availability} />
          : tab === "labs" ? <Labs availability={availability} />
            : tab === "body" ? <Body rows={bodyRows} />
              : tab === "recommendations" ? <Recommendations {...common} availability={availability} evidence={evidence} />
                : tab === "data" ? <DataInventory coverage={coverage} snapshot={snapshot} />
                  : <Overview snapshot={snapshot} rows={daily} current={current} previous={previous} coverage={coverage} workouts={workouts} period={period} setPeriod={setPeriod} />;
}

export function DashboardContent({ initialView = {} }) {
  const { snapshot, queries } = useDataApp();
  const [language, setLanguage] = useState("ru");
  const [period, setPeriod] = useState("30");
  const c = I18N[language];
  const daily = queries.daily_health?.rows ?? [];
  const latestSummary = queries.latest_sleep_summary?.rows?.[0] ?? {};
  const latestSegments = queries.latest_sleep_stages?.rows ?? [];
  const workouts = queries.workouts?.rows ?? [];
  const coverage = queries.data_coverage?.rows ?? [];
  const availability = queries.module_availability?.rows ?? [];
  const evidence = queries.recommendation_evidence?.rows ?? [];
  const bodyRows = queries.body_metrics?.rows ?? [];
  const { current, previous } = useMemo(() => {
    const count = period === "all" ? daily.length : Number(period);
    const currentRows = daily.slice(-count);
    const previousRows = daily.slice(Math.max(0, daily.length - count * 2), Math.max(0, daily.length - count));
    return { current: currentRows, previous: previousRows };
  }, [daily, period]);

  return <LanguageContext.Provider value={{ language, c }}>
    <article className="page pg-page" data-language={language} lang={language}>
      <LanguageSwitcher language={language} onChange={setLanguage} />
      <LocalizedDashboardBody key={language} {...{ initialView, snapshot, queries, current, previous, period, setPeriod, daily, latestSummary, latestSegments, workouts, coverage, availability, evidence, bodyRows }} />
      <footer className="pg-footer"><span>Project Genome</span><p>{c.footer}</p></footer>
    </article>
  </LanguageContext.Provider>;
}
