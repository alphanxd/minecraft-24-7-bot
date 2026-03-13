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

  // exploration wandering
  setInterval(() => {

    const x = bot.entity.position.x + (Math.random()*20 - 10)
    const z = bot.entity.position.z + (Math.random()*20 - 10)
    const y = bot.entity.position.y

    const goal = new goals.GoalNear(x, y, z, 1)
    bot.pathfinder.setGoal(goal)

  }, randomTime(20000,45000))

  // human-like head movement
  setInterval(() => {

    const yaw = Math.random() * Math.PI * 2
    const pitch = (Math.random()-0.5) * Math.PI/2

    bot.look(yaw, pitch, true)

  }, randomTime(6000,12000))

  // anti AFK
  setInterval(() => {

    const actions = ['forward','back','left','right','jump']
    const action = actions[Math.floor(Math.random()*actions.length)]

    bot.setControlState(action,true)

    setTimeout(()=>{
      bot.setControlState(action,false)
    }, randomTime(1000,2500))

  }, randomTime(15000,30000))

})

bot.on('chat',(username,message)=>{

  if(username===bot.username) return

  const msg = message.toLowerCase()

  if(msg==="hello"){
    delayedChat("Hello "+username+"!")
  }

  if(msg==="alphabot"){
    delayedChat("Yes? I'm here.")
  }

  if(msg==="follow"){

    const player = bot.players[username]

    if(!player || !player.entity) return

    delayedChat("Okay, following you.")
    bot.pathfinder.setGoal(new goals.GoalFollow(player.entity,1),true)

  }

  if(msg==="stop"){
    delayedChat("Stopping.")
    bot.pathfinder.setGoal(null)
  }

  if(msg==="come"){

    const player = bot.players[username]
    if(!player || !player.entity) return

    const p = player.entity.position

    delayedChat("Coming.")
    bot.pathfinder.setGoal(new goals.GoalNear(p.x,p.y,p.z,1))

  }

})

bot.on('death',()=>{
  console.log("AlphaBot died")
})

bot.on('kicked',(reason)=>{
  console.log("Kicked:",reason)
})

bot.on('end',()=>{

  console.log("Disconnected")

  const delay = randomTime(15000,35000)

  console.log("Reconnecting in "+delay/1000+" seconds")

  setTimeout(()=>{
    startBot()
  },delay)

})

bot.on('error',err=>console.log(err))

function delayedChat(text){
  const delay = randomTime(1000,4000)
  setTimeout(()=>{
    bot.chat(text)
  },delay)
}

function randomTime(min,max){
  return Math.floor(Math.random()*(max-min)+min)
}

}

startBot()
