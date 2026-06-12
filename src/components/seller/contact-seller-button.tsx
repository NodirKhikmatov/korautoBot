"use client";

import { MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { useContactSeller } from "@/hooks/use-contact-seller";
import { cn } from "@/lib/utils";

export function ContactSellerButton({
  username,
  className,
  size = "lg",
  fullWidth = true,
}: {
  username?: string | null;
  className?: string;
  size?: "default" | "lg" | "sm";
  fullWidth?: boolean;
}) {
  const t = useTranslations("seller");
  const { canContact, contactSeller } = useContactSeller(username);

  if (!canContact) {
    return (
      <p className="text-center text-sm text-muted-foreground">
        {t("noUsername")}
      </p>
    );
  }

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
      <MessageCircle className="h-5 w-5" />
      {t("contactSeller")}
    </Button>
  );
}
