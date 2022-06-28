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
  const [isStarted, setIsStarted] = useState(false);
  const [stream, setStream] = useState<MediaStream | undefined>(undefined);
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
  const [token, setToken] = useState<undefined | string>(undefined);

  useEffect(() => {
    document.title = "Monitoring";
    connectToPort();
    chrome.storage.local.get(["token"], (items) => {
      console.log(items);
      if (items.token !== undefined) {
        const client = createClient(items.token);
        const service = new SessionService(client);
        getSessionData(service);
        setToken(items.token);
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

    if (!token) {
      console.log("No token");
      return;
    }

    var rec = new MediaRecorder(stream, {
      // twick these settings for better quality/space ratio
      mimeType,
      audioBitsPerSecond: 32000,
      videoBitsPerSecond: 8000000,
    });

    rec.ondataavailable = pushData;
    rec.start();

    setRecorder(rec);
    setIsStarted(true);
    registerChunckingTimer(rec);

    port.postMessage({
      action: "START_MONITORING",
      token,
    });
  };

  const registerChunckingTimer = (rec: MediaRecorder) => {
    var interval = setInterval(() => {
      if (rec) {
        rec.stop();
        setTimeout(() => {
          rec.start();
        }, 300);
      }
    }, 10 * 1000);
    setTimer(interval);
  };

  const startMonitoring = () => {
    getUserMediaStream().then((response) => {
      if (response === false) {
        setError("No media acess granted");
        setStep("access");
        return;
      }
      if (response) {
        console.log(response);
        setStream(response);
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
        chrome.storage.local.remove([WINDOW_MONITORING_ID_KEY]).then(() => {
          chrome.windows.remove(items[WINDOW_MONITORING_ID_KEY]);
        });
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
    <div>
      {error && <p className="p-10 text-red-500">{error}</p>}
      {!error && (
        <>
          {sessionParticipantInfo === undefined ? (
            <progress className="progress w-full"></progress>
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
                  stream={stream}
                />
              )}
              {step === "end" && <EndStep end={closeWindow} />}
            </>
          )}
        </>
      )}
    </div>
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
    if (
      now.isBetween(
        moment(startTime).subtract(moment.duration(3, "h")),
        moment(stopTime).subtract(moment.duration(3, "h"))
      )
    ) {
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
      <p>You are logged in as {email}</p>
      <p className="mt-2 mb-2">
        Start time{" "}
        {moment(startTime)
          .subtract(moment.duration(3, "h"))
          .format("LLLL")
          .toString()}
      </p>
      <p className="mt-2 mb-2">
        End time{" "}
        {moment(stopTime)
          .subtract(moment.duration(3, "h"))
          .format("LLLL")
          .toString()}
      </p>
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
    <div className="p-10">
      <h1 className="font-bold text-lg mb-5">Camera and microphone access</h1>
      {state !== "ok" && (
        <>
          <p>
            You need to allow extension to access your microphone and camera
          </p>
          {state === "error" && (
            <p className="text-red-500">
              Something went wrong, the permission request failed, try again
            </p>
          )}
          <button
            className="btn btn-active btn-primary mt-5 mr-3"
            onClick={requestAccess}
            disabled={state === "requested"}
          >
            Request access
          </button>
        </>
      )}
      {state === "ok" && (
        <>
          <p>Access granted! You can continue to next step</p>
          <button
            className="btn btn-active btn-primary mt-5 mr-3"
            onClick={next}
          >
            Continue
          </button>
        </>
      )}
    </div>
  );
};

const MonitoringStep: React.FC<{
  sessionParticipant: SessionParticipantInfo;
  isStarted: boolean;
  start: () => void;
  stop: () => void;
  stream: MediaStream | undefined;
}> = ({ sessionParticipant, isStarted, start, stop, stream }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    console.log("xxx", videoRef.current, stream);
    if (videoRef.current && stream !== undefined) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);
  return (
    <div className="p-10">
      <h1 className="font-bold text-lg mb-5">
        Session {sessionParticipant.session.title}
      </h1>
      {!isStarted && (
        <>
          <p>
            Please beware. You are monitored. Any malicious activity will be
            flagged.
          </p>
          <p>
            <b>Good luck!</b>
          </p>
          <button
            className="btn btn-active btn-primary mt-5 mr-3"
            onClick={start}
          >
            Start Monitoring
          </button>
        </>
      )}
      <div className="w-full mb-3">
        <video
          id="video"
          height="100%"
          width="100%"
          autoPlay={true}
          ref={videoRef}
          muted={true}
        ></video>
      </div>

      {isStarted && (
        <>
          <p>
            Please try to stay in the frame and look to the center of the screen
          </p>
          <button
            className="btn btn-active btn-primary mt-5 mr-3"
            onClick={stop}
          >
            Stop Monitoring
          </button>
        </>
      )}
    </div>
  );
};

const EndStep: React.FC<{ end: () => void }> = ({ end }) => {
  return (
    <div className="p-10">
      <h1 className="font-bold text-lg mb-5">Thank you</h1>
      <p>
        Lorem, ipsum dolor sit amet consectetur adipisicing elit. Sequi cum
        minima vitae perspiciatis itaque debitis mollitia dolores quis, saepe,
        quaerat numquam alias nisi, fuga dignissimos. Dolor soluta omnis ab cum.
      </p>
      <button className="btn btn-active btn-primary mt-5 mr-3" onClick={end}>
        Close
      </button>
    </div>
  );
};

export default Recording;
