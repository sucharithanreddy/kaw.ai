'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// Types
type Screen = 'landing' | 'auth' | 'theme-select' | 'age-select' | 'avatar-select' | 'name-companion' | 'chat' | 'pricing' | 'mood' | 'voice-call' | 'custom-theme'
type AgeGroup = 'junior' | 'teen' | 'young-adult' | 'plus'
type ColorTheme = 'pink-blush' | 'lavender-dreams' | 'rose-gold' | 'sage-green' | 'sky-blue' | 'coral-sunset' | 'mint-fresh' | 'berry-purple' | 'peachy-keen' | 'soft-lilac'
type Tier = 'FREE' | 'PREMIUM' | 'ULTIMATE'

interface Message {
  id: number
  text: string
  sender: 'user' | 'ai'
  timestamp: Date
  stickers?: string[]
  isVoice?: boolean
  hasPhoto?: boolean
  photoUrl?: string
}

interface Avatar {
  id: string
  name: string
  emoji: string
  color: string
  personality: string
  premium?: boolean
}

interface Usage {
  messagesToday: number
  totalMessages: number
  currentStreak: number
  longestStreak: number
}

interface User {
  id: string
  email: string
  name: string
  tier: Tier
}

interface MoodEntry {
  timestamp: string
  mood: number
  notes?: string
  emotions?: string[]
}

// Subscription tiers config
const TIERS: Record<Tier, {
  name: string
  price: number
  features: string[]
  limits: {
    messagesPerDay: number | null
    colorThemes: number
    avatars: number
    voiceMessages: boolean
    memoryMode: boolean
    voiceCalls: boolean
    photoSharing: boolean
    moodTracking: boolean
    customThemes: boolean
  }
}> = {
  FREE: {
    name: 'Free',
    price: 0,
    features: ['15 messages/day', '3 color themes', '3 avatars', 'Basic stickers', 'Daily streaks'],
    limits: { messagesPerDay: 15, colorThemes: 3, avatars: 3, voiceMessages: false, memoryMode: false, voiceCalls: false, photoSharing: false, moodTracking: false, customThemes: false },
  },
  PREMIUM: {
    name: 'Kawaii Premium',
    price: 7.99,
    features: ['Unlimited messages', 'All 10+ themes', 'All avatars', '🎤 Voice messages', '🧠 Memory mode', 'Custom avatar name', 'No ads'],
    limits: { messagesPerDay: null, colorThemes: 10, avatars: 24, voiceMessages: true, memoryMode: true, voiceCalls: false, photoSharing: false, moodTracking: false, customThemes: false },
  },
  ULTIMATE: {
    name: 'Kawaii Ultimate',
    price: 14.99,
    features: ['Everything in Premium', '📞 Voice calls', '📸 Photo sharing', '🧠 Advanced memory', '📊 Mood tracking', '🎨 Custom themes', 'Early access'],
    limits: { messagesPerDay: null, colorThemes: 999, avatars: 24, voiceMessages: true, memoryMode: true, voiceCalls: true, photoSharing: true, moodTracking: true, customThemes: true },
  },
}

// Color themes configuration
const COLOR_THEMES: Record<ColorTheme, { 
  name: string
  emoji: string
  gradient: string
  primaryColor: string
  description: string
  premium?: boolean
}> = {
  'pink-blush': { name: 'Pink Blush', emoji: '🎀', gradient: 'linear-gradient(135deg, #FF69B4, #FF85C1, #FFB6C1)', primaryColor: '#FF69B4', description: 'Sweet & playful', premium: false },
  'lavender-dreams': { name: 'Lavender Dreams', emoji: '💜', gradient: 'linear-gradient(135deg, #9B59B6, #AF7AC5, #CE93D8)', primaryColor: '#9B59B6', description: 'Dreamy & aesthetic', premium: false },
  'rose-gold': { name: 'Rose Gold', emoji: '🌹', gradient: 'linear-gradient(135deg, #D4A5A5, #E0B8B8, #E8C4C4)', primaryColor: '#D4A5A5', description: 'Elegant & chic', premium: true },
  'sage-green': { name: 'Sage Green', emoji: '🌿', gradient: 'linear-gradient(135deg, #7D9A78, #8FA88A, #A8C4A0)', primaryColor: '#7D9A78', description: 'Calm & mature', premium: true },
  'sky-blue': { name: 'Sky Blue', emoji: '☁️', gradient: 'linear-gradient(135deg, #5DADE2, #7FB3D5, #AED6F1)', primaryColor: '#5DADE2', description: 'Fresh & breezy', premium: false },
  'coral-sunset': { name: 'Coral Sunset', emoji: '🌅', gradient: 'linear-gradient(135deg, #FF7F7F, #FF9A8B, #FFB4A2)', primaryColor: '#FF7F7F', description: 'Warm & vibrant', premium: true },
  'mint-fresh': { name: 'Mint Fresh', emoji: '🍃', gradient: 'linear-gradient(135deg, #3EB489, #58D68D, #7DCEA0)', primaryColor: '#3EB489', description: 'Clean & refreshing', premium: true },
  'berry-purple': { name: 'Berry Purple', emoji: '🫐', gradient: 'linear-gradient(135deg, #8E44AD, #A569BD, #BB8FCE)', primaryColor: '#8E44AD', description: 'Rich & bold', premium: true },
  'peachy-keen': { name: 'Peachy Keen', emoji: '🍑', gradient: 'linear-gradient(135deg, #FFAB91, #FFCCBC, #FFE0B2)', primaryColor: '#FFAB91', description: 'Soft & sweet', premium: true },
  'soft-lilac': { name: 'Soft Lilac', emoji: '🪻', gradient: 'linear-gradient(135deg, #B39DDB, #CE93D8, #E1BEE7)', primaryColor: '#B39DDB', description: 'Gentle & calm', premium: true },
}

// Age group info
const AGE_GROUPS: Record<AgeGroup, { title: string; age: string; description: string; theme: string }> = {
  junior: { title: 'Kawaii Junior', age: '8-12', description: 'Fun, safe, and magical!', theme: 'Super cute & playful' },
  teen: { title: 'Kawaii Teen', age: '13-17', description: 'Your aesthetic bestie', theme: 'Trendy & aesthetic' },
  'young-adult': { title: 'Kawaii Young Adult', age: '18-25', description: 'Life, love & dreams', theme: 'Stylish & modern' },
  plus: { title: 'Kawaii Plus', age: '25-35', description: 'Wellness & growth', theme: 'Elegant & mature' },
}

// Stickers
const STICKERS = [
  { id: '1', emoji: '💕', name: 'love' },
  { id: '2', emoji: '✨', name: 'sparkle' },
  { id: '3', emoji: '🌸', name: 'cherry' },
  { id: '4', emoji: '💖', name: 'heart' },
  { id: '5', emoji: '🦋', name: 'butterfly' },
  { id: '6', emoji: '🎀', name: 'bow' },
  { id: '7', emoji: '⭐', name: 'star' },
  { id: '8', emoji: '🌺', name: 'flower' },
]

// Premium stickers for Ultimate
const PREMIUM_STICKERS = [
  { id: 'p1', emoji: '🦄', name: 'unicorn' },
  { id: 'p2', emoji: '🌈', name: 'rainbow' },
  { id: 'p3', emoji: '🍭', name: 'lollipop' },
  { id: 'p4', emoji: '🍰', name: 'cake' },
  { id: 'p5', emoji: '🧸', name: 'teddy' },
  { id: 'p6', emoji: '💝', name: 'gift-heart' },
  { id: 'p7', emoji: '💎', name: 'diamond' },
  { id: 'p8', emoji: '👑', name: 'crown' },
]

// Avatars per age group
const AVATARS: Record<AgeGroup, Avatar[]> = {
  junior: [
    { id: 'bunny', name: 'Bunny', emoji: '🐰', color: '#FFB6C1', personality: 'Playful & curious' },
    { id: 'kitty', name: 'Kitty', emoji: '🐱', color: '#DDA0DD', personality: 'Sweet & gentle' },
    { id: 'panda', name: 'Panda', emoji: '🐼', color: '#B0E0E6', personality: 'Calm & friendly' },
    { id: 'bear', name: 'Bear', emoji: '🐻', color: '#F5DEB3', personality: 'Warm & caring', premium: true },
    { id: 'fox', name: 'Foxy', emoji: '🦊', color: '#FFA07A', personality: 'Clever & fun', premium: true },
    { id: 'owl', name: 'Owly', emoji: '🦉', color: '#E6E6FA', personality: 'Wise & kind', premium: true },
  ],
  teen: [
    { id: 'star', name: 'Luna', emoji: '🌟', color: '#E6E6FA', personality: 'Dreamy & creative' },
    { id: 'moon', name: 'Aria', emoji: '🌙', color: '#B0C4DE', personality: 'Calm & thoughtful' },
    { id: 'cherry', name: 'Sakura', emoji: '🌸', color: '#FFB6C1', personality: 'Cheerful & sweet' },
    { id: 'wave', name: 'Marina', emoji: '🌊', color: '#87CEEB', personality: 'Free-spirited', premium: true },
    { id: 'fire', name: 'Ember', emoji: '🔥', color: '#FFA07A', personality: 'Passionate & bold', premium: true },
    { id: 'leaf', name: 'Willow', emoji: '🍃', color: '#98FB98', personality: 'Gentle & caring', premium: true },
  ],
  'young-adult': [
    { id: 'diamond', name: 'Aurora', emoji: '💎', color: '#E0FFFF', personality: 'Elegant & wise' },
    { id: 'rose', name: 'Rosa', emoji: '🌹', color: '#FFB6C1', personality: 'Graceful & kind' },
    { id: 'crown', name: 'Nova', emoji: '👑', color: '#FFD700', personality: 'Confident & supportive' },
    { id: 'lotus', name: 'Lotus', emoji: '🪷', color: '#FFB6C1', personality: 'Serene & mindful', premium: true },
    { id: 'butterfly', name: 'Celeste', emoji: '🦋', color: '#DDA0DD', personality: 'Transformative', premium: true },
    { id: 'phoenix', name: 'Phoenix', emoji: '🔥', color: '#FF6B6B', personality: 'Resilient & inspiring', premium: true },
  ],
  plus: [
    { id: 'crystal', name: 'Sage', emoji: '🔮', color: '#E6E6FA', personality: 'Insightful & calm' },
    { id: 'anchor', name: 'Harbor', emoji: '⚓', color: '#B0C4DE', personality: 'Steady & reliable' },
    { id: 'mountain', name: 'Summit', emoji: '🏔️', color: '#E0FFFF', personality: 'Strong & supportive' },
    { id: 'tree', name: 'Oak', emoji: '🌳', color: '#98FB98', personality: 'Grounded & wise', premium: true },
    { id: 'sun', name: 'Sol', emoji: '☀️', color: '#FFD700', personality: 'Warm & encouraging', premium: true },
    { id: 'shell', name: 'Pearl', emoji: '🐚', color: '#FFF5EE', personality: 'Patient & nurturing', premium: true },
  ],
}

// Free tier limits
const FREE_THEMES = ['pink-blush', 'lavender-dreams', 'sky-blue']

export default function KawaiiAI() {
  const [screen, setScreen] = useState<Screen>('landing')
  const [colorTheme, setColorTheme] = useState<ColorTheme>('pink-blush')
  const [customThemeColors, setCustomThemeColors] = useState({ primary: '#FF69B4', secondary: '#FFB6C1', accent: '#FF85C1' })
  const [ageGroup, setAgeGroup] = useState<AgeGroup>('junior')
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar | null>(null)
  const [companionName, setCompanionName] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [showStickers, setShowStickers] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // User state
  const [user, setUser] = useState<User | null>(null)
  const [usage, setUsage] = useState<Usage>({ messagesToday: 0, totalMessages: 0, currentStreak: 0, longestStreak: 0 })
  
  // Auth state
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  
  // Voice & media state
  const [isRecording, setIsRecording] = useState(false)
  const [isVoiceCallActive, setIsVoiceCallActive] = useState(false)
  const [showMoodTracker, setShowMoodTracker] = useState(false)
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([])
  const [currentMood, setCurrentMood] = useState<number>(3)
  const [moodNotes, setMoodNotes] = useState('')
  
  // Memory mode
  const [memoryEnabled, setMemoryEnabled] = useState(false)
  const [conversationMemory, setConversationMemory] = useState<string[]>([])
  
  // Audio recording refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const [recordingTime, setRecordingTime] = useState(0)
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  
  // Voice call state
  const [voiceCallMessage, setVoiceCallMessage] = useState('')
  const [isCallSpeaking, setIsCallSpeaking] = useState(false)
  const [callMessages, setCallMessages] = useState<{role: 'user' | 'ai', text: string}[]>([])
  const [isCallLoading, setIsCallLoading] = useState(false)
  const callMessagesRef = useRef<{role: 'user' | 'ai', text: string}[]>([])
  const callAudioChunksRef = useRef<Blob[]>([])
  
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

  // Feature access checks - ALL UNLOCKED FOR TESTING
  const canUseFeature = useCallback((feature: keyof typeof TIERS['PREMIUM']['limits']) => {
    // TESTING MODE: All features unlocked!
    return true
  }, [])

  const isThemeLocked = useCallback((theme: ColorTheme) => {
    // TESTING MODE: All themes unlocked!
    return false
  }, [])

  const isAvatarLocked = useCallback((avatar: Avatar) => {
    // TESTING MODE: All avatars unlocked!
    return false
  }, [])

  // Initialize welcome message
  useEffect(() => {
    if (screen === 'chat' && messages.length === 0 && selectedAvatar) {
      const welcomeMessages: Record<AgeGroup, string> = {
        junior: `Hi there! 🌸 I'm ${companionName || selectedAvatar.name}! I'm so happy to be your friend! What shall we do today? 💕`,
        teen: `Hey bestie! ✨ I'm ${companionName || selectedAvatar.name} and I'm literally SO excited to be your friend! What's on your mind? 💜`,
        'young-adult': `Hi there! 💫 I'm ${companionName || selectedAvatar.name}. I'm here for you - whether you want to vent, get advice, or just chat. 🌹`,
        plus: `Hello! 🌿 I'm ${companionName || selectedAvatar.name}. I'm here to support you through your journey. How has your day been?`,
      }
      
      // Memory mode greeting
      let greeting = welcomeMessages[ageGroup]
      if (memoryEnabled && conversationMemory.length > 0) {
        greeting = `Welcome back! 💕 I remember we were talking about ${conversationMemory.slice(-1)[0]?.substring(0, 30)}... ${greeting}`
      }
      
      setMessages([{
        id: 1,
        text: greeting,
        sender: 'ai',
        timestamp: new Date(),
        stickers: ['💕', '✨'],
      }])
    }
  }, [screen, selectedAvatar, companionName, ageGroup, messages.length, memoryEnabled, conversationMemory])

  const getRandomStickers = useCallback((): string[] => {
    // TESTING MODE: Always show all stickers
    const allStickers = [...STICKERS, ...PREMIUM_STICKERS]
    const count = Math.floor(Math.random() * 2) + 1
    return Array.from({ length: count }, () => 
      allStickers[Math.floor(Math.random() * allStickers.length)].emoji
    )
  }, [])

  const handleSendMessage = useCallback(async () => {
    const currentInput = inputText.trim()
    if (!currentInput || isLoading) return

    const userMessage: Message = {
      id: messagesRef.current.length + 1,
      text: currentInput,
      sender: 'user',
      timestamp: new Date(),
    }

    const newMessages = [...messagesRef.current, userMessage]
    setMessages(newMessages)
    setInputText('')
    setIsLoading(true)

    // Update memory
    if (memoryEnabled) {
      setConversationMemory(prev => [...prev.slice(-10), currentInput])
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text })),
          ageGroup,
          companionName: companionName || selectedAvatar?.name,
          avatarPersonality: selectedAvatar?.personality,
          userId: user?.id || 'demo-user',
          tier: user?.tier || 'FREE',
          memory: memoryEnabled ? conversationMemory : undefined,
        }),
      })

      const data = await response.json()
      
      const aiMessage: Message = {
        id: newMessages.length + 1,
        text: data.response || "Aww, I'm here! 💕",
        sender: 'ai',
        timestamp: new Date(),
        stickers: getRandomStickers(),
      }
      setMessages(prev => [...prev, aiMessage])
      
      // Update memory with AI response
      if (memoryEnabled) {
        setConversationMemory(prev => [...prev.slice(-10), data.response?.substring(0, 100)])
      }
      
      setUsage(prev => ({
        ...prev,
        messagesToday: prev.messagesToday + 1,
        totalMessages: prev.totalMessages + 1,
      }))
    } catch {
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
  }, [inputText, isLoading, ageGroup, companionName, selectedAvatar, getRandomStickers, user, usage.messagesToday, memoryEnabled, conversationMemory])

  // Voice message handler (Premium) - Record audio and send to ASR API
  const handleVoiceMessage = useCallback(async () => {
    if (!canUseFeature('voiceMessages')) {
      alert('Voice messages require Premium! 💕')
      return
    }

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
          // Stop all audio tracks
          stream.getTracks().forEach(track => track.stop())
          
          // Create audio blob
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
          console.log('Audio blob size:', audioBlob.size, 'bytes')
          
          // Show transcribing state
          setInputText('🎵 Transcribing...')
          
          // Send to ASR API for transcription
          try {
            const formData = new FormData()
            formData.append('audio', audioBlob, 'recording.webm')
            
            const response = await fetch('/api/asr', {
              method: 'POST',
              body: formData
            })
            
            const data = await response.json()
            console.log('ASR response:', data)
            
            if (data.transcription && data.transcription.trim()) {
              setInputText(data.transcription)
              inputRef.current?.focus()
            } else if (data.error) {
              console.error('ASR error:', data.error)
              setInputText('')
              alert(`Could not transcribe: ${data.error}`)
            } else {
              setInputText('')
              alert('No speech detected. Please try speaking louder! 🎤')
            }
          } catch (error) {
            console.error('ASR fetch error:', error)
            setInputText('')
            alert('Failed to transcribe. Please check your connection and try again! 🎤')
          }
        }

        mediaRecorder.start()
        setIsRecording(true)
        setRecordingTime(0)
        
        // Start timer
        recordingIntervalRef.current = setInterval(() => {
          setRecordingTime(prev => {
            if (prev >= 60) { // Max 60 seconds
              handleVoiceMessage()
              return prev
            }
            return prev + 1
          })
        }, 1000)
        
      } catch (error) {
        console.error('Microphone access error:', error)
        alert('Please allow microphone access to use voice messages! 🎤')
      }
    }
  }, [isRecording, canUseFeature])

  // Photo sharing handler (Ultimate)
  const handlePhotoShare = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canUseFeature('photoSharing')) {
      alert('Photo sharing requires Ultimate! 💕')
      return
    }

    const file = e.target.files?.[0]
    if (!file) return

    const photoMessage: Message = {
      id: messagesRef.current.length + 1,
      text: '📸 Shared a photo',
      sender: 'user',
      timestamp: new Date(),
      hasPhoto: true,
      photoUrl: URL.createObjectURL(file),
    }
    setMessages(prev => [...prev, photoMessage])

    // AI response to photo
    setTimeout(() => {
      const aiMessage: Message = {
        id: messagesRef.current.length + 2,
        text: "Aww, what a lovely photo! 💕 Thanks for sharing that with me! ✨",
        sender: 'ai',
        timestamp: new Date(),
        stickers: ['📸', '💖'],
      }
      setMessages(prev => [...prev, aiMessage])
    }, 1000)
  }, [canUseFeature])

  // Mood tracking (Ultimate)
  const handleMoodLog = useCallback(async (mood: number, notes?: string) => {
    if (!canUseFeature('moodTracking')) return

    const entry: MoodEntry = {
      timestamp: new Date().toISOString(),
      mood,
      notes,
      emotions: [],
    }
    setMoodHistory(prev => [...prev, entry])
    setCurrentMood(mood)
    setMoodNotes('') // Reset notes after logging
    
    // AI response with personalized message based on mood
    const moodEmojis = ['😔', '😕', '😐', '🙂', '😊', '😄']
    const moodLabels = ['sad', 'a bit down', 'okay', 'good', 'happy', 'amazing']
    
    let responseText = ''
    if (mood <= 1) {
      responseText = `I notice you're feeling ${moodLabels[mood]} today ${moodEmojis[mood]}. I'm really here for you. Would you like to talk about what's on your mind? 💕
${notes ? `Thank you for sharing: "${notes}" - that takes courage.` : 'Sometimes it helps to share what we are going through.'}`
    } else if (mood <= 3) {
      responseText = `You're feeling ${moodLabels[mood]} today ${moodEmojis[mood]}. That's totally okay! Every day is different. ${notes ? `I appreciate you sharing: "${notes}" 💕` : 'Would you like to chat about anything?'}`
    } else {
      responseText = `You're feeling ${moodLabels[mood]} today ${moodEmojis[mood]}! That makes me so happy! ✨ ${notes ? `I love that you shared: "${notes}" - spreading good vibes! 🌟` : 'Keep that amazing energy going! 💖'}`
    }
    
    const aiMessage: Message = {
      id: messagesRef.current.length + 1,
      text: responseText,
      sender: 'ai',
      timestamp: new Date(),
      stickers: [moodEmojis[mood], '💕'],
    }
    setMessages(prev => [...prev, aiMessage])
    setShowMoodTracker(false)
  }, [canUseFeature])
  
  // Speak text using browser TTS
  const speakText = useCallback((text: string) => {
    return new Promise<void>((resolve) => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = 1.0
        utterance.pitch = 1.1
        utterance.onstart = () => setIsCallSpeaking(true)
        utterance.onend = () => { setIsCallSpeaking(false); resolve() }
        utterance.onerror = () => { setIsCallSpeaking(false); resolve() }
        window.speechSynthesis.speak(utterance)
      } else {
        resolve()
      }
    })
  }, [])
  
  // Start voice call
  const startVoiceCall = useCallback(async () => {
    setIsVoiceCallActive(true)
    callMessagesRef.current = []
    setCallMessages([])
    setVoiceCallMessage('')
    
    const greetings = [
      `Hi there! I'm ${companionName || selectedAvatar?.name}! So glad you called! What would you like to talk about?`,
      `Hey! It's so nice to hear from you! How are you doing today?`,
      `Hello! I was just thinking about you! What's on your mind?`,
    ]
    const greeting = greetings[Math.floor(Math.random() * greetings.length)]
    
    callMessagesRef.current = [{ role: 'ai', text: greeting }]
    setCallMessages([{ role: 'ai', text: greeting }])
    
    await speakText(greeting)
  }, [companionName, selectedAvatar, speakText])
  
  // Toggle call recording
  const toggleCallRecording = useCallback(async () => {
    if (isRecording) {
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
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' })
        mediaRecorderRef.current = mediaRecorder
        callAudioChunksRef.current = []
        
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            callAudioChunksRef.current.push(event.data)
          }
        }
        
        mediaRecorder.onstop = async () => {
          stream.getTracks().forEach(track => track.stop())
          const audioBlob = new Blob(callAudioChunksRef.current, { type: 'audio/webm' })
          
          if (audioBlob.size < 500) {
            const errorMsg = "Recording too short! Please speak longer 🎤"
            callMessagesRef.current = [...callMessagesRef.current, { role: 'ai', text: errorMsg }]
            setCallMessages([...callMessagesRef.current])
            await speakText("Please speak a bit longer!")
            return
          }
          
          try {
            const formData = new FormData()
            formData.append('audio', audioBlob, 'recording.webm')
            
            const asrResponse = await fetch('/api/asr', { method: 'POST', body: formData })
            const asrData = await asrResponse.json()
            
            if (asrData.transcription && asrData.transcription.trim()) {
              const userText = asrData.transcription.trim()
              callMessagesRef.current = [...callMessagesRef.current, { role: 'user', text: userText }]
              setCallMessages([...callMessagesRef.current])
              
              setIsCallLoading(true)
              
              const apiMessages = callMessagesRef.current.map(m => ({
                role: m.role === 'user' ? 'user' as const : 'assistant' as const,
                content: m.text
              }))
              
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
              const aiResponse = chatData.response || "I'm here for you! 💕"
              
              callMessagesRef.current = [...callMessagesRef.current, { role: 'ai', text: aiResponse }]
              setCallMessages([...callMessagesRef.current])
              setIsCallLoading(false)
              
              await speakText(aiResponse)
            } else {
              const errorMsg = asrData.error || "I didn't catch that. Try again? 🎤"
              callMessagesRef.current = [...callMessagesRef.current, { role: 'ai', text: errorMsg }]
              setCallMessages([...callMessagesRef.current])
              await speakText(errorMsg)
            }
          } catch (error) {
            console.error('Voice call error:', error)
            setIsCallLoading(false)
            const errorMsg = "Oops! Something went wrong. Try again! 💕"
            callMessagesRef.current = [...callMessagesRef.current, { role: 'ai', text: errorMsg }]
            setCallMessages([...callMessagesRef.current])
          }
        }
        
        mediaRecorder.start()
        setIsRecording(true)
        setRecordingTime(0)
        
        recordingIntervalRef.current = setInterval(() => {
          setRecordingTime(prev => prev >= 30 ? 0 : prev + 1)
        }, 1000)
        
      } catch (error) {
        console.error('Microphone error:', error)
        alert('Please allow microphone access! 🎤')
      }
    }
  }, [isRecording, ageGroup, companionName, selectedAvatar, speakText])
  
  // End voice call
  const endVoiceCall = useCallback(() => {
    setIsVoiceCallActive(false)
    setIsRecording(false)
    setIsAiSpeaking(false)
    setIsCallLoading(false)
    callMessagesRef.current = []
    setCallMessages([])
    if ('speechSynthesis' in window) window.speechSynthesis.cancel()
    if (mediaRecorderRef.current?.state !== 'inactive') mediaRecorderRef.current?.stop()
    if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current)
  }, [])

  const handleAuth = useCallback(async () => {
    const demoUser: User = {
      id: 'demo-' + Date.now(),
      email: email || 'demo@kawaii.ai',
      name: name || 'Kawaii User',
      tier: 'ULTIMATE', // TESTING MODE: Start with ULTIMATE tier
    }
    setUser(demoUser)
    setMemoryEnabled(true) // TESTING MODE: Memory enabled by default
    setUsage({ messagesToday: 0, totalMessages: 0, currentStreak: 0, longestStreak: 0 })
    setScreen('theme-select')
  }, [email, name])

  const handleUpgrade = useCallback((tier: Tier) => {
    if (user) {
      setUser({ ...user, tier })
      if (tier !== 'FREE') {
        setMemoryEnabled(true)
      }
    }
    setScreen('theme-select')
  }, [user])

  const addSticker = useCallback((emoji: string) => {
    setInputText(prev => prev + ' ' + emoji)
    inputRef.current?.focus()
  }, [])

  const toggleStickers = useCallback(() => setShowStickers(prev => !prev), [])
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setInputText(e.target.value), [])
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) handleSendMessage()
  }, [handleSendMessage])

  // Landing Screen
  const LandingScreen = useMemo(() => (
    <div className="min-h-screen kawaii-gradient flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="floating-element text-4xl" style={{ top: '10%', left: '8%' }}>🌸</div>
      <div className="floating-element text-3xl" style={{ top: '15%', right: '12%', animationDelay: '0.5s' }}>💕</div>
      <div className="floating-element text-3xl" style={{ bottom: '20%', left: '15%', animationDelay: '1s' }}>✨</div>
      <div className="floating-element text-4xl" style={{ bottom: '25%', right: '10%', animationDelay: '1.5s' }}>🦋</div>
      
      <div className="text-center z-10">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-36 h-36 rounded-full shadow-2xl animate-pulse-glow"
            style={{ background: COLOR_THEMES[colorTheme].gradient, boxShadow: `0 20px 60px -15px ${COLOR_THEMES[colorTheme].primaryColor}60` }}>
            <span className="text-7xl animate-bounce-soft">{COLOR_THEMES[colorTheme].emoji}</span>
          </div>
        </div>
        
        <h1 className="kawaii-title text-5xl md:text-7xl font-bold mb-4 text-white drop-shadow-lg">Kawaii AI</h1>
        <p className="text-xl mb-3 font-medium text-white/90">Your Cute AI Companion 💕</p>
        <p className="mb-10 max-w-md mx-auto text-white/70">A sweet, supportive friend who's always there for you ✨</p>
        
        <div className="flex flex-col gap-4 items-center">
          <Button onClick={() => setScreen('auth')} className="kawaii-button text-lg px-10 py-7 h-auto text-white font-semibold">
            Get Started Free 💖
          </Button>
          <Button onClick={() => setScreen('pricing')} variant="outline" className="rounded-full px-8 py-6 text-white border-white/30 bg-white/10 backdrop-blur-sm">
            View Plans ✨
          </Button>
        </div>
        
        <div className="mt-14 flex flex-wrap justify-center gap-3 max-w-lg mx-auto">
          {['🎨 10+ Themes', '🌸 Cute Avatars', '💬 AI Chat', '🔥 Streaks', '🎤 Voice', '📊 Mood Tracking'].map((text, i) => (
            <Badge key={i} className="glass-effect px-5 py-3 rounded-full text-sm font-medium" style={{ color: 'white' }}>{text}</Badge>
          ))}
        </div>
      </div>
    </div>
  ), [colorTheme])

  // Auth Screen
  const AuthScreen = useMemo(() => (
    <div className="min-h-screen kawaii-gradient-soft flex flex-col items-center justify-center p-6">
      <div className="text-center mb-8">
        <div className="text-5xl mb-4 animate-bounce-soft">🎀</div>
        <h2 className="kawaii-title text-3xl font-bold mb-2" style={{ color: 'var(--primary)' }}>
          {authMode === 'login' ? 'Welcome Back!' : 'Join Kawaii AI!'}
        </h2>
        <p style={{ color: 'var(--muted-foreground)' }}>{authMode === 'login' ? 'Sign in to continue' : 'Create your free account'} 💕</p>
      </div>
      
      <Card className="kawaii-card p-8 max-w-md w-full">
        <div className="space-y-4">
          {authMode === 'register' && (
            <div>
              <label className="text-sm font-medium mb-1 block" style={{ color: 'var(--foreground)' }}>Name</label>
              <Input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} className="kawaii-input rounded-full" />
            </div>
          )}
          <div>
            <label className="text-sm font-medium mb-1 block">Email</label>
            <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="kawaii-input rounded-full" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Password</label>
            <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="kawaii-input rounded-full" />
          </div>
        </div>
        
        <Button onClick={handleAuth} className="kawaii-button w-full mt-6 text-white rounded-full py-6">
          {authMode === 'login' ? 'Sign In 💕' : 'Create Account 💖'}
        </Button>
        
        <p className="text-center mt-4 text-sm">
          {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="font-semibold" style={{ color: 'var(--primary)' }}>
            {authMode === 'login' ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </Card>
      
      <Button variant="ghost" onClick={() => setScreen('landing')} className="mt-6 rounded-full" style={{ color: 'var(--primary)' }}>← Back</Button>
    </div>
  ), [authMode, email, password, name, handleAuth])

  // Pricing Screen
  const PricingScreen = useMemo(() => (
    <div className="min-h-screen kawaii-gradient-soft flex flex-col items-center justify-center p-6">
      <div className="text-center mb-10">
        <div className="text-5xl mb-4 animate-bounce-soft">💝</div>
        <h2 className="kawaii-title text-4xl font-bold mb-3" style={{ color: 'var(--primary)' }}>Choose Your Plan</h2>
        <p style={{ color: 'var(--muted-foreground)' }}>Unlock the full Kawaii experience! ✨</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full mb-8">
        {(Object.keys(TIERS) as Tier[]).map((tier) => (
          <Card key={tier} className={`kawaii-card p-6 relative ${tier === 'PREMIUM' ? 'ring-4 scale-105' : ''}`}>
            {tier === 'PREMIUM' && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-white text-sm font-bold" style={{ background: 'var(--theme-gradient)' }}>Most Popular ✨</div>
            )}
            {tier === 'ULTIMATE' && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-white text-sm font-bold bg-gradient-to-r from-amber-400 to-orange-500">Best Value 🌟</div>
            )}
            <div className="text-center">
              <h3 className="kawaii-title text-xl font-bold mb-1" style={{ color: 'var(--primary)' }}>{TIERS[tier].name}</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold">${TIERS[tier].price}</span>
                {TIERS[tier].price > 0 && <span className="text-sm opacity-70">/month</span>}
              </div>
              <ul className="space-y-2 mb-6 text-left">
                {TIERS[tier].features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm"><span style={{ color: 'var(--primary)' }}>✓</span>{feature}</li>
                ))}
              </ul>
              <Button onClick={() => handleUpgrade(tier)} className={`w-full rounded-full py-5 ${tier === 'FREE' ? '' : 'kawaii-button text-white'}`} variant={tier === 'FREE' ? 'outline' : 'default'}>
                {tier === 'FREE' ? 'Current Plan' : `Get ${tier === 'PREMIUM' ? 'Premium' : 'Ultimate'} 💕`}
              </Button>
            </div>
          </Card>
        ))}
      </div>
      
      <Button variant="ghost" onClick={() => setScreen('landing')} className="rounded-full" style={{ color: 'var(--primary)' }}>← Back</Button>
    </div>
  ), [handleUpgrade])

  // Theme Selection Screen
  const ThemeSelectScreen = useMemo(() => (
    <div className="min-h-screen kawaii-gradient-soft flex flex-col items-center justify-center p-6">
      <div className="text-center mb-10">
        <div className="text-5xl mb-4 animate-bounce-soft">🎨</div>
        <h2 className="kawaii-title text-4xl font-bold mb-3" style={{ color: 'var(--primary)' }}>Choose Your Theme</h2>
        <p style={{ color: 'var(--muted-foreground)' }}>
          Pick the color that matches your vibe! ✨
          {user?.tier === 'FREE' && <span className="block mt-2 text-sm">Free plan: 3 themes • <button onClick={() => setScreen('pricing')} className="underline" style={{ color: 'var(--primary)' }}>Unlock all 10+</button></span>}
        </p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl w-full mb-8">
        {(Object.keys(COLOR_THEMES) as ColorTheme[]).map((theme) => {
          const locked = isThemeLocked(theme)
          return (
            <div key={theme} onClick={() => !locked && setColorTheme(theme)}
              className={`theme-picker-card ${colorTheme === theme ? 'selected' : ''} ${locked ? 'opacity-60' : ''}`}
              style={{ background: COLOR_THEMES[theme].gradient, cursor: locked ? 'not-allowed' : 'pointer' }}>
              {locked && <div className="absolute inset-0 bg-black/20 rounded-[20px] flex items-center justify-center"><span className="text-2xl">🔒</span></div>}
              <div className="text-center relative z-10">
                <div className="text-4xl mb-2">{COLOR_THEMES[theme].emoji}</div>
                <h3 className="font-bold text-white text-sm mb-1">{COLOR_THEMES[theme].name}</h3>
                <p className="text-white/80 text-xs">{COLOR_THEMES[theme].description}</p>
              </div>
              {colorTheme === theme && !locked && <div className="absolute top-2 right-2 text-white text-lg">✓</div>}
            </div>
          )
        })}
      </div>
      
      {/* Custom Theme Creator */}
      <Card className="kawaii-card p-6 max-w-md w-full mb-6">
        <h3 className="font-bold mb-4" style={{ color: 'var(--primary)' }}>🎨 Custom Theme Creator</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-xs mb-1 block">Primary</label>
            <input type="color" value={customThemeColors.primary} onChange={(e) => setCustomThemeColors(prev => ({ ...prev, primary: e.target.value }))} className="w-full h-10 rounded-lg cursor-pointer" />
          </div>
          <div>
            <label className="text-xs mb-1 block">Secondary</label>
            <input type="color" value={customThemeColors.secondary} onChange={(e) => setCustomThemeColors(prev => ({ ...prev, secondary: e.target.value }))} className="w-full h-10 rounded-lg cursor-pointer" />
          </div>
          <div>
            <label className="text-xs mb-1 block">Accent</label>
            <input type="color" value={customThemeColors.accent} onChange={(e) => setCustomThemeColors(prev => ({ ...prev, accent: e.target.value }))} className="w-full h-10 rounded-lg cursor-pointer" />
          </div>
        </div>
        <Button className="kawaii-button w-full mt-4 text-white rounded-full">Create My Theme 💕</Button>
      </Card>
      
      <div className="flex gap-4">
        <Button variant="outline" onClick={() => setScreen('auth')} className="rounded-full px-6">← Back</Button>
        <Button onClick={() => setScreen('age-select')} className="kawaii-button text-white rounded-full px-8">Continue 💕</Button>
      </div>
    </div>
  ), [colorTheme, user?.tier, isThemeLocked, customThemeColors])

  // Age Selection Screen
  const AgeSelectScreen = useMemo(() => (
    <div className="min-h-screen kawaii-gradient-soft flex flex-col items-center justify-center p-6">
      <div className="text-center mb-10">
        <div className="text-5xl mb-4 animate-bounce-soft">💝</div>
        <h2 className="kawaii-title text-4xl font-bold mb-3" style={{ color: 'var(--primary)' }}>Choose Your Version</h2>
        <p style={{ color: 'var(--muted-foreground)' }}>Select the experience that fits you best! ✨</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl w-full mb-8">
        {(Object.keys(AGE_GROUPS) as AgeGroup[]).map((age) => (
          <Card key={age} className={`kawaii-card cursor-pointer ${ageGroup === age ? 'ring-4' : ''}`} onClick={() => setAgeGroup(age)}>
            <div className="text-center p-4">
              <h3 className="kawaii-title text-xl font-bold mb-1" style={{ color: 'var(--primary)' }}>{AGE_GROUPS[age].title}</h3>
              <p className="text-sm mb-2 opacity-70">Ages {AGE_GROUPS[age].age}</p>
              <p className="text-sm mb-3">{AGE_GROUPS[age].description}</p>
              <Badge className="kawaii-badge rounded-full">{AGE_GROUPS[age].theme}</Badge>
            </div>
          </Card>
        ))}
      </div>
      
      <div className="flex gap-4">
        <Button variant="outline" onClick={() => setScreen('theme-select')} className="rounded-full px-6">← Back</Button>
        <Button onClick={() => setScreen('avatar-select')} className="kawaii-button text-white rounded-full px-8">Continue 💕</Button>
      </div>
    </div>
  ), [ageGroup])

  // Avatar Selection Screen
  const AvatarSelectScreen = useMemo(() => (
    <div className="min-h-screen kawaii-gradient-soft flex flex-col items-center justify-center p-6">
      <div className="text-center mb-10">
        <div className="text-5xl mb-4 animate-bounce-soft">✨</div>
        <h2 className="kawaii-title text-4xl font-bold mb-3" style={{ color: 'var(--primary)' }}>Pick Your Companion</h2>
        <p style={{ color: 'var(--muted-foreground)' }}>
          Choose the friend that speaks to you! 💕
          {user?.tier === 'FREE' && <span className="block mt-2 text-sm">Free plan: 3 avatars • <button onClick={() => setScreen('pricing')} className="underline" style={{ color: 'var(--primary)' }}>Unlock all</button></span>}
        </p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl w-full mb-8">
        {AVATARS[ageGroup].map((avatar) => {
          const locked = isAvatarLocked(avatar)
          return (
            <Card key={avatar.id} className={`avatar-card ${selectedAvatar?.id === avatar.id ? 'selected' : ''} ${locked ? 'opacity-60' : ''}`}
              onClick={() => !locked && setSelectedAvatar(avatar)} style={{ cursor: locked ? 'not-allowed' : 'pointer' }}>
              {locked && <div className="absolute inset-0 bg-black/10 rounded-[var(--radius)] flex items-center justify-center z-10"><span className="text-3xl">🔒</span></div>}
              <div className="text-center">
                <div className="text-5xl mb-3 p-4 rounded-full mx-auto w-fit" style={{ backgroundColor: `${avatar.color}40` }}>{avatar.emoji}</div>
                <h3 className="text-lg font-bold" style={{ color: 'var(--primary)' }}>{avatar.name}</h3>
                <p className="text-xs mt-1 opacity-70">{avatar.personality}</p>
              </div>
            </Card>
          )
        })}
      </div>
      
      <div className="flex gap-4">
        <Button variant="outline" onClick={() => setScreen('age-select')} className="rounded-full px-6">← Back</Button>
        <Button onClick={() => selectedAvatar && setScreen('name-companion')} disabled={!selectedAvatar} className="kawaii-button text-white rounded-full px-8 disabled:opacity-50">Continue 💕</Button>
      </div>
    </div>
  ), [ageGroup, selectedAvatar, user?.tier, isAvatarLocked])

  // Name Companion Screen
  const NameCompanionScreen = useMemo(() => (
    <div className="min-h-screen kawaii-gradient-soft flex flex-col items-center justify-center p-6">
      <div className="text-center mb-10">
        <div className="text-6xl mb-4 animate-bounce-soft">{selectedAvatar?.emoji}</div>
        <h2 className="kawaii-title text-4xl font-bold mb-3" style={{ color: 'var(--primary)' }}>Name Your Friend!</h2>
        <p style={{ color: 'var(--muted-foreground)' }}>
          Give your companion a special name! 💕
        </p>
      </div>
      
      <Card className="kawaii-card p-8 max-w-md w-full mb-8">
        <div className="text-center mb-6">
          <div className="text-7xl p-4 rounded-full inline-block mb-4" style={{ backgroundColor: `${selectedAvatar?.color}30` }}>{selectedAvatar?.emoji}</div>
          <p className="text-sm opacity-70">Default name: <span className="font-bold" style={{ color: 'var(--primary)' }}>{selectedAvatar?.name}</span></p>
        </div>
        
        <Input placeholder={selectedAvatar?.name} value={companionName} onChange={(e) => setCompanionName(e.target.value)} className="kawaii-input text-center text-lg p-4 rounded-full" />
        
        {/* Memory Mode Toggle */}
        <div className="mt-6 p-4 rounded-xl border" style={{ borderColor: 'var(--border)', background: 'var(--secondary)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold" style={{ color: 'var(--primary)' }}>🧠 Memory Mode</p>
              <p className="text-xs opacity-70">AI remembers your conversations</p>
            </div>
            <button onClick={() => setMemoryEnabled(!memoryEnabled)} className={`w-14 h-7 rounded-full transition-all ${memoryEnabled ? 'bg-green-400' : 'bg-gray-300'}`}>
              <div className={`w-6 h-6 bg-white rounded-full shadow transition-transform ${memoryEnabled ? 'translate-x-7' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </div>
      </Card>
      
      <div className="flex gap-4">
        <Button variant="outline" onClick={() => setScreen('avatar-select')} className="rounded-full px-6">← Back</Button>
        <Button onClick={() => setScreen('chat')} className="kawaii-button text-white rounded-full px-8">Let&apos;s Chat! 💖</Button>
      </div>
    </div>
  ), [selectedAvatar, companionName, user?.tier, memoryEnabled])

  // Chat Screen
  const ChatScreen = (
    <div className="min-h-screen kawaii-gradient-soft flex flex-col">
      {/* Header */}
      <div className="glass-effect p-4 sticky top-0 z-10 border-b-2" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-3xl shadow-lg" style={{ backgroundColor: `${selectedAvatar?.color}50` }}>
            {selectedAvatar?.emoji}
          </div>
          <div className="flex-1">
            <h3 className="kawaii-title font-bold text-lg" style={{ color: 'var(--primary)' }}>{companionName || selectedAvatar?.name}</h3>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-2"><span className="online-pulse"></span><span className="text-green-600">Online</span></span>
              {usage.currentStreak > 0 && <span style={{ color: 'var(--primary)' }}>🔥 {usage.currentStreak} day streak</span>}
              {memoryEnabled && <span style={{ color: 'var(--primary)' }}>🧠 Memory</span>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Voice Call */}
            {canUseFeature('voiceCalls') && (
              <Button onClick={startVoiceCall} className="rounded-full p-3" variant="outline" style={{ borderColor: 'var(--border)' }}>
                <span className="text-xl">📞</span>
              </Button>
            )}
            {/* Mood Tracker */}
            {canUseFeature('moodTracking') && (
              <Button onClick={() => setShowMoodTracker(true)} className="rounded-full p-3" variant="outline" style={{ borderColor: 'var(--border)' }}>
                <span className="text-xl">📊</span>
              </Button>
            )}
            <Badge className="kawaii-badge rounded-full px-4 py-2" style={{ background: user?.tier === 'FREE' ? 'var(--muted)' : 'var(--primary)', color: user?.tier === 'FREE' ? 'var(--foreground)' : 'white' }}>
              {user?.tier || 'FREE'}
            </Badge>
            {user?.tier === 'FREE' && <Button onClick={() => setScreen('pricing')} size="sm" className="kawaii-button text-white rounded-full text-xs">Upgrade</Button>}
          </div>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] md:max-w-[70%] ${message.sender === 'user' ? 'message-bubble-user' : 'message-bubble-ai'}`}>
                {message.hasPhoto && (
                  <div className="mb-2 p-2 rounded-xl bg-white/20">
                    <p className="text-sm">📸 Photo shared</p>
                  </div>
                )}
                {message.stickers && <div className="flex gap-1 mb-2">{message.stickers.map((s, i) => <span key={i} className="text-lg">{s}</span>)}</div>}
                <p className="leading-relaxed">{message.text}</p>
                <p className={`text-xs mt-2 ${message.sender === 'user' ? 'opacity-70 text-white' : 'text-gray-400'}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {message.isVoice && ' 🎤'}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="message-bubble-ai"><div className="loading-dots"><span></span><span></span><span></span></div></div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Stickers Panel */}
      {showStickers && (
        <div className="glass-effect p-4 border-t-2" style={{ borderColor: 'var(--border)' }}>
          <div className="max-w-2xl mx-auto">
            <p className="text-sm mb-3 font-medium" style={{ color: 'var(--primary)' }}>✨ Cute Stickers</p>
            <div className="grid grid-cols-8 gap-2">
              {STICKERS.map((s) => <button key={s.id} onClick={() => addSticker(s.emoji)} className="sticker-container text-2xl">{s.emoji}</button>)}
              {user?.tier !== 'FREE' && PREMIUM_STICKERS.map((s) => <button key={s.id} onClick={() => addSticker(s.emoji)} className="sticker-container text-2xl">{s.emoji}</button>)}
            </div>
          </div>
        </div>
      )}
      
      {/* Mood Tracker Modal */}
      {showMoodTracker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="kawaii-card p-6 max-w-md w-full">
            <h3 className="kawaii-title text-xl font-bold mb-4 text-center" style={{ color: 'var(--primary)' }}>📊 How are you feeling?</h3>
            <p className="text-center text-sm mb-4 opacity-70">Tap an emoji to log your mood</p>
            <div className="flex justify-center gap-2 mb-6">
              {['😔', '😕', '😐', '🙂', '😊', '😄'].map((emoji, i) => (
                <button key={i} onClick={() => handleMoodLog(i, moodNotes)}
                  className={`text-4xl p-3 rounded-xl transition-all hover:scale-110 ${currentMood === i ? 'scale-125 ring-2 ring-pink-400' : ''}`}>
                  {emoji}
                </button>
              ))}
            </div>
            <div className="mb-4">
              <Input 
                placeholder="Add a note about how you're feeling... (optional)" 
                value={moodNotes}
                onChange={(e) => setMoodNotes(e.target.value)}
                className="kawaii-input rounded-full" 
              />
            </div>
            <Button onClick={() => setShowMoodTracker(false)} variant="outline" className="w-full rounded-full">Cancel</Button>
          </Card>
        </div>
      )}
      
      {/* Voice Call Modal */}
      {isVoiceCallActive && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <Card className="kawaii-card p-8 text-center max-w-sm w-full">
            <div className="text-8xl mb-4 animate-bounce-soft">{selectedAvatar?.emoji}</div>
            <h3 className="kawaii-title text-2xl font-bold mb-2" style={{ color: 'var(--primary)' }}>{companionName || selectedAvatar?.name}</h3>
            <p className="text-sm mb-4 opacity-70">
              {isCallSpeaking ? '🔊 Speaking...' : isCallLoading ? '💭 Thinking...' : isRecording ? '🎤 Listening...' : '📞 Voice Call Active'}
            </p>
            
            {/* Call Messages */}
            <div className="max-h-40 overflow-y-auto mb-4 space-y-2 text-left">
              {callMessages.map((msg, i) => (
                <div key={i} className={`p-2 rounded-xl text-sm ${msg.role === 'user' ? 'bg-pink-100 ml-8' : 'bg-gray-100 mr-8'}`}>
                  <span className="font-medium">{msg.role === 'user' ? 'You: ' : `${companionName || selectedAvatar?.name}: `}</span>
                  {msg.text}
                </div>
              ))}
            </div>
            
            {isRecording && (
              <div className="mb-4">
                <div className="flex items-center justify-center gap-1">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-red-500 font-medium">{recordingTime}s / 30s</span>
                </div>
              </div>
            )}
            
            <div className="flex justify-center gap-4 mb-4">
              <button onClick={toggleCallRecording} disabled={isCallLoading || isCallSpeaking}
                className={`p-6 rounded-full transition-all shadow-lg ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-gradient-to-r from-pink-400 to-pink-500 text-white hover:scale-105'} disabled:opacity-50`}>
                <span className="text-3xl">{isRecording ? '⏹️' : '🎤'}</span>
              </button>
            </div>
            
            <p className="text-xs text-gray-500 mb-4">💡 Tap mic to talk. AI will respond with voice!</p>
            <Button onClick={endVoiceCall} className="rounded-full px-8 py-3 bg-red-500 hover:bg-red-600 text-white">End Call</Button>
          </Card>
        </div>
      )}
      
      {/* Input Area */}
      <div className="glass-effect p-4 sticky bottom-0 border-t-2" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-2xl mx-auto flex gap-3 items-end">
          <button onClick={toggleStickers} className="p-4 rounded-full transition-all border-2 hover:scale-105"
            style={{ background: showStickers ? 'var(--primary)' : 'var(--secondary)', borderColor: 'var(--border)', color: showStickers ? 'white' : 'var(--primary)' }}>
            <span className="text-2xl">{showStickers ? '🙈' : '😊'}</span>
          </button>
          
          {/* Voice Message */}
          {canUseFeature('voiceMessages') && (
            <button onClick={handleVoiceMessage} className={`relative p-4 rounded-full transition-all border-2 hover:scale-105 ${isRecording ? 'animate-pulse' : ''}`}
              style={{ background: isRecording ? 'var(--primary)' : 'var(--secondary)', borderColor: 'var(--border)', color: isRecording ? 'white' : 'var(--primary)' }}>
              <span className="text-2xl">{isRecording ? '⏹️' : '🎤'}</span>
              {isRecording && (
                <span className="absolute -top-2 -right-2 text-xs bg-red-500 text-white rounded-full px-2 py-0.5 font-bold">{recordingTime}s</span>
              )}
            </button>
          )}
          
          {/* Photo Share */}
          {canUseFeature('photoSharing') && (
            <>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoShare} />
              <button onClick={() => fileInputRef.current?.click()} className="p-4 rounded-full transition-all border-2 hover:scale-105"
                style={{ background: 'var(--secondary)', borderColor: 'var(--border)', color: 'var(--primary)' }}>
                <span className="text-2xl">📸</span>
              </button>
            </>
          )}
          
          <div className="flex-1 relative">
            <input ref={inputRef} type="text" value={inputText} onChange={handleInputChange} onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              disabled={isLoading}
              className="kawaii-input w-full pr-4 py-4 px-5 rounded-full border-2 focus:outline-none text-base" />
          </div>
          
          <Button onClick={handleSendMessage} disabled={!inputText.trim() || isLoading}
            className="kawaii-button rounded-full px-6 py-6 h-auto disabled:opacity-50">
            <span className="text-2xl">💕</span>
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <div className={`theme-${colorTheme}`}>
      {screen === 'landing' && LandingScreen}
      {screen === 'auth' && AuthScreen}
      {screen === 'pricing' && PricingScreen}
      {screen === 'theme-select' && ThemeSelectScreen}
      {screen === 'age-select' && AgeSelectScreen}
      {screen === 'avatar-select' && AvatarSelectScreen}
      {screen === 'name-companion' && NameCompanionScreen}
      {screen === 'chat' && ChatScreen}
    </div>
  )
}
