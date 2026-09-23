export type Role='student'|'teacher';
export type Envelope={version:1;algorithm:'AES-GCM';kdf:'PBKDF2-SHA256';iterations:number;salt:string;iv:string;ciphertext:string};
const encoder=new TextEncoder();

export function fromBase64(value:string):Uint8Array<ArrayBuffer>{return Uint8Array.from(atob(value),char=>char.charCodeAt(0));}
export function toBase64(value:ArrayBuffer):string{return btoa(String.fromCharCode(...new Uint8Array(value)));}
export function validateEnvelope(envelope:Envelope){
  if(envelope.version!==1||envelope.algorithm!=='AES-GCM'||envelope.kdf!=='PBKDF2-SHA256'||envelope.iterations!==600000||fromBase64(envelope.salt).length!==16||fromBase64(envelope.iv).length!==12)throw Error('This content package is not supported.');
}
export async function deriveContentKey(code:string,envelope:Envelope){
  validateEnvelope(envelope);
  const material=await crypto.subtle.importKey('raw',encoder.encode(code),'PBKDF2',false,['deriveKey']);
  return crypto.subtle.deriveKey({name:'PBKDF2',hash:'SHA-256',salt:fromBase64(envelope.salt),iterations:envelope.iterations},material,{name:'AES-GCM',length:256},true,['decrypt']);
}
export async function decryptContent<T>(role:Role,key:CryptoKey,envelope:Envelope):Promise<T>{
  validateEnvelope(envelope);
  const bytes=await crypto.subtle.decrypt({name:'AES-GCM',iv:fromBase64(envelope.iv),additionalData:encoder.encode(`algocore.chapter13.v1:${role}`),tagLength:128},key,fromBase64(envelope.ciphertext));
  return JSON.parse(new TextDecoder().decode(bytes)) as T;
}
