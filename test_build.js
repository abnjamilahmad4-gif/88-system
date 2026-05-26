const fs = require('fs');
const path = require('path');

console.log('--- Starting Code Scan ---');
let errors = 0;

// Test models
console.log('\nScanning Models...');
const modelsPath = path.join(__dirname, 'src', 'models');
if (fs.existsSync(modelsPath)) {
    for (const file of fs.readdirSync(modelsPath)) {
        try {
            require(path.join(modelsPath, file));
        } catch (err) {
            console.error(`❌ Error in ${file}:`, err.message);
            errors++;
        }
    }
}

// Test utils
console.log('\nScanning Utils...');
const utilsPath = path.join(__dirname, 'src', 'utils');
if (fs.existsSync(utilsPath)) {
    for (const file of fs.readdirSync(utilsPath)) {
        try {
            require(path.join(utilsPath, file));
        } catch (err) {
            console.error(`❌ Error in ${file}:`, err.message);
            errors++;
        }
    }
}

// Test events
console.log('\nScanning Events...');
const eventsPath = path.join(__dirname, 'src', 'events');
if (fs.existsSync(eventsPath)) {
    for (const file of fs.readdirSync(eventsPath)) {
        if (file.endsWith('.js')) {
            try {
                require(path.join(eventsPath, file));
            } catch (err) {
                console.error(`❌ Error in ${file}:`, err.message);
                errors++;
            }
        }
    }
}

// Test handlers
console.log('\nScanning Handlers...');
const handlersPath = path.join(__dirname, 'src', 'handlers');
if (fs.existsSync(handlersPath)) {
    for (const file of fs.readdirSync(handlersPath)) {
        try {
            require(path.join(handlersPath, file));
        } catch (err) {
            console.error(`❌ Error in ${file}:`, err.message);
            errors++;
        }
    }
}

// Test commands
console.log('\nScanning Commands...');
const commandsPath = path.join(__dirname, 'src', 'commands');
if (fs.existsSync(commandsPath)) {
    const folders = fs.readdirSync(commandsPath);
    for (const folder of folders) {
        const folderPath = path.join(commandsPath, folder);
        if (fs.statSync(folderPath).isDirectory()) {
            const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.js'));
            for (const file of files) {
                try {
                    require(path.join(folderPath, file));
                } catch (err) {
                    console.error(`❌ Error in ${folder}/${file}:`, err.message);
                    errors++;
                }
            }
        }
    }
}

console.log(`\n--- Scan Complete. Errors found: ${errors} ---`);
