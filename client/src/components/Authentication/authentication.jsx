import React, { useState, useRef, useContext } from "react";
import "./authentication.css";

const Authentication = () => {
  const [isStudent, setIsStudent] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  const submitHandler = (event) => {
    event.preventDefault();
    setAuthError(null);
    setIsLoading(true);
  };

  return (
    <section style={styles.auth}>
      <h1 style={styles.title}>
        <b>Welcome! Please enter your credentials</b>
      </h1>
      {
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
      }

      <form onSubmit={submitHandler}>
        {!isStudent ? (
          <>
            <div>
              <div style={styles.control}>
                <label htmlFor="email" style={styles.labels}>
                  Token
                </label>
                <input type="email" id="email" style={styles.email} />
              </div>
              <div style={styles.actions}>
                <button style={styles.actionButton}>Connect</button>
              </div>
              <div style={styles.actions}>
                <p> — OR — </p>
              </div>
            </div>
            <div style={styles.error}>
              {authError && <p style={styles.errorDisplay}>{authError}</p>}
            </div>
            <div style={styles.actions}>
              <button style={styles.actionButtonCreate}>Create session</button>
            </div>
          </>
        ) : (
          <>
            <div>
              <div style={styles.control}>
                <label htmlFor="email" style={styles.labels}>
                  Token
                </label>
                <input type="email" id="email" style={styles.email} />
              </div>
              <div style={styles.actions}>
                <button style={styles.actionButtonStart}>Start session</button>
              </div>
            </div>
            <div style={styles.error}>
              {authError && <p style={styles.errorDisplay}>{authError}</p>}
            </div>
          </>
        )}
      </form>
    </section>
  );
};

const styles = {
  auth: {
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

  users: {
    display: "flex",
    justifyItems: "center",
    marginBottom: "10px",
    cursor: "pointer",
  },

  "users div:hover": {
    border: "1px solid #453daf",
  },

  logo: {
    width: "100%",
    height: "auto",
  },

  selectedUser: {
    width: "90%",
    height: "auto",
    border: "1px solid rgb(189, 189, 189)",
  },

  buttonSeparator: {
    marginTop: "1rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },

  title: {
    textAlign: "center",
    color: "rgb(0, 0, 0)",
    size: "1rem",
    fontSize: "1rem",
    fontWeight: "500",
    marginBottom: "2rem",
  },

  control: {
    marginBottom: "0.5rem",
    marginTop: "2rem",
  },

  accountType: {
    display: "flex",
  },

  accountChosen: {
    color: "red",
  },
  errorDisplay: {
    color: "red",
    margin: "20px",
    fontSize: "13px",
  },

  labels: {
    display: "block",
    fontSize: "12px",
    float: "left",
    fontWeight: "bold",
    marginBottom: "0.5rem",
  },

  labelToken: {
    display: "block",
    fontSize: "12px",
    float: "left",
    fontWeight: "bold",
    marginBottom: "0.5rem",
    color: "#6c6ca5",
  },

  email: {
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

  actions: {
    marginTop: "1rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },

  actionButton: {
    cursor: "pointer",
    font: "inherit",
    color: "#6c6ca5",
    fontWeight: "bold",
    backgroundColor: "#e8ecfc",
    border: "1px solid rgba(206, 203, 203, 0.411)",
    borderRadius: "4px",
    padding: "0.5rem 2.5rem",
  },

  actionButtonCreate: {
    cursor: "pointer",
    font: "inherit",
    fontWeight: "bold",
    color: "white",
    backgroundColor: "#453daf",
    border: "1px solid #0b00a5",
    borderRadius: "4px",
    padding: "0.5rem 2.5rem",
    width: "100%",
    float: "center",
    //marginLeft: "0.5rem",
  },

  actionButtonStart: {
    cursor: "pointer",
    font: "inherit",
    //fontWeight: "bold",
    color: "white",
    backgroundColor: "#453daf",
    border: "1px solid #0b00a5",
    borderRadius: "4px",
    padding: "0.5rem 2.5rem",
    marginTop: "0.7rem",
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
