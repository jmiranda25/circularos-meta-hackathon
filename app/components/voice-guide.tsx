'use client';
import { useEffect,useRef,useState } from 'react';
import { Mic,Volume2,Square } from 'lucide-react';
import {cachedAudio,prepareAudio} from '../lib/circular/voice-audio';
import { guidanceText,parseVoiceCommand,type VoiceCommand } from '../lib/circular/guidance';
type Recognition={lang:string;continuous:boolean;interimResults:boolean;onresult:((event:{results:{[index:number]:{[index:number]:{transcript:string}}}})=>void)|null;onerror:((event:{error:string})=>void)|null;onend:(()=>void)|null;start:()=>void;abort:()=>void};
type SpeechWindow=Window & {SpeechRecognition?:new()=>Recognition;webkitSpeechRecognition?:new()=>Recognition};
export function VoiceGuide({step,objectCount,reviewCount,busy,guided,onGuided,onCommand,language,onLanguage,prepareVoice,onPrepareVoice}:{step:number;objectCount:number;reviewCount:number;busy:boolean;guided:boolean;onGuided:(v:boolean)=>void;onCommand:(v:VoiceCommand)=>void;language:'en'|'es';onLanguage:(v:'en'|'es')=>void;prepareVoice:boolean;onPrepareVoice:(v:boolean)=>void}){
 const [error,setError]=useState(''),[loading,setLoading]=useState(false),[supported,setSupported]=useState(false),[listening,setListening]=useState(false),[heard,setHeard]=useState(''),[url,setUrl]=useState(''),[notice,setNotice]=useState('');
 const audio=useRef<HTMLAudioElement>(null),recognition=useRef<Recognition|null>(null),abort=useRef<AbortController|null>(null),timeout=useRef<ReturnType<typeof setTimeout>|null>(null);
 const input={step,objectCount,reviewCount,language};
 const text=guidanceText(input);
 useEffect(()=>{const w=window as SpeechWindow;setSupported(!!(w.SpeechRecognition||w.webkitSpeechRecognition));return()=>{recognition.current?.abort();abort.current?.abort();if(timeout.current)clearTimeout(timeout.current);};},[]);
 useEffect(()=>{audio.current?.pause();abort.current?.abort();recognition.current?.abort();setLoading(false);setError('');setNotice('');setHeard('');const cached=cachedAudio({step,objectCount,reviewCount,language});setUrl(cached?URL.createObjectURL(cached):'');},[step,language,objectCount,reviewCount]);
 useEffect(()=>{if(busy){audio.current?.pause();recognition.current?.abort();abort.current?.abort();setLoading(false);}},[busy]);
 useEffect(()=>()=>{if(url)URL.revokeObjectURL(url);},[url]);
 function stop(){audio.current?.pause();recognition.current?.abort();abort.current?.abort();setLoading(false);setListening(false);}
 async function speak(){
  if(loading||busy)return;setError('');setNotice('');recognition.current?.abort();
  // Play an existing source directly in the click handler. Never reload it first.
  if(url&&audio.current){
   const player=audio.current;
   try{player.currentTime=0;await player.play();}
   catch(e){const name=(e as Error).name;if(name==='AbortError')return;setError(name==='NotAllowedError'?'Select the play triangle in the audio player to start your guide.':'The audio could not play. Try the audio player below.');}
   return;
  }
  setLoading(true);const controller=new AbortController();abort.current=controller;
  try{
   const blob=await prepareAudio(input,AbortSignal.any([controller.signal,AbortSignal.timeout(20000)]));if(controller.signal.aborted)return;
   setUrl(URL.createObjectURL(blob));setNotice('Your guide is ready. Select Play / repeat guide to listen.');
  }catch(e){if((e as Error).name!=='AbortError')setError((e as Error).name==='TimeoutError'?'Audio preparation took too long. Try again or use the written guide.':(e as Error).message);}
  finally{if(abort.current===controller)setLoading(false);}
 }
 function listen(){
  if(listening){recognition.current?.abort();return;}
  setError('');setHeard('');audio.current?.pause();const w=window as SpeechWindow;const Constructor=w.SpeechRecognition||w.webkitSpeechRecognition;if(!Constructor)return;
  const listener=new Constructor();recognition.current=listener;listener.lang=language==='es'?'es-PE':'en-US';listener.continuous=false;listener.interimResults=false;
  listener.onresult=event=>{const transcript=event.results[0][0].transcript;setHeard(transcript);const command=parseVoiceCommand(transcript);if(command==='repeat')void speak();else if(command==='stop')stop();else if(command==='unknown')setError('Command not recognized. Try Next, Back, Repeat, Stop, Analyze or Camera.');else onCommand(command);};
  listener.onerror=event=>{if(event.error!=='aborted')setError('Voice commands are unavailable or microphone access was not granted. Use the buttons instead.');};
  listener.onend=()=>{setListening(false);if(timeout.current)clearTimeout(timeout.current);};
  try{listener.start();setListening(true);timeout.current=setTimeout(()=>listener.abort(),12000);}catch{setListening(false);setError('The microphone could not start. Use the buttons instead.');}
 }
 return <section className="voice-guide" aria-label="Step-by-step assistance">
  <div className="guide-heading"><div><span className="overline">STEP-BY-STEP ASSISTANCE</span><h2>One step at a time.</h2></div><label className="check-label"><input type="checkbox" checked={guided} onChange={e=>onGuided(e.target.checked)}/>Larger controls</label></div>
  <p className="guide-transcript">{["Take a photo, review it, then select Analyze.","Review each object before adding your context.","Tell us which receiving channels you have confirmed.","Read the reasons, export your plan, or explore the Lince pilot."][step-1]}</p>
  <label className="check-label voice-preference"><input type="checkbox" disabled={busy} checked={prepareVoice} onChange={e=>onPrepareVoice(e.target.checked)}/>Prepare audio before each step <small>Optional · sends the written guide to ElevenLabs</small></label><div className="guide-actions"><label>Voice language<select value={language} disabled={busy} onChange={e=>onLanguage(e.target.value as 'en'|'es')}><option value="en">English</option><option value="es">Spanish · Peru pilot</option></select></label><button className="secondary" disabled={loading||busy} onClick={speak}><Volume2 size={18}/>{loading?'Preparing voice…':url?'Play / repeat guide':'Prepare guide audio'}</button><button className="secondary" disabled={!supported||busy||loading} onClick={listen}><Mic size={18}/>{listening?'Stop listening':'Voice command'}</button>{(url||loading||listening)&&<button className="secondary" onClick={stop}><Square size={16}/>Stop audio</button>}</div>
  <audio ref={audio} src={url||undefined} controls={!!url} aria-label="Natural voice guidance" onPlay={()=>{setError('');setNotice('');}}/>
  <details className="guide-details"><summary>Full guide, commands and voice privacy</summary><p lang={language}>{text}</p><p className="small muted">Listening sends this fixed guide to ElevenLabs. Voice commands use your browser’s speech service and may send microphone audio to that provider. Nothing listens automatically. Commands: Next, Back, Repeat, Stop, Analyze, Camera. {supported?'':'Voice commands are not supported in this browser; all buttons remain available.'}</p></details>
  {notice&&<p role="status">{notice}</p>}{listening&&<p role="status">Listening for one command…</p>}{heard&&<p role="status">Heard: “{heard}”</p>}{error&&<p className="notice error" role="alert">{error}</p>}
 </section>;
}
