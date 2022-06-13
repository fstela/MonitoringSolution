import React, { useState, useRef, useContext } from "react";

import imgProf from "@assets/img/prof.png";
import imgStud from "@assets//img/stud.png";
import { VIEW_CREATE_SESSION, VIEW_SESSION_MONITORING } from "@src/pages/options/views";
const Authentication = () => {
  const [isStudent, setIsStudent] = useState(true);
  // const [isLoading, setIsLoading] = useState(false);
  // const [authError, setAuthError] = useState(null);

  // const submitHandler = () => {
  //   setAuthError(null);
  //   setIsLoading(true);
  // };

  return (
    <section className="p-10">
      <h1 className="text-lg font-bold">Welcome!</h1>
      <h1 className="text-lg">Please enter your credentials</h1>
      <div className="mt-2">
        <p>
          Account type{" "}
          <span className="mr-1 text-primary">
            {isStudent ? "Student" : "Teacher"}
          </span>
        </p>
      </div>
      <div className="grid grid-cols-2 p-10">
        <div>
          <img
            src={imgProf}
            alt="Professor Illustration"
            className={`max-h-40 ${!isStudent && "border-2"}`}
            onClick={() => setIsStudent(false)}
          />
        </div>
        <div>
          <img
            src={imgStud}
            alt="Student Illustration"
            className={`max-h-40 ${isStudent && "border-2"}`}
            onClick={() => setIsStudent(true)}
          />
        </div>
      </div>
      {!isStudent ? <TeacherForm /> : <StudentForm />}
    </section>
  );
};

const TeacherForm: React.FC = () => {
  const [token, setToken] = useState<string|undefined>(undefined);
  const handleCreateSession = () => {
    chrome.storage.local.set({ view: VIEW_CREATE_SESSION });
    chrome.runtime.openOptionsPage();
  };
  const handleConnect = () => {
    if(token) {
    chrome.storage.local.set({ view: VIEW_SESSION_MONITORING, token: token });
    chrome.runtime.openOptionsPage();
    }
  };
  return (
    <>
      <div>
        <div className="form-control">
          <div className="input-group">
            <input
              type="text"
              placeholder="XXXXXX-XXXXX-XXXXX-XXXXX"
              className="input input-bordered w-full mb-2"
              onChange={e => setToken(e.target.value)}
            />
            <button
              className="btn btn-active btn-primary"
              onClick={handleConnect}
            >
              Connect
            </button>
          </div>
        </div>
        <div className="divider">OR</div>
      </div>
      <div>
        <button onClick={handleCreateSession} className="btn btn-ghost w-full">
          Create session
        </button>
      </div>
    </>
  );
};

const StudentForm: React.FC = () => {
  const handleConnect = () => {};
  return (
    <>
      <div>
        <div className="form-control">
          <div className="input-group">
            <input
              type="text"
              placeholder="XXXXXX-XXXXX-XXXXX-XXXXX"
              className="input input-bordered w-full mb-2"
            />
            <button
              className="btn btn-active btn-primary"
              onClick={handleConnect}
            >
              Connect
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Authentication;
