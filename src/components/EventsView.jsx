import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { EventForm } from "./EventForm"
import { Pencil, Trash2, Plus } from "lucide-react"

function formatMonth(yyyyMM) {
  const [year, month] = yyyyMM.split("-")
  return new Date(year, month - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" })
}

export function EventsView({ events, ptoTypes, onChange }) {
  const [dialog, setDialog] = useState(null)

  function handleSave(values) {
    if (dialog.mode === "add") {
      const id = crypto.randomUUID()
      onChange([...events, { ...values, id }])
    } else {
      onChange(events.map((e) => (e.id === dialog.event.id ? { ...values, id: e.id } : e)))
    }
    setDialog(null)
  }

  function handleDelete(id) {
    onChange(events.filter((e) => e.id !== id))
  }

  const sorted = [...events].sort((a, b) => a.month.localeCompare(b.month))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Events</h2>
        <Button onClick={() => setDialog({ mode: "add" })}>
          <Plus className="mr-1 size-4" />
          Add Event
        </Button>
      </div>

      {events.length === 0 && (
        <p className="text-sm text-muted-foreground py-8 text-center">
          No events yet. Add planned PTO to see it reflected in the timeline.
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {sorted.map((event) => {
          const totalDays = event.withdrawals?.reduce((s, w) => s + w.days, 0) ?? 0
          return (
            <Card key={event.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">{event.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{formatMonth(event.month)}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon-lg"
                      onClick={() => setDialog({ mode: "edit", event })}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-lg"
                      onClick={() => handleDelete(event.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                {event.description && (
                  <p className="text-muted-foreground">{event.description}</p>
                )}
                {event.withdrawals?.length > 0 && (
                  <div className="pt-1 space-y-0.5">
                    {event.withdrawals.map((w) => {
                      const pt = ptoTypes.find((p) => p.id === w.ptoTypeId)
                      return pt ? (
                        <p key={w.ptoTypeId}>
                          {w.days} days from {pt.name}
                        </p>
                      ) : null
                    })}
                  </div>
                )}
                {totalDays > 0 && (
                  <p className="text-muted-foreground pt-1">Total: {totalDays} days</p>
                )}
                {event.budget && (
                  <p className="text-muted-foreground">Budget: ${event.budget.toLocaleString()}</p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Dialog open={!!dialog} onOpenChange={(open) => !open && setDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{dialog?.mode === "add" ? "Add Event" : "Edit Event"}</DialogTitle>
          </DialogHeader>
          {dialog && (
            <EventForm
              initial={dialog.mode === "edit" ? dialog.event : undefined}
              ptoTypes={ptoTypes}
              onSave={handleSave}
              onCancel={() => setDialog(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
