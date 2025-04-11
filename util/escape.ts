export const XML_ESCAPES_BY_ESCAPED_VALUE = {
  '&quot;': '"',
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&apos;': "'",
};

export const XML_ESCAPES_BY_UNESCAPED_VALUE = {
  '"': '&quot;',
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  "'": '&apos;',
};

export function escapeXml(value: string): string {
  return value.replace(
    /["'<>&]/g,
    (match) => XML_ESCAPES_BY_UNESCAPED_VALUE[match as keyof typeof XML_ESCAPES_BY_UNESCAPED_VALUE],
  );
}

export function unescapeXml(value: string): string {
  return value.replace(
    /&quot;|&amp;|&lt;|&gt;|&apos;/g,
    (match) => XML_ESCAPES_BY_ESCAPED_VALUE[match as keyof typeof XML_ESCAPES_BY_ESCAPED_VALUE],
  );
}
