'use client'

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { GlobalContextType, SignalRState, UserState } from '../types/SignalRTypes';
import { signalRConnectionReducer } from '../reducers/SignalRReducer';
import { userReducer } from '../reducers/UserReducer';
import SignalRService from '../lib/SignalRService';

// 初始狀態
const initialUserState: UserState = {
    username: '',
    isLoggedIn: false,
};

const initialSignalRStatus: SignalRState = {
    signalRService: null,
};

// 創建 Context
export const GlobalContext = createContext<GlobalContextType>({
    userState: initialUserState,
    userDispatch: () => undefined,
    signalRState: initialSignalRStatus,
    signalRDispatch: () => undefined
});

// Context Provider 組件
export const GlobalContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [userState, userDispatch] = useReducer(userReducer, initialUserState);
    const [signalRState, signalRDispatch] = useReducer(signalRConnectionReducer, initialSignalRStatus);

    // 啟動 SignalR 連線的函數
    const startSignalRConnection = (username: string) => {
        const signalRService = new SignalRService(username, signalRDispatch);
        signalRService.createUserRoomConnection();
        signalRService.startConnection().then((success) => {
            if (success) {
                signalRDispatch({ type: "SET_SIGNALR_SERVICE", payload: signalRService });
            }
        });
    };

    // 用戶登入處理
    const handleLogin = (username: string) => {
        userDispatch({ type: "LOGIN", payload: username });
        startSignalRConnection(username);
    };

    // 用戶登出處理
    const handleLogout = async () => {
        if (signalRState.signalRService) {
            await signalRState.signalRService.removeUserConnection();
            signalRDispatch({ type: "REMOVE_SIGNALR_CONNECTION", payload: null });
        }
        userDispatch({ type: "LOGOUT" });
    };

    const contextValue: GlobalContextType = {
        userState,
        userDispatch,
        signalRState,
        signalRDispatch,
    };

    return (
        <GlobalContext.Provider value={contextValue}>
            {children}
        </GlobalContext.Provider>
    );
};

// 自定義 Hook 來使用 Context
export const useGlobalContext = () => {
    const context = useContext(GlobalContext);
    if (!context) {
        throw new Error('useGlobalContext must be used within a GlobalContextProvider');
    }
    return context;
}; 