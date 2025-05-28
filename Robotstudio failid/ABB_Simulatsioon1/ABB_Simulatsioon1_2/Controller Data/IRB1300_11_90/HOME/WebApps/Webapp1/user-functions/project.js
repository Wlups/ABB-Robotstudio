const ProjectUserFunction = {};

if (!ProjectUserFunction) {
  ProjectUserFunction = {};
}
ProjectUserFunction['Startoige'] = async function onSwitchModeChange(newValue) {
  // flip controller mode
  await API.CONTROLLER.setOpMode(
    newValue ? API.CONTROLLER.OPMODE.Auto : API.CONTROLLER.OPMODE.Manual,
  );
  // update your Text_17 label
  //Text_17.text = newValue ? "Auto" : "Manual";
};

export default ProjectUserFunction;
