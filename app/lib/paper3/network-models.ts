import type { Localized } from "./catalog";

export type TcpIpPayloadId = "revision-page" | "diagram-image";
export type NetworkLayerId = "application" | "transport" | "internet" | "link";
export type NetworkWrapperId = Exclude<NetworkLayerId, "application">;
export type NetworkActorId = "sender" | "network" | "receiver";
export type NetworkLinkScope = "first-link" | "final-link" | null;
export interface TcpIpPayload {
  readonly id: TcpIpPayloadId;
  readonly resource: string;
  readonly text: string;
}
export interface TcpIpUnitState {
  readonly payload: TcpIpPayload;
  readonly wrappers: readonly NetworkWrapperId[];
  readonly location: NetworkActorId;
  readonly delivered: boolean;
  readonly linkScope: NetworkLinkScope;
}
export interface TcpIpJourneyStep {
  readonly id: string;
  readonly actor: NetworkActorId;
  readonly layer: NetworkLayerId | null;
  readonly direction: "down" | "across" | "up";
  readonly operation: "create-payload" | "add-wrapper" | "transfer" | "remove-wrapper" | "deliver-payload";
  readonly before: TcpIpUnitState;
  readonly after: TcpIpUnitState;
  readonly changedWrapper: NetworkWrapperId | null;
  readonly title: Localized;
  readonly action: Localized;
  readonly why: Localized;
  readonly outcome: Localized;
  readonly highlight: readonly string[];
}
export interface NetworkLayerChoice {
  readonly layer: NetworkLayerId;
  readonly correct: boolean;
  readonly feedback: Localized;
}
export interface LayerResponsibilityQuestion {
  readonly id: string;
  readonly prompt: Localized;
  readonly correctLayer: NetworkLayerId;
  readonly choices: readonly NetworkLayerChoice[];
  readonly explanation: Localized;
}

function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    Object.values(value).forEach(deepFreeze);
    Object.freeze(value);
  }
  return value;
}

// Canonical Section 14 pilot contract v1.0.0. No live protocol simulation.
// The source contract owns the nine states, wrapper order and bilingual explanations.
const contract = deepFreeze({
  "layers": [
    {
      "id": "application",
      "label": {
        "en": "Application",
        "vi": "Application · Ứng dụng"
      }
    },
    {
      "id": "transport",
      "label": {
        "en": "Transport",
        "vi": "Transport · Giao vận"
      }
    },
    {
      "id": "internet",
      "label": {
        "en": "Internet",
        "vi": "Internet"
      }
    },
    {
      "id": "link",
      "label": {
        "en": "Link",
        "vi": "Link · Liên kết"
      }
    }
  ],
  "wrapperLabels": {
    "transport": {
      "en": "Transport control information",
      "vi": "Thông tin điều khiển Transport"
    },
    "internet": {
      "en": "Internet control information",
      "vi": "Thông tin điều khiển Internet"
    },
    "link": {
      "en": "Link control information",
      "vi": "Thông tin điều khiển Link"
    }
  },
  "scenario": {
    "label": {
      "en": "Request a web resource",
      "vi": "Yêu cầu một tài nguyên web"
    },
    "senderLabel": {
      "en": "Sender · browser host",
      "vi": "Host gửi · trình duyệt"
    },
    "receiverLabel": {
      "en": "Receiver · web-server host",
      "vi": "Host nhận · máy chủ web"
    },
    "applicationProtocol": "HTTP",
    "payloads": [
      {
        "id": "revision-page",
        "resource": "/revision",
        "label": {
          "en": "Revision page",
          "vi": "Trang ôn tập"
        },
        "text": "Request /revision"
      },
      {
        "id": "diagram-image",
        "resource": "/diagram.png",
        "label": {
          "en": "Diagram image",
          "vi": "Ảnh sơ đồ"
        },
        "text": "Request /diagram.png"
      }
    ]
  },
  "steps": [
    {
      "id": "sender-application",
      "actor": "sender",
      "layer": "application",
      "direction": "down",
      "operation": "create-payload",
      "before": {
        "wrappers": [],
        "location": "sender",
        "delivered": false,
        "linkScope": null
      },
      "after": {
        "wrappers": [],
        "location": "sender",
        "delivered": false,
        "linkScope": null
      },
      "changedWrapper": null,
      "title": {
        "en": "Create the application request",
        "vi": "Tạo yêu cầu ứng dụng"
      },
      "action": {
        "en": "The browser prepares the selected request using the application protocol.",
        "vi": "Trình duyệt chuẩn bị yêu cầu đã chọn theo giao thức ứng dụng."
      },
      "why": {
        "en": "Both applications need agreed rules for interpreting the request.",
        "vi": "Hai ứng dụng cần quy tắc chung để hiểu yêu cầu."
      },
      "outcome": {
        "en": "Application data is ready to pass down to Transport.",
        "vi": "Dữ liệu ứng dụng sẵn sàng chuyển xuống Transport."
      },
      "highlight": [
        "sender.application",
        "payload"
      ]
    },
    {
      "id": "sender-transport",
      "actor": "sender",
      "layer": "transport",
      "direction": "down",
      "operation": "add-wrapper",
      "before": {
        "wrappers": [],
        "location": "sender",
        "delivered": false,
        "linkScope": null
      },
      "after": {
        "wrappers": [
          "transport"
        ],
        "location": "sender",
        "delivered": false,
        "linkScope": null
      },
      "changedWrapper": "transport",
      "title": {
        "en": "Add Transport control information",
        "vi": "Thêm thông tin điều khiển Transport"
      },
      "action": {
        "en": "Transport adds its control information around the application data.",
        "vi": "Transport thêm thông tin điều khiển của tầng này quanh dữ liệu ứng dụng."
      },
      "why": {
        "en": "Transport supports communication between the applications at the two ends; the request content is retained.",
        "vi": "Transport hỗ trợ trao đổi giữa ứng dụng ở hai đầu; nội dung yêu cầu vẫn được giữ."
      },
      "outcome": {
        "en": "The data and Transport information pass down to Internet.",
        "vi": "Dữ liệu cùng thông tin Transport chuyển xuống Internet."
      },
      "highlight": [
        "sender.transport",
        "wrapper.transport"
      ]
    },
    {
      "id": "sender-internet",
      "actor": "sender",
      "layer": "internet",
      "direction": "down",
      "operation": "add-wrapper",
      "before": {
        "wrappers": [
          "transport"
        ],
        "location": "sender",
        "delivered": false,
        "linkScope": null
      },
      "after": {
        "wrappers": [
          "internet",
          "transport"
        ],
        "location": "sender",
        "delivered": false,
        "linkScope": null
      },
      "changedWrapper": "internet",
      "title": {
        "en": "Add Internet control information",
        "vi": "Thêm thông tin điều khiển Internet"
      },
      "action": {
        "en": "Internet adds control information for addressing and delivery towards the destination host.",
        "vi": "Internet thêm thông tin điều khiển phục vụ địa chỉ và chuyển dữ liệu tới host đích."
      },
      "why": {
        "en": "The destination host must be identified; the application data remains inside the existing information.",
        "vi": "Cần xác định host đích; dữ liệu ứng dụng vẫn nằm trong phần đã được bọc."
      },
      "outcome": {
        "en": "The unit passes down to Link for the local transmission.",
        "vi": "Đơn vị dữ liệu chuyển xuống Link để truyền trên liên kết."
      },
      "highlight": [
        "sender.internet",
        "wrapper.internet"
      ]
    },
    {
      "id": "sender-link",
      "actor": "sender",
      "layer": "link",
      "direction": "down",
      "operation": "add-wrapper",
      "before": {
        "wrappers": [
          "internet",
          "transport"
        ],
        "location": "sender",
        "delivered": false,
        "linkScope": null
      },
      "after": {
        "wrappers": [
          "link",
          "internet",
          "transport"
        ],
        "location": "sender",
        "delivered": false,
        "linkScope": "first-link"
      },
      "changedWrapper": "link",
      "title": {
        "en": "Prepare transmission over the link",
        "vi": "Chuẩn bị truyền qua liên kết"
      },
      "action": {
        "en": "Link adds its control information and prepares the unit for this link.",
        "vi": "Link thêm thông tin điều khiển và chuẩn bị đơn vị dữ liệu cho liên kết này."
      },
      "why": {
        "en": "The link has its own rules for transferring data between connected devices.",
        "vi": "Liên kết có quy tắc riêng để chuyển dữ liệu giữa các thiết bị được nối."
      },
      "outcome": {
        "en": "The wrapped unit is ready to cross the modelled link.",
        "vi": "Đơn vị đã bọc sẵn sàng đi qua liên kết trong mô hình."
      },
      "highlight": [
        "sender.link",
        "wrapper.link"
      ]
    },
    {
      "id": "network-transit",
      "actor": "network",
      "layer": null,
      "direction": "across",
      "operation": "transfer",
      "before": {
        "wrappers": [
          "link",
          "internet",
          "transport"
        ],
        "location": "sender",
        "delivered": false,
        "linkScope": "first-link"
      },
      "after": {
        "wrappers": [
          "link",
          "internet",
          "transport"
        ],
        "location": "network",
        "delivered": false,
        "linkScope": "final-link"
      },
      "changedWrapper": null,
      "title": {
        "en": "Cross the network",
        "vi": "Đi qua mạng"
      },
      "action": {
        "en": "The unit crosses a collapsed network path. Link control is renewed for each local link; the diagram changes from first-link to final-link control.",
        "vi": "Đơn vị dữ liệu đi qua đường mạng được rút gọn. Thông tin Link được tạo lại ở mỗi liên kết; hình chuyển từ thông tin của liên kết đầu sang liên kết cuối."
      },
      "why": {
        "en": "Intermediate hops are omitted. This is a transfer phase, not a fifth TCP/IP layer. The payload, Transport information and end-host Internet identities remain unchanged in this simplified model.",
        "vi": "Các chặng trung gian được lược bỏ. Đây là giai đoạn truyền, không phải tầng TCP/IP thứ năm. Dữ liệu, thông tin Transport và danh tính Internet của hai host giữ nguyên trong mô hình giản lược này."
      },
      "outcome": {
        "en": "The receiver's Link layer will process the arriving unit next.",
        "vi": "Tầng Link của host nhận sẽ xử lý đơn vị đến ở bước tiếp theo."
      },
      "highlight": [
        "network.path",
        "wrapper.link.scope-change",
        "unit"
      ]
    },
    {
      "id": "receiver-link",
      "actor": "receiver",
      "layer": "link",
      "direction": "up",
      "operation": "remove-wrapper",
      "before": {
        "wrappers": [
          "link",
          "internet",
          "transport"
        ],
        "location": "network",
        "delivered": false,
        "linkScope": "final-link"
      },
      "after": {
        "wrappers": [
          "internet",
          "transport"
        ],
        "location": "receiver",
        "delivered": false,
        "linkScope": null
      },
      "changedWrapper": "link",
      "title": {
        "en": "Process Link information",
        "vi": "Xử lý thông tin Link"
      },
      "action": {
        "en": "The receiver's Link layer processes its control information and passes the remaining data up.",
        "vi": "Link ở host nhận xử lý thông tin điều khiển của mình và chuyển phần dữ liệu còn lại lên trên."
      },
      "why": {
        "en": "The outer Link information belongs to this layer; removing it does not remove the application data.",
        "vi": "Thông tin Link ngoài cùng thuộc tầng này; bỏ phần đó không xóa dữ liệu ứng dụng."
      },
      "outcome": {
        "en": "Internet and Transport information remain around the payload.",
        "vi": "Thông tin Internet và Transport vẫn bọc quanh dữ liệu ứng dụng."
      },
      "highlight": [
        "receiver.link",
        "wrapper.link.removed"
      ]
    },
    {
      "id": "receiver-internet",
      "actor": "receiver",
      "layer": "internet",
      "direction": "up",
      "operation": "remove-wrapper",
      "before": {
        "wrappers": [
          "internet",
          "transport"
        ],
        "location": "receiver",
        "delivered": false,
        "linkScope": null
      },
      "after": {
        "wrappers": [
          "transport"
        ],
        "location": "receiver",
        "delivered": false,
        "linkScope": null
      },
      "changedWrapper": "internet",
      "title": {
        "en": "Process Internet information",
        "vi": "Xử lý thông tin Internet"
      },
      "action": {
        "en": "Internet processes the destination-related information at this host and passes the remaining data up to Transport.",
        "vi": "Internet xử lý thông tin liên quan đến đích tại host này và chuyển dữ liệu còn lại lên Transport."
      },
      "why": {
        "en": "Each receiving layer handles its own information before the layer above acts.",
        "vi": "Mỗi tầng nhận xử lý thông tin của mình trước khi tầng trên làm việc."
      },
      "outcome": {
        "en": "Transport information remains around the unchanged application data.",
        "vi": "Thông tin Transport vẫn bọc quanh dữ liệu ứng dụng không đổi."
      },
      "highlight": [
        "receiver.internet",
        "wrapper.internet.removed"
      ]
    },
    {
      "id": "receiver-transport",
      "actor": "receiver",
      "layer": "transport",
      "direction": "up",
      "operation": "remove-wrapper",
      "before": {
        "wrappers": [
          "transport"
        ],
        "location": "receiver",
        "delivered": false,
        "linkScope": null
      },
      "after": {
        "wrappers": [],
        "location": "receiver",
        "delivered": false,
        "linkScope": null
      },
      "changedWrapper": "transport",
      "title": {
        "en": "Deliver the application data upward",
        "vi": "Chuyển dữ liệu lên ứng dụng"
      },
      "action": {
        "en": "Transport processes its control information and provides the application data to the receiving application.",
        "vi": "Transport xử lý thông tin điều khiển của mình và cung cấp dữ liệu cho ứng dụng nhận."
      },
      "why": {
        "en": "The receiving application needs the request content, not the lower-layer wrappers shown in this model.",
        "vi": "Ứng dụng nhận cần nội dung yêu cầu, không cần các phần bọc của tầng dưới trong hình này."
      },
      "outcome": {
        "en": "The payload is ready for Application; no wrappers remain in this schematic.",
        "vi": "Dữ liệu sẵn sàng cho Application; sơ đồ không còn phần bọc nào."
      },
      "highlight": [
        "receiver.transport",
        "wrapper.transport.removed",
        "payload"
      ]
    },
    {
      "id": "receiver-application",
      "actor": "receiver",
      "layer": "application",
      "direction": "up",
      "operation": "deliver-payload",
      "before": {
        "wrappers": [],
        "location": "receiver",
        "delivered": false,
        "linkScope": null
      },
      "after": {
        "wrappers": [],
        "location": "receiver",
        "delivered": true,
        "linkScope": null
      },
      "changedWrapper": null,
      "title": {
        "en": "Interpret the request",
        "vi": "Hiểu yêu cầu nhận được"
      },
      "action": {
        "en": "The web-server application interprets the selected request using the same application protocol.",
        "vi": "Ứng dụng máy chủ web hiểu yêu cầu đã chọn bằng cùng giao thức ứng dụng."
      },
      "why": {
        "en": "Compatible protocol rules let the sender's intent be understood at the receiving end.",
        "vi": "Quy tắc giao thức tương thích giúp đầu nhận hiểu ý định của đầu gửi."
      },
      "outcome": {
        "en": "The original request has reached the receiving application. A response would be a separate journey.",
        "vi": "Yêu cầu ban đầu đã tới ứng dụng nhận. Phản hồi sẽ là một hành trình riêng."
      },
      "highlight": [
        "receiver.application",
        "payload",
        "delivered"
      ]
    }
  ],
  "prediction": {
    "id": "first-receiving-layer",
    "beforeStepId": "receiver-link",
    "prompt": {
      "en": "Which layer acts first when the unit arrives at the receiver, and which outer information does it process?",
      "vi": "Khi đơn vị dữ liệu đến host nhận, tầng nào xử lý đầu tiên và xử lý phần thông tin ngoài nào?"
    },
    "correctLayer": "link",
    "correctWrapper": "link",
    "explanation": {
      "en": "Link handles the incoming link transfer first; the receiving path then moves upward through Internet and Transport to Application.",
      "vi": "Link xử lý truyền trên liên kết trước; đường nhận sau đó đi lên qua Internet và Transport tới Application."
    },
    "doesNotBlockNextOrFullExplanation": true
  }
} as const);

export const tcpIpLayers = contract.layers;
export const tcpIpPayloads: readonly (TcpIpPayload & { readonly label: Localized })[] = contract.scenario.payloads;
export const tcpIpWrapperLabels: Readonly<Record<NetworkWrapperId, Localized>> = contract.wrapperLabels;
export const tcpIpScenario = deepFreeze({
  ...contract.scenario,
  networkCaption: {
    en: "Intermediate hops are omitted. Link control information is renewed for each local link: first-link control becomes final-link control in this collapsed path.",
    vi: "Các chặng trung gian được lược bỏ. Thông tin điều khiển Link được tạo lại ở mỗi liên kết: hình rút gọn chuyển từ liên kết đầu sang liên kết cuối."
  },
  schematicCaption: {
    en: "Four layers per host. Bands show schematic control information, not literal headers or byte layout. The payload is an already-formatted HTTP request, not the requested file.",
    vi: "Mỗi host có bốn tầng. Các dải minh họa thông tin điều khiển, không phải header hay bố trí byte thực. Payload là yêu cầu HTTP đã định dạng, không phải tệp được yêu cầu."
  }
});

const traces = new Map<TcpIpPayloadId, readonly TcpIpJourneyStep[]>(tcpIpPayloads.map(({ id, resource, text }) => {
  const payload: TcpIpPayload = deepFreeze({ id, resource, text });
  return [id, deepFreeze(contract.steps.map(step => ({
    ...step,
    before: { ...step.before, payload },
    after: { ...step.after, payload }
  })))];
}));

/** Selects a complete, deeply frozen nine-state trace. Unknown IDs fail explicitly. */
export function tcpIpJourney(payloadId: TcpIpPayloadId): readonly TcpIpJourneyStep[] {
  const trace = traces.get(payloadId);
  if (!trace) throw new RangeError("Unsupported TCP/IP payload: " + String(payloadId));
  return trace;
}

// Teacher-reviewed per-choice feedback from TEACHER_PILOT_FIXTURES.json.
// React consumes these choices; it does not carry a separate answer key.
const reviewedResponsibility = deepFreeze([
  {
    "id": "agree-request-rules",
    "prompt": {
      "en": "Which layer uses the agreed rules for interpreting this web request?",
      "vi": "Tầng nào dùng quy tắc chung để hiểu yêu cầu web này?"
    },
    "correctLayer": "application",
    "feedbackByLayer": {
      "application": {
        "en": "Correct. HTTP at Application gives this request its format and meaning for the web service.",
        "vi": "Đúng. HTTP ở Application quy định định dạng và ý nghĩa của yêu cầu đối với dịch vụ web."
      },
      "transport": {
        "en": "Transport manages end-to-end delivery; it does not decide which web resource the request means.",
        "vi": "Transport quản lý việc truyền giữa hai đầu cuối, không quyết định yêu cầu nói đến tài nguyên web nào."
      },
      "internet": {
        "en": "Internet handles IP addressing and delivery across networks, not the meaning of an HTTP request.",
        "vi": "Internet xử lý địa chỉ IP và việc truyền qua các mạng, không xử lý ý nghĩa của yêu cầu HTTP."
      },
      "link": {
        "en": "Link handles local transfer rules. The prompt asks about interpreting a web-service request.",
        "vi": "Link xử lý quy tắc truyền cục bộ. Câu hỏi yêu cầu diễn giải một yêu cầu dịch vụ web."
      }
    }
  },
  {
    "id": "application-endpoints",
    "prompt": {
      "en": "Which layer supports communication between the applications at the two ends?",
      "vi": "Tầng nào hỗ trợ trao đổi giữa ứng dụng ở hai đầu?"
    },
    "correctLayer": "transport",
    "feedbackByLayer": {
      "application": {
        "en": "Application defines the service request. The layer responsible for end-to-end transport between applications is Transport.",
        "vi": "Application định nghĩa yêu cầu dịch vụ. Tầng chịu trách nhiệm giao vận giữa ứng dụng ở hai đầu là Transport."
      },
      "transport": {
        "en": "Correct. Transport provides end-to-end delivery services; TCP adds ordering and reliability mechanisms in this example.",
        "vi": "Đúng. Transport cung cấp dịch vụ truyền giữa hai đầu cuối; TCP bổ sung cơ chế thứ tự và độ tin cậy trong ví dụ này."
      },
      "internet": {
        "en": "Internet addresses and routes data towards the host. Transport supplies the end-to-end communication service above it.",
        "vi": "Internet đánh địa chỉ và định tuyến dữ liệu về host. Transport cung cấp dịch vụ truyền giữa hai đầu cuối ở phía trên."
      },
      "link": {
        "en": "Link transfers across a local hop, not the whole end-to-end application connection.",
        "vi": "Link truyền qua một chặng cục bộ, không phụ trách toàn bộ kết nối ứng dụng giữa hai đầu cuối."
      }
    }
  },
  {
    "id": "destination-host",
    "prompt": {
      "en": "Which layer handles addressing for delivery towards the destination host?",
      "vi": "Tầng nào xử lý địa chỉ để chuyển tới host đích?"
    },
    "correctLayer": "internet",
    "feedbackByLayer": {
      "application": {
        "en": "Application interprets service-level requests; destination IP addressing belongs to Internet.",
        "vi": "Application diễn giải yêu cầu cấp dịch vụ; địa chỉ IP đích thuộc Internet."
      },
      "transport": {
        "en": "TCP control supports delivery and ordering, while the enclosing Internet unit carries the end-host IP addresses.",
        "vi": "Điều khiển TCP hỗ trợ truyền và sắp thứ tự, còn đơn vị Internet bao ngoài mang địa chỉ IP của hai host đầu cuối."
      },
      "internet": {
        "en": "Correct. Internet adds and processes IP addressing for delivery towards the intended destination host.",
        "vi": "Đúng. Internet thêm và xử lý địa chỉ IP để truyền về host đích dự kiến."
      },
      "link": {
        "en": "Link control identifies a local transfer. Do not confuse the next connected device with the final internet destination.",
        "vi": "Điều khiển Link phục vụ truyền cục bộ. Không nhầm thiết bị nối trực tiếp tiếp theo với đích internet cuối cùng."
      }
    }
  },
  {
    "id": "local-link",
    "prompt": {
      "en": "Which layer handles transmission over this link between connected devices?",
      "vi": "Tầng nào xử lý truyền qua liên kết này giữa các thiết bị được nối?"
    },
    "correctLayer": "link",
    "feedbackByLayer": {
      "application": {
        "en": "Application requests a service; it delegates local transmission to the lower layers.",
        "vi": "Application yêu cầu dịch vụ và giao việc truyền cục bộ cho các tầng dưới."
      },
      "transport": {
        "en": "Transport operates between endpoints; local framing and the network interface are Link responsibilities.",
        "vi": "Transport hoạt động giữa hai đầu cuối; đóng frame cục bộ và giao diện mạng là trách nhiệm của Link."
      },
      "internet": {
        "en": "Internet handles addressing across networks. Link performs the transfer on this directly connected hop.",
        "vi": "Internet xử lý địa chỉ qua các mạng. Link thực hiện việc truyền ở chặng nối trực tiếp này."
      },
      "link": {
        "en": "Correct. Link frames and transfers data between directly connected devices and interfaces with the network.",
        "vi": "Đúng. Link đóng frame, truyền dữ liệu giữa các thiết bị nối trực tiếp và giao tiếp với mạng."
      }
    }
  }
] as const);

export const tcpIpResponsibilityQuestions: readonly LayerResponsibilityQuestion[] = deepFreeze(
  reviewedResponsibility.map(question => ({
    id: question.id,
    prompt: question.prompt,
    correctLayer: question.correctLayer,
    explanation: question.feedbackByLayer[question.correctLayer],
    choices: tcpIpLayers.map(layer => ({
      layer: layer.id,
      correct: layer.id === question.correctLayer,
      feedback: question.feedbackByLayer[layer.id]
    }))
  }))
);
export const tcpIpPrediction = deepFreeze({
  ...contract.prediction,
  choices: tcpIpLayers.map(layer => ({
    layer: layer.id,
    correct: layer.id === contract.prediction.correctLayer,
    feedback: contract.prediction.explanation
  }))
});
