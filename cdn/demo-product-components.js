var Ip = Object.defineProperty;
var Ap = (e, t, n) => t in e ? Ip(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n;
var ee = (e, t, n) => Ap(e, typeof t != "symbol" ? t + "" : t, n);
const xp = "coveo-headless-internal-state", Ep = Symbol.for(xp);
/**
 * @license
 *
 * Copyright 2026 Coveo Solutions Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *       http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function kp(e, t) {
  const n = `
  The following properties are invalid:

    ${e.join(`
	`)}
  
  ${t}
  `;
  return new Tu(n);
}
var Tu = class extends Error {
  constructor(e) {
    super(e), this.name = "SchemaValidationError";
  }
}, St = class {
  constructor(e) {
    this.definition = e;
  }
  validate(e = {}, t = "") {
    const n = {
      ...this.default,
      ...e
    }, r = [];
    for (const i in this.definition) {
      const s = this.definition[i].validate(n[i]);
      s && r.push(`${i}: ${s}`);
    }
    if (r.length)
      throw kp(r, t);
    return n;
  }
  get default() {
    const e = {};
    for (const t in this.definition) {
      const n = this.definition[t].default;
      n !== void 0 && (e[t] = n);
    }
    return e;
  }
}, Ae = class {
  constructor(e = {}) {
    this.baseConfig = e;
  }
  validate(e) {
    return this.baseConfig.required && Z(e) ? "value is required." : null;
  }
  get default() {
    return this.baseConfig.default instanceof Function ? this.baseConfig.default() : this.baseConfig.default;
  }
  get required() {
    return this.baseConfig.required === !0;
  }
};
function on(e) {
  return e === void 0;
}
function Rp(e) {
  return e === null;
}
function Z(e) {
  return on(e) || Rp(e);
}
var re = class {
  constructor(e = {}) {
    ee(this, "value");
    this.value = new Ae(e);
  }
  validate(e) {
    const t = this.value.validate(e);
    return t || (Op(e) ? null : "value is not a boolean.");
  }
  get default() {
    return this.value.default;
  }
  get required() {
    return this.value.required;
  }
};
function Op(e) {
  return on(e) || _u(e);
}
function _u(e) {
  return typeof e == "boolean";
}
var W = class {
  constructor(e = {}) {
    ee(this, "value");
    this.config = e, this.value = new Ae(e);
  }
  validate(e) {
    const t = this.value.validate(e);
    return t || (qp(e) ? e < this.config.min ? `minimum value of ${this.config.min} not respected.` : e > this.config.max ? `maximum value of ${this.config.max} not respected.` : null : "value is not a number.");
  }
  get default() {
    return this.value.default;
  }
  get required() {
    return this.value.required;
  }
};
function qp(e) {
  return on(e) || Mu(e);
}
function Mu(e) {
  return typeof e == "number" && !Number.isNaN(e);
}
var Fp = /^\d{4}(-\d\d(-\d\d(T\d\d:\d\d(:\d\d)?(\.\d+)?(([+-]\d\d:\d\d)|Z)?)?)?)?$/i, L = class {
  constructor(e = {}) {
    ee(this, "value");
    ee(this, "config");
    this.config = {
      emptyAllowed: !0,
      url: !1,
      ...e
    }, this.value = new Ae(this.config);
  }
  validate(e) {
    const { emptyAllowed: t, url: n, regex: r, constrainTo: i, ISODate: s } = this.config, o = this.value.validate(e);
    if (o)
      return o;
    if (on(e))
      return null;
    if (!Pu(e))
      return "value is not a string.";
    if (!t && !e.length)
      return "value is an empty string.";
    if (n)
      try {
        new URL(e);
      } catch {
        return "value is not a valid URL.";
      }
    return r && !r.test(e) ? `value did not match provided regex ${r}` : i && !i.includes(e) ? `value should be one of: ${i.join(", ")}.` : s && !(Fp.test(e) && new Date(e).toString() !== "Invalid Date") ? "value is not a valid ISO8601 date string" : null;
  }
  get default() {
    return this.value.default;
  }
  get required() {
    return this.value.required;
  }
};
function Pu(e) {
  return Object.prototype.toString.call(e) === "[object String]";
}
var z = class {
  constructor(e = {}) {
    ee(this, "config");
    this.config = {
      options: { required: !1 },
      values: {},
      ...e
    };
  }
  validate(e) {
    if (on(e))
      return this.config.options.required ? "value is required and is currently undefined" : null;
    if (!Vu(e))
      return "value is not an object";
    for (const [n, r] of Object.entries(this.config.values))
      if (r.required && Z(e[n]))
        return `value does not contain ${n}`;
    let t = "";
    for (const [n, r] of Object.entries(this.config.values)) {
      const i = e[n], s = r.validate(i);
      s !== null && (t += ` ${s}`);
    }
    return t === "" ? null : t;
  }
  get default() {
  }
  get required() {
    return !!this.config.options.required;
  }
};
function Vu(e) {
  return e !== void 0 && typeof e == "object";
}
var ce = class {
  constructor(e = {}) {
    ee(this, "value");
    this.config = e, this.value = new Ae(this.config);
  }
  validate(e) {
    if (!Z(e) && !Array.isArray(e))
      return "value is not an array";
    const t = this.value.validate(e);
    if (t !== null)
      return t;
    if (Z(e))
      return null;
    if (this.config.max !== void 0 && e.length > this.config.max)
      return `value contains more than ${this.config.max}`;
    if (this.config.min !== void 0 && e.length < this.config.min)
      return `value contains less than ${this.config.min}`;
    if (this.config.each !== void 0) {
      let n = "";
      return e.forEach((r) => {
        this.config.each.required && Z(r) && (n = `value is null or undefined: ${e.join(",")}`);
        const i = this.validatePrimitiveValue(r, this.config.each);
        i !== null && (n += ` ${i}`);
      }), n === "" ? null : n;
    }
    return null;
  }
  validatePrimitiveValue(e, t) {
    return _u(e) || Pu(e) || Mu(e) || Vu(e) ? t.validate(e) : "value is not a primitive value";
  }
  get default() {
  }
  get required() {
    return this.value.required;
  }
};
function Uu(e) {
  return Array.isArray(e);
}
var Rn = class {
  constructor(e) {
    ee(this, "value");
    this.config = e, this.value = new Ae(e);
  }
  validate(e) {
    const t = this.value.validate(e);
    return t !== null ? t : on(e) || Object.values(this.config.enum).find(
      (r) => r === e
    ) ? null : "value is not in enum.";
  }
  get default() {
    return this.value.default;
  }
  get required() {
    return this.value.required;
  }
};
function Cs(e) {
  return `Minified Redux error #${e}; visit https://redux.js.org/Errors?code=${e} for the full message or use the non-minified dev environment for full errors. `;
}
var Pi = () => Math.random().toString(36).substring(7).split("").join("."), Dp = {
  INIT: `@@redux/INIT${/* @__PURE__ */ Pi()}`,
  REPLACE: `@@redux/REPLACE${/* @__PURE__ */ Pi()}`,
  PROBE_UNKNOWN_ACTION: () => `@@redux/PROBE_UNKNOWN_ACTION${Pi()}`
}, Cn = Dp;
function Ft(e) {
  if (typeof e != "object" || e === null)
    return !1;
  let t = e;
  for (; Object.getPrototypeOf(t) !== null; )
    t = Object.getPrototypeOf(t);
  return Object.getPrototypeOf(e) === t || Object.getPrototypeOf(e) === null;
}
function Tp(e) {
  if (e === void 0)
    return "undefined";
  if (e === null)
    return "null";
  const t = typeof e;
  switch (t) {
    case "boolean":
    case "string":
    case "number":
    case "symbol":
    case "function":
      return t;
  }
  if (Array.isArray(e))
    return "array";
  if (Pp(e))
    return "date";
  if (Mp(e))
    return "error";
  const n = _p(e);
  switch (n) {
    case "Symbol":
    case "Promise":
    case "WeakMap":
    case "WeakSet":
    case "Map":
    case "Set":
      return n;
  }
  return Object.prototype.toString.call(e).slice(8, -1).toLowerCase().replace(/\s/g, "");
}
function _p(e) {
  return typeof e.constructor == "function" ? e.constructor.name : null;
}
function Mp(e) {
  return e instanceof Error || typeof e.message == "string" && e.constructor && typeof e.constructor.stackTraceLimit == "number";
}
function Pp(e) {
  return e instanceof Date ? !0 : typeof e.toDateString == "function" && typeof e.getDate == "function" && typeof e.setDate == "function";
}
function Vp(e) {
  let t = typeof e;
  return process.env.NODE_ENV !== "production" && (t = Tp(e)), t;
}
function ta(e) {
  typeof console < "u" && typeof console.error == "function" && console.error(e);
  try {
    throw new Error(e);
  } catch {
  }
}
function Up(e, t, n, r) {
  const i = Object.keys(t), s = n && n.type === Cn.INIT ? "preloadedState argument passed to createStore" : "previous state received by the reducer";
  if (i.length === 0)
    return "Store does not have a valid reducer. Make sure the argument passed to combineReducers is an object whose values are reducers.";
  if (!Ft(e))
    return `The ${s} has unexpected type of "${Vp(e)}". Expected argument to be an object with the following keys: "${i.join('", "')}"`;
  const o = Object.keys(e).filter((a) => !t.hasOwnProperty(a) && !r[a]);
  if (o.forEach((a) => {
    r[a] = !0;
  }), !(n && n.type === Cn.REPLACE) && o.length > 0)
    return `Unexpected ${o.length > 1 ? "keys" : "key"} "${o.join('", "')}" found in ${s}. Expected to find one of the known reducer keys instead: "${i.join('", "')}". Unexpected keys will be ignored.`;
}
function $p(e) {
  Object.keys(e).forEach((t) => {
    const n = e[t];
    if (typeof n(void 0, {
      type: Cn.INIT
    }) > "u")
      throw new Error(process.env.NODE_ENV === "production" ? Cs(12) : `The slice reducer for key "${t}" returned undefined during initialization. If the state passed to the reducer is undefined, you must explicitly return the initial state. The initial state may not be undefined. If you don't want to set a value for this reducer, you can use null instead of undefined.`);
    if (typeof n(void 0, {
      type: Cn.PROBE_UNKNOWN_ACTION()
    }) > "u")
      throw new Error(process.env.NODE_ENV === "production" ? Cs(13) : `The slice reducer for key "${t}" returned undefined when probed with a random type. Don't try to handle '${Cn.INIT}' or other actions in "redux/*" namespace. They are considered private. Instead, you must return the current state for any unknown actions, unless it is undefined, in which case you must return the initial state, regardless of the action type. The initial state may not be undefined, but can be null.`);
  });
}
function Np(e) {
  const t = Object.keys(e), n = {};
  for (let o = 0; o < t.length; o++) {
    const a = t[o];
    process.env.NODE_ENV !== "production" && typeof e[a] > "u" && ta(`No reducer provided for key "${a}"`), typeof e[a] == "function" && (n[a] = e[a]);
  }
  const r = Object.keys(n);
  let i;
  process.env.NODE_ENV !== "production" && (i = {});
  let s;
  try {
    $p(n);
  } catch (o) {
    s = o;
  }
  return function(a = {}, c) {
    if (s)
      throw s;
    if (process.env.NODE_ENV !== "production") {
      const f = Up(a, n, c, i);
      f && ta(f);
    }
    let u = !1;
    const l = {};
    for (let f = 0; f < r.length; f++) {
      const h = r[f], m = n[h], p = a[h], d = m(p, c);
      if (typeof d > "u") {
        const g = c && c.type;
        throw new Error(process.env.NODE_ENV === "production" ? Cs(14) : `When called with an action of type ${g ? `"${String(g)}"` : "(unknown type)"}, the slice reducer for key "${h}" returned undefined. To ignore an action, you must explicitly return the previous state. If you want this reducer to hold no value, you can return null instead of undefined.`);
      }
      l[h] = d, u = u || d !== p;
    }
    return u = u || r.length !== Object.keys(a).length, u ? l : a;
  };
}
function $u(e) {
  return Ft(e) && "type" in e && typeof e.type == "string";
}
var Xs = Symbol.for("immer-nothing"), In = Symbol.for("immer-draftable"), ye = Symbol.for("immer-state"), Nu = process.env.NODE_ENV !== "production" ? [
  // All error codes, starting by 0:
  function(e) {
    return `The plugin for '${e}' has not been loaded into Immer. To enable the plugin, import and call \`enable${e}()\` when initializing your application.`;
  },
  function(e) {
    return `produce can only be called on things that are draftable: plain objects, arrays, Map, Set or classes that are marked with '[immerable]: true'. Got '${e}'`;
  },
  "This object has been frozen and should not be mutated",
  function(e) {
    return "Cannot use a proxy that has been revoked. Did you pass an object from inside an immer function to an async process? " + e;
  },
  "An immer producer returned a new value *and* modified its draft. Either return a new value *or* modify the draft.",
  "Immer forbids circular references",
  "The first or second argument to `produce` must be a function",
  "The third argument to `produce` must be a function or undefined",
  "First argument to `createDraft` must be a plain object, an array, or an immerable object",
  "First argument to `finishDraft` must be a draft returned by `createDraft`",
  function(e) {
    return `'current' expects a draft, got: ${e}`;
  },
  "Object.defineProperty() cannot be used on an Immer draft",
  "Object.setPrototypeOf() cannot be used on an Immer draft",
  "Immer only supports deleting array indices",
  "Immer only supports setting array indices and the 'length' property",
  function(e) {
    return `'original' expects a draft, got: ${e}`;
  }
  // Note: if more errors are added, the errorOffset in Patches.ts should be increased
  // See Patches.ts for additional errors
] : [];
function me(e, ...t) {
  if (process.env.NODE_ENV !== "production") {
    const n = Nu[e], r = dt(n) ? n.apply(null, t) : n;
    throw new Error(`[Immer] ${r}`);
  }
  throw new Error(
    `[Immer] minified error nr: ${e}. Full error at: https://bit.ly/3cXEKWf`
  );
}
var De = Object, Dt = De.getPrototypeOf, On = "constructor", Un = "prototype", Is = "configurable", Lr = "enumerable", Er = "writable", qn = "value", Te = (e) => !!e && !!e[ye];
function Oe(e) {
  var t;
  return e ? Lu(e) || Nn(e) || !!e[In] || !!((t = e[On]) != null && t[In]) || Ln(e) || jn(e) : !1;
}
var Lp = De[Un][On].toString(), na = /* @__PURE__ */ new WeakMap();
function Lu(e) {
  if (!e || !Jt(e))
    return !1;
  const t = Dt(e);
  if (t === null || t === De[Un])
    return !0;
  const n = De.hasOwnProperty.call(t, On) && t[On];
  if (n === Object)
    return !0;
  if (!dt(n))
    return !1;
  let r = na.get(n);
  return r === void 0 && (r = Function.toString.call(n), na.set(n, r)), r === Lp;
}
function jp(e) {
  return Te(e) || me(15, e), e[ye].base_;
}
function $n(e, t, n = !0) {
  Tt(e) === 0 ? (n ? Reflect.ownKeys(e) : De.keys(e)).forEach((i) => {
    t(i, e[i], e);
  }) : e.forEach((r, i) => t(i, r, e));
}
function Tt(e) {
  const t = e[ye];
  return t ? t.type_ : Nn(e) ? 1 : Ln(e) ? 2 : jn(e) ? 3 : 0;
}
var Yt = (e, t, n = Tt(e)) => n === 2 ? e.has(t) : De[Un].hasOwnProperty.call(e, t), Je = (e, t, n = Tt(e)) => (
  // @ts-ignore
  n === 2 ? e.get(t) : e[t]
), jr = (e, t, n, r = Tt(e)) => {
  r === 2 ? e.set(t, n) : r === 3 ? e.add(n) : e[t] = n;
};
function Qp(e, t) {
  return e === t ? e !== 0 || 1 / e === 1 / t : e !== e && t !== t;
}
var Nn = Array.isArray, Ln = (e) => e instanceof Map, jn = (e) => e instanceof Set, Jt = (e) => typeof e == "object", dt = (e) => typeof e == "function", Vi = (e) => typeof e == "boolean";
function zp(e) {
  const t = +e;
  return Number.isInteger(t) && String(t) === e;
}
var Bp = (e) => Jt(e) ? e == null ? void 0 : e[ye] : null, Ze = (e) => e.copy_ || e.base_, eo = (e) => e.modified_ ? e.copy_ : e.base_;
function As(e, t) {
  if (Ln(e))
    return new Map(e);
  if (jn(e))
    return new Set(e);
  if (Nn(e))
    return Array[Un].slice.call(e);
  const n = Lu(e);
  if (t === !0 || t === "class_only" && !n) {
    const r = De.getOwnPropertyDescriptors(e);
    delete r[ye];
    let i = Reflect.ownKeys(r);
    for (let s = 0; s < i.length; s++) {
      const o = i[s], a = r[o];
      a[Er] === !1 && (a[Er] = !0, a[Is] = !0), (a.get || a.set) && (r[o] = {
        [Is]: !0,
        [Er]: !0,
        // could live with !!desc.set as well here...
        [Lr]: a[Lr],
        [qn]: e[o]
      });
    }
    return De.create(Dt(e), r);
  } else {
    const r = Dt(e);
    if (r !== null && n)
      return { ...e };
    const i = De.create(r);
    return De.assign(i, e);
  }
}
function to(e, t = !1) {
  return ci(e) || Te(e) || !Oe(e) || (Tt(e) > 1 && De.defineProperties(e, {
    set: ir,
    add: ir,
    clear: ir,
    delete: ir
  }), De.freeze(e), t && $n(
    e,
    (n, r) => {
      to(r, !0);
    },
    !1
  )), e;
}
function Hp() {
  me(2);
}
var ir = {
  [qn]: Hp
};
function ci(e) {
  return e === null || !Jt(e) ? !0 : De.isFrozen(e);
}
var Qr = "MapSet", zr = "Patches", ra = "ArrayMethods", Br = {};
function _t(e) {
  const t = Br[e];
  return t || me(0, e), t;
}
var ia = (e) => !!Br[e];
function Yp(e, t) {
  Br[e] || (Br[e] = t);
}
var Fn, ju = () => Fn, Wp = (e, t) => ({
  drafts_: [],
  parent_: e,
  immer_: t,
  // Whenever the modified draft contains a draft from another scope, we
  // need to prevent auto-freezing so the unowned draft can be finalized.
  canAutoFreeze_: !0,
  unfinalizedDrafts_: 0,
  handledSet_: /* @__PURE__ */ new Set(),
  processedForPatches_: /* @__PURE__ */ new Set(),
  mapSetPlugin_: ia(Qr) ? _t(Qr) : void 0,
  arrayMethodsPlugin_: ia(ra) ? _t(ra) : void 0
});
function sa(e, t) {
  t && (e.patchPlugin_ = _t(zr), e.patches_ = [], e.inversePatches_ = [], e.patchListener_ = t);
}
function xs(e) {
  Es(e), e.drafts_.forEach(Kp), e.drafts_ = null;
}
function Es(e) {
  e === Fn && (Fn = e.parent_);
}
var oa = (e) => Fn = Wp(Fn, e);
function Kp(e) {
  const t = e[ye];
  t.type_ === 0 || t.type_ === 1 ? t.revoke_() : t.revoked_ = !0;
}
function aa(e, t) {
  t.unfinalizedDrafts_ = t.drafts_.length;
  const n = t.drafts_[0];
  if (e !== void 0 && e !== n) {
    n[ye].modified_ && (xs(t), me(4)), Oe(e) && (e = ca(t, e));
    const { patchPlugin_: i } = t;
    i && i.generateReplacementPatches_(
      n[ye].base_,
      e,
      t
    );
  } else
    e = ca(t, n);
  return Gp(t, e, !0), xs(t), t.patches_ && t.patchListener_(t.patches_, t.inversePatches_), e !== Xs ? e : void 0;
}
function ca(e, t) {
  if (ci(t))
    return t;
  const n = t[ye];
  if (!n)
    return Hr(t, e.handledSet_, e);
  if (!ui(n, e))
    return t;
  if (!n.modified_)
    return n.base_;
  if (!n.finalized_) {
    const { callbacks_: r } = n;
    if (r)
      for (; r.length > 0; )
        r.pop()(e);
    Bu(n, e);
  }
  return n.copy_;
}
function Gp(e, t, n = !1) {
  !e.parent_ && e.immer_.autoFreeze_ && e.canAutoFreeze_ && to(t, n);
}
function Qu(e) {
  e.finalized_ = !0, e.scope_.unfinalizedDrafts_--;
}
var ui = (e, t) => e.scope_ === t, Jp = [];
function zu(e, t, n, r) {
  const i = Ze(e), s = e.type_;
  if (r !== void 0 && Je(i, r, s) === t) {
    jr(i, r, n, s);
    return;
  }
  if (!e.draftLocations_) {
    const a = e.draftLocations_ = /* @__PURE__ */ new Map();
    $n(i, (c, u) => {
      if (Te(u)) {
        const l = a.get(u) || [];
        l.push(c), a.set(u, l);
      }
    });
  }
  const o = e.draftLocations_.get(t) ?? Jp;
  for (const a of o)
    jr(i, a, n, s);
}
function Zp(e, t, n) {
  e.callbacks_.push(function(i) {
    var a;
    const s = t;
    if (!s || !ui(s, i))
      return;
    (a = i.mapSetPlugin_) == null || a.fixSetContents(s);
    const o = eo(s);
    zu(e, s.draft_ ?? s, o, n), Bu(s, i);
  });
}
function Bu(e, t) {
  var r;
  if (e.modified_ && !e.finalized_ && (e.type_ === 3 || e.type_ === 1 && e.allIndicesReassigned_ || (((r = e.assigned_) == null ? void 0 : r.size) ?? 0) > 0)) {
    const { patchPlugin_: i } = t;
    if (i) {
      const s = i.getPath(e);
      s && i.generatePatches_(e, s, t);
    }
    Qu(e);
  }
}
function Xp(e, t, n) {
  const { scope_: r } = e;
  if (Te(n)) {
    const i = n[ye];
    ui(i, r) && i.callbacks_.push(function() {
      kr(e);
      const o = eo(i);
      zu(e, n, o, t);
    });
  } else Oe(n) && e.callbacks_.push(function() {
    const s = Ze(e);
    e.type_ === 3 ? s.has(n) && Hr(n, r.handledSet_, r) : Je(s, t, e.type_) === n && r.drafts_.length > 1 && (e.assigned_.get(t) ?? !1) === !0 && e.copy_ && Hr(
      Je(e.copy_, t, e.type_),
      r.handledSet_,
      r
    );
  });
}
function Hr(e, t, n) {
  return !n.immer_.autoFreeze_ && n.unfinalizedDrafts_ < 1 || Te(e) || t.has(e) || !Oe(e) || ci(e) || (t.add(e), $n(e, (r, i) => {
    if (Te(i)) {
      const s = i[ye];
      if (ui(s, n)) {
        const o = eo(s);
        jr(e, r, o, e.type_), Qu(s);
      }
    } else Oe(i) && Hr(i, t, n);
  })), e;
}
function eh(e, t) {
  const n = Nn(e), r = {
    type_: n ? 1 : 0,
    // Track which produce call this is associated with.
    scope_: t ? t.scope_ : ju(),
    // True for both shallow and deep changes.
    modified_: !1,
    // Used during finalization.
    finalized_: !1,
    // Track which properties have been assigned (true) or deleted (false).
    // actually instantiated in `prepareCopy()`
    assigned_: void 0,
    // The parent draft state.
    parent_: t,
    // The base state.
    base_: e,
    // The base proxy.
    draft_: null,
    // set below
    // The base copy with any updated values.
    copy_: null,
    // Called by the `produce` function.
    revoke_: null,
    isManual_: !1,
    // `callbacks` actually gets assigned in `createProxy`
    callbacks_: void 0
  };
  let i = r, s = Yr;
  n && (i = [r], s = Dn);
  const { revoke: o, proxy: a } = Proxy.revocable(i, s);
  return r.draft_ = a, r.revoke_ = o, [a, r];
}
var Yr = {
  get(e, t) {
    if (t === ye)
      return e;
    let n = e.scope_.arrayMethodsPlugin_;
    const r = e.type_ === 1 && typeof t == "string";
    if (r && n != null && n.isArrayOperationMethod(t))
      return n.createMethodInterceptor(e, t);
    const i = Ze(e);
    if (!Yt(i, t, e.type_))
      return nh(e, i, t);
    const s = i[t];
    if (e.finalized_ || !Oe(s) || r && e.operationMethod && (n != null && n.isMutatingArrayMethod(
      e.operationMethod
    )) && zp(t))
      return s;
    if (s === Ui(e.base_, t) || th(e, t, s)) {
      kr(e);
      const o = e.type_ === 1 ? +t : t, a = Rs(e.scope_, s, e, o);
      return e.copy_[o] = a;
    }
    return s;
  },
  has(e, t) {
    return t in Ze(e);
  },
  ownKeys(e) {
    return Reflect.ownKeys(Ze(e));
  },
  set(e, t, n) {
    const r = Hu(Ze(e), t);
    if (r != null && r.set)
      return r.set.call(e.draft_, n), !0;
    if (!e.modified_) {
      const i = Ui(Ze(e), t), s = i == null ? void 0 : i[ye];
      if (s && s.base_ === n)
        return e.copy_[t] = n, e.assigned_.set(t, !1), !0;
      if (Qp(n, i) && (n !== void 0 || Yt(e.base_, t, e.type_)))
        return !0;
      kr(e), ks(e);
    }
    return e.copy_[t] === n && // special case: handle new props with value 'undefined'
    (n !== void 0 || Yt(e.copy_, t, e.type_)) || // special case: NaN
    Number.isNaN(n) && Number.isNaN(e.copy_[t]) || (e.copy_[t] = n, e.assigned_.set(t, !0), Xp(e, t, n)), !0;
  },
  deleteProperty(e, t) {
    return kr(e), Ui(e.base_, t) !== void 0 || t in e.base_ ? (e.assigned_.set(t, !1), ks(e)) : e.assigned_.delete(t), e.copy_ && delete e.copy_[t], !0;
  },
  // Note: We never coerce `desc.value` into an Immer draft, because we can't make
  // the same guarantee in ES5 mode.
  getOwnPropertyDescriptor(e, t) {
    const n = Ze(e), r = Reflect.getOwnPropertyDescriptor(n, t);
    return r && {
      [Er]: !0,
      [Is]: e.type_ !== 1 || t !== "length",
      [Lr]: r[Lr],
      [qn]: n[t]
    };
  },
  defineProperty() {
    me(11);
  },
  getPrototypeOf(e) {
    return Dt(e.base_);
  },
  setPrototypeOf() {
    me(12);
  }
}, Dn = {};
for (let e in Yr) {
  let t = Yr[e];
  Dn[e] = function() {
    const n = arguments;
    return n[0] = n[0][0], t.apply(this, n);
  };
}
Dn.deleteProperty = function(e, t) {
  return process.env.NODE_ENV !== "production" && isNaN(parseInt(t)) && me(13), Dn.set.call(this, e, t, void 0);
};
Dn.set = function(e, t, n) {
  return process.env.NODE_ENV !== "production" && t !== "length" && isNaN(parseInt(t)) && me(14), Yr.set.call(this, e[0], t, n, e[0]);
};
function Ui(e, t) {
  const n = e[ye];
  return (n ? Ze(n) : e)[t];
}
function th(e, t, n) {
  var r;
  return e.type_ !== 1 || !e.allIndicesReassigned_ || (r = e.assigned_) != null && r.get(t) || !Oe(n) || n[ye] ? !1 : e.baseRefs_.has(n);
}
function nh(e, t, n) {
  var i;
  const r = Hu(t, n);
  return r ? qn in r ? r[qn] : (
    // This is a very special case, if the prop is a getter defined by the
    // prototype, we should invoke it with the draft as context!
    (i = r.get) == null ? void 0 : i.call(e.draft_)
  ) : void 0;
}
function Hu(e, t) {
  if (!(t in e))
    return;
  let n = Dt(e);
  for (; n; ) {
    const r = Object.getOwnPropertyDescriptor(n, t);
    if (r)
      return r;
    n = Dt(n);
  }
}
function ks(e) {
  e.modified_ || (e.modified_ = !0, e.parent_ && ks(e.parent_));
}
function kr(e) {
  e.copy_ || (e.assigned_ = /* @__PURE__ */ new Map(), e.copy_ = As(
    e.base_,
    e.scope_.immer_.useStrictShallowCopy_
  ));
}
var rh = class {
  constructor(e) {
    this.autoFreeze_ = !0, this.useStrictShallowCopy_ = !1, this.useStrictIteration_ = !1, this.produce = (t, n, r) => {
      if (dt(t) && !dt(n)) {
        const s = n;
        n = t;
        const o = this;
        return function(c = s, ...u) {
          return o.produce(c, (l) => n.call(this, l, ...u));
        };
      }
      dt(n) || me(6), r !== void 0 && !dt(r) && me(7);
      let i;
      if (Oe(t)) {
        const s = oa(this), o = Rs(s, t, void 0);
        let a = !0;
        try {
          i = n(o), a = !1;
        } finally {
          a ? xs(s) : Es(s);
        }
        return sa(s, r), aa(i, s);
      } else if (!t || !Jt(t)) {
        if (i = n(t), i === void 0 && (i = t), i === Xs && (i = void 0), this.autoFreeze_ && to(i, !0), r) {
          const s = [], o = [];
          _t(zr).generateReplacementPatches_(t, i, {
            patches_: s,
            inversePatches_: o
          }), r(s, o);
        }
        return i;
      } else
        me(1, t);
    }, this.produceWithPatches = (t, n) => {
      if (dt(t))
        return (o, ...a) => this.produceWithPatches(o, (c) => t(c, ...a));
      let r, i;
      return [this.produce(t, n, (o, a) => {
        r = o, i = a;
      }), r, i];
    }, Vi(e == null ? void 0 : e.autoFreeze) && this.setAutoFreeze(e.autoFreeze), Vi(e == null ? void 0 : e.useStrictShallowCopy) && this.setUseStrictShallowCopy(e.useStrictShallowCopy), Vi(e == null ? void 0 : e.useStrictIteration) && this.setUseStrictIteration(e.useStrictIteration);
  }
  createDraft(e) {
    Oe(e) || me(8), Te(e) && (e = Yu(e));
    const t = oa(this), n = Rs(t, e, void 0);
    return n[ye].isManual_ = !0, Es(t), n;
  }
  finishDraft(e, t) {
    const n = e && e[ye];
    (!n || !n.isManual_) && me(9);
    const { scope_: r } = n;
    return sa(r, t), aa(void 0, r);
  }
  /**
   * Pass true to automatically freeze all copies created by Immer.
   *
   * By default, auto-freezing is enabled.
   */
  setAutoFreeze(e) {
    this.autoFreeze_ = e;
  }
  /**
   * Pass true to enable strict shallow copy.
   *
   * By default, immer does not copy the object descriptors such as getter, setter and non-enumrable properties.
   */
  setUseStrictShallowCopy(e) {
    this.useStrictShallowCopy_ = e;
  }
  /**
   * Pass false to use faster iteration that skips non-enumerable properties
   * but still handles symbols for compatibility.
   *
   * By default, strict iteration is enabled (includes all own properties).
   */
  setUseStrictIteration(e) {
    this.useStrictIteration_ = e;
  }
  shouldUseStrictIteration() {
    return this.useStrictIteration_;
  }
  applyPatches(e, t) {
    let n;
    for (n = t.length - 1; n >= 0; n--) {
      const i = t[n];
      if (i.path.length === 0 && i.op === "replace") {
        e = i.value;
        break;
      }
    }
    n > -1 && (t = t.slice(n + 1));
    const r = _t(zr).applyPatches_;
    return Te(e) ? r(e, t) : this.produce(
      e,
      (i) => r(i, t)
    );
  }
};
function Rs(e, t, n, r) {
  const [i, s] = Ln(t) ? _t(Qr).proxyMap_(t, n) : jn(t) ? _t(Qr).proxySet_(t, n) : eh(t, n);
  return ((n == null ? void 0 : n.scope_) ?? ju()).drafts_.push(i), s.callbacks_ = (n == null ? void 0 : n.callbacks_) ?? [], s.key_ = r, n && r !== void 0 ? Zp(n, s, r) : s.callbacks_.push(function(c) {
    var l;
    (l = c.mapSetPlugin_) == null || l.fixSetContents(s);
    const { patchPlugin_: u } = c;
    s.modified_ && u && u.generatePatches_(s, [], c);
  }), i;
}
function Yu(e) {
  return Te(e) || me(10, e), Wu(e);
}
function Wu(e) {
  if (!Oe(e) || ci(e))
    return e;
  const t = e[ye];
  let n, r = !0;
  if (t) {
    if (!t.modified_)
      return t.base_;
    t.finalized_ = !0, n = As(e, t.scope_.immer_.useStrictShallowCopy_), r = t.scope_.immer_.shouldUseStrictIteration();
  } else
    n = As(e, !0);
  return $n(
    n,
    (i, s) => {
      jr(n, i, Wu(s));
    },
    r
  ), t && (t.finalized_ = !1), n;
}
function ih() {
  process.env.NODE_ENV !== "production" && Nu.push(
    'Sets cannot have "replace" patches.',
    function(p) {
      return "Unsupported patch operation: " + p;
    },
    function(p) {
      return "Cannot apply patch, path doesn't resolve: " + p;
    },
    "Patching reserved attributes like __proto__, prototype and constructor is not allowed"
  );
  function t(p, d = []) {
    if (p.key_ !== void 0) {
      const g = p.parent_.copy_ ?? p.parent_.base_, b = Bp(Je(g, p.key_)), R = Je(g, p.key_);
      if (R === void 0 || R !== p.draft_ && R !== p.base_ && R !== p.copy_ || b != null && b.base_ !== p.base_)
        return null;
      const w = p.parent_.type_ === 3;
      let C;
      if (w) {
        const v = p.parent_;
        C = Array.from(v.drafts_.keys()).indexOf(p.key_);
      } else
        C = p.key_;
      if (!(w && g.size > C || Yt(g, C)))
        return null;
      d.push(C);
    }
    if (p.parent_)
      return t(p.parent_, d);
    d.reverse();
    try {
      n(p.copy_, d);
    } catch {
      return null;
    }
    return d;
  }
  function n(p, d) {
    let g = p;
    for (let b = 0; b < d.length - 1; b++) {
      const R = d[b];
      if (g = Je(g, R), !Jt(g) || g === null)
        throw new Error(`Cannot resolve path at '${d.join("/")}'`);
    }
    return g;
  }
  const r = "replace", i = "add", s = "remove";
  function o(p, d, g) {
    if (p.scope_.processedForPatches_.has(p))
      return;
    p.scope_.processedForPatches_.add(p);
    const { patches_: b, inversePatches_: R } = g;
    switch (p.type_) {
      case 0:
      case 2:
        return c(
          p,
          d,
          b,
          R
        );
      case 1:
        return a(
          p,
          d,
          b,
          R
        );
      case 3:
        return u(
          p,
          d,
          b,
          R
        );
    }
  }
  function a(p, d, g, b) {
    let { base_: R, assigned_: w } = p, C = p.copy_;
    C.length < R.length && ([R, C] = [C, R], [g, b] = [b, g]);
    const v = p.allIndicesReassigned_ === !0;
    for (let x = 0; x < R.length; x++) {
      const M = C[x], _ = R[x];
      if ((v || (w == null ? void 0 : w.get(x.toString()))) && M !== _) {
        const E = M == null ? void 0 : M[ye];
        if (E && E.modified_)
          continue;
        const I = d.concat([x]);
        g.push({
          op: r,
          path: I,
          // Need to maybe clone it, as it can in fact be the original value
          // due to the base/copy inversion at the start of this function
          value: m(M)
        }), b.push({
          op: r,
          path: I,
          value: m(_)
        });
      }
    }
    for (let x = R.length; x < C.length; x++) {
      const M = d.concat([x]);
      g.push({
        op: i,
        path: M,
        // Need to maybe clone it, as it can in fact be the original value
        // due to the base/copy inversion at the start of this function
        value: m(C[x])
      });
    }
    for (let x = C.length - 1; R.length <= x; --x) {
      const M = d.concat([x]);
      b.push({
        op: s,
        path: M
      });
    }
  }
  function c(p, d, g, b) {
    const { base_: R, copy_: w, type_: C } = p;
    $n(p.assigned_, (v, x) => {
      const M = Je(R, v, C), _ = Je(w, v, C), A = x ? Yt(R, v) ? r : i : s;
      if (M === _ && A === r)
        return;
      const E = d.concat(v);
      g.push(
        A === s ? { op: A, path: E } : { op: A, path: E, value: m(_) }
      ), b.push(
        A === i ? { op: s, path: E } : A === s ? { op: i, path: E, value: m(M) } : { op: r, path: E, value: m(M) }
      );
    });
  }
  function u(p, d, g, b) {
    let { base_: R, copy_: w } = p, C = 0;
    R.forEach((v) => {
      if (!w.has(v)) {
        const x = d.concat([C]);
        g.push({
          op: s,
          path: x,
          value: v
        }), b.unshift({
          op: i,
          path: x,
          value: v
        });
      }
      C++;
    }), C = 0, w.forEach((v) => {
      if (!R.has(v)) {
        const x = d.concat([C]);
        g.push({
          op: i,
          path: x,
          value: v
        }), b.unshift({
          op: s,
          path: x,
          value: v
        });
      }
      C++;
    });
  }
  function l(p, d, g) {
    const { patches_: b, inversePatches_: R } = g;
    b.push({
      op: r,
      path: [],
      value: d === Xs ? void 0 : d
    }), R.push({
      op: r,
      path: [],
      value: p
    });
  }
  function f(p, d) {
    return d.forEach((g) => {
      const { path: b, op: R } = g;
      let w = p;
      for (let M = 0; M < b.length - 1; M++) {
        const _ = Tt(w);
        let A = b[M];
        typeof A != "string" && typeof A != "number" && (A = "" + A), (_ === 0 || _ === 1) && (A === "__proto__" || A === On) && me(19), dt(w) && A === Un && me(19), w = Je(w, A), (w === null || !Jt(w)) && me(18, b.join("/"));
      }
      const C = Tt(w), v = h(g.value), x = b[b.length - 1];
      switch (R) {
        case r:
          switch (C) {
            case 2:
              return w.set(x, v);
            case 3:
              me(16);
            default:
              return w[x] = v;
          }
        case i:
          switch (C) {
            case 1:
              return x === "-" ? w.push(v) : w.splice(x, 0, v);
            case 2:
              return w.set(x, v);
            case 3:
              return w.add(v);
            default:
              return w[x] = v;
          }
        case s:
          switch (C) {
            case 1:
              return w.splice(x, 1);
            case 2:
              return w.delete(x);
            case 3:
              return w.delete(g.value);
            default:
              return delete w[x];
          }
        default:
          me(17, R);
      }
    }), p;
  }
  function h(p) {
    if (!Oe(p))
      return p;
    if (Nn(p))
      return p.map(h);
    if (Ln(p))
      return new Map(
        Array.from(p.entries()).map(([g, b]) => [g, h(b)])
      );
    if (jn(p))
      return new Set(Array.from(p).map(h));
    const d = Object.create(Dt(p));
    for (const g in p)
      d[g] = h(p[g]);
    return Yt(p, In) && (d[In] = p[In]), d;
  }
  function m(p) {
    return Te(p) ? h(p) : p;
  }
  Yp(zr, {
    applyPatches_: f,
    generatePatches_: o,
    generateReplacementPatches_: l,
    getPath: t
  });
}
var Tn = new rh(), Qn = Tn.produce, Ku = /* @__PURE__ */ Tn.produceWithPatches.bind(Tn), ua = /* @__PURE__ */ Tn.applyPatches.bind(Tn), sh = (e, t, n) => {
  if (t.length === 1 && t[0] === n) {
    let r = !1;
    try {
      const i = {};
      e(i) === i && (r = !0);
    } catch {
    }
    if (r) {
      let i;
      try {
        throw new Error();
      } catch (s) {
        ({ stack: i } = s);
      }
      console.warn(
        `The result function returned its own inputs without modification. e.g
\`createSelector([state => state.todos], todos => todos)\`
This could lead to inefficient memoization and unnecessary re-renders.
Ensure transformation logic is in the result function, and extraction logic is in the input selectors.`,
        { stack: i }
      );
    }
  }
}, oh = (e, t, n) => {
  const { memoize: r, memoizeOptions: i } = t, { inputSelectorResults: s, inputSelectorResultsCopy: o } = e, a = r(() => ({}), ...i);
  if (!(a.apply(null, s) === a.apply(null, o))) {
    let u;
    try {
      throw new Error();
    } catch (l) {
      ({ stack: u } = l);
    }
    console.warn(
      `An input selector returned a different result when passed same arguments.
This means your output selector will likely run more frequently than intended.
Avoid returning a new reference inside your input selector, e.g.
\`createSelector([state => state.todos.map(todo => todo.id)], todoIds => todoIds.length)\``,
      {
        arguments: n,
        firstInputs: s,
        secondInputs: o,
        stack: u
      }
    );
  }
}, ah = {
  inputStabilityCheck: "once",
  identityFunctionCheck: "once"
};
function ch(e, t = `expected a function, instead received ${typeof e}`) {
  if (typeof e != "function")
    throw new TypeError(t);
}
function uh(e, t = "expected all items to be functions, instead received the following types: ") {
  if (!e.every((n) => typeof n == "function")) {
    const n = e.map(
      (r) => typeof r == "function" ? `function ${r.name || "unnamed"}()` : typeof r
    ).join(", ");
    throw new TypeError(`${t}[${n}]`);
  }
}
var la = (e) => Array.isArray(e) ? e : [e];
function lh(e) {
  const t = Array.isArray(e[0]) ? e[0] : e;
  return uh(
    t,
    "createSelector expects all input-selectors to be functions, but received the following types: "
  ), t;
}
function da(e, t) {
  const n = [], { length: r } = e;
  for (let i = 0; i < r; i++)
    n.push(e[i].apply(null, t));
  return n;
}
var dh = (e, t) => {
  const { identityFunctionCheck: n, inputStabilityCheck: r } = {
    ...ah,
    ...t
  };
  return {
    identityFunctionCheck: {
      shouldRun: n === "always" || n === "once" && e,
      run: sh
    },
    inputStabilityCheck: {
      shouldRun: r === "always" || r === "once" && e,
      run: oh
    }
  };
}, fh = class {
  constructor(e) {
    this.value = e;
  }
  deref() {
    return this.value;
  }
}, ph = () => typeof WeakRef > "u" ? fh : WeakRef, Gu = /* @__PURE__ */ ph(), hh = 0, fa = 1;
function sr() {
  return {
    s: hh,
    v: void 0,
    o: null,
    p: null
  };
}
function gh(e) {
  return e instanceof Gu ? e.deref() : e;
}
function Wr(e, t = {}) {
  let n = sr();
  const { resultEqualityCheck: r } = t;
  let i, s = 0;
  function o() {
    let a = n;
    const { length: c } = arguments;
    for (let f = 0, h = c; f < h; f++) {
      const m = arguments[f];
      if (typeof m == "function" || typeof m == "object" && m !== null) {
        let p = a.o;
        p === null && (a.o = p = /* @__PURE__ */ new WeakMap());
        const d = p.get(m);
        d === void 0 ? (a = sr(), p.set(m, a)) : a = d;
      } else {
        let p = a.p;
        p === null && (a.p = p = /* @__PURE__ */ new Map());
        const d = p.get(m);
        d === void 0 ? (a = sr(), p.set(m, a)) : a = d;
      }
    }
    const u = a;
    let l;
    if (a.s === fa)
      l = a.v;
    else if (l = e.apply(null, arguments), s++, r) {
      const f = gh(i);
      f != null && r(f, l) && (l = f, s !== 0 && s--), i = typeof l == "object" && l !== null || typeof l == "function" ? /* @__PURE__ */ new Gu(l) : l;
    }
    return u.s = fa, u.v = l, l;
  }
  return o.clearCache = () => {
    n = sr(), o.resetResultsCount();
  }, o.resultsCount = () => s, o.resetResultsCount = () => {
    s = 0;
  }, o;
}
function mh(e, ...t) {
  const n = typeof e == "function" ? {
    memoize: e,
    memoizeOptions: t
  } : e, r = (...i) => {
    let s = 0, o = 0, a, c = {}, u = i.pop();
    typeof u == "object" && (c = u, u = i.pop()), ch(
      u,
      `createSelector expects an output function after the inputs, but received: [${typeof u}]`
    );
    const l = {
      ...n,
      ...c
    }, {
      memoize: f,
      memoizeOptions: h = [],
      argsMemoize: m = Wr,
      argsMemoizeOptions: p = []
    } = l, d = la(h), g = la(p), b = lh(i), R = f(function() {
      return s++, u.apply(
        null,
        arguments
      );
    }, ...d);
    let w = !0;
    const C = m(function() {
      o++;
      const x = da(
        b,
        arguments
      );
      if (a = R.apply(null, x), process.env.NODE_ENV !== "production") {
        const { devModeChecks: M = {} } = l, { identityFunctionCheck: _, inputStabilityCheck: A } = dh(w, M);
        if (_.shouldRun && _.run(
          u,
          x,
          a
        ), A.shouldRun) {
          const E = da(
            b,
            arguments
          );
          A.run(
            { inputSelectorResults: x, inputSelectorResultsCopy: E },
            { memoize: f, memoizeOptions: d },
            arguments
          );
        }
        w && (w = !1);
      }
      return a;
    }, ...g);
    return Object.assign(C, {
      resultFunc: u,
      memoizedResultFunc: R,
      dependencies: b,
      dependencyRecomputations: () => o,
      resetDependencyRecomputations: () => {
        o = 0;
      },
      lastResult: () => a,
      recomputations: () => s,
      resetRecomputations: () => {
        s = 0;
      },
      memoize: f,
      argsMemoize: m
    });
  };
  return Object.assign(r, {
    withTypes: () => r
  }), r;
}
var fe = /* @__PURE__ */ mh(Wr), yh = (e) => e && typeof e.match == "function";
function S(e, t) {
  function n(...r) {
    if (t) {
      let i = t(...r);
      if (!i)
        throw new Error(process.env.NODE_ENV === "production" ? ge(0) : "prepareAction did not return an object");
      return {
        type: e,
        payload: i.payload,
        ..."meta" in i && {
          meta: i.meta
        },
        ..."error" in i && {
          error: i.error
        }
      };
    }
    return {
      type: e,
      payload: r[0]
    };
  }
  return n.toString = () => `${e}`, n.type = e, n.match = (r) => $u(r) && r.type === e, n;
}
function pa(e) {
  return Oe(e) ? Qn(e, () => {
  }) : e;
}
function or(e, t, n) {
  return e.has(t) ? e.get(t) : e.set(t, n(t)).get(t);
}
var no = "RTK_autoBatch", hn = () => (e) => ({
  payload: e,
  meta: {
    [no]: !0
  }
});
function Ju(e) {
  const t = {}, n = [];
  let r;
  const i = {
    addCase(s, o) {
      if (process.env.NODE_ENV !== "production") {
        if (n.length > 0)
          throw new Error(process.env.NODE_ENV === "production" ? ge(26) : "`builder.addCase` should only be called before calling `builder.addMatcher`");
        if (r)
          throw new Error(process.env.NODE_ENV === "production" ? ge(27) : "`builder.addCase` should only be called before calling `builder.addDefaultCase`");
      }
      const a = typeof s == "string" ? s : s.type;
      if (!a)
        throw new Error(process.env.NODE_ENV === "production" ? ge(28) : "`builder.addCase` cannot be called with an empty action type");
      if (a in t)
        throw new Error(process.env.NODE_ENV === "production" ? ge(29) : `\`builder.addCase\` cannot be called with two reducers for the same action type '${a}'`);
      return t[a] = o, i;
    },
    addAsyncThunk(s, o) {
      if (process.env.NODE_ENV !== "production" && r)
        throw new Error(process.env.NODE_ENV === "production" ? ge(43) : "`builder.addAsyncThunk` should only be called before calling `builder.addDefaultCase`");
      return o.pending && (t[s.pending.type] = o.pending), o.rejected && (t[s.rejected.type] = o.rejected), o.fulfilled && (t[s.fulfilled.type] = o.fulfilled), o.settled && n.push({
        matcher: s.settled,
        reducer: o.settled
      }), i;
    },
    addMatcher(s, o) {
      if (process.env.NODE_ENV !== "production" && r)
        throw new Error(process.env.NODE_ENV === "production" ? ge(30) : "`builder.addMatcher` should only be called before calling `builder.addDefaultCase`");
      return n.push({
        matcher: s,
        reducer: o
      }), i;
    },
    addDefaultCase(s) {
      if (process.env.NODE_ENV !== "production" && r)
        throw new Error(process.env.NODE_ENV === "production" ? ge(31) : "`builder.addDefaultCase` can only be called once");
      return r = s, i;
    }
  };
  return e(i), [t, n, r];
}
function vh(e) {
  return typeof e == "function";
}
function se(e, t) {
  if (process.env.NODE_ENV !== "production" && typeof t == "object")
    throw new Error(process.env.NODE_ENV === "production" ? ge(8) : "The object notation for `createReducer` has been removed. Please use the 'builder callback' notation instead: https://redux-toolkit.js.org/api/createReducer");
  let [n, r, i] = Ju(t), s;
  if (vh(e))
    s = () => pa(e());
  else {
    const a = pa(e);
    s = () => a;
  }
  function o(a = s(), c) {
    let u = [n[c.type], ...r.filter(({
      matcher: l
    }) => l(c)).map(({
      reducer: l
    }) => l)];
    return u.filter((l) => !!l).length === 0 && (u = [i]), u.reduce((l, f) => {
      if (f)
        if (Te(l)) {
          const m = f(l, c);
          return m === void 0 ? l : m;
        } else {
          if (Oe(l))
            return Qn(l, (h) => f(h, c));
          {
            const h = f(l, c);
            if (h === void 0) {
              if (l === null)
                return l;
              throw Error("A case reducer on a non-draftable value must not return undefined");
            }
            return h;
          }
        }
      return l;
    }, a);
  }
  return o.getInitialState = s, o;
}
var Zu = (e, t) => yh(e) ? e.match(t) : e(t);
function tt(...e) {
  return (t) => e.some((n) => Zu(n, t));
}
function An(...e) {
  return (t) => e.every((n) => Zu(n, t));
}
function li(e, t) {
  if (!e || !e.meta) return !1;
  const n = typeof e.meta.requestId == "string", r = t.indexOf(e.meta.requestStatus) > -1;
  return n && r;
}
function zn(e) {
  return typeof e[0] == "function" && "pending" in e[0] && "fulfilled" in e[0] && "rejected" in e[0];
}
function ro(...e) {
  return e.length === 0 ? (t) => li(t, ["pending"]) : zn(e) ? tt(...e.map((t) => t.pending)) : ro()(e[0]);
}
function Zt(...e) {
  return e.length === 0 ? (t) => li(t, ["rejected"]) : zn(e) ? tt(...e.map((t) => t.rejected)) : Zt()(e[0]);
}
function di(...e) {
  const t = (n) => n && n.meta && n.meta.rejectedWithValue;
  return e.length === 0 ? An(Zt(...e), t) : zn(e) ? An(Zt(...e), t) : di()(e[0]);
}
function yt(...e) {
  return e.length === 0 ? (t) => li(t, ["fulfilled"]) : zn(e) ? tt(...e.map((t) => t.fulfilled)) : yt()(e[0]);
}
function Os(...e) {
  return e.length === 0 ? (t) => li(t, ["pending", "fulfilled", "rejected"]) : zn(e) ? tt(...e.flatMap((t) => [t.pending, t.rejected, t.fulfilled])) : Os()(e[0]);
}
var Sh = "ModuleSymbhasOwnPr-0123456789ABCDEFGHNRVfgctiUvz_KqYTJkLxpZXIjQW", io = (e = 21) => {
  let t = "", n = e;
  for (; n--; )
    t += Sh[Math.random() * 64 | 0];
  return t;
}, wh = ["name", "message", "stack", "code"], $i = class {
  constructor(e, t) {
    ee(this, "payload");
    ee(this, "meta");
    /*
    type-only property to distinguish between RejectWithValue and FulfillWithMeta
    does not exist at runtime
    */
    ee(this, "_type");
    this.payload = e, this.meta = t;
  }
}, ha = class {
  constructor(e, t) {
    ee(this, "payload");
    ee(this, "meta");
    /*
    type-only property to distinguish between RejectWithValue and FulfillWithMeta
    does not exist at runtime
    */
    ee(this, "_type");
    this.payload = e, this.meta = t;
  }
}, bh = (e) => {
  if (typeof e == "object" && e !== null) {
    const t = {};
    for (const n of wh)
      typeof e[n] == "string" && (t[n] = e[n]);
    return t;
  }
  return {
    message: String(e)
  };
}, ga = "External signal was aborted", te = /* @__PURE__ */ (() => {
  function e(t, n, r) {
    const i = S(t + "/fulfilled", (c, u, l, f) => ({
      payload: c,
      meta: {
        ...f || {},
        arg: l,
        requestId: u,
        requestStatus: "fulfilled"
      }
    })), s = S(t + "/pending", (c, u, l) => ({
      payload: void 0,
      meta: {
        ...l || {},
        arg: u,
        requestId: c,
        requestStatus: "pending"
      }
    })), o = S(t + "/rejected", (c, u, l, f, h) => ({
      payload: f,
      error: (r && r.serializeError || bh)(c || "Rejected"),
      meta: {
        ...h || {},
        arg: l,
        requestId: u,
        rejectedWithValue: !!f,
        requestStatus: "rejected",
        aborted: (c == null ? void 0 : c.name) === "AbortError",
        condition: (c == null ? void 0 : c.name) === "ConditionError"
      }
    }));
    function a(c, {
      signal: u
    } = {}) {
      return (l, f, h) => {
        const m = r != null && r.idGenerator ? r.idGenerator(c) : io(), p = new AbortController();
        let d, g;
        function b(w) {
          g = w, p.abort();
        }
        u && (u.aborted ? b(ga) : u.addEventListener("abort", () => b(ga), {
          once: !0
        }));
        const R = (async function() {
          var v, x;
          let w;
          try {
            let M = (v = r == null ? void 0 : r.condition) == null ? void 0 : v.call(r, c, {
              getState: f,
              extra: h
            });
            if (Ih(M) && (M = await M), M === !1 || p.signal.aborted)
              throw {
                name: "ConditionError",
                message: "Aborted due to condition callback returning false."
              };
            const _ = new Promise((A, E) => {
              d = () => {
                E({
                  name: "AbortError",
                  message: g || "Aborted"
                });
              }, p.signal.addEventListener("abort", d, {
                once: !0
              });
            });
            l(s(m, c, (x = r == null ? void 0 : r.getPendingMeta) == null ? void 0 : x.call(r, {
              requestId: m,
              arg: c
            }, {
              getState: f,
              extra: h
            }))), w = await Promise.race([_, Promise.resolve(n(c, {
              dispatch: l,
              getState: f,
              extra: h,
              requestId: m,
              signal: p.signal,
              abort: b,
              rejectWithValue: ((A, E) => new $i(A, E)),
              fulfillWithValue: ((A, E) => new ha(A, E))
            })).then((A) => {
              if (A instanceof $i)
                throw A;
              return A instanceof ha ? i(A.payload, m, c, A.meta) : i(A, m, c);
            })]);
          } catch (M) {
            w = M instanceof $i ? o(null, m, c, M.payload, M.meta) : o(M, m, c);
          } finally {
            d && p.signal.removeEventListener("abort", d);
          }
          return r && !r.dispatchConditionRejection && o.match(w) && w.meta.condition || l(w), w;
        })();
        return Object.assign(R, {
          abort: b,
          requestId: m,
          arg: c,
          unwrap() {
            return R.then(Ch);
          }
        });
      };
    }
    return Object.assign(a, {
      pending: s,
      rejected: o,
      fulfilled: i,
      settled: tt(o, i),
      typePrefix: t
    });
  }
  return e.withTypes = () => e, e;
})();
function Ch(e) {
  if (e.meta && e.meta.rejectedWithValue)
    throw e.payload;
  if (e.error)
    throw e.error;
  return e.payload;
}
function Ih(e) {
  return e !== null && typeof e == "object" && typeof e.then == "function";
}
var Ah = /* @__PURE__ */ Symbol.for("rtk-slice-createasyncthunk");
function xh(e, t) {
  return `${e}/${t}`;
}
function Eh({
  creators: e
} = {}) {
  var n;
  const t = (n = e == null ? void 0 : e.asyncThunk) == null ? void 0 : n[Ah];
  return function(i) {
    const {
      name: s,
      reducerPath: o = s
    } = i;
    if (!s)
      throw new Error(process.env.NODE_ENV === "production" ? ge(11) : "`name` is a required option for createSlice");
    typeof process < "u" && process.env.NODE_ENV === "development" && i.initialState === void 0 && console.error("You must provide an `initialState` value that is not `undefined`. You may have misspelled `initialState`");
    const a = (typeof i.reducers == "function" ? i.reducers(Rh()) : i.reducers) || {}, c = Object.keys(a), u = {
      sliceCaseReducersByName: {},
      sliceCaseReducersByType: {},
      actionCreators: {},
      sliceMatchers: []
    }, l = {
      addCase(C, v) {
        const x = typeof C == "string" ? C : C.type;
        if (!x)
          throw new Error(process.env.NODE_ENV === "production" ? ge(12) : "`context.addCase` cannot be called with an empty action type");
        if (x in u.sliceCaseReducersByType)
          throw new Error(process.env.NODE_ENV === "production" ? ge(13) : "`context.addCase` cannot be called with two reducers for the same action type: " + x);
        return u.sliceCaseReducersByType[x] = v, l;
      },
      addMatcher(C, v) {
        return u.sliceMatchers.push({
          matcher: C,
          reducer: v
        }), l;
      },
      exposeAction(C, v) {
        return u.actionCreators[C] = v, l;
      },
      exposeCaseReducer(C, v) {
        return u.sliceCaseReducersByName[C] = v, l;
      }
    };
    c.forEach((C) => {
      const v = a[C], x = {
        reducerName: C,
        type: xh(s, C),
        createNotation: typeof i.reducers == "function"
      };
      qh(v) ? Dh(x, v, l, t) : Oh(x, v, l);
    });
    function f() {
      if (process.env.NODE_ENV !== "production" && typeof i.extraReducers == "object")
        throw new Error(process.env.NODE_ENV === "production" ? ge(14) : "The object notation for `createSlice.extraReducers` has been removed. Please use the 'builder callback' notation instead: https://redux-toolkit.js.org/api/createSlice");
      const [C = {}, v = [], x = void 0] = typeof i.extraReducers == "function" ? Ju(i.extraReducers) : [i.extraReducers], M = {
        ...C,
        ...u.sliceCaseReducersByType
      };
      return se(i.initialState, (_) => {
        for (let A in M)
          _.addCase(A, M[A]);
        for (let A of u.sliceMatchers)
          _.addMatcher(A.matcher, A.reducer);
        for (let A of v)
          _.addMatcher(A.matcher, A.reducer);
        x && _.addDefaultCase(x);
      });
    }
    const h = (C) => C, m = /* @__PURE__ */ new Map(), p = /* @__PURE__ */ new WeakMap();
    let d;
    function g(C, v) {
      return d || (d = f()), d(C, v);
    }
    function b() {
      return d || (d = f()), d.getInitialState();
    }
    function R(C, v = !1) {
      function x(_) {
        let A = _[C];
        if (typeof A > "u") {
          if (v)
            A = or(p, x, b);
          else if (process.env.NODE_ENV !== "production")
            throw new Error(process.env.NODE_ENV === "production" ? ge(15) : "selectSlice returned undefined for an uninjected slice reducer");
        }
        return A;
      }
      function M(_ = h) {
        const A = or(m, v, () => /* @__PURE__ */ new WeakMap());
        return or(A, _, () => {
          const E = {};
          for (const [I, T] of Object.entries(i.selectors ?? {}))
            E[I] = kh(T, _, () => or(p, _, b), v);
          return E;
        });
      }
      return {
        reducerPath: C,
        getSelectors: M,
        get selectors() {
          return M(x);
        },
        selectSlice: x
      };
    }
    const w = {
      name: s,
      reducer: g,
      actions: u.actionCreators,
      caseReducers: u.sliceCaseReducersByName,
      getInitialState: b,
      ...R(o),
      injectInto(C, {
        reducerPath: v,
        ...x
      } = {}) {
        const M = v ?? o;
        return C.inject({
          reducerPath: M,
          reducer: g
        }, x), {
          ...w,
          ...R(M, !0)
        };
      }
    };
    return w;
  };
}
function kh(e, t, n, r) {
  function i(s, ...o) {
    let a = t(s);
    if (typeof a > "u") {
      if (r)
        a = n();
      else if (process.env.NODE_ENV !== "production")
        throw new Error(process.env.NODE_ENV === "production" ? ge(16) : "selectState returned undefined for an uninjected slice reducer");
    }
    return e(a, ...o);
  }
  return i.unwrapped = e, i;
}
var Lt = /* @__PURE__ */ Eh();
function Rh() {
  function e(t, n) {
    return {
      _reducerDefinitionType: "asyncThunk",
      payloadCreator: t,
      ...n
    };
  }
  return e.withTypes = () => e, {
    reducer(t) {
      return Object.assign({
        // hack so the wrapping function has the same name as the original
        // we need to create a wrapper so the `reducerDefinitionType` is not assigned to the original
        [t.name](...n) {
          return t(...n);
        }
      }[t.name], {
        _reducerDefinitionType: "reducer"
        /* reducer */
      });
    },
    preparedReducer(t, n) {
      return {
        _reducerDefinitionType: "reducerWithPrepare",
        prepare: t,
        reducer: n
      };
    },
    asyncThunk: e
  };
}
function Oh({
  type: e,
  reducerName: t,
  createNotation: n
}, r, i) {
  let s, o;
  if ("reducer" in r) {
    if (n && !Fh(r))
      throw new Error(process.env.NODE_ENV === "production" ? ge(17) : "Please use the `create.preparedReducer` notation for prepared action creators with the `create` notation.");
    s = r.reducer, o = r.prepare;
  } else
    s = r;
  i.addCase(e, s).exposeCaseReducer(t, s).exposeAction(t, o ? S(e, o) : S(e));
}
function qh(e) {
  return e._reducerDefinitionType === "asyncThunk";
}
function Fh(e) {
  return e._reducerDefinitionType === "reducerWithPrepare";
}
function Dh({
  type: e,
  reducerName: t
}, n, r, i) {
  if (!i)
    throw new Error(process.env.NODE_ENV === "production" ? ge(18) : "Cannot use `create.asyncThunk` in the built-in `createSlice`. Use `buildCreateSlice({ creators: { asyncThunk: asyncThunkCreator } })` to create a customised version of `createSlice`.");
  const {
    payloadCreator: s,
    fulfilled: o,
    pending: a,
    rejected: c,
    settled: u,
    options: l
  } = n, f = i(e, s, l);
  r.exposeAction(t, f), o && r.addCase(f.fulfilled, o), a && r.addCase(f.pending, a), c && r.addCase(f.rejected, c), u && r.addMatcher(f.settled, u), r.exposeCaseReducer(t, {
    fulfilled: o || ar,
    pending: a || ar,
    rejected: c || ar,
    settled: u || ar
  });
}
function ar() {
}
function ge(e) {
  return `Minified Redux Toolkit error #${e}; visit https://redux-toolkit.js.org/Errors?code=${e} for the full message or use the non-minified dev environment for full errors. `;
}
const Xu = (e) => {
  var t;
  return ((t = e.commercePagination) == null ? void 0 : t.principal.perPage) || 0;
}, Th = (e, t) => {
  var n, r;
  return ((r = (n = e.commercePagination) == null ? void 0 : n.recommendations[t]) == null ? void 0 : r.perPage) || 0;
}, el = (e) => {
  var t;
  return ((t = e.commercePagination) == null ? void 0 : t.principal.totalEntries) || 0;
}, _h = (e, t) => {
  var n, r;
  return ((r = (n = e.commercePagination) == null ? void 0 : n.recommendations[t]) == null ? void 0 : r.totalEntries) || 0;
}, Mh = (e) => e.productListing.responseId, tl = (e) => {
  var t, n;
  return ((t = e.productListing) == null ? void 0 : t.results.length) || ((n = e.productListing) == null ? void 0 : n.products.length) || 0;
}, Ph = fe((e) => ({
  total: el(e),
  current: tl(e)
}), ({ current: e, total: t }) => e < t), { getOwnPropertyNames: Vh, getOwnPropertySymbols: Uh } = Object, { hasOwnProperty: $h } = Object.prototype;
function Ni(e, t) {
  return function(r, i, s) {
    return e(r, i, s) && t(r, i, s);
  };
}
function cr(e) {
  return function(n, r, i) {
    if (!n || !r || typeof n != "object" || typeof r != "object")
      return e(n, r, i);
    const { cache: s } = i, o = s.get(n), a = s.get(r);
    if (o && a)
      return o === r && a === n;
    s.set(n, r), s.set(r, n);
    const c = e(n, r, i);
    return s.delete(n), s.delete(r), c;
  };
}
function ma(e) {
  return Vh(e).concat(Uh(e));
}
const Nh = (
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  Object.hasOwn || ((e, t) => $h.call(e, t))
), Lh = "__v", jh = "__o", Qh = "_owner", { getOwnPropertyDescriptor: ya, keys: va } = Object, Ut = (
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  Object.is || function(t, n) {
    return t === n ? t !== 0 || 1 / t === 1 / n : t !== t && n !== n;
  }
);
function zh(e, t) {
  return e === t;
}
function Bh(e, t) {
  return e.byteLength === t.byteLength && Kr(new Uint8Array(e), new Uint8Array(t));
}
function Hh(e, t, n) {
  let r = e.length;
  if (t.length !== r)
    return !1;
  for (; r-- > 0; )
    if (!n.equals(e[r], t[r], r, r, e, t, n))
      return !1;
  return !0;
}
function Yh(e, t) {
  return e.byteLength === t.byteLength && Kr(new Uint8Array(e.buffer, e.byteOffset, e.byteLength), new Uint8Array(t.buffer, t.byteOffset, t.byteLength));
}
function Wh(e, t) {
  return Ut(e.getTime(), t.getTime());
}
function Kh(e, t) {
  return e.name === t.name && e.message === t.message && e.cause === t.cause && e.stack === t.stack;
}
function Sa(e, t, n) {
  const r = e.size;
  if (r !== t.size)
    return !1;
  if (!r)
    return !0;
  const i = new Array(r), s = e.entries();
  let o, a, c = 0;
  for (; (o = s.next()) && !o.done; ) {
    const u = t.entries();
    let l = !1, f = 0;
    for (; (a = u.next()) && !a.done; ) {
      if (i[f]) {
        f++;
        continue;
      }
      const h = o.value, m = a.value;
      if (n.equals(h[0], m[0], c, f, e, t, n) && n.equals(h[1], m[1], h[0], m[0], e, t, n)) {
        l = i[f] = !0;
        break;
      }
      f++;
    }
    if (!l)
      return !1;
    c++;
  }
  return !0;
}
function Gh(e, t, n) {
  const r = va(e);
  let i = r.length;
  if (va(t).length !== i)
    return !1;
  for (; i-- > 0; )
    if (!nl(e, t, n, r[i]))
      return !1;
  return !0;
}
function gn(e, t, n) {
  const r = ma(e);
  let i = r.length;
  if (ma(t).length !== i)
    return !1;
  let s, o, a;
  for (; i-- > 0; )
    if (s = r[i], !nl(e, t, n, s) || (o = ya(e, s), a = ya(t, s), (o || a) && (!o || !a || o.configurable !== a.configurable || o.enumerable !== a.enumerable || o.writable !== a.writable)))
      return !1;
  return !0;
}
function Jh(e, t) {
  return Ut(e.valueOf(), t.valueOf());
}
function Zh(e, t) {
  return e.source === t.source && e.flags === t.flags;
}
function wa(e, t, n) {
  const r = e.size;
  if (r !== t.size)
    return !1;
  if (!r)
    return !0;
  const i = new Array(r), s = e.values();
  let o, a;
  for (; (o = s.next()) && !o.done; ) {
    const c = t.values();
    let u = !1, l = 0;
    for (; (a = c.next()) && !a.done; ) {
      if (!i[l] && n.equals(o.value, a.value, o.value, a.value, e, t, n)) {
        u = i[l] = !0;
        break;
      }
      l++;
    }
    if (!u)
      return !1;
  }
  return !0;
}
function Kr(e, t) {
  let n = e.byteLength;
  if (t.byteLength !== n || e.byteOffset !== t.byteOffset)
    return !1;
  for (; n-- > 0; )
    if (e[n] !== t[n])
      return !1;
  return !0;
}
function Xh(e, t) {
  return e.hostname === t.hostname && e.pathname === t.pathname && e.protocol === t.protocol && e.port === t.port && e.hash === t.hash && e.username === t.username && e.password === t.password;
}
function nl(e, t, n, r) {
  return (r === Qh || r === jh || r === Lh) && (e.$$typeof || t.$$typeof) ? !0 : Nh(t, r) && n.equals(e[r], t[r], r, r, e, t, n);
}
const eg = Object.prototype.toString;
function tg(e) {
  const t = sg(e), { areArraysEqual: n, areDatesEqual: r, areFunctionsEqual: i, areMapsEqual: s, areNumbersEqual: o, areObjectsEqual: a, areRegExpsEqual: c, areSetsEqual: u, getUnsupportedCustomComparator: l } = e;
  return function(h, m, p) {
    if (h === m)
      return !0;
    if (h == null || m == null)
      return !1;
    const d = typeof h;
    if (d !== typeof m)
      return !1;
    if (d !== "object")
      return d === "number" || d === "bigint" ? o(h, m, p) : d === "function" ? i(h, m, p) : !1;
    const g = h.constructor;
    if (g !== m.constructor)
      return !1;
    if (g === Object)
      return a(h, m, p);
    if (g === Array)
      return n(h, m, p);
    if (g === Date)
      return r(h, m, p);
    if (g === RegExp)
      return c(h, m, p);
    if (g === Map)
      return s(h, m, p);
    if (g === Set)
      return u(h, m, p);
    if (g === Promise)
      return !1;
    if (Array.isArray(h))
      return n(h, m, p);
    const b = eg.call(h), R = t[b];
    if (R)
      return R(h, m, p);
    const w = l && l(h, m, p, b);
    return w ? w(h, m, p) : !1;
  };
}
function ng({ circular: e, createCustomConfig: t, strict: n }) {
  let r = {
    areArrayBuffersEqual: Bh,
    areArraysEqual: n ? gn : Hh,
    areDataViewsEqual: Yh,
    areDatesEqual: Wh,
    areErrorsEqual: Kh,
    areFunctionsEqual: zh,
    areMapsEqual: n ? Ni(Sa, gn) : Sa,
    areNumbersEqual: Ut,
    areObjectsEqual: n ? gn : Gh,
    arePrimitiveWrappersEqual: Jh,
    areRegExpsEqual: Zh,
    areSetsEqual: n ? Ni(wa, gn) : wa,
    areTypedArraysEqual: n ? Ni(Kr, gn) : Kr,
    areUrlsEqual: Xh,
    getUnsupportedCustomComparator: void 0
  };
  if (t && (r = Object.assign({}, r, t(r))), e) {
    const i = cr(r.areArraysEqual), s = cr(r.areMapsEqual), o = cr(r.areObjectsEqual), a = cr(r.areSetsEqual);
    r = Object.assign({}, r, {
      areArraysEqual: i,
      areMapsEqual: s,
      areObjectsEqual: o,
      areSetsEqual: a
    });
  }
  return r;
}
function rg(e) {
  return function(t, n, r, i, s, o, a) {
    return e(t, n, a);
  };
}
function ig({ circular: e, comparator: t, createState: n, equals: r, strict: i }) {
  if (n)
    return function(a, c) {
      const { cache: u = e ? /* @__PURE__ */ new WeakMap() : void 0, meta: l } = n();
      return t(a, c, {
        cache: u,
        equals: r,
        meta: l,
        strict: i
      });
    };
  if (e)
    return function(a, c) {
      return t(a, c, {
        cache: /* @__PURE__ */ new WeakMap(),
        equals: r,
        meta: void 0,
        strict: i
      });
    };
  const s = {
    cache: void 0,
    equals: r,
    meta: void 0,
    strict: i
  };
  return function(a, c) {
    return t(a, c, s);
  };
}
function sg({ areArrayBuffersEqual: e, areArraysEqual: t, areDataViewsEqual: n, areDatesEqual: r, areErrorsEqual: i, areFunctionsEqual: s, areMapsEqual: o, areNumbersEqual: a, areObjectsEqual: c, arePrimitiveWrappersEqual: u, areRegExpsEqual: l, areSetsEqual: f, areTypedArraysEqual: h, areUrlsEqual: m }) {
  return {
    "[object Arguments]": c,
    "[object Array]": t,
    "[object ArrayBuffer]": e,
    "[object AsyncGeneratorFunction]": s,
    "[object BigInt]": a,
    "[object BigInt64Array]": h,
    "[object BigUint64Array]": h,
    "[object Boolean]": u,
    "[object DataView]": n,
    "[object Date]": r,
    // If an error tag, it should be tested explicitly. Like RegExp, the properties are not
    // enumerable, and therefore will give false positives if tested like a standard object.
    "[object Error]": i,
    "[object Float16Array]": h,
    "[object Float32Array]": h,
    "[object Float64Array]": h,
    "[object Function]": s,
    "[object GeneratorFunction]": s,
    "[object Int8Array]": h,
    "[object Int16Array]": h,
    "[object Int32Array]": h,
    "[object Map]": o,
    "[object Number]": u,
    "[object Object]": (p, d, g) => (
      // The exception for value comparison is custom `Promise`-like class instances. These should
      // be treated the same as standard `Promise` objects, which means strict equality, and if
      // it reaches this point then that strict equality comparison has already failed.
      typeof p.then != "function" && typeof d.then != "function" && c(p, d, g)
    ),
    // For RegExp, the properties are not enumerable, and therefore will give false positives if
    // tested like a standard object.
    "[object RegExp]": l,
    "[object Set]": f,
    "[object String]": u,
    "[object URL]": m,
    "[object Uint8Array]": h,
    "[object Uint8ClampedArray]": h,
    "[object Uint16Array]": h,
    "[object Uint32Array]": h
  };
}
rt();
rt({ strict: !0 });
rt({ circular: !0 });
rt({
  circular: !0,
  strict: !0
});
rt({
  createInternalComparator: () => Ut
});
rt({
  strict: !0,
  createInternalComparator: () => Ut
});
rt({
  circular: !0,
  createInternalComparator: () => Ut
});
rt({
  circular: !0,
  createInternalComparator: () => Ut,
  strict: !0
});
function rt(e = {}) {
  const { circular: t = !1, createInternalComparator: n, createState: r, strict: i = !1 } = e, s = ng(e), o = tg(s), a = n ? n(o) : rg(o);
  return ig({ circular: t, comparator: o, createState: r, equals: a, strict: i });
}
function og(e, t) {
  return e.length !== t.length ? !1 : e.every((n) => t.findIndex((r) => ag(n, r)) !== -1);
}
const ag = rt({
  createCustomConfig: (e) => ({
    ...e,
    areArraysEqual: og
  })
});
function cg(e) {
  const { activeValue: t, ancestryMap: n } = ug(e);
  return t ? lg(t, n) : [];
}
function ug(e) {
  const t = [...e], n = /* @__PURE__ */ new Map();
  for (; t.length > 0; ) {
    const r = t.shift();
    if (r.state === "selected")
      return { activeValue: r, ancestryMap: n };
    if (n)
      for (const i of r.children)
        n.set(i, r);
    t.unshift(...r.children);
  }
  return {};
}
function lg(e, t) {
  const n = [];
  if (!e)
    return [];
  let r = e;
  do
    n.unshift(r), r = t.get(r);
  while (r);
  return n;
}
function dg() {
  return {
    principal: fi(),
    recommendations: {}
  };
}
function fi() {
  return {
    page: 0,
    perPage: 0,
    totalEntries: 0,
    totalPages: 0
  };
}
var je;
(function(e) {
  e.Relevance = "relevance", e.Fields = "fields";
})(je || (je = {}));
var qs;
(function(e) {
  e.Ascending = "asc", e.Descending = "desc";
})(qs || (qs = {}));
const Fs = () => ({
  by: je.Relevance
});
new z({
  options: {
    required: !1
  },
  values: {
    by: new Rn({ enum: je, required: !0 }),
    fields: new ce({
      each: new z({
        values: {
          field: new L({ required: !0 }),
          direction: new Rn({ enum: qs }),
          displayName: new L()
        }
      })
    })
  }
});
function Rr() {
  return {
    appliedSort: Fs(),
    availableSorts: [Fs()]
  };
}
const fg = () => ({
  query: ""
}), pg = (e) => e.commerceSearch.responseId, rl = (e) => {
  var t, n;
  return ((t = e.commerceSearch) == null ? void 0 : t.results.length) || ((n = e.commerceSearch) == null ? void 0 : n.products.length) || 0;
}, hg = fe((e) => ({
  total: el(e),
  current: rl(e)
}), ({ current: e, total: t }) => e < t), so = (e) => {
  var t;
  return ((t = e.commerceQuery) == null ? void 0 : t.query) ?? "";
}, gg = (e, t) => {
  var n;
  return Z((n = t.queryCorrection) == null ? void 0 : n.correctedQuery) ? so(e) : t.queryCorrection.correctedQuery;
};
var ba;
(function(e) {
  e.responseIdSelector = il(pg);
})(ba || (ba = {}));
var Ca;
(function(e) {
  e.responseIdSelector = il(Mh);
})(Ca || (Ca = {}));
function il(e) {
  return (t) => e(t[Ep]);
}
function sl(e) {
  if (typeof e != "object" || !e)
    return e;
  try {
    return JSON.parse(JSON.stringify(e));
  } catch {
    return e;
  }
}
function Bn(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var ct = {}, jt = {}, Ia;
function mg() {
  if (Ia) return jt;
  Ia = 1;
  var e = jt && jt.__assign || function() {
    return e = Object.assign || function(r) {
      for (var i, s = 1, o = arguments.length; s < o; s++) {
        i = arguments[s];
        for (var a in i) Object.prototype.hasOwnProperty.call(i, a) && (r[a] = i[a]);
      }
      return r;
    }, e.apply(this, arguments);
  };
  Object.defineProperty(jt, "__esModule", { value: !0 });
  var t = {
    delayFirstAttempt: !1,
    jitter: "none",
    maxDelay: 1 / 0,
    numOfAttempts: 10,
    retry: function() {
      return !0;
    },
    startingDelay: 100,
    timeMultiple: 2
  };
  function n(r) {
    var i = e(e({}, t), r);
    return i.numOfAttempts < 1 && (i.numOfAttempts = 1), i;
  }
  return jt.getSanitizedOptions = n, jt;
}
var ur = {}, Ne = {}, lr = {}, dr = {}, fr = {}, Aa;
function yg() {
  if (Aa) return fr;
  Aa = 1, Object.defineProperty(fr, "__esModule", { value: !0 });
  function e(t) {
    var n = Math.random() * t;
    return Math.round(n);
  }
  return fr.fullJitter = e, fr;
}
var pr = {}, xa;
function vg() {
  if (xa) return pr;
  xa = 1, Object.defineProperty(pr, "__esModule", { value: !0 });
  function e(t) {
    return t;
  }
  return pr.noJitter = e, pr;
}
var Ea;
function Sg() {
  if (Ea) return dr;
  Ea = 1, Object.defineProperty(dr, "__esModule", { value: !0 });
  var e = yg(), t = vg();
  function n(r) {
    switch (r.jitter) {
      case "full":
        return e.fullJitter;
      case "none":
      default:
        return t.noJitter;
    }
  }
  return dr.JitterFactory = n, dr;
}
var ka;
function ol() {
  if (ka) return lr;
  ka = 1, Object.defineProperty(lr, "__esModule", { value: !0 });
  var e = Sg(), t = (
    /** @class */
    (function() {
      function n(r) {
        this.options = r, this.attempt = 0;
      }
      return n.prototype.apply = function() {
        var r = this;
        return new Promise(function(i) {
          return setTimeout(i, r.jitteredDelay);
        });
      }, n.prototype.setAttemptNumber = function(r) {
        this.attempt = r;
      }, Object.defineProperty(n.prototype, "jitteredDelay", {
        get: function() {
          var r = e.JitterFactory(this.options);
          return r(this.delay);
        },
        enumerable: !0,
        configurable: !0
      }), Object.defineProperty(n.prototype, "delay", {
        get: function() {
          var r = this.options.startingDelay, i = this.options.timeMultiple, s = this.numOfDelayedAttempts, o = r * Math.pow(i, s);
          return Math.min(o, this.options.maxDelay);
        },
        enumerable: !0,
        configurable: !0
      }), Object.defineProperty(n.prototype, "numOfDelayedAttempts", {
        get: function() {
          return this.attempt;
        },
        enumerable: !0,
        configurable: !0
      }), n;
    })()
  );
  return lr.Delay = t, lr;
}
var Ra;
function wg() {
  if (Ra) return Ne;
  Ra = 1;
  var e = Ne && Ne.__extends || /* @__PURE__ */ (function() {
    var s = function(o, a) {
      return s = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(c, u) {
        c.__proto__ = u;
      } || function(c, u) {
        for (var l in u) u.hasOwnProperty(l) && (c[l] = u[l]);
      }, s(o, a);
    };
    return function(o, a) {
      s(o, a);
      function c() {
        this.constructor = o;
      }
      o.prototype = a === null ? Object.create(a) : (c.prototype = a.prototype, new c());
    };
  })(), t = Ne && Ne.__awaiter || function(s, o, a, c) {
    function u(l) {
      return l instanceof a ? l : new a(function(f) {
        f(l);
      });
    }
    return new (a || (a = Promise))(function(l, f) {
      function h(d) {
        try {
          p(c.next(d));
        } catch (g) {
          f(g);
        }
      }
      function m(d) {
        try {
          p(c.throw(d));
        } catch (g) {
          f(g);
        }
      }
      function p(d) {
        d.done ? l(d.value) : u(d.value).then(h, m);
      }
      p((c = c.apply(s, o || [])).next());
    });
  }, n = Ne && Ne.__generator || function(s, o) {
    var a = { label: 0, sent: function() {
      if (l[0] & 1) throw l[1];
      return l[1];
    }, trys: [], ops: [] }, c, u, l, f;
    return f = { next: h(0), throw: h(1), return: h(2) }, typeof Symbol == "function" && (f[Symbol.iterator] = function() {
      return this;
    }), f;
    function h(p) {
      return function(d) {
        return m([p, d]);
      };
    }
    function m(p) {
      if (c) throw new TypeError("Generator is already executing.");
      for (; a; ) try {
        if (c = 1, u && (l = p[0] & 2 ? u.return : p[0] ? u.throw || ((l = u.return) && l.call(u), 0) : u.next) && !(l = l.call(u, p[1])).done) return l;
        switch (u = 0, l && (p = [p[0] & 2, l.value]), p[0]) {
          case 0:
          case 1:
            l = p;
            break;
          case 4:
            return a.label++, { value: p[1], done: !1 };
          case 5:
            a.label++, u = p[1], p = [0];
            continue;
          case 7:
            p = a.ops.pop(), a.trys.pop();
            continue;
          default:
            if (l = a.trys, !(l = l.length > 0 && l[l.length - 1]) && (p[0] === 6 || p[0] === 2)) {
              a = 0;
              continue;
            }
            if (p[0] === 3 && (!l || p[1] > l[0] && p[1] < l[3])) {
              a.label = p[1];
              break;
            }
            if (p[0] === 6 && a.label < l[1]) {
              a.label = l[1], l = p;
              break;
            }
            if (l && a.label < l[2]) {
              a.label = l[2], a.ops.push(p);
              break;
            }
            l[2] && a.ops.pop(), a.trys.pop();
            continue;
        }
        p = o.call(s, a);
      } catch (d) {
        p = [6, d], u = 0;
      } finally {
        c = l = 0;
      }
      if (p[0] & 5) throw p[1];
      return { value: p[0] ? p[1] : void 0, done: !0 };
    }
  };
  Object.defineProperty(Ne, "__esModule", { value: !0 });
  var r = ol(), i = (
    /** @class */
    (function(s) {
      e(o, s);
      function o() {
        return s !== null && s.apply(this, arguments) || this;
      }
      return o.prototype.apply = function() {
        return t(this, void 0, void 0, function() {
          return n(this, function(a) {
            return [2, this.isFirstAttempt ? !0 : s.prototype.apply.call(this)];
          });
        });
      }, Object.defineProperty(o.prototype, "isFirstAttempt", {
        get: function() {
          return this.attempt === 0;
        },
        enumerable: !0,
        configurable: !0
      }), Object.defineProperty(o.prototype, "numOfDelayedAttempts", {
        get: function() {
          return this.attempt - 1;
        },
        enumerable: !0,
        configurable: !0
      }), o;
    })(r.Delay)
  );
  return Ne.SkipFirstDelay = i, Ne;
}
var Qt = {}, Oa;
function bg() {
  if (Oa) return Qt;
  Oa = 1;
  var e = Qt && Qt.__extends || /* @__PURE__ */ (function() {
    var r = function(i, s) {
      return r = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(o, a) {
        o.__proto__ = a;
      } || function(o, a) {
        for (var c in a) a.hasOwnProperty(c) && (o[c] = a[c]);
      }, r(i, s);
    };
    return function(i, s) {
      r(i, s);
      function o() {
        this.constructor = i;
      }
      i.prototype = s === null ? Object.create(s) : (o.prototype = s.prototype, new o());
    };
  })();
  Object.defineProperty(Qt, "__esModule", { value: !0 });
  var t = ol(), n = (
    /** @class */
    (function(r) {
      e(i, r);
      function i() {
        return r !== null && r.apply(this, arguments) || this;
      }
      return i;
    })(t.Delay)
  );
  return Qt.AlwaysDelay = n, Qt;
}
var qa;
function Cg() {
  if (qa) return ur;
  qa = 1, Object.defineProperty(ur, "__esModule", { value: !0 });
  var e = wg(), t = bg();
  function n(i, s) {
    var o = r(i);
    return o.setAttemptNumber(s), o;
  }
  ur.DelayFactory = n;
  function r(i) {
    return i.delayFirstAttempt ? new t.AlwaysDelay(i) : new e.SkipFirstDelay(i);
  }
  return ur;
}
var Fa;
function Ig() {
  if (Fa) return ct;
  Fa = 1;
  var e = ct && ct.__awaiter || function(o, a, c, u) {
    function l(f) {
      return f instanceof c ? f : new c(function(h) {
        h(f);
      });
    }
    return new (c || (c = Promise))(function(f, h) {
      function m(g) {
        try {
          d(u.next(g));
        } catch (b) {
          h(b);
        }
      }
      function p(g) {
        try {
          d(u.throw(g));
        } catch (b) {
          h(b);
        }
      }
      function d(g) {
        g.done ? f(g.value) : l(g.value).then(m, p);
      }
      d((u = u.apply(o, a || [])).next());
    });
  }, t = ct && ct.__generator || function(o, a) {
    var c = { label: 0, sent: function() {
      if (f[0] & 1) throw f[1];
      return f[1];
    }, trys: [], ops: [] }, u, l, f, h;
    return h = { next: m(0), throw: m(1), return: m(2) }, typeof Symbol == "function" && (h[Symbol.iterator] = function() {
      return this;
    }), h;
    function m(d) {
      return function(g) {
        return p([d, g]);
      };
    }
    function p(d) {
      if (u) throw new TypeError("Generator is already executing.");
      for (; c; ) try {
        if (u = 1, l && (f = d[0] & 2 ? l.return : d[0] ? l.throw || ((f = l.return) && f.call(l), 0) : l.next) && !(f = f.call(l, d[1])).done) return f;
        switch (l = 0, f && (d = [d[0] & 2, f.value]), d[0]) {
          case 0:
          case 1:
            f = d;
            break;
          case 4:
            return c.label++, { value: d[1], done: !1 };
          case 5:
            c.label++, l = d[1], d = [0];
            continue;
          case 7:
            d = c.ops.pop(), c.trys.pop();
            continue;
          default:
            if (f = c.trys, !(f = f.length > 0 && f[f.length - 1]) && (d[0] === 6 || d[0] === 2)) {
              c = 0;
              continue;
            }
            if (d[0] === 3 && (!f || d[1] > f[0] && d[1] < f[3])) {
              c.label = d[1];
              break;
            }
            if (d[0] === 6 && c.label < f[1]) {
              c.label = f[1], f = d;
              break;
            }
            if (f && c.label < f[2]) {
              c.label = f[2], c.ops.push(d);
              break;
            }
            f[2] && c.ops.pop(), c.trys.pop();
            continue;
        }
        d = a.call(o, c);
      } catch (g) {
        d = [6, g], l = 0;
      } finally {
        u = f = 0;
      }
      if (d[0] & 5) throw d[1];
      return { value: d[0] ? d[1] : void 0, done: !0 };
    }
  };
  Object.defineProperty(ct, "__esModule", { value: !0 });
  var n = mg(), r = Cg();
  function i(o, a) {
    return a === void 0 && (a = {}), e(this, void 0, void 0, function() {
      var c, u;
      return t(this, function(l) {
        switch (l.label) {
          case 0:
            return c = n.getSanitizedOptions(a), u = new s(o, c), [4, u.execute()];
          case 1:
            return [2, l.sent()];
        }
      });
    });
  }
  ct.backOff = i;
  var s = (
    /** @class */
    (function() {
      function o(a, c) {
        this.request = a, this.options = c, this.attemptNumber = 0;
      }
      return o.prototype.execute = function() {
        return e(this, void 0, void 0, function() {
          var a, c;
          return t(this, function(u) {
            switch (u.label) {
              case 0:
                if (this.attemptLimitReached) return [3, 7];
                u.label = 1;
              case 1:
                return u.trys.push([1, 4, , 6]), [4, this.applyDelay()];
              case 2:
                return u.sent(), [4, this.request()];
              case 3:
                return [2, u.sent()];
              case 4:
                return a = u.sent(), this.attemptNumber++, [4, this.options.retry(a, this.attemptNumber)];
              case 5:
                if (c = u.sent(), !c || this.attemptLimitReached)
                  throw a;
                return [3, 6];
              case 6:
                return [3, 0];
              case 7:
                throw new Error("Something went wrong.");
            }
          });
        });
      }, Object.defineProperty(o.prototype, "attemptLimitReached", {
        get: function() {
          return this.attemptNumber >= this.options.numOfAttempts;
        },
        enumerable: !0,
        configurable: !0
      }), o.prototype.applyDelay = function() {
        return e(this, void 0, void 0, function() {
          var a;
          return t(this, function(c) {
            switch (c.label) {
              case 0:
                return a = r.DelayFactory(this.options, this.attemptNumber), [4, a.apply()];
              case 1:
                return c.sent(), [
                  2
                  /*return*/
                ];
            }
          });
        });
      }, o;
    })()
  );
  return ct;
}
Ig();
function Hn(e, t = "prod", n = "platform") {
  const r = t === "prod" ? "" : t, i = n === "platform" ? "" : `.${n}`;
  return `https://${e}${i}.org${r}.coveo.com`;
}
function oo(e, t, n = "prod") {
  return e ?? Hn(t, n);
}
function an(e, t = "prod") {
  return `${Hn(e, t)}/rest/search/v2`;
}
function Ag(e, t = "prod") {
  return `${Hn(e, t, "analytics")}/rest/organizations/${e}/events/v1`;
}
const Qe = (e) => e.error !== void 0;
function xg(e, t = "prod") {
  return `${Hn(e, t)}/rest/organizations/${e}/commerce/v2`;
}
var Me;
(function(e) {
  e.CHILD_PRODUCT = "childProduct", e.PRODUCT = "product", e.SPOTLIGHT = "spotlight";
})(Me || (Me = {}));
var Or = { exports: {} }, Eg = Or.exports, Da;
function kg() {
  return Da || (Da = 1, (function(e, t) {
    (function(n, r) {
      e.exports = r();
    })(Eg, (function() {
      var n = 1e3, r = 6e4, i = 36e5, s = "millisecond", o = "second", a = "minute", c = "hour", u = "day", l = "week", f = "month", h = "quarter", m = "year", p = "date", d = "Invalid Date", g = /^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/, b = /\[([^\]]+)]|YYYY|YY|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g, R = { name: "en", weekdays: "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"), months: "January_February_March_April_May_June_July_August_September_October_November_December".split("_"), ordinal: function(q) {
        var N = ["th", "st", "nd", "rd"], y = q % 100;
        return "[" + q + (N[(y - 20) % 10] || N[y] || N[0]) + "]";
      } }, w = function(q, N, y) {
        var F = String(q);
        return !F || F.length >= N ? q : "" + Array(N + 1 - F.length).join(y) + q;
      }, C = { s: w, z: function(q) {
        var N = -q.utcOffset(), y = Math.abs(N), F = Math.floor(y / 60), k = y % 60;
        return (N <= 0 ? "+" : "-") + w(F, 2, "0") + ":" + w(k, 2, "0");
      }, m: function q(N, y) {
        if (N.date() < y.date()) return -q(y, N);
        var F = 12 * (y.year() - N.year()) + (y.month() - N.month()), k = N.clone().add(F, f), D = y - k < 0, $ = N.clone().add(F + (D ? -1 : 1), f);
        return +(-(F + (y - k) / (D ? k - $ : $ - k)) || 0);
      }, a: function(q) {
        return q < 0 ? Math.ceil(q) || 0 : Math.floor(q);
      }, p: function(q) {
        return { M: f, y: m, w: l, d: u, D: p, h: c, m: a, s: o, ms: s, Q: h }[q] || String(q || "").toLowerCase().replace(/s$/, "");
      }, u: function(q) {
        return q === void 0;
      } }, v = "en", x = {};
      x[v] = R;
      var M = "$isDayjsObject", _ = function(q) {
        return q instanceof T || !(!q || !q[M]);
      }, A = function q(N, y, F) {
        var k;
        if (!N) return v;
        if (typeof N == "string") {
          var D = N.toLowerCase();
          x[D] && (k = D), y && (x[D] = y, k = D);
          var $ = N.split("-");
          if (!k && $.length > 1) return q($[0]);
        } else {
          var Q = N.name;
          x[Q] = N, k = Q;
        }
        return !F && k && (v = k), k || !F && v;
      }, E = function(q, N) {
        if (_(q)) return q.clone();
        var y = typeof N == "object" ? N : {};
        return y.date = q, y.args = arguments, new T(y);
      }, I = C;
      I.l = A, I.i = _, I.w = function(q, N) {
        return E(q, { locale: N.$L, utc: N.$u, x: N.$x, $offset: N.$offset });
      };
      var T = (function() {
        function q(y) {
          this.$L = A(y.locale, null, !0), this.parse(y), this.$x = this.$x || y.x || {}, this[M] = !0;
        }
        var N = q.prototype;
        return N.parse = function(y) {
          this.$d = (function(F) {
            var k = F.date, D = F.utc;
            if (k === null) return /* @__PURE__ */ new Date(NaN);
            if (I.u(k)) return /* @__PURE__ */ new Date();
            if (k instanceof Date) return new Date(k);
            if (typeof k == "string" && !/Z$/i.test(k)) {
              var $ = k.match(g);
              if ($) {
                var Q = $[2] - 1 || 0, K = ($[7] || "0").substring(0, 3);
                return D ? new Date(Date.UTC($[1], Q, $[3] || 1, $[4] || 0, $[5] || 0, $[6] || 0, K)) : new Date($[1], Q, $[3] || 1, $[4] || 0, $[5] || 0, $[6] || 0, K);
              }
            }
            return new Date(k);
          })(y), this.init();
        }, N.init = function() {
          var y = this.$d;
          this.$y = y.getFullYear(), this.$M = y.getMonth(), this.$D = y.getDate(), this.$W = y.getDay(), this.$H = y.getHours(), this.$m = y.getMinutes(), this.$s = y.getSeconds(), this.$ms = y.getMilliseconds();
        }, N.$utils = function() {
          return I;
        }, N.isValid = function() {
          return this.$d.toString() !== d;
        }, N.isSame = function(y, F) {
          var k = E(y);
          return this.startOf(F) <= k && k <= this.endOf(F);
        }, N.isAfter = function(y, F) {
          return E(y) < this.startOf(F);
        }, N.isBefore = function(y, F) {
          return this.endOf(F) < E(y);
        }, N.$g = function(y, F, k) {
          return I.u(y) ? this[F] : this.set(k, y);
        }, N.unix = function() {
          return Math.floor(this.valueOf() / 1e3);
        }, N.valueOf = function() {
          return this.$d.getTime();
        }, N.startOf = function(y, F) {
          var k = this, D = !!I.u(F) || F, $ = I.p(y), Q = function(oe, ue) {
            var G = I.w(k.$u ? Date.UTC(k.$y, ue, oe) : new Date(k.$y, ue, oe), k);
            return D ? G : G.endOf(u);
          }, K = function(oe, ue) {
            return I.w(k.toDate()[oe].apply(k.toDate("s"), (D ? [0, 0, 0, 0] : [23, 59, 59, 999]).slice(ue)), k);
          }, Y = this.$W, ne = this.$M, B = this.$D, X = "set" + (this.$u ? "UTC" : "");
          switch ($) {
            case m:
              return D ? Q(1, 0) : Q(31, 11);
            case f:
              return D ? Q(1, ne) : Q(0, ne + 1);
            case l:
              var H = this.$locale().weekStart || 0, ie = (Y < H ? Y + 7 : Y) - H;
              return Q(D ? B - ie : B + (6 - ie), ne);
            case u:
            case p:
              return K(X + "Hours", 0);
            case c:
              return K(X + "Minutes", 1);
            case a:
              return K(X + "Seconds", 2);
            case o:
              return K(X + "Milliseconds", 3);
            default:
              return this.clone();
          }
        }, N.endOf = function(y) {
          return this.startOf(y, !1);
        }, N.$set = function(y, F) {
          var k, D = I.p(y), $ = "set" + (this.$u ? "UTC" : ""), Q = (k = {}, k[u] = $ + "Date", k[p] = $ + "Date", k[f] = $ + "Month", k[m] = $ + "FullYear", k[c] = $ + "Hours", k[a] = $ + "Minutes", k[o] = $ + "Seconds", k[s] = $ + "Milliseconds", k)[D], K = D === u ? this.$D + (F - this.$W) : F;
          if (D === f || D === m) {
            var Y = this.clone().set(p, 1);
            Y.$d[Q](K), Y.init(), this.$d = Y.set(p, Math.min(this.$D, Y.daysInMonth())).$d;
          } else Q && this.$d[Q](K);
          return this.init(), this;
        }, N.set = function(y, F) {
          return this.clone().$set(y, F);
        }, N.get = function(y) {
          return this[I.p(y)]();
        }, N.add = function(y, F) {
          var k, D = this;
          y = Number(y);
          var $ = I.p(F), Q = function(ne) {
            var B = E(D);
            return I.w(B.date(B.date() + Math.round(ne * y)), D);
          };
          if ($ === f) return this.set(f, this.$M + y);
          if ($ === m) return this.set(m, this.$y + y);
          if ($ === u) return Q(1);
          if ($ === l) return Q(7);
          var K = (k = {}, k[a] = r, k[c] = i, k[o] = n, k)[$] || 1, Y = this.$d.getTime() + y * K;
          return I.w(Y, this);
        }, N.subtract = function(y, F) {
          return this.add(-1 * y, F);
        }, N.format = function(y) {
          var F = this, k = this.$locale();
          if (!this.isValid()) return k.invalidDate || d;
          var D = y || "YYYY-MM-DDTHH:mm:ssZ", $ = I.z(this), Q = this.$H, K = this.$m, Y = this.$M, ne = k.weekdays, B = k.months, X = k.meridiem, H = function(ue, G, J, de) {
            return ue && (ue[G] || ue(F, D)) || J[G].slice(0, de);
          }, ie = function(ue) {
            return I.s(Q % 12 || 12, ue, "0");
          }, oe = X || function(ue, G, J) {
            var de = ue < 12 ? "AM" : "PM";
            return J ? de.toLowerCase() : de;
          };
          return D.replace(b, (function(ue, G) {
            return G || (function(J) {
              switch (J) {
                case "YY":
                  return String(F.$y).slice(-2);
                case "YYYY":
                  return I.s(F.$y, 4, "0");
                case "M":
                  return Y + 1;
                case "MM":
                  return I.s(Y + 1, 2, "0");
                case "MMM":
                  return H(k.monthsShort, Y, B, 3);
                case "MMMM":
                  return H(B, Y);
                case "D":
                  return F.$D;
                case "DD":
                  return I.s(F.$D, 2, "0");
                case "d":
                  return String(F.$W);
                case "dd":
                  return H(k.weekdaysMin, F.$W, ne, 2);
                case "ddd":
                  return H(k.weekdaysShort, F.$W, ne, 3);
                case "dddd":
                  return ne[F.$W];
                case "H":
                  return String(Q);
                case "HH":
                  return I.s(Q, 2, "0");
                case "h":
                  return ie(1);
                case "hh":
                  return ie(2);
                case "a":
                  return oe(Q, K, !0);
                case "A":
                  return oe(Q, K, !1);
                case "m":
                  return String(K);
                case "mm":
                  return I.s(K, 2, "0");
                case "s":
                  return String(F.$s);
                case "ss":
                  return I.s(F.$s, 2, "0");
                case "SSS":
                  return I.s(F.$ms, 3, "0");
                case "Z":
                  return $;
              }
              return null;
            })(ue) || $.replace(":", "");
          }));
        }, N.utcOffset = function() {
          return 15 * -Math.round(this.$d.getTimezoneOffset() / 15);
        }, N.diff = function(y, F, k) {
          var D, $ = this, Q = I.p(F), K = E(y), Y = (K.utcOffset() - this.utcOffset()) * r, ne = this - K, B = function() {
            return I.m($, K);
          };
          switch (Q) {
            case m:
              D = B() / 12;
              break;
            case f:
              D = B();
              break;
            case h:
              D = B() / 3;
              break;
            case l:
              D = (ne - Y) / 6048e5;
              break;
            case u:
              D = (ne - Y) / 864e5;
              break;
            case c:
              D = ne / i;
              break;
            case a:
              D = ne / r;
              break;
            case o:
              D = ne / n;
              break;
            default:
              D = ne;
          }
          return k ? D : I.a(D);
        }, N.daysInMonth = function() {
          return this.endOf(f).$D;
        }, N.$locale = function() {
          return x[this.$L];
        }, N.locale = function(y, F) {
          if (!y) return this.$L;
          var k = this.clone(), D = A(y, F, !0);
          return D && (k.$L = D), k;
        }, N.clone = function() {
          return I.w(this.$d, this);
        }, N.toDate = function() {
          return new Date(this.valueOf());
        }, N.toJSON = function() {
          return this.isValid() ? this.toISOString() : null;
        }, N.toISOString = function() {
          return this.$d.toISOString();
        }, N.toString = function() {
          return this.$d.toUTCString();
        }, q;
      })(), U = T.prototype;
      return E.prototype = U, [["$ms", s], ["$s", o], ["$m", a], ["$H", c], ["$W", u], ["$M", f], ["$y", m], ["$D", p]].forEach((function(q) {
        U[q[1]] = function(N) {
          return this.$g(N, q[0], q[1]);
        };
      })), E.extend = function(q, N) {
        return q.$i || (q(N, T, E), q.$i = !0), E;
      }, E.locale = A, E.isDayjs = _, E.unix = function(q) {
        return E(1e3 * q);
      }, E.en = x[v], E.Ls = x, E.p = {}, E;
    }));
  })(Or)), Or.exports;
}
var Rg = kg();
const ze = /* @__PURE__ */ Bn(Rg);
var qr = { exports: {} }, Og = qr.exports, Ta;
function qg() {
  return Ta || (Ta = 1, (function(e, t) {
    (function(n, r) {
      e.exports = r();
    })(Og, (function() {
      var n = "month", r = "quarter";
      return function(i, s) {
        var o = s.prototype;
        o.quarter = function(u) {
          return this.$utils().u(u) ? Math.ceil((this.month() + 1) / 3) : this.month(this.month() % 3 + 3 * (u - 1));
        };
        var a = o.add;
        o.add = function(u, l) {
          return u = Number(u), this.$utils().p(l) === r ? this.add(3 * u, n) : a.bind(this)(u, l);
        };
        var c = o.startOf;
        o.startOf = function(u, l) {
          var f = this.$utils(), h = !!f.u(l) || l;
          if (f.p(u) === r) {
            var m = this.quarter() - 1;
            return h ? this.month(3 * m).startOf(n).startOf("day") : this.month(3 * m + 2).endOf(n).endOf("day");
          }
          return c.bind(this)(u, l);
        };
      };
    }));
  })(qr)), qr.exports;
}
var Fg = qg();
const Dg = /* @__PURE__ */ Bn(Fg);
var Fr = { exports: {} }, Tg = Fr.exports, _a;
function _g() {
  return _a || (_a = 1, (function(e, t) {
    (function(n, r) {
      e.exports = r();
    })(Tg, (function() {
      var n = { LTS: "h:mm:ss A", LT: "h:mm A", L: "MM/DD/YYYY", LL: "MMMM D, YYYY", LLL: "MMMM D, YYYY h:mm A", LLLL: "dddd, MMMM D, YYYY h:mm A" }, r = /(\[[^[]*\])|([-_:/.,()\s]+)|(A|a|Q|YYYY|YY?|ww?|MM?M?M?|Do|DD?|hh?|HH?|mm?|ss?|S{1,3}|z|ZZ?)/g, i = /\d/, s = /\d\d/, o = /\d\d?/, a = /\d*[^-_:/,()\s\d]+/, c = {}, u = function(g) {
        return (g = +g) + (g > 68 ? 1900 : 2e3);
      }, l = function(g) {
        return function(b) {
          this[g] = +b;
        };
      }, f = [/[+-]\d\d:?(\d\d)?|Z/, function(g) {
        (this.zone || (this.zone = {})).offset = (function(b) {
          if (!b || b === "Z") return 0;
          var R = b.match(/([+-]|\d\d)/g), w = 60 * R[1] + (+R[2] || 0);
          return w === 0 ? 0 : R[0] === "+" ? -w : w;
        })(g);
      }], h = function(g) {
        var b = c[g];
        return b && (b.indexOf ? b : b.s.concat(b.f));
      }, m = function(g, b) {
        var R, w = c.meridiem;
        if (w) {
          for (var C = 1; C <= 24; C += 1) if (g.indexOf(w(C, 0, b)) > -1) {
            R = C > 12;
            break;
          }
        } else R = g === (b ? "pm" : "PM");
        return R;
      }, p = { A: [a, function(g) {
        this.afternoon = m(g, !1);
      }], a: [a, function(g) {
        this.afternoon = m(g, !0);
      }], Q: [i, function(g) {
        this.month = 3 * (g - 1) + 1;
      }], S: [i, function(g) {
        this.milliseconds = 100 * +g;
      }], SS: [s, function(g) {
        this.milliseconds = 10 * +g;
      }], SSS: [/\d{3}/, function(g) {
        this.milliseconds = +g;
      }], s: [o, l("seconds")], ss: [o, l("seconds")], m: [o, l("minutes")], mm: [o, l("minutes")], H: [o, l("hours")], h: [o, l("hours")], HH: [o, l("hours")], hh: [o, l("hours")], D: [o, l("day")], DD: [s, l("day")], Do: [a, function(g) {
        var b = c.ordinal, R = g.match(/\d+/);
        if (this.day = R[0], b) for (var w = 1; w <= 31; w += 1) b(w).replace(/\[|\]/g, "") === g && (this.day = w);
      }], w: [o, l("week")], ww: [s, l("week")], M: [o, l("month")], MM: [s, l("month")], MMM: [a, function(g) {
        var b = h("months"), R = (h("monthsShort") || b.map((function(w) {
          return w.slice(0, 3);
        }))).indexOf(g) + 1;
        if (R < 1) throw new Error();
        this.month = R % 12 || R;
      }], MMMM: [a, function(g) {
        var b = h("months").indexOf(g) + 1;
        if (b < 1) throw new Error();
        this.month = b % 12 || b;
      }], Y: [/[+-]?\d+/, l("year")], YY: [s, function(g) {
        this.year = u(g);
      }], YYYY: [/\d{4}/, l("year")], Z: f, ZZ: f };
      function d(g) {
        var b, R;
        b = g, R = c && c.formats;
        for (var w = (g = b.replace(/(\[[^\]]+])|(LTS?|l{1,4}|L{1,4})/g, (function(E, I, T) {
          var U = T && T.toUpperCase();
          return I || R[T] || n[T] || R[U].replace(/(\[[^\]]+])|(MMMM|MM|DD|dddd)/g, (function(q, N, y) {
            return N || y.slice(1);
          }));
        }))).match(r), C = w.length, v = 0; v < C; v += 1) {
          var x = w[v], M = p[x], _ = M && M[0], A = M && M[1];
          w[v] = A ? { regex: _, parser: A } : x.replace(/^\[|\]$/g, "");
        }
        return function(E) {
          for (var I = {}, T = 0, U = 0; T < C; T += 1) {
            var q = w[T];
            if (typeof q == "string") U += q.length;
            else {
              var N = q.regex, y = q.parser, F = E.slice(U), k = N.exec(F)[0];
              y.call(I, k), E = E.replace(k, "");
            }
          }
          return (function(D) {
            var $ = D.afternoon;
            if ($ !== void 0) {
              var Q = D.hours;
              $ ? Q < 12 && (D.hours += 12) : Q === 12 && (D.hours = 0), delete D.afternoon;
            }
          })(I), I;
        };
      }
      return function(g, b, R) {
        R.p.customParseFormat = !0, g && g.parseTwoDigitYear && (u = g.parseTwoDigitYear);
        var w = b.prototype, C = w.parse;
        w.parse = function(v) {
          var x = v.date, M = v.utc, _ = v.args;
          this.$u = M;
          var A = _[1];
          if (typeof A == "string") {
            var E = _[2] === !0, I = _[3] === !0, T = E || I, U = _[2];
            I && (U = _[2]), c = this.$locale(), !E && U && (c = R.Ls[U]), this.$d = (function(F, k, D, $) {
              try {
                if (["x", "X"].indexOf(k) > -1) return new Date((k === "X" ? 1e3 : 1) * F);
                var Q = d(k)(F), K = Q.year, Y = Q.month, ne = Q.day, B = Q.hours, X = Q.minutes, H = Q.seconds, ie = Q.milliseconds, oe = Q.zone, ue = Q.week, G = /* @__PURE__ */ new Date(), J = ne || (K || Y ? 1 : G.getDate()), de = K || G.getFullYear(), pe = 0;
                K && !Y || (pe = Y > 0 ? Y - 1 : G.getMonth());
                var xe, ve = B || 0, qe = X || 0, Se = H || 0, he = ie || 0;
                return oe ? new Date(Date.UTC(de, pe, J, ve, qe, Se, he + 60 * oe.offset * 1e3)) : D ? new Date(Date.UTC(de, pe, J, ve, qe, Se, he)) : (xe = new Date(de, pe, J, ve, qe, Se, he), ue && (xe = $(xe).week(ue).toDate()), xe);
              } catch {
                return /* @__PURE__ */ new Date("");
              }
            })(x, A, M, R), this.init(), U && U !== !0 && (this.$L = this.locale(U).$L), T && x != this.format(A) && (this.$d = /* @__PURE__ */ new Date("")), c = {};
          } else if (A instanceof Array) for (var q = A.length, N = 1; N <= q; N += 1) {
            _[1] = A[N - 1];
            var y = R.apply(this, _);
            if (y.isValid()) {
              this.$d = y.$d, this.$L = y.$L, this.init();
              break;
            }
            N === q && (this.$d = /* @__PURE__ */ new Date(""));
          }
          else C.call(this, v);
        };
      };
    }));
  })(Fr)), Fr.exports;
}
var Mg = _g();
const Pg = /* @__PURE__ */ Bn(Mg);
ze.extend(Pg);
const al = "YYYY/MM/DD@HH:mm:ss", Vg = "1401-01-01";
function Gr(e, t) {
  const n = ze(e, t);
  return !n.isValid() && !t ? ze(e, al) : n;
}
function cl(e) {
  return e.format(al);
}
function Ug(e, t) {
  const n = Gr(e, t);
  if (!n.isValid()) {
    const r = ". Please provide a date format string in the configuration options. See https://day.js.org/docs/en/parse/string-format for more information.", i = ` with the format "${t}"`;
    throw new Error(`Could not parse the provided date "${e}"${t ? i : r}`);
  }
  ul(n);
}
function ul(e) {
  if (e.isBefore(Vg))
    throw new Error(`Date is before year 1401, which is unsupported by the API: ${e}`);
}
ze.extend(Dg);
const ll = ["past", "now", "next"], dl = [
  "minute",
  "hour",
  "day",
  "week",
  "month",
  "quarter",
  "year"
], $g = (e) => {
  const t = e === "now";
  return {
    amount: new W({ required: !t, min: 1 }),
    unit: new L({
      required: !t,
      constrainTo: dl
    }),
    period: new L({
      required: !0,
      constrainTo: ll
    })
  };
};
function Ma(e) {
  if (typeof e == "string" && !_n(e))
    throw new Error(`The value "${e}" is not respecting the relative date format "period-amount-unit"`);
  const t = typeof e == "string" ? hl(e) : e;
  new St($g(t.period)).validate(t);
  const n = fl(t), r = JSON.stringify(t);
  if (!n.isValid())
    throw new Error(`Date is invalid: ${r}`);
  ul(n);
}
function Ng(e) {
  const { period: t, amount: n, unit: r } = e;
  switch (t) {
    case "past":
    case "next":
      return `${t}-${n}-${r}`;
    case "now":
      return t;
  }
}
function fl(e) {
  const { period: t, amount: n, unit: r } = e;
  switch (t) {
    case "past":
      return ze().subtract(n, r);
    case "next":
      return ze().add(n, r);
    case "now":
      return ze();
  }
}
function Ds(e) {
  return cl(fl(hl(e)));
}
function pl(e) {
  return e.toLocaleLowerCase().split("-");
}
function _n(e) {
  const [t, n, r] = pl(e);
  if (t === "now")
    return !0;
  if (!ll.includes(t) || !dl.includes(r))
    return !1;
  const i = parseInt(n, 10);
  return !(Number.isNaN(i) || i <= 0);
}
function Lg(e) {
  return !!e && typeof e == "object" && "period" in e;
}
function hl(e) {
  const [t, n, r] = pl(e);
  return t === "now" ? {
    period: "now"
  } : {
    period: t,
    amount: n ? parseInt(n, 10) : void 0,
    unit: r || void 0
  };
}
const j = new L({
  required: !0,
  emptyAllowed: !1
}), be = new L({
  required: !1,
  emptyAllowed: !1
}), Ue = new L({
  required: !0,
  emptyAllowed: !0
}), jg = new L({
  required: !1,
  emptyAllowed: !0
}), Qg = new ce({
  each: j,
  required: !0
}), zg = new L({
  required: !1,
  emptyAllowed: !1,
  regex: /^\d+\.\d+\.\d+$/
}), Bg = new L({
  required: !1,
  emptyAllowed: !1,
  regex: /^[a-zA-Z0-9_\-.]{1,100}$/
}), Hg = new L({
  required: !0,
  emptyAllowed: !1,
  regex: /^[a-zA-Z0-9_\-.]{1,100}$/
}), it = ({ message: e, name: t, stack: n }) => ({ message: e, name: t, stack: n }), Be = (e, t) => {
  if ("required" in t)
    return {
      payload: new St({
        value: t
      }).validate({ value: e }).value
    };
  const i = new z({
    options: { required: !0 },
    values: t
  }).validate(e);
  if (i)
    throw new Tu(i);
  return { payload: e };
}, O = (e, t) => {
  try {
    return Be(e, t);
  } catch (n) {
    return {
      payload: e,
      error: it(n)
    };
  }
}, ao = "3.53.1", Yg = ["@coveo/atomic", "@coveo/quantic"], Li = () => be, gl = () => j, ml = S("configuration/updateBasicConfiguration", (e) => O(e, {
  accessToken: be,
  environment: new L({
    required: !1,
    constrainTo: ["prod", "hipaa", "stg", "dev"]
  }),
  organizationId: be
})), Wg = S("configuration/updateSearchConfiguration", (e) => O(e, {
  proxyBaseUrl: new L({ required: !1, url: !0 }),
  pipeline: new L({ required: !1, emptyAllowed: !0 }),
  searchHub: be,
  timezone: be,
  locale: be,
  authenticationProviders: new ce({
    required: !1,
    each: j
  })
})), Dr = {
  enabled: new re({ default: !0 }),
  originContext: Li(),
  originLevel2: Li(),
  originLevel3: Li(),
  proxyBaseUrl: new L({ required: !1, url: !0 }),
  runtimeEnvironment: new Ae(),
  anonymous: new re({ default: !1 }),
  deviceId: be,
  userDisplayName: be,
  documentLocation: be,
  trackingId: Bg,
  analyticsMode: new L({
    constrainTo: ["legacy", "next"],
    required: !1,
    default: "next"
  }),
  source: new z({
    options: { required: !1 },
    values: Yg.reduce((e, t) => (e[t] = zg, e), {})
  })
}, Kg = S("configuration/updateAnalyticsConfiguration", (e) => O(e, Dr)), Gg = S("configuration/analytics/disable"), Jg = S("configuration/analytics/enable"), Zg = S("configuration/analytics/originlevel2", (e) => O(e, { originLevel2: gl() })), Xg = S("configuration/analytics/originlevel3", (e) => O(e, { originLevel3: gl() })), em = S("knowledge/setAgentId", (e) => O(e, new L({ required: !0 }))), tm = S("commerce/configuration/updateBasicConfiguration", (e) => O(e, {
  accessToken: be,
  environment: new L({
    required: !1,
    constrainTo: ["prod", "hipaa", "stg", "dev"]
  }),
  organizationId: be
})), nm = S("commerce/configuration/updateProxyBaseUrl", (e) => O(e, {
  proxyBaseUrl: new L({ required: !1, url: !0 })
})), rm = S("commerce/configuration/updateAnalyticsConfiguration", (e) => O(e, {
  enabled: Dr.enabled,
  proxyBaseUrl: Dr.proxyBaseUrl,
  source: Dr.source,
  trackingId: Hg
})), im = S("commerce/configuration/analytics/disable"), sm = S("commerce/configuration/analytics/enable"), om = () => ({
  accessToken: "",
  environment: "prod",
  organizationId: "",
  analytics: {
    enabled: !0,
    trackingId: "",
    source: {}
  },
  commerce: {}
});
se(om(), (e) => e.addCase(tm, (t, n) => {
  Pa(t, n.payload);
}).addCase(ml, (t, n) => {
  Pa(t, n.payload);
}).addCase(nm, (t, n) => {
  am(t, n.payload);
}).addCase(rm, (t, n) => {
  cm(t, n.payload);
}).addCase(im, (t) => {
  t.analytics.enabled = !1;
}).addCase(sm, (t) => {
  t.analytics.enabled = !0;
}));
function Pa(e, t) {
  Z(t.accessToken) || (e.accessToken = t.accessToken), e.environment = t.environment ?? "prod", Z(t.organizationId) || (e.organizationId = t.organizationId);
}
function am(e, t) {
  Z(t.proxyBaseUrl) || (e.commerce.apiBaseUrl = t.proxyBaseUrl);
}
function cm(e, t) {
  Z(t.enabled) || (e.analytics.enabled = t.enabled), Z(t.proxyBaseUrl) || (e.analytics.apiBaseUrl = t.proxyBaseUrl), Z(t.source) || (e.analytics.source = t.source), Z(t.trackingId) || (e.analytics.trackingId = t.trackingId);
}
function pi(e) {
  return e.currency;
}
const um = (e, t) => ({
  currency: pi(t.commerceContext),
  products: dm(t.cart),
  transaction: e
}), lm = (e, t) => ({
  currency: pi(t.commerceContext),
  ...e
}), co = fe((e) => e.cart, (e) => e.cartItems, (e, t) => t.map((n) => e[n])), dm = fe(co, (e) => e.map(({ quantity: t, ...n }) => ({
  quantity: t,
  product: n
}))), yl = {
  productId: j,
  quantity: new W({
    required: !0,
    min: 0
  }),
  name: new L({ required: !1 }),
  price: new W({ required: !1, min: 0 })
}, vl = new ce({
  each: new z({
    values: {
      ...yl
    }
  })
}), fm = {
  items: vl
}, pm = S("commerce/cart/setItems", (e) => O(e, vl)), hm = S("commerce/cart/updateItemQuantity", (e) => O(e, yl)), gm = S("commerce/cart/purchase");
te("commerce/cart/emit/purchaseEvent", async (e, { extra: t, getState: n }) => {
  const r = um(e, n()), { relay: i } = t;
  i.emit("ec.purchase", r);
});
te("commerce/cart/emit/cartActionEvent", async (e, { extra: t, getState: n }) => {
  const r = lm(e, n()), { relay: i } = t;
  i.emit("ec.cartAction", r);
});
fe(co, (e) => e.reduce((t, n) => t + n.quantity, 0));
fe(co, (e) => e.reduce((t, n) => t + n.price * n.quantity, 0));
function Jr(e) {
  return `${e.productId},${e.name},${e.price}`;
}
const ji = () => ({
  cartItems: [],
  cart: {},
  purchasedItems: [],
  purchased: {}
}), mm = (e) => Sl(e.cartItems, e.cart), ym = (e) => Sl(e.purchasedItems, e.purchased);
function Sl(e, t) {
  const n = e.reduce((r, i) => {
    const { productId: s, quantity: o } = t[i];
    return s in r || (r[s] = {
      productId: s,
      quantity: 0
    }), r[s].quantity += o, r;
  }, {});
  return [...Object.values(n)];
}
se(ji(), (e) => {
  e.addCase(pm, (t, { payload: n }) => {
    const { cart: r, cartItems: i } = n.reduce((s, o) => {
      const a = Jr(o);
      return {
        cartItems: [...s.cartItems, a],
        cart: {
          ...s.cart,
          [a]: o
        },
        purchasedItems: [],
        purchased: {}
      };
    }, ji());
    Va(t, i, r);
  }).addCase(hm, (t, { payload: n }) => {
    const r = Jr(n);
    if (!(r in t.cart)) {
      vm(n, t);
      return;
    }
    if (n.quantity <= 0) {
      Sm(n, t);
      return;
    }
    t.cart[r] = n;
  }).addCase(gm, (t) => {
    wm(t);
    const { cart: n, cartItems: r } = ji();
    Va(t, r, n);
  });
});
function Va(e, t, n) {
  e.cartItems = t, e.cart = n;
}
function vm(e, t) {
  if (e.quantity <= 0)
    return;
  const n = Jr(e);
  t.cartItems = [...t.cartItems, n], t.cart[n] = e;
}
function Sm(e, t) {
  const n = Jr(e);
  t.cartItems = t.cartItems.filter((r) => r !== n), delete t.cart[n];
}
function wm(e) {
  for (const t of e.cartItems) {
    if (t in e.purchased) {
      e.purchased[t].quantity += e.cart[t].quantity;
      continue;
    }
    e.purchasedItems = [...e.purchasedItems, t], e.purchased[t] = e.cart[t];
  }
}
const bm = Intl.supportedValuesOf("currency"), Cm = new L({
  required: !0,
  emptyAllowed: !1,
  constrainTo: bm
}), wl = {
  url: j
}, bl = {
  latitude: new W({ min: -90, max: 90, required: !0 }),
  longitude: new W({ min: -180, max: 180, required: !0 })
}, Im = {
  custom: new z({
    options: { required: !1 }
  })
}, Cl = {
  language: j,
  country: j,
  currency: Cm,
  view: new z({
    options: { required: !0 },
    values: wl
  }),
  location: new z({
    options: { required: !1 },
    values: bl
  }),
  custom: new z({
    options: { required: !1 }
  })
}, $t = S("commerce/context/set", (e) => O(e, Cl)), st = S("commerce/context/setView", (e) => O(e, wl)), Am = S("commerce/context/setLocation", (e) => O(e, bl)), xm = S("commerce/context/setCustom", (e) => O({ custom: e }, Im)), Em = () => ({
  language: "",
  country: "",
  currency: "",
  view: {
    url: ""
  }
});
se(Em(), (e) => {
  e.addCase($t, (t, { payload: n }) => n).addCase(st, (t, { payload: n }) => {
    t.view = n;
  }).addCase(Am, (t, { payload: n }) => {
    t.location = n;
  }).addCase(xm, (t, { payload: n }) => {
    t.custom = n.custom;
  });
});
const Il = () => ({
  correctedQuery: "",
  corrections: [],
  originalQuery: ""
}), hi = fe((e) => e.source, (e) => Object.entries(e).map(([t, n]) => `${t}@${n}`).concat(`@coveo/headless@${ao}`)), Yn = (e, t) => {
  const { view: n, location: r, custom: i, ...s } = e.commerceContext;
  return {
    accessToken: e.configuration.accessToken,
    url: e.configuration.commerce.apiBaseUrl ?? xg(e.configuration.organizationId, e.configuration.environment),
    organizationId: e.configuration.organizationId,
    trackingId: e.configuration.analytics.trackingId,
    ...s,
    ...e.configuration.analytics.enabled ? { clientId: t.clientId } : {},
    context: {
      user: {
        ...r,
        ...t.userAgent ? { userAgent: t.userAgent } : {}
      },
      view: {
        ...n,
        ...t.referrer ? { referrer: t.referrer } : {}
      },
      capture: t.capture ?? (e.configuration.analytics.enabled && t.clientId !== ""),
      cart: mm(e.cart),
      source: hi(e.configuration.analytics),
      ...i ? { custom: i } : {}
    }
  };
}, Al = (e, t, n) => ({
  ...Yn(e, t),
  ...km(e, n)
}), km = (e, t) => {
  var r, i;
  const n = t ? (r = e.commercePagination) == null ? void 0 : r.recommendations[t] : (i = e.commercePagination) == null ? void 0 : i.principal;
  return n && {
    page: n.page,
    ...n.perPage && {
      perPage: n.perPage
    }
  };
}, Nt = (e, t) => ({
  ...Al(e, t),
  facets: [...Rm(e)],
  ...e.commerceSort && {
    sort: Om(e.commerceSort.appliedSort)
  }
});
function Rm(e) {
  return !e.facetOrder || !e.commerceFacetSet ? [] : e.facetOrder.filter((t) => {
    var n;
    return (n = e.commerceFacetSet) == null ? void 0 : n[t];
  }).map((t) => {
    var n, r;
    return (r = (n = e.manualNumericFacetSet) == null ? void 0 : n[t]) != null && r.manualRange ? {
      facetId: t,
      field: t,
      numberOfValues: 1,
      isFieldExpanded: !1,
      preventAutoSelect: !0,
      type: "numericalRange",
      values: [e.manualNumericFacetSet[t].manualRange],
      initialNumberOfValues: 1
    } : e.commerceFacetSet[t].request;
  }).filter((t) => t && t.values.length > 0);
}
function Om(e) {
  return e.by === je.Relevance ? {
    sortCriteria: je.Relevance
  } : {
    sortCriteria: je.Fields,
    fields: e.fields.map(({ name: t, direction: n }) => ({
      field: t,
      direction: n
    }))
  };
}
const qm = S("commerce/facets/core/updateNumberOfValues", (e) => O(e, {
  facetId: j,
  numberOfValues: new W({ required: !0, min: 1 })
})), Fm = S("commerce/facets/core/updateIsFieldExpanded", (e) => O(e, {
  facetId: j,
  isFieldExpanded: new re({ required: !0 })
})), gi = S("commerce/facets/core/clearAll"), uo = S("commerce/facets/core/deleteAll"), mi = S("commerce/facets/core/deselectAllValues", (e) => O(e, {
  facetId: j
})), Dm = S("commerce/facets/core/updateFreezeCurrentValues", (e) => O(e, {
  facetId: j,
  freezeCurrentValues: new re({ required: !0 })
})), xl = S("commerce/facets/core/updateAutoSelectionForAll", (e) => O(e, {
  allow: new re({ required: !0 })
})), yi = {
  slotId: jg
}, Tm = {
  ...yi,
  pageSize: new W({ required: !0, min: 0 })
}, El = S("commerce/pagination/setPageSize", (e) => O(e, Tm)), _m = {
  ...yi,
  page: new W({ required: !0, min: 0 })
}, lo = S("commerce/pagination/selectPage", (e) => O(e, _m)), kl = S("commerce/pagination/nextPage", (e) => O(e, yi)), Rl = S("commerce/pagination/previousPage", (e) => O(e, yi)), Mm = S("commerce/pagination/registerRecommendationsSlot", (e) => O(e, {
  slotId: j
})), vi = S("commerce/query/update", (e) => O(e, {
  query: new L()
})), Ol = S("commerce/triggers/query/updateIgnore", (e) => O(e, {
  q: new L({ emptyAllowed: !0, required: !0 })
})), ql = S("commerce/triggers/query/applyModification", (e) => O(e, new z({
  values: { originalQuery: be, modification: be }
})));
let Fl = class {
  constructor(t) {
    ee(this, "config");
    this.config = t;
  }
  async process(t) {
    return this.processQueryErrorOrContinue(t) ?? await this.processQueryCorrectionsOrContinue(t) ?? await this.processQueryTriggersOrContinue(t) ?? this.processSuccessResponse(t);
  }
  async fetchFromAPI(t) {
    const n = Date.now(), r = await this.extra.apiClient.search(t), i = Date.now() - n, s = this.getState().commerceQuery.query || "";
    return {
      response: r,
      duration: i,
      queryExecuted: s,
      requestExecuted: t,
      enableResults: !!("enableResults" in t && t.enableResults)
    };
  }
  processSuccessResponse(t) {
    return {
      ...t,
      response: this.getSuccessResponse(t),
      originalQuery: this.getCurrentQuery()
    };
  }
  processQueryErrorOrContinue(t) {
    return Qe(t.response) ? this.rejectWithValue(t.response.error) : null;
  }
  async processQueryCorrectionsOrContinue(t) {
    const n = this.getState(), r = this.getSuccessResponse(t);
    if (!r || !n.didYouMean)
      return null;
    const { queryCorrection: i } = r;
    if (!(!Z(i) && !Z(i.correctedQuery)))
      return null;
    const { correctedQuery: o, originalQuery: a } = r.queryCorrection;
    return this.onUpdateQueryForCorrection(o ?? ""), {
      ...t,
      response: {
        ...r
      },
      queryExecuted: gg(n, r),
      originalQuery: a ?? ""
    };
  }
  async processQueryTriggersOrContinue(t) {
    var a, c;
    const n = this.getSuccessResponse(t);
    if (!n)
      return null;
    const r = ((a = n.triggers.find((u) => u.type === "query")) == null ? void 0 : a.content) || "";
    if (!r)
      return null;
    if (((c = this.getState().triggers) == null ? void 0 : c.queryModification.queryToIgnore) === r)
      return this.dispatch(Ol({ q: "" })), null;
    const s = this.getCurrentQuery(), o = await this.automaticallyRetryQueryWithTriggerModification(r, t.enableResults);
    return Qe(o.response) ? this.rejectWithValue(o.response.error) : {
      ...o,
      response: {
        ...o.response.success
      },
      originalQuery: s
    };
  }
  async automaticallyRetryQueryWithTriggerModification(t, n) {
    return this.dispatch(ql({
      newQuery: t,
      originalQuery: this.getCurrentQuery()
    })), this.onUpdateQueryForCorrection(t), await this.fetchFromAPI({
      ...Nt(this.getState(), this.navigatorContext),
      query: t,
      enableResults: !!n
    });
  }
  get dispatch() {
    return this.config.dispatch;
  }
  get rejectWithValue() {
    return this.config.rejectWithValue;
  }
  getState() {
    return this.config.getState();
  }
  get navigatorContext() {
    return this.config.extra.navigatorContext;
  }
  getCurrentQuery() {
    const t = this.getState();
    return t.commerceQuery.query !== void 0 ? t.commerceQuery.query : "";
  }
  getSuccessResponse(t) {
    return Qe(t.response) ? null : t.response.success;
  }
  get extra() {
    return this.config.extra;
  }
  onUpdateQueryForCorrection(t) {
    this.dispatch(vi({ query: t }));
  }
};
const Re = te("commerce/search/executeSearch", async (e = {}, t) => {
  const { getState: n } = t, r = n(), { navigatorContext: i } = t.extra, s = Nt(r, i), o = so(r), a = new Fl(t), c = await a.fetchFromAPI({
    ...s,
    query: o,
    enableResults: !!(e != null && e.enableResults)
  });
  return a.process(c);
}), Qi = te("commerce/search/fetchMoreProducts", async (e = {}, t) => {
  const { getState: n } = t, r = n(), { navigatorContext: i } = t.extra;
  if (!hg(r))
    return null;
  const o = Xu(r), c = rl(r) / o, u = so(r), l = Nt(r, i), f = new Fl(t), h = await f.fetchFromAPI({
    ...l,
    query: u,
    page: c,
    enableResults: !!(e != null && e.enableResults)
  });
  return f.process(h);
});
te("commerce/search/prepareForSearchWithQuery", (e, t) => {
  const { dispatch: n } = t;
  O(e, {
    query: new L(),
    clearFilters: new re()
  }), e.clearFilters && n(uo()), n(xl({ allow: !0 })), n(vi({
    query: e.query
  })), n(lo({ page: 0 }));
});
const zi = te("commerce/search/fetchInstantProducts", async (e, { getState: t, rejectWithValue: n, extra: r }) => {
  const i = t(), { apiClient: s, navigatorContext: o } = r, { q: a } = e, c = await s.productSuggestions({
    ...Yn(i, o),
    query: a
  });
  return Qe(c) ? n(c.error) : {
    response: { ...c.success, products: c.success.products }
  };
}), Pm = {
  child: new z({
    options: { required: !0 },
    values: {
      permanentid: new L({ required: !0 })
    }
  })
}, Vm = S("commerce/search/promoteChildToParent", (e) => O(e, Pm));
function Um() {
  return {
    wasCorrectedTo: "",
    queryCorrection: Il(),
    originalQuery: ""
  };
}
se(Um(), (e) => {
  e.addCase(Re.pending, (t) => {
    t.queryCorrection = Il(), t.wasCorrectedTo = "";
  }).addCase(Re.fulfilled, (t, n) => {
    var i, s;
    const { queryCorrection: r } = n.payload.response;
    t.originalQuery = n.payload.originalQuery, t.wasCorrectedTo = (r == null ? void 0 : r.correctedQuery) ?? "", t.queryCorrection = {
      correctedQuery: (r == null ? void 0 : r.correctedQuery) ?? ((i = r == null ? void 0 : r.corrections[0]) == null ? void 0 : i.correctedQuery) ?? "",
      wordCorrections: ((s = r == null ? void 0 : r.corrections[0]) == null ? void 0 : s.wordCorrections) ?? []
    };
  });
});
function Tr() {
  return [];
}
const Pe = te("commerce/productListing/fetch", async (e, { getState: t, rejectWithValue: n, extra: { apiClient: r, navigatorContext: i } }) => {
  const s = t(), o = Nt(s, i), a = await r.getProductListing({
    ...o,
    enableResults: !!(e != null && e.enableResults)
  });
  return Qe(a) ? n(a.error) : {
    response: a.success
  };
}), Bi = te("commerce/productListing/fetchMoreProducts", async (e, { getState: t, rejectWithValue: n, extra: { apiClient: r, navigatorContext: i } }) => {
  const s = t();
  if (!Ph(s))
    return null;
  const a = Xu(s), u = tl(s) / a, l = await r.getProductListing({
    ...Nt(s, i),
    enableResults: !!(e != null && e.enableResults),
    page: u
  });
  return Qe(l) ? n(l.error) : {
    response: l.success
  };
}), $m = {
  child: new z({
    options: { required: !0 },
    values: {
      permanentid: new L({ required: !0 })
    }
  })
}, Nm = S("commerce/productListing/promoteChildToParent", (e) => O(e, $m)), Dl = {
  f: new z(),
  fExcluded: new z(),
  lf: new z(),
  cf: new z(),
  nf: new z(),
  nfExcluded: new z(),
  mnf: new z(),
  mnfExcluded: new z(),
  df: new z(),
  dfExcluded: new z(),
  sortCriteria: new z(),
  page: new W({ min: 0 }),
  perPage: new W({ min: 1 })
}, cn = S("commerce/productListingParameters/restore", (e) => O(e, Dl)), Lm = {
  q: new L(),
  ...Dl
}, wt = S("commerce/searchParameters/restore", (e) => O(e, Lm));
se(Tr(), (e) => {
  e.addCase(Pe.fulfilled, Ua).addCase(Re.fulfilled, Ua).addCase(wt, $a).addCase(cn, $a).addCase(st, () => Tr()).addCase($t, () => Tr());
});
function Ua(e, t) {
  return t.payload.response.facets.map((n) => n.facetId);
}
function $a(e, t) {
  return [
    ...Object.keys(t.payload.f ?? {}),
    ...Object.keys(t.payload.lf ?? {}),
    ...Object.keys(t.payload.nf ?? {}),
    ...Object.keys(t.payload.df ?? {}),
    ...Object.keys(t.payload.cf ?? {}),
    ...Object.keys(t.payload.mnf ?? {})
  ];
}
const le = j, fo = {
  facetId: le,
  captions: new z({ options: { required: !1 } }),
  numberOfValues: new W({ required: !1, min: 1 }),
  query: new L({ required: !1, emptyAllowed: !0 })
}, jm = {
  path: new ce({
    required: !0,
    each: j
  }),
  displayValue: Ue,
  rawValue: Ue,
  count: new W({ required: !0, min: 0 })
}, po = S("categoryFacet/selectSearchResult", (e) => O(e, {
  facetId: le,
  value: new z({ values: jm })
})), Qm = S("categoryFacetSearch/register", (e) => O(e, fo));
function zm() {
  return {};
}
function ho(e, t, n) {
  const { facetId: r } = t;
  if (e[r])
    return;
  const i = !1, s = { ...Xt, ...t }, o = n();
  e[r] = {
    options: s,
    isLoading: i,
    response: o,
    initialNumberOfValues: s.numberOfValues,
    requestId: ""
  };
}
function Tl(e, t) {
  const { facetId: n, ...r } = t, i = e[n];
  i && (i.options = { ...i.options, ...r });
}
function Zr(e, t, n) {
  const r = e[t];
  r && (r.requestId = n, r.isLoading = !0);
}
function Xr(e, t) {
  const n = e[t];
  n && (n.isLoading = !1);
}
function go(e, t, n) {
  const { facetId: r } = t, i = e[r];
  i && (i.requestId = "", i.isLoading = !1, i.response = n(), i.options.numberOfValues = i.initialNumberOfValues, i.options.query = Xt.query);
}
function xn(e, t) {
  Object.keys(e).forEach((n) => go(e, { facetId: n }, t));
}
const Xt = {
  captions: {},
  numberOfValues: 10,
  query: ""
};
function un(e) {
  return Object.values(e).map((t) => t.request);
}
function _l(e, t) {
  const n = {};
  e.forEach((s) => {
    n[s.facetId] = s;
  });
  const r = [];
  t.forEach((s) => {
    s in n && (r.push(n[s]), delete n[s]);
  });
  const i = Object.values(n);
  return [...r, ...i];
}
function Na(e) {
  return un(e).map((t) => {
    const r = t.currentValues.some(({ state: i }) => i !== "idle");
    return t.generateAutomaticRanges && !r ? { ...t, currentValues: [] } : t;
  });
}
const Ml = {
  alphanumericDescending: { type: "alphanumeric", order: "descending" },
  alphanumericNaturalDescending: {
    type: "alphanumericNatural",
    order: "descending"
  }
};
function Bm(e) {
  return un(e).map((t) => {
    const n = Ml[t.sortCriteria];
    return n ? {
      ...t,
      sortCriteria: n
    } : t;
  });
}
function Hm(e) {
  return [
    ...Bm(e.facetSet ?? {}),
    ...Na(e.numericFacetSet ?? {}),
    ...Na(e.dateFacetSet ?? {}),
    ...un(e.categoryFacetSet ?? {})
  ];
}
function Ym(e) {
  return Hm(e).filter(({ facetId: t }) => {
    var n, r;
    return ((r = (n = e.facetOptions) == null ? void 0 : n.facets[t]) == null ? void 0 : r.enabled) ?? !0;
  });
}
function Pl(e) {
  return _l(Ym(e), e.facetOrder ?? []);
}
const Wm = 1, Mn = 5e3;
let Hi = class Vl {
  static set(t, n, r) {
    let i, s, o;
    r && (s = /* @__PURE__ */ new Date(), s.setTime(s.getTime() + r));
    const a = window.location.hostname, c = /^(\d{1,3}\.){3}\d{1,3}$/, u = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/;
    c.test(a) || u.test(a) || a.indexOf(".") === -1 ? Yi(t, n, s) : (o = a.split("."), i = o[o.length - 2] + "." + o[o.length - 1], Yi(t, n, s, i));
  }
  static get(t) {
    const n = t + "=", r = document.cookie.split(";");
    for (let i = 0; i < r.length; i++) {
      let s = r[i];
      if (s = s.replace(/^\s+/, ""), s.lastIndexOf(n, 0) === 0)
        return s.substring(n.length, s.length);
    }
    return null;
  }
  static erase(t) {
    Vl.set(t, "", -1);
  }
};
function Yi(e, t, n, r) {
  document.cookie = `${e}=${t}` + (n ? `;expires=${n.toUTCString()}` : "") + (r ? `;domain=${r}` : "") + ";path=/;SameSite=Lax" + (window.location.protocol === "https:" ? ";Secure" : "");
}
function Km() {
  return typeof navigator < "u";
}
function Gm() {
  try {
    return typeof localStorage < "u";
  } catch {
    return !1;
  }
}
function Jm() {
  try {
    return typeof sessionStorage < "u";
  } catch {
    return !1;
  }
}
function Zm() {
  return !!(Km() && navigator.cookieEnabled);
}
function Xm() {
  return Gm() ? localStorage : Zm() ? new ey() : Jm() ? sessionStorage : new ty();
}
var et;
let ey = (et = class {
  getItem(t) {
    return Hi.get(`${et.prefix}${t}`);
  }
  removeItem(t) {
    Hi.erase(`${et.prefix}${t}`);
  }
  setItem(t, n, r) {
    Hi.set(`${et.prefix}${t}`, n, r);
  }
}, ee(et, "prefix", "coveo_"), et), ty = class {
  getItem(t) {
    return null;
  }
  removeItem(t) {
  }
  setItem(t, n) {
  }
};
const hr = "__coveo.analytics.history", ny = 20, ry = 1e3 * 60, iy = 75;
var Le;
let ln = (Le = class {
  constructor(t) {
    ee(this, "store");
    this.store = t || Xm();
  }
  static getInstance(t) {
    return Le.instance || (Le.instance = new Le(t)), Le.instance;
  }
  /**
   * @deprecated Synchronous method is deprecated, use addElementAsync instead. This method will NOT work with react-native.
   */
  addElement(t) {
    t.internalTime = (/* @__PURE__ */ new Date()).getTime(), t = this.cropQueryElement(this.stripEmptyQuery(t));
    const n = this.getHistoryWithInternalTime();
    n !== null ? this.isValidEntry(t) && this.setHistory([t].concat(n)) : this.setHistory([t]);
  }
  async addElementAsync(t) {
    t.internalTime = (/* @__PURE__ */ new Date()).getTime(), t = this.cropQueryElement(this.stripEmptyQuery(t));
    const n = await this.getHistoryWithInternalTimeAsync();
    n !== null ? this.isValidEntry(t) && this.setHistory([t].concat(n)) : this.setHistory([t]);
  }
  /**
   * @deprecated Synchronous method is deprecated, use getHistoryAsync instead. This method will NOT work with react-native.
   */
  getHistory() {
    const t = this.getHistoryWithInternalTime();
    return this.stripEmptyQueries(this.stripInternalTime(t));
  }
  async getHistoryAsync() {
    const t = await this.getHistoryWithInternalTimeAsync();
    return this.stripEmptyQueries(this.stripInternalTime(t));
  }
  getHistoryWithInternalTime() {
    try {
      const t = this.store.getItem(hr);
      return t && typeof t == "string" ? JSON.parse(t) : [];
    } catch {
      return [];
    }
  }
  async getHistoryWithInternalTimeAsync() {
    try {
      const t = await this.store.getItem(hr);
      return t ? JSON.parse(t) : [];
    } catch {
      return [];
    }
  }
  setHistory(t) {
    try {
      this.store.setItem(hr, JSON.stringify(t.slice(0, ny)));
    } catch {
    }
  }
  clear() {
    try {
      this.store.removeItem(hr);
    } catch {
    }
  }
  getMostRecentElement() {
    const t = this.getHistoryWithInternalTime();
    return Array.isArray(t) ? t.sort((r, i) => (i.internalTime || 0) - (r.internalTime || 0))[0] : null;
  }
  cropQueryElement(t) {
    return t.name && t.value && t.name.toLowerCase() === "query" && (t.value = t.value.slice(0, iy)), t;
  }
  isValidEntry(t) {
    const n = this.getMostRecentElement();
    return n && n.value === t.value ? (t.internalTime || 0) - (n.internalTime || 0) > ry : !0;
  }
  stripInternalTime(t) {
    return Array.isArray(t) ? t.map((n) => {
      const { name: r, time: i, value: s } = n;
      return { name: r, time: i, value: s };
    }) : [];
  }
  stripEmptyQuery(t) {
    const { name: n, time: r, value: i } = t;
    return n && typeof i == "string" && n.toLowerCase() === "query" && i.trim() === "" ? { name: n, time: r } : t;
  }
  stripEmptyQueries(t) {
    return t.map((n) => this.stripEmptyQuery(n));
  }
}, ee(Le, "instance", null), Le);
function Ke(e, t) {
  var n = {};
  for (var r in e) Object.prototype.hasOwnProperty.call(e, r) && t.indexOf(r) < 0 && (n[r] = e[r]);
  if (e != null && typeof Object.getOwnPropertySymbols == "function")
    for (var i = 0, r = Object.getOwnPropertySymbols(e); i < r.length; i++)
      t.indexOf(r[i]) < 0 && Object.prototype.propertyIsEnumerable.call(e, r[i]) && (n[r[i]] = e[r[i]]);
  return n;
}
function P(e, t, n, r) {
  function i(s) {
    return s instanceof n ? s : new n(function(o) {
      o(s);
    });
  }
  return new (n || (n = Promise))(function(s, o) {
    function a(l) {
      try {
        u(r.next(l));
      } catch (f) {
        o(f);
      }
    }
    function c(l) {
      try {
        u(r.throw(l));
      } catch (f) {
        o(f);
      }
    }
    function u(l) {
      l.done ? s(l.value) : i(l.value).then(a, c);
    }
    u((r = r.apply(e, t || [])).next());
  });
}
var ae;
(function(e) {
  e.search = "search", e.click = "click", e.custom = "custom", e.view = "view", e.collect = "collect";
})(ae || (ae = {}));
function Ts() {
  return typeof window < "u";
}
function mo() {
  return typeof navigator < "u";
}
function _s() {
  return typeof document < "u";
}
function Ms() {
  try {
    return typeof localStorage < "u";
  } catch {
    return !1;
  }
}
function sy() {
  try {
    return typeof sessionStorage < "u";
  } catch {
    return !1;
  }
}
function Ul() {
  return mo() && navigator.cookieEnabled;
}
const oy = [ae.click, ae.custom, ae.search, ae.view], ay = (e, t) => oy.indexOf(e) !== -1 ? Object.assign({ language: _s() ? document.documentElement.lang : "unknown", userAgent: mo() ? navigator.userAgent : "unknown" }, t) : t;
class En {
  static set(t, n, r) {
    var i, s, o, a;
    r && (s = /* @__PURE__ */ new Date(), s.setTime(s.getTime() + r)), a = window.location.hostname, a.indexOf(".") === -1 ? La(t, n, s) : (o = a.split("."), i = o[o.length - 2] + "." + o[o.length - 1], La(t, n, s, i));
  }
  static get(t) {
    for (var n = t + "=", r = document.cookie.split(";"), i = 0; i < r.length; i++) {
      var s = r[i];
      if (s = s.replace(/^\s+/, ""), s.lastIndexOf(n, 0) === 0)
        return s.substring(n.length, s.length);
    }
    return null;
  }
  static erase(t) {
    En.set(t, "", -1);
  }
}
function La(e, t, n, r) {
  document.cookie = `${e}=${t}` + (n ? `;expires=${n.toUTCString()}` : "") + (r ? `;domain=${r}` : "") + ";path=/;SameSite=Lax";
}
function cy() {
  return Ms() ? localStorage : Ul() ? new Rt() : sy() ? sessionStorage : new Si();
}
class Rt {
  getItem(t) {
    return En.get(`${Rt.prefix}${t}`);
  }
  removeItem(t) {
    En.erase(`${Rt.prefix}${t}`);
  }
  setItem(t, n, r) {
    En.set(`${Rt.prefix}${t}`, n, r);
  }
}
Rt.prefix = "coveo_";
class uy {
  constructor() {
    this.cookieStorage = new Rt();
  }
  getItem(t) {
    return localStorage.getItem(t) || this.cookieStorage.getItem(t);
  }
  removeItem(t) {
    this.cookieStorage.removeItem(t), localStorage.removeItem(t);
  }
  setItem(t, n) {
    localStorage.setItem(t, n), this.cookieStorage.setItem(t, n, 31556926e3);
  }
}
class Si {
  getItem(t) {
    return null;
  }
  removeItem(t) {
  }
  setItem(t, n) {
  }
}
const gr = "__coveo.analytics.history", ly = 20, dy = 1e3 * 60, fy = 75;
class $l {
  constructor(t) {
    this.store = t || cy();
  }
  addElement(t) {
    t.internalTime = (/* @__PURE__ */ new Date()).getTime(), t = this.cropQueryElement(this.stripEmptyQuery(t));
    let n = this.getHistoryWithInternalTime();
    n != null ? this.isValidEntry(t) && this.setHistory([t].concat(n)) : this.setHistory([t]);
  }
  addElementAsync(t) {
    return P(this, void 0, void 0, function* () {
      t.internalTime = (/* @__PURE__ */ new Date()).getTime(), t = this.cropQueryElement(this.stripEmptyQuery(t));
      let n = yield this.getHistoryWithInternalTimeAsync();
      n != null ? this.isValidEntry(t) && this.setHistory([t].concat(n)) : this.setHistory([t]);
    });
  }
  getHistory() {
    const t = this.getHistoryWithInternalTime();
    return this.stripEmptyQueries(this.stripInternalTime(t));
  }
  getHistoryAsync() {
    return P(this, void 0, void 0, function* () {
      const t = yield this.getHistoryWithInternalTimeAsync();
      return this.stripEmptyQueries(this.stripInternalTime(t));
    });
  }
  getHistoryWithInternalTime() {
    try {
      const t = this.store.getItem(gr);
      return t && typeof t == "string" ? JSON.parse(t) : [];
    } catch {
      return [];
    }
  }
  getHistoryWithInternalTimeAsync() {
    return P(this, void 0, void 0, function* () {
      try {
        const t = yield this.store.getItem(gr);
        return t ? JSON.parse(t) : [];
      } catch {
        return [];
      }
    });
  }
  setHistory(t) {
    try {
      this.store.setItem(gr, JSON.stringify(t.slice(0, ly)));
    } catch {
    }
  }
  clear() {
    try {
      this.store.removeItem(gr);
    } catch {
    }
  }
  getMostRecentElement() {
    let t = this.getHistoryWithInternalTime();
    return Array.isArray(t) ? t.sort((r, i) => (i.internalTime || 0) - (r.internalTime || 0))[0] : null;
  }
  cropQueryElement(t) {
    return t.name && t.value && t.name.toLowerCase() === "query" && (t.value = t.value.slice(0, fy)), t;
  }
  isValidEntry(t) {
    let n = this.getMostRecentElement();
    return n && n.value == t.value ? (t.internalTime || 0) - (n.internalTime || 0) > dy : !0;
  }
  stripInternalTime(t) {
    return Array.isArray(t) ? t.map((n) => {
      const { name: r, time: i, value: s } = n;
      return { name: r, time: i, value: s };
    }) : [];
  }
  stripEmptyQuery(t) {
    const { name: n, time: r, value: i } = t;
    return n && typeof i == "string" && n.toLowerCase() === "query" && i.trim() === "" ? { name: n, time: r } : t;
  }
  stripEmptyQueries(t) {
    return t.map((n) => this.stripEmptyQuery(n));
  }
}
const py = (e, t) => P(void 0, void 0, void 0, function* () {
  return e === ae.view ? (yield hy(t.contentIdValue), Object.assign({ location: window.location.toString(), referrer: document.referrer, title: document.title }, t)) : t;
}), hy = (e) => P(void 0, void 0, void 0, function* () {
  const t = new $l(), n = {
    name: "PageView",
    value: e,
    time: (/* @__PURE__ */ new Date()).toISOString()
  };
  yield t.addElementAsync(n);
});
let mr;
const gy = new Uint8Array(16);
function my() {
  if (!mr && (mr = typeof crypto < "u" && crypto.getRandomValues && crypto.getRandomValues.bind(crypto), !mr))
    throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");
  return mr(gy);
}
var yy = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;
function ei(e) {
  return typeof e == "string" && yy.test(e);
}
const Ce = [];
for (let e = 0; e < 256; ++e)
  Ce.push((e + 256).toString(16).slice(1));
function Nl(e, t = 0) {
  return Ce[e[t + 0]] + Ce[e[t + 1]] + Ce[e[t + 2]] + Ce[e[t + 3]] + "-" + Ce[e[t + 4]] + Ce[e[t + 5]] + "-" + Ce[e[t + 6]] + Ce[e[t + 7]] + "-" + Ce[e[t + 8]] + Ce[e[t + 9]] + "-" + Ce[e[t + 10]] + Ce[e[t + 11]] + Ce[e[t + 12]] + Ce[e[t + 13]] + Ce[e[t + 14]] + Ce[e[t + 15]];
}
function vy(e) {
  if (!ei(e))
    throw TypeError("Invalid UUID");
  let t;
  const n = new Uint8Array(16);
  return n[0] = (t = parseInt(e.slice(0, 8), 16)) >>> 24, n[1] = t >>> 16 & 255, n[2] = t >>> 8 & 255, n[3] = t & 255, n[4] = (t = parseInt(e.slice(9, 13), 16)) >>> 8, n[5] = t & 255, n[6] = (t = parseInt(e.slice(14, 18), 16)) >>> 8, n[7] = t & 255, n[8] = (t = parseInt(e.slice(19, 23), 16)) >>> 8, n[9] = t & 255, n[10] = (t = parseInt(e.slice(24, 36), 16)) / 1099511627776 & 255, n[11] = t / 4294967296 & 255, n[12] = t >>> 24 & 255, n[13] = t >>> 16 & 255, n[14] = t >>> 8 & 255, n[15] = t & 255, n;
}
function Sy(e) {
  e = unescape(encodeURIComponent(e));
  const t = [];
  for (let n = 0; n < e.length; ++n)
    t.push(e.charCodeAt(n));
  return t;
}
const wy = "6ba7b810-9dad-11d1-80b4-00c04fd430c8", by = "6ba7b811-9dad-11d1-80b4-00c04fd430c8";
function Cy(e, t, n) {
  function r(i, s, o, a) {
    var c;
    if (typeof i == "string" && (i = Sy(i)), typeof s == "string" && (s = vy(s)), ((c = s) === null || c === void 0 ? void 0 : c.length) !== 16)
      throw TypeError("Namespace must be array-like (16 iterable integer values, 0-255)");
    let u = new Uint8Array(16 + i.length);
    if (u.set(s), u.set(i, s.length), u = n(u), u[6] = u[6] & 15 | t, u[8] = u[8] & 63 | 128, o) {
      a = a || 0;
      for (let l = 0; l < 16; ++l)
        o[a + l] = u[l];
      return o;
    }
    return Nl(u);
  }
  try {
    r.name = e;
  } catch {
  }
  return r.DNS = wy, r.URL = by, r;
}
const Iy = typeof crypto < "u" && crypto.randomUUID && crypto.randomUUID.bind(crypto);
var ja = {
  randomUUID: Iy
};
function Wi(e, t, n) {
  if (ja.randomUUID && !e)
    return ja.randomUUID();
  e = e || {};
  const r = e.random || (e.rng || my)();
  return r[6] = r[6] & 15 | 64, r[8] = r[8] & 63 | 128, Nl(r);
}
function Ay(e, t, n, r) {
  switch (e) {
    case 0:
      return t & n ^ ~t & r;
    case 1:
      return t ^ n ^ r;
    case 2:
      return t & n ^ t & r ^ n & r;
    case 3:
      return t ^ n ^ r;
  }
}
function Ki(e, t) {
  return e << t | e >>> 32 - t;
}
function xy(e) {
  const t = [1518500249, 1859775393, 2400959708, 3395469782], n = [1732584193, 4023233417, 2562383102, 271733878, 3285377520];
  if (typeof e == "string") {
    const o = unescape(encodeURIComponent(e));
    e = [];
    for (let a = 0; a < o.length; ++a)
      e.push(o.charCodeAt(a));
  } else Array.isArray(e) || (e = Array.prototype.slice.call(e));
  e.push(128);
  const r = e.length / 4 + 2, i = Math.ceil(r / 16), s = new Array(i);
  for (let o = 0; o < i; ++o) {
    const a = new Uint32Array(16);
    for (let c = 0; c < 16; ++c)
      a[c] = e[o * 64 + c * 4] << 24 | e[o * 64 + c * 4 + 1] << 16 | e[o * 64 + c * 4 + 2] << 8 | e[o * 64 + c * 4 + 3];
    s[o] = a;
  }
  s[i - 1][14] = (e.length - 1) * 8 / Math.pow(2, 32), s[i - 1][14] = Math.floor(s[i - 1][14]), s[i - 1][15] = (e.length - 1) * 8 & 4294967295;
  for (let o = 0; o < i; ++o) {
    const a = new Uint32Array(80);
    for (let m = 0; m < 16; ++m)
      a[m] = s[o][m];
    for (let m = 16; m < 80; ++m)
      a[m] = Ki(a[m - 3] ^ a[m - 8] ^ a[m - 14] ^ a[m - 16], 1);
    let c = n[0], u = n[1], l = n[2], f = n[3], h = n[4];
    for (let m = 0; m < 80; ++m) {
      const p = Math.floor(m / 20), d = Ki(c, 5) + Ay(p, u, l, f) + h + t[p] + a[m] >>> 0;
      h = f, f = l, l = Ki(u, 30) >>> 0, u = c, c = d;
    }
    n[0] = n[0] + c >>> 0, n[1] = n[1] + u >>> 0, n[2] = n[2] + l >>> 0, n[3] = n[3] + f >>> 0, n[4] = n[4] + h >>> 0;
  }
  return [n[0] >> 24 & 255, n[0] >> 16 & 255, n[0] >> 8 & 255, n[0] & 255, n[1] >> 24 & 255, n[1] >> 16 & 255, n[1] >> 8 & 255, n[1] & 255, n[2] >> 24 & 255, n[2] >> 16 & 255, n[2] >> 8 & 255, n[2] & 255, n[3] >> 24 & 255, n[3] >> 16 & 255, n[3] >> 8 & 255, n[3] & 255, n[4] >> 24 & 255, n[4] >> 16 & 255, n[4] >> 8 & 255, n[4] & 255];
}
const Ey = Cy("v5", 80, xy);
var Qa = Ey;
const Ll = "2.30.56", ky = {
  pageview: "pageview",
  event: "event"
};
class Mt {
  constructor(t, n) {
    if (!ei(t))
      throw Error("Not a valid uuid");
    this.clientId = t, this.creationDate = Math.floor(n / 1e3);
  }
  toString() {
    return this.clientId.replace(/-/g, "") + "." + this.creationDate.toString();
  }
  get expired() {
    const t = Math.floor(Date.now() / 1e3) - this.creationDate;
    return t < 0 || t > Mt.expirationTime;
  }
  validate(t, n) {
    return !this.expired && this.matchReferrer(t, n);
  }
  matchReferrer(t, n) {
    try {
      const r = new URL(t);
      return n.some((i) => new RegExp(i.replace(/\\/g, "\\\\").replace(/\./g, "\\.").replace(/\*/g, ".*") + "$").test(r.host));
    } catch {
      return !1;
    }
  }
  static fromString(t) {
    const n = t.split(".");
    if (n.length !== 2)
      return null;
    const [r, i] = n;
    if (r.length !== 32 || isNaN(parseInt(i)))
      return null;
    const s = r.substring(0, 8) + "-" + r.substring(8, 12) + "-" + r.substring(12, 16) + "-" + r.substring(16, 20) + "-" + r.substring(20, 32);
    return ei(s) ? new Mt(s, Number.parseInt(i) * 1e3) : null;
  }
}
Mt.cvo_cid = "cvo_cid";
Mt.expirationTime = 120;
const $e = Object.keys;
function yr(e) {
  return e !== null && typeof e == "object" && !Array.isArray(e);
}
const Gi = 128, jl = 192, za = 224, Ba = 240;
function Ry(e) {
  return (e & 248) === Ba ? 4 : (e & Ba) === za ? 3 : (e & za) === jl ? 2 : 1;
}
function Oy(e, t) {
  if (t < 0 || e.length <= t)
    return e;
  let n = e.indexOf("%", t - 2);
  for (n < 0 || n > t ? n = t : t = n; n > 2 && e.charAt(n - 3) == "%"; ) {
    const r = Number.parseInt(e.substring(n - 2, n), 16);
    if ((r & Gi) != Gi)
      break;
    if (n -= 3, (r & jl) != Gi) {
      t - n >= Ry(r) * 3 && (n = t);
      break;
    }
  }
  return e.substring(0, n);
}
const Ha = {
  id: "svc_ticket_id",
  subject: "svc_ticket_subject",
  description: "svc_ticket_description",
  category: "svc_ticket_category",
  productId: "svc_ticket_product_id",
  custom: "svc_ticket_custom"
}, qy = $e(Ha).map((e) => Ha[e]), Fy = [...qy].join("|"), Dy = new RegExp(`^(${Fy}$)`), Ty = {
  svcAction: "svc_action",
  svcActionData: "svc_action_data"
}, _y = (e) => Dy.test(e), My = [_y], Ya = {
  id: "id",
  name: "nm",
  brand: "br",
  category: "ca",
  variant: "va",
  price: "pr",
  quantity: "qt",
  coupon: "cc",
  position: "ps",
  group: "group"
}, Wa = {
  id: "id",
  name: "nm",
  brand: "br",
  category: "ca",
  variant: "va",
  position: "ps",
  price: "pr",
  group: "group"
}, ke = {
  action: "pa",
  list: "pal",
  listSource: "pls"
}, ti = {
  id: "ti",
  revenue: "tr",
  tax: "tt",
  shipping: "ts",
  coupon: "tcc",
  affiliation: "ta",
  step: "cos",
  option: "col"
}, Py = [
  "loyaltyCardId",
  "loyaltyTier",
  "thirdPartyPersona",
  "companyName",
  "favoriteStore",
  "storeName",
  "userIndustry",
  "userRole",
  "userDepartment",
  "businessUnit"
], Ps = {
  id: "quoteId",
  affiliation: "quoteAffiliation"
}, Vs = {
  id: "reviewId",
  rating: "reviewRating",
  comment: "reviewComment"
}, Vy = {
  add: ke,
  bookmark_add: ke,
  bookmark_remove: ke,
  click: ke,
  checkout: ke,
  checkout_option: ke,
  detail: ke,
  impression: ke,
  remove: ke,
  refund: Object.assign(Object.assign({}, ke), ti),
  purchase: Object.assign(Object.assign({}, ke), ti),
  quickview: ke,
  quote: Object.assign(Object.assign({}, ke), Ps),
  review: Object.assign(Object.assign({}, ke), Vs)
}, Uy = $e(Ya).map((e) => Ya[e]), $y = $e(Wa).map((e) => Wa[e]), Ny = $e(ke).map((e) => ke[e]), Ly = $e(ti).map((e) => ti[e]), jy = $e(Vs).map((e) => Vs[e]), Qy = $e(Ps).map((e) => Ps[e]), zy = [...Uy, "custom"].join("|"), By = [...$y, "custom"].join("|"), Ql = "(pr[0-9]+)", zl = "(il[0-9]+pi[0-9]+)", Hy = new RegExp(`^${Ql}(${zy})$`), Yy = new RegExp(`^(${zl}(${By}))|(il[0-9]+nm)$`), Wy = new RegExp(`^(${Ny.join("|")})$`), Ky = new RegExp(`^(${Ly.join("|")})$`), Gy = new RegExp(`^${Ql}custom$`), Jy = new RegExp(`^${zl}custom$`), Zy = new RegExp(`^(${[...Py, ...jy, ...Qy].join("|")})$`), Xy = (e) => Hy.test(e), ev = (e) => Yy.test(e), tv = (e) => Wy.test(e), nv = (e) => Ky.test(e), rv = (e) => Zy.test(e), iv = [
  ev,
  Xy,
  tv,
  nv,
  rv
], sv = [Gy, Jy], ov = {
  anonymizeIp: "aip"
}, av = {
  eventCategory: "ec",
  eventAction: "ea",
  eventLabel: "el",
  eventValue: "ev",
  page: "dp",
  visitorId: "cid",
  clientId: "cid",
  userId: "uid",
  currencyCode: "cu"
}, cv = {
  hitType: "t",
  pageViewId: "pid",
  encoding: "de",
  location: "dl",
  referrer: "dr",
  screenColor: "sd",
  screenResolution: "sr",
  title: "dt",
  userAgent: "ua",
  language: "ul",
  eventId: "z",
  time: "tm"
}, uv = [
  "contentId",
  "contentIdKey",
  "contentType",
  "searchHub",
  "tab",
  "searchUid",
  "permanentId",
  "contentLocale",
  "trackingId"
], lv = Object.assign(Object.assign(Object.assign(Object.assign({}, ov), av), cv), uv.reduce((e, t) => Object.assign(Object.assign({}, e), { [t]: t }), {})), Us = Object.assign(Object.assign({}, lv), Ty), dv = (e) => {
  const t = !!e.action && Vy[e.action] || {};
  return $e(e).reduce((n, r) => {
    const i = t[r] || Us[r] || r;
    return Object.assign(Object.assign({}, n), { [i]: e[r] });
  }, {});
}, fv = $e(Us).map((e) => Us[e]), pv = (e) => fv.indexOf(e) !== -1, hv = (e) => e === "custom", gv = (e) => [...iv, ...My, pv, hv].some((t) => t(e)), mv = (e) => $e(e).reduce((t, n) => {
  const r = yv(n);
  return r ? Object.assign(Object.assign({}, t), vv(r, e[n])) : Object.assign(Object.assign({}, t), { [n]: e[n] });
}, {}), yv = (e) => {
  let t;
  return [...sv].every((n) => {
    var r;
    return t = (r = n.exec(e)) === null || r === void 0 ? void 0 : r[1], !t;
  }), t;
}, vv = (e, t) => $e(t).reduce((n, r) => Object.assign(Object.assign({}, n), { [`${e}${r}`]: t[r] }), {});
class Sv {
  constructor(t) {
    this.opts = t;
  }
  sendEvent(t, n) {
    return P(this, void 0, void 0, function* () {
      if (!this.isAvailable())
        throw new Error('navigator.sendBeacon is not supported in this browser. Consider adding a polyfill like "sendbeacon-polyfill".');
      const { baseUrl: r, preprocessRequest: i } = this.opts, s = yield this.getQueryParamsForEventType(t), { url: o, payload: a } = yield this.preProcessRequestAsPotentialJSONString(`${r}/analytics/${t}?${s}`, n, i), c = this.encodeForEventType(t, a), u = new Blob([c], {
        type: "application/x-www-form-urlencoded"
      });
      navigator.sendBeacon(o, u);
    });
  }
  isAvailable() {
    return "sendBeacon" in navigator;
  }
  deleteHttpCookieVisitorId() {
    return Promise.resolve();
  }
  preProcessRequestAsPotentialJSONString(t, n, r) {
    return P(this, void 0, void 0, function* () {
      let i = t, s = n;
      if (r) {
        const o = yield r({ url: t, body: JSON.stringify(n) }, "analyticsBeacon"), { url: a, body: c } = o;
        i = a || t;
        try {
          s = JSON.parse(c);
        } catch (u) {
          console.error("Unable to process the request body as a JSON string", u);
        }
      }
      return {
        payload: s,
        url: i
      };
    });
  }
  encodeForEventType(t, n) {
    return this.isEventTypeLegacy(t) ? this.encodeEventToJson(t, n) : this.encodeEventToJson(t, n, this.opts.token);
  }
  getQueryParamsForEventType(t) {
    return P(this, void 0, void 0, function* () {
      const { token: n, visitorIdProvider: r } = this.opts, i = yield r.getCurrentVisitorId();
      return [
        n && this.isEventTypeLegacy(t) ? `access_token=${n}` : "",
        i ? `visitorId=${i}` : "",
        "discardVisitInfo=true"
      ].filter((s) => !!s).join("&");
    });
  }
  isEventTypeLegacy(t) {
    return [ae.click, ae.custom, ae.search, ae.view].indexOf(t) !== -1;
  }
  encodeEventToJson(t, n, r) {
    let i = `${t}Event=${encodeURIComponent(JSON.stringify(n))}`;
    return r && (i = `access_token=${encodeURIComponent(r)}&${i}`), i;
  }
}
class wv {
  sendEvent(t, n) {
    return P(this, void 0, void 0, function* () {
      return Promise.resolve();
    });
  }
  deleteHttpCookieVisitorId() {
    return P(this, void 0, void 0, function* () {
      return Promise.resolve();
    });
  }
}
const Ka = globalThis.fetch;
class Bl {
  constructor(t) {
    this.opts = t;
  }
  sendEvent(t, n) {
    return P(this, void 0, void 0, function* () {
      const { baseUrl: r, visitorIdProvider: i, preprocessRequest: s } = this.opts, o = this.shouldAppendVisitorId(t) ? yield this.getVisitorIdParam() : "", a = {
        url: `${r}/analytics/${t}${o}`,
        credentials: "include",
        mode: "cors",
        headers: this.getHeaders(),
        method: "POST",
        body: JSON.stringify(n)
      }, c = Object.assign(Object.assign({}, a), s ? yield s(a, "analyticsFetch") : {}), { url: u } = c, l = Ke(c, ["url"]);
      let f;
      try {
        f = yield Ka(u, l);
      } catch (h) {
        console.error("An error has occured when sending the event.", h);
        return;
      }
      if (f.ok) {
        const h = yield f.json();
        return h.visitorId && i.setCurrentVisitorId(h.visitorId), h;
      } else {
        try {
          f.json();
        } catch {
        }
        throw console.error(`An error has occured when sending the "${t}" event.`, f, n), new Error(`An error has occurred when sending the "${t}" event. Check the console logs for more details.`);
      }
    });
  }
  deleteHttpCookieVisitorId() {
    return P(this, void 0, void 0, function* () {
      const { baseUrl: t } = this.opts, n = `${t}/analytics/visit`;
      yield Ka(n, { headers: this.getHeaders(), method: "DELETE" });
    });
  }
  shouldAppendVisitorId(t) {
    return [ae.click, ae.custom, ae.search, ae.view].indexOf(t) !== -1;
  }
  getVisitorIdParam() {
    return P(this, void 0, void 0, function* () {
      const { visitorIdProvider: t } = this.opts, n = yield t.getCurrentVisitorId();
      return n ? `?visitor=${n}` : "";
    });
  }
  getHeaders() {
    const { token: t } = this.opts;
    return Object.assign(Object.assign({}, t ? { Authorization: `Bearer ${t}` } : {}), { "Content-Type": "application/json" });
  }
}
class bv {
  constructor(t, n) {
    Ms() && Ul() ? this.storage = new uy() : Ms() ? this.storage = localStorage : (console.warn("BrowserRuntime detected no valid storage available.", this), this.storage = new Si()), this.client = new Bl(t), this.beaconClient = new Sv(t), window.addEventListener("beforeunload", () => {
      const r = n();
      for (let { eventType: i, payload: s } of r)
        this.beaconClient.sendEvent(i, s);
    });
  }
  getClientDependingOnEventType(t) {
    return t === "click" && this.beaconClient.isAvailable() ? this.beaconClient : this.client;
  }
}
class Cv {
  constructor(t, n) {
    this.storage = n || new Si(), this.client = new Bl(t);
  }
  getClientDependingOnEventType(t) {
    return this.client;
  }
}
class Hl {
  constructor() {
    this.storage = new Si(), this.client = new wv();
  }
  getClientDependingOnEventType(t) {
    return this.client;
  }
}
const Iv = "xx", Av = (e) => (e == null ? void 0 : e.startsWith(Iv)) || !1, xv = `
        We've detected you're using React Native but have not provided the corresponding runtime, 
        for an optimal experience please use the "coveo.analytics/react-native" subpackage.
        Follow the Readme on how to set it up: https://github.com/coveo/coveo.analytics.js#using-react-native
    `;
function Ev() {
  return typeof navigator < "u" && navigator.product == "ReactNative";
}
const kv = ["1", 1, "yes", !0];
function $s() {
  const e = [];
  return Ts() && e.push(window.doNotTrack), mo() && e.push(navigator.doNotTrack, navigator.msDoNotTrack, navigator.globalPrivacyControl), e.some((t) => kv.indexOf(t) !== -1);
}
const Yl = "v15", Wl = {
  default: "https://analytics.cloud.coveo.com/rest/ua"
};
function Rv(e = Wl.default, t = Yl, n = !1) {
  if (e = e.replace(/\/$/, ""), n)
    return `${e}/${t}`;
  const r = e.endsWith("/rest") || e.endsWith("/rest/ua");
  return `${e}${r ? "" : "/rest"}/${t}`;
}
const Ov = "38824e1f-37f5-42d3-8372-a4b8fa9df946";
class _r {
  get defaultOptions() {
    return {
      endpoint: Wl.default,
      isCustomEndpoint: !1,
      token: "",
      version: Yl,
      beforeSendHooks: [],
      afterSendHooks: []
    };
  }
  get version() {
    return Ll;
  }
  constructor(t) {
    if (this.acceptedLinkReferrers = [], !t)
      throw new Error("You have to pass options to this constructor");
    this.options = Object.assign(Object.assign({}, this.defaultOptions), t), this.visitorId = "", this.bufferedRequests = [], this.beforeSendHooks = [py, ay].concat(this.options.beforeSendHooks), this.afterSendHooks = this.options.afterSendHooks, this.eventTypeMapping = {};
    const n = {
      baseUrl: this.baseUrl,
      token: this.options.token,
      visitorIdProvider: this,
      preprocessRequest: this.options.preprocessRequest
    };
    $s() ? this.runtime = new Hl() : this.runtime = this.options.runtimeEnvironment || this.initRuntime(n), this.addEventTypeMapping(ae.view, { newEventType: ae.view, addClientIdParameter: !0 }), this.addEventTypeMapping(ae.click, { newEventType: ae.click, addClientIdParameter: !0 }), this.addEventTypeMapping(ae.custom, { newEventType: ae.custom, addClientIdParameter: !0 }), this.addEventTypeMapping(ae.search, { newEventType: ae.search, addClientIdParameter: !0 });
  }
  initRuntime(t) {
    return Ts() && _s() ? new bv(t, () => {
      const n = [...this.bufferedRequests];
      return this.bufferedRequests = [], n;
    }) : (Ev() && console.warn(xv), new Cv(t));
  }
  get storage() {
    return this.runtime.storage;
  }
  determineVisitorId() {
    return P(this, void 0, void 0, function* () {
      try {
        return Ts() && this.extractClientIdFromLink(window.location.href) || (yield this.storage.getItem("visitorId")) || Wi();
      } catch (t) {
        return console.log("Could not get visitor ID from the current runtime environment storage. Using a random ID instead.", t), Wi();
      }
    });
  }
  getCurrentVisitorId() {
    return P(this, void 0, void 0, function* () {
      if (!this.visitorId) {
        const t = yield this.determineVisitorId();
        yield this.setCurrentVisitorId(t);
      }
      return this.visitorId;
    });
  }
  setCurrentVisitorId(t) {
    return P(this, void 0, void 0, function* () {
      this.visitorId = t, yield this.storage.setItem("visitorId", t);
    });
  }
  setClientId(t, n) {
    return P(this, void 0, void 0, function* () {
      if (ei(t))
        this.setCurrentVisitorId(t.toLowerCase());
      else {
        if (!n)
          throw Error("Cannot generate uuid client id without a specific namespace string.");
        this.setCurrentVisitorId(Qa(t, Qa(n, Ov)));
      }
    });
  }
  getParameters(t, ...n) {
    return P(this, void 0, void 0, function* () {
      return yield this.resolveParameters(t, ...n);
    });
  }
  getPayload(t, ...n) {
    return P(this, void 0, void 0, function* () {
      const r = yield this.resolveParameters(t, ...n);
      return yield this.resolvePayloadForParameters(t, r);
    });
  }
  get currentVisitorId() {
    return typeof (this.visitorId || this.storage.getItem("visitorId")) != "string" && this.setCurrentVisitorId(Wi()), this.visitorId;
  }
  set currentVisitorId(t) {
    this.visitorId = t, this.storage.setItem("visitorId", t);
  }
  extractClientIdFromLink(t) {
    if ($s())
      return null;
    try {
      const n = new URL(t).searchParams.get(Mt.cvo_cid);
      if (n == null)
        return null;
      const r = Mt.fromString(n);
      return !r || !_s() || !r.validate(document.referrer, this.acceptedLinkReferrers) ? null : r.clientId;
    } catch {
    }
    return null;
  }
  resolveParameters(t, ...n) {
    return P(this, void 0, void 0, function* () {
      const { variableLengthArgumentsNames: r = [], addVisitorIdParameter: i = !1, usesMeasurementProtocol: s = !1, addClientIdParameter: o = !1 } = this.eventTypeMapping[t] || {};
      return yield [
        (m) => r.length > 0 ? this.parseVariableArgumentsPayload(r, m) : m[0],
        (m) => P(this, void 0, void 0, function* () {
          return Object.assign(Object.assign({}, m), { visitorId: i ? yield this.getCurrentVisitorId() : "" });
        }),
        (m) => P(this, void 0, void 0, function* () {
          return o ? Object.assign(Object.assign({}, m), { clientId: yield this.getCurrentVisitorId() }) : m;
        }),
        (m) => s ? this.ensureAnonymousUserWhenUsingApiKey(m) : m,
        (m) => this.beforeSendHooks.reduce((p, d) => P(this, void 0, void 0, function* () {
          const g = yield p;
          return yield d(t, g);
        }), m)
      ].reduce((m, p) => P(this, void 0, void 0, function* () {
        const d = yield m;
        return yield p(d);
      }), Promise.resolve(n));
    });
  }
  resolvePayloadForParameters(t, n) {
    return P(this, void 0, void 0, function* () {
      const { usesMeasurementProtocol: r = !1 } = this.eventTypeMapping[t] || {};
      return yield [
        (f) => this.setTrackingIdIfTrackingIdNotPresent(f),
        (f) => this.removeEmptyPayloadValues(f, t),
        (f) => this.validateParams(f, t),
        (f) => r ? dv(f) : f,
        (f) => r ? this.removeUnknownParameters(f) : f,
        (f) => r ? this.processCustomParameters(f) : this.mapCustomParametersToCustomData(f)
      ].reduce((f, h) => P(this, void 0, void 0, function* () {
        const m = yield f;
        return yield h(m);
      }), Promise.resolve(n));
    });
  }
  makeEvent(t, ...n) {
    return P(this, void 0, void 0, function* () {
      const { newEventType: r = t } = this.eventTypeMapping[t] || {}, i = yield this.resolveParameters(t, ...n), s = yield this.resolvePayloadForParameters(t, i);
      return {
        eventType: r,
        payload: s,
        log: (o) => P(this, void 0, void 0, function* () {
          return this.bufferedRequests.push({
            eventType: r,
            payload: Object.assign(Object.assign({}, s), o)
          }), yield Promise.all(this.afterSendHooks.map((a) => a(t, Object.assign(Object.assign({}, i), o)))), yield this.deferExecution(), yield this.sendFromBuffer();
        })
      };
    });
  }
  sendEvent(t, ...n) {
    return P(this, void 0, void 0, function* () {
      return (yield this.makeEvent(t, ...n)).log({});
    });
  }
  deferExecution() {
    return new Promise((t) => setTimeout(t, 0));
  }
  sendFromBuffer() {
    return P(this, void 0, void 0, function* () {
      const t = this.bufferedRequests.shift();
      if (t) {
        const { eventType: n, payload: r } = t;
        return this.runtime.getClientDependingOnEventType(n).sendEvent(n, r);
      }
    });
  }
  clear() {
    this.storage.removeItem("visitorId"), new $l().clear();
  }
  deleteHttpOnlyVisitorId() {
    this.runtime.client.deleteHttpCookieVisitorId();
  }
  makeSearchEvent(t) {
    return P(this, void 0, void 0, function* () {
      return this.makeEvent(ae.search, t);
    });
  }
  sendSearchEvent(t) {
    return P(this, void 0, void 0, function* () {
      var { searchQueryUid: n } = t, r = Ke(t, ["searchQueryUid"]);
      return (yield this.makeSearchEvent(r)).log({ searchQueryUid: n });
    });
  }
  makeClickEvent(t) {
    return P(this, void 0, void 0, function* () {
      return this.makeEvent(ae.click, t);
    });
  }
  sendClickEvent(t) {
    return P(this, void 0, void 0, function* () {
      var { searchQueryUid: n } = t, r = Ke(t, ["searchQueryUid"]);
      return (yield this.makeClickEvent(r)).log({ searchQueryUid: n });
    });
  }
  makeCustomEvent(t) {
    return P(this, void 0, void 0, function* () {
      return this.makeEvent(ae.custom, t);
    });
  }
  sendCustomEvent(t) {
    return P(this, void 0, void 0, function* () {
      var { lastSearchQueryUid: n } = t, r = Ke(t, ["lastSearchQueryUid"]);
      return (yield this.makeCustomEvent(r)).log({ lastSearchQueryUid: n });
    });
  }
  makeViewEvent(t) {
    return P(this, void 0, void 0, function* () {
      return this.makeEvent(ae.view, t);
    });
  }
  sendViewEvent(t) {
    return P(this, void 0, void 0, function* () {
      return (yield this.makeViewEvent(t)).log({});
    });
  }
  getVisit() {
    return P(this, void 0, void 0, function* () {
      const n = yield (yield fetch(`${this.baseUrl}/analytics/visit`)).json();
      return this.visitorId = n.visitorId, n;
    });
  }
  getHealth() {
    return P(this, void 0, void 0, function* () {
      return yield (yield fetch(`${this.baseUrl}/analytics/monitoring/health`)).json();
    });
  }
  registerBeforeSendEventHook(t) {
    this.beforeSendHooks.push(t);
  }
  registerAfterSendEventHook(t) {
    this.afterSendHooks.push(t);
  }
  addEventTypeMapping(t, n) {
    this.eventTypeMapping[t] = n;
  }
  setAcceptedLinkReferrers(t) {
    if (Array.isArray(t) && t.every((n) => typeof n == "string"))
      this.acceptedLinkReferrers = t;
    else
      throw Error("Parameter should be an array of domain strings");
  }
  parseVariableArgumentsPayload(t, n) {
    const r = {};
    for (let i = 0, s = n.length; i < s; i++) {
      const o = n[i];
      if (typeof o == "string")
        r[t[i]] = o;
      else if (typeof o == "object")
        return Object.assign(Object.assign({}, r), o);
    }
    return r;
  }
  isKeyAllowedEmpty(t, n) {
    return ({
      [ae.search]: ["queryText"]
    }[t] || []).indexOf(n) !== -1;
  }
  removeEmptyPayloadValues(t, n) {
    const r = (i) => typeof i < "u" && i !== null && i !== "";
    return Object.keys(t).filter((i) => this.isKeyAllowedEmpty(n, i) || r(t[i])).reduce((i, s) => Object.assign(Object.assign({}, i), { [s]: t[s] }), {});
  }
  removeUnknownParameters(t) {
    return Object.keys(t).filter((r) => {
      if (gv(r))
        return !0;
      console.log(r, "is not processed by coveoua");
    }).reduce((r, i) => Object.assign(Object.assign({}, r), { [i]: t[i] }), {});
  }
  processCustomParameters(t) {
    const { custom: n } = t, r = Ke(t, ["custom"]);
    let i = {};
    n && yr(n) && (i = this.lowercaseKeys(n));
    const s = mv(r);
    return Object.assign(Object.assign({}, i), s);
  }
  mapCustomParametersToCustomData(t) {
    const { custom: n } = t, r = Ke(t, ["custom"]);
    if (n && yr(n)) {
      const i = this.lowercaseKeys(n);
      return Object.assign(Object.assign({}, r), { customData: Object.assign(Object.assign({}, i), t.customData) });
    } else
      return t;
  }
  lowercaseKeys(t) {
    const n = Object.keys(t);
    let r = {};
    return n.forEach((i) => {
      r[i.toLowerCase()] = t[i];
    }), r;
  }
  validateParams(t, n) {
    const { anonymizeIp: r } = t, i = Ke(t, ["anonymizeIp"]);
    return r !== void 0 && ["0", "false", "undefined", "null", "{}", "[]", ""].indexOf(`${r}`.toLowerCase()) == -1 && (i.anonymizeIp = 1), (n == ae.view || n == ae.click || n == ae.search || n == ae.custom) && (i.originLevel3 = this.limit(i.originLevel3, 1024)), n == ae.view && (i.location = this.limit(i.location, 1024)), (n == "pageview" || n == "event") && (i.referrer = this.limit(i.referrer, 2048), i.location = this.limit(i.location, 2048), i.page = this.limit(i.page, 2048)), i;
  }
  ensureAnonymousUserWhenUsingApiKey(t) {
    const { userId: n } = t, r = Ke(t, ["userId"]);
    return Av(this.options.token) && !n ? (r.userId = "anonymous", r) : t;
  }
  setTrackingIdIfTrackingIdNotPresent(t) {
    const { trackingId: n } = t, r = Ke(t, ["trackingId"]);
    return n ? t : (r.hasOwnProperty("custom") && yr(r.custom) && (r.custom.hasOwnProperty("context_website") || r.custom.hasOwnProperty("siteName")) && (r.trackingId = r.custom.context_website || r.custom.siteName), r.hasOwnProperty("customData") && yr(r.customData) && (r.customData.hasOwnProperty("context_website") || r.customData.hasOwnProperty("siteName")) && (r.trackingId = r.customData.context_website || r.customData.siteName), r);
  }
  limit(t, n) {
    return typeof t == "string" ? Oy(t, n) : t;
  }
  get baseUrl() {
    return Rv(this.options.endpoint, this.options.version, this.options.isCustomEndpoint);
  }
}
var Ge;
(function(e) {
  e.contextChanged = "contextChanged", e.expandToFullUI = "expandToFullUI", e.openUserActions = "openUserActions", e.showPrecedingSessions = "showPrecedingSessions", e.showFollowingSessions = "showFollowingSessions", e.clickViewedDocument = "clickViewedDocument", e.clickPageView = "clickPageView", e.createArticle = "createArticle";
})(Ge || (Ge = {}));
var V;
(function(e) {
  e.interfaceLoad = "interfaceLoad", e.interfaceChange = "interfaceChange", e.didyoumeanAutomatic = "didyoumeanAutomatic", e.didyoumeanClick = "didyoumeanClick", e.resultsSort = "resultsSort", e.searchboxSubmit = "searchboxSubmit", e.searchboxClear = "searchboxClear", e.searchboxAsYouType = "searchboxAsYouType", e.breadcrumbFacet = "breadcrumbFacet", e.breadcrumbResetAll = "breadcrumbResetAll", e.documentQuickview = "documentQuickview", e.documentOpen = "documentOpen", e.omniboxAnalytics = "omniboxAnalytics", e.omniboxFromLink = "omniboxFromLink", e.searchFromLink = "searchFromLink", e.triggerNotify = "notify", e.triggerExecute = "execute", e.triggerQuery = "query", e.undoTriggerQuery = "undoQuery", e.triggerRedirect = "redirect", e.pagerResize = "pagerResize", e.pagerNumber = "pagerNumber", e.pagerNext = "pagerNext", e.pagerPrevious = "pagerPrevious", e.pagerScrolling = "pagerScrolling", e.staticFilterClearAll = "staticFilterClearAll", e.staticFilterSelect = "staticFilterSelect", e.staticFilterDeselect = "staticFilterDeselect", e.facetClearAll = "facetClearAll", e.facetSearch = "facetSearch", e.facetSelect = "facetSelect", e.facetSelectAll = "facetSelectAll", e.facetDeselect = "facetDeselect", e.facetExclude = "facetExclude", e.facetUnexclude = "facetUnexclude", e.facetUpdateSort = "facetUpdateSort", e.facetShowMore = "showMoreFacetResults", e.facetShowLess = "showLessFacetResults", e.queryError = "query", e.queryErrorBack = "errorBack", e.queryErrorClear = "errorClearQuery", e.queryErrorRetry = "errorRetry", e.recommendation = "recommendation", e.recommendationInterfaceLoad = "recommendationInterfaceLoad", e.recommendationOpen = "recommendationOpen", e.likeSmartSnippet = "likeSmartSnippet", e.dislikeSmartSnippet = "dislikeSmartSnippet", e.expandSmartSnippet = "expandSmartSnippet", e.collapseSmartSnippet = "collapseSmartSnippet", e.openSmartSnippetFeedbackModal = "openSmartSnippetFeedbackModal", e.closeSmartSnippetFeedbackModal = "closeSmartSnippetFeedbackModal", e.sendSmartSnippetReason = "sendSmartSnippetReason", e.expandSmartSnippetSuggestion = "expandSmartSnippetSuggestion", e.collapseSmartSnippetSuggestion = "collapseSmartSnippetSuggestion", e.showMoreSmartSnippetSuggestion = "showMoreSmartSnippetSuggestion", e.showLessSmartSnippetSuggestion = "showLessSmartSnippetSuggestion", e.openSmartSnippetSource = "openSmartSnippetSource", e.openSmartSnippetSuggestionSource = "openSmartSnippetSuggestionSource", e.openSmartSnippetInlineLink = "openSmartSnippetInlineLink", e.openSmartSnippetSuggestionInlineLink = "openSmartSnippetSuggestionInlineLink", e.recentQueryClick = "recentQueriesClick", e.clearRecentQueries = "clearRecentQueries", e.recentResultClick = "recentResultClick", e.clearRecentResults = "clearRecentResults", e.noResultsBack = "noResultsBack", e.showMoreFoldedResults = "showMoreFoldedResults", e.showLessFoldedResults = "showLessFoldedResults", e.copyToClipboard = "copyToClipboard", e.caseSendEmail = "Case.SendEmail", e.feedItemTextPost = "FeedItem.TextPost", e.caseAttach = "caseAttach", e.caseDetach = "caseDetach", e.retryGeneratedAnswer = "retryGeneratedAnswer", e.likeGeneratedAnswer = "likeGeneratedAnswer", e.dislikeGeneratedAnswer = "dislikeGeneratedAnswer", e.openGeneratedAnswerSource = "openGeneratedAnswerSource", e.generatedAnswerOpenInlineLink = "generatedAnswerOpenInlineLink", e.generatedAnswerStreamEnd = "generatedAnswerStreamEnd", e.generatedAnswerSourceHover = "generatedAnswerSourceHover", e.generatedAnswerCopyToClipboard = "generatedAnswerCopyToClipboard", e.generatedAnswerHideAnswers = "generatedAnswerHideAnswers", e.generatedAnswerShowAnswers = "generatedAnswerShowAnswers", e.generatedAnswerExpand = "generatedAnswerExpand", e.generatedAnswerCollapse = "generatedAnswerCollapse", e.generatedAnswerFeedbackSubmit = "generatedAnswerFeedbackSubmit", e.rephraseGeneratedAnswer = "rephraseGeneratedAnswer", e.generatedAnswerFeedbackSubmitV2 = "generatedAnswerFeedbackSubmitV2", e.generatedAnswerCitationClick = "generatedAnswerCitationClick", e.generatedAnswerFollowupOpenSource = "generatedAnswerFollowupOpenSource", e.generatedAnswerCitationDocumentAttach = "generatedAnswerCitationDocumentAttach";
})(V || (V = {}));
const Ga = {
  [V.triggerNotify]: "queryPipelineTriggers",
  [V.triggerExecute]: "queryPipelineTriggers",
  [V.triggerQuery]: "queryPipelineTriggers",
  [V.triggerRedirect]: "queryPipelineTriggers",
  [V.queryErrorBack]: "errors",
  [V.queryErrorClear]: "errors",
  [V.queryErrorRetry]: "errors",
  [V.pagerNext]: "getMoreResults",
  [V.pagerPrevious]: "getMoreResults",
  [V.pagerNumber]: "getMoreResults",
  [V.pagerResize]: "getMoreResults",
  [V.pagerScrolling]: "getMoreResults",
  [V.facetSearch]: "facet",
  [V.facetShowLess]: "facet",
  [V.facetShowMore]: "facet",
  [V.recommendation]: "recommendation",
  [V.likeSmartSnippet]: "smartSnippet",
  [V.dislikeSmartSnippet]: "smartSnippet",
  [V.expandSmartSnippet]: "smartSnippet",
  [V.collapseSmartSnippet]: "smartSnippet",
  [V.openSmartSnippetFeedbackModal]: "smartSnippet",
  [V.closeSmartSnippetFeedbackModal]: "smartSnippet",
  [V.sendSmartSnippetReason]: "smartSnippet",
  [V.expandSmartSnippetSuggestion]: "smartSnippetSuggestions",
  [V.collapseSmartSnippetSuggestion]: "smartSnippetSuggestions",
  [V.showMoreSmartSnippetSuggestion]: "smartSnippetSuggestions",
  [V.showLessSmartSnippetSuggestion]: "smartSnippetSuggestions",
  [V.clearRecentQueries]: "recentQueries",
  [V.recentResultClick]: "recentlyClickedDocuments",
  [V.clearRecentResults]: "recentlyClickedDocuments",
  [V.showLessFoldedResults]: "folding",
  [V.caseDetach]: "case",
  [V.likeGeneratedAnswer]: "generatedAnswer",
  [V.dislikeGeneratedAnswer]: "generatedAnswer",
  [V.openGeneratedAnswerSource]: "generatedAnswer",
  [V.generatedAnswerOpenInlineLink]: "generatedAnswer",
  [V.generatedAnswerFollowupOpenSource]: "generatedAnswer",
  [V.generatedAnswerStreamEnd]: "generatedAnswer",
  [V.generatedAnswerSourceHover]: "generatedAnswer",
  [V.generatedAnswerCopyToClipboard]: "generatedAnswer",
  [V.generatedAnswerHideAnswers]: "generatedAnswer",
  [V.generatedAnswerShowAnswers]: "generatedAnswer",
  [V.generatedAnswerExpand]: "generatedAnswer",
  [V.generatedAnswerCollapse]: "generatedAnswer",
  [V.generatedAnswerFeedbackSubmit]: "generatedAnswer",
  [V.generatedAnswerFeedbackSubmitV2]: "generatedAnswer",
  [Ge.expandToFullUI]: "interface",
  [Ge.openUserActions]: "User Actions",
  [Ge.showPrecedingSessions]: "User Actions",
  [Ge.showFollowingSessions]: "User Actions",
  [Ge.clickViewedDocument]: "User Actions",
  [Ge.clickPageView]: "User Actions",
  [Ge.createArticle]: "createArticle"
};
class Ja {
  constructor() {
    this.runtime = new Hl(), this.currentVisitorId = "";
  }
  getPayload() {
    return Promise.resolve();
  }
  getParameters() {
    return Promise.resolve();
  }
  makeEvent(t) {
    return Promise.resolve({ eventType: t, payload: null, log: () => Promise.resolve() });
  }
  sendEvent() {
    return Promise.resolve();
  }
  makeSearchEvent() {
    return this.makeEvent(ae.search);
  }
  sendSearchEvent() {
    return Promise.resolve();
  }
  makeClickEvent() {
    return this.makeEvent(ae.click);
  }
  sendClickEvent() {
    return Promise.resolve();
  }
  makeCustomEvent() {
    return this.makeEvent(ae.custom);
  }
  sendCustomEvent() {
    return Promise.resolve();
  }
  makeViewEvent() {
    return this.makeEvent(ae.view);
  }
  sendViewEvent() {
    return Promise.resolve();
  }
  getVisit() {
    return Promise.resolve({ id: "", visitorId: "" });
  }
  getHealth() {
    return Promise.resolve({ status: "" });
  }
  registerBeforeSendEventHook() {
  }
  registerAfterSendEventHook() {
  }
  addEventTypeMapping() {
  }
  get version() {
    return Ll;
  }
}
function qv(e) {
  let t = "";
  return e.filter((n) => {
    const r = n !== t;
    return t = n, r;
  });
}
function Fv(e) {
  return e.map((t) => t.replace(/;/g, ""));
}
function Kl(e) {
  const n = e.join(";");
  return n.length <= 256 ? n : Kl(e.slice(1));
}
const Za = (e) => {
  const t = Fv(e), n = qv(t);
  return Kl(n);
};
function Xa(e) {
  const t = typeof e.partialQueries == "string" ? e.partialQueries : Za(e.partialQueries), n = typeof e.suggestions == "string" ? e.suggestions : Za(e.suggestions);
  return Object.assign(Object.assign({}, e), {
    partialQueries: t,
    suggestions: n
  });
}
class Dv {
  constructor(t, n) {
    this.opts = t, this.provider = n;
    const r = t.enableAnalytics === !1 || $s();
    this.coveoAnalyticsClient = r ? new Ja() : new _r(t);
  }
  disable() {
    this.coveoAnalyticsClient = new Ja();
  }
  enable() {
    this.coveoAnalyticsClient = new _r(this.opts);
  }
  makeInterfaceLoad() {
    return this.makeSearchEvent(V.interfaceLoad);
  }
  logInterfaceLoad() {
    return P(this, void 0, void 0, function* () {
      return (yield this.makeInterfaceLoad()).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeRecommendationInterfaceLoad() {
    return this.makeSearchEvent(V.recommendationInterfaceLoad);
  }
  logRecommendationInterfaceLoad() {
    return P(this, void 0, void 0, function* () {
      return (yield this.makeRecommendationInterfaceLoad()).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeRecommendation() {
    return this.makeCustomEvent(V.recommendation);
  }
  logRecommendation() {
    return P(this, void 0, void 0, function* () {
      return (yield this.makeRecommendation()).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeRecommendationOpen(t, n) {
    return this.makeClickEvent(V.recommendationOpen, t, n);
  }
  logRecommendationOpen(t, n) {
    return P(this, void 0, void 0, function* () {
      return (yield this.makeRecommendationOpen(t, n)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeStaticFilterClearAll(t) {
    return this.makeSearchEvent(V.staticFilterClearAll, t);
  }
  logStaticFilterClearAll(t) {
    return P(this, void 0, void 0, function* () {
      return (yield this.makeStaticFilterClearAll(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeStaticFilterSelect(t) {
    return this.makeSearchEvent(V.staticFilterSelect, t);
  }
  logStaticFilterSelect(t) {
    return P(this, void 0, void 0, function* () {
      return (yield this.makeStaticFilterSelect(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeStaticFilterDeselect(t) {
    return this.makeSearchEvent(V.staticFilterDeselect, t);
  }
  logStaticFilterDeselect(t) {
    return P(this, void 0, void 0, function* () {
      return (yield this.makeStaticFilterDeselect(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeFetchMoreResults() {
    return this.makeCustomEvent(V.pagerScrolling, { type: "getMoreResults" });
  }
  logFetchMoreResults() {
    return P(this, void 0, void 0, function* () {
      return (yield this.makeFetchMoreResults()).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeInterfaceChange(t) {
    return this.makeSearchEvent(V.interfaceChange, t);
  }
  logInterfaceChange(t) {
    return P(this, void 0, void 0, function* () {
      return (yield this.makeInterfaceChange(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeDidYouMeanAutomatic() {
    return this.makeSearchEvent(V.didyoumeanAutomatic);
  }
  logDidYouMeanAutomatic() {
    return P(this, void 0, void 0, function* () {
      return (yield this.makeDidYouMeanAutomatic()).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeDidYouMeanClick() {
    return this.makeSearchEvent(V.didyoumeanClick);
  }
  logDidYouMeanClick() {
    return P(this, void 0, void 0, function* () {
      return (yield this.makeDidYouMeanClick()).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeResultsSort(t) {
    return this.makeSearchEvent(V.resultsSort, t);
  }
  logResultsSort(t) {
    return P(this, void 0, void 0, function* () {
      return (yield this.makeResultsSort(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeSearchboxSubmit() {
    return this.makeSearchEvent(V.searchboxSubmit);
  }
  logSearchboxSubmit() {
    return P(this, void 0, void 0, function* () {
      return (yield this.makeSearchboxSubmit()).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeSearchboxClear() {
    return this.makeSearchEvent(V.searchboxClear);
  }
  logSearchboxClear() {
    return P(this, void 0, void 0, function* () {
      return (yield this.makeSearchboxClear()).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeSearchboxAsYouType() {
    return this.makeSearchEvent(V.searchboxAsYouType);
  }
  logSearchboxAsYouType() {
    return P(this, void 0, void 0, function* () {
      return (yield this.makeSearchboxAsYouType()).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeBreadcrumbFacet(t) {
    return this.makeSearchEvent(V.breadcrumbFacet, t);
  }
  logBreadcrumbFacet(t) {
    return P(this, void 0, void 0, function* () {
      return (yield this.makeBreadcrumbFacet(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeBreadcrumbResetAll() {
    return this.makeSearchEvent(V.breadcrumbResetAll);
  }
  logBreadcrumbResetAll() {
    return P(this, void 0, void 0, function* () {
      return (yield this.makeBreadcrumbResetAll()).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeDocumentQuickview(t, n) {
    return this.makeClickEvent(V.documentQuickview, t, n);
  }
  logDocumentQuickview(t, n) {
    return P(this, void 0, void 0, function* () {
      return (yield this.makeDocumentQuickview(t, n)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeDocumentOpen(t, n) {
    return this.makeClickEvent(V.documentOpen, t, n);
  }
  logDocumentOpen(t, n) {
    return P(this, void 0, void 0, function* () {
      return (yield this.makeDocumentOpen(t, n)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeOmniboxAnalytics(t) {
    return this.makeSearchEvent(V.omniboxAnalytics, Xa(t));
  }
  logOmniboxAnalytics(t) {
    return P(this, void 0, void 0, function* () {
      return (yield this.makeOmniboxAnalytics(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeOmniboxFromLink(t) {
    return this.makeSearchEvent(V.omniboxFromLink, Xa(t));
  }
  logOmniboxFromLink(t) {
    return P(this, void 0, void 0, function* () {
      return (yield this.makeOmniboxFromLink(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeSearchFromLink() {
    return this.makeSearchEvent(V.searchFromLink);
  }
  logSearchFromLink() {
    return P(this, void 0, void 0, function* () {
      return (yield this.makeSearchFromLink()).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeTriggerNotify(t) {
    return this.makeCustomEvent(V.triggerNotify, t);
  }
  logTriggerNotify(t) {
    return P(this, void 0, void 0, function* () {
      return (yield this.makeTriggerNotify(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeTriggerExecute(t) {
    return this.makeCustomEvent(V.triggerExecute, t);
  }
  logTriggerExecute(t) {
    return P(this, void 0, void 0, function* () {
      return (yield this.makeTriggerExecute(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeTriggerQuery() {
    return this.makeCustomEvent(V.triggerQuery, { query: this.provider.getSearchEventRequestPayload().queryText }, "queryPipelineTriggers");
  }
  logTriggerQuery() {
    return P(this, void 0, void 0, function* () {
      return (yield this.makeTriggerQuery()).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeUndoTriggerQuery(t) {
    return this.makeSearchEvent(V.undoTriggerQuery, t);
  }
  logUndoTriggerQuery(t) {
    return P(this, void 0, void 0, function* () {
      return (yield this.makeUndoTriggerQuery(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeTriggerRedirect(t) {
    return this.makeCustomEvent(V.triggerRedirect, Object.assign(Object.assign({}, t), { query: this.provider.getSearchEventRequestPayload().queryText }));
  }
  logTriggerRedirect(t) {
    return P(this, void 0, void 0, function* () {
      return (yield this.makeTriggerRedirect(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makePagerResize(t) {
    return this.makeCustomEvent(V.pagerResize, t);
  }
  logPagerResize(t) {
    return P(this, void 0, void 0, function* () {
      return (yield this.makePagerResize(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makePagerNumber(t) {
    return this.makeCustomEvent(V.pagerNumber, t);
  }
  logPagerNumber(t) {
    return P(this, void 0, void 0, function* () {
      return (yield this.makePagerNumber(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makePagerNext(t) {
    return this.makeCustomEvent(V.pagerNext, t);
  }
  logPagerNext(t) {
    return P(this, void 0, void 0, function* () {
      return (yield this.makePagerNext(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makePagerPrevious(t) {
    return this.makeCustomEvent(V.pagerPrevious, t);
  }
  logPagerPrevious(t) {
    return P(this, void 0, void 0, function* () {
      return (yield this.makePagerPrevious(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makePagerScrolling() {
    return this.makeCustomEvent(V.pagerScrolling);
  }
  logPagerScrolling() {
    return P(this, void 0, void 0, function* () {
      return (yield this.makePagerScrolling()).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeFacetClearAll(t) {
    return this.makeSearchEvent(V.facetClearAll, t);
  }
  logFacetClearAll(t) {
    return P(this, void 0, void 0, function* () {
      return (yield this.makeFacetClearAll(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeFacetSearch(t) {
    return this.makeSearchEvent(V.facetSearch, t);
  }
  logFacetSearch(t) {
    return P(this, void 0, void 0, function* () {
      return (yield this.makeFacetSearch(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeFacetSelect(t) {
    return this.makeSearchEvent(V.facetSelect, t);
  }
  logFacetSelect(t) {
    return P(this, void 0, void 0, function* () {
      return (yield this.makeFacetSelect(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeFacetDeselect(t) {
    return this.makeSearchEvent(V.facetDeselect, t);
  }
  logFacetDeselect(t) {
    return P(this, void 0, void 0, function* () {
      return (yield this.makeFacetDeselect(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeFacetExclude(t) {
    return this.makeSearchEvent(V.facetExclude, t);
  }
  logFacetExclude(t) {
    return P(this, void 0, void 0, function* () {
      return (yield this.makeFacetExclude(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeFacetUnexclude(t) {
    return this.makeSearchEvent(V.facetUnexclude, t);
  }
  logFacetUnexclude(t) {
    return P(this, void 0, void 0, function* () {
      return (yield this.makeFacetUnexclude(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeFacetSelectAll(t) {
    return this.makeSearchEvent(V.facetSelectAll, t);
  }
  logFacetSelectAll(t) {
    return P(this, void 0, void 0, function* () {
      return (yield this.makeFacetSelectAll(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeFacetUpdateSort(t) {
    return this.makeSearchEvent(V.facetUpdateSort, t);
  }
  logFacetUpdateSort(t) {
    return P(this, void 0, void 0, function* () {
      return (yield this.makeFacetUpdateSort(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeFacetShowMore(t) {
    return this.makeCustomEvent(V.facetShowMore, t);
  }
  logFacetShowMore(t) {
    return P(this, void 0, void 0, function* () {
      return (yield this.makeFacetShowMore(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeFacetShowLess(t) {
    return this.makeCustomEvent(V.facetShowLess, t);
  }
  logFacetShowLess(t) {
    return P(this, void 0, void 0, function* () {
      return (yield this.makeFacetShowLess(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeQueryError(t) {
    return this.makeCustomEvent(V.queryError, t);
  }
  logQueryError(t) {
    return P(this, void 0, void 0, function* () {
      return (yield this.makeQueryError(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeQueryErrorBack() {
    return P(this, void 0, void 0, function* () {
      const t = yield this.makeCustomEvent(V.queryErrorBack);
      return {
        description: t.description,
        log: () => P(this, void 0, void 0, function* () {
          return yield t.log({ searchUID: this.provider.getSearchUID() }), this.logSearchEvent(V.queryErrorBack);
        })
      };
    });
  }
  logQueryErrorBack() {
    return P(this, void 0, void 0, function* () {
      return (yield this.makeQueryErrorBack()).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeQueryErrorRetry() {
    return P(this, void 0, void 0, function* () {
      const t = yield this.makeCustomEvent(V.queryErrorRetry);
      return {
        description: t.description,
        log: () => P(this, void 0, void 0, function* () {
          return yield t.log({ searchUID: this.provider.getSearchUID() }), this.logSearchEvent(V.queryErrorRetry);
        })
      };
    });
  }
  logQueryErrorRetry() {
    return P(this, void 0, void 0, function* () {
      return (yield this.makeQueryErrorRetry()).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeQueryErrorClear() {
    return P(this, void 0, void 0, function* () {
      const t = yield this.makeCustomEvent(V.queryErrorClear);
      return {
        description: t.description,
        log: () => P(this, void 0, void 0, function* () {
          return yield t.log({ searchUID: this.provider.getSearchUID() }), this.logSearchEvent(V.queryErrorClear);
        })
      };
    });
  }
  logQueryErrorClear() {
    return P(this, void 0, void 0, function* () {
      return (yield this.makeQueryErrorClear()).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeLikeSmartSnippet() {
    return this.makeCustomEvent(V.likeSmartSnippet);
  }
  logLikeSmartSnippet() {
    return P(this, void 0, void 0, function* () {
      return (yield this.makeLikeSmartSnippet()).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeDislikeSmartSnippet() {
    return this.makeCustomEvent(V.dislikeSmartSnippet);
  }
  logDislikeSmartSnippet() {
    return P(this, void 0, void 0, function* () {
      return (yield this.makeDislikeSmartSnippet()).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeExpandSmartSnippet() {
    return this.makeCustomEvent(V.expandSmartSnippet);
  }
  logExpandSmartSnippet() {
    return P(this, void 0, void 0, function* () {
      return (yield this.makeExpandSmartSnippet()).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeCollapseSmartSnippet() {
    return this.makeCustomEvent(V.collapseSmartSnippet);
  }
  logCollapseSmartSnippet() {
    return P(this, void 0, void 0, function* () {
      return (yield this.makeCollapseSmartSnippet()).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeOpenSmartSnippetFeedbackModal() {
    return this.makeCustomEvent(V.openSmartSnippetFeedbackModal);
  }
  logOpenSmartSnippetFeedbackModal() {
    return P(this, void 0, void 0, function* () {
      return (yield this.makeOpenSmartSnippetFeedbackModal()).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeCloseSmartSnippetFeedbackModal() {
    return this.makeCustomEvent(V.closeSmartSnippetFeedbackModal);
  }
  logCloseSmartSnippetFeedbackModal() {
    return P(this, void 0, void 0, function* () {
      return (yield this.makeCloseSmartSnippetFeedbackModal()).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeSmartSnippetFeedbackReason(t, n) {
    return this.makeCustomEvent(V.sendSmartSnippetReason, { reason: t, details: n });
  }
  logSmartSnippetFeedbackReason(t, n) {
    return P(this, void 0, void 0, function* () {
      return (yield this.makeSmartSnippetFeedbackReason(t, n)).log({
        searchUID: this.provider.getSearchUID()
      });
    });
  }
  makeExpandSmartSnippetSuggestion(t) {
    return this.makeCustomEvent(V.expandSmartSnippetSuggestion, "documentId" in t ? t : { documentId: t });
  }
  logExpandSmartSnippetSuggestion(t) {
    return P(this, void 0, void 0, function* () {
      return (yield this.makeExpandSmartSnippetSuggestion(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeCollapseSmartSnippetSuggestion(t) {
    return this.makeCustomEvent(V.collapseSmartSnippetSuggestion, "documentId" in t ? t : { documentId: t });
  }
  logCollapseSmartSnippetSuggestion(t) {
    return P(this, void 0, void 0, function* () {
      return (yield this.makeCollapseSmartSnippetSuggestion(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeShowMoreSmartSnippetSuggestion(t) {
    return this.makeCustomEvent(V.showMoreSmartSnippetSuggestion, t);
  }
  logShowMoreSmartSnippetSuggestion(t) {
    return P(this, void 0, void 0, function* () {
      return (yield this.makeShowMoreSmartSnippetSuggestion(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeShowLessSmartSnippetSuggestion(t) {
    return this.makeCustomEvent(V.showLessSmartSnippetSuggestion, t);
  }
  logShowLessSmartSnippetSuggestion(t) {
    return P(this, void 0, void 0, function* () {
      return (yield this.makeShowLessSmartSnippetSuggestion(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeOpenSmartSnippetSource(t, n) {
    return this.makeClickEvent(V.openSmartSnippetSource, t, n);
  }
  logOpenSmartSnippetSource(t, n) {
    return P(this, void 0, void 0, function* () {
      return (yield this.makeOpenSmartSnippetSource(t, n)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeOpenSmartSnippetSuggestionSource(t, n) {
    return this.makeClickEvent(V.openSmartSnippetSuggestionSource, t, { contentIDKey: n.documentId.contentIdKey, contentIDValue: n.documentId.contentIdValue }, n);
  }
  makeCopyToClipboard(t, n) {
    return this.makeClickEvent(V.copyToClipboard, t, n);
  }
  logCopyToClipboard(t, n) {
    return P(this, void 0, void 0, function* () {
      return (yield this.makeCopyToClipboard(t, n)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  logOpenSmartSnippetSuggestionSource(t, n) {
    return P(this, void 0, void 0, function* () {
      return (yield this.makeOpenSmartSnippetSuggestionSource(t, n)).log({
        searchUID: this.provider.getSearchUID()
      });
    });
  }
  makeOpenSmartSnippetInlineLink(t, n) {
    return this.makeClickEvent(V.openSmartSnippetInlineLink, t, { contentIDKey: n.contentIDKey, contentIDValue: n.contentIDValue }, n);
  }
  logOpenSmartSnippetInlineLink(t, n) {
    return P(this, void 0, void 0, function* () {
      return (yield this.makeOpenSmartSnippetInlineLink(t, n)).log({
        searchUID: this.provider.getSearchUID()
      });
    });
  }
  makeOpenSmartSnippetSuggestionInlineLink(t, n) {
    return this.makeClickEvent(V.openSmartSnippetSuggestionInlineLink, t, {
      contentIDKey: n.documentId.contentIdKey,
      contentIDValue: n.documentId.contentIdValue
    }, n);
  }
  logOpenSmartSnippetSuggestionInlineLink(t, n) {
    return P(this, void 0, void 0, function* () {
      return (yield this.makeOpenSmartSnippetSuggestionInlineLink(t, n)).log({
        searchUID: this.provider.getSearchUID()
      });
    });
  }
  makeRecentQueryClick() {
    return this.makeSearchEvent(V.recentQueryClick);
  }
  logRecentQueryClick() {
    return P(this, void 0, void 0, function* () {
      return (yield this.makeRecentQueryClick()).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeClearRecentQueries() {
    return this.makeCustomEvent(V.clearRecentQueries);
  }
  logClearRecentQueries() {
    return P(this, void 0, void 0, function* () {
      return (yield this.makeClearRecentQueries()).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeRecentResultClick(t, n) {
    return this.makeCustomEvent(V.recentResultClick, { info: t, identifier: n });
  }
  logRecentResultClick(t, n) {
    return P(this, void 0, void 0, function* () {
      return (yield this.makeRecentResultClick(t, n)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeClearRecentResults() {
    return this.makeCustomEvent(V.clearRecentResults);
  }
  logClearRecentResults() {
    return P(this, void 0, void 0, function* () {
      return (yield this.makeClearRecentResults()).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeNoResultsBack() {
    return this.makeSearchEvent(V.noResultsBack);
  }
  logNoResultsBack() {
    return P(this, void 0, void 0, function* () {
      return (yield this.makeNoResultsBack()).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeShowMoreFoldedResults(t, n) {
    return this.makeClickEvent(V.showMoreFoldedResults, t, n);
  }
  logShowMoreFoldedResults(t, n) {
    return P(this, void 0, void 0, function* () {
      return (yield this.makeShowMoreFoldedResults(t, n)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeShowLessFoldedResults() {
    return this.makeCustomEvent(V.showLessFoldedResults);
  }
  logShowLessFoldedResults() {
    return P(this, void 0, void 0, function* () {
      return (yield this.makeShowLessFoldedResults()).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeEventDescription(t, n) {
    var r;
    return { actionCause: n, customData: (r = t.payload) === null || r === void 0 ? void 0 : r.customData };
  }
  makeCustomEvent(t, n) {
    return P(this, arguments, void 0, function* (r, i, s = Ga[r]) {
      this.coveoAnalyticsClient.getParameters;
      const o = Object.assign(Object.assign({}, this.provider.getBaseMetadata()), i), a = Object.assign(Object.assign({}, yield this.getBaseEventRequest(o)), { eventType: s, eventValue: r }), c = yield this.coveoAnalyticsClient.makeCustomEvent(a);
      return {
        description: this.makeEventDescription(c, r),
        log: ({ searchUID: u }) => c.log({ lastSearchQueryUid: u })
      };
    });
  }
  logCustomEvent(t, n) {
    return P(this, arguments, void 0, function* (r, i, s = Ga[r]) {
      return (yield this.makeCustomEvent(r, i, s)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeCustomEventWithType(t, n, r) {
    return P(this, void 0, void 0, function* () {
      const i = Object.assign(Object.assign({}, this.provider.getBaseMetadata()), r), s = Object.assign(Object.assign({}, yield this.getBaseEventRequest(i)), {
        eventType: n,
        eventValue: t
      }), o = yield this.coveoAnalyticsClient.makeCustomEvent(s);
      return {
        description: this.makeEventDescription(o, t),
        log: ({ searchUID: a }) => o.log({ lastSearchQueryUid: a })
      };
    });
  }
  logCustomEventWithType(t, n, r) {
    return P(this, void 0, void 0, function* () {
      return (yield this.makeCustomEventWithType(t, n, r)).log({
        searchUID: this.provider.getSearchUID()
      });
    });
  }
  logSearchEvent(t, n) {
    return P(this, void 0, void 0, function* () {
      return (yield this.makeSearchEvent(t, n)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeSearchEvent(t, n) {
    return P(this, void 0, void 0, function* () {
      const r = yield this.getBaseSearchEventRequest(t, n), i = yield this.coveoAnalyticsClient.makeSearchEvent(r);
      return {
        description: this.makeEventDescription(i, t),
        log: ({ searchUID: s }) => i.log({ searchQueryUid: s })
      };
    });
  }
  makeClickEvent(t, n, r, i) {
    return P(this, void 0, void 0, function* () {
      const s = Object.assign(Object.assign(Object.assign({}, n), yield this.getBaseEventRequest(Object.assign(Object.assign({}, r), i))), { queryPipeline: this.provider.getPipeline(), actionCause: t }), o = yield this.coveoAnalyticsClient.makeClickEvent(s);
      return {
        description: this.makeEventDescription(o, t),
        log: ({ searchUID: a }) => o.log({ searchQueryUid: a })
      };
    });
  }
  logClickEvent(t, n, r, i) {
    return P(this, void 0, void 0, function* () {
      return (yield this.makeClickEvent(t, n, r, i)).log({
        searchUID: this.provider.getSearchUID()
      });
    });
  }
  getBaseSearchEventRequest(t, n) {
    return P(this, void 0, void 0, function* () {
      var r, i;
      return Object.assign(Object.assign(Object.assign({}, yield this.getBaseEventRequest(Object.assign(Object.assign({}, n), (i = (r = this.provider).getGeneratedAnswerMetadata) === null || i === void 0 ? void 0 : i.call(r)))), this.provider.getSearchEventRequestPayload()), { queryPipeline: this.provider.getPipeline(), actionCause: t });
    });
  }
  getBaseEventRequest(t) {
    return P(this, void 0, void 0, function* () {
      const n = Object.assign(Object.assign({}, this.provider.getBaseMetadata()), t);
      return Object.assign(Object.assign(Object.assign({}, this.getOrigins()), this.getSplitTestRun()), { customData: n, language: this.provider.getLanguage(), facetState: this.provider.getFacetState ? this.provider.getFacetState() : [], anonymous: this.provider.getIsAnonymous(), clientId: yield this.getClientId() });
    });
  }
  getOrigins() {
    var t, n;
    return {
      originContext: (n = (t = this.provider).getOriginContext) === null || n === void 0 ? void 0 : n.call(t),
      originLevel1: this.provider.getOriginLevel1(),
      originLevel2: this.provider.getOriginLevel2(),
      originLevel3: this.provider.getOriginLevel3()
    };
  }
  getClientId() {
    return this.coveoAnalyticsClient instanceof _r ? this.coveoAnalyticsClient.getCurrentVisitorId() : void 0;
  }
  getSplitTestRun() {
    const t = this.provider.getSplitTestRunName ? this.provider.getSplitTestRunName() : "", n = this.provider.getSplitTestRunVersion ? this.provider.getSplitTestRunVersion() : "";
    return Object.assign(Object.assign({}, t && { splitTestRunName: t }), n && { splitTestRunVersion: n });
  }
  makeLikeGeneratedAnswer(t) {
    return this.makeCustomEvent(V.likeGeneratedAnswer, t);
  }
  logLikeGeneratedAnswer(t) {
    return P(this, void 0, void 0, function* () {
      return (yield this.makeLikeGeneratedAnswer(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeDislikeGeneratedAnswer(t) {
    return this.makeCustomEvent(V.dislikeGeneratedAnswer, t);
  }
  logDislikeGeneratedAnswer(t) {
    return P(this, void 0, void 0, function* () {
      return (yield this.makeDislikeGeneratedAnswer(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeOpenGeneratedAnswerSource(t) {
    return this.makeCustomEvent(V.openGeneratedAnswerSource, t);
  }
  logOpenGeneratedAnswerSource(t) {
    return P(this, void 0, void 0, function* () {
      return (yield this.makeOpenGeneratedAnswerSource(t)).log({
        searchUID: this.provider.getSearchUID()
      });
    });
  }
  makeGeneratedAnswerOpenInlineLink(t) {
    return this.makeCustomEvent(V.generatedAnswerOpenInlineLink, t);
  }
  logGeneratedAnswerOpenInlineLink(t) {
    return P(this, void 0, void 0, function* () {
      return (yield this.makeGeneratedAnswerOpenInlineLink(t)).log({
        searchUID: this.provider.getSearchUID()
      });
    });
  }
  makeGeneratedAnswerCitationClick(t, n) {
    return this.makeClickEvent(V.generatedAnswerCitationClick, Object.assign(Object.assign({}, t), { documentPosition: 1 }), { contentIDKey: n.documentId.contentIdKey, contentIDValue: n.documentId.contentIdValue }, n);
  }
  logGeneratedAnswerCitationClick(t, n) {
    return P(this, void 0, void 0, function* () {
      return (yield this.makeGeneratedAnswerCitationClick(t, n)).log({
        searchUID: this.provider.getSearchUID()
      });
    });
  }
  makeGeneratedAnswerFollowupOpenSource(t) {
    return this.makeCustomEvent(V.generatedAnswerFollowupOpenSource, t);
  }
  logGeneratedAnswerFollowupOpenSource(t) {
    return P(this, void 0, void 0, function* () {
      return (yield this.makeGeneratedAnswerFollowupOpenSource(t)).log({
        searchUID: this.provider.getSearchUID()
      });
    });
  }
  makeGeneratedAnswerSourceHover(t) {
    return this.makeCustomEvent(V.generatedAnswerSourceHover, t);
  }
  logGeneratedAnswerSourceHover(t) {
    return P(this, void 0, void 0, function* () {
      return (yield this.makeGeneratedAnswerSourceHover(t)).log({
        searchUID: this.provider.getSearchUID()
      });
    });
  }
  makeGeneratedAnswerCopyToClipboard(t) {
    return this.makeCustomEvent(V.generatedAnswerCopyToClipboard, t);
  }
  logGeneratedAnswerCopyToClipboard(t) {
    return P(this, void 0, void 0, function* () {
      return (yield this.makeGeneratedAnswerCopyToClipboard(t)).log({
        searchUID: this.provider.getSearchUID()
      });
    });
  }
  makeGeneratedAnswerHideAnswers(t) {
    return this.makeCustomEvent(V.generatedAnswerHideAnswers, t);
  }
  logGeneratedAnswerHideAnswers(t) {
    return P(this, void 0, void 0, function* () {
      return (yield this.makeGeneratedAnswerHideAnswers(t)).log({
        searchUID: this.provider.getSearchUID()
      });
    });
  }
  makeGeneratedAnswerShowAnswers(t) {
    return this.makeCustomEvent(V.generatedAnswerShowAnswers, t);
  }
  logGeneratedAnswerShowAnswers(t) {
    return P(this, void 0, void 0, function* () {
      return (yield this.makeGeneratedAnswerShowAnswers(t)).log({
        searchUID: this.provider.getSearchUID()
      });
    });
  }
  makeGeneratedAnswerExpand(t) {
    return this.makeCustomEvent(V.generatedAnswerExpand, t);
  }
  logGeneratedAnswerExpand(t) {
    return P(this, void 0, void 0, function* () {
      return (yield this.makeGeneratedAnswerExpand(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeGeneratedAnswerCollapse(t) {
    return this.makeCustomEvent(V.generatedAnswerCollapse, t);
  }
  logGeneratedAnswerCollapse(t) {
    return P(this, void 0, void 0, function* () {
      return (yield this.makeGeneratedAnswerCollapse(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeGeneratedAnswerFeedbackSubmit(t) {
    return this.makeCustomEvent(V.generatedAnswerFeedbackSubmit, t);
  }
  logGeneratedAnswerFeedbackSubmit(t) {
    return P(this, void 0, void 0, function* () {
      return (yield this.makeGeneratedAnswerFeedbackSubmit(t)).log({
        searchUID: this.provider.getSearchUID()
      });
    });
  }
  makeGeneratedAnswerFeedbackSubmitV2(t) {
    return this.makeCustomEvent(V.generatedAnswerFeedbackSubmitV2, t);
  }
  logGeneratedAnswerFeedbackSubmitV2(t) {
    return P(this, void 0, void 0, function* () {
      return (yield this.makeGeneratedAnswerFeedbackSubmitV2(t)).log({
        searchUID: this.provider.getSearchUID()
      });
    });
  }
  makeRephraseGeneratedAnswer(t) {
    return this.makeSearchEvent(V.rephraseGeneratedAnswer, t);
  }
  logRephraseGeneratedAnswer(t) {
    return P(this, void 0, void 0, function* () {
      return (yield this.makeRephraseGeneratedAnswer(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeRetryGeneratedAnswer() {
    return this.makeSearchEvent(V.retryGeneratedAnswer);
  }
  logRetryGeneratedAnswer() {
    return P(this, void 0, void 0, function* () {
      return (yield this.makeRetryGeneratedAnswer()).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeGeneratedAnswerStreamEnd(t) {
    return this.makeCustomEvent(V.generatedAnswerStreamEnd, t);
  }
  logGeneratedAnswerStreamEnd(t) {
    return P(this, void 0, void 0, function* () {
      return (yield this.makeGeneratedAnswerStreamEnd(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
}
const ec = Object.assign({}, ky);
Object.keys(ec).map((e) => ec[e]);
var tc;
(function(e) {
  e.click = "click", e.flowStart = "flowStart";
})(tc || (tc = {}));
var nc;
(function(e) {
  e.enterInterface = "ticket_create_start", e.fieldUpdate = "ticket_field_update", e.fieldSuggestionClick = "ticket_classification_click", e.documentSuggestionClick = "documentSuggestionClick", e.documentSuggestionQuickview = "documentSuggestionQuickview", e.suggestionRate = "suggestion_rate", e.nextCaseStep = "ticket_next_stage", e.caseCancelled = "ticket_cancel", e.caseSolved = "ticket_cancel", e.caseCreated = "ticket_create";
})(nc || (nc = {}));
var rc;
(function(e) {
  e.quit = "Quit", e.solved = "Solved";
})(rc || (rc = {}));
const Tv = (e) => new _r(e).getCurrentVisitorId(), _v = (e, t) => typeof t == "function" ? (...n) => {
  const r = sl(n[0]);
  try {
    return t.apply(t, n);
  } catch (i) {
    return e.error(i, "Error in analytics preprocessRequest. Returning original request."), r;
  }
} : void 0, Mv = (e, t) => (...n) => {
  const r = sl(n[1]);
  try {
    return t.apply(t, n);
  } catch (i) {
    return e.error(i, "Error in analytics hook. Returning original request."), r;
  }
}, Pv = 1, Vv = 20, Gl = 5, Uv = 1, Jl = 8;
function Zl() {
  return {
    desiredCount: Gl,
    numberOfValues: Jl,
    set: {}
  };
}
const $v = (e, t) => {
  var n;
  return (n = e.categoryFacetSet[t]) == null ? void 0 : n.request;
}, Xl = (e, t) => {
  const n = $v(e, t);
  return cg((n == null ? void 0 : n.currentValues) ?? []);
};
function ed() {
  return {};
}
function Nv(e, t) {
  return { request: e, tabs: t };
}
function yo() {
  return {};
}
function Lv(e, t) {
  return { request: e, tabs: t };
}
function vo() {
  return {};
}
function jv(e, t) {
  return { request: e, hasBreadcrumbs: !0, tabs: t };
}
function So() {
  return {};
}
function Qv(e) {
  return {
    facetSet: e.facetSet ?? So(),
    categoryFacetSet: e.categoryFacetSet ?? ed(),
    dateFacetSet: e.dateFacetSet ?? yo(),
    numericFacetSet: e.numericFacetSet ?? vo(),
    automaticFacetSet: e.automaticFacetSet ?? Zl()
  };
}
const zv = (e) => {
  const t = [];
  return Yv(e).forEach((n, r) => {
    const i = tS(e, n.facetId), s = Xv(n, r + 1);
    if (Hv(n)) {
      if (!!!Xl(e, n.facetId).length)
        return;
      t.push({
        ...s,
        ...Jv(e, n.facetId),
        facetType: i,
        state: "selected"
      });
      return;
    }
    n.currentValues.forEach((o, a) => {
      if (o.state === "idle")
        return;
      const c = ic(o, a + 1, i), u = Bv(n) ? sc(o) : Kv(o);
      t.push({
        ...s,
        ...c,
        ...u
      });
    });
  }), Wv(e).forEach((n, r) => {
    const i = Zv(n, r + 1);
    n.values.forEach((s, o) => {
      if (s.state === "idle")
        return;
      const a = ic(s, o + 1, "specific"), c = sc(s);
      t.push({
        ...i,
        ...a,
        ...c
      });
    });
  }), t;
}, Bv = (e) => e.type === "specific", Hv = (e) => e.type === "hierarchical", Yv = (e) => [
  ...Object.values(e.facetSet),
  ...Object.values(e.categoryFacetSet),
  ...Object.values(e.dateFacetSet),
  ...Object.values(e.numericFacetSet)
].map((t) => t.request), Wv = (e) => [...Object.values(e.automaticFacetSet.set)].map((t) => t.response), ic = (e, t, n) => ({
  state: e.state,
  valuePosition: t,
  facetType: n
}), Kv = (e) => ({
  displayValue: `${e.start}..${e.end}`,
  value: `${e.start}..${e.end}`,
  start: e.start,
  end: e.end,
  endInclusive: e.endInclusive
}), sc = (e) => ({
  displayValue: e.value,
  value: e.value
}), Gv = (e, t) => Xl(e, t).map((r) => r.value).join(";"), Jv = (e, t) => {
  const r = Gv(e, t);
  return {
    value: r,
    valuePosition: 1,
    displayValue: r
  };
}, Zv = (e, t) => ({
  title: td(e.field, e.field),
  field: e.field,
  id: e.field,
  facetPosition: t
}), Xv = (e, t) => ({
  title: td(e.field, e.facetId),
  field: e.field,
  id: e.facetId,
  facetPosition: t
}), td = (e, t) => `${e}_${t}`, eS = (e, t) => {
  var n, r, i, s, o;
  return ((n = e.facetSet[t]) == null ? void 0 : n.request) || ((r = e.categoryFacetSet[t]) == null ? void 0 : r.request) || ((i = e.dateFacetSet[t]) == null ? void 0 : i.request) || ((s = e.numericFacetSet[t]) == null ? void 0 : s.request) || ((o = e.automaticFacetSet.set[t]) == null ? void 0 : o.response);
}, tS = (e, t) => {
  const n = eS(e, t);
  return n ? n.type : "specific";
}, nS = (e) => e.configuration.search.locale, rS = (e) => e.configuration.search.timezone, iS = (e) => {
  var t, n;
  return (n = (t = e.configuration) == null ? void 0 : t.knowledge) == null ? void 0 : n.agentId;
}, ni = (e) => {
  var t, n, r, i;
  if (sS(e) || oS(e))
    return (t = e.generatedAnswer) == null ? void 0 : t.answerId;
  if (aS(e))
    return (i = (r = (n = e.search) == null ? void 0 : n.response) == null ? void 0 : r.extendedResults) == null ? void 0 : i.generativeQuestionAnsweringId;
}, sS = (e) => {
  var t;
  return "answer" in e && "generatedAnswer" in e && !Z((t = e.generatedAnswer) == null ? void 0 : t.answerConfigurationId);
}, oS = (e) => {
  const t = iS(e);
  return "generatedAnswer" in e && typeof t == "string" && t.trim().length > 0;
}, aS = (e) => "search" in e && e.search !== void 0 && typeof e.search == "object", cS = (e) => {
  var t;
  return (t = e.generatedAnswer) == null ? void 0 : t.fieldsToIncludeInCitations;
}, uS = (e) => {
  var t;
  return (t = e.followUpAnswers) == null ? void 0 : t.conversationId;
}, lS = (e) => {
  var t;
  return (t = e.generatedAnswer) == null ? void 0 : t.citations;
}, dS = (e) => {
  var t;
  return (t = e.followUpAnswers) == null ? void 0 : t.followUpAnswers;
}, fS = fe(dS, (e) => e == null ? void 0 : e.flatMap((t) => t.citations)), pS = (e, t) => t;
fe(lS, fS, pS, (e, t, n) => (e == null ? void 0 : e.find((r) => r.id === n)) ?? (t == null ? void 0 : t.find((r) => r.id === n)));
const dn = () => ({
  q: "",
  enableQuerySyntax: !1
});
function Ns() {
  return {
    answerSnippet: "",
    documentId: {
      contentIdKey: "",
      contentIdValue: ""
    },
    question: "",
    relatedQuestions: [],
    score: 0
  };
}
function gt() {
  return {
    response: {
      results: [],
      searchUid: "",
      totalCountFiltered: 0,
      facets: [],
      generateAutomaticFacets: { facets: [] },
      queryCorrections: [],
      triggers: [],
      questionAnswer: Ns(),
      pipeline: "",
      splitTestRun: "",
      termsToHighlight: {},
      phrasesToHighlight: {},
      extendedResults: {}
    },
    duration: 0,
    queryExecuted: "",
    error: null,
    automaticallyCorrected: !1,
    isLoading: !1,
    results: [],
    searchResponseId: "",
    requestId: "",
    questionAnswer: Ns(),
    extendedResults: {},
    searchAction: void 0
  };
}
var Ls;
(function(e) {
  e.Ascending = "ascending", e.Descending = "descending";
})(Ls || (Ls = {}));
var Xe;
(function(e) {
  e.Relevancy = "relevancy", e.QRE = "qre", e.Date = "date", e.Field = "field", e.NoSort = "nosort";
})(Xe || (Xe = {}));
const nd = (e) => {
  if (Uu(e))
    return e.map((t) => nd(t)).join(",");
  switch (e.by) {
    case Xe.Relevancy:
    case Xe.QRE:
    case Xe.NoSort:
      return e.by;
    case Xe.Date:
      return `date ${e.order}`;
    case Xe.Field:
      return `@${e.field} ${e.order}`;
    default:
      return "";
  }
}, hS = () => ({
  by: Xe.Relevancy
});
new z({
  values: {
    by: new Rn({ enum: Xe, required: !0 }),
    order: new Rn({ enum: Ls }),
    field: new L()
  }
});
function rd() {
  return nd(hS());
}
const id = () => "default", gS = (e) => {
  const t = e.configuration.search.locale.split("-")[0];
  return !t || t.length !== 2 ? "en" : t;
};
class mS {
  constructor(t) {
    ee(this, "getState");
    ee(this, "state");
    this.getState = t, this.state = t();
  }
  getLanguage() {
    return gS(this.state);
  }
  getBaseMetadata() {
    const { context: t, configuration: n } = this.state, r = (t == null ? void 0 : t.contextValues) || {}, i = {};
    for (const [s, o] of Object.entries(r)) {
      const a = `context_${s}`;
      i[a] = o;
    }
    return n.analytics.analyticsMode === "legacy" && (i.coveoHeadlessVersion = ao), i;
  }
  getOriginContext() {
    return this.state.configuration.analytics.originContext;
  }
  getOriginLevel1() {
    return this.state.searchHub || id();
  }
  getOriginLevel2() {
    return this.state.configuration.analytics.originLevel2;
  }
  getOriginLevel3() {
    return this.state.configuration.analytics.originLevel3;
  }
  getIsAnonymous() {
    return this.state.configuration.analytics.anonymous;
  }
}
const kn = class kn extends mS {
  constructor() {
    super(...arguments);
    ee(this, "getFacetRequest", (n) => {
      var r, i, s, o, a, c, u, l, f, h;
      return ((i = (r = this.state.facetSet) == null ? void 0 : r[n]) == null ? void 0 : i.request) || ((o = (s = this.state.categoryFacetSet) == null ? void 0 : s[n]) == null ? void 0 : o.request) || ((c = (a = this.state.dateFacetSet) == null ? void 0 : a[n]) == null ? void 0 : c.request) || ((l = (u = this.state.numericFacetSet) == null ? void 0 : u[n]) == null ? void 0 : l.request) || ((h = (f = this.state.automaticFacetSet) == null ? void 0 : f.set[n]) == null ? void 0 : h.response);
    });
  }
  getFacetState() {
    return zv(Qv(this.getState()));
  }
  getPipeline() {
    var n;
    return this.state.pipeline || ((n = this.state.search) == null ? void 0 : n.response.pipeline) || kn.fallbackPipelineName;
  }
  getSearchEventRequestPayload() {
    return {
      queryText: this.queryText,
      responseTime: this.responseTime,
      results: this.resultURIs,
      numberOfResults: this.numberOfResults
    };
  }
  getSearchUID() {
    var r, i;
    const n = this.getState();
    return ((r = n.search) == null ? void 0 : r.searchResponseId) || ((i = n.search) == null ? void 0 : i.response.searchUid) || gt().response.searchUid;
  }
  getSplitTestRunName() {
    var n;
    return (n = this.state.search) == null ? void 0 : n.response.splitTestRun;
  }
  getSplitTestRunVersion() {
    var i;
    const n = !!this.getSplitTestRunName(), r = ((i = this.state.search) == null ? void 0 : i.response.pipeline) || this.state.pipeline || kn.fallbackPipelineName;
    return n ? r : void 0;
  }
  getBaseMetadata() {
    const n = this.getState(), r = super.getBaseMetadata(), i = ni(n);
    return i && (r.generativeQuestionAnsweringId = i), r;
  }
  getFacetMetadata(n, r) {
    const i = this.getFacetRequest(n), s = (i == null ? void 0 : i.field) ?? "";
    return {
      ...this.getBaseMetadata(),
      facetId: n,
      facetField: s,
      facetValue: r,
      facetTitle: `${s}_${n}`
    };
  }
  getFacetClearAllMetadata(n) {
    const r = this.getFacetRequest(n), i = (r == null ? void 0 : r.field) ?? "";
    return {
      ...this.getBaseMetadata(),
      facetId: n,
      facetField: i,
      facetTitle: `${i}_${n}`
    };
  }
  getFacetUpdateSortMetadata(n, r) {
    const i = this.getFacetRequest(n), s = (i == null ? void 0 : i.field) ?? "";
    return {
      ...this.getBaseMetadata(),
      facetId: n,
      facetField: s,
      criteria: r,
      facetTitle: `${s}_${n}`
    };
  }
  getRangeBreadcrumbFacetMetadata(n, r) {
    const i = this.getFacetRequest(n), s = (i == null ? void 0 : i.field) ?? "";
    return {
      ...this.getBaseMetadata(),
      facetId: n,
      facetField: s,
      facetRangeEnd: r.end,
      facetRangeEndInclusive: r.endInclusive,
      facetRangeStart: r.start,
      facetTitle: `${s}_${n}`
    };
  }
  getResultSortMetadata() {
    return {
      ...this.getBaseMetadata(),
      resultsSortBy: this.state.sortCriteria ?? rd()
    };
  }
  getStaticFilterToggleMetadata(n, r) {
    return {
      ...this.getBaseMetadata(),
      staticFilterId: n,
      staticFilterValue: r
    };
  }
  getStaticFilterClearAllMetadata(n) {
    return {
      ...this.getBaseMetadata(),
      staticFilterId: n
    };
  }
  getUndoTriggerQueryMetadata(n) {
    return {
      ...this.getBaseMetadata(),
      undoneQuery: n
    };
  }
  getCategoryBreadcrumbFacetMetadata(n, r) {
    const i = this.getFacetRequest(n), s = (i == null ? void 0 : i.field) ?? "";
    return {
      ...this.getBaseMetadata(),
      categoryFacetId: n,
      categoryFacetField: s,
      categoryFacetPath: r,
      categoryFacetTitle: `${s}_${n}`
    };
  }
  getOmniboxAnalyticsMetadata(n, r) {
    var u;
    const i = (u = this.state.querySuggest) == null ? void 0 : u[n], s = i.completions.map((l) => l.expression), o = i.partialQueries.length - 1, a = i.partialQueries[o] || "", c = i.responseId;
    return {
      ...this.getBaseMetadata(),
      suggestionRanking: s.indexOf(r),
      partialQuery: a,
      partialQueries: i.partialQueries.length > 0 ? i.partialQueries : "",
      suggestions: s.length > 0 ? s : "",
      querySuggestResponseId: c
    };
  }
  getInterfaceChangeMetadata() {
    return {
      ...this.getBaseMetadata(),
      interfaceChangeTo: this.state.configuration.analytics.originLevel2
    };
  }
  getOmniboxFromLinkMetadata(n) {
    return {
      ...this.getBaseMetadata(),
      ...n
    };
  }
  getGeneratedAnswerMetadata() {
    var i;
    const n = this.getState(), r = {};
    return ((i = n.generatedAnswer) == null ? void 0 : i.isVisible) !== void 0 && (r.showGeneratedAnswer = n.generatedAnswer.isVisible), r;
  }
  get resultURIs() {
    var n;
    return (n = this.results) == null ? void 0 : n.map((r) => ({
      documentUri: r.uri,
      documentUriHash: r.raw.urihash
    }));
  }
  get results() {
    var n;
    return (n = this.state.search) == null ? void 0 : n.response.results;
  }
  get queryText() {
    var n;
    return ((n = this.state.query) == null ? void 0 : n.q) || dn().q;
  }
  get responseTime() {
    var n;
    return ((n = this.state.search) == null ? void 0 : n.duration) || gt().duration;
  }
  get numberOfResults() {
    var n;
    return ((n = this.state.search) == null ? void 0 : n.response.totalCountFiltered) || gt().response.totalCountFiltered;
  }
};
ee(kn, "fallbackPipelineName", "default");
let en = kn;
const yS = ({ logger: e, getState: t, analyticsClientMiddleware: n = (s, o) => o, preprocessRequest: r, provider: i }) => {
  const s = t(), o = s.configuration.accessToken, a = s.configuration.analytics.apiBaseUrl ?? Hn(s.configuration.organizationId, s.configuration.environment, "analytics"), c = s.configuration.analytics.runtimeEnvironment, u = s.configuration.analytics.enabled, l = new Dv({
    token: o,
    endpoint: a,
    runtimeEnvironment: c,
    preprocessRequest: _v(e, r),
    beforeSendHooks: [
      Mv(e, n),
      (f, h) => (e.info({
        ...h,
        type: f,
        endpoint: a,
        token: o
      }, "Analytics request"), h)
    ]
  }, i);
  return u || l.disable(), l;
}, oc = () => {
  const t = ln.getInstance().getHistory().reverse().find((n) => n.name === "PageView" && n.value);
  return t ? t.value : "";
}, wo = async (e, t) => {
  const n = e.analyticsMode === "next";
  return {
    analytics: {
      clientId: await Tv(e),
      clientTimestamp: (/* @__PURE__ */ new Date()).toISOString(),
      documentReferrer: e.originLevel3,
      originContext: e.originContext,
      ...t && {
        actionCause: t.actionCause,
        customData: t.customData
      },
      ...t && !n && {
        customData: t.customData
      },
      ...e.userDisplayName && { userDisplayName: e.userDisplayName },
      ...e.documentLocation && { documentLocation: e.documentLocation },
      ...e.deviceId && { deviceId: e.deviceId },
      ...oc() && { pageId: oc() },
      ...n && e.trackingId && { trackingId: e.trackingId },
      capture: n,
      ...n && { source: hi(e) }
    }
  };
}, bo = async (e, t) => {
  var n, r, i, s;
  return {
    accessToken: e.configuration.accessToken,
    organizationId: e.configuration.organizationId,
    url: e.configuration.search.apiBaseUrl ?? an(e.configuration.organizationId, e.configuration.environment),
    locale: e.configuration.search.locale,
    debug: e.debug,
    tab: e.configuration.analytics.originLevel2,
    referrer: e.configuration.analytics.originLevel3,
    timezone: e.configuration.search.timezone,
    ...e.configuration.analytics.enabled && {
      actionsHistory: ln.getInstance().getHistory()
    },
    ...((n = e.advancedSearchQueries) == null ? void 0 : n.aq) && {
      aq: e.advancedSearchQueries.aq
    },
    ...((r = e.advancedSearchQueries) == null ? void 0 : r.cq) && {
      cq: e.advancedSearchQueries.cq
    },
    ...((i = e.advancedSearchQueries) == null ? void 0 : i.lq) && {
      lq: e.advancedSearchQueries.lq
    },
    ...((s = e.advancedSearchQueries) == null ? void 0 : s.dq) && {
      dq: e.advancedSearchQueries.dq
    },
    ...e.context && {
      context: e.context.contextValues
    },
    ...e.fields && !e.fields.fetchAllFields && {
      fieldsToInclude: e.fields.fieldsToInclude
    },
    ...e.dictionaryFieldContext && {
      dictionaryFieldContext: e.dictionaryFieldContext.contextValues
    },
    ...e.pipeline && {
      pipeline: e.pipeline
    },
    ...e.query && {
      q: e.query.q,
      enableQuerySyntax: e.query.enableQuerySyntax
    },
    ...e.searchHub && {
      searchHub: e.searchHub
    },
    ...e.sortCriteria && {
      sortCriteria: e.sortCriteria
    },
    ...e.configuration.analytics.enabled && await wo(e.configuration.analytics, t),
    ...e.excerptLength && !Z(e.excerptLength.length) && {
      excerptLength: e.excerptLength.length
    },
    ...e.configuration.search.authenticationProviders.length && {
      authentication: e.configuration.search.authenticationProviders.join(",")
    }
  };
}, wi = (e, t, n) => ({
  analytics: {
    clientId: t.clientId,
    clientTimestamp: (/* @__PURE__ */ new Date()).toISOString(),
    documentReferrer: t.referrer,
    documentLocation: t.location,
    originContext: e.originContext,
    ...n && {
      actionCause: n.actionCause
    },
    ...n && {
      customData: n.customData
    },
    ...e.userDisplayName && { userDisplayName: e.userDisplayName },
    ...e.deviceId && { deviceId: e.deviceId },
    ...e.trackingId && { trackingId: e.trackingId },
    capture: t.capture ?? t.clientId !== "",
    source: hi(e)
  }
}), sd = (e, t, n) => {
  var r, i, s, o;
  return {
    accessToken: e.configuration.accessToken,
    organizationId: e.configuration.organizationId,
    url: e.configuration.search.apiBaseUrl ?? an(e.configuration.organizationId, e.configuration.environment),
    locale: e.configuration.search.locale,
    debug: e.debug,
    tab: e.configuration.analytics.originLevel2,
    referrer: t.referrer,
    timezone: e.configuration.search.timezone,
    ...((r = e.advancedSearchQueries) == null ? void 0 : r.aq) && {
      aq: e.advancedSearchQueries.aq
    },
    ...((i = e.advancedSearchQueries) == null ? void 0 : i.cq) && {
      cq: e.advancedSearchQueries.cq
    },
    ...((s = e.advancedSearchQueries) == null ? void 0 : s.lq) && {
      lq: e.advancedSearchQueries.lq
    },
    ...((o = e.advancedSearchQueries) == null ? void 0 : o.dq) && {
      dq: e.advancedSearchQueries.dq
    },
    ...e.context && {
      context: e.context.contextValues
    },
    ...e.fields && !e.fields.fetchAllFields && {
      fieldsToInclude: e.fields.fieldsToInclude
    },
    ...e.dictionaryFieldContext && {
      dictionaryFieldContext: e.dictionaryFieldContext.contextValues
    },
    ...e.pipeline && {
      pipeline: e.pipeline
    },
    ...e.query && {
      q: e.query.q,
      enableQuerySyntax: e.query.enableQuerySyntax
    },
    ...e.searchHub && {
      searchHub: e.searchHub
    },
    ...e.sortCriteria && {
      sortCriteria: e.sortCriteria
    },
    ...e.configuration.analytics.enabled && wi(e.configuration.analytics, t, n),
    ...e.excerptLength && !Z(e.excerptLength.length) && {
      excerptLength: e.excerptLength.length
    },
    ...e.configuration.search.authenticationProviders.length && {
      authentication: e.configuration.search.authenticationProviders.join(",")
    }
  };
}, vS = fe((e) => e.staticFilterSet, (e) => Object.values(e || {}).map((n) => {
  const r = n.values.filter((s) => s.state === "selected" && !!s.expression.trim()), i = r.map((s) => s.expression).join(" OR ");
  return r.length > 1 ? `(${i})` : i;
}));
function SS(e) {
  return e.type === "dateRange";
}
function od(e) {
  return `start${e}`;
}
function ad(e) {
  return `end${e}`;
}
const cd = () => ({
  dateFacetValueMap: {}
});
function wS(e, t, n) {
  let r = e.start, i = e.end;
  return _n(r) && (r = Ds(r), n.dateFacetValueMap[t][od(r)] = e.start), _n(i) && (i = Ds(i), n.dateFacetValueMap[t][ad(i)] = e.end), { ...e, start: r, end: i };
}
function ud(e, t) {
  if (SS(e)) {
    const { facetId: n, currentValues: r } = e;
    return t.dateFacetValueMap[n] = {}, {
      ...e,
      currentValues: r.map((i) => wS(i, n, t))
    };
  }
  return e;
}
function bi(e) {
  var r;
  const t = cd();
  return { request: {
    ...e,
    facets: (r = e.facets) == null ? void 0 : r.map((i) => ud(i, t))
  }, mappings: t };
}
function bS(e, t, n) {
  return {
    ...e,
    start: n.dateFacetValueMap[t][od(e.start)] || e.start,
    end: n.dateFacetValueMap[t][ad(e.end)] || e.end
  };
}
function CS(e, t) {
  return e.facetId in t.dateFacetValueMap;
}
function IS(e, t) {
  return CS(e, t) ? {
    ...e,
    values: e.values.map((n) => bS(n, e.facetId, t))
  } : e;
}
function ld(e, t) {
  var n;
  return "success" in e ? { success: {
    ...e.success,
    facets: (n = e.success.facets) == null ? void 0 : n.map((i) => IS(i, t))
  } } : e;
}
const vt = async (e, t, n) => {
  var a;
  const r = fd(e), i = AS(e), s = xS(e), o = e.configuration.analytics.analyticsMode === "legacy" ? await bo(e, n) : sd(e, t, n);
  return bi({
    ...o,
    ...e.didYouMean && {
      queryCorrection: {
        enabled: e.didYouMean.enableDidYouMean && e.didYouMean.queryCorrectionMode === "next",
        options: {
          automaticallyCorrect: e.didYouMean.automaticallyCorrectQuery ? "whenNoResults" : "never"
        }
      },
      enableDidYouMean: e.didYouMean.enableDidYouMean && e.didYouMean.queryCorrectionMode === "legacy"
    },
    ...r && { cq: r },
    ...i.length && { facets: i },
    ...e.pagination && {
      numberOfResults: dd(e),
      firstResult: e.pagination.firstResult
    },
    ...e.facetOptions && {
      facetOptions: { freezeFacetOrder: e.facetOptions.freezeFacetOrder }
    },
    ...((a = e.folding) == null ? void 0 : a.enabled) && {
      filterField: e.folding.fields.collection,
      childField: e.folding.fields.parent,
      parentField: e.folding.fields.child,
      filterFieldRange: e.folding.filterFieldRange
    },
    ...e.automaticFacetSet && {
      generateAutomaticFacets: {
        desiredCount: e.automaticFacetSet.desiredCount,
        numberOfValues: e.automaticFacetSet.numberOfValues,
        currentFacets: s
      }
    },
    ...e.generatedAnswer && {
      pipelineRuleParameters: {
        mlGenerativeQuestionAnswering: {
          responseFormat: e.generatedAnswer.responseFormat,
          citationsFieldToInclude: e.generatedAnswer.fieldsToIncludeInCitations
        }
      }
    }
  });
};
function dd(e) {
  return e.pagination ? e.pagination.firstResult + e.pagination.numberOfResults > Mn ? Mn - e.pagination.firstResult : e.pagination.numberOfResults : void 0;
}
function AS(e) {
  return _l(kS(e), e.facetOrder ?? []);
}
function xS(e) {
  var n;
  const t = (n = e.automaticFacetSet) == null ? void 0 : n.set;
  return t ? Object.values(t).map((r) => r.response).map(ES).filter((r) => r.currentValues.length > 0) : void 0;
}
function ES(e) {
  const { field: t, label: n, values: r } = e, i = r.filter((s) => s.state === "selected");
  return {
    field: t,
    label: n,
    currentValues: i
  };
}
function kS(e) {
  return RS(e).filter(({ facetId: t }) => {
    var n, r;
    return ((r = (n = e.facetOptions) == null ? void 0 : n.facets[t]) == null ? void 0 : r.enabled) ?? !0;
  });
}
function RS(e) {
  return [
    ...OS(e.facetSet ?? {}),
    ...ac(e.numericFacetSet ?? {}),
    ...ac(e.dateFacetSet ?? {}),
    ...un(e.categoryFacetSet ?? {})
  ];
}
function OS(e) {
  return un(e).map((t) => {
    const n = Ml[t.sortCriteria];
    return n ? {
      ...t,
      sortCriteria: n
    } : t;
  });
}
function ac(e) {
  return un(e).map((t) => {
    const n = t.currentValues, r = n.some(({ state: s }) => s !== "idle"), i = n.some((s) => s.previousState);
    return t.generateAutomaticRanges && !r && !i ? { ...t, currentValues: [] } : t;
  });
}
function fd(e) {
  var s;
  const t = ((s = e.advancedSearchQueries) == null ? void 0 : s.cq.trim()) || "", n = Object.values(e.tabSet || {}).find((o) => o.isActive), r = (n == null ? void 0 : n.expression.trim()) || "", i = vS(e);
  return [t, r, ...i].filter((o) => !!o).join(" AND ");
}
const qS = async (e, t, n, r) => {
  const i = t.categoryFacetSearchSet[e].options, s = t.categoryFacetSet[e].request, { captions: o, query: a, numberOfValues: c } = i, { field: u, delimitingCharacter: l, basePath: f, filterFacetCount: h } = s, m = FS(s), p = m.length ? [m] : [], d = `*${a}*`;
  return {
    url: t.configuration.search.apiBaseUrl ?? an(t.configuration.organizationId, t.configuration.environment),
    accessToken: t.configuration.accessToken,
    organizationId: t.configuration.organizationId,
    ...t.configuration.search.authenticationProviders.length && {
      authentication: t.configuration.search.authenticationProviders.join(",")
    },
    basePath: f,
    captions: o,
    numberOfValues: c,
    query: d,
    field: u,
    delimitingCharacter: l,
    ignorePaths: p,
    filterFacetCount: h,
    type: "hierarchical",
    ...r ? {} : {
      searchContext: (await vt(t, n)).request
    }
  };
}, FS = (e) => {
  const t = [];
  let n = e.currentValues[0];
  for (; n; )
    t.push(n.value), n = n.children[0];
  return t;
}, DS = async (e, t, n, r) => {
  const { captions: i, query: s, numberOfValues: o } = t.facetSearchSet[e].options, { field: a, currentValues: c, filterFacetCount: u } = t.facetSet[e].request, l = c.filter((h) => h.state !== "idle").map((h) => h.value), f = `*${s}*`;
  return {
    url: t.configuration.search.apiBaseUrl ?? an(t.configuration.organizationId, t.configuration.environment),
    accessToken: t.configuration.accessToken,
    organizationId: t.configuration.organizationId,
    ...t.configuration.search.authenticationProviders && {
      authentication: t.configuration.search.authenticationProviders.join(",")
    },
    captions: i,
    numberOfValues: o,
    query: f,
    field: a,
    ignoreValues: l,
    filterFacetCount: u,
    type: "specific",
    ...r ? {} : {
      searchContext: (await vt(t, n)).request
    }
  };
}, pd = (e) => async (t, { getState: n, extra: { apiClient: r, validatePayload: i, navigatorContext: s } }) => {
  const o = n();
  let a;
  i(t, j), TS(o, t) ? a = await DS(t, o, s, e) : a = await qS(t, o, s, e);
  const c = await r.facetSearch(a);
  return { facetId: t, response: c };
};
te("facetSearch/executeSearch", pd(!1));
te("facetSearch/executeSearch", pd(!0));
const hd = S("facetSearch/clearResults", (e) => O(e, { facetId: le })), TS = (e, t) => e.facetSearchSet !== void 0 && e.facetSet !== void 0 && e.facetSet[t] !== void 0, gd = {
  facetId: le,
  value: new z({
    values: {
      displayValue: Ue,
      rawValue: Ue,
      count: new W({ required: !0, min: 0 })
    }
  })
}, _S = S("facetSearch/register", (e) => O(e, fo)), md = S("facetSearch/update", (e) => O(e, fo)), Ci = S("facetSearch/toggleSelectValue", (e) => O(e, gd)), Ii = S("facetSearch/toggleExcludeValue", (e) => O(e, gd)), MS = (e, t, n) => ({
  ...Yn(t, n),
  query: t.querySet[e]
}), PS = S("commerce/querySuggest/clear", (e) => O(e, { id: j })), Ot = te("commerce/querySuggest/fetch", async (e, { getState: t, rejectWithValue: n, extra: { apiClient: r, validatePayload: i, navigatorContext: s } }) => {
  i(e, {
    id: j
  });
  const o = t(), a = MS(e.id, o, s), c = await r.querySuggest(a);
  return Qe(c) ? n(c.error) : {
    id: e.id,
    query: a.query,
    ...c.success
  };
}), VS = S("commerce/querySuggest/register", (e) => O(e, {
  id: j,
  count: new W({ min: 0 })
})), yd = S("commerce/querySuggest/selectSuggestion", (e) => O(e, {
  id: j,
  expression: Ue
})), US = (e, t, n, r) => {
  var v, x;
  const i = t.categoryFacetSearchSet[e].options.query, s = `*${i}*`, o = (v = t.commerceFacetSet[js(e)]) == null ? void 0 : v.request, a = o && $S(o) ? o && NS(o) : [], c = a.length ? [a] : [], u = n ? i : (x = t.commerceQuery) == null ? void 0 : x.query, l = t.categoryFacetSearchSet[e].options.numberOfValues, { url: f, accessToken: h, organizationId: m, trackingId: p, language: d, country: g, currency: b, clientId: R, context: w, ...C } = Nt(t, r);
  return {
    url: f,
    accessToken: h,
    organizationId: m,
    facetId: js(e),
    facetQuery: n ? "*" : s,
    numberOfValues: l,
    ignorePaths: c,
    trackingId: p,
    language: d,
    country: g,
    currency: b,
    clientId: R,
    context: w,
    query: u,
    ...!n && { ...C }
  };
};
function $S(e) {
  return e.type === "hierarchical";
}
const NS = (e) => {
  const t = [];
  let n = e.values[0];
  for (; n; )
    t.push(n.value), n = n.children[0];
  return t;
}, LS = (e, t, n, r) => {
  var R;
  const i = t.facetSearchSet[e].options.query, s = t.facetSearchSet[e].options.numberOfValues, o = `*${i}*`, a = n ? i : (R = t.commerceQuery) == null ? void 0 : R.query, { url: c, accessToken: u, organizationId: l, trackingId: f, language: h, country: m, currency: p, clientId: d, context: g, ...b } = Nt(t, r);
  return {
    url: c,
    accessToken: u,
    organizationId: l,
    facetId: js(e),
    facetQuery: n ? "*" : o,
    numberOfValues: s,
    trackingId: f,
    language: h,
    country: m,
    currency: p,
    clientId: d,
    context: g,
    query: a,
    ...!n && { ...b }
  };
}, vd = (e) => async ({ facetId: t, facetSearchType: n }, { getState: r, extra: { validatePayload: i, navigatorContext: s, apiClient: o } }) => {
  const a = r();
  i(t, j);
  const c = jS(a, t) || QS(a, t) ? LS(t, a, e, s) : US(t, a, e, s), u = await o.facetSearch(c, n);
  return { facetId: t, response: u };
}, Wt = te("commerce/facetSearch/executeSearch", vd(!1)), qt = te("commerce/facetSearch/facetFieldSuggest", vd(!0)), jS = (e, t) => "facetSearchSet" in e && e.facetSearchSet[t] !== void 0 && e.commerceFacetSet[t] !== void 0, QS = (e, t) => "fieldSuggestionsOrder" in e ? e.fieldSuggestionsOrder.some((n) => n.facetId === t && n.type === "regular") : !1, ri = "field_suggestion:";
function js(e) {
  return e.startsWith(ri) ? e.slice(ri.length) : e;
}
function Pt(e) {
  return e.startsWith(ri) ? e : `${ri}${e}`;
}
function Sd(e, t, n) {
  const { facetId: r, response: i } = t, s = e[r];
  s && s.requestId === n && (s.isLoading = !1, "success" in i && (s.response = i.success));
}
function wd(e, t, n, r) {
  const { facetId: i, response: s } = t, o = Pt(i);
  let a = e[o];
  if (!a)
    ho(e, { facetId: o }, r), a = e[o];
  else if (a.requestId !== n)
    return;
  a.isLoading = !1, "success" in s && (a.response = s.success);
}
function zS(e, t, n, r) {
  if (t.fieldSuggestionsFacets)
    for (const i of t.fieldSuggestionsFacets)
      i.facetId in e || i.type !== "regular" || (e[i.facetId] = {
        options: {
          ...Xt,
          query: t.query ?? ""
        },
        isLoading: !1,
        response: r(),
        initialNumberOfValues: Xt.numberOfValues,
        requestId: n
      });
}
function BS(e, t, n, r) {
  if (t.fieldSuggestionsFacets)
    for (const i of t.fieldSuggestionsFacets) {
      const s = Pt(i.facetId);
      s in e || i.type !== "hierarchical" || (e[s] = {
        options: {
          ...Xt,
          query: t.query ?? ""
        },
        isLoading: !1,
        response: r(),
        initialNumberOfValues: Xt.numberOfValues,
        requestId: n
      });
    }
}
se(zm(), (e) => {
  e.addCase(Qm, (t, n) => {
    const r = n.payload;
    ho(t, r, zt);
  }).addCase(md, (t, n) => {
    Tl(t, n.payload);
  }).addCase(Wt.pending, (t, n) => {
    const { facetId: r } = n.meta.arg;
    Zr(t, r, n.meta.requestId);
  }).addCase(qt.pending, (t, n) => {
    const { facetId: r } = n.meta.arg;
    Zr(t, r, n.meta.requestId);
  }).addCase(Wt.rejected, (t, n) => {
    const { facetId: r } = n.meta.arg;
    Xr(t, r);
  }).addCase(qt.rejected, (t, n) => {
    const { facetId: r } = n.meta.arg;
    Xr(t, Pt(r));
  }).addCase(Wt.fulfilled, (t, n) => {
    Sd(t, n.payload, n.meta.requestId);
  }).addCase(qt.fulfilled, (t, n) => {
    wd(t, n.payload, n.meta.requestId, zt);
  }).addCase(Ot.fulfilled, (t, n) => {
    BS(t, n.payload, n.meta.requestId, zt);
  }).addCase(hd, (t, { payload: { facetId: n } }) => {
    go(t, { facetId: n }, zt);
  }).addCase(Pe.fulfilled, (t) => xn(t, zt)).addCase(Re.fulfilled, (t) => xn(t, zt));
});
function zt() {
  return {
    moreValuesAvailable: !1,
    values: []
  };
}
function HS() {
  return {};
}
se(HS(), (e) => {
  e.addCase(_S, (t, n) => {
    const r = n.payload;
    ho(t, r, At);
  }).addCase(md, (t, n) => {
    Tl(t, n.payload);
  }).addCase(Wt.pending, (t, n) => {
    const { facetId: r } = n.meta.arg;
    Zr(t, r, n.meta.requestId);
  }).addCase(qt.pending, (t, n) => {
    const { facetId: r } = n.meta.arg;
    Zr(t, Pt(r), n.meta.requestId);
  }).addCase(Wt.rejected, (t, n) => {
    const { facetId: r } = n.meta.arg;
    Xr(t, r);
  }).addCase(qt.rejected, (t, n) => {
    const { facetId: r } = n.meta.arg;
    Xr(t, Pt(r));
  }).addCase(Wt.fulfilled, (t, n) => {
    Sd(t, n.payload, n.meta.requestId);
  }).addCase(qt.fulfilled, (t, n) => {
    wd(t, n.payload, n.meta.requestId, At);
  }).addCase(Ot.fulfilled, (t, n) => {
    zS(t, n.payload, n.meta.requestId, At);
  }).addCase(hd, (t, { payload: n }) => {
    go(t, n, At);
  }).addCase(Pe.fulfilled, (t) => xn(t, At)).addCase(Re.fulfilled, (t) => xn(t, At)).addCase(st, (t) => xn(t, At));
});
function At() {
  return {
    moreValuesAvailable: !1,
    values: []
  };
}
const Wn = S("breadcrumb/deselectAll"), bd = S("breadcrumb/deselectAllNonBreadcrumbs"), Kn = S("facetOptions/update", (e = { freezeFacetOrder: !0 }) => O(e, {
  freezeFacetOrder: new re({ required: !1 })
})), YS = S("facetOptions/facet/enable", (e) => O(e, le)), Ai = S("facetOptions/facet/disable", (e) => O(e, le)), Co = (e, t) => {
  var n;
  return typeof e == "object" && Object.keys({ ...e }).length === 0 || !t || !e ? !0 : (n = e.excluded) != null && n.includes(t) ? !1 : !!(e.included && (e.included.length === 0 || e.included.includes(t)) || e.excluded && !e.included);
}, WS = S("history/undo"), KS = S("history/redo"), ft = S("history/snapshot");
te("history/back", async (e, { dispatch: t }) => {
  t(WS()), await t(ot());
});
te("history/forward", async (e, { dispatch: t }) => {
  t(KS()), await t(ot());
});
const ot = te("history/change", async (e, { getState: t }) => t().history.present);
function GS() {
  const e = typeof window < "u";
  return {
    sendMessage(t) {
      e && window.postMessage(t, "*");
    }
  };
}
const JS = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/i;
function ZS(e) {
  return typeof e == "string" && JS.test(e);
}
const Ie = [];
for (let e = 0; e < 256; ++e)
  Ie.push((e + 256).toString(16).slice(1));
function XS(e, t = 0) {
  return (Ie[e[t + 0]] + Ie[e[t + 1]] + Ie[e[t + 2]] + Ie[e[t + 3]] + "-" + Ie[e[t + 4]] + Ie[e[t + 5]] + "-" + Ie[e[t + 6]] + Ie[e[t + 7]] + "-" + Ie[e[t + 8]] + Ie[e[t + 9]] + "-" + Ie[e[t + 10]] + Ie[e[t + 11]] + Ie[e[t + 12]] + Ie[e[t + 13]] + Ie[e[t + 14]] + Ie[e[t + 15]]).toLowerCase();
}
let Ji;
const ew = new Uint8Array(16);
function tw() {
  if (!Ji) {
    if (typeof crypto > "u" || !crypto.getRandomValues)
      throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");
    Ji = crypto.getRandomValues.bind(crypto);
  }
  return Ji(ew);
}
const nw = typeof crypto < "u" && crypto.randomUUID && crypto.randomUUID.bind(crypto), cc = { randomUUID: nw };
function rw(e, t, n) {
  var i;
  e = e || {};
  const r = e.random ?? ((i = e.rng) == null ? void 0 : i.call(e)) ?? tw();
  if (r.length < 16)
    throw new Error("Random bytes length must be >= 16");
  return r[6] = r[6] & 15 | 64, r[8] = r[8] & 63 | 128, XS(r);
}
function iw(e, t, n) {
  return cc.randomUUID && !e ? cc.randomUUID() : rw(e);
}
async function sw({ config: e, environment: t, event: n, listenerManager: r }) {
  const { url: i, token: s, mode: o } = e;
  if (o !== "disabled")
    return r.call(n), t.send(i, s, n);
}
const Cd = "2.1.1", Zi = 128, Id = 192, uc = 224, lc = 240, ow = 248;
function aw(e) {
  return (e & ow) === lc ? 4 : (e & lc) === uc ? 3 : (e & uc) === Id ? 2 : 1;
}
function cw(e, t) {
  if (t < 0 || e.length <= t)
    return e;
  let n = e.indexOf("%", t - 2);
  for (n < 0 || n > t ? n = t : t = n; n > 2 && e.charAt(n - 3) == "%"; ) {
    const r = Number.parseInt(e.substring(n - 2, n), 16);
    if ((r & Zi) != Zi)
      break;
    if (n -= 3, (r & Id) != Zi) {
      t - n >= aw(r) * 3 && (n = t);
      break;
    }
  }
  return e.substring(0, n);
}
function uw(e) {
  const { trackingId: t } = e;
  return { trackingId: t };
}
function lw(e) {
  return (e.source || []).concat([`relay@${Cd}`]);
}
function Ad(e, t, n) {
  const { getReferrer: r, getLocation: i, getUserAgent: s } = n, o = uw(t), a = n.getClientId();
  return Object.freeze({
    type: e,
    config: o,
    ts: Date.now(),
    source: lw(t),
    clientId: a,
    userAgent: s(),
    referrer: dc(r()),
    location: dc(i())
  });
}
function dc(e) {
  return e !== null ? cw(e, 1024) : null;
}
function dw(e, t, n, r) {
  return {
    ...t,
    meta: Ad(e, n, r)
  };
}
const fw = "*";
function pw() {
  const e = [];
  function t({ type: c, callback: u }) {
    return e.findIndex((l) => l.type === c && l.callback === u);
  }
  function n(c, u) {
    return c.type === "*" || u === c.type;
  }
  function r(c) {
    return t(c) < 0 && e.push(c), () => a(c.type, c.callback);
  }
  function i(c) {
    e.forEach((u) => {
      if (n(u, c.meta.type))
        try {
          u.callback(c);
        } catch (l) {
          console.error(l);
        }
    });
  }
  function s(c) {
    if (c === fw)
      e.length = 0;
    else
      for (let u = e.length - 1; u >= 0; u--)
        e[u].type === c && e.splice(u, 1);
  }
  function o(c) {
    const u = t(c);
    u >= 0 && e.splice(u, 1);
  }
  function a(c, u) {
    u ? o({ type: c, callback: u }) : s(c);
  }
  return {
    add: r,
    call: i,
    remove: a
  };
}
function fc({ url: e, token: t, trackingId: n, ...r }) {
  return Object.freeze({
    url: e,
    token: t,
    trackingId: n,
    ...!!r.mode && { mode: r.mode },
    ...!!r.source && { source: r.source },
    ...!!r.environment && { environment: r.environment }
  });
}
function hw(e) {
  let t = fc(e);
  return {
    get: () => t,
    update: (n) => {
      t = fc({ ...t, ...n });
    }
  };
}
const Xi = gw();
function gw() {
  const e = "coveo_", t = (n) => {
    const r = n.split(".").slice(-2);
    return r.length == 2 ? r.join(".") : "";
  };
  return {
    getItem(n) {
      const r = `${e}${n}=`, i = document.cookie.split(";");
      for (const s of i) {
        const o = s.replace(/^\s+/, "");
        if (o.lastIndexOf(r, 0) === 0)
          return o.substring(r.length, o.length);
      }
      return null;
    },
    setItem(n, r, i) {
      const s = t(window.location.hostname), o = `;expires=${new Date((/* @__PURE__ */ new Date()).getTime() + i).toUTCString()}`, a = s ? `;domain=${s}` : "";
      document.cookie = `${e}${n}=${r}${o}${a};path=/;SameSite=Lax`;
    },
    removeItem(n) {
      this.setItem(n, "", -1);
    }
  };
}
function mw() {
  return {
    getItem(e) {
      return Xi.getItem(e) || localStorage.getItem(e);
    },
    removeItem(e) {
      Xi.removeItem(e), localStorage.removeItem(e);
    },
    setItem(e, t) {
      localStorage.setItem(e, t), Xi.setItem(e, t, 31556952e3);
    }
  };
}
const pc = "visitorId";
function yw() {
  const e = document.referrer;
  return e === "" ? null : e;
}
function xd() {
  const e = mw();
  return {
    runtime: "browser",
    send: async (t, n, r) => {
      const i = fetch(t, {
        method: "POST",
        body: JSON.stringify([r]),
        keepalive: !0,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${n}`
        }
      });
      GS().sendMessage({ kind: "EVENT_PROTOCOL", event: r, url: t, token: n });
      const o = await i;
      if (o != null && o.ok) {
        let a;
        try {
          a = await o.json();
        } catch {
          return;
        }
        for (const c of a.events)
          if (!c.accepted)
            throw new Error(`Received event was rejected for processing: ${c.errorMessage}`);
      } else
        throw new Error(`Error ${o.status}: Failed to send the event(s).`);
    },
    getReferrer: () => yw(),
    getLocation: () => window.location.href,
    getUserAgent: () => navigator.userAgent,
    getClientId: () => {
      const t = e.getItem(pc);
      if (t && ZS(t))
        return t;
      const n = iw();
      return e.setItem(pc, n), n;
    }
  };
}
function vw() {
  try {
    const e = "__storage_test__";
    return localStorage.setItem(e, e), localStorage.removeItem(e), !0;
  } catch (e) {
    return e instanceof DOMException && e.name === "QuotaExceededError" && // acknowledge QuotaExceededError only if there's something already stored
    localStorage && localStorage.length !== 0;
  }
}
function Sw() {
  return {
    runtime: "null",
    send: () => Promise.resolve(void 0),
    getReferrer: () => null,
    getLocation: () => null,
    getUserAgent: () => null,
    getClientId: () => ""
  };
}
function ww(e) {
  const t = e.get().mode !== "disabled", n = e.get().environment, r = Sw();
  return t && n ? {
    ...n,
    runtime: "custom"
  } : t && bw() && vw() ? xd() : r;
}
function bw() {
  try {
    return typeof window == "object";
  } catch {
    return !1;
  }
}
function Cw(e) {
  return {
    get: () => Object.freeze(ww(e))
  };
}
function Iw(e) {
  const t = hw(e), n = pw(), r = Cw(t);
  return {
    emit: async (i, s) => {
      const o = t.get(), a = r.get(), c = dw(i, s, o, a);
      return sw({
        config: o,
        environment: a,
        event: c,
        listenerManager: n
      });
    },
    getMeta: (i) => Ad(i, t.get(), r.get()),
    on: (i, s) => n.add({ type: i, callback: s }),
    off: (i, s) => n.remove(i, s),
    updateConfig: (i) => t.update(i),
    version: Cd
  };
}
function Aw() {
  return typeof window < "u" && typeof document < "u";
}
const xw = fe((e) => e.configuration.organizationId, (e) => e.configuration.environment, (e) => e.configuration.accessToken, (e) => e.configuration.analytics, (e) => hi(e.configuration.analytics), (e, t) => t, (e, t, n, { trackingId: r, apiBaseUrl: i, enabled: s }, o, a) => {
  const c = kw(a);
  return Iw({
    mode: s ? "emit" : "disabled",
    url: i ?? Ag(e, t),
    token: n,
    trackingId: r ?? null,
    source: o,
    environment: c
  });
}), Ew = {
  getClientId: () => "",
  getLocation: () => null,
  getReferrer: () => null,
  getUserAgent: () => null,
  send: async () => {
  }
}, kw = (e) => {
  if (!e)
    return;
  const t = e();
  return {
    ...Aw() ? xd() : Ew,
    getClientId: () => t.clientId,
    getLocation: () => t.location,
    getReferrer: () => t.referrer,
    getUserAgent: () => t.userAgent
  };
}, Rw = () => "";
function Ow(e, t) {
  return {
    ...new en(t).getBaseMetadata(),
    actionCause: e,
    type: e
  };
}
function qw(e) {
  return Object.assign(e, { instantlyCallable: !0 });
}
function Fw(e, t) {
  const n = (s) => {
    const o = te(e, s);
    return qw(Object.assign(o, {
      type: o.typePrefix
    }));
  }, r = n(async (s, { getState: o, extra: a }) => {
    const { analyticsClientMiddleware: c, preprocessRequest: u, logger: l } = a;
    return await (await t({
      getState: o,
      analyticsClientMiddleware: c,
      preprocessRequest: u,
      logger: l
    })).log({ state: o(), extra: a });
  });
  return Object.assign(r, {
    prepare: async ({ getState: s, analyticsClientMiddleware: o, preprocessRequest: a, logger: c }) => {
      const { description: u, log: l } = await t({
        getState: s,
        analyticsClientMiddleware: o,
        preprocessRequest: a,
        logger: c
      });
      return {
        description: u,
        action: n(async (f, { getState: h, extra: m }) => await l({ state: h(), extra: m }))
      };
    }
  }), r;
}
const Dw = (e, t, n) => {
  function r(...i) {
    const s = i.length === 1 ? {
      ...i[0],
      __legacy__getBuilder: t(i[0].__legacy__getBuilder),
      analyticsConfigurator: e,
      providerClass: n
    } : {
      prefix: i[0],
      __legacy__getBuilder: t(i[1]),
      __legacy__provider: i[2],
      analyticsConfigurator: e,
      providerClass: n
    };
    return Mw(s);
  }
  return r;
}, Tw = (e) => e.configuration.analytics.analyticsMode === "legacy", _w = (e) => e.configuration.analytics.analyticsMode === "next", Mw = ({ prefix: e, __legacy__getBuilder: t, __legacy__provider: n, analyticsPayloadBuilder: r, analyticsType: i, analyticsConfigurator: s, providerClass: o }) => (n ?? (n = (a) => new o(a)), Fw(e, async ({ getState: a, analyticsClientMiddleware: c, preprocessRequest: u, logger: l }) => {
  const f = [], h = {
    log: async ({ state: b }) => {
      for (const R of f)
        await R(b);
    }
  }, m = a(), p = s({
    getState: a,
    logger: l,
    analyticsClientMiddleware: c,
    preprocessRequest: u,
    provider: n(a)
  }), d = await t(p, a());
  h.description = d == null ? void 0 : d.description, f.push(async (b) => {
    Tw(b) && await Pw(d, n, b, l, p.coveoAnalyticsClient);
  });
  const { emit: g } = xw(m);
  return f.push(async (b) => {
    if (_w(b) && i && r) {
      const R = r(b);
      await Uw(g, i, R);
    }
  }), h;
}));
async function Pw(e, t, n, r, i) {
  t(() => n);
  const s = await (e == null ? void 0 : e.log({
    searchUID: t(() => n).getSearchUID()
  }));
  r.info({ client: i, response: s }, "Analytics response");
}
const bt = Dw((e) => yS({
  ...e,
  provider: e.provider || new en(e.getState)
}), (e) => e, en), Vw = {
  urihash: new L(),
  sourcetype: new L(),
  permanentid: new L()
};
new z({ values: Vw }), new L({ required: !1, emptyAllowed: !0 });
async function Uw(e, t, n) {
  await e(t, n);
}
var tn;
(function(e) {
  e.interfaceLoad = "interfaceLoad", e.interfaceChange = "interfaceChange", e.didYouMeanAutomatic = "didYouMeanAutomatic", e.didYouMeanClick = "didYouMeanClick", e.resultsSort = "resultsSort", e.searchboxSubmit = "searchboxSubmit", e.searchboxAsYouType = "searchboxAsYouType", e.breadcrumbFacet = "breadcrumbFacet", e.breadcrumbResetAll = "breadcrumbResetAll", e.documentOpen = "documentOpen", e.omniboxAnalytics = "omniboxAnalytics", e.omniboxFromLink = "omniboxFromLink", e.searchFromLink = "searchFromLink", e.triggerQuery = "query", e.browseResults = "browseResults", e.staticFilterDeselect = "staticFilterDeselect", e.facetClearAll = "facetClearAll", e.facetSelect = "facetSelect", e.facetDeselect = "facetDeselect", e.facetExclude = "facetExclude", e.facetUnexclude = "facetUnexclude", e.facetUpdateSort = "facetUpdateSort", e.documentSuggestion = "documentSuggestion", e.facetShowMore = "showMoreFacetResults", e.facetShowLess = "showLessFacetResults", e.queryError = "query", e.recommendationInterfaceLoad = "recommendationInterfaceLoad", e.likeSmartSnippet = "likeSmartSnippet", e.dislikeSmartSnippet = "dislikeSmartSnippet", e.expandSmartSnippet = "expandSmartSnippet", e.collapseSmartSnippet = "collapseSmartSnippet", e.openSmartSnippetFeedbackModal = "openSmartSnippetFeedbackModal", e.closeSmartSnippetFeedbackModal = "closeSmartSnippetFeedbackModal", e.sendSmartSnippetReason = "sendSmartSnippetReason", e.expandSmartSnippetSuggestion = "expandSmartSnippetSuggestion", e.collapseSmartSnippetSuggestion = "collapseSmartSnippetSuggestion", e.openSmartSnippetSource = "openSmartSnippetSource", e.openSmartSnippetSuggestionSource = "openSmartSnippetSuggestionSource", e.showMoreFoldedResults = "showMoreFoldedResults", e.showLessFoldedResults = "showLessFoldedResults", e.copyToClipboard = "copyToClipboard", e.caseSendEmail = "Case.SendEmail", e.feedItemTextPost = "FeedItem.TextPost", e.caseAttach = "caseAttach", e.caseDetach = "caseDetach", e.generatedAnswerCitationDocumentAttach = "generatedAnswerCitationDocumentAttach", e.retryGeneratedAnswer = "retryGeneratedAnswer", e.likeGeneratedAnswer = "likeGeneratedAnswer", e.dislikeGeneratedAnswer = "dislikeGeneratedAnswer", e.openGeneratedAnswerSource = "openGeneratedAnswerSource", e.generatedAnswerStreamEnd = "generatedAnswerStreamEnd", e.contextChanged = "contextChanged", e.generatedAnswerSourceHover = "generatedAnswerSourceHover", e.generatedAnswerFeedbackSubmit = "generatedAnswerFeedbackSubmit", e.generatedAnswerHideAnswers = "generatedAnswerHideAnswers", e.generatedAnswerShowAnswers = "generatedAnswerShowAnswers", e.generatedAnswerExpand = "generatedAnswerExpand", e.generatedAnswerCollapse = "generatedAnswerCollapse", e.generatedAnswerCopyToClipboard = "generatedAnswerCopyToClipboard", e.expandToFullUI = "expandToFullUI", e.createArticle = "createArticle", e.recentQueriesClick = "recentQueriesClick", e.clearRecentQueries = "clearRecentQueries";
})(tn || (tn = {}));
const Ed = S("facet/updateFacetAutoSelection", (e) => O(e, {
  allow: new re({ required: !0 })
}));
class $w extends en {
  constructor(n) {
    super(n);
    ee(this, "getState");
    this.getState = n;
  }
  get activeInstantResultQuery() {
    const n = this.getState().instantResults;
    for (const r in n)
      for (const i in n[r].cache)
        if (n[r].cache[i].isActive)
          return n[r].q;
    return null;
  }
  get activeInstantResultCache() {
    const n = this.getState().instantResults;
    for (const r in n)
      for (const i in n[r].cache)
        if (n[r].cache[i].isActive)
          return n[r].cache[i];
    return null;
  }
  get results() {
    var n;
    return (n = this.activeInstantResultCache) == null ? void 0 : n.results;
  }
  get queryText() {
    return this.activeInstantResultQuery ?? dn().q;
  }
  get responseTime() {
    var n;
    return ((n = this.activeInstantResultCache) == null ? void 0 : n.duration) ?? gt().duration;
  }
  get numberOfResults() {
    var n;
    return ((n = this.activeInstantResultCache) == null ? void 0 : n.totalCountFiltered) ?? gt().response.totalCountFiltered;
  }
  getSearchUID() {
    var r;
    return ((r = this.activeInstantResultCache) == null ? void 0 : r.searchUid) || super.getSearchUID();
  }
}
const Nw = () => bt("analytics/instantResult/searchboxAsYouType", (e) => e.makeSearchboxAsYouType(), (e) => new $w(e)), Lw = () => ({
  actionCause: tn.searchboxAsYouType
}), Io = {
  id: j
}, jw = {
  ...Io,
  q: Ue
};
S("instantResults/register", (e) => O(e, Io));
const kd = S("instantResults/updateQuery", (e) => O(e, jw));
S("instantResults/clearExpired", (e) => O(e, Io));
const xi = new W({ required: !0, min: 0 }), Qw = S("pagination/registerNumberOfResults", (e) => O(e, xi)), zw = S("pagination/updateNumberOfResults", (e) => O(e, xi)), Bw = S("pagination/registerPage", (e) => O(e, xi)), Rd = S("pagination/updatePage", (e) => O(e, xi)), Hw = S("pagination/nextPage"), Yw = S("pagination/previousPage"), Ei = S("query/updateQuery", (e) => O(e, {
  q: new L(),
  enableQuerySyntax: new re()
})), Mr = () => ({
  cq: "",
  cqWasSet: !1,
  aq: "",
  aqWasSet: !1,
  lq: "",
  lqWasSet: !1,
  dq: "",
  dqWasSet: !1,
  defaultFilters: {
    cq: "",
    aq: "",
    lq: "",
    dq: ""
  }
}), hc = () => bt("search/logFetchMoreResults", (e) => e.makeFetchMoreResults()), Kt = (e) => bt("search/queryError", (t, n) => {
  var r, i, s, o;
  return t.makeQueryError({
    query: ((r = n.query) == null ? void 0 : r.q) || dn().q,
    aq: ((i = n.advancedSearchQueries) == null ? void 0 : i.aq) || Mr().aq,
    cq: ((s = n.advancedSearchQueries) == null ? void 0 : s.cq) || Mr().cq,
    dq: ((o = n.advancedSearchQueries) == null ? void 0 : o.dq) || Mr().dq,
    errorType: e.type,
    errorMessage: e.message
  });
}), Od = (e) => e.success !== void 0, mt = (e) => e.error !== void 0;
S("didYouMean/enable");
S("didYouMean/disable");
S("didYouMean/automaticCorrections/disable");
S("didYouMean/automaticCorrections/enable");
const Ao = S("didYouMean/correction", (e) => O(e, j));
S("didYouMean/automaticCorrections/mode", (e) => O(e, new L({
  constrainTo: ["next", "legacy"],
  emptyAllowed: !1,
  required: !0
})));
const gc = () => bt("analytics/didyoumean/automatic", (e) => e.makeDidYouMeanAutomatic()), Ww = () => ({
  actionCause: tn.didYouMeanAutomatic
});
function Kw() {
  return {
    contextValues: {}
  };
}
const Gw = () => !1;
function Jw() {
  return {
    contextValues: {}
  };
}
function qd() {
  return { enabled: !0, tabs: {} };
}
function Fd() {
  return {
    freezeFacetOrder: !1,
    facets: {}
  };
}
function xo() {
  return {
    firstResult: 0,
    defaultNumberOfResults: 10,
    numberOfResults: 10,
    totalCountFiltered: 0
  };
}
function Eo() {
  return {};
}
function Zw() {
  return {};
}
function Xw() {
  return {};
}
function pt(e) {
  return {
    context: e.context || Kw(),
    dictionaryFieldContext: e.dictionaryFieldContext || Jw(),
    facetSet: e.facetSet || So(),
    numericFacetSet: e.numericFacetSet || vo(),
    dateFacetSet: e.dateFacetSet || yo(),
    categoryFacetSet: e.categoryFacetSet || ed(),
    automaticFacetSet: e.automaticFacetSet ?? Zl(),
    pagination: e.pagination || xo(),
    query: e.query || dn(),
    tabSet: e.tabSet || Xw(),
    advancedSearchQueries: e.advancedSearchQueries || Mr(),
    staticFilterSet: e.staticFilterSet || Zw(),
    querySet: e.querySet || Eo(),
    sortCriteria: e.sortCriteria || rd(),
    pipeline: e.pipeline || Rw(),
    searchHub: e.searchHub || id(),
    facetOptions: e.facetOptions || Fd(),
    facetOrder: e.facetOrder ?? Tr(),
    debug: e.debug ?? Gw()
  };
}
new z({
  values: {
    undoneQuery: Ue
  },
  options: { required: !0 }
});
const eb = () => bt("analytics/trigger/query", (e, t) => {
  var n;
  return (n = t.triggers) != null && n.queryModification.newQuery ? e.makeTriggerQuery() : null;
}), Dd = S("trigger/query/ignore", (e) => O(e, new L({ emptyAllowed: !0, required: !0 }))), Td = S("trigger/query/modification", (e) => O(e, new z({
  values: { originalQuery: be, modification: be }
}))), nn = async (e, t) => {
  var a;
  const n = rb(e), r = Pl(e), i = tb(e), s = await bo(e, t), o = () => e.pagination ? e.pagination.firstResult + e.pagination.numberOfResults > Mn ? Mn - e.pagination.firstResult : e.pagination.numberOfResults : void 0;
  return bi({
    ...s,
    ...e.didYouMean && {
      queryCorrection: {
        enabled: e.didYouMean.enableDidYouMean && e.didYouMean.queryCorrectionMode === "next",
        options: {
          automaticallyCorrect: e.didYouMean.automaticallyCorrectQuery ? "whenNoResults" : "never"
        }
      },
      enableDidYouMean: e.didYouMean.enableDidYouMean && e.didYouMean.queryCorrectionMode === "legacy"
    },
    ...n && { cq: n },
    ...r.length && { facets: r },
    ...e.pagination && {
      numberOfResults: o(),
      firstResult: e.pagination.firstResult
    },
    ...e.facetOptions && {
      facetOptions: { freezeFacetOrder: e.facetOptions.freezeFacetOrder }
    },
    ...((a = e.folding) == null ? void 0 : a.enabled) && {
      filterField: e.folding.fields.collection,
      childField: e.folding.fields.parent,
      parentField: e.folding.fields.child,
      filterFieldRange: e.folding.filterFieldRange
    },
    ...e.automaticFacetSet && {
      generateAutomaticFacets: {
        desiredCount: e.automaticFacetSet.desiredCount,
        numberOfValues: e.automaticFacetSet.numberOfValues,
        currentFacets: i
      }
    },
    ...e.generatedAnswer && {
      pipelineRuleParameters: {
        mlGenerativeQuestionAnswering: {
          responseFormat: e.generatedAnswer.responseFormat,
          citationsFieldToInclude: e.generatedAnswer.fieldsToIncludeInCitations
        }
      }
    }
  });
};
function tb(e) {
  var n;
  const t = (n = e.automaticFacetSet) == null ? void 0 : n.set;
  return t ? Object.values(t).map((r) => r.response).map(nb).filter((r) => r.currentValues.length > 0) : void 0;
}
function nb(e) {
  const { field: t, label: n, values: r } = e, i = r.filter((s) => s.state === "selected");
  return {
    field: t,
    label: n,
    currentValues: i
  };
}
function rb(e) {
  var s;
  const t = ((s = e.advancedSearchQueries) == null ? void 0 : s.cq.trim()) || "", n = Object.values(e.tabSet || {}).find((o) => o.isActive), r = (n == null ? void 0 : n.expression.trim()) || "", i = ib(e);
  return [t, r, ...i].filter((o) => !!o).join(" AND ");
}
function ib(e) {
  return Object.values(e.staticFilterSet || {}).map((n) => {
    const r = n.values.filter((s) => s.state === "selected" && !!s.expression.trim()), i = r.map((s) => s.expression).join(" OR ");
    return r.length > 1 ? `(${i})` : i;
  });
}
let Gn = class {
  constructor(t, n = (r) => {
    this.dispatch(Ei({ q: r }));
  }) {
    ee(this, "config");
    ee(this, "onUpdateQueryForCorrection");
    this.config = t, this.onUpdateQueryForCorrection = n;
  }
  async fetchFromAPI({ mappings: t, request: n }, r) {
    var c;
    const i = Date.now(), s = ld(await this.extra.apiClient.search(n, r), t), o = Date.now() - i, a = ((c = this.getState().query) == null ? void 0 : c.q) || "";
    return { response: s, duration: o, queryExecuted: a, requestExecuted: n };
  }
  async process(t) {
    return this.processQueryErrorOrContinue(t) ?? await this.processQueryCorrectionsOrContinue(t) ?? await this.processQueryTriggersOrContinue(t) ?? this.processSuccessResponse(t);
  }
  processQueryErrorOrContinue(t) {
    return mt(t.response) ? (this.dispatch(Kt(t.response.error)), this.rejectWithValue(t.response.error)) : null;
  }
  async processQueryCorrectionsOrContinue(t) {
    const n = this.getState(), r = this.getSuccessResponse(t);
    if (!r || !n.didYouMean)
      return null;
    const { enableDidYouMean: i, automaticallyCorrectQuery: s } = n.didYouMean, { results: o, queryCorrections: a, queryCorrection: c } = r;
    if (!i || !s)
      return null;
    const u = o.length === 0 && a && a.length !== 0, l = !Z(c) && !Z(c.correctedQuery);
    if (!u && !l)
      return null;
    const h = u ? await this.processLegacyDidYouMeanAutoCorrection(t) : this.processModernDidYouMeanAutoCorrection(t);
    return this.dispatch(ft(pt(this.getState()))), h;
  }
  async processLegacyDidYouMeanAutoCorrection(t) {
    const n = this.getCurrentQuery(), r = this.getSuccessResponse(t);
    if (!r.queryCorrections)
      return null;
    const { correctedQuery: i } = r.queryCorrections[0], s = await this.automaticallyRetryQueryWithCorrection(i);
    return mt(s.response) ? (this.dispatch(Kt(s.response.error)), this.rejectWithValue(s.response.error)) : (this.logOriginalAnalyticsQueryBeforeAutoCorrection(t), this.dispatch(ft(pt(this.getState()))), {
      ...s,
      response: {
        ...s.response.success,
        queryCorrections: r.queryCorrections
      },
      automaticallyCorrected: !0,
      originalQuery: n,
      analyticsAction: gc()
    });
  }
  processModernDidYouMeanAutoCorrection(t) {
    const n = this.getSuccessResponse(t), { correctedQuery: r, originalQuery: i } = n.queryCorrection;
    return this.onUpdateQueryForCorrection(r), {
      ...t,
      response: {
        ...n
      },
      queryExecuted: r,
      automaticallyCorrected: !0,
      originalQuery: i,
      analyticsAction: gc()
    };
  }
  logOriginalAnalyticsQueryBeforeAutoCorrection(t) {
    var i;
    const n = this.getState(), r = this.getSuccessResponse(t);
    (i = this.analyticsAction) == null || i.call(this)(this.dispatch, () => this.getStateAfterResponse(t.queryExecuted, t.duration, n, r), this.extra);
  }
  async processQueryTriggersOrContinue(t) {
    var a, c;
    const n = this.getSuccessResponse(t);
    if (!n)
      return null;
    const r = ((a = n.triggers.find((u) => u.type === "query")) == null ? void 0 : a.content) || "";
    if (!r)
      return null;
    if (((c = this.getState().triggers) == null ? void 0 : c.queryModification.queryToIgnore) === r)
      return this.dispatch(Dd("")), null;
    this.analyticsAction && await this.dispatch(this.analyticsAction);
    const s = this.getCurrentQuery(), o = await this.automaticallyRetryQueryWithTriggerModification(r);
    return mt(o.response) ? (this.dispatch(Kt(o.response.error)), this.rejectWithValue(o.response.error)) : (this.dispatch(ft(pt(this.getState()))), {
      ...o,
      response: {
        ...o.response.success
      },
      automaticallyCorrected: !1,
      originalQuery: s,
      analyticsAction: eb()
    });
  }
  getStateAfterResponse(t, n, r, i) {
    var s;
    return {
      ...r,
      query: {
        q: t,
        enableQuerySyntax: ((s = r.query) == null ? void 0 : s.enableQuerySyntax) ?? dn().enableQuerySyntax
      },
      search: {
        ...gt(),
        duration: n,
        response: i,
        results: i.results
      }
    };
  }
  processSuccessResponse(t) {
    return this.dispatch(ft(pt(this.getState()))), {
      ...t,
      response: this.getSuccessResponse(t),
      automaticallyCorrected: !1,
      originalQuery: this.getCurrentQuery(),
      analyticsAction: this.analyticsAction
    };
  }
  getSuccessResponse(t) {
    return Od(t.response) ? t.response.success : null;
  }
  async automaticallyRetryQueryWithCorrection(t) {
    this.onUpdateQueryForCorrection(t);
    const n = await this.fetchFromAPI(await nn(this.getState()), { origin: "mainSearch" });
    return this.dispatch(Ao(t)), n;
  }
  async automaticallyRetryQueryWithTriggerModification(t) {
    return this.dispatch(Td({
      newQuery: t,
      originalQuery: this.getCurrentQuery()
    })), this.onUpdateQueryForCorrection(t), await this.fetchFromAPI(await nn(this.getState()), { origin: "mainSearch" });
  }
  getCurrentQuery() {
    var n;
    const t = this.getState();
    return ((n = t.query) == null ? void 0 : n.q) !== void 0 ? t.query.q : "";
  }
  get extra() {
    return this.config.extra;
  }
  getState() {
    return this.config.getState();
  }
  get dispatch() {
    return this.config.dispatch;
  }
  get analyticsAction() {
    return this.config.analyticsAction;
  }
  get rejectWithValue() {
    return this.config.rejectWithValue;
  }
};
te("search/executeSearch", async (e, t) => {
  const n = t.getState();
  return await ko(n, t, e);
});
te("search/fetchPage", async (e, t) => {
  const n = t.getState();
  return await Pd(n, t, e);
});
te("search/fetchMoreResults", async (e, t) => {
  const n = t.getState();
  return await Vd(t, n);
});
te("search/fetchFacetValues", async (e, t) => {
  const n = t.getState();
  return await cb(t, e, n);
});
te("search/fetchInstantResults", async (e, t) => Md(e, t));
const sb = async (e, t) => {
  var r, i;
  const n = await nn(e, t);
  return n.request = {
    ...n.request,
    firstResult: (((r = e.pagination) == null ? void 0 : r.firstResult) ?? 0) + (((i = e.search) == null ? void 0 : i.results.length) ?? 0)
  }, n;
}, ob = async (e, t, n) => {
  const r = await bo(e);
  return bi({
    ...r,
    ...e.didYouMean && {
      enableDidYouMean: e.didYouMean.enableDidYouMean
    },
    numberOfResults: n,
    q: t
  });
}, ab = async (e, t) => {
  const n = await nn(e, t);
  return n.request.numberOfResults = 0, n;
}, _d = (e) => {
  var t;
  e.configuration.analytics.enabled && ln.getInstance().addElement({
    name: "Query",
    ...((t = e.query) == null ? void 0 : t.q) && {
      value: e.query.q
    },
    time: JSON.stringify(/* @__PURE__ */ new Date())
  });
};
async function Md(e, t) {
  O(e, {
    id: j,
    q: j,
    maxResultsPerQuery: new W({
      required: !0,
      min: 1
    }),
    cacheTimeout: new W()
  });
  const { q: n, maxResultsPerQuery: r } = e, i = t.getState(), s = new Gn({ ...t, analyticsAction: Nw() }, (u) => {
    t.dispatch(kd({ q: u, id: e.id }));
  }), o = await ob(i, n, r), a = await s.fetchFromAPI(o, {
    origin: "instantResults",
    disableAbortWarning: !0
  }), c = await s.process(a);
  return "response" in c ? {
    results: c.response.results,
    searchUid: c.response.searchUid,
    analyticsAction: c.analyticsAction,
    totalCountFiltered: c.response.totalCountFiltered,
    duration: c.duration
  } : c;
}
async function Pd(e, t, n) {
  _d(e);
  const { analyticsClientMiddleware: r, preprocessRequest: i, logger: s } = t.extra, { description: o } = await n.prepare({
    getState: () => t.getState(),
    analyticsClientMiddleware: r,
    preprocessRequest: i,
    logger: s
  }), a = new Gn({
    ...t,
    analyticsAction: n
  }), c = await nn(e, o), u = await a.fetchFromAPI(c, { origin: "mainSearch" });
  return await a.process(u);
}
async function Vd(e, t) {
  const { analyticsClientMiddleware: n, preprocessRequest: r, logger: i } = e.extra, { description: s } = await hc().prepare({
    getState: () => e.getState(),
    analyticsClientMiddleware: n,
    preprocessRequest: r,
    logger: i
  }), o = new Gn({
    ...e,
    analyticsAction: hc()
  }), a = await sb(t, s), c = await o.fetchFromAPI(a, { origin: "mainSearch" });
  return await o.process(c);
}
async function cb(e, t, n) {
  const { analyticsClientMiddleware: r, preprocessRequest: i, logger: s } = e.extra, { description: o } = await t.prepare({
    getState: () => e.getState(),
    analyticsClientMiddleware: r,
    preprocessRequest: i,
    logger: s
  }), a = new Gn({ ...e, analyticsAction: t }), c = await ab(n, o), u = await a.fetchFromAPI(c, {
    origin: "facetValues"
  });
  return await a.process(u);
}
async function ko(e, t, n) {
  _d(e);
  const { analyticsClientMiddleware: r, preprocessRequest: i, logger: s } = t.extra, { description: o } = await n.prepare({
    getState: () => t.getState(),
    analyticsClientMiddleware: r,
    preprocessRequest: i,
    logger: s
  }), a = await nn(e, o), c = new Gn({ ...t, analyticsAction: n }), u = await c.fetchFromAPI(a, { origin: "mainSearch" });
  return await c.process(u);
}
class Jn {
  constructor(t, n = (r) => {
    this.dispatch(Ei({ q: r }));
  }) {
    ee(this, "config");
    ee(this, "onUpdateQueryForCorrection");
    this.config = t, this.onUpdateQueryForCorrection = n;
  }
  async fetchFromAPI({ mappings: t, request: n }, r) {
    var c;
    const i = Date.now(), s = ld(await this.extra.apiClient.search(n, r), t), o = Date.now() - i, a = ((c = this.getState().query) == null ? void 0 : c.q) || "";
    return { response: s, duration: o, queryExecuted: a, requestExecuted: n };
  }
  async process(t) {
    return this.processQueryErrorOrContinue(t) ?? await this.processQueryCorrectionsOrContinue(t) ?? await this.processQueryTriggersOrContinue(t) ?? this.processSuccessResponse(t);
  }
  processQueryErrorOrContinue(t) {
    return mt(t.response) ? (this.dispatch(Kt(t.response.error)), this.rejectWithValue(t.response.error)) : null;
  }
  async processQueryCorrectionsOrContinue(t) {
    const n = this.getState(), r = this.getSuccessResponse(t);
    if (!r || !n.didYouMean)
      return null;
    const { enableDidYouMean: i, automaticallyCorrectQuery: s } = n.didYouMean, { results: o, queryCorrections: a, queryCorrection: c } = r;
    if (!i)
      return null;
    if (!s)
      return !Z(c) && !Z(c.correctedQuery) ? this.processModernDidYouMeanAutoCorrection(t) : null;
    const u = o.length === 0 && a && a.length !== 0, l = !Z(c) && !Z(c.correctedQuery);
    if (!u && !l)
      return null;
    const h = u ? await this.processLegacyDidYouMeanAutoCorrection(t) : this.processModernDidYouMeanAutoCorrection(t);
    return this.dispatch(ft(pt(this.getState()))), h;
  }
  async processLegacyDidYouMeanAutoCorrection(t) {
    const n = this.getCurrentQuery(), r = this.getSuccessResponse(t);
    if (!r.queryCorrections)
      return null;
    const { correctedQuery: i } = r.queryCorrections[0], s = await this.automaticallyRetryQueryWithCorrection(i);
    return mt(s.response) ? (this.dispatch(Kt(s.response.error)), this.rejectWithValue(s.response.error)) : (this.dispatch(ft(pt(this.getState()))), {
      ...s,
      response: {
        ...s.response.success,
        queryCorrections: r.queryCorrections
      },
      automaticallyCorrected: !0,
      originalQuery: n
    });
  }
  processModernDidYouMeanAutoCorrection(t) {
    const n = this.getSuccessResponse(t), { correctedQuery: r, originalQuery: i } = n.queryCorrection;
    return this.onUpdateQueryForCorrection(r), {
      ...t,
      response: {
        ...n
      },
      queryExecuted: r,
      automaticallyCorrected: !0,
      originalQuery: i
    };
  }
  async processQueryTriggersOrContinue(t) {
    var a, c;
    const n = this.getSuccessResponse(t);
    if (!n)
      return null;
    const r = ((a = n.triggers.find((u) => u.type === "query")) == null ? void 0 : a.content) || "";
    if (!r)
      return null;
    if (((c = this.getState().triggers) == null ? void 0 : c.queryModification.queryToIgnore) === r)
      return this.dispatch(Dd("")), null;
    const s = this.getCurrentQuery(), o = await this.automaticallyRetryQueryWithTriggerModification(r);
    return mt(o.response) ? (this.dispatch(Kt(o.response.error)), this.rejectWithValue(o.response.error)) : (this.dispatch(ft(pt(this.getState()))), {
      ...o,
      response: {
        ...o.response.success
      },
      automaticallyCorrected: !1,
      originalQuery: s
    });
  }
  processSuccessResponse(t) {
    return this.dispatch(ft(pt(this.getState()))), {
      ...t,
      response: this.getSuccessResponse(t),
      automaticallyCorrected: !1,
      originalQuery: this.getCurrentQuery()
    };
  }
  getSuccessResponse(t) {
    return Od(t.response) ? t.response.success : null;
  }
  async automaticallyRetryQueryWithCorrection(t) {
    this.onUpdateQueryForCorrection(t);
    const n = this.getState(), { actionCause: r } = Ww(), i = await this.fetchFromAPI(await vt(n, this.extra.navigatorContext, {
      actionCause: r
    }), { origin: "mainSearch" });
    return this.dispatch(Ao(t)), i;
  }
  async automaticallyRetryQueryWithTriggerModification(t) {
    return this.dispatch(Td({
      newQuery: t,
      originalQuery: this.getCurrentQuery()
    })), this.onUpdateQueryForCorrection(t), await this.fetchFromAPI(await vt(this.getState(), this.extra.navigatorContext), { origin: "mainSearch" });
  }
  getCurrentQuery() {
    var n;
    const t = this.getState();
    return ((n = t.query) == null ? void 0 : n.q) !== void 0 ? t.query.q : "";
  }
  get extra() {
    return this.config.extra;
  }
  getState() {
    return this.config.getState();
  }
  get dispatch() {
    return this.config.dispatch;
  }
  get rejectWithValue() {
    return this.config.rejectWithValue;
  }
}
te("search/prepareForSearchWithQuery", (e, t) => {
  const { dispatch: n } = t;
  O(e, {
    q: new L(),
    enableQuerySyntax: new re(),
    clearFilters: new re()
  }), e.clearFilters && (n(Wn()), n(bd())), n(Ed({ allow: !0 })), n(Ei({ q: e.q, enableQuerySyntax: e.enableQuerySyntax })), n(Rd(1));
});
const ub = S("search/updateSearchAction"), Ve = te("search/executeSearch", async (e, t) => {
  const n = t.getState();
  if (n.configuration.analytics.analyticsMode === "legacy")
    return ko(n, t, e.legacy);
  $d(n);
  const r = e.next ? Nd(e.next) : void 0, i = await vt(n, t.extra.navigatorContext, r), s = new Jn({ ...t, analyticsAction: r ?? {} }), o = await s.fetchFromAPI(i, {
    origin: "mainSearch"
  });
  return await s.process(o);
}), Pr = te("search/fetchPage", async (e, t) => {
  const n = t.getState();
  if ($d(n), n.configuration.analytics.analyticsMode === "legacy" || !e.next)
    return Pd(n, t, e.legacy);
  const r = new Jn({
    ...t,
    analyticsAction: e.next
  }), i = await vt(n, t.extra.navigatorContext, e.next), s = await r.fetchFromAPI(i, { origin: "mainSearch" });
  return await r.process(s);
}), es = te("search/fetchMoreResults", async (e, t) => {
  const n = t.getState();
  if (n.configuration.analytics.analyticsMode === "legacy")
    return Vd(t, n);
  const r = Ow(tn.browseResults, t.getState), i = new Jn({
    ...t,
    analyticsAction: r
  }), s = await lb(n, t.extra.navigatorContext, r), o = await i.fetchFromAPI(s, { origin: "mainSearch" });
  return await i.process(o);
}), Ud = te("search/fetchFacetValues", async (e, t) => {
  const n = t.getState();
  if (n.configuration.analytics.analyticsMode === "legacy")
    return ko(n, t, e.legacy);
  const r = new Jn({ ...t, analyticsAction: {} }), i = await fb(n, t.extra.navigatorContext), s = await r.fetchFromAPI(i, {
    origin: "facetValues"
  });
  return await r.process(s);
});
te("search/fetchInstantResults", async (e, t) => {
  const n = t.getState();
  if (n.configuration.analytics.analyticsMode === "legacy")
    return Md(e, t);
  O(e, {
    id: j,
    q: j,
    maxResultsPerQuery: new W({
      required: !0,
      min: 1
    }),
    cacheTimeout: new W()
  });
  const { q: r, maxResultsPerQuery: i } = e, s = Nd(Lw()), o = await db(n, t.extra.navigatorContext, r, i, s), a = new Jn({ ...t, analyticsAction: s }, (l) => {
    t.dispatch(kd({ q: l, id: e.id }));
  }), c = await a.fetchFromAPI(o, {
    origin: "instantResults",
    disableAbortWarning: !0
  }), u = await a.process(c);
  return "response" in u ? {
    results: u.response.results,
    searchUid: u.response.searchUid,
    totalCountFiltered: u.response.totalCountFiltered,
    duration: u.duration
  } : u;
});
const lb = async (e, t, n) => {
  var i, s;
  const r = await vt(e, t, n);
  return r.request = {
    ...r.request,
    firstResult: (((i = e.pagination) == null ? void 0 : i.firstResult) ?? 0) + (((s = e.search) == null ? void 0 : s.results.length) ?? 0)
  }, r;
}, db = async (e, t, n, r, i) => {
  const s = sd(e, t, i);
  return bi({
    ...s,
    ...e.didYouMean && {
      enableDidYouMean: e.didYouMean.enableDidYouMean
    },
    numberOfResults: r,
    q: n
  });
}, fb = async (e, t, n) => {
  const r = await vt(e, t, n);
  return r.request.numberOfResults = 0, r;
}, $d = (e) => {
  var t;
  e.configuration.analytics.enabled && ln.getInstance().addElement({
    name: "Query",
    ...((t = e.query) == null ? void 0 : t.q) && {
      value: e.query.q
    },
    time: JSON.stringify(/* @__PURE__ */ new Date())
  });
}, Nd = (e) => ({
  actionCause: e.actionCause,
  type: e.actionCause
}), Ld = {
  q: new L(),
  enableQuerySyntax: new re(),
  aq: new L(),
  cq: new L(),
  firstResult: new W({ min: 0 }),
  numberOfResults: new W({ min: 0 }),
  sortCriteria: new L(),
  f: new z(),
  fExcluded: new z(),
  cf: new z(),
  nf: new z(),
  mnf: new z(),
  df: new z(),
  debug: new re(),
  sf: new z(),
  tab: new L(),
  af: new z()
}, Ct = S("searchParameters/restore", (e) => O(e, Ld)), pb = S("searchParameters/restoreTab", (e) => O(e, j));
S("tab/register", (e) => {
  const t = new z({
    values: {
      id: j,
      expression: Ue
    }
  });
  return O(e, t);
});
const Zn = S("tab/updateActiveTab", (e) => O(e, j));
function Ro(e, t) {
  var s;
  const { facetId: n, criterion: r } = t, i = (s = e[n]) == null ? void 0 : s.request;
  i && (i.sortCriteria = r);
}
function mn(e) {
  e && (e.currentValues = e.currentValues.map((t) => ({
    ...t,
    previousState: t.state !== "idle" ? t.state : void 0,
    state: "idle"
  })), e.preventAutoSelect = !0);
}
function hb(e, t) {
  e && (e.numberOfValues = t);
}
const jd = new L({
  regex: /^[a-zA-Z0-9-_]+$/
}), Qd = new L({ required: !0 });
new ce({
  each: new L()
});
new L();
const zd = new re(), Bd = new W({ min: 0 }), Oo = new W({ min: 1 }), Hd = new re({
  required: !0
}), gb = new z(), mb = new L(), yb = {
  captions: gb,
  numberOfValues: Oo,
  query: mb
};
new z({
  values: yb
});
const vb = new z({
  options: { required: !1 },
  values: {
    type: new L({
      constrainTo: ["simple"],
      emptyAllowed: !1,
      required: !0
    }),
    values: new ce({
      required: !0,
      max: 25,
      each: new L({ emptyAllowed: !1, required: !0 })
    })
  }
}), Sb = new ce({
  min: 1,
  max: 25,
  required: !1,
  each: new L({ emptyAllowed: !1, required: !0 })
}), fn = {
  value: j,
  numberOfResults: new W({ min: 0 }),
  state: j
}, wb = {
  facetId: le,
  field: new L({ required: !0, emptyAllowed: !0 }),
  tabs: new z({
    options: {
      required: !1
    },
    values: {
      included: new ce({ each: new L() }),
      excluded: new ce({ each: new L() })
    }
  }),
  activeTab: new L({ required: !1 }),
  filterFacetCount: new re({ required: !1 }),
  injectionDepth: new W({ required: !1, min: 0 }),
  numberOfValues: new W({ required: !1, min: 1 }),
  sortCriteria: new Ae({ required: !1 }),
  resultsMustMatch: new Ae({ required: !1 }),
  allowedValues: vb,
  customSort: Sb
}, Yd = S("facet/register", (e) => O(e, wb)), Wd = S("facet/toggleSelectValue", (e) => O(e, {
  facetId: le,
  selection: new z({ values: fn })
})), Kd = S("facet/toggleExcludeValue", (e) => O(e, {
  facetId: le,
  selection: new z({ values: fn })
})), ki = S("facet/deselectAll", (e) => O(e, le)), bb = S("facet/updateSortCriterion", (e) => O(e, {
  facetId: le,
  criterion: new Ae({ required: !0 })
})), Cb = S("facet/updateNumberOfValues", (e) => O(e, {
  facetId: le,
  numberOfValues: new W({ required: !0, min: 1 })
})), Ib = S("facet/updateIsFieldExpanded", (e) => O(e, {
  facetId: le,
  isFieldExpanded: new re({ required: !0 })
})), Ab = S("facet/updateFreezeCurrentValues", (e) => O(e, {
  facetId: le,
  freezeCurrentValues: new re({ required: !0 })
}));
se(So(), (e) => {
  e.addCase(Yd, (t, n) => {
    const { facetId: r, tabs: i } = n.payload;
    r in t || (t[r] = jv(Eb(n.payload), i));
  }).addCase(ot.fulfilled, (t, n) => {
    if (n.payload && Object.keys(n.payload.facetSet).length !== 0)
      return n.payload.facetSet;
  }).addCase(Ct, (t, n) => {
    const r = n.payload.f || {}, i = n.payload.fExcluded || {};
    Object.keys(t).forEach((o) => {
      const { request: a } = t[o], c = r[o] || [], u = i[o] || [], l = c.length + u.length, f = a.currentValues.filter((h) => !c.includes(h.value) && !u.includes(h.value));
      a.currentValues = [
        ...c.map(yc),
        ...u.map(vc),
        ...f.map(kb)
      ], a.preventAutoSelect = l > 0, a.numberOfValues = Math.max(l, a.numberOfValues);
    });
  }).addCase(Wd, (t, n) => {
    var c;
    const { facetId: r, selection: i } = n.payload, s = (c = t[r]) == null ? void 0 : c.request;
    if (!s)
      return;
    s.preventAutoSelect = !0;
    const o = s.currentValues.find((u) => u.value === i.value);
    if (!o) {
      vr(s, i);
      return;
    }
    const a = o.state === "selected";
    o.previousState = o.state, o.state = a ? "idle" : "selected", s.freezeCurrentValues = !0;
  }).addCase(Kd, (t, n) => {
    var c;
    const { facetId: r, selection: i } = n.payload, s = (c = t[r]) == null ? void 0 : c.request;
    if (!s)
      return;
    s.preventAutoSelect = !0;
    const o = s.currentValues.find((u) => u.value === i.value);
    if (!o) {
      vr(s, i);
      return;
    }
    const a = o.state === "excluded";
    o.previousState = o.state, o.state = a ? "idle" : "excluded", s.freezeCurrentValues = !0;
  }).addCase(Ab, (t, n) => {
    var o;
    const { facetId: r, freezeCurrentValues: i } = n.payload, s = (o = t[r]) == null ? void 0 : o.request;
    s && (s.freezeCurrentValues = i);
  }).addCase(ki, (t, n) => {
    var r;
    mn((r = t[n.payload]) == null ? void 0 : r.request);
  }).addCase(Wn, (t) => {
    Object.values(t).filter((n) => n.hasBreadcrumbs).forEach(({ request: n }) => mn(n));
  }).addCase(bd, (t) => {
    Object.values(t).filter((n) => !n.hasBreadcrumbs).forEach(({ request: n }) => mn(n));
  }).addCase(Ed, (t, n) => Object.values(t).forEach((r) => {
    r.request.preventAutoSelect = !n.payload.allow;
  })).addCase(bb, (t, n) => {
    Ro(t, n.payload);
  }).addCase(Cb, (t, n) => {
    var s;
    const { facetId: r, numberOfValues: i } = n.payload;
    hb((s = t[r]) == null ? void 0 : s.request, i);
  }).addCase(Ib, (t, n) => {
    var o;
    const { facetId: r, isFieldExpanded: i } = n.payload, s = (o = t[r]) == null ? void 0 : o.request;
    s && (s.isFieldExpanded = i);
  }).addCase(Ve.fulfilled, (t, n) => {
    n.payload.response.facets.forEach((i) => {
      var s;
      return mc((s = t[i.facetId]) == null ? void 0 : s.request, i);
    });
  }).addCase(Ud.fulfilled, (t, n) => {
    n.payload.response.facets.forEach((i) => {
      var s;
      return mc((s = t[i.facetId]) == null ? void 0 : s.request, i);
    });
  }).addCase(Ci, (t, n) => {
    var l;
    const { facetId: r, value: i } = n.payload, s = (l = t[r]) == null ? void 0 : l.request;
    if (!s)
      return;
    const { rawValue: o } = i, { currentValues: a } = s, c = a.find((f) => f.value === o);
    if (c) {
      c.state = "selected";
      return;
    }
    const u = yc(o);
    vr(s, u), s.freezeCurrentValues = !0, s.preventAutoSelect = !0;
  }).addCase(Ii, (t, n) => {
    var l;
    const { facetId: r, value: i } = n.payload, s = (l = t[r]) == null ? void 0 : l.request;
    if (!s)
      return;
    const { rawValue: o } = i, { currentValues: a } = s, c = a.find((f) => f.value === o);
    if (c) {
      c.state = "excluded";
      return;
    }
    const u = vc(o);
    vr(s, u), s.freezeCurrentValues = !0, s.preventAutoSelect = !0;
  }).addCase(Ai, (t, n) => {
    if (!(n.payload in t))
      return;
    const { request: r } = t[n.payload];
    mn(r);
  }).addCase(Zn, (t, n) => {
    const r = n.payload;
    Object.keys(t).forEach((i) => {
      var a, c, u, l;
      const s = t[i];
      (((c = (a = s.tabs) == null ? void 0 : a.included) == null ? void 0 : c.length) || ((l = (u = s.tabs) == null ? void 0 : u.excluded) == null ? void 0 : l.length)) && !Co(s.tabs, r) && mn(s.request);
    });
  });
});
function vr(e, t) {
  const { currentValues: n } = e, r = n.findIndex((s) => s.state === "idle"), i = r === -1 ? n.length : r;
  e.currentValues.splice(i, 0, t), r > -1 && e.currentValues.pop(), e.numberOfValues = e.currentValues.length;
}
function mc(e, t) {
  e && (e.currentValues = t.values.map(Gd), e.freezeCurrentValues = !1, e.preventAutoSelect = !1);
}
const xb = {
  filterFacetCount: !0,
  injectionDepth: 1e3,
  numberOfValues: 8,
  sortCriteria: "automatic",
  resultsMustMatch: "atLeastOneValue"
};
function Eb(e) {
  return {
    ...xb,
    type: "specific",
    currentValues: [],
    freezeCurrentValues: !1,
    isFieldExpanded: !1,
    preventAutoSelect: !1,
    ...e
  };
}
function Gd(e) {
  const { value: t, state: n } = e;
  return { value: t, state: n };
}
function yc(e) {
  return { value: e, state: "selected" };
}
function vc(e) {
  return { value: e, state: "excluded" };
}
function kb(e) {
  return { ...e, state: "idle" };
}
const Jd = {
  filterFacetCount: !0,
  injectionDepth: 1e3,
  numberOfValues: 8,
  sortCriteria: "ascending",
  rangeAlgorithm: "even",
  resultsMustMatch: "atLeastOneValue"
};
function Zd(e, t) {
  const { request: n } = t, { facetId: r } = n;
  if (r in e)
    return;
  const i = sf(n);
  n.numberOfValues = i, e[r] = t;
}
function Xd(e, t, n) {
  var i;
  const r = (i = e[t]) == null ? void 0 : i.request;
  r && (r.currentValues = n, r.numberOfValues = sf(r));
}
function ef(e, t, n) {
  var o;
  const r = (o = e[t]) == null ? void 0 : o.request;
  if (!r)
    return;
  const i = ii(r.currentValues, n);
  if (!i)
    return;
  const s = i.state === "selected";
  i.previousState = i.state, i.state = s ? "idle" : "selected", r.preventAutoSelect = !0;
}
function tf(e, t, n) {
  var o;
  const r = (o = e[t]) == null ? void 0 : o.request;
  if (!r)
    return;
  const i = ii(r.currentValues, n);
  if (!i)
    return;
  const s = i.state === "excluded";
  i.previousState = i.state, i.state = s ? "idle" : "excluded", r.preventAutoSelect = !0;
}
function ht(e, t) {
  var r;
  const n = (r = e[t]) == null ? void 0 : r.request;
  n && n.currentValues.forEach((i) => {
    i.state !== "idle" && (i.previousState = i.state), i.state = "idle";
  });
}
function nf(e, t) {
  Object.entries(e).forEach(([n, { request: r }]) => {
    const i = t[n] || [];
    r.currentValues.forEach((a) => (!!ii(i, a) ? a.state = "selected" : typeof t == "object" && n in t && a.state !== "idle" && (a.previousState = a.state, a.state = "idle"), a));
    const s = i.filter((a) => !ii(r.currentValues, a)), o = r.currentValues;
    o.push(...s), r.numberOfValues = Math.max(r.numberOfValues, o.length);
  });
}
function rf(e, t, n) {
  t.forEach((r) => {
    var a;
    const i = r.facetId, s = (a = e[i]) == null ? void 0 : a.request;
    if (!s)
      return;
    const o = n(r.values);
    s.currentValues = o, s.preventAutoSelect = !1;
  });
}
function ii(e, t) {
  const { start: n, end: r } = t;
  return e.find((i) => i.start === n && i.end === r);
}
function Sr(e, t) {
  const { start: n, end: r, endInclusive: i } = t;
  return e.find((s) => s.start === n && s.end === r && s.endInclusive === i);
}
function sf(e) {
  const { generateAutomaticRanges: t, currentValues: n, numberOfValues: r } = e;
  return t ? Math.max(r, n.length) : n.length;
}
function Rb(e) {
  const t = Sc(e.start, e), n = Sc(e.end, e), r = e.endInclusive ?? !1, i = e.state ?? "idle";
  return {
    start: t,
    end: n,
    endInclusive: r,
    state: i
  };
}
function Sc(e, t) {
  const { dateFormat: n } = t;
  return Lg(e) ? (Ma(e), Ng(e)) : typeof e == "string" && _n(e) ? (Ma(e), e) : (Ug(e, n), cl(Gr(e, n)));
}
const of = S("rangeFacet/updateSortCriterion", (e) => O(e, {
  facetId: le,
  criterion: new Ae({ required: !0 })
})), Xn = {
  state: j,
  start: new W({ required: !0 }),
  end: new W({ required: !0 }),
  endInclusive: new re({ required: !0 }),
  numberOfResults: new W({ required: !0, min: 0 })
}, It = {
  start: j,
  end: j,
  endInclusive: new re({ required: !0 }),
  state: j,
  numberOfResults: new W({ required: !0, min: 0 })
}, af = (e) => ({
  facetId: le,
  selection: typeof e.start == "string" ? new z({ values: It }) : new z({ values: Xn })
}), Ob = {
  start: j,
  end: j,
  endInclusive: new re({ required: !0 }),
  state: j
}, qb = {
  facetId: le,
  field: j,
  tabs: new z({
    options: {
      required: !1
    },
    values: {
      included: new ce({ each: new L() }),
      excluded: new ce({ each: new L() })
    }
  }),
  activeTab: new L({ required: !1 }),
  currentValues: new ce({
    required: !1,
    each: new z({ values: Ob })
  }),
  generateAutomaticRanges: new re({ required: !0 }),
  filterFacetCount: new re({ required: !1 }),
  injectionDepth: new W({ required: !1, min: 0 }),
  numberOfValues: new W({ required: !1, min: 1 }),
  sortCriteria: new Ae({ required: !1 }),
  rangeAlgorithm: new Ae({ required: !1 })
};
function wc(e) {
  return _n(e) ? Ds(e) : e;
}
function qo(e) {
  e.currentValues && e.currentValues.forEach((t) => {
    const { start: n, end: r } = Rb(t);
    if (Gr(wc(n)).isAfter(Gr(wc(r))))
      throw new Error(`The start value is greater than the end value for the date range ${t.start} to ${t.end}`);
  });
}
const cf = S("dateFacet/register", (e) => {
  try {
    return Be(e, qb), qo(e), { payload: e, error: null };
  } catch (t) {
    return { payload: e, error: it(t) };
  }
}), Fo = S("dateFacet/toggleSelectValue", (e) => O(e, {
  facetId: le,
  selection: new z({ values: It })
})), Do = S("dateFacet/toggleExcludeValue", (e) => O(e, {
  facetId: le,
  selection: new z({ values: It })
})), uf = S("dateFacet/updateFacetValues", (e) => {
  try {
    return Be(e, {
      facetId: le,
      values: new ce({
        each: new z({ values: It })
      })
    }), qo({ currentValues: e.values }), { payload: e, error: null };
  } catch (t) {
    return { payload: e, error: it(t) };
  }
}), Fb = of, Db = ki;
se(yo(), (e) => {
  e.addCase(cf, (t, n) => {
    const { payload: r } = n, { tabs: i } = r, s = Tb(r);
    Zd(t, Nv(s, i));
  }).addCase(ot.fulfilled, (t, n) => {
    var r;
    return ((r = n.payload) == null ? void 0 : r.dateFacetSet) ?? t;
  }).addCase(Ct, (t, n) => {
    const r = n.payload.df || {};
    nf(t, r);
  }).addCase(Fo, (t, n) => {
    const { facetId: r, selection: i } = n.payload;
    ef(t, r, i);
  }).addCase(Do, (t, n) => {
    const { facetId: r, selection: i } = n.payload;
    tf(t, r, i);
  }).addCase(uf, (t, n) => {
    const { facetId: r, values: i } = n.payload;
    Xd(t, r, i);
  }).addCase(Db, (t, n) => {
    ht(t, n.payload);
  }).addCase(Wn, (t) => {
    Object.keys(t).forEach((n) => {
      ht(t, n);
    });
  }).addCase(Fb, (t, n) => {
    Ro(t, n.payload);
  }).addCase(Ve.fulfilled, (t, n) => {
    const r = n.payload.response.facets;
    rf(t, r, To);
  }).addCase(Ai, (t, n) => {
    ht(t, n.payload);
  }).addCase(Zn, (t, n) => {
    const r = n.payload;
    Object.keys(t).forEach((i) => {
      var a, c, u, l;
      const s = t[i];
      (((c = (a = s.tabs) == null ? void 0 : a.included) == null ? void 0 : c.length) || ((l = (u = s.tabs) == null ? void 0 : u.excluded) == null ? void 0 : l.length)) && !Co(s.tabs, r) && ht(t, i);
    });
  });
});
function Tb(e) {
  return {
    ...Jd,
    currentValues: [],
    preventAutoSelect: !1,
    type: "dateRange",
    ...e
  };
}
function To(e) {
  return e.map((t) => {
    const { numberOfResults: n, ...r } = t;
    return r;
  });
}
const _b = {
  state: j,
  start: new W({ required: !0 }),
  end: new W({ required: !0 }),
  endInclusive: new re({ required: !0 })
}, Mb = {
  facetId: le,
  field: j,
  tabs: new z({
    options: {
      required: !1
    },
    values: {
      included: new ce({ each: new L() }),
      excluded: new ce({ each: new L() })
    }
  }),
  activeTab: new L({ required: !1 }),
  currentValues: new ce({
    required: !1,
    each: new z({ values: _b })
  }),
  generateAutomaticRanges: new re({ required: !0 }),
  filterFacetCount: new re({ required: !1 }),
  injectionDepth: new W({ required: !1, min: 0 }),
  numberOfValues: new W({ required: !1, min: 1 }),
  sortCriteria: new Ae({ required: !1 }),
  rangeAlgorithm: new Ae({ required: !1 })
};
function _o(e) {
  e.currentValues && e.currentValues.forEach(({ start: t, end: n }) => {
    if (t > n)
      throw new Error(`The start value is greater than the end value for the numeric range ${t} to ${n}`);
  });
}
const lf = S("numericFacet/register", (e) => {
  try {
    return O(e, Mb), _o(e), { payload: e, error: null };
  } catch (t) {
    return { payload: e, error: it(t) };
  }
}), Mo = S("numericFacet/toggleSelectValue", (e) => O(e, {
  facetId: le,
  selection: new z({ values: Xn })
})), Po = S("numericFacet/toggleExcludeValue", (e) => O(e, {
  facetId: le,
  selection: new z({ values: Xn })
})), df = S("numericFacet/updateFacetValues", (e) => {
  try {
    return Be(e, {
      facetId: le,
      values: new ce({
        each: new z({ values: Xn })
      })
    }), _o({ currentValues: e.values }), { payload: e, error: null };
  } catch (t) {
    return { payload: e, error: it(t) };
  }
}), Pb = of, Vb = ki;
se(vo(), (e) => {
  e.addCase(lf, (t, n) => {
    const { payload: r } = n, { tabs: i } = r, s = Ub(r);
    Zd(t, Lv(s, i));
  }).addCase(ot.fulfilled, (t, n) => {
    var r;
    return ((r = n.payload) == null ? void 0 : r.numericFacetSet) ?? t;
  }).addCase(Ct, (t, n) => {
    const r = n.payload.nf || {};
    nf(t, r);
  }).addCase(Mo, (t, n) => {
    const { facetId: r, selection: i } = n.payload;
    ef(t, r, i);
  }).addCase(Po, (t, n) => {
    const { facetId: r, selection: i } = n.payload;
    tf(t, r, i);
  }).addCase(df, (t, n) => {
    const { facetId: r, values: i } = n.payload;
    Xd(t, r, i);
  }).addCase(Vb, (t, n) => {
    ht(t, n.payload);
  }).addCase(Wn, (t) => {
    Object.keys(t).forEach((n) => {
      ht(t, n);
    });
  }).addCase(Pb, (t, n) => {
    Ro(t, n.payload);
  }).addCase(Ve.fulfilled, (t, n) => {
    const r = n.payload.response.facets;
    rf(t, r, ff);
  }).addCase(Ai, (t, n) => {
    ht(t, n.payload);
  }).addCase(Zn, (t, n) => {
    const r = n.payload;
    Object.keys(t).forEach((i) => {
      var a, c, u, l;
      const s = t[i];
      (((c = (a = s.tabs) == null ? void 0 : a.included) == null ? void 0 : c.length) || ((l = (u = s.tabs) == null ? void 0 : u.excluded) == null ? void 0 : l.length)) && !Co(s.tabs, r) && ht(t, i);
    });
  });
});
function Ub(e) {
  return {
    ...Jd,
    currentValues: [],
    preventAutoSelect: !1,
    type: "numericalRange",
    ...e
  };
}
function ff(e) {
  return e.map((t) => {
    const { numberOfResults: n, ...r } = t;
    return r;
  });
}
const $b = {
  state: new Ae({ required: !0 }),
  numberOfResults: new W({ required: !0, min: 0 }),
  value: new L({ required: !0, emptyAllowed: !0 }),
  path: new ce({ required: !0, each: j }),
  moreValuesAvailable: new re({ required: !1 })
};
function Vo(e) {
  e.children.forEach((t) => {
    Vo(t);
  }), Be({
    state: e.state,
    numberOfResults: e.numberOfResults,
    value: e.value,
    path: e.path,
    moreValuesAvailable: e.moreValuesAvailable
  }, $b);
}
const Nb = S("commerce/facets/categoryFacet/updateNumberOfValues", (e) => O(e, {
  facetId: j,
  numberOfValues: new W({ required: !1, min: 1 })
})), Uo = S("commerce/facets/categoryFacet/toggleSelectValue", (e) => {
  try {
    return Be(e.facetId, j), Vo(e.selection), { payload: e, error: null };
  } catch (t) {
    return { payload: e, error: it(t) };
  }
}), $o = S("commerce/facets/dateFacet/toggleSelectValue", (e) => O(e, {
  facetId: j,
  selection: new z({ values: It })
})), No = S("commerce/facets/dateFacet/toggleExcludeValue", (e) => O(e, {
  facetId: j,
  selection: new z({ values: It })
})), Lb = S("commerce/facets/dateFacet/updateValues", (e) => {
  try {
    return Be(e, {
      facetId: j,
      values: new ce({
        each: new z({ values: It })
      })
    }), qo({ currentValues: e.values }), { payload: e, error: null };
  } catch (t) {
    return { payload: e, error: it(t) };
  }
}), Lo = S("commerce/facets/locationFacet/toggleSelectValue", (e) => O(e, {
  facetId: j,
  selection: new z({ values: fn })
})), Ri = S("commerce/facets/numericFacet/toggleSelectValue", (e) => O(e, {
  facetId: j,
  selection: new z({
    values: qi
  })
})), Oi = S("commerce/facets/numericFacet/toggleExcludeValue", (e) => O(e, {
  facetId: j,
  selection: new z({
    values: qi
  })
})), jb = S("commerce/facets/numericFacet/updateValues", (e) => {
  try {
    return Be(e, {
      facetId: j,
      values: new ce({
        each: new z({ values: qi })
      })
    }), _o({ currentValues: e.values }), { payload: e, error: null };
  } catch (t) {
    return { payload: e, error: it(t) };
  }
}), jo = S("commerce/facets/numericFacet/updateManualRange", (e) => Be(e, {
  facetId: j,
  ...qi
})), qi = {
  state: new L({
    required: !0,
    constrainTo: ["idle", "selected", "excluded"]
  }),
  start: new W({ required: !0 }),
  end: new W({ required: !0 }),
  endInclusive: new re({ required: !0 })
}, Qo = S("commerce/facets/regularFacet/toggleExcludeValue", (e) => O(e, {
  facetId: j,
  selection: new z({ values: fn })
})), zo = S("commerce/facets/regularFacet/toggleSelectValue", (e) => O(e, {
  facetId: j,
  selection: new z({ values: fn })
}));
function bc(e, t) {
  for (const n of Object.keys(e))
    delete e[n];
  t.payload.f && Cc(e, t.payload.f, "regular"), t.payload.lf && Cc(e, t.payload.lf, "location"), t.payload.nf && Ic(e, t.payload.nf, "numericalRange"), t.payload.mnf && Qb(e, t.payload.mnf), t.payload.df && Ic(e, t.payload.df, "dateRange"), t.payload.cf && zb(e, t.payload.cf);
}
function Cc(e, t, n) {
  const r = Object.entries(t);
  for (const [i, s] of r)
    e[i] = {
      request: {
        ...Fi(i),
        type: n,
        values: s.map((o) => {
          const a = {
            ...Bo(),
            value: o
          };
          switch (n) {
            case "regular":
              return a;
            case "location":
              return a;
          }
        })
      }
    };
}
function Ic(e, t, n) {
  const r = Object.entries(t);
  for (const [i, s] of r)
    e[i] = {
      request: {
        ...Fi(i),
        type: n,
        values: s.map((o) => {
          const a = {
            start: o.start,
            end: o.end,
            endInclusive: o.endInclusive,
            ...Bo()
          };
          switch (n) {
            case "dateRange":
              return a;
            case "numericalRange":
              return a;
          }
        })
      }
    };
}
function Qb(e, t) {
  const n = Object.entries(t);
  for (const [r, i] of n)
    e[r] = {
      request: {
        ...Fi(r),
        type: "numericalRange",
        interval: "continuous",
        values: i.map((s) => ({
          start: s.start,
          end: s.end,
          endInclusive: s.endInclusive,
          ...Bo()
        }))
      }
    };
}
function zb(e, t) {
  const n = Object.entries(t);
  for (const [r, i] of n)
    e[r] = {
      request: {
        ...Fi(r),
        type: "hierarchical",
        values: [],
        // eslint-disable-next-line @cspell/spellchecker
        // TODO CAPI-966: Remove delimitingCharacter
        delimitingCharacter: "|",
        // In the CAPI, the default retrieveCount is 5, while the default
        // numberOfValues is 8. We explicitly set retrieveCount to 8 when
        // restoring category facets to ensure a consistent show more / show
        // less behavior, given that the retrieveCount is not returned in the
        // API response.
        retrieveCount: 8
      }
    }, pf(e[r].request, i);
}
function Fi(e) {
  return {
    facetId: e,
    field: e,
    isFieldExpanded: !1,
    preventAutoSelect: !1
  };
}
function Bo() {
  return {
    state: "selected",
    isAutoSelected: !1,
    isSuggested: !1,
    moreValuesAvailable: !0
  };
}
function Bb(e) {
  return { state: "selected", value: e };
}
function pf(e, t, n) {
  e.values = Hb(t), e.numberOfValues = n, e.preventAutoSelect = !0;
}
function Hb(e) {
  if (!e.length)
    return [];
  const t = si(e[0]);
  let n = t;
  const [r, ...i] = e;
  for (const s of i) {
    const o = si(s);
    n.children.push(o), n = o;
  }
  return n.state = "selected", [t];
}
function si(e) {
  return {
    children: [],
    state: "idle",
    value: e
  };
}
function Yb() {
  return {};
}
se(Yb(), (e) => {
  e.addCase(Pe.fulfilled, Ac).addCase(Re.fulfilled, Ac).addCase(qt.fulfilled, (t, n) => xc(t, Pt(n.payload.facetId))).addCase(Ot.fulfilled, (t, n) => {
    if (n.payload.fieldSuggestionsFacets)
      for (const { facetId: r } of n.payload.fieldSuggestionsFacets)
        xc(t, Pt(r));
  }).addCase(zo, (t, n) => {
    var a;
    const { facetId: r, selection: i } = n.payload, s = (a = t[r]) == null ? void 0 : a.request;
    if (!s || !wr(s))
      return;
    s.preventAutoSelect = !0;
    const o = s.values.find((c) => c.value === i.value);
    if (!o) {
      Ye(s, i);
      return;
    }
    He(o, "select"), s.freezeCurrentValues = !0;
  }).addCase(Lo, (t, n) => {
    var a;
    const { facetId: r, selection: i } = n.payload, s = (a = t[r]) == null ? void 0 : a.request;
    if (!s || !Wb(s))
      return;
    const o = s.values.find((c) => c.value === i.value);
    if (!o) {
      Ye(s, i);
      return;
    }
    He(o, "select");
  }).addCase(Ri, (t, n) => {
    var a;
    const { facetId: r, selection: i } = n.payload, s = (a = t[r]) == null ? void 0 : a.request;
    if (!s || !ts(s))
      return;
    s.preventAutoSelect = !0;
    const o = Sr(s.values, i);
    if (!o) {
      Ye(s, i);
      return;
    }
    if (He(o, "select"), s.numberOfValues = s.initialNumberOfValues, s.interval === "continuous" && o.state === "idle") {
      s.values = [];
      return;
    }
  }).addCase($o, (t, n) => {
    var a;
    const { facetId: r, selection: i } = n.payload, s = (a = t[r]) == null ? void 0 : a.request;
    if (!s || !ns(s))
      return;
    s.preventAutoSelect = !0;
    const o = Sr(s.values, i);
    if (!o) {
      Ye(s, i);
      return;
    }
    He(o, "select");
  }).addCase(Uo, (t, n) => {
    var l;
    const { facetId: r, selection: i } = n.payload, s = (l = t[r]) == null ? void 0 : l.request;
    if (!Vr(s))
      return;
    const { path: o } = i, a = o.slice(0, o.length - 1), c = Kb(s, a);
    let u = c.find((f) => f.value === i.value);
    u || (u = si(i.value), c.push(u)), u.state = u.state === "idle" ? "selected" : "idle", u.state === "selected" && (s.numberOfValues = s.initialNumberOfValues, s.retrieveCount = s.initialNumberOfValues);
  }).addCase(Qo, (t, n) => {
    var a;
    const { facetId: r, selection: i } = n.payload, s = (a = t[r]) == null ? void 0 : a.request;
    if (!s || !wr(s))
      return;
    s.preventAutoSelect = !0;
    const o = s.values.find((c) => c.value === i.value);
    if (!o) {
      Ye(s, i);
      return;
    }
    He(o, "exclude"), s.freezeCurrentValues = !0;
  }).addCase(Oi, (t, n) => {
    var a;
    const { facetId: r, selection: i } = n.payload, s = (a = t[r]) == null ? void 0 : a.request;
    if (!s || !ts(s))
      return;
    s.preventAutoSelect = !0;
    const o = Sr(s.values, i);
    if (!o) {
      Ye(s, i);
      return;
    }
    if (He(o, "exclude"), s.numberOfValues = s.initialNumberOfValues, s.interval === "continuous" && o.state === "idle") {
      s.values = [];
      return;
    }
  }).addCase(No, (t, n) => {
    var a;
    const { facetId: r, selection: i } = n.payload, s = (a = t[r]) == null ? void 0 : a.request;
    if (!s || !ns(s))
      return;
    s.preventAutoSelect = !0;
    const o = Sr(s.values, i);
    if (!o) {
      Ye(s, i);
      return;
    }
    He(o, "exclude"), s.numberOfValues = s.initialNumberOfValues;
  }).addCase(Nb, (t, n) => {
    var o;
    const { facetId: r, numberOfValues: i } = n.payload, s = (o = t[r]) == null ? void 0 : o.request;
    Vr(s) && eC(s, i);
  }).addCase(Ci, (t, n) => {
    var c;
    const { facetId: r, value: i } = n.payload, s = (c = t[r]) == null ? void 0 : c.request;
    if (!s || !wr(s))
      return;
    const { rawValue: o } = i;
    s.freezeCurrentValues = !0, s.preventAutoSelect = !0;
    const a = s.values.find((u) => u.value === o);
    if (!a) {
      Ye(s, Bb(o));
      return;
    }
    He(a, "select");
  }).addCase(Ii, (t, n) => {
    var c;
    const { facetId: r, value: i } = n.payload, s = (c = t[r]) == null ? void 0 : c.request;
    if (!s || !wr(s))
      return;
    const { rawValue: o } = i;
    s.freezeCurrentValues = !0, s.preventAutoSelect = !0;
    const a = s.values.find((u) => u.value === o);
    if (!a) {
      Ye(s, { state: "excluded", value: o });
      return;
    }
    He(a, "exclude");
  }).addCase(po, (t, n) => {
    var a;
    const { facetId: r, value: i } = n.payload, s = (a = t[r]) == null ? void 0 : a.request;
    if (!Vr(s))
      return;
    const o = [...i.path, i.rawValue];
    pf(s, o, s.initialNumberOfValues);
  }).addCase(jb, (t, n) => {
    var o;
    const { facetId: r, values: i } = n.payload, s = (o = t[r]) == null ? void 0 : o.request;
    !s || !ts(s) || (s.values = i, s.numberOfValues = i.length);
  }).addCase(Lb, (t, n) => {
    var o;
    const { facetId: r, values: i } = n.payload, s = (o = t[r]) == null ? void 0 : o.request;
    !s || !ns(s) || (s.values = To(i), s.numberOfValues = i.length);
  }).addCase(qm, (t, n) => {
    var o;
    const { facetId: r, numberOfValues: i } = n.payload, s = (o = t[r]) == null ? void 0 : o.request;
    s && (s.numberOfValues = i);
  }).addCase(Fm, (t, n) => {
    var o;
    const { facetId: r, isFieldExpanded: i } = n.payload, s = (o = t[r]) == null ? void 0 : o.request;
    s && (s.isFieldExpanded = i);
  }).addCase(xl, (t, n) => Object.values(t).forEach((r) => {
    r.request.preventAutoSelect = !n.payload.allow;
  })).addCase(Dm, (t, n) => {
    var o;
    const { facetId: r, freezeCurrentValues: i } = n.payload, s = (o = t[r]) == null ? void 0 : o.request;
    s && (s.freezeCurrentValues = i);
  }).addCase(mi, (t, n) => {
    var s;
    const { facetId: r } = n.payload, i = (s = t[r]) == null ? void 0 : s.request;
    i && Qs(i);
  }).addCase(jo, (t, n) => {
    var s;
    const { facetId: r } = n.payload, i = (s = t[r]) == null ? void 0 : s.request;
    i && Qs(i);
  }).addCase(gi, Xb).addCase(uo, rs).addCase($t, rs).addCase(st, rs).addCase(wt, bc).addCase(cn, bc);
});
function wr(e) {
  return e.type === "regular";
}
function Wb(e) {
  return e.type === "location";
}
function ts(e) {
  return e.type === "numericalRange";
}
function ns(e) {
  return e.type === "dateRange";
}
function Vr(e) {
  return (e == null ? void 0 : e.type) === "hierarchical";
}
function Ac(e, t) {
  const n = new Set(Object.keys(e)), r = t.payload.response.facets;
  for (const i of r)
    Gb(e, i, n);
  for (const i of n)
    delete e[i];
}
function xc(e, t) {
  var r;
  let n = (r = e[t]) == null ? void 0 : r.request;
  n || (e[t] = { request: {} }, n = e[t].request, n.initialNumberOfValues = 10, n.values = []);
}
function Qs(e) {
  const t = () => {
    e.values.forEach((n) => {
      n.state = "idle";
    });
  };
  switch (e.type) {
    case "hierarchical":
      e.initialNumberOfValues = void 0, e.numberOfValues = void 0, e.values = [], e.preventAutoSelect = !0;
      break;
    case "numericalRange":
      e.numberOfValues = e.initialNumberOfValues, t();
      break;
    default:
      t();
      break;
  }
}
function Kb(e, t) {
  let n = e.values;
  for (const r of t) {
    let i = n[0];
    (!i || r !== i.value) && (i = si(r), n.length = 0, n.push(i)), i.state = "idle", n = i.children;
  }
  return n;
}
function He(e, t) {
  switch (e.state) {
    case "idle":
      e.state = t === "exclude" ? "excluded" : "selected";
      break;
    case "excluded":
      e.state = t === "exclude" ? "idle" : "selected";
      break;
    case "selected":
      e.state = t === "exclude" ? "excluded" : "idle";
      break;
  }
}
function Gb(e, t, n) {
  var s;
  const r = t.facetId ?? t.field;
  let i = (s = e[r]) == null ? void 0 : s.request;
  i ? n.delete(r) : (e[r] = { request: {} }, i = e[r].request), i.initialNumberOfValues === void 0 && (i.initialNumberOfValues = t.numberOfValues), i.facetId = r, i.displayName = t.displayName, i.numberOfValues = t.numberOfValues, i.field = t.field, i.type = t.type, i.values = Jb(t) ?? [], i.freezeCurrentValues = !1, i.preventAutoSelect = !1, t.type === "hierarchical" && Vr(i) ? i.delimitingCharacter = t.delimitingCharacter : t.type === "numericalRange" && (i.interval = t.interval, t.domain && (i.domain = {
    min: t.domain.min,
    max: t.domain.max,
    increment: t.domain.increment
  }));
}
function Jb(e) {
  switch (e.type) {
    case "numericalRange":
      return ff(e.values);
    case "dateRange":
      return To(e.values);
    case "hierarchical":
      return e.values.map(hf);
    case "regular":
      return e.values.map(Gd);
    case "location":
      return e.values.map(Zb);
    default:
      return;
  }
}
function hf(e) {
  const t = e.children.map(hf), { state: n, value: r } = e;
  return {
    children: t,
    state: n,
    value: r
  };
}
function Zb(e) {
  const { value: t, state: n } = e;
  return { value: t, state: n };
}
function Ye(e, t) {
  const { values: n } = e, r = n.findIndex((s) => s.state === "idle"), i = r === -1 ? n.length : r;
  e.values.splice(i, 0, t), r > -1 && e.values.pop(), e.numberOfValues = e.values.length;
}
function Xb(e) {
  Object.values(e).forEach((t) => Qs(t.request));
}
function rs(e) {
  Object.values(e).forEach((t) => {
    t.request.values = [];
  });
}
function eC(e, t) {
  e.numberOfValues = t, e.retrieveCount = t;
}
function tC() {
  return [];
}
se(tC(), (e) => {
  e.addCase(Ot.fulfilled, (t, n) => n.payload.fieldSuggestionsFacets ?? []);
});
function nC() {
  return {};
}
se(nC(), (e) => e.addCase(jo, (t, n) => {
  const { facetId: r, ...i } = n.payload;
  t[r] = { manualRange: i };
}).addCase(Oi, (t, n) => {
  br(t, n.payload.facetId);
}).addCase(Ri, (t, n) => {
  br(t, n.payload.facetId);
}).addCase(mi, (t, n) => {
  br(t, n.payload.facetId);
}).addCase(wt, (t, n) => {
  Ec(t, n.payload.mnf);
}).addCase(cn, (t, n) => {
  Ec(t, n.payload.mnf);
}).addCase(gi, (t) => {
  for (const n of Object.keys(t))
    br(t, n);
}));
const br = (e, t) => {
  e[t] && (e[t] = { manualRange: void 0 });
}, Ec = (e, t) => {
  for (const n of Object.keys(e))
    delete e[n];
  t && Object.entries(t).forEach(([n, r]) => {
    const i = r[0];
    e[n] = { manualRange: i };
  });
}, gf = {
  slotId: j,
  productId: new L({ required: !1, emptyAllowed: !1 })
}, mf = (e, t) => {
  var n;
  return e.recommendations && ((n = e.recommendations[t]) == null ? void 0 : n.products.length) || 0;
}, rC = fe((e, t) => ({
  total: _h(e, t),
  current: mf(e, t)
}), ({ current: e, total: t }) => e < t), yf = (e, t, n, r) => {
  const i = Al(t, n, e);
  return {
    ...i,
    context: {
      ...i.context,
      ...r ? { product: { productId: r } } : {},
      purchased: ym(t.cart)
    },
    slotId: e
  };
}, Ur = te("commerce/recommendations/fetch", async (e, { getState: t, rejectWithValue: n, extra: { apiClient: r, navigatorContext: i } }) => {
  const { slotId: s, productId: o } = e, a = yf(s, t(), i, o), c = await r.getRecommendations(a);
  return Qe(c) ? n(c.error) : {
    response: c.success
  };
}), is = te("commerce/recommendations/fetchMore", async (e, { getState: t, rejectWithValue: n, extra: { apiClient: r, navigatorContext: i } }) => {
  const s = e.slotId, o = t();
  if (rC(o, s))
    return null;
  const c = Th(o, s), l = mf(o, s) / c, f = {
    ...yf(s, o, i),
    page: l
  }, h = await r.getRecommendations(f);
  return Qe(h) ? n(h.error) : {
    response: h.success
  };
}), iC = S("commerce/recommendations/registerSlot", (e) => O(e, gf)), sC = {
  child: new z({
    options: { required: !0 },
    values: {
      permanentid: new L({ required: !0 })
    }
  }),
  ...gf
}, oC = S("commerce/recommendations/promoteChildToParent", (e) => O(e, sC)), Ho = S("commerce/sort/apply", (e) => O(e, {
  by: new Rn({
    enum: je,
    required: !0
  })
}));
se(dg(), (e) => {
  e.addCase(kl, (t, n) => {
    var i;
    const r = Cr(t, (i = n.payload) == null ? void 0 : i.slotId);
    r && r.page < r.totalPages - 1 && ++r.page;
  }).addCase(Rl, (t, n) => {
    var i;
    const r = Cr(t, (i = n.payload) == null ? void 0 : i.slotId);
    r && r.page > 0 && --r.page;
  }).addCase(lo, (t, n) => {
    const r = Cr(t, n.payload.slotId);
    r && n.payload.page >= 0 && n.payload.page < r.totalPages && (r.page = n.payload.page);
  }).addCase(El, (t, n) => {
    const r = Cr(t, n.payload.slotId);
    r && (r.page = 0, r.perPage = n.payload.pageSize);
  }).addCase(Pe.fulfilled, (t, n) => {
    t.principal = n.payload.response.pagination;
  }).addCase(Re.fulfilled, (t, n) => {
    t.principal = n.payload.response.pagination;
  }).addCase(Ur.fulfilled, (t, n) => {
    t.recommendations[n.meta.arg.slotId] = n.payload.response.pagination;
  }).addCase(Mm, (t, n) => {
    const r = n.payload.slotId;
    r in t.recommendations || (t.recommendations[r] = fi());
  }).addCase(gi, Fe).addCase(mi, Fe).addCase(zo, Fe).addCase(Qo, Fe).addCase(Lo, Fe).addCase(Ri, Fe).addCase(Oi, Fe).addCase($o, Fe).addCase(No, Fe).addCase(Uo, Fe).addCase(Ho, Fe).addCase($t, Fe).addCase(st, Fe).addCase(wt, kc).addCase(cn, kc);
});
function Cr(e, t) {
  return t ? e.recommendations[t] : e.principal;
}
function Fe(e) {
  e.principal.page = fi().page;
}
function kc(e, t) {
  t.payload.page ? e.principal.page = t.payload.page : e.principal.page = fi().page, t.payload.perPage && (e.principal.perPage = t.payload.perPage);
}
const er = S("app/setError"), ss = () => ({
  error: null,
  isLoading: !1,
  requestId: "",
  responseId: "",
  facets: [],
  products: [],
  results: []
});
se(ss(), (e) => {
  e.addCase(Pe.rejected, (t, n) => {
    os(t, n.payload);
  }).addCase(Bi.rejected, (t, n) => {
    os(t, n.payload);
  }).addCase(Pe.fulfilled, (t, n) => {
    const r = qc(n.payload);
    Rc(t, n.payload.response), t.products = Fc(n.payload.response.products, r, n.payload.response.responseId), t.results = Dc(n.payload.response.results, r, n.payload.response.responseId);
  }).addCase(Bi.fulfilled, (t, n) => {
    if (!n.payload)
      return;
    const r = qc(n.payload);
    Rc(t, n.payload.response), t.products = t.products.concat(Fc(n.payload.response.products, r, n.payload.response.responseId)), t.results = t.results.concat(Dc(n.payload.response.results, r, n.payload.response.responseId));
  }).addCase(Pe.pending, (t, n) => {
    Oc(t, n.meta.requestId);
  }).addCase(Bi.pending, (t, n) => {
    Oc(t, n.meta.requestId);
  }).addCase(Nm, (t, n) => {
    const r = t.results.length > 0 ? t.results : t.products;
    let i;
    const s = r.findIndex((h) => h.resultType === Me.SPOTLIGHT ? !1 : (i = h.children.find((m) => m.permanentid === n.payload.child.permanentid), !!i)), o = r[s];
    if (s === -1 || i === void 0 || o.resultType === Me.SPOTLIGHT)
      return;
    const a = o.responseId, c = o.position, { children: u, totalNumberOfChildren: l } = o, f = {
      ...i,
      resultType: Me.PRODUCT,
      children: u,
      totalNumberOfChildren: l,
      position: c,
      responseId: a
    };
    r.splice(s, 1, f);
  }).addCase(st, () => ss()).addCase($t, () => ss()).addCase(er, (t, n) => {
    os(t, n.payload);
  });
});
function os(e, t) {
  e.error = t || null, e.isLoading = !1;
}
function Rc(e, t) {
  e.error = null, e.facets = t.facets, e.responseId = t.responseId, e.isLoading = !1;
}
function Oc(e, t) {
  e.isLoading = !0, e.requestId = t;
}
function qc(e) {
  const t = e.response.pagination;
  return t.page * t.perPage;
}
function Fc(e, t, n) {
  return e.map((r, i) => vf(r, t + i + 1, n));
}
function Dc(e, t, n) {
  return e.map((r, i) => aC(r, t + i + 1, n));
}
function aC(e, t, n) {
  return e.resultType === Me.SPOTLIGHT ? cC(e, t, n) : vf(e, t, n);
}
function vf(e, t, n) {
  const r = e.children.some((a) => a.permanentid === e.permanentid);
  if (e.children.length === 0 || r)
    return { ...e, position: t, responseId: n };
  const { children: i, totalNumberOfChildren: s, ...o } = e;
  return {
    ...e,
    children: [o, ...i],
    position: t,
    responseId: n
  };
}
function cC(e, t, n) {
  return {
    ...e,
    position: t,
    responseId: n
  };
}
se(fg(), (e) => {
  e.addCase(vi, (t, n) => ({
    ...t,
    ...n.payload
  })).addCase(wt, (t, n) => {
    t.query = n.payload.q ?? "";
  }).addCase(yd, (t, n) => {
    t.query = n.payload.expression;
  });
});
const uC = () => ({}), lC = () => ({
  headline: "",
  error: null,
  isLoading: !1,
  responseId: "",
  products: [],
  productId: void 0
});
se(uC(), (e) => {
  e.addCase(iC, (t, n) => {
    const r = n.payload.slotId, i = n.payload.productId;
    if (!(r in t)) {
      if (!i) {
        t[r] = Tc();
        return;
      }
      t[r] = Tc({ productId: i });
    }
  }).addCase(Ur.rejected, (t, n) => {
    as(t, n.meta.arg.slotId, n.payload);
  }).addCase(is.rejected, (t, n) => {
    as(t, n.meta.arg.slotId, n.payload);
  }).addCase(Ur.fulfilled, (t, n) => {
    const r = n.meta.arg.slotId, i = n.payload.response;
    _c(t, r, i);
    const s = t[r];
    if (!s)
      return;
    const o = Pc(n.payload);
    s.products = i.products.map((a, c) => Vc(a, o + c + 1, i.responseId));
  }).addCase(is.fulfilled, (t, n) => {
    if (!n.payload)
      return;
    const r = n.meta.arg.slotId, i = n.payload.response;
    _c(t, r, i);
    const s = t[r];
    if (!s)
      return;
    const o = Pc(n.payload);
    s.products = s.products.concat(i.products.map((a, c) => Vc(a, o + c + 1, i.responseId)));
  }).addCase(Ur.pending, (t, n) => {
    Mc(t, n.meta.arg.slotId);
  }).addCase(is.pending, (t, n) => {
    Mc(t, n.meta.arg.slotId);
  }).addCase(oC, (t, n) => {
    const r = t[n.payload.slotId];
    if (!r)
      return;
    const { products: i } = r;
    let s;
    const o = i.findIndex((h) => (s = h.children.find((m) => m.permanentid === n.payload.child.permanentid), !!s));
    if (o === -1 || s === void 0)
      return;
    const a = i[o].responseId, c = i[o].position, { children: u, totalNumberOfChildren: l } = i[o], f = {
      ...s,
      resultType: Me.PRODUCT,
      children: u,
      totalNumberOfChildren: l,
      position: c,
      responseId: a
    };
    i.splice(o, 1, f);
  }).addCase(er, (t, n) => {
    Object.keys(t).forEach((r) => {
      as(t, r, n.payload);
    });
  });
});
function Tc(e) {
  return {
    ...lC(),
    ...e
  };
}
function as(e, t, n) {
  const r = e[t];
  r && (r.error = n ?? null, r.isLoading = !1);
}
function _c(e, t, n) {
  const r = e[t];
  r && (r.error = null, r.headline = n.headline, r.responseId = n.responseId, r.isLoading = !1);
}
function Mc(e, t) {
  const n = e[t];
  n && (n.isLoading = !0);
}
function Pc(e) {
  const t = e.response.pagination;
  return t.page * t.perPage;
}
function Vc(e, t, n) {
  const r = e.children.some((a) => a.permanentid === e.permanentid);
  if (e.children.length === 0 || r)
    return { ...e, position: t, responseId: n };
  const { children: i, totalNumberOfChildren: s, ...o } = e;
  return {
    ...e,
    children: [o, ...i],
    position: t,
    responseId: n
  };
}
const cs = () => ({
  error: null,
  isLoading: !1,
  requestId: "",
  responseId: "",
  products: [],
  results: [],
  facets: [],
  queryExecuted: ""
});
se(cs(), (e) => {
  e.addCase(Re.rejected, (t, n) => {
    Uc(t, n.payload);
  }).addCase(Qi.rejected, (t, n) => {
    Uc(t, n.payload);
  }).addCase(Re.fulfilled, (t, n) => {
    const r = Lc(n.payload);
    Nc(t, n.payload.response, n.payload.queryExecuted), t.products = n.payload.response.products.map((i, s) => zs(i, r + s + 1, n.payload.response.responseId)), t.results = jc(n.payload.response.results, r, n.payload.response.responseId);
  }).addCase(Qi.fulfilled, (t, n) => {
    if (!n.payload)
      return;
    const r = Lc(n.payload);
    Nc(t, n.payload.response, n.payload.queryExecuted), t.products = t.products.concat(n.payload.response.products.map((i, s) => {
      var o;
      return zs(i, r + s + 1, (o = n.payload) == null ? void 0 : o.response.responseId);
    })), t.results = t.results.concat(jc(n.payload.response.results, r, n.payload.response.responseId));
  }).addCase(Re.pending, (t, n) => {
    $c(t, n.meta.requestId);
  }).addCase(Qi.pending, (t, n) => {
    $c(t, n.meta.requestId);
  }).addCase(Vm, (t, n) => {
    const r = t.results.length > 0 ? t.results : t.products;
    let i;
    const s = r.findIndex((h) => h.resultType === Me.SPOTLIGHT ? !1 : (i = h.children.find((m) => m.permanentid === n.payload.child.permanentid), !!i)), o = r[s];
    if (s === -1 || i === void 0 || o.resultType === Me.SPOTLIGHT)
      return;
    const a = o.responseId, c = o.position, { children: u, totalNumberOfChildren: l } = o, f = {
      ...i,
      resultType: Me.PRODUCT,
      children: u,
      totalNumberOfChildren: l,
      position: c,
      responseId: a
    };
    r.splice(s, 1, f);
  }).addCase(st, () => cs()).addCase($t, () => cs()).addCase(er, (t, n) => {
    t.error = n.payload, t.isLoading = !1;
  });
});
function Uc(e, t) {
  e.error = t || null, e.isLoading = !1;
}
function $c(e, t) {
  e.isLoading = !0, e.requestId = t;
}
function Nc(e, t, n) {
  e.error = null, e.facets = t.facets, e.responseId = t.responseId, e.isLoading = !1, e.queryExecuted = n ?? "";
}
function Lc(e) {
  const t = e.response.pagination;
  return t.page * t.perPage;
}
function zs(e, t, n) {
  const r = e.children.some((a) => a.permanentid === e.permanentid);
  if (e.children.length === 0 || r)
    return { ...e, position: t, responseId: n };
  const { children: i, totalNumberOfChildren: s, ...o } = e;
  return {
    ...e,
    children: [o, ...i],
    position: t,
    responseId: n
  };
}
function jc(e, t, n) {
  return e.map((r, i) => dC(r, t + i + 1, n));
}
function dC(e, t, n) {
  return e.resultType === Me.SPOTLIGHT ? fC(e, t, n) : zs(e, t, n);
}
function fC(e, t, n) {
  return {
    ...e,
    position: t,
    responseId: n
  };
}
se(Rr(), (e) => {
  e.addCase(Ho, (t, n) => {
    t.appliedSort = n.payload;
  }).addCase(Pe.fulfilled, Qc).addCase(Re.fulfilled, Qc).addCase($t, Rr).addCase(st, Rr).addCase(wt, Bc).addCase(cn, Bc);
});
function Qc(e, t) {
  const n = t.payload.response;
  e.appliedSort = zc(n.sort.appliedSort), e.availableSorts = n.sort.availableSorts.map(zc);
}
const zc = (e) => e.sortCriteria === je.Relevance ? Fs() : {
  by: je.Fields,
  fields: (e.fields || []).map(({ field: t, direction: n, displayName: r }) => ({
    name: t,
    direction: n,
    displayName: r
  }))
};
function Bc(e, t) {
  if (t.payload.sortCriteria) {
    e.appliedSort = t.payload.sortCriteria;
    return;
  }
  e.appliedSort = Rr().appliedSort;
}
function Hc(e) {
  return e.query = "", e.queryModification = {
    originalQuery: "",
    newQuery: "",
    queryToIgnore: e.queryModification.queryToIgnore
  }, e;
}
function Yc(e, t) {
  const n = [], r = [], i = [], s = [];
  return t.forEach((o) => {
    switch (o.type) {
      case "redirect":
        n.push(o.content);
        break;
      case "query":
        r.push(o.content);
        break;
      case "execute":
        i.push({
          functionName: o.content.name,
          params: o.content.params
        });
        break;
      case "notify":
        s.push(o.content);
        break;
    }
  }), e.redirectTo = n[0] ?? "", e.query = e.queryModification.newQuery, e.executions = i, e.notifications = s, e;
}
function pC(e, t) {
  return e.queryModification = { ...t, queryToIgnore: "" }, e;
}
function hC(e, t) {
  return e.queryModification.queryToIgnore = t, e;
}
const gC = () => ({
  redirectTo: "",
  query: "",
  executions: [],
  notifications: [],
  queryModification: { originalQuery: "", newQuery: "", queryToIgnore: "" }
});
se(gC(), (e) => e.addCase(Re.pending, Hc).addCase(Re.fulfilled, (t, n) => Yc(t, n.payload.response.triggers)).addCase(Pe.pending, Hc).addCase(Pe.fulfilled, (t, n) => Yc(t, n.payload.response.triggers)).addCase(ql, (t, n) => pC(t, n.payload)).addCase(Ol, (t, n) => hC(t, n.payload.q)));
se(ao, (e) => e);
var mC = class extends Error {
  /**
   * Creates a schema error with useful information.
   *
   * @param issues The schema issues.
   */
  constructor(t) {
    super(t[0].message);
    /**
     * The schema issues.
     */
    ee(this, "issues");
    this.name = "SchemaError", this.issues = t;
  }
}, nt = "uninitialized", Bs = "pending", wn = "fulfilled", bn = "rejected";
function Wc(e) {
  return {
    status: e,
    isUninitialized: e === nt,
    isLoading: e === Bs,
    isSuccess: e === wn,
    isError: e === bn
  };
}
var Kc = Ft;
function Sf(e, t) {
  if (e === t || !(Kc(e) && Kc(t) || Array.isArray(e) && Array.isArray(t)))
    return t;
  const n = Object.keys(t), r = Object.keys(e);
  let i = n.length === r.length;
  const s = Array.isArray(t) ? [] : {};
  for (const o of n)
    s[o] = Sf(e[o], t[o]), i && (i = e[o] === s[o]);
  return i ? e : s;
}
function Hs(e, t, n) {
  return e.reduce((r, i, s) => (t(i, s) && r.push(n(i, s)), r), []).flat();
}
function yC(e) {
  return new RegExp("(^|:)//").test(e);
}
function vC() {
  return typeof document > "u" ? !0 : document.visibilityState !== "hidden";
}
function Yo(e) {
  return e != null;
}
function Gc(e) {
  return [...(e == null ? void 0 : e.values()) ?? []].filter(Yo);
}
function SC() {
  return typeof navigator > "u" || navigator.onLine === void 0 ? !0 : navigator.onLine;
}
var wC = (e) => e.replace(/\/$/, ""), bC = (e) => e.replace(/^\//, "");
function CC(e, t) {
  if (!e)
    return t;
  if (!t)
    return e;
  if (yC(t))
    return t;
  const n = e.endsWith("/") || !t.startsWith("?") ? "/" : "";
  return e = wC(e), t = bC(t), `${e}${n}${t}`;
}
function oi(e, t, n) {
  return e.has(t) ? e.get(t) : e.set(t, n(t)).get(t);
}
var Ys = () => /* @__PURE__ */ new Map(), IC = (e) => {
  const t = new AbortController();
  return setTimeout(() => {
    const n = "signal timed out", r = "TimeoutError";
    t.abort(
      // some environments (React Native, Node) don't have DOMException
      typeof DOMException < "u" ? new DOMException(n, r) : Object.assign(new Error(n), {
        name: r
      })
    );
  }, e), t.signal;
}, AC = (...e) => {
  for (const n of e) if (n.aborted) return AbortSignal.abort(n.reason);
  const t = new AbortController();
  for (const n of e)
    n.addEventListener("abort", () => t.abort(n.reason), {
      signal: t.signal,
      once: !0
    });
  return t.signal;
}, Jc = (...e) => fetch(...e), xC = (e) => e.status >= 200 && e.status <= 299, EC = (e) => (
  /*applicat*/
  /ion\/(vnd\.api\+)?json/.test(e.get("content-type") || "")
);
function Zc(e) {
  if (!Ft(e))
    return e;
  const t = {
    ...e
  };
  for (const [n, r] of Object.entries(t))
    r === void 0 && delete t[n];
  return t;
}
var kC = (e) => typeof e == "object" && (Ft(e) || Array.isArray(e) || typeof e.toJSON == "function");
function RC({
  baseUrl: e,
  prepareHeaders: t = (f) => f,
  fetchFn: n = Jc,
  paramsSerializer: r,
  isJsonContentType: i = EC,
  jsonContentType: s = "application/json",
  jsonReplacer: o,
  timeout: a,
  responseHandler: c,
  validateStatus: u,
  ...l
} = {}) {
  return typeof fetch > "u" && n === Jc && console.warn("Warning: `fetch` is not available. Please supply a custom `fetchFn` property to use `fetchBaseQuery` on SSR environments."), async (h, m, p) => {
    const {
      getState: d,
      extra: g,
      endpoint: b,
      forced: R,
      type: w
    } = m;
    let C, {
      url: v,
      headers: x = new Headers(l.headers),
      params: M = void 0,
      responseHandler: _ = c ?? "json",
      validateStatus: A = u ?? xC,
      timeout: E = a,
      ...I
    } = typeof h == "string" ? {
      url: h
    } : h, T = {
      ...l,
      signal: E ? AC(m.signal, IC(E)) : m.signal,
      ...I
    };
    x = new Headers(Zc(x)), T.headers = await t(x, {
      getState: d,
      arg: h,
      extra: g,
      endpoint: b,
      forced: R,
      type: w,
      extraOptions: p
    }) || x;
    const U = kC(T.body);
    if (T.body != null && !U && typeof T.body != "string" && T.headers.delete("content-type"), !T.headers.has("content-type") && U && T.headers.set("content-type", s), U && i(T.headers) && (T.body = JSON.stringify(T.body, o)), T.headers.has("accept") || (_ === "json" ? T.headers.set("accept", "application/json") : _ === "text" && T.headers.set("accept", "text/plain, text/html, */*")), M) {
      const $ = ~v.indexOf("?") ? "&" : "?", Q = r ? r(M) : new URLSearchParams(Zc(M));
      v += $ + Q;
    }
    v = CC(e, v);
    const q = new Request(v, T);
    C = {
      request: new Request(v, T)
    };
    let y;
    try {
      y = await n(q);
    } catch ($) {
      return {
        error: {
          status: ($ instanceof Error || typeof DOMException < "u" && $ instanceof DOMException) && $.name === "TimeoutError" ? "TIMEOUT_ERROR" : "FETCH_ERROR",
          error: String($)
        },
        meta: C
      };
    }
    const F = y.clone();
    C.response = F;
    let k, D = "";
    try {
      let $;
      if (await Promise.all([
        f(y, _).then((Q) => k = Q, (Q) => $ = Q),
        // see https://github.com/node-fetch/node-fetch/issues/665#issuecomment-538995182
        // we *have* to "use up" both streams at the same time or they will stop running in node-fetch scenarios
        F.text().then((Q) => D = Q, () => {
        })
      ]), $) throw $;
    } catch ($) {
      return {
        error: {
          status: "PARSING_ERROR",
          originalStatus: y.status,
          data: D,
          error: String($)
        },
        meta: C
      };
    }
    return A(y, k) ? {
      data: k,
      meta: C
    } : {
      error: {
        status: y.status,
        data: k
      },
      meta: C
    };
  };
  async function f(h, m) {
    if (typeof m == "function")
      return m(h);
    if (m === "content-type" && (m = i(h.headers) ? "json" : "text"), m === "json") {
      const p = await h.text();
      return p.length ? JSON.parse(p) : null;
    }
    return h.text();
  }
}
var Gt = class {
  constructor(e, t = void 0) {
    ee(this, "value");
    ee(this, "meta");
    this.value = e, this.meta = t;
  }
};
async function OC(e = 0, t = 5, n) {
  const r = Math.min(e, t), i = ~~((Math.random() + 0.4) * (300 << r));
  await new Promise((s, o) => {
    const a = setTimeout(() => s(), i);
    if (n) {
      const c = () => {
        clearTimeout(a), o(new Error("Aborted"));
      };
      n.aborted ? (clearTimeout(a), o(new Error("Aborted"))) : n.addEventListener("abort", c, {
        once: !0
      });
    }
  });
}
function wf(e, t) {
  throw Object.assign(new Gt({
    error: e,
    meta: t
  }), {
    throwImmediately: !0
  });
}
function us(e) {
  e.aborted && wf({
    status: "CUSTOM_ERROR",
    error: "Aborted"
  });
}
var Xc = {}, qC = (e, t) => async (n, r, i) => {
  const s = [5, (t || Xc).maxRetries, (i || Xc).maxRetries].filter((l) => l !== void 0), [o] = s.slice(-1), c = {
    maxRetries: o,
    backoff: OC,
    retryCondition: (l, f, {
      attempt: h
    }) => h <= o,
    ...t,
    ...i
  };
  let u = 0;
  for (; ; ) {
    us(r.signal);
    try {
      const l = await e(n, r, i);
      if (l.error)
        throw new Gt(l);
      return l;
    } catch (l) {
      if (u++, l.throwImmediately) {
        if (l instanceof Gt)
          return l.value;
        throw l;
      }
      if (l instanceof Gt) {
        if (!c.retryCondition(l.value.error, n, {
          attempt: u,
          baseQueryApi: r,
          extraOptions: i
        }))
          return l.value;
      } else if (u > c.maxRetries)
        return {
          error: l
        };
      us(r.signal);
      try {
        await c.backoff(u, c.maxRetries, r.signal);
      } catch (f) {
        throw us(r.signal), f;
      }
    }
  }
}, FC = /* @__PURE__ */ Object.assign(qC, {
  fail: wf
}), Di = "__rtkq/", DC = "online", TC = "offline", bf = "focused", Wo = /* @__PURE__ */ S(`${Di}${bf}`), Cf = /* @__PURE__ */ S(`${Di}un${bf}`), Ko = /* @__PURE__ */ S(`${Di}${DC}`), If = /* @__PURE__ */ S(`${Di}${TC}`), tr = "query", Af = "mutation", xf = "infinitequery";
function Ti(e) {
  return e.type === tr;
}
function _C(e) {
  return e.type === Af;
}
function nr(e) {
  return e.type === xf;
}
function ai(e) {
  return Ti(e) || nr(e);
}
function Go(e, t, n, r, i, s) {
  const o = MC(e) ? e(t, n, r, i) : e;
  return o ? Hs(o, Yo, (a) => s(Ef(a))) : [];
}
function MC(e) {
  return typeof e == "function";
}
function Ef(e) {
  return typeof e == "string" ? {
    type: e
  } : e;
}
function PC(e, t) {
  return e.catch(t);
}
var rn = (e, t) => e.endpointDefinitions[t], Pn = /* @__PURE__ */ Symbol("forceQueryFn"), Ws = (e) => typeof e[Pn] == "function";
function VC({
  serializeQueryArgs: e,
  queryThunk: t,
  infiniteQueryThunk: n,
  mutationThunk: r,
  api: i,
  context: s,
  getInternalState: o
}) {
  const a = (v) => {
    var x;
    return (x = o(v)) == null ? void 0 : x.runningQueries;
  }, c = (v) => {
    var x;
    return (x = o(v)) == null ? void 0 : x.runningMutations;
  }, {
    unsubscribeQueryResult: u,
    removeMutationResult: l,
    updateSubscriptionOptions: f
  } = i.internalActions;
  return {
    buildInitiateQuery: R,
    buildInitiateInfiniteQuery: w,
    buildInitiateMutation: C,
    getRunningQueryThunk: h,
    getRunningMutationThunk: m,
    getRunningQueriesThunk: p,
    getRunningMutationsThunk: d
  };
  function h(v, x) {
    return (M) => {
      var E;
      const _ = rn(s, v), A = e({
        queryArgs: x,
        endpointDefinition: _,
        endpointName: v
      });
      return (E = a(M)) == null ? void 0 : E.get(A);
    };
  }
  function m(v, x) {
    return (M) => {
      var _;
      return (_ = c(M)) == null ? void 0 : _.get(x);
    };
  }
  function p() {
    return (v) => Gc(a(v));
  }
  function d() {
    return (v) => Gc(c(v));
  }
  function g(v) {
    if (process.env.NODE_ENV !== "production") {
      if (g.triggered) return;
      const x = v(i.internalActions.internal_getRTKQSubscriptions());
      if (g.triggered = !0, typeof x != "object" || typeof (x == null ? void 0 : x.type) == "string")
        throw new Error(process.env.NODE_ENV === "production" ? ge(34) : `Warning: Middleware for RTK-Query API at reducerPath "${i.reducerPath}" has not been added to the store.
You must add the middleware for RTK-Query to function correctly!`);
    }
  }
  function b(v, x) {
    const M = (_, {
      subscribe: A = !0,
      forceRefetch: E,
      subscriptionOptions: I,
      [Pn]: T,
      ...U
    } = {}) => (q, N) => {
      var ie;
      const y = e({
        queryArgs: _,
        endpointDefinition: x,
        endpointName: v
      });
      let F;
      const k = {
        ...U,
        type: tr,
        subscribe: A,
        forceRefetch: E,
        subscriptionOptions: I,
        endpointName: v,
        originalArgs: _,
        queryCacheKey: y,
        [Pn]: T
      };
      if (Ti(x))
        F = t(k);
      else {
        const {
          direction: oe,
          initialPageParam: ue,
          refetchCachedPages: G
        } = U;
        F = n({
          ...k,
          // Supply these even if undefined. This helps with a field existence
          // check over in `buildSlice.ts`
          direction: oe,
          initialPageParam: ue,
          refetchCachedPages: G
        });
      }
      const D = i.endpoints[v].select(_), $ = q(F), Q = D(N());
      g(q);
      const {
        requestId: K,
        abort: Y
      } = $, ne = Q.requestId !== K, B = (ie = a(q)) == null ? void 0 : ie.get(y), X = () => D(N()), H = Object.assign(T ? (
        // a query has been forced (upsertQueryData)
        // -> we want to resolve it once data has been written with the data that will be written
        $.then(X)
      ) : ne && !B ? (
        // a query has been skipped due to a condition and we do not have any currently running query
        // -> we want to resolve it immediately with the current data
        Promise.resolve(Q)
      ) : (
        // query just started or one is already in flight
        // -> wait for the running query, then resolve with data from after that
        Promise.all([B, $]).then(X)
      ), {
        arg: _,
        requestId: K,
        subscriptionOptions: I,
        queryCacheKey: y,
        abort: Y,
        async unwrap() {
          const oe = await H;
          if (oe.isError)
            throw oe.error;
          return oe.data;
        },
        refetch: (oe) => q(M(_, {
          subscribe: !1,
          forceRefetch: !0,
          ...oe
        })),
        unsubscribe() {
          A && q(u({
            queryCacheKey: y,
            requestId: K
          }));
        },
        updateSubscriptionOptions(oe) {
          H.subscriptionOptions = oe, q(f({
            endpointName: v,
            requestId: K,
            queryCacheKey: y,
            options: oe
          }));
        }
      });
      if (!B && !ne && !T) {
        const oe = a(q);
        oe.set(y, H), H.then(() => {
          oe.delete(y);
        });
      }
      return H;
    };
    return M;
  }
  function R(v, x) {
    return b(v, x);
  }
  function w(v, x) {
    return b(v, x);
  }
  function C(v) {
    return (x, {
      track: M = !0,
      fixedCacheKey: _
    } = {}) => (A, E) => {
      const I = r({
        type: "mutation",
        endpointName: v,
        originalArgs: x,
        track: M,
        fixedCacheKey: _
      }), T = A(I);
      g(A);
      const {
        requestId: U,
        abort: q,
        unwrap: N
      } = T, y = PC(T.unwrap().then(($) => ({
        data: $
      })), ($) => ({
        error: $
      })), F = () => {
        A(l({
          requestId: U,
          fixedCacheKey: _
        }));
      }, k = Object.assign(y, {
        arg: T.arg,
        requestId: U,
        abort: q,
        unwrap: N,
        reset: F
      }), D = c(A);
      return D.set(U, k), k.then(() => {
        D.delete(U);
      }), _ && (D.set(_, k), k.then(() => {
        D.get(_) === k && D.delete(_);
      })), k;
    };
  }
}
var kf = class extends mC {
  constructor(t, n, r, i) {
    super(t);
    ee(this, "value");
    ee(this, "schemaName");
    ee(this, "_bqMeta");
    this.value = n, this.schemaName = r, this._bqMeta = i;
  }
}, xt = (e, t) => Array.isArray(e) ? e.includes(t) : !!e;
async function Et(e, t, n, r) {
  const i = await e["~standard"].validate(t);
  if (i.issues)
    throw new kf(i.issues, t, n, r);
  return i.value;
}
function eu(e) {
  return e;
}
var yn = (e = {}) => ({
  ...e,
  [no]: !0
});
function UC({
  reducerPath: e,
  baseQuery: t,
  context: {
    endpointDefinitions: n
  },
  serializeQueryArgs: r,
  api: i,
  assertTagType: s,
  selectors: o,
  onSchemaFailure: a,
  catchSchemaFailure: c,
  skipSchemaValidation: u
}) {
  const l = (I, T, U, q) => (N, y) => {
    const F = n[I], k = r({
      queryArgs: T,
      endpointDefinition: F,
      endpointName: I
    });
    if (N(i.internalActions.queryResultPatched({
      queryCacheKey: k,
      patches: U
    })), !q)
      return;
    const D = i.endpoints[I].select(T)(
      // Work around TS 4.1 mismatch
      y()
    ), $ = Go(F.providesTags, D.data, void 0, T, {}, s);
    N(i.internalActions.updateProvidedBy([{
      queryCacheKey: k,
      providedTags: $
    }]));
  };
  function f(I, T, U = 0) {
    const q = [T, ...I];
    return U && q.length > U ? q.slice(0, -1) : q;
  }
  function h(I, T, U = 0) {
    const q = [...I, T];
    return U && q.length > U ? q.slice(1) : q;
  }
  const m = (I, T, U, q = !0) => (N, y) => {
    const k = i.endpoints[I].select(T)(
      // Work around TS 4.1 mismatch
      y()
    ), D = {
      patches: [],
      inversePatches: [],
      undo: () => N(i.util.patchQueryData(I, T, D.inversePatches, q))
    };
    if (k.status === nt)
      return D;
    let $;
    if ("data" in k)
      if (Oe(k.data)) {
        const [Q, K, Y] = Ku(k.data, U);
        D.patches.push(...K), D.inversePatches.push(...Y), $ = Q;
      } else
        $ = U(k.data), D.patches.push({
          op: "replace",
          path: [],
          value: $
        }), D.inversePatches.push({
          op: "replace",
          path: [],
          value: k.data
        });
    return D.patches.length === 0 || N(i.util.patchQueryData(I, T, D.patches, q)), D;
  }, p = (I, T, U) => (q) => q(i.endpoints[I].initiate(T, {
    subscribe: !1,
    forceRefetch: !0,
    [Pn]: () => ({
      data: U
    })
  })), d = (I, T) => I.query && I[T] ? I[T] : eu, g = async (I, {
    signal: T,
    abort: U,
    rejectWithValue: q,
    fulfillWithValue: N,
    dispatch: y,
    getState: F,
    extra: k
  }) => {
    var Y, ne;
    const D = n[I.endpointName], {
      metaSchema: $,
      skipSchemaValidation: Q = u
    } = D, K = I.type === tr;
    try {
      let B = eu;
      const X = {
        signal: T,
        abort: U,
        dispatch: y,
        getState: F,
        extra: k,
        endpoint: I.endpointName,
        type: I.type,
        forced: K ? b(I, F()) : void 0,
        queryCacheKey: K ? I.queryCacheKey : void 0
      }, H = K ? I[Pn] : void 0;
      let ie;
      const oe = async (G, J, de, pe) => {
        if (J == null && G.pages.length)
          return Promise.resolve({
            data: G
          });
        const xe = {
          queryArg: I.originalArgs,
          pageParam: J
        }, ve = await ue(xe), qe = pe ? f : h;
        return {
          data: {
            pages: qe(G.pages, ve.data, de),
            pageParams: qe(G.pageParams, J, de)
          },
          meta: ve.meta
        };
      };
      async function ue(G) {
        let J;
        const {
          extraOptions: de,
          argSchema: pe,
          rawResponseSchema: xe,
          responseSchema: ve
        } = D;
        if (pe && !xt(Q, "arg") && (G = await Et(
          pe,
          G,
          "argSchema",
          {}
          // we don't have a meta yet, so we can't pass it
        )), H ? J = H() : D.query ? (B = d(D, "transformResponse"), J = await t(D.query(G), X, de)) : J = await D.queryFn(G, X, de, (he) => t(he, X, de)), typeof process < "u" && process.env.NODE_ENV === "development") {
          const he = D.query ? "`baseQuery`" : "`queryFn`";
          let _e;
          if (!J)
            _e = `${he} did not return anything.`;
          else if (typeof J != "object")
            _e = `${he} did not return an object.`;
          else if (J.error && J.data)
            _e = `${he} returned an object containing both \`error\` and \`result\`.`;
          else if (J.error === void 0 && J.data === void 0)
            _e = `${he} returned an object containing neither a valid \`error\` and \`result\`. At least one of them should not be \`undefined\``;
          else
            for (const at of Object.keys(J))
              if (at !== "error" && at !== "data" && at !== "meta") {
                _e = `The object returned by ${he} has the unknown property ${at}.`;
                break;
              }
          _e && console.error(`Error encountered handling the endpoint ${I.endpointName}.
                  ${_e}
                  It needs to return an object with either the shape \`{ data: <value> }\` or \`{ error: <value> }\` that may contain an optional \`meta\` property.
                  Object returned was:`, J);
        }
        if (J.error) throw new Gt(J.error, J.meta);
        let {
          data: qe
        } = J;
        xe && !xt(Q, "rawResponse") && (qe = await Et(xe, J.data, "rawResponseSchema", J.meta));
        let Se = await B(qe, J.meta, G);
        return ve && !xt(Q, "response") && (Se = await Et(ve, Se, "responseSchema", J.meta)), {
          ...J,
          data: Se
        };
      }
      if (K && "infiniteQueryOptions" in D) {
        const {
          infiniteQueryOptions: G
        } = D, {
          maxPages: J = 1 / 0
        } = G, de = I.refetchCachedPages ?? G.refetchCachedPages ?? !0;
        let pe;
        const xe = {
          pages: [],
          pageParams: []
        }, ve = (Y = o.selectQueryEntry(F(), I.queryCacheKey)) == null ? void 0 : Y.data, Se = /* arg.forceRefetch */ b(I, F()) && !I.direction || !ve ? xe : ve;
        if ("direction" in I && I.direction && Se.pages.length) {
          const he = I.direction === "backward", at = (he ? Rf : Ks)(G, Se, I.originalArgs);
          pe = await oe(Se, at, J, he);
        } else {
          const {
            initialPageParam: he = G.initialPageParam
          } = I, _e = (ve == null ? void 0 : ve.pageParams) ?? [], at = _e[0] ?? he, bp = _e.length;
          if (pe = await oe(Se, at, J), H && (pe = {
            data: pe.data.pages[0]
          }), de)
            for (let ea = 1; ea < bp; ea++) {
              const Cp = Ks(G, pe.data, I.originalArgs);
              pe = await oe(pe.data, Cp, J);
            }
        }
        ie = pe;
      } else
        ie = await ue(I.originalArgs);
      return $ && !xt(Q, "meta") && ie.meta && (ie.meta = await Et($, ie.meta, "metaSchema", ie.meta)), N(ie.data, yn({
        fulfilledTimeStamp: Date.now(),
        baseQueryMeta: ie.meta
      }));
    } catch (B) {
      let X = B;
      if (X instanceof Gt) {
        let H = d(D, "transformErrorResponse");
        const {
          rawErrorResponseSchema: ie,
          errorResponseSchema: oe
        } = D;
        let {
          value: ue,
          meta: G
        } = X;
        try {
          ie && !xt(Q, "rawErrorResponse") && (ue = await Et(ie, ue, "rawErrorResponseSchema", G)), $ && !xt(Q, "meta") && (G = await Et($, G, "metaSchema", G));
          let J = await H(ue, G, I.originalArgs);
          return oe && !xt(Q, "errorResponse") && (J = await Et(oe, J, "errorResponseSchema", G)), q(J, yn({
            baseQueryMeta: G
          }));
        } catch (J) {
          X = J;
        }
      }
      try {
        if (X instanceof kf) {
          const H = {
            endpoint: I.endpointName,
            arg: I.originalArgs,
            type: I.type,
            queryCacheKey: K ? I.queryCacheKey : void 0
          };
          (ne = D.onSchemaFailure) == null || ne.call(D, X, H), a == null || a(X, H);
          const {
            catchSchemaFailure: ie = c
          } = D;
          if (ie)
            return q(ie(X, H), yn({
              baseQueryMeta: X._bqMeta
            }));
        }
      } catch (H) {
        X = H;
      }
      throw typeof process < "u" && process.env.NODE_ENV !== "production" ? console.error(`An unhandled error occurred processing a request for the endpoint "${I.endpointName}".
In the case of an unhandled error, no tags will be "provided" or "invalidated".`, X) : console.error(X), X;
    }
  };
  function b(I, T) {
    const U = o.selectQueryEntry(T, I.queryCacheKey), q = o.selectConfig(T).refetchOnMountOrArgChange, N = U == null ? void 0 : U.fulfilledTimeStamp, y = I.forceRefetch ?? (I.subscribe && q);
    return y ? y === !0 || (Number(/* @__PURE__ */ new Date()) - Number(N)) / 1e3 >= y : !1;
  }
  const R = () => te(`${e}/executeQuery`, g, {
    getPendingMeta({
      arg: T
    }) {
      const U = n[T.endpointName];
      return yn({
        startedTimeStamp: Date.now(),
        ...nr(U) ? {
          direction: T.direction
        } : {}
      });
    },
    condition(T, {
      getState: U
    }) {
      var Q;
      const q = U(), N = o.selectQueryEntry(q, T.queryCacheKey), y = N == null ? void 0 : N.fulfilledTimeStamp, F = T.originalArgs, k = N == null ? void 0 : N.originalArgs, D = n[T.endpointName], $ = T.direction;
      return Ws(T) ? !0 : (N == null ? void 0 : N.status) === "pending" ? !1 : b(T, q) || Ti(D) && ((Q = D == null ? void 0 : D.forceRefetch) != null && Q.call(D, {
        currentArg: F,
        previousArg: k,
        endpointState: N,
        state: q
      })) ? !0 : !(y && !$);
    },
    dispatchConditionRejection: !0
  }), w = R(), C = R(), v = te(`${e}/executeMutation`, g, {
    getPendingMeta() {
      return yn({
        startedTimeStamp: Date.now()
      });
    }
  }), x = (I) => "force" in I, M = (I) => "ifOlderThan" in I, _ = (I, T, U = {}) => (q, N) => {
    const y = x(U) && U.force, F = M(U) && U.ifOlderThan, k = ($ = !0) => {
      const Q = {
        forceRefetch: $,
        subscribe: !1
      };
      return i.endpoints[I].initiate(T, Q);
    }, D = i.endpoints[I].select(T)(N());
    if (y)
      q(k());
    else if (F) {
      const $ = D == null ? void 0 : D.fulfilledTimeStamp;
      if (!$) {
        q(k());
        return;
      }
      (Number(/* @__PURE__ */ new Date()) - Number(new Date($))) / 1e3 >= F && q(k());
    } else
      q(k(!1));
  };
  function A(I) {
    return (T) => {
      var U, q;
      return ((q = (U = T == null ? void 0 : T.meta) == null ? void 0 : U.arg) == null ? void 0 : q.endpointName) === I;
    };
  }
  function E(I, T) {
    return {
      matchPending: An(ro(I), A(T)),
      matchFulfilled: An(yt(I), A(T)),
      matchRejected: An(Zt(I), A(T))
    };
  }
  return {
    queryThunk: w,
    mutationThunk: v,
    infiniteQueryThunk: C,
    prefetch: _,
    updateQueryData: m,
    upsertQueryData: p,
    patchQueryData: l,
    buildMatchThunkActions: E
  };
}
function Ks(e, {
  pages: t,
  pageParams: n
}, r) {
  const i = t.length - 1;
  return e.getNextPageParam(t[i], t, n[i], n, r);
}
function Rf(e, {
  pages: t,
  pageParams: n
}, r) {
  var i;
  return (i = e.getPreviousPageParam) == null ? void 0 : i.call(e, t[0], t, n[0], n, r);
}
function Of(e, t, n, r) {
  return Go(n[e.meta.arg.endpointName][t], yt(e) ? e.payload : void 0, di(e) ? e.payload : void 0, e.meta.arg.originalArgs, "baseQueryMeta" in e.meta ? e.meta.baseQueryMeta : void 0, r);
}
function tu(e) {
  return Te(e) ? Yu(e) : e;
}
function Ir(e, t, n) {
  const r = e[t];
  r && n(r);
}
function Vn(e) {
  return ("arg" in e ? e.arg.fixedCacheKey : e.fixedCacheKey) ?? e.requestId;
}
function nu(e, t, n) {
  const r = e[Vn(t)];
  r && n(r);
}
var Ar = {};
function $C({
  reducerPath: e,
  queryThunk: t,
  mutationThunk: n,
  serializeQueryArgs: r,
  context: {
    endpointDefinitions: i,
    apiUid: s,
    extractRehydrationInfo: o,
    hasRehydrationInfo: a
  },
  assertTagType: c,
  config: u
}) {
  const l = S(`${e}/resetApiState`);
  function f(A, E, I, T) {
    var U;
    A[U = E.queryCacheKey] ?? (A[U] = {
      status: nt,
      endpointName: E.endpointName
    }), Ir(A, E.queryCacheKey, (q) => {
      q.status = Bs, q.requestId = I && q.requestId ? (
        // for `upsertQuery` **updates**, keep the current `requestId`
        q.requestId
      ) : (
        // for normal queries or `upsertQuery` **inserts** always update the `requestId`
        T.requestId
      ), E.originalArgs !== void 0 && (q.originalArgs = E.originalArgs), q.startedTimeStamp = T.startedTimeStamp;
      const N = i[T.arg.endpointName];
      nr(N) && "direction" in E && (q.direction = E.direction);
    });
  }
  function h(A, E, I, T) {
    Ir(A, E.arg.queryCacheKey, (U) => {
      if (U.requestId !== E.requestId && !T) return;
      const {
        merge: q
      } = i[E.arg.endpointName];
      if (U.status = wn, q)
        if (U.data !== void 0) {
          const {
            fulfilledTimeStamp: N,
            arg: y,
            baseQueryMeta: F,
            requestId: k
          } = E;
          let D = Qn(U.data, ($) => q($, I, {
            arg: y.originalArgs,
            baseQueryMeta: F,
            fulfilledTimeStamp: N,
            requestId: k
          }));
          U.data = D;
        } else
          U.data = I;
      else
        U.data = i[E.arg.endpointName].structuralSharing ?? !0 ? Sf(Te(U.data) ? jp(U.data) : U.data, I) : I;
      delete U.error, U.fulfilledTimeStamp = E.fulfilledTimeStamp;
    });
  }
  const m = Lt({
    name: `${e}/queries`,
    initialState: Ar,
    reducers: {
      removeQueryResult: {
        reducer(A, {
          payload: {
            queryCacheKey: E
          }
        }) {
          delete A[E];
        },
        prepare: hn()
      },
      cacheEntriesUpserted: {
        reducer(A, E) {
          for (const I of E.payload) {
            const {
              queryDescription: T,
              value: U
            } = I;
            f(A, T, !0, {
              arg: T,
              requestId: E.meta.requestId,
              startedTimeStamp: E.meta.timestamp
            }), h(
              A,
              {
                arg: T,
                requestId: E.meta.requestId,
                fulfilledTimeStamp: E.meta.timestamp,
                baseQueryMeta: {}
              },
              U,
              // We know we're upserting here
              !0
            );
          }
        },
        prepare: (A) => ({
          payload: A.map((T) => {
            const {
              endpointName: U,
              arg: q,
              value: N
            } = T, y = i[U];
            return {
              queryDescription: {
                type: tr,
                endpointName: U,
                originalArgs: T.arg,
                queryCacheKey: r({
                  queryArgs: q,
                  endpointDefinition: y,
                  endpointName: U
                })
              },
              value: N
            };
          }),
          meta: {
            [no]: !0,
            requestId: io(),
            timestamp: Date.now()
          }
        })
      },
      queryResultPatched: {
        reducer(A, {
          payload: {
            queryCacheKey: E,
            patches: I
          }
        }) {
          Ir(A, E, (T) => {
            T.data = ua(T.data, I.concat());
          });
        },
        prepare: hn()
      }
    },
    extraReducers(A) {
      A.addCase(t.pending, (E, {
        meta: I,
        meta: {
          arg: T
        }
      }) => {
        const U = Ws(T);
        f(E, T, U, I);
      }).addCase(t.fulfilled, (E, {
        meta: I,
        payload: T
      }) => {
        const U = Ws(I.arg);
        h(E, I, T, U);
      }).addCase(t.rejected, (E, {
        meta: {
          condition: I,
          arg: T,
          requestId: U
        },
        error: q,
        payload: N
      }) => {
        Ir(E, T.queryCacheKey, (y) => {
          if (!I) {
            if (y.requestId !== U) return;
            y.status = bn, y.error = N ?? q;
          }
        });
      }).addMatcher(a, (E, I) => {
        const {
          queries: T
        } = o(I);
        for (const [U, q] of Object.entries(T))
          // do not rehydrate entries that were currently in flight.
          ((q == null ? void 0 : q.status) === wn || (q == null ? void 0 : q.status) === bn) && (E[U] = q);
      });
    }
  }), p = Lt({
    name: `${e}/mutations`,
    initialState: Ar,
    reducers: {
      removeMutationResult: {
        reducer(A, {
          payload: E
        }) {
          const I = Vn(E);
          I in A && delete A[I];
        },
        prepare: hn()
      }
    },
    extraReducers(A) {
      A.addCase(n.pending, (E, {
        meta: I,
        meta: {
          requestId: T,
          arg: U,
          startedTimeStamp: q
        }
      }) => {
        U.track && (E[Vn(I)] = {
          requestId: T,
          status: Bs,
          endpointName: U.endpointName,
          startedTimeStamp: q
        });
      }).addCase(n.fulfilled, (E, {
        payload: I,
        meta: T
      }) => {
        T.arg.track && nu(E, T, (U) => {
          U.requestId === T.requestId && (U.status = wn, U.data = I, U.fulfilledTimeStamp = T.fulfilledTimeStamp);
        });
      }).addCase(n.rejected, (E, {
        payload: I,
        error: T,
        meta: U
      }) => {
        U.arg.track && nu(E, U, (q) => {
          q.requestId === U.requestId && (q.status = bn, q.error = I ?? T);
        });
      }).addMatcher(a, (E, I) => {
        const {
          mutations: T
        } = o(I);
        for (const [U, q] of Object.entries(T))
          // do not rehydrate entries that were currently in flight.
          ((q == null ? void 0 : q.status) === wn || (q == null ? void 0 : q.status) === bn) && // only rehydrate endpoints that were persisted using a `fixedCacheKey`
          U !== (q == null ? void 0 : q.requestId) && (E[U] = q);
      });
    }
  }), d = {
    tags: {},
    keys: {}
  }, g = Lt({
    name: `${e}/invalidation`,
    initialState: d,
    reducers: {
      updateProvidedBy: {
        reducer(A, E) {
          var I, T, U;
          for (const {
            queryCacheKey: q,
            providedTags: N
          } of E.payload) {
            b(A, q);
            for (const {
              type: y,
              id: F
            } of N) {
              const k = (T = (I = A.tags)[y] ?? (I[y] = {}))[U = F || "__internal_without_id"] ?? (T[U] = []);
              k.includes(q) || k.push(q);
            }
            A.keys[q] = N;
          }
        },
        prepare: hn()
      }
    },
    extraReducers(A) {
      A.addCase(m.actions.removeQueryResult, (E, {
        payload: {
          queryCacheKey: I
        }
      }) => {
        b(E, I);
      }).addMatcher(a, (E, I) => {
        var U, q, N;
        const {
          provided: T
        } = o(I);
        for (const [y, F] of Object.entries(T.tags ?? {}))
          for (const [k, D] of Object.entries(F)) {
            const $ = (q = (U = E.tags)[y] ?? (U[y] = {}))[N = k || "__internal_without_id"] ?? (q[N] = []);
            for (const Q of D)
              $.includes(Q) || $.push(Q), E.keys[Q] = T.keys[Q];
          }
      }).addMatcher(tt(yt(t), di(t)), (E, I) => {
        R(E, [I]);
      }).addMatcher(m.actions.cacheEntriesUpserted.match, (E, I) => {
        const T = I.payload.map(({
          queryDescription: U,
          value: q
        }) => ({
          type: "UNKNOWN",
          payload: q,
          meta: {
            requestStatus: "fulfilled",
            requestId: "UNKNOWN",
            arg: U
          }
        }));
        R(E, T);
      });
    }
  });
  function b(A, E) {
    var T;
    const I = tu(A.keys[E] ?? []);
    for (const U of I) {
      const q = U.type, N = U.id ?? "__internal_without_id", y = (T = A.tags[q]) == null ? void 0 : T[N];
      y && (A.tags[q][N] = tu(y).filter((F) => F !== E));
    }
    delete A.keys[E];
  }
  function R(A, E) {
    const I = E.map((T) => {
      const U = Of(T, "providesTags", i, c), {
        queryCacheKey: q
      } = T.meta.arg;
      return {
        queryCacheKey: q,
        providedTags: U
      };
    });
    g.caseReducers.updateProvidedBy(A, g.actions.updateProvidedBy(I));
  }
  const w = Lt({
    name: `${e}/subscriptions`,
    initialState: Ar,
    reducers: {
      updateSubscriptionOptions(A, E) {
      },
      unsubscribeQueryResult(A, E) {
      },
      internal_getRTKQSubscriptions() {
      }
    }
  }), C = Lt({
    name: `${e}/internalSubscriptions`,
    initialState: Ar,
    reducers: {
      subscriptionsUpdated: {
        reducer(A, E) {
          return ua(A, E.payload);
        },
        prepare: hn()
      }
    }
  }), v = Lt({
    name: `${e}/config`,
    initialState: {
      online: SC(),
      focused: vC(),
      middlewareRegistered: !1,
      ...u
    },
    reducers: {
      middlewareRegistered(A, {
        payload: E
      }) {
        A.middlewareRegistered = A.middlewareRegistered === "conflict" || s !== E ? "conflict" : !0;
      }
    },
    extraReducers: (A) => {
      A.addCase(Ko, (E) => {
        E.online = !0;
      }).addCase(If, (E) => {
        E.online = !1;
      }).addCase(Wo, (E) => {
        E.focused = !0;
      }).addCase(Cf, (E) => {
        E.focused = !1;
      }).addMatcher(a, (E) => ({
        ...E
      }));
    }
  }), x = Np({
    queries: m.reducer,
    mutations: p.reducer,
    provided: g.reducer,
    subscriptions: C.reducer,
    config: v.reducer
  }), M = (A, E) => x(l.match(E) ? void 0 : A, E), _ = {
    ...v.actions,
    ...m.actions,
    ...w.actions,
    ...C.actions,
    ...p.actions,
    ...g.actions,
    resetApiState: l
  };
  return {
    reducer: M,
    actions: _
  };
}
var ls = /* @__PURE__ */ Symbol.for("RTKQ/skipToken"), qf = {
  status: nt
}, ru = /* @__PURE__ */ Qn(qf, () => {
}), iu = /* @__PURE__ */ Qn(qf, () => {
});
function NC({
  serializeQueryArgs: e,
  reducerPath: t,
  createSelector: n
}) {
  const r = (w) => ru, i = (w) => iu;
  return {
    buildQuerySelector: h,
    buildInfiniteQuerySelector: m,
    buildMutationSelector: p,
    selectInvalidatedBy: d,
    selectCachedArgsForQuery: g,
    selectApiState: o,
    selectQueries: a,
    selectMutations: u,
    selectQueryEntry: c,
    selectConfig: l
  };
  function s(w) {
    return {
      ...w,
      ...Wc(w.status)
    };
  }
  function o(w) {
    const C = w[t];
    if (process.env.NODE_ENV !== "production" && !C) {
      if (o.triggered) return C;
      o.triggered = !0, console.error(`Error: No data found at \`state.${t}\`. Did you forget to add the reducer to the store?`);
    }
    return C;
  }
  function a(w) {
    var C;
    return (C = o(w)) == null ? void 0 : C.queries;
  }
  function c(w, C) {
    var v;
    return (v = a(w)) == null ? void 0 : v[C];
  }
  function u(w) {
    var C;
    return (C = o(w)) == null ? void 0 : C.mutations;
  }
  function l(w) {
    var C;
    return (C = o(w)) == null ? void 0 : C.config;
  }
  function f(w, C, v) {
    return (x) => {
      if (x === ls)
        return n(r, v);
      const M = e({
        queryArgs: x,
        endpointDefinition: C,
        endpointName: w
      });
      return n((A) => c(A, M) ?? ru, v);
    };
  }
  function h(w, C) {
    return f(w, C, s);
  }
  function m(w, C) {
    const {
      infiniteQueryOptions: v
    } = C;
    function x(M) {
      const _ = {
        ...M,
        ...Wc(M.status)
      }, {
        isLoading: A,
        isError: E,
        direction: I
      } = _, T = I === "forward", U = I === "backward";
      return {
        ..._,
        hasNextPage: b(v, _.data, _.originalArgs),
        hasPreviousPage: R(v, _.data, _.originalArgs),
        isFetchingNextPage: A && T,
        isFetchingPreviousPage: A && U,
        isFetchNextPageError: E && T,
        isFetchPreviousPageError: E && U
      };
    }
    return f(w, C, x);
  }
  function p() {
    return ((w) => {
      let C;
      return typeof w == "object" ? C = Vn(w) ?? ls : C = w, n(C === ls ? i : (M) => {
        var _, A;
        return ((A = (_ = o(M)) == null ? void 0 : _.mutations) == null ? void 0 : A[C]) ?? iu;
      }, s);
    });
  }
  function d(w, C) {
    const v = w[t], x = /* @__PURE__ */ new Set(), M = Hs(C, Yo, Ef);
    for (const _ of M) {
      const A = v.provided.tags[_.type];
      if (!A)
        continue;
      let E = (_.id !== void 0 ? (
        // id given: invalidate all queries that provide this type & id
        A[_.id]
      ) : (
        // no id: invalidate all queries that provide this type
        Object.values(A).flat()
      )) ?? [];
      for (const I of E)
        x.add(I);
    }
    return Array.from(x.values()).flatMap((_) => {
      const A = v.queries[_];
      return A ? {
        queryCacheKey: _,
        endpointName: A.endpointName,
        originalArgs: A.originalArgs
      } : [];
    });
  }
  function g(w, C) {
    return Hs(Object.values(a(w)), (v) => (v == null ? void 0 : v.endpointName) === C && v.status !== nt, (v) => v.originalArgs);
  }
  function b(w, C, v) {
    return C ? Ks(w, C, v) != null : !1;
  }
  function R(w, C, v) {
    return !C || !w.getPreviousPageParam ? !1 : Rf(w, C, v) != null;
  }
}
var Bt = WeakMap ? /* @__PURE__ */ new WeakMap() : void 0, su = ({
  endpointName: e,
  queryArgs: t
}) => {
  let n = "";
  const r = Bt == null ? void 0 : Bt.get(t);
  if (typeof r == "string")
    n = r;
  else {
    const i = JSON.stringify(t, (s, o) => (o = typeof o == "bigint" ? {
      $bigint: o.toString()
    } : o, o = Ft(o) ? Object.keys(o).sort().reduce((a, c) => (a[c] = o[c], a), {}) : o, o));
    Ft(t) && (Bt == null || Bt.set(t, i)), n = i;
  }
  return `${e}(${n})`;
};
function LC(...e) {
  return function(n) {
    const r = Wr((u) => {
      var l;
      return (l = n.extractRehydrationInfo) == null ? void 0 : l.call(n, u, {
        reducerPath: n.reducerPath ?? "api"
      });
    }), i = {
      reducerPath: "api",
      keepUnusedDataFor: 60,
      refetchOnMountOrArgChange: !1,
      refetchOnFocus: !1,
      refetchOnReconnect: !1,
      invalidationBehavior: "delayed",
      ...n,
      extractRehydrationInfo: r,
      serializeQueryArgs(u) {
        let l = su;
        if ("serializeQueryArgs" in u.endpointDefinition) {
          const f = u.endpointDefinition.serializeQueryArgs;
          l = (h) => {
            const m = f(h);
            return typeof m == "string" ? m : su({
              ...h,
              queryArgs: m
            });
          };
        } else n.serializeQueryArgs && (l = n.serializeQueryArgs);
        return l(u);
      },
      tagTypes: [...n.tagTypes || []]
    }, s = {
      endpointDefinitions: {},
      batch(u) {
        u();
      },
      apiUid: io(),
      extractRehydrationInfo: r,
      hasRehydrationInfo: Wr((u) => r(u) != null)
    }, o = {
      injectEndpoints: c,
      enhanceEndpoints({
        addTagTypes: u,
        endpoints: l
      }) {
        if (u)
          for (const f of u)
            i.tagTypes.includes(f) || i.tagTypes.push(f);
        if (l)
          for (const [f, h] of Object.entries(l))
            typeof h == "function" ? h(rn(s, f)) : Object.assign(rn(s, f) || {}, h);
        return o;
      }
    }, a = e.map((u) => u.init(o, i, s));
    function c(u) {
      const l = u.endpoints({
        query: (f) => ({
          ...f,
          type: tr
        }),
        mutation: (f) => ({
          ...f,
          type: Af
        }),
        infiniteQuery: (f) => ({
          ...f,
          type: xf
        })
      });
      for (const [f, h] of Object.entries(l)) {
        if (u.overrideExisting !== !0 && f in s.endpointDefinitions) {
          if (u.overrideExisting === "throw")
            throw new Error(process.env.NODE_ENV === "production" ? ge(39) : `called \`injectEndpoints\` to override already-existing endpointName ${f} without specifying \`overrideExisting: true\``);
          typeof process < "u" && process.env.NODE_ENV === "development" && console.error(`called \`injectEndpoints\` to override already-existing endpointName ${f} without specifying \`overrideExisting: true\``);
          continue;
        }
        if (typeof process < "u" && process.env.NODE_ENV === "development" && nr(h)) {
          const {
            infiniteQueryOptions: m
          } = h, {
            maxPages: p,
            getPreviousPageParam: d
          } = m;
          if (typeof p == "number") {
            if (p < 1)
              throw new Error(process.env.NODE_ENV === "production" ? ge(40) : `maxPages for endpoint '${f}' must be a number greater than 0`);
            if (typeof d != "function")
              throw new Error(process.env.NODE_ENV === "production" ? ge(41) : `getPreviousPageParam for endpoint '${f}' must be a function if maxPages is used`);
          }
        }
        s.endpointDefinitions[f] = h;
        for (const m of a)
          m.injectEndpoint(f, h);
      }
      return o;
    }
    return o.injectEndpoints({
      endpoints: n.endpoints
    });
  };
}
function We(e, ...t) {
  return Object.assign(e, ...t);
}
var jC = ({
  api: e,
  queryThunk: t,
  internalState: n,
  mwApi: r
}) => {
  const i = `${e.reducerPath}/subscriptions`;
  let s = null, o = null;
  const {
    updateSubscriptionOptions: a,
    unsubscribeQueryResult: c
  } = e.internalActions, u = (d, g) => {
    if (a.match(g)) {
      const {
        queryCacheKey: R,
        requestId: w,
        options: C
      } = g.payload, v = d.get(R);
      return v != null && v.has(w) && v.set(w, C), !0;
    }
    if (c.match(g)) {
      const {
        queryCacheKey: R,
        requestId: w
      } = g.payload, C = d.get(R);
      return C && C.delete(w), !0;
    }
    if (e.internalActions.removeQueryResult.match(g))
      return d.delete(g.payload.queryCacheKey), !0;
    if (t.pending.match(g)) {
      const {
        meta: {
          arg: R,
          requestId: w
        }
      } = g, C = oi(d, R.queryCacheKey, Ys);
      return R.subscribe && C.set(w, R.subscriptionOptions ?? C.get(w) ?? {}), !0;
    }
    let b = !1;
    if (t.rejected.match(g)) {
      const {
        meta: {
          condition: R,
          arg: w,
          requestId: C
        }
      } = g;
      if (R && w.subscribe) {
        const v = oi(d, w.queryCacheKey, Ys);
        v.set(C, w.subscriptionOptions ?? v.get(C) ?? {}), b = !0;
      }
    }
    return b;
  }, l = () => n.currentSubscriptions, m = {
    getSubscriptions: l,
    getSubscriptionCount: (d) => {
      const b = l().get(d);
      return (b == null ? void 0 : b.size) ?? 0;
    },
    isRequestSubscribed: (d, g) => {
      var R;
      const b = l();
      return !!((R = b == null ? void 0 : b.get(d)) != null && R.get(g));
    }
  };
  function p(d) {
    return JSON.parse(JSON.stringify(Object.fromEntries([...d].map(([g, b]) => [g, Object.fromEntries(b)]))));
  }
  return (d, g) => {
    if (s || (s = p(n.currentSubscriptions)), e.util.resetApiState.match(d))
      return s = {}, n.currentSubscriptions.clear(), o = null, [!0, !1];
    if (e.internalActions.internal_getRTKQSubscriptions.match(d))
      return [!1, m];
    const b = u(n.currentSubscriptions, d);
    let R = !0;
    if (process.env.NODE_ENV === "test" && typeof d.type == "string" && d.type === `${e.reducerPath}/getPolling`)
      return [!1, n.currentPolls];
    if (b) {
      o || (o = setTimeout(() => {
        const v = p(n.currentSubscriptions), [, x] = Ku(s, () => v);
        g.next(e.internalActions.subscriptionsUpdated(x)), s = v, o = null;
      }, 500));
      const w = typeof d.type == "string" && !!d.type.startsWith(i), C = t.rejected.match(d) && d.meta.condition && !!d.meta.arg.subscribe;
      R = !w && !C;
    }
    return [R, !1];
  };
}, QC = 2147483647 / 1e3 - 1, zC = ({
  reducerPath: e,
  api: t,
  queryThunk: n,
  context: r,
  internalState: i,
  selectors: {
    selectQueryEntry: s,
    selectConfig: o
  },
  getRunningQueryThunk: a,
  mwApi: c
}) => {
  const {
    removeQueryResult: u,
    unsubscribeQueryResult: l,
    cacheEntriesUpserted: f
  } = t.internalActions, h = tt(l.match, n.fulfilled, n.rejected, f.match);
  function m(w) {
    const C = i.currentSubscriptions.get(w);
    return C ? C.size > 0 : !1;
  }
  const p = {};
  function d(w) {
    var C;
    for (const v of w.values())
      (C = v == null ? void 0 : v.abort) == null || C.call(v);
  }
  const g = (w, C) => {
    const v = C.getState(), x = o(v);
    if (h(w)) {
      let M;
      if (f.match(w))
        M = w.payload.map((_) => _.queryDescription.queryCacheKey);
      else {
        const {
          queryCacheKey: _
        } = l.match(w) ? w.payload : w.meta.arg;
        M = [_];
      }
      b(M, C, x);
    }
    if (t.util.resetApiState.match(w)) {
      for (const [M, _] of Object.entries(p))
        _ && clearTimeout(_), delete p[M];
      d(i.runningQueries), d(i.runningMutations);
    }
    if (r.hasRehydrationInfo(w)) {
      const {
        queries: M
      } = r.extractRehydrationInfo(w);
      b(Object.keys(M), C, x);
    }
  };
  function b(w, C, v) {
    const x = C.getState();
    for (const M of w) {
      const _ = s(x, M);
      _ != null && _.endpointName && R(M, _.endpointName, C, v);
    }
  }
  function R(w, C, v, x) {
    const M = rn(r, C), _ = (M == null ? void 0 : M.keepUnusedDataFor) ?? x.keepUnusedDataFor;
    if (_ === 1 / 0)
      return;
    const A = Math.max(0, Math.min(_, QC));
    if (!m(w)) {
      const E = p[w];
      E && clearTimeout(E), p[w] = setTimeout(() => {
        if (!m(w)) {
          const I = s(v.getState(), w);
          if (I != null && I.endpointName) {
            const T = v.dispatch(a(I.endpointName, I.originalArgs));
            T == null || T.abort();
          }
          v.dispatch(u({
            queryCacheKey: w
          }));
        }
        delete p[w];
      }, A * 1e3);
    }
  }
  return g;
}, ou = new Error("Promise never resolved before cacheEntryRemoved."), BC = ({
  api: e,
  reducerPath: t,
  context: n,
  queryThunk: r,
  mutationThunk: i,
  internalState: s,
  selectors: {
    selectQueryEntry: o,
    selectApiState: a
  }
}) => {
  const c = Os(r), u = Os(i), l = yt(r, i), f = {}, {
    removeQueryResult: h,
    removeMutationResult: m,
    cacheEntriesUpserted: p
  } = e.internalActions;
  function d(v, x, M) {
    const _ = f[v];
    _ != null && _.valueResolved && (_.valueResolved({
      data: x,
      meta: M
    }), delete _.valueResolved);
  }
  function g(v) {
    const x = f[v];
    x && (delete f[v], x.cacheEntryRemoved());
  }
  function b(v) {
    const {
      arg: x,
      requestId: M
    } = v.meta, {
      endpointName: _,
      originalArgs: A
    } = x;
    return [_, A, M];
  }
  const R = (v, x, M) => {
    const _ = w(v);
    function A(E, I, T, U) {
      const q = o(M, I), N = o(x.getState(), I);
      !q && N && C(E, U, I, x, T);
    }
    if (r.pending.match(v)) {
      const [E, I, T] = b(v);
      A(E, _, T, I);
    } else if (p.match(v))
      for (const {
        queryDescription: E,
        value: I
      } of v.payload) {
        const {
          endpointName: T,
          originalArgs: U,
          queryCacheKey: q
        } = E;
        A(T, q, v.meta.requestId, U), d(q, I, {});
      }
    else if (i.pending.match(v)) {
      if (x.getState()[t].mutations[_]) {
        const [I, T, U] = b(v);
        C(I, T, _, x, U);
      }
    } else if (l(v))
      d(_, v.payload, v.meta.baseQueryMeta);
    else if (h.match(v) || m.match(v))
      g(_);
    else if (e.util.resetApiState.match(v))
      for (const E of Object.keys(f))
        g(E);
  };
  function w(v) {
    return c(v) ? v.meta.arg.queryCacheKey : u(v) ? v.meta.arg.fixedCacheKey ?? v.meta.requestId : h.match(v) ? v.payload.queryCacheKey : m.match(v) ? Vn(v.payload) : "";
  }
  function C(v, x, M, _, A) {
    const E = rn(n, v), I = E == null ? void 0 : E.onCacheEntryAdded;
    if (!I) return;
    const T = {}, U = new Promise((D) => {
      T.cacheEntryRemoved = D;
    }), q = Promise.race([new Promise((D) => {
      T.valueResolved = D;
    }), U.then(() => {
      throw ou;
    })]);
    q.catch(() => {
    }), f[M] = T;
    const N = e.endpoints[v].select(ai(E) ? x : M), y = _.dispatch((D, $, Q) => Q), F = {
      ..._,
      getCacheEntry: () => N(_.getState()),
      requestId: A,
      extra: y,
      updateCachedData: ai(E) ? (D) => _.dispatch(e.util.updateQueryData(v, x, D)) : void 0,
      cacheDataLoaded: q,
      cacheEntryRemoved: U
    }, k = I(x, F);
    Promise.resolve(k).catch((D) => {
      if (D !== ou)
        throw D;
    });
  }
  return R;
}, HC = ({
  api: e,
  context: {
    apiUid: t
  },
  reducerPath: n
}) => (r, i) => {
  var s, o;
  e.util.resetApiState.match(r) && i.dispatch(e.internalActions.middlewareRegistered(t)), typeof process < "u" && process.env.NODE_ENV === "development" && e.internalActions.middlewareRegistered.match(r) && r.payload === t && ((o = (s = i.getState()[n]) == null ? void 0 : s.config) == null ? void 0 : o.middlewareRegistered) === "conflict" && console.warn(`There is a mismatch between slice and middleware for the reducerPath "${n}".
You can only have one api per reducer path, this will lead to crashes in various situations!${n === "api" ? `
If you have multiple apis, you *have* to specify the reducerPath option when using createApi!` : ""}`);
}, YC = ({
  reducerPath: e,
  context: t,
  context: {
    endpointDefinitions: n
  },
  mutationThunk: r,
  queryThunk: i,
  api: s,
  assertTagType: o,
  refetchQuery: a,
  internalState: c
}) => {
  const {
    removeQueryResult: u
  } = s.internalActions, l = tt(yt(r), di(r)), f = tt(yt(i, r), Zt(i, r));
  let h = [], m = 0;
  const p = (b, R) => {
    (i.pending.match(b) || r.pending.match(b)) && m++, f(b) && (m = Math.max(0, m - 1)), l(b) ? g(Of(b, "invalidatesTags", n, o), R) : f(b) ? g([], R) : s.util.invalidateTags.match(b) && g(Go(b.payload, void 0, void 0, void 0, void 0, o), R);
  };
  function d() {
    return m > 0;
  }
  function g(b, R) {
    const w = R.getState(), C = w[e];
    if (h.push(...b), C.config.invalidationBehavior === "delayed" && d())
      return;
    const v = h;
    if (h = [], v.length === 0) return;
    const x = s.util.selectInvalidatedBy(w, v);
    t.batch(() => {
      const M = Array.from(x.values());
      for (const {
        queryCacheKey: _
      } of M) {
        const A = C.queries[_], E = oi(c.currentSubscriptions, _, Ys);
        A && (E.size === 0 ? R.dispatch(u({
          queryCacheKey: _
        })) : A.status !== nt && R.dispatch(a(A)));
      }
    });
  }
  return p;
}, WC = ({
  reducerPath: e,
  queryThunk: t,
  api: n,
  refetchQuery: r,
  internalState: i
}) => {
  const {
    currentPolls: s,
    currentSubscriptions: o
  } = i, a = /* @__PURE__ */ new Set();
  let c = null;
  const u = (g, b) => {
    (n.internalActions.updateSubscriptionOptions.match(g) || n.internalActions.unsubscribeQueryResult.match(g)) && l(g.payload.queryCacheKey, b), (t.pending.match(g) || t.rejected.match(g) && g.meta.condition) && l(g.meta.arg.queryCacheKey, b), (t.fulfilled.match(g) || t.rejected.match(g) && !g.meta.condition) && f(g.meta.arg, b), n.util.resetApiState.match(g) && (p(), c && (clearTimeout(c), c = null), a.clear());
  };
  function l(g, b) {
    a.add(g), c || (c = setTimeout(() => {
      for (const R of a)
        h({
          queryCacheKey: R
        }, b);
      a.clear(), c = null;
    }, 0));
  }
  function f({
    queryCacheKey: g
  }, b) {
    const R = b.getState()[e], w = R.queries[g], C = o.get(g);
    if (!w || w.status === nt) return;
    const {
      lowestPollingInterval: v,
      skipPollingIfUnfocused: x
    } = d(C);
    if (!Number.isFinite(v)) return;
    const M = s.get(g);
    M != null && M.timeout && (clearTimeout(M.timeout), M.timeout = void 0);
    const _ = Date.now() + v;
    s.set(g, {
      nextPollTimestamp: _,
      pollingInterval: v,
      timeout: setTimeout(() => {
        (R.config.focused || !x) && b.dispatch(r(w)), f({
          queryCacheKey: g
        }, b);
      }, v)
    });
  }
  function h({
    queryCacheKey: g
  }, b) {
    const w = b.getState()[e].queries[g], C = o.get(g);
    if (!w || w.status === nt)
      return;
    const {
      lowestPollingInterval: v
    } = d(C);
    if (process.env.NODE_ENV === "test") {
      const _ = s.pollUpdateCounters ?? (s.pollUpdateCounters = {});
      _[g] ?? (_[g] = 0), _[g]++;
    }
    if (!Number.isFinite(v)) {
      m(g);
      return;
    }
    const x = s.get(g), M = Date.now() + v;
    (!x || M < x.nextPollTimestamp) && f({
      queryCacheKey: g
    }, b);
  }
  function m(g) {
    const b = s.get(g);
    b != null && b.timeout && clearTimeout(b.timeout), s.delete(g);
  }
  function p() {
    for (const g of s.keys())
      m(g);
  }
  function d(g = /* @__PURE__ */ new Map()) {
    let b = !1, R = Number.POSITIVE_INFINITY;
    for (const w of g.values())
      w.pollingInterval && (R = Math.min(w.pollingInterval, R), b = w.skipPollingIfUnfocused || b);
    return {
      lowestPollingInterval: R,
      skipPollingIfUnfocused: b
    };
  }
  return u;
}, KC = ({
  api: e,
  context: t,
  queryThunk: n,
  mutationThunk: r
}) => {
  const i = ro(n, r), s = Zt(n, r), o = yt(n, r), a = {};
  return (u, l) => {
    var f, h;
    if (i(u)) {
      const {
        requestId: m,
        arg: {
          endpointName: p,
          originalArgs: d
        }
      } = u.meta, g = rn(t, p), b = g == null ? void 0 : g.onQueryStarted;
      if (b) {
        const R = {}, w = new Promise((M, _) => {
          R.resolve = M, R.reject = _;
        });
        w.catch(() => {
        }), a[m] = R;
        const C = e.endpoints[p].select(ai(g) ? d : m), v = l.dispatch((M, _, A) => A), x = {
          ...l,
          getCacheEntry: () => C(l.getState()),
          requestId: m,
          extra: v,
          updateCachedData: ai(g) ? (M) => l.dispatch(e.util.updateQueryData(p, d, M)) : void 0,
          queryFulfilled: w
        };
        b(d, x);
      }
    } else if (o(u)) {
      const {
        requestId: m,
        baseQueryMeta: p
      } = u.meta;
      (f = a[m]) == null || f.resolve({
        data: u.payload,
        meta: p
      }), delete a[m];
    } else if (s(u)) {
      const {
        requestId: m,
        rejectedWithValue: p,
        baseQueryMeta: d
      } = u.meta;
      (h = a[m]) == null || h.reject({
        error: u.payload ?? u.error,
        isUnhandledError: !p,
        meta: d
      }), delete a[m];
    }
  };
}, GC = ({
  reducerPath: e,
  context: t,
  api: n,
  refetchQuery: r,
  internalState: i
}) => {
  const {
    removeQueryResult: s
  } = n.internalActions, o = (c, u) => {
    Wo.match(c) && a(u, "refetchOnFocus"), Ko.match(c) && a(u, "refetchOnReconnect");
  };
  function a(c, u) {
    const l = c.getState()[e], f = l.queries, h = i.currentSubscriptions;
    t.batch(() => {
      for (const m of h.keys()) {
        const p = f[m], d = h.get(m);
        if (!d || !p) continue;
        const g = [...d.values()];
        (g.some((R) => R[u] === !0) || g.every((R) => R[u] === void 0) && l.config[u]) && (d.size === 0 ? c.dispatch(s({
          queryCacheKey: m
        })) : p.status !== nt && c.dispatch(r(p)));
      }
    });
  }
  return o;
};
function JC(e) {
  const {
    reducerPath: t,
    queryThunk: n,
    api: r,
    context: i,
    getInternalState: s
  } = e, {
    apiUid: o
  } = i, a = {
    invalidateTags: S(`${t}/invalidateTags`)
  }, c = (h) => h.type.startsWith(`${t}/`), u = [HC, zC, YC, WC, BC, KC];
  return {
    middleware: (h) => {
      let m = !1;
      const p = s(h.dispatch), d = {
        ...e,
        internalState: p,
        refetchQuery: f,
        isThisApiSliceAction: c,
        mwApi: h
      }, g = u.map((w) => w(d)), b = jC(d), R = GC(d);
      return (w) => (C) => {
        if (!$u(C))
          return w(C);
        m || (m = !0, h.dispatch(r.internalActions.middlewareRegistered(o)));
        const v = {
          ...h,
          next: w
        }, x = h.getState(), [M, _] = b(C, v, x);
        let A;
        if (M ? A = w(C) : A = _, h.getState()[t] && (R(C, v, x), c(C) || i.hasRehydrationInfo(C)))
          for (const E of g)
            E(C, v, x);
        return A;
      };
    },
    actions: a
  };
  function f(h) {
    return e.api.endpoints[h.endpointName].initiate(h.originalArgs, {
      subscribe: !1,
      forceRefetch: !0
    });
  }
}
var au = /* @__PURE__ */ Symbol(), ZC = ({
  createSelector: e = fe
} = {}) => ({
  name: au,
  init(t, {
    baseQuery: n,
    tagTypes: r,
    reducerPath: i,
    serializeQueryArgs: s,
    keepUnusedDataFor: o,
    refetchOnMountOrArgChange: a,
    refetchOnFocus: c,
    refetchOnReconnect: u,
    invalidationBehavior: l,
    onSchemaFailure: f,
    catchSchemaFailure: h,
    skipSchemaValidation: m
  }, p) {
    ih();
    const d = (H) => (typeof process < "u" && process.env.NODE_ENV === "development" && (r.includes(H.type) || console.error(`Tag type '${H.type}' was used, but not specified in \`tagTypes\`!`)), H);
    Object.assign(t, {
      reducerPath: i,
      endpoints: {},
      internalActions: {
        onOnline: Ko,
        onOffline: If,
        onFocus: Wo,
        onFocusLost: Cf
      },
      util: {}
    });
    const g = NC({
      serializeQueryArgs: s,
      reducerPath: i,
      createSelector: e
    }), {
      selectInvalidatedBy: b,
      selectCachedArgsForQuery: R,
      buildQuerySelector: w,
      buildInfiniteQuerySelector: C,
      buildMutationSelector: v
    } = g;
    We(t.util, {
      selectInvalidatedBy: b,
      selectCachedArgsForQuery: R
    });
    const {
      queryThunk: x,
      infiniteQueryThunk: M,
      mutationThunk: _,
      patchQueryData: A,
      updateQueryData: E,
      upsertQueryData: I,
      prefetch: T,
      buildMatchThunkActions: U
    } = UC({
      baseQuery: n,
      reducerPath: i,
      context: p,
      api: t,
      serializeQueryArgs: s,
      assertTagType: d,
      selectors: g,
      onSchemaFailure: f,
      catchSchemaFailure: h,
      skipSchemaValidation: m
    }), {
      reducer: q,
      actions: N
    } = $C({
      context: p,
      queryThunk: x,
      mutationThunk: _,
      serializeQueryArgs: s,
      reducerPath: i,
      assertTagType: d,
      config: {
        refetchOnFocus: c,
        refetchOnReconnect: u,
        refetchOnMountOrArgChange: a,
        keepUnusedDataFor: o,
        reducerPath: i,
        invalidationBehavior: l
      }
    });
    We(t.util, {
      patchQueryData: A,
      updateQueryData: E,
      upsertQueryData: I,
      prefetch: T,
      resetApiState: N.resetApiState,
      upsertQueryEntries: N.cacheEntriesUpserted
    }), We(t.internalActions, N);
    const y = /* @__PURE__ */ new WeakMap(), F = (H) => oi(y, H, () => ({
      currentSubscriptions: /* @__PURE__ */ new Map(),
      currentPolls: /* @__PURE__ */ new Map(),
      runningQueries: /* @__PURE__ */ new Map(),
      runningMutations: /* @__PURE__ */ new Map()
    })), {
      buildInitiateQuery: k,
      buildInitiateInfiniteQuery: D,
      buildInitiateMutation: $,
      getRunningMutationThunk: Q,
      getRunningMutationsThunk: K,
      getRunningQueriesThunk: Y,
      getRunningQueryThunk: ne
    } = VC({
      queryThunk: x,
      mutationThunk: _,
      infiniteQueryThunk: M,
      api: t,
      serializeQueryArgs: s,
      context: p,
      getInternalState: F
    });
    We(t.util, {
      getRunningMutationThunk: Q,
      getRunningMutationsThunk: K,
      getRunningQueryThunk: ne,
      getRunningQueriesThunk: Y
    });
    const {
      middleware: B,
      actions: X
    } = JC({
      reducerPath: i,
      context: p,
      queryThunk: x,
      mutationThunk: _,
      infiniteQueryThunk: M,
      api: t,
      assertTagType: d,
      selectors: g,
      getRunningQueryThunk: ne,
      getInternalState: F
    });
    return We(t.util, X), We(t, {
      reducer: q,
      middleware: B
    }), {
      name: au,
      injectEndpoint(H, ie) {
        var G;
        const ue = (G = t.endpoints)[H] ?? (G[H] = {});
        Ti(ie) && We(ue, {
          name: H,
          select: w(H, ie),
          initiate: k(H, ie)
        }, U(x, H)), _C(ie) && We(ue, {
          name: H,
          select: v(),
          initiate: $(H)
        }, U(_, H)), nr(ie) && We(ue, {
          name: H,
          select: C(H, ie),
          initiate: D(H, ie)
        }, U(x, H));
      }
    };
  }
}), XC = /* @__PURE__ */ LC(ZC());
const Ff = (e) => e.query, eI = (e) => {
  var t;
  return (t = e.query) == null ? void 0 : t.enableQuerySyntax;
};
fe((e) => {
  var t;
  return (t = Ff(e)) == null ? void 0 : t.q;
}, (e) => e.search.requestId, (e) => e.generatedAnswer.cannotAnswer, (e) => e.configuration.analytics.analyticsMode, (e) => {
  var t;
  return (t = e.search.searchAction) == null ? void 0 : t.actionCause;
}, (e, t, n, r, i) => ({
  q: e,
  requestId: t,
  cannotAnswer: n,
  analyticsMode: r,
  actionCause: i
}));
fe((e) => {
  var t;
  return (t = e.generatedAnswer) == null ? void 0 : t.answerApiQueryParams;
}, (e) => e);
const Df = (e, t, n) => bt({
  prefix: "analytics/generatedAnswer/streamEnd",
  __legacy__getBuilder: (r, i) => {
    const s = t ?? ni(i);
    if (!s)
      return null;
    const o = uS(i);
    return r.makeGeneratedAnswerStreamEnd({
      generativeQuestionAnsweringId: s,
      answerGenerated: e,
      answerTextIsEmpty: n,
      ...o && { conversationId: o }
    });
  },
  analyticsType: "Rga.AnswerReceived",
  analyticsPayloadBuilder: (r) => ({
    answerId: t ?? ni(r) ?? "",
    answerGenerated: e ?? !1
  })
}), Tf = (e) => bt({
  prefix: "analytics/generatedAnswer/responseLinked",
  __legacy__getBuilder: () => null,
  analyticsType: "Rga.ResponseLinked",
  analyticsPayloadBuilder: (t) => {
    var r, i;
    return {
      answerId: ni(t) ?? "",
      responseId: ((r = t.search) == null ? void 0 : r.searchResponseId) || ((i = t.search) == null ? void 0 : i.response.searchUid) || ""
    };
  }
}), tI = fe((e) => e.advancedSearchQueries, (e) => {
  if (!e)
    return {};
  const { aq: t, cq: n, dq: r, lq: i } = e;
  return {
    ...t && { aq: t },
    ...n && { cq: n },
    ...r && { dq: r },
    ...i && { lq: i }
  };
}), nI = (e) => e.context, rI = (e) => e.pipeline, iI = fe((e) => e.search, (e) => {
  var t;
  return ((t = e == null ? void 0 : e.searchAction) == null ? void 0 : t.actionCause) || "";
}), sI = (e) => e.searchHub, _f = fe((e) => e, (e) => {
  if (!e)
    return "";
  for (const t in e)
    if (e[t].isActive)
      return e[t].id;
  return "";
});
fe((e) => e, (e) => {
  const t = _f(e);
  return t && e ? e[t].expression : "";
});
const oI = (e) => {
  if (!(!e.dictionaryFieldContext || !Object.keys(e.dictionaryFieldContext.contextValues).length))
    return e.dictionaryFieldContext.contextValues;
}, aI = (e) => {
  var t;
  return (t = e.excerptLength) == null ? void 0 : t.length;
}, cI = (e) => {
  const { freezeFacetOrder: t } = e.facetOptions ?? {};
  return t !== void 0 ? { freezeFacetOrder: t } : void 0;
}, uI = (e) => {
  if (e.folding)
    return {
      filterField: e.folding.fields.collection,
      childField: e.folding.fields.parent,
      parentField: e.folding.fields.child,
      filterFieldRange: e.folding.filterFieldRange
    };
}, lI = (e) => e.sortCriteria, dI = async (e) => {
  var t;
  return {
    accessToken: e.configuration.accessToken,
    organizationId: e.configuration.organizationId,
    url: oo(e.configuration.search.apiBaseUrl, e.configuration.organizationId, e.configuration.environment),
    streamId: (t = e.search.extendedResults) == null ? void 0 : t.generativeQuestionAnsweringId
  };
}, fI = (e, t) => {
  var M, _, A;
  const n = (M = Ff(e)) == null ? void 0 : M.q, { aq: r, cq: i, dq: s, lq: o } = gI(e), a = nI(e), c = wi(e.configuration.analytics, t, { actionCause: iI(e) }), u = sI(e), l = rI(e), f = cS(e) ?? [], h = pI(e), m = _f(e.tabSet) || "default", p = nS(e), d = rS(e), g = t.referrer || "", b = cI(e), R = lI(e), w = hI(e), C = aI(e), v = uI(e), x = oI(e);
  return {
    q: n,
    ...r && { aq: r },
    ...i && { cq: i },
    ...s && { dq: s },
    ...o && { lq: o },
    ...e.query && { enableQuerySyntax: eI(e) },
    ...(a == null ? void 0 : a.contextValues) && {
      context: a.contextValues
    },
    pipelineRuleParameters: {
      mlGenerativeQuestionAnswering: {
        responseFormat: e.generatedAnswer.responseFormat,
        citationsFieldToInclude: f
      }
    },
    ...(u == null ? void 0 : u.length) && { searchHub: u },
    ...(l == null ? void 0 : l.length) && { pipeline: l },
    ...h.length && { facets: h },
    ...e.fields && { fieldsToInclude: e.fields.fieldsToInclude },
    ...e.didYouMean && {
      queryCorrection: {
        enabled: e.didYouMean.enableDidYouMean && e.didYouMean.queryCorrectionMode === "next",
        options: {
          automaticallyCorrect: e.didYouMean.automaticallyCorrectQuery ? "whenNoResults" : "never"
        }
      },
      enableDidYouMean: e.didYouMean.enableDidYouMean && e.didYouMean.queryCorrectionMode === "legacy"
    },
    ...e.pagination && {
      numberOfResults: dd(e),
      firstResult: e.pagination.firstResult
    },
    tab: m,
    locale: p,
    timezone: d,
    ...e.debug !== void 0 && { debug: e.debug },
    referrer: g,
    ...w,
    ...v ?? {},
    ...C && { excerptLength: C },
    ...x && {
      dictionaryFieldContext: x
    },
    sortCriteria: R,
    ...b && { facetOptions: b },
    ...c,
    ...((_ = e.insightCaseContext) == null ? void 0 : _.caseContext) && {
      caseContext: (A = e.insightCaseContext) == null ? void 0 : A.caseContext
    }
  };
}, pI = (e) => {
  var t;
  return (t = Pl(e)) == null ? void 0 : t.map((n) => ud(n, cd())).sort((n, r) => n.facetId > r.facetId ? 1 : r.facetId > n.facetId ? -1 : 0);
}, hI = (e) => ({
  actionsHistory: e.configuration.analytics.enabled ? ln.getInstance().getHistory() : []
}), gI = (e) => {
  const t = tI(e), n = fd(e);
  return {
    ...t,
    ...n && { cq: n }
  };
}, Mf = [
  "searching",
  "thinking",
  "answering"
];
function Pf(e) {
  return e.toLowerCase();
}
const Vf = ["search", "generic"], mI = ["text/plain", "text/markdown"], Ht = new L({ required: !0 }), Uf = new L(), pn = new re({ required: !0 }), $f = {
  id: Ht,
  title: Ht,
  uri: Ht,
  permanentid: Ht,
  clickUri: Uf
}, Jo = new L({
  required: !0,
  constrainTo: mI
}), Nf = new L({
  required: !0,
  constrainTo: Mf
}), Lf = (e) => ({
  ...e,
  name: Pf(e.name)
});
S("generatedAnswer/setIsVisible", (e) => O(e, pn));
const yI = S("generatedAnswer/setAnswerId", (e) => O(e, j));
S("generatedAnswer/setAnswerGenerationMode", (e) => O(e, new L({
  constrainTo: ["automatic", "manual"],
  required: !1,
  default: "automatic"
})));
S("generatedAnswer/setIsEnabled", (e) => O(e, pn));
const jf = S("generatedAnswer/updateMessage", (e) => O(e, {
  textDelta: Ht
})), Qf = S("generatedAnswer/updateCitations", (e) => O(e, {
  citations: new ce({
    required: !0,
    each: new z({
      values: $f
    })
  })
})), vI = S("generatedAnswer/updateError", (e) => O(e, {
  message: Uf,
  code: new W({ min: 0 })
})), zf = S("generatedAnswer/resetAnswer");
S("generatedAnswer/like");
S("generatedAnswer/dislike");
S("generatedAnswer/feedbackModal/open");
S("generatedAnswer/expand");
S("generatedAnswer/collapse");
S("generatedAnswer/setId", (e) => O(e, {
  id: new L({
    required: !0
  })
}));
S("generatedAnswer/feedbackModal/close");
S("generatedAnswer/sendFeedback");
const ds = S("generatedAnswer/setIsLoading", (e) => O(e, pn)), cu = S("generatedAnswer/setIsStreaming", (e) => O(e, pn)), Bf = S("generatedAnswer/setAnswerContentFormat", (e) => O(e, Jo));
S("generatedAnswer/updateResponseFormat", (e) => O(e, {
  contentFormat: new ce({
    each: Jo,
    default: ["text/plain"]
  })
}));
S("knowledge/updateAnswerConfigurationId", (e) => O(e, Ht));
S("generatedAnswer/registerFieldsToIncludeInCitations", (e) => O(e, Qg));
const SI = S("generatedAnswer/setIsAnswerGenerated", (e) => O(e, pn)), Hf = S("generatedAnswer/setCannotAnswer", (e) => O(e, pn)), wI = S("generatedAnswer/setAnswerApiQueryParams", (e) => O(e, new z({})));
S("generatedAnswer/startStep", (e) => O(Lf(e), {
  name: Nf,
  startedAt: new W({ min: 0, required: !0 })
}));
S("generatedAnswer/finishStep", (e) => O(Lf(e), {
  name: Nf,
  finishedAt: new W({ min: 0, required: !0 })
}));
S("generatedAnswer/startToolCall", (e) => O(e, {
  toolCallName: j,
  startedAt: new W({ min: 0, required: !0 }),
  toolCallId: j
}));
S("generatedAnswer/finishToolCall", (e) => O(e, {
  finishedAt: new W({ min: 0, required: !0 }),
  toolCallId: j
}));
S("generatedAnswer/toolCallArgs", (e) => O(e, {
  toolCallId: j,
  args: new z({ options: { required: !0 } }),
  type: new L({
    required: !0,
    constrainTo: Vf
  })
}));
te("generatedAnswer/streamAnswer", async (e, t) => {
  var m;
  const n = t.getState(), { dispatch: r, extra: i, getState: s } = t, { search: o } = s(), { queryExecuted: a } = o, { setAbortControllerRef: c } = e, u = await dI(n), l = (p, d) => {
    switch (p) {
      case "genqa.headerMessageType": {
        const g = JSON.parse(d);
        r(Bf(g.contentFormat));
        break;
      }
      case "genqa.messageType":
        r(jf(JSON.parse(d)));
        break;
      case "genqa.citationsType":
        r(Qf(JSON.parse(d)));
        break;
      case "genqa.endOfStreamType": {
        const g = JSON.parse(d).answerGenerated, { answerId: b, answer: R } = s().generatedAnswer, C = a.length !== 0 && !g, v = !(R != null && R.trim());
        r(Hf(C)), r(cu(!1)), r(SI(g)), r(Df(g, b, g ? v : void 0)), r(Tf());
        break;
      }
      default:
        n.debug && i.logger.warn(`Unknown payloadType: "${p}"`);
    }
  };
  r(ds(!0));
  const f = (p) => p.streamId === t.getState().search.extendedResults.generativeQuestionAnsweringId, h = (m = i.streamingClient) == null ? void 0 : m.streamGeneratedAnswer(u, {
    write: (p) => {
      f(u) && (r(ds(!1)), p.payload && p.payloadType && l(p.payloadType, p.payload));
    },
    abort: (p) => {
      f(u) && r(vI(p));
    },
    close: () => {
      f(u) && r(cu(!1));
    },
    resetAnswer: () => {
      f(u) && r(zf());
    }
  });
  h ? c(h) : r(ds(!1));
});
te("generatedAnswer/generateAnswer", async (e, { getState: t, dispatch: n, extra: { navigatorContext: r, logger: i } }) => {
  n(zf());
  const s = t();
  if (s.generatedAnswer.isEnabled === !1) {
    i.warn("[WARNING] The generateAnswer action was dispatched while the generated answer is disabled. No answer will be generated. Enable the generated answer before dispatching generateAnswer.");
    return;
  }
  if (s.generatedAnswer.answerConfigurationId) {
    const o = fI(s, r);
    n(wI(o)), await n($I(o));
  } else
    i.warn("[WARNING] Missing answerConfigurationId in engine configuration. The generateAnswer action requires an answer configuration ID to use CRGA with the Answer API.");
});
async function bI(e, t) {
  const n = e.getReader();
  let r;
  for (; !(r = await n.read()).done; )
    t(r.value);
}
var kt;
(function(e) {
  e[e.NewLine = 10] = "NewLine", e[e.CarriageReturn = 13] = "CarriageReturn", e[e.Space = 32] = "Space", e[e.Colon = 58] = "Colon";
})(kt || (kt = {}));
function CI(e) {
  let t, n, r, i = !1;
  return function(o) {
    t === void 0 ? (t = o, n = 0, r = -1) : t = xI(t, o);
    const a = t.length;
    let c = 0;
    for (; n < a; ) {
      i && (t[n] === kt.NewLine && (c = ++n), i = !1);
      let u = -1;
      for (; n < a && u === -1; ++n)
        switch (t[n]) {
          case kt.Colon:
            r === -1 && (r = n - c);
            break;
          case kt.CarriageReturn:
            i = !0, u = n;
            break;
          case kt.NewLine:
            u = n;
            break;
        }
      if (u === -1)
        break;
      e(t.subarray(c, u), r), c = n, r = -1;
    }
    c === a ? t = void 0 : c !== 0 && (t = t.subarray(c), n -= c);
  };
}
function II(e, t, n) {
  let r = uu();
  const i = new TextDecoder();
  return function(o, a) {
    if (o.length === 0)
      n == null || n(r), r = uu();
    else if (a > 0) {
      const c = i.decode(o.subarray(0, a)), u = a + (o[a + 1] === kt.Space ? 2 : 1), l = i.decode(o.subarray(u));
      switch (c) {
        case "data":
          r.data = r.data ? `${r.data}
${l}` : l;
          break;
        case "event":
          r.event = l;
          break;
        case "id":
          e(r.id = l);
          break;
        case "retry":
          AI(l, r, t);
          break;
      }
    }
  };
}
function AI(e, t, n) {
  const r = parseInt(e, 10);
  Number.isNaN(r) || n(t.retry = r);
}
function xI(e, t) {
  const n = new Uint8Array(e.length + t.length);
  return n.set(e), n.set(t, e.length), n;
}
function uu() {
  return {
    data: "",
    event: "",
    id: "",
    retry: void 0
  };
}
const Gs = "text/event-stream", EI = 1e3, lu = "last-event-id";
function du() {
  return typeof window < "u";
}
function kI(e, { signal: t, headers: n, onopen: r, onmessage: i, onclose: s, onerror: o, openWhenHidden: a, fetch: c, ...u }) {
  return new Promise((l, f) => {
    const h = { ...n };
    h.accept || (h.accept = Gs);
    let m;
    function p() {
      m == null || m.abort(), document.hidden || C();
    }
    !a && du() && document.addEventListener("visibilitychange", p);
    let d = EI, g;
    function b() {
      du() && document.removeEventListener("visibilitychange", p), clearTimeout(g), m == null || m.abort();
    }
    t == null || t.addEventListener("abort", () => {
      b(), l();
    });
    const R = c ?? fetch, w = r ?? RI;
    async function C() {
      var v;
      m = AbortController ? new AbortController() : null;
      try {
        const x = await R(e, {
          ...u,
          headers: h,
          signal: m == null ? void 0 : m.signal
        });
        await w(x), await bI(x.body, CI(II((M) => {
          M ? h[lu] = M : delete h[lu];
        }, (M) => {
          d = M;
        }, i))), s == null || s(), b(), l();
      } catch (x) {
        if (!((v = m == null ? void 0 : m.signal) != null && v.aborted))
          try {
            const M = (o == null ? void 0 : o(x)) ?? d;
            clearTimeout(g), g = setTimeout(C, M);
          } catch (M) {
            b(), f(M);
          }
      }
    }
    C();
  });
}
function RI(e) {
  const t = e.headers.get("content-type");
  if (!(t != null && t.startsWith(Gs)))
    throw new Error(`Expected content-type to be ${Gs}, Actual: ${t}`);
}
const OI = async (e, t, n) => {
  var u;
  const r = t.getState(), { accessToken: i, environment: s, organizationId: o } = r.configuration, a = r.generatedAnswer.answerConfigurationId, c = {
    ...e,
    headers: {
      ...(e == null ? void 0 : e.headers) || {},
      Authorization: `Bearer ${i}`
    }
  };
  try {
    const l = oo((u = r.configuration.search) == null ? void 0 : u.apiBaseUrl, o, s);
    return RC({
      baseUrl: `${l}/rest/organizations/${o}/answer/v1/configs/${a}`
    })(c, t, n);
  } catch (l) {
    return { error: l };
  }
}, qI = XC({
  reducerPath: "answer",
  baseQuery: FC(OI, { maxRetries: 3 }),
  endpoints: () => ({})
}), FI = (e, t) => {
  const { contentFormat: n } = t;
  e.contentFormat = n, e.isStreaming = !0, e.isLoading = !1;
}, DI = (e, t) => {
  const { textDelta: n } = t;
  if (typeof n != "string")
    return;
  const r = e.answer;
  !(r != null && r.trim()) && !n.trim() || (e.answer = r != null && r.trim() ? r.concat(n) : n);
}, TI = (e, t) => {
  e.citations = t.citations;
}, _I = (e, t) => {
  e.generated = t.answerGenerated, e.isStreaming = !1;
}, MI = (e, t) => {
  const n = t.errorMessage || "Unknown error occurred";
  e.error = {
    message: n,
    code: t.code
  }, e.isStreaming = !1, e.isLoading = !1, console.error(`Generated answer error: ${n} (code: ${t.code})`);
}, PI = (e, t, n) => {
  var s;
  const r = JSON.parse(e.data);
  r.finishReason === "ERROR" && r.errorMessage && MI(t, r);
  const i = r.payload.length ? JSON.parse(r.payload) : {};
  switch (r.payloadType) {
    case "genqa.headerMessageType":
      i.contentFormat && (FI(t, i), n(Bf(i.contentFormat)));
      break;
    case "genqa.messageType":
      typeof i.textDelta == "string" && (DI(t, i), n(jf({ textDelta: i.textDelta })));
      break;
    case "genqa.citationsType":
      i.citations && (TI(t, i), n(Qf({ citations: i.citations })));
      break;
    case "genqa.endOfStreamType": {
      _I(t, i);
      const o = t.answerId, a = i.answerGenerated ?? !1, c = a ? !((s = t.answer) != null && s.trim()) : void 0;
      n(Df(a, o, c)), n(Tf());
      break;
    }
  }
}, VI = (e, t, n, r) => {
  if (!e || !t || !n)
    throw new Error("Missing required parameters for answer endpoint");
  const i = `/rest/organizations/${t}`, s = r ? `insight/v1/configs/${r}/answer` : "answer/v1/configs";
  return `${e}${i}/${s}/${n}/generate`;
}, UI = qI.injectEndpoints({
  overrideExisting: !0,
  endpoints: (e) => ({
    getAnswer: e.query({
      queryFn: () => ({
        data: {
          contentFormat: void 0,
          answer: void 0,
          citations: void 0,
          error: void 0,
          generated: !1,
          isStreaming: !0,
          isLoading: !0
        }
      }),
      serializeQueryArgs: ({ endpointName: t, queryArgs: n }) => {
        const { analytics: r, ...i } = n;
        return `${t}(${JSON.stringify(i)})`;
      },
      async onCacheEntryAdded(t, { getState: n, cacheDataLoaded: r, updateCachedData: i, dispatch: s }) {
        await r;
        const { configuration: o, generatedAnswer: a, insightConfiguration: c } = n(), { organizationId: u, environment: l, accessToken: f } = o, h = oo(o.search.apiBaseUrl, u, l), m = VI(h, u, a.answerConfigurationId, c == null ? void 0 : c.insightId);
        await kI(m, {
          method: "POST",
          body: JSON.stringify(t),
          headers: {
            Authorization: `Bearer ${f}`,
            Accept: "application/json",
            "Content-Type": "application/json",
            "Accept-Encoding": "*"
          },
          fetch,
          onopen: async (p) => {
            const d = p.headers.get("x-answer-id");
            d && i((g) => {
              g.answerId = d, s(yI(d));
            });
          },
          onmessage: (p) => {
            i((d) => {
              PI(p, d, s);
            });
          },
          onerror: (p) => {
            throw p;
          },
          onclose: () => {
            i((p) => {
              s(Hf(!p.generated));
            });
          }
        });
      }
    })
  })
}), $I = (e) => UI.endpoints.getAnswer.initiate(e);
var $r = { exports: {} }, NI = $r.exports, fu;
function LI() {
  return fu || (fu = 1, (function(e, t) {
    (function(n, r) {
      e.exports = r();
    })(NI, (function() {
      var n = { year: 0, month: 1, day: 2, hour: 3, minute: 4, second: 5 }, r = {};
      return function(i, s, o) {
        var a, c = function(h, m, p) {
          p === void 0 && (p = {});
          var d = new Date(h), g = (function(b, R) {
            R === void 0 && (R = {});
            var w = R.timeZoneName || "short", C = b + "|" + w, v = r[C];
            return v || (v = new Intl.DateTimeFormat("en-US", { hour12: !1, timeZone: b, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", timeZoneName: w }), r[C] = v), v;
          })(m, p);
          return g.formatToParts(d);
        }, u = function(h, m) {
          for (var p = c(h, m), d = [], g = 0; g < p.length; g += 1) {
            var b = p[g], R = b.type, w = b.value, C = n[R];
            C >= 0 && (d[C] = parseInt(w, 10));
          }
          var v = d[3], x = v === 24 ? 0 : v, M = d[0] + "-" + d[1] + "-" + d[2] + " " + x + ":" + d[4] + ":" + d[5] + ":000", _ = +h;
          return (o.utc(M).valueOf() - (_ -= _ % 1e3)) / 6e4;
        }, l = s.prototype;
        l.tz = function(h, m) {
          h === void 0 && (h = a);
          var p, d = this.utcOffset(), g = this.toDate(), b = g.toLocaleString("en-US", { timeZone: h }), R = Math.round((g - new Date(b)) / 1e3 / 60), w = 15 * -Math.round(g.getTimezoneOffset() / 15) - R;
          if (!Number(w)) p = this.utcOffset(0, m);
          else if (p = o(b, { locale: this.$L }).$set("millisecond", this.$ms).utcOffset(w, !0), m) {
            var C = p.utcOffset();
            p = p.add(d - C, "minute");
          }
          return p.$x.$timezone = h, p;
        }, l.offsetName = function(h) {
          var m = this.$x.$timezone || o.tz.guess(), p = c(this.valueOf(), m, { timeZoneName: h }).find((function(d) {
            return d.type.toLowerCase() === "timezonename";
          }));
          return p && p.value;
        };
        var f = l.startOf;
        l.startOf = function(h, m) {
          if (!this.$x || !this.$x.$timezone) return f.call(this, h, m);
          var p = o(this.format("YYYY-MM-DD HH:mm:ss:SSS"), { locale: this.$L });
          return f.call(p, h, m).tz(this.$x.$timezone, !0);
        }, o.tz = function(h, m, p) {
          var d = p && m, g = p || m || a, b = u(+o(), g);
          if (typeof h != "string") return o(h).tz(g);
          var R = (function(x, M, _) {
            var A = x - 60 * M * 1e3, E = u(A, _);
            if (M === E) return [A, M];
            var I = u(A -= 60 * (E - M) * 1e3, _);
            return E === I ? [A, E] : [x - 60 * Math.min(E, I) * 1e3, Math.max(E, I)];
          })(o.utc(h, d).valueOf(), b, g), w = R[0], C = R[1], v = o(w).utcOffset(C);
          return v.$x.$timezone = g, v;
        }, o.tz.guess = function() {
          return Intl.DateTimeFormat().resolvedOptions().timeZone;
        }, o.tz.setDefault = function(h) {
          a = h;
        };
      };
    }));
  })($r)), $r.exports;
}
var jI = LI();
const QI = /* @__PURE__ */ Bn(jI);
var Nr = { exports: {} }, zI = Nr.exports, pu;
function BI() {
  return pu || (pu = 1, (function(e, t) {
    (function(n, r) {
      e.exports = r();
    })(zI, (function() {
      var n = "minute", r = /[+-]\d\d(?::?\d\d)?/g, i = /([+-]|\d\d)/g;
      return function(s, o, a) {
        var c = o.prototype;
        a.utc = function(d) {
          var g = { date: d, utc: !0, args: arguments };
          return new o(g);
        }, c.utc = function(d) {
          var g = a(this.toDate(), { locale: this.$L, utc: !0 });
          return d ? g.add(this.utcOffset(), n) : g;
        }, c.local = function() {
          return a(this.toDate(), { locale: this.$L, utc: !1 });
        };
        var u = c.parse;
        c.parse = function(d) {
          d.utc && (this.$u = !0), this.$utils().u(d.$offset) || (this.$offset = d.$offset), u.call(this, d);
        };
        var l = c.init;
        c.init = function() {
          if (this.$u) {
            var d = this.$d;
            this.$y = d.getUTCFullYear(), this.$M = d.getUTCMonth(), this.$D = d.getUTCDate(), this.$W = d.getUTCDay(), this.$H = d.getUTCHours(), this.$m = d.getUTCMinutes(), this.$s = d.getUTCSeconds(), this.$ms = d.getUTCMilliseconds();
          } else l.call(this);
        };
        var f = c.utcOffset;
        c.utcOffset = function(d, g) {
          var b = this.$utils().u;
          if (b(d)) return this.$u ? 0 : b(this.$offset) ? f.call(this) : this.$offset;
          if (typeof d == "string" && (d = (function(v) {
            v === void 0 && (v = "");
            var x = v.match(r);
            if (!x) return null;
            var M = ("" + x[0]).match(i) || ["-", 0, 0], _ = M[0], A = 60 * +M[1] + +M[2];
            return A === 0 ? 0 : _ === "+" ? A : -A;
          })(d), d === null)) return this;
          var R = Math.abs(d) <= 16 ? 60 * d : d;
          if (R === 0) return this.utc(g);
          var w = this.clone();
          if (g) return w.$offset = R, w.$u = !1, w;
          var C = this.$u ? this.toDate().getTimezoneOffset() : -1 * this.utcOffset();
          return (w = this.local().add(R + C, n)).$offset = R, w.$x.$localOffset = C, w;
        };
        var h = c.format;
        c.format = function(d) {
          var g = d || (this.$u ? "YYYY-MM-DDTHH:mm:ss[Z]" : "");
          return h.call(this, g);
        }, c.valueOf = function() {
          var d = this.$utils().u(this.$offset) ? 0 : this.$offset + (this.$x.$localOffset || this.$d.getTimezoneOffset());
          return this.$d.valueOf() - 6e4 * d;
        }, c.isUTC = function() {
          return !!this.$u;
        }, c.toISOString = function() {
          return this.toDate().toISOString();
        }, c.toString = function() {
          return this.toDate().toUTCString();
        };
        var m = c.toDate;
        c.toDate = function(d) {
          return d === "s" && this.$offset ? a(this.format("YYYY-MM-DD HH:mm:ss:SSS")).toDate() : m.call(this);
        };
        var p = c.diff;
        c.diff = function(d, g, b) {
          if (d && this.$u === d.$u) return p.call(this, d, g, b);
          var R = this.local(), w = a(d).local();
          return p.call(R, w, g, b);
        };
      };
    }));
  })(Nr)), Nr.exports;
}
var HI = BI();
const YI = /* @__PURE__ */ Bn(HI);
ze.extend(YI);
ze.extend(QI);
const WI = () => ({
  organizationId: "",
  accessToken: "",
  search: {
    locale: "en-US",
    timezone: ze.tz.guess(),
    authenticationProviders: []
  },
  analytics: {
    enabled: !0,
    originContext: "Search",
    originLevel2: "default",
    originLevel3: "default",
    anonymous: !1,
    deviceId: "",
    userDisplayName: "",
    documentLocation: "",
    analyticsMode: "next",
    source: {}
  },
  knowledge: {
    answerConfigurationId: "",
    agentId: void 0
  },
  environment: "prod"
}), KI = /(^|; )Coveo-Pendragon=([^;]*)/, GI = /(^|; )Coveo-SearchAgentDebug=([^;]*)/;
function JI() {
  var e;
  return typeof window > "u" ? !1 : ((e = KI.exec(document.cookie)) == null ? void 0 : e.pop()) || null;
}
function ZI() {
  return typeof window > "u" ? !1 : GI.test(document.cookie);
}
se(WI(), (e) => e.addCase(ml, (t, n) => {
  XI(t, n.payload);
}).addCase(Wg, (t, n) => {
  eA(t, n.payload);
}).addCase(Kg, (t, n) => {
  tA(t, n.payload);
}).addCase(Gg, (t) => {
  t.analytics.enabled = !1;
}).addCase(Jg, (t) => {
  t.analytics.enabled = !0;
}).addCase(Zg, (t, n) => {
  t.analytics.originLevel2 = n.payload.originLevel2;
}).addCase(Xg, (t, n) => {
  t.analytics.originLevel3 = n.payload.originLevel3;
}).addCase(Zn, (t, n) => {
  t.analytics.originLevel2 = n.payload;
}).addCase(pb, (t, n) => {
  t.analytics.originLevel2 = n.payload;
}).addCase(Ct, (t, n) => {
  Z(n.payload.tab) || (t.analytics.originLevel2 = n.payload.tab);
}).addCase(em, (t, { payload: n }) => {
  nA(t, n);
}));
function XI(e, t) {
  Z(t.accessToken) || (e.accessToken = t.accessToken), e.environment = t.environment ?? "prod", Z(t.organizationId) || (e.organizationId = t.organizationId);
}
function eA(e, t) {
  Z(t.proxyBaseUrl) || (e.search.apiBaseUrl = t.proxyBaseUrl), Z(t.locale) || (e.search.locale = t.locale), Z(t.timezone) || (e.search.timezone = t.timezone), Z(t.authenticationProviders) || (e.search.authenticationProviders = t.authenticationProviders);
}
function tA(e, t) {
  Z(t.enabled) || (e.analytics.enabled = t.enabled), Z(t.originContext) || (e.analytics.originContext = t.originContext), Z(t.originLevel2) || (e.analytics.originLevel2 = t.originLevel2), Z(t.originLevel3) || (e.analytics.originLevel3 = t.originLevel3), Z(t.proxyBaseUrl) || (e.analytics.apiBaseUrl = t.proxyBaseUrl), Z(t.trackingId) || (e.analytics.trackingId = t.trackingId), Z(t.analyticsMode) || (e.analytics.analyticsMode = t.analyticsMode), Z(t.source) || (e.analytics.source = t.source);
  try {
    const n = JI();
    n && (e.analytics.analyticsMode = "next", e.analytics.trackingId = n);
  } catch {
  }
  Z(t.runtimeEnvironment) || (e.analytics.runtimeEnvironment = t.runtimeEnvironment), Z(t.anonymous) || (e.analytics.anonymous = t.anonymous), Z(t.deviceId) || (e.analytics.deviceId = t.deviceId), Z(t.userDisplayName) || (e.analytics.userDisplayName = t.userDisplayName), Z(t.documentLocation) || (e.analytics.documentLocation = t.documentLocation);
}
function nA(e, t) {
  e.knowledge.agentId = t;
  try {
    ZI() && (e.knowledge.debugAgentSession = !0);
  } catch {
  }
}
const rA = new L({ required: !0 }), Yf = new L({
  required: !0,
  constrainTo: Mf
}), Wf = (e) => ({
  ...e,
  name: Pf(e.name)
});
S("followUpAnswers/setIsEnabled", (e) => O(e, new re({ required: !0 })));
S("followUpAnswers/setFollowUpAnswersConversationId", (e) => O(e, j));
S("followUpAnswers/setFollowUpAnswersConversationToken", (e) => O(e, j));
S("followUpAnswers/clearFollowUpAnswersConversationToken");
S("followUpAnswers/createFollowUpAnswer", (e) => O(e, {
  question: j
}));
S("followUpAnswers/setActiveFollowUpAnswerId", (e) => O(e, j));
S("followUpAnswers/setFollowUpAnswerContentFormat", (e) => O(e, {
  contentFormat: Jo,
  answerId: j
}));
S("followUpAnswers/setFollowUpIsLoading", (e) => O(e, {
  isLoading: new re({ required: !0 }),
  answerId: j
}));
S("followUpAnswers/setFollowUpIsStreaming", (e) => O(e, {
  isStreaming: new re({ required: !0 }),
  answerId: j
}));
S("followUpAnswers/followUpMessageChunkReceived", (e) => O(e, {
  textDelta: rA,
  answerId: j
}));
S("followUpAnswers/followUpCitationsReceived", (e) => O(e, {
  citations: new ce({
    required: !0,
    each: new z({
      values: $f
    })
  }),
  answerId: j
}));
S("followUpAnswers/followUpCompleted", (e) => O(e, {
  answerId: j,
  cannotAnswer: new re({ required: !1 })
}));
S("followUpAnswers/followUpFailed", (e) => O(e, {
  message: new L(),
  code: new W({ min: 0 }),
  answerId: j
}));
S("followUpAnswers/activeFollowUpStartFailed", (e) => O(e, {
  message: new L()
}));
S("followUpAnswers/likeFollowUp", (e) => O(e, {
  answerId: j
}));
S("followUpAnswers/dislikeFollowUp", (e) => O(e, {
  answerId: j
}));
S("followUpAnswers/submitFollowUpFeedback", (e) => O(e, {
  answerId: j
}));
S("followUpAnswers/resetFollowUpAnswers");
S("followUpAnswers/stepStarted", (e) => O(Wf(e), {
  answerId: j,
  name: Yf,
  startedAt: new W({ min: 0, required: !0 })
}));
S("followUpAnswers/stepFinished", (e) => O(Wf(e), {
  answerId: j,
  name: Yf,
  finishedAt: new W({ min: 0, required: !0 })
}));
S("followUpAnswers/startToolCall", (e) => O(e, {
  answerId: j,
  toolCallName: j,
  startedAt: new W({ min: 0, required: !0 }),
  toolCallId: j
}));
S("followUpAnswers/finishToolCall", (e) => O(e, {
  answerId: j,
  finishedAt: new W({ min: 0, required: !0 }),
  toolCallId: j
}));
S("followUpAnswers/toolCallArgs", (e) => O(e, {
  answerId: j,
  toolCallId: j,
  args: new z({ options: { required: !0 } }),
  type: new L({
    required: !0,
    constrainTo: Vf
  })
}));
var lt;
(function(e) {
  e[e.SseMaxDurationExceeded = 1e3] = "SseMaxDurationExceeded", e[e.SseFollowUpNotSupported = 1001] = "SseFollowUpNotSupported", e[e.ConversationNotFound = 1002] = "ConversationNotFound", e[e.SseModelsNotAvailable = 1003] = "SseModelsNotAvailable", e[e.SseInternalError = 1004] = "SseInternalError", e[e.SseTurnLimitReached = 1005] = "SseTurnLimitReached";
})(lt || (lt = {}));
lt.SseMaxDurationExceeded, lt.SseFollowUpNotSupported, lt.ConversationNotFound, lt.SseModelsNotAvailable, lt.SseInternalError, lt.SseTurnLimitReached;
var vn = { exports: {} }, fs, hu;
function iA() {
  if (hu) return fs;
  hu = 1;
  function e(n) {
    try {
      return JSON.stringify(n);
    } catch {
      return '"[Circular]"';
    }
  }
  fs = t;
  function t(n, r, i) {
    var s = i && i.stringify || e, o = 1;
    if (typeof n == "object" && n !== null) {
      var a = r.length + o;
      if (a === 1) return n;
      var c = new Array(a);
      c[0] = s(n);
      for (var u = 1; u < a; u++)
        c[u] = s(r[u]);
      return c.join(" ");
    }
    if (typeof n != "string")
      return n;
    var l = r.length;
    if (l === 0) return n;
    for (var f = "", h = 1 - o, m = -1, p = n && n.length || 0, d = 0; d < p; ) {
      if (n.charCodeAt(d) === 37 && d + 1 < p) {
        switch (m = m > -1 ? m : 0, n.charCodeAt(d + 1)) {
          case 100:
          // 'd'
          case 102:
            if (h >= l || r[h] == null) break;
            m < d && (f += n.slice(m, d)), f += Number(r[h]), m = d + 2, d++;
            break;
          case 105:
            if (h >= l || r[h] == null) break;
            m < d && (f += n.slice(m, d)), f += Math.floor(Number(r[h])), m = d + 2, d++;
            break;
          case 79:
          // 'O'
          case 111:
          // 'o'
          case 106:
            if (h >= l || r[h] === void 0) break;
            m < d && (f += n.slice(m, d));
            var g = typeof r[h];
            if (g === "string") {
              f += "'" + r[h] + "'", m = d + 2, d++;
              break;
            }
            if (g === "function") {
              f += r[h].name || "<anonymous>", m = d + 2, d++;
              break;
            }
            f += s(r[h]), m = d + 2, d++;
            break;
          case 115:
            if (h >= l)
              break;
            m < d && (f += n.slice(m, d)), f += String(r[h]), m = d + 2, d++;
            break;
          case 37:
            m < d && (f += n.slice(m, d)), f += "%", m = d + 2, d++, h--;
            break;
        }
        ++h;
      }
      ++d;
    }
    return m === -1 ? n : (m < p && (f += n.slice(m)), f);
  }
  return fs;
}
var gu;
function sA() {
  if (gu) return vn.exports;
  gu = 1;
  const e = iA();
  vn.exports = l;
  const t = q().console || {}, n = {
    mapHttpRequest: M,
    mapHttpResponse: M,
    wrapRequestSerializer: _,
    wrapResponseSerializer: _,
    wrapErrorSerializer: _,
    req: M,
    res: M,
    err: v,
    errWithCause: v
  };
  function r(y, F) {
    return y === "silent" ? 1 / 0 : F.levels.values[y];
  }
  const i = Symbol("pino.logFuncs"), s = Symbol("pino.hierarchy"), o = {
    error: "log",
    fatal: "error",
    warn: "error",
    info: "log",
    debug: "log",
    trace: "log"
  };
  function a(y, F) {
    const k = {
      logger: F,
      parent: y[s]
    };
    F[s] = k;
  }
  function c(y, F, k) {
    const D = {};
    F.forEach(($) => {
      D[$] = k[$] ? k[$] : t[$] || t[o[$] || "log"] || A;
    }), y[i] = D;
  }
  function u(y, F) {
    return Array.isArray(y) ? y.filter(function(D) {
      return D !== "!stdSerializers.err";
    }) : y === !0 ? Object.keys(F) : !1;
  }
  function l(y) {
    y = y || {}, y.browser = y.browser || {};
    const F = y.browser.transmit;
    if (F && typeof F.send != "function")
      throw Error("pino: transmit option must have a send function");
    const k = y.browser.write || t;
    y.browser.write && (y.browser.asObject = !0);
    const D = y.serializers || {}, $ = u(y.browser.serialize, D);
    let Q = y.browser.serialize;
    Array.isArray(y.browser.serialize) && y.browser.serialize.indexOf("!stdSerializers.err") > -1 && (Q = !1);
    const K = Object.keys(y.customLevels || {}), Y = ["error", "fatal", "warn", "info", "debug", "trace"].concat(K);
    typeof k == "function" && Y.forEach(function(G) {
      k[G] = k;
    }), (y.enabled === !1 || y.browser.disabled) && (y.level = "silent");
    const ne = y.level || "info", B = Object.create(k);
    B.log || (B.log = A), c(B, Y, k), a({}, B), Object.defineProperty(B, "levelVal", {
      get: H
    }), Object.defineProperty(B, "level", {
      get: ie,
      set: oe
    });
    const X = {
      transmit: F,
      serialize: $,
      asObject: y.browser.asObject,
      asObjectBindingsOnly: y.browser.asObjectBindingsOnly,
      formatters: y.browser.formatters,
      reportCaller: y.browser.reportCaller,
      levels: Y,
      timestamp: x(y),
      messageKey: y.messageKey || "msg",
      onChild: y.onChild || A
    };
    B.levels = f(y), B.level = ne, B.isLevelEnabled = function(G) {
      return this.levels.values[G] ? this.levels.values[G] >= this.levels.values[this.level] : !1;
    }, B.setMaxListeners = B.getMaxListeners = B.emit = B.addListener = B.on = B.prependListener = B.once = B.prependOnceListener = B.removeListener = B.removeAllListeners = B.listeners = B.listenerCount = B.eventNames = B.write = B.flush = A, B.serializers = D, B._serialize = $, B._stdErrSerialize = Q, B.child = function(...G) {
      return ue.call(this, X, ...G);
    }, F && (B._logEvent = C());
    function H() {
      return r(this.level, this);
    }
    function ie() {
      return this._level;
    }
    function oe(G) {
      if (G !== "silent" && !this.levels.values[G])
        throw Error("unknown level " + G);
      this._level = G, p(this, X, B, "error"), p(this, X, B, "fatal"), p(this, X, B, "warn"), p(this, X, B, "info"), p(this, X, B, "debug"), p(this, X, B, "trace"), K.forEach((J) => {
        p(this, X, B, J);
      });
    }
    function ue(G, J, de) {
      if (!J)
        throw new Error("missing bindings for child Pino");
      de = de || {}, $ && J.serializers && (de.serializers = J.serializers);
      const pe = de.serializers;
      if ($ && pe) {
        var xe = Object.assign({}, D, pe), ve = y.browser.serialize === !0 ? Object.keys(xe) : $;
        delete J.serializers, R([J], ve, xe, this._stdErrSerialize);
      }
      function qe(he) {
        this._childLevel = (he._childLevel | 0) + 1, this.bindings = J, xe && (this.serializers = xe, this._serialize = ve), F && (this._logEvent = C(
          [].concat(he._logEvent.bindings, J)
        ));
      }
      qe.prototype = this;
      const Se = new qe(this);
      return a(this, Se), Se.child = function(...he) {
        return ue.call(this, G, ...he);
      }, Se.level = de.level || this.level, G.onChild(Se), Se;
    }
    return B;
  }
  function f(y) {
    const F = y.customLevels || {}, k = Object.assign({}, l.levels.values, F), D = Object.assign({}, l.levels.labels, h(F));
    return {
      values: k,
      labels: D
    };
  }
  function h(y) {
    const F = {};
    return Object.keys(y).forEach(function(k) {
      F[y[k]] = k;
    }), F;
  }
  l.levels = {
    values: {
      fatal: 60,
      error: 50,
      warn: 40,
      info: 30,
      debug: 20,
      trace: 10
    },
    labels: {
      10: "trace",
      20: "debug",
      30: "info",
      40: "warn",
      50: "error",
      60: "fatal"
    }
  }, l.stdSerializers = n, l.stdTimeFunctions = Object.assign({}, { nullTime: E, epochTime: I, unixTime: T, isoTime: U });
  function m(y) {
    const F = [];
    y.bindings && F.push(y.bindings);
    let k = y[s];
    for (; k.parent; )
      k = k.parent, k.logger.bindings && F.push(k.logger.bindings);
    return F.reverse();
  }
  function p(y, F, k, D) {
    if (Object.defineProperty(y, D, {
      value: r(y.level, k) > r(D, k) ? A : k[i][D],
      writable: !0,
      enumerable: !0,
      configurable: !0
    }), y[D] === A) {
      if (!F.transmit) return;
      const Q = F.transmit.level || y.level, K = r(Q, k);
      if (r(D, k) < K) return;
    }
    y[D] = g(y, F, k, D);
    const $ = m(y);
    $.length !== 0 && (y[D] = d($, y[D]));
  }
  function d(y, F) {
    return function() {
      return F.apply(this, [...y, ...arguments]);
    };
  }
  function g(y, F, k, D) {
    return /* @__PURE__ */ (function($) {
      return function() {
        const K = F.timestamp(), Y = new Array(arguments.length), ne = Object.getPrototypeOf && Object.getPrototypeOf(this) === t ? t : this;
        for (var B = 0; B < Y.length; B++) Y[B] = arguments[B];
        var X = !1;
        if (F.serialize && (R(Y, this._serialize, this.serializers, this._stdErrSerialize), X = !0), F.asObject || F.formatters) {
          const H = b(this, D, Y, K, F);
          if (F.reportCaller && H && H.length > 0 && H[0] && typeof H[0] == "object")
            try {
              const ie = N();
              ie && (H[0].caller = ie);
            } catch {
            }
          $.call(ne, ...H);
        } else {
          if (F.reportCaller)
            try {
              const H = N();
              H && Y.push(H);
            } catch {
            }
          $.apply(ne, Y);
        }
        if (F.transmit) {
          const H = F.transmit.level || y._level, ie = r(H, k), oe = r(D, k);
          if (oe < ie) return;
          w(this, {
            ts: K,
            methodLevel: D,
            methodValue: oe,
            transmitValue: k.levels.values[F.transmit.level || y._level],
            send: F.transmit.send,
            val: r(y._level, k)
          }, Y, X);
        }
      };
    })(y[i][D]);
  }
  function b(y, F, k, D, $) {
    const {
      level: Q,
      log: K = (H) => H
    } = $.formatters || {}, Y = k.slice();
    let ne = Y[0];
    const B = {};
    let X = (y._childLevel | 0) + 1;
    if (X < 1 && (X = 1), D && (B.time = D), Q) {
      const H = Q(F, y.levels.values[F]);
      Object.assign(B, H);
    } else
      B.level = y.levels.values[F];
    if ($.asObjectBindingsOnly) {
      if (ne !== null && typeof ne == "object")
        for (; X-- && typeof Y[0] == "object"; )
          Object.assign(B, Y.shift());
      return [K(B), ...Y];
    } else {
      if (ne !== null && typeof ne == "object") {
        for (; X-- && typeof Y[0] == "object"; )
          Object.assign(B, Y.shift());
        ne = Y.length ? e(Y.shift(), Y) : void 0;
      } else typeof ne == "string" && (ne = e(Y.shift(), Y));
      return ne !== void 0 && (B[$.messageKey] = ne), [K(B)];
    }
  }
  function R(y, F, k, D) {
    for (const $ in y)
      if (D && y[$] instanceof Error)
        y[$] = l.stdSerializers.err(y[$]);
      else if (typeof y[$] == "object" && !Array.isArray(y[$]) && F)
        for (const Q in y[$])
          F.indexOf(Q) > -1 && Q in k && (y[$][Q] = k[Q](y[$][Q]));
  }
  function w(y, F, k, D = !1) {
    const $ = F.send, Q = F.ts, K = F.methodLevel, Y = F.methodValue, ne = F.val, B = y._logEvent.bindings;
    D || R(
      k,
      y._serialize || Object.keys(y.serializers),
      y.serializers,
      y._stdErrSerialize === void 0 ? !0 : y._stdErrSerialize
    ), y._logEvent.ts = Q, y._logEvent.messages = k.filter(function(X) {
      return B.indexOf(X) === -1;
    }), y._logEvent.level.label = K, y._logEvent.level.value = Y, $(K, y._logEvent, ne), y._logEvent = C(B);
  }
  function C(y) {
    return {
      ts: 0,
      messages: [],
      bindings: y || [],
      level: { label: "", value: 0 }
    };
  }
  function v(y) {
    const F = {
      type: y.constructor.name,
      msg: y.message,
      stack: y.stack
    };
    for (const k in y)
      F[k] === void 0 && (F[k] = y[k]);
    return F;
  }
  function x(y) {
    return typeof y.timestamp == "function" ? y.timestamp : y.timestamp === !1 ? E : I;
  }
  function M() {
    return {};
  }
  function _(y) {
    return y;
  }
  function A() {
  }
  function E() {
    return !1;
  }
  function I() {
    return Date.now();
  }
  function T() {
    return Math.round(Date.now() / 1e3);
  }
  function U() {
    return new Date(Date.now()).toISOString();
  }
  function q() {
    function y(F) {
      return typeof F < "u" && F;
    }
    try {
      return typeof globalThis < "u" || Object.defineProperty(Object.prototype, "globalThis", {
        get: function() {
          return delete Object.prototype.globalThis, this.globalThis = this;
        },
        configurable: !0
      }), globalThis;
    } catch {
      return y(self) || y(window) || y(this) || {};
    }
  }
  vn.exports.default = l, vn.exports.pino = l;
  function N() {
    const y = new Error().stack;
    if (!y) return null;
    const F = y.split(`
`);
    for (let k = 1; k < F.length; k++) {
      const D = F[k].trim();
      if (/(^at\s+)?(createWrap|LOG|set\s*\(|asObject|Object\.apply|Function\.apply)/.test(D) || D.indexOf("browser.js") !== -1 || D.indexOf("node:internal") !== -1 || D.indexOf("node_modules") !== -1) continue;
      let $ = D.match(/\((.*?):(\d+):(\d+)\)/);
      if ($ || ($ = D.match(/at\s+(.*?):(\d+):(\d+)/)), $) {
        const Q = $[1], K = $[2], Y = $[3];
        return Q + ":" + K + ":" + Y;
      }
    }
    return null;
  }
  return vn.exports;
}
sA();
const oA = {
  organizationId: j,
  accessToken: j,
  name: new L({
    required: !1,
    emptyAllowed: !1
  }),
  analytics: new z({
    options: {
      required: !1
    },
    values: {
      enabled: new re({
        required: !1
      }),
      originContext: new L({
        required: !1
      }),
      originLevel2: new L({
        required: !1
      }),
      originLevel3: new L({
        required: !1
      }),
      analyticsMode: new L({
        constrainTo: ["legacy", "next"],
        required: !1,
        default: "next"
      }),
      proxyBaseUrl: new L({
        required: !1,
        url: !0
      }),
      trackingId: new L({
        required: !1,
        emptyAllowed: !1,
        regex: /^[a-zA-Z0-9_\-.]{1,100}$/
      })
    }
  }),
  environment: new L({
    required: !1,
    default: "prod",
    constrainTo: ["prod", "hipaa", "stg", "dev"]
  })
};
new St({
  ...oA,
  analytics: new z({
    options: { required: !0 },
    values: {
      enabled: new re({ required: !1, default: !0 }),
      proxyBaseUrl: new L({ required: !1, url: !0 }),
      source: new z({
        options: { required: !1 },
        values: {
          "@coveo/atomic": be,
          "@coveo/quantic": be
        }
      }),
      trackingId: new L({
        required: !0,
        emptyAllowed: !1,
        regex: /^[a-zA-Z0-9_\-.]{1,100}$/
      })
    }
  }),
  context: new z({
    options: { required: !0 },
    values: Cl
  }),
  cart: new z({
    values: fm
  }),
  proxyBaseUrl: new L({ required: !1, url: !0 })
});
fe((e, t) => e.commerceFacetSet[t], (e) => e == null ? void 0 : e.request);
fe((e) => e.commerceSearch.facets, (e, t) => t in e.commerceFacetSet, (e, t) => t, (e, t, n) => {
  const r = e.find((i) => i.facetId === n);
  if (r && t)
    return r;
});
const sn = {
  facetId: le,
  field: j,
  tabs: new z({
    options: {
      required: !1
    },
    values: {
      included: new ce({ each: new L() }),
      excluded: new ce({ each: new L() })
    }
  }),
  activeTab: new L({ required: !1 }),
  delimitingCharacter: new L({ required: !1, emptyAllowed: !0 }),
  filterFacetCount: new re({ required: !1 }),
  injectionDepth: new W({ required: !1, min: 0 }),
  numberOfValues: new W({ required: !1, min: 1 }),
  sortCriteria: new Ae({ required: !1 }),
  basePath: new ce({ required: !1, each: j }),
  filterByBasePath: new re({ required: !1 })
}, aA = S("categoryFacet/register", (e) => O(e, sn)), cA = S("categoryFacet/toggleSelectValue", (e) => {
  try {
    return Be(e.facetId, j), Vo(e.selection), { payload: e, error: null };
  } catch (t) {
    return { payload: e, error: it(t) };
  }
}), uA = S("categoryFacet/deselectAll", (e) => O(e, sn.facetId));
S("categoryFacet/updateNumberOfValues", (e) => O(e, {
  facetId: sn.facetId,
  numberOfValues: sn.numberOfValues
}));
S("categoryFacet/updateSortCriterion", (e) => O(e, {
  facetId: sn.facetId,
  criterion: new Ae()
}));
S("categoryFacet/updateBasePath", (e) => O(e, {
  facetId: sn.facetId,
  basePath: new ce({ each: j })
}));
se(Fd(), (e) => {
  e.addCase(Kn, (t, n) => ({ ...t, ...n.payload })).addCase(Ve.fulfilled, (t) => {
    t.freezeFacetOrder = !1;
  }).addCase(Ve.rejected, (t) => {
    t.freezeFacetOrder = !1;
  }).addCase(ot.fulfilled, (t, n) => {
    var r;
    return ((r = n.payload) == null ? void 0 : r.facetOptions) ?? t;
  }).addCase(aA, (t, n) => {
    const { facetId: r, tabs: i } = n.payload;
    xr(i, t, r);
  }).addCase(Yd, (t, n) => {
    const { facetId: r, tabs: i } = n.payload;
    xr(i, t, r);
  }).addCase(cf, (t, n) => {
    const { facetId: r, tabs: i } = n.payload;
    xr(i, t, r);
  }).addCase(lf, (t, n) => {
    const { facetId: r, tabs: i } = n.payload;
    xr(i, t, r);
  }).addCase(YS, (t, n) => {
    t.facets[n.payload].enabled = !0;
  }).addCase(Ai, (t, n) => {
    t.facets[n.payload].enabled = !1;
  }).addCase(Ct, (t, n) => {
    [
      ...Object.keys(n.payload.f ?? {}),
      ...Object.keys(n.payload.fExcluded ?? {}),
      ...Object.keys(n.payload.cf ?? {}),
      ...Object.keys(n.payload.nf ?? {}),
      ...Object.keys(n.payload.df ?? {})
    ].forEach((r) => {
      r in t || (t.facets[r] = qd()), t.facets[r].enabled = !0;
    });
  });
});
function xr(e, t, n) {
  const r = {
    ...qd(),
    tabs: e ?? {}
  };
  t.facets[n] = r;
}
const Kf = S("rangeFacet/executeToggleSelect", (e) => O(e, af(e.selection))), Gf = S("rangeFacet/executeToggleExclude", (e) => O(e, af(e.selection))), Jf = {
  facetId: le,
  selection: new z({ values: It })
};
te("dateFacet/executeToggleSelect", (e, { dispatch: t, extra: { validatePayload: n } }) => {
  n(e, Jf), t(Fo(e)), t(Kf(e)), t(Kn());
});
te("dateFacet/executeToggleExclude", (e, { dispatch: t, extra: { validatePayload: n } }) => {
  n(e, Jf), t(Do(e)), t(Gf(e)), t(Kn());
});
function ps(e, t) {
  const n = t.payload ?? null;
  n && (e.response = gt().response, e.results = [], e.questionAnswer = Ns()), e.error = n, e.isLoading = !1;
}
function Js(e, t) {
  e.error = null, e.response = t.payload.response, e.queryExecuted = t.payload.queryExecuted, e.duration = t.payload.duration, e.isLoading = !1;
}
function lA(e, t) {
  Js(e, t), e.results = t.payload.response.results.map((n) => ({
    ...n,
    searchUid: t.payload.response.searchUid
  })), e.searchResponseId = t.payload.response.searchUid, e.questionAnswer = t.payload.response.questionAnswer, e.extendedResults = t.payload.response.extendedResults;
}
function mu(e, t) {
  e.isLoading = !0, e.searchAction = t.meta.arg.next, e.requestId = t.meta.requestId;
}
function dA(e, t) {
  e.isLoading = !0, e.searchAction = { actionCause: tn.browseResults }, e.requestId = t.meta.requestId;
}
se(gt(), (e) => {
  e.addCase(Ve.rejected, (t, n) => ps(t, n)), e.addCase(es.rejected, (t, n) => ps(t, n)), e.addCase(Pr.rejected, (t, n) => ps(t, n)), e.addCase(Ve.fulfilled, (t, n) => {
    lA(t, n);
  }), e.addCase(es.fulfilled, (t, n) => {
    Js(t, n), t.results = [
      ...t.results,
      ...n.payload.response.results.map((r) => ({
        ...r,
        searchUid: n.payload.response.searchUid
      }))
    ];
  }), e.addCase(Pr.fulfilled, (t, n) => {
    Js(t, n), t.results = [
      ...n.payload.response.results.map((r) => ({
        ...r,
        searchUid: n.payload.response.searchUid
      }))
    ];
  }), e.addCase(Ud.fulfilled, (t, n) => {
    t.response.facets = n.payload.response.facets, t.response.searchUid = n.payload.response.searchUid;
  }), e.addCase(Ve.pending, mu), e.addCase(es.pending, dA), e.addCase(Pr.pending, mu), e.addCase(ub, (t, n) => {
    t.searchAction = n.payload;
  }), e.addCase(er, (t, n) => {
    t.error = n.payload, t.isLoading = !1;
  });
});
const Zf = [
  "idle",
  "selected",
  "excluded"
], Xf = [
  "ascending",
  "descending"
], ep = [
  "even",
  "equiprobable"
], fA = {
  start: new L(),
  end: new L(),
  endInclusive: new re(),
  state: new L({ constrainTo: Zf })
};
new St({
  facetId: jd,
  field: Qd,
  tabs: new z({
    options: {
      required: !1
    },
    values: {
      included: new ce({ each: new L() }),
      excluded: new ce({ each: new L() })
    }
  }),
  generateAutomaticRanges: Hd,
  filterFacetCount: zd,
  injectionDepth: Bd,
  numberOfValues: Oo,
  currentValues: new ce({
    each: new z({ values: fA })
  }),
  sortCriteria: new L({ constrainTo: Xf }),
  rangeAlgorithm: new L({ constrainTo: ep })
});
const tp = {
  facetId: le,
  selection: new z({ values: Xn })
};
te("numericFacet/executeToggleSelect", (e, { dispatch: t, extra: { validatePayload: n } }) => {
  n(e, tp), t(Mo(e)), t(Kf(e)), t(Kn());
});
te("numericFacet/executeToggleExclude", (e, { dispatch: t, extra: { validatePayload: n } }) => {
  n(e, tp), t(Po(e)), t(Gf(e)), t(Kn());
});
const pA = [
  "allValues",
  "atLeastOneValue"
], hA = {
  start: new W(),
  end: new W(),
  endInclusive: new re(),
  state: new L({ constrainTo: Zf })
};
new St({
  facetId: jd,
  tabs: new z({
    options: {
      required: !1
    },
    values: {
      included: new ce({ each: new L() }),
      excluded: new ce({ each: new L() })
    }
  }),
  field: Qd,
  generateAutomaticRanges: Hd,
  filterFacetCount: zd,
  injectionDepth: Bd,
  numberOfValues: Oo,
  currentValues: new ce({
    each: new z({ values: hA })
  }),
  sortCriteria: new L({ constrainTo: Xf }),
  resultsMustMatch: new L({ constrainTo: pA }),
  rangeAlgorithm: new L({ constrainTo: ep })
});
const Zo = {
  id: j
}, np = {
  ...Zo,
  query: Ue
}, gA = S("commerce/instantProducts/clearExpired", (e) => O(e, Zo)), mA = {
  child: new z({
    options: { required: !0 },
    values: {
      permanentid: new L({ required: !0 })
    }
  }),
  ...np
}, yA = S("commerce/instantProducts/promoteChildToParent", (e) => O(e, mA)), vA = S("commerce/instantProducts/register", (e) => O(e, Zo)), SA = S("commerce/instantProducts/updateQuery", (e) => O(e, np));
function wA(e) {
  return e ? e.expiresAt && Date.now() >= e.expiresAt : !1;
}
const bA = (e, t) => {
  const { id: n } = e;
  if (!t[n])
    return t[n] = { q: "", cache: {} }, t;
}, CA = (e, t) => {
  const { q: n, id: r } = e;
  n && (t[r].q = n);
}, IA = (e, t) => {
  const { id: n } = e;
  Object.entries(t[n].cache).forEach(([r, i]) => {
    wA(i) && delete t[n].cache[r];
  });
}, AA = (e, t, n) => {
  for (const i in t)
    for (const s in t[i].cache)
      t[i].cache[s].isActive = !1;
  if (!Zs(e, t)) {
    kA(e, t, n);
    return;
  }
  const r = Zs(e, t);
  r.isLoading = !0, r.isActive = !0, r.error = null;
}, xA = (e, t, n) => {
  const { id: r, q: i, searchUid: s, cacheTimeout: o, totalCountFiltered: a, duration: c } = e;
  t[r].cache[i] = {
    ...Zs(e, t),
    ...n,
    isActive: !0,
    searchUid: s,
    isLoading: !1,
    error: null,
    expiresAt: o ? o + Date.now() : 0,
    totalCountFiltered: a,
    duration: c
  };
}, EA = (e, t) => {
  const { id: n, q: r, error: i } = e;
  t[n].cache[r].error = i || null, t[n].cache[r].isLoading = !1, t[n].cache[r].isActive = !1;
}, Zs = (e, t) => {
  const { q: n, id: r } = e;
  return t[r].cache[n] || null;
}, kA = (e, t, n) => {
  const { q: r, id: i } = e;
  t[i].cache[r] = {
    isLoading: !0,
    error: null,
    expiresAt: 0,
    isActive: !0,
    searchUid: "",
    totalCountFiltered: 0,
    duration: 0,
    ...n
  };
};
function RA() {
  return {};
}
se(RA(), (e) => {
  e.addCase(vA, (t, n) => {
    bA(n.payload, t);
  }).addCase(SA, (t, n) => {
    CA({ ...n.payload, q: n.payload.query }, t);
  }).addCase(gA, (t, n) => {
    IA(n.payload, t);
  }).addCase(zi.pending, (t, n) => {
    AA(n.meta.arg, t, { products: [] });
  }).addCase(zi.fulfilled, (t, n) => {
    const { response: { products: r, responseId: i, pagination: { totalEntries: s } } } = n.payload;
    xA({
      duration: 0,
      searchUid: i,
      totalCountFiltered: s,
      ...n.meta.arg
    }, t, {
      products: r.map((o, a) => OA(o, a + 1, i))
    });
  }).addCase(zi.rejected, (t, n) => {
    EA(n.meta.arg, t);
  }).addCase(yA, (t, n) => {
    const r = t[n.payload.id].cache[n.payload.query];
    if (!r)
      return;
    const i = r.products;
    let s;
    const o = i.findIndex((m) => (s = m.children.find((p) => p.permanentid === n.payload.child.permanentid), !!s));
    if (o === -1 || s === void 0)
      return;
    const a = i[o].responseId, c = i[o].position, { children: u, totalNumberOfChildren: l } = i[o], f = {
      ...s,
      resultType: Me.PRODUCT,
      children: u,
      totalNumberOfChildren: l,
      position: c,
      responseId: a
    }, h = [...i];
    h.splice(o, 1, f), r.products = h;
  });
});
function OA(e, t, n) {
  const r = e.children.some((a) => a.permanentid === e.permanentid);
  if (e.children.length === 0 || r)
    return { ...e, position: t, responseId: n };
  const { children: i, totalNumberOfChildren: s, ...o } = e;
  return {
    ...e,
    children: [o, ...i],
    position: t,
    responseId: n
  };
}
te("commerce/product/view", async (e, { extra: t, getState: n }) => {
  const { relay: r } = t, s = { currency: pi(n().commerceContext), product: e };
  r.emit("ec.productView", s);
});
te("commerce/product/click", async (e, { extra: t, getState: n }) => {
  const { relay: r } = t, s = { currency: pi(n().commerceContext), ...e };
  r.emit("ec.productClick", s);
});
const qA = {
  placementIds: new ce({
    required: !1,
    min: 1,
    each: j
  }),
  productId: be
}, FA = S("commerce/productEnrichment/registerOptions"), DA = (e, t, n) => {
  const r = Yn(t, n);
  return {
    ...r,
    context: {
      ...r.context,
      ...e.productId ? { product: { productId: e.productId } } : {}
    },
    placementIds: e.placementIds
  };
}, hs = te("commerce/productEnrichment/fetchBadges", async (e, { getState: t, rejectWithValue: n, extra: { apiClient: r, navigatorContext: i } }) => {
  O(e, qA);
  const s = DA(e, t(), i), o = await r.getBadges(s);
  return "error" in o ? n(o.error) : {
    response: o.success
  };
});
function TA() {
  return {
    products: [],
    isLoading: !1,
    error: null,
    productId: void 0,
    placementIds: []
  };
}
se(TA(), (e) => {
  e.addCase(FA, (t, n) => {
    t.productId = n.payload.productId, t.placementIds = n.payload.placementIds ?? [];
  }).addCase(hs.pending, (t) => {
    t.isLoading = !0, t.error = null;
  }).addCase(hs.fulfilled, (t, n) => {
    MA(t), t.products = n.payload.response.products;
  }).addCase(hs.rejected, (t, n) => {
    _A(t, n.payload);
  });
});
function _A(e, t) {
  e.error = t || null, e.isLoading = !1, e.products = [];
}
function MA(e) {
  e.error = null, e.isLoading = !1;
}
te("commerce/spotlight-content/click", async (e, { extra: t }) => {
  const { relay: n } = t, r = {
    responseId: e.responseId,
    position: e.position,
    itemMetadata: {
      uniqueFieldName: "id",
      uniqueFieldValue: e.id,
      url: e.desktopImage
    }
  };
  n.emit("itemClick", r);
});
function yu() {
  return {};
}
se(yu(), (e) => {
  e.addCase(kl, (t, n) => PA(t, n.payload)).addCase(Rl, (t, n) => VA(t, n.payload)).addCase(lo, (t, n) => UA(t, n.payload)).addCase(El, (t, n) => $A(t, n.payload)).addCase(Ho, (t, n) => NA(t, n.payload)).addCase(vi, (t, n) => LA(t, n.payload)).addCase(gi, (t) => vu(t)).addCase(uo, (t) => vu(t)).addCase(mi, (t, n) => jA(t, n.payload)).addCase(Uo, (t, n) => QA(t, n.payload)).addCase(po, (t, n) => zA(t, n)).addCase(zo, (t, n) => BA(t, n.payload)).addCase(Qo, (t, n) => YA(t, n.payload)).addCase(Ci, (t, n) => HA(t, n)).addCase(Ii, (t, n) => WA(t, n)).addCase(Ri, (t, n) => KA(t, n.payload)).addCase(Oi, (t, n) => GA(t, n.payload)).addCase(jo, (t, n) => JA(t, n.payload)).addCase($o, (t, n) => ZA(t, n.payload)).addCase(No, (t, n) => XA(t, n.payload)).addCase(Lo, (t, n) => e0(t, n.payload)).addCase(st, yu).addCase(cn, (t, n) => (t = n.payload, t)).addCase(wt, (t, n) => (t = n.payload, t));
});
const PA = (e, t) => {
  if ((t == null ? void 0 : t.slotId) === void 0) {
    if (e.page !== void 0) {
      e.page++;
      return;
    }
    e.page = 1;
  }
}, VA = (e, t) => {
  if ((t == null ? void 0 : t.slotId) === void 0) {
    if (e.page !== void 0 && e.page > 1) {
      e.page--;
      return;
    }
    e.page = void 0;
  }
}, UA = (e, t) => {
  (t == null ? void 0 : t.slotId) === void 0 && (e.page = t.page > 0 ? t.page : void 0);
}, $A = (e, t) => {
  if ((t == null ? void 0 : t.slotId) === void 0) {
    if (e.page = void 0, t.pageSize === 0) {
      e.perPage = void 0;
      return;
    }
    e.perPage = t.pageSize;
  }
}, NA = (e, t) => {
  e.page = void 0, e.sortCriteria = t;
}, LA = (e, t) => {
  e.page = void 0;
  const { query: n } = t;
  if (n === void 0 || n.trim() === "") {
    e.q = void 0;
    return;
  }
  e.q = n;
}, vu = (e) => {
  e.page = void 0, e.cf = void 0, e.df = void 0, e.dfExcluded = void 0, e.lf = void 0, e.mnf = void 0, e.mnfExcluded = void 0, e.nf = void 0, e.nfExcluded = void 0, e.f = void 0, e.fExcluded = void 0;
}, jA = (e, t) => {
  const { facetId: n } = t;
  e.page = void 0, e.cf && (delete e.cf[n], Object.keys(e.cf).length === 0 && delete e.cf), e.df && (delete e.df[n], Object.keys(e.df).length === 0 && delete e.df), e.dfExcluded && (delete e.dfExcluded[n], Object.keys(e.dfExcluded).length === 0 && delete e.dfExcluded), e.lf && (delete e.lf[n], Object.keys(e.lf).length === 0 && delete e.lf), e.mnf && (delete e.mnf[n], Object.keys(e.mnf).length === 0 && delete e.mnf), e.mnfExcluded && (delete e.mnfExcluded[n], Object.keys(e.mnfExcluded).length === 0 && delete e.mnfExcluded), e.nf && (delete e.nf[n], Object.keys(e.nf).length === 0 && delete e.nf), e.nfExcluded && (delete e.nfExcluded[n], Object.keys(e.nfExcluded).length === 0 && delete e.nfExcluded), e.f && (delete e.f[n], Object.keys(e.f).length === 0 && delete e.f), e.fExcluded && (delete e.fExcluded[n], Object.keys(e.fExcluded).length === 0 && delete e.fExcluded);
}, QA = (e, t) => {
  if (e.page = void 0, t.selection.state === "selected") {
    e.cf ?? (e.cf = {}), delete e.cf[t.facetId], Object.keys(e.cf).length === 0 && (e.cf = void 0);
    return;
  }
  e.cf ?? (e.cf = {}), e.cf[t.facetId] = t.selection.path;
}, zA = (e, t) => {
  const n = t.payload;
  e.page = void 0, e.cf ?? (e.cf = {}), e.cf[n.facetId] = [...n.value.path, n.value.rawValue];
}, BA = (e, t) => {
  switch (e.page = void 0, Vt(e, "fExcluded", e.fExcluded, t.facetId, t.selection.value), t.selection.state) {
    case "selected":
      Vt(e, "f", e.f, t.facetId, t.selection.value);
      break;
    case "excluded":
    case "idle":
      e.f ?? (e.f = {}), e.f[t.facetId] = [
        ...e.f[t.facetId] ?? [],
        t.selection.value
      ];
      break;
  }
}, HA = (e, t) => {
  const n = t.payload;
  e.page = void 0, Vt(e, "fExcluded", e.fExcluded, n.facetId, n.value.rawValue), e.f ?? (e.f = {}), e.f[n.facetId] = [
    ...e.f[n.facetId] ?? [],
    n.value.rawValue
  ];
}, YA = (e, t) => {
  switch (e.page = void 0, Vt(e, "f", e.f, t.facetId, t.selection.value), t.selection.state) {
    case "excluded":
      Vt(e, "fExcluded", e.fExcluded, t.facetId, t.selection.value);
      break;
    case "selected":
    case "idle":
      e.fExcluded ?? (e.fExcluded = {}), e.fExcluded[t.facetId] = [
        ...e.fExcluded[t.facetId] ?? [],
        t.selection.value
      ];
      break;
  }
}, WA = (e, t) => {
  const n = t.payload;
  e.page = void 0, Vt(e, "f", e.f, n.facetId, n.value.rawValue), e.fExcluded ?? (e.fExcluded = {}), e.fExcluded[n.facetId] = [
    ...e.fExcluded[n.facetId] ?? [],
    n.value.rawValue
  ];
}, KA = (e, t) => {
  switch (e.page = void 0, we(e, "mnf", e.mnf, t.facetId, t.selection), we(e, "mnfExcluded", e.mnfExcluded, t.facetId, t.selection), we(e, "nfExcluded", e.nfExcluded, t.facetId, t.selection), t.selection.state) {
    case "selected":
      we(e, "nf", e.nf, t.facetId, t.selection);
      break;
    case "excluded":
    case "idle":
      e.nf ?? (e.nf = {}), e.nf[t.facetId] = [
        ...e.nf[t.facetId] ?? [],
        t.selection
      ];
      break;
  }
}, GA = (e, t) => {
  switch (e.page = void 0, we(e, "mnf", e.mnf, t.facetId, t.selection), we(e, "mnfExcluded", e.mnfExcluded, t.facetId, t.selection), we(e, "nf", e.nf, t.facetId, t.selection), t.selection.state) {
    case "excluded":
      we(e, "nfExcluded", e.nfExcluded, t.facetId, t.selection);
      break;
    case "selected":
    case "idle":
      e.nfExcluded ?? (e.nfExcluded = {}), e.nfExcluded[t.facetId] = [
        ...e.nfExcluded[t.facetId] ?? [],
        t.selection
      ];
      break;
  }
}, JA = (e, t) => {
  e.page = void 0, we(e, "nf", e.nf, t.facetId, t), we(e, "nfExcluded", e.nfExcluded, t.facetId, t);
  const { facetId: n, ...r } = t;
  switch (t.state) {
    case "idle":
      we(e, "mnf", e.mnf, t.facetId, t), we(e, "mnfExcluded", e.mnfExcluded, t.facetId, t);
      break;
    case "excluded":
      we(e, "mnf", e.mnf, t.facetId, t), e.mnfExcluded ?? (e.mnfExcluded = {}), e.mnfExcluded[t.facetId] = [r];
      break;
    case "selected":
      we(e, "mnfExcluded", e.mnfExcluded, t.facetId, t), e.mnf ?? (e.mnf = {}), e.mnf[t.facetId] = [r];
      break;
  }
}, ZA = (e, t) => {
  e.page = void 0, we(e, "dfExcluded", e.dfExcluded, t.facetId, t.selection);
  const { numberOfResults: n, ...r } = t.selection;
  switch (t.selection.state) {
    case "selected":
      we(e, "df", e.df, t.facetId, t.selection);
      break;
    case "excluded":
    case "idle":
      e.df ?? (e.df = {}), e.df[t.facetId] = [
        ...e.df[t.facetId] ?? [],
        r
      ];
      break;
  }
}, XA = (e, t) => {
  e.page = void 0, we(e, "df", e.df, t.facetId, t.selection);
  const { numberOfResults: n, ...r } = t.selection;
  switch (t.selection.state) {
    case "excluded":
      we(e, "dfExcluded", e.dfExcluded, t.facetId, t.selection);
      break;
    case "selected":
    case "idle":
      e.dfExcluded ?? (e.dfExcluded = {}), e.dfExcluded[t.facetId] = [
        ...e.dfExcluded[t.facetId] ?? [],
        r
      ];
      break;
  }
}, e0 = (e, t) => {
  switch (e.page = void 0, t.selection.state) {
    case "selected":
      Vt(e, "lf", e.lf, t.facetId, t.selection.value);
      break;
    case "excluded":
    case "idle":
      e.lf ?? (e.lf = {}), e.lf[t.facetId] = [
        ...e.lf[t.facetId] ?? [],
        t.selection.value
      ];
      break;
  }
}, Vt = (e, t, n, r, i) => {
  n !== void 0 && n[r] !== void 0 && (n[r] = n[r].filter((s) => s !== i), n[r].length === 0 && delete n[r], Object.keys(n).length === 0 && (e[t] = void 0));
}, we = (e, t, n, r, i) => {
  if (n !== void 0 && n[r] !== void 0) {
    const s = n[r].filter((o) => o.start !== i.start || o.end !== i.end || o.endInclusive !== i.endInclusive);
    n[r] = s, n[r].length === 0 && delete n[r], Object.keys(n).length === 0 && (e[t] = void 0);
  }
}, t0 = new W({
  min: Uv,
  default: Jl,
  required: !1
}), n0 = new W({
  min: Pv,
  max: Vv,
  default: Gl,
  required: !1
}), r0 = {
  desiredCount: n0,
  numberOfValues: t0
};
S("automaticFacet/setOptions", (e) => O(e, r0));
S("automaticFacet/deselectAll", (e) => O(e, le));
const i0 = j, s0 = S("automaticFacet/toggleSelectValue", (e) => O(e, {
  field: i0,
  selection: new z({ values: fn })
}));
se(xo(), (e) => {
  e.addCase(Qw, (t, n) => {
    const r = gs(t), i = n.payload;
    t.defaultNumberOfResults = t.numberOfResults = i, t.firstResult = Sn(r, i);
  }).addCase(zw, (t, n) => {
    t.numberOfResults = n.payload, t.firstResult = 0;
  }).addCase(Zn, (t) => {
    t.firstResult = 0;
  }).addCase(Bw, (t, n) => {
    const r = n.payload;
    t.firstResult = Sn(r, t.numberOfResults);
  }).addCase(Rd, (t, n) => {
    const r = n.payload;
    t.firstResult = Sn(r, t.numberOfResults);
  }).addCase(Yw, (t) => {
    const n = gs(t), r = Math.max(n - 1, Wm);
    t.firstResult = Sn(r, t.numberOfResults);
  }).addCase(Hw, (t) => {
    const n = gs(t), r = o0(t), i = Math.min(n + 1, r);
    t.firstResult = Sn(i, t.numberOfResults);
  }).addCase(ot.fulfilled, (t, n) => {
    n.payload && (t.numberOfResults = n.payload.pagination.numberOfResults, t.firstResult = n.payload.pagination.firstResult);
  }).addCase(Ct, (t, n) => {
    t.firstResult = n.payload.firstResult ?? t.firstResult, t.numberOfResults = n.payload.numberOfResults ?? t.defaultNumberOfResults;
  }).addCase(Ve.fulfilled, (t, n) => {
    const { response: r } = n.payload;
    t.totalCountFiltered = r.totalCountFiltered;
  }).addCase(Pr.fulfilled, (t, n) => {
    const { response: r } = n.payload;
    t.totalCountFiltered = r.totalCountFiltered;
  }).addCase(ki, (t) => {
    Ee(t);
  }).addCase(Do, (t) => {
    Ee(t);
  }).addCase(Kd, (t) => {
    Ee(t);
  }).addCase(Po, (t) => {
    Ee(t);
  }).addCase(Ii, (t) => {
    Ee(t);
  }).addCase(Wd, (t) => {
    Ee(t);
  }).addCase(uA, (t) => {
    Ee(t);
  }).addCase(cA, (t) => {
    Ee(t);
  }).addCase(po, (t) => {
    Ee(t);
  }).addCase(Fo, (t) => {
    Ee(t);
  }).addCase(Mo, (t) => {
    Ee(t);
  }).addCase(Wn, (t) => {
    Ee(t);
  }).addCase(uf, (t) => {
    Ee(t);
  }).addCase(df, (t) => {
    Ee(t);
  }).addCase(Ci, (t) => {
    Ee(t);
  }).addCase(s0, (t) => {
    Ee(t);
  });
});
function Ee(e) {
  e.firstResult = xo().firstResult;
}
function gs(e) {
  const { firstResult: t, numberOfResults: n } = e;
  return a0(t, n);
}
function o0(e) {
  const { totalCountFiltered: t, numberOfResults: n } = e;
  return c0(t, n);
}
function Sn(e, t) {
  return (e - 1) * t;
}
function a0(e, t) {
  return Math.round(e / t) + 1;
}
function c0(e, t) {
  const n = Math.min(e, Mn);
  return Math.ceil(n / t);
}
new St({
  parameters: new z({
    options: { required: !0 },
    values: Ld
  })
});
new St({
  fragment: new L()
});
fe((e) => e.productListing.facets, (e, t) => t in e.commerceFacetSet, (e, t) => t, (e, t, n) => {
  const r = e.find((i) => i.facetId === n);
  if (r && t)
    return r;
});
const rp = {
  queries: new ce({
    required: !0,
    each: new L({ emptyAllowed: !1 })
  }),
  maxLength: new W({ required: !0, min: 1, default: 10 })
}, u0 = S("recentQueries/registerRecentQueries", (e) => O(e, rp)), l0 = S("recentQueries/clearRecentQueries"), d0 = S("commerce/recentQueries/clear"), f0 = S("commerce/recentQueries/register", (e) => O(e, rp));
function ip() {
  return {
    queries: [],
    maxLength: 10
  };
}
se(ip(), (e) => {
  e.addCase(u0, sp).addCase(l0, op).addCase(Ve.fulfilled, (t, n) => {
    const r = n.payload.queryExecuted, i = n.payload.response.results;
    !r.length || !i.length || ap(r, t);
  });
});
function sp(e, t) {
  e.queries = Array.from(new Set(t.payload.queries.map((n) => n.trim().toLowerCase()))).slice(0, t.payload.maxLength), e.maxLength = t.payload.maxLength;
}
function op(e) {
  e.queries = [];
}
function ap(e, t) {
  const n = e.trim().toLowerCase();
  if (n === "")
    return;
  const r = Array.from(new Set(t.queries.filter((i) => i.trim().toLowerCase() !== n))).slice(0, t.maxLength - 1);
  t.queries = [n, ...r];
}
se(ip(), (e) => {
  e.addCase(f0, sp).addCase(d0, op).addCase(Re.fulfilled, (t, n) => {
    const r = n.payload.queryExecuted, i = n.payload.response.products;
    !r.length || !i.length || ap(r, t);
  });
});
const _i = {
  id: j,
  query: Ue
}, p0 = S("querySet/register", (e) => O(e, _i)), h0 = S("querySet/update", (e) => O(e, _i)), g0 = S("commerce/querySet/register", (e) => O(e, _i)), m0 = S("commerce/querySet/update", (e) => O(e, _i));
se(Eo(), (e) => {
  e.addCase(g0, (t, n) => v0(t, n.payload)).addCase(m0, (t, n) => {
    const { id: r, query: i } = n.payload;
    Su(t, r, i);
  }).addCase(yd, (t, n) => {
    const { id: r, expression: i } = n.payload;
    Su(t, r, i);
  }).addCase(Re.fulfilled, (t, n) => {
    const { queryExecuted: r } = n.payload;
    cp(t, r);
  }).addCase(wt, y0);
});
function y0(e, t) {
  Z(t.payload.q) || cp(e, t.payload.q);
}
function cp(e, t) {
  Object.keys(e).forEach((n) => {
    e[n] = t;
  });
}
const Su = (e, t, n) => {
  t in e && (e[t] = n);
}, v0 = (e, t) => {
  const { id: n, query: r } = t;
  n in e || (e[n] = r);
};
function up(e, t) {
  const n = t.id;
  n in e || (e[n] = S0(t));
}
function lp(e, t) {
  const n = e[t.meta.arg.id];
  n && (n.currentRequestId = t.meta.requestId, n.isLoading = !0);
}
function dp(e, t) {
  const n = e[t.meta.arg.id];
  n && (n.error = t.payload || null, n.isLoading = !1);
}
function fp(e, t) {
  const n = e[t.id];
  n && (n.responseId = "", n.completions = [], n.partialQueries = []);
}
function S0(e) {
  return {
    id: "",
    completions: [],
    responseId: "",
    count: 5,
    currentRequestId: "",
    error: null,
    partialQueries: [],
    isLoading: !1,
    ...e
  };
}
const pp = () => ({});
se(pp(), (e) => e.addCase(VS, (t, n) => {
  up(t, n.payload);
}).addCase(Ot.pending, lp).addCase(Ot.fulfilled, (t, n) => {
  const r = t[n.meta.arg.id];
  if (!r || n.meta.requestId !== r.currentRequestId)
    return;
  const { query: i } = n.payload;
  i && r.partialQueries.push(i.replace(/;/, encodeURIComponent(";"))), r.responseId = n.payload.responseId, r.completions = n.payload.completions.map((s) => ({
    expression: s.expression,
    highlighted: s.highlighted,
    score: 0,
    executableConfidence: 0
  })), r.isLoading = !1, r.error = null;
}).addCase(Ot.rejected, dp).addCase(PS, (t, n) => {
  fp(t, n.payload);
}));
const rr = {
  id: j
}, w0 = S("querySuggest/register", (e) => O(e, {
  ...rr,
  count: new W({ min: 0 })
})), b0 = S("querySuggest/unregister", (e) => O(e, rr)), hp = S("querySuggest/selectSuggestion", (e) => O(e, {
  ...rr,
  expression: Ue
})), C0 = S("querySuggest/clear", (e) => O(e, rr)), ms = te("querySuggest/fetch", async (e, { getState: t, rejectWithValue: n, extra: { apiClient: r, validatePayload: i, navigatorContext: s } }) => {
  i(e, rr);
  const o = e.id, a = await I0(o, t(), s), c = await r.querySuggest(a);
  return mt(c) ? n(c.error) : {
    id: o,
    q: a.q,
    ...c.success
  };
}), I0 = async (e, t, n) => ({
  accessToken: t.configuration.accessToken,
  organizationId: t.configuration.organizationId,
  url: t.configuration.search.apiBaseUrl ?? an(t.configuration.organizationId, t.configuration.environment),
  count: t.querySuggest[e].count,
  q: t.querySet[e],
  locale: t.configuration.search.locale,
  timezone: t.configuration.search.timezone,
  actionsHistory: t.configuration.analytics.enabled ? ln.getInstance().getHistory() : [],
  ...t.context && { context: t.context.contextValues },
  ...t.pipeline && { pipeline: t.pipeline },
  ...t.searchHub && { searchHub: t.searchHub },
  tab: t.configuration.analytics.originLevel2,
  ...t.configuration.analytics.enabled && {
    ...t.configuration.analytics.enabled && t.configuration.analytics.analyticsMode === "legacy" ? await wo(t.configuration.analytics) : wi(t.configuration.analytics, n)
  },
  ...t.configuration.search.authenticationProviders.length && {
    authentication: t.configuration.search.authenticationProviders.join(",")
  }
});
se(dn(), (e) => e.addCase(Ei, (t, n) => ({ ...t, ...n.payload })).addCase(Ao, (t, n) => {
  t.q = n.payload;
}).addCase(hp, (t, n) => {
  t.q = n.payload.expression;
}).addCase(ot.fulfilled, (t, n) => {
  var r;
  return ((r = n.payload) == null ? void 0 : r.query) ?? t;
}).addCase(Ct, (t, n) => {
  t.q = n.payload.q ?? t.q, t.enableQuerySyntax = n.payload.enableQuerySyntax ?? t.enableQuerySyntax;
}));
se(Eo(), (e) => {
  e.addCase(p0, (t, n) => x0(t, n.payload)).addCase(h0, (t, n) => {
    const { id: r, query: i } = n.payload;
    ys(t, r, i);
  }).addCase(hp, (t, n) => {
    const { id: r, expression: i } = n.payload;
    ys(t, r, i);
  }).addCase(Ve.fulfilled, (t, n) => {
    const { queryExecuted: r } = n.payload;
    gp(t, r);
  }).addCase(Ct, A0).addCase(ot.fulfilled, (t, n) => {
    if (n.payload)
      for (const [r, i] of Object.entries(n.payload.querySet))
        ys(t, r, i);
  });
});
function A0(e, t) {
  Z(t.payload.q) || gp(e, t.payload.q);
}
function gp(e, t) {
  Object.keys(e).forEach((n) => {
    e[n] = t;
  });
}
const ys = (e, t, n) => {
  t in e && (e[t] = n);
}, x0 = (e, t) => {
  const { id: n, query: r } = t;
  n in e || (e[n] = r);
};
se(pp(), (e) => e.addCase(w0, (t, n) => {
  up(t, n.payload);
}).addCase(b0, (t, n) => {
  delete t[n.payload.id];
}).addCase(ms.pending, lp).addCase(ms.fulfilled, (t, n) => {
  const r = t[n.meta.arg.id];
  if (!r || n.meta.requestId !== r.currentRequestId)
    return;
  const { q: i } = n.payload;
  i && r.partialQueries.push(i.replace(/;/, encodeURIComponent(";"))), r.responseId = n.payload.responseId, r.completions = n.payload.completions, r.isLoading = !1, r.error = null;
}).addCase(ms.rejected, dp).addCase(C0, (t, n) => {
  fp(t, n.payload);
}).addCase(er, (t, n) => {
  Object.keys(t).forEach((r) => {
    const i = t[r];
    i && (i.error = n.payload, i.isLoading = !1);
  });
}));
const vs = {
  open: new L(),
  close: new L()
}, E0 = {
  id: j,
  highlightOptions: new z({
    values: {
      notMatchDelimiters: new z({
        values: vs
      }),
      exactMatchDelimiters: new z({
        values: vs
      }),
      correctionDelimiters: new z({
        values: vs
      })
    }
  }),
  clearFilters: new re()
}, { id: k0, highlightOptions: R0, clearFilters: O0 } = E0, q0 = {
  id: k0,
  highlightOptions: R0,
  clearFilters: O0,
  enableResults: new re()
}, F0 = (e, t) => {
  const n = Yn(e, t);
  return {
    ...n,
    context: {
      ...n.context,
      capture: !1
    },
    query: e.commerceQuery.query
  };
}, Ss = te("commerce/standaloneSearchBox/fetchRedirect", async (e, { getState: t, rejectWithValue: n, extra: { apiClient: r, navigatorContext: i } }) => {
  O(e, { id: new L({ emptyAllowed: !1 }) });
  const s = t(), o = F0(s, i), a = await r.plan(o);
  return Qe(a) ? n(a.error) : a.success.redirect || "";
}), D0 = S("commerce/standaloneSearchBox/register", (e) => O(e, {
  id: j,
  redirectionUrl: j,
  overwrite: new re({ required: !1 })
})), T0 = S("commerce/standaloneSearchBox/updateRedirectionUrl", (e) => O(e, {
  id: j,
  redirectionUrl: j
})), _0 = S("commerce/standaloneSearchBox/reset", (e) => O(e, {
  id: j
}));
function M0() {
  return {};
}
se(M0(), (e) => e.addCase(D0, (t, n) => {
  const { id: r, redirectionUrl: i, overwrite: s } = n.payload;
  !s && r in t || (t[r] = wu(i));
}).addCase(T0, (t, n) => {
  const { id: r, redirectionUrl: i } = n.payload, s = t[r];
  s && (s.defaultRedirectionUrl = i);
}).addCase(_0, (t, n) => {
  const { id: r } = n.payload, i = t[r];
  if (i) {
    t[r] = wu(i.defaultRedirectionUrl);
    return;
  }
}).addCase(Ss.pending, (t, n) => {
  const r = t[n.meta.arg.id];
  r && (r.isLoading = !0);
}).addCase(Ss.fulfilled, (t, n) => {
  const r = n.payload, i = t[n.meta.arg.id];
  i && (i.redirectTo = r || i.defaultRedirectionUrl, i.isLoading = !1);
}).addCase(Ss.rejected, (t, n) => {
  const r = t[n.meta.arg.id];
  r && (r.isLoading = !1);
}));
function wu(e) {
  return {
    defaultRedirectionUrl: e,
    redirectTo: "",
    isLoading: !1
  };
}
new St({
  ...q0,
  redirectionUrl: new L({
    required: !0,
    emptyAllowed: !1
  }),
  overwrite: new re({
    required: !1
  })
});
const Mi = (e, t) => {
  const n = e;
  return Z(n[t]) ? Z(e.additionalFields[t]) ? null : e.additionalFields[t] : n[t];
}, P0 = (e) => (t) => e.every((n) => !Z(Mi(t, n))), V0 = (e) => (t) => e.every((n) => Z(Mi(t, n))), U0 = (e, t) => (n) => {
  const r = mp(e, n);
  return t.some((i) => r.some((s) => `${s}`.toLowerCase() === i.toLowerCase()));
}, $0 = (e, t) => (n) => {
  const r = mp(e, n);
  return t.every((i) => r.every((s) => `${s}`.toLowerCase() !== i.toLowerCase()));
}, mp = (e, t) => {
  const n = Mi(t, e);
  return Uu(n) ? n : [n];
}, yp = {
  getProductProperty: Mi,
  fieldsMustBeDefined: P0,
  fieldsMustNotBeDefined: V0,
  fieldMustMatch: U0,
  fieldMustNotMatch: $0
};
function N0(e) {
  return e.type === "redirect";
}
class L0 {
  constructor(t) {
    ee(this, "response");
    this.response = t;
  }
  /**
   * Gets the final value of the basic expression (`q`) after the search request has been processed in the query pipeline, but before it is sent to the index.
   */
  get basicExpression() {
    return this.response.parsedInput.basicExpression;
  }
  /**
   * Gets the final value of the large expression (`lq`) after the search request has been processed in the query pipeline, but before it is sent to the index.
   */
  get largeExpression() {
    return this.response.parsedInput.largeExpression;
  }
  /**
   * Gets the URL to redirect the browser to, if the search request satisfies the condition of a `redirect` trigger rule in the query pipeline.
   *
   * Returns `null` otherwise.
   */
  get redirectionUrl() {
    const t = this.response.preprocessingOutput.triggers.filter(N0);
    return t.length ? t[0].content : null;
  }
}
const j0 = S("standaloneSearchBox/register", (e) => O(e, {
  id: j,
  redirectionUrl: j,
  overwrite: new re({ required: !1 })
})), Q0 = S("standaloneSearchBox/updateRedirectionUrl", (e) => O(e, {
  id: j,
  redirectionUrl: j
})), z0 = S("standaloneSearchBox/reset", (e) => O(e, {
  id: j
})), B0 = S("standaloneSearchBox/updateAnalyticsToSearchFromLink", (e) => O(e, { id: j })), H0 = S("standaloneSearchBox/updateAnalyticsToOmniboxFromLink"), ws = te("standaloneSearchBox/fetchRedirect", async (e, { dispatch: t, getState: n, rejectWithValue: r, extra: { apiClient: i, validatePayload: s, navigatorContext: o } }) => {
  s(e, { id: new L({ emptyAllowed: !1 }) });
  const a = await W0(n(), o), c = await i.plan(a);
  if (mt(c))
    return r(c.error);
  const { redirectionUrl: u } = new L0(c.success);
  return u && t(Y0(u)), u || "";
}), Y0 = (e) => bt("analytics/standaloneSearchBox/redirect", (t) => t.makeTriggerRedirect({ redirectedTo: e })), W0 = async (e, t) => ({
  accessToken: e.configuration.accessToken,
  organizationId: e.configuration.organizationId,
  url: e.configuration.search.apiBaseUrl ?? an(e.configuration.organizationId, e.configuration.environment),
  locale: e.configuration.search.locale,
  timezone: e.configuration.search.timezone,
  q: e.query.q,
  ...e.context && { context: e.context.contextValues },
  ...e.pipeline && { pipeline: e.pipeline },
  ...e.searchHub && { searchHub: e.searchHub },
  ...e.query.enableQuerySyntax !== void 0 && {
    enableQuerySyntax: e.query.enableQuerySyntax
  },
  ...e.configuration.analytics.enabled && e.configuration.analytics.analyticsMode === "legacy" ? await wo(e.configuration.analytics) : wi(e.configuration.analytics, t),
  ...e.configuration.search.authenticationProviders.length && {
    authentication: e.configuration.search.authenticationProviders.join(",")
  }
});
function K0() {
  return {};
}
se(K0(), (e) => e.addCase(j0, (t, n) => {
  const { id: r, redirectionUrl: i, overwrite: s } = n.payload;
  !s && r in t || (t[r] = bs(i));
}).addCase(z0, (t, n) => {
  const { id: r } = n.payload, i = t[r];
  if (i) {
    t[r] = bs(i.defaultRedirectionUrl);
    return;
  }
}).addCase(Q0, (t, n) => {
  const { id: r, redirectionUrl: i } = n.payload;
  r in t && (t[r] = bs(i));
}).addCase(ws.pending, (t, n) => {
  const r = t[n.meta.arg.id];
  r && (r.isLoading = !0);
}).addCase(ws.fulfilled, (t, n) => {
  const r = n.payload, i = t[n.meta.arg.id];
  i && (i.redirectTo = r || i.defaultRedirectionUrl, i.isLoading = !1);
}).addCase(ws.rejected, (t, n) => {
  const r = t[n.meta.arg.id];
  r && (r.isLoading = !1);
}).addCase(B0, (t, n) => {
  const r = t[n.payload.id];
  r && (r.analytics.cause = "searchFromLink");
}).addCase(H0, (t, n) => {
  const r = t[n.payload.id];
  r && (r.analytics.cause = "omniboxFromLink", r.analytics.metadata = n.payload.metadata);
}));
function bs(e) {
  return {
    defaultRedirectionUrl: e,
    redirectTo: "",
    isLoading: !1,
    analytics: {
      cause: "",
      metadata: null
    }
  };
}
const bu = "demo-product-color-swatches", G0 = "swatch_hex", J0 = 5, Z0 = 3, X0 = "atomic/resolveResult", ex = "atomic/selectChildProduct";
function Cu(e, t) {
  return new CustomEvent(e, {
    detail: t,
    bubbles: !0,
    cancelable: !0,
    composed: !0
  });
}
function Iu(e) {
  return e.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}
function vp(e) {
  if (Array.isArray(e)) {
    for (const r of e) {
      const i = vp(r);
      if (i)
        return i;
    }
    return null;
  }
  if (typeof e != "string" && typeof e != "number")
    return null;
  const n = `${e}`.trim().match(/^#?([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i);
  return n ? `#${n[1]}` : null;
}
function Sp(e, t) {
  return yp.getProductProperty(e, t);
}
function Au(e, t) {
  return t ? vp(Sp(e, t)) : null;
}
function tx(e) {
  var n;
  const t = Sp(e, "ec_color");
  return typeof t == "string" && t.trim() ? t.trim() : ((n = e.ec_name) == null ? void 0 : n.trim()) || "Color option";
}
function xu(e) {
  const t = /* @__PURE__ */ new Set(), n = [];
  for (const r of e)
    !r.permanentid || t.has(r.permanentid) || (t.add(r.permanentid), n.push(r));
  return n;
}
function nx(e) {
  const t = e.children ?? [];
  return t.length > 0 ? xu(t) : xu([e]);
}
class rx extends HTMLElement {
  constructor() {
    super(...arguments);
    ee(this, "shadow", this.attachShadow({ mode: "open" }));
    ee(this, "activeSwatchColor", "");
    ee(this, "currentProduct", null);
    ee(this, "swatches", []);
  }
  static get observedAttributes() {
    return ["field", "swatch-field", "max-visible"];
  }
  connectedCallback() {
    queueMicrotask(() => this.refresh());
  }
  attributeChangedCallback() {
    this.isConnected && queueMicrotask(() => this.refresh());
  }
  get field() {
    var n, r;
    return ((n = this.getAttribute("field")) == null ? void 0 : n.trim()) || ((r = this.getAttribute("swatch-field")) == null ? void 0 : r.trim()) || G0;
  }
  get maxVisible() {
    const n = Number.parseInt(this.getAttribute("max-visible") ?? "", 10);
    return Number.isFinite(n) && n > 0 ? n : J0;
  }
  resolveProductContext() {
    let n = null;
    return this.dispatchEvent(
      Cu(X0, (r) => {
        n = r;
      })
    ), n;
  }
  buildSwatchItems(n) {
    const r = nx(n), i = /* @__PURE__ */ new Map();
    for (const s of r) {
      const o = Au(s, this.field);
      !o || i.has(o) || i.set(o, {
        child: s,
        color: o,
        label: tx(s)
      });
    }
    return [...i.values()];
  }
  refresh(n = 0) {
    const r = this.resolveProductContext();
    if (!r) {
      if (n + 1 < Z0) {
        queueMicrotask(() => this.refresh(n + 1));
        return;
      }
      this.hidden = !0, this.currentProduct = null, this.swatches = [], this.activeSwatchColor = "", this.shadow.replaceChildren();
      return;
    }
    if (this.currentProduct = r, this.activeSwatchColor = Au(r, this.field) ?? "", this.swatches = this.buildSwatchItems(r), this.swatches.length <= 1) {
      this.hidden = !0, this.shadow.replaceChildren();
      return;
    }
    this.hidden = !1, this.render();
  }
  setActiveState() {
    const n = this.shadow.querySelectorAll("button[data-child-id]");
    for (const r of n) {
      const i = r.dataset.swatchColor === this.activeSwatchColor;
      r.classList.toggle("swatch-active", i), r.setAttribute("aria-pressed", String(i));
    }
  }
  selectChild(n) {
    const r = this.swatches.find((i) => i.child.permanentid === n);
    !r || r.color === this.activeSwatchColor || (this.activeSwatchColor = r.color, this.setActiveState(), this.dispatchEvent(
      Cu(ex, {
        child: r.child
      })
    ));
  }
  bindSwatchEvents() {
    const n = this.shadow.querySelectorAll("button[data-child-id]"), r = this.shadow.querySelector('button[data-action="open-product-page"]');
    for (const i of n) {
      const s = i.dataset.childId;
      s && (i.addEventListener("mouseenter", () => this.selectChild(s)), i.addEventListener("focus", () => this.selectChild(s)), i.addEventListener("touchstart", (o) => {
        o.preventDefault(), o.stopPropagation(), this.selectChild(s);
      }), i.addEventListener("click", (o) => {
        o.preventDefault(), o.stopPropagation(), this.selectChild(s);
      }));
    }
    r == null || r.addEventListener("click", (i) => {
      i.preventDefault(), i.stopPropagation(), this.openProductPage();
    });
  }
  openProductPage() {
    var r;
    const n = this.closest("atomic-product");
    if (typeof (n == null ? void 0 : n.clickLinkContainer) == "function") {
      n.clickLinkContainer();
      return;
    }
    (r = this.currentProduct) != null && r.clickUri && window.location.assign(this.currentProduct.clickUri);
  }
  render() {
    const n = this.swatches.slice(0, this.maxVisible), r = Math.max(0, this.swatches.length - n.length);
    this.shadow.innerHTML = `
      <style>
        :host {
          display: block;
        }

        .swatches {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.5rem;
          min-height: 1.25rem;
        }

        .swatch {
          inline-size: 1rem;
          block-size: 1rem;
          border-radius: 999px;
          border: 1px solid #d1d5db;
          background: var(--swatch-color);
          padding: 0;
          cursor: pointer;
          transition:
            transform 120ms ease,
            border-color 120ms ease,
            box-shadow 120ms ease;
        }

        .swatch:hover {
          transform: translateY(-1px);
        }

        .swatch:focus-visible {
          outline: 2px solid #111827;
          outline-offset: 2px;
        }

        .swatch-active {
          border-color: #111827;
          box-shadow:
            0 0 0 1.5px #ffffff,
            0 0 0 3px #111827;
        }

        .count {
          color: #374151;
          font-size: 0.875rem;
          font-weight: 600;
          line-height: 1;
        }

        .count-button {
          appearance: none;
          border: 0;
          background: transparent;
          padding: 0;
          cursor: pointer;
        }

        .count-button:hover,
        .count-button:focus-visible {
          color: #111827;
        }
      </style>
      <div class="swatches" aria-label="Available colors" role="list">
        ${n.map((i) => {
      const s = Iu(i.child.permanentid), o = Iu(i.label), a = i.color === this.activeSwatchColor;
      return `
              <button
                type="button"
                class="swatch${a ? " swatch-active" : ""}"
                data-child-id="${s}"
                data-swatch-color="${i.color}"
                aria-label="Show ${o}"
                aria-pressed="${String(a)}"
                title="${o}"
                style="--swatch-color: ${i.color};"
              ></button>
            `;
    }).join("")}
        ${r > 0 ? `
              <button
                type="button"
                class="count count-button"
                data-action="open-product-page"
                aria-label="View ${r} more colors"
                title="View more colors"
              >+${r}</button>
            ` : ""}
      </div>
    `, this.bindSwatchEvents();
  }
}
customElements.get(bu) || customElements.define(bu, rx);
const Eu = "demo-product-size-selector", ix = "ec_size", sx = "swatch_hex", ox = "ADD TO BAG:", ku = "Add to bag", ax = "default title", cx = 3, ux = "atomic/resolveResult", lx = ["xxs", "xs", "s", "m", "l", "xl", "xxl"], dx = new Map(
  lx.map((e, t) => [e, t])
);
function fx(e, t) {
  return new CustomEvent(e, {
    detail: t,
    bubbles: !0,
    cancelable: !0,
    composed: !0
  });
}
function ut(e) {
  return e.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}
function Xo(e) {
  if (Array.isArray(e)) {
    for (const n of e) {
      const r = Xo(n);
      if (r)
        return r;
    }
    return null;
  }
  if (typeof e != "string" && typeof e != "number")
    return null;
  const t = `${e}`.trim();
  return t.length > 0 ? t : null;
}
function Ru(e) {
  return !!(e && e.trim() && e.trim().toLowerCase() !== ax);
}
function Ou(e) {
  return dx.get(e.trim().toLowerCase()) ?? Number.POSITIVE_INFINITY;
}
function px(e) {
  const t = Xo(e);
  if (!t)
    return null;
  const n = t.match(/^#?([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i);
  return n ? `#${n[1]}` : null;
}
function wp(e, t) {
  return yp.getProductProperty(e, t);
}
function qu(e, t) {
  return t ? Xo(wp(e, t)) : null;
}
function Fu(e, t) {
  return t ? px(wp(e, t)) : null;
}
function Du(e) {
  const t = /* @__PURE__ */ new Set(), n = [];
  for (const r of e)
    !r.permanentid || t.has(r.permanentid) || (t.add(r.permanentid), n.push(r));
  return n;
}
function hx(e) {
  const t = e.children ?? [];
  return t.length > 0 ? Du(t) : Du([e]);
}
function gx(e) {
  const t = e.ec_promo_price;
  if (typeof t == "number")
    return t;
  const n = e.ec_price;
  return typeof n == "number" ? n : void 0;
}
class mx extends HTMLElement {
  constructor() {
    super(...arguments);
    ee(this, "shadow", this.attachShadow({ mode: "open" }));
    ee(this, "currentProduct", null);
    ee(this, "sizes", []);
    ee(this, "selectedSizeKey", "");
    ee(this, "addToBagChild", null);
    ee(this, "hoverTarget", null);
    ee(this, "removeVisibilityBindings", null);
    ee(this, "restoreOverlayContainerPosition", null);
  }
  static get observedAttributes() {
    return ["field", "size-field", "swatch-field", "label"];
  }
  connectedCallback() {
    this.prepareInteractionTarget(), this.bindVisibilityState(), queueMicrotask(() => this.refresh());
  }
  disconnectedCallback() {
    var n, r;
    (n = this.removeVisibilityBindings) == null || n.call(this), this.removeVisibilityBindings = null, (r = this.restoreOverlayContainerPosition) == null || r.call(this), this.restoreOverlayContainerPosition = null;
  }
  attributeChangedCallback() {
    this.isConnected && queueMicrotask(() => this.refresh());
  }
  get field() {
    var n, r;
    return ((n = this.getAttribute("field")) == null ? void 0 : n.trim()) || ((r = this.getAttribute("size-field")) == null ? void 0 : r.trim()) || ix;
  }
  get swatchField() {
    var n;
    return ((n = this.getAttribute("swatch-field")) == null ? void 0 : n.trim()) || sx;
  }
  get label() {
    var n;
    return ((n = this.getAttribute("label")) == null ? void 0 : n.trim()) || ox;
  }
  prepareInteractionTarget() {
    const n = this.closest("atomic-product-section-visual");
    if (this.hoverTarget = n ?? this.closest("atomic-product") ?? this.parentElement, !n || getComputedStyle(n).position !== "static")
      return;
    const r = n.style.position;
    n.style.position = "relative", this.restoreOverlayContainerPosition = () => {
      n.style.position = r;
    };
  }
  setOverlayVisible(n) {
    if (n) {
      this.setAttribute("data-visible", "true");
      return;
    }
    this.removeAttribute("data-visible");
  }
  bindVisibilityState() {
    const n = this.hoverTarget ?? this.closest("atomic-product-section-visual") ?? this.closest("atomic-product") ?? this.parentElement;
    if (!n || this.removeVisibilityBindings)
      return;
    this.hoverTarget = n;
    const r = () => this.setOverlayVisible(!0), i = (s) => {
      const o = s == null ? void 0 : s.relatedTarget;
      o instanceof Node && n.contains(o) || this.setOverlayVisible(!1);
    };
    n.addEventListener("mouseenter", r), n.addEventListener("mouseleave", i), n.addEventListener("focusin", r), n.addEventListener("focusout", i), n.addEventListener("touchstart", r, { passive: !0 }), this.removeVisibilityBindings = () => {
      n.removeEventListener("mouseenter", r), n.removeEventListener("mouseleave", i), n.removeEventListener("focusin", r), n.removeEventListener("focusout", i), n.removeEventListener("touchstart", r);
    };
  }
  resolveProductContext() {
    let n = null;
    return this.dispatchEvent(
      fx(ux, (r) => {
        n = r;
      })
    ), n;
  }
  getActiveSwatchProducts(n) {
    const r = Fu(n, this.swatchField), i = hx(n);
    if (!r)
      return i;
    const s = i.filter(
      (o) => Fu(o, this.swatchField) === r
    );
    return s.length > 0 ? s : i;
  }
  buildSizeItems(n) {
    const r = [], i = /* @__PURE__ */ new Set();
    let s = 0;
    for (const o of n) {
      const a = qu(o, this.field);
      if (!Ru(a))
        continue;
      const c = a.toLowerCase();
      i.has(c) || (i.add(c), r.push({
        child: o,
        discoveryIndex: s,
        key: c,
        label: a
      }), s += 1);
    }
    return r.sort((o, a) => {
      const c = Ou(o.label), u = Ou(a.label);
      return c !== u ? c - u : o.discoveryIndex - a.discoveryIndex;
    });
  }
  refresh(n = 0) {
    var a, c;
    const r = this.resolveProductContext();
    if (!r) {
      if (n + 1 < cx) {
        queueMicrotask(() => this.refresh(n + 1));
        return;
      }
      this.hidden = !0, this.currentProduct = null, this.sizes = [], this.selectedSizeKey = "", this.shadow.replaceChildren();
      return;
    }
    this.currentProduct = r;
    const i = this.getActiveSwatchProducts(r);
    this.sizes = this.buildSizeItems(i), this.addToBagChild = i[0] ?? null;
    const s = qu(r, this.field), o = Ru(s) ? s.toLowerCase() : "";
    if (this.selectedSizeKey = ((a = this.sizes.find((u) => u.key === o)) == null ? void 0 : a.key) || ((c = this.sizes[0]) == null ? void 0 : c.key) || "", this.sizes.length === 0 && !this.addToBagChild) {
      this.hidden = !0, this.removeAttribute("data-has-sizes"), this.addToBagChild = null, this.shadow.replaceChildren();
      return;
    }
    this.hidden = !1, this.toggleAttribute("data-has-sizes", this.sizes.length > 0), this.render();
  }
  createDataLayerPayload(n, r) {
    var a;
    const i = gx(n), s = [n.ec_color, r].filter(Boolean).join(" / ") || n.ec_name || n.permanentid;
    return {
      event: "add_to_cart",
      ecommerce: {
        items: [{
          item_id: n.ec_product_id || n.permanentid,
          item_name: n.ec_name || ((a = this.currentProduct) == null ? void 0 : a.ec_name) || n.permanentid,
          item_variant: s,
          quantity: 1,
          ...r ? { size: r } : {},
          ...n.ec_brand ? { item_brand: n.ec_brand } : {},
          ...n.ec_category[0] ? { item_category: n.ec_category[0] } : {},
          ...n.ec_item_group_id ? { item_group_id: n.ec_item_group_id } : {},
          ...typeof i == "number" ? { price: i } : {},
          ...n.ec_color ? { color: n.ec_color } : {}
        }],
        ...typeof i == "number" ? { value: i } : {}
      }
    };
  }
  handleSizeClick(n) {
    const r = this.sizes.find((o) => o.key === n);
    if (!r)
      return;
    this.selectedSizeKey = r.key, this.setActiveState();
    const i = this.createDataLayerPayload(r.child, r.label), s = window.dataLayer ?? [];
    s.push(i), window.dataLayer = s;
  }
  handleAddToBagClick() {
    if (!this.addToBagChild)
      return;
    const n = this.createDataLayerPayload(this.addToBagChild), r = window.dataLayer ?? [];
    r.push(n), window.dataLayer = r;
  }
  setActiveState() {
    const n = this.shadow.querySelectorAll("button[data-size-key]");
    for (const r of n) {
      const i = r.dataset.sizeKey === this.selectedSizeKey;
      r.classList.toggle("size-active", i), r.setAttribute("aria-pressed", String(i));
    }
  }
  bindSizeEvents() {
    const n = this.shadow.querySelectorAll("button[data-size-key]"), r = this.shadow.querySelector('button[data-action="add-to-bag"]');
    for (const i of n) {
      const s = i.dataset.sizeKey;
      s && i.addEventListener("click", (o) => {
        o.preventDefault(), o.stopPropagation(), this.handleSizeClick(s);
      });
    }
    r == null || r.addEventListener("click", (i) => {
      i.preventDefault(), i.stopPropagation(), this.handleAddToBagClick();
    });
  }
  render() {
    var r, i;
    const n = (i = (r = this.addToBagChild) == null ? void 0 : r.ec_name) != null && i.trim() ? `Add ${this.addToBagChild.ec_name.trim()} to bag` : ku;
    this.shadow.innerHTML = `
      <style>
        :host {
          display: block;
          position: absolute;
          inset-inline: 0;
          bottom: 2rem;
          z-index: 1;
          max-height: 0;
          opacity: 0;
          overflow: hidden;
          pointer-events: none;
          transform: translateY(100%);
          transition:
            max-height 180ms ease,
            opacity 160ms ease,
            transform 180ms ease;
        }

        :host([data-visible='true']) {
          max-height: 8rem;
          opacity: 1;
          pointer-events: auto;
          transform: translateY(0);
        }

        @media (hover: none), (pointer: coarse) {
          :host {
            max-height: 8rem;
            opacity: 1;
            pointer-events: auto;
            transform: translateY(0);
            transition: none;
          }
        }

        .panel {
          pointer-events: auto;
          padding: 0.55rem 0.35rem 0.45rem;
          background: linear-gradient(to top, rgba(255, 255, 255, 0.98), rgba(255, 255, 255, 0.88));
          text-align: center;
        }

        .label {
          color: #111827;
          font-size: 0.78rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          margin-bottom: 0.3rem;
          text-transform: uppercase;
        }

        .sizes {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 0.35rem 0.5rem;
        }

        .cta-button,
        .size {
          appearance: none;
          border: 0;
          background: transparent;
          color: #111827;
          cursor: pointer;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.02em;
          min-inline-size: 1.8rem;
          padding: 0.12rem 0.1rem;
          text-transform: uppercase;
          transition:
            color 120ms ease,
            opacity 120ms ease,
            transform 120ms ease;
        }

        .cta-button {
          background: rgba(17, 24, 39, 0.92);
          border-radius: 999px;
          color: #ffffff;
          min-inline-size: 8.5rem;
          padding: 0.5rem 1rem;
          text-transform: uppercase;
        }

        .cta-button:hover,
        .size:hover {
          transform: translateY(-1px);
        }

        .cta-button:focus-visible,
        .size:focus-visible {
          outline: 2px solid #111827;
          outline-offset: 2px;
        }

        .size-active {
          color: #6b7280;
        }

        @media (max-width: 640px) {
          .panel {
            padding-inline: 0.55rem;
          }

          .sizes {
            gap: 0.25rem 0.35rem;
          }

          .size {
            min-inline-size: 1.5rem;
          }
        }
      </style>
      <div class="panel" aria-label="Add to bag options">
        ${this.sizes.length > 0 ? `
              <div class="label">${ut(this.label)}</div>
              <div class="sizes" role="list">
                ${this.sizes.map((s) => {
      const o = s.key === this.selectedSizeKey;
      return `
                      <button
                        type="button"
                        class="size${o ? " size-active" : ""}"
                        data-size-key="${ut(s.key)}"
                        aria-label="Add size ${ut(s.label)} to bag"
                        aria-pressed="${String(o)}"
                        title="Add size ${ut(s.label)} to bag"
                      >${ut(s.label)}</button>
                    `;
    }).join("")}
              </div>
            ` : `
              <button
                type="button"
                class="cta-button"
                data-action="add-to-bag"
                aria-label="${ut(n)}"
                title="${ut(n)}"
              >${ut(ku)}</button>
            `}
      </div>
    `, this.bindSizeEvents();
  }
}
customElements.get(Eu) || customElements.define(Eu, mx);
