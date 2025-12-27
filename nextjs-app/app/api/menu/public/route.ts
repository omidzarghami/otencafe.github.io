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
      const sectionCustomItems = getCustomItems(section.id) || [];
      
      return {
        ...section,
        title: sectionTitle,
        items: [
          ...section.items
            .filter((item) => !deletedItems.has(item.id))
            .map((item) => ({
              ...item,
              name: itemNameOverrides[item.id] ?? item.name,
              price: priceOverrides[item.id] ?? item.price,
            })),
          ...sectionCustomItems
            .filter((item) => !deletedItems.has(item.id))
            .map((item) => ({
              ...item,
              name: itemNameOverrides[item.id] ?? item.name,
              price: priceOverrides[item.id] ?? item.price,
            })),
        ],
      };
    });

    // اضافه کردن دسته‌بندی‌های جدید (فقط دسته‌بندی‌ها و آیتم‌های حذف نشده)
    const customSectionsUpdated = customSections
      .filter((section) => !deletedSections.has(section.id))
      .map((section) => {
      const sectionTitle = sectionNameOverrides[section.id] ?? section.title;
      return {
        ...section,
        title: sectionTitle,
        items: section.items
          .filter((item) => !deletedItems.has(item.id))
          .map((item) => ({
            ...item,
            name: itemNameOverrides[item.id] ?? item.name,
            price: priceOverrides[item.id] ?? item.price,
          })),
      };
    });

    return NextResponse.json({
      sections: [...updatedMenuSections, ...customSectionsUpdated],
    });
  } catch (error) {
    console.error("Error loading menu:", error);
    // در صورت خطا، منوی پیش‌فرض را برگردان
    return NextResponse.json({ sections: menuSections });
  }
}

