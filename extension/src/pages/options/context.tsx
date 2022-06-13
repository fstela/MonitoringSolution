import React from "react";
import { ViewType } from "@src/pages/options/views";

const OptionsContext = React.createContext<{view: ViewType | undefined, token: string | undefined}>({view: undefined, token: undefined });

export default OptionsContext;