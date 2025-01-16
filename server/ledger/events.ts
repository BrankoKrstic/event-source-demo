import { Event } from '../event/event.js';
import { ulid } from 'ulid';

type HasTimestamp = {
  ts: number
}

export type AppendEvent = Event & HasTimestamp & {
  ty: 'append',
  content: string
}

export function appendEventFactory(content: string): AppendEvent {
    return {
        id: ulid(),
        ts: Date.now(),
        ty: 'append',
        content
    };
}

export type DeleteEvent = Event & HasTimestamp & {
  ty: 'delete',
  target: string
}

export function deleteEventFactory(target: string): DeleteEvent {
    return {
        id: ulid(),
        ts: Date.now(),
        ty: 'delete',
        target
    };
}

export type RewindEvent = Event & HasTimestamp & {
  ty: 'rewind',
  target: string
}

export function rewindEventFactory(target: string): RewindEvent {
    return {
        id: ulid(),
        ts: Date.now(),
        ty: 'rewind',
        target
    };
}

export type LedgerEvent = AppendEvent | DeleteEvent | RewindEvent;