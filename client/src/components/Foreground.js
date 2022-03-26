import React from "react";

function Foreground() {
  return (
    <div styles={styles.main}>
      <h1>hellooo foreground</h1>
    </div>
  );
}
const styles = {
  main: {
    position: "absolute",
    top: "50%",
    left: "50%",
    tranform: "translate(-50%,-50%)",
    zIndex: "1000",
    fontSize: "80px",
    pointerEvents: "none",
  },
};
export default Foreground;
