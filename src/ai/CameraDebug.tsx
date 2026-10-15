import type {useAnswerCamera} from './useAnswerCamera'
import './cameraDebug.css'
export default function CameraDebug({camera,phase}:{camera:ReturnType<typeof useAnswerCamera>;phase:string}){
  const data=camera.diagnostics
  return <details className="camera-debug" open={camera.debugEnabled} onToggle={event=>camera.setDebugEnabled(event.currentTarget.open)}>
    <summary>Công cụ giáo viên</summary>
    {camera.debugEnabled&&<section aria-label="Debug Camera"><div className="camera-debug-heading"><strong>Debug Camera</strong><button type="button" onClick={()=>camera.setDebugEnabled(false)}>Đóng</button></div>{data?<dl>
      <dt>Tư thế phân loại</dt><dd>{data.pose}</dd>
      <dt>Pha game</dt><dd>{phase}</dd>
      <dt>Cho phép trả lời</dt><dd>{data.enabled?'Có':'Không'}</dd>
      <dt>Đã mở khóa</dt><dd>{data.armed?'Có':'Không'}</dd>
      <dt>Giữ dáng trong lượt</dt><dd>{Math.round(data.holdingMs)} ms</dd>
      <dt>Tiến độ chốt</dt><dd>{Math.round(data.progress*100)}%</dd>
      <dt>Chờ tư thế nghỉ</dt><dd>{data.waitingForNeutral?'Có':'Không'}</dd>
      <dt>FPS suy luận đo được</dt><dd>{data.fps===null?'Đang đo…':data.fps.toFixed(1)}</dd>
      <dt>Lý do chưa chốt / trạng thái</dt><dd>{data.reason}</dd>
    </dl>:<p>Chưa có mẫu nhận diện. Bật webcam và chờ AI chạy.</p>}<small>Chỉ hiển thị số liệu tại máy, không lưu ảnh/video hoặc gửi log.</small></section>}
  </details>
}
