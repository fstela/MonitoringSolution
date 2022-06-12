import React from "react";
import { BrowserRouter, MemoryRouter, Route, Router, Routes } from "react-router-dom";
import Dashboard from "../../components/Dashboard/index.jsx";
import Session from "../../components/Dashboard/Session/index.jsx";


const Options = ()  => {
  return (
    <MemoryRouter>
      <Routes >
        <Route path="" element={<Dashboard />} />
        <Route path="/session" element={<Session/>} />
      </Routes>
    </MemoryRouter>
  );
}
const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "red",
  },
};
export default Options;
