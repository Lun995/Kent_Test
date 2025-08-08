import SignalRService from '../lib/SignalRService';

export interface SignalRState {
    signalRService: SignalRService | null;
}

export interface SignalRAction {
    type: 'SET_SIGNALR_SERVICE' | 'REMOVE_SIGNALR_CONNECTION';
    payload: SignalRService | null;
}

export interface UserState {
    username: string;
    isLoggedIn: boolean;
}

export interface UserAction {
    type: 'LOGIN' | 'LOGOUT';
    payload?: string;
}

export interface GlobalContextType {
    userState: UserState;
    userDispatch: React.Dispatch<UserAction>;
    signalRState: SignalRState;
    signalRDispatch: React.Dispatch<SignalRAction>;
} 