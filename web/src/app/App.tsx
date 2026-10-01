import { useAppData } from '../hooks/useAppData'
import { getCurrentMonth } from '../features/budget/budget'
import SetupScreen from '../features/setup/SetupScreen'

function App() {
  const [data, setData] = useAppData()
  const month = getCurrentMonth()
  const budget = data.budgets[month]

  return (
    <div className="mx-auto min-h-screen max-w-[480px] bg-white">
      {!budget ? (
        <SetupScreen
          month={month}
          onDone={(b) => setData({ ...data, budgets: { ...data.budgets, [month]: b } })}
        />
      ) : (
        <div className="p-5">
          <h1 className="text-2xl font-bold">Setup ho gaya ✅</h1>
          <p>Income: {budget.income}</p>
          <button
            className="mt-4 text-indigo-600 underline"
            onClick={() => {
              const { [month]: _removed, ...rest } = data.budgets
              setData({ ...data, budgets: rest })
            }}
          >
            Setup dobara karo (testing)
          </button>
        </div>
      )}
    </div>
  )
}

export default App