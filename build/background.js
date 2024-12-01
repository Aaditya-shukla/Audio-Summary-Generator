let audioStream = null;

chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension installed.", chrome.tabCapture);
  });
  
  chrome.action.onClicked.addListener((tab) => {
    console.log("Extension icon clicked!");
    // Perform an action, e.g., open a popup or send a message
  });
  
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Message received in service worker:", message);
    sendResponse({ reply: "Message processed by service worker" });
  });
  



