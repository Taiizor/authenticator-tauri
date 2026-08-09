import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/tauri";
import BrandAvatar from "@/components/accounts/BrandAvatar";
import type { AccountView } from "@/types";

const COLOR_PRESETS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];

interface AddEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account?: AccountView | null;
  onSaved: () => void;
}

export default function AddEditDialog({
  open,
  onOpenChange,
  account,
  onSaved,
}: AddEditDialogProps) {
  const { t } = useTranslation();
  const isEdit = !!account;

  const [name, setName] = useState("");
  const [issuer, setIssuer] = useState("");
  const [secret, setSecret] = useState("");
  const [otpType, setOtpType] = useState<"totp" | "hotp">("totp");
  const [digits, setDigits] = useState(6);
  const [period, setPeriod] = useState(30);
  const [algorithm, setAlgorithm] = useState<"SHA1" | "SHA256" | "SHA512">(
    "SHA1"
  );
  const [category, setCategory] = useState("");
  const [color, setColor] = useState("#3b82f6");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (account) {
      setName(account.name);
      setIssuer(account.issuer ?? "");
      setSecret("");
      setOtpType(account.otp_type);
      setDigits(account.digits);
      setPeriod(account.period);
      setAlgorithm(account.algorithm);
      setCategory(account.category ?? "");
      setColor(account.color ?? "#3b82f6");
    } else {
      setName("");
      setIssuer("");
      setSecret("");
      setOtpType("totp");
      setDigits(6);
      setPeriod(30);
      setAlgorithm("SHA1");
      setCategory("");
      setColor("#3b82f6");
    }
    setErrors({});
    setLoading(false);
  }, [open, account]);

  async function validate(): Promise<boolean> {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = t("account_form.name_required");
    }

    if (!isEdit && !secret.trim()) {
      newErrors.secret = t("account_form.secret_required");
    }

    if (secret.trim()) {
      try {
        const valid = await api.validateSecret(secret.trim());
        if (!valid) {
          newErrors.secret = t("account_form.invalid_secret");
        }
      } catch {
        newErrors.secret = t("account_form.invalid_secret");
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSave() {
    const isValid = await validate();
    if (!isValid) return;

    setLoading(true);

    try {
      if (isEdit) {
        await api.updateAccount({
          id: account.id,
          name: name.trim(),
          issuer: issuer.trim() || undefined,
          secret: secret.trim() || undefined,
          category: category.trim() || undefined,
          color: color || undefined,
        });
      } else {
        await api.addAccount({
          name: name.trim(),
          secret: secret.trim(),
          otpType,
          digits,
          period,
          algorithm,
          issuer: issuer.trim() || undefined,
          category: category.trim() || undefined,
          color: color || undefined,
        });
      }

      onSaved();
      onOpenChange(false);
    } catch (err) {
      console.error("Failed to save account:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center gap-3">
          <BrandAvatar name={name || "A"} issuer={issuer} color={color} />
          <DialogTitle>
            {isEdit ? t("edit_account") : t("add_account")}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* Name field */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="account-name">{t("account_form.name")}</Label>
            <Input
              id="account-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("account_form.name_placeholder")}
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          {/* Issuer field */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="account-issuer">{t("account_form.issuer")}</Label>
            <Input
              id="account-issuer"
              value={issuer}
              onChange={(e) => setIssuer(e.target.value)}
              placeholder={t("account_form.issuer_placeholder")}
            />
          </div>

          {/* Secret field */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="account-secret">{t("account_form.secret")}</Label>
            <Input
              id="account-secret"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder={t("account_form.secret_placeholder")}
              aria-invalid={!!errors.secret}
            />
            {errors.secret && (
              <p className="text-sm text-destructive">{errors.secret}</p>
            )}
          </div>

          {/* Category field */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="account-category">
              {t("account_form.category")}
            </Label>
            <Input
              id="account-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder={t("account_form.category_placeholder")}
            />
          </div>

          {/* Color picker */}
          <div className="flex flex-col gap-2">
            <Label>{t("account_form.color")}</Label>
            <div className="flex flex-wrap gap-2">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  className="size-8 rounded-full border-2 transition-transform hover:scale-110"
                  style={{
                    backgroundColor: preset,
                    borderColor: color === preset ? "white" : "transparent",
                    boxShadow:
                      color === preset
                        ? `0 0 0 2px ${preset}`
                        : "none",
                  }}
                  onClick={() => setColor(preset)}
                  aria-label={preset}
                />
              ))}
            </div>
          </div>

          {/* Advanced fields - only in add mode */}
          {!isEdit && (
            <>
              <Separator />

              {/* Type select */}
              <div className="flex flex-col gap-2">
                <Label>{t("account_form.type")}</Label>
                <Select
                  value={otpType}
                  onValueChange={(v) => setOtpType(v as "totp" | "hotp")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="totp">
                      {t("account_form.totp")}
                    </SelectItem>
                    <SelectItem value="hotp">
                      {t("account_form.hotp")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Digits select */}
              <div className="flex flex-col gap-2">
                <Label>{t("account_form.digits")}</Label>
                <Select
                  value={String(digits)}
                  onValueChange={(v) => setDigits(Number(v))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">6</SelectItem>
                    <SelectItem value="7">7</SelectItem>
                    <SelectItem value="8">8</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Period select - only for TOTP */}
              {otpType === "totp" && (
                <div className="flex flex-col gap-2">
                  <Label>{t("account_form.period")}</Label>
                  <Select
                    value={String(period)}
                    onValueChange={(v) => setPeriod(Number(v))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15</SelectItem>
                      <SelectItem value="30">30</SelectItem>
                      <SelectItem value="60">60</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Algorithm select */}
              <div className="flex flex-col gap-2">
                <Label>{t("account_form.algorithm")}</Label>
                <Select
                  value={algorithm}
                  onValueChange={(v) =>
                    setAlgorithm(v as "SHA1" | "SHA256" | "SHA512")
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SHA1">SHA-1</SelectItem>
                    <SelectItem value="SHA256">SHA-256</SelectItem>
                    <SelectItem value="SHA512">SHA-512</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {t("account_form.cancel")}
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {t("account_form.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
