import { memo, useMemo, useCallback } from 'react'
import { useNutritionStore } from '../store/nutritionStore'

const DAY_LABELS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function formatDateKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export const WeekCalendar = memo(function WeekCalendar() {
  const { selectedDate, loadDailyNutrition } = useNutritionStore()

  const { days } = useMemo(() => {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const start = new Date(today)
    start.setDate(today.getDate() - dayOfWeek)
    const days: { date: Date; dateKey: string; label: string; num: number; isToday: boolean }[] = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      days.push({
        date: d,
        dateKey: formatDateKey(d),
        label: DAY_LABELS_SHORT[d.getDay()],
        num: d.getDate(),
        isToday:
          d.getDate() === today.getDate() &&
          d.getMonth() === today.getMonth() &&
          d.getFullYear() === today.getFullYear(),
      })
    }
    return { days }
  }, [])

  const handleDayClick = useCallback(
    (dateKey: string) => {
      loadDailyNutrition(dateKey)
    },
    [loadDailyNutrition]
  )

  return (
    <div className="flex gap-0 justify-between">
      {days.map((day) => {
        const isSelected = day.dateKey === selectedDate
        return (
          <button
            key={day.date.toISOString()}
            type="button"
            onClick={() => handleDayClick(day.dateKey)}
            className={`flex flex-col items-center justify-center rounded-xl min-w-[40px] w-fit h-[60px] py-2 px-1 cursor-pointer ${
              day.isToday ? 'bg-[#D3C1FF]' : 'bg-[rgba(244,241,244,1)]'
            }`}
            style={{
              backgroundColor: day.isToday ? '#D3C1FF' : undefined,
              boxShadow: isSelected ? 'inset 0 0 0 1px #A385EC' : undefined,
              color: '#26222F',
            }}
          >
            <span className="text-[12px] font-normal leading-tight" style={{ color: isSelected || day.isToday ? '#26222F' : '#919191' }}>{day.label}</span>
            <span className="text-[16px] font-normal leading-tight">{day.num}</span>
          </button>
        )
      })}
    </div>
  )
})
