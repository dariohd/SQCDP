import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { formatMonthLabel, generateMonthOptions } from '../lib/utils'

export function MonthSelector() {
  const { monthKey, setMonthKey } = useApp()
  const options = generateMonthOptions()
  const currentIdx = options.findIndex((o) => o.value === monthKey)

  const goPrev = () => {
    if (currentIdx > 0) setMonthKey(options[currentIdx - 1].value)
  }
  const goNext = () => {
    if (currentIdx < options.length - 1) setMonthKey(options[currentIdx + 1].value)
  }

  return (
    <div className="flex items-center justify-center gap-3">
      <button
        onClick={goPrev}
        disabled={currentIdx <= 0}
        className="rounded-xl bg-white p-2.5 text-primary shadow-md transition hover:bg-primary/5 disabled:opacity-30"
      >
        <ChevronLeft size={20} />
      </button>
      <div className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 shadow-md">
        <label htmlFor="month-select" className="text-sm font-medium text-slate-600">
          Mois affiché :
        </label>
        <select
          id="month-select"
          value={monthKey}
          onChange={(e) => setMonthKey(e.target.value)}
          className="cursor-pointer border-none bg-transparent text-lg font-semibold text-primary outline-none"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <button
        onClick={goNext}
        disabled={currentIdx >= options.length - 1}
        className="rounded-xl bg-white p-2.5 text-primary shadow-md transition hover:bg-primary/5 disabled:opacity-30"
      >
        <ChevronRight size={20} />
      </button>
      <span className="hidden text-sm text-slate-500 sm:inline">
        {formatMonthLabel(monthKey)}
      </span>
    </div>
  )
}
