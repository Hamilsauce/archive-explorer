export class FileSystem {
  constructor(selector, options) {
    // super(hostElement, options);
    /* multiple clicks outside of elements */
    this.self = document.querySelector('#file-system');

    this.self.addEventListener('click', e => {
      if (e.detail > 1) {
        const active = this.active();

        if (active && active !== e.target) {
          if (e.target.tagName === 'A' || e.target.tagName === 'SUMMARY') {
            return this.select(e.target, 'click');
          }
        }
        if (active) { this.focus(active); }
      }
    });

    window.addEventListener('focus', () => {
      const active = this.active();
      if (active) { this.focus(active); }
    });

    hostElement.addEventListener('focusin', e => {
      const active = this.active();
      if (active !== e.target) {
        this.select(e.target, 'focus');
      }
    });

    this.on('created', (element, node) => {
      if (node.selected) { this.select(element); }
    });

    hostElement.classList.add('select-tree');
    // navigate
    if (options.self) {
      this.hostElement.addEventListener('keydown', e => {
        const { code } = e;
        if (code === 'ArrowUp' || code === 'ArrowDown') {
          this.navigate(code === 'ArrowUp' ? 'backward' : 'forward');
          e.preventDefault();
        }
      })
    }
  }



  file(node, parent = this.self, before) {
    parent = parent.closest('details');
    node = this.interrupt(node);

    const a = this.append(
      Object.assign(
        document.createElement('a'), {
          textContent: node.name,
          href: '#'
        }),
      parent,
      before
    );

    a.dataset.type = SimpleTree.FILE;

    this.emit('created', a, node);
    return a;
  }

  createNodeElement(node, parent = this.self, before) {
    parent = parent.closest('node');
    node = this.interrupt(node);

    const nodeElement = document.createElement('div');
    nodeElement.classList.add('node');

    const summary = Object.assign(
      document.createElement('div'), {
        textContent: node.name
      });


  }

  folder(node, parent = this.self, before) {
    parent = parent.closest('details');
    node = this.interrupt(node);

    const details = document.createElement('details');

    const summary = Object.assign(
      document.createElement('summary'), {
        textContent: node.name
      });



    details.appendChild(summary);

    this.append(details, parent, before, () => {
      details.open = node.open;
      details.dataset.type = SimpleTree.FOLDER;
    });

    this.emit('created', summary, node);
    return summary;
  }



  folder(...args) {
    const summary = super.folder(...args);
    const details = summary.closest('details');

    details.addEventListener('toggle', e => {
      this.emit(details.dataset.loaded === 'false' &&
        details.open ? 'fetch' : 'open', summary
      );
    });

    summary.resolve = () => {
      details.dataset.loaded = true;
      this.emit('open', summary);
    };

    return summary;
  }


  nodeTemplate() {
    return `
      <li id="" class="fs-node node" data-is-root="false" data-selected="false" data-attached="false" data-node-type="" data-active="false">
        <button id="" class="collapsible-button">Open Child Section 1</button>
        <section class="collapsible-content-wrapper">
          <ul class="collapsible-content"></ul>
        </section>
      </li>
    `;
  }




  open(node) { node.open = true; }

  siblings(element = this.self.querySelector('a, details')) {
    if (this.hostElement.contains(element)) {
      if (element.dataset.type === undefined) {
        element = element.parentElement;
      }
      return [...element.parentElement.children]
        .filter(e => {
          return e.dataset.type === SimpleTree.FILE || e.dataset.type === SimpleTree.FOLDER;
        })
        .map(e => {
          if (e.dataset.type === SimpleTree.FILE) {
            return e;
          }
          else { return e.querySelector('summary'); }
        });
    } else { return []; }
  }

  append(element, parent, position, callback = () => {}) {
    if (position) { parent.insertBefore(element, position); }
    else { parent.appendChild(element); }

    callback(element, parent);
    return element;
  }



  unloadFolder(summary) {
    const details = summary.closest('details');
    details.open = false;
    const focused = this.active();

    if (focused && this.self.contains(focused)) {
      this.select(details);
    }

    [...details.children].slice(1)
      .forEach(e => e.remove());

    details.dataset.loaded = false;
  }

  get children(details) {
    const e = details.querySelector('a, details');
    if (e) { return this.siblings(e); }
    else { return [] }
  }

  get active() {
    return this.self.querySelector('.selected');
  }

  focus(target) {
    window.clearTimeout(this.id);
    this.id = window.setTimeout(() => document.hasFocus() && target.focus(), 100);
  }

  select(target) {
    const summary = target.querySelector('summary');

    if (summary) { target = summary; }

    [...this.self.querySelectorAll('.selected')]
    .forEach(e => e.classList.remove('selected'));

    target.classList.add('selected');

    this.focus(target);
    this.emit('select', target);
  }


}
