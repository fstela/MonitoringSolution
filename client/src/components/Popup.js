import React from "react";

function Popup() {
  return (
    <div styles={styles.main}>
      <h1>Welcome to a safe examination solution</h1>
      <p>Choose an account type</p>
    </div>
  );
}
const styles = {
  main: {
    width: "300px",
    height: "600px",
  },
};
export default Popup;
