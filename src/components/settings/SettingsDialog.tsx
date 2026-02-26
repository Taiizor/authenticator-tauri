import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/tauri";
import { setTheme } from "@/lib/theme";
import type { Settings } from "@/types";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: Settings;
  onSettingsChange: (settings: Settings) => void;
}

export default function SettingsDialog({
  open,
  onOpenChange,
  settings,
  onSettingsChange,
}: SettingsDialogProps) {
  const { t, i18n } = useTranslation();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  function updateSetting<K extends keyof Settings>(
    key: K,
    value: Settings[K]
  ) {
    const updated = { ...settings, [key]: value };
    onSettingsChange(updated);
  }

  function handleThemeChange(value: string) {
    const theme = value as Settings["theme"];
    setTheme(theme);
    updateSetting("theme", theme);
  }

  function handleLanguageChange(value: string) {
    i18n.changeLanguage(value);
    updateSetting("language", value);
  }

  async function handleChangePassword() {
    setPasswordMessage("");
    setPasswordError(false);

    if (newPassword.length < 8) {
      setPasswordMessage("New password must be at least 8 characters");
      setPasswordError(true);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage("Passwords do not match");
      setPasswordError(true);
      return;
    }

    setChangingPassword(true);
    try {
      const success = await api.changePassword(currentPassword, newPassword);
      if (success) {
        setPasswordMessage(t("settings_dialog.password_changed"));
        setPasswordError(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPasswordMessage("Failed to change password. Check your current password.");
        setPasswordError(true);
      }
    } catch {
      setPasswordMessage("Failed to change password. Check your current password.");
      setPasswordError(true);
    } finally {
      setChangingPassword(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("settings_dialog.title")}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="general">
          <TabsList className="w-full">
            <TabsTrigger value="general">
              {t("settings_dialog.general")}
            </TabsTrigger>
            <TabsTrigger value="security">
              {t("settings_dialog.security")}
            </TabsTrigger>
            <TabsTrigger value="about">
              {t("settings_dialog.about")}
            </TabsTrigger>
          </TabsList>

          {/* General Tab */}
          <TabsContent value="general" className="space-y-4 pt-4">
            {/* Theme */}
            <div className="flex items-center justify-between">
              <Label>{t("settings_dialog.theme")}</Label>
              <Select
                value={settings.theme}
                onValueChange={handleThemeChange}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    {t("settings_dialog.theme_light")}
                  </SelectItem>
                  <SelectItem value="dark">
                    {t("settings_dialog.theme_dark")}
                  </SelectItem>
                  <SelectItem value="system">
                    {t("settings_dialog.theme_system")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Language */}
            <div className="flex items-center justify-between">
              <Label>{t("settings_dialog.language")}</Label>
              <Select
                value={settings.language}
                onValueChange={handleLanguageChange}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[280px]">
                  <SelectItem value="id">Bahasa Indonesia</SelectItem>
                  <SelectItem value="cs">Čeština</SelectItem>
                  <SelectItem value="da">Dansk</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="hr">Hrvatski</SelectItem>
                  <SelectItem value="it">Italiano</SelectItem>
                  <SelectItem value="hu">Magyar</SelectItem>
                  <SelectItem value="nl">Nederlands</SelectItem>
                  <SelectItem value="nb">Norsk bokmål</SelectItem>
                  <SelectItem value="pl">Polski</SelectItem>
                  <SelectItem value="pt-BR">Português (BR)</SelectItem>
                  <SelectItem value="ro">Română</SelectItem>
                  <SelectItem value="sk">Slovenčina</SelectItem>
                  <SelectItem value="fi">Suomi</SelectItem>
                  <SelectItem value="sv">Svenska</SelectItem>
                  <SelectItem value="vi">Tiếng Việt</SelectItem>
                  <SelectItem value="tr">Türkçe</SelectItem>
                  <SelectItem value="el">Ελληνικά</SelectItem>
                  <SelectItem value="bg">Български</SelectItem>
                  <SelectItem value="ru">Русский</SelectItem>
                  <SelectItem value="uk">Українська</SelectItem>
                  <SelectItem value="th">ไทย</SelectItem>
                  <SelectItem value="ko">한국어</SelectItem>
                  <SelectItem value="ja">日本語</SelectItem>
                  <SelectItem value="zh-CN">简体中文</SelectItem>
                  <SelectItem value="zh-TW">繁體中文</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Minimize to tray */}
            <div className="flex items-center justify-between">
              <Label htmlFor="minimize-to-tray">
                {t("settings_dialog.minimize_to_tray")}
              </Label>
              <Switch
                id="minimize-to-tray"
                checked={settings.minimize_to_tray}
                onCheckedChange={(checked) =>
                  updateSetting("minimize_to_tray", checked)
                }
              />
            </div>

            {/* Start minimized */}
            <div className="flex items-center justify-between">
              <Label htmlFor="start-minimized">
                {t("settings_dialog.start_minimized")}
              </Label>
              <Switch
                id="start-minimized"
                checked={settings.start_minimized}
                onCheckedChange={(checked) =>
                  updateSetting("start_minimized", checked)
                }
              />
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-4 pt-4">
            {/* Auto-lock */}
            <div className="flex items-center justify-between">
              <Label>{t("settings_dialog.auto_lock")}</Label>
              <Select
                value={String(settings.auto_lock_minutes)}
                onValueChange={(value) =>
                  updateSetting("auto_lock_minutes", Number(value))
                }
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">
                    {t("settings_dialog.auto_lock_disabled")}
                  </SelectItem>
                  <SelectItem value="1">
                    {t("settings_dialog.auto_lock_minutes", { minutes: 1 })}
                  </SelectItem>
                  <SelectItem value="5">
                    {t("settings_dialog.auto_lock_minutes", { minutes: 5 })}
                  </SelectItem>
                  <SelectItem value="10">
                    {t("settings_dialog.auto_lock_minutes", { minutes: 10 })}
                  </SelectItem>
                  <SelectItem value="15">
                    {t("settings_dialog.auto_lock_minutes", { minutes: 15 })}
                  </SelectItem>
                  <SelectItem value="30">
                    {t("settings_dialog.auto_lock_minutes", { minutes: 30 })}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Remember password */}
            <div className="flex items-center justify-between">
              <Label htmlFor="remember-password">
                {t("settings_dialog.remember_password")}
              </Label>
              <Switch
                id="remember-password"
                checked={settings.remember_password}
                onCheckedChange={(checked) =>
                  updateSetting("remember_password", checked)
                }
              />
            </div>

            <Separator />

            {/* Change password */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">
                {t("settings_dialog.change_password")}
              </Label>

              <div className="space-y-2">
                <Label htmlFor="current-password">
                  {t("settings_dialog.current_password")}
                </Label>
                <PasswordInput
                  id="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">
                  {t("settings_dialog.new_password")}
                </Label>
                <PasswordInput
                  id="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-new-password">
                  {t("settings_dialog.confirm_new_password")}
                </Label>
                <PasswordInput
                  id="confirm-new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              {passwordMessage && (
                <p
                  className={`text-sm ${
                    passwordError ? "text-destructive" : "text-green-600"
                  }`}
                >
                  {passwordMessage}
                </p>
              )}

              <Button
                onClick={handleChangePassword}
                disabled={
                  changingPassword ||
                  !currentPassword ||
                  !newPassword ||
                  !confirmPassword
                }
              >
                {t("settings_dialog.change_password")}
              </Button>
            </div>
          </TabsContent>

          {/* About Tab */}
          <TabsContent value="about" className="space-y-4 pt-4">
            <p className="text-muted-foreground text-sm">
              {t("settings_dialog.about_description")}
            </p>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>{t("settings_dialog.version")}</Label>
                <span className="text-muted-foreground text-sm">1.0.0</span>
              </div>

              <div className="flex items-center justify-between">
                <Label>{t("settings_dialog.license")}</Label>
                <span className="text-muted-foreground text-sm">MIT</span>
              </div>

              <div className="flex items-center justify-between">
                <Label>{t("settings_dialog.github")}</Label>
                <span className="text-muted-foreground text-sm">
                  github.com/Taiizor/authenticator-tauri
                </span>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
