import { Relayer, CHANNEL_KEY } from '../MessageRelayer.js';
import { MenuButton } from '/_collapsible-node/components/buttons/menu-button.component.js';

export class Toolbar {
  constructor() {
    this.self = document.querySelector('#app-toolbar');
    this.menu = this.self.querySelector('.menu-container');

    this.buttons = new Map();

    this.folderCreateButton = document.createElement('div');
    this.menu.appendChild(this.folderCreateButton)
    this.addButtonAction(this.menu, { name: 'create-folder-button', host: this.folderCreateButton, channelKey: '[FILE SYSTEM]', action: 'folder:create', data: {} })

    this.folderOpenButton = document.createElement('div');
    this.menu.appendChild(this.folderOpenButton)
    this.addButtonAction(this.menu, {name: 'open-folder-button', host: this.folderOpenButton, channelKey: '[FILE SYSTEM]', action: 'folder:open', data: {} })

    this.postToFSChannel = (msg) => Relayer.sendToChannel('[FILE SYSTEM]', msg)
  }

  addButtonAction(parent, buttonConfig) {
    let btn = this.buttons.set(
        buttonConfig.name,
        new MenuButton(
          'create-folder-button',
          buttonConfig)
      )
      .get(buttonConfig.name)

    btn.attach()
  
    btn.self.addEventListener('click', e => {
      let msg = { action: 'create:folder', payload: null }
      // this.self.dispatchEvent(new CustomEvent('create:folder', { bubbles: true, detail: msg }))

      this.postToFSChannel(msg);
    })


  }

  get prop() { return this._prop };
  set prop(newValue) { this._prop = newValue };
}

// export class Toolbar {
//   constructor() {
//     // this.rootEl = rootEl;
//     this.self = document.querySelector('#app-toolbar');
//     this.menu = this.self.querySelector('.menu-container');
//     this.buttons = new Map();

//     this.folderCreateButton = document.createElement('div');
//     this.menu.appendChild(this.folderCreateButton)
//     console.log('folderCreateButton', this.folderCreateButton)
//     this.addButtonAction(this.menu, { channelKey: '[FILE SYSTEM]', action: 'folder:create', data: {} })

//     this.postToFSChannel = (msg) => Relayer.sendToChannel('[FILE SYSTEM]', msg)

//     // folderCreate.attach(menu, () => {
//     //   Relayer.connect('clicks', fromEvent(folderCreate, 'click')
//     //     .pipe(
//     //       map(e => ({ key: 'createFolder', data: {} }))
//     //     )
//     //   )
//     // })

//     // const folderCreate = new MenuButton('folder-create', { fill: 'purple' });
//   }
//   addButtonAction(parent, buttonConfig, ) {
//     let btn = new MenuButton('create-folder-button', buttonConfig)
//     btn.host = this.folderCreateButton
//     btn.attach(this.folderCreateButton, () => {

//     this.folderCreateButton.addEventListener('click', e => {
//       let msg = { action: 'create:folder', data: {} }
//       this.postToFSChannel(msg);
//     })

//     this.buttons.set(btn.name, btn)
//     })

//   }



//   get prop() { return this._prop };
//   set prop(newValue) { this._prop = newValue };
// }
