import {QUESTIONS,type Question} from '../../data/questions'
import {ARITHMETIC_BANK} from '../../data/arithmeticBank'

// Fallback questions share the arithmetic bank below 30.
export const BOSS_QUESTIONS:Question[]=[
  ...QUESTIONS.filter(question=>question.stage===3),
  ...ARITHMETIC_BANK.slice(12,18).map((question,index)=>({
    ...question,id:`boss${String(index+4).padStart(2,'0')}`,stage:3 as const,choices:{...question.choices},
  })),
]
