
require("dotenv").config();
const { 
  Client, 
  GatewayIntentBits, 
  EmbedBuilder,
  SlashCommandBuilder,
  Routes,
  REST 
} = require("discord.js");
const mongoose = require("mongoose");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Mongo Schema
const announcementSchema = new mongoose.Schema({
  channelId: String,
  title: String,
  description: String,
  color: String,
  mention: String,
  sendAt: Date
});

const Announcement = mongoose.model("Announcement", announcementSchema);

client.once("ready", async () => {
  console.log(`Logged in as ${client.user.tag}`);

  // Check pending timers
  const pending = await Announcement.find();
  pending.forEach(a => scheduleAnnouncement(a));
});

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "announce") {
    const title = interaction.options.getString("title");
    const description = interaction.options.getString("description");
    const channel = interaction.options.getChannel("channel");
    const color = interaction.options.getString("color") || "#2F3136";
    const mention = interaction.options.getString("mention");
    const time = interaction.options.getInteger("time");

    const sendTime = new Date(Date.now() + time * 60000);

    const newAnnouncement = await Announcement.create({
      channelId: channel.id,
      title,
      description,
      color,
      mention,
      sendAt: sendTime
    });

    scheduleAnnouncement(newAnnouncement);

    await interaction.reply({
      content: `✅ Announcement scheduled for ${sendTime.toLocaleString()}`,
      ephemeral: true
    });
  }
});

function scheduleAnnouncement(data) {
  const delay = data.sendAt - Date.now();
  if (delay <= 0) return;

  setTimeout(async () => {
    const channel = await client.channels.fetch(data.channelId);

    const embed = new EmbedBuilder()
      .setTitle(data.title)
      .setDescription(data.description)
      .setColor(data.color)
      .setTimestamp();

    let mentionText = "";
    if (data.mention === "everyone") mentionText = "@everyone";
    if (data.mention === "here") mentionText = "@here";

    await channel.send({
      content: mentionText,
      embeds: [embed]
    });

    await Announcement.deleteOne({ _id: data._id });

  }, delay);
}

mongoose.connect(process.env.MONGO_URI).then(() => {
  client.login(process.env.TOKEN);
});