var SurfaceWeb = require('./surface-web');
var Node       = require('yarnball/core/node');
var Web        = require('yarnball/core/web');
var Batch      = require('yarnball/core/batch');
var test       = require('tape');

test('surface-web test', function(t) {
  
  var web = Batch(Web());
  
  var surfaceWeb = null;
  t.doesNotThrow(function() {
    surfaceWeb = SurfaceWeb(web);
  }, 'surface-web constructor does not throw.');
  
  t.doesNotThrow(function() {
    surfaceWeb.setName('wiggle');
  }, 'setName() should not throw.');
  
  t.equal(surfaceWeb.getName(), 'wiggle', 'getName() should return string passed to setName()');
  
  var initialLinkCount = web.getLinkCount();
  var initialNodeCount = web.getNodeCount();
  
  var nodeWidget1 = {
    widgetId: Node(),
    nodeId: Node.makeHex(),
    widgetType: 'yb-node',
  }
  var nodeWidget1Position = {x: 50, y: 50};
  
  var nodeWidget2 = {
    widgetId: Node(),
    nodeId: Node.makeHex(),
    widgetType: 'yb-node',
  }
  var nodeWidget2Position = {x: 86.123, y: 0.145};
  
  var nodeWidget3 = {
    widgetId: Node(),
    nodeId: Node.makeHex(),
    widgetType: 'yb-node',
  }
  var nodeWidget3Position = {x: -24.8, y: -1};
  
  t.doesNotThrow(function() {
    surfaceWeb.addWidget(nodeWidget1);
    surfaceWeb.addWidget(nodeWidget2);
    surfaceWeb.addWidget(nodeWidget3);
  }, 'addWidget() does not throw.');
  
  var nodeWidgets = surfaceWeb.getNodeWidgets();
  t.equal(nodeWidgets.size(), 3, 'getNodeWidgets() should return a set whose size matches the number of calls to addWidget()');
  
  t.ok(surfaceWeb.hasWidget(nodeWidget1.widgetId), 'hasWidget() should return true for a widget added with addWidget()');
  
  t.doesNotThrow(function() {
    surfaceWeb.setWidgetPosition(nodeWidget1.widgetId, nodeWidget1Position);
    surfaceWeb.setWidgetPosition(nodeWidget2.widgetId, nodeWidget2Position);
    surfaceWeb.setWidgetPosition(nodeWidget3.widgetId, nodeWidget3Position);
  }, 'Calling setWidgetPosition() for several node widgets with different positions should not throw.');
  
  function positionsEqual(p1, p2) {
    return p1.x === p2.x && p1.y === p2.y;
  }
  
  var position = surfaceWeb.getWidgetPosition(nodeWidget1.widgetId);
  t.ok(positionsEqual(position, nodeWidget1Position), 'getWidgetPosition() should return the same position given to setWidgetPosition()');
  position = surfaceWeb.getWidgetPosition(nodeWidget2.widgetId);
  t.ok(positionsEqual(position, nodeWidget2Position), 'getWidgetPosition() should return the same position given to setWidgetPosition()');
  position = surfaceWeb.getWidgetPosition(nodeWidget3.widgetId);
  t.ok(positionsEqual(position, nodeWidget3Position), 'getWidgetPosition() should return the same position given to setWidgetPosition()');
  
  var linkCount = web.getLinkCount();
  surfaceWeb.setWidgetPosition(nodeWidget1.widgetId, {x: -2, y: 3});
  t.ok(web.getLinkCount() < linkCount, 'Link count should be reduced after overwriting a widget position with fewer digits.');
  
  var connector = {
    widgetId: Node(),
    widgetType: 'yb-connector',
    fromWidget: nodeWidget1,
    viaWidget:  nodeWidget2,
    toWidget:   nodeWidget3,
  }
  
  surfaceWeb.addWidget(connector);
  
  
  t.doesNotThrow(function() {
    surfaceWeb.removeWidget(nodeWidget1.widgetId);
    surfaceWeb.removeWidget(nodeWidget2.widgetId);
    surfaceWeb.removeWidget(nodeWidget3.widgetId);
    surfaceWeb.removeWidget(connector.widgetId);
  }, 'Calling removeWidget() on every widget does not throw.');
  
  t.notOk(surfaceWeb.hasWidget(nodeWidget1.widgetId), 'hasWidget() should return false for a node-widget removed with removeWidget()');
  t.notOk(surfaceWeb.hasWidget(connector.widgetId), 'hasWidget() should return false for a connector removed with removeWidget()');
  
  t.equal(web.getLinkCount(), initialLinkCount, 'Link count in web should return to previous state after calling removeWidget() on all widgets.');
  t.equal(web.getNodeCount(), initialNodeCount, 'Node count in web should return to previous state after calling removeWidget() on all widgets.');
  
  surfaceWeb.destroy();
  
  t.equal(web.getLinkCount(), 0, 'Link count in web should return to zero after calling destroy() on the surface.');
  t.equal(web.getNodeCount(), 0, 'Node count in web should return to zero after calling destroy() on the surface.');
  
  t.end();
});