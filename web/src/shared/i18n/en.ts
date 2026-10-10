import type { Kind } from '../types'

export const en = {
  nav: { home: 'Home', insights: 'Insights', settings: 'Settings' },

  common: {
    regular: 'Regular',
    extra: 'Extra',
    fixed: 'Fixed',
    income: 'Income',
    fixedExpenses: 'Fixed expenses',
    dailyLimit: 'Daily limit',
    thisMonth: 'This month',
    today: 'Today',
    total: 'Total',
    unknown: 'Unknown',
    cancel: 'Cancel',
    back: 'Back',
    next: 'Next',
    save: 'Save',
    delete: 'Delete',
    add: 'Add',
    close: 'Close',
    clear: 'Clear',
    hide: 'Hide',
    restore: 'Restore',
    gotIt: 'Got it',
    new: 'New',
    noChange: 'No change',
  },

  status: {
    regular: { green: 'On track', yellow: 'Close to limit', red: 'Over limit' },
    extra: { green: 'On track', yellow: 'Close to budget', red: 'Over budget' },
    day: { green: 'Within limit', yellow: 'Close to limit', red: 'Over limit' },
  },

  header: {
    prevMonth: 'Previous month',
    prevDay: 'Previous day',
    nextDay: 'Next day',
    nextMonth: 'Next month',
    openCalendar: 'Open calendar',
    todayWeekday: (weekday: string) => `Today · ${weekday}`,
  },

  home: {
    thisMonth: 'THIS MONTH',
    leftOfIncome: (a: string) => `${a} left of income`,
    overIncome: (a: string) => `${a} over income`,
    seeAll: 'See all spending',
    regularTitle: 'REGULAR',
    today: 'TODAY',
    leftOn: (a: string, isToday: boolean) => (isToday ? `${a} left today` : `${a} left that day`),
    overOn: (a: string, isToday: boolean) =>
      isToday ? `${a} over today's limit` : `${a} over that day's limit`,
    reduced: (a: string) => `Reduced from ${a} because extra spending went over budget.`,
    seeExpenses: (isToday: boolean) => (isToday ? "See today's expenses" : "See this day's expenses"),
    extraTitle: 'EXTRA',
    extraOver: (a: string) => `${a} over, taken from your regular budget`,
    extraLeft: (a: string) => `${a} left in extra budget`,
    seeExtra: "See this month's extra expenses",
    addExpense: 'Add expense',
  },

  dialogs: {
    monthSubtitle: 'Fixed + Regular + Extra',
    totalSpent: 'Total spent',
    leftOfIncome: (left: string, income: string) => `${left} left of your ${income} income`,
    overIncome: (over: string, income: string) => `${over} over your ${income} income`,
    fixedSection: 'FIXED',
    regularSection: 'REGULAR',
    extraSection: 'EXTRA',
    noFixed: 'No fixed expenses',
    fixedHint: 'To change fixed expenses: Settings → Edit budget.',
    noRegularMonth: 'No regular expenses this month',
    noExtraMonth: 'No extra expenses this month',
    regularTitle: (date: string) => `Regular · ${date}`,
    dailyLimitSub: (a: string) => `Daily limit ${a}`,
    leftOfDaily: (a: string) => `${a} left of the daily limit`,
    overDaily: (a: string) => `${a} over the daily limit`,
    noRegularDay: 'No regular expenses on this day',
    extraTitle: (month: string) => `Extra · ${month}`,
    extraBudgetSub: (a: string) => `Extra budget ${a}`,
    leftExtra: (a: string) => `${a} left in extra budget`,
    overExtra: (a: string) => `${a} over the extra budget`,
  },

  expense: {
    editTitle: 'Edit expense',
    addTitle: 'Add expense',
    amountPlaceholder: '₹ 0',
    notePlaceholder: 'Note (optional)',
    extraNotePlaceholder: 'What was it for? (optional)',
    confirmDelete: 'Delete this expense?',
  },

  insights: {
    centerLabel: 'This month',
    byCategory: 'THIS MONTH · BY CATEGORY',
    share: (pct: number, kind: Kind) => `${pct}% of ${kind} spending`,
    empty: (kind: Kind, month: string) => `No ${kind} expenses in ${month}`,
    changeNote: 'Change is compared with the same period last month.',
    trendTitle: 'Daily spending trend',
    trendSub: 'Regular spending day by day vs your limit',
    dialogFooter: (pct: number, kind: Kind) => `${pct}% of your ${kind} spending this month`,
  },

  trend: {
    subtitle: 'Your regular spending each day vs your daily limit.',
    notStarted: "This month hasn't started yet.",
    saved: (a: string) => `You've saved ${a} so far this month.`,
    overspent: (a: string) => `You've overspent by ${a} so far this month.`,
    exact: "You're exactly on track so far this month.",
    allowedSpent: (allowed: string, spent: string) =>
      `Daily limits added up: ${allowed} · You spent: ${spent}`,
    noDaysOver: 'No days over the limit so far.',
    overDays: (n: number, total: number) => `Over the limit on ${n} of ${total} days.`,
    legendWithin: 'Within',
    legendClose: 'Close',
    legendOver: 'Over',
    legendLimit: 'Daily limit',
    hint: 'Tap a bar for details. Extra spending is not included here.',
  },

  calendar: {
    weekdaysShort: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
    legendWithin: 'Within limit',
    legendClose: 'Close',
    legendOver: 'Over',
    legendExtra: 'Extra',
    goToday: 'Go to today',
  },

  month: {
    noBudget: (month: string) => `No budget for ${month}`,
    setup: 'Set it up in one tap, or start from scratch.',
    copyFrom: (month: string) => `Copy from ${month}`,
    copyBudget: 'Copy budget',
    startFresh: 'Start fresh',
  },

  settings: {
    title: 'Settings',
    budgetFor: (month: string) => `BUDGET · ${month.toUpperCase()}`,
    extraBudget: 'Extra expenses budget',
    editBudget: 'Edit budget',
    preferences: 'PREFERENCES',
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
    language: 'Language',
    regularCats: 'REGULAR CATEGORIES (daily spending)',
    extraCats: 'EXTRA CATEGORIES (non-daily spending)',
  },

  categories: {
    newCategory: 'New category',
    exists: 'This category already exists',
    hiddenSuffix: '(hidden)',
    rename: 'Rename',
    merge: 'Merge into another category',
    mergeTitle: (name: string) => `Merge "${name}" into…`,
    mergeDesc: (n: number) =>
      n > 0
        ? `${n} expense(s) will move to the category you pick. This cannot be undone.`
        : 'This category has no expenses. It will be removed.',
    mergeConfirm: 'Merge',
  },

  backup: {
    title: 'BACKUP',
    desc: 'Your data is stored only on this phone. Save a backup so you never lose it.',
    export: 'Export',
    import: 'Import',
    exportDone: 'Backup ready. Keep the file somewhere safe (Files, Drive, or WhatsApp to yourself).',
    exportFail: 'Could not create the backup.',
    invalid: 'This file is not a valid Budget Planner backup.',
    confirm: (expenses: number, months: number) =>
      `Replace ALL current data with this backup?\n\n${expenses} expenses, ${months} month(s). This cannot be undone.`,
    restored: 'Backup restored.',
  },

  setup: {
    incomeTitle: "What's your monthly income?",
    incomeSub: 'Your salary or total earnings for this month.',
    whatNext: 'What happens next',
    next1: '1. Add your fixed bills (rent, EMI, SIP)',
    next2: "2. We show what's left to spend",
    next3: '3. You get a simple daily limit',
    units: { crore: 'crore', lakh: 'lakh', thousand: 'thousand' },
    fixedTitle: 'Fixed expenses',
    fixedSub: 'Bills and commitments that stay the same every month',
    suggestions: [
      'Car EMI',
      'Home Loan EMI',
      'House Rent',
      'Other Rent',
      'Electricity',
      'Mutual Fund',
      'Insurance',
      'Internet',
    ],
    namePlaceholder: 'Name',
    addFixed: '+ Add',
    pendingHint: 'Tap Add for another one, or Next to save and continue.',
    fixedTotal: 'Fixed total',
    leftToSpend: 'Left to spend',
    fixedExceeds: 'Fixed expenses exceed your income!',
    limitTitle: 'Daily limit',
    limitDesc:
      'We keep some money aside for spending outside your daily routine, like medical bills, repairs or shopping. The rest is spread across the month as your daily limit.',
    extraBudgetLabel: 'Budget for extra expenses',
    maxPercent: 'Cannot be more than 100%',
    maxAmount: (a: string) => `Cannot be more than ${a}`,
    setOwn: "I'd rather set my daily limit myself",
    myLimit: 'My daily limit',
    limitPlaceholder: '₹ per day',
    maxPerDay: (a: string) => `Maximum ${a} per day`,
    limitExceeds: (a: string) => `Limit cannot exceed ${a}`,
    setExtraInstead: 'Set the extra budget instead',
    extraBudget: 'Extra expenses budget',
    regularSpending: 'Regular spending',
    perDay: (a: string) => `${a} / day`,
    saveChanges: 'Save changes',
    budgetReady: 'Budget ready',
  },

  notice: {
    title: 'Extra budget exceeded',
    overBy: (budget: string, over: string) =>
      `Your extra expenses budget of ${budget} is over by ${over}.`,
    fromTomorrow: (now: string, was: string) =>
      ` From tomorrow, your daily limit is ${now} (was ${was}).`,
  },

  toast: {
    added: (a: string) => `Added ${a}`,
    updated: (a: string) => `Updated ${a}`,
    deleted: 'Expense deleted',
    merged: (from: string, to: string) => `Merged ${from} into ${to}`,
  },

  defaultCategories: {
    groceries: 'Groceries',
    eating_out: 'Eating Out',
    travel: 'Travel',
    home_personal: 'Home & Personal',
    other: 'Other',
    medical: 'Medical & Health',
    shopping: 'Shopping',
    gadgets_repairs: 'Gadgets & Repairs',
    bills_recharge: 'Bills & Recharge',
    gifts_events: 'Gifts & Events',
    entertainment_trips: 'Entertainment & Trips',
  } as Record<string, string>,

  categoryHints: {
    groceries: 'Veggies, milk, kirana, masala, fruits',
    eating_out: 'Samosa, chai, restaurant, Zomato',
    travel: 'Petrol, auto, metro',
    home_personal: 'Handwash, soap, shampoo, haircut',
    other: "Anything that doesn't fit",
    medical: 'Doctor, medicines, tests, glasses',
    shopping: 'Clothes, shoes, bags',
    gadgets_repairs: 'Phone glass, cover, repairs, electronics',
    bills_recharge: 'Mobile recharge, DTH, bigger bills',
    gifts_events: 'Gifts, weddings, festivals',
    entertainment_trips: 'Movies, outings, trips',
  } as Record<string, string>,
}

type WidenStrings<T> = T extends (...args: infer Args) => unknown
  ? (...args: Args) => string
  : T extends string
    ? string
    : T extends object
      ? { [Key in keyof T]: WidenStrings<T[Key]> }
      : T

export type Dict = WidenStrings<typeof en>