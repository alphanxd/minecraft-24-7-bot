const mineflayer = require('mineflayer')
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')

function createBot() {

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

  // Anti AFK movement
  setInterval(() => {

    const actions = ['forward','back','left','right','jump']
    const action = actions[Math.floor(Math.random()*actions.length)]

    bot.setControlState(action, true)

    setTimeout(() => {
      bot.setControlState(action, false)
    }, 2000)

  }, 15000)

  // Random head movement (looks human)
  setInterval(() => {

    const yaw = Math.random() * Math.PI * 2
    const pitch = (Math.random() - 0.5) * Math.PI / 2

    bot.look(yaw, pitch, true)

  }, 10000)

})

bot.on('chat', (username, message) => {

  if (username === bot.username) return

  if (message === "follow") {

    const player = bot.players[username]

    if (!player || !player.entity) return

    const GoalFollow = goals.GoalFollow

    bot.pathfinder.setGoal(new GoalFollow(player.entity, 1), true)

    bot.chat("Following you")
  }

  if (message === "stop") {

    bot.pathfinder.setGoal(null)
    bot.chat("Stopping")

  }

})

bot.on('end', () => {

  console.log("Disconnected. Reconnecting...")
  setTimeout(createBot, 5000)

})

bot.on('error', err => console.log(err))

}

createBot()
