const { combineLatest, asObservable, iif, BehaviorSubject, ReplaySubject, AsyncSubj, Subject, interval, of , fromEvent, merge, empty, delay, from } = rxjs;
const { distinctUntilChanged, groupBy, mergeMap, switchMap, scan, take, takeWhile, map, tap, startWith, filter, } = rxjs.operators;
const { fromFetch } = rxjs.fetch;
import { EventMessage } from '/models/event-bus/event-message.model.js'
import { EventChannel } from '/models/event-bus/event-channel.model.js'


const channelConfig = {
  folderPathMessage: new EventMessage({ channelName: '[FILE SYSTEM]', name: 'root', action: 'create:root', parent: null })
}

export const CHANNEL_NAMES = {
  Folder: '[FOLDER]',
  FolderPath: '[FOLDER PATH]',
  FileSystem: '[FILE SYSTEM]',
  Interval: '[INTERVAL]',
}


class MessageRelayer {
  constructor() {
    this._channels = new Map([
      ['[FILE SYSTEM]', new EventChannel('[FILE SYSTEM]')],
    ]);

    this.channelAliases = {
      fs: '[FILE SYSTEM]',
      keys: ['fs']
    }
  }

  get channelNames() { return [...this._channels.names()] }

  connect(subscriber, channel, filterFn) {
    const ch = this.channel(channel);

    return {
      send: this.channel(channel).send.bind(ch),
      messages$: this.channel(channel).listen.bind(ch)(filterFn)
    }
    return Object.assign(subscriber,
    );
  }

  channel(channelName) {
    channelName = channelName === 'fs' ? '[FILE SYSTEM]' : channelName
    channelName = this.channelAliases.keys.includes(channelName) ? this.channelAliases[channelName] : channelName;
    return this._channels.get(channelName)
  }

  listenToChannel(channelName) {
    return this.getChannel(channelName).listen();
  }

  sendToChannel(channelName, msg) {
    return this.getChannel(channelName).post(msg);
  }

  createChannel(name, initialData) {
    return this._channels.set(name, new EventChannel(name, initialData))
      .get(name)
  }

  getChannel(channelName) {
    return this._channels.get(channelName)
  }


  hasChannel(channelName) {
    return this._channels.has(channelName)
  }

  log() {
    console.log('store collection log');
    console.log([...(this._channels.get('files')).entries()]);
    console.log([...this._channels.get('folders').entries()]);
  }
}

export const Relayer = new MessageRelayer()
