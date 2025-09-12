"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

interface SubmitButtonProps {
  className?: string;
  label?: string;
  pendingLabel?: string;
}

export default function SubmitButton({
  className,
  label = "See My Report Now",
  pendingLabel = "Submitting...",
}: SubmitButtonProps) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      className={className}
      disabled={pending}
      aria-disabled={pending}
      aria-busy={pending}>
      <span className="flex items-center justify-center gap-2">
        {pending && (
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
        )}
        {pending ? pendingLabel : label}
      </span>
    </Button>
  );
}
