import {useCallback,useEffect,useRef,useState} from 'react'
import {FilesetResolver,PoseLandmarker} from '@mediapipe/tasks-vision'
import {classifyPose,type Pose,type Landmark} from './poseClassifier'
import {PoseStabilizer} from './stabilizer'

const wasmUrl='https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/wasm'
const modelUrl='https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task'
const EDGES: [number,number][]=[[11,12],[11,13],[13,15],[12,14],[14,16],[11,23],[12,24],[23,24],[23,25],[24,26]]
export type Confirmed={pose:'A'|'B'|'C'|'D';id:number}
export type CameraStatus='idle'|'loading'|'running'|'error'

function drawSkeleton(canvas:HTMLCanvasElement,video:HTMLVideoElement,points:Landmark[]|undefined){
  const w=video.videoWidth,h=video.videoHeight
  if(!w||!h)return
  if(canvas.width!==w) canvas.width=w
  if(canvas.height!==h) canvas.height=h
  const cx=canvas.getContext('2d');if(!cx)return
  cx.clearRect(0,0,w,h)
  if(!points)return
  cx.save();cx.translate(w,0);cx.scale(-1,1)
  cx.lineCap='round';cx.lineJoin='round';cx.lineWidth=Math.max(3,w/150)
  cx.strokeStyle='#75f6cb'
  for(const [i,j] of EDGES){const a=points[i],b=points[j];if(!a||!b||(a.visibility??1)<.45||(b.visibility??1)<.45)continue
    cx.beginPath();cx.moveTo(a.x*w,a.y*h);cx.lineTo(b.x*w,b.y*h);cx.stroke()}
  cx.fillStyle='#ffcf56'
  for(const i of [11,12,13,14,15,16,23,24]){const p=points[i];if(!p||(p.visibility??1)<.45)continue
    cx.beginPath();cx.arc(p.x*w,p.y*h,Math.max(4,w/130),0,Math.PI*2);cx.fill()}
  cx.restore()
}

export function usePoseCamera(enabled:boolean, autoArmOnEnable=false){
  const videoRef=useRef<HTMLVideoElement>(null)
  const canvasRef=useRef<HTMLCanvasElement>(null)
  const landmarker=useRef<PoseLandmarker|null>(null)
  const stream=useRef<MediaStream|null>(null)
  const raf=useRef(0)
  const runId=useRef(0)
  const enabledRef=useRef(enabled);enabledRef.current=enabled
  const autoArmRef=useRef(autoArmOnEnable);autoArmRef.current=autoArmOnEnable
  const stabilizer=useRef(new PoseStabilizer())
  const [status,setStatus]=useState<CameraStatus>('idle')
  const [message,setMessage]=useState('Nhấn "Bật webcam" để bắt đầu')
  const [pose,setPose]=useState<Pose>('UNKNOWN')
  const [progress,setProgress]=useState(0)
  const [armed,setArmed]=useState(false)
  const [confirmed,setConfirmed]=useState<Confirmed|null>(null)
  const lastUI=useRef(0)
  const confirmationSequence=useRef(0)

  // Mỗi lần vào pha trả lời mở khóa lượt mới (không cần tư thế NGHỈ).
  useEffect(()=>{
    const armNow=enabled && autoArmOnEnable
    stabilizer.current.reset(armNow)
    setProgress(0)
    setArmed(armNow)
    setConfirmed(null)
  },[enabled,autoArmOnEnable])

  const stop=useCallback(()=>{
    runId.current+=1
    cancelAnimationFrame(raf.current)
    stream.current?.getTracks().forEach(t=>t.stop());stream.current=null
    const v=videoRef.current;if(v){v.pause();v.srcObject=null}
    landmarker.current?.close();landmarker.current=null
    stabilizer.current.clearHistory()
    setStatus('idle');setPose('UNKNOWN');setProgress(0);setArmed(false);setConfirmed(null)
  },[])
  useEffect(()=>()=>{runId.current+=1;cancelAnimationFrame(raf.current);stream.current?.getTracks().forEach(t=>t.stop());landmarker.current?.close()},[])

  const start=useCallback(async()=>{
    if(status==='loading'||status==='running')return
    const current=++runId.current
    setStatus('loading');setMessage('Đang xin quyền camera và tải mô hình AI…')
    try{
      // Xin camera ngay sau tương tác người dùng; trình duyệt có thể hiện hộp cấp quyền.
      const acquired=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:'user',width:{ideal:960},height:{ideal:540}}})
      if(current!==runId.current){acquired.getTracks().forEach(t=>t.stop());return}
      stream.current=acquired
      const video=videoRef.current
      if(!video)throw new Error('Không tìm thấy phần tử video')
      video.srcObject=acquired;await video.play()
      const vision=await FilesetResolver.forVisionTasks(wasmUrl)
      const detector=await PoseLandmarker.createFromOptions(vision,{
        baseOptions:{modelAssetPath:modelUrl,delegate:'CPU'},runningMode:'VIDEO',numPoses:1,
        minPoseDetectionConfidence:0.55,minPosePresenceConfidence:0.55,minTrackingConfidence:0.55,
      })
      if(current!==runId.current){detector.close();return}
      landmarker.current=detector
      const armNow=enabledRef.current && autoArmRef.current
      stabilizer.current.clearHistory()
      stabilizer.current.reset(armNow);setArmed(armNow)
      setStatus('running');setMessage(armNow?'Giữ dáng A/B/C/D trong 1 giây để trả lời.':'Đưa hai tay xuống để mở khóa luyện tập.')
      let lastFrame=-1,lastAnalyze=0
      const loop=(t:number)=>{
        if(current!==runId.current)return
        const v=videoRef.current,c=canvasRef.current
        if(v&&c&&v.readyState>=2&&v.currentTime!==lastFrame&&t-lastAnalyze>=66){
          lastFrame=v.currentTime;lastAnalyze=t
          try{
            const result=detector.detectForVideo(v,t)
            const marks=result.landmarks[0] as Landmark[]|undefined
            drawSkeleton(c,v,marks)
            const found=classifyPose(marks)
            const state=stabilizer.current.update(found.pose,t,enabledRef.current)
            if(t-lastUI.current>100||state.confirmed){
              lastUI.current=t;setPose(found.pose);setMessage(state.blockedRepeat?'Hãy hạ hai tay về tư thế nghỉ 0,5 giây trước khi chọn lại cùng chữ này.':found.reason);setProgress(state.progress);setArmed(state.armed)
            }
            if(state.confirmed && state.confirmed!=='NEUTRAL' && state.confirmed!=='UNKNOWN')
              setConfirmed({pose:state.confirmed,id:++confirmationSequence.current})
          }catch(err){setMessage('Lỗi xử lý khung hình: '+String(err))}
        }
        raf.current=requestAnimationFrame(loop)
      }
      raf.current=requestAnimationFrame(loop)
    }catch(e){
      if(current!==runId.current)return
      stream.current?.getTracks().forEach(t=>t.stop());stream.current=null
      setStatus('error');setMessage(e instanceof Error?e.message:String(e))
    }
  },[status])
  return {videoRef,canvasRef,status,message,pose,progress,armed,confirmed,start,stop}
}
