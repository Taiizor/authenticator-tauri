import { useState } from "react";
import { useTranslation } from "react-i18next";
import { open } from "@tauri-apps/plugin-dialog";
import { toast } from "sonner";
import { Link, Image, FileText, ShieldCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { api } from "@/lib/tauri";

type ImportMethod = "uri" | "qr" | "file" | "backup";

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

const METHODS = [
  { id: "uri" as const, icon: Link, labelKey: "import_export.method_uri", descKey: "import_export.method_uri_desc" },
  { id: "qr" as const, icon: Image, labelKey: "import_export.method_qr", descKey: "import_export.method_qr_desc" },
  { id: "file" as const, icon: FileText, labelKey: "import_export.method_file", descKey: "import_export.method_file_desc" },
  { id: "backup" as const, icon: ShieldCheck, labelKey: "import_export.method_backup", descKey: "import_export.method_backup_desc" },
];

export default function ImportDialog({
  open: isOpen,
  onOpenChange,
  onImported,
}: ImportDialogProps) {
  const { t } = useTranslation();

  const [method, setMethod] = useState<ImportMethod | null>(null);

  // URI
  const [uri, setUri] = useState("");
  const [uriLoading, setUriLoading] = useState(false);

  // QR
  const [qrPath, setQrPath] = useState("");
  const [qrLoading, setQrLoading] = useState(false);

  // File
  const [fileFormat, setFileFormat] = useState("");
  const [filePath, setFilePath] = useState("");
  const [fileLoading, setFileLoading] = useState(false);

  // Backup
  const [backupPath, setBackupPath] = useState("");
  const [backupPassword, setBackupPassword] = useState("");
  const [backupLoading, setBackupLoading] = useState(false);

  function resetState() {
    setMethod(null);
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
    if (!value) resetState();
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
      toast.error(t("import_export.import_error", { error: String(err) }));
    } finally {
      setUriLoading(false);
    }
  }

  async function handleSelectQrImage() {
    const selected = await open({
      multiple: false,
      filters: [{ name: "Images", extensions: ["png", "jpg", "jpeg"] }],
    });
    if (selected) setQrPath(selected);
  }

  async function handleImportQr() {
    if (!qrPath) return;
    setQrLoading(true);
    try {
      const result = await api.importFromQrImage(qrPath);
      toast.success(t("import_export.import_success", { count: result.length }));
      onImported();
      handleOpenChange(false);
    } catch (err) {
      toast.error(t("import_export.import_error", { error: String(err) }));
    } finally {
      setQrLoading(false);
    }
  }

  async function handleSelectFile() {
    const selected = await open({
      multiple: false,
      filters: [{ name: "Import Files", extensions: ["json", "csv", "txt"] }],
    });
    if (selected) setFilePath(selected);
  }

  async function handleImportFile() {
    if (!filePath || !fileFormat) return;
    setFileLoading(true);
    try {
      const result = await api.importFromFile(filePath, fileFormat);
      toast.success(t("import_export.import_success", { count: result.length }));
      onImported();
      handleOpenChange(false);
    } catch (err) {
      toast.error(t("import_export.import_error", { error: String(err) }));
    } finally {
      setFileLoading(false);
    }
  }

  async function handleSelectBackup() {
    const selected = await open({
      multiple: false,
      filters: [{ name: "Backup Files", extensions: ["authbackup"] }],
    });
    if (selected) setBackupPath(selected);
  }

  async function handleImportBackup() {
    if (!backupPath || !backupPassword) return;
    setBackupLoading(true);
    try {
      const result = await api.importBackup(backupPath, backupPassword);
      toast.success(t("import_export.import_success", { count: result.length }));
      onImported();
      handleOpenChange(false);
    } catch (err) {
      toast.error(t("import_export.import_error", { error: String(err) }));
    } finally {
      setBackupLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[420px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("import_export.import")}</DialogTitle>
        </DialogHeader>

        {/* Method selector grid */}
        <div className="grid grid-cols-4 gap-2">
          {METHODS.map((m) => {
            const Icon = m.icon;
            const isSelected = method === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setMethod(m.id)}
                className={`flex flex-col items-center gap-1.5 rounded-lg border p-3 text-center transition-colors ${
                  isSelected
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <Icon className="size-5" />
                <span className="text-xs font-medium leading-tight">
                  {t(m.labelKey)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected method description */}
        {method && (
          <p className="text-xs text-muted-foreground text-center">
            {t(METHODS.find((m) => m.id === method)!.descKey)}
          </p>
        )}

        {/* URI form */}
        {method === "uri" && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="import-uri">{t("import_export.import_uri")}</Label>
              <Input
                id="import-uri"
                value={uri}
                onChange={(e) => setUri(e.target.value)}
                placeholder="otpauth://totp/..."
                onKeyDown={(e) => e.key === "Enter" && handleImportUri()}
              />
            </div>
            <Button
              onClick={handleImportUri}
              disabled={!uri.trim() || uriLoading}
              className="w-full"
            >
              {t("import_export.import")}
            </Button>
          </div>
        )}

        {/* QR form */}
        {method === "qr" && (
          <div className="flex flex-col gap-3">
            <Button variant="outline" onClick={handleSelectQrImage} className="w-full">
              {qrPath ? (
                <span className="truncate">{qrPath.split(/[/\\]/).pop()}</span>
              ) : (
                t("import_export.select_file")
              )}
            </Button>
            <Button
              onClick={handleImportQr}
              disabled={!qrPath || qrLoading}
              className="w-full"
            >
              {t("import_export.import")}
            </Button>
          </div>
        )}

        {/* File form */}
        {method === "file" && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              <Label>{t("import_export.select_format")}</Label>
              <Select value={fileFormat} onValueChange={setFileFormat}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("import_export.select_format")} />
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
            <Button
              variant="outline"
              onClick={handleSelectFile}
              disabled={!fileFormat}
              className="w-full"
            >
              {filePath ? (
                <span className="truncate">{filePath.split(/[/\\]/).pop()}</span>
              ) : (
                t("import_export.select_file")
              )}
            </Button>
            <Button
              onClick={handleImportFile}
              disabled={!filePath || !fileFormat || fileLoading}
              className="w-full"
            >
              {t("import_export.import")}
            </Button>
          </div>
        )}

        {/* Backup form */}
        {method === "backup" && (
          <div className="flex flex-col gap-3">
            <Button variant="outline" onClick={handleSelectBackup} className="w-full">
              {backupPath ? (
                <span className="truncate">{backupPath.split(/[/\\]/).pop()}</span>
              ) : (
                t("import_export.select_file")
              )}
            </Button>
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
                onKeyDown={(e) => e.key === "Enter" && handleImportBackup()}
              />
            </div>
            <Button
              onClick={handleImportBackup}
              disabled={!backupPath || !backupPassword || backupLoading}
              className="w-full"
            >
              {t("import_export.import")}
            </Button>
          </div>
        )}

        {/* Empty state */}
        {!method && (
          <p className="text-sm text-muted-foreground text-center py-4">
            {t("import_export.import_from")}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
