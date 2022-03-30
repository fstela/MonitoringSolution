import React from "react";
import Authentication from "../Authentication/authentication.jsx";
import "./popup.css";

const Popup = () => {
  return (
    <div style={styles.popup}>
      <Authentication style={styles.authForm} />
    </div>
  );
};

const styles = {
  main: {
    width: "700px",
    height: "700px",
  },
  popup: {
    width: "350px",
    height: "350px",
    position: "relative",
    backgroundColor: "white",
  },
  authForm: {
    display: "inline-block",
  },
};
export default Popup;
