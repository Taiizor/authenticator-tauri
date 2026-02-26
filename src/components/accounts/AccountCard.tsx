import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Copy, MoreVertical, Pencil, Trash2, RefreshCw } from "lucide-react";
import type { AccountView, CodeResponse } from "@/types";

interface AccountCardProps {
  account: AccountView;
  code?: CodeResponse;
  onCopy: (code: string) => void;
  onEdit: (account: AccountView) => void;
  onDelete: (account: AccountView) => void;
  onIncrementHotp?: (id: string) => void;
}

function formatCode(code: string): string {
  const mid = Math.ceil(code.length / 2);
  return code.slice(0, mid) + " " + code.slice(mid);
}

export default function AccountCard({
  account,
  code,
  onCopy,
  onEdit,
  onDelete,
  onIncrementHotp,
}: AccountCardProps) {
  const { t } = useTranslation();

  const initial = account.name.charAt(0).toUpperCase();
  const bgColor = account.color || "#6366f1";
  const progressValue = code ? (code.remaining / code.period) * 100 : 0;
  const isExpiring = code ? code.remaining < 5 : false;

  return (
    <Card className="hover:bg-accent/50 transition-colors cursor-pointer py-0">
      <CardContent className="flex items-center gap-4 px-4 py-3">
        {/* Left: Icon / Color indicator */}
        <div className="flex flex-col items-center gap-1">
          <div
            className="flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
            style={{ backgroundColor: bgColor }}
          >
            {initial}
          </div>
        </div>

        {/* Middle: Account info */}
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold">
              {account.name}
            </span>
            {account.category && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                {account.category}
              </Badge>
            )}
          </div>
          {account.issuer && (
            <span className="truncate text-xs text-muted-foreground">
              {account.issuer}
            </span>
          )}
        </div>

        {/* Right: Code display + progress/action */}
        <div className="flex flex-col items-end gap-1">
          <button
            type="button"
            className="font-mono text-2xl font-bold tracking-wider tabular-nums hover:text-primary transition-colors"
            onClick={() => code && onCopy(code.code)}
            aria-label={t("copy_code")}
          >
            {code ? formatCode(code.code) : "--- ---"}
          </button>

          {account.otp_type === "totp" ? (
            <div className="w-28">
              <Progress
                value={progressValue}
                className={`h-1 ${isExpiring ? "[&>[data-slot=progress-indicator]]:bg-destructive" : ""}`}
              />
            </div>
          ) : (
            <Button
              variant="ghost"
              size="xs"
              onClick={() => onIncrementHotp?.(account.id)}
              className="gap-1 text-xs"
            >
              <RefreshCw className="size-3" />
              Next
            </Button>
          )}
        </div>

        {/* Dropdown menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="shrink-0"
              aria-label="Menu"
            >
              <MoreVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(account)}>
              <Pencil />
              {t("edit_account")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => code && onCopy(code.code)}>
              <Copy />
              {t("copy_code")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDelete(account)}
            >
              <Trash2 />
              {t("delete_account")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardContent>
    </Card>
  );
}
