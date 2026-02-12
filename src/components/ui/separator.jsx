import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

const Separator = React.forwardRef(
  ({ className, orientation = "horizontal", decorative = true, ...props }, ref) => (
    <div
      ref={ref}
      role={decorative ? "none" : "separator"}
      aria-orientation={orientation}
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        "bg-gray-200",
        className
      )}
      {...props} />
  )
)
Separator.displayName = "Separator"

export { Separator }