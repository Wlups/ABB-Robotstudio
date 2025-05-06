

// (c) Copyright 2020 ABB
//
// Any unauthorized use, reproduction, distribution,
// or disclosure to third parties is strictly forbidden.
// ABB reserves all rights regarding Intellectual Property Rights

// OmniCore App SDK 1.0

'use strict';

/******* LOAD CSS *******/

function fpComponentsLoadCSS(href) {
    let head = document.getElementsByTagName("head")[0];
    let link = document.createElement("link");
    link.rel = "stylesheet";
    link.type = "text/css";
    link.href = href;
    head.appendChild(link);
}

const FP_COMPONENTS_COMMON_VERSION = "1.0";

fpComponentsLoadCSS("fp-components/fp-components-common.css");



/******* ON-SCREEN KEYBOARD  *******/

var __fpComponentsKeyboardCase  = false;
var __fpComponentsKeyboardType = "alpha"; // or "intl" or "symbol1" or "symbol2"
var __fpComponentsKeyboardCallback = null;
var __fpComponentsKeyboardLabel = null;
var __fpComponentsKeyboardRegex = null;
var __fpComponentsKeyboardValidator = null;

const FP_COMPONENTS_KEYBOARD_ALPHA  = {};
const FP_COMPONENTS_KEYBOARD_NUM    = {};


function fpComponentsKeyboardShow(callback, initialText=null, label=null, variant=null, regex=null, validator=null) {

    __fpComponentsKeyboardCallback = callback;
    __fpComponentsKeyboardLabel = label;
    __fpComponentsKeyboardRegex = regex;
    __fpComponentsKeyboardValidator = validator;

    function cancel() {

        document.getElementById("fp-components-keyboard-id").style.display = "none";
        document.getElementById("fp-components-keyboard-background-id").style.display = "none";
        document.getElementById("fp-components-keyboard-input-id").value = "";

        if (__fpComponentsKeyboardCallback !== null && typeof __fpComponentsKeyboardCallback === "function") {
  
            __fpComponentsKeyboardCallback(null);
        }

    }

    function validateInput() {
        
        let isMatch = false;

        let f = document.getElementById("fp-components-keyboard-input-id");
        if (__fpComponentsKeyboardRegex === null || __fpComponentsKeyboardRegex.test === undefined || __fpComponentsKeyboardRegex.test(f.value)) {
            isMatch = true;           
        }

        if (isMatch && __fpComponentsKeyboardValidator !== null && typeof __fpComponentsKeyboardValidator === "function") {
            isMatch = __fpComponentsKeyboardValidator(f.value);
        }

        f.style.color = isMatch ? "black" : "red";
        let okButtons = document.getElementsByClassName("fp-components-keyboard-ok");
        for (let i = 0; i < okButtons.length; i++) {
            okButtons[i].style.opacity  = isMatch ? null : "0.25";
            okButtons[i].onclick        = isMatch ? ()=>{input(INPUT_OK)} : null;
        }        

    }


    // Helper function for creating and adding standard buttons to a row
    function addButtonsToRow(row, model, chars, dark, smalltxt) {
        for (let c of chars) {
            let divButton = document.createElement("div");
            if (dark) {
                divButton.className = "fp-components-keyboard-button fp-components-keyboard-button-dark";
            } else {
                divButton.className = "fp-components-keyboard-button";
            }
            if (smalltxt) {
                divButton.className += " fp-components-keyboard-button-smalltxt";
            }
            row.appendChild(divButton);
            let spanChar = document.createElement("span");
            if (model !== null) {
                spanChar.textContent = model[c][0];
                divButton.onclick = model[c][1];
            } else {
                
                if (Array.isArray(c)) {
                    spanChar.textContent = c[0];
                    divButton.onclick = c[1];
                } else {
                    spanChar.textContent = c;
                }
            }            
            divButton.appendChild(spanChar);
        }
    }


    // Helper function for drawing a backspace symbol on a canvas
    function drawBackspace(canvas) {

        canvas.width = 29;
        canvas.height = 30;
        let ctx = canvas.getContext("2d");
        ctx.clearRect(0,0,canvas.width-1,canvas.height-1);

        ctx.translate(0,7);

        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 1.3;

        ctx.beginPath();
        ctx.moveTo(1,9);
        ctx.lineTo(9,1);
        ctx.lineTo(27,1);
        ctx.lineTo(27,17);
        ctx.lineTo(9,17);
        ctx.lineTo(1,9);
        ctx.stroke();

        ctx.moveTo(9,1);
        ctx.lineTo(27,17);
        ctx.stroke();

        ctx.moveTo(9,17);
        ctx.lineTo(27,1);
        ctx.stroke();
    }

    // Helper function for drawing a case symbol on a canvas
    function drawCase(canvas) {

        canvas.width = 29;
        canvas.height = 37;
        let ctx = canvas.getContext("2d");
        ctx.clearRect(0,0,canvas.width-1,canvas.height-1);

        ctx.translate(6.5,6);

        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 1.7;

        ctx.beginPath();
        ctx.moveTo(1,9);
        ctx.lineTo(8,1);
        ctx.lineTo(15,9)
        ctx.stroke();

        ctx.moveTo(8,1);
        ctx.lineTo(8,28);
        ctx.stroke();

    }

    // Helper function for drawing a move-cursor-left symbol on a canvas
    function drawLeft(canvas) {      
        
        canvas.width = 50
        canvas.height = 50;
        let ctx = canvas.getContext("2d");
        ctx.clearRect(0,0,canvas.width-1,canvas.height-1);

        ctx.translate(17,11);

        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 1.7;

        ctx.beginPath();
        ctx.moveTo(14,1);
        ctx.lineTo(1,14);
        ctx.lineTo(14,27)
        ctx.stroke();            
    }

    // Helper function for drawing a move-cursor-right symbol on a canvas
    function drawRight(canvas) {      
        
        canvas.width = 50
        canvas.height = 50;
        let ctx = canvas.getContext("2d");
        ctx.clearRect(0,0,canvas.width-1,canvas.height-1);

        ctx.translate(18,11);

        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 1.7;

        ctx.beginPath();
        ctx.moveTo(1,1);
        ctx.lineTo(14,14);
        ctx.lineTo(1,27)
        ctx.stroke();         
    }            


    function createAlphaKeyboard(model, id) {

        
        let divAlpha = document.createElement("div");
    
        /** ------ Row 1 **/
    
        let divRow1 = document.createElement("div");
        divRow1.className = "fp-components-keyboard-row";
        divAlpha.appendChild(divRow1);
    
        addButtonsToRow(divRow1, model, ["Q","W","E","R","T","Y","U","I","O","P"], false, false);
    
        let divBackspace = document.createElement("div");
        divBackspace.className = "fp-components-keyboard-button";
        divBackspace.style.flexGrow = "1";
        divBackspace.style.marginRight = "5px";
        divRow1.appendChild(divBackspace);
        let canvasBackspace = document.createElement("canvas");
        divBackspace.appendChild(canvasBackspace);
        drawBackspace(canvasBackspace);
        divBackspace.onclick = ()=> {
            input(INPUT_BACKSPACE);
        };
    
        /** ------ Row 2 **/
    
        let divRow2 = document.createElement("div");
        divRow2.className = "fp-components-keyboard-row";
        divRow2.style.justifyContent = "flex-end";
        divAlpha.appendChild(divRow2);
    
        addButtonsToRow(divRow2, model, ["A","S","D","F","G","H","J","K","L","dblq"], false, false);
    
        addButtonsToRow(divRow2, null, ["OK"], false, false);
        
        divRow2.lastChild.className += " fp-components-keyboard-button-blue fp-components-keyboard-ok";
        divRow2.lastChild.style.width = "161px";
        divRow2.lastChild.style.marginRight = "5px";
        divRow2.lastChild.onclick = ()=> {
            input(INPUT_OK);
        };
        
        /** ------ Row 3 **/
    
        let divRow3 = document.createElement("div");
        divRow3.className = "fp-components-keyboard-row";
        divAlpha.appendChild(divRow3);
    
        let divCase = document.createElement("div");
        divCase.className = "fp-components-keyboard-button fp-components-keyboard-button-dark";
        divRow3.appendChild(divCase);
        let canvasCase = document.createElement("canvas");
        divCase.appendChild(canvasCase);
        drawCase(canvasCase);
        divCase.onclick = ()=> {
            __fpComponentsKeyboardCase = !__fpComponentsKeyboardCase;
            switchKeyboard();
        };
    
        addButtonsToRow(divRow3, model, ["Z","X","C","V","B","N","M","semi","col","excl","dash"], false, false);
    
        /** ------ Row 4 **/
    
        let divRow4 = document.createElement("div");
        divRow4.className = "fp-components-keyboard-row";
        divAlpha.appendChild(divRow4);
    
        addButtonsToRow(divRow4, null,
            [
                ["&123",    ()=>
                    {
                        __fpComponentsKeyboardType = "symbol1";
                        switchKeyboard();
                    }
                ],
                ["Int'l",   ()=>
                    {
                        __fpComponentsKeyboardType = __fpComponentsKeyboardType === "intl" ? "alpha" : "intl";
                        switchKeyboard();
                    }
                ],
                ["Home",    ()=>{ input(INPUT_HOME); }  ]
            ],
            true, true);
    
        let divSpace = document.createElement("div");
        divSpace.className = "fp-components-keyboard-button";
        divSpace.style.flexGrow = "1";
        divRow4.appendChild(divSpace);
        divSpace.onclick = ()=> {
            input(" ");
        };
    
        addButtonsToRow(divRow4, null,
            [
                ["End",     ()=>{ input(INPUT_END); } ]
            ],
            true, true);
    
        let divLeft = document.createElement("div");
        divLeft.className = "fp-components-keyboard-button fp-components-keyboard-button-dark";
        divRow4.appendChild(divLeft);
        let canvasLeft = document.createElement("canvas");
        divLeft.appendChild(canvasLeft);
        drawLeft(canvasLeft);
        divLeft.onclick = ()=> {
            input(INPUT_LEFT);
        };
    
        let divRight = document.createElement("div");
        divRight.className = "fp-components-keyboard-button fp-components-keyboard-button-dark";
        divRight.style.marginRight = "5px";
        divRow4.appendChild(divRight);
        let canvasRight = document.createElement("canvas");
        divRight.appendChild(canvasRight);
        drawRight(canvasRight);
        divRight.onclick = ()=>{
            input(INPUT_RIGHT);
        }
    
        divAlpha.id = id;
        return divAlpha;
    
    }
    


    function createSymbolKeyboard(model, id) {

        let divSymbolKeyb = document.createElement("div");
        divSymbolKeyb.id = id;

        let divBlock1 = document.createElement("div");
        divBlock1.style.display         = "flex";
        divBlock1.style.flexDirection   = "column";
        divBlock1.style.minHeight       = "280px";
        divBlock1.style.maxHeight       = "280px";
        divSymbolKeyb.appendChild(divBlock1);
        
        let divButtonSymb1 = document.createElement("div");
        divButtonSymb1.className = "fp-components-keyboard-button fp-components-keyboard-button-dark";
        divButtonSymb1.style.flexGrow = "1";
        divButtonSymb1.style.marginBottom = "5px";
        divBlock1.appendChild(divButtonSymb1);
        divButtonSymb1.onclick = ()=> {
            __fpComponentsKeyboardType = __fpComponentsKeyboardType === "symbol1" ? "symbol2" : "symbol1";
            switchKeyboard();
        }
        let canvasSymb1 = document.createElement("canvas");
        divButtonSymb1.appendChild(canvasSymb1);
        drawCase(canvasSymb1);


        /*
        let divButtonSymb2 = document.createElement("div");
        divButtonSymb2.className = "fp-components-keyboard-button fp-components-keyboard-button-dark";
        divButtonSymb2.style.flexGrow = "1";
        divButtonSymb2.style.marginBottom = "5px";
        divBlock1.appendChild(divButtonSymb2);
        divButtonSymb2.onclick = ()=> {
            __fpComponentsKeyboardType = "symbol2";
            switchKeyboard();
        } */       

        let divButtonAlpha = document.createElement("div");
        divButtonAlpha.className = "fp-components-keyboard-button fp-components-keyboard-button-dark fp-components-keyboard-button-smalltxt";
        divButtonAlpha.style.minHeight = "65px";
        divButtonAlpha.style.maxHeight = "65px";
        divButtonAlpha.style.marginBottom = "5px";
        divBlock1.appendChild(divButtonAlpha);
        let divButtonAlphaCont = document.createElement("span");
        divButtonAlphaCont.textContent = "&123";
        divButtonAlpha.appendChild(divButtonAlphaCont);
        divButtonAlpha.onclick = ()=> {
            __fpComponentsKeyboardType = "alpha";
            switchKeyboard();
        };
        
        let divBlock2 = document.createElement("div");
        divSymbolKeyb.appendChild(divBlock2);

        let divRow1 = document.createElement("div");
        divRow1.className = "fp-components-keyboard-row";
        divBlock2.appendChild(divRow1);

        addButtonsToRow(divRow1, model, ["r1b1","r1b2","r1b3","r1b4","r1b5","r1b6"], false, false);       

        let divRow2 = document.createElement("div");
        divRow2.className = "fp-components-keyboard-row";
        divBlock2.appendChild(divRow2);

        addButtonsToRow(divRow2, model, ["r2b1","r2b2","r2b3","r2b4","r2b5","r2b6"], false, false);

        let divRow3 = document.createElement("div");
        divRow3.className = "fp-components-keyboard-row";
        divBlock2.appendChild(divRow3);

        addButtonsToRow(divRow3, model, ["r3b1","r3b2","r3b3","r3b4","r3b5","r3b6"], false, false);        

        let divRow4 = document.createElement("div");
        divRow4.className = "fp-components-keyboard-row";
        divBlock2.appendChild(divRow4);

        addButtonsToRow(divRow4, null,
            [
                ["Int'l",    ()=>
                    {
                        __fpComponentsKeyboardType = "intl";
                        switchKeyboard();
                    }
                ]
            ],
        true, true);

        let divSpace = document.createElement("div");
        divSpace.className = "fp-components-keyboard-button";
        divSpace.style.flexGrow = "1";
        divRow4.appendChild(divSpace);
        divSpace.onclick = ()=> {
            input(" ");
        };        
        
        let divLeft = document.createElement("div");
        divLeft.className = "fp-components-keyboard-button fp-components-keyboard-button-dark";
        divRow4.appendChild(divLeft);
        let canvasLeft = document.createElement("canvas");
        divLeft.appendChild(canvasLeft);
        drawLeft(canvasLeft);
        divLeft.onclick = ()=> {
            input(INPUT_LEFT);
        };
    
        let divRight = document.createElement("div");
        divRight.className = "fp-components-keyboard-button fp-components-keyboard-button-dark";
        divRow4.appendChild(divRight);
        let canvasRight = document.createElement("canvas");
        divRight.appendChild(canvasRight);
        drawRight(canvasRight);
        divRight.onclick = ()=>{
            input(INPUT_RIGHT);
        }

        let divDistance1 = document.createElement("div");
        divDistance1.style.flexGrow = "1";
        divSymbolKeyb.appendChild(divDistance1);

        let divBlock3 = document.createElement("div");
        divSymbolKeyb.appendChild(divBlock3);

        let divRow5 = document.createElement("div");
        divRow5.className = "fp-components-keyboard-row";
        divBlock3.appendChild(divRow5);

        addButtonsToRow(divRow5, null,
            [
                ["7", ()=>{ input("7"); } ],
                ["8", ()=>{ input("8"); } ],
                ["9", ()=>{ input("9"); } ]
            ], false, false);           

        let divRow6 = document.createElement("div");
        divRow6.className = "fp-components-keyboard-row";
        divBlock3.appendChild(divRow6);

        addButtonsToRow(divRow6, null,
            [
                ["4", ()=>{ input("4"); } ],
                ["5", ()=>{ input("5"); } ],
                ["6", ()=>{ input("6"); } ]
            ], false, false);         

        let divRow7 = document.createElement("div");
        divRow7.className = "fp-components-keyboard-row";
        divBlock3.appendChild(divRow7);

        addButtonsToRow(divRow7, null,
            [
                ["1", ()=>{ input("1"); } ],
                ["2", ()=>{ input("2"); } ],
                ["3", ()=>{ input("3"); } ]
            ], false, false); 
        
        let divRow8 = document.createElement("div");
        divRow8.className = "fp-components-keyboard-row";
        divBlock3.appendChild(divRow8);

        let divZero = document.createElement("div");
        divZero.className = "fp-components-keyboard-button";
        divZero.style.flexGrow = "1";        
        divRow8.appendChild(divZero);
        divZero.onclick = ()=> {
            input("0");
        };
        let divZeroCont = document.createElement("span");
        divZeroCont.textContent = "0";
        divZero.appendChild(divZeroCont);

        addButtonsToRow(divRow8, null,
            [
                [".", ()=>{ input("."); } ]
            ], false, false);

        let divDistance2 = document.createElement("div");
        divDistance2.style.flexGrow = "1";
        divSymbolKeyb.appendChild(divDistance2);  
        
        let divBlock4 = document.createElement("div");
        divBlock4.style.display = "flex";
        divBlock4.style.flexDirection = "column";
        divBlock4.style.minHeight = "280px";
        divBlock4.style.maxHeight = "280px";
        divBlock4.style.marginRight = "5px";
        divSymbolKeyb.appendChild(divBlock4);

        let divBackspace = document.createElement("div");
        divBackspace.className = "fp-components-keyboard-button";
        divBackspace.style.flexGrow = "1";
        divBackspace.style.marginBottom = "5px";
        let canvasBackspace = document.createElement("canvas");
        divBackspace.appendChild(canvasBackspace);
        drawBackspace(canvasBackspace);
        divBlock4.appendChild(divBackspace);
        divBackspace.onclick = ()=> {
            input(INPUT_BACKSPACE);
        };

        let divOK = document.createElement("div");
        divOK.className = "fp-components-keyboard-button fp-components-keyboard-button-blue fp-components-keyboard-ok";
        divOK.style.flexGrow = "1";
        divOK.style.marginBottom = "5px";
        divBlock4.appendChild(divOK);
        let divOKCont = document.createElement("span");
        divOKCont.textContent = "OK";
        divOK.appendChild(divOKCont);
        divOK.onclick = ()=>{
            input(INPUT_OK);
        };


        return divSymbolKeyb;

    }



    const INPUT_BACKSPACE   = {};
    const INPUT_LEFT        = {};
    const INPUT_RIGHT       = {};
    const INPUT_HOME        = {};
    const INPUT_END         = {};
    const INPUT_OK          = {};

    function input(c) {

        let f = document.getElementById("fp-components-keyboard-input-id");
        if (f === null) {
            return;
        }

        f.focus();

        if (typeof c === "string") {
            let oldSelStart = f.selectionStart;
            if (f.selectionStart != f.selectionEnd) {
                f.value = f.value.slice(0,oldSelStart) + f.value.slice(f.selectionEnd);
            }
            f.value = f.value.slice(0,oldSelStart) + c + f.value.slice(oldSelStart);
            //f.selectionStart = oldSelStart + 1;
            //f.selectionEnd = f.selectionStart;            
            //setTimeout(()=>{
                // Work-around for a flaw in Edge/WebView. Just moving the cursor did not "scroll" the input field
                // when entering characters at the far-right end of the input field. Optimally we should just do
                //      f.selectionStart = oldSelStart + 1;
                //      f.selectionEnd = f.selectionStart;
                // above, without the timeout.
                f.selectionStart = oldSelStart;
                f.selectionEnd = oldSelStart;
                f.selectionStart = oldSelStart + 1;
                f.selectionEnd = f.selectionStart;
            //}, 0);
            
        }

        else if (c === INPUT_BACKSPACE) {
            let oldSelStart = f.selectionStart;
            if (oldSelStart != f.selectionEnd) {
                f.value = f.value.slice(0,oldSelStart) + f.value.slice(f.selectionEnd);
                f.selectionStart = oldSelStart;
                f.selectionEnd = oldSelStart;
            } else if (oldSelStart > 0) {
                f.value = f.value.slice(0,oldSelStart-1) +f.value.slice(oldSelStart);
                f.selectionStart = oldSelStart - 1;
                f.selectionEnd = oldSelStart - 1;
            }
        }

        else if (c === INPUT_LEFT) {
            if (f.selectionStart > 0 && f.selectionStart == f.selectionEnd) {
                f.selectionStart--;
            }
            f.selectionEnd = f.selectionStart;
        }

        else if (c === INPUT_RIGHT) {
            if (f.selectionStart < f.value.length) {
                if (f.selectionStart == f.selectionEnd) {
                    f.selectionStart++;
                } else {
                    f.selectionStart = f.selectionEnd;
                }
                
            }
            f.selectionEnd = f.selectionStart;
        }

        else if (c === INPUT_HOME) {
            f.selectionStart = 0;
            f.selectionEnd = 0;
        }

        else if (c === INPUT_END) {
            f.selectionStart = f.value.length;
            f.selectionEnd = f.value.length;
        }

        else if (c === INPUT_OK) {
            if (__fpComponentsKeyboardCallback !== null && typeof __fpComponentsKeyboardCallback === "function") {
                document.getElementById("fp-components-keyboard-id").style.display = "none";
                document.getElementById("fp-components-keyboard-background-id").style.display = "none";
                let inputField = document.getElementById("fp-components-keyboard-input-id");
                let val = inputField.value;
                inputField.value = "";
                __fpComponentsKeyboardCallback(val);
            }
        }

        validateInput();

    }

    function switchKeyboard() {

        let f = document.getElementById("fp-components-keyboard-input-id");
        f.focus();

        let keybLow     = document.getElementById("fp-components-keyboard-alpha-lower-int1");
        let keybUpp     = document.getElementById("fp-components-keyboard-alpha-upper-int1");
        let keybLowIntl = document.getElementById("fp-components-keyboard-alpha-lower-int2");
        let keybUppIntl = document.getElementById("fp-components-keyboard-alpha-upper-int2");
        let keySymbol1  = document.getElementById("fp-components-keyboard-symbol1");
        let keySymbol2  = document.getElementById("fp-components-keyboard-symbol2");

        keybLow.style.display       = (__fpComponentsKeyboardType === "alpha" && !__fpComponentsKeyboardCase)   ? "block" : "none";
        keybUpp.style.display       = (__fpComponentsKeyboardType === "alpha" && __fpComponentsKeyboardCase)    ? "block" : "none";
        keybLowIntl.style.display   = (__fpComponentsKeyboardType === "intl" && !__fpComponentsKeyboardCase)    ? "block" : "none";
        keybUppIntl.style.display   = (__fpComponentsKeyboardType === "intl" && __fpComponentsKeyboardCase)     ? "block" : "none";
        keySymbol1.style.display    = (__fpComponentsKeyboardType === "symbol1")                                ? "flex"  : "none";
        keySymbol2.style.display    = (__fpComponentsKeyboardType === "symbol2")                                ? "flex"  : "none";
    }

    
    
    let existing = document.getElementById("fp-components-keyboard-id");

    // If there is no keyboard present, create one..
    if (existing === null) {

        const defaultAlphaLowerCase = {
            Q:          [    "q",           ()=>{ input("q"); }  ],
            W:          [    "w",           ()=>{ input("w"); }  ],
            E:          [    "e",           ()=>{ input("e"); }  ],
            R:          [    "r",           ()=>{ input("r"); }  ],
            T:          [    "t",           ()=>{ input("t"); }  ],
            Y:          [    "y",           ()=>{ input("y"); }  ],
            U:          [    "u",           ()=>{ input("u"); }  ],
            I:          [    "i",           ()=>{ input("i"); }  ],
            O:          [    "o",           ()=>{ input("o"); }  ],
            P:          [    "p",           ()=>{ input("p"); }  ],
    
            A:          [    "a",           ()=>{ input("a"); }  ],
            S:          [    "s",           ()=>{ input("s"); }  ],
            D:          [    "d",           ()=>{ input("d"); }  ],
            F:          [    "f",           ()=>{ input("f"); }  ],
            G:          [    "g",           ()=>{ input("g"); }  ],
            H:          [    "h",           ()=>{ input("h"); }  ],
            J:          [    "j",           ()=>{ input("j"); }  ],
            K:          [    "k",           ()=>{ input("k"); }  ],
            L:          [    "l",           ()=>{ input("l"); }  ],
            dblq:       [    "'",           ()=>{ input("'"); }  ],
    
            Z:          [    "z",           ()=>{ input("z"); }  ],
            X:          [    "x",           ()=>{ input("x"); }  ],
            C:          [    "c",           ()=>{ input("c"); }  ],
            V:          [    "v",           ()=>{ input("v"); }  ],
            B:          [    "b",           ()=>{ input("b"); }  ],
            N:          [    "n",           ()=>{ input("n"); }  ],
            M:          [    "m",           ()=>{ input("m"); }  ],
            semi:       [    ",",           ()=>{ input(","); }  ],
            col:        [    ".",           ()=>{ input("."); }  ],
            excl:       [    "?",           ()=>{ input("?"); }  ],
            dash:       [    "-",           ()=>{ input("-"); }  ],

        };

        const defaultAlphaUpperCase = {
            Q:          [    "Q",           ()=>{ input("Q"); }  ],
            W:          [    "W",           ()=>{ input("W"); }  ],
            E:          [    "E",           ()=>{ input("E"); }  ],
            R:          [    "R",           ()=>{ input("R"); }  ],
            T:          [    "T",           ()=>{ input("T"); }  ],
            Y:          [    "Y",           ()=>{ input("Y"); }  ],
            U:          [    "U",           ()=>{ input("U"); }  ],
            I:          [    "I",           ()=>{ input("I"); }  ],
            O:          [    "O",           ()=>{ input("O"); }  ],
            P:          [    "P",           ()=>{ input("P"); }  ],
    
            A:          [    "A",           ()=>{ input("A"); }  ],
            S:          [    "S",           ()=>{ input("S"); }  ],
            D:          [    "D",           ()=>{ input("D"); }  ],
            F:          [    "F",           ()=>{ input("F"); }  ],
            G:          [    "G",           ()=>{ input("G"); }  ],
            H:          [    "H",           ()=>{ input("H"); }  ],
            J:          [    "J",           ()=>{ input("J"); }  ],
            K:          [    "K",           ()=>{ input("K"); }  ],
            L:          [    "L",           ()=>{ input("L"); }  ],
            dblq:       [    "\"",          ()=>{ input("\""); } ],
    
            Z:          [    "Z",           ()=>{ input("Z"); }  ],
            X:          [    "X",           ()=>{ input("X"); }  ],
            C:          [    "C",           ()=>{ input("C"); }  ],
            V:          [    "V",           ()=>{ input("V"); }  ],
            B:          [    "B",           ()=>{ input("B"); }  ],
            N:          [    "N",           ()=>{ input("N"); }  ],
            M:          [    "M",           ()=>{ input("M"); }  ],
            semi:       [    ";",           ()=>{ input(";"); }  ],
            col:        [    ":",           ()=>{ input(":"); }  ],
            excl:       [    "!",           ()=>{ input("!"); }  ],
            dash:       [    "_",           ()=>{ input("_"); }  ],

        };

        const intlAlphaUpperCase = {
            Q:          [    "À",           ()=>{ input("À"); }  ],
            W:          [    "Á",           ()=>{ input("Á"); }  ],
            E:          [    "Â",           ()=>{ input("Â"); }  ],
            R:          [    "Ã",           ()=>{ input("Ã"); }  ],
            T:          [    "Ä",           ()=>{ input("Ä"); }  ],
            Y:          [    "Å",           ()=>{ input("Å"); }  ],
            U:          [    "Æ",           ()=>{ input("Æ"); }  ],
            I:          [    "Ç",           ()=>{ input("Ç"); }  ],
            O:          [    "Ð",           ()=>{ input("Ð"); }  ],
            P:          [    "Ñ",           ()=>{ input("Ñ"); }  ],
    
            A:          [    "È",           ()=>{ input("È"); }  ],
            S:          [    "É",           ()=>{ input("É"); }  ],
            D:          [    "Ê",           ()=>{ input("Ê"); }  ],
            F:          [    "Ë",           ()=>{ input("Ë"); }  ],
            G:          [    "Ì",           ()=>{ input("Ì"); }  ],
            H:          [    "Í",           ()=>{ input("Í"); }  ],
            J:          [    "Î",           ()=>{ input("Î"); }  ],
            K:          [    "Ï",           ()=>{ input("Ï"); }  ],
            L:          [    "Þ",           ()=>{ input("Þ"); }  ],
            dblq:       [    "\"",          ()=>{ input("\""); } ],
    
            Z:          [    "Ò",           ()=>{ input("Ò"); }  ],
            X:          [    "Ó",           ()=>{ input("Ó"); }  ],
            C:          [    "Ô",           ()=>{ input("Ô"); }  ],
            V:          [    "Õ",           ()=>{ input("Õ"); }  ],
            B:          [    "Ö",           ()=>{ input("Ö"); }  ],
            N:          [    "Ù",           ()=>{ input("Ù"); }  ],
            M:          [    "Ú",           ()=>{ input("Ú"); }  ],
            semi:       [    "Û",           ()=>{ input("Û"); }  ],
            col:        [    "Ü",           ()=>{ input("Ü"); }  ],
            excl:       [    "Ý",           ()=>{ input("Ý"); }  ],
            dash:       [    "ß",           ()=>{ input("ß"); }  ],

        };

        const intlAlphaLowerCase = {
            Q:          [    "à",           ()=>{ input("à"); }  ],
            W:          [    "á",           ()=>{ input("á"); }  ],
            E:          [    "â",           ()=>{ input("â"); }  ],
            R:          [    "ã",           ()=>{ input("ã"); }  ],
            T:          [    "ä",           ()=>{ input("ä"); }  ],
            Y:          [    "å",           ()=>{ input("å"); }  ],
            U:          [    "æ",           ()=>{ input("æ"); }  ],
            I:          [    "ç",           ()=>{ input("ç"); }  ],
            O:          [    "ð",           ()=>{ input("ð"); }  ],
            P:          [    "ñ",           ()=>{ input("ñ"); }  ],
    
            A:          [    "è",           ()=>{ input("è"); }  ],
            S:          [    "é",           ()=>{ input("é"); }  ],
            D:          [    "ê",           ()=>{ input("ê"); }  ],
            F:          [    "ë",           ()=>{ input("ë"); }  ],
            G:          [    "ì",           ()=>{ input("ì"); }  ],
            H:          [    "í",           ()=>{ input("í"); }  ],
            J:          [    "î",           ()=>{ input("î"); }  ],
            K:          [    "ï",           ()=>{ input("ï"); }  ],
            L:          [    "þ",           ()=>{ input("þ"); }  ],
            dblq:       [    "'",           ()=>{ input("'"); }  ],
    
            Z:          [    "ò",           ()=>{ input("ò"); }  ],
            X:          [    "ó",           ()=>{ input("ó"); }  ],
            C:          [    "ô",           ()=>{ input("ô"); }  ],
            V:          [    "õ",           ()=>{ input("õ"); }  ],
            B:          [    "ö",           ()=>{ input("ö"); }  ],
            N:          [    "ù",           ()=>{ input("ù"); }  ],
            M:          [    "ú",           ()=>{ input("ú"); }  ],
            semi:       [    "û",           ()=>{ input("û"); }  ],
            col:        [    "ü",           ()=>{ input("ü"); }  ],
            excl:       [    "ý",           ()=>{ input("ý"); }  ],
            dash:       [    "ÿ",           ()=>{ input("ÿ"); }  ],

        };
        
        const symbol1 = {

            r1b1:       [    "!",           ()=>{ input("!"); }  ],
            r1b2:       [    "@",           ()=>{ input("@"); }  ],
            r1b3:       [    "#",           ()=>{ input("#"); }  ],
            r1b4:       [    "$",           ()=>{ input("$"); }  ],
            r1b5:       [    "%",           ()=>{ input("%"); }  ],
            r1b6:       [    "&",           ()=>{ input("&"); }  ],
            
            r2b1:       [    "(",           ()=>{ input("("); }  ],
            r2b2:       [    ")",           ()=>{ input(")"); }  ],
            r2b3:       [    "-",           ()=>{ input("-"); }  ],
            r2b4:       [    "=",           ()=>{ input("="); }  ],
            r2b5:       [    "+",           ()=>{ input("+"); }  ],
            r2b6:       [    "\\",          ()=>{ input("\\"); } ],

            r3b1:       [    ";",           ()=>{ input(";"); }  ],
            r3b2:       [    ":",           ()=>{ input(":"); }  ],
            r3b3:       [    "\"",          ()=>{ input("\""); } ],
            r3b4:       [    "*",           ()=>{ input("*"); }  ],
            r3b5:       [    "/",           ()=>{ input("/"); }  ],
            r3b6:       [    "~",           ()=>{ input("~"); }  ],
        };
        
        const symbol2 = {

            r1b1:       [    "¿",           ()=>{ input("¿"); }  ],
            r1b2:       [    "¡",           ()=>{ input("¡"); }  ],
            r1b3:       [    "¢",           ()=>{ input("¢"); }  ],
            r1b4:       [    "£",           ()=>{ input("£"); }  ],
            r1b5:       [    "¥",           ()=>{ input("¥"); }  ],
            r1b6:       [    "§",           ()=>{ input("§"); }  ],
            
            r2b1:       [    "{",           ()=>{ input("{"); }  ],
            r2b2:       [    "}",           ()=>{ input("}"); }  ],
            r2b3:       [    "<",           ()=>{ input("<"); }  ],
            r2b4:       [    ">",           ()=>{ input(">"); }  ],
            r2b5:       [    "[",           ()=>{ input("["); }  ],
            r2b6:       [    "]",           ()=>{ input("]"); }  ],

            r3b1:       [    "`",           ()=>{ input("`"); }  ],
            r3b2:       [    "|",           ()=>{ input("|"); }  ],
            r3b3:       [    "´",           ()=>{ input("´"); }  ],
            r3b4:       [    "°",           ()=>{ input("°"); }  ],
            r3b5:       [    "±",           ()=>{ input("±"); }  ],
            r3b6:       [    "µ",           ()=>{ input("µ"); }  ],
        };        



        /** Common background */

        let divKeyboard = document.createElement("div");
        divKeyboard.className = "fp-components-keyboard";
        divKeyboard.id = "fp-components-keyboard-id";

        let divTop = document.createElement("div");
        divTop.className = "fp-components-keyboard-toparea";
        divKeyboard.appendChild(divTop);

        let divLabel = document.createElement("div");
        divLabel.className = "fp-components-keyboard-label";
        divKeyboard.appendChild(divLabel);

        let pX = document.createElement("p");
        pX.textContent = "X";
        pX.className = "fp-components-keyboard-x";
        divTop.appendChild(pX);
        pX.onclick = ()=> {cancel();};

        /** Input field  **/

        let f = document.createElement("input");
        f.className = "fp-components-keyboard-input";
        f.id = "fp-components-keyboard-input-id";
        f.addEventListener("input",validateInput);
        divTop.appendChild(f);

        /** Alpha keyboards **/

        let divAlphaLower = createAlphaKeyboard(defaultAlphaLowerCase, "fp-components-keyboard-alpha-lower-int1");
        divAlphaLower.style.display = "block";
        divKeyboard.appendChild(divAlphaLower);        

        let divAlphaUpper = createAlphaKeyboard(defaultAlphaUpperCase, "fp-components-keyboard-alpha-upper-int1");
        divAlphaUpper.style.display = "none";
        divKeyboard.appendChild(divAlphaUpper);

        let divIntlAlphaUpper = createAlphaKeyboard(intlAlphaUpperCase, "fp-components-keyboard-alpha-upper-int2");
        divIntlAlphaUpper.style.display = "none";
        divKeyboard.appendChild(divIntlAlphaUpper);

        let divIntlAlphaLower = createAlphaKeyboard(intlAlphaLowerCase, "fp-components-keyboard-alpha-lower-int2");
        divIntlAlphaLower.style.display = "none";
        divKeyboard.appendChild(divIntlAlphaLower);

        let divSymbol1 = createSymbolKeyboard(symbol1, "fp-components-keyboard-symbol1");
        divSymbol1.style.display = "none";
        divKeyboard.appendChild(divSymbol1);

        let divSymbol2 = createSymbolKeyboard(symbol2, "fp-components-keyboard-symbol2");
        divSymbol2.style.display = "none";
        divKeyboard.appendChild(divSymbol2);

        let divBackshade = document.createElement("div");
        divBackshade.id = "fp-components-keyboard-background-id";
        divBackshade.className = "fp-components-keyboard-background";
        divBackshade.onclick = ()=> {
            cancel();
        };

        /** Append to body **/

        let body = document.getElementsByTagName("body")[0];
        body.appendChild(divBackshade);
        body.appendChild(divKeyboard);
        existing = divKeyboard;

    }

    let inputField = document.getElementById("fp-components-keyboard-input-id");
    inputField.value = initialText === null ? "" : initialText.toString();
    document.getElementById("fp-components-keyboard-background-id").style.display = "block";
    existing.style.display = "block";
    inputField.focus();
    inputField.selectionStart = 0;
    inputField.selectionEnd = inputField.value.length;
    
    let labelDiv = document.getElementsByClassName("fp-components-keyboard-label")[0];
    labelDiv.textContent = __fpComponentsKeyboardLabel === null ? " " : __fpComponentsKeyboardLabel;

    if (variant === FP_COMPONENTS_KEYBOARD_ALPHA) {
        __fpComponentsKeyboardCase = false;
        __fpComponentsKeyboardType = "alpha";
        switchKeyboard();
    } else if (variant === FP_COMPONENTS_KEYBOARD_NUM) {
        __fpComponentsKeyboardCase = false;
        __fpComponentsKeyboardType = "symbol1";
        switchKeyboard();        
    } 

    validateInput();

}














/******* DEBUG WINDOW *******/

var __fpComponentsDebugWindowLock = false;

function fpComponentsEnableLog () {

    const NORMAL    = 1;
    const INFO      = 2;
    const ERROR     = 3;
    const WARN      = 4;

    function currentTime() {
        function pad(n) { return ("00"+n).slice(-2); }
        let now = new Date();
        return pad(now.getHours()) + ":" + pad(now.getMinutes()) + "." + pad(now.getSeconds());
    }

    function updateClock() {
        let clock = document.getElementById("fp-debugwindow-clock");
        clock.textContent = currentTime();
        setTimeout(updateClock, 1000);
    }

    function logToDebugWindow(message, level) {
        let debugWindowContent = document.getElementById("fp-debugwindow-content");
        if (debugWindowContent !== null) {

            let now = new Date();

            let newEntry = document.createElement("p");
            if (level === ERROR) {
                newEntry.style.fontWeight = "bold";
                newEntry.style.textDecoration = "underline";
            } else if (level === WARN) {
                newEntry.style.fontWeight = "bold";
            } else if (level === INFO) {
                newEntry.style.fontStyle = "italic";
            }
            newEntry.textContent = "§ " + currentTime() + " - " + message;
            debugWindowContent.appendChild(newEntry);
            if (debugWindowContent.children.length > 1000) {
                debugWindowContent.removeChild(debugWindowContent.children[0]);
            }
            if (!__fpComponentsDebugWindowLock) {
                debugWindowContent.scrollTop = debugWindowContent.scrollHeight;
            }
        }
    }

    let divWindow = document.createElement("div");
    divWindow.id = "fp-debugwindow";

    let divGrid = document.createElement("div");
    divGrid.id = "fp-debugwindow-grid";

    let divMenu = document.createElement("div");
    divMenu.id = "fp-debugwindow-menu";

    let pClock = document.createElement("p");
    pClock.id = "fp-debugwindow-clock";
    pClock.style.display = "inline-block";
    pClock.textContent = "xx:xx.xx";
    divMenu.appendChild(pClock);

    let divMinimize = document.createElement("div");
    divMinimize.className = "fp-debugwindow-button";
    divMinimize.onclick = minimizeFPComponentsLog;
    divMinimize.textContent = "Minimize";
    divMenu.appendChild(divMinimize);

    let divClear = document.createElement("div");
    divClear.className = "fp-debugwindow-button";
    divClear.onclick = clearFPComponentsLog;
    divClear.textContent = "Clear";
    divMenu.appendChild(divClear);

    let divGhost = document.createElement("div");
    divGhost.id = "fp-debugwindow-ghostbutton";
    divGhost.className = "fp-debugwindow-button";
    divGhost.onclick = ghostFPComponentsLog;
    divGhost.textContent = "Ghost";
    divMenu.appendChild(divGhost);

    let divLock = document.createElement("div");
    divLock.id = "fp-debugwindow-scrollbutton";
    divLock.className = "fp-debugwindow-button";
    divLock.onclick = lockScrollFPComponentsLog;
    divLock.textContent = "Lock scroll";
    divMenu.appendChild(divLock);

    divGrid.appendChild(divMenu);

    let divContent = document.createElement("div");
    divContent.id = "fp-debugwindow-content";
    divGrid.appendChild(divContent);

    divWindow.appendChild(divGrid);

    let divBody = document.getElementsByTagName("body")[0];
    divBody.appendChild(divWindow);

    let divRaise = document.createElement("div");
    divRaise.id = "fp-debugwindow-minimized";
    divRaise.onclick = raiseFPComponentsLog;

    divBody.appendChild(divRaise);


    updateClock();

    let originalConsoleLog = console.log;
    console.log = (message) => {
        logToDebugWindow(message, NORMAL);
        originalConsoleLog.apply(console, [message]);
    }

    let originalConsoleInfo = console.info;
    console.info = (message) => {
        logToDebugWindow(message, INFO);
        originalConsoleInfo.apply(console, [message]);
    }

    let originalConsoleWarn = console.warn;
    console.warn = (message) => {
        logToDebugWindow(message, WARN);
        originalConsoleWarn.apply(console, [message]);
    }

    let originalConsoleError = console.error;
    console.error = (message) => {
        logToDebugWindow(message, ERROR);
        originalConsoleError.apply(console, [message]);
    }

    window.addEventListener("error", e => {
        console.error(e.filename + " (" + e.lineno + ":" + e.colno + "): " +  e.message);
    });

}

function ghostFPComponentsLog() {

    let debugWindow = document.getElementById("fp-debugwindow");
    if (debugWindow !== null) {
        debugWindow.style.opacity = "0.5";
        debugWindow.style.pointerEvents = "none";
        let ghostButton = document.getElementById("fp-debugwindow-ghostbutton");
        ghostButton.textContent = "Solid";
        ghostButton.onclick = solidFPComponentsLog;
    }
}

function solidFPComponentsLog() {

    let debugWindow = document.getElementById("fp-debugwindow");
    if (debugWindow !== null) {
        debugWindow.style.opacity = "1";
        debugWindow.style.pointerEvents = "all";
        let ghostButton = document.getElementById("fp-debugwindow-ghostbutton");
        ghostButton.textContent = "Ghost";
        ghostButton.onclick = ghostFPComponentsLog;
    }
}

function lockScrollFPComponentsLog() {

    let debugWindow = document.getElementById("fp-debugwindow");
    if (debugWindow !== null) {
        __fpComponentsDebugWindowLock = true;
        let scrollButton = document.getElementById("fp-debugwindow-scrollbutton");
        scrollButton.textContent = "Auto-scroll";
        scrollButton.onclick = autoScrollFPComponentsLog;
    }

}

function autoScrollFPComponentsLog() {

    let debugWindow = document.getElementById("fp-debugwindow");
    if (debugWindow !== null) {
        __fpComponentsDebugWindowLock = false;
        let scrollButton = document.getElementById("fp-debugwindow-scrollbutton");
        scrollButton.textContent = "Lock scroll";
        scrollButton.onclick = lockScrollFPComponentsLog;
    }
}

function clearFPComponentsLog() {

    let debugWindowContent = document.getElementById("fp-debugwindow-content");
    if (debugWindowContent !== null) {
        while(debugWindowContent.firstChild) {
            debugWindowContent.removeChild(debugWindowContent.firstChild);
        }
    }

}

function raiseFPComponentsLog() {

    let debugWindow = document.getElementById("fp-debugwindow");
    if (debugWindow !== null) debugWindow.style.display = "block";

    let debugWindowMinimized = document.getElementById("fp-debugwindow-minimized");
    if (debugWindowMinimized !== null) debugWindowMinimized.style.display = "none";
}

function minimizeFPComponentsLog() {

    let debugWindow = document.getElementById("fp-debugwindow");
    if (debugWindow !== null) debugWindow.style.display = "none";

    let debugWindowMinimized = document.getElementById("fp-debugwindow-minimized");
    if (debugWindowMinimized !== null) debugWindowMinimized.style.display = "block";
}