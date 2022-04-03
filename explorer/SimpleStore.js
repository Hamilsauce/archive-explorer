import { FirestoreService } from './FirestoreService.js'

const { forkJoin, Observable, iif, BehaviorSubject, AsyncSubject, Subject, interval, of , fromEvent, merge, empty, delay, from } = rxjs;
const { distinctUntilChanged, flatMap, reduce, groupBy, toArray, mergeMap, switchMap, scan, map, tap, filter } = rxjs.operators;
const { fromFetch } = rxjs.fetch;

const InitialState = {
  currentPath: [],
  currentFolderId: null,
  files: {},
  folders: {},
}

export class SimpleStore {
  constructor(db, initialState = {}) {
    this.fsService = new FirestoreService(db)
    
    this._stateSubject$ = new BehaviorSubject({
      state: {
        ...initialState
      }
    });

    this.activeQuery$  = this.fsService.firestoreResponse$
  }

  getFolder(id) {
    this.fsService.folder(id)
  }

  updateFolder(folder) {}
  
  updateFile(file) {}

  addFolder() {}
  
  addFile() {}

  select(key = '') {
    this._stateSubject$
      .pipe(
        map(state => state[key]),
        distinctUntilChanged(),
        // tap(x => console.log('TAP', x))
      );

  }

  get prop() { return this._prop };
  set prop(newValue) { this._prop = newValue };
}
