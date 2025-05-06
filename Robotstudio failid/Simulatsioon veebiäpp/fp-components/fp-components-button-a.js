

// (c) Copyright 2020 ABB
//
// Any unauthorized use, reproduction, distribution,
// or disclosure to third parties is strictly forbidden.
// ABB reserves all rights regarding Intellectual Property Rights

// OmniCore App SDK 1.0

'use strict';

fpComponentsLoadCSS("fp-components/fp-components-button-a.css");

var FPComponents = FPComponents || {};
(function (o) {

    if (!o.hasOwnProperty("Button_A")) {
        o.Button_A = class {

            constructor() {
                this._anchor = null;                
                this._root = null;

                this._enabled = true;
                this._onclick = null;
                this._text = "";
                this._highlight = false;
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

            get text() {
                return this._text;
            }

            set text(t) {
                this._text = t;
                if (this._root !== null) {
                    this._root.textContent = t;
                }
            }

            get highlight() {
                return this._highlight;
            }

            set highlight(h) {
                this._highlight = h ? true : false;
                this._updateClassNames();
            }

            _updateClassNames() {
                if (this._root !== null) {
                    this._root.className = this._enabled === true ? "fp-components-button" : "fp-components-button-disabled";
                    if (this._highlight) {
                        this._root.className += " fp-components-button-highlight";
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

                divButton.textContent = this._text;

                divButton.onclick = ()=>{
                    if (this._onclick !== null && this._enabled === true) {
                        this._onclick();
                    }
                };

                this._root = divButton;
                this._updateClassNames();
                this._anchor.appendChild(divButton);

            }
        }

        o.Button_A.VERSION = "1.0";

    }

})(FPComponents); 
