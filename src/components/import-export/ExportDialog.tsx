import { useState } from "react";
import { useTranslation } from "react-i18next";
import { save } from "@tauri-apps/plugin-dialog";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/tauri";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ExportDialog({
  open: isOpen,
  onOpenChange,
}: ExportDialogProps) {
  const { t } = useTranslation();

  const [backupPassword, setBackupPassword] = useState("");
  const [backupLoading, setBackupLoading] = useState(false);
  const [plainPassword, setPlainPassword] = useState("");
  const [plainLoading, setPlainLoading] = useState(false);

  function resetState() {
    setBackupPassword("");
    setBackupLoading(false);
    setPlainPassword("");
    setPlainLoading(false);
  }

  function handleOpenChange(value: boolean) {
    if (!value) {
      resetState();
    }
    onOpenChange(value);
  }

  async function handleExportBackup() {
    if (!backupPassword) return;
    setBackupLoading(true);
    try {
      const path = await save({
        filters: [
          {
            name: "Encrypted Backup",
            extensions: ["authbackup"],
          },
        ],
      });
      if (!path) {
        setBackupLoading(false);
        return;
      }
      await api.exportBackup(path, backupPassword);
      toast.success(t("import_export.export_success"));
      handleOpenChange(false);
    } catch (err) {
      toast.error(
        t("import_export.import_error", {
          error: err instanceof Error ? err.message : String(err),
        })
      );
    } finally {
      setBackupLoading(false);
    }
  }

  async function handleExportPlain() {
    if (!plainPassword) return;
    setPlainLoading(true);
    try {
      const path = await save({
        filters: [
          {
            name: "JSON Files",
            extensions: ["json"],
          },
        ],
      });
      if (!path) {
        setPlainLoading(false);
        return;
      }
      await api.exportPlain(path, plainPassword);
      toast.success(t("import_export.export_success"));
      handleOpenChange(false);
    } catch (err) {
      toast.error(
        t("import_export.import_error", {
          error: err instanceof Error ? err.message : String(err),
        })
      );
    } finally {
      setPlainLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("import_export.export")}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-6">
          {/* Encrypted Backup Section */}
          <div className="flex flex-col gap-4">
            <Label className="text-base font-semibold">
              {t("import_export.export_backup")}
            </Label>

            <div className="flex flex-col gap-2">
              <Label htmlFor="export-password">
                {t("import_export.backup_password")}
              </Label>
              <Input
                id="export-password"
                type="password"
                value={backupPassword}
                onChange={(e) => setBackupPassword(e.target.value)}
                placeholder={t("import_export.backup_password")}
              />
            </div>

            <Button
              onClick={handleExportBackup}
              disabled={!backupPassword || backupLoading}
              className="w-full"
            >
              {t("import_export.export")}
            </Button>
          </div>

          <Separator />

          {/* Plain Text Export Section */}
          <div className="flex flex-col gap-4">
            <Label className="text-base font-semibold">
              {t("import_export.export_plain")}
            </Label>

            <p className="text-sm text-destructive">
              {t("import_export.export_plain_warning")}
            </p>

            <div className="flex flex-col gap-2">
              <Label htmlFor="plain-export-password">
                {t("import_export.backup_password")}
              </Label>
              <Input
                id="plain-export-password"
                type="password"
                value={plainPassword}
                onChange={(e) => setPlainPassword(e.target.value)}
                placeholder={t("import_export.backup_password")}
              />
            </div>

            <Button
              variant="outline"
              onClick={handleExportPlain}
              disabled={!plainPassword || plainLoading}
              className="w-full"
            >
              {t("import_export.export")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
