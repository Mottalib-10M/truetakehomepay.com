import { useState, useMemo, useCallback, useEffect } from 'react';
import { formatCurrency, formatCurrencyRound, formatNumber } from '../../lib/format-us';
import InputField from '../ui/InputField';
import SelectField from '../ui/SelectField';

// ─── Constants ────────────────────────────────────────────────────────
const BEND_POINT_1 = 1226;
const BEND_POINT_2 = 7391;
const MAX_MONTHLY_BENEFIT_FRA = 4018;
const LIFE_EXPECTANCY = 85;

const RETIREMENT_AGE_OPTIONS = [
  { value: '62', label: 'Age 62 (Early)' },
  { value: '65', label: 'Age 65' },
  { value: '67', label: 'Age 67 (Full Retirement)' },
  { value: '70', label: 'Age 70 (Maximum)' },
];

// ─── PIA Calculation ─────────────────────────────────────────────────
function calculatePIA(aime: number): number {
  let pia = 0;

  if (aime <= BEND_POINT_1) {
    pia = aime * 0.9;
  } else if (aime <= BEND_POINT_2) {
    pia = BEND_POINT_1 * 0.9 + (aime - BEND_POINT_1) * 0.32;
  } else {
    pia = BEND_POINT_1 * 0.9 + (BEND_POINT_2 - BEND_POINT_1) * 0.32 + (aime - BEND_POINT_2) * 0.15;
  }

  return Math.min(pia, MAX_MONTHLY_BENEFIT_FRA);
}

// ─── Benefit adjustment by claiming age ──────────────────────────────
function adjustBenefitForAge(pia: number, claimAge: number): number {
  if (claimAge <= 62) return pia * 0.70;
  if (claimAge <= 63) return pia * 0.75;
  if (claimAge <= 64) return pia * 0.80;
  if (claimAge <= 65) return pia * 0.8667;
  if (claimAge <= 66) return pia * 0.9333;
  if (claimAge <= 67) return pia * 1.0;
  if (claimAge <= 68) return pia * 1.08;
  if (claimAge <= 69) return pia * 1.16;
  return pia * 1.24; // 70+
}

// ─── Result Interface ─────────────────────────────────────────────────
interface SSBenefitResult {
  aime: number;
  pia: number;
  selectedAge: number;
  selectedMonthly: number;
  selectedAnnual: number;
  benefitAt62Monthly: number;
  benefitAt62Annual: number;
  benefitAt67Monthly: number;
  benefitAt67Annual: number;
  benefitAt70Monthly: number;
  benefitAt70Annual: number;
  lifetimeAt62: number;
  lifetimeAt67: number;
  lifetimeAt70: number;
  yearsCollecting62: number;
  yearsCollecting67: number;
  yearsCollecting70: number;
  breakEvenAge: number;
}

// ─── Main Component ───────────────────────────────────────────────────
export default function SocialSecurityBenefitsCalculator() {
  // ─── State ──────────────────────────────────────────────────────────
  const [income, setIncome] = useState('75000');
  const [age, setAge] = useState('40');
  const [retireAge, setRetireAge] = useState('67');
  const [yearsWorked, setYearsWorked] = useState('20');

  // ─── URL State Sync ─────────────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('income')) setIncome(params.get('income')!);
    if (params.get('age')) setAge(params.get('age')!);
    if (params.get('retire')) setRetireAge(params.get('retire')!);
    if (params.get('years')) setYearsWorked(params.get('years')!);
  }, []);

  const updateUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (income && income !== '75000') params.set('income', income);
    if (age && age !== '40') params.set('age', age);
    if (retireAge !== '67') params.set('retire', retireAge);
    if (yearsWorked && yearsWorked !== '20') params.set('years', yearsWorked);

    const newUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;

    window.history.replaceState({}, '', newUrl);
  }, [income, age, retireAge, yearsWorked]);

  useEffect(() => {
    updateUrl();
  }, [updateUrl]);

  // ─── Calculation ────────────────────────────────────────────────────
  const result = useMemo((): SSBenefitResult | null => {
    const annualIncome = Number(income.replace(/[^0-9.]/g, ''));
    const currentAge = Number(age);
    const selectedRetireAge = Number(retireAge);
    const yrsWorked = Number(yearsWorked);

    if (isNaN(annualIncome) || annualIncome <= 0) return null;
    if (isNaN(currentAge) || currentAge < 18 || currentAge > 70) return null;
    if (isNaN(yrsWorked) || yrsWorked < 0) return null;

    // Simplified AIME: use current income as proxy for career average
    const aime = annualIncome / 12;

    // Calculate PIA from bend points
    const pia = calculatePIA(aime);

    // Benefits at each claiming age
    const benefitAt62Monthly = adjustBenefitForAge(pia, 62);
    const benefitAt67Monthly = adjustBenefitForAge(pia, 67);
    const benefitAt70Monthly = adjustBenefitForAge(pia, 70);
    const selectedMonthly = adjustBenefitForAge(pia, selectedRetireAge);

    const benefitAt62Annual = benefitAt62Monthly * 12;
    const benefitAt67Annual = benefitAt67Monthly * 12;
    const benefitAt70Annual = benefitAt70Monthly * 12;
    const selectedAnnual = selectedMonthly * 12;

    // Lifetime benefits (assuming live to 85)
    const yearsCollecting62 = Math.max(0, LIFE_EXPECTANCY - 62);
    const yearsCollecting67 = Math.max(0, LIFE_EXPECTANCY - 67);
    const yearsCollecting70 = Math.max(0, LIFE_EXPECTANCY - 70);

    const lifetimeAt62 = benefitAt62Annual * yearsCollecting62;
    const lifetimeAt67 = benefitAt67Annual * yearsCollecting67;
    const lifetimeAt70 = benefitAt70Annual * yearsCollecting70;

    // Break-even: age at which cumulative benefits from age 70 surpass those from age 62
    // At age A (>= 70): cumulative62 = benefitAt62Annual * (A - 62), cumulative70 = benefitAt70Annual * (A - 70)
    // Solve: benefitAt70Annual * (A - 70) = benefitAt62Annual * (A - 62)
    // A * (benefit70 - benefit62) = benefit70 * 70 - benefit62 * 62
    // A = (benefit70 * 70 - benefit62 * 62) / (benefit70 - benefit62)
    let breakEvenAge = 0;
    if (benefitAt70Annual > benefitAt62Annual) {
      breakEvenAge = Math.ceil(
        (benefitAt70Annual * 70 - benefitAt62Annual * 62) / (benefitAt70Annual - benefitAt62Annual)
      );
    }

    return {
      aime,
      pia,
      selectedAge: selectedRetireAge,
      selectedMonthly,
      selectedAnnual,
      benefitAt62Monthly,
      benefitAt62Annual,
      benefitAt67Monthly,
      benefitAt67Annual,
      benefitAt70Monthly,
      benefitAt70Annual,
      lifetimeAt62,
      lifetimeAt67,
      lifetimeAt70,
      yearsCollecting62,
      yearsCollecting67,
      yearsCollecting70,
      breakEvenAge,
    };
  }, [income, age, retireAge, yearsWorked]);

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      {/* Input panel */}
      <div className="space-y-6 lg:col-span-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            Your Details
          </h2>

          <div className="space-y-4">
            <InputField
              id="ss-income"
              label="Current Annual Income"
              value={income}
              onChange={setIncome}
              prefix="$"
              placeholder="75,000"
              helpText="Your gross annual income (used as proxy for career average)"
            />

            <InputField
              id="ss-age"
              label="Current Age"
              value={age}
              onChange={setAge}
              type="number"
              placeholder="40"
              helpText="Your current age (18-70)"
            />

            <SelectField
              id="ss-retire-age"
              label="Expected Retirement Age"
              value={retireAge}
              onChange={setRetireAge}
              options={RETIREMENT_AGE_OPTIONS}
              helpText="When you plan to start claiming benefits"
            />

            <InputField
              id="ss-years-worked"
              label="Years Worked"
              value={yearsWorked}
              onChange={setYearsWorked}
              type="number"
              placeholder="20"
              helpText="Total years of employment with SS contributions"
            />
          </div>

          {/* Quick reference */}
          <div className="mt-6 rounded-lg border border-slate-100 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/80">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
              2026 SS Benefits Quick Reference
            </p>
            <div className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-400">
              <p>Full Retirement Age: 67 (born 1960+)</p>
              <p>Early Claiming (62): ~30% reduction</p>
              <p>Delayed Credits (70): ~24% increase</p>
              <p>Max Benefit at FRA: ~{formatCurrencyRound(MAX_MONTHLY_BENEFIT_FRA)}/mo</p>
            </div>
          </div>
        </div>
      </div>

      {/* Results panel */}
      <div className="lg:col-span-3">
        {result ? (
          <SSBenefitResultPanel result={result} />
        ) : (
          <div className="flex h-64 items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
            <p className="text-slate-500 dark:text-slate-400">
              Enter your income details to estimate your Social Security benefits
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Result Panel ─────────────────────────────────────────────────────

function SSBenefitResultPanel({ result }: { result: SSBenefitResult }) {
  const {
    pia,
    selectedAge,
    selectedMonthly,
    selectedAnnual,
    benefitAt62Monthly,
    benefitAt62Annual,
    benefitAt67Monthly,
    benefitAt67Annual,
    benefitAt70Monthly,
    benefitAt70Annual,
    lifetimeAt62,
    lifetimeAt67,
    lifetimeAt70,
    yearsCollecting62,
    yearsCollecting67,
    yearsCollecting70,
    breakEvenAge,
  } = result;

  const ageLabel =
    selectedAge === 62 ? 'Early (62)' :
    selectedAge === 67 ? 'Full Retirement (67)' :
    selectedAge === 70 ? 'Maximum (70)' :
    `Age ${selectedAge}`;

  return (
    <div className="space-y-6">
      {/* Hero card */}
      <div className="rounded-2xl bg-gradient-to-br from-navy-800 to-navy-900 p-6 text-center text-white shadow-lg">
        <p className="text-sm font-medium text-navy-200">
          Estimated Monthly Benefit at {ageLabel}
        </p>
        <p className="tabular-nums mt-1 text-4xl font-bold tracking-tight sm:text-5xl">
          {formatCurrencyRound(selectedMonthly)}
        </p>
        <p className="tabular-nums mt-2 text-sm text-navy-300">
          {formatCurrencyRound(selectedAnnual)} per year | PIA: {formatCurrencyRound(pia)}/mo
        </p>
      </div>

      {/* Three comparison cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center dark:border-slate-700 dark:bg-slate-800/50">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Age 62 (Early)</p>
          <p className="tabular-nums mt-1 text-lg font-bold text-amber-600 dark:text-amber-400">
            {formatCurrencyRound(benefitAt62Monthly)}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">/month (reduced)</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center dark:border-slate-700 dark:bg-slate-800/50">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Age 67 (Full)</p>
          <p className="tabular-nums mt-1 text-lg font-bold text-sky-600 dark:text-sky-400">
            {formatCurrencyRound(benefitAt67Monthly)}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">/month (full)</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center dark:border-slate-700 dark:bg-slate-800/50">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Age 70 (Max)</p>
          <p className="tabular-nums mt-1 text-lg font-bold text-success-600 dark:text-success-500">
            {formatCurrencyRound(benefitAt70Monthly)}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">/month (maximum)</p>
        </div>
      </div>

      {/* Lifetime benefits comparison table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/50">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Lifetime Benefits Comparison (to age {LIFE_EXPECTANCY})
          </p>
        </div>
        <table className="tabular-nums w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
              <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-400">
                Start Age
              </th>
              <th className="px-4 py-3 text-right font-medium text-slate-600 dark:text-slate-400">
                Monthly
              </th>
              <th className="hidden px-4 py-3 text-right font-medium text-slate-600 sm:table-cell dark:text-slate-400">
                Annual
              </th>
              <th className="hidden px-4 py-3 text-right font-medium text-slate-600 md:table-cell dark:text-slate-400">
                Years
              </th>
              <th className="px-4 py-3 text-right font-medium text-slate-600 dark:text-slate-400">
                Total Lifetime
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            <LifetimeRow
              age={62}
              label="Early"
              monthly={benefitAt62Monthly}
              annual={benefitAt62Annual}
              years={yearsCollecting62}
              lifetime={lifetimeAt62}
              color="amber"
            />
            <LifetimeRow
              age={67}
              label="Full"
              monthly={benefitAt67Monthly}
              annual={benefitAt67Annual}
              years={yearsCollecting67}
              lifetime={lifetimeAt67}
              color="sky"
            />
            <LifetimeRow
              age={70}
              label="Max"
              monthly={benefitAt70Monthly}
              annual={benefitAt70Annual}
              years={yearsCollecting70}
              lifetime={lifetimeAt70}
              color="success"
              highlight
            />
          </tbody>
        </table>
      </div>

      {/* Break-even point */}
      {breakEvenAge > 70 && breakEvenAge <= LIFE_EXPECTANCY && (
        <div className="rounded-xl border border-navy-200 bg-navy-50 p-4 dark:border-navy-800 dark:bg-navy-900/20">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy-100 text-navy-700 dark:bg-navy-900/40 dark:text-navy-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-navy-800 dark:text-navy-300">
                Break-Even Age: {breakEvenAge}
              </p>
              <p className="text-xs text-navy-600 dark:text-navy-400">
                Waiting until 70 to claim beats taking benefits at 62 if you live past age {breakEvenAge}.
                {breakEvenAge <= LIFE_EXPECTANCY && ' Based on average life expectancy, delaying is advantageous.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="rounded-lg border border-slate-100 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/80">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          <span className="font-semibold">Note:</span> This is a simplified estimate. Your actual
          benefit depends on your 35 highest-earning years, adjusted for inflation. Visit{' '}
          <a
            href="https://www.ssa.gov/myaccount/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-navy-600 underline hover:text-navy-800 dark:text-navy-400 dark:hover:text-navy-300"
          >
            ssa.gov
          </a>{' '}
          for your personalized estimate based on actual earnings records.
        </p>
      </div>
    </div>
  );
}

// ─── Lifetime Row ─────────────────────────────────────────────────────

function LifetimeRow({
  age,
  label,
  monthly,
  annual,
  years,
  lifetime,
  color,
  highlight = false,
}: {
  age: number;
  label: string;
  monthly: number;
  annual: number;
  years: number;
  lifetime: number;
  color: 'amber' | 'sky' | 'success';
  highlight?: boolean;
}) {
  const colorMap = {
    amber: 'text-amber-600 dark:text-amber-400',
    sky: 'text-sky-600 dark:text-sky-400',
    success: 'text-success-600 dark:text-success-500',
  };

  return (
    <tr className={highlight ? 'bg-success-50/50 dark:bg-success-900/10' : ''}>
      <td className="px-4 py-2.5 font-medium text-slate-700 dark:text-slate-300">
        {age}
        <span className="ml-1 text-xs font-normal text-slate-400 dark:text-slate-500">({label})</span>
      </td>
      <td className={`px-4 py-2.5 text-right font-semibold ${colorMap[color]}`}>
        {formatCurrencyRound(monthly)}
      </td>
      <td className={`hidden px-4 py-2.5 text-right font-medium sm:table-cell ${colorMap[color]}`}>
        {formatCurrencyRound(annual)}
      </td>
      <td className="hidden px-4 py-2.5 text-right font-medium text-slate-700 md:table-cell dark:text-slate-300">
        {years}
      </td>
      <td className={`px-4 py-2.5 text-right font-semibold ${highlight ? colorMap[color] : 'text-slate-900 dark:text-slate-100'}`}>
        {formatCurrencyRound(lifetime)}
      </td>
    </tr>
  );
}
