import React from "react";
import { ViewType } from "@src/pages/options/views";
import SessionService from "@src/api/SessionService";
export type OptionsContextValue = {
  view: ViewType | undefined;
  token: undefined | string;
  sessionService: undefined | SessionService;
  setToken: (token: string) => void;
};
const OptionsContext = React.createContext<OptionsContextValue>({
  view: undefined,
  token: undefined,
  sessionService: undefined,
  setToken: (token: string) => {}
});

export default OptionsContext;
