define(function() {
  
  function ZIndexManager(baseZIndex) {
    this.baseZIndex = baseZIndex || 0;
    this.layers = [];
  }
  
  function Layer(manager) {
    this.manager = manager;
    this.elements = [];
  }
  
  ZIndexManager.prototype.addLayer = function() {
    var layer = new Layer(this);
    this.layers.push(layer);
    return layer;
  }
  
  Layer.prototype.append = function(element) {
    if (this.elements.indexOf(element) !== -1) {
      throw 'z-index layer already has element';
    }
    this.elements.push(element);
    this.manager._update();
  }
  
  Layer.prototype.remove = function(element) {
    var index = this.elements.indexOf(element);
    if (index === -1) {
      throw 'Element not found in z-index layer.';
    }
    this.elements.splice(index, 1);
    this.manager._update();
  }
  
  Layer.prototype.bringToFront = function(elements) {
    var self = this;
    elements = Array.from(elements).sort(function(a, b) {
      return parseInt(a.style['z-index']) - parseInt(b.style['z-index']);
    });
    elements.forEach(function(element) {
      var index = self.elements.indexOf(element);
      if (index === -1) {
        throw 'Cannot bring element to front using z-index manager, element not found.';
      }
      self.elements.splice(index, 1);
    });
    self.elements = self.elements.concat(elements);
    this.manager._update();
  }
  
  ZIndexManager.prototype._update = function() {
    var index = this.baseZIndex;
    this.layers.forEach(function(layer) {
      layer.elements.forEach(function(element) {
        element.style['z-index'] = index;
        index++;
      });
    });
  }
  
  return function(baseZIndex) {
    return new ZIndexManager(baseZIndex);
  }
  
});