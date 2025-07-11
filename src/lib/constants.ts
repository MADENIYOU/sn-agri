import { BarChart2, BrainCircuit, Home, Map, MessageSquare, Sprout, User, Users, MessageCircle } from "lucide-react";

export const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/map", label: "Interactive Map", icon: Map },
  { href: "/search", label: "AI Crop Search", icon: BrainCircuit },
  { href: "/insights", label: "AI Insights", icon: BarChart2 },
  { href: "/crops", label: "Crop Database", icon: Sprout },
  { href: "/feed", label: "Community Feed", icon: MessageSquare },
  { href: "/chat", label: "Chat", icon: MessageCircle },
];

export const USER_NAV_LINKS = [
  { href: "/profile", label: "Profile", icon: User },
  { href: "/settings", label: "Settings", icon: null },
];

export const CROP_DATA = [
  {
    slug: "millet",
    name: "Millet",
    description: "A highly resilient and nutritious cereal grain, well-suited for the arid and semi-arid regions of Senegal. It's a staple food and vital for food security.",
    bestPractices: "Plant at the beginning of the rainy season. Requires well-drained soil. Intercropping with legumes like cowpea can improve soil fertility.",
    productionConditions: "Drought-tolerant. Thrives in sandy soils. Optimal temperature range is 26-30°C.",
    image: {
      src: "https://placehold.co/800x600.png",
      aiHint: "millet field"
    }
  },
  {
    slug: "sorghum",
    name: "Sorghum",
    description: "Another key cereal in Senegal, valued for its tolerance to drought and heat. It's used for food, feed, and traditional beverages.",
    bestPractices: "Use certified seeds for better yields. Practice crop rotation to manage pests and diseases. Timely weeding is crucial.",
    productionConditions: "Prefers clay-loam soils but adapts to many types. Requires less water than maize. Full sun is necessary.",
    image: {
      src: "https://placehold.co/800x600.png",
      aiHint: "sorghum crop"
    }
  },
  {
    slug: "groundnut",
    name: "Groundnut (Arachide)",
    description: "A major cash crop for Senegal, important for both the local economy and for export. It is a nitrogen-fixing legume, which improves soil health.",
    bestPractices: "Ensure good soil preparation. Apply phosphate fertilizers. Harvest at the right maturity to avoid aflatoxin contamination.",
    productionConditions: "Requires sandy or sandy-loam soil for easy peg penetration. Needs moderate rainfall, especially during flowering and pod formation.",
    image: {
      src: "https://placehold.co/800x600.png",
      aiHint: "groundnut plant"
    }
  },
  {
    slug: "cowpea",
    name: "Cowpea (Niébé)",
    description: "A versatile and nutritious legume, often called 'the poor man's meat'. It's consumed as dry grain, green pods, and leaves, and fixes nitrogen in the soil.",
    bestPractices: "Can be grown as a sole crop or intercropped with cereals like millet and sorghum. Protect against insect pests, particularly during flowering.",
    productionConditions: "Highly drought-tolerant and adapted to sandy soils. Thrives in warm weather.",
    image: {
      src: "https://placehold.co/800x600.png",
      aiHint: "cowpea field"
    }
  },
  {
    slug: "maize",
    name: "Maize (Corn)",
    description: "Growing in importance in Senegal, especially in the more humid southern regions. It is used for human consumption and as animal feed.",
    bestPractices: "Requires more water and nutrients than millet or sorghum. Plant in rows for easier management. Hybrid varieties can significantly increase yield.",
    productionConditions: "Prefers fertile, well-drained loamy soils. Sensitive to drought, particularly during the tasseling and silking stages.",
    image: {
      src: "https://placehold.co/800x600.png",
      aiHint: "maize plantation"
    }
  },
  {
    slug: "cassava",
    name: "Cassava (Manioc)",
    description: "A starchy root crop that is a major source of carbohydrates. It is known for its ability to grow in poor soils and its drought tolerance.",
    bestPractices: "Propagated from stem cuttings. Weed control is essential in the first few months. Can be harvested from 8 to 24 months after planting.",
    productionConditions: "Adapts to a wide range of soil types but does not tolerate waterlogging. Thrives in tropical climates.",
    image: {
      src: "https://placehold.co/800x600.png",
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
      role: "Farmer"
    },
    timestamp: "2 hours ago",
    content: "Just finished planting the new batch of groundnuts for the season. The soil moisture is perfect after last week's rain. Hoping for a great harvest this year! #SenegalAgriculture #Groundnut",
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
      role: "Agronomist"
    },
    timestamp: "1 day ago",
    content: "Reminder to fellow farmers in the Kaolack region: watch out for early signs of millet head miner. Early detection and integrated pest management are key to protecting your yield. I'm available for consultations.",
    image: null,
    likes: 22,
    comments: 8,
  },
  {
    id: 3,
    author: {
      name: "Bio-Agri SARL",
      avatar: "/avatars/03.png",
      role: "Buyer"
    },
    timestamp: "3 days ago",
    content: "We are looking to source 5 tons of certified organic cowpeas (niébé). Please contact us with your offers and certification details. Competitive prices offered!",
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

export const SOIL_TYPES = ["Sandy", "Clay", "Loam", "Sandy Loam", "Clay Loam"];

export const CHAT_USERS = [
    { id: "1", name: "Moussa Faye", avatar: "/avatars/01.png", online: true },
    { id: "2", name: "Awa Diallo", avatar: "/avatars/02.png", online: true },
    { id: "3", name: "Ousmane Sow", avatar: "/avatars/03.png", online: false },
    { id: "4", name: "Fatou Ndiaye", avatar: "/avatars/04.png", online: true },
];

export const CHAT_MESSAGES = [
    { id: "msg1", userId: "2", message: "Hello Moussa! Did you see the market update for groundnuts?", timestamp: new Date(Date.now() - 1000 * 60 * 5) },
    { id: "msg2", userId: "1", message: "Hi Awa! Yes, looks promising. I'm hoping the price holds.", timestamp: new Date(Date.now() - 1000 * 60 * 4) },
    { id: "msg3", userId: "2", message: "Fingers crossed. The new fertilizer seems to be working well on my end.", timestamp: new Date(Date.now() - 1000 * 60 * 3) },
    { id: "msg4", userId: "4", message: "Welcome everyone! I just joined the chat.", timestamp: new Date(Date.now() - 1000 * 60 * 2) },
];
