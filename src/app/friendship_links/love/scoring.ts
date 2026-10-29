export type Answers = Record<number, number>;
export type Score = { id: string; name: string; value: number; max: number; description: string; hue: string };
export type Mode = 'attachment' | 'love';
export const attachmentScales = [
  { id: 'secure', name: '安全依附', items: [2, 16, 19, 21, 23, 24], description: '较能接纳自己，也较能自在地接近他人、建立信任。', hue: '#75D6AE' },
  { id: 'anxious', name: '焦虑依附', items: [7, 9, 12, 13, 18, 20], description: '在意关系的回应，容易担心被拒绝或不被重视。', hue: '#F4AE8C' },
  { id: 'fearful', name: '逃避依附', items: [1, 4, 6, 11, 14, 15], description: '渴望连接，但也会担心过度亲近带来伤害。', hue: '#A5A8F6' },
  { id: 'dismissive', name: '排除依附', items: [3, 5, 8, 10, 17, 22], description: '重视独立与自主，倾向减少对他人的依赖。', hue: '#9AC8F7' },
] as const;
export const loveScales = [
  { id: 'ludus', name: '游移手段型', start: 1, description: '重视恋爱中的新鲜感，可能倾向以灵活策略应对关系。', hue: '#7ECF95' },
  { id: 'devotion', name: '执守奉献型', start: 6, description: '对感情十分执着，愿意包容与付出，也要照顾自己的边界。', hue: '#F7BD76' },
  { id: 'reserved', name: '悲观保留型', start: 11, description: '在亲密关系中保持自我保护，不轻易把全部寄托交出去。', hue: '#D2A176' },
  { id: 'passion', name: '真情投入型', start: 16, description: '强调彼此信任、热情、投入与分享的亲密品质。', hue: '#F1929B' },
  { id: 'marriage', name: '婚姻目的型', start: 21, description: '倾向将长期承诺、现实条件与家庭纳入恋爱考量。', hue: '#C39BDD' },
  { id: 'possessive', name: '担忧占有型', start: 26, description: '十分重视关系，可能伴随失去对方的担忧与不安。', hue: '#83C7E4' },
  { id: 'sensory', name: '肉体感官型', start: 31, description: '把身体亲密和感官互动视为重要的爱意表达方式。', hue: '#A5A0DE' },
  { id: 'romance', name: '浪漫表达型', start: 36, description: '在意语言、行动与惊喜的表达，也希望让彼此感到被珍视。', hue: '#B1A7F2' },
] as const;

export const itemScore = (questionNumber: number, value: number, mode: Mode): number => {
  if (!Number.isInteger(value) || value < 1 || value > 6) throw new Error('Answer must be 1..6');
  const reverseItems = mode === 'attachment' ? [13, 16] : [35, 36, 37, 39];
  return reverseItems.includes(questionNumber) ? 7 - value : value;
};

export function calculateScores(mode: Mode, answers: Answers): Score[] {
  const expected = mode === 'attachment' ? 24 : 40;
  for (let q = 1; q <= expected; q++) {
    if (!Number.isInteger(answers[q]) || answers[q] < 1 || answers[q] > 6) {
      throw new Error(`Question ${q} is missing or invalid`);
    }
  }
  if (mode === 'attachment') {
    return attachmentScales.map((s) => ({
      id: s.id, name: s.name, value: s.items.reduce((sum, q) => sum + itemScore(q, answers[q], mode), 0),
      max: 36, description: s.description, hue: s.hue,
    }));
  }
  return loveScales.map((s) => ({
    id: s.id, name: s.name, value: [0, 1, 2, 3, 4].reduce((sum, offset) => sum + itemScore(s.start + offset, answers[s.start + offset], mode), 0),
    max: 30, description: s.description, hue: s.hue,
  }));
}
