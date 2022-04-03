import { Relayer, CHANNEL_NAMES } from '/MessageRelayer.js';
import { FileSystem } from './FileSystem.js';
import { arraySeed, treeSeed } from '/seed.js'
// import { seedWithIds } from '/data/arraySeedWithIds.js'

import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';
const { download, date, array, utils, text } = ham;

const { forkJoin, Observable, iif, BehaviorSubject, AsyncSubject, Subject, interval, of , fromEvent, merge, empty, delay, from } = rxjs;
const { flatMap, reduce, groupBy, toArray, mergeMap, switchMap, scan, map, tap, filter } = rxjs.operators;
const { fromFetch } = rxjs.fetch;

const uuid = utils.uuid;

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


export class App {
  constructor() {
    this.nodes = [];
    // this.relayer = Relayer;
    // this.topbar = new Topbar('#fs-topbar');
    // tap(x => console.log('FILE SYSTEM HEARD MESSAGE on FS CHANNEL', { x }))
    // this.fs = new FileSystem('#file-system', { seeds: { array: arraySeed, tree: treeSeed, } });
console.log('this.topbar', this.topbar)
    // this.fs = Object.assign(this.fs, {
    //   geoLocation$: this.geoLocation$
    // })
  }

  // get geoLocation$() {
  //   return new Observable((observer) => {
  //     try {

  //       navigator.geolocation.getCurrentPosition(
  //         position => {
  //           observer.next({
  //             clientGPS: {
  //               radius: position.coords.accuracy || 10,
  //               altitude: position.coords.altitude || 0,
  //               speed: position.coords.speed || 0,
  //               latitude: position.coords.latitude,
  //               longitude: position.coords.longitude,
  //               dateTime: new Date(position.timestamp).toUTCString(),
  //             },

  //           });
  //           observer.complete();
  //         },
  //         error => observer.error(error)
  //       );
  //     } catch (e) {
  //       console.log({ e });
  //     }
  //   });
  // }
}


// const addIdsArr = (seed) => {
//   let seedWithIds;
//   if (Array.isArray(seed)) {

//     let cursor = 0;

//     seed.forEach((item, i) => {
//       item.id = utils.uuid();

//       if (item.children && item.children.length > 0) {
//         item.children.forEach((ch, i) => {

//           ch.id = utils.uuid();
//         });
//       }

//     });

//   }
//   return seed;
// }

// const addIdsTree = (seed) => {
//   seed.forEach((item, i) => {
//     item.id = utils.uuid();

//     if (item.children && item.children.length > 0) {
//       item.children.forEach((ch, i) => {

//         ch.id = utils.uuid();
//       });
//     }

//   });

//   return seed;
// }
