/**
 * Bornes du §7 appliquées au rendu des FAQ.
 *
 * Relevé du 2026-09-25 : 1 057 réponses tenaient en 12 à 39 mots et 45
 * dépassaient 90. Une réponse de trente mots est lisible, mais trop courte pour
 * être retenue par un moteur comme la réponse à la question, et elle laisse le
 * lecteur sans le chiffre qu'il était venu chercher.
 *
 * Les compléments sont des faits de la page — taux de l'État, base imposable,
 * montant du salaire traité — jamais du remplissage, et un fait dont le chiffre
 * figure déjà dans la réponse est sauté, faute de quoi la réponse se répète.
 */
export interface FAQ {
  question: string;
  answer: string;
}

const mots = (texte: string) => texte.split(/\s+/).filter(Boolean).length;

function nombresDe(phrase: string): string[] {
  return phrase.match(/[\d.,]*\d/g) ?? [];
}

export function etofferFaq(
  faqs: FAQ[],
  faits: string[],
  { mini = 40, maxi = 90, plafond = 8 } = {},
): FAQ[] {
  return faqs.slice(0, plafond).map((faq, i) => {
    let texte = faq.answer.trim();
    // Chaque réponse commence par le fait qui lui correspond, puis prend les
    // suivants : deux réponses d'une même page ne portent donc pas la même phrase.
    const ordre = [...faits.slice(i), ...faits.slice(0, i)];
    for (const phrase of ordre) {
      if (mots(texte) >= mini) break;
      const nombres = nombresDe(phrase);
      if (nombres.length && nombres.every((n) => texte.includes(n))) continue;
      if (phrase.slice(0, 30) && texte.includes(phrase.slice(0, 30))) continue;
      if (mots(`${texte} ${phrase}`) > maxi) continue;
      texte = `${texte} ${phrase}`;
    }
    if (mots(texte) > maxi) {
      const phrases = texte.match(/[^.!?]+[.!?]*/g) ?? [texte];
      let garde = "";
      for (const ph of phrases) {
        if (garde && mots(garde + ph) > maxi) break;
        garde += ph;
      }
      const coupee = garde.trim();
      if (mots(coupee) >= mini) texte = coupee;
    }
    return { ...faq, answer: texte };
  });
}
