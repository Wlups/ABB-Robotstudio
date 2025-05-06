var mainMenu;
var radio1;
var radio2;
var Switch1;
var startExButton;
var stopExButton;

/* CONTENT CONTROLLER SETTINGS VIEW  */
function createSettingsContent() {
    Create_radio();
    Create_Switch();
    Create_StartEx_Button();
    Create_StopEx_Button();
}

/*Radio buttons Auto-Manual, only one radio button can be active*/
function Create_radio() {
    try {
        radio1 = new FPComponents.Radio_A();
        radio1.attachToId("sc-radio-1");
        radio1.onclick = () => {
            radio2.checked = false;//Clicking on radio 1 disables radio 2.
            RWS.Controller.setOperationMode('manual'); //Sets controller to manual mode
        }
 
        radio2 = new FPComponents.Radio_A();
        radio2.attachToId("sc-radio-2");
        radio2.onclick = () => {
            radio1.checked = false;//Clicking on radio 2 disables radio 1.
            RWS.Controller.setOperationMode('automatic'); //Sets controller to automatic mode
        }
        Load_Manual_Auto(radio1, radio2);
    } catch (e) { console.log("Error with the radio buttons!"); }
}

/*Switch Motors On-Off*/
function Create_Switch() {
    try {
        Switch1 = new FPComponents.Switch_A();
        Switch1.scale = 1.5;//Set the switch to a 1.5 scale.
        Switch1.attachToId("sc-switch-1");
        Switch1.onchange = async function () {
            //Check switch position before turn on or turn off the motors
            if (Switch1.active == false) {
                console.log("to_off");
                await RWS.Controller.setMotorsState('motors_off'); //Turn off the motors
            } else {
                console.log("to_on");
                await RWS.Controller.setMotorsState('motors_on'); //Turn on the motors
            }
        }
        Load_Motor_State(Switch1);
    } catch (e) { console.log("Error with the switch button!"); }
}

/* CREATE Start Execution BUTTON */
function Create_StartEx_Button() {
    try {
        startExButton = new FPComponents.Button_A();
        startExButton.attachToId("Start_Program_Button");
        startExButton.text = "Alusta";
        startExButton.onclick = async function () {
            try {
                //Realiza un procedimiento para iniciar el programa
                await RWS.Rapid.resetPP();//Sets the Program Pointer to main
                await RWS.Controller.setMotorsState('motors_on'); //Turns the motors on
                Switch1.active = true; //After switching the motors to on, the motor switch is updated.
                await RWS.Rapid.startExecution({ //Starts the execution of the program with the desired features
                    regainMode: 'continue',
                    executionMode: 'continue',
                    cycleMode: 'forever',
                    condition: 'none',
                    stopAtBreakpoint: false,
                    enableByTSP: true
                });
            } catch (error) {
                console.log("Error with the start procedure!");
            }
        };

    } catch (e) { console.log("Error with the Start Execution buttons!"); }
}

/* CREATE Stop Execution BUTTON */
function Create_StopEx_Button() {
    try {
        stopExButton = new FPComponents.Button_A();
        stopExButton.attachToId("Stop_Program_Button");
        stopExButton.text = "Lõpeta";
        stopExButton.onclick = async function () {
            await RWS.Rapid.stopExecution({
                stopMode: 'stop',//You can stop cycles, instructions or programs, in this case putting 'stop' we stop the program.
                useTSP: 'normal'//With 'normal' we only stop the normal tasks, not the static ones.
            });
        };

    } catch (e) { console.log("Something has gone wrong with the radio buttons!", "ERROR " + e); }
}

/*Function to set the radio buttons to their initial state*/
async function Load_Manual_Auto(radio1, radio2) {
    var state = await RWS.Controller.getOperationMode();
    if (state == 'automatic') {
        console.log("The controller is in automatic mode");
        radio2.checked = true;
        radio1.checked = false;
    } else {
        console.log("The controller is in manual mode");
        radio1.checked = true;
        radio2.checked = false;
    }
}

/*Function to set the switch to its initial state*/
async function Load_Motor_State(Switch1) {
    var state = await RWS.Controller.getControllerState();
    console.log(state);
    if (state == 'motors_on') {
        Switch1.active = true;
    } else {
        Switch1.active = false;
    }
}