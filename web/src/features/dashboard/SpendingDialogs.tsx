import type { ReactNode } from 'react'
import type { Category, Expense, MonthBudget } from '../../shared/types'
import ListDialog from '../../shared/components/ListDialog'
import { rupee } from '../../shared/utils/format'
import { formatMonth } from '../../shared/utils/date'
import { useI18n } from '../../shared/i18n/context'
import { fixedItemLabel } from '../../shared/i18n/dictionaries'
import { getExtraBudget, getTotalFixed } from '../budget/budget'
import { ofKind, sumAmount } from '../expenses/expenses'
import ExpenseRow from '../expenses/ExpenseRow'

// Naya date pehle, ek hi din me jo baad me add hua wo pehle
const newestFirst = (list: Expense[]) =>
  list
    .map((e, i) => ({ e, i }))
    .sort((a, b) => b.e.date.localeCompare(a.e.date) || b.i - a.i)
    .map((x) => x.e)

function Card({ children }: { children: ReactNode }) {
  return <div className="divide-y divide-slate-100 rounded-2xl border border-slate-100">{children}</div>
}

function Section({ title, total, children }: { title: string; total: number; children: ReactNode }) {
  return (
    <div className="mt-4">
      <div className="mb-2 flex justify-between text-xs font-medium text-slate-500">
        <span>{title}</span>
        <span>{rupee(total)}</span>
      </div>
      <Card>{children}</Card>
    </div>
  )
}

type RowsProps = {
  list: Expense[]
  categories: Category[]
  showDate: boolean
  emptyText: string
  onExpenseClick: (expense: Expense) => void
}

function ExpenseRows({ list, categories, showDate, emptyText, onExpenseClick }: RowsProps) {
  const { t, catName } = useI18n()
  if (list.length === 0) return <p className="px-4 py-3 text-sm text-slate-400">{emptyText}</p>

  return (
    <>
      {newestFirst(list).map((e) => {
        const category = categories.find((c) => c.id === e.categoryId)
        return (
          <ExpenseRow
            key={e.id}
            expense={e}
            categoryName={category ? catName(category) : t.common.unknown}
            showDate={showDate}
            onClick={() => onExpenseClick(e)}
          />
        )
      })}
    </>
  )
}

type MonthProps = {
  budget: MonthBudget
  categories: Category[]
  monthExpenses: Expense[]
  onExpenseClick: (expense: Expense) => void
  onClose: () => void
}

export function MonthDialog({ budget, categories, monthExpenses, onExpenseClick, onClose }: MonthProps) {
  const { t, lang, locale } = useI18n()
  const regular = ofKind(monthExpenses, 'regular')
  const extra = ofKind(monthExpenses, 'extra')
  const fixedTotal = getTotalFixed(budget)
  const total = fixedTotal + sumAmount(regular) + sumAmount(extra)
  const left = budget.income - total

  return (
    <ListDialog
      title={formatMonth(budget.month, locale)}
      subtitle={t.dialogs.monthSubtitle}
      totalLabel={t.dialogs.totalSpent}
      total={total}
      footerNote={
        left >= 0
          ? t.dialogs.leftOfIncome(rupee(left), rupee(budget.income))
          : t.dialogs.overIncome(rupee(-left), rupee(budget.income))
      }
      onClose={onClose}
    >
      <Section title={t.dialogs.fixedSection} total={fixedTotal}>
        {budget.fixedItems.length === 0 ? (
          <p className="px-4 py-3 text-sm text-slate-400">{t.dialogs.noFixed}</p>
        ) : (
          budget.fixedItems.map((item) => (
            <div key={item.id} className="flex justify-between px-4 py-3">
              <span>{fixedItemLabel(item.name, lang)}</span>
              <b>{rupee(item.amount)}</b>
            </div>
          ))
        )}
      </Section>
      <p className="mt-1 text-xs text-slate-400">{t.dialogs.fixedHint}</p>

      <Section title={t.dialogs.regularSection} total={sumAmount(regular)}>
        <ExpenseRows
          list={regular}
          categories={categories}
          showDate
          emptyText={t.dialogs.noRegularMonth}
          onExpenseClick={onExpenseClick}
        />
      </Section>

      <Section title={t.dialogs.extraSection} total={sumAmount(extra)}>
        <ExpenseRows
          list={extra}
          categories={categories}
          showDate
          emptyText={t.dialogs.noExtraMonth}
          onExpenseClick={onExpenseClick}
        />
      </Section>
    </ListDialog>
  )
}

type RegularProps = {
  dateLabel: string
  limit: number
  expenses: Expense[]
  categories: Category[]
  onExpenseClick: (expense: Expense) => void
  onClose: () => void
}

export function RegularDialog({ dateLabel, limit, expenses, categories, onExpenseClick, onClose }: RegularProps) {
  const { t } = useI18n()
  const total = sumAmount(expenses)

  return (
    <ListDialog
      title={t.dialogs.regularTitle(dateLabel)}
      subtitle={t.dialogs.dailyLimitSub(rupee(limit))}
      total={total}
      footerNote={
        total <= limit
          ? t.dialogs.leftOfDaily(rupee(limit - total))
          : t.dialogs.overDaily(rupee(total - limit))
      }
      onClose={onClose}
    >
      <div className="mt-2">
        <Card>
          <ExpenseRows
            list={expenses}
            categories={categories}
            showDate={false}
            emptyText={t.dialogs.noRegularDay}
            onExpenseClick={onExpenseClick}
          />
        </Card>
      </div>
    </ListDialog>
  )
}

type ExtraProps = {
  budget: MonthBudget
  expenses: Expense[]
  categories: Category[]
  onExpenseClick: (expense: Expense) => void
  onClose: () => void
}

export function ExtraDialog({ budget, expenses, categories, onExpenseClick, onClose }: ExtraProps) {
  const { t, locale } = useI18n()
  const total = sumAmount(expenses)
  const extraBudget = getExtraBudget(budget)

  return (
    <ListDialog
      title={t.dialogs.extraTitle(formatMonth(budget.month, locale))}
      subtitle={t.dialogs.extraBudgetSub(rupee(extraBudget))}
      total={total}
      footerNote={
        total <= extraBudget
          ? t.dialogs.leftExtra(rupee(extraBudget - total))
          : t.dialogs.overExtra(rupee(total - extraBudget))
      }
      onClose={onClose}
    >
      <div className="mt-2">
        <Card>
          <ExpenseRows
            list={expenses}
            categories={categories}
            showDate
            emptyText={t.dialogs.noExtraMonth}
            onExpenseClick={onExpenseClick}
          />
        </Card>
      </div>
    </ListDialog>
  )
}