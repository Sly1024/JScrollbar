(function (window, document) {

    function createDiv(className, parent) {
        var div = document.createElement('div');
        div.className = className;
        if (parent) parent.appendChild(div);
        return div;
    }

    function addEvent(el, event, handler) {
        if (el.addEventListener) el.addEventListener(event, handler);
        else el.attachEvent('on'+event, handler);
    }

    function removeEvent(el, event, handler) {
        if (el.removeEventListener) el.removeEventListener(event, handler);
        else el.detachEvent('on'+event, handler);
    }

    var thumbSize = 'thumbSize',
        scrollPos = 'scrollPos';

    function ffMouseWheelHandler(evt) {
        if (evt.axis == 2) {
            this.scrollTo(this[scrollPos] + 20*evt.detail);
        }
    }
    function ieMouseWheelHandler(evt) {
        this.scrollTo(this[scrollPos] - evt.wheelDelta/2);
    }
    function mouseWheelHandler(evt) {
        if (evt.wheelDeltaY) {
            this.scrollTo(this[scrollPos] - evt.wheelDeltaY/2);
        }
    }

    function thumbDown(evt) {
        this.startMousePos = evt.clientY;
        this.startScrollPos = this[scrollPos];
        addEvent(document.body, 'mousemove', this.thumbMoveThis);
        addEvent(document.body, 'mouseup', this.thumbUpThis);
        evt.preventDefault();
    }

    function thumbUp() {
        removeEvent(document.body, 'mousemove', this.thumbMoveThis);
        removeEvent(document.body, 'mouseup', this.thumbUpThis);
    }

    function thumbMove(evt) {
        var mouseDelta = evt.clientY - this.startMousePos,
            scrollDelta = mouseDelta / (this.trackSize - this[thumbSize]) * this.scrollMax;
        this.scrollTo(this.startScrollPos + scrollDelta);
    }

    function createComponents(container) {
        var bar = this.body = createDiv('jscrollbar', container);
        var track = this.track = createDiv('jscrollbar-track', bar);
        this.upArrow = createDiv('jscrollbar-up', bar);
        this.downArrow = createDiv('jscrollbar-down', bar);
        this.thumb = createDiv('jscrollbar-thumb', track);

        var startAutoScrollThis = startAutoScroll.bind(this),
            stopAutoScrollThis = stopAutoScroll.bind(this);

        addEvent(window, 'resize', this.measureSizes.bind(this));
        addEvent(this.upArrow, 'mousedown', startAutoScrollThis);
        addEvent(this.downArrow, 'mousedown', startAutoScrollThis);
        addEvent(document.body, 'mouseup', stopAutoScrollThis);
//        addEvent(document.body, 'mouseout', stopAutoScrollThis);
        addEvent(this.thumb, 'mousedown', thumbDown.bind(this));
    }

    function startAutoScroll(evt) {
        stopAutoScroll.call(this);
        var speed = this.autoScrollSpeed;
        this.autoScrollDir = evt.target == this.upArrow ? -speed : speed;
        this.scrollTimer = setInterval(autoScroll.bind(this), 16);
        evt.preventDefault();
    }

    function stopAutoScroll(evt) {
        this.scrollTimer && clearInterval(this.scrollTimer);
    }

    function autoScroll() {
        this.scrollTo(this[scrollPos] + this.autoScrollDir);
    }

    window.JScrollbar = function (container) {
        if (typeof container == 'string') {
            container = document.getElementById(container);
        }
        this.container = container;
        this.content = container.children[0];

        this[scrollPos] = 0;

        this.thumbMoveThis = thumbMove.bind(this);
        this.thumbUpThis = thumbUp.bind(this);

        var agent = navigator.userAgent;
        if (/Firefox/.test(agent)) {
            addEvent(container, 'DOMMouseScroll', ffMouseWheelHandler.bind(this));
        } else if (/MSIE/.test(agent)) {
            addEvent(container, 'mousewheel', ieMouseWheelHandler.bind(this));
        } else {
            addEvent(container, 'mousewheel', mouseWheelHandler.bind(this));
        }

        createComponents.call(this, container);
        this.measureSizes();
    };

    JScrollbar.prototype = {
        autoScrollSpeed: 5,

        measureSizes: function () {
            var container = this.container;
            this.scrollMax = container.scrollHeight - container.clientHeight;
            this.thumbRatio = container.clientHeight / container.scrollHeight;
            this.trackSize = this.track.clientHeight;
            this[thumbSize] = Math.max(16, this.trackSize * this.thumbRatio); // min thumb size
            this.thumb.style.height = this[thumbSize] + 'px';
            this.updateThumbPos();
        },

        updateThumbPos: function () {
            var scrollRatio = this[scrollPos] / this.scrollMax;    // scaled (0..1)
            var thumbPos = this.thumbPos = (this.trackSize - this[thumbSize]) * scrollRatio;

            this.thumb.style.top = thumbPos + 'px';
        },

        scrollTo: function (pos) {
            pos = this[scrollPos] = Math.max(0, Math.min(pos, this.scrollMax));

            this.content.style.top = -pos + 'px';
            this.updateThumbPos();
            if (this.onScroll) this.onScroll(pos);
        }

    };
})(window, document);
