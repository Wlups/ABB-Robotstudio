export class FP_Slider_A extends FPComponents.Slider_A {
  constructor() {
    super();
    this._backgroundColor = '#ffffff';
    this._border = '1px solid transparent';
    this._borderRadius = 16;
    this._activeColor = '#3366ff';
    this._inactiveColor = '#9f9f9f';
    this._labelColor = '#000000';
    this._labelFont = {
      fontSize: 14,
      fontFamily: 'Segoe UI',
      style: {
        fontStyle: 'normal',
        fontWeight: 'Semibold',
        textDecoration: 'none',
      },
    };
    this._displayRange = true;
    this._rangeValueColor = '#0000008e';
    this._rangeValueFont = {
      fontSize: 12,
      fontFamily: 'Segoe UI',
      style: {
        fontStyle: 'normal',
        fontWeight: 'normal',
        textDecoration: 'none',
      },
    };
    this._fixValueElement = null;
  }
  get backgroundColor() {
    return this._backgroundColor;
  }
  set backgroundColor(color) {
    this._backgroundColor = color;
  }
  get border() {
    return this._border;
  }
  set border(r) {
    this._border = r;
  }
  get activeColor() {
    return this._activeColor;
  }
  set activeColor(c) {
    this._activeColor = c;
  }
  get inactiveColor() {
    return this._inactiveColor;
  }
  set inactiveColor(c) {
    this._inactiveColor = c;
  }
  get borderRadius() {
    return this._borderRadius;
  }
  set borderRadius(t) {
    this._borderRadius = t;
  }
  get labelFont() {
    return this._labelFont;
  }
  set labelFont(f) {
    this._labelFont = f;
  }
  get labelColor() {
    return this._labelColor;
  }
  set labelColor(c) {
    this._labelColor = c;
  }
  set rangeValueFont(f) {
    this._rangeValueFont = f;
  }
  get rangeValueFont() {
    return this._rangeValueFont;
  }
  set rangeValueColor(c) {
    this._rangeValueColor = c;
  }
  get rangeValueColor() {
    return this._rangeValueColor;
  }
  _updateClassNames() {
    if (this._root !== null) {
      if (!this._enabled) {
        this._trackHandleElement.className =
          'fp-components-slider__track-handle fp-components-slider__track-handle--disabled';
        this._activeTrackElement.className = 'fp-components-slider__track fp-components-slider__track-disabled';
        this._root.className = 'fp-components-base fp-components-slider fp-components-slider-disabled';
      } else {
        this._trackHandleElement.className =
          'fp-components-slider__track-handle fp-components-slider__track-handle--enabled';
        this._activeTrackElement.className = 'fp-components-slider__track fp-components-slider__track--active';
        this._root.className = 'fp-components-base fp-components-slider';
      }
    }
    this._updateTickMarks();
  }
  _rebuild() {
    this._anchor.innerHTML = '';
    this._valueWidth =
      this._getTextWidth(
        this._max.toFixed(this._numberOfDecimals),
        `${this._labelFont.fontSize}px ${this._labelFont.fontFamily}`,
      ) + this._textPadding;
    this._pixelValue = (this._max - this._min) / this._width;
    this._xPosition = this._limitPosition((this._value - this._min) / this._pixelValue);
    let component = document.createElement('div');
    component.className = 'fp-components-base fp-components-slider';
    // component.style = 'width: ' + this._width + 'px';
    component.style.backgroundColor = this._backgroundColor;
    component.style.border = this.border;
    component.style.borderRadius = `${this.borderRadius}px`;

    this._createLabelPart(component);
    this._createRangePart(component);
    if (this._displayValue) {
      this._createMinMaxPart(component);
    }
    this._root = component;
    this._anchor.appendChild(component);
    this._updateClassNames();
    this._rawXPosition = this._xPosition;
    this._updateDynamicElements();
  }
  _createLabelPart(component) {
    let divLabelContainer = document.createElement('div');
    divLabelContainer.className = 'fp-components-slider__labels-wrapper';
    divLabelContainer.style.display = 'flex';
    if (this._displayLabel) {
      divLabelContainer.style.justifyContent = 'space-between';
    } else {
      divLabelContainer.style.justifyContent = 'right';
    }

    let label = document.createElement('span');
    label.textContent = this._buildLabel();
    label.className = this._displayLabel ? 'fp-components-slider__label' : 'fp-components-slider__label--hidden';
    label.style.font = `${this._labelFont.style.fontStyle} ${this._labelFont.style.fontWeight} ${this._labelFont.fontSize}px ${this._labelFont.fontFamily}`;
    label.style.textDecoration = this._labelFont.style.textDecoration;
    label.style.color = this._labelColor;

    this._labelElement = label;
    divLabelContainer.appendChild(label);

    //fixed value label
    let fixedDivValue = document.createElement('span');
    fixedDivValue.className = this._displayValue
      ? 'fp-components-slider__label'
      : 'fp-components-slider__label--hidden';
    fixedDivValue.textContent = this._value;
    fixedDivValue.style.font = `${this._labelFont.style.fontStyle} ${this._labelFont.style.fontWeight} ${this._labelFont.fontSize}px ${this._labelFont.fontFamily}`;
    fixedDivValue.style.textDecoration = this._labelFont.style.textDecoration;
    fixedDivValue.style.color = this._labelColor;

    this._fixValueElement = fixedDivValue;
    divLabelContainer.appendChild(fixedDivValue);

    let divValue = document.createElement('span');
    divValue.className = 'fp-components-slider__value--hidden';
    divValue.style.left = this._xPosition + 'px';
    divValue.style.width = this._valueWidth + 'px';
    divValue.style.borderColor = this._activeColor;
    divValue.textContent = this._value;
    divLabelContainer.appendChild(divValue);
    this._valueElement = divValue;
    component.appendChild(divLabelContainer);
  }
  _buildLabel() {
    if (!this._displayLabel) {
      return;
    }
    let label = this._label;
    return label;
  }
  _createRangePart(component) {
    let divTrack = document.createElement('div');
    divTrack.className = 'fp-components-slider__range-wrapper';
    divTrack.style.width = this._width + 'px';
    divTrack.addEventListener('pointerdown', this._pointerdown);

    // active track
    let divActiveTrack = document.createElement('div');
    divActiveTrack.className = 'fp-components-slider__track ';
    divActiveTrack.className += this._enabled
      ? 'fp-components-slider__track--active'
      : 'fp-components-slider__track--disabled';
    divActiveTrack.style.width = (this._value - this._min) / this._pixelValue + 'px';
    divActiveTrack.style.backgroundColor = this._enabled ? this._activeColor : '#9f9f9f';
    this._activeTrackElement = divActiveTrack;
    divTrack.appendChild(divActiveTrack);

    //inactive track
    let divInavtiveTrack = document.createElement('div');
    divInavtiveTrack.className = 'fp-components-slider__track';
    divInavtiveTrack.style.marginLeft = (this._value - this._min) / this._pixelValue + 'px';
    divInavtiveTrack.style.width = (this._max - this._value) / this._pixelValue + 'px';
    this._inactiveTrackElement = divInavtiveTrack;
    // divInavtiveTrack.style.backgroundColor = this._inactiveColor;
    divTrack.appendChild(divInavtiveTrack);

    // tick step
    this._internalTickStep = this._tickStep;
    let rangeLength = this._max - this._min;
    let numOfSteps = rangeLength / this._internalTickStep;
    let stepPixelWidth = this._width / numOfSteps;
    const minVisiblePixelWidth = 5;
    if (stepPixelWidth < minVisiblePixelWidth) {
      let newTickStep = this._internalTickStep;
      let stepFactor = 0;
      while (stepPixelWidth < minVisiblePixelWidth) {
        stepFactor += 1;
        newTickStep = this._internalTickStep * stepFactor;
        numOfSteps = rangeLength / newTickStep;
        stepPixelWidth = this._width / numOfSteps;
        // limit the while loop time
        if (stepFactor > 100) {
          break;
        }
      }
      this._internalTickStep = newTickStep;
    }
    if (this.displayTicks) {
      divTrack.style.backgroundSize = stepPixelWidth.toString() + 'px 1px';
      divTrack.style.backgroundImage = `linear-gradient(to right, white 1px, ${this._inactiveColor} 1px)`;

      // divInavtiveTrack.style.backgroundSize = stepPixelWidth.toString() + 'px 1px';
    } else {
      divTrack.style.backgroundColor = this._inactiveColor;
      divTrack.style.backgroundSize = '0px 1px';
      // divInavtiveTrack.style.backgroundSize = stepPixelWidth.toString() + 'px 1px';
    }

    function createTickMark(pixelPosition) {
      let tickMark = document.createElement('div');
      tickMark.style.left = pixelPosition + 'px';
      return tickMark;
    }
    this._ticks = [];
    if (this._displayTicks) {
      let tickMarkStart = createTickMark(0);
      this._ticks.push(tickMarkStart);
      divTrack.appendChild(tickMarkStart);
      let tickMarkEnd = createTickMark(this._width);
      this._ticks.push(tickMarkEnd);
      divTrack.appendChild(tickMarkEnd);
    }

    // touch box
    let divTouchbox = document.createElement('div');
    divTouchbox.className = 'fp-components-slider__track-touchbox';
    divTouchbox.addEventListener('pointerdown', this._pointerdown);
    divTouchbox.style.left = this._xPosition + 'px';
    this._touchBoxElement = divTouchbox;
    divTouchbox.addEventListener('pointerover', (e) => {
      if (!this._active) {
        this._valueElement.className = 'fp-components-slider__value';
        this._valueElement.className += ' fp-components-slider__value--hover';
        this._rawXPosition = this._xPosition;
        this._updateDynamicElements();
      }
    });
    divTouchbox.addEventListener('pointerout', (e) => {
      if (!this._active) {
        this._valueElement.className = 'fp-components-slider__value';
        this._valueElement.className += ' fp-components-slider__value--hidden';
      }
    });
    divTrack.appendChild(divTouchbox);
    let divTrackHandle = document.createElement('div');
    divTrackHandle.className = 'fp-components-slider__track-handle';
    divTrackHandle.className += ' fp-components-slider__track--handle-enabled';
    divTrackHandle.style.color = this._activeColor;
    this._trackHandleElement = divTrackHandle;
    divTouchbox.appendChild(divTrackHandle);
    component.appendChild(divTrack);
  }
  _createMinMaxPart(component) {
    let divMinMax = document.createElement('div');
    divMinMax.className = 'fp-components-slider__minmax-wrapper';
    let divMinValue = document.createElement('span');
    divMinValue.innerHTML = this._min;
    divMinValue.className = 'fp-components-slider__minmax-label';
    divMinValue.className += ' fp-components-slider__minmax-label--left';
    divMinValue.style.font = `${this._rangeValueFont.style.fontStyle} ${this._rangeValueFont.style.fontWeight} ${this._rangeValueFont.fontSize}px ${this._rangeValueFont.fontFamily}`;
    divMinValue.style.textDecoration = this._rangeValueFont.style.textDecoration;
    divMinValue.style.color = this._rangeValueColor;

    divMinMax.appendChild(divMinValue);
    let divSpacer = document.createElement('div');
    divSpacer.className = 'fp-components-slider__minmax-spacer';
    divMinMax.appendChild(divSpacer);
    let divMaxValue = document.createElement('span');
    divMaxValue.innerHTML = this._max;
    divMaxValue.className = 'fp-components-slider__minmax-label';
    divMaxValue.className += ' fp-components-slider__minmax-label--right';
    divMaxValue.style.font = `${this._rangeValueFont.style.fontStyle} ${this._rangeValueFont.style.fontWeight} ${this._rangeValueFont.fontSize}px ${this._rangeValueFont.fontFamily}`;
    divMaxValue.style.textDecoration = this._rangeValueFont.style.textDecoration;
    divMaxValue.style.color = this._rangeValueColor;

    divMinMax.appendChild(divMaxValue);
    component.appendChild(divMinMax);
  }
  _updateDynamicElements() {
    let rawValue = this._min + this._xPosition * this._pixelValue;
    this._value = rawValue.toFixed(this._numberOfDecimals);
    this._labelElement.textContent = this._buildLabel();
    this._touchBoxElement.style.left = this._xPosition + 'px';
    this._valueElement.innerHTML = this._value;
    let maxPos = this._width - this._valueWidth / 2;
    let minPos = this._valueWidth / 2;
    if (this._rawXPosition >= maxPos) {
      this._valueElement.style.left = maxPos + 'px';
    } else if (this._rawXPosition <= minPos) {
      this._valueElement.style.left = minPos + 'px';
    } else {
      this._valueElement.style.left = this._rawXPosition + 'px';
    }
    this._activeTrackElement.style.width = (rawValue - this._min) / this._pixelValue + 'px';
    this._inactiveTrackElement.style.marginLeft = (rawValue - this._min) / this._pixelValue + 'px';
    this._inactiveTrackElement.style.width = (this._max - rawValue) / this._pixelValue + 'px';
    this._updateTickMarks();
  }
  _pointerup(e) {
    this._active = false;
    document.removeEventListener('pointermove', this._pointermove);
    document.removeEventListener('pointerup', this._pointerup);
    this._labelElement.innerHTML = this._buildLabel();
    this._fixValueElement.textContent = this._value;
    this._valueElement.className = 'fp-components-slider__value--hidden';
    this._trackHandleElement.className = 'fp-components-slider__track-handle';
    this._trackHandleElement.className += ' fp-components-slider__track-handle--enabled';
    if (this._onrelease) {
      this._onrelease(Number.parseFloat(this._value));
    }
  }
  _pointerdown(e) {
    if (!this.enabled) {
      return;
    }
    this._active = true;
    this._startX = e.pageX;
    if (e.target.classList.contains('fp-components-slider__track-touchbox')) {
      this._startOffset = this._xPosition;
    } else {
      this._startOffset = e.offsetX;
      this._rawXPosition = this._startOffset;
      this._xPosition = this._limitPosition(this._startOffset);
      if (this._xPosition < 0) {
        this._xPosition = 0;
      }
      if (this._xPosition > this._width) {
        this._xPosition = this._width;
      }
      this._updateDynamicElements();
      if (this._ondrag) {
        this._ondrag(Number.parseFloat(this._value));
      }
    }
    this._valueElement.className = 'fp-components-slider__value';
    this._valueElement.className += ' fp-components-slider__value--active';
    this._trackHandleElement.className = 'fp-components-slider__track-handle';
    this._trackHandleElement.className += ' fp-components-slider__track-handle--enabled';
    this._trackHandleElement.className += ' fp-components-slider__track-handle--active';
    this._trackHandleElement.style.backgroundColor = this._activeColor;
    document.addEventListener('pointermove', this._pointermove);
    document.addEventListener('pointerup', this._pointerup);
  }
}
