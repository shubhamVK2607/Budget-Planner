import { useState } from 'react'
import { useAppData } from '../hooks/useAppData'
import { copyBudget, findPreviousBudget, getCurrentMonth } from '../features/budget/budget'
import { shiftMonth } from '../shared/utils/date'
import SetupScreen from '../features/setup/SetupScreen'
import DashboardScreen from '../features/dashboard/DashboardScreen'
import SettingsScreen from '../features/settings/SettingsScreen'
import ExpenseSheet from '../features/expenses/ExpenseSheet'
import MonthHeader from '../features/months/MonthHeader'
import NewMonthScreen from '../features/months/NewMonthScreen'
import type { Expense, MonthBudget } from '../shared/types'

type Screen = 'dashboard' | 'settings' | 'editBudget' | 'setupNew'

function App() {
  const [data, setData] = useAppData()
  const current = getCurrentMonth()
  const [viewMonth, setViewMonth] = useState(current)
  const [screen, setScreen] = useState<Screen>('dashboard')
  const [sheet, setSheet] = useState<{ expense?: Expense } | null>(null)

  const budget = data.budgets[viewMonth]
  const previous = findPreviousBudget(data.budgets, viewMonth)

  // Month navigation limits: sabse purane budget se lekar agle mahine tak
  const earliest = Object.keys(data.budgets).sort()[0]
  const minMonth = earliest && earliest < current ? earliest : current
  const canPrev = viewMonth > minMonth
  const canNext = viewMonth < shiftMonth(current, 1)

  const changeMonth = (month: string) => {
    setViewMonth(month)
    setScreen('dashboard')
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

  const addCategory = (name: string) => {
    setData({ ...data, categories: [...data.categories, { id: crypto.randomUUID(), name }] })
  }

  const toggleArchive = (id: string) => {
    setData({
      ...data,
      categories: data.categories.map((c) => (c.id === id ? { ...c, archived: !c.archived } : c)),
    })
  }

  const activeCategories = data.categories.filter((c) => !c.archived)
  const lastExpense = data.expenses[data.expenses.length - 1]
  const lastCategoryActive = activeCategories.some((c) => c.id === lastExpense?.categoryId)
  const defaultCategoryId = lastCategoryActive ? lastExpense.categoryId : activeCategories[0]?.id ?? ''

  const header = (withSettings: boolean) => (
    <MonthHeader
      month={viewMonth}
      canPrev={canPrev}
      canNext={canNext}
      onPrev={() => changeMonth(shiftMonth(viewMonth, -1))}
      onNext={() => changeMonth(shiftMonth(viewMonth, 1))}
      onSettings={withSettings ? () => setScreen('settings') : undefined}
    />
  )

  let content
  if (!budget) {
    if (!previous || screen === 'setupNew') {
      // Pehli baar ka setup, ya "Start fresh"
      content = (
        <SetupScreen
          month={viewMonth}
          onDone={(b) => {
            saveBudget(b)
            setScreen('dashboard')
          }}
          onCancel={previous ? () => setScreen('dashboard') : undefined}
        />
      )
    } else {
      content = (
        <>
          {header(false)}
          <NewMonthScreen
            month={viewMonth}
            previous={previous}
            onCopy={() => saveBudget(copyBudget(previous, viewMonth))}
            onFresh={() => setScreen('setupNew')}
          />
        </>
      )
    }
  } else if (screen === 'editBudget') {
    content = (
      <SetupScreen
        month={viewMonth}
        initial={budget}
        onDone={(b) => {
          saveBudget(b)
          setScreen('settings')
        }}
        onCancel={() => setScreen('settings')}
      />
    )
  } else if (screen === 'settings') {
    content = (
      <SettingsScreen
        budget={budget}
        categories={data.categories}
        onEditBudget={() => setScreen('editBudget')}
        onAddCategory={addCategory}
        onToggleArchive={toggleArchive}
        onBack={() => setScreen('dashboard')}
      />
    )
  } else {
    content = (
      <>
        {header(true)}
        <DashboardScreen
          budget={budget}
          categories={data.categories}
          expenses={data.expenses}
          onAddClick={() => setSheet({})}
          onExpenseClick={(expense) => setSheet({ expense })}
        />
        {sheet && (
          <ExpenseSheet
            categories={data.categories}
            defaultCategoryId={defaultCategoryId}
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