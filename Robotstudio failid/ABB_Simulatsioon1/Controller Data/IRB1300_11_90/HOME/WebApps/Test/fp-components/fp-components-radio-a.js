

// (c) Copyright 2020 ABB
//
// Any unauthorized use, reproduction, distribution,
// or disclosure to third parties is strictly forbidden.
// ABB reserves all rights regarding Intellectual Property Rights

// OmniCore App SDK 1.0

'use strict';

fpComponentsLoadCSS("fp-components/fp-components-radio-a.css");

var FPComponents = FPComponents || {};
(function (o) {

    if (!o.hasOwnProperty("Radio_A")) {
        o.Radio_A = class {

            constructor() {
                this._anchor = null;                
                this._root = null;
                
                this._scale = 1.0;

                this._enabled = true;
                this._onclick = null;
                this._checked = false;
            }

            get parent() {
                return this._anchor;
            }

            get onclick() {
                return this._onclick;
            }

            set onclick(f) {
                this._onclick = f;
            }

            get enabled() {
                return this._enabled;
            }

            set enabled(e) {
                this._enabled = e ? true : false;
                this._updateClassNames();
            }

            get checked() {
                return this._checked;
            }

            set checked(c) {
                this._checked = c ? true : false;
                this._updateClassNames();
            }

            _updateClassNames() {
                if (this._root !== null) {
                    if (this._checked == true) {
                        this._root.className = this._enabled === true ? "fp-components-radio-checked" : "fp-components-radio-checked fp-components-radio-disabled";
                    } else {
                        this._root.className = this._enabled === true ? "fp-components-radio" : "fp-components-radio fp-components-radio-disabled"
                    }
                }
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

            rebuild() {

                let divButton = document.createElement("div");
                divButton.appendChild(document.createElement("div"));

                divButton.onclick = ()=>{
                    if (this._enabled == true && this._checked != true) {
                        this._checked = true;
                        this._updateClassNames();
                        if (this._onclick !== null) {
                            this._onclick();
                        }
                    }

                };

                this._root = divButton;
                this._updateClassNames();

                if (this._scale !== 1.0) {
                    this.scale = this._scale;
                }

                this._anchor.appendChild(divButton);

            }

            set scale(s) {
                this._scale = s;
                if (this._root !== null) {

                    this._root.style.borderWidth    = ( 2*s).toString() + "px";
                    this._root.style.borderRadius   = (16*s).toString() + "px";
                    this._root.style.width          = (16*s).toString() + "px";
                    this._root.style.height         = (16*s).toString() + "px";

                    let markerDiv = this._root.getElementsByTagName("div")[0];
                    markerDiv.style.width           = (10*s).toString() + "px";
                    markerDiv.style.height          = (10*s).toString() + "px";
                    markerDiv.style.borderRadius    = (10*s).toString() + "px";
                    markerDiv.style.marginLeft      = ( 3*s).toString() + "px";
                    markerDiv.style.marginTop       = ( 3*s).toString() + "px";
                }
            }

            get scale() {
                return this._scale;
            }            
        }

        o.Radio_A.VERSION = "1.0";

    }

})(FPComponents); 
