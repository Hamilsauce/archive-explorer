import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';
// import localStore  from '/_datastore/localStore.js'
import { localStore } from '/_datastore/localStore.js'
const { date, array, utils, text } = ham;
const { iif, BehaviorSubject, ReplaySubject, AsyncSubject, Subject, interval, of , fromEvent, merge, empty, delay, from } = rxjs;
const { distinctUntilChanged, throttleTime, mergeMap, switchMap, scan, take, takeWhile, map, tap, startWith, filter, mapTo } = rxjs.operators;
const { fromFetch } = rxjs.fetch;


const seed = {
  users: {
    tom: { id: 'tom', firstName: 'tom', lastName: 'mot', age: 47 },
    john: { id: 'john', firstName: 'john', lastName: 'ham', age: 75 },
    jill: { id: 'jill', firstName: 'jill', lastName: 'jam', age: 33 },
    butt: { id: 'butt', firstName: 'butt', lastName: 'hole', age: 5 },
  },
  chats: {
    chat1: { name: 'Awesome chat', members: ['jill', 'tom'] },
    chat2: { name: 'dumb chat', members: ['john', 'butt'] },
    chat3: { name: 'solo chat', members: ['butt'] },
  },
}

export class RxDataStore {
  constructor(seed) {
    this.collections = Object.entries(seed)
      .reduce((acc, curr, i) => {
        return acc.set(curr[0], { _source$: new BehaviorSubject(curr[1]), _data: curr[1] })
      }, new Map());
    
    this.lStore = localStore
   
    this.lStoreUsers = this.lStore.connect('users');

    this.lStoreUsers.data$.pipe(
        tap(x => console.log('LSTOREUSERS', x)),
      )
      .subscribe()
  }

  update(collection, value) {
    value.id = value.id ? value.id : utils.uuid();
    const oldValue = collection._data[value.id]
    
    collection._source$.next({
      [value.id]: { ...value }
    });
  }

  remove(collection, id) {
    collection._source$.next({
      [id]: undefined
    });
  }

  connect(collName) {
    const coll$ = this.collections.get(collName);
    const update = (coll$) => (updateObj) => this.update(coll$, updateObj)
    const remove = (coll$) => (id) => this.remove(coll$, id)
  
    return {
      get: coll$._source$.asObservable().pipe(
        scan((oldValue, newValue) => {
          return { ...oldValue, ...newValue }
        }),
        distinctUntilChanged((prev, curr) => {
          if (Array.isArray(prev)) {
            return prev.reduce((isChangeDetected, [key, value], i) => {
              return ![curr[key], false].includes(value) ? true : false;
            });
          }

          const changed = Object.entries(prev)
            .reduce((isChangeDetected, [key, value], i) => {
              return [curr[key], false].includes(value) || isChangeDetected !== true ? false : true;
            });
          return changed
        }),
        tap(this.lStoreUsers.set),
      ),
      set: update(coll$),
      remove: remove(coll$),
    }
  }
} { RxDataStore }

// const db = new RxDataStore(seed);
// const usersCxn = db.connect('users')
// const chatsCxn = db.connect('chats')
// const userData$ = usersCxn.get
// const chatsData$ = chatsCxn.get
// userData$.subscribe(_ => console.log('usersCxn.get subscribe', _));
// chatsData$.subscribe(_ => console.log('chatsData$.get subscribe', _));
// setTimeout(() => {
//   usersCxn.set({ id: 'john1', model: 'epeel' });
//   usersCxn.set({ id: 'jill', waist: 'huge' });
//   usersCxn.set({ id: 'john', age: 0 });
//   usersCxn.set({ id: 'jill', waist: 'small' });
//   usersCxn.set({ id: 'fhvv', waist: 'fuck' });
//   usersCxn.remove('tom')
//   usersCxn.set({ id: 'fhvv', waist: 'fuck' });
//   usersCxn.set({ isCool: 'fhvv', name: 'Bonby' });
//   usersCxn.set({ isCool: 'false', name: 'djdk' });
//   usersCxn.set({ isCool: 'true', name: 'poopy' });
//   // usersCxn.set({ isCool: 'true', name: 'Cunt' });
//   console.log('updayed john', );
// }, 2000)
// // carService.car$.subscribe(console.log);
// // carService.updateCar({ make: 'BMV' });
// // carService.updateCar({ model: 'epeel' });
// // carService.update('john', { model: 'epeel' });
// // console.log('carService', [...carService.collections])
