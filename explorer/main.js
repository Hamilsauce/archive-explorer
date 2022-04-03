// import { App } from './App.js';
// const { forkJoin, Observable, iif, BehaviorSubject, AsyncSubject, Subject, interval, of , fromEvent, merge, empty, delay, from } = rxjs;
// const { flatMap, reduce, groupBy, toArray, mergeMap, switchMap, scan, map, tap, filter } = rxjs.operators;
// const { fromFetch } = rxjs.fetch;

// // const app = document.querySelector('#app');
// // const appHeader = document.querySelector('#app-header')
// // const appBody = document.querySelector('#app-body')
// // const topbar = document.querySelector('#fs-topbar')
// // const containers = document.querySelectorAll('.container')

// const app = new App()
// console.log('app', app)

// // const src = new Map(
// //   [
// //     ['key1', 'value1'],
// //     ['key2', 'value2'],
// //     ['key3', 'value3'],
// //     ['key4', 'value4'],
// //   ]);


// // from(src)
// //   .pipe(
// //     // map(x => x),
// //     tap(x => console.log('from(src)', x))
// //   )
// //   .subscribe()


// // setTimeout(() => {
// //   src.set('NEW Key1', 'bew val1')
// //   console.log(' ', );
// // }, 1000)

// // // function makeRangeIterator(start = 0, end = Infinity, step = 1) {
// // //   let nextIndex = start;
// // //   let iterationCount = 0;

// // //   const rangeIterator = {
// // //     next: function() {
// // //       let result;
// // //       if (nextIndex < end) {
// // //         result = { value: nextIndex, done: false }
// // //         nextIndex += step;
// // //         iterationCount++;
// // //         return result;
// // //       }
// // //       return { value: iterationCount, done: true }
// // //     }
// // //   };
// // //   return rangeIterator;
// // // }

// // function* makeRangeIterator(start = 0, end = 100, step = 1) {
// //   let iterationCount = 0;
// //   for (let i = start; i < end; i += step) {
// //     iterationCount++;
// //     yield i;
// //   }
// //   return iterationCount;
// // }

// // const it = makeRangeIterator(1, 10, 2);

// // let result = it.next();
// // while (!result.done) {
// //   console.log(result.value); // 1 3 5 7 9
// //   result = it.next();
// // }

// // console.log("Iterated over sequence of size: ", result.value); // [5 numbers returned, that took interval in between: 0 to 10]

// // console.log = (msg) => document.write(`${JSON.stringify(msg)}<br/>`);





// // function* folderPathStack(root = '/') {
// //   let root = root;
// //   let prevPath;
// //   let newPath;
// //   let paths = [];

  

// //   // for (let i = start; i < end; i += step) {
// //   //   iterationCount++;
// //   //   yield i;
// //   // }
// //   // return iterationCount;
// // }




// // const fibonacciGen = function*() {
// //   let v1 = 1;
// //   let v2 = 1;
// //   while (true) {
// //     const res = v1;
// //     v1 = v2;
// //     v2 = v1 + res;
// //     yield res;
// //   }
// // };
// // const fibonacciObservable = rxjs.from(fibonacciGen());

// // console.log("Sum of the first 10 even fibonacci numbers:");

// // fibonacciObservable // [1, 1, 2, 3, ...]
// //   .pipe(
// //     rxjs.operators.filter((e) => e % 2 === 0), // [2, 8, 34, 144, ...]
// //     rxjs.operators.take(10), // [2, 8, 34, ..., 832040]
// //     rxjs.operators.reduce((acc, e) => acc + e, 0) // [1089154]
// //   )
// //   .subscribe(console.log.bind(console));
