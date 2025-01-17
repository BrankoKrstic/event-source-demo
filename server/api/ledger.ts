import express, { Request, Response } from 'express';

import { appendEventFactory, deleteEventFactory, rewindEventFactory } from '../ledger/events.js';

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


export default router;