// Какая иллюстрация подходит блюду или заготовке: по разделу, группе и словам в названии.
const RULES = [
  ['jar', a => a.sec === 'K'],
  ['dumplings', a => /пельмен|варени(?!е)/i.test(a.title)],
  ['soup', a => a.group === 'soup'],
  ['pancakes', a => /блин|оладь|драник|сырник/i.test(a.title)],
  ['fish', a => /рыб|скумбр|лосос|треск[аиу](?![а-яё])|^уха/i.test(a.title)],
  ['chicken', a => /кур(иц|ин)|крылыш/i.test(a.title)],
  ['pasta', a => /паст|макарон|лапш|лазань|карбонар|спагет/i.test(a.title)],
  ['eggs', a => /яйц|яичн|омлет|болтун|шакшук/i.test(a.title)],
  ['dairy', a => /йогурт|творог|творож|ленив/i.test(a.title)],
  ['cake', a => /торт|кекс|печень|шарлот|наполеон/i.test(a.title)],
  ['bake', a => a.group === 'dough'],
  ['salad', a => /салат|оливье|винегрет|цезар|окрошк/i.test(a.title)],
  ['sauce', a => /соус|бешамель/i.test(a.title)],
  ['grain', a => a.group === 'sides'],
  ['meat', a => a.group === 'meat'],
  ['veg', a => a.group === 'veg'],
];

/** Вид иллюстрации для статьи или null (у научных статей картинок нет) */
export function dishArt(a) {
  if (a.sec !== 'I' && a.sec !== 'K') return null;
  for (const [kind, test] of RULES) if (test(a)) return kind;
  return 'grain';
}

export const ART_KINDS = RULES.map(r => r[0]);
