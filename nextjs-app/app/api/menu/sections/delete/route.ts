import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import {
  removeCustomSection,
  deleteSection,
  syncCustomDataFromFile,
  saveCustomDataToFile,
} from "@/lib/price-storage";

export async function POST(request: NextRequest) {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json(
        { error: "دسترسی غیرمجاز" },
        { status: 401 }
      );
    }

    const { sectionId }: { sectionId: string } = await request.json();

    if (!sectionId) {
      return NextResponse.json(
        { error: "شناسه دسته‌بندی الزامی است" },
        { status: 400 }
      );
    }

    await syncCustomDataFromFile();
    
    // اگر دسته‌بندی سفارشی است، از customSectionsCache حذف کن
    if (sectionId.startsWith("custom-")) {
      removeCustomSection(sectionId);
    }
    
    // همه دسته‌بندی‌ها (سفارشی و اصلی) را به deletedSections اضافه کن
    deleteSection(sectionId);
    
    await saveCustomDataToFile();
    
    // اطمینان از sync شدن داده‌ها
    await syncCustomDataFromFile();

    return NextResponse.json({
      success: true,
      message: "دسته‌بندی با موفقیت حذف شد",
    });
  } catch (error) {
    console.error("Error deleting section:", error);
    return NextResponse.json(
      { error: "خطا در حذف دسته‌بندی" },
      { status: 500 }
    );
  }
}

