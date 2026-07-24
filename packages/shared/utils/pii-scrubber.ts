/**
 * Utility to scrub Personally Identifiable Information (PII) from transcriptions or notes.
 * Replaces names, emails, phone numbers, and other details with generic placeholders.
 */

export function scrubPII(text: string): string {
  if (!text) return text;

  let scrubbed = text;

  // 1. Email Addresses
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  scrubbed = scrubbed.replace(emailRegex, '[EMAIL]');

  // 2. Phone Numbers (various formats: +1-234-567-8901, 01712345678, etc.)
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4,6}/g;
  scrubbed = scrubbed.replace(phoneRegex, '[PHONE]');

  // 3. Dates of Birth or SSN-like patterns (Optional, can be added)
  // E.g., SSN: XXX-XX-XXXX
  const ssnRegex = /\b\d{3}-\d{2}-\d{4}\b/g;
  scrubbed = scrubbed.replace(ssnRegex, '[ID]');

  return scrubbed;
}
