import "./styles.css";
import "@radix-ui/themes/styles.css";
import TextBubble from "./textBubble";

import React, { useState, useEffect, useRef } from "react";

import { TextArea, ScrollArea, Text, Grid, Flex, Box } from "@radix-ui/themes";
import TextField from "@mui/material/TextField";

import Stack from "@mui/joy/Stack";
export default function App() {
  const [inputValue, setInputValue] = useState("");
  const [apiResponses, setApiResponses] = useState([]);
  const [messageID, setMessageID] = useState(1); // Initial messageID value
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const chatAreaRef = useRef(null);
  const inputRef = useRef(null); // Reference for the input element

  useEffect(() => {
    // Function to call the API once when the page loads
    initialAPICall();
  }, []); // Empty dependency array to run this effect only once on mount

  useEffect(() => {
    // Scroll to the bottom of chat area when new messages are added
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [apiResponses]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [apiResponses]); // Focus whenever apiResponses change

  const initialAPICall = () => {
    fetch("https://5uv4dgpuuf.execute-api.us-east-1.amazonaws.com/Dev/DR", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messageID }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok.");
        }
        return response.json();
      })
      .then((data) => {
        // Update state with initial API response
        console.log(data);
        setMessageID((prevMessageID) => prevMessageID + 1); // Increment messageID

        setApiResponses([{ text: inputValue, response: data.answer }]);
      })
      .catch((error) => {
        console.error("Error:", error);
        setApiResponses([
          { text: inputValue, response: "Error occurred. Please try again." },
        ]);
      });
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      event.preventDefault(); // Prevents the default behavior of the "Enter" key in forms

      // Call your API here
      callAPI();
    }
  };

  const callAPI = () => {
    b = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body:
        messageID === 8
          ? JSON.stringify({
              messageID,
              context:
                apiResponses.reduce((t, c) => (t += c.text + " , ")) +
                " " +
                inputValue,
            })
          : messageID > 8
          ? JSON.stringify({ messageID: 8, context: inputValue })
          : JSON.stringify({ messageID }),
    };
    console.log(b.body);
    setIsLoading(true); // Set loading state to true while waiting for API response

    fetch("https://5uv4dgpuuf.execute-api.us-east-1.amazonaws.com/Dev/DR", b)
      .then((response) => {
        if (!response.ok) {
          console.log("err");
          throw new Error("Network response was not ok.");
        }
        return response.json();
      })
      .then((data) => {
        // Update state with API response
        setIsLoading(false); // Set loading state to false after receiving API response

        console.log(data);
        if (messageID >= 8) {
          setMessageID((prevMessageID) => prevMessageID + 1); // Increment messageID

          setApiResponses((prevResponses) => [
            ...prevResponses,
            { text: inputValue, response: data.answer.response },
          ]);
        } else {
          setMessageID((prevMessageID) => prevMessageID + 1); // Increment messageID
          setApiResponses((prevResponses) => [
            ...prevResponses,
            { text: inputValue, response: data.answer },
          ]);
        }
        setInputValue(""); // Clear input field after the API call
      })
      .catch((error) => {
        setIsLoading(false); // Set loading state to false after receiving API response
        console.error("Error:", error);
        setApiResponse("Error occurred. Please try again."); // Display error message
      });
  };

  return (
    <div className="App">
      <Stack spacing={2}>
        <ScrollArea
          ref={chatAreaRef}
          size="1"
          type="always"
          scrollbars="vertical"
          style={{ width: "98vw", height: "80vh", padding: "10px" }}
        >
          {apiResponses.map((item, index) => (
            <TextBubble
              key={index}
              userText={item.text}
              apiResponse={item.response}
            />
          ))}
        </ScrollArea>
        <TextArea
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyPress}
          variant="classic"
          size="2"
          disabled={isLoading}
          placeholder="Message FEA Bot…"
        />
      </Stack>
      {isLoading && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            width: "25%",
            height: "25%",
            transform: "translate(-50%, -50%)",
            background: "rgba(250, 250, 250, 0.8)",
            zIndex: 999,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <p>Loading...</p>
        </div>
      )}
    </div>
  );
}
