import React from "react";

const TextBubble = ({ userText, apiResponse }) => (
  <div>
    {userText && (
      <div
        style={{
          border: "1px solid #ccc",
          borderRadius: "10px",
          padding: "10px",
          marginTop: "10px",
          textAlign: "right",
        }}
      >
        <p>{userText}</p>
      </div>
    )}
    <div
      style={{
        textAlign: "left",
        borderRadius: "10px",
        border: "1px solid #ccc",
        padding: "10px",
        marginTop: "10px",
      }}
    >
      <p>{apiResponse}</p>
    </div>
  </div>
);

export default TextBubble;
