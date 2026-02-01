import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-[#1F3A5F] text-white hover:bg-[#274C77] shadow-sm hover:shadow-md",
        destructive: "bg-[#C62828] text-white hover:bg-[#B71C1C] shadow-sm",
        outline: "border-2 border-[#E5E7EB] bg-white text-[#1F2937] hover:bg-[#F8FAFC] hover:border-[#1F3A5F]",
        secondary: "bg-[#E8F5E9] text-[#2E7D32] hover:bg-[#2E7D32] hover:text-white",
        ghost: "hover:bg-[#F8FAFC] hover:text-[#1F3A5F]",
        link: "text-[#1F3A5F] underline-offset-4 hover:underline",
        success: "bg-[#2E7D32] text-white hover:bg-[#1B5E20] shadow-sm",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };

