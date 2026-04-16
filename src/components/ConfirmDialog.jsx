import { ResponsiveDialog } from "./ResponsiveDialog"
import { Button } from "@/components/ui/button"

export function ConfirmDialog({ open, onOpenChange, title, message, confirmLabel = "Delete", onConfirm }) {
  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange} title={title}>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">{message}</p>
        <div className="flex gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            className="h-11 sm:h-9 flex-1 sm:flex-none bg-white text-destructive hover:text-destructive"
            onClick={() => { onConfirm(); onOpenChange(false) }}
          >
            {confirmLabel}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-11 sm:h-9 flex-1 sm:flex-none"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
        </div>
      </div>
    </ResponsiveDialog>
  )
}
