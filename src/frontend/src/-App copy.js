import logo from "./logo.svg";
import "./App.css";
import { useEffect } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";

const SOCKET_ENDPOINT = process.env?.REACT_APP_WEBSOCKET_ENDPOINT;

if (!SOCKET_ENDPOINT) {
  console.error("SOCKET_ENDPOINT variable is undefined!");
}

function App() {
  const { sendMessage, lastMessage, readyState } =
    useWebSocket(SOCKET_ENDPOINT);

  const connectionStatus = {
    [ReadyState.CONNECTING]: "Connecting",
    [ReadyState.OPEN]: "Open",
    [ReadyState.CLOSING]: "Closing",
    [ReadyState.CLOSED]: "Closed",
    [ReadyState.UNINSTANTIATED]: "Uninstantiated",
  }[readyState];

  console.log("WS STATE", connectionStatus);

  useEffect(() => {
    if (connectionStatus === "Open") {
      sendMessage({
        action: "retrieveFxPlotPoints",
        // data: coin,
      });

      console.log("MESSAGE SENT!")
    }
  }, [connectionStatus]);

  useEffect(() => {
    console.log("LAST MESSAGE =>", lastMessage);

    // if (lastMessage !== null) {
    //   setMessageHistory((prev) => prev.concat(lastMessage));
    // }
  }, [lastMessage]);

 
  return (
    <div className="App">
      <header className="App-header"></header>
    </div>
  );
}

export default App;
