import { useState, useEffect } from "react"

const STORAGE_KEY = "pto-planner-data"

const defaultData = {
  ptoTypes: [],
  events: [],
}

export function useStorage() {
  const [data, setData] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? { ...defaultData, ...JSON.parse(raw) } : defaultData
    } catch {
      return defaultData
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }, [data])

  function setPtoTypes(ptoTypes) {
    setData((d) => ({ ...d, ptoTypes }))
  }

  function setEvents(events) {
    setData((d) => ({ ...d, events }))
  }

  return { data, setPtoTypes, setEvents }
}
