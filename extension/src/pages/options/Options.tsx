import React, { useEffect, useState } from "react";
import "@pages/options/Options.css";
import OptionsContext, { OptionsContextValue } from "./context";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Landing from "@src/components/options/Landing";
import { ROUTE_CREATE_SESSION, ROUTE_VIEW_SESSION, ROUTE_REQUEST_DEVICE_MEDIA_ACCESS } from "./routes";
import CreateSession from "@src/components/options/CreateSession";
import ViewSession from "@src/components/options/ViewSession";
import SessionService from "@src/api/SessionService";
import { createClient } from "@src/api/ApiService";
import { Toaster } from "react-hot-toast";
import { DeviceMediaAccess } from "@src/components/options/DeviceMediaAccess";

const Options: React.FC = () => {
  const [state, setState] = useState<OptionsContextValue>({
    view: undefined,
    token: undefined,
    sessionService: undefined,
    setToken: (token: string) => {},
  });

  useEffect(() => {
    chrome.storage.local.get(["view", "token"], (result) => {
      setState({
        view: result?.view,
        token: result?.token,
        setToken: (token: string) => {
          setState({
            ...state,
            token,
            sessionService: new SessionService(createClient(token)),
          });
        },
        sessionService: new SessionService(createClient(result?.token)),
      });
    });
  }, [state]);

  return (
    <OptionsContext.Provider value={state}>
      <div className="navbar bg-primary text-primary-content">
        <div className="flex-1">
          <a className="btn btn-ghost normal-case text-xl">
            Monitoring Solution
          </a>
        </div>
        <div className="flex-none"></div>
      </div>
      <div className="container mx-auto">
        <MemoryRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path={ROUTE_CREATE_SESSION} element={<CreateSession />} />
            <Route path={ROUTE_VIEW_SESSION} element={<ViewSession />} />
            <Route path={ROUTE_REQUEST_DEVICE_MEDIA_ACCESS} element={<DeviceMediaAccess />} />
          </Routes>
        </MemoryRouter>
      </div>
      <Toaster />
    </OptionsContext.Provider>
  );
};

export default Options;
