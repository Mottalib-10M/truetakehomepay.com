/**
 * North Carolina Income Tax 2026
 *
 * North Carolina has a flat income tax rate of 4.5% (reduced from 4.75% in 2025).
 * Rate is scheduled to continue decreasing in future years per HB 334 (2021).
 *
 * Sources:
 * - North Carolina Department of Revenue
 * - N.C.G.S. § 105-153.7
 * - HB 334 (2021) — Tax rate reduction schedule
 */

import type { StateIncomeTaxConfig } from '../../lib/tax-engine';

const config: StateIncomeTaxConfig = {
  brackets: {
    single: [{ min: 0, max: Infinity, rate: 0.045 }],
    mfj: [{ min: 0, max: Infinity, rate: 0.045 }],
    mfs: [{ min: 0, max: Infinity, rate: 0.045 }],
    hoh: [{ min: 0, max: Infinity, rate: 0.045 }],
  },
  flatRate: 0.045,
  standardDeduction: {
    single: 12750,
    mfj: 25500,
    mfs: 12750,
    hoh: 19125,
  },
};

export default config;
