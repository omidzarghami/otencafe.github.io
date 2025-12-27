import { menuSections } from "./menu-data";

// این فایل برای ذخیره قیمت‌های به‌روزرسانی شده استفاده می‌شود
// در production، بهتر است از یک دیتابیس استفاده کنید

let priceOverrides: Record<string, number> = {};

export function getPrice(itemId: string): number | null {
  return priceOverrides[itemId] ?? null;
}

export function setPrice(itemId: string, price: number): void {
  priceOverrides[itemId] = price;
}

export function getAllPrices(): Record<string, number> {
  return { ...priceOverrides };
}

export function getItemPrice(itemId: string, defaultPrice: number): number {
  return priceOverrides[itemId] ?? defaultPrice;
}

// برای بارگذاری قیمت‌ها از یک منبع (مثلاً فایل یا دیتابیس)
export async function loadPrices(): Promise<void> {
  // در اینجا می‌توانید قیمت‌ها را از فایل یا دیتابیس بارگذاری کنید
  // برای حال حاضر، از قیمت‌های پیش‌فرض استفاده می‌کنیم
}

// برای ذخیره قیمت‌ها
export async function savePrices(): Promise<void> {
  // در اینجا می‌توانید قیمت‌ها را در فایل یا دیتابیس ذخیره کنید
}

