import fs from 'node:fs'
import assert from 'node:assert/strict'
export function assertCameraCoreUnchanged(reference){
  let current=fs.readFileSync('src/ai/usePoseCamera.ts','utf8')
  // Chỉ cho phép sửa vòng đời mở cửa sổ đã có test RAF hồi quy riêng.
  current=current.replace('useEffect,useLayoutEffect,useRef','useEffect,useRef')
  current=current.replace('const enabledRef=useRef(enabled)','const enabledRef=useRef(enabled);enabledRef.current=enabled')
  current=current.replace('const autoArmRef=useRef(autoArmOnEnable)','const autoArmRef=useRef(autoArmOnEnable);autoArmRef.current=autoArmOnEnable')
  current=current.replace(/  \/\/ Đặt lại cửa sổ ngay khi commit,[\s\S]*?    autoArmRef.current=autoArmOnEnable\r?\n/,'  // Mỗi lần vào pha trả lời mở khóa lượt mới (không cần tư thế NGHỈ).\n  useEffect(()=>{\n')
  current=current.replace(',onConfirmed?:(event:Confirmed)=>void','')
  current=current.replace(/^  const confirmedHandler=useRef\(onConfirmed\)\r?\n  useLayoutEffect\(\(\)=>\{confirmedHandler.current=onConfirmed\},\[onConfirmed\]\)\r?\n/m,'')
  current=current.replace(/            if\(state.confirmed && state.confirmed!=='NEUTRAL' && state.confirmed!=='UNKNOWN'\)\{\r?\n              const event=\{pose:state.confirmed,id:\+\+confirmationSequence.current\}\r?\n              \/\/ Chuyển thẳng[^\n]*\r?\n              confirmedHandler.current\?\.\(event\)\r?\n              setConfirmed\(event\)\r?\n            \}/,"            if(state.confirmed && state.confirmed!=='NEUTRAL' && state.confirmed!=='UNKNOWN')\n              setConfirmed({pose:state.confirmed,id:++confirmationSequence.current})")
  current=current.replace("import {CameraDiagnosticsProbe,type CameraDiagnostics} from './cameraDiagnostics'\n",'')
  current=current.replace('autoArmOnEnable=false,debugEnabled=false','autoArmOnEnable=false')
  current=current.replace(/  const debugRef=useRef\(debugEnabled\);[\s\S]*?(?=  const lastUI=useRef\(0\))/,'')
  current=current.replace(/^    setNeedsNeutral\(false\)\r?\n/gm,'')
  current=current.replace(/^    setNeedsNeutral\(false\);setDiagnostics\(null\);probe.current=new CameraDiagnosticsProbe\(\)\r?\n/gm,'')
  current=current.replace(/            const sample=probe.current.sample\([^\n]*\)\r?\n            if\(debugRef.current[\s\S]*?            \}\r?\n/,'')
  current=current.replace(/^              setNeedsNeutral\(sample.waitingForNeutral\)\r?\n/gm,'')
  current=current.replace(',needsNeutral,diagnostics','')
  assert.equal(current.replace(/\r\n/g,'\n').trim(),fs.readFileSync(reference,'utf8').replace(/\r\n/g,'\n').trim(),'Phần MediaPipe/stabilizer của hook đã bị thay đổi ngoài instrumentation')
}
export function beforeSharedCamera(forest){
  return forest.replace("import {useAnswerCamera} from './ai/useAnswerCamera'\nimport CameraDebug from './ai/CameraDebug'", "import {usePoseCamera} from './ai/usePoseCamera'")
    .replace('const camera=useAnswerCamera(answering)','const camera=usePoseCamera(answering,answering)')
    .replace('<div className="answer-hold-fill" style={{transform:`scaleX(${camera.progress})`}}/>','<div style={{width:`${camera.progress*100}%`}}/>')
    .replace("{camera.needsNeutral?'Hạ hai tay nghỉ 0,5 giây để chọn lại cùng chữ.':camera.message}",'{camera.message}')
    .replace(/^        <CameraDebug camera=\{camera\} phase=\{state.paused\?'paused':state.phase\}\/\>\r?\n/m,'')
}
