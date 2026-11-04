import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";

const SETTINGS_FILE = path.join(process.cwd(), "data", "settings.json");

// بارگذاری تنظیمات از فایل
async function loadSettingsFromFile(): Promise<Record<string, any>> {
  try {
    const data = await fs.readFile(SETTINGS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return {};
  }
}

// ذخیره تنظیمات در فایل
async function saveSettingsToFile(settings: Record<string, any>) {
  try {
    const dataDir = path.join(process.cwd(), "data");
    try {
      await fs.access(dataDir);
    } catch {
      await fs.mkdir(dataDir, { recursive: true });
    }
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2), "utf-8");
  } catch (error) {
    console.error("Error saving settings:", error);
  }
}

export async function GET() {
  try {
    const { getAllSettings, setSetting, syncWithFile } = await import("@/lib/price-storage");
    await syncWithFile();

    const settings = await loadSettingsFromFile();
    if (settings.taxMessage) {
      setSetting("taxMessage", settings.taxMessage);
    }

    const taxMessage = getAllSettings().taxMessage || "قیمت ها بدون احتساب مالیات بر افزایش افزوده می باشد.";
    return NextResponse.json({ taxMessage });
  } catch (error) {
    return NextResponse.json({
      taxMessage: "قیمت ها بدون احتساب مالیات بر افزایش افزوده می باشد.",
    });
  }
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

    const { taxMessage } = await request.json();

    if (!taxMessage || typeof taxMessage !== "string") {
      return NextResponse.json(
        { error: "پیام مالیات الزامی است" },
        { status: 400 }
      );
    }

    // به‌روزرسانی در cache + Supabase
    const { setSetting, saveToFile, syncWithFile } = await import("@/lib/price-storage");
    await syncWithFile();
    setSetting("taxMessage", taxMessage);
    await saveToFile();

    // ذخیره در فایل محلی (در صورت امکان)
    const settings = await loadSettingsFromFile();
    settings.taxMessage = taxMessage;
    await saveSettingsToFile(settings);

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

