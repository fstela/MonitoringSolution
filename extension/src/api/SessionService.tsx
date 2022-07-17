import { BaseApi } from "./ApiService";
import {
  AddParticipantRequest,
  CreateSessionRequest,
  CreateSessionResponse,
  SessionInfo,
  SessionMonitoringData,
  SessionMonitoringParticipant,
  SessionParticipant,
  SessionParticipantInfo,
  SessionParticipantMonitoring,
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
  public deleteParticipant = (id: number) => {
    return this.client.delete<void>(`sessions/participants/${id}`);
  }
  public getSessionParticipant = () => {
    return this.client.get<SessionParticipantInfo>("sessions/participant");
  }
  public getSessionInfo = () => {
    return this.client.get<SessionInfo>("sessions")
  }
  public updateAllowedWebsited = (urls: string[]) => {
    return this.client.post("sessions/allowed-urls", {urls})
  }
  public getSessionMonitoringData = () => {
    return this.client.get<SessionMonitoringData>("sessions/monitoring/participants")
  }
  public getParticipantMonitoringData = (id: number | string) => {
    return this.client.get<SessionParticipantMonitoring[]>("/sessions/monitoring/participants/" + id);
  }
}
