import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  restrictToParentElement,
  restrictToVerticalAxis,
} from "@dnd-kit/modifiers";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useTranslation } from "react-i18next";
import { Shield } from "lucide-react";
import AccountCard from "./AccountCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { AccountView, CodeResponse } from "@/types";

interface AccountListProps {
  accounts: AccountView[];
  codes: CodeResponse[];
  onCopy: (code: string) => void;
  onEdit: (account: AccountView) => void;
  onDelete: (account: AccountView) => void;
  onCopyUri: (account: AccountView) => void;
  onSaveQr: (account: AccountView) => void;
  onIncrementHotp: (id: string) => void;
  onReorder: (ids: string[]) => void;
}

function SortableAccountCard({
  account,
  code,
  onCopy,
  onEdit,
  onDelete,
  onCopyUri,
  onSaveQr,
  onIncrementHotp,
}: {
  account: AccountView;
  code?: CodeResponse;
  onCopy: (code: string) => void;
  onEdit: (account: AccountView) => void;
  onDelete: (account: AccountView) => void;
  onCopyUri: (account: AccountView) => void;
  onSaveQr: (account: AccountView) => void;
  onIncrementHotp?: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: account.id,
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <AccountCard
        account={account}
        code={code}
        onCopy={onCopy}
        onEdit={onEdit}
        onDelete={onDelete}
        onCopyUri={onCopyUri}
        onSaveQr={onSaveQr}
        onIncrementHotp={onIncrementHotp}
      />
    </div>
  );
}

export default function AccountList({
  accounts,
  codes,
  onCopy,
  onEdit,
  onDelete,
  onCopyUri,
  onSaveQr,
  onIncrementHotp,
  onReorder,
}: AccountListProps) {
  const { t } = useTranslation();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = accounts.findIndex((a) => a.id === active.id);
      const newIndex = accounts.findIndex((a) => a.id === over.id);
      const reordered = arrayMove(accounts, oldIndex, newIndex);
      onReorder(reordered.map((a) => a.id));
    }
  }

  if (accounts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Shield className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">{t("no_accounts")}</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {t("no_accounts_description")}
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis, restrictToParentElement]}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={accounts.map((a) => a.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-2 p-2">
            {accounts.map((account) => (
              <SortableAccountCard
                key={account.id}
                account={account}
                code={codes.find((c) => c.id === account.id)}
                onCopy={onCopy}
                onEdit={onEdit}
                onDelete={onDelete}
                onCopyUri={onCopyUri}
                onSaveQr={onSaveQr}
                onIncrementHotp={onIncrementHotp}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </ScrollArea>
  );
}
