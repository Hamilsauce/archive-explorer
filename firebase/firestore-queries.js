import db from '/firebase/firebase.js'
import Store from '/db/store.db.js'
import eventBus from '/explorer/EventBus.js'

const { forkJoin, Observable, iif, BehaviorSubject, AsyncSubject, Subject, interval, of , fromEvent, merge, empty, delay, from } = rxjs;
const { flatMap, reduce, groupBy, toArray, mergeMap, switchMap, scan, map, tap, filter } = rxjs.operators;
const { fromFetch } = rxjs.fetch;

class FirestoreService {
  constructor(db) {
    this.currentFolder
    this.db = db;
    this.files = this.db.collection('files')
    this.folders = this.db.collection('folders')
  }

  async file(id) { return await this.files.doc(id) }

  async folder(id) { return (await this.folderMap.get(id)).data() }

  getChildren(arrayOfIds) {}

  collection(key) { return this.db.collection(key) }

  deleteFile() {}

  add() {}

  findFile(comparer) {
    return this._collections.get('files').find(comparer)
  }

  findFolder(comparer) {
    return this._collections.get('folders').find(comparer)
  }

  get prop() { return this._prop };
  set prop(newValue) { this._prop = newValue };
}




const fsService = new FirestoreService(db)

const foldersCollectionRef = db.collection('folders');

const rootFolderRef = foldersCollectionRef.doc('8y17ynkbytusbghytq')
const rootDoc = (await db.collection('folders').doc('8y17ynkbytusbghytq').get()).data()

let rootDocData

const listenToRootDoc = doc => {
  rootDocData = doc.data();
}

const subscribeToDoc = (docId, callback = (doc) => {}) => {
  return foldersCollectionRef
    .doc(docId)
    .onSnapshot(callback)
};

const rootDocSubscription = rootFolderRef.onSnapshot((doc) => {
  rootDocData = doc.data();
  console.log({ rootDocData });
});


setTimeout(() => {
  console.log('root.reads', rootDocData.reads)
  rootFolderRef.update({
    reads: rootDocData.reads += 1
  })

  console.log('update sent, rootDocData (listener)', rootDocData);
}, 3000)




// console.log('music2WorkOn', music2WorkOn)








class Folder {
  constructor(name = 'unnamed folder') {


  };
  get prop() { return this._prop };
  set prop(newValue) { this._prop = newValue };
}


class FS {
  constructor(seed) {
    this.currentFolder

  };
  get prop() { return this._prop };
  set prop(newValue) { this._prop = newValue };
}
