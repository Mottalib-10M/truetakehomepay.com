import { useState, useMemo, useCallback, useEffect } from 'react';
import { calculateSelfEmploymentTax, calculateFederalTax, type SelfEmploymentTaxResult } from '../../lib/tax-engine';
import { FILING_STATUSES, type FilingStatus } from '../../lib/format-us';
import { formatCurrency, formatCurrencyRound, formatPercent } from '../../lib/format-us';
import InputField from '../ui/InputField';
import SelectField from '../ui/SelectField';

interface SelfEmploymentTaxCalculatorProps {
  defaultIncome?: number;
  defaultFilingStatus?: FilingStatus;
}

export default function SelfEmploymentTaxCalculator({
  defaultIncome,
  defaultFilingStatus = 'single',
}: SelfEmploymentTaxCalculatorProps) {
  // ─── State ─────────────────────────────────────────────────────────
  const [incomeInput, setIncomeInput] = useState(defaultIncome?.toString() ?? '80000');
  const [filingStatus, setFilingStatus] = useState<FilingStatus>(defaultFilingStatus);

  // Optional expenses section
  const [showExpenses, setShowExpenses] = useState(false);
  const [businessExpenses, setBusinessExpenses] = useState('0');

  // ─── URL State Sync ────────────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('income')) setIncomeInput(params.get('income')!);
    if (params.get('filing')) setFilingStatus(params.get('filing') as FilingStatus);
    if (params.get('expenses')) {
      setBusinessExpenses(params.get('expenses')!);
      setShowExpenses(true);
    }
  }, []);

  // Update URL when inputs change
  const defaultIncomeStr = defaultIncome?.toString() ?? '80000';
  const updateUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (incomeInput && incomeInput !== defaultIncomeStr) params.set('income', incomeInput);
    if (filingStatus !== 'single') params.set('filing', filingStatus);
    if (showExpenses && Number(businessExpenses) > 0) params.set('expenses', businessExpenses);

    const newUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;

    window.history.replaceState({}, '', newUrl);
  }, [incomeInput, defaultIncomeStr, filingStatus, showExpenses, businessExpenses]);

  useEffect(() => {
    updateUrl();
  }, [updateUrl]);

  // ─── Calculation ───────────────────────────────────────────────────
  const result = useMemo(() => {
    const grossIncome = Number(incomeInput.replace(/[^0-9.]/g, ''));
    if (isNaN(grossIncome) || grossIncome <= 0) return null;

    const expenses = showExpenses ? (Number(businessExpenses.replace(/[^0-9.]/g, '')) || 0) : 0;
    const netSEIncome = Math.max(0, grossIncome - expenses);

    const seResult = calculateSelfEmploymentTax(netSEIncome, filingStatus);

    // SE tax base (92.35% of net income)
    const seTaxBase = netSEIncome * 0.9235;

    // Estimated federal income tax: AGI = netIncome - deductibleHalf
    const agi = netSEIncome - seResult.deductibleHalf;
    const federalResult = calculateFederalTax(agi, filingStatus);

    // Total estimated tax
    const totalEstimatedTax = seResult.seTax + federalResult.tax;
    const quarterlyPayment = totalEstimatedTax / 4;

    return {
      netSEIncome,
      seTaxBase,
      ...seResult,
      federalTax: federalResult.tax,
      totalEstimatedTax,
      quarterlyPayment,
    };
  }, [incomeInput, filingStatus, showExpenses, businessExpenses]);

  // ─── Options ───────────────────────────────────────────────────────
  const filingOptions = Object.entries(FILING_STATUSES).map(([value, label]) => ({
    value,
    label,
  }));

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      {/* Input panel */}
      <div className="space-y-6 lg:col-span-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            Self-Employment Details
          </h2>

          <div className="space-y-4">
            <InputField
              id="se-income"
              label="Net Self-Employment Income"
              value={incomeInput}
              onChange={setIncomeInput}
              prefix="$"
              placeholder="80,000"
              helpText="Schedule C net profit or 1099-NEC income minus business expenses"
            />

            <SelectField
              id="filing-status"
              label="Filing Status"
              value={filingStatus}
              onChange={(v) => setFilingStatus(v as FilingStatus)}
              options={filingOptions}
            />
          </div>

          {/* Expenses toggle */}
          <button
            onClick={() => setShowExpenses(!showExpenses)}
            className="mt-6 flex w-full items-center justify-between rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700/50"
          >
            <span>Business Expenses</span>
            <svg
              className={`h-4 w-4 transition-transform ${showExpenses ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showExpenses && (
            <div className="mt-4 space-y-4 border-t border-slate-100 pt-4 dark:border-slate-700">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Enter Gross Income Above &amp; Deduct Expenses Below
              </p>

              <InputField
                id="business-expenses"
                label="Business Expenses"
                value={businessExpenses}
                onChange={setBusinessExpenses}
                prefix="$"
                placeholder="0"
                helpText="Total deductible business expenses (supplies, mileage, home office, etc.)"
              />

              {Number(businessExpenses.replace(/[^0-9.]/g, '')) > 0 && (
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Net SE Income after expenses:{' '}
                  <span className="text-navy-600 dark:text-navy-400">
                    {formatCurrencyRound(
                      Math.max(0, Number(incomeInput.replace(/[^0-9.]/g, '')) - Number(businessExpenses.replace(/[^0-9.]/g, '')))
                    )}
                  </span>
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Results panel */}
      <div className="lg:col-span-3">
        {result ? (
          <SEResultPanel result={result} />
        ) : (
          <div className="flex h-64 items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
            <p className="text-slate-500 dark:text-slate-400">
              Enter your self-employment income to see your tax estimate
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SE Result Panel ──────────────────────────────────────────────────

interface SEResultData {
  netSEIncome: number;
  seTaxBase: number;
  seTax: number;
  socialSecurityPortion: number;
  medicarePortion: number;
  additionalMedicare: number;
  deductibleHalf: number;
  effectiveRate: number;
  federalTax: number;
  totalEstimatedTax: number;
  quarterlyPayment: number;
}

function SEResultPanel({ result }: { result: SEResultData }) {
  const {
    netSEIncome,
    seTaxBase,
    seTax,
    socialSecurityPortion,
    medicarePortion,
    additionalMedicare,
    deductibleHalf,
    effectiveRate,
    federalTax,
    totalEstimatedTax,
    quarterlyPayment,
  } = result;

  return (
    <div className="space-y-6">
      {/* Big hero number */}
      <div className="rounded-2xl bg-gradient-to-br from-navy-800 to-navy-900 p-6 text-center text-white shadow-lg">
        <p className="text-sm font-medium text-navy-200">Total Self-Employment Tax</p>
        <p className="tabular-nums mt-1 text-4xl font-bold tracking-tight sm:text-5xl">
          {formatCurrency(seTax)}
        </p>
        <p className="tabular-nums mt-2 text-sm text-navy-300">
          Effective SE Tax Rate: {formatPercent(effectiveRate * 100, 2)}
        </p>
      </div>

      {/* Breakdown bar: SS vs Medicare vs Additional Medicare */}
      <SEBreakdownBar result={result} />

      {/* Detailed breakdown table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
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
            <SERow label="Net SE Income" value={netSEIncome} bold />
            <SERow label="SE Tax Base (92.35%)" value={seTaxBase} sublabel="Net income x 0.9235" />
            <SERow
              label="Social Security Tax (12.4%)"
              value={socialSecurityPortion}
              color="red"
              sublabel="On first $176,100 of SE tax base"
            />
            <SERow
              label="Medicare Tax (2.9%)"
              value={medicarePortion}
              color="red"
              sublabel="On all SE tax base"
            />
            <SERow
              label="Additional Medicare Tax (0.9%)"
              value={additionalMedicare}
              color="red"
              show={additionalMedicare > 0}
              sublabel="Above filing status threshold"
            />
            <SERow label="Total SE Tax" value={seTax} bold color="red" highlight="red" />
            <SERow
              label="Deductible Half of SE Tax"
              value={deductibleHalf}
              color="blue"
              sublabel="Reduces your AGI on Form 1040"
            />
            <SERow
              label="Est. Federal Income Tax"
              value={federalTax}
              color="red"
              sublabel="Based on AGI minus deductible half"
            />
            <SERow
              label="Total Estimated Tax"
              value={totalEstimatedTax}
              bold
              highlight="red"
              sublabel="SE tax + federal income tax"
            />
            <SERow
              label="Est. Quarterly Payment"
              value={quarterlyPayment}
              bold
              highlight="green"
              sublabel="Due Apr 15, Jun 15, Sep 15, Jan 15"
            />
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── SE Breakdown Bar ─────────────────────────────────────────────────

function SEBreakdownBar({ result }: { result: SEResultData }) {
  const { seTax, socialSecurityPortion, medicarePortion, additionalMedicare } = result;

  if (seTax <= 0) return null;

  const segments = [
    { label: 'Social Security', value: socialSecurityPortion, color: 'bg-patriot-500' },
    { label: 'Medicare', value: medicarePortion, color: 'bg-amber-500' },
    { label: 'Additional Medicare', value: additionalMedicare, color: 'bg-orange-400' },
  ].filter((s) => s.value > 0);

  return (
    <div className="space-y-2">
      <div className="flex h-6 overflow-hidden rounded-full">
        {segments.map((seg) => (
          <div
            key={seg.label}
            className={`${seg.color} transition-all duration-300`}
            style={{ width: `${(seg.value / seTax) * 100}%` }}
            title={`${seg.label}: ${formatCurrency(seg.value)}`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-1.5">
            <div className={`h-2.5 w-2.5 rounded-full ${seg.color}`} />
            <span className="text-xs text-slate-600 dark:text-slate-400">
              {seg.label}: {formatCurrency(seg.value)} ({formatPercent((seg.value / seTax) * 100, 1)})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SE Table Row ─────────────────────────────────────────────────────

function SERow({
  label,
  value,
  sublabel,
  bold = false,
  highlight,
  color,
  show = true,
}: {
  label: string;
  value: number;
  sublabel?: string;
  bold?: boolean;
  highlight?: 'red' | 'green';
  color?: 'red' | 'blue';
  show?: boolean;
}) {
  if (!show) return null;

  const textColor =
    highlight === 'green' ? 'text-success-600 dark:text-success-500' :
    highlight === 'red' ? 'text-patriot-600 dark:text-patriot-400' :
    color === 'red' ? 'text-patriot-600 dark:text-patriot-400' :
    color === 'blue' ? 'text-navy-600 dark:text-navy-400' :
    'text-slate-900 dark:text-slate-100';

  const bgColor =
    highlight === 'green' ? 'bg-success-50/50 dark:bg-success-900/10' :
    highlight === 'red' ? 'bg-patriot-50/50 dark:bg-patriot-900/10' :
    '';

  return (
    <tr className={bgColor}>
      <td className={`px-4 py-2.5 ${bold ? 'font-semibold' : ''} text-slate-700 dark:text-slate-300`}>
        {label}
        {sublabel && (
          <span className="block text-xs font-normal text-slate-400 dark:text-slate-500">
            {sublabel}
          </span>
        )}
      </td>
      <td className={`px-4 py-2.5 text-right ${bold ? 'font-semibold' : 'font-medium'} ${textColor}`}>
        {formatCurrency(value)}
      </td>
    </tr>
  );
}
