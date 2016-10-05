define(function() {
  
  function RenameOperation() {

  }
  
  RenameOperation.prototype.begin = function(nodeWidget) {
    var self = this;
    nodeWidget.startEditing();
    function handleFinishedEditing(event) {
      nodeWidget.removeEventListener('finishedEditing', handleFinishedEditing);
      self.surface.finishOperation(self);
      self.surface.focus();
    }
    nodeWidget.addEventListener('finishedEditing', handleFinishedEditing);
  }
  
  RenameOperation.prototype.finish = function() {
    
  }
  
  RenameOperation.prototype.cancel = function() {
    
  }
  
  return {
    install: function(surface) {
      
      function getNodeWidgetForElement(element) {
        if (element.tagName === 'yb-node'.toUpperCase()) {
          return element;
        }
        if (element.parentNode && element.parentNode !== surface) {
          return getNodeWidgetForElement(element.parentNode);
        }
        return null;
      }
      
      surface.addEventListener('dblclick', function(event) {
        if (!surface.hasOperation()) {
          var nodeWidget = getNodeWidgetForElement(event.target);
          if (nodeWidget) {
            surface.beginOperation(RenameOperation, nodeWidget);
          }
        }
      });
      
      surface.addEventListener('enterKey', function(event) {
        if (surface.canBeginOperation()) {
          if (surface.selectedWidgets.size === 1) {
            var selectedWidget = Array.from(surface.selectedWidgets)[0];
            if (selectedWidget.tagName === 'yb-node'.toUpperCase() && !selectedWidget.isEditing) {
              event.detail.preventDefault();
              surface.beginOperation(RenameOperation, selectedWidget);
              return false;
            }
          }
        }
      });
    }
  }
  
});
