import type {Choice,Question,StageIndex} from './questions'

export type ArithmeticOperator='+'|'−'
export interface ArithmeticQuestion extends Omit<Question,'stage'> {
  left:number;right:number;operator:ArithmeticOperator
}
const LETTERS:Choice[]=['A','B','C','D']
const ADDITIONS:readonly [number,number][]=[
  [14,15],[12,13],[11,14],[13,16],[15,12],
  [10,18],[21,7],[22,6],[23,5],[24,4],
  [25,3],[26,2],[27,1],[20,9],[11,8],
  [12,7],[13,6],[14,5],[15,4],[16,3],
  [17,2],[18,1],[4,5],[3,6],[2,7],
]
const SUBTRACTIONS:readonly [number,number][]=[
  [29,14],[25,12],[28,16],[27,13],[26,15],
  [29,7],[28,6],[27,5],[26,4],[25,3],
  [24,2],[23,1],[22,2],[21,1],[20,10],
  [19,8],[18,7],[17,6],[16,5],[15,4],
  [14,3],[13,2],[12,1],[9,5],[8,6],
]

export function isAllowedCalculation(left:number,right:number,operator:ArithmeticOperator):boolean{
  if(!Number.isInteger(left)||!Number.isInteger(right)||left<0||right<0||left>=30||right>=30)return false
  const unitsLeft=left%10,unitsRight=right%10
  const tensLeft=Math.floor(left/10),tensRight=Math.floor(right/10)
  if(operator==='+')return unitsLeft+unitsRight<10&&left+right<30
  if(operator==='−')return unitsLeft>=unitsRight&&tensLeft>=tensRight
  return false
}

function makeQuestion(left:number,right:number,operator:ArithmeticOperator,index:number):ArithmeticQuestion{
  if(!isAllowedCalculation(left,right,operator))throw new Error('Ngân hàng chỉ nhận cộng không nhớ, trừ không mượn')
  const result=operator==='+'?left+right:left-right
  const wrong=[result-1,result+1,result-10,result+10,result-2,result+2].filter(n=>n>=0&&n<30&&n!==result).slice(0,3)
  const answer=LETTERS[index%4]!
  let wrongIndex=0
  const choices=Object.fromEntries(LETTERS.map(letter=>[letter,String(letter===answer?result:wrong[wrongIndex++])])) as Record<Choice,string>
  const units=operator==='+'?left%10+right%10:left%10-right%10
  const tens=operator==='+'?Math.floor(left/10)+Math.floor(right/10):Math.floor(left/10)-Math.floor(right/10)
  return {id:`calc${String(index+1).padStart(2,'0')}`,left,right,operator,
    prompt:`${left} ${operator} ${right} = ?`,choices,answer,
    explanation:`Hàng đơn vị: ${left%10} ${operator} ${right%10} = ${units}. Hàng chục: ${Math.floor(left/10)} ${operator} ${Math.floor(right/10)} = ${tens}. Vậy ${left} ${operator} ${right} = ${result}.`}
}

export const ARITHMETIC_BANK:readonly ArithmeticQuestion[]=[
  ...ADDITIONS.map(([left,right],index)=>makeQuestion(left,right,'+',index)),
  ...SUBTRACTIONS.map(([left,right],index)=>makeQuestion(left,right,'−',index+25)),
]

function shuffle<T>(items:readonly T[],random:()=>number):T[]{
  const copy=[...items]
  for(let index=copy.length-1;index>0;index--){
    const other=Math.floor(random()*(index+1))
    ;[copy[index],copy[other]]=[copy[other]!,copy[index]!]
  }
  return copy
}

// Bộ bài giữ ở App: camera/render/retry không rút lại hoặc đổi nội dung câu.
export function createQuestionDeck(random:()=>number=Math.random){
  let remaining:ArithmeticQuestion[]=[]
  return {
    draw(stage:StageIndex,count:number):Question[]{
      if(!Number.isInteger(count)||count<1||count>ARITHMETIC_BANK.length)throw new Error('Số câu rút không hợp lệ')
      const selected:Question[]=[]
      const ids=new Set<string>()
      const deferred:ArithmeticQuestion[]=[]
      while(selected.length<count){
        if(!remaining.length)remaining=shuffle(ARITHMETIC_BANK,random)
        const question=remaining.pop()!
        if(ids.has(question.id)){deferred.push(question);continue}
        ids.add(question.id)
        selected.push({...question,stage,choices:{...question.choices}})
      }
      remaining.unshift(...deferred) // Hoãn câu trùng tới cuối vòng mới, không bỏ mất câu.
      return selected
    },
  }
}
