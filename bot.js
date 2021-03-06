const tmi = require('../node_modules/tmi.js')
const haikudos = require('../node_modules/haikudos')
var config = require('../configuration.js');
var random_kappa = require('./kappas.js');
var deathcounter = 0;


// Valid commands start with:
let commandPrefix = '!'
// Define configuration options:
let opts = {
  identity: {
    username: config.stream_settings.bot_name,
    password: 'oauth:' + config.stream_settings.oauth
  },
  channels: [
    config.stream_settings.channel_name
  ]
}

// These are the commands the bot knows (defined below):
let knownCommands = { echo, haiku, daphne, fortune, kappa, roastme, deaths, rip}

// Function called when the "echo" command is issued:
function echo (target, context, params) {
  // If there's something to echo:
  if (params.length) {
    // Join the params into a string:
    const msg = params.join(' ')
    // Send it back to the correct place:
    sendMessage(target, context, msg)
  } else { // Nothing to echo
    console.log(`* Nothing to echo`)
  }
}



// Function called when the "haiku" command is issued:
function haiku (target, context) {
  // Generate a new haiku:
  haikudos((newHaiku) => {
    // Split it line-by-line:
    newHaiku.split('\n').forEach((h) => {
    // Send each line separately:
    sendMessage(target, context, h)
    })
  })
}

function daphne (target, context){
  let introduction = 'Hello! My name is ' + config.stream_settings.bot_name + ' - I am ' + config.stream_settings.screen_name + '\'s friend and loyal servant.';
  sendMessage(target, context, introduction);
}

function fortune(target, context){
  const outcomes = [
	`Tomorrow you will be very lucky, ${context.username}`,
	`Today is not your day. Be strong and the worst shall pass.`,
	`I forsee great opportunities for you in the near future. ${context.username}, make sure to keep your eyes peeled`,
	`The near future is largely uneventful for you, ${context.username}. Be at ease and enjoy the little things.`,
	`Now is a good time for financial wisdom.`,
	`${context.username}. Be generous now to friends and strangers, and they will be sure to repay you tenfold when it matters.`,
	`Love will find you soon, ${context.username}.`
	]

  let message = outcomes[Math.floor(Math.random() * outcomes.length)];
  sendMessage(target, context, message);
}

function kappa(target, context){
  let message = 'Oh wow, what a show of creativity. Let\'s spam the Kappa emote.';  
  for(var i = 0; i < 10; i++){ message += ' ' + random_kappa();}

  sendMessage(target, context, message);
}

function deaths(target, context){
	var message = `${config.stream_settings.screen_name} has died ${deathcounter} times`;
        sendMessage(target, context, message);
}

function rip(target, context){
  if(is_moderator(context)){
    deathcounter++;
    deaths(target, context);
  }
}

function is_moderator(context){
	var sender = context.username;
	if(sender == "ramblingnymph" || sender == "tytocorvus"){
		return true;
	}
	return false;
}


function roastme(target, context){
  let user = '@' + context.username;
  const roasts = [
	`If I wanted to kill myself, ${user}, I\'d jump from your ego to your IQ.`,
	`${user}, I wish we were better strangers`,
	`If you were a superhero, ${user}, you\'d be Aquaman.`,
	`${user}, do us all a favor and don\'t stand upwind. I have a strong gag reflex and I don\'t feel like tasting my lunch another time.`,
	`I could, ${user}, but I won\'t. It wouldn\'t even feel fair.`
	]

  let message = roasts[Math.floor(Math.random() * roasts.length)];
  sendMessage(target, context, message);
}

// Helper function to send the correct type of message:
function sendMessage (target, context, message) {
  if (context['message-type'] === 'whisper') {
    client.whisper(target, message)
  } else {
    client.say(target, message)
  }
}

// Create a client with our options:
let client = new tmi.client(opts)

// Register our event handlers (defined below):
client.on('message', onMessageHandler)
client.on('connected', onConnectedHandler)
client.on('disconnected', onDisconnectedHandler)

// Connect to Twitch:
client.connect()

// Called every time a message comes in:
function onMessageHandler (target, context, msg, self) {
  if (self) { return } // Ignore messages from the bot

  // This isn't a command since it has no prefix:
  if (msg.substr(0, 1) !== commandPrefix) {
    console.log(`[${target} (${context['message-type']})] ${context.username}: ${msg}`)
    return
  }

  // Split the message into individual words:
  const parse = msg.slice(1).split(' ')
  // The command name is the first (0th) one:
  const commandName = parse[0]
  // The rest (if any) are the parameters:
  const params = parse.splice(1)

  // If the command is known, let's execute it:
  if (commandName in knownCommands) {
    // Retrieve the function by its name:
    const command = knownCommands[commandName]
    // Then call the command with parameters:
    command(target, context, params)
    console.log(`* Executed ${commandName} command for ${context.username}`)
  } else {
    console.log(`* Unknown command ${commandName} from ${context.username}`)
  }
}

// Called every time the bot connects to Twitch chat:
function onConnectedHandler (addr, port) {
  console.log(`* Connected to ${addr}:${port}`)
}

// Called every time the bot disconnects from Twitch:
function onDisconnectedHandler (reason) {
  console.log(`Disconnected: ${reason}`)
  process.exit(1)
}
