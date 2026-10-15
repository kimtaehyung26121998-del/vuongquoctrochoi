import {useEffect,useRef,type CSSProperties} from 'react'
import './bossVictory.css'

const BURSTS=[{x:14,y:22,delay:0,color:'#ffc85c'},{x:84,y:18,delay:.8,color:'#9cefff'},{x:7,y:65,delay:1.6,color:'#d7acff'},{x:91,y:68,delay:2.3,color:'#ff91b8'},{x:32,y:9,delay:2.8,color:'#a9ffcf'},{x:69,y:40,delay:3.5,color:'#ffe8a0'}]

export default function BossVictoryScreen({score,muted,onToggleSound,onMap,onReplay}:{score:number;muted:boolean;onToggleSound:()=>void;onMap:()=>void;onReplay:()=>void}){
  const title=useRef<HTMLHeadingElement>(null)
  useEffect(()=>{title.current?.focus()},[])
  return <main className="boss-victory" aria-labelledby="boss-victory-title">
    <div className="victory-fireworks" aria-hidden="true">{BURSTS.map((burst,index)=><div key={index} className="victory-burst" style={{left:`${burst.x}%`,top:`${burst.y}%`,'--burst-delay':`${burst.delay}s`,'--burst-color':burst.color} as CSSProperties}>
      {Array.from({length:12},(_,ray)=><i key={ray} style={{'--ray-angle':`${ray*30}deg`} as CSSProperties}/>)}
    </div>)}</div>
    <button className="victory-sound" onClick={onToggleSound}>{muted?'Bật tiếng':'Tắt tiếng'}</button>
    <section className="victory-content">
      <span className="victory-eyebrow">VƯƠNG QUỐC TOÁN HỌC · CHIẾN THẮNG</span>
      <div className="victory-trophy-scene" aria-hidden="true"><div className="victory-halo"/><span className="victory-spark spark-one">✦</span><span className="victory-spark spark-two">✦</span><span className="victory-spark spark-three">✧</span><img className="victory-trophy" src="/assets/items/trophy.png" alt=""/><div className="victory-podium"/></div>
      <div className="victory-stars" aria-label="Đã phá đủ 3 lớp khiên">★ ★ ★</div>
      <h1 id="boss-victory-title" ref={title} tabIndex={-1}>Chúc mừng bạn đã<br/><span>tiêu diệt Boss!</span></h1>
      <p className="victory-message">Vương quốc đã được giải cứu!<br/>Bạn và Cú đã hoàn thành cả bốn màn phiêu lưu.</p>
      <div className="victory-medal"><span>NHÀ VÔ ĐỊCH TOÁN HỌC</span><strong>{score} điểm <i>·</i> 3/3 khiên đã phá</strong></div>
      <div className="victory-actions"><button className="victory-primary" onClick={onMap}>Về bản đồ →</button><button className="victory-secondary" onClick={onReplay}>Chơi lại Boss</button></div>
      <p className="victory-signoff">Một hành trình tuyệt vời. Cú tự hào về bạn!</p>
    </section>
  </main>
}
