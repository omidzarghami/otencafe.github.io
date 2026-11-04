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

type AdminItem = {
  id: string;
  name: string;
  sectionId: string;
  sectionTitle: string;
  price: number;
  description: string;
};

export async function GET() {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 401 });
  }

  await syncWithFile();
  await syncCustomDataFromFile();
  const priceOverrides = getAllPrices();
  const sectionNameOverrides = getAllSectionNameOverrides();
  const itemNameOverrides = getAllItemNameOverrides();
  const customSections = getCustomSections();
  const deletedItems = getDeletedItems();
  const deletedSections = getDeletedSections();

  const byId = new Map<string, AdminItem>();

  const upsert = (item: AdminItem) => {
    if (deletedItems.has(item.id) || deletedSections.has(item.sectionId)) return;
    // Keep first occurrence; later sources must not duplicate the same id
    if (!byId.has(item.id)) {
      byId.set(item.id, item);
    }
  };

  const mapItem = (
    item: { id: string; name: string; description: string; price: number },
    sectionId: string,
    sectionTitle: string
  ): AdminItem => ({
    id: item.id,
    name: itemNameOverrides[item.id] ?? item.name,
    sectionId,
    sectionTitle,
    price: priceOverrides[item.id] ?? item.price,
    description: item.description,
  });

  for (const section of menuSections) {
    if (deletedSections.has(section.id)) continue;
    const sectionTitle = sectionNameOverrides[section.id] ?? section.title;
    for (const item of section.items) {
      upsert(mapItem(item, section.id, sectionTitle));
    }
    for (const item of getCustomItems(section.id)) {
      upsert(mapItem(item, section.id, sectionTitle));
    }
  }

  for (const section of customSections) {
    if (deletedSections.has(section.id)) continue;
    const sectionTitle = sectionNameOverrides[section.id] ?? section.title;
    for (const item of section.items || []) {
      upsert(mapItem(item, section.id, sectionTitle));
    }
    for (const item of getCustomItems(section.id)) {
      upsert(mapItem(item, section.id, sectionTitle));
    }
  }

  return NextResponse.json({ items: Array.from(byId.values()) });
}
