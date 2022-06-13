import axios, { AxiosInstance } from "axios";
import toast from "react-hot-toast";
export const createClient = (token: string): AxiosInstance => {
  const instance = axios.create({
    baseURL: "http://localhost:8080/api",
    headers: {
      Authorization: token,
    },
  });

  return instance;
};

export class BaseApi {
  protected client: AxiosInstance;
  constructor(client: AxiosInstance) {
    client.interceptors.response.use(
      undefined,
      (err) => {
        toast.error(err.errorMessage);
      }
    );
    this.client = client;
  }
}
