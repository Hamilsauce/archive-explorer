const { asObservable, forkJoin, Observable, iif, BehaviorSubject, AsyncSubject, Subject, interval, of , fromEvent, merge, empty, delay, from } = rxjs;
const { distinctUntilChanged, flatMap, reduce, groupBy, toArray, mergeMap, switchMap, scan, map, tap, filter } = rxjs.operators;
const { fromFetch } = rxjs.fetch;

export class FirestoreService {
  constructor(db) {
    this.currentFolder
    this.db = db;

    this.files = this.db.collection('files')

    this.folders = this.db.collection('folders')

    this._firestoreResponse$ = new Subject()

    this.firestoreResponse$ = this._firestoreResponse$.asObservable()
      .pipe(
        distinctUntilChanged((a, b) => a.id === b.id),
        // tap(x => console.log('AFTER DISTINCY JN FS', x)),
      );
  }

  async file(id) { return await this.files.doc(id) }

  async folder(id) {
    this._firestoreResponse$.next(
      (
        await this.getFolderChildrenData((await this.folders.doc(id).get()).data())))
  }

  async getFolderChildrenData(docData) {
    const folder = docData;

    folder.fsChildren = []


    const folderChildrenQuery = await this.folders
      .where('parentId', '==', folder.id)
      .get();

    const fileChildrenQuery = await this.files
      .where('parentId', '==', folder.id)
      .get();

    folder.fsChildren = [
      ...folder.fsChildren,
      ...folderChildrenQuery.docs.map(doc => ({
        ...doc.data(),
      })),
      ...fileChildrenQuery.docs.map(doc => ({
        ...doc.data(),
      }))
    ]

    return folder;
  }

  getFolderChildrenSnap(doc) {
    // console.log('-----doc', doc)
    let folder = doc.data();
    folder.children = []


    let folderChildren = foldersCollectionRef
      .where('parentId', '==', folder.id)

    let fileChildren = fileCollectionRef
      .where('parentId', '==', folder.id)

    folderChildren.onSnapshot(collSnap => {
      folder.children = [
      ...folder.children,
      ...collSnap.docs.map(doc => ({
          ...doc.data(),
        }))
    ]
    })

    fileChildren.onSnapshot(collSnap => {
      folder.children = [
      ...folder.children,
      ...collSnap.docs.map(doc => ({
          ...doc.data(),
        }))
    ]
    })

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
