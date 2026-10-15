import {useEffect,useRef,useState} from 'react'
import {StageClock} from './stageClock'
export function useStageClock(key:string,duration:number|null,paused:boolean,onDone:()=>void){
  const clock=useRef<{key:string;duration:number;clock:StageClock}|null>(null)
  const callback=useRef(onDone);callback.current=onDone
  const [display,setDisplay]=useState({key:'',seconds:0})
  useEffect(()=>{
    if(duration===null){clock.current=null;return}
    if(clock.current?.key!==key||clock.current.duration!==duration)clock.current={key,duration,clock:new StageClock(duration)}
    const active=clock.current.clock
    setDisplay({key,seconds:Math.ceil(active.left(performance.now())/1000)})
    if(paused)return
    active.resume(performance.now())
    const timeout=window.setTimeout(()=>callback.current(),active.left(performance.now()))
    const interval=window.setInterval(()=>{
      const seconds=Math.ceil(active.left(performance.now())/1000)
      setDisplay(previous=>previous.key===key&&previous.seconds===seconds?previous:{key,seconds})
    },200)
    return()=>{window.clearTimeout(timeout);window.clearInterval(interval);active.pause(performance.now())}
  },[key,duration,paused])
  return display.key===key?display.seconds:Math.ceil((duration??0)/1000)
}
