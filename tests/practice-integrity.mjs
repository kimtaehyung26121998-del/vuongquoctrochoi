import fs from 'node:fs'
import assert from 'node:assert/strict'

// Cho phép thay nguồn câu hỏi; phần camera/timer/chấm điểm của phòng luyện giữ nguyên.
export function assertPracticeFlowUnchanged(reference){
  let current=fs.readFileSync('src/LegacyApp.tsx','utf8')
  current=current.replace(',type Question','')
  current=current.replace('export default function App({questionFactory}:{questionFactory?:()=>Question[]}={}){','export default function App(){')
  current=current.replace(/^  const \[questions,setQuestions\]=useState\(QUESTIONS\)\r?\n/m,'')
  current=current.replace(/^    if\(questionFactory\)setQuestions\(questionFactory\(\)\)\r?\n/m,'')
  current=current.replace(/\bquestions\b/g,'QUESTIONS')
  current=current.replace("'./data/QUESTIONS'","'./data/questions'")
  current=current.replace(',screen,QUESTIONS]',',screen]')
  current=current.replace(',muted,QUESTIONS.length]',',muted]')
  assert.equal(current.replace(/\r\n/g,'\n').trim(),fs.readFileSync(reference,'utf8').replace(/\r\n/g,'\n').trim(),'Phòng luyện chỉ được thay nguồn câu hỏi')
}
