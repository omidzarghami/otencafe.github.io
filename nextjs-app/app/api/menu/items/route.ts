import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
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
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 401 });
  }

  // Sync با فایل و بارگذاری قیمت‌های به‌روزرسانی شده
  await syncWithFile();
  await syncCustomDataFromFile();
  const priceOverrides = getAllPrices();
  const sectionNameOverrides = getAllSectionNameOverrides();
  const itemNameOverrides = getAllItemNameOverrides();
  const customSections = getCustomSections();
  const deletedItems = getDeletedItems();
  const deletedSections = getDeletedSections();

  // تبدیل menuSections به یک آرایه ساده از آیتم‌ها (فقط دسته‌بندی‌ها و آیتم‌های حذف نشده)
  const allItems = menuSections
    .filter((section) => !deletedSections.has(section.id))
    .flatMap((section) =>
      section.items
        .filter((item) => !deletedItems.has(item.id))
        .map((item) => ({
          id: item.id,
          name: itemNameOverrides[item.id] ?? item.name,
          sectionId: section.id,
          sectionTitle: sectionNameOverrides[section.id] ?? section.title,
          price: priceOverrides[item.id] ?? item.price,
          description: item.description,
        }))
    );

  // اضافه کردن دسته‌بندی‌ها و آیتم‌های جدید (فقط دسته‌بندی‌ها و آیتم‌های حذف نشده)
  customSections
    .filter((section) => !deletedSections.has(section.id))
    .forEach((section) => {
    const sectionTitle = sectionNameOverrides[section.id] ?? section.title;
    section.items
      .filter((item) => !deletedItems.has(item.id))
      .forEach((item) => {
        allItems.push({
          id: item.id,
          name: itemNameOverrides[item.id] ?? item.name,
          sectionId: section.id,
          sectionTitle,
          price: priceOverrides[item.id] ?? item.price,
          description: item.description,
        });
      });
  });

  // اضافه کردن آیتم‌های سفارشی که به دسته‌بندی‌های موجود اضافه شده‌اند (فقط دسته‌بندی‌ها و آیتم‌های حذف نشده)
  [...menuSections, ...customSections]
    .filter((section) => !deletedSections.has(section.id))
    .forEach((section) => {
    const customItemsForSection = getCustomItems(section.id);
    if (customItemsForSection.length > 0) {
      const sectionTitle = sectionNameOverrides[section.id] ?? section.title;
      customItemsForSection
        .filter((item) => !deletedItems.has(item.id))
        .forEach((item) => {
          allItems.push({
            id: item.id,
            name: itemNameOverrides[item.id] ?? item.name,
            sectionId: section.id,
            sectionTitle,
            price: priceOverrides[item.id] ?? item.price,
            description: item.description,
          });
        });
    }
  });

  return NextResponse.json({ items: allItems });
}

