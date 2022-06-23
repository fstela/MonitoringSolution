
export const getUserMediaStream = async () => {
  try {
      const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
      });
      return stream;
  }  catch(err) {
      console.log(err);
      return false;
  } 
}
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

  chrome.runtime.onMessage.addListener((message) => {
    console.log(message);
    const stream = getUserMediaStream().then(res => console.log(res))
  })