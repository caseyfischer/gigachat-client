import { useContext, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'
import { UserModel } from '../models/User'
import StringUtil from '../util/StringUtil'

interface UserResponse {
    username: string
    name: string
    url: string
}

export function Conversations() {
    const { user } = useContext(AuthContext)
    const [users, setUsers] = useState<UserResponse[]>([])
    const navigate = useNavigate()

    useEffect(() => {
        async function fetchUsers() {
            const res = await fetch("http://127.0.0.1:8000/api/users/all", {
                headers: {
                    Authorization: `Token ${user?.token}`
                }
            })
            const data = await res.json()
            setUsers(data)
        }
        fetchUsers()
    }, [user])

    return (
        <div>
            {users
                .filter((u: UserResponse) => u.username !== user?.username)
                .map((u : UserResponse) => (
                    <Link to={`chats/${StringUtil.createConversationName(user!.username, u.username)}`}>
                        <div key={u.username}>{u.username}</div>
                    </Link>
                ))}
        </div>
    )
}
