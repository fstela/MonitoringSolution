import React, { useState, useRef, useContext, useEffect } from "react";

import imgProf from "@assets/img/prof.png";
import imgStud from "@assets/img/stud.png";
import { VIEW_CREATE_SESSION, VIEW_DATA_RECORDING, VIEW_SESSION_MONITORING } from "@src/pages/options/views";
import { getUserMediaStream } from "@src/service/media";
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
    chrome.tabs.create({
      active: true,
      url: `${chrome.runtime.getURL("src/pages/options/index.html")}?page=create`
    })
  };
  const handleConnect = () => {
    if(token) {
    chrome.tabs.create({
      active: true,
      url: `${chrome.runtime.getURL("src/pages/options/index.html")}?page=view`
    })
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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<undefined | string>();


  // const checkDeviceAccess = () => {
  //   chrome.storage.local.get(["media_device_access"], result => {
  //     if(result?.media_device_access !== undefined) {
  //       if(result.media_device_access === DEVICE_MEDIA_ACCESS_REQUESTED) {
  //         setIsLoading(true);
  //       }
  //       if(result.media_device_access === DEVICE_MEDIA_ACCESS_DECLINED) {
  //         // can't access to media devices
  //         setIsLoading(false);
  //         setError("Error! You must allow access to camera and microphone");
  //       }
  //       if(result.media_device_access === DEVICE_MEDIA_ACCESS_ACCEPTED) {
  //         const media = getUserMediaStream();
  //         console.log(media);
  //         chrome.runtime.sendMessage("ceva")
  //         return;
  //       }
       
  //     }
  //     openRequestPermissionsPage();
  //   });
  // }

  // const openRequestPermissionsPage = () => {
  //   chrome.storage.local.set({ view: VIEW_MEDIA_ACCESS, media_device_access: DEVICE_MEDIA_ACCESS_REQUESTED });
  //   chrome.runtime.openOptionsPage();
  //   setIsLoading(true);
  // }


  const handleConnect = () => {
    chrome.storage.local.set({ view: VIEW_DATA_RECORDING});
    var url = chrome.runtime.getURL("src/pages/options/index.html");
    // console.log(url);
    // window.open(`${url}?session=true`, "", "width=600,height=480,toolbar=no,menubar=no,resizable=yes")
    chrome.windows.create({
      url: `${url}?page=recording`,
      width: 600,
      height: 480,
      type: "popup",
      
    }, (wind) => {
      if(wind) {
        chrome.storage.local.set({recordingWindowId: wind.id});
      } else {
        alert("Something went wrong")
      }
    })
    // checkDeviceAccess();
    setIsLoading(true);
  }

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
              className={`btn btn-active btn-primary ${isLoading && "loading"}`}
              onClick={handleConnect}
            >
              Connect
            </button>
          </div>
          {error && <p className="text-red-500">{error}</p>}
        </div>
      </div>
    </>
  );
};

export default Authentication;
