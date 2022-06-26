import React, { useState, useRef, useContext, useEffect } from "react";

import imgProf from "@assets/img/prof.png";
import imgStud from "@assets/img/stud.png";
import {
  VIEW_CREATE_SESSION,
  VIEW_DATA_RECORDING,
  VIEW_SESSION_MONITORING,
} from "@src/pages/options/views";
import { getUserMediaStream } from "@src/service/media";
import SessionService from "@src/api/SessionService";
import { createClient } from "@src/api/ApiService";

const WINDOW_MONITORING_ID_KEY = "monitoring_window_id";
const Authentication = () => {
  const [isStudent, setIsStudent] = useState(true);
  const [activeMonitoringWindowId, setActiveMonitoringWindowId] = useState<
    undefined | number
  >(undefined);
  useEffect(() => {
    checkForActiveMonitoring();
  }, []);

  const checkForActiveMonitoring = () => {
    chrome.storage.local.get(WINDOW_MONITORING_ID_KEY, (items) => {
      console.log(items);
      if (items[WINDOW_MONITORING_ID_KEY]) {
        console.log("Active monitoring window found");
        setActiveMonitoringWindowId(items[WINDOW_MONITORING_ID_KEY]);
      }
    });
  };

  const forceCloseMonitoringWindow = () => {
    if (activeMonitoringWindowId) {
      chrome.windows
        .remove(activeMonitoringWindowId)
        .then(
          () => {
            setActiveMonitoringWindowId(undefined);
          },
          () => {
            setActiveMonitoringWindowId(undefined);
          }
        )
        .catch(() => {
          setActiveMonitoringWindowId(undefined);
        });
    } else {
      // the window id was left behind so there is no monitoring in progress
      setActiveMonitoringWindowId(undefined);
    }
  };

  const onMonitoringActivated = (windowId: number) => {
    setActiveMonitoringWindowId(windowId);
  };

  return (
    <section className="p-10">
      {activeMonitoringWindowId && (
        <>
          <h1 className="text-lg font-bold">Monitoring in progress!</h1>
          <h1 className="text-lg">
            Looks like you have a monitoring in progress, please continue in the
            pop-up window
          </h1>
          <button
            className={`btn btn-active btn-primary mt-5`}
            onClick={forceCloseMonitoringWindow}
          >
            Force close monitoring
          </button>
        </>
      )}
      {!activeMonitoringWindowId && (
        <>
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
          {!isStudent ? (
            <TeacherForm />
          ) : (
            <StudentForm onMonitoringActivated={onMonitoringActivated} />
          )}
        </>
      )}
    </section>
  );
};

const TeacherForm: React.FC = () => {
  const [token, setToken] = useState<string | undefined>(undefined);
  const handleCreateSession = () => {
    chrome.tabs.create({
      active: true,
      url: `${chrome.runtime.getURL(
        "src/pages/options/index.html"
      )}?page=create`,
    });
  };
  const handleConnect = () => {
    if (token) {
      chrome.storage.local.set({ token }).then(() => {
        console.log(token);
        chrome.tabs.create({
          active: true,
          url: `${chrome.runtime.getURL(
            "src/pages/options/index.html"
          )}?page=view`,
        });
      });
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
              onChange={(e) => setToken(e.target.value)}
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

const StudentForm: React.FC<{
  onMonitoringActivated: (windowId: number) => void;
}> = ({ onMonitoringActivated }) => {
  const [token, setToken] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<undefined | string>();
  const [port, setPort] = useState<undefined | chrome.runtime.Port>(undefined);

  useEffect(() => {
    connectToPort();
  }, []);

  const connectToPort = () => {
    const portConn = chrome.runtime.connect({ name: "monitoring" });
    portConn.onDisconnect.addListener(connectToPort);
    portConn.onMessage.addListener((msg) => {
      console.log("received", msg, "from bg");
    });
    setPort(portConn);
  };

  const verifyToken = () => {
    if (!token || token.length < 2) {
      setError("Invalid token");
      return;
    }

    setIsLoading(true);

    const clinet = createClient(token);
    const service = new SessionService(clinet);

    service
      .getSessionParticipant()
      .then(
        (response) => {
          if (response.status === 200) {
            handleConnect();
          } else {
            console.log(response);
            setError("Invalid token");
            setIsLoading(false);
          }
        },
        (err) => {
          console.log(err);
          setError("Invalid token");
          setIsLoading(false);
        }
      )
      .catch((err) => {
        console.log(err);
        setError("Invalid token");
        setIsLoading(false);
      });
  };

  const handleConnect = () => {
    // if port is not availabile
    if (port === undefined) {
      setError("Error, please restart your browser");
      setIsLoading(false);
      return;
    }

    var url = chrome.runtime.getURL("src/pages/options/index.html");

    chrome.storage.local.set({ token }).then(() => {
      chrome.windows.create(
        {
          url: `${url}?page=recording`,
          width: 600,
          height: 480,
          type: "popup",
        },
        (wind) => {
          if (wind && wind.id) {
            port.postMessage({
              action: "MONITORING_WINDOW_ACTIVATED",
              id: wind.id,
            });
            chrome.storage.local.set({ [WINDOW_MONITORING_ID_KEY]: wind.id });
            onMonitoringActivated(wind.id);
          } else {
            setError("Invalid token");
            setIsLoading(false);
          }
        }
      );
    });
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
              onChange={(e) => setToken(e.target.value)}
            />

            <button
              className={`btn btn-active btn-primary ${isLoading && "loading"}`}
              onClick={verifyToken}
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
