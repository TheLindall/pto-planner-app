import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useIsDesktop } from "@/hooks/useIsDesktop"

// Brand-colored (#2b65a1) down chevron, since global CSS strips the native
// select arrow via `appearance: none`.
const CHEVRON =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%232b65a1' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")"

/**
 * A select that renders a native <select> on touch/mobile (reliable iOS wheel
 * picker) and the styled shadcn Select on desktop.
 *
 * @param {string} value
 * @param {(value: string) => void} onValueChange
 * @param {{ value: string, label: string }[]} options
 */
export function ResponsiveSelect({
  value,
  onValueChange,
  options,
  className,
  id,
  placeholder,
  disabled,
  "aria-label": ariaLabel,
}) {
  const isDesktop = useIsDesktop()

  if (!isDesktop) {
    return (
      <select
        id={id}
        aria-label={ariaLabel}
        value={value}
        disabled={disabled}
        onChange={(e) => onValueChange(e.target.value)}
        style={{
          backgroundImage: CHEVRON,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 0.625rem center",
          backgroundSize: "1rem",
        }}
        className={cn(
          "h-11 w-full rounded-lg border border-input bg-[#ffffff] pl-2.5 pr-9 py-1 text-base text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    )
  }

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger id={id} aria-label={ariaLabel} className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
