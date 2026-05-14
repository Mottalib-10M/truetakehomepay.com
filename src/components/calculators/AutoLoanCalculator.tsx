import { useState, useMemo, useCallback, useEffect } from 'react';
import { calculateAutoLoan, type AutoLoanResult } from '../../lib/finance-engine';
import { formatCurrency, formatCurrencyRound, formatPercent } from '../../lib/format-us';
import InputField from '../ui/InputField';
import SelectField from '../ui/SelectField';

const TERM_OPTIONS = [
  { value: '24', label: '24 months (2 years)' },
  { value: '36', label: '36 months (3 years)' },
  { value: '48', label: '48 months (4 years)' },
  { value: '60', label: '60 months (5 years)' },
  { value: '72', label: '72 months (6 years)' },
  { value: '84', label: '84 months (7 years)' },
];

export default function AutoLoanCalculator() {
  // ─── State ─────────────────────────────────────────────────────────
  const [priceInput, setPriceInput] = useState('35000');
  const [downPaymentInput, setDownPaymentInput] = useState('5000');
  const [tradeInInput, setTradeInInput] = useState('0');
  const [salesTaxInput, setSalesTaxInput] = useState('7');
  const [rateInput, setRateInput] = useState('6.5');
  const [termInput, setTermInput] = useState('60');

  // ─── URL State Sync ────────────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('price')) setPriceInput(params.get('price')!);
    if (params.get('down')) setDownPaymentInput(params.get('down')!);
    if (params.get('trade')) setTradeInInput(params.get('trade')!);
    if (params.get('tax')) setSalesTaxInput(params.get('tax')!);
    if (params.get('rate')) setRateInput(params.get('rate')!);
    if (params.get('term')) setTermInput(params.get('term')!);
  }, []);

  // Update URL when inputs change
  const updateUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (priceInput && priceInput !== '35000') params.set('price', priceInput);
    if (downPaymentInput && downPaymentInput !== '5000') params.set('down', downPaymentInput);
    if (tradeInInput && tradeInInput !== '0') params.set('trade', tradeInInput);
    if (salesTaxInput && salesTaxInput !== '7') params.set('tax', salesTaxInput);
    if (rateInput && rateInput !== '6.5') params.set('rate', rateInput);
    if (termInput && termInput !== '60') params.set('term', termInput);

    const newUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;

    window.history.replaceState({}, '', newUrl);
  }, [priceInput, downPaymentInput, tradeInInput, salesTaxInput, rateInput, termInput]);

  useEffect(() => {
    updateUrl();
  }, [updateUrl]);

  // ─── Calculation ───────────────────────────────────────────────────
  const result = useMemo<{ loan: AutoLoanResult; salesTax: number; amountFinanced: number } | null>(() => {
    const price = Number(priceInput.replace(/[^0-9.]/g, ''));
    const downPayment = Number(downPaymentInput.replace(/[^0-9.]/g, ''));
    const tradeIn = Number(tradeInInput.replace(/[^0-9.]/g, ''));
    const salesTaxRate = Number(salesTaxInput.replace(/[^0-9.]/g, '')) / 100;
    const annualRate = Number(rateInput.replace(/[^0-9.]/g, '')) / 100;
    const term = Number(termInput);

    if (isNaN(price) || price <= 0) return null;
    if (isNaN(annualRate)) return null;
    if (isNaN(term) || term <= 0) return null;

    const safeDp = isNaN(downPayment) ? 0 : downPayment;
    const safeTrade = isNaN(tradeIn) ? 0 : tradeIn;
    const safeTax = isNaN(salesTaxRate) ? 0 : salesTaxRate;

    const taxableAmount = price - safeTrade;
    const salesTax = Math.max(0, taxableAmount) * safeTax;
    const amountFinanced = price - safeDp - safeTrade + salesTax;

    if (amountFinanced <= 0) return null;

    const loan = calculateAutoLoan(price, safeDp, safeTrade, safeTax, annualRate, term);

    return { loan, salesTax, amountFinanced };
  }, [priceInput, downPaymentInput, tradeInInput, salesTaxInput, rateInput, termInput]);

  // ─── Render ────────────────────────────────────────────────────────
  return (
    <div className="grid gap-8 lg:grid-cols-5">
      {/* Input panel */}
      <div className="space-y-6 lg:col-span-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            Auto Loan Details
          </h2>

          <div className="space-y-4">
            <InputField
              id="vehicle-price"
              label="Vehicle Price"
              value={priceInput}
              onChange={setPriceInput}
              prefix="$"
              placeholder="35,000"
              helpText="Total purchase price of the vehicle"
            />

            <InputField
              id="down-payment"
              label="Down Payment"
              value={downPaymentInput}
              onChange={setDownPaymentInput}
              prefix="$"
              placeholder="5,000"
              helpText="Cash paid upfront at purchase"
            />

            <InputField
              id="trade-in"
              label="Trade-In Value"
              value={tradeInInput}
              onChange={setTradeInInput}
              prefix="$"
              placeholder="0"
              helpText="Value of your current vehicle trade-in"
            />

            <InputField
              id="sales-tax"
              label="Sales Tax Rate"
              value={salesTaxInput}
              onChange={setSalesTaxInput}
              suffix="%"
              placeholder="7"
              helpText="State + local sales tax on the vehicle"
            />

            <InputField
              id="interest-rate"
              label="Interest Rate (APR)"
              value={rateInput}
              onChange={setRateInput}
              suffix="%"
              placeholder="6.5"
              helpText="Annual percentage rate on your auto loan"
            />

            <SelectField
              id="loan-term"
              label="Loan Term"
              value={termInput}
              onChange={setTermInput}
              options={TERM_OPTIONS}
              helpText="Shorter terms have higher payments but less total interest"
            />
          </div>
        </div>
      </div>

      {/* Results panel */}
      <div className="lg:col-span-3">
        {result ? (
          <AutoLoanResults
            loan={result.loan}
            salesTax={result.salesTax}
            amountFinanced={result.amountFinanced}
            price={Number(priceInput.replace(/[^0-9.]/g, ''))}
            downPayment={Number(downPaymentInput.replace(/[^0-9.]/g, '')) || 0}
            tradeIn={Number(tradeInInput.replace(/[^0-9.]/g, '')) || 0}
          />
        ) : (
          <div className="flex h-64 items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
            <p className="text-slate-500 dark:text-slate-400">
              Enter your vehicle details to see your estimated payment
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Results Panel ──────────────────────────────────────────────────────

function AutoLoanResults({
  loan,
  salesTax,
  amountFinanced,
  price,
  downPayment,
  tradeIn,
}: {
  loan: AutoLoanResult;
  salesTax: number;
  amountFinanced: number;
  price: number;
  downPayment: number;
  tradeIn: number;
}) {
  const { monthlyPayment, totalPayment, totalInterest, totalCost } = loan;

  return (
    <div className="space-y-6">
      {/* Big hero monthly payment */}
      <div className="rounded-2xl bg-gradient-to-br from-navy-800 to-navy-900 p-6 text-center text-white shadow-lg">
        <p className="text-sm font-medium text-navy-200">Estimated Monthly Payment</p>
        <p className="tabular-nums mt-1 text-4xl font-bold tracking-tight sm:text-5xl">
          {formatCurrency(monthlyPayment)}
        </p>
        <p className="tabular-nums mt-2 text-sm text-navy-300">
          {formatCurrencyRound(amountFinanced)} financed &middot; {formatCurrencyRound(totalInterest)} total interest
        </p>
      </div>

      {/* Breakdown bar: principal vs interest vs sales tax */}
      <CostBreakdownBar
        principal={amountFinanced - salesTax}
        interest={totalInterest}
        salesTax={salesTax}
      />

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
            <CostRow label="Vehicle Price" value={price} bold />
            <CostRow label="Down Payment" value={-downPayment} color="blue" show={downPayment > 0} />
            <CostRow label="Trade-In Value" value={-tradeIn} color="blue" show={tradeIn > 0} />
            <CostRow label="Sales Tax" value={salesTax} color="red" show={salesTax > 0} />
            <CostRow label="Amount Financed" value={amountFinanced} bold highlight="navy" />
            <CostRow label="Total Interest" value={totalInterest} color="red" />
            <CostRow label="Total of All Payments" value={totalPayment} bold />
            <CostRow label="Total Cost" value={totalCost} bold highlight="green" />
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Cost Breakdown Bar ─────────────────────────────────────────────────

function CostBreakdownBar({
  principal,
  interest,
  salesTax,
}: {
  principal: number;
  interest: number;
  salesTax: number;
}) {
  const total = principal + interest + salesTax;
  if (total <= 0) return null;

  const segments = [
    { label: 'Principal', value: principal, color: 'bg-navy-500' },
    { label: 'Interest', value: interest, color: 'bg-patriot-500' },
    { label: 'Sales Tax', value: salesTax, color: 'bg-amber-500' },
  ].filter((s) => s.value > 0);

  return (
    <div className="space-y-2">
      <div className="flex h-6 overflow-hidden rounded-full">
        {segments.map((seg) => (
          <div
            key={seg.label}
            className={`${seg.color} transition-all duration-300`}
            style={{ width: `${(seg.value / total) * 100}%` }}
            title={`${seg.label}: ${formatCurrencyRound(seg.value)}`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-1.5">
            <div className={`h-2.5 w-2.5 rounded-full ${seg.color}`} />
            <span className="text-xs text-slate-600 dark:text-slate-400">
              {seg.label}: {formatCurrencyRound(seg.value)} ({formatPercent((seg.value / total) * 100, 1)})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Table Row ──────────────────────────────────────────────────────────

function CostRow({
  label,
  value,
  bold = false,
  highlight,
  color,
  show = true,
}: {
  label: string;
  value: number;
  bold?: boolean;
  highlight?: 'green' | 'navy';
  color?: 'red' | 'blue';
  show?: boolean;
}) {
  if (!show) return null;

  const textColor =
    highlight === 'green' ? 'text-success-600 dark:text-success-500' :
    highlight === 'navy' ? 'text-navy-600 dark:text-navy-400' :
    color === 'red' ? 'text-patriot-600 dark:text-patriot-400' :
    color === 'blue' ? 'text-navy-600 dark:text-navy-400' :
    'text-slate-900 dark:text-slate-100';

  const rowBg =
    highlight === 'green' ? 'bg-success-50/50 dark:bg-success-900/10' :
    highlight === 'navy' ? 'bg-navy-50/50 dark:bg-navy-900/10' :
    '';

  return (
    <tr className={rowBg}>
      <td className={`px-4 py-2.5 ${bold ? 'font-semibold' : ''} text-slate-700 dark:text-slate-300`}>
        {label}
      </td>
      <td className={`px-4 py-2.5 text-right ${bold ? 'font-semibold' : 'font-medium'} ${textColor}`}>
        {formatCurrency(value)}
      </td>
    </tr>
  );
}
