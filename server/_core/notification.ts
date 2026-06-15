export type NotificationPayload = {
  title: string;
  content: string;
};

const TITLE_MAX_LENGTH = 1200;
const CONTENT_MAX_LENGTH = 20000;

const trimValue = (value: string): string => value.trim();
const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

/**
 * Dispatches an internal notification to the site owner/admin.
 *
 * In this self-hosted deployment there is no external "Manus" notification
 * proxy. This function validates the payload and logs it; if SMTP is
 * configured, the email service can be used separately to deliver real
 * notifications (see server/email-service.ts).
 *
 * Returns `true` once the payload has been accepted/logged.
 */
export async function notifyOwner(payload: NotificationPayload): Promise<boolean> {
  if (!isNonEmptyString(payload.title)) {
    console.warn("[Notification] Ignored: title is required.");
    return false;
  }
  if (!isNonEmptyString(payload.content)) {
    console.warn("[Notification] Ignored: content is required.");
    return false;
  }

  const title = trimValue(payload.title).slice(0, TITLE_MAX_LENGTH);
  const content = trimValue(payload.content).slice(0, CONTENT_MAX_LENGTH);

  console.log(`[Notification] ${title}: ${content}`);
  return true;
}
