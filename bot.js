const mineflayer = require('mineflayer')
const pvp = require('mineflayer-pvp').plugin
const { pathfinder, Movements } = require('mineflayer-pathfinder')
const autoeat = require('mineflayer-auto-eat').plugin

function createBot() {

const bot = mineflayer.createBot({
  host: "QuantumworldSMP.aternos.me",
  port: 15376,
  username: "AlphaBot"
})

bot.loadPlugin(pathfinder)
bot.loadPlugin(pvp)
bot.loadPlugin(autoeat)

bot.once('spawn', () => {

  console.log("✅ AlphaBot joined the server!")

  const mcData = require('minecraft-data')(bot.version)
  const movements = new Movements(bot, mcData)

  bot.pathfinder.setMovements(movements)

  bot.autoEat.options = {
    priority: "foodPoints",
    startAt: 14
  }

  // Hunt mobs automatically
  setInterval(() => {

    const mob = bot.nearestEntity(entity =>
      entity.type === 'mob'
    )

    if (mob) {
      bot.pvp.attack(mob)
    }

  }, 5000)

})

// Attack players who hit the bot
bot.on('entityHurt', (entity) => {

  if (entity === bot.entity) {

    const attacker = bot.nearestEntity(e => e.type === 'player')

    if (attacker) {
      bot.chat("You attacked AlphaBot!")
      bot.pvp.attack(attacker)
    }

  }

})

// Chat commands
bot.on('chat', (username, message) => {

  if (username === bot.username) return

  if (message === "follow") {
    const player = bot.players[username]
    if (!player) return

    const target = player.entity
    bot.pathfinder.setGoal(new (require('mineflayer-pathfinder').goals.GoalFollow)(target, 1), true)
  }

  if (message === "stop") {
    bot.pathfinder.setGoal(null)
  }

})

// Reconnect if server restarts
bot.on('end', () => {
  console.log("🔄 Reconnecting in 5 seconds...")
  setTimeout(createBot, 5000)
})

bot.on('error', err => console.log(err))

}

createBot()
