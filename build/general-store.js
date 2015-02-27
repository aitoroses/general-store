!function(e) {
  if ("object" == typeof exports && "undefined" != typeof module) module.exports = e(); else if ("function" == typeof define && define.amd) define([], e); else {
    var f;
    "undefined" != typeof window ? f = window : "undefined" != typeof global ? f = global : "undefined" != typeof self && (f = self), 
    f.GeneralStore = e();
  }
}(function() {
  var define, module, exports;
  return function e(t, n, r) {
    function s(o, u) {
      if (!n[o]) {
        if (!t[o]) {
          var a = typeof require == "function" && require;
          if (!u && a) return a(o, !0);
          if (i) return i(o, !0);
          var f = new Error("Cannot find module '" + o + "'");
          throw f.code = "MODULE_NOT_FOUND", f;
        }
        var l = n[o] = {
          exports: {}
        };
        t[o][0].call(l.exports, function(e) {
          var n = t[o][1][e];
          return s(n ? n : e);
        }, l, l.exports, e, t, n, r);
      }
      return n[o].exports;
    }
    var i = typeof require == "function" && require;
    for (var o = 0; o < r.length; o++) s(r[o]);
    return s;
  }({
    1: [ function(_dereq_, module, exports) {
      /* @flow */
      var StoreDefinition = _dereq_("./store/StoreDefinition.js");
      var GeneralStore = {
        define: function() {
          return new StoreDefinition();
        },
        DispatcherInstance: _dereq_("./dispatcher/DispatcherInstance.js"),
        StoreDependencyMixin: _dereq_("./mixin/StoreDependencyMixin.js")
      };
      module.exports = GeneralStore;
    }, {
      "./dispatcher/DispatcherInstance.js": 2,
      "./mixin/StoreDependencyMixin.js": 7,
      "./store/StoreDefinition.js": 10
    } ],
    2: [ function(_dereq_, module, exports) {
      /**
 * I'm not sure if it's possible to express the runtime enforcement
 * of a dispatcher instance, so I'll use weak mode for now.
 * @flow weak
 **/
      var DispatcherInterface = _dereq_("./DispatcherInterface.js");
      var invariant = _dereq_("../invariant.js");
      var instance = null;
      var DispatcherInstance = {
        get: function() {
          invariant(instance !== null, "DispatcherInstance.get: you haven't provide a dispatcher instance." + " You can pass an instance to" + " GeneralStore.define().register(dispatcher) or use" + " GeneralStore.DispatcherInstance.set(dispatcher) to set a global" + " instance." + " https://github.com/HubSpot/general-store#default-dispatcher-instance");
          return instance;
        },
        set: function(dispatcher) {
          invariant(DispatcherInterface.isDispatcher(dispatcher), "DispatcherInstance.set: Expected dispatcher to be an object" + ' with a register method, and an unregister method but got "%s".' + " Learn more about the dispatcher interface:" + " https://github.com/HubSpot/general-store#dispatcher-interface", dispatcher);
          instance = dispatcher;
        }
      };
      module.exports = DispatcherInstance;
    }, {
      "../invariant.js": 6,
      "./DispatcherInterface.js": 3
    } ],
    3: [ function(_dereq_, module, exports) {
      /**
 * @flow
 */
      var DispatcherInterface = {
        isDispatcher: function(dispatcher) {
          return typeof dispatcher === "object" && typeof dispatcher.register === "function" && typeof dispatcher.unregister === "function";
        },
        isPayload: function(payload) {
          return payload !== null && typeof payload === "object" && typeof payload.actionType === "string";
        }
      };
      module.exports = DispatcherInterface;
    }, {} ],
    4: [ function(_dereq_, module, exports) {
      /**
 * @flow
 */
      var EventHandler = _dereq_("./EventHandler.js");
      var uniqueID = _dereq_("../uniqueid/uniqueID.js");
      function Event() {
        "use strict";
        this.$Event_handlers = {};
      }
      /**
   * Add a subscription to this event
   *
   * @param  callback  run when the event is triggered.
   * @return this
   */
      Event.prototype.addHandler = function(callback) {
        "use strict";
        var key = uniqueID();
        this.$Event_handlers[key] = callback;
        return new EventHandler(this, key);
      };
      /**
   * Destroys this event. Removes all handlers.
   *
   * @return this
   */
      Event.prototype.remove = function() {
        "use strict";
        this.$Event_handlers = {};
        return this;
      };
      /**
   * Removes a subscription by key.
   *
   * @param  key   id of the subscription to remove
   * @return this
   */
      Event.prototype.removeHandler = function(key) {
        "use strict";
        delete this.$Event_handlers[key];
        return this;
      };
      /**
   * @protected
   * Run a handler by key if it exists
   *
   * @param  key  id of the handler to run
   */
      Event.prototype.$Event_runHandler = function(key) {
        "use strict";
        if (this.$Event_handlers.hasOwnProperty(key)) {
          this.$Event_handlers[key].call();
        }
      };
      /**
   * Run all subscribed handlers.
   *
   * @return this
   */
      Event.prototype.runHandlers = function() {
        "use strict";
        Object.keys(this.$Event_handlers).forEach(this.$Event_runHandler.bind(this));
        return this;
      };
      /**
 * Convenience method for running multiple events.
 *
 * @param  events  a list of events to run.
 */
      Event.runMultiple = function(events) {
        events.forEach(function(evt) {
          return evt.runHandlers();
        });
      };
      module.exports = Event;
    }, {
      "../uniqueid/uniqueID.js": 12,
      "./EventHandler.js": 5
    } ],
    5: [ function(_dereq_, module, exports) {
      /**
 * @flow
 */
      function EventHandler(instance, key) {
        "use strict";
        this.$EventHandler_key = key;
        this.$EventHandler_instance = instance;
      }
      EventHandler.prototype.remove = function() {
        "use strict";
        if (this.$EventHandler_instance === null || this.$EventHandler_instance === undefined) {
          return;
        }
        this.$EventHandler_instance.removeHandler(this.$EventHandler_key);
        this.$EventHandler_instance = null;
      };
      module.exports = EventHandler;
    }, {} ],
    6: [ function(_dereq_, module, exports) {
      /**
 * BSD License
 *
 * For Flux software
 *
 * Copyright (c) 2014, Facebook, Inc. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 *  * Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 *
 *  * Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *
 *  * Neither the name Facebook nor the names of its contributors may be used to
 *    endorse or promote products derived from this software without specific
 *    prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
 * ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * @flow
 */
      "use strict";
      /**
 * Use invariant() to assert state which your program assumes to be true.
 *
 * Provide sprintf-style format (only %s is supported) and arguments
 * to provide information about what broke and what you were
 * expecting.
 *
 * The invariant message will be stripped in production, but the invariant
 * will remain to ensure logic does not differ in production.
 */
      var invariant = function(condition, format, a, b, c, d, e, f) {
        if ("development" !== "production") {
          if (format === undefined) {
            throw new Error("invariant requires an error message argument");
          }
        }
        if (!condition) {
          var error;
          if ("development" !== "production") {
            var args = [ a, b, c, d, e, f ];
            var argIndex = 0;
            error = new Error("Invariant Violation: " + format.replace(/%s/g, function() {
              return args[argIndex++];
            }));
          } else {
            error = new Error("Minified exception occurred; use the non-minified dev environment " + "for the full error message and additional helpful warnings.");
          }
          throw error;
        }
      };
      module.exports = invariant;
    }, {} ],
    7: [ function(_dereq_, module, exports) {
      /**
 * @flow
 */
      var StoreFacade = _dereq_("../store/StoreFacade.js");
      var invariant = _dereq_("../invariant.js");
      var $__0 = _dereq_("./StoreDependencyMixinFields.js"), fields = $__0.fields, handlers = $__0.handlers, queue = $__0.queue, stores = $__0.stores;
      function defaultDeref(_, _, stores) {
        return stores[0].get();
      }
      function havePropsChanged(oldProps, nextProps) {
        return Object.keys(nextProps).some(function(key) {
          return oldProps[key] !== nextProps[key];
        });
      }
      function hasStateChanged(stores, oldState, nextState) {
        return Object.keys(nextState).some(function(key) {
          return !stores.hasOwnProperty(key) && oldState[key] !== nextState[key];
        });
      }
      function mergeState(state, updates) {
        var merged = {};
        for (var stateKey in state) {
          merged[stateKey] = state[stateKey];
        }
        for (var updatesKey in updates) {
          merged[updatesKey] = updates[updatesKey];
        }
        return merged;
      }
      function applyDependencies(component, dependencyMap) {
        var componentFields = fields(component);
        var componentHandlers = handlers(component);
        var componentStores = stores(component);
        var newComponentStores = [];
        Object.keys(dependencyMap).forEach(function(field) {
          var dependency = dependencyMap[field];
          var dependencyStores;
          if (dependency instanceof StoreFacade) {
            dependencyStores = [ dependency ];
            invariant(!componentFields.hasOwnProperty(field), 'StoreDependencyMixin: field "%s" is already defined', field);
            componentFields[field] = {
              deref: defaultDeref,
              stores: dependencyStores
            };
          } else {
            dependencyStores = dependency.stores;
            componentFields[field] = dependency;
          }
          // update the store-to-field map
          dependencyStores.forEach(function(store) {
            var storeId = store.getID();
            if (!componentStores.hasOwnProperty(storeId)) {
              componentStores[storeId] = [];
              // if we haven't seen this store bind a change handler
              componentHandlers.push(store.addOnChange(handleStoreChange.bind(null, component, storeId)));
            }
            componentStores[storeId].push(field);
          });
        });
      }
      function cleanupDependencies(component) {
        var componentHandlers = handlers(component);
        while (componentHandlers.length) {
          componentHandlers.pop().remove();
        }
      }
      function getDependencyState(component) {
        var componentFields = fields(component);
        var state = {};
        Object.keys(componentFields).forEach(function(field) {
          var $__0 = componentFields[field], deref = $__0.deref, stores = $__0.stores;
          state[field] = deref(component.props, component.state, stores);
        });
        return state;
      }
      function handleStoreChange(component, storeId) {
        var componentQueue = queue(component);
        var queueWasEmpty = Object.keys(componentQueue).length === 0;
        stores(component)[storeId].forEach(function(field) {
          if (componentQueue.hasOwnProperty(field)) {
            return;
          }
          componentQueue[field] = true;
          waitForFieldStores(component, field);
        });
        if (!queueWasEmpty) {
          return;
        }
        var componentFields = fields(component);
        var stateUpdate = {};
        Object.keys(componentQueue).forEach(function(field) {
          var $__0 = componentFields[field], deref = $__0.deref, stores = $__0.stores;
          stateUpdate[field] = deref(component.props, component.state, stores);
          delete componentQueue[field];
        });
        component.setState(stateUpdate);
      }
      function waitForFieldStores(component, field) {
        var dependency = fields(component)[field];
        dependency.stores.forEach(function(store) {
          return store.getDispatcher().waitFor([ store.getDispatchToken() ]);
        });
      }
      function StoreDependencyMixin(dependencyMap) {
        return {
          componentWillMount: function() {
            applyDependencies(this, dependencyMap);
          },
          componentWillReceiveProps: function(nextProps) {
            if (!havePropsChanged(this.props, nextProps)) {
              return;
            }
            this.setState(getDependencyState(this));
          },
          componentWillUnmount: function() {
            cleanupDependencies(this);
          },
          componentWillUpdate: function(nextProps, nextState) {
            if (!hasStateChanged(fields(this), this.state, nextState)) {
              return;
            }
            this.setState(mergeState(nextState, getDependencyState(this)));
          },
          getInitialState: function() {
            return getDependencyState(this);
          }
        };
      }
      module.exports = StoreDependencyMixin;
    }, {
      "../invariant.js": 6,
      "../store/StoreFacade.js": 11,
      "./StoreDependencyMixinFields.js": 8
    } ],
    8: [ function(_dereq_, module, exports) {
      /**
 * @flow
 */
      var EventHandler = _dereq_("../event/EventHandler.js");
      var FIELDS_KEY = "__StoreDependencyMixin-Fields";
      var HANDLERS_KEY = "__StoreDependencyMixin-EventHandlers";
      var QUEUE_KEY = "__StoreDependencyMixin-queue";
      var STORES_KEY = "__StoreDependencyMixin-stores";
      function getKey(key, identity, component) {
        if (component.hasOwnProperty(key)) {
          component[key] = identity;
        }
        return component[key];
      }
      var StoreDependencyMixinFields = {
        fields: function(component) {
          return getKey(FIELDS_KEY, {}, component);
        },
        handlers: function(component) {
          return getKey(HANDLERS_KEY, [], component);
        },
        queue: function(component) {
          return getKey(QUEUE_KEY, {}, component);
        },
        stores: function(component) {
          return getKey(STORES_KEY, {}, component);
        }
      };
      module.exports = StoreDependencyMixinFields;
    }, {
      "../event/EventHandler.js": 5
    } ],
    9: [ function(_dereq_, module, exports) {
      /* @flow */
      var StoreConstants = {
        DEFAULT_GETTER_KEY: "DEFAULT_GETTER_KEY"
      };
      module.exports = StoreConstants;
    }, {} ],
    10: [ function(_dereq_, module, exports) {
      /* @flow */
      var DispatcherInstance = _dereq_("../dispatcher/DispatcherInstance.js");
      var DispatcherInterface = _dereq_("../dispatcher/DispatcherInterface.js");
      var StoreConstants = _dereq_("./StoreConstants.js");
      var StoreFacade = _dereq_("./StoreFacade.js");
      var invariant = _dereq_("../invariant.js");
      function emptyGetter() {
        return null;
      }
      var HINT_LINK = "Learn more about defining stores:" + " https://github.com/HubSpot/general-store#create-a-store";
      function StoreDefinition() {
        "use strict";
        this.$StoreDefinition_facade = null;
        this.$StoreDefinition_getter = null;
        this.$StoreDefinition_responses = {};
      }
      StoreDefinition.prototype.defineGet = function(getter) {
        "use strict";
        invariant(!this.isRegistered(), "StoreDefinition.defineGet: this store definition cannot be modified" + " because is has already been registered with a dispatcher. %s", HINT_LINK);
        invariant(typeof getter === "function", "StoreDefinition.defineGet: expected getter to be a function but got" + ' "%s" instead. %s', getter, HINT_LINK);
        this.$StoreDefinition_getter = getter;
        return this;
      };
      StoreDefinition.prototype.defineResponseTo = function(actionTypes, response) {
        "use strict";
        invariant(!this.isRegistered(), "StoreDefinition.defineResponseTo: this store definition cannot be" + " modified because is has already been registered with a dispatcher. %s", HINT_LINK);
        [].concat(actionTypes).forEach(function(actionType) {
          return this.$StoreDefinition_setResponse(actionType, response);
        }.bind(this));
        return this;
      };
      StoreDefinition.prototype.isRegistered = function() {
        "use strict";
        return this.$StoreDefinition_facade instanceof StoreFacade;
      };
      StoreDefinition.prototype.register = function(dispatcher) {
        "use strict";
        invariant(!dispatcher || DispatcherInterface.isDispatcher(dispatcher), "StoreDefinition.register: Expected dispatcher to be an object" + ' with a register method, and an unregister method but got "%s".' + " Learn more about the dispatcher interface:" + " https://github.com/HubSpot/general-store#dispatcher-interface", dispatcher);
        invariant(typeof this.$StoreDefinition_getter === "function", "StoreDefinition.register: a store cannot be registered without a" + " getter. Use GeneralStore.define().defineGet(getter) to define a" + " getter. %s", HINT_LINK);
        var facade = this.$StoreDefinition_facade || new StoreFacade(this.$StoreDefinition_getter || emptyGetter, this.$StoreDefinition_responses, dispatcher || DispatcherInstance.get());
        if (this.$StoreDefinition_facade === null) {
          this.$StoreDefinition_facade = facade;
        }
        return facade;
      };
      StoreDefinition.prototype.$StoreDefinition_setResponse = function(actionType, response) {
        "use strict";
        invariant(typeof actionType === "string", "StoreDefinition.defineResponseTo: expected actionType to be a string" + ' but got "%s" instead. %s', actionType, HINT_LINK);
        invariant(!this.$StoreDefinition_responses.hasOwnProperty(actionType), "StoreDefinition.defineResponseTo: conflicting resposes for actionType" + ' "%s". Only one response can be defined per actionType per Store. %s', actionType, HINT_LINK);
        invariant(typeof response === "function", "StoreDefinition.defineResponseTo: expected response to be a function" + ' but got "%s" instead. %s', response);
        this.$StoreDefinition_responses[actionType] = response;
      };
      module.exports = StoreDefinition;
    }, {
      "../dispatcher/DispatcherInstance.js": 2,
      "../dispatcher/DispatcherInterface.js": 3,
      "../invariant.js": 6,
      "./StoreConstants.js": 9,
      "./StoreFacade.js": 11
    } ],
    11: [ function(_dereq_, module, exports) {
      /* @flow */
      var DispatcherInterface = _dereq_("../dispatcher/DispatcherInterface.js");
      var Event = _dereq_("../event/Event.js");
      var EventHandler = _dereq_("../event/EventHandler.js");
      var StoreConstants = _dereq_("./StoreConstants.js");
      var uniqueID = _dereq_("../uniqueid/uniqueID.js");
      var invariant = _dereq_("../invariant.js");
      var HINT_LINK = "Learn more about using the Store API:" + " https://github.com/HubSpot/general-store#using-the-store-api";
      function getNull() {
        return null;
      }
      function StoreFacade(getter, responses, dispatcher) {
        "use strict";
        this.$StoreFacade_dispatcher = dispatcher;
        this.$StoreFacade_getter = getter;
        this.$StoreFacade_responses = responses;
        this.$StoreFacade_event = new Event();
        this.$StoreFacade_uid = uniqueID();
        this.$StoreFacade_dispatchToken = this.$StoreFacade_dispatcher.register(this.$StoreFacade_handleDispatch.bind(this));
      }
      /**
   * Subscribe to changes on this store.
   *
   * @param  callback  will run every time the store responds to a dispatcher
   * @return this
   */
      StoreFacade.prototype.addOnChange = function(callback) {
        "use strict";
        invariant(typeof callback === "function", "StoreFacade.addOnChange: expected callback to be a function" + ' but got "%s" instead. %s', callback, HINT_LINK);
        return this.$StoreFacade_event.addHandler(callback);
      };
      /**
   * Returns the store's referenced value
   *
   * @param  ...  accepts any number of params
   * @return any
   */
      StoreFacade.prototype.get = function() {
        "use strict";
        for (var args = [], $__0 = 0, $__1 = arguments.length; $__0 < $__1; $__0++) args.push(arguments[$__0]);
        return this.$StoreFacade_getter.apply(null, args);
      };
      /**
   * Exposes the store's dispatcher instance.
   *
   * @return Dispatcher
   */
      StoreFacade.prototype.getDispatcher = function() {
        "use strict";
        return this.$StoreFacade_dispatcher;
      };
      /**
   * Exposes the token assigned to the store by the dispatcher
   *
   * @return number
   */
      StoreFacade.prototype.getDispatchToken = function() {
        "use strict";
        return this.$StoreFacade_dispatchToken;
      };
      StoreFacade.prototype.getID = function() {
        "use strict";
        return this.$StoreFacade_uid;
      };
      /**
   * @protected
   * Responds to incoming messages from the Dispatcher
   */
      StoreFacade.prototype.$StoreFacade_handleDispatch = function(payload) {
        "use strict";
        if ("development" !== "production") {
          invariant(DispatcherInterface.isPayload(payload), "StoreFacade: expected dispatched payload to be an object with a property" + ' "actionType" containing a string and an optional property "data" containing' + ' any value but got "%s" instead. Learn more about the dispatcher interface:' + " https://github.com/HubSpot/general-store#dispatcher-interface");
        }
        if (!this.$StoreFacade_responses.hasOwnProperty(payload.actionType)) {
          return;
        }
        this.$StoreFacade_responses[payload.actionType](payload.data, payload.actionType, payload);
        this.triggerChange();
      };
      /**
   * Destroys this instance of the store.
   * Dispatch callback is unregistered. Subscriptions are removed.
   */
      StoreFacade.prototype.remove = function() {
        "use strict";
        this.$StoreFacade_dispatcher.unregister(this.getDispatchToken());
        this.$StoreFacade_event.remove();
        this.$StoreFacade_getter = getNull;
        this.$StoreFacade_responses = {};
      };
      /**
   * Runs all of the store's subscription callbacks
   *
   * @return this
   */
      StoreFacade.prototype.triggerChange = function() {
        "use strict";
        this.$StoreFacade_event.runHandlers();
        return this;
      };
      module.exports = StoreFacade;
    }, {
      "../dispatcher/DispatcherInterface.js": 3,
      "../event/Event.js": 4,
      "../event/EventHandler.js": 5,
      "../invariant.js": 6,
      "../uniqueid/uniqueID.js": 12,
      "./StoreConstants.js": 9
    } ],
    12: [ function(_dereq_, module, exports) {
      /**
 * @flow
 */
      var nextUid = 0;
      function uid() {
        return nextUid++;
      }
      module.exports = uid;
    }, {} ]
  }, {}, [ 1 ])(1);
});