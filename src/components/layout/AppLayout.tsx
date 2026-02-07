import { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import { Toast, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { toasts } = useToast();
  
  return (
    <ToastProvider>
      <div className="min-h-screen bg-background">
        <AppSidebar />
        <main className="pl-64 transition-all duration-300">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
      {toasts.map(function ({ id, title, description, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && <ToastDescription>{description}</ToastDescription>}
            </div>
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
