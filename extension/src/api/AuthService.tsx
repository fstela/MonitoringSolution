import { BaseApi } from "./ApiService";
import { AuthRequest, AuthResponse } from "./types";

export default class AuthService extends BaseApi {
  public auth = (data: AuthRequest) => {
    return this.client.post<AuthResponse>("auth", data);
  };
}
