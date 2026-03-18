import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      "app.name": "MoneyQuest",
      "nav.home": "Home",
      "nav.transactions": "Activity",
      "nav.goals": "Goals",
      "nav.insights": "Insights",
      "nav.profile": "Profile",
      "home.balance": "Total Balance",
      "home.income": "Income",
      "home.expenses": "Expenses",
      "home.savings": "Savings",
      "home.daily_challenge": "Daily Challenge",
      "home.complete": "Complete",
      "home.completed": "Completed!",
      "home.recent_activity": "Recent Activity",
      "home.insights": "Smart Insights",
      "transactions.title": "Transactions",
      "transactions.add": "Add Transaction",
      "transactions.search": "Search transactions...",
      "goals.title": "Savings Goals",
      "goals.add": "New Goal",
      "goals.contribute": "Add Money",
      "insights.title": "Insights & Analytics",
      "profile.title": "Player Profile",
      "profile.level": "Level",
      "profile.xp": "XP",
      "profile.streak": "Day Streak",
      "profile.settings": "Settings",
      "profile.language": "Language",
      "profile.currency": "Currency",
      "profile.theme": "Theme",
      "profile.signout": "Sign Out",
      "common.save": "Save",
      "common.cancel": "Cancel",
      "common.loading": "Loading...",
      "common.error": "An error occurred",
    }
  },
  es: {
    translation: {
      "app.name": "MoneyQuest",
      "nav.home": "Inicio",
      "nav.transactions": "Actividad",
      "nav.goals": "Metas",
      "nav.insights": "Estadísticas",
      "nav.profile": "Perfil",
      "home.balance": "Balance Total",
      "home.income": "Ingresos",
      "home.expenses": "Gastos",
      "home.savings": "Ahorros",
      "home.daily_challenge": "Reto Diario",
      "home.complete": "Completar",
      "home.completed": "¡Completado!",
      "home.recent_activity": "Actividad Reciente",
      "home.insights": "Consejos Inteligentes",
      "transactions.title": "Transacciones",
      "transactions.add": "Nueva Transacción",
      "transactions.search": "Buscar...",
      "goals.title": "Metas de Ahorro",
      "goals.add": "Nueva Meta",
      "goals.contribute": "Añadir Dinero",
      "insights.title": "Análisis",
      "profile.title": "Perfil",
      "profile.level": "Nivel",
      "profile.xp": "XP",
      "profile.streak": "Días Seguidos",
      "profile.settings": "Ajustes",
      "profile.language": "Idioma",
      "profile.currency": "Moneda",
      "profile.theme": "Tema",
      "profile.signout": "Cerrar Sesión",
      "common.save": "Guardar",
      "common.cancel": "Cancelar",
      "common.loading": "Cargando...",
      "common.error": "Ha ocurrido un error",
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem("mq_lang") || "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
