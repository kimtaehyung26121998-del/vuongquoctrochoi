import {useState} from 'react'
import LegacyApp from './LegacyApp'
import ForestAdventure from './ForestAdventure'
import './forest.css'

export default function App(){
  const [mode,setMode]=useState<'menu'|'forest'|'legacy'>('menu')
  if(mode==='forest')return <ForestAdventure onExit={()=>setMode('menu')}/>
  if(mode==='legacy')return <><button className="return-menu" onClick={()=>setMode('menu')}>← Chọn chế độ</button><LegacyApp/></>
  return <main className="adventure-menu">
    <span className="forest-eyebrow">VƯƠNG QUỐC TOÁN HỌC · MÀN 01</span>
    <img className="menu-owl" src="/assets/mascot/owl_cheer.png" alt="Cú mèo mời em phiêu lưu"/>
    <h1>Rừng phép tính</h1>
    <p>Cây cầu phép thuật đã bị đứt!<br/>Dùng tư thế cơ thể giải 3 câu toán, xây lại cầu và đưa Cú sang bờ bên kia.</p>
    <button className="btn primary" onClick={()=>setMode('forest')}>Bắt đầu phiêu lưu →</button>
    <button className="btn secondary" onClick={()=>setMode('legacy')}>Luyện webcam & kiểm thử 12 câu cũ</button>
    <small>Một học sinh mỗi lượt · Camera xử lý trong trình duyệt · Không lưu video</small>
  </main>
}
