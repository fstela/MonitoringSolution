import { BaseApi } from "./ApiService";
import {
  AddParticipantRequest,
  CreateSessionRequest,
  CreateSessionResponse,
  SessionData,
  SessionParticipant,
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
  public pushData = (data:  SessionData) => {
    return this.client.post<void>("session/data", data);
  }
}
