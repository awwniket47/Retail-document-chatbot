import ReactMarkdown from 'react-markdown'
import { FileText, Bot, User } from 'lucide-react'

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex gap-3 animate-slide-up ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center mt-0.5
        ${isUser
          ? 'bg-accent/20 border border-accent/30'
          : 'bg-surface-3 border border-border'
        }`}
      >
        {isUser
          ? <User size={13} className="text-accent" />
          : <Bot size={13} className="text-white/50" />
        }
      </div>

      <div className={`flex flex-col gap-1.5 max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Bubble */}
        <div className={`
          px-4 py-3 rounded-2xl text-sm leading-relaxed
          ${isUser
            ? 'bg-accent/20 border border-accent/20 text-white/90 rounded-tr-sm'
            : message.error
              ? 'bg-red-500/10 border border-red-500/20 text-red-300/90 rounded-tl-sm'
              : 'bg-surface-2 border border-border text-white/80 rounded-tl-sm'
          }
        `}>
          {isUser ? (
            <p>{message.content}</p>
          ) : (
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                code: ({ children }) => (
                  <code className="font-mono text-xs bg-black/30 px-1.5 py-0.5 rounded text-accent-light">
                    {children}
                  </code>
                ),
                pre: ({ children }) => (
                  <pre className="font-mono text-xs bg-black/30 p-3 rounded-lg overflow-x-auto mt-2 mb-2 border border-border">
                    {children}
                  </pre>
                ),
                strong: ({ children }) => <strong className="text-white/90 font-semibold">{children}</strong>,
                ul: ({ children }) => <ul className="list-disc list-inside space-y-1 my-2">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 my-2">{children}</ol>,
                li: ({ children }) => <li className="text-white/70">{children}</li>,
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>

        {/* Sources */}
        {!isUser && message.sources?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {message.sources.map((src, i) => (
              <span
                key={i}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-3 border border-border text-white/30 text-xs"
              >
                <FileText size={10} />
                {src}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
