/**
 * Titres et descriptions dans les bornes du §11.
 *
 * Les titres montaient à 122 caractères : Google tronque au-delà d'une soixantaine
 * et la fin ne sert à rien. Les noms de race allant de cinq à vingt-huit
 * caractères, un gabarit unique ne peut pas tenir la borne : on essaie plusieurs
 * formulations, de la plus informative à la plus courte, et l'on garde la première
 * qui tient. À défaut, on tronque sur un mot entier plutôt qu'au milieu.
 */
const MIN = 50;
const MAX = 60;

export function ajusterTitre(candidats: string[], min = MIN, max = MAX): string {
  for (const c of candidats) {
    if (c.length >= min && c.length <= max) return c;
  }
  // Aucun candidat dans les bornes : on prend le plus long qui ne dépasse pas,
  // puis on complète si c'est trop court, et l'on tronque en dernier recours.
  const tenables = candidats.filter((c) => c.length <= max);
  if (tenables.length) return tenables.sort((a, b) => b.length - a.length)[0];
  const plus_court = candidats.sort((a, b) => a.length - b.length)[0];
  const coupe = plus_court.slice(0, max);
  const espace = coupe.lastIndexOf(" ");
  return espace > min ? coupe.slice(0, espace) : coupe;
}

const MIN_D = 150;
const MAX_D = 160;

/**
 * Les compléments sont des phrases entières : sur un nom de race court, aucune ne
 * tient dans les quelques caractères qui manquent pour atteindre 150, et la
 * description restait à 146. On ajoute donc, après les phrases, des queues de plus
 * en plus courtes jusqu'à franchir le plancher.
 */
const QUEUES = [
  "Figures come from the published IRS, SSA and state revenue department rates.",
  "Rates are the published federal and state figures for the year.",
  "Based on the published federal and state rates.",
  "Updated with the current published rates.",
  "Published rates, updated yearly.",
  "Rates included.",
];

export function ajusterDescription(base: string, complements: string[] = []): string {
  let texte = base.trim();
  for (const c of [...complements, ...QUEUES]) {
    if (texte.length >= MIN_D) break;
    if (texte.includes(c.slice(0, 20))) continue;
    if (`${texte} ${c}`.length > MAX_D) continue;
    texte = `${texte} ${c}`;
  }
  // Toujours sous le plancher : on prend la phrase la plus courte qui le franchit
  // et l'on coupe sur un mot entier, plutôt que de laisser la borne en défaut.
  if (texte.length < MIN_D) {
    const rallonge = [...complements, ...QUEUES]
      .filter((c) => !texte.includes(c.slice(0, 20)))
      .sort((a, b) => a.length - b.length)[0];
    if (rallonge) texte = `${texte} ${rallonge}`;
  }
  if (texte.length <= MAX_D) return texte;
  // On réserve la place du point final, sinon la coupe ressortait à 161 caractères.
  const coupe = texte.slice(0, MAX_D - 1);
  const espace = coupe.lastIndexOf(" ");
  const court = espace >= MIN_D - 1 ? coupe.slice(0, espace) : coupe;
  return court.replace(/[,;:.\s]+$/, "") + ".";
}
