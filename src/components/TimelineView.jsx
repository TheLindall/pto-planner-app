import { useState, useRef, useEffect } from "react"
import { generateId } from "@/lib/uuid"
import { projectAll } from "@/engine/accrual"
import { cn, formatBalance } from "@/lib/utils"
import { LockOpen, Plus, Pencil, Trash2, TriangleAlert } from "lucide-react"
import { ConfirmDialog } from "./ConfirmDialog"
import { Button } from "@/components/ui/button"
import { ResponsiveDialog } from "./ResponsiveDialog"
import { EventForm } from "./EventForm"
import { Tip } from "./Tip"
import { Input } from "@/components/ui/input"

function formatMonth(yyyyMM) {
  const [year, month] = yyyyMM.split("-")
  return new Date(year, month - 1, 1).toLocaleDateString("en-US", { month: "short", year: "numeric" })
}

function formatMonthShort(yyyyMM) {
  const [year, month] = yyyyMM.split("-")
  return new Date(year, month - 1, 1).toLocaleDateString("en-US", { month: "short" }) + " '" + String(year).slice(2)
}

export function TimelineView({ ptoTypes, events, onEventsChange, onPtoTypesChange, onNavigate }) {
  const [dialog, setDialog] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const legendRef = useRef(null)
  const [legendVisible, setLegendVisible] = useState(true)

  useEffect(() => {
    const el = legendRef.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => setLegendVisible(entry.isIntersecting), { threshold: 0 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const oneMonthAgo = new Date()
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
  const hasStaleBalance = ptoTypes.some(
    (pt) => pt.startingBalanceUpdatedAt && new Date(pt.startingBalanceUpdatedAt) < oneMonthAgo
  )

  if (ptoTypes.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">24-Month Projection</h2>
        <div className="flex flex-col items-center gap-4 py-8">
          <p className="text-muted-foreground text-sm">No PTO buckets set up yet.</p>
          <Button className="h-11 sm:h-9" onClick={() => onNavigate("setup")}>Go make a bucket</Button>
        </div>
      </div>
    )
  }

  const projections = projectAll(ptoTypes, events, 24)
  const months = projections[ptoTypes[0].id].map((r) => r.month)

  function handleSave(values) {
    if (dialog.mode === "add") {
      onEventsChange([...events, { ...values, id: generateId() }])
    } else {
      onEventsChange(events.map((e) => (e.id === dialog.event.id ? { ...values, id: e.id } : e)))
    }
    setDialog(null)
  }

  function handleDelete(id, name) {
    setDialog(null)
    setConfirmDelete({ id, name })
  }

  function handleConfirmDelete() {
    onEventsChange(events.filter((e) => e.id !== confirmDelete.id))
    setConfirmDelete(null)
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold mb-3">24-Month Projection</h2>
        <div className="rounded-lg border px-4 py-3 bg-white">
          <p className="text-sm text-muted-foreground mb-3">Starting Balances</p>
          {hasStaleBalance && (
            <p className="mb-3 text-sm text-destructive flex items-center gap-1"><TriangleAlert className="size-3 shrink-0" aria-hidden="true" />Balance values entered over a month ago. Enter the latest balances for accuracy.</p>
          )}
          <div className="flex flex-wrap gap-4">
            {ptoTypes.map((pt) => (
              <div key={pt.id} className="flex items-center gap-2">
                <label htmlFor={`balance-${pt.id}`} className="text-sm font-medium whitespace-nowrap">
                  {pt.name}
                </label>
                <Input
                  id={`balance-${pt.id}`}
                  type="number"
                  min="0"
                  step="1"
                  value={pt.startingBalance ?? 0}
                  onChange={(e) =>
                    onPtoTypesChange(
                      ptoTypes.map((p) =>
                        p.id === pt.id ? { ...p, startingBalance: Number(e.target.value), startingBalanceUpdatedAt: new Date().toISOString() } : p
                      )
                    )
                  }
                  className="w-24 text-right"
                  aria-label={`Starting balance for ${pt.name} in ${pt.accrualUnit}`}
                />
                <span className="text-xs text-muted-foreground">{pt.accrualUnit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="w-full text-sm" aria-label="PTO balance projections">
          <thead>
            <tr className="border-b bg-muted/50">
              <th scope="col" className="px-2 sm:px-4 py-2 text-left font-medium text-muted-foreground w-16 sm:w-32">Month</th>
              <th scope="col" className="px-4 py-2 text-left font-medium text-muted-foreground">Events</th>
              {ptoTypes.map((pt) => (
                <th key={pt.id} scope="col" className="px-4 py-2 text-right font-medium whitespace-nowrap">
                  {pt.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {months.map((month, i) => {
              const monthEvents = events.filter((e) => e.month === month)
              const rowBg = "bg-white"

              return (
                <>
                  {/* Balance row */}
                  <tr key={month} className={cn(rowBg, monthEvents.length === 0 && "border-b last:border-0")}>
                    <td className="px-2 sm:px-4 py-2 text-foreground font-medium">
                      <span className="hidden sm:inline">{formatMonth(month)}</span>
                      <span className="sm:hidden">{formatMonthShort(month)}</span>
                    </td>
                    <td className="px-2 py-2">
                      <Tip label={`Add event in ${formatMonth(month)}`} side="right">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Add event in ${formatMonth(month)}`}
                          className="text-accent-foreground"
                          onClick={() => setDialog({ mode: "add", month })}
                        >
                          <Plus className="size-3.5" aria-hidden="true" />
                        </Button>
                      </Tip>
                    </td>
                    {ptoTypes.map((pt) => {
                      const row = projections[pt.id][i]
                      const balance = row.availableBalance
                      const nearCap = pt.annualCap && !row.atCap && balance >= pt.annualCap * 0.9
                      const isNeg = balance < 0
                      return (
                        <td
                          key={pt.id}
                          className={cn(
                            "px-4 py-2 text-right font-medium tabular-nums whitespace-nowrap",
                            isNeg ? "text-destructive" : row.atCap || nearCap ? "text-destructive" : ""
                          )}
                          aria-label={isNeg ? `${pt.name}: negative balance` : row.atCap ? `${pt.name}: at annual cap` : undefined}
                        >
                          <span className="inline-flex items-center justify-end gap-1">
                            {isNeg && <TriangleAlert className="size-3 shrink-0" aria-hidden="true" />}
                            {row.atCap && <LockOpen className="size-3 shrink-0" aria-hidden="true" />}
                            {formatBalance(balance, pt.accrualUnit)}
                          </span>
                        </td>
                      )
                    })}
                  </tr>

                  {/* Event rows */}
                  {monthEvents.map((event, ei) => (
                    <tr
                      key={event.id}
                      className={cn(rowBg, ei === monthEvents.length - 1 && "border-b", "hover:bg-muted transition-colors")}
                    >
                      <td><span className="sr-only">{formatMonth(month)}</span></td>
                      <td className="px-4 py-1 max-w-[140px] sm:max-w-none">
                        <span className="inline-flex items-center gap-2 flex-nowrap min-w-0">
                          <span className="text-foreground truncate font-medium">{event.name}</span>
                          {event.description && <><span className="hidden sm:inline text-muted-foreground">·</span><span className="hidden sm:inline text-muted-foreground truncate">{event.description}</span></>}
                          {event.budget != null && <><span className="hidden sm:inline text-muted-foreground">·</span><span className="hidden sm:inline text-muted-foreground tabular-nums shrink-0">${event.budget.toLocaleString()}</span></>}
                          <Tip label={`Edit ${event.name}`}>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label={`Edit ${event.name}`}
                              className="h-auto p-0.5 text-muted-foreground shrink-0"
                              onClick={() => setDialog({ mode: "edit", event })}
                            >
                              <Pencil className="size-3" aria-hidden="true" />
                            </Button>
                          </Tip>
                          <Tip label={`Delete ${event.name}`}>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label={`Delete ${event.name}`}
                              className="hidden sm:inline-flex h-auto p-0.5 text-muted-foreground shrink-0"
                              onClick={() => handleDelete(event.id, event.name)}
                            >
                              <Trash2 className="size-3" aria-hidden="true" />
                            </Button>
                          </Tip>
                        </span>
                      </td>
                      {ptoTypes.map((pt) => {
                        const w = event.withdrawals?.find((w) => w.ptoTypeId === pt.id)
                        return (
                          <td
                            key={pt.id}
                            className="px-4 py-1 text-right text-muted-foreground tabular-nums"
                            aria-label={w ? `${w.days} days withdrawn from ${pt.name}` : undefined}
                          >
                            {w ? `−${w.days}d` : ""}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Inline legend */}
      <div ref={legendRef} className="flex gap-4 text-xs text-muted-foreground" aria-label="Legend">
        <span className="inline-flex items-center gap-1"><TriangleAlert className="inline size-3 text-destructive" aria-hidden="true" />: negative balance</span>
        <span className="inline-flex items-center gap-1"><LockOpen className="inline size-3 text-destructive" aria-hidden="true" />: annual cap</span>
      </div>

      {/* Floating legend badge — shown when inline legend is scrolled off */}
      {!legendVisible && (
        <div className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 flex gap-4 items-center bg-white border rounded-full px-8 py-2 text-xs shadow-md pointer-events-none whitespace-nowrap" aria-hidden="true">
          <span className="inline-flex items-center gap-1"><TriangleAlert className="inline size-3 text-destructive" />: negative balance</span>
          <span className="text-muted-foreground">·</span>
          <span className="inline-flex items-center gap-1"><LockOpen className="inline size-3 text-destructive" />: annual cap</span>
        </div>
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        onOpenChange={(open) => !open && setConfirmDelete(null)}
        title={`Delete "${confirmDelete?.name}"?`}
        message="This cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
      />

      <ResponsiveDialog
        open={!!dialog}
        onOpenChange={(open) => !open && setDialog(null)}
        title={dialog?.mode === "add" ? `Add Event: ${formatMonth(dialog.month)}` : `Edit ${dialog?.event?.name}`}
      >
        {dialog && (
          <EventForm
            initial={dialog.mode === "edit" ? dialog.event : { month: dialog.month }}
            ptoTypes={ptoTypes}
            onSave={handleSave}
            onCancel={() => setDialog(null)}
            onDelete={dialog.mode === "edit" ? () => { handleDelete(dialog.event.id, dialog.event.name) } : null}
          />
        )}
      </ResponsiveDialog>
    </div>
  )
}
