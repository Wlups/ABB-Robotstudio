export class App extends TComponents.Component_A {
  constructor(parent, props = {}) {
    super(parent, props);

    this.container.classList.remove('t-component');
    this.container.classList.add('c-component');
  }

  defaultProps() {
    return {
      width: 1024,
      height: 680,
      top: 0,
      left: 0,
      position: 'absolute',
      zIndex: 100,
    };
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
    const Text_25 = new TComponents.Text(
      this.find('#Page_d88b2723-79da-4840-8032-eb828734c12d_Text_25'),
      {
        options: {
          async: false,
        },
        label: '',
        labelPos: 'top',
        onCreated: '',
        onMounted: '',
        textType: 'h1',
        text: 'ABB IRB1300 Operaatoripaneel',
        backgroundColor: 'rgba(250,179,179,1)',
        position: 'absolute',
        width: 1020,
        height: 49,
        top: 1,
        left: 2,
        borderRadius: 0,
        rotation: 0,
        zIndex: 501,
        color: '#000',
        font: {
          fontSize: 32,
          fontFamily: 'Segoe UI',
          style: {
            fontStyle: 'normal',
            fontWeight: 'bold',
            textDecoration: 'none',
          },
          textAlign: 'center',
        },
        isHidden: false,
      },
    );
    const Text_13 = new TComponents.Text(
      this.find('#View_28229297-07c8-496b-a8ce-c111daf38d08_Text_13'),
      {
        options: {
          async: false,
        },
        label: '',
        labelPos: 'top',
        onCreated: '',
        onMounted: '',
        textType: 'body',
        text: 'This is a Text',
        backgroundColor: 'rgba(255,255,255,1)',
        position: 'absolute',
        width: 0,
        height: 0,
        top: 0,
        left: 0,
        borderRadius: 16,
        rotation: 0,
        zIndex: 502,
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
      },
    );
    const ControllerKit_m50dwm7t_fo4z4_MotorState_17 =
      new CComponents.ControllerKit_m50dwm7t_fo4z4.MotorState(
        this.find(
          '#View_28229297-07c8-496b-a8ce-c111daf38d08_ControllerKit_m50dwm7t_fo4z4_MotorState_17',
        ),
        {
          options: {
            async: false,
          },
          label: '',
          labelPos: 'top',
          width: 40,
          height: 40,
          top: 182,
          left: 366,
          position: 'absolute',
          zIndex: 505,
        },
      );
    const ControllerKit_m50dwm7t_fo4z4_MotorOn_15 =
      new CComponents.ControllerKit_m50dwm7t_fo4z4.MotorOn(
        this.find(
          '#View_28229297-07c8-496b-a8ce-c111daf38d08_ControllerKit_m50dwm7t_fo4z4_MotorOn_15',
        ),
        {
          options: {
            async: false,
          },
          label: '',
          labelPos: 'top',
          width: 100,
          height: 32,
          top: 186,
          left: 70,
          position: 'absolute',
          zIndex: 503,
        },
      );
    const ControllerKit_m50dwm7t_fo4z4_MotorOff_16 =
      new CComponents.ControllerKit_m50dwm7t_fo4z4.MotorOff(
        this.find(
          '#View_28229297-07c8-496b-a8ce-c111daf38d08_ControllerKit_m50dwm7t_fo4z4_MotorOff_16',
        ),
        {
          options: {
            async: false,
          },
          label: '',
          labelPos: 'top',
          width: 100,
          height: 32,
          top: 186,
          left: 206,
          position: 'absolute',
          zIndex: 504,
        },
      );
    const Text_26 = new TComponents.Text(
      this.find('#View_28229297-07c8-496b-a8ce-c111daf38d08_Text_26'),
      {
        options: {
          async: false,
        },
        label: '',
        labelPos: 'top',
        onCreated: '',
        onMounted: '',
        textType: 'body',
        text: '',
        backgroundColor: 'rgba(218,200,180,1)',
        position: 'absolute',
        width: 384,
        height: 66,
        top: 169,
        left: 50,
        borderRadius: 60,
        rotation: 0,
        zIndex: 501,
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
        isHidden: false,
      },
    );
    const Image_35 = new TComponents.Image(
      this.find('#View_28229297-07c8-496b-a8ce-c111daf38d08_Image_35'),
      {
        options: {
          async: false,
        },
        label: '',
        labelPos: 'top',
        onCreated: '',
        onMounted: '',
        imgSrc: 'img_1747053360825IRB1300_png',
        imgStyle: {
          objectFit: 'fill',
        },
        onClick: '',
        position: 'absolute',
        width: 234,
        height: 467,
        top: 46,
        left: 689,
        zIndex: 513,
        isHidden: false,
      },
    );
    const ControllerKit_m50dwm7t_fo4z4_Play_29 =
      new CComponents.ControllerKit_m50dwm7t_fo4z4.Play(
        this.find(
          '#View_28229297-07c8-496b-a8ce-c111daf38d08_ControllerKit_m50dwm7t_fo4z4_Play_29',
        ),
        {
          options: {
            async: false,
          },
          label: '',
          labelPos: 'top',
          width: 100,
          height: 32,
          top: 405,
          left: 365,
          position: 'absolute',
          zIndex: 511,
        },
      );
    const ControllerKit_m50dwm7t_fo4z4_ControllerState_20 =
      new CComponents.ControllerKit_m50dwm7t_fo4z4.ControllerState(
        this.find(
          '#View_28229297-07c8-496b-a8ce-c111daf38d08_ControllerKit_m50dwm7t_fo4z4_ControllerState_20',
        ),
        {
          options: {
            async: false,
          },
          label: '',
          labelPos: 'top',
          width: 40,
          height: 40,
          top: 295,
          left: 365,
          position: 'absolute',
          zIndex: 508,
        },
      );
    const ControllerKit_m50dwm7t_fo4z4_Manual_18 =
      new CComponents.ControllerKit_m50dwm7t_fo4z4.Manual(
        this.find(
          '#View_28229297-07c8-496b-a8ce-c111daf38d08_ControllerKit_m50dwm7t_fo4z4_Manual_18',
        ),
        {
          options: {
            async: false,
          },
          label: '',
          labelPos: 'top',
          width: 100,
          height: 32,
          top: 299,
          left: 70,
          position: 'absolute',
          zIndex: 506,
        },
      );
    const ControllerKit_m50dwm7t_fo4z4_Auto_19 =
      new CComponents.ControllerKit_m50dwm7t_fo4z4.Auto(
        this.find(
          '#View_28229297-07c8-496b-a8ce-c111daf38d08_ControllerKit_m50dwm7t_fo4z4_Auto_19',
        ),
        {
          options: {
            async: false,
          },
          label: '',
          labelPos: 'top',
          width: 100,
          height: 32,
          top: 299,
          left: 206,
          position: 'absolute',
          zIndex: 507,
        },
      );
    const ControllerKit_m50dwm7t_fo4z4_Restart_21 =
      new CComponents.ControllerKit_m50dwm7t_fo4z4.Restart(
        this.find(
          '#View_28229297-07c8-496b-a8ce-c111daf38d08_ControllerKit_m50dwm7t_fo4z4_Restart_21',
        ),
        {
          options: {
            async: false,
          },
          label: '',
          labelPos: 'top',
          width: 100,
          height: 32,
          top: 405,
          left: 206,
          position: 'absolute',
          zIndex: 509,
        },
      );
    const ControllerKit_m50dwm7t_fo4z4_PPToMain_22 =
      new CComponents.ControllerKit_m50dwm7t_fo4z4.PPToMain(
        this.find(
          '#View_28229297-07c8-496b-a8ce-c111daf38d08_ControllerKit_m50dwm7t_fo4z4_PPToMain_22',
        ),
        {
          options: {
            async: false,
          },
          label: '',
          labelPos: 'top',
          width: 100,
          height: 32,
          top: 405,
          left: 70,
          position: 'absolute',
          zIndex: 510,
        },
      );
    const Text_27 = new TComponents.Text(
      this.find('#View_28229297-07c8-496b-a8ce-c111daf38d08_Text_27'),
      {
        options: {
          async: false,
        },
        label: '',
        labelPos: 'top',
        onCreated: '',
        onMounted: '',
        textType: 'body',
        text: '',
        backgroundColor: 'rgba(218,200,180,1)',
        position: 'absolute',
        width: 384,
        height: 66,
        top: 281,
        left: 50,
        borderRadius: 60,
        rotation: 0,
        zIndex: 501,
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
        isHidden: false,
      },
    );
    const ControllerKit_m50dwm7t_fo4z4_Stop_30 =
      new CComponents.ControllerKit_m50dwm7t_fo4z4.Stop(
        this.find(
          '#View_28229297-07c8-496b-a8ce-c111daf38d08_ControllerKit_m50dwm7t_fo4z4_Stop_30',
        ),
        {
          options: {
            async: false,
          },
          label: '',
          labelPos: 'top',
          width: 100,
          height: 32,
          top: 405,
          left: 503,
          position: 'absolute',
          zIndex: 512,
        },
      );
    const Text_28 = new TComponents.Text(
      this.find('#View_28229297-07c8-496b-a8ce-c111daf38d08_Text_28'),
      {
        options: {
          async: false,
        },
        label: '',
        labelPos: 'top',
        onCreated: '',
        onMounted: '',
        textType: 'body',
        text: '',
        backgroundColor: 'rgba(218,200,180,1)',
        position: 'absolute',
        width: 588,
        height: 66,
        top: 386,
        left: 50,
        borderRadius: 60,
        rotation: 0,
        zIndex: 501,
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
        isHidden: false,
      },
    );
    const Text_46 = new TComponents.Text(
      this.find('#View_28229297-07c8-496b-a8ce-c111daf38d08_Text_46'),
      {
        options: {
          async: false,
        },
        label: '',
        labelPos: 'top',
        onCreated: '',
        onMounted: '',
        textType: 'body',
        text: 'Kontroller',
        backgroundColor: 'rgba(202,113,113,1)',
        position: 'absolute',
        width: 408,
        height: 78,
        top: 28,
        left: 100,
        borderRadius: 47,
        rotation: 0,
        zIndex: 500,
        color: '#000000',
        font: {
          fontSize: 70,
          fontFamily: 'Segoe UI',
          style: {
            fontStyle: 'normal',
            fontWeight: 'bold',
            textDecoration: 'none',
          },
          textAlign: 'center',
        },
        isHidden: false,
      },
    );
    const Text_91 = new TComponents.Text(
      this.find('#View_28229297-07c8-496b-a8ce-c111daf38d08_Text_91'),
      {
        options: {
          async: false,
        },
        label: '',
        labelPos: 'top',
        onCreated: '',
        onMounted: '',
        textType: 'body',
        text: '',
        backgroundColor: 'rgba(218,200,180,1)',
        position: 'absolute',
        width: 285,
        height: 522,
        top: 19,
        left: 663,
        borderRadius: 60,
        rotation: 0,
        zIndex: 499,
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
        isHidden: false,
      },
    );
    const Text_31 = new TComponents.Text(
      this.find('#View_8943f6d1-f95d-4e5e-9b08-9d3c4f0ed4c2_Text_31'),
      {
        options: {
          async: false,
        },
        label: '',
        labelPos: 'top',
        onCreated: '',
        onMounted: '',
        textType: 'body',
        text: 'Testimine',
        backgroundColor: 'rgba(202,113,113,1)',
        position: 'absolute',
        width: 408,
        height: 78,
        top: 28,
        left: 100,
        borderRadius: 47,
        rotation: 0,
        zIndex: 500,
        color: '#000000',
        font: {
          fontSize: 70,
          fontFamily: 'Segoe UI',
          style: {
            fontStyle: 'normal',
            fontWeight: 'bold',
            textDecoration: 'none',
          },
          textAlign: 'center',
        },
        isHidden: false,
      },
    );
    const Button_34 = new TComponents.Button(
      this.find('#View_8943f6d1-f95d-4e5e-9b08-9d3c4f0ed4c2_Button_34'),
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
          'API.RAPID.startExecution({moduleName: "Liides", procName: "Kaamera_Kontroll"});',
        onPointerRelease: '',
        onPointerDown: '',
        icon: null,
        position: 'absolute',
        width: 100,
        height: 32,
        top: 165,
        left: 203,
        borderRadius: 16,
        rotation: 0,
        zIndex: 501,
        text: 'KaameraKontroll',
        color: 'rgba(255,255,255,1)',
        font: {
          fontSize: 12,
          fontFamily: 'Segoe UI',
          style: {
            fontStyle: 'normal',
            fontWeight: 'normal',
            textDecoration: 'none',
          },
        },
        backgroundColor: 'rgba(202,113,113,1)',
        border: '1px solid transparent',
        functionality: {
          type: '',
          params: '',
          isHidden: false,
        },
        size: '',
        styleTemplate: '',
        isHidden: false,
      },
    );
    const Button_41 = new TComponents.Button(
      this.find('#View_8943f6d1-f95d-4e5e-9b08-9d3c4f0ed4c2_Button_41'),
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
          'API.RAPID.startExecution({moduleName: "Liides", procName: "kruvi1TEST"});',
        onPointerRelease: '',
        onPointerDown: '',
        icon: null,
        position: 'absolute',
        width: 100,
        height: 32,
        top: 292,
        left: 366,
        borderRadius: 16,
        rotation: 0,
        zIndex: 515,
        text: 'Kruvi 1 punktid',
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
        backgroundColor: 'rgba(202,113,113,1)',
        border: '1px solid transparent',
        functionality: {
          type: '',
          params: '',
          isHidden: false,
        },
        size: '',
        styleTemplate: '',
        isHidden: false,
      },
    );
    const Button_37 = new TComponents.Button(
      this.find('#View_8943f6d1-f95d-4e5e-9b08-9d3c4f0ed4c2_Button_37'),
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
          'API.RAPID.startExecution({moduleName: "Liides", procName: "plaat1TEST"});',
        onPointerRelease: '',
        onPointerDown: '',
        icon: null,
        position: 'absolute',
        width: 100,
        height: 32,
        top: 296,
        left: 145,
        borderRadius: 16,
        rotation: 0,
        zIndex: 514,
        text: 'Plaadi 1 punktid',
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
        backgroundColor: 'rgba(202,113,113,1)',
        border: '1px solid transparent',
        functionality: {
          type: '',
          params: '',
          isHidden: false,
        },
        size: '',
        styleTemplate: '',
        isHidden: false,
      },
    );
    const Image_36 = new TComponents.Image(
      this.find('#View_8943f6d1-f95d-4e5e-9b08-9d3c4f0ed4c2_Image_36'),
      {
        options: {
          async: false,
        },
        label: '',
        labelPos: 'top',
        onCreated: '',
        onMounted: '',
        imgSrc: 'img_1747053360825IRB1300_png',
        imgStyle: {
          objectFit: 'fill',
        },
        onClick: '',
        position: 'absolute',
        width: 234,
        height: 467,
        top: 46,
        left: 689,
        zIndex: 513,
        isHidden: false,
      },
    );
    const Button_42 = new TComponents.Button(
      this.find('#View_8943f6d1-f95d-4e5e-9b08-9d3c4f0ed4c2_Button_42'),
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
          'API.RAPID.startExecution({moduleName: "Liides", procName: "kruvi2TEST"});',
        onPointerRelease: '',
        onPointerDown: '',
        icon: null,
        position: 'absolute',
        width: 100,
        height: 32,
        top: 336,
        left: 363,
        borderRadius: 16,
        rotation: 0,
        zIndex: 516,
        text: 'Kruvi 2 punktid',
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
        backgroundColor: 'rgba(202,113,113,1)',
        border: '1px solid transparent',
        functionality: {
          type: '',
          params: '',
          isHidden: false,
        },
        size: '',
        styleTemplate: '',
        isHidden: false,
      },
    );
    const Button_38 = new TComponents.Button(
      this.find('#View_8943f6d1-f95d-4e5e-9b08-9d3c4f0ed4c2_Button_38'),
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
          'API.RAPID.startExecution({moduleName: "Liides", procName: "plaat2TEST"});',
        onPointerRelease: '',
        onPointerDown: '',
        icon: null,
        position: 'absolute',
        width: 100,
        height: 32,
        top: 340,
        left: 146,
        borderRadius: 16,
        rotation: 0,
        zIndex: 514,
        text: 'Plaadi 2 punktid',
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
        backgroundColor: 'rgba(202,113,113,1)',
        border: '1px solid transparent',
        functionality: {
          type: '',
          params: '',
          isHidden: false,
        },
        size: '',
        styleTemplate: '',
        isHidden: false,
      },
    );
    const Button_39 = new TComponents.Button(
      this.find('#View_8943f6d1-f95d-4e5e-9b08-9d3c4f0ed4c2_Button_39'),
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
          'API.RAPID.startExecution({moduleName: "Liides", procName: "plaat3TEST"});',
        onPointerRelease: '',
        onPointerDown: '',
        icon: null,
        position: 'absolute',
        width: 100,
        height: 32,
        top: 381,
        left: 144,
        borderRadius: 16,
        rotation: 0,
        zIndex: 514,
        text: 'Plaadi 3 punktid',
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
        backgroundColor: 'rgba(202,113,113,1)',
        border: '1px solid transparent',
        functionality: {
          type: '',
          params: '',
          isHidden: false,
        },
        size: '',
        styleTemplate: '',
        isHidden: false,
      },
    );
    const Button_43 = new TComponents.Button(
      this.find('#View_8943f6d1-f95d-4e5e-9b08-9d3c4f0ed4c2_Button_43'),
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
          'API.RAPID.startExecution({moduleName: "Liides", procName: "kruvi3TEST"});',
        onPointerRelease: '',
        onPointerDown: '',
        icon: null,
        position: 'absolute',
        width: 100,
        height: 32,
        top: 377,
        left: 363,
        borderRadius: 16,
        rotation: 0,
        zIndex: 517,
        text: 'Kruvi 3 punktid',
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
        backgroundColor: 'rgba(202,113,113,1)',
        border: '1px solid transparent',
        functionality: {
          type: '',
          params: '',
          isHidden: false,
        },
        size: '',
        styleTemplate: '',
        isHidden: false,
      },
    );
    const Button_40 = new TComponents.Button(
      this.find('#View_8943f6d1-f95d-4e5e-9b08-9d3c4f0ed4c2_Button_40'),
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
          'API.RAPID.startExecution({moduleName: "Liides", procName: "plaat4TEST"});',
        onPointerRelease: '',
        onPointerDown: '',
        icon: null,
        position: 'absolute',
        width: 100,
        height: 32,
        top: 423,
        left: 144,
        borderRadius: 16,
        rotation: 0,
        zIndex: 514,
        text: 'Plaadi 4 punktid',
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
        backgroundColor: 'rgba(202,113,113,1)',
        border: '1px solid transparent',
        functionality: {
          type: '',
          params: '',
          isHidden: false,
        },
        size: '',
        styleTemplate: '',
        isHidden: false,
      },
    );
    const Button_44 = new TComponents.Button(
      this.find('#View_8943f6d1-f95d-4e5e-9b08-9d3c4f0ed4c2_Button_44'),
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
          'API.RAPID.startExecution({moduleName: "Liides", procName: "kruvi4TEST"});',
        onPointerRelease: '',
        onPointerDown: '',
        icon: null,
        position: 'absolute',
        width: 100,
        height: 32,
        top: 419,
        left: 363,
        borderRadius: 16,
        rotation: 0,
        zIndex: 518,
        text: 'Kruvi 4 punktid',
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
        backgroundColor: 'rgba(202,113,113,1)',
        border: '1px solid transparent',
        functionality: {
          type: '',
          params: '',
          isHidden: false,
        },
        size: '',
        styleTemplate: '',
        isHidden: false,
      },
    );
    const Button_47 = new TComponents.Button(
      this.find('#View_8943f6d1-f95d-4e5e-9b08-9d3c4f0ed4c2_Button_47'),
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
          'API.RAPID.startExecution({moduleName: "Liides", procName: "Kodu"});',
        onPointerRelease: '',
        onPointerDown: '',
        icon: null,
        position: 'absolute',
        width: 100,
        height: 32,
        top: 165,
        left: 318,
        borderRadius: 16,
        rotation: 0,
        zIndex: 501,
        text: 'Kodupositsioon',
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
          type: '',
          params: '',
          isHidden: false,
        },
        size: '',
        styleTemplate: '',
        isHidden: false,
      },
    );
    const Text_82 = new TComponents.Text(
      this.find('#View_8943f6d1-f95d-4e5e-9b08-9d3c4f0ed4c2_Text_82'),
      {
        options: {
          async: false,
        },
        label: '',
        labelPos: 'top',
        onCreated: '',
        onMounted: '',
        textType: 'body',
        text: '',
        backgroundColor: 'rgba(218,200,180,1)',
        position: 'absolute',
        width: 154,
        height: 200,
        top: 277,
        left: 338,
        borderRadius: 60,
        rotation: 0,
        zIndex: 499,
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
        isHidden: false,
      },
    );
    const Text_83 = new TComponents.Text(
      this.find('#View_8943f6d1-f95d-4e5e-9b08-9d3c4f0ed4c2_Text_83'),
      {
        options: {
          async: false,
        },
        label: '',
        labelPos: 'top',
        onCreated: '',
        onMounted: '',
        textType: 'body',
        text: '',
        backgroundColor: 'rgba(218,200,180,1)',
        position: 'absolute',
        width: 154,
        height: 200,
        top: 279,
        left: 118,
        borderRadius: 60,
        rotation: 0,
        zIndex: 499,
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
        isHidden: false,
      },
    );
    const Text_84 = new TComponents.Text(
      this.find('#View_8943f6d1-f95d-4e5e-9b08-9d3c4f0ed4c2_Text_84'),
      {
        options: {
          async: false,
        },
        label: '',
        labelPos: 'top',
        onCreated: '',
        onMounted: '',
        textType: 'body',
        text: '',
        backgroundColor: 'rgba(218,200,180,1)',
        position: 'absolute',
        width: 264,
        height: 81,
        top: 140,
        left: 179,
        borderRadius: 60,
        rotation: 0,
        zIndex: 499,
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
        isHidden: false,
      },
    );
    const Text_90 = new TComponents.Text(
      this.find('#View_8943f6d1-f95d-4e5e-9b08-9d3c4f0ed4c2_Text_90'),
      {
        options: {
          async: false,
        },
        label: '',
        labelPos: 'top',
        onCreated: '',
        onMounted: '',
        textType: 'body',
        text: '',
        backgroundColor: 'rgba(218,200,180,1)',
        position: 'absolute',
        width: 285,
        height: 522,
        top: 19,
        left: 663,
        borderRadius: 60,
        rotation: 0,
        zIndex: 499,
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
        isHidden: false,
      },
    );
    const Text_49 = new TComponents.Text(
      this.find('#View_bfb1932b-3fc3-45c3-9ac8-07148b8e5ca5_Text_49'),
      {
        options: {
          async: false,
        },
        label: '',
        labelPos: 'top',
        onCreated: '',
        onMounted: '',
        textType: 'body',
        text: 'Signaalid',
        backgroundColor: 'rgba(202,113,113,1)',
        position: 'absolute',
        width: 408,
        height: 78,
        top: 30,
        left: 102,
        borderRadius: 47,
        rotation: 0,
        zIndex: 500,
        color: '#000000',
        font: {
          fontSize: 70,
          fontFamily: 'Segoe UI',
          style: {
            fontStyle: 'normal',
            fontWeight: 'bold',
            textDecoration: 'none',
          },
          textAlign: 'center',
        },
        isHidden: false,
      },
    );
    const DigitalLed_60 = new TComponents.DigitalLed(
      this.find('#View_bfb1932b-3fc3-45c3-9ac8-07148b8e5ca5_DigitalLed_60'),
      {
        options: {
          async: false,
        },
        label: '',
        labelPos: 'top',
        onCreated: '',
        onMounted: '',
        position: 'absolute',
        width: 40,
        height: 40,
        top: 218,
        left: 231,
        borderRadius: 0,
        rotation: 0,
        zIndex: 519,
        color: '#f0f0f0',
        size: '',
        font: {
          fontSize: 20,
          fontFamily: 'Segoe UI',
        },
        text: '$$digitalsignal.DO_AlustaAnimatsioon$$',
        inputVar: {
          type: 'bool',
          func: 'sync',
          value: '$$digitalsignal.DO_AlustaAnimatsioon$$',
          isHidden: false,
        },
        onChange: '',
        onClick: '',
        readOnly: false,
        isHidden: false,
      },
    );
    const Text_72 = new TComponents.Text(
      this.find('#View_bfb1932b-3fc3-45c3-9ac8-07148b8e5ca5_Text_72'),
      {
        options: {
          async: false,
        },
        label: '',
        labelPos: 'top',
        onCreated: '',
        onMounted: '',
        textType: 'body',
        text: 'DO_AlustaAnimatsioon',
        backgroundColor: 'rgba(202,113,113,1)',
        position: 'absolute',
        width: 129,
        height: 32,
        top: 222,
        left: 88,
        borderRadius: 16,
        rotation: 0,
        zIndex: 523,
        color: '#000000',
        font: {
          fontSize: 12,
          fontFamily: 'Segoe UI',
          style: {
            fontStyle: 'normal',
            fontWeight: 'normal',
            textDecoration: 'none',
          },
          textAlign: 'center',
        },
        isHidden: false,
      },
    );
    const DigitalLed_61 = new TComponents.DigitalLed(
      this.find('#View_bfb1932b-3fc3-45c3-9ac8-07148b8e5ca5_DigitalLed_61'),
      {
        options: {
          async: false,
        },
        label: '',
        labelPos: 'top',
        onCreated: '',
        onMounted: '',
        position: 'absolute',
        width: 40,
        height: 40,
        top: 272,
        left: 231,
        borderRadius: 0,
        rotation: 0,
        zIndex: 520,
        color: '#f0f0f0',
        size: '',
        font: {
          fontSize: 20,
          fontFamily: 'Segoe UI',
        },
        text: '$$digitalsignal.DO_AnnaKruvi2$$',
        inputVar: {
          type: 'bool',
          func: 'sync',
          value: '$$digitalsignal.DO_AnnaKruvi2$$',
          isHidden: false,
        },
        onChange: '',
        onClick: '',
        readOnly: false,
        isHidden: false,
      },
    );
    const DigitalLed_62 = new TComponents.DigitalLed(
      this.find('#View_bfb1932b-3fc3-45c3-9ac8-07148b8e5ca5_DigitalLed_62'),
      {
        options: {
          async: false,
        },
        label: '',
        labelPos: 'top',
        onCreated: '',
        onMounted: '',
        position: 'absolute',
        width: 40,
        height: 40,
        top: 328,
        left: 231,
        borderRadius: 0,
        rotation: 0,
        zIndex: 521,
        color: '#f0f0f0',
        size: '',
        font: {
          fontSize: 20,
          fontFamily: 'Segoe UI',
        },
        text: '$$digitalsignal.DO_Gripper$$',
        inputVar: {
          type: 'bool',
          func: 'sync',
          value: '$$digitalsignal.DO_Gripper$$',
          isHidden: false,
        },
        onChange: '',
        onClick: '',
        readOnly: false,
        isHidden: false,
      },
    );
    const DigitalLed_63 = new TComponents.DigitalLed(
      this.find('#View_bfb1932b-3fc3-45c3-9ac8-07148b8e5ca5_DigitalLed_63'),
      {
        options: {
          async: false,
        },
        label: '',
        labelPos: 'top',
        onCreated: '',
        onMounted: '',
        position: 'absolute',
        width: 40,
        height: 40,
        top: 381,
        left: 231,
        borderRadius: 0,
        rotation: 0,
        zIndex: 522,
        color: '#f0f0f0',
        size: '',
        font: {
          fontSize: 20,
          fontFamily: 'Segoe UI',
        },
        text: '$$digitalsignal.DO_LiigutaToodet$$',
        inputVar: {
          type: 'bool',
          func: 'sync',
          value: '$$digitalsignal.DO_LiigutaToodet$$',
          isHidden: false,
        },
        onChange: '',
        onClick: '',
        readOnly: false,
        isHidden: false,
      },
    );
    const DigitalLed_65 = new TComponents.DigitalLed(
      this.find('#View_bfb1932b-3fc3-45c3-9ac8-07148b8e5ca5_DigitalLed_65'),
      {
        options: {
          async: false,
        },
        label: '',
        labelPos: 'top',
        onCreated: '',
        onMounted: '',
        position: 'absolute',
        width: 40,
        height: 40,
        top: 218,
        left: 442,
        borderRadius: 0,
        rotation: 0,
        zIndex: 522,
        color: '#f0f0f0',
        size: '',
        font: {
          fontSize: 20,
          fontFamily: 'Segoe UI',
        },
        text: '$$digitalsignal.DO_KinnitaKruvi1$$',
        inputVar: {
          type: 'bool',
          func: 'sync',
          value: '$$digitalsignal.DO_KinnitaKruvi1$$',
          isHidden: false,
        },
        onChange: '',
        onClick: '',
        readOnly: false,
        isHidden: false,
      },
    );
    const DigitalLed_66 = new TComponents.DigitalLed(
      this.find('#View_bfb1932b-3fc3-45c3-9ac8-07148b8e5ca5_DigitalLed_66'),
      {
        options: {
          async: false,
        },
        label: '',
        labelPos: 'top',
        onCreated: '',
        onMounted: '',
        position: 'absolute',
        width: 40,
        height: 40,
        top: 272,
        left: 442,
        borderRadius: 0,
        rotation: 0,
        zIndex: 522,
        color: '#f0f0f0',
        size: '',
        font: {
          fontSize: 20,
          fontFamily: 'Segoe UI',
        },
        text: '$$digitalsignal.DO_KinnitaKruvi2$$',
        inputVar: {
          type: 'bool',
          func: 'sync',
          value: '$$digitalsignal.DO_KinnitaKruvi2$$',
          isHidden: false,
        },
        onChange: '',
        onClick: '',
        readOnly: false,
        isHidden: false,
      },
    );
    const DigitalLed_68 = new TComponents.DigitalLed(
      this.find('#View_bfb1932b-3fc3-45c3-9ac8-07148b8e5ca5_DigitalLed_68'),
      {
        options: {
          async: false,
        },
        label: '',
        labelPos: 'top',
        onCreated: '',
        onMounted: '',
        position: 'absolute',
        width: 40,
        height: 40,
        top: 328,
        left: 442,
        borderRadius: 0,
        rotation: 0,
        zIndex: 522,
        color: '#f0f0f0',
        size: '',
        font: {
          fontSize: 20,
          fontFamily: 'Segoe UI',
        },
        text: '$$digitalsignal.DO_KinnitaKruvi3$$',
        inputVar: {
          type: 'bool',
          func: 'sync',
          value: '$$digitalsignal.DO_KinnitaKruvi3$$',
          isHidden: false,
        },
        onChange: '',
        onClick: '',
        readOnly: false,
        isHidden: false,
      },
    );
    const DigitalLed_71 = new TComponents.DigitalLed(
      this.find('#View_bfb1932b-3fc3-45c3-9ac8-07148b8e5ca5_DigitalLed_71'),
      {
        options: {
          async: false,
        },
        label: '',
        labelPos: 'top',
        onCreated: '',
        onMounted: '',
        position: 'absolute',
        width: 40,
        height: 40,
        top: 381,
        left: 442,
        borderRadius: 0,
        rotation: 0,
        zIndex: 522,
        color: '#f0f0f0',
        size: '',
        font: {
          fontSize: 20,
          fontFamily: 'Segoe UI',
        },
        text: '$$digitalsignal.DO_KinnitaKruvi4$$',
        inputVar: {
          type: 'bool',
          func: 'sync',
          value: '$$digitalsignal.DO_KinnitaKruvi4$$',
          isHidden: false,
        },
        onChange: '',
        onClick: '',
        readOnly: false,
        isHidden: false,
      },
    );
    const Text_73 = new TComponents.Text(
      this.find('#View_bfb1932b-3fc3-45c3-9ac8-07148b8e5ca5_Text_73'),
      {
        options: {
          async: false,
        },
        label: '',
        labelPos: 'top',
        onCreated: '',
        onMounted: '',
        textType: 'body',
        text: 'DO_AnnaKruvi2',
        backgroundColor: 'rgba(202,113,113,1)',
        position: 'absolute',
        width: 129,
        height: 32,
        top: 278,
        left: 89,
        borderRadius: 16,
        rotation: 0,
        zIndex: 523,
        color: '#000000',
        font: {
          fontSize: 12,
          fontFamily: 'Segoe UI',
          style: {
            fontStyle: 'normal',
            fontWeight: 'normal',
            textDecoration: 'none',
          },
          textAlign: 'center',
        },
        isHidden: false,
      },
    );
    const Text_74 = new TComponents.Text(
      this.find('#View_bfb1932b-3fc3-45c3-9ac8-07148b8e5ca5_Text_74'),
      {
        options: {
          async: false,
        },
        label: '',
        labelPos: 'top',
        onCreated: '',
        onMounted: '',
        textType: 'body',
        text: 'DO_Gripper',
        backgroundColor: 'rgba(202,113,113,1)',
        position: 'absolute',
        width: 129,
        height: 32,
        top: 332,
        left: 88,
        borderRadius: 16,
        rotation: 0,
        zIndex: 523,
        color: '#000000',
        font: {
          fontSize: 12,
          fontFamily: 'Segoe UI',
          style: {
            fontStyle: 'normal',
            fontWeight: 'normal',
            textDecoration: 'none',
          },
          textAlign: 'center',
        },
        isHidden: false,
      },
    );
    const Text_75 = new TComponents.Text(
      this.find('#View_bfb1932b-3fc3-45c3-9ac8-07148b8e5ca5_Text_75'),
      {
        options: {
          async: false,
        },
        label: '',
        labelPos: 'top',
        onCreated: '',
        onMounted: '',
        textType: 'body',
        text: 'DO_LiigutaToodet',
        backgroundColor: 'rgba(202,113,113,1)',
        position: 'absolute',
        width: 129,
        height: 32,
        top: 385,
        left: 88,
        borderRadius: 16,
        rotation: 0,
        zIndex: 523,
        color: '#000000',
        font: {
          fontSize: 12,
          fontFamily: 'Segoe UI',
          style: {
            fontStyle: 'normal',
            fontWeight: 'normal',
            textDecoration: 'none',
          },
          textAlign: 'center',
        },
        isHidden: false,
      },
    );
    const Text_76 = new TComponents.Text(
      this.find('#View_bfb1932b-3fc3-45c3-9ac8-07148b8e5ca5_Text_76'),
      {
        options: {
          async: false,
        },
        label: '',
        labelPos: 'top',
        onCreated: '',
        onMounted: '',
        textType: 'body',
        text: 'DO_KinnitaKruvi1',
        backgroundColor: 'rgba(202,113,113,1)',
        position: 'absolute',
        width: 129,
        height: 32,
        top: 222,
        left: 302,
        borderRadius: 16,
        rotation: 0,
        zIndex: 523,
        color: '#000000',
        font: {
          fontSize: 12,
          fontFamily: 'Segoe UI',
          style: {
            fontStyle: 'normal',
            fontWeight: 'normal',
            textDecoration: 'none',
          },
          textAlign: 'center',
        },
        isHidden: false,
      },
    );
    const Text_77 = new TComponents.Text(
      this.find('#View_bfb1932b-3fc3-45c3-9ac8-07148b8e5ca5_Text_77'),
      {
        options: {
          async: false,
        },
        label: '',
        labelPos: 'top',
        onCreated: '',
        onMounted: '',
        textType: 'body',
        text: 'DO_KinnitaKruvi2',
        backgroundColor: 'rgba(184,196,183,1)',
        position: 'absolute',
        width: 129,
        height: 32,
        top: 276,
        left: 302,
        borderRadius: 16,
        rotation: 0,
        zIndex: 523,
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
        isHidden: false,
      },
    );
    const Text_78 = new TComponents.Text(
      this.find('#View_bfb1932b-3fc3-45c3-9ac8-07148b8e5ca5_Text_78'),
      {
        options: {
          async: false,
        },
        label: '',
        labelPos: 'top',
        onCreated: '',
        onMounted: '',
        textType: 'body',
        text: 'DO_KinnitaKruvi2',
        backgroundColor: 'rgba(202,113,113,1)',
        position: 'absolute',
        width: 129,
        height: 32,
        top: 276,
        left: 302,
        borderRadius: 16,
        rotation: 0,
        zIndex: 523,
        color: '#000000',
        font: {
          fontSize: 12,
          fontFamily: 'Segoe UI',
          style: {
            fontStyle: 'normal',
            fontWeight: 'normal',
            textDecoration: 'none',
          },
          textAlign: 'center',
        },
        isHidden: false,
      },
    );
    const Text_79 = new TComponents.Text(
      this.find('#View_bfb1932b-3fc3-45c3-9ac8-07148b8e5ca5_Text_79'),
      {
        options: {
          async: false,
        },
        label: '',
        labelPos: 'top',
        onCreated: '',
        onMounted: '',
        textType: 'body',
        text: 'DO_KinnitaKruvi3',
        backgroundColor: 'rgba(202,113,113,1)',
        position: 'absolute',
        width: 129,
        height: 32,
        top: 333,
        left: 304,
        borderRadius: 16,
        rotation: 0,
        zIndex: 523,
        color: '#000000',
        font: {
          fontSize: 12,
          fontFamily: 'Segoe UI',
          style: {
            fontStyle: 'normal',
            fontWeight: 'normal',
            textDecoration: 'none',
          },
          textAlign: 'center',
        },
        isHidden: false,
      },
    );
    const Text_80 = new TComponents.Text(
      this.find('#View_bfb1932b-3fc3-45c3-9ac8-07148b8e5ca5_Text_80'),
      {
        options: {
          async: false,
        },
        label: '',
        labelPos: 'top',
        onCreated: '',
        onMounted: '',
        textType: 'body',
        text: 'DO_KinnitaKruvi4',
        backgroundColor: 'rgba(202,113,113,1)',
        position: 'absolute',
        width: 129,
        height: 32,
        top: 385,
        left: 302,
        borderRadius: 16,
        rotation: 0,
        zIndex: 523,
        color: '#000000',
        font: {
          fontSize: 12,
          fontFamily: 'Segoe UI',
          style: {
            fontStyle: 'normal',
            fontWeight: 'normal',
            textDecoration: 'none',
          },
          textAlign: 'center',
        },
        isHidden: false,
      },
    );
    const Text_85 = new TComponents.Text(
      this.find('#View_bfb1932b-3fc3-45c3-9ac8-07148b8e5ca5_Text_85'),
      {
        options: {
          async: false,
        },
        label: '',
        labelPos: 'top',
        onCreated: '',
        onMounted: '',
        textType: 'body',
        text: '',
        backgroundColor: 'rgba(218,200,180,1)',
        position: 'absolute',
        width: 208,
        height: 261,
        top: 195,
        left: 282,
        borderRadius: 60,
        rotation: 0,
        zIndex: 499,
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
        isHidden: false,
      },
    );
    const Text_87 = new TComponents.Text(
      this.find('#View_bfb1932b-3fc3-45c3-9ac8-07148b8e5ca5_Text_87'),
      {
        options: {
          async: false,
        },
        label: '',
        labelPos: 'top',
        onCreated: '',
        onMounted: '',
        textType: 'body',
        text: '',
        backgroundColor: 'rgba(218,200,180,1)',
        position: 'absolute',
        width: 208,
        height: 261,
        top: 195,
        left: 71,
        borderRadius: 60,
        rotation: 0,
        zIndex: 499,
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
        isHidden: false,
      },
    );
    const Image_88 = new TComponents.Image(
      this.find('#View_bfb1932b-3fc3-45c3-9ac8-07148b8e5ca5_Image_88'),
      {
        options: {
          async: false,
        },
        label: '',
        labelPos: 'top',
        onCreated: '',
        onMounted: '',
        imgSrc: 'img_1747053360825IRB1300_png',
        imgStyle: {
          objectFit: 'fill',
        },
        onClick: '',
        position: 'absolute',
        width: 234,
        height: 467,
        top: 46,
        left: 689,
        zIndex: 513,
        isHidden: false,
      },
    );
    const Text_89 = new TComponents.Text(
      this.find('#View_bfb1932b-3fc3-45c3-9ac8-07148b8e5ca5_Text_89'),
      {
        options: {
          async: false,
        },
        label: '',
        labelPos: 'top',
        onCreated: '',
        onMounted: '',
        textType: 'body',
        text: '',
        backgroundColor: 'rgba(218,200,180,1)',
        position: 'absolute',
        width: 285,
        height: 522,
        top: 19,
        left: 663,
        borderRadius: 60,
        rotation: 0,
        zIndex: 499,
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
        isHidden: false,
      },
    );
    const Hamburger_4 = new TComponents.Hamburger(
      this.find('#Page_d88b2723-79da-4840-8032-eb828734c12d_Hamburger_4'),
      {
        options: {
          async: false,
        },
        label: '',
        labelPos: 'top',
        onCreated: '',
        onMounted: '',
        position: 'absolute',
        width: 1017,
        height: 622,
        top: 54,
        left: 4,
        borderRadius: 0,
        rotation: 0,
        zIndex: 500,
        border: '1px groove rgba(204,204,204,1)',
        color: 'rgba(0,0,0,1)',
        backgroundColor: 'rgba(244,237,237,1)',
        font: {
          fontSize: 12,
          fontFamily: 'Segoe UI',
          style: {
            fontStyle: 'normal',
            fontWeight: 'normal',
            textDecoration: 'none',
          },
        },
        size: '',
        styleTemplate: '',
        useTitle: true,
        title: '',
        activeViewIndex: 0,
        onChange: '',
        useViewIcon: true,
        views: [
          {
            name: 'Item 0',
            content: this.find('#View_28229297-07c8-496b-a8ce-c111daf38d08'),
            id: null,
            icon: 'abb-icon abb-icon-abb_robot-tool_32',
            image: '',
          },
          {
            name: 'Item 1',
            content: this.find('#View_8943f6d1-f95d-4e5e-9b08-9d3c4f0ed4c2'),
            id: null,
            icon: null,
            image: '',
          },
          {
            name: 'Item 2',
            content: this.find('#View_bfb1932b-3fc3-45c3-9ac8-07148b8e5ca5'),
            id: null,
            icon: null,
            image: '',
          },
        ],
        alwaysVisible: true,
        isHidden: false,
      },
    );
    const Page_1 = new TComponents.Page(this.find('#web-designer'), {
      options: {
        async: false,
      },
      label: '',
      labelPos: 'top',
      onCreated: '',
      onMounted: '',
      position: 'absolute',
      width: 1024,
      height: 680,
      top: 0,
      left: 0,
      zIndex: 0,
      backgroundColor: 'rgba(255,255,255,1)',
      background: '',
      id: '',
      name: '',
    });

    const instance = {
      Text_25,
      Text_13,
      ControllerKit_m50dwm7t_fo4z4_MotorState_17,
      ControllerKit_m50dwm7t_fo4z4_MotorOn_15,
      ControllerKit_m50dwm7t_fo4z4_MotorOff_16,
      Text_26,
      Image_35,
      ControllerKit_m50dwm7t_fo4z4_Play_29,
      ControllerKit_m50dwm7t_fo4z4_ControllerState_20,
      ControllerKit_m50dwm7t_fo4z4_Manual_18,
      ControllerKit_m50dwm7t_fo4z4_Auto_19,
      ControllerKit_m50dwm7t_fo4z4_Restart_21,
      ControllerKit_m50dwm7t_fo4z4_PPToMain_22,
      Text_27,
      ControllerKit_m50dwm7t_fo4z4_Stop_30,
      Text_28,
      Text_46,
      Text_91,
      Text_31,
      Button_34,
      Button_41,
      Button_37,
      Image_36,
      Button_42,
      Button_38,
      Button_39,
      Button_43,
      Button_40,
      Button_44,
      Button_47,
      Text_82,
      Text_83,
      Text_84,
      Text_90,
      Text_49,
      DigitalLed_60,
      Text_72,
      DigitalLed_61,
      DigitalLed_62,
      DigitalLed_63,
      DigitalLed_65,
      DigitalLed_66,
      DigitalLed_68,
      DigitalLed_71,
      Text_73,
      Text_74,
      Text_75,
      Text_76,
      Text_77,
      Text_78,
      Text_79,
      Text_80,
      Text_85,
      Text_87,
      Image_88,
      Text_89,
      Hamburger_4,
      Page_1,
    };
    window.Instance = instance;
    return instance;
  }

  markup() {
    return /*html*/ `
<div
  id="web-designer"
  class="flex-col justify-stretch overflow-auto html-container"
>
  <div id="Page_d88b2723-79da-4840-8032-eb828734c12d"></div>

  <div id="Page_d88b2723-79da-4840-8032-eb828734c12d_Text_25" class=""></div>

  <div
    id="Page_d88b2723-79da-4840-8032-eb828734c12d_Hamburger_4"
    class="t-component t-component__item--container flex-row justify-stretch floating resizable"
  ></div>

  <div
    id="View_28229297-07c8-496b-a8ce-c111daf38d08"
    class="html-container flex-col justify-stretch overflow-auto"
  >
    <div id="View_28229297-07c8-496b-a8ce-c111daf38d08_Text_13" class=""></div>

    <div
      id="View_28229297-07c8-496b-a8ce-c111daf38d08_ControllerKit_m50dwm7t_fo4z4_MotorState_17"
      class=""
    ></div>

    <div
      id="View_28229297-07c8-496b-a8ce-c111daf38d08_ControllerKit_m50dwm7t_fo4z4_MotorOn_15"
      class=""
    ></div>

    <div
      id="View_28229297-07c8-496b-a8ce-c111daf38d08_ControllerKit_m50dwm7t_fo4z4_MotorOff_16"
      class=""
    ></div>

    <div id="View_28229297-07c8-496b-a8ce-c111daf38d08_Text_26" class=""></div>

    <div
      id="View_28229297-07c8-496b-a8ce-c111daf38d08_Image_35"
      class="t-component"
    ></div>

    <div
      id="View_28229297-07c8-496b-a8ce-c111daf38d08_ControllerKit_m50dwm7t_fo4z4_Play_29"
      class=""
    ></div>

    <div
      id="View_28229297-07c8-496b-a8ce-c111daf38d08_ControllerKit_m50dwm7t_fo4z4_ControllerState_20"
      class=""
    ></div>

    <div
      id="View_28229297-07c8-496b-a8ce-c111daf38d08_ControllerKit_m50dwm7t_fo4z4_Manual_18"
      class=""
    ></div>

    <div
      id="View_28229297-07c8-496b-a8ce-c111daf38d08_ControllerKit_m50dwm7t_fo4z4_Auto_19"
      class=""
    ></div>

    <div
      id="View_28229297-07c8-496b-a8ce-c111daf38d08_ControllerKit_m50dwm7t_fo4z4_Restart_21"
      class=""
    ></div>

    <div
      id="View_28229297-07c8-496b-a8ce-c111daf38d08_ControllerKit_m50dwm7t_fo4z4_PPToMain_22"
      class=""
    ></div>

    <div id="View_28229297-07c8-496b-a8ce-c111daf38d08_Text_27" class=""></div>

    <div
      id="View_28229297-07c8-496b-a8ce-c111daf38d08_ControllerKit_m50dwm7t_fo4z4_Stop_30"
      class=""
    ></div>

    <div id="View_28229297-07c8-496b-a8ce-c111daf38d08_Text_28" class=""></div>

    <div id="View_28229297-07c8-496b-a8ce-c111daf38d08_Text_46" class=""></div>

    <div id="View_28229297-07c8-496b-a8ce-c111daf38d08_Text_91" class=""></div>
  </div>

  <div
    id="View_8943f6d1-f95d-4e5e-9b08-9d3c4f0ed4c2"
    class="html-container flex-col justify-stretch overflow-auto"
  >
    <div id="View_8943f6d1-f95d-4e5e-9b08-9d3c4f0ed4c2_Text_31" class=""></div>

    <div
      id="View_8943f6d1-f95d-4e5e-9b08-9d3c4f0ed4c2_Button_34"
      class=""
    ></div>

    <div
      id="View_8943f6d1-f95d-4e5e-9b08-9d3c4f0ed4c2_Button_41"
      class=""
    ></div>

    <div
      id="View_8943f6d1-f95d-4e5e-9b08-9d3c4f0ed4c2_Button_37"
      class=""
    ></div>

    <div
      id="View_8943f6d1-f95d-4e5e-9b08-9d3c4f0ed4c2_Image_36"
      class="t-component"
    ></div>

    <div
      id="View_8943f6d1-f95d-4e5e-9b08-9d3c4f0ed4c2_Button_42"
      class=""
    ></div>

    <div
      id="View_8943f6d1-f95d-4e5e-9b08-9d3c4f0ed4c2_Button_38"
      class=""
    ></div>

    <div
      id="View_8943f6d1-f95d-4e5e-9b08-9d3c4f0ed4c2_Button_39"
      class=""
    ></div>

    <div
      id="View_8943f6d1-f95d-4e5e-9b08-9d3c4f0ed4c2_Button_43"
      class=""
    ></div>

    <div
      id="View_8943f6d1-f95d-4e5e-9b08-9d3c4f0ed4c2_Button_40"
      class=""
    ></div>

    <div
      id="View_8943f6d1-f95d-4e5e-9b08-9d3c4f0ed4c2_Button_44"
      class=""
    ></div>

    <div
      id="View_8943f6d1-f95d-4e5e-9b08-9d3c4f0ed4c2_Button_47"
      class=""
    ></div>

    <div id="View_8943f6d1-f95d-4e5e-9b08-9d3c4f0ed4c2_Text_82" class=""></div>

    <div id="View_8943f6d1-f95d-4e5e-9b08-9d3c4f0ed4c2_Text_83" class=""></div>

    <div id="View_8943f6d1-f95d-4e5e-9b08-9d3c4f0ed4c2_Text_84" class=""></div>

    <div id="View_8943f6d1-f95d-4e5e-9b08-9d3c4f0ed4c2_Text_90" class=""></div>
  </div>

  <div
    id="View_bfb1932b-3fc3-45c3-9ac8-07148b8e5ca5"
    class="html-container flex-col justify-stretch overflow-auto"
  >
    <div id="View_bfb1932b-3fc3-45c3-9ac8-07148b8e5ca5_Text_49" class=""></div>

    <div
      id="View_bfb1932b-3fc3-45c3-9ac8-07148b8e5ca5_DigitalLed_60"
      class=""
    ></div>

    <div id="View_bfb1932b-3fc3-45c3-9ac8-07148b8e5ca5_Text_72" class=""></div>

    <div
      id="View_bfb1932b-3fc3-45c3-9ac8-07148b8e5ca5_DigitalLed_61"
      class=""
    ></div>

    <div
      id="View_bfb1932b-3fc3-45c3-9ac8-07148b8e5ca5_DigitalLed_62"
      class=""
    ></div>

    <div
      id="View_bfb1932b-3fc3-45c3-9ac8-07148b8e5ca5_DigitalLed_63"
      class=""
    ></div>

    <div
      id="View_bfb1932b-3fc3-45c3-9ac8-07148b8e5ca5_DigitalLed_65"
      class=""
    ></div>

    <div
      id="View_bfb1932b-3fc3-45c3-9ac8-07148b8e5ca5_DigitalLed_66"
      class=""
    ></div>

    <div
      id="View_bfb1932b-3fc3-45c3-9ac8-07148b8e5ca5_DigitalLed_68"
      class=""
    ></div>

    <div
      id="View_bfb1932b-3fc3-45c3-9ac8-07148b8e5ca5_DigitalLed_71"
      class=""
    ></div>

    <div id="View_bfb1932b-3fc3-45c3-9ac8-07148b8e5ca5_Text_73" class=""></div>

    <div id="View_bfb1932b-3fc3-45c3-9ac8-07148b8e5ca5_Text_74" class=""></div>

    <div id="View_bfb1932b-3fc3-45c3-9ac8-07148b8e5ca5_Text_75" class=""></div>

    <div id="View_bfb1932b-3fc3-45c3-9ac8-07148b8e5ca5_Text_76" class=""></div>

    <div id="View_bfb1932b-3fc3-45c3-9ac8-07148b8e5ca5_Text_77" class=""></div>

    <div id="View_bfb1932b-3fc3-45c3-9ac8-07148b8e5ca5_Text_78" class=""></div>

    <div id="View_bfb1932b-3fc3-45c3-9ac8-07148b8e5ca5_Text_79" class=""></div>

    <div id="View_bfb1932b-3fc3-45c3-9ac8-07148b8e5ca5_Text_80" class=""></div>

    <div id="View_bfb1932b-3fc3-45c3-9ac8-07148b8e5ca5_Text_85" class=""></div>

    <div id="View_bfb1932b-3fc3-45c3-9ac8-07148b8e5ca5_Text_87" class=""></div>

    <div
      id="View_bfb1932b-3fc3-45c3-9ac8-07148b8e5ca5_Image_88"
      class="t-component"
    ></div>

    <div id="View_bfb1932b-3fc3-45c3-9ac8-07148b8e5ca5_Text_89" class=""></div>
  </div>
</div>
`;
  }
}
