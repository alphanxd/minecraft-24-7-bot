const mineflayer = require('mineflayer')
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')

function startBot() {

const bot = mineflayer.createBot({
  host: "QuantumworldSMP.aternos.me",
  port: 15376,
  username: "AlphaBot"
})

bot.loadPlugin(pathfinder)

bot.once('spawn', () => {

  console.log("AlphaBot joined the server")

  const mcData = require('minecraft-data')(bot.version)
  const movements = new Movements(bot, mcData)
  bot.pathfinder.setMovements(movements)

  // Random walking (looks alive)
  setInterval(() => {
    const x = bot.entity.position.x + (Math.random()*10 - 5)
    const z = bot.entity.position.z + (Math.random()*10 - 5)
    const y = bot.entity.position.y

    const goal = new goals.GoalNear(x, y, z, 1)
    bot.pathfinder.setGoal(goal)

  }, 20000)

  // Random head movement
  setInterval(() => {
    const yaw = Math.random()*Math.PI*2
    const pitch = (Math.random()-0.5)*Math.PI/2
    bot.look(yaw, pitch, true)
  }, 8000)

})

// Chat reactions
bot.on('chat', (username, message) => {

  if (username === bot.username) return

  const msg = message.toLowerCase()

  if (msg === "hello") bot.chat("Hello " + username + " 👋")
  if (msg === "alphabot") bot.chat("Yes? I am here.")
  if (msg === "follow") {
    const player = bot.players[username]
    if (!player || !player.entity) return
    bot.chat("Following you!")
    bot.pathfinder.setGoal(new goals.GoalFollow(player.entity, 1), true)
  }

  if (msg === "stop") {
    bot.chat("Stopping.")
    bot.pathfinder.setGoal(null)
  }

  if (msg === "come") {
    const player = bot.players[username]
    if (!player || !player.entity) return
    bot.chat("Coming!")
    const p = player.entity.position
    bot.pathfinder.setGoal(new goals.GoalNear(p.x,p.y,p.z,1))
  }

})

// Respawn
bot.on('death', () => {
  console.log("AlphaBot died")
  setTimeout(() => {
    bot.chat("I will survive!")
  }, 3000)
})

// Reconnect
bot.on('end', () => {
  console.log("Disconnected. Reconnecting...")
  setTimeout(startBot, 10000)
})

bot.on('kicked', reason => console.log("Kicked:", reason))
bot.on('error', err => console.log(err))

}

startBot()
