import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReactNode, isValidElement, cloneElement } from "react";

interface KPICardProps {
  title: string;
  value: string | number;
  period?: string;
  trend?: number;
  icon: LucideIcon | ReactNode;
  isPositive?: boolean;
  isNegative?: boolean;
}

export function KPICard({ 
  title, 
  value, 
  period,
  trend, 
  icon: Icon, 
  isPositive, 
  isNegative 
}: KPICardProps) {
  
  const renderIcon = () => {
    if (isValidElement(Icon)) {
      // If it's already a React element, clone it with the correct classes
      return cloneElement(Icon as React.ReactElement, {
        className: cn("h-5 w-5 text-white/70", (Icon as React.ReactElement).props.className)
      });
    }
    // If it's a LucideIcon component, render it with the correct classes
    const IconComponent = Icon as LucideIcon;
    return <IconComponent className="h-5 w-5 text-white/70" />;
  };

  return (
    <div 
      className="rounded-lg p-5 flex flex-col justify-between"
      style={{ 
        backgroundColor: '#1F3A5F',
        minHeight: '120px'
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          {renderIcon()}
          <span className="text-sm font-medium text-white/70">{title}</span>
        </div>
        {trend !== undefined && (
          <div className={cn(
            "flex items-center gap-1 text-sm font-medium",
            isPositive ? "text-green-400" : 
            isNegative ? "text-red-400" : "text-white/50"
          )}>
            {isPositive && <TrendingUp className="h-4 w-4" />}
            {isNegative && <TrendingDown className="h-4 w-4" />}
            <span>{isPositive ? "+" : ""}{trend}%</span>
          </div>
        )}
      </div>
      <div className="mt-3">
        <span className="text-3xl font-bold text-white">{value}</span>
        {period && <span className="ml-2 text-sm text-white/50">{period}</span>}
      </div>
    </div>
  );
}

