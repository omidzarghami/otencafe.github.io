// Simple in-memory storage for prices and settings
// در production، بهتر است از Vercel KV یا یک دیتابیس استفاده کنید

import type { MenuSection, MenuItem } from "./menu-data";

let priceCache: Record<string, number> = {};
let settingsCache: Record<string, any> = {
  taxMessage: "قیمت ها بدون احتساب مالیات بر افزایش افزوده می باشد.",
};

// Storage for custom sections and items
let customSectionsCache: MenuSection[] = [];
let customItemsCache: Record<string, MenuItem[]> = {}; // sectionId -> items[]
let sectionNameOverrides: Record<string, string> = {}; // sectionId -> new name
let itemNameOverrides: Record<string, string> = {}; // itemId -> new name
let deletedItems: Set<string> = new Set(); // itemId -> deleted
let deletedSections: Set<string> = new Set(); // sectionId -> deleted

// Rate limiting for login attempts
interface LoginAttempt {
  count: number;
  lastAttempt: number;
  blockedUntil?: number;
}

let loginAttempts: Record<string, LoginAttempt> = {}; // IP -> attempts

export function getPrice(itemId: string): number | undefined {
  return priceCache[itemId];
}

export function setPrice(itemId: string, price: number): void {
  priceCache[itemId] = price;
}

export function getAllPrices(): Record<string, number> {
  return { ...priceCache };
}

export function setAllPrices(prices: Record<string, number>): void {
  priceCache = { ...prices };
}

// برای sync با فایل (در صورت وجود)
export async function syncWithFile(): Promise<void> {
  try {
    const fs = await import("fs/promises");
    const path = await import("path");
    
    // در Vercel از /tmp استفاده می‌کنیم، در local از data/
    const isVercel = process.env.VERCEL === "1";
    const PRICES_FILE = isVercel
      ? path.join("/tmp", "prices.json")
      : path.join(process.cwd(), "data", "prices.json");
    
    try {
      const data = await fs.readFile(PRICES_FILE, "utf-8");
      const prices = JSON.parse(data);
      priceCache = prices;
    } catch {
      // فایل وجود ندارد، از cache استفاده می‌کنیم
    }
  } catch {
    // در محیطی که fs در دسترس نیست (مثل edge runtime)
  }
}

// برای ذخیره در فایل (در صورت امکان)
export async function saveToFile(): Promise<void> {
  try {
    const fs = await import("fs/promises");
    const path = await import("path");
    
    // در Vercel از /tmp استفاده می‌کنیم، در local از data/
    const isVercel = process.env.VERCEL === "1";
    const PRICES_FILE = isVercel
      ? path.join("/tmp", "prices.json")
      : path.join(process.cwd(), "data", "prices.json");
    
    if (!isVercel) {
      const dataDir = path.join(process.cwd(), "data");
      try {
        await fs.access(dataDir);
      } catch {
        await fs.mkdir(dataDir, { recursive: true });
      }
    }
    
    await fs.writeFile(PRICES_FILE, JSON.stringify(priceCache, null, 2), "utf-8");
  } catch (error) {
    console.error("Error saving prices:", error);
    // در محیطی که fs در دسترس نیست
  }
}

// Settings functions
export function getSetting(key: string): any {
  return settingsCache[key];
}

export function setSetting(key: string, value: any): void {
  settingsCache[key] = value;
}

export function getAllSettings(): Record<string, any> {
  return { ...settingsCache };
}

export function setAllSettings(settings: Record<string, any>): void {
  settingsCache = { ...settings };
}

// Custom sections and items functions
export function getCustomSections(): MenuSection[] {
  return [...customSectionsCache];
}

export function addCustomSection(section: MenuSection): void {
  customSectionsCache.push(section);
}

export function removeCustomSection(sectionId: string): void {
  customSectionsCache = customSectionsCache.filter(
    (section) => section.id !== sectionId
  );
}

export function deleteSection(sectionId: string): void {
  deletedSections.add(sectionId);
}

export function isSectionDeleted(sectionId: string): boolean {
  return deletedSections.has(sectionId);
}

export function getDeletedSections(): Set<string> {
  return new Set(deletedSections);
}

export function updateSectionName(sectionId: string, newName: string): void {
  sectionNameOverrides[sectionId] = newName;
}

export function getSectionName(sectionId: string): string | undefined {
  return sectionNameOverrides[sectionId];
}

export function getAllSectionNameOverrides(): Record<string, string> {
  return { ...sectionNameOverrides };
}

export function setAllSectionNameOverrides(overrides: Record<string, string>): void {
  sectionNameOverrides = { ...overrides };
}

export function getCustomItems(sectionId: string): MenuItem[] {
  return customItemsCache[sectionId] || [];
}

export function addCustomItem(sectionId: string, item: MenuItem): void {
  if (!customItemsCache[sectionId]) {
    customItemsCache[sectionId] = [];
  }
  customItemsCache[sectionId].push(item);
}

export function removeCustomItem(sectionId: string, itemId: string): void {
  if (customItemsCache[sectionId]) {
    customItemsCache[sectionId] = customItemsCache[sectionId].filter(
      (item) => item.id !== itemId
    );
  }
}

export function deleteItem(itemId: string): void {
  deletedItems.add(itemId);
}

export function isItemDeleted(itemId: string): boolean {
  return deletedItems.has(itemId);
}

export function getDeletedItems(): Set<string> {
  return new Set(deletedItems);
}

export function updateItemName(itemId: string, newName: string): void {
  itemNameOverrides[itemId] = newName;
}

export function getItemName(itemId: string): string | undefined {
  return itemNameOverrides[itemId];
}

export function getAllItemNameOverrides(): Record<string, string> {
  return { ...itemNameOverrides };
}

export function setAllItemNameOverrides(overrides: Record<string, string>): void {
  itemNameOverrides = { ...overrides };
}

// Sync and save functions for custom data
export async function syncCustomDataFromFile(): Promise<void> {
  try {
    const fs = await import("fs/promises");
    const path = await import("path");
    
    const isVercel = process.env.VERCEL === "1";
    const CUSTOM_DATA_FILE = isVercel
      ? path.join("/tmp", "custom-menu.json")
      : path.join(process.cwd(), "data", "custom-menu.json");
    
    try {
      const data = await fs.readFile(CUSTOM_DATA_FILE, "utf-8");
      const customData = JSON.parse(data);
      customSectionsCache = customData.sections || [];
      customItemsCache = customData.items || {};
      sectionNameOverrides = customData.sectionNameOverrides || {};
      itemNameOverrides = customData.itemNameOverrides || {};
      deletedItems = new Set(customData.deletedItems || []);
      deletedSections = new Set(customData.deletedSections || []);
    } catch {
      // فایل وجود ندارد
    }
  } catch {
    // در محیطی که fs در دسترس نیست
  }
}

export async function saveCustomDataToFile(): Promise<void> {
  try {
    const fs = await import("fs/promises");
    const path = await import("path");
    
    const isVercel = process.env.VERCEL === "1";
    const CUSTOM_DATA_FILE = isVercel
      ? path.join("/tmp", "custom-menu.json")
      : path.join(process.cwd(), "data", "custom-menu.json");
    
    if (!isVercel) {
      const dataDir = path.join(process.cwd(), "data");
      try {
        await fs.access(dataDir);
      } catch {
        await fs.mkdir(dataDir, { recursive: true });
      }
    }
    
    const customData = {
      sections: customSectionsCache,
      items: customItemsCache,
      sectionNameOverrides,
      itemNameOverrides,
      deletedItems: Array.from(deletedItems),
      deletedSections: Array.from(deletedSections),
    };
    
    await fs.writeFile(CUSTOM_DATA_FILE, JSON.stringify(customData, null, 2), "utf-8");
  } catch (error) {
    console.error("Error saving custom data:", error);
  }
}

// Rate limiting functions
export function getLoginAttempts(identifier: string): LoginAttempt | undefined {
  return loginAttempts[identifier];
}

export function recordFailedLogin(identifier: string): { blocked: boolean; blockedUntil?: number; remainingAttempts: number } {
  const now = Date.now();
  const attempt = loginAttempts[identifier] || { count: 0, lastAttempt: 0 };
  
  // اگر بن شده و هنوز زمان بن تمام نشده
  if (attempt.blockedUntil && now < attempt.blockedUntil) {
    return {
      blocked: true,
      blockedUntil: attempt.blockedUntil,
      remainingAttempts: 0,
    };
  }
  
  // اگر بن شده بود اما زمان تمام شده، ریست کن
  if (attempt.blockedUntil && now >= attempt.blockedUntil) {
    attempt.count = 0;
    attempt.blockedUntil = undefined;
  }
  
  // افزایش تعداد تلاش‌های ناموفق
  attempt.count += 1;
  attempt.lastAttempt = now;
  
  // اگر 3 بار اشتباه زد، بن کن به مدت 10 دقیقه
  if (attempt.count >= 3) {
    const blockedUntil = now + 10 * 60 * 1000; // 10 minutes
    attempt.blockedUntil = blockedUntil;
    loginAttempts[identifier] = attempt;
    return {
      blocked: true,
      blockedUntil,
      remainingAttempts: 0,
    };
  }
  
  loginAttempts[identifier] = attempt;
  return {
    blocked: false,
    remainingAttempts: 3 - attempt.count,
  };
}

export function resetLoginAttempts(identifier: string): void {
  delete loginAttempts[identifier];
}

