const EnableKitsUserFunction = {};

if (!EnableKitsUserFunction) {
  EnableKitsUserFunction = {};
}
if (!EnableKitsUserFunction['ControllerKit_m50dwm7t_fo4z4']) {
  EnableKitsUserFunction['ControllerKit_m50dwm7t_fo4z4'] = {};
}
if (!EnableKitsUserFunction['ControllerKit_m50dwm7t_fo4z4']['MotorOn']) {
  EnableKitsUserFunction['ControllerKit_m50dwm7t_fo4z4']['MotorOn'] = {};
}

if (!EnableKitsUserFunction) {
  EnableKitsUserFunction = {};
}
if (!EnableKitsUserFunction['ControllerKit_m50dwm7t_fo4z4']) {
  EnableKitsUserFunction['ControllerKit_m50dwm7t_fo4z4'] = {};
}
if (!EnableKitsUserFunction['ControllerKit_m50dwm7t_fo4z4']['MotorOff']) {
  EnableKitsUserFunction['ControllerKit_m50dwm7t_fo4z4']['MotorOff'] = {};
}

if (!EnableKitsUserFunction) {
  EnableKitsUserFunction = {};
}
if (!EnableKitsUserFunction['ControllerKit_m50dwm7t_fo4z4']) {
  EnableKitsUserFunction['ControllerKit_m50dwm7t_fo4z4'] = {};
}
if (!EnableKitsUserFunction['ControllerKit_m50dwm7t_fo4z4']['Auto']) {
  EnableKitsUserFunction['ControllerKit_m50dwm7t_fo4z4']['Auto'] = {};
}

if (!EnableKitsUserFunction) {
  EnableKitsUserFunction = {};
}
if (!EnableKitsUserFunction['ControllerKit_m50dwm7t_fo4z4']) {
  EnableKitsUserFunction['ControllerKit_m50dwm7t_fo4z4'] = {};
}
if (!EnableKitsUserFunction['ControllerKit_m50dwm7t_fo4z4']['PPToMain']) {
  EnableKitsUserFunction['ControllerKit_m50dwm7t_fo4z4']['PPToMain'] = {};
}

if (!EnableKitsUserFunction) {
  EnableKitsUserFunction = {};
}
if (!EnableKitsUserFunction['ControllerKit_m50dwm7t_fo4z4']) {
  EnableKitsUserFunction['ControllerKit_m50dwm7t_fo4z4'] = {};
}
if (!EnableKitsUserFunction['ControllerKit_m50dwm7t_fo4z4']['Play']) {
  EnableKitsUserFunction['ControllerKit_m50dwm7t_fo4z4']['Play'] = {};
}

if (!EnableKitsUserFunction) {
  EnableKitsUserFunction = {};
}
if (!EnableKitsUserFunction['ControllerKit_m50dwm7t_fo4z4']) {
  EnableKitsUserFunction['ControllerKit_m50dwm7t_fo4z4'] = {};
}
if (!EnableKitsUserFunction['ControllerKit_m50dwm7t_fo4z4']['Stop']) {
  EnableKitsUserFunction['ControllerKit_m50dwm7t_fo4z4']['Stop'] = {};
}

if (!EnableKitsUserFunction) {
  EnableKitsUserFunction = {};
}
if (!EnableKitsUserFunction['ControllerKit_m50dwm7t_fo4z4']) {
  EnableKitsUserFunction['ControllerKit_m50dwm7t_fo4z4'] = {};
}
if (!EnableKitsUserFunction['ControllerKit_m50dwm7t_fo4z4']['Manual']) {
  EnableKitsUserFunction['ControllerKit_m50dwm7t_fo4z4']['Manual'] = {};
}

if (!EnableKitsUserFunction) {
  EnableKitsUserFunction = {};
}
if (!EnableKitsUserFunction['ControllerKit_m50dwm7t_fo4z4']) {
  EnableKitsUserFunction['ControllerKit_m50dwm7t_fo4z4'] = {};
}
if (!EnableKitsUserFunction['ControllerKit_m50dwm7t_fo4z4']['Restart']) {
  EnableKitsUserFunction['ControllerKit_m50dwm7t_fo4z4']['Restart'] = {};
}

if (!EnableKitsUserFunction) {
  EnableKitsUserFunction = {};
}
if (!EnableKitsUserFunction['ControllerKit_m50dwm7t_fo4z4']) {
  EnableKitsUserFunction['ControllerKit_m50dwm7t_fo4z4'] = {};
}
if (!EnableKitsUserFunction['ControllerKit_m50dwm7t_fo4z4']['TimeStamp']) {
  EnableKitsUserFunction['ControllerKit_m50dwm7t_fo4z4']['TimeStamp'] = {};
}

if (!EnableKitsUserFunction) {
  EnableKitsUserFunction = {};
}
if (!EnableKitsUserFunction['ControllerKit_m50dwm7t_fo4z4']) {
  EnableKitsUserFunction['ControllerKit_m50dwm7t_fo4z4'] = {};
}
if (
  !EnableKitsUserFunction['ControllerKit_m50dwm7t_fo4z4']['ControllerState']
) {
  EnableKitsUserFunction['ControllerKit_m50dwm7t_fo4z4']['ControllerState'] =
    {};
}

if (!EnableKitsUserFunction) {
  EnableKitsUserFunction = {};
}
if (!EnableKitsUserFunction['ControllerKit_m50dwm7t_fo4z4']) {
  EnableKitsUserFunction['ControllerKit_m50dwm7t_fo4z4'] = {};
}
if (!EnableKitsUserFunction['ControllerKit_m50dwm7t_fo4z4']['MotorState']) {
  EnableKitsUserFunction['ControllerKit_m50dwm7t_fo4z4']['MotorState'] = {};
}

if (!EnableKitsUserFunction) {
  EnableKitsUserFunction = {};
}

if (!EnableKitsUserFunction['ControllerKit_m50dwm7t_fo4z4']) {
  EnableKitsUserFunction['ControllerKit_m50dwm7t_fo4z4'] = {};
}
if (!EnableKitsUserFunction['ControllerKit_m50dwm7t_fo4z4']['Routines']) {
  EnableKitsUserFunction['ControllerKit_m50dwm7t_fo4z4']['Routines'] = {};
}
EnableKitsUserFunction['ControllerKit_m50dwm7t_fo4z4']['Routines'][
  'SelectedItems'
] = class StackData {
  //
};
EnableKitsUserFunction['ControllerKit_m50dwm7t_fo4z4']['Routines'][
  'StackData'
] = class StackData {
  static _selectedIndex = 0;
  static _selectedValue = 0; // 这里假设你想要修正 '_selectedvValue' 为 '_selectedValue'

  static _currentTask = '';
  static _currentModule = '';

  // Setter 和 Getter for _selectedIndex
  set selectedIndex(v) {
    this._selectedIndex = v;
  }

  get selectedIndex() {
    return this._selectedIndex;
  }

  // Setter 和 Getter for _selectedValue
  set selectedValue(v) {
    this._selectedValue = v;
  }

  get selectedValue() {
    return this._selectedValue;
  }

  // Setter 和 Getter for _currentTask
  set currentTask(v) {
    this._currentTask = v;
  }

  get currentTask() {
    return this._currentTask;
  }

  // Setter 和 Getter for _currentModule
  set currentModule(v) {
    this._currentModule = v;
  }

  get currentModule() {
    return this._currentModule;
  }
};

if (!EnableKitsUserFunction) {
  EnableKitsUserFunction = {};
}

if (!EnableKitsUserFunction['ControllerKit_m50dwm7t_fo4z4']) {
  EnableKitsUserFunction['ControllerKit_m50dwm7t_fo4z4'] = {};
}
if (!EnableKitsUserFunction['ControllerKit_m50dwm7t_fo4z4']['Routines']) {
  EnableKitsUserFunction['ControllerKit_m50dwm7t_fo4z4']['Routines'] = {};
}
EnableKitsUserFunction['ControllerKit_m50dwm7t_fo4z4']['Routines'][
  'SelectedItems'
] = class StackData {
  //
};
EnableKitsUserFunction['ControllerKit_m50dwm7t_fo4z4']['Routines'][
  'StackData'
] = class StackData {
  static _selectedIndex = 0;
  static _selectedValue = 0; // 这里假设你想要修正 '_selectedvValue' 为 '_selectedValue'

  static _currentTask = '';
  static _currentModule = '';

  // Setter 和 Getter for _selectedIndex
  set selectedIndex(v) {
    this._selectedIndex = v;
  }

  get selectedIndex() {
    return this._selectedIndex;
  }

  // Setter 和 Getter for _selectedValue
  set selectedValue(v) {
    this._selectedValue = v;
  }

  get selectedValue() {
    return this._selectedValue;
  }

  // Setter 和 Getter for _currentTask
  set currentTask(v) {
    this._currentTask = v;
  }

  get currentTask() {
    return this._currentTask;
  }

  // Setter 和 Getter for _currentModule
  set currentModule(v) {
    this._currentModule = v;
  }

  get currentModule() {
    return this._currentModule;
  }
};

export default EnableKitsUserFunction;
