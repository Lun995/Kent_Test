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

// 新增 celltype 與全域變數 changeMeal 相關的類型定義
interface DisplayState {
    celltype: '3' | '4'; // 3列或4列
    changeMeal: number;  // 0/1，預設0
}

interface DisplayAction {
    type: 'SET_CELLTYPE' | 'SET_CHANGE_MEAL';
    payload: any;
}

interface GlobalContextType {
    userState: UserState;
    userDispatch: React.Dispatch<UserAction>;
    displayState: DisplayState;
    displayDispatch: React.Dispatch<DisplayAction>;
}

// 初始狀態
const initialUserState: UserState = {
    username: '',
    isLoggedIn: false,
};

// 新增 displayState 初始狀態
const initialDisplayState: DisplayState = {
    celltype: '3', // 預設為3列
    changeMeal: 0
};

// 簡化的 userReducer
const userReducer = (state: UserState, action: UserAction): UserState => {
    switch (action.type) {
        case 'LOGIN':
            return {
                username: action.payload || 'Anonymous',
                isLoggedIn: true,
            };
        case 'LOGOUT':
            return {
                username: '',
                isLoggedIn: false,
            };
        default:
            return state;
    }
};

// 新增 displayReducer
const displayReducer = (state: DisplayState, action: DisplayAction): DisplayState => {
    switch (action.type) {
        case 'SET_CELLTYPE':
            return {
                ...state,
                celltype: action.payload,
            };
        case 'SET_CHANGE_MEAL':
            return {
                ...state,
                changeMeal: Number(action.payload) || 0,
            };
        default:
            return state;
    }
};

// 創建 Context
export const GlobalContext = createContext<GlobalContextType>({
    userState: initialUserState,
    userDispatch: () => undefined,
    displayState: initialDisplayState,
    displayDispatch: () => undefined,
});

// Context Provider 組件
export const GlobalContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [userState, userDispatch] = useReducer(userReducer, initialUserState);
    const [displayState, displayDispatch] = useReducer(displayReducer, initialDisplayState);

    const contextValue: GlobalContextType = {
        userState,
        userDispatch,
        displayState,
        displayDispatch,
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