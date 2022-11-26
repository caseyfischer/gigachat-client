import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Chat from "./components/Chat";
import { Login } from "./components/Login";
import { NavigationBar } from './components/NavigationBar';

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<NavigationBar />}>
                    <Route path="" element={<Chat />} />
                    <Route path="login" element={<Login />} />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}
