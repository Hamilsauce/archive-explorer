const { forkJoin, Observable, iif, BehaviorSubject, AsyncSubject, Subject, interval, of , fromEvent, merge, empty, delay, from } = rxjs;
const { flatMap, reduce, groupBy, toArray, mergeMap, switchMap, scan, map, tap, filter } = rxjs.operators;
const { fromFetch } = rxjs.fetch;

export class Topbar {
  constructor(selector, options) {
    this.self = document.querySelector(selector);
    this.breadcrumbs = this.self.querySelector('#fs-topbar-breadcrumbs');
    this.createFolderButton = this.self.querySelector('#folder-create-icon');

    this.pathChannel = Relayer.connect(this, 'fs', )

    const io$ = merge(this.pathChannel.messages$
        .pipe(
          tap(x => console.log('pathChannel.messages$', x)),
          filter(_ => _._action === 'pathchange'),
          tap((msg) => this.breadcrumbs.textContent = msg._payload.path.replace('root', '/').replace('//', '/')),
        ),
        fromEvent(this.createFolderButton, 'click').pipe(
          tap(x => this.pathChannel.send({
            action: 'folder:create',
            source: this,
            payload
          })),
        )
      )
      .subscribe()
  }
}
