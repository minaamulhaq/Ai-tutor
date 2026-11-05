"use client"

import * as React from "react"
import { cn } from "cn"
import {
  DayPicker,
  getDefaultClassNames,
  type DayButton,
  type Locale,
} from "react-day-picker"

import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon } from "lucide-react"

const CalendarSizeContext = React.createContext<"default" | "full">("default");

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  locale,
  formatters,
  components,
  calendarSize = "default",
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  calendarSize?: "default" | "full";
}) {
  const defaultClassNames = getDefaultClassNames()
  const isFull = calendarSize === "full";

  return (
    <CalendarSizeContext.Provider value={calendarSize}>
      <DayPicker
        showOutsideDays={showOutsideDays}
        className={cn(
          isFull
            ? "group/calendar w-full bg-transparent p-1 sm:p-2 [--cell-radius:var(--radius-lg)]"
            : "group/calendar w-fit bg-transparent p-2 [--cell-radius:var(--radius-md)]",
          String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
          String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
          className
        )}
        captionLayout={captionLayout}
        locale={locale}
        formatters={{
          formatMonthDropdown: (date) =>
            date.toLocaleString(locale?.code, { month: "short" }),
          ...formatters,
        }}
        classNames={{
          root: cn(isFull ? "w-full" : "w-fit", defaultClassNames.root),
          months: cn(
            isFull ? "relative flex flex-col gap-4 w-full" : "relative flex flex-col gap-3",
            defaultClassNames.months
          ),
          month: cn(isFull ? "flex w-full flex-col gap-3" : "flex flex-col gap-2", defaultClassNames.month),
          nav: cn(
            "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1 pointer-events-none z-10",
            defaultClassNames.nav
          ),
          button_previous: cn(
            isFull
              ? "pointer-events-auto size-9 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 flex items-center justify-center shadow-2xs transition-all cursor-pointer select-none active:scale-95 disabled:opacity-30"
              : "pointer-events-auto size-8 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 flex items-center justify-center shadow-2xs transition-all cursor-pointer select-none active:scale-95 disabled:opacity-30",
            defaultClassNames.button_previous
          ),
          button_next: cn(
            isFull
              ? "pointer-events-auto size-9 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 flex items-center justify-center shadow-2xs transition-all cursor-pointer select-none active:scale-95 disabled:opacity-30"
              : "pointer-events-auto size-8 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 flex items-center justify-center shadow-2xs transition-all cursor-pointer select-none active:scale-95 disabled:opacity-30",
            defaultClassNames.button_next
          ),
          month_caption: cn(
            "flex h-8 sm:h-9 w-full items-center justify-center px-8 mb-1",
            defaultClassNames.month_caption
          ),
          caption_label: cn(
            isFull
              ? "text-base sm:text-lg font-bold text-slate-900 select-none tracking-tight"
              : "text-xs sm:text-sm font-bold text-slate-900 select-none tracking-tight",
            defaultClassNames.caption_label
          ),
          month_grid: cn(
            isFull ? "w-full border-collapse table-fixed" : "w-fit border-collapse",
            defaultClassNames.month_grid
          ),
          weekdays: cn(
            isFull ? "flex w-full justify-between items-center mb-1" : "flex justify-between mb-1",
            defaultClassNames.weekdays
          ),
          weekday: cn(
            isFull
              ? "flex-1 text-center font-bold text-xs sm:text-[13px] text-slate-400 py-1.5 uppercase tracking-wider select-none"
              : "size-8 sm:size-9 text-center font-semibold text-[11px] text-slate-400 flex items-center justify-center uppercase tracking-wider select-none",
            defaultClassNames.weekday
          ),
          week: cn(
            isFull
              ? "mt-1 flex w-full justify-between items-center gap-1 sm:gap-1.5"
              : "mt-1 flex justify-between gap-1",
            defaultClassNames.week
          ),
          day: cn(
            isFull
              ? "group/day relative flex-1 aspect-square h-auto p-0 text-center select-none"
              : "group/day relative size-8 sm:size-9 p-0 text-center select-none",
            defaultClassNames.day
          ),
          range_start: cn(
            "relative isolate z-0 rounded-l-xl bg-orange-100",
            defaultClassNames.range_start
          ),
          range_middle: cn("rounded-none bg-orange-50", defaultClassNames.range_middle),
          range_end: cn(
            "relative isolate z-0 rounded-r-xl bg-orange-100",
            defaultClassNames.range_end
          ),
          today: cn(
            "rounded-xl",
            defaultClassNames.today
          ),
          outside: cn(
            "text-slate-400 opacity-40",
            defaultClassNames.outside
          ),
          disabled: cn(
            "text-slate-300 opacity-30",
            defaultClassNames.disabled
          ),
          hidden: cn("invisible", defaultClassNames.hidden),
          ...classNames,
        }}
        components={{
          Root: ({ className, rootRef, ...props }) => {
            return (
              <div
                data-slot="calendar"
                ref={rootRef}
                className={cn(isFull ? "w-full" : "w-fit", className)}
                {...props}
              />
            )
          },
          Chevron: ({ className, orientation, ...props }) => {
            if (orientation === "left") {
              return (
                <ChevronLeftIcon className={cn("size-3.5 sm:size-4 text-slate-700", className)} {...props} />
              )
            }

            if (orientation === "right") {
              return (
                <ChevronRightIcon className={cn("size-3.5 sm:size-4 text-slate-700", className)} {...props} />
              )
            }

            return (
              <ChevronDownIcon className={cn("size-3.5 sm:size-4 text-slate-700", className)} {...props} />
            )
          },
          DayButton: ({ ...props }) => (
            <CalendarDayButton locale={locale} {...props} />
          ),
          WeekNumber: ({ children, ...props }) => {
            return (
              <td {...props}>
                <div className="flex size-8 items-center justify-center text-center">
                  {children}
                </div>
              </td>
            )
          },
          ...components,
        }}
        {...props}
      />
    </CalendarSizeContext.Provider>
  )
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  locale,
  ...props
}: React.ComponentProps<typeof DayButton> & { locale?: Partial<Locale> }) {
  const calendarSize = React.useContext(CalendarSizeContext);
  const isFull = calendarSize === "full";

  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <button
      ref={ref}
      type="button"
      data-slot="calendar-day"
      data-day={day.date.toLocaleDateString(locale?.code)}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      className={cn(
        "relative isolate z-10 flex items-center justify-center p-0 select-none cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-orange-500",
        // Sizing depending on variant
        isFull
          ? "aspect-square w-full min-h-[42px] sm:min-h-[46px] rounded-xl font-semibold text-sm transition-all duration-150"
          : "size-8 sm:size-9 rounded-lg font-medium text-xs sm:text-sm transition-colors",
        // Default unselected state
        !modifiers.selected && !modifiers.today && "text-slate-800 hover:bg-slate-100 hover:text-slate-900 active:scale-95",
        // Today state (if not selected)
        modifiers.today && !modifiers.selected && "border-2 border-orange-500/80 bg-orange-50/70 text-orange-950 font-bold hover:bg-orange-100/70",
        // Selected state
        modifiers.selected && "bg-orange-500 text-white font-bold shadow-md shadow-orange-500/25 hover:bg-orange-600 hover:text-white scale-[1.02]",
        // Outside month
        modifiers.outside && "text-slate-300 opacity-40 hover:opacity-80",
        // Disabled
        modifiers.disabled && "text-slate-300 opacity-30 pointer-events-none",
        className
      )}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }
