import React, { useState, useContext } from 'react'
import useWebSocket, { ReadyState } from 'react-use-websocket'
import { AuthContext } from '../contexts/AuthContext'
import { useParams, useNavigate } from 'react-router-dom'
import { MessageModel } from "../models/Message"
import { Message } from "./Message"

export default function Chat() {
    const [welcomeMessage, setWelcomeMessage] = useState("")
    const [message, setMessage] = useState("")
    const [messageHistory, setMessageHistory] = useState<any>([])
    const { user } = useContext(AuthContext)
    const { conversationName } = useParams()
    const navigate = useNavigate()

    const { readyState, sendJsonMessage } = useWebSocket(user ? `ws://127.0.0.1:8000/${conversationName}/` : null, {
        queryParams: {
            token: user ? user.token : "",
        },
        onOpen: () => {
            console.log("connected")
        },
        onClose: () => {
            setWelcomeMessage("")
            console.log("disconnected")
        },
        onMessage: (e) => {
            const data = JSON.parse(e.data)
            console.log("received message")
            // TODO declare these strings as consts
            switch (data.type) {
                case "welcome_message":
                    setWelcomeMessage(data.message)
                    break
                case "chat_message_echo":
                    setMessageHistory((prev:any) => prev.concat(data.message))
                    break
                case "last_50_messages":
                    setMessageHistory(data.messages)
                    break
                default:
                    console.error("unknown message type")
                    break
            }
        }
    })

    const connectionStatus = {
        [ReadyState.CONNECTING]: "Connecting",
        [ReadyState.OPEN]: "Open",
        [ReadyState.CLOSING]: "Closing",
        [ReadyState.CLOSED]: "Closed",
        [ReadyState.UNINSTANTIATED]: "Uninstantiated"
    }[readyState]

    function handleChangeMessage(e: any) {
        setMessage(e.target.value)
    }

    function handleSubmit() {
        sendJsonMessage({
            type: "chat_message",
            message,
            name: user?.username
        })
        setMessage("")
    }

    return (
        <div>
            <span>The WebSocket is currently {connectionStatus}</span>
            <p>{welcomeMessage}</p>
            <input
                name="message"
                placeholder='Message'
                onChange={handleChangeMessage}
                value={message}
                className="ml-2 shadow-sm sm:text-sm border-gray-300 bg-gray-100 rounded-md"
            />
            <button
                className="bg-gray-300 px-3 py-1"
                onClick={handleSubmit}
            >
                Submit
            </button>
            <hr />
            <ul className="mt-3 flex flex-col-reverse relative w-full border border-gray-200 overflow-y-auto p-6">
                {messageHistory.map((message: any, idx: number) => (
                    <div className='border border-gray-200 py-3 px-3' key={idx}>
                        <Message key={message.id} message={message} />
                    </div>
                ))}
            </ul>
        </div>
    )
}
