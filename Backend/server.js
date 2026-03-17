const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const repairRoutes = require('./routes/repairs');
const stockRoutes = require('./routes/stock');
const velosRoutes = require('./routes/velos');
const llmRoutes = require('./routes/llm');
const clientsRoutes = require('./routes/clients');
const fournisseursRoutes = require('./routes/fournisseurs');
const rapportsRoutes = require('./routes/rapports');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/repairs', repairRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/velos', velosRoutes);
app.use('/api/llm', llmRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/fournisseurs', fournisseursRoutes);
app.use('/api/rapports', rapportsRoutes);


// Test route
app.get('/', (req, res) => {
  res.json({ message: 'VeloTech API fonctionne ✅' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
});