'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// ═══════════════════════════════════════════════════════════════
// KAWAII AI - Your Cute AI Companion 💕
// Version 2.0 - Rebuilt from scratch, 10x better
// ═══════════════════════════════════════════════════════════════

type Screen = 'landing' | 'auth' | 'theme' | 'age' | 'avatar' | 'name' | 'chat' | 'pricing'
type AgeGroup = 'junior' | 'teen' | 'young-adult' | 'plus'
type Theme = 'pink' | 'lavender' | 'rose' | 'sage' | 'sky' | 'coral' | 'mint' | 'berry' | 'peach' | 'lilac'
type Tier = 'FREE' | 'PREMIUM' | 'ULTIMATE'

interface Message {
  id: number
  text: string
  sender: 'user' | 'ai'
  time: Date
  stickers?: string[]
  isVoice?: boolean
}

interface CallMessage {
  role: 'user' | 'ai'
  text: string
}

// ═══════════════════════════════════════════════════════════════
// BEAUTIFUL COLOR THEMES (10 total)
// ═══════════════════════════════════════════════════════════════

const THEMES: Record<Theme, { name: string; emoji: string; colors: { bg: string; primary: string; secondary: string; accent: string } }> = {
  pink: { 
    name: 'Pink Blush', emoji: '🎀', 
    colors: { bg: 'linear-gradient(135deg, #FFE4EC 0%, #FFB6C1 50%, #FF69B4 100%)', primary: '#FF69B4', secondary: '#FFB6C1', accent: '#FF1493' }
  },
  lavender: { 
    name: 'Lavender Dreams', emoji: '💜', 
    colors: { bg: 'linear-gradient(135deg, #E6E6FA 0%, #DDA0DD 50%, #9B59B6 100%)', primary: '#9B59B6', secondary: '#DDA0DD', accent: '#8B008B' }
  },
  rose: { 
    name: 'Rose Gold', emoji: '🌹', 
    colors: { bg: 'linear-gradient(135deg, #FFF0F3 0%, #F4C2C2 50%, #D4A5A5 100%)', primary: '#D4A5A5', secondary: '#F4C2C2', accent: '#B76E79' }
  },
  sage: { 
    name: 'Sage Green', emoji: '🌿', 
    colors: { bg: 'linear-gradient(135deg, #E8F5E9 0%, #A8D5BA 50%, #7D9A78 100%)', primary: '#7D9A78', secondary: '#A8D5BA', accent: '#4A7C59' }
  },
  sky: { 
    name: 'Sky Blue', emoji: '☁️', 
    colors: { bg: 'linear-gradient(135deg, #E0F7FA 0%, #81D4FA 50%, #5DADE2 100%)', primary: '#5DADE2', secondary: '#81D4FA', accent: '#0288D1' }
  },
  coral: { 
    name: 'Coral Sunset', emoji: '🌅', 
    colors: { bg: 'linear-gradient(135deg, #FFF3E0 0%, #FFAB91 50%, #FF7F7F 100%)', primary: '#FF7F7F', secondary: '#FFAB91', accent: '#FF5722' }
  },
  mint: { 
    name: 'Mint Fresh', emoji: '🍃', 
    colors: { bg: 'linear-gradient(135deg, #E0F2F1 0%, #80CBC4 50%, #3EB489 100%)', primary: '#3EB489', secondary: '#80CBC4', accent: '#00796B' }
  },
  berry: { 
    name: 'Berry Purple', emoji: '🫐', 
    colors: { bg: 'linear-gradient(135deg, #F3E5F5 0%, #CE93D8 50%, #8E44AD 100%)', primary: '#8E44AD', secondary: '#CE93D8', accent: '#6A1B9A' }
  },
  peach: { 
    name: 'Peachy Keen', emoji: '🍑', 
    colors: { bg: 'linear-gradient(135deg, #FFF8E1 0%, #FFCC80 50%, #FFAB91 100%)', primary: '#FFAB91', secondary: '#FFCC80', accent: '#FF8A65' }
  },
  lilac: { 
    name: 'Soft Lilac', emoji: '🪻', 
    colors: { bg: 'linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 50%, #B39DDB 100%)', primary: '#B39DDB', secondary: '#E1BEE7', accent: '#9575CD' }
  },
}

// ═══════════════════════════════════════════════════════════════
// AGE GROUPS
// ═══════════════════════════════════════════════════════════════

const AGES: Record<AgeGroup, { title: string; range: string; desc: string; vibe: string }> = {
  junior: { title: 'Kawaii Junior', range: '8-12', desc: 'Fun, safe & magical!', vibe: 'Playful' },
  teen: { title: 'Kawaii Teen', range: '13-17', desc: 'Your aesthetic bestie!', vibe: 'Trendy' },
  'young-adult': { title: 'Kawaii Young Adult', range: '18-25', desc: 'Life, love & dreams!', vibe: 'Modern' },
  plus: { title: 'Kawaii Plus', range: '25-35', desc: 'Wellness & growth!', vibe: 'Elegant' },
}

// ═══════════════════════════════════════════════════════════════
// AVATARS (6 per age group = 24 total)
// ═══════════════════════════════════════════════════════════════

const AVATARS: Record<AgeGroup, { id: string; name: string; emoji: string; color: string; personality: string }[]> = {
  junior: [
    { id: 'bunny', name: 'Bunny', emoji: '🐰', color: '#FFB6C1', personality: 'Playful & curious' },
    { id: 'kitty', name: 'Kitty', emoji: '🐱', color: '#DDA0DD', personality: 'Sweet & gentle' },
    { id: 'panda', name: 'Panda', emoji: '🐼', color: '#B0E0E6', personality: 'Calm & friendly' },
    { id: 'bear', name: 'Bear', emoji: '🐻', color: '#F5DEB3', personality: 'Warm & caring' },
    { id: 'fox', name: 'Foxy', emoji: '🦊', color: '#FFA07A', personality: 'Clever & fun' },
    { id: 'owl', name: 'Owly', emoji: '🦉', color: '#E6E6FA', personality: 'Wise & kind' },
  ],
  teen: [
    { id: 'luna', name: 'Luna', emoji: '🌟', color: '#E6E6FA', personality: 'Dreamy & creative' },
    { id: 'aria', name: 'Aria', emoji: '🌙', color: '#B0C4DE', personality: 'Calm & thoughtful' },
    { id: 'sakura', name: 'Sakura', emoji: '🌸', color: '#FFB6C1', personality: 'Cheerful & sweet' },
    { id: 'marina', name: 'Marina', emoji: '🌊', color: '#87CEEB', personality: 'Free-spirited' },
    { id: 'ember', name: 'Ember', emoji: '🔥', color: '#FFA07A', personality: 'Passionate & bold' },
    { id: 'willow', name: 'Willow', emoji: '🍃', color: '#98FB98', personality: 'Gentle & caring' },
  ],
  'young-adult': [
    { id: 'aurora', name: 'Aurora', emoji: '💎', color: '#E0FFFF', personality: 'Elegant & wise' },
    { id: 'rosa', name: 'Rosa', emoji: '🌹', color: '#FFB6C1', personality: 'Graceful & kind' },
    { id: 'nova', name: 'Nova', emoji: '👑', color: '#FFD700', personality: 'Confident & supportive' },
    { id: 'lotus', name: 'Lotus', emoji: '🪷', color: '#FFB6C1', personality: 'Serene & mindful' },
    { id: 'celeste', name: 'Celeste', emoji: '🦋', color: '#DDA0DD', personality: 'Transformative' },
    { id: 'phoenix', name: 'Phoenix', emoji: '🔥', color: '#FF6B6B', personality: 'Resilient & inspiring' },
  ],
  plus: [
    { id: 'sage', name: 'Sage', emoji: '🔮', color: '#E6E6FA', personality: 'Insightful & calm' },
    { id: 'harbor', name: 'Harbor', emoji: '⚓', color: '#B0C4DE', personality: 'Steady & reliable' },
    { id: 'summit', name: 'Summit', emoji: '🏔️', color: '#E0FFFF', personality: 'Strong & supportive' },
    { id: 'oak', name: 'Oak', emoji: '🌳', color: '#98FB98', personality: 'Grounded & wise' },
    { id: 'sol', name: 'Sol', emoji: '☀️', color: '#FFD700', personality: 'Warm & encouraging' },
    { id: 'pearl', name: 'Pearl', emoji: '🐚', color: '#FFF5EE', personality: 'Patient & nurturing' },
  ],
}

// ═══════════════════════════════════════════════════════════════
// STICKERS
// ═══════════════════════════════════════════════════════════════

const STICKERS = ['💕', '✨', '🌸', '💖', '🦋', '🎀', '⭐', '🌺', '🦄', '🌈', '🍭', '🍰']

// ═══════════════════════════════════════════════════════════════
// PRICING TIERS
// ═══════════════════════════════════════════════════════════════

const PRICING: Record<Tier, { name: string; price: number; features: string[] }> = {
  FREE: { name: 'Free', price: 0, features: ['15 messages/day', '3 themes', '3 avatars', 'Basic chat'] },
  PREMIUM: { name: 'Premium', price: 7.99, features: ['Unlimited messages', 'All themes', 'All avatars', 'Voice messages', 'Memory mode'] },
  ULTIMATE: { name: 'Ultimate', price: 14.99, features: ['Everything in Premium', 'Voice calls', 'Photo sharing', 'Mood tracking', 'Custom themes'] },
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function KawaiiAI() {
  // State
  const [screen, setScreen] = useState<Screen>('landing')
  const [theme, setTheme] = useState<Theme>('pink')
  const [age, setAge] = useState<AgeGroup>('junior')
  const [avatar, setAvatar] = useState<typeof AVATARS[AgeGroup][0] | null>(null)
  const [companionName, setCompanionName] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [memory, setMemory] = useState(false)
  const [showStickers, setShowStickers] = useState(false)
  const [showMood, setShowMood] = useState(false)
  const [moodNotes, setMoodNotes] = useState('')
  
  // Voice state
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [inCall, setInCall] = useState(false)
  const [callMessages, setCallMessages] = useState<CallMessage[]>([])
  const [callLoading, setCallLoading] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  
  // Refs
  const messagesEnd = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const audioChunks = useRef<Blob[]>([])
  const callChunks = useRef<Blob[]>([])
  const callHistory = useRef<CallMessage[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  
  const colors = THEMES[theme].colors

  // Auto scroll
  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Welcome message
  useEffect(() => {
    if (screen === 'chat' && messages.length === 0 && avatar) {
      const greetings: Record<AgeGroup, string> = {
        junior: `Hi there! 🌸 I'm ${companionName || avatar.name}! I'm so happy to be your friend! What shall we do today? 💕`,
        teen: `Hey bestie! ✨ I'm ${companionName || avatar.name} and I'm literally SO excited to chat with you! What's up? 💜`,
        'young-adult': `Hi! 💫 I'm ${companionName || avatar.name}. I'm here for you - whether you want to vent, get advice, or just chat. 🌹`,
        plus: `Hello! 🌿 I'm ${companionName || avatar.name}. I'm here to support you. How has your day been?`,
      }
      setMessages([{ id: 1, text: greetings[age], sender: 'ai', time: new Date(), stickers: ['💕', '✨'] }])
    }
  }, [screen, avatar, companionName, age, messages.length])

  // Get random stickers
  const getStickers = () => {
    const count = Math.floor(Math.random() * 2) + 1
    return Array.from({ length: count }, () => STICKERS[Math.floor(Math.random() * STICKERS.length)])
  }

  // Send message
  const sendMessage = useCallback(async () => {
    const text = input.trim()
    if (!text || loading) return
    
    const userMsg: Message = { id: Date.now(), text, sender: 'user', time: new Date() }
    setMessages(p => [...p, userMsg])
    setInput('')
    setLoading(true)
    
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text })),
          ageGroup: age,
          companionName: companionName || avatar?.name,
          avatarPersonality: avatar?.personality,
        }),
      })
      const data = await res.json()
      const aiMsg: Message = { id: Date.now() + 1, text: data.response || "I'm here! 💕", sender: 'ai', time: new Date(), stickers: getStickers() }
      setMessages(p => [...p, aiMsg])
    } catch {
      setMessages(p => [...p, { id: Date.now() + 1, text: "Oops! Try again! 💕", sender: 'ai', time: new Date(), stickers: ['💕'] }])
    } finally {
      setLoading(false)
    }
  }, [input, loading, messages, age, companionName, avatar])

  // Speak text
  const speak = useCallback((text: string) => {
    return new Promise<void>(resolve => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
        const u = new SpeechSynthesisUtterance(text)
        u.rate = 1.0
        u.pitch = 1.1
        u.onstart = () => setIsSpeaking(true)
        u.onend = () => { setIsSpeaking(false); resolve() }
        u.onerror = () => { setIsSpeaking(false); resolve() }
        window.speechSynthesis.speak(u)
      } else resolve()
    })
  }, [])

  // Voice recording for chat
  const toggleVoice = useCallback(async () => {
    if (isRecording) {
      mediaRecorder.current?.stop()
      if (timerRef.current) clearInterval(timerRef.current)
      setIsRecording(false)
      setRecordingTime(0)
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const rec = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' })
        mediaRecorder.current = rec
        audioChunks.current = []
        
        rec.ondataavailable = e => { if (e.data.size > 0) audioChunks.current.push(e.data) }
        rec.onstop = async () => {
          stream.getTracks().forEach(t => t.stop())
          const blob = new Blob(audioChunks.current, { type: 'audio/webm' })
          if (blob.size < 500) { alert('Recording too short! 🎤'); return }
          
          setInput('🎵 Transcribing...')
          try {
            const fd = new FormData()
            fd.append('audio', blob, 'recording.webm')
            const res = await fetch('/api/asr', { method: 'POST', body: fd })
            const data = await res.json()
            setInput(data.transcription || '')
            inputRef.current?.focus()
          } catch { setInput(''); alert('Transcription failed! Try again 🎤') }
        }
        
        rec.start()
        setIsRecording(true)
        timerRef.current = setInterval(() => setRecordingTime(t => t >= 60 ? 0 : t + 1), 1000)
      } catch { alert('Please allow microphone access! 🎤') }
    }
  }, [isRecording])

  // Voice call
  const startCall = useCallback(async () => {
    setInCall(true)
    callHistory.current = []
    setCallMessages([])
    
    const greetings = [
      `Hi! I'm ${companionName || avatar?.name}! So glad you called! 💕`,
      `Hey there! What would you like to chat about? ✨`,
      `Hello! I was just thinking about you! 🌸`,
    ]
    const greeting = greetings[Math.floor(Math.random() * greetings.length)]
    callHistory.current = [{ role: 'ai', text: greeting }]
    setCallMessages([{ role: 'ai', text: greeting }])
    await speak(greeting)
  }, [companionName, avatar, speak])

  const endCall = useCallback(() => {
    setInCall(false)
    setIsRecording(false)
    setCallLoading(false)
    setIsSpeaking(false)
    callHistory.current = []
    if ('speechSynthesis' in window) window.speechSynthesis.cancel()
    if (mediaRecorder.current?.state !== 'inactive') mediaRecorder.current?.stop()
    if (timerRef.current) clearInterval(timerRef.current)
  }, [])

  const toggleCallVoice = useCallback(async () => {
    if (isRecording) {
      mediaRecorder.current?.stop()
      if (timerRef.current) clearInterval(timerRef.current)
      setIsRecording(false)
      setRecordingTime(0)
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const rec = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' })
        mediaRecorder.current = rec
        callChunks.current = []
        
        rec.ondataavailable = e => { if (e.data.size > 0) callChunks.current.push(e.data) }
        rec.onstop = async () => {
          stream.getTracks().forEach(t => t.stop())
          const blob = new Blob(callChunks.current, { type: 'audio/webm' })
          if (blob.size < 500) {
            const msg = "Too short! Speak longer 🎤"
            callHistory.current = [...callHistory.current, { role: 'ai', text: msg }]
            setCallMessages([...callHistory.current])
            await speak(msg)
            return
          }
          
          try {
            const fd = new FormData()
            fd.append('audio', blob, 'recording.webm')
            const asrRes = await fetch('/api/asr', { method: 'POST', body: fd })
            const asrData = await asrRes.json()
            
            if (asrData.transcription?.trim()) {
              const userText = asrData.transcription.trim()
              callHistory.current = [...callHistory.current, { role: 'user', text: userText }]
              setCallMessages([...callHistory.current])
              
              setCallLoading(true)
              const chatRes = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  messages: callHistory.current.map(m => ({ role: m.role, content: m.text })),
                  ageGroup: age,
                  companionName: companionName || avatar?.name,
                  avatarPersonality: avatar?.personality,
                }),
              })
              const chatData = await chatRes.json()
              const aiText = chatData.response || "I'm here! 💕"
              
              callHistory.current = [...callHistory.current, { role: 'ai', text: aiText }]
              setCallMessages([...callHistory.current])
              setCallLoading(false)
              await speak(aiText)
            } else {
              const msg = "I didn't catch that. Try again? 🎤"
              callHistory.current = [...callHistory.current, { role: 'ai', text: msg }]
              setCallMessages([...callHistory.current])
              await speak(msg)
            }
          } catch (e) {
            console.error(e)
            setCallLoading(false)
            const msg = "Oops! Try again! 💕"
            callHistory.current = [...callHistory.current, { role: 'ai', text: msg }]
            setCallMessages([...callHistory.current])
          }
        }
        
        rec.start()
        setIsRecording(true)
        timerRef.current = setInterval(() => setRecordingTime(t => t >= 30 ? 0 : t + 1), 1000)
      } catch { alert('Please allow microphone access! 🎤') }
    }
  }, [isRecording, age, companionName, avatar, speak])

  // Mood tracking
  const logMood = useCallback(async (mood: number) => {
    const emojis = ['😔', '😕', '😐', '🙂', '😊', '😄']
    const labels = ['sad', 'a bit down', 'okay', 'good', 'happy', 'amazing']
    
    let response = ''
    if (mood <= 1) response = `I notice you're feeling ${labels[mood]} ${emojis[mood]}. I'm here for you. ${moodNotes ? `Thanks for sharing: "${moodNotes}"` : ''} 💕`
    else if (mood <= 3) response = `You're feeling ${labels[mood]} ${emojis[mood]}. That's okay! ${moodNotes ? `"${moodNotes}"` : ''} 💕`
    else response = `You're feeling ${labels[mood]} ${emojis[mood]}! That's wonderful! ✨ ${moodNotes ? `"${moodNotes}"` : ''}`
    
    setMessages(p => [...p, { id: Date.now(), text: response, sender: 'ai', time: new Date(), stickers: [emojis[mood], '💕'] }])
    setShowMood(false)
    setMoodNotes('')
  }, [moodNotes])

  // Photo share
  const handlePhoto = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setMessages(p => [...p, { id: Date.now(), text: '📸 Shared a photo', sender: 'user', time: new Date() }])
    setTimeout(() => setMessages(p => [...p, { id: Date.now() + 1, text: "What a lovely photo! 💕", sender: 'ai', time: new Date(), stickers: ['📸', '💖'] }]), 1000)
  }, [])

  // ═══════════════════════════════════════════════════════════════
  // SCREENS
  // ═══════════════════════════════════════════════════════════════

  // Landing
  const Landing = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden" style={{ background: colors.bg }}>
      {/* Floating decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {['🌸', '💕', '✨', '🦋', '⭐', '🌺'].map((e, i) => (
          <div key={i} className="absolute text-4xl animate-bounce" style={{ top: `${10 + i * 15}%`, left: `${5 + i * 18}%`, animationDelay: `${i * 0.2}s` }}>{e}</div>
        ))}
      </div>
      
      <div className="relative z-10 text-center">
        {/* Logo */}
        <div className="mb-8">
          <div className="w-36 h-36 rounded-full flex items-center justify-center mx-auto shadow-2xl animate-pulse"
            style={{ background: `linear-gradient(135deg, ${colors.secondary}, ${colors.primary})`, boxShadow: `0 20px 60px -15px ${colors.primary}80` }}>
            <span className="text-7xl">{THEMES[theme].emoji}</span>
          </div>
        </div>
        
        <h1 className="text-6xl font-bold text-white drop-shadow-lg mb-4">Kawaii AI</h1>
        <p className="text-xl text-white/90 font-medium mb-2">Your Cute AI Companion 💕</p>
        <p className="text-white/70 mb-10 max-w-md">A sweet, supportive friend who's always there for you ✨</p>
        
        <div className="flex flex-col gap-4 items-center">
          <Button onClick={() => setScreen('auth')} className="text-lg px-10 py-6 h-auto rounded-full text-white font-semibold shadow-lg hover:scale-105 transition-transform"
            style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})` }}>
            Get Started Free 💖
          </Button>
          <Button onClick={() => setScreen('pricing')} variant="outline" className="rounded-full px-8 py-6 text-white border-white/40 bg-white/10 backdrop-blur">
            View Plans ✨
          </Button>
        </div>
        
        <div className="mt-14 flex flex-wrap justify-center gap-3 max-w-lg mx-auto">
          {['🎨 10+ Themes', '🌸 24 Avatars', '💬 AI Chat', '🎤 Voice', '📞 Calls', '📊 Mood'].map((t, i) => (
            <Badge key={i} className="px-4 py-2 rounded-full bg-white/20 text-white border-0">{t}</Badge>
          ))}
        </div>
      </div>
    </div>
  )

  // Auth
  const Auth = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: colors.bg }}>
      <div className="text-center mb-8">
        <div className="text-5xl mb-4 animate-bounce">🎀</div>
        <h2 className="text-3xl font-bold text-white mb-2">Join Kawaii AI!</h2>
        <p className="text-white/80">Create your free account 💕</p>
      </div>
      
      <div className="bg-white/90 backdrop-blur rounded-3xl p-8 max-w-md w-full shadow-2xl">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block text-gray-700">Your Name</label>
            <input 
              type="text" 
              placeholder="Enter your name..." 
              className="w-full rounded-full border-2 border-pink-200 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-200 p-3 px-4"
              style={{ borderColor: colors.secondary }}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block text-gray-700">Email</label>
            <input 
              type="email" 
              placeholder="you@example.com" 
              className="w-full rounded-full border-2 border-pink-200 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-200 p-3 px-4"
              style={{ borderColor: colors.secondary }}
            />
          </div>
        </div>
        
        <Button onClick={() => setScreen('theme')} className="w-full mt-6 py-6 rounded-full text-white font-semibold"
          style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})` }}>
          Create Account 💖
        </Button>
      </div>
      
      <Button variant="ghost" onClick={() => setScreen('landing')} className="mt-6 rounded-full text-white">← Back</Button>
    </div>
  )

  // Theme Selection
  const ThemeSelect = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: colors.bg }}>
      <div className="text-center mb-8">
        <div className="text-5xl mb-4 animate-bounce">🎨</div>
        <h2 className="text-3xl font-bold text-white mb-2">Choose Your Theme</h2>
        <p className="text-white/80">Pick the color that matches your vibe! ✨</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl w-full mb-8">
        {(Object.keys(THEMES) as Theme[]).map(t => (
          <div key={t} onClick={() => setTheme(t)}
            className={`p-4 rounded-2xl cursor-pointer transition-all hover:scale-105 ${theme === t ? 'ring-4 ring-white scale-105' : ''}`}
            style={{ background: THEMES[t].colors.bg }}>
            <div className="text-center text-white">
              <div className="text-4xl mb-2">{THEMES[t].emoji}</div>
              <div className="font-semibold text-sm">{THEMES[t].name}</div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex gap-4">
        <Button variant="outline" onClick={() => setScreen('auth')} className="rounded-full px-6 text-white border-white/40">← Back</Button>
        <Button onClick={() => setScreen('age')} className="rounded-full px-8 text-white" style={{ background: colors.primary }}>Continue 💕</Button>
      </div>
    </div>
  )

  // Age Selection
  const AgeSelect = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: colors.bg }}>
      <div className="text-center mb-8">
        <div className="text-5xl mb-4 animate-bounce">💝</div>
        <h2 className="text-3xl font-bold text-white mb-2">Choose Your Version</h2>
        <p className="text-white/80">Select the experience that fits you best! ✨</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full mb-8">
        {(Object.keys(AGES) as AgeGroup[]).map(a => (
          <div key={a} onClick={() => setAge(a)}
            className={`p-6 rounded-2xl cursor-pointer transition-all hover:scale-105 bg-white/90 backdrop-blur ${age === a ? 'ring-4 scale-105' : ''}`}
            style={{ boxShadow: age === a ? `0 10px 40px -10px ${colors.primary}60` : undefined }}>
            <div className="text-center">
              <h3 className="text-xl font-bold mb-1" style={{ color: colors.primary }}>{AGES[a].title}</h3>
              <p className="text-sm opacity-70 mb-2">Ages {AGES[a].range}</p>
              <p className="text-sm mb-3">{AGES[a].desc}</p>
              <Badge className="rounded-full" style={{ background: colors.secondary, color: colors.primary }}>{AGES[a].vibe}</Badge>
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex gap-4">
        <Button variant="outline" onClick={() => setScreen('theme')} className="rounded-full px-6 text-white border-white/40">← Back</Button>
        <Button onClick={() => setScreen('avatar')} className="rounded-full px-8 text-white" style={{ background: colors.primary }}>Continue 💕</Button>
      </div>
    </div>
  )

  // Avatar Selection
  const AvatarSelect = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: colors.bg }}>
      <div className="text-center mb-8">
        <div className="text-5xl mb-4 animate-bounce">✨</div>
        <h2 className="text-3xl font-bold text-white mb-2">Pick Your Companion</h2>
        <p className="text-white/80">Choose the friend that speaks to you! 💕</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl w-full mb-8">
        {AVATARS[age].map(a => (
          <div key={a.id} onClick={() => setAvatar(a)}
            className={`p-4 rounded-2xl cursor-pointer transition-all hover:scale-105 bg-white/90 backdrop-blur ${avatar?.id === a.id ? 'ring-4 scale-105' : ''}`}
            style={{ boxShadow: avatar?.id === a.id ? `0 10px 40px -10px ${colors.primary}60` : undefined }}>
            <div className="text-center">
              <div className="text-5xl mb-3 p-3 rounded-full mx-auto w-fit" style={{ background: `${a.color}40` }}>{a.emoji}</div>
              <h3 className="font-bold" style={{ color: colors.primary }}>{a.name}</h3>
              <p className="text-xs opacity-70">{a.personality}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex gap-4">
        <Button variant="outline" onClick={() => setScreen('age')} className="rounded-full px-6 text-white border-white/40">← Back</Button>
        <Button onClick={() => avatar && setScreen('name')} disabled={!avatar} className="rounded-full px-8 text-white disabled:opacity-50" style={{ background: colors.primary }}>Continue 💕</Button>
      </div>
    </div>
  )

  // Name Companion
  const NameCompanion = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: colors.bg }}>
      <div className="text-center mb-8">
        <div className="text-6xl mb-4 animate-bounce">{avatar?.emoji}</div>
        <h2 className="text-3xl font-bold text-white mb-2">Name Your Friend!</h2>
        <p className="text-white/80">Give your companion a special name! 💕</p>
      </div>
      
      <div className="bg-white/90 backdrop-blur rounded-3xl p-8 max-w-md w-full shadow-2xl mb-8">
        <div className="text-center mb-6">
          <div className="text-7xl p-4 rounded-full inline-block mb-4" style={{ background: `${avatar?.color}30` }}>{avatar?.emoji}</div>
          <p className="text-sm opacity-70">Default: <span className="font-bold" style={{ color: colors.primary }}>{avatar?.name}</span></p>
        </div>
        
        <input 
          type="text"
          placeholder={avatar?.name || 'Enter a name...'}
          value={companionName}
          onChange={e => setCompanionName(e.target.value)}
          className="w-full text-center text-lg p-4 rounded-full border-2 border-pink-200 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-200 bg-white"
          style={{ borderColor: colors.secondary }}
        />
        
        {/* Memory Toggle */}
        <div className="mt-6 p-4 rounded-xl flex items-center justify-between" style={{ background: colors.secondary + '30' }}>
          <div>
            <p className="font-semibold" style={{ color: colors.primary }}>🧠 Memory Mode</p>
            <p className="text-xs opacity-70">AI remembers conversations</p>
          </div>
          <button onClick={() => setMemory(!memory)} className={`w-14 h-7 rounded-full transition-all ${memory ? 'bg-green-400' : 'bg-gray-300'}`}>
            <div className={`w-6 h-6 bg-white rounded-full shadow transition-transform ${memory ? 'translate-x-7' : 'translate-x-0.5'}`} />
          </button>
        </div>
      </div>
      
      <div className="flex gap-4">
        <Button variant="outline" onClick={() => setScreen('avatar')} className="rounded-full px-6 text-white border-white/40">← Back</Button>
        <Button onClick={() => setScreen('chat')} className="rounded-full px-8 text-white" style={{ background: colors.primary }}>Let's Chat! 💖</Button>
      </div>
    </div>
  )

  // Pricing
  const Pricing = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: colors.bg }}>
      <div className="text-center mb-8">
        <div className="text-5xl mb-4 animate-bounce">💝</div>
        <h2 className="text-3xl font-bold text-white mb-2">Choose Your Plan</h2>
        <p className="text-white/80">Unlock the full Kawaii experience! ✨</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full mb-8">
        {(Object.keys(PRICING) as Tier[]).map((t, i) => (
          <div key={t} className={`bg-white/90 backdrop-blur rounded-2xl p-6 relative ${i === 1 ? 'ring-4 scale-105' : ''}`}
            style={{ boxShadow: i === 1 ? `0 20px 60px -10px ${colors.primary}60` : undefined }}>
            {i === 1 && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-white text-sm font-bold" style={{ background: colors.primary }}>Most Popular ✨</div>}
            {i === 2 && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-white text-sm font-bold bg-gradient-to-r from-amber-400 to-orange-500">Best Value 🌟</div>}
            <div className="text-center">
              <h3 className="text-xl font-bold mb-1" style={{ color: colors.primary }}>{PRICING[t].name}</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold">${PRICING[t].price}</span>
                {PRICING[t].price > 0 && <span className="text-sm opacity-70">/mo</span>}
              </div>
              <ul className="space-y-2 mb-6 text-left">
                {PRICING[t].features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm"><span style={{ color: colors.primary }}>✓</span>{f}</li>
                ))}
              </ul>
              <Button 
                onClick={() => {
                  if (t === 'FREE') {
                    setScreen('auth')
                  } else {
                    alert(`✨ ${PRICING[t].name} features are unlocked for testing! Enjoy all premium features! 💕`)
                    setScreen('auth')
                  }
                }}
                className="w-full rounded-full py-5 text-white" 
                style={{ background: i === 0 ? '#888' : `linear-gradient(135deg, ${colors.primary}, ${colors.accent})` }}
              >
                {t === 'FREE' ? 'Get Started Free' : `Get ${PRICING[t].name} 💕`}
              </Button>
            </div>
          </div>
        ))}
      </div>
      
      <Button variant="ghost" onClick={() => setScreen('landing')} className="rounded-full text-white">← Back</Button>
    </div>
  )

  // Chat
  const Chat = () => (
    <div className="min-h-screen flex flex-col" style={{ background: colors.bg }}>
      {/* Header */}
      <div className="bg-white/80 backdrop-blur p-4 sticky top-0 z-10 border-b-2" style={{ borderColor: colors.secondary }}>
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-lg" style={{ background: `${avatar?.color}50` }}>
            {avatar?.emoji}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg" style={{ color: colors.primary }}>{companionName || avatar?.name}</h3>
            <p className="text-xs flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-green-600">Online</span>
              {memory && <span style={{ color: colors.primary }}>🧠 Memory</span>}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={startCall} className="p-2 rounded-full" style={{ background: colors.secondary }} title="Voice Call">
              <span className="text-xl">📞</span>
            </button>
            <button onClick={() => setShowMood(true)} className="p-2 rounded-full" style={{ background: colors.secondary }} title="Mood Tracker">
              <span className="text-xl">📊</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <div className="max-w-2xl mx-auto space-y-3">
          {messages.map(m => (
            <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-2xl ${m.sender === 'user' ? 'text-white' : 'bg-white'}`}
                style={{ background: m.sender === 'user' ? `linear-gradient(135deg, ${colors.primary}, ${colors.accent})` : undefined }}>
                {m.stickers && <div className="flex gap-1 mb-1">{m.stickers.map((s, i) => <span key={i} className="text-lg">{s}</span>)}</div>}
                <p className="leading-relaxed">{m.text}</p>
                <p className={`text-xs mt-1 ${m.sender === 'user' ? 'opacity-70' : 'text-gray-400'}`}>
                  {m.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white p-3 rounded-2xl">
                <div className="flex gap-1">
                  {[0, 150, 300].map((d, i) => (
                    <div key={i} className="w-2 h-2 rounded-full animate-bounce" style={{ background: colors.primary, animationDelay: `${d}ms` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEnd} />
        </div>
      </div>
      
      {/* Stickers */}
      {showStickers && (
        <div className="bg-white/90 backdrop-blur p-4 border-t-2" style={{ borderColor: colors.secondary }}>
          <div className="max-w-2xl mx-auto">
            <p className="text-sm mb-2 font-medium" style={{ color: colors.primary }}>✨ Stickers</p>
            <div className="flex flex-wrap gap-2">
              {STICKERS.map(s => (
                <button key={s} onClick={() => { setInput(p => p + ' ' + s); inputRef.current?.focus() }} className="text-2xl hover:scale-125 transition-transform">{s}</button>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Mood Modal */}
      {showMood && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold mb-4 text-center" style={{ color: colors.primary }}>📊 How are you feeling?</h3>
            <div className="flex justify-center gap-2 mb-4">
              {['😔', '😕', '😐', '🙂', '😊', '😄'].map((e, i) => (
                <button key={i} onClick={() => logMood(i)} className="text-4xl p-2 rounded-xl hover:scale-110 transition-transform">{e}</button>
              ))}
            </div>
            <input 
              placeholder="Add a note... (optional)" 
              value={moodNotes} 
              onChange={e => setMoodNotes(e.target.value)} 
              className="w-full rounded-full border-2 border-pink-200 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-200 p-3 px-4 mb-4"
              style={{ borderColor: colors.secondary }}
            />
            <Button onClick={() => setShowMood(false)} variant="outline" className="w-full rounded-full">Cancel</Button>
          </div>
        </div>
      )}
      
      {/* Voice Call Modal */}
      {inCall && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 text-center max-w-sm w-full shadow-2xl">
            <div className="text-7xl mb-4 animate-bounce">{avatar?.emoji}</div>
            <h3 className="text-2xl font-bold mb-2" style={{ color: colors.primary }}>{companionName || avatar?.name}</h3>
            <p className="text-sm mb-4 opacity-70">
              {isSpeaking ? '🔊 Speaking...' : callLoading ? '💭 Thinking...' : isRecording ? '🎤 Listening...' : '📞 Tap mic to talk'}
            </p>
            
            {/* Call Messages */}
            <div className="max-h-32 overflow-y-auto mb-4 space-y-2 text-left">
              {callMessages.map((m, i) => (
                <div key={i} className={`p-2 rounded-xl text-sm ${m.role === 'user' ? 'bg-pink-100 ml-8' : 'bg-gray-100 mr-8'}`}>
                  <span className="font-medium">{m.role === 'user' ? 'You: ' : `${companionName || avatar?.name}: `}</span>
                  {m.text}
                </div>
              ))}
            </div>
            
            {isRecording && (
              <div className="mb-4 flex items-center justify-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <span className="text-red-500 font-medium">{recordingTime}s / 30s</span>
              </div>
            )}
            
            <button onClick={toggleCallVoice} disabled={callLoading || isSpeaking}
              className={`p-6 rounded-full shadow-lg mb-4 ${isRecording ? 'bg-red-500 animate-pulse' : ''}`}
              style={{ background: isRecording ? undefined : `linear-gradient(135deg, ${colors.primary}, ${colors.accent})` }}>
              <span className="text-3xl text-white">{isRecording ? '⏹️' : '🎤'}</span>
            </button>
            
            <p className="text-xs text-gray-500 mb-4">💡 Speak, then AI responds with voice!</p>
            <Button onClick={endCall} className="rounded-full px-8 py-3 bg-red-500 hover:bg-red-600 text-white">End Call</Button>
          </div>
        </div>
      )}
      
      {/* Input */}
      <div className="bg-white/80 backdrop-blur p-4 sticky bottom-0 border-t-2" style={{ borderColor: colors.secondary }}>
        <div className="max-w-2xl mx-auto flex gap-2 items-center">
          <button onClick={() => setShowStickers(s => !s)} className="p-3 rounded-full transition-all" style={{ background: showStickers ? colors.primary : colors.secondary }}>
            <span className="text-xl">{showStickers ? '🙈' : '😊'}</span>
          </button>
          
          <button onClick={toggleVoice} className={`relative p-3 rounded-full transition-all ${isRecording ? 'animate-pulse' : ''}`}
            style={{ background: isRecording ? colors.primary : colors.secondary }}>
            <span className="text-xl">{isRecording ? '⏹️' : '🎤'}</span>
            {isRecording && <span className="absolute -top-1 -right-1 text-xs bg-red-500 text-white rounded-full px-1.5">{recordingTime}s</span>}
          </button>
          
          <input ref={fileInput} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
          <button onClick={() => fileInput.current?.click()} className="p-3 rounded-full" style={{ background: colors.secondary }}>
            <span className="text-xl">📸</span>
          </button>
          
          <input ref={inputRef} type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..." disabled={loading}
            className="flex-1 p-3 px-4 rounded-full border-2 focus:outline-none" style={{ borderColor: colors.secondary }} />
          
          <Button onClick={sendMessage} disabled={!input.trim() || loading} className="rounded-full p-3 h-auto" style={{ background: colors.primary }}>
            <span className="text-xl">💕</span>
          </Button>
        </div>
      </div>
    </div>
  )

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════

  return (
    <main className="font-sans">
      {screen === 'landing' && <Landing />}
      {screen === 'auth' && <Auth />}
      {screen === 'theme' && <ThemeSelect />}
      {screen === 'age' && <AgeSelect />}
      {screen === 'avatar' && <AvatarSelect />}
      {screen === 'name' && <NameCompanion />}
      {screen === 'chat' && <Chat />}
      {screen === 'pricing' && <Pricing />}
    </main>
  )
}
