import assert from 'node:assert/strict'
import {loadUrl} from './load-module.mjs'
const {ARITHMETIC_BANK:bank,isAllowedCalculation,createQuestionDeck}=await import(loadUrl('src/data/arithmeticBank.ts'))
assert.equal(bank.length,50)
assert.equal(new Set(bank.map(q=>q.id)).size,50)
assert.equal(new Set(bank.map(q=>q.prompt)).size,50)
assert.equal(bank.filter(q=>q.operator==='+').length,25)
assert.equal(bank.filter(q=>q.operator==='−').length,25)
for(const q of bank){
  const {left:a,right:b,operator}=q
  // Kiểm tra theo từng chữ số, độc lập với hàm validator của ứng dụng.
  let left=a,right=b
  while(left||right){
    if(operator==='+')assert.ok(left%10+right%10<10,q.prompt)
    else assert.ok(left%10>=right%10,q.prompt)
    left=Math.floor(left/10);right=Math.floor(right/10)
  }
  const result=operator==='+'?a+b:a-b
  assert.ok(Number.isInteger(result)&&result>=0&&result<100)
  assert.equal(Number(q.choices[q.answer]),result)
  assert.equal(new Set(Object.values(q.choices)).size,4)
  assert.equal(Object.values(q.choices).filter(c=>Number(c)===result).length,1)
}
assert.equal(isAllowedCalculation(14,15,'+'),true)
assert.equal(isAllowedCalculation(14,16,'+'),false)
assert.equal(isAllowedCalculation(90,46,'−'),false)
assert.equal(isAllowedCalculation(35,12,'−'),true)
assert.equal(isAllowedCalculation(90,10,'+'),false,'Không tạo phép cộng tràn hàng trăm')
assert.equal(isAllowedCalculation(12,23,'−'),false,'Không tạo số âm')
function rng(seed){return ()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296}}
const deck=createQuestionDeck(rng(27))
const all=[...deck.draw(0,3),...deck.draw(1,3),...deck.draw(2,3),...deck.draw(3,9),...deck.draw(0,12),...deck.draw(0,20)]
assert.equal(new Set(all.map(q=>q.id)).size,50,'Cùng phiên không lặp cho đến khi hết bộ')
const next=deck.draw(3,9)
assert.equal(new Set(next.map(q=>q.id)).size,9)
assert.ok(next.every(q=>q.stage===3))
for(let seed=1;seed<=20;seed++){
  const a=createQuestionDeck(rng(seed)),b=createQuestionDeck(rng(seed+1))
  assert.notDeepEqual(a.draw(0,3).map(q=>q.id),b.draw(0,3).map(q=>q.id))
  // Rút qua ranh giới xáo lại vẫn không trùng trong bộ 12 câu.
  a.draw(0,45)
  const across=a.draw(1,12)
  assert.equal(new Set(across.map(q=>q.id)).size,12)
  const tail=a.draw(0,40)
  assert.equal(new Set([...across.slice(2),...tail].map(q=>q.id)).size,50,'Không làm rơi câu khi hoãn trùng ở đầu vòng mới')
}
const original=bank.map(q=>({...q,choices:{...q.choices}}))
next[0].choices.A='999'
assert.deepEqual(bank,original,'Bản câu hỏi rút ra không làm thay đổi ngân hàng gốc')
assert.throws(()=>deck.draw(0,51))
console.log('PASS: 50 câu/25 cộng/25 trừ không nhớ-không mượn, đáp án duy nhất chính xác; xáo/rút không trùng, tái xáo và giữ ngân hàng gốc.')
