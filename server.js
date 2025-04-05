// ✅ Chargement des variables d'environnement
const dotenv = require('dotenv');
dotenv.config();

// ✅ Import des modules
const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const cors = require('cors');
const serviceAccount = require('./serviceAccountKey.json');


// ✅ Initialisation Firebase Admin avec serviceAccount
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.DATABASE_URL
});

// ✅ Firestore DB
const db = admin.firestore();

// ✅ Configuration du serveur Express
const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ Endpoint pour recevoir les données ESP32
app.post('/data', async (req, res) => {
  try {
    const { deviceId, temperature, humidity } = req.body;

    if (!deviceId) {
      return res.status(400).send("❌ deviceId manquant");
    }

    const docRef = db.collection('devices').doc(deviceId);

    await docRef.set({
      temperature,
      humidity,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    res.status(200).send('✅ Données enregistrées avec succès');
  } catch (error) {
    console.error("❌ Erreur lors de l'enregistrement :", error);
    res.status(500).send('❌ Erreur serveur');
  }
});

// ✅ Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur API démarré sur http://localhost:${PORT}`);
});