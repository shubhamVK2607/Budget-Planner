import { useState } from 'react'
import { useAppData } from '../hooks/useAppData'
import { getCurrentMonth } from '../features/budget/budget'
import SetupScreen from '../features/setup/SetupScreen'
import DashboardScreen from '../features/dashboard/DashboardScreen'
import SettingsScreen from '../features/settings/SettingsScreen'
import ExpenseSheet from '../features/expenses/ExpenseSheet'
import type { Expense } from '../shared/types'

function App() {
  const [data, setData] = useAppData()
const [screen, setScreen] = useState<'dashboard' | 'settings' | 'editBudget'>('dashboard')
  const [sheet, setSheet] = useState<{ expense?: Expense } | null>(null)
  const month = getCurrentMonth()
  const budget = data.budgets[month]

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

  return (
    <div className="mx-auto min-h-screen max-w-[480px] bg-white">
      {!budget ? (
  <SetupScreen
    month={month}
    onDone={(b) => setData({ ...data, budgets: { ...data.budgets, [month]: b } })}
  />
) : screen === 'editBudget' ? (
  <SetupScreen
    month={month}
    initial={budget}
    onDone={(b) => {
      setData({ ...data, budgets: { ...data.budgets, [month]: b } })
      setScreen('settings')
    }}
    onCancel={() => setScreen('settings')}
  />
) : screen === 'settings' ? (
  <SettingsScreen
    budget={budget}
    categories={data.categories}
    onEditBudget={() => setScreen('editBudget')}
    onAddCategory={addCategory}
    onToggleArchive={toggleArchive}
    onBack={() => setScreen('dashboard')}
  />
      ) : (
        <>
          <DashboardScreen
            budget={budget}
            categories={data.categories}
            expenses={data.expenses}
            onAddClick={() => setSheet({})}
            onExpenseClick={(expense) => setSheet({ expense })}
            onSettingsClick={() => setScreen('settings')}
          />
          <button
            className="mx-auto mb-6 block text-xs text-slate-400 underline"
            onClick={() => {
              const { [month]: _removed, ...rest } = data.budgets
              setData({ ...data, budgets: rest })
            }}
          >
            Redo setup (testing)
          </button>
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
      )}
    </div>
  )
}

export default App