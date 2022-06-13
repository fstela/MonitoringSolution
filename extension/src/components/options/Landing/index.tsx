import OptionsContext from "@src/pages/options/context";
import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { VIEW_CREATE_SESSION, VIEW_SESSION_MONITORING } from "@src/pages/options/views";

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const context = useContext(OptionsContext);
  useEffect(() => {
    switch (context?.view) {
      case VIEW_SESSION_MONITORING:
        navigate("/session");
        return;
      case VIEW_CREATE_SESSION:
        navigate("/create");
        return;
    }
  }, [context]);

  return <p>Loading... {JSON.stringify(context)}</p>;
};

export default Landing;
