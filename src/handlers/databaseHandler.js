const mongoose = require('mongoose');

module.exports = async () => {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
        console.warn('[Database] MONGODB_URI is not defined in .env! Skipping DB connection.');
        return;
    }

    // إيقاف رسائل التحذير الخاصة بـ Strict Query في Mongoose
    mongoose.set('strictQuery', false);

    try {
        console.log('[Database] Connecting to MongoDB...');
        await mongoose.connect(mongoURI);
        console.log('[Database] Successfully connected to MongoDB!');
    } catch (error) {
        console.error('[Database] Failed to connect to MongoDB:', error);
        // يمكنك إزالة التعليق أدناه إذا كنت تريد إيقاف البوت كلياً في حال فشل الاتصال بقاعدة البيانات
        // process.exit(1); 
    }

    // لوحة تحكم (Logger) لحالات الاتصال بعد التوصيل المبدئي
    mongoose.connection.on('disconnected', () => {
        console.warn('[Database] Disconnected from MongoDB!');
    });

    mongoose.connection.on('reconnected', () => {
        console.log('[Database] Reconnected to MongoDB!');
    });
    
    mongoose.connection.on('error', (err) => {
        console.error('[Database] MongoDB Connection Error:', err);
    });
};
