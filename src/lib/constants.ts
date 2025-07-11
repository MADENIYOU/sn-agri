import { BarChart2, BrainCircuit, Home, Map, MessageSquare, Sprout, User, Users, MessageCircle } from "lucide-react";

export const NAV_LINKS = [
  { href: "/dashboard", label: "Tableau de bord", icon: Home },
  { href: "/map", label: "Carte Interactive", icon: Map },
  { href: "/search", label: "Recherche IA", icon: BrainCircuit },
  { href: "/insights", label: "Aperçus IA", icon: BarChart2 },
  { href: "/crops", label: "Base de Données", icon: Sprout },
  { href: "/feed", label: "Fil Communautaire", icon: MessageSquare },
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

export const FEED_POSTS = [
  {
    id: 1,
    author: {
      name: "Moussa Faye",
      avatar: "/avatars/01.png",
      role: "Agriculteur"
    },
    timestamp: "il y a 2 heures",
    content: "Je viens de finir de planter le nouveau lot d'arachides pour la saison. L'humidité du sol est parfaite après la pluie de la semaine dernière. En espérant une excellente récolte cette année ! #AgricultureSénégal #Arachide",
    image: {
      src: "https://placehold.co/600x400.png",
      aiHint: "farmer planting"
    },
    likes: 15,
    comments: 3,
  },
  {
    id: 2,
    author: {
      name: "Awa Diallo",
      avatar: "/avatars/02.png",
      role: "Agronome"
    },
    timestamp: "il y a 1 jour",
    content: "Rappel aux collègues agriculteurs de la région de Kaolack : surveillez les premiers signes du mineur de l'épi de mil. La détection précoce et la lutte intégrée sont essentielles pour protéger votre rendement. Je suis disponible pour des consultations.",
    image: null,
    likes: 22,
    comments: 8,
  },
  {
    id: 3,
    author: {
      name: "Bio-Agri SARL",
      avatar: "/avatars/03.png",
      role: "Acheteur"
    },
    timestamp: "il y a 3 jours",
    content: "Nous cherchons à nous approvisionner en 5 tonnes de niébé biologique certifié. Veuillez nous contacter avec vos offres et détails de certification. Prix compétitifs offerts !",
    image: null,
    likes: 8,
    comments: 1,
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

export const SOIL_TYPES = ["Sableux", "Argileux", "Limoneux", "Sablo-limoneux", "Argilo-limoneux"];

export const CHAT_USERS = [
    { id: "1", name: "Moussa Faye", avatar: "/avatars/01.png", online: true },
    { id: "2", name: "Awa Diallo", avatar: "/avatars/02.png", online: true },
    { id: "3", name: "Ousmane Sow", avatar: "/avatars/03.png", online: false },
    { id: "4", name: "Fatou Ndiaye", avatar: "/avatars/04.png", online: true },
];

export const CHAT_MESSAGES = [
    { id: "msg1", userId: "2", message: "Bonjour Moussa ! As-tu vu la mise à jour du marché pour les arachides ?", timestamp: new Date(Date.now() - 1000 * 60 * 5), audioUrl: null },
    { id: "msg2", userId: "1", message: "Salut Awa ! Oui, ça a l'air prometteur. J'espère que le prix se maintiendra.", timestamp: new Date(Date.now() - 1000 * 60 * 4), audioUrl: null },
    { id: "msg3", userId: "2", message: "Croisons les doigts. Le nouvel engrais semble bien fonctionner de mon côté.", timestamp: new Date(Date.now() - 1000 * 60 * 3), audioUrl: null },
    { id: "msg4", userId: "4", message: "Bienvenue tout le monde ! Je viens de rejoindre le chat.", timestamp: new Date(Date.now() - 1000 * 60 * 2), audioUrl: null },
];
