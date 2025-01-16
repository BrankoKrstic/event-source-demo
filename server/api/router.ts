import express, { Request, Response } from 'express';
import config from '../config/index.js';
import EventManager from '../event/manager.js';
import { FileStorage } from '../event/storage.js';
import { LedgerOutput, ledgerOutputProcessor } from '../ledger/applyEvent.js';
import { appendEventFactory, deleteEventFactory, LedgerEvent, rewindEventFactory } from '../ledger/events.js';
import sendSSEHeaders from '../utils/sendSSEHeaders.js';

const storage = new FileStorage<LedgerEvent>('events.json');

const ledgerManager = new EventManager(storage, ledgerOutputProcessor);

const router = express.Router();

router.post('/ledger', async (req: Request, res: Response) => {
    try {
        if (req.body.content) {
            await ledgerManager.processEvent(appendEventFactory(req.body.content));
            res.status(200).send();
        }
    } catch (err) {
        console.error('Error posting new item', err);
        res.status(500).json({ message: 'Something went wrong' });
    }
});

router.delete('/ledger/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await ledgerManager.processEvent(deleteEventFactory(id));
        res.status(200).send();
    } catch (err) {
        console.error('Error deleting', err);
        res.status(500).json({ message: 'Something went wrong' });
    }
});

router.post('/ledger/rewind/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await ledgerManager.processEvent(rewindEventFactory(id));
        res.status(200).send();
    } catch (err) {
        console.error('Error rewinding events', err);
        res.status(500).json({ message: 'Something went wrong' });
    }
});

const streams = express.Router();


streams.get('/ledger', async (_: Request, res: Response) => {
    try {
        sendSSEHeaders(res);
        const subscriber = (out: LedgerOutput) => {
            res.write(`data: ${JSON.stringify(out)}\n\n`);
        };
        ledgerManager.subscribe(subscriber);

        res.on('close', () => {
            ledgerManager.unsubscribe(subscriber);
        });
    } catch (err) {
        console.error('Error rewinding events', err);
        res.status(500).end();
    }
});

async function createApp() {
    const app = express();
    app.use(express.json());

    app
        .use('/api', router)
        .use('/sse', streams);
    
    if (process.env.NODE_ENV === 'production') {
        app.use('/build', express.static('../../build/client'));
    } else {
        const { createServer } = await import('vite');
        const vite = await createServer({
            server: {middlewareMode: true},
            base: '/'
        });
        app.use(vite.middlewares);
    }

    app.listen(config.port, () => {
        console.info(`Server is running on port ${config.port}`);
    });
}

export default createApp;