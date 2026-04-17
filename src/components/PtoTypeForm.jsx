import { useState } from "react"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const inputClass = "h-11 sm:h-9"
const triggerClass = "h-11 sm:h-9"

const defaults = {
  name: "",
  accrualRate: "",
  accrualUnit: "days",
  notes: "",
  accrualPeriod: "monthly",
  annualCap: "",
  startingBalance: "",
}

export function PtoTypeForm({ initial, onSave, onCancel, onDelete }) {
  const [form, setForm] = useState({ ...defaults, ...initial })
  const [error, setError] = useState(null)

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function handleSubmit(e) {
    e?.preventDefault()
    if (!form.name.trim()) {
      setError("Name is required")
      return
    }
    setError(null)
    onSave({
      ...form,
      accrualRate: Number(form.accrualRate) || 0,
      annualCap: form.annualCap !== "" ? Number(form.annualCap) : null,
      startingBalance: Number(form.startingBalance) || 0,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-1.5">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          placeholder="e.g. Vacation, Sick Leave"
          value={form.name}
          onChange={(e) => { set("name", e.target.value); setError(null) }}
          className={inputClass}
        />
        {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-1.5">
          <Label htmlFor="accrualRate">Accrual Rate</Label>
          <Input
            id="accrualRate"
            type="number"
            min="0"
            step="0.01"
            placeholder="e.g. 1.5"
            value={form.accrualRate}
            onChange={(e) => set("accrualRate", e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="grid gap-1.5">
          <Label>Unit</Label>
          <Select value={form.accrualUnit} onValueChange={(v) => set("accrualUnit", v)}>
            <SelectTrigger className={triggerClass}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="days">Days</SelectItem>
              <SelectItem value="hours">Hours</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-1.5">
          <Label>Accrual Period</Label>
          <Select value={form.accrualPeriod} onValueChange={(v) => set("accrualPeriod", v)}>
            <SelectTrigger className={triggerClass}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="annually">Annually</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="annualCap">Annual Cap (optional)</Label>
        <Input
          id="annualCap"
          type="number"
          min="0"
          step="0.01"
          placeholder="No cap"
          value={form.annualCap}
          onChange={(e) => set("annualCap", e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="startingBalance">Starting Balance ({form.accrualUnit})</Label>
        <Input
          id="startingBalance"
          type="number"
          min="0"
          step="0.01"
          placeholder="0"
          value={form.startingBalance}
          onChange={(e) => set("startingBalance", e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="notes">Notes (optional)</Label>
        <textarea
          id="notes"
          rows={3}
          placeholder="e.g. Rolls over up to 5 days, resets Jan 1"
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          className="w-full rounded-md border border-input bg-[#ffffff] px-3 py-2 text-base sm:text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
        />
      </div>

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
