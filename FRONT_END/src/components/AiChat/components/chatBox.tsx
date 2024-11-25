"use client";

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
}

interface ChatBoxProps {
  onClose: () => void;
  onSendMessage?: (message: string) => void;
}

interface ExampleQuestion {
  id: string;
  text: string;
}

const EXAMPLE_QUESTIONS: ExampleQuestion[] = [
  { id: "1", text: "What is RecruitMe" },
  {
    id: "2",
    text: "How my interview process will occur?",
  },
  { id: "3", text: "How my data is sercured?" },
  {
    id: "4",
    text: "What is FPT education ecosystem?",
  },
];

import React, {
  useState,
  FormEvent,
  ChangeEvent,
  useRef,
  useEffect,
} from "react";
import { MessageCircle, Send, X } from "lucide-react";
import systemApi from "@/api/systemApi";
import Markdown from "react-markdown"

export default function ChatBox({
    onClose,
    onSendMessage,
  }: ChatBoxProps): JSX.Element {
    const [message, setMessage] = useState<string>("");
    const [messages, setMessages] = useState<Message[]>([
      {
        id: "welcome",
        content: "Hello! I'm your AI assistant. How can I help you today?",
        sender: "ai",
        timestamp: new Date(),
      },
    ]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
  
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
  
    useEffect(() => {
      scrollToBottom();
    }, [messages, isLoading]); // Add isLoading to dependencies
  
    const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
      e.preventDefault();
      if (message.trim()) {
        const userMessage: Message = {
          id: Date.now().toString(),
          content: message.trim(),
          sender: "user",
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, userMessage]);
        onSendMessage?.(message);
        setMessage("");
        await getAiResponse(message.trim());
      }
    };
  
    const getAiResponse = async (input: string) => {
      setIsLoading(true);
      try {
        const response = await systemApi.getAIResponse(input);
        const aiMessage: Message = {
          id: Date.now().toString(),
          content: response.response,
          sender: "ai",
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
      } catch (error) {
        const errorMessage: Message = {
          id: Date.now().toString(),
          content: "Sorry, I couldn't process your request. Please try again.",
          sender: "ai",
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    };
  
    const handleMessageChange = (e: ChangeEvent<HTMLInputElement>): void => {
      setMessage(e.target.value);
    };
  
    const handleExampleQuestionClick = async (question: ExampleQuestion): Promise<void> => {
      const userMessage: Message = {
        id: Date.now().toString(),
        content: question.text,
        sender: "user",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMessage]);
      onSendMessage?.(question.text);
      await getAiResponse(question.text);
    };
  
    const renderMessages = () => {
      return (
        <>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 mb-4 ${
                msg.sender === "user" ? "flex-row-reverse space-x-reverse" : ""
              }`}
            >
              {msg.sender === "ai" && (
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-themeOrange text-sm font-semibold">AI</span>
                </div>
              )}
              <div className={`flex-1 ${msg.sender === "user" ? "text-right" : ""}`}>
                <div
                  className={`inline-block p-3 rounded-lg shadow-sm ${
                    msg.sender === "user"
                      ? "bg-themeOrange text-white"
                      : "bg-white border border-textSecondary text-textSecondary"
                  }`}
                >
                  <Markdown>{msg.content}</Markdown>
                </div>
              </div>
            </div>
          ))}
  
          {isLoading && (
            <div className="flex items-start space-x-3 mb-4 animate-fadeIn">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <span className="text-themeOrange text-sm font-semibold">AI</span>
              </div>
              <div className="flex-1">
                <div className="inline-block bg-white p-3 rounded-lg shadow-sm">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-themeOrange rounded-full animate-bounce" 
                         style={{ animationDelay: "0ms" }}></div>
                    <div className="w-2 h-2 bg-themeOrange rounded-full animate-bounce" 
                         style={{ animationDelay: "150ms" }}></div>
                    <div className="w-2 h-2 bg-themeOrange rounded-full animate-bounce" 
                         style={{ animationDelay: "300ms" }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      );
    };
  
    return (
      <div className="w-full bottom-32 bg-white rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-white py-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <MessageCircle color="#f16e21" />
            <h3 className="font-semibold text-themeOrange">AI Assistant</h3>
          </div>
        </div>
  
        {/* Chat Area */}
        <div
          className="h-96 overflow-y-auto p-4 bg-gray-50"
          role="log"
          aria-live="polite"
        >
          {renderMessages()}
  
          {/* Example Questions Section */}
          {messages.length === 1 && !isLoading && (
            <div className="my-4">
              <p className="text-sm text-themeOrange mb-2">You can try asking:</p>
              <div className="grid grid-cols-1 gap-2">
                {EXAMPLE_QUESTIONS.map((question) => (
                  <button
                    key={question.id}
                    onClick={() => handleExampleQuestionClick(question)}
                    className="text-left px-4 py-2 bg-blurEffectGold rounded-lg border border-gray-200 text-themeWhite hover:bg-gray-50 transition-colors"
                    aria-label={`Ask question: ${question.text}`}
                  >
                    {question.text}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
  
        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-200">
          <form onSubmit={handleSubmit} className="flex items-center space-x-2">
            <input
              type="text"
              value={message}
              onChange={handleMessageChange}
              placeholder="Type your message..."
              className="flex-1 text-textSecondary px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Message input"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!message.trim() || isLoading}
              aria-label="Send message"
            >
              <Send size={20} color="#f16e21" />
            </button>
          </form>
        </div>
      </div>
    );
  }