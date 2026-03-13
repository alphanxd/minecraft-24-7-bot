const mineflayer = require('mineflayer')
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')
const pvp = require('mineflayer-pvp').plugin
const express = require('express')

const app = express()
const PORT = process.env.PORT || 3000

app.get("/", (req, res) => {
  res.send("Alpha Quantum Bot Running")
})

app.listen(PORT, () => {
  console.log("Web server running")
})

function createBot() {

const bot = mineflayer.createBot({
  host: "QuantumworldSMP.aternos.me",
  port: 15376,
  username: "ALPHA_Bot",
  auth: "offline",
  version: false
})

bot.loadPlugin(pathfinder)
bot.loadPlugin(pvp)

bot.once('spawn', () => {

  console.log("🤖 Alpha Bot joined server")

  const mcData = require('minecraft-data')(bot.version)
  const defaultMove = new Movements(bot, mcData)

  bot.pathfinder.setMovements(defaultMove)

  // follow you
  setInterval(() => {

    const player = bot.players["TheQuantxD"]

    if (!player || !player.entity) return

    const goal = new goals.GoalFollow(player.entity, 2)

    bot.pathfinder.setGoal(goal, true)

  }, 5000)

})

bot.on('physicsTick', () => {

  const mob = bot.nearestEntity(e => e.type === 'mob')

  if (!mob) return

  bot.pvp.attack(mob)

})

bot.on("spawn", () => {
  setTimeout(() => {
    bot.chat("/login chalol78")
  }, 3000)
})

bot.on("end", () => {
  console.log("Bot disconnected. Reconnecting in 10s...")
  setTimeout(createBot, 10000)
})

bot.on("error", console.log)

}

createBot()
