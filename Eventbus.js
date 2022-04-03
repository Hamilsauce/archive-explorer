import { EventChannel  } from '/models/event-bus/event-channel.model.js'
import { EventQueue  } from '/models/event-bus/event-queue.js'

export class Registry {
  constructor() {}
  unregister = () => {}
}

export class Subscriber {
  constructor() {}
  callable = () => {}
}

export class IEventBus {
  dispatch = (event, arg) => {}
  register = (event, callback) => {}
}

export class EventBus extends IEventBus {
  constructor() {
    super();
    this.eventQueue = new EventQueue(100);
    
    this.subscribers;

    this.subscribers = {};
  }

  static nextId = 0;
  static instance = undefined;

  static getInstance() {
    if (this.instance === undefined) {
      this.instance = new EventBus();
    }

    return this.instance;
  }

  dispatch(event, arg) {
    const subscriber = this.subscribers[event];

    if (subscriber === undefined) return;
    

    Object.keys(subscriber).forEach(key => subscriber[key](arg));
  }

  register(event, callback) {
    const id = this.getNextId();
    if (!this.subscribers[event]) this.subscribers[event] = {};

    this.subscribers[event][id] = callback;

    return {
      unregister: () => {
        delete this.subscribers[event][id];

        if (Object.keys(this.subscribers[event]).length === 0)
          delete this.subscribers[event];
      }
    };
  }

  getNextId() {
    return EventBus.nextId++;
  }
}
