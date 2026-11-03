// The dosing schedules on gliplog.com/dosing/, one entry per medicine. Every figure is copied
// from section 2 (Dosage and Administration) of the medicine's US prescribing information on
// DailyMed, checked against the label's own text on CHECKED. Change a figure only from the
// label, then run `npm run build` to regenerate the pages.

export const CHECKED = '31 October 2026'

/**
 * A rung is one dose on the schedule. `kind`: `start` is the label's starting dose, `step` a
 * dose on the way up, `keep` a dose the label allows staying on. `option` marks a step the
 * label leaves to the prescriber ("may be increased", "if needed"). `chart: false` keeps a dose
 * in the table but off the chart, when it would flatten every other bar.
 */

const NOVO = 'Novo Nordisk'
const LILLY = 'Eli Lilly'

const LABELS = {
  wegovy: {
    title: 'WEGOVY (semaglutide) injection and tablets',
    url: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=ee06186f-2aa3-4990-a760-757579d8f77b',
    revised: '6/2026',
  },
  ozempic: {
    title: 'OZEMPIC (semaglutide) injection',
    url: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=adec4fd2-6858-4c99-91d4-531f5f2a2d79',
    revised: '5/2026',
  },
  rybelsus: {
    title: 'RYBELSUS and OZEMPIC (semaglutide) tablets',
    url: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=27f15fac-7d98-4114-a2ec-92494a91da98',
    revised: '1/2026',
  },
  zepbound: {
    title: 'ZEPBOUND (tirzepatide)',
    url: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=487cd7e7-434c-4925-99fa-aa80b1cc776b',
    revised: '8/2026',
  },
  mounjaro: {
    title: 'MOUNJARO (tirzepatide)',
    url: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=d2d7da5d-ad07-4228-955f-cf7e355c8cc0',
    revised: '8/2026',
  },
  saxenda: {
    title: 'SAXENDA (liraglutide) injection',
    url: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=3946d389-0926-4f77-a708-0acb8153b143',
    revised: '6/2026',
  },
  foundayo: {
    title: 'FOUNDAYO (orforglipron) tablets',
    url: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=8ac446c5-feba-474f-a103-23facb9b5c62',
    revised: '7/2026',
  },
}

const TABLET_TAKING =
  'One tablet each morning on an empty stomach, swallowed whole with up to 4 ounces (120 mL) of plain water. Wait 30 minutes before eating, drinking, or taking other pills. One tablet a day at most.'

const SKIP_TABLET = 'Skip the missed tablet and take the next one the following day.'

const TIRZEPATIDE_MISSED =
  'Take it as soon as possible within 4 days (96 hours). After more than 4 days, skip it and take the next one on the usual day.'

const TIRZEPATIDE_DAY = 'Can change, as long as doses are at least 3 days (72 hours) apart.'

/** The groups the hub lists, in order. */
export const GROUPS = [
  {
    id: 'semaglutide-injections',
    title: 'Semaglutide injections',
    medicines: ['wegovy', 'ozempic'],
  },
  {
    id: 'semaglutide-tablets',
    title: 'Semaglutide tablets',
    medicines: ['wegovy-tablets', 'rybelsus', 'ozempic-tablets'],
  },
  { id: 'tirzepatide', title: 'Tirzepatide injections', medicines: ['zepbound', 'mounjaro'] },
  { id: 'other', title: 'Other GLP-1 medicines', medicines: ['saxenda', 'foundayo'] },
]

export const MEDICINES = [
  {
    slug: 'wegovy',
    name: 'Wegovy',
    fullName: 'Wegovy injection',
    generic: 'semaglutide',
    owner: NOVO,
    form: 'Weekly injection',
    unit: 'week',
    approvedFor: 'For weight reduction, lowering heart risk, and other uses on its label.',
    label: LABELS.wegovy,
    glance: {
      often: 'Weekly',
      start: '0.25 mg',
      steps: 'Every 4 weeks',
      ongoing: '2.4 mg or 1.7 mg',
      highest: '7.2 mg',
    },
    quick:
      'Wegovy (semaglutide) is injected once a week. The label starts at 0.25 mg for 4 weeks, then steps up every 4 weeks: 0.5 mg, 1 mg, 1.7 mg, and 2.4 mg from week 17. The label’s ongoing dose is 2.4 mg, or 1.7 mg.',
    rungs: [
      { dose: 0.25, when: 'Weeks 1 to 4', kind: 'start', note: 'Starting dose' },
      { dose: 0.5, when: 'Weeks 5 to 8', kind: 'step', note: 'Step up' },
      { dose: 1, when: 'Weeks 9 to 12', kind: 'step', note: 'Step up' },
      { dose: 1.7, when: 'Weeks 13 to 16', kind: 'keep', note: 'Step up; also an ongoing dose' },
      { dose: 2.4, when: 'Week 17 on', kind: 'keep', note: 'The label’s recommended ongoing dose' },
      {
        dose: 7.2,
        when: 'After 4+ weeks on 2.4 mg',
        kind: 'keep',
        option: true,
        chart: false,
        note: 'Wegovy HD, for more weight reduction in adults, if the prescriber decides',
      },
    ],
    maintenance:
      'From week 17 the label’s ongoing dose is 2.4 mg, or 1.7 mg. For weight reduction in adults who have taken 2.4 mg for at least 4 weeks, the label allows going up to 7.2 mg if more weight reduction is needed.',
    goodToKnow: [
      'Inject once a week on the same day, at any time of day, with or without meals.',
      'If a step isn’t tolerated, the label suggests considering waiting 4 more weeks before the next one.',
    ],
    missed:
      "If the next dose is more than 2 days away, take it as soon as possible. If it's less than 2 days away, skip it and take the next one on the usual day. After 2 or more missed doses in a row, the label says to restart the steps at a lower dose.",
    changeDay: 'Inject on the same day each week.',
    faq: [
      {
        q: 'What is the starting dose of Wegovy?',
        a: 'The label starts Wegovy at 0.25 mg once a week for the first 4 weeks. The dose then steps up every 4 weeks, to 0.5 mg, 1 mg and 1.7 mg, reaching 2.4 mg at week 17.',
      },
      {
        q: 'How long does it take to reach 2.4 mg?',
        a: 'On the label’s schedule, 16 weeks: 2.4 mg starts at week 17. A prescriber may wait longer between steps if a dose isn’t tolerated.',
      },
      {
        q: 'What is Wegovy 7.2 mg?',
        a: 'Wegovy HD. The label allows 7.2 mg once a week for weight reduction in adults who have taken 2.4 mg for at least 4 weeks and need more weight reduction. It is the highest dose on the label.',
      },
      {
        q: 'What if I miss a Wegovy dose?',
        a: 'The label says to take it as soon as possible if the next dose is more than 2 days away, and otherwise to skip it. After 2 or more missed doses in a row, it says to restart at a lower dose.',
      },
      {
        q: 'Can I switch between Wegovy injections and tablets?',
        a: 'The label describes how: 25 mg tablets start one week after a last 2.4 mg injection, and 2.4 mg injections start the day after a last 25 mg tablet. Your prescriber sets the plan.',
      },
    ],
    app: { catalog: true, levels: true },
    related: ['ozempic', 'wegovy-tablets', 'zepbound'],
  },
  {
    slug: 'ozempic',
    name: 'Ozempic',
    fullName: 'Ozempic',
    generic: 'semaglutide',
    owner: NOVO,
    form: 'Weekly injection',
    unit: 'week',
    approvedFor: 'For type 2 diabetes, and other uses on its label.',
    label: LABELS.ozempic,
    glance: {
      often: 'Weekly',
      start: '0.25 mg',
      steps: 'At least 4 weeks each',
      ongoing: '0.5, 1 or 2 mg',
      highest: '2 mg',
    },
    quick:
      'Ozempic (semaglutide) is injected once a week. The label starts at 0.25 mg for 4 weeks, then 0.5 mg. If more blood sugar control is needed, it can go up to 1 mg and then 2 mg, each after at least 4 weeks on the dose before.',
    rungs: [
      { dose: 0.25, when: 'Weeks 1 to 4', kind: 'start', note: 'Starting dose' },
      { dose: 0.5, when: 'Week 5 on', kind: 'keep', note: 'An ongoing dose' },
      {
        dose: 1,
        when: 'If needed, after 4+ weeks',
        kind: 'keep',
        option: true,
        note: 'After at least 4 weeks on 0.5 mg',
      },
      {
        dose: 2,
        when: 'If needed, after 4+ weeks',
        kind: 'keep',
        option: true,
        note: 'After at least 4 weeks on 1 mg; the most',
      },
    ],
    maintenance:
      'The label’s ongoing dose is 0.5 mg, 1 mg or 2 mg once a week, depending on blood sugar. 2 mg is the most.',
    goodToKnow: [
      'Inject once a week on the same day, at any time of day, with or without meals.',
      'Each increase comes after at least 4 weeks on the dose before.',
    ],
    missed:
      'Take it as soon as possible within 5 days. After more than 5 days, skip it and take the next one on the usual day.',
    changeDay: 'Can change, as long as doses are at least 2 days (48 hours) apart.',
    faq: [
      {
        q: 'What is the starting dose of Ozempic?',
        a: 'The label starts Ozempic at 0.25 mg once a week for 4 weeks, then increases to 0.5 mg.',
      },
      {
        q: 'How often can the Ozempic dose go up?',
        a: 'No sooner than every 4 weeks. After at least 4 weeks on 0.5 mg the label allows 1 mg, and after at least 4 weeks on 1 mg it allows 2 mg, if more blood sugar control is needed.',
      },
      {
        q: 'What is the highest dose of Ozempic?',
        a: '2 mg once a week, according to the label.',
      },
      {
        q: 'What if I miss an Ozempic dose?',
        a: 'The label says to take it as soon as possible within 5 days. After more than 5 days, skip it and take the next dose on the usual day.',
      },
    ],
    app: { catalog: true, levels: true },
    related: ['wegovy', 'ozempic-tablets', 'mounjaro'],
  },
  {
    slug: 'wegovy-tablets',
    name: 'Wegovy tablets',
    fullName: 'Wegovy tablets',
    generic: 'semaglutide',
    owner: NOVO,
    form: 'Daily tablet',
    unit: 'day',
    approvedFor: 'For weight reduction and lowering heart risk.',
    label: LABELS.wegovy,
    glance: {
      often: 'Daily',
      start: '1.5 mg',
      steps: 'Every 30 days',
      ongoing: '25 mg',
      highest: '25 mg',
    },
    quick:
      'Wegovy tablets (semaglutide) are taken once a day. The label steps up every 30 days: 1.5 mg for days 1 to 30, 4 mg for days 31 to 60, 9 mg for days 61 to 90, then the ongoing dose of 25 mg from day 91.',
    rungs: [
      { dose: 1.5, when: 'Days 1 to 30', kind: 'start', note: 'Starting dose' },
      { dose: 4, when: 'Days 31 to 60', kind: 'step', note: 'Step up' },
      { dose: 9, when: 'Days 61 to 90', kind: 'step', note: 'Step up' },
      { dose: 25, when: 'Day 91 on', kind: 'keep', note: 'The label’s ongoing dose' },
    ],
    maintenance:
      'The label’s ongoing dose is 25 mg once a day. If 25 mg isn’t tolerated, the label suggests considering the weekly Wegovy injection at 1.7 mg instead.',
    goodToKnow: [
      TABLET_TAKING,
      'If a step isn’t tolerated, the label suggests considering a delay before the next one.',
      'Switching: the label starts 25 mg tablets one week after a last 2.4 mg injection, and 2.4 mg injections the day after a last 25 mg tablet.',
    ],
    missed: SKIP_TABLET,
    changeDay: null,
    faq: [
      {
        q: 'What is the starting dose of Wegovy tablets?',
        a: 'The label starts Wegovy tablets at 1.5 mg once a day for the first 30 days, then steps up every 30 days to 4 mg and 9 mg, reaching 25 mg on day 91.',
      },
      {
        q: 'How should Wegovy tablets be taken?',
        a: 'The label says one tablet each morning on an empty stomach with up to 4 ounces of plain water, swallowed whole, then wait at least 30 minutes before food, other drinks or other medicines by mouth.',
      },
      {
        q: 'What if I miss a Wegovy tablet?',
        a: 'The label says to skip it and take the next tablet the following day.',
      },
      {
        q: 'What if 25 mg isn’t tolerated?',
        a: 'The label suggests considering switching to the weekly Wegovy injection at 1.7 mg. Your prescriber decides.',
      },
    ],
    app: { catalog: true, levels: false },
    related: ['wegovy', 'rybelsus', 'foundayo'],
  },
  {
    slug: 'rybelsus',
    name: 'Rybelsus',
    fullName: 'Rybelsus',
    generic: 'semaglutide',
    owner: NOVO,
    form: 'Daily tablet',
    unit: 'day',
    approvedFor: 'For type 2 diabetes, and other uses on its label.',
    label: LABELS.rybelsus,
    glance: {
      often: 'Daily',
      start: '3 mg',
      steps: 'After 30 days',
      ongoing: '7 or 14 mg',
      highest: '14 mg',
    },
    quick:
      'Rybelsus (semaglutide) is taken once a day. The label starts at 3 mg for 30 days, then 7 mg. From day 61, if more blood sugar control is needed, it can go up to 14 mg.',
    rungs: [
      {
        dose: 3,
        when: 'Days 1 to 30',
        kind: 'start',
        note: 'Starting dose; the label says it doesn’t lower blood sugar',
      },
      { dose: 7, when: 'Day 31 on', kind: 'keep', note: 'An ongoing dose' },
      {
        dose: 14,
        when: 'If needed, from day 61',
        kind: 'keep',
        option: true,
        note: 'If more blood sugar control is needed',
      },
    ],
    maintenance:
      'The label’s ongoing dose is 7 mg once a day, or 14 mg if more blood sugar control is needed.',
    goodToKnow: [
      TABLET_TAKING,
      'Rybelsus and Ozempic tablets are not swapped milligram for milligram: the label pairs Rybelsus 7 mg with Ozempic 4 mg tablets, and 14 mg with 9 mg. It says not to switch between them in the first 30 days.',
    ],
    missed: SKIP_TABLET,
    changeDay: null,
    faq: [
      {
        q: 'What is the starting dose of Rybelsus?',
        a: 'The label starts Rybelsus at 3 mg once a day for 30 days. It notes that 3 mg doesn’t lower blood sugar: it is there to start. On day 31 the dose goes up to 7 mg.',
      },
      {
        q: 'When can Rybelsus go up to 14 mg?',
        a: 'From day 61, if more blood sugar control is needed, according to the label. Your prescriber decides.',
      },
      {
        q: 'Is Rybelsus the same as Ozempic tablets?',
        a: 'Both are semaglutide tablets on one label, but in different strengths that the label says are not swapped milligram for milligram.',
      },
      {
        q: 'What if I miss a Rybelsus tablet?',
        a: 'The label says to skip it and take the next tablet the following day.',
      },
    ],
    app: { catalog: true, levels: false },
    related: ['ozempic-tablets', 'wegovy-tablets', 'ozempic'],
  },
  {
    slug: 'ozempic-tablets',
    name: 'Ozempic tablets',
    fullName: 'Ozempic tablets',
    generic: 'semaglutide',
    owner: NOVO,
    form: 'Daily tablet',
    unit: 'day',
    approvedFor: 'For type 2 diabetes, and other uses on its label.',
    label: LABELS.rybelsus,
    glance: {
      often: 'Daily',
      start: '1.5 mg',
      steps: 'After 30 days',
      ongoing: '4 or 9 mg',
      highest: '9 mg',
    },
    quick:
      'Ozempic tablets (semaglutide) are taken once a day. The label starts at 1.5 mg for 30 days, then 4 mg. From day 61, if more blood sugar control is needed, they can go up to 9 mg.',
    rungs: [
      {
        dose: 1.5,
        when: 'Days 1 to 30',
        kind: 'start',
        note: 'Starting dose; the label says it doesn’t lower blood sugar',
      },
      { dose: 4, when: 'Day 31 on', kind: 'keep', note: 'An ongoing dose' },
      {
        dose: 9,
        when: 'If needed, from day 61',
        kind: 'keep',
        option: true,
        note: 'If more blood sugar control is needed',
      },
    ],
    maintenance:
      'The label’s ongoing dose is 4 mg once a day, or 9 mg if more blood sugar control is needed.',
    goodToKnow: [
      TABLET_TAKING,
      'Ozempic tablets and Rybelsus are not swapped milligram for milligram: the label pairs Ozempic 4 mg tablets with Rybelsus 7 mg, and 9 mg with 14 mg.',
    ],
    missed: SKIP_TABLET,
    changeDay: null,
    faq: [
      {
        q: 'What is the starting dose of Ozempic tablets?',
        a: 'The label starts Ozempic tablets at 1.5 mg once a day for 30 days, then 4 mg. It notes that 1.5 mg doesn’t lower blood sugar.',
      },
      {
        q: 'Are Ozempic tablets the same as Ozempic injections?',
        a: 'Both are semaglutide, but the tablets are taken daily in different strengths, on a different label from the weekly injection.',
      },
      {
        q: 'What if I miss an Ozempic tablet?',
        a: 'The label says to skip it and take the next tablet the following day.',
      },
    ],
    app: { catalog: true, levels: false },
    related: ['rybelsus', 'ozempic', 'wegovy-tablets'],
  },
  {
    slug: 'zepbound',
    name: 'Zepbound',
    fullName: 'Zepbound',
    generic: 'tirzepatide',
    owner: LILLY,
    form: 'Weekly injection',
    unit: 'week',
    approvedFor: 'For weight reduction, and for obstructive sleep apnea with obesity.',
    label: LABELS.zepbound,
    glance: {
      often: 'Weekly',
      start: '2.5 mg',
      steps: '2.5 mg, at least 4 weeks each',
      ongoing: '5, 10 or 15 mg',
      highest: '15 mg',
    },
    quick:
      'Zepbound (tirzepatide) is injected once a week. The label starts at 2.5 mg for 4 weeks, then 5 mg. The dose may then go up 2.5 mg at a time, each after at least 4 weeks on the dose before. The label’s ongoing doses are 5, 10 or 15 mg.',
    rungs: [
      {
        dose: 2.5,
        when: 'Weeks 1 to 4',
        kind: 'start',
        note: 'Starting dose only; not an ongoing dose',
      },
      { dose: 5, when: 'Week 5', kind: 'keep', note: 'An ongoing dose' },
      {
        dose: 7.5,
        when: 'Week 9',
        kind: 'step',
        option: true,
        note: 'At the earliest; a step on the way',
      },
      {
        dose: 10,
        when: 'Week 13',
        kind: 'keep',
        option: true,
        note: 'At the earliest; an ongoing dose',
      },
      {
        dose: 12.5,
        when: 'Week 17',
        kind: 'step',
        option: true,
        note: 'At the earliest; a step on the way',
      },
      {
        dose: 15,
        when: 'Week 21',
        kind: 'keep',
        option: true,
        note: 'At the earliest; an ongoing dose and the most',
      },
    ],
    weeksNote: 'Earliest week for each dose, from the first injection',
    maintenance:
      'The label’s ongoing doses are 5, 10 or 15 mg once a week for weight reduction, and 10 or 15 mg for sleep apnea. 15 mg is the most.',
    goodToKnow: [
      'Each increase is 2.5 mg, after at least 4 weeks on the dose before. Steps after 5 mg are up to the prescriber.',
      'The 2.5 mg dose is for starting only; the label says it is not an ongoing dose.',
    ],
    missed: TIRZEPATIDE_MISSED,
    changeDay: TIRZEPATIDE_DAY,
    faq: [
      {
        q: 'What is the starting dose of Zepbound?',
        a: 'The label starts Zepbound at 2.5 mg once a week for 4 weeks. It says 2.5 mg is for starting and is not an ongoing dose. At week 5 the dose moves to 5 mg.',
      },
      {
        q: 'What are the maintenance doses of Zepbound?',
        a: 'The label lists 5 mg, 10 mg or 15 mg once a week for weight reduction, and 10 mg or 15 mg for obstructive sleep apnea. 7.5 mg and 12.5 mg are steps on the way.',
      },
      {
        q: 'How fast can Zepbound go up?',
        a: 'In 2.5 mg steps, each after at least 4 weeks on the current dose, according to the label. The earliest 15 mg can start is week 21.',
      },
      {
        q: 'What if I miss a Zepbound dose?',
        a: 'The label says to take it as soon as possible within 4 days (96 hours). After more than 4 days, skip it and take the next dose on the usual day.',
      },
    ],
    app: { catalog: true, levels: true },
    related: ['mounjaro', 'wegovy', 'foundayo'],
  },
  {
    slug: 'mounjaro',
    name: 'Mounjaro',
    fullName: 'Mounjaro',
    generic: 'tirzepatide',
    owner: LILLY,
    form: 'Weekly injection',
    unit: 'week',
    approvedFor: 'For type 2 diabetes, and other uses on its label.',
    label: LABELS.mounjaro,
    glance: {
      often: 'Weekly',
      start: '2.5 mg',
      steps: '2.5 mg, at least 4 weeks each',
      ongoing: 'As needed for blood sugar',
      highest: '15 mg',
    },
    quick:
      'Mounjaro (tirzepatide) is injected once a week. The label starts at 2.5 mg. If more blood sugar control is needed, the dose goes up 2.5 mg at a time, each after at least 4 weeks on the dose before, to at most 15 mg.',
    rungs: [
      { dose: 2.5, when: 'Week 1', kind: 'start', note: 'Starting dose' },
      { dose: 5, when: 'Week 5', kind: 'keep', option: true, note: 'At the earliest, if needed' },
      { dose: 7.5, when: 'Week 9', kind: 'keep', option: true, note: 'At the earliest, if needed' },
      { dose: 10, when: 'Week 13', kind: 'keep', option: true, note: 'At the earliest, if needed' },
      {
        dose: 12.5,
        when: 'Week 17',
        kind: 'keep',
        option: true,
        note: 'At the earliest, if needed',
      },
      {
        dose: 15,
        when: 'Week 21',
        kind: 'keep',
        option: true,
        note: 'At the earliest, if needed; the highest dose',
      },
    ],
    weeksNote: 'Earliest week for each dose, from the first injection',
    maintenance:
      "The label doesn't name one ongoing dose. The dose goes up only if more blood sugar control is needed, to at most 15 mg.",
    goodToKnow: [
      'Each increase is 2.5 mg, after at least 4 weeks on the dose before, and only if more blood sugar control is needed.',
    ],
    missed: TIRZEPATIDE_MISSED,
    changeDay: TIRZEPATIDE_DAY,
    faq: [
      {
        q: 'What is the starting dose of Mounjaro?',
        a: 'The label starts Mounjaro at 2.5 mg once a week.',
      },
      {
        q: 'When does the Mounjaro dose go up?',
        a: 'If more blood sugar control is needed, the label increases the dose in 2.5 mg steps, each after at least 4 weeks on the current dose.',
      },
      {
        q: 'What is the highest dose of Mounjaro?',
        a: '15 mg once a week, according to the label.',
      },
      {
        q: 'What if I miss a Mounjaro dose?',
        a: 'The label says to take it as soon as possible within 4 days (96 hours). After more than 4 days, skip it and take the next dose on the usual day.',
      },
    ],
    app: { catalog: true, levels: true },
    related: ['zepbound', 'ozempic', 'rybelsus'],
  },
  {
    slug: 'saxenda',
    name: 'Saxenda',
    fullName: 'Saxenda',
    generic: 'liraglutide',
    owner: NOVO,
    form: 'Daily injection',
    unit: 'week',
    approvedFor: 'For weight reduction in adults.',
    label: LABELS.saxenda,
    glance: {
      often: 'Daily',
      start: '0.6 mg',
      steps: 'Every week',
      ongoing: '3 mg',
      highest: '3 mg',
    },
    quick:
      'Saxenda (liraglutide) is injected once a day. For adults the label steps up every week: 0.6 mg, 1.2 mg, 1.8 mg and 2.4 mg, then 3 mg a day from week 5. The label says the lower doses are for stepping up only.',
    rungs: [
      { dose: 0.6, when: 'Week 1', kind: 'start', note: 'Starting dose' },
      { dose: 1.2, when: 'Week 2', kind: 'step', note: 'Step up' },
      { dose: 1.8, when: 'Week 3', kind: 'step', note: 'Step up' },
      { dose: 2.4, when: 'Week 4', kind: 'step', note: 'Step up' },
      { dose: 3, when: 'Week 5 on', kind: 'keep', note: 'The label’s ongoing dose for adults' },
    ],
    weeksNote: 'Daily dose in each week, from the first injection',
    maintenance:
      'For adults the label’s dose is 3 mg a day; it says the lower doses are for stepping up only.',
    goodToKnow: [
      'If a step isn’t tolerated, the label suggests considering waiting about one more week before the next.',
      'The label says to stop Saxenda if 3 mg isn’t tolerated, and to check weight at 16 weeks: it says to stop if weight hasn’t fallen by at least 4%. Your prescriber makes that call with you.',
    ],
    missed:
      "Carry on with the next scheduled dose; don't take an extra or larger dose. If more than 3 days have passed since the last dose, the label says to restart at 0.6 mg and step up again.",
    changeDay: null,
    faq: [
      {
        q: 'What is the starting dose of Saxenda?',
        a: 'The label starts Saxenda at 0.6 mg a day for one week, then steps up by 0.6 mg each week to 3 mg a day from week 5.',
      },
      {
        q: 'Is Saxenda the same as Wegovy?',
        a: 'No. Saxenda is liraglutide, injected daily; Wegovy is semaglutide, injected weekly or taken as a daily tablet.',
      },
      {
        q: 'What if I miss Saxenda for a few days?',
        a: 'For a single missed dose, the label says to carry on with the next scheduled dose. If more than 3 days have passed, it says to restart at 0.6 mg and step up again.',
      },
    ],
    app: { catalog: false, levels: false },
    related: ['wegovy', 'zepbound', 'foundayo'],
  },
  {
    slug: 'foundayo',
    name: 'Foundayo',
    fullName: 'Foundayo',
    generic: 'orforglipron',
    owner: LILLY,
    form: 'Daily tablet',
    unit: 'day',
    approvedFor: 'For weight reduction in adults.',
    label: LABELS.foundayo,
    glance: {
      often: 'Daily',
      start: '0.8 mg',
      steps: 'At least 30 days each',
      ongoing: '5.5 mg or more',
      highest: '17.2 mg',
    },
    quick:
      'Foundayo (orforglipron) is taken once a day, with or without food. The label starts at 0.8 mg, then 2.5 mg, then 5.5 mg, each after at least 30 days. It may then go up to 9 mg, 14.5 mg and 17.2 mg, each after at least 30 days on the dose before.',
    rungs: [
      { dose: 0.8, when: 'Days 1 to 30', kind: 'start', note: 'Starting dose' },
      { dose: 2.5, when: 'Day 31', kind: 'step', note: 'After at least 30 days' },
      { dose: 5.5, when: 'Day 61', kind: 'keep', note: 'After at least 30 days on 2.5 mg' },
      {
        dose: 9,
        when: 'Day 91',
        kind: 'keep',
        option: true,
        note: 'At the earliest, if the prescriber steps up',
      },
      {
        dose: 14.5,
        when: 'Day 121',
        kind: 'keep',
        option: true,
        note: 'At the earliest, if the prescriber steps up',
      },
      {
        dose: 17.2,
        when: 'Day 151',
        kind: 'keep',
        option: true,
        note: 'At the earliest; the most',
      },
    ],
    weeksNote: 'Earliest day for each dose',
    maintenance:
      'The label doesn’t name one ongoing dose. After 5.5 mg it may go up, based on how well it works and is tolerated, to at most 17.2 mg a day.',
    goodToKnow: [
      'Take one tablet a day, with or without food. Swallow it whole; don’t break, crush or chew it. Never more than one tablet a day.',
    ],
    missed:
      "Take it as soon as possible, but don't double up the next dose. After 7 or more missed doses in a row, the label says to restart at a lower dose.",
    changeDay: null,
    faq: [
      {
        q: 'What is the starting dose of Foundayo?',
        a: 'The label starts Foundayo at 0.8 mg once a day. After at least 30 days it goes to 2.5 mg, and after at least 30 more days to 5.5 mg.',
      },
      {
        q: 'Does Foundayo have to be taken on an empty stomach?',
        a: 'No. The label says it can be taken with or without food.',
      },
      {
        q: 'What if I miss a Foundayo tablet?',
        a: 'The label says to take it as soon as possible without doubling up the next dose. After 7 or more missed in a row, it says to restart at a lower dose.',
      },
    ],
    app: { catalog: true, levels: true },
    related: ['wegovy-tablets', 'zepbound', 'saxenda'],
  },
]
