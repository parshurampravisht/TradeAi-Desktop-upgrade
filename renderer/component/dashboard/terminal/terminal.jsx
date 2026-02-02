import { Text } from "@nextui-org/react";
import dynamic from "next/dynamic";
import React, { useState } from "react";
import { useEffect } from "react";
import electron from "electron";
import { useGlobalContext } from "../../../context/GlobalContext";
const ipcRenderer = electron.ipcRenderer || false;

function TerminalWindow() {
  const { currentCommand, commandEntries } = useGlobalContext();
  // var curr_line = "";
  useEffect(() => {
    const initTerminal = async () => {
      const { Terminal } = await import("xterm");
      
      var term = new Terminal({ cols: 1000, rows: 1000 });

      // Add logic with `term`
      console.log("from xterm!");

      term.open(document.getElementById("terminal"));
      term.write('Enter command :> ')
      //when node-pty sends terminal response to UI
      ipcRenderer.on("terminal.incomingData", (event, data) => {
        if (data != "\n") {
          console.log(data);  
          term.write(data);
          // term.scrollToBottom();
          term.scrollLines(1)
        } else {
          console.log(data);
          console.log("linebreak is received!!");
        }
      });

      //events on key press events
      term.onData((e) => {
        console.log(currentCommand.current);
        // term.clear();

        console.log(e.charCodeAt(0));
        if (e.charCodeAt(0) === 13) {
          //when enter is pressed
          console.log("entered is pressed!");
          term.write("\r\n");
          currentCommand.current = currentCommand.current + "\r\n";
          ipcRenderer.send("terminal.keystroke", "cls\r\n");
          ipcRenderer.send("terminal.keystroke", currentCommand.current);
          currentCommand.current = "";
        } else if (e.charCodeAt(0) === 127) {
          console.log("backspace is pressed");
          //when backspace pressed
          if (currentCommand.current.length > 0) {
            term.write("\b \b");
          }
          currentCommand.current = currentCommand.current.slice(
            0,
            currentCommand.current.length - 1
          );
          console.log(currentCommand.current.length, currentCommand.current);
        } else {
          term.write(e);
          console.log(e);
          currentCommand.current = currentCommand.current + e;
        }
      });
    };
    initTerminal();
  }, []);
  return (
    <>
      <Text color="#fff" css={{ textAlign: "center" }}>
        Trade Tezz :
      </Text>

      <div
        id="terminal"
        style={{
          height: "68vh",
          width: "100%",
          background: "transparent",
        }}
      ></div>
    </>
  );
}

export default TerminalWindow;
