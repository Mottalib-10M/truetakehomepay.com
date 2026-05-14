import { useState, useMemo, useCallback, useEffect } from 'react';
import { formatCurrency, formatCurrencyRound, formatNumber } from '../../lib/format-us';
import InputField from '../ui/InputField';
import SelectField from '../ui/SelectField';

// ─── Types ─────────────────────────────────────────────────────────────

interface YearRow {
  year: number;
  buyCumulativeCost: number;
  buyEquity: number;
  rentCumulativeCost: number;
  rentInvestmentValue: number;
}

interface RentVsBuyResult {
  buyingIsCheaper: boolean;
  difference: number;
  breakEvenYear: number | null;
  totalMortgagePayments: number;
  totalPropertyTax: number;
  totalInsurance: number;
  totalMaintenance: number;
  closingCosts: number;
  homeValueEnd: number;
  remainingBalance: number;
  equityBuilt: number;
  buyNetCost: number;
  totalRent: number;
  totalRenterInsurance: number;
  investmentGrowth: number;
  rentNetCost: number;
  buyTotalPayments: number;
  rentTotalPayments: number;
  yearByYear: YearRow[];
}

// ─── Constants ──────────────────────────────────────────────────────────

const LOAN_TERM_OPTIONS = [
  { value: '30', label: '30 years' },
  { value: '15', label: '15 years' },
];

const MONTHLY_HOMEOWNER_INSURANCE = 150;

// ─── Component ──────────────────────────────────────────────────────────

export default function RentVsBuyCalculator() {
  // ─── State ─────────────────────────────────────────────────────────
  // Buying
  const [homePrice, setHomePrice] = useState('400000');
  const [downPaymentPct, setDownPaymentPct] = useState('20');
  const [mortgageRate, setMortgageRate] = useState('6.5');
  const [loanTerm, setLoanTerm] = useState('30');
  const [propertyTaxRate, setPropertyTaxRate] = useState('1.1');
  const [maintenancePct, setMaintenancePct] = useState('1');
  const [appreciationRate, setAppreciationRate] = useState('3');

  // Renting
  const [monthlyRent, setMonthlyRent] = useState('2000');
  const [rentIncrease, setRentIncrease] = useState('3');
  const [renterInsurance, setRenterInsurance] = useState('25');

  // Timeline
  const [yearsToCompare, setYearsToCompare] = useState('10');
  const [investmentReturn, setInvestmentReturn] = useState('7');

  // ─── URL State Sync ────────────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('price')) setHomePrice(params.get('price')!);
    if (params.get('down')) setDownPaymentPct(params.get('down')!);
    if (params.get('mrate')) setMortgageRate(params.get('mrate')!);
    if (params.get('term')) setLoanTerm(params.get('term')!);
    if (params.get('ptax')) setPropertyTaxRate(params.get('ptax')!);
    if (params.get('maint')) setMaintenancePct(params.get('maint')!);
    if (params.get('appr')) setAppreciationRate(params.get('appr')!);
    if (params.get('rent')) setMonthlyRent(params.get('rent')!);
    if (params.get('rinc')) setRentIncrease(params.get('rinc')!);
    if (params.get('rins')) setRenterInsurance(params.get('rins')!);
    if (params.get('years')) setYearsToCompare(params.get('years')!);
    if (params.get('inv')) setInvestmentReturn(params.get('inv')!);
  }, []);

  const updateUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (homePrice && homePrice !== '400000') params.set('price', homePrice);
    if (downPaymentPct && downPaymentPct !== '20') params.set('down', downPaymentPct);
    if (mortgageRate && mortgageRate !== '6.5') params.set('mrate', mortgageRate);
    if (loanTerm !== '30') params.set('term', loanTerm);
    if (propertyTaxRate && propertyTaxRate !== '1.1') params.set('ptax', propertyTaxRate);
    if (maintenancePct && maintenancePct !== '1') params.set('maint', maintenancePct);
    if (appreciationRate && appreciationRate !== '3') params.set('appr', appreciationRate);
    if (monthlyRent && monthlyRent !== '2000') params.set('rent', monthlyRent);
    if (rentIncrease && rentIncrease !== '3') params.set('rinc', rentIncrease);
    if (renterInsurance && renterInsurance !== '25') params.set('rins', renterInsurance);
    if (yearsToCompare && yearsToCompare !== '10') params.set('years', yearsToCompare);
    if (investmentReturn && investmentReturn !== '7') params.set('inv', investmentReturn);

    const newUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;

    window.history.replaceState({}, '', newUrl);
  }, [homePrice, downPaymentPct, mortgageRate, loanTerm, propertyTaxRate, maintenancePct, appreciationRate, monthlyRent, rentIncrease, renterInsurance, yearsToCompare, investmentReturn]);

  useEffect(() => {
    updateUrl();
  }, [updateUrl]);

  // ─── Calculation ───────────────────────────────────────────────────
  const result = useMemo<RentVsBuyResult | null>(() => {
    const price = Number(homePrice.replace(/[^0-9.]/g, ''));
    const downPct = Number(downPaymentPct.replace(/[^0-9.]/g, '')) / 100;
    const mRate = Number(mortgageRate.replace(/[^0-9.]/g, '')) / 100;
    const term = Number(loanTerm);
    const pTaxRate = Number(propertyTaxRate.replace(/[^0-9.]/g, '')) / 100;
    const maintPct = Number(maintenancePct.replace(/[^0-9.]/g, '')) / 100;
    const apprRate = Number(appreciationRate.replace(/[^0-9.]/g, '')) / 100;
    const rent = Number(monthlyRent.replace(/[^0-9.]/g, ''));
    const rentInc = Number(rentIncrease.replace(/[^0-9.]/g, '')) / 100;
    const rIns = Number(renterInsurance.replace(/[^0-9.]/g, ''));
    const years = Number(yearsToCompare.replace(/[^0-9.]/g, ''));
    const invReturn = Number(investmentReturn.replace(/[^0-9.]/g, '')) / 100;

    if (isNaN(price) || price <= 0) return null;
    if (isNaN(rent) || rent <= 0) return null;
    if (isNaN(years) || years <= 0 || years > 50) return null;
    if (isNaN(mRate)) return null;

    const downPayment = price * downPct;
    const loanAmount = price - downPayment;
    const closingCosts = price * 0.03;

    // Monthly mortgage payment (P&I)
    const monthlyMortgageRate = mRate / 12;
    const totalPayments = term * 12;
    let monthlyMortgage = 0;
    if (monthlyMortgageRate > 0 && loanAmount > 0) {
      monthlyMortgage =
        (loanAmount * monthlyMortgageRate * Math.pow(1 + monthlyMortgageRate, totalPayments)) /
        (Math.pow(1 + monthlyMortgageRate, totalPayments) - 1);
    } else if (loanAmount > 0) {
      monthlyMortgage = loanAmount / totalPayments;
    }

    // Year-by-year simulation
    let mortgageBalance = loanAmount;
    let homeValue = price;
    let buyCumulativeCost = downPayment + closingCosts;
    let rentCumulativeCost = 0;
    let currentRent = rent;
    let investmentValue = downPayment; // renter invests the down payment
    let totalMortgagePayments = 0;
    let totalPropertyTax = 0;
    let totalInsurance = 0;
    let totalMaintenance = 0;
    let totalRentPaid = 0;
    let totalRenterInsurance = 0;
    let breakEvenYear: number | null = null;

    const yearByYear: YearRow[] = [];

    for (let y = 1; y <= years; y++) {
      // ── Buying: annual costs ──
      let annualMortgage = 0;
      let annualPropertyTax = homeValue * pTaxRate;
      let annualInsurance = MONTHLY_HOMEOWNER_INSURANCE * 12;
      let annualMaintenance = homeValue * maintPct;

      // Calculate mortgage payments and track balance month-by-month
      for (let m = 0; m < 12; m++) {
        if (mortgageBalance > 0) {
          const interestPayment = mortgageBalance * monthlyMortgageRate;
          const principalPayment = Math.min(monthlyMortgage - interestPayment, mortgageBalance);
          mortgageBalance = Math.max(0, mortgageBalance - principalPayment);
          annualMortgage += monthlyMortgage;
        }
      }

      totalMortgagePayments += annualMortgage;
      totalPropertyTax += annualPropertyTax;
      totalInsurance += annualInsurance;
      totalMaintenance += annualMaintenance;

      buyCumulativeCost += annualMortgage + annualPropertyTax + annualInsurance + annualMaintenance;

      // Home appreciation (at end of year)
      homeValue *= 1 + apprRate;

      // ── Renting: annual costs ──
      let annualRent = 0;
      for (let m = 0; m < 12; m++) {
        annualRent += currentRent;
      }
      let annualRenterIns = rIns * 12;
      totalRentPaid += annualRent;
      totalRenterInsurance += annualRenterIns;

      rentCumulativeCost += annualRent + annualRenterIns;

      // Investment growth (down payment invested; monthly return applied)
      const monthlyInvReturn = invReturn / 12;
      for (let m = 0; m < 12; m++) {
        investmentValue *= 1 + monthlyInvReturn;
      }

      // Rent increase at end of year (applies next year)
      currentRent *= 1 + rentInc;

      // Calculate equity and net positions
      const equity = homeValue - mortgageBalance;
      const buyNetPosition = buyCumulativeCost - equity;
      const rentNetPosition = rentCumulativeCost - (investmentValue - downPayment);

      yearByYear.push({
        year: y,
        buyCumulativeCost,
        buyEquity: equity,
        rentCumulativeCost,
        rentInvestmentValue: investmentValue,
      });

      // Track break-even: first year buying becomes cheaper
      if (breakEvenYear === null && buyNetPosition <= rentNetPosition) {
        breakEvenYear = y;
      }
    }

    const equityBuilt = homeValue - mortgageBalance;
    const buyNetCost = buyCumulativeCost - equityBuilt;
    const investmentGains = investmentValue - downPayment;
    const rentNetCost = rentCumulativeCost - investmentGains;

    const buyingIsCheaper = buyNetCost < rentNetCost;
    const difference = Math.abs(buyNetCost - rentNetCost);

    return {
      buyingIsCheaper,
      difference,
      breakEvenYear,
      totalMortgagePayments,
      totalPropertyTax,
      totalInsurance,
      totalMaintenance,
      closingCosts,
      homeValueEnd: homeValue,
      remainingBalance: mortgageBalance,
      equityBuilt,
      buyNetCost,
      totalRent: totalRentPaid,
      totalRenterInsurance,
      investmentGrowth: investmentValue,
      rentNetCost,
      buyTotalPayments: buyCumulativeCost,
      rentTotalPayments: rentCumulativeCost,
      yearByYear,
    };
  }, [homePrice, downPaymentPct, mortgageRate, loanTerm, propertyTaxRate, maintenancePct, appreciationRate, monthlyRent, rentIncrease, renterInsurance, yearsToCompare, investmentReturn]);

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      {/* Input panel */}
      <div className="space-y-6 lg:col-span-2">
        {/* Buying inputs */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            Buying Details
          </h2>
          <div className="space-y-4">
            <InputField
              id="home-price"
              label="Home Price"
              value={homePrice}
              onChange={setHomePrice}
              prefix="$"
              placeholder="400,000"
              helpText="Purchase price of the home"
            />
            <InputField
              id="down-payment-pct"
              label="Down Payment"
              value={downPaymentPct}
              onChange={setDownPaymentPct}
              suffix="%"
              placeholder="20"
              helpText="Percentage of home price"
            />
            <InputField
              id="mortgage-rate"
              label="Mortgage Rate"
              value={mortgageRate}
              onChange={setMortgageRate}
              suffix="%"
              placeholder="6.5"
              helpText="Annual interest rate"
            />
            <SelectField
              id="loan-term"
              label="Loan Term"
              value={loanTerm}
              onChange={setLoanTerm}
              options={LOAN_TERM_OPTIONS}
            />
            <InputField
              id="property-tax-rate"
              label="Property Tax Rate"
              value={propertyTaxRate}
              onChange={setPropertyTaxRate}
              suffix="%"
              placeholder="1.1"
              helpText="Annual rate as % of home value"
            />
            <InputField
              id="maintenance-pct"
              label="Annual Maintenance"
              value={maintenancePct}
              onChange={setMaintenancePct}
              suffix="%"
              placeholder="1"
              helpText="Annual maintenance as % of home value"
            />
            <InputField
              id="appreciation-rate"
              label="Home Appreciation"
              value={appreciationRate}
              onChange={setAppreciationRate}
              suffix="%"
              placeholder="3"
              helpText="Expected annual home value increase"
            />
          </div>
        </div>

        {/* Renting inputs */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            Renting Details
          </h2>
          <div className="space-y-4">
            <InputField
              id="monthly-rent"
              label="Monthly Rent"
              value={monthlyRent}
              onChange={setMonthlyRent}
              prefix="$"
              placeholder="2,000"
              helpText="Current monthly rent payment"
            />
            <InputField
              id="rent-increase"
              label="Annual Rent Increase"
              value={rentIncrease}
              onChange={setRentIncrease}
              suffix="%"
              placeholder="3"
              helpText="Expected yearly rent increase"
            />
            <InputField
              id="renter-insurance"
              label="Renter's Insurance"
              value={renterInsurance}
              onChange={setRenterInsurance}
              prefix="$"
              suffix="/mo"
              placeholder="25"
              helpText="Monthly renter's insurance cost"
            />
          </div>
        </div>

        {/* Timeline inputs */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            Timeline & Investment
          </h2>
          <div className="space-y-4">
            <InputField
              id="years-to-compare"
              label="Years to Compare"
              value={yearsToCompare}
              onChange={setYearsToCompare}
              suffix="years"
              placeholder="10"
              helpText="How long you plan to stay"
            />
            <InputField
              id="investment-return"
              label="Investment Return Rate"
              value={investmentReturn}
              onChange={setInvestmentReturn}
              suffix="%"
              placeholder="7"
              helpText="Expected annual return if down payment is invested instead"
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
              Enter your details to compare renting vs buying
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Results Section ──────────────────────────────────────────────────

function ResultSection({ result }: { result: RentVsBuyResult }) {
  const {
    buyingIsCheaper,
    difference,
    breakEvenYear,
    totalMortgagePayments,
    totalPropertyTax,
    totalInsurance,
    totalMaintenance,
    closingCosts,
    homeValueEnd,
    remainingBalance,
    equityBuilt,
    buyNetCost,
    totalRent,
    totalRenterInsurance,
    investmentGrowth,
    rentNetCost,
    buyTotalPayments,
    rentTotalPayments,
    yearByYear,
  } = result;

  const years = yearByYear.length;
  const showEveryOther = years > 15;

  return (
    <div className="space-y-6">
      {/* Hero card */}
      <div
        className={`rounded-2xl p-6 text-center text-white shadow-lg ${
          buyingIsCheaper
            ? 'bg-gradient-to-br from-success-600 to-success-700'
            : 'bg-gradient-to-br from-navy-800 to-navy-900'
        }`}
      >
        <p className={`text-sm font-medium ${buyingIsCheaper ? 'text-success-100' : 'text-navy-200'}`}>
          Over {years} {years === 1 ? 'year' : 'years'}
        </p>
        <p className="tabular-nums mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
          {buyingIsCheaper ? 'Buying' : 'Renting'} is cheaper by {formatCurrencyRound(difference)}
        </p>
        {breakEvenYear !== null && (
          <p className={`mt-2 text-sm ${buyingIsCheaper ? 'text-success-100' : 'text-navy-300'}`}>
            Buying breaks even at year {breakEvenYear}
          </p>
        )}
        {breakEvenYear === null && !buyingIsCheaper && (
          <p className="mt-2 text-sm text-navy-300">
            Buying does not break even within {years} {years === 1 ? 'year' : 'years'}
          </p>
        )}
      </div>

      {/* Side-by-side comparison table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
        <table className="tabular-nums w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
              <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-400" />
              <th className="px-4 py-3 text-right font-medium text-slate-600 dark:text-slate-400">
                Buying
              </th>
              <th className="px-4 py-3 text-right font-medium text-slate-600 dark:text-slate-400">
                Renting
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            <ComparisonRow
              label="Total Housing Cost"
              buyValue={buyTotalPayments}
              rentValue={rentTotalPayments}
            />
            <ComparisonRow
              label="Total Payments Made"
              buyValue={totalMortgagePayments + totalPropertyTax + totalInsurance + totalMaintenance + closingCosts}
              rentValue={totalRent + totalRenterInsurance}
            />
            <ComparisonRow
              label="Equity / Investment Value"
              buyValue={equityBuilt}
              rentValue={investmentGrowth}
              isPositive
            />
            <tr className="bg-slate-50/50 dark:bg-slate-800/30">
              <td className="px-4 py-2.5 font-semibold text-slate-700 dark:text-slate-300">
                Net Cost
              </td>
              <td
                className={`px-4 py-2.5 text-right font-bold ${
                  buyingIsCheaper
                    ? 'text-success-600 dark:text-success-500'
                    : 'text-slate-900 dark:text-slate-100'
                }`}
              >
                {formatCurrencyRound(buyNetCost)}
              </td>
              <td
                className={`px-4 py-2.5 text-right font-bold ${
                  !buyingIsCheaper
                    ? 'text-success-600 dark:text-success-500'
                    : 'text-slate-900 dark:text-slate-100'
                }`}
              >
                {formatCurrencyRound(rentNetCost)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Buying breakdown */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard label="Home Value (End)" value={formatCurrencyRound(homeValueEnd)} />
        <StatCard label="Equity Built" value={formatCurrencyRound(equityBuilt)} />
        <StatCard label="Remaining Balance" value={formatCurrencyRound(remainingBalance)} />
        <StatCard label="Mortgage Payments" value={formatCurrencyRound(totalMortgagePayments)} />
        <StatCard label="Property Tax" value={formatCurrencyRound(totalPropertyTax)} />
        <StatCard label="Closing Costs" value={formatCurrencyRound(closingCosts)} />
      </div>

      {/* Year-by-year table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/50">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Year-by-Year Comparison
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="tabular-nums w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-800/30">
                <th className="whitespace-nowrap px-3 py-2.5 text-left font-medium text-slate-600 dark:text-slate-400">
                  Year
                </th>
                <th className="whitespace-nowrap px-3 py-2.5 text-right font-medium text-slate-600 dark:text-slate-400">
                  Buy: Cost
                </th>
                <th className="whitespace-nowrap px-3 py-2.5 text-right font-medium text-slate-600 dark:text-slate-400">
                  Buy: Equity
                </th>
                <th className="whitespace-nowrap px-3 py-2.5 text-right font-medium text-slate-600 dark:text-slate-400">
                  Rent: Cost
                </th>
                <th className="whitespace-nowrap px-3 py-2.5 text-right font-medium text-slate-600 dark:text-slate-400">
                  Rent: Investment
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {yearByYear
                .filter((row) => !showEveryOther || row.year % 2 === 0 || row.year === 1 || row.year === years)
                .map((row) => (
                  <tr
                    key={row.year}
                    className={
                      breakEvenYear === row.year
                        ? 'bg-success-50/50 dark:bg-success-900/10'
                        : ''
                    }
                  >
                    <td className="whitespace-nowrap px-3 py-2 font-medium text-slate-700 dark:text-slate-300">
                      {row.year}
                      {breakEvenYear === row.year && (
                        <span className="ml-1.5 text-xs font-semibold text-success-600 dark:text-success-500">
                          Break-even
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-right text-slate-900 dark:text-slate-100">
                      {formatCurrencyRound(row.buyCumulativeCost)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-right text-navy-600 dark:text-navy-400">
                      {formatCurrencyRound(row.buyEquity)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-right text-slate-900 dark:text-slate-100">
                      {formatCurrencyRound(row.rentCumulativeCost)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-right text-sky-600 dark:text-sky-400">
                      {formatCurrencyRound(row.rentInvestmentValue)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Note */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/30">
        <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          <span className="font-semibold">Note:</span> This is a simplified comparison. Actual costs
          vary with location, tax benefits (mortgage interest deduction), HOA fees, and market
          conditions. Homeowner's insurance is estimated at $150/month. Closing costs are estimated
          at 3% of the purchase price.
        </p>
      </div>
    </div>
  );
}

// ─── Comparison Row ───────────────────────────────────────────────────

function ComparisonRow({
  label,
  buyValue,
  rentValue,
  isPositive = false,
}: {
  label: string;
  buyValue: number;
  rentValue: number;
  isPositive?: boolean;
}) {
  const textColor = isPositive
    ? 'text-navy-600 dark:text-navy-400'
    : 'text-slate-900 dark:text-slate-100';

  return (
    <tr>
      <td className="px-4 py-2.5 font-medium text-slate-700 dark:text-slate-300">{label}</td>
      <td className={`px-4 py-2.5 text-right font-medium ${textColor}`}>
        {formatCurrencyRound(buyValue)}
      </td>
      <td className={`px-4 py-2.5 text-right font-medium ${textColor}`}>
        {formatCurrencyRound(rentValue)}
      </td>
    </tr>
  );
}

// ─── Stat Card ──────────────────────────────────────────────────────

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <p className="tabular-nums mt-1 text-lg font-bold text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}
