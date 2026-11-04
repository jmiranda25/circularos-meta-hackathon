'use client';
import { useEffect,useRef,useState } from 'react';
import { Camera,X } from 'lucide-react';
export function CameraCapture({onCapture,onClose}:{onCapture:(file:File)=>Promise<void>;onClose:()=>void}){
 const dialog=useRef<HTMLDialogElement>(null),video=useRef<HTMLVideoElement>(null),stream=useRef<MediaStream|null>(null);
 const [error,setError]=useState(''),[ready,setReady]=useState(false),[capturing,setCapturing]=useState(false);
 useEffect(()=>{
  let disposed=false;dialog.current?.showModal();
  async function start(){try{
   if(!navigator.mediaDevices?.getUserMedia)throw Error('Camera preview is unavailable in this browser. Use your device camera below or choose a photo.');
   const media=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:1600}},audio:false});
   if(disposed){media.getTracks().forEach(t=>t.stop());return;}
   stream.current=media;if(video.current){video.current.srcObject=media;await video.current.play();}
  }catch(e){if(!disposed)setError((e as Error).name==='NotAllowedError'?'Camera access was not granted. You can still choose a photo.':(e as Error).message);}}
  void start();
  return()=>{disposed=true;stream.current?.getTracks().forEach(t=>t.stop());stream.current=null;};
 },[]);
 async function capture(){
  if(!video.current||!ready)return;setCapturing(true);
  try{const canvas=document.createElement('canvas');canvas.width=video.current.videoWidth;canvas.height=video.current.videoHeight;canvas.getContext('2d')!.drawImage(video.current,0,0);const blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,'image/jpeg',.9));if(!blob)throw Error('Unable to capture this frame. Please try again.');await onCapture(new File([blob],'camera-photo.jpg',{type:'image/jpeg'}));onClose();}catch(e){setError((e as Error).message);}finally{setCapturing(false);}
 }
 return <dialog ref={dialog} className="camera-dialog" onCancel={e=>{e.preventDefault();onClose();}}>
  <div className="panel-title"><h2>Take a photo</h2><button autoFocus className="icon-button" aria-label="Close camera" onClick={onClose}><X/></button></div>
  <p>Keep the objects separated and well lit. Capturing a photo does not send it for analysis.</p>
  <video ref={video} autoPlay muted playsInline onLoadedData={()=>setReady(true)} aria-label="Camera preview"/>
  {!ready&&!error&&<p role="status">Waiting for camera permission or preview. You can use your device camera below instead.</p>}
  {error&&<p role="alert" className="notice error">{error}</p>}
  <div className="actions"><label className="secondary">Use device camera<input className="sr-only" type="file" accept="image/*" capture="environment" onChange={async e=>{if(e.target.files?.[0]){await onCapture(e.target.files[0]);onClose();}}}/></label><button className="primary" disabled={!ready||capturing} onClick={capture}><Camera size={20}/>Capture photo</button></div>
  <p className="small">Review the photo on the next screen. You can retake it before selecting Analyze.</p>
 </dialog>;
}
