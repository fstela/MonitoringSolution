import React from "react";


const Options = ()  => {
  return (
    <div>
      <h1>Teacher Dashboard</h1>
    </div>
    // <Router>
    //   <div styles={styles.container}>
    //     <div>
    //       <h1>Chrome ext options</h1>
    //       <nav>
    //         <ul>
    //           <li>
    //             <Link to="./">Options</Link>
    //           </li>
    //           <li>
    //             <Link to="/popup">Popup</Link>
    //           </li>
    //           <li>
    //             <Link to="/foreground">Foreground</Link>
    //           </li>
    //         </ul>
    //       </nav>
    //     </div>
    //     <Routes>
    //       <Route exact path="/popup">
    //         <Popup />
    //       </Route>
    //       <Route exact path="/foreground">
    //         <Foreground />
    //       </Route>
    //       <Route exact path="/">
    //         <Navigate to="/options.html" />
    //       </Route>
    //     </Routes>
    //   </div>
    // </Router>
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