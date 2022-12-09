import React, { useState, useContext } from 'react'
import useWebSocket, { ReadyState } from 'react-use-websocket'
import { AuthContext } from '../contexts/AuthContext'
import { useParams, useNavigate } from 'react-router-dom'
import { MessageModel } from "../models/Message"
import { Message } from "./Message"
import InfiniteScroll from 'react-infinite-scroll-component'
import { ChatLoader } from './ChatLoader'


export default function Chat() {
    const [welcomeMessage, setWelcomeMessage] = useState("")
    const [message, setMessage] = useState("")
    const [messageHistory, setMessageHistory] = useState<any>([])
    const { user } = useContext(AuthContext)
    const { conversationName } = useParams()
    const [page, setPage] = useState(2)
    const [hasMoreMessages, setHasMoreMessages] = useState(false)

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
                    setMessageHistory((prev:any) => [data.message, ...prev])
                    break
                case "last_50_messages":
                    setMessageHistory(data.messages)
                    setHasMoreMessages(data.has_more)
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

    async function fetchMessages() {
        console.log("fetching messages!")
        const res = await fetch(
            `http://127.0.0.1:8000/api/messages/?conversation=${conversationName}&page=${page}`,
            {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    Authorization: `Token ${user?.token}`
                }
            }
        )
        if (res.status === 200) {
            const data: {
                count: number
                next: string | null // URL
                previous: string | null // URL
                results: MessageModel[]
            } = await res.json()
            setHasMoreMessages(data.next !== null)
            setPage(page + 1)
            setMessageHistory((prev: MessageModel[]) => prev.concat(data.results))
        }
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
                <div
                    id="scrollableDiv"
                    className="h-[20rem] mt-3 flex flex-col-reverse relative w-full border border-gray-200 overflow-y-auto p-6"
                    >
                    <div>
                        {/* Put the scroll bar always on the bottom */}
                        <InfiniteScroll
                        dataLength={messageHistory.length}
                        next={fetchMessages}
                        className="flex flex-col-reverse" // To put endMessage and loader to the top
                        inverse={true}
                        hasMore={hasMoreMessages}
                        loader={<ChatLoader />}
                        scrollableTarget="scrollableDiv"
                        >
                        {messageHistory.map((message: MessageModel) => (
                            <Message key={message.id} message={message} />
                        ))}
                        </InfiniteScroll>
                    </div>
                </div>
            </ul>
        </div>
    )
}
