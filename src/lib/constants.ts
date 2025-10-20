
import { BarChart2, BrainCircuit, Home, Map, MessageSquare, Sprout, User, Users, MessageCircle } from "lucide-react";

export const NAV_LINKS = [
  { href: "/dashboard", label: "Tableau de bord", icon: Home },
  { href: "/map", label: "Carte Interactive", icon: Map },
  { href: "/search", label: "Recherche IA", icon: BrainCircuit },
  { href: "/insights", label: "Aperçus IA", icon: BarChart2 },
  { href: "/crops", label: "Base de Données", icon: Sprout },
  { href: "/feed", label: "Fil Communautaire", icon: MessageSquare },
  { href: "/forum", label: "Forum", icon: Users },
  { href: "/chat", label: "Messagerie", icon: MessageCircle },
];

export const USER_NAV_LINKS = [
  { href: "/profile", label: "Profil", icon: User },
  { href: "/settings", label: "Paramètres", icon: null },
];

export const CROP_DATA = [
  {
    slug: "millet",
    name: "Mil",
    description: "Une céréale très résiliente et nutritive, bien adaptée aux régions arides et semi-arides du Sénégal. C'est un aliment de base et vital pour la sécurité alimentaire.",
    bestPractices: "Planter au début de la saison des pluies. Nécessite un sol bien drainé. L'association avec des légumineuses comme le niébé peut améliorer la fertilité du sol.",
    productionConditions: "Tolérant à la sécheresse. Prospère dans les sols sableux. La plage de température optimale est de 26-30°C.",
    image: {
      src: "/images/millet.jpg",
      aiHint: "millet field"
    }
  },
  {
    slug: "sorghum",
    name: "Sorgho",
    description: "Une autre céréale clé au Sénégal, appréciée pour sa tolérance à la sécheresse et à la chaleur. Il est utilisé pour l'alimentation, le fourrage et les boissons traditionnelles.",
    bestPractices: "Utiliser des semences certifiées pour de meilleurs rendements. Pratiquer la rotation des cultures pour gérer les ravageurs et les maladies. Un désherbage opportun est crucial.",
    productionConditions: "Préfère les sols argilo-limoneux mais s'adapte à de nombreux types. Nécessite moins d'eau que le maïs. Le plein soleil est nécessaire.",
    image: {
      src: "/images/sorghum.jpg",
      aiHint: "sorghum crop"
    }
  },
  {
    slug: "groundnut",
    name: "Arachide",
    description: "Une culture de rente majeure pour le Sénégal, importante pour l'économie locale et pour l'exportation. C'est une légumineuse fixatrice d'azote, qui améliore la santé du sol.",
    bestPractices: "Assurer une bonne préparation du sol. Appliquer des engrais phosphatés. Récolter à la bonne maturité pour éviter la contamination par l'aflatoxine.",
    productionConditions: "Nécessite un sol sableux ou sablo-limoneux pour une pénétration facile des gynophores. A besoin de précipitations modérées, en particulier pendant la floraison et la formation des gousses.",
    image: {
      src: "/images/peanuts.jpg",
      aiHint: "groundnut plant"
    }
  },
  {
    slug: "cowpea",
    name: "Niébé",
    description: "Une légumineuse polyvalente et nutritive, souvent appelée 'la viande du pauvre'. Elle est consommée sous forme de grain sec, de gousses vertes et de feuilles, et fixe l'azote dans le sol.",
    bestPractices: "Peut être cultivé en culture pure ou en association avec des céréales comme le mil et le sorgho. Protéger contre les insectes nuisibles, en particulier pendant la floraison.",
    productionConditions: "Très tolérant à la sécheresse et adapté aux sols sableux. Prospère par temps chaud.",
    image: {
      src: "/images/cowpea.png",
      aiHint: "cowpea field"
    }
  },
  {
    slug: "maize",
    name: "Maïs",
    description: "Gagne en importance au Sénégal, en particulier dans les régions plus humides du sud. Il est utilisé pour la consommation humaine et comme aliment pour animaux.",
    bestPractices: "Nécessite plus d'eau et de nutriments que le mil ou le sorgho. Planter en lignes pour une gestion plus facile. Les variétés hybrides peuvent augmenter considérablement le rendement.",
    productionConditions: "Préfère les sols limoneux fertiles et bien drainés. Sensible à la sécheresse, en particulier pendant les stades de la panicule et de la soie.",
    image: {
      src: "/images/maize.jpg",
      aiHint: "maize plantation"
    }
  },
  {
    slug: "cassava",
    name: "Manioc",
    description: "Une culture à racine riche en amidon qui est une source majeure de glucides. Elle est connue pour sa capacité à pousser dans des sols pauvres et sa tolérance à la sécheresse.",
    bestPractices: "Propagé à partir de boutures de tige. Le contrôle des mauvaises herbes est essentiel dans les premiers mois. Peut être récolté de 8 à 24 mois après la plantation.",
    productionConditions: "S'adapte à une large gamme de types de sols mais ne tolère pas l'engorgement. Prospère dans les climats tropicaux.",
    image: {
      src: "/images/manioc.jpg",
      aiHint: "cassava roots"
    }
  },
];

export const SENEGAL_REGIONS = [
  "Dakar",
  "Diourbel",
  "Fatick",
  "Kaffrine",
  "Kaolack",
  "Kédougou",
  "Kolda",
  "Louga",
  "Matam",
  "Saint-Louis",
  "Sédhiou",
  "Tambacounda",
  "Thiès",
  "Ziguinchor",
];

export const SOIL_TYPES = ["Tout type de sol", "Sableux", "Argileux", "Limoneux", "Sablo-limoneux", "Argilo-limoneux"];
