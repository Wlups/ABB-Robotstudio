
  import ProjectUserFunction from './project.js';
  import EnableKitsUserFunction from './kits.js';

  ((root) => {
    root.UserFunction = Object.assign(ProjectUserFunction,EnableKitsUserFunction);
  })(self !== undefined ? self : this);

  