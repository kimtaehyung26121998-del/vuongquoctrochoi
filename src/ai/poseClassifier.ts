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
  // A phải cao rõ trên mũi, không dùng vùng ngang mặt của B giơ hơi cao.
  const wristAboveHead=lw.y<n.y-torso*0.12 && rw.y<n.y-torso*0.12 && lw.y<ls.y-torso*0.38 && rw.y<rs.y-torso*0.38
  const aHandsClose=wristSeparation < Math.max(sw*1.35,torso*0.90)
  const aElbowsAboveShoulder=le.y<ls.y+torso*0.12 && re.y<rs.y+torso*0.12
  if(wristAboveHead && aHandsClose && aElbowsAboveShoulder)
    return {pose:'A',score:0.9,reason:'Hai tay chụm trên đầu'}

  // Tay đã buông xuống dưới hông phải được nhận là NGHỈ trước khi xét D.
  // Khi khuỷu hơi dang, cổ tay vẫn gần hông theo khoảng cách nên D cũ
  // có thể nuốt tư thế nghỉ và giữ khóa lượt sau mãi.
  const handsDown=lw.y>lh.y+torso*0.08 && rw.y>rh.y+torso*0.08
  const torsoUpright=Math.abs(shoulder.x-hip.x)/torso<0.20
  if(handsDown && torsoUpright) return {pose:'NEUTRAL',score:0.8,reason:'Hai tay đã hạ dưới hông; giữ nghỉ 0,5 giây để mở lượt'}

  // Đo vị trí cổ tay dọc trục vai → hông: 0 = vai, 1 = hông.
  // B/D cũ chồng vùng quanh eo cao và B được xét trước nên D dễ thành B.
  const alongTorso=(w:Landmark,origin:Landmark)=>((w.x-origin.x)*(hip.x-shoulder.x)+(w.y-origin.y)*(hip.y-shoulder.y))/(torso*torso)
  const leftLevel=alongTorso(lw,ls),rightLevel=alongTorso(rw,rs)
  const elbowCos=(s:Landmark,e:Landmark,w:Landmark)=>{
    const length=d(s,e)*d(w,e)
    return length>torso*torso*0.01?((s.x-e.x)*(w.x-e.x)+(s.y-e.y)*(w.y-e.y))/length:null
  }
  const leftBend=elbowCos(ls,le,lw),rightBend=elbowCos(rs,re,rw)
  const outwardFromWrist=(e:Landmark,w:Landmark,s:Landmark,other:Landmark)=>((e.x-w.x)*(s.x-other.x)+(e.y-w.y)*(s.y-other.y))/(sw*sw)
  const leftWing=outwardFromWrist(le,lw,ls,rs),rightWing=outwardFromWrist(re,rw,rs,ls)
  // Tay gần thẳng hướng xuống vẫn là nghỉ, kể cả cổ tay chỉ ngang hông.
  const relaxed=leftBend!==null&&rightBend!==null&&leftBend<-.90&&rightBend<-.90&&leftWing<.05&&rightWing<.05&&lw.y>le.y+torso*.12&&rw.y>re.y+torso*.12
  if(torsoUpright&&leftLevel>.82&&rightLevel>.82&&relaxed)
    return {pose:'NEUTRAL',score:0.8,reason:'Hai tay buông thẳng; giữ nghỉ 0,5 giây để mở lượt'}
  const wristsNearHips=d(lw,lh)<Math.max(sw*0.86,torso*0.55) && d(rw,rh)<Math.max(sw*0.86,torso*0.55)
  const handsAtWaist=leftLevel>0.52 && rightLevel>0.52 && leftLevel<1.08 && rightLevel<1.08
  // Chống hông không đòi khuỷu dang rộng hơn vai. Chỉ cần hai cẳng tay
  // hướng vào eo/hông và có gập khuỷu; tay buông thẳng không thỏa điều này.
  const bentArms=leftBend!==null&&rightBend!==null&&leftBend>-.94&&rightBend>-.94&&leftBend<.97&&rightBend<.97
  if(wristsNearHips && handsAtWaist && bentArms && leftWing>.08 && rightWing>.08)
    return {pose:'D',score:0.87,reason:'Hai tay chống hông'}

  const shouldersNear=[d(lw,ls),d(rw,rs)]
  const wristsNearShoulders=shouldersNear.every(v=>v<Math.max(sw*0.90,torso*0.68))
  const elbowOutB=Math.abs(le.x-ls.x)>sw*0.16 && Math.abs(re.x-rs.x)>sw*0.16
  // Chừa vùng 0,40–0,52 để không chốt B khi tay đang chuyển xuống eo.
  const handsHigh=leftLevel<0.40 && rightLevel<0.40
  // B cho phép bàn tay cao tới gần mặt; chừa khoảng 0,06 thân so với A.
  const handsAtShoulderHeight=lw.y>n.y-torso*0.06 && rw.y>n.y-torso*0.06 && leftLevel>-.60 && rightLevel>-.60
  if(wristsNearShoulders && elbowOutB && handsHigh && handsAtShoulderHeight)
    return {pose:'B',score:0.83,reason:'Hai bàn tay gần vai'}

  // C: một cổ tay ở trên đầu, một cổ tay thấp hơn vai, thân lệch ngang theo trục vai→hông.
  const tilted=Math.abs(shoulder.x-hip.x)/torso>0.22
  const highWrist=Math.min(lw.y,rw.y)<n.y+torso*0.22
  const lowWrist=Math.max(lw.y,rw.y)>shoulder.y+torso*0.33
  const armsDifferentLevels=Math.abs(lw.y-rw.y)>torso*0.72
  if(tilted && highWrist && lowWrist && armsDifferentLevels)
    return {pose:'C',score:0.77,reason:'Nghiêng người, tay trên cao và tay dưới thấp'}

  return {pose:'UNKNOWN',score:0,reason:'Chưa rõ tư thế; thử đưa tay đúng vị trí'}
}

export const POSE_NAMES: Record<Pose,string> = {
 A:'A – Hai tay chụm trên đầu',B:'B – Hai tay ngang vai',C:'C – Nghiêng tạo đường cong',
 D:'D – Chống hai tay lên hông',NEUTRAL:'Tư thế nghỉ',UNKNOWN:'Đang quan sát',
}
