import { useEffect, useState } from 'react'
import { loadData, saveData, type AppData } from '../services/storage'


export function useAppData() {
  const [data, setData] = useState<AppData>(loadData)

  useEffect(() => {
    saveData(data)
  }, [data])

  return [data, setData] as const
}