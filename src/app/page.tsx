'use client'

import { useState, useRef, useEffect, useCallback, memo } from 'react'

// ═══════════════════════════════════════════════════════════════════════════
// KAWAII AI - Premium Edition ✨
// Pinterest-level aesthetics with premium micro-interactions
// ═══════════════════════════════════════════════════════════════════════════

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
}

interface CallMessage {
  role: 'user' | 'ai'
  text: string
}

interface AvatarType {
  id: string
  name: string
  emoji: string
  color: string
  personality: string
  bg: string
}

// ═══════════════════════════════════════════════════════════════════════════
// COLOR THEMES
// ═══════════════════════════════════════════════════════════════════════════

const THEMES: Record<Theme, { 
  name: string; emoji: string; gradient: string; softGradient: string;
  primary: string; secondary: string; accent: string; cardBg: string; textMuted: string;
}> = {
  pink: { name: 'Rose Petal', emoji: '🎀', gradient: 'linear-gradient(135deg, #FF6B9D 0%, #C44569 50%, #FF8E9E 100%)', softGradient: 'linear-gradient(135deg, #FFF0F5 0%, #FFE4EC 100%)', primary: '#FF6B9D', secondary: '#FFB6C1', accent: '#E91E63', cardBg: 'rgba(255, 182, 193, 0.15)', textMuted: '#D4788C' },
  lavender: { name: 'Lavender Dream', emoji: '💜', gradient: 'linear-gradient(135deg, #A78BFA 0%, #7C3AED 50%, #C4B5FD 100%)', softGradient: 'linear-gradient(135deg, #FAF5FF 0%, #F3E8FF 100%)', primary: '#8B5CF6', secondary: '#C4B5FD', accent: '#6D28D9', cardBg: 'rgba(167, 139, 250, 0.15)', textMuted: '#7C3AED' },
  rose: { name: 'Rose Gold', emoji: '🌹', gradient: 'linear-gradient(135deg, #F4A5A5 0%, #B76E79 50%, #E8B4B8 100%)', softGradient: 'linear-gradient(135deg, #FFF5F5 0%, #FED7D7 100%)', primary: '#B76E79', secondary: '#F4A5A5', accent: '#9F5F6B', cardBg: 'rgba(183, 110, 121, 0.12)', textMuted: '#9F5F6B' },
  sage: { name: 'Sage Garden', emoji: '🌿', gradient: 'linear-gradient(135deg, #86C8BC 0%, #4A7C59 50%, #A8D5BA 100%)', softGradient: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)', primary: '#4A7C59', secondary: '#86C8BC', accent: '#2D5A3D', cardBg: 'rgba(134, 200, 188, 0.15)', textMuted: '#4A7C59' },
  sky: { name: 'Sky Blue', emoji: '☁️', gradient: 'linear-gradient(135deg, #7DD3FC 0%, #0EA5E9 50%, #BAE6FD 100%)', softGradient: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)', primary: '#0EA5E9', secondary: '#7DD3FC', accent: '#0284C7', cardBg: 'rgba(125, 211, 252, 0.15)', textMuted: '#0EA5E9' },
  coral: { name: 'Coral Sunset', emoji: '🌅', gradient: 'linear-gradient(135deg, #FDBA74 0%, #F97316 50%, #FED7AA 100%)', softGradient: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)', primary: '#F97316', secondary: '#FDBA74', accent: '#EA580C', cardBg: 'rgba(253, 186, 116, 0.15)', textMuted: '#F97316' },
  mint: { name: 'Fresh Mint', emoji: '🍃', gradient: 'linear-gradient(135deg, #6EE7B7 0%, #10B981 50%, #A7F3D0 100%)', softGradient: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)', primary: '#10B981', secondary: '#6EE7B7', accent: '#059669', cardBg: 'rgba(110, 231, 183, 0.15)', textMuted: '#10B981' },
  berry: { name: 'Berry Bliss', emoji: '🫐', gradient: 'linear-gradient(135deg, #C084FC 0%, #9333EA 50%, #DDD6FE 100%)', softGradient: 'linear-gradient(135deg, #FAF5FF 0%, #F3E8FF 100%)', primary: '#9333EA', secondary: '#C084FC', accent: '#7E22CE', cardBg: 'rgba(192, 132, 252, 0.15)', textMuted: '#9333EA' },
  peach: { name: 'Peachy Keen', emoji: '🍑', gradient: 'linear-gradient(135deg, #FDBA74 0%, #FB923C 50%, #FED7AA 100%)', softGradient: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)', primary: '#FB923C', secondary: '#FDBA74', accent: '#EA580C', cardBg: 'rgba(253, 186, 116, 0.15)', textMuted: '#FB923C' },
  lilac: { name: 'Soft Lilac', emoji: '🪻', gradient: 'linear-gradient(135deg, #C4B5FD 0%, #8B5CF6 50%, #DDD6FE 100%)', softGradient: 'linear-gradient(135deg, #FAF5FF 0%, #EDE9FE 100%)', primary: '#8B5CF6', secondary: '#C4B5FD', accent: '#6D28D9', cardBg: 'rgba(196, 181, 253, 0.15)', textMuted: '#7C3AED' },
}

const AGES: Record<AgeGroup, { title: string; range: string; desc: string; vibe: string; icon: string }> = {
  junior: { title: 'Kawaii Junior', range: '8-12', desc: 'Fun, safe & magical adventures!', vibe: 'Playful', icon: '🌈' },
  teen: { title: 'Kawaii Teen', range: '13-17', desc: 'Your aesthetic bestie!', vibe: 'Trendy', icon: '✨' },
  'young-adult': { title: 'Kawaii Young Adult', range: '18-25', desc: 'Life, love & dreams!', vibe: 'Modern', icon: '💫' },
  plus: { title: 'Kawaii Plus', range: '25-35', desc: 'Wellness & personal growth!', vibe: 'Elegant', icon: '🌸' },
}

const AVATARS: Record<AgeGroup, AvatarType[]> = {
  junior: [
    { id: 'bunny', name: 'Bunny', emoji: '🐰', color: '#FFB6C1', personality: 'Playful & curious', bg: 'linear-gradient(135deg, #FFE4EC, #FFF0F5)' },
    { id: 'kitty', name: 'Kitty', emoji: '🐱', color: '#DDA0DD', personality: 'Sweet & gentle', bg: 'linear-gradient(135deg, #F3E8FF, #FAF5FF)' },
    { id: 'panda', name: 'Panda', emoji: '🐼', color: '#B0E0E6', personality: 'Calm & friendly', bg: 'linear-gradient(135deg, #E0F2FE, #F0F9FF)' },
    { id: 'bear', name: 'Bear', emoji: '🐻', color: '#F5DEB3', personality: 'Warm & caring', bg: 'linear-gradient(135deg, #FEF3C7, #FFFBEB)' },
    { id: 'fox', name: 'Foxy', emoji: '🦊', color: '#FFA07A', personality: 'Clever & fun', bg: 'linear-gradient(135deg, #FFEDD5, #FFF7ED)' },
    { id: 'owl', name: 'Owly', emoji: '🦉', color: '#E6E6FA', personality: 'Wise & kind', bg: 'linear-gradient(135deg, #EDE9FE, #FAF5FF)' },
  ],
  teen: [
    { id: 'luna', name: 'Luna', emoji: '🌟', color: '#A78BFA', personality: 'Dreamy & creative', bg: 'linear-gradient(135deg, #DDD6FE, #FAF5FF)' },
    { id: 'aria', name: 'Aria', emoji: '🌙', color: '#93C5FD', personality: 'Calm & thoughtful', bg: 'linear-gradient(135deg, #DBEAFE, #EFF6FF)' },
    { id: 'sakura', name: 'Sakura', emoji: '🌸', color: '#FDA4AF', personality: 'Cheerful & sweet', bg: 'linear-gradient(135deg, #FFE4E6, #FFF1F2)' },
    { id: 'marina', name: 'Marina', emoji: '🌊', color: '#67E8F9', personality: 'Free-spirited', bg: 'linear-gradient(135deg, #CFFAFE, #ECFEFF)' },
    { id: 'ember', name: 'Ember', emoji: '🔥', color: '#FDBA74', personality: 'Passionate & bold', bg: 'linear-gradient(135deg, #FED7AA, #FFF7ED)' },
    { id: 'willow', name: 'Willow', emoji: '🍃', color: '#86EFAC', personality: 'Gentle & caring', bg: 'linear-gradient(135deg, #DCFCE7, #F0FDF4)' },
  ],
  'young-adult': [
    { id: 'aurora', name: 'Aurora', emoji: '💎', color: '#C4B5FD', personality: 'Elegant & wise', bg: 'linear-gradient(135deg, #EDE9FE, #FAF5FF)' },
    { id: 'rosa', name: 'Rosa', emoji: '🌹', color: '#FDA4AF', personality: 'Graceful & kind', bg: 'linear-gradient(135deg, #FFE4E6, #FFF1F2)' },
    { id: 'nova', name: 'Nova', emoji: '👑', color: '#FCD34D', personality: 'Confident & supportive', bg: 'linear-gradient(135deg, #FEF3C7, #FFFBEB)' },
    { id: 'lotus', name: 'Lotus', emoji: '🪷', color: '#FDA4AF', personality: 'Serene & mindful', bg: 'linear-gradient(135deg, #FFE4E6, #FFF1F2)' },
    { id: 'celeste', name: 'Celeste', emoji: '🦋', color: '#A5B4FC', personality: 'Transformative', bg: 'linear-gradient(135deg, #E0E7FF, #EEF2FF)' },
    { id: 'phoenix', name: 'Phoenix', emoji: '🔥', color: '#FB923C', personality: 'Resilient & inspiring', bg: 'linear-gradient(135deg, #FED7AA, #FFF7ED)' },
  ],
  plus: [
    { id: 'sage', name: 'Sage', emoji: '🔮', color: '#C4B5FD', personality: 'Insightful & calm', bg: 'linear-gradient(135deg, #EDE9FE, #FAF5FF)' },
    { id: 'harbor', name: 'Harbor', emoji: '⚓', color: '#93C5FD', personality: 'Steady & reliable', bg: 'linear-gradient(135deg, #DBEAFE, #EFF6FF)' },
    { id: 'summit', name: 'Summit', emoji: '🏔️', color: '#A5B4FC', personality: 'Strong & supportive', bg: 'linear-gradient(135deg, #E0E7FF, #EEF2FF)' },
    { id: 'oak', name: 'Oak', emoji: '🌳', color: '#86EFAC', personality: 'Grounded & wise', bg: 'linear-gradient(135deg, #DCFCE7, #F0FDF4)' },
    { id: 'sol', name: 'Sol', emoji: '☀️', color: '#FCD34D', personality: 'Warm & encouraging', bg: 'linear-gradient(135deg, #FEF3C7, #FFFBEB)' },
    { id: 'pearl', name: 'Pearl', emoji: '🐚', color: '#FED7AA', personality: 'Patient & nurturing', bg: 'linear-gradient(135deg, #FFEDD5, #FFF7ED)' },
  ],
}

const STICKERS = ['💕', '✨', '🌸', '💖', '🦋', '🎀', '⭐', '🌺', '🦄', '🌈', '🍭', '🍰', '💝', '💗', '🩷', '🤍']

const PRICING: Record<Tier, { name: string; price: number; features: string[]; icon: string }> = {
  FREE: { name: 'Free', price: 0, features: ['15 messages/day', '3 themes', '3 avatars', 'Basic chat'], icon: '🌸' },
  PREMIUM: { name: 'Premium', price: 7.99, features: ['Unlimited messages', 'All 10 themes', 'All 24 avatars', 'Voice messages', 'Memory mode'], icon: '✨' },
  ULTIMATE: { name: 'Ultimate', price: 14.99, features: ['Everything in Premium', 'Voice calls', 'Photo sharing', 'Mood tracking', 'Custom themes'], icon: '👑' },
}

// ═══════════════════════════════════════════════════════════════════════════
// CONFETTI COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const Confetti = memo(({ active }: { active: boolean }) => {
  if (!active) return null
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-confetti"
          style={{
            left: `${Math.random() * 100}%`,
            top: '-20px',
            fontSize: `${12 + Math.random() * 16}px`,
            animationDelay: `${Math.random() * 0.5}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
          }}
        >
          {['🎉', '✨', '💖', '🌸', '⭐', '🎀', '💕', '🦋'][Math.floor(Math.random() * 8)]}
        </div>
      ))}
      <style jsx>{`
        @keyframes confetti {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .animate-confetti { animation: confetti 3s ease-out forwards; }
      `}</style>
    </div>
  )
})
Confetti.displayName = 'Confetti'

// ═══════════════════════════════════════════════════════════════════════════
// PREMIUM BUTTON COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const PButton = memo(({ 
  children, onClick, variant = 'primary', disabled = false, className = '', colors 
}: { 
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'ghost'
  disabled?: boolean
  className?: string
  colors: typeof THEMES[Theme]
}) => {
  const baseStyle = "relative overflow-hidden font-semibold transition-all duration-200 active:scale-95"
  const variants = {
    primary: `text-white shadow-lg hover:shadow-xl ${disabled ? 'opacity-50' : 'hover:-translate-y-0.5'}`,
    secondary: `border-2 backdrop-blur-sm ${disabled ? 'opacity-50' : 'hover:bg-white/50'}`,
    ghost: 'hover:bg-white/20'
  }
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${className}`}
      style={variant === 'primary' ? { 
        background: colors.gradient,
        boxShadow: `0 10px 30px -10px ${colors.primary}60`
      } : variant === 'secondary' ? {
        borderColor: colors.primary,
        color: colors.primary,
        background: colors.cardBg
      } : {}}
    >
      <span className="relative z-10">{children}</span>
      {variant === 'primary' && !disabled && (
        <span className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300"
          style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.2), transparent)' }} />
      )}
    </button>
  )
})
PButton.displayName = 'PButton'

// ═══════════════════════════════════════════════════════════════════════════
// LANDING PAGE
// ═══════════════════════════════════════════════════════════════════════════

const Landing = memo(({ colors, theme, navigate }: { colors: typeof THEMES[Theme]; theme: Theme; navigate: (s: Screen) => void }) => (
  <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: colors.softGradient }}>
    {/* Animated Orbs */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full animate-orb-1" style={{ background: `radial-gradient(circle, ${colors.primary}40 0%, transparent 70%)` }} />
      <div className="absolute bottom-[-15%] left-[-10%] w-[400px] h-[400px] rounded-full animate-orb-2" style={{ background: `radial-gradient(circle, ${colors.secondary}50 0%, transparent 70%)` }} />
      <div className="absolute top-[40%] left-[10%] w-[300px] h-[300px] rounded-full animate-orb-3" style={{ background: `radial-gradient(circle, ${colors.accent}20 0%, transparent 70%)` }} />
    </div>
    
    {/* Sparkles */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <div key={i} className="absolute w-1 h-1 rounded-full animate-sparkle"
          style={{
            top: `${(i * 5) % 100}%`, left: `${(i * 7 + 10) % 100}%`,
            background: i % 2 === 0 ? colors.primary : colors.secondary,
            animationDelay: `${i * 0.25}s`, opacity: 0.6
          }} />
      ))}
    </div>

    {/* Content */}
    <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12">
      {/* Logo */}
      <div className="relative mb-8 animate-float-slow">
        <div className="w-32 h-32 rounded-3xl shadow-2xl flex items-center justify-center transform hover:scale-105 transition-all duration-500 cursor-pointer"
          style={{ background: colors.gradient, boxShadow: `0 25px 50px -12px ${colors.primary}40` }}>
          <span className="text-6xl animate-pulse-soft">{THEMES[theme].emoji}</span>
        </div>
        <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center animate-bounce">
          <span className="text-xl">💕</span>
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-10">
        <h1 className="text-5xl md:text-6xl font-bold mb-3 tracking-tight animate-title-shimmer"
          style={{ background: colors.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          Kawaii AI
        </h1>
        <p className="text-lg md:text-xl mb-2" style={{ color: colors.textMuted }}>Your Cute AI Companion 💕</p>
        <p className="text-sm md:text-base opacity-70 max-w-md mx-auto animate-fade-in" style={{ color: colors.textMuted }}>
          A sweet, supportive friend who's always there for you
        </p>
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-4 w-full max-w-xs animate-slide-up">
        <PButton onClick={() => navigate('auth')} className="w-full py-4 px-8 rounded-2xl text-lg" colors={colors}>
          Get Started Free 💖
        </PButton>
        <PButton onClick={() => navigate('pricing')} variant="secondary" className="w-full py-4 px-8 rounded-2xl text-base" colors={colors}>
          View Plans ✨
        </PButton>
      </div>

      {/* Features */}
      <div className="mt-12 flex flex-wrap justify-center gap-3 max-w-lg">
        {[
          { icon: '🎨', text: '10+ Themes', delay: 0 },
          { icon: '🌸', text: '24 Avatars', delay: 0.05 },
          { icon: '💬', text: 'AI Chat', delay: 0.1 },
          { icon: '🎤', text: 'Voice', delay: 0.15 },
          { icon: '📞', text: 'Calls', delay: 0.2 },
          { icon: '📊', text: 'Mood', delay: 0.25 }
        ].map((item, i) => (
          <div key={i} className="px-4 py-2 rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-default animate-scale-in"
            style={{ background: 'white', color: colors.textMuted, boxShadow: `0 4px 15px -3px ${colors.primary}20`, animationDelay: `${item.delay + 0.3}s` }}>
            {item.icon} {item.text}
          </div>
        ))}
      </div>
    </div>

    {/* Bottom Wave */}
    <div className="absolute bottom-0 left-0 right-0 h-24 overflow-hidden">
      <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="absolute bottom-0 w-full h-full" style={{ fill: 'white', opacity: 0.5 }}>
        <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
      </svg>
    </div>

    <style jsx>{`
      @keyframes orb-1 { 0%, 100% { transform: translate(0, 0) scale(1); } 25% { transform: translate(-30px, 20px) scale(1.1); } 50% { transform: translate(20px, -10px) scale(0.95); } 75% { transform: translate(-10px, -20px) scale(1.05); } }
      .animate-orb-1 { animation: orb-1 15s ease-in-out infinite; }
      @keyframes orb-2 { 0%, 100% { transform: translate(0, 0) scale(1); } 33% { transform: translate(40px, -30px) scale(1.15); } 66% { transform: translate(-20px, 20px) scale(0.9); } }
      .animate-orb-2 { animation: orb-2 18s ease-in-out infinite; }
      @keyframes orb-3 { 0%, 100% { transform: translate(0, 0) rotate(0deg); } 50% { transform: translate(30px, 30px) rotate(180deg); } }
      .animate-orb-3 { animation: orb-3 20s ease-in-out infinite; }
      @keyframes sparkle { 0%, 100% { opacity: 0; transform: scale(0); } 50% { opacity: 0.8; transform: scale(1); } }
      .animate-sparkle { animation: sparkle 3s ease-in-out infinite; }
      @keyframes pulse-soft { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
      .animate-pulse-soft { animation: pulse-soft 2s ease-in-out infinite; }
      @keyframes float-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
      .animate-float-slow { animation: float-slow 3s ease-in-out infinite; }
      @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
      .animate-fade-in { animation: fade-in 0.5s ease-out forwards; opacity: 0; }
      @keyframes slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      .animate-slide-up { animation: slide-up 0.5s ease-out 0.4s forwards; opacity: 0; }
      @keyframes scale-in { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
      .animate-scale-in { animation: scale-in 0.3s ease-out forwards; opacity: 0; }
      @keyframes title-shimmer { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
      .animate-title-shimmer { background-size: 200% 200%; animation: title-shimmer 3s ease infinite; }
    `}</style>
  </div>
))
Landing.displayName = 'Landing'

// ═══════════════════════════════════════════════════════════════════════════
// AUTH PAGE
// ═══════════════════════════════════════════════════════════════════════════

const Auth = memo(({ colors, navigate }: { colors: typeof THEMES[Theme]; navigate: (s: Screen) => void }) => (
  <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: colors.softGradient }}>
    <button onClick={() => navigate('landing')} className="absolute top-6 left-6 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:shadow-xl transition-all active:scale-90">
      <span className="text-xl">←</span>
    </button>
    <div className="absolute top-20 right-10 w-64 h-64 rounded-full blur-3xl opacity-30" style={{ background: colors.primary }} />

    <div className="relative z-10 bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full animate-scale-in" style={{ boxShadow: `0 25px 50px -12px ${colors.primary}25` }}>
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg animate-pulse-soft" style={{ background: colors.gradient }}>
          <span className="text-3xl">🎀</span>
        </div>
        <h2 className="text-2xl font-bold" style={{ color: colors.primary }}>Join Kawaii AI!</h2>
        <p className="text-sm mt-1" style={{ color: colors.textMuted }}>Create your free account 💕</p>
      </div>

      <div className="space-y-4">
        <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <label className="text-sm font-medium mb-2 block" style={{ color: colors.textMuted }}>Your Name</label>
          <input type="text" placeholder="Enter your name..." className="w-full p-4 rounded-2xl border-2 focus:outline-none transition-all duration-200 focus:ring-4"
            style={{ borderColor: 'transparent', backgroundColor: colors.cardBg }}
            onFocus={(e) => e.target.style.borderColor = colors.primary}
            onBlur={(e) => e.target.style.borderColor = 'transparent'} />
        </div>
        <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <label className="text-sm font-medium mb-2 block" style={{ color: colors.textMuted }}>Email</label>
          <input type="email" placeholder="you@example.com" className="w-full p-4 rounded-2xl border-2 focus:outline-none transition-all duration-200"
            style={{ borderColor: 'transparent', backgroundColor: colors.cardBg }}
            onFocus={(e) => e.target.style.borderColor = colors.primary}
            onBlur={(e) => e.target.style.borderColor = 'transparent'} />
        </div>
      </div>

      <PButton onClick={() => navigate('theme')} className="w-full mt-8 py-4 rounded-2xl text-lg animate-slide-up" colors={colors} style={{ animationDelay: '0.3s' }}>
        Create Account 💖
      </PButton>
    </div>
    
    <style jsx>{`
      @keyframes pulse-soft { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
      .animate-pulse-soft { animation: pulse-soft 2s ease-in-out infinite; }
      @keyframes scale-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      .animate-scale-in { animation: scale-in 0.3s ease-out; }
      @keyframes slide-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      .animate-slide-up { animation: slide-up 0.4s ease-out forwards; opacity: 0; }
    `}</style>
  </div>
))
Auth.displayName = 'Auth'

// ═══════════════════════════════════════════════════════════════════════════
// THEME SELECT
// ═══════════════════════════════════════════════════════════════════════════

const ThemeSelect = memo(({ colors, theme, setTheme, navigate }: { colors: typeof THEMES[Theme]; theme: Theme; setTheme: (t: Theme) => void; navigate: (s: Screen) => void }) => (
  <div className="min-h-screen flex flex-col" style={{ background: colors.softGradient }}>
    <div className="sticky top-0 z-20 backdrop-blur-xl bg-white/70 border-b border-white/50">
      <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
        <button onClick={() => navigate('auth')} className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:shadow-lg transition-all active:scale-90"><span>←</span></button>
        <div className="text-center">
          <h2 className="font-bold text-lg" style={{ color: colors.primary }}>Choose Your Theme</h2>
          <p className="text-xs" style={{ color: colors.textMuted }}>Pick your aesthetic ✨</p>
        </div>
        <div className="w-10" />
      </div>
    </div>

    <div className="flex-1 px-6 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {(Object.keys(THEMES) as Theme[]).map((t, i) => (
            <div key={t} onClick={() => setTheme(t)}
              className={`relative rounded-3xl overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 animate-scale-in ${theme === t ? 'ring-4 ring-offset-2 scale-[1.02]' : ''}`}
              style={{ background: THEMES[t].gradient, aspectRatio: i % 3 === 0 ? '3/4' : '1/1', boxShadow: theme === t ? `0 20px 40px -15px ${THEMES[t].primary}50` : `0 10px 30px -15px ${THEMES[t].primary}30`, animationDelay: `${i * 0.05}s` }}>
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-white">
                <span className="text-4xl mb-2 drop-shadow-lg">{THEMES[t].emoji}</span>
                <h3 className="font-bold text-sm text-center drop-shadow-md">{THEMES[t].name}</h3>
              </div>
              {theme === t && <div className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg animate-scale-in"><span style={{ color: THEMES[t].primary }}>✓</span></div>}
            </div>
          ))}
        </div>
      </div>
    </div>

    <div className="sticky bottom-0 p-6 backdrop-blur-xl bg-white/70 border-t border-white/50">
      <div className="max-w-md mx-auto">
        <PButton onClick={() => navigate('age')} className="w-full py-4 rounded-2xl" colors={colors}>Continue with {THEMES[theme].name} 💕</PButton>
      </div>
    </div>
    
    <style jsx>{`
      @keyframes scale-in { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
      .animate-scale-in { animation: scale-in 0.3s ease-out forwards; opacity: 0; }
    `}</style>
  </div>
))
ThemeSelect.displayName = 'ThemeSelect'

// ═══════════════════════════════════════════════════════════════════════════
// AGE SELECT
// ═══════════════════════════════════════════════════════════════════════════

const AgeSelect = memo(({ colors, age, setAge, navigate }: { colors: typeof THEMES[Theme]; age: AgeGroup; setAge: (a: AgeGroup) => void; navigate: (s: Screen) => void }) => (
  <div className="min-h-screen flex flex-col" style={{ background: colors.softGradient }}>
    <div className="sticky top-0 z-20 backdrop-blur-xl bg-white/70 border-b border-white/50">
      <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
        <button onClick={() => navigate('theme')} className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:shadow-lg transition-all active:scale-90"><span>←</span></button>
        <div className="text-center">
          <h2 className="font-bold text-lg" style={{ color: colors.primary }}>Choose Your Version</h2>
          <p className="text-xs" style={{ color: colors.textMuted }}>Select your experience ✨</p>
        </div>
        <div className="w-10" />
      </div>
    </div>

    <div className="flex-1 px-6 py-8">
      <div className="max-w-2xl mx-auto grid gap-4">
        {(Object.keys(AGES) as AgeGroup[]).map((a, i) => (
          <div key={a} onClick={() => setAge(a)}
            className={`relative bg-white rounded-3xl p-6 cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 animate-slide-up ${age === a ? 'ring-4 scale-[1.02]' : ''}`}
            style={{ boxShadow: age === a ? `0 20px 40px -15px ${colors.primary}40, 0 0 0 2px ${colors.primary}` : `0 10px 30px -15px rgba(0,0,0,0.1)`, animationDelay: `${i * 0.1}s` }}>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 transition-transform duration-300 hover:scale-110" style={{ background: colors.cardBg }}>{AGES[a].icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-lg" style={{ color: colors.primary }}>{AGES[a].title}</h3>
                  <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ background: colors.cardBg, color: colors.textMuted }}>{AGES[a].vibe}</span>
                </div>
                <p className="text-sm opacity-70 mb-1">Ages {AGES[a].range}</p>
                <p className="text-sm" style={{ color: colors.textMuted }}>{AGES[a].desc}</p>
              </div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300" style={{ background: age === a ? colors.gradient : colors.cardBg }}>
                <span className={age === a ? 'text-white' : ''}>→</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className="sticky bottom-0 p-6 backdrop-blur-xl bg-white/70 border-t border-white/50">
      <div className="max-w-md mx-auto">
        <PButton onClick={() => navigate('avatar')} className="w-full py-4 rounded-2xl" colors={colors}>Continue 💕</PButton>
      </div>
    </div>
    
    <style jsx>{`
      @keyframes slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      .animate-slide-up { animation: slide-up 0.4s ease-out forwards; opacity: 0; }
    `}</style>
  </div>
))
AgeSelect.displayName = 'AgeSelect'

// ═══════════════════════════════════════════════════════════════════════════
// AVATAR SELECT
// ═══════════════════════════════════════════════════════════════════════════

const AvatarSelect = memo(({ colors, age, avatar, setAvatar, navigate }: { colors: typeof THEMES[Theme]; age: AgeGroup; avatar: AvatarType | null; setAvatar: (a: AvatarType) => void; navigate: (s: Screen) => void }) => (
  <div className="min-h-screen flex flex-col" style={{ background: colors.softGradient }}>
    <div className="sticky top-0 z-20 backdrop-blur-xl bg-white/70 border-b border-white/50">
      <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
        <button onClick={() => navigate('age')} className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:shadow-lg transition-all active:scale-90"><span>←</span></button>
        <div className="text-center">
          <h2 className="font-bold text-lg" style={{ color: colors.primary }}>Pick Your Companion</h2>
          <p className="text-xs" style={{ color: colors.textMuted }}>Choose your AI bestie ✨</p>
        </div>
        <div className="w-10" />
      </div>
    </div>

    <div className="flex-1 px-6 py-8">
      <div className="max-w-2xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-4">
        {AVATARS[age].map((a, i) => (
          <div key={a.id} onClick={() => setAvatar(a)}
            className={`relative rounded-3xl overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 animate-scale-in ${avatar?.id === a.id ? 'ring-4 scale-[1.03]' : ''}`}
            style={{ background: a.bg, boxShadow: avatar?.id === a.id ? `0 20px 40px -15px ${a.color}50, 0 0 0 2px ${colors.primary}` : `0 10px 30px -15px ${a.color}30`, animationDelay: `${i * 0.08}s` }}>
            <div className="p-6 text-center">
              <div className="w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center text-5xl shadow-lg transition-transform duration-300 hover:scale-110" style={{ background: 'white' }}>{a.emoji}</div>
              <h3 className="font-bold text-lg mb-1" style={{ color: colors.primary }}>{a.name}</h3>
              <p className="text-sm opacity-70" style={{ color: colors.textMuted }}>{a.personality}</p>
            </div>
            {avatar?.id === a.id && <div className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center shadow-lg animate-scale-in" style={{ background: colors.gradient }}><span className="text-white text-sm">✓</span></div>}
          </div>
        ))}
      </div>
    </div>

    <div className="sticky bottom-0 p-6 backdrop-blur-xl bg-white/70 border-t border-white/50">
      <div className="max-w-md mx-auto">
        <PButton onClick={() => avatar && navigate('name')} disabled={!avatar} className="w-full py-4 rounded-2xl" colors={colors}>{avatar ? `Choose ${avatar.name} 💕` : 'Select a companion'}</PButton>
      </div>
    </div>
    
    <style jsx>{`
      @keyframes scale-in { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
      .animate-scale-in { animation: scale-in 0.3s ease-out forwards; opacity: 0; }
    `}</style>
  </div>
))
AvatarSelect.displayName = 'AvatarSelect'

// ═══════════════════════════════════════════════════════════════════════════
// NAME COMPANION
// ═══════════════════════════════════════════════════════════════════════════

const NameCompanion = memo(({ colors, avatar, companionName, setCompanionName, memory, setMemory, navigate }: { 
  colors: typeof THEMES[Theme]; avatar: AvatarType | null; companionName: string; setCompanionName: (n: string) => void; memory: boolean; setMemory: (m: boolean) => void; navigate: (s: Screen) => void 
}) => (
  <div className="min-h-screen flex flex-col" style={{ background: colors.softGradient }}>
    <div className="sticky top-0 z-20 backdrop-blur-xl bg-white/70 border-b border-white/50">
      <div className="max-w-md mx-auto px-6 py-4 flex items-center justify-between">
        <button onClick={() => navigate('avatar')} className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:shadow-lg transition-all active:scale-90"><span>←</span></button>
        <div className="text-center">
          <h2 className="font-bold text-lg" style={{ color: colors.primary }}>Name Your Friend</h2>
          <p className="text-xs" style={{ color: colors.textMuted }}>Give them a special name ✨</p>
        </div>
        <div className="w-10" />
      </div>
    </div>

    <div className="flex-1 px-6 py-8 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl p-8 shadow-2xl animate-scale-in" style={{ boxShadow: `0 25px 50px -12px ${colors.primary}20` }}>
          <div className="text-center mb-8">
            <div className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-5xl shadow-xl animate-float-slow" style={{ background: avatar?.bg }}>{avatar?.emoji}</div>
            <p className="text-sm" style={{ color: colors.textMuted }}>Default: <span className="font-bold" style={{ color: colors.primary }}>{avatar?.name}</span></p>
          </div>

          <input type="text" placeholder={avatar?.name} value={companionName} onChange={e => setCompanionName(e.target.value)}
            className="w-full text-center text-xl p-4 rounded-2xl border-2 focus:outline-none transition-all font-medium"
            style={{ borderColor: companionName ? colors.primary : 'transparent', backgroundColor: colors.cardBg, color: colors.primary }} />

          <div className="mt-6 p-4 rounded-2xl flex items-center justify-between transition-all duration-200 hover:scale-[1.02]" style={{ background: colors.cardBg }}>
            <div>
              <p className="font-semibold" style={{ color: colors.primary }}>🧠 Memory Mode</p>
              <p className="text-xs opacity-70">AI remembers conversations</p>
            </div>
            <button onClick={() => setMemory(!memory)} className={`w-14 h-8 rounded-full transition-all duration-300 ${memory ? '' : 'bg-gray-200'}`} style={memory ? { background: colors.gradient } : {}}>
              <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${memory ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>
      </div>
    </div>

    <div className="sticky bottom-0 p-6 backdrop-blur-xl bg-white/70 border-t border-white/50">
      <div className="max-w-md mx-auto">
        <PButton onClick={() => navigate('chat')} className="w-full py-4 rounded-2xl" colors={colors}>Let's Chat! 💖</PButton>
      </div>
    </div>
    
    <style jsx>{`
      @keyframes scale-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      .animate-scale-in { animation: scale-in 0.3s ease-out; }
      @keyframes float-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
      .animate-float-slow { animation: float-slow 3s ease-in-out infinite; }
    `}</style>
  </div>
))
NameCompanion.displayName = 'NameCompanion'

// ═══════════════════════════════════════════════════════════════════════════
// PRICING
// ═══════════════════════════════════════════════════════════════════════════

const Pricing = memo(({ colors, navigate }: { colors: typeof THEMES[Theme]; navigate: (s: Screen) => void }) => (
  <div className="min-h-screen flex flex-col" style={{ background: colors.softGradient }}>
    <div className="sticky top-0 z-20 backdrop-blur-xl bg-white/70 border-b border-white/50">
      <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
        <button onClick={() => navigate('landing')} className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:shadow-lg transition-all active:scale-90"><span>←</span></button>
        <div className="text-center">
          <h2 className="font-bold text-lg" style={{ color: colors.primary }}>Choose Your Plan</h2>
          <p className="text-xs" style={{ color: colors.textMuted }}>Unlock the full experience ✨</p>
        </div>
        <div className="w-10" />
      </div>
    </div>

    <div className="flex-1 px-6 py-8">
      <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6">
        {(Object.keys(PRICING) as Tier[]).map((t, i) => (
          <div key={t} className={`relative bg-white rounded-3xl p-6 transform transition-all duration-300 hover:scale-[1.02] hover:-translate-y-2 animate-scale-in ${i === 1 ? 'ring-4 md:scale-105' : i === 2 ? 'ring-2' : ''}`}
            style={{ boxShadow: i === 1 ? `0 30px 60px -15px ${colors.primary}40` : `0 20px 40px -15px rgba(0,0,0,0.1)`, animationDelay: `${i * 0.1}s` }}>
            {i === 1 && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-white text-sm font-bold whitespace-nowrap" style={{ background: colors.gradient }}>Most Popular ✨</div>}
            {i === 2 && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-white text-sm font-bold whitespace-nowrap bg-gradient-to-r from-amber-400 to-orange-500">Best Value 🌟</div>}

            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center text-2xl animate-pulse-soft" style={{ background: colors.cardBg }}>{PRICING[t].icon}</div>

            <div className="text-center mb-4">
              <h3 className="text-xl font-bold mb-1" style={{ color: colors.primary }}>{PRICING[t].name}</h3>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-3xl font-bold">${PRICING[t].price}</span>
                {PRICING[t].price > 0 && <span className="text-sm opacity-50">/mo</span>}
              </div>
            </div>

            <ul className="space-y-3 mb-6">
              {PRICING[t].features.map((f, j) => (
                <li key={j} className="flex items-center gap-3 text-sm animate-slide-up" style={{ animationDelay: `${(i * 0.05) + (j * 0.05)}s` }}>
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs text-white flex-shrink-0" style={{ background: colors.primary }}>✓</span>
                  <span style={{ color: colors.textMuted }}>{f}</span>
                </li>
              ))}
            </ul>

            <button onClick={() => { if (t !== 'FREE') alert(`✨ ${PRICING[t].name} unlocked for testing! 💕`); navigate('auth') }}
              className="w-full py-3 rounded-2xl font-semibold transition-all duration-200 active:scale-95"
              style={{ background: i === 0 ? '#f1f5f9' : colors.gradient, color: i === 0 ? colors.textMuted : 'white', boxShadow: i === 0 ? 'none' : `0 10px 30px -10px ${colors.primary}50` }}>
              {t === 'FREE' ? 'Get Started Free' : `Get ${PRICING[t].name} 💕`}
            </button>
          </div>
        ))}
      </div>
    </div>
    
    <style jsx>{`
      @keyframes scale-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      .animate-scale-in { animation: scale-in 0.4s ease-out forwards; opacity: 0; }
      @keyframes slide-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      .animate-slide-up { animation: slide-up 0.3s ease-out forwards; opacity: 0; }
      @keyframes pulse-soft { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
      .animate-pulse-soft { animation: pulse-soft 2s ease-in-out infinite; }
    `}</style>
  </div>
))
Pricing.displayName = 'Pricing'

// ═══════════════════════════════════════════════════════════════════════════
// CHAT COMPONENT - Memoized to prevent re-renders
// ═══════════════════════════════════════════════════════════════════════════

const Chat = memo(({ 
  colors, avatar, companionName, memory, messages, input, setInput, loading, sendMessage,
  showStickers, setShowStickers, showMood, setShowMood, moodNotes, setMoodNotes, logMood,
  isRecording, recordingTime, toggleVoice, handlePhoto, startCall, inCall, endCall,
  callMessages, callLoading, isSpeaking, toggleCallVoice, showConfetti
}: {
  colors: typeof THEMES[Theme]
  avatar: AvatarType | null
  companionName: string
  memory: boolean
  messages: Message[]
  input: string
  setInput: (s: string) => void
  loading: boolean
  sendMessage: () => void
  showStickers: boolean
  setShowStickers: (s: boolean) => void
  showMood: boolean
  setShowMood: (s: boolean) => void
  moodNotes: string
  setMoodNotes: (s: string) => void
  logMood: (m: number) => void
  isRecording: boolean
  recordingTime: number
  toggleVoice: () => void
  handlePhoto: (e: React.ChangeEvent<HTMLInputElement>) => void
  startCall: () => void
  inCall: boolean
  endCall: () => void
  callMessages: CallMessage[]
  callLoading: boolean
  isSpeaking: boolean
  toggleCallVoice: () => void
  showConfetti: boolean
}) => {
  const messagesEnd = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="min-h-screen flex flex-col" style={{ background: colors.softGradient }}>
      <Confetti active={showConfetti} />
      
      {/* Header */}
      <div className="sticky top-0 z-20 backdrop-blur-xl bg-white/80 border-b border-white/50">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-lg animate-pulse-soft" style={{ background: avatar?.bg }}>{avatar?.emoji}</div>
          <div className="flex-1">
            <h3 className="font-bold" style={{ color: colors.primary }}>{companionName || avatar?.name}</h3>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" /><span className="text-green-600">Online</span></span>
              {memory && <span style={{ color: colors.textMuted }}>• 🧠 Memory</span>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={startCall} className="w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all hover:scale-110 active:scale-90" style={{ background: colors.cardBg }}>📞</button>
            <button onClick={() => setShowMood(true)} className="w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all hover:scale-110 active:scale-90" style={{ background: colors.cardBg }}>📊</button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 scroll-smooth">
        <div className="max-w-2xl mx-auto space-y-3">
          {messages.map((m, i) => (
            <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'} animate-message-in`} style={{ animationDelay: `${i * 0.05}s` }}>
              <div className={`max-w-[85%] md:max-w-[70%] p-4 rounded-3xl transition-transform duration-200 active:scale-[0.98] ${m.sender === 'user' ? 'rounded-br-lg text-white' : 'rounded-bl-lg bg-white'}`}
                style={{ background: m.sender === 'user' ? colors.gradient : 'white', boxShadow: `0 4px 15px -5px ${m.sender === 'user' ? colors.primary : 'rgba(0,0,0,0.1)'}` }}>
                {m.stickers && <div className="flex gap-1 mb-2">{m.stickers.map((s, i) => <span key={i} className="text-xl">{s}</span>)}</div>}
                <p className="leading-relaxed" style={{ color: m.sender === 'user' ? 'white' : '#1f2937' }}>{m.text}</p>
                <p className={`text-xs mt-2 ${m.sender === 'user' ? 'opacity-70' : 'opacity-50'}`}>{m.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start animate-fade-in">
              <div className="bg-white p-4 rounded-3xl rounded-bl-lg shadow-lg">
                <div className="flex gap-1.5">
                  {[0, 150, 300].map((d, i) => <div key={i} className="w-2.5 h-2.5 rounded-full animate-bounce" style={{ background: colors.primary, animationDelay: `${d}ms` }} />)}
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEnd} />
        </div>
      </div>

      {/* Stickers */}
      {showStickers && (
        <div className="backdrop-blur-xl bg-white/90 border-t border-white/50 p-4 animate-slide-up">
          <div className="max-w-2xl mx-auto">
            <div className="flex flex-wrap gap-2">
              {STICKERS.map(s => (
                <button key={s} onClick={() => { setInput(p => p + ' ' + s); inputRef.current?.focus() }} className="text-3xl p-2 rounded-xl hover:bg-gray-100 transition-all hover:scale-125 active:scale-90">{s}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mood Modal */}
      {showMood && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-scale-in" style={{ boxShadow: `0 25px 50px -12px ${colors.primary}30` }}>
            <h3 className="text-xl font-bold text-center mb-6" style={{ color: colors.primary }}>📊 How are you feeling?</h3>
            <div className="flex justify-center gap-2 mb-6">
              {['😔', '😕', '😐', '🙂', '😊', '😄'].map((e, i) => (
                <button key={i} onClick={() => logMood(i)} className="text-4xl p-2 rounded-2xl hover:bg-gray-100 transition-all hover:scale-125 active:scale-90">{e}</button>
              ))}
            </div>
            <input placeholder="Add a note... (optional)" value={moodNotes} onChange={e => setMoodNotes(e.target.value)} className="w-full p-4 rounded-2xl border-2 mb-4 focus:outline-none transition-all" style={{ borderColor: colors.secondary, backgroundColor: colors.cardBg }} />
            <button onClick={() => setShowMood(false)} className="w-full py-3 rounded-2xl font-medium transition-all active:scale-95" style={{ background: colors.cardBg, color: colors.textMuted }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Voice Call Modal */}
      {inCall && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center animate-scale-in" style={{ boxShadow: `0 25px 50px -12px ${colors.primary}40` }}>
            <div className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-5xl shadow-xl animate-pulse-soft" style={{ background: avatar?.bg }}>{avatar?.emoji}</div>
            <h3 className="text-2xl font-bold mb-1" style={{ color: colors.primary }}>{companionName || avatar?.name}</h3>
            <p className="text-sm mb-4 opacity-70">{isSpeaking ? '🔊 Speaking...' : callLoading ? '💭 Thinking...' : isRecording ? '🎤 Listening...' : '📞 Tap mic to talk'}</p>
            
            <div className="max-h-28 overflow-y-auto mb-4 space-y-2 text-left">
              {callMessages.map((m, i) => (
                <div key={i} className={`p-3 rounded-2xl text-sm animate-fade-in ${m.role === 'user' ? 'bg-pink-50 ml-6 rounded-br-sm' : 'bg-gray-100 mr-6 rounded-bl-sm'}`} style={{ animationDelay: `${i * 0.1}s` }}>
                  <span className="font-medium opacity-70">{m.role === 'user' ? 'You: ' : `${companionName || avatar?.name}: `}</span>{m.text}
                </div>
              ))}
            </div>
            
            {isRecording && <div className="mb-4 flex items-center justify-center gap-2"><div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" /><span className="text-red-500 font-medium">{recordingTime}s / 30s</span></div>}
            
            <button onClick={toggleCallVoice} disabled={callLoading || isSpeaking} className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl shadow-xl transition-all active:scale-90 ${isRecording ? 'animate-pulse' : ''}`}
              style={{ background: isRecording ? '#ef4444' : colors.gradient, boxShadow: `0 15px 35px -10px ${isRecording ? '#ef4444' : colors.primary}60` }}>
              <span className="text-white">{isRecording ? '⏹️' : '🎤'}</span>
            </button>
            
            <p className="text-xs opacity-50 mb-4">💡 Speak, then AI responds with voice!</p>
            <button onClick={endCall} className="w-full py-3 rounded-2xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-all active:scale-95">End Call</button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="sticky bottom-0 backdrop-blur-xl bg-white/80 border-t border-white/50 p-4">
        <div className="max-w-2xl mx-auto flex gap-2 items-center">
          <button onClick={() => setShowStickers(s => !s)} className="w-11 h-11 rounded-full flex items-center justify-center text-xl transition-all hover:scale-110 active:scale-90" style={{ background: showStickers ? colors.gradient : colors.cardBg }}>{showStickers ? '🙈' : '😊'}</button>
          <button onClick={toggleVoice} className={`w-11 h-11 rounded-full flex items-center justify-center text-xl transition-all hover:scale-110 active:scale-90 relative ${isRecording ? 'animate-pulse' : ''}`} style={{ background: isRecording ? colors.primary : colors.cardBg }}>
            {isRecording ? '⏹️' : '🎤'}
            {isRecording && <span className="absolute -top-1 -right-1 text-xs bg-red-500 text-white rounded-full px-1.5 py-0.5">{recordingTime}s</span>}
          </button>
          <input ref={fileInput} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
          <button onClick={() => fileInput.current?.click()} className="w-11 h-11 rounded-full flex items-center justify-center text-xl transition-all hover:scale-110 active:scale-90" style={{ background: colors.cardBg }}>📸</button>
          
          <input ref={inputRef} type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} placeholder="Type a message..." disabled={loading}
            className="flex-1 p-3 px-5 rounded-full border-2 focus:outline-none transition-all" style={{ borderColor: colors.secondary, backgroundColor: 'white' }} />
          
          <button onClick={sendMessage} disabled={!input.trim() || loading} className="w-11 h-11 rounded-full flex items-center justify-center text-xl transition-all hover:scale-110 active:scale-90 disabled:opacity-50" style={{ background: colors.gradient, boxShadow: `0 4px 15px -5px ${colors.primary}50` }}>💕</button>
        </div>
      </div>

      <style jsx>{`
        @keyframes message-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-message-in { animation: message-in 0.3s ease-out forwards; opacity: 0; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; opacity: 0; }
        @keyframes scale-in { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        .animate-scale-in { animation: scale-in 0.3s ease-out; }
        @keyframes slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
        @keyframes pulse-soft { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        .animate-pulse-soft { animation: pulse-soft 2s ease-in-out infinite; }
      `}</style>
    </div>
  )
})
Chat.displayName = 'Chat'

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function KawaiiAI() {
  // State
  const [screen, setScreen] = useState<Screen>('landing')
  const [theme, setTheme] = useState<Theme>('pink')
  const [age, setAge] = useState<AgeGroup>('junior')
  const [avatar, setAvatar] = useState<AvatarType | null>(null)
  const [companionName, setCompanionName] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [memory, setMemory] = useState(false)
  const [showStickers, setShowStickers] = useState(false)
  const [showMood, setShowMood] = useState(false)
  const [moodNotes, setMoodNotes] = useState('')
  const [showConfetti, setShowConfetti] = useState(false)
  
  // Voice state
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [inCall, setInCall] = useState(false)
  const [callMessages, setCallMessages] = useState<CallMessage[]>([])
  const [callLoading, setCallLoading] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  
  // Refs
  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const audioChunks = useRef<Blob[]>([])
  const callChunks = useRef<Blob[]>([])
  const callHistory = useRef<CallMessage[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  
  const colors = THEMES[theme]

  // Custom scrollbar
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      ::-webkit-scrollbar { width: 6px; height: 6px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: ${colors.primary}40; border-radius: 10px; }
      ::-webkit-scrollbar-thumb:hover { background: ${colors.primary}60; }
      * { scrollbar-width: thin; scrollbar-color: ${colors.primary}40 transparent; }
    `
    document.head.appendChild(style)
    return () => { document.head.removeChild(style) }
  }, [colors])

  // Welcome message with confetti
  useEffect(() => {
    if (screen === 'chat' && messages.length === 0 && avatar) {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3500)
      
      const greetings: Record<AgeGroup, string> = {
        junior: `Hi there! 🌸 I'm ${companionName || avatar.name}! I'm so happy to be your friend! What shall we do today? 💕`,
        teen: `Hey bestie! ✨ I'm ${companionName || avatar.name} and I'm literally SO excited to chat with you! What's up? 💜`,
        'young-adult': `Hi! 💫 I'm ${companionName || avatar.name}. I'm here for you - whether you want to vent, get advice, or just chat. 🌹`,
        plus: `Hello! 🌿 I'm ${companionName || avatar.name}. I'm here to support you. How has your day been?`,
      }
      setMessages([{ id: 1, text: greetings[age], sender: 'ai', time: new Date(), stickers: ['💕', '✨'] }])
    }
  }, [screen, avatar, companionName, age, messages.length])

  const getStickers = useCallback(() => {
    const count = Math.floor(Math.random() * 2) + 1
    return Array.from({ length: count }, () => STICKERS[Math.floor(Math.random() * STICKERS.length)])
  }, [])

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
      setMessages(p => [...p, { id: Date.now() + 1, text: "Oops! Something went wrong. Let's try again! 💕", sender: 'ai', time: new Date(), stickers: ['💕'] }])
    } finally {
      setLoading(false)
    }
  }, [input, loading, messages, age, companionName, avatar, getStickers])

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
          if (blob.size < 500) { return }
          
          setInput('🎵 Transcribing...')
          try {
            const fd = new FormData()
            fd.append('audio', blob, 'recording.webm')
            const res = await fetch('/api/asr', { method: 'POST', body: fd })
            const data = await res.json()
            setInput(data.transcription || '')
          } catch { setInput(''); alert('Transcription failed! Try again 🎤') }
        }
        
        rec.start()
        setIsRecording(true)
        timerRef.current = setInterval(() => setRecordingTime(t => t >= 60 ? 0 : t + 1), 1000)
      } catch { alert('Please allow microphone access! 🎤') }
    }
  }, [isRecording])

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
          } catch {
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

  const handlePhoto = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setMessages(p => [...p, { id: Date.now(), text: '📸 Shared a photo', sender: 'user', time: new Date() }])
    setTimeout(() => setMessages(p => [...p, { id: Date.now() + 1, text: "What a lovely photo! 💕", sender: 'ai', time: new Date(), stickers: ['📸', '💖'] }]), 1000)
  }, [])

  const navigate = useCallback((newScreen: Screen) => setScreen(newScreen), [])

  return (
    <main className="font-sans antialiased">
      {screen === 'landing' && <Landing colors={colors} theme={theme} navigate={navigate} />}
      {screen === 'auth' && <Auth colors={colors} navigate={navigate} />}
      {screen === 'theme' && <ThemeSelect colors={colors} theme={theme} setTheme={setTheme} navigate={navigate} />}
      {screen === 'age' && <AgeSelect colors={colors} age={age} setAge={setAge} navigate={navigate} />}
      {screen === 'avatar' && <AvatarSelect colors={colors} age={age} avatar={avatar} setAvatar={setAvatar} navigate={navigate} />}
      {screen === 'name' && <NameCompanion colors={colors} avatar={avatar} companionName={companionName} setCompanionName={setCompanionName} memory={memory} setMemory={setMemory} navigate={navigate} />}
      {screen === 'pricing' && <Pricing colors={colors} navigate={navigate} />}
      {screen === 'chat' && (
        <Chat 
          colors={colors} avatar={avatar} companionName={companionName} memory={memory}
          messages={messages} input={input} setInput={setInput} loading={loading}
          sendMessage={sendMessage} showStickers={showStickers} setShowStickers={setShowStickers}
          showMood={showMood} setShowMood={setShowMood} moodNotes={moodNotes} setMoodNotes={setMoodNotes}
          logMood={logMood} isRecording={isRecording} recordingTime={recordingTime}
          toggleVoice={toggleVoice} handlePhoto={handlePhoto} startCall={startCall}
          inCall={inCall} endCall={endCall} callMessages={callMessages} callLoading={callLoading}
          isSpeaking={isSpeaking} toggleCallVoice={toggleCallVoice} showConfetti={showConfetti}
        />
      )}
    </main>
  )
}
