var rotateDefaults = {
    rotate: true,
    rotateLeft: true,
    rotateRight: true,
    flipHorizontal: true,
    flipVertical: true,
};

var Rotate = function (element) {

    this.core = window.lgData[element.getAttribute('lg-uid')];
    this.core.s = Object.assign({}, rotateDefaults, this.core.s);

    if (this.core.s.rotate && this.core.doCss()) {
        this.init();
    }

    return this;
};

Rotate.prototype.buildTemplates = function () {
    var rotateIcons = '';
    if (this.core.s.flipVertical) {
        rotateIcons += '<button aria-label="flip vertical" class="lg-flip-ver lg-icon"></button>';
    }
    if (this.core.s.flipHorizontal) {
        rotateIcons += '<button aria-label="Flip horizontal" class="lg-flip-hor lg-icon"></button>';
    }
    if (this.core.s.rotateLeft) {
        rotateIcons += '<button aria-label="Rotate left" class="lg-rotate-left lg-icon"></button>';
    }
    if (this.core.s.rotateRight) {
        rotateIcons += '<button aria-label="Rotate right" class="lg-rotate-right lg-icon"></button>';
    }
    this.core.outer.querySelector('.lg-toolbar').insertAdjacentHTML('beforeend', rotateIcons);
};

Rotate.prototype.init = function () {
    var _this = this;
    this.buildTemplates();

    // Save rotate config for each item to persist its rotate, flip values
    // even after navigating to diferent slides
    this.rotateValuesList = {};

    // event triggered after appending slide content
    utils.on(_this.core.el, 'onAferAppendSlide.lgtmrotate', function (event) {
        // Get the current element
        var imageWrap = _this.core.___slide[event.detail.index].querySelector('.lg-img-wrap');
        utils.wrap(imageWrap, 'lg-img-rotate');
    });

    utils.on(_this.core.outer.querySelector('.lg-rotate-left'), 'click.lg', this.rotateLeft.bind(this));
    utils.on(_this.core.outer.querySelector('.lg-rotate-right'), 'click.lg', this.rotateRight.bind(this));
    utils.on(_this.core.outer.querySelector('.lg-flip-hor'), 'click.lg', this.flipHorizontal.bind(this));
    utils.on(_this.core.outer.querySelector('.lg-flip-ver'), 'click.lg', this.flipVertical.bind(this));

    // Reset rotate on slide change
    utils.on(_this.core.el, 'onBeforeSlide.lgtmrotate', function (event) {
        if (!_this.rotateValuesList[event.detail.index]) {
            _this.rotateValuesList[event.detail.index] = {
                rotate: 0,
                flipHorizontal: 1,
                flipVertical: 1,
            };
        }
    });
};

Rotate.prototype.applyStyles = function () {
    var image = this.core.___slide[this.core.index].querySelector('.lg-img-rotate');
    utils.setVendor(image, 'Transform',
        'rotate(' + this.rotateValuesList[this.core.index].rotate + 'deg)' +
        ' scale3d(' + this.rotateValuesList[this.core.index].flipHorizontal +
        ', ' + this.rotateValuesList[this.core.index].flipVertical + ', 1)'
    );
};

Rotate.prototype.rotateLeft = function () {
    this.rotateValuesList[this.core.index].rotate -= 90;
    this.applyStyles();
};

Rotate.prototype.rotateRight = function () {
    this.rotateValuesList[this.core.index].rotate += 90;
    this.applyStyles();
};

Rotate.prototype.getCurrentRotation = function (el) {
    if (!el) {
        return 0;
    }
    const st = window.getComputedStyle(el, null);
    const tm = st.getPropertyValue('-webkit-transform') ||
        st.getPropertyValue('-moz-transform') ||
        st.getPropertyValue('-ms-transform') ||
        st.getPropertyValue('-o-transform') ||
        st.getPropertyValue('transform') ||
        'none';
    if (tm !== 'none') {
        const values = tm.split('(')[1].split(')')[0].split(',');
        if (values) {
            const angle = Math.round(Math.atan2(values[1], values[0]) * (180 / Math.PI));
            return (angle < 0 ? angle + 360 : angle);
        }
    }
    return 0;
};

Rotate.prototype.flipHorizontal = function () {
    const rotateEl = this.core.___slide[this.core.index].querySelector('.lg-img-rotate');
    const currentRotation = this.getCurrentRotation(rotateEl);
    let rotateAxis = 'flipHorizontal';
    if (currentRotation === 90 || currentRotation === 270) {
        rotateAxis = 'flipVertical';
    }
    this.rotateValuesList[this.core.index][rotateAxis] *= -1;
    this.applyStyles();
};

Rotate.prototype.flipVertical = function () {
    const rotateEl = this.core.___slide[this.core.index].querySelector('.lg-img-rotate');
    const currentRotation = this.getCurrentRotation(rotateEl);
    let rotateAxis = 'flipVertical';
    if (currentRotation === 90 || currentRotation === 270) {
        rotateAxis = 'flipHorizontal';
    }
    this.rotateValuesList[this.core.index][rotateAxis] *= -1;

    this.applyStyles();
};

Rotate.prototype.destroy = function () {
    // Unbind all events added by lightGallery rotate plugin
    utils.off(this.core.el, '.lgtmrotate');
    this.rotateValuesList = {};
};

window.lgModules.Rotate = Rotate;
