import { Calendar, Search, X } from "lucide-react";

export default function ListFilters({
  search,
  onSearchChange,
  searchPlaceholder = "Search by name...",
  date,
  onDateChange,
  dateLabel = "Date",
  showDate = true,
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 rounded-xl border border-border bg-card p-2 shadow-sm">
      <div className="relative flex-1 min-w-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          type="text"
          placeholder={searchPlaceholder}
          className="w-full h-10 pl-9 pr-3 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/25"
        />
      </div>

      {showDate && (
        <>
          <div className="hidden sm:block w-px h-8 bg-border shrink-0" />
          <div className="flex items-center gap-2 sm:shrink-0">
            <div className="relative flex-1 sm:flex-initial">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="date"
                value={date}
                onChange={(e) => onDateChange(e.target.value)}
                aria-label={dateLabel}
                title={dateLabel}
                className="w-full sm:w-[168px] h-10 pl-9 pr-3 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/25 dark:[color-scheme:dark]"
              />
            </div>
            {date && (
              <button
                type="button"
                onClick={() => onDateChange("")}
                className="h-10 px-3 rounded-lg border border-border bg-background text-xs text-muted-foreground hover:bg-secondary flex items-center gap-1 shrink-0"
                title="Clear date"
              >
                <X className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
