
// creates an async func that will only be run in the first caller. Any subsequent callers only notify the first one to rerun callback 
// using this to avoid data races when persisting state to storage.
// we typically only want the last state to be persisted, so it's fine to skip as many calls to persist as long as we do it after the last update
export function createRepeatable (cb: () => Promise<void>) {
    let runningPromise = false;
    let shouldRerun = false;

    return async function rerunAsync () {
        if (runningPromise) {
            shouldRerun = true;
        } else {
            runningPromise = true;
            do {
                await cb();
            } while (shouldRerun);
        }
    };
}