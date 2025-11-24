import * as React from "react"
import { cn } from "@/lib/utils"
import { LoadingSpinner } from "./loading-spinner"

interface PageLoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg"
  text?: string
}

const PageLoader = React.forwardRef<HTMLDivElement, PageLoaderProps>(
  ({ className, size = "md", text = "Loading...", ...props }, ref) => {
    const sizeClasses = {
      sm: "py-4",
      md: "py-8", 
      lg: "py-12"
    }

    const spinnerSize = {
      sm: "sm" as const,
      md: "md" as const,
      lg: "lg" as const
    }

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-center justify-center gap-4",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        <LoadingSpinner size={spinnerSize[size]} />
        {text && (
          <p className="text-sm text-muted-foreground animate-pulse">
            {text}
          </p>
        )}
      </div>
    )
  }
)

PageLoader.displayName = "PageLoader"

export { PageLoader }
