define(function() {
  
  function ZoomOperation() {

  }
  
  ZoomOperation.prototype.begin = function(event) {
    var cursorPosView = {
      x: event.offsetX - this.surface.viewMargin,
      y: event.offsetY - this.surface.viewMargin,
    }
    
    var zoomSpeed = null;
    if (event.deltaMode === 0) { // Pixels
      zoomSpeed = 0.08;
    } else if (event.deltaMode === 1) { // Lines
      zoomSpeed = 0.16;
    } else if (event.deltaMode === 2) { // Pages
      zoomSpeed = 0.2;
    } else {
      zoomSpeed = 0.08;
    }
    
    var zoomOffset = (event.deltaY < 0) ? zoomSpeed : -zoomSpeed;
    
    this.surface.zoomOnPosition(cursorPosView, zoomOffset);
    this.surface.finishOperation(this);
  }
  
  ZoomOperation.prototype.finish = function() {
    
  }
  
  ZoomOperation.prototype.cancel = function() {
    
  }
  
  return {
    install: function(surface) {
      surface.background.addEventListener('wheel', function(event) {
        if (surface.canBeginOperation()) {
          event.preventDefault();
          surface.beginOperation(ZoomOperation, event);
          return false;
        }
      });
    }
  }
  
});
