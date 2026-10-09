import { useEffect, useState } from 'react'
import { useAppData } from '../hooks/useAppData'
import { copyBudget, findPreviousBudget } from '../features/budget/budget'
import { getOverflowNotice } from '../features/budget/overflowNotice'
import type { OverflowNotice } from '../features/budget/overflowNotice'
import { formatShortDate, getToday, shiftDay, shiftMonthKeepDay } from '../shared/utils/date'
import { rupee } from '../shared/utils/format'
import { kindOf } from '../shared/utils/kind'
import { useI18n } from '../shared/i18n/context'
import BottomNav from '../shared/components/BottomNav'
import type { Tab } from '../shared/components/BottomNav'
import NoticeDialog from '../shared/components/NoticeDialog'
import Toast from '../shared/components/Toast'
import SetupScreen from '../features/setup/SetupScreen'
import DashboardScreen from '../features/dashboard/DashboardScreen'
import InsightsScreen from '../features/insights/InsightsScreen'
import TrendScreen from '../features/trend/TrendScreen'
import CalendarPopup from '../features/calendar/CalendarPopup'
import SettingsScreen from '../features/settings/SettingsScreen'
import ExpenseSheet from '../features/expenses/ExpenseSheet'
import DateHeader from '../features/months/DateHeader'
import MonthHeader from '../features/months/MonthHeader'
import NewMonthScreen from '../features/months/NewMonthScreen'
import type { Expense, Kind, MonthBudget } from '../shared/types'

type SheetState = { expense?: Expense; date?: string }

function App() {
  const { t, locale, catName } = useI18n()
  const [data, setData] = useAppData()
  const today = getToday()
  const currentMonth = today.slice(0, 7)

  const [viewDate, setViewDate] = useState(getToday)
  const viewMonth = viewDate.slice(0, 7)

  const [tab, setTab] = useState<Tab>('home')
  const [trendOpen, setTrendOpen] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState(false)
  const [startFresh, setStartFresh] = useState(false)
  const [sheet, setSheet] = useState<SheetState | null>(null)
  const [notice, setNotice] = useState<OverflowNotice | null>(null)
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null)

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 2500)
    return () => clearTimeout(timer)
  }, [toast])

  const showToast = (text: string) => setToast({ id: Date.now(), text })

  const budget = data.budgets[viewMonth]
  const previous = findPreviousBudget(data.budgets, viewMonth)

  // Date navigation: sabse purane budget wale mahine ke 1 tareekh se aaj tak
  const earliest = Object.keys(data.budgets).sort()[0]
  const minDate = `${earliest && earliest < currentMonth ? earliest : currentMonth}-01`

  const canPrevDay = viewDate > minDate
  const canNextDay = viewDate < today
  const canPrevMonth = shiftMonthKeepDay(viewDate, -1) >= minDate
  const canNextMonth = viewMonth < currentMonth

  const moveTo = (date: string) => {
    setViewDate(date)
    setStartFresh(false)
    setEditingBudget(false)
  }

  const goDay = (delta: number) => {
    const next = shiftDay(viewDate, delta)
    if (next >= minDate && next <= today) moveTo(next)
  }

  const goMonth = (delta: number) => {
    if (delta < 0 ? !canPrevMonth : !canNextMonth) return
    const next = shiftMonthKeepDay(viewDate, delta)
    moveTo(next > today ? today : next)
  }

  const changeTab = (next: Tab) => {
    setTab(next)
    setTrendOpen(false)
  }

  const saveBudget = (b: MonthBudget) => {
    setData({ ...data, budgets: { ...data.budgets, [viewMonth]: b } })
  }

  const saveExpense = (fields: Omit<Expense, 'id'>) => {
    const editing = sheet?.expense
    const nextExpenses = editing
      ? data.expenses.map((e) => (e.id === editing.id ? { ...fields, id: editing.id } : e))
      : [...data.expenses, { ...fields, id: crypto.randomUUID() }]

    setData({ ...data, expenses: nextExpenses })
    setSheet(null)
    setNotice(getOverflowNotice(data.budgets[fields.date.slice(0, 7)], data.expenses, nextExpenses))

    const category = data.categories.find((c) => c.id === fields.categoryId)
    const amountText = rupee(fields.amount)
    showToast(
      [
        editing ? t.toast.updated(amountText) : t.toast.added(amountText),
        category ? catName(category) : null,
        fields.date !== viewDate ? formatShortDate(fields.date, locale) : null,
      ]
        .filter(Boolean)
        .join(' · ')
    )
  }

  const deleteExpense = () => {
    const editing = sheet?.expense
    if (!editing) return
    setData({ ...data, expenses: data.expenses.filter((e) => e.id !== editing.id) })
    setSheet(null)
    showToast(t.toast.deleted)
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

  const monthHeader = (
    <MonthHeader
      month={viewMonth}
      canPrev={canPrevMonth}
      canNext={canNextMonth}
      onPrev={() => goMonth(-1)}
      onNext={() => goMonth(1)}
    />
  )

  const dateHeader = (
    <DateHeader
      date={viewDate}
      canPrevDay={canPrevDay}
      canNextDay={canNextDay}
      canPrevMonth={canPrevMonth}
      canNextMonth={canNextMonth}
      onPrevDay={() => goDay(-1)}
      onNextDay={() => goDay(1)}
      onPrevMonth={() => goMonth(-1)}
      onNextMonth={() => goMonth(1)}
      onOpenCalendar={() => setCalendarOpen(true)}
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
          {monthHeader}
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
        {tab === 'home' && dateHeader}
        {tab === 'insights' && monthHeader}

        <div className="flex-1 pb-[calc(7rem+env(safe-area-inset-bottom))]">
          {tab === 'home' && (
            <DashboardScreen
              budget={budget}
              categories={data.categories}
              expenses={data.expenses}
              viewDate={viewDate}
              onAddClick={() => setSheet({ date: viewDate })}
              onExpenseClick={(expense) => setSheet({ expense })}
            />
          )}
          {tab === 'insights' &&
            (trendOpen ? (
              <TrendScreen
                key={viewMonth}
                budget={budget}
                expenses={data.expenses}
                onBack={() => setTrendOpen(false)}
              />
            ) : (
              <InsightsScreen
                key={viewMonth}
                categories={data.categories}
                expenses={data.expenses}
                month={viewMonth}
                today={today}
                onExpenseClick={(expense) => setSheet({ expense })}
                onTrendClick={() => setTrendOpen(true)}
              />
            ))}
          {tab === 'settings' && (
            <SettingsScreen
              budget={budget}
              categories={data.categories}
              data={data}
              onEditBudget={() => setEditingBudget(true)}
              onAddCategory={addCategory}
              onToggleArchive={toggleArchive}
              onImport={(imported) => {
                setData(imported)
                moveTo(today)
              }}
            />
          )}
        </div>

        <BottomNav active={tab} onChange={changeTab} />

        {calendarOpen && (
          <CalendarPopup
            budgets={data.budgets}
            expenses={data.expenses}
            selectedDate={viewDate}
            minDate={minDate}
            today={today}
            onSelect={(date) => {
              moveTo(date)
              setCalendarOpen(false)
            }}
            onClose={() => setCalendarOpen(false)}
          />
        )}

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
        {notice && (
          <NoticeDialog
            title={t.notice.title}
            message={
              t.notice.overBy(rupee(notice.extraBudget), rupee(notice.overflow)) +
              (notice.tomorrow
                ? t.notice.fromTomorrow(rupee(notice.tomorrow.now), rupee(notice.tomorrow.was))
                : '')
            }
            onClose={() => setNotice(null)}
          />
        )}
      </>
    )
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-[480px] flex-col bg-white">
      {content}
      {toast && <Toast key={toast.id} message={toast.text} />}
    </div>
  )
}

export default App