import type { ReactNode } from 'react'
import type { Category, Expense, MonthBudget } from '../../shared/types'
import ListDialog from '../../shared/components/ListDialog'
import { rupee } from '../../shared/utils/format'
import { formatMonth } from '../../shared/utils/date'
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
  if (list.length === 0) return <p className="px-4 py-3 text-sm text-slate-400">{emptyText}</p>
  return (
    <>
      {newestFirst(list).map((e) => (
        <ExpenseRow
          key={e.id}
          expense={e}
          categoryName={categories.find((c) => c.id === e.categoryId)?.name ?? 'Unknown'}
          showDate={showDate}
          onClick={() => onExpenseClick(e)}
        />
      ))}
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
  const regular = ofKind(monthExpenses, 'regular')
  const extra = ofKind(monthExpenses, 'extra')
  const fixedTotal = getTotalFixed(budget)
  const total = fixedTotal + sumAmount(regular) + sumAmount(extra)
  const left = budget.income - total

  return (
    <ListDialog
      title={formatMonth(budget.month)}
      subtitle="Fixed + Regular + Extra"
      totalLabel="Total spent"
      total={total}
      footerNote={
        left >= 0
          ? `${rupee(left)} left of your ${rupee(budget.income)} income`
          : `${rupee(-left)} over your ${rupee(budget.income)} income`
      }
      onClose={onClose}
    >
      <Section title="FIXED" total={fixedTotal}>
        {budget.fixedItems.length === 0 ? (
          <p className="px-4 py-3 text-sm text-slate-400">No fixed expenses</p>
        ) : (
          budget.fixedItems.map((item) => (
            <div key={item.id} className="flex justify-between px-4 py-3">
              <span>{item.name}</span>
              <b>{rupee(item.amount)}</b>
            </div>
          ))
        )}
      </Section>
      <p className="mt-1 text-xs text-slate-400">To change fixed expenses: Settings → Edit budget.</p>

      <Section title="REGULAR" total={sumAmount(regular)}>
        <ExpenseRows
          list={regular}
          categories={categories}
          showDate
          emptyText="No regular expenses this month"
          onExpenseClick={onExpenseClick}
        />
      </Section>

      <Section title="EXTRA" total={sumAmount(extra)}>
        <ExpenseRows
          list={extra}
          categories={categories}
          showDate
          emptyText="No extra expenses this month"
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
  const total = sumAmount(expenses)
  return (
    <ListDialog
      title={`Regular · ${dateLabel}`}
      subtitle={`Daily limit ${rupee(limit)}`}
      total={total}
      footerNote={
        total <= limit
          ? `${rupee(limit - total)} left of the daily limit`
          : `${rupee(total - limit)} over the daily limit`
      }
      onClose={onClose}
    >
      <div className="mt-2">
        <Card>
          <ExpenseRows
            list={expenses}
            categories={categories}
            showDate={false}
            emptyText="No regular expenses on this day"
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
  const total = sumAmount(expenses)
  const extraBudget = getExtraBudget(budget)
  return (
    <ListDialog
      title={`Extra · ${formatMonth(budget.month)}`}
      subtitle={`Extra budget ${rupee(extraBudget)}`}
      total={total}
      footerNote={
        total <= extraBudget
          ? `${rupee(extraBudget - total)} left in extra budget`
          : `${rupee(total - extraBudget)} over the extra budget`
      }
      onClose={onClose}
    >
      <div className="mt-2">
        <Card>
          <ExpenseRows
            list={expenses}
            categories={categories}
            showDate
            emptyText="No extra expenses this month"
            onExpenseClick={onExpenseClick}
          />
        </Card>
      </div>
    </ListDialog>
  )
}