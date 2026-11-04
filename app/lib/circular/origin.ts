// Use an operator-configured public origin behind a reverse proxy. Never trust
// forwarded host headers supplied by callers to expand the allowed origins.
export function isAllowedOrigin(request:Request, publicOrigin?:string){
 const origin=request.headers.get('origin');
 if(!origin)return true;
 try{
  const expected=new URL(publicOrigin||request.url);
  const supplied=new URL(origin);
  return ['https:','http:'].includes(expected.protocol) && supplied.origin===expected.origin;
 }catch{return false;}
}
