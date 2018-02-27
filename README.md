# eventtarget-once

> Get a promise for the first firing of an event-type firing on an event-target.

# Usage

`eventtarget-once`'s primary interface is a single method, expecting an `EventTarget` and a textual type to look for from the EventTarget.

```
once( document, "DOMContentLoaded").then( e=> console.log("Loaded!", e))
```

A variety of options may be passed via an options bundle, as the third argument to once. These options are documented below:


## Option: passive, capture

`passive` (defaults to true) and `capture` are passed to the underlying `addEventListener` calls.

## Option: filter

`filter` is an optional function that transforms the received event before resolving. This is only mildly useful, as promises are pretty easy to chain transformations off of. However, if `filter` returns `false`, the current message is skipped.

```
once( myElemnt, "click", { filter: e=> e.button=== 1}).then( e=> console.log("Middle button clicked", e))
```

The `filter` function is passed first the `Event`, and second, an object with
* `eventTarget` - the event-target being listened to.
* `eventType` - the textual type of this event,
* `promise` - the resulting promise,
* `state` - an additional option passed in to once

## Option: signal

`signal` is an optional [AbortSignal](https://dom.spec.whatwg.org/#abortsignal) that can abort the promise (and of course cleanup all extant handler).

On an abort signal event, the promise will reject. This is expected to be the only condition the promise will reject on- it ought, otherwise, wait indefinately for a valid event and resolve.

## AbortError

`eventtarget-once` also exports an `AbortError`, which is either
1. the native `AbortError` if present, or
2. it's own AbortError class, or
3. or the AbortError set with `setAbortError`.

Although all rejections are assured to be AbortErrors, this is provided such that programs can type-check errors they encounter if they are attempting more complected multi-promise systems.
