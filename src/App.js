import "./styles.css";
import "@radix-ui/themes/styles.css";
import TextBubble from "./textBubble";
import Conversations from "./conversations";

import React, { useState, useEffect, useRef } from "react";

import { TextArea, ScrollArea } from "@radix-ui/themes";

import Stack from "@mui/joy/Stack";
export default function App() {
  const [inputValue, setInputValue] = useState("");
  const chats = useRef({});
  const [isPanelVisible, setIsPanelVisible] = useState(false);

  const [apiResponses, setApiResponses] = useState([
    {
      text: "",
      response:
        "Hello, this is the FEA Counselling Bot, may I please know your full name",
    },
  ]); // Initialize with the first question

  const [userDetails, setUserDetails] = useState([]);
  const [threadID, setthreadId] = useState("");
  const [runID, setRunId] = useState("");
  const [currentSessionId, setCurrentSessionId] = useState(
    `session_${new Date().getTime()}`
  );

  const [messageID, setMessageID] = useState(1); // Initial messageID value
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const chatAreaRef = useRef(null);
  const inputRef = useRef(null); // Reference for the input element
  const questions = [
    "Hello, this is the FEA Counselling Bot, may I please know your full name",
    "Thanks for providing your name, What is your Age?",
    "Thank you, What is your Gender?",
    "Thanks, What is your location in India, please mention city or town",
    "Thanks for providing these details, What is your current or highest education qualification, mention the course name (example: B. com Hons First Year)",
    "What was your RAISEC score, when you gave the career aptitude test. If you haven't completed it, please complete it here https://www.careerizma.com/app/ct/freecareertest.php Once you have completed, share the score here.",
    "What is your career goal? If you have a backup plan, also mention it here as backup",
    "Thank you for providing your goal, could you please explain in a few (2-4) sentences why you chose this field/career? What motivated you to chose this field? If you're not sure why you chose this, it's okay, explain whatever your reasoning is. This will help me understand and give good recommendations",
  ];


  const keys = [
    "Name",
    "Age",
    "Gender",
    "Location",
    "Education",
    "RAISEC Score",
    "Career goal",
    "Explaination",
  ];

  const togglePanel = () => {
    setIsPanelVisible(!isPanelVisible);
  };

  useEffect(() => {
    const savedSessions = localStorage.getItem("chatSessions");
    if (savedSessions) {
      const sessionsData = JSON.parse(savedSessions);
      chats.current = sessionsData;
      console.log("sessions: ", sessionsData);
      // If the current session exists in the loaded data, update the current messages
      if (sessionsData[currentSessionId]) {
        setApiResponses(sessionsData[currentSessionId].chat);
      }
    }
  }, []);

  const loadChat = (sessionId) => {
    console.log("loading: ", sessionId);
    setCurrentSessionId(sessionId);
    setApiResponses(chats.current[sessionId].chat);
    setthreadId(chats.current[sessionId].threadID);
    setMessageID(chats.current[sessionId].messageId);
    setUserDetails(chats.current[sessionId].details);
  };

  const saveData = () => {
    console.log(userDetails);
    if (userDetails.length >= 1) {
      chats.current[currentSessionId] = {
        chat: apiResponses,
        threadID: threadID,
        name: userDetails[0].inp,
        messageId: messageID,
        details: userDetails,
      };

      console.log("saving: ", chats.current);
      localStorage.setItem("chatSessions", JSON.stringify(chats.current));
    }
  };

  useEffect(() => {
    // Scroll to the bottom of chat area when new messages are added
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [apiResponses]);

  useEffect(() => {
    // This code runs after runID has been updated
    console.log(runID);
  }, [runID]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
    saveData();
  }, [apiResponses]); // Focus whenever apiResponses change

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      event.preventDefault(); // Prevents the default behavior of the "Enter" key in forms
      // Call your API here
      callAPI();
    }
  };

  const pollAPI = (r, t) => {
    return function () {
      console.log("polling");

      let b = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messageID: messageID,
          threadID: t,
          runID: r,
        }),
      };
      console.log("polling req: ", b);

      fetch("https://8s42huels0.execute-api.us-east-1.amazonaws.com/test/DR", b)
        .then((response) => {
          if (!response.ok) {
            console.log("err");
            throw new Error("Network response was not ok.");
          }
          return response.json();
        })
        .then((data) => {
          console.log("poll resp: ", data);

          if (!data.answer.msg_status) {
            setTimeout(pollAPI(r, t), 2000);
          } else {
            setIsLoading(false); // Set loading state to false after receiving API response

            console.log(data);
            setMessageID((prevMessageID) => prevMessageID + 1); // Increment messageID

            setApiResponses((prevResponses) => [
              ...prevResponses,
              { text: inputValue, response: data.answer.output },
            ]);

            setInputValue(""); // Clear input field after the API call
          }
        })
        .catch((error) => {
          setIsLoading(false); // Set loading state to false after receiving API response
          console.error("Error:", error);
          setApiResponses("Error occurred. Please try again."); // Display error message
        });
    };
  };

  const callAPI = () => {
    if (messageID < 8) {
      // Adjusted since the first question is already displayed
      setApiResponses((prevResponses) => [
        ...prevResponses,
        { text: inputValue, response: questions[messageID] },
      ]);
      setUserDetails((details) => [
        ...details,
        { k: keys[messageID - 1], inp: inputValue },
      ]);
      setMessageID((prevMessageID) => prevMessageID + 1);
      setInputValue("");
      console.log(userDetails);
    } else {
      let b = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body:
          messageID === 8
            ? JSON.stringify({
                messageID: messageID,
                threadID,
                context:
                  userDetails.reduce(
                    (t, c) => (t += c.k + " : " + c.inp + "; "),
                    ""
                  ) +
                  "Explanantion : " +
                  inputValue,
              })
            : JSON.stringify({
                messageID: messageID,
                context: inputValue,
                threadID,
              }),
      };
      console.log("first req: ", b);
      setIsLoading(true); // Set loading state to true while waiting for API response

      fetch("https://8s42huels0.execute-api.us-east-1.amazonaws.com/test/DR", b)
        .then((response) => {
          if (!response.ok) {
            console.log("err");
            throw new Error("Network response was not ok.");
          }
          return response.json();
        })
        .then((data) => {
          console.log("first resp: ", data);
          // Update state with API response
          setthreadId(data.answer.thread_id);
          setRunId(data.answer.runID);
          if (!data.answer.msg_status) {
            setTimeout(pollAPI(data.answer.runID, data.answer.thread_id), 2000);
          } else {
            setIsLoading(false); // Set loading state to false after receiving API response

            console.log(data);
            setMessageID((prevMessageID) => prevMessageID + 1); // Increment messageID

            setApiResponses((prevResponses) => [
              ...prevResponses,
              { text: inputValue, response: data.answer.output },
            ]);

            setInputValue(""); // Clear input field after the API call
          }
        })
        .catch((error) => {
          setIsLoading(false); // Set loading state to false after receiving API response
          console.error("Error:", error);
          setApiResponses("Error occurred. Please try again."); // Display error message
        });
    }
  };

  return (
    <div className="App">
      <button
        className="toggle-button"
        onClick={togglePanel} // Initially hidden, shown via CSS on mobile
      >
        History
      </button>
      <Stack direction="row" spacing={2}>
        <div
          className={`side-panel ${isPanelVisible ? "visible" : ""}`}
          style={{
            background: "#5887F5",
            color: "white",
            padding: "10px",
          }}
        >
          <p>Conversations</p>
          <ul
            style={{
              listStyleType: "none",
              margin: "0px",
              padding: "0px",
            }}
          >
            {Object.keys(chats.current).map((item, index) => (
              <Conversations
                key={index}
                chats={chats.current[item].name}
                lc={loadChat}
                sessionID={item}
              />
            ))}
          </ul>
        </div>
        <Stack spacing={2}>
          <ScrollArea
            ref={chatAreaRef}
            size="1"
            type="always"
            scrollbars="vertical"
            style={{ width: "78vw", height: "80vh", padding: "10px" }}
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
