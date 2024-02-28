import React from "react";

const TextBubble = ({ userText, apiResponse }) => {
  const extractURLs = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex);
  };

  const parts = extractURLs(apiResponse);

  return (
    <div>
      {userText && (
        <div
          style={{
            border: "1px solid #ccc",
            borderRadius: "20px",
            padding: "2px 10px",
            marginTop: "10px",
            textAlign: "left",
            background: "#5887F5",
            color: "white",
            float: "right",
            clear: "left",
            maxWidth: "60vw",
            //minWidth: "30vw",
          }}
        >
          <p>{userText}</p>
        </div>
      )}
      <div
        style={{
          textAlign: "left",
          borderRadius: "20px",
          padding: "2px 10px",
          border: "1px solid #ccc",
          marginTop: "10px",
          background: "lightgray",
          maxWidth: "60vw",
          minWidth: "30vw",
          float: "left",
          clear: "right",
        }}
      >
        <p style={{ whiteSpace: "pre-wrap" }}>

          {parts.map((part, index) =>
            part.match(/https?:\/\//) ? (
              <a
                key={index}
                href={part}
                target="_blank"
                rel="noopener noreferrer"
              >
                {part}
              </a>
            ) : (
              part
            )
          )}
        </p>
      </div>
    </div>
  );
};

export default TextBubble;
