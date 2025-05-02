export type Language = "en" | "fr" | "es" | "de" | "zh";

export type TranslationStrings = {
  search: string;
  noResults: string;
  import: string;
  export: string;
  translating: string;
};

export const translations: Record<Language, TranslationStrings> = {
  en: {
    search: "Search all columns...",
    noResults: "No results.",
    import: "Import",
    export: "Export",
    translating: "Translating...",
  },
  fr: {
    search: "Rechercher toutes les colonnes...",
    noResults: "Aucun résultat.",
    import: "Importer",
    export: "Exporter",
    translating: "Traduction en cours...",
  },
  es: {
    search: "Buscar en todas las columnas...",
    noResults: "Sin resultados.",
    import: "Importar",
    export: "Exportar",
    translating: "Traduciendo...",
  },
  de: {
    search: "In allen Spalten suchen...",
    noResults: "Keine Ergebnisse.",
    import: "Importieren",
    export: "Exportieren",
    translating: "Wird übersetzt...",
  },
  zh: {
    search: "搜索所有列...",
    noResults: "没有结果。",
    import: "导入",
    export: "导出",
    translating: "翻译中...",
  }
};