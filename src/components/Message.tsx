import { useContext } from "react"
import { AuthContext } from "../contexts/AuthContext"
import { MessageModel } from "../models/Message"
import StringUtil from "../util/StringUtil"

export function classNames(...classes: any) {
    return classes.filter(Boolean).join(" ")
}

export function Message({ message }: { message: MessageModel }) {
    const { user } = useContext(AuthContext)

    return (
        <li
            className={classNames(
                "mt-1 mb-1 flex",
                user!.username === message.from_user.username ? "justify-start" : "justify-end"
            )}
        >
            <div
                className={classNames(
                    "relative max-w-xl rounded-lg px-2 py-1 text-gray-700 shadow",
                    user!.username === message.from_user.username ? "" : "bg-gray-100"
                )}
            >
                <div className="flex items-end">
                    <span className="block">{message.content}</span>
                    <span
                        className="ml-2"
                        style={{
                            fontSize: "0.6rem",
                            lineHeight: "1rem"
                        }}
                    >
                        {StringUtil.formatMessageTimestamp(message.timestamp)}
                    </span>
                </div>
            </div>
        </li>
    )
}
