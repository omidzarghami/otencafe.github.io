import { MenuSection as MenuSectionType } from "@/lib/menu-data";
import { MenuItem } from "./menu-item";

interface MenuSectionProps {
  section: MenuSectionType;
}

export function MenuSection({ section }: MenuSectionProps) {
  return (
    <section
      id={section.id}
      className="py-8 scroll-mt-20"
    >
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-6 text-center">
          {section.title}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {section.items.map((item) => (
            <MenuItem key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}

