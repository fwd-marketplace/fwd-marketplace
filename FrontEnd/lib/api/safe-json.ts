export function parseJsonStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((entry): entry is string => typeof entry === "string");
  }

  if (typeof value !== "string" || value.trim().length === 0) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((entry): entry is string => typeof entry === "string");
  } catch {
    return [];
  }
}

export function formatDateLabel(value: string | null, locale: string): string {
  if (!value) {
    return "2.0";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "2.0";
  }

  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function getInitials(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const first = parts[0]?.[0] ?? "F";
  const second = parts[1]?.[0] ?? parts[0]?.[1] ?? "W";

  return `${first}${second}`.toUpperCase();
}
