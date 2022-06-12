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
