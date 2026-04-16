import { useState } from "react"
import { generateId } from "@/lib/uuid"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ResponsiveDialog } from "./ResponsiveDialog"
import { ConfirmDialog } from "./ConfirmDialog"
import { PtoTypeForm } from "./PtoTypeForm"
import { Tip } from "./Tip"
import { Pencil, Trash2, Plus, TrendingUp, Wallet, Lock } from "lucide-react"

function formatAccrual(pt) {
  const period = pt.accrualPeriod.charAt(0).toUpperCase() + pt.accrualPeriod.slice(1)
  return `${pt.accrualRate} ${pt.accrualUnit} / ${period}`
}

export function SetupView({ ptoTypes, onChange }) {
  const [dialog, setDialog] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  function handleSave(values) {
    if (dialog.mode === "add") {
      const id = generateId()
      onChange([...ptoTypes, { ...values, id }])
    } else {
      onChange(ptoTypes.map((pt) => (pt.id === dialog.pt.id ? { ...values, id: pt.id } : pt)))
    }
    setDialog(null)
  }

  function handleDelete(id, name) {
    setConfirmDelete({ id, name })
  }

  function handleConfirmDelete() {
    onChange(ptoTypes.filter((pt) => pt.id !== confirmDelete.id))
    setConfirmDelete(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">PTO Buckets</h2>
        <Button className="hidden sm:flex h-9" onClick={() => setDialog({ mode: "add" })}>
          <Plus className="mr-1 size-4" aria-hidden="true" />
          Add Bucket
        </Button>
      </div>

      {ptoTypes.length === 0 && (
        <div className="flex flex-col items-center gap-4 py-8">
          <p className="text-sm text-muted-foreground">No PTO buckets yet. Add one to get started.</p>
          <Button className="sm:hidden h-11" onClick={() => setDialog({ mode: "add" })}>
            <Plus className="mr-1 size-4" aria-hidden="true" />
            Add Bucket
          </Button>
        </div>
      )}

      {ptoTypes.length > 0 && <ul className="grid gap-3 sm:grid-cols-2 list-none p-0 m-0">
        {ptoTypes.map((pt) => (
          <li key={pt.id}>
          <Card className="gap-2 overflow-hidden">
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base">{pt.name}</CardTitle>
                {/* Desktop icon buttons */}
                <div className="hidden sm:flex gap-1 shrink-0">
                  <Tip label={`Edit ${pt.name}`}>
                    <Button
                      variant="ghost"
                      size="icon-lg"
                      aria-label={`Edit ${pt.name}`}
                      onClick={() => setDialog({ mode: "edit", pt })}
                    >
                      <Pencil className="size-3.5" aria-hidden="true" />
                    </Button>
                  </Tip>
                  <Tip label={`Delete ${pt.name}`}>
                    <Button
                      variant="ghost"
                      size="icon-lg"
                      aria-label={`Delete ${pt.name}`}
                      onClick={() => handleDelete(pt.id, pt.name)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" aria-hidden="true" />
                    </Button>
                  </Tip>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {pt.notes && (
                <p className="text-sm text-muted-foreground mb-2">{pt.notes}</p>
              )}
              <div className="flex flex-wrap gap-1">
                <Badge variant="secondary"><TrendingUp className="size-3" aria-hidden="true" />{formatAccrual(pt)}</Badge>
                <Badge variant="secondary"><Wallet className="size-3" aria-hidden="true" />Balance: {pt.startingBalance} {pt.accrualUnit}</Badge>
                {pt.annualCap && (
                  <Badge variant="secondary"><Lock className="size-3" aria-hidden="true" />Cap: {pt.annualCap} {pt.accrualUnit}</Badge>
                )}
              </div>
            </CardContent>
            {/* Mobile action row */}
            <div className="flex sm:hidden gap-2 px-3">
              <Button
                variant="outline"
                aria-label={`Edit ${pt.name}`}
                onClick={() => setDialog({ mode: "edit", pt })}
                className="flex-1 h-11 bg-white"
              >
                <Pencil className="size-4" aria-hidden="true" />
                Edit
              </Button>
              <Button
                variant="outline"
                aria-label={`Delete ${pt.name}`}
                onClick={() => handleDelete(pt.id, pt.name)}
                className="flex-1 h-11 bg-white text-destructive hover:text-destructive"
              >
                <Trash2 className="size-4" aria-hidden="true" />
                Delete
              </Button>
            </div>
          </Card>
          </li>
        ))}
      </ul>}

      {ptoTypes.length > 0 && (
        <Button className="sm:hidden w-full h-11" onClick={() => setDialog({ mode: "add" })}>
          <Plus className="mr-1 size-4" aria-hidden="true" />
          Add Bucket
        </Button>
      )}

      <ResponsiveDialog
        open={!!dialog}
        onOpenChange={(open) => !open && setDialog(null)}
        title={dialog?.mode === "add" ? "Add PTO Bucket" : `Edit ${dialog?.pt?.name}`}
      >
        {dialog && (
          <PtoTypeForm
            initial={dialog.mode === "edit" ? dialog.pt : undefined}
            onSave={handleSave}
            onCancel={() => setDialog(null)}
          />
        )}
      </ResponsiveDialog>

      <ConfirmDialog
        open={!!confirmDelete}
        onOpenChange={(open) => !open && setConfirmDelete(null)}
        title={`Delete "${confirmDelete?.name}"?`}
        message="This cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
