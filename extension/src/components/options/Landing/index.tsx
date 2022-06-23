import OptionsContext from "@src/pages/options/context";
import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { VIEW_CREATE_SESSION, VIEW_MEDIA_ACCESS, VIEW_SESSION_MONITORING } from "@src/pages/options/views";
import { ROUTE_CREATE_SESSION, ROUTE_VIEW_SESSION, ROUTE_REQUEST_DEVICE_MEDIA_ACCESS } from "@src/pages/options/routes";

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const context = useContext(OptionsContext);
  useEffect(() => {
    switch (context?.view) {
      case VIEW_SESSION_MONITORING:
        navigate(ROUTE_VIEW_SESSION);
        return;
      case VIEW_CREATE_SESSION:
        navigate(ROUTE_CREATE_SESSION);
        return;
      case VIEW_MEDIA_ACCESS:
        navigate(ROUTE_REQUEST_DEVICE_MEDIA_ACCESS);
        return;
    }
  }, [context]);

  return <p>Loading... {JSON.stringify(context)}</p>;
};

export default Landing;
