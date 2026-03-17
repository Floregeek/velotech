import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function ClientLogin() {
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    nom: '', prenom: '', email: '', telephone: '',
    username: '', password: '',
    numero_cadre: '', marque: '', modele: '', type_velo: '', annee: ''
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('http://localhost:5000/api/clients/login', loginForm);
      localStorage.setItem('client_token', res.data.token);
      localStorage.setItem('client', JSON.stringify(res.data.client));
      navigate('/client/dashboard');
    } catch (err) {
      setError('Identifiants incorrects.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post('http://localhost:5000/api/clients/register', registerForm);
      setIsRegister(false);
      setError('');
      alert('✅ Compte créé ! Connectez-vous.');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création du compte.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box" style={{ width: isRegister ? '500px' : '380px' }}>
        <h1>🚲 VeloTech</h1>
        <p>{isRegister ? 'Créer un compte client' : 'Espace client'}</p>

        {error && <div className="error-msg">{error}</div>}

        {!isRegister ? (
          // Formulaire connexion
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Nom d'utilisateur</label>
              <input
                placeholder="jean.dupont"
                value={loginForm.username}
                onChange={e => setLoginForm({ ...loginForm, username: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Mot de passe</label>
              <input
                type="password"
                placeholder="••••••••"
                value={loginForm.password}
                onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                required
              />
            </div>
            <button className="login-btn" type="submit" disabled={loading}>
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
            <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: '#888' }}>
              Pas encore de compte ?{' '}
              <span
                style={{ color: '#111', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }}
                onClick={() => setIsRegister(true)}
              >
                Déposer mon vélo
              </span>
            </p>
          </form>
        ) : (
          // Formulaire inscription + dépôt vélo
          <form onSubmit={handleRegister}>
            <p style={{ fontWeight: '600', fontSize: '13px', color: '#555', marginBottom: '10px' }}>
              👤 Vos informations
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-group">
                <label>Nom</label>
                <input
                  placeholder="Dupont"
                  value={registerForm.nom}
                  onChange={e => setRegisterForm({ ...registerForm, nom: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Prénom</label>
                <input
                  placeholder="Jean"
                  value={registerForm.prenom}
                  onChange={e => setRegisterForm({ ...registerForm, prenom: e.target.value })}
                  required
                />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="jean@mail.com"
                  value={registerForm.email}
                  onChange={e => setRegisterForm({ ...registerForm, email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Téléphone</label>
                <input
                  placeholder="0612345678"
                  value={registerForm.telephone}
                  onChange={e => setRegisterForm({ ...registerForm, telephone: e.target.value })}
                />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-group">
                <label>Nom d'utilisateur</label>
                <input
                  placeholder="jean.dupont"
                  value={registerForm.username}
                  onChange={e => setRegisterForm({ ...registerForm, username: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Mot de passe</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={registerForm.password}
                  onChange={e => setRegisterForm({ ...registerForm, password: e.target.value })}
                  required
                />
              </div>
            </div>

            <hr style={{ margin: '14px 0', border: 'none', borderTop: '1px solid #eee' }} />

            <p style={{ fontWeight: '600', fontSize: '13px', color: '#555', marginBottom: '10px' }}>
              🚲 Votre vélo
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-group">
                <label>Marque</label>
                <input
                  placeholder="Trek"
                  value={registerForm.marque}
                  onChange={e => setRegisterForm({ ...registerForm, marque: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Modèle</label>
                <input
                  placeholder="Marlin 7"
                  value={registerForm.modele}
                  onChange={e => setRegisterForm({ ...registerForm, modele: e.target.value })}
                  required
                />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-group">
                <label>N° de cadre</label>
                <input
                  placeholder="CADRE001"
                  value={registerForm.numero_cadre}
                  onChange={e => setRegisterForm({ ...registerForm, numero_cadre: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Année</label>
                <input
                  type="number"
                  placeholder="2023"
                  value={registerForm.annee}
                  onChange={e => setRegisterForm({ ...registerForm, annee: e.target.value })}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Type de vélo</label>
              <select
                value={registerForm.type_velo}
                onChange={e => setRegisterForm({ ...registerForm, type_velo: e.target.value })}
              >
                <option value="">-- Choisir --</option>
                <option>VTT</option>
                <option>Route</option>
                <option>Ville</option>
                <option>BMX</option>
                <option>Électrique</option>
                <option>Gravel</option>
              </select>
            </div>

            <button className="login-btn" type="submit" disabled={loading}>
              {loading ? 'Création...' : '🚲 Déposer mon vélo'}
            </button>
            <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: '#888' }}>
              Déjà un compte ?{' '}
              <span
                style={{ color: '#111', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }}
                onClick={() => setIsRegister(false)}
              >
                Se connecter
              </span>
            </p>
          </form>
        )}

        <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #eee' }} />
        <p style={{ textAlign: 'center', fontSize: '12px', color: '#aaa' }}>
          Vous êtes technicien ?{' '}
          <Link to="/login" style={{ color: '#111', fontWeight: '600' }}>
            Accès atelier
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ClientLogin;