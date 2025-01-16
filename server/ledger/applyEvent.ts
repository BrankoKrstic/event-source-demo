import { OutputProcessor } from '@/event/outputProcessor.js';
import { LedgerEvent } from './events.js';
export type LedgerOutput = {
  eventState: ({ id: string, active: boolean, ty: string, ts: number })[],
  ledgerItems: ({ id: string, content: string })[]
}

export const ledgerOutputProcessor: OutputProcessor<LedgerEvent, LedgerOutput> = {
    applyEvent (event: LedgerEvent, state: LedgerOutput, allEvents: LedgerEvent[]): LedgerOutput {
        switch (event.ty) {
            case 'append': {
         
                state.eventState.push({ id: event.id, active: true, ty: 'Append', ts: event.ts });
                state.ledgerItems.push({ id: event.id, content: event.content });
                return state;
            }
            case 'delete': {
                if (!state.ledgerItems.find(item => item.id == event.target)) {
                    throw new Error('Item not found');
                } else {
                    state.ledgerItems = state.ledgerItems.filter(item => item.id != event.target);
                    state.eventState.push({ id: event.id, active: true, ty: 'Delete', ts: event.ts });
                    return state;
                }
            }
            case 'rewind': {
                if (!allEvents.find(e => e.id === event.target)) {
                    throw new Error('Event not found');
                }
                return this.rebuildState(allEvents);
            }
            default: {
                // Forces exhaustive pattern matching
                const _never: never = event;
                throw new Error('Unreachable code');
            }
        }
    },
    rebuildState (events: LedgerEvent[]): LedgerOutput {
  
        const newEventState = events.map(e => ({ id: e.id, active: false, ty: e.ty[0]?.toUpperCase() + e.ty.slice(1), ts: e.ts }));
        const eventStack = [];
        for (let i = events.length - 1; i >= 0; i--) {
            const event = events[i];
            newEventState[i].active = true;
            if (event.ty === 'rewind') {
                while (events[i].id != event.target) {
                    i--;
                }
            } else {
                eventStack.push(event);
            }
        }
        let newLedger: ({ id: string, content: string })[] = [];
        while (eventStack.length) {
            const event = eventStack.pop()!;
            if (event.ty === 'append') {
                newLedger.push({ id: event.id, content: event.content });
            } else {
                newLedger = newLedger.filter(e => e.id != event.target);
            }
        }
        return {
            eventState: newEventState,
            ledgerItems: newLedger
        };
    }
};