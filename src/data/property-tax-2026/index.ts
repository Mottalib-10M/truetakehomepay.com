/**
 * Property Tax Configuration Loader – 2026 Tax Year
 *
 * All 50 states plus the District of Columbia are statically imported
 * so the module works with static-site generation. Use `getPropertyTaxConfig`
 * to retrieve a config by two-letter state abbreviation, or access the full
 * `PROPERTY_TAX_CONFIGS` map directly.
 */

export type { PropertyTaxConfig } from './types';
import type { PropertyTaxConfig } from './types';

// ---------------------------------------------------------------------------
// Static imports – one per state / territory (alphabetical by abbreviation)
// ---------------------------------------------------------------------------

import al from './al';
import ak from './ak';
import az from './az';
import ar from './ar';
import ca from './ca';
import co from './co';
import ct from './ct';
import de from './de';
import dc from './dc';
import fl from './fl';
import ga from './ga';
import hi from './hi';
import id from './id';
import il from './il';
import inConfig from './in';
import ia from './ia';
import ks from './ks';
import ky from './ky';
import la from './la';
import me from './me';
import md from './md';
import ma from './ma';
import mi from './mi';
import mn from './mn';
import ms from './ms';
import mo from './mo';
import mt from './mt';
import ne from './ne';
import nv from './nv';
import nh from './nh';
import nj from './nj';
import nm from './nm';
import ny from './ny';
import nc from './nc';
import nd from './nd';
import oh from './oh';
import ok from './ok';
import or_ from './or';
import pa from './pa';
import ri from './ri';
import sc from './sc';
import sd from './sd';
import tn from './tn';
import tx from './tx';
import ut from './ut';
import vt from './vt';
import va from './va';
import wa from './wa';
import wv from './wv';
import wi from './wi';
import wy from './wy';

// ---------------------------------------------------------------------------
// Lookup map – keyed by two-letter USPS state code
// ---------------------------------------------------------------------------

export const PROPERTY_TAX_CONFIGS: Record<string, PropertyTaxConfig> = {
  AL: al,
  AK: ak,
  AZ: az,
  AR: ar,
  CA: ca,
  CO: co,
  CT: ct,
  DE: de,
  DC: dc,
  FL: fl,
  GA: ga,
  HI: hi,
  ID: id,
  IL: il,
  IN: inConfig,
  IA: ia,
  KS: ks,
  KY: ky,
  LA: la,
  ME: me,
  MD: md,
  MA: ma,
  MI: mi,
  MN: mn,
  MS: ms,
  MO: mo,
  MT: mt,
  NE: ne,
  NV: nv,
  NH: nh,
  NJ: nj,
  NM: nm,
  NY: ny,
  NC: nc,
  ND: nd,
  OH: oh,
  OK: ok,
  OR: or_,
  PA: pa,
  RI: ri,
  SC: sc,
  SD: sd,
  TN: tn,
  TX: tx,
  UT: ut,
  VT: vt,
  VA: va,
  WA: wa,
  WV: wv,
  WI: wi,
  WY: wy,
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Retrieve the property tax configuration for a given US state.
 *
 * @param stateCode – Two-letter USPS abbreviation (case-insensitive).
 * @returns The matching `PropertyTaxConfig`, or `null` if not found.
 */
export function getPropertyTaxConfig(
  stateCode: string,
): PropertyTaxConfig | null {
  return PROPERTY_TAX_CONFIGS[stateCode.toUpperCase()] ?? null;
}
