import { useState, useMemo, useCallback, useEffect } from 'react';
import { calculatePaycheck, type PaycheckInput, type PaycheckResult } from '../../lib/tax-engine';
import { getStateTaxConfig } from '../../data/income-tax-2026/index';
import { LOCAL_TAXES } from '../../data/local-income-tax-2026';
import { FILING_STATUSES, PAY_FREQUENCIES, type FilingStatus, type PayFrequency } from '../../lib/format-us';
import { getStatesArray } from '../../data/state-meta';
import InputField from '../ui/InputField';
import SelectField from '../ui/SelectField';
import ResultPanel from '../ui/ResultPanel';

interface PaycheckCalculatorProps {
  defaultState?: string;
  defaultGross?: number;
  defaultFilingStatus?: FilingStatus;
  defaultPayFrequency?: PayFrequency;
}

export default function PaycheckCalculator({
  defaultState = '',
  defaultGross,
  defaultFilingStatus = 'single',
  defaultPayFrequency = 'biweekly',
}: PaycheckCalculatorProps) {
  // ─── State ─────────────────────────────────────────────────────────
  const [grossInput, setGrossInput] = useState(defaultGross?.toString() ?? '60000');
  const [filingStatus, setFilingStatus] = useState<FilingStatus>(defaultFilingStatus);
  const [stateCode, setStateCode] = useState(defaultState);
  const [payFrequency, setPayFrequency] = useState<PayFrequency>(defaultPayFrequency);
  const [localTaxCode, setLocalTaxCode] = useState('');

  // Advanced options
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [traditional401k, setTraditional401k] = useState('0');
  const [roth401k, setRoth401k] = useState('0');
  const [hsa, setHsa] = useState('0');
  const [healthPremiums, setHealthPremiums] = useState('0');
  const [dependentsUnder17, setDependentsUnder17] = useState('0');
  const [otherDependents, setOtherDependents] = useState('0');
  const [additionalWithholding, setAdditionalWithholding] = useState('0');

  // ─── Valid values for URL param validation ────────────────────────
  const validStateCodes = useMemo(() => new Set(getStatesArray().map((s) => s.abbr)), []);
  const validFilingStatuses = useMemo(() => new Set(Object.keys(FILING_STATUSES) as FilingStatus[]), []);
  const validPayFrequencies = useMemo(() => new Set(Object.keys(PAY_FREQUENCIES) as PayFrequency[]), []);

  // ─── URL State Sync ────────────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const grossParam = params.get('gross');
    if (grossParam) {
      const cleaned = grossParam.replace(/[^0-9.]/g, '');
      if (cleaned && Number(cleaned) > 0) setGrossInput(cleaned);
    }

    const stateParam = params.get('state');
    if (stateParam && validStateCodes.has(stateParam.toUpperCase())) {
      setStateCode(stateParam.toUpperCase());
    }

    const filingParam = params.get('filing');
    if (filingParam && validFilingStatuses.has(filingParam as FilingStatus)) {
      setFilingStatus(filingParam as FilingStatus);
    }

    const periodParam = params.get('period');
    if (periodParam && validPayFrequencies.has(periodParam as PayFrequency)) {
      setPayFrequency(periodParam as PayFrequency);
    }

    const k401Param = params.get('401k');
    if (k401Param) {
      const cleaned = k401Param.replace(/[^0-9.]/g, '');
      if (cleaned && Number(cleaned) >= 0) setTraditional401k(cleaned);
    }

    const localParam = params.get('local');
    if (localParam && LOCAL_TAXES[localParam]) {
      setLocalTaxCode(localParam);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update URL when inputs change (skip params that match the page defaults)
  const defaultGrossStr = defaultGross?.toString() ?? '60000';
  const updateUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (grossInput && grossInput !== defaultGrossStr) params.set('gross', grossInput);
    if (stateCode && stateCode !== defaultState) params.set('state', stateCode);
    if (filingStatus !== 'single') params.set('filing', filingStatus);
    if (payFrequency !== 'biweekly') params.set('period', payFrequency);
    if (Number(traditional401k) > 0) params.set('401k', traditional401k);
    if (localTaxCode) params.set('local', localTaxCode);

    const newUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;

    window.history.replaceState({}, '', newUrl);
  }, [grossInput, defaultGrossStr, stateCode, defaultState, filingStatus, payFrequency, traditional401k, localTaxCode]);

  useEffect(() => {
    updateUrl();
  }, [updateUrl]);

  // ─── Calculation ───────────────────────────────────────────────────
  const result = useMemo<PaycheckResult | null>(() => {
    const grossAnnual = Number(grossInput.replace(/[^0-9.]/g, ''));
    if (isNaN(grossAnnual) || grossAnnual <= 0) return null;

    const stateConfig = stateCode ? getStateTaxConfig(stateCode) : null;
    const localConfig = localTaxCode ? LOCAL_TAXES[localTaxCode] ?? null : null;

    const input: PaycheckInput = {
      grossAnnual,
      filingStatus,
      state: stateCode,
      payFrequency,
      traditional401k: Number(traditional401k) || 0,
      roth401k: Number(roth401k) || 0,
      hsa: Number(hsa) || 0,
      healthPremiums: Number(healthPremiums) || 0,
      dependentsUnder17: Number(dependentsUnder17) || 0,
      otherDependents: Number(otherDependents) || 0,
      additionalWithholding: Number(additionalWithholding) || 0,
      localTaxCode,
    };

    return calculatePaycheck(input, stateConfig, localConfig);
  }, [grossInput, filingStatus, stateCode, payFrequency, traditional401k, roth401k, hsa, healthPremiums, dependentsUnder17, otherDependents, additionalWithholding, localTaxCode]);

  // ─── Options ───────────────────────────────────────────────────────
  const states = useMemo(() => getStatesArray(), []);
  const stateOptions = [
    { value: '', label: 'Select a state...' },
    ...states.map((s) => ({ value: s.code, label: s.name })),
  ];

  const filingOptions = Object.entries(FILING_STATUSES).map(([value, label]) => ({
    value,
    label,
  }));

  const frequencyOptions = Object.entries(PAY_FREQUENCIES).map(([value, { label }]) => ({
    value,
    label,
  }));

  // Local tax options (shown only for states with local taxes)
  const localTaxOptions = useMemo(() => {
    const stateLocals = Object.entries(LOCAL_TAXES).filter(([key]) => {
      if (stateCode === 'NY' && (key === 'nyc' || key === 'yonkers')) return true;
      if (stateCode === 'PA' && (key === 'philadelphia-resident' || key === 'philadelphia-nonresident')) return true;
      if (stateCode === 'MI' && (key === 'detroit-resident' || key === 'detroit-nonresident')) return true;
      if (stateCode === 'MD' && key.startsWith('md-')) return true;
      return false;
    });

    if (stateLocals.length === 0) return null;

    return [
      { value: '', label: 'None' },
      ...stateLocals.map(([key, config]) => ({
        value: key,
        label: config.name,
      })),
    ];
  }, [stateCode]);

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      {/* Input panel */}
      <div className="space-y-6 lg:col-span-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            Your Paycheck Details
          </h2>

          <div className="space-y-4">
            <InputField
              id="gross-income"
              label="Annual Gross Salary"
              value={grossInput}
              onChange={setGrossInput}
              prefix="$"
              placeholder="60,000"
              helpText="Your total annual salary before taxes"
            />

            <SelectField
              id="state"
              label="State"
              value={stateCode}
              onChange={(v) => { setStateCode(v); setLocalTaxCode(''); }}
              options={stateOptions}
            />

            {localTaxOptions && (
              <SelectField
                id="local-tax"
                label="City/Local Tax"
                value={localTaxCode}
                onChange={setLocalTaxCode}
                options={localTaxOptions}
              />
            )}

            <SelectField
              id="filing-status"
              label="Filing Status"
              value={filingStatus}
              onChange={(v) => setFilingStatus(v as FilingStatus)}
              options={filingOptions}
            />

            <SelectField
              id="pay-frequency"
              label="Pay Frequency"
              value={payFrequency}
              onChange={(v) => setPayFrequency(v as PayFrequency)}
              options={frequencyOptions}
              helpText="Most US workers are paid bi-weekly (every 2 weeks)"
            />
          </div>

          {/* Advanced toggle */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="mt-6 flex w-full items-center justify-between rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700/50"
          >
            <span>Deductions &amp; W-4 Options</span>
            <svg
              className={`h-4 w-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showAdvanced && (
            <div className="mt-4 space-y-4 border-t border-slate-100 pt-4 dark:border-slate-700">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Pre-Tax Deductions (Annual)
              </p>

              <InputField
                id="traditional-401k"
                label="401(k) Traditional"
                value={traditional401k}
                onChange={setTraditional401k}
                prefix="$"
                placeholder="0"
                helpText="Reduces federal + state tax, NOT FICA"
              />

              <InputField
                id="roth-401k"
                label="Roth 401(k)"
                value={roth401k}
                onChange={setRoth401k}
                prefix="$"
                placeholder="0"
                helpText="Post-tax — no tax reduction"
              />

              <InputField
                id="hsa"
                label="HSA Contribution"
                value={hsa}
                onChange={setHsa}
                prefix="$"
                placeholder="0"
                helpText="Reduces federal + state + FICA"
              />

              <InputField
                id="health-premiums"
                label="Health Insurance Premiums"
                value={healthPremiums}
                onChange={setHealthPremiums}
                prefix="$"
                placeholder="0"
                helpText="Section 125 pre-tax premiums"
              />

              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                W-4 Dependents
              </p>

              <InputField
                id="dependents-under-17"
                label="Children Under 17"
                value={dependentsUnder17}
                onChange={setDependentsUnder17}
                type="number"
                min={0}
                max={20}
                helpText="$2,000 credit per child"
              />

              <InputField
                id="other-dependents"
                label="Other Dependents"
                value={otherDependents}
                onChange={setOtherDependents}
                type="number"
                min={0}
                max={20}
                helpText="$500 credit per dependent"
              />

              <InputField
                id="additional-withholding"
                label="Additional Withholding (per period)"
                value={additionalWithholding}
                onChange={setAdditionalWithholding}
                prefix="$"
                placeholder="0"
                helpText="W-4 Step 4(c) extra amount per paycheck"
              />
            </div>
          )}
        </div>
      </div>

      {/* Results panel */}
      <div className="lg:col-span-3">
        {result ? (
          <ResultPanel result={result} />
        ) : (
          <div className="flex h-64 items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
            <p className="text-slate-500 dark:text-slate-400">
              Enter your salary to see your take-home pay
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
