import { promises as fsPromises } from 'fs';
import { Event } from './event.js';


// interface of the persistence layer used to store the complete event data
export type Storage<E extends Event> = {
  persist: (events: E[]) => Promise<void>,
  load: () => Promise<E[]>
}

// local file storage implementation
export class FileStorage<E extends Event> implements Storage<E> {
    constructor(private path: string) {}
    async persist (events: E[]) {
        const data = JSON.stringify(events);
        await fsPromises.writeFile(this.path, data);
    };
    async load (): Promise<E[]> {
        const data = await fsPromises.readFile(this.path);
        return JSON.parse(data.toString());
    };
}
