import { UserState, UserAction } from '../types/SignalRTypes';

export const userReducer = (state: UserState, action: UserAction): UserState => {
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