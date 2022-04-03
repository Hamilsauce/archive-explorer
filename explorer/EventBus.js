import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';
const { date, array, utils, text } = ham;
const { asObservable, forkJoin, Observable, iif, BehaviorSubject, AsyncSubject, Subject, interval, of , fromEvent, merge, empty, delay, from } = rxjs;
const { distinctUntilChanged, flatMap, reduce, groupBy, toArray, mergeMap, switchMap, scan, map, tap, filter } = rxjs.operators;
const { fromFetch } = rxjs.fetch;
export const ACTIONS = {
  openFolder: 'open-folder',
  goBack: 'go-back'
}


export class Message {
  #action
  #payload
  #id

  constructor(action, payload = {}) {
    if (!action) throw new Error('Message needs a action')
    this.#action = action;
    this.#payload = payload;
    this.#id = utils.uuid()
  }
  get action() { return this.#action }
 
  get payload() { return this.#payload }
 
  get id() { return this.#id }

}

const actions = new Map()

// FS View action: Open(payload: id) > to store
// FS View action: Rename(id, new name) > to store
// FS View action: GoBack(payload: null) > store
// Topbar actions: Create

export class SimpleEventBus {
  constructor() {
    this.viewEvents$ = new Subject();


    this.messages$ = this.viewEvents$.asObservable()
      .pipe(
        filter(({ type }) => type),
        distinctUntilChanged(),
        map((msg) => {
          // return new Message({ ...msg, id: utils.uuid() })
        }),
      );
  };

  // setEventSources(eventType, listener) {
  //   return this.messages$
  //     .pipe(
  //       filter(msg => msg.type === eventType),
  //       distinctUntilChanged(),
  //     );
  // }

  // register(eventType, listener) {
  //   return this.messages$
  //     .pipe(
  //       filter(msg => msg.type === eventType),
  //       distinctUntilChanged(),
  //     );
  // }

  // send(eventType, payload) {
  //   return this.messageQueue$.next(new Message(eventType, payload))
  // }
}




// class EventBus {
//   constructor() {
//     this.messageQueue$ = new Subject();

//     this.messages$ = this.messageQueue$.asObservable()
//       .pipe(
//         filter(({ type }) => type),
//         distinctUntilChanged(),
//         map((msg) => {
//           // return new Message({ ...msg, id: utils.uuid() })
//         }),
//       );
//   };

//   register(eventType, listener) {
//     return this.messages$
//       .pipe(
//         filter(msg => msg.type === eventType),
//         distinctUntilChanged(),
//       );
//   }

//   send(eventType, payload) {
//     return this.messageQueue$.next(new Message(eventType, payload))
//   }
// }

// export default new EventBus()
