import type { MonitorTableRow } from "../types/monitor.table.types"

export const monitorSortComparator = (
  a: MonitorTableRow,
  b: MonitorTableRow,
) => {
  const priorityA = a.priority_sort ?? 99
  const priorityB = b.priority_sort ?? 99

  if (priorityA !== priorityB) {
    return priorityA - priorityB
  }

  const attentionA = a.attention_datetime
    ? new Date(a.attention_datetime).getTime()
    : Number.MAX_SAFE_INTEGER

  const attentionB = b.attention_datetime
    ? new Date(b.attention_datetime).getTime()
    : Number.MAX_SAFE_INTEGER

  return attentionA - attentionB
}