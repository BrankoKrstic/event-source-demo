import { CommandProcessor } from '@/event/commandProcessor.js';
import { LedgerEvent } from './events.js';

// We want to display both the event metadata and the actual items generated from the events on the client
export type LedgerOutput = {
  eventState: ({ id: string, active: boolean, ty: string, ts: number })[],
  ledgerItems: ({ id: string, content: string })[]
}

export const ledgerOutputProcessor: CommandProcessor<LedgerEvent, LedgerOutput> = {
    applyEvent (event, state, allEvents) {
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
    rebuildState (events) {
        const newState: LedgerOutput = {
            eventState: events.map(e => ({ id: e.id, active: false, ty: e.ty[0]?.toUpperCase() + e.ty.slice(1), ts: e.ts })),
            ledgerItems: []
        };
        const eventStack = [];
        for (let i = events.length - 1; i >= 0; i--) {
            const event = events[i];
            // Mark the elements that end up used in generating ledger as active
            newState.eventState[i].active = true;
            // if we detect a rewind, skip elements until we pass the rewind target
            if (event.ty === 'rewind') {
                while (events[i].id != event.target) {
                    i--;
                }
            } else {
                eventStack.push(event);
            }
        }

        // There are no rewinds in the event stack, so it's safe to use applyEvent without creating an infinite loop
        while (eventStack.length) {
            const event = eventStack.pop()!;
            if (event.ty === 'append') {
                newState.ledgerItems.push({ id: event.id, content: event.content });
            } else if (event.ty === 'delete') {
                newState.ledgerItems = newState.ledgerItems.filter(item => item.id != event.target);
            } else {
                const _never: never = event;
            }
        }

        return newState;
    }
};