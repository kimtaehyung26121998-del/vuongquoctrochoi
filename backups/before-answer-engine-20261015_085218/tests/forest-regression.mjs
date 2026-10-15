import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import ts from 'typescript'

const root=process.cwd()
const cached=new Map()
function loadUrl(relative){
  const file=path.resolve(root,relative)
  if(cached.has(file))return cached.get(file)
  let output=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext,jsx:ts.JsxEmit.ReactJSX}}).outputText
  output=output.replace(/^(import[^\n]*?\sfrom\s+|import\s*)(['"])([^'"]+)\2/gm,(all,prefix,quote,spec)=>{
    let url
    if(spec.startsWith('.')){
      let target=path.resolve(path.dirname(file),spec)
      if(!path.extname(target))target+=fs.existsSync(target+'.ts')?'.ts':'.tsx'
      url=loadUrl(target)
    }else url=import.meta.resolve(spec)
    return `${prefix}${quote}${url}${quote}`
  })
  const url='data:text/javascript;base64,'+Buffer.from(output).toString('base64')
  cached.set(file,url)
  return url
}
const {forestReducer:reduce,initialForest,FOREST_QUESTIONS}=await import(loadUrl('src/forestState.ts'))
const {QUESTIONS}=await import(loadUrl('src/data/questions.ts'))
assert.equal(QUESTIONS.length,12)
assert.equal(QUESTIONS.map(q=>q.answer).join(''),'ABCDABCDABCD')
assert.equal(FOREST_QUESTIONS.length,3)
assert.deepEqual(FOREST_QUESTIONS.map(q=>q.id),['q01','q02','q03'])
let s={...initialForest}
assert.equal(reduce(s,{type:'ANSWER',answer:'A',source:'webcam'}),s)
s=reduce(s,{type:'START'})
assert.equal(s.phase,'thinking')
assert.equal(reduce(s,{type:'ANSWER',answer:'A',source:'webcam'}),s)
s=reduce(s,{type:'READY'})
s=reduce(s,{type:'PAUSE'})
assert.equal(reduce(s,{type:'ANSWER',answer:'A',source:'webcam'}),s)
assert.equal(reduce(s,{type:'ADVANCE'}),s)
s=reduce(s,{type:'PAUSE'})
s=reduce(s,{type:'ANSWER',answer:'D',source:'webcam'})
assert.equal(s.score,0);assert.equal(s.built,0);assert.equal(s.phase,'feedback')
assert.equal(reduce(s,{type:'ADVANCE'}),s)
s=reduce(s,{type:'RETRY'})
assert.equal(s.phase,'thinking');assert.equal(s.index,0)
s=reduce(s,{type:'READY'})
for(const q of FOREST_QUESTIONS){
  s=reduce(s,{type:'ANSWER',answer:q.answer,source:'manual'})
  assert.equal(s.phase,'feedback')
  const duplicate=reduce(s,{type:'ANSWER',answer:q.answer,source:'webcam'})
  assert.equal(duplicate,s,'Webcam và click không được chấm trùng')
  const paused=reduce(s,{type:'PAUSE'})
  assert.equal(reduce(paused,{type:'ADVANCE'}),paused,'Pause khóa chuyển cảnh')
  s=reduce(s,{type:'ADVANCE'});assert.equal(s.phase,'next')
  s=reduce(s,{type:'ADVANCE'})
  if(s.phase!=='finish')s=reduce(s,{type:'READY'})
}
assert.equal(s.phase,'finish');assert.equal(s.built,3);assert.equal(s.score,30)
assert.equal(s.attempts,4);assert.equal(s.firstTry,2)
assert.equal(reduce(s,{type:'ANSWER',answer:'A',source:'webcam'}),s)
s=reduce(s,{type:'REPLAY'})
assert.equal(s.phase,'thinking');assert.equal(s.score,0);assert.equal(s.built,0)

const {PoseStabilizer}=await import(loadUrl('src/ai/stabilizer.ts'))
const stabilizer=new PoseStabilizer()
stabilizer.reset(true)
assert.equal(stabilizer.update('A',100,true).confirmed,null)
assert.equal(stabilizer.update('A',1099,true).confirmed,null)
assert.equal(stabilizer.update('A',1100,true).confirmed,'A')
assert.equal(stabilizer.update('A',2200,true).confirmed,null)
stabilizer.reset(true)
assert.equal(stabilizer.update('A',2300,true).blockedRepeat,true)
assert.equal(stabilizer.update('A',3500,true).confirmed,null)
stabilizer.update('NEUTRAL',3600,false)
stabilizer.update('NEUTRAL',4100,false)
stabilizer.reset(true)
stabilizer.update('A',4200,true)
assert.equal(stabilizer.update('A',5200,true).confirmed,'A')
stabilizer.reset(true)
stabilizer.update('B',5300,false)
assert.equal(stabilizer.update('B',6400,false).confirmed,null,'Không chốt trong hoạt hình/thinking')

// Camera chọn nhầm phải được hủy độc lập với lỗi toán, không làm mất đúng lần đầu.
let correction=reduce(reduce(reduce(initialForest,{type:'START'}),{type:'READY'}),{type:'ANSWER',answer:'B',source:'webcam'})
correction=reduce(correction,{type:'RECOGNITION_RETRY'})
assert.equal(correction.attempts,0);assert.equal(correction.cameraCorrections,1)
correction=reduce(reduce(correction,{type:'READY'}),{type:'ANSWER',answer:'A',source:'manual'})
assert.equal(correction.firstTry,1);assert.equal(correction.score,10)
let manualWrong=reduce(reduce(reduce(initialForest,{type:'START'}),{type:'READY'}),{type:'ANSWER',answer:'B',source:'manual'})
assert.equal(reduce(manualWrong,{type:'RECOGNITION_RETRY'}),manualWrong)
const {classifyPose}=await import(loadUrl('src/ai/poseClassifier.ts'))
function landmarks(overrides={}){
  const points=Array.from({length:33},()=>({x:.5,y:.5,visibility:1,presence:1}))
  const base={0:[.5,.2],11:[.4,.35],12:[.6,.35],13:[.4,.5],14:[.6,.5],15:[.4,.76],16:[.6,.76],23:[.43,.65],24:[.57,.65]}
  for(const [id,[x,y]] of Object.entries({...base,...overrides}))points[id]={x,y,visibility:1,presence:1}
  return points
}
assert.equal(classifyPose(landmarks({13:[.32,.25],14:[.68,.25],15:[.48,.15],16:[.52,.15]})).pose,'A')
assert.equal(classifyPose(landmarks({13:[.28,.42],14:[.72,.42],15:[.36,.32],16:[.64,.32]})).pose,'B')
assert.equal(classifyPose(landmarks({0:[.65,.2],11:[.55,.35],12:[.75,.35],13:[.35,.4],14:[.82,.45],15:[.45,.15],16:[.8,.6]})).pose,'C')
assert.equal(classifyPose(landmarks({13:[.28,.5],14:[.72,.5],15:[.43,.65],16:[.57,.65]})).pose,'D')
assert.equal(classifyPose(landmarks()).pose,'NEUTRAL')
assert.equal(classifyPose(undefined).pose,'UNKNOWN')
console.log('PASS: phân biệt lỗi webcam/lỗi toán; classifier A/B/C/D/nghỉ trên khớp tổng hợp.')
const backup='backups/before-forest-20261015_082708'
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')
for(const relative of ['src/ai/usePoseCamera.ts','src/ai/poseClassifier.ts','src/ai/stabilizer.ts','src/data/questions.ts']){
  assert.equal(hash(relative),hash(path.join(backup,relative)),`${relative} phải giữ nguyên`)
}
assert.equal(hash('src/LegacyApp.tsx'),hash(path.join(backup,'src/App.tsx')),'Bản 12 câu phải giống từng byte')
const source=fs.readFileSync('src/ForestAdventure.tsx','utf8')+fs.readFileSync('src/forest.css','utf8')
for(const asset of source.matchAll(/(?:src=|src:)?["'](\/(?:assets|audio)\/[^'"`]+)["']/g))assert.ok(fs.existsSync('public'+asset[1]),asset[1])
for(const letter of ['a','b','c','d'])assert.ok(fs.existsSync(`public/assets/characters/pose_${letter}.png`))
console.log('PASS: 3 câu, retry, pause, chặn chấm trùng, 3 đoạn cầu, tổng kết, replay.')
console.log('PASS: stabilizer 1000ms, chống lặp, nghỉ 500ms, khóa xác nhận ngoài answering.')
console.log('PASS: AI + bộ 12 câu + LegacyApp giữ nguyên từng byte so với sao lưu; asset tồn tại.')

// Render HTML ban đầu để kiểm tra component có thể gắn với hook hiện có.
const React=await import('react')
const {renderToStaticMarkup}=await import('react-dom/server')
const {default:ForestAdventure}=await import(loadUrl('src/ForestAdventure.tsx'))
const html=renderToStaticMarkup(React.createElement(ForestAdventure,{onExit:()=>{}}))
assert.ok(html.includes('Rừng phép tính'));assert.ok(html.includes('<video'));assert.ok(html.includes('<canvas'))
assert.ok(html.includes('Cùng Cú sửa cây cầu'))
console.log('PASS: render component màn rừng cùng phần tử video/canvas cố định.')
