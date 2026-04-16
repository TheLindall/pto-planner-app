/**
 * Calculate monthly accrual for a PTO type.
 * Returns the amount accrued per month (in the accrualUnit).
 */
export function monthlyAccrual(ptoType) {
  const { accrualRate, accrualPeriod } = ptoType
  if (accrualPeriod === "weekly") return accrualRate * (52 / 12)
  if (accrualPeriod === "monthly") return accrualRate
  if (accrualPeriod === "annually") return accrualRate / 12
  return 0
}

/**
 * Project balances for a single PTO type over N months starting from today.
 *
 * Returns an array of { month: "YYYY-MM", openingBalance, accrued, withdrawn, closingBalance }
 *
 * @param {object} ptoType
 * @param {Array}  events  - full events array (will filter by ptoTypeId)
 * @param {number} months  - number of months to project
 * @param {Date}   [from]  - start date (defaults to today)
 */
export function projectBucket(ptoType, events = [], months = 12, from = new Date()) {
  const perMonth = monthlyAccrual(ptoType)
  const cap = ptoType.annualCap ?? Infinity

  let balance = ptoType.startingBalance ?? 0
  const rows = []

  for (let i = 0; i < months; i++) {
    const d = new Date(from.getFullYear(), from.getMonth() + i, 1)
    const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`

    const openingBalance = balance

    // No accrual in the first month — starting balance is the current balance as-is
    const accrued = i === 0 ? 0 : Math.max(0, Math.min(perMonth, cap - openingBalance))

    // Sum withdrawals for this month from matching events.
    // Withdrawals are always stored in days; convert to hours if the bucket uses hours.
    const hoursPerDay = ptoType.accrualUnit === "hours" ? 8 : 1
    const withdrawn = events
      .filter((e) => e.month === month)
      .flatMap((e) => e.withdrawals ?? [])
      .filter((w) => w.ptoTypeId === ptoType.id)
      .reduce((sum, w) => sum + (w.days ?? 0) * hoursPerDay, 0)

    const closingBalance = Math.min(openingBalance + accrued - withdrawn, cap)

    rows.push({ month, openingBalance, accrued, withdrawn, closingBalance, availableBalance: closingBalance, atCap: cap !== Infinity && closingBalance >= cap })
    balance = closingBalance
  }

  return rows
}

/**
 * Project all buckets. Returns a map of ptoTypeId → rows array.
 */
export function projectAll(ptoTypes, events = [], months = 12) {
  const result = {}
  for (const pt of ptoTypes) {
    result[pt.id] = projectBucket(pt, events, months)
  }
  return result
}
