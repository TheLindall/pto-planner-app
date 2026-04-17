import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2 } from "lucide-react"

const inputClass = "h-11 sm:h-9"
const triggerClass = "h-11 sm:h-9"

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

// Generate the 12 months in the projection window
function getProjectionMonths() {
  const now = new Date()
  const months = []
  for (let i = 0; i < 24; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
    months.push({ year: d.getFullYear(), month: d.getMonth() + 1 })
  }
  return months
}

function parseMonth(yyyyMM) {
  if (!yyyyMM) return { year: "", month: "" }
  const [y, m] = yyyyMM.split("-")
  return { year: Number(y), month: Number(m) }
}

function toYYYYMM(year, month) {
  if (!year || !month) return ""
  return `${year}-${String(month).padStart(2, "0")}`
}

const defaults = {
  name: "",
  month: "",
  description: "",
  budget: "",
}

export function EventForm({ initial, ptoTypes, onSave, onCancel, onDelete }) {
  const [errors, setErrors] = useState({})
  const [form, setForm] = useState(() => {
    const base = { ...defaults, ...initial }
    // Ensure withdrawals exist for every ptoType
    const withdrawalMap = Object.fromEntries(
      (initial?.withdrawals ?? []).map((w) => [w.ptoTypeId, w.days])
    )
    const withdrawals = ptoTypes.map((pt) => ({
      ptoTypeId: pt.id,
      days: withdrawalMap[pt.id] ?? "",
    }))
    return { ...base, withdrawals }
  })

  function setField(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function setWithdrawal(ptoTypeId, value) {
    setForm((f) => ({
      ...f,
      withdrawals: f.withdrawals.map((w) =>
        w.ptoTypeId === ptoTypeId ? { ...w, days: value } : w
      ),
    }))
  }

  function handleSubmit(e) {
    e?.preventDefault()
    const errs = {}
    if (!form.name.trim()) errs.name = "Name is required"
    if (!form.month) errs.month = "Month is required"
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    onSave({
      ...form,
      budget: form.budget !== "" ? Number(form.budget) : null,
      withdrawals: form.withdrawals
        .filter((w) => w.days !== "" && Number(w.days) > 0)
        .map((w) => ({ ptoTypeId: w.ptoTypeId, days: Math.round(Number(w.days)) })),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-1.5">
        <Label htmlFor="name">Event Name</Label>
        <Input
          id="name"
          placeholder="e.g. Summer vacation"
          value={form.name}
          onChange={(e) => { setField("name", e.target.value); setErrors((s) => ({ ...s, name: null })) }}
          className={inputClass}
        />
        {errors.name && <p role="alert" className="text-xs text-destructive">{errors.name}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-1.5">
          <Label>Month</Label>
          {(() => {
            const projMonths = getProjectionMonths()
            const availableYears = [...new Set(projMonths.map((m) => m.year))]
            const { year: selYear, month: selMonth } = parseMonth(form.month)
            const availableMonths = projMonths.filter((m) => m.year === selYear)
            return (
              <div className="flex gap-2">
                <Select
                  value={selMonth ? String(selMonth) : ""}
                  onValueChange={(m) => setField("month", toYYYYMM(selYear, Number(m)))}
                  disabled={!selYear}
                >
                  <SelectTrigger className={`flex-1 ${triggerClass}`}>
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableMonths.map(({ month }) => (
                      <SelectItem key={month} value={String(month)}>
                        {MONTH_NAMES[month - 1]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={selYear ? String(selYear) : ""}
                  onValueChange={(y) => {
                    const yr = Number(y)
                    const firstMonth = projMonths.find((m) => m.year === yr)?.month
                    setField("month", toYYYYMM(yr, selMonth && projMonths.find((m) => m.year === yr && m.month === selMonth) ? selMonth : firstMonth))
                  }}
                >
                  <SelectTrigger className={`w-24 ${triggerClass}`} aria-label="Year">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableYears.map((y) => (
                      <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )
          })()}
          {errors.month && <p role="alert" className="text-xs text-destructive">{errors.month}</p>}
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="budget">Budget (optional)</Label>
          <Input
            id="budget"
            type="number"
            min="0"
            step="0.01"
            placeholder="e.g. 2000"
            value={form.budget}
            onChange={(e) => setField("budget", e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="description">Description (optional)</Label>
        <Input
          id="description"
          placeholder="Brief notes"
          value={form.description}
          onChange={(e) => setField("description", e.target.value)}
          className={inputClass}
        />
      </div>

      {ptoTypes.length > 0 && (
        <div className="grid gap-2">
          <Label>PTO Withdrawals</Label>
          <div className="rounded-lg border divide-y">
            {ptoTypes.map((pt) => {
              const w = form.withdrawals.find((w) => w.ptoTypeId === pt.id)
              return (
                <div key={pt.id} className="flex items-center justify-between px-3 py-2 gap-3">
                  <span className="text-sm">
                    {pt.name}
                    <span className="text-muted-foreground ml-1 text-xs">days</span>
                  </span>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="0"
                    value={w?.days ?? ""}
                    onChange={(e) => setWithdrawal(pt.id, e.target.value)}
                    className={`w-24 text-right ${inputClass}`}
                  />
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-2 items-center">
        {onDelete && (
          <Button type="button" variant="ghost" className="h-11 sm:h-9 text-destructive hover:text-destructive shrink-0 px-2" onClick={onDelete}>
            <Trash2 className="size-4" aria-hidden="true" />
            Delete
          </Button>
        )}
        <div className="flex gap-2 flex-1 sm:flex-none sm:ml-auto">
          {onCancel && (
            <Button type="button" variant="outline" className="h-11 sm:h-9 flex-1 sm:flex-none" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="button" onClick={handleSubmit} className="h-11 sm:h-9 flex-1 sm:flex-none">Save</Button>
        </div>
      </div>
    </form>
  )
}
