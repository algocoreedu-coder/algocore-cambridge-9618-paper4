// Independent QA event simulator. No product imports and no fixture-derived expected states.
// The finite schedules below are the teaching task; transitions enforce copying,
// next-hop forwarding and reservation rules rather than replay product snapshots.
export const TOPICS = [
 ['tcp-ip-stack-and-message-journey','tcp-ip-stack'],
 ['application-protocol-selection','application-protocols'],
 ['bittorrent-and-peer-to-peer-transfer','bittorrent'],
 ['packet-journey-and-routers','packet-routing'],
 ['choosing-a-switching-method','switching-methods'],
];
export const PROTOCOLS = {'scenario-web':'HTTP','scenario-file':'FTP','scenario-send':'SMTP','scenario-download':'POP3','scenario-sync':'IMAP','scenario-p2p':'BitTorrent'};
export const PIECES = ['A','B','C','D'];
export const PEERS = ['S','P','Q','L'];
const clone = structuredClone;
function collector(initial) {
 let state=clone(initial);const steps=[];
 return {initial:clone(initial),steps,push(id,change,extra={}){const before=clone(state);change(state);steps.push({id,before,after:clone(state),...extra});}};
}
export function torrentOracle(id) {
 if(!['complete','unavailable-piece'].includes(id))throw Error('Unknown QA task');
 const c=collector({inventories:{S:[...PIECES],P:['A','C'],Q:['B'],L:[]},online:{S:true,P:true,Q:true,L:true},metadataObtained:false,peersDiscovered:false,assembled:false,blockedPiece:null});
 const event=(name,fn)=>c.push(name,fn,{transfer:null});
 const transfer=(name,source,target,piece)=>c.push(name,s=>{
  if(!s.online[source]||!s.online[target]||!s.inventories[source].includes(piece)||s.inventories[target].includes(piece))throw Error('Invalid independently specified copy');
  s.inventories[target].push(piece);s.inventories[target].sort();
 },{transfer:{source,target,piece}});
 event('metadata',s=>{s.metadataObtained=true});event('discover-peers',s=>{s.peersDiscovered=true});
 transfer('receive-b','S','L','B');transfer('receive-a','P','L','A');transfer('share-a','L','Q','A');transfer('receive-c','P','L','C');
 if(id==='complete'){transfer('receive-d','S','L','D');event('assemble',s=>{s.assembled=PIECES.every(p=>s.inventories.L.includes(p))});}
 else{event('seed-departs',s=>{s.online.S=false});event('no-source',s=>{s.blockedPiece=PIECES.find(p=>!s.inventories.L.includes(p)&&!PEERS.some(peer=>s.online[peer]&&s.inventories[peer].includes(p)))??null});}
 return {id,initial:c.initial,steps:c.steps};
}
export const TOPOLOGY=[['Source','R1'],['R1','R2'],['R1','R3'],['R2','Destination'],['R3','Destination']];
export const PACKETS=[{id:'p1',order:1,payload:'NET',destination:'Destination'},{id:'p2',order:2,payload:'WO',destination:'Destination'},{id:'p3',order:3,payload:'RK',destination:'Destination'}];
export function routingOracle(id) {
 if(!['reroute','unavailable-route'].includes(id))throw Error('Unknown QA task');
 const row=(id,nextHop,priority=1)=>({id,destination:'Destination',nextHop,priority});
 const tables={R1:[row('r1-primary','R2'),...(id==='reroute'?[row('r1-alternative','R3',2)]:[])],R2:[row('r2-direct','Destination')],R3:[row('r3-direct','Destination')]};
 const c=collector({locations:{p1:'Source',p2:'Source',p3:'Source'},arrivalOrder:[],buffer:[],linkR1R2Up:id==='reroute',activePacket:null,activeRouter:null,matchedRow:null,chosenNextHop:null,assembled:false,message:null,stopped:false});
 const select=(s,packet,router,available)=>{
  const candidates=tables[router].filter(r=>r.destination===PACKETS.find(p=>p.id===packet).destination).sort((a,b)=>a.priority-b.priority);
  const r=candidates.find(r=>!available||!(router==='R1'&&r.nextHop==='R2')||s.linkR1R2Up);
  s.activePacket=packet;s.activeRouter=router;s.matchedRow=r?.id??null;s.chosenNextHop=r?.nextHop??null;return r;
 };
 const forward=(s,packet,router)=>{const r=select(s,packet,router,true);if(!r)throw Error('No route in independent event');if(s.locations[packet]!==router||!TOPOLOGY.some(([a,b])=>a===router&&b===r.nextHop))throw Error('Invalid next hop');s.locations[packet]=r.nextHop;if(r.nextHop==='Destination'){s.arrivalOrder.push(packet);s.buffer.push(packet);}};
 c.push('split',()=>{});c.push('read-destination',s=>{for(const p of PACKETS)s.locations[p.id]='R1';s.activePacket='p1';s.activeRouter='R1';});
 c.push('lookup-route',s=>select(s,'p1','R1',false));
 if(id==='unavailable-route'){c.push('unavailable-route',s=>{s.chosenNextHop=null;s.stopped=true;});return{id,tables,initial:c.initial,steps:c.steps};}
 c.push('forward-next-hop',s=>forward(s,'p1','R1'));
 c.push('link-unavailable',s=>{s.linkR1R2Up=false;s.activePacket=null;s.activeRouter='R1';s.matchedRow=null;s.chosenNextHop=null;});
 c.push('route-p2',s=>forward(s,'p2','R1'));c.push('arrive-p2',s=>forward(s,'p2','R3'));c.push('arrive-p1',s=>forward(s,'p1','R2'));c.push('route-p3',s=>forward(s,'p3','R1'));c.push('arrive-p3',s=>forward(s,'p3','R3'));
 c.push('reassemble',s=>{s.activePacket=null;s.activeRouter=null;s.matchedRow=null;s.chosenNextHop=null;s.assembled=PACKETS.every(p=>s.buffer.includes(p.id));s.message=s.assembled?[...PACKETS].sort((a,b)=>a.order-b.order).map(p=>p.payload).join(''):null;});
 return {id,tables,initial:c.initial,steps:c.steps};
}
export function switchingOracle(id,method) {
 if(!['continuous','bursty'].includes(id)||!['circuit','packet'].includes(method))throw Error('Unknown QA task');
 const units=id==='continuous'?['A1','A2','A3']:['A1','A2'];
 const c=collector({reservedForA:false,linkUse:'none',otherTrafficCanUseResource:true,delivered:[],complete:false,released:false});
 if(method==='circuit'){
  c.push('circuit-establish',()=>{});c.push('circuit-reserve',s=>{s.reservedForA=true;s.linkUse='idle';s.otherTrafficCanUseResource=false;});
  c.push('circuit-transmit-first',s=>{s.linkUse=units[0];s.delivered.push(units[0]);});
  c.push('circuit-interval',s=>{s.linkUse=id==='continuous'?units[1]:'idle';if(id==='continuous')s.delivered.push(units[1]);});
  c.push('circuit-transmit-last',s=>{s.linkUse=units.at(-1);s.delivered.push(units.at(-1));s.complete=true;});
  c.push('circuit-release',s=>{s.reservedForA=false;s.linkUse='none';s.otherTrafficCanUseResource=true;s.released=true;});
 }else{
  c.push('packet-split',()=>{});c.push('packet-share-first',s=>{s.linkUse=units[0]});c.push('packet-interval',s=>{s.linkUse=id==='continuous'?units[1]:'B1'});c.push('packet-share-last',s=>{s.linkUse=units.at(-1)});c.push('packet-deliver',s=>{s.linkUse='none';s.delivered=[...units]});c.push('packet-reassemble',s=>{s.complete=true});
 }
 return{id,method,units,preferredMethod:id==='continuous'?'circuit':'packet',initial:c.initial,steps:c.steps};
}
