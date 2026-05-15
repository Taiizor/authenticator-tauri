import { useState } from "react";
import { useTranslation } from "react-i18next";
import { save, open } from "@tauri-apps/plugin-dialog";
import { toast } from "sonner";
import { ShieldCheck, FileText, FileBox, QrCode } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/tauri";

type ExportMethod = "backup" | "plain" | "file" | "google_qr";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const METHODS = [
  {
    id: "backup" as const,
    icon: ShieldCheck,
    labelKey: "import_export.export_method_backup",
    descKey: "import_export.export_method_backup_desc",
  },
  {
    id: "plain" as const,
    icon: FileText,
    labelKey: "import_export.export_method_plain",
    descKey: "import_export.export_method_plain_desc",
  },
  {
    id: "file" as const,
    icon: FileBox,
    labelKey: "import_export.export_method_file",
    descKey: "import_export.export_method_file_desc",
  },
  {
    id: "google_qr" as const,
    icon: QrCode,
    labelKey: "import_export.export_method_google_qr",
    descKey: "import_export.export_method_google_qr_desc",
  },
];

const FILE_FORMATS = [
  { value: "aegis", labelKey: "import_export.formats.aegis", ext: ["json"] },
  { value: "twofas", labelKey: "import_export.formats.twofas", ext: ["json"] },
  { value: "ente", labelKey: "import_export.formats.ente", ext: ["json"] },
  { value: "csv", labelKey: "import_export.formats.csv", ext: ["csv"] },
  { value: "uri_list", labelKey: "import_export.formats.uri_list", ext: ["txt"] },
] as const;

export default function ExportDialog({
  open: isOpen,
  onOpenChange,
}: ExportDialogProps) {
  const { t } = useTranslation();

  const [method, setMethod] = useState<ExportMethod | null>(null);

  // Backup
  const [backupPassword, setBackupPassword] = useState("");
  const [backupLoading, setBackupLoading] = useState(false);

  // Plain
  const [plainPassword, setPlainPassword] = useState("");
  const [plainLoading, setPlainLoading] = useState(false);

  // File
  const [fileFormat, setFileFormat] = useState("");
  const [fileLoading, setFileLoading] = useState(false);

  // Google QR
  const [googlePrefix, setGooglePrefix] = useState("authenticator_export");
  const [googleLoading, setGoogleLoading] = useState(false);

  function resetState() {
    setMethod(null);
    setBackupPassword("");
    setBackupLoading(false);
    setPlainPassword("");
    setPlainLoading(false);
    setFileFormat("");
    setFileLoading(false);
    setGooglePrefix("authenticator_export");
    setGoogleLoading(false);
  }

  function handleOpenChange(value: boolean) {
    if (!value) resetState();
    onOpenChange(value);
  }

  function reportError(err: unknown) {
    toast.error(
      t("import_export.export_error", {
        error: err instanceof Error ? err.message : String(err),
      })
    );
  }

  async function handleExportBackup() {
    if (!backupPassword) return;
    setBackupLoading(true);
    try {
      const path = await save({
        filters: [{ name: "Encrypted Backup", extensions: ["authbackup"] }],
      });
      if (!path) {
        setBackupLoading(false);
        return;
      }
      await api.exportBackup(path, backupPassword);
      toast.success(t("import_export.export_success"));
      handleOpenChange(false);
    } catch (err) {
      reportError(err);
    } finally {
      setBackupLoading(false);
    }
  }

  async function handleExportPlain() {
    if (!plainPassword) return;
    setPlainLoading(true);
    try {
      const path = await save({
        filters: [{ name: "JSON", extensions: ["json"] }],
      });
      if (!path) {
        setPlainLoading(false);
        return;
      }
      await api.exportPlain(path, plainPassword);
      toast.success(t("import_export.export_success"));
      handleOpenChange(false);
    } catch (err) {
      reportError(err);
    } finally {
      setPlainLoading(false);
    }
  }

  async function handleExportFile() {
    if (!fileFormat) return;
    const fmt = FILE_FORMATS.find((f) => f.value === fileFormat);
    if (!fmt) return;
    setFileLoading(true);
    try {
      const path = await save({
        filters: [{ name: t(fmt.labelKey), extensions: [...fmt.ext] }],
      });
      if (!path) {
        setFileLoading(false);
        return;
      }
      await api.exportToFile(path, fileFormat);
      toast.success(t("import_export.export_success"));
      handleOpenChange(false);
    } catch (err) {
      reportError(err);
    } finally {
      setFileLoading(false);
    }
  }

  async function handleExportGoogleQr() {
    const prefix = googlePrefix.trim() || "authenticator_export";
    setGoogleLoading(true);
    try {
      const dir = await open({ directory: true, multiple: false });
      if (!dir || typeof dir !== "string") {
        setGoogleLoading(false);
        return;
      }
      const written = await api.exportGoogleQr(dir, prefix);
      toast.success(
        t("import_export.google_qr_saved", { count: written.length })
      );
      handleOpenChange(false);
    } catch (err) {
      reportError(err);
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[420px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("import_export.export")}</DialogTitle>
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

        {/* Backup form */}
        {method === "backup" && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="export-backup-password">
                {t("import_export.backup_password")}
              </Label>
              <PasswordInput
                id="export-backup-password"
                value={backupPassword}
                onChange={(e) => setBackupPassword(e.target.value)}
                placeholder={t("import_export.backup_password")}
                onKeyDown={(e) => e.key === "Enter" && handleExportBackup()}
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
        )}

        {/* Plain JSON form */}
        {method === "plain" && (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-destructive">
              {t("import_export.export_plain_warning")}
            </p>
            <div className="flex flex-col gap-2">
              <Label htmlFor="export-plain-password">
                {t("import_export.backup_password")}
              </Label>
              <PasswordInput
                id="export-plain-password"
                value={plainPassword}
                onChange={(e) => setPlainPassword(e.target.value)}
                placeholder={t("import_export.backup_password")}
                onKeyDown={(e) => e.key === "Enter" && handleExportPlain()}
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
        )}

        {/* File form */}
        {method === "file" && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              <Label>{t("import_export.export_format_label")}</Label>
              <Select value={fileFormat} onValueChange={setFileFormat}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("import_export.select_format")} />
                </SelectTrigger>
                <SelectContent>
                  {FILE_FORMATS.map((fmt) => (
                    <SelectItem key={fmt.value} value={fmt.value}>
                      {t(fmt.labelKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleExportFile}
              disabled={!fileFormat || fileLoading}
              className="w-full"
            >
              {t("import_export.export")}
            </Button>
          </div>
        )}

        {/* Google QR form */}
        {method === "google_qr" && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="google-prefix">
                {t("import_export.export_filename_prefix")}
              </Label>
              <Input
                id="google-prefix"
                value={googlePrefix}
                onChange={(e) => setGooglePrefix(e.target.value)}
                placeholder="authenticator_export"
              />
            </div>
            <Button
              onClick={handleExportGoogleQr}
              disabled={googleLoading}
              className="w-full"
            >
              {t("import_export.select_folder")}
            </Button>
          </div>
        )}

        {/* Empty state */}
        {!method && (
          <p className="text-sm text-muted-foreground text-center py-4">
            {t("import_export.export_to")}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
