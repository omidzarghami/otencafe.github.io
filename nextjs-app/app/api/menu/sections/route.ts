import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import {
  addCustomSection,
  getCustomSections,
  getAllSectionNameOverrides,
  getDeletedSections,
  syncCustomDataFromFile,
  saveCustomDataToFile,
} from "@/lib/price-storage";
import { menuSections } from "@/lib/menu-data";
import type { MenuSection } from "@/lib/menu-data";

export async function GET() {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 401 });
  }

  await syncCustomDataFromFile();
  const customSections = getCustomSections();
  const sectionNameOverrides = getAllSectionNameOverrides();
  const deletedSections = getDeletedSections();

  // ترکیب دسته‌بندی‌های اصلی و سفارشی (فقط دسته‌بندی‌های حذف نشده)
  const allSections = [
    ...menuSections
      .filter((section) => !deletedSections.has(section.id))
      .map((section) => ({
        id: section.id,
        title: sectionNameOverrides[section.id] ?? section.title,
      })),
    ...customSections
      .filter((section) => !deletedSections.has(section.id))
      .map((section) => ({
        id: section.id,
        title: sectionNameOverrides[section.id] ?? section.title,
      })),
  ];

  return NextResponse.json({ sections: allSections });
}

export async function POST(request: NextRequest) {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json(
        { error: "دسترسی غیرمجاز" },
        { status: 401 }
      );
    }

    const section: MenuSection = await request.json();

    if (!section.id || !section.title) {
      return NextResponse.json(
        { error: "شناسه و عنوان دسته‌بندی الزامی است" },
        { status: 400 }
      );
    }

    await syncCustomDataFromFile();
    addCustomSection(section);
    await saveCustomDataToFile();
    
    // اطمینان از sync شدن داده‌ها
    await syncCustomDataFromFile();

    return NextResponse.json({
      success: true,
      message: "دسته‌بندی با موفقیت اضافه شد",
    });
  } catch (error) {
    console.error("Error adding section:", error);
    return NextResponse.json(
      { error: "خطا در اضافه کردن دسته‌بندی" },
      { status: 500 }
    );
  }
}

