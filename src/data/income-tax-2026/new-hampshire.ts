/**
 * New Hampshire Income Tax 2026
 *
 * New Hampshire has NO tax on earned/wage income.
 * The Interest & Dividends Tax (Hall Tax equivalent) was fully phased out.
 * For paycheck calculation purposes, this is treated as no income tax.
 *
 * Sources:
 * - New Hampshire Department of Revenue Administration
 */

import type { StateIncomeTaxConfig } from '../../lib/tax-engine';

const config: StateIncomeTaxConfig = {
  brackets: null,
};

export default config;
