import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

// === URLs JSON POTM ===
const POTM_URLS = {
  premierLeague: "https://potm.easports.com/api/premierleague/current-campaign.json",
  laLiga:       "https://potm.easports.com/api/laliga/current-campaign.json",
  bundesliga:   "https://potm.easports.com/api/bundesliga/current-campaign.json",
  serieA:       "https://potm.easports.com/api/seriea/current-campaign.json",
  ligue1:       "https://potm.easports.com/api/ligue1/current-campaign.json"
};

// Fonction pour envoyer un message sur Discord
async function sendToDiscord(message) {
  try {
    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: message })
    });

    if (!res.ok) {
      console.error("❌ Erreur Discord:", res.status, res.statusText);
    } else {
      console.log("✅ Message envoyé à Discord");
    }
  } catch (err) {
    console.error("⚠️ Erreur:", err.message);
  }
}

// Fonction pour récupérer les données POTM pour une ligue
async function fetchLeaguePOTM(name, url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    const title = data?.title || "Sans titre";
    const players = data?.players?.map(p => p.name).join(", ") || "Aucun joueur";

    await sendToDiscord(`⚽ **${name.toUpperCase()} POTM**\n🏆 ${title}\n👤 Joueurs : ${players}`);
  } catch (err) {
    console.error(`❌ Erreur ${name}:`, err.message);
  }
}

// Boucle sur toutes les ligues
async function fetchAllPOTM() {
  for (const [league, url] of Object.entries(POTM_URLS)) {
    await fetchLeaguePOTM(league, url);
  }
}

// 🔹 Lancer une fois au démarrage
fetchAllPOTM();

// 🔹 Automatiser toutes les 6 heures
import cron from "node-cron";
cron.schedule("0 */6 * * *", () => {
  console.log("🔄 Vérification automatique des POTM...");
  fetchAllPOTM();
});
