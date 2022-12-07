
export default class StringUtil {
    static createConversationName(user1: string, user2: string) {
        const orderedNames = [user1.toLowerCase(), user2.toLowerCase()].sort()
        // like casey__lesster
        return `${orderedNames[0]}__${orderedNames[1]}`
    }

    static formatMessageTimestamp(timestamp: string | null) {
        if (timestamp === null) {
            return ""
        }
        const date = new Date(timestamp)
        const fullString = date.toLocaleTimeString()
        return fullString.split(":").slice(0, 2).join(":")
    }
}
