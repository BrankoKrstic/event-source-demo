# Event Sourcing Demo

A demo of an event-sourced system with real-time updates to the client. The app contains of a Vue js client and an Express backend which doubles as event storage and server for the client code.

Code in `server/event` is a simple event-sourcing library which coordinates the command parser, event storage, and event emitting. It also contains interfaces for user-implemented parts of the code. The implementations for the concrete app are in `server/ledger`. 

The client currently allows appending new items to a list and removing them. The event-sourced nature of the storage also allows for rewinding already applied events, including rewinding the rewinds, which is possible through interacting with the event cards in the client. All changes are propagated to all the clients immediately through an event stream.

## To run the code

```bash
npm install
npm run dev
```

Or in production mode

```bash
npm run build
npm run preview
```

## Future Improvements

#### Distribution
Conflicts in the business logic of the app are impossible as all events are processed on a single thread. However, as things stand, it would currently be impossible to distribute the app to multiple servers because separate instances would not see changes committed by other servers.

That said, the current app uses ulids, which are both unique and sortable by time of creation, so allowing server gossip would be a straightforward way to allow scaling the servers horizontally. More complex operations like text editing could be enabled by adding CRDT functionality to the command processor.

#### Snapshots
In the current implementation, `EventManager` continues to store a progressively larger log of events as commands pile up. This can possibly overflow any storage device given enough time.

A simple solution would be to add snapshotting, where only the last few events are kept around together with a snapshot of the state before the first saved event. Note that this would introduce some complexity in distributing the system to multiple machines, as servers would need to be able to  install their snapshot to machines that are behind their last saved point in the log. This could be done via something like the install snapshot RPC used in Raft.