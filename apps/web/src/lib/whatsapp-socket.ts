import { io, type Socket } from "socket.io-client"
import { getAccessToken } from "./api-client"

export function connectWhatsAppSocket(): Socket {
  return io("/whatsapp", {
    auth: { token: getAccessToken() },
    transports: ["websocket"],
  })
}
