"use client";

import { useTheme } from "next-themes";
import { FloatingWhatsApp } from "@carlos8a/react-whatsapp-floating-button";

/**
 * WhatsAppButton — Client Component
 * Renders a floating WhatsApp button for customer support.
 * Automatically adapts to light/dark mode.
 */
export default function WhatsAppButton() {
  const { resolvedTheme } = useTheme();

  return (
    <FloatingWhatsApp
      phoneNumber="1234567890" // Replace with actual phone number
      accountName="PeterParts Support"
      statusMessage="Typically replies within 1 hour"
      initialMessageByServer="Hello! 👋 How can we help you today?"
      initialMessageByClient="Hi! I'm interested in learning more about your products."
      startChatText="Start chat with us"
      tooltipText="Need help? Chat with us!"
      darkMode={resolvedTheme === "dark"}
      allowEsc
      allowClickAway
      notification
      notificationDelay={30}
      notificationLoop={2}
    />
  );
}
