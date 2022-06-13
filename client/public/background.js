
const EXT_STATE = {
  token: undefined,
  mode: undefined
}

const registerState = () => {
  console.log("hh");
  chrome.storage.local.set(EXT_STATE);
}

chrome.runtime.onInstalled.addListener(registerState);
chrome.runtime.onStartup.addListener(registerState);

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  console.log(tabId, changeInfo, tab);
  if (changeInfo.status === "complete" && tab.url.includes("https")) {
    console.log("acum");
    chrome.scripting.executeScript(
      { files: ["./background.bundle.js"] },
      function () {
        console.log("INJECTED");
      }
    );
  }
});
