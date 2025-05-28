const CComponents = {};

const ControllerKit_m50dwm7t_fo4z4 = {};

class ControllerKit_m50dwm7t_fo4z4_MotorOn extends TComponents.Component_A {
  constructor(parent, props = {}) {
    super(parent, props);

    this.container.classList.remove('t-component');
    this.container.classList.add('c-component');
  }

  defaultProps() {
    return {
      width: 100,
      height: 32,
      top: 0,
      left: 0,
      position: 'absolute',
      zIndex: 100,
    };
  }

  bindingProps() {
    return [];
  }

  async onInit() {
    await this.onInitUser();
  }

  async onInitUser() {
    // Insert your code here
  }

  onRender() {
    this.container.classList.add(
      'flex-col',
      'justify-stretch',
      'html-container',
    );

    this.onRenderUser();
  }

  onRenderUser() {
    // Insert your code here
  }

  mapComponents() {
    const Button_1 = new TComponents.Button(
      this.find('#ControllerKit_m50dwm7t_fo4z4_MotorOn'),
      {
        options: {
          async: false,
        },
        label: '',
        labelPos: 'top',
        tips: '',
        onCreated: '',
        onMounted: '',
        onClick: 'API.CONTROLLER.setMotorsState("motors_on");',
        onPointerRelease: '',
        onPointerDown: '',
        icon: 'abb-icon abb-icon-a-motors_on',
        position: 'absolute',
        width: 100,
        height: 32,
        top: 0,
        left: 0,
        borderRadius: 16,
        rotation: 0,
        zIndex: 500,
        text: 'MotorOn',
        color: 'rgba(0,0,0,1)',
        font: {
          fontSize: 12,
          fontFamily: 'Segoe UI',
          style: {
            fontStyle: 'normal',
            fontWeight: 'bold',
            textDecoration: 'none',
          },
        },
        backgroundColor: 'rgba(219,219,219,1)',
        border: '1px solid transparent',
        functionality: {
          type: '',
          params: '',
        },
        size: '',
        styleTemplate: '',
      },
    );

    const instance = {
      Button_1,
    };

    return instance;
  }

  markup() {
    return /*html*/ `
<div
  id="ControllerKit_m50dwm7t_fo4z4_MotorOn"
  class="flex-col justify-stretch overflow-auto html-container"
></div>
`;
  }
}

ControllerKit_m50dwm7t_fo4z4.MotorOn = ControllerKit_m50dwm7t_fo4z4_MotorOn;

class ControllerKit_m50dwm7t_fo4z4_MotorOff extends TComponents.Component_A {
  constructor(parent, props = {}) {
    super(parent, props);

    this.container.classList.remove('t-component');
    this.container.classList.add('c-component');
  }

  defaultProps() {
    return {
      width: 100,
      height: 32,
      top: 0,
      left: 0,
      position: 'absolute',
      zIndex: 100,
    };
  }

  bindingProps() {
    return [];
  }

  async onInit() {
    await this.onInitUser();
  }

  async onInitUser() {
    // Insert your code here
  }

  onRender() {
    this.container.classList.add(
      'flex-col',
      'justify-stretch',
      'html-container',
    );

    this.onRenderUser();
  }

  onRenderUser() {
    // Insert your code here
  }

  mapComponents() {
    const Button_1 = new TComponents.Button(
      this.find('#ControllerKit_m50dwm7t_fo4z4_MotorOff'),
      {
        options: {
          async: false,
        },
        label: '',
        labelPos: 'top',
        tips: '',
        onCreated: '',
        onMounted: '',
        onClick: 'API.CONTROLLER.setMotorsState("motors_off");',
        onPointerRelease: '',
        onPointerDown: '',
        icon: 'abb-icon abb-icon-a-motors_off1',
        position: 'absolute',
        width: 100,
        height: 32,
        top: 0,
        left: 0,
        borderRadius: 16,
        rotation: 0,
        zIndex: 500,
        text: 'MotorOff',
        color: 'rgba(0,0,0,1)',
        font: {
          fontSize: 12,
          fontFamily: 'Segoe UI',
          style: {
            fontStyle: 'normal',
            fontWeight: 'bold',
            textDecoration: 'none',
          },
        },
        backgroundColor: 'rgba(219,219,219,1)',
        border: '1px solid transparent',
        functionality: {
          type: '',
          params: '',
        },
        size: '',
        styleTemplate: '',
      },
    );

    const instance = {
      Button_1,
    };

    return instance;
  }

  markup() {
    return /*html*/ `
<div
  id="ControllerKit_m50dwm7t_fo4z4_MotorOff"
  class="flex-col justify-stretch overflow-auto html-container"
></div>
`;
  }
}

ControllerKit_m50dwm7t_fo4z4.MotorOff = ControllerKit_m50dwm7t_fo4z4_MotorOff;

class ControllerKit_m50dwm7t_fo4z4_Auto extends TComponents.Component_A {
  constructor(parent, props = {}) {
    super(parent, props);

    this.container.classList.remove('t-component');
    this.container.classList.add('c-component');
  }

  defaultProps() {
    return {
      width: 100,
      height: 32,
      top: 0,
      left: 0,
      position: 'absolute',
      zIndex: 100,
    };
  }

  bindingProps() {
    return [];
  }

  async onInit() {
    await this.onInitUser();
  }

  async onInitUser() {
    // Insert your code here
  }

  onRender() {
    this.container.classList.add(
      'flex-col',
      'justify-stretch',
      'html-container',
    );

    this.onRenderUser();
  }

  onRenderUser() {
    // Insert your code here
  }

  mapComponents() {
    const Button_1 = new TComponents.Button(
      this.find('#ControllerKit_m50dwm7t_fo4z4_Auto'),
      {
        options: {
          async: false,
        },
        label: '',
        labelPos: 'top',
        tips: '',
        onCreated: '',
        onMounted: '',
        onClick: 'await API.CONTROLLER.setOpMode(API.CONTROLLER.OPMODE.Auto);',
        onPointerRelease: '',
        onPointerDown: '',
        icon: 'abb-icon abb-icon-AutoMode',
        position: 'absolute',
        width: 100,
        height: 32,
        top: 0,
        left: 0,
        borderRadius: 16,
        rotation: 0,
        zIndex: 500,
        text: 'Auto',
        color: 'rgba(0,0,0,1)',
        font: {
          fontSize: 12,
          fontFamily: 'Segoe UI',
          style: {
            fontStyle: 'normal',
            fontWeight: 'bold',
            textDecoration: 'none',
          },
        },
        backgroundColor: 'rgba(219,219,219,1)',
        border: '1px solid transparent',
        functionality: {
          params: '',
          type: 'UserDefinedFunction',
        },
        size: '',
        styleTemplate: '',
      },
    );

    const instance = {
      Button_1,
    };

    return instance;
  }

  markup() {
    return /*html*/ `
<div
  id="ControllerKit_m50dwm7t_fo4z4_Auto"
  class="flex-col justify-stretch overflow-auto html-container"
></div>
`;
  }
}

ControllerKit_m50dwm7t_fo4z4.Auto = ControllerKit_m50dwm7t_fo4z4_Auto;

class ControllerKit_m50dwm7t_fo4z4_PPToMain extends TComponents.Component_A {
  constructor(parent, props = {}) {
    super(parent, props);

    this.container.classList.remove('t-component');
    this.container.classList.add('c-component');
  }

  defaultProps() {
    return {
      width: 100,
      height: 32,
      top: 0,
      left: 0,
      position: 'absolute',
      zIndex: 100,
    };
  }

  bindingProps() {
    return [];
  }

  async onInit() {
    await this.onInitUser();
  }

  async onInitUser() {
    // Insert your code here
  }

  onRender() {
    this.container.classList.add(
      'flex-col',
      'justify-stretch',
      'html-container',
    );

    this.onRenderUser();
  }

  onRenderUser() {
    // Insert your code here
  }

  mapComponents() {
    const Button_1 = new TComponents.Button(
      this.find('#ControllerKit_m50dwm7t_fo4z4_PPToMain'),
      {
        options: {
          async: false,
        },
        label: '',
        labelPos: 'top',
        tips: '',
        onCreated: '',
        onMounted: '',
        onClick: 'await API.RAPID.setPPToMain();',
        onPointerRelease: '',
        onPointerDown: '',
        icon: null,
        position: 'absolute',
        width: 100,
        height: 32,
        top: 0,
        left: 0,
        borderRadius: 16,
        rotation: 0,
        zIndex: 500,
        text: 'PPToMain',
        color: 'rgba(0,0,0,1)',
        font: {
          fontSize: 12,
          fontFamily: 'Segoe UI',
          style: {
            fontStyle: 'normal',
            fontWeight: 'bold',
            textDecoration: 'none',
          },
        },
        backgroundColor: 'rgba(219,219,219,1)',
        border: '1px solid transparent',
        functionality: {
          params: '',
          type: 'UserDefinedFunction',
        },
        size: '',
        styleTemplate: '',
      },
    );

    const instance = {
      Button_1,
    };

    return instance;
  }

  markup() {
    return /*html*/ `
<div
  id="ControllerKit_m50dwm7t_fo4z4_PPToMain"
  class="flex-col justify-stretch overflow-auto html-container"
></div>
`;
  }
}

ControllerKit_m50dwm7t_fo4z4.PPToMain = ControllerKit_m50dwm7t_fo4z4_PPToMain;

class ControllerKit_m50dwm7t_fo4z4_Play extends TComponents.Component_A {
  constructor(parent, props = {}) {
    super(parent, props);

    this.container.classList.remove('t-component');
    this.container.classList.add('c-component');
  }

  defaultProps() {
    return {
      width: 100,
      height: 32,
      top: 0,
      left: 0,
      position: 'absolute',
      zIndex: 100,
    };
  }

  bindingProps() {
    return [];
  }

  async onInit() {
    await this.onInitUser();
  }

  async onInitUser() {
    // Insert your code here
  }

  onRender() {
    this.container.classList.add(
      'flex-col',
      'justify-stretch',
      'html-container',
    );

    this.onRenderUser();
  }

  onRenderUser() {
    // Insert your code here
  }

  mapComponents() {
    const Button_1 = new TComponents.Button(
      this.find('#ControllerKit_m50dwm7t_fo4z4_Play'),
      {
        options: {
          async: false,
        },
        label: '',
        labelPos: 'top',
        tips: '',
        onCreated: '',
        onMounted: '',
        onClick: 'await API.RAPID.startExecution();',
        onPointerRelease: '',
        onPointerDown: '',
        icon: 'abb-icon abb-icon-play_32',
        position: 'absolute',
        width: 100,
        height: 32,
        top: 0,
        left: 0,
        borderRadius: 16,
        rotation: 0,
        zIndex: 500,
        text: 'Play',
        color: 'rgba(0,0,0,1)',
        font: {
          fontSize: 12,
          fontFamily: 'Segoe UI',
          style: {
            fontStyle: 'normal',
            fontWeight: 'bold',
            textDecoration: 'none',
          },
        },
        backgroundColor: 'rgba(219,219,219,1)',
        border: '1px solid transparent',
        functionality: {
          params: '',
          type: 'UserDefinedFunction',
        },
        size: '',
        styleTemplate: '',
      },
    );

    const instance = {
      Button_1,
    };

    return instance;
  }

  markup() {
    return /*html*/ `
<div
  id="ControllerKit_m50dwm7t_fo4z4_Play"
  class="flex-col justify-stretch overflow-auto html-container"
></div>
`;
  }
}

ControllerKit_m50dwm7t_fo4z4.Play = ControllerKit_m50dwm7t_fo4z4_Play;

class ControllerKit_m50dwm7t_fo4z4_Stop extends TComponents.Component_A {
  constructor(parent, props = {}) {
    super(parent, props);

    this.container.classList.remove('t-component');
    this.container.classList.add('c-component');
  }

  defaultProps() {
    return {
      width: 100,
      height: 32,
      top: 0,
      left: 0,
      position: 'absolute',
      zIndex: 100,
    };
  }

  bindingProps() {
    return [];
  }

  async onInit() {
    await this.onInitUser();
  }

  async onInitUser() {
    // Insert your code here
  }

  onRender() {
    this.container.classList.add(
      'flex-col',
      'justify-stretch',
      'html-container',
    );

    this.onRenderUser();
  }

  onRenderUser() {
    // Insert your code here
  }

  mapComponents() {
    const Button_1 = new TComponents.Button(
      this.find('#ControllerKit_m50dwm7t_fo4z4_Stop'),
      {
        options: {
          async: false,
        },
        label: '',
        labelPos: 'top',
        tips: '',
        onCreated: '',
        onMounted: '',
        onClick: 'RWS.Rapid.stopExecution();',
        onPointerRelease: '',
        onPointerDown: '',
        icon: 'abb-icon abb-icon-pause_16',
        position: 'absolute',
        width: 100,
        height: 32,
        top: 0,
        left: 0,
        borderRadius: 16,
        rotation: 0,
        zIndex: 500,
        text: 'Stop',
        color: 'rgba(0,0,0,1)',
        font: {
          fontSize: 12,
          fontFamily: 'Segoe UI',
          style: {
            fontStyle: 'normal',
            fontWeight: 'bold',
            textDecoration: 'none',
          },
        },
        backgroundColor: 'rgba(219,219,219,1)',
        border: '1px solid transparent',
        functionality: {
          type: '',
          params: '',
        },
        size: '',
        styleTemplate: '',
      },
    );

    const instance = {
      Button_1,
    };

    return instance;
  }

  markup() {
    return /*html*/ `
<div
  id="ControllerKit_m50dwm7t_fo4z4_Stop"
  class="flex-col justify-stretch overflow-auto html-container"
></div>
`;
  }
}

ControllerKit_m50dwm7t_fo4z4.Stop = ControllerKit_m50dwm7t_fo4z4_Stop;

class ControllerKit_m50dwm7t_fo4z4_Manual extends TComponents.Component_A {
  constructor(parent, props = {}) {
    super(parent, props);

    this.container.classList.remove('t-component');
    this.container.classList.add('c-component');
  }

  defaultProps() {
    return {
      width: 100,
      height: 32,
      top: 0,
      left: 0,
      position: 'absolute',
      zIndex: 100,
    };
  }

  bindingProps() {
    return [];
  }

  async onInit() {
    await this.onInitUser();
  }

  async onInitUser() {
    // Insert your code here
  }

  onRender() {
    this.container.classList.add(
      'flex-col',
      'justify-stretch',
      'html-container',
    );

    this.onRenderUser();
  }

  onRenderUser() {
    // Insert your code here
  }

  mapComponents() {
    const Button_1 = new TComponents.Button(
      this.find('#ControllerKit_m50dwm7t_fo4z4_Manual'),
      {
        options: {
          async: false,
        },
        label: '',
        labelPos: 'top',
        tips: '',
        onCreated: '',
        onMounted: '',
        onClick:
          'await API.CONTROLLER.setOpMode(API.CONTROLLER.OPMODE.Manual);',
        onPointerRelease: '',
        onPointerDown: '',
        icon: 'abb-icon abb-icon-ManualMode1',
        position: 'absolute',
        width: 100,
        height: 32,
        top: 0,
        left: 0,
        borderRadius: 16,
        rotation: 0,
        zIndex: 500,
        text: 'Manual',
        color: 'rgba(0,0,0,1)',
        font: {
          fontSize: 12,
          fontFamily: 'Segoe UI',
          style: {
            fontStyle: 'normal',
            fontWeight: 'bold',
            textDecoration: 'none',
          },
        },
        backgroundColor: 'rgba(219,219,219,1)',
        border: '1px solid transparent',
        functionality: {
          params: '',
          type: 'UserDefinedFunction',
        },
        size: '',
        styleTemplate: '',
      },
    );

    const instance = {
      Button_1,
    };

    return instance;
  }

  markup() {
    return /*html*/ `
<div
  id="ControllerKit_m50dwm7t_fo4z4_Manual"
  class="flex-col justify-stretch overflow-auto html-container"
></div>
`;
  }
}

ControllerKit_m50dwm7t_fo4z4.Manual = ControllerKit_m50dwm7t_fo4z4_Manual;

class ControllerKit_m50dwm7t_fo4z4_Restart extends TComponents.Component_A {
  constructor(parent, props = {}) {
    super(parent, props);

    this.container.classList.remove('t-component');
    this.container.classList.add('c-component');
  }

  defaultProps() {
    return {
      width: 100,
      height: 32,
      top: 0,
      left: 0,
      position: 'absolute',
      zIndex: 100,
    };
  }

  bindingProps() {
    return [];
  }

  async onInit() {
    await this.onInitUser();
  }

  async onInitUser() {
    // Insert your code here
  }

  onRender() {
    this.container.classList.add(
      'flex-col',
      'justify-stretch',
      'html-container',
    );

    this.onRenderUser();
  }

  onRenderUser() {
    // Insert your code here
  }

  mapComponents() {
    const Button_1 = new TComponents.Button(
      this.find('#ControllerKit_m50dwm7t_fo4z4_Restart'),
      {
        options: {
          async: false,
        },
        label: '',
        labelPos: 'top',
        tips: '',
        onCreated: '',
        onMounted: '',
        onClick: 'API.CONTROLLER.restart();',
        onPointerRelease: '',
        onPointerDown: '',
        icon: 'abb-icon abb-icon-restart_16',
        position: 'absolute',
        width: 100,
        height: 32,
        top: 0,
        left: 0,
        borderRadius: 16,
        rotation: 0,
        zIndex: 500,
        text: 'Restart',
        color: 'rgba(0,0,0,1)',
        font: {
          fontSize: 12,
          fontFamily: 'Segoe UI',
          style: {
            fontStyle: 'normal',
            fontWeight: 'bold',
            textDecoration: 'none',
          },
        },
        backgroundColor: 'rgba(219,219,219,1)',
        border: '1px solid transparent',
        functionality: {
          params: '',
          type: 'UserDefinedFunction',
        },
        size: '',
        styleTemplate: '',
      },
    );

    const instance = {
      Button_1,
    };

    return instance;
  }

  markup() {
    return /*html*/ `
<div
  id="ControllerKit_m50dwm7t_fo4z4_Restart"
  class="flex-col justify-stretch overflow-auto html-container"
></div>
`;
  }
}

ControllerKit_m50dwm7t_fo4z4.Restart = ControllerKit_m50dwm7t_fo4z4_Restart;

class ControllerKit_m50dwm7t_fo4z4_TimeStamp extends TComponents.Component_A {
  constructor(parent, props = {}) {
    super(parent, props);

    this.container.classList.remove('t-component');
    this.container.classList.add('c-component');
  }

  defaultProps() {
    return {
      width: 150,
      height: 32,
      top: 0,
      left: 0,
      position: 'absolute',
      zIndex: 100,
    };
  }

  bindingProps() {
    return [];
  }

  async onInit() {
    await this.onInitUser();
  }

  async onInitUser() {
    // Insert your code here
  }

  onRender() {
    this.container.classList.add(
      'flex-col',
      'justify-stretch',
      'html-container',
    );

    this.onRenderUser();
  }

  onRenderUser() {
    // Insert your code here
  }

  mapComponents() {
    const Text_1 = new TComponents.Text(
      this.find('#ControllerKit_m50dwm7t_fo4z4_TimeStamp'),
      {
        options: {
          async: false,
        },
        label: '',
        labelPos: 'top',
        onCreated: '',
        onMounted:
          ' var timeString = await RWS.Controller.getTime();\r\n \r\n this.text = timeString;\r\nsetInterval(async  ()=> {\r\n    // get current time form controller\r\n    var timeString = await RWS.Controller.getTime();\r\n    try {\r\n        this.text = timeString;\r\n    } catch (error) {\r\n        \r\n        console.error(`not a valid date: ${error}`);\r\n    }\r\n\r\n}, 10000);\r\n',
        textType: 'body',
        text: '2025-01-08 T 09:09:09',
        backgroundColor: 'rgba(255,255,255,1)',
        position: 'absolute',
        width: 150,
        height: 32,
        top: 0,
        left: 0,
        borderRadius: 16,
        rotation: 0,
        zIndex: 500,
        color: '#000000',
        font: {
          fontSize: 12,
          fontFamily: 'Segoe UI',
          style: {
            fontStyle: 'normal',
            fontWeight: 'bold',
            textDecoration: 'none',
          },
          textAlign: 'left',
        },
      },
    );

    const instance = {
      Text_1,
    };

    return instance;
  }

  markup() {
    return /*html*/ `
<div
  id="ControllerKit_m50dwm7t_fo4z4_TimeStamp"
  class="flex-col justify-stretch overflow-auto html-container"
></div>
`;
  }
}

ControllerKit_m50dwm7t_fo4z4.TimeStamp = ControllerKit_m50dwm7t_fo4z4_TimeStamp;

class ControllerKit_m50dwm7t_fo4z4_MotorState extends TComponents.Component_A {
  constructor(parent, props = {}) {
    super(parent, props);

    this.container.classList.remove('t-component');
    this.container.classList.add('c-component');
  }

  defaultProps() {
    return {
      width: 40,
      height: 40,
      top: 0,
      left: 0,
      position: 'absolute',
      zIndex: 100,
    };
  }

  bindingProps() {
    return [];
  }

  async onInit() {
    await this.onInitUser();
  }

  async onInitUser() {
    // Insert your code here
  }

  onRender() {
    this.container.classList.add(
      'flex-col',
      'justify-stretch',
      'html-container',
    );

    this.onRenderUser();
  }

  onRenderUser() {
    // Insert your code here
  }

  mapComponents() {
    const Button_1 = new TComponents.Button(
      this.find('#ControllerKit_m50dwm7t_fo4z4_MotorState'),
      {
        options: {
          async: false,
        },
        label: '',
        labelPos: 'top',
        tips: '',
        onCreated: '',
        onMounted:
          '\r\nthis.eanabled = false;\r\nconst changeTheState = (motorState) => {\r\n    if (motorState === "motors_on") {\r\n        // 处理初始化状态\r\n        // this.text = "MotorOn";\r\n        this.icon = \'abb-icon abb-icon-a-motors_on\';\r\n    }\r\n    else if (motorState === "initializing") {\r\n        // 处理自动状态\r\n        // this.text = "initializing";\r\n        this.icon = \'abb-icon abb-icon-a-motors_off1\';\r\n    }\r\n    else {\r\n        // 处理其他状态\r\n        // this.text = "MotorOff";\r\n        this.icon = \'abb-icon abb-icon-a-motors_off1\';\r\n    }\r\n};\r\nAPI.CONTROLLER.monitorControllerState((data)=>{changeTheState(data)})',
        onClick: '',
        onPointerRelease: '',
        onPointerDown: '',
        icon: 'abb-icon abb-icon-Motorson',
        position: 'absolute',
        width: 40,
        height: 40,
        top: 0,
        left: 0,
        borderRadius: 20,
        rotation: 0,
        zIndex: 500,
        text: '',
        color: 'rgba(0,0,0,1)',
        font: {
          fontSize: 32,
          fontFamily: 'Segoe UI',
          style: {
            fontStyle: 'normal',
            fontWeight: 'bold',
            textDecoration: 'none',
          },
        },
        backgroundColor: 'rgba(219,219,219,1)',
        border: '1px solid transparent',
        functionality: {
          params: '',
          type: 'UserDefinedFunction',
        },
        size: '',
        styleTemplate: '',
      },
    );

    const instance = {
      Button_1,
    };

    return instance;
  }

  markup() {
    return /*html*/ `
<div
  id="ControllerKit_m50dwm7t_fo4z4_MotorState"
  class="flex-col justify-stretch overflow-auto html-container"
></div>
`;
  }
}

ControllerKit_m50dwm7t_fo4z4.MotorState =
  ControllerKit_m50dwm7t_fo4z4_MotorState;

class ControllerKit_m50dwm7t_fo4z4_ControllerState extends TComponents.Component_A {
  constructor(parent, props = {}) {
    super(parent, props);

    this.container.classList.remove('t-component');
    this.container.classList.add('c-component');
  }

  defaultProps() {
    return {
      width: 40,
      height: 40,
      top: 0,
      left: 0,
      position: 'absolute',
      zIndex: 100,
    };
  }

  bindingProps() {
    return [];
  }

  async onInit() {
    await this.onInitUser();
  }

  async onInitUser() {
    // Insert your code here
  }

  onRender() {
    this.container.classList.add(
      'flex-col',
      'justify-stretch',
      'html-container',
    );

    this.onRenderUser();
  }

  onRenderUser() {
    // Insert your code here
  }

  mapComponents() {
    const Button_1 = new TComponents.Button(
      this.find('#ControllerKit_m50dwm7t_fo4z4_ControllerState'),
      {
        options: {
          async: false,
        },
        label: '',
        labelPos: 'top',
        tips: '',
        onCreated: '',
        onMounted:
          'this.eanabled = false;\r\nconst changeTheState = (eventData) => {\r\n    if (eventData === "initializing") {\r\n        // 处理初始化状态\r\n        // this.text = "initializing";\r\n        this.icon = \'\';\r\n    }\r\n    else if (eventData === "automatic") {\r\n        // 处理自动状态\r\n        // this.text = "Auto";\r\n        this.icon = \'abb-icon abb-icon-AutoMode\';\r\n    }\r\n    else {\r\n        // 处理其他状态\r\n        // this.text = "Manual";\r\n        this.icon = "abb-icon abb-icon-ManualMode1";\r\n    }\r\n};\r\n\r\nAPI.CONTROLLER.monitorOperationMode((data)=>{changeTheState(data)})',
        onClick: '',
        onPointerRelease: '',
        onPointerDown: '',
        icon: 'abb-icon abb-icon-AutoMode',
        position: 'absolute',
        width: 40,
        height: 40,
        top: 0,
        left: 0,
        borderRadius: 20,
        rotation: 0,
        zIndex: 500,
        text: '',
        color: 'rgba(0,0,0,1)',
        font: {
          fontSize: 32,
          fontFamily: 'Segoe UI',
          style: {
            fontStyle: 'normal',
            fontWeight: 'bold',
            textDecoration: 'none',
          },
        },
        backgroundColor: 'rgba(219,219,219,1)',
        border: '1px solid transparent',
        functionality: {
          params: '',
          type: 'UserDefinedFunction',
        },
        size: '',
        styleTemplate: '',
      },
    );

    const instance = {
      Button_1,
    };

    return instance;
  }

  markup() {
    return /*html*/ `
<div
  id="ControllerKit_m50dwm7t_fo4z4_ControllerState"
  class="flex-col justify-stretch overflow-auto html-container"
></div>
`;
  }
}

ControllerKit_m50dwm7t_fo4z4.ControllerState =
  ControllerKit_m50dwm7t_fo4z4_ControllerState;

class ControllerKit_m50dwm7t_fo4z4_SetTool extends TComponents.Component_A {
  constructor(parent, props = {}) {
    super(parent, props);

    this.container.classList.remove('t-component');
    this.container.classList.add('c-component');
  }

  defaultProps() {
    return {
      width: 248,
      height: 32,
      top: 0,
      left: 0,
      position: 'absolute',
      zIndex: 100,
    };
  }

  bindingProps() {
    return [];
  }

  async onInit() {
    await this.onInitUser();
  }

  async onInitUser() {
    // Insert your code here
  }

  onRender() {
    this.container.classList.add(
      'flex-col',
      'justify-stretch',
      'html-container',
    );

    this.onRenderUser();
  }

  onRenderUser() {
    // Insert your code here
  }

  mapComponents() {
    const Button_2 = new TComponents.Button(
      this.find('#ControllerKit_m50dwm7t_fo4z4_SetTool_Button_2'),
      {
        options: {
          async: false,
        },
        label: '',
        labelPos: 'top',
        tips: '',
        onCreated: '',
        onMounted: '',
        onClick:
          'const stackData =  UserFunction.ControllerKit_m50dwm7t_fo4z4.Routines.StackData;\r\nawait API.MOTION.setTool(stackData.selectedValue);',
        onPointerRelease: '',
        onPointerDown: '',
        icon: 'abb-icon abb-icon-robot-tool_32',
        position: 'absolute',
        width: 100,
        height: 32,
        top: 0,
        left: 148,
        borderRadius: 16,
        rotation: 0,
        zIndex: 501,
        text: 'SetActive',
        color: '#ffffff',
        font: {
          fontSize: 12,
          fontFamily: 'Segoe UI',
          style: {
            fontStyle: 'normal',
            fontWeight: 'normal',
            textDecoration: 'none',
          },
        },
        backgroundColor: '#3366ff',
        border: '1px solid transparent',
        functionality: {
          params: '',
          type: 'UserDefinedFunction',
        },
        size: '',
        styleTemplate: '',
      },
    );
    const Select_1 = new TComponents.Select(
      this.find('#ControllerKit_m50dwm7t_fo4z4_SetTool_Select_1'),
      {
        options: {
          async: false,
        },
        label: '',
        labelPos: 'top',
        onCreated: '',
        onMounted:
          "var properties = RWS.Rapid.getDefaultSearchProperties();\r\nproperties.searchURL = 'RAPID/T_ROB1';\r\nproperties.types = RWS.Rapid.SymbolTypes.rapidData;\r\nconst tools =await RWS.Rapid.searchSymbols(properties, 'tooldata');\r\nthis.optionItems = tools.map(tool=>`${tool.name}|${tool.name}`).join(';');",
        onChange:
          'const stackData =  UserFunction.ControllerKit_m50dwm7t_fo4z4.Routines.StackData;\r\nstackData.selectedIndex = this.selectedIndex;\r\nstackData.selectedValue = this.value;\r\n\r\n\r\n\r\n\r\n',
        position: 'absolute',
        width: 140,
        height: 32,
        top: 0,
        left: 0,
        borderRadius: 5,
        rotation: 0,
        zIndex: 500,
        size: 'small',
        placeHolder: 'select a value',
        color: '#000000',
        font: {
          fontSize: 12,
          fontFamily: 'Segoe UI',
          style: {
            fontStyle: 'normal',
            fontWeight: 'normal',
            textDecoration: 'none',
          },
          textAlign: 'left',
        },
        border: '2px solid #dbdbdb',
        value: '',
        selectedIndex: 0,
        optionItems: 'tool0|tool0;\ntool1|tool1;\ntool2|tool2',
      },
    );

    const instance = {
      Button_2,
      Select_1,
    };

    return instance;
  }

  markup() {
    return /*html*/ `
<div
  id="ControllerKit_m50dwm7t_fo4z4_SetTool"
  class="flex-col justify-stretch overflow-auto html-container"
>
  <div id="ControllerKit_m50dwm7t_fo4z4_SetTool_Button_2" class=""></div>

  <div id="ControllerKit_m50dwm7t_fo4z4_SetTool_Select_1" class=""></div>
</div>
`;
  }
}

ControllerKit_m50dwm7t_fo4z4.SetTool = ControllerKit_m50dwm7t_fo4z4_SetTool;

class ControllerKit_m50dwm7t_fo4z4_SetWobj extends TComponents.Component_A {
  constructor(parent, props = {}) {
    super(parent, props);

    this.container.classList.remove('t-component');
    this.container.classList.add('c-component');
  }

  defaultProps() {
    return {
      width: 248,
      height: 32,
      top: 0,
      left: 0,
      position: 'absolute',
      zIndex: 100,
    };
  }

  bindingProps() {
    return [];
  }

  async onInit() {
    await this.onInitUser();
  }

  async onInitUser() {
    // Insert your code here
  }

  onRender() {
    this.container.classList.add(
      'flex-col',
      'justify-stretch',
      'html-container',
    );

    this.onRenderUser();
  }

  onRenderUser() {
    // Insert your code here
  }

  mapComponents() {
    const Button_2 = new TComponents.Button(
      this.find('#ControllerKit_m50dwm7t_fo4z4_SetWobj_Button_2'),
      {
        options: {
          async: false,
        },
        label: '',
        labelPos: 'top',
        tips: '',
        onCreated: '',
        onMounted: '',
        onClick:
          'const stackData =  UserFunction.ControllerKit_m50dwm7t_fo4z4.Routines.StackData;\r\nawait API.MOTION.setWobj(stackData.selectedValue);',
        onPointerRelease: '',
        onPointerDown: '',
        icon: 'abb-icon abb-icon-wobj',
        position: 'absolute',
        width: 100,
        height: 32,
        top: 0,
        left: 148,
        borderRadius: 16,
        rotation: 0,
        zIndex: 501,
        text: 'SetActive',
        color: '#ffffff',
        font: {
          fontSize: 12,
          fontFamily: 'Segoe UI',
          style: {
            fontStyle: 'normal',
            fontWeight: 'normal',
            textDecoration: 'none',
          },
        },
        backgroundColor: '#3366ff',
        border: '1px solid transparent',
        functionality: {
          params: '',
          type: 'UserDefinedFunction',
        },
        size: '',
        styleTemplate: '',
      },
    );
    const Select_1 = new TComponents.Select(
      this.find('#ControllerKit_m50dwm7t_fo4z4_SetWobj_Select_1'),
      {
        options: {
          async: false,
        },
        label: '',
        labelPos: 'top',
        onCreated: '',
        onMounted:
          "var properties = RWS.Rapid.getDefaultSearchProperties();\r\nproperties.searchURL = 'RAPID/T_ROB1';\r\nproperties.types = RWS.Rapid.SymbolTypes.rapidData;\r\nconst wobjs =await RWS.Rapid.searchSymbols(properties, 'wobjdata');\r\nthis.optionItems = wobjs.map(wobj=>`${wobj.name}|${wobj.name}`).join(';');",
        onChange:
          'const stackData =  UserFunction.ControllerKit_m50dwm7t_fo4z4.Routines.StackData;\r\nstackData.selectedIndex = this.selectedIndex;\r\nstackData.selectedValue = this.value;\r\n\r\n\r\n\r\n\r\n',
        position: 'absolute',
        width: 140,
        height: 32,
        top: 0,
        left: 0,
        borderRadius: 5,
        rotation: 0,
        zIndex: 500,
        size: 'small',
        placeHolder: 'select a value',
        color: '#000000',
        font: {
          fontSize: 12,
          fontFamily: 'Segoe UI',
          style: {
            fontStyle: 'normal',
            fontWeight: 'normal',
            textDecoration: 'none',
          },
          textAlign: 'left',
        },
        border: '2px solid #dbdbdb',
        value: '',
        selectedIndex: 0,
        optionItems: 'wobj0|wobj0;\nwobj1|wobj1;\nwobj2|wobj2',
      },
    );

    const instance = {
      Button_2,
      Select_1,
    };

    return instance;
  }

  markup() {
    return /*html*/ `
<div
  id="ControllerKit_m50dwm7t_fo4z4_SetWobj"
  class="flex-col justify-stretch overflow-auto html-container"
>
  <div id="ControllerKit_m50dwm7t_fo4z4_SetWobj_Button_2" class=""></div>

  <div id="ControllerKit_m50dwm7t_fo4z4_SetWobj_Select_1" class=""></div>
</div>
`;
  }
}

ControllerKit_m50dwm7t_fo4z4.SetWobj = ControllerKit_m50dwm7t_fo4z4_SetWobj;

CComponents.ControllerKit_m50dwm7t_fo4z4 = ControllerKit_m50dwm7t_fo4z4;

export default CComponents;
