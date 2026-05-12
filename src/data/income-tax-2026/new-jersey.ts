/**
 * New Jersey Income Tax 2026
 *
 * New Jersey has 7 progressive brackets (1.4% to 10.75%).
 * New Jersey does NOT have a standard deduction but allows personal exemptions.
 * NJ has SDI, FLI, SUI (employee portion), and WFD payroll taxes.
 *
 * Sources:
 * - New Jersey Division of Taxation
 * - N.J.S.A. 54A:2-1
 * - NJ Department of Labor and Workforce Development (SDI/FLI rates)
 */

import type { StateIncomeTaxConfig } from '../../lib/tax-engine';

const config: StateIncomeTaxConfig = {
  brackets: {
    single: [
      { min: 0, max: 20000, rate: 0.014 },
      { min: 20000, max: 35000, rate: 0.0175 },
      { min: 35000, max: 40000, rate: 0.035 },
      { min: 40000, max: 75000, rate: 0.05525 },
      { min: 75000, max: 500000, rate: 0.0637 },
      { min: 500000, max: 1000000, rate: 0.0897 },
      { min: 1000000, max: Infinity, rate: 0.1075 },
    ],
    mfj: [
      { min: 0, max: 20000, rate: 0.014 },
      { min: 20000, max: 50000, rate: 0.0175 },
      { min: 50000, max: 70000, rate: 0.035 },
      { min: 70000, max: 80000, rate: 0.05525 },
      { min: 80000, max: 150000, rate: 0.0637 },
      { min: 150000, max: 500000, rate: 0.0637 },
      { min: 500000, max: 1000000, rate: 0.0897 },
      { min: 1000000, max: Infinity, rate: 0.1075 },
    ],
    mfs: [
      { min: 0, max: 20000, rate: 0.014 },
      { min: 20000, max: 35000, rate: 0.0175 },
      { min: 35000, max: 40000, rate: 0.035 },
      { min: 40000, max: 75000, rate: 0.05525 },
      { min: 75000, max: 500000, rate: 0.0637 },
      { min: 500000, max: 1000000, rate: 0.0897 },
      { min: 1000000, max: Infinity, rate: 0.1075 },
    ],
    hoh: [
      { min: 0, max: 20000, rate: 0.014 },
      { min: 20000, max: 50000, rate: 0.0175 },
      { min: 50000, max: 70000, rate: 0.035 },
      { min: 70000, max: 80000, rate: 0.05525 },
      { min: 80000, max: 150000, rate: 0.0637 },
      { min: 150000, max: 500000, rate: 0.0637 },
      { min: 500000, max: 1000000, rate: 0.0897 },
      { min: 1000000, max: Infinity, rate: 0.1075 },
    ],
  },
  personalExemption: {
    single: 1000,
    mfj: 2000,
    mfs: 1000,
    hoh: 1000,
  },
  specialRules: {
    sdi: { rate: 0.06, wageBase: 43300 },
    sui: { rate: 0.003825, wageBase: 43300 },
    fli: { rate: 0.006, wageBase: 43300 },
    wfd: { rate: 0.001175, wageBase: 43300 },
  },
};

export default config;
