/* global Function, Promise */

const args = require('typeof-arguments');
const type = require('of-type');
const clc = require('cli-color');
const warn = clc.bgYellow.blue;
const moduleName = require('./package.json').name;

module.exports = function (promiseList, finalDone, errHandle){
  args(arguments,[Array],(o)=>{
    throw new TypeError(`${warn(moduleName)}: ${o.message}`);
  });

  var userContext = new UserContext();
  var isFinalDoneDefined = type(finalDone, Function);
  var isFinalCatchDefined = type(errHandle, Function);
  if(isFinalDoneDefined) promiseList.push(finalDone);
  if(isFinalCatchDefined) promiseList.push(errHandle);
  return promiseList.reduce((total, curVal, curInd, arr)=>{
    var last = curInd+1===arr.length;
    var method = last && isFinalCatchDefined ? 'catch':'then';
    var encapsNonFunctions = type(curVal, Function) ? curVal:function(){return curVal;};
    var concatenated = total[method](encapsNonFunctions.bind(userContext));
    return concatenated;
  },Promise.resolve());
    function UserContext(){};
};