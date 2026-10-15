import type {Pose} from './poseClassifier'
export const HOLD_MS=1000
export const NEUTRAL_MS=500
/** Chốt tối đa một lựa chọn mỗi lần tạo dáng; muốn chốt tiếp phải về tư thế nghỉ. */
export class PoseStabilizer {
  private candidate: Pose='UNKNOWN'
  private since=0
  private neutralSince=0
  private armed=false
  private locked=false
  private lastConfirmedPose:Pose='UNKNOWN'
  private releasedSinceConfirm=true
  // autoArm chỉ bật lúc bắt đầu cửa sổ trả lời một câu mới.
  // Lúc luyện tập, học sinh vẫn có thể tập về tư thế nghỉ trước khi tạo dáng.
  reset(autoArm=false){this.candidate='UNKNOWN';this.since=0;this.neutralSince=0;this.armed=autoArm;this.locked=false}
  clearHistory(){this.lastConfirmedPose='UNKNOWN';this.releasedSinceConfirm=true;this.reset()}
  update(pose:Pose, now:number, canConfirm:boolean):{progress:number;confirmed:Pose|null;armed:boolean;blockedRepeat:boolean}{
    if(pose==='NEUTRAL'){
      if(this.neutralSince===0)this.neutralSince=now
      if(now-this.neutralSince>=NEUTRAL_MS){this.armed=true;this.locked=false;this.releasedSinceConfirm=true}
    }else this.neutralSince=0
    if(pose!==this.candidate){this.candidate=pose;this.since=now}
    const isAnswer=pose==='A'||pose==='B'||pose==='C'||pose==='D'
    const elapsed=isAnswer?now-this.since:0
    // Ngăn tự chọn lại tư thế đã giữ xuyên suốt qua câu mới.
    // Câu tiếp theo vẫn có thể chọn một chữ KHÁC mà không cần về NGHỈ.
    const blockedRepeat=isAnswer&&pose===this.lastConfirmedPose&&!this.releasedSinceConfirm
    const progress=canConfirm&&this.armed&&!this.locked&&!blockedRepeat?Math.min(1,elapsed/HOLD_MS):0
    if(canConfirm&&isAnswer&&this.armed&&!this.locked&&!blockedRepeat&&elapsed>=HOLD_MS){
      this.locked=true;this.armed=false
      this.lastConfirmedPose=pose;this.releasedSinceConfirm=false
      return {progress:1,confirmed:pose,armed:false,blockedRepeat:false}
    }
    return {progress,confirmed:null,armed:this.armed,blockedRepeat}
  }
}
