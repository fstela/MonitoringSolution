import React, { useEffect, useState } from "react";
import "@pages/options/Options.css";
import OptionsContext from "./context";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Landing from "@src/components/options/Landing";
import { ROUTE_CREATE_SESSION, ROUTE_VIEW_SESSION } from "./routes";
import CreateSession from "@src/components/options/CreateSession";
import SessionMonitoring from "@src/components/options/SessionMonitoring";

const Options: React.FC = () => {
  const [state, setState] = useState({ view: undefined, token: undefined });

  useEffect(() => {
    chrome.storage.local.get(["view", "token"], (result) => {
      setState({ view: result?.view, token: result?.token });
    });
  }, []);

  return (
    <OptionsContext.Provider value={state}>
      <div className="navbar bg-primary text-primary-content">
        <div className="flex-1">
          <a className="btn btn-ghost normal-case text-xl">
            Monitoring Solution
          </a>
        </div>
        <div className="flex-none">
         
        </div>
      </div>
      <div className="container mx-auto">
        <MemoryRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path={ROUTE_CREATE_SESSION} element={<CreateSession />} />
            <Route path={ROUTE_VIEW_SESSION} element={<SessionMonitoring />} />
          </Routes>
        </MemoryRouter>
      </div>
    </OptionsContext.Provider>
  );
};

export default Options;
