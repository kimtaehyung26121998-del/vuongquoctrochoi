/** Nhận diện tư thế cơ bản từ khớp MediaPipe, KHÔNG phải mô hình học đã hiệu chuẩn. */
export type Pose = 'A' | 'B' | 'C' | 'D' | 'NEUTRAL' | 'UNKNOWN'
export type Landmark = { x: number; y: number; z?: number; visibility?: number; presence?: number }
export type Classification = { pose: Pose; score: number; reason: string }

const I = {nose:0,leftShoulder:11,rightShoulder:12,leftElbow:13,rightElbow:14,leftWrist:15,rightWrist:16,leftHip:23,rightHip:24} as const
const midpoint=(a:Landmark,b:Landmark)=>({x:(a.x+b.x)/2,y:(a.y+b.y)/2})
const d=(a:{x:number;y:number},b:{x:number;y:number})=>Math.hypot(a.x-b.x,a.y-b.y)
const valid=(l?:Landmark)=>l!==undefined && Number.isFinite(l.x) && Number.isFinite(l.y) && (l.visibility??1)>0.46 && (l.presence??1)>0.46

export function classifyPose(landmarks: Landmark[] | undefined): Classification {
  if(!landmarks) return {pose:'UNKNOWN',score:0,reason:'Chưa phát hiện cơ thể'}
  const ids=[I.nose,I.leftShoulder,I.rightShoulder,I.leftElbow,I.rightElbow,I.leftWrist,I.rightWrist,I.leftHip,I.rightHip]
  if(!ids.every(id=>valid(landmarks[id]))) return {pose:'UNKNOWN',score:0,reason:'Chưa thấy rõ vai, khuỷu tay, cổ tay và hông'}
  const n=landmarks[I.nose]!,ls=landmarks[I.leftShoulder]!,rs=landmarks[I.rightShoulder]!
  const le=landmarks[I.leftElbow]!,re=landmarks[I.rightElbow]!,lw=landmarks[I.leftWrist]!,rw=landmarks[I.rightWrist]!
  const lh=landmarks[I.leftHip]!,rh=landmarks[I.rightHip]!
  const shoulder=midpoint(ls,rs),hip=midpoint(lh,rh)
  const sw=d(ls,rs),torso=d(shoulder,hip)
  if(sw<0.055 || torso<0.09) return {pose:'UNKNOWN',score:0,reason:'Hãy đứng lùi ra để thấy rõ phần thân'}
  const wristSeparation=d(lw,rw)
  const wristAboveHead=lw.y<n.y+torso*0.05 && rw.y<n.y+torso*0.05
  const aHandsClose=wristSeparation < Math.max(sw*0.75,torso*0.55)
  const aElbowsAboveShoulder=le.y<ls.y && re.y<rs.y
  if(wristAboveHead && aHandsClose && aElbowsAboveShoulder)
    return {pose:'A',score:0.9,reason:'Hai tay chụm trên đầu'}

  const shouldersNear=[d(lw,ls),d(rw,rs)]
  const wristsNearShoulders=shouldersNear.every(v=>v<Math.max(sw*0.90,torso*0.68))
  const elbowOutB=Math.abs(le.x-ls.x)>sw*0.16 && Math.abs(re.x-rs.x)>sw*0.16
  const handsHigh=lw.y<hip.y-torso*0.32 && rw.y<hip.y-torso*0.32
  if(wristsNearShoulders && elbowOutB && handsHigh)
    return {pose:'B',score:0.83,reason:'Hai bàn tay gần vai'}

  const wristsNearHips=d(lw,lh)<Math.max(sw*0.86,torso*0.55) && d(rw,rh)<Math.max(sw*0.86,torso*0.55)
  const elbowsOutD=Math.abs(le.x-ls.x)>sw*0.25 && Math.abs(re.x-rs.x)>sw*0.25
  if(wristsNearHips && elbowsOutD && lw.y>shoulder.y+torso*0.46 && rw.y>shoulder.y+torso*0.46)
    return {pose:'D',score:0.87,reason:'Hai tay chống hông'}

  // C: một cổ tay ở trên đầu, một cổ tay thấp hơn vai, thân lệch ngang theo trục vai→hông.
  const tilted=Math.abs(shoulder.x-hip.x)/torso>0.22
  const highWrist=Math.min(lw.y,rw.y)<n.y+torso*0.22
  const lowWrist=Math.max(lw.y,rw.y)>shoulder.y+torso*0.33
  const armsDifferentLevels=Math.abs(lw.y-rw.y)>torso*0.72
  if(tilted && highWrist && lowWrist && armsDifferentLevels)
    return {pose:'C',score:0.77,reason:'Nghiêng người, tay trên cao và tay dưới thấp'}

  // Tư thế nghỉ phải đủ khác các tư thế đáp án; không dùng trực tiếp làm đáp án.
  const handsDown=lw.y>hip.y+torso*0.08 && rw.y>hip.y+torso*0.08
  const torsoUpright=Math.abs(shoulder.x-hip.x)/torso<0.20
  if(handsDown && torsoUpright) return {pose:'NEUTRAL',score:0.8,reason:'Đã về tư thế nghỉ'}
  return {pose:'UNKNOWN',score:0,reason:'Chưa rõ tư thế; thử đưa tay đúng vị trí'}
}

export const POSE_NAMES: Record<Pose,string> = {
 A:'A – Hai tay chụm trên đầu',B:'B – Hai tay ngang vai',C:'C – Nghiêng tạo đường cong',
 D:'D – Chống hai tay lên hông',NEUTRAL:'Tư thế nghỉ',UNKNOWN:'Đang quan sát',
}
