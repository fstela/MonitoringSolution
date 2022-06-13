import React, { useEffect, useState } from "react";
import { BrowserRouter, MemoryRouter, Route, Router, Routes } from "react-router-dom";
import CreateSession from "../../components/Dashboard/CreateSession/index.jsx";
import DashboardInitializer from "../../components/Dashboard/index.jsx";
import ViewSession from "../../components/Dashboard/ViewSession/index.jsx";
import { OptionsContext } from "./context.jsx";

const Options = ()  => {
  const [state, setState] = useState({mode: undefined, token: undefined});

  useEffect(() => {
      chrome.storage.local.get(['mode', 'token'], (result) => {
        setState({mode: result?.mode, token: result?.token})
      });
  }, []);

  return (
    <OptionsContext.Provider value={state}>
    <MemoryRouter>
      <Routes >
        <Route path="/" element={<DashboardInitializer/>} />
        <Route path="/create" element={<CreateSession />} />
        <Route path="/session" element={<ViewSession/>} />
      </Routes>
    </MemoryRouter>
    </OptionsContext.Provider>
  );
}

export default Options;
