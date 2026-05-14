import { useState, useMemo, useCallback, useEffect } from 'react';
import { formatCurrency, formatCurrencyRound, formatNumber } from '../../lib/format-us';
import InputField from '../ui/InputField';
import SelectField from '../ui/SelectField';

// ─── Types ─────────────────────────────────────────────────────────────

interface RiskFactor {
  label: string;
  impact: string;
  months: number;
}

interface TimelineMilestone {
  label: string;
  months: number;
  amount: number;
  reached: boolean;
}

interface EmergencyFundResult {
  recommendedMonths: number;
  minMonths: number;
  maxMonths: number;
  targetAmount: number;
  minAmount: number;
  maxAmount: number;
  currentSavings: number;
  gap: number;
  progressPct: number;
  goalAlreadyMet: boolean;
  riskFactors: RiskFactor[];
  timeline: TimelineMilestone[];
}

// ─── Options ───────────────────────────────────────────────────────────

const stabilityOptions = [
  { value: 'stable', label: 'Stable (government / tenured)' },
  { value: 'moderate', label: 'Moderate (corporate)' },
  { value: 'variable', label: 'Variable (freelance / contract / seasonal)' },
];

const earnerOptions = [
  { value: '1', label: '1 earner' },
  { value: '2', label: '2 earners' },
];

const dependentOptions = [
  { value: '0', label: '0 dependents' },
  { value: '1-2', label: '1-2 dependents' },
  { value: '3+', label: '3+ dependents' },
];

// ─── Simulation Helper ─────────────────────────────────────────────────

function simulateMonthsToTarget(
  current: number,
  monthly: number,
  annualRate: number,
  target: number
): number {
  if (current >= target) return 0;
  if (monthly <= 0 && annualRate <= 0) return -1; // unreachable

  const monthlyRate = annualRate / 12;
  let balance = current;
  let months = 0;

  while (balance < target && months < 1200) {
    const interest = balance * monthlyRate;
    balance += interest + monthly;
    months++;
  }

  return months >= 1200 ? -1 : months;
}

// ─── Main Component ────────────────────────────────────────────────────

export default function EmergencyFundCalculator() {
  // ─── State ─────────────────────────────────────────────────────────
  const [expensesInput, setExpensesInput] = useState('4000');
  const [savingsInput, setSavingsInput] = useState('5000');
  const [monthlyInput, setMonthlyInput] = useState('500');
  const [stabilityInput, setStabilityInput] = useState('moderate');
  const [earnersInput, setEarnersInput] = useState('1');
  const [dependentsInput, setDependentsInput] = useState('0');
  const [apyInput, setApyInput] = useState('4.5');

  // ─── URL State Sync ────────────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('expenses')) setExpensesInput(params.get('expenses')!);
    if (params.get('savings')) setSavingsInput(params.get('savings')!);
    if (params.get('monthly')) setMonthlyInput(params.get('monthly')!);
    if (params.get('stability')) setStabilityInput(params.get('stability')!);
    if (params.get('earners')) setEarnersInput(params.get('earners')!);
    if (params.get('dependents')) setDependentsInput(params.get('dependents')!);
    if (params.get('apy')) setApyInput(params.get('apy')!);
  }, []);

  const updateUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (expensesInput && expensesInput !== '4000') params.set('expenses', expensesInput);
    if (savingsInput && savingsInput !== '5000') params.set('savings', savingsInput);
    if (monthlyInput && monthlyInput !== '500') params.set('monthly', monthlyInput);
    if (stabilityInput && stabilityInput !== 'moderate') params.set('stability', stabilityInput);
    if (earnersInput && earnersInput !== '1') params.set('earners', earnersInput);
    if (dependentsInput && dependentsInput !== '0') params.set('dependents', dependentsInput);
    if (apyInput && apyInput !== '4.5') params.set('apy', apyInput);

    const newUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;

    window.history.replaceState({}, '', newUrl);
  }, [expensesInput, savingsInput, monthlyInput, stabilityInput, earnersInput, dependentsInput, apyInput]);

  useEffect(() => {
    updateUrl();
  }, [updateUrl]);

  // ─── Calculation ───────────────────────────────────────────────────
  const result = useMemo<EmergencyFundResult | null>(() => {
    const expenses = Number(expensesInput.replace(/[^0-9.]/g, ''));
    const savings = Number(savingsInput.replace(/[^0-9.]/g, ''));
    const monthly = Number(monthlyInput.replace(/[^0-9.]/g, ''));
    const apy = Number(apyInput.replace(/[^0-9.]/g, ''));

    if (isNaN(expenses) || isNaN(savings) || isNaN(monthly) || isNaN(apy)) return null;
    if (expenses <= 0) return null;
    if (savings < 0 || monthly < 0 || apy < 0) return null;

    const annualRate = apy / 100;

    // Base range: 3 to 6 months
    let minMonths = 3;
    let maxMonths = 6;
    const riskFactors: RiskFactor[] = [];

    // Income stability
    if (stabilityInput === 'stable') {
      // Stable: use lower end, no additional months
      riskFactors.push({ label: 'Stable income', impact: 'Lower end of range', months: 0 });
    } else if (stabilityInput === 'moderate') {
      riskFactors.push({ label: 'Moderate income stability', impact: 'Standard range', months: 0 });
    } else if (stabilityInput === 'variable') {
      minMonths += 3;
      maxMonths += 3;
      riskFactors.push({ label: 'Variable income', impact: '+3 months recommended', months: 3 });
    }

    // Number of earners
    if (earnersInput === '1') {
      minMonths += 2;
      maxMonths += 2;
      riskFactors.push({ label: 'Single income earner', impact: '+2 months recommended', months: 2 });
    } else {
      riskFactors.push({ label: 'Dual income household', impact: 'Lower risk', months: 0 });
    }

    // Dependents
    if (dependentsInput === '1-2') {
      minMonths += 1;
      maxMonths += 1;
      riskFactors.push({ label: '1-2 dependents', impact: '+1 month recommended', months: 1 });
    } else if (dependentsInput === '3+') {
      minMonths += 2;
      maxMonths += 2;
      riskFactors.push({ label: '3+ dependents', impact: '+2 months recommended', months: 2 });
    } else {
      riskFactors.push({ label: 'No dependents', impact: 'No additional buffer', months: 0 });
    }

    // Recommended months: stable = min, variable = max, moderate = midpoint
    let recommendedMonths: number;
    if (stabilityInput === 'stable') {
      recommendedMonths = minMonths;
    } else if (stabilityInput === 'variable') {
      recommendedMonths = maxMonths;
    } else {
      recommendedMonths = Math.round((minMonths + maxMonths) / 2);
    }

    const targetAmount = expenses * recommendedMonths;
    const minAmount = expenses * minMonths;
    const maxAmount = expenses * maxMonths;
    const gap = Math.max(0, targetAmount - savings);
    const progressPct = targetAmount > 0 ? Math.min(100, (savings / targetAmount) * 100) : 0;
    const goalAlreadyMet = savings >= targetAmount;

    // Timeline milestones
    const threeMonthTarget = expenses * 3;
    const sixMonthTarget = expenses * 6;
    const timeline: TimelineMilestone[] = [];

    if (threeMonthTarget > 0) {
      const m = simulateMonthsToTarget(savings, monthly, annualRate, threeMonthTarget);
      timeline.push({
        label: '3-month fund',
        months: m,
        amount: threeMonthTarget,
        reached: savings >= threeMonthTarget,
      });
    }

    if (sixMonthTarget > 0) {
      const m = simulateMonthsToTarget(savings, monthly, annualRate, sixMonthTarget);
      timeline.push({
        label: '6-month fund',
        months: m,
        amount: sixMonthTarget,
        reached: savings >= sixMonthTarget,
      });
    }

    if (targetAmount > 0 && targetAmount !== threeMonthTarget && targetAmount !== sixMonthTarget) {
      const m = simulateMonthsToTarget(savings, monthly, annualRate, targetAmount);
      timeline.push({
        label: `Full target (${recommendedMonths}-month fund)`,
        months: m,
        amount: targetAmount,
        reached: goalAlreadyMet,
      });
    }

    return {
      recommendedMonths,
      minMonths,
      maxMonths,
      targetAmount,
      minAmount,
      maxAmount,
      currentSavings: savings,
      gap,
      progressPct,
      goalAlreadyMet,
      riskFactors,
      timeline,
    };
  }, [expensesInput, savingsInput, monthlyInput, stabilityInput, earnersInput, dependentsInput, apyInput]);

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      {/* Input panel */}
      <div className="space-y-6 lg:col-span-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            Your Situation
          </h2>

          <div className="space-y-4">
            <InputField
              id="monthly-expenses"
              label="Monthly Essential Expenses"
              value={expensesInput}
              onChange={setExpensesInput}
              prefix="$"
              placeholder="4,000"
              helpText="Housing, utilities, groceries, transport, insurance, debt minimums"
            />

            <InputField
              id="current-savings"
              label="Current Emergency Savings"
              value={savingsInput}
              onChange={setSavingsInput}
              prefix="$"
              placeholder="5,000"
              helpText="Amount you already have set aside for emergencies"
            />

            <InputField
              id="monthly-saving"
              label="Monthly Savings Toward Fund"
              value={monthlyInput}
              onChange={setMonthlyInput}
              prefix="$"
              placeholder="500"
              helpText="How much you can save each month"
            />

            <SelectField
              id="income-stability"
              label="Income Stability"
              value={stabilityInput}
              onChange={setStabilityInput}
              options={stabilityOptions}
              helpText="How predictable is your income?"
            />

            <SelectField
              id="income-earners"
              label="Income Earners in Household"
              value={earnersInput}
              onChange={setEarnersInput}
              options={earnerOptions}
            />

            <SelectField
              id="dependents"
              label="Dependents"
              value={dependentsInput}
              onChange={setDependentsInput}
              options={dependentOptions}
            />

            <InputField
              id="savings-apy"
              label="Savings Account APY"
              value={apyInput}
              onChange={setApyInput}
              suffix="%"
              placeholder="4.5"
              helpText="Current high-yield savings accounts offer 4-5%"
            />
          </div>
        </div>
      </div>

      {/* Results panel */}
      <div className="lg:col-span-3">
        {result ? (
          <ResultSection result={result} />
        ) : (
          <div className="flex h-64 items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
            <p className="text-slate-500 dark:text-slate-400">
              Enter your monthly expenses to see your emergency fund plan
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Results Section ──────────────────────────────────────────────────

function ResultSection({ result }: { result: EmergencyFundResult }) {
  const {
    recommendedMonths,
    minMonths,
    maxMonths,
    targetAmount,
    minAmount,
    maxAmount,
    currentSavings,
    gap,
    progressPct,
    goalAlreadyMet,
    riskFactors,
    timeline,
  } = result;

  return (
    <div className="space-y-6">
      {/* Hero card */}
      <div className="rounded-2xl bg-gradient-to-br from-navy-800 to-navy-900 p-6 text-center text-white shadow-lg">
        {goalAlreadyMet ? (
          <>
            <p className="text-sm font-medium text-navy-200">Congratulations!</p>
            <p className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
              Emergency Fund Target Met
            </p>
            <p className="mt-2 text-sm text-navy-300">
              Your {formatCurrencyRound(currentSavings)} in savings covers your{' '}
              {formatCurrencyRound(targetAmount)} target ({recommendedMonths} months of expenses)
            </p>
          </>
        ) : (
          <>
            <p className="text-sm font-medium text-navy-200">Your emergency fund target</p>
            <p className="tabular-nums mt-1 text-4xl font-bold tracking-tight sm:text-5xl">
              {formatCurrencyRound(targetAmount)}
            </p>
            <p className="tabular-nums mt-2 text-sm text-navy-300">
              {recommendedMonths} months of expenses
            </p>
          </>
        )}
      </div>

      {/* Recommended range */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/50">
        <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
          Recommended Range
        </p>
        <div className="flex items-center justify-between">
          <div className="text-center">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Minimum</p>
            <p className="tabular-nums mt-1 text-lg font-bold text-slate-700 dark:text-slate-200">
              {formatCurrencyRound(minAmount)}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{minMonths} months</p>
          </div>
          <div className="mx-4 flex-1">
            <div className="relative h-2 rounded-full bg-slate-100 dark:bg-slate-700">
              <div
                className="absolute h-full rounded-full bg-gradient-to-r from-navy-400 to-navy-600"
                style={{
                  left: '0%',
                  width: '100%',
                }}
              />
              {/* Current position marker */}
              {currentSavings > 0 && (
                <div
                  className="absolute -top-1 h-4 w-4 rounded-full border-2 border-white bg-success-500 shadow dark:border-slate-800"
                  style={{
                    left: `${Math.min(100, Math.max(0, ((currentSavings - minAmount) / (maxAmount - minAmount)) * 100))}%`,
                    transform: 'translateX(-50%)',
                  }}
                  title={`Current: ${formatCurrencyRound(currentSavings)}`}
                />
              )}
            </div>
          </div>
          <div className="text-center">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Maximum</p>
            <p className="tabular-nums mt-1 text-lg font-bold text-slate-700 dark:text-slate-200">
              {formatCurrencyRound(maxAmount)}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{maxMonths} months</p>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/50">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Progress to Target
          </p>
          <p className="tabular-nums text-sm font-semibold text-navy-600 dark:text-navy-400">
            {progressPct.toFixed(1)}%
          </p>
        </div>
        <div className="h-4 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
          <div
            className="h-full rounded-full bg-gradient-to-r from-navy-500 to-navy-600 transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>{formatCurrencyRound(currentSavings)} saved</span>
          <span>{formatCurrencyRound(targetAmount)} target</span>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/50">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Target Amount
          </p>
          <p className="tabular-nums mt-1 text-lg font-bold text-navy-600 dark:text-navy-400">
            {formatCurrencyRound(targetAmount)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/50">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Current Savings
          </p>
          <p className="tabular-nums mt-1 text-lg font-bold text-sky-600 dark:text-sky-400">
            {formatCurrencyRound(currentSavings)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/50">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Gap to Fill
          </p>
          <p className="tabular-nums mt-1 text-lg font-bold text-success-600 dark:text-success-500">
            {formatCurrencyRound(gap)}
          </p>
        </div>
      </div>

      {/* Timeline to reach goal */}
      {!goalAlreadyMet && timeline.length > 0 && <TimelineSection timeline={timeline} />}

      {/* Risk factors */}
      <RiskFactorsSection riskFactors={riskFactors} />

      {/* HYSA note */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800/50 dark:bg-amber-900/20">
        <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
          Where to keep your emergency fund
        </p>
        <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
          Keep your emergency fund in a high-yield savings account (HYSA) for liquidity and FDIC
          protection. Do not invest emergency funds in stocks &mdash; the market can drop right when
          you need the money most.
        </p>
      </div>
    </div>
  );
}

// ─── Timeline Section ────────────────────────────────────────────────

function TimelineSection({ timeline }: { timeline: TimelineMilestone[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/50">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Timeline to Reach Goal
        </p>
      </div>
      <table className="tabular-nums w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-800/30">
            <th className="px-4 py-2.5 text-left font-medium text-slate-600 dark:text-slate-400">
              Milestone
            </th>
            <th className="px-4 py-2.5 text-right font-medium text-slate-600 dark:text-slate-400">
              Amount
            </th>
            <th className="px-4 py-2.5 text-right font-medium text-slate-600 dark:text-slate-400">
              Time
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {timeline.map((item) => {
            const years = item.months > 0 ? Math.floor(item.months / 12) : 0;
            const remainingMonths = item.months > 0 ? item.months % 12 : 0;
            let timeLabel: string;

            if (item.reached) {
              timeLabel = 'Already reached';
            } else if (item.months < 0) {
              timeLabel = 'Not reachable';
            } else if (years > 0 && remainingMonths > 0) {
              timeLabel = `${years}y ${remainingMonths}m`;
            } else if (years > 0) {
              timeLabel = `${years}y`;
            } else {
              timeLabel = `${remainingMonths}m`;
            }

            return (
              <tr key={item.label}>
                <td className="px-4 py-2.5 font-medium text-slate-700 dark:text-slate-300">
                  {item.label}
                </td>
                <td className="px-4 py-2.5 text-right text-slate-600 dark:text-slate-400">
                  {formatCurrencyRound(item.amount)}
                </td>
                <td className="px-4 py-2.5 text-right font-semibold text-navy-600 dark:text-navy-400">
                  {timeLabel}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Risk Factors Section ────────────────────────────────────────────

function RiskFactorsSection({ riskFactors }: { riskFactors: RiskFactor[] }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/50">
      <p className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
        Risk Factors Considered
      </p>
      <div className="space-y-2">
        {riskFactors.map((factor) => (
          <div key={factor.label} className="flex items-center justify-between">
            <span className="text-sm text-slate-600 dark:text-slate-400">{factor.label}</span>
            <span
              className={`text-sm font-medium ${
                factor.months > 0
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-success-600 dark:text-success-500'
              }`}
            >
              {factor.impact}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
