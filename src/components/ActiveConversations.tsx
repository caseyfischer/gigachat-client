import { useContext, useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { AuthContext } from "../contexts/AuthContext"
import { ConversationModel } from "../models/Conversation"
import StringUtil from "../util/StringUtil"

export function ActiveConversations() {
    const { user } = useContext(AuthContext)
    const [conversations, setActiveConversations] = useState<ConversationModel[]>([])

    useEffect(() => {
        async function fetchUsers() {
            const res = await fetch("http://127.0.0.1:8000/api/conversations/", {
                headers: {
                    Authorization: `Token ${user?.token}`
                }
            })
            const data = await res.json()
            setActiveConversations(data)
        }
        fetchUsers()
    }, [user])

    return (
        <div>
            {conversations.map((c) => (
                <Link
                    to={`/chats/${StringUtil.createConversationName(user!.username, c.other_user.username)}`}
                    key={c.other_user.username}
                >
                    <div className="border border-gray-200 w-full p-3">
                        <h3 className="text-xl font-semibold text-gray-800">{c.other_user.username}</h3>
                        <div className="flex justify-between">
                            <p className="text-gray-700">{c.last_message?.content}</p>
                            <p className="text-gray-700">{StringUtil.formatMessageTimestamp(c.last_message?.timestamp || null)}</p>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    )
}
