import { useMemo, useState } from "react";
import { BUDGET_PERIODS, getPeriodKey } from "../services/budgets";

export function BudgetCalendar({
    budgets,
    period,
    periodKey,
    onPeriodKeyChange,
}) {
    const [viewMode, setViewMode] = useState(period);
    const [displayDate, setDisplayDate] = useState(new Date(periodKey ? periodKey.split("-")[0] + "-" + (periodKey.split("-")[1] || "01") : new Date()));

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const budgetDates = useMemo(() => {
        const dates = new Set();
        budgets?.forEach(b => {
            if (b.periodKey) {
                dates.add(b.periodKey);
            }
        });
        return dates;
    }, [budgets]);

    const hasBudgetOnDate = (dateKey) => budgetDates.has(dateKey);

    const getDaysInMonth = (year, month) => new Date(year, month, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month - 1, 1).getDay();

    const navigateMonth = (delta) => {
        const newDate = new Date(displayDate);
        newDate.setMonth(newDate.getMonth() + delta);
        setDisplayDate(newDate);
        const newKey = getPeriodKey(newDate, viewMode);
        onPeriodKeyChange(newKey);
    };

    const navigateWeek = (delta) => {
        const newDate = new Date(displayDate);
        newDate.setDate(newDate.getDate() + delta * 7);
        setDisplayDate(newDate);
        const newKey = getPeriodKey(newDate, viewMode);
        onPeriodKeyChange(newKey);
    };

    const navigateDay = (delta) => {
        const newDate = new Date(displayDate);
        newDate.setDate(newDate.getDate() + delta);
        setDisplayDate(newDate);
        const newKey = getPeriodKey(newDate, viewMode);
        onPeriodKeyChange(newKey);
    };

    const renderMonthView = () => {
        const year = displayDate.getFullYear();
        const month = displayDate.getMonth() + 1;
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);
        const monthName = displayDate.toLocaleString("en-US", { month: "long", year: "numeric" });

        const weeks = [];
        let week = [];
        
        for (let i = 0; i < firstDay; i++) {
            week.push(null);
        }
        
        for (let day = 1; day <= daysInMonth; day++) {
            const dateKey = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const isToday = today.getFullYear() === year && today.getMonth() === month - 1 && today.getDate() === day;
            const hasBudget = hasBudgetOnDate(dateKey);
            
            week.push({ day, dateKey, isToday, hasBudget, isCurrentMonth: true });
            
            if (week.length === 7) {
                weeks.push(week);
                week = [];
            }
        }
        
        if (week.length > 0) {
            while (week.length < 7) week.push(null);
            weeks.push(week);
        }

        return (
            <div className="budget-calendar">
                <div className="flex items-center justify-between mb-3">
                    <button
                        type="button"
                        onClick={() => navigateMonth(-1)}
                        className="p-2 rounded-lg text-(--muted) hover:text-(--ink) hover:bg-(--app)"
                        aria-label="Previous month"
                    >
                        <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-current fill-none stroke-2">
                            <path d="M15 18l-6-6 6-6" />
                        </svg>
                    </button>
                    <h3 className="m-0 text-[16px] font-semibold text-(--ink)">{monthName}</h3>
                    <button
                        type="button"
                        onClick={() => navigateMonth(1)}
                        className="p-2 rounded-lg text-(--muted) hover:text-(--ink) hover:bg-(--app)"
                        aria-label="Next month"
                    >
                        <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-current fill-none stroke-2">
                            <path d="M9 6l6 6-6 6" />
                        </svg>
                    </button>
                </div>
                
                <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-(--muted) mb-1">
                    {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => <div key={d}>{d}</div>)}
                </div>
                
                <div className="grid grid-cols-7 gap-1">
                    {weeks.map((week, wi) => week.map((cell, di) => {
                        if (!cell) return <div key={`${wi}-${di}`} className="aspect-square" />;
                        const { day, dateKey, isToday, hasBudget } = cell;
                        return (
                            <button
                                key={dateKey}
                                type="button"
                                onClick={() => {
                                    setViewMode(BUDGET_PERIODS.daily);
                                    onPeriodKeyChange(dateKey);
                                }}
                                className={`aspect-square rounded-[10px] flex flex-col items-center justify-center text-[12px] font-medium transition-all ${
                                    isToday ? "bg-[var(--brand)] text-white" : "text-(--ink) hover:bg-(--app)"
                                } ${hasBudget ? "relative" : ""}`}
                                aria-label={hasBudget ? `Budget set for ${dateKey}` : `No budget for ${dateKey}`}
                            >
                                {day}
                                {hasBudget && (
                                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[var(--brand)]" />
                                )}
                            </button>
                        );
                    }))}
                </div>
            </div>
        );
    };

    const renderWeekView = () => {
        const startOfWeek = new Date(displayDate);
        startOfWeek.setDate(displayDate.getDate() - displayDate.getDay());
        
        const weekLabel = `${startOfWeek.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${new Date(startOfWeek.getTime() + 6*86400000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

        const days = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(startOfWeek);
            d.setDate(startOfWeek.getDate() + i);
            const dateKey = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
            const isToday = today.getFullYear() === d.getFullYear() && today.getMonth() === d.getMonth() && today.getDate() === d.getDate();
            const hasBudget = hasBudgetOnDate(dateKey);
            days.push({ day: d.getDate(), dateKey, isToday, hasBudget, fullDate: d });
        }

        return (
            <div className="budget-calendar">
                <div className="flex items-center justify-between mb-3">
                    <button
                        type="button"
                        onClick={() => navigateWeek(-1)}
                        className="p-2 rounded-lg text-(--muted) hover:text-(--ink) hover:bg-(--app)"
                        aria-label="Previous week"
                    >
                        <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-current fill-none stroke-2">
                            <path d="M15 18l-6-6 6-6" />
                        </svg>
                    </button>
                    <h3 className="m-0 text-[16px] font-semibold text-(--ink)">{weekLabel}</h3>
                    <button
                        type="button"
                        onClick={() => navigateWeek(1)}
                        className="p-2 rounded-lg text-(--muted) hover:text-(--ink) hover:bg-(--app)"
                        aria-label="Next week"
                    >
                        <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-current fill-none stroke-2">
                            <path d="M9 6l6 6-6 6" />
                        </svg>
                    </button>
                </div>
                
                <div className="grid grid-cols-7 gap-2">
                    {days.map(({ day, dateKey, isToday, hasBudget, fullDate }) => (
                        <button
                            key={dateKey}
                            type="button"
                            onClick={() => {
                                setViewMode(BUDGET_PERIODS.daily);
                                onPeriodKeyChange(dateKey);
                            }}
                            className={`aspect-square rounded-[10px] flex flex-col items-center justify-center text-[12px] font-medium transition-all ${
                                isToday ? "bg-[var(--brand)] text-white" : "text-(--ink) hover:bg-(--app)"
                            } ${hasBudget ? "relative" : ""}`}
                            aria-label={hasBudget ? `Budget set for ${dateKey}` : `No budget for ${dateKey}`}
                        >
                            <span className="text-[10px] text-(--muted)">{fullDate.toLocaleDateString("en-US", { weekday: "short" })}</span>
                            {day}
                            {hasBudget && (
                                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[var(--brand)]" />
                            )}
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    const renderDayView = () => {
        const dateKey = getPeriodKey(displayDate, BUDGET_PERIODS.daily);
        const dayLabel = displayDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
        const hasBudget = hasBudgetOnDate(dateKey);

        return (
            <div className="budget-calendar">
                <div className="flex items-center justify-between mb-3">
                    <button
                        type="button"
                        onClick={() => navigateDay(-1)}
                        className="p-2 rounded-lg text-(--muted) hover:text-(--ink) hover:bg-(--app)"
                        aria-label="Previous day"
                    >
                        <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-current fill-none stroke-2">
                            <path d="M15 18l-6-6 6-6" />
                        </svg>
                    </button>
                    <h3 className="m-0 text-[16px] font-semibold text-(--ink)">{dayLabel}</h3>
                    <button
                        type="button"
                        onClick={() => navigateDay(1)}
                        className="p-2 rounded-lg text-(--muted) hover:text-(--ink) hover:bg-(--app)"
                        aria-label="Next day"
                    >
                        <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-current fill-none stroke-2">
                            <path d="M9 6l6 6-6 6" />
                        </svg>
                    </button>
                </div>
                
                <div className={`aspect-square rounded-[16px] flex flex-col items-center justify-center p-4 text-center ${
                    hasBudget ? "bg-[var(--brand-soft)] border border-[var(--brand)]" : "bg-(--card) border border-(--line)"
                }`}>
                    <span className="text-[14px] text-(--muted) mb-1">Budget for this day</span>
                    <span className={`text-[24px] font-bold ${hasBudget ? "text-[var(--brand)]" : "text-(--ink)"}`}>
                        {hasBudget ? "✓ Budget Set" : "No Budget"}
                    </span>
                    {hasBudget && (
                        <span className="text-[11px] text-(--brand-dk) mt-1">Tap to view details</span>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="bg-(--card) border border-(--line) rounded-[16px] p-3 mb-3">
            <div className="flex items-center gap-2 mb-3">
                <button
                    type="button"
                    onClick={() => setViewMode(BUDGET_PERIODS.monthly)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors ${
                        viewMode === BUDGET_PERIODS.monthly
                            ? "bg-[var(--brand)] text-white"
                            : "text-(--muted) hover:bg-(--app)"
                    }`}
                >
                    Month
                </button>
                <button
                    type="button"
                    onClick={() => setViewMode(BUDGET_PERIODS.weekly)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors ${
                        viewMode === BUDGET_PERIODS.weekly
                            ? "bg-[var(--brand)] text-white"
                            : "text-(--muted) hover:bg-(--app)"
                    }`}
                >
                    Week
                </button>
                <button
                    type="button"
                    onClick={() => setViewMode(BUDGET_PERIODS.daily)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors ${
                        viewMode === BUDGET_PERIODS.daily
                            ? "bg-[var(--brand)] text-white"
                            : "text-(--muted) hover:bg-(--app)"
                    }`}
                >
                    Day
                </button>
            </div>

            {viewMode === BUDGET_PERIODS.monthly && renderMonthView()}
            {viewMode === BUDGET_PERIODS.weekly && renderWeekView()}
            {viewMode === BUDGET_PERIODS.daily && renderDayView()}

            <div className="flex items-center gap-2 mt-3 pt-2 border-t border-(--line) text-[10px] text-(--muted)">
                <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[var(--brand)]" />
                    Has budget
                </span>
                <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[var(--brand)]" style={{ opacity: 0.3 }} />
                    Selected
                </span>
            </div>
        </div>
    );
}