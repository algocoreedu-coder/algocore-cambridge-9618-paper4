import type { Localized } from "./catalog";
export type HardwareVisualKind = "risc-cisc" | "pipeline-registers-interrupts" | "flynn-parallelism" | "virtual-machines";
export type PipelineStage = "IF" | "ID" | "OF" | "IE" | "WB";
export type PipelineScenarioId = "ideal" | "interrupt-flush";
export interface PipelineBuffer { readonly instructionId: string; readonly nextStage: PipelineStage; readonly destination?: string; readonly operands?: readonly number[]; readonly result?: number }
export interface SavedPipelineContext { readonly registers: Readonly<Record<string,number>>; readonly status: Readonly<Record<string,number>>; readonly restartPC: string }
export interface PipelineState {
  readonly clock: number; readonly phase: string;
  readonly stageOccupancy: Readonly<Record<PipelineStage,string|null>>;
  readonly boundaryRegisters: Readonly<Record<string,PipelineBuffer|null>>;
  readonly registers: Readonly<Record<string,number>>;
  readonly status: Readonly<Record<string,number>>;
  readonly completed: readonly string[]; readonly nextFetch: string|null; readonly restartPC: string|null;
  readonly discarded: readonly string[]; readonly savedContext: SavedPipelineContext|null;
  readonly contextRestored: boolean; readonly handlerComplete: boolean;
}
export interface PipelineStep { readonly id:string; readonly title:Localized; readonly action:Localized; readonly why:Localized; readonly outcome:Localized; readonly before:PipelineState; readonly after:PipelineState }
export interface PipelineTrace {
  readonly id:PipelineScenarioId; readonly stages:readonly PipelineStage[];
  readonly instructions:readonly {readonly id:string;readonly destination:string;readonly operands:readonly number[];readonly result:number}[];
  readonly stageClockCost:number; readonly initial:PipelineState; readonly steps:readonly PipelineStep[];
  readonly metrics:{readonly singleInstructionLatencyClocks:number;readonly idealCompletionIntervalClocks:number;readonly nonPipelinedClocksForSix:number;readonly idealPipelineClocksForSix:number;readonly applicationClocksInThisTrace:number;readonly handlerDurationClocks:null};
}
function deepFreeze<T>(value:T):T { if(value!==null&&typeof value==="object"&&!Object.isFrozen(value)){Object.values(value).forEach(deepFreeze);Object.freeze(value);}return value; }
// Teacher-approved finite clock/event snapshots. These do not simulate a real ISA.
const pipelineData:readonly PipelineTrace[] = deepFreeze([
  {
    "id": "ideal",
    "stages": [
      "IF",
      "ID",
      "OF",
      "IE",
      "WB"
    ],
    "instructions": [
      {
        "id": "I1",
        "destination": "R1",
        "operands": [
          2,
          3
        ],
        "result": 5
      },
      {
        "id": "I2",
        "destination": "R2",
        "operands": [
          4,
          5
        ],
        "result": 9
      },
      {
        "id": "I3",
        "destination": "R3",
        "operands": [
          6,
          7
        ],
        "result": 13
      },
      {
        "id": "I4",
        "destination": "R4",
        "operands": [
          8,
          9
        ],
        "result": 17
      },
      {
        "id": "I5",
        "destination": "R5",
        "operands": [
          10,
          11
        ],
        "result": 21
      },
      {
        "id": "I6",
        "destination": "R6",
        "operands": [
          12,
          13
        ],
        "result": 25
      }
    ],
    "stageClockCost": 1,
    "initial": {
      "clock": 0,
      "phase": "ready",
      "stageOccupancy": {
        "IF": null,
        "ID": null,
        "OF": null,
        "IE": null,
        "WB": null
      },
      "boundaryRegisters": {
        "IF_ID": null,
        "ID_OF": null,
        "OF_IE": null,
        "IE_WB": null
      },
      "registers": {
        "R1": 0,
        "R2": 0,
        "R3": 0,
        "R4": 0,
        "R5": 0,
        "R6": 0
      },
      "status": {
        "Z": 0
      },
      "completed": [],
      "nextFetch": "I1",
      "restartPC": null,
      "discarded": [],
      "savedContext": null,
      "contextRestored": false,
      "handlerComplete": false
    },
    "steps": [
      {
        "id": "ready",
        "title": {
          "en": "Read the model",
          "vi": "Đọc quy ước mô hình"
        },
        "action": {
          "en": "Prepare six independent register-result instructions.",
          "vi": "Chuẩn bị sáu lệnh độc lập ghi vào các thanh ghi riêng."
        },
        "why": {
          "en": "One stage takes one clock; no data dependency, branch or resource conflict is modelled.",
          "vi": "Mỗi giai đoạn dùng một nhịp; mô hình không có phụ thuộc dữ liệu, nhánh hoặc tranh chấp tài nguyên."
        },
        "outcome": {
          "en": "The pipeline is empty; no result has committed.",
          "vi": "Pipeline rỗng; chưa có kết quả cuối được ghi."
        },
        "before": {
          "clock": 0,
          "phase": "ready",
          "stageOccupancy": {
            "IF": null,
            "ID": null,
            "OF": null,
            "IE": null,
            "WB": null
          },
          "boundaryRegisters": {
            "IF_ID": null,
            "ID_OF": null,
            "OF_IE": null,
            "IE_WB": null
          },
          "registers": {
            "R1": 0,
            "R2": 0,
            "R3": 0,
            "R4": 0,
            "R5": 0,
            "R6": 0
          },
          "status": {
            "Z": 0
          },
          "completed": [],
          "nextFetch": "I1",
          "restartPC": null,
          "discarded": [],
          "savedContext": null,
          "contextRestored": false,
          "handlerComplete": false
        },
        "after": {
          "clock": 0,
          "phase": "ready",
          "stageOccupancy": {
            "IF": null,
            "ID": null,
            "OF": null,
            "IE": null,
            "WB": null
          },
          "boundaryRegisters": {
            "IF_ID": null,
            "ID_OF": null,
            "OF_IE": null,
            "IE_WB": null
          },
          "registers": {
            "R1": 0,
            "R2": 0,
            "R3": 0,
            "R4": 0,
            "R5": 0,
            "R6": 0
          },
          "status": {
            "Z": 0
          },
          "completed": [],
          "nextFetch": "I1",
          "restartPC": null,
          "discarded": [],
          "savedContext": null,
          "contextRestored": false,
          "handlerComplete": false
        }
      },
      {
        "id": "cycle-1",
        "title": {
          "en": "Application clock 1",
          "vi": "Nhịp chương trình 1"
        },
        "action": {
          "en": "Advance each issued instruction by one stage: IF: I1; ID: —; OF: —; IE: —; WB: —.",
          "vi": "Cho mỗi lệnh đã đưa vào tiến một giai đoạn: IF: I1; ID: —; OF: —; IE: —; WB: —."
        },
        "why": {
          "en": "Separate stages can operate concurrently; boundary registers retain the information required by the next stage.",
          "vi": "Các giai đoạn riêng có thể hoạt động đồng thời; thanh ghi ranh giới giữ thông tin cần cho giai đoạn kế tiếp."
        },
        "outcome": {
          "en": "End-of-clock boundary registers now describe the next stage inputs. No instruction commits on this clock.",
          "vi": "Thanh ghi ở cuối nhịp hiện chứa đầu vào cho giai đoạn tiếp theo. Không có lệnh nào ghi kết quả cuối ở nhịp này."
        },
        "before": {
          "clock": 0,
          "phase": "ready",
          "stageOccupancy": {
            "IF": null,
            "ID": null,
            "OF": null,
            "IE": null,
            "WB": null
          },
          "boundaryRegisters": {
            "IF_ID": null,
            "ID_OF": null,
            "OF_IE": null,
            "IE_WB": null
          },
          "registers": {
            "R1": 0,
            "R2": 0,
            "R3": 0,
            "R4": 0,
            "R5": 0,
            "R6": 0
          },
          "status": {
            "Z": 0
          },
          "completed": [],
          "nextFetch": "I1",
          "restartPC": null,
          "discarded": [],
          "savedContext": null,
          "contextRestored": false,
          "handlerComplete": false
        },
        "after": {
          "clock": 1,
          "phase": "fill",
          "stageOccupancy": {
            "IF": "I1",
            "ID": null,
            "OF": null,
            "IE": null,
            "WB": null
          },
          "boundaryRegisters": {
            "IF_ID": {
              "instructionId": "I1",
              "nextStage": "ID"
            },
            "ID_OF": null,
            "OF_IE": null,
            "IE_WB": null
          },
          "registers": {
            "R1": 0,
            "R2": 0,
            "R3": 0,
            "R4": 0,
            "R5": 0,
            "R6": 0
          },
          "status": {
            "Z": 0
          },
          "completed": [],
          "nextFetch": "I2",
          "restartPC": null,
          "discarded": [],
          "savedContext": null,
          "contextRestored": false,
          "handlerComplete": false
        }
      },
      {
        "id": "cycle-2",
        "title": {
          "en": "Application clock 2",
          "vi": "Nhịp chương trình 2"
        },
        "action": {
          "en": "Advance each issued instruction by one stage: IF: I2; ID: I1; OF: —; IE: —; WB: —.",
          "vi": "Cho mỗi lệnh đã đưa vào tiến một giai đoạn: IF: I2; ID: I1; OF: —; IE: —; WB: —."
        },
        "why": {
          "en": "Separate stages can operate concurrently; boundary registers retain the information required by the next stage.",
          "vi": "Các giai đoạn riêng có thể hoạt động đồng thời; thanh ghi ranh giới giữ thông tin cần cho giai đoạn kế tiếp."
        },
        "outcome": {
          "en": "End-of-clock boundary registers now describe the next stage inputs. No instruction commits on this clock.",
          "vi": "Thanh ghi ở cuối nhịp hiện chứa đầu vào cho giai đoạn tiếp theo. Không có lệnh nào ghi kết quả cuối ở nhịp này."
        },
        "before": {
          "clock": 1,
          "phase": "fill",
          "stageOccupancy": {
            "IF": "I1",
            "ID": null,
            "OF": null,
            "IE": null,
            "WB": null
          },
          "boundaryRegisters": {
            "IF_ID": {
              "instructionId": "I1",
              "nextStage": "ID"
            },
            "ID_OF": null,
            "OF_IE": null,
            "IE_WB": null
          },
          "registers": {
            "R1": 0,
            "R2": 0,
            "R3": 0,
            "R4": 0,
            "R5": 0,
            "R6": 0
          },
          "status": {
            "Z": 0
          },
          "completed": [],
          "nextFetch": "I2",
          "restartPC": null,
          "discarded": [],
          "savedContext": null,
          "contextRestored": false,
          "handlerComplete": false
        },
        "after": {
          "clock": 2,
          "phase": "fill",
          "stageOccupancy": {
            "IF": "I2",
            "ID": "I1",
            "OF": null,
            "IE": null,
            "WB": null
          },
          "boundaryRegisters": {
            "IF_ID": {
              "instructionId": "I2",
              "nextStage": "ID"
            },
            "ID_OF": {
              "instructionId": "I1",
              "nextStage": "OF",
              "destination": "R1"
            },
            "OF_IE": null,
            "IE_WB": null
          },
          "registers": {
            "R1": 0,
            "R2": 0,
            "R3": 0,
            "R4": 0,
            "R5": 0,
            "R6": 0
          },
          "status": {
            "Z": 0
          },
          "completed": [],
          "nextFetch": "I3",
          "restartPC": null,
          "discarded": [],
          "savedContext": null,
          "contextRestored": false,
          "handlerComplete": false
        }
      },
      {
        "id": "cycle-3",
        "title": {
          "en": "Application clock 3",
          "vi": "Nhịp chương trình 3"
        },
        "action": {
          "en": "Advance each issued instruction by one stage: IF: I3; ID: I2; OF: I1; IE: —; WB: —.",
          "vi": "Cho mỗi lệnh đã đưa vào tiến một giai đoạn: IF: I3; ID: I2; OF: I1; IE: —; WB: —."
        },
        "why": {
          "en": "Separate stages can operate concurrently; boundary registers retain the information required by the next stage.",
          "vi": "Các giai đoạn riêng có thể hoạt động đồng thời; thanh ghi ranh giới giữ thông tin cần cho giai đoạn kế tiếp."
        },
        "outcome": {
          "en": "End-of-clock boundary registers now describe the next stage inputs. No instruction commits on this clock.",
          "vi": "Thanh ghi ở cuối nhịp hiện chứa đầu vào cho giai đoạn tiếp theo. Không có lệnh nào ghi kết quả cuối ở nhịp này."
        },
        "before": {
          "clock": 2,
          "phase": "fill",
          "stageOccupancy": {
            "IF": "I2",
            "ID": "I1",
            "OF": null,
            "IE": null,
            "WB": null
          },
          "boundaryRegisters": {
            "IF_ID": {
              "instructionId": "I2",
              "nextStage": "ID"
            },
            "ID_OF": {
              "instructionId": "I1",
              "nextStage": "OF",
              "destination": "R1"
            },
            "OF_IE": null,
            "IE_WB": null
          },
          "registers": {
            "R1": 0,
            "R2": 0,
            "R3": 0,
            "R4": 0,
            "R5": 0,
            "R6": 0
          },
          "status": {
            "Z": 0
          },
          "completed": [],
          "nextFetch": "I3",
          "restartPC": null,
          "discarded": [],
          "savedContext": null,
          "contextRestored": false,
          "handlerComplete": false
        },
        "after": {
          "clock": 3,
          "phase": "fill",
          "stageOccupancy": {
            "IF": "I3",
            "ID": "I2",
            "OF": "I1",
            "IE": null,
            "WB": null
          },
          "boundaryRegisters": {
            "IF_ID": {
              "instructionId": "I3",
              "nextStage": "ID"
            },
            "ID_OF": {
              "instructionId": "I2",
              "nextStage": "OF",
              "destination": "R2"
            },
            "OF_IE": {
              "instructionId": "I1",
              "nextStage": "IE",
              "destination": "R1",
              "operands": [
                2,
                3
              ]
            },
            "IE_WB": null
          },
          "registers": {
            "R1": 0,
            "R2": 0,
            "R3": 0,
            "R4": 0,
            "R5": 0,
            "R6": 0
          },
          "status": {
            "Z": 0
          },
          "completed": [],
          "nextFetch": "I4",
          "restartPC": null,
          "discarded": [],
          "savedContext": null,
          "contextRestored": false,
          "handlerComplete": false
        }
      },
      {
        "id": "cycle-4",
        "title": {
          "en": "Application clock 4",
          "vi": "Nhịp chương trình 4"
        },
        "action": {
          "en": "Advance each issued instruction by one stage: IF: I4; ID: I3; OF: I2; IE: I1; WB: —.",
          "vi": "Cho mỗi lệnh đã đưa vào tiến một giai đoạn: IF: I4; ID: I3; OF: I2; IE: I1; WB: —."
        },
        "why": {
          "en": "Separate stages can operate concurrently; boundary registers retain the information required by the next stage.",
          "vi": "Các giai đoạn riêng có thể hoạt động đồng thời; thanh ghi ranh giới giữ thông tin cần cho giai đoạn kế tiếp."
        },
        "outcome": {
          "en": "End-of-clock boundary registers now describe the next stage inputs. No instruction commits on this clock.",
          "vi": "Thanh ghi ở cuối nhịp hiện chứa đầu vào cho giai đoạn tiếp theo. Không có lệnh nào ghi kết quả cuối ở nhịp này."
        },
        "before": {
          "clock": 3,
          "phase": "fill",
          "stageOccupancy": {
            "IF": "I3",
            "ID": "I2",
            "OF": "I1",
            "IE": null,
            "WB": null
          },
          "boundaryRegisters": {
            "IF_ID": {
              "instructionId": "I3",
              "nextStage": "ID"
            },
            "ID_OF": {
              "instructionId": "I2",
              "nextStage": "OF",
              "destination": "R2"
            },
            "OF_IE": {
              "instructionId": "I1",
              "nextStage": "IE",
              "destination": "R1",
              "operands": [
                2,
                3
              ]
            },
            "IE_WB": null
          },
          "registers": {
            "R1": 0,
            "R2": 0,
            "R3": 0,
            "R4": 0,
            "R5": 0,
            "R6": 0
          },
          "status": {
            "Z": 0
          },
          "completed": [],
          "nextFetch": "I4",
          "restartPC": null,
          "discarded": [],
          "savedContext": null,
          "contextRestored": false,
          "handlerComplete": false
        },
        "after": {
          "clock": 4,
          "phase": "fill",
          "stageOccupancy": {
            "IF": "I4",
            "ID": "I3",
            "OF": "I2",
            "IE": "I1",
            "WB": null
          },
          "boundaryRegisters": {
            "IF_ID": {
              "instructionId": "I4",
              "nextStage": "ID"
            },
            "ID_OF": {
              "instructionId": "I3",
              "nextStage": "OF",
              "destination": "R3"
            },
            "OF_IE": {
              "instructionId": "I2",
              "nextStage": "IE",
              "destination": "R2",
              "operands": [
                4,
                5
              ]
            },
            "IE_WB": {
              "instructionId": "I1",
              "nextStage": "WB",
              "destination": "R1",
              "operands": [
                2,
                3
              ],
              "result": 5
            }
          },
          "registers": {
            "R1": 0,
            "R2": 0,
            "R3": 0,
            "R4": 0,
            "R5": 0,
            "R6": 0
          },
          "status": {
            "Z": 0
          },
          "completed": [],
          "nextFetch": "I5",
          "restartPC": null,
          "discarded": [],
          "savedContext": null,
          "contextRestored": false,
          "handlerComplete": false
        }
      },
      {
        "id": "cycle-5",
        "title": {
          "en": "Application clock 5",
          "vi": "Nhịp chương trình 5"
        },
        "action": {
          "en": "Advance each issued instruction by one stage: IF: I5; ID: I4; OF: I3; IE: I2; WB: I1.",
          "vi": "Cho mỗi lệnh đã đưa vào tiến một giai đoạn: IF: I5; ID: I4; OF: I3; IE: I2; WB: I1."
        },
        "why": {
          "en": "Separate stages can operate concurrently; boundary registers retain the information required by the next stage.",
          "vi": "Các giai đoạn riêng có thể hoạt động đồng thời; thanh ghi ranh giới giữ thông tin cần cho giai đoạn kế tiếp."
        },
        "outcome": {
          "en": "End-of-clock boundary registers now describe the next stage inputs. I1 commits its result at this boundary.",
          "vi": "Thanh ghi ở cuối nhịp hiện chứa đầu vào cho giai đoạn tiếp theo. I1 ghi kết quả ở ranh giới này."
        },
        "before": {
          "clock": 4,
          "phase": "fill",
          "stageOccupancy": {
            "IF": "I4",
            "ID": "I3",
            "OF": "I2",
            "IE": "I1",
            "WB": null
          },
          "boundaryRegisters": {
            "IF_ID": {
              "instructionId": "I4",
              "nextStage": "ID"
            },
            "ID_OF": {
              "instructionId": "I3",
              "nextStage": "OF",
              "destination": "R3"
            },
            "OF_IE": {
              "instructionId": "I2",
              "nextStage": "IE",
              "destination": "R2",
              "operands": [
                4,
                5
              ]
            },
            "IE_WB": {
              "instructionId": "I1",
              "nextStage": "WB",
              "destination": "R1",
              "operands": [
                2,
                3
              ],
              "result": 5
            }
          },
          "registers": {
            "R1": 0,
            "R2": 0,
            "R3": 0,
            "R4": 0,
            "R5": 0,
            "R6": 0
          },
          "status": {
            "Z": 0
          },
          "completed": [],
          "nextFetch": "I5",
          "restartPC": null,
          "discarded": [],
          "savedContext": null,
          "contextRestored": false,
          "handlerComplete": false
        },
        "after": {
          "clock": 5,
          "phase": "full",
          "stageOccupancy": {
            "IF": "I5",
            "ID": "I4",
            "OF": "I3",
            "IE": "I2",
            "WB": "I1"
          },
          "boundaryRegisters": {
            "IF_ID": {
              "instructionId": "I5",
              "nextStage": "ID"
            },
            "ID_OF": {
              "instructionId": "I4",
              "nextStage": "OF",
              "destination": "R4"
            },
            "OF_IE": {
              "instructionId": "I3",
              "nextStage": "IE",
              "destination": "R3",
              "operands": [
                6,
                7
              ]
            },
            "IE_WB": {
              "instructionId": "I2",
              "nextStage": "WB",
              "destination": "R2",
              "operands": [
                4,
                5
              ],
              "result": 9
            }
          },
          "registers": {
            "R1": 5,
            "R2": 0,
            "R3": 0,
            "R4": 0,
            "R5": 0,
            "R6": 0
          },
          "status": {
            "Z": 0
          },
          "completed": [
            "I1"
          ],
          "nextFetch": "I6",
          "restartPC": null,
          "discarded": [],
          "savedContext": null,
          "contextRestored": false,
          "handlerComplete": false
        }
      },
      {
        "id": "cycle-6",
        "title": {
          "en": "Application clock 6",
          "vi": "Nhịp chương trình 6"
        },
        "action": {
          "en": "Advance each issued instruction by one stage: IF: I6; ID: I5; OF: I4; IE: I3; WB: I2.",
          "vi": "Cho mỗi lệnh đã đưa vào tiến một giai đoạn: IF: I6; ID: I5; OF: I4; IE: I3; WB: I2."
        },
        "why": {
          "en": "Separate stages can operate concurrently; boundary registers retain the information required by the next stage.",
          "vi": "Các giai đoạn riêng có thể hoạt động đồng thời; thanh ghi ranh giới giữ thông tin cần cho giai đoạn kế tiếp."
        },
        "outcome": {
          "en": "End-of-clock boundary registers now describe the next stage inputs. I2 commits its result at this boundary.",
          "vi": "Thanh ghi ở cuối nhịp hiện chứa đầu vào cho giai đoạn tiếp theo. I2 ghi kết quả ở ranh giới này."
        },
        "before": {
          "clock": 5,
          "phase": "full",
          "stageOccupancy": {
            "IF": "I5",
            "ID": "I4",
            "OF": "I3",
            "IE": "I2",
            "WB": "I1"
          },
          "boundaryRegisters": {
            "IF_ID": {
              "instructionId": "I5",
              "nextStage": "ID"
            },
            "ID_OF": {
              "instructionId": "I4",
              "nextStage": "OF",
              "destination": "R4"
            },
            "OF_IE": {
              "instructionId": "I3",
              "nextStage": "IE",
              "destination": "R3",
              "operands": [
                6,
                7
              ]
            },
            "IE_WB": {
              "instructionId": "I2",
              "nextStage": "WB",
              "destination": "R2",
              "operands": [
                4,
                5
              ],
              "result": 9
            }
          },
          "registers": {
            "R1": 5,
            "R2": 0,
            "R3": 0,
            "R4": 0,
            "R5": 0,
            "R6": 0
          },
          "status": {
            "Z": 0
          },
          "completed": [
            "I1"
          ],
          "nextFetch": "I6",
          "restartPC": null,
          "discarded": [],
          "savedContext": null,
          "contextRestored": false,
          "handlerComplete": false
        },
        "after": {
          "clock": 6,
          "phase": "full",
          "stageOccupancy": {
            "IF": "I6",
            "ID": "I5",
            "OF": "I4",
            "IE": "I3",
            "WB": "I2"
          },
          "boundaryRegisters": {
            "IF_ID": {
              "instructionId": "I6",
              "nextStage": "ID"
            },
            "ID_OF": {
              "instructionId": "I5",
              "nextStage": "OF",
              "destination": "R5"
            },
            "OF_IE": {
              "instructionId": "I4",
              "nextStage": "IE",
              "destination": "R4",
              "operands": [
                8,
                9
              ]
            },
            "IE_WB": {
              "instructionId": "I3",
              "nextStage": "WB",
              "destination": "R3",
              "operands": [
                6,
                7
              ],
              "result": 13
            }
          },
          "registers": {
            "R1": 5,
            "R2": 9,
            "R3": 0,
            "R4": 0,
            "R5": 0,
            "R6": 0
          },
          "status": {
            "Z": 0
          },
          "completed": [
            "I1",
            "I2"
          ],
          "nextFetch": null,
          "restartPC": null,
          "discarded": [],
          "savedContext": null,
          "contextRestored": false,
          "handlerComplete": false
        }
      },
      {
        "id": "cycle-7",
        "title": {
          "en": "Application clock 7",
          "vi": "Nhịp chương trình 7"
        },
        "action": {
          "en": "Advance each issued instruction by one stage: IF: —; ID: I6; OF: I5; IE: I4; WB: I3.",
          "vi": "Cho mỗi lệnh đã đưa vào tiến một giai đoạn: IF: —; ID: I6; OF: I5; IE: I4; WB: I3."
        },
        "why": {
          "en": "Separate stages can operate concurrently; boundary registers retain the information required by the next stage.",
          "vi": "Các giai đoạn riêng có thể hoạt động đồng thời; thanh ghi ranh giới giữ thông tin cần cho giai đoạn kế tiếp."
        },
        "outcome": {
          "en": "End-of-clock boundary registers now describe the next stage inputs. I3 commits its result at this boundary.",
          "vi": "Thanh ghi ở cuối nhịp hiện chứa đầu vào cho giai đoạn tiếp theo. I3 ghi kết quả ở ranh giới này."
        },
        "before": {
          "clock": 6,
          "phase": "full",
          "stageOccupancy": {
            "IF": "I6",
            "ID": "I5",
            "OF": "I4",
            "IE": "I3",
            "WB": "I2"
          },
          "boundaryRegisters": {
            "IF_ID": {
              "instructionId": "I6",
              "nextStage": "ID"
            },
            "ID_OF": {
              "instructionId": "I5",
              "nextStage": "OF",
              "destination": "R5"
            },
            "OF_IE": {
              "instructionId": "I4",
              "nextStage": "IE",
              "destination": "R4",
              "operands": [
                8,
                9
              ]
            },
            "IE_WB": {
              "instructionId": "I3",
              "nextStage": "WB",
              "destination": "R3",
              "operands": [
                6,
                7
              ],
              "result": 13
            }
          },
          "registers": {
            "R1": 5,
            "R2": 9,
            "R3": 0,
            "R4": 0,
            "R5": 0,
            "R6": 0
          },
          "status": {
            "Z": 0
          },
          "completed": [
            "I1",
            "I2"
          ],
          "nextFetch": null,
          "restartPC": null,
          "discarded": [],
          "savedContext": null,
          "contextRestored": false,
          "handlerComplete": false
        },
        "after": {
          "clock": 7,
          "phase": "drain",
          "stageOccupancy": {
            "IF": null,
            "ID": "I6",
            "OF": "I5",
            "IE": "I4",
            "WB": "I3"
          },
          "boundaryRegisters": {
            "IF_ID": null,
            "ID_OF": {
              "instructionId": "I6",
              "nextStage": "OF",
              "destination": "R6"
            },
            "OF_IE": {
              "instructionId": "I5",
              "nextStage": "IE",
              "destination": "R5",
              "operands": [
                10,
                11
              ]
            },
            "IE_WB": {
              "instructionId": "I4",
              "nextStage": "WB",
              "destination": "R4",
              "operands": [
                8,
                9
              ],
              "result": 17
            }
          },
          "registers": {
            "R1": 5,
            "R2": 9,
            "R3": 13,
            "R4": 0,
            "R5": 0,
            "R6": 0
          },
          "status": {
            "Z": 0
          },
          "completed": [
            "I1",
            "I2",
            "I3"
          ],
          "nextFetch": null,
          "restartPC": null,
          "discarded": [],
          "savedContext": null,
          "contextRestored": false,
          "handlerComplete": false
        }
      },
      {
        "id": "cycle-8",
        "title": {
          "en": "Application clock 8",
          "vi": "Nhịp chương trình 8"
        },
        "action": {
          "en": "Advance each issued instruction by one stage: IF: —; ID: —; OF: I6; IE: I5; WB: I4.",
          "vi": "Cho mỗi lệnh đã đưa vào tiến một giai đoạn: IF: —; ID: —; OF: I6; IE: I5; WB: I4."
        },
        "why": {
          "en": "Separate stages can operate concurrently; boundary registers retain the information required by the next stage.",
          "vi": "Các giai đoạn riêng có thể hoạt động đồng thời; thanh ghi ranh giới giữ thông tin cần cho giai đoạn kế tiếp."
        },
        "outcome": {
          "en": "End-of-clock boundary registers now describe the next stage inputs. I4 commits its result at this boundary.",
          "vi": "Thanh ghi ở cuối nhịp hiện chứa đầu vào cho giai đoạn tiếp theo. I4 ghi kết quả ở ranh giới này."
        },
        "before": {
          "clock": 7,
          "phase": "drain",
          "stageOccupancy": {
            "IF": null,
            "ID": "I6",
            "OF": "I5",
            "IE": "I4",
            "WB": "I3"
          },
          "boundaryRegisters": {
            "IF_ID": null,
            "ID_OF": {
              "instructionId": "I6",
              "nextStage": "OF",
              "destination": "R6"
            },
            "OF_IE": {
              "instructionId": "I5",
              "nextStage": "IE",
              "destination": "R5",
              "operands": [
                10,
                11
              ]
            },
            "IE_WB": {
              "instructionId": "I4",
              "nextStage": "WB",
              "destination": "R4",
              "operands": [
                8,
                9
              ],
              "result": 17
            }
          },
          "registers": {
            "R1": 5,
            "R2": 9,
            "R3": 13,
            "R4": 0,
            "R5": 0,
            "R6": 0
          },
          "status": {
            "Z": 0
          },
          "completed": [
            "I1",
            "I2",
            "I3"
          ],
          "nextFetch": null,
          "restartPC": null,
          "discarded": [],
          "savedContext": null,
          "contextRestored": false,
          "handlerComplete": false
        },
        "after": {
          "clock": 8,
          "phase": "drain",
          "stageOccupancy": {
            "IF": null,
            "ID": null,
            "OF": "I6",
            "IE": "I5",
            "WB": "I4"
          },
          "boundaryRegisters": {
            "IF_ID": null,
            "ID_OF": null,
            "OF_IE": {
              "instructionId": "I6",
              "nextStage": "IE",
              "destination": "R6",
              "operands": [
                12,
                13
              ]
            },
            "IE_WB": {
              "instructionId": "I5",
              "nextStage": "WB",
              "destination": "R5",
              "operands": [
                10,
                11
              ],
              "result": 21
            }
          },
          "registers": {
            "R1": 5,
            "R2": 9,
            "R3": 13,
            "R4": 17,
            "R5": 0,
            "R6": 0
          },
          "status": {
            "Z": 0
          },
          "completed": [
            "I1",
            "I2",
            "I3",
            "I4"
          ],
          "nextFetch": null,
          "restartPC": null,
          "discarded": [],
          "savedContext": null,
          "contextRestored": false,
          "handlerComplete": false
        }
      },
      {
        "id": "cycle-9",
        "title": {
          "en": "Application clock 9",
          "vi": "Nhịp chương trình 9"
        },
        "action": {
          "en": "Advance each issued instruction by one stage: IF: —; ID: —; OF: —; IE: I6; WB: I5.",
          "vi": "Cho mỗi lệnh đã đưa vào tiến một giai đoạn: IF: —; ID: —; OF: —; IE: I6; WB: I5."
        },
        "why": {
          "en": "Separate stages can operate concurrently; boundary registers retain the information required by the next stage.",
          "vi": "Các giai đoạn riêng có thể hoạt động đồng thời; thanh ghi ranh giới giữ thông tin cần cho giai đoạn kế tiếp."
        },
        "outcome": {
          "en": "End-of-clock boundary registers now describe the next stage inputs. I5 commits its result at this boundary.",
          "vi": "Thanh ghi ở cuối nhịp hiện chứa đầu vào cho giai đoạn tiếp theo. I5 ghi kết quả ở ranh giới này."
        },
        "before": {
          "clock": 8,
          "phase": "drain",
          "stageOccupancy": {
            "IF": null,
            "ID": null,
            "OF": "I6",
            "IE": "I5",
            "WB": "I4"
          },
          "boundaryRegisters": {
            "IF_ID": null,
            "ID_OF": null,
            "OF_IE": {
              "instructionId": "I6",
              "nextStage": "IE",
              "destination": "R6",
              "operands": [
                12,
                13
              ]
            },
            "IE_WB": {
              "instructionId": "I5",
              "nextStage": "WB",
              "destination": "R5",
              "operands": [
                10,
                11
              ],
              "result": 21
            }
          },
          "registers": {
            "R1": 5,
            "R2": 9,
            "R3": 13,
            "R4": 17,
            "R5": 0,
            "R6": 0
          },
          "status": {
            "Z": 0
          },
          "completed": [
            "I1",
            "I2",
            "I3",
            "I4"
          ],
          "nextFetch": null,
          "restartPC": null,
          "discarded": [],
          "savedContext": null,
          "contextRestored": false,
          "handlerComplete": false
        },
        "after": {
          "clock": 9,
          "phase": "drain",
          "stageOccupancy": {
            "IF": null,
            "ID": null,
            "OF": null,
            "IE": "I6",
            "WB": "I5"
          },
          "boundaryRegisters": {
            "IF_ID": null,
            "ID_OF": null,
            "OF_IE": null,
            "IE_WB": {
              "instructionId": "I6",
              "nextStage": "WB",
              "destination": "R6",
              "operands": [
                12,
                13
              ],
              "result": 25
            }
          },
          "registers": {
            "R1": 5,
            "R2": 9,
            "R3": 13,
            "R4": 17,
            "R5": 21,
            "R6": 0
          },
          "status": {
            "Z": 0
          },
          "completed": [
            "I1",
            "I2",
            "I3",
            "I4",
            "I5"
          ],
          "nextFetch": null,
          "restartPC": null,
          "discarded": [],
          "savedContext": null,
          "contextRestored": false,
          "handlerComplete": false
        }
      },
      {
        "id": "cycle-10",
        "title": {
          "en": "Application clock 10",
          "vi": "Nhịp chương trình 10"
        },
        "action": {
          "en": "Advance each issued instruction by one stage: IF: —; ID: —; OF: —; IE: —; WB: I6.",
          "vi": "Cho mỗi lệnh đã đưa vào tiến một giai đoạn: IF: —; ID: —; OF: —; IE: —; WB: I6."
        },
        "why": {
          "en": "Separate stages can operate concurrently; boundary registers retain the information required by the next stage.",
          "vi": "Các giai đoạn riêng có thể hoạt động đồng thời; thanh ghi ranh giới giữ thông tin cần cho giai đoạn kế tiếp."
        },
        "outcome": {
          "en": "End-of-clock boundary registers now describe the next stage inputs. I6 commits its result at this boundary.",
          "vi": "Thanh ghi ở cuối nhịp hiện chứa đầu vào cho giai đoạn tiếp theo. I6 ghi kết quả ở ranh giới này."
        },
        "before": {
          "clock": 9,
          "phase": "drain",
          "stageOccupancy": {
            "IF": null,
            "ID": null,
            "OF": null,
            "IE": "I6",
            "WB": "I5"
          },
          "boundaryRegisters": {
            "IF_ID": null,
            "ID_OF": null,
            "OF_IE": null,
            "IE_WB": {
              "instructionId": "I6",
              "nextStage": "WB",
              "destination": "R6",
              "operands": [
                12,
                13
              ],
              "result": 25
            }
          },
          "registers": {
            "R1": 5,
            "R2": 9,
            "R3": 13,
            "R4": 17,
            "R5": 21,
            "R6": 0
          },
          "status": {
            "Z": 0
          },
          "completed": [
            "I1",
            "I2",
            "I3",
            "I4",
            "I5"
          ],
          "nextFetch": null,
          "restartPC": null,
          "discarded": [],
          "savedContext": null,
          "contextRestored": false,
          "handlerComplete": false
        },
        "after": {
          "clock": 10,
          "phase": "complete",
          "stageOccupancy": {
            "IF": null,
            "ID": null,
            "OF": null,
            "IE": null,
            "WB": "I6"
          },
          "boundaryRegisters": {
            "IF_ID": null,
            "ID_OF": null,
            "OF_IE": null,
            "IE_WB": null
          },
          "registers": {
            "R1": 5,
            "R2": 9,
            "R3": 13,
            "R4": 17,
            "R5": 21,
            "R6": 25
          },
          "status": {
            "Z": 0
          },
          "completed": [
            "I1",
            "I2",
            "I3",
            "I4",
            "I5",
            "I6"
          ],
          "nextFetch": null,
          "restartPC": null,
          "discarded": [],
          "savedContext": null,
          "contextRestored": false,
          "handlerComplete": false
        }
      }
    ],
    "metrics": {
      "singleInstructionLatencyClocks": 5,
      "idealCompletionIntervalClocks": 1,
      "nonPipelinedClocksForSix": 30,
      "idealPipelineClocksForSix": 10,
      "applicationClocksInThisTrace": 10,
      "handlerDurationClocks": null
    }
  },
  {
    "id": "interrupt-flush",
    "stages": [
      "IF",
      "ID",
      "OF",
      "IE",
      "WB"
    ],
    "instructions": [
      {
        "id": "I1",
        "destination": "R1",
        "operands": [
          2,
          3
        ],
        "result": 5
      },
      {
        "id": "I2",
        "destination": "R2",
        "operands": [
          4,
          5
        ],
        "result": 9
      },
      {
        "id": "I3",
        "destination": "R3",
        "operands": [
          6,
          7
        ],
        "result": 13
      },
      {
        "id": "I4",
        "destination": "R4",
        "operands": [
          8,
          9
        ],
        "result": 17
      },
      {
        "id": "I5",
        "destination": "R5",
        "operands": [
          10,
          11
        ],
        "result": 21
      },
      {
        "id": "I6",
        "destination": "R6",
        "operands": [
          12,
          13
        ],
        "result": 25
      }
    ],
    "stageClockCost": 1,
    "initial": {
      "clock": 0,
      "phase": "ready",
      "stageOccupancy": {
        "IF": null,
        "ID": null,
        "OF": null,
        "IE": null,
        "WB": null
      },
      "boundaryRegisters": {
        "IF_ID": null,
        "ID_OF": null,
        "OF_IE": null,
        "IE_WB": null
      },
      "registers": {
        "R1": 0,
        "R2": 0,
        "R3": 0,
        "R4": 0,
        "R5": 0,
        "R6": 0
      },
      "status": {
        "Z": 0
      },
      "completed": [],
      "nextFetch": "I1",
      "restartPC": null,
      "discarded": [],
      "savedContext": null,
      "contextRestored": false,
      "handlerComplete": false
    },
    "steps": [
      {
        "id": "ready",
        "title": {
          "en": "Read the model",
          "vi": "Đọc quy ước mô hình"
        },
        "action": {
          "en": "Prepare six independent register-result instructions.",
          "vi": "Chuẩn bị sáu lệnh độc lập ghi vào các thanh ghi riêng."
        },
        "why": {
          "en": "One stage takes one clock; no data dependency, branch or resource conflict is modelled.",
          "vi": "Mỗi giai đoạn dùng một nhịp; mô hình không có phụ thuộc dữ liệu, nhánh hoặc tranh chấp tài nguyên."
        },
        "outcome": {
          "en": "The pipeline is empty; no result has committed.",
          "vi": "Pipeline rỗng; chưa có kết quả cuối được ghi."
        },
        "before": {
          "clock": 0,
          "phase": "ready",
          "stageOccupancy": {
            "IF": null,
            "ID": null,
            "OF": null,
            "IE": null,
            "WB": null
          },
          "boundaryRegisters": {
            "IF_ID": null,
            "ID_OF": null,
            "OF_IE": null,
            "IE_WB": null
          },
          "registers": {
            "R1": 0,
            "R2": 0,
            "R3": 0,
            "R4": 0,
            "R5": 0,
            "R6": 0
          },
          "status": {
            "Z": 0
          },
          "completed": [],
          "nextFetch": "I1",
          "restartPC": null,
          "discarded": [],
          "savedContext": null,
          "contextRestored": false,
          "handlerComplete": false
        },
        "after": {
          "clock": 0,
          "phase": "ready",
          "stageOccupancy": {
            "IF": null,
            "ID": null,
            "OF": null,
            "IE": null,
            "WB": null
          },
          "boundaryRegisters": {
            "IF_ID": null,
            "ID_OF": null,
            "OF_IE": null,
            "IE_WB": null
          },
          "registers": {
            "R1": 0,
            "R2": 0,
            "R3": 0,
            "R4": 0,
            "R5": 0,
            "R6": 0
          },
          "status": {
            "Z": 0
          },
          "completed": [],
          "nextFetch": "I1",
          "restartPC": null,
          "discarded": [],
          "savedContext": null,
          "contextRestored": false,
          "handlerComplete": false
        }
      },
      {
        "id": "cycle-1",
        "title": {
          "en": "Application clock 1",
          "vi": "Nhịp chương trình 1"
        },
        "action": {
          "en": "Advance each issued instruction by one stage: IF: I1; ID: —; OF: —; IE: —; WB: —.",
          "vi": "Cho mỗi lệnh đã đưa vào tiến một giai đoạn: IF: I1; ID: —; OF: —; IE: —; WB: —."
        },
        "why": {
          "en": "Separate stages can operate concurrently; boundary registers retain the information required by the next stage.",
          "vi": "Các giai đoạn riêng có thể hoạt động đồng thời; thanh ghi ranh giới giữ thông tin cần cho giai đoạn kế tiếp."
        },
        "outcome": {
          "en": "End-of-clock boundary registers now describe the next stage inputs. No instruction commits on this clock.",
          "vi": "Thanh ghi ở cuối nhịp hiện chứa đầu vào cho giai đoạn tiếp theo. Không có lệnh nào ghi kết quả cuối ở nhịp này."
        },
        "before": {
          "clock": 0,
          "phase": "ready",
          "stageOccupancy": {
            "IF": null,
            "ID": null,
            "OF": null,
            "IE": null,
            "WB": null
          },
          "boundaryRegisters": {
            "IF_ID": null,
            "ID_OF": null,
            "OF_IE": null,
            "IE_WB": null
          },
          "registers": {
            "R1": 0,
            "R2": 0,
            "R3": 0,
            "R4": 0,
            "R5": 0,
            "R6": 0
          },
          "status": {
            "Z": 0
          },
          "completed": [],
          "nextFetch": "I1",
          "restartPC": null,
          "discarded": [],
          "savedContext": null,
          "contextRestored": false,
          "handlerComplete": false
        },
        "after": {
          "clock": 1,
          "phase": "fill",
          "stageOccupancy": {
            "IF": "I1",
            "ID": null,
            "OF": null,
            "IE": null,
            "WB": null
          },
          "boundaryRegisters": {
            "IF_ID": {
              "instructionId": "I1",
              "nextStage": "ID"
            },
            "ID_OF": null,
            "OF_IE": null,
            "IE_WB": null
          },
          "registers": {
            "R1": 0,
            "R2": 0,
            "R3": 0,
            "R4": 0,
            "R5": 0,
            "R6": 0
          },
          "status": {
            "Z": 0
          },
          "completed": [],
          "nextFetch": "I2",
          "restartPC": null,
          "discarded": [],
          "savedContext": null,
          "contextRestored": false,
          "handlerComplete": false
        }
      },
      {
        "id": "cycle-2",
        "title": {
          "en": "Application clock 2",
          "vi": "Nhịp chương trình 2"
        },
        "action": {
          "en": "Advance each issued instruction by one stage: IF: I2; ID: I1; OF: —; IE: —; WB: —.",
          "vi": "Cho mỗi lệnh đã đưa vào tiến một giai đoạn: IF: I2; ID: I1; OF: —; IE: —; WB: —."
        },
        "why": {
          "en": "Separate stages can operate concurrently; boundary registers retain the information required by the next stage.",
          "vi": "Các giai đoạn riêng có thể hoạt động đồng thời; thanh ghi ranh giới giữ thông tin cần cho giai đoạn kế tiếp."
        },
        "outcome": {
          "en": "End-of-clock boundary registers now describe the next stage inputs. No instruction commits on this clock.",
          "vi": "Thanh ghi ở cuối nhịp hiện chứa đầu vào cho giai đoạn tiếp theo. Không có lệnh nào ghi kết quả cuối ở nhịp này."
        },
        "before": {
          "clock": 1,
          "phase": "fill",
          "stageOccupancy": {
            "IF": "I1",
            "ID": null,
            "OF": null,
            "IE": null,
            "WB": null
          },
          "boundaryRegisters": {
            "IF_ID": {
              "instructionId": "I1",
              "nextStage": "ID"
            },
            "ID_OF": null,
            "OF_IE": null,
            "IE_WB": null
          },
          "registers": {
            "R1": 0,
            "R2": 0,
            "R3": 0,
            "R4": 0,
            "R5": 0,
            "R6": 0
          },
          "status": {
            "Z": 0
          },
          "completed": [],
          "nextFetch": "I2",
          "restartPC": null,
          "discarded": [],
          "savedContext": null,
          "contextRestored": false,
          "handlerComplete": false
        },
        "after": {
          "clock": 2,
          "phase": "fill",
          "stageOccupancy": {
            "IF": "I2",
            "ID": "I1",
            "OF": null,
            "IE": null,
            "WB": null
          },
          "boundaryRegisters": {
            "IF_ID": {
              "instructionId": "I2",
              "nextStage": "ID"
            },
            "ID_OF": {
              "instructionId": "I1",
              "nextStage": "OF",
              "destination": "R1"
            },
            "OF_IE": null,
            "IE_WB": null
          },
          "registers": {
            "R1": 0,
            "R2": 0,
            "R3": 0,
            "R4": 0,
            "R5": 0,
            "R6": 0
          },
          "status": {
            "Z": 0
          },
          "completed": [],
          "nextFetch": "I3",
          "restartPC": null,
          "discarded": [],
          "savedContext": null,
          "contextRestored": false,
          "handlerComplete": false
        }
      },
      {
        "id": "cycle-3",
        "title": {
          "en": "Application clock 3",
          "vi": "Nhịp chương trình 3"
        },
        "action": {
          "en": "Advance each issued instruction by one stage: IF: I3; ID: I2; OF: I1; IE: —; WB: —.",
          "vi": "Cho mỗi lệnh đã đưa vào tiến một giai đoạn: IF: I3; ID: I2; OF: I1; IE: —; WB: —."
        },
        "why": {
          "en": "Separate stages can operate concurrently; boundary registers retain the information required by the next stage.",
          "vi": "Các giai đoạn riêng có thể hoạt động đồng thời; thanh ghi ranh giới giữ thông tin cần cho giai đoạn kế tiếp."
        },
        "outcome": {
          "en": "End-of-clock boundary registers now describe the next stage inputs. No instruction commits on this clock.",
          "vi": "Thanh ghi ở cuối nhịp hiện chứa đầu vào cho giai đoạn tiếp theo. Không có lệnh nào ghi kết quả cuối ở nhịp này."
        },
        "before": {
          "clock": 2,
          "phase": "fill",
          "stageOccupancy": {
            "IF": "I2",
            "ID": "I1",
            "OF": null,
            "IE": null,
            "WB": null
          },
          "boundaryRegisters": {
            "IF_ID": {
              "instructionId": "I2",
              "nextStage": "ID"
            },
            "ID_OF": {
              "instructionId": "I1",
              "nextStage": "OF",
              "destination": "R1"
            },
            "OF_IE": null,
            "IE_WB": null
          },
          "registers": {
            "R1": 0,
            "R2": 0,
            "R3": 0,
            "R4": 0,
            "R5": 0,
            "R6": 0
          },
          "status": {
            "Z": 0
          },
          "completed": [],
          "nextFetch": "I3",
          "restartPC": null,
          "discarded": [],
          "savedContext": null,
          "contextRestored": false,
          "handlerComplete": false
        },
        "after": {
          "clock": 3,
          "phase": "fill",
          "stageOccupancy": {
            "IF": "I3",
            "ID": "I2",
            "OF": "I1",
            "IE": null,
            "WB": null
          },
          "boundaryRegisters": {
            "IF_ID": {
              "instructionId": "I3",
              "nextStage": "ID"
            },
            "ID_OF": {
              "instructionId": "I2",
              "nextStage": "OF",
              "destination": "R2"
            },
            "OF_IE": {
              "instructionId": "I1",
              "nextStage": "IE",
              "destination": "R1",
              "operands": [
                2,
                3
              ]
            },
            "IE_WB": null
          },
          "registers": {
            "R1": 0,
            "R2": 0,
            "R3": 0,
            "R4": 0,
            "R5": 0,
            "R6": 0
          },
          "status": {
            "Z": 0
          },
          "completed": [],
          "nextFetch": "I4",
          "restartPC": null,
          "discarded": [],
          "savedContext": null,
          "contextRestored": false,
          "handlerComplete": false
        }
      },
      {
        "id": "cycle-4",
        "title": {
          "en": "Application clock 4",
          "vi": "Nhịp chương trình 4"
        },
        "action": {
          "en": "Advance each issued instruction by one stage: IF: I4; ID: I3; OF: I2; IE: I1; WB: —.",
          "vi": "Cho mỗi lệnh đã đưa vào tiến một giai đoạn: IF: I4; ID: I3; OF: I2; IE: I1; WB: —."
        },
        "why": {
          "en": "Separate stages can operate concurrently; boundary registers retain the information required by the next stage.",
          "vi": "Các giai đoạn riêng có thể hoạt động đồng thời; thanh ghi ranh giới giữ thông tin cần cho giai đoạn kế tiếp."
        },
        "outcome": {
          "en": "End-of-clock boundary registers now describe the next stage inputs. No instruction commits on this clock.",
          "vi": "Thanh ghi ở cuối nhịp hiện chứa đầu vào cho giai đoạn tiếp theo. Không có lệnh nào ghi kết quả cuối ở nhịp này."
        },
        "before": {
          "clock": 3,
          "phase": "fill",
          "stageOccupancy": {
            "IF": "I3",
            "ID": "I2",
            "OF": "I1",
            "IE": null,
            "WB": null
          },
          "boundaryRegisters": {
            "IF_ID": {
              "instructionId": "I3",
              "nextStage": "ID"
            },
            "ID_OF": {
              "instructionId": "I2",
              "nextStage": "OF",
              "destination": "R2"
            },
            "OF_IE": {
              "instructionId": "I1",
              "nextStage": "IE",
              "destination": "R1",
              "operands": [
                2,
                3
              ]
            },
            "IE_WB": null
          },
          "registers": {
            "R1": 0,
            "R2": 0,
            "R3": 0,
            "R4": 0,
            "R5": 0,
            "R6": 0
          },
          "status": {
            "Z": 0
          },
          "completed": [],
          "nextFetch": "I4",
          "restartPC": null,
          "discarded": [],
          "savedContext": null,
          "contextRestored": false,
          "handlerComplete": false
        },
        "after": {
          "clock": 4,
          "phase": "fill",
          "stageOccupancy": {
            "IF": "I4",
            "ID": "I3",
            "OF": "I2",
            "IE": "I1",
            "WB": null
          },
          "boundaryRegisters": {
            "IF_ID": {
              "instructionId": "I4",
              "nextStage": "ID"
            },
            "ID_OF": {
              "instructionId": "I3",
              "nextStage": "OF",
              "destination": "R3"
            },
            "OF_IE": {
              "instructionId": "I2",
              "nextStage": "IE",
              "destination": "R2",
              "operands": [
                4,
                5
              ]
            },
            "IE_WB": {
              "instructionId": "I1",
              "nextStage": "WB",
              "destination": "R1",
              "operands": [
                2,
                3
              ],
              "result": 5
            }
          },
          "registers": {
            "R1": 0,
            "R2": 0,
            "R3": 0,
            "R4": 0,
            "R5": 0,
            "R6": 0
          },
          "status": {
            "Z": 0
          },
          "completed": [],
          "nextFetch": "I5",
          "restartPC": null,
          "discarded": [],
          "savedContext": null,
          "contextRestored": false,
          "handlerComplete": false
        }
      },
      {
        "id": "cycle-5",
        "title": {
          "en": "Application clock 5",
          "vi": "Nhịp chương trình 5"
        },
        "action": {
          "en": "Advance each issued instruction by one stage: IF: I5; ID: I4; OF: I3; IE: I2; WB: I1.",
          "vi": "Cho mỗi lệnh đã đưa vào tiến một giai đoạn: IF: I5; ID: I4; OF: I3; IE: I2; WB: I1."
        },
        "why": {
          "en": "Separate stages can operate concurrently; boundary registers retain the information required by the next stage.",
          "vi": "Các giai đoạn riêng có thể hoạt động đồng thời; thanh ghi ranh giới giữ thông tin cần cho giai đoạn kế tiếp."
        },
        "outcome": {
          "en": "End-of-clock boundary registers now describe the next stage inputs. I1 commits its result at this boundary.",
          "vi": "Thanh ghi ở cuối nhịp hiện chứa đầu vào cho giai đoạn tiếp theo. I1 ghi kết quả ở ranh giới này."
        },
        "before": {
          "clock": 4,
          "phase": "fill",
          "stageOccupancy": {
            "IF": "I4",
            "ID": "I3",
            "OF": "I2",
            "IE": "I1",
            "WB": null
          },
          "boundaryRegisters": {
            "IF_ID": {
              "instructionId": "I4",
              "nextStage": "ID"
            },
            "ID_OF": {
              "instructionId": "I3",
              "nextStage": "OF",
              "destination": "R3"
            },
            "OF_IE": {
              "instructionId": "I2",
              "nextStage": "IE",
              "destination": "R2",
              "operands": [
                4,
                5
              ]
            },
            "IE_WB": {
              "instructionId": "I1",
              "nextStage": "WB",
              "destination": "R1",
              "operands": [
                2,
                3
              ],
              "result": 5
            }
          },
          "registers": {
            "R1": 0,
            "R2": 0,
            "R3": 0,
            "R4": 0,
            "R5": 0,
            "R6": 0
          },
          "status": {
            "Z": 0
          },
          "completed": [],
          "nextFetch": "I5",
          "restartPC": null,
          "discarded": [],
          "savedContext": null,
          "contextRestored": false,
          "handlerComplete": false
        },
        "after": {
          "clock": 5,
          "phase": "full",
          "stageOccupancy": {
            "IF": "I5",
            "ID": "I4",
            "OF": "I3",
            "IE": "I2",
            "WB": "I1"
          },
          "boundaryRegisters": {
            "IF_ID": {
              "instructionId": "I5",
              "nextStage": "ID"
            },
            "ID_OF": {
              "instructionId": "I4",
              "nextStage": "OF",
              "destination": "R4"
            },
            "OF_IE": {
              "instructionId": "I3",
              "nextStage": "IE",
              "destination": "R3",
              "operands": [
                6,
                7
              ]
            },
            "IE_WB": {
              "instructionId": "I2",
              "nextStage": "WB",
              "destination": "R2",
              "operands": [
                4,
                5
              ],
              "result": 9
            }
          },
          "registers": {
            "R1": 5,
            "R2": 0,
            "R3": 0,
            "R4": 0,
            "R5": 0,
            "R6": 0
          },
          "status": {
            "Z": 0
          },
          "completed": [
            "I1"
          ],
          "nextFetch": "I6",
          "restartPC": null,
          "discarded": [],
          "savedContext": null,
          "contextRestored": false,
          "handlerComplete": false
        }
      },
      {
        "id": "save-and-flush",
        "title": {
          "en": "Preserve committed state and flush",
          "vi": "Lưu trạng thái đã hoàn tất và xóa phần đang xử lý"
        },
        "action": {
          "en": "After I1 writes back at clock 5, save registers/status and restart address I2; discard the unfinished I2–I5 stages.",
          "vi": "Sau khi I1 ghi kết quả ở nhịp 5, lưu thanh ghi/trạng thái và địa chỉ chạy lại I2; bỏ phần đang xử lý của I2–I5."
        },
        "why": {
          "en": "Only I1 has committed. Keeping incomplete stage results as if complete would corrupt the restart; I6 has not been fetched.",
          "vi": "Chỉ I1 đã hoàn tất. Coi kết quả dở dang là kết quả cuối sẽ làm sai việc chạy lại; I6 chưa được nạp."
        },
        "outcome": {
          "en": "The pipeline is empty, R1=5 is retained, and saved restartPC is I2.",
          "vi": "Pipeline rỗng, R1=5 được giữ và restartPC đã lưu là I2."
        },
        "before": {
          "clock": 5,
          "phase": "full",
          "stageOccupancy": {
            "IF": "I5",
            "ID": "I4",
            "OF": "I3",
            "IE": "I2",
            "WB": "I1"
          },
          "boundaryRegisters": {
            "IF_ID": {
              "instructionId": "I5",
              "nextStage": "ID"
            },
            "ID_OF": {
              "instructionId": "I4",
              "nextStage": "OF",
              "destination": "R4"
            },
            "OF_IE": {
              "instructionId": "I3",
              "nextStage": "IE",
              "destination": "R3",
              "operands": [
                6,
                7
              ]
            },
            "IE_WB": {
              "instructionId": "I2",
              "nextStage": "WB",
              "destination": "R2",
              "operands": [
                4,
                5
              ],
              "result": 9
            }
          },
          "registers": {
            "R1": 5,
            "R2": 0,
            "R3": 0,
            "R4": 0,
            "R5": 0,
            "R6": 0
          },
          "status": {
            "Z": 0
          },
          "completed": [
            "I1"
          ],
          "nextFetch": "I6",
          "restartPC": null,
          "discarded": [],
          "savedContext": null,
          "contextRestored": false,
          "handlerComplete": false
        },
        "after": {
          "clock": 5,
          "phase": "interrupt-saved",
          "stageOccupancy": {
            "IF": null,
            "ID": null,
            "OF": null,
            "IE": null,
            "WB": null
          },
          "boundaryRegisters": {
            "IF_ID": null,
            "ID_OF": null,
            "OF_IE": null,
            "IE_WB": null
          },
          "registers": {
            "R1": 5,
            "R2": 0,
            "R3": 0,
            "R4": 0,
            "R5": 0,
            "R6": 0
          },
          "status": {
            "Z": 0
          },
          "completed": [
            "I1"
          ],
          "nextFetch": null,
          "restartPC": "I2",
          "discarded": [
            "I2",
            "I3",
            "I4",
            "I5"
          ],
          "savedContext": {
            "registers": {
              "R1": 5,
              "R2": 0,
              "R3": 0,
              "R4": 0,
              "R5": 0,
              "R6": 0
            },
            "status": {
              "Z": 0
            },
            "restartPC": "I2"
          },
          "contextRestored": false,
          "handlerComplete": false
        }
      },
      {
        "id": "service-interrupt",
        "title": {
          "en": "Service the interrupt",
          "vi": "Phục vụ ngắt"
        },
        "action": {
          "en": "Run the interrupt service routine as a separate event.",
          "vi": "Chạy trình phục vụ ngắt như một sự kiện riêng."
        },
        "why": {
          "en": "The example does not specify handler duration, so it adds no invented application-clock count.",
          "vi": "Ví dụ không cho thời lượng trình phục vụ nên không tự gán số nhịp chương trình."
        },
        "outcome": {
          "en": "The interrupt is serviced; the saved program context remains available.",
          "vi": "Ngắt đã được phục vụ; ngữ cảnh chương trình đã lưu vẫn sẵn sàng."
        },
        "before": {
          "clock": 5,
          "phase": "interrupt-saved",
          "stageOccupancy": {
            "IF": null,
            "ID": null,
            "OF": null,
            "IE": null,
            "WB": null
          },
          "boundaryRegisters": {
            "IF_ID": null,
            "ID_OF": null,
            "OF_IE": null,
            "IE_WB": null
          },
          "registers": {
            "R1": 5,
            "R2": 0,
            "R3": 0,
            "R4": 0,
            "R5": 0,
            "R6": 0
          },
          "status": {
            "Z": 0
          },
          "completed": [
            "I1"
          ],
          "nextFetch": null,
          "restartPC": "I2",
          "discarded": [
            "I2",
            "I3",
            "I4",
            "I5"
          ],
          "savedContext": {
            "registers": {
              "R1": 5,
              "R2": 0,
              "R3": 0,
              "R4": 0,
              "R5": 0,
              "R6": 0
            },
            "status": {
              "Z": 0
            },
            "restartPC": "I2"
          },
          "contextRestored": false,
          "handlerComplete": false
        },
        "after": {
          "clock": 5,
          "phase": "handler-complete",
          "stageOccupancy": {
            "IF": null,
            "ID": null,
            "OF": null,
            "IE": null,
            "WB": null
          },
          "boundaryRegisters": {
            "IF_ID": null,
            "ID_OF": null,
            "OF_IE": null,
            "IE_WB": null
          },
          "registers": {
            "R1": 5,
            "R2": 0,
            "R3": 0,
            "R4": 0,
            "R5": 0,
            "R6": 0
          },
          "status": {
            "Z": 0
          },
          "completed": [
            "I1"
          ],
          "nextFetch": null,
          "restartPC": "I2",
          "discarded": [
            "I2",
            "I3",
            "I4",
            "I5"
          ],
          "savedContext": {
            "registers": {
              "R1": 5,
              "R2": 0,
              "R3": 0,
              "R4": 0,
              "R5": 0,
              "R6": 0
            },
            "status": {
              "Z": 0
            },
            "restartPC": "I2"
          },
          "contextRestored": false,
          "handlerComplete": true
        }
      },
      {
        "id": "restore-context",
        "title": {
          "en": "Restore and restart",
          "vi": "Khôi phục và chạy lại"
        },
        "action": {
          "en": "Restore the saved registers/status and use I2 as the next instruction address.",
          "vi": "Khôi phục thanh ghi/trạng thái đã lưu và dùng I2 làm địa chỉ lệnh tiếp theo."
        },
        "why": {
          "en": "I1 must not execute twice; the discarded instructions must be fetched again.",
          "vi": "Không được thực thi I1 hai lần; các lệnh đã bỏ phải được nạp lại."
        },
        "outcome": {
          "en": "The next application clock refetches I2; handler time remains unspecified.",
          "vi": "Nhịp chương trình tiếp theo nạp lại I2; thời gian phục vụ vẫn không được chỉ định."
        },
        "before": {
          "clock": 5,
          "phase": "handler-complete",
          "stageOccupancy": {
            "IF": null,
            "ID": null,
            "OF": null,
            "IE": null,
            "WB": null
          },
          "boundaryRegisters": {
            "IF_ID": null,
            "ID_OF": null,
            "OF_IE": null,
            "IE_WB": null
          },
          "registers": {
            "R1": 5,
            "R2": 0,
            "R3": 0,
            "R4": 0,
            "R5": 0,
            "R6": 0
          },
          "status": {
            "Z": 0
          },
          "completed": [
            "I1"
          ],
          "nextFetch": null,
          "restartPC": "I2",
          "discarded": [
            "I2",
            "I3",
            "I4",
            "I5"
          ],
          "savedContext": {
            "registers": {
              "R1": 5,
              "R2": 0,
              "R3": 0,
              "R4": 0,
              "R5": 0,
              "R6": 0
            },
            "status": {
              "Z": 0
            },
            "restartPC": "I2"
          },
          "contextRestored": false,
          "handlerComplete": true
        },
        "after": {
          "clock": 5,
          "phase": "restored",
          "stageOccupancy": {
            "IF": null,
            "ID": null,
            "OF": null,
            "IE": null,
            "WB": null
          },
          "boundaryRegisters": {
            "IF_ID": null,
            "ID_OF": null,
            "OF_IE": null,
            "IE_WB": null
          },
          "registers": {
            "R1": 5,
            "R2": 0,
            "R3": 0,
            "R4": 0,
            "R5": 0,
            "R6": 0
          },
          "status": {
            "Z": 0
          },
          "completed": [
            "I1"
          ],
          "nextFetch": "I2",
          "restartPC": "I2",
          "discarded": [
            "I2",
            "I3",
            "I4",
            "I5"
          ],
          "savedContext": {
            "registers": {
              "R1": 5,
              "R2": 0,
              "R3": 0,
              "R4": 0,
              "R5": 0,
              "R6": 0
            },
            "status": {
              "Z": 0
            },
            "restartPC": "I2"
          },
          "contextRestored": true,
          "handlerComplete": true
        }
      },
      {
        "id": "restart-cycle-6",
        "title": {
          "en": "Application clock 6",
          "vi": "Nhịp chương trình 6"
        },
        "action": {
          "en": "Advance each issued instruction by one stage: IF: I2; ID: —; OF: —; IE: —; WB: —.",
          "vi": "Cho mỗi lệnh đã đưa vào tiến một giai đoạn: IF: I2; ID: —; OF: —; IE: —; WB: —."
        },
        "why": {
          "en": "Separate stages can operate concurrently; boundary registers retain the information required by the next stage.",
          "vi": "Các giai đoạn riêng có thể hoạt động đồng thời; thanh ghi ranh giới giữ thông tin cần cho giai đoạn kế tiếp."
        },
        "outcome": {
          "en": "End-of-clock boundary registers now describe the next stage inputs. No instruction commits on this clock.",
          "vi": "Thanh ghi ở cuối nhịp hiện chứa đầu vào cho giai đoạn tiếp theo. Không có lệnh nào ghi kết quả cuối ở nhịp này."
        },
        "before": {
          "clock": 5,
          "phase": "restored",
          "stageOccupancy": {
            "IF": null,
            "ID": null,
            "OF": null,
            "IE": null,
            "WB": null
          },
          "boundaryRegisters": {
            "IF_ID": null,
            "ID_OF": null,
            "OF_IE": null,
            "IE_WB": null
          },
          "registers": {
            "R1": 5,
            "R2": 0,
            "R3": 0,
            "R4": 0,
            "R5": 0,
            "R6": 0
          },
          "status": {
            "Z": 0
          },
          "completed": [
            "I1"
          ],
          "nextFetch": "I2",
          "restartPC": "I2",
          "discarded": [
            "I2",
            "I3",
            "I4",
            "I5"
          ],
          "savedContext": {
            "registers": {
              "R1": 5,
              "R2": 0,
              "R3": 0,
              "R4": 0,
              "R5": 0,
              "R6": 0
            },
            "status": {
              "Z": 0
            },
            "restartPC": "I2"
          },
          "contextRestored": true,
          "handlerComplete": true
        },
        "after": {
          "clock": 6,
          "phase": "refill",
          "stageOccupancy": {
            "IF": "I2",
            "ID": null,
            "OF": null,
            "IE": null,
            "WB": null
          },
          "boundaryRegisters": {
            "IF_ID": {
              "instructionId": "I2",
              "nextStage": "ID"
            },
            "ID_OF": null,
            "OF_IE": null,
            "IE_WB": null
          },
          "registers": {
            "R1": 5,
            "R2": 0,
            "R3": 0,
            "R4": 0,
            "R5": 0,
            "R6": 0
          },
          "status": {
            "Z": 0
          },
          "completed": [
            "I1"
          ],
          "nextFetch": "I3",
          "restartPC": "I2",
          "discarded": [
            "I2",
            "I3",
            "I4",
            "I5"
          ],
          "savedContext": {
            "registers": {
              "R1": 5,
              "R2": 0,
              "R3": 0,
              "R4": 0,
              "R5": 0,
              "R6": 0
            },
            "status": {
              "Z": 0
            },
            "restartPC": "I2"
          },
          "contextRestored": true,
          "handlerComplete": true
        }
      },
      {
        "id": "restart-cycle-7",
        "title": {
          "en": "Application clock 7",
          "vi": "Nhịp chương trình 7"
        },
        "action": {
          "en": "Advance each issued instruction by one stage: IF: I3; ID: I2; OF: —; IE: —; WB: —.",
          "vi": "Cho mỗi lệnh đã đưa vào tiến một giai đoạn: IF: I3; ID: I2; OF: —; IE: —; WB: —."
        },
        "why": {
          "en": "Separate stages can operate concurrently; boundary registers retain the information required by the next stage.",
          "vi": "Các giai đoạn riêng có thể hoạt động đồng thời; thanh ghi ranh giới giữ thông tin cần cho giai đoạn kế tiếp."
        },
        "outcome": {
          "en": "End-of-clock boundary registers now describe the next stage inputs. No instruction commits on this clock.",
          "vi": "Thanh ghi ở cuối nhịp hiện chứa đầu vào cho giai đoạn tiếp theo. Không có lệnh nào ghi kết quả cuối ở nhịp này."
        },
        "before": {
          "clock": 6,
          "phase": "refill",
          "stageOccupancy": {
            "IF": "I2",
            "ID": null,
            "OF": null,
            "IE": null,
            "WB": null
          },
          "boundaryRegisters": {
            "IF_ID": {
              "instructionId": "I2",
              "nextStage": "ID"
            },
            "ID_OF": null,
            "OF_IE": null,
            "IE_WB": null
          },
          "registers": {
            "R1": 5,
            "R2": 0,
            "R3": 0,
            "R4": 0,
            "R5": 0,
            "R6": 0
          },
          "status": {
            "Z": 0
          },
          "completed": [
            "I1"
          ],
          "nextFetch": "I3",
          "restartPC": "I2",
          "discarded": [
            "I2",
            "I3",
            "I4",
            "I5"
          ],
          "savedContext": {
            "registers": {
              "R1": 5,
              "R2": 0,
              "R3": 0,
              "R4": 0,
              "R5": 0,
              "R6": 0
            },
            "status": {
              "Z": 0
            },
            "restartPC": "I2"
          },
          "contextRestored": true,
          "handlerComplete": true
        },
        "after": {
          "clock": 7,
          "phase": "refill",
          "stageOccupancy": {
            "IF": "I3",
            "ID": "I2",
            "OF": null,
            "IE": null,
            "WB": null
          },
          "boundaryRegisters": {
            "IF_ID": {
              "instructionId": "I3",
              "nextStage": "ID"
            },
            "ID_OF": {
              "instructionId": "I2",
              "nextStage": "OF",
              "destination": "R2"
            },
            "OF_IE": null,
            "IE_WB": null
          },
          "registers": {
            "R1": 5,
            "R2": 0,
            "R3": 0,
            "R4": 0,
            "R5": 0,
            "R6": 0
          },
          "status": {
            "Z": 0
          },
          "completed": [
            "I1"
          ],
          "nextFetch": "I4",
          "restartPC": "I2",
          "discarded": [
            "I2",
            "I3",
            "I4",
            "I5"
          ],
          "savedContext": {
            "registers": {
              "R1": 5,
              "R2": 0,
              "R3": 0,
              "R4": 0,
              "R5": 0,
              "R6": 0
            },
            "status": {
              "Z": 0
            },
            "restartPC": "I2"
          },
          "contextRestored": true,
          "handlerComplete": true
        }
      },
      {
        "id": "restart-cycle-8",
        "title": {
          "en": "Application clock 8",
          "vi": "Nhịp chương trình 8"
        },
        "action": {
          "en": "Advance each issued instruction by one stage: IF: I4; ID: I3; OF: I2; IE: —; WB: —.",
          "vi": "Cho mỗi lệnh đã đưa vào tiến một giai đoạn: IF: I4; ID: I3; OF: I2; IE: —; WB: —."
        },
        "why": {
          "en": "Separate stages can operate concurrently; boundary registers retain the information required by the next stage.",
          "vi": "Các giai đoạn riêng có thể hoạt động đồng thời; thanh ghi ranh giới giữ thông tin cần cho giai đoạn kế tiếp."
        },
        "outcome": {
          "en": "End-of-clock boundary registers now describe the next stage inputs. No instruction commits on this clock.",
          "vi": "Thanh ghi ở cuối nhịp hiện chứa đầu vào cho giai đoạn tiếp theo. Không có lệnh nào ghi kết quả cuối ở nhịp này."
        },
        "before": {
          "clock": 7,
          "phase": "refill",
          "stageOccupancy": {
            "IF": "I3",
            "ID": "I2",
            "OF": null,
            "IE": null,
            "WB": null
          },
          "boundaryRegisters": {
            "IF_ID": {
              "instructionId": "I3",
              "nextStage": "ID"
            },
            "ID_OF": {
              "instructionId": "I2",
              "nextStage": "OF",
              "destination": "R2"
            },
            "OF_IE": null,
            "IE_WB": null
          },
          "registers": {
            "R1": 5,
            "R2": 0,
            "R3": 0,
            "R4": 0,
            "R5": 0,
            "R6": 0
          },
          "status": {
            "Z": 0
          },
          "completed": [
            "I1"
          ],
          "nextFetch": "I4",
          "restartPC": "I2",
          "discarded": [
            "I2",
            "I3",
            "I4",
            "I5"
          ],
          "savedContext": {
            "registers": {
              "R1": 5,
              "R2": 0,
              "R3": 0,
              "R4": 0,
              "R5": 0,
              "R6": 0
            },
            "status": {
              "Z": 0
            },
            "restartPC": "I2"
          },
          "contextRestored": true,
          "handlerComplete": true
        },
        "after": {
          "clock": 8,
          "phase": "refill",
          "stageOccupancy": {
            "IF": "I4",
            "ID": "I3",
            "OF": "I2",
            "IE": null,
            "WB": null
          },
          "boundaryRegisters": {
            "IF_ID": {
              "instructionId": "I4",
              "nextStage": "ID"
            },
            "ID_OF": {
              "instructionId": "I3",
              "nextStage": "OF",
              "destination": "R3"
            },
            "OF_IE": {
              "instructionId": "I2",
              "nextStage": "IE",
              "destination": "R2",
              "operands": [
                4,
                5
              ]
            },
            "IE_WB": null
          },
          "registers": {
            "R1": 5,
            "R2": 0,
            "R3": 0,
            "R4": 0,
            "R5": 0,
            "R6": 0
          },
          "status": {
            "Z": 0
          },
          "completed": [
            "I1"
          ],
          "nextFetch": "I5",
          "restartPC": "I2",
          "discarded": [
            "I2",
            "I3",
            "I4",
            "I5"
          ],
          "savedContext": {
            "registers": {
              "R1": 5,
              "R2": 0,
              "R3": 0,
              "R4": 0,
              "R5": 0,
              "R6": 0
            },
            "status": {
              "Z": 0
            },
            "restartPC": "I2"
          },
          "contextRestored": true,
          "handlerComplete": true
        }
      },
      {
        "id": "restart-cycle-9",
        "title": {
          "en": "Application clock 9",
          "vi": "Nhịp chương trình 9"
        },
        "action": {
          "en": "Advance each issued instruction by one stage: IF: I5; ID: I4; OF: I3; IE: I2; WB: —.",
          "vi": "Cho mỗi lệnh đã đưa vào tiến một giai đoạn: IF: I5; ID: I4; OF: I3; IE: I2; WB: —."
        },
        "why": {
          "en": "Separate stages can operate concurrently; boundary registers retain the information required by the next stage.",
          "vi": "Các giai đoạn riêng có thể hoạt động đồng thời; thanh ghi ranh giới giữ thông tin cần cho giai đoạn kế tiếp."
        },
        "outcome": {
          "en": "End-of-clock boundary registers now describe the next stage inputs. No instruction commits on this clock.",
          "vi": "Thanh ghi ở cuối nhịp hiện chứa đầu vào cho giai đoạn tiếp theo. Không có lệnh nào ghi kết quả cuối ở nhịp này."
        },
        "before": {
          "clock": 8,
          "phase": "refill",
          "stageOccupancy": {
            "IF": "I4",
            "ID": "I3",
            "OF": "I2",
            "IE": null,
            "WB": null
          },
          "boundaryRegisters": {
            "IF_ID": {
              "instructionId": "I4",
              "nextStage": "ID"
            },
            "ID_OF": {
              "instructionId": "I3",
              "nextStage": "OF",
              "destination": "R3"
            },
            "OF_IE": {
              "instructionId": "I2",
              "nextStage": "IE",
              "destination": "R2",
              "operands": [
                4,
                5
              ]
            },
            "IE_WB": null
          },
          "registers": {
            "R1": 5,
            "R2": 0,
            "R3": 0,
            "R4": 0,
            "R5": 0,
            "R6": 0
          },
          "status": {
            "Z": 0
          },
          "completed": [
            "I1"
          ],
          "nextFetch": "I5",
          "restartPC": "I2",
          "discarded": [
            "I2",
            "I3",
            "I4",
            "I5"
          ],
          "savedContext": {
            "registers": {
              "R1": 5,
              "R2": 0,
              "R3": 0,
              "R4": 0,
              "R5": 0,
              "R6": 0
            },
            "status": {
              "Z": 0
            },
            "restartPC": "I2"
          },
          "contextRestored": true,
          "handlerComplete": true
        },
        "after": {
          "clock": 9,
          "phase": "refill",
          "stageOccupancy": {
            "IF": "I5",
            "ID": "I4",
            "OF": "I3",
            "IE": "I2",
            "WB": null
          },
          "boundaryRegisters": {
            "IF_ID": {
              "instructionId": "I5",
              "nextStage": "ID"
            },
            "ID_OF": {
              "instructionId": "I4",
              "nextStage": "OF",
              "destination": "R4"
            },
            "OF_IE": {
              "instructionId": "I3",
              "nextStage": "IE",
              "destination": "R3",
              "operands": [
                6,
                7
              ]
            },
            "IE_WB": {
              "instructionId": "I2",
              "nextStage": "WB",
              "destination": "R2",
              "operands": [
                4,
                5
              ],
              "result": 9
            }
          },
          "registers": {
            "R1": 5,
            "R2": 0,
            "R3": 0,
            "R4": 0,
            "R5": 0,
            "R6": 0
          },
          "status": {
            "Z": 0
          },
          "completed": [
            "I1"
          ],
          "nextFetch": "I6",
          "restartPC": "I2",
          "discarded": [
            "I2",
            "I3",
            "I4",
            "I5"
          ],
          "savedContext": {
            "registers": {
              "R1": 5,
              "R2": 0,
              "R3": 0,
              "R4": 0,
              "R5": 0,
              "R6": 0
            },
            "status": {
              "Z": 0
            },
            "restartPC": "I2"
          },
          "contextRestored": true,
          "handlerComplete": true
        }
      },
      {
        "id": "restart-cycle-10",
        "title": {
          "en": "Application clock 10",
          "vi": "Nhịp chương trình 10"
        },
        "action": {
          "en": "Advance each issued instruction by one stage: IF: I6; ID: I5; OF: I4; IE: I3; WB: I2.",
          "vi": "Cho mỗi lệnh đã đưa vào tiến một giai đoạn: IF: I6; ID: I5; OF: I4; IE: I3; WB: I2."
        },
        "why": {
          "en": "Separate stages can operate concurrently; boundary registers retain the information required by the next stage.",
          "vi": "Các giai đoạn riêng có thể hoạt động đồng thời; thanh ghi ranh giới giữ thông tin cần cho giai đoạn kế tiếp."
        },
        "outcome": {
          "en": "End-of-clock boundary registers now describe the next stage inputs. I2 commits its result at this boundary.",
          "vi": "Thanh ghi ở cuối nhịp hiện chứa đầu vào cho giai đoạn tiếp theo. I2 ghi kết quả ở ranh giới này."
        },
        "before": {
          "clock": 9,
          "phase": "refill",
          "stageOccupancy": {
            "IF": "I5",
            "ID": "I4",
            "OF": "I3",
            "IE": "I2",
            "WB": null
          },
          "boundaryRegisters": {
            "IF_ID": {
              "instructionId": "I5",
              "nextStage": "ID"
            },
            "ID_OF": {
              "instructionId": "I4",
              "nextStage": "OF",
              "destination": "R4"
            },
            "OF_IE": {
              "instructionId": "I3",
              "nextStage": "IE",
              "destination": "R3",
              "operands": [
                6,
                7
              ]
            },
            "IE_WB": {
              "instructionId": "I2",
              "nextStage": "WB",
              "destination": "R2",
              "operands": [
                4,
                5
              ],
              "result": 9
            }
          },
          "registers": {
            "R1": 5,
            "R2": 0,
            "R3": 0,
            "R4": 0,
            "R5": 0,
            "R6": 0
          },
          "status": {
            "Z": 0
          },
          "completed": [
            "I1"
          ],
          "nextFetch": "I6",
          "restartPC": "I2",
          "discarded": [
            "I2",
            "I3",
            "I4",
            "I5"
          ],
          "savedContext": {
            "registers": {
              "R1": 5,
              "R2": 0,
              "R3": 0,
              "R4": 0,
              "R5": 0,
              "R6": 0
            },
            "status": {
              "Z": 0
            },
            "restartPC": "I2"
          },
          "contextRestored": true,
          "handlerComplete": true
        },
        "after": {
          "clock": 10,
          "phase": "full",
          "stageOccupancy": {
            "IF": "I6",
            "ID": "I5",
            "OF": "I4",
            "IE": "I3",
            "WB": "I2"
          },
          "boundaryRegisters": {
            "IF_ID": {
              "instructionId": "I6",
              "nextStage": "ID"
            },
            "ID_OF": {
              "instructionId": "I5",
              "nextStage": "OF",
              "destination": "R5"
            },
            "OF_IE": {
              "instructionId": "I4",
              "nextStage": "IE",
              "destination": "R4",
              "operands": [
                8,
                9
              ]
            },
            "IE_WB": {
              "instructionId": "I3",
              "nextStage": "WB",
              "destination": "R3",
              "operands": [
                6,
                7
              ],
              "result": 13
            }
          },
          "registers": {
            "R1": 5,
            "R2": 9,
            "R3": 0,
            "R4": 0,
            "R5": 0,
            "R6": 0
          },
          "status": {
            "Z": 0
          },
          "completed": [
            "I1",
            "I2"
          ],
          "nextFetch": null,
          "restartPC": "I2",
          "discarded": [
            "I2",
            "I3",
            "I4",
            "I5"
          ],
          "savedContext": {
            "registers": {
              "R1": 5,
              "R2": 0,
              "R3": 0,
              "R4": 0,
              "R5": 0,
              "R6": 0
            },
            "status": {
              "Z": 0
            },
            "restartPC": "I2"
          },
          "contextRestored": true,
          "handlerComplete": true
        }
      },
      {
        "id": "restart-cycle-11",
        "title": {
          "en": "Application clock 11",
          "vi": "Nhịp chương trình 11"
        },
        "action": {
          "en": "Advance each issued instruction by one stage: IF: —; ID: I6; OF: I5; IE: I4; WB: I3.",
          "vi": "Cho mỗi lệnh đã đưa vào tiến một giai đoạn: IF: —; ID: I6; OF: I5; IE: I4; WB: I3."
        },
        "why": {
          "en": "Separate stages can operate concurrently; boundary registers retain the information required by the next stage.",
          "vi": "Các giai đoạn riêng có thể hoạt động đồng thời; thanh ghi ranh giới giữ thông tin cần cho giai đoạn kế tiếp."
        },
        "outcome": {
          "en": "End-of-clock boundary registers now describe the next stage inputs. I3 commits its result at this boundary.",
          "vi": "Thanh ghi ở cuối nhịp hiện chứa đầu vào cho giai đoạn tiếp theo. I3 ghi kết quả ở ranh giới này."
        },
        "before": {
          "clock": 10,
          "phase": "full",
          "stageOccupancy": {
            "IF": "I6",
            "ID": "I5",
            "OF": "I4",
            "IE": "I3",
            "WB": "I2"
          },
          "boundaryRegisters": {
            "IF_ID": {
              "instructionId": "I6",
              "nextStage": "ID"
            },
            "ID_OF": {
              "instructionId": "I5",
              "nextStage": "OF",
              "destination": "R5"
            },
            "OF_IE": {
              "instructionId": "I4",
              "nextStage": "IE",
              "destination": "R4",
              "operands": [
                8,
                9
              ]
            },
            "IE_WB": {
              "instructionId": "I3",
              "nextStage": "WB",
              "destination": "R3",
              "operands": [
                6,
                7
              ],
              "result": 13
            }
          },
          "registers": {
            "R1": 5,
            "R2": 9,
            "R3": 0,
            "R4": 0,
            "R5": 0,
            "R6": 0
          },
          "status": {
            "Z": 0
          },
          "completed": [
            "I1",
            "I2"
          ],
          "nextFetch": null,
          "restartPC": "I2",
          "discarded": [
            "I2",
            "I3",
            "I4",
            "I5"
          ],
          "savedContext": {
            "registers": {
              "R1": 5,
              "R2": 0,
              "R3": 0,
              "R4": 0,
              "R5": 0,
              "R6": 0
            },
            "status": {
              "Z": 0
            },
            "restartPC": "I2"
          },
          "contextRestored": true,
          "handlerComplete": true
        },
        "after": {
          "clock": 11,
          "phase": "drain",
          "stageOccupancy": {
            "IF": null,
            "ID": "I6",
            "OF": "I5",
            "IE": "I4",
            "WB": "I3"
          },
          "boundaryRegisters": {
            "IF_ID": null,
            "ID_OF": {
              "instructionId": "I6",
              "nextStage": "OF",
              "destination": "R6"
            },
            "OF_IE": {
              "instructionId": "I5",
              "nextStage": "IE",
              "destination": "R5",
              "operands": [
                10,
                11
              ]
            },
            "IE_WB": {
              "instructionId": "I4",
              "nextStage": "WB",
              "destination": "R4",
              "operands": [
                8,
                9
              ],
              "result": 17
            }
          },
          "registers": {
            "R1": 5,
            "R2": 9,
            "R3": 13,
            "R4": 0,
            "R5": 0,
            "R6": 0
          },
          "status": {
            "Z": 0
          },
          "completed": [
            "I1",
            "I2",
            "I3"
          ],
          "nextFetch": null,
          "restartPC": "I2",
          "discarded": [
            "I2",
            "I3",
            "I4",
            "I5"
          ],
          "savedContext": {
            "registers": {
              "R1": 5,
              "R2": 0,
              "R3": 0,
              "R4": 0,
              "R5": 0,
              "R6": 0
            },
            "status": {
              "Z": 0
            },
            "restartPC": "I2"
          },
          "contextRestored": true,
          "handlerComplete": true
        }
      },
      {
        "id": "restart-cycle-12",
        "title": {
          "en": "Application clock 12",
          "vi": "Nhịp chương trình 12"
        },
        "action": {
          "en": "Advance each issued instruction by one stage: IF: —; ID: —; OF: I6; IE: I5; WB: I4.",
          "vi": "Cho mỗi lệnh đã đưa vào tiến một giai đoạn: IF: —; ID: —; OF: I6; IE: I5; WB: I4."
        },
        "why": {
          "en": "Separate stages can operate concurrently; boundary registers retain the information required by the next stage.",
          "vi": "Các giai đoạn riêng có thể hoạt động đồng thời; thanh ghi ranh giới giữ thông tin cần cho giai đoạn kế tiếp."
        },
        "outcome": {
          "en": "End-of-clock boundary registers now describe the next stage inputs. I4 commits its result at this boundary.",
          "vi": "Thanh ghi ở cuối nhịp hiện chứa đầu vào cho giai đoạn tiếp theo. I4 ghi kết quả ở ranh giới này."
        },
        "before": {
          "clock": 11,
          "phase": "drain",
          "stageOccupancy": {
            "IF": null,
            "ID": "I6",
            "OF": "I5",
            "IE": "I4",
            "WB": "I3"
          },
          "boundaryRegisters": {
            "IF_ID": null,
            "ID_OF": {
              "instructionId": "I6",
              "nextStage": "OF",
              "destination": "R6"
            },
            "OF_IE": {
              "instructionId": "I5",
              "nextStage": "IE",
              "destination": "R5",
              "operands": [
                10,
                11
              ]
            },
            "IE_WB": {
              "instructionId": "I4",
              "nextStage": "WB",
              "destination": "R4",
              "operands": [
                8,
                9
              ],
              "result": 17
            }
          },
          "registers": {
            "R1": 5,
            "R2": 9,
            "R3": 13,
            "R4": 0,
            "R5": 0,
            "R6": 0
          },
          "status": {
            "Z": 0
          },
          "completed": [
            "I1",
            "I2",
            "I3"
          ],
          "nextFetch": null,
          "restartPC": "I2",
          "discarded": [
            "I2",
            "I3",
            "I4",
            "I5"
          ],
          "savedContext": {
            "registers": {
              "R1": 5,
              "R2": 0,
              "R3": 0,
              "R4": 0,
              "R5": 0,
              "R6": 0
            },
            "status": {
              "Z": 0
            },
            "restartPC": "I2"
          },
          "contextRestored": true,
          "handlerComplete": true
        },
        "after": {
          "clock": 12,
          "phase": "drain",
          "stageOccupancy": {
            "IF": null,
            "ID": null,
            "OF": "I6",
            "IE": "I5",
            "WB": "I4"
          },
          "boundaryRegisters": {
            "IF_ID": null,
            "ID_OF": null,
            "OF_IE": {
              "instructionId": "I6",
              "nextStage": "IE",
              "destination": "R6",
              "operands": [
                12,
                13
              ]
            },
            "IE_WB": {
              "instructionId": "I5",
              "nextStage": "WB",
              "destination": "R5",
              "operands": [
                10,
                11
              ],
              "result": 21
            }
          },
          "registers": {
            "R1": 5,
            "R2": 9,
            "R3": 13,
            "R4": 17,
            "R5": 0,
            "R6": 0
          },
          "status": {
            "Z": 0
          },
          "completed": [
            "I1",
            "I2",
            "I3",
            "I4"
          ],
          "nextFetch": null,
          "restartPC": "I2",
          "discarded": [
            "I2",
            "I3",
            "I4",
            "I5"
          ],
          "savedContext": {
            "registers": {
              "R1": 5,
              "R2": 0,
              "R3": 0,
              "R4": 0,
              "R5": 0,
              "R6": 0
            },
            "status": {
              "Z": 0
            },
            "restartPC": "I2"
          },
          "contextRestored": true,
          "handlerComplete": true
        }
      },
      {
        "id": "restart-cycle-13",
        "title": {
          "en": "Application clock 13",
          "vi": "Nhịp chương trình 13"
        },
        "action": {
          "en": "Advance each issued instruction by one stage: IF: —; ID: —; OF: —; IE: I6; WB: I5.",
          "vi": "Cho mỗi lệnh đã đưa vào tiến một giai đoạn: IF: —; ID: —; OF: —; IE: I6; WB: I5."
        },
        "why": {
          "en": "Separate stages can operate concurrently; boundary registers retain the information required by the next stage.",
          "vi": "Các giai đoạn riêng có thể hoạt động đồng thời; thanh ghi ranh giới giữ thông tin cần cho giai đoạn kế tiếp."
        },
        "outcome": {
          "en": "End-of-clock boundary registers now describe the next stage inputs. I5 commits its result at this boundary.",
          "vi": "Thanh ghi ở cuối nhịp hiện chứa đầu vào cho giai đoạn tiếp theo. I5 ghi kết quả ở ranh giới này."
        },
        "before": {
          "clock": 12,
          "phase": "drain",
          "stageOccupancy": {
            "IF": null,
            "ID": null,
            "OF": "I6",
            "IE": "I5",
            "WB": "I4"
          },
          "boundaryRegisters": {
            "IF_ID": null,
            "ID_OF": null,
            "OF_IE": {
              "instructionId": "I6",
              "nextStage": "IE",
              "destination": "R6",
              "operands": [
                12,
                13
              ]
            },
            "IE_WB": {
              "instructionId": "I5",
              "nextStage": "WB",
              "destination": "R5",
              "operands": [
                10,
                11
              ],
              "result": 21
            }
          },
          "registers": {
            "R1": 5,
            "R2": 9,
            "R3": 13,
            "R4": 17,
            "R5": 0,
            "R6": 0
          },
          "status": {
            "Z": 0
          },
          "completed": [
            "I1",
            "I2",
            "I3",
            "I4"
          ],
          "nextFetch": null,
          "restartPC": "I2",
          "discarded": [
            "I2",
            "I3",
            "I4",
            "I5"
          ],
          "savedContext": {
            "registers": {
              "R1": 5,
              "R2": 0,
              "R3": 0,
              "R4": 0,
              "R5": 0,
              "R6": 0
            },
            "status": {
              "Z": 0
            },
            "restartPC": "I2"
          },
          "contextRestored": true,
          "handlerComplete": true
        },
        "after": {
          "clock": 13,
          "phase": "drain",
          "stageOccupancy": {
            "IF": null,
            "ID": null,
            "OF": null,
            "IE": "I6",
            "WB": "I5"
          },
          "boundaryRegisters": {
            "IF_ID": null,
            "ID_OF": null,
            "OF_IE": null,
            "IE_WB": {
              "instructionId": "I6",
              "nextStage": "WB",
              "destination": "R6",
              "operands": [
                12,
                13
              ],
              "result": 25
            }
          },
          "registers": {
            "R1": 5,
            "R2": 9,
            "R3": 13,
            "R4": 17,
            "R5": 21,
            "R6": 0
          },
          "status": {
            "Z": 0
          },
          "completed": [
            "I1",
            "I2",
            "I3",
            "I4",
            "I5"
          ],
          "nextFetch": null,
          "restartPC": "I2",
          "discarded": [
            "I2",
            "I3",
            "I4",
            "I5"
          ],
          "savedContext": {
            "registers": {
              "R1": 5,
              "R2": 0,
              "R3": 0,
              "R4": 0,
              "R5": 0,
              "R6": 0
            },
            "status": {
              "Z": 0
            },
            "restartPC": "I2"
          },
          "contextRestored": true,
          "handlerComplete": true
        }
      },
      {
        "id": "restart-cycle-14",
        "title": {
          "en": "Application clock 14",
          "vi": "Nhịp chương trình 14"
        },
        "action": {
          "en": "Advance each issued instruction by one stage: IF: —; ID: —; OF: —; IE: —; WB: I6.",
          "vi": "Cho mỗi lệnh đã đưa vào tiến một giai đoạn: IF: —; ID: —; OF: —; IE: —; WB: I6."
        },
        "why": {
          "en": "Separate stages can operate concurrently; boundary registers retain the information required by the next stage.",
          "vi": "Các giai đoạn riêng có thể hoạt động đồng thời; thanh ghi ranh giới giữ thông tin cần cho giai đoạn kế tiếp."
        },
        "outcome": {
          "en": "End-of-clock boundary registers now describe the next stage inputs. I6 commits its result at this boundary.",
          "vi": "Thanh ghi ở cuối nhịp hiện chứa đầu vào cho giai đoạn tiếp theo. I6 ghi kết quả ở ranh giới này."
        },
        "before": {
          "clock": 13,
          "phase": "drain",
          "stageOccupancy": {
            "IF": null,
            "ID": null,
            "OF": null,
            "IE": "I6",
            "WB": "I5"
          },
          "boundaryRegisters": {
            "IF_ID": null,
            "ID_OF": null,
            "OF_IE": null,
            "IE_WB": {
              "instructionId": "I6",
              "nextStage": "WB",
              "destination": "R6",
              "operands": [
                12,
                13
              ],
              "result": 25
            }
          },
          "registers": {
            "R1": 5,
            "R2": 9,
            "R3": 13,
            "R4": 17,
            "R5": 21,
            "R6": 0
          },
          "status": {
            "Z": 0
          },
          "completed": [
            "I1",
            "I2",
            "I3",
            "I4",
            "I5"
          ],
          "nextFetch": null,
          "restartPC": "I2",
          "discarded": [
            "I2",
            "I3",
            "I4",
            "I5"
          ],
          "savedContext": {
            "registers": {
              "R1": 5,
              "R2": 0,
              "R3": 0,
              "R4": 0,
              "R5": 0,
              "R6": 0
            },
            "status": {
              "Z": 0
            },
            "restartPC": "I2"
          },
          "contextRestored": true,
          "handlerComplete": true
        },
        "after": {
          "clock": 14,
          "phase": "complete",
          "stageOccupancy": {
            "IF": null,
            "ID": null,
            "OF": null,
            "IE": null,
            "WB": "I6"
          },
          "boundaryRegisters": {
            "IF_ID": null,
            "ID_OF": null,
            "OF_IE": null,
            "IE_WB": null
          },
          "registers": {
            "R1": 5,
            "R2": 9,
            "R3": 13,
            "R4": 17,
            "R5": 21,
            "R6": 25
          },
          "status": {
            "Z": 0
          },
          "completed": [
            "I1",
            "I2",
            "I3",
            "I4",
            "I5",
            "I6"
          ],
          "nextFetch": null,
          "restartPC": "I2",
          "discarded": [
            "I2",
            "I3",
            "I4",
            "I5"
          ],
          "savedContext": {
            "registers": {
              "R1": 5,
              "R2": 0,
              "R3": 0,
              "R4": 0,
              "R5": 0,
              "R6": 0
            },
            "status": {
              "Z": 0
            },
            "restartPC": "I2"
          },
          "contextRestored": true,
          "handlerComplete": true
        }
      }
    ],
    "metrics": {
      "singleInstructionLatencyClocks": 5,
      "idealCompletionIntervalClocks": 1,
      "nonPipelinedClocksForSix": 30,
      "idealPipelineClocksForSix": 10,
      "applicationClocksInThisTrace": 14,
      "handlerDurationClocks": null
    }
  }
] as const);
export const pipelineScenarios=deepFreeze([
 {id:"ideal",label:{en:"Ideal fill, full occupancy and drain",vi:"Lấp đầy, đầy đủ giai đoạn rồi rút hết"}},
 {id:"interrupt-flush",label:{en:"Interrupt: save, flush, restore and restart",vi:"Ngắt: lưu, xóa đường ống, khôi phục và chạy lại"}}
] as const);
export function pipelineTrace(id:string):PipelineTrace {const trace=pipelineData.find(item=>item.id===id);if(!trace)throw new RangeError("Unsupported pipeline scenario: "+id);return trace;}

export interface PipelineCellFeedback {
  readonly clock: number;
  readonly stage: PipelineStage;
  readonly prediction: string;
  readonly expected: string | null;
  readonly correct: boolean;
  readonly feedback: Localized;
}
/** Cell practice uses the reviewed ideal trace, never a second occupancy table. */
export function pipelineCellFeedback(clock: number, stage: PipelineStage, prediction: string): PipelineCellFeedback {
  const ideal = pipelineTrace("ideal");
  const step = ideal.steps.find(item => item.id === `cycle-${clock}`);
  if (!Number.isInteger(clock) || !step || !ideal.stages.includes(stage)) throw new RangeError("Unsupported pipeline cell");
  if (prediction !== "empty" && !ideal.instructions.some(item => item.id === prediction)) throw new RangeError("Unsupported pipeline prediction");
  const expected = step.after.stageOccupancy[stage];
  const correct = prediction === (expected ?? "empty");
  return deepFreeze({ clock, stage, prediction, expected, correct, feedback: {
    en: `${correct ? "Correct." : "Not this cell."} At clock ${clock}, ${stage} ${expected ? `contains ${expected}` : "is empty"}. You chose ${prediction === "empty" ? "empty" : prediction}. This comes from the ideal five-stage schedule.`,
    vi: `${correct ? "Chính xác." : "Chưa đúng ô này."} Ở chu kỳ ${clock}, ${stage} ${expected ? `chứa ${expected}` : "trống"}. Bạn chọn ${prediction === "empty" ? "trống" : prediction}. Kết quả lấy từ lịch pipeline năm giai đoạn lý tưởng.`,
  } });
}

export interface PipelineInstructionMatrix {
  readonly scenarioId: PipelineScenarioId;
  readonly columns: readonly { readonly clock: number; readonly stepId: string; readonly restarted: boolean }[];
  readonly rows: readonly { readonly instructionId: string; readonly cells: readonly { readonly clock: number; readonly stage: PipelineStage | null }[] }[];
}
/** Transpose the same clock snapshots; save/handler/restore events add no clock column. */
export function pipelineInstructionMatrix(scenarioId: string): PipelineInstructionMatrix {
  const trace = pipelineTrace(scenarioId);
  const clockSteps = trace.steps.filter(step => /^(restart-)?cycle-\d+$/.test(step.id));
  return deepFreeze({
    scenarioId: trace.id,
    columns: clockSteps.map(step => ({ clock: step.after.clock, stepId: step.id, restarted: step.id.startsWith("restart-") })),
    rows: trace.instructions.map(instruction => ({ instructionId: instruction.id, cells: clockSteps.map(step => ({
      clock: step.after.clock,
      stage: trace.stages.find(stage => step.after.stageOccupancy[stage] === instruction.id) ?? null,
    })) })),
  });
}
