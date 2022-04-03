import { FileSystemModel } from './fs-all.js'
import { UIElement } from './UIElement.js'
import { Message, ACTIONS } from './EventBus.js'

const { forkJoin, Observable, iif, BehaviorSubject, AsyncSubject, Subject, interval, of , fromEvent, merge, empty, delay, from } = rxjs;
const { flatMap, reduce, groupBy, toArray, mergeMap, switchMap, scan, map, tap, filter } = rxjs.operators;
const { fromFetch } = rxjs.fetch;

export class SimpleFSView extends FileSystemModel {
  constructor(messageChannel) {
    super();

    this.channel = messageChannel;
    this.self = document.querySelector('#fs-container');
    this.view = this.self.querySelector('#file-system');

    this.backButton = document.querySelector('#back-button');

    this.backButton.addEventListener('click', e => {
      const msg = new Message(ACTIONS.goBack, { id: null })
      this.channel.emit(msg)

      this.transitionView(this.restoreView())

      e.stopPropagation()
      e.preventDefault()
    });

    this.viewCache = []
    this.childMap = new Map()

    this.clicksByTarget$ = fromEvent(this.self, 'click')
      .pipe(
        groupBy(e => {
          const isNodeContentSource = [...e.path].some(el => el instanceof Element ? el.classList.contains('node-content') : false);
          const isChildListSource = [...e.path].some(el => el instanceof Element ? el.classList.contains('child-list') : false);
          const isBackButtonSource = [...e.path].some(el => el instanceof Element ? el.id === 'back-button' || el.id === 'back-button-icon' : false);

          if (isNodeContentSource) { return 'node-content' }
          if (isChildListSource) { return 'child-list' }
          if (isBackButtonSource) { return 'back-button' }
        }),
      );

    this.viewClicks$ = this.clicksByTarget$
      .pipe(
        filter(({ key }) => ['node-content', 'child-list'].includes(key)),
        mergeMap(group$ => group$
          .pipe(
            map(e => {
              const t = e.target.closest('.node')
              const isNodeContentSource = [...e.path].some(el => el instanceof Element ? el.classList.contains('node-content') : false);
              const isChildListSource = [...e.path].some(el => el instanceof Element ? el.classList.contains('child-list') : false);

              if (isNodeContentSource) {
                this.activateFolder(t);
                this.expandFolder(t)
              }

              return { node: t, event: e }
            }),
            filter(({ event }) => event.target.classList.contains('child-list')),
            filter(({ node }) => node.dataset.nodeType === 'folder'),
            map(({ node }) => new Message(ACTIONS.openFolder, { id: node.dataset.nodeId })),
          )
        )
      ).subscribe(this.channel.emit)

    this.currentFolder$ = this.channel.messages$
      .pipe(
        tap(this.cacheView.bind(this)),
        tap(this.render.bind(this)),
      ).subscribe()
  }

  render(folder) {
    const frag = new DocumentFragment()

    folder.fsChildren
      .forEach((f, i) => {
        f.name = f.name === 'root' ? 'Music Exchange' : f.name;

        const node = this.createNode.bind(this)(f.name, {
          classList: ['transparency', 'node'],
          dataset: {
            selected: 'false',
            open: 'false',
            nodeType: f.nodeType,
            nodeId: f.id,
          }
        });

        node.model = f;
        frag.appendChild(node);
      });

    this.transitionView(frag);
  }

  createNode(name, attrs) {
    const node = document.createElement('li');

    node.innerHTML = `  
      <div class="node-content">${name || 'unnamed folder'}</div>
      <ul class="${attrs.dataset.nodeType === 'folder' ? 'child-list' : 'file-details'}"></ul>
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

  transitionView(frag) {
    this.cacheView();
    this.toggleViewAnimation()

    setTimeout(() => {
      this.html = ''
      this.toggleViewAnimation()

      if (typeof frag === 'string') this.html = frag
      else this.view.appendChild(frag);
    }, 500)
  }

  activateFolder(folder) {
    const sel = folder.dataset.selected === 'true' ? false : true
    this.childNodes.forEach(_ => _.dataset.selected = false)

    folder.dataset.selected = sel
    return folder
  }

  toggleBackButtonActive() {
    if (this.viewCache.length > 1) {
      this.backButton.classList.remove('inactive')
    } else {
      this.backButton.classList.add('inactive')
    }
  }

  toggleViewAnimation() {
    if (this.view.classList.contains('slideup')) {
      this.view.classList.remove('slideup')
      this.view.classList.add('slidedown')
    } else {
      this.view.classList.remove('slidedown')
      this.view.classList.add('slideup')
    }
  }

  expandFolder(folder) {
    const openState = folder.dataset.open === 'true' ? false : true
    folder.dataset.open = openState

    return folder
  }

  cacheView() {
    const fragment = this.html
    this.viewCache.push(fragment)
  }

  restoreView() {
    if (this.viewCache.length === 0) return;
    const v = this.viewCache[this.viewCache.length - 1]
    this.viewCache.pop();

    return v
  }

  displayEmptyMessage() {
    this.cacheView()

    this.html = `
      <li class="transparency fs-message">
        Current Folder is Empty!
      </li>
    `;
  }

  get childNodes() { return [...this.view.children].filter(_ => _.classList.contains('node')) };


  get dataset() { return this.view.dataset }

  get viewMode() {
    return !this.dataset.viewMode ? 'grid' : this.dataset.viewMode
  }

  set viewMode(v) {
    this.dataset.viewMode = v
  }

  get isEmpty() {
    return this.dataset.isEmpty === 'true' ? true : false;
  }

  set isEmpty(v) {
    this.dataset.isEmpty = v
    if (v === true) this.displayEmptyMessage()
    else this.view.querySelector('.fs-message').remove()
  }

  get html() { return this.view.innerHTML };

  set html(newValue) { this.view.innerHTML = newValue };
}
