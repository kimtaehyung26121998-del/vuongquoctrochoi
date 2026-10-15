import {useCallback,useEffect,useRef} from 'react'
export function useStageAudio(muted:boolean,paused:boolean,active:boolean){
  const music=useRef<HTMLAudioElement>(null)
  const sounds=useRef(new Set<HTMLAudioElement>())
  const mutedRef=useRef(muted);mutedRef.current=muted
  const play=useCallback((path:string)=>{
    if(mutedRef.current)return
    const sound=new Audio('/audio/sfx/'+path);sound.volume=.5;sounds.current.add(sound)
    const release=()=>sounds.current.delete(sound)
    sound.onended=release;sound.onerror=release;void sound.play().catch(release)
  },[])
  useEffect(()=>{
    const audio=music.current
    if(audio){audio.volume=.18;audio.muted=muted;if(active&&!paused)void audio.play().catch(()=>{});else audio.pause()}
    if(muted||paused){sounds.current.forEach(sound=>sound.pause());sounds.current.clear()}
  },[muted,paused,active])
  useEffect(()=>{
    const audio=music.current;const voices=sounds.current
    return()=>{audio?.pause();voices.forEach(sound=>{sound.pause();sound.src=''});voices.clear()}
  },[])
  const startMusic=()=>{const audio=music.current;if(audio){audio.muted=muted;audio.volume=.18;void audio.play().catch(()=>{})}}
  return {music,play,startMusic}
}
