import { useEffect, useRef, useState } from "react";
import { Avatar, notification } from "antd";
import { io } from "socket.io-client";
import type { Socket } from "socket.io-client";
import _env from "../../utils/_env";
import { useAuth } from "../../providers/AuthContext";
import { getUserImage } from "../../hooks/image";

type Contact = {
  _id: string;
  fullName: string;
  role: "doctor" | "patient" | "admin";
  email?: string;
  patientId?: string;
  profile_image?: string;
};

type Message = {
  _id: string;
  senderId: Contact | string;
  receiverId: Contact | string;
  text: string;
  createdAt: string;
};

const Messages = () => {
  const { user, token } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const notifiedSocketErrorRef = useRef(false);

  const upsertMessage = (incoming: Message) => {
    setMessages((prev) => {
      const exists = prev.some((message) => message._id === incoming._id);

      if (exists) {
        return prev.map((message) =>
          message._id === incoming._id ? incoming : message,
        );
      }

      return [...prev, incoming].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    });
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const fetchContacts = async () => {
      if (!token) return;

      try {
        const res = await fetch(`${_env.SERVER_URL}/chat/contacts`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Failed to load contacts");

        setContacts(data);
        if (data[0]?._id) setSelectedContact(data[0]);
      } catch (err) {
        notification.error({
          message:
            err instanceof Error ? err.message : "Failed to load contacts",
        });
      }
    };

    fetchContacts();
  }, [token]);

  const fetchMessages = async (contactId: string) => {
    if (!token) return;

    try {
      const res = await fetch(`${_env.SERVER_URL}/chat/${contactId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to load messages");

      setMessages(data);
    } catch (err) {
      notification.error({
        message:
          err instanceof Error ? err.message : "Failed to load messages",
      });
    }
  };

  useEffect(() => {
    if (selectedContact) fetchMessages(selectedContact._id);
  }, [selectedContact?._id, token]);

  useEffect(() => {
    if (!token || !user?._id) return;

    const socketServerUrl = _env.SERVER_URL.replace(/\/api\/?$/, "");
    const socket = io(socketServerUrl, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;
    notifiedSocketErrorRef.current = false;

    const handleIncomingMessage = (message: Message) => {
      const senderId =
        typeof message.senderId === "string"
          ? message.senderId
          : message.senderId._id;
      const receiverId =
        typeof message.receiverId === "string"
          ? message.receiverId
          : message.receiverId._id;

      const isActiveConversation =
        !!selectedContact &&
        [senderId, receiverId].includes(selectedContact._id) &&
        [senderId, receiverId].includes(user._id);

      if (isActiveConversation) {
        upsertMessage(message);
      }
    };

    const handleSocketError = () => {
      if (notifiedSocketErrorRef.current) return;

      notifiedSocketErrorRef.current = true;
      notification.error({
        message: "Real-time chat connection failed",
      });
    };

    socket.on("message:new", handleIncomingMessage);
    socket.on("message:sent", handleIncomingMessage);
    socket.on("connect_error", handleSocketError);

    return () => {
      socket.off("message:new", handleIncomingMessage);
      socket.off("message:sent", handleIncomingMessage);
      socket.off("connect_error", handleSocketError);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [selectedContact, token, user?._id]);

  const handleSend = async () => {
    if (!token || !selectedContact || !input.trim()) return;

    try {
      const res = await fetch(`${_env.SERVER_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ receiverId: selectedContact._id, text: input }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to send message");

      upsertMessage(data);
      setInput("");
    } catch (err) {
      notification.error({
        message:
          err instanceof Error ? err.message : "Failed to send message",
      });
    }
  };

return (
  <div className="h-[calc(100vh-80px)] flex bg-gray-100">

    {/* 📱 CONTACT LIST */}
    <div
      className={`
        ${selectedContact ? "hidden md:flex" : "flex"}
        w-full md:w-[320px] flex-col border-r bg-white
      `}
    >
      <div className="p-4 font-semibold border-b bg-gray-100">
        Chats
      </div>

      <div className="flex-1 overflow-y-auto">
        {contacts.map((contact) => (
          <div
            key={contact._id}
            onClick={() => setSelectedContact(contact)}
            className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-100 ${
              selectedContact?._id === contact._id ? "bg-gray-200" : ""
            }`}
          >
            <Avatar src={getUserImage(contact.profile_image)}>
              {contact.fullName[0]}
            </Avatar>

            <div>
              <p className="font-medium">{contact.fullName}</p>
              <p className="text-xs text-gray-500">
                {contact.role}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* 💬 CHAT SECTION */}
    <div
      className={`
        ${selectedContact ? "flex" : "hidden md:flex"}
        flex-1 flex-col
      `}
    >
      {/* 🔝 HEADER */}
      <div className="flex items-center gap-3 p-3 border-b bg-white sticky top-0 z-10">

        {/* 🔙 Mobile back */}
        <button
          onClick={() => setSelectedContact(null)}
          className="md:hidden text-lg"
        >
          ←
        </button>

        <Avatar src={getUserImage(selectedContact?.profile_image)} className="border rounded-full">
          {selectedContact?.fullName?.[0]}
        </Avatar>

        <div>
          <p className="font-semibold">
            {selectedContact?.fullName || "Select chat"}
          </p>
          <p className="text-xs text-gray-500">
            {selectedContact?.role}
          </p>
        </div>
      </div>

      {/* 💬 MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#efeae2]">

        {messages.map((msg) => {
          const senderId =
            typeof msg.senderId === "string"
              ? msg.senderId
              : msg.senderId._id;

          const isMe = senderId === user?._id;

          return (
            <div
              key={msg._id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`
                  max-w-[75%] px-3 py-2 rounded-xl text-sm shadow
                  ${isMe
                    ? "bg-[#dcf8c6] text-black rounded-br-none"
                    : "bg-white rounded-bl-none"}
                `}
              >
                <p>{msg.text}</p>

                <span className="block text-[10px] text-gray-500 text-right mt-1">
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      {/* ✏️ INPUT */}
      <div className="p-3 bg-white border-t flex items-center gap-2 sticky bottom-0">

        <input
          type="text"
          className="flex-1 px-4 py-2 rounded-full border bg-gray-100 focus:outline-none"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          disabled={!selectedContact}
        />

        <button
          onClick={handleSend}
          disabled={!selectedContact || !input.trim()}
          className="bg-green-500 text-white px-4 py-2 rounded-full disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  </div>
);
};

export default Messages;
