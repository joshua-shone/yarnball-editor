define(['yarnball/core/node'], function(Node) {
  
  function CloneWidgetsOperation() {
    
  }
  
  CloneWidgetsOperation.prototype.begin = function(widgets, offset) {
    var self = this;
    
    var newWidgets = [];
    
    var oldToNewNodeWidgetMap = new Map();
    
    // Duplcate nodes and sets
    widgets.forEach(function(widget) {
      var newWidget = null;
      
      if (widget.widgetType === 'yb-node') {
        newWidget = self.surface.createNodeWidget(Node.fromHex(widget.nodeId));
        oldToNewNodeWidgetMap.set(widget, newWidget);
      } else if (widget.widgetType === 'yb-set') {
        newWidget = self.surface.createSetWidget(widget.getFilter());
      }
      
      if (newWidget) {
        var widgetPosition = self.surface.getWidgetPosition(widget);
        var newPosition = {
          x: widgetPosition.x + (offset || 0),
          y: widgetPosition.y + (offset || 0),
        }
        self.surface.attachWidget(newWidget, newPosition);
        newWidgets.push(newWidget);
        
//         self.surfaceWeb.addWidget(newWidget);
//         self.surfaceWeb.setWidgetPosition(newWidget.widgetId, newPosition);
      }
    });
    
    // Duplcate connectors
    widgets.forEach(function(widget) {
      if (widget.widgetType === 'yb-connector') {
        if (widgets.has(widget.fromWidget) &&
            widgets.has(widget.viaWidget) &&
            widgets.has(widget.toWidget)) {
          
          var newConnector = self.surface.createConnector({
            from: oldToNewNodeWidgetMap.get(widget.fromWidget),
            via:  oldToNewNodeWidgetMap.get(widget.viaWidget),
            to:   oldToNewNodeWidgetMap.get(widget.toWidget),
          });
          newWidgets.push(newConnector);
          
//           self.surfaceWeb.addWidget(newConnector);
        }
      }
    });
    
    self.newWidgets = newWidgets;
    
    this.surface.finishOperation(this);
  }
  
  CloneWidgetsOperation.prototype.finish = function(position) {
    
  }
  
  return {
    install: function(surface) {
      surface.CloneWidgetsOperation = CloneWidgetsOperation;
    },
  }
});