import React, { createContext, ReactNode, useContext, useState } from "react"
import useWebSocket, { ReadyState } from "react-use-websocket"

import { AuthContext } from "./AuthContext"
// import { useWebSocket } from "react-use-websocket/dist/lib/use-websocket"

const DefaultProps = {
    unreadMessageCount: 0,
    connectionStatus: "Uninstantiated"
}

export interface NotificationProps {
    unreadMessageCount: number,
    connectionStatus: string
}

export const NotificationContext = createContext<NotificationProps>(DefaultProps)

export const NotificationContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useContext(AuthContext)
    const  [unreadMessageCount, setUnreadMessageCount] = useState(0)

    const { readyState } = useWebSocket(user ? "ws://127.0.0.1:8000/notifications/" : null, {
        queryParams: {
            token: user ? user.token : ''
        },
        onOpen: () => {
            console.log("beep boop. connected to notifications!")
        },
        onClose: () => {
            console.log("BLEEEEEEEP. disconnected from notifications :(")
        },
        onMessage: (e) => {
            const data = JSON.parse(e.data)
            switch (data.type) {
                case "unread_count":
                    setUnreadMessageCount(data.unread_count)
                    break
                case "new_message_notification":
                    setUnreadMessageCount(unreadMessageCount + 1)
                    break
                default:
                    console.error("unknown message type")
                    break
            }
        }
    })
        
    const connectionStatus = {
        [ReadyState.CLOSED]: "Closed",
        [ReadyState.CLOSING]: "Closing",
        [ReadyState.OPEN]: "Open",
        [ReadyState.UNINSTANTIATED]: "Uninstantiated",
        [ReadyState.CONNECTING]: "Connecting"
    }[readyState]
        
        
    return (
            <NotificationContext.Provider value={{ unreadMessageCount, connectionStatus }}>
                {children}
            </NotificationContext.Provider>
        )
}
