export interface StateMeta {
  name: string;
  slug: string;
  abbr: string;
  hasIncomeTax: boolean;
  hasFlatTax: boolean;
  neighbors: string[]; // abbreviation codes of neighboring states
}

export const STATES: Record<string, StateMeta> = {
  AL: { name: 'Alabama', slug: 'alabama', abbr: 'AL', hasIncomeTax: true, hasFlatTax: false, neighbors: ['TN', 'GA', 'FL', 'MS'] },
  AK: { name: 'Alaska', slug: 'alaska', abbr: 'AK', hasIncomeTax: false, hasFlatTax: false, neighbors: [] },
  AZ: { name: 'Arizona', slug: 'arizona', abbr: 'AZ', hasIncomeTax: true, hasFlatTax: true, neighbors: ['UT', 'CO', 'NM', 'NV', 'CA'] },
  AR: { name: 'Arkansas', slug: 'arkansas', abbr: 'AR', hasIncomeTax: true, hasFlatTax: false, neighbors: ['MO', 'TN', 'MS', 'LA', 'TX', 'OK'] },
  CA: { name: 'California', slug: 'california', abbr: 'CA', hasIncomeTax: true, hasFlatTax: false, neighbors: ['OR', 'NV', 'AZ'] },
  CO: { name: 'Colorado', slug: 'colorado', abbr: 'CO', hasIncomeTax: true, hasFlatTax: true, neighbors: ['WY', 'NE', 'KS', 'OK', 'NM', 'AZ', 'UT'] },
  CT: { name: 'Connecticut', slug: 'connecticut', abbr: 'CT', hasIncomeTax: true, hasFlatTax: false, neighbors: ['NY', 'MA', 'RI'] },
  DE: { name: 'Delaware', slug: 'delaware', abbr: 'DE', hasIncomeTax: true, hasFlatTax: false, neighbors: ['PA', 'MD', 'NJ'] },
  DC: { name: 'District of Columbia', slug: 'district-of-columbia', abbr: 'DC', hasIncomeTax: true, hasFlatTax: false, neighbors: ['MD', 'VA'] },
  FL: { name: 'Florida', slug: 'florida', abbr: 'FL', hasIncomeTax: false, hasFlatTax: false, neighbors: ['GA', 'AL'] },
  GA: { name: 'Georgia', slug: 'georgia', abbr: 'GA', hasIncomeTax: true, hasFlatTax: false, neighbors: ['TN', 'NC', 'SC', 'FL', 'AL'] },
  HI: { name: 'Hawaii', slug: 'hawaii', abbr: 'HI', hasIncomeTax: true, hasFlatTax: false, neighbors: [] },
  ID: { name: 'Idaho', slug: 'idaho', abbr: 'ID', hasIncomeTax: true, hasFlatTax: true, neighbors: ['MT', 'WY', 'UT', 'NV', 'OR', 'WA'] },
  IL: { name: 'Illinois', slug: 'illinois', abbr: 'IL', hasIncomeTax: true, hasFlatTax: true, neighbors: ['WI', 'IN', 'KY', 'MO', 'IA'] },
  IN: { name: 'Indiana', slug: 'indiana', abbr: 'IN', hasIncomeTax: true, hasFlatTax: true, neighbors: ['MI', 'OH', 'KY', 'IL'] },
  IA: { name: 'Iowa', slug: 'iowa', abbr: 'IA', hasIncomeTax: true, hasFlatTax: true, neighbors: ['MN', 'WI', 'IL', 'MO', 'NE', 'SD'] },
  KS: { name: 'Kansas', slug: 'kansas', abbr: 'KS', hasIncomeTax: true, hasFlatTax: false, neighbors: ['NE', 'MO', 'OK', 'CO'] },
  KY: { name: 'Kentucky', slug: 'kentucky', abbr: 'KY', hasIncomeTax: true, hasFlatTax: true, neighbors: ['OH', 'WV', 'VA', 'TN', 'IN', 'IL', 'MO'] },
  LA: { name: 'Louisiana', slug: 'louisiana', abbr: 'LA', hasIncomeTax: true, hasFlatTax: false, neighbors: ['AR', 'MS', 'TX'] },
  ME: { name: 'Maine', slug: 'maine', abbr: 'ME', hasIncomeTax: true, hasFlatTax: false, neighbors: ['NH'] },
  MD: { name: 'Maryland', slug: 'maryland', abbr: 'MD', hasIncomeTax: true, hasFlatTax: false, neighbors: ['PA', 'DE', 'WV', 'VA', 'DC'] },
  MA: { name: 'Massachusetts', slug: 'massachusetts', abbr: 'MA', hasIncomeTax: true, hasFlatTax: true, neighbors: ['NH', 'VT', 'NY', 'CT', 'RI'] },
  MI: { name: 'Michigan', slug: 'michigan', abbr: 'MI', hasIncomeTax: true, hasFlatTax: true, neighbors: ['OH', 'IN', 'WI'] },
  MN: { name: 'Minnesota', slug: 'minnesota', abbr: 'MN', hasIncomeTax: true, hasFlatTax: false, neighbors: ['WI', 'IA', 'SD', 'ND'] },
  MS: { name: 'Mississippi', slug: 'mississippi', abbr: 'MS', hasIncomeTax: true, hasFlatTax: true, neighbors: ['TN', 'AL', 'LA', 'AR'] },
  MO: { name: 'Missouri', slug: 'missouri', abbr: 'MO', hasIncomeTax: true, hasFlatTax: false, neighbors: ['IA', 'IL', 'KY', 'TN', 'AR', 'OK', 'KS', 'NE'] },
  MT: { name: 'Montana', slug: 'montana', abbr: 'MT', hasIncomeTax: true, hasFlatTax: false, neighbors: ['ND', 'SD', 'WY', 'ID'] },
  NE: { name: 'Nebraska', slug: 'nebraska', abbr: 'NE', hasIncomeTax: true, hasFlatTax: false, neighbors: ['SD', 'IA', 'MO', 'KS', 'CO', 'WY'] },
  NV: { name: 'Nevada', slug: 'nevada', abbr: 'NV', hasIncomeTax: false, hasFlatTax: false, neighbors: ['OR', 'ID', 'UT', 'AZ', 'CA'] },
  NH: { name: 'New Hampshire', slug: 'new-hampshire', abbr: 'NH', hasIncomeTax: false, hasFlatTax: false, neighbors: ['ME', 'VT', 'MA'] },
  NJ: { name: 'New Jersey', slug: 'new-jersey', abbr: 'NJ', hasIncomeTax: true, hasFlatTax: false, neighbors: ['NY', 'PA', 'DE'] },
  NM: { name: 'New Mexico', slug: 'new-mexico', abbr: 'NM', hasIncomeTax: true, hasFlatTax: false, neighbors: ['CO', 'OK', 'TX', 'AZ', 'UT'] },
  NY: { name: 'New York', slug: 'new-york', abbr: 'NY', hasIncomeTax: true, hasFlatTax: false, neighbors: ['VT', 'MA', 'CT', 'NJ', 'PA'] },
  NC: { name: 'North Carolina', slug: 'north-carolina', abbr: 'NC', hasIncomeTax: true, hasFlatTax: true, neighbors: ['VA', 'TN', 'GA', 'SC'] },
  ND: { name: 'North Dakota', slug: 'north-dakota', abbr: 'ND', hasIncomeTax: true, hasFlatTax: false, neighbors: ['MT', 'SD', 'MN'] },
  OH: { name: 'Ohio', slug: 'ohio', abbr: 'OH', hasIncomeTax: true, hasFlatTax: false, neighbors: ['MI', 'IN', 'KY', 'WV', 'PA'] },
  OK: { name: 'Oklahoma', slug: 'oklahoma', abbr: 'OK', hasIncomeTax: true, hasFlatTax: false, neighbors: ['KS', 'MO', 'AR', 'TX', 'NM', 'CO'] },
  OR: { name: 'Oregon', slug: 'oregon', abbr: 'OR', hasIncomeTax: true, hasFlatTax: false, neighbors: ['WA', 'ID', 'NV', 'CA'] },
  PA: { name: 'Pennsylvania', slug: 'pennsylvania', abbr: 'PA', hasIncomeTax: true, hasFlatTax: true, neighbors: ['NY', 'NJ', 'DE', 'MD', 'WV', 'OH'] },
  RI: { name: 'Rhode Island', slug: 'rhode-island', abbr: 'RI', hasIncomeTax: true, hasFlatTax: false, neighbors: ['MA', 'CT'] },
  SC: { name: 'South Carolina', slug: 'south-carolina', abbr: 'SC', hasIncomeTax: true, hasFlatTax: false, neighbors: ['NC', 'GA'] },
  SD: { name: 'South Dakota', slug: 'south-dakota', abbr: 'SD', hasIncomeTax: false, hasFlatTax: false, neighbors: ['ND', 'MN', 'IA', 'NE', 'WY', 'MT'] },
  TN: { name: 'Tennessee', slug: 'tennessee', abbr: 'TN', hasIncomeTax: false, hasFlatTax: false, neighbors: ['KY', 'VA', 'NC', 'GA', 'AL', 'MS', 'AR', 'MO'] },
  TX: { name: 'Texas', slug: 'texas', abbr: 'TX', hasIncomeTax: false, hasFlatTax: false, neighbors: ['NM', 'OK', 'AR', 'LA'] },
  UT: { name: 'Utah', slug: 'utah', abbr: 'UT', hasIncomeTax: true, hasFlatTax: true, neighbors: ['ID', 'WY', 'CO', 'NM', 'AZ', 'NV'] },
  VT: { name: 'Vermont', slug: 'vermont', abbr: 'VT', hasIncomeTax: true, hasFlatTax: false, neighbors: ['NY', 'NH', 'MA'] },
  VA: { name: 'Virginia', slug: 'virginia', abbr: 'VA', hasIncomeTax: true, hasFlatTax: false, neighbors: ['WV', 'KY', 'TN', 'NC', 'MD', 'DC'] },
  WA: { name: 'Washington', slug: 'washington', abbr: 'WA', hasIncomeTax: false, hasFlatTax: false, neighbors: ['OR', 'ID'] },
  WV: { name: 'West Virginia', slug: 'west-virginia', abbr: 'WV', hasIncomeTax: true, hasFlatTax: false, neighbors: ['OH', 'PA', 'MD', 'VA', 'KY'] },
  WI: { name: 'Wisconsin', slug: 'wisconsin', abbr: 'WI', hasIncomeTax: true, hasFlatTax: false, neighbors: ['MI', 'MN', 'IA', 'IL'] },
  WY: { name: 'Wyoming', slug: 'wyoming', abbr: 'WY', hasIncomeTax: false, hasFlatTax: false, neighbors: ['MT', 'SD', 'NE', 'CO', 'UT', 'ID'] },
};

/** Get all state entries as an array sorted by name */
export function getStatesArray(): (StateMeta & { code: string })[] {
  return Object.entries(STATES)
    .map(([code, meta]) => ({ code, ...meta }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Lookup state by slug */
export function getStateBySlug(slug: string): (StateMeta & { code: string }) | undefined {
  const entry = Object.entries(STATES).find(([, meta]) => meta.slug === slug);
  return entry ? { code: entry[0], ...entry[1] } : undefined;
}

/** Lookup state by abbreviation */
export function getStateByAbbr(abbr: string): StateMeta | undefined {
  return STATES[abbr.toUpperCase()];
}

/** All 51 slugs for dynamic route generation */
export function getAllStateSlugs(): string[] {
  return Object.values(STATES).map((s) => s.slug);
}

/** No income tax states */
export const NO_INCOME_TAX_STATES = ['AK', 'FL', 'NV', 'NH', 'SD', 'TN', 'TX', 'WA', 'WY'];

/** Top 10 states by population for programmatic SEO combo pages */
export const TOP_10_STATES = ['CA', 'TX', 'FL', 'NY', 'PA', 'IL', 'OH', 'GA', 'NC', 'MI'];

/** Salary amounts for programmatic pages */
export const SALARY_AMOUNTS = [30000, 40000, 50000, 60000, 65000, 70000, 75000, 80000, 90000, 100000, 120000, 150000, 200000, 250000, 500000];

/** Salary amounts for state combo pages (top 12) */
export const STATE_SALARY_AMOUNTS = [30000, 40000, 50000, 60000, 70000, 75000, 80000, 90000, 100000, 120000, 150000, 200000];

/** Hourly rates for programmatic pages */
export const HOURLY_RATES = [15, 17, 18, 20, 22, 25, 30, 35];
