import React, { useEffect, useRef, useState } from "react";
import { socket } from "../socket";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Groups() {
  const [user, setUser] = useState(null);
  const [groups, setGroups] = useState([]);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [currentGroup, setCurrentGroup] = useState(null);

  const messagesEndRef = useRef(null);

  const URL =
    import.meta.env.VITE_LOCAL === "TRUE"
      ? import.meta.env.VITE_BACKEND_URL
      : import.meta.env.VITE_SOCKET_URL;

  // Decode user from JWT (keep same behavior)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const data = JSON.parse(atob(token.split(".")[1]));
      setUser({ id: data.id, name: data.name });
      console.log("Decoded user:", data);
    } catch (err) {
      console.error("Error decoding token for username", err);
    }
  }, []);

  // Load groups from backend (keep same endpoint behavior)
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${URL}/api/groups`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setGroups(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error Loading groups..", err);
      }
    };
    fetchGroups();
  }, [URL]);

  // Socket room logic + load history (keep same features)
  useEffect(() => {
    if (!currentGroup) return;

    // Leave previous room
    if (socket.currentRoom && socket.currentRoom !== currentGroup.id) {
      console.log(`Client leaving previous room ${socket.currentRoom}`);
      socket.emit("leaveGroup", socket.currentRoom);
      socket.currentRoom = null;
    }

    // Join new room
    console.log(`Client: joining room ${currentGroup.id}`);
    socket.emit("joinGroup", currentGroup.id);
    socket.currentRoom = currentGroup.id;

    setMessages([]);

    // Load chat history from backend
    const loadChatHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${URL}/api/groups/${currentGroup.id}/chat`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setMessages(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching chat history:", err);
      }
    };

    loadChatHistory();

    if (socket.connected) {
      console.log("Connection test", socket.id);
    }

    const handleConnect = () => {
      console.log("Connected to Socket.IO,", socket.id);
    };
    const handleDisconnect = () => {
      console.log("Disconnected Socket.IO,", socket.id);
    };

    // Keep same message shape you were using (msg, senderID, sender, time)
    const handleChatMessage = (data) => {
      console.log("Received Message:", data);
      setMessages((prev) => [
        ...prev,
        {
          msg: data.msg,
          senderID: data.senderID,
          sender: data.sender,
          time: data.time,
        },
      ]);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("chat message", handleChatMessage);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("chat message", handleChatMessage);
    };
  }, [currentGroup, URL]);

  // Auto scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentGroup]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!currentGroup || !message.trim() || !user) return;

    // Keep same emit payload you had working (senderID only)
    socket.emit("chat message", {
      groupID: currentGroup.id,
      msg: message,
      senderID: user.id,
    });

    setMessage("");
  };

  // Determine message ownership using senderID first (best), fallback sender name
  const isOwnMessage = (msg) => {
    if (!user) return false;
    if (msg?.senderID && user?.id) return String(msg.senderID) === String(user.id);
    if (msg?.sender && user?.name) return msg.sender === user.name;
    return false;
  };

  return (
    <div className="flex h-[80vh] w-full gap-4 p-4 bg-muted">
      {/* LEFT: Groups list */}
      <Card className="w-full max-w-xs flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Your Groups</CardTitle>
          <CardDescription>Select a group to join the conversation.</CardDescription>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto space-y-2">
          {groups.length > 0 ? (
            groups.map((group) => {
              const selected = currentGroup?.id === group.id;
              return (
                <button
                  key={group.id}
                  onClick={() => setCurrentGroup(group)}
                  className={[
                    "w-full text-left px-3 py-2 rounded-lg border transition",
                    "flex items-center justify-between",
                    selected
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background hover:bg-accent border-border",
                  ].join(" ")}
                >
                  <span className="font-medium truncate">{group.title}</span>
                </button>
              );
            })
          ) : (
            <p className="text-sm text-muted-foreground">
              No groups yet. Once you’re added to a group, it’ll show up here.
            </p>
          )}
        </CardContent>
      </Card>

      {/* RIGHT: Chat panel */}
      <Card className="flex-1 flex flex-col">
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center justify-between gap-2">
            <div>
              <CardTitle className="text-lg">
                {currentGroup ? currentGroup.title : "Select a Group"}
              </CardTitle>
              <CardDescription className="mt-1">
                {currentGroup
                  ? `Chat with everyone in ${currentGroup.title}.`
                  : "Choose a group on the left to start chatting."}
              </CardDescription>
            </div>

            {user && (
              <div className="text-xs text-muted-foreground text-right">
                Signed in as
                <div className="font-medium text-foreground">{user.name}</div>
              </div>
            )}
          </div>
        </CardHeader>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-background">
          {!currentGroup ? (
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
              Pick a group from the left to view messages.
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
              No messages yet. Say hi! 👋
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {messages.map((msg, index) => {
                const own = isOwnMessage(msg);
                return (
                  <div
                    key={index}
                    className={["flex w-full", own ? "justify-end" : "justify-start"].join(" ")}
                  >
                    <div
                      className={[
                        "max-w-[70%] rounded-xl px-3 py-2 text-sm shadow-sm",
                        "whitespace-pre-wrap break-words",
                        own
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-accent text-foreground rounded-bl-sm",
                      ].join(" ")}
                    >
                      <div className="text-[11px] font-semibold mb-1 opacity-80 flex items-center justify-between gap-2">
                        <span className="truncate">{msg.sender || "Unknown"}</span>
                        {msg.time ? (
                          <span className="text-[10px] font-normal opacity-70">
                            {String(msg.time)}
                          </span>
                        ) : null}
                      </div>
                      <div>{msg.msg}</div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <form
          onSubmit={sendMessage}
          className="border-t px-3 py-2 flex items-center gap-2 bg-muted/60"
        >
          <Input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={currentGroup ? "Type a message..." : "Select a group to chat"}
            disabled={!currentGroup}
            className="flex-1"
          />
          <Button type="submit" disabled={!currentGroup || !message.trim()}>
            Send
          </Button>
        </form>
      </Card>
    </div>
  );
}
