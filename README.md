# 🎓 Espace d'Étude

> Une application de bureau tout-en-un pour organiser ses études, suivre sa progression et maîtriser son programme.

![Status](https://img.shields.io/badge/status-active-success)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Platform](https://img.shields.io/badge/platform-Windows-lightgrey)
![License](https://img.shields.io/badge/license-MIT-green)

---

## ✨ Fonctionnalités

- 📊 **Tableau de bord** — Vue d'ensemble de la progression, statistiques et objectifs
- 📚 **Matières** — Organisation du programme en matières → chapitres → leçons → sections
- 🧠 **Système de maîtrise** — Distingue ce qui est compris de ce qui est simplement terminé
- 📝 **Bibliothèque** — Stockage des notes, règles, formules et concepts importants
- 🔄 **Révisions** — Suggestions automatiques et planification manuelle des révisions
- 📅 **Planning** — Gestion des épreuves, devoirs et échéances
- ⏱️ **Minuteur** — Sessions Pomodoro associées aux matières
- 📈 **Statistiques** — Progression, activité hebdomadaire et carte de chaleur
- 🔥 **Séries d'étude** — Suivi des jours d'étude consécutifs
- 🏆 **Récompenses** — Déblocage de succès en progressant
- 🌙 **Thème clair / sombre**
- 💾 **100 % local** — Les données restent sur l'ordinateur

---

## 📸 Aperçu

Ajoutez ici des captures d'écran de l'application.

Exemple de structure :

    screenshots/
    ├── dashboard.png
    ├── subjects.png
    ├── revisions.png
    └── statistics.png

---

## 🚀 Installation

### 📦 Option 1 — Télécharger l'installeur

La manière la plus simple d'utiliser l'application est de télécharger la dernière version depuis les Releases GitHub.

1. Ouvrez la page Releases :
   https://github.com/fouad-dev101/espace-etude/releases

2. Téléchargez le fichier :

       Espace-d-etude-Setup-1.0.0.exe

3. Lancez l'installeur.
4. Suivez les instructions.
5. Lancez **Espace d'Étude** depuis le Bureau ou le menu Démarrer.

### 💻 Option 2 — Depuis les sources

#### Prérequis

- Node.js
- npm
- Git

#### Installation

    git clone https://github.com/fouad-dev101/espace-etude.git
    cd espace-etude
    npm install

#### Développement

Pour lancer la version web :

    npm run dev

Pour lancer l'application Electron :

    npm run electron:dev

#### Build Windows

Pour créer l'installeur Windows :

    npm run electron:build

---

## 🛠️ Stack technique

| Technologie | Utilisation |
|---|---|
| **React 18** | Interface utilisateur |
| **Vite** | Build et développement frontend |
| **React Router** | Navigation de l'application |
| **Tailwind CSS** | Design et styles |
| **Lucide React** | Icônes |
| **Electron** | Application desktop |
| **electron-builder** | Création de l'installeur |
| **LocalStorage** | Persistance locale des données |

---

## 📁 Structure du projet

    espace-etude/
    ├── electron/
    │   ├── main.cjs          # Processus principal Electron
    │   └── preload.cjs       # Bridge sécurisé
    │
    ├── src/
    │   ├── components/       # Composants réutilisables
    │   ├── context/          # Gestion de l'état avec React Context
    │   ├── hooks/            # Hooks personnalisés
    │   ├── pages/            # Pages de l'application
    │   ├── utils/            # Fonctions utilitaires
    │   ├── App.jsx           # Application principale
    │   └── main.jsx          # Point d'entrée React
    │
    ├── package.json
    ├── vite.config.js
    ├── README.md
    └── LICENSE

---

## 🎓 Programme scolaire

L'application propose un programme de démarrage pour la **1ère année du Baccalauréat — Sciences Économiques et Gestion au Maroc**.

L'organisation permet de naviguer facilement :

    Matière
      └── Chapitre
           └── Leçon
                └── Section

Chaque élément peut être suivi individuellement afin de mesurer précisément la progression.

---

## 💡 À propos

**Espace d'Étude** a été développé pour aider les étudiants à :

- mieux organiser leur programme scolaire ;
- suivre leur progression ;
- identifier les matières ou leçons à revoir ;
- centraliser leurs notes et connaissances ;
- développer une routine d'étude régulière ;
- préparer leurs examens plus efficacement.

L'application est conçue pour fonctionner **localement**, sans nécessiter de compte utilisateur ni de serveur distant.

---

## 🔒 Confidentialité

Toutes les données de l'utilisateur sont stockées **localement sur son ordinateur**.

Aucune donnée scolaire personnelle n'est envoyée vers un serveur distant.

---

## 🗺️ Roadmap

- [x] Tableau de bord
- [x] Gestion des matières
- [x] Suivi des chapitres et leçons
- [x] Système de maîtrise
- [x] Notes et bibliothèque
- [x] Statistiques
- [x] Mode clair / sombre
- [x] Minuteur Pomodoro
- [ ] Amélioration du système de révisions
- [ ] Export / import des données
- [ ] Sauvegarde locale avancée
- [ ] Nouveaux programmes scolaires
- [ ] Améliorations UI/UX

---

## 📄 Licence

Ce projet est distribué sous licence **MIT**.

Voir le fichier [LICENSE](LICENSE) pour plus d'informations.

---

## 🙏 Crédits

Développée avec ❤️ pour ma sœur.

---

## 👨‍💻 Développeur

**FodX**

> Building useful software, one project at a time.