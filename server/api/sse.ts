import express, { Request, Response } from 'express';
import { LedgerOutput } from '../ledger/applyEvent.js';
import sendSSEHeaders from '../utils/sendSSEHeaders.js';

const router = express.Router();

router.get('/ledger', async (_: Request, res: Response) => {
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

export default router;