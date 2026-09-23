export const signed=(bits:string)=>parseInt(bits,2)-(bits[0]==='1'?2**bits.length:0);
export const bitsOf=(value:number,width:number)=>(value<0?2**width+value:value).toString(2).padStart(width,'0');
export const decoded=(m:string,e:string)=>signed(m)/2**(m.length-1)*2**signed(e);
export const isNormal=(m:string)=>m.startsWith('01')||m.startsWith('10');
export const nice=(n:number)=>Math.abs(n)>1e12||(n!==0&&Math.abs(n)<1e-9)?n.toExponential(8):Number(n.toPrecision(14)).toString();
export function tiesEven(x:number){const lo=Math.floor(x),part=x-lo;return Math.abs(part-.5)<1e-10?(lo%2===0?lo:lo+1):Math.round(x);}
export function encode(x:number,m=8,e=4,rule:'nearest'|'truncate'='nearest'):{m?:string;e?:string;stored?:number;error?:string;working?:string;exactIndex?:number}{
 if(!Number.isFinite(x))return{error:'Enter a finite number.'};if(x===0)return{m:'0'.repeat(m),e:'0'.repeat(e),stored:0,working:'Zero uses a separate all-zero rule.'};
 const q=2**(m-1),emin=-(2**(e-1)),emax=2**(e-1)-1;let exp=Math.floor(Math.log2(Math.abs(x)))+1;
 if(x<0&&Math.abs(x)===2**(exp-1))exp--;
 if(exp>emax)return{error:'Overflow: the value is beyond the range.'};if(exp<emin)return{error:'Underflow: this non-zero value is too close to zero.'};
 const exactIndex=x/2**exp*q;let i=rule==='nearest'?tiesEven(exactIndex):Math.floor(exactIndex);
 if(i>=q){i/=2;exp++}else if(i<0&&i>=-q/2){i*=2;exp--}
 if(exp>emax)return{error:'Overflow after rounding.'};if(exp<emin)return{error:'Underflow after normalisation.'};
 const stored=i/q*2**exp;return{m:bitsOf(i,m),e:bitsOf(exp,e),stored,exactIndex,working:`I = ${nice(i)}; M = ${nice(i)}/${q}; E = ${exp}; X = M × 2^E`};
}
