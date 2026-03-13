const mineflayer = require('mineflayer');
const { pathfinder } = require('mineflayer-pathfinder');
const autoAuth = require('mineflayer-auto-auth');

// === CONFIGURATION ===
const config = {
  host: 'QuantumworldSMP.aternos.me',
  port: 15376,
  username: 'Alphabot',
  version: false, // Set to false so the bot detects your version (1.21.11) automatically
  password: 'your_password_here', 
  antiAfk: true,
  antiAfkInterval: 60000,
};

function createBot() {
  const bot = mineflayer.createBot({
    host: config.host,
    port: config.port,
    username: config.username,
    version: config.version,
  });

  // Load Plugins
  bot.loadPlugin(pathfinder);
  bot.loadPlugin(autoAuth);

  // === Authentication Setup ===
  bot.on('spawn', () => {
    // Configure auto-auth plugin
    if (bot.autoAuth) {
      bot.autoAuth.options = {
        password: config.password,
        logging: true
      };
    }
    
    bot.chat('xpcraft programmed me');
    console.log('Bot has spawned and authenticated.');
  });

  // === Anti-AFK Movement ===
  let afkInterval;
  bot.on('spawn', () => {
    if (config.antiAfk && !afkInterval) {
      afkInterval = setInterval(() => {
        bot.setControlState('jump', true);
        setTimeout(() => bot.setControlState('jump', false), 500);
        bot.look(Math.random() * Math.PI * 2, 0, true);
      }, config.antiAfkInterval);
    }
  });

  // === Auto-Respawn ===
  bot.on('death', () => {
    setTimeout(() => bot.emit('respawn'), 1000);
  });

  // === Auto-Reconnect ===
  bot.on('end', (reason) => {
    console.log(`Disconnected: ${reason}. Reconnecting in 5s...`);
    if (afkInterval) clearInterval(afkInterval);
    afkInterval = null;
    setTimeout(createBot, 5000);
  });

  // === Chat Commands ===
  bot.on('chat', (username, message) => {
    if (username === bot.username) return;
    
    if (message === ';pos') {
      const pos = bot.entity.position;
      bot.chat(`I am at ${pos.x.toFixed(1)}, ${pos.y.toFixed(1)}, ${pos.z.toFixed(1)}`);
    }
    
    if (message === ';stop') {
      clearInterval(afkInterval);
      afkInterval = null;
      bot.chat('Anti-AFK disabled.');
    }
  });

  // === Error Handling ===
  bot.on('error', (err) => console.log('Bot Error:', err.message));
  bot.on('kicked', (reason) => console.log('Kicked from server:', reason));
}

createBot();
