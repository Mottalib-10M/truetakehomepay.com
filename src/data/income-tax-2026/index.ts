/**
 * State income‑tax config loader – 2026 tax year.
 *
 * Every state (plus DC) is statically imported so that the module works with
 * static‑site generation (no dynamic imports required).  Use `getStateTaxConfig`
 * to retrieve a config by two‑letter state abbreviation, or access the full
 * `STATE_TAX_CONFIGS` map directly.
 */

import type { StateIncomeTaxConfig } from '../../lib/tax-engine';

// ---------------------------------------------------------------------------
// Static imports – one per state / territory (alphabetical by slug)
// ---------------------------------------------------------------------------

import alabama from './alabama';
import alaska from './alaska';
import arizona from './arizona';
import arkansas from './arkansas';
import california from './california';
import colorado from './colorado';
import connecticut from './connecticut';
import delaware from './delaware';
import districtOfColumbia from './district-of-columbia';
import florida from './florida';
import georgia from './georgia';
import hawaii from './hawaii';
import idaho from './idaho';
import illinois from './illinois';
import indiana from './indiana';
import iowa from './iowa';
import kansas from './kansas';
import kentucky from './kentucky';
import louisiana from './louisiana';
import maine from './maine';
import maryland from './maryland';
import massachusetts from './massachusetts';
import michigan from './michigan';
import minnesota from './minnesota';
import mississippi from './mississippi';
import missouri from './missouri';
import montana from './montana';
import nebraska from './nebraska';
import nevada from './nevada';
import newHampshire from './new-hampshire';
import newJersey from './new-jersey';
import newMexico from './new-mexico';
import newYork from './new-york';
import northCarolina from './north-carolina';
import northDakota from './north-dakota';
import ohio from './ohio';
import oklahoma from './oklahoma';
import oregon from './oregon';
import pennsylvania from './pennsylvania';
import rhodeIsland from './rhode-island';
import southCarolina from './south-carolina';
import southDakota from './south-dakota';
import tennessee from './tennessee';
import texas from './texas';
import utah from './utah';
import vermont from './vermont';
import virginia from './virginia';
import washington from './washington';
import westVirginia from './west-virginia';
import wisconsin from './wisconsin';
import wyoming from './wyoming';

// ---------------------------------------------------------------------------
// Lookup map – keyed by two‑letter USPS state code
// ---------------------------------------------------------------------------

export const STATE_TAX_CONFIGS: Record<string, StateIncomeTaxConfig> = {
  AL: alabama,
  AK: alaska,
  AZ: arizona,
  AR: arkansas,
  CA: california,
  CO: colorado,
  CT: connecticut,
  DE: delaware,
  DC: districtOfColumbia,
  FL: florida,
  GA: georgia,
  HI: hawaii,
  ID: idaho,
  IL: illinois,
  IN: indiana,
  IA: iowa,
  KS: kansas,
  KY: kentucky,
  LA: louisiana,
  ME: maine,
  MD: maryland,
  MA: massachusetts,
  MI: michigan,
  MN: minnesota,
  MS: mississippi,
  MO: missouri,
  MT: montana,
  NE: nebraska,
  NV: nevada,
  NH: newHampshire,
  NJ: newJersey,
  NM: newMexico,
  NY: newYork,
  NC: northCarolina,
  ND: northDakota,
  OH: ohio,
  OK: oklahoma,
  OR: oregon,
  PA: pennsylvania,
  RI: rhodeIsland,
  SC: southCarolina,
  SD: southDakota,
  TN: tennessee,
  TX: texas,
  UT: utah,
  VT: vermont,
  VA: virginia,
  WA: washington,
  WV: westVirginia,
  WI: wisconsin,
  WY: wyoming,
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Retrieve the income‑tax configuration for a given US state.
 *
 * @param stateCode – Two‑letter USPS abbreviation (case‑insensitive).
 * @returns The matching `StateIncomeTaxConfig`, or `null` if not found.
 */
export function getStateTaxConfig(
  stateCode: string,
): StateIncomeTaxConfig | null {
  return STATE_TAX_CONFIGS[stateCode.toUpperCase()] ?? null;
}
