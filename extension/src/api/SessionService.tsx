import { BaseApi } from "./ApiService";
import {
  AddParticipantRequest,
  CreateSessionRequest,
  CreateSessionResponse,
  SessionParticipant,
  SessionParticipantInfo,
} from "./types";

export default class SessionService extends BaseApi {
  public createSession = (data: CreateSessionRequest) => {
    return this.client.post<CreateSessionResponse>("sessions", data);
  };
  public getParticipants = () => {
    return this.client.get<SessionParticipant[]>("sessions/participants");
  };
  public addParticipants = (emails: AddParticipantRequest[]) => {
    return this.client.post<void>("sessions/participants", emails);
  };
  public getSessionParticipant = () => {
    return this.client.get<SessionParticipantInfo>("sessions/participant");
  }
}
