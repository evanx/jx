

exports.attrs = {
   "class": {
   },
   id: {
   },
   href: {
   },
   src: {
   }
};

exports.meta = {
   html: {
      parent: 'html'
   },
   head: {
      parent: 'html'
   },
   title: {
      parent: 'head'
   },
   meta: {
      parent: 'head'
   },
   link: {
      parent: 'head',
      contentAttr: 'href',
      defaultAttrs: {
         type: 'text/css',
         rel: 'stylesheet'
      }
   },
   body: {
      parent: 'html'
   },
   container: {
      puedo: true
   },
   a: {
      attrs: {
         href: {
         },
         src: {
         }
      }
   },
   article: {
      semantic: true
   },
   aside: {
      semantic: true
   },
   br: {
   },
   hr: {
   },
   details: {
      semantic: true
   },
   div: {
   },
   header: {
      semantic: true

   },
   figure: {
      semantic: true

   },
   figcaption: {
      semantic: true

   },
   footer: {
      semantic: true

   },
   h1: {
   },
   h2: {
   },
   h3: {
   },
   h4: {
   },
   h5: {
   },
   h6: {
   },
   img: {
      contentAttr: 'src'
   },
   li: {
   },
   main: {
      semantic: true
   },
   mark: {
      semantic: true
   },
   ol: {
   },
   p: {
   },
   script: {
      attrs: {
         src: {
         }
      },
      defaultAttrs: {
         language: 'javascript'
      }
   },
   section: {
      semantic: true
   },
   span: {
   },
   summary: {
      semantic: true
   },
   table: {
   },
   thead: {
   },
   tbody: {
   },
   tr: {
      parents: ['table', 'thead', 'tbody']
   },
   th: {
      parents: ['tr']
   },
   td: {
      parents: ['tr']
   },
   time: {
      semantic: true
   },
   ul: {
   },
};

function isArray(object) {
   return Object.prototype.toString.call(object) === '[object Array]';
}

function clone(object) {
   var clonedObject = {};
   for (var prop in object) {
      clonedObject[prop] = object[prop];
   }
   return clonedObject;
}

function findElementName(object) {
   for (var prop in object) {
      var meta = exports.meta[prop];
      if (meta) {
         return prop;
      }
   }
}

function findRepeatItem(object) {
   for (var prop in object) {
      var repeatIndex = prop.indexOf("$repeat");
      if (repeatIndex > 0) {
         var elementName = prop.substring(0, repeatIndex);
         var meta = exports.meta[elementName];
         if (meta) {
            return {prop: prop, elementName: elementName};
         } else {
            console.warn('repeat element invalid', elementName);
         }
      }
   }
}

exports.each = function (array, object) {
   if (!array || !array.length || !object || object.show === false) {
      return undefined;
   }
   var elementName = findElementName(object);
   if (!elementName) {
      console.warn('element not found', Object.keys(object));
   } else {
      if (typeof object[elementName] !== 'function') {
         console.warn('each element not function', elementName);
      } else {
         var fn = object[elementName];
         object[elementName] = undefined;
         var content = [];
         array.forEach(function (item) {
            var child = clone(object);
            child.content = fn(item);
            child.elementName = elementName;
            content.push(child);
         });
         return content;
      }
   }
}

function repeatFnParent(object, prop, elementName, parentElementName) {
   console.info('repeat function', elementName, parentElementName);
   var fn = object[prop];
   var array = object[parentElementName];
   var content = [];
   array.forEach(function (item) {
      content.push(fn(item));
   });
   object[parentElementName] = content;
   object[prop] = undefined;
}

Transformer.prototype.repeatFn = function (prop, elementName) {
   this.parentEementName = findElementName(this.object);
   if (this.parentEementName) {
      repeatFnParent(this.object, prop, elementName, this.parentEementName);
   } else {
      throw new Error('no parent', prop);
   }
}

Transformer.prototype.repeat = function (prop, elementName) {
   console.warn('repeat', prop);
   if (typeof this.object[prop] === 'function') {
      this.repeatFn(this.object, prop, elementName);
   } else if (Object.prototype.toString.call(this.object[prop]) === '[object Array]') {
      this.object.elementName = elementName;
      this.object.repeat = this.object[prop];
      this.object[prop] = undefined;
   } else {
      this.object[prop] = undefined;
   }
}

function Transformer(object) {
   this.object = object;
   this.attrs = {};
}

Transformer.prototype.transformContent = function (content) {
   if (Object.prototype.toString.call(content) === '[object Array]') {
      content.forEach(function (item) {
         exports.transform(item);
      });
   } else if (typeof content === 'string') {
   } else if (typeof content === 'object') {
      exports.transform(content);
   } else {
   }
}

Transformer.prototype.transformMetaContent = function (prop, meta) {
   if (typeof this.object.content === 'string') {
      if (prop === 'link' && this.object.content.indexOf(".css")) {
         this.attrs = meta.defaultAttrs;
      }
      if (meta.contentAttr) {
         this.attrs[meta.contentAttr] = this.object.content;
         this.object.content = undefined;
      }
   }
};

Transformer.prototype.transformMeta = function (prop, meta) {
   this.object.elementName = prop;
   this.object.content = this.object[prop];
   this.object[prop] = undefined;
   if (this.object.content) {
      this.transformMetaContent(prop, meta);
      this.transformContent(this.object.content);
   }
}

Transformer.prototype.transform = function () {
   if (!this.object || this.object.show === false) {
      return;
   }
   var repeatItem = findRepeatItem(this.object);
   if (repeatItem) {
      this.repeat(repeatItem.prop, repeatItem.elementName);
   }
   for (prop in this.object) {
      if (this.object[prop] === undefined) {
      } else if (this.object[prop] === null) {
         this.attrs[prop] = null;
      } else if (prop === 'content') {
         exports.transform(this.object[prop]);
      } else if (prop === 'elementName') {
      } else if (prop === 'repeat') {
      } else if (this.parentElementName && prop === this.parentElementName) {
      } else if (repeatItem && prop === repeatItem.prop) {
      } else if (prop === 'meta') {
         this.object.elementName = prop;
         this.attrs.content = this.object[prop];
      } else {
         var meta = exports.meta[prop];
         if (meta) {
            this.transformMeta(prop, meta);
         } else {
            this.attrs[prop] = this.object[prop];
            this.object[prop] = undefined;
         }
      }
   }
   if (Object.keys(this.attrs).length) {
      this.object.attrs = this.attrs;
   }
}

exports.transform = function (object) {   
   if (!object || object.show === false) {
   } else if (isArray(object)) {
      object.forEach(function (item) {
         new Transformer(item).transform();
      });
   } else {
      new Transformer(object).transform();
   }
};

function renderItem(object, content) {
   if (!object || object.show === false) {
      return "";
   }
   var contentString = "";
   if (content) {
      if (Object.prototype.toString.call(content) === '[object Array]') {
         contentString += '\n';
         content.forEach(function (item) {
            if (item) {
               contentString += render(item);
            } else {
               console.warn('item undefined', object);
            }
         });
      } else if (typeof content === 'string') {
         contentString = content;
      } else if (typeof content === 'object') {
         contentString = '\n' + render(content);
      } else {
         contentString = content.toString();
      }
   }
   var meta = exports.meta[object.elementName];
   var open = '<' + object.elementName;
   var close = '</' + object.elementName + '>';
   if (object.attrs) {
      for (var prop in object.attrs) {
         if (prop === 'is') {
            open += ' ' + object.attrs[prop];
         } else if (object.attrs[prop] === null) {
            open += ' ' + prop;
         } else {
            var propString = prop;
            var value = object.attrs[prop];
            if (prop === '$') {
               propString = 'class';
            } else if (prop === 'onclick') {
               value = object.attrs[prop].name + '()';
            }
            open += ' ' + propString + '=' + '"' + value + '"';
         }
      }
   }
   if (object.container) {
      if (contentString) {
         return contentString + '\n';
      }
   } else if (contentString) {
      return open + '>' + contentString + close + '\n';
   } else if (object.elementName === 'script') {
      return open + '>' + close + '\n';
   } else {
      return open + '/>\n';
   }
}

function renderEach(object, array) {
   var contentString = "";
   array.forEach(function (item) {
      contentString += renderItem(object, item);
   });
   return contentString;
}

function renderArray(array) {
   var contentString = "";
   array.forEach(function (item) {
      contentString += renderItem(item, item.content);
   });
   return contentString;
}

function render(object) {
   if (!object || object.show === false) {
      return "";
   } else if (isArray(object)) {
      return renderArray(object);
   } else if (object.repeat) {
      return renderEach(object, object.repeat);
   } else {
      return renderItem(object, object.content);
   }
}

exports.render = function (object, debug) {
   exports.transform(object);
   if (debug) {
      console.log('object', JSON.stringify(object, null, 2));
   }
   return render(object);
};

exports.init = function () {
   Array.prototype.each = function (object) {
      return each(this, object);
   }
};
