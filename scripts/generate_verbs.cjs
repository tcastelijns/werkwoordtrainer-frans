
const fs = require('fs');

const verbGroups = [
  { id: "reg-er", label: "Regelmatige werkwoorden op -er" },
  { id: "reg-re", label: "Regelmatige werkwoorden op -re" },
  { id: "reg-ir", label: "Regelmatige werkwoorden op -ir" },
  { id: "reflexive", label: "Wederkerende werkwoorden" },
  { id: "irregular", label: "Onregelmatige werkwoorden" }
];

const tenses = [
  { id: "présent", label: "Présent" },
  { id: "passé composé", label: "Passé composé" },
  { id: "imparfait", label: "Imparfait" },
  { id: "futur", label: "Futur" },
  { id: "futur du passé", label: "Futur du passé" }
];

const subjects = [
  { id: "je", label: "je" },
  { id: "tu", label: "tu" },
  { id: "il", label: "il" },
  { id: "elle", label: "elle" },
  { id: "on", label: "on" },
  { id: "nous", label: "nous" },
  { id: "vous", label: "vous" },
  { id: "ils", label: "ils" },
  { id: "elles", label: "elles" }
];

const verbsList = [
  { id: "danser", infinitive: "danser", translation: "dansen", group: "er", categoryId: "reg-er" },
  { id: "aimer", infinitive: "aimer", translation: "houden van", group: "er", categoryId: "reg-er" },
  { id: "regarder", infinitive: "regarder", translation: "kijken", group: "er", categoryId: "reg-er" },
  { id: "parler", infinitive: "parler", translation: "spreken", group: "er", categoryId: "reg-er" },
  { id: "écouter", infinitive: "écouter", translation: "luisteren", group: "er", categoryId: "reg-er" },
  { id: "donner", infinitive: "donner", translation: "geven", group: "er", categoryId: "reg-er" },
  { id: "attendre", infinitive: "attendre", translation: "wachten", group: "re", categoryId: "reg-re" },
  { id: "répondre", infinitive: "répondre", translation: "antwoorden", group: "re", categoryId: "reg-re" },
  { id: "perdre", infinitive: "perdre", translation: "verliezen", group: "re", categoryId: "reg-re" },
  { id: "vendre", infinitive: "vendre", translation: "verkopen", group: "re", categoryId: "reg-re" },
  { id: "entendre", infinitive: "entendre", translation: "horen", group: "re", categoryId: "reg-re" },
  { id: "descendre", infinitive: "descendre", translation: "afdalen", group: "re", categoryId: "reg-re", aux: "être" },
  { id: "rendre", infinitive: "rendre", translation: "teruggeven", group: "re", categoryId: "reg-re" },
  { id: "réagir", infinitive: "réagir", translation: "reageren", group: "ir", categoryId: "reg-ir" },
  { id: "choisir", infinitive: "choisir", translation: "kiezen", group: "ir", categoryId: "reg-ir" },
  { id: "grandir", infinitive: "grandir", translation: "groeien", group: "ir", categoryId: "reg-ir" },
  { id: "finir", infinitive: "finir", translation: "eindigen", group: "ir", categoryId: "reg-ir" },
  { id: "vomir", infinitive: "vomir", translation: "overgeven", group: "ir", categoryId: "reg-ir" },
  { id: "grossir", infinitive: "grossir", translation: "dikker worden", group: "ir", categoryId: "reg-ir" },
  { id: "guérir", infinitive: "guérir", translation: "genezen", group: "ir", categoryId: "reg-ir" },
  { id: "rougir", infinitive: "rougir", translation: "blozen", group: "ir", categoryId: "reg-ir" },
  { id: "se laver", infinitive: "se laver", translation: "zich wassen", group: "refl-er", categoryId: "reflexive" },
  { id: "se coucher", infinitive: "se coucher", translation: "gaan slapen", group: "refl-er", categoryId: "reflexive" },
  { id: "se lever", infinitive: "se lever", translation: "opstaan", group: "refl-er", categoryId: "reflexive" },
  { id: "se doucher", infinitive: "se doucher", translation: "douchen", group: "refl-er", categoryId: "reflexive" },
  { id: "s'appeler", infinitive: "s'appeler", translation: "heten", group: "refl-er", categoryId: "reflexive" },
  { id: "s'amuser", infinitive: "s'amuser", translation: "zich vermaken", group: "refl-er", categoryId: "reflexive" },
  { id: "se promener", infinitive: "se promener", translation: "wandelen", group: "refl-er", categoryId: "reflexive" },
  { id: "se bruler", infinitive: "se bruler", translation: "zich branden", group: "refl-er", categoryId: "reflexive" },
  { id: "se tromper", infinitive: "se tromper", translation: "zich vergissen", group: "refl-er", categoryId: "reflexive" },
  { id: "se concentrer", infinitive: "se concentrer", translation: "zich concentreren", group: "refl-er", categoryId: "reflexive" },
  { id: "se dépêcher", infinitive: "se dépêcher", translation: "zich haasten", group: "refl-er", categoryId: "reflexive" },
  { id: "se présenter", infinitive: "se présenter", translation: "zich voorstellen", group: "refl-er", categoryId: "reflexive" },
  { id: "se maquiller", infinitive: "se maquiller", translation: "zich opmaken", group: "refl-er", categoryId: "reflexive" },
  { id: "s'habiller", infinitive: "s'habiller", translation: "zich aankleden", group: "refl-er", categoryId: "reflexive" },
  { id: "s'entrainer", infinitive: "s'entrainer", translation: "trainen", group: "refl-er", categoryId: "reflexive" },
  { id: "s'arrêter", infinitive: "s'arrêter", translation: "stoppen", group: "refl-er", categoryId: "reflexive" },
  { id: "se moquer de", infinitive: "se moquer de", translation: "iemand uitlachen", group: "refl-er", categoryId: "reflexive" },
  { id: "se sentir", infinitive: "se sentir", translation: "zich voelen", group: "refl-ir-sentir", categoryId: "reflexive" },
  { id: "se faire mal", infinitive: "se faire mal", translation: "zich pijn doen", group: "refl-irreg-faire", categoryId: "reflexive" },
  { id: "aller", infinitive: "aller", translation: "gaan", group: "irreg", aux: "être", categoryId: "irregular" },
  { id: "avoir", infinitive: "avoir", translation: "hebben", group: "irreg", categoryId: "irregular" },
  { id: "connaitre", infinitive: "connaitre", translation: "kennen", group: "irreg", categoryId: "irregular" },
  { id: "reconnaitre", infinitive: "reconnaitre", translation: "herkennen", group: "irreg", categoryId: "irregular" },
  { id: "disparaitre", infinitive: "disparaitre", translation: "verdwijnen", group: "irreg", categoryId: "irregular" },
  { id: "devoir", infinitive: "devoir", translation: "moeten", group: "irreg", categoryId: "irregular" },
  { id: "écrire", infinitive: "écrire", translation: "schrijven", group: "irreg", categoryId: "irregular" },
  { id: "décrire", infinitive: "décrire", translation: "beschrijven", group: "irreg", categoryId: "irregular" },
  { id: "s'inscrire", infinitive: "s'inscrire", translation: "zich inschrijven", group: "refl-irreg-ecrire", categoryId: "irregular" },
  { id: "être", infinitive: "être", translation: "zijn", group: "irreg", categoryId: "irregular" },
  { id: "faire", infinitive: "faire", translation: "doen/maken", group: "irreg", categoryId: "irregular" },
  { id: "mettre", infinitive: "mettre", translation: "zetten/leggen", group: "irreg", categoryId: "irregular" },
  { id: "partir", infinitive: "partir", translation: "vertrekken", group: "irreg", aux: "être", categoryId: "irregular" },
  { id: "pouvoir", infinitive: "pouvoir", translation: "kunnen", group: "irreg", categoryId: "irregular" },
  { id: "prendre", infinitive: "prendre", translation: "nemen", group: "irreg", categoryId: "irregular" },
  { id: "apprendre", infinitive: "apprendre", translation: "leren", group: "irreg", categoryId: "irregular" },
  { id: "comprendre", infinitive: "comprendre", translation: "begrijpen", group: "irreg", categoryId: "irregular" },
  { id: "recevoir", infinitive: "recevoir", translation: "ontvangen", group: "irreg", categoryId: "irregular" },
  { id: "savoir", infinitive: "savoir", translation: "weten", group: "irreg", categoryId: "irregular" },
  { id: "sortir", infinitive: "sortir", translation: "uitgaan", group: "irreg", aux: "être", categoryId: "irregular" },
  { id: "venir", infinitive: "venir", translation: "komen", group: "irreg", aux: "être", categoryId: "irregular" },
  { id: "voir", infinitive: "voir", translation: "zien", group: "irreg", categoryId: "irregular" },
  { id: "vouloir", infinitive: "vouloir", translation: "willen", group: "irreg", categoryId: "irregular" }
];

const irregularData = {
  "être": {
    "présent": ["suis", "es", "est", "est", "est", "sommes", "êtes", "sont", "sont"],
    "participle": "été",
    "futur_stem": "ser",
    "imparfait_stem": "ét"
  },
  "avoir": {
    "présent": ["ai", "as", "a", "a", "a", "avons", "avez", "ont", "ont"],
    "participle": "eu",
    "futur_stem": "aur",
    "imparfait_stem": "av"
  },
  "aller": {
    "présent": ["vais", "vas", "va", "va", "va", "allons", "allez", "vont", "vont"],
    "participle": "allé",
    "futur_stem": "ir",
    "imparfait_stem": "all"
  },
  "faire": {
    "présent": ["fais", "fais", "fait", "fait", "fait", "faisons", "faites", "font", "font"],
    "participle": "fait",
    "futur_stem": "fer",
    "imparfait_stem": "fais"
  },
  "pouvoir": {
    "présent": ["peux", "peux", "peut", "peut", "peut", "pouvons", "pouvez", "peuvent", "peuvent"],
    "participle": "pu",
    "futur_stem": "pourr",
    "imparfait_stem": "pouv"
  },
  "vouloir": {
    "présent": ["veux", "veux", "veut", "veut", "veut", "voulons", "voulez", "veulent", "veulent"],
    "participle": "voulu",
    "futur_stem": "voudr",
    "imparfait_stem": "voul"
  },
  "savoir": {
    "présent": ["sais", "sais", "sait", "sait", "sait", "savons", "savez", "savent", "savent"],
    "participle": "su",
    "futur_stem": "saur",
    "imparfait_stem": "sav"
  },
  "devoir": {
    "présent": ["dois", "dois", "doit", "doit", "doit", "devons", "devez", "doivent", "doivent"],
    "participle": "dû",
    "futur_stem": "devr",
    "imparfait_stem": "dev"
  },
  "prendre": {
    "présent": ["prends", "prends", "prend", "prend", "prend", "prenons", "prenez", "prennent", "prennent"],
    "participle": "pris",
    "futur_stem": "prendr",
    "imparfait_stem": "pren"
  },
  "apprendre": {
    "présent": ["apprends", "apprends", "apprend", "apprend", "apprend", "apprenons", "apprenez", "apprennent", "apprennent"],
    "participle": "appris",
    "futur_stem": "apprendr",
    "imparfait_stem": "appren"
  },
  "comprendre": {
    "présent": ["comprends", "comprends", "comprend", "comprend", "comprend", "comprenons", "comprenez", "comprennent", "comprennent"],
    "participle": "compris",
    "futur_stem": "comprendr",
    "imparfait_stem": "compren"
  },
  "mettre": {
    "présent": ["mets", "mets", "met", "met", "met", "mettons", "mettez", "mettent", "mettent"],
    "participle": "mis",
    "futur_stem": "mettr",
    "imparfait_stem": "mett"
  },
  "venir": {
    "présent": ["viens", "viens", "vient", "vient", "vient", "venons", "venez", "viennent", "viennent"],
    "participle": "venu",
    "futur_stem": "viendr",
    "imparfait_stem": "ven"
  },
  "partir": {
    "présent": ["pars", "pars", "part", "part", "part", "partons", "partez", "partent", "partent"],
    "participle": "parti",
    "futur_stem": "partir",
    "imparfait_stem": "part"
  },
  "sortir": {
    "présent": ["sors", "sors", "sort", "sort", "sort", "sortons", "sortez", "sortent", "sortent"],
    "participle": "sorti",
    "futur_stem": "sortir",
    "imparfait_stem": "sort"
  },
  "voir": {
    "présent": ["vois", "vois", "voit", "voit", "voit", "voyons", "voyez", "voient", "voient"],
    "participle": "vu",
    "futur_stem": "verr",
    "imparfait_stem": "voy"
  },
  "recevoir": {
    "présent": ["reçois", "reçois", "reçoit", "reçoit", "reçoit", "recevons", "recevez", "reçoivent", "reçoivent"],
    "participle": "reçu",
    "futur_stem": "recevr",
    "imparfait_stem": "recev"
  },
  "écrire": {
    "présent": ["écris", "écris", "écrit", "écrit", "écrit", "écrivons", "écrivez", "écrivent", "écrivent"],
    "participle": "écrit",
    "futur_stem": "écrir",
    "imparfait_stem": "écriv"
  },
  "décrire": {
    "présent": ["décris", "décris", "décrit", "décrit", "décrit", "décrivons", "décrivez", "décrivent", "décrivent"],
    "participle": "décrit",
    "futur_stem": "décrir",
    "imparfait_stem": "décriv"
  },
  "connaitre": {
    "présent": ["connais", "connais", "connait", "connait", "connait", "connaissons", "connaissez", "connaissent", "connaissent"],
    "participle": "connu",
    "futur_stem": "connaitr",
    "imparfait_stem": "connaiss"
  },
  "reconnaitre": {
    "présent": ["reconnais", "reconnais", "reconnait", "reconnait", "reconnait", "reconnaissons", "reconnaissez", "reconnaissent", "reconnaissent"],
    "participle": "reconnu",
    "futur_stem": "reconnaitr",
    "imparfait_stem": "reconnaiss"
  },
  "disparaitre": {
    "présent": ["disparais", "disparais", "disparait", "disparait", "disparait", "disparaissons", "disparaissez", "disparaissent", "disparaissent"],
    "participle": "disparu",
    "futur_stem": "disparaitr",
    "imparfait_stem": "disparaiss"
  }
};

const dutchManualConjugations = {
  "zich wassen": {
    "présent": { "je": "ik was me", "tu": "jij wast je", "il": "hij wast zich", "elle": "zij (v.) wast zich", "on": "men wast zich", "nous": "wij wassen ons", "vous": "jullie wassen je", "ils": "zij (m.) wassen zich", "elles": "zij (v.) wassen zich" },
    "imparfait": { "je": "ik waste me", "tu": "jij waste je", "il": "hij waste zich", "elle": "zij (v.) waste zich", "on": "men waste zich", "nous": "wij wasten ons", "vous": "jullie wasten je", "ils": "zij (m.) wasten zich", "elles": "zij (v.) wasten zich" }
  },
  "zich vermaken": { "présent": { "je": "ik vermaak me", "tu": "jij vermaakt je", "il": "hij vermaakt zich", "elle": "zij (v.) vermaakt zich", "on": "men vermaakt zich", "nous": "wij vermaken ons", "vous": "jullie vermaken je", "ils": "zij (m.) vermaken zich", "elles": "zij (v.) vermaken zich" } },
  "zich pijn doen": { "présent": { "je": "ik doe me pijn", "tu": "jij doet je pijn", "il": "hij doet zich pijn", "elle": "zij (v.) doet zich pijn", "on": "men doet zich pijn", "nous": "wij doen ons pijn", "vous": "jullie doen je pijn", "ils": "zij (m.) doen zich pijn", "elles": "zij (v.) doen zich pijn" } },
  "iemand uitlachen": { "présent": { "je": "ik lach iemand uit", "tu": "jij lacht iemand uit", "il": "hij lacht iemand uit", "elle": "zij (v.) lacht iemand uit", "on": "men lacht iemand uit", "nous": "wij lachen iemand uit", "vous": "jullie lachen iemand uit", "ils": "zij (m.) lachen iemand uit", "elles": "zij (v.) lachen iemand uit" } },
  "gaan slapen": { "présent": { "je": "ik ga slapen", "tu": "jij gaat slapen", "il": "hij gaat slapen", "elle": "zij (v.) gaat slapen", "on": "men gaat slapen", "nous": "wij gaan slapen", "vous": "jullie gaan slapen", "ils": "zij (m.) gaan slapen", "elles": "zij (v.) gaan slapen" } },
  "opstaan": { "présent": { "je": "ik sta op", "tu": "jij staat op", "il": "hij staat op", "elle": "zij (v.) staat op", "on": "men staat op", "nous": "wij staan op", "vous": "jullie staan op", "ils": "zij (m.) staan op", "elles": "zij (v.) staan op" } },
  "douchen": { "présent": { "je": "ik douche", "tu": "jij doucht", "il": "hij doucht", "elle": "zij (v.) doucht", "on": "men doucht", "nous": "wij douchen", "vous": "jullie douchen", "ils": "zij (m.) douchen", "elles": "zij (v.) douchen" } },
  "heten": { "présent": { "je": "ik heet", "tu": "jij heet", "il": "hij heet", "elle": "zij (v.) heet", "on": "men heet", "nous": "wij heten", "vous": "jullie heten", "ils": "zij (m.) heten", "elles": "zij (v.) heten" } },
  "wandelen": { "présent": { "je": "ik wandel", "tu": "jij wandelt", "il": "hij wandelt", "elle": "zij (v.) wandelt", "on": "men wandelt", "nous": "wij wandelen", "vous": "jullie wandelen", "ils": "zij (m.) wandelen", "elles": "zij (v.) wandelen" } },
  "zich branden": { "présent": { "je": "ik brand me", "tu": "jij brandt je", "il": "hij brandt zich", "elle": "zij (v.) brandt zich", "on": "men brandt zich", "nous": "wij branden ons", "vous": "jullie branden je", "ils": "zij (m.) branden zich", "elles": "zij (v.) branden zich" } },
  "zich vergissen": { "présent": { "je": "ik vergis me", "tu": "jij vergist je", "il": "hij vergist zich", "elle": "zij (v.) vergist zich", "on": "men vergist zich", "nous": "wij vergissen ons", "vous": "jullie vergissen je", "ils": "zij (m.) vergissen zich", "elles": "zij (v.) vergissen zich" } },
  "zich concentreren": { "présent": { "je": "ik concentreer me", "tu": "jij concentreert je", "il": "hij concentreert zich", "elle": "zij (v.) concentreert zich", "on": "men concentreert zich", "nous": "wij concentren ons", "vous": "jullie concentreren je", "ils": "zij (m.) concentreren zich", "elles": "zij (v.) concentreren zich" } },
  "zich haasten": { "présent": { "je": "ik haast me", "tu": "jij haast je", "il": "hij haast zich", "elle": "zij (v.) haast zich", "on": "men haast zich", "nous": "wij haasten ons", "vous": "jullie haasten je", "ils": "zij (m.) haasten zich", "elles": "zij (v.) haasten zich" } },
  "zich voorstellen": { "présent": { "je": "ik stel me voor", "tu": "jij stelt je voor", "il": "hij stelt zich voor", "elle": "zij (v.) stelt zich voor", "on": "men stelt zich voor", "nous": "wij stellen ons voor", "vous": "jullie stellen je voor", "ils": "zij (m.) stellen zich voor", "elles": "zij (v.) stellen zich voor" } },
  "zich opmaken": { "présent": { "je": "ik maak me op", "tu": "jij maakt je op", "il": "hij maakt zich op", "elle": "zij (v.) maakt zich op", "on": "men maakt zich op", "nous": "wij maken ons op", "vous": "jullie maken je op", "ils": "zij (m.) maken zich op", "elles": "zij (v.) maken zich op" } },
  "zich aankleden": { "présent": { "je": "ik kleed me aan", "tu": "jij kleedt je aan", "il": "hij kleedt zich aan", "elle": "zij (v.) kleedt zich aan", "on": "men kleedt zich aan", "nous": "wij kleden ons aan", "vous": "jullie kleden je aan", "ils": "zij (m.) kleden zich aan", "elles": "zij (v.) kleden zich aan" } },
  "trainen": { "présent": { "je": "ik train", "tu": "jij traint", "il": "hij traint", "elle": "zij (v.) traint", "on": "men traint", "nous": "wij trainen", "vous": "jullie trainen", "ils": "zij (m.) trainen", "elles": "zij (v.) trainen" } },
  "stoppen": { "présent": { "je": "ik stop", "tu": "jij stopt", "il": "hij stopt", "elle": "zij (v.) stopt", "on": "men stopt", "nous": "wij stoppen", "vous": "jullie stoppen", "ils": "zij (m.) stoppen", "elles": "zij (v.) stoppen" } },
  "zich voelen": { "présent": { "je": "ik voel me", "tu": "jij voelt je", "il": "hij voelt zich", "elle": "zij (v.) voelt zich", "on": "men voelt zich", "nous": "wij voelen ons", "vous": "jullie voelen je", "ils": "zij (m.) voelen zich", "elles": "zij (v.) voelen zich" } },
  "zich inschrijven": { "présent": { "je": "ik schrijf me in", "tu": "jij schrijft je in", "il": "hij schrijft zich in", "elle": "zij (v.) schrijft zich in", "on": "men schrijft zich in", "nous": "wij schrijven ons in", "vous": "jullie schrijven je in", "ils": "zij (m.) schrijven zich in", "elles": "zij (v.) schrijven zich in" } },
  "blozen": { "présent": { "je": "ik bloos", "tu": "jij bloost", "il": "hij bloost", "elle": "zij (v.) bloost", "on": "men bloost", "nous": "wij blozen", "vous": "jullie blozen", "ils": "zij (m.) blozen", "elles": "zij (v.) blozen" } }
};

// --- Logic Ported from App.tsx ---

function getFrenchConjugation(verbId, subjectId, tenseId) {
  const verb = verbsList.find(v => v.id === verbId);
  if (!verb) return "";

  const isIrregular = verb.categoryId === 'irregular';
  const isReflexive = verb.categoryId === 'reflexive';
  const group = verb.group;
  const inf = verb.infinitive;

  const getRefl = (subId) => {
    if (subId === 'je') return "me ";
    if (subId === 'tu') return "te ";
    if (subId === 'nous') return "nous ";
    if (subId === 'vous') return "vous ";
    return "se ";
  };

  const getAux = (v, subId) => {
    const isEtre = v.aux === 'être' || v.categoryId === 'reflexive';
    if (isEtre) {
      if (subId === 'je') return "suis";
      if (subId === 'tu') return "es";
      if (['il', 'elle', 'on'].includes(subId)) return "est";
      if (subId === 'nous') return "sommes";
      if (subId === 'vous') return "êtes";
      return "sont";
    } else {
      if (subId === 'je') return "ai";
      if (subId === 'tu') return "as";
      if (['il', 'elle', 'on'].includes(subId)) return "a";
      if (subId === 'nous') return "avons";
      if (subId === 'vous') return "avez";
      return "ont";
    }
  };

  const getParticiple = (v) => {
    if (irregularData[v.id]?.participle) return irregularData[v.id].participle;
    const cleanInf = v.infinitive.replace(/^s'|^se /, '');
    if (cleanInf.endsWith('er')) return cleanInf.slice(0, -2) + 'é';
    if (cleanInf.endsWith('ir')) return cleanInf.slice(0, -2) + 'i';
    if (cleanInf.endsWith('re')) return cleanInf.slice(0, -2) + 'u';
    return cleanInf;
  };

  const getEnding = (g, subId, tId) => {
    if (tId === 'présent') {
      if (g === 'er' || g === 'refl-er') {
        if (subId === 'je') return "e";
        if (subId === 'tu') return "es";
        if (['il', 'elle', 'on'].includes(subId)) return "e";
        if (subId === 'nous') return "ons";
        if (subId === 'vous') return "ez";
        return "ent";
      }
      if (g === 'ir') {
        if (subId === 'je') return "is";
        if (subId === 'tu') return "is";
        if (['il', 'elle', 'on'].includes(subId)) return "it";
        if (subId === 'nous') return "issons";
        if (subId === 'vous') return "issez";
        return "issent";
      }
      if (g === 're') {
        if (subId === 'je') return "s";
        if (subId === 'tu') return "s";
        if (['il', 'elle', 'on'].includes(subId)) return "";
        if (subId === 'nous') return "ons";
        if (subId === 'vous') return "ez";
        return "ent";
      }
      if (g === 'refl-ir-sentir') {
        if (subId === 'je') return "s";
        if (subId === 'tu') return "s";
        if (['il', 'elle', 'on'].includes(subId)) return "t";
        if (subId === 'nous') return "tons";
        if (subId === 'vous') return "tez";
        return "tent";
      }
    }
    if (tId === 'imparfait') {
      if (subId === 'je') return "ais";
      if (subId === 'tu') return "ais";
      if (['il', 'elle', 'on'].includes(subId)) return "ait";
      if (subId === 'nous') return "ions";
      if (subId === 'vous') return "iez";
      return "aient";
    }
    if (tId === 'futur') {
      if (subId === 'je') return "ai";
      if (subId === 'tu') return "as";
      if (['il', 'elle', 'on'].includes(subId)) return "a";
      if (subId === 'nous') return "ons";
      if (subId === 'vous') return "ez";
      return "ont";
    }
    if (tId === 'futur du passé') {
      if (subId === 'je') return "ais";
      if (subId === 'tu') return "ais";
      if (['il', 'elle', 'on'].includes(subId)) return "ait";
      if (subId === 'nous') return "ions";
      if (subId === 'vous') return "iez";
      return "aient";
    }
    return "";
  };

  const sub = subjects.find(s => s.id === subjectId).label;
  const refl = isReflexive ? getRefl(subjectId) : "";
  const cleanInf = inf.replace(/^s'|^se /, '');
  const stem = cleanInf.endsWith('er') ? cleanInf.slice(0, -2) : (cleanInf.endsWith('ir') ? cleanInf.slice(0, -2) : cleanInf.slice(0, -2));

  if (tenseId === 'présent') {
    if (isIrregular && irregularData[verbId]?.présent) {
      const idx = subjects.findIndex(s => s.id === subjectId);
      return `${sub} ${refl}${irregularData[verbId].présent[idx]}`;
    }
    return `${sub} ${refl}${stem}${getEnding(group, subjectId, tenseId)}`;
  }

  if (tenseId === 'passé composé') {
    const aux = getAux(verb, subjectId);
    let part = getParticiple(verb);
    const isEtre = verb.aux === 'être' || verb.categoryId === 'reflexive';
    if (isEtre) {
      if (['nous', 'vous', 'ils', 'elles'].includes(subjectId)) {
        if (subjectId === 'elles') part += 'es';
        else if (['ils', 'nous', 'vous'].includes(subjectId)) part += 's';
      }
    }
    return `${sub} ${refl}${aux} ${part}`;
  }

  if (tenseId === 'imparfait') {
    let impStem = stem;
    if (group === 'ir') impStem += 'iss';
    if (group === 'refl-ir-sentir') impStem = impStem.slice(0, -1) + 't';
    if (isIrregular && irregularData[verbId]?.imparfait_stem) impStem = irregularData[verbId].imparfait_stem;
    return `${sub} ${refl}${impStem}${getEnding(group, subjectId, tenseId)}`;
  }

  if (tenseId === 'futur') {
    let futStem = inf.replace(/^s'|^se /, '');
    if (futStem.endsWith('re')) futStem = futStem.slice(0, -1);
    if (isIrregular && irregularData[verbId]?.futur_stem) futStem = irregularData[verbId].futur_stem;
    return `${sub} ${refl}${futStem}${getEnding(group, subjectId, tenseId)}`;
  }

  if (tenseId === 'futur du passé') {
    let futStem = inf.replace(/^s'|^se /, '');
    if (futStem.endsWith('re')) futStem = futStem.slice(0, -1);
    if (isIrregular && irregularData[verbId]?.futur_stem) futStem = irregularData[verbId].futur_stem;
    return `${sub} ${refl}${futStem}${getEnding(group, subjectId, tenseId)}`;
  }

  return "";
}

function getDutchPrompt(verbId, subjectId, tenseId) {
  const verb = verbsList.find(v => v.id === verbId);
  if (!verb) return "";
  const inf = verb.translation;

  const getStem = (v) => {
    let cleanV = v.replace(/^zich /, '');
    if (cleanV.endsWith('en')) {
      let s = cleanV.slice(0, -2);
      if (cleanV === 'komen') return 'kom';
      const match = s.match(/^(.*)([aeiou])([bcdfghjklmnpqrstvwxyz])$/);
      if (match) {
        const [_, prefix, vowel, consonant] = match;
        const isSingleVowel = !prefix.endsWith(vowel) && !/[aeiou]/.test(prefix.slice(-1));
        const cleanPrefix = prefix.replace(/^(ver|be|ge|her|ont)/, '');
        const isClosedSyllable = cleanPrefix.length >= 2 && !/[aeiou]/.test(cleanPrefix.slice(-1)) && !/[aeiou]/.test(cleanPrefix.slice(-2, -1)) && /[aeiou]/.test(cleanPrefix);
        const isUnstressedE = vowel === 'e' && (cleanV.endsWith('elen') || cleanV.endsWith('eren') || cleanV.endsWith('enen'));
        if (isSingleVowel && !isClosedSyllable && !isUnstressedE) {
          s = prefix + vowel + vowel + consonant;
        }
      }
      if (s.endsWith('v')) s = s.slice(0, -1) + 'f';
      if (s.endsWith('z')) s = s.slice(0, -1) + 's';
      if (s.length > 1 && s.slice(-1) === s.slice(-2, -1) && !/[aeiou]/.test(s.slice(-1))) {
        s = s.slice(0, -1);
      }
      return s;
    }
    return cleanV;
  };

  const getDutchPastParticiple = (v) => {
    const irregulars = {
      'hebben': 'gehad', 'zijn': 'geweest', 'gaan': 'gegaan', 'doen': 'gedaan', 'kunnen': 'gekund', 'willen': 'gewild', 'weten': 'geweten', 'moeten': 'gemoeten', 'komen': 'gekomen', 'zien': 'gezien', 'nemen': 'genomen', 'leren': 'geleerd', 'begrijpen': 'begrepen', 'schrijven': 'geschreven', 'beschrijven': 'beschreven', 'verkopen': 'verkocht', 'antwoorden': 'geantwoord', 'wachten': 'gewacht', 'horen': 'gehoord', 'kijken': 'gekeken', 'spreken': 'gesproken', 'luisteren': 'geluisterd', 'geven': 'gegeven', 'vinden': 'gevonden', 'denken': 'gedacht', 'zeggen': 'gezegd', 'worden': 'geworden', 'houden van': 'gehouden van', 'verliezen': 'verloren', 'kennen': 'gekend', 'herkennen': 'herkend', 'verdwijnen': 'verdwenen', 'ontvangen': 'ontvangen', 'afdalen': 'afgedaald', 'teruggeven': 'teruggegeven', 'doen/maken': 'gedaan/gemaakt', 'zetten/leggen': 'gezet/gelegd', 'dikker worden': 'dikker geworden', 'zich wassen': 'zich gewassen', 'gaan slapen': 'gaan slapen', 'opstaan': 'opgestaan', 'zich vermaken': 'zich vermaakt', 'zich vergissen': 'zich vergist', 'zich haasten': 'zich gehaast', 'zich voorstellen': 'zich voorgesteld', 'zich opmaken': 'zich opgemaakt', 'zich aankleden': 'zich aangekleed', 'zich inschrijven': 'zich ingeschreven', 'zich voelen': 'zich gevoeld', 'zich pijn doen': 'zich pijn gedaan', 'vertrekken': 'vertrokken', 'uitgaan': 'uitgegaan', 'overgeven': 'overgegeven', 'stoppen': 'gestopt', 'reageren': 'gereageerd', 'kiezen': 'gekozen', 'groeien': 'gegroeid', 'eindigen': 'geëindigd', 'genezen': 'genezen', 'blozen': 'gebloosd', 'trainen': 'getraind', 'wandelen': 'gewandeld', 'douchen': 'gedoucht', 'heten': 'geheten', 'zich concentreren': 'zich geconcentreerd', 'iemand uitlachen': 'iemand uitgelachen', 'zich branden': 'zich gebrand'
    };
    if (irregulars[v]) return irregulars[v];
    const s = getStem(v);
    const infinitiveStem = v.endsWith('en') ? v.slice(0, -2) : v;
    const originalLastChar = infinitiveStem.slice(-1);
    const suffix = 'tkfschp'.includes(originalLastChar) ? 't' : 'd';
    const hasPrefix = /^(be|ge|her|ont|ver)/.test(v);
    return `${hasPrefix ? "" : "ge"}${s}${suffix}`;
  };

  const getDutchRefl = (subId) => {
    if (subId === 'je') return "me";
    if (subId === 'tu') return "je";
    if (subId === 'nous') return "ons";
    if (subId === 'vous') return "je";
    return "zich";
  };

  const sub = subjects.find(s => s.id === subjectId).label;
  const stem = getStem(inf);

  if (dutchManualConjugations[inf] && dutchManualConjugations[inf][tenseId]) {
    return dutchManualConjugations[inf][tenseId][subjectId];
  }

  if (tenseId === 'présent') {
    const irregulars = {
      'zijn': { 'je': 'ben', 'tu': 'bent', 'il': 'is', 'elle': 'is', 'on': 'is', 'nous': 'zijn', 'vous': 'zijn', 'ils': 'zijn', 'elles': 'zijn' },
      'hebben': { 'je': 'heb', 'tu': 'hebt', 'il': 'heeft', 'elle': 'heeft', 'on': 'heeft', 'nous': 'hebben', 'vous': 'hebben', 'ils': 'hebben', 'elles': 'hebben' },
      'kunnen': { 'je': 'kan', 'tu': 'kunt', 'il': 'kan', 'elle': 'kan', 'on': 'kan', 'nous': 'kunnen', 'vous': 'kunnen', 'ils': 'kunnen', 'elles': 'kunnen' },
      'willen': { 'je': 'wil', 'tu': 'wilt', 'il': 'wil', 'elle': 'wil', 'on': 'wil', 'nous': 'willen', 'vous': 'willen', 'ils': 'willen', 'elles': 'willen' },
      'mogen': { 'je': 'mag', 'tu': 'mag', 'il': 'mag', 'elle': 'mag', 'on': 'mag', 'nous': 'mogen', 'vous': 'mogen', 'ils': 'mogen', 'elles': 'mogen' },
      'gaan': { 'je': 'ga', 'tu': 'gaat', 'il': 'gaat', 'elle': 'gaat', 'on': 'gaat', 'nous': 'gaan', 'vous': 'gaan', 'ils': 'gaan', 'elles': 'gaan' },
      'doen': { 'je': 'doe', 'tu': 'doet', 'il': 'doet', 'elle': 'doet', 'on': 'doet', 'nous': 'doen', 'vous': 'doen', 'ils': 'doen', 'elles': 'doen' },
      'staan': { 'je': 'sta', 'tu': 'staat', 'il': 'staat', 'elle': 'staat', 'on': 'staat', 'nous': 'staan', 'vous': 'staan', 'ils': 'staan', 'elles': 'staan' }
    };
    if (irregulars[inf]) return `${sub} ${irregulars[inf][subjectId]}`;
    let s = stem;
    if (['ga', 'sta'].includes(s)) s = s + s.slice(-1);
    const isRefl = inf.startsWith('zich ');
    const refl = isRefl ? " " + getDutchRefl(subjectId) : "";
    const cleanInf = isRefl ? inf.replace('zich ', '') : inf;
    if (subjectId === 'je') return `ik ${stem}${refl}`;
    if (subjectId === 'tu') return `jij ${s.endsWith('t') ? s : s + 't'}${refl}`;
    if (['il', 'elle', 'on'].includes(subjectId)) return `${sub} ${s.endsWith('t') ? s : s + 't'}${refl}`;
    return `${sub} ${cleanInf}${refl}`;
  }

  if (tenseId === 'passé composé') {
    const movementVerbs = ['gaan', 'komen', 'vertrekken', 'uitgaan', 'afdalen', 'opstaan', 'worden', 'dikker worden', 'verdwijnen', 'gaan slapen', 'stoppen', 'zijn'];
    const usesDutchZijn = movementVerbs.includes(inf) || verb.aux === 'être';
    const aux = usesDutchZijn 
      ? (['nous', 'vous', 'ils', 'elles'].includes(subjectId) ? 'zijn' : (subjectId === 'je' ? 'ben' : (subjectId === 'tu' ? 'bent' : 'is')))
      : (['nous', 'vous', 'ils', 'elles'].includes(subjectId) ? 'hebben' : (subjectId === 'je' ? 'heb' : (subjectId === 'tu' ? 'hebt' : 'heeft')));
    const isRefl = inf.startsWith('zich ');
    const refl = isRefl ? getDutchRefl(subjectId) + " " : "";
    const participle = getDutchPastParticiple(inf);
    return `${sub} ${aux} ${refl}${isRefl ? participle.replace('zich ', '') : participle}`;
  }

  if (tenseId === 'futur') {
    const aux = ['nous', 'vous', 'ils', 'elles'].includes(subjectId) ? 'zullen' : 'zal';
    const isRefl = inf.startsWith('zich ');
    const refl = isRefl ? getDutchRefl(subjectId) + " " : "";
    return `${sub} ${aux} ${refl}${isRefl ? inf.replace('zich ', '') : inf}`;
  }

  if (tenseId === 'imparfait') {
    const irregulars = {
      'gaan': ['ging', 'gingen'], 'zijn': ['was', 'waren'], 'hebben': ['had', 'hadden'], 'doen': ['deed', 'deden'], 'kunnen': ['kon', 'konden'], 'willen': ['wilde', 'wilden'], 'weten': ['wist', 'wisten'], 'moeten': ['moest', 'moesten'], 'komen': ['kwam', 'kwamen'], 'zien': ['zag', 'zagen'], 'nemen': ['nam', 'namen'], 'leren': ['leerde', 'leerden'], 'begrijpen': ['begreep', 'begrepen'], 'schrijven': ['schreef', 'schreven'], 'beschrijven': ['beschreef', 'beschreven'], 'verkopen': ['verkocht', 'verkochten'], 'antwoorden': ['antwoordde', 'antwoordden'], 'wachten': ['wachtte', 'wachtten'], 'horen': ['hoorde', 'hoorden'], 'kijken': ['keek', 'keken'], 'spreken': ['sprak', 'spraken'], 'luisteren': ['luisterde', 'luisterden'], 'geven': ['gaf', 'gaven'], 'vinden': ['vond', 'vonden'], 'denken': ['dacht', 'dachten'], 'zeggen': ['zei', 'zeiden'], 'worden': ['werd', 'werden'], 'houden van': ['hield van', 'hielden van'], 'verliezen': ['verloor', 'verloren'], 'afdalen': ['daalde af', 'daalden af'], 'teruggeven': ['gaf terug', 'gaven terug'], 'doen/maken': ['deed/maakte', 'deden/maakten'], 'zetten/leggen': ['zette/legde', 'zetten/legden'], 'dikker worden': ['werd dikker', 'werden dikker'], 'zich wassen': ['waste zich', 'wasten zich'], 'gaan slapen': ['ging slapen', 'gingen slapen'], 'opstaan': ['stond op', 'stonden op'], 'zich vermaken': ['vermaakte zich', 'vermaakten zich'], 'zich vergissen': ['vergiste zich', 'vergisten zich'], 'zich haasten': ['haastte zich', 'haastten zich'], 'zich voorstellen': ['stelde zich voor', 'stelden zich voor'], 'zich opmaken': ['maakte zich op', 'maakten zich op'], 'zich aankleden': ['kleedde zich aan', 'kleedden zich aan'], 'zich inschrijven': ['schreef zich in', 'schreven zich in'], 'zich voelen': ['voelde zich', 'voelden zich'], 'zich pijn doen': ['deed zich pijn', 'deden zich pijn'], 'vertrekken': ['vertrok', 'vertrokken'], 'uitgaan': ['ging uit', 'gingen uit'], 'overgeven': ['gaf over', 'gaven over'], 'stoppen': ['stopte', 'stopten'], 'reageren': ['reageerde', 'reageerden'], 'kiezen': ['koos', 'kozen'], 'groeien': ['groeide', 'groeiden'], 'eindigen': ['eindigde', 'eindigden'], 'genezen': ['genas', 'genazen'], 'blozen': ['bloosde', 'bloosden'], 'trainen': ['trainde', 'trainden'], 'wandelen': ['wandelde', 'wandelden'], 'douchen': ['douchte', 'douchten'], 'heten': ['heette', 'heetten'], 'zich concentreren': ['concentreerde zich', 'concentreerden zich'], 'iemand uitlachen': ['lachte iemand uit', 'lachten iemand uit'], 'zich branden': ['brandde zich', 'brandden zich']
    };
    const isPlural = ['nous', 'vous', 'ils', 'elles'].includes(subjectId);
    if (irregulars[inf]) {
      let form = irregulars[inf][isPlural ? 1 : 0];
      if (inf.startsWith('zich ')) form = form.replace('zich', getDutchRefl(subjectId));
      return `${sub} ${form}`;
    }
    const isRefl = inf.startsWith('zich ');
    const refl = isRefl ? " " + getDutchRefl(subjectId) : "";
    const cleanInf = isRefl ? inf.replace('zich ', '') : inf;
    const infinitiveStem = cleanInf.endsWith('en') ? cleanInf.slice(0, -2) : cleanInf;
    const originalLastChar = infinitiveStem.slice(-1);
    const s = getStem(cleanInf);
    const suffix = 'tkfschp'.includes(originalLastChar) ? (isPlural ? 'ten' : 'te') : (isPlural ? 'den' : 'de');
    return `${sub} ${s}${suffix}${refl}`;
  }

  if (tenseId === 'futur du passé') {
    const aux = ['nous', 'vous', 'ils', 'elles'].includes(subjectId) ? 'zouden' : 'zou';
    const isRefl = inf.startsWith('zich ');
    const refl = isRefl ? getDutchRefl(subjectId) + " " : "";
    return `${sub} ${aux} ${refl}${isRefl ? inf.replace('zich ', '') : inf}`;
  }

  return `${sub} (${inf})`;
}

// --- Generation ---

const finalVerbs = verbsList.map(verb => {
  const conjugations = {};
  tenses.forEach(tense => {
    conjugations[tense.id] = {
      french: subjects.map(subject => getFrenchConjugation(verb.id, subject.id, tense.id)),
      dutch: subjects.map(subject => getDutchPrompt(verb.id, subject.id, tense.id))
    };
  });
  return { ...verb, conjugations };
});

const output = {
  verbGroups,
  tenses,
  subjects,
  verbsList: finalVerbs
};

fs.writeFileSync('src/data/verbs.json', JSON.stringify(output, null, 2));
console.log('verbs.json generated successfully!');
