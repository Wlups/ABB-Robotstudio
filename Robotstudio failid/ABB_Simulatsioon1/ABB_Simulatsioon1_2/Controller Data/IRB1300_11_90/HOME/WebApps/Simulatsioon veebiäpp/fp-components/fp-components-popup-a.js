

// (c) Copyright 2020 ABB
//
// Any unauthorized use, reproduction, distribution,
// or disclosure to third parties is strictly forbidden.
// ABB reserves all rights regarding Intellectual Property Rights

// OmniCore App SDK 1.0

'use strict';

fpComponentsLoadCSS("fp-components/fp-components-popup-a.css");

var FPComponents = FPComponents || {};
(function (o) {

    if (!o.hasOwnProperty("Popup_A")) {
        o.Popup_A = class {

            constructor() {
            }

            static _init() {

                if (!this.hasOwnProperty("_inited")) {
                    
                    this._inited = true;
                    this._queue = [];
                    this._active = false;
                    this._callback = null;

                    let body = document.getElementsByTagName("body")[0];

                    let bgDiv = document.createElement("div");
                    bgDiv.className = "fp-components-popup-bg";

                    let popupDiv = document.createElement("div");
                    popupDiv.className = "fp-components-popup";

                    let contentDiv = document.createElement("div");

                    let headerDiv = document.createElement("div");
                    this._headerDiv = headerDiv;

                    let messageDiv = document.createElement("div");
                    this._messageDiv = messageDiv;
                    
                    let bottomDiv = document.createElement("div");

                    let cancelDiv = document.createElement("div");
                    cancelDiv.style="margin-right: 20px;";
                    let cancelButton = new FPComponents.Button_A();
                    cancelButton.text = "Cancel";
                    cancelButton.highlight = false;
                    cancelButton.onclick = ()=>{this.close(this.CANCEL);}
                    cancelButton.attachToElement(cancelDiv);

                    let okDiv = document.createElement("div");
                    let okButton = new FPComponents.Button_A();
                    okButton.text = "OK";
                    okButton.highlight = true;
                    okButton.onclick = ()=>{this.close(this.OK);}
                    okButton.attachToElement(okDiv);

                    this._bgDiv = bgDiv;
                    this._popupDiv = popupDiv;
                    this._cancelDiv = cancelDiv;

                    body.appendChild(bgDiv);
                    body.appendChild(popupDiv);
                        popupDiv.appendChild(document.createElement("div"));
                        popupDiv.appendChild(contentDiv);
                            contentDiv.appendChild(headerDiv);
                            contentDiv.appendChild(messageDiv);
                            contentDiv.appendChild(bottomDiv);
                                bottomDiv.appendChild(document.createElement("div"));
                                bottomDiv.appendChild(cancelDiv);
                                bottomDiv.appendChild(okDiv);

                }

            }

            static message(header, message, callback=null) {

                this._init();

                if (this._active === false) {

                    this._active = true;
                    this._headerDiv.textContent = header;
                    this._unpackMessage(message);
                    this._callback = callback;
                    this._cancelDiv.style.display = "none";
                    this._bgDiv.style.display = "block";
                    this._popupDiv.style.display = "flex";             

                } else {

                    this._queue.push([header,message,callback,false]);

                }
                
            }

            static confirm(header, message, callback=null) {

                this._init();

                if (this._active === false) {

                    this._active = true;
                    this._headerDiv.textContent = header;
                    this._unpackMessage(message);
                    this._callback = callback;
                    this._cancelDiv.style.display = "block";
                    this._bgDiv.style.display = "block";
                    this._popupDiv.style.display = "flex";              

                } else {

                    this._queue.push([header,message,callback,true]);

                }
                
            }


            static close(action) {

                if (this._inited) {

                    this._cancelDiv.style.display = "none";
                    this._bgDiv.style.display = "none";
                    this._popupDiv.style.display = "none";
                    this._headerDiv.textContent = "";
                    this._unpackMessage([""]);

                    if (this._active === true && typeof this._callback === 'function') {
                        this._callback(action);
                    }

                    this._callback = null;

                    if (this._queue.length > 0) {

                        let msg = this._queue.shift();
                        this._active = true;
                        this._headerDiv.textContent = msg[0];
                        this._unpackMessage(msg[1]);
                        this._callback = msg[2];
                        this._cancelDiv.style.display = msg[3] === true ? "block" : "none";
                        this._bgDiv.style.display = "block";
                        this._popupDiv.style.display = "flex";

                    } else {
                        this._active = false;
                    }

                }
            }

            static _unpackMessage(message) {

                while (this._messageDiv.firstChild) {
                    this._messageDiv.removeChild(this._messageDiv.firstChild);
                }

                if (!Array.isArray(message)) {
                    message = [message];
                }

                let first = true;
                for (const line of message) {
                    if (!first) {
                        
                        this._messageDiv.appendChild(document.createElement("br"));
                    }
                    first = false;
                    this._messageDiv.appendChild(document.createTextNode(line));
                }                

            }            

        }

        o.Popup_A.VERSION = "1.0";

        o.Popup_A.OK = "ok";
        o.Popup_A.CANCEL = "cancel";
    }

})(FPComponents); 
