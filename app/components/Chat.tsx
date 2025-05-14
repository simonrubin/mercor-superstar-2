// Chat.tsx

"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import cx from "classnames";
import ChatBubble from "./ChatBubble";
import { Business } from "./MapPopup";

interface Message {
  role: string;
  content: {
    type: string;
    text?: { value: string; link?: string };
    spreadsheet?: { title: string; url: string };
    email?: { subject: string; body: string };
    businesses?: Business[];
    traffic?: any;
  }[];
}

interface ChatProps {
  sessionId: string;
  className?: string;
  onAction: (action: string, args: any) => void;
}

const SAMPLE_PROMPTS = [
  "Find coffee shops in Berlin",
  "Find nail salons in New York",
  "Find restaurants in London",
  "Find spas in Paris",
];

export default function Chat({ sessionId, className, onAction }: ChatProps) {
  const [typingMessage, setTypingMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [samplePrompts, setSamplePrompts] = useState<string[]>(SAMPLE_PROMPTS);

  useEffect(() => {
    // Scroll to the newest message
    document.querySelector(".chat-bubble:last-of-type")?.scrollIntoView();
  }, [messages]);

  const sendSamplePrompt = async (prompt: string) => {
    sendMessage(prompt); // This will also clear the typingMessage
    setSamplePrompts([]); // Clears the sample messages
  };

  const sendMessage = async (message: string) => {
    if (!message) return;

    // Add the new message to the chat
    const newMessage = {
      role: "user",
      content: [{ type: "text", text: { value: message } }],
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);

    // Clear the typing area if the message was manually typed
    setTypingMessage("");
    setSamplePrompts([]); // Clear sample prompts when user sends a message
    adjustTextAreaHeight();
    setLoading(true);

    try {
      const response = await axios.post("/api/chat", {
        query: message,
        sessionId: sessionId,
      });

      const newMessages = [] as Message[];

      if (response.data.spreadsheet) {
        newMessages.push({
          role: "assistant",
          content: [
            {
              type: "spreadsheet",
              spreadsheet: {
                title: response.data.spreadsheet["title"],
                url: response.data.spreadsheet["url"],
              },
              text: { value: response.data.chat },
            },
          ],
        });
      }

      if (response.data.email) {
        newMessages.push({
          role: "assistant",
          content: [
            {
              type: "email",
              email: {
                subject: response.data.email["subject"],
                body: response.data.email["body"],
              },
            },
          ],
        });
      }

      if (response.data.businesses) {
        newMessages.push({
          role: "assistant",
          content: [
            {
              type: "businesses",
              businesses: response.data.businesses,
              text: { value: response.data.chat },
            },
          ],
        });

        onAction("showBusinesses", response.data.businesses);
      }

      if (response.data.traffic) {
        newMessages.push({
          role: "assistant",
          content: [
            {
              type: "traffic",
              traffic: response.data.traffic,
              text: { value: response.data.chat },
            },
          ],
        });
      }

      if (
        response.data.chat &&
        !response.data.email &&
        !response.data.businesses &&
        !response.data.feedback &&
        !response.data.promising &&
        !response.data.traffic &&
        !response.data.spreadsheet
      ) {
        newMessages.push({
          role: "assistant",
          content: [{ type: "text", text: { value: response.data.chat } }],
        });
      }

      setMessages((prevMessages) => [...prevMessages, ...newMessages]);

      if (response.data.feedback) {
        newMessages.push({
          role: "assistant",
          content: [
            {
              type: "businesses",
              businesses: response.data.feedback,
              text: { value: response.data.chat },
            },
          ],
        });

        onAction("showInterestedBusinesses", response.data.feedback);
      }

      if (response.data.promising) {
        newMessages.push({
          role: "assistant",
          content: [
            {
              type: "businesses",
              businesses: response.data.promising,
              text: { value: response.data.chat },
            },
          ],
        });

        onAction("showPromisingBusinesses", response.data.promising);
      }
    } catch (err) {
      onAction("showError", err);
    } finally {
      setLoading(false);
    }
  };

  const adjustTextAreaHeight = () => {
    setTimeout(() => {
      const element = document.querySelector(
        "#typing-area"
      ) as HTMLTextAreaElement;
      if (element) {
        element.style.height = "auto";
        element.style.height = `${element.scrollHeight}px`;
      }
    });
  };

  const highlightBusiness = (business?: Business) => {
    onAction("highlightBusiness", business);
  };

  return (
    <>
      <div
        className={`flex flex-col h-full overflow-hidden pb-6 gap-5 max-w-full ${className}`}
      >
        <div
          id="chatbox"
          className="overflow-auto flex flex-col px-4 gap-2"
          style={{ flexGrow: 1 }}
        >
          {messages.map((message, index) => (
            <ChatBubble
              key={index}
              {...message}
              onHighlightBusiness={highlightBusiness}
            />
          ))}
          {loading && (
            <ChatBubble role="assistant" type="thinking" content={undefined} />
          )}
        </div>

        {/* Sample messages */}
        {samplePrompts.length > 0 && (
          <div className="grid grid-cols-2 gap-3 mx-4 mb-2">
            {samplePrompts.map((msg, index) => (
              <button
                key={index}
                onClick={() => sendSamplePrompt(msg)}
                className="sample-message bg-primary text-white p-2 rounded shadow"
              >
                {msg}
              </button>
            ))}
          </div>
        )}

        {/* Chat input form */}
        <div className="mx-4 shadow shadow-primary rounded-lg">
          <form
            className="flex"
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(typingMessage);
            }}
          >
            <textarea
              id="typing-area"
              onInput={adjustTextAreaHeight}
              onKeyDown={(e) => {
                if (e.key == "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(typingMessage);
                }
              }}
              rows={1}
              className="flex-grow px-4 py-4 text-on-container h-[56px] max-h-[200px] bg-transparent outline-none resize-none"
              placeholder="Send a message"
              value={typingMessage}
              onChange={(e) => setTypingMessage(e.target.value)}
            />
            <div className="flex items-center px-3">
              <button
                type="submit"
                className={cx(
                  "flex justify-center items-center rounded w-[35px] h-[35px] transition-all ease-in-out",
                  { "bg-primary": typingMessage && !loading }
                )}
                disabled={loading || !typingMessage}
              >
                <svg
                  width={16}
                  height={16}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 512 512"
                >
                  <path
                    fill={typingMessage && !loading ? "#fff" : "#9ca3af"}
                    d="M49.9 27.8C15.1 12.7-19.2 50.1-1.2 83.5L68.1 212.2c4.4 8.3 12.6 13.8 21.9 15c0 0 0 0 0 0l176 22c3.4 .4 6 3.3 6 6.7s-2.6 6.3-6 6.7l-176 22s0 0 0 0c-9.3 1.2-17.5 6.8-21.9 15L-1.2 428.5c-18 33.4 16.3 70.8 51.1 55.7L491.8 292.7c32.1-13.9 32.1-59.5 0-73.4L49.9 27.8z"
                  />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
