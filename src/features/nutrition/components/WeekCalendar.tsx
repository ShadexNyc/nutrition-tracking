import { memo, useMemo } from 'react'

const DAY_LABELS_SHORT = ['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ']

export const WeekCalendar = memo(function WeekCalendar() {
  const { days } = useMemo(() => {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const start = new Date(today)
    start.setDate(today.getDate() - dayOfWeek)
    const days: { date: Date; label: string; num: number; isToday: boolean }[] = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      days.push({
        date: d,
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

  return (
    <div className="flex gap-0 justify-between">
      {days.map((day) => (
        <div
          key={day.date.toISOString()}
          className={`flex flex-col items-center justify-center rounded-xl min-w-[40px] w-fit h-[60px] py-2 px-1 ${
            day.isToday ? 'bg-[#D3C1FF] text-primary' : 'bg-[rgba(244,241,244,1)] text-secondary'
          }`}
          style={{
            backgroundColor: day.isToday ? '#D3C1FF' : undefined,
            color: day.isToday ? '#26222F' : 'rgba(117, 117, 117, 1)',
          }}
        >
          <span className="text-[12px] font-normal leading-tight">{day.label}</span>
          <span className="text-[12px] font-normal leading-tight">{day.num}</span>
        </div>
      ))}
    </div>
  )
})
