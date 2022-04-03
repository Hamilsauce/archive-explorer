import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';

export class UIElementAttributes {
  constructor() {
    this.id = ''

    this.classList = []

    this.style = {
      // style/css attrs
    }

    this.dataset = {
      // dataset
    }

  }
  get style() { return this._style };
  set style(newValue) { this._style = newValue };

  get attributes() { return this._attributes };
  set attributes(newValue) { this._attributes = newValue };

  get data() { return this._data };
  set data(newValue) { this._data = newValue };
}


export class UIElement {
  constructor(tag = 'div', attributes = new UIElementAttributes()) {
    this.view = document.createElement(tag);
    // this.name = name;
    // this._parent = parent;
    this.attributes = attributes;

  }

  template() { /* To be re-assigned by descendant class */ }

  render() {
    this.view.innerHTML = this.template();

    this.setAttrs();
    return this.view
  }

  setAttrs() {
    if (this.attributes) {
      const attrs = this.attributes;

      for (let attr of Object.keys(attrs)) {
        if (attr === 'dataset') { Object.entries(attrs[attr]).forEach(([prop, val]) => this.view.dataset[prop] = val) }
        else if (attr === 'classList') { this.view.classList.add(...attrs[attr], 'node') }
        else if (attr === 'style') {
          if (typeof attrs[attr] === 'string') this.view.style = `${this.view.style} ${attrs[attr]}`
          else Object.entries(attrs[attr]).forEach(([prop, val]) => this.view.style[prop] = val);
        }
        else this.view.setAttribute(attr, attrs[attr])
      }
    }
    return this.view
  }

  setActiveState(status = '') {
    this.activeState = status;
    return this.activeState
  }

  isEventSource(e) {
    if (!e) return;
    return [...e.path].some(el => el instanceof Element ? el === this.view : false);
  }

  classList(keyword, ...classes) {
    if (classes.length === 0 || !['add', 'a', 'r', 'remove'].includes(keyword)) return;
    keyword = keyword === 'a' ?
      'add' : keyword === 'r' ?
      'remove' : keyword

    this.view.classList[keyword](...classes)
  }

  addClasses(...classes) {
    this.view.classList.add(...classes)
    return this;
  }

  setSize({ width, height }) {
    this.style.width = width
    this.style.height = height
  }

  get html() { return this.view.innerHTML }

  set html(html) { this.view.innerHTML = html }

  get boundingBox() { return this.view.getBoundingClientRect() }

  get top() { return this.boundingBox.top }

  get right() { return this.boundingBox.right }

  get bottom() { return this.boundingBox.bottom }

  get left() { return this.boundingBox.left }

  get x() { return this.boundingBox.x }

  get y() { return this.boundingBox.y }

  get width() { return this.boundingBox.width }

  get height() { return this.boundingBox.height }

  get centerY() { return this.top + (this.bottom - this.top) / 2 }

  get centerX() { return this.left + (this.right - this.left) / 2 }

  get centroid() { return { x: this.centerX, y: this.centerY } }

  get size() { return { width: this.width, height: this.height, } }

  get coords() { return { x: this.x, y: this.y, } }

  get position() { return { x: this.x, y: this.y, width: this.width, height: this.height, } }

  get dataset() { return this.view.dataset }

  get parentElement() { return this.view.parentElement }

  get children() { return [...this.view.children] }

  get parent() { return this._parent }

  set parent(newParent) {
    if (newParent !== this.parent) {
      const prevParent = this.parent;
      this._parent = newParent;

      if (prevParent) prevParent.removeChild(this.view)
      if (newParent) newParent.appendChild(this.view)
    }
  }

  get style() { return this.view.style }

  set style(newValue) { this.view.style = newValue }

  get textContent() { return this.view.textContent }

  set textContent(newValue) { this.view.textContent = newValue }

  get isSelected() { return this.dataset.isSelected === 'true' ? true : false }

  set isSelected(newValue) { this.dataset.isSelected = newValue }

  get isActive() { return this.dataset.isActive === 'true' ? true : false }

  set isActive(newValue) { this.dataset.isActive = newValue }
}
