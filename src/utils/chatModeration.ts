/**
 * Chat Moderation & Sanitization Utilities
 */

// Profanity word list filter
const PROFANITY_REGEX =
  /\b(fuck|shit|bitch|asshole|bastard|cunt|dick|pussy|slut|whore|nigger|faggot|retard)\b/gi;

// Raw phone numbers: (555) 123-4567, 555-123-4567, 555.123.4567, +15551234567, 5551234567
const PHONE_NUMBER_REGEX =
  /(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}\b/g;

// Suspicious links or download binaries (.exe, .zip, .apk, .scr, suspicious redirectors)
const SUSPICIOUS_LINK_REGEX =
  /\b(?:https?:\/\/)?(?:www\.)?(?:[a-zA-Z0-9-]+\.)+(?:exe|zip|apk|scr|bat|vbs|cmd|ru|top|xyz|loan|click|buzz)(?:\/[^\s]*)?/gi;

const GENERIC_SUSPICIOUS_SHORTENERS =
  /\b(?:https?:\/\/)?(?:bit\.ly|tinyurl\.com|t\.co|goo\.gl|is\.gd|cutt\.ly|adf\.ly)\/[^\s]+/gi;

/**
 * Validates a user's chosen field handle
 * 3-20 alphanumeric characters, no spaces (underscores permitted)
 */
export function validateHandle(handle: string): { valid: boolean; error?: string } {
  const trimmed = handle.trim();
  if (trimmed.length < 3) {
    return { valid: false, error: 'Handle must be at least 3 characters long.' };
  }
  if (trimmed.length > 20) {
    return { valid: false, error: 'Handle cannot exceed 20 characters.' };
  }
  if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
    return { valid: false, error: 'Handle may only contain letters, numbers, and underscores (no spaces).' };
  }
  return { valid: true };
}

/**
 * Automatically masks offensive profanity, suspicious external download links,
 * and raw phone numbers with '[moderated]'
 */
export function sanitizeMessageText(text: string): { sanitized: string; hadModeration: boolean } {
  let result = text;
  let hadModeration = false;

  if (PROFANITY_REGEX.test(result)) {
    result = result.replace(PROFANITY_REGEX, '[moderated]');
    hadModeration = true;
  }

  if (PHONE_NUMBER_REGEX.test(result)) {
    result = result.replace(PHONE_NUMBER_REGEX, '[moderated]');
    hadModeration = true;
  }

  if (SUSPICIOUS_LINK_REGEX.test(result)) {
    result = result.replace(SUSPICIOUS_LINK_REGEX, '[moderated]');
    hadModeration = true;
  }

  if (GENERIC_SUSPICIOUS_SHORTENERS.test(result)) {
    result = result.replace(GENERIC_SUSPICIOUS_SHORTENERS, '[moderated]');
    hadModeration = true;
  }

  return { sanitized: result, hadModeration };
}
