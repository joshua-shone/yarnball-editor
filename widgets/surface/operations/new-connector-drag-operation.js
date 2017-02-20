define(['yarnball/src/node'], function(Node) {
  
  function NewConnectorDragOperation() {

  }
  
  NewConnectorDragOperation.prototype.begin = function(event, nodeWidget) {
    var self = this;
    var surface = self.surface;
    
    var widgetPos = surface.getWidgetPosition(nodeWidget);
    
    var cursorPos = {
      x: widgetPos.x + event.detail.offsetX,
      y: widgetPos.y + event.detail.offsetY,
    }

    var draggingConnectorNodes = {
      from: new Set(surface.getSelectedWidgetsOfType('yb-node')),
      via:  null,
      to:   null,
    }
    
    draggingConnectorNodes.from.add(nodeWidget);
    
    var draggingConnectors = [];
    draggingConnectorNodes.from.forEach(function(fromNodeWidget) {
      var draggingConnector = document.createElement('yb-connector');
      draggingConnector.set('showHandles', false);
      draggingConnector.fromWidget = fromNodeWidget;
      draggingConnector.classList.add('inactive', 'dragging');
      var nodeCenter = surface.getWidgetCenter(fromNodeWidget);
      draggingConnector.set('fromPos', {
        x: nodeCenter.x + surface.viewMargin,
        y: nodeCenter.y + surface.viewMargin,
      });
      Polymer.dom(surface.viewRoot).appendChild(draggingConnector);
      draggingConnectors.push(draggingConnector);
    });
    
    function handleOtherNodeMouseover(event) {
      var otherNodeWidget = event.currentTarget;
      var otherNodeCenter = surface.getWidgetCenter(otherNodeWidget);
      if (!draggingConnectorNodes.via) {
        if (!draggingConnectorNodes.from.has(otherNodeWidget)) {
          draggingConnectorNodes.via = otherNodeWidget;
          draggingConnectors.forEach(function(draggingConnector) {
            draggingConnector.viaWidget = otherNodeWidget;
            draggingConnector.set('viaPos', {
              x: otherNodeCenter.x + surface.viewMargin,
              y: otherNodeCenter.y + surface.viewMargin,
            });
          });
        }
      } else if (!draggingConnectorNodes.to) {
        if (otherNodeWidget !== draggingConnectorNodes.via) {
          draggingConnectorNodes.to = otherNodeWidget;
          draggingConnectors.forEach(function(draggingConnector) {
            draggingConnector.toWidget = otherNodeWidget;
            draggingConnector.set('toPos', {
              x: otherNodeCenter.x + surface.viewMargin,
              y: otherNodeCenter.y + surface.viewMargin,
            });
          });
        }
      }
    }
    
    surface.getWidgetsTopLevelOfType('yb-node').forEach(function(otherNodeWidget) {
      if (!draggingConnectorNodes.from.has(otherNodeWidget)) {
        otherNodeWidget.addEventListener('mouseover', handleOtherNodeMouseover);
      }
    });
    
    surface.classList.add('dragging-connectors');
    
    surface.captureMouse(event, {
      mousemove: function(options) {
        if (!draggingConnectorNodes.via) {
          draggingConnectors.forEach(function(draggingConnector) {
            draggingConnector.set('viaPos', {
              x: options.currentPosView.x + surface.viewMargin,
              y: options.currentPosView.y + surface.viewMargin,
            });
          });
        } else if(!draggingConnectorNodes.to) {
          draggingConnectors.forEach(function(draggingConnector) {
            draggingConnector.set('toPos', {
              x: options.currentPosView.x + surface.viewMargin,
              y: options.currentPosView.y + surface.viewMargin,
            });
          });
        }
      },
      mouseup: function() {
      
        surface.classList.remove('dragging-connectors');
      
        surface.getWidgetsTopLevelOfType('yb-node').forEach(function(otherNodeWidget) {
          if (!draggingConnectorNodes.from.has(otherNodeWidget)) {
            otherNodeWidget.removeEventListener('mouseover', handleOtherNodeMouseover);
          }
        });
        
        if (draggingConnectorNodes.via &&
            draggingConnectorNodes.to) {
          
          var newLinks = [];
          
          var newConnectors = [];
          
          draggingConnectorNodes.from.forEach(function(fromNodeWidget) {
            var nodeWidgetTriple = {
              from: fromNodeWidget,
              via:  draggingConnectorNodes.via,
              to:   draggingConnectorNodes.to,
            }
            var connectors = surface.getConnectorsForWidgetTriple(nodeWidgetTriple);
            var hasActiveConnector = connectors.some(function(connector) {
              return connector.active;
            });
            if (!hasActiveConnector) {
              newConnectors.push(surface.createConnector({
                from: fromNodeWidget,
                via:  draggingConnectorNodes.via,
                to:   draggingConnectorNodes.to,
              }));
            }
            newLinks.push({
              from: Node.fromHex(fromNodeWidget.nodeId),
              via:  Node.fromHex(draggingConnectorNodes.via.nodeId),
              to:   Node.fromHex(draggingConnectorNodes.to.nodeId)
            });
          });
          
          self.batch.setLinks(newLinks, []);
//           newConnectors.forEach(function(connector) {
//             self.surfaceWeb.addWidget(connector);
//           });
        }
        
        draggingConnectors.forEach(function(draggingConnector) {
          Polymer.dom(surface.viewRoot).removeChild(draggingConnector);
        });
        
        surface.finishOperation(self);
      },
      blockEvents: false
    });
  }
  
  NewConnectorDragOperation.prototype.finish = function() {
    
  }
  
  NewConnectorDragOperation.prototype.cancel = function() {
    
  }
  
  return {
    install: function(surface) {
      
      function handleDragStart(event) {
        var nodeWidget = event.detail.widget;
        if (surface.isTopLevelWidget(nodeWidget)) {
          if (surface.canBeginOperation()) {
            event.preventDefault();
            surface.beginOperation(NewConnectorDragOperation, event.detail.mouseEvent, nodeWidget);
            return false;
          }
        }
      }
      
      surface.addEventListener('widgetAttached', function(event) {
        var widget = event.detail;
        if (widget.widgetType === 'yb-node') {
          widget.addEventListener('rightButtonDragStart', handleDragStart);
        }
      });
      
      surface.addEventListener('widgetDetached', function(event) {
        var widget = event.detail;
        if (widget.widgetType === 'yb-node') {
          widget.removeEventListener('rightButtonDragStart', handleDragStart);
        }
      });
    }
  }
  
});
