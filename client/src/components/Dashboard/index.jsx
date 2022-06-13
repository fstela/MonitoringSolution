import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { OptionsContext } from "../../screens/Options/context.jsx";
import { MODE_CREATE_SESSION, MODE_VIEW_SESSION } from "../../static.js";
const DashboardInitializer = () => {
    
    const navigate = useNavigate();
    const context = useContext(OptionsContext);
    useEffect(() => {switch(context?.mode) {
        case MODE_VIEW_SESSION:
            navigate("/session");
            return;
        case MODE_CREATE_SESSION:
            navigate("/create");
            return;
    }}, [context])

    return (<p>Loading...</p>)
}

export default DashboardInitializer;