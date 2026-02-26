import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Plus, Download, Settings, Lock, Shield } from "lucide-react";

interface HeaderProps {
  onAddAccount: () => void;
  onImportExport: () => void;
  onSettings: () => void;
  onLock: () => void;
}

export default function Header({
  onAddAccount,
  onImportExport,
  onSettings,
  onLock,
}: HeaderProps) {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-50 bg-background border-b">
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-2">
          <Shield className="size-5 text-primary" />
          <span className="text-sm font-semibold tracking-tight">
            {t("app_name")}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onAddAccount}
                  aria-label={t("add_account")}
                >
                  <Plus className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t("add_account")}</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onImportExport}
                  aria-label={t("import_export.title")}
                >
                  <Download className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t("import_export.title")}</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onSettings}
                  aria-label={t("settings")}
                >
                  <Settings className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t("settings")}</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onLock}
                  aria-label={t("lock")}
                >
                  <Lock className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t("lock")}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </header>
  );
}
