const Discord = require ('discord.js');
const Listing = require ('./../modules/Listing');
const fs = require('fs');
const settings = require('./../settings.json');
const owner = settings.owner;

module.exports.run = async (bot, message, args) => {
   let roles = message.guild.roles;
   let scrimmers = message.guild.roles.find( r => r.name === "@everyone");
   let snipeChannel = message.channel;
   const filter = m => !m.author.bot;
   let game = new Listing();

   let raw = fs.readFileSync('./roles.json');
   let allowedRoles = JSON.parse(raw);

    let validation = function(serverRoles, userRoles){
        let val = false;
        serverRoles.forEach((role) => {
            userRoles.forEach((usr) => {
                if (role == usr){
                    val = true;
                }
            });
        });
        return val;
    }

   let editLast3 = null;

   let startMessage = new Discord.RichEmbed()
   .setAuthor("FortniteChile PRO SCRIMS")
   .setTitle("__**Fortnite Chile**__")
   .setThumbnail("https://i.imgur.com/eR5D1t0.png")
   .addField("Instructions :",`
   -Server: __**Brasil**__
   -Envia los ultimos 3 Digitos de tu partida.`)
   .setImage("https://i.imgur.com/UNHIowh.jpg)")
   .setColor("#E96D33")
   .addField("Coordinador" , message.author)
   .setFooter("Developed by YERBAH")
   .setTimestamp()

message.channel.send({embed: startMessage}); 
let time = 24;
let editTime = "";

let timeEmbed = new Discord.RichEmbed()
   .setTitle("**Siguiente Partida...**")
   .setDescription(time + "minutos")
   .setColor("#E96D33");
   

setTimeout(async () => {
   editTime = await message.channel.send({embed: timeEmbed}).catch( (err) => {
       console.log("You can't edit the code");
   });
}, 10);    

let timeInterval = setInterval(()=> {
   if (time >= 2){
       time -= 1;
       timeEmbed.setDescription(time + " minutes");
   }else if (time === 1){
       time -= 1;
       timeEmbed.setDescription(time + " minutes");
       clearInterval(timeInterval);
   }
   editTime.edit({embed: timeEmbed}).catch((err) => {
       console.log("Cant edit timer, clearing interval");
       clearInterval(timeInterval);
   });
},60000);

let last3 = new Discord.RichEmbed()
   .setTitle ("**Lobbys**")
   .setColor ("#E96D33")


    setTimeout(async () => {
        editLast3= await message.channel.send({embed: last3});
    }, 10);
    
    const collector =snipeChannel.createMessageCollector(filter, {time: 140000});
	snipeChannel.overwritePermissions(
        scrimmers,
        { "SEND_MESSAGES": true}
    )

    collector.on('collect', m => {

        console.log(`Collected ${m.content} | ${m.author}`);       
        
        if (validation(allowedRoles.roles,m.member.roles.array()) || m.member.id === owner){
            if (m.content === ".start" || m.content === ".stop"){
                collector.stop();
                console.log("Collector Stoped");
                return;
            }
        }   
        if (game.data.length ===0 && m.content.length === 3){
            game.addID(m.content.toUpperCase(), m.author);
        }else if (m.content.length === 3){
            if (game.userPresent(m.author)){
                game.deleteUserEntry(m.author);
                if (game.idPresent(m.content.toUpperCase())){
                    game.addUser(m.content.toUpperCase(), m.author);
                }else {
                     game.addID(m.content.toUpperCase(), m.author);
                }
            } else {
                if (game.idPresent(m.content.toUpperCase())){
                    game.addUser(m.content.toUpperCase(), m.author);
                }else {
                    game.addID(m.content.toUpperCase(), m.author);
                }
            }
        }

    game.sort();

    let str = "";
    last3 = new Discord.RichEmbed()
        .setTitle("**Servidores**")
        .setColor("#E96D33")

    for (var i =0; i < game.data.length; i++){
        str = "";
        for (var j = 0; j < game.data[i].users.length ; j++){
            str += game.data[i].users[j] + "\n";
        }
        last3.addField(`ID: ${game.data[i].id.toUpperCase()}  (${game.data[i].users.length} total)` , str, true);
    }    

        editLast3.edit({embed: last3}).catch((err) => {
        console.log("error you can't edit");
    });

    if (m.deletable){
        m.delete().catch((err) => {
            console.log("you can't erase");
            console.log(err);
        });
    }

    });

    collector.on('end', collected => {

        console.log(`Collected ${collected.size} items`);
        let endMessage = new Discord.RichEmbed()
			.setColor("#E60D0D")
            .setDescription("**Lobbys cerrado**")
            .setFooter("Chat bloqueado..." , "https://i.imgur.com/Hqvs7k7.png")
		message.channel.send({embed: endMessage});
		snipeChannel.overwritePermissions(
            scrimmers,
            { "SEND_MESSAGES": false}
        );
    });
}






module.exports.help = {
    name: "start"
}

