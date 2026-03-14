// Storage helpers using localStorage
export async function sGet<T>(key: string): Promise<T | null> {
  try {
    const val = localStorage.getItem(`ro-${key}`);
    return val ? JSON.parse(val) : null;
  } catch {
    return null;
  }
}

export async function sSet(key: string, val: unknown): Promise<void> {
  try {
    localStorage.setItem(`ro-${key}`, JSON.stringify(val));
  } catch {}
}
