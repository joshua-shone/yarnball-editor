define(function() {
  
  function BoxSelectionOperation() {

  }
  
  BoxSelectionOperation.prototype.begin = function(event) {
    var self = this;
    
    var dragStartOffset = {
      x: event.offsetX + self.surface.background.offsetLeft,
      y: event.offsetY + self.surface.background.offsetTop,
    }
    
    self.surface.boxSelection.style.left = dragStartOffset.x + 'px';
    self.surface.boxSelection.style.top  = dragStartOffset.y + 'px';
    self.surface.boxSelection.style.width  = '0';
    self.surface.boxSelection.style.height = '0';
    
    self.surface.boxSelection.classList.remove('hidden');
    
    var alreadySelectedWidgets = new Set(self.surface.selectedWidgets);
    
    self.surface.captureMouse(event, {
      cursor: 'crosshair',
      mousemove: function(options) {
        
        self.surface.deselect();
      
        var currentSelectionRect = {
          left:   Math.min(dragStartOffset.x, dragStartOffset.x + options.dragDeltaView.x),
          top:    Math.min(dragStartOffset.y, dragStartOffset.y + options.dragDeltaView.y),
          right:  Math.max(dragStartOffset.x, dragStartOffset.x + options.dragDeltaView.x),
          bottom: Math.max(dragStartOffset.y, dragStartOffset.y + options.dragDeltaView.y),
        }
        
        self.surface.boxSelection.style.left   = currentSelectionRect.left + 'px';
        self.surface.boxSelection.style.top    = currentSelectionRect.top  + 'px';
        self.surface.boxSelection.style.width  = (currentSelectionRect.right  - currentSelectionRect.left) + 'px';
        self.surface.boxSelection.style.height = (currentSelectionRect.bottom - currentSelectionRect.top)  + 'px';
        
        var widgetsToSelect = new Set(self.surface.getWidgetsInRect(currentSelectionRect));
        alreadySelectedWidgets.forEach(function(widget) {
          widgetsToSelect.add(widget);
        });
        self.surface.selectWidgets(widgetsToSelect, true);
      },
      mouseup: function(event) {
        self.surface.boxSelection.classList.add('hidden');
        self.surface.highlightLinksBetweenNodeWidgets(self.surface.getSelectedWidgetsOfType('yb-node'));
        self.surface.finishOperation(self);
      }
    });
  }
  
  BoxSelectionOperation.prototype.finish = function() {
    
  }
  
  BoxSelectionOperation.prototype.cancel = function() {
    
  }
  
  return {
    install: function(surface) {
      surface.background.addEventListener('mousedown', function(event) {
        if (event.button === 0) {
          if (surface.canBeginOperation()) {
            event.preventDefault();
            surface.beginOperation(BoxSelectionOperation, event);
            return false;
          }
        }
      });
    }
  }
});
