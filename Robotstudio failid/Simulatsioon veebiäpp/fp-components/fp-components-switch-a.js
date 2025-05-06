

// (c) Copyright 2020 ABB
//
// Any unauthorized use, reproduction, distribution,
// or disclosure to third parties is strictly forbidden.
// ABB reserves all rights regarding Intellectual Property Rights

// OmniCore App SDK 1.0

'use strict';

fpComponentsLoadCSS("fp-components/fp-components-switch-a.css");

var FPComponents = FPComponents || {};
(function (o) {

    if (!o.hasOwnProperty("Switch_A")) {
        o.Switch_A = class {

            constructor() {
                this._anchor = null;
                this._onchange = null;
                this._root = null;
                this._enabled = true;
                this._active = false;
                this._scale = 1.0;
            }

            get parent() {
                return this._anchor;
            }

            set onchange(func) {
                this._onchange = func;
            }

            get onchange() {
                return _onchange;
            }

            attachToId(nodeId) {
    
                let element = document.getElementById(nodeId);
                if (element === null) {
                    console.log("Could not find element with id: " + nodeId);
                    return false;
                }

                return this.attachToElement(element);
            }

            attachToElement(element) {

                this._anchor = element;
                return this.rebuild();
            }                 

            set active(active) {

                if (this._root !== null) {
                    if (active) {
                        this._root.className = "fp-components-switch-button fp-components-switch-button-active";
                        if (this._scale != 1.0) {
                            this._root.getElementsByTagName("div")[0].style.marginLeft = (27*this._scale).toString() + "px";
                        }
                    } else {
                        this._root.className = "fp-components-switch-button";
                        if (this._scale != 1.0) {
                            this._root.getElementsByTagName("div")[0].style.marginLeft = (3*this._scale).toString() + "px";
                        }
                    }
                    if (!this._enabled) {
                         this._root.className += " fp-components-switch-button-disabled";
                    }
                }

                this._active = active;
            }

            get active() {
                return this._active;
            }

            set enabled(enabled) {

                this._enabled = enabled;
                this.active = this._active;
            }


            get enabled() {
                return this._enabled;
            }


            rebuild() {
                
                if (this._anchor != null) {

                    let divOuter = document.createElement("div");
                    
                    let divKnob = document.createElement("div");
                    
                    divOuter.appendChild(divKnob);

                    divOuter.onclick = () => {

                        if (this._enabled === true) {
                            if (this._active === true) {
                                this.active = false;
                            } else {
                                this.active = true;
                            }

                            if (this._onchange != null) {
                                this._onchange(this._active);
                            }                        
                        }
                    };

                    this._root = divOuter;
                    this.active = this._active;

                    if (this._scale !== 1.0) {
                        this.scale = this._scale;
                    }
                    
                    this._anchor.appendChild(divOuter);

                }
            }

            set scale(s) {
                this._scale = s;
                if (this._root !== null) {

                    let knob = this._root.getElementsByTagName("div")[0];

                    if (s === 1.0) {

                        this._root.style.borderWidth    = null;
                        this._root.style.borderRadius   = null;
                        this._root.style.height         = null;
                        this._root.style.width          = null;
                        knob.style.borderRadius         = null;
                        knob.style.height               = null;
                        knob.style.width                = null;
                        knob.style.marginTop            = null;
                        knob.style.marginLeft           = null;

                    } else {

                        this._root.style.borderWidth    = (2*s).toString() + "px";
                        this._root.style.borderRadius   = (10*s).toString() + "px";
                        this._root.style.height         = (16*s).toString() + "px";
                        this._root.style.width          = (40*s).toString() + "px";
                        knob.style.borderRadius         = (5*s).toString() + "px";
                        knob.style.height               = (10*s).toString() + "px";
                        knob.style.width                = (10*s).toString() + "px";
                        knob.style.marginTop            = (3*s).toString() + "px";
                        if (this._active) {
                            knob.style.marginLeft       = (27*s).toString() + "px";
                        } else {
                            knob.style.marginLeft       = ( 3*s).toString() + "px";
                        }
                    }
                }
            }

            get scale() {
                return this._scale;
            }
        }

        o.Switch_A.VERSION ="1.0";

    }

})(FPComponents); 
