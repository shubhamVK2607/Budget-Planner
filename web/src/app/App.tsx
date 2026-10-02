import { useState } from 'react'
import { useAppData } from '../hooks/useAppData'
import { copyBudget, findPreviousBudget, getCurrentMonth } from '../features/budget/budget'
import { forMonth } from '../features/expenses/expenses'
import { shiftMonth } from '../shared/utils/date'
import { kindOf } from '../shared/utils/kind'
import BottomNav from '../shared/components/BottomNav'
import type { Tab } from '../shared/components/BottomNav'
import SetupScreen from '../features/setup/SetupScreen'
import DashboardScreen from '../features/dashboard/DashboardScreen'
import CalendarScreen from '../features/calendar/CalendarScreen'
import CategoriesScreen from '../features/categories/CategoriesScreen'
import SettingsScreen from '../features/settings/SettingsScreen'
import ExpenseSheet from '../features/expenses/ExpenseSheet'
import MonthHeader from '../features/months/MonthHeader'
import NewMonthScreen from '../features/months/NewMonthScreen'
import type { Expense, Kind, MonthBudget } from '../shared/types'

type SheetState = { expense?: Expense; date?: string }

function App() {
  const [data, setData] = useAppData()
  const current = getCurrentMonth()
  const [viewMonth, setViewMonth] = useState(current)
  const [tab, setTab] = useState<Tab>('home')
  const [editingBudget, setEditingBudget] = useState(false)
  const [startFresh, setStartFresh] = useState(false)
  const [sheet, setSheet] = useState<SheetState | null>(null)

  const budget = data.budgets[viewMonth]
  const previous = findPreviousBudget(data.budgets, viewMonth)

  const earliest = Object.keys(data.budgets).sort()[0]
  const minMonth = earliest && earliest < current ? earliest : current
  const canPrev = viewMonth > minMonth
  const canNext = viewMonth < shiftMonth(current, 1)

  const changeMonth = (month: string) => {
    setViewMonth(month)
    setStartFresh(false)
    setEditingBudget(false)
  }

  const saveBudget = (b: MonthBudget) => {
    setData({ ...data, budgets: { ...data.budgets, [viewMonth]: b } })
  }

  const saveExpense = (fields: Omit<Expense, 'id'>) => {
    const editing = sheet?.expense
    setData({
      ...data,
      expenses: editing
        ? data.expenses.map((e) => (e.id === editing.id ? { ...fields, id: editing.id } : e))
        : [...data.expenses, { ...fields, id: crypto.randomUUID() }],
    })
    setSheet(null)
  }

  const deleteExpense = () => {
    const editing = sheet?.expense
    if (!editing) return
    setData({ ...data, expenses: data.expenses.filter((e) => e.id !== editing.id) })
    setSheet(null)
  }

  const addCategory = (name: string, kind: Kind) => {
    setData({ ...data, categories: [...data.categories, { id: crypto.randomUUID(), name, kind }] })
  }

  const toggleArchive = (id: string) => {
    setData({
      ...data,
      categories: data.categories.map((c) => (c.id === id ? { ...c, archived: !c.archived } : c)),
    })
  }

  // Har kind ke liye default category: us kind ka last used, nahi to pehla active
  const pickDefault = (kind: Kind): string => {
    const active = data.categories.filter((c) => !c.archived && kindOf(c) === kind)
    const last = [...data.expenses]
      .reverse()
      .find((e) => kindOf(e) === kind && active.some((c) => c.id === e.categoryId))
    return last?.categoryId ?? active[0]?.id ?? ''
  }
  const defaultCategoryIds: Record<Kind, string> = {
    regular: pickDefault('regular'),
    extra: pickDefault('extra'),
  }

  const header = (
    <MonthHeader
      month={viewMonth}
      canPrev={canPrev}
      canNext={canNext}
      onPrev={() => changeMonth(shiftMonth(viewMonth, -1))}
      onNext={() => changeMonth(shiftMonth(viewMonth, 1))}
    />
  )

  let content
  if (!budget) {
    if (!previous || startFresh) {
      content = (
        <SetupScreen
          month={viewMonth}
          onDone={(b) => {
            saveBudget(b)
            setStartFresh(false)
          }}
          onCancel={previous ? () => setStartFresh(false) : undefined}
        />
      )
    } else {
      content = (
        <>
          {header}
          <NewMonthScreen
            month={viewMonth}
            previous={previous}
            onCopy={() => saveBudget(copyBudget(previous, viewMonth))}
            onFresh={() => setStartFresh(true)}
          />
        </>
      )
    }
  } else if (editingBudget) {
    content = (
      <SetupScreen
        month={viewMonth}
        initial={budget}
        onDone={(b) => {
          saveBudget(b)
          setEditingBudget(false)
        }}
        onCancel={() => setEditingBudget(false)}
      />
    )
  } else {
    content = (
      <>
        {tab !== 'settings' && header}
        <div className="flex-1 pb-20">
          {tab === 'home' && (
            <DashboardScreen
              budget={budget}
              categories={data.categories}
              expenses={data.expenses}
              onAddClick={() => setSheet({})}
              onExpenseClick={(expense) => setSheet({ expense })}
            />
          )}
          {tab === 'calendar' && (
            <CalendarScreen
              key={viewMonth}
              budget={budget}
              categories={data.categories}
              expenses={data.expenses}
              onAddClick={(date) => setSheet({ date })}
              onExpenseClick={(expense) => setSheet({ expense })}
            />
          )}
          {tab === 'categories' && (
            <CategoriesScreen
              categories={data.categories}
              monthExpenses={forMonth(data.expenses, viewMonth)}
              onExpenseClick={(expense) => setSheet({ expense })}
            />
          )}
          {tab === 'settings' && (
            <SettingsScreen
              budget={budget}
              categories={data.categories}
              onEditBudget={() => setEditingBudget(true)}
              onAddCategory={addCategory}
              onToggleArchive={toggleArchive}
            />
          )}
        </div>
        <BottomNav active={tab} onChange={setTab} />
        {sheet && (
          <ExpenseSheet
            categories={data.categories}
            defaultCategoryIds={defaultCategoryIds}
            defaultDate={sheet.date}
            initial={sheet.expense}
            onSave={saveExpense}
            onDelete={sheet.expense ? deleteExpense : undefined}
            onClose={() => setSheet(null)}
          />
        )}
      </>
    )
  }

  return <div className="mx-auto flex min-h-screen max-w-[480px] flex-col bg-white">{content}</div>
}

export default App