import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Sidebar } from './Dashboard';
import { useEco } from '../EcoContext';

function ChatIA() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '👋 Bonjour ! Je suis **VeloBot**, votre assistant spécialisé en réparation et entretien de vélos. Posez-moi n\'importe quelle question sur le vélo !'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };
  const { ecoMode } = useEco();

  // Scroll automatique vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/api/llm/chat', {
        messages: newMessages.filter(m => m.role !== 'assistant' || messages.indexOf(m) > 0)
          .map(m => ({ role: m.role, content: m.content }))
      }, { headers });

      setMessages([...newMessages, {
        role: 'assistant',
        content: res.data.response
      }]);
    } catch (err) {
      setMessages([...newMessages, {
        role: 'assistant',
        content: '⚠️ Service temporairement indisponible. Réessayez dans un moment.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([{
      role: 'assistant',
      content: '👋 Bonjour ! Je suis **VeloBot**, votre assistant spécialisé en réparation et entretien de vélos. Posez-moi n\'importe quelle question sur le vélo !'
    }]);
  };

  const formatMessage = (content) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>');
  };

  // Questions suggérées
  const suggestions = [
    'Comment régler un dérailleur arrière ?',
    'Quand changer sa chaîne de vélo ?',
    'Comment purger des freins hydrauliques ?',
    'Différence entre Shimano 105 et Ultegra ?',
    'Comment réparer une crevaison tubeless ?',
    'Quelle pression pour mes pneus VTT ?'
  ];

  return (
   <div className={`layout ${ecoMode ? 'eco-mode' : ''}`}>
      <Sidebar />
      <div className="main-content" style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: '0' }}>
        
          {ecoMode && (
          <div className="eco-banner">
            🌱 MODE ÉCO ACTIVÉ — Interface simplifiée pour réduire la consommation énergétique
          </div>
        )}

        {/* Header */}
        <div style={{
          padding: '20px 30px',
          borderBottom: '1px solid #eee',
          background: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: '700' }}>🤖 VeloBot — Assistant IA</h1>
            <p style={{ fontSize: '13px', color: '#888', marginTop: '2px' }}>
              Posez vos questions sur la réparation et l'entretien des vélos
            </p>
          </div>
          <button
            className="btn btn-sm"
            style={{ background: '#f0f0f0', color: '#555' }}
            onClick={clearChat}
          >
            🗑️ Nouvelle conversation
          </button>
        </div>

        {/* Zone messages */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px 30px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>

          {/* Suggestions si début de conversation */}
          {messages.length === 1 && (
            <div style={{ marginBottom: '8px' }}>
              <p style={{ fontSize: '13px', color: '#888', marginBottom: '10px' }}>
                💡 Questions fréquentes :
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => { setInput(s); }}
                    style={{
                      background: 'white',
                      border: '1px solid #ddd',
                      borderRadius: '20px',
                      padding: '6px 14px',
                      fontSize: '13px',
                      cursor: 'pointer',
                      color: '#333',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => e.target.style.background = '#f0f0f0'}
                    onMouseLeave={e => e.target.style.background = 'white'}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                gap: '10px',
                alignItems: 'flex-start'
              }}
            >
              {/* Avatar assistant */}
              {msg.role === 'assistant' && (
                <div style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: '#111',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  flexShrink: 0
                }}>
                  🤖
                </div>
              )}

              {/* Bulle message */}
              <div style={{
                maxWidth: '70%',
                padding: '12px 16px',
                borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                background: msg.role === 'user' ? '#111' : 'white',
                color: msg.role === 'user' ? 'white' : '#333',
                fontSize: '14px',
                lineHeight: '1.6',
                border: msg.role === 'assistant' ? '1px solid #eee' : 'none',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
              }}
                dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
              />

              {/* Avatar user */}
              {msg.role === 'user' && (
                <div style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: '#4fc3f7',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  flexShrink: 0
                }}>
                  👤
                </div>
              )}
            </div>
          ))}

          {/* Indicateur de chargement */}
          {loading && (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div style={{
                width: '34px', height: '34px', borderRadius: '50%',
                background: '#111', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                🤖
              </div>
              <div style={{
                background: 'white',
                border: '1px solid #eee',
                borderRadius: '18px 18px 18px 4px',
                padding: '12px 16px',
                display: 'flex',
                gap: '4px',
                alignItems: 'center'
              }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: '8px', height: '8px',
                    borderRadius: '50%',
                    background: '#aaa',
                    animation: `bounce 1s infinite ${i * 0.2}s`
                  }} />
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Zone saisie */}
        <div style={{
          padding: '16px 30px',
          background: 'white',
          borderTop: '1px solid #eee'
        }}>
          <div style={{
            display: 'flex',
            gap: '10px',
            alignItems: 'flex-end',
            background: '#f5f5f5',
            borderRadius: '12px',
            padding: '10px 14px',
            border: '1px solid #eee'
          }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Posez votre question sur le vélo... (Entrée pour envoyer)"
              rows={1}
              style={{
                flex: 1,
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: '14px',
                resize: 'none',
                fontFamily: 'inherit',
                lineHeight: '1.5'
              }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              style={{
                background: input.trim() && !loading ? '#111' : '#ddd',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'background 0.2s',
                whiteSpace: 'nowrap'
              }}
            >
              Envoyer ↗
            </button>
          </div>
          <p style={{ fontSize: '11px', color: '#aaa', marginTop: '6px', textAlign: 'center' }}>
            VeloBot répond uniquement aux questions liées au vélo
          </p>
        </div>

        {/* Animation CSS */}
        <style>{`
          @keyframes bounce {
            0%, 60%, 100% { transform: translateY(0); }
            30% { transform: translateY(-6px); }
          }
        `}</style>

      </div>
    </div>
  );
}

export default ChatIA;