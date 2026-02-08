"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

interface FormSubmitButtonProps {
  children: React.ReactNode;
  loadingText?: string;
  className?: string;
}

export function FormSubmitButton({
  children,
  loadingText = "Saving...",
  className = "px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed",
}: FormSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? (
        <span className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          {loadingText}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
