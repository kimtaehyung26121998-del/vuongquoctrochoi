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
  // Chỉ chuẩn hóa hai thẻ ảnh mascot đã thay có chủ đích; vẫn so sánh
  // nguyên vẹn mọi logic camera, timer và chấm điểm với bản gốc.
  current=current.replace('<img src="/assets/mascot/robot_guide.png" alt="Robot hướng dẫn" />','<img src="/assets/mascot/owl_happy.png" alt="Cú mèo giáo sư" />')
  current=current.replace('<img className="hero-owl" src="/assets/mascot/robot_cheer.png" alt="Robot cổ vũ" />','<img className="hero-owl" src="/assets/mascot/owl_cheer.png" alt="Cú mèo cổ vũ" />')
  assert.equal(current.replace(/\r\n/g,'\n').trim(),fs.readFileSync(reference,'utf8').replace(/\r\n/g,'\n').trim(),'Phòng luyện chỉ được thay nguồn câu hỏi và hai ảnh mascot')
}
