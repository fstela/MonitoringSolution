import React from "react";
import { render } from "react-dom";

function Popup() {
  return (
    <div>
      <h1>hellooo</h1>
      <p>simple popup</p>
    </div>
  );
}
render(<Popup/>, document.getElementById("react-target"));
