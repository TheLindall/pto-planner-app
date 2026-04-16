import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

/** Wraps any trigger with a tooltip. Usage: <Tip label="Delete"><button>...</button></Tip> */
export function Tip({ label, children, side = "top" }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={side}>{label}</TooltipContent>
    </Tooltip>
  )
}
