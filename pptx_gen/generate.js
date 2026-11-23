const pptxgen = require("pptxgenjs");
const path = require("path");

const pptx = new pptxgen();
pptx.layout = "LAYOUT_16x9";
pptx.author = "Alaeddine Elouaddah, Hamza Bendiab, Mohammed Amine Chtioui";
pptx.company = "ENSIASD - Taroudant";
pptx.subject = "Présentation Mini-Projet : EvalIA";
pptx.title = "EvalIA - Plateforme Intelligente d'Évaluation Automatisée";

// Palette de couleurs
const C_PRIMARY = "1E3A8A";    // Bleu Nuit Élégant
const C_SECONDARY = "0284C7";  // Bleu Cyan Vif
const C_DARK = "0F172A";       // Gris Très Foncé / Noir Bleuté
const C_LIGHT_BG = "F8FAFC";   // Fond Gris Très Clair
const C_WHITE = "FFFFFF";      // Blanc Pur
const C_MUTED = "64748B";      // Gris Texte Secondaire
const C_CARD_BG = "FFFFFF";    // Fond Cartes
const C_BORDER = "E2E8F0";     // Bordures douces
const C_ACCENT = "F59E0B";     // Ambre pour accents
const C_SUCCESS = "10B981";    // Vert succès

const LOGO_PATH = path.join(__dirname, "logo_ensiasd.png");

// Fonction d'en-tête standard pour les diapositives
function addSlideHeader(slide, title, category) {
  // Fond subtil
  slide.background = { color: C_LIGHT_BG };

  // Bandeau supérieur moderne
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 13.33, h: 1.15,
    fill: { color: C_PRIMARY }
  });

  // Catégorie / Fil d'Ariane
  slide.addText(category.toUpperCase(), {
    x: 0.8, y: 0.18, w: 9, h: 0.3,
    fontSize: 10, color: "93C5FD", bold: true, fontFace: "Calibri"
  });

  // Titre de la diapositive
  slide.addText(title, {
    x: 0.8, y: 0.45, w: 9, h: 0.55,
    fontSize: 22, color: C_WHITE, bold: true, fontFace: "Calibri"
  });

  // Logo de l'école en haut à droite
  slide.addImage({
    path: LOGO_PATH,
    x: 10.2, y: 0.15, w: 2.7, h: 0.85
  });

  // Ligne de pied de page discrète
  slide.addShape(pptx.ShapeType.line, {
    x: 0.8, y: 7.0, w: 11.73, h: 0,
    line: { color: C_BORDER, width: 1 }
  });

  // Texte pied de page
  slide.addText("EvalIA • Mini-Projet • Encadré par Pr. LAASEM BRAHIM", {
    x: 0.8, y: 7.05, w: 8.0, h: 0.3,
    fontSize: 9, color: C_MUTED, fontFace: "Calibri"
  });

  slide.addText("ENSIASD - Université Ibn Zohr", {
    x: 9.0, y: 7.05, w: 3.5, h: 0.3,
    fontSize: 9, color: C_MUTED, align: "right", fontFace: "Calibri"
  });
}

// ==========================================
// SLIDE 1 : TITRE & COUVERTURE
// ==========================================
{
  const s = pptx.addSlide();
  s.background = { color: "0B132B" }; // Deep luxury navy

  // Forme géométrique décorative moderne
  s.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 0.4, h: 7.5,
    fill: { color: C_SECONDARY }
  });

  // Logo ENSIASD bien visible sur fond blanc rectangulaire
  s.addShape(pptx.ShapeType.roundRect, {
    x: 4.16, y: 0.6, w: 5.0, h: 1.3,
    rectRadius: 0.1,
    fill: { color: C_WHITE }
  });
  s.addImage({
    path: LOGO_PATH,
    x: 4.26, y: 0.65, w: 4.8, h: 1.2
  });

  // Titre du projet
  s.addText("EvalIA", {
    x: 1.0, y: 2.2, w: 11.33, h: 1.1,
    fontSize: 48, bold: true, color: C_WHITE, align: "center", fontFace: "Calibri"
  });

  // Sous-titre
  s.addText("Plateforme Intelligente de Génération Automatisée d'Évaluations & Gestion d'Examens par IA", {
    x: 1.5, y: 3.25, w: 10.33, h: 0.6,
    fontSize: 18, color: "38BDF8", align: "center", bold: true, fontFace: "Calibri"
  });

  // Ligne de séparation
  s.addShape(pptx.ShapeType.line, {
    x: 3.66, y: 4.0, w: 6.0, h: 0,
    line: { color: "1E40AF", width: 2 }
  });

  // Cadre Réalisé par (Gauche)
  s.addShape(pptx.ShapeType.roundRect, {
    x: 1.8, y: 4.35, w: 4.6, h: 2.2,
    rectRadius: 0.15,
    fill: { color: "1C2541" },
    line: { color: "3A506B", width: 1.5 }
  });
  s.addText("ÉQUIPE DE RÉALISATION", {
    x: 2.0, y: 4.5, w: 4.2, h: 0.35,
    fontSize: 11, bold: true, color: "60A5FA", fontFace: "Calibri"
  });
  s.addText([
    { text: "• Alaeddine Elouaddah\n", options: { bold: true, color: C_WHITE } },
    { text: "• Hamza Bendiab\n", options: { bold: true, color: C_WHITE } },
    { text: "• Mohammed Amine Chtioui", options: { bold: true, color: C_WHITE } }
  ], {
    x: 2.0, y: 4.95, w: 4.2, h: 1.4,
    fontSize: 13, fontFace: "Calibri", lineSpacingMultiple: 1.2
  });

  // Cadre Encadré par (Droite)
  s.addShape(pptx.ShapeType.roundRect, {
    x: 6.9, y: 4.35, w: 4.6, h: 2.2,
    rectRadius: 0.15,
    fill: { color: "1C2541" },
    line: { color: "3A506B", width: 1.5 }
  });
  s.addText("SOUS LA DIRECTION DE", {
    x: 7.1, y: 4.5, w: 4.2, h: 0.35,
    fontSize: 11, bold: true, color: "60A5FA", fontFace: "Calibri"
  });
  s.addText([
    { text: "Pr. LAASEM BRAHIM\n\n", options: { bold: true, color: C_WHITE, fontSize: 15 } },
    { text: "Première Présentation du Mini-Projet\nAnnée Universitaire 2026-2027", options: { color: "94A3B8", fontSize: 11 } }
  ], {
    x: 7.1, y: 4.95, w: 4.2, h: 1.4,
    fontSize: 12, fontFace: "Calibri"
  });
}

// ==========================================
// SLIDE 2 : SOMMAIRE / PLAN
// ==========================================
{
  const s = pptx.addSlide();
  addSlideHeader(s, "Plan de la Présentation", "Agenda");

  const items = [
    { num: "01", title: "Présentation du Projet", desc: "Contexte, Problématique, Solution & Objectifs" },
    { num: "02", title: "Utilisateurs & Acteurs", desc: "Profils Enseignants, Étudiants et Administrateurs" },
    { num: "03", title: "Fonctionnalités & Périmètre", desc: "Fonctionnalités v1.0, Cas d'utilisation & Exclusions" },
    { num: "04", title: "Analyse & Règles Métier", desc: "Diagrammes de cas d'utilisation & Règles clés" },
    { num: "05", title: "Architecture & Modèle de Données", desc: "Architecture logicielle 3-Tiers & Schéma relationnel" },
    { num: "06", title: "Stack Technologique & Planning", desc: "Technologies retenues & Répartition du travail" }
  ];

  items.forEach((item, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const x = 1.0 + col * 5.8;
    const y = 1.6 + row * 1.65;

    s.addShape(pptx.ShapeType.roundRect, {
      x, y, w: 5.5, h: 1.45,
      rectRadius: 0.1,
      fill: { color: C_WHITE },
      line: { color: C_BORDER, width: 1.5 }
    });

    s.addShape(pptx.ShapeType.roundRect, {
      x: x + 0.2, y: y + 0.25, w: 0.95, h: 0.95,
      rectRadius: 0.1,
      fill: { color: C_PRIMARY }
    });
    s.addText(item.num, {
      x: x + 0.2, y: y + 0.45, w: 0.95, h: 0.5,
      fontSize: 16, bold: true, color: C_WHITE, align: "center", fontFace: "Calibri"
    });

    s.addText(item.title, {
      x: x + 1.3, y: y + 0.25, w: 4.0, h: 0.4,
      fontSize: 14, bold: true, color: C_DARK, fontFace: "Calibri"
    });
    s.addText(item.desc, {
      x: x + 1.3, y: y + 0.65, w: 4.0, h: 0.65,
      fontSize: 11, color: C_MUTED, fontFace: "Calibri"
    });
  });
}

// ==========================================
// SLIDE 3 : CONTEXTE & PROBLÉMATIQUE
// ==========================================
{
  const s = pptx.addSlide();
  addSlideHeader(s, "Contexte & Problématique Identifiée", "01. Présentation du Projet");

  // Carte Contexte
  s.addShape(pptx.ShapeType.roundRect, {
    x: 0.8, y: 1.5, w: 5.7, h: 5.2,
    rectRadius: 0.12, fill: { color: C_WHITE }, line: { color: C_BORDER, width: 1.5 }
  });
  s.addShape(pptx.ShapeType.roundRect, {
    x: 1.1, y: 1.8, w: 5.1, h: 0.5,
    rectRadius: 0.08, fill: { color: "EFF6FF" }
  });
  s.addText(" LE CONTEXTE ÉDUCATIF MODERNE", {
    x: 1.2, y: 1.9, w: 4.9, h: 0.35,
    fontSize: 12, bold: true, color: C_PRIMARY, fontFace: "Calibri"
  });
  s.addText([
    { text: "• Digitalisation croissante : ", options: { bold: true, color: C_DARK } },
    { text: "L'enseignement supérieur nécessite des outils modernes pour évaluer en continu les apprentissages.\n\n", options: { color: C_MUTED } },
    { text: "• Volume d'évaluation élevé : ", options: { bold: true, color: C_DARK } },
    { text: "Effectifs importants nécessitant des quiz réguliers pour mesurer l'assimilation des cours.\n\n", options: { color: C_MUTED } },
    { text: "• Essor des Modèles d'IA : ", options: { bold: true, color: C_DARK } },
    { text: "Les LLMs actuels (Gemini, etc.) permettent d'analyser des documents pédagogiques et d'en extraire des concepts clés avec une grande fidélité.", options: { color: C_MUTED } }
  ], {
    x: 1.1, y: 2.5, w: 5.1, h: 4.0,
    fontSize: 11.5, fontFace: "Calibri", lineSpacingMultiple: 1.15
  });

  // Carte Problématique
  s.addShape(pptx.ShapeType.roundRect, {
    x: 6.8, y: 1.5, w: 5.7, h: 5.2,
    rectRadius: 0.12, fill: { color: C_WHITE }, line: { color: "FCA5A5", width: 1.5 }
  });
  s.addShape(pptx.ShapeType.roundRect, {
    x: 7.1, y: 1.8, w: 5.1, h: 0.5,
    rectRadius: 0.08, fill: { color: "FEF2F2" }
  });
  s.addText(" LES LIMITES & DILEMMES ACTUELS", {
    x: 7.2, y: 1.9, w: 4.9, h: 0.35,
    fontSize: 12, bold: true, color: "DC2626", fontFace: "Calibri"
  });
  s.addText([
    { text: "• Chronophage & Répétitif : ", options: { bold: true, color: C_DARK } },
    { text: "Rédiger des QCM pertinents et diversifiés à partir de supports volumineux (PDF de 50+ pages) prend des heures à l'enseignant.\n\n", options: { color: C_MUTED } },
    { text: "• Risque de Biais et Répétition : ", options: { bold: true, color: C_DARK } },
    { text: "Difficulté de couvrir équitablement toutes les parties du cours sans recycler d'anciens examens.\n\n", options: { color: C_MUTED } },
    { text: "• Retard de Rétroaction : ", options: { bold: true, color: C_DARK } },
    { text: "Correction manuelle lente privant les étudiants d'un retour immédiat et d'explications détaillées pour progresser.", options: { color: C_MUTED } }
  ], {
    x: 7.1, y: 2.5, w: 5.1, h: 4.0,
    fontSize: 11.5, fontFace: "Calibri", lineSpacingMultiple: 1.15
  });
}

// ==========================================
// SLIDE 4 : SOLUTION PROPOSÉE & OBJECTIFS
// ==========================================
{
  const s = pptx.addSlide();
  addSlideHeader(s, "La Solution EvalIA & Ses Objectifs", "01. Présentation du Projet");

  // Carte Solution
  s.addShape(pptx.ShapeType.roundRect, {
    x: 0.8, y: 1.5, w: 11.73, h: 2.3,
    rectRadius: 0.12, fill: { color: C_WHITE }, line: { color: C_SECONDARY, width: 1.5 }
  });
  s.addText("NOTRE SOLUTION : EVALIA", {
    x: 1.1, y: 1.7, w: 10, h: 0.35,
    fontSize: 13, bold: true, color: C_SECONDARY, fontFace: "Calibri"
  });
  s.addText(
    "EvalIA est une application web complète qui permet aux enseignants de téléverser directement leurs supports de cours (PDF/Text) et de générer instantanément, grâce à l'Intelligence Artificielle générative, des examens sous forme de QCM qualifiés avec explications pédagogiques, puis de les publier pour une passation et une correction 100% automatisées.",
    {
      x: 1.1, y: 2.15, w: 11.1, h: 1.4,
      fontSize: 12.5, color: C_DARK, fontFace: "Calibri", lineSpacingMultiple: 1.2
    }
  );

  // 3 Objectifs Clés
  const objs = [
    { title: "Gain de Temps Enseignant", desc: "Automatiser l'extraction textuelle des polycopiés et la formulation de questions/réponses cohérentes en quelques secondes." },
    { title: "Rigueur & Justesse Pédagogique", desc: "Contrôle enseignant avant publication : édition, validation, ajout de distracteurs et explications de correction personnalisées." },
    { title: "Évaluation & Feedback Immédiat", desc: "Calcul automatique du score étudiant, historique des tentatives et affichage des corrections détaillées pour un apprentissage actif." }
  ];

  objs.forEach((o, i) => {
    const x = 0.8 + i * 4.0;
    s.addShape(pptx.ShapeType.roundRect, {
      x, y: 4.05, w: 3.73, h: 2.65,
      rectRadius: 0.1, fill: { color: C_WHITE }, line: { color: C_BORDER, width: 1.2 }
    });
    s.addShape(pptx.ShapeType.roundRect, {
      x: x + 0.2, y: 4.25, w: 3.33, h: 0.45,
      rectRadius: 0.08, fill: { color: "F0FDF4" }
    });
    s.addText(o.title, {
      x: x + 0.2, y: 4.35, w: 3.33, h: 0.3,
      fontSize: 12, bold: true, color: C_SUCCESS, align: "center", fontFace: "Calibri"
    });
    s.addText(o.desc, {
      x: x + 0.25, y: 4.85, w: 3.23, h: 1.7,
      fontSize: 11, color: C_MUTED, fontFace: "Calibri", lineSpacingMultiple: 1.2
    });
  });
}

// ==========================================
// SLIDE 5 : UTILISATEURS & ACTEURS DU SYSTÈME
// ==========================================
{
  const s = pptx.addSlide();
  addSlideHeader(s, "Acteurs & Rôles dans le Système", "02. Utilisateurs et Acteurs");

  const actors = [
    {
      role: "ENSEIGNANT / FORMATEUR",
      badge: "Créateur de Contenu",
      badgeColor: "1E3A8A",
      missions: [
        "Téléverse des documents de cours (PDF, TXT)",
        "Configure les paramètres de génération IA (difficulté, nb questions)",
        "Révise, modifie et valide les QCM proposés",
        "Publie les examens pour ses groupes d'étudiants",
        "Suit les résultats globaux et performances des étudiants"
      ]
    },
    {
      role: "ÉTUDIANT / APPRENANT",
      badge: "Candidat & Évalué",
      badgeColor: "0284C7",
      missions: [
        "Consulte la liste des examens disponibles",
        "Passe les QCM chronométrés ou en accès libre",
        "Reçoit son score instantanément après soumission",
        "Accède aux corrections et explications pédagogiques",
        "Consulte l'historique personnel de ses tentatives"
      ]
    },
    {
      role: "MOTEUR D'IA (EXTERNE)",
      badge: "Service d'Intelligence Artificielle",
      badgeColor: "7C3AED",
      missions: [
        "Reçoit le texte prétraité du cours",
        "Génère des questions pertinentes à choix unique/multiple",
        "Fournit les options correctes, distracteurs crédibles",
        "Génère une explication didactique par question"
      ]
    }
  ];

  actors.forEach((act, idx) => {
    const x = 0.8 + idx * 4.0;
    s.addShape(pptx.ShapeType.roundRect, {
      x, y: 1.5, w: 3.73, h: 5.2,
      rectRadius: 0.12, fill: { color: C_WHITE }, line: { color: C_BORDER, width: 1.5 }
    });

    s.addShape(pptx.ShapeType.roundRect, {
      x: x + 0.3, y: 1.75, w: 3.13, h: 0.35,
      rectRadius: 0.08, fill: { color: act.badgeColor }
    });
    s.addText(act.badge.toUpperCase(), {
      x: x + 0.3, y: 1.83, w: 3.13, h: 0.25,
      fontSize: 9, bold: true, color: C_WHITE, align: "center", fontFace: "Calibri"
    });

    s.addText(act.role, {
      x: x + 0.2, y: 2.25, w: 3.33, h: 0.5,
      fontSize: 13, bold: true, color: C_DARK, align: "center", fontFace: "Calibri"
    });

    s.addShape(pptx.ShapeType.line, {
      x: x + 0.5, y: 2.85, w: 2.73, h: 0,
      line: { color: C_BORDER, width: 1 }
    });

    const bulletList = act.missions.map(m => ({ text: `• ${m}\n\n`, options: { color: C_DARK } }));
    s.addText(bulletList, {
      x: x + 0.25, y: 3.05, w: 3.23, h: 3.5,
      fontSize: 11, fontFace: "Calibri", lineSpacingMultiple: 1.15
    });
  });
}

// ==========================================
// SLIDE 6 : FONCTIONNALITÉS PRINCIPALES (PAR ACTEUR)
// ==========================================
{
  const s = pptx.addSlide();
  addSlideHeader(s, "Fonctionnalités Principales Envisagées", "03. Fonctionnalités & Périmètre");

  // Colonne Enseignant
  s.addShape(pptx.ShapeType.roundRect, {
    x: 0.8, y: 1.5, w: 5.7, h: 5.2,
    rectRadius: 0.12, fill: { color: C_WHITE }, line: { color: C_BORDER, width: 1.5 }
  });
  s.addShape(pptx.ShapeType.rect, {
    x: 0.8, y: 1.5, w: 5.7, h: 0.7,
    fill: { color: C_PRIMARY }
  });
  s.addText("ESPACE ENSEIGNANT", {
    x: 1.1, y: 1.68, w: 5.0, h: 0.35,
    fontSize: 13, bold: true, color: C_WHITE, fontFace: "Calibri"
  });

  s.addText([
    { text: "1. Authentification & Profil :\n", options: { bold: true, color: C_PRIMARY } },
    { text: "   Inscription sécurisée, connexion JWT, mise à jour du profil.\n\n", options: { color: C_MUTED } },
    { text: "2. Ingestion & Extraction de Contenu :\n", options: { bold: true, color: C_PRIMARY } },
    { text: "   Téléversement de cours au format PDF (extraction Apache PDFBox) ou texte brut.\n\n", options: { color: C_MUTED } },
    { text: "3. Assistant de Génération IA :\n", options: { bold: true, color: C_PRIMARY } },
    { text: "   Génération de questions ciblées avec options multiples et explications.\n\n", options: { color: C_MUTED } },
    { text: "4. Éditeur & Publication d'Examens :\n", options: { bold: true, color: C_PRIMARY } },
    { text: "   Modification fine des questions/réponses et mise en ligne immédiate.\n\n", options: { color: C_MUTED } },
    { text: "5. Suivi des Candidats :\n", options: { bold: true, color: C_PRIMARY } },
    { text: "   Consultation des scores et statistiques par examen.", options: { color: C_MUTED } }
  ], {
    x: 1.0, y: 2.35, w: 5.3, h: 4.2,
    fontSize: 10.5, fontFace: "Calibri", lineSpacingMultiple: 1.1
  });

  // Colonne Étudiant
  s.addShape(pptx.ShapeType.roundRect, {
    x: 6.8, y: 1.5, w: 5.7, h: 5.2,
    rectRadius: 0.12, fill: { color: C_WHITE }, line: { color: C_BORDER, width: 1.5 }
  });
  s.addShape(pptx.ShapeType.rect, {
    x: 6.8, y: 1.5, w: 5.7, h: 0.7,
    fill: { color: C_SECONDARY }
  });
  s.addText("ESPACE ÉTUDIANT", {
    x: 7.1, y: 1.68, w: 5.0, h: 0.35,
    fontSize: 13, bold: true, color: C_WHITE, fontFace: "Calibri"
  });

  s.addText([
    { text: "1. Tableau de Bord Personnel :\n", options: { bold: true, color: C_SECONDARY } },
    { text: "   Vue synthétique des examens disponibles et des derniers résultats.\n\n", options: { color: C_MUTED } },
    { text: "2. Passage d'Examen Interactif :\n", options: { bold: true, color: C_SECONDARY } },
    { text: "   Interface intuitive sans distraction, navigation fluide entre questions.\n\n", options: { color: C_MUTED } },
    { text: "3. Calcul Automatique des Notes :\n", options: { bold: true, color: C_SECONDARY } },
    { text: "   Barème dynamique, calcul instantané du score et pourcentage de réussite.\n\n", options: { color: C_MUTED } },
    { text: "4. Rétroaction Pédagogique Immédiate :\n", options: { bold: true, color: C_SECONDARY } },
    { text: "   Affichage des réponses correctes et consultation des explications détaillées.\n\n", options: { color: C_MUTED } },
    { text: "5. Historique des Tentatives :\n", options: { bold: true, color: C_SECONDARY } },
    { text: "   Suivi de sa propre progression au fil du semestre.", options: { color: C_MUTED } }
  ], {
    x: 7.0, y: 2.35, w: 5.3, h: 4.2,
    fontSize: 10.5, fontFace: "Calibri", lineSpacingMultiple: 1.1
  });
}

// ==========================================
// SLIDE 7 : PÉRIMÈTRE DU PROJET (V1 vs EXTENSIONS)
// ==========================================
{
  const s = pptx.addSlide();
  addSlideHeader(s, "Périmètre du Projet : Inclus vs Non Inclus", "03. Périmètre du Projet");

  // Cadre Ce qui sera réalisé
  s.addShape(pptx.ShapeType.roundRect, {
    x: 0.8, y: 1.5, w: 5.7, h: 5.2,
    rectRadius: 0.12, fill: { color: C_WHITE }, line: { color: C_SUCCESS, width: 2 }
  });
  s.addShape(pptx.ShapeType.roundRect, {
    x: 1.1, y: 1.75, w: 5.1, h: 0.5,
    rectRadius: 0.08, fill: { color: "DCFCE7" }
  });
  s.addText(" PRÉVU POUR LA PREMIÈRE VERSION (V1)", {
    x: 1.2, y: 1.87, w: 4.9, h: 0.3,
    fontSize: 11, bold: true, color: "15803D", fontFace: "Calibri"
  });

  s.addText([
    { text: "• Authentification complète (Enseignant / Étudiant) avec jetons JWT.\n\n", options: { color: C_DARK } },
    { text: "• Extraction de texte depuis des fichiers PDF académiques.\n\n", options: { color: C_DARK } },
    { text: "• Invocation d'un LLM via API REST pour générer des QCM structurés en JSON.\n\n", options: { color: C_DARK } },
    { text: "• Interface de révision et modification des questions avant enregistrement.\n\n", options: { color: C_DARK } },
    { text: "• Interface de passage d'examen pour l'étudiant.\n\n", options: { color: C_DARK } },
    { text: "• Correction automatique et enregistrement des tentatives en base PostgreSQL.", options: { color: C_DARK } }
  ], {
    x: 1.1, y: 2.45, w: 5.1, h: 4.1,
    fontSize: 11, fontFace: "Calibri", lineSpacingMultiple: 1.1
  });

  // Cadre Ce qui ne sera pas réalisé dans l'immédiat
  s.addShape(pptx.ShapeType.roundRect, {
    x: 6.8, y: 1.5, w: 5.7, h: 5.2,
    rectRadius: 0.12, fill: { color: C_WHITE }, line: { color: "CBD5E1", width: 2 }
  });
  s.addShape(pptx.ShapeType.roundRect, {
    x: 7.1, y: 1.75, w: 5.1, h: 0.5,
    rectRadius: 0.08, fill: { color: "F1F5F9" }
  });
  s.addText(" EXTENSIONS ENVISAGÉES (POST-V1)", {
    x: 7.2, y: 1.87, w: 4.9, h: 0.3,
    fontSize: 11, bold: true, color: C_MUTED, fontFace: "Calibri"
  });

  s.addText([
    { text: "• Surveillance anti-triche avancée par webcam / détection de visage.\n\n", options: { color: C_MUTED } },
    { text: "• Questions à réponse libre analysées sémantiquement par IA (NLP complexe).\n\n", options: { color: C_MUTED } },
    { text: "• Intégration LMS directe via connecteur LTI (Moodle / Canvas).\n\n", options: { color: C_MUTED } },
    { text: "• Génération de questions incluant du code compilable ou des graphiques dynamiques.\n\n", options: { color: C_MUTED } },
    { text: "• Application mobile native dédiée.", options: { color: C_MUTED } }
  ], {
    x: 7.1, y: 2.45, w: 5.1, h: 4.1,
    fontSize: 11, fontFace: "Calibri", lineSpacingMultiple: 1.1
  });
}

// ==========================================
// SLIDE 8 : ANALYSE FONCTIONNELLE & CAS D'UTILISATION
// ==========================================
{
  const s = pptx.addSlide();
  addSlideHeader(s, "Première Analyse Fonctionnelle & Cas d'Utilisation", "04. Première Analyse");

  // Encadré Cas d'utilisation
  s.addShape(pptx.ShapeType.roundRect, {
    x: 0.8, y: 1.5, w: 6.8, h: 5.2,
    rectRadius: 0.12, fill: { color: C_WHITE }, line: { color: C_BORDER, width: 1.5 }
  });
  s.addText("SYNTHÈSE DES CAS D'UTILISATION (USE CASES)", {
    x: 1.1, y: 1.75, w: 6.2, h: 0.35,
    fontSize: 12, bold: true, color: C_PRIMARY, fontFace: "Calibri"
  });

  // Blocs de cas d'utilisation
  const ucs = [
    { title: "UC1 : Authentification & Sécurité", sub: "Gérer compte (Enseignant/Étudiant), Inscription, Login JWT, Sécurisation des endpoints" },
    { title: "UC2 : Extraction & Prétraitement", sub: "Uploader document (PDF/Texte), Extraction de texte brut, Découpage et nettoyage" },
    { title: "UC3 : Génération IA & Configuration", sub: "Définition du nombre de questions, appel LLM avec prompt d'évaluation, parsing JSON strict" },
    { title: "UC4 : Création & Gestion d'Examen", sub: "Édition/validation des QCM, enregistrement en BDD, publication pour les étudiants" },
    { title: "UC5 : Passation d'Évaluation & Notation", sub: "Affichage des questions, sélection des réponses, calcul immédiat du score, stockage de la tentative" }
  ];

  ucs.forEach((u, i) => {
    const y = 2.2 + i * 0.88;
    s.addShape(pptx.ShapeType.roundRect, {
      x: 1.1, y, w: 6.2, h: 0.75,
      rectRadius: 0.08, fill: { color: "F8FAFC" }, line: { color: C_BORDER, width: 1 }
    });
    s.addText(u.title, {
      x: 1.3, y: y + 0.1, w: 5.8, h: 0.25,
      fontSize: 11, bold: true, color: C_PRIMARY, fontFace: "Calibri"
    });
    s.addText(u.sub, {
      x: 1.3, y: y + 0.38, w: 5.8, h: 0.32,
      fontSize: 9.5, color: C_MUTED, fontFace: "Calibri"
    });
  });

  // Encadré Scénario Clé
  s.addShape(pptx.ShapeType.roundRect, {
    x: 7.9, y: 1.5, w: 4.63, h: 5.2,
    rectRadius: 0.12, fill: { color: C_WHITE }, line: { color: C_SECONDARY, width: 1.5 }
  });
  s.addText("SCÉNARIO CLÉ : FLUX ENSEIGNANT", {
    x: 8.2, y: 1.75, w: 4.0, h: 0.35,
    fontSize: 12, bold: true, color: C_SECONDARY, fontFace: "Calibri"
  });

  const steps = [
    "1. L'enseignant se connecte à son tableau de bord.",
    "2. Il dépose un cours en PDF (ex: 'Intelligence Artificielle').",
    "3. Le système extrait le texte intégral du PDF.",
    "4. L'IA génère 5 à 10 questions avec choix et corrections.",
    "5. L'enseignant prévisualise, ajuste une formulation et valide.",
    "6. L'examen est persisté et prêt pour les apprenants."
  ];

  steps.forEach((st, i) => {
    const y = 2.25 + i * 0.72;
    s.addShape(pptx.ShapeType.roundRect, {
      x: 8.2, y, w: 4.03, h: 0.62,
      rectRadius: 0.06, fill: { color: "F0F9FF" }
    });
    s.addText(st, {
      x: 8.35, y: y + 0.08, w: 3.75, h: 0.48,
      fontSize: 10, color: C_DARK, fontFace: "Calibri"
    });
  });
}

// ==========================================
// SLIDE 9 : RÈGLES MÉTIER DU SYSTÈME
// ==========================================
{
  const s = pptx.addSlide();
  addSlideHeader(s, "Principales Règles Métier Identifiées", "04. Première Analyse");

  const rules = [
    {
      num: "BR-01",
      cat: "Sécurité & Rôles",
      title: "Cloisonnement des Rôles (RBAC)",
      desc: "Seul un utilisateur avec le rôle 'TEACHER' peut générer, créer ou modifier un examen. Un utilisateur 'STUDENT' a un accès en lecture seule aux examens et peut uniquement soumettre ses tentatives."
    },
    {
      num: "BR-02",
      cat: "Structure des Données",
      title: "Validité des Questions d'Examen",
      desc: "Toute question de type SINGLE doit contenir exactement 1 option marquée comme correcte. Les questions MULTIPLE doivent avoir au moins 1 bonne réponse et au minimum 2 options au total."
    },
    {
      num: "BR-03",
      cat: "Algorithme",
      title: "Calcul du Score & Barème",
      desc: "Le score est calculé instantanément lors de la soumission selon la formule : Score = (Bonnes Réponses / Nombre Total) * 100. La tentative est horodatée et archivée avec le score final."
    },
    {
      num: "BR-04",
      cat: "Pédagogie",
      title: "Explications Didactiques Obligatoires",
      desc: "L'IA doit obligatoirement fournir un champ 'explanation' pour chaque question afin de justifier pourquoi la réponse attendue est la bonne et lever toute ambiguïté pour l'étudiant."
    }
  ];

  rules.forEach((r, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const x = 0.8 + col * 5.95;
    const y = 1.6 + row * 2.6;

    s.addShape(pptx.ShapeType.roundRect, {
      x, y, w: 5.7, h: 2.35,
      rectRadius: 0.12, fill: { color: C_WHITE }, line: { color: C_BORDER, width: 1.5 }
    });

    s.addShape(pptx.ShapeType.roundRect, {
      x: x + 0.3, y: y + 0.2, w: 1.0, h: 0.35,
      rectRadius: 0.08, fill: { color: C_PRIMARY }
    });
    s.addText(r.num, {
      x: x + 0.3, y: y + 0.27, w: 1.0, h: 0.22,
      fontSize: 10, bold: true, color: C_WHITE, align: "center", fontFace: "Calibri"
    });

    s.addText(r.cat.toUpperCase(), {
      x: x + 1.45, y: y + 0.27, w: 3.8, h: 0.25,
      fontSize: 9.5, bold: true, color: C_MUTED, fontFace: "Calibri"
    });

    s.addText(r.title, {
      x: x + 0.3, y: y + 0.65, w: 5.1, h: 0.35,
      fontSize: 13, bold: true, color: C_DARK, fontFace: "Calibri"
    });

    s.addText(r.desc, {
      x: x + 0.3, y: y + 1.05, w: 5.1, h: 1.15,
      fontSize: 11, color: C_MUTED, fontFace: "Calibri", lineSpacingMultiple: 1.15
    });
  });
}

// ==========================================
// SLIDE 10 : PREMIÈRE CONCEPTION & ARCHITECTURE 3-TIERS
// ==========================================
{
  const s = pptx.addSlide();
  addSlideHeader(s, "Première Conception : Architecture Système 3-Tiers", "05. Première Conception");

  // 3 Blocs Verticaux (Frontend, Backend, Persistance/IA)
  const tiers = [
    {
      title: "1. COUCHE PRÉSENTATION",
      subtitle: "Frontend React (SPA)",
      color: "0284C7",
      items: [
        "React 19 + TypeScript + Vite",
        "Tailwind CSS pour le design moderne",
        "Framer Motion pour les animations",
        "React Router (SPA Navigation)",
        "Gestion d'état locale & Appels Axios/Fetch",
        "Composants Étudiant & Enseignant dédiés"
      ]
    },
    {
      title: "2. COUCHE MÉTIER & API",
      subtitle: "Backend Jakarta EE 10",
      color: "1E3A8A",
      items: [
        "JAX-RS (Services Web RESTful)",
        "Serveur d'application WildFly 34",
        "Contrôle d'accès & Sécurité JWT / BCrypt",
        "Extraction PDF (Apache PDFBox)",
        "Service d'intégration IA (AiClient Gemini)",
        "Couche DAO / Repository (JDBC)"
      ]
    },
    {
      title: "3. COUCHE DONNÉES & IA",
      subtitle: "Persistance & Services Externes",
      color: "4338CA",
      items: [
        "PostgreSQL 16 (Base Relationnelle)",
        "Tables relationnelles intègres (FK, CASCADE)",
        "Pool de connexions DataSource",
        "API Google Gemini (LLM pour la génération)",
        "Format d'échange JSON universel",
        "Journalisation et audit des tentatives"
      ]
    }
  ];

  tiers.forEach((t, i) => {
    const x = 0.8 + i * 4.0;
    s.addShape(pptx.ShapeType.roundRect, {
      x, y: 1.5, w: 3.73, h: 5.2,
      rectRadius: 0.12, fill: { color: C_WHITE }, line: { color: C_BORDER, width: 1.5 }
    });

    s.addShape(pptx.ShapeType.rect, {
      x, y: 1.5, w: 3.73, h: 0.85,
      fill: { color: t.color }
    });
    s.addText(t.title, {
      x: x + 0.1, y: 1.65, w: 3.53, h: 0.28,
      fontSize: 11, bold: true, color: C_WHITE, align: "center", fontFace: "Calibri"
    });
    s.addText(t.subtitle, {
      x: x + 0.1, y: 1.95, w: 3.53, h: 0.25,
      fontSize: 10, color: "E0E7FF", align: "center", fontFace: "Calibri"
    });

    const bulletList = t.items.map(it => ({ text: `• ${it}\n\n`, options: { color: C_DARK } }));
    s.addText(bulletList, {
      x: x + 0.25, y: 2.55, w: 3.23, h: 4.0,
      fontSize: 11, fontFace: "Calibri", lineSpacingMultiple: 1.15
    });
  });
}

// ==========================================
// SLIDE 11 : DONNÉES & MODÈLE RELATIONNEL
// ==========================================
{
  const s = pptx.addSlide();
  addSlideHeader(s, "Modèle de Données & Entités Clés", "05. Données & Persistance");

  const tables = [
    {
      name: "evalia_users",
      desc: "Comptes & Profils",
      fields: "• id (PK, BIGSERIAL)\n• name (VARCHAR 100)\n• email (UNIQUE)\n• password (BCrypt Hash)\n• role (STUDENT / TEACHER)\n• profile_photo, created_at"
    },
    {
      name: "exams",
      desc: "Examens Créés",
      fields: "• id (PK, BIGSERIAL)\n• title (VARCHAR 200)\n• description (TEXT)\n• teacher_id (FK -> users)\n• teacher_name\n• created_at"
    },
    {
      name: "exam_questions",
      desc: "Questions des Quiz",
      fields: "• id (PK, BIGSERIAL)\n• exam_id (FK -> exams CASCADE)\n• question (TEXT)\n• question_type (SINGLE/MULTIPLE)\n• explanation (TEXT)\n• order_index (INT)"
    },
    {
      name: "question_options",
      desc: "Choix de Réponses",
      fields: "• id (PK, BIGSERIAL)\n• question_id (FK -> questions CASCADE)\n• option_text (TEXT)\n• is_correct (BOOLEAN)\n• order_index (INT)"
    },
    {
      name: "exam_attempts",
      desc: "Passations & Notes",
      fields: "• id (PK, BIGSERIAL)\n• exam_id (FK -> exams CASCADE)\n• student_id (FK -> users CASCADE)\n• correct_count, total_questions\n• score (NUMERIC 5,2)\n• submitted_at (TIMESTAMP)"
    }
  ];

  // Grille 3 tables en haut, 2 tables en bas
  tables.forEach((tbl, idx) => {
    let x, y, w, h;
    if (idx < 3) {
      w = 3.73; h = 2.45;
      x = 0.8 + idx * 4.0;
      y = 1.5;
    } else {
      w = 5.7; h = 2.45;
      x = 0.8 + (idx - 3) * 5.95;
      y = 4.25;
    }

    s.addShape(pptx.ShapeType.roundRect, {
      x, y, w, h,
      rectRadius: 0.1, fill: { color: C_WHITE }, line: { color: C_BORDER, width: 1.5 }
    });

    s.addShape(pptx.ShapeType.roundRect, {
      x: x + 0.15, y: y + 0.15, w: w - 0.3, h: 0.45,
      rectRadius: 0.06, fill: { color: "EEF2FF" }
    });

    s.addText(`${tbl.name.toUpperCase()} (${tbl.desc})`, {
      x: x + 0.2, y: y + 0.25, w: w - 0.4, h: 0.3,
      fontSize: 10.5, bold: true, color: C_PRIMARY, fontFace: "Calibri"
    });

    s.addText(tbl.fields, {
      x: x + 0.25, y: y + 0.7, w: w - 0.5, h: h - 0.8,
      fontSize: 10, color: C_DARK, fontFace: "Calibri", lineSpacingMultiple: 1.15
    });
  });
}

// ==========================================
// SLIDE 12 : STACK TECHNOLOGIQUE RETENUE
// ==========================================
{
  const s = pptx.addSlide();
  addSlideHeader(s, "Technologies Retenues (Stack Technique)", "06. Technologies & Planning");

  const techRows = [
    { cat: "Frontend Web", tech: "React 19, TypeScript, Vite, Tailwind CSS, Framer Motion", role: "Interface utilisateur moderne, réactive, responsive et typée de bout en bout." },
    { cat: "Backend & API", tech: "Java 21, Jakarta EE 10 (JAX-RS REST API), WildFly 34", role: "Serveur applicatif robuste pour l'orchestration métier et l'exposition des services REST." },
    { cat: "Extraction & NLP", tech: "Apache PDFBox 3.0", role: "Extraction performante du flux textuel à partir de cours magistraux au format PDF." },
    { cat: "Intelligence Artificielle", tech: "Google Gemini 3.8 Flash (via REST Client HTTP)", role: "Génération automatique des questions, réponses justes, pièges et justifications." },
    { cat: "Base de Données", tech: "PostgreSQL 16 & Driver JDBC PostgreSQL 42.7", role: "Stockage relationnel persistant, sécurisé avec clés étrangères et contraintes d'intégrité." },
    { cat: "Sécurité & Auth", tech: "JJWT (JSON Web Tokens 0.12.6) & BCrypt Password Hashing", role: "Chiffrement des mots de passe et gestion des sessions sans état (Stateless Authentication)." }
  ];

  // Tableau moderne formaté
  const tableData = [
    [
      { text: "Couche / Composant", options: { bold: true, fill: { color: C_PRIMARY }, color: C_WHITE, fontSize: 11, align: "center" } },
      { text: "Technologies & Versions", options: { bold: true, fill: { color: C_PRIMARY }, color: C_WHITE, fontSize: 11 } },
      { text: "Rôle dans EvalIA", options: { bold: true, fill: { color: C_PRIMARY }, color: C_WHITE, fontSize: 11 } }
    ]
  ];

  techRows.forEach((r, idx) => {
    const bg = idx % 2 === 0 ? "FFFFFF" : "F8FAFC";
    tableData.push([
      { text: r.cat, options: { bold: true, color: C_PRIMARY, fill: { color: bg }, fontSize: 10.5 } },
      { text: r.tech, options: { bold: true, color: C_DARK, fill: { color: bg }, fontSize: 10 } },
      { text: r.role, options: { color: C_MUTED, fill: { color: bg }, fontSize: 10 } }
    ]);
  });

  s.addTable(tableData, {
    x: 0.8, y: 1.5, w: 11.73, h: 5.2,
    colW: [2.5, 4.23, 5.0],
    border: { pt: 1, color: C_BORDER }
  });
}

// ==========================================
// SLIDE 13 : PLAN DE TRAVAIL & PLANNING PRÉVISIONNEL
// ==========================================
{
  const s = pptx.addSlide();
  addSlideHeader(s, "Plan de Travail Prévisionnel (Octobre - Décembre)", "06. Technologies & Planning");

  const planning = [
    [
      { text: "Étape / Phase", options: { bold: true, fill: { color: C_PRIMARY }, color: C_WHITE, fontSize: 11 } },
      { text: "Durée", options: { bold: true, fill: { color: C_PRIMARY }, color: C_WHITE, fontSize: 11, align: "center" } },
      { text: "Période", options: { bold: true, fill: { color: C_PRIMARY }, color: C_WHITE, fontSize: 11, align: "center" } },
      { text: "Livrables Attendus", options: { bold: true, fill: { color: C_PRIMARY }, color: C_WHITE, fontSize: 11 } }
    ],
    [
      { text: "1. Cadrage & Analyse", options: { bold: true, color: C_DARK, fill: { color: "FFFFFF" }, fontSize: 10 } },
      { text: "1 semaine", options: { color: C_MUTED, fill: { color: "FFFFFF" }, fontSize: 10, align: "center" } },
      { text: "Fin Octobre", options: { color: C_MUTED, fill: { color: "FFFFFF" }, fontSize: 10, align: "center" } },
      { text: "Spécifications fonctionnelles, Use Cases, règles métier, maquettes", options: { color: C_MUTED, fill: { color: "FFFFFF" }, fontSize: 10 } }
    ],
    [
      { text: "2. Conception & Architecture", options: { bold: true, color: C_DARK, fill: { color: "F8FAFC" }, fontSize: 10 } },
      { text: "1 semaine", options: { color: C_MUTED, fill: { color: "F8FAFC" }, fontSize: 10, align: "center" } },
      { text: "Début Novembre", options: { color: C_MUTED, fill: { color: "F8FAFC" }, fontSize: 10, align: "center" } },
      { text: "Architecture logicielle 3-Tiers, schéma relationnel BDD, contrats d'API REST", options: { color: C_MUTED, fill: { color: "F8FAFC" }, fontSize: 10 } }
    ],
    [
      { text: "3. Dév. Backend & IA", options: { bold: true, color: C_DARK, fill: { color: "FFFFFF" }, fontSize: 10 } },
      { text: "2 semaines", options: { color: C_MUTED, fill: { color: "FFFFFF" }, fontSize: 10, align: "center" } },
      { text: "Mi-Novembre", options: { color: C_MUTED, fill: { color: "FFFFFF" }, fontSize: 10, align: "center" } },
      { text: "Services REST Jakarta EE, intégration LLM Gemini, extraction PDF, sécurité JWT", options: { color: C_MUTED, fill: { color: "FFFFFF" }, fontSize: 10 } }
    ],
    [
      { text: "4. Dév. Frontend (React)", options: { bold: true, color: C_DARK, fill: { color: "F8FAFC" }, fontSize: 10 } },
      { text: "2 semaines", options: { color: C_MUTED, fill: { color: "F8FAFC" }, fontSize: 10, align: "center" } },
      { text: "Fin Novembre", options: { color: C_MUTED, fill: { color: "F8FAFC" }, fontSize: 10, align: "center" } },
      { text: "Interfaces Enseignant/Étudiant, moteur de quiz interactif, dashboard", options: { color: C_MUTED, fill: { color: "F8FAFC" }, fontSize: 10 } }
    ],
    [
      { text: "5. Intégration & Recette", options: { bold: true, color: C_DARK, fill: { color: "FFFFFF" }, fontSize: 10 } },
      { text: "1 semaine", options: { color: C_MUTED, fill: { color: "FFFFFF" }, fontSize: 10, align: "center" } },
      { text: "Début Décembre", options: { color: C_MUTED, fill: { color: "FFFFFF" }, fontSize: 10, align: "center" } },
      { text: "Tests de bout en bout, tests de charge IA, validation des cas limites", options: { color: C_MUTED, fill: { color: "FFFFFF" }, fontSize: 10 } }
    ],
    [
      { text: "6. Déploiement & Rapport", options: { bold: true, color: C_DARK, fill: { color: "F8FAFC" }, fontSize: 10 } },
      { text: "1 semaine", options: { color: C_MUTED, fill: { color: "F8FAFC" }, fontSize: 10, align: "center" } },
      { text: "Mi-Décembre", options: { color: C_MUTED, fill: { color: "F8FAFC" }, fontSize: 10, align: "center" } },
      { text: "Rapport technique final, documentation d'installation, soutenance", options: { color: C_MUTED, fill: { color: "F8FAFC" }, fontSize: 10 } }
    ]
  ];

  s.addTable(planning, {
    x: 0.8, y: 1.5, w: 11.73, h: 5.2,
    colW: [2.5, 1.5, 1.8, 5.93],
    border: { pt: 1, color: C_BORDER }
  });
}

// ==========================================
// SLIDE 14 : RÉPARTITION DU TRAVAIL ENTRE LES MEMBRES
// ==========================================
{
  const s = pptx.addSlide();
  addSlideHeader(s, "Répartition des Tâches dans l'Équipe", "06. Organisation & Rôles");

  const team = [
    {
      name: "Alaeddine Elouaddah",
      role: "Lead Backend & Sécurité",
      tasks: [
        "Architecture logicielle Jakarta EE 10",
        "Conception de la base de données PostgreSQL",
        "Implémentation de l'authentification JWT & BCrypt",
        "Développement des endpoints REST d'examens et d'essais",
        "Optimisation des requêtes SQL et intégrité relationnelle"
      ]
    },
    {
      name: "Hamza Bendiab",
      role: "Lead IA & Extraction Documentaire",
      tasks: [
        "Mise en place de l'extraction de texte (Apache PDFBox)",
        "Intégration du client IA Gemini 3.8 Flash (AiClient)",
        "Conception & optimisation des prompts de génération de QCM",
        "Gestion du format de sortie JSON et de la résilience aux pannes",
        "Tests et validation de la pertinence pédagogique des quiz"
      ]
    },
    {
      name: "Mohammed Amine Chtioui",
      role: "Lead Frontend & Expérience Utilisateur",
      tasks: [
        "Architecture du projet React 19 + TypeScript + Vite",
        "Développement des interfaces UI/UX avec Tailwind CSS",
        "Interface de gestion et révision des quiz (Espace Enseignant)",
        "Interface interactive de passage d'examen (Espace Étudiant)",
        "Intégration des APIs REST avec le client web & animations"
      ]
    }
  ];

  team.forEach((m, idx) => {
    const x = 0.8 + idx * 4.0;
    s.addShape(pptx.ShapeType.roundRect, {
      x, y: 1.5, w: 3.73, h: 5.2,
      rectRadius: 0.12, fill: { color: C_WHITE }, line: { color: C_BORDER, width: 1.5 }
    });

    s.addShape(pptx.ShapeType.roundRect, {
      x: x + 0.3, y: 1.8, w: 3.13, h: 0.8,
      rectRadius: 0.08, fill: { color: C_PRIMARY }
    });
    s.addText(m.name, {
      x: x + 0.3, y: 1.9, w: 3.13, h: 0.35,
      fontSize: 12.5, bold: true, color: C_WHITE, align: "center", fontFace: "Calibri"
    });
    s.addText(m.role, {
      x: x + 0.3, y: 2.25, w: 3.13, h: 0.25,
      fontSize: 10, color: "93C5FD", align: "center", fontFace: "Calibri"
    });

    s.addText("MISSIONS & RESPONSABILITÉS :", {
      x: x + 0.3, y: 2.85, w: 3.13, h: 0.3,
      fontSize: 10, bold: true, color: C_MUTED, fontFace: "Calibri"
    });

    const bList = m.tasks.map(t => ({ text: `• ${t}\n\n`, options: { color: C_DARK } }));
    s.addText(bList, {
      x: x + 0.25, y: 3.2, w: 3.23, h: 3.3,
      fontSize: 10.5, fontFace: "Calibri", lineSpacingMultiple: 1.15
    });
  });
}

// ==========================================
// SLIDE 15 : CONCLUSION & QUESTIONS / RÉPONSES
// ==========================================
{
  const s = pptx.addSlide();
  s.background = { color: "0B132B" };

  s.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 0.4, h: 7.5,
    fill: { color: C_SECONDARY }
  });

  // Logo ENSIASD
  s.addShape(pptx.ShapeType.roundRect, {
    x: 4.16, y: 0.7, w: 5.0, h: 1.3,
    rectRadius: 0.1, fill: { color: C_WHITE }
  });
  s.addImage({
    path: LOGO_PATH,
    x: 4.26, y: 0.75, w: 4.8, h: 1.2
  });

  s.addText("Merci pour votre attention !", {
    x: 1.0, y: 2.3, w: 11.33, h: 0.8,
    fontSize: 38, bold: true, color: C_WHITE, align: "center", fontFace: "Calibri"
  });

  s.addText("Place aux discussions et questions / réponses", {
    x: 1.0, y: 3.15, w: 11.33, h: 0.5,
    fontSize: 20, color: "38BDF8", align: "center", fontFace: "Calibri"
  });

  // 3 Questions Clés du Guide
  s.addShape(pptx.ShapeType.roundRect, {
    x: 2.16, y: 3.9, w: 9.0, h: 2.5,
    rectRadius: 0.15, fill: { color: "1C2541" }, line: { color: "3A506B", width: 1.5 }
  });

  s.addText("RAPPEL DES 3 QUESTIONS FONDAMENTALES DU PROJET :", {
    x: 2.4, y: 4.1, w: 8.5, h: 0.35,
    fontSize: 11, bold: true, color: "60A5FA", align: "center", fontFace: "Calibri"
  });

  const recap = [
    { q: "Quel problème ?", r: "La lourdeur et la lenteur de la rédaction manuelle et de la correction des examens." },
    { q: "Pour quels utilisateurs ?", r: "Les enseignants universitaires et les étudiants de l'école (ENSIASD)." },
    { q: "Comment le résoudre ?", r: "Une plateforme automatisée couplant extraction PDF, IA Gemini et interface React intuitive." }
  ];

  recap.forEach((rc, i) => {
    const y = 4.55 + i * 0.55;
    s.addText([
      { text: `• ${rc.q} : `, options: { bold: true, color: "FBBF24", fontSize: 12 } },
      { text: rc.r, options: { color: C_WHITE, fontSize: 12 } }
    ], {
      x: 2.5, y, w: 8.3, h: 0.45,
      fontFace: "Calibri"
    });
  });

  s.addText("EvalIA • Encadré par Pr. LAASEM BRAHIM • Année 2026-2027", {
    x: 1.0, y: 6.8, w: 11.33, h: 0.35,
    fontSize: 10, color: "64748B", align: "center", fontFace: "Calibri"
  });
}

// Enregistrement du fichier PowerPoint
const outputPath = path.join(__dirname, "..", "EvalIA_Presentation_MiniProjet.pptx");
pptx.writeFile({ fileName: outputPath })
  .then(fileName => {
    console.log("Presentation generated successfully: " + fileName);
  })
  .catch(err => {
    console.error("Error creating presentation: ", err);
  });
