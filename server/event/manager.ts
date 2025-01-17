
import { Storage } from './storage.js';
import { Event } from './event.js';
import { CommandProcessor } from './commandProcessor.js';
import { createRepeatable } from '../utils/repeatAsync.js';

export default class EventManager<E extends Event, S extends Storage<E>, Output> {
    private cbs: ((out: Output) => void)[];
    private output!: Output;
    private events!: E[];
    persist: () => Promise<void>;
    constructor(private storage: S, private processor: CommandProcessor<E, Output>) {
        this.cbs = []; 
        this.persist =  createRepeatable(() => this.storage.persist(this.events));
        this.loadState();
    }
    async loadState() {
        this.events = await this.storage.load();
        this.output = this.processor.rebuildState(this.events);
    }
    async processEvent(event: E) {
        try {
            this.events.push(event);
            const output = this.processor.applyEvent(event, this.output, this.events);
            this.output = output;
            this.storage.persist(this.events);
            this.cbs.forEach(cb => cb(output));
        } catch (err) {
            console.error('Something went wrong', err);
            this.loadState();
        }
    }
    subscribe(cb: (out: Output) => void) {
        this.cbs.push(cb);
        if (this.output) {
            cb(this.output);
        }
    }
    unsubscribe(cb: (out: Output) => void) {
        this.cbs = this.cbs.filter(x => x != cb);
    }
}