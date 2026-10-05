import type { Localized } from "./catalog";

export type NetworkTopicKind = "application-protocols" | "bittorrent" | "packet-routing" | "switching-methods";
export interface NetworkTopicStep {
  readonly id: string;
  readonly title: Localized;
  readonly action: Localized;
  readonly why: Localized;
  readonly outcome: Localized;
}
export interface NetworkScenarioOption { readonly id: string; readonly label: Localized }
export type ApplicationProtocol = "HTTP" | "FTP" | "SMTP" | "POP3" | "IMAP" | "BitTorrent";
export interface ProtocolScenario extends NetworkTopicStep {
  readonly prompt: Localized;
  readonly requiredFunction: Localized;
  readonly correctChoiceId: ApplicationProtocol;
  readonly choices: readonly { readonly id: ApplicationProtocol; readonly label: Localized; readonly correct: boolean; readonly feedback: Localized }[];
}
export type PieceId = "A" | "B" | "C" | "D";
export type PeerId = "S" | "P" | "Q" | "L";
export interface BitTorrentState {
  readonly inventories: Readonly<Record<PeerId, readonly PieceId[]>>;
  readonly online: Readonly<Record<PeerId, boolean>>;
  readonly metadataObtained: boolean;
  readonly peersDiscovered: boolean;
  readonly assembled: boolean;
  readonly blockedPiece: PieceId | null;
}
export interface BitTorrentStep extends NetworkTopicStep {
  readonly before: BitTorrentState;
  readonly after: BitTorrentState;
  readonly transfer: { readonly source: PeerId; readonly target: PeerId; readonly piece: PieceId } | null;
}
export interface BitTorrentTrace {
  readonly id: "complete" | "unavailable-piece";
  readonly label: Localized;
  readonly convention: Localized;
  readonly pieces: readonly PieceId[];
  readonly target: "L";
  readonly initial: BitTorrentState;
  readonly steps: readonly BitTorrentStep[];
}
export type PacketId = "p1" | "p2" | "p3";
export type RouterId = "R1" | "R2" | "R3";
export type RouteNodeId = "Source" | RouterId | "Destination";
export interface RoutingRow { readonly id: string; readonly destination: "Destination"; readonly nextHop: RouteNodeId; readonly priority: number }
export interface PacketState {
  readonly locations: Readonly<Record<PacketId, RouteNodeId>>;
  readonly arrivalOrder: readonly PacketId[];
  readonly buffer: readonly PacketId[];
  readonly linkR1R2Up: boolean;
  readonly activePacket: PacketId | null;
  readonly activeRouter: RouterId | null;
  readonly matchedRow: string | null;
  readonly chosenNextHop: RouteNodeId | null;
  readonly assembled: boolean;
  readonly message: string | null;
  readonly stopped: boolean;
}
export interface PacketRoutingStep extends NetworkTopicStep {
  readonly before: PacketState;
  readonly after: PacketState;
}
export interface PacketRoutingTrace {
  readonly id: "reroute" | "unavailable-route";
  readonly label: Localized;
  readonly convention: Localized;
  readonly packets: readonly { readonly id: PacketId; readonly order: number; readonly payload: string; readonly destination: "Destination" }[];
  readonly topology: readonly (readonly [RouteNodeId, RouteNodeId])[];
  readonly tables: Readonly<Record<RouterId, readonly RoutingRow[]>>;
  readonly initial: PacketState;
  readonly steps: readonly PacketRoutingStep[];
}
export type SwitchingMethod = "circuit" | "packet";
export type SwitchingScenarioId = "continuous" | "bursty";
export interface SwitchingState {
  readonly reservedForA: boolean;
  readonly linkUse: string;
  readonly otherTrafficCanUseResource: boolean;
  readonly delivered: readonly string[];
  readonly complete: boolean;
  readonly released: boolean;
}
export interface SwitchingStep extends NetworkTopicStep {
  readonly before: SwitchingState;
  readonly after: SwitchingState;
}
export interface SwitchingTrace {
  readonly id: SwitchingScenarioId;
  readonly method: SwitchingMethod;
  readonly title: Localized;
  readonly demand: Localized;
  readonly units: readonly string[];
  readonly convention: Localized;
  readonly preferredMethod: SwitchingMethod;
  readonly reason: Localized;
  readonly initial: SwitchingState;
  readonly steps: readonly SwitchingStep[];
}

function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    Object.values(value).forEach(deepFreeze);
    Object.freeze(value);
  }
  return value;
}

// Canonical finite teaching scenarios from Teacher's Section 14 fixtures.
// A snapshot is selected directly; navigation never mutates or replays network state.
const canonical = deepFreeze({
  "protocols": [
    {
      "id": "scenario-web",
      "title": {
        "en": "Request a web resource",
        "vi": "Yêu cầu tài nguyên web"
      },
      "prompt": {
        "en": "A browser requests a revision page from a web server. Which listed application protocol fits that request/response service?",
        "vi": "Trình duyệt yêu cầu trang ôn tập từ web server. Giao thức ứng dụng nào phù hợp với dịch vụ yêu cầu/phản hồi này?"
      },
      "requiredFunction": {
        "en": "Request and transfer web resources between a web client and server.",
        "vi": "Yêu cầu và truyền tài nguyên web giữa web client và server."
      },
      "correctChoiceId": "HTTP",
      "choices": [
        {
          "id": "HTTP",
          "label": {
            "en": "HTTP",
            "vi": "HTTP"
          },
          "correct": true,
          "feedback": {
            "en": "The specified service is the web, even though the resource is also a file.",
            "vi": "Dịch vụ được nêu là web, dù tài nguyên cũng là một tệp."
          }
        },
        {
          "id": "FTP",
          "label": {
            "en": "FTP",
            "vi": "FTP"
          },
          "correct": false,
          "feedback": {
            "en": "Upload and download files using a file-transfer service. Here the required function is: Request and transfer web resources between a web client and server.",
            "vi": "Tải tệp lên và xuống bằng dịch vụ truyền tệp. Ở đây chức năng cần có là: Yêu cầu và truyền tài nguyên web giữa web client và server."
          }
        },
        {
          "id": "SMTP",
          "label": {
            "en": "SMTP",
            "vi": "SMTP"
          },
          "correct": false,
          "feedback": {
            "en": "Submit outgoing email and relay it between mail servers. Here the required function is: Request and transfer web resources between a web client and server.",
            "vi": "Nộp email gửi đi và chuyển tiếp email giữa các mail server. Ở đây chức năng cần có là: Yêu cầu và truyền tài nguyên web giữa web client và server."
          }
        },
        {
          "id": "POP3",
          "label": {
            "en": "POP3",
            "vi": "POP3"
          },
          "correct": false,
          "feedback": {
            "en": "Retrieve messages from a server mailbox into a mail client. Here the required function is: Request and transfer web resources between a web client and server.",
            "vi": "Lấy thông điệp từ hộp thư trên server về ứng dụng email. Ở đây chức năng cần có là: Yêu cầu và truyền tài nguyên web giữa web client và server."
          }
        },
        {
          "id": "IMAP",
          "label": {
            "en": "IMAP",
            "vi": "IMAP"
          },
          "correct": false,
          "feedback": {
            "en": "Access and manage a server mailbox, including synchronised mailbox state. Here the required function is: Request and transfer web resources between a web client and server.",
            "vi": "Truy cập và quản lý hộp thư trên server, gồm trạng thái hộp thư đồng bộ. Ở đây chức năng cần có là: Yêu cầu và truyền tài nguyên web giữa web client và server."
          }
        },
        {
          "id": "BitTorrent",
          "label": {
            "en": "BitTorrent",
            "vi": "BitTorrent"
          },
          "correct": false,
          "feedback": {
            "en": "Share file pieces directly among peers in a swarm. Here the required function is: Request and transfer web resources between a web client and server.",
            "vi": "Chia sẻ các phần tệp trực tiếp giữa các peer trong swarm. Ở đây chức năng cần có là: Yêu cầu và truyền tài nguyên web giữa web client và server."
          }
        }
      ],
      "action": {
        "en": "Identify the requested service and direction of the exchange.",
        "vi": "Xác định dịch vụ cần dùng và chiều trao đổi."
      },
      "why": {
        "en": "The specified service is the web, even though the resource is also a file.",
        "vi": "Dịch vụ được nêu là web, dù tài nguyên cũng là một tệp."
      },
      "outcome": {
        "en": "Best match: HTTP. Request and transfer web resources between a web client and server.",
        "vi": "Phù hợp nhất: HTTP. Yêu cầu và truyền tài nguyên web giữa web client và server."
      }
    },
    {
      "id": "scenario-file",
      "title": {
        "en": "Use a file-transfer service",
        "vi": "Dùng dịch vụ truyền tệp"
      },
      "prompt": {
        "en": "An editor connects to a dedicated file-transfer server to upload a folder of lesson files. The task is file transfer, not a browser request or email attachment. Choose the best listed protocol.",
        "vi": "Biên tập viên kết nối đến server chuyên truyền tệp để tải lên thư mục bài học. Tác vụ là truyền tệp, không phải yêu cầu trình duyệt hay tệp đính kèm email. Chọn giao thức phù hợp nhất trong danh sách."
      },
      "requiredFunction": {
        "en": "Upload and download files using a file-transfer service.",
        "vi": "Tải tệp lên và xuống bằng dịch vụ truyền tệp."
      },
      "correctChoiceId": "FTP",
      "choices": [
        {
          "id": "HTTP",
          "label": {
            "en": "HTTP",
            "vi": "HTTP"
          },
          "correct": false,
          "feedback": {
            "en": "Request and transfer web resources between a web client and server. Here the required function is: Upload and download files using a file-transfer service.",
            "vi": "Yêu cầu và truyền tài nguyên web giữa web client và server. Ở đây chức năng cần có là: Tải tệp lên và xuống bằng dịch vụ truyền tệp."
          }
        },
        {
          "id": "FTP",
          "label": {
            "en": "FTP",
            "vi": "FTP"
          },
          "correct": true,
          "feedback": {
            "en": "A file-transfer client/server service is required; file content alone does not select the protocol.",
            "vi": "Cần dịch vụ client/server truyền tệp; chỉ nội dung tệp chưa đủ để chọn giao thức."
          }
        },
        {
          "id": "SMTP",
          "label": {
            "en": "SMTP",
            "vi": "SMTP"
          },
          "correct": false,
          "feedback": {
            "en": "Submit outgoing email and relay it between mail servers. Here the required function is: Upload and download files using a file-transfer service.",
            "vi": "Nộp email gửi đi và chuyển tiếp email giữa các mail server. Ở đây chức năng cần có là: Tải tệp lên và xuống bằng dịch vụ truyền tệp."
          }
        },
        {
          "id": "POP3",
          "label": {
            "en": "POP3",
            "vi": "POP3"
          },
          "correct": false,
          "feedback": {
            "en": "Retrieve messages from a server mailbox into a mail client. Here the required function is: Upload and download files using a file-transfer service.",
            "vi": "Lấy thông điệp từ hộp thư trên server về ứng dụng email. Ở đây chức năng cần có là: Tải tệp lên và xuống bằng dịch vụ truyền tệp."
          }
        },
        {
          "id": "IMAP",
          "label": {
            "en": "IMAP",
            "vi": "IMAP"
          },
          "correct": false,
          "feedback": {
            "en": "Access and manage a server mailbox, including synchronised mailbox state. Here the required function is: Upload and download files using a file-transfer service.",
            "vi": "Truy cập và quản lý hộp thư trên server, gồm trạng thái hộp thư đồng bộ. Ở đây chức năng cần có là: Tải tệp lên và xuống bằng dịch vụ truyền tệp."
          }
        },
        {
          "id": "BitTorrent",
          "label": {
            "en": "BitTorrent",
            "vi": "BitTorrent"
          },
          "correct": false,
          "feedback": {
            "en": "Share file pieces directly among peers in a swarm. Here the required function is: Upload and download files using a file-transfer service.",
            "vi": "Chia sẻ các phần tệp trực tiếp giữa các peer trong swarm. Ở đây chức năng cần có là: Tải tệp lên và xuống bằng dịch vụ truyền tệp."
          }
        }
      ],
      "action": {
        "en": "Identify the requested service and direction of the exchange.",
        "vi": "Xác định dịch vụ cần dùng và chiều trao đổi."
      },
      "why": {
        "en": "A file-transfer client/server service is required; file content alone does not select the protocol.",
        "vi": "Cần dịch vụ client/server truyền tệp; chỉ nội dung tệp chưa đủ để chọn giao thức."
      },
      "outcome": {
        "en": "Best match: FTP. Upload and download files using a file-transfer service.",
        "vi": "Phù hợp nhất: FTP. Tải tệp lên và xuống bằng dịch vụ truyền tệp."
      }
    },
    {
      "id": "scenario-send",
      "title": {
        "en": "Send or relay email",
        "vi": "Gửi hoặc chuyển tiếp email"
      },
      "prompt": {
        "en": "A mail application submits a newly composed email to its outgoing mail server. Which protocol handles this sending action?",
        "vi": "Ứng dụng email nộp một email mới soạn cho mail server gửi đi. Giao thức nào xử lý hành động gửi này?"
      },
      "requiredFunction": {
        "en": "Submit outgoing email and relay it between mail servers.",
        "vi": "Nộp email gửi đi và chuyển tiếp email giữa các mail server."
      },
      "correctChoiceId": "SMTP",
      "choices": [
        {
          "id": "HTTP",
          "label": {
            "en": "HTTP",
            "vi": "HTTP"
          },
          "correct": false,
          "feedback": {
            "en": "Request and transfer web resources between a web client and server. Here the required function is: Submit outgoing email and relay it between mail servers.",
            "vi": "Yêu cầu và truyền tài nguyên web giữa web client và server. Ở đây chức năng cần có là: Nộp email gửi đi và chuyển tiếp email giữa các mail server."
          }
        },
        {
          "id": "FTP",
          "label": {
            "en": "FTP",
            "vi": "FTP"
          },
          "correct": false,
          "feedback": {
            "en": "Upload and download files using a file-transfer service. Here the required function is: Submit outgoing email and relay it between mail servers.",
            "vi": "Tải tệp lên và xuống bằng dịch vụ truyền tệp. Ở đây chức năng cần có là: Nộp email gửi đi và chuyển tiếp email giữa các mail server."
          }
        },
        {
          "id": "SMTP",
          "label": {
            "en": "SMTP",
            "vi": "SMTP"
          },
          "correct": true,
          "feedback": {
            "en": "Submitting outgoing mail is different from retrieving an existing inbox message.",
            "vi": "Nộp thư gửi đi khác với lấy thư đã có trong inbox."
          }
        },
        {
          "id": "POP3",
          "label": {
            "en": "POP3",
            "vi": "POP3"
          },
          "correct": false,
          "feedback": {
            "en": "Retrieve messages from a server mailbox into a mail client. Here the required function is: Submit outgoing email and relay it between mail servers.",
            "vi": "Lấy thông điệp từ hộp thư trên server về ứng dụng email. Ở đây chức năng cần có là: Nộp email gửi đi và chuyển tiếp email giữa các mail server."
          }
        },
        {
          "id": "IMAP",
          "label": {
            "en": "IMAP",
            "vi": "IMAP"
          },
          "correct": false,
          "feedback": {
            "en": "Access and manage a server mailbox, including synchronised mailbox state. Here the required function is: Submit outgoing email and relay it between mail servers.",
            "vi": "Truy cập và quản lý hộp thư trên server, gồm trạng thái hộp thư đồng bộ. Ở đây chức năng cần có là: Nộp email gửi đi và chuyển tiếp email giữa các mail server."
          }
        },
        {
          "id": "BitTorrent",
          "label": {
            "en": "BitTorrent",
            "vi": "BitTorrent"
          },
          "correct": false,
          "feedback": {
            "en": "Share file pieces directly among peers in a swarm. Here the required function is: Submit outgoing email and relay it between mail servers.",
            "vi": "Chia sẻ các phần tệp trực tiếp giữa các peer trong swarm. Ở đây chức năng cần có là: Nộp email gửi đi và chuyển tiếp email giữa các mail server."
          }
        }
      ],
      "action": {
        "en": "Identify the requested service and direction of the exchange.",
        "vi": "Xác định dịch vụ cần dùng và chiều trao đổi."
      },
      "why": {
        "en": "Submitting outgoing mail is different from retrieving an existing inbox message.",
        "vi": "Nộp thư gửi đi khác với lấy thư đã có trong inbox."
      },
      "outcome": {
        "en": "Best match: SMTP. Submit outgoing email and relay it between mail servers.",
        "vi": "Phù hợp nhất: SMTP. Nộp email gửi đi và chuyển tiếp email giữa các mail server."
      }
    },
    {
      "id": "scenario-download",
      "title": {
        "en": "Retrieve into a local mailbox",
        "vi": "Lấy thư về hộp thư cục bộ"
      },
      "prompt": {
        "en": "A simple mail client retrieves messages from a server into a local mailbox for later offline reading. It does not need server-folder or read-state synchronisation. Which is the best match among the listed purposes?",
        "vi": "Ứng dụng email đơn giản lấy thư từ server về hộp thư cục bộ để đọc ngoại tuyến sau đó. Không cần đồng bộ thư mục trên server hay trạng thái đã đọc. Giao thức nào phù hợp nhất với các mục đích đã nêu?"
      },
      "requiredFunction": {
        "en": "Retrieve messages from a server mailbox into a mail client.",
        "vi": "Lấy thông điệp từ hộp thư trên server về ứng dụng email."
      },
      "correctChoiceId": "POP3",
      "choices": [
        {
          "id": "HTTP",
          "label": {
            "en": "HTTP",
            "vi": "HTTP"
          },
          "correct": false,
          "feedback": {
            "en": "Request and transfer web resources between a web client and server. Here the required function is: Retrieve messages from a server mailbox into a mail client.",
            "vi": "Yêu cầu và truyền tài nguyên web giữa web client và server. Ở đây chức năng cần có là: Lấy thông điệp từ hộp thư trên server về ứng dụng email."
          }
        },
        {
          "id": "FTP",
          "label": {
            "en": "FTP",
            "vi": "FTP"
          },
          "correct": false,
          "feedback": {
            "en": "Upload and download files using a file-transfer service. Here the required function is: Retrieve messages from a server mailbox into a mail client.",
            "vi": "Tải tệp lên và xuống bằng dịch vụ truyền tệp. Ở đây chức năng cần có là: Lấy thông điệp từ hộp thư trên server về ứng dụng email."
          }
        },
        {
          "id": "SMTP",
          "label": {
            "en": "SMTP",
            "vi": "SMTP"
          },
          "correct": false,
          "feedback": {
            "en": "Submit outgoing email and relay it between mail servers. Here the required function is: Retrieve messages from a server mailbox into a mail client.",
            "vi": "Nộp email gửi đi và chuyển tiếp email giữa các mail server. Ở đây chức năng cần có là: Lấy thông điệp từ hộp thư trên server về ứng dụng email."
          }
        },
        {
          "id": "POP3",
          "label": {
            "en": "POP3",
            "vi": "POP3"
          },
          "correct": true,
          "feedback": {
            "en": "POP3 is the retrieval-focused match. IMAP can also retrieve mail, so this is a best-fit purpose comparison, not a claim of exclusive capability.",
            "vi": "POP3 phù hợp với tác vụ tập trung vào lấy thư. IMAP cũng lấy được thư, nên đây là so sánh mục đích phù hợp nhất, không khẳng định khả năng độc quyền."
          }
        },
        {
          "id": "IMAP",
          "label": {
            "en": "IMAP",
            "vi": "IMAP"
          },
          "correct": false,
          "feedback": {
            "en": "IMAP also retrieves messages, but its server-mailbox management is not the distinguishing requirement here. POP3 is the intended retrieval-focused match; do not claim IMAP cannot download mail.",
            "vi": "IMAP cũng lấy được thư, nhưng quản lý hộp thư server không phải yêu cầu phân biệt ở đây. POP3 là lựa chọn tập trung vào lấy thư; không kết luận IMAP không tải được thư."
          }
        },
        {
          "id": "BitTorrent",
          "label": {
            "en": "BitTorrent",
            "vi": "BitTorrent"
          },
          "correct": false,
          "feedback": {
            "en": "Share file pieces directly among peers in a swarm. Here the required function is: Retrieve messages from a server mailbox into a mail client.",
            "vi": "Chia sẻ các phần tệp trực tiếp giữa các peer trong swarm. Ở đây chức năng cần có là: Lấy thông điệp từ hộp thư trên server về ứng dụng email."
          }
        }
      ],
      "action": {
        "en": "Identify the requested service and direction of the exchange.",
        "vi": "Xác định dịch vụ cần dùng và chiều trao đổi."
      },
      "why": {
        "en": "POP3 is the retrieval-focused match. IMAP can also retrieve mail, so this is a best-fit purpose comparison, not a claim of exclusive capability.",
        "vi": "POP3 phù hợp với tác vụ tập trung vào lấy thư. IMAP cũng lấy được thư, nên đây là so sánh mục đích phù hợp nhất, không khẳng định khả năng độc quyền."
      },
      "outcome": {
        "en": "Best match: POP3. Retrieve messages from a server mailbox into a mail client.",
        "vi": "Phù hợp nhất: POP3. Lấy thông điệp từ hộp thư trên server về ứng dụng email."
      }
    },
    {
      "id": "scenario-sync",
      "title": {
        "en": "Keep mailbox state consistent",
        "vi": "Giữ trạng thái hộp thư nhất quán"
      },
      "prompt": {
        "en": "A learner uses a phone and laptop and wants server folders and read/unread changes to stay consistent across both mail clients. Choose the appropriate mailbox-access protocol.",
        "vi": "Học sinh dùng điện thoại và laptop, muốn thư mục trên server và thay đổi đã đọc/chưa đọc nhất quán giữa hai ứng dụng email. Chọn giao thức truy cập hộp thư phù hợp."
      },
      "requiredFunction": {
        "en": "Access and manage a server mailbox, including synchronised mailbox state.",
        "vi": "Truy cập và quản lý hộp thư trên server, gồm trạng thái hộp thư đồng bộ."
      },
      "correctChoiceId": "IMAP",
      "choices": [
        {
          "id": "HTTP",
          "label": {
            "en": "HTTP",
            "vi": "HTTP"
          },
          "correct": false,
          "feedback": {
            "en": "Request and transfer web resources between a web client and server. Here the required function is: Access and manage a server mailbox, including synchronised mailbox state.",
            "vi": "Yêu cầu và truyền tài nguyên web giữa web client và server. Ở đây chức năng cần có là: Truy cập và quản lý hộp thư trên server, gồm trạng thái hộp thư đồng bộ."
          }
        },
        {
          "id": "FTP",
          "label": {
            "en": "FTP",
            "vi": "FTP"
          },
          "correct": false,
          "feedback": {
            "en": "Upload and download files using a file-transfer service. Here the required function is: Access and manage a server mailbox, including synchronised mailbox state.",
            "vi": "Tải tệp lên và xuống bằng dịch vụ truyền tệp. Ở đây chức năng cần có là: Truy cập và quản lý hộp thư trên server, gồm trạng thái hộp thư đồng bộ."
          }
        },
        {
          "id": "SMTP",
          "label": {
            "en": "SMTP",
            "vi": "SMTP"
          },
          "correct": false,
          "feedback": {
            "en": "Submit outgoing email and relay it between mail servers. Here the required function is: Access and manage a server mailbox, including synchronised mailbox state.",
            "vi": "Nộp email gửi đi và chuyển tiếp email giữa các mail server. Ở đây chức năng cần có là: Truy cập và quản lý hộp thư trên server, gồm trạng thái hộp thư đồng bộ."
          }
        },
        {
          "id": "POP3",
          "label": {
            "en": "POP3",
            "vi": "POP3"
          },
          "correct": false,
          "feedback": {
            "en": "Retrieve messages from a server mailbox into a mail client. Here the required function is: Access and manage a server mailbox, including synchronised mailbox state.",
            "vi": "Lấy thông điệp từ hộp thư trên server về ứng dụng email. Ở đây chức năng cần có là: Truy cập và quản lý hộp thư trên server, gồm trạng thái hộp thư đồng bộ."
          }
        },
        {
          "id": "IMAP",
          "label": {
            "en": "IMAP",
            "vi": "IMAP"
          },
          "correct": true,
          "feedback": {
            "en": "The distinguishing requirement is shared server-mailbox state, not simply receiving bytes.",
            "vi": "Yêu cầu phân biệt là trạng thái hộp thư server dùng chung, không chỉ nhận byte dữ liệu."
          }
        },
        {
          "id": "BitTorrent",
          "label": {
            "en": "BitTorrent",
            "vi": "BitTorrent"
          },
          "correct": false,
          "feedback": {
            "en": "Share file pieces directly among peers in a swarm. Here the required function is: Access and manage a server mailbox, including synchronised mailbox state.",
            "vi": "Chia sẻ các phần tệp trực tiếp giữa các peer trong swarm. Ở đây chức năng cần có là: Truy cập và quản lý hộp thư trên server, gồm trạng thái hộp thư đồng bộ."
          }
        }
      ],
      "action": {
        "en": "Identify the requested service and direction of the exchange.",
        "vi": "Xác định dịch vụ cần dùng và chiều trao đổi."
      },
      "why": {
        "en": "The distinguishing requirement is shared server-mailbox state, not simply receiving bytes.",
        "vi": "Yêu cầu phân biệt là trạng thái hộp thư server dùng chung, không chỉ nhận byte dữ liệu."
      },
      "outcome": {
        "en": "Best match: IMAP. Access and manage a server mailbox, including synchronised mailbox state.",
        "vi": "Phù hợp nhất: IMAP. Truy cập và quản lý hộp thư trên server, gồm trạng thái hộp thư đồng bộ."
      }
    },
    {
      "id": "scenario-p2p",
      "title": {
        "en": "Share pieces among peers",
        "vi": "Chia sẻ các phần giữa peer"
      },
      "prompt": {
        "en": "Several computers obtain different pieces of an openly shared dataset from each other and upload pieces they already hold. Which listed protocol matches this swarm-based file sharing?",
        "vi": "Nhiều máy tính lấy các phần khác nhau của bộ dữ liệu được chia sẻ công khai từ nhau và tải lên các phần đang có. Giao thức nào phù hợp với cách chia sẻ tệp theo swarm này?"
      },
      "requiredFunction": {
        "en": "Share file pieces directly among peers in a swarm.",
        "vi": "Chia sẻ các phần tệp trực tiếp giữa các peer trong swarm."
      },
      "correctChoiceId": "BitTorrent",
      "choices": [
        {
          "id": "HTTP",
          "label": {
            "en": "HTTP",
            "vi": "HTTP"
          },
          "correct": false,
          "feedback": {
            "en": "Request and transfer web resources between a web client and server. Here the required function is: Share file pieces directly among peers in a swarm.",
            "vi": "Yêu cầu và truyền tài nguyên web giữa web client và server. Ở đây chức năng cần có là: Chia sẻ các phần tệp trực tiếp giữa các peer trong swarm."
          }
        },
        {
          "id": "FTP",
          "label": {
            "en": "FTP",
            "vi": "FTP"
          },
          "correct": false,
          "feedback": {
            "en": "Upload and download files using a file-transfer service. Here the required function is: Share file pieces directly among peers in a swarm.",
            "vi": "Tải tệp lên và xuống bằng dịch vụ truyền tệp. Ở đây chức năng cần có là: Chia sẻ các phần tệp trực tiếp giữa các peer trong swarm."
          }
        },
        {
          "id": "SMTP",
          "label": {
            "en": "SMTP",
            "vi": "SMTP"
          },
          "correct": false,
          "feedback": {
            "en": "Submit outgoing email and relay it between mail servers. Here the required function is: Share file pieces directly among peers in a swarm.",
            "vi": "Nộp email gửi đi và chuyển tiếp email giữa các mail server. Ở đây chức năng cần có là: Chia sẻ các phần tệp trực tiếp giữa các peer trong swarm."
          }
        },
        {
          "id": "POP3",
          "label": {
            "en": "POP3",
            "vi": "POP3"
          },
          "correct": false,
          "feedback": {
            "en": "Retrieve messages from a server mailbox into a mail client. Here the required function is: Share file pieces directly among peers in a swarm.",
            "vi": "Lấy thông điệp từ hộp thư trên server về ứng dụng email. Ở đây chức năng cần có là: Chia sẻ các phần tệp trực tiếp giữa các peer trong swarm."
          }
        },
        {
          "id": "IMAP",
          "label": {
            "en": "IMAP",
            "vi": "IMAP"
          },
          "correct": false,
          "feedback": {
            "en": "Access and manage a server mailbox, including synchronised mailbox state. Here the required function is: Share file pieces directly among peers in a swarm.",
            "vi": "Truy cập và quản lý hộp thư trên server, gồm trạng thái hộp thư đồng bộ. Ở đây chức năng cần có là: Chia sẻ các phần tệp trực tiếp giữa các peer trong swarm."
          }
        },
        {
          "id": "BitTorrent",
          "label": {
            "en": "BitTorrent",
            "vi": "BitTorrent"
          },
          "correct": true,
          "feedback": {
            "en": "Multiple peers supply and receive pieces; one central file server is not the sole payload source.",
            "vi": "Nhiều peer cung cấp và nhận các phần; một file server trung tâm không phải nguồn payload duy nhất."
          }
        }
      ],
      "action": {
        "en": "Identify the requested service and direction of the exchange.",
        "vi": "Xác định dịch vụ cần dùng và chiều trao đổi."
      },
      "why": {
        "en": "Multiple peers supply and receive pieces; one central file server is not the sole payload source.",
        "vi": "Nhiều peer cung cấp và nhận các phần; một file server trung tâm không phải nguồn payload duy nhất."
      },
      "outcome": {
        "en": "Best match: BitTorrent. Share file pieces directly among peers in a swarm.",
        "vi": "Phù hợp nhất: BitTorrent. Chia sẻ các phần tệp trực tiếp giữa các peer trong swarm."
      }
    }
  ],
  "bittorrent": [
    {
      "id": "complete",
      "pieces": [
        "A",
        "B",
        "C",
        "D"
      ],
      "target": "L",
      "initial": {
        "inventories": {
          "S": [
            "A",
            "B",
            "C",
            "D"
          ],
          "P": [
            "A",
            "C"
          ],
          "Q": [
            "B"
          ],
          "L": []
        },
        "online": {
          "S": true,
          "P": true,
          "Q": true,
          "L": true
        },
        "metadataObtained": false,
        "peersDiscovered": false,
        "assembled": false,
        "blockedPiece": null
      },
      "steps": [
        {
          "id": "metadata",
          "title": {
            "en": "Read the descriptor",
            "vi": "Đọc tệp mô tả"
          },
          "action": {
            "en": "L obtains metadata describing pieces A–D.",
            "vi": "L nhận metadata mô tả các phần A–D."
          },
          "why": {
            "en": "The descriptor identifies what is shared; it is not the four payload pieces.",
            "vi": "Tệp mô tả xác định thứ được chia sẻ; nó không phải bốn phần payload."
          },
          "outcome": {
            "en": "L knows the required pieces but still owns none.",
            "vi": "L biết các phần cần có nhưng chưa giữ phần nào."
          },
          "before": {
            "inventories": {
              "S": [
                "A",
                "B",
                "C",
                "D"
              ],
              "P": [
                "A",
                "C"
              ],
              "Q": [
                "B"
              ],
              "L": []
            },
            "online": {
              "S": true,
              "P": true,
              "Q": true,
              "L": true
            },
            "metadataObtained": false,
            "peersDiscovered": false,
            "assembled": false,
            "blockedPiece": null
          },
          "after": {
            "inventories": {
              "S": [
                "A",
                "B",
                "C",
                "D"
              ],
              "P": [
                "A",
                "C"
              ],
              "Q": [
                "B"
              ],
              "L": []
            },
            "online": {
              "S": true,
              "P": true,
              "Q": true,
              "L": true
            },
            "metadataObtained": true,
            "peersDiscovered": false,
            "assembled": false,
            "blockedPiece": null
          },
          "transfer": null
        },
        {
          "id": "discover-peers",
          "title": {
            "en": "Find peers",
            "vi": "Tìm peer"
          },
          "action": {
            "en": "L contacts the tracker and discovers S, P and Q.",
            "vi": "L liên hệ tracker và tìm thấy S, P, Q."
          },
          "why": {
            "en": "The tracker provides peer-contact information; file pieces will come from peers.",
            "vi": "Tracker cung cấp thông tin liên hệ peer; các phần tệp sẽ đến từ peer."
          },
          "outcome": {
            "en": "Piece inventories are unchanged; peer connections can be made.",
            "vi": "Tập phần đang có không đổi; có thể thiết lập kết nối giữa peer."
          },
          "before": {
            "inventories": {
              "S": [
                "A",
                "B",
                "C",
                "D"
              ],
              "P": [
                "A",
                "C"
              ],
              "Q": [
                "B"
              ],
              "L": []
            },
            "online": {
              "S": true,
              "P": true,
              "Q": true,
              "L": true
            },
            "metadataObtained": true,
            "peersDiscovered": false,
            "assembled": false,
            "blockedPiece": null
          },
          "after": {
            "inventories": {
              "S": [
                "A",
                "B",
                "C",
                "D"
              ],
              "P": [
                "A",
                "C"
              ],
              "Q": [
                "B"
              ],
              "L": []
            },
            "online": {
              "S": true,
              "P": true,
              "Q": true,
              "L": true
            },
            "metadataObtained": true,
            "peersDiscovered": true,
            "assembled": false,
            "blockedPiece": null
          },
          "transfer": null
        },
        {
          "id": "receive-b",
          "title": {
            "en": "Receive piece B",
            "vi": "Nhận phần B"
          },
          "action": {
            "en": "S sends a valid copy of piece B to L.",
            "vi": "S gửi bản sao hợp lệ của phần B cho L."
          },
          "why": {
            "en": "S is online and already owns B; L still needs it.",
            "vi": "S đang online và đã có B; L còn cần phần này."
          },
          "outcome": {
            "en": "L now holds B; S keeps its own copy.",
            "vi": "L hiện có B; S vẫn giữ bản của mình."
          },
          "before": {
            "inventories": {
              "S": [
                "A",
                "B",
                "C",
                "D"
              ],
              "P": [
                "A",
                "C"
              ],
              "Q": [
                "B"
              ],
              "L": []
            },
            "online": {
              "S": true,
              "P": true,
              "Q": true,
              "L": true
            },
            "metadataObtained": true,
            "peersDiscovered": true,
            "assembled": false,
            "blockedPiece": null
          },
          "after": {
            "inventories": {
              "S": [
                "A",
                "B",
                "C",
                "D"
              ],
              "P": [
                "A",
                "C"
              ],
              "Q": [
                "B"
              ],
              "L": [
                "B"
              ]
            },
            "online": {
              "S": true,
              "P": true,
              "Q": true,
              "L": true
            },
            "metadataObtained": true,
            "peersDiscovered": true,
            "assembled": false,
            "blockedPiece": null
          },
          "transfer": {
            "source": "S",
            "target": "L",
            "piece": "B"
          }
        },
        {
          "id": "receive-a",
          "title": {
            "en": "Receive piece A",
            "vi": "Nhận phần A"
          },
          "action": {
            "en": "P sends a valid copy of piece A to L.",
            "vi": "P gửi bản sao hợp lệ của phần A cho L."
          },
          "why": {
            "en": "P is online and already owns A; L still needs it.",
            "vi": "P đang online và đã có A; L còn cần phần này."
          },
          "outcome": {
            "en": "L now holds A, B; P keeps its own copy.",
            "vi": "L hiện có A, B; P vẫn giữ bản của mình."
          },
          "before": {
            "inventories": {
              "S": [
                "A",
                "B",
                "C",
                "D"
              ],
              "P": [
                "A",
                "C"
              ],
              "Q": [
                "B"
              ],
              "L": [
                "B"
              ]
            },
            "online": {
              "S": true,
              "P": true,
              "Q": true,
              "L": true
            },
            "metadataObtained": true,
            "peersDiscovered": true,
            "assembled": false,
            "blockedPiece": null
          },
          "after": {
            "inventories": {
              "S": [
                "A",
                "B",
                "C",
                "D"
              ],
              "P": [
                "A",
                "C"
              ],
              "Q": [
                "B"
              ],
              "L": [
                "A",
                "B"
              ]
            },
            "online": {
              "S": true,
              "P": true,
              "Q": true,
              "L": true
            },
            "metadataObtained": true,
            "peersDiscovered": true,
            "assembled": false,
            "blockedPiece": null
          },
          "transfer": {
            "source": "P",
            "target": "L",
            "piece": "A"
          }
        },
        {
          "id": "share-a",
          "title": {
            "en": "Share A before completion",
            "vi": "Chia sẻ A trước khi đủ tệp"
          },
          "action": {
            "en": "L sends a valid copy of piece A to Q.",
            "vi": "L gửi bản sao hợp lệ của phần A cho Q."
          },
          "why": {
            "en": "A peer may upload a verified piece before it owns the whole file.",
            "vi": "Peer có thể tải lên phần đã kiểm tra trước khi có toàn bộ tệp."
          },
          "outcome": {
            "en": "Q now holds A, B; L keeps its own copy.",
            "vi": "Q hiện có A, B; L vẫn giữ bản của mình."
          },
          "before": {
            "inventories": {
              "S": [
                "A",
                "B",
                "C",
                "D"
              ],
              "P": [
                "A",
                "C"
              ],
              "Q": [
                "B"
              ],
              "L": [
                "A",
                "B"
              ]
            },
            "online": {
              "S": true,
              "P": true,
              "Q": true,
              "L": true
            },
            "metadataObtained": true,
            "peersDiscovered": true,
            "assembled": false,
            "blockedPiece": null
          },
          "after": {
            "inventories": {
              "S": [
                "A",
                "B",
                "C",
                "D"
              ],
              "P": [
                "A",
                "C"
              ],
              "Q": [
                "A",
                "B"
              ],
              "L": [
                "A",
                "B"
              ]
            },
            "online": {
              "S": true,
              "P": true,
              "Q": true,
              "L": true
            },
            "metadataObtained": true,
            "peersDiscovered": true,
            "assembled": false,
            "blockedPiece": null
          },
          "transfer": {
            "source": "L",
            "target": "Q",
            "piece": "A"
          }
        },
        {
          "id": "receive-c",
          "title": {
            "en": "Receive piece C",
            "vi": "Nhận phần C"
          },
          "action": {
            "en": "P sends a valid copy of piece C to L.",
            "vi": "P gửi bản sao hợp lệ của phần C cho L."
          },
          "why": {
            "en": "P is online and already owns C; L still needs it.",
            "vi": "P đang online và đã có C; L còn cần phần này."
          },
          "outcome": {
            "en": "L now holds A, B, C; P keeps its own copy.",
            "vi": "L hiện có A, B, C; P vẫn giữ bản của mình."
          },
          "before": {
            "inventories": {
              "S": [
                "A",
                "B",
                "C",
                "D"
              ],
              "P": [
                "A",
                "C"
              ],
              "Q": [
                "A",
                "B"
              ],
              "L": [
                "A",
                "B"
              ]
            },
            "online": {
              "S": true,
              "P": true,
              "Q": true,
              "L": true
            },
            "metadataObtained": true,
            "peersDiscovered": true,
            "assembled": false,
            "blockedPiece": null
          },
          "after": {
            "inventories": {
              "S": [
                "A",
                "B",
                "C",
                "D"
              ],
              "P": [
                "A",
                "C"
              ],
              "Q": [
                "A",
                "B"
              ],
              "L": [
                "A",
                "B",
                "C"
              ]
            },
            "online": {
              "S": true,
              "P": true,
              "Q": true,
              "L": true
            },
            "metadataObtained": true,
            "peersDiscovered": true,
            "assembled": false,
            "blockedPiece": null
          },
          "transfer": {
            "source": "P",
            "target": "L",
            "piece": "C"
          }
        },
        {
          "id": "receive-d",
          "title": {
            "en": "Receive piece D",
            "vi": "Nhận phần D"
          },
          "action": {
            "en": "S sends a valid copy of piece D to L.",
            "vi": "S gửi bản sao hợp lệ của phần D cho L."
          },
          "why": {
            "en": "S is online and already owns D; L still needs it.",
            "vi": "S đang online và đã có D; L còn cần phần này."
          },
          "outcome": {
            "en": "L now holds A, B, C, D; S keeps its own copy.",
            "vi": "L hiện có A, B, C, D; S vẫn giữ bản của mình."
          },
          "before": {
            "inventories": {
              "S": [
                "A",
                "B",
                "C",
                "D"
              ],
              "P": [
                "A",
                "C"
              ],
              "Q": [
                "A",
                "B"
              ],
              "L": [
                "A",
                "B",
                "C"
              ]
            },
            "online": {
              "S": true,
              "P": true,
              "Q": true,
              "L": true
            },
            "metadataObtained": true,
            "peersDiscovered": true,
            "assembled": false,
            "blockedPiece": null
          },
          "after": {
            "inventories": {
              "S": [
                "A",
                "B",
                "C",
                "D"
              ],
              "P": [
                "A",
                "C"
              ],
              "Q": [
                "A",
                "B"
              ],
              "L": [
                "A",
                "B",
                "C",
                "D"
              ]
            },
            "online": {
              "S": true,
              "P": true,
              "Q": true,
              "L": true
            },
            "metadataObtained": true,
            "peersDiscovered": true,
            "assembled": false,
            "blockedPiece": null
          },
          "transfer": {
            "source": "S",
            "target": "L",
            "piece": "D"
          }
        },
        {
          "id": "assemble",
          "title": {
            "en": "Reconstruct the file",
            "vi": "Khôi phục tệp"
          },
          "action": {
            "en": "L places its verified A, B, C and D pieces in file order.",
            "vi": "L xếp các phần A, B, C, D đã kiểm tra theo thứ tự tệp."
          },
          "why": {
            "en": "Arrival order B, A, C, D is not the required file order.",
            "vi": "Thứ tự nhận B, A, C, D không phải thứ tự tệp."
          },
          "outcome": {
            "en": "L has the complete file and, while sharing, is now a seed.",
            "vi": "L có tệp hoàn chỉnh và khi tiếp tục chia sẻ sẽ là seed."
          },
          "before": {
            "inventories": {
              "S": [
                "A",
                "B",
                "C",
                "D"
              ],
              "P": [
                "A",
                "C"
              ],
              "Q": [
                "A",
                "B"
              ],
              "L": [
                "A",
                "B",
                "C",
                "D"
              ]
            },
            "online": {
              "S": true,
              "P": true,
              "Q": true,
              "L": true
            },
            "metadataObtained": true,
            "peersDiscovered": true,
            "assembled": false,
            "blockedPiece": null
          },
          "after": {
            "inventories": {
              "S": [
                "A",
                "B",
                "C",
                "D"
              ],
              "P": [
                "A",
                "C"
              ],
              "Q": [
                "A",
                "B"
              ],
              "L": [
                "A",
                "B",
                "C",
                "D"
              ]
            },
            "online": {
              "S": true,
              "P": true,
              "Q": true,
              "L": true
            },
            "metadataObtained": true,
            "peersDiscovered": true,
            "assembled": true,
            "blockedPiece": null
          },
          "transfer": null
        }
      ]
    },
    {
      "id": "unavailable-piece",
      "pieces": [
        "A",
        "B",
        "C",
        "D"
      ],
      "target": "L",
      "initial": {
        "inventories": {
          "S": [
            "A",
            "B",
            "C",
            "D"
          ],
          "P": [
            "A",
            "C"
          ],
          "Q": [
            "B"
          ],
          "L": []
        },
        "online": {
          "S": true,
          "P": true,
          "Q": true,
          "L": true
        },
        "metadataObtained": false,
        "peersDiscovered": false,
        "assembled": false,
        "blockedPiece": null
      },
      "steps": [
        {
          "id": "metadata",
          "title": {
            "en": "Read the descriptor",
            "vi": "Đọc tệp mô tả"
          },
          "action": {
            "en": "L obtains metadata describing pieces A–D.",
            "vi": "L nhận metadata mô tả các phần A–D."
          },
          "why": {
            "en": "The descriptor identifies what is shared; it is not the four payload pieces.",
            "vi": "Tệp mô tả xác định thứ được chia sẻ; nó không phải bốn phần payload."
          },
          "outcome": {
            "en": "L knows the required pieces but still owns none.",
            "vi": "L biết các phần cần có nhưng chưa giữ phần nào."
          },
          "before": {
            "inventories": {
              "S": [
                "A",
                "B",
                "C",
                "D"
              ],
              "P": [
                "A",
                "C"
              ],
              "Q": [
                "B"
              ],
              "L": []
            },
            "online": {
              "S": true,
              "P": true,
              "Q": true,
              "L": true
            },
            "metadataObtained": false,
            "peersDiscovered": false,
            "assembled": false,
            "blockedPiece": null
          },
          "after": {
            "inventories": {
              "S": [
                "A",
                "B",
                "C",
                "D"
              ],
              "P": [
                "A",
                "C"
              ],
              "Q": [
                "B"
              ],
              "L": []
            },
            "online": {
              "S": true,
              "P": true,
              "Q": true,
              "L": true
            },
            "metadataObtained": true,
            "peersDiscovered": false,
            "assembled": false,
            "blockedPiece": null
          },
          "transfer": null
        },
        {
          "id": "discover-peers",
          "title": {
            "en": "Find peers",
            "vi": "Tìm peer"
          },
          "action": {
            "en": "L contacts the tracker and discovers S, P and Q.",
            "vi": "L liên hệ tracker và tìm thấy S, P, Q."
          },
          "why": {
            "en": "The tracker provides peer-contact information; file pieces will come from peers.",
            "vi": "Tracker cung cấp thông tin liên hệ peer; các phần tệp sẽ đến từ peer."
          },
          "outcome": {
            "en": "Piece inventories are unchanged; peer connections can be made.",
            "vi": "Tập phần đang có không đổi; có thể thiết lập kết nối giữa peer."
          },
          "before": {
            "inventories": {
              "S": [
                "A",
                "B",
                "C",
                "D"
              ],
              "P": [
                "A",
                "C"
              ],
              "Q": [
                "B"
              ],
              "L": []
            },
            "online": {
              "S": true,
              "P": true,
              "Q": true,
              "L": true
            },
            "metadataObtained": true,
            "peersDiscovered": false,
            "assembled": false,
            "blockedPiece": null
          },
          "after": {
            "inventories": {
              "S": [
                "A",
                "B",
                "C",
                "D"
              ],
              "P": [
                "A",
                "C"
              ],
              "Q": [
                "B"
              ],
              "L": []
            },
            "online": {
              "S": true,
              "P": true,
              "Q": true,
              "L": true
            },
            "metadataObtained": true,
            "peersDiscovered": true,
            "assembled": false,
            "blockedPiece": null
          },
          "transfer": null
        },
        {
          "id": "receive-b",
          "title": {
            "en": "Receive piece B",
            "vi": "Nhận phần B"
          },
          "action": {
            "en": "S sends a valid copy of piece B to L.",
            "vi": "S gửi bản sao hợp lệ của phần B cho L."
          },
          "why": {
            "en": "S is online and already owns B; L still needs it.",
            "vi": "S đang online và đã có B; L còn cần phần này."
          },
          "outcome": {
            "en": "L now holds B; S keeps its own copy.",
            "vi": "L hiện có B; S vẫn giữ bản của mình."
          },
          "before": {
            "inventories": {
              "S": [
                "A",
                "B",
                "C",
                "D"
              ],
              "P": [
                "A",
                "C"
              ],
              "Q": [
                "B"
              ],
              "L": []
            },
            "online": {
              "S": true,
              "P": true,
              "Q": true,
              "L": true
            },
            "metadataObtained": true,
            "peersDiscovered": true,
            "assembled": false,
            "blockedPiece": null
          },
          "after": {
            "inventories": {
              "S": [
                "A",
                "B",
                "C",
                "D"
              ],
              "P": [
                "A",
                "C"
              ],
              "Q": [
                "B"
              ],
              "L": [
                "B"
              ]
            },
            "online": {
              "S": true,
              "P": true,
              "Q": true,
              "L": true
            },
            "metadataObtained": true,
            "peersDiscovered": true,
            "assembled": false,
            "blockedPiece": null
          },
          "transfer": {
            "source": "S",
            "target": "L",
            "piece": "B"
          }
        },
        {
          "id": "receive-a",
          "title": {
            "en": "Receive piece A",
            "vi": "Nhận phần A"
          },
          "action": {
            "en": "P sends a valid copy of piece A to L.",
            "vi": "P gửi bản sao hợp lệ của phần A cho L."
          },
          "why": {
            "en": "P is online and already owns A; L still needs it.",
            "vi": "P đang online và đã có A; L còn cần phần này."
          },
          "outcome": {
            "en": "L now holds A, B; P keeps its own copy.",
            "vi": "L hiện có A, B; P vẫn giữ bản của mình."
          },
          "before": {
            "inventories": {
              "S": [
                "A",
                "B",
                "C",
                "D"
              ],
              "P": [
                "A",
                "C"
              ],
              "Q": [
                "B"
              ],
              "L": [
                "B"
              ]
            },
            "online": {
              "S": true,
              "P": true,
              "Q": true,
              "L": true
            },
            "metadataObtained": true,
            "peersDiscovered": true,
            "assembled": false,
            "blockedPiece": null
          },
          "after": {
            "inventories": {
              "S": [
                "A",
                "B",
                "C",
                "D"
              ],
              "P": [
                "A",
                "C"
              ],
              "Q": [
                "B"
              ],
              "L": [
                "A",
                "B"
              ]
            },
            "online": {
              "S": true,
              "P": true,
              "Q": true,
              "L": true
            },
            "metadataObtained": true,
            "peersDiscovered": true,
            "assembled": false,
            "blockedPiece": null
          },
          "transfer": {
            "source": "P",
            "target": "L",
            "piece": "A"
          }
        },
        {
          "id": "share-a",
          "title": {
            "en": "Share A before completion",
            "vi": "Chia sẻ A trước khi đủ tệp"
          },
          "action": {
            "en": "L sends a valid copy of piece A to Q.",
            "vi": "L gửi bản sao hợp lệ của phần A cho Q."
          },
          "why": {
            "en": "A peer may upload a verified piece before it owns the whole file.",
            "vi": "Peer có thể tải lên phần đã kiểm tra trước khi có toàn bộ tệp."
          },
          "outcome": {
            "en": "Q now holds A, B; L keeps its own copy.",
            "vi": "Q hiện có A, B; L vẫn giữ bản của mình."
          },
          "before": {
            "inventories": {
              "S": [
                "A",
                "B",
                "C",
                "D"
              ],
              "P": [
                "A",
                "C"
              ],
              "Q": [
                "B"
              ],
              "L": [
                "A",
                "B"
              ]
            },
            "online": {
              "S": true,
              "P": true,
              "Q": true,
              "L": true
            },
            "metadataObtained": true,
            "peersDiscovered": true,
            "assembled": false,
            "blockedPiece": null
          },
          "after": {
            "inventories": {
              "S": [
                "A",
                "B",
                "C",
                "D"
              ],
              "P": [
                "A",
                "C"
              ],
              "Q": [
                "A",
                "B"
              ],
              "L": [
                "A",
                "B"
              ]
            },
            "online": {
              "S": true,
              "P": true,
              "Q": true,
              "L": true
            },
            "metadataObtained": true,
            "peersDiscovered": true,
            "assembled": false,
            "blockedPiece": null
          },
          "transfer": {
            "source": "L",
            "target": "Q",
            "piece": "A"
          }
        },
        {
          "id": "receive-c",
          "title": {
            "en": "Receive piece C",
            "vi": "Nhận phần C"
          },
          "action": {
            "en": "P sends a valid copy of piece C to L.",
            "vi": "P gửi bản sao hợp lệ của phần C cho L."
          },
          "why": {
            "en": "P is online and already owns C; L still needs it.",
            "vi": "P đang online và đã có C; L còn cần phần này."
          },
          "outcome": {
            "en": "L now holds A, B, C; P keeps its own copy.",
            "vi": "L hiện có A, B, C; P vẫn giữ bản của mình."
          },
          "before": {
            "inventories": {
              "S": [
                "A",
                "B",
                "C",
                "D"
              ],
              "P": [
                "A",
                "C"
              ],
              "Q": [
                "A",
                "B"
              ],
              "L": [
                "A",
                "B"
              ]
            },
            "online": {
              "S": true,
              "P": true,
              "Q": true,
              "L": true
            },
            "metadataObtained": true,
            "peersDiscovered": true,
            "assembled": false,
            "blockedPiece": null
          },
          "after": {
            "inventories": {
              "S": [
                "A",
                "B",
                "C",
                "D"
              ],
              "P": [
                "A",
                "C"
              ],
              "Q": [
                "A",
                "B"
              ],
              "L": [
                "A",
                "B",
                "C"
              ]
            },
            "online": {
              "S": true,
              "P": true,
              "Q": true,
              "L": true
            },
            "metadataObtained": true,
            "peersDiscovered": true,
            "assembled": false,
            "blockedPiece": null
          },
          "transfer": {
            "source": "P",
            "target": "L",
            "piece": "C"
          }
        },
        {
          "id": "seed-departs",
          "title": {
            "en": "The only D source leaves",
            "vi": "Nguồn D duy nhất rời mạng"
          },
          "action": {
            "en": "S goes offline before L receives D.",
            "vi": "S offline trước khi L nhận D."
          },
          "why": {
            "en": "Offline inventory cannot supply a new transfer.",
            "vi": "Các phần ở peer offline không thể phục vụ lần truyền mới."
          },
          "outcome": {
            "en": "Online peers collectively hold only A, B and C.",
            "vi": "Các peer online cộng lại chỉ có A, B, C."
          },
          "before": {
            "inventories": {
              "S": [
                "A",
                "B",
                "C",
                "D"
              ],
              "P": [
                "A",
                "C"
              ],
              "Q": [
                "A",
                "B"
              ],
              "L": [
                "A",
                "B",
                "C"
              ]
            },
            "online": {
              "S": true,
              "P": true,
              "Q": true,
              "L": true
            },
            "metadataObtained": true,
            "peersDiscovered": true,
            "assembled": false,
            "blockedPiece": null
          },
          "after": {
            "inventories": {
              "S": [
                "A",
                "B",
                "C",
                "D"
              ],
              "P": [
                "A",
                "C"
              ],
              "Q": [
                "A",
                "B"
              ],
              "L": [
                "A",
                "B",
                "C"
              ]
            },
            "online": {
              "S": false,
              "P": true,
              "Q": true,
              "L": true
            },
            "metadataObtained": true,
            "peersDiscovered": true,
            "assembled": false,
            "blockedPiece": null
          },
          "transfer": null
        },
        {
          "id": "no-source",
          "title": {
            "en": "Stop with a missing piece",
            "vi": "Dừng vì thiếu một phần"
          },
          "action": {
            "en": "Check every online peer for D.",
            "vi": "Kiểm tra D ở mọi peer online."
          },
          "why": {
            "en": "No online source owns D; a tracker cannot manufacture the missing payload.",
            "vi": "Không nguồn online nào có D; tracker không thể tạo ra payload còn thiếu."
          },
          "outcome": {
            "en": "L remains incomplete with A, B, C. Completion needs a source for D to return.",
            "vi": "L vẫn chưa hoàn chỉnh với A, B, C. Muốn hoàn tất phải có nguồn D trở lại."
          },
          "before": {
            "inventories": {
              "S": [
                "A",
                "B",
                "C",
                "D"
              ],
              "P": [
                "A",
                "C"
              ],
              "Q": [
                "A",
                "B"
              ],
              "L": [
                "A",
                "B",
                "C"
              ]
            },
            "online": {
              "S": false,
              "P": true,
              "Q": true,
              "L": true
            },
            "metadataObtained": true,
            "peersDiscovered": true,
            "assembled": false,
            "blockedPiece": null
          },
          "after": {
            "inventories": {
              "S": [
                "A",
                "B",
                "C",
                "D"
              ],
              "P": [
                "A",
                "C"
              ],
              "Q": [
                "A",
                "B"
              ],
              "L": [
                "A",
                "B",
                "C"
              ]
            },
            "online": {
              "S": false,
              "P": true,
              "Q": true,
              "L": true
            },
            "metadataObtained": true,
            "peersDiscovered": true,
            "assembled": false,
            "blockedPiece": "D"
          },
          "transfer": null
        }
      ]
    }
  ],
  "routing": [
    {
      "id": "reroute",
      "packets": [
        {
          "id": "p1",
          "order": 1,
          "payload": "NET",
          "destination": "Destination"
        },
        {
          "id": "p2",
          "order": 2,
          "payload": "WO",
          "destination": "Destination"
        },
        {
          "id": "p3",
          "order": 3,
          "payload": "RK",
          "destination": "Destination"
        }
      ],
      "topology": [
        [
          "Source",
          "R1"
        ],
        [
          "R1",
          "R2"
        ],
        [
          "R1",
          "R3"
        ],
        [
          "R2",
          "Destination"
        ],
        [
          "R3",
          "Destination"
        ]
      ],
      "tables": {
        "R1": [
          {
            "id": "r1-primary",
            "destination": "Destination",
            "nextHop": "R2",
            "priority": 1
          },
          {
            "id": "r1-alternative",
            "destination": "Destination",
            "nextHop": "R3",
            "priority": 2
          }
        ],
        "R2": [
          {
            "id": "r2-direct",
            "destination": "Destination",
            "nextHop": "Destination",
            "priority": 1
          }
        ],
        "R3": [
          {
            "id": "r3-direct",
            "destination": "Destination",
            "nextHop": "Destination",
            "priority": 1
          }
        ]
      },
      "initial": {
        "locations": {
          "p1": "Source",
          "p2": "Source",
          "p3": "Source"
        },
        "arrivalOrder": [],
        "buffer": [],
        "linkR1R2Up": true,
        "activePacket": null,
        "activeRouter": null,
        "matchedRow": null,
        "chosenNextHop": null,
        "assembled": false,
        "message": null,
        "stopped": false
      },
      "steps": [
        {
          "id": "split",
          "title": {
            "en": "Split and label",
            "vi": "Chia và gắn nhãn"
          },
          "action": {
            "en": "Split NETWORK into p1=NET, p2=WO and p3=RK, all addressed to Destination.",
            "vi": "Chia NETWORK thành p1=NET, p2=WO, p3=RK, cùng địa chỉ đích Destination."
          },
          "why": {
            "en": "Each unit needs destination information; teaching order labels support later reconstruction.",
            "vi": "Mỗi đơn vị cần thông tin đích; nhãn thứ tự minh họa hỗ trợ khôi phục sau đó."
          },
          "outcome": {
            "en": "All three packets are at Source; none has arrived.",
            "vi": "Ba packet ở Source; chưa packet nào đến đích."
          },
          "before": {
            "locations": {
              "p1": "Source",
              "p2": "Source",
              "p3": "Source"
            },
            "arrivalOrder": [],
            "buffer": [],
            "linkR1R2Up": true,
            "activePacket": null,
            "activeRouter": null,
            "matchedRow": null,
            "chosenNextHop": null,
            "assembled": false,
            "message": null,
            "stopped": false
          },
          "after": {
            "locations": {
              "p1": "Source",
              "p2": "Source",
              "p3": "Source"
            },
            "arrivalOrder": [],
            "buffer": [],
            "linkR1R2Up": true,
            "activePacket": null,
            "activeRouter": null,
            "matchedRow": null,
            "chosenNextHop": null,
            "assembled": false,
            "message": null,
            "stopped": false
          }
        },
        {
          "id": "read-destination",
          "title": {
            "en": "Inspect the destination",
            "vi": "Đọc địa chỉ đích"
          },
          "action": {
            "en": "Source hands the packets to R1; inspect p1’s Destination field.",
            "vi": "Source chuyển các packet đến R1; đọc trường Destination của p1."
          },
          "why": {
            "en": "R1 selects forwarding information by destination, not by the message text NET.",
            "vi": "R1 chọn thông tin chuyển tiếp theo đích, không theo nội dung NET."
          },
          "outcome": {
            "en": "R1 holds p1, p2 and p3; p1 is selected for lookup.",
            "vi": "R1 giữ p1, p2, p3; p1 được chọn để tra bảng."
          },
          "before": {
            "locations": {
              "p1": "Source",
              "p2": "Source",
              "p3": "Source"
            },
            "arrivalOrder": [],
            "buffer": [],
            "linkR1R2Up": true,
            "activePacket": null,
            "activeRouter": null,
            "matchedRow": null,
            "chosenNextHop": null,
            "assembled": false,
            "message": null,
            "stopped": false
          },
          "after": {
            "locations": {
              "p1": "R1",
              "p2": "R1",
              "p3": "R1"
            },
            "arrivalOrder": [],
            "buffer": [],
            "linkR1R2Up": true,
            "activePacket": "p1",
            "activeRouter": "R1",
            "matchedRow": null,
            "chosenNextHop": null,
            "assembled": false,
            "message": null,
            "stopped": false
          }
        },
        {
          "id": "lookup-route",
          "title": {
            "en": "Read the supplied table",
            "vi": "Đọc bảng đã cho"
          },
          "action": {
            "en": "Match Destination to R1’s primary row via R2.",
            "vi": "Khớp Destination với dòng chính của R1 qua R2."
          },
          "why": {
            "en": "A matching route must also have an available next link before forwarding.",
            "vi": "Tuyến khớp còn phải có liên kết tiếp theo hoạt động trước khi chuyển tiếp."
          },
          "outcome": {
            "en": "The primary row is identified; now check its link.",
            "vi": "Đã xác định dòng chính; tiếp theo kiểm tra liên kết."
          },
          "before": {
            "locations": {
              "p1": "R1",
              "p2": "R1",
              "p3": "R1"
            },
            "arrivalOrder": [],
            "buffer": [],
            "linkR1R2Up": true,
            "activePacket": "p1",
            "activeRouter": "R1",
            "matchedRow": null,
            "chosenNextHop": null,
            "assembled": false,
            "message": null,
            "stopped": false
          },
          "after": {
            "locations": {
              "p1": "R1",
              "p2": "R1",
              "p3": "R1"
            },
            "arrivalOrder": [],
            "buffer": [],
            "linkR1R2Up": true,
            "activePacket": "p1",
            "activeRouter": "R1",
            "matchedRow": "r1-primary",
            "chosenNextHop": "R2",
            "assembled": false,
            "message": null,
            "stopped": false
          }
        },
        {
          "id": "forward-next-hop",
          "title": {
            "en": "Forward p1 to R2",
            "vi": "Chuyển p1 tới R2"
          },
          "action": {
            "en": "Send p1 along the available R1–R2 link.",
            "vi": "Gửi p1 qua liên kết R1–R2 đang hoạt động."
          },
          "why": {
            "en": "The chosen next hop is adjacent and matches the supplied primary row.",
            "vi": "Next hop đã chọn nằm kề và khớp dòng chính đã cho."
          },
          "outcome": {
            "en": "p1 is at R2; its final destination is still Destination.",
            "vi": "p1 ở R2; địa chỉ đích cuối vẫn là Destination."
          },
          "before": {
            "locations": {
              "p1": "R1",
              "p2": "R1",
              "p3": "R1"
            },
            "arrivalOrder": [],
            "buffer": [],
            "linkR1R2Up": true,
            "activePacket": "p1",
            "activeRouter": "R1",
            "matchedRow": "r1-primary",
            "chosenNextHop": "R2",
            "assembled": false,
            "message": null,
            "stopped": false
          },
          "after": {
            "locations": {
              "p1": "R2",
              "p2": "R1",
              "p3": "R1"
            },
            "arrivalOrder": [],
            "buffer": [],
            "linkR1R2Up": true,
            "activePacket": "p1",
            "activeRouter": "R1",
            "matchedRow": "r1-primary",
            "chosenNextHop": "R2",
            "assembled": false,
            "message": null,
            "stopped": false
          }
        },
        {
          "id": "link-unavailable",
          "title": {
            "en": "The first route changes",
            "vi": "Tuyến đầu thay đổi"
          },
          "action": {
            "en": "Mark R1–R2 unavailable after p1 has already crossed it.",
            "vi": "Đánh dấu R1–R2 không hoạt động sau khi p1 đã đi qua."
          },
          "why": {
            "en": "p2 and p3 need another usable next hop; p1 can still use R2–Destination.",
            "vi": "p2, p3 cần next hop khác dùng được; p1 vẫn có thể dùng R2–Destination."
          },
          "outcome": {
            "en": "Only R1–R2 is down. R1’s declared alternative via R3 remains available.",
            "vi": "Chỉ R1–R2 hỏng. Phương án đã khai báo của R1 qua R3 vẫn hoạt động."
          },
          "before": {
            "locations": {
              "p1": "R2",
              "p2": "R1",
              "p3": "R1"
            },
            "arrivalOrder": [],
            "buffer": [],
            "linkR1R2Up": true,
            "activePacket": "p1",
            "activeRouter": "R1",
            "matchedRow": "r1-primary",
            "chosenNextHop": "R2",
            "assembled": false,
            "message": null,
            "stopped": false
          },
          "after": {
            "locations": {
              "p1": "R2",
              "p2": "R1",
              "p3": "R1"
            },
            "arrivalOrder": [],
            "buffer": [],
            "linkR1R2Up": false,
            "activePacket": null,
            "activeRouter": "R1",
            "matchedRow": null,
            "chosenNextHop": null,
            "assembled": false,
            "message": null,
            "stopped": false
          }
        },
        {
          "id": "route-p2",
          "title": {
            "en": "Forward p2 via R3",
            "vi": "Chuyển p2 qua R3"
          },
          "action": {
            "en": "Read p2’s Destination field and use R1’s available alternative row via R3.",
            "vi": "Đọc trường Destination của p2 và dùng dòng thay thế còn hoạt động của R1 qua R3."
          },
          "why": {
            "en": "The primary link is down; the explicit second row supplies the next hop.",
            "vi": "Liên kết chính hỏng; dòng thứ hai được nêu rõ cung cấp next hop."
          },
          "outcome": {
            "en": "p2 reaches R3 with the same final destination.",
            "vi": "p2 tới R3 và vẫn giữ cùng đích cuối."
          },
          "before": {
            "locations": {
              "p1": "R2",
              "p2": "R1",
              "p3": "R1"
            },
            "arrivalOrder": [],
            "buffer": [],
            "linkR1R2Up": false,
            "activePacket": null,
            "activeRouter": "R1",
            "matchedRow": null,
            "chosenNextHop": null,
            "assembled": false,
            "message": null,
            "stopped": false
          },
          "after": {
            "locations": {
              "p1": "R2",
              "p2": "R3",
              "p3": "R1"
            },
            "arrivalOrder": [],
            "buffer": [],
            "linkR1R2Up": false,
            "activePacket": "p2",
            "activeRouter": "R1",
            "matchedRow": "r1-alternative",
            "chosenNextHop": "R3",
            "assembled": false,
            "message": null,
            "stopped": false
          }
        },
        {
          "id": "arrive-p2",
          "title": {
            "en": "Receive p2",
            "vi": "Nhận p2"
          },
          "action": {
            "en": "R3 matches Destination to its direct row and forwards p2 to the receiver.",
            "vi": "R3 khớp Destination với dòng trực tiếp rồi chuyển p2 đến bên nhận."
          },
          "why": {
            "en": "This trace schedules this arrival next; it does not calculate network time or promise a fastest route.",
            "vi": "Hành trình định sẵn lần đến này tiếp theo; không tính thời gian mạng hay cam kết tuyến nhanh nhất."
          },
          "outcome": {
            "en": "Arrival buffer: p2. Keep payloads associated with their original order labels.",
            "vi": "Bộ đệm theo thứ tự đến: p2. Giữ payload gắn với nhãn thứ tự ban đầu."
          },
          "before": {
            "locations": {
              "p1": "R2",
              "p2": "R3",
              "p3": "R1"
            },
            "arrivalOrder": [],
            "buffer": [],
            "linkR1R2Up": false,
            "activePacket": "p2",
            "activeRouter": "R1",
            "matchedRow": "r1-alternative",
            "chosenNextHop": "R3",
            "assembled": false,
            "message": null,
            "stopped": false
          },
          "after": {
            "locations": {
              "p1": "R2",
              "p2": "Destination",
              "p3": "R1"
            },
            "arrivalOrder": [
              "p2"
            ],
            "buffer": [
              "p2"
            ],
            "linkR1R2Up": false,
            "activePacket": "p2",
            "activeRouter": "R3",
            "matchedRow": "r3-direct",
            "chosenNextHop": "Destination",
            "assembled": false,
            "message": null,
            "stopped": false
          }
        },
        {
          "id": "arrive-p1",
          "title": {
            "en": "Receive p1",
            "vi": "Nhận p1"
          },
          "action": {
            "en": "R2 matches Destination to its direct row and forwards p1 to the receiver.",
            "vi": "R2 khớp Destination với dòng trực tiếp rồi chuyển p1 đến bên nhận."
          },
          "why": {
            "en": "This trace schedules this arrival next; it does not calculate network time or promise a fastest route.",
            "vi": "Hành trình định sẵn lần đến này tiếp theo; không tính thời gian mạng hay cam kết tuyến nhanh nhất."
          },
          "outcome": {
            "en": "Arrival buffer: p2, p1. Keep payloads associated with their original order labels.",
            "vi": "Bộ đệm theo thứ tự đến: p2, p1. Giữ payload gắn với nhãn thứ tự ban đầu."
          },
          "before": {
            "locations": {
              "p1": "R2",
              "p2": "Destination",
              "p3": "R1"
            },
            "arrivalOrder": [
              "p2"
            ],
            "buffer": [
              "p2"
            ],
            "linkR1R2Up": false,
            "activePacket": "p2",
            "activeRouter": "R3",
            "matchedRow": "r3-direct",
            "chosenNextHop": "Destination",
            "assembled": false,
            "message": null,
            "stopped": false
          },
          "after": {
            "locations": {
              "p1": "Destination",
              "p2": "Destination",
              "p3": "R1"
            },
            "arrivalOrder": [
              "p2",
              "p1"
            ],
            "buffer": [
              "p2",
              "p1"
            ],
            "linkR1R2Up": false,
            "activePacket": "p1",
            "activeRouter": "R2",
            "matchedRow": "r2-direct",
            "chosenNextHop": "Destination",
            "assembled": false,
            "message": null,
            "stopped": false
          }
        },
        {
          "id": "route-p3",
          "title": {
            "en": "Forward p3 via R3",
            "vi": "Chuyển p3 qua R3"
          },
          "action": {
            "en": "Read p3’s Destination field and use R1’s available alternative row via R3.",
            "vi": "Đọc trường Destination của p3 và dùng dòng thay thế còn hoạt động của R1 qua R3."
          },
          "why": {
            "en": "The primary link is down; the explicit second row supplies the next hop.",
            "vi": "Liên kết chính hỏng; dòng thứ hai được nêu rõ cung cấp next hop."
          },
          "outcome": {
            "en": "p3 reaches R3 with the same final destination.",
            "vi": "p3 tới R3 và vẫn giữ cùng đích cuối."
          },
          "before": {
            "locations": {
              "p1": "Destination",
              "p2": "Destination",
              "p3": "R1"
            },
            "arrivalOrder": [
              "p2",
              "p1"
            ],
            "buffer": [
              "p2",
              "p1"
            ],
            "linkR1R2Up": false,
            "activePacket": "p1",
            "activeRouter": "R2",
            "matchedRow": "r2-direct",
            "chosenNextHop": "Destination",
            "assembled": false,
            "message": null,
            "stopped": false
          },
          "after": {
            "locations": {
              "p1": "Destination",
              "p2": "Destination",
              "p3": "R3"
            },
            "arrivalOrder": [
              "p2",
              "p1"
            ],
            "buffer": [
              "p2",
              "p1"
            ],
            "linkR1R2Up": false,
            "activePacket": "p3",
            "activeRouter": "R1",
            "matchedRow": "r1-alternative",
            "chosenNextHop": "R3",
            "assembled": false,
            "message": null,
            "stopped": false
          }
        },
        {
          "id": "arrive-p3",
          "title": {
            "en": "Receive p3",
            "vi": "Nhận p3"
          },
          "action": {
            "en": "R3 matches Destination to its direct row and forwards p3 to the receiver.",
            "vi": "R3 khớp Destination với dòng trực tiếp rồi chuyển p3 đến bên nhận."
          },
          "why": {
            "en": "This trace schedules this arrival next; it does not calculate network time or promise a fastest route.",
            "vi": "Hành trình định sẵn lần đến này tiếp theo; không tính thời gian mạng hay cam kết tuyến nhanh nhất."
          },
          "outcome": {
            "en": "Arrival buffer: p2, p1, p3. Keep payloads associated with their original order labels.",
            "vi": "Bộ đệm theo thứ tự đến: p2, p1, p3. Giữ payload gắn với nhãn thứ tự ban đầu."
          },
          "before": {
            "locations": {
              "p1": "Destination",
              "p2": "Destination",
              "p3": "R3"
            },
            "arrivalOrder": [
              "p2",
              "p1"
            ],
            "buffer": [
              "p2",
              "p1"
            ],
            "linkR1R2Up": false,
            "activePacket": "p3",
            "activeRouter": "R1",
            "matchedRow": "r1-alternative",
            "chosenNextHop": "R3",
            "assembled": false,
            "message": null,
            "stopped": false
          },
          "after": {
            "locations": {
              "p1": "Destination",
              "p2": "Destination",
              "p3": "Destination"
            },
            "arrivalOrder": [
              "p2",
              "p1",
              "p3"
            ],
            "buffer": [
              "p2",
              "p1",
              "p3"
            ],
            "linkR1R2Up": false,
            "activePacket": "p3",
            "activeRouter": "R3",
            "matchedRow": "r3-direct",
            "chosenNextHop": "Destination",
            "assembled": false,
            "message": null,
            "stopped": false
          }
        },
        {
          "id": "reassemble",
          "title": {
            "en": "Reconstruct in message order",
            "vi": "Khôi phục theo thứ tự thông điệp"
          },
          "action": {
            "en": "Check p1, p2 and p3 are all present, then join NET + WO + RK.",
            "vi": "Kiểm tra đã đủ p1, p2, p3 rồi ghép NET + WO + RK."
          },
          "why": {
            "en": "Arrival order p2, p1, p3 must not become application-message order.",
            "vi": "Không được dùng thứ tự đến p2, p1, p3 làm thứ tự thông điệp ứng dụng."
          },
          "outcome": {
            "en": "The complete message is NETWORK. Receiver ordering is a higher-layer service, not a guarantee supplied by IP alone.",
            "vi": "Thông điệp đầy đủ là NETWORK. Sắp thứ tự ở bên nhận là dịch vụ tầng cao hơn, không phải bảo đảm do riêng IP cung cấp."
          },
          "before": {
            "locations": {
              "p1": "Destination",
              "p2": "Destination",
              "p3": "Destination"
            },
            "arrivalOrder": [
              "p2",
              "p1",
              "p3"
            ],
            "buffer": [
              "p2",
              "p1",
              "p3"
            ],
            "linkR1R2Up": false,
            "activePacket": "p3",
            "activeRouter": "R3",
            "matchedRow": "r3-direct",
            "chosenNextHop": "Destination",
            "assembled": false,
            "message": null,
            "stopped": false
          },
          "after": {
            "locations": {
              "p1": "Destination",
              "p2": "Destination",
              "p3": "Destination"
            },
            "arrivalOrder": [
              "p2",
              "p1",
              "p3"
            ],
            "buffer": [
              "p2",
              "p1",
              "p3"
            ],
            "linkR1R2Up": false,
            "activePacket": null,
            "activeRouter": null,
            "matchedRow": null,
            "chosenNextHop": null,
            "assembled": true,
            "message": "NETWORK",
            "stopped": false
          }
        }
      ]
    },
    {
      "id": "unavailable-route",
      "packets": [
        {
          "id": "p1",
          "order": 1,
          "payload": "NET",
          "destination": "Destination"
        },
        {
          "id": "p2",
          "order": 2,
          "payload": "WO",
          "destination": "Destination"
        },
        {
          "id": "p3",
          "order": 3,
          "payload": "RK",
          "destination": "Destination"
        }
      ],
      "topology": [
        [
          "Source",
          "R1"
        ],
        [
          "R1",
          "R2"
        ],
        [
          "R1",
          "R3"
        ],
        [
          "R2",
          "Destination"
        ],
        [
          "R3",
          "Destination"
        ]
      ],
      "tables": {
        "R1": [
          {
            "id": "r1-primary",
            "destination": "Destination",
            "nextHop": "R2",
            "priority": 1
          }
        ],
        "R2": [
          {
            "id": "r2-direct",
            "destination": "Destination",
            "nextHop": "Destination",
            "priority": 1
          }
        ],
        "R3": [
          {
            "id": "r3-direct",
            "destination": "Destination",
            "nextHop": "Destination",
            "priority": 1
          }
        ]
      },
      "initial": {
        "locations": {
          "p1": "Source",
          "p2": "Source",
          "p3": "Source"
        },
        "arrivalOrder": [],
        "buffer": [],
        "linkR1R2Up": false,
        "activePacket": null,
        "activeRouter": null,
        "matchedRow": null,
        "chosenNextHop": null,
        "assembled": false,
        "message": null,
        "stopped": false
      },
      "steps": [
        {
          "id": "split",
          "title": {
            "en": "Split and label",
            "vi": "Chia và gắn nhãn"
          },
          "action": {
            "en": "Split NETWORK into p1=NET, p2=WO and p3=RK, all addressed to Destination.",
            "vi": "Chia NETWORK thành p1=NET, p2=WO, p3=RK, cùng địa chỉ đích Destination."
          },
          "why": {
            "en": "Each unit needs destination information; teaching order labels support later reconstruction.",
            "vi": "Mỗi đơn vị cần thông tin đích; nhãn thứ tự minh họa hỗ trợ khôi phục sau đó."
          },
          "outcome": {
            "en": "All three packets are at Source; none has arrived.",
            "vi": "Ba packet ở Source; chưa packet nào đến đích."
          },
          "before": {
            "locations": {
              "p1": "Source",
              "p2": "Source",
              "p3": "Source"
            },
            "arrivalOrder": [],
            "buffer": [],
            "linkR1R2Up": false,
            "activePacket": null,
            "activeRouter": null,
            "matchedRow": null,
            "chosenNextHop": null,
            "assembled": false,
            "message": null,
            "stopped": false
          },
          "after": {
            "locations": {
              "p1": "Source",
              "p2": "Source",
              "p3": "Source"
            },
            "arrivalOrder": [],
            "buffer": [],
            "linkR1R2Up": false,
            "activePacket": null,
            "activeRouter": null,
            "matchedRow": null,
            "chosenNextHop": null,
            "assembled": false,
            "message": null,
            "stopped": false
          }
        },
        {
          "id": "read-destination",
          "title": {
            "en": "Inspect the destination",
            "vi": "Đọc địa chỉ đích"
          },
          "action": {
            "en": "Source hands the packets to R1; inspect p1’s Destination field.",
            "vi": "Source chuyển các packet đến R1; đọc trường Destination của p1."
          },
          "why": {
            "en": "R1 selects forwarding information by destination, not by the message text NET.",
            "vi": "R1 chọn thông tin chuyển tiếp theo đích, không theo nội dung NET."
          },
          "outcome": {
            "en": "R1 holds p1, p2 and p3; p1 is selected for lookup.",
            "vi": "R1 giữ p1, p2, p3; p1 được chọn để tra bảng."
          },
          "before": {
            "locations": {
              "p1": "Source",
              "p2": "Source",
              "p3": "Source"
            },
            "arrivalOrder": [],
            "buffer": [],
            "linkR1R2Up": false,
            "activePacket": null,
            "activeRouter": null,
            "matchedRow": null,
            "chosenNextHop": null,
            "assembled": false,
            "message": null,
            "stopped": false
          },
          "after": {
            "locations": {
              "p1": "R1",
              "p2": "R1",
              "p3": "R1"
            },
            "arrivalOrder": [],
            "buffer": [],
            "linkR1R2Up": false,
            "activePacket": "p1",
            "activeRouter": "R1",
            "matchedRow": null,
            "chosenNextHop": null,
            "assembled": false,
            "message": null,
            "stopped": false
          }
        },
        {
          "id": "lookup-route",
          "title": {
            "en": "Read the supplied table",
            "vi": "Đọc bảng đã cho"
          },
          "action": {
            "en": "Match Destination to R1’s primary row via R2.",
            "vi": "Khớp Destination với dòng chính của R1 qua R2."
          },
          "why": {
            "en": "A matching route must also have an available next link before forwarding.",
            "vi": "Tuyến khớp còn phải có liên kết tiếp theo hoạt động trước khi chuyển tiếp."
          },
          "outcome": {
            "en": "The primary row is identified; now check its link.",
            "vi": "Đã xác định dòng chính; tiếp theo kiểm tra liên kết."
          },
          "before": {
            "locations": {
              "p1": "R1",
              "p2": "R1",
              "p3": "R1"
            },
            "arrivalOrder": [],
            "buffer": [],
            "linkR1R2Up": false,
            "activePacket": "p1",
            "activeRouter": "R1",
            "matchedRow": null,
            "chosenNextHop": null,
            "assembled": false,
            "message": null,
            "stopped": false
          },
          "after": {
            "locations": {
              "p1": "R1",
              "p2": "R1",
              "p3": "R1"
            },
            "arrivalOrder": [],
            "buffer": [],
            "linkR1R2Up": false,
            "activePacket": "p1",
            "activeRouter": "R1",
            "matchedRow": "r1-primary",
            "chosenNextHop": "R2",
            "assembled": false,
            "message": null,
            "stopped": false
          }
        },
        {
          "id": "unavailable-route",
          "title": {
            "en": "No usable supplied route",
            "vi": "Không có tuyến đã cho dùng được"
          },
          "action": {
            "en": "Find R1–R2 down and no alternative in this scenario’s R1 table.",
            "vi": "Nhận thấy R1–R2 hỏng và bảng R1 của tình huống này không có phương án thay thế."
          },
          "why": {
            "en": "A drawn link to R3 alone is not permission to invent a routing-table entry.",
            "vi": "Chỉ có đường vẽ tới R3 không có nghĩa được tự tạo một dòng bảng định tuyến."
          },
          "outcome": {
            "en": "Stop: all packets remain at R1, the receiver is empty and no message can be reconstructed.",
            "vi": "Dừng: mọi packet còn ở R1, bên nhận trống và chưa thể khôi phục thông điệp."
          },
          "before": {
            "locations": {
              "p1": "R1",
              "p2": "R1",
              "p3": "R1"
            },
            "arrivalOrder": [],
            "buffer": [],
            "linkR1R2Up": false,
            "activePacket": "p1",
            "activeRouter": "R1",
            "matchedRow": "r1-primary",
            "chosenNextHop": "R2",
            "assembled": false,
            "message": null,
            "stopped": false
          },
          "after": {
            "locations": {
              "p1": "R1",
              "p2": "R1",
              "p3": "R1"
            },
            "arrivalOrder": [],
            "buffer": [],
            "linkR1R2Up": false,
            "activePacket": "p1",
            "activeRouter": "R1",
            "matchedRow": "r1-primary",
            "chosenNextHop": null,
            "assembled": false,
            "message": null,
            "stopped": true
          }
        }
      ]
    }
  ],
  "switching": [
    {
      "id": "continuous",
      "title": {
        "en": "Continuous demand",
        "vi": "Nhu cầu liên tục"
      },
      "demand": {
        "en": "A sustained stream needs predictable reserved service; setup is acceptable.",
        "vi": "Luồng liên tục cần dịch vụ dành riêng dễ dự đoán; chấp nhận thiết lập trước."
      },
      "units": [
        "A1",
        "A2",
        "A3"
      ],
      "preferredMethod": "circuit",
      "reason": {
        "en": "A circuit fits these stated priorities after setup, but reserves resources and can fail if its path fails. Packet networks can carry continuous media too.",
        "vi": "Circuit phù hợp các ưu tiên này sau thiết lập, nhưng giữ tài nguyên và có thể gián đoạn nếu tuyến hỏng. Mạng packet cũng truyền được media liên tục."
      },
      "traces": {
        "circuit": {
          "initial": {
            "reservedForA": false,
            "linkUse": "none",
            "otherTrafficCanUseResource": true,
            "delivered": [],
            "complete": false,
            "released": false
          },
          "steps": [
            {
              "id": "circuit-establish",
              "title": {
                "en": "Establish the circuit",
                "vi": "Thiết lập circuit"
              },
              "action": {
                "en": "Request a dedicated end-to-end channel for conversation A.",
                "vi": "Yêu cầu kênh dành riêng giữa hai đầu cho cuộc trao đổi A."
              },
              "why": {
                "en": "Circuit setup must succeed before the data transfer begins.",
                "vi": "Phải thiết lập circuit thành công trước khi truyền dữ liệu."
              },
              "outcome": {
                "en": "Setup is represented as an event, not a measured delay.",
                "vi": "Thiết lập được biểu diễn như sự kiện, không phải độ trễ đo được."
              },
              "before": {
                "reservedForA": false,
                "linkUse": "none",
                "otherTrafficCanUseResource": true,
                "delivered": [],
                "complete": false,
                "released": false
              },
              "after": {
                "reservedForA": false,
                "linkUse": "none",
                "otherTrafficCanUseResource": true,
                "delivered": [],
                "complete": false,
                "released": false
              }
            },
            {
              "id": "circuit-reserve",
              "title": {
                "en": "Reserve the channel",
                "vi": "Dành riêng kênh"
              },
              "action": {
                "en": "Reserve the channel along the selected path for A.",
                "vi": "Dành riêng kênh dọc tuyến đã chọn cho A."
              },
              "why": {
                "en": "Other conversations cannot use this allocated channel until it is released.",
                "vi": "Cuộc trao đổi khác không thể dùng kênh đã cấp này đến khi nó được giải phóng."
              },
              "outcome": {
                "en": "A owns the channel although it is not carrying data at this instant.",
                "vi": "A giữ kênh dù tại thời điểm minh họa này chưa có dữ liệu."
              },
              "before": {
                "reservedForA": false,
                "linkUse": "none",
                "otherTrafficCanUseResource": true,
                "delivered": [],
                "complete": false,
                "released": false
              },
              "after": {
                "reservedForA": true,
                "linkUse": "idle",
                "otherTrafficCanUseResource": false,
                "delivered": [],
                "complete": false,
                "released": false
              }
            },
            {
              "id": "circuit-transmit-first",
              "title": {
                "en": "Send the first data",
                "vi": "Gửi dữ liệu đầu"
              },
              "action": {
                "en": "Carry A1 over the established channel.",
                "vi": "Truyền A1 qua kênh đã thiết lập."
              },
              "why": {
                "en": "The reserved path is available for A’s data.",
                "vi": "Tuyến dành riêng sẵn sàng cho dữ liệu A."
              },
              "outcome": {
                "en": "A1 reaches the receiver in this successful circuit trace.",
                "vi": "A1 đến bên nhận trong hành trình circuit thành công này."
              },
              "before": {
                "reservedForA": true,
                "linkUse": "idle",
                "otherTrafficCanUseResource": false,
                "delivered": [],
                "complete": false,
                "released": false
              },
              "after": {
                "reservedForA": true,
                "linkUse": "A1",
                "otherTrafficCanUseResource": false,
                "delivered": [
                  "A1"
                ],
                "complete": false,
                "released": false
              }
            },
            {
              "id": "circuit-interval",
              "title": {
                "en": "Inspect the next interval",
                "vi": "Xét khoảng tiếp theo"
              },
              "action": {
                "en": "Carry A2 on the same channel.",
                "vi": "Truyền A2 trên cùng kênh."
              },
              "why": {
                "en": "The stream continues to use its allocation.",
                "vi": "Luồng tiếp tục sử dụng phần đã cấp."
              },
              "outcome": {
                "en": "A2 arrives; other traffic still cannot use this channel.",
                "vi": "A2 đến nơi; lưu lượng khác vẫn không thể dùng kênh này."
              },
              "before": {
                "reservedForA": true,
                "linkUse": "A1",
                "otherTrafficCanUseResource": false,
                "delivered": [
                  "A1"
                ],
                "complete": false,
                "released": false
              },
              "after": {
                "reservedForA": true,
                "linkUse": "A2",
                "otherTrafficCanUseResource": false,
                "delivered": [
                  "A1",
                  "A2"
                ],
                "complete": false,
                "released": false
              }
            },
            {
              "id": "circuit-transmit-last",
              "title": {
                "en": "Send the final data",
                "vi": "Gửi dữ liệu cuối"
              },
              "action": {
                "en": "Carry A3 on the same reserved path.",
                "vi": "Truyền A3 trên cùng tuyến dành riêng."
              },
              "why": {
                "en": "The channel remains allocated until the conversation ends.",
                "vi": "Kênh vẫn được cấp đến khi cuộc trao đổi kết thúc."
              },
              "outcome": {
                "en": "All of A’s data has arrived in order in this successful trace.",
                "vi": "Toàn bộ dữ liệu A đến đúng thứ tự trong hành trình thành công này."
              },
              "before": {
                "reservedForA": true,
                "linkUse": "A2",
                "otherTrafficCanUseResource": false,
                "delivered": [
                  "A1",
                  "A2"
                ],
                "complete": false,
                "released": false
              },
              "after": {
                "reservedForA": true,
                "linkUse": "A3",
                "otherTrafficCanUseResource": false,
                "delivered": [
                  "A1",
                  "A2",
                  "A3"
                ],
                "complete": true,
                "released": false
              }
            },
            {
              "id": "circuit-release",
              "title": {
                "en": "Release the channel",
                "vi": "Giải phóng kênh"
              },
              "action": {
                "en": "Terminate the conversation and release the reserved channel.",
                "vi": "Kết thúc cuộc trao đổi và giải phóng kênh dành riêng."
              },
              "why": {
                "en": "Resources should become available to other conversations.",
                "vi": "Tài nguyên cần được trả lại cho cuộc trao đổi khác."
              },
              "outcome": {
                "en": "A’s reservation ends; another conversation can now use the channel.",
                "vi": "Phần dành riêng cho A kết thúc; cuộc trao đổi khác có thể dùng kênh."
              },
              "before": {
                "reservedForA": true,
                "linkUse": "A3",
                "otherTrafficCanUseResource": false,
                "delivered": [
                  "A1",
                  "A2",
                  "A3"
                ],
                "complete": true,
                "released": false
              },
              "after": {
                "reservedForA": false,
                "linkUse": "none",
                "otherTrafficCanUseResource": true,
                "delivered": [
                  "A1",
                  "A2",
                  "A3"
                ],
                "complete": true,
                "released": true
              }
            }
          ]
        },
        "packet": {
          "initial": {
            "reservedForA": false,
            "linkUse": "none",
            "otherTrafficCanUseResource": true,
            "delivered": [],
            "complete": false,
            "released": false
          },
          "steps": [
            {
              "id": "packet-split",
              "title": {
                "en": "Prepare packets",
                "vi": "Chuẩn bị packet"
              },
              "action": {
                "en": "Represent A’s data as addressed packets with control information.",
                "vi": "Biểu diễn dữ liệu A thành packet có địa chỉ và thông tin điều khiển."
              },
              "why": {
                "en": "Each packet can be forwarded over shared resources without reserving a circuit for the whole conversation.",
                "vi": "Mỗi packet có thể được chuyển qua tài nguyên dùng chung mà không dành riêng circuit cho toàn cuộc trao đổi."
              },
              "outcome": {
                "en": "Packets are ready; no end-to-end resource is reserved for A.",
                "vi": "Packet đã sẵn sàng; không có tài nguyên xuyên suốt nào dành riêng cho A."
              },
              "before": {
                "reservedForA": false,
                "linkUse": "none",
                "otherTrafficCanUseResource": true,
                "delivered": [],
                "complete": false,
                "released": false
              },
              "after": {
                "reservedForA": false,
                "linkUse": "none",
                "otherTrafficCanUseResource": true,
                "delivered": [],
                "complete": false,
                "released": false
              }
            },
            {
              "id": "packet-share-first",
              "title": {
                "en": "Use one shared turn",
                "vi": "Dùng một lượt truyền chung"
              },
              "action": {
                "en": "Transmit A1 during one turn on the shared link.",
                "vi": "Truyền A1 trong một lượt trên liên kết dùng chung."
              },
              "why": {
                "en": "A packet occupies the link while transmitted; other traffic can use other turns.",
                "vi": "Packet chiếm liên kết khi đang truyền; lưu lượng khác có thể dùng lượt khác."
              },
              "outcome": {
                "en": "The link carries A1 now without becoming reserved for the conversation.",
                "vi": "Liên kết đang truyền A1 nhưng không trở thành kênh dành riêng cho cả cuộc trao đổi."
              },
              "before": {
                "reservedForA": false,
                "linkUse": "none",
                "otherTrafficCanUseResource": true,
                "delivered": [],
                "complete": false,
                "released": false
              },
              "after": {
                "reservedForA": false,
                "linkUse": "A1",
                "otherTrafficCanUseResource": true,
                "delivered": [],
                "complete": false,
                "released": false
              }
            },
            {
              "id": "packet-interval",
              "title": {
                "en": "Use the next shared turn",
                "vi": "Dùng lượt chung tiếp theo"
              },
              "action": {
                "en": "Transmit A2 in the next scheduled turn.",
                "vi": "Truyền A2 trong lượt được lên lịch tiếp theo."
              },
              "why": {
                "en": "Continued demand still shares capacity rather than owning a dedicated circuit.",
                "vi": "Nhu cầu liên tục vẫn dùng chung dung lượng thay vì sở hữu circuit dành riêng."
              },
              "outcome": {
                "en": "A2 uses the link; other conversations remain eligible for other turns.",
                "vi": "A2 dùng liên kết; cuộc trao đổi khác vẫn có thể được cấp lượt khác."
              },
              "before": {
                "reservedForA": false,
                "linkUse": "A1",
                "otherTrafficCanUseResource": true,
                "delivered": [],
                "complete": false,
                "released": false
              },
              "after": {
                "reservedForA": false,
                "linkUse": "A2",
                "otherTrafficCanUseResource": true,
                "delivered": [],
                "complete": false,
                "released": false
              }
            },
            {
              "id": "packet-share-last",
              "title": {
                "en": "Send the final packet",
                "vi": "Gửi packet cuối"
              },
              "action": {
                "en": "Transmit A3 in a later shared turn.",
                "vi": "Truyền A3 trong một lượt dùng chung sau đó."
              },
              "why": {
                "en": "Sharing does not promise a fixed wait or a dedicated rate.",
                "vi": "Dùng chung không cam kết thời gian chờ cố định hay tốc độ dành riêng."
              },
              "outcome": {
                "en": "All A packets have been sent in this teaching schedule.",
                "vi": "Mọi packet A đã được gửi theo lịch minh họa này."
              },
              "before": {
                "reservedForA": false,
                "linkUse": "A2",
                "otherTrafficCanUseResource": true,
                "delivered": [],
                "complete": false,
                "released": false
              },
              "after": {
                "reservedForA": false,
                "linkUse": "A3",
                "otherTrafficCanUseResource": true,
                "delivered": [],
                "complete": false,
                "released": false
              }
            },
            {
              "id": "packet-deliver",
              "title": {
                "en": "Receive all packets",
                "vi": "Nhận đủ packet"
              },
              "action": {
                "en": "Receive the complete set of A packets.",
                "vi": "Nhận đầy đủ các packet A."
              },
              "why": {
                "en": "Reconstruction requires all necessary data, even if arrival order differs.",
                "vi": "Khôi phục đòi hỏi đủ dữ liệu cần thiết, dù thứ tự đến có thể khác."
              },
              "outcome": {
                "en": "All A units are now present at the receiver.",
                "vi": "Bên nhận hiện có đầy đủ đơn vị A."
              },
              "before": {
                "reservedForA": false,
                "linkUse": "A3",
                "otherTrafficCanUseResource": true,
                "delivered": [],
                "complete": false,
                "released": false
              },
              "after": {
                "reservedForA": false,
                "linkUse": "none",
                "otherTrafficCanUseResource": true,
                "delivered": [
                  "A1",
                  "A2",
                  "A3"
                ],
                "complete": false,
                "released": false
              }
            },
            {
              "id": "packet-reassemble",
              "title": {
                "en": "Reconstruct and compare",
                "vi": "Khôi phục và so sánh"
              },
              "action": {
                "en": "Check completeness and put the units in their original order.",
                "vi": "Kiểm tra đủ dữ liệu rồi xếp các đơn vị theo thứ tự ban đầu."
              },
              "why": {
                "en": "Shared transport can require receiver buffering and ordering.",
                "vi": "Truyền qua mạng dùng chung có thể cần đệm và sắp thứ tự tại bên nhận."
              },
              "outcome": {
                "en": "A’s message is complete. There is no dedicated circuit reservation to release.",
                "vi": "Thông điệp A hoàn chỉnh. Không có circuit dành riêng cần giải phóng."
              },
              "before": {
                "reservedForA": false,
                "linkUse": "none",
                "otherTrafficCanUseResource": true,
                "delivered": [
                  "A1",
                  "A2",
                  "A3"
                ],
                "complete": false,
                "released": false
              },
              "after": {
                "reservedForA": false,
                "linkUse": "none",
                "otherTrafficCanUseResource": true,
                "delivered": [
                  "A1",
                  "A2",
                  "A3"
                ],
                "complete": true,
                "released": false
              }
            }
          ]
        }
      }
    },
    {
      "id": "bursty",
      "title": {
        "en": "Bursty demand",
        "vi": "Nhu cầu theo đợt"
      },
      "demand": {
        "en": "Short transfers have an idle gap; sharing capacity matters more than predictable delay.",
        "vi": "Các lần truyền ngắn có khoảng nghỉ; dùng chung dung lượng quan trọng hơn độ trễ dễ dự đoán."
      },
      "units": [
        "A1",
        "A2"
      ],
      "preferredMethod": "packet",
      "reason": {
        "en": "Packet sharing lets other traffic use the gap, but control overhead, queueing and reassembly can add variable delay.",
        "vi": "Chia sẻ theo packet cho lưu lượng khác dùng khoảng nghỉ, nhưng thông tin điều khiển, hàng đợi và ghép lại có thể thêm độ trễ biến thiên."
      },
      "traces": {
        "circuit": {
          "initial": {
            "reservedForA": false,
            "linkUse": "none",
            "otherTrafficCanUseResource": true,
            "delivered": [],
            "complete": false,
            "released": false
          },
          "steps": [
            {
              "id": "circuit-establish",
              "title": {
                "en": "Establish the circuit",
                "vi": "Thiết lập circuit"
              },
              "action": {
                "en": "Request a dedicated end-to-end channel for conversation A.",
                "vi": "Yêu cầu kênh dành riêng giữa hai đầu cho cuộc trao đổi A."
              },
              "why": {
                "en": "Circuit setup must succeed before the data transfer begins.",
                "vi": "Phải thiết lập circuit thành công trước khi truyền dữ liệu."
              },
              "outcome": {
                "en": "Setup is represented as an event, not a measured delay.",
                "vi": "Thiết lập được biểu diễn như sự kiện, không phải độ trễ đo được."
              },
              "before": {
                "reservedForA": false,
                "linkUse": "none",
                "otherTrafficCanUseResource": true,
                "delivered": [],
                "complete": false,
                "released": false
              },
              "after": {
                "reservedForA": false,
                "linkUse": "none",
                "otherTrafficCanUseResource": true,
                "delivered": [],
                "complete": false,
                "released": false
              }
            },
            {
              "id": "circuit-reserve",
              "title": {
                "en": "Reserve the channel",
                "vi": "Dành riêng kênh"
              },
              "action": {
                "en": "Reserve the channel along the selected path for A.",
                "vi": "Dành riêng kênh dọc tuyến đã chọn cho A."
              },
              "why": {
                "en": "Other conversations cannot use this allocated channel until it is released.",
                "vi": "Cuộc trao đổi khác không thể dùng kênh đã cấp này đến khi nó được giải phóng."
              },
              "outcome": {
                "en": "A owns the channel although it is not carrying data at this instant.",
                "vi": "A giữ kênh dù tại thời điểm minh họa này chưa có dữ liệu."
              },
              "before": {
                "reservedForA": false,
                "linkUse": "none",
                "otherTrafficCanUseResource": true,
                "delivered": [],
                "complete": false,
                "released": false
              },
              "after": {
                "reservedForA": true,
                "linkUse": "idle",
                "otherTrafficCanUseResource": false,
                "delivered": [],
                "complete": false,
                "released": false
              }
            },
            {
              "id": "circuit-transmit-first",
              "title": {
                "en": "Send the first data",
                "vi": "Gửi dữ liệu đầu"
              },
              "action": {
                "en": "Carry A1 over the established channel.",
                "vi": "Truyền A1 qua kênh đã thiết lập."
              },
              "why": {
                "en": "The reserved path is available for A’s data.",
                "vi": "Tuyến dành riêng sẵn sàng cho dữ liệu A."
              },
              "outcome": {
                "en": "A1 reaches the receiver in this successful circuit trace.",
                "vi": "A1 đến bên nhận trong hành trình circuit thành công này."
              },
              "before": {
                "reservedForA": true,
                "linkUse": "idle",
                "otherTrafficCanUseResource": false,
                "delivered": [],
                "complete": false,
                "released": false
              },
              "after": {
                "reservedForA": true,
                "linkUse": "A1",
                "otherTrafficCanUseResource": false,
                "delivered": [
                  "A1"
                ],
                "complete": false,
                "released": false
              }
            },
            {
              "id": "circuit-interval",
              "title": {
                "en": "Inspect the next interval",
                "vi": "Xét khoảng tiếp theo"
              },
              "action": {
                "en": "A pauses; leave the channel reserved.",
                "vi": "A tạm nghỉ; vẫn giữ kênh dành riêng."
              },
              "why": {
                "en": "Reservation persists even without useful data.",
                "vi": "Phần dành riêng vẫn tồn tại ngay cả khi không có dữ liệu hữu ích."
              },
              "outcome": {
                "en": "The channel is reserved but idle; B1 cannot use this allocation.",
                "vi": "Kênh được dành riêng nhưng nhàn rỗi; B1 không thể dùng phần cấp này."
              },
              "before": {
                "reservedForA": true,
                "linkUse": "A1",
                "otherTrafficCanUseResource": false,
                "delivered": [
                  "A1"
                ],
                "complete": false,
                "released": false
              },
              "after": {
                "reservedForA": true,
                "linkUse": "idle",
                "otherTrafficCanUseResource": false,
                "delivered": [
                  "A1"
                ],
                "complete": false,
                "released": false
              }
            },
            {
              "id": "circuit-transmit-last",
              "title": {
                "en": "Send the final data",
                "vi": "Gửi dữ liệu cuối"
              },
              "action": {
                "en": "Carry A2 on the same reserved path.",
                "vi": "Truyền A2 trên cùng tuyến dành riêng."
              },
              "why": {
                "en": "The channel remains allocated until the conversation ends.",
                "vi": "Kênh vẫn được cấp đến khi cuộc trao đổi kết thúc."
              },
              "outcome": {
                "en": "All of A’s data has arrived in order in this successful trace.",
                "vi": "Toàn bộ dữ liệu A đến đúng thứ tự trong hành trình thành công này."
              },
              "before": {
                "reservedForA": true,
                "linkUse": "idle",
                "otherTrafficCanUseResource": false,
                "delivered": [
                  "A1"
                ],
                "complete": false,
                "released": false
              },
              "after": {
                "reservedForA": true,
                "linkUse": "A2",
                "otherTrafficCanUseResource": false,
                "delivered": [
                  "A1",
                  "A2"
                ],
                "complete": true,
                "released": false
              }
            },
            {
              "id": "circuit-release",
              "title": {
                "en": "Release the channel",
                "vi": "Giải phóng kênh"
              },
              "action": {
                "en": "Terminate the conversation and release the reserved channel.",
                "vi": "Kết thúc cuộc trao đổi và giải phóng kênh dành riêng."
              },
              "why": {
                "en": "Resources should become available to other conversations.",
                "vi": "Tài nguyên cần được trả lại cho cuộc trao đổi khác."
              },
              "outcome": {
                "en": "A’s reservation ends; another conversation can now use the channel.",
                "vi": "Phần dành riêng cho A kết thúc; cuộc trao đổi khác có thể dùng kênh."
              },
              "before": {
                "reservedForA": true,
                "linkUse": "A2",
                "otherTrafficCanUseResource": false,
                "delivered": [
                  "A1",
                  "A2"
                ],
                "complete": true,
                "released": false
              },
              "after": {
                "reservedForA": false,
                "linkUse": "none",
                "otherTrafficCanUseResource": true,
                "delivered": [
                  "A1",
                  "A2"
                ],
                "complete": true,
                "released": true
              }
            }
          ]
        },
        "packet": {
          "initial": {
            "reservedForA": false,
            "linkUse": "none",
            "otherTrafficCanUseResource": true,
            "delivered": [],
            "complete": false,
            "released": false
          },
          "steps": [
            {
              "id": "packet-split",
              "title": {
                "en": "Prepare packets",
                "vi": "Chuẩn bị packet"
              },
              "action": {
                "en": "Represent A’s data as addressed packets with control information.",
                "vi": "Biểu diễn dữ liệu A thành packet có địa chỉ và thông tin điều khiển."
              },
              "why": {
                "en": "Each packet can be forwarded over shared resources without reserving a circuit for the whole conversation.",
                "vi": "Mỗi packet có thể được chuyển qua tài nguyên dùng chung mà không dành riêng circuit cho toàn cuộc trao đổi."
              },
              "outcome": {
                "en": "Packets are ready; no end-to-end resource is reserved for A.",
                "vi": "Packet đã sẵn sàng; không có tài nguyên xuyên suốt nào dành riêng cho A."
              },
              "before": {
                "reservedForA": false,
                "linkUse": "none",
                "otherTrafficCanUseResource": true,
                "delivered": [],
                "complete": false,
                "released": false
              },
              "after": {
                "reservedForA": false,
                "linkUse": "none",
                "otherTrafficCanUseResource": true,
                "delivered": [],
                "complete": false,
                "released": false
              }
            },
            {
              "id": "packet-share-first",
              "title": {
                "en": "Use one shared turn",
                "vi": "Dùng một lượt truyền chung"
              },
              "action": {
                "en": "Transmit A1 during one turn on the shared link.",
                "vi": "Truyền A1 trong một lượt trên liên kết dùng chung."
              },
              "why": {
                "en": "A packet occupies the link while transmitted; other traffic can use other turns.",
                "vi": "Packet chiếm liên kết khi đang truyền; lưu lượng khác có thể dùng lượt khác."
              },
              "outcome": {
                "en": "The link carries A1 now without becoming reserved for the conversation.",
                "vi": "Liên kết đang truyền A1 nhưng không trở thành kênh dành riêng cho cả cuộc trao đổi."
              },
              "before": {
                "reservedForA": false,
                "linkUse": "none",
                "otherTrafficCanUseResource": true,
                "delivered": [],
                "complete": false,
                "released": false
              },
              "after": {
                "reservedForA": false,
                "linkUse": "A1",
                "otherTrafficCanUseResource": true,
                "delivered": [],
                "complete": false,
                "released": false
              }
            },
            {
              "id": "packet-interval",
              "title": {
                "en": "Use the next shared turn",
                "vi": "Dùng lượt chung tiếp theo"
              },
              "action": {
                "en": "A has no data now; let another conversation send B1.",
                "vi": "A chưa có dữ liệu mới; cho cuộc trao đổi khác gửi B1."
              },
              "why": {
                "en": "Unreserved capacity can carry useful traffic during A’s gap.",
                "vi": "Dung lượng không dành riêng có thể mang lưu lượng hữu ích trong khoảng nghỉ của A."
              },
              "outcome": {
                "en": "B1 uses the gap; A has no reserved idle channel.",
                "vi": "B1 dùng khoảng nghỉ; A không giữ một kênh nhàn rỗi dành riêng."
              },
              "before": {
                "reservedForA": false,
                "linkUse": "A1",
                "otherTrafficCanUseResource": true,
                "delivered": [],
                "complete": false,
                "released": false
              },
              "after": {
                "reservedForA": false,
                "linkUse": "B1",
                "otherTrafficCanUseResource": true,
                "delivered": [],
                "complete": false,
                "released": false
              }
            },
            {
              "id": "packet-share-last",
              "title": {
                "en": "Send the final packet",
                "vi": "Gửi packet cuối"
              },
              "action": {
                "en": "Transmit A2 in a later shared turn.",
                "vi": "Truyền A2 trong một lượt dùng chung sau đó."
              },
              "why": {
                "en": "Sharing does not promise a fixed wait or a dedicated rate.",
                "vi": "Dùng chung không cam kết thời gian chờ cố định hay tốc độ dành riêng."
              },
              "outcome": {
                "en": "All A packets have been sent in this teaching schedule.",
                "vi": "Mọi packet A đã được gửi theo lịch minh họa này."
              },
              "before": {
                "reservedForA": false,
                "linkUse": "B1",
                "otherTrafficCanUseResource": true,
                "delivered": [],
                "complete": false,
                "released": false
              },
              "after": {
                "reservedForA": false,
                "linkUse": "A2",
                "otherTrafficCanUseResource": true,
                "delivered": [],
                "complete": false,
                "released": false
              }
            },
            {
              "id": "packet-deliver",
              "title": {
                "en": "Receive all packets",
                "vi": "Nhận đủ packet"
              },
              "action": {
                "en": "Receive the complete set of A packets.",
                "vi": "Nhận đầy đủ các packet A."
              },
              "why": {
                "en": "Reconstruction requires all necessary data, even if arrival order differs.",
                "vi": "Khôi phục đòi hỏi đủ dữ liệu cần thiết, dù thứ tự đến có thể khác."
              },
              "outcome": {
                "en": "All A units are now present at the receiver.",
                "vi": "Bên nhận hiện có đầy đủ đơn vị A."
              },
              "before": {
                "reservedForA": false,
                "linkUse": "A2",
                "otherTrafficCanUseResource": true,
                "delivered": [],
                "complete": false,
                "released": false
              },
              "after": {
                "reservedForA": false,
                "linkUse": "none",
                "otherTrafficCanUseResource": true,
                "delivered": [
                  "A1",
                  "A2"
                ],
                "complete": false,
                "released": false
              }
            },
            {
              "id": "packet-reassemble",
              "title": {
                "en": "Reconstruct and compare",
                "vi": "Khôi phục và so sánh"
              },
              "action": {
                "en": "Check completeness and put the units in their original order.",
                "vi": "Kiểm tra đủ dữ liệu rồi xếp các đơn vị theo thứ tự ban đầu."
              },
              "why": {
                "en": "Shared transport can require receiver buffering and ordering.",
                "vi": "Truyền qua mạng dùng chung có thể cần đệm và sắp thứ tự tại bên nhận."
              },
              "outcome": {
                "en": "A’s message is complete. There is no dedicated circuit reservation to release.",
                "vi": "Thông điệp A hoàn chỉnh. Không có circuit dành riêng cần giải phóng."
              },
              "before": {
                "reservedForA": false,
                "linkUse": "none",
                "otherTrafficCanUseResource": true,
                "delivered": [
                  "A1",
                  "A2"
                ],
                "complete": false,
                "released": false
              },
              "after": {
                "reservedForA": false,
                "linkUse": "none",
                "otherTrafficCanUseResource": true,
                "delivered": [
                  "A1",
                  "A2"
                ],
                "complete": true,
                "released": false
              }
            }
          ]
        }
      }
    }
  ]
} as const);

const L = (en: string, vi: string): Localized => ({ en, vi });
export const protocolScenarios: readonly NetworkScenarioOption[] = deepFreeze(canonical.protocols.map(item => ({ id: item.id, label: item.title })));
export const bittorrentScenarios: readonly NetworkScenarioOption[] = deepFreeze([
  { id: "complete", label: L("All required pieces remain available", "Các piece cần có vẫn có nguồn") },
  { id: "unavailable-piece", label: L("The only source of D leaves", "Nguồn duy nhất của D rời mạng") }
]);
export const packetRoutingScenarios: readonly NetworkScenarioOption[] = deepFreeze([
  { id: "reroute", label: L("An alternative next hop is supplied", "Có next hop thay thế trong bảng") },
  { id: "unavailable-route", label: L("No available next hop is supplied", "Bảng không có next hop khả dụng") }
]);
export const switchingScenarios: readonly NetworkScenarioOption[] = deepFreeze(canonical.switching.map(item => ({ id: item.id, label: item.title })));

const torrentTraces: readonly BitTorrentTrace[] = deepFreeze(canonical.bittorrent.map(item => ({
  ...item,
  label: bittorrentScenarios.find(option => option.id === item.id)!.label,
  convention: L("A–D are illustrative file pieces. Transfers copy verified pieces; the source retains its copy. The tracker supplies peer information, not file pieces.", "A–D là các piece minh họa. Mỗi lượt sao chép phần đã kiểm tra; nguồn giữ bản sao. Tracker cung cấp thông tin peer, không gửi piece tệp.")
})));
const routingTraces: readonly PacketRoutingTrace[] = deepFreeze(canonical.routing.map(item => ({
  ...item,
  label: packetRoutingScenarios.find(option => option.id === item.id)!.label,
  convention: L("An illustrative topology and event schedule, not a real network or timing result. Order labels support reassembly in this model; they are not claimed to be IP-header sequence fields. Forwarding uses the supplied routing rows.", "Đây là topology và lịch sự kiện minh họa, không phải mạng thực hay kết quả đo thời gian. Nhãn thứ tự phục vụ ghép lại trong mô hình, không phải khẳng định trường sequence trong IP header. Việc chuyển tiếp dùng các dòng định tuyến được cung cấp.")
})));
const switchingTraces: readonly SwitchingTrace[] = deepFreeze(canonical.switching.flatMap(item => (["circuit", "packet"] as const).map(method => ({
  id: item.id, method, title: item.title, demand: item.demand, units: item.units,
  preferredMethod: item.preferredMethod, reason: item.reason, ...item.traces[method],
  convention: L("Both methods carry the same demand. These are qualitative events, not seconds or measured rates. Control information is schematic; no byte-level packet layout is implied.", "Hai cơ chế truyền cùng nhu cầu. Đây là sự kiện định tính, không phải số giây hay tốc độ đo được. Thông tin điều khiển chỉ là sơ đồ, không mô tả bố trí byte của packet.")
}))));

export function protocolScenario(id: string): ProtocolScenario {
  const value = canonical.protocols.find(item => item.id === id);
  if (!value) throw new RangeError("Unsupported protocol scenario: " + id);
  return value;
}
export function bittorrentTrace(id: string): BitTorrentTrace {
  const value = torrentTraces.find(item => item.id === id);
  if (!value) throw new RangeError("Unsupported BitTorrent scenario: " + id);
  return value;
}
export function packetRoutingTrace(id: string): PacketRoutingTrace {
  const value = routingTraces.find(item => item.id === id);
  if (!value) throw new RangeError("Unsupported routing scenario: " + id);
  return value;
}
export function switchingTrace(scenarioId: string, method: SwitchingMethod): SwitchingTrace {
  const value = switchingTraces.find(item => item.id === scenarioId && item.method === method);
  if (!value) throw new RangeError("Unsupported switching scenario or method: " + scenarioId + "/" + String(method));
  return value;
}
