import { io, type Socket } from "socket.io-client"
import { getAccessToken } from "./api-client"

export function connectInboxSocket(): Socket {
  return io("/inbox", {
    auth: { token: getAccessToken() },
    transports: ["websocket"],
  })
}
