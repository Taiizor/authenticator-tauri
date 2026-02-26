import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { api } from "@/lib/tauri";

interface LockScreenProps {
  onUnlock: () => void;
}

export default function LockScreen({ onUnlock }: LockScreenProps) {
  const { t } = useTranslation();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberDevice, setRememberDevice] = useState(false);

  async function handleUnlock(e?: React.FormEvent) {
    e?.preventDefault();

    if (!password) return;

    setLoading(true);
    setError("");

    try {
      const success = await api.unlockVault(password);
      if (success) {
        onUnlock();
      } else {
        setError(t("lock_screen.wrong_password"));
        setPassword("");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("lock_screen.wrong_password")
      );
      setPassword("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10">
            <Lock className="size-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">
            {t("lock_screen.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUnlock} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="lock-password">
                {t("lock_screen.password_label")}
              </Label>
              <PasswordInput
                id="lock-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleUnlock();
                  }
                }}
                autoFocus
              />
              {error && (
                <p className="text-destructive text-sm">{error}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="remember-device"
                checked={rememberDevice}
                onCheckedChange={setRememberDevice}
              />
              <Label htmlFor="remember-device" className="cursor-pointer">
                {t("lock_screen.remember_device")}
              </Label>
            </div>

            <Button
              type="submit"
              disabled={!password || loading}
              className="w-full"
            >
              {loading ? "..." : t("lock_screen.unlock_button")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
