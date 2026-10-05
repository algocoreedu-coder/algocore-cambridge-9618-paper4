import type { Localized } from "./catalog";
export type HardwareScaleKind = "risc-cisc" | "flynn-parallelism" | "virtual-machines";
export interface HardwareStep<S> { readonly id:string; readonly title:Localized; readonly action:Localized; readonly why:Localized; readonly outcome:Localized; readonly before:S; readonly after:S }
const L=(en:string,vi:string):Localized=>({en,vi});
function freeze<T>(value:T):T {if(value!==null&&typeof value==="object"&&!Object.isFrozen(value)){Object.values(value).forEach(freeze);Object.freeze(value);}return value;}
const riscProfiles = freeze({
  "risc": {
    "instructions": [
      "LOAD R1,X",
      "LOAD R2,Y",
      "ADD R3,R1,R2",
      "STORE Z,R3"
    ],
    "steps": [
      {
        "id": "ready",
        "title": {
          "en": "Same task, separate operations",
          "vi": "Cùng nhiệm vụ, các thao tác tách biệt"
        },
        "action": {
          "en": "Read X=7 and Y=5; the target is Z=X+Y.",
          "vi": "Đọc X=7 và Y=5; mục tiêu là Z=X+Y."
        },
        "why": {
          "en": "Compare identical work, not different problems.",
          "vi": "Phải so cùng công việc, không so hai bài toán khác nhau."
        },
        "outcome": {
          "en": "Z=0; no result has been stored.",
          "vi": "Z=0; chưa lưu kết quả."
        }
      },
      {
        "id": "load-x",
        "title": {
          "en": "Load the first operand",
          "vi": "Nạp toán hạng thứ nhất"
        },
        "action": {
          "en": "Execute LOAD R1,X.",
          "vi": "Thực hiện LOAD R1,X."
        },
        "why": {
          "en": "The load/store profile brings memory data into a register.",
          "vi": "Mô hình load/store đưa dữ liệu bộ nhớ vào thanh ghi."
        },
        "outcome": {
          "en": "R1=7; X and Z are unchanged.",
          "vi": "R1=7; X và Z không đổi."
        }
      },
      {
        "id": "load-y",
        "title": {
          "en": "Load the second operand",
          "vi": "Nạp toán hạng thứ hai"
        },
        "action": {
          "en": "Execute LOAD R2,Y.",
          "vi": "Thực hiện LOAD R2,Y."
        },
        "why": {
          "en": "Both operands must be available before the register addition.",
          "vi": "Phải có cả hai toán hạng trước khi cộng trên thanh ghi."
        },
        "outcome": {
          "en": "R2=5; R1 remains7.",
          "vi": "R2=5; R1 vẫn bằng7."
        }
      },
      {
        "id": "add",
        "title": {
          "en": "Add register operands",
          "vi": "Cộng toán hạng trong thanh ghi"
        },
        "action": {
          "en": "Execute ADD R3,R1,R2.",
          "vi": "Thực hiện ADD R3,R1,R2."
        },
        "why": {
          "en": "This arithmetic instruction acts on registers in the stated profile.",
          "vi": "Lệnh số học này thao tác trên thanh ghi trong mô hình đã nêu."
        },
        "outcome": {
          "en": "R3=12; Z is still0.",
          "vi": "R3=12; Z vẫn bằng0."
        }
      },
      {
        "id": "store",
        "title": {
          "en": "Store the result",
          "vi": "Lưu kết quả"
        },
        "action": {
          "en": "Execute STORE Z,R3.",
          "vi": "Thực hiện STORE Z,R3."
        },
        "why": {
          "en": "A separate store makes the result available at the memory destination.",
          "vi": "Lệnh store riêng đưa kết quả tới ô nhớ đích."
        },
        "outcome": {
          "en": "Z=12 after four symbolic instructions. No elapsed time is inferred.",
          "vi": "Z=12 sau bốn lệnh minh họa. Không suy ra thời gian thực hiện."
        }
      }
    ]
  },
  "cisc": {
    "instructions": [
      "ADDMEM Z,X,Y"
    ],
    "steps": [
      {
        "id": "ready",
        "title": {
          "en": "One complex instruction",
          "vi": "Một lệnh phức hợp"
        },
        "action": {
          "en": "Issue the symbolic instruction ADDMEM Z,X,Y.",
          "vi": "Phát lệnh minh họa ADDMEM Z,X,Y."
        },
        "why": {
          "en": "A complex instruction can package several operations behind one instruction.",
          "vi": "Một lệnh phức hợp có thể gói nhiều thao tác sau một lệnh."
        },
        "outcome": {
          "en": "X=7,Y=5,Z=0; the instruction has not completed.",
          "vi": "X=7,Y=5,Z=0; lệnh chưa hoàn tất."
        }
      },
      {
        "id": "read-operands",
        "title": {
          "en": "Read the operands internally",
          "vi": "Đọc toán hạng bên trong"
        },
        "action": {
          "en": "Read X and Y as internal work of ADDMEM.",
          "vi": "Đọc X và Y như công việc nội bộ của ADDMEM."
        },
        "why": {
          "en": "A short program still needs operands to be obtained.",
          "vi": "Chương trình ngắn vẫn phải lấy toán hạng."
        },
        "outcome": {
          "en": "Internal operands are7 and5; Z remains0.",
          "vi": "Toán hạng nội bộ là7 và5; Z vẫn bằng0."
        }
      },
      {
        "id": "execute-add",
        "title": {
          "en": "Compute the internal result",
          "vi": "Tính kết quả nội bộ"
        },
        "action": {
          "en": "Add the internal operands.",
          "vi": "Cộng các toán hạng nội bộ."
        },
        "why": {
          "en": "The arithmetic work remains necessary inside the complex instruction.",
          "vi": "Công việc số học vẫn cần thiết bên trong lệnh phức hợp."
        },
        "outcome": {
          "en": "Internal result=12; Z remains0.",
          "vi": "Kết quả nội bộ=12; Z vẫn bằng0."
        }
      },
      {
        "id": "write-result",
        "title": {
          "en": "Complete the memory result",
          "vi": "Hoàn tất kết quả trong bộ nhớ"
        },
        "action": {
          "en": "Write12 into Z and complete ADDMEM.",
          "vi": "Ghi12 vào Z và hoàn tất ADDMEM."
        },
        "why": {
          "en": "Instruction count and internal work are different measurements.",
          "vi": "Số lệnh và công việc nội bộ là hai đại lượng khác nhau."
        },
        "outcome": {
          "en": "Z=12 after one symbolic instruction; its phases are not assigned clocks.",
          "vi": "Z=12 sau một lệnh minh họa; không gán số nhịp cho các pha của nó."
        }
      }
    ]
  }
} as const);

export interface RiscState { readonly memory: Readonly<Record<string,number>>; readonly registers: Readonly<Record<string,number|null>>; readonly operands: readonly number[]|null; readonly internalResult:number|null; readonly activeInstruction:number|null; readonly activePath:readonly string[] }
export function riscCiscTrace(scenarioId:string,profile:"risc"|"cisc") {
  if(scenarioId!=="add-memory"||!Object.hasOwn(riscProfiles,profile))throw new RangeError("Unsupported architecture scenario");
  let state:RiscState=freeze({memory:{X:7,Y:5,Z:0},registers:{R1:null,R2:null,R3:null},operands:null,internalResult:null,activeInstruction:null,activePath:[]});const initial=state;
  const steps:HardwareStep<RiscState>[]=riscProfiles[profile].steps.map(copy=>{const before=state;const memory={...state.memory},registers={...state.registers};let operands=state.operands,internalResult=state.internalResult,activeInstruction:number|null=null,activePath:string[]=[];
    switch(copy.id){case "load-x":registers.R1=memory.X;activeInstruction=0;activePath=["memory","registers"];break;case "load-y":registers.R2=memory.Y;activeInstruction=1;activePath=["memory","registers"];break;case "add":registers.R3=registers.R1!+registers.R2!;activeInstruction=2;activePath=["registers","alu","registers"];break;case "store":memory.Z=registers.R3!;activeInstruction=3;activePath=["registers","memory"];break;case "read-operands":operands=[memory.X,memory.Y];activeInstruction=0;activePath=["memory","internal"];break;case "execute-add":internalResult=operands!.reduce((sum,value)=>sum+value,0);activeInstruction=0;activePath=["internal","alu"];break;case "write-result":memory.Z=internalResult!;activeInstruction=0;activePath=["alu","memory"];break;}
    state=freeze({memory,registers,operands,internalResult,activeInstruction,activePath});return freeze({...copy,before,after:state});});
  return freeze({id:scenarioId,profile,instructions:riscProfiles[profile].instructions,initial,steps});
}
export const flynnScenarios=freeze([
 {id:"sisd",label:L("SISD · one instruction, one data stream","SISD · một luồng lệnh, một luồng dữ liệu"),instructionStreams:1,dataStreams:1,operations:["add1"],inputs:[4]},
 {id:"simd",label:L("SIMD · one instruction, multiple data streams","SIMD · một luồng lệnh, nhiều luồng dữ liệu"),instructionStreams:1,dataStreams:4,operations:["add1","add1","add1","add1"],inputs:[2,4,6,8]},
 {id:"misd",label:L("MISD · multiple instructions, one data stream","MISD · nhiều luồng lệnh, một luồng dữ liệu"),instructionStreams:3,dataStreams:1,operations:["add1","times2","times3"],inputs:[6,6,6]},
 {id:"mimd",label:L("MIMD · independent instructions and data","MIMD · các luồng lệnh và dữ liệu độc lập"),instructionStreams:3,dataStreams:3,operations:["add1","times2","times3"],inputs:[2,4,6]},
 {id:"mpp-sum",label:L("Massive parallelism · partition and combine","Song song quy mô lớn · chia và gộp"),instructionStreams:null,dataStreams:null,operations:["sum","sum","sum","sum"],inputs:[0,0,0,0]},
] as const);
export interface FlynnState { readonly instructionStreams:number|null;readonly dataStreams:number|null;readonly lanes:readonly {readonly id:string;readonly operation:string;readonly input:readonly number[];readonly output:number|null}[];readonly dispatched:boolean;readonly partialsSent:boolean;readonly combined:number|null;readonly classificationVisible:boolean }
function mppNarration(id:string,state:FlynnState){const sums=state.lanes.map(lane=>lane.output??"?").join(" + ");const copies:Record<string,{action:Localized;why:Localized;outcome:Localized}>={
 partition:{action:L(`Distribute partitions ${state.lanes.map(lane=>`${lane.id}=[${lane.input.join(", ")}]`).join("; ")}.`,`Phân phối các phần ${state.lanes.map(lane=>`${lane.id}=[${lane.input.join(", ")}]`).join("; ")}.`),why:L("Independent parts of the input can be assigned to different processing lanes.","Có thể giao các phần dữ liệu độc lập cho những nhánh xử lý khác nhau."),outcome:L("All eight inputs are assigned once; no local sum has been computed yet.","Cả tám đầu vào được giao đúng một lần; chưa tính tổng cục bộ.")},
 "local-compute":{action:L("Each lane sums the two values in its own partition.","Mỗi nhánh cộng hai giá trị trong phần của mình."),why:L("This local operation does not need another lane's partial result.","Thao tác cục bộ này không cần tổng thành phần từ nhánh khác."),outcome:L(state.lanes.map(lane=>`${lane.id}=${lane.output}`).join("; "),state.lanes.map(lane=>`${lane.id}=${lane.output}`).join("; "))},
 "send-partials":{action:L(`Send the partial sums ${sums} to the combining stage.`,`Gửi các tổng thành phần ${sums} tới khâu gộp.`),why:L("The final aggregation needs the local results to be communicated.","Phép gộp cuối cần các kết quả cục bộ được truyền tới."),outcome:L(`Partial results sent: ${state.partialsSent?"yes":"no"}; the combined sum is not computed yet.`,`Đã gửi kết quả thành phần: ${state.partialsSent?"có":"chưa"}; chưa tính tổng gộp.`)},
 combine:{action:L(`Add the received partial sums: ${sums}.`,`Cộng các tổng thành phần đã nhận: ${sums}.`),why:L("Combining all partitions produces the result for the complete input.","Gộp mọi phần tạo kết quả cho toàn bộ đầu vào."),outcome:L(`Combined sum = ${state.combined}.`,`Tổng gộp = ${state.combined}.`)},
 "check-cost":{action:L("Identify the communication and combination work in addition to local computation.","Chỉ ra công việc truyền và gộp ngoài phần tính toán cục bộ."),why:L("Coordination costs and available parallel work limit practical speed-up; this trace assigns no times.","Chi phí phối hợp và lượng công việc song song giới hạn mức tăng tốc thực tế; minh họa không gán thời gian."),outcome:L(`The result remains ${state.combined}; four illustrative lanes do not establish a fourfold speed-up.`,`Kết quả vẫn là ${state.combined}; bốn nhánh minh họa không chứng minh tăng tốc gấp bốn.`)},
 };return copies[id];}
export function flynnTrace(id:string){const example=flynnScenarios.find(item=>item.id===id);if(!example)throw new RangeError("Unsupported Flynn example");const mpp=id==="mpp-sum";const partitions=[[1,2],[3,4],[5,6],[7,8]];
 let state:FlynnState=freeze({instructionStreams:example.instructionStreams,dataStreams:example.dataStreams,lanes:example.operations.map((operation,index)=>({id:`P${index+1}`,operation,input:mpp?partitions[index]:[example.inputs[index]],output:null})),dispatched:false,partialsSent:false,combined:null,classificationVisible:false});const initial=state;
 const ids=mpp?["partition","local-compute","send-partials","combine","check-cost"]:["identify-streams","dispatch","compute","classify"];
 const titles:Record<string,Localized>={"identify-streams":L("Identify instruction and data streams","Xác định luồng lệnh và dữ liệu"),dispatch:L("Dispatch to processing lanes","Chuyển tới các nhánh xử lý"),compute:L("Compute each lane's result","Tính kết quả từng nhánh"),classify:L("Classify by independent streams","Phân loại theo luồng độc lập"),partition:L("Partition the work","Chia công việc"),"local-compute":L("Compute local partial sums","Tính tổng cục bộ"),"send-partials":L("Send partial results","Gửi kết quả thành phần"),combine:L("Combine the partial sums","Gộp các tổng thành phần"),"check-cost":L("Account for coordination","Xét chi phí phối hợp")};
 const steps:HardwareStep<FlynnState>[]=ids.map(stepId=>{const before=state;const compute=stepId==="compute"||stepId==="local-compute";state=freeze({...state,dispatched:state.dispatched||["dispatch","partition","local-compute"].includes(stepId),lanes:compute?state.lanes.map(lane=>({...lane,output:lane.operation==="sum"?lane.input.reduce((a,b)=>a+b,0):lane.operation==="add1"?lane.input[0]+1:lane.operation==="times2"?lane.input[0]*2:lane.input[0]*3})):state.lanes,partialsSent:state.partialsSent||stepId==="send-partials",combined:stepId==="combine"?state.lanes.reduce((sum,lane)=>sum+lane.output!,0):state.combined,classificationVisible:stepId==="classify"});const narration=mpp?mppNarration(stepId,state):{action:L(`Instruction streams: ${state.instructionStreams}; data streams: ${state.dataStreams}.`,`Luồng lệnh: ${state.instructionStreams}; luồng dữ liệu: ${state.dataStreams}.`),why:L("Count independent streams, not just the number of processors or different values shown.","Đếm luồng độc lập, không chỉ đếm số bộ xử lý hay các giá trị khác nhau hiển thị."),outcome:L(state.lanes.map(l=>`${l.id}: ${l.output??"pending"}`).join("; "),state.lanes.map(l=>`${l.id}: ${l.output??"chưa tính"}`).join("; "))};return freeze({id:stepId,title:titles[stepId],before,after:state,...narration});});return freeze({id,label:example.label,initial,steps});}

export interface VmGuest {readonly id:string;readonly ramGiB:number;readonly status:"running"|"stopped"}
export interface VmState {readonly capacityGiB:number;readonly reserveGiB:number;readonly guests:readonly VmGuest[];readonly hostRunning:boolean}
export type VmAction={readonly type:"create"|"resize";readonly vm:string;readonly ramGiB:number}|{readonly type:"start"|"stop";readonly vm:string};
export function vmInitialState():VmState{return freeze({capacityGiB:16,reserveGiB:4,guests:[{id:"A",ramGiB:4,status:"running"},{id:"B",ramGiB:4,status:"running"}],hostRunning:true});}
export function vmUsage(state:VmState){const usedGiB=state.reserveGiB+state.guests.reduce((total,guest)=>total+guest.ramGiB,0);return freeze({usedGiB,freeGiB:state.capacityGiB-usedGiB});}
export function vmTransition(before:VmState,action:VmAction){const guest=before.guests.find(item=>item.id===action.vm);let reason="allowed";let requestedUsedGiB=vmUsage(before).usedGiB;let guests=[...before.guests];
 if(!/^[A-C]$/.test(action.vm))reason="unknown-id";else if(action.type==="create"&&guest)reason="duplicate";else if(action.type!=="create"&&!guest)reason="missing";else if((action.type==="create"||action.type==="resize")&&(!Number.isInteger(action.ramGiB)||action.ramGiB<1))reason="ram";else if(action.type==="resize"&&guest!.status!=="stopped")reason="running";else if(action.type==="create"||action.type==="resize"){requestedUsedGiB=vmUsage(before).usedGiB+(action.type==="create"?action.ramGiB:action.ramGiB-guest!.ramGiB);if(requestedUsedGiB>before.capacityGiB)reason="capacity";else guests=action.type==="create"?[...guests,{id:action.vm,ramGiB:action.ramGiB,status:"stopped"}]:guests.map(item=>item.id===action.vm?{...item,ramGiB:action.ramGiB}:item);}else guests=guests.map(item=>item.id===action.vm?{...item,status:action.type==="start"?"running":"stopped"}:item);
 const verb=({create:"tạo",start:"chạy",stop:"dừng",resize:"đổi RAM"} as Record<string,string>)[action.type];const allowed=reason==="allowed",after=allowed?freeze({...before,guests}):before;const explanations:Record<string,Localized>={allowed:L(`${action.type} ${action.vm} accepted; reserved RAM is ${vmUsage(after).usedGiB}/${before.capacityGiB} GiB.`,`Chấp nhận ${verb} ${action.vm}; RAM đã giữ chỗ là ${vmUsage(after).usedGiB}/${before.capacityGiB} GiB.`),"unknown-id":L("Use a declared guest ID A, B or C.","Dùng ID máy khách A, B hoặc C."),duplicate:L("Rejected: this guest ID already exists.","Từ chối: ID máy khách đã tồn tại."),missing:L("Rejected: create the guest before using it.","Từ chối: phải tạo máy khách trước."),ram:L("RAM must be a positive whole number of GiB.","RAM phải là số nguyên GiB dương."),running:L("Rejected: stop the guest before resizing its reserved RAM.","Từ chối: dừng máy khách trước khi đổi RAM giữ chỗ."),capacity:L(`Rejected: ${requestedUsedGiB} GiB requested exceeds ${before.capacityGiB} GiB. The previous allocation is preserved.`,`Từ chối: yêu cầu ${requestedUsedGiB} GiB vượt ${before.capacityGiB} GiB. Giữ nguyên phân bổ trước.`)};return freeze({before,after,action,allowed,reason,requestedUsedGiB,feedback:explanations[reason]});}
export const vmScenarios=freeze([{id:"guest-request",label:L("Follow a guest disk request","Theo dõi yêu cầu đĩa của máy khách")},{id:"allocate-a",label:L("Capacity estimate: A +2 GiB","Dự tính dung lượng: A +2 GiB")},{id:"deny-b",label:L("Capacity estimate: reject B +6 GiB","Dự tính dung lượng: từ chối B +6 GiB")},{id:"guest-failure",label:L("A contained guest failure","Sự cố được cô lập trong máy khách")},{id:"lifecycle",label:L("Create, run, stop and resize","Tạo, chạy, dừng và đổi RAM")}]);
const vmRequestNarration:Readonly<Record<string,{readonly action:Localized;readonly why:Localized;readonly outcome:Localized}>>=freeze({
  "ready": {
    "action": {
      "en": "Identify application, guest OS, hypervisor, host OS and hardware.",
      "vi": "Xác định ứng dụng, guest OS, hypervisor, host OS và phần cứng."
    },
    "why": {
      "en": "Roles must be clear before following control.",
      "vi": "Phải rõ vai trò trước khi theo điều khiển."
    },
    "outcome": {
      "en": "The guest sees virtual devices; physical storage is shared host hardware.",
      "vi": "Guest thấy thiết bị ảo; lưu trữ vật lý là phần cứng host dùng chung."
    }
  },
  "application-request": {
    "action": {
      "en": "The application requests a disk read.",
      "vi": "Ứng dụng yêu cầu đọc đĩa."
    },
    "why": {
      "en": "Applications normally request OS services rather than directly controlling physical devices.",
      "vi": "Ứng dụng thường yêu cầu dịch vụ OS thay vì trực tiếp điều khiển thiết bị vật lý."
    },
    "outcome": {
      "en": "The request reaches the guest OS.",
      "vi": "Yêu cầu tới guest OS."
    }
  },
  "guest-os": {
    "action": {
      "en": "The guest OS addresses its virtual disk.",
      "vi": "Guest OS truy cập đĩa ảo của nó."
    },
    "why": {
      "en": "Its device view belongs to the virtual environment.",
      "vi": "Góc nhìn thiết bị của nó thuộc môi trường ảo."
    },
    "outcome": {
      "en": "A virtual-device request is ready for mediation.",
      "vi": "Yêu cầu thiết bị ảo sẵn sàng được làm trung gian."
    }
  },
  "hypervisor": {
    "action": {
      "en": "The hypervisor mediates the virtual resource request.",
      "vi": "Hypervisor làm trung gian yêu cầu tài nguyên ảo."
    },
    "why": {
      "en": "It connects the guest’s abstraction to managed host resources.",
      "vi": "Nó nối sự trừu tượng của guest với tài nguyên host được quản lý."
    },
    "outcome": {
      "en": "The appropriate host resource access is requested.",
      "vi": "Truy cập tài nguyên host phù hợp được yêu cầu."
    }
  },
  "host-os": {
    "action": {
      "en": "The host OS manages the physical resource access.",
      "vi": "Host OS quản lý truy cập tài nguyên vật lý."
    },
    "why": {
      "en": "In this hosted model it controls the real hardware.",
      "vi": "Trong mô hình hosted này nó điều khiển phần cứng thật."
    },
    "outcome": {
      "en": "Physical storage receives the managed read operation.",
      "vi": "Lưu trữ vật lý nhận thao tác đọc được quản lý."
    }
  },
  "physical-resource": {
    "action": {
      "en": "Read the required data using the physical device.",
      "vi": "Đọc dữ liệu cần thiết bằng thiết bị vật lý."
    },
    "why": {
      "en": "A virtual disk still needs underlying storage.",
      "vi": "Đĩa ảo vẫn cần lưu trữ bên dưới."
    },
    "outcome": {
      "en": "The data is available to return through the managed layers.",
      "vi": "Dữ liệu sẵn sàng trả về qua các lớp quản lý."
    }
  },
  "return-result": {
    "action": {
      "en": "Return the data to the guest application.",
      "vi": "Trả dữ liệu cho ứng dụng guest."
    },
    "why": {
      "en": "The guest uses the virtual interface without becoming the physical host.",
      "vi": "Guest dùng giao diện ảo mà không trở thành host vật lý."
    },
    "outcome": {
      "en": "The request is served; no response time has been inferred.",
      "vi": "Yêu cầu được phục vụ; không suy ra thời gian đáp ứng."
    }
  }
});
export interface VmTraceState {readonly machine:VmState;readonly activeLayer:string|null;readonly decision:"none"|"pending"|"allowed"|"denied";readonly requestedUsedGiB:number|null;readonly completed:boolean}
export function virtualMachineTrace(id:string){if(!vmScenarios.some(item=>item.id===id))throw new RangeError("Unsupported VM scenario");let state:VmTraceState=freeze({machine:vmInitialState(),activeLayer:null,decision:"none",requestedUsedGiB:null,completed:false});const initial=state;
 const lifecycle:readonly (VmAction&{readonly id:string})[]=[{id:"create-c",type:"create",vm:"C",ramGiB:2},{id:"start-c",type:"start",vm:"C"},{id:"stop-a",type:"stop",vm:"A"},{id:"resize-a",type:"resize",vm:"A",ramGiB:6},{id:"start-a",type:"start",vm:"A"},{id:"stop-b",type:"stop",vm:"B"},{id:"reject-b",type:"resize",vm:"B",ramGiB:10}];
 const ids=id==="guest-request"?["ready","application-request","guest-os","hypervisor","host-os","physical-resource","return-result"]:id==="guest-failure"?["ready","guest-a-fails","isolation-check"]:id==="lifecycle"?["ready",...lifecycle.map(action=>action.id)]:["ready","request","capacity-check",id==="allocate-a"?"apply":"deny"];
 const labels:Record<string,Localized>={ready:L("Initial host and guests","Máy chủ và máy khách ban đầu"),"application-request":L("Guest application requests a disk block","Ứng dụng máy khách yêu cầu khối đĩa"),"guest-os":L("Guest operating system","Hệ điều hành máy khách"),hypervisor:L("Virtualisation layer mediates","Lớp ảo hóa trung gian"),"host-os":L("Host operating system","Hệ điều hành máy chủ"),"physical-resource":L("Shared physical storage","Bộ lưu trữ vật lý dùng chung"),"return-result":L("Return the requested result","Trả kết quả yêu cầu"),request:L("Request a RAM increase","Yêu cầu tăng RAM"),"capacity-check":L("Check host capacity","Kiểm tra dung lượng máy chủ"),apply:L("Apply the permitted allocation","Áp dụng phân bổ được phép"),deny:L("Preserve allocation after denial","Giữ phân bổ sau khi từ chối"),"guest-a-fails":L("Guest A stops after a contained fault","Máy khách A dừng do sự cố đã cô lập"),"isolation-check":L("Inspect unaffected components","Kiểm tra thành phần không bị ảnh hưởng")};
 const steps:HardwareStep<VmTraceState>[]=ids.map(stepId=>{const before=state;let title=labels[stepId]??L(stepId,stepId),action=L("Inspect the shared host resources.","Quan sát tài nguyên máy chủ dùng chung."),outcome=L("No allocation change.","Chưa thay đổi phân bổ.");
 if(id==="lifecycle"&&stepId!=="ready"){const command=lifecycle.find(item=>item.id===stepId)!;const result=vmTransition(state.machine,command);state=freeze({...state,machine:result.after,decision:result.allowed?"allowed":"denied",requestedUsedGiB:result.requestedUsedGiB});title=L(`${command.type} guest ${command.vm}`,`${({create:"Tạo",start:"Chạy",stop:"Dừng",resize:"Đổi RAM"} as Record<string,string>)[command.type]} máy khách ${command.vm}`);action=L(`${command.type} ${command.vm}${"ramGiB"in command?` → ${command.ramGiB} GiB`:""}`,`${({create:"Tạo",start:"Chạy",stop:"Dừng",resize:"Đổi RAM"} as Record<string,string>)[command.type]} ${command.vm}${"ramGiB"in command?` → ${command.ramGiB} GiB`:""}`);outcome=result.feedback;}
 else if(id==="guest-request"){const layer=stepId==="application-request"?"application":stepId==="ready"||stepId==="return-result"?null:stepId;state=freeze({...state,activeLayer:layer,completed:stepId==="return-result"});action=L("Read a virtual disk block through the declared hosted stack.","Đọc khối đĩa ảo qua mô hình hosted đã khai báo.");outcome=stepId==="return-result"?L("The result returns to the guest application.","Kết quả trở về ứng dụng máy khách."):L(`Active boundary: ${layer??"none"}.`,`Ranh giới đang xét: ${layer??"chưa có"}.`);}
 else if(id==="guest-failure"&&stepId!=="ready"){state=freeze({...state,machine:{...state.machine,guests:state.machine.guests.map(g=>g.id==="A"?{...g,status:"stopped"}:g)}});action=L("Stop A under the stated contained-guest-fault assumption.","Dừng A theo giả định sự cố máy khách được cô lập.");outcome=L("A stopped; B and the host remain running in this model. This is not an absolute security guarantee.","A dừng; B và máy chủ vẫn chạy trong mô hình này. Đây không phải bảo đảm bảo mật tuyệt đối.");}
 else if((id==="allocate-a"||id==="deny-b")&&stepId!=="ready"){const requested=vmUsage(initial.machine).usedGiB+(id==="allocate-a"?2:6);const decision=stepId==="request"?"pending":requested<=state.machine.capacityGiB?"allowed":"denied";state=freeze({...state,requestedUsedGiB:requested,decision,machine:stepId==="apply"?{...state.machine,guests:state.machine.guests.map(g=>g.id==="A"?{...g,ramGiB:g.ramGiB+2}:g)}:state.machine});action=L(`Capacity-only estimate: ${requested} GiB including host reserve.`,`Dự tính riêng dung lượng: ${requested} GiB gồm phần máy chủ dự phòng.`);outcome=L(`${decision}; used ${vmUsage(state.machine).usedGiB}, free ${vmUsage(state.machine).freeGiB} GiB.`,`${decision==="pending"?"đang xét":decision==="allowed"?"được phép":"từ chối"}; dùng ${vmUsage(state.machine).usedGiB}, còn ${vmUsage(state.machine).freeGiB} GiB.`);}
 const requestCopy=id==="guest-request"?vmRequestNarration[stepId]:null;return freeze({id:stepId,title,action:requestCopy?.action??action,why:requestCopy?.why??L("This hosted, no-overcommit teaching model has 16 GiB capacity and 4 GiB host reserve. Stopping a guest retains its RAM reservation; interactive resizing requires a stopped guest.","Mô hình hosted không overcommit này có16 GiB và dự phòng máy chủ4 GiB. Dừng máy khách vẫn giữ chỗ RAM; thao tác đổi RAM yêu cầu máy khách đã dừng."),outcome:requestCopy?.outcome??outcome,before,after:state});});return freeze({id,initial,steps});}
