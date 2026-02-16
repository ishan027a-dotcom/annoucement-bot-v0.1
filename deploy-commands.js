
require("dotenv").config();
const { REST, Routes, SlashCommandBuilder } = require("discord.js");

const commands = [
  new SlashCommandBuilder()
    .setName("announce")
    .setDescription("Create a scheduled announcement")
    .addStringOption(o => 
      o.setName("title").setDescription("Headline").setRequired(true))
    .addStringOption(o => 
      o.setName("description").setDescription("Message").setRequired(true))
    .addChannelOption(o =>
      o.setName("channel").setDescription("Select channel").setRequired(true))
    .addStringOption(o =>
      o.setName("color").setDescription("Hex color (ex: #FF0000)"))
    .addIntegerOption(o =>
      o.setName("time").setDescription("Time in minutes").setRequired(true))
    .addStringOption(o =>
      o.setName("mention")
        .setDescription("Mention type")
        .addChoices(
          { name: "Everyone", value: "everyone" },
          { name: "Here", value: "here" },
          { name: "None", value: "none" }
        ))
].map(c => c.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  await rest.put(
    Routes.applicationCommands(process.env.CLIENT_ID),
    { body: commands }
  );
  console.log("Commands registered");
})();