/**
 * Indiana Income Tax 2026
 *
 * Indiana has a flat income tax rate of 3.05% (reduced from 3.15% in 2025).
 * Indiana counties also levy their own income taxes (handled in local-tax-2026.ts).
 *
 * Sources:
 * - Indiana Department of Revenue
 * - IC 6-3-2-1
 */

import type { StateIncomeTaxConfig } from '../../lib/tax-engine';

const config: StateIncomeTaxConfig = {
  brackets: {
    single: [{ min: 0, max: Infinity, rate: 0.0305 }],
    mfj: [{ min: 0, max: Infinity, rate: 0.0305 }],
    mfs: [{ min: 0, max: Infinity, rate: 0.0305 }],
    hoh: [{ min: 0, max: Infinity, rate: 0.0305 }],
  },
  flatRate: 0.0305,
  personalExemption: {
    single: 1000,
    mfj: 2000,
    mfs: 1000,
    hoh: 1000,
  },
};

export default config;
