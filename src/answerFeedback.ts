interface AnswerFeedbackInput {
  userAnswer: string;
  correctAnswer: string;
  categoryId: string;
  tenseId: string;
  subjectId: string;
  subjectIndex: number;
}

const REGULAR_ENDINGS: Record<string, Record<string, string[]>> = {
  'reg-er': {
    'présent': ['e', 'es', 'e', 'e', 'e', 'ons', 'ez', 'ent', 'ent'],
  },
  'reg-ir': {
    'présent': ['is', 'is', 'it', 'it', 'it', 'issons', 'issez', 'issent', 'issent'],
  },
  'reg-re': {
    'présent': ['s', 's', '', '', '', 'ons', 'ez', 'ent', 'ent'],
  },
};

const SHARED_ENDINGS: Record<string, string[]> = {
  'imparfait': ['ais', 'ais', 'ait', 'ait', 'ait', 'ions', 'iez', 'aient', 'aient'],
  'futur': ['ai', 'as', 'a', 'a', 'a', 'ons', 'ez', 'ont', 'ont'],
  'futur du passé': ['ais', 'ais', 'ait', 'ait', 'ait', 'ions', 'iez', 'aient', 'aient'],
};

function normalize(value: string) {
  return value.trim().toLocaleLowerCase('fr').replace(/[’]/g, "'").replace(/\s+/g, ' ');
}

function withoutDiacritics(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function lettersOnly(value: string) {
  return withoutDiacritics(value).replace(/[\s']/g, '');
}

function editDistance(left: string, right: string) {
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);

  for (let leftIndex = 1; leftIndex <= left.length; leftIndex++) {
    let diagonal = previous[0];
    previous[0] = leftIndex;

    for (let rightIndex = 1; rightIndex <= right.length; rightIndex++) {
      const above = previous[rightIndex];
      previous[rightIndex] = Math.min(
        previous[rightIndex] + 1,
        previous[rightIndex - 1] + 1,
        diagonal + (left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1),
      );
      diagonal = above;
    }
  }

  return previous[right.length];
}

function getRegularEnding(categoryId: string, tenseId: string, subjectIndex: number) {
  return REGULAR_ENDINGS[categoryId]?.[tenseId]?.[subjectIndex]
    ?? SHARED_ENDINGS[tenseId]?.[subjectIndex]
    ?? null;
}

export function analyzeAnswer(input: AnswerFeedbackInput) {
  const user = normalize(input.userAnswer);
  const correct = normalize(input.correctAnswer);

  if (lettersOnly(user) === lettersOnly(correct)) {
    return 'Je antwoord klinkt goed. Controleer het accent, de apostrof en de spaties.';
  }

  const userWords = user.split(' ');
  const correctWords = correct.split(' ');

  if (input.tenseId === 'passé composé' && correctWords.length >= 2 && userWords.length === correctWords.length) {
    const correctParticiple = correctWords.at(-1)!;
    const userParticiple = userWords.at(-1)!;
    const correctAuxiliary = correctWords.slice(0, -1).join(' ');
    const userAuxiliary = userWords.slice(0, -1).join(' ');

    if (userAuxiliary === correctAuxiliary && userParticiple !== correctParticiple) {
      return 'Het hulpwerkwoord klopt. Controleer het voltooid deelwoord.';
    }
    if (userAuxiliary !== correctAuxiliary && userParticiple === correctParticiple) {
      return 'Het voltooid deelwoord klopt. Controleer het hulpwerkwoord en de persoon.';
    }
  }

  if (userWords[0] !== correctWords[0] && userWords.at(-1) === correctWords.at(-1)) {
    return 'De werkwoordsvorm klopt. Controleer het Franse onderwerp.';
  }

  const regularEnding = getRegularEnding(input.categoryId, input.tenseId, input.subjectIndex);
  if (regularEnding !== null && userWords.length === correctWords.length) {
    const correctVerb = correctWords.at(-1)!;
    const userVerb = userWords.at(-1)!;
    const stem = regularEnding ? correctVerb.slice(0, -regularEnding.length) : correctVerb;

    if (stem && userVerb.startsWith(stem) && userVerb !== correctVerb) {
      return `De stam klopt. Controleer de uitgang voor ${input.subjectId} in de ${input.tenseId}.`;
    }
    if (regularEnding && userVerb.endsWith(regularEnding) && userVerb !== correctVerb) {
      return 'De uitgang lijkt te kloppen. Controleer de stam van het werkwoord.';
    }
  }

  const distance = editDistance(lettersOnly(user), lettersOnly(correct));
  if (distance <= 2) {
    return 'Je bent dichtbij. Controleer de spelling nog een keer.';
  }

  return 'Controleer het werkwoord, de persoon en de gekozen tijd.';
}
