import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';
const { event, array, utils, text } = ham;
import { SimpleEventBus, Message, ACTIONS } from './EventBus.js'
import { UIElement } from './UIElement.js'
import { SimpleFSView } from './SimpleFSView.js'
import { SimpleStore } from './SimpleStore.js'
import { Path } from './Path.js'

// import { FileSystemView } from './FileSystemView.js'
const { forkJoin, Observable, iif, BehaviorSubject, AsyncSubject, Subject, interval, of , fromEvent, merge, empty, delay, from } = rxjs;
const { flatMap, reduce, groupBy, toArray, mergeMap, switchMap, scan, map, tap, filter } = rxjs.operators;
const { fromFetch } = rxjs.fetch;


export class App {
  #EVENT_BUS_KEY
  constructor(db) {
    this.#EVENT_BUS_KEY = 'key123'

    this.store = new SimpleStore(db, {
      currentPath: [],
      currentFolderId: null,
      files: {},
      folders: {},
    });

    this.path = new Path({}, this.store)

    this.currentPath$ = this.path.currentPath$
      .pipe(
        // tap(x => console.log('this.currentPath$ APP', x))
      );

    this.currentPath$.subscribe()

    this.viewEvents$ = new Subject()
      .pipe(
        filter(msg => {
          const isMsg = msg instanceof Message
          if (!isMsg) console.error('Received non-message in App.viewEvents$;\n Must send Message instance; received: ', msg)
          return isMsg;
        }),
        groupBy(msg => msg.action),
      );

    this.openFolder$ = this.viewEvents$
      .pipe(
        filter(gr$ => gr$.key === 'open-folder'),
        // tap(x => console.log('openFolder$', x)),
        mergeMap(group$ => group$
          .pipe(
            tap(({ payload }) => this.path.push(this.store.getFolder(payload.id))),
          )
        )
      ).subscribe()

    this.goBack$ = this.viewEvents$
      .pipe(
        filter(gr$ => gr$.key === 'go-back'),
        mergeMap(group$ => group$
          .pipe(
            tap(() => this.path.pop()),
            // tap(x => console.log('go    Back$', x)),
          )
        )

        // mergeMap(group$ => group$
        //   .pipe(
        //     // tap(() => this.path.pop()),
        //   )
        // )
      ).subscribe()

    this.createFolder$ = this.viewEvents$
      .pipe(
        filter(gr$ => gr$.key === 'create-folder'),
        // tap(x => console.log('createFolder$', x)),
        mergeMap(group$ => group$.pipe(
          tap(({ payload }) => this.store.getFolder(payload.id)),
        ))
      ).subscribe()

    this.fsv = new SimpleFSView({
      emit: (v) => this.viewEvents$.next(v),
      // messages$: this.currentPath$.pipe(map(_ => _[_.length - 1]))
      messages$: this.store.activeQuery$,
    });

    this.ui = {
      root: document.querySelector('#app'),
      breadCrumbs: document.querySelector('#fs-topbar-breadcrumbs'),
      createFolderButton: document.querySelector('#folder-create-button'),
      getRootButton: document.querySelector('#get-root-button'),
      viewModeButton: document.querySelector('#view-mode-button'),
      fs: document.querySelector('#file-system'),
    }

    this.ui.createFolderButton.addEventListener('click', e => {
      const node = this.createFolder({
        classList: ['transparency', 'node'],
        dataset: {
          selected: 'false',
          open: 'false',
          nodeType: 'folders',
          nodeId: utils.uuid(),
        }
      })

      this.ui.fs.appendChild(node);
      node.scrollIntoView()
    });

    this.ui.viewModeButton.addEventListener('click', e => {
      this.fsv.viewMode = this.fsv.viewMode === 'list' ? 'grid' : 'list';
    });

    this.ui.getRootButton.addEventListener('click', e => {
      this.store.getFolder(ROOT_ID)
    });

    event.longPress(this.fsv.self, 700, e => {
      const isNodeContentSource = [...e.path].some(el => el instanceof Element ? el.classList.contains('node-content') : false);
      if (!isNodeContentSource) return
      const t = e.target //.closest('.node-content')
      const content = t //.querySelector('.node-content');

      this.activateFolder(t);
      content.contentEditable = true;
      content.focus();
      event.selectAllContent(content);

      if (window.getSelection) {
        const selection = window.getSelection();
        const range = document.createRange();

        range.selectNodeContents(content);
        selection.removeAllRanges();
        selection.addRange(range);
      }


      const onBlur = (e) => {
        e.target.textContent = e.target.textContent.trim()
        e.target.contentEditable = false;

        e.target.removeEventListener('blur', onBlur)
      }

      content.addEventListener('blur', onBlur)
    })

    // setTimeout(() => {
    //   this.self = new UIElement('main', 'app', null, { id: 'app' })

    //   this.self.template = () => document.querySelector('#app').innerHTML

    //   this.self.render()
    //   this.self.parent = this.ui.fs.parentElement

    //   console.log('this.self rendered', );
    // }, 2000)

  }

  init() {}

  handleCreateFolder(e) {
    const folder = this.createFolder(nodeAttr)
    this.ui.fs.appendChild(folder);
  }

  isNodeEventSource(e) {
    if (!e) return;
    return [...e.path].some(el => el instanceof Element ? el === this.self : false);
  }


  addViewComponent() {}

  createFolder(attrs) {
    const node = document.createElement('li');
    node.innerHTML = `  
        <div class="node-content">${'unnamed folder'}</div>
        <ul class="child-list"></ul>
      `;

    if (attrs) {
      for (let attr of Object.keys(attrs)) {
        if (attr === 'dataset') { Object.entries(attrs[attr]).forEach(([prop, val]) => node.dataset[prop] = val) }
        else if (attr === 'classList') { node.classList.add(...attrs[attr], 'node') }
        else if (attr === 'style') {
          if (typeof attrs[attr] === 'string') node.style = `${node.style} ${attrs[attr]}`
          else Object.entries(attrs[attr]).forEach(([prop, val]) => node.style[prop] = val);
        }
        else node.setAttribute(attr, attrs[attr])
      }
    }
    return node;
  }

  editFolder(attrs) {
    const node = document.createElement('li');

    node.innerHTML = `  
        <div class="node-content">${'unnamed folder'}</div>
        <ul class="child-list"></ul>
      `;

    if (attrs) {
      for (let attr of Object.keys(attrs)) {
        if (attr === 'dataset') { Object.entries(attrs[attr]).forEach(([prop, val]) => node.dataset[prop] = val) }
        else if (attr === 'classList') { node.classList.add(...attrs[attr], 'node') }
        else if (attr === 'style') {
          if (typeof attrs[attr] === 'string') node.style = `${node.style} ${attrs[attr]}`
          else Object.entries(attrs[attr]).forEach(([prop, val]) => node.style[prop] = val);
        }
        else node.setAttribute(attr, attrs[attr])
      }
    }
    return node;
  }

  get childNodes() { return [...this.ui.fs.children].filter(_ => _.classList.contains('node')) };
  set prop(newValue) { this._prop = newValue };
}
