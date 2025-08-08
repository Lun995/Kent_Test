import { SignalRState, SignalRAction } from '../types/SignalRTypes';

export const signalRConnectionReducer = (state: SignalRState, action: SignalRAction): SignalRState => {
    switch (action.type) {
        case "SET_SIGNALR_SERVICE":
            return { ...state, signalRService: action.payload };
        case "REMOVE_SIGNALR_CONNECTION":
            return { ...state, signalRService: null };
        default:
            return state;
    }
}; 