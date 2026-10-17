import {ARITHMETIC_BANK} from './arithmeticBank'

export type Choice = 'A' | 'B' | 'C' | 'D'
export type StageIndex = 0 | 1 | 2 | 3
export interface Question {
  id: string
  stage: StageIndex
  prompt: string
  choices: Record<Choice, string>
  answer: Choice
  explanation: string
}

export const STAGES = [
  { name: 'Rừng phép tính', asset: '/assets/backgrounds/01_forest.png', gem: '/assets/items/crystal_blue.png' },
  { name: 'Cầu vồng thử thách', asset: '/assets/backgrounds/02_rainbow.png', gem: '/assets/items/crystal_pink.png' },
  { name: 'Đảo kho báu', asset: '/assets/backgrounds/03_island.png', gem: '/assets/items/crystal_yellow.png' },
  { name: 'Lâu đài Boss', asset: '/assets/backgrounds/04_castle.png', gem: '/assets/items/crystal_green.png' },
] as const

export const QUESTIONS: Question[] = ARITHMETIC_BANK.slice(0,12).map((question,index)=>({
  ...question,id:`q${String(index+1).padStart(2,'0')}`,stage:Math.floor(index/3) as StageIndex,choices:{...question.choices},
}))
