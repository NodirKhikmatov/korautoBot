"use client";

import { MessageCircle, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useContactSeller } from "@/hooks/use-contact-seller";
import { cn } from "@/lib/utils";

export function ContactSellerButton({
  username,
  telegramId,
  phone,
  className,
  size = "lg",
  fullWidth = true,
}: {
  username?: string | null;
  telegramId?: number | null;
  phone?: string | null;
  className?: string;
  size?: "default" | "lg" | "sm";
  fullWidth?: boolean;
}) {
  const { canContact, contactSeller, contactLabel } = useContactSeller({
    username,
    telegramId,
    phone,
  });

  if (!canContact) {
    return (
      <p className="text-center text-sm text-muted-foreground">
        This seller has no contact information.
      </p>
    );
  }

  const Icon = phone?.trim() && !username && !telegramId ? Phone : MessageCircle;

  return (
    <Button
      type="button"
      size={size}
      className={cn(
        "rounded-xl font-semibold",
        fullWidth && "w-full",
        size === "lg" && "h-12 text-base",
        className,
      )}
      onClick={() => contactSeller()}
    >
      <Icon className="h-5 w-5" />
      {contactLabel}
    </Button>
  );
}
