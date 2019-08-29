const chalk = require('chalk');
const inquirer = require("inquirer");
const deasync = require("deasync")

const getGlobal = () => {
  if(typeof gloabal !== "undefined") return gloabal;
  return window;
}
const callbackify = (promiseFactory) => {
  return (...args) => {
    const cb = args[args.length-1];
    args.pop();
    return promiseFactory(...args)
      .then( result => cb(undefined,result) )
      .catch( e => cb(e,undefined) )
  }
}

let display_development_output = false;
const colors = {
}
const defaultColors = {
  info: (...input) => chalk.blue(...input),
  form: (...input) => chalk.magenta(...input),
  success: (...input) => chalk.green(...input),
  warning: (...input) => chalk.red(...input),
  error: (...input) => chalk.white.bgRed(...input),
}
const apply_color = (colorId, ...input) => {
  const brush = colors[colorId] || console.log;
  return brush(...input);
}
const out = (colorId, ...input) => {
  console.log(apply_color(colorId, ...input));
}
const dev = (...args) => {
  if (display_development_output) out(...args);
}

const set_color = (colorId, brush) => {
  colors[colorId] = brush;
  out[colorId] = (...input) => out(colorId, ...input)
  dev[colorId] = (...input) => dev(colorId, ...input)
}

for (const colorId in defaultColors) {
  if (defaultColors.hasOwnProperty(colorId)) {
    set_color(colorId, defaultColors[colorId])
  }
}

const input = {
  text: async (questionText, defaultValue, validator) => {
    const question = {
      type: "input",
      name: "inp",
      message: questionText
    };
    if (["string", "number", "boolean", "array", "function"].includes(defaultValue))
      question.default = defaultValue;

    if (typeof validator === "function") {
      question.validate = validator;
    }
    try {
      const response = await inquirer.prompt([question]);
      return response.inp;
    }
    catch (e) {
      out.error("unable to querry", e)
    }
  },
  list: async (questionText, choices) => {
    const question = {
      type: "list",
      name: "inp",
      choices,
      message: questionText
    };
    try {
      const response = await inquirer.prompt([question]);
      return response.inp;
    }
    catch (e) {
      out.error("unable to querry", e)
    }
  },
  checkbox: async (questionText, choices) => {
    const question = {
      type: "checkbox",
      name: "inp",
      choices,
      message: questionText
    };
    try {
      const response = await inquirer.prompt([question]);
      return response.inp;
    }
    catch (e) {
      out.error("unable to querry", e)
    }
  },
  confirm: async (questionText) => {
    const question = {
      type: "confirm",
      name: "inp",
      message: questionText
    };
    try {
      const response = await inquirer.prompt([question]);
      return response.inp;
    }
    catch (e) {
      out.error("unable to querry", e)
    }
  },
  pass: async (questionText, validator) => {
    const question = {
      type: "password",
      name: "inp",
      message: questionText
    }
    if (typeof validator === "function") {
      question.validate = validator;
    }
    try {
      const response = await inquirer.prompt([question]);
      return response.inp;
    }
    catch (e) {
      out.error("unable to querry", e)
    }
  }
}

const syncInput = {
  text: (...args) => {
    return deasync(
      callbackify(input.text)
    )(...args);
  }
}

for (const inputType in input) {
  if (input.hasOwnProperty(inputType)) {
    syncInput[inputType] = (...args) => {
      return deasync(
        callbackify(input[inputType])
      )(...args);
    }
  }
}

module.exports = {
  setDevelopmentMode: (active) => {
    display_development_output = active;
    return active;
  },
  out,
  dev,
  apply_color,
  input,
  syncInput
}
