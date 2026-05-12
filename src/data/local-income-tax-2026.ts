/**
 * Local (city / county) income‑tax overlays for US jurisdictions – 2026 tax year.
 *
 * Two overlay types are supported:
 *   • 'flat'             – a flat percentage applied directly to taxable income.
 *   • 'percent-of-state' – a surcharge expressed as a percentage of the
 *                          taxpayer's computed state income‑tax liability.
 *
 * For jurisdictions with their own progressive brackets (e.g. NYC) we store the
 * top marginal rate as a flat approximation for now.  Bracket‑level precision
 * can be added later by extending LocalTaxConfig with an optional `brackets`
 * field.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LocalTaxConfig {
  /** Human‑readable jurisdiction name. */
  name: string;
  /**
   * Tax rate expressed as a decimal.
   *   • For 'flat' types this is applied to taxable income (e.g. 0.0375 = 3.75 %).
   *   • For 'percent-of-state' types this is the multiplier applied to the
   *     state tax liability (e.g. 0.1675 = 16.75 % of state tax).
   */
  rate: number;
  /** How the rate is applied. */
  type: 'flat' | 'percent-of-state';
}

// ---------------------------------------------------------------------------
// Local tax configs
// ---------------------------------------------------------------------------

export const LOCAL_TAXES: Record<string, LocalTaxConfig> = {
  // ── New York ──────────────────────────────────────────────────────────
  // NYC has its own progressive brackets; we use the top marginal rate
  // (3.876 %) as a flat approximation for now.
  //   Single:  3.078 % → $12 000 | 3.762 % → $25 000 | 3.819 % → $50 000 | 3.876 % above
  //   MFJ:     3.078 % → $21 600 | 3.762 % → $45 000 | 3.819 % → $90 000 | 3.876 % above
  'nyc-resident': {
    name: 'New York City (resident)',
    rate: 0.03876,
    type: 'flat',
  },

  // Yonkers residents pay 16.75 % of their NY State income‑tax liability.
  'yonkers-resident': {
    name: 'Yonkers (resident)',
    rate: 0.1675,
    type: 'percent-of-state',
  },

  // ── Pennsylvania ──────────────────────────────────────────────────────
  'philadelphia-resident': {
    name: 'Philadelphia (resident)',
    rate: 0.0375,
    type: 'flat',
  },
  'philadelphia-nonresident': {
    name: 'Philadelphia (non‑resident)',
    rate: 0.0344,
    type: 'flat',
  },

  // ── Michigan ──────────────────────────────────────────────────────────
  'detroit-resident': {
    name: 'Detroit (resident)',
    rate: 0.024,
    type: 'flat',
  },
  'detroit-nonresident': {
    name: 'Detroit (non‑resident)',
    rate: 0.012,
    type: 'flat',
  },

  // ── Maryland counties ─────────────────────────────────────────────────
  'md-anne-arundel': {
    name: 'Anne Arundel County, MD',
    rate: 0.0281,
    type: 'flat',
  },
  'md-baltimore-county': {
    name: 'Baltimore County, MD',
    rate: 0.032,
    type: 'flat',
  },
  'md-baltimore-city': {
    name: 'Baltimore City, MD',
    rate: 0.032,
    type: 'flat',
  },
  'md-howard': {
    name: 'Howard County, MD',
    rate: 0.032,
    type: 'flat',
  },
  'md-montgomery': {
    name: 'Montgomery County, MD',
    rate: 0.032,
    type: 'flat',
  },
  'md-prince-georges': {
    name: "Prince George's County, MD",
    rate: 0.032,
    type: 'flat',
  },
};
