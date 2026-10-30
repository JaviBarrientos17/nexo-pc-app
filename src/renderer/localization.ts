export type Language = "es" | "en" | "fr" | "de" | "pt" | "it" | "ja";

export const SUPPORTED_LANGUAGES: Array<{ code: Language; label: string }> = [
  { code: "es", label: "Español" },
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "pt", label: "Português" },
  { code: "it", label: "Italiano" },
  { code: "ja", label: "日本語" },
];

export function getInitialLanguage(
  preference: string | null,
  deviceLanguages: readonly string[],
): Language {
  const supportedCodes = SUPPORTED_LANGUAGES.map((l) => l.code);
  if (preference && supportedCodes.includes(preference as Language)) {
    return preference as Language;
  }
  for (const locale of deviceLanguages) {
    const lang = locale.split("-")[0].toLowerCase() as Language;
    if (supportedCodes.includes(lang)) return lang;
  }
  return "es";
}

const english: Record<string, string> = {
  "Diagnóstico local": "Local diagnostics",
  "Datos en este equipo": "Data on this PC",
  "Actualización automática": "Auto refresh",
  "MI EQUIPO": "MY PC",
  "Tu equipo, de un vistazo": "Your PC at a glance",
  "Leyendo tu equipo": "Reading your PC",
  "Rendimiento, componentes y estado del sistema.":
    "Performance, components and system health.",
  "Uso no disponible": "Usage unavailable",
  "Ver detalles": "View details",
  "Más allá del resumen": "Beyond the overview",
  "EXPLORAR EL EQUIPO": "EXPLORE YOUR PC",
  "Consulta los sensores disponibles, compara lecturas y sigue sus mínimos y máximos.":
    "Explore available sensors, compare readings and track their minimums and maximums.",
  "Explorar hardware": "Explore hardware",
  "Esperando más lecturas para mostrar la actividad":
    "Waiting for more readings to show activity",
  "1 lectura": "1 reading",
  "Revisión de limpieza": "Cleanup review",
  "Consulta las ubicaciones previstas para limpieza. Esta versión no elimina archivos.":
    "Review the locations planned for cleanup. This version does not delete files.",
  "Solo previsualización": "Preview only",
  "Restablecer mín/máx": "Reset min/max",
  "Pausar mín/máx": "Pause min/max",
  "Reanudar mín/máx": "Resume min/max",
  "Buscar sensor o componente": "Search sensors or components",
  "Borrar búsqueda": "Clear search",
  "Ver sensores de hardware": "View hardware sensors",
  SISTEMA: "SYSTEM",
  MANTENIMIENTO: "MAINTENANCE",
  Resumen: "Overview",
  Hardware: "Hardware",
  "Salud del sistema": "System health",
  Unidades: "Drives",
  Limpieza: "Cleanup",
  Actualizaciones: "Updates",
  Ajustes: "Settings",
  IDIOMA: "LANGUAGE",
  "Idioma de la aplicación": "App language",
  "Elige el idioma de todos los menús y pantallas.":
    "Choose the language for all menus and screens.",
  Español: "Spanish",
  "Diagnóstico Local": "Local diagnostics",
  "Protección activa": "Protection active",
  "Mi equipo": "My PC",
  "En directo": "Live",
  "Exportar como TXT": "Export as TXT",
  "Exportar como CSV": "Export as CSV",
  "Buscar actualizaciones": "Check for updates",
  "Actualizar previsualización": "Refresh preview",
  "Actualizar datos": "Refresh data",
  Volver: "Back",
  Avanzar: "Forward",
  "Mostrar barra lateral": "Show sidebar",
  "Ocultar barra lateral": "Hide sidebar",
  "Cambiar a modo claro": "Switch to light mode",
  "Cambiar a modo oscuro": "Switch to dark mode",
  "Modo claro": "Light mode",
  "Modo oscuro": "Dark mode",
  Opciones: "Options",
  PREFERENCIAS: "PREFERENCES",
  "Personaliza la apariencia y consulta cómo se gestionan tus datos.":
    "Customize the appearance and learn how your data is handled.",
  APARIENCIA: "APPEARANCE",
  "Modo de color": "Color mode",
  "Elige la apariencia de Nexo PC.": "Choose the appearance of Nexo PC.",
  Claro: "Light",
  Oscuro: "Dark",
  PRIVACIDAD: "PRIVACY",
  "Procesamiento local": "Local processing",
  "Los datos del sistema se recopilan y muestran en este equipo.":
    "System data is collected and displayed on this PC.",
  "Solo en este equipo": "This PC only",
  APLICACIÓN: "APP",
  "Diagnóstico y mantenimiento local": "Local diagnostics and maintenance",
  "La versión instalada se gestiona desde Actualizaciones.":
    "Manage the installed version from Updates.",
  "Barras de porcentaje": "Percentage bars",
  "Mostrar barras de color con los porcentajes de uso en las métricas.":
    "Show colored bars with usage percentages on metrics.",
  Activadas: "Enabled",
  Desactivadas: "Disabled",
  ACTUALIZACIONES: "UPDATES",
  "Actualizaciones de Nexo PC": "Nexo PC updates",
  "Busca aquí una versión nueva de Nexo PC.":
    "Check here for a new version of Nexo PC.",
  "Cargando datos…": "Loading data…",
  "Hay una actualización disponible.": "An update is available.",
  "La actualización se está instalando y la aplicación se reiniciará.":
    "The update is installing and the app will restart.",
  "Descargando actualización…": "Downloading update…",
  "Descargando…": "Downloading…",
  "No se encontraron actualizaciones disponibles.": "No updates were found.",
  "Hay una nueva versión de Nexo PC": "A new version of Nexo PC is available",
  "Nueva versión disponible": "New version available",
  "Nueva versión:": "New version:",
  "Descargar y actualizar": "Download and update",
  Descargar: "Download",
  "Reiniciar e instalar": "Restart and install",
  "Buscando…": "Checking…",
  "Buscar otra vez": "Check again",
  "No se pudo comprobar si hay actualizaciones.":
    "Could not check for updates.",
  "Comprobación de actualizaciones iniciada.": "Update check started.",
  "Actualización disponible": "Update available",
  "Error de actualización": "Update error",
  "Reintentar descarga": "Retry download",
  "Progreso de descarga": "Download progress",
  "Todo funciona correctamente": "Everything is working correctly",
  "Hay elementos que requieren atención": "Some items need attention",
  "Esperando lectura de hardware": "Waiting for hardware data",
  DIAGNÓSTICO: "DIAGNOSTICS",
  ALMACENAMIENTO: "STORAGE",
  "Un resumen de las métricas disponibles para ayudarte a detectar posibles problemas.":
    "A summary of available metrics to help you identify potential issues.",
  "Resumen de estado": "Status summary",
  "Temperatura actual:": "Current temperature:",
  "en uso": "in use",
  "ESTADO ACTUAL": "CURRENT STATUS",
  "Comprobaciones del equipo": "PC checks",
  "Esperando datos": "Waiting for data",
  "Esperando identificación": "Waiting for identification",
  "Memoria del sistema": "System memory",
  "Placa base y BIOS": "Motherboard and BIOS",
  Identificada: "Detected",
  "Espacio utilizado": "Space used",
  "Consulta tus discos, volúmenes y el espacio disponible en este equipo.":
    "View your disks, volumes, and available space on this PC.",
  "Espacio disponible": "Available space",
  "Esperando lectura": "Waiting for data",
  "USO TOTAL": "TOTAL USAGE",
  "Espacio de almacenamiento": "Storage space",
  usado: "used",
  usados: "used",
  disponibles: "available",
  "DISCOS FÍSICOS": "PHYSICAL DRIVES",
  "Hardware de almacenamiento": "Storage hardware",
  unidades: "drives",
  "Leyendo…": "Loading…",
  "Recopilando información de las unidades…": "Collecting drive information…",
  "No se detectaron unidades físicas.": "No physical drives detected.",
  VOLÚMENES: "VOLUMES",
  "Unidades y particiones": "Drives and partitions",
  volúmenes: "volumes",
  "Recopilando información de los volúmenes…": "Collecting volume information…",
  "No se detectaron volúmenes montados.": "No mounted volumes detected.",
  "Volumen local": "Local volume",
  "Los datos de almacenamiento se actualizan automáticamente.":
    "Storage data updates automatically.",
  "Sin lectura disponible": "No reading available",
  "SENSORES DEL SISTEMA": "SYSTEM SENSORS",
  "Hardware y sensores": "Hardware and sensors",
  Placa: "Board",
  "Detectando...": "Detecting...",
  "En espera": "Standby",
  Todos: "All",
  Almacenamiento: "Storage",
  "Placa Base": "Motherboard",
  "Procesador:": "Processor:",
  "Memoria del Sistema (RAM)": "System memory (RAM)",
  TEMPERATURAS: "TEMPERATURES",
  UTILIZACIÓN: "UTILIZATION",
  Valor: "Value",
  Detalle: "Details",
  Estado: "Status",
  "Fabricante de Placa": "Board manufacturer",
  "Versión de BIOS": "BIOS version",
  "Fecha:": "Date:",
  Conectado: "Connected",
  "Núcleos físicos": "Physical cores",
  "Hilos lógicos": "Logical threads",
  "Sensor / Métrica": "Sensor / Metric",
  "Actual (Value)": "Current",
  "Mínimo (Min)": "Minimum",
  "Máximo (Max)": "Maximum",
  "FRECUENCIAS Y RELOJES": "FREQUENCIES AND CLOCKS",
  "UTILIZACIÓN & CARGA": "UTILIZATION & LOAD",
  VOLTAJE: "VOLTAGE",
  "Gráficos:": "Graphics:",
  "ENERGÍA & VENTILADORES": "POWER & FANS",
  "MEMORIA FÍSICA": "PHYSICAL MEMORY",
  "Memoria Libre": "Free memory",
  "Ranura / Banco": "Slot / Bank",
  Capacidad: "Capacity",
  Velocidad: "Speed",
  Fabricante: "Manufacturer",
  "Unidades físicas": "Physical drives",
  "Particiones montadas": "Mounted partitions",
  "Espacio Usado": "Used space",
  "Capacidad Total": "Total capacity",
  Disco: "Disk",
};

const french: Record<string, string> = {
  "Diagnóstico local": "Diagnostic local",
  "Datos en este equipo": "Données sur ce PC",
  "Actualización automática": "Actualisation auto",
  "MI EQUIPO": "MON PC",
  "Tu equipo, de un vistazo": "Votre PC en un coup d'œil",
  "Leyendo tu equipo": "Lecture de votre PC",
  "Rendimiento, componentes y estado del sistema.":
    "Performances, composants et santé du système.",
  "Uso no disponible": "Utilisation indisponible",
  "Ver detalles": "Voir les détails",
  "Más allá del resumen": "Au-delà de l'aperçu",
  "EXPLORAR EL EQUIPO": "EXPLORER LE PC",
  "Consulta los sensores disponibles, compara lecturas y sigue sus mínimos y máximos.":
    "Consultez les capteurs disponibles, comparez les lectures et suivez leurs minimums et maximums.",
  "Explorar hardware": "Explorer le matériel",
  "Esperando más lecturas para mostrar la actividad":
    "En attente de plus de lectures pour afficher l'activité",
  "1 lectura": "1 lecture",
  "Revisión de limpieza": "Révision de nettoyage",
  "Consulta las ubicaciones previstas para limpieza. Esta versión no elimina archivos.":
    "Consultez les emplacements prévus pour le nettoyage. Cette version ne supprime pas de fichiers.",
  "Solo previsualización": "Aperçu uniquement",
  "Restablecer mín/máx": "Réinitialiser min/max",
  "Pausar mín/máx": "Mettre en pause min/max",
  "Reanudar mín/máx": "Reprendre min/max",
  "Buscar sensor o componente": "Rechercher un capteur ou un composant",
  "Borrar búsqueda": "Effacer la recherche",
  "Ver sensores de hardware": "Voir les capteurs matériels",
  SISTEMA: "SYSTÈME",
  MANTENIMIENTO: "MAINTENANCE",
  Resumen: "Aperçu",
  Hardware: "Matériel",
  "Salud del sistema": "Santé du système",
  Unidades: "Disques",
  Limpieza: "Nettoyage",
  Actualizaciones: "Mises à jour",
  Ajustes: "Paramètres",
  IDIOMA: "LANGUE",
  "Idioma de la aplicación": "Langue de l'application",
  "Elige el idioma de todos los menús y pantallas.":
    "Choisissez la langue de tous les menus et écrans.",
  Español: "Espagnol",
  "Diagnóstico Local": "Diagnostic local",
  "Protección activa": "Protection active",
  "Mi equipo": "Mon PC",
  "En directo": "En direct",
  "Exportar como TXT": "Exporter en TXT",
  "Exportar como CSV": "Exporter en CSV",
  "Buscar actualizaciones": "Vérifier les mises à jour",
  "Actualizar previsualización": "Actualiser l'aperçu",
  "Actualizar datos": "Actualiser les données",
  Volver: "Retour",
  Avanzar: "Avancer",
  "Mostrar barra lateral": "Afficher la barre latérale",
  "Ocultar barra lateral": "Masquer la barre latérale",
  "Cambiar a modo claro": "Passer au mode clair",
  "Cambiar a modo oscuro": "Passer au mode sombre",
  "Modo claro": "Mode clair",
  "Modo oscuro": "Mode sombre",
  Opciones: "Options",
  PREFERENCIAS: "PRÉFÉRENCES",
  "Personaliza la apariencia y consulta cómo se gestionan tus datos.":
    "Personnalisez l'apparence et consultez la gestion de vos données.",
  APARIENCIA: "APPARENCE",
  "Modo de color": "Mode de couleur",
  "Elige la apariencia de Nexo PC.": "Choisissez l'apparence de Nexo PC.",
  Claro: "Clair",
  Oscuro: "Sombre",
  PRIVACIDAD: "CONFIDENTIALITÉ",
  "Procesamiento local": "Traitement local",
  "Los datos del sistema se recopilan y muestran en este equipo.":
    "Les données du système sont collectées et affichées sur ce PC.",
  "Solo en este equipo": "Uniquement sur ce PC",
  APLICACIÓN: "APPLICATION",
  "Diagnóstico y mantenimiento local": "Diagnostic et maintenance locale",
  "La versión instalada se gestiona desde Actualizaciones.":
    "La version installée est gérée depuis les Mises à jour.",
  "Barras de porcentaje": "Barres de pourcentage",
  "Mostrar barras de color con los porcentajes de uso en las métricas.":
    "Afficher des barres de couleur avec les pourcentages d'utilisation dans les métriques.",
  Activadas: "Activé",
  Desactivadas: "Désactivé",
  ACTUALIZACIONES: "MISES À JOUR",
  "Actualizaciones de Nexo PC": "Mises à jour de Nexo PC",
  "Busca aquí una versión nueva de Nexo PC.":
    "Recherchez ici une nouvelle version de Nexo PC.",
  "Cargando datos…": "Chargement des données…",
  "Hay una actualización disponible.": "Une mise à jour est disponible.",
  "La actualización se está instalando y la aplicación se reiniciará.":
    "La mise à jour s'installe et l'application va redémarrer.",
  "Descargando actualización…": "Téléchargement de la mise à jour…",
  "Descargando…": "Téléchargement…",
  "No se encontraron actualizaciones disponibles.":
    "Aucune mise à jour disponible.",
  "Hay una nueva versión de Nexo PC":
    "Une nouvelle version de Nexo PC est disponible",
  "Nueva versión disponible": "Nouvelle version disponible",
  "Nueva versión:": "Nouvelle version :",
  "Descargar y actualizar": "Télécharger et mettre à jour",
  Descargar: "Télécharger",
  "Reiniciar e instalar": "Redémarrer et installer",
  "Buscando…": "Vérification…",
  "Buscar otra vez": "Vérifier à nouveau",
};

const german: Record<string, string> = {
  "Diagnóstico local": "Lokale Diagnose",
  "Datos en este equipo": "Daten auf diesem PC",
  "Actualización automática": "Auto-Aktualisierung",
  "MI EQUIPO": "MEIN PC",
  "Tu equipo, de un vistazo": "Ihr PC auf einen Blick",
  "Leyendo tu equipo": "PC wird gelesen",
  "Rendimiento, componentes y estado del sistema.":
    "Leistung, Komponenten und Systemstatus.",
  "Uso no disponible": "Nutzung nicht verfügbar",
  "Ver detalles": "Details anzeigen",
  "Más allá del resumen": "Über die Übersicht hinaus",
  "EXPLORAR EL EQUIPO": "PC ERKUNDEN",
  "Consulta los sensores disponibles, compara lecturas y sigue sus mínimos y máximos.":
    "Erkunden Sie verfügbare Sensoren, vergleichen Sie Messwerte und verfolgen Sie deren Min/Max.",
  "Explorar hardware": "Hardware erkunden",
  "Esperando más lecturas para mostrar la actividad":
    "Warten auf weitere Messwerte zur Anzeige der Aktivität",
  "1 lectura": "1 Messwert",
  "Revisión de limpieza": "Bereinigungsüberprüfung",
  "Consulta las ubicaciones previstas para limpieza. Esta versión no elimina archivos.":
    "Überprüfen Sie geplante Bereinigungsorte. Diese Version löscht keine Dateien.",
  "Solo previsualización": "Nur Vorschau",
  "Restablecer mín/máx": "Min/Max zurücksetzen",
  "Pausar mín/máx": "Min/Max pausieren",
  "Reanudar mín/máx": "Min/Max fortsetzen",
  "Buscar sensor o componente": "Sensor oder Komponente suchen",
  "Borrar búsqueda": "Suche löschen",
  "Ver sensores de hardware": "Hardware-Sensoren anzeigen",
  SISTEMA: "SYSTEM",
  MANTENIMIENTO: "WARTUNG",
  Resumen: "Übersicht",
  Hardware: "Hardware",
  "Salud del sistema": "Systemstatus",
  Unidades: "Laufwerke",
  Limpieza: "Bereinigung",
  Actualizaciones: "Updates",
  Ajustes: "Einstellungen",
  IDIOMA: "SPRACHE",
  "Idioma de la aplicación": "App-Sprache",
  "Elige el idioma de todos los menús y pantallas.":
    "Wählen Sie die Sprache für alle Menüs und Bildschirme.",
  Español: "Spanisch",
  "Diagnóstico Local": "Lokale Diagnose",
  "Protección activa": "Schutz aktiv",
  "Mi equipo": "Mein PC",
  "En directo": "Live",
  "Exportar como TXT": "Als TXT exportieren",
  "Exportar como CSV": "Als CSV exportieren",
  "Buscar actualizaciones": "Nach Updates suchen",
  "Actualizar previsualización": "Vorschau aktualisieren",
  "Actualizar datos": "Daten aktualisieren",
  Volver: "Zurück",
  Avanzar: "Vorwärts",
  "Mostrar barra lateral": "Seitenleiste anzeigen",
  "Ocultar barra lateral": "Seitenleiste ausblenden",
  "Cambiar a modo claro": "In den hellen Modus wechseln",
  "Cambiar a modo oscuro": "In den dunklen Modus wechseln",
  "Modo claro": "Heller Modus",
  "Modo oscuro": "Dunkler Modus",
  Opciones: "Optionen",
  PREFERENCIAS: "EINSTELLUNGEN",
  "Personaliza la apariencia y consulta cómo se gestionan tus datos.":
    "Passen Sie das Erscheinungsbild an und prüfen Sie die Datenverwaltung.",
  APARIENCIA: "ERSCHEINUNGSBILD",
  "Modo de color": "Farbmodus",
  "Elige la apariencia de Nexo PC.":
    "Wählen Sie das Erscheinungsbild von Nexo PC.",
  Claro: "Hell",
  Oscuro: "Dunkel",
  PRIVACIDAD: "DATENSCHUTZ",
  "Procesamiento local": "Lokale Verarbeitung",
  "Los datos del sistema se recopilan y muestran en este equipo.":
    "Systemdaten werden lokal auf diesem PC verarbeitet.",
  "Solo en este equipo": "Nur auf diesem PC",
  APLICACIÓN: "ANWENDUNG",
  "Diagnóstico y mantenimiento local": "Lokale Diagnose und Wartung",
  "La versión instalada se gestiona desde Actualizaciones.":
    "Die installierte Version wird unter Updates verwaltet.",
  "Barras de porcentaje": "Prozentbalken",
  "Mostrar barras de color con los porcentajes de uso en las métricas.":
    "Zeigen Sie farbige Balken mit Nutzungsprozentsätzen in den Metriken an.",
  Activadas: "Aktiviert",
  Desactivadas: "Deaktiviert",
  ACTUALIZACIONES: "UPDATES",
  "Actualizaciones de Nexo PC": "Nexo PC Updates",
  "Busca aquí una versión nueva de Nexo PC.":
    "Suchen Sie hier nach einer neuen Version von Nexo PC.",
  "Cargando datos…": "Daten werden geladen…",
  "Hay una actualización disponible.": "Ein Update ist verfügbar.",
  "La actualización se está instalando y la aplicación se reiniciará.":
    "Das Update wird installiert und die App wird neu gestartet.",
  "Descargando actualización…": "Update wird heruntergeladen…",
  "Descargando…": "Herunterladen…",
  "No se encontraron actualizaciones disponibles.":
    "Es wurden keine Updates gefunden.",
  "Hay una nueva versión de Nexo PC":
    "Eine neue Version von Nexo PC ist verfügbar",
  "Nueva versión disponible": "Neue Version verfügbar",
  "Nueva versión:": "Neue Version:",
  "Descargar y actualizar": "Herunterladen und aktualisieren",
  Descargar: "Herunterladen",
  "Reiniciar e instalar": "Neu starten und installieren",
  "Buscando…": "Überprüfen…",
  "Buscar otra vez": "Erneut suchen",
};

const portuguese: Record<string, string> = {
  "Diagnóstico local": "Diagnóstico local",
  "Datos en este equipo": "Dados neste PC",
  "Actualización automática": "Atualização automática",
  "MI EQUIPO": "MEU PC",
  "Tu equipo, de un vistazo": "O seu PC de relance",
  "Leyendo tu equipo": "A ler o seu PC",
  "Rendimiento, componentes y estado del sistema.":
    "Desempenho, componentes e saúde do sistema.",
  "Uso no disponible": "Utilização indisponível",
  "Ver detalles": "Ver detalhes",
  "Más allá del resumen": "Para além do resumo",
  "EXPLORAR EL EQUIPO": "EXPLORAR O PC",
  "Consulta los sensores disponibles, compara lecturas y sigue sus mínimos y máximos.":
    "Explore os sensores disponíveis, compare as leituras e acompanhe os seus mínimos e máximos.",
  "Explorar hardware": "Explorar hardware",
  "Esperando más lecturas para mostrar la actividad":
    "A aguardar mais leituras para mostrar a atividade",
  "1 lectura": "1 leitura",
  "Revisión de limpieza": "Revisão de limpeza",
  "Consulta las ubicaciones previstas para limpieza. Esta versión no elimina archivos.":
    "Reveja os locais planeados para limpeza. Esta versão não elimina ficheiros.",
  "Solo previsualización": "Apenas pré-visualização",
  "Restablecer mín/máx": "Repor mín/máx",
  "Pausar mín/máx": "Pausar mín/máx",
  "Reanudar mín/máx": "Retomar mín/máx",
  "Buscar sensor o componente": "Procurar sensor ou componente",
  "Borrar búsqueda": "Limpar pesquisa",
  "Ver sensores de hardware": "Ver sensores de hardware",
  SISTEMA: "SISTEMA",
  MANTENIMIENTO: "MANUTENÇÃO",
  Resumen: "Resumo",
  Hardware: "Hardware",
  "Salud del sistema": "Saúde do sistema",
  Unidades: "Unidades",
  Limpieza: "Limpeza",
  Actualizaciones: "Atualizações",
  Ajustes: "Definições",
  IDIOMA: "IDIOMA",
  "Idioma de la aplicación": "Idioma da aplicação",
  "Elige el idioma de todos los menús y pantallas.":
    "Escolha o idioma de todos os menus e ecrãs.",
  Español: "Espanhol",
  "Diagnóstico Local": "Diagnóstico local",
  "Protección activa": "Proteção ativa",
  "Mi equipo": "Meu PC",
  "En directo": "Em direto",
  "Exportar como TXT": "Exportar como TXT",
  "Exportar como CSV": "Exportar como CSV",
  "Buscar actualizaciones": "Procurar atualizações",
  "Actualizar previsualización": "Atualizar pré-visualização",
  "Actualizar datos": "Atualizar dados",
  Volver: "Voltar",
  Avanzar: "Avançar",
  "Mostrar barra lateral": "Mostrar barra lateral",
  "Ocultar barra lateral": "Ocultar barra lateral",
  "Cambiar a modo claro": "Mudar para modo claro",
  "Cambiar a modo oscuro": "Mudar para modo escuro",
  "Modo claro": "Modo claro",
  "Modo oscuro": "Modo escuro",
  Opciones: "Opções",
  PREFERENCIAS: "PREFERÊNCIAS",
  "Personaliza la apariencia y consulta cómo se gestionan tus datos.":
    "Personalize a aparência e veja como os seus dados são geridos.",
  APARIENCIA: "APARÊNCIA",
  "Modo de color": "Modo de cor",
  "Elige la apariencia de Nexo PC.": "Escolha a aparência do Nexo PC.",
  Claro: "Claro",
  Oscuro: "Escuro",
  PRIVACIDAD: "PRIVACIDADE",
  "Procesamiento local": "Processamento local",
  "Los datos del sistema se recopilan y muestran en este equipo.":
    "Os dados do sistema são recolhidos e apresentados neste PC.",
  "Solo en este equipo": "Apenas neste PC",
  APLICACIÓN: "APLICAÇÃO",
  "Diagnóstico y mantenimiento local": "Diagnóstico e manutenção local",
  "La versión instalada se gestiona desde Actualizaciones.":
    "A versão instalada é gerida em Atualizações.",
  "Barras de porcentaje": "Barras de percentagem",
  "Mostrar barras de color con los porcentajes de uso en las métricas.":
    "Mostrar barras coloridas com percentagens de utilização nas métricas.",
  Activadas: "Ativadas",
  Desactivadas: "Desativadas",
  ACTUALIZACIONES: "ATUALIZAÇÕES",
  "Actualizaciones de Nexo PC": "Atualizações do Nexo PC",
  "Busca aquí una versión nueva de Nexo PC.":
    "Procure aqui por uma nova versão do Nexo PC.",
  "Cargando datos…": "A carregar dados…",
  "Hay una actualización disponible.": "Existe uma atualização disponível.",
  "La actualización se está instalando y la aplicación se reiniciará.":
    "A atualização está a ser instalada e a aplicação será reiniciada.",
  "Descargando actualización…": "A transferir atualização…",
  "Descargando…": "A transferir…",
  "No se encontraron actualizaciones disponibles.":
    "Não foram encontradas atualizações.",
  "Hay una nueva versión de Nexo PC":
    "Uma nova versão do Nexo PC está disponível",
  "Nueva versión disponible": "Nova versão disponível",
  "Nueva versión:": "Nova versão:",
  "Descargar y actualizar": "Transferir e atualizar",
  Descargar: "Transferir",
  "Reiniciar e instalar": "Reiniciar e instalar",
  "Buscando…": "A procurar…",
  "Buscar otra vez": "Procurar novamente",
};

const italian: Record<string, string> = {
  "Diagnóstico local": "Diagnostica locale",
  "Datos en este equipo": "Dati su questo PC",
  "Actualización automática": "Aggiornamento automatico",
  "MI EQUIPO": "IL MIO PC",
  "Tu equipo, de un vistazo": "Il tuo PC in sintesi",
  "Leyendo tu equipo": "Lettura del PC in corso",
  "Rendimiento, componentes y estado del sistema.":
    "Prestazioni, componenti e stato del sistema.",
  "Uso no disponible": "Utilizzo non disponibile",
  "Ver detalles": "Vedi dettagli",
  "Más allá del resumen": "Oltre il riepilogo",
  "EXPLORAR EL EQUIPO": "ESPLORA IL PC",
  "Consulta los sensores disponibles, compara lecturas y sigue sus mínimos y máximos.":
    "Esplora i sensori disponibili, confronta le letture e segui i loro minimi e massimi.",
  "Explorar hardware": "Esplora hardware",
  "Esperando más lecturas para mostrar la actividad":
    "In attesa di ulteriori letture per mostrare l'attività",
  "1 lectura": "1 lettura",
  "Revisión de limpieza": "Revisione pulizia",
  "Consulta las ubicaciones previstas para limpieza. Esta versión no elimina archivos.":
    "Controlla le posizioni previste per la pulizia. Questa versione non elimina i file.",
  "Solo previsualización": "Solo anteprima",
  "Restablecer mín/máx": "Ripristina min/max",
  "Pausar mín/máx": "Pausa min/max",
  "Reanudar mín/máx": "Riprendi min/max",
  "Buscar sensor o componente": "Cerca sensore o componente",
  "Borrar búsqueda": "Cancella ricerca",
  "Ver sensores de hardware": "Visualizza sensori hardware",
  SISTEMA: "SISTEMA",
  MANTENIMIENTO: "MANUTENZIONE",
  Resumen: "Panoramica",
  Hardware: "Hardware",
  "Salud del sistema": "Stato del sistema",
  Unidades: "Unità",
  Limpieza: "Pulizia",
  Actualizaciones: "Aggiornamenti",
  Ajustes: "Impostazioni",
  IDIOMA: "LINGUA",
  "Idioma de la aplicación": "Lingua dell'applicazione",
  "Elige el idioma de todos los menús y pantallas.":
    "Scegli la lingua di tutti i menu e delle schermate.",
  Español: "Spagnolo",
  "Diagnóstico Local": "Diagnostica locale",
  "Protección activa": "Protezione attiva",
  "Mi equipo": "Il mio PC",
  "En directo": "In diretta",
  "Exportar como TXT": "Esporta come TXT",
  "Exportar como CSV": "Esporta come CSV",
  "Buscar actualizaciones": "Controlla aggiornamenti",
  "Actualizar previsualización": "Aggiorna anteprima",
  "Actualizar datos": "Aggiorna dati",
  Volver: "Indietro",
  Avanzar: "Avanti",
  "Mostrar barra lateral": "Mostra barra laterale",
  "Ocultar barra lateral": "Nascondi barra laterale",
  "Cambiar a modo claro": "Passa alla modalità chiara",
  "Cambiar a modo oscuro": "Passa alla modalità scura",
  "Modo claro": "Modalità chiara",
  "Modo oscuro": "Modalità scura",
  Opciones: "Opzioni",
  PREFERENCIAS: "PREFERENZE",
  "Personaliza la apariencia y consulta cómo se gestionan tus datos.":
    "Personalizza l'aspetto e scopri come vengono gestiti i tuoi dati.",
  APARIENCIA: "ASPETTO",
  "Modo de color": "Modalità colore",
  "Elige la apariencia de Nexo PC.": "Scegli l'aspetto di Nexo PC.",
  Claro: "Chiaro",
  Oscuro: "Scuro",
  PRIVACIDAD: "PRIVACY",
  "Procesamiento local": "Elaborazione locale",
  "Los datos del sistema se recopilan y muestran en este equipo.":
    "I dati del sistema vengono raccolti e mostrati su questo PC.",
  "Solo en este equipo": "Solo su questo PC",
  APLICACIÓN: "APPLICAZIONE",
  "Diagnóstico y mantenimiento local": "Diagnostica e manutenzione locale",
  "La versión instalada se gestiona desde Actualizaciones.":
    "La versione installata viene gestita da Aggiornamenti.",
  "Barras de porcentaje": "Barre di percentuale",
  "Mostrar barras de color con los porcentajes de uso en las métricas.":
    "Mostra barre colorate con percentuali di utilizzo nelle metriche.",
  Activadas: "Attivate",
  Desactivadas: "Disattivate",
  ACTUALIZACIONES: "AGGIORNAMENTI",
  "Actualizaciones de Nexo PC": "Aggiornamenti di Nexo PC",
  "Busca aquí una versión nueva de Nexo PC.":
    "Cerca qui una nuova versione di Nexo PC.",
  "Cargando datos…": "Caricamento dati in corso…",
  "Hay una actualización disponible.": "È disponibile un aggiornamento.",
  "La actualización se está instalando y la aplicación se reiniciará.":
    "L'aggiornamento è in fase di installazione e l'app si riavvierà.",
  "Descargando actualización…": "Download dell'aggiornamento…",
  "Descargando…": "Download in corso…",
  "No se encontraron actualizaciones disponibles.":
    "Nessun aggiornamento trovato.",
  "Hay una nueva versión de Nexo PC":
    "È disponibile una nuova versione di Nexo PC",
  "Nueva versión disponible": "Nuova versione disponibile",
  "Nueva versión:": "Nuova versione:",
  "Descargar y actualizar": "Scarica e aggiorna",
  Descargar: "Scarica",
  "Reiniciar e instalar": "Riavvia e installa",
  "Buscando…": "Controllo…",
  "Buscar otra vez": "Cerca ancora",
};

const japanese: Record<string, string> = {
  "Diagnóstico local": "ローカル診断",
  "Datos en este equipo": "このPC上のデータ",
  "Actualización automática": "自動更新",
  "MI EQUIPO": "マイPC",
  "Tu equipo, de un vistazo": "PCの概要",
  "Leyendo tu equipo": "PCを読み込んでいます",
  "Rendimiento, componentes y estado del sistema.":
    "パフォーマンス、コンポーネント、システムの状態。",
  "Uso no disponible": "使用状況は利用できません",
  "Ver detalles": "詳細を表示",
  "Más allá del resumen": "概要を超えて",
  "EXPLORAR EL EQUIPO": "PCを探索",
  "Consulta los sensores disponibles, compara lecturas y sigue sus mínimos y máximos.":
    "利用可能なセンサーを探索し、測定値を比較し、最小値と最大値を追跡します。",
  "Explorar hardware": "ハードウェアを探索",
  "Esperando más lecturas para mostrar la actividad":
    "アクティビティを表示するためにさらに測定値を待っています",
  "1 lectura": "1回の測定",
  "Revisión de limpieza": "クリーンアップの確認",
  "Consulta las ubicaciones previstas para limpieza. Esta versión no elimina archivos.":
    "クリーンアップ予定の場所を確認します。このバージョンではファイルは削除されません。",
  "Solo previsualización": "プレビューのみ",
  "Restablecer mín/máx": "最小/最大をリセット",
  "Pausar mín/máx": "最小/最大を一時停止",
  "Reanudar mín/máx": "最小/最大を再開",
  "Buscar sensor o componente": "センサーまたはコンポーネントを検索",
  "Borrar búsqueda": "検索をクリア",
  "Ver sensores de hardware": "ハードウェアセンサーを表示",
  SISTEMA: "システム",
  MANTENIMIENTO: "メンテナンス",
  Resumen: "概要",
  Hardware: "ハードウェア",
  "Salud del sistema": "システム状態",
  Unidades: "ドライブ",
  Limpieza: "クリーンアップ",
  Actualizaciones: "アップデート",
  Ajustes: "設定",
  IDIOMA: "言語",
  "Idioma de la aplicación": "アプリの言語",
  "Elige el idioma de todos los menús y pantallas.":
    "すべてのメニューと画面の言語を選択します。",
  Español: "スペイン語",
  "Diagnóstico Local": "ローカル診断",
  "Protección activa": "保護は有効です",
  "Mi equipo": "マイPC",
  "En directo": "ライブ",
  "Exportar como TXT": "TXTとしてエクスポート",
  "Exportar como CSV": "CSVとしてエクスポート",
  "Buscar actualizaciones": "更新を確認する",
  "Actualizar previsualización": "プレビューを更新",
  "Actualizar datos": "データを更新",
  Volver: "戻る",
  Avanzar: "進む",
  "Mostrar barra lateral": "サイドバーを表示",
  "Ocultar barra lateral": "サイドバーを非表示",
  "Cambiar a modo claro": "ライトモードに切り替え",
  "Cambiar a modo oscuro": "ダークモードに切り替え",
  "Modo claro": "ライトモード",
  "Modo oscuro": "ダークモード",
  Opciones: "オプション",
  PREFERENCIAS: "設定",
  "Personaliza la apariencia y consulta cómo se gestionan tus datos.":
    "外観をカスタマイズし、データの管理方法を確認します。",
  APARIENCIA: "外観",
  "Modo de color": "カラーモード",
  "Elige la apariencia de Nexo PC.": "Nexo PCの外観を選択します。",
  Claro: "ライト",
  Oscuro: "ダーク",
  PRIVACIDAD: "プライバシー",
  "Procesamiento local": "ローカル処理",
  "Los datos del sistema se recopilan y muestran en este equipo.":
    "システムデータはこのPC上で収集および表示されます。",
  "Solo en este equipo": "このPCのみ",
  APLICACIÓN: "アプリ",
  "Diagnóstico y mantenimiento local": "ローカルの診断とメンテナンス",
  "La versión instalada se gestiona desde Actualizaciones.":
    "インストールされているバージョンはアップデートから管理されます。",
  "Barras de porcentaje": "パーセンテージバー",
  "Mostrar barras de color con los porcentajes de uso en las métricas.":
    "メトリクスに使用率のパーセンテージを示すカラーバーを表示します。",
  Activadas: "オン",
  Desactivadas: "オフ",
  ACTUALIZACIONES: "アップデート",
  "Actualizaciones de Nexo PC": "Nexo PC のアップデート",
  "Busca aquí una versión nueva de Nexo PC.":
    "ここで Nexo PC の新しいバージョンを確認してください。",
  "Cargando datos…": "データを読み込んでいます…",
  "Hay una actualización disponible.": "アップデートが利用可能です。",
  "La actualización se está instalando y la aplicación se reiniciará.":
    "アップデートをインストール中です。アプリが再起動します。",
  "Descargando actualización…": "アップデートをダウンロード中…",
  "Descargando…": "ダウンロード中…",
  "No se encontraron actualizaciones disponibles.":
    "利用可能なアップデートは見つかりませんでした。",
  "Hay una nueva versión de Nexo PC": "Nexo PCの新しいバージョンが利用可能です",
  "Nueva versión disponible": "新しいバージョンが利用可能",
  "Nueva versión:": "新しいバージョン：",
  "Descargar y actualizar": "ダウンロードして更新",
  Descargar: "ダウンロード",
  "Reiniciar e instalar": "再起動してインストール",
  "Buscando…": "確認中…",
  "Buscar otra vez": "もう一度確認",
};

const translations: Record<Exclude<Language, "es">, Record<string, string>> = {
  en: english,
  fr: french,
  de: german,
  pt: portuguese,
  it: italian,
  ja: japanese,
};

const attributeNames = [
  "title",
  "aria-label",
  "aria-description",
  "aria-valuetext",
  "placeholder",
  "alt",
] as const;

type TranslationRecord = { source: string; applied: string };

export function translateText(text: string, language: Language): string {
  if (language === "es") return text;

  const leading = text.match(/^\s*/)?.[0] ?? "";
  const trailing = text.match(/\s*$/)?.[0] ?? "";
  const value = text.trim();

  const langDict = translations[language];
  let translated = langDict ? langDict[value] : undefined;

  // Fallback de seguridad al inglés si falta alguna clave
  if (!translated && language !== "en") {
    translated = english[value];
  }

  if (!translated) {
    const patterns: Array<[RegExp, (match: RegExpMatchArray) => string]> = [
      [/^Última lectura · (.+)$/, (m) => `Last reading · ${m[1]}`],
      [/^Últimas (\d+) lecturas$/, (m) => `Last ${m[1]} readings`],
      [
        /^de (.+) GB · (\d+)% en uso$/,
        (m) => `of ${m[1]} GB · ${m[2]}% in use`,
      ],
      [/^(.+) · (.+) GB disponibles$/, (m) => `${m[1]} · ${m[2]} GB available`],
      [/^Actualizado a las (.+)$/, (m) => `Updated at ${m[1]}`],
      [/^Última lectura: (.+)$/, (m) => `Last reading: ${m[1]}`],
      [/^Temperatura actual: (.+)$/, (m) => `Current temperature: ${m[1]}`],
      [/^(\d+) GB disponibles$/, (m) => `${m[1]} GB available`],
      [/^(\d+) GB usados de (\d+) GB$/, (m) => `${m[1]} GB used of ${m[2]} GB`],
    ];
    for (const [pattern, makeTranslation] of patterns) {
      const match = value.match(pattern);
      if (match) {
        translated = makeTranslation(match);
        break;
      }
    }
  }

  return translated ? `${leading}${translated}${trailing}` : text;
}

export function translateDom(root: HTMLElement, language: Language) {
  const textRecords = translateDomTextRecords;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let current = walker.nextNode();

  while (current) {
    const textNode = current as Text;
    const record = textRecords.get(textNode);
    const source =
      record && textNode.data === record.applied
        ? record.source
        : textNode.data;
    const applied = translateText(source, language);
    textRecords.set(textNode, { source, applied });
    if (textNode.data !== applied) textNode.data = applied;
    current = walker.nextNode();
  }

  root.querySelectorAll("*").forEach((element) => {
    const elementRecords =
      translateDomAttributeRecords.get(element) ??
      new Map<string, TranslationRecord>();
    for (const attribute of attributeNames) {
      const currentValue = element.getAttribute(attribute);
      if (currentValue === null) continue;
      const record = elementRecords.get(attribute);
      const source =
        record && currentValue === record.applied
          ? record.source
          : currentValue;
      const applied = translateText(source, language);
      elementRecords.set(attribute, { source, applied });
      if (currentValue !== applied) element.setAttribute(attribute, applied);
    }
    translateDomAttributeRecords.set(element, elementRecords);
  });
}

const translateDomTextRecords = new WeakMap<Text, TranslationRecord>();
const translateDomAttributeRecords = new WeakMap<
  Element,
  Map<string, TranslationRecord>
>();
