import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";

const DEFAULT_TAX =
  "قیمت ها بدون احتساب مالیات بر افزایش افزوده می باشد.";

export async function GET() {
  try {
    const { getAllSettings, syncWithFile } = await import("@/lib/price-storage");
    await syncWithFile();
    const taxMessage = getAllSettings().taxMessage || DEFAULT_TAX;
    return NextResponse.json({ taxMessage });
  } catch {
    return NextResponse.json({ taxMessage: DEFAULT_TAX });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 401 });
    }

    const { taxMessage } = await request.json();

    if (!taxMessage || typeof taxMessage !== "string") {
      return NextResponse.json(
        { error: "پیام مالیات الزامی است" },
        { status: 400 }
      );
    }

    const { setSetting, saveToFile, syncWithFile } = await import(
      "@/lib/price-storage"
    );
    await syncWithFile();
    setSetting("taxMessage", taxMessage);
    await saveToFile();

    return NextResponse.json({
      success: true,
      message: "پیام مالیات با موفقیت به‌روزرسانی شد",
    });
  } catch (error) {
    console.error("Error updating tax message:", error);
    return NextResponse.json(
      { error: "خطا در به‌روزرسانی پیام مالیات" },
      { status: 500 }
    );
  }
}
