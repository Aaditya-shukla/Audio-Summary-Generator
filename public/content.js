

// Working with the Speech Recognition API


let recognition, transcript = "";

const startAudioCapture = async () => {
  try {
    try {
      // Request audio capture from the tab
      navigator.permissions.query({ name: "microphone" }).then((permissionStatus) => {
        console.log("Microphone permission state:", permissionStatus.state);

        if (permissionStatus.state === "granted") {
          console.log("Microphone access is already granted.");
        } else if (permissionStatus.state === "prompt") {
          console.log("User will be prompted for microphone access.");
        } else {
          console.log("Microphone access is denied.");
          alert("Please enable microphone access in your browser settings.");
        }
      });


      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: false,
        audio: true,
      });

      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);

      // Optional: Connect an analyser for debugging
      const analyser = audioContext.createAnalyser();
      source.connect(analyser);


      // Configure Speech Recognition
      recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      recognition.lang = "en-US";
      recognition.continuous = true;
      // recognition.interimResults = true;
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      // Set the gain to a very low value (essentially silent)
      gainNode.gain.value = 0.00001;

      // Connect the oscillator to the gain node, and the gain node to the destination
      oscillator.connect(gainNode).connect(audioContext.destination);

      oscillator.start();

      // Keep it running indefinitely
      oscillator.onended = () => {
        oscillator.start();
      };
      recognition.onresult = (event) => {
        const newTranscript = event.results[event.results.length - 1][0].transcript;

        // Update the state with the new transcript
        transcript += "." + newTranscript
        console.log("Current Transcript:", transcript);
      };

      recognition.onerror = (error) => {
        recognition.start()
        console.log("Speech Recognition Error:", error);
      };

      recognition.onend = () => {
        recognition.start()
        console.log("Speech recognition ended.", transcript);
      };

      // Start Recognition
      recognition.start();
      console.log("Speech recognition started...");
    } catch (error) {
      try {
        if (error.name === "NotAllowedError") {
          console.log("Microphone access denied by the user.");
          alert(
            "Microphone access is blocked. Please enable it in your browser settings."
          );
        } else if (error.name === "NotFoundError") {
          console.log("No microphone found on the device.");
          alert("No microphone detected. Please connect a microphone and try again.");
        }

        const micStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContext.createMediaStreamSource(micStream);

        // Optional: Connect an analyser for debugging
        const analyser = audioContext.createAnalyser();
        source.connect(analyser);

        // Configure Speech Recognition
        recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = "en-US";
        recognition.continuous = true;
        // recognition.interimResults = true;

        recognition.onresult = (event) => {
          if (event.results && event.results[event.results.length - 1]) {
            const newTranscript = event.results[event.results.length - 1][0].transcript;

            // Update the state with the new transcript
            transcript += "." + newTranscript
            console.log("Current Transcript:", transcript);
          }
        };

        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        // Set the gain to a very low value (essentially silent)
        gainNode.gain.value = 0.00001;

        // Connect the oscillator to the gain node, and the gain node to the destination
        oscillator.connect(gainNode).connect(audioContext.destination);

        // Start the oscillator
        oscillator.start();

        // Keep it running indefinitely
        oscillator.onended = () => {
          oscillator.start();
        };
        console.log("Microphone audio capture started", oscillator);


        recognition.onerror = (event) => {
          if (event.error === "no-speech" || event.error === "audio-capture") {
            recognition.stop();
            recognition.start()
          }
          console.log("Speech Recognition Error:----", error);
        };

        recognition.onend = () => {
          // recognition.stop();
          recognition.start()
          console.log("Speech recognition ended.=====", transcript);
        };

        // Start Recognition
        recognition.start();
        console.log("Speech recognition started...");
      } catch (micError) {
        if (micError.name === "NotAllowedError") {
          console.log("Microphone access denied by the user.");
          alert(
            "Microphone access is blocked. Please enable it in your browser settings."
          );
        } else if (micError.name === "NotFoundError") {
          console.log("No microphone found on the device.");
          alert("No microphone detected. Please connect a microphone and try again.");
        } else {
          console.log("Error accessing the microphone:", micError);
          alert("An unexpected error occurred. Please try again.");
        }

        recognition.start();
      }
    }
  } catch (e) {
    console.log(e)
  }

};

const stopAudioCapture = () => {
  if (recognition) {
    recognition.stop();
    console.log("Audio capture stopped.");
  }
};

const downloadTranscript = (summary) => {
  if (!summary) {
    summary = transcript;
  }
  const blob = new Blob([summary], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "meeting-transcript.txt";
  link.click();
};

// Gemini Nano Integration
async function processTranscriptWithGeminiNano(text, summaryType) {
  // Assume `geminiNano` is a global object available through `geminiNano.js`
  const result = await generateSummary(text, summaryType);
  console.log("dcdcd", result);
  return result;
}

// Listen for Commands from the App.js
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log("Message received in content script:", msg);


  if (msg.command === "getTranscript") {
    console.log("Sending transcript to popup...=====111000000");
    startAudioCapture();
    sendResponse({ transcript });
  }

  if (msg.command === "generateSummary") {
    console.log("Generating summary...=====", msg.summaryType);
    stopAudioCapture();


    processTranscriptWithGeminiNano(transcript , msg.summaryType).then((summary) => {
      console.log("summary", summary)
      downloadTranscript(summary);

    });
  }

  return true; // Required for async responses
});


// Access the microphone
navigator.mediaDevices
  .getUserMedia({ audio: true })
  .then((stream) => {
    console.log("Microphone access granted");
    // You can process the audio stream here if needed
  })
  .catch((error) => {
    console.error("Microphone access denied:", error);
  });




async function generateSummary(text, length) {
  // Simulated Gemini Nano API call
  console.log("Generating", length , text);
  const options = {
    // sharedContext: 'This is a scientific article',
    type: 'key-points',
    format: 'markdown',
    length: length || 'medium',
  };
  const canSummarize = await ai.summarizer.capabilities();
  let summarizer;
  if (canSummarize && canSummarize.available !== 'no') {
    if (canSummarize.available === 'readily') {
      // The summarizer can immediately be used.
      summarizer = await ai.summarizer.create(options);
    } else {
      // The summarizer can be used after the model download.
      summarizer = await ai.summarizer.create(options);
      summarizer.addEventListener('downloadprogress', (e) => {
        console.log(e.loaded, e.total);
      });
      await summarizer.ready;
    }
  } else {
    // The summarizer can't be used at all.
  }
  result = await summarizer.summarize(text);
  return result;

}
