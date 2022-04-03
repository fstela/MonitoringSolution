import React, { useState, useRef, useContext } from "react";
//  import { useHistory, useLocation } from "react-router-dom";

// import AuthContext from "../store/auth-context";
// import axios from "../service/http";

import "./authentication.css";

// function useQuery() {
//   const { search } = useLocation();

//   return React.useMemo(() => new URLSearchParams(search), [search]);
// }

const Authentication = () => {
  //   let query = useQuery();
  //   const emailInputRef = useRef();
  //   const authCtx = useContext(AuthContext);
  //   const history = useHistory();
  const [isLogin, setIsLogin] = useState(true);
  const [isStudent, setIsStudent] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const switchAuthModeHandler = () => {
    setIsLogin((prevState) => !prevState);
  };
  const [authError, setAuthError] = useState(null);

  const submitHandler = (event) => {
    event.preventDefault();
    setAuthError(null);
    setIsLoading(true);
    // isLogin ? login() : register();
  };

  //   const register = () => {
  //     axios
  //       .post("/auth/register", {
  //         email: emailInputRef.current.value,
  //         password: passwordInputRef.current.value,
  //         userType: isStudent ? "student" : "teacher",
  //       })
  //       .then(
  //         (res) => {
  //           authCtx.login(res.data.token, res.data.userType);
  //           setIsLoading(false);
  //           history.push("/activity");
  //         },
  //         (err) => {
  //           setAuthError(err.response.data.error);
  //           setIsLoading(false);
  //         }
  //       )
  //       .catch((err) => {
  //         console.log(err);
  //         setAuthError("Server error");
  //         setIsLoading(false);
  //       });
  //   };

  //   const login = () => {
  //     axios
  //       .post("/auth/login", {
  //         email: emailInputRef.current.value,
  //         password: passwordInputRef.current.value,
  //       })
  //       .then(
  //         (res) => {
  //           authCtx.login(res.data.token, res.data.userType);
  //           setIsLoading(false);
  //           history.push("/activity");
  //         },
  //         (err) => {
  //           setAuthError(err.response.data.error);
  //           setIsLoading(false);
  //         }
  //       )
  //       .catch((err) => {
  //         console.log(err);
  //         setAuthError("Server error");
  //         setIsLoading(false);
  //       });
  //   };

  return (
    <section style={styles.auth}>
      <h1 style={styles.title}>
        <b>
          {isLogin
            ? "Welcome back! Log into your account"
            : "Hello! Register into our app"}
        </b>
      </h1>
      {!isLogin && (
        <>
          <div style={styles.accountType}>
            <p style={styles.labels}>
              Account type{" "}
              <span style={styles.accountChosen}>
                {isStudent ? "Student" : "Teacher"}
              </span>
            </p>
          </div>
          <div style={styles.users}>
            <div>
              <img
                style={!isStudent ? styles.selectedUser : styles.logo}
                src="media/LogoProf.png"
                alt="Logo prof"
                onClick={() => setIsStudent(false)}
              />
            </div>
            <div>
              <img
                style={isStudent ? styles.selectedUser : styles.logo}
                src="media/LogoStud.png"
                alt="Logo stud"
                onClick={() => setIsStudent(true)}
              />
            </div>
          </div>
        </>
      )}

      <form onSubmit={submitHandler}>
        <div>
          <div style={styles.control}>
            <label htmlFor="email" style={styles.labels}>
              Email address
            </label>
            <input type="email" id="email" style={styles.email} />
          </div>
          <div style={styles.control}>
            <label htmlFor="password" style={styles.labels}>
              Password
            </label>
            <input
              type="password"
              id="password"
              required
              style={styles.email}
              // ref={passwordInputRef}
            />
          </div>
        </div>
        <div style={styles.error}>
          {authError && <p style={styles.errorDisplay}>{authError}</p>}
        </div>
        <div style={styles.actions}>
          {!isLoading && (
            <button style={styles.actionButton}>
              {isLogin ? "Login" : "Create Account"}
            </button>
          )}
          {/* {isLoading && <p>Sending request...</p>} */}
          <button
            type="button"
            style={styles.toggle}
            onClick={switchAuthModeHandler}
          >
            {isLogin ? "Create new account" : "Log in with an existing account"}
          </button>
        </div>
      </form>
    </section>
  );
};

const styles = {
  "auth": {
    margin: "auto",
    width: "auto",
    borderRadius: "6px",
    backgroundColor: "none",
    padding: "1rem 2rem 2rem 2rem",
    textAlign: "center",
    display: "inline-block",
    color: "#453daf",
    marginTop: "1rem",
  },

  "users": {
    display: "flex",
    justifyItems: "center",
    marginBottom: "10px",
    cursor: "pointer",
  },

  "users div:hover": {
    border: "1px solid #453daf",
  },

  "logo": {
    width: "100%",
    height: "auto",
  },

  "selectedUser": {
    width: "90%",
    height: "auto",
    border: "1px solid rgb(189, 189, 189)",
  },

  "title": {
    textAlign: "center",
    color: "rgb(0, 0, 0)",
    size: "1rem",
    fontSize: "1rem",
    fontWeight: "500",
    marginBottom: "2rem",
  },

  "control": {
    marginBottom: "0.5rem",
    marginTop: "2rem",
  },

  "accountType": {
    display: "flex",
  },

  "accountChosen": {
    color: "red",
  },
  "errorDisplay": {
    color: "red",
    margin: "20px",
    fontSize: "13px",
  },

  "labels": {
    display: "block",
    fontSize: "12px",
    float: "left",
    fontWeight: "bold",
    marginBottom: "0.5rem",
  },

  "email": {
    font: "inherit",
    backgroundColor: "#ffffff",
    color: "#38015c",
    borderRadius: "4px",
    border: "1px solid rgba(206, 203, 203, 0.411)",
    width: "100%",
    textAlign: "left",
    padding: "0.35rem",
    // marginRight: "1rem",
    float: "center",
  },

  "actions": {
    marginTop: "1.5rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },

  "actionButton": {
    cursor: "pointer",
    font: "inherit",
    color: "white",
    backgroundColor: "#453daf",
    border: "1px solid #0b00a5",
    borderRadius: "4px",
    padding: "0.5rem 2.5rem",
  },

  "actions button:hover": {
    backgroundColor: "#6862be",
    borderColor: "#453daf",
  },

  "actions toggle": {
    marginTop: "1rem",
    backgroundColor: "transparent",
    color: "#453daf",
    border: "none",
    padding: "0.15rem 1.5rem",
  },

  "actions toggle:hover": {
    backgroundColor: "transparent",
    color: "#6862bec9",
  },
};

export default Authentication;
