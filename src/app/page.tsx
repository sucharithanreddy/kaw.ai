'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// Types
type Screen = 'landing' | 'age-select' | 'avatar-select' | 'name-companion' | 'chat'
type AgeGroup = 'junior' | 'teen' | 'young-adult' | 'plus'

interface Message {
  id: number
  text: string
  sender: 'user' | 'ai'
  timestamp: Date
  stickers?: string[]
}

interface Avatar {
  id: string
  name: string
  emoji: string
  color: string
  personality: string
}

// Theme config for each age group
const THEME_CONFIG: Record<AgeGroup, { 
  emoji: string
  gradientClass: string
  accentColor: string
  ringColor: string
}> = {
  junior: { 
    emoji: '🐰', 
    gradientClass: 'from-pink-400 via-pink-500 to-rose-400',
    accentColor: 'ring-pink-400',
    ringColor: '#FF69B4'
  },
  teen: { 
    emoji: '💜', 
    gradientClass: 'from-purple-400 via-purple-500 to-violet-400',
    accentColor: 'ring-purple-400',
    ringColor: '#9B59B6'
  },
  'young-adult': { 
    emoji: '🌹', 
    gradientClass: 'from-rose-300 via-rose-400 to-pink-300',
    accentColor: 'ring-rose-300',
    ringColor: '#D4A5A5'
  },
  plus: { 
    emoji: '🌿', 
    gradientClass: 'from-emerald-400 via-green-500 to-teal-400',
    accentColor: 'ring-emerald-400',
    ringColor: '#7D9A78'
  },
}

// Cute stickers
const STICKERS = [
  { id: '1', emoji: '💕', name: 'love' },
  { id: '2', emoji: '✨', name: 'sparkle' },
  { id: '3', emoji: '🌸', name: 'cherry' },
  { id: '4', emoji: '💖', name: 'heart' },
  { id: '5', emoji: '🦋', name: 'butterfly' },
  { id: '6', emoji: '🎀', name: 'bow' },
  { id: '7', emoji: '⭐', name: 'star' },
  { id: '8', emoji: '🌺', name: 'flower' },
  { id: '9', emoji: '🩷', name: 'pink-heart' },
  { id: '10', emoji: '💫', name: 'dizzy' },
  { id: '11', emoji: '🌈', name: 'rainbow' },
  { id: '12', emoji: '🦄', name: 'unicorn' },
  { id: '13', emoji: '🍭', name: 'lollipop' },
  { id: '14', emoji: '🍰', name: 'cake' },
  { id: '15', emoji: '🧸', name: 'teddy' },
  { id: '16', emoji: '💝', name: 'gift-heart' },
]

// Avatars per age group
const AVATARS: Record<AgeGroup, Avatar[]> = {
  junior: [
    { id: 'bunny', name: 'Bunny', emoji: '🐰', color: '#FFB6C1', personality: 'Playful & curious' },
    { id: 'kitty', name: 'Kitty', emoji: '🐱', color: '#DDA0DD', personality: 'Sweet & gentle' },
    { id: 'panda', name: 'Panda', emoji: '🐼', color: '#B0E0E6', personality: 'Calm & friendly' },
    { id: 'bear', name: 'Bear', emoji: '🐻', color: '#F5DEB3', personality: 'Warm & caring' },
    { id: 'fox', name: 'Foxy', emoji: '🦊', color: '#FFA07A', personality: 'Clever & fun' },
    { id: 'owl', name: 'Owly', emoji: '🦉', color: '#E6E6FA', personality: 'Wise & kind' },
  ],
  teen: [
    { id: 'star', name: 'Luna', emoji: '🌟', color: '#E6E6FA', personality: 'Dreamy & creative' },
    { id: 'moon', name: 'Aria', emoji: '🌙', color: '#B0C4DE', personality: 'Calm & thoughtful' },
    { id: 'cherry', name: 'Sakura', emoji: '🌸', color: '#FFB6C1', personality: 'Cheerful & sweet' },
    { id: 'wave', name: 'Marina', emoji: '🌊', color: '#87CEEB', personality: 'Free-spirited' },
    { id: 'fire', name: 'Ember', emoji: '🔥', color: '#FFA07A', personality: 'Passionate & bold' },
    { id: 'leaf', name: 'Willow', emoji: '🍃', color: '#98FB98', personality: 'Gentle & caring' },
  ],
  'young-adult': [
    { id: 'diamond', name: 'Aurora', emoji: '💎', color: '#E0FFFF', personality: 'Elegant & wise' },
    { id: 'rose', name: 'Rosa', emoji: '🌹', color: '#FFB6C1', personality: 'Graceful & kind' },
    { id: 'crown', name: 'Nova', emoji: '👑', color: '#FFD700', personality: 'Confident & supportive' },
    { id: 'lotus', name: 'Lotus', emoji: '🪷', color: '#FFB6C1', personality: 'Serene & mindful' },
    { id: 'butterfly', name: 'Celeste', emoji: '🦋', color: '#DDA0DD', personality: 'Transformative' },
    { id: 'phoenix', name: 'Phoenix', emoji: '🔥', color: '#FF6B6B', personality: 'Resilient & inspiring' },
  ],
  plus: [
    { id: 'crystal', name: 'Sage', emoji: '🔮', color: '#E6E6FA', personality: 'Insightful & calm' },
    { id: 'anchor', name: 'Harbor', emoji: '⚓', color: '#B0C4DE', personality: 'Steady & reliable' },
    { id: 'mountain', name: 'Summit', emoji: '🏔️', color: '#E0FFFF', personality: 'Strong & supportive' },
    { id: 'tree', name: 'Oak', emoji: '🌳', color: '#98FB98', personality: 'Grounded & wise' },
    { id: 'sun', name: 'Sol', emoji: '☀️', color: '#FFD700', personality: 'Warm & encouraging' },
    { id: 'shell', name: 'Pearl', emoji: '🐚', color: '#FFF5EE', personality: 'Patient & nurturing' },
  ],
}

// Age group info
const AGE_GROUPS: Record<AgeGroup, { title: string; age: string; description: string; theme: string }> = {
  junior: { title: 'Kawaii Junior', age: '8-12', description: 'Fun, safe, and magical!', theme: 'Super cute & playful' },
  teen: { title: 'Kawaii Teen', age: '13-17', description: 'Your aesthetic bestie', theme: 'Trendy & aesthetic' },
  'young-adult': { title: 'Kawaii Young Adult', age: '18-25', description: 'Life, love & dreams', theme: 'Stylish & modern' },
  plus: { title: 'Kawaii Plus', age: '25-35', description: 'Wellness & growth', theme: 'Elegant & mature' },
}

export default function KawaiiAI() {
  const [screen, setScreen] = useState<Screen>('landing')
  const [ageGroup, setAgeGroup] = useState<AgeGroup>('junior')
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar | null>(null)
  const [companionName, setCompanionName] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [showStickers, setShowStickers] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  // Voice Call State
  const [isVoiceCallActive, setIsVoiceCallActive] = useState(false)
  const [isCallLoading, setIsCallLoading] = useState(false)
  const [callTranscript, setCallTranscript] = useState('')
  const [isAiSpeaking, setIsAiSpeaking] = useState(false)
  const [callMessages, setCallMessages] = useState<{role: 'user' | 'ai', text: string}[]>([])
  
  // Voice Recording State
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const callMessagesRef = useRef<{role: 'user' | 'ai', text: string}[]>([])
  
  const messagesRef = useRef<Message[]>([])
  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Initialize welcome message when entering chat
  useEffect(() => {
    if (screen === 'chat' && messages.length === 0 && selectedAvatar) {
      const welcomeMessages: Record<AgeGroup, string> = {
        junior: `Hi there! 🌸 I'm ${companionName || selectedAvatar.name}! I'm so happy to be your friend! What shall we do today? We can play games, tell stories, or just chat! 💕`,
        teen: `Hey bestie! ✨ I'm ${companionName || selectedAvatar.name} and I'm literally SO excited to be your friend! What's on your mind today? We can talk about anything - school, life, drama, or just random stuff! 💜`,
        'young-adult': `Hi there! 💫 I'm ${companionName || selectedAvatar.name}. I'm here for you - whether you want to vent, get advice, or just have a genuine conversation. How are you feeling today? 🌹`,
        plus: `Hello! 🌿 I'm ${companionName || selectedAvatar.name}. I'm here to support you through your journey. Whether you need a listening ear, some perspective, or just a friendly chat - I'm here for you. How has your day been?`,
      }
      setMessages([{
        id: 1,
        text: welcomeMessages[ageGroup],
        sender: 'ai',
        timestamp: new Date(),
        stickers: ageGroup === 'junior' ? ['💕', '✨'] : ageGroup === 'teen' ? ['💜', '✨'] : ageGroup === 'young-adult' ? ['🌹', '💫'] : ['🌿', '💫'],
      }])
    }
  }, [screen, selectedAvatar, companionName, ageGroup, messages.length])

  const getRandomStickers = useCallback((): string[] => {
    const stickersByAge: Record<AgeGroup, string[]> = {
      junior: ['💕', '✨', '🌸', '💖', '🦋', '🎀', '⭐', '🌺', '🌈', '🦄', '🍭', '🧸'],
      teen: ['💜', '✨', '🌸', '💫', '🦋', '🌙', '⭐', '🌊', '💫', '🌟', '💝', '🎀'],
      'young-adult': ['🌹', '💫', '🦋', '✨', '🌸', '💫', '💕', '🪷', '🌙', '💎', '✨', '🥂'],
      plus: ['🌿', '💫', '🦋', '✨', '🌸', '☕', '📖', '🌅', '💫', '🌊', '🌱', '🍃'],
    }
    const allStickers = stickersByAge[ageGroup]
    const count = Math.floor(Math.random() * 2) + 1
    return Array.from({ length: count }, () => 
      allStickers[Math.floor(Math.random() * allStickers.length)]
    )
  }, [ageGroup])

  const handleSendMessage = useCallback(async () => {
    const currentInput = inputText.trim()
    if (!currentInput || isLoading) return

    const currentMessages = messagesRef.current
    
    const userMessage: Message = {
      id: currentMessages.length + 1,
      text: currentInput,
      sender: 'user',
      timestamp: new Date(),
    }

    const newMessages = [...currentMessages, userMessage]
    
    setMessages(newMessages)
    setInputText('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text })),
          ageGroup,
          companionName: companionName || selectedAvatar?.name,
          avatarPersonality: selectedAvatar?.personality,
        }),
      })

      const data = await response.json()
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'API request failed')
      }
      
      const aiMessage: Message = {
        id: newMessages.length + 1,
        text: data.response || "Aww, I'm here! 💕",
        sender: 'ai',
        timestamp: new Date(),
        stickers: getRandomStickers(),
      }
      setMessages(prev => [...prev, aiMessage])
    } catch (error: unknown) {
      console.error('[Frontend] API error:', error)
      const aiMessage: Message = {
        id: newMessages.length + 1,
        text: "Oops! Something went wrong 😅 Let's try again! 💕",
        sender: 'ai',
        timestamp: new Date(),
        stickers: getRandomStickers(),
      }
      setMessages(prev => [...prev, aiMessage])
    } finally {
      setIsLoading(false)
    }
  }, [inputText, isLoading, ageGroup, companionName, selectedAvatar, getRandomStickers])

  const addSticker = useCallback((emoji: string) => {
    setInputText(prev => prev + ' ' + emoji)
    inputRef.current?.focus()
  }, [])

  const toggleStickers = useCallback(() => {
    setShowStickers(prev => !prev)
  }, [])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value)
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSendMessage()
    }
  }, [handleSendMessage])

  // ============ VOICE CALL FUNCTIONS ============
  
  // Speak text using browser TTS
  const speakText = useCallback((text: string) => {
    return new Promise<void>((resolve) => {
      if ('speechSynthesis' in window) {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel()
        
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = 1.0
        utterance.pitch = 1.1
        
        utterance.onstart = () => setIsAiSpeaking(true)
        utterance.onend = () => {
          setIsAiSpeaking(false)
          resolve()
        }
        utterance.onerror = () => {
          setIsAiSpeaking(false)
          resolve()
        }
        
        window.speechSynthesis.speak(utterance)
      } else {
        resolve()
      }
    })
  }, [])

  // Start voice call
  const startVoiceCall = useCallback(async () => {
    setIsVoiceCallActive(true)
    callMessagesRef.current = [] // Reset ref
    setCallMessages([])
    setCallTranscript('')
    
    // Generate greeting
    const greetings = [
      `Hi there! I'm ${companionName || selectedAvatar?.name}! So glad you called! What would you like to talk about?`,
      `Hey! It's so nice to hear from you! How are you doing today?`,
      `Hello! I was just thinking about you! What's on your mind?`,
      `Hi! This is so exciting! What would you like to chat about?`,
    ]
    const greeting = greetings[Math.floor(Math.random() * greetings.length)]
    
    // Update ref and state
    callMessagesRef.current = [{ role: 'ai', text: greeting }]
    setCallMessages([{ role: 'ai', text: greeting }])
    
    await speakText(greeting)
  }, [companionName, selectedAvatar, speakText])

  // End voice call
  const endVoiceCall = useCallback(() => {
    setIsVoiceCallActive(false)
    setIsRecording(false)
    setIsAiSpeaking(false)
    setIsCallLoading(false)
    callMessagesRef.current = [] // Reset ref
    setCallMessages([])
    setCallTranscript('')
    
    // Stop any ongoing speech
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    
    // Stop recording if active
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current)
    }
  }, [])

  // Start/stop recording during voice call
  const toggleCallRecording = useCallback(async () => {
    if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
        recordingIntervalRef.current = null
      }
      setIsRecording(false)
      setRecordingTime(0)
    } else {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const mediaRecorder = new MediaRecorder(stream, { 
          mimeType: 'audio/webm;codecs=opus' 
        })
        mediaRecorderRef.current = mediaRecorder
        audioChunksRef.current = []

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data)
          }
        }

        mediaRecorder.onstop = async () => {
          stream.getTracks().forEach(track => track.stop())
          
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
          setCallTranscript('🎵 Transcribing...')
          
          try {
            // Transcribe
            const formData = new FormData()
            formData.append('audio', audioBlob, 'recording.webm')
            
            const asrResponse = await fetch('/api/asr', {
              method: 'POST',
              body: formData
            })
            
            const asrData = await asrResponse.json()
            console.log('[Voice Call] ASR result:', asrData)
            
            if (asrData.transcription && asrData.transcription.trim()) {
              const userText = asrData.transcription.trim()
              setCallTranscript(userText)
              
              // Update ref and state
              callMessagesRef.current = [...callMessagesRef.current, { role: 'user' as const, text: userText }]
              setCallMessages([...callMessagesRef.current])
              
              // Get AI response
              setIsCallLoading(true)
              
              // Build messages for API - use the ref directly
              const apiMessages = [
                ...callMessagesRef.current.map(m => ({ 
                  role: m.role === 'user' ? 'user' as const : 'assistant' as const, 
                  content: m.text 
                }))
              ]
              
              console.log('[Voice Call] Sending to chat API:', apiMessages)
              
              const chatResponse = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  messages: apiMessages,
                  ageGroup,
                  companionName: companionName || selectedAvatar?.name,
                  avatarPersonality: selectedAvatar?.personality,
                }),
              })
              
              const chatData = await chatResponse.json()
              console.log('[Voice Call] Chat response:', chatData)
              
              const aiResponse = chatData.response || "I'm here for you! 💕"
              
              // Update ref and state
              callMessagesRef.current = [...callMessagesRef.current, { role: 'ai' as const, text: aiResponse }]
              setCallMessages([...callMessagesRef.current])
              setCallTranscript('')
              setIsCallLoading(false)
              
              // Speak AI response
              await speakText(aiResponse)
              
            } else if (asrData.error) {
              console.error('[Voice Call] ASR error:', asrData.error)
              setCallTranscript('')
              const errorMsg = asrData.needsConfig 
                ? "Voice needs setup! Add ASSEMBLYAI_API_KEY 💕" 
                : "I didn't catch that. Try again? 🎤"
              callMessagesRef.current = [...callMessagesRef.current, { role: 'ai' as const, text: errorMsg }]
              setCallMessages([...callMessagesRef.current])
              await speakText(errorMsg)
            } else {
              setCallTranscript('')
              const errorMsg = "I didn't catch that. Could you try again? 🎤"
              callMessagesRef.current = [...callMessagesRef.current, { role: 'ai' as const, text: errorMsg }]
              setCallMessages([...callMessagesRef.current])
              await speakText(errorMsg)
            }
          } catch (error) {
            console.error('[Voice Call] Error:', error)
            setCallTranscript('')
            setIsCallLoading(false)
            const errorMsg = "Oops! Something went wrong. Let's try again! 💕"
            callMessagesRef.current = [...callMessagesRef.current, { role: 'ai' as const, text: errorMsg }]
            setCallMessages([...callMessagesRef.current])
          }
        }

        mediaRecorder.start()
        setIsRecording(true)
        setRecordingTime(0)
        
        recordingIntervalRef.current = setInterval(() => {
          setRecordingTime(prev => {
            if (prev >= 30) { // Max 30 seconds per message during call
              if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                mediaRecorderRef.current.stop()
              }
              return 0
            }
            return prev + 1
          })
        }, 1000)
        
      } catch (error) {
        console.error('Microphone error:', error)
        alert('Please allow microphone access! 🎤')
      }
    }
  }, [isRecording, ageGroup, companionName, selectedAvatar, speakText])

  // ============ END VOICE CALL FUNCTIONS ============

  // Landing Screen Component
  const LandingScreen = useMemo(() => (
    <div className="min-h-screen kawaii-gradient flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-10 left-10 text-4xl animate-float opacity-60">🌸</div>
      <div className="absolute top-20 right-20 text-3xl animate-float opacity-60" style={{ animationDelay: '0.5s' }}>💕</div>
      <div className="absolute bottom-20 left-20 text-3xl animate-float opacity-60" style={{ animationDelay: '1s' }}>✨</div>
      <div className="absolute bottom-30 right-10 text-4xl animate-float opacity-60" style={{ animationDelay: '1.5s' }}>🦋</div>
      <div className="absolute top-40 left-1/4 text-2xl animate-sparkle opacity-40">⭐</div>
      <div className="absolute bottom-40 right-1/4 text-2xl animate-sparkle opacity-40" style={{ animationDelay: '0.3s' }}>💫</div>
      
      <div className="text-center z-10">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-white shadow-xl border-4 animate-pulse-glow" style={{ borderColor: 'var(--primary)' }}>
            <span className="text-6xl">🎀</span>
          </div>
        </div>
        
        <h1 className={`kawaii-title text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r ${THEME_CONFIG[ageGroup].gradientClass} bg-clip-text text-transparent animate-gradient`}>
          Kawaii AI
        </h1>
        
        <p className="text-xl mb-2 font-medium" style={{ color: 'var(--primary)' }}>
          Your Cute AI Companion 💕
        </p>
        <p className="mb-8 max-w-md mx-auto" style={{ color: 'var(--muted-foreground)' }}>
          A sweet, supportive friend who's always there for you ✨
        </p>
        
        <Button
          onClick={() => setScreen('age-select')}
          className="kawaii-button text-lg px-8 py-6 h-auto"
        >
          Get Started 💖
        </Button>
        
        <div className="mt-12 flex flex-wrap justify-center gap-4 max-w-lg mx-auto">
          <Badge className="kawaii-badge px-4 py-2 rounded-full text-sm" style={{ background: 'var(--secondary)', color: 'var(--primary)', border: '2px solid var(--border)' }}>
            🌸 Choose Your Avatar
          </Badge>
          <Badge className="kawaii-badge px-4 py-2 rounded-full text-sm" style={{ background: 'var(--secondary)', color: 'var(--primary)', border: '2px solid var(--border)' }}>
            💬 Chat Freely
          </Badge>
          <Badge className="kawaii-badge px-4 py-2 rounded-full text-sm" style={{ background: 'var(--secondary)', color: 'var(--primary)', border: '2px solid var(--border)' }}>
            🎀 Cute Stickers
          </Badge>
          <Badge className="kawaii-badge px-4 py-2 rounded-full text-sm" style={{ background: 'var(--secondary)', color: 'var(--primary)', border: '2px solid var(--border)' }}>
            💕 Always Supportive
          </Badge>
        </div>
      </div>
    </div>
  ), [ageGroup])

  // Age Selection Screen
  const AgeSelectScreen = useMemo(() => (
    <div className="min-h-screen kawaii-gradient flex flex-col items-center justify-center p-6">
      <div className="text-center mb-8">
        <div className="text-5xl mb-4 animate-bounce-soft">💝</div>
        <h2 className="kawaii-title text-3xl font-bold mb-2" style={{ color: 'var(--primary)' }}>Choose Your Version</h2>
        <p style={{ color: 'var(--muted-foreground)' }}>Select the experience that fits you best! ✨</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full">
        {(Object.keys(AGE_GROUPS) as AgeGroup[]).map((age) => (
          <Card
            key={age}
            className={`kawaii-card p-6 cursor-pointer transition-all hover:scale-105 ${
              ageGroup === age ? 'ring-4 bg-opacity-10' : ''
            }`}
            style={{ 
              borderLeft: `4px solid ${THEME_CONFIG[age].ringColor}`,
              ringColor: THEME_CONFIG[age].ringColor,
              backgroundColor: ageGroup === age ? `${THEME_CONFIG[age].ringColor}10` : undefined
            }}
            onClick={() => setAgeGroup(age)}
          >
            <div className="text-center">
              <div className="text-4xl mb-3">{THEME_CONFIG[age].emoji}</div>
              <h3 className="kawaii-title text-xl font-bold mb-1" style={{ color: THEME_CONFIG[age].ringColor }}>
                {AGE_GROUPS[age].title}
              </h3>
              <p className="text-sm mb-2" style={{ color: 'var(--muted-foreground)' }}>Ages {AGE_GROUPS[age].age}</p>
              <p className="text-sm text-gray-500 mb-3">{AGE_GROUPS[age].description}</p>
              <Badge className="kawaii-badge rounded-full" style={{ background: `${THEME_CONFIG[age].ringColor}20`, color: THEME_CONFIG[age].ringColor }}>
                {AGE_GROUPS[age].theme}
              </Badge>
            </div>
          </Card>
        ))}
      </div>
      
      <div className="mt-8 flex gap-4">
        <Button
          variant="outline"
          onClick={() => setScreen('landing')}
          className="rounded-full px-6"
          style={{ borderColor: 'var(--border)', color: 'var(--primary)' }}
        >
          ← Back
        </Button>
        <Button
          onClick={() => setScreen('avatar-select')}
          className="kawaii-button rounded-full px-8"
        >
          Continue 💕
        </Button>
      </div>
    </div>
  ), [ageGroup])

  // Avatar Selection Screen
  const AvatarSelectScreen = useMemo(() => (
    <div className="min-h-screen kawaii-gradient flex flex-col items-center justify-center p-6">
      <div className="text-center mb-8">
        <div className="text-5xl mb-4 animate-bounce-soft">✨</div>
        <h2 className="kawaii-title text-3xl font-bold mb-2" style={{ color: 'var(--primary)' }}>Pick Your Companion</h2>
        <p style={{ color: 'var(--muted-foreground)' }}>Choose the friend that speaks to you! 💕</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl w-full">
        {AVATARS[ageGroup].map((avatar) => (
          <Card
            key={avatar.id}
            className={`kawaii-card p-5 cursor-pointer transition-all hover:scale-105 ${
              selectedAvatar?.id === avatar.id ? 'ring-4' : ''
            }`}
            style={{ 
              borderColor: selectedAvatar?.id === avatar.id ? THEME_CONFIG[ageGroup].ringColor : undefined,
              ringColor: THEME_CONFIG[ageGroup].ringColor,
              backgroundColor: selectedAvatar?.id === avatar.id ? `${THEME_CONFIG[ageGroup].ringColor}10` : undefined
            }}
            onClick={() => setSelectedAvatar(avatar)}
          >
            <div className="text-center">
              <div 
                className="text-5xl mb-3 p-3 rounded-full mx-auto w-fit"
                style={{ backgroundColor: `${avatar.color}30` }}
              >
                {avatar.emoji}
              </div>
              <h3 className="text-lg font-bold" style={{ color: 'var(--primary)' }}>{avatar.name}</h3>
              <p className="text-xs text-gray-500 mt-1">{avatar.personality}</p>
            </div>
          </Card>
        ))}
      </div>
      
      <div className="mt-8 flex gap-4">
        <Button
          variant="outline"
          onClick={() => setScreen('age-select')}
          className="rounded-full px-6"
          style={{ borderColor: 'var(--border)', color: 'var(--primary)' }}
        >
          ← Back
        </Button>
        <Button
          onClick={() => selectedAvatar && setScreen('name-companion')}
          disabled={!selectedAvatar}
          className="kawaii-button rounded-full px-8 disabled:opacity-50"
        >
          Continue 💕
        </Button>
      </div>
    </div>
  ), [ageGroup, selectedAvatar])

  // Name Companion Screen
  const NameCompanionScreen = useMemo(() => (
    <div className="min-h-screen kawaii-gradient flex flex-col items-center justify-center p-6">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4 animate-bounce-soft">
          {selectedAvatar?.emoji}
        </div>
        <h2 className="kawaii-title text-3xl font-bold mb-2" style={{ color: 'var(--primary)' }}>Name Your Friend!</h2>
        <p style={{ color: 'var(--muted-foreground)' }}>Give your companion a special name 💕</p>
      </div>
      
      <Card className="kawaii-card p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div 
            className="text-7xl p-4 rounded-full inline-block mb-4"
            style={{ backgroundColor: `${selectedAvatar?.color}30` }}
          >
            {selectedAvatar?.emoji}
          </div>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            Default name: <span className="font-bold" style={{ color: 'var(--primary)' }}>{selectedAvatar?.name}</span>
          </p>
        </div>
        
        <Input
          placeholder={selectedAvatar?.name}
          value={companionName}
          onChange={(e) => setCompanionName(e.target.value)}
          className="kawaii-input text-center text-lg p-4 rounded-full"
          style={{ borderColor: 'var(--border)' }}
        />
        
        <p className="text-center text-sm mt-4" style={{ color: 'var(--muted-foreground)' }}>
          Leave empty to use the default name ✨
        </p>
      </Card>
      
      <div className="mt-8 flex gap-4">
        <Button
          variant="outline"
          onClick={() => setScreen('avatar-select')}
          className="rounded-full px-6"
          style={{ borderColor: 'var(--border)', color: 'var(--primary)' }}
        >
          ← Back
        </Button>
        <Button
          onClick={() => setScreen('chat')}
          className="kawaii-button rounded-full px-8"
        >
          Let's Chat! 💖
        </Button>
      </div>
    </div>
  ), [selectedAvatar, companionName])

  // Chat Screen
  const ChatScreen = (
    <div className="min-h-screen kawaii-gradient-soft flex flex-col">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm p-4 sticky top-0 z-10" style={{ borderBottom: `2px solid var(--border)` }}>
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-md"
            style={{ backgroundColor: `${selectedAvatar?.color}50` }}
          >
            {selectedAvatar?.emoji}
          </div>
          <div className="flex-1">
            <h3 className="kawaii-title font-bold" style={{ color: 'var(--primary)' }}>
              {companionName || selectedAvatar?.name}
            </h3>
            <p className="text-xs text-green-500 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Online now
            </p>
          </div>
          <Badge className="kawaii-badge rounded-full" style={{ background: `${THEME_CONFIG[ageGroup].ringColor}20`, color: THEME_CONFIG[ageGroup].ringColor }}>
            {AGE_GROUPS[ageGroup].title}
          </Badge>
          {/* Voice Call Button */}
          <button
            onClick={startVoiceCall}
            className="p-2 rounded-full transition-all hover:scale-110"
            style={{ background: `${THEME_CONFIG[ageGroup].ringColor}20` }}
            title="Start Voice Call"
          >
            <span className="text-xl">📞</span>
          </button>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] md:max-w-[70%] ${
                message.sender === 'user' 
                  ? 'message-bubble-user' 
                  : 'message-bubble-ai'
              }`}>
                {message.stickers && (
                  <div className="flex gap-1 mb-2">
                    {message.stickers.map((sticker, i) => (
                      <span key={i} className="text-lg">{sticker}</span>
                    ))}
                  </div>
                )}
                <p className="leading-relaxed">{message.text}</p>
                <p className={`text-xs mt-2 ${
                  message.sender === 'user' ? 'opacity-70' : 'text-gray-400'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="message-bubble-ai">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--primary)', animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--primary)', animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--primary)', animationDelay: '300ms' }}></span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Stickers Panel */}
      {showStickers && (
        <div className="bg-white p-4" style={{ borderTop: `2px solid var(--border)` }}>
          <div className="max-w-2xl mx-auto">
            <p className="text-sm mb-3 font-medium" style={{ color: 'var(--primary)' }}>✨ Cute Stickers</p>
            <div className="grid grid-cols-8 gap-2">
              {STICKERS.map((sticker) => (
                <button
                  key={sticker.id}
                  onClick={() => addSticker(sticker.emoji)}
                  className="sticker-container text-xl"
                >
                  {sticker.emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Input Area */}
      <div className="bg-white p-4 sticky bottom-0" style={{ borderTop: `2px solid var(--border)` }}>
        <div className="max-w-2xl mx-auto flex gap-2 items-end">
          <button
            onClick={toggleStickers}
            className="p-3 rounded-full transition-colors border-2"
            style={{ background: 'var(--secondary)', borderColor: 'var(--border)' }}
          >
            <span className="text-xl">{showStickers ? '🙈' : '😊'}</span>
          </button>
          
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              disabled={isLoading}
              className="kawaii-input w-full pr-4 py-4 px-5 rounded-full border-2 focus:outline-none text-base bg-white"
              style={{ borderColor: 'var(--border)' }}
            />
          </div>
          
          <Button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isLoading}
            className="kawaii-button rounded-full px-6 py-6 h-auto disabled:opacity-50"
          >
            <span className="text-xl">💕</span>
          </Button>
        </div>
      </div>
      
      {/* Voice Call Modal */}
      {isVoiceCallActive && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 text-center max-w-sm w-full shadow-2xl">
            {/* Avatar */}
            <div className="mb-4">
              <div 
                className="w-24 h-24 rounded-full flex items-center justify-center text-5xl mx-auto shadow-lg animate-bounce-soft"
                style={{ backgroundColor: `${selectedAvatar?.color}50` }}
              >
                {selectedAvatar?.emoji}
              </div>
            </div>
            
            {/* Name */}
            <h3 className="kawaii-title text-2xl font-bold mb-1" style={{ color: 'var(--primary)' }}>
              {companionName || selectedAvatar?.name}
            </h3>
            
            {/* Status */}
            <p className="text-sm mb-4 opacity-70">
              {isAiSpeaking ? '🔊 Speaking...' : isCallLoading ? '💭 Thinking...' : isRecording ? '🎤 Listening...' : '📞 Voice Call Active'}
            </p>
            
            {/* Call Messages */}
            <div className="max-h-40 overflow-y-auto mb-4 space-y-2 text-left">
              {callMessages.map((msg, i) => (
                <div 
                  key={i} 
                  className={`p-2 rounded-xl text-sm ${msg.role === 'user' ? 'bg-pink-100 ml-8' : 'bg-gray-100 mr-8'}`}
                >
                  <span className="font-medium">{msg.role === 'user' ? 'You: ' : `${companionName || selectedAvatar?.name}: `}</span>
                  {msg.text}
                </div>
              ))}
              {callTranscript && (
                <div className="p-2 rounded-xl text-sm bg-pink-100 ml-8">
                  <span className="font-medium">You: </span>
                  {callTranscript}
                </div>
              )}
            </div>
            
            {/* Recording Indicator */}
            {isRecording && (
              <div className="mb-4">
                <div className="flex items-center justify-center gap-1">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-red-500 font-medium">{recordingTime}s / 30s</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Tap mic to stop recording</p>
              </div>
            )}
            
            {/* Mic Button */}
            <div className="flex justify-center gap-4 mb-4">
              <button
                onClick={toggleCallRecording}
                disabled={isCallLoading || isAiSpeaking}
                className={`p-6 rounded-full transition-all shadow-lg ${
                  isRecording 
                    ? 'bg-red-500 text-white animate-pulse' 
                    : 'bg-gradient-to-r from-pink-400 to-pink-500 text-white hover:scale-105'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <span className="text-3xl">{isRecording ? '⏹️' : '🎤'}</span>
              </button>
            </div>
            
            <p className="text-xs text-gray-500 mb-4">
              💡 Tap the mic to talk. AI will respond with voice!
            </p>
            
            {/* End Call Button */}
            <button
              onClick={endVoiceCall}
              className="px-8 py-3 rounded-full bg-red-500 hover:bg-red-600 text-white font-medium transition-colors"
            >
              End Call
            </button>
          </div>
        </div>
      )}
    </div>
  )

  // Render with theme wrapper
  return (
    <div className={`theme-${ageGroup}`}>
      {screen === 'landing' && LandingScreen}
      {screen === 'age-select' && AgeSelectScreen}
      {screen === 'avatar-select' && AvatarSelectScreen}
      {screen === 'name-companion' && NameCompanionScreen}
      {screen === 'chat' && ChatScreen}
    </div>
  )
}
