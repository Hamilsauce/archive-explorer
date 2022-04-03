export class MenuButton {
  constructor(name, {host, height = '40px', width = '40px', fill = '#000000' }) {
    if (!name) throw new Error('Name the button')
    this.name = name;
    this.fill = fill;
    this.height = +(height.replace('px', ''));
    this.width = +(width.replace('px', ''));
    this.viewBox = '0 0 22 22';
    this.self;
    this.icon;
    this.host = host;
  };

  attach(handlerFn) {
    const range = document.createRange();
    range.selectNode(this.host)

    this.self = range
      .createContextualFragment(this.template())
      .firstElementChild;

    this.self.style = { width: 'fit-content', height: 'fit-content' }

    this.icon = this.self.firstElementChild;

    this.host.appendChild(this.self);

    // this.onClick = handlerFn.bind(this) //.bind(this)

    // this.self.addEventListener('click', e => {
    //   if (this.self.contains(e.target)) {
    //     this.onClick.bind(this)(e)
    //   }
    // });

    return this.self;
  }

  onClick(e, handlerFn = () => {}) {
    handlerFn(e);
  }

  template() {
    return `<div class="${this.name}-button menu-button">
              <svg
                height="${this.height}px" 
                width="${this.width}px" 
                viewBox="0 0 22 22"
                fill="${this.fill}"
                class="folder-create-icon"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path fill="none" d="M0 0h32v32H0V0z" />
                <path d="M20 6h-8l-2-2H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-1 8h-3v3h-2v-3h-3v-2h3V9h2v3h3v2z" />
              </svg>
            </div>`;
  }
}
