
import { Storage } from './storage.js';
import { Event } from './event.js';
import { OutputProcessor } from './outputProcessor.js';
export default class EventManager<E extends Event, S extends Storage<E>, Output> {
    private cbs: ((out: Output) => void)[];
    private output: Output;
    private events: E[];
    constructor(private storage: S, private processor: OutputProcessor<E, Output>) {
        this.cbs = []; 
        this.events = [];
        this.output = this.processor.rebuildState(this.events);
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