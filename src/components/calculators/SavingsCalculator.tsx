import { useState, useMemo, useCallback, useEffect } from 'react';
import { calculateCompoundInterest, type CompoundInterestResult } from '../../lib/finance-engine';
import { formatCurrency, formatCurrencyRound, formatNumber } from '../../lib/format-us';
import InputField from '../ui/InputField';
import SelectField from '../ui/SelectField';

// ─── Types ─────────────────────────────────────────────────────────────

interface SavingsGoalResult {
  monthsToGoal: number;
  totalContributions: number;
  totalInterest: number;
  finalBalance: number;
  goalAlreadyMet: boolean;
  milestones: { label: string; percent: number; months: number }[];
  requiredMonthly: { label: string; months: number; payment: number }[];
}

// ─── Helper: Calculate Required Monthly Payment ────────────────────────

function calcRequiredMonthly(
  futureValue: number,
  presentValue: number,
  annualRate: number,
  months: number
): number {
  if (months <= 0) return 0;
  const r = annualRate / 12;
  if (r === 0) return Math.max(0, (futureValue - presentValue) / months);
  const fvPV = presentValue * Math.pow(1 + r, months);
  if (fvPV >= futureValue) return 0; // current savings grow enough on their own
  const numerator = futureValue - fvPV;
  const denominator = (Math.pow(1 + r, months) - 1) / r;
  return Math.max(0, numerator / denominator);
}

export default function SavingsCalculator() {
  // ─── State ─────────────────────────────────────────────────────────
  const [goalInput, setGoalInput] = useState('50000');
  const [currentInput, setCurrentInput] = useState('5000');
  const [monthlyInput, setMonthlyInput] = useState('500');
  const [rateInput, setRateInput] = useState('4.5');

  // ─── URL State Sync ────────────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('goal')) setGoalInput(params.get('goal')!);
    if (params.get('current')) setCurrentInput(params.get('current')!);
    if (params.get('monthly')) setMonthlyInput(params.get('monthly')!);
    if (params.get('rate')) setRateInput(params.get('rate')!);
  }, []);

  // Update URL when inputs change
  const updateUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (goalInput && goalInput !== '50000') params.set('goal', goalInput);
    if (currentInput && currentInput !== '5000') params.set('current', currentInput);
    if (monthlyInput && monthlyInput !== '500') params.set('monthly', monthlyInput);
    if (rateInput && rateInput !== '4.5') params.set('rate', rateInput);

    const newUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;

    window.history.replaceState({}, '', newUrl);
  }, [goalInput, currentInput, monthlyInput, rateInput]);

  useEffect(() => {
    updateUrl();
  }, [updateUrl]);

  // ─── Calculation ───────────────────────────────────────────────────
  const result = useMemo<SavingsGoalResult | null>(() => {
    const goal = Number(goalInput.replace(/[^0-9.]/g, ''));
    const current = Number(currentInput.replace(/[^0-9.]/g, ''));
    const monthly = Number(monthlyInput.replace(/[^0-9.]/g, ''));
    const rate = Number(rateInput.replace(/[^0-9.]/g, ''));

    if (isNaN(goal) || isNaN(current) || isNaN(monthly) || isNaN(rate)) return null;
    if (goal <= 0) return null;
    if (current < 0 || monthly < 0 || rate < 0) return null;

    const annualRate = rate / 100;
    const monthlyRate = annualRate / 12;

    // Check if goal is already met
    if (current >= goal) {
      return {
        monthsToGoal: 0,
        totalContributions: current,
        totalInterest: 0,
        finalBalance: current,
        goalAlreadyMet: true,
        milestones: [],
        requiredMonthly: [],
      };
    }

    // Simulate month by month until balance >= goal (cap at 600 months / 50 years)
    let balance = current;
    let totalContributions = current;
    let totalInterest = 0;
    let months = 0;

    const milestoneTargets = [
      { label: '25%', percent: 0.25, months: 0, hit: false },
      { label: '50%', percent: 0.5, months: 0, hit: false },
      { label: '75%', percent: 0.75, months: 0, hit: false },
      { label: '100%', percent: 1.0, months: 0, hit: false },
    ];

    // If monthly contribution is 0 and rate is 0, goal can never be reached
    if (monthly === 0 && monthlyRate === 0) return null;

    while (balance < goal && months < 600) {
      const interest = balance * monthlyRate;
      balance += interest + monthly;
      totalInterest += interest;
      totalContributions += monthly;
      months++;

      // Check milestones
      for (const ms of milestoneTargets) {
        if (!ms.hit && balance >= goal * ms.percent) {
          ms.months = months;
          ms.hit = true;
        }
      }
    }

    if (months >= 600) return null; // Goal unreachable in reasonable time

    // Calculate required monthly for common timeframes
    const timeframes = [
      { label: '1 year', months: 12 },
      { label: '2 years', months: 24 },
      { label: '3 years', months: 36 },
      { label: '5 years', months: 60 },
    ];

    const requiredMonthly = timeframes.map((tf) => ({
      label: tf.label,
      months: tf.months,
      payment: calcRequiredMonthly(goal, current, annualRate, tf.months),
    }));

    return {
      monthsToGoal: months,
      totalContributions,
      totalInterest,
      finalBalance: balance,
      goalAlreadyMet: false,
      milestones: milestoneTargets
        .filter((ms) => ms.hit)
        .map((ms) => ({ label: ms.label, percent: ms.percent, months: ms.months })),
      requiredMonthly,
    };
  }, [goalInput, currentInput, monthlyInput, rateInput]);

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      {/* Input panel */}
      <div className="space-y-6 lg:col-span-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            Your Savings Goal
          </h2>

          <div className="space-y-4">
            <InputField
              id="savings-goal"
              label="Savings Goal"
              value={goalInput}
              onChange={setGoalInput}
              prefix="$"
              placeholder="50,000"
              helpText="The total amount you want to save"
            />

            <InputField
              id="current-savings"
              label="Current Savings"
              value={currentInput}
              onChange={setCurrentInput}
              prefix="$"
              placeholder="5,000"
              helpText="How much you already have saved"
            />

            <InputField
              id="monthly-contribution"
              label="Monthly Contribution"
              value={monthlyInput}
              onChange={setMonthlyInput}
              prefix="$"
              placeholder="500"
              helpText="Amount you plan to save each month"
            />

            <InputField
              id="annual-rate"
              label="Annual Interest Rate"
              value={rateInput}
              onChange={setRateInput}
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
          <ResultSection result={result} goal={Number(goalInput.replace(/[^0-9.]/g, ''))} currentSavings={Number(currentInput.replace(/[^0-9.]/g, ''))} />
        ) : (
          <div className="flex h-64 items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
            <p className="text-slate-500 dark:text-slate-400">
              Enter your savings goal to see your plan
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Results Section ──────────────────────────────────────────────────

function ResultSection({
  result,
  goal,
  currentSavings,
}: {
  result: SavingsGoalResult;
  goal: number;
  currentSavings: number;
}) {
  const { monthsToGoal, totalContributions, totalInterest, goalAlreadyMet, milestones, requiredMonthly } = result;

  const years = Math.floor(monthsToGoal / 12);
  const remainingMonths = monthsToGoal % 12;

  const progressPct = goal > 0 ? Math.min(100, (currentSavings / goal) * 100) : 0;
  const contributionsNeeded = totalContributions - currentSavings;

  return (
    <div className="space-y-6">
      {/* Big hero card */}
      <div className="rounded-2xl bg-gradient-to-br from-navy-800 to-navy-900 p-6 text-center text-white shadow-lg">
        {goalAlreadyMet ? (
          <>
            <p className="text-sm font-medium text-navy-200">Congratulations!</p>
            <p className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
              Goal Already Reached
            </p>
            <p className="mt-2 text-sm text-navy-300">
              Your current savings of {formatCurrencyRound(currentSavings)} meet your {formatCurrencyRound(goal)} goal
            </p>
          </>
        ) : (
          <>
            <p className="text-sm font-medium text-navy-200">You'll reach your goal in</p>
            <p className="tabular-nums mt-1 text-4xl font-bold tracking-tight sm:text-5xl">
              {years > 0 && <>{years} {years === 1 ? 'year' : 'years'}</>}
              {years > 0 && remainingMonths > 0 && ', '}
              {remainingMonths > 0 && <>{remainingMonths} {remainingMonths === 1 ? 'month' : 'months'}</>}
              {years === 0 && remainingMonths === 0 && 'less than 1 month'}
            </p>
            <p className="tabular-nums mt-2 text-sm text-navy-300">
              {formatCurrencyRound(goal)} goal &middot; {monthsToGoal} total months
            </p>
          </>
        )}
      </div>

      {!goalAlreadyMet && (
        <>
          {/* Progress bar */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/50">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Progress to Goal
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
              <span>{formatCurrencyRound(goal)} goal</span>
            </div>
          </div>

          {/* Breakdown cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/50">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Current Savings
              </p>
              <p className="tabular-nums mt-1 text-lg font-bold text-navy-600 dark:text-navy-400">
                {formatCurrencyRound(currentSavings)}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/50">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Contributions
              </p>
              <p className="tabular-nums mt-1 text-lg font-bold text-sky-600 dark:text-sky-400">
                {formatCurrencyRound(contributionsNeeded)}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/50">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Interest Earned
              </p>
              <p className="tabular-nums mt-1 text-lg font-bold text-success-600 dark:text-success-500">
                {formatCurrencyRound(totalInterest)}
              </p>
            </div>
          </div>

          {/* Breakdown bar */}
          <BreakdownBar
            currentSavings={currentSavings}
            contributions={contributionsNeeded}
            interest={totalInterest}
            goal={goal}
          />

          {/* Required monthly savings table */}
          <RequiredMonthlyTable requiredMonthly={requiredMonthly} />

          {/* Milestone markers */}
          {milestones.length > 0 && <MilestoneList milestones={milestones} />}
        </>
      )}
    </div>
  );
}

// ─── Breakdown Bar ────────────────────────────────────────────────────

function BreakdownBar({
  currentSavings,
  contributions,
  interest,
  goal,
}: {
  currentSavings: number;
  contributions: number;
  interest: number;
  goal: number;
}) {
  if (goal <= 0) return null;

  const total = currentSavings + contributions + interest;
  const currentPct = (currentSavings / total) * 100;
  const contribPct = (contributions / total) * 100;
  const interestPct = (interest / total) * 100;

  return (
    <div className="space-y-2">
      <div className="flex h-6 overflow-hidden rounded-full">
        <div
          className="bg-navy-500 transition-all duration-300"
          style={{ width: `${currentPct}%` }}
          title={`Current Savings: ${formatCurrencyRound(currentSavings)}`}
        />
        <div
          className="bg-sky-400 transition-all duration-300"
          style={{ width: `${contribPct}%` }}
          title={`Contributions: ${formatCurrencyRound(contributions)}`}
        />
        <div
          className="bg-success-500 transition-all duration-300"
          style={{ width: `${interestPct}%` }}
          title={`Interest: ${formatCurrencyRound(interest)}`}
        />
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-navy-500" />
          <span className="text-xs text-slate-600 dark:text-slate-400">
            Current Savings: {formatCurrencyRound(currentSavings)}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-sky-400" />
          <span className="text-xs text-slate-600 dark:text-slate-400">
            Contributions: {formatCurrencyRound(contributions)}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-success-500" />
          <span className="text-xs text-slate-600 dark:text-slate-400">
            Interest: {formatCurrencyRound(interest)}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Required Monthly Savings Table ───────────────────────────────────

function RequiredMonthlyTable({
  requiredMonthly,
}: {
  requiredMonthly: SavingsGoalResult['requiredMonthly'];
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/50">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Required Monthly Savings by Timeframe
        </p>
      </div>
      <table className="tabular-nums w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-800/30">
            <th className="px-4 py-2.5 text-left font-medium text-slate-600 dark:text-slate-400">
              Timeframe
            </th>
            <th className="px-4 py-2.5 text-right font-medium text-slate-600 dark:text-slate-400">
              Monthly Savings
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {requiredMonthly.map((item) => (
            <tr key={item.label}>
              <td className="px-4 py-2.5 font-medium text-slate-700 dark:text-slate-300">
                {item.label}
              </td>
              <td className="px-4 py-2.5 text-right font-semibold text-navy-600 dark:text-navy-400">
                {formatCurrency(item.payment)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Milestone List ───────────────────────────────────────────────────

function MilestoneList({
  milestones,
}: {
  milestones: SavingsGoalResult['milestones'];
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/50">
      <p className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
        Savings Milestones
      </p>
      <div className="space-y-3">
        {milestones.map((ms) => {
          const msYears = Math.floor(ms.months / 12);
          const msMonths = ms.months % 12;
          const timeLabel =
            msYears > 0 && msMonths > 0
              ? `${msYears}y ${msMonths}m`
              : msYears > 0
                ? `${msYears}y`
                : `${msMonths}m`;

          return (
            <div key={ms.label} className="flex items-center gap-3">
              <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-navy-400 to-navy-600 transition-all duration-300"
                  style={{ width: `${ms.percent * 100}%` }}
                />
              </div>
              <div className="flex w-28 items-center justify-between">
                <span className="text-xs font-semibold text-navy-600 dark:text-navy-400">
                  {ms.label}
                </span>
                <span className="tabular-nums text-xs text-slate-500 dark:text-slate-400">
                  {timeLabel}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
