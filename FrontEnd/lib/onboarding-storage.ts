type Role = "junior" | "empresa" | "emprendedor";

export function saveStep(role: Role, step: number, data: unknown): void {
  if (typeof window === "undefined") return;
  const key = `onboarding_${role}`;
  const current = JSON.parse(sessionStorage.getItem(key) ?? "{}") as Record<string, unknown>;
  sessionStorage.setItem(key, JSON.stringify({ ...current, [`step${step}`]: data }));
}

export function getOnboarding(role: Role): Record<string, unknown> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(sessionStorage.getItem(`onboarding_${role}`) ?? "{}") as Record<string, unknown>;
  } catch {
    return {};
  }
}

export function clearOnboarding(role: Role): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(`onboarding_${role}`);
}
