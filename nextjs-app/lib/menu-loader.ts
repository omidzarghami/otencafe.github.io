import { menuSections, MenuSection } from "./menu-data";
import fs from "fs/promises";
import path from "path";

const PRICES_FILE = path.join(process.cwd(), "data", "prices.json");

// بارگذاری قیمت‌ها از فایل
export async function loadPricesFromFile(): Promise<Record<string, number>> {
  try {
    const data = await fs.readFile(PRICES_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return {};
  }
}

// دریافت منو با قیمت‌های به‌روزرسانی شده
export async function getMenuWithUpdatedPrices(): Promise<MenuSection[]> {
  const priceOverrides = await loadPricesFromFile();

  return menuSections.map((section) => ({
    ...section,
    items: section.items.map((item) => ({
      ...item,
      price: priceOverrides[item.id] ?? item.price,
    })),
  }));
}

