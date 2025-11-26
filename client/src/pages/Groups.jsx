import React, { useEffect, useState } from "react";
import { socket } from "../socket";


export default function Groups() {

const [user, setUser] = useState(null);
const [groups, setGroups] = useState([]);
const [message, setMessage] = useState("");
const [messages, setMessages] = useState([]);
const [currentGroup, setCurrentGroup] = useState(null);


useEffect(() => {
    const token = localStorage.getItem("token");
    if(!token) return;

    try{
        const data = JSON.parse(atob(token.split(".")[1]));
        setUser({id:data.id, name: data.name});
        console.log("Decoded user:", data);
    }
    catch(err){
        console.error("Error decoding token for username", err);
    }

},[]);

useEffect(() => {
    const fetchGroups = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("https://lets-go.site/api/groups", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setGroups(data);
        }
        catch(err){
            console.error("Error Loading groups..", err);
        }
    };
    fetchGroups();
},[]);



useEffect(() => {
    if(!currentGroup) return; //Dont connect until a group was clicked/selected.



    if (socket.currentRoom && socket.currentRoom !== currentGroup.id) {
        console.log(`Client leaving previous room ${socket.currentRoom}`);
        socket.emit("leaveGroup", socket.currentRoom);
        socket.currentRoom = null;
    }

    //Join new room
    console.log(`➡️ Client: joining room ${currentGroup.id}`);
    socket.emit("joinGroup", currentGroup.id);
    socket.currentRoom = currentGroup.id; 

    setMessages([]);


    if(socket.connected){
        console.log("Connection test", socket.id);
    }

    socket.on("connect",() => {
        console.log("Connected to Socket.IO,", socket.id);
    }
    );
    socket.on("disconnect",() => {
        console.log("Disconnected Socket.IO,", socket.id);
    }
    );

    socket.on("chat message",(data) => {
        console.log("Received Message:", data);
        setMessages((prev) => [...prev, data]);
    }
    );

    return () => {
        socket.off("connect");
        socket.off("disconnect");
        socket.off("chat message");
    };

},[currentGroup]);

const sendMessage = (e) => {
    e.preventDefault();
    if(!currentGroup || !message.trim())return;
    socket.emit("chat message", { groupID: currentGroup.id, msg: message , sender: user?.name});
    setMessage("");
};

return (
    <div
    style={{
        height: "80vh",     
        width: "100%",
        backgroundColor: "#f5f5f5",
        display: "flex",
    }}
    >
    <div

    style={{
        height: "80vh",     
        width: "25%",
        backgroundColor: "#3b80b8ff",
    }}
    >
        <div
  style={{
    height: "80vh",
    width: "100%",
    backgroundColor: "#3b80b8ff",
    color: "white",
    padding: "10px",
    overflowY: "auto",
  }}
>
  <h3 style={{ marginBottom: "10px" }}>Your Groups</h3>

  {groups.length > 0 ? (
    groups.map((group) => (
      <div
        key={group.id}
        style={{
          backgroundColor: "#4c8fd1",
          padding: "10px",
          borderRadius: "8px",
          marginBottom: "8px",
          cursor: "pointer",
          transition: "background 0.3s",
          
        }}
        onClick={() => setCurrentGroup(group)}
      >
        {group.title}
      </div>
    ))
  ) : (
    <p>No groups yet!</p>
  )}
</div>

    </div>
    <div

    style={{
        height: "80vh",
        width: "75%",
        backgroundColor: "#570000ff",
        display: "flex",              
        flexDirection: "column",      
        justifyContent: "space-between",
    }}
    >
        <div
            style={{
                flex:1,
                overflowY: "auto",
                backgroundColor: "#0ba766ff",
                padding: "10px",
                color: "black",
                textAlign: "left",
                display: "flex",          
                flexDirection: "column",  
                alignItems: "flex-start",
                
                
            }}
        >
            {messages.map((msg, index) => (
                <div key={index} style={{marginBottom: "8px",
                    backgroundColor: "#09e2ffff",
                    padding: "8px 12px",
                    borderRadius: "10px",
                    marginBottom: "8px",
                    display: "inline-block",
                    wordWrap: "break-word",     
                    overflowWrap: "break-word",  
                    maxWidth: "70%",             
                    whiteSpace: "pre-wrap",    
                    minWidth: "10%",
                }}>
                    <strong>{msg.sender}:</strong> {msg.msg}
                    </div>
            )
        )}
        </div>
        <div
    style={{
        height: "5vh",
        width: "100%",
        backgroundColor: "#ffaf01ff",
        display: "flex",          
        alignItems: "center",     
        padding: "0 10px",
        boxSizing: "border-box",
    }}
    >
    <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
        style={{
        flex: 1,                
        height: "60%",
        borderRadius: "20px",
        border: "none",
        padding: "0 12px",
        outline: "none",
        }}
    />
    <button
        onClick={sendMessage}
        style={{
        marginLeft: "10px",
        padding: "8px 16px",
        backgroundColor: "#333",
        color: "white",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        }}
    >
        Send
    </button>
    </div>
    </div>
        


    </div>
);
}
