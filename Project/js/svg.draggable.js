/*!
* @svgdotjs/svg.draggable.js - An extension for svg.js which allows to drag elements with your mouse
* @version 3.0.2
* https://github.com/svgdotjs/svg.draggable.js
*
* @copyright Wout Fierens
* @license MIT
*
* BUILT: Tue Feb 19 2019 17:12:16 GMT+0100 (GMT+01:00)
*/;
(function (svg_js) {
  'use strict';

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  var getCoordsFromEvent = function getCoordsFromEvent(ev) {
    if (ev.changedTouches) {
      ev = ev.changedTouches[0];
    }

    return {
      x: ev.clientX,
      y: ev.clientY
    };
  }; // Creates handler, saves it


  var DragHandler =
  /*#__PURE__*/
  function () {
    function DragHandler(el) {
      _classCallCheck(this, DragHandler);

      el.remember('_draggable', this);
      this.el = el;
      this.drag = this.drag.bind(this);
      this.startDrag = this.startDrag.bind(this);
      this.endDrag = this.endDrag.bind(this);
    } // Enables or disabled drag based on input


    _createClass(DragHandler, [{
      key: "init",
      value: function init(enabled) {
        if (enabled) {
          this.el.on('mousedown.drag', this.startDrag);
          this.el.on('touchstart.drag', this.startDrag);
        } else {
          this.el.off('mousedown.drag');
          this.el.off('touchstart.drag');
        }
      } // Start dragging

    }, {
      key: "startDrag",
      value: function startDrag(ev) {
        var isMouse = !ev.type.indexOf('mouse'); // Check for left button

        if (isMouse && (ev.which || ev.buttons) !== 1) {
          return;
        } // Fire beforedrag event


        if (this.el.dispatch('beforedrag', {
          event: ev,
          handler: this
        }).defaultPrevented) {
          return;
        } // Prevent browser drag behavior as soon as possible


        ev.preventDefault(); // Prevent propagation to a parent that might also have dragging enabled

        ev.stopPropagation(); // Make sure that start events are unbound so that one element
        // is only dragged by one input only

        this.init(false);
        this.box = this.el.bbox();
        this.lastClick = this.el.point(getCoordsFromEvent(ev)); // We consider the drag done, when a touch is canceled, too

        var eventMove = (isMouse ? 'mousemove' : 'touchmove') + '.drag';
        var eventEnd = (isMouse ? 'mouseup' : 'touchcancel.drag touchend') + '.drag'; // Bind drag and end events to window

        svg_js.on(window, eventMove, this.drag);
        svg_js.on(window, eventEnd, this.endDrag); // Fire dragstart event

        this.el.fire('dragstart', {
          event: ev,
          handler: this,
          box: this.box
        });
      } // While dragging

    }, {
      key: "drag",
      value: function drag(ev) {
        var box = this.box,
            lastClick = this.lastClick;
        var currentClick = this.el.point(getCoordsFromEvent(ev));
        var x = box.x + (currentClick.x - lastClick.x);
        var y = box.y + (currentClick.y - lastClick.y);
        var newBox = new svg_js.Box(x, y, box.w, box.h);
        if (this.el.dispatch('dragmove', {
          event: ev,
          handler: this,
          box: newBox
        }).defaultPrevented) return;
        this.move(x, y);
        return newBox;
      }
    }, {
      key: "move",
      value: function move(x, y) {
        // Svg elements bbox depends on their content even though they have
        // x, y, width and height - strange!
        // Thats why we handle them the same as groups
        if (this.el.type === 'svg') {
          svg_js.G.prototype.move.call(this.el, x, y);
        } else {
          this.el.move(x, y);
        }
      }
    }, {
      key: "endDrag",
      value: function endDrag(ev) {
        // final drag
        var box = this.drag(ev); // fire dragend event

        this.el.fire('dragend', {
          event: ev,
          handler: this,
          box: box
        }); // unbind events

        svg_js.off(window, 'mousemove.drag');
        svg_js.off(window, 'touchmove.drag');
        svg_js.off(window, 'mouseup.drag');
        svg_js.off(window, 'touchend.drag'); // Rebind initial Events

        this.init(true);
      }
    }]);

    return DragHandler;
  }();

  svg_js.extend(svg_js.Element, {
    draggable: function draggable() {
      var enable = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
      var dragHandler = this.remember('_draggable') || new DragHandler(this);
      dragHandler.init(enable);
      return this;
    }
  });

}(SVG));
//# sourceMappingURL=svg.draggable.js.map
