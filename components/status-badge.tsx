import { cn } from "@/lib/utils"
import type { Anomaly } from "@/lib/types"

interface StatusBadgeProps {
  status: Anomaly["status"]
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const statusColors: Record<Anomaly["status"], string> = {
    New: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    "In Progress": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    Resolved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  }

  return <span className={cn("px-2 py-1 text-xs font-medium rounded-full", statusColors[status])}>{status}</span>
}

StatusBadge.defaultProps = {
  status: "New",
}
