const Groq = require('groq-sdk');
require('dotenv').config();

const LLM_MODE = process.env.LLM_MODE || 'groq';
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

// ============ OLLAMA ============
const callOllama = async (messages, systemPrompt = '') => {
  const allMessages = [];
  
  if (systemPrompt) {
    allMessages.push({ role: 'system', content: systemPrompt });
  }
  allMessages.push(...messages);

  const response = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama3.2:1b',
      messages: allMessages,
      stream: false
    })
  });

  if (!response.ok) {
    throw new Error(`Ollama error: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    content: data.message?.content || '',
    tokens: data.eval_count || 0
  };
};

// ============ GROQ ============
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const callGroq = async (messages, systemPrompt = '') => {
  const allMessages = [];

  if (systemPrompt) {
    allMessages.push({ role: 'system', content: systemPrompt });
  }
  allMessages.push(...messages);

  const completion = await groq.chat.completions.create({
    messages: allMessages,
    model: 'llama-3.3-70b-versatile',
    temperature: 0.5,
    max_tokens: 1000,
  });

  return {
    content: completion.choices[0]?.message?.content || '',
    tokens: completion.usage?.total_tokens || 0
  };
};

// ============ FONCTION PRINCIPALE ============
const callLLM = async (messages, systemPrompt = '') => {
  console.log(`🤖 Mode LLM : ${LLM_MODE}`);

  if (LLM_MODE === 'ollama') {
    try {
      return await callOllama(messages, systemPrompt);
    } catch (err) {
      console.error('❌ Ollama indisponible, fallback vers Groq:', err.message);
      return await callGroq(messages, systemPrompt);
    }
  } else {
    return await callGroq(messages, systemPrompt);
  }
};

module.exports = { callLLM };