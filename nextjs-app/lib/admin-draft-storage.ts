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

/** Same published localStorage layer the public menu uses — keep admin in sync. */
export function mergePublishedIntoAdminItems<
  T extends {
    id: string;
    name: string;
    price: number;
    sectionId: string;
    sectionTitle: string;
  },
>(items: T[], overrides: PublishedOverrides | null): T[] {
  if (!overrides) return items;

  return items.map((item) => ({
    ...item,
    name: overrides.names[item.id] ?? item.name,
    price: overrides.prices[item.id] ?? item.price,
    sectionTitle: overrides.sectionNames[item.sectionId] ?? item.sectionTitle,
  }));
}

export function mergePublishedIntoAdminSections<
  T extends { id: string; title: string },
>(sections: T[], overrides: PublishedOverrides | null): T[] {
  if (!overrides) return sections;

  return sections.map((section) => ({
    ...section,
    title: overrides.sectionNames[section.id] ?? section.title,
  }));
}

/**
 * Drop stale draft entries that no longer differ from the published baseline
 * (prevents admin showing 90 while the site shows 180 from published overrides).
 */
export function sanitizeDraftAgainstBaseline(
  draft: AdminDraft | null,
  baseline: {
    prices: Record<string, number>;
    names: Record<string, string>;
    taxMessage: string;
  }
): AdminDraft {
  const priceChanges: Record<string, number> = {};
  const nameChanges: Record<string, string> = {};

  if (draft) {
    for (const [id, price] of Object.entries(draft.priceChanges || {})) {
      if (baseline.prices[id] === undefined || baseline.prices[id] !== price) {
        priceChanges[id] = price;
      }
    }
    for (const [id, name] of Object.entries(draft.nameChanges || {})) {
      if (baseline.names[id] === undefined || baseline.names[id] !== name) {
        nameChanges[id] = name;
      }
    }
  }

  const taxMessageChanged =
    !!draft?.taxMessageChanged &&
    typeof draft.taxMessage === "string" &&
    draft.taxMessage !== baseline.taxMessage;

  return {
    priceChanges,
    nameChanges,
    taxMessage: taxMessageChanged ? draft?.taxMessage : baseline.taxMessage,
    taxMessageChanged,
  };
}
