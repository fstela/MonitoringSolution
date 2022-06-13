const EXT_STATE = {
    token: undefined,
    view: undefined
  }
  
  const registerState = () => {
    console.log("State registered");
    chrome.storage.local.set(EXT_STATE);
  }
  
  chrome.runtime.onInstalled.addListener(registerState);
  chrome.runtime.onStartup.addListener(registerState);
  
  chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    console.log(tabId, changeInfo, tab);
  });