const { forkJoin, Observable, iif, BehaviorSubject, AsyncSubject, Subject, interval, of , fromEvent, merge, empty, delay, from } = rxjs;
const { distinctUntilChanged, flatMap, reduce, groupBy, toArray, mergeMap, switchMap, scan, map, tap, filter } = rxjs.operators;
const { fromFetch } = rxjs.fetch;

export class Path {
  constructor(root = { name: 'init', isRoot: true }, store) {
    this.currentPath = []

    // this.currentPath$ = new BehaviorSubject(this.currentPath)
    this.currentPath$ = new Subject()
      .pipe(
        distinctUntilChanged(),
        // tap(x => console.log('In Path', x)),
        tap(x => this.currentFolder = this.currentPath[this.currentPath.length - 1]),
      );

    this.store = store

    this.store.activeQuery$
      .pipe(
        map(x => x),
        filter(_ => _),
        tap(x => this.push(x)),
        // tap(x => console.log('PATH ACTIVE QUERY', { x }, this.currentPath)),
      )
      .subscribe(this.currentPath$.push)


    this.currentPathIdMap = this.currentPath
      .map((node, i) => {
        return [node.id, node]
      });

    this.currentFolder = this.currentPath[this.currentPath.length - 1]
    this.previousPath = []
  };

  toPathString() {
    return this.currentPath
      .map((node, i) => node.name)
      .join('/')
  }

  pop() {
    // this.currentPath.push({ name: 'suk' })
    // console.log('in pop', this);
    if (this.currentPath.length > 1) {
      this.currentPath.pop()
    }
    this.currentPath$.next(this.currentPath)
  }

  push(v) {
    if (!v) return
    this.currentPath.push(v)
    this.currentPath$.next(this.currentPath)
    // console.log('in push', { v }, this);
  }

  getPath(item) {
    const collection = item.nodeType === 'folder' ? Store.folderMap : Store.fileMap
    const folderMap = Store.folderMap;

    let parentId = item.parentId
    let parent
    let path = item.name

    const p = this.currentPath
      .map((node, i) => {
        return node.name
      });

    while (parentId !== null) {
      parent = this.currentPathMap.get(parentId)
      parentId = parent.parentId
      path = parent.name + '/' + path
    }

    return path
  }
  // get currentPath() { return this._currentPath };
  // set currentPath(newValue) { this._currentPath = newValue };
}
