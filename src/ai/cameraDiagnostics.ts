import type {Pose} from './poseClassifier'
export interface CameraDiagnostics {
  pose:Pose;enabled:boolean;armed:boolean;holdingMs:number;progress:number;
  waitingForNeutral:boolean;reason:string;fps:number|null
}
interface SampleState {progress:number;armed:boolean;blockedRepeat:boolean;confirmed:Pose|null}
// Chỉ quan sát số liệu: không xác nhận, không mở khóa, không can thiệp stabilizer.
export class CameraDiagnosticsProbe {
  private candidate:Pose='UNKNOWN'
  private since=0
  private enabled=false
  private fpsSince:number|null=null
  private samples=0
  private fps:number|null=null
  sample(pose:Pose,now:number,enabled:boolean,state:SampleState,classifierReason:string):CameraDiagnostics{
    if(pose!==this.candidate||enabled!==this.enabled){this.candidate=pose;this.since=now;this.enabled=enabled}
    if(this.fpsSince===null)this.fpsSince=now
    else this.samples++
    const elapsed=now-this.fpsSince
    if(elapsed>=1000){this.fps=this.samples*1000/elapsed;this.samples=0;this.fpsSince=now}
    const isAnswer=pose==='A'||pose==='B'||pose==='C'||pose==='D'
    const waitingForNeutral=enabled&&(state.blockedRepeat||(!state.armed&&state.progress===0&&!state.confirmed))
    const reason=!enabled?'Ngoài cửa sổ trả lời hoặc đang tạm dừng':state.blockedRepeat?'Đáp án cũ chưa được thả: hạ hai tay nghỉ 0,5 giây':state.confirmed||state.progress===1?'Đã xác nhận; đang khóa lượt':pose==='UNKNOWN'?classifierReason:waitingForNeutral?'Đang chờ hai tay nghỉ 0,5 giây':pose==='NEUTRAL'?'Đang nghỉ; có thể tạo dáng':state.progress<1?'Đang giữ dáng; cần đủ 1000ms':'Sẵn sàng'
    return {pose,enabled,armed:state.armed,holdingMs:enabled&&isAnswer?Math.max(0,now-this.since):0,progress:state.progress,waitingForNeutral,reason,fps:this.fps}
  }
}
