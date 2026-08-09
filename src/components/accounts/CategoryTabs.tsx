import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface CategoryTabsProps {
  categories: string[];
  selected: string | null;
  onSelect: (category: string | null) => void;
  accountCounts?: Record<string, number>;
  totalCount?: number;
}

export default function CategoryTabs({
  categories,
  selected,
  onSelect,
  accountCounts,
  totalCount,
}: CategoryTabsProps) {
  const { t } = useTranslation();

  return (
    <ScrollArea className="w-full">
      <div className="flex items-center gap-2 pb-3.5">
        <Button
          variant={selected === null ? "default" : "outline"}
          size="sm"
          className="rounded-full"
          onClick={() => onSelect(null)}
        >
          {t("all")}
          {totalCount !== undefined && (
            <Badge
              variant={selected === null ? "secondary" : "outline"}
              className="ml-1"
            >
              {totalCount}
            </Badge>
          )}
        </Button>
        {categories.map((category) => (
          <Button
            key={category}
            variant={selected === category ? "default" : "outline"}
            size="sm"
            className="rounded-full"
            onClick={() => onSelect(category)}
          >
            {category}
            {accountCounts?.[category] !== undefined && (
              <Badge
                variant={selected === category ? "secondary" : "outline"}
                className="ml-1"
              >
                {accountCounts[category]}
              </Badge>
            )}
          </Button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
