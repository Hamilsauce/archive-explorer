import { Node } from './node.model.js';


export class File extends Node {
  type = 'text';
  mimeType = 'txt';
  textContent = '';
  source = null;

  constructor(name = '', textContent = '', source = null) {
    super(name || 'un-named file');
    this.textContent = textContent;
    this.source = source;
  }

  get textContent() {
    return this.textContent;
  }

  set textContent(content) {
    this.textContent = `${content || ''}`;
  }

  get source() {
    return this.source;
  }

  set source(newSource) {
    this.source = newSource;

    if (newSource && newSource.type) {
      let [type, mime] = newSource.type.split('/');
      mime = mime.match(/[\w-]+/g);

      this.type = type || 'text';
      this.mimeType = !mime || mime[0] === 'plain' ? 'txt' : mime[0];
    }
  }

  get type() {
    return this.type;
  }

  get mimeType() {
    return this.mimeType;
  }

  get copy() {
    return new File(`${this.name} copy`, this.textContent, this.source);
  }
}
