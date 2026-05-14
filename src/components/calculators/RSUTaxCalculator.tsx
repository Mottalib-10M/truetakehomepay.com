import { useState, useMemo, useCallback, useEffect } from 'react';
import { formatCurrency, formatCurrencyRound, formatPercent } from '../../lib/format-us';
import InputField from '../ui/InputField';
import SelectField from '../ui/SelectField';

// ─── Constants ──────────────────────────────────────────────────────────
const FEDERAL_SUPPLEMENTAL_RATE = 0.22; // 22% for amounts <= $1M
const FEDERAL_SUPPLEMENTAL_RATE_HIGH = 0.37; // 37% for amounts > $1M
const SUPPLEMENTAL_THRESHOLD = 1_000_000;
const SS_RATE = 0.062;
const SS_WAGE_BASE = 176_100;
const MEDICARE_RATE = 0.0145;
const LONG_TERM_CG_RATE = 0.15; // Simplified 15% federal long-term CG rate
const SHORT_TERM_CG_RATE = 0.24; // ~24% for a ~$150k earner (simplified)

// ─── Types ──────────────────────────────────────────────────────────────
interface RSUResult {
  // At vesting
  vestValue: number;
  federalWithholding: number;
  socialSecurity: number;
  medicare: number;
  totalVestingTax: number;
  sharesWithheld: number;
  netShares: number;
  // If sold
  saleProceeds: number;
  capitalGain: number;
  capitalGainsTax: number;
  totalAllTax: number;
  netCashAfterAll: number;
}

const holdOptions = [
  { value: 'short', label: 'Less than 1 year' },
  { value: 'long', label: 'More than 1 year' },
];

export default function RSUTaxCalculator() {
  // ─── State ─────────────────────────────────────────────────────────
  const [sharesInput, setSharesInput] = useState('500');
  const [vestPriceInput, setVestPriceInput] = useState('150');
  const [salePriceInput, setSalePriceInput] = useState('180');
  const [incomeInput, setIncomeInput] = useState('150000');
  const [holdPeriod, setHoldPeriod] = useState('long');

  // ─── URL State Sync ────────────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('shares')) setSharesInput(params.get('shares')!);
    if (params.get('vestprice')) setVestPriceInput(params.get('vestprice')!);
    if (params.get('saleprice')) setSalePriceInput(params.get('saleprice')!);
    if (params.get('income')) setIncomeInput(params.get('income')!);
    if (params.get('hold')) setHoldPeriod(params.get('hold')!);
  }, []);

  const updateUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (sharesInput && sharesInput !== '500') params.set('shares', sharesInput);
    if (vestPriceInput && vestPriceInput !== '150') params.set('vestprice', vestPriceInput);
    if (salePriceInput && salePriceInput !== '180') params.set('saleprice', salePriceInput);
    if (incomeInput && incomeInput !== '150000') params.set('income', incomeInput);
    if (holdPeriod !== 'long') params.set('hold', holdPeriod);

    const newUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;

    window.history.replaceState({}, '', newUrl);
  }, [sharesInput, vestPriceInput, salePriceInput, incomeInput, holdPeriod]);

  useEffect(() => {
    updateUrl();
  }, [updateUrl]);

  // ─── Calculation ───────────────────────────────────────────────────
  const result = useMemo<RSUResult | null>(() => {
    const shares = Number(sharesInput.replace(/[^0-9.]/g, ''));
    const vestPrice = Number(vestPriceInput.replace(/[^0-9.]/g, ''));
    const salePrice = Number(salePriceInput.replace(/[^0-9.]/g, ''));
    const otherIncome = Number(incomeInput.replace(/[^0-9.]/g, '')) || 0;

    if (isNaN(shares) || shares <= 0 || isNaN(vestPrice) || vestPrice <= 0) return null;

    // ── At Vesting (Ordinary Income) ──
    const vestValue = shares * vestPrice;

    // Federal supplemental withholding: 22% up to $1M, 37% above $1M
    let federalWithholding: number;
    if (vestValue <= SUPPLEMENTAL_THRESHOLD) {
      federalWithholding = vestValue * FEDERAL_SUPPLEMENTAL_RATE;
    } else {
      federalWithholding =
        SUPPLEMENTAL_THRESHOLD * FEDERAL_SUPPLEMENTAL_RATE +
        (vestValue - SUPPLEMENTAL_THRESHOLD) * FEDERAL_SUPPLEMENTAL_RATE_HIGH;
    }

    // Social Security: applies only up to wage base minus other income already earned
    const ssableIncome = Math.min(vestValue, Math.max(0, SS_WAGE_BASE - otherIncome));
    const socialSecurity = ssableIncome * SS_RATE;

    // Medicare: 1.45% on all RSU income (no cap)
    const medicare = vestValue * MEDICARE_RATE;

    const totalVestingTax = federalWithholding + socialSecurity + medicare;
    const sharesWithheld = vestPrice > 0 ? totalVestingTax / vestPrice : 0;
    const netShares = shares - sharesWithheld;

    // ── If Sold (Capital Gains on Appreciation) ──
    const effectiveSalePrice = isNaN(salePrice) || salePrice <= 0 ? vestPrice : salePrice;
    const saleProceeds = shares * effectiveSalePrice;
    const capitalGain = shares * (effectiveSalePrice - vestPrice);

    let capitalGainsTax = 0;
    if (capitalGain > 0) {
      if (holdPeriod === 'long') {
        capitalGainsTax = capitalGain * LONG_TERM_CG_RATE;
      } else {
        capitalGainsTax = capitalGain * SHORT_TERM_CG_RATE;
      }
    }

    const totalAllTax = totalVestingTax + capitalGainsTax;
    const netCashAfterAll = saleProceeds - totalAllTax;

    return {
      vestValue,
      federalWithholding,
      socialSecurity,
      medicare,
      totalVestingTax,
      sharesWithheld,
      netShares,
      saleProceeds,
      capitalGain,
      capitalGainsTax,
      totalAllTax,
      netCashAfterAll,
    };
  }, [sharesInput, vestPriceInput, salePriceInput, incomeInput, holdPeriod]);

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      {/* Input panel */}
      <div className="space-y-6 lg:col-span-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            RSU Details
          </h2>

          <div className="space-y-4">
            <InputField
              id="rsu-shares"
              label="Number of RSU Shares Vesting"
              value={sharesInput}
              onChange={setSharesInput}
              placeholder="500"
              helpText="Total shares in this vesting event"
            />

            <InputField
              id="vest-price"
              label="Stock Price at Vest"
              value={vestPriceInput}
              onChange={setVestPriceInput}
              prefix="$"
              placeholder="150"
              helpText="Fair market value on the vesting date"
            />

            <InputField
              id="sale-price"
              label="Current / Sale Price"
              value={salePriceInput}
              onChange={setSalePriceInput}
              prefix="$"
              placeholder="180"
              helpText="Price if you sell (or current price to estimate)"
            />

            <InputField
              id="other-income"
              label="Other Annual Income"
              value={incomeInput}
              onChange={setIncomeInput}
              prefix="$"
              placeholder="150,000"
              helpText="Your W-2 wages (excluding RSU) for tax bracket context"
            />

            <SelectField
              id="hold-period"
              label="Hold Period After Vesting"
              value={holdPeriod}
              onChange={setHoldPeriod}
              options={holdOptions}
              helpText="Determines short-term vs long-term capital gains rate"
            />
          </div>
        </div>
      </div>

      {/* Results panel */}
      <div className="lg:col-span-3">
        {result ? (
          <RSUResultPanel result={result} holdPeriod={holdPeriod} />
        ) : (
          <div className="flex h-64 items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
            <p className="text-slate-500 dark:text-slate-400">
              Enter your RSU details to see the tax breakdown
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Result Panel ───────────────────────────────────────────────────────

function RSUResultPanel({
  result,
  holdPeriod,
}: {
  result: RSUResult;
  holdPeriod: string;
}) {
  const effectiveRate = result.vestValue > 0
    ? (result.totalAllTax / result.vestValue) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Hero card */}
      <div className="rounded-2xl bg-gradient-to-br from-navy-800 to-navy-900 p-6 text-center text-white shadow-lg">
        <p className="text-sm font-medium text-navy-200">Total RSU Value at Vesting</p>
        <p className="tabular-nums mt-1 text-4xl font-bold tracking-tight sm:text-5xl">
          {formatCurrency(result.vestValue)}
        </p>
        <p className="tabular-nums mt-2 text-sm text-navy-300">
          Net after all taxes: {formatCurrency(result.netCashAfterAll)} &middot; {formatPercent(effectiveRate, 1)} total effective rate
        </p>
      </div>

      {/* Breakdown bar */}
      <RSUBreakdownBar result={result} />

      {/* At Vesting table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/50">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            At Vesting (Ordinary Income)
          </h3>
        </div>
        <table className="tabular-nums w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
              <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-400">
                Item
              </th>
              <th className="px-4 py-3 text-right font-medium text-slate-600 dark:text-slate-400">
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            <Row label="RSU Value (Gross)" value={result.vestValue} bold />
            <Row label="Federal Withholding (22%)" value={-result.federalWithholding} color="red" />
            <Row label="Social Security (6.2%)" value={-result.socialSecurity} color="red" />
            <Row label="Medicare (1.45%)" value={-result.medicare} color="red" />
            <Row label="Total Tax at Vesting" value={-result.totalVestingTax} color="red" bold />
            <Row
              label="Shares Withheld (approx.)"
              value={result.sharesWithheld}
              isShares
            />
            <Row
              label="Net Shares Received"
              value={result.netShares}
              bold
              highlight
              isShares
            />
          </tbody>
        </table>
      </div>

      {/* If Sold table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/50">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            If Sold ({holdPeriod === 'long' ? 'Long-Term' : 'Short-Term'} Capital Gains)
          </h3>
        </div>
        <table className="tabular-nums w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
              <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-400">
                Item
              </th>
              <th className="px-4 py-3 text-right font-medium text-slate-600 dark:text-slate-400">
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            <Row label="Sale Proceeds" value={result.saleProceeds} bold />
            <Row
              label="Capital Gain / Loss"
              value={result.capitalGain}
              color={result.capitalGain < 0 ? 'red' : undefined}
            />
            <Row
              label={`Capital Gains Tax (${holdPeriod === 'long' ? '15% LTCG' : '24% STCG'})`}
              value={-result.capitalGainsTax}
              color="red"
              show={result.capitalGainsTax > 0}
            />
            <Row
              label="Total Tax (Vesting + Sale)"
              value={-result.totalAllTax}
              color="red"
              bold
            />
            <Row
              label="Net Cash After All Taxes"
              value={result.netCashAfterAll}
              bold
              highlight
            />
          </tbody>
        </table>
      </div>

      {/* Informational note */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
        <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
          <span className="font-semibold text-slate-700 dark:text-slate-300">How RSU taxes work: </span>
          RSUs are taxed as ordinary income at vesting. Your employer withholds federal tax at the
          22% supplemental rate (37% on amounts over $1 million), plus Social Security (6.2% up to
          the ${formatCurrencyRound(SS_WAGE_BASE)} wage base) and Medicare (1.45%). You may owe
          additional tax at filing if the 22% flat withholding rate was less than your actual marginal
          rate. If you hold shares after vesting and sell later, any appreciation above the vest-date
          price is taxed as capital gains &mdash; long-term (15%) if held over 1 year, or at ordinary
          rates if held 1 year or less.
        </p>
      </div>
    </div>
  );
}

// ─── Breakdown Bar ────────────────────────────────────────────────────────

function RSUBreakdownBar({ result }: { result: RSUResult }) {
  const total = result.vestValue + Math.max(0, result.capitalGain);
  if (total <= 0) return null;

  const segments = [
    { label: 'Federal', value: result.federalWithholding, color: 'bg-patriot-500' },
    { label: 'Social Security', value: result.socialSecurity, color: 'bg-orange-400' },
    { label: 'Medicare', value: result.medicare, color: 'bg-purple-400' },
    { label: 'Capital Gains Tax', value: result.capitalGainsTax, color: 'bg-amber-500' },
    { label: 'Net Cash', value: result.netCashAfterAll, color: 'bg-success-500' },
  ].filter((s) => s.value > 0);

  const barTotal = segments.reduce((sum, s) => sum + s.value, 0);

  return (
    <div className="space-y-2">
      <div className="flex h-6 overflow-hidden rounded-full">
        {segments.map((seg) => (
          <div
            key={seg.label}
            className={`${seg.color} transition-all duration-300`}
            style={{ width: `${(seg.value / barTotal) * 100}%` }}
            title={`${seg.label}: ${formatCurrency(seg.value)}`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-1.5">
            <div className={`h-2.5 w-2.5 rounded-full ${seg.color}`} />
            <span className="text-xs text-slate-600 dark:text-slate-400">
              {seg.label}: {formatCurrency(seg.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Table Row ────────────────────────────────────────────────────────────

function Row({
  label,
  value,
  bold = false,
  highlight = false,
  color,
  show = true,
  isShares = false,
}: {
  label: string;
  value: number;
  bold?: boolean;
  highlight?: boolean;
  color?: 'red';
  show?: boolean;
  isShares?: boolean;
}) {
  if (!show) return null;

  const textColor =
    highlight ? 'text-success-600 dark:text-success-500' :
    color === 'red' ? 'text-patriot-600 dark:text-patriot-400' :
    'text-slate-900 dark:text-slate-100';

  const formatted = isShares
    ? value.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
    : formatCurrency(value);

  return (
    <tr className={highlight ? 'bg-success-50/50 dark:bg-success-900/10' : ''}>
      <td className={`px-4 py-2.5 ${bold ? 'font-semibold' : ''} text-slate-700 dark:text-slate-300`}>
        {label}
      </td>
      <td className={`px-4 py-2.5 text-right ${bold ? 'font-semibold' : 'font-medium'} ${textColor}`}>
        {formatted}
      </td>
    </tr>
  );
}
