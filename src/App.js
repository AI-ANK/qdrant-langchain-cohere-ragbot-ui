import React, { useState } from "react";
import "./App.css";
const API_ENDPOINT = "https://4b7665dd-98cb-47af-9795-d3d8ec0064a6-00-334wn4gxieb85.pike.replit.dev";


function App() {
  const [message, setMessage] = useState("");
  const [conversation, setConversation] = useState([]);
  const [file, setFile] = useState(null);
  const [groupId, setGroupId] = useState(null); // Store group_id for the session
  const [pdfUrl, setPdfUrl] = useState(null); // State to store the PDF URL
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);


  const uploadDocument = async () => {
    if (!file) return;
    setIsLoading(true); // Start loading

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(
        `${API_ENDPOINT}/upload`,
        { method: "POST", body: formData }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Document uploaded", result);
      setGroupId(result.group_id);
      setConversation([]);
      setPdfUrl(URL.createObjectURL(file)); // Create a URL for the uploaded file and set it
    } catch (error) {
      console.error("Error uploading document:", error);
      setError("There is a temporary issue with the server. Please try again later."); // Set the error message
      setIsLoading(false);
      
    }
    setIsLoading(false); // Stop loading
  };

  const sendMessage = async () => {
    if (message.trim() === "") return;
    setIsLoading(true); // Start loading
    console.log(groupId);
    try {
      const response = await fetch(
        `${API_ENDPOINT}/rag?group_id=${groupId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ __root__: message }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const outputText = data.response || "No response text found";

      setConversation((convo) => [
        { text: outputText, from: "bot" },
        { text: message, from: "user" },
        ...convo,
      ]);

      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      setError("There is a temporary issue with the server. Please try again later."); // Set the error message
      setIsLoading(false);
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  const handleMessageChange = (event) => {
    setMessage(event.target.value);
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      sendMessage();
    }
  };

  const handleFileChange = (event) => {
    console.log("hi")
    setFile(event.target.files[0]);
  };

  return (
    <>
      {error && <div className="error-message">{error}</div>}

      {isLoading && (
        <div className="overlay">
          <div className="spinner"></div>
        </div>
      )}

      <div className={`app-container ${isLoading ? 'faded' : ''}`}>
        <div className="pdf-preview">
          {pdfUrl && (
            <iframe
              src={pdfUrl}
              title="PDF Preview"
              className="pdf-iframe"
            ></iframe>
          )}
        </div>
        <div className="chat-container">
          <div className="input-area">
            <input type="file" accept=".pdf" onChange={handleFileChange} />
            <button onClick={uploadDocument}>Upload Document</button>
          </div>
          <div className="messages-area">
            {conversation.map((c, index) => (
              <div
                key={index}
                className={`message ${
                  c.from === "user" ? "user-message" : "bot-message"
                }`}
              >
                {c.text}
              </div>
            ))}
          </div>
          <div className="input-area">
            <input
              className="input-box"
              type="text"
              value={message}
              onChange={handleMessageChange}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
            />
            <button className="send-button" onClick={sendMessage}>
              Send
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
