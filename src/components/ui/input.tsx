import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl border-2 border-[#E5E7EB] bg-[#F8FAFC] px-4 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-[#9CA3AF] focus-visible:outline-none focus-visible:border-[#1F3A5F] focus-visible:ring-4 focus-visible:ring-[#E6EEF6] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-all",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };

