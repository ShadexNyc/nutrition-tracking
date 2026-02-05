import { memo, useMemo, useCallback } from 'react'
import { useNutritionStore } from '../store/nutritionStore'
import { getLocalDateString } from '../utils/date'

/** Дни недели с понедельника (Mon … Sun). */
const DAY_LABELS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

/** Дней от понедельника: Пн=0, Вт=1, …, Вс=6 (getDay: Вс=0, Пн=1, …). */
function daysFromMonday(date: Date): number {
  const d = date.getDay()
  return d === 0 ? 6 : d - 1
}

export const WeekCalendar = memo(function WeekCalendar() {
  const { selectedDate, loadDailyNutrition } = useNutritionStore()

  const { days } = useMemo(() => {
    const today = new Date()
    const offset = daysFromMonday(today)
    const start = new Date(today)
    start.setDate(today.getDate() - offset)
    const days: { date: Date; dateKey: string; label: string; num: number; isToday: boolean }[] = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      days.push({
        date: d,
        dateKey: getLocalDateString(d),
        label: DAY_LABELS_SHORT[i],
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
            key={day.dateKey}
            type="button"
            onClick={() => handleDayClick(day.dateKey)}
            className={`flex flex-col items-center justify-center rounded-xl min-w-[40px] w-fit h-[60px] py-2 px-1 cursor-pointer ${
              day.isToday ? 'bg-[#D3C1FF]' : 'bg-[rgba(244,241,244,1)]'
            }`}
            style={{
              backgroundColor: day.isToday ? '#D3C1FF' : undefined,
              boxShadow: isSelected ? 'inset 0 0 0 1px #9676E5' : undefined,
              color: isSelected && !day.isToday ? '#9676E5' : day.isToday ? '#26222F' : '#919191',
            }}
          >
            <span className="text-[12px] font-normal leading-tight" style={{ color: isSelected && !day.isToday ? '#9676E5' : day.isToday ? '#26222F' : '#919191' }}>{day.label}</span>
            <span className="text-[16px] font-normal leading-tight" style={{ color: isSelected && !day.isToday ? '#9676E5' : day.isToday ? '#26222F' : 'rgba(38, 34, 47, 1)' }}>{day.num}</span>
          </button>
        )
      })}
    </div>
  )
})
