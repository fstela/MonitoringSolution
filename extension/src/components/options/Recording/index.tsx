import { getUserMediaStream } from "@src/service/media";
import React, { useEffect, useRef, useState } from "react";

// video encoding
const mimeType = "video/webm; codecs=vp8";

const Recording: React.FC = () => {
  const video = useRef<HTMLVideoElement>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [recorder, setRecorder] = useState<MediaRecorder | undefined>(
    undefined
  );
  const [timer, setTimer] = useState<
    undefined | ReturnType<typeof setInterval>
  >(undefined);
  const [error, setError] = useState<undefined | "access">(undefined);
  const [port, setPort] = useState<undefined | chrome.runtime.Port>(undefined);

  useEffect(() => {
    document.title = "Monitoring";
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

  const startMonitoring = () => {
    getUserMediaStream().then((response) => {
      if (response === false) {
        setError("access");
        return;
      }
      if (video.current && response) {
        video.current.srcObject = response;
        initRecording(response);
        return;
      }
    });
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
      token: "test"
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
  };

  function blobToDataURL(blob: Blob): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (_e) => resolve(reader.result as string);
      reader.onerror = (_e) => reject(reader.error);
      reader.onabort = (_e) => reject(new Error("Read aborted"));
      reader.readAsDataURL(blob);
    });
  }

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
        videoData: url
      });
    });
  };

  return (
    <div>
      <video
        id="video"
        height="100%"
        width="100%"
        autoPlay={true}
        ref={video}
      ></video>
      {error && <p>Error type: {error}</p>}
      {!isStarted && (
        <button className="btn btn-primary" onClick={() => startMonitoring()}>
          Start
        </button>
      )}
      {isStarted && (
        <button className="btn btn-primary" onClick={() => stopMonitoring()}>
          Stop
        </button>
      )}
    </div>
  );
};

export default Recording;
