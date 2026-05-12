/**
 * Michigan Income Tax 2026
 *
 * Michigan has a flat income tax rate of 4.25%.
 * Michigan cities may impose additional local income taxes (handled in local-tax-2026.ts).
 *
 * Sources:
 * - Michigan Department of Treasury
 * - MCL 206.51
 */

import type { StateIncomeTaxConfig } from '../../lib/tax-engine';

const config: StateIncomeTaxConfig = {
  brackets: {
    single: [{ min: 0, max: Infinity, rate: 0.0425 }],
    mfj: [{ min: 0, max: Infinity, rate: 0.0425 }],
    mfs: [{ min: 0, max: Infinity, rate: 0.0425 }],
    hoh: [{ min: 0, max: Infinity, rate: 0.0425 }],
  },
  flatRate: 0.0425,
  personalExemption: {
    single: 5400,
    mfj: 10800,
    mfs: 5400,
    hoh: 5400,
  },
};

export default config;
