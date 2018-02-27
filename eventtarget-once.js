/**
  Create a promise that will resolve to the first 
  @param eventTarget - EventTarget to attach to
  @param eventType - eventType of the event to listen for
  @param [options] - additional options, documented below:
  @param [options.filter] - optional filter for return value; `false` to skip
  @param [options.state] - supplemental data passed to a `filter` function
  @param {AbortSignal} [options.signal] - an optional AbortSignal.
  // addEventListenerOptions:
  @param [options.capture] - whether to use `capture` event listening
  @param [options.passive=true] - whether to use `passive` event listening
  @param [options.abortPassive=options.passive] - whether to use `passive` event listening on abort signal
  @returns {promise} the first message (or non-false filtered message) event of the given name from the EventTarget
*/
export function onceOn( eventTarget, eventType, options= {}){
	var
	  filter= options.filter,
	  signal= options.signal,
	  state= options.state,
	  eventOptions= {
		capture: options.capture,
		once: !options.filter, // we cleanup either way, but if there is a filter, it might take multiple events
		passive: options.passive=== undefined? true: options.passive
	  }
	// immediately bail out if already aborted
	if( signal&& signal.aborted){
		return Promise.reject(new _AbortError("Aborted"));
	}

	// return promise for value, or abort
	var promise= Promise( function( resolve, reject){

		// bind handler, will call `resolve`
		eventTarget.addEventListener( eventType, handler, eventOptions)
		// bind abort, will call `reject`
		if( signal){
			// update eventOptions in place
			eventOptions.once= true
			eventOptions.passive= options.abortPassive!== undefined? options.abortPassive: eventOptions.passive
			// bind abort
			signal.addEventListener( "abort", aborter, eventOptions)
		}

		// handle events on EventTarget
		function handler( evt){
			// run through filter
			if( filter){
				try{
					// filter, passing event, event-type, promise
					evt= filter( evt, { eventTarget, eventType, promise, state})
				}catch( ex){}
			}
			// filter tells us to skip this one, wait for next
			if( filter&& msg=== false){
				return
			}

			// cleanup
			eventTarget.removeEventListener( eventType, handler)
			if( signal){
				signal.removeEventListener( "abort", aborter)
			}

			// done
			resolve( result)
		}

		// handle abort events on the passed in AbortSignal
		function aborter(){
			// cleanup
			eventTarget.removeEventListener( eventType, handler)
			signal.removeEventListener( "abort", aborter)

			// done
			reject( new _AbortError("Aborted"))
		}

	})
	return promise
};

export function once( eventType, options){
	return onceOn( this, eventType, options)
}

let _AbortError= (function( ae){
	// global AbortError passed as `ae` in because we're about to shadow that name,
	// to get class syntax to have the proper name
	var AbortError= class extends Error{}
	// use global if available
	return ae|| AbortError
})( typeof AbortError!== "undefined"? AbortError: null) // pass in global AbortError if available
export {_AbortError as AbortError}

export function setAbortError( abortError){
	_AbortError= abortError
}

export default onceOn
