import { useTranslation } from "react-i18next";

interface FooterProps {
  accountCount: number;
}

export default function Footer({ accountCount }: FooterProps) {
  const { t } = useTranslation();

  return (
    <footer className="sticky bottom-0 z-50 bg-muted/50 border-t">
      <div className="flex items-center justify-between px-4 py-1.5">
        <span className="text-xs text-muted-foreground">
          {t("accounts_count", { count: accountCount })}
        </span>
        <span className="text-xs text-muted-foreground">
          Authenticator v1.0.0
        </span>
      </div>
    </footer>
  );
}
