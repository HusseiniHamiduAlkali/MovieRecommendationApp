// src/App.js (UPDATED CONTENT FOR MAP INTEGRATION)
import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import Message from './components/Message';
import ChatInput from './components/ChatInput';
import MapDisplay from './components/MapDisplay'; // Import the new MapDisplay component

function App() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mapInfo, setMapInfo] = useState(null); // New state to hold map data (origin, destination)
  const chatWindowRef = useRef(null);

  // Effect to scroll to the bottom of the chat window whenever messages change
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  // Function to handle sending a message to the AI function
  const handleSendMessage = async (text) => {
    const newUserMessage = { text, sender: 'user' };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setIsLoading(true);
    setMapInfo(null); // Clear any previous map when a new message is sent

    try {
      // Make a POST request to your Netlify Function
      const response = await fetch('/.netlify/functions/gemini-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userQuery: text }), // Send the user's question
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status} - ${errorData.message || response.statusText}`);
      }

      const data = await response.json(); // The response can be text or a map JSON object

      // Check if the AI's response is for directions (based on the 'type' field from AI)
      if (data.type === "directions" && data.origin && data.destination) {
        setMapInfo({ origin: data.origin, destination: data.destination }); // Set map data
        const mapConfirmationMessage = {
          text: `AI: Okay, I can help with directions from "${data.origin}" to "${data.destination}". See the map above.`,
          sender: 'ai'
        };
        setMessages((prevMessages) => [...prevMessages, mapConfirmationMessage]);
      } else {
        // If it's not a directions response, treat it as a normal text message
        const aiResponseText = data.message || "Sorry, I couldn't get a response from the AI.";
        const newAiMessage = { text: aiResponseText, sender: 'ai' };
        setMessages((prevMessages) => [...prevMessages, newAiMessage]);
      }

    } catch (error) {
      console.error("Error sending message to AI function:", error);
      const errorMessage = { text: `Error: Could not connect to the AI. Details: ${error.message}`, sender: 'ai' };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false); // Stop loading regardless of success or failure
    }
  };

  return (
    <div className="App">
      <h1>Yola South Community AI Info Hub</h1>
      <p>Your local AI assistant</p>

      {/* Conditionally render MapDisplay component if mapInfo is available */}
      {mapInfo && (
        <div style={{ margin: '20px 0', width: '100%' }}>
          <MapDisplay origin={mapInfo.origin} destination={mapInfo.destination} />
        </div>
      )}

      <div className="chat-window" ref={chatWindowRef}>
        {messages.map((msg, index) => (
          <Message key={index} text={msg.text} sender={msg.sender} />
        ))}
        {isLoading && <Message text="AI is thinking..." sender="ai" />}
      </div>

      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      <h3>Frequently Asked Questions (FAQs)</h3>
        <a >Where can i get treated for malaria?</a>
        <p>My tomato leaves are yellowing!</p>
        <p>Where can I get consulted for my diabetes in Yola South please?</p>
        <p>Medical Higher institutions in Yola.</p>
    </div>
  );
}

export default App;