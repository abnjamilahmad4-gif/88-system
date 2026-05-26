const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');

module.exports = async (client) => {
    const commandsArray = [];
    const commandsPath = path.join(__dirname, '../commands');

    // إنشاء المجلد إذا لم يكن موجوداً
    if (!fs.existsSync(commandsPath)) {
        fs.mkdirSync(commandsPath, { recursive: true });
        console.warn('[Warning] Commands directory not found. Created an empty one.');
        return;
    }

    try {
        const commandFolders = fs.readdirSync(commandsPath);

        for (const folder of commandFolders) {
            const folderPath = path.join(commandsPath, folder);
            
            // التحقق إذا كان المسار مجلداً
            if (!fs.statSync(folderPath).isDirectory()) {
                // في حال كانت الأوامر مباشرة في المجلد الرئيسي بدون مجلدات فرعية
                if (folder.endsWith('.js')) {
                    const command = require(folderPath);
                    if ('data' in command && 'execute' in command) {
                        client.commands.set(command.data.name, command);
                        commandsArray.push(command.data.toJSON());
                    }
                }
                continue;
            }

            const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
            
            for (const file of commandFiles) {
                const filePath = path.join(folderPath, file);
                const command = require(filePath);

                if ('data' in command && 'execute' in command) {
                    client.commands.set(command.data.name, command);
                    commandsArray.push(command.data.toJSON());
                } else {
                    console.warn(`[Warning] Command at ${filePath} is missing "data" or "execute" property.`);
                }
            }
        }

        if (commandsArray.length === 0) {
            console.log('[System] No commands found to register.');
            return;
        }

        const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

        console.log(`[System] Started refreshing ${commandsArray.length} application (/) commands.`);

        // تسجيل الأوامر (بشكل عام لجميع السيرفرات)
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commandsArray },
        );

        console.log(`[System] Successfully reloaded ${commandsArray.length} application (/) commands.`);
    } catch (error) {
        console.error('[Error] Failed to load or register commands:', error);
    }
};
