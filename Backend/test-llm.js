const Groq = require('groq-sdk');
require('dotenv').config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function test() {
  console.log('🔍 Test de connexion Groq...');
  try {
    const completion = await groq.chat.completions.create({
      messages: [{ 
        role: 'user', 
        content: 'Dis juste "OK" en un mot.' 
      }],
      model: 'llama-3.3-70b-versatile',
      max_tokens: 10,
    });
    console.log('✅ Groq fonctionne !');
    console.log('Réponse :', completion.choices[0]?.message?.content);
  } catch (err) {
    console.error('❌ Erreur Groq :', err.message);
  }
}

test();