import { cn } from "@/lib/utils"

interface MiniBarChartProps {
  data: { label: string; value: number }[]
  barClassName?: string
  height?: number
}

// Plain CSS bars, not SVG — matches the div-based progress bar already used
// in CampaignsPage rather than introducing a charting dependency for what's
// a handful of 7-day trend points.
export function MiniBarChart({ data, barClassName = "bg-indigo-500", height = 56 }: MiniBarChartProps) {
  const max = Math.max(1, ...data.map((d) => d.value))
  return (
    <div className="flex items-end gap-1.5" style={{ height }}>
      {data.map((d) => (
        <div key={d.label} className="flex flex-1 flex-col items-center gap-1" title={`${d.label}: ${d.value}`}>
          <div className="flex w-full flex-1 items-end">
            <div
              className={cn("w-full rounded-t-sm transition-all", barClassName)}
              style={{ height: `${Math.max(3, (d.value / max) * 100)}%` }}
            />
          </div>
          <span className="text-[9px] whitespace-nowrap text-muted-foreground">
            {d.label.slice(5).replace("-", "/")}
          </span>
        </div>
      ))}
    </div>
  )
}
