const fs = require('fs');
const path = require('path');

module.exports = async (client) => {
    const eventsPath = path.join(__dirname, '../events');

    // إنشاء المجلد إذا لم يكن موجوداً
    if (!fs.existsSync(eventsPath)) {
        fs.mkdirSync(eventsPath, { recursive: true });
        console.warn('[Warning] Events directory not found. Created an empty one.');
        return;
    }

    try {
        const eventFolders = fs.readdirSync(eventsPath);
        let eventCount = 0;

        for (const folder of eventFolders) {
            const folderPath = path.join(eventsPath, folder);
            
            // في حال كانت الملفات مباشرة في مجلد events
            if (folder.endsWith('.js')) {
                loadEventFile(folderPath, client);
                eventCount++;
                continue;
            }

            if (!fs.statSync(folderPath).isDirectory()) continue;

            const eventFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
            
            for (const file of eventFiles) {
                const filePath = path.join(folderPath, file);
                loadEventFile(filePath, client);
                eventCount++;
            }
        }
        
        console.log(`[System] Successfully loaded ${eventCount} events.`);
    } catch (error) {
        console.error('[Error] Failed to load events:', error);
    }
};

function loadEventFile(filePath, client) {
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
    } else {
        client.on(event.name, (...args) => event.execute(...args, client));
    }
}
