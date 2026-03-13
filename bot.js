const mineflayer = require('mineflayer')
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')
const pvp = require('mineflayer-pvp').plugin

function startBot() {

const bot = mineflayer.createBot({
host: "QuantumworldSMP.aternos.me",
port: 15376,
username: "AlphaBot"
})

bot.loadPlugin(pathfinder)
bot.loadPlugin(pvp)

bot.once('spawn', () => {

console.log("AlphaBot joined the server")

const mcData = require('minecraft-data')(bot.version)
const movements = new Movements(bot, mcData)

bot.pathfinder.setMovements(movements)

bot.chat("I'm keeping the server alive!")

startAntiAFK()
startWandering()
startMobCombat()

})

function startAntiAFK() {

setInterval(() => {

const actions = ['forward','back','left','right','jump']
const action = actions[Math.floor(Math.random()*actions.length)]

bot.setControlState(action,true)

setTimeout(() => {
bot.setControlState(action,false)
},2000)

},15000)

}

function startWandering(){

setInterval(() => {

const x = bot.entity.position.x + (Math.random()*20-10)
const y = bot.entity.position.y
const z = bot.entity.position.z + (Math.random()*20-10)

const goal = new goals.GoalNear(x,y,z,1)

bot.pathfinder.setGoal(goal)

},30000)

}

// Attack nearby hostile mobs
function startMobCombat(){

setInterval(()=>{

const mob = bot.nearestEntity(entity =>
entity.type === "mob"
)

if(mob){
bot.pvp.attack(mob)
}

},5000)

}

// Fight players who hit the bot
bot.on('entityHurt',(entity)=>{

if(entity === bot.entity){

const enemy = bot.nearestEntity(e =>
e.type === "player" && e.username !== bot.username
)

if(enemy){
console.log("Attacking",enemy.username)
bot.chat("Why did you hit me?")
bot.pvp.attack(enemy)
}

}

})

// Chat commands
bot.on('chat',(username,message)=>{

if(username === bot.username) return

const msg = message.toLowerCase()

if(msg === "hello"){
bot.chat("Hello "+username)
}

if(msg === "follow"){

const player = bot.players[username]

if(!player || !player.entity) return

bot.chat("Following you")

bot.pathfinder.setGoal(
new goals.GoalFollow(player.entity,1),
true
)

}

if(msg === "stop"){
bot.chat("Stopping")
bot.pathfinder.setGoal(null)
}

})

bot.on('end',()=>{
console.log("Disconnected, reconnecting...")
setTimeout(startBot,15000)
})

bot.on('error',(err)=>{
console.log(err)
})

}

startBot()
