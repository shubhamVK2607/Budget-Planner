import { useRef, useState } from "react";
import type { FixedItem, MonthBudget } from "../../shared/types";
import {
  getAutoDailyLimit,
  getDailyLimit,
  getExtraBudget,
  getPool,
  getRegularBudget,
} from "../budget/budget";
import { rupee, digits } from "../../shared/utils/format";
import { FIXED_SUGGESTIONS } from "./fixedSuggestions";
import IncomeStep from "./IncomeStep";

type Props = {
  month: string;
  initial?: MonthBudget;
  onDone: (budget: MonthBudget) => void;
  onCancel?: () => void;
};

const inputCls =
  "w-full rounded-xl border border-slate-300 px-4 py-3 text-lg outline-none focus:border-indigo-500";
const btnCls =
  "mt-auto w-full rounded-xl bg-indigo-600 py-4 text-lg font-semibold text-white disabled:bg-slate-300";

export default function SetupScreen({
  month,
  initial,
  onDone,
  onCancel,
}: Props) {
  const [step, setStep] = useState(1);
  const [income, setIncome] = useState(initial ? String(initial.income) : "");
  const [fixedItems, setFixedItems] = useState<FixedItem[]>(
    initial?.fixedItems ?? [],
  );
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState<"auto" | "manual">(
    initial?.dailyLimitMode ?? "auto",
  );
  const [manual, setManual] = useState(
    initial?.manualDailyLimit ? String(initial.manualDailyLimit) : "",
  );
  const [extraMode, setExtraMode] = useState<"percent" | "amount">(
    initial?.extraMode ?? "percent",
  );
  const [extraValue, setExtraValue] = useState(
    initial ? String(initial.extraValue ?? 0) : "20",
  );
  const amountRef = useRef<HTMLInputElement>(null);

  // Jo entry type ho chuki hai par abhi "Add" nahi hui
  const trimmedName = name.trim();
  const pendingItem: FixedItem | null =
    trimmedName && Number(amount) > 0
      ? { id: "pending", name: trimmedName, amount: Number(amount) }
      : null;
  const allFixed = pendingItem ? [...fixedItems, pendingItem] : fixedItems;

  const draft: MonthBudget = {
    month,
    income: Number(income) || 0,
    fixedItems: allFixed,
    dailyLimitMode: mode,
    manualDailyLimit: manual ? Number(manual) : undefined,
    extraMode,
    extraValue: Number(extraValue) || 0,
  };
  const pool = getPool(draft);
  const maxDailyLimit = getAutoDailyLimit(draft);
  const extraBudget = getExtraBudget(draft);
  const regularBudget = getRegularBudget(draft);
  const dailyLimit = getDailyLimit(draft);

  const manualInvalid =
    mode === "manual" && (!Number(manual) || Number(manual) > maxDailyLimit);
  const extraInvalid =
    mode === "auto" &&
    ((extraMode === "percent" && Number(extraValue) > 100) ||
      (extraMode === "amount" && Number(extraValue) > pool));

  // Pending entry ko list me pakka save karta hai
  const commitPending = () => {
    if (!pendingItem) return;
    setFixedItems([...fixedItems, { ...pendingItem, id: crypto.randomUUID() }]);
    setName("");
    setAmount("");
  };

  const goToStep3 = () => {
    commitPending();
    setStep(3);
  };

  const availableSuggestions = FIXED_SUGGESTIONS.filter(
    (s) => !fixedItems.some((f) => f.name.toLowerCase() === s.toLowerCase()),
  );

  // ₹ aur % ke beech switch karte waqt value convert ho jaye
  const switchExtraMode = (next: "percent" | "amount") => {
    if (next === extraMode) return;
    setExtraValue(
      next === "amount"
        ? String(extraBudget)
        : String(Math.round((extraBudget / pool) * 100)),
    );
    setExtraMode(next);
  };

  const switchToManual = () => {
    if (!manual) setManual(String(dailyLimit));
    setMode("manual");
  };

  return (
    <div className="flex min-h-screen flex-col p-5">
      {onCancel && (
        <button
          className="mb-3 cursor-pointer self-start text-slate-500"
          onClick={onCancel}
        >
          ← Cancel
        </button>
      )}
      <div className="mb-6 flex gap-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full ${s <= step ? "bg-indigo-600" : "bg-slate-200"}`}
          />
        ))}
      </div>

      {step === 1 && (
        <IncomeStep
          value={income}
          onChange={setIncome}
          onNext={() => setStep(2)}
        />
      )}

      {step === 2 && (
        <>
          <h1 className="text-2xl font-bold">Fixed expenses</h1>
          <p className="mb-4 mt-1 text-slate-500">
            Bills and commitments that stay the same every month
          </p>

          {fixedItems.length > 0 && (
            <div className="mb-4 space-y-2">
              {fixedItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-xl bg-slate-100 px-4 py-3"
                >
                  <span>{item.name}</span>
                  <span className="flex items-center gap-3">
                    <b>{rupee(item.amount)}</b>
                    <button
                      className="text cursor-pointer-slate-400"
                      onClick={() =>
                        setFixedItems(
                          fixedItems.filter((f) => f.id !== item.id),
                        )
                      }
                    >
                      ✕
                    </button>
                  </span>
                </div>
              ))}
            </div>
          )}

          {availableSuggestions.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {availableSuggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setName(s);
                    amountRef.current?.focus();
                  }}
                  className={`rounded-full cursor-pointer px-3 py-1.5 text-sm font-medium ${
                    name === s
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <input
              className={inputCls}
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              ref={amountRef}
              className={inputCls}
              inputMode="numeric"
              placeholder="₹"
              value={amount}
              onChange={(e) => setAmount(digits(e.target.value))}
              onKeyDown={(e) => e.key === "Enter" && commitPending()}
            />
          </div>
          <button
            disabled={!pendingItem}
            onClick={commitPending}
            className="mt-2 w-full cursor-pointer rounded-xl border border-indigo-600 py-3 font-semibold text-indigo-600 disabled:border-slate-200 disabled:text-slate-300"
          >
            + Add
          </button>
          {pendingItem && (
            <p className="mt-1 text-sm text-slate-500">
              Tap Add for another one, or Next to save and continue.
            </p>
          )}

          <div className="mt-6 rounded-xl bg-indigo-50 p-4">
            <div className="flex justify-between">
              <span>Income</span>
              <b>{rupee(draft.income)}</b>
            </div>
            <div className="flex justify-between">
              <span>Fixed total</span>
              <b>{rupee(draft.income - pool)}</b>
            </div>
            <div className="mt-2 flex justify-between border-t border-indigo-200 pt-2">
              <span>Left to spend</span>
              <b>{rupee(pool)}</b>
            </div>
          </div>
          {pool <= 0 && (
            <p className="mt-2 text-red-600">
              Fixed expenses exceed your income!
            </p>
          )}

          <button className={btnCls} disabled={pool <= 0} onClick={goToStep3}>
            Next
          </button>
        </>
      )}

      {step === 3 && (
        <>
          <h1 className="text-2xl font-bold">Daily limit</h1>
          <p className="mb-5 mt-1 text-slate-500">
            <p className="mb-5 mt-1 text-slate-500">
              We keep some money aside for spending outside your daily routine,
              like medical bills, repairs or shopping. The rest is spread across
              the month as your daily limit.
            </p>
          </p>

          {mode === "auto" ? (
            <>
              <div className="mb-2 flex items-center justify-between">
                <span className="font-medium">Budget for extra expenses</span>
                <div className="flex rounded-xl bg-slate-100 p-1 text-sm font-medium">
                  {(["percent", "amount"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => switchExtraMode(m)}
                      className={`rounded-lg px-4 py-1 ${extraMode === m ? "bg-white shadow-sm" : "text-slate-500 cursor-pointer"}`}
                    >
                      {m === "percent" ? "%" : "₹"}
                    </button>
                  ))}
                </div>
              </div>
              <input
                className={inputCls}
                inputMode="numeric"
                placeholder={extraMode === "percent" ? "20" : "5000"}
                value={extraValue}
                onChange={(e) => setExtraValue(digits(e.target.value))}
              />
              {extraInvalid && (
                <p className="mt-2 text-red-600">
                  {extraMode === "percent"
                    ? "Cannot be more than 100%"
                    : `Cannot be more than ${rupee(pool)}`}
                </p>
              )}
              <button
                className="mt-3 cursor-pointer self-start text-sm font-medium text-indigo-600"
                onClick={switchToManual}
              >
                I'd rather set my daily limit myself
              </button>
            </>
          ) : (
            <>
              <div className="mb-2 font-medium">My daily limit</div>
              <input
                className={inputCls}
                inputMode="numeric"
                placeholder="₹ per day"
                value={manual}
                onChange={(e) => setManual(digits(e.target.value))}
              />
              <p className="mt-1 text-sm text-slate-500">
                Maximum {rupee(maxDailyLimit)} per day
              </p>
              {Number(manual) > maxDailyLimit && (
                <p className="mt-1 text-red-600">
                  Limit cannot exceed {rupee(maxDailyLimit)}
                </p>
              )}
              <button
                className="mt-3 cursor-pointer self-start text-sm font-medium text-indigo-600"
                onClick={() => setMode("auto")}
              >
                Set the extra budget instead
              </button>
            </>
          )}

          <div className="mt-5 rounded-xl bg-indigo-50 p-4">
            <div className="flex justify-between">
              <span>Left to spend</span>
              <b>{rupee(pool)}</b>
            </div>
            <div className="flex justify-between">
              <span>Extra expenses budget</span>
              <b>{rupee(extraBudget)}</b>
            </div>
            <div className="flex justify-between">
              <span>Regular spending</span>
              <b>{rupee(regularBudget)}</b>
            </div>
            <div className="mt-2 flex justify-between border-t border-indigo-200 pt-2 text-lg">
              <span>Daily limit</span>
              <b>{rupee(dailyLimit)} / day</b>
            </div>
          </div>

          <button
            className={btnCls}
            disabled={manualInvalid || extraInvalid}
            onClick={() => onDone(draft)}
          >
            {initial ? "Save changes" : "Budget ready"}
          </button>
        </>
      )}
    </div>
  );
}
