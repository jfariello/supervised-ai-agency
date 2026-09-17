import type { EmailDraft, Lead } from "@/lib/types";

export async function sendBrevoEmail(lead: Lead, draft: EmailDraft) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME ?? "Agencia IA";

  if (!apiKey || !senderEmail) {
    return {
      mode: "demo" as const,
      messageId: `demo-${draft.id}`,
      blocked: false
    };
  }

  if (draft.status !== "approved") {
    return {
      mode: "live" as const,
      blocked: true,
      reason: "Email draft is not approved"
    };
  }

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "content-type": "application/json",
      accept: "application/json"
    },
    body: JSON.stringify({
      sender: { email: senderEmail, name: senderName },
      to: [{ email: lead.email, name: lead.contactName }],
      subject: draft.subject,
      htmlContent: `<p>${draft.body.replace(/\n/g, "<br />")}</p>`
    })
  });

  if (!response.ok) {
    throw new Error(`Brevo send failed: ${response.status}`);
  }

  const result = await response.json();
  return {
    mode: "live" as const,
    messageId: result.messageId as string,
    blocked: false
  };
}
