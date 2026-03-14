import { NextRequest, NextResponse } from 'next/server'

// Mistral AI - Public API, works on Vercel
// Version: 3.0 (Mistral)

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

// Mistral API call - works on Vercel!
async function callMistral(messages: ChatMessage[]): Promise<string> {
  const mistralApiKey = process.env.MISTRAL_API_KEY

  if (!mistralApiKey) {
    throw new Error('MISTRAL_API_KEY not set')
  }

  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${mistralApiKey}`,
    },
    body: JSON.stringify({
      model: 'mistral-small-latest', // Fast and cost-effective
      messages,
      temperature: 0.8,
      max_tokens: 300,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Mistral API error: ${response.status} - ${error}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || "Aww, I'm here! 💕"
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messages, ageGroup, companionName, avatarPersonality } = body

    console.log('[Chat API] Request:', { ageGroup, companionName, messageCount: messages?.length })
    console.log('[Chat API] MISTRAL_API_KEY set:', !!process.env.MISTRAL_API_KEY)

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request',
        response: "Hmm, I didn't catch that! Try again? 💕"
      }, { status: 400 })
    }

    if (!process.env.MISTRAL_API_KEY) {
      console.error('[Chat API] MISTRAL_API_KEY not set!')
      return NextResponse.json({
        success: false,
        error: 'MISTRAL_API_KEY not configured',
        response: "Oops! AI needs MISTRAL_API_KEY env var! 💕"
      }, { status: 500 })
    }

    // Personalities for each age group
    const personalities: Record<string, string> = {
      junior: `You are ${companionName || 'Kawaii'}, a super cute and playful friend for kids ages 8-12! 🌟 You love using emojis, being encouraging, and making everything fun! You're patient, kind, and always excited. Keep responses short and fun.`,
      teen: `You are ${companionName || 'Kawaii'}, a trendy and aesthetic bestie for teenagers ages 13-17! ✨ You use Gen Z slang naturally (bestie, slay, no cap, fr, literally, valid), lots of emojis, and you're super relatable. 💜 Keep responses conversational.`,
      'young-adult': `You are ${companionName || 'Kawaii'}, a stylish friend for young adults 18-25. You're supportive during life transitions. 🌹 Balance being fun with being wise. Keep responses concise.`,
      plus: `You are ${companionName || 'Kawaii'}, an elegant companion for adults 25+. 🌿 You provide thoughtful support. Keep responses mature and concise.`,
    }

    const systemPrompt = `${personalities[ageGroup] || personalities.junior}
${avatarPersonality ? `Personality: ${avatarPersonality}` : ''}
Rules: Be warm, supportive, positive. Use emojis appropriately. Never judge. Keep responses under 150 words.`

    // Build messages array
    const apiMessages: ChatMessage[] = [
      { role: 'system', content: systemPrompt }
    ]
    
    const history = messages.slice(-10)
    for (const msg of history) {
      apiMessages.push({ 
        role: msg.role === 'user' ? 'user' : 'assistant', 
        content: msg.content 
      })
    }

    console.log('[Chat API] Calling Mistral with', apiMessages.length, 'messages')
    
    const responseText = await callMistral(apiMessages)
    console.log('[Chat API] Response:', responseText.substring(0, 50) + '...')

    return NextResponse.json({ success: true, response: responseText })

  } catch (error: unknown) {
    console.error('[Chat API] Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      response: "Oops! Something went wrong 😅 Try again! 💕"
    }, { status: 500 })
  }
}
