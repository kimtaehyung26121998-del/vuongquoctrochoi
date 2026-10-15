// Đồng hồ chỉ đếm thời gian đang chạy, có thể kiểm thử không cần trình duyệt.
export class StageClock {
  private remaining:number
  private started:number|null=null
  constructor(duration:number){this.remaining=duration}
  resume(now:number){if(this.started===null)this.started=now}
  left(now:number){return Math.max(0,this.remaining-(this.started===null?0:now-this.started))}
  pause(now:number){this.remaining=this.left(now);this.started=null}
}
