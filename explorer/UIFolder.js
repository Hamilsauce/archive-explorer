import { UIElement } from './UIElement.js';

export class UIFolder {
  constructor(model, attributes = {}) {
    super('li', attributes);
    this._nodeType = 'folder';
    this._childNodes = new Map();

    super.render()
  }

  template(opts) {
    return `  
        <div class="node-content">${this._name || this.content}</div>
        <ul class="child-list">${
          this._nodeType === 'folder' ? this.children
            .reduce((list, curr, i, arr) => {
              return  list + `\n<li class="box">${curr.name}</li>`
          }, '') : ''
        }</ul>
      `;
  }

  get nodeContent() { return this.self.querySelector('.node-content') };
  
  get childList() { return this.self.querySelector('.child-list') };
  // set nodeContent(newValue) { this._nodeContent = newValue };
  
  get name() { return this._name };
  set name(newValue) { this._name = newValue };
}
