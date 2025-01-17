import EventManager from './event/manager.js';
import { FileStorage } from './event/storage.js';
import { ledgerOutputProcessor } from './ledger/applyEvent.js';
import { LedgerEvent } from './ledger/events.js';
import config from './config/index.js';
import express from 'express';
import createRoutes from './api/router.js';

const storage = new FileStorage<LedgerEvent>('events.json');

global.ledgerManager = new EventManager(storage, ledgerOutputProcessor);


async function createApp() {
    const app = express();
    
    createRoutes(app);

    app.listen(config.port, () => {
        console.info(`Server is running on port http://localhost:${config.port}`);
    });
}

await createApp();
