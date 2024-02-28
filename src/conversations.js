const Conversations = ({ chats, lc, sessionID }) =>
  chats && (
    <li
      style={{ textAlign: "left", padding: "5px 0px 5px 10px" }}
      onClick={() => lc(sessionID)}
    >
      {chats}
    </li>
  );
export default Conversations;
