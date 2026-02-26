import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { api } from "@/lib/tauri";

interface SetupWizardProps {
  onComplete: () => void;
}

function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  const length = password.length;
  if (length >= 16) {
    return { score: 100, label: "Very Strong", color: "bg-green-500" };
  }
  if (length >= 12) {
    return { score: 66, label: "Strong", color: "bg-yellow-500" };
  }
  if (length >= 8) {
    return { score: 33, label: "OK", color: "bg-orange-500" };
  }
  return { score: 10, label: "Weak", color: "bg-red-500" };
}

export default function SetupWizard({ onComplete }: SetupWizardProps) {
  const { t } = useTranslation();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const strength = getPasswordStrength(password);
  const passwordsMatch = password === confirmPassword;
  const isValid = password.length >= 8 && passwordsMatch && confirmPassword.length > 0;

  const showMismatchError =
    confirmPassword.length > 0 && !passwordsMatch;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!isValid) return;

    if (password.length < 8) {
      setError(t("setup.weak_password"));
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.setupVault(password);
      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10">
            <img src="/logo.svg" alt="Authenticator" className="size-6" />
          </div>
          <CardTitle className="text-2xl">{t("setup.title")}</CardTitle>
          <CardDescription>{t("setup.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="setup-password">
                {t("setup.password_label")}
              </Label>
              <PasswordInput
                id="setup-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                placeholder={t("setup.password_hint")}
                autoFocus
              />
              {password.length > 0 && (
                <div className="flex flex-col gap-1">
                  <Progress
                    value={strength.score}
                    className={`h-1.5 [&>[data-slot=progress-indicator]]:${strength.color}`}
                  />
                  <span className="text-xs text-muted-foreground">
                    {strength.label}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="setup-confirm">
                {t("setup.confirm_label")}
              </Label>
              <PasswordInput
                id="setup-confirm"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError("");
                }}
              />
              {showMismatchError && (
                <p className="text-destructive text-sm">
                  {t("setup.passwords_mismatch")}
                </p>
              )}
            </div>

            {error && (
              <p className="text-destructive text-sm">{error}</p>
            )}

            <Button type="submit" disabled={!isValid || loading} className="w-full">
              {loading ? "..." : t("setup.create_vault")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
