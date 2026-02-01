import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-[#1F3A5F] text-white",
        secondary: "bg-[#E8F5E9] text-[#2E7D32]",
        success: "bg-[#E8F5E9] text-[#2E7D32]",
        warning: "bg-[#FFF8E1] text-[#F9A825]",
        destructive: "bg-[#FDECEA] text-[#C62828]",
        info: "bg-[#E6EEF6] text-[#1F3A5F]",
        outline: "border-2 border-[#E5E7EB] bg-white text-[#1F2937]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };

