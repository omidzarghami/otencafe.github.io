const DRAFT_KEY = "oten-admin-draft";
const PUBLISHED_KEY = "oten-published-overrides";

export type AdminDraft = {
  priceChanges: Record<string, number>;
  nameChanges: Record<string, string>;
  taxMessage?: string;
  taxMessageChanged?: boolean;
};

export type PublishedOverrides = {
  prices: Record<string, number>;
  names: Record<string, string>;
  sectionNames: Record<string, string>;
  taxMessage?: string;
  updatedAt: number;
};

function canUseStorage() {
  return typeof window !== "undefined" && !!window.localStorage;
}

export function loadAdminDraft(): AdminDraft | null {
  if (!canUseStorage()) return null;
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AdminDraft;
  } catch {
    return null;
  }
}

export function saveAdminDraft(draft: AdminDraft): void {
  if (!canUseStorage()) return;
  try {
    const hasDraft =
      Object.keys(draft.priceChanges).length > 0 ||
      Object.keys(draft.nameChanges).length > 0 ||
      !!draft.taxMessageChanged;

    if (!hasDraft) {
      localStorage.removeItem(DRAFT_KEY);
      return;
    }

    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // ignore quota / private mode errors
  }
}

export function clearAdminDraft(): void {
  if (!canUseStorage()) return;
  localStorage.removeItem(DRAFT_KEY);
}

export function loadPublishedOverrides(): PublishedOverrides | null {
  if (!canUseStorage()) return null;
  try {
    const raw = localStorage.getItem(PUBLISHED_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PublishedOverrides;
  } catch {
    return null;
  }
}

export function savePublishedOverrides(overrides: PublishedOverrides): void {
  if (!canUseStorage()) return;
  try {
    localStorage.setItem(PUBLISHED_KEY, JSON.stringify(overrides));
  } catch {
    // ignore
  }
}

export function mergePublishedIntoSections<
  T extends {
    id: string;
    title: string;
    items: Array<{ id: string; name: string; price: number }>;
  },
>(sections: T[], overrides: PublishedOverrides | null): T[] {
  if (!overrides) return sections;

  return sections.map((section) => ({
    ...section,
    title: overrides.sectionNames[section.id] ?? section.title,
    items: section.items.map((item) => ({
      ...item,
      name: overrides.names[item.id] ?? item.name,
      price: overrides.prices[item.id] ?? item.price,
    })),
  }));
}
