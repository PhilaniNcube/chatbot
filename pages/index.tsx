import Image from 'next/image'
import { Inter } from 'next/font/google'
import {Fragment, useCallback, useRef, useState} from 'react'

const inter = Inter({ subsets: ['latin'] })

interface Conversation {
  role: string,
  content: string
}

export default function Home() {

// initiate state
const [value, setValue] = useState<string>("")
const [loading, setLoading] = useState<boolean>(false)
const [conversation, setConversation] = useState<Conversation[]>([]);

const inputRef = useRef<HTMLInputElement>(null)

//handle input function
const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
  setValue(e.target.value)
}, [])

//handle key down function
const handleKeyDown = async (e:React.KeyboardEvent<HTMLInputElement>) => {
  if(e.key === "Enter") {
    setLoading(true)
    const chatHistory = [...conversation, {role: "user", content: value}]
    const response = await fetch("/api/openaiChat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: chatHistory
      }),
    })

    const data = await response.json()
    setValue("")
    setConversation([
      ...chatHistory,
      { role: "assistant", content: data.result.choices[0].message.content },
    ]);
    setLoading(false)
  }
}

const handleRefresh = () => {
  inputRef.current?.focus()
  setValue("")
  setConversation([])
  setLoading(false)
}

  return (
    <main className="flex min-h-screen flex-col justify-start items-center w-3/4 mx-auto">
      <div className="flex flex-col items-center justify-center mt-20 text-center ">
        <h1 className="text-3xl">Hello, I am your helpful AI Chat Bot</h1>
      </div>
      <div className="my-12 flex flex-col">
        <p className="mb-6 font-bold">Please type your prompt</p>

        <input
          placeholder="Type here"
          className="w-full max-w-xs input input-bordered input-secondary "
          value={value}
          onChange={handleInput}
          ref={inputRef}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
        <button
          type="button"
          onClick={handleRefresh}
          className="mt-6 btn btn-info w-full max-w-xs"
        >
          Start New Conversation
        </button>
        <div className="textarea border-spacing-2 border-2 border-slate-300 rounded-lg mt-3">
          {conversation.map((item, index) => (
            <Fragment key={index}>
              <br />
              {item.role === "assistant" ? (
                <div className="chat chat-end">
                  <div className="chat-bubble chat-bubble-secondary">
                    <strong className="badge badge-primary">Bot</strong>
                    <br />
                    <span className="text-md">{item.content}</span>
                  </div>
                </div>
              ) : (
                <div className="chat chat-start">
                  <div className="chat-bubble chat-bubble-primary">
                    <strong className="badge badge-primary">User</strong>
                    <br />
                    <span className="text-md">{item.content}</span>
                  </div>
                </div>
              )}
            </Fragment>
          ))}

          {loading && (
            <div className="chat chat-start">
              <div className="chat-bubble chat-bubble-info">

                <br />
                <span className="text-md">Loading...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
