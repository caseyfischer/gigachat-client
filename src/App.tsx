import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Chat from "./components/Chat"
import { Conversations } from './components/Conversations'
import { Login } from "./components/Login"
import { NavigationBar } from './components/NavigationBar'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AuthContextProvider } from './contexts/AuthContext'
import { ActiveConversations } from './components/ActiveConversations'

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={
                        <AuthContextProvider>
                            <NavigationBar />
                        </AuthContextProvider>
                    }
                >
                    <Route path="" element={
                        <ProtectedRoute>
                            <Conversations />
                        </ProtectedRoute>
                    } />
                    <Route path="login" element={<Login />} />
                    <Route path="chats/:conversationName" element={<Chat />} />
                    <Route
                        path="conversations/" element={
                            <ProtectedRoute>
                                <ActiveConversations />
                            </ProtectedRoute>
                        }
                    />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}
