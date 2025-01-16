import { Event } from './event.js';

export type CommandProcessor<E extends Event, State> = {
  applyEvent: (newEvent: E, state: State, allEvents: E[]) => State
  rebuildState: (events: E[]) => State
}