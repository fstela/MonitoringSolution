/**
 * Extension settings
 */
const EXT_CONFIG = {
  api: "http://localhost:8080/api/monitoring",
  monitoringWindowCheckInterval: 2, // ms
};

// Make settings read only at runtime
Object.freeze(EXT_CONFIG);

/**
 * Extension state
 */
const EXT_STATE = {
  token: undefined as undefined | string,
  view: undefined,
  isMonitoringStarted: false,
  monitoringWindowId: undefined,
  recordedBrowserData: [] as string[],
  recordedKeyData: [] as string[],
};

/**
 * Keep extension port alive, because chrome sometimes will kill it
 */
chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== "monitoring") return;
  port.onMessage.addListener(onMessage);
  port.onDisconnect.addListener(deleteTimer);
  // 1min
  port._timer = setTimeout(forceReconnect, 60e3, port);
});

const forceReconnect = (port: chrome.runtime.Port) => {
  deleteTimer(port);
  port.disconnect();
};

const deleteTimer = (port: chrome.runtime.Port) => {
  if (port._timer) {
    clearTimeout(port._timer);
    delete port._timer;
  }
};

function onMessage(message: any, port: chrome.runtime.Port) {
  console.log("received", message, "from", port.sender);
  if (message.action) {
    if (message.action === "START_MONITORING" && message.token !== undefined) {
      EXT_STATE.token = message.token;
      EXT_STATE.isMonitoringStarted = true;
    }
    if (message.action === "STOP_MONITORING") {
      EXT_STATE.isMonitoringStarted = false;
    }
    if (message.action === "RESET_MONITORING_DATA") {
      EXT_STATE.recordedBrowserData = [];
      EXT_STATE.recordedKeyData = [];
    }
    if (message.action === "PUSH_MONITORING_FRAME" && message.videoData) {
      pushMonitoringData(message.videoData);
    }
    if (message.action === "RECORD_KEYS" && message.data) {
      recordKeysDataInState(message.data);
    }
  }
}

chrome.tabs.onCreated.addListener(function (tab) {
  if (!EXT_STATE.isMonitoringStarted) {
    return;
  }
  recordBrowserDataInState(
    buildMessage(
      "creted",
      tab.url ?? "none",
      tab.active,
      tab.highlighted,
      tab.audible ?? false
    )
  );
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (!EXT_STATE.isMonitoringStarted) {
    return;
  }
  recordBrowserDataInState(
    buildMessage(
      "change",
      tab.url ?? "none",
      tab.active,
      tab.highlighted,
      tab.audible ?? false
    )
  );
});

const buildMessage = (
  action: string,
  url: string,
  active: boolean,
  highlighted: boolean,
  audible: boolean
) => {
  return `[action_${action}]#[url_${
    url ?? "none"
  }]#[active_${active}]#[highlighted_${highlighted}]#[audible_${audible}]`;
};

chrome.runtime.onMessage.addListener((message) => {
  if (message.action) {
    if (message.action === "START_MONITORING" && message.token) {
      EXT_STATE.isMonitoringStarted = true;
      EXT_STATE.token = message.token;
    }
    if (message.action === "STOP_MONITORING") {
      EXT_STATE.isMonitoringStarted = false;
      EXT_STATE.token = undefined;
    }
    if (message.action === "RESET_MONITORING_DATA") {
      EXT_STATE.recordedBrowserData = [];
      EXT_STATE.recordedKeyData = [];
    }
    if (message.action === "PUSH_MONITORING_FRAME" && message.videoData) {
      pushMonitoringData(message.videoData);
    }
    if (message.action === "RECORD_KEYS" && message.data) {
      recordKeysDataInState(message.data);
    }
  }
});

const recordBrowserDataInState = (data: string) => {
  EXT_STATE.recordedBrowserData.push(data);
};

const recordKeysDataInState = (data: string) => {
  EXT_STATE.recordedKeyData.push(data);
};

const pushMonitoringData = (videoData: any) => {
  // if you need to test the video output directly
  //
  // chrome.downloads.download({
  //   filename: "ceva.webm",
  //   url: videoData
  // })

  const data = {
    browser: EXT_STATE.recordedBrowserData,
    keys: EXT_STATE.recordedKeyData,
  };

  EXT_STATE.recordedBrowserData = [];
  EXT_STATE.recordedKeyData = []  

  // base64 -> blob
  fetch(videoData)
    .then((res) => {
      res.blob().then((blob) => saveData({ videoBlob: blob, ...data }));
    })
    .then(console.log);
};

const saveData = (data: {videoBlob: Blob, browser: string[], keys: string[]}) => {
  if (EXT_STATE.token === undefined) {
    // todo, announce the user using port conn
    console.log("Token not found! Failed to push data");
    return;
  }

  var myHeaders = new Headers();
  myHeaders.append("Authorization", EXT_STATE.token);

  const formdata = new FormData();
  formdata.append("v", data.videoBlob);

  data.browser.forEach((data) => {
    formdata.append("browser", data);
  });
  

  data.keys.forEach((data) => {
    formdata.append("keys", data);
  });


  const errorMessage = "Failed to send data to the server";

  fetch(EXT_CONFIG.api, {
    method: "POST",
    headers: myHeaders,
    body: formdata,
    redirect: "follow",
  })
    .then((response) => response.text())
    .then((result) => console.log(result))
    .catch((error) => console.log(errorMessage, error));
};
