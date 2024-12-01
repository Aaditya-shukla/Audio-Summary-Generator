/* global chrome */
import React from "react";
require('./App.css');

const App = () => {

  const fetchTranscript = () => {
    console.log("Fetching transcript...");
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { command: "getTranscript" }, (response) => {
          console.log("Response received from content script:-", response);
        });
      } else {
        console.log("No active tab found.");
      }
    });
  };

  const generateSummary = (e) => {
    let summaryType = "short";
    if (e.target.id === "generateSummary1") {
      summaryType = "short";
    } else if (e.target.id === "generateSummary2") {
      summaryType = "medium";
    } else {
      summaryType = "long";
    }
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { summaryType: summaryType, command: "generateSummary" }, (response) => {
        if (chrome.runtime.lastError) {
          console.log("Error", chrome.runtime.lastError.message);
        }
      });
    })

  };


  return (
    <div style={{ display: "flex", flexDirection: "column", height: "450px", width: "300px", borderColor: "black", alignItems: "center", backgroundColor: "whitesmoke" }}>
      <h2>Audio Summary Generator</h2>
      <p2 >Make sure your Microphone is turned On</p2>
      <button style={{ height: "100px", width: "100px", margin: "15px", marginTop: "25px" }} onClick={fetchTranscript}>Start Transcripting</button>
      <div style={{ height: "200px", width: "200px", display: "flex", alignContent: "center", border: "1", borderColor: "black", flexDirection: "column", flexWrap: "wrap" , alignItems:"center"}}>
        <h3 >Generate Summary</h3>
        <div style={{ display: "flex", flexDirection: "row" }}>
          <button style={{ height: "75px", width: "75px", margin: "15px" }} id="generateSummary1" onClick={(e) => { generateSummary(e); }}>Short</button>
          <button style={{ height: "75px", width: "75px", margin: "15px" }} id="generateSummary2" onClick={(e) => { generateSummary(e); }}>Medium</button>
          <button style={{ height: "75px", width: "75px", margin: "15px" }} id="generateSummary3" onClick={(e) => { generateSummary(e); }}>Long</button>
        </div>
      </div>
    </div>
  );
};

export default App;

