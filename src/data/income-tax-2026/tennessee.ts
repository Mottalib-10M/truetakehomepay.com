/**
 * Tennessee Income Tax 2026
 *
 * Tennessee has NO state income tax on earned income.
 * The Hall Tax on interest and dividends was fully eliminated in 2021.
 *
 * Sources:
 * - Tennessee Department of Revenue
 */

import type { StateIncomeTaxConfig } from '../../lib/tax-engine';

const config: StateIncomeTaxConfig = {
  brackets: null,
};

export default config;
