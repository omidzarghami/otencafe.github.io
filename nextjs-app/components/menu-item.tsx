import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { MenuItem as MenuItemType } from "@/lib/menu-data";

interface MenuItemProps {
  item: MenuItemType;
}

export function MenuItem({ item }: MenuItemProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-24 h-24 rounded-full overflow-hidden">
            <Image
              src={item.image}
              alt={item.name}
              fill
              className="object-cover"
              sizes="96px"
            />
          </div>
          <div className="text-center w-full">
            <h3 className="font-bold text-lg mb-2">{item.name}</h3>
            {item.description && (
              <p className="text-sm text-muted-foreground mb-2">
                {item.description}
              </p>
            )}
            <span className="text-lg font-semibold text-primary">
              تومان {item.price.toLocaleString("fa-IR")}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

