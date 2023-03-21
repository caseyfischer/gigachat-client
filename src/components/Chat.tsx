import React, { useState, useContext, useEffect } from 'react'
import useWebSocket, { ReadyState } from 'react-use-websocket'
import { useHotkeys } from 'react-hotkeys-hook'
import { AuthContext } from '../contexts/AuthContext'
import { useParams, useNavigate } from 'react-router-dom'
import { MessageModel } from "../models/Message"
import { ConversationModel } from "../models/Conversation"
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
    const [participants, setParticipants] = useState<string[]>([])
    const [conversation, setConversation] = useState<ConversationModel | null>(null)

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
                case "user_join":
                    setParticipants((pcpts: string[]) => {
                        if (!pcpts.includes(data.user)) {
                            return [...pcpts, data.user]
                        }
                        return pcpts
                    })
                    break
                case "user_leave":
                    setParticipants((pcpts: string[]) => {
                        const newPcpts = pcpts.filter((x) => x!== data.user)
                        return newPcpts
                    })
                    break
                case "online_user_list":
                    setParticipants(data.users)
                    break
                default:
                    console.error("unknown message type")
                    break
            }
        }
    })

    useEffect(() => {
        async function fetchConversation() {
            const res = await fetch(`http://127.0.0.1:8000/api/conversations/${conversationName}`, {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    Authorization: `Token ${user?.token}`
                }
            })
            if (res.status === 200) {
                const data: ConversationModel = await res.json()
                setConversation(data)
            }
        }
        fetchConversation()
    }, [conversationName, user])

    const connectionStatus = {
        [ReadyState.CONNECTING]: "Connecting",
        [ReadyState.OPEN]: "Open",
        [ReadyState.CLOSING]: "Closing",
        [ReadyState.CLOSED]: "Closed",
        [ReadyState.UNINSTANTIATED]: "Uninstantiated"
    }[readyState]

    const inputReference: any = useHotkeys(
        "enter",
        () => {
            console.log(`pressed enter. message: ${message}`)
            handleSubmit()
        },
        {
            enableOnFormTags: true
        },
        [message]
    )
    
    useEffect(() => {
        (inputReference.current as HTMLElement).focus()
    }, [inputReference])

    function handleChangeMessage(e: any) {
        console.log(`message updated to ${e.target.value}`)
        setMessage(e.target.value)
    }

    function handleSubmit() {
        console.log(`submitting message: ${message}`)
        if (message.length === 0 || message.length > 512) {
            return;
        }
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
            {
                conversation && (
                    <div className="py-6">
                        <h3 className="text-3xl font-semibold text-gray-900">
                            Chat with user: {conversation.other_user.username}
                        </h3>
                        <span className="text-sm">
                            {conversation?.other_user.username} is currently
                            {participants.includes(conversation.other_user.username) ? " online" : " offline"}
                        </span>
                    </div>
                )
            }
            <div className="flex w-full items-center justify-between border border-gray-200 p-3">
                <input
                    type="text"
                    placeholder="Message"
                    className="block w-full rounded bg-gray-100 py-2 outline-none focus:text-gray-700"
                    name="message"
                    value={message}
                    onChange={handleChangeMessage}
                    required
                    ref={inputReference}
                    maxLength={511}
                    autoComplete="off"
                />
                <button className="ml-3 bg-gray-300 px-3 py-1" onClick={handleSubmit}>
                    Submit
                </button>
            </div>
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
