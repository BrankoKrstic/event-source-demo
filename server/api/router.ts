import express, { Express } from 'express';

import router from './ledger.js';
import streams from './sse.js';
import path from 'path';

import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);

// 👇️ "/home/john/Desktop/javascript"
const __dirname = path.dirname(__filename);

async function createRoutes(app: Express) {
    app.use(express.json());

    app
        .use('/api', router)
        .use('/sse', streams);
    
    if (process.env.NODE_ENV === 'production') {

        app.use('/build/client', express.static(path.join(__dirname, '../../client')));
        app.use('/', (_, res) => {
            res.sendFile(path.join(__dirname, '../../client/index.html'));
        });
    } else {
        const { createServer } = await import('vite');
        const vite = await createServer({
            server: {middlewareMode: true},
            base: '/'
        });
        app.use(vite.middlewares);
    }
}

export default createRoutes;