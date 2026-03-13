const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const autoAuth = require('mineflayer-auto-auth');

// === CONFIGURATION ===
const config = {
  host: 'QuantumworldSMP.aternos.me', // <-- Set your server IP here
  port: 15376,       // <-- Set your server port here
  username: 'Alphabot', // <-- Set your bot username here
  version: '1.21.11',    // Set to your server version
  autoNightSkip: true, // Set to true to skip night if possible
  antiAfk: true,     // Enable anti-AFK
  antiAfkInterval: 60 * 1000, // ms between anti-AFK actions
};

function createBot() {
  const bot = mineflayer.createBot({
    host: config.host,
    port: config.port,
    username: config.username,
    version: config.version,
    plugins: {
      'mineflayer-auto-auth': autoAuth
    },
  });

  bot.loadPlugin(pathfinder);

  // === Auto-Auth (for cracked servers with /register or /login) ===
  bot.on('spawn', () => {
    if (bot.autoAuth) {
      bot.autoAuth.options = {
        password: 'password', // Change if needed
        logging: true
      };
    }
    // Make the bot say a message when it joins
    setTimeout(() => {
      bot.chat('xpcraft programmed me');
    }, 2000); // Wait 2 seconds after spawn
  });

  // === Anti-AFK Movement ===
  let afkInterval;
  bot.on('spawn', () => {
    if (config.antiAfk) {
      if (afkInterval) clearInterval(afkInterval);
      afkInterval = setInterval(() => {
        // Random jump or move
        if (!bot.entity || !bot.entity.position) return;
        const pos = bot.entity.position;
        bot.setControlState('jump', true);
        setTimeout(() => bot.setControlState('jump', false), 500);
        // Optionally, rotate
        bot.look(Math.random() * Math.PI * 2, 0, true);
      }, config.antiAfkInterval);
    }
  });
  bot.on('end', () => {
    if (afkInterval) clearInterval(afkInterval);
  });

  // === Auto-Respawn ===
  bot.on('death', () => {
    setTimeout(() => bot.emit('respawn'), 1000);
  });

  // === Auto-Reconnect ===
  bot.on('end', () => {
    console.log('Bot disconnected, reconnecting in 5s...');
    setTimeout(createBot, 5000);
  });

  // === Night Skipping (if bot has permission) ===
  bot.on('time', () => {
    if (config.autoNightSkip && bot.time.isNight) {
      bot.chat('/time set day');
    }
  });

  // === Basic Chat Commands ===
  bot.on('chat', (username, message) => {
    if (username === bot.username) return;
    if (message === ';pos') {
      const pos = bot.entity.position;
      bot.chat(`I am at ${pos.x.toFixed(1)}, ${pos.y.toFixed(1)}, ${pos.z.toFixed(1)}`);
    }
    if (message === ';start') {
      config.antiAfk = true;
      bot.chat('Anti-AFK enabled.');
    }
    if (message === ';stop') {
      config.antiAfk = false;
      if (afkInterval) clearInterval(afkInterval);
      bot.chat('Anti-AFK disabled.');
    }
  });

  // === Logging ===
  bot.on('login', () => console.log('Bot logged in!'));
  bot.on('spawn', () => console.log('Bot spawned in the world.'));
  bot.on('kicked', (reason) => console.log('Kicked:', reason));
  bot.on('error', (err) => console.log('Error:', err));
}


createBot(); 
