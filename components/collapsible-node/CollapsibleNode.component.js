import {CHANNEL_KEY} from '../MessageRelayer.js'
export class CollapsibleNode {
  constructor(model, parent) {
  this.updateFSChannel = (msg) => Relayer.sendToChannel(CHANNEL_KEY.FileSystem, msg)
    this._childNodes;
    this._nodes;
    this._template = document.querySelector(`#fs-node-template`).content.cloneNode(true); // temp.firstElementChild.cloneNode(true);
    this.self = this._template.querySelector('.node');
    this.button = this._template.querySelector('.collapsible-button');
    this.content = this._template.querySelector('.collapsible-content');
    this.parent = parent
    this.isRoot = model.isRoot || false;

    this._id = model.id;
    this.nodeType = model.nodeType;
    this.name = model.name || 'Unnamed'
    this.nodes = new Map(this.childNodes.filter(_ => _.classList.contains('node')).map(_ => [_, this.createNode.bind(this)(_)]))
    this.active = false;

    this.childClickHandler = this.handleChildButtonClick.bind(this);
    this.content.addEventListener('child-click', this.childClickHandler);
    this.clickListener = this.handleButtonClick.bind(this);
    this.button.addEventListener('click', this.clickListener);
  };

  createNode(model = {}, callback = (a, b) => {}) {
    const n = new CollapsibleNode(model, this);
    this.nodes.set(n.self, n)
    this.append(n)

    if (callback) callback(n)
    this.hasContent = true
    return n;
  }

  detachNode(element, callback = (n, p) => {}) {
    let n = this.getTargetNode(element);
    let p = n.parent;

    if (n) {
      callback(n, p);

      n.button.removeEventListener('click', this.clickListener);
      n.content.removeEventListener('child-click', this.childClickListener);
      this.nodes.delete(element)
      p.removeChild(node.self)

      return p
    }
  }

  append(element, position, callback = (n, p) => {}) {
    if (position) { this.content.insertBefore(element.self, position); }
    else { this.content.appendChild(element.self); }

    callback(element);
    this.adjustToChildHeight.bind(this)(element.self.style.maxHeight)
    return element;
  }

  toggleActiveState(state) {
    this.self.dataset.active = state
  }

  buttonClicked(e) {
    return e.target === this.button || e.target.closest('.collapsible-button') === this.button
  }

  getTargetNode(e) {
    let t = e instanceof Event ? e.target : e;
    t = t.classList.contains('node') ? t : t.closest('.node');

    if (this.nodes.has(t)) { return this.nodes.get(t) }
    else return this;

    return null;
  }

  handleButtonClick(e) {
    if (!this.buttonClicked(e)) {
      return this.selected = false;
    };

    this.selected = true;
    this.active = !this.active;

    if (this.content.style.maxHeight) {
      this.content.style.maxHeight = null;
    } else {
      this.content.style.maxHeight = this.content.scrollHeight + "px";
    }

    const node = this.getTargetNode(e.target);

    console.log('~~~~~~this.getTargetNode(e.target)', this.getTargetNode(e.target))
    if (this.active) {

      const nodeClickEvent = new CustomEvent('node-click', { bubbles: true, detail: { action: 'node:active', payload: { name: node.name, nodeType: node.nodeType } } })
      console.log('+++++ nodeClickEvent in handle clixl +++++', nodeClickEvent, this)
      this.self.closest('.collapsible-content').appendChild(node.self)//.dispatchEvent(nodeClickEvent)
    }
    else {

      const nodeClickEvent = new CustomEvent('node-click', {
        bubbles: true,
        detail: {
          action: 'node:inactive',
          payload: { id: node.id, name: node.name, nodeType: node.nodeType }
        }
      })
      this.self.closest('#file-system').dispatchEvent(nodeClickEvent)

    }

    let fs = this.self.closest('#file-system')
    console.log('this.self.closest(#file-system)', { fs })
    
    
    const childClickEvent = new CustomEvent(
      'child-click',
      {
        bubbles: true,
        detail: {
          action: 'folder:open',
          data: { event: e }
        }
      })
    // fs.self.dispatchEvent(childClickEvent)
  }

  handleChildButtonClick(e) {
    this.adjustToChildHeight(e.detail.childMaxHeight);
  }

  adjustToChildHeight(childMaxHeight = '') {
    const childHeight = childMaxHeight;
    this.content.style.maxHeight = `${parseInt(this.content.scrollHeight) + parseInt(childHeight)}px`;
  }

  scrollToContent(node) {
    node.content.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
    return node;
  }

  scrollTo(node) {
    if (node.isRoot) { return }
    const fs = document.querySelector('#file-system')

    node.self.scroll({
      top: node.scrollHeight, //scroll to the bottom of the element
      behavior: 'smooth', //auto, smooth, initial, inherit
    });

    return node
  }

  get hasContent() { return this.nodes.size > 0 }

  set hasContent(val) { this.self.dataset.hasContent = val; }

  get nodes() { return this._nodes }

  set nodes(val) {
    this._nodes = val
    this.hasContent = this.nodes.size ? true : false;
  }

  get childNodes() { return [...this.content.children].filter(_ => _.classList.contains('node')) }

  set childNodes(val) { this._childNodes = val }

  get dataset() { return this.self.dataset }

  get id() {
    console.log('get id() in ---- CollNode---- ', this, this._.id);
    return this._.id
  }

  set id(val) {
    this._id = val
    this.self.id = val
  }

  get name() { return this._name }

  set name(val) { this.button.textContent = val }

  get nodeType() { return this.self.dataset.nodeType }

  set nodeType(val) { this.self.dataset.nodeType = val }

  get active() { return this._active };

  set active(newValue) {
    this._active = newValue
    this.toggleActiveState(this.active);

    if (!this.active) {
      this.nodes.forEach((ch) => {
        ch.active = false;
        ch.content.style.maxHeight = null
      })
    }
  }
}
