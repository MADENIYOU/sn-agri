# SenAgriConnect

**SenAgriConnect | Connecter les agriculteurs, notre mission.**

## 📖 À propos

SenAgriConnect est une plateforme web collaborative conçue pour soutenir et dynamiser le secteur agricole au Sénégal. Elle vise à fournir aux agriculteurs, aux chercheurs et aux acteurs du marché un accès centralisé à des données cruciales, des outils d'aide à la décision basés sur l'IA, et un espace communautaire pour le partage de connaissances et d'opportunités.

## ✨ Fonctionnalités Clés

- **🤖 Recommandations par IA**: Obtenez des suggestions de cultures personnalisées en fonction de votre région, type de sol et conditions météorologiques.
- **🗺️ Carte Interactive**: Explorez les régions agricoles du Sénégal, visualisez les données météorologiques en temps réel et localisez d'autres membres de la communauté.
- **📊 Données & Aperçus**: Accédez à une base de données sur les cultures, analysez les tendances de production et obtenez des résumés d'actualités agricoles générés par l'IA.
- **💬 Fil Communautaire & Messagerie**: Connectez-vous avec d'autres agriculteurs, partagez des conseils, posez des questions et collaborez via un fil de discussion et une messagerie privée.
- **🗣️ Assistance Vocale**: Interagissez avec certaines fonctionnalités en utilisant des commandes vocales et recevez des informations via la synthèse vocale.

## 🚀 Démarrage Rapide

Pour lancer le projet localement, suivez ces étapes :

1.  **Cloner le dépôt**
    ```bash
    git clone <URL_DU_REPO>
    cd <NOM_DU_DOSSIER>
    ```

2.  **Installer les dépendances**
    ```bash
    npm install
    ```

3.  **Configurer les variables d'environnement**
    Créez un fichier `.env` à la racine du projet et ajoutez les clés d'API nécessaires. Un exemple est fourni dans `.env.example`.
    ```env
    # Clés Supabase (disponibles dans votre tableau de bord Supabase)
    NEXT_PUBLIC_SUPABASE_URL=VOTRE_URL_SUPABASE
    NEXT_PUBLIC_SUPABASE_ANON_KEY=VOTRE_CLE_ANON_SUPABASE
    SUPABASE_SERVICE_ROLE_KEY=VOTRE_CLE_SERVICE_ROLE_SUPABASE

    # Clé API OpenWeatherMap (pour les données météo)
    NEXT_PUBLIC_OPENWEATHER_API_KEY=VOTRE_CLE_API_OPENWEATHER
    ```

4.  **Lancer l'application de développement**
    ```bash
    npm run dev
    ```
    L'application sera accessible à l'adresse `http://localhost:9002`.

## 🛠️ Stack Technique

- **Framework**: Next.js (React)
- **Style**: Tailwind CSS & ShadCN UI
- **Base de Données & Authentification**: Supabase
- **Fonctionnalités IA**: Google AI & Genkit
- **Cartographie**: Google Maps API
- **Données Météo**: OpenWeatherMap API

---

Fait avec ❤️ pour l'agriculture sénégalaise.