import { formatCurrency, formatPercent } from '../../lib/format-us';
import type { PaycheckResult } from '../../lib/tax-engine';

interface ResultPanelProps {
  result: PaycheckResult;
}

export default function ResultPanel({ result }: ResultPanelProps) {
  const {
    grossPerPeriod,
    federalTaxPerPeriod,
    stateTaxPerPeriod,
    localTaxPerPeriod,
    socialSecurityPerPeriod,
    medicarePerPeriod,
    additionalMedicarePerPeriod,
    stateDisabilityPerPeriod,
    statePFLPerPeriod,
    preTaxDeductionsPerPeriod,
    postTaxDeductionsPerPeriod,
    netPerPeriod,
    effectiveTotalRate,
    periods,
  } = result;

  const periodLabel =
    periods === 52 ? 'Weekly' :
    periods === 26 ? 'Bi-weekly' :
    periods === 24 ? 'Semi-monthly' :
    periods === 12 ? 'Monthly' : 'Annual';

  return (
    <div className="space-y-6">
      {/* Big take-home number */}
      <div className="rounded-2xl bg-gradient-to-br from-navy-800 to-navy-900 p-6 text-center text-white shadow-lg">
        <p className="text-sm font-medium text-navy-200">{periodLabel} Take-Home Pay</p>
        <p className="tabular-nums mt-1 text-4xl font-bold tracking-tight sm:text-5xl">
          {formatCurrency(netPerPeriod)}
        </p>
        <p className="tabular-nums mt-2 text-sm text-navy-300">
          {formatCurrency(result.netAnnual)} per year &middot; {formatPercent(effectiveTotalRate * 100, 1)} total tax rate
        </p>
      </div>

      {/* Breakdown bar */}
      <BreakdownBar result={result} />

      {/* Detailed breakdown table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
        <table className="tabular-nums w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
              <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-400">
                Deduction
              </th>
              <th className="px-4 py-3 text-right font-medium text-slate-600 dark:text-slate-400">
                {periodLabel}
              </th>
              <th className="hidden px-4 py-3 text-right font-medium text-slate-600 sm:table-cell dark:text-slate-400">
                Annual
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            <Row label="Gross Pay" perPeriod={grossPerPeriod} annual={result.grossAnnual} bold />
            <Row label="Federal Income Tax" perPeriod={-federalTaxPerPeriod} annual={-result.federalTax} color="red" />
            <Row label="State Income Tax" perPeriod={-stateTaxPerPeriod} annual={-result.stateTax} color="red" show={result.stateTax > 0} />
            <Row label="Local Income Tax" perPeriod={-localTaxPerPeriod} annual={-result.localTax} color="red" show={result.localTax > 0} />
            <Row label="Social Security" perPeriod={-socialSecurityPerPeriod} annual={-result.socialSecurity} color="red" />
            <Row label="Medicare" perPeriod={-medicarePerPeriod} annual={-result.medicare} color="red" />
            <Row label="Additional Medicare" perPeriod={-additionalMedicarePerPeriod} annual={-result.additionalMedicare} color="red" show={result.additionalMedicare > 0} />
            <Row label="State Disability (SDI)" perPeriod={-stateDisabilityPerPeriod} annual={-result.stateDisability} color="red" show={result.stateDisability > 0} />
            <Row label="Paid Family Leave" perPeriod={-statePFLPerPeriod} annual={-result.statePFL} color="red" show={result.statePFL > 0} />
            <Row label="Pre-Tax Deductions" perPeriod={-preTaxDeductionsPerPeriod} annual={-result.preTaxDeductions} color="blue" show={result.preTaxDeductions > 0} />
            <Row label="Post-Tax Deductions" perPeriod={-postTaxDeductionsPerPeriod} annual={-result.postTaxDeductions} color="blue" show={result.postTaxDeductions > 0} />
            <Row label="Take-Home Pay" perPeriod={netPerPeriod} annual={result.netAnnual} bold highlight />
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Breakdown Bar ─────────────────────────────────────────────────────

function BreakdownBar({ result }: { result: PaycheckResult }) {
  const { grossAnnual, federalTax, stateTax, localTax, socialSecurity, medicare, additionalMedicare, stateDisability, statePFL, preTaxDeductions, postTaxDeductions, netAnnual } = result;

  if (grossAnnual <= 0) return null;

  const segments = [
    { label: 'Federal', value: federalTax, color: 'bg-patriot-500' },
    { label: 'State', value: stateTax + localTax, color: 'bg-amber-500' },
    { label: 'FICA', value: socialSecurity + medicare + additionalMedicare, color: 'bg-orange-400' },
    { label: 'SDI/PFL', value: stateDisability + statePFL, color: 'bg-purple-400' },
    { label: 'Deductions', value: preTaxDeductions + postTaxDeductions, color: 'bg-sky-400' },
    { label: 'Take-Home', value: netAnnual, color: 'bg-success-500' },
  ].filter((s) => s.value > 0);

  return (
    <div className="space-y-2">
      <div className="flex h-6 overflow-hidden rounded-full">
        {segments.map((seg) => (
          <div
            key={seg.label}
            className={`${seg.color} transition-all duration-300`}
            style={{ width: `${(seg.value / grossAnnual) * 100}%` }}
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

// ─── Table Row ─────────────────────────────────────────────────────────

function Row({
  label,
  perPeriod,
  annual,
  bold = false,
  highlight = false,
  color,
  show = true,
}: {
  label: string;
  perPeriod: number;
  annual: number;
  bold?: boolean;
  highlight?: boolean;
  color?: 'red' | 'blue';
  show?: boolean;
}) {
  if (!show) return null;

  const textColor =
    highlight ? 'text-success-600 dark:text-success-500' :
    color === 'red' ? 'text-patriot-600 dark:text-patriot-400' :
    color === 'blue' ? 'text-navy-600 dark:text-navy-400' :
    'text-slate-900 dark:text-slate-100';

  return (
    <tr className={highlight ? 'bg-success-50/50 dark:bg-success-900/10' : ''}>
      <td className={`px-4 py-2.5 ${bold ? 'font-semibold' : ''} text-slate-700 dark:text-slate-300`}>
        {label}
      </td>
      <td className={`px-4 py-2.5 text-right ${bold ? 'font-semibold' : 'font-medium'} ${textColor}`}>
        {formatCurrency(perPeriod)}
      </td>
      <td className={`hidden px-4 py-2.5 text-right sm:table-cell ${bold ? 'font-semibold' : 'font-medium'} ${textColor}`}>
        {formatCurrency(annual)}
      </td>
    </tr>
  );
}
