/*global define:false require:false */
(function (name, context, definition) {
    if (typeof module !== 'undefined' && module.exports) module.exports = definition();
    else if (typeof define === 'function' && define.amd) define(definition);
    else if (typeof provide === 'function') provide(name, definition());
    else context[name] = definition();
})('domain', this, function(){
  // Import Events
  var events = this && this.events || null;
  if ( !events ) {
    try {
      require('events-browser');
    }
    catch (err) {
      require('events');
    }
  }

  // Export Domain
  var domain = {};
  domain.create = function(){
    var d = new events.EventEmitter();
    d.run = function(fn){
      try {
        fn();
      }
      catch (err) {
        this.emit('error', err);
      }
      return this;
    };
    d.dispose = function(){
      this.removeAllListeners();
      return this;
    };
  };
  return domain;
});