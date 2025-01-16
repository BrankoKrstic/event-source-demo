import { Event } from './event.js';

export type OutputProcessor<E extends Event, State> = {
  applyEvent: (newEvent: E, state: State, allEvents: E[]) => State
  rebuildState: (events: E[]) => State
}