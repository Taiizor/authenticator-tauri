import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { listen } from "@tauri-apps/api/event";
import { Toaster, toast } from "sonner";

import { api } from "@/lib/tauri";
import { initTheme } from "@/lib/theme";

import { useAccounts } from "@/hooks/useAccounts";
import { useCodes } from "@/hooks/useCodes";
import { useSettings } from "@/hooks/useSettings";
import { useAutoLock } from "@/hooks/useAutoLock";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

import SetupWizard from "@/components/auth/SetupWizard";
import LockScreen from "@/components/auth/LockScreen";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SearchBar from "@/components/accounts/SearchBar";
import CategoryTabs from "@/components/accounts/CategoryTabs";
import AccountList from "@/components/accounts/AccountList";
import AddEditDialog from "@/components/accounts/AddEditDialog";
import SettingsDialog from "@/components/settings/SettingsDialog";
import ImportDialog from "@/components/import-export/ImportDialog";
import ExportDialog from "@/components/import-export/ExportDialog";

import type { AccountView, Settings } from "@/types";

type AppScreen = "loading" | "setup" | "locked" | "unlocked";

function App() {
  const { t } = useTranslation();

  // App state machine
  const [screen, setScreen] = useState<AppScreen>("loading");

  // Dialog states
  const [addEditOpen, setAddEditOpen] = useState(false);
  const [editAccount, setEditAccount] = useState<AccountView | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  // Search and filter
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Search input ref for focusing
  const searchRef = useRef<HTMLInputElement>(null);

  const isUnlocked = screen === "unlocked";

  // Hooks
  const { settings, updateSettings } = useSettings();
  const { accounts, categories, refresh: refreshAccounts } = useAccounts(isUnlocked);
  const { codes, incrementHotp } = useCodes(isUnlocked);

  // Auto-lock
  const handleLock = useCallback(async () => {
    try {
      await api.lockVault();
      setScreen("locked");
      setSearch("");
      setSelectedCategory(null);
    } catch (err) {
      console.error("Failed to lock:", err);
    }
  }, []);

  useAutoLock(settings.auto_lock_minutes, isUnlocked, handleLock);

  // Keyboard shortcuts
  useKeyboardShortcuts(
    {
      onNewAccount: () => {
        setEditAccount(null);
        setAddEditOpen(true);
      },
      onSearch: () => searchRef.current?.focus(),
      onLock: handleLock,
      onSettings: () => setSettingsOpen(true),
      onEscape: () => {
        setSearch("");
        setSelectedCategory(null);
      },
    },
    isUnlocked
  );

  // Init: check vault setup
  useEffect(() => {
    async function init() {
      try {
        const setup = await api.isVaultSetup();
        const s = await api.getSettings();
        initTheme(s.theme);
        setScreen(setup ? "locked" : "setup");
      } catch (err) {
        console.error("Init failed:", err);
        setScreen("setup");
      }
    }
    init();
  }, []);

  // Listen for vault-locked event from tray
  useEffect(() => {
    const unlisten = listen("vault-locked", () => {
      setScreen("locked");
      setSearch("");
      setSelectedCategory(null);
    });
    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  // Filter accounts
  const filteredAccounts = accounts.filter((a) => {
    const matchesSearch =
      search === "" ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      (a.issuer && a.issuer.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory =
      selectedCategory === null || a.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Category counts
  const accountCounts: Record<string, number> = {};
  accounts.forEach((a) => {
    if (a.category) {
      accountCounts[a.category] = (accountCounts[a.category] || 0) + 1;
    }
  });

  // Handlers
  const handleCopy = useCallback(
    async (code: string) => {
      try {
        await navigator.clipboard.writeText(code);
        toast.success(t("copied"));
      } catch (err) {
        console.error("Copy failed:", err);
      }
    },
    [t]
  );

  const handleEdit = useCallback((account: AccountView) => {
    setEditAccount(account);
    setAddEditOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (account: AccountView) => {
      if (!window.confirm(t("confirm_delete", { name: account.name }))) return;
      try {
        await api.deleteAccount(account.id);
        refreshAccounts();
      } catch (err) {
        console.error("Delete failed:", err);
      }
    },
    [t, refreshAccounts]
  );

  const handleReorder = useCallback(
    async (ids: string[]) => {
      try {
        await api.reorderAccounts(ids);
        refreshAccounts();
      } catch (err) {
        console.error("Reorder failed:", err);
      }
    },
    [refreshAccounts]
  );

  const handleSettingsChange = useCallback(
    async (newSettings: Settings) => {
      try {
        await updateSettings(newSettings);
      } catch (err) {
        console.error("Settings save failed:", err);
      }
    },
    [updateSettings]
  );

  // Render based on screen state
  if (screen === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (screen === "setup") {
    return (
      <>
        <SetupWizard onComplete={() => setScreen("unlocked")} />
        <Toaster />
      </>
    );
  }

  if (screen === "locked") {
    return (
      <>
        <LockScreen onUnlock={() => setScreen("unlocked")} />
        <Toaster />
      </>
    );
  }

  // Unlocked - main app
  return (
    <div className="flex flex-col min-h-screen">
      <Header
        onAddAccount={() => {
          setEditAccount(null);
          setAddEditOpen(true);
        }}
        onImportExport={() => setImportOpen(true)}
        onSettings={() => setSettingsOpen(true)}
        onLock={handleLock}
      />

      <main className="flex-1 flex flex-col px-4 py-3 gap-3">
        <SearchBar value={search} onChange={setSearch} />

        {categories.length > 0 && (
          <CategoryTabs
            categories={categories}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
            accountCounts={accountCounts}
          />
        )}

        <AccountList
          accounts={filteredAccounts}
          codes={codes}
          onCopy={handleCopy}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onIncrementHotp={incrementHotp}
          onReorder={handleReorder}
        />
      </main>

      <Footer accountCount={accounts.length} />

      {/* Dialogs */}
      <AddEditDialog
        open={addEditOpen}
        onOpenChange={setAddEditOpen}
        account={editAccount}
        onSaved={refreshAccounts}
      />

      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        settings={settings}
        onSettingsChange={handleSettingsChange}
      />

      <ImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onImported={refreshAccounts}
      />

      <ExportDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
      />

      <Toaster />
    </div>
  );
}

export default App;
