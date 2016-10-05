define(function() {
  
  function RemoveWidgetsOperation() {
    
  }
  
  RemoveWidgetsOperation.prototype.begin = function(widgets, options) {
    var self = this;
    
    options = options || {};
    
    var connectorsToRemove = new Set(Array.from(widgets).filter(function(widget) {
      return widget.widgetType === 'yb-connector';
    }));
    
    var nodeWidgetsToRemove = Array.from(widgets).filter(function(widget) {
      return widget.widgetType === 'yb-node';
    });
    
    // Find connectors attached to node widgets being removed
    nodeWidgetsToRemove.forEach(function(nodeWidget) {
      nodeWidget.connectors().forEach(function(connector) {
        connectorsToRemove.add(connector);
      });
    });
    
    // Remove connectors
    connectorsToRemove.forEach(function(connector) {
      if (options.removeRepresented) {
        self.batch.setLinks([], [connector.link()]);
      }
      
      self.surface.detachWidget(connector);
//       self.surfaceWeb.removeWidget(connector.widgetId);
    });
    
    // Remove node widgets
    nodeWidgetsToRemove.forEach(function(nodeWidget) {
      self.surface.detachWidget(nodeWidget);
//       self.surfaceWeb.removeWidget(nodeWidget.widgetId);
    });
    
    self.surface.finishOperation(self);
  }
  
  RemoveWidgetsOperation.prototype.finish = function(position) {
    
  }
  
  return {
    install: function(surface) {
      surface.RemoveWidgetsOperation = RemoveWidgetsOperation;
    },
  }
});