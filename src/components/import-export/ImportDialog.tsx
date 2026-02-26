import { useState } from "react";
import { useTranslation } from "react-i18next";
import { open } from "@tauri-apps/plugin-dialog";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/tauri";

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImported: () => void;
}

const IMPORT_FORMATS = [
  { value: "aegis", labelKey: "import_export.formats.aegis" },
  { value: "twofas", labelKey: "import_export.formats.twofas" },
  { value: "ente", labelKey: "import_export.formats.ente" },
  { value: "google", labelKey: "import_export.formats.google" },
  { value: "csv", labelKey: "import_export.formats.csv" },
] as const;

export default function ImportDialog({
  open: isOpen,
  onOpenChange,
  onImported,
}: ImportDialogProps) {
  const { t } = useTranslation();

  // URI tab state
  const [uri, setUri] = useState("");
  const [uriLoading, setUriLoading] = useState(false);

  // QR tab state
  const [qrPath, setQrPath] = useState("");
  const [qrLoading, setQrLoading] = useState(false);

  // File tab state
  const [fileFormat, setFileFormat] = useState("");
  const [filePath, setFilePath] = useState("");
  const [fileLoading, setFileLoading] = useState(false);

  // Backup tab state
  const [backupPath, setBackupPath] = useState("");
  const [backupPassword, setBackupPassword] = useState("");
  const [backupLoading, setBackupLoading] = useState(false);

  function resetState() {
    setUri("");
    setUriLoading(false);
    setQrPath("");
    setQrLoading(false);
    setFileFormat("");
    setFilePath("");
    setFileLoading(false);
    setBackupPath("");
    setBackupPassword("");
    setBackupLoading(false);
  }

  function handleOpenChange(value: boolean) {
    if (!value) {
      resetState();
    }
    onOpenChange(value);
  }

  async function handleImportUri() {
    if (!uri.trim()) return;
    setUriLoading(true);
    try {
      await api.importFromUri(uri.trim());
      toast.success(t("import_export.import_success", { count: 1 }));
      onImported();
      handleOpenChange(false);
    } catch (err) {
      toast.error(
        t("import_export.import_error", {
          error: err instanceof Error ? err.message : String(err),
        })
      );
    } finally {
      setUriLoading(false);
    }
  }

  async function handleSelectQrImage() {
    const selected = await open({
      multiple: false,
      filters: [
        {
          name: "Images",
          extensions: ["png", "jpg", "jpeg"],
        },
      ],
    });
    if (selected) {
      setQrPath(selected);
    }
  }

  async function handleImportQr() {
    if (!qrPath) return;
    setQrLoading(true);
    try {
      const result = await api.importFromQrImage(qrPath);
      toast.success(
        t("import_export.import_success", { count: result.length })
      );
      onImported();
      handleOpenChange(false);
    } catch (err) {
      toast.error(
        t("import_export.import_error", {
          error: err instanceof Error ? err.message : String(err),
        })
      );
    } finally {
      setQrLoading(false);
    }
  }

  async function handleSelectFile() {
    const selected = await open({
      multiple: false,
      filters: [
        {
          name: "Import Files",
          extensions: ["json", "csv", "txt"],
        },
      ],
    });
    if (selected) {
      setFilePath(selected);
    }
  }

  async function handleImportFile() {
    if (!filePath || !fileFormat) return;
    setFileLoading(true);
    try {
      const result = await api.importFromFile(filePath, fileFormat);
      toast.success(
        t("import_export.import_success", { count: result.length })
      );
      onImported();
      handleOpenChange(false);
    } catch (err) {
      toast.error(
        t("import_export.import_error", {
          error: err instanceof Error ? err.message : String(err),
        })
      );
    } finally {
      setFileLoading(false);
    }
  }

  async function handleSelectBackup() {
    const selected = await open({
      multiple: false,
      filters: [
        {
          name: "Backup Files",
          extensions: ["authbackup"],
        },
      ],
    });
    if (selected) {
      setBackupPath(selected);
    }
  }

  async function handleImportBackup() {
    if (!backupPath || !backupPassword) return;
    setBackupLoading(true);
    try {
      const result = await api.importBackup(backupPath, backupPassword);
      toast.success(
        t("import_export.import_success", { count: result.length })
      );
      onImported();
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

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("import_export.import")}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="uri">
          <TabsList className="w-full">
            <TabsTrigger value="uri">
              {t("import_export.import_uri")}
            </TabsTrigger>
            <TabsTrigger value="qr">
              {t("import_export.import_qr")}
            </TabsTrigger>
            <TabsTrigger value="file">
              {t("import_export.import_file")}
            </TabsTrigger>
            <TabsTrigger value="backup">
              {t("import_export.export_backup")}
            </TabsTrigger>
          </TabsList>

          {/* URI Tab */}
          <TabsContent value="uri" className="space-y-4 pt-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="import-uri">
                {t("import_export.import_uri")}
              </Label>
              <Input
                id="import-uri"
                value={uri}
                onChange={(e) => setUri(e.target.value)}
                placeholder="otpauth://totp/..."
              />
            </div>
            <Button
              onClick={handleImportUri}
              disabled={!uri.trim() || uriLoading}
              className="w-full"
            >
              {t("import_export.import")}
            </Button>
          </TabsContent>

          {/* QR Image Tab */}
          <TabsContent value="qr" className="space-y-4 pt-4">
            <div className="flex flex-col gap-2">
              <Label>{t("import_export.import_qr")}</Label>
              <Button
                variant="outline"
                onClick={handleSelectQrImage}
                className="w-full"
              >
                {t("import_export.drop_file")}
              </Button>
              {qrPath && (
                <p className="text-sm text-muted-foreground truncate">
                  {qrPath}
                </p>
              )}
            </div>
            <Button
              onClick={handleImportQr}
              disabled={!qrPath || qrLoading}
              className="w-full"
            >
              {t("import_export.import")}
            </Button>
          </TabsContent>

          {/* File Tab */}
          <TabsContent value="file" className="space-y-4 pt-4">
            <div className="flex flex-col gap-2">
              <Label>{t("import_export.select_format")}</Label>
              <Select value={fileFormat} onValueChange={setFileFormat}>
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={t("import_export.select_format")}
                  />
                </SelectTrigger>
                <SelectContent>
                  {IMPORT_FORMATS.map((fmt) => (
                    <SelectItem key={fmt.value} value={fmt.value}>
                      {t(fmt.labelKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                onClick={handleSelectFile}
                disabled={!fileFormat}
                className="w-full"
              >
                {t("import_export.drop_file")}
              </Button>
              {filePath && (
                <p className="text-sm text-muted-foreground truncate">
                  {filePath}
                </p>
              )}
            </div>
            <Button
              onClick={handleImportFile}
              disabled={!filePath || !fileFormat || fileLoading}
              className="w-full"
            >
              {t("import_export.import")}
            </Button>
          </TabsContent>

          {/* Backup Tab */}
          <TabsContent value="backup" className="space-y-4 pt-4">
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                onClick={handleSelectBackup}
                className="w-full"
              >
                {t("import_export.drop_file")}
              </Button>
              {backupPath && (
                <p className="text-sm text-muted-foreground truncate">
                  {backupPath}
                </p>
              )}
            </div>

            <Separator />

            <div className="flex flex-col gap-2">
              <Label htmlFor="backup-password">
                {t("import_export.backup_password")}
              </Label>
              <Input
                id="backup-password"
                type="password"
                value={backupPassword}
                onChange={(e) => setBackupPassword(e.target.value)}
                placeholder={t("import_export.backup_password")}
              />
            </div>
            <Button
              onClick={handleImportBackup}
              disabled={!backupPath || !backupPassword || backupLoading}
              className="w-full"
            >
              {t("import_export.import")}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
