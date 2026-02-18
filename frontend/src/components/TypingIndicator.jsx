import { Bot } from 'lucide-react'

export default function TypingIndicator() {
  return (
    <div className="flex gap-3 animate-fade-in">
      <div className="w-7 h-7 rounded-full shrink-0 bg-surface-3 border border-border flex items-center justify-center mt-0.5">
        <Bot size={13} className="text-white/50" />
      </div>
      <div className="px-4 py-3.5 rounded-2xl rounded-tl-sm bg-surface-2 border border-border flex items-center gap-1.5">
        {[0, 1, 2].map(i => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-white/30 animate-pulse-dot"
            style={{ animationDelay: `${i * 0.16}s` }}
          />
        ))}
      </div>
    </div>
  )
}
