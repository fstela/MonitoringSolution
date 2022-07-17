
const connectToPort = () => {
  const portConn = chrome.runtime.connect({ name: "monitoring" });
  return portConn;
};

document.addEventListener("keydown", (event) => {
  const port = connectToPort();
  const keys = [];
  event.metaKey && keys.push("meta");
  event.ctrlKey && keys.push("ctrl");
  event.altKey && keys.push("alt");
  event.shiftKey && keys.push("shift");
  if(keys.length == 0) {
    return;
  }
  event.key && !["Meta", "Alt", "Ctrl", "Shift"].includes(event.key) && keys.push(event.key);
  if(keys.length > 0 && port) {
    port.postMessage({
      action: "RECORD_KEYS",
      data: keys.join("+")
    })
  }
});
