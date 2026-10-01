import { useAppData } from './useAppData'

function App() {
  const [data, setData] = useAppData()

  const addTestExpense = () => {
    setData({
      ...data,
      expenses: [
        ...data.expenses,
        {
          id: crypto.randomUUID(),
          amount: 45,
          categoryId: data.categories[0].id,
          date: '2026-10-01',
        },
      ],
    })
  }

  return (
    <div>
      <h1>Budget Planner</h1>
      <p>Categories: {data.categories.map((c) => c.name).join(', ')}</p>
      <p>Expenses: {data.expenses.length}</p>
      <button onClick={addTestExpense}>Test expense add</button>
    </div>
  )
}

export default App