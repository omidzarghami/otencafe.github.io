import { NextResponse } from "next/server";
import { menuSections } from "@/lib/menu-data";
import {
  getAllPrices,
  syncWithFile,
  getCustomSections,
  getCustomItems,
  getAllSectionNameOverrides,
  getAllItemNameOverrides,
  getDeletedItems,
  getDeletedSections,
  syncCustomDataFromFile,
} from "@/lib/price-storage";

export async function GET() {
  try {
    // Sync با فایل و بارگذاری قیمت‌های به‌روزرسانی شده
    await syncWithFile();
    await syncCustomDataFromFile();
    const priceOverrides = getAllPrices();
    const sectionNameOverrides = getAllSectionNameOverrides();
    const itemNameOverrides = getAllItemNameOverrides();
    const customSections = getCustomSections();
    const deletedItems = getDeletedItems();
    const deletedSections = getDeletedSections();

    // اعمال قیمت‌های به‌روزرسانی شده و نام‌های تغییر یافته به منو (فقط دسته‌بندی‌ها و آیتم‌های حذف نشده)
    const updatedMenuSections = menuSections
      .filter((section) => !deletedSections.has(section.id))
      .map((section) => {
        const sectionTitle = sectionNameOverrides[section.id] ?? section.title;
        const byId = new Map<string, (typeof section.items)[number]>();
        for (const item of [...section.items, ...(getCustomItems(section.id) || [])]) {
          if (deletedItems.has(item.id) || byId.has(item.id)) continue;
          byId.set(item.id, {
            ...item,
            name: itemNameOverrides[item.id] ?? item.name,
            price: priceOverrides[item.id] ?? item.price,
          });
        }
        return {
          ...section,
          title: sectionTitle,
          items: Array.from(byId.values()),
        };
      });

    // اضافه کردن دسته‌بندی‌های جدید (بدون تکرار آیتم)
    const customSectionsUpdated = customSections
      .filter((section) => !deletedSections.has(section.id))
      .map((section) => {
        const sectionTitle = sectionNameOverrides[section.id] ?? section.title;
        const byId = new Map<string, (typeof section.items)[number]>();
        for (const item of [...(section.items || []), ...getCustomItems(section.id)]) {
          if (deletedItems.has(item.id) || byId.has(item.id)) continue;
          byId.set(item.id, {
            ...item,
            name: itemNameOverrides[item.id] ?? item.name,
            price: priceOverrides[item.id] ?? item.price,
          });
        }
        return {
          ...section,
          title: sectionTitle,
          items: Array.from(byId.values()),
        };
      });

    // Deduplicate custom section ids that collide with built-in sections
    const builtInIds = new Set(updatedMenuSections.map((s) => s.id));
    const uniqueCustom = customSectionsUpdated.filter((s) => !builtInIds.has(s.id));

    return NextResponse.json({
      sections: [...updatedMenuSections, ...uniqueCustom],
    });
  } catch (error) {
    console.error("Error loading menu:", error);
    // در صورت خطا، منوی پیش‌فرض را برگردان
    return NextResponse.json({ sections: menuSections });
  }
}

