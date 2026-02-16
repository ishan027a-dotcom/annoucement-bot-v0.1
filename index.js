require("dotenv").config();
const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const fs = require("fs");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});


// ===== JSON DATABASE FUNCTIONS =====

function loadAnnouncements() {
  return JSON.parse(fs.readFileSync("./announcements.json", "utf8"));
}

function saveAnnouncements(data) {
  fs.writeFileSync("./announcements.json", JSON.stringify(data, null, 2));
}


// ===== SCHEDULER =====

function scheduleAnnouncement(data) {
  const delay = new Date(data.sendAt) - new Date();

  if (delay <= 0) return;

  setTimeout(async () => {
    try {
      const channel = await client.channels.fetch(data.channelId);

      const embed = new EmbedBuilder()
        .setTitle(data.title)
        .setDescription(data.description)
        .setColor(data.color || "Blue")
        .setTimestamp();

      await channel.send({
        content: data.mention || "",
        embeds: [embed]
      });

      // Remove after sending
      const announcements = loadAnnouncements();
      const filtered = announcements.filter(a => a.id !== data.id);
      saveAnnouncements(filtered);

      console.log("Announcement Sent:", data.title);

    } catch (err) {
      console.log("Error sending announcement:", err);
    }
  }, delay);
}


// ===== BOT READY =====

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);

  const pending = loadAnnouncements();
  pending.forEach(a => scheduleAnnouncement(a));
});


// ===== SLASH COMMAND =====

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "announce") {

    const title = interaction.options.getString("title");
    const description = interaction.options.getString("description");
    const minutes = interaction.options.getInteger("minutes");
    const mention = interaction.options.getString("mention") || "";

    const sendTime = new Date(Date.now() + minutes * 60000);

    const data = {
      id: Date.now().toString(),
      channelId: interaction.channel.id,
      title,
      description,
      color: "Blue",
      mention,
      sendAt: sendTime
    };

    const announcements = loadAnnouncements();
    announcements.push(data);
    saveAnnouncements(announcements);

    scheduleAnnouncement(data);

    await interaction.reply(`✅ Announcement scheduled in ${minutes} minute(s)!`);
  }
});

client.login(process.env.TOKEN);
