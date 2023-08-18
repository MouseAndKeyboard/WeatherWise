import mitt from 'mitt'

export default defineNuxtPlugin(() => {  // Then we just inform mitt about our event types
  const emitter = mitt()

  return {
    provide: {
      event: emitter.emit, // Will emit an event
      listen: emitter.on // Will register a listener for an event
    }
  }
})