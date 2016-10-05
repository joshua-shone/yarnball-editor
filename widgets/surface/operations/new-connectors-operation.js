define(function() {
  
  function NewConnectorsOperation() {
    
  }
  
  NewConnectorsOperation.prototype.begin = function(nodeWidgetTriples) {
    var self = this;
    nodeWidgetTriples.forEach(function(nodeWidgetTriple) {
      var connector = self.surface.createConnector(nodeWidgetTriple);
//       self.surfaceWeb.addWidget(connector);
    });
    
    self.surface.finishOperation(self);
  }
  
  NewConnectorsOperation.prototype.finish = function(position) {
    
  }
  
  return {
    install: function(surface) {
      surface.NewConnectorsOperation = NewConnectorsOperation;
    },
  }
});