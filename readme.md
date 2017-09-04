# Description
`this-promise` is a module that creates the Promise chain of `[Array]` list of promises with its own **inner userContext** `this` context.

* Any bugs found? Give me to know on dev.rafalko@gmail.com or on [GitHub](https://github.com/devrafalko/this-promise)

# Installation
`npm install this-promise`

```javascript
const thisPromise = require('this-promise');
```

# Idea
* The `this-promise` function allows you to create the chain of promises by passing all promises as the [Array] list through the module function, what may turn out to be more elegant and readable in some cases.
* Under the hood, the native `Promise` object with its `then` and `catch` methods is used.
* It creates dynamically the chain of `then()` and `catch()` methods. The promises are called back-to-back, as if they were called manually with `Promise.resolve().then(a).then(b).then(c).catch(err)` etc.
* It is similar to `Promise.all` and `Promise.race` built-in methods, where the iterable object is passed through it as an argument with the promises *(or other values)*.
* Each `then` and `catch` handler is binded to the inner userContext `this` object. It allows all promises to get and set the data using `this` keyword, rather than pass the data through `resolve(data)` and `reject(data)` callback functions to the further promises.

# Usage
### `thisPromise(list[,finalThen[,finalCatch]])`

##### `list` **[Array]**
* The [Array] list should contain the items that will be chained with Promise `then` method.
* The items should be of [Function] type. They are automatically passed as Promise `then(item)`'s handlers
* The [Function] item can return the [Promise] object. Then the item will be queued in the chain and the further items will be suspended till the fulfilment or rejection of this item. [\[see below\]](#mind-how-promises-are-passed-as-array-items)
* The items can be **also** of any type. The value is automatically encapsulated *(returned)* in the function and passed as resolved Promise *(send to the further promise)* [\[see below\]](#the-array-item-can-be-of-any-type)

##### `finalThen` **[Function]** *optional*
* The [Function] `finalThen` is automatically attached at the end of the chain as `then()` function and executed as the last promise *(if all previous promises succeeded)* [\[see below\]](#mind-how-promises-are-passed-as-array-items)

##### `finalCatch` **[Function]** *optional*
* The [Function] `finalCatch` is automatically attached at the end of the chain as `catch()` function and executed in case of the rejection of any of the promises. [\[see below\]](#the-finalthen-and-finalcatch-parameters-are-optional)

# Return
The `thisPromise` function returns the [Promise] object, so further `then`s and `catch`es can be attached to it [\[see below\]](#the-contextpromise-module-returns-the-promise-so-the-further-thens-and-catches-can-be-attached)

# Samples

###### Mind how `this` keyword is used in the handlers.
###### Mind how promises are passed as [Array] items.
```javascript
const thisPromise = require('this-promise');

thisPromise([init,name,age],print,handleError);

function init(get){
  //set some initial data to the this userContext object
  //that will be accessible in each chained promise
  this.isCoder = true;
  this.isHuman = true;
  this.experience = 5;
}

function name(){
  return new Promise((resolve,reject)=>{
    setTimeout(()=>{
      //fetch async data and set it to this userContext object
      console.log('name fetched');
      this.name = 'John Doe';
      resolve();
    },1000);
  });
}

function age(){
  return new Promise((resolve,reject)=>{
    setTimeout(()=>{
      //fetch another async data and set it to this userContext object
      console.log('age fetched');
      this.age = 25;
      resolve();
    },1000);
  });
}

function print(){
  console.log(`I'm ${this.name} and I'm ${this.age} years old.`);
  if(this.isHuman) console.log(`I'm also a human.`);
  if(this.isCoder) console.log(`I have ${this.experience} years’ experience as a coder.`);
}

function handleError(err){
  console.error(err);
}
```

###### The `finalThen` and `finalCatch` parameters are optional.
###### They are attached to the chain only if they are of [Function] type.
```javascript
const thisPromise = require('this-promise');

thisPromise([promise],null,handleError);

function promise(){
  return new Promise((resolve,reject)=>{
    reject('Could not fetch the data.');
  });
}

function handleError(msg){
  console.error(new Error(msg));
}
```

###### The [Array] item can be of any type
###### It is automatically encapsulated (returned) in the function

```javascript
const thisPromise = require('this-promise');

thisPromise([{name:'John Doe',age:25},promise],print,handleError);
//the {name:'John Doe',age:25} is automatically encapsupated in the function
//function(){ return {name:'John Doe',age:25}; }
//and passed through then() method

function promise(getData){
  //now the {name:'John Doe',age:25} object is accessible as getData parameter
  this.name = getData.name;
  this.age = getData.age;
}

function print(){
  console.log(`Hello, I'm ${this.name} and I'm ${this.age} years old.`);
  //Hello, I'm John Doe and I'm 25 years old.
}

function handleError(msg){
  console.error(new Error(msg));
}
```
###### The `contextPromise` module returns the Promise, so the further `then`s and `catch`es can be attached
###### Unfortunately the userContext `this` object is inaccessible in outer `then`s and `catch`es

```javascript
const thisPromise = require('this-promise');

thisPromise([promise])
.then((getThis)=>{
  //this promise is out of the module function
  //so it is not binded to the userContext this object
  console.log(this.name);  //undefined
  console.log(this.age);  //undefined
  
  //but the userContext this object can be passed in the resolve() callback
  console.log(getThis.name); //John Doe
  console.log(getThis.age); //25
})
.catch((err)=>{
  console.log('catch');
});

function promise(getData){
  return new Promise((resolve,reject)=>{
    setTimeout(()=>{
      this.name = 'John Done';
      this.age = 25;
      console.log('Promise resolved!');
      //as the userContext this object will not be accessible in the outer thens and catches
      //pass the userContext this object through resolve() callback function
      resolve(this);
    },1000);
  });
}
```