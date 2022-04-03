export class GPSObservable {
  constructor() {
    this.root;
  }
  get geoLocationData() {
    return new Observable((observer) => {
      navigator.geolocation.getCurrentPosition(
        position => {
          observer.next({
            clientGPS: {
              radius: position.coords.accuracy || 10,
              altitude: position.coords.altitude || 0,
              speed: position.coords.speed || 0,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              dateTime: new Date(position.timestamp).toUTCString(),
            },
          });
          observer.complete();
        },
        error => observer.error(error)
      );
    });
  }

  get prop() { return this._prop };
  set prop(newValue) { this._prop = newValue };
}
