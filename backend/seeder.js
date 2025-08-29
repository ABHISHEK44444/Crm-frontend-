import mongoose from 'mongoose';
import dotenv from 'dotenv';
import users from './data/users.js';
import clients from './data/clients.js';
import tenders from './data/tenders.js';
import User from './models/User.js';
import Client from './models/Client.js';
import Tender from './models/Tender.js';
import connectDB from './config/db.js';

dotenv.config();

await connectDB();

const importData = async () => {
    try {
        await User.deleteMany();
        await Client.deleteMany();
        await Tender.deleteMany();

        await User.insertMany(users);
        await Client.insertMany(clients);
        await Tender.insertMany(tenders);

        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await User.deleteMany();
        await Client.deleteMany();
        await Tender.deleteMany();

        console.log('Data Destroyed!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}
