'use client'

import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// 簡化的類型定義
interface UserState {
    username: string;
    isLoggedIn: boolean;
}

interface UserAction {
    type: 'LOGIN' | 'LOGOUT';
    payload?: string;
}

interface GlobalContextType {
    userState: UserState;
    userDispatch: React.Dispatch<UserAction>;
}

// 初始狀態
const initialUserState: UserState = {
    username: '',
    isLoggedIn: false,
};

// 簡化的 userReducer
const userReducer = (state: UserState, action: UserAction): UserState => {
    switch (action.type) {
        case "LOGIN":
            return { 
                username: action.payload || 'Anonymous', 
                isLoggedIn: true 
            };
        case "LOGOUT":
            return { 
                username: '', 
                isLoggedIn: false 
            };
        default:
            return state;
    }
};

// 創建 Context
export const GlobalContext = createContext<GlobalContextType>({
    userState: initialUserState,
    userDispatch: () => undefined,
});

// Context Provider 組件
export const GlobalContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [userState, userDispatch] = useReducer(userReducer, initialUserState);

    const contextValue: GlobalContextType = {
        userState,
        userDispatch,
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