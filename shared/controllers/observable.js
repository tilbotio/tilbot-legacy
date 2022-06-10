define("Observable", [], function() {

  return class Observable {
    constructor() {
      this.observers = [];
    }

    subscribe(observer) {
      this.observers.push(observer);
    }

    unsubscribe(observer) {
      this.observers = this.observers.filter(item => item !== observer);
    }

    notifyAll(message, params) {
      this.observers.forEach((observer) => {
        observer.notify(this, message, params);
      });
    }

  }

});
