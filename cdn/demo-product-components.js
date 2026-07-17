var wh = Object.defineProperty;
var bh = (e, t, r) => t in e ? wh(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r;
var te = (e, t, r) => bh(e, typeof t != "symbol" ? t + "" : t, r);
const Ch = "coveo-headless-internal-state", Ih = Symbol.for(Ch);
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
function Ah(e, t) {
  const r = `
  The following properties are invalid:

    ${e.join(`
	`)}
  
  ${t}
  `;
  return new Eu(r);
}
var Eu = class extends Error {
  constructor(e) {
    super(e), this.name = "SchemaValidationError";
  }
}, mt = class {
  constructor(e) {
    this.definition = e;
  }
  validate(e = {}, t = "") {
    const r = {
      ...this.default,
      ...e
    }, n = [];
    for (const i in this.definition) {
      const s = this.definition[i].validate(r[i]);
      s && n.push(`${i}: ${s}`);
    }
    if (n.length)
      throw Ah(n, t);
    return r;
  }
  get default() {
    const e = {};
    for (const t in this.definition) {
      const r = this.definition[t].default;
      r !== void 0 && (e[t] = r);
    }
    return e;
  }
}, Ce = class {
  constructor(e = {}) {
    this.baseConfig = e;
  }
  validate(e) {
    return this.baseConfig.required && X(e) ? "value is required." : null;
  }
  get default() {
    return this.baseConfig.default instanceof Function ? this.baseConfig.default() : this.baseConfig.default;
  }
  get required() {
    return this.baseConfig.required === !0;
  }
};
function nr(e) {
  return e === void 0;
}
function xh(e) {
  return e === null;
}
function X(e) {
  return nr(e) || xh(e);
}
var ie = class {
  constructor(e = {}) {
    te(this, "value");
    this.value = new Ce(e);
  }
  validate(e) {
    const t = this.value.validate(e);
    return t || (kh(e) ? null : "value is not a boolean.");
  }
  get default() {
    return this.value.default;
  }
  get required() {
    return this.value.required;
  }
};
function kh(e) {
  return nr(e) || Du(e);
}
function Du(e) {
  return typeof e == "boolean";
}
var W = class {
  constructor(e = {}) {
    te(this, "value");
    this.config = e, this.value = new Ce(e);
  }
  validate(e) {
    const t = this.value.validate(e);
    return t || (Rh(e) ? e < this.config.min ? `minimum value of ${this.config.min} not respected.` : e > this.config.max ? `maximum value of ${this.config.max} not respected.` : null : "value is not a number.");
  }
  get default() {
    return this.value.default;
  }
  get required() {
    return this.value.required;
  }
};
function Rh(e) {
  return nr(e) || Tu(e);
}
function Tu(e) {
  return typeof e == "number" && !Number.isNaN(e);
}
var qh = /^\d{4}(-\d\d(-\d\d(T\d\d:\d\d(:\d\d)?(\.\d+)?(([+-]\d\d:\d\d)|Z)?)?)?)?$/i, Q = class {
  constructor(e = {}) {
    te(this, "value");
    te(this, "config");
    this.config = {
      emptyAllowed: !0,
      url: !1,
      ...e
    }, this.value = new Ce(this.config);
  }
  validate(e) {
    const { emptyAllowed: t, url: r, regex: n, constrainTo: i, ISODate: s } = this.config, a = this.value.validate(e);
    if (a)
      return a;
    if (nr(e))
      return null;
    if (!Mu(e))
      return "value is not a string.";
    if (!t && !e.length)
      return "value is an empty string.";
    if (r)
      try {
        new URL(e);
      } catch {
        return "value is not a valid URL.";
      }
    return n && !n.test(e) ? `value did not match provided regex ${n}` : i && !i.includes(e) ? `value should be one of: ${i.join(", ")}.` : s && !(qh.test(e) && new Date(e).toString() !== "Invalid Date") ? "value is not a valid ISO8601 date string" : null;
  }
  get default() {
    return this.value.default;
  }
  get required() {
    return this.value.required;
  }
};
function Mu(e) {
  return Object.prototype.toString.call(e) === "[object String]";
}
var z = class {
  constructor(e = {}) {
    te(this, "config");
    this.config = {
      options: { required: !1 },
      values: {},
      ...e
    };
  }
  validate(e) {
    if (nr(e))
      return this.config.options.required ? "value is required and is currently undefined" : null;
    if (!_u(e))
      return "value is not an object";
    for (const [r, n] of Object.entries(this.config.values))
      if (n.required && X(e[r]))
        return `value does not contain ${r}`;
    let t = "";
    for (const [r, n] of Object.entries(this.config.values)) {
      const i = e[r], s = n.validate(i);
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
function _u(e) {
  return e !== void 0 && typeof e == "object";
}
var oe = class {
  constructor(e = {}) {
    te(this, "value");
    this.config = e, this.value = new Ce(this.config);
  }
  validate(e) {
    if (!X(e) && !Array.isArray(e))
      return "value is not an array";
    const t = this.value.validate(e);
    if (t !== null)
      return t;
    if (X(e))
      return null;
    if (this.config.max !== void 0 && e.length > this.config.max)
      return `value contains more than ${this.config.max}`;
    if (this.config.min !== void 0 && e.length < this.config.min)
      return `value contains less than ${this.config.min}`;
    if (this.config.each !== void 0) {
      let r = "";
      return e.forEach((n) => {
        this.config.each.required && X(n) && (r = `value is null or undefined: ${e.join(",")}`);
        const i = this.validatePrimitiveValue(n, this.config.each);
        i !== null && (r += ` ${i}`);
      }), r === "" ? null : r;
    }
    return null;
  }
  validatePrimitiveValue(e, t) {
    return Du(e) || Mu(e) || Tu(e) || _u(e) ? t.validate(e) : "value is not a primitive value";
  }
  get default() {
  }
  get required() {
    return this.value.required;
  }
};
function Pu(e) {
  return Array.isArray(e);
}
var Ar = class {
  constructor(e) {
    te(this, "value");
    this.config = e, this.value = new Ce(e);
  }
  validate(e) {
    const t = this.value.validate(e);
    return t !== null ? t : nr(e) || Object.values(this.config.enum).find(
      (n) => n === e
    ) ? null : "value is not in enum.";
  }
  get default() {
    return this.value.default;
  }
  get required() {
    return this.value.required;
  }
};
function bs(e) {
  return `Minified Redux error #${e}; visit https://redux.js.org/Errors?code=${e} for the full message or use the non-minified dev environment for full errors. `;
}
var _i = () => Math.random().toString(36).substring(7).split("").join("."), Oh = {
  INIT: `@@redux/INIT${/* @__PURE__ */ _i()}`,
  REPLACE: `@@redux/REPLACE${/* @__PURE__ */ _i()}`,
  PROBE_UNKNOWN_ACTION: () => `@@redux/PROBE_UNKNOWN_ACTION${_i()}`
}, Xa = Oh;
function Wt(e) {
  if (typeof e != "object" || e === null)
    return !1;
  let t = e;
  for (; Object.getPrototypeOf(t) !== null; )
    t = Object.getPrototypeOf(t);
  return Object.getPrototypeOf(e) === t || Object.getPrototypeOf(e) === null;
}
function Fh(e) {
  Object.keys(e).forEach((t) => {
    const r = e[t];
    if (typeof r(void 0, {
      type: Xa.INIT
    }) > "u")
      throw new Error(bs(12));
    if (typeof r(void 0, {
      type: Xa.PROBE_UNKNOWN_ACTION()
    }) > "u")
      throw new Error(bs(13));
  });
}
function Eh(e) {
  const t = Object.keys(e), r = {};
  for (let s = 0; s < t.length; s++) {
    const a = t[s];
    typeof e[a] == "function" && (r[a] = e[a]);
  }
  const n = Object.keys(r);
  let i;
  try {
    Fh(r);
  } catch (s) {
    i = s;
  }
  return function(a = {}, o) {
    if (i)
      throw i;
    let c = !1;
    const u = {};
    for (let l = 0; l < n.length; l++) {
      const f = n[l], p = r[f], g = a[f], h = p(g, o);
      if (typeof h > "u")
        throw o && o.type, new Error(bs(14));
      u[f] = h, c = c || h !== g;
    }
    return c = c || n.length !== Object.keys(a).length, c ? u : a;
  };
}
function Uu(e) {
  return Wt(e) && "type" in e && typeof e.type == "string";
}
var Zs = Symbol.for("immer-nothing"), Sr = Symbol.for("immer-draftable"), pe = Symbol.for("immer-state");
function be(e, ...t) {
  throw new Error(
    `[Immer] minified error nr: ${e}. Full error at: https://bit.ly/3cXEKWf`
  );
}
var Ee = Object, Ot = Ee.getPrototypeOf, xr = "constructor", Mr = "prototype", Cs = "configurable", Vn = "enumerable", In = "writable", kr = "value", De = (e) => !!e && !!e[pe];
function qe(e) {
  var t;
  return e ? Vu(e) || Pr(e) || !!e[Sr] || !!((t = e[xr]) != null && t[Sr]) || Ur(e) || Vr(e) : !1;
}
var Dh = Ee[Mr][xr].toString(), eo = /* @__PURE__ */ new WeakMap();
function Vu(e) {
  if (!e || !Kt(e))
    return !1;
  const t = Ot(e);
  if (t === null || t === Ee[Mr])
    return !0;
  const r = Ee.hasOwnProperty.call(t, xr) && t[xr];
  if (r === Object)
    return !0;
  if (!At(r))
    return !1;
  let n = eo.get(r);
  return n === void 0 && (n = Function.toString.call(r), eo.set(r, n)), n === Dh;
}
function Th(e) {
  return De(e) || be(15, e), e[pe].base_;
}
function _r(e, t, r = !0) {
  Ft(e) === 0 ? (r ? Reflect.ownKeys(e) : Ee.keys(e)).forEach((i) => {
    t(i, e[i], e);
  }) : e.forEach((n, i) => t(i, n, e));
}
function Ft(e) {
  const t = e[pe];
  return t ? t.type_ : Pr(e) ? 1 : Ur(e) ? 2 : Vr(e) ? 3 : 0;
}
var zt = (e, t, r = Ft(e)) => r === 2 ? e.has(t) : Ee[Mr].hasOwnProperty.call(e, t), Ke = (e, t, r = Ft(e)) => (
  // @ts-ignore
  r === 2 ? e.get(t) : e[t]
), $n = (e, t, r, n = Ft(e)) => {
  n === 2 ? e.set(t, r) : n === 3 ? e.add(r) : e[t] = r;
};
function Mh(e, t) {
  return e === t ? e !== 0 || 1 / e === 1 / t : e !== e && t !== t;
}
var Pr = Array.isArray, Ur = (e) => e instanceof Map, Vr = (e) => e instanceof Set, Kt = (e) => typeof e == "object", At = (e) => typeof e == "function", Pi = (e) => typeof e == "boolean";
function _h(e) {
  const t = +e;
  return Number.isInteger(t) && String(t) === e;
}
var Ph = (e) => Kt(e) ? e == null ? void 0 : e[pe] : null, Ge = (e) => e.copy_ || e.base_, Xs = (e) => e.modified_ ? e.copy_ : e.base_;
function Is(e, t) {
  if (Ur(e))
    return new Map(e);
  if (Vr(e))
    return new Set(e);
  if (Pr(e))
    return Array[Mr].slice.call(e);
  const r = Vu(e);
  if (t === !0 || t === "class_only" && !r) {
    const n = Ee.getOwnPropertyDescriptors(e);
    delete n[pe];
    let i = Reflect.ownKeys(n);
    for (let s = 0; s < i.length; s++) {
      const a = i[s], o = n[a];
      o[In] === !1 && (o[In] = !0, o[Cs] = !0), (o.get || o.set) && (n[a] = {
        [Cs]: !0,
        [In]: !0,
        // could live with !!desc.set as well here...
        [Vn]: o[Vn],
        [kr]: e[a]
      });
    }
    return Ee.create(Ot(e), n);
  } else {
    const n = Ot(e);
    if (n !== null && r)
      return { ...e };
    const i = Ee.create(n);
    return Ee.assign(i, e);
  }
}
function ea(e, t = !1) {
  return si(e) || De(e) || !qe(e) || (Ft(e) > 1 && Ee.defineProperties(e, {
    set: en,
    add: en,
    clear: en,
    delete: en
  }), Ee.freeze(e), t && _r(
    e,
    (r, n) => {
      ea(n, !0);
    },
    !1
  )), e;
}
function Uh() {
  be(2);
}
var en = {
  [kr]: Uh
};
function si(e) {
  return e === null || !Kt(e) ? !0 : Ee.isFrozen(e);
}
var Ln = "MapSet", Qn = "Patches", to = "ArrayMethods", jn = {};
function Et(e) {
  const t = jn[e];
  return t || be(0, e), t;
}
var ro = (e) => !!jn[e];
function Vh(e, t) {
  jn[e] || (jn[e] = t);
}
var Rr, $u = () => Rr, $h = (e, t) => ({
  drafts_: [],
  parent_: e,
  immer_: t,
  // Whenever the modified draft contains a draft from another scope, we
  // need to prevent auto-freezing so the unowned draft can be finalized.
  canAutoFreeze_: !0,
  unfinalizedDrafts_: 0,
  handledSet_: /* @__PURE__ */ new Set(),
  processedForPatches_: /* @__PURE__ */ new Set(),
  mapSetPlugin_: ro(Ln) ? Et(Ln) : void 0,
  arrayMethodsPlugin_: ro(to) ? Et(to) : void 0
});
function no(e, t) {
  t && (e.patchPlugin_ = Et(Qn), e.patches_ = [], e.inversePatches_ = [], e.patchListener_ = t);
}
function As(e) {
  xs(e), e.drafts_.forEach(Lh), e.drafts_ = null;
}
function xs(e) {
  e === Rr && (Rr = e.parent_);
}
var io = (e) => Rr = $h(Rr, e);
function Lh(e) {
  const t = e[pe];
  t.type_ === 0 || t.type_ === 1 ? t.revoke_() : t.revoked_ = !0;
}
function so(e, t) {
  t.unfinalizedDrafts_ = t.drafts_.length;
  const r = t.drafts_[0];
  if (e !== void 0 && e !== r) {
    r[pe].modified_ && (As(t), be(4)), qe(e) && (e = ao(t, e));
    const { patchPlugin_: i } = t;
    i && i.generateReplacementPatches_(
      r[pe].base_,
      e,
      t
    );
  } else
    e = ao(t, r);
  return Qh(t, e, !0), As(t), t.patches_ && t.patchListener_(t.patches_, t.inversePatches_), e !== Zs ? e : void 0;
}
function ao(e, t) {
  if (si(t))
    return t;
  const r = t[pe];
  if (!r)
    return Nn(t, e.handledSet_, e);
  if (!ai(r, e))
    return t;
  if (!r.modified_)
    return r.base_;
  if (!r.finalized_) {
    const { callbacks_: n } = r;
    if (n)
      for (; n.length > 0; )
        n.pop()(e);
    ju(r, e);
  }
  return r.copy_;
}
function Qh(e, t, r = !1) {
  !e.parent_ && e.immer_.autoFreeze_ && e.canAutoFreeze_ && ea(t, r);
}
function Lu(e) {
  e.finalized_ = !0, e.scope_.unfinalizedDrafts_--;
}
var ai = (e, t) => e.scope_ === t, jh = [];
function Qu(e, t, r, n) {
  const i = Ge(e), s = e.type_;
  if (n !== void 0 && Ke(i, n, s) === t) {
    $n(i, n, r, s);
    return;
  }
  if (!e.draftLocations_) {
    const o = e.draftLocations_ = /* @__PURE__ */ new Map();
    _r(i, (c, u) => {
      if (De(u)) {
        const l = o.get(u) || [];
        l.push(c), o.set(u, l);
      }
    });
  }
  const a = e.draftLocations_.get(t) ?? jh;
  for (const o of a)
    $n(i, o, r, s);
}
function Nh(e, t, r) {
  e.callbacks_.push(function(i) {
    var o;
    const s = t;
    if (!s || !ai(s, i))
      return;
    (o = i.mapSetPlugin_) == null || o.fixSetContents(s);
    const a = Xs(s);
    Qu(e, s.draft_ ?? s, a, r), ju(s, i);
  });
}
function ju(e, t) {
  var n;
  if (e.modified_ && !e.finalized_ && (e.type_ === 3 || e.type_ === 1 && e.allIndicesReassigned_ || (((n = e.assigned_) == null ? void 0 : n.size) ?? 0) > 0)) {
    const { patchPlugin_: i } = t;
    if (i) {
      const s = i.getPath(e);
      s && i.generatePatches_(e, s, t);
    }
    Lu(e);
  }
}
function zh(e, t, r) {
  const { scope_: n } = e;
  if (De(r)) {
    const i = r[pe];
    ai(i, n) && i.callbacks_.push(function() {
      An(e);
      const a = Xs(i);
      Qu(e, r, a, t);
    });
  } else qe(r) && e.callbacks_.push(function() {
    const s = Ge(e);
    e.type_ === 3 ? s.has(r) && Nn(r, n.handledSet_, n) : Ke(s, t, e.type_) === r && n.drafts_.length > 1 && (e.assigned_.get(t) ?? !1) === !0 && e.copy_ && Nn(
      Ke(e.copy_, t, e.type_),
      n.handledSet_,
      n
    );
  });
}
function Nn(e, t, r) {
  return !r.immer_.autoFreeze_ && r.unfinalizedDrafts_ < 1 || De(e) || t.has(e) || !qe(e) || si(e) || (t.add(e), _r(e, (n, i) => {
    if (De(i)) {
      const s = i[pe];
      if (ai(s, r)) {
        const a = Xs(s);
        $n(e, n, a, e.type_), Lu(s);
      }
    } else qe(i) && Nn(i, t, r);
  })), e;
}
function Bh(e, t) {
  const r = Pr(e), n = {
    type_: r ? 1 : 0,
    // Track which produce call this is associated with.
    scope_: t ? t.scope_ : $u(),
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
  let i = n, s = zn;
  r && (i = [n], s = qr);
  const { revoke: a, proxy: o } = Proxy.revocable(i, s);
  return n.draft_ = o, n.revoke_ = a, [o, n];
}
var zn = {
  get(e, t) {
    if (t === pe)
      return e;
    let r = e.scope_.arrayMethodsPlugin_;
    const n = e.type_ === 1 && typeof t == "string";
    if (n && r != null && r.isArrayOperationMethod(t))
      return r.createMethodInterceptor(e, t);
    const i = Ge(e);
    if (!zt(i, t, e.type_))
      return Yh(e, i, t);
    const s = i[t];
    if (e.finalized_ || !qe(s) || n && e.operationMethod && (r != null && r.isMutatingArrayMethod(
      e.operationMethod
    )) && _h(t))
      return s;
    if (s === Ui(e.base_, t) || Hh(e, t, s)) {
      An(e);
      const a = e.type_ === 1 ? +t : t, o = Rs(e.scope_, s, e, a);
      return e.copy_[a] = o;
    }
    return s;
  },
  has(e, t) {
    return t in Ge(e);
  },
  ownKeys(e) {
    return Reflect.ownKeys(Ge(e));
  },
  set(e, t, r) {
    const n = Nu(Ge(e), t);
    if (n != null && n.set)
      return n.set.call(e.draft_, r), !0;
    if (!e.modified_) {
      const i = Ui(Ge(e), t), s = i == null ? void 0 : i[pe];
      if (s && s.base_ === r)
        return e.copy_[t] = r, e.assigned_.set(t, !1), !0;
      if (Mh(r, i) && (r !== void 0 || zt(e.base_, t, e.type_)))
        return !0;
      An(e), ks(e);
    }
    return e.copy_[t] === r && // special case: handle new props with value 'undefined'
    (r !== void 0 || zt(e.copy_, t, e.type_)) || // special case: NaN
    Number.isNaN(r) && Number.isNaN(e.copy_[t]) || (e.copy_[t] = r, e.assigned_.set(t, !0), zh(e, t, r)), !0;
  },
  deleteProperty(e, t) {
    return An(e), Ui(e.base_, t) !== void 0 || t in e.base_ ? (e.assigned_.set(t, !1), ks(e)) : e.assigned_.delete(t), e.copy_ && delete e.copy_[t], !0;
  },
  // Note: We never coerce `desc.value` into an Immer draft, because we can't make
  // the same guarantee in ES5 mode.
  getOwnPropertyDescriptor(e, t) {
    const r = Ge(e), n = Reflect.getOwnPropertyDescriptor(r, t);
    return n && {
      [In]: !0,
      [Cs]: e.type_ !== 1 || t !== "length",
      [Vn]: n[Vn],
      [kr]: r[t]
    };
  },
  defineProperty() {
    be(11);
  },
  getPrototypeOf(e) {
    return Ot(e.base_);
  },
  setPrototypeOf() {
    be(12);
  }
}, qr = {};
for (let e in zn) {
  let t = zn[e];
  qr[e] = function() {
    const r = arguments;
    return r[0] = r[0][0], t.apply(this, r);
  };
}
qr.deleteProperty = function(e, t) {
  return qr.set.call(this, e, t, void 0);
};
qr.set = function(e, t, r) {
  return zn.set.call(this, e[0], t, r, e[0]);
};
function Ui(e, t) {
  const r = e[pe];
  return (r ? Ge(r) : e)[t];
}
function Hh(e, t, r) {
  var n;
  return e.type_ !== 1 || !e.allIndicesReassigned_ || (n = e.assigned_) != null && n.get(t) || !qe(r) || r[pe] ? !1 : e.baseRefs_.has(r);
}
function Yh(e, t, r) {
  var i;
  const n = Nu(t, r);
  return n ? kr in n ? n[kr] : (
    // This is a very special case, if the prop is a getter defined by the
    // prototype, we should invoke it with the draft as context!
    (i = n.get) == null ? void 0 : i.call(e.draft_)
  ) : void 0;
}
function Nu(e, t) {
  if (!(t in e))
    return;
  let r = Ot(e);
  for (; r; ) {
    const n = Object.getOwnPropertyDescriptor(r, t);
    if (n)
      return n;
    r = Ot(r);
  }
}
function ks(e) {
  e.modified_ || (e.modified_ = !0, e.parent_ && ks(e.parent_));
}
function An(e) {
  e.copy_ || (e.assigned_ = /* @__PURE__ */ new Map(), e.copy_ = Is(
    e.base_,
    e.scope_.immer_.useStrictShallowCopy_
  ));
}
var Wh = class {
  constructor(e) {
    this.autoFreeze_ = !0, this.useStrictShallowCopy_ = !1, this.useStrictIteration_ = !1, this.produce = (t, r, n) => {
      if (At(t) && !At(r)) {
        const s = r;
        r = t;
        const a = this;
        return function(c = s, ...u) {
          return a.produce(c, (l) => r.call(this, l, ...u));
        };
      }
      At(r) || be(6), n !== void 0 && !At(n) && be(7);
      let i;
      if (qe(t)) {
        const s = io(this), a = Rs(s, t, void 0);
        let o = !0;
        try {
          i = r(a), o = !1;
        } finally {
          o ? As(s) : xs(s);
        }
        return no(s, n), so(i, s);
      } else if (!t || !Kt(t)) {
        if (i = r(t), i === void 0 && (i = t), i === Zs && (i = void 0), this.autoFreeze_ && ea(i, !0), n) {
          const s = [], a = [];
          Et(Qn).generateReplacementPatches_(t, i, {
            patches_: s,
            inversePatches_: a
          }), n(s, a);
        }
        return i;
      } else
        be(1, t);
    }, this.produceWithPatches = (t, r) => {
      if (At(t))
        return (a, ...o) => this.produceWithPatches(a, (c) => t(c, ...o));
      let n, i;
      return [this.produce(t, r, (a, o) => {
        n = a, i = o;
      }), n, i];
    }, Pi(e == null ? void 0 : e.autoFreeze) && this.setAutoFreeze(e.autoFreeze), Pi(e == null ? void 0 : e.useStrictShallowCopy) && this.setUseStrictShallowCopy(e.useStrictShallowCopy), Pi(e == null ? void 0 : e.useStrictIteration) && this.setUseStrictIteration(e.useStrictIteration);
  }
  createDraft(e) {
    qe(e) || be(8), De(e) && (e = zu(e));
    const t = io(this), r = Rs(t, e, void 0);
    return r[pe].isManual_ = !0, xs(t), r;
  }
  finishDraft(e, t) {
    const r = e && e[pe];
    (!r || !r.isManual_) && be(9);
    const { scope_: n } = r;
    return no(n, t), so(void 0, n);
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
    let r;
    for (r = t.length - 1; r >= 0; r--) {
      const i = t[r];
      if (i.path.length === 0 && i.op === "replace") {
        e = i.value;
        break;
      }
    }
    r > -1 && (t = t.slice(r + 1));
    const n = Et(Qn).applyPatches_;
    return De(e) ? n(e, t) : this.produce(
      e,
      (i) => n(i, t)
    );
  }
};
function Rs(e, t, r, n) {
  const [i, s] = Ur(t) ? Et(Ln).proxyMap_(t, r) : Vr(t) ? Et(Ln).proxySet_(t, r) : Bh(t, r);
  return ((r == null ? void 0 : r.scope_) ?? $u()).drafts_.push(i), s.callbacks_ = (r == null ? void 0 : r.callbacks_) ?? [], s.key_ = n, r && n !== void 0 ? Nh(r, s, n) : s.callbacks_.push(function(c) {
    var l;
    (l = c.mapSetPlugin_) == null || l.fixSetContents(s);
    const { patchPlugin_: u } = c;
    s.modified_ && u && u.generatePatches_(s, [], c);
  }), i;
}
function zu(e) {
  return De(e) || be(10, e), Bu(e);
}
function Bu(e) {
  if (!qe(e) || si(e))
    return e;
  const t = e[pe];
  let r, n = !0;
  if (t) {
    if (!t.modified_)
      return t.base_;
    t.finalized_ = !0, r = Is(e, t.scope_.immer_.useStrictShallowCopy_), n = t.scope_.immer_.shouldUseStrictIteration();
  } else
    r = Is(e, !0);
  return _r(
    r,
    (i, s) => {
      $n(r, i, Bu(s));
    },
    n
  ), t && (t.finalized_ = !1), r;
}
function Kh() {
  function t(h, d = []) {
    if (h.key_ !== void 0) {
      const m = h.parent_.copy_ ?? h.parent_.base_, C = Ph(Ke(m, h.key_)), R = Ke(m, h.key_);
      if (R === void 0 || R !== h.draft_ && R !== h.base_ && R !== h.copy_ || C != null && C.base_ !== h.base_)
        return null;
      const b = h.parent_.type_ === 3;
      let S;
      if (b) {
        const v = h.parent_;
        S = Array.from(v.drafts_.keys()).indexOf(h.key_);
      } else
        S = h.key_;
      if (!(b && m.size > S || zt(m, S)))
        return null;
      d.push(S);
    }
    if (h.parent_)
      return t(h.parent_, d);
    d.reverse();
    try {
      r(h.copy_, d);
    } catch {
      return null;
    }
    return d;
  }
  function r(h, d) {
    let m = h;
    for (let C = 0; C < d.length - 1; C++) {
      const R = d[C];
      if (m = Ke(m, R), !Kt(m) || m === null)
        throw new Error(`Cannot resolve path at '${d.join("/")}'`);
    }
    return m;
  }
  const n = "replace", i = "add", s = "remove";
  function a(h, d, m) {
    if (h.scope_.processedForPatches_.has(h))
      return;
    h.scope_.processedForPatches_.add(h);
    const { patches_: C, inversePatches_: R } = m;
    switch (h.type_) {
      case 0:
      case 2:
        return c(
          h,
          d,
          C,
          R
        );
      case 1:
        return o(
          h,
          d,
          C,
          R
        );
      case 3:
        return u(
          h,
          d,
          C,
          R
        );
    }
  }
  function o(h, d, m, C) {
    let { base_: R, assigned_: b } = h, S = h.copy_;
    S.length < R.length && ([R, S] = [S, R], [m, C] = [C, m]);
    const v = h.allIndicesReassigned_ === !0;
    for (let F = 0; F < R.length; F++) {
      const M = S[F], V = R[F];
      if ((v || (b == null ? void 0 : b.get(F.toString()))) && M !== V) {
        const x = M == null ? void 0 : M[pe];
        if (x && x.modified_)
          continue;
        const I = d.concat([F]);
        m.push({
          op: n,
          path: I,
          // Need to maybe clone it, as it can in fact be the original value
          // due to the base/copy inversion at the start of this function
          value: g(M)
        }), C.push({
          op: n,
          path: I,
          value: g(V)
        });
      }
    }
    for (let F = R.length; F < S.length; F++) {
      const M = d.concat([F]);
      m.push({
        op: i,
        path: M,
        // Need to maybe clone it, as it can in fact be the original value
        // due to the base/copy inversion at the start of this function
        value: g(S[F])
      });
    }
    for (let F = S.length - 1; R.length <= F; --F) {
      const M = d.concat([F]);
      C.push({
        op: s,
        path: M
      });
    }
  }
  function c(h, d, m, C) {
    const { base_: R, copy_: b, type_: S } = h;
    _r(h.assigned_, (v, F) => {
      const M = Ke(R, v, S), V = Ke(b, v, S), A = F ? zt(R, v) ? n : i : s;
      if (M === V && A === n)
        return;
      const x = d.concat(v);
      m.push(
        A === s ? { op: A, path: x } : { op: A, path: x, value: g(V) }
      ), C.push(
        A === i ? { op: s, path: x } : A === s ? { op: i, path: x, value: g(M) } : { op: n, path: x, value: g(M) }
      );
    });
  }
  function u(h, d, m, C) {
    let { base_: R, copy_: b } = h, S = 0;
    R.forEach((v) => {
      if (!b.has(v)) {
        const F = d.concat([S]);
        m.push({
          op: s,
          path: F,
          value: v
        }), C.unshift({
          op: i,
          path: F,
          value: v
        });
      }
      S++;
    }), S = 0, b.forEach((v) => {
      if (!R.has(v)) {
        const F = d.concat([S]);
        m.push({
          op: i,
          path: F,
          value: v
        }), C.unshift({
          op: s,
          path: F,
          value: v
        });
      }
      S++;
    });
  }
  function l(h, d, m) {
    const { patches_: C, inversePatches_: R } = m;
    C.push({
      op: n,
      path: [],
      value: d === Zs ? void 0 : d
    }), R.push({
      op: n,
      path: [],
      value: h
    });
  }
  function f(h, d) {
    return d.forEach((m) => {
      const { path: C, op: R } = m;
      let b = h;
      for (let M = 0; M < C.length - 1; M++) {
        const V = Ft(b);
        let A = C[M];
        typeof A != "string" && typeof A != "number" && (A = "" + A), (V === 0 || V === 1) && (A === "__proto__" || A === xr) && be(19), At(b) && A === Mr && be(19), b = Ke(b, A), (b === null || !Kt(b)) && be(18, C.join("/"));
      }
      const S = Ft(b), v = p(m.value), F = C[C.length - 1];
      switch (R) {
        case n:
          switch (S) {
            case 2:
              return b.set(F, v);
            case 3:
              be(16);
            default:
              return b[F] = v;
          }
        case i:
          switch (S) {
            case 1:
              return F === "-" ? b.push(v) : b.splice(F, 0, v);
            case 2:
              return b.set(F, v);
            case 3:
              return b.add(v);
            default:
              return b[F] = v;
          }
        case s:
          switch (S) {
            case 1:
              return b.splice(F, 1);
            case 2:
              return b.delete(F);
            case 3:
              return b.delete(m.value);
            default:
              return delete b[F];
          }
        default:
          be(17, R);
      }
    }), h;
  }
  function p(h) {
    if (!qe(h))
      return h;
    if (Pr(h))
      return h.map(p);
    if (Ur(h))
      return new Map(
        Array.from(h.entries()).map(([m, C]) => [m, p(C)])
      );
    if (Vr(h))
      return new Set(Array.from(h).map(p));
    const d = Object.create(Ot(h));
    for (const m in h)
      d[m] = p(h[m]);
    return zt(h, Sr) && (d[Sr] = h[Sr]), d;
  }
  function g(h) {
    return De(h) ? p(h) : h;
  }
  Vh(Qn, {
    applyPatches_: f,
    generatePatches_: a,
    generateReplacementPatches_: l,
    getPath: t
  });
}
var Or = new Wh(), $r = Or.produce, Hu = /* @__PURE__ */ Or.produceWithPatches.bind(Or), oo = /* @__PURE__ */ Or.applyPatches.bind(Or);
function Gh(e, t = `expected a function, instead received ${typeof e}`) {
  if (typeof e != "function")
    throw new TypeError(t);
}
function Jh(e, t = "expected all items to be functions, instead received the following types: ") {
  if (!e.every((r) => typeof r == "function")) {
    const r = e.map(
      (n) => typeof n == "function" ? `function ${n.name || "unnamed"}()` : typeof n
    ).join(", ");
    throw new TypeError(`${t}[${r}]`);
  }
}
var co = (e) => Array.isArray(e) ? e : [e];
function Zh(e) {
  const t = Array.isArray(e[0]) ? e[0] : e;
  return Jh(
    t,
    "createSelector expects all input-selectors to be functions, but received the following types: "
  ), t;
}
function Xh(e, t) {
  const r = [], { length: n } = e;
  for (let i = 0; i < n; i++)
    r.push(e[i].apply(null, t));
  return r;
}
var ep = class {
  constructor(e) {
    this.value = e;
  }
  deref() {
    return this.value;
  }
}, tp = () => typeof WeakRef > "u" ? ep : WeakRef, Yu = /* @__PURE__ */ tp(), rp = 0, uo = 1;
function tn() {
  return {
    s: rp,
    v: void 0,
    o: null,
    p: null
  };
}
function np(e) {
  return e instanceof Yu ? e.deref() : e;
}
function Bn(e, t = {}) {
  let r = tn();
  const { resultEqualityCheck: n } = t;
  let i, s = 0;
  function a() {
    let o = r;
    const { length: c } = arguments;
    for (let f = 0, p = c; f < p; f++) {
      const g = arguments[f];
      if (typeof g == "function" || typeof g == "object" && g !== null) {
        let h = o.o;
        h === null && (o.o = h = /* @__PURE__ */ new WeakMap());
        const d = h.get(g);
        d === void 0 ? (o = tn(), h.set(g, o)) : o = d;
      } else {
        let h = o.p;
        h === null && (o.p = h = /* @__PURE__ */ new Map());
        const d = h.get(g);
        d === void 0 ? (o = tn(), h.set(g, o)) : o = d;
      }
    }
    const u = o;
    let l;
    if (o.s === uo)
      l = o.v;
    else if (l = e.apply(null, arguments), s++, n) {
      const f = np(i);
      f != null && n(f, l) && (l = f, s !== 0 && s--), i = typeof l == "object" && l !== null || typeof l == "function" ? /* @__PURE__ */ new Yu(l) : l;
    }
    return u.s = uo, u.v = l, l;
  }
  return a.clearCache = () => {
    r = tn(), a.resetResultsCount();
  }, a.resultsCount = () => s, a.resetResultsCount = () => {
    s = 0;
  }, a;
}
function ip(e, ...t) {
  const r = typeof e == "function" ? {
    memoize: e,
    memoizeOptions: t
  } : e, n = (...i) => {
    let s = 0, a = 0, o, c = {}, u = i.pop();
    typeof u == "object" && (c = u, u = i.pop()), Gh(
      u,
      `createSelector expects an output function after the inputs, but received: [${typeof u}]`
    );
    const l = {
      ...r,
      ...c
    }, {
      memoize: f,
      memoizeOptions: p = [],
      argsMemoize: g = Bn,
      argsMemoizeOptions: h = []
    } = l, d = co(p), m = co(h), C = Zh(i), R = f(function() {
      return s++, u.apply(
        null,
        arguments
      );
    }, ...d), b = g(function() {
      a++;
      const v = Xh(
        C,
        arguments
      );
      return o = R.apply(null, v), o;
    }, ...m);
    return Object.assign(b, {
      resultFunc: u,
      memoizedResultFunc: R,
      dependencies: C,
      dependencyRecomputations: () => a,
      resetDependencyRecomputations: () => {
        a = 0;
      },
      lastResult: () => o,
      recomputations: () => s,
      resetRecomputations: () => {
        s = 0;
      },
      memoize: f,
      argsMemoize: g
    });
  };
  return Object.assign(n, {
    withTypes: () => n
  }), n;
}
var fe = /* @__PURE__ */ ip(Bn), sp = (e) => e && typeof e.match == "function";
function w(e, t) {
  function r(...n) {
    if (t) {
      let i = t(...n);
      if (!i)
        throw new Error(Xe(0));
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
      payload: n[0]
    };
  }
  return r.toString = () => `${e}`, r.type = e, r.match = (n) => Uu(n) && n.type === e, r;
}
function lo(e) {
  return qe(e) ? $r(e, () => {
  }) : e;
}
function rn(e, t, r) {
  return e.has(t) ? e.get(t) : e.set(t, r(t)).get(t);
}
var ta = "RTK_autoBatch", dr = () => (e) => ({
  payload: e,
  meta: {
    [ta]: !0
  }
});
function Wu(e) {
  const t = {}, r = [];
  let n;
  const i = {
    addCase(s, a) {
      const o = typeof s == "string" ? s : s.type;
      if (!o)
        throw new Error(Xe(28));
      if (o in t)
        throw new Error(Xe(29));
      return t[o] = a, i;
    },
    addAsyncThunk(s, a) {
      return a.pending && (t[s.pending.type] = a.pending), a.rejected && (t[s.rejected.type] = a.rejected), a.fulfilled && (t[s.fulfilled.type] = a.fulfilled), a.settled && r.push({
        matcher: s.settled,
        reducer: a.settled
      }), i;
    },
    addMatcher(s, a) {
      return r.push({
        matcher: s,
        reducer: a
      }), i;
    },
    addDefaultCase(s) {
      return n = s, i;
    }
  };
  return e(i), [t, r, n];
}
function ap(e) {
  return typeof e == "function";
}
function se(e, t) {
  let [r, n, i] = Wu(t), s;
  if (ap(e))
    s = () => lo(e());
  else {
    const o = lo(e);
    s = () => o;
  }
  function a(o = s(), c) {
    let u = [r[c.type], ...n.filter(({
      matcher: l
    }) => l(c)).map(({
      reducer: l
    }) => l)];
    return u.filter((l) => !!l).length === 0 && (u = [i]), u.reduce((l, f) => {
      if (f)
        if (De(l)) {
          const g = f(l, c);
          return g === void 0 ? l : g;
        } else {
          if (qe(l))
            return $r(l, (p) => f(p, c));
          {
            const p = f(l, c);
            if (p === void 0) {
              if (l === null)
                return l;
              throw Error("A case reducer on a non-draftable value must not return undefined");
            }
            return p;
          }
        }
      return l;
    }, o);
  }
  return a.getInitialState = s, a;
}
var Ku = (e, t) => sp(e) ? e.match(t) : e(t);
function et(...e) {
  return (t) => e.some((r) => Ku(r, t));
}
function wr(...e) {
  return (t) => e.every((r) => Ku(r, t));
}
function oi(e, t) {
  if (!e || !e.meta) return !1;
  const r = typeof e.meta.requestId == "string", n = t.indexOf(e.meta.requestStatus) > -1;
  return r && n;
}
function Lr(e) {
  return typeof e[0] == "function" && "pending" in e[0] && "fulfilled" in e[0] && "rejected" in e[0];
}
function ra(...e) {
  return e.length === 0 ? (t) => oi(t, ["pending"]) : Lr(e) ? et(...e.map((t) => t.pending)) : ra()(e[0]);
}
function Gt(...e) {
  return e.length === 0 ? (t) => oi(t, ["rejected"]) : Lr(e) ? et(...e.map((t) => t.rejected)) : Gt()(e[0]);
}
function ci(...e) {
  const t = (r) => r && r.meta && r.meta.rejectedWithValue;
  return e.length === 0 ? wr(Gt(...e), t) : Lr(e) ? wr(Gt(...e), t) : ci()(e[0]);
}
function pt(...e) {
  return e.length === 0 ? (t) => oi(t, ["fulfilled"]) : Lr(e) ? et(...e.map((t) => t.fulfilled)) : pt()(e[0]);
}
function qs(...e) {
  return e.length === 0 ? (t) => oi(t, ["pending", "fulfilled", "rejected"]) : Lr(e) ? et(...e.flatMap((t) => [t.pending, t.rejected, t.fulfilled])) : qs()(e[0]);
}
var op = "ModuleSymbhasOwnPr-0123456789ABCDEFGHNRVfgctiUvz_KqYTJkLxpZXIjQW", na = (e = 21) => {
  let t = "", r = e;
  for (; r--; )
    t += op[Math.random() * 64 | 0];
  return t;
}, cp = ["name", "message", "stack", "code"], Vi = class {
  constructor(e, t) {
    te(this, "payload");
    te(this, "meta");
    /*
    type-only property to distinguish between RejectWithValue and FulfillWithMeta
    does not exist at runtime
    */
    te(this, "_type");
    this.payload = e, this.meta = t;
  }
}, fo = class {
  constructor(e, t) {
    te(this, "payload");
    te(this, "meta");
    /*
    type-only property to distinguish between RejectWithValue and FulfillWithMeta
    does not exist at runtime
    */
    te(this, "_type");
    this.payload = e, this.meta = t;
  }
}, up = (e) => {
  if (typeof e == "object" && e !== null) {
    const t = {};
    for (const r of cp)
      typeof e[r] == "string" && (t[r] = e[r]);
    return t;
  }
  return {
    message: String(e)
  };
}, ho = "External signal was aborted", ne = /* @__PURE__ */ (() => {
  function e(t, r, n) {
    const i = w(t + "/fulfilled", (c, u, l, f) => ({
      payload: c,
      meta: {
        ...f || {},
        arg: l,
        requestId: u,
        requestStatus: "fulfilled"
      }
    })), s = w(t + "/pending", (c, u, l) => ({
      payload: void 0,
      meta: {
        ...l || {},
        arg: u,
        requestId: c,
        requestStatus: "pending"
      }
    })), a = w(t + "/rejected", (c, u, l, f, p) => ({
      payload: f,
      error: (n && n.serializeError || up)(c || "Rejected"),
      meta: {
        ...p || {},
        arg: l,
        requestId: u,
        rejectedWithValue: !!f,
        requestStatus: "rejected",
        aborted: (c == null ? void 0 : c.name) === "AbortError",
        condition: (c == null ? void 0 : c.name) === "ConditionError"
      }
    }));
    function o(c, {
      signal: u
    } = {}) {
      return (l, f, p) => {
        const g = n != null && n.idGenerator ? n.idGenerator(c) : na(), h = new AbortController();
        let d, m;
        function C(b) {
          m = b, h.abort();
        }
        u && (u.aborted ? C(ho) : u.addEventListener("abort", () => C(ho), {
          once: !0
        }));
        const R = (async function() {
          var v, F;
          let b;
          try {
            let M = (v = n == null ? void 0 : n.condition) == null ? void 0 : v.call(n, c, {
              getState: f,
              extra: p
            });
            if (dp(M) && (M = await M), M === !1 || h.signal.aborted)
              throw {
                name: "ConditionError",
                message: "Aborted due to condition callback returning false."
              };
            const V = new Promise((A, x) => {
              d = () => {
                x({
                  name: "AbortError",
                  message: m || "Aborted"
                });
              }, h.signal.addEventListener("abort", d, {
                once: !0
              });
            });
            l(s(g, c, (F = n == null ? void 0 : n.getPendingMeta) == null ? void 0 : F.call(n, {
              requestId: g,
              arg: c
            }, {
              getState: f,
              extra: p
            }))), b = await Promise.race([V, Promise.resolve(r(c, {
              dispatch: l,
              getState: f,
              extra: p,
              requestId: g,
              signal: h.signal,
              abort: C,
              rejectWithValue: ((A, x) => new Vi(A, x)),
              fulfillWithValue: ((A, x) => new fo(A, x))
            })).then((A) => {
              if (A instanceof Vi)
                throw A;
              return A instanceof fo ? i(A.payload, g, c, A.meta) : i(A, g, c);
            })]);
          } catch (M) {
            b = M instanceof Vi ? a(null, g, c, M.payload, M.meta) : a(M, g, c);
          } finally {
            d && h.signal.removeEventListener("abort", d);
          }
          return n && !n.dispatchConditionRejection && a.match(b) && b.meta.condition || l(b), b;
        })();
        return Object.assign(R, {
          abort: C,
          requestId: g,
          arg: c,
          unwrap() {
            return R.then(lp);
          }
        });
      };
    }
    return Object.assign(o, {
      pending: s,
      rejected: a,
      fulfilled: i,
      settled: et(a, i),
      typePrefix: t
    });
  }
  return e.withTypes = () => e, e;
})();
function lp(e) {
  if (e.meta && e.meta.rejectedWithValue)
    throw e.payload;
  if (e.error)
    throw e.error;
  return e.payload;
}
function dp(e) {
  return e !== null && typeof e == "object" && typeof e.then == "function";
}
var fp = /* @__PURE__ */ Symbol.for("rtk-slice-createasyncthunk");
function hp(e, t) {
  return `${e}/${t}`;
}
function pp({
  creators: e
} = {}) {
  var r;
  const t = (r = e == null ? void 0 : e.asyncThunk) == null ? void 0 : r[fp];
  return function(i) {
    const {
      name: s,
      reducerPath: a = s
    } = i;
    if (!s)
      throw new Error(Xe(11));
    const o = (typeof i.reducers == "function" ? i.reducers(mp()) : i.reducers) || {}, c = Object.keys(o), u = {
      sliceCaseReducersByName: {},
      sliceCaseReducersByType: {},
      actionCreators: {},
      sliceMatchers: []
    }, l = {
      addCase(S, v) {
        const F = typeof S == "string" ? S : S.type;
        if (!F)
          throw new Error(Xe(12));
        if (F in u.sliceCaseReducersByType)
          throw new Error(Xe(13));
        return u.sliceCaseReducersByType[F] = v, l;
      },
      addMatcher(S, v) {
        return u.sliceMatchers.push({
          matcher: S,
          reducer: v
        }), l;
      },
      exposeAction(S, v) {
        return u.actionCreators[S] = v, l;
      },
      exposeCaseReducer(S, v) {
        return u.sliceCaseReducersByName[S] = v, l;
      }
    };
    c.forEach((S) => {
      const v = o[S], F = {
        reducerName: S,
        type: hp(s, S),
        createNotation: typeof i.reducers == "function"
      };
      vp(v) ? wp(F, v, l, t) : yp(F, v, l);
    });
    function f() {
      const [S = {}, v = [], F = void 0] = typeof i.extraReducers == "function" ? Wu(i.extraReducers) : [i.extraReducers], M = {
        ...S,
        ...u.sliceCaseReducersByType
      };
      return se(i.initialState, (V) => {
        for (let A in M)
          V.addCase(A, M[A]);
        for (let A of u.sliceMatchers)
          V.addMatcher(A.matcher, A.reducer);
        for (let A of v)
          V.addMatcher(A.matcher, A.reducer);
        F && V.addDefaultCase(F);
      });
    }
    const p = (S) => S, g = /* @__PURE__ */ new Map(), h = /* @__PURE__ */ new WeakMap();
    let d;
    function m(S, v) {
      return d || (d = f()), d(S, v);
    }
    function C() {
      return d || (d = f()), d.getInitialState();
    }
    function R(S, v = !1) {
      function F(V) {
        let A = V[S];
        return typeof A > "u" && v && (A = rn(h, F, C)), A;
      }
      function M(V = p) {
        const A = rn(g, v, () => /* @__PURE__ */ new WeakMap());
        return rn(A, V, () => {
          const x = {};
          for (const [I, D] of Object.entries(i.selectors ?? {}))
            x[I] = gp(D, V, () => rn(h, V, C), v);
          return x;
        });
      }
      return {
        reducerPath: S,
        getSelectors: M,
        get selectors() {
          return M(F);
        },
        selectSlice: F
      };
    }
    const b = {
      name: s,
      reducer: m,
      actions: u.actionCreators,
      caseReducers: u.sliceCaseReducersByName,
      getInitialState: C,
      ...R(a),
      injectInto(S, {
        reducerPath: v,
        ...F
      } = {}) {
        const M = v ?? a;
        return S.inject({
          reducerPath: M,
          reducer: m
        }, F), {
          ...b,
          ...R(M, !0)
        };
      }
    };
    return b;
  };
}
function gp(e, t, r, n) {
  function i(s, ...a) {
    let o = t(s);
    return typeof o > "u" && n && (o = r()), e(o, ...a);
  }
  return i.unwrapped = e, i;
}
var Vt = /* @__PURE__ */ pp();
function mp() {
  function e(t, r) {
    return {
      _reducerDefinitionType: "asyncThunk",
      payloadCreator: t,
      ...r
    };
  }
  return e.withTypes = () => e, {
    reducer(t) {
      return Object.assign({
        // hack so the wrapping function has the same name as the original
        // we need to create a wrapper so the `reducerDefinitionType` is not assigned to the original
        [t.name](...r) {
          return t(...r);
        }
      }[t.name], {
        _reducerDefinitionType: "reducer"
        /* reducer */
      });
    },
    preparedReducer(t, r) {
      return {
        _reducerDefinitionType: "reducerWithPrepare",
        prepare: t,
        reducer: r
      };
    },
    asyncThunk: e
  };
}
function yp({
  type: e,
  reducerName: t,
  createNotation: r
}, n, i) {
  let s, a;
  if ("reducer" in n) {
    if (r && !Sp(n))
      throw new Error(Xe(17));
    s = n.reducer, a = n.prepare;
  } else
    s = n;
  i.addCase(e, s).exposeCaseReducer(t, s).exposeAction(t, a ? w(e, a) : w(e));
}
function vp(e) {
  return e._reducerDefinitionType === "asyncThunk";
}
function Sp(e) {
  return e._reducerDefinitionType === "reducerWithPrepare";
}
function wp({
  type: e,
  reducerName: t
}, r, n, i) {
  if (!i)
    throw new Error(Xe(18));
  const {
    payloadCreator: s,
    fulfilled: a,
    pending: o,
    rejected: c,
    settled: u,
    options: l
  } = r, f = i(e, s, l);
  n.exposeAction(t, f), a && n.addCase(f.fulfilled, a), o && n.addCase(f.pending, o), c && n.addCase(f.rejected, c), u && n.addMatcher(f.settled, u), n.exposeCaseReducer(t, {
    fulfilled: a || nn,
    pending: o || nn,
    rejected: c || nn,
    settled: u || nn
  });
}
function nn() {
}
function Xe(e) {
  return `Minified Redux Toolkit error #${e}; visit https://redux-toolkit.js.org/Errors?code=${e} for the full message or use the non-minified dev environment for full errors. `;
}
const Gu = (e) => {
  var t;
  return ((t = e.commercePagination) == null ? void 0 : t.principal.perPage) || 0;
}, bp = (e, t) => {
  var r, n;
  return ((n = (r = e.commercePagination) == null ? void 0 : r.recommendations[t]) == null ? void 0 : n.perPage) || 0;
}, Ju = (e) => {
  var t;
  return ((t = e.commercePagination) == null ? void 0 : t.principal.totalEntries) || 0;
}, Cp = (e, t) => {
  var r, n;
  return ((n = (r = e.commercePagination) == null ? void 0 : r.recommendations[t]) == null ? void 0 : n.totalEntries) || 0;
}, Ip = (e) => e.productListing.responseId, Zu = (e) => {
  var t, r;
  return ((t = e.productListing) == null ? void 0 : t.results.length) || ((r = e.productListing) == null ? void 0 : r.products.length) || 0;
}, Ap = fe((e) => ({
  total: Ju(e),
  current: Zu(e)
}), ({ current: e, total: t }) => e < t), { getOwnPropertyNames: xp, getOwnPropertySymbols: kp } = Object, { hasOwnProperty: Rp } = Object.prototype;
function $i(e, t) {
  return function(n, i, s) {
    return e(n, i, s) && t(n, i, s);
  };
}
function sn(e) {
  return function(r, n, i) {
    if (!r || !n || typeof r != "object" || typeof n != "object")
      return e(r, n, i);
    const { cache: s } = i, a = s.get(r), o = s.get(n);
    if (a && o)
      return a === n && o === r;
    s.set(r, n), s.set(n, r);
    const c = e(r, n, i);
    return s.delete(r), s.delete(n), c;
  };
}
function po(e) {
  return xp(e).concat(kp(e));
}
const qp = (
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  Object.hasOwn || ((e, t) => Rp.call(e, t))
), Op = "__v", Fp = "__o", Ep = "_owner", { getOwnPropertyDescriptor: go, keys: mo } = Object, _t = (
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  Object.is || function(t, r) {
    return t === r ? t !== 0 || 1 / t === 1 / r : t !== t && r !== r;
  }
);
function Dp(e, t) {
  return e === t;
}
function Tp(e, t) {
  return e.byteLength === t.byteLength && Hn(new Uint8Array(e), new Uint8Array(t));
}
function Mp(e, t, r) {
  let n = e.length;
  if (t.length !== n)
    return !1;
  for (; n-- > 0; )
    if (!r.equals(e[n], t[n], n, n, e, t, r))
      return !1;
  return !0;
}
function _p(e, t) {
  return e.byteLength === t.byteLength && Hn(new Uint8Array(e.buffer, e.byteOffset, e.byteLength), new Uint8Array(t.buffer, t.byteOffset, t.byteLength));
}
function Pp(e, t) {
  return _t(e.getTime(), t.getTime());
}
function Up(e, t) {
  return e.name === t.name && e.message === t.message && e.cause === t.cause && e.stack === t.stack;
}
function yo(e, t, r) {
  const n = e.size;
  if (n !== t.size)
    return !1;
  if (!n)
    return !0;
  const i = new Array(n), s = e.entries();
  let a, o, c = 0;
  for (; (a = s.next()) && !a.done; ) {
    const u = t.entries();
    let l = !1, f = 0;
    for (; (o = u.next()) && !o.done; ) {
      if (i[f]) {
        f++;
        continue;
      }
      const p = a.value, g = o.value;
      if (r.equals(p[0], g[0], c, f, e, t, r) && r.equals(p[1], g[1], p[0], g[0], e, t, r)) {
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
function Vp(e, t, r) {
  const n = mo(e);
  let i = n.length;
  if (mo(t).length !== i)
    return !1;
  for (; i-- > 0; )
    if (!Xu(e, t, r, n[i]))
      return !1;
  return !0;
}
function fr(e, t, r) {
  const n = po(e);
  let i = n.length;
  if (po(t).length !== i)
    return !1;
  let s, a, o;
  for (; i-- > 0; )
    if (s = n[i], !Xu(e, t, r, s) || (a = go(e, s), o = go(t, s), (a || o) && (!a || !o || a.configurable !== o.configurable || a.enumerable !== o.enumerable || a.writable !== o.writable)))
      return !1;
  return !0;
}
function $p(e, t) {
  return _t(e.valueOf(), t.valueOf());
}
function Lp(e, t) {
  return e.source === t.source && e.flags === t.flags;
}
function vo(e, t, r) {
  const n = e.size;
  if (n !== t.size)
    return !1;
  if (!n)
    return !0;
  const i = new Array(n), s = e.values();
  let a, o;
  for (; (a = s.next()) && !a.done; ) {
    const c = t.values();
    let u = !1, l = 0;
    for (; (o = c.next()) && !o.done; ) {
      if (!i[l] && r.equals(a.value, o.value, a.value, o.value, e, t, r)) {
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
function Hn(e, t) {
  let r = e.byteLength;
  if (t.byteLength !== r || e.byteOffset !== t.byteOffset)
    return !1;
  for (; r-- > 0; )
    if (e[r] !== t[r])
      return !1;
  return !0;
}
function Qp(e, t) {
  return e.hostname === t.hostname && e.pathname === t.pathname && e.protocol === t.protocol && e.port === t.port && e.hash === t.hash && e.username === t.username && e.password === t.password;
}
function Xu(e, t, r, n) {
  return (n === Ep || n === Fp || n === Op) && (e.$$typeof || t.$$typeof) ? !0 : qp(t, n) && r.equals(e[n], t[n], n, n, e, t, r);
}
const jp = Object.prototype.toString;
function Np(e) {
  const t = Yp(e), { areArraysEqual: r, areDatesEqual: n, areFunctionsEqual: i, areMapsEqual: s, areNumbersEqual: a, areObjectsEqual: o, areRegExpsEqual: c, areSetsEqual: u, getUnsupportedCustomComparator: l } = e;
  return function(p, g, h) {
    if (p === g)
      return !0;
    if (p == null || g == null)
      return !1;
    const d = typeof p;
    if (d !== typeof g)
      return !1;
    if (d !== "object")
      return d === "number" || d === "bigint" ? a(p, g, h) : d === "function" ? i(p, g, h) : !1;
    const m = p.constructor;
    if (m !== g.constructor)
      return !1;
    if (m === Object)
      return o(p, g, h);
    if (m === Array)
      return r(p, g, h);
    if (m === Date)
      return n(p, g, h);
    if (m === RegExp)
      return c(p, g, h);
    if (m === Map)
      return s(p, g, h);
    if (m === Set)
      return u(p, g, h);
    if (m === Promise)
      return !1;
    if (Array.isArray(p))
      return r(p, g, h);
    const C = jp.call(p), R = t[C];
    if (R)
      return R(p, g, h);
    const b = l && l(p, g, h, C);
    return b ? b(p, g, h) : !1;
  };
}
function zp({ circular: e, createCustomConfig: t, strict: r }) {
  let n = {
    areArrayBuffersEqual: Tp,
    areArraysEqual: r ? fr : Mp,
    areDataViewsEqual: _p,
    areDatesEqual: Pp,
    areErrorsEqual: Up,
    areFunctionsEqual: Dp,
    areMapsEqual: r ? $i(yo, fr) : yo,
    areNumbersEqual: _t,
    areObjectsEqual: r ? fr : Vp,
    arePrimitiveWrappersEqual: $p,
    areRegExpsEqual: Lp,
    areSetsEqual: r ? $i(vo, fr) : vo,
    areTypedArraysEqual: r ? $i(Hn, fr) : Hn,
    areUrlsEqual: Qp,
    getUnsupportedCustomComparator: void 0
  };
  if (t && (n = Object.assign({}, n, t(n))), e) {
    const i = sn(n.areArraysEqual), s = sn(n.areMapsEqual), a = sn(n.areObjectsEqual), o = sn(n.areSetsEqual);
    n = Object.assign({}, n, {
      areArraysEqual: i,
      areMapsEqual: s,
      areObjectsEqual: a,
      areSetsEqual: o
    });
  }
  return n;
}
function Bp(e) {
  return function(t, r, n, i, s, a, o) {
    return e(t, r, o);
  };
}
function Hp({ circular: e, comparator: t, createState: r, equals: n, strict: i }) {
  if (r)
    return function(o, c) {
      const { cache: u = e ? /* @__PURE__ */ new WeakMap() : void 0, meta: l } = r();
      return t(o, c, {
        cache: u,
        equals: n,
        meta: l,
        strict: i
      });
    };
  if (e)
    return function(o, c) {
      return t(o, c, {
        cache: /* @__PURE__ */ new WeakMap(),
        equals: n,
        meta: void 0,
        strict: i
      });
    };
  const s = {
    cache: void 0,
    equals: n,
    meta: void 0,
    strict: i
  };
  return function(o, c) {
    return t(o, c, s);
  };
}
function Yp({ areArrayBuffersEqual: e, areArraysEqual: t, areDataViewsEqual: r, areDatesEqual: n, areErrorsEqual: i, areFunctionsEqual: s, areMapsEqual: a, areNumbersEqual: o, areObjectsEqual: c, arePrimitiveWrappersEqual: u, areRegExpsEqual: l, areSetsEqual: f, areTypedArraysEqual: p, areUrlsEqual: g }) {
  return {
    "[object Arguments]": c,
    "[object Array]": t,
    "[object ArrayBuffer]": e,
    "[object AsyncGeneratorFunction]": s,
    "[object BigInt]": o,
    "[object BigInt64Array]": p,
    "[object BigUint64Array]": p,
    "[object Boolean]": u,
    "[object DataView]": r,
    "[object Date]": n,
    // If an error tag, it should be tested explicitly. Like RegExp, the properties are not
    // enumerable, and therefore will give false positives if tested like a standard object.
    "[object Error]": i,
    "[object Float16Array]": p,
    "[object Float32Array]": p,
    "[object Float64Array]": p,
    "[object Function]": s,
    "[object GeneratorFunction]": s,
    "[object Int8Array]": p,
    "[object Int16Array]": p,
    "[object Int32Array]": p,
    "[object Map]": a,
    "[object Number]": u,
    "[object Object]": (h, d, m) => (
      // The exception for value comparison is custom `Promise`-like class instances. These should
      // be treated the same as standard `Promise` objects, which means strict equality, and if
      // it reaches this point then that strict equality comparison has already failed.
      typeof h.then != "function" && typeof d.then != "function" && c(h, d, m)
    ),
    // For RegExp, the properties are not enumerable, and therefore will give false positives if
    // tested like a standard object.
    "[object RegExp]": l,
    "[object Set]": f,
    "[object String]": u,
    "[object URL]": g,
    "[object Uint8Array]": p,
    "[object Uint8ClampedArray]": p,
    "[object Uint16Array]": p,
    "[object Uint32Array]": p
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
  createInternalComparator: () => _t
});
rt({
  strict: !0,
  createInternalComparator: () => _t
});
rt({
  circular: !0,
  createInternalComparator: () => _t
});
rt({
  circular: !0,
  createInternalComparator: () => _t,
  strict: !0
});
function rt(e = {}) {
  const { circular: t = !1, createInternalComparator: r, createState: n, strict: i = !1 } = e, s = zp(e), a = Np(s), o = r ? r(a) : Bp(a);
  return Hp({ circular: t, comparator: a, createState: n, equals: o, strict: i });
}
function Wp(e, t) {
  return e.length !== t.length ? !1 : e.every((r) => t.findIndex((n) => Kp(r, n)) !== -1);
}
const Kp = rt({
  createCustomConfig: (e) => ({
    ...e,
    areArraysEqual: Wp
  })
});
function Gp(e) {
  const { activeValue: t, ancestryMap: r } = Jp(e);
  return t ? Zp(t, r) : [];
}
function Jp(e) {
  const t = [...e], r = /* @__PURE__ */ new Map();
  for (; t.length > 0; ) {
    const n = t.shift();
    if (n.state === "selected")
      return { activeValue: n, ancestryMap: r };
    if (r)
      for (const i of n.children)
        r.set(i, n);
    t.unshift(...n.children);
  }
  return {};
}
function Zp(e, t) {
  const r = [];
  if (!e)
    return [];
  let n = e;
  do
    r.unshift(n), n = t.get(n);
  while (n);
  return r;
}
function Xp() {
  return {
    principal: ui(),
    recommendations: {}
  };
}
function ui() {
  return {
    page: 0,
    perPage: 0,
    totalEntries: 0,
    totalPages: 0
  };
}
var Le;
(function(e) {
  e.Relevance = "relevance", e.Fields = "fields";
})(Le || (Le = {}));
var Os;
(function(e) {
  e.Ascending = "asc", e.Descending = "desc";
})(Os || (Os = {}));
const Fs = () => ({
  by: Le.Relevance
});
new z({
  options: {
    required: !1
  },
  values: {
    by: new Ar({ enum: Le, required: !0 }),
    fields: new oe({
      each: new z({
        values: {
          field: new Q({ required: !0 }),
          direction: new Ar({ enum: Os }),
          displayName: new Q()
        }
      })
    })
  }
});
function xn() {
  return {
    appliedSort: Fs(),
    availableSorts: [Fs()]
  };
}
const eg = () => ({
  query: ""
}), tg = (e) => e.commerceSearch.responseId, el = (e) => {
  var t, r;
  return ((t = e.commerceSearch) == null ? void 0 : t.results.length) || ((r = e.commerceSearch) == null ? void 0 : r.products.length) || 0;
}, rg = fe((e) => ({
  total: Ju(e),
  current: el(e)
}), ({ current: e, total: t }) => e < t), ia = (e) => {
  var t;
  return ((t = e.commerceQuery) == null ? void 0 : t.query) ?? "";
}, ng = (e, t) => {
  var r;
  return X((r = t.queryCorrection) == null ? void 0 : r.correctedQuery) ? ia(e) : t.queryCorrection.correctedQuery;
};
var So;
(function(e) {
  e.responseIdSelector = tl(tg);
})(So || (So = {}));
var wo;
(function(e) {
  e.responseIdSelector = tl(Ip);
})(wo || (wo = {}));
function tl(e) {
  return (t) => e(t[Ih]);
}
function rl(e) {
  if (typeof e != "object" || !e)
    return e;
  try {
    return JSON.parse(JSON.stringify(e));
  } catch {
    return e;
  }
}
function Qr(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var at = {}, $t = {}, bo;
function ig() {
  if (bo) return $t;
  bo = 1;
  var e = $t && $t.__assign || function() {
    return e = Object.assign || function(n) {
      for (var i, s = 1, a = arguments.length; s < a; s++) {
        i = arguments[s];
        for (var o in i) Object.prototype.hasOwnProperty.call(i, o) && (n[o] = i[o]);
      }
      return n;
    }, e.apply(this, arguments);
  };
  Object.defineProperty($t, "__esModule", { value: !0 });
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
  function r(n) {
    var i = e(e({}, t), n);
    return i.numOfAttempts < 1 && (i.numOfAttempts = 1), i;
  }
  return $t.getSanitizedOptions = r, $t;
}
var an = {}, Ve = {}, on = {}, cn = {}, un = {}, Co;
function sg() {
  if (Co) return un;
  Co = 1, Object.defineProperty(un, "__esModule", { value: !0 });
  function e(t) {
    var r = Math.random() * t;
    return Math.round(r);
  }
  return un.fullJitter = e, un;
}
var ln = {}, Io;
function ag() {
  if (Io) return ln;
  Io = 1, Object.defineProperty(ln, "__esModule", { value: !0 });
  function e(t) {
    return t;
  }
  return ln.noJitter = e, ln;
}
var Ao;
function og() {
  if (Ao) return cn;
  Ao = 1, Object.defineProperty(cn, "__esModule", { value: !0 });
  var e = sg(), t = ag();
  function r(n) {
    switch (n.jitter) {
      case "full":
        return e.fullJitter;
      case "none":
      default:
        return t.noJitter;
    }
  }
  return cn.JitterFactory = r, cn;
}
var xo;
function nl() {
  if (xo) return on;
  xo = 1, Object.defineProperty(on, "__esModule", { value: !0 });
  var e = og(), t = (
    /** @class */
    (function() {
      function r(n) {
        this.options = n, this.attempt = 0;
      }
      return r.prototype.apply = function() {
        var n = this;
        return new Promise(function(i) {
          return setTimeout(i, n.jitteredDelay);
        });
      }, r.prototype.setAttemptNumber = function(n) {
        this.attempt = n;
      }, Object.defineProperty(r.prototype, "jitteredDelay", {
        get: function() {
          var n = e.JitterFactory(this.options);
          return n(this.delay);
        },
        enumerable: !0,
        configurable: !0
      }), Object.defineProperty(r.prototype, "delay", {
        get: function() {
          var n = this.options.startingDelay, i = this.options.timeMultiple, s = this.numOfDelayedAttempts, a = n * Math.pow(i, s);
          return Math.min(a, this.options.maxDelay);
        },
        enumerable: !0,
        configurable: !0
      }), Object.defineProperty(r.prototype, "numOfDelayedAttempts", {
        get: function() {
          return this.attempt;
        },
        enumerable: !0,
        configurable: !0
      }), r;
    })()
  );
  return on.Delay = t, on;
}
var ko;
function cg() {
  if (ko) return Ve;
  ko = 1;
  var e = Ve && Ve.__extends || /* @__PURE__ */ (function() {
    var s = function(a, o) {
      return s = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(c, u) {
        c.__proto__ = u;
      } || function(c, u) {
        for (var l in u) u.hasOwnProperty(l) && (c[l] = u[l]);
      }, s(a, o);
    };
    return function(a, o) {
      s(a, o);
      function c() {
        this.constructor = a;
      }
      a.prototype = o === null ? Object.create(o) : (c.prototype = o.prototype, new c());
    };
  })(), t = Ve && Ve.__awaiter || function(s, a, o, c) {
    function u(l) {
      return l instanceof o ? l : new o(function(f) {
        f(l);
      });
    }
    return new (o || (o = Promise))(function(l, f) {
      function p(d) {
        try {
          h(c.next(d));
        } catch (m) {
          f(m);
        }
      }
      function g(d) {
        try {
          h(c.throw(d));
        } catch (m) {
          f(m);
        }
      }
      function h(d) {
        d.done ? l(d.value) : u(d.value).then(p, g);
      }
      h((c = c.apply(s, a || [])).next());
    });
  }, r = Ve && Ve.__generator || function(s, a) {
    var o = { label: 0, sent: function() {
      if (l[0] & 1) throw l[1];
      return l[1];
    }, trys: [], ops: [] }, c, u, l, f;
    return f = { next: p(0), throw: p(1), return: p(2) }, typeof Symbol == "function" && (f[Symbol.iterator] = function() {
      return this;
    }), f;
    function p(h) {
      return function(d) {
        return g([h, d]);
      };
    }
    function g(h) {
      if (c) throw new TypeError("Generator is already executing.");
      for (; o; ) try {
        if (c = 1, u && (l = h[0] & 2 ? u.return : h[0] ? u.throw || ((l = u.return) && l.call(u), 0) : u.next) && !(l = l.call(u, h[1])).done) return l;
        switch (u = 0, l && (h = [h[0] & 2, l.value]), h[0]) {
          case 0:
          case 1:
            l = h;
            break;
          case 4:
            return o.label++, { value: h[1], done: !1 };
          case 5:
            o.label++, u = h[1], h = [0];
            continue;
          case 7:
            h = o.ops.pop(), o.trys.pop();
            continue;
          default:
            if (l = o.trys, !(l = l.length > 0 && l[l.length - 1]) && (h[0] === 6 || h[0] === 2)) {
              o = 0;
              continue;
            }
            if (h[0] === 3 && (!l || h[1] > l[0] && h[1] < l[3])) {
              o.label = h[1];
              break;
            }
            if (h[0] === 6 && o.label < l[1]) {
              o.label = l[1], l = h;
              break;
            }
            if (l && o.label < l[2]) {
              o.label = l[2], o.ops.push(h);
              break;
            }
            l[2] && o.ops.pop(), o.trys.pop();
            continue;
        }
        h = a.call(s, o);
      } catch (d) {
        h = [6, d], u = 0;
      } finally {
        c = l = 0;
      }
      if (h[0] & 5) throw h[1];
      return { value: h[0] ? h[1] : void 0, done: !0 };
    }
  };
  Object.defineProperty(Ve, "__esModule", { value: !0 });
  var n = nl(), i = (
    /** @class */
    (function(s) {
      e(a, s);
      function a() {
        return s !== null && s.apply(this, arguments) || this;
      }
      return a.prototype.apply = function() {
        return t(this, void 0, void 0, function() {
          return r(this, function(o) {
            return [2, this.isFirstAttempt ? !0 : s.prototype.apply.call(this)];
          });
        });
      }, Object.defineProperty(a.prototype, "isFirstAttempt", {
        get: function() {
          return this.attempt === 0;
        },
        enumerable: !0,
        configurable: !0
      }), Object.defineProperty(a.prototype, "numOfDelayedAttempts", {
        get: function() {
          return this.attempt - 1;
        },
        enumerable: !0,
        configurable: !0
      }), a;
    })(n.Delay)
  );
  return Ve.SkipFirstDelay = i, Ve;
}
var Lt = {}, Ro;
function ug() {
  if (Ro) return Lt;
  Ro = 1;
  var e = Lt && Lt.__extends || /* @__PURE__ */ (function() {
    var n = function(i, s) {
      return n = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(a, o) {
        a.__proto__ = o;
      } || function(a, o) {
        for (var c in o) o.hasOwnProperty(c) && (a[c] = o[c]);
      }, n(i, s);
    };
    return function(i, s) {
      n(i, s);
      function a() {
        this.constructor = i;
      }
      i.prototype = s === null ? Object.create(s) : (a.prototype = s.prototype, new a());
    };
  })();
  Object.defineProperty(Lt, "__esModule", { value: !0 });
  var t = nl(), r = (
    /** @class */
    (function(n) {
      e(i, n);
      function i() {
        return n !== null && n.apply(this, arguments) || this;
      }
      return i;
    })(t.Delay)
  );
  return Lt.AlwaysDelay = r, Lt;
}
var qo;
function lg() {
  if (qo) return an;
  qo = 1, Object.defineProperty(an, "__esModule", { value: !0 });
  var e = cg(), t = ug();
  function r(i, s) {
    var a = n(i);
    return a.setAttemptNumber(s), a;
  }
  an.DelayFactory = r;
  function n(i) {
    return i.delayFirstAttempt ? new t.AlwaysDelay(i) : new e.SkipFirstDelay(i);
  }
  return an;
}
var Oo;
function dg() {
  if (Oo) return at;
  Oo = 1;
  var e = at && at.__awaiter || function(a, o, c, u) {
    function l(f) {
      return f instanceof c ? f : new c(function(p) {
        p(f);
      });
    }
    return new (c || (c = Promise))(function(f, p) {
      function g(m) {
        try {
          d(u.next(m));
        } catch (C) {
          p(C);
        }
      }
      function h(m) {
        try {
          d(u.throw(m));
        } catch (C) {
          p(C);
        }
      }
      function d(m) {
        m.done ? f(m.value) : l(m.value).then(g, h);
      }
      d((u = u.apply(a, o || [])).next());
    });
  }, t = at && at.__generator || function(a, o) {
    var c = { label: 0, sent: function() {
      if (f[0] & 1) throw f[1];
      return f[1];
    }, trys: [], ops: [] }, u, l, f, p;
    return p = { next: g(0), throw: g(1), return: g(2) }, typeof Symbol == "function" && (p[Symbol.iterator] = function() {
      return this;
    }), p;
    function g(d) {
      return function(m) {
        return h([d, m]);
      };
    }
    function h(d) {
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
        d = o.call(a, c);
      } catch (m) {
        d = [6, m], l = 0;
      } finally {
        u = f = 0;
      }
      if (d[0] & 5) throw d[1];
      return { value: d[0] ? d[1] : void 0, done: !0 };
    }
  };
  Object.defineProperty(at, "__esModule", { value: !0 });
  var r = ig(), n = lg();
  function i(a, o) {
    return o === void 0 && (o = {}), e(this, void 0, void 0, function() {
      var c, u;
      return t(this, function(l) {
        switch (l.label) {
          case 0:
            return c = r.getSanitizedOptions(o), u = new s(a, c), [4, u.execute()];
          case 1:
            return [2, l.sent()];
        }
      });
    });
  }
  at.backOff = i;
  var s = (
    /** @class */
    (function() {
      function a(o, c) {
        this.request = o, this.options = c, this.attemptNumber = 0;
      }
      return a.prototype.execute = function() {
        return e(this, void 0, void 0, function() {
          var o, c;
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
                return o = u.sent(), this.attemptNumber++, [4, this.options.retry(o, this.attemptNumber)];
              case 5:
                if (c = u.sent(), !c || this.attemptLimitReached)
                  throw o;
                return [3, 6];
              case 6:
                return [3, 0];
              case 7:
                throw new Error("Something went wrong.");
            }
          });
        });
      }, Object.defineProperty(a.prototype, "attemptLimitReached", {
        get: function() {
          return this.attemptNumber >= this.options.numOfAttempts;
        },
        enumerable: !0,
        configurable: !0
      }), a.prototype.applyDelay = function() {
        return e(this, void 0, void 0, function() {
          var o;
          return t(this, function(c) {
            switch (c.label) {
              case 0:
                return o = n.DelayFactory(this.options, this.attemptNumber), [4, o.apply()];
              case 1:
                return c.sent(), [
                  2
                  /*return*/
                ];
            }
          });
        });
      }, a;
    })()
  );
  return at;
}
dg();
function jr(e, t = "prod", r = "platform") {
  const n = t === "prod" ? "" : t, i = r === "platform" ? "" : `.${r}`;
  return `https://${e}${i}.org${n}.coveo.com`;
}
function sa(e, t, r = "prod") {
  return e ?? jr(t, r);
}
function ir(e, t = "prod") {
  return `${jr(e, t)}/rest/search/v2`;
}
function fg(e, t = "prod") {
  return `${jr(e, t, "analytics")}/rest/organizations/${e}/events/v1`;
}
const Qe = (e) => e.error !== void 0;
function hg(e, t = "prod") {
  return `${jr(e, t)}/rest/organizations/${e}/commerce/v2`;
}
var Te;
(function(e) {
  e.CHILD_PRODUCT = "childProduct", e.PRODUCT = "product", e.SPOTLIGHT = "spotlight";
})(Te || (Te = {}));
var kn = { exports: {} }, pg = kn.exports, Fo;
function gg() {
  return Fo || (Fo = 1, (function(e, t) {
    (function(r, n) {
      e.exports = n();
    })(pg, (function() {
      var r = 1e3, n = 6e4, i = 36e5, s = "millisecond", a = "second", o = "minute", c = "hour", u = "day", l = "week", f = "month", p = "quarter", g = "year", h = "date", d = "Invalid Date", m = /^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/, C = /\[([^\]]+)]|YYYY|YY|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g, R = { name: "en", weekdays: "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"), months: "January_February_March_April_May_June_July_August_September_October_November_December".split("_"), ordinal: function(E) {
        var U = ["th", "st", "nd", "rd"], y = E % 100;
        return "[" + E + (U[(y - 20) % 10] || U[y] || U[0]) + "]";
      } }, b = function(E, U, y) {
        var O = String(E);
        return !O || O.length >= U ? E : "" + Array(U + 1 - O.length).join(y) + E;
      }, S = { s: b, z: function(E) {
        var U = -E.utcOffset(), y = Math.abs(U), O = Math.floor(y / 60), k = y % 60;
        return (U <= 0 ? "+" : "-") + b(O, 2, "0") + ":" + b(k, 2, "0");
      }, m: function E(U, y) {
        if (U.date() < y.date()) return -E(y, U);
        var O = 12 * (y.year() - U.year()) + (y.month() - U.month()), k = U.clone().add(O, f), T = y - k < 0, L = U.clone().add(O + (T ? -1 : 1), f);
        return +(-(O + (y - k) / (T ? k - L : L - k)) || 0);
      }, a: function(E) {
        return E < 0 ? Math.ceil(E) || 0 : Math.floor(E);
      }, p: function(E) {
        return { M: f, y: g, w: l, d: u, D: h, h: c, m: o, s: a, ms: s, Q: p }[E] || String(E || "").toLowerCase().replace(/s$/, "");
      }, u: function(E) {
        return E === void 0;
      } }, v = "en", F = {};
      F[v] = R;
      var M = "$isDayjsObject", V = function(E) {
        return E instanceof D || !(!E || !E[M]);
      }, A = function E(U, y, O) {
        var k;
        if (!U) return v;
        if (typeof U == "string") {
          var T = U.toLowerCase();
          F[T] && (k = T), y && (F[T] = y, k = T);
          var L = U.split("-");
          if (!k && L.length > 1) return E(L[0]);
        } else {
          var N = U.name;
          F[N] = U, k = N;
        }
        return !O && k && (v = k), k || !O && v;
      }, x = function(E, U) {
        if (V(E)) return E.clone();
        var y = typeof U == "object" ? U : {};
        return y.date = E, y.args = arguments, new D(y);
      }, I = S;
      I.l = A, I.i = V, I.w = function(E, U) {
        return x(E, { locale: U.$L, utc: U.$u, x: U.$x, $offset: U.$offset });
      };
      var D = (function() {
        function E(y) {
          this.$L = A(y.locale, null, !0), this.parse(y), this.$x = this.$x || y.x || {}, this[M] = !0;
        }
        var U = E.prototype;
        return U.parse = function(y) {
          this.$d = (function(O) {
            var k = O.date, T = O.utc;
            if (k === null) return /* @__PURE__ */ new Date(NaN);
            if (I.u(k)) return /* @__PURE__ */ new Date();
            if (k instanceof Date) return new Date(k);
            if (typeof k == "string" && !/Z$/i.test(k)) {
              var L = k.match(m);
              if (L) {
                var N = L[2] - 1 || 0, G = (L[7] || "0").substring(0, 3);
                return T ? new Date(Date.UTC(L[1], N, L[3] || 1, L[4] || 0, L[5] || 0, L[6] || 0, G)) : new Date(L[1], N, L[3] || 1, L[4] || 0, L[5] || 0, L[6] || 0, G);
              }
            }
            return new Date(k);
          })(y), this.init();
        }, U.init = function() {
          var y = this.$d;
          this.$y = y.getFullYear(), this.$M = y.getMonth(), this.$D = y.getDate(), this.$W = y.getDay(), this.$H = y.getHours(), this.$m = y.getMinutes(), this.$s = y.getSeconds(), this.$ms = y.getMilliseconds();
        }, U.$utils = function() {
          return I;
        }, U.isValid = function() {
          return this.$d.toString() !== d;
        }, U.isSame = function(y, O) {
          var k = x(y);
          return this.startOf(O) <= k && k <= this.endOf(O);
        }, U.isAfter = function(y, O) {
          return x(y) < this.startOf(O);
        }, U.isBefore = function(y, O) {
          return this.endOf(O) < x(y);
        }, U.$g = function(y, O, k) {
          return I.u(y) ? this[O] : this.set(k, y);
        }, U.unix = function() {
          return Math.floor(this.valueOf() / 1e3);
        }, U.valueOf = function() {
          return this.$d.getTime();
        }, U.startOf = function(y, O) {
          var k = this, T = !!I.u(O) || O, L = I.p(y), N = function(le, ce) {
            var K = I.w(k.$u ? Date.UTC(k.$y, ce, le) : new Date(k.$y, ce, le), k);
            return T ? K : K.endOf(u);
          }, G = function(le, ce) {
            return I.w(k.toDate()[le].apply(k.toDate("s"), (T ? [0, 0, 0, 0] : [23, 59, 59, 999]).slice(ce)), k);
          }, Y = this.$W, re = this.$M, B = this.$D, Z = "set" + (this.$u ? "UTC" : "");
          switch (L) {
            case g:
              return T ? N(1, 0) : N(31, 11);
            case f:
              return T ? N(1, re) : N(0, re + 1);
            case l:
              var H = this.$locale().weekStart || 0, J = (Y < H ? Y + 7 : Y) - H;
              return N(T ? B - J : B + (6 - J), re);
            case u:
            case h:
              return G(Z + "Hours", 0);
            case c:
              return G(Z + "Minutes", 1);
            case o:
              return G(Z + "Seconds", 2);
            case a:
              return G(Z + "Milliseconds", 3);
            default:
              return this.clone();
          }
        }, U.endOf = function(y) {
          return this.startOf(y, !1);
        }, U.$set = function(y, O) {
          var k, T = I.p(y), L = "set" + (this.$u ? "UTC" : ""), N = (k = {}, k[u] = L + "Date", k[h] = L + "Date", k[f] = L + "Month", k[g] = L + "FullYear", k[c] = L + "Hours", k[o] = L + "Minutes", k[a] = L + "Seconds", k[s] = L + "Milliseconds", k)[T], G = T === u ? this.$D + (O - this.$W) : O;
          if (T === f || T === g) {
            var Y = this.clone().set(h, 1);
            Y.$d[N](G), Y.init(), this.$d = Y.set(h, Math.min(this.$D, Y.daysInMonth())).$d;
          } else N && this.$d[N](G);
          return this.init(), this;
        }, U.set = function(y, O) {
          return this.clone().$set(y, O);
        }, U.get = function(y) {
          return this[I.p(y)]();
        }, U.add = function(y, O) {
          var k, T = this;
          y = Number(y);
          var L = I.p(O), N = function(re) {
            var B = x(T);
            return I.w(B.date(B.date() + Math.round(re * y)), T);
          };
          if (L === f) return this.set(f, this.$M + y);
          if (L === g) return this.set(g, this.$y + y);
          if (L === u) return N(1);
          if (L === l) return N(7);
          var G = (k = {}, k[o] = n, k[c] = i, k[a] = r, k)[L] || 1, Y = this.$d.getTime() + y * G;
          return I.w(Y, this);
        }, U.subtract = function(y, O) {
          return this.add(-1 * y, O);
        }, U.format = function(y) {
          var O = this, k = this.$locale();
          if (!this.isValid()) return k.invalidDate || d;
          var T = y || "YYYY-MM-DDTHH:mm:ssZ", L = I.z(this), N = this.$H, G = this.$m, Y = this.$M, re = k.weekdays, B = k.months, Z = k.meridiem, H = function(ce, K, ee, de) {
            return ce && (ce[K] || ce(O, T)) || ee[K].slice(0, de);
          }, J = function(ce) {
            return I.s(N % 12 || 12, ce, "0");
          }, le = Z || function(ce, K, ee) {
            var de = ce < 12 ? "AM" : "PM";
            return ee ? de.toLowerCase() : de;
          };
          return T.replace(C, (function(ce, K) {
            return K || (function(ee) {
              switch (ee) {
                case "YY":
                  return String(O.$y).slice(-2);
                case "YYYY":
                  return I.s(O.$y, 4, "0");
                case "M":
                  return Y + 1;
                case "MM":
                  return I.s(Y + 1, 2, "0");
                case "MMM":
                  return H(k.monthsShort, Y, B, 3);
                case "MMMM":
                  return H(B, Y);
                case "D":
                  return O.$D;
                case "DD":
                  return I.s(O.$D, 2, "0");
                case "d":
                  return String(O.$W);
                case "dd":
                  return H(k.weekdaysMin, O.$W, re, 2);
                case "ddd":
                  return H(k.weekdaysShort, O.$W, re, 3);
                case "dddd":
                  return re[O.$W];
                case "H":
                  return String(N);
                case "HH":
                  return I.s(N, 2, "0");
                case "h":
                  return J(1);
                case "hh":
                  return J(2);
                case "a":
                  return le(N, G, !0);
                case "A":
                  return le(N, G, !1);
                case "m":
                  return String(G);
                case "mm":
                  return I.s(G, 2, "0");
                case "s":
                  return String(O.$s);
                case "ss":
                  return I.s(O.$s, 2, "0");
                case "SSS":
                  return I.s(O.$ms, 3, "0");
                case "Z":
                  return L;
              }
              return null;
            })(ce) || L.replace(":", "");
          }));
        }, U.utcOffset = function() {
          return 15 * -Math.round(this.$d.getTimezoneOffset() / 15);
        }, U.diff = function(y, O, k) {
          var T, L = this, N = I.p(O), G = x(y), Y = (G.utcOffset() - this.utcOffset()) * n, re = this - G, B = function() {
            return I.m(L, G);
          };
          switch (N) {
            case g:
              T = B() / 12;
              break;
            case f:
              T = B();
              break;
            case p:
              T = B() / 3;
              break;
            case l:
              T = (re - Y) / 6048e5;
              break;
            case u:
              T = (re - Y) / 864e5;
              break;
            case c:
              T = re / i;
              break;
            case o:
              T = re / n;
              break;
            case a:
              T = re / r;
              break;
            default:
              T = re;
          }
          return k ? T : I.a(T);
        }, U.daysInMonth = function() {
          return this.endOf(f).$D;
        }, U.$locale = function() {
          return F[this.$L];
        }, U.locale = function(y, O) {
          if (!y) return this.$L;
          var k = this.clone(), T = A(y, O, !0);
          return T && (k.$L = T), k;
        }, U.clone = function() {
          return I.w(this.$d, this);
        }, U.toDate = function() {
          return new Date(this.valueOf());
        }, U.toJSON = function() {
          return this.isValid() ? this.toISOString() : null;
        }, U.toISOString = function() {
          return this.$d.toISOString();
        }, U.toString = function() {
          return this.$d.toUTCString();
        }, E;
      })(), $ = D.prototype;
      return x.prototype = $, [["$ms", s], ["$s", a], ["$m", o], ["$H", c], ["$W", u], ["$M", f], ["$y", g], ["$D", h]].forEach((function(E) {
        $[E[1]] = function(U) {
          return this.$g(U, E[0], E[1]);
        };
      })), x.extend = function(E, U) {
        return E.$i || (E(U, D, x), E.$i = !0), x;
      }, x.locale = A, x.isDayjs = V, x.unix = function(E) {
        return x(1e3 * E);
      }, x.en = F[v], x.Ls = F, x.p = {}, x;
    }));
  })(kn)), kn.exports;
}
var mg = gg();
const je = /* @__PURE__ */ Qr(mg);
var Rn = { exports: {} }, yg = Rn.exports, Eo;
function vg() {
  return Eo || (Eo = 1, (function(e, t) {
    (function(r, n) {
      e.exports = n();
    })(yg, (function() {
      var r = "month", n = "quarter";
      return function(i, s) {
        var a = s.prototype;
        a.quarter = function(u) {
          return this.$utils().u(u) ? Math.ceil((this.month() + 1) / 3) : this.month(this.month() % 3 + 3 * (u - 1));
        };
        var o = a.add;
        a.add = function(u, l) {
          return u = Number(u), this.$utils().p(l) === n ? this.add(3 * u, r) : o.bind(this)(u, l);
        };
        var c = a.startOf;
        a.startOf = function(u, l) {
          var f = this.$utils(), p = !!f.u(l) || l;
          if (f.p(u) === n) {
            var g = this.quarter() - 1;
            return p ? this.month(3 * g).startOf(r).startOf("day") : this.month(3 * g + 2).endOf(r).endOf("day");
          }
          return c.bind(this)(u, l);
        };
      };
    }));
  })(Rn)), Rn.exports;
}
var Sg = vg();
const wg = /* @__PURE__ */ Qr(Sg);
var qn = { exports: {} }, bg = qn.exports, Do;
function Cg() {
  return Do || (Do = 1, (function(e, t) {
    (function(r, n) {
      e.exports = n();
    })(bg, (function() {
      var r = { LTS: "h:mm:ss A", LT: "h:mm A", L: "MM/DD/YYYY", LL: "MMMM D, YYYY", LLL: "MMMM D, YYYY h:mm A", LLLL: "dddd, MMMM D, YYYY h:mm A" }, n = /(\[[^[]*\])|([-_:/.,()\s]+)|(A|a|Q|YYYY|YY?|ww?|MM?M?M?|Do|DD?|hh?|HH?|mm?|ss?|S{1,3}|z|ZZ?)/g, i = /\d/, s = /\d\d/, a = /\d\d?/, o = /\d*[^-_:/,()\s\d]+/, c = {}, u = function(m) {
        return (m = +m) + (m > 68 ? 1900 : 2e3);
      }, l = function(m) {
        return function(C) {
          this[m] = +C;
        };
      }, f = [/[+-]\d\d:?(\d\d)?|Z/, function(m) {
        (this.zone || (this.zone = {})).offset = (function(C) {
          if (!C || C === "Z") return 0;
          var R = C.match(/([+-]|\d\d)/g), b = 60 * R[1] + (+R[2] || 0);
          return b === 0 ? 0 : R[0] === "+" ? -b : b;
        })(m);
      }], p = function(m) {
        var C = c[m];
        return C && (C.indexOf ? C : C.s.concat(C.f));
      }, g = function(m, C) {
        var R, b = c.meridiem;
        if (b) {
          for (var S = 1; S <= 24; S += 1) if (m.indexOf(b(S, 0, C)) > -1) {
            R = S > 12;
            break;
          }
        } else R = m === (C ? "pm" : "PM");
        return R;
      }, h = { A: [o, function(m) {
        this.afternoon = g(m, !1);
      }], a: [o, function(m) {
        this.afternoon = g(m, !0);
      }], Q: [i, function(m) {
        this.month = 3 * (m - 1) + 1;
      }], S: [i, function(m) {
        this.milliseconds = 100 * +m;
      }], SS: [s, function(m) {
        this.milliseconds = 10 * +m;
      }], SSS: [/\d{3}/, function(m) {
        this.milliseconds = +m;
      }], s: [a, l("seconds")], ss: [a, l("seconds")], m: [a, l("minutes")], mm: [a, l("minutes")], H: [a, l("hours")], h: [a, l("hours")], HH: [a, l("hours")], hh: [a, l("hours")], D: [a, l("day")], DD: [s, l("day")], Do: [o, function(m) {
        var C = c.ordinal, R = m.match(/\d+/);
        if (this.day = R[0], C) for (var b = 1; b <= 31; b += 1) C(b).replace(/\[|\]/g, "") === m && (this.day = b);
      }], w: [a, l("week")], ww: [s, l("week")], M: [a, l("month")], MM: [s, l("month")], MMM: [o, function(m) {
        var C = p("months"), R = (p("monthsShort") || C.map((function(b) {
          return b.slice(0, 3);
        }))).indexOf(m) + 1;
        if (R < 1) throw new Error();
        this.month = R % 12 || R;
      }], MMMM: [o, function(m) {
        var C = p("months").indexOf(m) + 1;
        if (C < 1) throw new Error();
        this.month = C % 12 || C;
      }], Y: [/[+-]?\d+/, l("year")], YY: [s, function(m) {
        this.year = u(m);
      }], YYYY: [/\d{4}/, l("year")], Z: f, ZZ: f };
      function d(m) {
        var C, R;
        C = m, R = c && c.formats;
        for (var b = (m = C.replace(/(\[[^\]]+])|(LTS?|l{1,4}|L{1,4})/g, (function(x, I, D) {
          var $ = D && D.toUpperCase();
          return I || R[D] || r[D] || R[$].replace(/(\[[^\]]+])|(MMMM|MM|DD|dddd)/g, (function(E, U, y) {
            return U || y.slice(1);
          }));
        }))).match(n), S = b.length, v = 0; v < S; v += 1) {
          var F = b[v], M = h[F], V = M && M[0], A = M && M[1];
          b[v] = A ? { regex: V, parser: A } : F.replace(/^\[|\]$/g, "");
        }
        return function(x) {
          for (var I = {}, D = 0, $ = 0; D < S; D += 1) {
            var E = b[D];
            if (typeof E == "string") $ += E.length;
            else {
              var U = E.regex, y = E.parser, O = x.slice($), k = U.exec(O)[0];
              y.call(I, k), x = x.replace(k, "");
            }
          }
          return (function(T) {
            var L = T.afternoon;
            if (L !== void 0) {
              var N = T.hours;
              L ? N < 12 && (T.hours += 12) : N === 12 && (T.hours = 0), delete T.afternoon;
            }
          })(I), I;
        };
      }
      return function(m, C, R) {
        R.p.customParseFormat = !0, m && m.parseTwoDigitYear && (u = m.parseTwoDigitYear);
        var b = C.prototype, S = b.parse;
        b.parse = function(v) {
          var F = v.date, M = v.utc, V = v.args;
          this.$u = M;
          var A = V[1];
          if (typeof A == "string") {
            var x = V[2] === !0, I = V[3] === !0, D = x || I, $ = V[2];
            I && ($ = V[2]), c = this.$locale(), !x && $ && (c = R.Ls[$]), this.$d = (function(O, k, T, L) {
              try {
                if (["x", "X"].indexOf(k) > -1) return new Date((k === "X" ? 1e3 : 1) * O);
                var N = d(k)(O), G = N.year, Y = N.month, re = N.day, B = N.hours, Z = N.minutes, H = N.seconds, J = N.milliseconds, le = N.zone, ce = N.week, K = /* @__PURE__ */ new Date(), ee = re || (G || Y ? 1 : K.getDate()), de = G || K.getFullYear(), he = 0;
                G && !Y || (he = Y > 0 ? Y - 1 : K.getMonth());
                var Ie, ge = B || 0, Oe = Z || 0, me = H || 0, ke = J || 0;
                return le ? new Date(Date.UTC(de, he, ee, ge, Oe, me, ke + 60 * le.offset * 1e3)) : T ? new Date(Date.UTC(de, he, ee, ge, Oe, me, ke)) : (Ie = new Date(de, he, ee, ge, Oe, me, ke), ce && (Ie = L(Ie).week(ce).toDate()), Ie);
              } catch {
                return /* @__PURE__ */ new Date("");
              }
            })(F, A, M, R), this.init(), $ && $ !== !0 && (this.$L = this.locale($).$L), D && F != this.format(A) && (this.$d = /* @__PURE__ */ new Date("")), c = {};
          } else if (A instanceof Array) for (var E = A.length, U = 1; U <= E; U += 1) {
            V[1] = A[U - 1];
            var y = R.apply(this, V);
            if (y.isValid()) {
              this.$d = y.$d, this.$L = y.$L, this.init();
              break;
            }
            U === E && (this.$d = /* @__PURE__ */ new Date(""));
          }
          else S.call(this, v);
        };
      };
    }));
  })(qn)), qn.exports;
}
var Ig = Cg();
const Ag = /* @__PURE__ */ Qr(Ig);
je.extend(Ag);
const il = "YYYY/MM/DD@HH:mm:ss", xg = "1401-01-01";
function Yn(e, t) {
  const r = je(e, t);
  return !r.isValid() && !t ? je(e, il) : r;
}
function sl(e) {
  return e.format(il);
}
function kg(e, t) {
  const r = Yn(e, t);
  if (!r.isValid()) {
    const n = ". Please provide a date format string in the configuration options. See https://day.js.org/docs/en/parse/string-format for more information.", i = ` with the format "${t}"`;
    throw new Error(`Could not parse the provided date "${e}"${t ? i : n}`);
  }
  al(r);
}
function al(e) {
  if (e.isBefore(xg))
    throw new Error(`Date is before year 1401, which is unsupported by the API: ${e}`);
}
je.extend(wg);
const ol = ["past", "now", "next"], cl = [
  "minute",
  "hour",
  "day",
  "week",
  "month",
  "quarter",
  "year"
], Rg = (e) => {
  const t = e === "now";
  return {
    amount: new W({ required: !t, min: 1 }),
    unit: new Q({
      required: !t,
      constrainTo: cl
    }),
    period: new Q({
      required: !0,
      constrainTo: ol
    })
  };
};
function To(e) {
  if (typeof e == "string" && !Fr(e))
    throw new Error(`The value "${e}" is not respecting the relative date format "period-amount-unit"`);
  const t = typeof e == "string" ? dl(e) : e;
  new mt(Rg(t.period)).validate(t);
  const r = ul(t), n = JSON.stringify(t);
  if (!r.isValid())
    throw new Error(`Date is invalid: ${n}`);
  al(r);
}
function qg(e) {
  const { period: t, amount: r, unit: n } = e;
  switch (t) {
    case "past":
    case "next":
      return `${t}-${r}-${n}`;
    case "now":
      return t;
  }
}
function ul(e) {
  const { period: t, amount: r, unit: n } = e;
  switch (t) {
    case "past":
      return je().subtract(r, n);
    case "next":
      return je().add(r, n);
    case "now":
      return je();
  }
}
function Es(e) {
  return sl(ul(dl(e)));
}
function ll(e) {
  return e.toLocaleLowerCase().split("-");
}
function Fr(e) {
  const [t, r, n] = ll(e);
  if (t === "now")
    return !0;
  if (!ol.includes(t) || !cl.includes(n))
    return !1;
  const i = parseInt(r, 10);
  return !(Number.isNaN(i) || i <= 0);
}
function Og(e) {
  return !!e && typeof e == "object" && "period" in e;
}
function dl(e) {
  const [t, r, n] = ll(e);
  return t === "now" ? {
    period: "now"
  } : {
    period: t,
    amount: r ? parseInt(r, 10) : void 0,
    unit: n || void 0
  };
}
const j = new Q({
  required: !0,
  emptyAllowed: !1
}), ve = new Q({
  required: !1,
  emptyAllowed: !1
}), Pe = new Q({
  required: !0,
  emptyAllowed: !0
}), Fg = new Q({
  required: !1,
  emptyAllowed: !0
}), Eg = new oe({
  each: j,
  required: !0
}), Dg = new Q({
  required: !1,
  emptyAllowed: !1,
  regex: /^\d+\.\d+\.\d+$/
}), Tg = new Q({
  required: !1,
  emptyAllowed: !1,
  regex: /^[a-zA-Z0-9_\-.]{1,100}$/
}), Mg = new Q({
  required: !0,
  emptyAllowed: !1,
  regex: /^[a-zA-Z0-9_\-.]{1,100}$/
}), nt = ({ message: e, name: t, stack: r }) => ({ message: e, name: t, stack: r }), Ne = (e, t) => {
  if ("required" in t)
    return {
      payload: new mt({
        value: t
      }).validate({ value: e }).value
    };
  const i = new z({
    options: { required: !0 },
    values: t
  }).validate(e);
  if (i)
    throw new Eu(i);
  return { payload: e };
}, q = (e, t) => {
  try {
    return Ne(e, t);
  } catch (r) {
    return {
      payload: e,
      error: nt(r)
    };
  }
}, aa = "3.53.1", _g = ["@coveo/atomic", "@coveo/quantic"], Li = () => ve, fl = () => j, hl = w("configuration/updateBasicConfiguration", (e) => q(e, {
  accessToken: ve,
  environment: new Q({
    required: !1,
    constrainTo: ["prod", "hipaa", "stg", "dev"]
  }),
  organizationId: ve
})), Pg = w("configuration/updateSearchConfiguration", (e) => q(e, {
  proxyBaseUrl: new Q({ required: !1, url: !0 }),
  pipeline: new Q({ required: !1, emptyAllowed: !0 }),
  searchHub: ve,
  timezone: ve,
  locale: ve,
  authenticationProviders: new oe({
    required: !1,
    each: j
  })
})), On = {
  enabled: new ie({ default: !0 }),
  originContext: Li(),
  originLevel2: Li(),
  originLevel3: Li(),
  proxyBaseUrl: new Q({ required: !1, url: !0 }),
  runtimeEnvironment: new Ce(),
  anonymous: new ie({ default: !1 }),
  deviceId: ve,
  userDisplayName: ve,
  documentLocation: ve,
  trackingId: Tg,
  analyticsMode: new Q({
    constrainTo: ["legacy", "next"],
    required: !1,
    default: "next"
  }),
  source: new z({
    options: { required: !1 },
    values: _g.reduce((e, t) => (e[t] = Dg, e), {})
  })
}, Ug = w("configuration/updateAnalyticsConfiguration", (e) => q(e, On)), Vg = w("configuration/analytics/disable"), $g = w("configuration/analytics/enable"), Lg = w("configuration/analytics/originlevel2", (e) => q(e, { originLevel2: fl() })), Qg = w("configuration/analytics/originlevel3", (e) => q(e, { originLevel3: fl() })), jg = w("knowledge/setAgentId", (e) => q(e, new Q({ required: !0 }))), Ng = w("commerce/configuration/updateBasicConfiguration", (e) => q(e, {
  accessToken: ve,
  environment: new Q({
    required: !1,
    constrainTo: ["prod", "hipaa", "stg", "dev"]
  }),
  organizationId: ve
})), zg = w("commerce/configuration/updateProxyBaseUrl", (e) => q(e, {
  proxyBaseUrl: new Q({ required: !1, url: !0 })
})), Bg = w("commerce/configuration/updateAnalyticsConfiguration", (e) => q(e, {
  enabled: On.enabled,
  proxyBaseUrl: On.proxyBaseUrl,
  source: On.source,
  trackingId: Mg
})), Hg = w("commerce/configuration/analytics/disable"), Yg = w("commerce/configuration/analytics/enable"), Wg = () => ({
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
se(Wg(), (e) => e.addCase(Ng, (t, r) => {
  Mo(t, r.payload);
}).addCase(hl, (t, r) => {
  Mo(t, r.payload);
}).addCase(zg, (t, r) => {
  Kg(t, r.payload);
}).addCase(Bg, (t, r) => {
  Gg(t, r.payload);
}).addCase(Hg, (t) => {
  t.analytics.enabled = !1;
}).addCase(Yg, (t) => {
  t.analytics.enabled = !0;
}));
function Mo(e, t) {
  X(t.accessToken) || (e.accessToken = t.accessToken), e.environment = t.environment ?? "prod", X(t.organizationId) || (e.organizationId = t.organizationId);
}
function Kg(e, t) {
  X(t.proxyBaseUrl) || (e.commerce.apiBaseUrl = t.proxyBaseUrl);
}
function Gg(e, t) {
  X(t.enabled) || (e.analytics.enabled = t.enabled), X(t.proxyBaseUrl) || (e.analytics.apiBaseUrl = t.proxyBaseUrl), X(t.source) || (e.analytics.source = t.source), X(t.trackingId) || (e.analytics.trackingId = t.trackingId);
}
function li(e) {
  return e.currency;
}
const Jg = (e, t) => ({
  currency: li(t.commerceContext),
  products: Xg(t.cart),
  transaction: e
}), Zg = (e, t) => ({
  currency: li(t.commerceContext),
  ...e
}), oa = fe((e) => e.cart, (e) => e.cartItems, (e, t) => t.map((r) => e[r])), Xg = fe(oa, (e) => e.map(({ quantity: t, ...r }) => ({
  quantity: t,
  product: r
}))), pl = {
  productId: j,
  quantity: new W({
    required: !0,
    min: 0
  }),
  name: new Q({ required: !1 }),
  price: new W({ required: !1, min: 0 })
}, gl = new oe({
  each: new z({
    values: {
      ...pl
    }
  })
}), em = {
  items: gl
}, tm = w("commerce/cart/setItems", (e) => q(e, gl)), rm = w("commerce/cart/updateItemQuantity", (e) => q(e, pl)), nm = w("commerce/cart/purchase");
ne("commerce/cart/emit/purchaseEvent", async (e, { extra: t, getState: r }) => {
  const n = Jg(e, r()), { relay: i } = t;
  i.emit("ec.purchase", n);
});
ne("commerce/cart/emit/cartActionEvent", async (e, { extra: t, getState: r }) => {
  const n = Zg(e, r()), { relay: i } = t;
  i.emit("ec.cartAction", n);
});
fe(oa, (e) => e.reduce((t, r) => t + r.quantity, 0));
fe(oa, (e) => e.reduce((t, r) => t + r.price * r.quantity, 0));
function Wn(e) {
  return `${e.productId},${e.name},${e.price}`;
}
const Qi = () => ({
  cartItems: [],
  cart: {},
  purchasedItems: [],
  purchased: {}
}), im = (e) => ml(e.cartItems, e.cart), sm = (e) => ml(e.purchasedItems, e.purchased);
function ml(e, t) {
  const r = e.reduce((n, i) => {
    const { productId: s, quantity: a } = t[i];
    return s in n || (n[s] = {
      productId: s,
      quantity: 0
    }), n[s].quantity += a, n;
  }, {});
  return [...Object.values(r)];
}
se(Qi(), (e) => {
  e.addCase(tm, (t, { payload: r }) => {
    const { cart: n, cartItems: i } = r.reduce((s, a) => {
      const o = Wn(a);
      return {
        cartItems: [...s.cartItems, o],
        cart: {
          ...s.cart,
          [o]: a
        },
        purchasedItems: [],
        purchased: {}
      };
    }, Qi());
    _o(t, i, n);
  }).addCase(rm, (t, { payload: r }) => {
    const n = Wn(r);
    if (!(n in t.cart)) {
      am(r, t);
      return;
    }
    if (r.quantity <= 0) {
      om(r, t);
      return;
    }
    t.cart[n] = r;
  }).addCase(nm, (t) => {
    cm(t);
    const { cart: r, cartItems: n } = Qi();
    _o(t, n, r);
  });
});
function _o(e, t, r) {
  e.cartItems = t, e.cart = r;
}
function am(e, t) {
  if (e.quantity <= 0)
    return;
  const r = Wn(e);
  t.cartItems = [...t.cartItems, r], t.cart[r] = e;
}
function om(e, t) {
  const r = Wn(e);
  t.cartItems = t.cartItems.filter((n) => n !== r), delete t.cart[r];
}
function cm(e) {
  for (const t of e.cartItems) {
    if (t in e.purchased) {
      e.purchased[t].quantity += e.cart[t].quantity;
      continue;
    }
    e.purchasedItems = [...e.purchasedItems, t], e.purchased[t] = e.cart[t];
  }
}
const um = Intl.supportedValuesOf("currency"), lm = new Q({
  required: !0,
  emptyAllowed: !1,
  constrainTo: um
}), yl = {
  url: j
}, vl = {
  latitude: new W({ min: -90, max: 90, required: !0 }),
  longitude: new W({ min: -180, max: 180, required: !0 })
}, dm = {
  custom: new z({
    options: { required: !1 }
  })
}, Sl = {
  language: j,
  country: j,
  currency: lm,
  view: new z({
    options: { required: !0 },
    values: yl
  }),
  location: new z({
    options: { required: !1 },
    values: vl
  }),
  custom: new z({
    options: { required: !1 }
  })
}, Pt = w("commerce/context/set", (e) => q(e, Sl)), it = w("commerce/context/setView", (e) => q(e, yl)), fm = w("commerce/context/setLocation", (e) => q(e, vl)), hm = w("commerce/context/setCustom", (e) => q({ custom: e }, dm)), pm = () => ({
  language: "",
  country: "",
  currency: "",
  view: {
    url: ""
  }
});
se(pm(), (e) => {
  e.addCase(Pt, (t, { payload: r }) => r).addCase(it, (t, { payload: r }) => {
    t.view = r;
  }).addCase(fm, (t, { payload: r }) => {
    t.location = r;
  }).addCase(hm, (t, { payload: r }) => {
    t.custom = r.custom;
  });
});
const wl = () => ({
  correctedQuery: "",
  corrections: [],
  originalQuery: ""
}), di = fe((e) => e.source, (e) => Object.entries(e).map(([t, r]) => `${t}@${r}`).concat(`@coveo/headless@${aa}`)), Nr = (e, t) => {
  const { view: r, location: n, custom: i, ...s } = e.commerceContext;
  return {
    accessToken: e.configuration.accessToken,
    url: e.configuration.commerce.apiBaseUrl ?? hg(e.configuration.organizationId, e.configuration.environment),
    organizationId: e.configuration.organizationId,
    trackingId: e.configuration.analytics.trackingId,
    ...s,
    ...e.configuration.analytics.enabled ? { clientId: t.clientId } : {},
    context: {
      user: {
        ...n,
        ...t.userAgent ? { userAgent: t.userAgent } : {}
      },
      view: {
        ...r,
        ...t.referrer ? { referrer: t.referrer } : {}
      },
      capture: t.capture ?? (e.configuration.analytics.enabled && t.clientId !== ""),
      cart: im(e.cart),
      source: di(e.configuration.analytics),
      ...i ? { custom: i } : {}
    }
  };
}, bl = (e, t, r) => ({
  ...Nr(e, t),
  ...gm(e, r)
}), gm = (e, t) => {
  var n, i;
  const r = t ? (n = e.commercePagination) == null ? void 0 : n.recommendations[t] : (i = e.commercePagination) == null ? void 0 : i.principal;
  return r && {
    page: r.page,
    ...r.perPage && {
      perPage: r.perPage
    }
  };
}, Ut = (e, t) => ({
  ...bl(e, t),
  facets: [...mm(e)],
  ...e.commerceSort && {
    sort: ym(e.commerceSort.appliedSort)
  }
});
function mm(e) {
  return !e.facetOrder || !e.commerceFacetSet ? [] : e.facetOrder.filter((t) => {
    var r;
    return (r = e.commerceFacetSet) == null ? void 0 : r[t];
  }).map((t) => {
    var r, n;
    return (n = (r = e.manualNumericFacetSet) == null ? void 0 : r[t]) != null && n.manualRange ? {
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
function ym(e) {
  return e.by === Le.Relevance ? {
    sortCriteria: Le.Relevance
  } : {
    sortCriteria: Le.Fields,
    fields: e.fields.map(({ name: t, direction: r }) => ({
      field: t,
      direction: r
    }))
  };
}
const vm = w("commerce/facets/core/updateNumberOfValues", (e) => q(e, {
  facetId: j,
  numberOfValues: new W({ required: !0, min: 1 })
})), Sm = w("commerce/facets/core/updateIsFieldExpanded", (e) => q(e, {
  facetId: j,
  isFieldExpanded: new ie({ required: !0 })
})), fi = w("commerce/facets/core/clearAll"), ca = w("commerce/facets/core/deleteAll"), hi = w("commerce/facets/core/deselectAllValues", (e) => q(e, {
  facetId: j
})), wm = w("commerce/facets/core/updateFreezeCurrentValues", (e) => q(e, {
  facetId: j,
  freezeCurrentValues: new ie({ required: !0 })
})), Cl = w("commerce/facets/core/updateAutoSelectionForAll", (e) => q(e, {
  allow: new ie({ required: !0 })
})), pi = {
  slotId: Fg
}, bm = {
  ...pi,
  pageSize: new W({ required: !0, min: 0 })
}, Il = w("commerce/pagination/setPageSize", (e) => q(e, bm)), Cm = {
  ...pi,
  page: new W({ required: !0, min: 0 })
}, ua = w("commerce/pagination/selectPage", (e) => q(e, Cm)), Al = w("commerce/pagination/nextPage", (e) => q(e, pi)), xl = w("commerce/pagination/previousPage", (e) => q(e, pi)), Im = w("commerce/pagination/registerRecommendationsSlot", (e) => q(e, {
  slotId: j
})), gi = w("commerce/query/update", (e) => q(e, {
  query: new Q()
})), kl = w("commerce/triggers/query/updateIgnore", (e) => q(e, {
  q: new Q({ emptyAllowed: !0, required: !0 })
})), Rl = w("commerce/triggers/query/applyModification", (e) => q(e, new z({
  values: { originalQuery: ve, modification: ve }
})));
let ql = class {
  constructor(t) {
    te(this, "config");
    this.config = t;
  }
  async process(t) {
    return this.processQueryErrorOrContinue(t) ?? await this.processQueryCorrectionsOrContinue(t) ?? await this.processQueryTriggersOrContinue(t) ?? this.processSuccessResponse(t);
  }
  async fetchFromAPI(t) {
    const r = Date.now(), n = await this.extra.apiClient.search(t), i = Date.now() - r, s = this.getState().commerceQuery.query || "";
    return {
      response: n,
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
    const r = this.getState(), n = this.getSuccessResponse(t);
    if (!n || !r.didYouMean)
      return null;
    const { queryCorrection: i } = n;
    if (!(!X(i) && !X(i.correctedQuery)))
      return null;
    const { correctedQuery: a, originalQuery: o } = n.queryCorrection;
    return this.onUpdateQueryForCorrection(a ?? ""), {
      ...t,
      response: {
        ...n
      },
      queryExecuted: ng(r, n),
      originalQuery: o ?? ""
    };
  }
  async processQueryTriggersOrContinue(t) {
    var o, c;
    const r = this.getSuccessResponse(t);
    if (!r)
      return null;
    const n = ((o = r.triggers.find((u) => u.type === "query")) == null ? void 0 : o.content) || "";
    if (!n)
      return null;
    if (((c = this.getState().triggers) == null ? void 0 : c.queryModification.queryToIgnore) === n)
      return this.dispatch(kl({ q: "" })), null;
    const s = this.getCurrentQuery(), a = await this.automaticallyRetryQueryWithTriggerModification(n, t.enableResults);
    return Qe(a.response) ? this.rejectWithValue(a.response.error) : {
      ...a,
      response: {
        ...a.response.success
      },
      originalQuery: s
    };
  }
  async automaticallyRetryQueryWithTriggerModification(t, r) {
    return this.dispatch(Rl({
      newQuery: t,
      originalQuery: this.getCurrentQuery()
    })), this.onUpdateQueryForCorrection(t), await this.fetchFromAPI({
      ...Ut(this.getState(), this.navigatorContext),
      query: t,
      enableResults: !!r
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
    this.dispatch(gi({ query: t }));
  }
};
const Re = ne("commerce/search/executeSearch", async (e = {}, t) => {
  const { getState: r } = t, n = r(), { navigatorContext: i } = t.extra, s = Ut(n, i), a = ia(n), o = new ql(t), c = await o.fetchFromAPI({
    ...s,
    query: a,
    enableResults: !!(e != null && e.enableResults)
  });
  return o.process(c);
}), ji = ne("commerce/search/fetchMoreProducts", async (e = {}, t) => {
  const { getState: r } = t, n = r(), { navigatorContext: i } = t.extra;
  if (!rg(n))
    return null;
  const a = Gu(n), c = el(n) / a, u = ia(n), l = Ut(n, i), f = new ql(t), p = await f.fetchFromAPI({
    ...l,
    query: u,
    page: c,
    enableResults: !!(e != null && e.enableResults)
  });
  return f.process(p);
});
ne("commerce/search/prepareForSearchWithQuery", (e, t) => {
  const { dispatch: r } = t;
  q(e, {
    query: new Q(),
    clearFilters: new ie()
  }), e.clearFilters && r(ca()), r(Cl({ allow: !0 })), r(gi({
    query: e.query
  })), r(ua({ page: 0 }));
});
const Ni = ne("commerce/search/fetchInstantProducts", async (e, { getState: t, rejectWithValue: r, extra: n }) => {
  const i = t(), { apiClient: s, navigatorContext: a } = n, { q: o } = e, c = await s.productSuggestions({
    ...Nr(i, a),
    query: o
  });
  return Qe(c) ? r(c.error) : {
    response: { ...c.success, products: c.success.products }
  };
}), Am = {
  child: new z({
    options: { required: !0 },
    values: {
      permanentid: new Q({ required: !0 })
    }
  })
}, xm = w("commerce/search/promoteChildToParent", (e) => q(e, Am));
function km() {
  return {
    wasCorrectedTo: "",
    queryCorrection: wl(),
    originalQuery: ""
  };
}
se(km(), (e) => {
  e.addCase(Re.pending, (t) => {
    t.queryCorrection = wl(), t.wasCorrectedTo = "";
  }).addCase(Re.fulfilled, (t, r) => {
    var i, s;
    const { queryCorrection: n } = r.payload.response;
    t.originalQuery = r.payload.originalQuery, t.wasCorrectedTo = (n == null ? void 0 : n.correctedQuery) ?? "", t.queryCorrection = {
      correctedQuery: (n == null ? void 0 : n.correctedQuery) ?? ((i = n == null ? void 0 : n.corrections[0]) == null ? void 0 : i.correctedQuery) ?? "",
      wordCorrections: ((s = n == null ? void 0 : n.corrections[0]) == null ? void 0 : s.wordCorrections) ?? []
    };
  });
});
function Fn() {
  return [];
}
const Me = ne("commerce/productListing/fetch", async (e, { getState: t, rejectWithValue: r, extra: { apiClient: n, navigatorContext: i } }) => {
  const s = t(), a = Ut(s, i), o = await n.getProductListing({
    ...a,
    enableResults: !!(e != null && e.enableResults)
  });
  return Qe(o) ? r(o.error) : {
    response: o.success
  };
}), zi = ne("commerce/productListing/fetchMoreProducts", async (e, { getState: t, rejectWithValue: r, extra: { apiClient: n, navigatorContext: i } }) => {
  const s = t();
  if (!Ap(s))
    return null;
  const o = Gu(s), u = Zu(s) / o, l = await n.getProductListing({
    ...Ut(s, i),
    enableResults: !!(e != null && e.enableResults),
    page: u
  });
  return Qe(l) ? r(l.error) : {
    response: l.success
  };
}), Rm = {
  child: new z({
    options: { required: !0 },
    values: {
      permanentid: new Q({ required: !0 })
    }
  })
}, qm = w("commerce/productListing/promoteChildToParent", (e) => q(e, Rm)), Ol = {
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
}, sr = w("commerce/productListingParameters/restore", (e) => q(e, Ol)), Om = {
  q: new Q(),
  ...Ol
}, yt = w("commerce/searchParameters/restore", (e) => q(e, Om));
se(Fn(), (e) => {
  e.addCase(Me.fulfilled, Po).addCase(Re.fulfilled, Po).addCase(yt, Uo).addCase(sr, Uo).addCase(it, () => Fn()).addCase(Pt, () => Fn());
});
function Po(e, t) {
  return t.payload.response.facets.map((r) => r.facetId);
}
function Uo(e, t) {
  return [
    ...Object.keys(t.payload.f ?? {}),
    ...Object.keys(t.payload.lf ?? {}),
    ...Object.keys(t.payload.nf ?? {}),
    ...Object.keys(t.payload.df ?? {}),
    ...Object.keys(t.payload.cf ?? {}),
    ...Object.keys(t.payload.mnf ?? {})
  ];
}
const ue = j, la = {
  facetId: ue,
  captions: new z({ options: { required: !1 } }),
  numberOfValues: new W({ required: !1, min: 1 }),
  query: new Q({ required: !1, emptyAllowed: !0 })
}, Fm = {
  path: new oe({
    required: !0,
    each: j
  }),
  displayValue: Pe,
  rawValue: Pe,
  count: new W({ required: !0, min: 0 })
}, da = w("categoryFacet/selectSearchResult", (e) => q(e, {
  facetId: ue,
  value: new z({ values: Fm })
})), Em = w("categoryFacetSearch/register", (e) => q(e, la));
function Dm() {
  return {};
}
function fa(e, t, r) {
  const { facetId: n } = t;
  if (e[n])
    return;
  const i = !1, s = { ...Jt, ...t }, a = r();
  e[n] = {
    options: s,
    isLoading: i,
    response: a,
    initialNumberOfValues: s.numberOfValues,
    requestId: ""
  };
}
function Fl(e, t) {
  const { facetId: r, ...n } = t, i = e[r];
  i && (i.options = { ...i.options, ...n });
}
function Kn(e, t, r) {
  const n = e[t];
  n && (n.requestId = r, n.isLoading = !0);
}
function Gn(e, t) {
  const r = e[t];
  r && (r.isLoading = !1);
}
function ha(e, t, r) {
  const { facetId: n } = t, i = e[n];
  i && (i.requestId = "", i.isLoading = !1, i.response = r(), i.options.numberOfValues = i.initialNumberOfValues, i.options.query = Jt.query);
}
function br(e, t) {
  Object.keys(e).forEach((r) => ha(e, { facetId: r }, t));
}
const Jt = {
  captions: {},
  numberOfValues: 10,
  query: ""
};
function ar(e) {
  return Object.values(e).map((t) => t.request);
}
function El(e, t) {
  const r = {};
  e.forEach((s) => {
    r[s.facetId] = s;
  });
  const n = [];
  t.forEach((s) => {
    s in r && (n.push(r[s]), delete r[s]);
  });
  const i = Object.values(r);
  return [...n, ...i];
}
function Vo(e) {
  return ar(e).map((t) => {
    const n = t.currentValues.some(({ state: i }) => i !== "idle");
    return t.generateAutomaticRanges && !n ? { ...t, currentValues: [] } : t;
  });
}
const Dl = {
  alphanumericDescending: { type: "alphanumeric", order: "descending" },
  alphanumericNaturalDescending: {
    type: "alphanumericNatural",
    order: "descending"
  }
};
function Tm(e) {
  return ar(e).map((t) => {
    const r = Dl[t.sortCriteria];
    return r ? {
      ...t,
      sortCriteria: r
    } : t;
  });
}
function Mm(e) {
  return [
    ...Tm(e.facetSet ?? {}),
    ...Vo(e.numericFacetSet ?? {}),
    ...Vo(e.dateFacetSet ?? {}),
    ...ar(e.categoryFacetSet ?? {})
  ];
}
function _m(e) {
  return Mm(e).filter(({ facetId: t }) => {
    var r, n;
    return ((n = (r = e.facetOptions) == null ? void 0 : r.facets[t]) == null ? void 0 : n.enabled) ?? !0;
  });
}
function Tl(e) {
  return El(_m(e), e.facetOrder ?? []);
}
const Pm = 1, Er = 5e3;
let Bi = class Ml {
  static set(t, r, n) {
    let i, s, a;
    n && (s = /* @__PURE__ */ new Date(), s.setTime(s.getTime() + n));
    const o = window.location.hostname, c = /^(\d{1,3}\.){3}\d{1,3}$/, u = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/;
    c.test(o) || u.test(o) || o.indexOf(".") === -1 ? Hi(t, r, s) : (a = o.split("."), i = a[a.length - 2] + "." + a[a.length - 1], Hi(t, r, s, i));
  }
  static get(t) {
    const r = t + "=", n = document.cookie.split(";");
    for (let i = 0; i < n.length; i++) {
      let s = n[i];
      if (s = s.replace(/^\s+/, ""), s.lastIndexOf(r, 0) === 0)
        return s.substring(r.length, s.length);
    }
    return null;
  }
  static erase(t) {
    Ml.set(t, "", -1);
  }
};
function Hi(e, t, r, n) {
  document.cookie = `${e}=${t}` + (r ? `;expires=${r.toUTCString()}` : "") + (n ? `;domain=${n}` : "") + ";path=/;SameSite=Lax" + (window.location.protocol === "https:" ? ";Secure" : "");
}
function Um() {
  return typeof navigator < "u";
}
function Vm() {
  try {
    return typeof localStorage < "u";
  } catch {
    return !1;
  }
}
function $m() {
  try {
    return typeof sessionStorage < "u";
  } catch {
    return !1;
  }
}
function Lm() {
  return !!(Um() && navigator.cookieEnabled);
}
function Qm() {
  return Vm() ? localStorage : Lm() ? new jm() : $m() ? sessionStorage : new Nm();
}
var Ze;
let jm = (Ze = class {
  getItem(t) {
    return Bi.get(`${Ze.prefix}${t}`);
  }
  removeItem(t) {
    Bi.erase(`${Ze.prefix}${t}`);
  }
  setItem(t, r, n) {
    Bi.set(`${Ze.prefix}${t}`, r, n);
  }
}, te(Ze, "prefix", "coveo_"), Ze), Nm = class {
  getItem(t) {
    return null;
  }
  removeItem(t) {
  }
  setItem(t, r) {
  }
};
const dn = "__coveo.analytics.history", zm = 20, Bm = 1e3 * 60, Hm = 75;
var $e;
let or = ($e = class {
  constructor(t) {
    te(this, "store");
    this.store = t || Qm();
  }
  static getInstance(t) {
    return $e.instance || ($e.instance = new $e(t)), $e.instance;
  }
  /**
   * @deprecated Synchronous method is deprecated, use addElementAsync instead. This method will NOT work with react-native.
   */
  addElement(t) {
    t.internalTime = (/* @__PURE__ */ new Date()).getTime(), t = this.cropQueryElement(this.stripEmptyQuery(t));
    const r = this.getHistoryWithInternalTime();
    r !== null ? this.isValidEntry(t) && this.setHistory([t].concat(r)) : this.setHistory([t]);
  }
  async addElementAsync(t) {
    t.internalTime = (/* @__PURE__ */ new Date()).getTime(), t = this.cropQueryElement(this.stripEmptyQuery(t));
    const r = await this.getHistoryWithInternalTimeAsync();
    r !== null ? this.isValidEntry(t) && this.setHistory([t].concat(r)) : this.setHistory([t]);
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
      const t = this.store.getItem(dn);
      return t && typeof t == "string" ? JSON.parse(t) : [];
    } catch {
      return [];
    }
  }
  async getHistoryWithInternalTimeAsync() {
    try {
      const t = await this.store.getItem(dn);
      return t ? JSON.parse(t) : [];
    } catch {
      return [];
    }
  }
  setHistory(t) {
    try {
      this.store.setItem(dn, JSON.stringify(t.slice(0, zm)));
    } catch {
    }
  }
  clear() {
    try {
      this.store.removeItem(dn);
    } catch {
    }
  }
  getMostRecentElement() {
    const t = this.getHistoryWithInternalTime();
    return Array.isArray(t) ? t.sort((n, i) => (i.internalTime || 0) - (n.internalTime || 0))[0] : null;
  }
  cropQueryElement(t) {
    return t.name && t.value && t.name.toLowerCase() === "query" && (t.value = t.value.slice(0, Hm)), t;
  }
  isValidEntry(t) {
    const r = this.getMostRecentElement();
    return r && r.value === t.value ? (t.internalTime || 0) - (r.internalTime || 0) > Bm : !0;
  }
  stripInternalTime(t) {
    return Array.isArray(t) ? t.map((r) => {
      const { name: n, time: i, value: s } = r;
      return { name: n, time: i, value: s };
    }) : [];
  }
  stripEmptyQuery(t) {
    const { name: r, time: n, value: i } = t;
    return r && typeof i == "string" && r.toLowerCase() === "query" && i.trim() === "" ? { name: r, time: n } : t;
  }
  stripEmptyQueries(t) {
    return t.map((r) => this.stripEmptyQuery(r));
  }
}, te($e, "instance", null), $e);
function Ye(e, t) {
  var r = {};
  for (var n in e) Object.prototype.hasOwnProperty.call(e, n) && t.indexOf(n) < 0 && (r[n] = e[n]);
  if (e != null && typeof Object.getOwnPropertySymbols == "function")
    for (var i = 0, n = Object.getOwnPropertySymbols(e); i < n.length; i++)
      t.indexOf(n[i]) < 0 && Object.prototype.propertyIsEnumerable.call(e, n[i]) && (r[n[i]] = e[n[i]]);
  return r;
}
function _(e, t, r, n) {
  function i(s) {
    return s instanceof r ? s : new r(function(a) {
      a(s);
    });
  }
  return new (r || (r = Promise))(function(s, a) {
    function o(l) {
      try {
        u(n.next(l));
      } catch (f) {
        a(f);
      }
    }
    function c(l) {
      try {
        u(n.throw(l));
      } catch (f) {
        a(f);
      }
    }
    function u(l) {
      l.done ? s(l.value) : i(l.value).then(o, c);
    }
    u((n = n.apply(e, t || [])).next());
  });
}
var ae;
(function(e) {
  e.search = "search", e.click = "click", e.custom = "custom", e.view = "view", e.collect = "collect";
})(ae || (ae = {}));
function Ds() {
  return typeof window < "u";
}
function pa() {
  return typeof navigator < "u";
}
function Ts() {
  return typeof document < "u";
}
function Ms() {
  try {
    return typeof localStorage < "u";
  } catch {
    return !1;
  }
}
function Ym() {
  try {
    return typeof sessionStorage < "u";
  } catch {
    return !1;
  }
}
function _l() {
  return pa() && navigator.cookieEnabled;
}
const Wm = [ae.click, ae.custom, ae.search, ae.view], Km = (e, t) => Wm.indexOf(e) !== -1 ? Object.assign({ language: Ts() ? document.documentElement.lang : "unknown", userAgent: pa() ? navigator.userAgent : "unknown" }, t) : t;
class Cr {
  static set(t, r, n) {
    var i, s, a, o;
    n && (s = /* @__PURE__ */ new Date(), s.setTime(s.getTime() + n)), o = window.location.hostname, o.indexOf(".") === -1 ? $o(t, r, s) : (a = o.split("."), i = a[a.length - 2] + "." + a[a.length - 1], $o(t, r, s, i));
  }
  static get(t) {
    for (var r = t + "=", n = document.cookie.split(";"), i = 0; i < n.length; i++) {
      var s = n[i];
      if (s = s.replace(/^\s+/, ""), s.lastIndexOf(r, 0) === 0)
        return s.substring(r.length, s.length);
    }
    return null;
  }
  static erase(t) {
    Cr.set(t, "", -1);
  }
}
function $o(e, t, r, n) {
  document.cookie = `${e}=${t}` + (r ? `;expires=${r.toUTCString()}` : "") + (n ? `;domain=${n}` : "") + ";path=/;SameSite=Lax";
}
function Gm() {
  return Ms() ? localStorage : _l() ? new kt() : Ym() ? sessionStorage : new mi();
}
class kt {
  getItem(t) {
    return Cr.get(`${kt.prefix}${t}`);
  }
  removeItem(t) {
    Cr.erase(`${kt.prefix}${t}`);
  }
  setItem(t, r, n) {
    Cr.set(`${kt.prefix}${t}`, r, n);
  }
}
kt.prefix = "coveo_";
class Jm {
  constructor() {
    this.cookieStorage = new kt();
  }
  getItem(t) {
    return localStorage.getItem(t) || this.cookieStorage.getItem(t);
  }
  removeItem(t) {
    this.cookieStorage.removeItem(t), localStorage.removeItem(t);
  }
  setItem(t, r) {
    localStorage.setItem(t, r), this.cookieStorage.setItem(t, r, 31556926e3);
  }
}
class mi {
  getItem(t) {
    return null;
  }
  removeItem(t) {
  }
  setItem(t, r) {
  }
}
const fn = "__coveo.analytics.history", Zm = 20, Xm = 1e3 * 60, ey = 75;
class Pl {
  constructor(t) {
    this.store = t || Gm();
  }
  addElement(t) {
    t.internalTime = (/* @__PURE__ */ new Date()).getTime(), t = this.cropQueryElement(this.stripEmptyQuery(t));
    let r = this.getHistoryWithInternalTime();
    r != null ? this.isValidEntry(t) && this.setHistory([t].concat(r)) : this.setHistory([t]);
  }
  addElementAsync(t) {
    return _(this, void 0, void 0, function* () {
      t.internalTime = (/* @__PURE__ */ new Date()).getTime(), t = this.cropQueryElement(this.stripEmptyQuery(t));
      let r = yield this.getHistoryWithInternalTimeAsync();
      r != null ? this.isValidEntry(t) && this.setHistory([t].concat(r)) : this.setHistory([t]);
    });
  }
  getHistory() {
    const t = this.getHistoryWithInternalTime();
    return this.stripEmptyQueries(this.stripInternalTime(t));
  }
  getHistoryAsync() {
    return _(this, void 0, void 0, function* () {
      const t = yield this.getHistoryWithInternalTimeAsync();
      return this.stripEmptyQueries(this.stripInternalTime(t));
    });
  }
  getHistoryWithInternalTime() {
    try {
      const t = this.store.getItem(fn);
      return t && typeof t == "string" ? JSON.parse(t) : [];
    } catch {
      return [];
    }
  }
  getHistoryWithInternalTimeAsync() {
    return _(this, void 0, void 0, function* () {
      try {
        const t = yield this.store.getItem(fn);
        return t ? JSON.parse(t) : [];
      } catch {
        return [];
      }
    });
  }
  setHistory(t) {
    try {
      this.store.setItem(fn, JSON.stringify(t.slice(0, Zm)));
    } catch {
    }
  }
  clear() {
    try {
      this.store.removeItem(fn);
    } catch {
    }
  }
  getMostRecentElement() {
    let t = this.getHistoryWithInternalTime();
    return Array.isArray(t) ? t.sort((n, i) => (i.internalTime || 0) - (n.internalTime || 0))[0] : null;
  }
  cropQueryElement(t) {
    return t.name && t.value && t.name.toLowerCase() === "query" && (t.value = t.value.slice(0, ey)), t;
  }
  isValidEntry(t) {
    let r = this.getMostRecentElement();
    return r && r.value == t.value ? (t.internalTime || 0) - (r.internalTime || 0) > Xm : !0;
  }
  stripInternalTime(t) {
    return Array.isArray(t) ? t.map((r) => {
      const { name: n, time: i, value: s } = r;
      return { name: n, time: i, value: s };
    }) : [];
  }
  stripEmptyQuery(t) {
    const { name: r, time: n, value: i } = t;
    return r && typeof i == "string" && r.toLowerCase() === "query" && i.trim() === "" ? { name: r, time: n } : t;
  }
  stripEmptyQueries(t) {
    return t.map((r) => this.stripEmptyQuery(r));
  }
}
const ty = (e, t) => _(void 0, void 0, void 0, function* () {
  return e === ae.view ? (yield ry(t.contentIdValue), Object.assign({ location: window.location.toString(), referrer: document.referrer, title: document.title }, t)) : t;
}), ry = (e) => _(void 0, void 0, void 0, function* () {
  const t = new Pl(), r = {
    name: "PageView",
    value: e,
    time: (/* @__PURE__ */ new Date()).toISOString()
  };
  yield t.addElementAsync(r);
});
let hn;
const ny = new Uint8Array(16);
function iy() {
  if (!hn && (hn = typeof crypto < "u" && crypto.getRandomValues && crypto.getRandomValues.bind(crypto), !hn))
    throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");
  return hn(ny);
}
var sy = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;
function Jn(e) {
  return typeof e == "string" && sy.test(e);
}
const Se = [];
for (let e = 0; e < 256; ++e)
  Se.push((e + 256).toString(16).slice(1));
function Ul(e, t = 0) {
  return Se[e[t + 0]] + Se[e[t + 1]] + Se[e[t + 2]] + Se[e[t + 3]] + "-" + Se[e[t + 4]] + Se[e[t + 5]] + "-" + Se[e[t + 6]] + Se[e[t + 7]] + "-" + Se[e[t + 8]] + Se[e[t + 9]] + "-" + Se[e[t + 10]] + Se[e[t + 11]] + Se[e[t + 12]] + Se[e[t + 13]] + Se[e[t + 14]] + Se[e[t + 15]];
}
function ay(e) {
  if (!Jn(e))
    throw TypeError("Invalid UUID");
  let t;
  const r = new Uint8Array(16);
  return r[0] = (t = parseInt(e.slice(0, 8), 16)) >>> 24, r[1] = t >>> 16 & 255, r[2] = t >>> 8 & 255, r[3] = t & 255, r[4] = (t = parseInt(e.slice(9, 13), 16)) >>> 8, r[5] = t & 255, r[6] = (t = parseInt(e.slice(14, 18), 16)) >>> 8, r[7] = t & 255, r[8] = (t = parseInt(e.slice(19, 23), 16)) >>> 8, r[9] = t & 255, r[10] = (t = parseInt(e.slice(24, 36), 16)) / 1099511627776 & 255, r[11] = t / 4294967296 & 255, r[12] = t >>> 24 & 255, r[13] = t >>> 16 & 255, r[14] = t >>> 8 & 255, r[15] = t & 255, r;
}
function oy(e) {
  e = unescape(encodeURIComponent(e));
  const t = [];
  for (let r = 0; r < e.length; ++r)
    t.push(e.charCodeAt(r));
  return t;
}
const cy = "6ba7b810-9dad-11d1-80b4-00c04fd430c8", uy = "6ba7b811-9dad-11d1-80b4-00c04fd430c8";
function ly(e, t, r) {
  function n(i, s, a, o) {
    var c;
    if (typeof i == "string" && (i = oy(i)), typeof s == "string" && (s = ay(s)), ((c = s) === null || c === void 0 ? void 0 : c.length) !== 16)
      throw TypeError("Namespace must be array-like (16 iterable integer values, 0-255)");
    let u = new Uint8Array(16 + i.length);
    if (u.set(s), u.set(i, s.length), u = r(u), u[6] = u[6] & 15 | t, u[8] = u[8] & 63 | 128, a) {
      o = o || 0;
      for (let l = 0; l < 16; ++l)
        a[o + l] = u[l];
      return a;
    }
    return Ul(u);
  }
  try {
    n.name = e;
  } catch {
  }
  return n.DNS = cy, n.URL = uy, n;
}
const dy = typeof crypto < "u" && crypto.randomUUID && crypto.randomUUID.bind(crypto);
var Lo = {
  randomUUID: dy
};
function Yi(e, t, r) {
  if (Lo.randomUUID && !e)
    return Lo.randomUUID();
  e = e || {};
  const n = e.random || (e.rng || iy)();
  return n[6] = n[6] & 15 | 64, n[8] = n[8] & 63 | 128, Ul(n);
}
function fy(e, t, r, n) {
  switch (e) {
    case 0:
      return t & r ^ ~t & n;
    case 1:
      return t ^ r ^ n;
    case 2:
      return t & r ^ t & n ^ r & n;
    case 3:
      return t ^ r ^ n;
  }
}
function Wi(e, t) {
  return e << t | e >>> 32 - t;
}
function hy(e) {
  const t = [1518500249, 1859775393, 2400959708, 3395469782], r = [1732584193, 4023233417, 2562383102, 271733878, 3285377520];
  if (typeof e == "string") {
    const a = unescape(encodeURIComponent(e));
    e = [];
    for (let o = 0; o < a.length; ++o)
      e.push(a.charCodeAt(o));
  } else Array.isArray(e) || (e = Array.prototype.slice.call(e));
  e.push(128);
  const n = e.length / 4 + 2, i = Math.ceil(n / 16), s = new Array(i);
  for (let a = 0; a < i; ++a) {
    const o = new Uint32Array(16);
    for (let c = 0; c < 16; ++c)
      o[c] = e[a * 64 + c * 4] << 24 | e[a * 64 + c * 4 + 1] << 16 | e[a * 64 + c * 4 + 2] << 8 | e[a * 64 + c * 4 + 3];
    s[a] = o;
  }
  s[i - 1][14] = (e.length - 1) * 8 / Math.pow(2, 32), s[i - 1][14] = Math.floor(s[i - 1][14]), s[i - 1][15] = (e.length - 1) * 8 & 4294967295;
  for (let a = 0; a < i; ++a) {
    const o = new Uint32Array(80);
    for (let g = 0; g < 16; ++g)
      o[g] = s[a][g];
    for (let g = 16; g < 80; ++g)
      o[g] = Wi(o[g - 3] ^ o[g - 8] ^ o[g - 14] ^ o[g - 16], 1);
    let c = r[0], u = r[1], l = r[2], f = r[3], p = r[4];
    for (let g = 0; g < 80; ++g) {
      const h = Math.floor(g / 20), d = Wi(c, 5) + fy(h, u, l, f) + p + t[h] + o[g] >>> 0;
      p = f, f = l, l = Wi(u, 30) >>> 0, u = c, c = d;
    }
    r[0] = r[0] + c >>> 0, r[1] = r[1] + u >>> 0, r[2] = r[2] + l >>> 0, r[3] = r[3] + f >>> 0, r[4] = r[4] + p >>> 0;
  }
  return [r[0] >> 24 & 255, r[0] >> 16 & 255, r[0] >> 8 & 255, r[0] & 255, r[1] >> 24 & 255, r[1] >> 16 & 255, r[1] >> 8 & 255, r[1] & 255, r[2] >> 24 & 255, r[2] >> 16 & 255, r[2] >> 8 & 255, r[2] & 255, r[3] >> 24 & 255, r[3] >> 16 & 255, r[3] >> 8 & 255, r[3] & 255, r[4] >> 24 & 255, r[4] >> 16 & 255, r[4] >> 8 & 255, r[4] & 255];
}
const py = ly("v5", 80, hy);
var Qo = py;
const Vl = "2.30.56", gy = {
  pageview: "pageview",
  event: "event"
};
class Dt {
  constructor(t, r) {
    if (!Jn(t))
      throw Error("Not a valid uuid");
    this.clientId = t, this.creationDate = Math.floor(r / 1e3);
  }
  toString() {
    return this.clientId.replace(/-/g, "") + "." + this.creationDate.toString();
  }
  get expired() {
    const t = Math.floor(Date.now() / 1e3) - this.creationDate;
    return t < 0 || t > Dt.expirationTime;
  }
  validate(t, r) {
    return !this.expired && this.matchReferrer(t, r);
  }
  matchReferrer(t, r) {
    try {
      const n = new URL(t);
      return r.some((i) => new RegExp(i.replace(/\\/g, "\\\\").replace(/\./g, "\\.").replace(/\*/g, ".*") + "$").test(n.host));
    } catch {
      return !1;
    }
  }
  static fromString(t) {
    const r = t.split(".");
    if (r.length !== 2)
      return null;
    const [n, i] = r;
    if (n.length !== 32 || isNaN(parseInt(i)))
      return null;
    const s = n.substring(0, 8) + "-" + n.substring(8, 12) + "-" + n.substring(12, 16) + "-" + n.substring(16, 20) + "-" + n.substring(20, 32);
    return Jn(s) ? new Dt(s, Number.parseInt(i) * 1e3) : null;
  }
}
Dt.cvo_cid = "cvo_cid";
Dt.expirationTime = 120;
const Ue = Object.keys;
function pn(e) {
  return e !== null && typeof e == "object" && !Array.isArray(e);
}
const Ki = 128, $l = 192, jo = 224, No = 240;
function my(e) {
  return (e & 248) === No ? 4 : (e & No) === jo ? 3 : (e & jo) === $l ? 2 : 1;
}
function yy(e, t) {
  if (t < 0 || e.length <= t)
    return e;
  let r = e.indexOf("%", t - 2);
  for (r < 0 || r > t ? r = t : t = r; r > 2 && e.charAt(r - 3) == "%"; ) {
    const n = Number.parseInt(e.substring(r - 2, r), 16);
    if ((n & Ki) != Ki)
      break;
    if (r -= 3, (n & $l) != Ki) {
      t - r >= my(n) * 3 && (r = t);
      break;
    }
  }
  return e.substring(0, r);
}
const zo = {
  id: "svc_ticket_id",
  subject: "svc_ticket_subject",
  description: "svc_ticket_description",
  category: "svc_ticket_category",
  productId: "svc_ticket_product_id",
  custom: "svc_ticket_custom"
}, vy = Ue(zo).map((e) => zo[e]), Sy = [...vy].join("|"), wy = new RegExp(`^(${Sy}$)`), by = {
  svcAction: "svc_action",
  svcActionData: "svc_action_data"
}, Cy = (e) => wy.test(e), Iy = [Cy], Bo = {
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
}, Ho = {
  id: "id",
  name: "nm",
  brand: "br",
  category: "ca",
  variant: "va",
  position: "ps",
  price: "pr",
  group: "group"
}, xe = {
  action: "pa",
  list: "pal",
  listSource: "pls"
}, Zn = {
  id: "ti",
  revenue: "tr",
  tax: "tt",
  shipping: "ts",
  coupon: "tcc",
  affiliation: "ta",
  step: "cos",
  option: "col"
}, Ay = [
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
], _s = {
  id: "quoteId",
  affiliation: "quoteAffiliation"
}, Ps = {
  id: "reviewId",
  rating: "reviewRating",
  comment: "reviewComment"
}, xy = {
  add: xe,
  bookmark_add: xe,
  bookmark_remove: xe,
  click: xe,
  checkout: xe,
  checkout_option: xe,
  detail: xe,
  impression: xe,
  remove: xe,
  refund: Object.assign(Object.assign({}, xe), Zn),
  purchase: Object.assign(Object.assign({}, xe), Zn),
  quickview: xe,
  quote: Object.assign(Object.assign({}, xe), _s),
  review: Object.assign(Object.assign({}, xe), Ps)
}, ky = Ue(Bo).map((e) => Bo[e]), Ry = Ue(Ho).map((e) => Ho[e]), qy = Ue(xe).map((e) => xe[e]), Oy = Ue(Zn).map((e) => Zn[e]), Fy = Ue(Ps).map((e) => Ps[e]), Ey = Ue(_s).map((e) => _s[e]), Dy = [...ky, "custom"].join("|"), Ty = [...Ry, "custom"].join("|"), Ll = "(pr[0-9]+)", Ql = "(il[0-9]+pi[0-9]+)", My = new RegExp(`^${Ll}(${Dy})$`), _y = new RegExp(`^(${Ql}(${Ty}))|(il[0-9]+nm)$`), Py = new RegExp(`^(${qy.join("|")})$`), Uy = new RegExp(`^(${Oy.join("|")})$`), Vy = new RegExp(`^${Ll}custom$`), $y = new RegExp(`^${Ql}custom$`), Ly = new RegExp(`^(${[...Ay, ...Fy, ...Ey].join("|")})$`), Qy = (e) => My.test(e), jy = (e) => _y.test(e), Ny = (e) => Py.test(e), zy = (e) => Uy.test(e), By = (e) => Ly.test(e), Hy = [
  jy,
  Qy,
  Ny,
  zy,
  By
], Yy = [Vy, $y], Wy = {
  anonymizeIp: "aip"
}, Ky = {
  eventCategory: "ec",
  eventAction: "ea",
  eventLabel: "el",
  eventValue: "ev",
  page: "dp",
  visitorId: "cid",
  clientId: "cid",
  userId: "uid",
  currencyCode: "cu"
}, Gy = {
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
}, Jy = [
  "contentId",
  "contentIdKey",
  "contentType",
  "searchHub",
  "tab",
  "searchUid",
  "permanentId",
  "contentLocale",
  "trackingId"
], Zy = Object.assign(Object.assign(Object.assign(Object.assign({}, Wy), Ky), Gy), Jy.reduce((e, t) => Object.assign(Object.assign({}, e), { [t]: t }), {})), Us = Object.assign(Object.assign({}, Zy), by), Xy = (e) => {
  const t = !!e.action && xy[e.action] || {};
  return Ue(e).reduce((r, n) => {
    const i = t[n] || Us[n] || n;
    return Object.assign(Object.assign({}, r), { [i]: e[n] });
  }, {});
}, ev = Ue(Us).map((e) => Us[e]), tv = (e) => ev.indexOf(e) !== -1, rv = (e) => e === "custom", nv = (e) => [...Hy, ...Iy, tv, rv].some((t) => t(e)), iv = (e) => Ue(e).reduce((t, r) => {
  const n = sv(r);
  return n ? Object.assign(Object.assign({}, t), av(n, e[r])) : Object.assign(Object.assign({}, t), { [r]: e[r] });
}, {}), sv = (e) => {
  let t;
  return [...Yy].every((r) => {
    var n;
    return t = (n = r.exec(e)) === null || n === void 0 ? void 0 : n[1], !t;
  }), t;
}, av = (e, t) => Ue(t).reduce((r, n) => Object.assign(Object.assign({}, r), { [`${e}${n}`]: t[n] }), {});
class ov {
  constructor(t) {
    this.opts = t;
  }
  sendEvent(t, r) {
    return _(this, void 0, void 0, function* () {
      if (!this.isAvailable())
        throw new Error('navigator.sendBeacon is not supported in this browser. Consider adding a polyfill like "sendbeacon-polyfill".');
      const { baseUrl: n, preprocessRequest: i } = this.opts, s = yield this.getQueryParamsForEventType(t), { url: a, payload: o } = yield this.preProcessRequestAsPotentialJSONString(`${n}/analytics/${t}?${s}`, r, i), c = this.encodeForEventType(t, o), u = new Blob([c], {
        type: "application/x-www-form-urlencoded"
      });
      navigator.sendBeacon(a, u);
    });
  }
  isAvailable() {
    return "sendBeacon" in navigator;
  }
  deleteHttpCookieVisitorId() {
    return Promise.resolve();
  }
  preProcessRequestAsPotentialJSONString(t, r, n) {
    return _(this, void 0, void 0, function* () {
      let i = t, s = r;
      if (n) {
        const a = yield n({ url: t, body: JSON.stringify(r) }, "analyticsBeacon"), { url: o, body: c } = a;
        i = o || t;
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
  encodeForEventType(t, r) {
    return this.isEventTypeLegacy(t) ? this.encodeEventToJson(t, r) : this.encodeEventToJson(t, r, this.opts.token);
  }
  getQueryParamsForEventType(t) {
    return _(this, void 0, void 0, function* () {
      const { token: r, visitorIdProvider: n } = this.opts, i = yield n.getCurrentVisitorId();
      return [
        r && this.isEventTypeLegacy(t) ? `access_token=${r}` : "",
        i ? `visitorId=${i}` : "",
        "discardVisitInfo=true"
      ].filter((s) => !!s).join("&");
    });
  }
  isEventTypeLegacy(t) {
    return [ae.click, ae.custom, ae.search, ae.view].indexOf(t) !== -1;
  }
  encodeEventToJson(t, r, n) {
    let i = `${t}Event=${encodeURIComponent(JSON.stringify(r))}`;
    return n && (i = `access_token=${encodeURIComponent(n)}&${i}`), i;
  }
}
class cv {
  sendEvent(t, r) {
    return _(this, void 0, void 0, function* () {
      return Promise.resolve();
    });
  }
  deleteHttpCookieVisitorId() {
    return _(this, void 0, void 0, function* () {
      return Promise.resolve();
    });
  }
}
const Yo = globalThis.fetch;
class jl {
  constructor(t) {
    this.opts = t;
  }
  sendEvent(t, r) {
    return _(this, void 0, void 0, function* () {
      const { baseUrl: n, visitorIdProvider: i, preprocessRequest: s } = this.opts, a = this.shouldAppendVisitorId(t) ? yield this.getVisitorIdParam() : "", o = {
        url: `${n}/analytics/${t}${a}`,
        credentials: "include",
        mode: "cors",
        headers: this.getHeaders(),
        method: "POST",
        body: JSON.stringify(r)
      }, c = Object.assign(Object.assign({}, o), s ? yield s(o, "analyticsFetch") : {}), { url: u } = c, l = Ye(c, ["url"]);
      let f;
      try {
        f = yield Yo(u, l);
      } catch (p) {
        console.error("An error has occured when sending the event.", p);
        return;
      }
      if (f.ok) {
        const p = yield f.json();
        return p.visitorId && i.setCurrentVisitorId(p.visitorId), p;
      } else {
        try {
          f.json();
        } catch {
        }
        throw console.error(`An error has occured when sending the "${t}" event.`, f, r), new Error(`An error has occurred when sending the "${t}" event. Check the console logs for more details.`);
      }
    });
  }
  deleteHttpCookieVisitorId() {
    return _(this, void 0, void 0, function* () {
      const { baseUrl: t } = this.opts, r = `${t}/analytics/visit`;
      yield Yo(r, { headers: this.getHeaders(), method: "DELETE" });
    });
  }
  shouldAppendVisitorId(t) {
    return [ae.click, ae.custom, ae.search, ae.view].indexOf(t) !== -1;
  }
  getVisitorIdParam() {
    return _(this, void 0, void 0, function* () {
      const { visitorIdProvider: t } = this.opts, r = yield t.getCurrentVisitorId();
      return r ? `?visitor=${r}` : "";
    });
  }
  getHeaders() {
    const { token: t } = this.opts;
    return Object.assign(Object.assign({}, t ? { Authorization: `Bearer ${t}` } : {}), { "Content-Type": "application/json" });
  }
}
class uv {
  constructor(t, r) {
    Ms() && _l() ? this.storage = new Jm() : Ms() ? this.storage = localStorage : (console.warn("BrowserRuntime detected no valid storage available.", this), this.storage = new mi()), this.client = new jl(t), this.beaconClient = new ov(t), window.addEventListener("beforeunload", () => {
      const n = r();
      for (let { eventType: i, payload: s } of n)
        this.beaconClient.sendEvent(i, s);
    });
  }
  getClientDependingOnEventType(t) {
    return t === "click" && this.beaconClient.isAvailable() ? this.beaconClient : this.client;
  }
}
class lv {
  constructor(t, r) {
    this.storage = r || new mi(), this.client = new jl(t);
  }
  getClientDependingOnEventType(t) {
    return this.client;
  }
}
class Nl {
  constructor() {
    this.storage = new mi(), this.client = new cv();
  }
  getClientDependingOnEventType(t) {
    return this.client;
  }
}
const dv = "xx", fv = (e) => (e == null ? void 0 : e.startsWith(dv)) || !1, hv = `
        We've detected you're using React Native but have not provided the corresponding runtime, 
        for an optimal experience please use the "coveo.analytics/react-native" subpackage.
        Follow the Readme on how to set it up: https://github.com/coveo/coveo.analytics.js#using-react-native
    `;
function pv() {
  return typeof navigator < "u" && navigator.product == "ReactNative";
}
const gv = ["1", 1, "yes", !0];
function Vs() {
  const e = [];
  return Ds() && e.push(window.doNotTrack), pa() && e.push(navigator.doNotTrack, navigator.msDoNotTrack, navigator.globalPrivacyControl), e.some((t) => gv.indexOf(t) !== -1);
}
const zl = "v15", Bl = {
  default: "https://analytics.cloud.coveo.com/rest/ua"
};
function mv(e = Bl.default, t = zl, r = !1) {
  if (e = e.replace(/\/$/, ""), r)
    return `${e}/${t}`;
  const n = e.endsWith("/rest") || e.endsWith("/rest/ua");
  return `${e}${n ? "" : "/rest"}/${t}`;
}
const yv = "38824e1f-37f5-42d3-8372-a4b8fa9df946";
class En {
  get defaultOptions() {
    return {
      endpoint: Bl.default,
      isCustomEndpoint: !1,
      token: "",
      version: zl,
      beforeSendHooks: [],
      afterSendHooks: []
    };
  }
  get version() {
    return Vl;
  }
  constructor(t) {
    if (this.acceptedLinkReferrers = [], !t)
      throw new Error("You have to pass options to this constructor");
    this.options = Object.assign(Object.assign({}, this.defaultOptions), t), this.visitorId = "", this.bufferedRequests = [], this.beforeSendHooks = [ty, Km].concat(this.options.beforeSendHooks), this.afterSendHooks = this.options.afterSendHooks, this.eventTypeMapping = {};
    const r = {
      baseUrl: this.baseUrl,
      token: this.options.token,
      visitorIdProvider: this,
      preprocessRequest: this.options.preprocessRequest
    };
    Vs() ? this.runtime = new Nl() : this.runtime = this.options.runtimeEnvironment || this.initRuntime(r), this.addEventTypeMapping(ae.view, { newEventType: ae.view, addClientIdParameter: !0 }), this.addEventTypeMapping(ae.click, { newEventType: ae.click, addClientIdParameter: !0 }), this.addEventTypeMapping(ae.custom, { newEventType: ae.custom, addClientIdParameter: !0 }), this.addEventTypeMapping(ae.search, { newEventType: ae.search, addClientIdParameter: !0 });
  }
  initRuntime(t) {
    return Ds() && Ts() ? new uv(t, () => {
      const r = [...this.bufferedRequests];
      return this.bufferedRequests = [], r;
    }) : (pv() && console.warn(hv), new lv(t));
  }
  get storage() {
    return this.runtime.storage;
  }
  determineVisitorId() {
    return _(this, void 0, void 0, function* () {
      try {
        return Ds() && this.extractClientIdFromLink(window.location.href) || (yield this.storage.getItem("visitorId")) || Yi();
      } catch (t) {
        return console.log("Could not get visitor ID from the current runtime environment storage. Using a random ID instead.", t), Yi();
      }
    });
  }
  getCurrentVisitorId() {
    return _(this, void 0, void 0, function* () {
      if (!this.visitorId) {
        const t = yield this.determineVisitorId();
        yield this.setCurrentVisitorId(t);
      }
      return this.visitorId;
    });
  }
  setCurrentVisitorId(t) {
    return _(this, void 0, void 0, function* () {
      this.visitorId = t, yield this.storage.setItem("visitorId", t);
    });
  }
  setClientId(t, r) {
    return _(this, void 0, void 0, function* () {
      if (Jn(t))
        this.setCurrentVisitorId(t.toLowerCase());
      else {
        if (!r)
          throw Error("Cannot generate uuid client id without a specific namespace string.");
        this.setCurrentVisitorId(Qo(t, Qo(r, yv)));
      }
    });
  }
  getParameters(t, ...r) {
    return _(this, void 0, void 0, function* () {
      return yield this.resolveParameters(t, ...r);
    });
  }
  getPayload(t, ...r) {
    return _(this, void 0, void 0, function* () {
      const n = yield this.resolveParameters(t, ...r);
      return yield this.resolvePayloadForParameters(t, n);
    });
  }
  get currentVisitorId() {
    return typeof (this.visitorId || this.storage.getItem("visitorId")) != "string" && this.setCurrentVisitorId(Yi()), this.visitorId;
  }
  set currentVisitorId(t) {
    this.visitorId = t, this.storage.setItem("visitorId", t);
  }
  extractClientIdFromLink(t) {
    if (Vs())
      return null;
    try {
      const r = new URL(t).searchParams.get(Dt.cvo_cid);
      if (r == null)
        return null;
      const n = Dt.fromString(r);
      return !n || !Ts() || !n.validate(document.referrer, this.acceptedLinkReferrers) ? null : n.clientId;
    } catch {
    }
    return null;
  }
  resolveParameters(t, ...r) {
    return _(this, void 0, void 0, function* () {
      const { variableLengthArgumentsNames: n = [], addVisitorIdParameter: i = !1, usesMeasurementProtocol: s = !1, addClientIdParameter: a = !1 } = this.eventTypeMapping[t] || {};
      return yield [
        (g) => n.length > 0 ? this.parseVariableArgumentsPayload(n, g) : g[0],
        (g) => _(this, void 0, void 0, function* () {
          return Object.assign(Object.assign({}, g), { visitorId: i ? yield this.getCurrentVisitorId() : "" });
        }),
        (g) => _(this, void 0, void 0, function* () {
          return a ? Object.assign(Object.assign({}, g), { clientId: yield this.getCurrentVisitorId() }) : g;
        }),
        (g) => s ? this.ensureAnonymousUserWhenUsingApiKey(g) : g,
        (g) => this.beforeSendHooks.reduce((h, d) => _(this, void 0, void 0, function* () {
          const m = yield h;
          return yield d(t, m);
        }), g)
      ].reduce((g, h) => _(this, void 0, void 0, function* () {
        const d = yield g;
        return yield h(d);
      }), Promise.resolve(r));
    });
  }
  resolvePayloadForParameters(t, r) {
    return _(this, void 0, void 0, function* () {
      const { usesMeasurementProtocol: n = !1 } = this.eventTypeMapping[t] || {};
      return yield [
        (f) => this.setTrackingIdIfTrackingIdNotPresent(f),
        (f) => this.removeEmptyPayloadValues(f, t),
        (f) => this.validateParams(f, t),
        (f) => n ? Xy(f) : f,
        (f) => n ? this.removeUnknownParameters(f) : f,
        (f) => n ? this.processCustomParameters(f) : this.mapCustomParametersToCustomData(f)
      ].reduce((f, p) => _(this, void 0, void 0, function* () {
        const g = yield f;
        return yield p(g);
      }), Promise.resolve(r));
    });
  }
  makeEvent(t, ...r) {
    return _(this, void 0, void 0, function* () {
      const { newEventType: n = t } = this.eventTypeMapping[t] || {}, i = yield this.resolveParameters(t, ...r), s = yield this.resolvePayloadForParameters(t, i);
      return {
        eventType: n,
        payload: s,
        log: (a) => _(this, void 0, void 0, function* () {
          return this.bufferedRequests.push({
            eventType: n,
            payload: Object.assign(Object.assign({}, s), a)
          }), yield Promise.all(this.afterSendHooks.map((o) => o(t, Object.assign(Object.assign({}, i), a)))), yield this.deferExecution(), yield this.sendFromBuffer();
        })
      };
    });
  }
  sendEvent(t, ...r) {
    return _(this, void 0, void 0, function* () {
      return (yield this.makeEvent(t, ...r)).log({});
    });
  }
  deferExecution() {
    return new Promise((t) => setTimeout(t, 0));
  }
  sendFromBuffer() {
    return _(this, void 0, void 0, function* () {
      const t = this.bufferedRequests.shift();
      if (t) {
        const { eventType: r, payload: n } = t;
        return this.runtime.getClientDependingOnEventType(r).sendEvent(r, n);
      }
    });
  }
  clear() {
    this.storage.removeItem("visitorId"), new Pl().clear();
  }
  deleteHttpOnlyVisitorId() {
    this.runtime.client.deleteHttpCookieVisitorId();
  }
  makeSearchEvent(t) {
    return _(this, void 0, void 0, function* () {
      return this.makeEvent(ae.search, t);
    });
  }
  sendSearchEvent(t) {
    return _(this, void 0, void 0, function* () {
      var { searchQueryUid: r } = t, n = Ye(t, ["searchQueryUid"]);
      return (yield this.makeSearchEvent(n)).log({ searchQueryUid: r });
    });
  }
  makeClickEvent(t) {
    return _(this, void 0, void 0, function* () {
      return this.makeEvent(ae.click, t);
    });
  }
  sendClickEvent(t) {
    return _(this, void 0, void 0, function* () {
      var { searchQueryUid: r } = t, n = Ye(t, ["searchQueryUid"]);
      return (yield this.makeClickEvent(n)).log({ searchQueryUid: r });
    });
  }
  makeCustomEvent(t) {
    return _(this, void 0, void 0, function* () {
      return this.makeEvent(ae.custom, t);
    });
  }
  sendCustomEvent(t) {
    return _(this, void 0, void 0, function* () {
      var { lastSearchQueryUid: r } = t, n = Ye(t, ["lastSearchQueryUid"]);
      return (yield this.makeCustomEvent(n)).log({ lastSearchQueryUid: r });
    });
  }
  makeViewEvent(t) {
    return _(this, void 0, void 0, function* () {
      return this.makeEvent(ae.view, t);
    });
  }
  sendViewEvent(t) {
    return _(this, void 0, void 0, function* () {
      return (yield this.makeViewEvent(t)).log({});
    });
  }
  getVisit() {
    return _(this, void 0, void 0, function* () {
      const r = yield (yield fetch(`${this.baseUrl}/analytics/visit`)).json();
      return this.visitorId = r.visitorId, r;
    });
  }
  getHealth() {
    return _(this, void 0, void 0, function* () {
      return yield (yield fetch(`${this.baseUrl}/analytics/monitoring/health`)).json();
    });
  }
  registerBeforeSendEventHook(t) {
    this.beforeSendHooks.push(t);
  }
  registerAfterSendEventHook(t) {
    this.afterSendHooks.push(t);
  }
  addEventTypeMapping(t, r) {
    this.eventTypeMapping[t] = r;
  }
  setAcceptedLinkReferrers(t) {
    if (Array.isArray(t) && t.every((r) => typeof r == "string"))
      this.acceptedLinkReferrers = t;
    else
      throw Error("Parameter should be an array of domain strings");
  }
  parseVariableArgumentsPayload(t, r) {
    const n = {};
    for (let i = 0, s = r.length; i < s; i++) {
      const a = r[i];
      if (typeof a == "string")
        n[t[i]] = a;
      else if (typeof a == "object")
        return Object.assign(Object.assign({}, n), a);
    }
    return n;
  }
  isKeyAllowedEmpty(t, r) {
    return ({
      [ae.search]: ["queryText"]
    }[t] || []).indexOf(r) !== -1;
  }
  removeEmptyPayloadValues(t, r) {
    const n = (i) => typeof i < "u" && i !== null && i !== "";
    return Object.keys(t).filter((i) => this.isKeyAllowedEmpty(r, i) || n(t[i])).reduce((i, s) => Object.assign(Object.assign({}, i), { [s]: t[s] }), {});
  }
  removeUnknownParameters(t) {
    return Object.keys(t).filter((n) => {
      if (nv(n))
        return !0;
      console.log(n, "is not processed by coveoua");
    }).reduce((n, i) => Object.assign(Object.assign({}, n), { [i]: t[i] }), {});
  }
  processCustomParameters(t) {
    const { custom: r } = t, n = Ye(t, ["custom"]);
    let i = {};
    r && pn(r) && (i = this.lowercaseKeys(r));
    const s = iv(n);
    return Object.assign(Object.assign({}, i), s);
  }
  mapCustomParametersToCustomData(t) {
    const { custom: r } = t, n = Ye(t, ["custom"]);
    if (r && pn(r)) {
      const i = this.lowercaseKeys(r);
      return Object.assign(Object.assign({}, n), { customData: Object.assign(Object.assign({}, i), t.customData) });
    } else
      return t;
  }
  lowercaseKeys(t) {
    const r = Object.keys(t);
    let n = {};
    return r.forEach((i) => {
      n[i.toLowerCase()] = t[i];
    }), n;
  }
  validateParams(t, r) {
    const { anonymizeIp: n } = t, i = Ye(t, ["anonymizeIp"]);
    return n !== void 0 && ["0", "false", "undefined", "null", "{}", "[]", ""].indexOf(`${n}`.toLowerCase()) == -1 && (i.anonymizeIp = 1), (r == ae.view || r == ae.click || r == ae.search || r == ae.custom) && (i.originLevel3 = this.limit(i.originLevel3, 1024)), r == ae.view && (i.location = this.limit(i.location, 1024)), (r == "pageview" || r == "event") && (i.referrer = this.limit(i.referrer, 2048), i.location = this.limit(i.location, 2048), i.page = this.limit(i.page, 2048)), i;
  }
  ensureAnonymousUserWhenUsingApiKey(t) {
    const { userId: r } = t, n = Ye(t, ["userId"]);
    return fv(this.options.token) && !r ? (n.userId = "anonymous", n) : t;
  }
  setTrackingIdIfTrackingIdNotPresent(t) {
    const { trackingId: r } = t, n = Ye(t, ["trackingId"]);
    return r ? t : (n.hasOwnProperty("custom") && pn(n.custom) && (n.custom.hasOwnProperty("context_website") || n.custom.hasOwnProperty("siteName")) && (n.trackingId = n.custom.context_website || n.custom.siteName), n.hasOwnProperty("customData") && pn(n.customData) && (n.customData.hasOwnProperty("context_website") || n.customData.hasOwnProperty("siteName")) && (n.trackingId = n.customData.context_website || n.customData.siteName), n);
  }
  limit(t, r) {
    return typeof t == "string" ? yy(t, r) : t;
  }
  get baseUrl() {
    return mv(this.options.endpoint, this.options.version, this.options.isCustomEndpoint);
  }
}
var We;
(function(e) {
  e.contextChanged = "contextChanged", e.expandToFullUI = "expandToFullUI", e.openUserActions = "openUserActions", e.showPrecedingSessions = "showPrecedingSessions", e.showFollowingSessions = "showFollowingSessions", e.clickViewedDocument = "clickViewedDocument", e.clickPageView = "clickPageView", e.createArticle = "createArticle";
})(We || (We = {}));
var P;
(function(e) {
  e.interfaceLoad = "interfaceLoad", e.interfaceChange = "interfaceChange", e.didyoumeanAutomatic = "didyoumeanAutomatic", e.didyoumeanClick = "didyoumeanClick", e.resultsSort = "resultsSort", e.searchboxSubmit = "searchboxSubmit", e.searchboxClear = "searchboxClear", e.searchboxAsYouType = "searchboxAsYouType", e.breadcrumbFacet = "breadcrumbFacet", e.breadcrumbResetAll = "breadcrumbResetAll", e.documentQuickview = "documentQuickview", e.documentOpen = "documentOpen", e.omniboxAnalytics = "omniboxAnalytics", e.omniboxFromLink = "omniboxFromLink", e.searchFromLink = "searchFromLink", e.triggerNotify = "notify", e.triggerExecute = "execute", e.triggerQuery = "query", e.undoTriggerQuery = "undoQuery", e.triggerRedirect = "redirect", e.pagerResize = "pagerResize", e.pagerNumber = "pagerNumber", e.pagerNext = "pagerNext", e.pagerPrevious = "pagerPrevious", e.pagerScrolling = "pagerScrolling", e.staticFilterClearAll = "staticFilterClearAll", e.staticFilterSelect = "staticFilterSelect", e.staticFilterDeselect = "staticFilterDeselect", e.facetClearAll = "facetClearAll", e.facetSearch = "facetSearch", e.facetSelect = "facetSelect", e.facetSelectAll = "facetSelectAll", e.facetDeselect = "facetDeselect", e.facetExclude = "facetExclude", e.facetUnexclude = "facetUnexclude", e.facetUpdateSort = "facetUpdateSort", e.facetShowMore = "showMoreFacetResults", e.facetShowLess = "showLessFacetResults", e.queryError = "query", e.queryErrorBack = "errorBack", e.queryErrorClear = "errorClearQuery", e.queryErrorRetry = "errorRetry", e.recommendation = "recommendation", e.recommendationInterfaceLoad = "recommendationInterfaceLoad", e.recommendationOpen = "recommendationOpen", e.likeSmartSnippet = "likeSmartSnippet", e.dislikeSmartSnippet = "dislikeSmartSnippet", e.expandSmartSnippet = "expandSmartSnippet", e.collapseSmartSnippet = "collapseSmartSnippet", e.openSmartSnippetFeedbackModal = "openSmartSnippetFeedbackModal", e.closeSmartSnippetFeedbackModal = "closeSmartSnippetFeedbackModal", e.sendSmartSnippetReason = "sendSmartSnippetReason", e.expandSmartSnippetSuggestion = "expandSmartSnippetSuggestion", e.collapseSmartSnippetSuggestion = "collapseSmartSnippetSuggestion", e.showMoreSmartSnippetSuggestion = "showMoreSmartSnippetSuggestion", e.showLessSmartSnippetSuggestion = "showLessSmartSnippetSuggestion", e.openSmartSnippetSource = "openSmartSnippetSource", e.openSmartSnippetSuggestionSource = "openSmartSnippetSuggestionSource", e.openSmartSnippetInlineLink = "openSmartSnippetInlineLink", e.openSmartSnippetSuggestionInlineLink = "openSmartSnippetSuggestionInlineLink", e.recentQueryClick = "recentQueriesClick", e.clearRecentQueries = "clearRecentQueries", e.recentResultClick = "recentResultClick", e.clearRecentResults = "clearRecentResults", e.noResultsBack = "noResultsBack", e.showMoreFoldedResults = "showMoreFoldedResults", e.showLessFoldedResults = "showLessFoldedResults", e.copyToClipboard = "copyToClipboard", e.caseSendEmail = "Case.SendEmail", e.feedItemTextPost = "FeedItem.TextPost", e.caseAttach = "caseAttach", e.caseDetach = "caseDetach", e.retryGeneratedAnswer = "retryGeneratedAnswer", e.likeGeneratedAnswer = "likeGeneratedAnswer", e.dislikeGeneratedAnswer = "dislikeGeneratedAnswer", e.openGeneratedAnswerSource = "openGeneratedAnswerSource", e.generatedAnswerOpenInlineLink = "generatedAnswerOpenInlineLink", e.generatedAnswerStreamEnd = "generatedAnswerStreamEnd", e.generatedAnswerSourceHover = "generatedAnswerSourceHover", e.generatedAnswerCopyToClipboard = "generatedAnswerCopyToClipboard", e.generatedAnswerHideAnswers = "generatedAnswerHideAnswers", e.generatedAnswerShowAnswers = "generatedAnswerShowAnswers", e.generatedAnswerExpand = "generatedAnswerExpand", e.generatedAnswerCollapse = "generatedAnswerCollapse", e.generatedAnswerFeedbackSubmit = "generatedAnswerFeedbackSubmit", e.rephraseGeneratedAnswer = "rephraseGeneratedAnswer", e.generatedAnswerFeedbackSubmitV2 = "generatedAnswerFeedbackSubmitV2", e.generatedAnswerCitationClick = "generatedAnswerCitationClick", e.generatedAnswerFollowupOpenSource = "generatedAnswerFollowupOpenSource", e.generatedAnswerCitationDocumentAttach = "generatedAnswerCitationDocumentAttach";
})(P || (P = {}));
const Wo = {
  [P.triggerNotify]: "queryPipelineTriggers",
  [P.triggerExecute]: "queryPipelineTriggers",
  [P.triggerQuery]: "queryPipelineTriggers",
  [P.triggerRedirect]: "queryPipelineTriggers",
  [P.queryErrorBack]: "errors",
  [P.queryErrorClear]: "errors",
  [P.queryErrorRetry]: "errors",
  [P.pagerNext]: "getMoreResults",
  [P.pagerPrevious]: "getMoreResults",
  [P.pagerNumber]: "getMoreResults",
  [P.pagerResize]: "getMoreResults",
  [P.pagerScrolling]: "getMoreResults",
  [P.facetSearch]: "facet",
  [P.facetShowLess]: "facet",
  [P.facetShowMore]: "facet",
  [P.recommendation]: "recommendation",
  [P.likeSmartSnippet]: "smartSnippet",
  [P.dislikeSmartSnippet]: "smartSnippet",
  [P.expandSmartSnippet]: "smartSnippet",
  [P.collapseSmartSnippet]: "smartSnippet",
  [P.openSmartSnippetFeedbackModal]: "smartSnippet",
  [P.closeSmartSnippetFeedbackModal]: "smartSnippet",
  [P.sendSmartSnippetReason]: "smartSnippet",
  [P.expandSmartSnippetSuggestion]: "smartSnippetSuggestions",
  [P.collapseSmartSnippetSuggestion]: "smartSnippetSuggestions",
  [P.showMoreSmartSnippetSuggestion]: "smartSnippetSuggestions",
  [P.showLessSmartSnippetSuggestion]: "smartSnippetSuggestions",
  [P.clearRecentQueries]: "recentQueries",
  [P.recentResultClick]: "recentlyClickedDocuments",
  [P.clearRecentResults]: "recentlyClickedDocuments",
  [P.showLessFoldedResults]: "folding",
  [P.caseDetach]: "case",
  [P.likeGeneratedAnswer]: "generatedAnswer",
  [P.dislikeGeneratedAnswer]: "generatedAnswer",
  [P.openGeneratedAnswerSource]: "generatedAnswer",
  [P.generatedAnswerOpenInlineLink]: "generatedAnswer",
  [P.generatedAnswerFollowupOpenSource]: "generatedAnswer",
  [P.generatedAnswerStreamEnd]: "generatedAnswer",
  [P.generatedAnswerSourceHover]: "generatedAnswer",
  [P.generatedAnswerCopyToClipboard]: "generatedAnswer",
  [P.generatedAnswerHideAnswers]: "generatedAnswer",
  [P.generatedAnswerShowAnswers]: "generatedAnswer",
  [P.generatedAnswerExpand]: "generatedAnswer",
  [P.generatedAnswerCollapse]: "generatedAnswer",
  [P.generatedAnswerFeedbackSubmit]: "generatedAnswer",
  [P.generatedAnswerFeedbackSubmitV2]: "generatedAnswer",
  [We.expandToFullUI]: "interface",
  [We.openUserActions]: "User Actions",
  [We.showPrecedingSessions]: "User Actions",
  [We.showFollowingSessions]: "User Actions",
  [We.clickViewedDocument]: "User Actions",
  [We.clickPageView]: "User Actions",
  [We.createArticle]: "createArticle"
};
class Ko {
  constructor() {
    this.runtime = new Nl(), this.currentVisitorId = "";
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
    return Vl;
  }
}
function vv(e) {
  let t = "";
  return e.filter((r) => {
    const n = r !== t;
    return t = r, n;
  });
}
function Sv(e) {
  return e.map((t) => t.replace(/;/g, ""));
}
function Hl(e) {
  const r = e.join(";");
  return r.length <= 256 ? r : Hl(e.slice(1));
}
const Go = (e) => {
  const t = Sv(e), r = vv(t);
  return Hl(r);
};
function Jo(e) {
  const t = typeof e.partialQueries == "string" ? e.partialQueries : Go(e.partialQueries), r = typeof e.suggestions == "string" ? e.suggestions : Go(e.suggestions);
  return Object.assign(Object.assign({}, e), {
    partialQueries: t,
    suggestions: r
  });
}
class wv {
  constructor(t, r) {
    this.opts = t, this.provider = r;
    const n = t.enableAnalytics === !1 || Vs();
    this.coveoAnalyticsClient = n ? new Ko() : new En(t);
  }
  disable() {
    this.coveoAnalyticsClient = new Ko();
  }
  enable() {
    this.coveoAnalyticsClient = new En(this.opts);
  }
  makeInterfaceLoad() {
    return this.makeSearchEvent(P.interfaceLoad);
  }
  logInterfaceLoad() {
    return _(this, void 0, void 0, function* () {
      return (yield this.makeInterfaceLoad()).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeRecommendationInterfaceLoad() {
    return this.makeSearchEvent(P.recommendationInterfaceLoad);
  }
  logRecommendationInterfaceLoad() {
    return _(this, void 0, void 0, function* () {
      return (yield this.makeRecommendationInterfaceLoad()).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeRecommendation() {
    return this.makeCustomEvent(P.recommendation);
  }
  logRecommendation() {
    return _(this, void 0, void 0, function* () {
      return (yield this.makeRecommendation()).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeRecommendationOpen(t, r) {
    return this.makeClickEvent(P.recommendationOpen, t, r);
  }
  logRecommendationOpen(t, r) {
    return _(this, void 0, void 0, function* () {
      return (yield this.makeRecommendationOpen(t, r)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeStaticFilterClearAll(t) {
    return this.makeSearchEvent(P.staticFilterClearAll, t);
  }
  logStaticFilterClearAll(t) {
    return _(this, void 0, void 0, function* () {
      return (yield this.makeStaticFilterClearAll(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeStaticFilterSelect(t) {
    return this.makeSearchEvent(P.staticFilterSelect, t);
  }
  logStaticFilterSelect(t) {
    return _(this, void 0, void 0, function* () {
      return (yield this.makeStaticFilterSelect(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeStaticFilterDeselect(t) {
    return this.makeSearchEvent(P.staticFilterDeselect, t);
  }
  logStaticFilterDeselect(t) {
    return _(this, void 0, void 0, function* () {
      return (yield this.makeStaticFilterDeselect(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeFetchMoreResults() {
    return this.makeCustomEvent(P.pagerScrolling, { type: "getMoreResults" });
  }
  logFetchMoreResults() {
    return _(this, void 0, void 0, function* () {
      return (yield this.makeFetchMoreResults()).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeInterfaceChange(t) {
    return this.makeSearchEvent(P.interfaceChange, t);
  }
  logInterfaceChange(t) {
    return _(this, void 0, void 0, function* () {
      return (yield this.makeInterfaceChange(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeDidYouMeanAutomatic() {
    return this.makeSearchEvent(P.didyoumeanAutomatic);
  }
  logDidYouMeanAutomatic() {
    return _(this, void 0, void 0, function* () {
      return (yield this.makeDidYouMeanAutomatic()).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeDidYouMeanClick() {
    return this.makeSearchEvent(P.didyoumeanClick);
  }
  logDidYouMeanClick() {
    return _(this, void 0, void 0, function* () {
      return (yield this.makeDidYouMeanClick()).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeResultsSort(t) {
    return this.makeSearchEvent(P.resultsSort, t);
  }
  logResultsSort(t) {
    return _(this, void 0, void 0, function* () {
      return (yield this.makeResultsSort(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeSearchboxSubmit() {
    return this.makeSearchEvent(P.searchboxSubmit);
  }
  logSearchboxSubmit() {
    return _(this, void 0, void 0, function* () {
      return (yield this.makeSearchboxSubmit()).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeSearchboxClear() {
    return this.makeSearchEvent(P.searchboxClear);
  }
  logSearchboxClear() {
    return _(this, void 0, void 0, function* () {
      return (yield this.makeSearchboxClear()).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeSearchboxAsYouType() {
    return this.makeSearchEvent(P.searchboxAsYouType);
  }
  logSearchboxAsYouType() {
    return _(this, void 0, void 0, function* () {
      return (yield this.makeSearchboxAsYouType()).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeBreadcrumbFacet(t) {
    return this.makeSearchEvent(P.breadcrumbFacet, t);
  }
  logBreadcrumbFacet(t) {
    return _(this, void 0, void 0, function* () {
      return (yield this.makeBreadcrumbFacet(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeBreadcrumbResetAll() {
    return this.makeSearchEvent(P.breadcrumbResetAll);
  }
  logBreadcrumbResetAll() {
    return _(this, void 0, void 0, function* () {
      return (yield this.makeBreadcrumbResetAll()).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeDocumentQuickview(t, r) {
    return this.makeClickEvent(P.documentQuickview, t, r);
  }
  logDocumentQuickview(t, r) {
    return _(this, void 0, void 0, function* () {
      return (yield this.makeDocumentQuickview(t, r)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeDocumentOpen(t, r) {
    return this.makeClickEvent(P.documentOpen, t, r);
  }
  logDocumentOpen(t, r) {
    return _(this, void 0, void 0, function* () {
      return (yield this.makeDocumentOpen(t, r)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeOmniboxAnalytics(t) {
    return this.makeSearchEvent(P.omniboxAnalytics, Jo(t));
  }
  logOmniboxAnalytics(t) {
    return _(this, void 0, void 0, function* () {
      return (yield this.makeOmniboxAnalytics(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeOmniboxFromLink(t) {
    return this.makeSearchEvent(P.omniboxFromLink, Jo(t));
  }
  logOmniboxFromLink(t) {
    return _(this, void 0, void 0, function* () {
      return (yield this.makeOmniboxFromLink(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeSearchFromLink() {
    return this.makeSearchEvent(P.searchFromLink);
  }
  logSearchFromLink() {
    return _(this, void 0, void 0, function* () {
      return (yield this.makeSearchFromLink()).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeTriggerNotify(t) {
    return this.makeCustomEvent(P.triggerNotify, t);
  }
  logTriggerNotify(t) {
    return _(this, void 0, void 0, function* () {
      return (yield this.makeTriggerNotify(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeTriggerExecute(t) {
    return this.makeCustomEvent(P.triggerExecute, t);
  }
  logTriggerExecute(t) {
    return _(this, void 0, void 0, function* () {
      return (yield this.makeTriggerExecute(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeTriggerQuery() {
    return this.makeCustomEvent(P.triggerQuery, { query: this.provider.getSearchEventRequestPayload().queryText }, "queryPipelineTriggers");
  }
  logTriggerQuery() {
    return _(this, void 0, void 0, function* () {
      return (yield this.makeTriggerQuery()).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeUndoTriggerQuery(t) {
    return this.makeSearchEvent(P.undoTriggerQuery, t);
  }
  logUndoTriggerQuery(t) {
    return _(this, void 0, void 0, function* () {
      return (yield this.makeUndoTriggerQuery(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeTriggerRedirect(t) {
    return this.makeCustomEvent(P.triggerRedirect, Object.assign(Object.assign({}, t), { query: this.provider.getSearchEventRequestPayload().queryText }));
  }
  logTriggerRedirect(t) {
    return _(this, void 0, void 0, function* () {
      return (yield this.makeTriggerRedirect(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makePagerResize(t) {
    return this.makeCustomEvent(P.pagerResize, t);
  }
  logPagerResize(t) {
    return _(this, void 0, void 0, function* () {
      return (yield this.makePagerResize(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makePagerNumber(t) {
    return this.makeCustomEvent(P.pagerNumber, t);
  }
  logPagerNumber(t) {
    return _(this, void 0, void 0, function* () {
      return (yield this.makePagerNumber(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makePagerNext(t) {
    return this.makeCustomEvent(P.pagerNext, t);
  }
  logPagerNext(t) {
    return _(this, void 0, void 0, function* () {
      return (yield this.makePagerNext(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makePagerPrevious(t) {
    return this.makeCustomEvent(P.pagerPrevious, t);
  }
  logPagerPrevious(t) {
    return _(this, void 0, void 0, function* () {
      return (yield this.makePagerPrevious(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makePagerScrolling() {
    return this.makeCustomEvent(P.pagerScrolling);
  }
  logPagerScrolling() {
    return _(this, void 0, void 0, function* () {
      return (yield this.makePagerScrolling()).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeFacetClearAll(t) {
    return this.makeSearchEvent(P.facetClearAll, t);
  }
  logFacetClearAll(t) {
    return _(this, void 0, void 0, function* () {
      return (yield this.makeFacetClearAll(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeFacetSearch(t) {
    return this.makeSearchEvent(P.facetSearch, t);
  }
  logFacetSearch(t) {
    return _(this, void 0, void 0, function* () {
      return (yield this.makeFacetSearch(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeFacetSelect(t) {
    return this.makeSearchEvent(P.facetSelect, t);
  }
  logFacetSelect(t) {
    return _(this, void 0, void 0, function* () {
      return (yield this.makeFacetSelect(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeFacetDeselect(t) {
    return this.makeSearchEvent(P.facetDeselect, t);
  }
  logFacetDeselect(t) {
    return _(this, void 0, void 0, function* () {
      return (yield this.makeFacetDeselect(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeFacetExclude(t) {
    return this.makeSearchEvent(P.facetExclude, t);
  }
  logFacetExclude(t) {
    return _(this, void 0, void 0, function* () {
      return (yield this.makeFacetExclude(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeFacetUnexclude(t) {
    return this.makeSearchEvent(P.facetUnexclude, t);
  }
  logFacetUnexclude(t) {
    return _(this, void 0, void 0, function* () {
      return (yield this.makeFacetUnexclude(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeFacetSelectAll(t) {
    return this.makeSearchEvent(P.facetSelectAll, t);
  }
  logFacetSelectAll(t) {
    return _(this, void 0, void 0, function* () {
      return (yield this.makeFacetSelectAll(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeFacetUpdateSort(t) {
    return this.makeSearchEvent(P.facetUpdateSort, t);
  }
  logFacetUpdateSort(t) {
    return _(this, void 0, void 0, function* () {
      return (yield this.makeFacetUpdateSort(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeFacetShowMore(t) {
    return this.makeCustomEvent(P.facetShowMore, t);
  }
  logFacetShowMore(t) {
    return _(this, void 0, void 0, function* () {
      return (yield this.makeFacetShowMore(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeFacetShowLess(t) {
    return this.makeCustomEvent(P.facetShowLess, t);
  }
  logFacetShowLess(t) {
    return _(this, void 0, void 0, function* () {
      return (yield this.makeFacetShowLess(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeQueryError(t) {
    return this.makeCustomEvent(P.queryError, t);
  }
  logQueryError(t) {
    return _(this, void 0, void 0, function* () {
      return (yield this.makeQueryError(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeQueryErrorBack() {
    return _(this, void 0, void 0, function* () {
      const t = yield this.makeCustomEvent(P.queryErrorBack);
      return {
        description: t.description,
        log: () => _(this, void 0, void 0, function* () {
          return yield t.log({ searchUID: this.provider.getSearchUID() }), this.logSearchEvent(P.queryErrorBack);
        })
      };
    });
  }
  logQueryErrorBack() {
    return _(this, void 0, void 0, function* () {
      return (yield this.makeQueryErrorBack()).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeQueryErrorRetry() {
    return _(this, void 0, void 0, function* () {
      const t = yield this.makeCustomEvent(P.queryErrorRetry);
      return {
        description: t.description,
        log: () => _(this, void 0, void 0, function* () {
          return yield t.log({ searchUID: this.provider.getSearchUID() }), this.logSearchEvent(P.queryErrorRetry);
        })
      };
    });
  }
  logQueryErrorRetry() {
    return _(this, void 0, void 0, function* () {
      return (yield this.makeQueryErrorRetry()).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeQueryErrorClear() {
    return _(this, void 0, void 0, function* () {
      const t = yield this.makeCustomEvent(P.queryErrorClear);
      return {
        description: t.description,
        log: () => _(this, void 0, void 0, function* () {
          return yield t.log({ searchUID: this.provider.getSearchUID() }), this.logSearchEvent(P.queryErrorClear);
        })
      };
    });
  }
  logQueryErrorClear() {
    return _(this, void 0, void 0, function* () {
      return (yield this.makeQueryErrorClear()).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeLikeSmartSnippet() {
    return this.makeCustomEvent(P.likeSmartSnippet);
  }
  logLikeSmartSnippet() {
    return _(this, void 0, void 0, function* () {
      return (yield this.makeLikeSmartSnippet()).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeDislikeSmartSnippet() {
    return this.makeCustomEvent(P.dislikeSmartSnippet);
  }
  logDislikeSmartSnippet() {
    return _(this, void 0, void 0, function* () {
      return (yield this.makeDislikeSmartSnippet()).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeExpandSmartSnippet() {
    return this.makeCustomEvent(P.expandSmartSnippet);
  }
  logExpandSmartSnippet() {
    return _(this, void 0, void 0, function* () {
      return (yield this.makeExpandSmartSnippet()).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeCollapseSmartSnippet() {
    return this.makeCustomEvent(P.collapseSmartSnippet);
  }
  logCollapseSmartSnippet() {
    return _(this, void 0, void 0, function* () {
      return (yield this.makeCollapseSmartSnippet()).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeOpenSmartSnippetFeedbackModal() {
    return this.makeCustomEvent(P.openSmartSnippetFeedbackModal);
  }
  logOpenSmartSnippetFeedbackModal() {
    return _(this, void 0, void 0, function* () {
      return (yield this.makeOpenSmartSnippetFeedbackModal()).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeCloseSmartSnippetFeedbackModal() {
    return this.makeCustomEvent(P.closeSmartSnippetFeedbackModal);
  }
  logCloseSmartSnippetFeedbackModal() {
    return _(this, void 0, void 0, function* () {
      return (yield this.makeCloseSmartSnippetFeedbackModal()).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeSmartSnippetFeedbackReason(t, r) {
    return this.makeCustomEvent(P.sendSmartSnippetReason, { reason: t, details: r });
  }
  logSmartSnippetFeedbackReason(t, r) {
    return _(this, void 0, void 0, function* () {
      return (yield this.makeSmartSnippetFeedbackReason(t, r)).log({
        searchUID: this.provider.getSearchUID()
      });
    });
  }
  makeExpandSmartSnippetSuggestion(t) {
    return this.makeCustomEvent(P.expandSmartSnippetSuggestion, "documentId" in t ? t : { documentId: t });
  }
  logExpandSmartSnippetSuggestion(t) {
    return _(this, void 0, void 0, function* () {
      return (yield this.makeExpandSmartSnippetSuggestion(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeCollapseSmartSnippetSuggestion(t) {
    return this.makeCustomEvent(P.collapseSmartSnippetSuggestion, "documentId" in t ? t : { documentId: t });
  }
  logCollapseSmartSnippetSuggestion(t) {
    return _(this, void 0, void 0, function* () {
      return (yield this.makeCollapseSmartSnippetSuggestion(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeShowMoreSmartSnippetSuggestion(t) {
    return this.makeCustomEvent(P.showMoreSmartSnippetSuggestion, t);
  }
  logShowMoreSmartSnippetSuggestion(t) {
    return _(this, void 0, void 0, function* () {
      return (yield this.makeShowMoreSmartSnippetSuggestion(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeShowLessSmartSnippetSuggestion(t) {
    return this.makeCustomEvent(P.showLessSmartSnippetSuggestion, t);
  }
  logShowLessSmartSnippetSuggestion(t) {
    return _(this, void 0, void 0, function* () {
      return (yield this.makeShowLessSmartSnippetSuggestion(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeOpenSmartSnippetSource(t, r) {
    return this.makeClickEvent(P.openSmartSnippetSource, t, r);
  }
  logOpenSmartSnippetSource(t, r) {
    return _(this, void 0, void 0, function* () {
      return (yield this.makeOpenSmartSnippetSource(t, r)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeOpenSmartSnippetSuggestionSource(t, r) {
    return this.makeClickEvent(P.openSmartSnippetSuggestionSource, t, { contentIDKey: r.documentId.contentIdKey, contentIDValue: r.documentId.contentIdValue }, r);
  }
  makeCopyToClipboard(t, r) {
    return this.makeClickEvent(P.copyToClipboard, t, r);
  }
  logCopyToClipboard(t, r) {
    return _(this, void 0, void 0, function* () {
      return (yield this.makeCopyToClipboard(t, r)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  logOpenSmartSnippetSuggestionSource(t, r) {
    return _(this, void 0, void 0, function* () {
      return (yield this.makeOpenSmartSnippetSuggestionSource(t, r)).log({
        searchUID: this.provider.getSearchUID()
      });
    });
  }
  makeOpenSmartSnippetInlineLink(t, r) {
    return this.makeClickEvent(P.openSmartSnippetInlineLink, t, { contentIDKey: r.contentIDKey, contentIDValue: r.contentIDValue }, r);
  }
  logOpenSmartSnippetInlineLink(t, r) {
    return _(this, void 0, void 0, function* () {
      return (yield this.makeOpenSmartSnippetInlineLink(t, r)).log({
        searchUID: this.provider.getSearchUID()
      });
    });
  }
  makeOpenSmartSnippetSuggestionInlineLink(t, r) {
    return this.makeClickEvent(P.openSmartSnippetSuggestionInlineLink, t, {
      contentIDKey: r.documentId.contentIdKey,
      contentIDValue: r.documentId.contentIdValue
    }, r);
  }
  logOpenSmartSnippetSuggestionInlineLink(t, r) {
    return _(this, void 0, void 0, function* () {
      return (yield this.makeOpenSmartSnippetSuggestionInlineLink(t, r)).log({
        searchUID: this.provider.getSearchUID()
      });
    });
  }
  makeRecentQueryClick() {
    return this.makeSearchEvent(P.recentQueryClick);
  }
  logRecentQueryClick() {
    return _(this, void 0, void 0, function* () {
      return (yield this.makeRecentQueryClick()).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeClearRecentQueries() {
    return this.makeCustomEvent(P.clearRecentQueries);
  }
  logClearRecentQueries() {
    return _(this, void 0, void 0, function* () {
      return (yield this.makeClearRecentQueries()).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeRecentResultClick(t, r) {
    return this.makeCustomEvent(P.recentResultClick, { info: t, identifier: r });
  }
  logRecentResultClick(t, r) {
    return _(this, void 0, void 0, function* () {
      return (yield this.makeRecentResultClick(t, r)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeClearRecentResults() {
    return this.makeCustomEvent(P.clearRecentResults);
  }
  logClearRecentResults() {
    return _(this, void 0, void 0, function* () {
      return (yield this.makeClearRecentResults()).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeNoResultsBack() {
    return this.makeSearchEvent(P.noResultsBack);
  }
  logNoResultsBack() {
    return _(this, void 0, void 0, function* () {
      return (yield this.makeNoResultsBack()).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeShowMoreFoldedResults(t, r) {
    return this.makeClickEvent(P.showMoreFoldedResults, t, r);
  }
  logShowMoreFoldedResults(t, r) {
    return _(this, void 0, void 0, function* () {
      return (yield this.makeShowMoreFoldedResults(t, r)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeShowLessFoldedResults() {
    return this.makeCustomEvent(P.showLessFoldedResults);
  }
  logShowLessFoldedResults() {
    return _(this, void 0, void 0, function* () {
      return (yield this.makeShowLessFoldedResults()).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeEventDescription(t, r) {
    var n;
    return { actionCause: r, customData: (n = t.payload) === null || n === void 0 ? void 0 : n.customData };
  }
  makeCustomEvent(t, r) {
    return _(this, arguments, void 0, function* (n, i, s = Wo[n]) {
      this.coveoAnalyticsClient.getParameters;
      const a = Object.assign(Object.assign({}, this.provider.getBaseMetadata()), i), o = Object.assign(Object.assign({}, yield this.getBaseEventRequest(a)), { eventType: s, eventValue: n }), c = yield this.coveoAnalyticsClient.makeCustomEvent(o);
      return {
        description: this.makeEventDescription(c, n),
        log: ({ searchUID: u }) => c.log({ lastSearchQueryUid: u })
      };
    });
  }
  logCustomEvent(t, r) {
    return _(this, arguments, void 0, function* (n, i, s = Wo[n]) {
      return (yield this.makeCustomEvent(n, i, s)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeCustomEventWithType(t, r, n) {
    return _(this, void 0, void 0, function* () {
      const i = Object.assign(Object.assign({}, this.provider.getBaseMetadata()), n), s = Object.assign(Object.assign({}, yield this.getBaseEventRequest(i)), {
        eventType: r,
        eventValue: t
      }), a = yield this.coveoAnalyticsClient.makeCustomEvent(s);
      return {
        description: this.makeEventDescription(a, t),
        log: ({ searchUID: o }) => a.log({ lastSearchQueryUid: o })
      };
    });
  }
  logCustomEventWithType(t, r, n) {
    return _(this, void 0, void 0, function* () {
      return (yield this.makeCustomEventWithType(t, r, n)).log({
        searchUID: this.provider.getSearchUID()
      });
    });
  }
  logSearchEvent(t, r) {
    return _(this, void 0, void 0, function* () {
      return (yield this.makeSearchEvent(t, r)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeSearchEvent(t, r) {
    return _(this, void 0, void 0, function* () {
      const n = yield this.getBaseSearchEventRequest(t, r), i = yield this.coveoAnalyticsClient.makeSearchEvent(n);
      return {
        description: this.makeEventDescription(i, t),
        log: ({ searchUID: s }) => i.log({ searchQueryUid: s })
      };
    });
  }
  makeClickEvent(t, r, n, i) {
    return _(this, void 0, void 0, function* () {
      const s = Object.assign(Object.assign(Object.assign({}, r), yield this.getBaseEventRequest(Object.assign(Object.assign({}, n), i))), { queryPipeline: this.provider.getPipeline(), actionCause: t }), a = yield this.coveoAnalyticsClient.makeClickEvent(s);
      return {
        description: this.makeEventDescription(a, t),
        log: ({ searchUID: o }) => a.log({ searchQueryUid: o })
      };
    });
  }
  logClickEvent(t, r, n, i) {
    return _(this, void 0, void 0, function* () {
      return (yield this.makeClickEvent(t, r, n, i)).log({
        searchUID: this.provider.getSearchUID()
      });
    });
  }
  getBaseSearchEventRequest(t, r) {
    return _(this, void 0, void 0, function* () {
      var n, i;
      return Object.assign(Object.assign(Object.assign({}, yield this.getBaseEventRequest(Object.assign(Object.assign({}, r), (i = (n = this.provider).getGeneratedAnswerMetadata) === null || i === void 0 ? void 0 : i.call(n)))), this.provider.getSearchEventRequestPayload()), { queryPipeline: this.provider.getPipeline(), actionCause: t });
    });
  }
  getBaseEventRequest(t) {
    return _(this, void 0, void 0, function* () {
      const r = Object.assign(Object.assign({}, this.provider.getBaseMetadata()), t);
      return Object.assign(Object.assign(Object.assign({}, this.getOrigins()), this.getSplitTestRun()), { customData: r, language: this.provider.getLanguage(), facetState: this.provider.getFacetState ? this.provider.getFacetState() : [], anonymous: this.provider.getIsAnonymous(), clientId: yield this.getClientId() });
    });
  }
  getOrigins() {
    var t, r;
    return {
      originContext: (r = (t = this.provider).getOriginContext) === null || r === void 0 ? void 0 : r.call(t),
      originLevel1: this.provider.getOriginLevel1(),
      originLevel2: this.provider.getOriginLevel2(),
      originLevel3: this.provider.getOriginLevel3()
    };
  }
  getClientId() {
    return this.coveoAnalyticsClient instanceof En ? this.coveoAnalyticsClient.getCurrentVisitorId() : void 0;
  }
  getSplitTestRun() {
    const t = this.provider.getSplitTestRunName ? this.provider.getSplitTestRunName() : "", r = this.provider.getSplitTestRunVersion ? this.provider.getSplitTestRunVersion() : "";
    return Object.assign(Object.assign({}, t && { splitTestRunName: t }), r && { splitTestRunVersion: r });
  }
  makeLikeGeneratedAnswer(t) {
    return this.makeCustomEvent(P.likeGeneratedAnswer, t);
  }
  logLikeGeneratedAnswer(t) {
    return _(this, void 0, void 0, function* () {
      return (yield this.makeLikeGeneratedAnswer(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeDislikeGeneratedAnswer(t) {
    return this.makeCustomEvent(P.dislikeGeneratedAnswer, t);
  }
  logDislikeGeneratedAnswer(t) {
    return _(this, void 0, void 0, function* () {
      return (yield this.makeDislikeGeneratedAnswer(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeOpenGeneratedAnswerSource(t) {
    return this.makeCustomEvent(P.openGeneratedAnswerSource, t);
  }
  logOpenGeneratedAnswerSource(t) {
    return _(this, void 0, void 0, function* () {
      return (yield this.makeOpenGeneratedAnswerSource(t)).log({
        searchUID: this.provider.getSearchUID()
      });
    });
  }
  makeGeneratedAnswerOpenInlineLink(t) {
    return this.makeCustomEvent(P.generatedAnswerOpenInlineLink, t);
  }
  logGeneratedAnswerOpenInlineLink(t) {
    return _(this, void 0, void 0, function* () {
      return (yield this.makeGeneratedAnswerOpenInlineLink(t)).log({
        searchUID: this.provider.getSearchUID()
      });
    });
  }
  makeGeneratedAnswerCitationClick(t, r) {
    return this.makeClickEvent(P.generatedAnswerCitationClick, Object.assign(Object.assign({}, t), { documentPosition: 1 }), { contentIDKey: r.documentId.contentIdKey, contentIDValue: r.documentId.contentIdValue }, r);
  }
  logGeneratedAnswerCitationClick(t, r) {
    return _(this, void 0, void 0, function* () {
      return (yield this.makeGeneratedAnswerCitationClick(t, r)).log({
        searchUID: this.provider.getSearchUID()
      });
    });
  }
  makeGeneratedAnswerFollowupOpenSource(t) {
    return this.makeCustomEvent(P.generatedAnswerFollowupOpenSource, t);
  }
  logGeneratedAnswerFollowupOpenSource(t) {
    return _(this, void 0, void 0, function* () {
      return (yield this.makeGeneratedAnswerFollowupOpenSource(t)).log({
        searchUID: this.provider.getSearchUID()
      });
    });
  }
  makeGeneratedAnswerSourceHover(t) {
    return this.makeCustomEvent(P.generatedAnswerSourceHover, t);
  }
  logGeneratedAnswerSourceHover(t) {
    return _(this, void 0, void 0, function* () {
      return (yield this.makeGeneratedAnswerSourceHover(t)).log({
        searchUID: this.provider.getSearchUID()
      });
    });
  }
  makeGeneratedAnswerCopyToClipboard(t) {
    return this.makeCustomEvent(P.generatedAnswerCopyToClipboard, t);
  }
  logGeneratedAnswerCopyToClipboard(t) {
    return _(this, void 0, void 0, function* () {
      return (yield this.makeGeneratedAnswerCopyToClipboard(t)).log({
        searchUID: this.provider.getSearchUID()
      });
    });
  }
  makeGeneratedAnswerHideAnswers(t) {
    return this.makeCustomEvent(P.generatedAnswerHideAnswers, t);
  }
  logGeneratedAnswerHideAnswers(t) {
    return _(this, void 0, void 0, function* () {
      return (yield this.makeGeneratedAnswerHideAnswers(t)).log({
        searchUID: this.provider.getSearchUID()
      });
    });
  }
  makeGeneratedAnswerShowAnswers(t) {
    return this.makeCustomEvent(P.generatedAnswerShowAnswers, t);
  }
  logGeneratedAnswerShowAnswers(t) {
    return _(this, void 0, void 0, function* () {
      return (yield this.makeGeneratedAnswerShowAnswers(t)).log({
        searchUID: this.provider.getSearchUID()
      });
    });
  }
  makeGeneratedAnswerExpand(t) {
    return this.makeCustomEvent(P.generatedAnswerExpand, t);
  }
  logGeneratedAnswerExpand(t) {
    return _(this, void 0, void 0, function* () {
      return (yield this.makeGeneratedAnswerExpand(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeGeneratedAnswerCollapse(t) {
    return this.makeCustomEvent(P.generatedAnswerCollapse, t);
  }
  logGeneratedAnswerCollapse(t) {
    return _(this, void 0, void 0, function* () {
      return (yield this.makeGeneratedAnswerCollapse(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeGeneratedAnswerFeedbackSubmit(t) {
    return this.makeCustomEvent(P.generatedAnswerFeedbackSubmit, t);
  }
  logGeneratedAnswerFeedbackSubmit(t) {
    return _(this, void 0, void 0, function* () {
      return (yield this.makeGeneratedAnswerFeedbackSubmit(t)).log({
        searchUID: this.provider.getSearchUID()
      });
    });
  }
  makeGeneratedAnswerFeedbackSubmitV2(t) {
    return this.makeCustomEvent(P.generatedAnswerFeedbackSubmitV2, t);
  }
  logGeneratedAnswerFeedbackSubmitV2(t) {
    return _(this, void 0, void 0, function* () {
      return (yield this.makeGeneratedAnswerFeedbackSubmitV2(t)).log({
        searchUID: this.provider.getSearchUID()
      });
    });
  }
  makeRephraseGeneratedAnswer(t) {
    return this.makeSearchEvent(P.rephraseGeneratedAnswer, t);
  }
  logRephraseGeneratedAnswer(t) {
    return _(this, void 0, void 0, function* () {
      return (yield this.makeRephraseGeneratedAnswer(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeRetryGeneratedAnswer() {
    return this.makeSearchEvent(P.retryGeneratedAnswer);
  }
  logRetryGeneratedAnswer() {
    return _(this, void 0, void 0, function* () {
      return (yield this.makeRetryGeneratedAnswer()).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeGeneratedAnswerStreamEnd(t) {
    return this.makeCustomEvent(P.generatedAnswerStreamEnd, t);
  }
  logGeneratedAnswerStreamEnd(t) {
    return _(this, void 0, void 0, function* () {
      return (yield this.makeGeneratedAnswerStreamEnd(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
}
const Zo = Object.assign({}, gy);
Object.keys(Zo).map((e) => Zo[e]);
var Xo;
(function(e) {
  e.click = "click", e.flowStart = "flowStart";
})(Xo || (Xo = {}));
var ec;
(function(e) {
  e.enterInterface = "ticket_create_start", e.fieldUpdate = "ticket_field_update", e.fieldSuggestionClick = "ticket_classification_click", e.documentSuggestionClick = "documentSuggestionClick", e.documentSuggestionQuickview = "documentSuggestionQuickview", e.suggestionRate = "suggestion_rate", e.nextCaseStep = "ticket_next_stage", e.caseCancelled = "ticket_cancel", e.caseSolved = "ticket_cancel", e.caseCreated = "ticket_create";
})(ec || (ec = {}));
var tc;
(function(e) {
  e.quit = "Quit", e.solved = "Solved";
})(tc || (tc = {}));
const bv = (e) => new En(e).getCurrentVisitorId(), Cv = (e, t) => typeof t == "function" ? (...r) => {
  const n = rl(r[0]);
  try {
    return t.apply(t, r);
  } catch (i) {
    return e.error(i, "Error in analytics preprocessRequest. Returning original request."), n;
  }
} : void 0, Iv = (e, t) => (...r) => {
  const n = rl(r[1]);
  try {
    return t.apply(t, r);
  } catch (i) {
    return e.error(i, "Error in analytics hook. Returning original request."), n;
  }
}, Av = 1, xv = 20, Yl = 5, kv = 1, Wl = 8;
function Kl() {
  return {
    desiredCount: Yl,
    numberOfValues: Wl,
    set: {}
  };
}
const Rv = (e, t) => {
  var r;
  return (r = e.categoryFacetSet[t]) == null ? void 0 : r.request;
}, Gl = (e, t) => {
  const r = Rv(e, t);
  return Gp((r == null ? void 0 : r.currentValues) ?? []);
};
function Jl() {
  return {};
}
function qv(e, t) {
  return { request: e, tabs: t };
}
function ga() {
  return {};
}
function Ov(e, t) {
  return { request: e, tabs: t };
}
function ma() {
  return {};
}
function Fv(e, t) {
  return { request: e, hasBreadcrumbs: !0, tabs: t };
}
function ya() {
  return {};
}
function Ev(e) {
  return {
    facetSet: e.facetSet ?? ya(),
    categoryFacetSet: e.categoryFacetSet ?? Jl(),
    dateFacetSet: e.dateFacetSet ?? ga(),
    numericFacetSet: e.numericFacetSet ?? ma(),
    automaticFacetSet: e.automaticFacetSet ?? Kl()
  };
}
const Dv = (e) => {
  const t = [];
  return _v(e).forEach((r, n) => {
    const i = Nv(e, r.facetId), s = Qv(r, n + 1);
    if (Mv(r)) {
      if (!!!Gl(e, r.facetId).length)
        return;
      t.push({
        ...s,
        ...$v(e, r.facetId),
        facetType: i,
        state: "selected"
      });
      return;
    }
    r.currentValues.forEach((a, o) => {
      if (a.state === "idle")
        return;
      const c = rc(a, o + 1, i), u = Tv(r) ? nc(a) : Uv(a);
      t.push({
        ...s,
        ...c,
        ...u
      });
    });
  }), Pv(e).forEach((r, n) => {
    const i = Lv(r, n + 1);
    r.values.forEach((s, a) => {
      if (s.state === "idle")
        return;
      const o = rc(s, a + 1, "specific"), c = nc(s);
      t.push({
        ...i,
        ...o,
        ...c
      });
    });
  }), t;
}, Tv = (e) => e.type === "specific", Mv = (e) => e.type === "hierarchical", _v = (e) => [
  ...Object.values(e.facetSet),
  ...Object.values(e.categoryFacetSet),
  ...Object.values(e.dateFacetSet),
  ...Object.values(e.numericFacetSet)
].map((t) => t.request), Pv = (e) => [...Object.values(e.automaticFacetSet.set)].map((t) => t.response), rc = (e, t, r) => ({
  state: e.state,
  valuePosition: t,
  facetType: r
}), Uv = (e) => ({
  displayValue: `${e.start}..${e.end}`,
  value: `${e.start}..${e.end}`,
  start: e.start,
  end: e.end,
  endInclusive: e.endInclusive
}), nc = (e) => ({
  displayValue: e.value,
  value: e.value
}), Vv = (e, t) => Gl(e, t).map((n) => n.value).join(";"), $v = (e, t) => {
  const n = Vv(e, t);
  return {
    value: n,
    valuePosition: 1,
    displayValue: n
  };
}, Lv = (e, t) => ({
  title: Zl(e.field, e.field),
  field: e.field,
  id: e.field,
  facetPosition: t
}), Qv = (e, t) => ({
  title: Zl(e.field, e.facetId),
  field: e.field,
  id: e.facetId,
  facetPosition: t
}), Zl = (e, t) => `${e}_${t}`, jv = (e, t) => {
  var r, n, i, s, a;
  return ((r = e.facetSet[t]) == null ? void 0 : r.request) || ((n = e.categoryFacetSet[t]) == null ? void 0 : n.request) || ((i = e.dateFacetSet[t]) == null ? void 0 : i.request) || ((s = e.numericFacetSet[t]) == null ? void 0 : s.request) || ((a = e.automaticFacetSet.set[t]) == null ? void 0 : a.response);
}, Nv = (e, t) => {
  const r = jv(e, t);
  return r ? r.type : "specific";
}, zv = (e) => e.configuration.search.locale, Bv = (e) => e.configuration.search.timezone, Hv = (e) => {
  var t, r;
  return (r = (t = e.configuration) == null ? void 0 : t.knowledge) == null ? void 0 : r.agentId;
}, Xn = (e) => {
  var t, r, n, i;
  if (Yv(e) || Wv(e))
    return (t = e.generatedAnswer) == null ? void 0 : t.answerId;
  if (Kv(e))
    return (i = (n = (r = e.search) == null ? void 0 : r.response) == null ? void 0 : n.extendedResults) == null ? void 0 : i.generativeQuestionAnsweringId;
}, Yv = (e) => {
  var t;
  return "answer" in e && "generatedAnswer" in e && !X((t = e.generatedAnswer) == null ? void 0 : t.answerConfigurationId);
}, Wv = (e) => {
  const t = Hv(e);
  return "generatedAnswer" in e && typeof t == "string" && t.trim().length > 0;
}, Kv = (e) => "search" in e && e.search !== void 0 && typeof e.search == "object", Gv = (e) => {
  var t;
  return (t = e.generatedAnswer) == null ? void 0 : t.fieldsToIncludeInCitations;
}, Jv = (e) => {
  var t;
  return (t = e.followUpAnswers) == null ? void 0 : t.conversationId;
}, Zv = (e) => {
  var t;
  return (t = e.generatedAnswer) == null ? void 0 : t.citations;
}, Xv = (e) => {
  var t;
  return (t = e.followUpAnswers) == null ? void 0 : t.followUpAnswers;
}, eS = fe(Xv, (e) => e == null ? void 0 : e.flatMap((t) => t.citations)), tS = (e, t) => t;
fe(Zv, eS, tS, (e, t, r) => (e == null ? void 0 : e.find((n) => n.id === r)) ?? (t == null ? void 0 : t.find((n) => n.id === r)));
const cr = () => ({
  q: "",
  enableQuerySyntax: !1
});
function $s() {
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
function ft() {
  return {
    response: {
      results: [],
      searchUid: "",
      totalCountFiltered: 0,
      facets: [],
      generateAutomaticFacets: { facets: [] },
      queryCorrections: [],
      triggers: [],
      questionAnswer: $s(),
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
    questionAnswer: $s(),
    extendedResults: {},
    searchAction: void 0
  };
}
var Ls;
(function(e) {
  e.Ascending = "ascending", e.Descending = "descending";
})(Ls || (Ls = {}));
var Je;
(function(e) {
  e.Relevancy = "relevancy", e.QRE = "qre", e.Date = "date", e.Field = "field", e.NoSort = "nosort";
})(Je || (Je = {}));
const Xl = (e) => {
  if (Pu(e))
    return e.map((t) => Xl(t)).join(",");
  switch (e.by) {
    case Je.Relevancy:
    case Je.QRE:
    case Je.NoSort:
      return e.by;
    case Je.Date:
      return `date ${e.order}`;
    case Je.Field:
      return `@${e.field} ${e.order}`;
    default:
      return "";
  }
}, rS = () => ({
  by: Je.Relevancy
});
new z({
  values: {
    by: new Ar({ enum: Je, required: !0 }),
    order: new Ar({ enum: Ls }),
    field: new Q()
  }
});
function ed() {
  return Xl(rS());
}
const td = () => "default", nS = (e) => {
  const t = e.configuration.search.locale.split("-")[0];
  return !t || t.length !== 2 ? "en" : t;
};
class iS {
  constructor(t) {
    te(this, "getState");
    te(this, "state");
    this.getState = t, this.state = t();
  }
  getLanguage() {
    return nS(this.state);
  }
  getBaseMetadata() {
    const { context: t, configuration: r } = this.state, n = (t == null ? void 0 : t.contextValues) || {}, i = {};
    for (const [s, a] of Object.entries(n)) {
      const o = `context_${s}`;
      i[o] = a;
    }
    return r.analytics.analyticsMode === "legacy" && (i.coveoHeadlessVersion = aa), i;
  }
  getOriginContext() {
    return this.state.configuration.analytics.originContext;
  }
  getOriginLevel1() {
    return this.state.searchHub || td();
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
const Ir = class Ir extends iS {
  constructor() {
    super(...arguments);
    te(this, "getFacetRequest", (r) => {
      var n, i, s, a, o, c, u, l, f, p;
      return ((i = (n = this.state.facetSet) == null ? void 0 : n[r]) == null ? void 0 : i.request) || ((a = (s = this.state.categoryFacetSet) == null ? void 0 : s[r]) == null ? void 0 : a.request) || ((c = (o = this.state.dateFacetSet) == null ? void 0 : o[r]) == null ? void 0 : c.request) || ((l = (u = this.state.numericFacetSet) == null ? void 0 : u[r]) == null ? void 0 : l.request) || ((p = (f = this.state.automaticFacetSet) == null ? void 0 : f.set[r]) == null ? void 0 : p.response);
    });
  }
  getFacetState() {
    return Dv(Ev(this.getState()));
  }
  getPipeline() {
    var r;
    return this.state.pipeline || ((r = this.state.search) == null ? void 0 : r.response.pipeline) || Ir.fallbackPipelineName;
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
    var n, i;
    const r = this.getState();
    return ((n = r.search) == null ? void 0 : n.searchResponseId) || ((i = r.search) == null ? void 0 : i.response.searchUid) || ft().response.searchUid;
  }
  getSplitTestRunName() {
    var r;
    return (r = this.state.search) == null ? void 0 : r.response.splitTestRun;
  }
  getSplitTestRunVersion() {
    var i;
    const r = !!this.getSplitTestRunName(), n = ((i = this.state.search) == null ? void 0 : i.response.pipeline) || this.state.pipeline || Ir.fallbackPipelineName;
    return r ? n : void 0;
  }
  getBaseMetadata() {
    const r = this.getState(), n = super.getBaseMetadata(), i = Xn(r);
    return i && (n.generativeQuestionAnsweringId = i), n;
  }
  getFacetMetadata(r, n) {
    const i = this.getFacetRequest(r), s = (i == null ? void 0 : i.field) ?? "";
    return {
      ...this.getBaseMetadata(),
      facetId: r,
      facetField: s,
      facetValue: n,
      facetTitle: `${s}_${r}`
    };
  }
  getFacetClearAllMetadata(r) {
    const n = this.getFacetRequest(r), i = (n == null ? void 0 : n.field) ?? "";
    return {
      ...this.getBaseMetadata(),
      facetId: r,
      facetField: i,
      facetTitle: `${i}_${r}`
    };
  }
  getFacetUpdateSortMetadata(r, n) {
    const i = this.getFacetRequest(r), s = (i == null ? void 0 : i.field) ?? "";
    return {
      ...this.getBaseMetadata(),
      facetId: r,
      facetField: s,
      criteria: n,
      facetTitle: `${s}_${r}`
    };
  }
  getRangeBreadcrumbFacetMetadata(r, n) {
    const i = this.getFacetRequest(r), s = (i == null ? void 0 : i.field) ?? "";
    return {
      ...this.getBaseMetadata(),
      facetId: r,
      facetField: s,
      facetRangeEnd: n.end,
      facetRangeEndInclusive: n.endInclusive,
      facetRangeStart: n.start,
      facetTitle: `${s}_${r}`
    };
  }
  getResultSortMetadata() {
    return {
      ...this.getBaseMetadata(),
      resultsSortBy: this.state.sortCriteria ?? ed()
    };
  }
  getStaticFilterToggleMetadata(r, n) {
    return {
      ...this.getBaseMetadata(),
      staticFilterId: r,
      staticFilterValue: n
    };
  }
  getStaticFilterClearAllMetadata(r) {
    return {
      ...this.getBaseMetadata(),
      staticFilterId: r
    };
  }
  getUndoTriggerQueryMetadata(r) {
    return {
      ...this.getBaseMetadata(),
      undoneQuery: r
    };
  }
  getCategoryBreadcrumbFacetMetadata(r, n) {
    const i = this.getFacetRequest(r), s = (i == null ? void 0 : i.field) ?? "";
    return {
      ...this.getBaseMetadata(),
      categoryFacetId: r,
      categoryFacetField: s,
      categoryFacetPath: n,
      categoryFacetTitle: `${s}_${r}`
    };
  }
  getOmniboxAnalyticsMetadata(r, n) {
    var u;
    const i = (u = this.state.querySuggest) == null ? void 0 : u[r], s = i.completions.map((l) => l.expression), a = i.partialQueries.length - 1, o = i.partialQueries[a] || "", c = i.responseId;
    return {
      ...this.getBaseMetadata(),
      suggestionRanking: s.indexOf(n),
      partialQuery: o,
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
  getOmniboxFromLinkMetadata(r) {
    return {
      ...this.getBaseMetadata(),
      ...r
    };
  }
  getGeneratedAnswerMetadata() {
    var i;
    const r = this.getState(), n = {};
    return ((i = r.generatedAnswer) == null ? void 0 : i.isVisible) !== void 0 && (n.showGeneratedAnswer = r.generatedAnswer.isVisible), n;
  }
  get resultURIs() {
    var r;
    return (r = this.results) == null ? void 0 : r.map((n) => ({
      documentUri: n.uri,
      documentUriHash: n.raw.urihash
    }));
  }
  get results() {
    var r;
    return (r = this.state.search) == null ? void 0 : r.response.results;
  }
  get queryText() {
    var r;
    return ((r = this.state.query) == null ? void 0 : r.q) || cr().q;
  }
  get responseTime() {
    var r;
    return ((r = this.state.search) == null ? void 0 : r.duration) || ft().duration;
  }
  get numberOfResults() {
    var r;
    return ((r = this.state.search) == null ? void 0 : r.response.totalCountFiltered) || ft().response.totalCountFiltered;
  }
};
te(Ir, "fallbackPipelineName", "default");
let Zt = Ir;
const sS = ({ logger: e, getState: t, analyticsClientMiddleware: r = (s, a) => a, preprocessRequest: n, provider: i }) => {
  const s = t(), a = s.configuration.accessToken, o = s.configuration.analytics.apiBaseUrl ?? jr(s.configuration.organizationId, s.configuration.environment, "analytics"), c = s.configuration.analytics.runtimeEnvironment, u = s.configuration.analytics.enabled, l = new wv({
    token: a,
    endpoint: o,
    runtimeEnvironment: c,
    preprocessRequest: Cv(e, n),
    beforeSendHooks: [
      Iv(e, r),
      (f, p) => (e.info({
        ...p,
        type: f,
        endpoint: o,
        token: a
      }, "Analytics request"), p)
    ]
  }, i);
  return u || l.disable(), l;
}, ic = () => {
  const t = or.getInstance().getHistory().reverse().find((r) => r.name === "PageView" && r.value);
  return t ? t.value : "";
}, va = async (e, t) => {
  const r = e.analyticsMode === "next";
  return {
    analytics: {
      clientId: await bv(e),
      clientTimestamp: (/* @__PURE__ */ new Date()).toISOString(),
      documentReferrer: e.originLevel3,
      originContext: e.originContext,
      ...t && {
        actionCause: t.actionCause,
        customData: t.customData
      },
      ...t && !r && {
        customData: t.customData
      },
      ...e.userDisplayName && { userDisplayName: e.userDisplayName },
      ...e.documentLocation && { documentLocation: e.documentLocation },
      ...e.deviceId && { deviceId: e.deviceId },
      ...ic() && { pageId: ic() },
      ...r && e.trackingId && { trackingId: e.trackingId },
      capture: r,
      ...r && { source: di(e) }
    }
  };
}, Sa = async (e, t) => {
  var r, n, i, s;
  return {
    accessToken: e.configuration.accessToken,
    organizationId: e.configuration.organizationId,
    url: e.configuration.search.apiBaseUrl ?? ir(e.configuration.organizationId, e.configuration.environment),
    locale: e.configuration.search.locale,
    debug: e.debug,
    tab: e.configuration.analytics.originLevel2,
    referrer: e.configuration.analytics.originLevel3,
    timezone: e.configuration.search.timezone,
    ...e.configuration.analytics.enabled && {
      actionsHistory: or.getInstance().getHistory()
    },
    ...((r = e.advancedSearchQueries) == null ? void 0 : r.aq) && {
      aq: e.advancedSearchQueries.aq
    },
    ...((n = e.advancedSearchQueries) == null ? void 0 : n.cq) && {
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
    ...e.configuration.analytics.enabled && await va(e.configuration.analytics, t),
    ...e.excerptLength && !X(e.excerptLength.length) && {
      excerptLength: e.excerptLength.length
    },
    ...e.configuration.search.authenticationProviders.length && {
      authentication: e.configuration.search.authenticationProviders.join(",")
    }
  };
}, yi = (e, t, r) => ({
  analytics: {
    clientId: t.clientId,
    clientTimestamp: (/* @__PURE__ */ new Date()).toISOString(),
    documentReferrer: t.referrer,
    documentLocation: t.location,
    originContext: e.originContext,
    ...r && {
      actionCause: r.actionCause
    },
    ...r && {
      customData: r.customData
    },
    ...e.userDisplayName && { userDisplayName: e.userDisplayName },
    ...e.deviceId && { deviceId: e.deviceId },
    ...e.trackingId && { trackingId: e.trackingId },
    capture: t.capture ?? t.clientId !== "",
    source: di(e)
  }
}), rd = (e, t, r) => {
  var n, i, s, a;
  return {
    accessToken: e.configuration.accessToken,
    organizationId: e.configuration.organizationId,
    url: e.configuration.search.apiBaseUrl ?? ir(e.configuration.organizationId, e.configuration.environment),
    locale: e.configuration.search.locale,
    debug: e.debug,
    tab: e.configuration.analytics.originLevel2,
    referrer: t.referrer,
    timezone: e.configuration.search.timezone,
    ...((n = e.advancedSearchQueries) == null ? void 0 : n.aq) && {
      aq: e.advancedSearchQueries.aq
    },
    ...((i = e.advancedSearchQueries) == null ? void 0 : i.cq) && {
      cq: e.advancedSearchQueries.cq
    },
    ...((s = e.advancedSearchQueries) == null ? void 0 : s.lq) && {
      lq: e.advancedSearchQueries.lq
    },
    ...((a = e.advancedSearchQueries) == null ? void 0 : a.dq) && {
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
    ...e.configuration.analytics.enabled && yi(e.configuration.analytics, t, r),
    ...e.excerptLength && !X(e.excerptLength.length) && {
      excerptLength: e.excerptLength.length
    },
    ...e.configuration.search.authenticationProviders.length && {
      authentication: e.configuration.search.authenticationProviders.join(",")
    }
  };
}, aS = fe((e) => e.staticFilterSet, (e) => Object.values(e || {}).map((r) => {
  const n = r.values.filter((s) => s.state === "selected" && !!s.expression.trim()), i = n.map((s) => s.expression).join(" OR ");
  return n.length > 1 ? `(${i})` : i;
}));
function oS(e) {
  return e.type === "dateRange";
}
function nd(e) {
  return `start${e}`;
}
function id(e) {
  return `end${e}`;
}
const sd = () => ({
  dateFacetValueMap: {}
});
function cS(e, t, r) {
  let n = e.start, i = e.end;
  return Fr(n) && (n = Es(n), r.dateFacetValueMap[t][nd(n)] = e.start), Fr(i) && (i = Es(i), r.dateFacetValueMap[t][id(i)] = e.end), { ...e, start: n, end: i };
}
function ad(e, t) {
  if (oS(e)) {
    const { facetId: r, currentValues: n } = e;
    return t.dateFacetValueMap[r] = {}, {
      ...e,
      currentValues: n.map((i) => cS(i, r, t))
    };
  }
  return e;
}
function vi(e) {
  var n;
  const t = sd();
  return { request: {
    ...e,
    facets: (n = e.facets) == null ? void 0 : n.map((i) => ad(i, t))
  }, mappings: t };
}
function uS(e, t, r) {
  return {
    ...e,
    start: r.dateFacetValueMap[t][nd(e.start)] || e.start,
    end: r.dateFacetValueMap[t][id(e.end)] || e.end
  };
}
function lS(e, t) {
  return e.facetId in t.dateFacetValueMap;
}
function dS(e, t) {
  return lS(e, t) ? {
    ...e,
    values: e.values.map((r) => uS(r, e.facetId, t))
  } : e;
}
function od(e, t) {
  var r;
  return "success" in e ? { success: {
    ...e.success,
    facets: (r = e.success.facets) == null ? void 0 : r.map((i) => dS(i, t))
  } } : e;
}
const gt = async (e, t, r) => {
  var o;
  const n = ud(e), i = fS(e), s = hS(e), a = e.configuration.analytics.analyticsMode === "legacy" ? await Sa(e, r) : rd(e, t, r);
  return vi({
    ...a,
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
    ...i.length && { facets: i },
    ...e.pagination && {
      numberOfResults: cd(e),
      firstResult: e.pagination.firstResult
    },
    ...e.facetOptions && {
      facetOptions: { freezeFacetOrder: e.facetOptions.freezeFacetOrder }
    },
    ...((o = e.folding) == null ? void 0 : o.enabled) && {
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
function cd(e) {
  return e.pagination ? e.pagination.firstResult + e.pagination.numberOfResults > Er ? Er - e.pagination.firstResult : e.pagination.numberOfResults : void 0;
}
function fS(e) {
  return El(gS(e), e.facetOrder ?? []);
}
function hS(e) {
  var r;
  const t = (r = e.automaticFacetSet) == null ? void 0 : r.set;
  return t ? Object.values(t).map((n) => n.response).map(pS).filter((n) => n.currentValues.length > 0) : void 0;
}
function pS(e) {
  const { field: t, label: r, values: n } = e, i = n.filter((s) => s.state === "selected");
  return {
    field: t,
    label: r,
    currentValues: i
  };
}
function gS(e) {
  return mS(e).filter(({ facetId: t }) => {
    var r, n;
    return ((n = (r = e.facetOptions) == null ? void 0 : r.facets[t]) == null ? void 0 : n.enabled) ?? !0;
  });
}
function mS(e) {
  return [
    ...yS(e.facetSet ?? {}),
    ...sc(e.numericFacetSet ?? {}),
    ...sc(e.dateFacetSet ?? {}),
    ...ar(e.categoryFacetSet ?? {})
  ];
}
function yS(e) {
  return ar(e).map((t) => {
    const r = Dl[t.sortCriteria];
    return r ? {
      ...t,
      sortCriteria: r
    } : t;
  });
}
function sc(e) {
  return ar(e).map((t) => {
    const r = t.currentValues, n = r.some(({ state: s }) => s !== "idle"), i = r.some((s) => s.previousState);
    return t.generateAutomaticRanges && !n && !i ? { ...t, currentValues: [] } : t;
  });
}
function ud(e) {
  var s;
  const t = ((s = e.advancedSearchQueries) == null ? void 0 : s.cq.trim()) || "", r = Object.values(e.tabSet || {}).find((a) => a.isActive), n = (r == null ? void 0 : r.expression.trim()) || "", i = aS(e);
  return [t, n, ...i].filter((a) => !!a).join(" AND ");
}
const vS = async (e, t, r, n) => {
  const i = t.categoryFacetSearchSet[e].options, s = t.categoryFacetSet[e].request, { captions: a, query: o, numberOfValues: c } = i, { field: u, delimitingCharacter: l, basePath: f, filterFacetCount: p } = s, g = SS(s), h = g.length ? [g] : [], d = `*${o}*`;
  return {
    url: t.configuration.search.apiBaseUrl ?? ir(t.configuration.organizationId, t.configuration.environment),
    accessToken: t.configuration.accessToken,
    organizationId: t.configuration.organizationId,
    ...t.configuration.search.authenticationProviders.length && {
      authentication: t.configuration.search.authenticationProviders.join(",")
    },
    basePath: f,
    captions: a,
    numberOfValues: c,
    query: d,
    field: u,
    delimitingCharacter: l,
    ignorePaths: h,
    filterFacetCount: p,
    type: "hierarchical",
    ...n ? {} : {
      searchContext: (await gt(t, r)).request
    }
  };
}, SS = (e) => {
  const t = [];
  let r = e.currentValues[0];
  for (; r; )
    t.push(r.value), r = r.children[0];
  return t;
}, wS = async (e, t, r, n) => {
  const { captions: i, query: s, numberOfValues: a } = t.facetSearchSet[e].options, { field: o, currentValues: c, filterFacetCount: u } = t.facetSet[e].request, l = c.filter((p) => p.state !== "idle").map((p) => p.value), f = `*${s}*`;
  return {
    url: t.configuration.search.apiBaseUrl ?? ir(t.configuration.organizationId, t.configuration.environment),
    accessToken: t.configuration.accessToken,
    organizationId: t.configuration.organizationId,
    ...t.configuration.search.authenticationProviders && {
      authentication: t.configuration.search.authenticationProviders.join(",")
    },
    captions: i,
    numberOfValues: a,
    query: f,
    field: o,
    ignoreValues: l,
    filterFacetCount: u,
    type: "specific",
    ...n ? {} : {
      searchContext: (await gt(t, r)).request
    }
  };
}, ld = (e) => async (t, { getState: r, extra: { apiClient: n, validatePayload: i, navigatorContext: s } }) => {
  const a = r();
  let o;
  i(t, j), bS(a, t) ? o = await wS(t, a, s, e) : o = await vS(t, a, s, e);
  const c = await n.facetSearch(o);
  return { facetId: t, response: c };
};
ne("facetSearch/executeSearch", ld(!1));
ne("facetSearch/executeSearch", ld(!0));
const dd = w("facetSearch/clearResults", (e) => q(e, { facetId: ue })), bS = (e, t) => e.facetSearchSet !== void 0 && e.facetSet !== void 0 && e.facetSet[t] !== void 0, fd = {
  facetId: ue,
  value: new z({
    values: {
      displayValue: Pe,
      rawValue: Pe,
      count: new W({ required: !0, min: 0 })
    }
  })
}, CS = w("facetSearch/register", (e) => q(e, la)), hd = w("facetSearch/update", (e) => q(e, la)), Si = w("facetSearch/toggleSelectValue", (e) => q(e, fd)), wi = w("facetSearch/toggleExcludeValue", (e) => q(e, fd)), IS = (e, t, r) => ({
  ...Nr(t, r),
  query: t.querySet[e]
}), AS = w("commerce/querySuggest/clear", (e) => q(e, { id: j })), Rt = ne("commerce/querySuggest/fetch", async (e, { getState: t, rejectWithValue: r, extra: { apiClient: n, validatePayload: i, navigatorContext: s } }) => {
  i(e, {
    id: j
  });
  const a = t(), o = IS(e.id, a, s), c = await n.querySuggest(o);
  return Qe(c) ? r(c.error) : {
    id: e.id,
    query: o.query,
    ...c.success
  };
}), xS = w("commerce/querySuggest/register", (e) => q(e, {
  id: j,
  count: new W({ min: 0 })
})), pd = w("commerce/querySuggest/selectSuggestion", (e) => q(e, {
  id: j,
  expression: Pe
})), kS = (e, t, r, n) => {
  var v, F;
  const i = t.categoryFacetSearchSet[e].options.query, s = `*${i}*`, a = (v = t.commerceFacetSet[Qs(e)]) == null ? void 0 : v.request, o = a && RS(a) ? a && qS(a) : [], c = o.length ? [o] : [], u = r ? i : (F = t.commerceQuery) == null ? void 0 : F.query, l = t.categoryFacetSearchSet[e].options.numberOfValues, { url: f, accessToken: p, organizationId: g, trackingId: h, language: d, country: m, currency: C, clientId: R, context: b, ...S } = Ut(t, n);
  return {
    url: f,
    accessToken: p,
    organizationId: g,
    facetId: Qs(e),
    facetQuery: r ? "*" : s,
    numberOfValues: l,
    ignorePaths: c,
    trackingId: h,
    language: d,
    country: m,
    currency: C,
    clientId: R,
    context: b,
    query: u,
    ...!r && { ...S }
  };
};
function RS(e) {
  return e.type === "hierarchical";
}
const qS = (e) => {
  const t = [];
  let r = e.values[0];
  for (; r; )
    t.push(r.value), r = r.children[0];
  return t;
}, OS = (e, t, r, n) => {
  var R;
  const i = t.facetSearchSet[e].options.query, s = t.facetSearchSet[e].options.numberOfValues, a = `*${i}*`, o = r ? i : (R = t.commerceQuery) == null ? void 0 : R.query, { url: c, accessToken: u, organizationId: l, trackingId: f, language: p, country: g, currency: h, clientId: d, context: m, ...C } = Ut(t, n);
  return {
    url: c,
    accessToken: u,
    organizationId: l,
    facetId: Qs(e),
    facetQuery: r ? "*" : a,
    numberOfValues: s,
    trackingId: f,
    language: p,
    country: g,
    currency: h,
    clientId: d,
    context: m,
    query: o,
    ...!r && { ...C }
  };
}, gd = (e) => async ({ facetId: t, facetSearchType: r }, { getState: n, extra: { validatePayload: i, navigatorContext: s, apiClient: a } }) => {
  const o = n();
  i(t, j);
  const c = FS(o, t) || ES(o, t) ? OS(t, o, e, s) : kS(t, o, e, s), u = await a.facetSearch(c, r);
  return { facetId: t, response: u };
}, Bt = ne("commerce/facetSearch/executeSearch", gd(!1)), qt = ne("commerce/facetSearch/facetFieldSuggest", gd(!0)), FS = (e, t) => "facetSearchSet" in e && e.facetSearchSet[t] !== void 0 && e.commerceFacetSet[t] !== void 0, ES = (e, t) => "fieldSuggestionsOrder" in e ? e.fieldSuggestionsOrder.some((r) => r.facetId === t && r.type === "regular") : !1, ei = "field_suggestion:";
function Qs(e) {
  return e.startsWith(ei) ? e.slice(ei.length) : e;
}
function Tt(e) {
  return e.startsWith(ei) ? e : `${ei}${e}`;
}
function md(e, t, r) {
  const { facetId: n, response: i } = t, s = e[n];
  s && s.requestId === r && (s.isLoading = !1, "success" in i && (s.response = i.success));
}
function yd(e, t, r, n) {
  const { facetId: i, response: s } = t, a = Tt(i);
  let o = e[a];
  if (!o)
    fa(e, { facetId: a }, n), o = e[a];
  else if (o.requestId !== r)
    return;
  o.isLoading = !1, "success" in s && (o.response = s.success);
}
function DS(e, t, r, n) {
  if (t.fieldSuggestionsFacets)
    for (const i of t.fieldSuggestionsFacets)
      i.facetId in e || i.type !== "regular" || (e[i.facetId] = {
        options: {
          ...Jt,
          query: t.query ?? ""
        },
        isLoading: !1,
        response: n(),
        initialNumberOfValues: Jt.numberOfValues,
        requestId: r
      });
}
function TS(e, t, r, n) {
  if (t.fieldSuggestionsFacets)
    for (const i of t.fieldSuggestionsFacets) {
      const s = Tt(i.facetId);
      s in e || i.type !== "hierarchical" || (e[s] = {
        options: {
          ...Jt,
          query: t.query ?? ""
        },
        isLoading: !1,
        response: n(),
        initialNumberOfValues: Jt.numberOfValues,
        requestId: r
      });
    }
}
se(Dm(), (e) => {
  e.addCase(Em, (t, r) => {
    const n = r.payload;
    fa(t, n, Qt);
  }).addCase(hd, (t, r) => {
    Fl(t, r.payload);
  }).addCase(Bt.pending, (t, r) => {
    const { facetId: n } = r.meta.arg;
    Kn(t, n, r.meta.requestId);
  }).addCase(qt.pending, (t, r) => {
    const { facetId: n } = r.meta.arg;
    Kn(t, n, r.meta.requestId);
  }).addCase(Bt.rejected, (t, r) => {
    const { facetId: n } = r.meta.arg;
    Gn(t, n);
  }).addCase(qt.rejected, (t, r) => {
    const { facetId: n } = r.meta.arg;
    Gn(t, Tt(n));
  }).addCase(Bt.fulfilled, (t, r) => {
    md(t, r.payload, r.meta.requestId);
  }).addCase(qt.fulfilled, (t, r) => {
    yd(t, r.payload, r.meta.requestId, Qt);
  }).addCase(Rt.fulfilled, (t, r) => {
    TS(t, r.payload, r.meta.requestId, Qt);
  }).addCase(dd, (t, { payload: { facetId: r } }) => {
    ha(t, { facetId: r }, Qt);
  }).addCase(Me.fulfilled, (t) => br(t, Qt)).addCase(Re.fulfilled, (t) => br(t, Qt));
});
function Qt() {
  return {
    moreValuesAvailable: !1,
    values: []
  };
}
function MS() {
  return {};
}
se(MS(), (e) => {
  e.addCase(CS, (t, r) => {
    const n = r.payload;
    fa(t, n, bt);
  }).addCase(hd, (t, r) => {
    Fl(t, r.payload);
  }).addCase(Bt.pending, (t, r) => {
    const { facetId: n } = r.meta.arg;
    Kn(t, n, r.meta.requestId);
  }).addCase(qt.pending, (t, r) => {
    const { facetId: n } = r.meta.arg;
    Kn(t, Tt(n), r.meta.requestId);
  }).addCase(Bt.rejected, (t, r) => {
    const { facetId: n } = r.meta.arg;
    Gn(t, n);
  }).addCase(qt.rejected, (t, r) => {
    const { facetId: n } = r.meta.arg;
    Gn(t, Tt(n));
  }).addCase(Bt.fulfilled, (t, r) => {
    md(t, r.payload, r.meta.requestId);
  }).addCase(qt.fulfilled, (t, r) => {
    yd(t, r.payload, r.meta.requestId, bt);
  }).addCase(Rt.fulfilled, (t, r) => {
    DS(t, r.payload, r.meta.requestId, bt);
  }).addCase(dd, (t, { payload: r }) => {
    ha(t, r, bt);
  }).addCase(Me.fulfilled, (t) => br(t, bt)).addCase(Re.fulfilled, (t) => br(t, bt)).addCase(it, (t) => br(t, bt));
});
function bt() {
  return {
    moreValuesAvailable: !1,
    values: []
  };
}
const zr = w("breadcrumb/deselectAll"), vd = w("breadcrumb/deselectAllNonBreadcrumbs"), Br = w("facetOptions/update", (e = { freezeFacetOrder: !0 }) => q(e, {
  freezeFacetOrder: new ie({ required: !1 })
})), _S = w("facetOptions/facet/enable", (e) => q(e, ue)), bi = w("facetOptions/facet/disable", (e) => q(e, ue)), wa = (e, t) => {
  var r;
  return typeof e == "object" && Object.keys({ ...e }).length === 0 || !t || !e ? !0 : (r = e.excluded) != null && r.includes(t) ? !1 : !!(e.included && (e.included.length === 0 || e.included.includes(t)) || e.excluded && !e.included);
}, PS = w("history/undo"), US = w("history/redo"), ut = w("history/snapshot");
ne("history/back", async (e, { dispatch: t }) => {
  t(PS()), await t(st());
});
ne("history/forward", async (e, { dispatch: t }) => {
  t(US()), await t(st());
});
const st = ne("history/change", async (e, { getState: t }) => t().history.present);
function VS() {
  const e = typeof window < "u";
  return {
    sendMessage(t) {
      e && window.postMessage(t, "*");
    }
  };
}
const $S = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/i;
function LS(e) {
  return typeof e == "string" && $S.test(e);
}
const we = [];
for (let e = 0; e < 256; ++e)
  we.push((e + 256).toString(16).slice(1));
function QS(e, t = 0) {
  return (we[e[t + 0]] + we[e[t + 1]] + we[e[t + 2]] + we[e[t + 3]] + "-" + we[e[t + 4]] + we[e[t + 5]] + "-" + we[e[t + 6]] + we[e[t + 7]] + "-" + we[e[t + 8]] + we[e[t + 9]] + "-" + we[e[t + 10]] + we[e[t + 11]] + we[e[t + 12]] + we[e[t + 13]] + we[e[t + 14]] + we[e[t + 15]]).toLowerCase();
}
let Gi;
const jS = new Uint8Array(16);
function NS() {
  if (!Gi) {
    if (typeof crypto > "u" || !crypto.getRandomValues)
      throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");
    Gi = crypto.getRandomValues.bind(crypto);
  }
  return Gi(jS);
}
const zS = typeof crypto < "u" && crypto.randomUUID && crypto.randomUUID.bind(crypto), ac = { randomUUID: zS };
function BS(e, t, r) {
  var i;
  e = e || {};
  const n = e.random ?? ((i = e.rng) == null ? void 0 : i.call(e)) ?? NS();
  if (n.length < 16)
    throw new Error("Random bytes length must be >= 16");
  return n[6] = n[6] & 15 | 64, n[8] = n[8] & 63 | 128, QS(n);
}
function HS(e, t, r) {
  return ac.randomUUID && !e ? ac.randomUUID() : BS(e);
}
async function YS({ config: e, environment: t, event: r, listenerManager: n }) {
  const { url: i, token: s, mode: a } = e;
  if (a !== "disabled")
    return n.call(r), t.send(i, s, r);
}
const Sd = "2.1.1", Ji = 128, wd = 192, oc = 224, cc = 240, WS = 248;
function KS(e) {
  return (e & WS) === cc ? 4 : (e & cc) === oc ? 3 : (e & oc) === wd ? 2 : 1;
}
function GS(e, t) {
  if (t < 0 || e.length <= t)
    return e;
  let r = e.indexOf("%", t - 2);
  for (r < 0 || r > t ? r = t : t = r; r > 2 && e.charAt(r - 3) == "%"; ) {
    const n = Number.parseInt(e.substring(r - 2, r), 16);
    if ((n & Ji) != Ji)
      break;
    if (r -= 3, (n & wd) != Ji) {
      t - r >= KS(n) * 3 && (r = t);
      break;
    }
  }
  return e.substring(0, r);
}
function JS(e) {
  const { trackingId: t } = e;
  return { trackingId: t };
}
function ZS(e) {
  return (e.source || []).concat([`relay@${Sd}`]);
}
function bd(e, t, r) {
  const { getReferrer: n, getLocation: i, getUserAgent: s } = r, a = JS(t), o = r.getClientId();
  return Object.freeze({
    type: e,
    config: a,
    ts: Date.now(),
    source: ZS(t),
    clientId: o,
    userAgent: s(),
    referrer: uc(n()),
    location: uc(i())
  });
}
function uc(e) {
  return e !== null ? GS(e, 1024) : null;
}
function XS(e, t, r, n) {
  return {
    ...t,
    meta: bd(e, r, n)
  };
}
const ew = "*";
function tw() {
  const e = [];
  function t({ type: c, callback: u }) {
    return e.findIndex((l) => l.type === c && l.callback === u);
  }
  function r(c, u) {
    return c.type === "*" || u === c.type;
  }
  function n(c) {
    return t(c) < 0 && e.push(c), () => o(c.type, c.callback);
  }
  function i(c) {
    e.forEach((u) => {
      if (r(u, c.meta.type))
        try {
          u.callback(c);
        } catch (l) {
          console.error(l);
        }
    });
  }
  function s(c) {
    if (c === ew)
      e.length = 0;
    else
      for (let u = e.length - 1; u >= 0; u--)
        e[u].type === c && e.splice(u, 1);
  }
  function a(c) {
    const u = t(c);
    u >= 0 && e.splice(u, 1);
  }
  function o(c, u) {
    u ? a({ type: c, callback: u }) : s(c);
  }
  return {
    add: n,
    call: i,
    remove: o
  };
}
function lc({ url: e, token: t, trackingId: r, ...n }) {
  return Object.freeze({
    url: e,
    token: t,
    trackingId: r,
    ...!!n.mode && { mode: n.mode },
    ...!!n.source && { source: n.source },
    ...!!n.environment && { environment: n.environment }
  });
}
function rw(e) {
  let t = lc(e);
  return {
    get: () => t,
    update: (r) => {
      t = lc({ ...t, ...r });
    }
  };
}
const Zi = nw();
function nw() {
  const e = "coveo_", t = (r) => {
    const n = r.split(".").slice(-2);
    return n.length == 2 ? n.join(".") : "";
  };
  return {
    getItem(r) {
      const n = `${e}${r}=`, i = document.cookie.split(";");
      for (const s of i) {
        const a = s.replace(/^\s+/, "");
        if (a.lastIndexOf(n, 0) === 0)
          return a.substring(n.length, a.length);
      }
      return null;
    },
    setItem(r, n, i) {
      const s = t(window.location.hostname), a = `;expires=${new Date((/* @__PURE__ */ new Date()).getTime() + i).toUTCString()}`, o = s ? `;domain=${s}` : "";
      document.cookie = `${e}${r}=${n}${a}${o};path=/;SameSite=Lax`;
    },
    removeItem(r) {
      this.setItem(r, "", -1);
    }
  };
}
function iw() {
  return {
    getItem(e) {
      return Zi.getItem(e) || localStorage.getItem(e);
    },
    removeItem(e) {
      Zi.removeItem(e), localStorage.removeItem(e);
    },
    setItem(e, t) {
      localStorage.setItem(e, t), Zi.setItem(e, t, 31556952e3);
    }
  };
}
const dc = "visitorId";
function sw() {
  const e = document.referrer;
  return e === "" ? null : e;
}
function Cd() {
  const e = iw();
  return {
    runtime: "browser",
    send: async (t, r, n) => {
      const i = fetch(t, {
        method: "POST",
        body: JSON.stringify([n]),
        keepalive: !0,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${r}`
        }
      });
      VS().sendMessage({ kind: "EVENT_PROTOCOL", event: n, url: t, token: r });
      const a = await i;
      if (a != null && a.ok) {
        let o;
        try {
          o = await a.json();
        } catch {
          return;
        }
        for (const c of o.events)
          if (!c.accepted)
            throw new Error(`Received event was rejected for processing: ${c.errorMessage}`);
      } else
        throw new Error(`Error ${a.status}: Failed to send the event(s).`);
    },
    getReferrer: () => sw(),
    getLocation: () => window.location.href,
    getUserAgent: () => navigator.userAgent,
    getClientId: () => {
      const t = e.getItem(dc);
      if (t && LS(t))
        return t;
      const r = HS();
      return e.setItem(dc, r), r;
    }
  };
}
function aw() {
  try {
    const e = "__storage_test__";
    return localStorage.setItem(e, e), localStorage.removeItem(e), !0;
  } catch (e) {
    return e instanceof DOMException && e.name === "QuotaExceededError" && // acknowledge QuotaExceededError only if there's something already stored
    localStorage && localStorage.length !== 0;
  }
}
function ow() {
  return {
    runtime: "null",
    send: () => Promise.resolve(void 0),
    getReferrer: () => null,
    getLocation: () => null,
    getUserAgent: () => null,
    getClientId: () => ""
  };
}
function cw(e) {
  const t = e.get().mode !== "disabled", r = e.get().environment, n = ow();
  return t && r ? {
    ...r,
    runtime: "custom"
  } : t && uw() && aw() ? Cd() : n;
}
function uw() {
  try {
    return typeof window == "object";
  } catch {
    return !1;
  }
}
function lw(e) {
  return {
    get: () => Object.freeze(cw(e))
  };
}
function dw(e) {
  const t = rw(e), r = tw(), n = lw(t);
  return {
    emit: async (i, s) => {
      const a = t.get(), o = n.get(), c = XS(i, s, a, o);
      return YS({
        config: a,
        environment: o,
        event: c,
        listenerManager: r
      });
    },
    getMeta: (i) => bd(i, t.get(), n.get()),
    on: (i, s) => r.add({ type: i, callback: s }),
    off: (i, s) => r.remove(i, s),
    updateConfig: (i) => t.update(i),
    version: Sd
  };
}
function fw() {
  return typeof window < "u" && typeof document < "u";
}
const hw = fe((e) => e.configuration.organizationId, (e) => e.configuration.environment, (e) => e.configuration.accessToken, (e) => e.configuration.analytics, (e) => di(e.configuration.analytics), (e, t) => t, (e, t, r, { trackingId: n, apiBaseUrl: i, enabled: s }, a, o) => {
  const c = gw(o);
  return dw({
    mode: s ? "emit" : "disabled",
    url: i ?? fg(e, t),
    token: r,
    trackingId: n ?? null,
    source: a,
    environment: c
  });
}), pw = {
  getClientId: () => "",
  getLocation: () => null,
  getReferrer: () => null,
  getUserAgent: () => null,
  send: async () => {
  }
}, gw = (e) => {
  if (!e)
    return;
  const t = e();
  return {
    ...fw() ? Cd() : pw,
    getClientId: () => t.clientId,
    getLocation: () => t.location,
    getReferrer: () => t.referrer,
    getUserAgent: () => t.userAgent
  };
}, mw = () => "";
function yw(e, t) {
  return {
    ...new Zt(t).getBaseMetadata(),
    actionCause: e,
    type: e
  };
}
function vw(e) {
  return Object.assign(e, { instantlyCallable: !0 });
}
function Sw(e, t) {
  const r = (s) => {
    const a = ne(e, s);
    return vw(Object.assign(a, {
      type: a.typePrefix
    }));
  }, n = r(async (s, { getState: a, extra: o }) => {
    const { analyticsClientMiddleware: c, preprocessRequest: u, logger: l } = o;
    return await (await t({
      getState: a,
      analyticsClientMiddleware: c,
      preprocessRequest: u,
      logger: l
    })).log({ state: a(), extra: o });
  });
  return Object.assign(n, {
    prepare: async ({ getState: s, analyticsClientMiddleware: a, preprocessRequest: o, logger: c }) => {
      const { description: u, log: l } = await t({
        getState: s,
        analyticsClientMiddleware: a,
        preprocessRequest: o,
        logger: c
      });
      return {
        description: u,
        action: r(async (f, { getState: p, extra: g }) => await l({ state: p(), extra: g }))
      };
    }
  }), n;
}
const ww = (e, t, r) => {
  function n(...i) {
    const s = i.length === 1 ? {
      ...i[0],
      __legacy__getBuilder: t(i[0].__legacy__getBuilder),
      analyticsConfigurator: e,
      providerClass: r
    } : {
      prefix: i[0],
      __legacy__getBuilder: t(i[1]),
      __legacy__provider: i[2],
      analyticsConfigurator: e,
      providerClass: r
    };
    return Iw(s);
  }
  return n;
}, bw = (e) => e.configuration.analytics.analyticsMode === "legacy", Cw = (e) => e.configuration.analytics.analyticsMode === "next", Iw = ({ prefix: e, __legacy__getBuilder: t, __legacy__provider: r, analyticsPayloadBuilder: n, analyticsType: i, analyticsConfigurator: s, providerClass: a }) => (r ?? (r = (o) => new a(o)), Sw(e, async ({ getState: o, analyticsClientMiddleware: c, preprocessRequest: u, logger: l }) => {
  const f = [], p = {
    log: async ({ state: C }) => {
      for (const R of f)
        await R(C);
    }
  }, g = o(), h = s({
    getState: o,
    logger: l,
    analyticsClientMiddleware: c,
    preprocessRequest: u,
    provider: r(o)
  }), d = await t(h, o());
  p.description = d == null ? void 0 : d.description, f.push(async (C) => {
    bw(C) && await Aw(d, r, C, l, h.coveoAnalyticsClient);
  });
  const { emit: m } = hw(g);
  return f.push(async (C) => {
    if (Cw(C) && i && n) {
      const R = n(C);
      await kw(m, i, R);
    }
  }), p;
}));
async function Aw(e, t, r, n, i) {
  t(() => r);
  const s = await (e == null ? void 0 : e.log({
    searchUID: t(() => r).getSearchUID()
  }));
  n.info({ client: i, response: s }, "Analytics response");
}
const vt = ww((e) => sS({
  ...e,
  provider: e.provider || new Zt(e.getState)
}), (e) => e, Zt), xw = {
  urihash: new Q(),
  sourcetype: new Q(),
  permanentid: new Q()
};
new z({ values: xw }), new Q({ required: !1, emptyAllowed: !0 });
async function kw(e, t, r) {
  await e(t, r);
}
var Xt;
(function(e) {
  e.interfaceLoad = "interfaceLoad", e.interfaceChange = "interfaceChange", e.didYouMeanAutomatic = "didYouMeanAutomatic", e.didYouMeanClick = "didYouMeanClick", e.resultsSort = "resultsSort", e.searchboxSubmit = "searchboxSubmit", e.searchboxAsYouType = "searchboxAsYouType", e.breadcrumbFacet = "breadcrumbFacet", e.breadcrumbResetAll = "breadcrumbResetAll", e.documentOpen = "documentOpen", e.omniboxAnalytics = "omniboxAnalytics", e.omniboxFromLink = "omniboxFromLink", e.searchFromLink = "searchFromLink", e.triggerQuery = "query", e.browseResults = "browseResults", e.staticFilterDeselect = "staticFilterDeselect", e.facetClearAll = "facetClearAll", e.facetSelect = "facetSelect", e.facetDeselect = "facetDeselect", e.facetExclude = "facetExclude", e.facetUnexclude = "facetUnexclude", e.facetUpdateSort = "facetUpdateSort", e.documentSuggestion = "documentSuggestion", e.facetShowMore = "showMoreFacetResults", e.facetShowLess = "showLessFacetResults", e.queryError = "query", e.recommendationInterfaceLoad = "recommendationInterfaceLoad", e.likeSmartSnippet = "likeSmartSnippet", e.dislikeSmartSnippet = "dislikeSmartSnippet", e.expandSmartSnippet = "expandSmartSnippet", e.collapseSmartSnippet = "collapseSmartSnippet", e.openSmartSnippetFeedbackModal = "openSmartSnippetFeedbackModal", e.closeSmartSnippetFeedbackModal = "closeSmartSnippetFeedbackModal", e.sendSmartSnippetReason = "sendSmartSnippetReason", e.expandSmartSnippetSuggestion = "expandSmartSnippetSuggestion", e.collapseSmartSnippetSuggestion = "collapseSmartSnippetSuggestion", e.openSmartSnippetSource = "openSmartSnippetSource", e.openSmartSnippetSuggestionSource = "openSmartSnippetSuggestionSource", e.showMoreFoldedResults = "showMoreFoldedResults", e.showLessFoldedResults = "showLessFoldedResults", e.copyToClipboard = "copyToClipboard", e.caseSendEmail = "Case.SendEmail", e.feedItemTextPost = "FeedItem.TextPost", e.caseAttach = "caseAttach", e.caseDetach = "caseDetach", e.generatedAnswerCitationDocumentAttach = "generatedAnswerCitationDocumentAttach", e.retryGeneratedAnswer = "retryGeneratedAnswer", e.likeGeneratedAnswer = "likeGeneratedAnswer", e.dislikeGeneratedAnswer = "dislikeGeneratedAnswer", e.openGeneratedAnswerSource = "openGeneratedAnswerSource", e.generatedAnswerStreamEnd = "generatedAnswerStreamEnd", e.contextChanged = "contextChanged", e.generatedAnswerSourceHover = "generatedAnswerSourceHover", e.generatedAnswerFeedbackSubmit = "generatedAnswerFeedbackSubmit", e.generatedAnswerHideAnswers = "generatedAnswerHideAnswers", e.generatedAnswerShowAnswers = "generatedAnswerShowAnswers", e.generatedAnswerExpand = "generatedAnswerExpand", e.generatedAnswerCollapse = "generatedAnswerCollapse", e.generatedAnswerCopyToClipboard = "generatedAnswerCopyToClipboard", e.expandToFullUI = "expandToFullUI", e.createArticle = "createArticle", e.recentQueriesClick = "recentQueriesClick", e.clearRecentQueries = "clearRecentQueries";
})(Xt || (Xt = {}));
const Id = w("facet/updateFacetAutoSelection", (e) => q(e, {
  allow: new ie({ required: !0 })
}));
class Rw extends Zt {
  constructor(r) {
    super(r);
    te(this, "getState");
    this.getState = r;
  }
  get activeInstantResultQuery() {
    const r = this.getState().instantResults;
    for (const n in r)
      for (const i in r[n].cache)
        if (r[n].cache[i].isActive)
          return r[n].q;
    return null;
  }
  get activeInstantResultCache() {
    const r = this.getState().instantResults;
    for (const n in r)
      for (const i in r[n].cache)
        if (r[n].cache[i].isActive)
          return r[n].cache[i];
    return null;
  }
  get results() {
    var r;
    return (r = this.activeInstantResultCache) == null ? void 0 : r.results;
  }
  get queryText() {
    return this.activeInstantResultQuery ?? cr().q;
  }
  get responseTime() {
    var r;
    return ((r = this.activeInstantResultCache) == null ? void 0 : r.duration) ?? ft().duration;
  }
  get numberOfResults() {
    var r;
    return ((r = this.activeInstantResultCache) == null ? void 0 : r.totalCountFiltered) ?? ft().response.totalCountFiltered;
  }
  getSearchUID() {
    var n;
    return ((n = this.activeInstantResultCache) == null ? void 0 : n.searchUid) || super.getSearchUID();
  }
}
const qw = () => vt("analytics/instantResult/searchboxAsYouType", (e) => e.makeSearchboxAsYouType(), (e) => new Rw(e)), Ow = () => ({
  actionCause: Xt.searchboxAsYouType
}), ba = {
  id: j
}, Fw = {
  ...ba,
  q: Pe
};
w("instantResults/register", (e) => q(e, ba));
const Ad = w("instantResults/updateQuery", (e) => q(e, Fw));
w("instantResults/clearExpired", (e) => q(e, ba));
const Ci = new W({ required: !0, min: 0 }), Ew = w("pagination/registerNumberOfResults", (e) => q(e, Ci)), Dw = w("pagination/updateNumberOfResults", (e) => q(e, Ci)), Tw = w("pagination/registerPage", (e) => q(e, Ci)), xd = w("pagination/updatePage", (e) => q(e, Ci)), Mw = w("pagination/nextPage"), _w = w("pagination/previousPage"), Ii = w("query/updateQuery", (e) => q(e, {
  q: new Q(),
  enableQuerySyntax: new ie()
})), Dn = () => ({
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
}), fc = () => vt("search/logFetchMoreResults", (e) => e.makeFetchMoreResults()), Ht = (e) => vt("search/queryError", (t, r) => {
  var n, i, s, a;
  return t.makeQueryError({
    query: ((n = r.query) == null ? void 0 : n.q) || cr().q,
    aq: ((i = r.advancedSearchQueries) == null ? void 0 : i.aq) || Dn().aq,
    cq: ((s = r.advancedSearchQueries) == null ? void 0 : s.cq) || Dn().cq,
    dq: ((a = r.advancedSearchQueries) == null ? void 0 : a.dq) || Dn().dq,
    errorType: e.type,
    errorMessage: e.message
  });
}), kd = (e) => e.success !== void 0, ht = (e) => e.error !== void 0;
w("didYouMean/enable");
w("didYouMean/disable");
w("didYouMean/automaticCorrections/disable");
w("didYouMean/automaticCorrections/enable");
const Ca = w("didYouMean/correction", (e) => q(e, j));
w("didYouMean/automaticCorrections/mode", (e) => q(e, new Q({
  constrainTo: ["next", "legacy"],
  emptyAllowed: !1,
  required: !0
})));
const hc = () => vt("analytics/didyoumean/automatic", (e) => e.makeDidYouMeanAutomatic()), Pw = () => ({
  actionCause: Xt.didYouMeanAutomatic
});
function Uw() {
  return {
    contextValues: {}
  };
}
const Vw = () => !1;
function $w() {
  return {
    contextValues: {}
  };
}
function Rd() {
  return { enabled: !0, tabs: {} };
}
function qd() {
  return {
    freezeFacetOrder: !1,
    facets: {}
  };
}
function Ia() {
  return {
    firstResult: 0,
    defaultNumberOfResults: 10,
    numberOfResults: 10,
    totalCountFiltered: 0
  };
}
function Aa() {
  return {};
}
function Lw() {
  return {};
}
function Qw() {
  return {};
}
function lt(e) {
  return {
    context: e.context || Uw(),
    dictionaryFieldContext: e.dictionaryFieldContext || $w(),
    facetSet: e.facetSet || ya(),
    numericFacetSet: e.numericFacetSet || ma(),
    dateFacetSet: e.dateFacetSet || ga(),
    categoryFacetSet: e.categoryFacetSet || Jl(),
    automaticFacetSet: e.automaticFacetSet ?? Kl(),
    pagination: e.pagination || Ia(),
    query: e.query || cr(),
    tabSet: e.tabSet || Qw(),
    advancedSearchQueries: e.advancedSearchQueries || Dn(),
    staticFilterSet: e.staticFilterSet || Lw(),
    querySet: e.querySet || Aa(),
    sortCriteria: e.sortCriteria || ed(),
    pipeline: e.pipeline || mw(),
    searchHub: e.searchHub || td(),
    facetOptions: e.facetOptions || qd(),
    facetOrder: e.facetOrder ?? Fn(),
    debug: e.debug ?? Vw()
  };
}
new z({
  values: {
    undoneQuery: Pe
  },
  options: { required: !0 }
});
const jw = () => vt("analytics/trigger/query", (e, t) => {
  var r;
  return (r = t.triggers) != null && r.queryModification.newQuery ? e.makeTriggerQuery() : null;
}), Od = w("trigger/query/ignore", (e) => q(e, new Q({ emptyAllowed: !0, required: !0 }))), Fd = w("trigger/query/modification", (e) => q(e, new z({
  values: { originalQuery: ve, modification: ve }
}))), er = async (e, t) => {
  var o;
  const r = Bw(e), n = Tl(e), i = Nw(e), s = await Sa(e, t), a = () => e.pagination ? e.pagination.firstResult + e.pagination.numberOfResults > Er ? Er - e.pagination.firstResult : e.pagination.numberOfResults : void 0;
  return vi({
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
    ...r && { cq: r },
    ...n.length && { facets: n },
    ...e.pagination && {
      numberOfResults: a(),
      firstResult: e.pagination.firstResult
    },
    ...e.facetOptions && {
      facetOptions: { freezeFacetOrder: e.facetOptions.freezeFacetOrder }
    },
    ...((o = e.folding) == null ? void 0 : o.enabled) && {
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
function Nw(e) {
  var r;
  const t = (r = e.automaticFacetSet) == null ? void 0 : r.set;
  return t ? Object.values(t).map((n) => n.response).map(zw).filter((n) => n.currentValues.length > 0) : void 0;
}
function zw(e) {
  const { field: t, label: r, values: n } = e, i = n.filter((s) => s.state === "selected");
  return {
    field: t,
    label: r,
    currentValues: i
  };
}
function Bw(e) {
  var s;
  const t = ((s = e.advancedSearchQueries) == null ? void 0 : s.cq.trim()) || "", r = Object.values(e.tabSet || {}).find((a) => a.isActive), n = (r == null ? void 0 : r.expression.trim()) || "", i = Hw(e);
  return [t, n, ...i].filter((a) => !!a).join(" AND ");
}
function Hw(e) {
  return Object.values(e.staticFilterSet || {}).map((r) => {
    const n = r.values.filter((s) => s.state === "selected" && !!s.expression.trim()), i = n.map((s) => s.expression).join(" OR ");
    return n.length > 1 ? `(${i})` : i;
  });
}
let Hr = class {
  constructor(t, r = (n) => {
    this.dispatch(Ii({ q: n }));
  }) {
    te(this, "config");
    te(this, "onUpdateQueryForCorrection");
    this.config = t, this.onUpdateQueryForCorrection = r;
  }
  async fetchFromAPI({ mappings: t, request: r }, n) {
    var c;
    const i = Date.now(), s = od(await this.extra.apiClient.search(r, n), t), a = Date.now() - i, o = ((c = this.getState().query) == null ? void 0 : c.q) || "";
    return { response: s, duration: a, queryExecuted: o, requestExecuted: r };
  }
  async process(t) {
    return this.processQueryErrorOrContinue(t) ?? await this.processQueryCorrectionsOrContinue(t) ?? await this.processQueryTriggersOrContinue(t) ?? this.processSuccessResponse(t);
  }
  processQueryErrorOrContinue(t) {
    return ht(t.response) ? (this.dispatch(Ht(t.response.error)), this.rejectWithValue(t.response.error)) : null;
  }
  async processQueryCorrectionsOrContinue(t) {
    const r = this.getState(), n = this.getSuccessResponse(t);
    if (!n || !r.didYouMean)
      return null;
    const { enableDidYouMean: i, automaticallyCorrectQuery: s } = r.didYouMean, { results: a, queryCorrections: o, queryCorrection: c } = n;
    if (!i || !s)
      return null;
    const u = a.length === 0 && o && o.length !== 0, l = !X(c) && !X(c.correctedQuery);
    if (!u && !l)
      return null;
    const p = u ? await this.processLegacyDidYouMeanAutoCorrection(t) : this.processModernDidYouMeanAutoCorrection(t);
    return this.dispatch(ut(lt(this.getState()))), p;
  }
  async processLegacyDidYouMeanAutoCorrection(t) {
    const r = this.getCurrentQuery(), n = this.getSuccessResponse(t);
    if (!n.queryCorrections)
      return null;
    const { correctedQuery: i } = n.queryCorrections[0], s = await this.automaticallyRetryQueryWithCorrection(i);
    return ht(s.response) ? (this.dispatch(Ht(s.response.error)), this.rejectWithValue(s.response.error)) : (this.logOriginalAnalyticsQueryBeforeAutoCorrection(t), this.dispatch(ut(lt(this.getState()))), {
      ...s,
      response: {
        ...s.response.success,
        queryCorrections: n.queryCorrections
      },
      automaticallyCorrected: !0,
      originalQuery: r,
      analyticsAction: hc()
    });
  }
  processModernDidYouMeanAutoCorrection(t) {
    const r = this.getSuccessResponse(t), { correctedQuery: n, originalQuery: i } = r.queryCorrection;
    return this.onUpdateQueryForCorrection(n), {
      ...t,
      response: {
        ...r
      },
      queryExecuted: n,
      automaticallyCorrected: !0,
      originalQuery: i,
      analyticsAction: hc()
    };
  }
  logOriginalAnalyticsQueryBeforeAutoCorrection(t) {
    var i;
    const r = this.getState(), n = this.getSuccessResponse(t);
    (i = this.analyticsAction) == null || i.call(this)(this.dispatch, () => this.getStateAfterResponse(t.queryExecuted, t.duration, r, n), this.extra);
  }
  async processQueryTriggersOrContinue(t) {
    var o, c;
    const r = this.getSuccessResponse(t);
    if (!r)
      return null;
    const n = ((o = r.triggers.find((u) => u.type === "query")) == null ? void 0 : o.content) || "";
    if (!n)
      return null;
    if (((c = this.getState().triggers) == null ? void 0 : c.queryModification.queryToIgnore) === n)
      return this.dispatch(Od("")), null;
    this.analyticsAction && await this.dispatch(this.analyticsAction);
    const s = this.getCurrentQuery(), a = await this.automaticallyRetryQueryWithTriggerModification(n);
    return ht(a.response) ? (this.dispatch(Ht(a.response.error)), this.rejectWithValue(a.response.error)) : (this.dispatch(ut(lt(this.getState()))), {
      ...a,
      response: {
        ...a.response.success
      },
      automaticallyCorrected: !1,
      originalQuery: s,
      analyticsAction: jw()
    });
  }
  getStateAfterResponse(t, r, n, i) {
    var s;
    return {
      ...n,
      query: {
        q: t,
        enableQuerySyntax: ((s = n.query) == null ? void 0 : s.enableQuerySyntax) ?? cr().enableQuerySyntax
      },
      search: {
        ...ft(),
        duration: r,
        response: i,
        results: i.results
      }
    };
  }
  processSuccessResponse(t) {
    return this.dispatch(ut(lt(this.getState()))), {
      ...t,
      response: this.getSuccessResponse(t),
      automaticallyCorrected: !1,
      originalQuery: this.getCurrentQuery(),
      analyticsAction: this.analyticsAction
    };
  }
  getSuccessResponse(t) {
    return kd(t.response) ? t.response.success : null;
  }
  async automaticallyRetryQueryWithCorrection(t) {
    this.onUpdateQueryForCorrection(t);
    const r = await this.fetchFromAPI(await er(this.getState()), { origin: "mainSearch" });
    return this.dispatch(Ca(t)), r;
  }
  async automaticallyRetryQueryWithTriggerModification(t) {
    return this.dispatch(Fd({
      newQuery: t,
      originalQuery: this.getCurrentQuery()
    })), this.onUpdateQueryForCorrection(t), await this.fetchFromAPI(await er(this.getState()), { origin: "mainSearch" });
  }
  getCurrentQuery() {
    var r;
    const t = this.getState();
    return ((r = t.query) == null ? void 0 : r.q) !== void 0 ? t.query.q : "";
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
ne("search/executeSearch", async (e, t) => {
  const r = t.getState();
  return await xa(r, t, e);
});
ne("search/fetchPage", async (e, t) => {
  const r = t.getState();
  return await Td(r, t, e);
});
ne("search/fetchMoreResults", async (e, t) => {
  const r = t.getState();
  return await Md(t, r);
});
ne("search/fetchFacetValues", async (e, t) => {
  const r = t.getState();
  return await Gw(t, e, r);
});
ne("search/fetchInstantResults", async (e, t) => Dd(e, t));
const Yw = async (e, t) => {
  var n, i;
  const r = await er(e, t);
  return r.request = {
    ...r.request,
    firstResult: (((n = e.pagination) == null ? void 0 : n.firstResult) ?? 0) + (((i = e.search) == null ? void 0 : i.results.length) ?? 0)
  }, r;
}, Ww = async (e, t, r) => {
  const n = await Sa(e);
  return vi({
    ...n,
    ...e.didYouMean && {
      enableDidYouMean: e.didYouMean.enableDidYouMean
    },
    numberOfResults: r,
    q: t
  });
}, Kw = async (e, t) => {
  const r = await er(e, t);
  return r.request.numberOfResults = 0, r;
}, Ed = (e) => {
  var t;
  e.configuration.analytics.enabled && or.getInstance().addElement({
    name: "Query",
    ...((t = e.query) == null ? void 0 : t.q) && {
      value: e.query.q
    },
    time: JSON.stringify(/* @__PURE__ */ new Date())
  });
};
async function Dd(e, t) {
  q(e, {
    id: j,
    q: j,
    maxResultsPerQuery: new W({
      required: !0,
      min: 1
    }),
    cacheTimeout: new W()
  });
  const { q: r, maxResultsPerQuery: n } = e, i = t.getState(), s = new Hr({ ...t, analyticsAction: qw() }, (u) => {
    t.dispatch(Ad({ q: u, id: e.id }));
  }), a = await Ww(i, r, n), o = await s.fetchFromAPI(a, {
    origin: "instantResults",
    disableAbortWarning: !0
  }), c = await s.process(o);
  return "response" in c ? {
    results: c.response.results,
    searchUid: c.response.searchUid,
    analyticsAction: c.analyticsAction,
    totalCountFiltered: c.response.totalCountFiltered,
    duration: c.duration
  } : c;
}
async function Td(e, t, r) {
  Ed(e);
  const { analyticsClientMiddleware: n, preprocessRequest: i, logger: s } = t.extra, { description: a } = await r.prepare({
    getState: () => t.getState(),
    analyticsClientMiddleware: n,
    preprocessRequest: i,
    logger: s
  }), o = new Hr({
    ...t,
    analyticsAction: r
  }), c = await er(e, a), u = await o.fetchFromAPI(c, { origin: "mainSearch" });
  return await o.process(u);
}
async function Md(e, t) {
  const { analyticsClientMiddleware: r, preprocessRequest: n, logger: i } = e.extra, { description: s } = await fc().prepare({
    getState: () => e.getState(),
    analyticsClientMiddleware: r,
    preprocessRequest: n,
    logger: i
  }), a = new Hr({
    ...e,
    analyticsAction: fc()
  }), o = await Yw(t, s), c = await a.fetchFromAPI(o, { origin: "mainSearch" });
  return await a.process(c);
}
async function Gw(e, t, r) {
  const { analyticsClientMiddleware: n, preprocessRequest: i, logger: s } = e.extra, { description: a } = await t.prepare({
    getState: () => e.getState(),
    analyticsClientMiddleware: n,
    preprocessRequest: i,
    logger: s
  }), o = new Hr({ ...e, analyticsAction: t }), c = await Kw(r, a), u = await o.fetchFromAPI(c, {
    origin: "facetValues"
  });
  return await o.process(u);
}
async function xa(e, t, r) {
  Ed(e);
  const { analyticsClientMiddleware: n, preprocessRequest: i, logger: s } = t.extra, { description: a } = await r.prepare({
    getState: () => t.getState(),
    analyticsClientMiddleware: n,
    preprocessRequest: i,
    logger: s
  }), o = await er(e, a), c = new Hr({ ...t, analyticsAction: r }), u = await c.fetchFromAPI(o, { origin: "mainSearch" });
  return await c.process(u);
}
class Yr {
  constructor(t, r = (n) => {
    this.dispatch(Ii({ q: n }));
  }) {
    te(this, "config");
    te(this, "onUpdateQueryForCorrection");
    this.config = t, this.onUpdateQueryForCorrection = r;
  }
  async fetchFromAPI({ mappings: t, request: r }, n) {
    var c;
    const i = Date.now(), s = od(await this.extra.apiClient.search(r, n), t), a = Date.now() - i, o = ((c = this.getState().query) == null ? void 0 : c.q) || "";
    return { response: s, duration: a, queryExecuted: o, requestExecuted: r };
  }
  async process(t) {
    return this.processQueryErrorOrContinue(t) ?? await this.processQueryCorrectionsOrContinue(t) ?? await this.processQueryTriggersOrContinue(t) ?? this.processSuccessResponse(t);
  }
  processQueryErrorOrContinue(t) {
    return ht(t.response) ? (this.dispatch(Ht(t.response.error)), this.rejectWithValue(t.response.error)) : null;
  }
  async processQueryCorrectionsOrContinue(t) {
    const r = this.getState(), n = this.getSuccessResponse(t);
    if (!n || !r.didYouMean)
      return null;
    const { enableDidYouMean: i, automaticallyCorrectQuery: s } = r.didYouMean, { results: a, queryCorrections: o, queryCorrection: c } = n;
    if (!i)
      return null;
    if (!s)
      return !X(c) && !X(c.correctedQuery) ? this.processModernDidYouMeanAutoCorrection(t) : null;
    const u = a.length === 0 && o && o.length !== 0, l = !X(c) && !X(c.correctedQuery);
    if (!u && !l)
      return null;
    const p = u ? await this.processLegacyDidYouMeanAutoCorrection(t) : this.processModernDidYouMeanAutoCorrection(t);
    return this.dispatch(ut(lt(this.getState()))), p;
  }
  async processLegacyDidYouMeanAutoCorrection(t) {
    const r = this.getCurrentQuery(), n = this.getSuccessResponse(t);
    if (!n.queryCorrections)
      return null;
    const { correctedQuery: i } = n.queryCorrections[0], s = await this.automaticallyRetryQueryWithCorrection(i);
    return ht(s.response) ? (this.dispatch(Ht(s.response.error)), this.rejectWithValue(s.response.error)) : (this.dispatch(ut(lt(this.getState()))), {
      ...s,
      response: {
        ...s.response.success,
        queryCorrections: n.queryCorrections
      },
      automaticallyCorrected: !0,
      originalQuery: r
    });
  }
  processModernDidYouMeanAutoCorrection(t) {
    const r = this.getSuccessResponse(t), { correctedQuery: n, originalQuery: i } = r.queryCorrection;
    return this.onUpdateQueryForCorrection(n), {
      ...t,
      response: {
        ...r
      },
      queryExecuted: n,
      automaticallyCorrected: !0,
      originalQuery: i
    };
  }
  async processQueryTriggersOrContinue(t) {
    var o, c;
    const r = this.getSuccessResponse(t);
    if (!r)
      return null;
    const n = ((o = r.triggers.find((u) => u.type === "query")) == null ? void 0 : o.content) || "";
    if (!n)
      return null;
    if (((c = this.getState().triggers) == null ? void 0 : c.queryModification.queryToIgnore) === n)
      return this.dispatch(Od("")), null;
    const s = this.getCurrentQuery(), a = await this.automaticallyRetryQueryWithTriggerModification(n);
    return ht(a.response) ? (this.dispatch(Ht(a.response.error)), this.rejectWithValue(a.response.error)) : (this.dispatch(ut(lt(this.getState()))), {
      ...a,
      response: {
        ...a.response.success
      },
      automaticallyCorrected: !1,
      originalQuery: s
    });
  }
  processSuccessResponse(t) {
    return this.dispatch(ut(lt(this.getState()))), {
      ...t,
      response: this.getSuccessResponse(t),
      automaticallyCorrected: !1,
      originalQuery: this.getCurrentQuery()
    };
  }
  getSuccessResponse(t) {
    return kd(t.response) ? t.response.success : null;
  }
  async automaticallyRetryQueryWithCorrection(t) {
    this.onUpdateQueryForCorrection(t);
    const r = this.getState(), { actionCause: n } = Pw(), i = await this.fetchFromAPI(await gt(r, this.extra.navigatorContext, {
      actionCause: n
    }), { origin: "mainSearch" });
    return this.dispatch(Ca(t)), i;
  }
  async automaticallyRetryQueryWithTriggerModification(t) {
    return this.dispatch(Fd({
      newQuery: t,
      originalQuery: this.getCurrentQuery()
    })), this.onUpdateQueryForCorrection(t), await this.fetchFromAPI(await gt(this.getState(), this.extra.navigatorContext), { origin: "mainSearch" });
  }
  getCurrentQuery() {
    var r;
    const t = this.getState();
    return ((r = t.query) == null ? void 0 : r.q) !== void 0 ? t.query.q : "";
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
ne("search/prepareForSearchWithQuery", (e, t) => {
  const { dispatch: r } = t;
  q(e, {
    q: new Q(),
    enableQuerySyntax: new ie(),
    clearFilters: new ie()
  }), e.clearFilters && (r(zr()), r(vd())), r(Id({ allow: !0 })), r(Ii({ q: e.q, enableQuerySyntax: e.enableQuerySyntax })), r(xd(1));
});
const Jw = w("search/updateSearchAction"), _e = ne("search/executeSearch", async (e, t) => {
  const r = t.getState();
  if (r.configuration.analytics.analyticsMode === "legacy")
    return xa(r, t, e.legacy);
  Pd(r);
  const n = e.next ? Ud(e.next) : void 0, i = await gt(r, t.extra.navigatorContext, n), s = new Yr({ ...t, analyticsAction: n ?? {} }), a = await s.fetchFromAPI(i, {
    origin: "mainSearch"
  });
  return await s.process(a);
}), Tn = ne("search/fetchPage", async (e, t) => {
  const r = t.getState();
  if (Pd(r), r.configuration.analytics.analyticsMode === "legacy" || !e.next)
    return Td(r, t, e.legacy);
  const n = new Yr({
    ...t,
    analyticsAction: e.next
  }), i = await gt(r, t.extra.navigatorContext, e.next), s = await n.fetchFromAPI(i, { origin: "mainSearch" });
  return await n.process(s);
}), Xi = ne("search/fetchMoreResults", async (e, t) => {
  const r = t.getState();
  if (r.configuration.analytics.analyticsMode === "legacy")
    return Md(t, r);
  const n = yw(Xt.browseResults, t.getState), i = new Yr({
    ...t,
    analyticsAction: n
  }), s = await Zw(r, t.extra.navigatorContext, n), a = await i.fetchFromAPI(s, { origin: "mainSearch" });
  return await i.process(a);
}), _d = ne("search/fetchFacetValues", async (e, t) => {
  const r = t.getState();
  if (r.configuration.analytics.analyticsMode === "legacy")
    return xa(r, t, e.legacy);
  const n = new Yr({ ...t, analyticsAction: {} }), i = await eb(r, t.extra.navigatorContext), s = await n.fetchFromAPI(i, {
    origin: "facetValues"
  });
  return await n.process(s);
});
ne("search/fetchInstantResults", async (e, t) => {
  const r = t.getState();
  if (r.configuration.analytics.analyticsMode === "legacy")
    return Dd(e, t);
  q(e, {
    id: j,
    q: j,
    maxResultsPerQuery: new W({
      required: !0,
      min: 1
    }),
    cacheTimeout: new W()
  });
  const { q: n, maxResultsPerQuery: i } = e, s = Ud(Ow()), a = await Xw(r, t.extra.navigatorContext, n, i, s), o = new Yr({ ...t, analyticsAction: s }, (l) => {
    t.dispatch(Ad({ q: l, id: e.id }));
  }), c = await o.fetchFromAPI(a, {
    origin: "instantResults",
    disableAbortWarning: !0
  }), u = await o.process(c);
  return "response" in u ? {
    results: u.response.results,
    searchUid: u.response.searchUid,
    totalCountFiltered: u.response.totalCountFiltered,
    duration: u.duration
  } : u;
});
const Zw = async (e, t, r) => {
  var i, s;
  const n = await gt(e, t, r);
  return n.request = {
    ...n.request,
    firstResult: (((i = e.pagination) == null ? void 0 : i.firstResult) ?? 0) + (((s = e.search) == null ? void 0 : s.results.length) ?? 0)
  }, n;
}, Xw = async (e, t, r, n, i) => {
  const s = rd(e, t, i);
  return vi({
    ...s,
    ...e.didYouMean && {
      enableDidYouMean: e.didYouMean.enableDidYouMean
    },
    numberOfResults: n,
    q: r
  });
}, eb = async (e, t, r) => {
  const n = await gt(e, t, r);
  return n.request.numberOfResults = 0, n;
}, Pd = (e) => {
  var t;
  e.configuration.analytics.enabled && or.getInstance().addElement({
    name: "Query",
    ...((t = e.query) == null ? void 0 : t.q) && {
      value: e.query.q
    },
    time: JSON.stringify(/* @__PURE__ */ new Date())
  });
}, Ud = (e) => ({
  actionCause: e.actionCause,
  type: e.actionCause
}), Vd = {
  q: new Q(),
  enableQuerySyntax: new ie(),
  aq: new Q(),
  cq: new Q(),
  firstResult: new W({ min: 0 }),
  numberOfResults: new W({ min: 0 }),
  sortCriteria: new Q(),
  f: new z(),
  fExcluded: new z(),
  cf: new z(),
  nf: new z(),
  mnf: new z(),
  df: new z(),
  debug: new ie(),
  sf: new z(),
  tab: new Q(),
  af: new z()
}, St = w("searchParameters/restore", (e) => q(e, Vd)), tb = w("searchParameters/restoreTab", (e) => q(e, j));
w("tab/register", (e) => {
  const t = new z({
    values: {
      id: j,
      expression: Pe
    }
  });
  return q(e, t);
});
const Wr = w("tab/updateActiveTab", (e) => q(e, j));
function ka(e, t) {
  var s;
  const { facetId: r, criterion: n } = t, i = (s = e[r]) == null ? void 0 : s.request;
  i && (i.sortCriteria = n);
}
function hr(e) {
  e && (e.currentValues = e.currentValues.map((t) => ({
    ...t,
    previousState: t.state !== "idle" ? t.state : void 0,
    state: "idle"
  })), e.preventAutoSelect = !0);
}
function rb(e, t) {
  e && (e.numberOfValues = t);
}
const $d = new Q({
  regex: /^[a-zA-Z0-9-_]+$/
}), Ld = new Q({ required: !0 });
new oe({
  each: new Q()
});
new Q();
const Qd = new ie(), jd = new W({ min: 0 }), Ra = new W({ min: 1 }), Nd = new ie({
  required: !0
}), nb = new z(), ib = new Q(), sb = {
  captions: nb,
  numberOfValues: Ra,
  query: ib
};
new z({
  values: sb
});
const ab = new z({
  options: { required: !1 },
  values: {
    type: new Q({
      constrainTo: ["simple"],
      emptyAllowed: !1,
      required: !0
    }),
    values: new oe({
      required: !0,
      max: 25,
      each: new Q({ emptyAllowed: !1, required: !0 })
    })
  }
}), ob = new oe({
  min: 1,
  max: 25,
  required: !1,
  each: new Q({ emptyAllowed: !1, required: !0 })
}), ur = {
  value: j,
  numberOfResults: new W({ min: 0 }),
  state: j
}, cb = {
  facetId: ue,
  field: new Q({ required: !0, emptyAllowed: !0 }),
  tabs: new z({
    options: {
      required: !1
    },
    values: {
      included: new oe({ each: new Q() }),
      excluded: new oe({ each: new Q() })
    }
  }),
  activeTab: new Q({ required: !1 }),
  filterFacetCount: new ie({ required: !1 }),
  injectionDepth: new W({ required: !1, min: 0 }),
  numberOfValues: new W({ required: !1, min: 1 }),
  sortCriteria: new Ce({ required: !1 }),
  resultsMustMatch: new Ce({ required: !1 }),
  allowedValues: ab,
  customSort: ob
}, zd = w("facet/register", (e) => q(e, cb)), Bd = w("facet/toggleSelectValue", (e) => q(e, {
  facetId: ue,
  selection: new z({ values: ur })
})), Hd = w("facet/toggleExcludeValue", (e) => q(e, {
  facetId: ue,
  selection: new z({ values: ur })
})), Ai = w("facet/deselectAll", (e) => q(e, ue)), ub = w("facet/updateSortCriterion", (e) => q(e, {
  facetId: ue,
  criterion: new Ce({ required: !0 })
})), lb = w("facet/updateNumberOfValues", (e) => q(e, {
  facetId: ue,
  numberOfValues: new W({ required: !0, min: 1 })
})), db = w("facet/updateIsFieldExpanded", (e) => q(e, {
  facetId: ue,
  isFieldExpanded: new ie({ required: !0 })
})), fb = w("facet/updateFreezeCurrentValues", (e) => q(e, {
  facetId: ue,
  freezeCurrentValues: new ie({ required: !0 })
}));
se(ya(), (e) => {
  e.addCase(zd, (t, r) => {
    const { facetId: n, tabs: i } = r.payload;
    n in t || (t[n] = Fv(pb(r.payload), i));
  }).addCase(st.fulfilled, (t, r) => {
    if (r.payload && Object.keys(r.payload.facetSet).length !== 0)
      return r.payload.facetSet;
  }).addCase(St, (t, r) => {
    const n = r.payload.f || {}, i = r.payload.fExcluded || {};
    Object.keys(t).forEach((a) => {
      const { request: o } = t[a], c = n[a] || [], u = i[a] || [], l = c.length + u.length, f = o.currentValues.filter((p) => !c.includes(p.value) && !u.includes(p.value));
      o.currentValues = [
        ...c.map(gc),
        ...u.map(mc),
        ...f.map(gb)
      ], o.preventAutoSelect = l > 0, o.numberOfValues = Math.max(l, o.numberOfValues);
    });
  }).addCase(Bd, (t, r) => {
    var c;
    const { facetId: n, selection: i } = r.payload, s = (c = t[n]) == null ? void 0 : c.request;
    if (!s)
      return;
    s.preventAutoSelect = !0;
    const a = s.currentValues.find((u) => u.value === i.value);
    if (!a) {
      gn(s, i);
      return;
    }
    const o = a.state === "selected";
    a.previousState = a.state, a.state = o ? "idle" : "selected", s.freezeCurrentValues = !0;
  }).addCase(Hd, (t, r) => {
    var c;
    const { facetId: n, selection: i } = r.payload, s = (c = t[n]) == null ? void 0 : c.request;
    if (!s)
      return;
    s.preventAutoSelect = !0;
    const a = s.currentValues.find((u) => u.value === i.value);
    if (!a) {
      gn(s, i);
      return;
    }
    const o = a.state === "excluded";
    a.previousState = a.state, a.state = o ? "idle" : "excluded", s.freezeCurrentValues = !0;
  }).addCase(fb, (t, r) => {
    var a;
    const { facetId: n, freezeCurrentValues: i } = r.payload, s = (a = t[n]) == null ? void 0 : a.request;
    s && (s.freezeCurrentValues = i);
  }).addCase(Ai, (t, r) => {
    var n;
    hr((n = t[r.payload]) == null ? void 0 : n.request);
  }).addCase(zr, (t) => {
    Object.values(t).filter((r) => r.hasBreadcrumbs).forEach(({ request: r }) => hr(r));
  }).addCase(vd, (t) => {
    Object.values(t).filter((r) => !r.hasBreadcrumbs).forEach(({ request: r }) => hr(r));
  }).addCase(Id, (t, r) => Object.values(t).forEach((n) => {
    n.request.preventAutoSelect = !r.payload.allow;
  })).addCase(ub, (t, r) => {
    ka(t, r.payload);
  }).addCase(lb, (t, r) => {
    var s;
    const { facetId: n, numberOfValues: i } = r.payload;
    rb((s = t[n]) == null ? void 0 : s.request, i);
  }).addCase(db, (t, r) => {
    var a;
    const { facetId: n, isFieldExpanded: i } = r.payload, s = (a = t[n]) == null ? void 0 : a.request;
    s && (s.isFieldExpanded = i);
  }).addCase(_e.fulfilled, (t, r) => {
    r.payload.response.facets.forEach((i) => {
      var s;
      return pc((s = t[i.facetId]) == null ? void 0 : s.request, i);
    });
  }).addCase(_d.fulfilled, (t, r) => {
    r.payload.response.facets.forEach((i) => {
      var s;
      return pc((s = t[i.facetId]) == null ? void 0 : s.request, i);
    });
  }).addCase(Si, (t, r) => {
    var l;
    const { facetId: n, value: i } = r.payload, s = (l = t[n]) == null ? void 0 : l.request;
    if (!s)
      return;
    const { rawValue: a } = i, { currentValues: o } = s, c = o.find((f) => f.value === a);
    if (c) {
      c.state = "selected";
      return;
    }
    const u = gc(a);
    gn(s, u), s.freezeCurrentValues = !0, s.preventAutoSelect = !0;
  }).addCase(wi, (t, r) => {
    var l;
    const { facetId: n, value: i } = r.payload, s = (l = t[n]) == null ? void 0 : l.request;
    if (!s)
      return;
    const { rawValue: a } = i, { currentValues: o } = s, c = o.find((f) => f.value === a);
    if (c) {
      c.state = "excluded";
      return;
    }
    const u = mc(a);
    gn(s, u), s.freezeCurrentValues = !0, s.preventAutoSelect = !0;
  }).addCase(bi, (t, r) => {
    if (!(r.payload in t))
      return;
    const { request: n } = t[r.payload];
    hr(n);
  }).addCase(Wr, (t, r) => {
    const n = r.payload;
    Object.keys(t).forEach((i) => {
      var o, c, u, l;
      const s = t[i];
      (((c = (o = s.tabs) == null ? void 0 : o.included) == null ? void 0 : c.length) || ((l = (u = s.tabs) == null ? void 0 : u.excluded) == null ? void 0 : l.length)) && !wa(s.tabs, n) && hr(s.request);
    });
  });
});
function gn(e, t) {
  const { currentValues: r } = e, n = r.findIndex((s) => s.state === "idle"), i = n === -1 ? r.length : n;
  e.currentValues.splice(i, 0, t), n > -1 && e.currentValues.pop(), e.numberOfValues = e.currentValues.length;
}
function pc(e, t) {
  e && (e.currentValues = t.values.map(Yd), e.freezeCurrentValues = !1, e.preventAutoSelect = !1);
}
const hb = {
  filterFacetCount: !0,
  injectionDepth: 1e3,
  numberOfValues: 8,
  sortCriteria: "automatic",
  resultsMustMatch: "atLeastOneValue"
};
function pb(e) {
  return {
    ...hb,
    type: "specific",
    currentValues: [],
    freezeCurrentValues: !1,
    isFieldExpanded: !1,
    preventAutoSelect: !1,
    ...e
  };
}
function Yd(e) {
  const { value: t, state: r } = e;
  return { value: t, state: r };
}
function gc(e) {
  return { value: e, state: "selected" };
}
function mc(e) {
  return { value: e, state: "excluded" };
}
function gb(e) {
  return { ...e, state: "idle" };
}
const Wd = {
  filterFacetCount: !0,
  injectionDepth: 1e3,
  numberOfValues: 8,
  sortCriteria: "ascending",
  rangeAlgorithm: "even",
  resultsMustMatch: "atLeastOneValue"
};
function Kd(e, t) {
  const { request: r } = t, { facetId: n } = r;
  if (n in e)
    return;
  const i = tf(r);
  r.numberOfValues = i, e[n] = t;
}
function Gd(e, t, r) {
  var i;
  const n = (i = e[t]) == null ? void 0 : i.request;
  n && (n.currentValues = r, n.numberOfValues = tf(n));
}
function Jd(e, t, r) {
  var a;
  const n = (a = e[t]) == null ? void 0 : a.request;
  if (!n)
    return;
  const i = ti(n.currentValues, r);
  if (!i)
    return;
  const s = i.state === "selected";
  i.previousState = i.state, i.state = s ? "idle" : "selected", n.preventAutoSelect = !0;
}
function Zd(e, t, r) {
  var a;
  const n = (a = e[t]) == null ? void 0 : a.request;
  if (!n)
    return;
  const i = ti(n.currentValues, r);
  if (!i)
    return;
  const s = i.state === "excluded";
  i.previousState = i.state, i.state = s ? "idle" : "excluded", n.preventAutoSelect = !0;
}
function dt(e, t) {
  var n;
  const r = (n = e[t]) == null ? void 0 : n.request;
  r && r.currentValues.forEach((i) => {
    i.state !== "idle" && (i.previousState = i.state), i.state = "idle";
  });
}
function Xd(e, t) {
  Object.entries(e).forEach(([r, { request: n }]) => {
    const i = t[r] || [];
    n.currentValues.forEach((o) => (!!ti(i, o) ? o.state = "selected" : typeof t == "object" && r in t && o.state !== "idle" && (o.previousState = o.state, o.state = "idle"), o));
    const s = i.filter((o) => !ti(n.currentValues, o)), a = n.currentValues;
    a.push(...s), n.numberOfValues = Math.max(n.numberOfValues, a.length);
  });
}
function ef(e, t, r) {
  t.forEach((n) => {
    var o;
    const i = n.facetId, s = (o = e[i]) == null ? void 0 : o.request;
    if (!s)
      return;
    const a = r(n.values);
    s.currentValues = a, s.preventAutoSelect = !1;
  });
}
function ti(e, t) {
  const { start: r, end: n } = t;
  return e.find((i) => i.start === r && i.end === n);
}
function mn(e, t) {
  const { start: r, end: n, endInclusive: i } = t;
  return e.find((s) => s.start === r && s.end === n && s.endInclusive === i);
}
function tf(e) {
  const { generateAutomaticRanges: t, currentValues: r, numberOfValues: n } = e;
  return t ? Math.max(n, r.length) : r.length;
}
function mb(e) {
  const t = yc(e.start, e), r = yc(e.end, e), n = e.endInclusive ?? !1, i = e.state ?? "idle";
  return {
    start: t,
    end: r,
    endInclusive: n,
    state: i
  };
}
function yc(e, t) {
  const { dateFormat: r } = t;
  return Og(e) ? (To(e), qg(e)) : typeof e == "string" && Fr(e) ? (To(e), e) : (kg(e, r), sl(Yn(e, r)));
}
const rf = w("rangeFacet/updateSortCriterion", (e) => q(e, {
  facetId: ue,
  criterion: new Ce({ required: !0 })
})), Kr = {
  state: j,
  start: new W({ required: !0 }),
  end: new W({ required: !0 }),
  endInclusive: new ie({ required: !0 }),
  numberOfResults: new W({ required: !0, min: 0 })
}, wt = {
  start: j,
  end: j,
  endInclusive: new ie({ required: !0 }),
  state: j,
  numberOfResults: new W({ required: !0, min: 0 })
}, nf = (e) => ({
  facetId: ue,
  selection: typeof e.start == "string" ? new z({ values: wt }) : new z({ values: Kr })
}), yb = {
  start: j,
  end: j,
  endInclusive: new ie({ required: !0 }),
  state: j
}, vb = {
  facetId: ue,
  field: j,
  tabs: new z({
    options: {
      required: !1
    },
    values: {
      included: new oe({ each: new Q() }),
      excluded: new oe({ each: new Q() })
    }
  }),
  activeTab: new Q({ required: !1 }),
  currentValues: new oe({
    required: !1,
    each: new z({ values: yb })
  }),
  generateAutomaticRanges: new ie({ required: !0 }),
  filterFacetCount: new ie({ required: !1 }),
  injectionDepth: new W({ required: !1, min: 0 }),
  numberOfValues: new W({ required: !1, min: 1 }),
  sortCriteria: new Ce({ required: !1 }),
  rangeAlgorithm: new Ce({ required: !1 })
};
function vc(e) {
  return Fr(e) ? Es(e) : e;
}
function qa(e) {
  e.currentValues && e.currentValues.forEach((t) => {
    const { start: r, end: n } = mb(t);
    if (Yn(vc(r)).isAfter(Yn(vc(n))))
      throw new Error(`The start value is greater than the end value for the date range ${t.start} to ${t.end}`);
  });
}
const sf = w("dateFacet/register", (e) => {
  try {
    return Ne(e, vb), qa(e), { payload: e, error: null };
  } catch (t) {
    return { payload: e, error: nt(t) };
  }
}), Oa = w("dateFacet/toggleSelectValue", (e) => q(e, {
  facetId: ue,
  selection: new z({ values: wt })
})), Fa = w("dateFacet/toggleExcludeValue", (e) => q(e, {
  facetId: ue,
  selection: new z({ values: wt })
})), af = w("dateFacet/updateFacetValues", (e) => {
  try {
    return Ne(e, {
      facetId: ue,
      values: new oe({
        each: new z({ values: wt })
      })
    }), qa({ currentValues: e.values }), { payload: e, error: null };
  } catch (t) {
    return { payload: e, error: nt(t) };
  }
}), Sb = rf, wb = Ai;
se(ga(), (e) => {
  e.addCase(sf, (t, r) => {
    const { payload: n } = r, { tabs: i } = n, s = bb(n);
    Kd(t, qv(s, i));
  }).addCase(st.fulfilled, (t, r) => {
    var n;
    return ((n = r.payload) == null ? void 0 : n.dateFacetSet) ?? t;
  }).addCase(St, (t, r) => {
    const n = r.payload.df || {};
    Xd(t, n);
  }).addCase(Oa, (t, r) => {
    const { facetId: n, selection: i } = r.payload;
    Jd(t, n, i);
  }).addCase(Fa, (t, r) => {
    const { facetId: n, selection: i } = r.payload;
    Zd(t, n, i);
  }).addCase(af, (t, r) => {
    const { facetId: n, values: i } = r.payload;
    Gd(t, n, i);
  }).addCase(wb, (t, r) => {
    dt(t, r.payload);
  }).addCase(zr, (t) => {
    Object.keys(t).forEach((r) => {
      dt(t, r);
    });
  }).addCase(Sb, (t, r) => {
    ka(t, r.payload);
  }).addCase(_e.fulfilled, (t, r) => {
    const n = r.payload.response.facets;
    ef(t, n, Ea);
  }).addCase(bi, (t, r) => {
    dt(t, r.payload);
  }).addCase(Wr, (t, r) => {
    const n = r.payload;
    Object.keys(t).forEach((i) => {
      var o, c, u, l;
      const s = t[i];
      (((c = (o = s.tabs) == null ? void 0 : o.included) == null ? void 0 : c.length) || ((l = (u = s.tabs) == null ? void 0 : u.excluded) == null ? void 0 : l.length)) && !wa(s.tabs, n) && dt(t, i);
    });
  });
});
function bb(e) {
  return {
    ...Wd,
    currentValues: [],
    preventAutoSelect: !1,
    type: "dateRange",
    ...e
  };
}
function Ea(e) {
  return e.map((t) => {
    const { numberOfResults: r, ...n } = t;
    return n;
  });
}
const Cb = {
  state: j,
  start: new W({ required: !0 }),
  end: new W({ required: !0 }),
  endInclusive: new ie({ required: !0 })
}, Ib = {
  facetId: ue,
  field: j,
  tabs: new z({
    options: {
      required: !1
    },
    values: {
      included: new oe({ each: new Q() }),
      excluded: new oe({ each: new Q() })
    }
  }),
  activeTab: new Q({ required: !1 }),
  currentValues: new oe({
    required: !1,
    each: new z({ values: Cb })
  }),
  generateAutomaticRanges: new ie({ required: !0 }),
  filterFacetCount: new ie({ required: !1 }),
  injectionDepth: new W({ required: !1, min: 0 }),
  numberOfValues: new W({ required: !1, min: 1 }),
  sortCriteria: new Ce({ required: !1 }),
  rangeAlgorithm: new Ce({ required: !1 })
};
function Da(e) {
  e.currentValues && e.currentValues.forEach(({ start: t, end: r }) => {
    if (t > r)
      throw new Error(`The start value is greater than the end value for the numeric range ${t} to ${r}`);
  });
}
const of = w("numericFacet/register", (e) => {
  try {
    return q(e, Ib), Da(e), { payload: e, error: null };
  } catch (t) {
    return { payload: e, error: nt(t) };
  }
}), Ta = w("numericFacet/toggleSelectValue", (e) => q(e, {
  facetId: ue,
  selection: new z({ values: Kr })
})), Ma = w("numericFacet/toggleExcludeValue", (e) => q(e, {
  facetId: ue,
  selection: new z({ values: Kr })
})), cf = w("numericFacet/updateFacetValues", (e) => {
  try {
    return Ne(e, {
      facetId: ue,
      values: new oe({
        each: new z({ values: Kr })
      })
    }), Da({ currentValues: e.values }), { payload: e, error: null };
  } catch (t) {
    return { payload: e, error: nt(t) };
  }
}), Ab = rf, xb = Ai;
se(ma(), (e) => {
  e.addCase(of, (t, r) => {
    const { payload: n } = r, { tabs: i } = n, s = kb(n);
    Kd(t, Ov(s, i));
  }).addCase(st.fulfilled, (t, r) => {
    var n;
    return ((n = r.payload) == null ? void 0 : n.numericFacetSet) ?? t;
  }).addCase(St, (t, r) => {
    const n = r.payload.nf || {};
    Xd(t, n);
  }).addCase(Ta, (t, r) => {
    const { facetId: n, selection: i } = r.payload;
    Jd(t, n, i);
  }).addCase(Ma, (t, r) => {
    const { facetId: n, selection: i } = r.payload;
    Zd(t, n, i);
  }).addCase(cf, (t, r) => {
    const { facetId: n, values: i } = r.payload;
    Gd(t, n, i);
  }).addCase(xb, (t, r) => {
    dt(t, r.payload);
  }).addCase(zr, (t) => {
    Object.keys(t).forEach((r) => {
      dt(t, r);
    });
  }).addCase(Ab, (t, r) => {
    ka(t, r.payload);
  }).addCase(_e.fulfilled, (t, r) => {
    const n = r.payload.response.facets;
    ef(t, n, uf);
  }).addCase(bi, (t, r) => {
    dt(t, r.payload);
  }).addCase(Wr, (t, r) => {
    const n = r.payload;
    Object.keys(t).forEach((i) => {
      var o, c, u, l;
      const s = t[i];
      (((c = (o = s.tabs) == null ? void 0 : o.included) == null ? void 0 : c.length) || ((l = (u = s.tabs) == null ? void 0 : u.excluded) == null ? void 0 : l.length)) && !wa(s.tabs, n) && dt(t, i);
    });
  });
});
function kb(e) {
  return {
    ...Wd,
    currentValues: [],
    preventAutoSelect: !1,
    type: "numericalRange",
    ...e
  };
}
function uf(e) {
  return e.map((t) => {
    const { numberOfResults: r, ...n } = t;
    return n;
  });
}
const Rb = {
  state: new Ce({ required: !0 }),
  numberOfResults: new W({ required: !0, min: 0 }),
  value: new Q({ required: !0, emptyAllowed: !0 }),
  path: new oe({ required: !0, each: j }),
  moreValuesAvailable: new ie({ required: !1 })
};
function _a(e) {
  e.children.forEach((t) => {
    _a(t);
  }), Ne({
    state: e.state,
    numberOfResults: e.numberOfResults,
    value: e.value,
    path: e.path,
    moreValuesAvailable: e.moreValuesAvailable
  }, Rb);
}
const qb = w("commerce/facets/categoryFacet/updateNumberOfValues", (e) => q(e, {
  facetId: j,
  numberOfValues: new W({ required: !1, min: 1 })
})), Pa = w("commerce/facets/categoryFacet/toggleSelectValue", (e) => {
  try {
    return Ne(e.facetId, j), _a(e.selection), { payload: e, error: null };
  } catch (t) {
    return { payload: e, error: nt(t) };
  }
}), Ua = w("commerce/facets/dateFacet/toggleSelectValue", (e) => q(e, {
  facetId: j,
  selection: new z({ values: wt })
})), Va = w("commerce/facets/dateFacet/toggleExcludeValue", (e) => q(e, {
  facetId: j,
  selection: new z({ values: wt })
})), Ob = w("commerce/facets/dateFacet/updateValues", (e) => {
  try {
    return Ne(e, {
      facetId: j,
      values: new oe({
        each: new z({ values: wt })
      })
    }), qa({ currentValues: e.values }), { payload: e, error: null };
  } catch (t) {
    return { payload: e, error: nt(t) };
  }
}), $a = w("commerce/facets/locationFacet/toggleSelectValue", (e) => q(e, {
  facetId: j,
  selection: new z({ values: ur })
})), xi = w("commerce/facets/numericFacet/toggleSelectValue", (e) => q(e, {
  facetId: j,
  selection: new z({
    values: Ri
  })
})), ki = w("commerce/facets/numericFacet/toggleExcludeValue", (e) => q(e, {
  facetId: j,
  selection: new z({
    values: Ri
  })
})), Fb = w("commerce/facets/numericFacet/updateValues", (e) => {
  try {
    return Ne(e, {
      facetId: j,
      values: new oe({
        each: new z({ values: Ri })
      })
    }), Da({ currentValues: e.values }), { payload: e, error: null };
  } catch (t) {
    return { payload: e, error: nt(t) };
  }
}), La = w("commerce/facets/numericFacet/updateManualRange", (e) => Ne(e, {
  facetId: j,
  ...Ri
})), Ri = {
  state: new Q({
    required: !0,
    constrainTo: ["idle", "selected", "excluded"]
  }),
  start: new W({ required: !0 }),
  end: new W({ required: !0 }),
  endInclusive: new ie({ required: !0 })
}, Qa = w("commerce/facets/regularFacet/toggleExcludeValue", (e) => q(e, {
  facetId: j,
  selection: new z({ values: ur })
})), ja = w("commerce/facets/regularFacet/toggleSelectValue", (e) => q(e, {
  facetId: j,
  selection: new z({ values: ur })
}));
function Sc(e, t) {
  for (const r of Object.keys(e))
    delete e[r];
  t.payload.f && wc(e, t.payload.f, "regular"), t.payload.lf && wc(e, t.payload.lf, "location"), t.payload.nf && bc(e, t.payload.nf, "numericalRange"), t.payload.mnf && Eb(e, t.payload.mnf), t.payload.df && bc(e, t.payload.df, "dateRange"), t.payload.cf && Db(e, t.payload.cf);
}
function wc(e, t, r) {
  const n = Object.entries(t);
  for (const [i, s] of n)
    e[i] = {
      request: {
        ...qi(i),
        type: r,
        values: s.map((a) => {
          const o = {
            ...Na(),
            value: a
          };
          switch (r) {
            case "regular":
              return o;
            case "location":
              return o;
          }
        })
      }
    };
}
function bc(e, t, r) {
  const n = Object.entries(t);
  for (const [i, s] of n)
    e[i] = {
      request: {
        ...qi(i),
        type: r,
        values: s.map((a) => {
          const o = {
            start: a.start,
            end: a.end,
            endInclusive: a.endInclusive,
            ...Na()
          };
          switch (r) {
            case "dateRange":
              return o;
            case "numericalRange":
              return o;
          }
        })
      }
    };
}
function Eb(e, t) {
  const r = Object.entries(t);
  for (const [n, i] of r)
    e[n] = {
      request: {
        ...qi(n),
        type: "numericalRange",
        interval: "continuous",
        values: i.map((s) => ({
          start: s.start,
          end: s.end,
          endInclusive: s.endInclusive,
          ...Na()
        }))
      }
    };
}
function Db(e, t) {
  const r = Object.entries(t);
  for (const [n, i] of r)
    e[n] = {
      request: {
        ...qi(n),
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
    }, lf(e[n].request, i);
}
function qi(e) {
  return {
    facetId: e,
    field: e,
    isFieldExpanded: !1,
    preventAutoSelect: !1
  };
}
function Na() {
  return {
    state: "selected",
    isAutoSelected: !1,
    isSuggested: !1,
    moreValuesAvailable: !0
  };
}
function Tb(e) {
  return { state: "selected", value: e };
}
function lf(e, t, r) {
  e.values = Mb(t), e.numberOfValues = r, e.preventAutoSelect = !0;
}
function Mb(e) {
  if (!e.length)
    return [];
  const t = ri(e[0]);
  let r = t;
  const [n, ...i] = e;
  for (const s of i) {
    const a = ri(s);
    r.children.push(a), r = a;
  }
  return r.state = "selected", [t];
}
function ri(e) {
  return {
    children: [],
    state: "idle",
    value: e
  };
}
function _b() {
  return {};
}
se(_b(), (e) => {
  e.addCase(Me.fulfilled, Cc).addCase(Re.fulfilled, Cc).addCase(qt.fulfilled, (t, r) => Ic(t, Tt(r.payload.facetId))).addCase(Rt.fulfilled, (t, r) => {
    if (r.payload.fieldSuggestionsFacets)
      for (const { facetId: n } of r.payload.fieldSuggestionsFacets)
        Ic(t, Tt(n));
  }).addCase(ja, (t, r) => {
    var o;
    const { facetId: n, selection: i } = r.payload, s = (o = t[n]) == null ? void 0 : o.request;
    if (!s || !yn(s))
      return;
    s.preventAutoSelect = !0;
    const a = s.values.find((c) => c.value === i.value);
    if (!a) {
      Be(s, i);
      return;
    }
    ze(a, "select"), s.freezeCurrentValues = !0;
  }).addCase($a, (t, r) => {
    var o;
    const { facetId: n, selection: i } = r.payload, s = (o = t[n]) == null ? void 0 : o.request;
    if (!s || !Pb(s))
      return;
    const a = s.values.find((c) => c.value === i.value);
    if (!a) {
      Be(s, i);
      return;
    }
    ze(a, "select");
  }).addCase(xi, (t, r) => {
    var o;
    const { facetId: n, selection: i } = r.payload, s = (o = t[n]) == null ? void 0 : o.request;
    if (!s || !es(s))
      return;
    s.preventAutoSelect = !0;
    const a = mn(s.values, i);
    if (!a) {
      Be(s, i);
      return;
    }
    if (ze(a, "select"), s.numberOfValues = s.initialNumberOfValues, s.interval === "continuous" && a.state === "idle") {
      s.values = [];
      return;
    }
  }).addCase(Ua, (t, r) => {
    var o;
    const { facetId: n, selection: i } = r.payload, s = (o = t[n]) == null ? void 0 : o.request;
    if (!s || !ts(s))
      return;
    s.preventAutoSelect = !0;
    const a = mn(s.values, i);
    if (!a) {
      Be(s, i);
      return;
    }
    ze(a, "select");
  }).addCase(Pa, (t, r) => {
    var l;
    const { facetId: n, selection: i } = r.payload, s = (l = t[n]) == null ? void 0 : l.request;
    if (!Mn(s))
      return;
    const { path: a } = i, o = a.slice(0, a.length - 1), c = Ub(s, o);
    let u = c.find((f) => f.value === i.value);
    u || (u = ri(i.value), c.push(u)), u.state = u.state === "idle" ? "selected" : "idle", u.state === "selected" && (s.numberOfValues = s.initialNumberOfValues, s.retrieveCount = s.initialNumberOfValues);
  }).addCase(Qa, (t, r) => {
    var o;
    const { facetId: n, selection: i } = r.payload, s = (o = t[n]) == null ? void 0 : o.request;
    if (!s || !yn(s))
      return;
    s.preventAutoSelect = !0;
    const a = s.values.find((c) => c.value === i.value);
    if (!a) {
      Be(s, i);
      return;
    }
    ze(a, "exclude"), s.freezeCurrentValues = !0;
  }).addCase(ki, (t, r) => {
    var o;
    const { facetId: n, selection: i } = r.payload, s = (o = t[n]) == null ? void 0 : o.request;
    if (!s || !es(s))
      return;
    s.preventAutoSelect = !0;
    const a = mn(s.values, i);
    if (!a) {
      Be(s, i);
      return;
    }
    if (ze(a, "exclude"), s.numberOfValues = s.initialNumberOfValues, s.interval === "continuous" && a.state === "idle") {
      s.values = [];
      return;
    }
  }).addCase(Va, (t, r) => {
    var o;
    const { facetId: n, selection: i } = r.payload, s = (o = t[n]) == null ? void 0 : o.request;
    if (!s || !ts(s))
      return;
    s.preventAutoSelect = !0;
    const a = mn(s.values, i);
    if (!a) {
      Be(s, i);
      return;
    }
    ze(a, "exclude"), s.numberOfValues = s.initialNumberOfValues;
  }).addCase(qb, (t, r) => {
    var a;
    const { facetId: n, numberOfValues: i } = r.payload, s = (a = t[n]) == null ? void 0 : a.request;
    Mn(s) && jb(s, i);
  }).addCase(Si, (t, r) => {
    var c;
    const { facetId: n, value: i } = r.payload, s = (c = t[n]) == null ? void 0 : c.request;
    if (!s || !yn(s))
      return;
    const { rawValue: a } = i;
    s.freezeCurrentValues = !0, s.preventAutoSelect = !0;
    const o = s.values.find((u) => u.value === a);
    if (!o) {
      Be(s, Tb(a));
      return;
    }
    ze(o, "select");
  }).addCase(wi, (t, r) => {
    var c;
    const { facetId: n, value: i } = r.payload, s = (c = t[n]) == null ? void 0 : c.request;
    if (!s || !yn(s))
      return;
    const { rawValue: a } = i;
    s.freezeCurrentValues = !0, s.preventAutoSelect = !0;
    const o = s.values.find((u) => u.value === a);
    if (!o) {
      Be(s, { state: "excluded", value: a });
      return;
    }
    ze(o, "exclude");
  }).addCase(da, (t, r) => {
    var o;
    const { facetId: n, value: i } = r.payload, s = (o = t[n]) == null ? void 0 : o.request;
    if (!Mn(s))
      return;
    const a = [...i.path, i.rawValue];
    lf(s, a, s.initialNumberOfValues);
  }).addCase(Fb, (t, r) => {
    var a;
    const { facetId: n, values: i } = r.payload, s = (a = t[n]) == null ? void 0 : a.request;
    !s || !es(s) || (s.values = i, s.numberOfValues = i.length);
  }).addCase(Ob, (t, r) => {
    var a;
    const { facetId: n, values: i } = r.payload, s = (a = t[n]) == null ? void 0 : a.request;
    !s || !ts(s) || (s.values = Ea(i), s.numberOfValues = i.length);
  }).addCase(vm, (t, r) => {
    var a;
    const { facetId: n, numberOfValues: i } = r.payload, s = (a = t[n]) == null ? void 0 : a.request;
    s && (s.numberOfValues = i);
  }).addCase(Sm, (t, r) => {
    var a;
    const { facetId: n, isFieldExpanded: i } = r.payload, s = (a = t[n]) == null ? void 0 : a.request;
    s && (s.isFieldExpanded = i);
  }).addCase(Cl, (t, r) => Object.values(t).forEach((n) => {
    n.request.preventAutoSelect = !r.payload.allow;
  })).addCase(wm, (t, r) => {
    var a;
    const { facetId: n, freezeCurrentValues: i } = r.payload, s = (a = t[n]) == null ? void 0 : a.request;
    s && (s.freezeCurrentValues = i);
  }).addCase(hi, (t, r) => {
    var s;
    const { facetId: n } = r.payload, i = (s = t[n]) == null ? void 0 : s.request;
    i && js(i);
  }).addCase(La, (t, r) => {
    var s;
    const { facetId: n } = r.payload, i = (s = t[n]) == null ? void 0 : s.request;
    i && js(i);
  }).addCase(fi, Qb).addCase(ca, rs).addCase(Pt, rs).addCase(it, rs).addCase(yt, Sc).addCase(sr, Sc);
});
function yn(e) {
  return e.type === "regular";
}
function Pb(e) {
  return e.type === "location";
}
function es(e) {
  return e.type === "numericalRange";
}
function ts(e) {
  return e.type === "dateRange";
}
function Mn(e) {
  return (e == null ? void 0 : e.type) === "hierarchical";
}
function Cc(e, t) {
  const r = new Set(Object.keys(e)), n = t.payload.response.facets;
  for (const i of n)
    Vb(e, i, r);
  for (const i of r)
    delete e[i];
}
function Ic(e, t) {
  var n;
  let r = (n = e[t]) == null ? void 0 : n.request;
  r || (e[t] = { request: {} }, r = e[t].request, r.initialNumberOfValues = 10, r.values = []);
}
function js(e) {
  const t = () => {
    e.values.forEach((r) => {
      r.state = "idle";
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
function Ub(e, t) {
  let r = e.values;
  for (const n of t) {
    let i = r[0];
    (!i || n !== i.value) && (i = ri(n), r.length = 0, r.push(i)), i.state = "idle", r = i.children;
  }
  return r;
}
function ze(e, t) {
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
function Vb(e, t, r) {
  var s;
  const n = t.facetId ?? t.field;
  let i = (s = e[n]) == null ? void 0 : s.request;
  i ? r.delete(n) : (e[n] = { request: {} }, i = e[n].request), i.initialNumberOfValues === void 0 && (i.initialNumberOfValues = t.numberOfValues), i.facetId = n, i.displayName = t.displayName, i.numberOfValues = t.numberOfValues, i.field = t.field, i.type = t.type, i.values = $b(t) ?? [], i.freezeCurrentValues = !1, i.preventAutoSelect = !1, t.type === "hierarchical" && Mn(i) ? i.delimitingCharacter = t.delimitingCharacter : t.type === "numericalRange" && (i.interval = t.interval, t.domain && (i.domain = {
    min: t.domain.min,
    max: t.domain.max,
    increment: t.domain.increment
  }));
}
function $b(e) {
  switch (e.type) {
    case "numericalRange":
      return uf(e.values);
    case "dateRange":
      return Ea(e.values);
    case "hierarchical":
      return e.values.map(df);
    case "regular":
      return e.values.map(Yd);
    case "location":
      return e.values.map(Lb);
    default:
      return;
  }
}
function df(e) {
  const t = e.children.map(df), { state: r, value: n } = e;
  return {
    children: t,
    state: r,
    value: n
  };
}
function Lb(e) {
  const { value: t, state: r } = e;
  return { value: t, state: r };
}
function Be(e, t) {
  const { values: r } = e, n = r.findIndex((s) => s.state === "idle"), i = n === -1 ? r.length : n;
  e.values.splice(i, 0, t), n > -1 && e.values.pop(), e.numberOfValues = e.values.length;
}
function Qb(e) {
  Object.values(e).forEach((t) => js(t.request));
}
function rs(e) {
  Object.values(e).forEach((t) => {
    t.request.values = [];
  });
}
function jb(e, t) {
  e.numberOfValues = t, e.retrieveCount = t;
}
function Nb() {
  return [];
}
se(Nb(), (e) => {
  e.addCase(Rt.fulfilled, (t, r) => r.payload.fieldSuggestionsFacets ?? []);
});
function zb() {
  return {};
}
se(zb(), (e) => e.addCase(La, (t, r) => {
  const { facetId: n, ...i } = r.payload;
  t[n] = { manualRange: i };
}).addCase(ki, (t, r) => {
  vn(t, r.payload.facetId);
}).addCase(xi, (t, r) => {
  vn(t, r.payload.facetId);
}).addCase(hi, (t, r) => {
  vn(t, r.payload.facetId);
}).addCase(yt, (t, r) => {
  Ac(t, r.payload.mnf);
}).addCase(sr, (t, r) => {
  Ac(t, r.payload.mnf);
}).addCase(fi, (t) => {
  for (const r of Object.keys(t))
    vn(t, r);
}));
const vn = (e, t) => {
  e[t] && (e[t] = { manualRange: void 0 });
}, Ac = (e, t) => {
  for (const r of Object.keys(e))
    delete e[r];
  t && Object.entries(t).forEach(([r, n]) => {
    const i = n[0];
    e[r] = { manualRange: i };
  });
}, ff = {
  slotId: j,
  productId: new Q({ required: !1, emptyAllowed: !1 })
}, hf = (e, t) => {
  var r;
  return e.recommendations && ((r = e.recommendations[t]) == null ? void 0 : r.products.length) || 0;
}, Bb = fe((e, t) => ({
  total: Cp(e, t),
  current: hf(e, t)
}), ({ current: e, total: t }) => e < t), pf = (e, t, r, n) => {
  const i = bl(t, r, e);
  return {
    ...i,
    context: {
      ...i.context,
      ...n ? { product: { productId: n } } : {},
      purchased: sm(t.cart)
    },
    slotId: e
  };
}, _n = ne("commerce/recommendations/fetch", async (e, { getState: t, rejectWithValue: r, extra: { apiClient: n, navigatorContext: i } }) => {
  const { slotId: s, productId: a } = e, o = pf(s, t(), i, a), c = await n.getRecommendations(o);
  return Qe(c) ? r(c.error) : {
    response: c.success
  };
}), ns = ne("commerce/recommendations/fetchMore", async (e, { getState: t, rejectWithValue: r, extra: { apiClient: n, navigatorContext: i } }) => {
  const s = e.slotId, a = t();
  if (Bb(a, s))
    return null;
  const c = bp(a, s), l = hf(a, s) / c, f = {
    ...pf(s, a, i),
    page: l
  }, p = await n.getRecommendations(f);
  return Qe(p) ? r(p.error) : {
    response: p.success
  };
}), Hb = w("commerce/recommendations/registerSlot", (e) => q(e, ff)), Yb = {
  child: new z({
    options: { required: !0 },
    values: {
      permanentid: new Q({ required: !0 })
    }
  }),
  ...ff
}, Wb = w("commerce/recommendations/promoteChildToParent", (e) => q(e, Yb)), za = w("commerce/sort/apply", (e) => q(e, {
  by: new Ar({
    enum: Le,
    required: !0
  })
}));
se(Xp(), (e) => {
  e.addCase(Al, (t, r) => {
    var i;
    const n = Sn(t, (i = r.payload) == null ? void 0 : i.slotId);
    n && n.page < n.totalPages - 1 && ++n.page;
  }).addCase(xl, (t, r) => {
    var i;
    const n = Sn(t, (i = r.payload) == null ? void 0 : i.slotId);
    n && n.page > 0 && --n.page;
  }).addCase(ua, (t, r) => {
    const n = Sn(t, r.payload.slotId);
    n && r.payload.page >= 0 && r.payload.page < n.totalPages && (n.page = r.payload.page);
  }).addCase(Il, (t, r) => {
    const n = Sn(t, r.payload.slotId);
    n && (n.page = 0, n.perPage = r.payload.pageSize);
  }).addCase(Me.fulfilled, (t, r) => {
    t.principal = r.payload.response.pagination;
  }).addCase(Re.fulfilled, (t, r) => {
    t.principal = r.payload.response.pagination;
  }).addCase(_n.fulfilled, (t, r) => {
    t.recommendations[r.meta.arg.slotId] = r.payload.response.pagination;
  }).addCase(Im, (t, r) => {
    const n = r.payload.slotId;
    n in t.recommendations || (t.recommendations[n] = ui());
  }).addCase(fi, Fe).addCase(hi, Fe).addCase(ja, Fe).addCase(Qa, Fe).addCase($a, Fe).addCase(xi, Fe).addCase(ki, Fe).addCase(Ua, Fe).addCase(Va, Fe).addCase(Pa, Fe).addCase(za, Fe).addCase(Pt, Fe).addCase(it, Fe).addCase(yt, xc).addCase(sr, xc);
});
function Sn(e, t) {
  return t ? e.recommendations[t] : e.principal;
}
function Fe(e) {
  e.principal.page = ui().page;
}
function xc(e, t) {
  t.payload.page ? e.principal.page = t.payload.page : e.principal.page = ui().page, t.payload.perPage && (e.principal.perPage = t.payload.perPage);
}
const Gr = w("app/setError"), is = () => ({
  error: null,
  isLoading: !1,
  requestId: "",
  responseId: "",
  facets: [],
  products: [],
  results: []
});
se(is(), (e) => {
  e.addCase(Me.rejected, (t, r) => {
    ss(t, r.payload);
  }).addCase(zi.rejected, (t, r) => {
    ss(t, r.payload);
  }).addCase(Me.fulfilled, (t, r) => {
    const n = qc(r.payload);
    kc(t, r.payload.response), t.products = Oc(r.payload.response.products, n, r.payload.response.responseId), t.results = Fc(r.payload.response.results, n, r.payload.response.responseId);
  }).addCase(zi.fulfilled, (t, r) => {
    if (!r.payload)
      return;
    const n = qc(r.payload);
    kc(t, r.payload.response), t.products = t.products.concat(Oc(r.payload.response.products, n, r.payload.response.responseId)), t.results = t.results.concat(Fc(r.payload.response.results, n, r.payload.response.responseId));
  }).addCase(Me.pending, (t, r) => {
    Rc(t, r.meta.requestId);
  }).addCase(zi.pending, (t, r) => {
    Rc(t, r.meta.requestId);
  }).addCase(qm, (t, r) => {
    const n = t.results.length > 0 ? t.results : t.products;
    let i;
    const s = n.findIndex((p) => p.resultType === Te.SPOTLIGHT ? !1 : (i = p.children.find((g) => g.permanentid === r.payload.child.permanentid), !!i)), a = n[s];
    if (s === -1 || i === void 0 || a.resultType === Te.SPOTLIGHT)
      return;
    const o = a.responseId, c = a.position, { children: u, totalNumberOfChildren: l } = a, f = {
      ...i,
      resultType: Te.PRODUCT,
      children: u,
      totalNumberOfChildren: l,
      position: c,
      responseId: o
    };
    n.splice(s, 1, f);
  }).addCase(it, () => is()).addCase(Pt, () => is()).addCase(Gr, (t, r) => {
    ss(t, r.payload);
  });
});
function ss(e, t) {
  e.error = t || null, e.isLoading = !1;
}
function kc(e, t) {
  e.error = null, e.facets = t.facets, e.responseId = t.responseId, e.isLoading = !1;
}
function Rc(e, t) {
  e.isLoading = !0, e.requestId = t;
}
function qc(e) {
  const t = e.response.pagination;
  return t.page * t.perPage;
}
function Oc(e, t, r) {
  return e.map((n, i) => gf(n, t + i + 1, r));
}
function Fc(e, t, r) {
  return e.map((n, i) => Kb(n, t + i + 1, r));
}
function Kb(e, t, r) {
  return e.resultType === Te.SPOTLIGHT ? Gb(e, t, r) : gf(e, t, r);
}
function gf(e, t, r) {
  const n = e.children.some((o) => o.permanentid === e.permanentid);
  if (e.children.length === 0 || n)
    return { ...e, position: t, responseId: r };
  const { children: i, totalNumberOfChildren: s, ...a } = e;
  return {
    ...e,
    children: [a, ...i],
    position: t,
    responseId: r
  };
}
function Gb(e, t, r) {
  return {
    ...e,
    position: t,
    responseId: r
  };
}
se(eg(), (e) => {
  e.addCase(gi, (t, r) => ({
    ...t,
    ...r.payload
  })).addCase(yt, (t, r) => {
    t.query = r.payload.q ?? "";
  }).addCase(pd, (t, r) => {
    t.query = r.payload.expression;
  });
});
const Jb = () => ({}), Zb = () => ({
  headline: "",
  error: null,
  isLoading: !1,
  responseId: "",
  products: [],
  productId: void 0
});
se(Jb(), (e) => {
  e.addCase(Hb, (t, r) => {
    const n = r.payload.slotId, i = r.payload.productId;
    if (!(n in t)) {
      if (!i) {
        t[n] = Ec();
        return;
      }
      t[n] = Ec({ productId: i });
    }
  }).addCase(_n.rejected, (t, r) => {
    as(t, r.meta.arg.slotId, r.payload);
  }).addCase(ns.rejected, (t, r) => {
    as(t, r.meta.arg.slotId, r.payload);
  }).addCase(_n.fulfilled, (t, r) => {
    const n = r.meta.arg.slotId, i = r.payload.response;
    Dc(t, n, i);
    const s = t[n];
    if (!s)
      return;
    const a = Mc(r.payload);
    s.products = i.products.map((o, c) => _c(o, a + c + 1, i.responseId));
  }).addCase(ns.fulfilled, (t, r) => {
    if (!r.payload)
      return;
    const n = r.meta.arg.slotId, i = r.payload.response;
    Dc(t, n, i);
    const s = t[n];
    if (!s)
      return;
    const a = Mc(r.payload);
    s.products = s.products.concat(i.products.map((o, c) => _c(o, a + c + 1, i.responseId)));
  }).addCase(_n.pending, (t, r) => {
    Tc(t, r.meta.arg.slotId);
  }).addCase(ns.pending, (t, r) => {
    Tc(t, r.meta.arg.slotId);
  }).addCase(Wb, (t, r) => {
    const n = t[r.payload.slotId];
    if (!n)
      return;
    const { products: i } = n;
    let s;
    const a = i.findIndex((p) => (s = p.children.find((g) => g.permanentid === r.payload.child.permanentid), !!s));
    if (a === -1 || s === void 0)
      return;
    const o = i[a].responseId, c = i[a].position, { children: u, totalNumberOfChildren: l } = i[a], f = {
      ...s,
      resultType: Te.PRODUCT,
      children: u,
      totalNumberOfChildren: l,
      position: c,
      responseId: o
    };
    i.splice(a, 1, f);
  }).addCase(Gr, (t, r) => {
    Object.keys(t).forEach((n) => {
      as(t, n, r.payload);
    });
  });
});
function Ec(e) {
  return {
    ...Zb(),
    ...e
  };
}
function as(e, t, r) {
  const n = e[t];
  n && (n.error = r ?? null, n.isLoading = !1);
}
function Dc(e, t, r) {
  const n = e[t];
  n && (n.error = null, n.headline = r.headline, n.responseId = r.responseId, n.isLoading = !1);
}
function Tc(e, t) {
  const r = e[t];
  r && (r.isLoading = !0);
}
function Mc(e) {
  const t = e.response.pagination;
  return t.page * t.perPage;
}
function _c(e, t, r) {
  const n = e.children.some((o) => o.permanentid === e.permanentid);
  if (e.children.length === 0 || n)
    return { ...e, position: t, responseId: r };
  const { children: i, totalNumberOfChildren: s, ...a } = e;
  return {
    ...e,
    children: [a, ...i],
    position: t,
    responseId: r
  };
}
const os = () => ({
  error: null,
  isLoading: !1,
  requestId: "",
  responseId: "",
  products: [],
  results: [],
  facets: [],
  queryExecuted: ""
});
se(os(), (e) => {
  e.addCase(Re.rejected, (t, r) => {
    Pc(t, r.payload);
  }).addCase(ji.rejected, (t, r) => {
    Pc(t, r.payload);
  }).addCase(Re.fulfilled, (t, r) => {
    const n = $c(r.payload);
    Vc(t, r.payload.response, r.payload.queryExecuted), t.products = r.payload.response.products.map((i, s) => Ns(i, n + s + 1, r.payload.response.responseId)), t.results = Lc(r.payload.response.results, n, r.payload.response.responseId);
  }).addCase(ji.fulfilled, (t, r) => {
    if (!r.payload)
      return;
    const n = $c(r.payload);
    Vc(t, r.payload.response, r.payload.queryExecuted), t.products = t.products.concat(r.payload.response.products.map((i, s) => {
      var a;
      return Ns(i, n + s + 1, (a = r.payload) == null ? void 0 : a.response.responseId);
    })), t.results = t.results.concat(Lc(r.payload.response.results, n, r.payload.response.responseId));
  }).addCase(Re.pending, (t, r) => {
    Uc(t, r.meta.requestId);
  }).addCase(ji.pending, (t, r) => {
    Uc(t, r.meta.requestId);
  }).addCase(xm, (t, r) => {
    const n = t.results.length > 0 ? t.results : t.products;
    let i;
    const s = n.findIndex((p) => p.resultType === Te.SPOTLIGHT ? !1 : (i = p.children.find((g) => g.permanentid === r.payload.child.permanentid), !!i)), a = n[s];
    if (s === -1 || i === void 0 || a.resultType === Te.SPOTLIGHT)
      return;
    const o = a.responseId, c = a.position, { children: u, totalNumberOfChildren: l } = a, f = {
      ...i,
      resultType: Te.PRODUCT,
      children: u,
      totalNumberOfChildren: l,
      position: c,
      responseId: o
    };
    n.splice(s, 1, f);
  }).addCase(it, () => os()).addCase(Pt, () => os()).addCase(Gr, (t, r) => {
    t.error = r.payload, t.isLoading = !1;
  });
});
function Pc(e, t) {
  e.error = t || null, e.isLoading = !1;
}
function Uc(e, t) {
  e.isLoading = !0, e.requestId = t;
}
function Vc(e, t, r) {
  e.error = null, e.facets = t.facets, e.responseId = t.responseId, e.isLoading = !1, e.queryExecuted = r ?? "";
}
function $c(e) {
  const t = e.response.pagination;
  return t.page * t.perPage;
}
function Ns(e, t, r) {
  const n = e.children.some((o) => o.permanentid === e.permanentid);
  if (e.children.length === 0 || n)
    return { ...e, position: t, responseId: r };
  const { children: i, totalNumberOfChildren: s, ...a } = e;
  return {
    ...e,
    children: [a, ...i],
    position: t,
    responseId: r
  };
}
function Lc(e, t, r) {
  return e.map((n, i) => Xb(n, t + i + 1, r));
}
function Xb(e, t, r) {
  return e.resultType === Te.SPOTLIGHT ? eC(e, t, r) : Ns(e, t, r);
}
function eC(e, t, r) {
  return {
    ...e,
    position: t,
    responseId: r
  };
}
se(xn(), (e) => {
  e.addCase(za, (t, r) => {
    t.appliedSort = r.payload;
  }).addCase(Me.fulfilled, Qc).addCase(Re.fulfilled, Qc).addCase(Pt, xn).addCase(it, xn).addCase(yt, Nc).addCase(sr, Nc);
});
function Qc(e, t) {
  const r = t.payload.response;
  e.appliedSort = jc(r.sort.appliedSort), e.availableSorts = r.sort.availableSorts.map(jc);
}
const jc = (e) => e.sortCriteria === Le.Relevance ? Fs() : {
  by: Le.Fields,
  fields: (e.fields || []).map(({ field: t, direction: r, displayName: n }) => ({
    name: t,
    direction: r,
    displayName: n
  }))
};
function Nc(e, t) {
  if (t.payload.sortCriteria) {
    e.appliedSort = t.payload.sortCriteria;
    return;
  }
  e.appliedSort = xn().appliedSort;
}
function zc(e) {
  return e.query = "", e.queryModification = {
    originalQuery: "",
    newQuery: "",
    queryToIgnore: e.queryModification.queryToIgnore
  }, e;
}
function Bc(e, t) {
  const r = [], n = [], i = [], s = [];
  return t.forEach((a) => {
    switch (a.type) {
      case "redirect":
        r.push(a.content);
        break;
      case "query":
        n.push(a.content);
        break;
      case "execute":
        i.push({
          functionName: a.content.name,
          params: a.content.params
        });
        break;
      case "notify":
        s.push(a.content);
        break;
    }
  }), e.redirectTo = r[0] ?? "", e.query = e.queryModification.newQuery, e.executions = i, e.notifications = s, e;
}
function tC(e, t) {
  return e.queryModification = { ...t, queryToIgnore: "" }, e;
}
function rC(e, t) {
  return e.queryModification.queryToIgnore = t, e;
}
const nC = () => ({
  redirectTo: "",
  query: "",
  executions: [],
  notifications: [],
  queryModification: { originalQuery: "", newQuery: "", queryToIgnore: "" }
});
se(nC(), (e) => e.addCase(Re.pending, zc).addCase(Re.fulfilled, (t, r) => Bc(t, r.payload.response.triggers)).addCase(Me.pending, zc).addCase(Me.fulfilled, (t, r) => Bc(t, r.payload.response.triggers)).addCase(Rl, (t, r) => tC(t, r.payload)).addCase(kl, (t, r) => rC(t, r.payload.q)));
se(aa, (e) => e);
var iC = class extends Error {
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
    te(this, "issues");
    this.name = "SchemaError", this.issues = t;
  }
}, tt = "uninitialized", zs = "pending", yr = "fulfilled", vr = "rejected";
function Hc(e) {
  return {
    status: e,
    isUninitialized: e === tt,
    isLoading: e === zs,
    isSuccess: e === yr,
    isError: e === vr
  };
}
var Yc = Wt;
function mf(e, t) {
  if (e === t || !(Yc(e) && Yc(t) || Array.isArray(e) && Array.isArray(t)))
    return t;
  const r = Object.keys(t), n = Object.keys(e);
  let i = r.length === n.length;
  const s = Array.isArray(t) ? [] : {};
  for (const a of r)
    s[a] = mf(e[a], t[a]), i && (i = e[a] === s[a]);
  return i ? e : s;
}
function Bs(e, t, r) {
  return e.reduce((n, i, s) => (t(i, s) && n.push(r(i, s)), n), []).flat();
}
function sC(e) {
  return new RegExp("(^|:)//").test(e);
}
function aC() {
  return typeof document > "u" ? !0 : document.visibilityState !== "hidden";
}
function Ba(e) {
  return e != null;
}
function Wc(e) {
  return [...(e == null ? void 0 : e.values()) ?? []].filter(Ba);
}
function oC() {
  return typeof navigator > "u" || navigator.onLine === void 0 ? !0 : navigator.onLine;
}
var cC = (e) => e.replace(/\/$/, ""), uC = (e) => e.replace(/^\//, "");
function lC(e, t) {
  if (!e)
    return t;
  if (!t)
    return e;
  if (sC(t))
    return t;
  const r = e.endsWith("/") || !t.startsWith("?") ? "/" : "";
  return e = cC(e), t = uC(t), `${e}${r}${t}`;
}
function ni(e, t, r) {
  return e.has(t) ? e.get(t) : e.set(t, r(t)).get(t);
}
var Hs = () => /* @__PURE__ */ new Map(), dC = (e) => {
  const t = new AbortController();
  return setTimeout(() => {
    const r = "signal timed out", n = "TimeoutError";
    t.abort(
      // some environments (React Native, Node) don't have DOMException
      typeof DOMException < "u" ? new DOMException(r, n) : Object.assign(new Error(r), {
        name: n
      })
    );
  }, e), t.signal;
}, fC = (...e) => {
  for (const r of e) if (r.aborted) return AbortSignal.abort(r.reason);
  const t = new AbortController();
  for (const r of e)
    r.addEventListener("abort", () => t.abort(r.reason), {
      signal: t.signal,
      once: !0
    });
  return t.signal;
}, Kc = (...e) => fetch(...e), hC = (e) => e.status >= 200 && e.status <= 299, pC = (e) => (
  /*applicat*/
  /ion\/(vnd\.api\+)?json/.test(e.get("content-type") || "")
);
function Gc(e) {
  if (!Wt(e))
    return e;
  const t = {
    ...e
  };
  for (const [r, n] of Object.entries(t))
    n === void 0 && delete t[r];
  return t;
}
var gC = (e) => typeof e == "object" && (Wt(e) || Array.isArray(e) || typeof e.toJSON == "function");
function mC({
  baseUrl: e,
  prepareHeaders: t = (f) => f,
  fetchFn: r = Kc,
  paramsSerializer: n,
  isJsonContentType: i = pC,
  jsonContentType: s = "application/json",
  jsonReplacer: a,
  timeout: o,
  responseHandler: c,
  validateStatus: u,
  ...l
} = {}) {
  return typeof fetch > "u" && r === Kc && console.warn("Warning: `fetch` is not available. Please supply a custom `fetchFn` property to use `fetchBaseQuery` on SSR environments."), async (p, g, h) => {
    const {
      getState: d,
      extra: m,
      endpoint: C,
      forced: R,
      type: b
    } = g;
    let S, {
      url: v,
      headers: F = new Headers(l.headers),
      params: M = void 0,
      responseHandler: V = c ?? "json",
      validateStatus: A = u ?? hC,
      timeout: x = o,
      ...I
    } = typeof p == "string" ? {
      url: p
    } : p, D = {
      ...l,
      signal: x ? fC(g.signal, dC(x)) : g.signal,
      ...I
    };
    F = new Headers(Gc(F)), D.headers = await t(F, {
      getState: d,
      arg: p,
      extra: m,
      endpoint: C,
      forced: R,
      type: b,
      extraOptions: h
    }) || F;
    const $ = gC(D.body);
    if (D.body != null && !$ && typeof D.body != "string" && D.headers.delete("content-type"), !D.headers.has("content-type") && $ && D.headers.set("content-type", s), $ && i(D.headers) && (D.body = JSON.stringify(D.body, a)), D.headers.has("accept") || (V === "json" ? D.headers.set("accept", "application/json") : V === "text" && D.headers.set("accept", "text/plain, text/html, */*")), M) {
      const L = ~v.indexOf("?") ? "&" : "?", N = n ? n(M) : new URLSearchParams(Gc(M));
      v += L + N;
    }
    v = lC(e, v);
    const E = new Request(v, D);
    S = {
      request: new Request(v, D)
    };
    let y;
    try {
      y = await r(E);
    } catch (L) {
      return {
        error: {
          status: (L instanceof Error || typeof DOMException < "u" && L instanceof DOMException) && L.name === "TimeoutError" ? "TIMEOUT_ERROR" : "FETCH_ERROR",
          error: String(L)
        },
        meta: S
      };
    }
    const O = y.clone();
    S.response = O;
    let k, T = "";
    try {
      let L;
      if (await Promise.all([
        f(y, V).then((N) => k = N, (N) => L = N),
        // see https://github.com/node-fetch/node-fetch/issues/665#issuecomment-538995182
        // we *have* to "use up" both streams at the same time or they will stop running in node-fetch scenarios
        O.text().then((N) => T = N, () => {
        })
      ]), L) throw L;
    } catch (L) {
      return {
        error: {
          status: "PARSING_ERROR",
          originalStatus: y.status,
          data: T,
          error: String(L)
        },
        meta: S
      };
    }
    return A(y, k) ? {
      data: k,
      meta: S
    } : {
      error: {
        status: y.status,
        data: k
      },
      meta: S
    };
  };
  async function f(p, g) {
    if (typeof g == "function")
      return g(p);
    if (g === "content-type" && (g = i(p.headers) ? "json" : "text"), g === "json") {
      const h = await p.text();
      return h.length ? JSON.parse(h) : null;
    }
    return p.text();
  }
}
var Yt = class {
  constructor(e, t = void 0) {
    te(this, "value");
    te(this, "meta");
    this.value = e, this.meta = t;
  }
};
async function yC(e = 0, t = 5, r) {
  const n = Math.min(e, t), i = ~~((Math.random() + 0.4) * (300 << n));
  await new Promise((s, a) => {
    const o = setTimeout(() => s(), i);
    if (r) {
      const c = () => {
        clearTimeout(o), a(new Error("Aborted"));
      };
      r.aborted ? (clearTimeout(o), a(new Error("Aborted"))) : r.addEventListener("abort", c, {
        once: !0
      });
    }
  });
}
function yf(e, t) {
  throw Object.assign(new Yt({
    error: e,
    meta: t
  }), {
    throwImmediately: !0
  });
}
function cs(e) {
  e.aborted && yf({
    status: "CUSTOM_ERROR",
    error: "Aborted"
  });
}
var Jc = {}, vC = (e, t) => async (r, n, i) => {
  const s = [5, (t || Jc).maxRetries, (i || Jc).maxRetries].filter((l) => l !== void 0), [a] = s.slice(-1), c = {
    maxRetries: a,
    backoff: yC,
    retryCondition: (l, f, {
      attempt: p
    }) => p <= a,
    ...t,
    ...i
  };
  let u = 0;
  for (; ; ) {
    cs(n.signal);
    try {
      const l = await e(r, n, i);
      if (l.error)
        throw new Yt(l);
      return l;
    } catch (l) {
      if (u++, l.throwImmediately) {
        if (l instanceof Yt)
          return l.value;
        throw l;
      }
      if (l instanceof Yt) {
        if (!c.retryCondition(l.value.error, r, {
          attempt: u,
          baseQueryApi: n,
          extraOptions: i
        }))
          return l.value;
      } else if (u > c.maxRetries)
        return {
          error: l
        };
      cs(n.signal);
      try {
        await c.backoff(u, c.maxRetries, n.signal);
      } catch (f) {
        throw cs(n.signal), f;
      }
    }
  }
}, SC = /* @__PURE__ */ Object.assign(vC, {
  fail: yf
}), Oi = "__rtkq/", wC = "online", bC = "offline", vf = "focused", Ha = /* @__PURE__ */ w(`${Oi}${vf}`), Sf = /* @__PURE__ */ w(`${Oi}un${vf}`), Ya = /* @__PURE__ */ w(`${Oi}${wC}`), wf = /* @__PURE__ */ w(`${Oi}${bC}`), Jr = "query", bf = "mutation", Cf = "infinitequery";
function Fi(e) {
  return e.type === Jr;
}
function CC(e) {
  return e.type === bf;
}
function Ei(e) {
  return e.type === Cf;
}
function ii(e) {
  return Fi(e) || Ei(e);
}
function Wa(e, t, r, n, i, s) {
  const a = IC(e) ? e(t, r, n, i) : e;
  return a ? Bs(a, Ba, (o) => s(If(o))) : [];
}
function IC(e) {
  return typeof e == "function";
}
function If(e) {
  return typeof e == "string" ? {
    type: e
  } : e;
}
function AC(e, t) {
  return e.catch(t);
}
var tr = (e, t) => e.endpointDefinitions[t], Dr = /* @__PURE__ */ Symbol("forceQueryFn"), Ys = (e) => typeof e[Dr] == "function";
function xC({
  serializeQueryArgs: e,
  queryThunk: t,
  infiniteQueryThunk: r,
  mutationThunk: n,
  api: i,
  context: s,
  getInternalState: a
}) {
  const o = (S) => {
    var v;
    return (v = a(S)) == null ? void 0 : v.runningQueries;
  }, c = (S) => {
    var v;
    return (v = a(S)) == null ? void 0 : v.runningMutations;
  }, {
    unsubscribeQueryResult: u,
    removeMutationResult: l,
    updateSubscriptionOptions: f
  } = i.internalActions;
  return {
    buildInitiateQuery: C,
    buildInitiateInfiniteQuery: R,
    buildInitiateMutation: b,
    getRunningQueryThunk: p,
    getRunningMutationThunk: g,
    getRunningQueriesThunk: h,
    getRunningMutationsThunk: d
  };
  function p(S, v) {
    return (F) => {
      var A;
      const M = tr(s, S), V = e({
        queryArgs: v,
        endpointDefinition: M,
        endpointName: S
      });
      return (A = o(F)) == null ? void 0 : A.get(V);
    };
  }
  function g(S, v) {
    return (F) => {
      var M;
      return (M = c(F)) == null ? void 0 : M.get(v);
    };
  }
  function h() {
    return (S) => Wc(o(S));
  }
  function d() {
    return (S) => Wc(c(S));
  }
  function m(S, v) {
    const F = (M, {
      subscribe: V = !0,
      forceRefetch: A,
      subscriptionOptions: x,
      [Dr]: I,
      ...D
    } = {}) => ($, E) => {
      var H;
      const U = e({
        queryArgs: M,
        endpointDefinition: v,
        endpointName: S
      });
      let y;
      const O = {
        ...D,
        type: Jr,
        subscribe: V,
        forceRefetch: A,
        subscriptionOptions: x,
        endpointName: S,
        originalArgs: M,
        queryCacheKey: U,
        [Dr]: I
      };
      if (Fi(v))
        y = t(O);
      else {
        const {
          direction: J,
          initialPageParam: le,
          refetchCachedPages: ce
        } = D;
        y = r({
          ...O,
          // Supply these even if undefined. This helps with a field existence
          // check over in `buildSlice.ts`
          direction: J,
          initialPageParam: le,
          refetchCachedPages: ce
        });
      }
      const k = i.endpoints[S].select(M), T = $(y), L = k(E()), {
        requestId: N,
        abort: G
      } = T, Y = L.requestId !== N, re = (H = o($)) == null ? void 0 : H.get(U), B = () => k(E()), Z = Object.assign(I ? (
        // a query has been forced (upsertQueryData)
        // -> we want to resolve it once data has been written with the data that will be written
        T.then(B)
      ) : Y && !re ? (
        // a query has been skipped due to a condition and we do not have any currently running query
        // -> we want to resolve it immediately with the current data
        Promise.resolve(L)
      ) : (
        // query just started or one is already in flight
        // -> wait for the running query, then resolve with data from after that
        Promise.all([re, T]).then(B)
      ), {
        arg: M,
        requestId: N,
        subscriptionOptions: x,
        queryCacheKey: U,
        abort: G,
        async unwrap() {
          const J = await Z;
          if (J.isError)
            throw J.error;
          return J.data;
        },
        refetch: (J) => $(F(M, {
          subscribe: !1,
          forceRefetch: !0,
          ...J
        })),
        unsubscribe() {
          V && $(u({
            queryCacheKey: U,
            requestId: N
          }));
        },
        updateSubscriptionOptions(J) {
          Z.subscriptionOptions = J, $(f({
            endpointName: S,
            requestId: N,
            queryCacheKey: U,
            options: J
          }));
        }
      });
      if (!re && !Y && !I) {
        const J = o($);
        J.set(U, Z), Z.then(() => {
          J.delete(U);
        });
      }
      return Z;
    };
    return F;
  }
  function C(S, v) {
    return m(S, v);
  }
  function R(S, v) {
    return m(S, v);
  }
  function b(S) {
    return (v, {
      track: F = !0,
      fixedCacheKey: M
    } = {}) => (V, A) => {
      const x = n({
        type: "mutation",
        endpointName: S,
        originalArgs: v,
        track: F,
        fixedCacheKey: M
      }), I = V(x), {
        requestId: D,
        abort: $,
        unwrap: E
      } = I, U = AC(I.unwrap().then((T) => ({
        data: T
      })), (T) => ({
        error: T
      })), y = () => {
        V(l({
          requestId: D,
          fixedCacheKey: M
        }));
      }, O = Object.assign(U, {
        arg: I.arg,
        requestId: D,
        abort: $,
        unwrap: E,
        reset: y
      }), k = c(V);
      return k.set(D, O), O.then(() => {
        k.delete(D);
      }), M && (k.set(M, O), O.then(() => {
        k.get(M) === O && k.delete(M);
      })), O;
    };
  }
}
var Af = class extends iC {
  constructor(t, r, n, i) {
    super(t);
    te(this, "value");
    te(this, "schemaName");
    te(this, "_bqMeta");
    this.value = r, this.schemaName = n, this._bqMeta = i;
  }
}, Ct = (e, t) => Array.isArray(e) ? e.includes(t) : !!e;
async function It(e, t, r, n) {
  const i = await e["~standard"].validate(t);
  if (i.issues)
    throw new Af(i.issues, t, r, n);
  return i.value;
}
function Zc(e) {
  return e;
}
var pr = (e = {}) => ({
  ...e,
  [ta]: !0
});
function kC({
  reducerPath: e,
  baseQuery: t,
  context: {
    endpointDefinitions: r
  },
  serializeQueryArgs: n,
  api: i,
  assertTagType: s,
  selectors: a,
  onSchemaFailure: o,
  catchSchemaFailure: c,
  skipSchemaValidation: u
}) {
  const l = (I, D, $, E) => (U, y) => {
    const O = r[I], k = n({
      queryArgs: D,
      endpointDefinition: O,
      endpointName: I
    });
    if (U(i.internalActions.queryResultPatched({
      queryCacheKey: k,
      patches: $
    })), !E)
      return;
    const T = i.endpoints[I].select(D)(
      // Work around TS 4.1 mismatch
      y()
    ), L = Wa(O.providesTags, T.data, void 0, D, {}, s);
    U(i.internalActions.updateProvidedBy([{
      queryCacheKey: k,
      providedTags: L
    }]));
  };
  function f(I, D, $ = 0) {
    const E = [D, ...I];
    return $ && E.length > $ ? E.slice(0, -1) : E;
  }
  function p(I, D, $ = 0) {
    const E = [...I, D];
    return $ && E.length > $ ? E.slice(1) : E;
  }
  const g = (I, D, $, E = !0) => (U, y) => {
    const k = i.endpoints[I].select(D)(
      // Work around TS 4.1 mismatch
      y()
    ), T = {
      patches: [],
      inversePatches: [],
      undo: () => U(i.util.patchQueryData(I, D, T.inversePatches, E))
    };
    if (k.status === tt)
      return T;
    let L;
    if ("data" in k)
      if (qe(k.data)) {
        const [N, G, Y] = Hu(k.data, $);
        T.patches.push(...G), T.inversePatches.push(...Y), L = N;
      } else
        L = $(k.data), T.patches.push({
          op: "replace",
          path: [],
          value: L
        }), T.inversePatches.push({
          op: "replace",
          path: [],
          value: k.data
        });
    return T.patches.length === 0 || U(i.util.patchQueryData(I, D, T.patches, E)), T;
  }, h = (I, D, $) => (E) => E(i.endpoints[I].initiate(D, {
    subscribe: !1,
    forceRefetch: !0,
    [Dr]: () => ({
      data: $
    })
  })), d = (I, D) => I.query && I[D] ? I[D] : Zc, m = async (I, {
    signal: D,
    abort: $,
    rejectWithValue: E,
    fulfillWithValue: U,
    dispatch: y,
    getState: O,
    extra: k
  }) => {
    var Y, re;
    const T = r[I.endpointName], {
      metaSchema: L,
      skipSchemaValidation: N = u
    } = T, G = I.type === Jr;
    try {
      let B = Zc;
      const Z = {
        signal: D,
        abort: $,
        dispatch: y,
        getState: O,
        extra: k,
        endpoint: I.endpointName,
        type: I.type,
        forced: G ? C(I, O()) : void 0,
        queryCacheKey: G ? I.queryCacheKey : void 0
      }, H = G ? I[Dr] : void 0;
      let J;
      const le = async (K, ee, de, he) => {
        if (ee == null && K.pages.length)
          return Promise.resolve({
            data: K
          });
        const Ie = {
          queryArg: I.originalArgs,
          pageParam: ee
        }, ge = await ce(Ie), Oe = he ? f : p;
        return {
          data: {
            pages: Oe(K.pages, ge.data, de),
            pageParams: Oe(K.pageParams, ee, de)
          },
          meta: ge.meta
        };
      };
      async function ce(K) {
        let ee;
        const {
          extraOptions: de,
          argSchema: he,
          rawResponseSchema: Ie,
          responseSchema: ge
        } = T;
        if (he && !Ct(N, "arg") && (K = await It(
          he,
          K,
          "argSchema",
          {}
          // we don't have a meta yet, so we can't pass it
        )), H ? ee = H() : T.query ? (B = d(T, "transformResponse"), ee = await t(T.query(K), Z, de)) : ee = await T.queryFn(K, Z, de, (ke) => t(ke, Z, de)), typeof process < "u", ee.error) throw new Yt(ee.error, ee.meta);
        let {
          data: Oe
        } = ee;
        Ie && !Ct(N, "rawResponse") && (Oe = await It(Ie, ee.data, "rawResponseSchema", ee.meta));
        let me = await B(Oe, ee.meta, K);
        return ge && !Ct(N, "response") && (me = await It(ge, me, "responseSchema", ee.meta)), {
          ...ee,
          data: me
        };
      }
      if (G && "infiniteQueryOptions" in T) {
        const {
          infiniteQueryOptions: K
        } = T, {
          maxPages: ee = 1 / 0
        } = K, de = I.refetchCachedPages ?? K.refetchCachedPages ?? !0;
        let he;
        const Ie = {
          pages: [],
          pageParams: []
        }, ge = (Y = a.selectQueryEntry(O(), I.queryCacheKey)) == null ? void 0 : Y.data, me = /* arg.forceRefetch */ C(I, O()) && !I.direction || !ge ? Ie : ge;
        if ("direction" in I && I.direction && me.pages.length) {
          const ke = I.direction === "backward", Mi = (ke ? xf : Ws)(K, me, I.originalArgs);
          he = await le(me, Mi, ee, ke);
        } else {
          const {
            initialPageParam: ke = K.initialPageParam
          } = I, Xr = (ge == null ? void 0 : ge.pageParams) ?? [], Mi = Xr[0] ?? ke, vh = Xr.length;
          if (he = await le(me, Mi, ee), H && (he = {
            data: he.data.pages[0]
          }), de)
            for (let Za = 1; Za < vh; Za++) {
              const Sh = Ws(K, he.data, I.originalArgs);
              he = await le(he.data, Sh, ee);
            }
        }
        J = he;
      } else
        J = await ce(I.originalArgs);
      return L && !Ct(N, "meta") && J.meta && (J.meta = await It(L, J.meta, "metaSchema", J.meta)), U(J.data, pr({
        fulfilledTimeStamp: Date.now(),
        baseQueryMeta: J.meta
      }));
    } catch (B) {
      let Z = B;
      if (Z instanceof Yt) {
        let H = d(T, "transformErrorResponse");
        const {
          rawErrorResponseSchema: J,
          errorResponseSchema: le
        } = T;
        let {
          value: ce,
          meta: K
        } = Z;
        try {
          J && !Ct(N, "rawErrorResponse") && (ce = await It(J, ce, "rawErrorResponseSchema", K)), L && !Ct(N, "meta") && (K = await It(L, K, "metaSchema", K));
          let ee = await H(ce, K, I.originalArgs);
          return le && !Ct(N, "errorResponse") && (ee = await It(le, ee, "errorResponseSchema", K)), E(ee, pr({
            baseQueryMeta: K
          }));
        } catch (ee) {
          Z = ee;
        }
      }
      try {
        if (Z instanceof Af) {
          const H = {
            endpoint: I.endpointName,
            arg: I.originalArgs,
            type: I.type,
            queryCacheKey: G ? I.queryCacheKey : void 0
          };
          (re = T.onSchemaFailure) == null || re.call(T, Z, H), o == null || o(Z, H);
          const {
            catchSchemaFailure: J = c
          } = T;
          if (J)
            return E(J(Z, H), pr({
              baseQueryMeta: Z._bqMeta
            }));
        }
      } catch (H) {
        Z = H;
      }
      throw console.error(Z), Z;
    }
  };
  function C(I, D) {
    const $ = a.selectQueryEntry(D, I.queryCacheKey), E = a.selectConfig(D).refetchOnMountOrArgChange, U = $ == null ? void 0 : $.fulfilledTimeStamp, y = I.forceRefetch ?? (I.subscribe && E);
    return y ? y === !0 || (Number(/* @__PURE__ */ new Date()) - Number(U)) / 1e3 >= y : !1;
  }
  const R = () => ne(`${e}/executeQuery`, m, {
    getPendingMeta({
      arg: D
    }) {
      const $ = r[D.endpointName];
      return pr({
        startedTimeStamp: Date.now(),
        ...Ei($) ? {
          direction: D.direction
        } : {}
      });
    },
    condition(D, {
      getState: $
    }) {
      var N;
      const E = $(), U = a.selectQueryEntry(E, D.queryCacheKey), y = U == null ? void 0 : U.fulfilledTimeStamp, O = D.originalArgs, k = U == null ? void 0 : U.originalArgs, T = r[D.endpointName], L = D.direction;
      return Ys(D) ? !0 : (U == null ? void 0 : U.status) === "pending" ? !1 : C(D, E) || Fi(T) && ((N = T == null ? void 0 : T.forceRefetch) != null && N.call(T, {
        currentArg: O,
        previousArg: k,
        endpointState: U,
        state: E
      })) ? !0 : !(y && !L);
    },
    dispatchConditionRejection: !0
  }), b = R(), S = R(), v = ne(`${e}/executeMutation`, m, {
    getPendingMeta() {
      return pr({
        startedTimeStamp: Date.now()
      });
    }
  }), F = (I) => "force" in I, M = (I) => "ifOlderThan" in I, V = (I, D, $ = {}) => (E, U) => {
    const y = F($) && $.force, O = M($) && $.ifOlderThan, k = (L = !0) => {
      const N = {
        forceRefetch: L,
        subscribe: !1
      };
      return i.endpoints[I].initiate(D, N);
    }, T = i.endpoints[I].select(D)(U());
    if (y)
      E(k());
    else if (O) {
      const L = T == null ? void 0 : T.fulfilledTimeStamp;
      if (!L) {
        E(k());
        return;
      }
      (Number(/* @__PURE__ */ new Date()) - Number(new Date(L))) / 1e3 >= O && E(k());
    } else
      E(k(!1));
  };
  function A(I) {
    return (D) => {
      var $, E;
      return ((E = ($ = D == null ? void 0 : D.meta) == null ? void 0 : $.arg) == null ? void 0 : E.endpointName) === I;
    };
  }
  function x(I, D) {
    return {
      matchPending: wr(ra(I), A(D)),
      matchFulfilled: wr(pt(I), A(D)),
      matchRejected: wr(Gt(I), A(D))
    };
  }
  return {
    queryThunk: b,
    mutationThunk: v,
    infiniteQueryThunk: S,
    prefetch: V,
    updateQueryData: g,
    upsertQueryData: h,
    patchQueryData: l,
    buildMatchThunkActions: x
  };
}
function Ws(e, {
  pages: t,
  pageParams: r
}, n) {
  const i = t.length - 1;
  return e.getNextPageParam(t[i], t, r[i], r, n);
}
function xf(e, {
  pages: t,
  pageParams: r
}, n) {
  var i;
  return (i = e.getPreviousPageParam) == null ? void 0 : i.call(e, t[0], t, r[0], r, n);
}
function kf(e, t, r, n) {
  return Wa(r[e.meta.arg.endpointName][t], pt(e) ? e.payload : void 0, ci(e) ? e.payload : void 0, e.meta.arg.originalArgs, "baseQueryMeta" in e.meta ? e.meta.baseQueryMeta : void 0, n);
}
function Xc(e) {
  return De(e) ? zu(e) : e;
}
function wn(e, t, r) {
  const n = e[t];
  n && r(n);
}
function Tr(e) {
  return ("arg" in e ? e.arg.fixedCacheKey : e.fixedCacheKey) ?? e.requestId;
}
function eu(e, t, r) {
  const n = e[Tr(t)];
  n && r(n);
}
var bn = {};
function RC({
  reducerPath: e,
  queryThunk: t,
  mutationThunk: r,
  serializeQueryArgs: n,
  context: {
    endpointDefinitions: i,
    apiUid: s,
    extractRehydrationInfo: a,
    hasRehydrationInfo: o
  },
  assertTagType: c,
  config: u
}) {
  const l = w(`${e}/resetApiState`);
  function f(A, x, I, D) {
    var $;
    A[$ = x.queryCacheKey] ?? (A[$] = {
      status: tt,
      endpointName: x.endpointName
    }), wn(A, x.queryCacheKey, (E) => {
      E.status = zs, E.requestId = I && E.requestId ? (
        // for `upsertQuery` **updates**, keep the current `requestId`
        E.requestId
      ) : (
        // for normal queries or `upsertQuery` **inserts** always update the `requestId`
        D.requestId
      ), x.originalArgs !== void 0 && (E.originalArgs = x.originalArgs), E.startedTimeStamp = D.startedTimeStamp;
      const U = i[D.arg.endpointName];
      Ei(U) && "direction" in x && (E.direction = x.direction);
    });
  }
  function p(A, x, I, D) {
    wn(A, x.arg.queryCacheKey, ($) => {
      if ($.requestId !== x.requestId && !D) return;
      const {
        merge: E
      } = i[x.arg.endpointName];
      if ($.status = yr, E)
        if ($.data !== void 0) {
          const {
            fulfilledTimeStamp: U,
            arg: y,
            baseQueryMeta: O,
            requestId: k
          } = x;
          let T = $r($.data, (L) => E(L, I, {
            arg: y.originalArgs,
            baseQueryMeta: O,
            fulfilledTimeStamp: U,
            requestId: k
          }));
          $.data = T;
        } else
          $.data = I;
      else
        $.data = i[x.arg.endpointName].structuralSharing ?? !0 ? mf(De($.data) ? Th($.data) : $.data, I) : I;
      delete $.error, $.fulfilledTimeStamp = x.fulfilledTimeStamp;
    });
  }
  const g = Vt({
    name: `${e}/queries`,
    initialState: bn,
    reducers: {
      removeQueryResult: {
        reducer(A, {
          payload: {
            queryCacheKey: x
          }
        }) {
          delete A[x];
        },
        prepare: dr()
      },
      cacheEntriesUpserted: {
        reducer(A, x) {
          for (const I of x.payload) {
            const {
              queryDescription: D,
              value: $
            } = I;
            f(A, D, !0, {
              arg: D,
              requestId: x.meta.requestId,
              startedTimeStamp: x.meta.timestamp
            }), p(
              A,
              {
                arg: D,
                requestId: x.meta.requestId,
                fulfilledTimeStamp: x.meta.timestamp,
                baseQueryMeta: {}
              },
              $,
              // We know we're upserting here
              !0
            );
          }
        },
        prepare: (A) => ({
          payload: A.map((D) => {
            const {
              endpointName: $,
              arg: E,
              value: U
            } = D, y = i[$];
            return {
              queryDescription: {
                type: Jr,
                endpointName: $,
                originalArgs: D.arg,
                queryCacheKey: n({
                  queryArgs: E,
                  endpointDefinition: y,
                  endpointName: $
                })
              },
              value: U
            };
          }),
          meta: {
            [ta]: !0,
            requestId: na(),
            timestamp: Date.now()
          }
        })
      },
      queryResultPatched: {
        reducer(A, {
          payload: {
            queryCacheKey: x,
            patches: I
          }
        }) {
          wn(A, x, (D) => {
            D.data = oo(D.data, I.concat());
          });
        },
        prepare: dr()
      }
    },
    extraReducers(A) {
      A.addCase(t.pending, (x, {
        meta: I,
        meta: {
          arg: D
        }
      }) => {
        const $ = Ys(D);
        f(x, D, $, I);
      }).addCase(t.fulfilled, (x, {
        meta: I,
        payload: D
      }) => {
        const $ = Ys(I.arg);
        p(x, I, D, $);
      }).addCase(t.rejected, (x, {
        meta: {
          condition: I,
          arg: D,
          requestId: $
        },
        error: E,
        payload: U
      }) => {
        wn(x, D.queryCacheKey, (y) => {
          if (!I) {
            if (y.requestId !== $) return;
            y.status = vr, y.error = U ?? E;
          }
        });
      }).addMatcher(o, (x, I) => {
        const {
          queries: D
        } = a(I);
        for (const [$, E] of Object.entries(D))
          // do not rehydrate entries that were currently in flight.
          ((E == null ? void 0 : E.status) === yr || (E == null ? void 0 : E.status) === vr) && (x[$] = E);
      });
    }
  }), h = Vt({
    name: `${e}/mutations`,
    initialState: bn,
    reducers: {
      removeMutationResult: {
        reducer(A, {
          payload: x
        }) {
          const I = Tr(x);
          I in A && delete A[I];
        },
        prepare: dr()
      }
    },
    extraReducers(A) {
      A.addCase(r.pending, (x, {
        meta: I,
        meta: {
          requestId: D,
          arg: $,
          startedTimeStamp: E
        }
      }) => {
        $.track && (x[Tr(I)] = {
          requestId: D,
          status: zs,
          endpointName: $.endpointName,
          startedTimeStamp: E
        });
      }).addCase(r.fulfilled, (x, {
        payload: I,
        meta: D
      }) => {
        D.arg.track && eu(x, D, ($) => {
          $.requestId === D.requestId && ($.status = yr, $.data = I, $.fulfilledTimeStamp = D.fulfilledTimeStamp);
        });
      }).addCase(r.rejected, (x, {
        payload: I,
        error: D,
        meta: $
      }) => {
        $.arg.track && eu(x, $, (E) => {
          E.requestId === $.requestId && (E.status = vr, E.error = I ?? D);
        });
      }).addMatcher(o, (x, I) => {
        const {
          mutations: D
        } = a(I);
        for (const [$, E] of Object.entries(D))
          // do not rehydrate entries that were currently in flight.
          ((E == null ? void 0 : E.status) === yr || (E == null ? void 0 : E.status) === vr) && // only rehydrate endpoints that were persisted using a `fixedCacheKey`
          $ !== (E == null ? void 0 : E.requestId) && (x[$] = E);
      });
    }
  }), d = {
    tags: {},
    keys: {}
  }, m = Vt({
    name: `${e}/invalidation`,
    initialState: d,
    reducers: {
      updateProvidedBy: {
        reducer(A, x) {
          var I, D, $;
          for (const {
            queryCacheKey: E,
            providedTags: U
          } of x.payload) {
            C(A, E);
            for (const {
              type: y,
              id: O
            } of U) {
              const k = (D = (I = A.tags)[y] ?? (I[y] = {}))[$ = O || "__internal_without_id"] ?? (D[$] = []);
              k.includes(E) || k.push(E);
            }
            A.keys[E] = U;
          }
        },
        prepare: dr()
      }
    },
    extraReducers(A) {
      A.addCase(g.actions.removeQueryResult, (x, {
        payload: {
          queryCacheKey: I
        }
      }) => {
        C(x, I);
      }).addMatcher(o, (x, I) => {
        var $, E, U;
        const {
          provided: D
        } = a(I);
        for (const [y, O] of Object.entries(D.tags ?? {}))
          for (const [k, T] of Object.entries(O)) {
            const L = (E = ($ = x.tags)[y] ?? ($[y] = {}))[U = k || "__internal_without_id"] ?? (E[U] = []);
            for (const N of T)
              L.includes(N) || L.push(N), x.keys[N] = D.keys[N];
          }
      }).addMatcher(et(pt(t), ci(t)), (x, I) => {
        R(x, [I]);
      }).addMatcher(g.actions.cacheEntriesUpserted.match, (x, I) => {
        const D = I.payload.map(({
          queryDescription: $,
          value: E
        }) => ({
          type: "UNKNOWN",
          payload: E,
          meta: {
            requestStatus: "fulfilled",
            requestId: "UNKNOWN",
            arg: $
          }
        }));
        R(x, D);
      });
    }
  });
  function C(A, x) {
    var D;
    const I = Xc(A.keys[x] ?? []);
    for (const $ of I) {
      const E = $.type, U = $.id ?? "__internal_without_id", y = (D = A.tags[E]) == null ? void 0 : D[U];
      y && (A.tags[E][U] = Xc(y).filter((O) => O !== x));
    }
    delete A.keys[x];
  }
  function R(A, x) {
    const I = x.map((D) => {
      const $ = kf(D, "providesTags", i, c), {
        queryCacheKey: E
      } = D.meta.arg;
      return {
        queryCacheKey: E,
        providedTags: $
      };
    });
    m.caseReducers.updateProvidedBy(A, m.actions.updateProvidedBy(I));
  }
  const b = Vt({
    name: `${e}/subscriptions`,
    initialState: bn,
    reducers: {
      updateSubscriptionOptions(A, x) {
      },
      unsubscribeQueryResult(A, x) {
      },
      internal_getRTKQSubscriptions() {
      }
    }
  }), S = Vt({
    name: `${e}/internalSubscriptions`,
    initialState: bn,
    reducers: {
      subscriptionsUpdated: {
        reducer(A, x) {
          return oo(A, x.payload);
        },
        prepare: dr()
      }
    }
  }), v = Vt({
    name: `${e}/config`,
    initialState: {
      online: oC(),
      focused: aC(),
      middlewareRegistered: !1,
      ...u
    },
    reducers: {
      middlewareRegistered(A, {
        payload: x
      }) {
        A.middlewareRegistered = A.middlewareRegistered === "conflict" || s !== x ? "conflict" : !0;
      }
    },
    extraReducers: (A) => {
      A.addCase(Ya, (x) => {
        x.online = !0;
      }).addCase(wf, (x) => {
        x.online = !1;
      }).addCase(Ha, (x) => {
        x.focused = !0;
      }).addCase(Sf, (x) => {
        x.focused = !1;
      }).addMatcher(o, (x) => ({
        ...x
      }));
    }
  }), F = Eh({
    queries: g.reducer,
    mutations: h.reducer,
    provided: m.reducer,
    subscriptions: S.reducer,
    config: v.reducer
  }), M = (A, x) => F(l.match(x) ? void 0 : A, x), V = {
    ...v.actions,
    ...g.actions,
    ...b.actions,
    ...S.actions,
    ...h.actions,
    ...m.actions,
    resetApiState: l
  };
  return {
    reducer: M,
    actions: V
  };
}
var us = /* @__PURE__ */ Symbol.for("RTKQ/skipToken"), Rf = {
  status: tt
}, tu = /* @__PURE__ */ $r(Rf, () => {
}), ru = /* @__PURE__ */ $r(Rf, () => {
});
function qC({
  serializeQueryArgs: e,
  reducerPath: t,
  createSelector: r
}) {
  const n = (b) => tu, i = (b) => ru;
  return {
    buildQuerySelector: p,
    buildInfiniteQuerySelector: g,
    buildMutationSelector: h,
    selectInvalidatedBy: d,
    selectCachedArgsForQuery: m,
    selectApiState: a,
    selectQueries: o,
    selectMutations: u,
    selectQueryEntry: c,
    selectConfig: l
  };
  function s(b) {
    return {
      ...b,
      ...Hc(b.status)
    };
  }
  function a(b) {
    return b[t];
  }
  function o(b) {
    var S;
    return (S = a(b)) == null ? void 0 : S.queries;
  }
  function c(b, S) {
    var v;
    return (v = o(b)) == null ? void 0 : v[S];
  }
  function u(b) {
    var S;
    return (S = a(b)) == null ? void 0 : S.mutations;
  }
  function l(b) {
    var S;
    return (S = a(b)) == null ? void 0 : S.config;
  }
  function f(b, S, v) {
    return (F) => {
      if (F === us)
        return r(n, v);
      const M = e({
        queryArgs: F,
        endpointDefinition: S,
        endpointName: b
      });
      return r((A) => c(A, M) ?? tu, v);
    };
  }
  function p(b, S) {
    return f(b, S, s);
  }
  function g(b, S) {
    const {
      infiniteQueryOptions: v
    } = S;
    function F(M) {
      const V = {
        ...M,
        ...Hc(M.status)
      }, {
        isLoading: A,
        isError: x,
        direction: I
      } = V, D = I === "forward", $ = I === "backward";
      return {
        ...V,
        hasNextPage: C(v, V.data, V.originalArgs),
        hasPreviousPage: R(v, V.data, V.originalArgs),
        isFetchingNextPage: A && D,
        isFetchingPreviousPage: A && $,
        isFetchNextPageError: x && D,
        isFetchPreviousPageError: x && $
      };
    }
    return f(b, S, F);
  }
  function h() {
    return ((b) => {
      let S;
      return typeof b == "object" ? S = Tr(b) ?? us : S = b, r(S === us ? i : (M) => {
        var V, A;
        return ((A = (V = a(M)) == null ? void 0 : V.mutations) == null ? void 0 : A[S]) ?? ru;
      }, s);
    });
  }
  function d(b, S) {
    const v = b[t], F = /* @__PURE__ */ new Set(), M = Bs(S, Ba, If);
    for (const V of M) {
      const A = v.provided.tags[V.type];
      if (!A)
        continue;
      let x = (V.id !== void 0 ? (
        // id given: invalidate all queries that provide this type & id
        A[V.id]
      ) : (
        // no id: invalidate all queries that provide this type
        Object.values(A).flat()
      )) ?? [];
      for (const I of x)
        F.add(I);
    }
    return Array.from(F.values()).flatMap((V) => {
      const A = v.queries[V];
      return A ? {
        queryCacheKey: V,
        endpointName: A.endpointName,
        originalArgs: A.originalArgs
      } : [];
    });
  }
  function m(b, S) {
    return Bs(Object.values(o(b)), (v) => (v == null ? void 0 : v.endpointName) === S && v.status !== tt, (v) => v.originalArgs);
  }
  function C(b, S, v) {
    return S ? Ws(b, S, v) != null : !1;
  }
  function R(b, S, v) {
    return !S || !b.getPreviousPageParam ? !1 : xf(b, S, v) != null;
  }
}
var jt = WeakMap ? /* @__PURE__ */ new WeakMap() : void 0, nu = ({
  endpointName: e,
  queryArgs: t
}) => {
  let r = "";
  const n = jt == null ? void 0 : jt.get(t);
  if (typeof n == "string")
    r = n;
  else {
    const i = JSON.stringify(t, (s, a) => (a = typeof a == "bigint" ? {
      $bigint: a.toString()
    } : a, a = Wt(a) ? Object.keys(a).sort().reduce((o, c) => (o[c] = a[c], o), {}) : a, a));
    Wt(t) && (jt == null || jt.set(t, i)), r = i;
  }
  return `${e}(${r})`;
};
function OC(...e) {
  return function(r) {
    const n = Bn((u) => {
      var l;
      return (l = r.extractRehydrationInfo) == null ? void 0 : l.call(r, u, {
        reducerPath: r.reducerPath ?? "api"
      });
    }), i = {
      reducerPath: "api",
      keepUnusedDataFor: 60,
      refetchOnMountOrArgChange: !1,
      refetchOnFocus: !1,
      refetchOnReconnect: !1,
      invalidationBehavior: "delayed",
      ...r,
      extractRehydrationInfo: n,
      serializeQueryArgs(u) {
        let l = nu;
        if ("serializeQueryArgs" in u.endpointDefinition) {
          const f = u.endpointDefinition.serializeQueryArgs;
          l = (p) => {
            const g = f(p);
            return typeof g == "string" ? g : nu({
              ...p,
              queryArgs: g
            });
          };
        } else r.serializeQueryArgs && (l = r.serializeQueryArgs);
        return l(u);
      },
      tagTypes: [...r.tagTypes || []]
    }, s = {
      endpointDefinitions: {},
      batch(u) {
        u();
      },
      apiUid: na(),
      extractRehydrationInfo: n,
      hasRehydrationInfo: Bn((u) => n(u) != null)
    }, a = {
      injectEndpoints: c,
      enhanceEndpoints({
        addTagTypes: u,
        endpoints: l
      }) {
        if (u)
          for (const f of u)
            i.tagTypes.includes(f) || i.tagTypes.push(f);
        if (l)
          for (const [f, p] of Object.entries(l))
            typeof p == "function" ? p(tr(s, f)) : Object.assign(tr(s, f) || {}, p);
        return a;
      }
    }, o = e.map((u) => u.init(a, i, s));
    function c(u) {
      const l = u.endpoints({
        query: (f) => ({
          ...f,
          type: Jr
        }),
        mutation: (f) => ({
          ...f,
          type: bf
        }),
        infiniteQuery: (f) => ({
          ...f,
          type: Cf
        })
      });
      for (const [f, p] of Object.entries(l)) {
        if (u.overrideExisting !== !0 && f in s.endpointDefinitions) {
          if (u.overrideExisting === "throw")
            throw new Error(Xe(39));
          continue;
        }
        s.endpointDefinitions[f] = p;
        for (const g of o)
          g.injectEndpoint(f, p);
      }
      return a;
    }
    return a.injectEndpoints({
      endpoints: r.endpoints
    });
  };
}
function He(e, ...t) {
  return Object.assign(e, ...t);
}
var FC = ({
  api: e,
  queryThunk: t,
  internalState: r,
  mwApi: n
}) => {
  const i = `${e.reducerPath}/subscriptions`;
  let s = null, a = null;
  const {
    updateSubscriptionOptions: o,
    unsubscribeQueryResult: c
  } = e.internalActions, u = (d, m) => {
    if (o.match(m)) {
      const {
        queryCacheKey: R,
        requestId: b,
        options: S
      } = m.payload, v = d.get(R);
      return v != null && v.has(b) && v.set(b, S), !0;
    }
    if (c.match(m)) {
      const {
        queryCacheKey: R,
        requestId: b
      } = m.payload, S = d.get(R);
      return S && S.delete(b), !0;
    }
    if (e.internalActions.removeQueryResult.match(m))
      return d.delete(m.payload.queryCacheKey), !0;
    if (t.pending.match(m)) {
      const {
        meta: {
          arg: R,
          requestId: b
        }
      } = m, S = ni(d, R.queryCacheKey, Hs);
      return R.subscribe && S.set(b, R.subscriptionOptions ?? S.get(b) ?? {}), !0;
    }
    let C = !1;
    if (t.rejected.match(m)) {
      const {
        meta: {
          condition: R,
          arg: b,
          requestId: S
        }
      } = m;
      if (R && b.subscribe) {
        const v = ni(d, b.queryCacheKey, Hs);
        v.set(S, b.subscriptionOptions ?? v.get(S) ?? {}), C = !0;
      }
    }
    return C;
  }, l = () => r.currentSubscriptions, g = {
    getSubscriptions: l,
    getSubscriptionCount: (d) => {
      const C = l().get(d);
      return (C == null ? void 0 : C.size) ?? 0;
    },
    isRequestSubscribed: (d, m) => {
      var R;
      const C = l();
      return !!((R = C == null ? void 0 : C.get(d)) != null && R.get(m));
    }
  };
  function h(d) {
    return JSON.parse(JSON.stringify(Object.fromEntries([...d].map(([m, C]) => [m, Object.fromEntries(C)]))));
  }
  return (d, m) => {
    if (s || (s = h(r.currentSubscriptions)), e.util.resetApiState.match(d))
      return s = {}, r.currentSubscriptions.clear(), a = null, [!0, !1];
    if (e.internalActions.internal_getRTKQSubscriptions.match(d))
      return [!1, g];
    const C = u(r.currentSubscriptions, d);
    let R = !0;
    if (C) {
      a || (a = setTimeout(() => {
        const v = h(r.currentSubscriptions), [, F] = Hu(s, () => v);
        m.next(e.internalActions.subscriptionsUpdated(F)), s = v, a = null;
      }, 500));
      const b = typeof d.type == "string" && !!d.type.startsWith(i), S = t.rejected.match(d) && d.meta.condition && !!d.meta.arg.subscribe;
      R = !b && !S;
    }
    return [R, !1];
  };
}, EC = 2147483647 / 1e3 - 1, DC = ({
  reducerPath: e,
  api: t,
  queryThunk: r,
  context: n,
  internalState: i,
  selectors: {
    selectQueryEntry: s,
    selectConfig: a
  },
  getRunningQueryThunk: o,
  mwApi: c
}) => {
  const {
    removeQueryResult: u,
    unsubscribeQueryResult: l,
    cacheEntriesUpserted: f
  } = t.internalActions, p = et(l.match, r.fulfilled, r.rejected, f.match);
  function g(b) {
    const S = i.currentSubscriptions.get(b);
    return S ? S.size > 0 : !1;
  }
  const h = {};
  function d(b) {
    var S;
    for (const v of b.values())
      (S = v == null ? void 0 : v.abort) == null || S.call(v);
  }
  const m = (b, S) => {
    const v = S.getState(), F = a(v);
    if (p(b)) {
      let M;
      if (f.match(b))
        M = b.payload.map((V) => V.queryDescription.queryCacheKey);
      else {
        const {
          queryCacheKey: V
        } = l.match(b) ? b.payload : b.meta.arg;
        M = [V];
      }
      C(M, S, F);
    }
    if (t.util.resetApiState.match(b)) {
      for (const [M, V] of Object.entries(h))
        V && clearTimeout(V), delete h[M];
      d(i.runningQueries), d(i.runningMutations);
    }
    if (n.hasRehydrationInfo(b)) {
      const {
        queries: M
      } = n.extractRehydrationInfo(b);
      C(Object.keys(M), S, F);
    }
  };
  function C(b, S, v) {
    const F = S.getState();
    for (const M of b) {
      const V = s(F, M);
      V != null && V.endpointName && R(M, V.endpointName, S, v);
    }
  }
  function R(b, S, v, F) {
    const M = tr(n, S), V = (M == null ? void 0 : M.keepUnusedDataFor) ?? F.keepUnusedDataFor;
    if (V === 1 / 0)
      return;
    const A = Math.max(0, Math.min(V, EC));
    if (!g(b)) {
      const x = h[b];
      x && clearTimeout(x), h[b] = setTimeout(() => {
        if (!g(b)) {
          const I = s(v.getState(), b);
          if (I != null && I.endpointName) {
            const D = v.dispatch(o(I.endpointName, I.originalArgs));
            D == null || D.abort();
          }
          v.dispatch(u({
            queryCacheKey: b
          }));
        }
        delete h[b];
      }, A * 1e3);
    }
  }
  return m;
}, iu = new Error("Promise never resolved before cacheEntryRemoved."), TC = ({
  api: e,
  reducerPath: t,
  context: r,
  queryThunk: n,
  mutationThunk: i,
  internalState: s,
  selectors: {
    selectQueryEntry: a,
    selectApiState: o
  }
}) => {
  const c = qs(n), u = qs(i), l = pt(n, i), f = {}, {
    removeQueryResult: p,
    removeMutationResult: g,
    cacheEntriesUpserted: h
  } = e.internalActions;
  function d(v, F, M) {
    const V = f[v];
    V != null && V.valueResolved && (V.valueResolved({
      data: F,
      meta: M
    }), delete V.valueResolved);
  }
  function m(v) {
    const F = f[v];
    F && (delete f[v], F.cacheEntryRemoved());
  }
  function C(v) {
    const {
      arg: F,
      requestId: M
    } = v.meta, {
      endpointName: V,
      originalArgs: A
    } = F;
    return [V, A, M];
  }
  const R = (v, F, M) => {
    const V = b(v);
    function A(x, I, D, $) {
      const E = a(M, I), U = a(F.getState(), I);
      !E && U && S(x, $, I, F, D);
    }
    if (n.pending.match(v)) {
      const [x, I, D] = C(v);
      A(x, V, D, I);
    } else if (h.match(v))
      for (const {
        queryDescription: x,
        value: I
      } of v.payload) {
        const {
          endpointName: D,
          originalArgs: $,
          queryCacheKey: E
        } = x;
        A(D, E, v.meta.requestId, $), d(E, I, {});
      }
    else if (i.pending.match(v)) {
      if (F.getState()[t].mutations[V]) {
        const [I, D, $] = C(v);
        S(I, D, V, F, $);
      }
    } else if (l(v))
      d(V, v.payload, v.meta.baseQueryMeta);
    else if (p.match(v) || g.match(v))
      m(V);
    else if (e.util.resetApiState.match(v))
      for (const x of Object.keys(f))
        m(x);
  };
  function b(v) {
    return c(v) ? v.meta.arg.queryCacheKey : u(v) ? v.meta.arg.fixedCacheKey ?? v.meta.requestId : p.match(v) ? v.payload.queryCacheKey : g.match(v) ? Tr(v.payload) : "";
  }
  function S(v, F, M, V, A) {
    const x = tr(r, v), I = x == null ? void 0 : x.onCacheEntryAdded;
    if (!I) return;
    const D = {}, $ = new Promise((T) => {
      D.cacheEntryRemoved = T;
    }), E = Promise.race([new Promise((T) => {
      D.valueResolved = T;
    }), $.then(() => {
      throw iu;
    })]);
    E.catch(() => {
    }), f[M] = D;
    const U = e.endpoints[v].select(ii(x) ? F : M), y = V.dispatch((T, L, N) => N), O = {
      ...V,
      getCacheEntry: () => U(V.getState()),
      requestId: A,
      extra: y,
      updateCachedData: ii(x) ? (T) => V.dispatch(e.util.updateQueryData(v, F, T)) : void 0,
      cacheDataLoaded: E,
      cacheEntryRemoved: $
    }, k = I(F, O);
    Promise.resolve(k).catch((T) => {
      if (T !== iu)
        throw T;
    });
  }
  return R;
}, MC = ({
  api: e,
  context: {
    apiUid: t
  },
  reducerPath: r
}) => (n, i) => {
  e.util.resetApiState.match(n) && i.dispatch(e.internalActions.middlewareRegistered(t));
}, _C = ({
  reducerPath: e,
  context: t,
  context: {
    endpointDefinitions: r
  },
  mutationThunk: n,
  queryThunk: i,
  api: s,
  assertTagType: a,
  refetchQuery: o,
  internalState: c
}) => {
  const {
    removeQueryResult: u
  } = s.internalActions, l = et(pt(n), ci(n)), f = et(pt(i, n), Gt(i, n));
  let p = [], g = 0;
  const h = (C, R) => {
    (i.pending.match(C) || n.pending.match(C)) && g++, f(C) && (g = Math.max(0, g - 1)), l(C) ? m(kf(C, "invalidatesTags", r, a), R) : f(C) ? m([], R) : s.util.invalidateTags.match(C) && m(Wa(C.payload, void 0, void 0, void 0, void 0, a), R);
  };
  function d() {
    return g > 0;
  }
  function m(C, R) {
    const b = R.getState(), S = b[e];
    if (p.push(...C), S.config.invalidationBehavior === "delayed" && d())
      return;
    const v = p;
    if (p = [], v.length === 0) return;
    const F = s.util.selectInvalidatedBy(b, v);
    t.batch(() => {
      const M = Array.from(F.values());
      for (const {
        queryCacheKey: V
      } of M) {
        const A = S.queries[V], x = ni(c.currentSubscriptions, V, Hs);
        A && (x.size === 0 ? R.dispatch(u({
          queryCacheKey: V
        })) : A.status !== tt && R.dispatch(o(A)));
      }
    });
  }
  return h;
}, PC = ({
  reducerPath: e,
  queryThunk: t,
  api: r,
  refetchQuery: n,
  internalState: i
}) => {
  const {
    currentPolls: s,
    currentSubscriptions: a
  } = i, o = /* @__PURE__ */ new Set();
  let c = null;
  const u = (m, C) => {
    (r.internalActions.updateSubscriptionOptions.match(m) || r.internalActions.unsubscribeQueryResult.match(m)) && l(m.payload.queryCacheKey, C), (t.pending.match(m) || t.rejected.match(m) && m.meta.condition) && l(m.meta.arg.queryCacheKey, C), (t.fulfilled.match(m) || t.rejected.match(m) && !m.meta.condition) && f(m.meta.arg, C), r.util.resetApiState.match(m) && (h(), c && (clearTimeout(c), c = null), o.clear());
  };
  function l(m, C) {
    o.add(m), c || (c = setTimeout(() => {
      for (const R of o)
        p({
          queryCacheKey: R
        }, C);
      o.clear(), c = null;
    }, 0));
  }
  function f({
    queryCacheKey: m
  }, C) {
    const R = C.getState()[e], b = R.queries[m], S = a.get(m);
    if (!b || b.status === tt) return;
    const {
      lowestPollingInterval: v,
      skipPollingIfUnfocused: F
    } = d(S);
    if (!Number.isFinite(v)) return;
    const M = s.get(m);
    M != null && M.timeout && (clearTimeout(M.timeout), M.timeout = void 0);
    const V = Date.now() + v;
    s.set(m, {
      nextPollTimestamp: V,
      pollingInterval: v,
      timeout: setTimeout(() => {
        (R.config.focused || !F) && C.dispatch(n(b)), f({
          queryCacheKey: m
        }, C);
      }, v)
    });
  }
  function p({
    queryCacheKey: m
  }, C) {
    const b = C.getState()[e].queries[m], S = a.get(m);
    if (!b || b.status === tt)
      return;
    const {
      lowestPollingInterval: v
    } = d(S);
    if (!Number.isFinite(v)) {
      g(m);
      return;
    }
    const F = s.get(m), M = Date.now() + v;
    (!F || M < F.nextPollTimestamp) && f({
      queryCacheKey: m
    }, C);
  }
  function g(m) {
    const C = s.get(m);
    C != null && C.timeout && clearTimeout(C.timeout), s.delete(m);
  }
  function h() {
    for (const m of s.keys())
      g(m);
  }
  function d(m = /* @__PURE__ */ new Map()) {
    let C = !1, R = Number.POSITIVE_INFINITY;
    for (const b of m.values())
      b.pollingInterval && (R = Math.min(b.pollingInterval, R), C = b.skipPollingIfUnfocused || C);
    return {
      lowestPollingInterval: R,
      skipPollingIfUnfocused: C
    };
  }
  return u;
}, UC = ({
  api: e,
  context: t,
  queryThunk: r,
  mutationThunk: n
}) => {
  const i = ra(r, n), s = Gt(r, n), a = pt(r, n), o = {};
  return (u, l) => {
    var f, p;
    if (i(u)) {
      const {
        requestId: g,
        arg: {
          endpointName: h,
          originalArgs: d
        }
      } = u.meta, m = tr(t, h), C = m == null ? void 0 : m.onQueryStarted;
      if (C) {
        const R = {}, b = new Promise((M, V) => {
          R.resolve = M, R.reject = V;
        });
        b.catch(() => {
        }), o[g] = R;
        const S = e.endpoints[h].select(ii(m) ? d : g), v = l.dispatch((M, V, A) => A), F = {
          ...l,
          getCacheEntry: () => S(l.getState()),
          requestId: g,
          extra: v,
          updateCachedData: ii(m) ? (M) => l.dispatch(e.util.updateQueryData(h, d, M)) : void 0,
          queryFulfilled: b
        };
        C(d, F);
      }
    } else if (a(u)) {
      const {
        requestId: g,
        baseQueryMeta: h
      } = u.meta;
      (f = o[g]) == null || f.resolve({
        data: u.payload,
        meta: h
      }), delete o[g];
    } else if (s(u)) {
      const {
        requestId: g,
        rejectedWithValue: h,
        baseQueryMeta: d
      } = u.meta;
      (p = o[g]) == null || p.reject({
        error: u.payload ?? u.error,
        isUnhandledError: !h,
        meta: d
      }), delete o[g];
    }
  };
}, VC = ({
  reducerPath: e,
  context: t,
  api: r,
  refetchQuery: n,
  internalState: i
}) => {
  const {
    removeQueryResult: s
  } = r.internalActions, a = (c, u) => {
    Ha.match(c) && o(u, "refetchOnFocus"), Ya.match(c) && o(u, "refetchOnReconnect");
  };
  function o(c, u) {
    const l = c.getState()[e], f = l.queries, p = i.currentSubscriptions;
    t.batch(() => {
      for (const g of p.keys()) {
        const h = f[g], d = p.get(g);
        if (!d || !h) continue;
        const m = [...d.values()];
        (m.some((R) => R[u] === !0) || m.every((R) => R[u] === void 0) && l.config[u]) && (d.size === 0 ? c.dispatch(s({
          queryCacheKey: g
        })) : h.status !== tt && c.dispatch(n(h)));
      }
    });
  }
  return a;
};
function $C(e) {
  const {
    reducerPath: t,
    queryThunk: r,
    api: n,
    context: i,
    getInternalState: s
  } = e, {
    apiUid: a
  } = i, o = {
    invalidateTags: w(`${t}/invalidateTags`)
  }, c = (p) => p.type.startsWith(`${t}/`), u = [MC, DC, _C, PC, TC, UC];
  return {
    middleware: (p) => {
      let g = !1;
      const h = s(p.dispatch), d = {
        ...e,
        internalState: h,
        refetchQuery: f,
        isThisApiSliceAction: c,
        mwApi: p
      }, m = u.map((b) => b(d)), C = FC(d), R = VC(d);
      return (b) => (S) => {
        if (!Uu(S))
          return b(S);
        g || (g = !0, p.dispatch(n.internalActions.middlewareRegistered(a)));
        const v = {
          ...p,
          next: b
        }, F = p.getState(), [M, V] = C(S, v, F);
        let A;
        if (M ? A = b(S) : A = V, p.getState()[t] && (R(S, v, F), c(S) || i.hasRehydrationInfo(S)))
          for (const x of m)
            x(S, v, F);
        return A;
      };
    },
    actions: o
  };
  function f(p) {
    return e.api.endpoints[p.endpointName].initiate(p.originalArgs, {
      subscribe: !1,
      forceRefetch: !0
    });
  }
}
var su = /* @__PURE__ */ Symbol(), LC = ({
  createSelector: e = fe
} = {}) => ({
  name: su,
  init(t, {
    baseQuery: r,
    tagTypes: n,
    reducerPath: i,
    serializeQueryArgs: s,
    keepUnusedDataFor: a,
    refetchOnMountOrArgChange: o,
    refetchOnFocus: c,
    refetchOnReconnect: u,
    invalidationBehavior: l,
    onSchemaFailure: f,
    catchSchemaFailure: p,
    skipSchemaValidation: g
  }, h) {
    Kh();
    const d = (H) => H;
    Object.assign(t, {
      reducerPath: i,
      endpoints: {},
      internalActions: {
        onOnline: Ya,
        onOffline: wf,
        onFocus: Ha,
        onFocusLost: Sf
      },
      util: {}
    });
    const m = qC({
      serializeQueryArgs: s,
      reducerPath: i,
      createSelector: e
    }), {
      selectInvalidatedBy: C,
      selectCachedArgsForQuery: R,
      buildQuerySelector: b,
      buildInfiniteQuerySelector: S,
      buildMutationSelector: v
    } = m;
    He(t.util, {
      selectInvalidatedBy: C,
      selectCachedArgsForQuery: R
    });
    const {
      queryThunk: F,
      infiniteQueryThunk: M,
      mutationThunk: V,
      patchQueryData: A,
      updateQueryData: x,
      upsertQueryData: I,
      prefetch: D,
      buildMatchThunkActions: $
    } = kC({
      baseQuery: r,
      reducerPath: i,
      context: h,
      api: t,
      serializeQueryArgs: s,
      assertTagType: d,
      selectors: m,
      onSchemaFailure: f,
      catchSchemaFailure: p,
      skipSchemaValidation: g
    }), {
      reducer: E,
      actions: U
    } = RC({
      context: h,
      queryThunk: F,
      mutationThunk: V,
      serializeQueryArgs: s,
      reducerPath: i,
      assertTagType: d,
      config: {
        refetchOnFocus: c,
        refetchOnReconnect: u,
        refetchOnMountOrArgChange: o,
        keepUnusedDataFor: a,
        reducerPath: i,
        invalidationBehavior: l
      }
    });
    He(t.util, {
      patchQueryData: A,
      updateQueryData: x,
      upsertQueryData: I,
      prefetch: D,
      resetApiState: U.resetApiState,
      upsertQueryEntries: U.cacheEntriesUpserted
    }), He(t.internalActions, U);
    const y = /* @__PURE__ */ new WeakMap(), O = (H) => ni(y, H, () => ({
      currentSubscriptions: /* @__PURE__ */ new Map(),
      currentPolls: /* @__PURE__ */ new Map(),
      runningQueries: /* @__PURE__ */ new Map(),
      runningMutations: /* @__PURE__ */ new Map()
    })), {
      buildInitiateQuery: k,
      buildInitiateInfiniteQuery: T,
      buildInitiateMutation: L,
      getRunningMutationThunk: N,
      getRunningMutationsThunk: G,
      getRunningQueriesThunk: Y,
      getRunningQueryThunk: re
    } = xC({
      queryThunk: F,
      mutationThunk: V,
      infiniteQueryThunk: M,
      api: t,
      serializeQueryArgs: s,
      context: h,
      getInternalState: O
    });
    He(t.util, {
      getRunningMutationThunk: N,
      getRunningMutationsThunk: G,
      getRunningQueryThunk: re,
      getRunningQueriesThunk: Y
    });
    const {
      middleware: B,
      actions: Z
    } = $C({
      reducerPath: i,
      context: h,
      queryThunk: F,
      mutationThunk: V,
      infiniteQueryThunk: M,
      api: t,
      assertTagType: d,
      selectors: m,
      getRunningQueryThunk: re,
      getInternalState: O
    });
    return He(t.util, Z), He(t, {
      reducer: E,
      middleware: B
    }), {
      name: su,
      injectEndpoint(H, J) {
        var K;
        const ce = (K = t.endpoints)[H] ?? (K[H] = {});
        Fi(J) && He(ce, {
          name: H,
          select: b(H, J),
          initiate: k(H, J)
        }, $(F, H)), CC(J) && He(ce, {
          name: H,
          select: v(),
          initiate: L(H)
        }, $(V, H)), Ei(J) && He(ce, {
          name: H,
          select: S(H, J),
          initiate: T(H, J)
        }, $(F, H));
      }
    };
  }
}), QC = /* @__PURE__ */ OC(LC());
const qf = (e) => e.query, jC = (e) => {
  var t;
  return (t = e.query) == null ? void 0 : t.enableQuerySyntax;
};
fe((e) => {
  var t;
  return (t = qf(e)) == null ? void 0 : t.q;
}, (e) => e.search.requestId, (e) => e.generatedAnswer.cannotAnswer, (e) => e.configuration.analytics.analyticsMode, (e) => {
  var t;
  return (t = e.search.searchAction) == null ? void 0 : t.actionCause;
}, (e, t, r, n, i) => ({
  q: e,
  requestId: t,
  cannotAnswer: r,
  analyticsMode: n,
  actionCause: i
}));
fe((e) => {
  var t;
  return (t = e.generatedAnswer) == null ? void 0 : t.answerApiQueryParams;
}, (e) => e);
const Of = (e, t, r) => vt({
  prefix: "analytics/generatedAnswer/streamEnd",
  __legacy__getBuilder: (n, i) => {
    const s = t ?? Xn(i);
    if (!s)
      return null;
    const a = Jv(i);
    return n.makeGeneratedAnswerStreamEnd({
      generativeQuestionAnsweringId: s,
      answerGenerated: e,
      answerTextIsEmpty: r,
      ...a && { conversationId: a }
    });
  },
  analyticsType: "Rga.AnswerReceived",
  analyticsPayloadBuilder: (n) => ({
    answerId: t ?? Xn(n) ?? "",
    answerGenerated: e ?? !1
  })
}), Ff = (e) => vt({
  prefix: "analytics/generatedAnswer/responseLinked",
  __legacy__getBuilder: () => null,
  analyticsType: "Rga.ResponseLinked",
  analyticsPayloadBuilder: (t) => {
    var n, i;
    return {
      answerId: Xn(t) ?? "",
      responseId: ((n = t.search) == null ? void 0 : n.searchResponseId) || ((i = t.search) == null ? void 0 : i.response.searchUid) || ""
    };
  }
}), NC = fe((e) => e.advancedSearchQueries, (e) => {
  if (!e)
    return {};
  const { aq: t, cq: r, dq: n, lq: i } = e;
  return {
    ...t && { aq: t },
    ...r && { cq: r },
    ...n && { dq: n },
    ...i && { lq: i }
  };
}), zC = (e) => e.context, BC = (e) => e.pipeline, HC = fe((e) => e.search, (e) => {
  var t;
  return ((t = e == null ? void 0 : e.searchAction) == null ? void 0 : t.actionCause) || "";
}), YC = (e) => e.searchHub, Ef = fe((e) => e, (e) => {
  if (!e)
    return "";
  for (const t in e)
    if (e[t].isActive)
      return e[t].id;
  return "";
});
fe((e) => e, (e) => {
  const t = Ef(e);
  return t && e ? e[t].expression : "";
});
const WC = (e) => {
  if (!(!e.dictionaryFieldContext || !Object.keys(e.dictionaryFieldContext.contextValues).length))
    return e.dictionaryFieldContext.contextValues;
}, KC = (e) => {
  var t;
  return (t = e.excerptLength) == null ? void 0 : t.length;
}, GC = (e) => {
  const { freezeFacetOrder: t } = e.facetOptions ?? {};
  return t !== void 0 ? { freezeFacetOrder: t } : void 0;
}, JC = (e) => {
  if (e.folding)
    return {
      filterField: e.folding.fields.collection,
      childField: e.folding.fields.parent,
      parentField: e.folding.fields.child,
      filterFieldRange: e.folding.filterFieldRange
    };
}, ZC = (e) => e.sortCriteria, XC = async (e) => {
  var t;
  return {
    accessToken: e.configuration.accessToken,
    organizationId: e.configuration.organizationId,
    url: sa(e.configuration.search.apiBaseUrl, e.configuration.organizationId, e.configuration.environment),
    streamId: (t = e.search.extendedResults) == null ? void 0 : t.generativeQuestionAnsweringId
  };
}, eI = (e, t) => {
  var M, V, A;
  const r = (M = qf(e)) == null ? void 0 : M.q, { aq: n, cq: i, dq: s, lq: a } = nI(e), o = zC(e), c = yi(e.configuration.analytics, t, { actionCause: HC(e) }), u = YC(e), l = BC(e), f = Gv(e) ?? [], p = tI(e), g = Ef(e.tabSet) || "default", h = zv(e), d = Bv(e), m = t.referrer || "", C = GC(e), R = ZC(e), b = rI(e), S = KC(e), v = JC(e), F = WC(e);
  return {
    q: r,
    ...n && { aq: n },
    ...i && { cq: i },
    ...s && { dq: s },
    ...a && { lq: a },
    ...e.query && { enableQuerySyntax: jC(e) },
    ...(o == null ? void 0 : o.contextValues) && {
      context: o.contextValues
    },
    pipelineRuleParameters: {
      mlGenerativeQuestionAnswering: {
        responseFormat: e.generatedAnswer.responseFormat,
        citationsFieldToInclude: f
      }
    },
    ...(u == null ? void 0 : u.length) && { searchHub: u },
    ...(l == null ? void 0 : l.length) && { pipeline: l },
    ...p.length && { facets: p },
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
      numberOfResults: cd(e),
      firstResult: e.pagination.firstResult
    },
    tab: g,
    locale: h,
    timezone: d,
    ...e.debug !== void 0 && { debug: e.debug },
    referrer: m,
    ...b,
    ...v ?? {},
    ...S && { excerptLength: S },
    ...F && {
      dictionaryFieldContext: F
    },
    sortCriteria: R,
    ...C && { facetOptions: C },
    ...c,
    ...((V = e.insightCaseContext) == null ? void 0 : V.caseContext) && {
      caseContext: (A = e.insightCaseContext) == null ? void 0 : A.caseContext
    }
  };
}, tI = (e) => {
  var t;
  return (t = Tl(e)) == null ? void 0 : t.map((r) => ad(r, sd())).sort((r, n) => r.facetId > n.facetId ? 1 : n.facetId > r.facetId ? -1 : 0);
}, rI = (e) => ({
  actionsHistory: e.configuration.analytics.enabled ? or.getInstance().getHistory() : []
}), nI = (e) => {
  const t = NC(e), r = ud(e);
  return {
    ...t,
    ...r && { cq: r }
  };
}, Df = [
  "searching",
  "thinking",
  "answering"
];
function Tf(e) {
  return e.toLowerCase();
}
const Mf = ["search", "generic"], iI = ["text/plain", "text/markdown"], Nt = new Q({ required: !0 }), _f = new Q(), lr = new ie({ required: !0 }), Pf = {
  id: Nt,
  title: Nt,
  uri: Nt,
  permanentid: Nt,
  clickUri: _f
}, Ka = new Q({
  required: !0,
  constrainTo: iI
}), Uf = new Q({
  required: !0,
  constrainTo: Df
}), Vf = (e) => ({
  ...e,
  name: Tf(e.name)
});
w("generatedAnswer/setIsVisible", (e) => q(e, lr));
const sI = w("generatedAnswer/setAnswerId", (e) => q(e, j));
w("generatedAnswer/setAnswerGenerationMode", (e) => q(e, new Q({
  constrainTo: ["automatic", "manual"],
  required: !1,
  default: "automatic"
})));
w("generatedAnswer/setIsEnabled", (e) => q(e, lr));
const $f = w("generatedAnswer/updateMessage", (e) => q(e, {
  textDelta: Nt
})), Lf = w("generatedAnswer/updateCitations", (e) => q(e, {
  citations: new oe({
    required: !0,
    each: new z({
      values: Pf
    })
  })
})), aI = w("generatedAnswer/updateError", (e) => q(e, {
  message: _f,
  code: new W({ min: 0 })
})), Qf = w("generatedAnswer/resetAnswer");
w("generatedAnswer/like");
w("generatedAnswer/dislike");
w("generatedAnswer/feedbackModal/open");
w("generatedAnswer/expand");
w("generatedAnswer/collapse");
w("generatedAnswer/setId", (e) => q(e, {
  id: new Q({
    required: !0
  })
}));
w("generatedAnswer/feedbackModal/close");
w("generatedAnswer/sendFeedback");
const ls = w("generatedAnswer/setIsLoading", (e) => q(e, lr)), au = w("generatedAnswer/setIsStreaming", (e) => q(e, lr)), jf = w("generatedAnswer/setAnswerContentFormat", (e) => q(e, Ka));
w("generatedAnswer/updateResponseFormat", (e) => q(e, {
  contentFormat: new oe({
    each: Ka,
    default: ["text/plain"]
  })
}));
w("knowledge/updateAnswerConfigurationId", (e) => q(e, Nt));
w("generatedAnswer/registerFieldsToIncludeInCitations", (e) => q(e, Eg));
const oI = w("generatedAnswer/setIsAnswerGenerated", (e) => q(e, lr)), Nf = w("generatedAnswer/setCannotAnswer", (e) => q(e, lr)), cI = w("generatedAnswer/setAnswerApiQueryParams", (e) => q(e, new z({})));
w("generatedAnswer/startStep", (e) => q(Vf(e), {
  name: Uf,
  startedAt: new W({ min: 0, required: !0 })
}));
w("generatedAnswer/finishStep", (e) => q(Vf(e), {
  name: Uf,
  finishedAt: new W({ min: 0, required: !0 })
}));
w("generatedAnswer/startToolCall", (e) => q(e, {
  toolCallName: j,
  startedAt: new W({ min: 0, required: !0 }),
  toolCallId: j
}));
w("generatedAnswer/finishToolCall", (e) => q(e, {
  finishedAt: new W({ min: 0, required: !0 }),
  toolCallId: j
}));
w("generatedAnswer/toolCallArgs", (e) => q(e, {
  toolCallId: j,
  args: new z({ options: { required: !0 } }),
  type: new Q({
    required: !0,
    constrainTo: Mf
  })
}));
ne("generatedAnswer/streamAnswer", async (e, t) => {
  var g;
  const r = t.getState(), { dispatch: n, extra: i, getState: s } = t, { search: a } = s(), { queryExecuted: o } = a, { setAbortControllerRef: c } = e, u = await XC(r), l = (h, d) => {
    switch (h) {
      case "genqa.headerMessageType": {
        const m = JSON.parse(d);
        n(jf(m.contentFormat));
        break;
      }
      case "genqa.messageType":
        n($f(JSON.parse(d)));
        break;
      case "genqa.citationsType":
        n(Lf(JSON.parse(d)));
        break;
      case "genqa.endOfStreamType": {
        const m = JSON.parse(d).answerGenerated, { answerId: C, answer: R } = s().generatedAnswer, S = o.length !== 0 && !m, v = !(R != null && R.trim());
        n(Nf(S)), n(au(!1)), n(oI(m)), n(Of(m, C, m ? v : void 0)), n(Ff());
        break;
      }
      default:
        r.debug && i.logger.warn(`Unknown payloadType: "${h}"`);
    }
  };
  n(ls(!0));
  const f = (h) => h.streamId === t.getState().search.extendedResults.generativeQuestionAnsweringId, p = (g = i.streamingClient) == null ? void 0 : g.streamGeneratedAnswer(u, {
    write: (h) => {
      f(u) && (n(ls(!1)), h.payload && h.payloadType && l(h.payloadType, h.payload));
    },
    abort: (h) => {
      f(u) && n(aI(h));
    },
    close: () => {
      f(u) && n(au(!1));
    },
    resetAnswer: () => {
      f(u) && n(Qf());
    }
  });
  p ? c(p) : n(ls(!1));
});
ne("generatedAnswer/generateAnswer", async (e, { getState: t, dispatch: r, extra: { navigatorContext: n, logger: i } }) => {
  r(Qf());
  const s = t();
  if (s.generatedAnswer.isEnabled === !1) {
    i.warn("[WARNING] The generateAnswer action was dispatched while the generated answer is disabled. No answer will be generated. Enable the generated answer before dispatching generateAnswer.");
    return;
  }
  if (s.generatedAnswer.answerConfigurationId) {
    const a = eI(s, n);
    r(cI(a)), await r(RI(a));
  } else
    i.warn("[WARNING] Missing answerConfigurationId in engine configuration. The generateAnswer action requires an answer configuration ID to use CRGA with the Answer API.");
});
async function uI(e, t) {
  const r = e.getReader();
  let n;
  for (; !(n = await r.read()).done; )
    t(n.value);
}
var xt;
(function(e) {
  e[e.NewLine = 10] = "NewLine", e[e.CarriageReturn = 13] = "CarriageReturn", e[e.Space = 32] = "Space", e[e.Colon = 58] = "Colon";
})(xt || (xt = {}));
function lI(e) {
  let t, r, n, i = !1;
  return function(a) {
    t === void 0 ? (t = a, r = 0, n = -1) : t = hI(t, a);
    const o = t.length;
    let c = 0;
    for (; r < o; ) {
      i && (t[r] === xt.NewLine && (c = ++r), i = !1);
      let u = -1;
      for (; r < o && u === -1; ++r)
        switch (t[r]) {
          case xt.Colon:
            n === -1 && (n = r - c);
            break;
          case xt.CarriageReturn:
            i = !0, u = r;
            break;
          case xt.NewLine:
            u = r;
            break;
        }
      if (u === -1)
        break;
      e(t.subarray(c, u), n), c = r, n = -1;
    }
    c === o ? t = void 0 : c !== 0 && (t = t.subarray(c), r -= c);
  };
}
function dI(e, t, r) {
  let n = ou();
  const i = new TextDecoder();
  return function(a, o) {
    if (a.length === 0)
      r == null || r(n), n = ou();
    else if (o > 0) {
      const c = i.decode(a.subarray(0, o)), u = o + (a[o + 1] === xt.Space ? 2 : 1), l = i.decode(a.subarray(u));
      switch (c) {
        case "data":
          n.data = n.data ? `${n.data}
${l}` : l;
          break;
        case "event":
          n.event = l;
          break;
        case "id":
          e(n.id = l);
          break;
        case "retry":
          fI(l, n, t);
          break;
      }
    }
  };
}
function fI(e, t, r) {
  const n = parseInt(e, 10);
  Number.isNaN(n) || r(t.retry = n);
}
function hI(e, t) {
  const r = new Uint8Array(e.length + t.length);
  return r.set(e), r.set(t, e.length), r;
}
function ou() {
  return {
    data: "",
    event: "",
    id: "",
    retry: void 0
  };
}
const Ks = "text/event-stream", pI = 1e3, cu = "last-event-id";
function uu() {
  return typeof window < "u";
}
function gI(e, { signal: t, headers: r, onopen: n, onmessage: i, onclose: s, onerror: a, openWhenHidden: o, fetch: c, ...u }) {
  return new Promise((l, f) => {
    const p = { ...r };
    p.accept || (p.accept = Ks);
    let g;
    function h() {
      g == null || g.abort(), document.hidden || S();
    }
    !o && uu() && document.addEventListener("visibilitychange", h);
    let d = pI, m;
    function C() {
      uu() && document.removeEventListener("visibilitychange", h), clearTimeout(m), g == null || g.abort();
    }
    t == null || t.addEventListener("abort", () => {
      C(), l();
    });
    const R = c ?? fetch, b = n ?? mI;
    async function S() {
      var v;
      g = AbortController ? new AbortController() : null;
      try {
        const F = await R(e, {
          ...u,
          headers: p,
          signal: g == null ? void 0 : g.signal
        });
        await b(F), await uI(F.body, lI(dI((M) => {
          M ? p[cu] = M : delete p[cu];
        }, (M) => {
          d = M;
        }, i))), s == null || s(), C(), l();
      } catch (F) {
        if (!((v = g == null ? void 0 : g.signal) != null && v.aborted))
          try {
            const M = (a == null ? void 0 : a(F)) ?? d;
            clearTimeout(m), m = setTimeout(S, M);
          } catch (M) {
            C(), f(M);
          }
      }
    }
    S();
  });
}
function mI(e) {
  const t = e.headers.get("content-type");
  if (!(t != null && t.startsWith(Ks)))
    throw new Error(`Expected content-type to be ${Ks}, Actual: ${t}`);
}
const yI = async (e, t, r) => {
  var u;
  const n = t.getState(), { accessToken: i, environment: s, organizationId: a } = n.configuration, o = n.generatedAnswer.answerConfigurationId, c = {
    ...e,
    headers: {
      ...(e == null ? void 0 : e.headers) || {},
      Authorization: `Bearer ${i}`
    }
  };
  try {
    const l = sa((u = n.configuration.search) == null ? void 0 : u.apiBaseUrl, a, s);
    return mC({
      baseUrl: `${l}/rest/organizations/${a}/answer/v1/configs/${o}`
    })(c, t, r);
  } catch (l) {
    return { error: l };
  }
}, vI = QC({
  reducerPath: "answer",
  baseQuery: SC(yI, { maxRetries: 3 }),
  endpoints: () => ({})
}), SI = (e, t) => {
  const { contentFormat: r } = t;
  e.contentFormat = r, e.isStreaming = !0, e.isLoading = !1;
}, wI = (e, t) => {
  const { textDelta: r } = t;
  if (typeof r != "string")
    return;
  const n = e.answer;
  !(n != null && n.trim()) && !r.trim() || (e.answer = n != null && n.trim() ? n.concat(r) : r);
}, bI = (e, t) => {
  e.citations = t.citations;
}, CI = (e, t) => {
  e.generated = t.answerGenerated, e.isStreaming = !1;
}, II = (e, t) => {
  const r = t.errorMessage || "Unknown error occurred";
  e.error = {
    message: r,
    code: t.code
  }, e.isStreaming = !1, e.isLoading = !1, console.error(`Generated answer error: ${r} (code: ${t.code})`);
}, AI = (e, t, r) => {
  var s;
  const n = JSON.parse(e.data);
  n.finishReason === "ERROR" && n.errorMessage && II(t, n);
  const i = n.payload.length ? JSON.parse(n.payload) : {};
  switch (n.payloadType) {
    case "genqa.headerMessageType":
      i.contentFormat && (SI(t, i), r(jf(i.contentFormat)));
      break;
    case "genqa.messageType":
      typeof i.textDelta == "string" && (wI(t, i), r($f({ textDelta: i.textDelta })));
      break;
    case "genqa.citationsType":
      i.citations && (bI(t, i), r(Lf({ citations: i.citations })));
      break;
    case "genqa.endOfStreamType": {
      CI(t, i);
      const a = t.answerId, o = i.answerGenerated ?? !1, c = o ? !((s = t.answer) != null && s.trim()) : void 0;
      r(Of(o, a, c)), r(Ff());
      break;
    }
  }
}, xI = (e, t, r, n) => {
  if (!e || !t || !r)
    throw new Error("Missing required parameters for answer endpoint");
  const i = `/rest/organizations/${t}`, s = n ? `insight/v1/configs/${n}/answer` : "answer/v1/configs";
  return `${e}${i}/${s}/${r}/generate`;
}, kI = vI.injectEndpoints({
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
      serializeQueryArgs: ({ endpointName: t, queryArgs: r }) => {
        const { analytics: n, ...i } = r;
        return `${t}(${JSON.stringify(i)})`;
      },
      async onCacheEntryAdded(t, { getState: r, cacheDataLoaded: n, updateCachedData: i, dispatch: s }) {
        await n;
        const { configuration: a, generatedAnswer: o, insightConfiguration: c } = r(), { organizationId: u, environment: l, accessToken: f } = a, p = sa(a.search.apiBaseUrl, u, l), g = xI(p, u, o.answerConfigurationId, c == null ? void 0 : c.insightId);
        await gI(g, {
          method: "POST",
          body: JSON.stringify(t),
          headers: {
            Authorization: `Bearer ${f}`,
            Accept: "application/json",
            "Content-Type": "application/json",
            "Accept-Encoding": "*"
          },
          fetch,
          onopen: async (h) => {
            const d = h.headers.get("x-answer-id");
            d && i((m) => {
              m.answerId = d, s(sI(d));
            });
          },
          onmessage: (h) => {
            i((d) => {
              AI(h, d, s);
            });
          },
          onerror: (h) => {
            throw h;
          },
          onclose: () => {
            i((h) => {
              s(Nf(!h.generated));
            });
          }
        });
      }
    })
  })
}), RI = (e) => kI.endpoints.getAnswer.initiate(e);
var Pn = { exports: {} }, qI = Pn.exports, lu;
function OI() {
  return lu || (lu = 1, (function(e, t) {
    (function(r, n) {
      e.exports = n();
    })(qI, (function() {
      var r = { year: 0, month: 1, day: 2, hour: 3, minute: 4, second: 5 }, n = {};
      return function(i, s, a) {
        var o, c = function(p, g, h) {
          h === void 0 && (h = {});
          var d = new Date(p), m = (function(C, R) {
            R === void 0 && (R = {});
            var b = R.timeZoneName || "short", S = C + "|" + b, v = n[S];
            return v || (v = new Intl.DateTimeFormat("en-US", { hour12: !1, timeZone: C, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", timeZoneName: b }), n[S] = v), v;
          })(g, h);
          return m.formatToParts(d);
        }, u = function(p, g) {
          for (var h = c(p, g), d = [], m = 0; m < h.length; m += 1) {
            var C = h[m], R = C.type, b = C.value, S = r[R];
            S >= 0 && (d[S] = parseInt(b, 10));
          }
          var v = d[3], F = v === 24 ? 0 : v, M = d[0] + "-" + d[1] + "-" + d[2] + " " + F + ":" + d[4] + ":" + d[5] + ":000", V = +p;
          return (a.utc(M).valueOf() - (V -= V % 1e3)) / 6e4;
        }, l = s.prototype;
        l.tz = function(p, g) {
          p === void 0 && (p = o);
          var h, d = this.utcOffset(), m = this.toDate(), C = m.toLocaleString("en-US", { timeZone: p }), R = Math.round((m - new Date(C)) / 1e3 / 60), b = 15 * -Math.round(m.getTimezoneOffset() / 15) - R;
          if (!Number(b)) h = this.utcOffset(0, g);
          else if (h = a(C, { locale: this.$L }).$set("millisecond", this.$ms).utcOffset(b, !0), g) {
            var S = h.utcOffset();
            h = h.add(d - S, "minute");
          }
          return h.$x.$timezone = p, h;
        }, l.offsetName = function(p) {
          var g = this.$x.$timezone || a.tz.guess(), h = c(this.valueOf(), g, { timeZoneName: p }).find((function(d) {
            return d.type.toLowerCase() === "timezonename";
          }));
          return h && h.value;
        };
        var f = l.startOf;
        l.startOf = function(p, g) {
          if (!this.$x || !this.$x.$timezone) return f.call(this, p, g);
          var h = a(this.format("YYYY-MM-DD HH:mm:ss:SSS"), { locale: this.$L });
          return f.call(h, p, g).tz(this.$x.$timezone, !0);
        }, a.tz = function(p, g, h) {
          var d = h && g, m = h || g || o, C = u(+a(), m);
          if (typeof p != "string") return a(p).tz(m);
          var R = (function(F, M, V) {
            var A = F - 60 * M * 1e3, x = u(A, V);
            if (M === x) return [A, M];
            var I = u(A -= 60 * (x - M) * 1e3, V);
            return x === I ? [A, x] : [F - 60 * Math.min(x, I) * 1e3, Math.max(x, I)];
          })(a.utc(p, d).valueOf(), C, m), b = R[0], S = R[1], v = a(b).utcOffset(S);
          return v.$x.$timezone = m, v;
        }, a.tz.guess = function() {
          return Intl.DateTimeFormat().resolvedOptions().timeZone;
        }, a.tz.setDefault = function(p) {
          o = p;
        };
      };
    }));
  })(Pn)), Pn.exports;
}
var FI = OI();
const EI = /* @__PURE__ */ Qr(FI);
var Un = { exports: {} }, DI = Un.exports, du;
function TI() {
  return du || (du = 1, (function(e, t) {
    (function(r, n) {
      e.exports = n();
    })(DI, (function() {
      var r = "minute", n = /[+-]\d\d(?::?\d\d)?/g, i = /([+-]|\d\d)/g;
      return function(s, a, o) {
        var c = a.prototype;
        o.utc = function(d) {
          var m = { date: d, utc: !0, args: arguments };
          return new a(m);
        }, c.utc = function(d) {
          var m = o(this.toDate(), { locale: this.$L, utc: !0 });
          return d ? m.add(this.utcOffset(), r) : m;
        }, c.local = function() {
          return o(this.toDate(), { locale: this.$L, utc: !1 });
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
        c.utcOffset = function(d, m) {
          var C = this.$utils().u;
          if (C(d)) return this.$u ? 0 : C(this.$offset) ? f.call(this) : this.$offset;
          if (typeof d == "string" && (d = (function(v) {
            v === void 0 && (v = "");
            var F = v.match(n);
            if (!F) return null;
            var M = ("" + F[0]).match(i) || ["-", 0, 0], V = M[0], A = 60 * +M[1] + +M[2];
            return A === 0 ? 0 : V === "+" ? A : -A;
          })(d), d === null)) return this;
          var R = Math.abs(d) <= 16 ? 60 * d : d;
          if (R === 0) return this.utc(m);
          var b = this.clone();
          if (m) return b.$offset = R, b.$u = !1, b;
          var S = this.$u ? this.toDate().getTimezoneOffset() : -1 * this.utcOffset();
          return (b = this.local().add(R + S, r)).$offset = R, b.$x.$localOffset = S, b;
        };
        var p = c.format;
        c.format = function(d) {
          var m = d || (this.$u ? "YYYY-MM-DDTHH:mm:ss[Z]" : "");
          return p.call(this, m);
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
        var g = c.toDate;
        c.toDate = function(d) {
          return d === "s" && this.$offset ? o(this.format("YYYY-MM-DD HH:mm:ss:SSS")).toDate() : g.call(this);
        };
        var h = c.diff;
        c.diff = function(d, m, C) {
          if (d && this.$u === d.$u) return h.call(this, d, m, C);
          var R = this.local(), b = o(d).local();
          return h.call(R, b, m, C);
        };
      };
    }));
  })(Un)), Un.exports;
}
var MI = TI();
const _I = /* @__PURE__ */ Qr(MI);
je.extend(_I);
je.extend(EI);
const PI = () => ({
  organizationId: "",
  accessToken: "",
  search: {
    locale: "en-US",
    timezone: je.tz.guess(),
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
}), UI = /(^|; )Coveo-Pendragon=([^;]*)/, VI = /(^|; )Coveo-SearchAgentDebug=([^;]*)/;
function $I() {
  var e;
  return typeof window > "u" ? !1 : ((e = UI.exec(document.cookie)) == null ? void 0 : e.pop()) || null;
}
function LI() {
  return typeof window > "u" ? !1 : VI.test(document.cookie);
}
se(PI(), (e) => e.addCase(hl, (t, r) => {
  QI(t, r.payload);
}).addCase(Pg, (t, r) => {
  jI(t, r.payload);
}).addCase(Ug, (t, r) => {
  NI(t, r.payload);
}).addCase(Vg, (t) => {
  t.analytics.enabled = !1;
}).addCase($g, (t) => {
  t.analytics.enabled = !0;
}).addCase(Lg, (t, r) => {
  t.analytics.originLevel2 = r.payload.originLevel2;
}).addCase(Qg, (t, r) => {
  t.analytics.originLevel3 = r.payload.originLevel3;
}).addCase(Wr, (t, r) => {
  t.analytics.originLevel2 = r.payload;
}).addCase(tb, (t, r) => {
  t.analytics.originLevel2 = r.payload;
}).addCase(St, (t, r) => {
  X(r.payload.tab) || (t.analytics.originLevel2 = r.payload.tab);
}).addCase(jg, (t, { payload: r }) => {
  zI(t, r);
}));
function QI(e, t) {
  X(t.accessToken) || (e.accessToken = t.accessToken), e.environment = t.environment ?? "prod", X(t.organizationId) || (e.organizationId = t.organizationId);
}
function jI(e, t) {
  X(t.proxyBaseUrl) || (e.search.apiBaseUrl = t.proxyBaseUrl), X(t.locale) || (e.search.locale = t.locale), X(t.timezone) || (e.search.timezone = t.timezone), X(t.authenticationProviders) || (e.search.authenticationProviders = t.authenticationProviders);
}
function NI(e, t) {
  X(t.enabled) || (e.analytics.enabled = t.enabled), X(t.originContext) || (e.analytics.originContext = t.originContext), X(t.originLevel2) || (e.analytics.originLevel2 = t.originLevel2), X(t.originLevel3) || (e.analytics.originLevel3 = t.originLevel3), X(t.proxyBaseUrl) || (e.analytics.apiBaseUrl = t.proxyBaseUrl), X(t.trackingId) || (e.analytics.trackingId = t.trackingId), X(t.analyticsMode) || (e.analytics.analyticsMode = t.analyticsMode), X(t.source) || (e.analytics.source = t.source);
  try {
    const r = $I();
    r && (e.analytics.analyticsMode = "next", e.analytics.trackingId = r);
  } catch {
  }
  X(t.runtimeEnvironment) || (e.analytics.runtimeEnvironment = t.runtimeEnvironment), X(t.anonymous) || (e.analytics.anonymous = t.anonymous), X(t.deviceId) || (e.analytics.deviceId = t.deviceId), X(t.userDisplayName) || (e.analytics.userDisplayName = t.userDisplayName), X(t.documentLocation) || (e.analytics.documentLocation = t.documentLocation);
}
function zI(e, t) {
  e.knowledge.agentId = t;
  try {
    LI() && (e.knowledge.debugAgentSession = !0);
  } catch {
  }
}
const BI = new Q({ required: !0 }), zf = new Q({
  required: !0,
  constrainTo: Df
}), Bf = (e) => ({
  ...e,
  name: Tf(e.name)
});
w("followUpAnswers/setIsEnabled", (e) => q(e, new ie({ required: !0 })));
w("followUpAnswers/setFollowUpAnswersConversationId", (e) => q(e, j));
w("followUpAnswers/setFollowUpAnswersConversationToken", (e) => q(e, j));
w("followUpAnswers/clearFollowUpAnswersConversationToken");
w("followUpAnswers/createFollowUpAnswer", (e) => q(e, {
  question: j
}));
w("followUpAnswers/setActiveFollowUpAnswerId", (e) => q(e, j));
w("followUpAnswers/setFollowUpAnswerContentFormat", (e) => q(e, {
  contentFormat: Ka,
  answerId: j
}));
w("followUpAnswers/setFollowUpIsLoading", (e) => q(e, {
  isLoading: new ie({ required: !0 }),
  answerId: j
}));
w("followUpAnswers/setFollowUpIsStreaming", (e) => q(e, {
  isStreaming: new ie({ required: !0 }),
  answerId: j
}));
w("followUpAnswers/followUpMessageChunkReceived", (e) => q(e, {
  textDelta: BI,
  answerId: j
}));
w("followUpAnswers/followUpCitationsReceived", (e) => q(e, {
  citations: new oe({
    required: !0,
    each: new z({
      values: Pf
    })
  }),
  answerId: j
}));
w("followUpAnswers/followUpCompleted", (e) => q(e, {
  answerId: j,
  cannotAnswer: new ie({ required: !1 })
}));
w("followUpAnswers/followUpFailed", (e) => q(e, {
  message: new Q(),
  code: new W({ min: 0 }),
  answerId: j
}));
w("followUpAnswers/activeFollowUpStartFailed", (e) => q(e, {
  message: new Q()
}));
w("followUpAnswers/likeFollowUp", (e) => q(e, {
  answerId: j
}));
w("followUpAnswers/dislikeFollowUp", (e) => q(e, {
  answerId: j
}));
w("followUpAnswers/submitFollowUpFeedback", (e) => q(e, {
  answerId: j
}));
w("followUpAnswers/resetFollowUpAnswers");
w("followUpAnswers/stepStarted", (e) => q(Bf(e), {
  answerId: j,
  name: zf,
  startedAt: new W({ min: 0, required: !0 })
}));
w("followUpAnswers/stepFinished", (e) => q(Bf(e), {
  answerId: j,
  name: zf,
  finishedAt: new W({ min: 0, required: !0 })
}));
w("followUpAnswers/startToolCall", (e) => q(e, {
  answerId: j,
  toolCallName: j,
  startedAt: new W({ min: 0, required: !0 }),
  toolCallId: j
}));
w("followUpAnswers/finishToolCall", (e) => q(e, {
  answerId: j,
  finishedAt: new W({ min: 0, required: !0 }),
  toolCallId: j
}));
w("followUpAnswers/toolCallArgs", (e) => q(e, {
  answerId: j,
  toolCallId: j,
  args: new z({ options: { required: !0 } }),
  type: new Q({
    required: !0,
    constrainTo: Mf
  })
}));
var ct;
(function(e) {
  e[e.SseMaxDurationExceeded = 1e3] = "SseMaxDurationExceeded", e[e.SseFollowUpNotSupported = 1001] = "SseFollowUpNotSupported", e[e.ConversationNotFound = 1002] = "ConversationNotFound", e[e.SseModelsNotAvailable = 1003] = "SseModelsNotAvailable", e[e.SseInternalError = 1004] = "SseInternalError", e[e.SseTurnLimitReached = 1005] = "SseTurnLimitReached";
})(ct || (ct = {}));
ct.SseMaxDurationExceeded, ct.SseFollowUpNotSupported, ct.ConversationNotFound, ct.SseModelsNotAvailable, ct.SseInternalError, ct.SseTurnLimitReached;
var gr = { exports: {} }, ds, fu;
function HI() {
  if (fu) return ds;
  fu = 1;
  function e(r) {
    try {
      return JSON.stringify(r);
    } catch {
      return '"[Circular]"';
    }
  }
  ds = t;
  function t(r, n, i) {
    var s = i && i.stringify || e, a = 1;
    if (typeof r == "object" && r !== null) {
      var o = n.length + a;
      if (o === 1) return r;
      var c = new Array(o);
      c[0] = s(r);
      for (var u = 1; u < o; u++)
        c[u] = s(n[u]);
      return c.join(" ");
    }
    if (typeof r != "string")
      return r;
    var l = n.length;
    if (l === 0) return r;
    for (var f = "", p = 1 - a, g = -1, h = r && r.length || 0, d = 0; d < h; ) {
      if (r.charCodeAt(d) === 37 && d + 1 < h) {
        switch (g = g > -1 ? g : 0, r.charCodeAt(d + 1)) {
          case 100:
          // 'd'
          case 102:
            if (p >= l || n[p] == null) break;
            g < d && (f += r.slice(g, d)), f += Number(n[p]), g = d + 2, d++;
            break;
          case 105:
            if (p >= l || n[p] == null) break;
            g < d && (f += r.slice(g, d)), f += Math.floor(Number(n[p])), g = d + 2, d++;
            break;
          case 79:
          // 'O'
          case 111:
          // 'o'
          case 106:
            if (p >= l || n[p] === void 0) break;
            g < d && (f += r.slice(g, d));
            var m = typeof n[p];
            if (m === "string") {
              f += "'" + n[p] + "'", g = d + 2, d++;
              break;
            }
            if (m === "function") {
              f += n[p].name || "<anonymous>", g = d + 2, d++;
              break;
            }
            f += s(n[p]), g = d + 2, d++;
            break;
          case 115:
            if (p >= l)
              break;
            g < d && (f += r.slice(g, d)), f += String(n[p]), g = d + 2, d++;
            break;
          case 37:
            g < d && (f += r.slice(g, d)), f += "%", g = d + 2, d++, p--;
            break;
        }
        ++p;
      }
      ++d;
    }
    return g === -1 ? r : (g < h && (f += r.slice(g)), f);
  }
  return ds;
}
var hu;
function YI() {
  if (hu) return gr.exports;
  hu = 1;
  const e = HI();
  gr.exports = l;
  const t = E().console || {}, r = {
    mapHttpRequest: M,
    mapHttpResponse: M,
    wrapRequestSerializer: V,
    wrapResponseSerializer: V,
    wrapErrorSerializer: V,
    req: M,
    res: M,
    err: v,
    errWithCause: v
  };
  function n(y, O) {
    return y === "silent" ? 1 / 0 : O.levels.values[y];
  }
  const i = Symbol("pino.logFuncs"), s = Symbol("pino.hierarchy"), a = {
    error: "log",
    fatal: "error",
    warn: "error",
    info: "log",
    debug: "log",
    trace: "log"
  };
  function o(y, O) {
    const k = {
      logger: O,
      parent: y[s]
    };
    O[s] = k;
  }
  function c(y, O, k) {
    const T = {};
    O.forEach((L) => {
      T[L] = k[L] ? k[L] : t[L] || t[a[L] || "log"] || A;
    }), y[i] = T;
  }
  function u(y, O) {
    return Array.isArray(y) ? y.filter(function(T) {
      return T !== "!stdSerializers.err";
    }) : y === !0 ? Object.keys(O) : !1;
  }
  function l(y) {
    y = y || {}, y.browser = y.browser || {};
    const O = y.browser.transmit;
    if (O && typeof O.send != "function")
      throw Error("pino: transmit option must have a send function");
    const k = y.browser.write || t;
    y.browser.write && (y.browser.asObject = !0);
    const T = y.serializers || {}, L = u(y.browser.serialize, T);
    let N = y.browser.serialize;
    Array.isArray(y.browser.serialize) && y.browser.serialize.indexOf("!stdSerializers.err") > -1 && (N = !1);
    const G = Object.keys(y.customLevels || {}), Y = ["error", "fatal", "warn", "info", "debug", "trace"].concat(G);
    typeof k == "function" && Y.forEach(function(K) {
      k[K] = k;
    }), (y.enabled === !1 || y.browser.disabled) && (y.level = "silent");
    const re = y.level || "info", B = Object.create(k);
    B.log || (B.log = A), c(B, Y, k), o({}, B), Object.defineProperty(B, "levelVal", {
      get: H
    }), Object.defineProperty(B, "level", {
      get: J,
      set: le
    });
    const Z = {
      transmit: O,
      serialize: L,
      asObject: y.browser.asObject,
      asObjectBindingsOnly: y.browser.asObjectBindingsOnly,
      formatters: y.browser.formatters,
      reportCaller: y.browser.reportCaller,
      levels: Y,
      timestamp: F(y),
      messageKey: y.messageKey || "msg",
      onChild: y.onChild || A
    };
    B.levels = f(y), B.level = re, B.isLevelEnabled = function(K) {
      return this.levels.values[K] ? this.levels.values[K] >= this.levels.values[this.level] : !1;
    }, B.setMaxListeners = B.getMaxListeners = B.emit = B.addListener = B.on = B.prependListener = B.once = B.prependOnceListener = B.removeListener = B.removeAllListeners = B.listeners = B.listenerCount = B.eventNames = B.write = B.flush = A, B.serializers = T, B._serialize = L, B._stdErrSerialize = N, B.child = function(...K) {
      return ce.call(this, Z, ...K);
    }, O && (B._logEvent = S());
    function H() {
      return n(this.level, this);
    }
    function J() {
      return this._level;
    }
    function le(K) {
      if (K !== "silent" && !this.levels.values[K])
        throw Error("unknown level " + K);
      this._level = K, h(this, Z, B, "error"), h(this, Z, B, "fatal"), h(this, Z, B, "warn"), h(this, Z, B, "info"), h(this, Z, B, "debug"), h(this, Z, B, "trace"), G.forEach((ee) => {
        h(this, Z, B, ee);
      });
    }
    function ce(K, ee, de) {
      if (!ee)
        throw new Error("missing bindings for child Pino");
      de = de || {}, L && ee.serializers && (de.serializers = ee.serializers);
      const he = de.serializers;
      if (L && he) {
        var Ie = Object.assign({}, T, he), ge = y.browser.serialize === !0 ? Object.keys(Ie) : L;
        delete ee.serializers, R([ee], ge, Ie, this._stdErrSerialize);
      }
      function Oe(ke) {
        this._childLevel = (ke._childLevel | 0) + 1, this.bindings = ee, Ie && (this.serializers = Ie, this._serialize = ge), O && (this._logEvent = S(
          [].concat(ke._logEvent.bindings, ee)
        ));
      }
      Oe.prototype = this;
      const me = new Oe(this);
      return o(this, me), me.child = function(...ke) {
        return ce.call(this, K, ...ke);
      }, me.level = de.level || this.level, K.onChild(me), me;
    }
    return B;
  }
  function f(y) {
    const O = y.customLevels || {}, k = Object.assign({}, l.levels.values, O), T = Object.assign({}, l.levels.labels, p(O));
    return {
      values: k,
      labels: T
    };
  }
  function p(y) {
    const O = {};
    return Object.keys(y).forEach(function(k) {
      O[y[k]] = k;
    }), O;
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
  }, l.stdSerializers = r, l.stdTimeFunctions = Object.assign({}, { nullTime: x, epochTime: I, unixTime: D, isoTime: $ });
  function g(y) {
    const O = [];
    y.bindings && O.push(y.bindings);
    let k = y[s];
    for (; k.parent; )
      k = k.parent, k.logger.bindings && O.push(k.logger.bindings);
    return O.reverse();
  }
  function h(y, O, k, T) {
    if (Object.defineProperty(y, T, {
      value: n(y.level, k) > n(T, k) ? A : k[i][T],
      writable: !0,
      enumerable: !0,
      configurable: !0
    }), y[T] === A) {
      if (!O.transmit) return;
      const N = O.transmit.level || y.level, G = n(N, k);
      if (n(T, k) < G) return;
    }
    y[T] = m(y, O, k, T);
    const L = g(y);
    L.length !== 0 && (y[T] = d(L, y[T]));
  }
  function d(y, O) {
    return function() {
      return O.apply(this, [...y, ...arguments]);
    };
  }
  function m(y, O, k, T) {
    return /* @__PURE__ */ (function(L) {
      return function() {
        const G = O.timestamp(), Y = new Array(arguments.length), re = Object.getPrototypeOf && Object.getPrototypeOf(this) === t ? t : this;
        for (var B = 0; B < Y.length; B++) Y[B] = arguments[B];
        var Z = !1;
        if (O.serialize && (R(Y, this._serialize, this.serializers, this._stdErrSerialize), Z = !0), O.asObject || O.formatters) {
          const H = C(this, T, Y, G, O);
          if (O.reportCaller && H && H.length > 0 && H[0] && typeof H[0] == "object")
            try {
              const J = U();
              J && (H[0].caller = J);
            } catch {
            }
          L.call(re, ...H);
        } else {
          if (O.reportCaller)
            try {
              const H = U();
              H && Y.push(H);
            } catch {
            }
          L.apply(re, Y);
        }
        if (O.transmit) {
          const H = O.transmit.level || y._level, J = n(H, k), le = n(T, k);
          if (le < J) return;
          b(this, {
            ts: G,
            methodLevel: T,
            methodValue: le,
            transmitValue: k.levels.values[O.transmit.level || y._level],
            send: O.transmit.send,
            val: n(y._level, k)
          }, Y, Z);
        }
      };
    })(y[i][T]);
  }
  function C(y, O, k, T, L) {
    const {
      level: N,
      log: G = (H) => H
    } = L.formatters || {}, Y = k.slice();
    let re = Y[0];
    const B = {};
    let Z = (y._childLevel | 0) + 1;
    if (Z < 1 && (Z = 1), T && (B.time = T), N) {
      const H = N(O, y.levels.values[O]);
      Object.assign(B, H);
    } else
      B.level = y.levels.values[O];
    if (L.asObjectBindingsOnly) {
      if (re !== null && typeof re == "object")
        for (; Z-- && typeof Y[0] == "object"; )
          Object.assign(B, Y.shift());
      return [G(B), ...Y];
    } else {
      if (re !== null && typeof re == "object") {
        for (; Z-- && typeof Y[0] == "object"; )
          Object.assign(B, Y.shift());
        re = Y.length ? e(Y.shift(), Y) : void 0;
      } else typeof re == "string" && (re = e(Y.shift(), Y));
      return re !== void 0 && (B[L.messageKey] = re), [G(B)];
    }
  }
  function R(y, O, k, T) {
    for (const L in y)
      if (T && y[L] instanceof Error)
        y[L] = l.stdSerializers.err(y[L]);
      else if (typeof y[L] == "object" && !Array.isArray(y[L]) && O)
        for (const N in y[L])
          O.indexOf(N) > -1 && N in k && (y[L][N] = k[N](y[L][N]));
  }
  function b(y, O, k, T = !1) {
    const L = O.send, N = O.ts, G = O.methodLevel, Y = O.methodValue, re = O.val, B = y._logEvent.bindings;
    T || R(
      k,
      y._serialize || Object.keys(y.serializers),
      y.serializers,
      y._stdErrSerialize === void 0 ? !0 : y._stdErrSerialize
    ), y._logEvent.ts = N, y._logEvent.messages = k.filter(function(Z) {
      return B.indexOf(Z) === -1;
    }), y._logEvent.level.label = G, y._logEvent.level.value = Y, L(G, y._logEvent, re), y._logEvent = S(B);
  }
  function S(y) {
    return {
      ts: 0,
      messages: [],
      bindings: y || [],
      level: { label: "", value: 0 }
    };
  }
  function v(y) {
    const O = {
      type: y.constructor.name,
      msg: y.message,
      stack: y.stack
    };
    for (const k in y)
      O[k] === void 0 && (O[k] = y[k]);
    return O;
  }
  function F(y) {
    return typeof y.timestamp == "function" ? y.timestamp : y.timestamp === !1 ? x : I;
  }
  function M() {
    return {};
  }
  function V(y) {
    return y;
  }
  function A() {
  }
  function x() {
    return !1;
  }
  function I() {
    return Date.now();
  }
  function D() {
    return Math.round(Date.now() / 1e3);
  }
  function $() {
    return new Date(Date.now()).toISOString();
  }
  function E() {
    function y(O) {
      return typeof O < "u" && O;
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
  gr.exports.default = l, gr.exports.pino = l;
  function U() {
    const y = new Error().stack;
    if (!y) return null;
    const O = y.split(`
`);
    for (let k = 1; k < O.length; k++) {
      const T = O[k].trim();
      if (/(^at\s+)?(createWrap|LOG|set\s*\(|asObject|Object\.apply|Function\.apply)/.test(T) || T.indexOf("browser.js") !== -1 || T.indexOf("node:internal") !== -1 || T.indexOf("node_modules") !== -1) continue;
      let L = T.match(/\((.*?):(\d+):(\d+)\)/);
      if (L || (L = T.match(/at\s+(.*?):(\d+):(\d+)/)), L) {
        const N = L[1], G = L[2], Y = L[3];
        return N + ":" + G + ":" + Y;
      }
    }
    return null;
  }
  return gr.exports;
}
YI();
const WI = {
  organizationId: j,
  accessToken: j,
  name: new Q({
    required: !1,
    emptyAllowed: !1
  }),
  analytics: new z({
    options: {
      required: !1
    },
    values: {
      enabled: new ie({
        required: !1
      }),
      originContext: new Q({
        required: !1
      }),
      originLevel2: new Q({
        required: !1
      }),
      originLevel3: new Q({
        required: !1
      }),
      analyticsMode: new Q({
        constrainTo: ["legacy", "next"],
        required: !1,
        default: "next"
      }),
      proxyBaseUrl: new Q({
        required: !1,
        url: !0
      }),
      trackingId: new Q({
        required: !1,
        emptyAllowed: !1,
        regex: /^[a-zA-Z0-9_\-.]{1,100}$/
      })
    }
  }),
  environment: new Q({
    required: !1,
    default: "prod",
    constrainTo: ["prod", "hipaa", "stg", "dev"]
  })
};
new mt({
  ...WI,
  analytics: new z({
    options: { required: !0 },
    values: {
      enabled: new ie({ required: !1, default: !0 }),
      proxyBaseUrl: new Q({ required: !1, url: !0 }),
      source: new z({
        options: { required: !1 },
        values: {
          "@coveo/atomic": ve,
          "@coveo/quantic": ve
        }
      }),
      trackingId: new Q({
        required: !0,
        emptyAllowed: !1,
        regex: /^[a-zA-Z0-9_\-.]{1,100}$/
      })
    }
  }),
  context: new z({
    options: { required: !0 },
    values: Sl
  }),
  cart: new z({
    values: em
  }),
  proxyBaseUrl: new Q({ required: !1, url: !0 })
});
fe((e, t) => e.commerceFacetSet[t], (e) => e == null ? void 0 : e.request);
fe((e) => e.commerceSearch.facets, (e, t) => t in e.commerceFacetSet, (e, t) => t, (e, t, r) => {
  const n = e.find((i) => i.facetId === r);
  if (n && t)
    return n;
});
const rr = {
  facetId: ue,
  field: j,
  tabs: new z({
    options: {
      required: !1
    },
    values: {
      included: new oe({ each: new Q() }),
      excluded: new oe({ each: new Q() })
    }
  }),
  activeTab: new Q({ required: !1 }),
  delimitingCharacter: new Q({ required: !1, emptyAllowed: !0 }),
  filterFacetCount: new ie({ required: !1 }),
  injectionDepth: new W({ required: !1, min: 0 }),
  numberOfValues: new W({ required: !1, min: 1 }),
  sortCriteria: new Ce({ required: !1 }),
  basePath: new oe({ required: !1, each: j }),
  filterByBasePath: new ie({ required: !1 })
}, KI = w("categoryFacet/register", (e) => q(e, rr)), GI = w("categoryFacet/toggleSelectValue", (e) => {
  try {
    return Ne(e.facetId, j), _a(e.selection), { payload: e, error: null };
  } catch (t) {
    return { payload: e, error: nt(t) };
  }
}), JI = w("categoryFacet/deselectAll", (e) => q(e, rr.facetId));
w("categoryFacet/updateNumberOfValues", (e) => q(e, {
  facetId: rr.facetId,
  numberOfValues: rr.numberOfValues
}));
w("categoryFacet/updateSortCriterion", (e) => q(e, {
  facetId: rr.facetId,
  criterion: new Ce()
}));
w("categoryFacet/updateBasePath", (e) => q(e, {
  facetId: rr.facetId,
  basePath: new oe({ each: j })
}));
se(qd(), (e) => {
  e.addCase(Br, (t, r) => ({ ...t, ...r.payload })).addCase(_e.fulfilled, (t) => {
    t.freezeFacetOrder = !1;
  }).addCase(_e.rejected, (t) => {
    t.freezeFacetOrder = !1;
  }).addCase(st.fulfilled, (t, r) => {
    var n;
    return ((n = r.payload) == null ? void 0 : n.facetOptions) ?? t;
  }).addCase(KI, (t, r) => {
    const { facetId: n, tabs: i } = r.payload;
    Cn(i, t, n);
  }).addCase(zd, (t, r) => {
    const { facetId: n, tabs: i } = r.payload;
    Cn(i, t, n);
  }).addCase(sf, (t, r) => {
    const { facetId: n, tabs: i } = r.payload;
    Cn(i, t, n);
  }).addCase(of, (t, r) => {
    const { facetId: n, tabs: i } = r.payload;
    Cn(i, t, n);
  }).addCase(_S, (t, r) => {
    t.facets[r.payload].enabled = !0;
  }).addCase(bi, (t, r) => {
    t.facets[r.payload].enabled = !1;
  }).addCase(St, (t, r) => {
    [
      ...Object.keys(r.payload.f ?? {}),
      ...Object.keys(r.payload.fExcluded ?? {}),
      ...Object.keys(r.payload.cf ?? {}),
      ...Object.keys(r.payload.nf ?? {}),
      ...Object.keys(r.payload.df ?? {})
    ].forEach((n) => {
      n in t || (t.facets[n] = Rd()), t.facets[n].enabled = !0;
    });
  });
});
function Cn(e, t, r) {
  const n = {
    ...Rd(),
    tabs: e ?? {}
  };
  t.facets[r] = n;
}
const Hf = w("rangeFacet/executeToggleSelect", (e) => q(e, nf(e.selection))), Yf = w("rangeFacet/executeToggleExclude", (e) => q(e, nf(e.selection))), Wf = {
  facetId: ue,
  selection: new z({ values: wt })
};
ne("dateFacet/executeToggleSelect", (e, { dispatch: t, extra: { validatePayload: r } }) => {
  r(e, Wf), t(Oa(e)), t(Hf(e)), t(Br());
});
ne("dateFacet/executeToggleExclude", (e, { dispatch: t, extra: { validatePayload: r } }) => {
  r(e, Wf), t(Fa(e)), t(Yf(e)), t(Br());
});
function fs(e, t) {
  const r = t.payload ?? null;
  r && (e.response = ft().response, e.results = [], e.questionAnswer = $s()), e.error = r, e.isLoading = !1;
}
function Gs(e, t) {
  e.error = null, e.response = t.payload.response, e.queryExecuted = t.payload.queryExecuted, e.duration = t.payload.duration, e.isLoading = !1;
}
function ZI(e, t) {
  Gs(e, t), e.results = t.payload.response.results.map((r) => ({
    ...r,
    searchUid: t.payload.response.searchUid
  })), e.searchResponseId = t.payload.response.searchUid, e.questionAnswer = t.payload.response.questionAnswer, e.extendedResults = t.payload.response.extendedResults;
}
function pu(e, t) {
  e.isLoading = !0, e.searchAction = t.meta.arg.next, e.requestId = t.meta.requestId;
}
function XI(e, t) {
  e.isLoading = !0, e.searchAction = { actionCause: Xt.browseResults }, e.requestId = t.meta.requestId;
}
se(ft(), (e) => {
  e.addCase(_e.rejected, (t, r) => fs(t, r)), e.addCase(Xi.rejected, (t, r) => fs(t, r)), e.addCase(Tn.rejected, (t, r) => fs(t, r)), e.addCase(_e.fulfilled, (t, r) => {
    ZI(t, r);
  }), e.addCase(Xi.fulfilled, (t, r) => {
    Gs(t, r), t.results = [
      ...t.results,
      ...r.payload.response.results.map((n) => ({
        ...n,
        searchUid: r.payload.response.searchUid
      }))
    ];
  }), e.addCase(Tn.fulfilled, (t, r) => {
    Gs(t, r), t.results = [
      ...r.payload.response.results.map((n) => ({
        ...n,
        searchUid: r.payload.response.searchUid
      }))
    ];
  }), e.addCase(_d.fulfilled, (t, r) => {
    t.response.facets = r.payload.response.facets, t.response.searchUid = r.payload.response.searchUid;
  }), e.addCase(_e.pending, pu), e.addCase(Xi.pending, XI), e.addCase(Tn.pending, pu), e.addCase(Jw, (t, r) => {
    t.searchAction = r.payload;
  }), e.addCase(Gr, (t, r) => {
    t.error = r.payload, t.isLoading = !1;
  });
});
const Kf = [
  "idle",
  "selected",
  "excluded"
], Gf = [
  "ascending",
  "descending"
], Jf = [
  "even",
  "equiprobable"
], eA = {
  start: new Q(),
  end: new Q(),
  endInclusive: new ie(),
  state: new Q({ constrainTo: Kf })
};
new mt({
  facetId: $d,
  field: Ld,
  tabs: new z({
    options: {
      required: !1
    },
    values: {
      included: new oe({ each: new Q() }),
      excluded: new oe({ each: new Q() })
    }
  }),
  generateAutomaticRanges: Nd,
  filterFacetCount: Qd,
  injectionDepth: jd,
  numberOfValues: Ra,
  currentValues: new oe({
    each: new z({ values: eA })
  }),
  sortCriteria: new Q({ constrainTo: Gf }),
  rangeAlgorithm: new Q({ constrainTo: Jf })
});
const Zf = {
  facetId: ue,
  selection: new z({ values: Kr })
};
ne("numericFacet/executeToggleSelect", (e, { dispatch: t, extra: { validatePayload: r } }) => {
  r(e, Zf), t(Ta(e)), t(Hf(e)), t(Br());
});
ne("numericFacet/executeToggleExclude", (e, { dispatch: t, extra: { validatePayload: r } }) => {
  r(e, Zf), t(Ma(e)), t(Yf(e)), t(Br());
});
const tA = [
  "allValues",
  "atLeastOneValue"
], rA = {
  start: new W(),
  end: new W(),
  endInclusive: new ie(),
  state: new Q({ constrainTo: Kf })
};
new mt({
  facetId: $d,
  tabs: new z({
    options: {
      required: !1
    },
    values: {
      included: new oe({ each: new Q() }),
      excluded: new oe({ each: new Q() })
    }
  }),
  field: Ld,
  generateAutomaticRanges: Nd,
  filterFacetCount: Qd,
  injectionDepth: jd,
  numberOfValues: Ra,
  currentValues: new oe({
    each: new z({ values: rA })
  }),
  sortCriteria: new Q({ constrainTo: Gf }),
  resultsMustMatch: new Q({ constrainTo: tA }),
  rangeAlgorithm: new Q({ constrainTo: Jf })
});
const Ga = {
  id: j
}, Xf = {
  ...Ga,
  query: Pe
}, nA = w("commerce/instantProducts/clearExpired", (e) => q(e, Ga)), iA = {
  child: new z({
    options: { required: !0 },
    values: {
      permanentid: new Q({ required: !0 })
    }
  }),
  ...Xf
}, sA = w("commerce/instantProducts/promoteChildToParent", (e) => q(e, iA)), aA = w("commerce/instantProducts/register", (e) => q(e, Ga)), oA = w("commerce/instantProducts/updateQuery", (e) => q(e, Xf));
function cA(e) {
  return e ? e.expiresAt && Date.now() >= e.expiresAt : !1;
}
const uA = (e, t) => {
  const { id: r } = e;
  if (!t[r])
    return t[r] = { q: "", cache: {} }, t;
}, lA = (e, t) => {
  const { q: r, id: n } = e;
  r && (t[n].q = r);
}, dA = (e, t) => {
  const { id: r } = e;
  Object.entries(t[r].cache).forEach(([n, i]) => {
    cA(i) && delete t[r].cache[n];
  });
}, fA = (e, t, r) => {
  for (const i in t)
    for (const s in t[i].cache)
      t[i].cache[s].isActive = !1;
  if (!Js(e, t)) {
    gA(e, t, r);
    return;
  }
  const n = Js(e, t);
  n.isLoading = !0, n.isActive = !0, n.error = null;
}, hA = (e, t, r) => {
  const { id: n, q: i, searchUid: s, cacheTimeout: a, totalCountFiltered: o, duration: c } = e;
  t[n].cache[i] = {
    ...Js(e, t),
    ...r,
    isActive: !0,
    searchUid: s,
    isLoading: !1,
    error: null,
    expiresAt: a ? a + Date.now() : 0,
    totalCountFiltered: o,
    duration: c
  };
}, pA = (e, t) => {
  const { id: r, q: n, error: i } = e;
  t[r].cache[n].error = i || null, t[r].cache[n].isLoading = !1, t[r].cache[n].isActive = !1;
}, Js = (e, t) => {
  const { q: r, id: n } = e;
  return t[n].cache[r] || null;
}, gA = (e, t, r) => {
  const { q: n, id: i } = e;
  t[i].cache[n] = {
    isLoading: !0,
    error: null,
    expiresAt: 0,
    isActive: !0,
    searchUid: "",
    totalCountFiltered: 0,
    duration: 0,
    ...r
  };
};
function mA() {
  return {};
}
se(mA(), (e) => {
  e.addCase(aA, (t, r) => {
    uA(r.payload, t);
  }).addCase(oA, (t, r) => {
    lA({ ...r.payload, q: r.payload.query }, t);
  }).addCase(nA, (t, r) => {
    dA(r.payload, t);
  }).addCase(Ni.pending, (t, r) => {
    fA(r.meta.arg, t, { products: [] });
  }).addCase(Ni.fulfilled, (t, r) => {
    const { response: { products: n, responseId: i, pagination: { totalEntries: s } } } = r.payload;
    hA({
      duration: 0,
      searchUid: i,
      totalCountFiltered: s,
      ...r.meta.arg
    }, t, {
      products: n.map((a, o) => yA(a, o + 1, i))
    });
  }).addCase(Ni.rejected, (t, r) => {
    pA(r.meta.arg, t);
  }).addCase(sA, (t, r) => {
    const n = t[r.payload.id].cache[r.payload.query];
    if (!n)
      return;
    const i = n.products;
    let s;
    const a = i.findIndex((g) => (s = g.children.find((h) => h.permanentid === r.payload.child.permanentid), !!s));
    if (a === -1 || s === void 0)
      return;
    const o = i[a].responseId, c = i[a].position, { children: u, totalNumberOfChildren: l } = i[a], f = {
      ...s,
      resultType: Te.PRODUCT,
      children: u,
      totalNumberOfChildren: l,
      position: c,
      responseId: o
    }, p = [...i];
    p.splice(a, 1, f), n.products = p;
  });
});
function yA(e, t, r) {
  const n = e.children.some((o) => o.permanentid === e.permanentid);
  if (e.children.length === 0 || n)
    return { ...e, position: t, responseId: r };
  const { children: i, totalNumberOfChildren: s, ...a } = e;
  return {
    ...e,
    children: [a, ...i],
    position: t,
    responseId: r
  };
}
ne("commerce/product/view", async (e, { extra: t, getState: r }) => {
  const { relay: n } = t, s = { currency: li(r().commerceContext), product: e };
  n.emit("ec.productView", s);
});
ne("commerce/product/click", async (e, { extra: t, getState: r }) => {
  const { relay: n } = t, s = { currency: li(r().commerceContext), ...e };
  n.emit("ec.productClick", s);
});
const vA = {
  placementIds: new oe({
    required: !1,
    min: 1,
    each: j
  }),
  productId: ve
}, SA = w("commerce/productEnrichment/registerOptions"), wA = (e, t, r) => {
  const n = Nr(t, r);
  return {
    ...n,
    context: {
      ...n.context,
      ...e.productId ? { product: { productId: e.productId } } : {}
    },
    placementIds: e.placementIds
  };
}, hs = ne("commerce/productEnrichment/fetchBadges", async (e, { getState: t, rejectWithValue: r, extra: { apiClient: n, navigatorContext: i } }) => {
  q(e, vA);
  const s = wA(e, t(), i), a = await n.getBadges(s);
  return "error" in a ? r(a.error) : {
    response: a.success
  };
});
function bA() {
  return {
    products: [],
    isLoading: !1,
    error: null,
    productId: void 0,
    placementIds: []
  };
}
se(bA(), (e) => {
  e.addCase(SA, (t, r) => {
    t.productId = r.payload.productId, t.placementIds = r.payload.placementIds ?? [];
  }).addCase(hs.pending, (t) => {
    t.isLoading = !0, t.error = null;
  }).addCase(hs.fulfilled, (t, r) => {
    IA(t), t.products = r.payload.response.products;
  }).addCase(hs.rejected, (t, r) => {
    CA(t, r.payload);
  });
});
function CA(e, t) {
  e.error = t || null, e.isLoading = !1, e.products = [];
}
function IA(e) {
  e.error = null, e.isLoading = !1;
}
ne("commerce/spotlight-content/click", async (e, { extra: t }) => {
  const { relay: r } = t, n = {
    responseId: e.responseId,
    position: e.position,
    itemMetadata: {
      uniqueFieldName: "id",
      uniqueFieldValue: e.id,
      url: e.desktopImage
    }
  };
  r.emit("itemClick", n);
});
function gu() {
  return {};
}
se(gu(), (e) => {
  e.addCase(Al, (t, r) => AA(t, r.payload)).addCase(xl, (t, r) => xA(t, r.payload)).addCase(ua, (t, r) => kA(t, r.payload)).addCase(Il, (t, r) => RA(t, r.payload)).addCase(za, (t, r) => qA(t, r.payload)).addCase(gi, (t, r) => OA(t, r.payload)).addCase(fi, (t) => mu(t)).addCase(ca, (t) => mu(t)).addCase(hi, (t, r) => FA(t, r.payload)).addCase(Pa, (t, r) => EA(t, r.payload)).addCase(da, (t, r) => DA(t, r)).addCase(ja, (t, r) => TA(t, r.payload)).addCase(Qa, (t, r) => _A(t, r.payload)).addCase(Si, (t, r) => MA(t, r)).addCase(wi, (t, r) => PA(t, r)).addCase(xi, (t, r) => UA(t, r.payload)).addCase(ki, (t, r) => VA(t, r.payload)).addCase(La, (t, r) => $A(t, r.payload)).addCase(Ua, (t, r) => LA(t, r.payload)).addCase(Va, (t, r) => QA(t, r.payload)).addCase($a, (t, r) => jA(t, r.payload)).addCase(it, gu).addCase(sr, (t, r) => (t = r.payload, t)).addCase(yt, (t, r) => (t = r.payload, t));
});
const AA = (e, t) => {
  if ((t == null ? void 0 : t.slotId) === void 0) {
    if (e.page !== void 0) {
      e.page++;
      return;
    }
    e.page = 1;
  }
}, xA = (e, t) => {
  if ((t == null ? void 0 : t.slotId) === void 0) {
    if (e.page !== void 0 && e.page > 1) {
      e.page--;
      return;
    }
    e.page = void 0;
  }
}, kA = (e, t) => {
  (t == null ? void 0 : t.slotId) === void 0 && (e.page = t.page > 0 ? t.page : void 0);
}, RA = (e, t) => {
  if ((t == null ? void 0 : t.slotId) === void 0) {
    if (e.page = void 0, t.pageSize === 0) {
      e.perPage = void 0;
      return;
    }
    e.perPage = t.pageSize;
  }
}, qA = (e, t) => {
  e.page = void 0, e.sortCriteria = t;
}, OA = (e, t) => {
  e.page = void 0;
  const { query: r } = t;
  if (r === void 0 || r.trim() === "") {
    e.q = void 0;
    return;
  }
  e.q = r;
}, mu = (e) => {
  e.page = void 0, e.cf = void 0, e.df = void 0, e.dfExcluded = void 0, e.lf = void 0, e.mnf = void 0, e.mnfExcluded = void 0, e.nf = void 0, e.nfExcluded = void 0, e.f = void 0, e.fExcluded = void 0;
}, FA = (e, t) => {
  const { facetId: r } = t;
  e.page = void 0, e.cf && (delete e.cf[r], Object.keys(e.cf).length === 0 && delete e.cf), e.df && (delete e.df[r], Object.keys(e.df).length === 0 && delete e.df), e.dfExcluded && (delete e.dfExcluded[r], Object.keys(e.dfExcluded).length === 0 && delete e.dfExcluded), e.lf && (delete e.lf[r], Object.keys(e.lf).length === 0 && delete e.lf), e.mnf && (delete e.mnf[r], Object.keys(e.mnf).length === 0 && delete e.mnf), e.mnfExcluded && (delete e.mnfExcluded[r], Object.keys(e.mnfExcluded).length === 0 && delete e.mnfExcluded), e.nf && (delete e.nf[r], Object.keys(e.nf).length === 0 && delete e.nf), e.nfExcluded && (delete e.nfExcluded[r], Object.keys(e.nfExcluded).length === 0 && delete e.nfExcluded), e.f && (delete e.f[r], Object.keys(e.f).length === 0 && delete e.f), e.fExcluded && (delete e.fExcluded[r], Object.keys(e.fExcluded).length === 0 && delete e.fExcluded);
}, EA = (e, t) => {
  if (e.page = void 0, t.selection.state === "selected") {
    e.cf ?? (e.cf = {}), delete e.cf[t.facetId], Object.keys(e.cf).length === 0 && (e.cf = void 0);
    return;
  }
  e.cf ?? (e.cf = {}), e.cf[t.facetId] = t.selection.path;
}, DA = (e, t) => {
  const r = t.payload;
  e.page = void 0, e.cf ?? (e.cf = {}), e.cf[r.facetId] = [...r.value.path, r.value.rawValue];
}, TA = (e, t) => {
  switch (e.page = void 0, Mt(e, "fExcluded", e.fExcluded, t.facetId, t.selection.value), t.selection.state) {
    case "selected":
      Mt(e, "f", e.f, t.facetId, t.selection.value);
      break;
    case "excluded":
    case "idle":
      e.f ?? (e.f = {}), e.f[t.facetId] = [
        ...e.f[t.facetId] ?? [],
        t.selection.value
      ];
      break;
  }
}, MA = (e, t) => {
  const r = t.payload;
  e.page = void 0, Mt(e, "fExcluded", e.fExcluded, r.facetId, r.value.rawValue), e.f ?? (e.f = {}), e.f[r.facetId] = [
    ...e.f[r.facetId] ?? [],
    r.value.rawValue
  ];
}, _A = (e, t) => {
  switch (e.page = void 0, Mt(e, "f", e.f, t.facetId, t.selection.value), t.selection.state) {
    case "excluded":
      Mt(e, "fExcluded", e.fExcluded, t.facetId, t.selection.value);
      break;
    case "selected":
    case "idle":
      e.fExcluded ?? (e.fExcluded = {}), e.fExcluded[t.facetId] = [
        ...e.fExcluded[t.facetId] ?? [],
        t.selection.value
      ];
      break;
  }
}, PA = (e, t) => {
  const r = t.payload;
  e.page = void 0, Mt(e, "f", e.f, r.facetId, r.value.rawValue), e.fExcluded ?? (e.fExcluded = {}), e.fExcluded[r.facetId] = [
    ...e.fExcluded[r.facetId] ?? [],
    r.value.rawValue
  ];
}, UA = (e, t) => {
  switch (e.page = void 0, ye(e, "mnf", e.mnf, t.facetId, t.selection), ye(e, "mnfExcluded", e.mnfExcluded, t.facetId, t.selection), ye(e, "nfExcluded", e.nfExcluded, t.facetId, t.selection), t.selection.state) {
    case "selected":
      ye(e, "nf", e.nf, t.facetId, t.selection);
      break;
    case "excluded":
    case "idle":
      e.nf ?? (e.nf = {}), e.nf[t.facetId] = [
        ...e.nf[t.facetId] ?? [],
        t.selection
      ];
      break;
  }
}, VA = (e, t) => {
  switch (e.page = void 0, ye(e, "mnf", e.mnf, t.facetId, t.selection), ye(e, "mnfExcluded", e.mnfExcluded, t.facetId, t.selection), ye(e, "nf", e.nf, t.facetId, t.selection), t.selection.state) {
    case "excluded":
      ye(e, "nfExcluded", e.nfExcluded, t.facetId, t.selection);
      break;
    case "selected":
    case "idle":
      e.nfExcluded ?? (e.nfExcluded = {}), e.nfExcluded[t.facetId] = [
        ...e.nfExcluded[t.facetId] ?? [],
        t.selection
      ];
      break;
  }
}, $A = (e, t) => {
  e.page = void 0, ye(e, "nf", e.nf, t.facetId, t), ye(e, "nfExcluded", e.nfExcluded, t.facetId, t);
  const { facetId: r, ...n } = t;
  switch (t.state) {
    case "idle":
      ye(e, "mnf", e.mnf, t.facetId, t), ye(e, "mnfExcluded", e.mnfExcluded, t.facetId, t);
      break;
    case "excluded":
      ye(e, "mnf", e.mnf, t.facetId, t), e.mnfExcluded ?? (e.mnfExcluded = {}), e.mnfExcluded[t.facetId] = [n];
      break;
    case "selected":
      ye(e, "mnfExcluded", e.mnfExcluded, t.facetId, t), e.mnf ?? (e.mnf = {}), e.mnf[t.facetId] = [n];
      break;
  }
}, LA = (e, t) => {
  e.page = void 0, ye(e, "dfExcluded", e.dfExcluded, t.facetId, t.selection);
  const { numberOfResults: r, ...n } = t.selection;
  switch (t.selection.state) {
    case "selected":
      ye(e, "df", e.df, t.facetId, t.selection);
      break;
    case "excluded":
    case "idle":
      e.df ?? (e.df = {}), e.df[t.facetId] = [
        ...e.df[t.facetId] ?? [],
        n
      ];
      break;
  }
}, QA = (e, t) => {
  e.page = void 0, ye(e, "df", e.df, t.facetId, t.selection);
  const { numberOfResults: r, ...n } = t.selection;
  switch (t.selection.state) {
    case "excluded":
      ye(e, "dfExcluded", e.dfExcluded, t.facetId, t.selection);
      break;
    case "selected":
    case "idle":
      e.dfExcluded ?? (e.dfExcluded = {}), e.dfExcluded[t.facetId] = [
        ...e.dfExcluded[t.facetId] ?? [],
        n
      ];
      break;
  }
}, jA = (e, t) => {
  switch (e.page = void 0, t.selection.state) {
    case "selected":
      Mt(e, "lf", e.lf, t.facetId, t.selection.value);
      break;
    case "excluded":
    case "idle":
      e.lf ?? (e.lf = {}), e.lf[t.facetId] = [
        ...e.lf[t.facetId] ?? [],
        t.selection.value
      ];
      break;
  }
}, Mt = (e, t, r, n, i) => {
  r !== void 0 && r[n] !== void 0 && (r[n] = r[n].filter((s) => s !== i), r[n].length === 0 && delete r[n], Object.keys(r).length === 0 && (e[t] = void 0));
}, ye = (e, t, r, n, i) => {
  if (r !== void 0 && r[n] !== void 0) {
    const s = r[n].filter((a) => a.start !== i.start || a.end !== i.end || a.endInclusive !== i.endInclusive);
    r[n] = s, r[n].length === 0 && delete r[n], Object.keys(r).length === 0 && (e[t] = void 0);
  }
}, NA = new W({
  min: kv,
  default: Wl,
  required: !1
}), zA = new W({
  min: Av,
  max: xv,
  default: Yl,
  required: !1
}), BA = {
  desiredCount: zA,
  numberOfValues: NA
};
w("automaticFacet/setOptions", (e) => q(e, BA));
w("automaticFacet/deselectAll", (e) => q(e, ue));
const HA = j, YA = w("automaticFacet/toggleSelectValue", (e) => q(e, {
  field: HA,
  selection: new z({ values: ur })
}));
se(Ia(), (e) => {
  e.addCase(Ew, (t, r) => {
    const n = ps(t), i = r.payload;
    t.defaultNumberOfResults = t.numberOfResults = i, t.firstResult = mr(n, i);
  }).addCase(Dw, (t, r) => {
    t.numberOfResults = r.payload, t.firstResult = 0;
  }).addCase(Wr, (t) => {
    t.firstResult = 0;
  }).addCase(Tw, (t, r) => {
    const n = r.payload;
    t.firstResult = mr(n, t.numberOfResults);
  }).addCase(xd, (t, r) => {
    const n = r.payload;
    t.firstResult = mr(n, t.numberOfResults);
  }).addCase(_w, (t) => {
    const r = ps(t), n = Math.max(r - 1, Pm);
    t.firstResult = mr(n, t.numberOfResults);
  }).addCase(Mw, (t) => {
    const r = ps(t), n = WA(t), i = Math.min(r + 1, n);
    t.firstResult = mr(i, t.numberOfResults);
  }).addCase(st.fulfilled, (t, r) => {
    r.payload && (t.numberOfResults = r.payload.pagination.numberOfResults, t.firstResult = r.payload.pagination.firstResult);
  }).addCase(St, (t, r) => {
    t.firstResult = r.payload.firstResult ?? t.firstResult, t.numberOfResults = r.payload.numberOfResults ?? t.defaultNumberOfResults;
  }).addCase(_e.fulfilled, (t, r) => {
    const { response: n } = r.payload;
    t.totalCountFiltered = n.totalCountFiltered;
  }).addCase(Tn.fulfilled, (t, r) => {
    const { response: n } = r.payload;
    t.totalCountFiltered = n.totalCountFiltered;
  }).addCase(Ai, (t) => {
    Ae(t);
  }).addCase(Fa, (t) => {
    Ae(t);
  }).addCase(Hd, (t) => {
    Ae(t);
  }).addCase(Ma, (t) => {
    Ae(t);
  }).addCase(wi, (t) => {
    Ae(t);
  }).addCase(Bd, (t) => {
    Ae(t);
  }).addCase(JI, (t) => {
    Ae(t);
  }).addCase(GI, (t) => {
    Ae(t);
  }).addCase(da, (t) => {
    Ae(t);
  }).addCase(Oa, (t) => {
    Ae(t);
  }).addCase(Ta, (t) => {
    Ae(t);
  }).addCase(zr, (t) => {
    Ae(t);
  }).addCase(af, (t) => {
    Ae(t);
  }).addCase(cf, (t) => {
    Ae(t);
  }).addCase(Si, (t) => {
    Ae(t);
  }).addCase(YA, (t) => {
    Ae(t);
  });
});
function Ae(e) {
  e.firstResult = Ia().firstResult;
}
function ps(e) {
  const { firstResult: t, numberOfResults: r } = e;
  return KA(t, r);
}
function WA(e) {
  const { totalCountFiltered: t, numberOfResults: r } = e;
  return GA(t, r);
}
function mr(e, t) {
  return (e - 1) * t;
}
function KA(e, t) {
  return Math.round(e / t) + 1;
}
function GA(e, t) {
  const r = Math.min(e, Er);
  return Math.ceil(r / t);
}
new mt({
  parameters: new z({
    options: { required: !0 },
    values: Vd
  })
});
new mt({
  fragment: new Q()
});
fe((e) => e.productListing.facets, (e, t) => t in e.commerceFacetSet, (e, t) => t, (e, t, r) => {
  const n = e.find((i) => i.facetId === r);
  if (n && t)
    return n;
});
const eh = {
  queries: new oe({
    required: !0,
    each: new Q({ emptyAllowed: !1 })
  }),
  maxLength: new W({ required: !0, min: 1, default: 10 })
}, JA = w("recentQueries/registerRecentQueries", (e) => q(e, eh)), ZA = w("recentQueries/clearRecentQueries"), XA = w("commerce/recentQueries/clear"), e0 = w("commerce/recentQueries/register", (e) => q(e, eh));
function th() {
  return {
    queries: [],
    maxLength: 10
  };
}
se(th(), (e) => {
  e.addCase(JA, rh).addCase(ZA, nh).addCase(_e.fulfilled, (t, r) => {
    const n = r.payload.queryExecuted, i = r.payload.response.results;
    !n.length || !i.length || ih(n, t);
  });
});
function rh(e, t) {
  e.queries = Array.from(new Set(t.payload.queries.map((r) => r.trim().toLowerCase()))).slice(0, t.payload.maxLength), e.maxLength = t.payload.maxLength;
}
function nh(e) {
  e.queries = [];
}
function ih(e, t) {
  const r = e.trim().toLowerCase();
  if (r === "")
    return;
  const n = Array.from(new Set(t.queries.filter((i) => i.trim().toLowerCase() !== r))).slice(0, t.maxLength - 1);
  t.queries = [r, ...n];
}
se(th(), (e) => {
  e.addCase(e0, rh).addCase(XA, nh).addCase(Re.fulfilled, (t, r) => {
    const n = r.payload.queryExecuted, i = r.payload.response.products;
    !n.length || !i.length || ih(n, t);
  });
});
const Di = {
  id: j,
  query: Pe
}, t0 = w("querySet/register", (e) => q(e, Di)), r0 = w("querySet/update", (e) => q(e, Di)), n0 = w("commerce/querySet/register", (e) => q(e, Di)), i0 = w("commerce/querySet/update", (e) => q(e, Di));
se(Aa(), (e) => {
  e.addCase(n0, (t, r) => a0(t, r.payload)).addCase(i0, (t, r) => {
    const { id: n, query: i } = r.payload;
    yu(t, n, i);
  }).addCase(pd, (t, r) => {
    const { id: n, expression: i } = r.payload;
    yu(t, n, i);
  }).addCase(Re.fulfilled, (t, r) => {
    const { queryExecuted: n } = r.payload;
    sh(t, n);
  }).addCase(yt, s0);
});
function s0(e, t) {
  X(t.payload.q) || sh(e, t.payload.q);
}
function sh(e, t) {
  Object.keys(e).forEach((r) => {
    e[r] = t;
  });
}
const yu = (e, t, r) => {
  t in e && (e[t] = r);
}, a0 = (e, t) => {
  const { id: r, query: n } = t;
  r in e || (e[r] = n);
};
function ah(e, t) {
  const r = t.id;
  r in e || (e[r] = o0(t));
}
function oh(e, t) {
  const r = e[t.meta.arg.id];
  r && (r.currentRequestId = t.meta.requestId, r.isLoading = !0);
}
function ch(e, t) {
  const r = e[t.meta.arg.id];
  r && (r.error = t.payload || null, r.isLoading = !1);
}
function uh(e, t) {
  const r = e[t.id];
  r && (r.responseId = "", r.completions = [], r.partialQueries = []);
}
function o0(e) {
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
const lh = () => ({});
se(lh(), (e) => e.addCase(xS, (t, r) => {
  ah(t, r.payload);
}).addCase(Rt.pending, oh).addCase(Rt.fulfilled, (t, r) => {
  const n = t[r.meta.arg.id];
  if (!n || r.meta.requestId !== n.currentRequestId)
    return;
  const { query: i } = r.payload;
  i && n.partialQueries.push(i.replace(/;/, encodeURIComponent(";"))), n.responseId = r.payload.responseId, n.completions = r.payload.completions.map((s) => ({
    expression: s.expression,
    highlighted: s.highlighted,
    score: 0,
    executableConfidence: 0
  })), n.isLoading = !1, n.error = null;
}).addCase(Rt.rejected, ch).addCase(AS, (t, r) => {
  uh(t, r.payload);
}));
const Zr = {
  id: j
}, c0 = w("querySuggest/register", (e) => q(e, {
  ...Zr,
  count: new W({ min: 0 })
})), u0 = w("querySuggest/unregister", (e) => q(e, Zr)), dh = w("querySuggest/selectSuggestion", (e) => q(e, {
  ...Zr,
  expression: Pe
})), l0 = w("querySuggest/clear", (e) => q(e, Zr)), gs = ne("querySuggest/fetch", async (e, { getState: t, rejectWithValue: r, extra: { apiClient: n, validatePayload: i, navigatorContext: s } }) => {
  i(e, Zr);
  const a = e.id, o = await d0(a, t(), s), c = await n.querySuggest(o);
  return ht(c) ? r(c.error) : {
    id: a,
    q: o.q,
    ...c.success
  };
}), d0 = async (e, t, r) => ({
  accessToken: t.configuration.accessToken,
  organizationId: t.configuration.organizationId,
  url: t.configuration.search.apiBaseUrl ?? ir(t.configuration.organizationId, t.configuration.environment),
  count: t.querySuggest[e].count,
  q: t.querySet[e],
  locale: t.configuration.search.locale,
  timezone: t.configuration.search.timezone,
  actionsHistory: t.configuration.analytics.enabled ? or.getInstance().getHistory() : [],
  ...t.context && { context: t.context.contextValues },
  ...t.pipeline && { pipeline: t.pipeline },
  ...t.searchHub && { searchHub: t.searchHub },
  tab: t.configuration.analytics.originLevel2,
  ...t.configuration.analytics.enabled && {
    ...t.configuration.analytics.enabled && t.configuration.analytics.analyticsMode === "legacy" ? await va(t.configuration.analytics) : yi(t.configuration.analytics, r)
  },
  ...t.configuration.search.authenticationProviders.length && {
    authentication: t.configuration.search.authenticationProviders.join(",")
  }
});
se(cr(), (e) => e.addCase(Ii, (t, r) => ({ ...t, ...r.payload })).addCase(Ca, (t, r) => {
  t.q = r.payload;
}).addCase(dh, (t, r) => {
  t.q = r.payload.expression;
}).addCase(st.fulfilled, (t, r) => {
  var n;
  return ((n = r.payload) == null ? void 0 : n.query) ?? t;
}).addCase(St, (t, r) => {
  t.q = r.payload.q ?? t.q, t.enableQuerySyntax = r.payload.enableQuerySyntax ?? t.enableQuerySyntax;
}));
se(Aa(), (e) => {
  e.addCase(t0, (t, r) => h0(t, r.payload)).addCase(r0, (t, r) => {
    const { id: n, query: i } = r.payload;
    ms(t, n, i);
  }).addCase(dh, (t, r) => {
    const { id: n, expression: i } = r.payload;
    ms(t, n, i);
  }).addCase(_e.fulfilled, (t, r) => {
    const { queryExecuted: n } = r.payload;
    fh(t, n);
  }).addCase(St, f0).addCase(st.fulfilled, (t, r) => {
    if (r.payload)
      for (const [n, i] of Object.entries(r.payload.querySet))
        ms(t, n, i);
  });
});
function f0(e, t) {
  X(t.payload.q) || fh(e, t.payload.q);
}
function fh(e, t) {
  Object.keys(e).forEach((r) => {
    e[r] = t;
  });
}
const ms = (e, t, r) => {
  t in e && (e[t] = r);
}, h0 = (e, t) => {
  const { id: r, query: n } = t;
  r in e || (e[r] = n);
};
se(lh(), (e) => e.addCase(c0, (t, r) => {
  ah(t, r.payload);
}).addCase(u0, (t, r) => {
  delete t[r.payload.id];
}).addCase(gs.pending, oh).addCase(gs.fulfilled, (t, r) => {
  const n = t[r.meta.arg.id];
  if (!n || r.meta.requestId !== n.currentRequestId)
    return;
  const { q: i } = r.payload;
  i && n.partialQueries.push(i.replace(/;/, encodeURIComponent(";"))), n.responseId = r.payload.responseId, n.completions = r.payload.completions, n.isLoading = !1, n.error = null;
}).addCase(gs.rejected, ch).addCase(l0, (t, r) => {
  uh(t, r.payload);
}).addCase(Gr, (t, r) => {
  Object.keys(t).forEach((n) => {
    const i = t[n];
    i && (i.error = r.payload, i.isLoading = !1);
  });
}));
const ys = {
  open: new Q(),
  close: new Q()
}, p0 = {
  id: j,
  highlightOptions: new z({
    values: {
      notMatchDelimiters: new z({
        values: ys
      }),
      exactMatchDelimiters: new z({
        values: ys
      }),
      correctionDelimiters: new z({
        values: ys
      })
    }
  }),
  clearFilters: new ie()
}, { id: g0, highlightOptions: m0, clearFilters: y0 } = p0, v0 = {
  id: g0,
  highlightOptions: m0,
  clearFilters: y0,
  enableResults: new ie()
}, S0 = (e, t) => {
  const r = Nr(e, t);
  return {
    ...r,
    context: {
      ...r.context,
      capture: !1
    },
    query: e.commerceQuery.query
  };
}, vs = ne("commerce/standaloneSearchBox/fetchRedirect", async (e, { getState: t, rejectWithValue: r, extra: { apiClient: n, navigatorContext: i } }) => {
  q(e, { id: new Q({ emptyAllowed: !1 }) });
  const s = t(), a = S0(s, i), o = await n.plan(a);
  return Qe(o) ? r(o.error) : o.success.redirect || "";
}), w0 = w("commerce/standaloneSearchBox/register", (e) => q(e, {
  id: j,
  redirectionUrl: j,
  overwrite: new ie({ required: !1 })
})), b0 = w("commerce/standaloneSearchBox/updateRedirectionUrl", (e) => q(e, {
  id: j,
  redirectionUrl: j
})), C0 = w("commerce/standaloneSearchBox/reset", (e) => q(e, {
  id: j
}));
function I0() {
  return {};
}
se(I0(), (e) => e.addCase(w0, (t, r) => {
  const { id: n, redirectionUrl: i, overwrite: s } = r.payload;
  !s && n in t || (t[n] = vu(i));
}).addCase(b0, (t, r) => {
  const { id: n, redirectionUrl: i } = r.payload, s = t[n];
  s && (s.defaultRedirectionUrl = i);
}).addCase(C0, (t, r) => {
  const { id: n } = r.payload, i = t[n];
  if (i) {
    t[n] = vu(i.defaultRedirectionUrl);
    return;
  }
}).addCase(vs.pending, (t, r) => {
  const n = t[r.meta.arg.id];
  n && (n.isLoading = !0);
}).addCase(vs.fulfilled, (t, r) => {
  const n = r.payload, i = t[r.meta.arg.id];
  i && (i.redirectTo = n || i.defaultRedirectionUrl, i.isLoading = !1);
}).addCase(vs.rejected, (t, r) => {
  const n = t[r.meta.arg.id];
  n && (n.isLoading = !1);
}));
function vu(e) {
  return {
    defaultRedirectionUrl: e,
    redirectTo: "",
    isLoading: !1
  };
}
new mt({
  ...v0,
  redirectionUrl: new Q({
    required: !0,
    emptyAllowed: !1
  }),
  overwrite: new ie({
    required: !1
  })
});
const Ti = (e, t) => {
  const r = e;
  return X(r[t]) ? X(e.additionalFields[t]) ? null : e.additionalFields[t] : r[t];
}, A0 = (e) => (t) => e.every((r) => !X(Ti(t, r))), x0 = (e) => (t) => e.every((r) => X(Ti(t, r))), k0 = (e, t) => (r) => {
  const n = hh(e, r);
  return t.some((i) => n.some((s) => `${s}`.toLowerCase() === i.toLowerCase()));
}, R0 = (e, t) => (r) => {
  const n = hh(e, r);
  return t.every((i) => n.every((s) => `${s}`.toLowerCase() !== i.toLowerCase()));
}, hh = (e, t) => {
  const r = Ti(t, e);
  return Pu(r) ? r : [r];
}, ph = {
  getProductProperty: Ti,
  fieldsMustBeDefined: A0,
  fieldsMustNotBeDefined: x0,
  fieldMustMatch: k0,
  fieldMustNotMatch: R0
};
function q0(e) {
  return e.type === "redirect";
}
class O0 {
  constructor(t) {
    te(this, "response");
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
    const t = this.response.preprocessingOutput.triggers.filter(q0);
    return t.length ? t[0].content : null;
  }
}
const F0 = w("standaloneSearchBox/register", (e) => q(e, {
  id: j,
  redirectionUrl: j,
  overwrite: new ie({ required: !1 })
})), E0 = w("standaloneSearchBox/updateRedirectionUrl", (e) => q(e, {
  id: j,
  redirectionUrl: j
})), D0 = w("standaloneSearchBox/reset", (e) => q(e, {
  id: j
})), T0 = w("standaloneSearchBox/updateAnalyticsToSearchFromLink", (e) => q(e, { id: j })), M0 = w("standaloneSearchBox/updateAnalyticsToOmniboxFromLink"), Ss = ne("standaloneSearchBox/fetchRedirect", async (e, { dispatch: t, getState: r, rejectWithValue: n, extra: { apiClient: i, validatePayload: s, navigatorContext: a } }) => {
  s(e, { id: new Q({ emptyAllowed: !1 }) });
  const o = await P0(r(), a), c = await i.plan(o);
  if (ht(c))
    return n(c.error);
  const { redirectionUrl: u } = new O0(c.success);
  return u && t(_0(u)), u || "";
}), _0 = (e) => vt("analytics/standaloneSearchBox/redirect", (t) => t.makeTriggerRedirect({ redirectedTo: e })), P0 = async (e, t) => ({
  accessToken: e.configuration.accessToken,
  organizationId: e.configuration.organizationId,
  url: e.configuration.search.apiBaseUrl ?? ir(e.configuration.organizationId, e.configuration.environment),
  locale: e.configuration.search.locale,
  timezone: e.configuration.search.timezone,
  q: e.query.q,
  ...e.context && { context: e.context.contextValues },
  ...e.pipeline && { pipeline: e.pipeline },
  ...e.searchHub && { searchHub: e.searchHub },
  ...e.query.enableQuerySyntax !== void 0 && {
    enableQuerySyntax: e.query.enableQuerySyntax
  },
  ...e.configuration.analytics.enabled && e.configuration.analytics.analyticsMode === "legacy" ? await va(e.configuration.analytics) : yi(e.configuration.analytics, t),
  ...e.configuration.search.authenticationProviders.length && {
    authentication: e.configuration.search.authenticationProviders.join(",")
  }
});
function U0() {
  return {};
}
se(U0(), (e) => e.addCase(F0, (t, r) => {
  const { id: n, redirectionUrl: i, overwrite: s } = r.payload;
  !s && n in t || (t[n] = ws(i));
}).addCase(D0, (t, r) => {
  const { id: n } = r.payload, i = t[n];
  if (i) {
    t[n] = ws(i.defaultRedirectionUrl);
    return;
  }
}).addCase(E0, (t, r) => {
  const { id: n, redirectionUrl: i } = r.payload;
  n in t && (t[n] = ws(i));
}).addCase(Ss.pending, (t, r) => {
  const n = t[r.meta.arg.id];
  n && (n.isLoading = !0);
}).addCase(Ss.fulfilled, (t, r) => {
  const n = r.payload, i = t[r.meta.arg.id];
  i && (i.redirectTo = n || i.defaultRedirectionUrl, i.isLoading = !1);
}).addCase(Ss.rejected, (t, r) => {
  const n = t[r.meta.arg.id];
  n && (n.isLoading = !1);
}).addCase(T0, (t, r) => {
  const n = t[r.payload.id];
  n && (n.analytics.cause = "searchFromLink");
}).addCase(M0, (t, r) => {
  const n = t[r.payload.id];
  n && (n.analytics.cause = "omniboxFromLink", n.analytics.metadata = r.payload.metadata);
}));
function ws(e) {
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
const Su = "demo-product-color-swatches", V0 = "swatch_hex", $0 = 5, L0 = 3, Q0 = "atomic/resolveResult", j0 = "atomic/selectChildProduct";
function wu(e, t) {
  return new CustomEvent(e, {
    detail: t,
    bubbles: !0,
    cancelable: !0,
    composed: !0
  });
}
function bu(e) {
  return e.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}
function gh(e) {
  if (Array.isArray(e)) {
    for (const n of e) {
      const i = gh(n);
      if (i)
        return i;
    }
    return null;
  }
  if (typeof e != "string" && typeof e != "number")
    return null;
  const r = `${e}`.trim().match(/^#?([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i);
  return r ? `#${r[1]}` : null;
}
function mh(e, t) {
  return ph.getProductProperty(e, t);
}
function Cu(e, t) {
  return t ? gh(mh(e, t)) : null;
}
function N0(e) {
  var r;
  const t = mh(e, "ec_color");
  return typeof t == "string" && t.trim() ? t.trim() : ((r = e.ec_name) == null ? void 0 : r.trim()) || "Color option";
}
function Iu(e) {
  const t = /* @__PURE__ */ new Set(), r = [];
  for (const n of e)
    !n.permanentid || t.has(n.permanentid) || (t.add(n.permanentid), r.push(n));
  return r;
}
function z0(e) {
  const t = e.children ?? [];
  return t.length > 0 ? Iu(t) : Iu([e]);
}
class B0 extends HTMLElement {
  constructor() {
    super(...arguments);
    te(this, "shadow", this.attachShadow({ mode: "open" }));
    te(this, "activeSwatchColor", "");
    te(this, "currentProduct", null);
    te(this, "swatches", []);
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
    var r, n;
    return ((r = this.getAttribute("field")) == null ? void 0 : r.trim()) || ((n = this.getAttribute("swatch-field")) == null ? void 0 : n.trim()) || V0;
  }
  get maxVisible() {
    const r = Number.parseInt(this.getAttribute("max-visible") ?? "", 10);
    return Number.isFinite(r) && r > 0 ? r : $0;
  }
  resolveProductContext() {
    let r = null;
    return this.dispatchEvent(
      wu(Q0, (n) => {
        r = n;
      })
    ), r;
  }
  buildSwatchItems(r) {
    const n = z0(r), i = /* @__PURE__ */ new Map();
    for (const s of n) {
      const a = Cu(s, this.field);
      !a || i.has(a) || i.set(a, {
        child: s,
        color: a,
        label: N0(s)
      });
    }
    return [...i.values()];
  }
  refresh(r = 0) {
    const n = this.resolveProductContext();
    if (!n) {
      if (r + 1 < L0) {
        queueMicrotask(() => this.refresh(r + 1));
        return;
      }
      this.hidden = !0, this.currentProduct = null, this.swatches = [], this.activeSwatchColor = "", this.shadow.replaceChildren();
      return;
    }
    if (this.currentProduct = n, this.activeSwatchColor = Cu(n, this.field) ?? "", this.swatches = this.buildSwatchItems(n), this.swatches.length <= 1) {
      this.hidden = !0, this.shadow.replaceChildren();
      return;
    }
    this.hidden = !1, this.render();
  }
  setActiveState() {
    const r = this.shadow.querySelectorAll("button[data-child-id]");
    for (const n of r) {
      const i = n.dataset.swatchColor === this.activeSwatchColor;
      n.classList.toggle("swatch-active", i), n.setAttribute("aria-pressed", String(i));
    }
  }
  selectChild(r) {
    const n = this.swatches.find((i) => i.child.permanentid === r);
    !n || n.color === this.activeSwatchColor || (this.activeSwatchColor = n.color, this.setActiveState(), this.dispatchEvent(
      wu(j0, {
        child: n.child
      })
    ));
  }
  bindSwatchEvents() {
    const r = this.shadow.querySelectorAll("button[data-child-id]"), n = this.shadow.querySelector('button[data-action="open-product-page"]');
    for (const i of r) {
      const s = i.dataset.childId;
      s && (i.addEventListener("mouseenter", () => this.selectChild(s)), i.addEventListener("focus", () => this.selectChild(s)), i.addEventListener("touchstart", (a) => {
        a.preventDefault(), a.stopPropagation(), this.selectChild(s);
      }), i.addEventListener("click", (a) => {
        a.preventDefault(), a.stopPropagation(), this.selectChild(s);
      }));
    }
    n == null || n.addEventListener("click", (i) => {
      i.preventDefault(), i.stopPropagation(), this.openProductPage();
    });
  }
  openProductPage() {
    var n;
    const r = this.closest("atomic-product");
    if (typeof (r == null ? void 0 : r.clickLinkContainer) == "function") {
      r.clickLinkContainer();
      return;
    }
    (n = this.currentProduct) != null && n.clickUri && window.location.assign(this.currentProduct.clickUri);
  }
  render() {
    const r = this.swatches.slice(0, this.maxVisible), n = Math.max(0, this.swatches.length - r.length);
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
        ${r.map((i) => {
      const s = bu(i.child.permanentid), a = bu(i.label), o = i.color === this.activeSwatchColor;
      return `
              <button
                type="button"
                class="swatch${o ? " swatch-active" : ""}"
                data-child-id="${s}"
                data-swatch-color="${i.color}"
                aria-label="Show ${a}"
                aria-pressed="${String(o)}"
                title="${a}"
                style="--swatch-color: ${i.color};"
              ></button>
            `;
    }).join("")}
        ${n > 0 ? `
              <button
                type="button"
                class="count count-button"
                data-action="open-product-page"
                aria-label="View ${n} more colors"
                title="View more colors"
              >+${n}</button>
            ` : ""}
      </div>
    `, this.bindSwatchEvents();
  }
}
customElements.get(Su) || customElements.define(Su, B0);
const Au = "demo-product-size-selector", H0 = "ec_size", Y0 = "swatch_hex", W0 = "ADD TO BAG:", xu = "Add to bag", K0 = "default title", G0 = 3, J0 = "atomic/resolveResult", Z0 = ["xxs", "xs", "s", "m", "l", "xl", "xxl"], X0 = new Map(
  Z0.map((e, t) => [e, t])
);
function ex(e, t) {
  return new CustomEvent(e, {
    detail: t,
    bubbles: !0,
    cancelable: !0,
    composed: !0
  });
}
function ot(e) {
  return e.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}
function Ja(e) {
  if (Array.isArray(e)) {
    for (const r of e) {
      const n = Ja(r);
      if (n)
        return n;
    }
    return null;
  }
  if (typeof e != "string" && typeof e != "number")
    return null;
  const t = `${e}`.trim();
  return t.length > 0 ? t : null;
}
function ku(e) {
  return !!(e && e.trim() && e.trim().toLowerCase() !== K0);
}
function Ru(e) {
  return X0.get(e.trim().toLowerCase()) ?? Number.POSITIVE_INFINITY;
}
function tx(e) {
  const t = Ja(e);
  if (!t)
    return null;
  const r = t.match(/^#?([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i);
  return r ? `#${r[1]}` : null;
}
function yh(e, t) {
  return ph.getProductProperty(e, t);
}
function qu(e, t) {
  return t ? Ja(yh(e, t)) : null;
}
function Ou(e, t) {
  return t ? tx(yh(e, t)) : null;
}
function Fu(e) {
  const t = /* @__PURE__ */ new Set(), r = [];
  for (const n of e)
    !n.permanentid || t.has(n.permanentid) || (t.add(n.permanentid), r.push(n));
  return r;
}
function rx(e) {
  const t = e.children ?? [];
  return t.length > 0 ? Fu(t) : Fu([e]);
}
function nx(e) {
  const t = e.ec_promo_price;
  if (typeof t == "number")
    return t;
  const r = e.ec_price;
  return typeof r == "number" ? r : void 0;
}
class ix extends HTMLElement {
  constructor() {
    super(...arguments);
    te(this, "shadow", this.attachShadow({ mode: "open" }));
    te(this, "currentProduct", null);
    te(this, "sizes", []);
    te(this, "selectedSizeKey", "");
    te(this, "addToBagChild", null);
    te(this, "hoverTarget", null);
    te(this, "removeVisibilityBindings", null);
    te(this, "restoreOverlayContainerPosition", null);
  }
  static get observedAttributes() {
    return ["field", "size-field", "swatch-field", "label"];
  }
  connectedCallback() {
    this.prepareInteractionTarget(), this.bindVisibilityState(), queueMicrotask(() => this.refresh());
  }
  disconnectedCallback() {
    var r, n;
    (r = this.removeVisibilityBindings) == null || r.call(this), this.removeVisibilityBindings = null, (n = this.restoreOverlayContainerPosition) == null || n.call(this), this.restoreOverlayContainerPosition = null;
  }
  attributeChangedCallback() {
    this.isConnected && queueMicrotask(() => this.refresh());
  }
  get field() {
    var r, n;
    return ((r = this.getAttribute("field")) == null ? void 0 : r.trim()) || ((n = this.getAttribute("size-field")) == null ? void 0 : n.trim()) || H0;
  }
  get swatchField() {
    var r;
    return ((r = this.getAttribute("swatch-field")) == null ? void 0 : r.trim()) || Y0;
  }
  get label() {
    var r;
    return ((r = this.getAttribute("label")) == null ? void 0 : r.trim()) || W0;
  }
  prepareInteractionTarget() {
    const r = this.closest("atomic-product-section-visual");
    if (this.hoverTarget = r ?? this.closest("atomic-product") ?? this.parentElement, !r || getComputedStyle(r).position !== "static")
      return;
    const n = r.style.position;
    r.style.position = "relative", this.restoreOverlayContainerPosition = () => {
      r.style.position = n;
    };
  }
  setOverlayVisible(r) {
    if (r) {
      this.setAttribute("data-visible", "true");
      return;
    }
    this.removeAttribute("data-visible");
  }
  bindVisibilityState() {
    const r = this.hoverTarget ?? this.closest("atomic-product-section-visual") ?? this.closest("atomic-product") ?? this.parentElement;
    if (!r || this.removeVisibilityBindings)
      return;
    this.hoverTarget = r;
    const n = () => this.setOverlayVisible(!0), i = (s) => {
      const a = s == null ? void 0 : s.relatedTarget;
      a instanceof Node && r.contains(a) || this.setOverlayVisible(!1);
    };
    r.addEventListener("mouseenter", n), r.addEventListener("mouseleave", i), r.addEventListener("focusin", n), r.addEventListener("focusout", i), r.addEventListener("touchstart", n, { passive: !0 }), this.removeVisibilityBindings = () => {
      r.removeEventListener("mouseenter", n), r.removeEventListener("mouseleave", i), r.removeEventListener("focusin", n), r.removeEventListener("focusout", i), r.removeEventListener("touchstart", n);
    };
  }
  resolveProductContext() {
    let r = null;
    return this.dispatchEvent(
      ex(J0, (n) => {
        r = n;
      })
    ), r;
  }
  getActiveSwatchProducts(r) {
    const n = Ou(r, this.swatchField), i = rx(r);
    if (!n)
      return i;
    const s = i.filter(
      (a) => Ou(a, this.swatchField) === n
    );
    return s.length > 0 ? s : i;
  }
  buildSizeItems(r) {
    const n = [], i = /* @__PURE__ */ new Set();
    let s = 0;
    for (const a of r) {
      const o = qu(a, this.field);
      if (!ku(o))
        continue;
      const c = o.toLowerCase();
      i.has(c) || (i.add(c), n.push({
        child: a,
        discoveryIndex: s,
        key: c,
        label: o
      }), s += 1);
    }
    return n.sort((a, o) => {
      const c = Ru(a.label), u = Ru(o.label);
      return c !== u ? c - u : a.discoveryIndex - o.discoveryIndex;
    });
  }
  refresh(r = 0) {
    var o, c;
    const n = this.resolveProductContext();
    if (!n) {
      if (r + 1 < G0) {
        queueMicrotask(() => this.refresh(r + 1));
        return;
      }
      this.hidden = !0, this.currentProduct = null, this.sizes = [], this.selectedSizeKey = "", this.shadow.replaceChildren();
      return;
    }
    this.currentProduct = n;
    const i = this.getActiveSwatchProducts(n);
    this.sizes = this.buildSizeItems(i), this.addToBagChild = i[0] ?? null;
    const s = qu(n, this.field), a = ku(s) ? s.toLowerCase() : "";
    if (this.selectedSizeKey = ((o = this.sizes.find((u) => u.key === a)) == null ? void 0 : o.key) || ((c = this.sizes[0]) == null ? void 0 : c.key) || "", this.sizes.length === 0 && !this.addToBagChild) {
      this.hidden = !0, this.removeAttribute("data-has-sizes"), this.addToBagChild = null, this.shadow.replaceChildren();
      return;
    }
    this.hidden = !1, this.toggleAttribute("data-has-sizes", this.sizes.length > 0), this.render();
  }
  createDataLayerPayload(r, n) {
    var o;
    const i = nx(r), s = [r.ec_color, n].filter(Boolean).join(" / ") || r.ec_name || r.permanentid;
    return {
      event: "add_to_cart",
      ecommerce: {
        items: [{
          item_id: r.ec_product_id || r.permanentid,
          item_name: r.ec_name || ((o = this.currentProduct) == null ? void 0 : o.ec_name) || r.permanentid,
          item_variant: s,
          quantity: 1,
          ...n ? { size: n } : {},
          ...r.ec_brand ? { item_brand: r.ec_brand } : {},
          ...r.ec_category[0] ? { item_category: r.ec_category[0] } : {},
          ...r.ec_item_group_id ? { item_group_id: r.ec_item_group_id } : {},
          ...typeof i == "number" ? { price: i } : {},
          ...r.ec_color ? { color: r.ec_color } : {}
        }],
        ...typeof i == "number" ? { value: i } : {}
      }
    };
  }
  handleSizeClick(r) {
    const n = this.sizes.find((a) => a.key === r);
    if (!n)
      return;
    this.selectedSizeKey = n.key, this.setActiveState();
    const i = this.createDataLayerPayload(n.child, n.label), s = window.dataLayer ?? [];
    s.push(i), window.dataLayer = s;
  }
  handleAddToBagClick() {
    if (!this.addToBagChild)
      return;
    const r = this.createDataLayerPayload(this.addToBagChild), n = window.dataLayer ?? [];
    n.push(r), window.dataLayer = n;
  }
  setActiveState() {
    const r = this.shadow.querySelectorAll("button[data-size-key]");
    for (const n of r) {
      const i = n.dataset.sizeKey === this.selectedSizeKey;
      n.classList.toggle("size-active", i), n.setAttribute("aria-pressed", String(i));
    }
  }
  bindSizeEvents() {
    const r = this.shadow.querySelectorAll("button[data-size-key]"), n = this.shadow.querySelector('button[data-action="add-to-bag"]');
    for (const i of r) {
      const s = i.dataset.sizeKey;
      s && i.addEventListener("click", (a) => {
        a.preventDefault(), a.stopPropagation(), this.handleSizeClick(s);
      });
    }
    n == null || n.addEventListener("click", (i) => {
      i.preventDefault(), i.stopPropagation(), this.handleAddToBagClick();
    });
  }
  render() {
    var n, i;
    const r = (i = (n = this.addToBagChild) == null ? void 0 : n.ec_name) != null && i.trim() ? `Add ${this.addToBagChild.ec_name.trim()} to bag` : xu;
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
              <div class="label">${ot(this.label)}</div>
              <div class="sizes" role="list">
                ${this.sizes.map((s) => {
      const a = s.key === this.selectedSizeKey;
      return `
                      <button
                        type="button"
                        class="size${a ? " size-active" : ""}"
                        data-size-key="${ot(s.key)}"
                        aria-label="Add size ${ot(s.label)} to bag"
                        aria-pressed="${String(a)}"
                        title="Add size ${ot(s.label)} to bag"
                      >${ot(s.label)}</button>
                    `;
    }).join("")}
              </div>
            ` : `
              <button
                type="button"
                class="cta-button"
                data-action="add-to-bag"
                aria-label="${ot(r)}"
                title="${ot(r)}"
              >${ot(xu)}</button>
            `}
      </div>
    `, this.bindSizeEvents();
  }
}
customElements.get(Au) || customElements.define(Au, ix);
