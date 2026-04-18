export const FIM_CATEGORIES = [
  {
    label: '運動',
    groups: [
      {
        label: 'セルフケア',
        items: [
          { key: 'eating',        label: '食事' },
          { key: 'grooming',      label: '整容' },
          { key: 'bathing',       label: '清拭・入浴' },
          { key: 'dressingUpper', label: '更衣（上半身）' },
          { key: 'dressingLower', label: '更衣（下半身）' },
          { key: 'toileting',     label: 'トイレ動作' },
        ],
      },
      {
        label: '排泄コントロール',
        items: [
          { key: 'bladder', label: '排尿管理' },
          { key: 'bowel',   label: '排便管理' },
        ],
      },
      {
        label: '移乗',
        items: [
          { key: 'transferBedChair', label: '移乗：ベッド・椅子・車椅子' },
          { key: 'transferToilet',   label: '移乗：トイレ' },
          { key: 'transferTub',      label: '移乗：浴槽・シャワー' },
        ],
      },
      {
        label: '移動',
        items: [
          { key: 'locomotionWalk',   label: '移動：歩行・車椅子' },
          { key: 'locomotionStairs', label: '移動：階段' },
        ],
      },
    ],
  },
  {
    label: '認知',
    groups: [
      {
        label: 'コミュニケーション',
        items: [
          { key: 'comprehension', label: '理解' },
          { key: 'expression',    label: '表出' },
        ],
      },
      {
        label: '社会的認知',
        items: [
          { key: 'socialInteraction', label: '社会的交流' },
          { key: 'problemSolving',    label: '問題解決' },
          { key: 'memory',            label: '記憶' },
        ],
      },
    ],
  },
]

export const FIM_SCORE_OPTIONS = [
  { value: 7, label: '7 - 完全自立' },
  { value: 6, label: '6 - 修正自立' },
  { value: 5, label: '5 - 監視・準備' },
  { value: 4, label: '4 - 最小介助（75%以上）' },
  { value: 3, label: '3 - 中等度介助（50%以上）' },
  { value: 2, label: '2 - 最大介助（25%以上）' },
  { value: 1, label: '1 - 全介助（25%未満）' },
]

export const MOTOR_KEYS = [
  'eating', 'grooming', 'bathing', 'dressingUpper', 'dressingLower',
  'toileting', 'bladder', 'bowel', 'transferBedChair', 'transferToilet',
  'transferTub', 'locomotionWalk', 'locomotionStairs',
]

export const COGNITIVE_KEYS = [
  'comprehension', 'expression', 'socialInteraction', 'problemSolving', 'memory',
]

export const ALL_FIM_KEYS = [...MOTOR_KEYS, ...COGNITIVE_KEYS]

export function calcTotals(values: Record<string, number>) {
  const motorTotal    = MOTOR_KEYS.reduce((s, k)    => s + (values[k] || 0), 0)
  const cognitiveTotal = COGNITIVE_KEYS.reduce((s, k) => s + (values[k] || 0), 0)
  return { motorTotal, cognitiveTotal, totalFim: motorTotal + cognitiveTotal }
}

export function defaultFimValues(): Record<string, number> {
  return Object.fromEntries(ALL_FIM_KEYS.map((k) => [k, 1]))
}
