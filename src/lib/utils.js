import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/**
 * Format a PTO balance as "X days Y hrs".
 * If the bucket unit is "hours", convert to days first (8 hrs/day).
 */
export function formatBalance(value, unit) {
  const totalHours = unit === "hours" ? value : value * 8
  const days = Math.floor(totalHours / 8)
  const hours = Math.round(totalHours % 8)
  if (days === 0 && hours === 0) return "0 days"
  if (hours === 0) return `${days}d`
  if (days === 0) return `${hours}h`
  return `${days}d ${hours}h`
}
