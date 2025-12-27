import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import {
  updateSectionName,
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

    const { sectionId, newName }: { sectionId: string; newName: string } =
      await request.json();

    if (!sectionId || !newName) {
      return NextResponse.json(
        { error: "شناسه دسته‌بندی و نام جدید الزامی است" },
        { status: 400 }
      );
    }

    await syncCustomDataFromFile();
    updateSectionName(sectionId, newName);
    await saveCustomDataToFile();

    return NextResponse.json({
      success: true,
      message: "نام دسته‌بندی با موفقیت به‌روزرسانی شد",
    });
  } catch (error) {
    console.error("Error updating section name:", error);
    return NextResponse.json(
      { error: "خطا در به‌روزرسانی نام دسته‌بندی" },
      { status: 500 }
    );
  }
}

