

// (c) Copyright 2020 ABB
//
// Any unauthorized use, reproduction, distribution,
// or disclosure to third parties is strictly forbidden.
// ABB reserves all rights regarding Intellectual Property Rights

// OmniCore App SDK 1.0

'use strict';

fpComponentsLoadCSS("fp-components/fp-components-digital-a.css");

var FPComponents = FPComponents || {};
(function (o) {

    if (!o.hasOwnProperty("Digital_A")) {
        o.Digital_A = class {

            constructor() {
                this._anchor = null;                
                this._root = null;

                this._onclick = null;
                this._active = false;
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

            get active() {
                return this._active;
            }
            set active(a) {
                this._active = a == true;
                if (this._root !== null) {
                    this._root.textContent = this._active ? "1" : "0";
                }
                this._updateClassNames();
            }

            _updateClassNames() {
                if (this._root !== null) {
                    this._root.className = "fp-components-digital-a";
                    if (this._active) {
                        this._root.className += " fp-components-digital-a-active";
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

                let divIndicator = document.createElement("div");

                divIndicator.textContent = this._active ? "1" : "0";

                divIndicator.onclick = ()=>{
                    if (this._onclick !== null) {
                        this._onclick();
                    }
                };

                this._root = divIndicator;
                this._updateClassNames();
                this._anchor.appendChild(divIndicator);

            }
        }

        o.Digital_A.VERSION = "1.0";

    }

})(FPComponents); 
