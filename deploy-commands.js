require("dotenv").config();
const { REST, Routes, SlashCommandBuilder } = require("discord.js");

const commands = [
  new SlashCommandBuilder()
    .setName("announce")
    .setDescription("Schedule an announcement")
    .addStringOption(o =>
      o.setName("title").setDescription("Title").setRequired(true))
    .addStringOption(o =>
      o.setName("description").setDescription("Message").setRequired(true))
    .addIntegerOption(o =>
      o.setName("minutes").setDescription("After how many minutes").setRequired(true))
    .addStringOption(o =>
      o.setName("mention").setDescription("@everyone or role"))
].map(cmd => cmd.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  await rest.put(
    Routes.applicationCommands("YOUR_CLIENT_ID"),
    { body: commands }
  );
  console.log("Commands registered");
})();
