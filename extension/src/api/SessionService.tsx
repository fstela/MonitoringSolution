import { BaseApi } from "./ApiService";
import { CreateSessionRequest, CreateSessionResponse, SessionParticipant } from "./types";

export default class SessionService extends BaseApi {
    public createSession = (data: CreateSessionRequest) => {
        return this.client.post<CreateSessionResponse>("sessions", data);
    }
    public getParticipants = () => {
        return this.client.get<SessionParticipant[]>("sessions/participants");
    }
}