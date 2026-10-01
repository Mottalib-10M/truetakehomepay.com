/**
 * Connecticut income tax, tax year 2026
 *
 * Source: Tax Foundation, State Individual Income Tax Rates and Brackets, 2026
 * (rates, brackets, standard deduction and personal exemption as of 1 January 2026).
 * Personal exemption phases out dollar for dollar above $30,000 (single) or $48,000 (joint) of AGI. Tax benefit recapture and personal credits are not modelled.
 * Head of household and married filing separately follow the single schedule
 * unless the state publishes its own; local income taxes are handled separately.
 */

import type { StateIncomeTaxConfig } from '../../lib/tax-engine';

const config: StateIncomeTaxConfig = {
  brackets: {
    single: [
      { min: 0, max: 10000, rate: 0.02 },
      { min: 10000, max: 50000, rate: 0.045 },
      { min: 50000, max: 100000, rate: 0.055 },
      { min: 100000, max: 200000, rate: 0.06 },
      { min: 200000, max: 250000, rate: 0.065 },
      { min: 250000, max: 500000, rate: 0.069 },
      { min: 500000, max: Infinity, rate: 0.0699 },
    ],
    mfj: [
      { min: 0, max: 20000, rate: 0.02 },
      { min: 20000, max: 100000, rate: 0.045 },
      { min: 100000, max: 200000, rate: 0.055 },
      { min: 200000, max: 400000, rate: 0.06 },
      { min: 400000, max: 500000, rate: 0.065 },
      { min: 500000, max: 1000000, rate: 0.069 },
      { min: 1000000, max: Infinity, rate: 0.0699 },
    ],
    mfs: [
      { min: 0, max: 10000, rate: 0.02 },
      { min: 10000, max: 50000, rate: 0.045 },
      { min: 50000, max: 100000, rate: 0.055 },
      { min: 100000, max: 200000, rate: 0.06 },
      { min: 200000, max: 250000, rate: 0.065 },
      { min: 250000, max: 500000, rate: 0.069 },
      { min: 500000, max: Infinity, rate: 0.0699 },
    ],
    hoh: [
      { min: 0, max: 16000, rate: 0.02 },
      { min: 16000, max: 80000, rate: 0.045 },
      { min: 80000, max: 160000, rate: 0.055 },
      { min: 160000, max: 320000, rate: 0.06 },
      { min: 320000, max: 400000, rate: 0.065 },
      { min: 400000, max: 800000, rate: 0.069 },
      { min: 800000, max: Infinity, rate: 0.0699 },
    ],
  },
  personalExemption: { single: 15000, mfj: 24000, mfs: 15000, hoh: 15000 },
  exemptionPhaseOut: {
    single: { start: 30000, range: 15000 },
    mfj: { start: 48000, range: 24000 },
    mfs: { start: 30000, range: 15000 },
    hoh: { start: 30000, range: 15000 },
  },
  specialRules: {
    pfl: { rate: 0.005, wageBase: 184500 },
  },
};

export default config;
