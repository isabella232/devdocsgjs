/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const Cls = (app.View = class View {
  static initClass() {
    $.extend(this.prototype, Events);
  }

  constructor() {
    this.setupElement();
    if (this.el.className) { this.originalClassName = this.el.className; }
    if (this.constructor.className) { this.resetClass(); }
    this.refreshElements();
    if (typeof this.init === 'function') {
      this.init();
    }
    this.refreshElements();
  }

  setupElement() {
    if (this.el == null) { this.el = typeof this.constructor.el === 'string' ?
      $(this.constructor.el)
    : this.constructor.el ?
      this.constructor.el
    :
      document.createElement(this.constructor.tagName || 'div'); }

    if (this.constructor.attributes) {
      for (let key in this.constructor.attributes) {
        const value = this.constructor.attributes[key];
        this.el.setAttribute(key, value);
      }
    }
  }

  refreshElements() {
    if (this.constructor.elements) {
      for (let name in this.constructor.elements) { const selector = this.constructor.elements[name]; this[name] = this.find(selector); }
    }
  }

  addClass(name) {
    this.el.classList.add(name);
  }

  removeClass(name) {
    this.el.classList.remove(name);
  }

  toggleClass(name) {
    this.el.classList.toggle(name);
  }

  hasClass(name) {
    return this.el.classList.contains(name);
  }

  resetClass() {
    this.el.className = this.originalClassName || '';
    if (this.constructor.className) {
      for (let name of Array.from(this.constructor.className.split(' '))) { this.addClass(name); }
    }
  }

  find(selector) {
    return $(selector, this.el);
  }

  findAll(selector) {
    return $$(selector, this.el);
  }

  findByClass(name) {
    return this.findAllByClass(name)[0];
  }

  findLastByClass(name) {
    const all = this.findAllByClass(name)[0];
    return all[all.length - 1];
  }

  findAllByClass(name) {
    return this.el.getElementsByClassName(name);
  }

  findByTag(tag) {
    return this.findAllByTag(tag)[0];
  }

  findLastByTag(tag) {
    const all = this.findAllByTag(tag);
    return all[all.length - 1];
  }

  findAllByTag(tag) {
    return this.el.getElementsByTagName(tag);
  }

  append(value) {
    $.append(this.el, value.el || value);
  }

  appendTo(value) {
    $.append(value.el || value, this.el);
  }

  prepend(value) {
    $.prepend(this.el, value.el || value);
  }

  prependTo(value) {
    $.prepend(value.el || value, this.el);
  }

  before(value) {
    $.before(this.el, value.el || value);
  }

  after(value) {
    $.after(this.el, value.el || value);
  }

  remove(value) {
    $.remove(value.el || value);
  }

  empty() {
    $.empty(this.el);
    this.refreshElements();
  }

  html(value) {
    this.empty();
    this.append(value);
  }

  tmpl(...args) {
    return app.templates.render(...Array.from(args || []));
  }

  delay(fn, ...args) {
    const delay = typeof args[args.length - 1] === 'number' ? args.pop() : 0;
    return setTimeout(fn.bind(this, ...Array.from(args)), delay);
  }

  onDOM(event, callback) {
    $.on(this.el, event, callback);
  }

  offDOM(event, callback) {
    $.off(this.el, event, callback);
  }

  bindEvents() {
    let method, name;
    if (this.constructor.events) {
      for (name in this.constructor.events) { method = this.constructor.events[name]; this.onDOM(name, this[method]); }
    }

    if (this.constructor.routes) {
      for (name in this.constructor.routes) { method = this.constructor.routes[name]; app.router.on(name, this[method]); }
    }

    if (this.constructor.shortcuts) {
      for (name in this.constructor.shortcuts) { method = this.constructor.shortcuts[name]; app.shortcuts.on(name, this[method]); }
    }
  }

  unbindEvents() {
    let method, name;
    if (this.constructor.events) {
      for (name in this.constructor.events) { method = this.constructor.events[name]; this.offDOM(name, this[method]); }
    }

    if (this.constructor.routes) {
      for (name in this.constructor.routes) { method = this.constructor.routes[name]; app.router.off(name, this[method]); }
    }

    if (this.constructor.shortcuts) {
      for (name in this.constructor.shortcuts) { method = this.constructor.shortcuts[name]; app.shortcuts.off(name, this[method]); }
    }
  }

  addSubview(view) {
    return (this.subviews || (this.subviews = [])).push(view);
  }

  activate() {
    if (this.activated) { return; }
    this.bindEvents();
    if (this.subviews) { for (let view of Array.from(this.subviews)) { view.activate(); } }
    this.activated = true;
    return true;
  }

  deactivate() {
    if (!this.activated) { return; }
    this.unbindEvents();
    if (this.subviews) { for (let view of Array.from(this.subviews)) { view.deactivate(); } }
    this.activated = false;
    return true;
  }

  detach() {
    this.deactivate();
    $.remove(this.el);
  }
});
Cls.initClass();
