import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import bg from "@/locales/bg/translation.json";
import cs from "@/locales/cs/translation.json";
import da from "@/locales/da/translation.json";
import de from "@/locales/de/translation.json";
import el from "@/locales/el/translation.json";
import en from "@/locales/en/translation.json";
import es from "@/locales/es/translation.json";
import fi from "@/locales/fi/translation.json";
import fr from "@/locales/fr/translation.json";
import hr from "@/locales/hr/translation.json";
import hu from "@/locales/hu/translation.json";
import id from "@/locales/id/translation.json";
import it from "@/locales/it/translation.json";
import ja from "@/locales/ja/translation.json";
import ko from "@/locales/ko/translation.json";
import nb from "@/locales/nb/translation.json";
import nl from "@/locales/nl/translation.json";
import pl from "@/locales/pl/translation.json";
import ptBR from "@/locales/pt-BR/translation.json";
import ro from "@/locales/ro/translation.json";
import ru from "@/locales/ru/translation.json";
import sk from "@/locales/sk/translation.json";
import sv from "@/locales/sv/translation.json";
import th from "@/locales/th/translation.json";
import tr from "@/locales/tr/translation.json";
import uk from "@/locales/uk/translation.json";
import vi from "@/locales/vi/translation.json";
import zhCN from "@/locales/zh-CN/translation.json";
import zhTW from "@/locales/zh-TW/translation.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      bg: { translation: bg },
      cs: { translation: cs },
      da: { translation: da },
      de: { translation: de },
      el: { translation: el },
      en: { translation: en },
      es: { translation: es },
      fi: { translation: fi },
      fr: { translation: fr },
      hr: { translation: hr },
      hu: { translation: hu },
      id: { translation: id },
      it: { translation: it },
      ja: { translation: ja },
      ko: { translation: ko },
      nb: { translation: nb },
      nl: { translation: nl },
      pl: { translation: pl },
      "pt-BR": { translation: ptBR },
      ro: { translation: ro },
      ru: { translation: ru },
      sk: { translation: sk },
      sv: { translation: sv },
      th: { translation: th },
      tr: { translation: tr },
      uk: { translation: uk },
      vi: { translation: vi },
      "zh-CN": { translation: zhCN },
      "zh-TW": { translation: zhTW },
    },
    fallbackLng: "en",
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
  });

export default i18n;
