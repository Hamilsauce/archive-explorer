import db from './firebase/firebase.js'
import Store from './db/store.db.js'
import { App } from './explorer/App.js'

const { forkJoin, Observable, iif, BehaviorSubject, AsyncSubject, Subject, interval, of , fromEvent, merge, empty, delay, from } = rxjs;
const { flatMap, reduce, groupBy, toArray, mergeMap, switchMap, scan, map, tap, filter } = rxjs.operators;
const { fromFetch } = rxjs.fetch;

const app = new App(db)

app.init()

class FSStoreRx {
  constructor(db) {
    this.currentFolder
    this.db = db;
    this.files = this.db.collection('files')
    this.folders = this.db.collection('folders')
    this.currentQuery$ = new Subject()

  }

  async file(id) { return await this.files.doc(id) }


  async folder(id) {
    this.currentQuery$.next((await this.folders.doc(id).get()).data())
  }

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

}

// const fsService = new FSStoreRx(db)

// const query$ = fsService.currentQuery$

// query$.pipe(
//     map(x => x),
//     tap(x => console.log('TAP', x))
//   ).subscribe()


// fsService.folder2(ROOT_ID);
// console.log('fsRoot', await fsRoot)








// const foldersCollectionRef = db.collection('folders');
// const foldersCollectionRef = fsService.collection('folders')
// const fileCollectionRef = db.collection('files');

// const rootDoc = (await db.collection('folders').doc('8y17ynkbytusbghytq').get()).data()
// const rootFolderRef = foldersCollectionRef.doc('8y17ynkbytusbghytq')

// let rootDocData


// const subscribeToDoc = (docId, callback = (doc) => {}) => {
//   return foldersCollectionRef
//     .doc(docId)
//     .onSnapshot(callback)
// };
// const rootDocSubscription = await subscribeToDoc(ROOT_ID, listenToRootDoc)

// const rootDocSubscription = rootFolderRef.onSnapshot((doc) => {
//   rootDocData = doc.data();
//   console.log({ rootDocData });
// });

// setTimeout(() => {
//   console.log('root.reads', rootDocData.reads)
//   rootFolderRef.update({
//     reads: rootDocData.reads = rootDocData.reads ? rootDocData.reads += 1 : 1
//   })

//   console.log('update sent, rootDocData (listener)', rootDocData);
// }, 3000)




// const buildLookupTable = (collectionMap, fieldName) => {
//   return [...collectionMap.entries()].reduce(
//     (table, [k, v], i, coll) => {
//       let parentId = v.parentId
//       let parent
//       let path = v.name

//       while (parentId !== null) {
//         parent = Store.folderMap.get(parentId)
//         parentId = parent.parentId
//         path = parent.name + '/' + path
//       }

//       return table.set(path, k)
//       return table
//     }, new Map());
// }


// const buildPathToItem = (item) => {
//   const collection = item.nodeType === 'folder' ? Store.folderMap : Store.fileMap
//   const folderMap = Store.folderMap;

//   let parentId = item.parentId
//   let parent
//   let path = item.name

//   while (parentId !== null) {
//     parent = folderMap.get(parentId)
//     parentId = parent.parentId
//     path = parent.name + '/' + path
//   }

//   return path
// }


// const folderNameTable = buildLookupTable(Store.folderMap, 'name')

// console.log('folderNameTable', [...folderNameTable])
// const music2WorkOn = Store.folder('ql327yhsyidgakxnykw')
// // const music2WorkOn = Store.folder(folderNameTable.get('Music Exchange/3 face'))
// music2WorkOn.path = buildPathToItem(music2WorkOn)

// console.log('music2WorkOn', music2WorkOn)








// class Folder {
//   constructor(name = 'unnamed folder') {
//   };
//   get prop() { return this._prop };
//   set prop(newValue) { this._prop = newValue };
// }


// class FS {
//   constructor(seed) {
//     this.currentFolder

//   };
//   get prop() { return this._prop };
//   set prop(newValue) { this._prop = newValue };
// }
