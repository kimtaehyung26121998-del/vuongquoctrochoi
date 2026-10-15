import {useState} from 'react'
import {usePoseCamera,type Confirmed} from './usePoseCamera'
// Chính sách đã hoạt động ở màn Rừng: mở lượt ngay; stabilizer gốc vẫn chặn
// lặp cùng chữ chưa thả và yêu cầu nghỉ 500ms khi cần. Không có timer xác nhận thứ hai.
export function useAnswerCamera(answering:boolean,onAnswer?:(event:Confirmed)=>void){
  const [debugEnabled,setDebugEnabled]=useState(false)
  return {...usePoseCamera(answering,answering,debugEnabled,onAnswer),debugEnabled,setDebugEnabled}
}
