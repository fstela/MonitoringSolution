
import { ROUTE_CREATE_SESSION, ROUTE_RECORDING, ROUTE_VIEW_SESSION } from "@src/pages/options/routes";
import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Landing: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    let params = (new URL(window.location.href)).searchParams;
    const page = params.get("page");
    if(page === "create") {
      navigate(ROUTE_CREATE_SESSION)
    }
    if(page === "view") {
      navigate(ROUTE_VIEW_SESSION)
    }
    if(page === "recording") {
      navigate(ROUTE_RECORDING)
    }
  }, [])

  return <p>...</p>;
};

export default Landing;
