define(['yarnball/core/map', 'yarnball/core/number'], function(Map_, Number) {
  
  function DragOperation() {
    
  }
  
  DragOperation.prototype.begin = function(event) {
    
    var self = this;
    
    self.draggingWidgets = self.surface.getSelectedWidgets();
    
    // Prevent dragging nested widgets
    self.draggingWidgets = new Set(Array.from(self.draggingWidgets).filter(function(widget) {
      var parentNode = widget.parentNode;
      while (parentNode && parentNode !== self.surface.viewRoot) {
        if (self.draggingWidgets.has(parentNode)) {
          return false;
        }
        parentNode = parentNode.parentNode;
      }
      return true;
    }));
    
    if (self.draggingWidgets.size) {
      self.surface.classList.add('dragging-widgets');
    }
    
    // Initialize widget drag start positions
    self.draggingWidgets.forEach(function(nodeWidget) {
      nodeWidget.dragStartPosition = self.surface.getWidgetPosition(nodeWidget);
      nodeWidget.classList.add('dragging');
    });
    
    
    // Setup drag-drop
    
    var dragdropAreasToDraggingNodes = new Map();
    self.draggingWidgets.forEach(function(nodeWidget) {
      if (!self.surface.isTopLevelWidget(nodeWidget)) {
        var dragdropArea = self.surface.getWidgetDragdropAreaParent(nodeWidget);
        if (dragdropArea) {
          if (dragdropAreasToDraggingNodes.has(dragdropArea)) {
            dragdropAreasToDraggingNodes.get(dragdropArea).add(nodeWidget);
          } else {
            dragdropAreasToDraggingNodes.set(dragdropArea, new Set([nodeWidget]));
          }
        }
      }
    });
    
    function handleDragdropAreaDraggedOut(event) {
      var draggingNodesForArea = dragdropAreasToDraggingNodes.get(event.detail.dragdropArea);
      event.detail.oldWidgets.forEach(function(nodeWidget) {
        draggingNodesForArea.delete(nodeWidget);
      });
      if (draggingNodesForArea.size === 0) {
        event.detail.dragdropArea.removeEventListener('widgetsDraggedOut', handleDragdropAreaDraggedOut);
        dragdropAreasToDraggingNodes.delete(event.detail.dragdropArea);
      }
      
      event.detail.detachedWidgets.forEach(function(nodeWidget) {
        self.surface.attachWidget(nodeWidget, nodeWidget.dragStartPosition);
      });
      self.surface.selectWidgets(event.detail.detachedWidgets, true);
      
      updateDropTargets();
    }
    
    dragdropAreasToDraggingNodes.forEach(function(nodeWidgets, dragdropArea) {
      dragdropArea.fire('widgetDragStart', {
        widgets: nodeWidgets,
        mouseEvent: event,
      });
      dragdropArea.addEventListener('widgetsDraggedOut', handleDragdropAreaDraggedOut);
    });
    
    function dragdropAreaMouseover(event) {
      var dragdropArea = event.currentTarget;
      dragdropArea.classList.add('drop-hover');
      
      var widgetsToDrop = Array.from(self.draggingWidgets).filter(function(widget) {
        return self.surface.isTopLevelWidget(widget);
      });
      
      if (dragdropArea.dropRequestHandler) {
        widgetsToDrop = Array.from(dragdropArea.dropRequestHandler(widgetsToDrop));
      }
      
      if (widgetsToDrop.length > 0) {
        
        if (dragdropArea.dropOnHover) {
          
          dragdropArea.fire('widgetsDraggedIn', {
            dragdropArea: dragdropArea,
            widgets: Array.from(widgetsToDrop),
            mouseEvent: event,
          });
          
          var droppedWidgets = widgetsToDrop.filter(function(widget) {
            return !self.surface.isTopLevelWidget(widget);
          });
          
          self.surface.selectWidgets(droppedWidgets, true);
          
          if (!dragdropAreasToDraggingNodes.has(dragdropArea)) {
            dragdropAreasToDraggingNodes.set(dragdropArea, new Set(droppedWidgets));
            dragdropArea.addEventListener('widgetsDraggedOut', handleDragdropAreaDraggedOut);
          } else {
            droppedWidgets.forEach(function(nodeWidget) {
              dragdropAreasToDraggingNodes.get(dragdropArea).add(nodeWidget);
            });
          }
          
          updateDropTargets();
          
        } else {
          widgetsToDrop.forEach(function(widget) {
            widget.classList.add('self-drop-ready');
          });
        }
      }
    }
    function dragdropAreaMouseout(event) {
      var dragdropArea = event.currentTarget;
      dragdropArea.classList.remove('drop-hover');
      
      self.draggingWidgets.forEach(function(widget) {
        widget.classList.remove('self-drop-ready');
      });
    }
    function dragdropAreaMouseup(event) {
      self.draggingWidgets.forEach(function(widget) {
        widget.classList.remove('self-drop-ready');
      });
      
      var dragdropArea = event.currentTarget;
      dragdropArea.classList.remove('drop-hover');
      var widgetsToDrop = self.draggingWidgets;
      if (dragdropArea.dropRequestHandler) {
        widgetsToDrop = dragdropArea.dropRequestHandler(widgetsToDrop);
      }
      dragdropArea.fire('nodes-dropped', widgetsToDrop);
      
      self.draggingWidgets.forEach(function(widget) {
        if (self.surface.isTopLevelWidget(widget)) {
          self.surface.setWidgetPosition(widget, widget.dragStartPosition);
        }
      });
    }
    
    var dropTargets = Array.from(self.surface.getDragdropAreas());
    
    // Prevent dropping onto a dragdrop area that is being dragged
    dropTargets = dropTargets.filter(function(dragdropArea) {
      return !self.draggingWidgets.has(dragdropArea) && !self.surface.getWidgetParents(dragdropArea).some(function(parent) {
        return self.draggingWidgets.has(parent);
      });
    });
    
    dropTargets.forEach(function(dragdropArea) {
      if (dragdropArea.dragdropEnabled) {
        dragdropArea.addEventListener('mouseover', dragdropAreaMouseover);
        dragdropArea.addEventListener('mouseout',  dragdropAreaMouseout);
        dragdropArea.addEventListener('mouseup',   dragdropAreaMouseup);
      }
    });
    
    function updateDropTargets() {
      dropTargets.forEach(function(dragdropArea) {
        var dropReady = !dragdropArea.dropRequestHandler || Array.from(dragdropArea.dropRequestHandler(self.draggingWidgets)).length > 0;
        dragdropArea.classList.toggle('drop-ready', dropReady);
      });
    }
    
    updateDropTargets();
    
    // Begin drag
    
    self.surface.captureMouse(event, {
      cursor: '-webkit-grabbing',
      mousemove: function(options) {
      
        // Move top-level node widgets
        self.draggingWidgets.forEach(function(draggingWidget) {
        
          if (self.surface.isTopLevelWidget(draggingWidget) && (draggingWidget.widgetType !== 'yb-connector')) {
        
            self.surface.setWidgetPosition(draggingWidget, {
              x: draggingWidget.dragStartPosition.x + options.dragDeltaView.x,
              y: draggingWidget.dragStartPosition.y + options.dragDeltaView.y,
            });
          }
        });
        
        // Move node widgets in drag-drop areas
        dragdropAreasToDraggingNodes.forEach(function(nodeWidgets, dragdropArea) {
          dragdropArea.fire('widgetDrag', {
            widgets: nodeWidgets,
            options: options,
          });
        });
        
        return false;
      },
      mouseup: function() {
      
        self.surface.classList.remove('dragging-widgets');
    
        self.draggingWidgets.forEach(function(widget) {
          widget.classList.remove('dragging');
        });
        
        self.surface.dragdropAreas.forEach(function(dragdropArea) {
          dragdropArea.removeEventListener('mouseover', dragdropAreaMouseover);
          dragdropArea.removeEventListener('mouseout',  dragdropAreaMouseout);
          dragdropArea.removeEventListener('mouseup',   dragdropAreaMouseup);
          dragdropArea.classList.remove('drop-ready');
        });
        
        dragdropAreasToDraggingNodes.forEach(function(nodeWidgets, dragdropArea) {
          dragdropArea.fire('widgetDragFinish', nodeWidgets);
          dragdropArea.removeEventListener('widgetsDraggedOut', handleDragdropAreaDraggedOut);
        });
        
//         self.draggingWidgets.forEach(function(widget) {
//           if (self.surface.isTopLevelWidget(widget) && widget.widgetType !== 'yb-connector') {
//             var position = self.surface.getWidgetPosition(widget);
//             self.surfaceWeb.setWidgetPosition(widget.widgetId, position);
//           }
//         });
        
        self.surface.finishOperation(self);
      }
    });
  }
  
  DragOperation.prototype.finish = function() {
    
  }
  
  DragOperation.prototype.cancel = function() {
    
  }
  
  return {
    install: function(surface) {
      surface.addEventListener('widgetAttached', function(event) {
        var widget = event.detail;
        widget.addEventListener('dragStart', function(event) {
          if (surface.canBeginOperation()) {
            event.preventDefault();
            if (event.detail.shiftKey) {
              var cloneOperation = surface.beginOperation(surface.CloneWidgetsOperation, surface.getSelectedWidgets());
              surface.selectWidgets(cloneOperation.newWidgets);
            }
            surface.bringWidgetsToFront(surface.getSelectedWidgetsTopLevel());
            surface.beginOperation(DragOperation, event.detail);
            return false;
          }
        });
      });
      surface.DragOperation = DragOperation;
    },
  }
  
});
