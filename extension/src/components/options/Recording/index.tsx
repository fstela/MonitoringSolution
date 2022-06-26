import { getUserMediaStream } from "@src/service/media";
import React, { useEffect, useRef, useState } from "react";
import moment from "moment";
import { SessionParticipantInfo } from "@src/api/types";
import { createClient } from "@src/api/ApiService";
import SessionService from "@src/api/SessionService";

// video encoding
const mimeType = "video/webm; codecs=vp8";

const WINDOW_MONITORING_ID_KEY = "monitoring_window_id";

const Recording: React.FC = () => {
  const video = useRef<HTMLVideoElement>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [sessionParticipantInfo, setSessionParticipantInfo] = useState<
    SessionParticipantInfo | undefined
  >(undefined);
  const [recorder, setRecorder] = useState<MediaRecorder | undefined>(
    undefined
  );
  const [timer, setTimer] = useState<
    undefined | ReturnType<typeof setInterval>
  >(undefined);
  const [error, setError] = useState<undefined | string>(undefined);
  const [port, setPort] = useState<undefined | chrome.runtime.Port>(undefined);
  const [step, setStep] = useState<
    "initial_message" | "access" | "monitoring" | "end"
  >("initial_message");

  const [sessionService, setSessionService] = useState<
    SessionService | undefined
  >(undefined);

  useEffect(() => {
    document.title = "Monitoring";
    connectToPort();
    chrome.storage.local.get(["token"], (items) => {
      console.log(items);
      if (items.token !== undefined) {
        const client = createClient(items.token);
        const service = new SessionService(client);
        setSessionService(service);
        getSessionData(service);
      } else {
        setError("Something went wrong, please retry");
      }
    });
  }, []);

  const getSessionData = (service: SessionService) => {
    service
      .getSessionParticipant()
      .then(
        (response) => {
          if (response.status === 200) {
            setSessionParticipantInfo(response.data);
          } else {
            setError("Invalid Session");
          }
        },

        () => setError("Invalid session")
      )
      .catch(() => setError("Invalid session"));
  };

  const connectToPort = () => {
    const portConn = chrome.runtime.connect({ name: "monitoring" });
    portConn.onDisconnect.addListener(connectToPort);
    portConn.onMessage.addListener((msg) => {
      console.log("received", msg, "from bg");
    });
    setPort(portConn);
  };


  const initRecording = (stream: MediaStream) => {
    if (!stream) {
      console.log("No media stream");
      return;
    }

    if (!port) {
      console.log("No extension port");
      return;
    }

    var rec = new MediaRecorder(stream, {
      // twick these settings for better quality/space ratio
      mimeType,
      audioBitsPerSecond: 100000,
      videoBitsPerSecond: 4000000,
    });

    rec.ondataavailable = pushData;
    rec.start();

    setRecorder(rec);
    setIsStarted(true);
    registerChunckingTimer(rec);

    port.postMessage({
      action: "START_MONITORING",
      // @todo pass the token from the popup, do precheck at mount time, throw error for invalid token
      token: "test",
    });
  };

  const registerChunckingTimer = (rec: MediaRecorder) => {
    var interval = setInterval(() => {
      console.log(rec);
      if (rec) {
        rec.stop();
        rec.start();
      }
    }, 10 * 1000);
    setTimer(interval);
  };

  const startMonitoring = () => {
    getUserMediaStream().then((response) => {
      if (response === false) {
        setError("No media acess granted");
        setStep("access")
        return;
      }
      if (video.current && response) {
        video.current.srcObject = response;
        initRecording(response);
        return;
      }
    });
  };


  const stopMonitoring = () => {
    setIsStarted(false);
    if (timer) {
      clearInterval(timer);
    }
    if (
      recorder !== undefined &&
      (recorder.state === "recording" || recorder.state === "paused")
    ) {
      recorder.stop();
    }
    setStep("end");
  };

  const closeWindow = () => {
    chrome.storage.local.get(WINDOW_MONITORING_ID_KEY, (items) => {
      if (items[WINDOW_MONITORING_ID_KEY]) {
        chrome.storage.local.set({ [WINDOW_MONITORING_ID_KEY]: undefined });
        chrome.windows.remove(items[WINDOW_MONITORING_ID_KEY]);
      }
    });
  };

  const pushData = (ev: BlobEvent) => {
    console.log(ev);
    if (!port) {
      console.log("No port");
      return;
    }
    const blob = new Blob([ev.data], { type: mimeType });
    blobToDataURL(blob).then((url) => {
      port.postMessage({
        action: "PUSH_MONITORING_FRAME",
        videoData: url,
      });
    });
  };

  const blobToDataURL = (blob: Blob): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (_e) => resolve(reader.result as string);
      reader.onerror = (_e) => reject(reader.error);
      reader.onabort = (_e) => reject(new Error("Read aborted"));
      reader.readAsDataURL(blob);
    });
  };

  return (
    <>
      {error && <p>{error}</p>}
      {!error && (
        <>
          {sessionParticipantInfo === undefined ? (
            <>loading...</>
          ) : (
            <>
              {step === "initial_message" && (
                <InitialMessageStep
                  sessionName={sessionParticipantInfo.session.title}
                  email={sessionParticipantInfo.email}
                  startTime={sessionParticipantInfo.session.startTime}
                  stopTime={sessionParticipantInfo.session.stopTime}
                  duration={sessionParticipantInfo.session.duration}
                  cancel={closeWindow}
                  next={() => setStep("access")}
                />
              )}
              {step === "access" && (
                <RequestAccessStep next={() => setStep("monitoring")} />
              )}
              {step === "monitoring" && (
                <MonitoringStep
                  isStarted={isStarted}
                  start={startMonitoring}
                  stop={stopMonitoring}
                  sessionParticipant={sessionParticipantInfo}
                >
                  <video
                    id="video"
                    height="100%"
                    width="100%"
                    autoPlay={true}
                    ref={video}
                    muted={true}
                  ></video>
                </MonitoringStep>
              )}
              {step === "end" && <EndStep end={closeWindow} />}
            </>
          )}
        </>
      )}
    </>
  );
};

const InitialMessageStep: React.FC<{
  sessionName: string;
  email: string;
  startTime: string;
  stopTime: string;
  duration: number;
  cancel: () => void;
  next: () => void;
}> = ({ sessionName, email, startTime, stopTime, duration, cancel, next }) => {
  const [sessionStatus, setSessionStatus] = useState<
    "in_progress" | "not_started" | "expired" | undefined
  >(undefined);

  useEffect(() => {
    calculateSessionStatus();
    const intervalId = setInterval(() => {
      calculateSessionStatus();
    }, 5000);
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const calculateSessionStatus = () => {
    const now = moment();
    if (now.isBetween(moment.unix(parseInt(startTime)), moment.unix(parseInt(stopTime)))) {
      setSessionStatus("in_progress");
      return;
    }
    if (now.isBefore(moment(parseInt(stopTime)))) {
      setSessionStatus("expired");
      return;
    }
    setSessionStatus("not_started");
  };

  return (
    <div className="p-10">
      <h1 className="font-bold text-lg mb-5">Hi! Welcome to {sessionName}</h1>
      <p>Your are logged as {email}</p>
      <p className="mt-2 mb-2">Start time {moment.unix(parseInt(startTime)).format("LLLL")}</p>
      <p className="mt-2 mb-2">End time {moment.unix(parseInt(stopTime)).format("LLLL")}</p>
      <p>You have {duration} minutes to complete the test</p>
      <button
        className="btn btn-active btn-primary mt-5 mr-3"
        onClick={next}
        disabled={sessionStatus !== "in_progress"}
      >
        Continue
      </button>
      <button onClick={cancel} className="btn btn-ghost">
        Cancel
      </button>
    </div>
  );
};

const RequestAccessStep: React.FC<{
  next: () => void;
}> = ({ next }) => {
  const [state, setState] = useState<"default" | "requested" | "error" | "ok">(
    "default"
  );

  const requestAccess = () => {
    setState("requested");
    getUserMediaStream()
      .then(
        (response) => {
          if (response) {
            setState("ok");
          } else {
            setState("error");
          }
        },
        () => setState("error")
      )
      .catch(() => setState("error"));
  };
  return (
    <>
      <h1>Camera and microphone access</h1>
      {state !== "ok" && (
        <>
          <p>
            You need to allow extension to access your microphone and camera
          </p>
          {state === "error" && (
            <p>
              Something went wrong, the permission request failed, try again
            </p>
          )}
          <button onClick={requestAccess} disabled={state === "requested"}>
            Request access
          </button>
        </>
      )}
      {state === "ok" && (
        <>
          <p>Access granted! You can continue to next step</p>
          <button onClick={next}>Continue</button>
        </>
      )}
    </>
  );
};

const MonitoringStep: React.FC<{
  children: JSX.Element;
  sessionParticipant: SessionParticipantInfo;
  isStarted: boolean;
  start: () => void;
  stop: () => void;
}> = ({ children, sessionParticipant, isStarted, start, stop }) => {
  return (
    <>
      <h1>Session {sessionParticipant.session.title}</h1>
      {children}
      {isStarted && (
        <>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsam
            fugiat, aspernatur, illum reiciendis consectetur labore pariatur
            facilis sapiente quae ut accusamus repudiandae laborum explicabo aut
            assumenda suscipit ipsum earum dicta.
          </p>
          <button onClick={start}>Start Monitoring</button>
        </>
      )}
      {!isStarted && (
        <>
          <p>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
          <button onClick={stop}>Stop Monitoring</button>
        </>
      )}
    </>
  );
};

const EndStep: React.FC<{ end: () => void }> = ({ end }) => {
  return (
    <>
      <h1>Thank you</h1>
      <p>
        Lorem, ipsum dolor sit amet consectetur adipisicing elit. Sequi cum
        minima vitae perspiciatis itaque debitis mollitia dolores quis, saepe,
        quaerat numquam alias nisi, fuga dignissimos. Dolor soluta omnis ab cum.
      </p>
      <button onClick={end}>Close</button>
    </>
  );
};

export default Recording;
