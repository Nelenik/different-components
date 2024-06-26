// "use strict";
import Generator from "yeoman-generator";
import { sync } from "mkdirp";

export default class extends Generator {
  constructor(args, opts) {
    // Calling the super constructor is important so our generator is correctly set up
    super(args, opts);

    this._createComponentNameArgument();
    this._createPathArgument();

    this._createTsOption();
    this._createCssModuleOption();
    this._createStylesOption();
    this._createLessOption();
    this._createSassOption();
    this._createScssOption();

    if (this.options.less === true && this.options.sass === true) {
      this.log("Wrong flags combination! Choose either less or sass.");
    }
  }

  // async prompting() {
  //   this.log(yosay(`Let's generate react components!`));
  // }

  writing() {
    const capitalizeComponentName = this._capitalize(
      this.options.componentName
    );

    let componentExt = this.options.ts ? "tsx" : "jsx";
    let reexportExt = this.options.ts ? "ts" : "js";

    const dir = sync(`${this.options.path}/${capitalizeComponentName}`);
    let stylesExt = "css";

    if (this.options.less) stylesExt = "less";
    if (this.options.scss) stylesExt = "scss";
    if (this.options.sass) stylesExt = "sass";
    if (this.options.cssModule) stylesExt = `module.${stylesExt}`;

    const styleFilename = `${this.options.componentName.toLowerCase()}.${stylesExt}`;

    this.fs.copyTpl(
      this.templatePath("Component.ejs"),
      this.destinationPath(dir, `${capitalizeComponentName}.${componentExt}`),
      {
        componentName: capitalizeComponentName,
        stylesName: styleFilename,
        withStyles: this.options.styles,
        withModule: this.options.cssModule,
      }
    );

    this.fs.copyTpl(
      this.templatePath("reexport.ejs"),
      this.destinationPath(dir, `index.${reexportExt}`),
      { componentName: capitalizeComponentName }
    );

    if (this.options.styles === true) {
      this.fs.copyTpl(
        this.templatePath("styles.ejs"),
        this.destinationPath(dir, styleFilename)
      );
    }
  }

  _capitalize(str) {
    return str[0].toUpperCase().concat(str.slice(1));
  }

  _createComponentNameArgument() {
    return this.argument("componentName", {
      desc: "name of the component",
      type: String,
      optional: true,
      default: "Component",
    });
  }

  _createPathArgument() {
    return this.argument("path", {
      desc: "path where to generate component",
      type: String,
      optional: true,
      default: "./",
    });
  }

  _createStylesOption() {
    return this.option("styles", {
      desc: "styles will be generated if this option is added",
      alias: "s",
      type: Boolean,
      default: true,
    });
  }

  _createLessOption() {
    return this.option("less", {
      desc: "generate less styles files if set",
      alias: "le",
      type: Boolean,
      default: false,
    });
  }

  _createSassOption() {
    return this.option("sass", {
      desc: "generate sass styles files if set",
      alias: "sa",
      type: Boolean,
      default: false,
    });
  }

  _createScssOption() {
    return this.option("scss", {
      desc: "generate scss styles files if set",
      alias: "sc",
      type: Boolean,
      default: false,
    });
  }

  _createCssModuleOption() {
    return this.option("cssModule", {
      desc: "generate css modules if set",
      alias: "cssm",
      type: Boolean,
      default: false,
    });
  }
  _createTsOption() {
    return this.option("ts", {
      desc: "generate typescript files for react if set",
      alias: "ts",
      type: Boolean,
      default: false,
    });
  }
}
