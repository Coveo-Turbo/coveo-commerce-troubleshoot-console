var jh = Object.defineProperty;
var Nh = (e, t, r) => t in e ? jh(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r;
var H = (e, t, r) => Nh(e, typeof t != "symbol" ? t + "" : t, r);
const zh = "coveo-headless-internal-state", Bh = Symbol.for(zh);
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
function Hh(e, t) {
  const r = `
  The following properties are invalid:

    ${e.join(`
	`)}
  
  ${t}
  `;
  return new Zu(r);
}
var Zu = class extends Error {
  constructor(e) {
    super(e), this.name = "SchemaValidationError";
  }
}, yt = class {
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
      throw Hh(n, t);
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
}, Ie = class {
  constructor(e = {}) {
    this.baseConfig = e;
  }
  validate(e) {
    return this.baseConfig.required && ee(e) ? "value is required." : null;
  }
  get default() {
    return this.baseConfig.default instanceof Function ? this.baseConfig.default() : this.baseConfig.default;
  }
  get required() {
    return this.baseConfig.required === !0;
  }
};
function ir(e) {
  return e === void 0;
}
function Yh(e) {
  return e === null;
}
function ee(e) {
  return ir(e) || Yh(e);
}
var ie = class {
  constructor(e = {}) {
    H(this, "value");
    this.value = new Ie(e);
  }
  validate(e) {
    const t = this.value.validate(e);
    return t || (Wh(e) ? null : "value is not a boolean.");
  }
  get default() {
    return this.value.default;
  }
  get required() {
    return this.value.required;
  }
};
function Wh(e) {
  return ir(e) || Xu(e);
}
function Xu(e) {
  return typeof e == "boolean";
}
var G = class {
  constructor(e = {}) {
    H(this, "value");
    this.config = e, this.value = new Ie(e);
  }
  validate(e) {
    const t = this.value.validate(e);
    return t || (Gh(e) ? e < this.config.min ? `minimum value of ${this.config.min} not respected.` : e > this.config.max ? `maximum value of ${this.config.max} not respected.` : null : "value is not a number.");
  }
  get default() {
    return this.value.default;
  }
  get required() {
    return this.value.required;
  }
};
function Gh(e) {
  return ir(e) || el(e);
}
function el(e) {
  return typeof e == "number" && !Number.isNaN(e);
}
var Kh = /^\d{4}(-\d\d(-\d\d(T\d\d:\d\d(:\d\d)?(\.\d+)?(([+-]\d\d:\d\d)|Z)?)?)?)?$/i, Q = class {
  constructor(e = {}) {
    H(this, "value");
    H(this, "config");
    this.config = {
      emptyAllowed: !0,
      url: !1,
      ...e
    }, this.value = new Ie(this.config);
  }
  validate(e) {
    const { emptyAllowed: t, url: r, regex: n, constrainTo: i, ISODate: s } = this.config, o = this.value.validate(e);
    if (o)
      return o;
    if (ir(e))
      return null;
    if (!tl(e))
      return "value is not a string.";
    if (!t && !e.length)
      return "value is an empty string.";
    if (r)
      try {
        new URL(e);
      } catch {
        return "value is not a valid URL.";
      }
    return n && !n.test(e) ? `value did not match provided regex ${n}` : i && !i.includes(e) ? `value should be one of: ${i.join(", ")}.` : s && !(Kh.test(e) && new Date(e).toString() !== "Invalid Date") ? "value is not a valid ISO8601 date string" : null;
  }
  get default() {
    return this.value.default;
  }
  get required() {
    return this.value.required;
  }
};
function tl(e) {
  return Object.prototype.toString.call(e) === "[object String]";
}
var z = class {
  constructor(e = {}) {
    H(this, "config");
    this.config = {
      options: { required: !1 },
      values: {},
      ...e
    };
  }
  validate(e) {
    if (ir(e))
      return this.config.options.required ? "value is required and is currently undefined" : null;
    if (!rl(e))
      return "value is not an object";
    for (const [r, n] of Object.entries(this.config.values))
      if (n.required && ee(e[r]))
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
function rl(e) {
  return e !== void 0 && typeof e == "object";
}
var ae = class {
  constructor(e = {}) {
    H(this, "value");
    this.config = e, this.value = new Ie(this.config);
  }
  validate(e) {
    if (!ee(e) && !Array.isArray(e))
      return "value is not an array";
    const t = this.value.validate(e);
    if (t !== null)
      return t;
    if (ee(e))
      return null;
    if (this.config.max !== void 0 && e.length > this.config.max)
      return `value contains more than ${this.config.max}`;
    if (this.config.min !== void 0 && e.length < this.config.min)
      return `value contains less than ${this.config.min}`;
    if (this.config.each !== void 0) {
      let r = "";
      return e.forEach((n) => {
        this.config.each.required && ee(n) && (r = `value is null or undefined: ${e.join(",")}`);
        const i = this.validatePrimitiveValue(n, this.config.each);
        i !== null && (r += ` ${i}`);
      }), r === "" ? null : r;
    }
    return null;
  }
  validatePrimitiveValue(e, t) {
    return Xu(e) || tl(e) || el(e) || rl(e) ? t.validate(e) : "value is not a primitive value";
  }
  get default() {
  }
  get required() {
    return this.value.required;
  }
};
function nl(e) {
  return Array.isArray(e);
}
var Er = class {
  constructor(e) {
    H(this, "value");
    this.config = e, this.value = new Ie(e);
  }
  validate(e) {
    const t = this.value.validate(e);
    return t !== null ? t : ir(e) || Object.values(this.config.enum).find(
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
function qs(e) {
  return `Minified Redux error #${e}; visit https://redux.js.org/Errors?code=${e} for the full message or use the non-minified dev environment for full errors. `;
}
var ji = () => Math.random().toString(36).substring(7).split("").join("."), Jh = {
  INIT: `@@redux/INIT${/* @__PURE__ */ ji()}`,
  REPLACE: `@@redux/REPLACE${/* @__PURE__ */ ji()}`,
  PROBE_UNKNOWN_ACTION: () => `@@redux/PROBE_UNKNOWN_ACTION${ji()}`
}, ha = Jh;
function Gt(e) {
  if (typeof e != "object" || e === null)
    return !1;
  let t = e;
  for (; Object.getPrototypeOf(t) !== null; )
    t = Object.getPrototypeOf(t);
  return Object.getPrototypeOf(e) === t || Object.getPrototypeOf(e) === null;
}
function Zh(e) {
  Object.keys(e).forEach((t) => {
    const r = e[t];
    if (typeof r(void 0, {
      type: ha.INIT
    }) > "u")
      throw new Error(qs(12));
    if (typeof r(void 0, {
      type: ha.PROBE_UNKNOWN_ACTION()
    }) > "u")
      throw new Error(qs(13));
  });
}
function Xh(e) {
  const t = Object.keys(e), r = {};
  for (let s = 0; s < t.length; s++) {
    const o = t[s];
    typeof e[o] == "function" && (r[o] = e[o]);
  }
  const n = Object.keys(r);
  let i;
  try {
    Zh(r);
  } catch (s) {
    i = s;
  }
  return function(o = {}, a) {
    if (i)
      throw i;
    let c = !1;
    const u = {};
    for (let l = 0; l < n.length; l++) {
      const d = n[l], p = r[d], g = o[d], h = p(g, a);
      if (typeof h > "u")
        throw a && a.type, new Error(qs(14));
      u[d] = h, c = c || h !== g;
    }
    return c = c || n.length !== Object.keys(o).length, c ? u : o;
  };
}
function il(e) {
  return Gt(e) && "type" in e && typeof e.type == "string";
}
var co = Symbol.for("immer-nothing"), Cr = Symbol.for("immer-draftable"), pe = Symbol.for("immer-state");
function Ce(e, ...t) {
  throw new Error(
    `[Immer] minified error nr: ${e}. Full error at: https://bit.ly/3cXEKWf`
  );
}
var De = Object, Ot = De.getPrototypeOf, Rr = "constructor", Ur = "prototype", Os = "configurable", zn = "enumerable", qn = "writable", qr = "value", Te = (e) => !!e && !!e[pe];
function qe(e) {
  var t;
  return e ? sl(e) || Vr(e) || !!e[Cr] || !!((t = e[Rr]) != null && t[Cr]) || Lr(e) || Qr(e) : !1;
}
var ep = De[Ur][Rr].toString(), pa = /* @__PURE__ */ new WeakMap();
function sl(e) {
  if (!e || !Kt(e))
    return !1;
  const t = Ot(e);
  if (t === null || t === De[Ur])
    return !0;
  const r = De.hasOwnProperty.call(t, Rr) && t[Rr];
  if (r === Object)
    return !0;
  if (!xt(r))
    return !1;
  let n = pa.get(r);
  return n === void 0 && (n = Function.toString.call(r), pa.set(r, n)), n === ep;
}
function tp(e) {
  return Te(e) || Ce(15, e), e[pe].base_;
}
function $r(e, t, r = !0) {
  Ft(e) === 0 ? (r ? Reflect.ownKeys(e) : De.keys(e)).forEach((i) => {
    t(i, e[i], e);
  }) : e.forEach((n, i) => t(i, n, e));
}
function Ft(e) {
  const t = e[pe];
  return t ? t.type_ : Vr(e) ? 1 : Lr(e) ? 2 : Qr(e) ? 3 : 0;
}
var Bt = (e, t, r = Ft(e)) => r === 2 ? e.has(t) : De[Ur].hasOwnProperty.call(e, t), Ke = (e, t, r = Ft(e)) => (
  // @ts-ignore
  r === 2 ? e.get(t) : e[t]
), Bn = (e, t, r, n = Ft(e)) => {
  n === 2 ? e.set(t, r) : n === 3 ? e.add(r) : e[t] = r;
};
function rp(e, t) {
  return e === t ? e !== 0 || 1 / e === 1 / t : e !== e && t !== t;
}
var Vr = Array.isArray, Lr = (e) => e instanceof Map, Qr = (e) => e instanceof Set, Kt = (e) => typeof e == "object", xt = (e) => typeof e == "function", Ni = (e) => typeof e == "boolean";
function np(e) {
  const t = +e;
  return Number.isInteger(t) && String(t) === e;
}
var ip = (e) => Kt(e) ? e == null ? void 0 : e[pe] : null, Je = (e) => e.copy_ || e.base_, uo = (e) => e.modified_ ? e.copy_ : e.base_;
function Fs(e, t) {
  if (Lr(e))
    return new Map(e);
  if (Qr(e))
    return new Set(e);
  if (Vr(e))
    return Array[Ur].slice.call(e);
  const r = sl(e);
  if (t === !0 || t === "class_only" && !r) {
    const n = De.getOwnPropertyDescriptors(e);
    delete n[pe];
    let i = Reflect.ownKeys(n);
    for (let s = 0; s < i.length; s++) {
      const o = i[s], a = n[o];
      a[qn] === !1 && (a[qn] = !0, a[Os] = !0), (a.get || a.set) && (n[o] = {
        [Os]: !0,
        [qn]: !0,
        // could live with !!desc.set as well here...
        [zn]: a[zn],
        [qr]: e[o]
      });
    }
    return De.create(Ot(e), n);
  } else {
    const n = Ot(e);
    if (n !== null && r)
      return { ...e };
    const i = De.create(n);
    return De.assign(i, e);
  }
}
function lo(e, t = !1) {
  return di(e) || Te(e) || !qe(e) || (Ft(e) > 1 && De.defineProperties(e, {
    set: an,
    add: an,
    clear: an,
    delete: an
  }), De.freeze(e), t && $r(
    e,
    (r, n) => {
      lo(n, !0);
    },
    !1
  )), e;
}
function sp() {
  Ce(2);
}
var an = {
  [qr]: sp
};
function di(e) {
  return e === null || !Kt(e) ? !0 : De.isFrozen(e);
}
var Hn = "MapSet", Yn = "Patches", ga = "ArrayMethods", Wn = {};
function Dt(e) {
  const t = Wn[e];
  return t || Ce(0, e), t;
}
var ma = (e) => !!Wn[e];
function op(e, t) {
  Wn[e] || (Wn[e] = t);
}
var Or, ol = () => Or, ap = (e, t) => ({
  drafts_: [],
  parent_: e,
  immer_: t,
  // Whenever the modified draft contains a draft from another scope, we
  // need to prevent auto-freezing so the unowned draft can be finalized.
  canAutoFreeze_: !0,
  unfinalizedDrafts_: 0,
  handledSet_: /* @__PURE__ */ new Set(),
  processedForPatches_: /* @__PURE__ */ new Set(),
  mapSetPlugin_: ma(Hn) ? Dt(Hn) : void 0,
  arrayMethodsPlugin_: ma(ga) ? Dt(ga) : void 0
});
function ya(e, t) {
  t && (e.patchPlugin_ = Dt(Yn), e.patches_ = [], e.inversePatches_ = [], e.patchListener_ = t);
}
function Ds(e) {
  Ts(e), e.drafts_.forEach(cp), e.drafts_ = null;
}
function Ts(e) {
  e === Or && (Or = e.parent_);
}
var va = (e) => Or = ap(Or, e);
function cp(e) {
  const t = e[pe];
  t.type_ === 0 || t.type_ === 1 ? t.revoke_() : t.revoked_ = !0;
}
function Sa(e, t) {
  t.unfinalizedDrafts_ = t.drafts_.length;
  const r = t.drafts_[0];
  if (e !== void 0 && e !== r) {
    r[pe].modified_ && (Ds(t), Ce(4)), qe(e) && (e = wa(t, e));
    const { patchPlugin_: i } = t;
    i && i.generateReplacementPatches_(
      r[pe].base_,
      e,
      t
    );
  } else
    e = wa(t, r);
  return up(t, e, !0), Ds(t), t.patches_ && t.patchListener_(t.patches_, t.inversePatches_), e !== co ? e : void 0;
}
function wa(e, t) {
  if (di(t))
    return t;
  const r = t[pe];
  if (!r)
    return Gn(t, e.handledSet_, e);
  if (!fi(r, e))
    return t;
  if (!r.modified_)
    return r.base_;
  if (!r.finalized_) {
    const { callbacks_: n } = r;
    if (n)
      for (; n.length > 0; )
        n.pop()(e);
    ul(r, e);
  }
  return r.copy_;
}
function up(e, t, r = !1) {
  !e.parent_ && e.immer_.autoFreeze_ && e.canAutoFreeze_ && lo(t, r);
}
function al(e) {
  e.finalized_ = !0, e.scope_.unfinalizedDrafts_--;
}
var fi = (e, t) => e.scope_ === t, lp = [];
function cl(e, t, r, n) {
  const i = Je(e), s = e.type_;
  if (n !== void 0 && Ke(i, n, s) === t) {
    Bn(i, n, r, s);
    return;
  }
  if (!e.draftLocations_) {
    const a = e.draftLocations_ = /* @__PURE__ */ new Map();
    $r(i, (c, u) => {
      if (Te(u)) {
        const l = a.get(u) || [];
        l.push(c), a.set(u, l);
      }
    });
  }
  const o = e.draftLocations_.get(t) ?? lp;
  for (const a of o)
    Bn(i, a, r, s);
}
function dp(e, t, r) {
  e.callbacks_.push(function(i) {
    var a;
    const s = t;
    if (!s || !fi(s, i))
      return;
    (a = i.mapSetPlugin_) == null || a.fixSetContents(s);
    const o = uo(s);
    cl(e, s.draft_ ?? s, o, r), ul(s, i);
  });
}
function ul(e, t) {
  var n;
  if (e.modified_ && !e.finalized_ && (e.type_ === 3 || e.type_ === 1 && e.allIndicesReassigned_ || (((n = e.assigned_) == null ? void 0 : n.size) ?? 0) > 0)) {
    const { patchPlugin_: i } = t;
    if (i) {
      const s = i.getPath(e);
      s && i.generatePatches_(e, s, t);
    }
    al(e);
  }
}
function fp(e, t, r) {
  const { scope_: n } = e;
  if (Te(r)) {
    const i = r[pe];
    fi(i, n) && i.callbacks_.push(function() {
      On(e);
      const o = uo(i);
      cl(e, r, o, t);
    });
  } else qe(r) && e.callbacks_.push(function() {
    const s = Je(e);
    e.type_ === 3 ? s.has(r) && Gn(r, n.handledSet_, n) : Ke(s, t, e.type_) === r && n.drafts_.length > 1 && (e.assigned_.get(t) ?? !1) === !0 && e.copy_ && Gn(
      Ke(e.copy_, t, e.type_),
      n.handledSet_,
      n
    );
  });
}
function Gn(e, t, r) {
  return !r.immer_.autoFreeze_ && r.unfinalizedDrafts_ < 1 || Te(e) || t.has(e) || !qe(e) || di(e) || (t.add(e), $r(e, (n, i) => {
    if (Te(i)) {
      const s = i[pe];
      if (fi(s, r)) {
        const o = uo(s);
        Bn(e, n, o, e.type_), al(s);
      }
    } else qe(i) && Gn(i, t, r);
  })), e;
}
function hp(e, t) {
  const r = Vr(e), n = {
    type_: r ? 1 : 0,
    // Track which produce call this is associated with.
    scope_: t ? t.scope_ : ol(),
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
  let i = n, s = Kn;
  r && (i = [n], s = Fr);
  const { revoke: o, proxy: a } = Proxy.revocable(i, s);
  return n.draft_ = a, n.revoke_ = o, [a, n];
}
var Kn = {
  get(e, t) {
    if (t === pe)
      return e;
    let r = e.scope_.arrayMethodsPlugin_;
    const n = e.type_ === 1 && typeof t == "string";
    if (n && r != null && r.isArrayOperationMethod(t))
      return r.createMethodInterceptor(e, t);
    const i = Je(e);
    if (!Bt(i, t, e.type_))
      return gp(e, i, t);
    const s = i[t];
    if (e.finalized_ || !qe(s) || n && e.operationMethod && (r != null && r.isMutatingArrayMethod(
      e.operationMethod
    )) && np(t))
      return s;
    if (s === zi(e.base_, t) || pp(e, t, s)) {
      On(e);
      const o = e.type_ === 1 ? +t : t, a = Ms(e.scope_, s, e, o);
      return e.copy_[o] = a;
    }
    return s;
  },
  has(e, t) {
    return t in Je(e);
  },
  ownKeys(e) {
    return Reflect.ownKeys(Je(e));
  },
  set(e, t, r) {
    const n = ll(Je(e), t);
    if (n != null && n.set)
      return n.set.call(e.draft_, r), !0;
    if (!e.modified_) {
      const i = zi(Je(e), t), s = i == null ? void 0 : i[pe];
      if (s && s.base_ === r)
        return e.copy_[t] = r, e.assigned_.set(t, !1), !0;
      if (rp(r, i) && (r !== void 0 || Bt(e.base_, t, e.type_)))
        return !0;
      On(e), _s(e);
    }
    return e.copy_[t] === r && // special case: handle new props with value 'undefined'
    (r !== void 0 || Bt(e.copy_, t, e.type_)) || // special case: NaN
    Number.isNaN(r) && Number.isNaN(e.copy_[t]) || (e.copy_[t] = r, e.assigned_.set(t, !0), fp(e, t, r)), !0;
  },
  deleteProperty(e, t) {
    return On(e), zi(e.base_, t) !== void 0 || t in e.base_ ? (e.assigned_.set(t, !1), _s(e)) : e.assigned_.delete(t), e.copy_ && delete e.copy_[t], !0;
  },
  // Note: We never coerce `desc.value` into an Immer draft, because we can't make
  // the same guarantee in ES5 mode.
  getOwnPropertyDescriptor(e, t) {
    const r = Je(e), n = Reflect.getOwnPropertyDescriptor(r, t);
    return n && {
      [qn]: !0,
      [Os]: e.type_ !== 1 || t !== "length",
      [zn]: n[zn],
      [qr]: r[t]
    };
  },
  defineProperty() {
    Ce(11);
  },
  getPrototypeOf(e) {
    return Ot(e.base_);
  },
  setPrototypeOf() {
    Ce(12);
  }
}, Fr = {};
for (let e in Kn) {
  let t = Kn[e];
  Fr[e] = function() {
    const r = arguments;
    return r[0] = r[0][0], t.apply(this, r);
  };
}
Fr.deleteProperty = function(e, t) {
  return Fr.set.call(this, e, t, void 0);
};
Fr.set = function(e, t, r) {
  return Kn.set.call(this, e[0], t, r, e[0]);
};
function zi(e, t) {
  const r = e[pe];
  return (r ? Je(r) : e)[t];
}
function pp(e, t, r) {
  var n;
  return e.type_ !== 1 || !e.allIndicesReassigned_ || (n = e.assigned_) != null && n.get(t) || !qe(r) || r[pe] ? !1 : e.baseRefs_.has(r);
}
function gp(e, t, r) {
  var i;
  const n = ll(t, r);
  return n ? qr in n ? n[qr] : (
    // This is a very special case, if the prop is a getter defined by the
    // prototype, we should invoke it with the draft as context!
    (i = n.get) == null ? void 0 : i.call(e.draft_)
  ) : void 0;
}
function ll(e, t) {
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
function _s(e) {
  e.modified_ || (e.modified_ = !0, e.parent_ && _s(e.parent_));
}
function On(e) {
  e.copy_ || (e.assigned_ = /* @__PURE__ */ new Map(), e.copy_ = Fs(
    e.base_,
    e.scope_.immer_.useStrictShallowCopy_
  ));
}
var mp = class {
  constructor(e) {
    this.autoFreeze_ = !0, this.useStrictShallowCopy_ = !1, this.useStrictIteration_ = !1, this.produce = (t, r, n) => {
      if (xt(t) && !xt(r)) {
        const s = r;
        r = t;
        const o = this;
        return function(c = s, ...u) {
          return o.produce(c, (l) => r.call(this, l, ...u));
        };
      }
      xt(r) || Ce(6), n !== void 0 && !xt(n) && Ce(7);
      let i;
      if (qe(t)) {
        const s = va(this), o = Ms(s, t, void 0);
        let a = !0;
        try {
          i = r(o), a = !1;
        } finally {
          a ? Ds(s) : Ts(s);
        }
        return ya(s, n), Sa(i, s);
      } else if (!t || !Kt(t)) {
        if (i = r(t), i === void 0 && (i = t), i === co && (i = void 0), this.autoFreeze_ && lo(i, !0), n) {
          const s = [], o = [];
          Dt(Yn).generateReplacementPatches_(t, i, {
            patches_: s,
            inversePatches_: o
          }), n(s, o);
        }
        return i;
      } else
        Ce(1, t);
    }, this.produceWithPatches = (t, r) => {
      if (xt(t))
        return (o, ...a) => this.produceWithPatches(o, (c) => t(c, ...a));
      let n, i;
      return [this.produce(t, r, (o, a) => {
        n = o, i = a;
      }), n, i];
    }, Ni(e == null ? void 0 : e.autoFreeze) && this.setAutoFreeze(e.autoFreeze), Ni(e == null ? void 0 : e.useStrictShallowCopy) && this.setUseStrictShallowCopy(e.useStrictShallowCopy), Ni(e == null ? void 0 : e.useStrictIteration) && this.setUseStrictIteration(e.useStrictIteration);
  }
  createDraft(e) {
    qe(e) || Ce(8), Te(e) && (e = dl(e));
    const t = va(this), r = Ms(t, e, void 0);
    return r[pe].isManual_ = !0, Ts(t), r;
  }
  finishDraft(e, t) {
    const r = e && e[pe];
    (!r || !r.isManual_) && Ce(9);
    const { scope_: n } = r;
    return ya(n, t), Sa(void 0, n);
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
    const n = Dt(Yn).applyPatches_;
    return Te(e) ? n(e, t) : this.produce(
      e,
      (i) => n(i, t)
    );
  }
};
function Ms(e, t, r, n) {
  const [i, s] = Lr(t) ? Dt(Hn).proxyMap_(t, r) : Qr(t) ? Dt(Hn).proxySet_(t, r) : hp(t, r);
  return ((r == null ? void 0 : r.scope_) ?? ol()).drafts_.push(i), s.callbacks_ = (r == null ? void 0 : r.callbacks_) ?? [], s.key_ = n, r && n !== void 0 ? dp(r, s, n) : s.callbacks_.push(function(c) {
    var l;
    (l = c.mapSetPlugin_) == null || l.fixSetContents(s);
    const { patchPlugin_: u } = c;
    s.modified_ && u && u.generatePatches_(s, [], c);
  }), i;
}
function dl(e) {
  return Te(e) || Ce(10, e), fl(e);
}
function fl(e) {
  if (!qe(e) || di(e))
    return e;
  const t = e[pe];
  let r, n = !0;
  if (t) {
    if (!t.modified_)
      return t.base_;
    t.finalized_ = !0, r = Fs(e, t.scope_.immer_.useStrictShallowCopy_), n = t.scope_.immer_.shouldUseStrictIteration();
  } else
    r = Fs(e, !0);
  return $r(
    r,
    (i, s) => {
      Bn(r, i, fl(s));
    },
    n
  ), t && (t.finalized_ = !1), r;
}
function yp() {
  function t(h, f = []) {
    if (h.key_ !== void 0) {
      const m = h.parent_.copy_ ?? h.parent_.base_, C = ip(Ke(m, h.key_)), k = Ke(m, h.key_);
      if (k === void 0 || k !== h.draft_ && k !== h.base_ && k !== h.copy_ || C != null && C.base_ !== h.base_)
        return null;
      const b = h.parent_.type_ === 3;
      let S;
      if (b) {
        const v = h.parent_;
        S = Array.from(v.drafts_.keys()).indexOf(h.key_);
      } else
        S = h.key_;
      if (!(b && m.size > S || Bt(m, S)))
        return null;
      f.push(S);
    }
    if (h.parent_)
      return t(h.parent_, f);
    f.reverse();
    try {
      r(h.copy_, f);
    } catch {
      return null;
    }
    return f;
  }
  function r(h, f) {
    let m = h;
    for (let C = 0; C < f.length - 1; C++) {
      const k = f[C];
      if (m = Ke(m, k), !Kt(m) || m === null)
        throw new Error(`Cannot resolve path at '${f.join("/")}'`);
    }
    return m;
  }
  const n = "replace", i = "add", s = "remove";
  function o(h, f, m) {
    if (h.scope_.processedForPatches_.has(h))
      return;
    h.scope_.processedForPatches_.add(h);
    const { patches_: C, inversePatches_: k } = m;
    switch (h.type_) {
      case 0:
      case 2:
        return c(
          h,
          f,
          C,
          k
        );
      case 1:
        return a(
          h,
          f,
          C,
          k
        );
      case 3:
        return u(
          h,
          f,
          C,
          k
        );
    }
  }
  function a(h, f, m, C) {
    let { base_: k, assigned_: b } = h, S = h.copy_;
    S.length < k.length && ([k, S] = [S, k], [m, C] = [C, m]);
    const v = h.allIndicesReassigned_ === !0;
    for (let O = 0; O < k.length; O++) {
      const _ = S[O], $ = k[O];
      if ((v || (b == null ? void 0 : b.get(O.toString()))) && _ !== $) {
        const x = _ == null ? void 0 : _[pe];
        if (x && x.modified_)
          continue;
        const I = f.concat([O]);
        m.push({
          op: n,
          path: I,
          // Need to maybe clone it, as it can in fact be the original value
          // due to the base/copy inversion at the start of this function
          value: g(_)
        }), C.push({
          op: n,
          path: I,
          value: g($)
        });
      }
    }
    for (let O = k.length; O < S.length; O++) {
      const _ = f.concat([O]);
      m.push({
        op: i,
        path: _,
        // Need to maybe clone it, as it can in fact be the original value
        // due to the base/copy inversion at the start of this function
        value: g(S[O])
      });
    }
    for (let O = S.length - 1; k.length <= O; --O) {
      const _ = f.concat([O]);
      C.push({
        op: s,
        path: _
      });
    }
  }
  function c(h, f, m, C) {
    const { base_: k, copy_: b, type_: S } = h;
    $r(h.assigned_, (v, O) => {
      const _ = Ke(k, v, S), $ = Ke(b, v, S), A = O ? Bt(k, v) ? n : i : s;
      if (_ === $ && A === n)
        return;
      const x = f.concat(v);
      m.push(
        A === s ? { op: A, path: x } : { op: A, path: x, value: g($) }
      ), C.push(
        A === i ? { op: s, path: x } : A === s ? { op: i, path: x, value: g(_) } : { op: n, path: x, value: g(_) }
      );
    });
  }
  function u(h, f, m, C) {
    let { base_: k, copy_: b } = h, S = 0;
    k.forEach((v) => {
      if (!b.has(v)) {
        const O = f.concat([S]);
        m.push({
          op: s,
          path: O,
          value: v
        }), C.unshift({
          op: i,
          path: O,
          value: v
        });
      }
      S++;
    }), S = 0, b.forEach((v) => {
      if (!k.has(v)) {
        const O = f.concat([S]);
        m.push({
          op: i,
          path: O,
          value: v
        }), C.unshift({
          op: s,
          path: O,
          value: v
        });
      }
      S++;
    });
  }
  function l(h, f, m) {
    const { patches_: C, inversePatches_: k } = m;
    C.push({
      op: n,
      path: [],
      value: f === co ? void 0 : f
    }), k.push({
      op: n,
      path: [],
      value: h
    });
  }
  function d(h, f) {
    return f.forEach((m) => {
      const { path: C, op: k } = m;
      let b = h;
      for (let _ = 0; _ < C.length - 1; _++) {
        const $ = Ft(b);
        let A = C[_];
        typeof A != "string" && typeof A != "number" && (A = "" + A), ($ === 0 || $ === 1) && (A === "__proto__" || A === Rr) && Ce(19), xt(b) && A === Ur && Ce(19), b = Ke(b, A), (b === null || !Kt(b)) && Ce(18, C.join("/"));
      }
      const S = Ft(b), v = p(m.value), O = C[C.length - 1];
      switch (k) {
        case n:
          switch (S) {
            case 2:
              return b.set(O, v);
            case 3:
              Ce(16);
            default:
              return b[O] = v;
          }
        case i:
          switch (S) {
            case 1:
              return O === "-" ? b.push(v) : b.splice(O, 0, v);
            case 2:
              return b.set(O, v);
            case 3:
              return b.add(v);
            default:
              return b[O] = v;
          }
        case s:
          switch (S) {
            case 1:
              return b.splice(O, 1);
            case 2:
              return b.delete(O);
            case 3:
              return b.delete(m.value);
            default:
              return delete b[O];
          }
        default:
          Ce(17, k);
      }
    }), h;
  }
  function p(h) {
    if (!qe(h))
      return h;
    if (Vr(h))
      return h.map(p);
    if (Lr(h))
      return new Map(
        Array.from(h.entries()).map(([m, C]) => [m, p(C)])
      );
    if (Qr(h))
      return new Set(Array.from(h).map(p));
    const f = Object.create(Ot(h));
    for (const m in h)
      f[m] = p(h[m]);
    return Bt(h, Cr) && (f[Cr] = h[Cr]), f;
  }
  function g(h) {
    return Te(h) ? p(h) : h;
  }
  op(Yn, {
    applyPatches_: d,
    generatePatches_: o,
    generateReplacementPatches_: l,
    getPath: t
  });
}
var Dr = new mp(), jr = Dr.produce, hl = /* @__PURE__ */ Dr.produceWithPatches.bind(Dr), ba = /* @__PURE__ */ Dr.applyPatches.bind(Dr);
function vp(e, t = `expected a function, instead received ${typeof e}`) {
  if (typeof e != "function")
    throw new TypeError(t);
}
function Sp(e, t = "expected all items to be functions, instead received the following types: ") {
  if (!e.every((r) => typeof r == "function")) {
    const r = e.map(
      (n) => typeof n == "function" ? `function ${n.name || "unnamed"}()` : typeof n
    ).join(", ");
    throw new TypeError(`${t}[${r}]`);
  }
}
var Ca = (e) => Array.isArray(e) ? e : [e];
function wp(e) {
  const t = Array.isArray(e[0]) ? e[0] : e;
  return Sp(
    t,
    "createSelector expects all input-selectors to be functions, but received the following types: "
  ), t;
}
function bp(e, t) {
  const r = [], { length: n } = e;
  for (let i = 0; i < n; i++)
    r.push(e[i].apply(null, t));
  return r;
}
var Cp = class {
  constructor(e) {
    this.value = e;
  }
  deref() {
    return this.value;
  }
}, Ip = () => typeof WeakRef > "u" ? Cp : WeakRef, pl = /* @__PURE__ */ Ip(), Ap = 0, Ia = 1;
function cn() {
  return {
    s: Ap,
    v: void 0,
    o: null,
    p: null
  };
}
function xp(e) {
  return e instanceof pl ? e.deref() : e;
}
function Jn(e, t = {}) {
  let r = cn();
  const { resultEqualityCheck: n } = t;
  let i, s = 0;
  function o() {
    let a = r;
    const { length: c } = arguments;
    for (let d = 0, p = c; d < p; d++) {
      const g = arguments[d];
      if (typeof g == "function" || typeof g == "object" && g !== null) {
        let h = a.o;
        h === null && (a.o = h = /* @__PURE__ */ new WeakMap());
        const f = h.get(g);
        f === void 0 ? (a = cn(), h.set(g, a)) : a = f;
      } else {
        let h = a.p;
        h === null && (a.p = h = /* @__PURE__ */ new Map());
        const f = h.get(g);
        f === void 0 ? (a = cn(), h.set(g, a)) : a = f;
      }
    }
    const u = a;
    let l;
    if (a.s === Ia)
      l = a.v;
    else if (l = e.apply(null, arguments), s++, n) {
      const d = xp(i);
      d != null && n(d, l) && (l = d, s !== 0 && s--), i = typeof l == "object" && l !== null || typeof l == "function" ? /* @__PURE__ */ new pl(l) : l;
    }
    return u.s = Ia, u.v = l, l;
  }
  return o.clearCache = () => {
    r = cn(), o.resetResultsCount();
  }, o.resultsCount = () => s, o.resetResultsCount = () => {
    s = 0;
  }, o;
}
function kp(e, ...t) {
  const r = typeof e == "function" ? {
    memoize: e,
    memoizeOptions: t
  } : e, n = (...i) => {
    let s = 0, o = 0, a, c = {}, u = i.pop();
    typeof u == "object" && (c = u, u = i.pop()), vp(
      u,
      `createSelector expects an output function after the inputs, but received: [${typeof u}]`
    );
    const l = {
      ...r,
      ...c
    }, {
      memoize: d,
      memoizeOptions: p = [],
      argsMemoize: g = Jn,
      argsMemoizeOptions: h = []
    } = l, f = Ca(p), m = Ca(h), C = wp(i), k = d(function() {
      return s++, u.apply(
        null,
        arguments
      );
    }, ...f), b = g(function() {
      o++;
      const v = bp(
        C,
        arguments
      );
      return a = k.apply(null, v), a;
    }, ...m);
    return Object.assign(b, {
      resultFunc: u,
      memoizedResultFunc: k,
      dependencies: C,
      dependencyRecomputations: () => o,
      resetDependencyRecomputations: () => {
        o = 0;
      },
      lastResult: () => a,
      recomputations: () => s,
      resetRecomputations: () => {
        s = 0;
      },
      memoize: d,
      argsMemoize: g
    });
  };
  return Object.assign(n, {
    withTypes: () => n
  }), n;
}
var fe = /* @__PURE__ */ kp(Jn), Ep = (e) => e && typeof e.match == "function";
function w(e, t) {
  function r(...n) {
    if (t) {
      let i = t(...n);
      if (!i)
        throw new Error(et(0));
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
  return r.toString = () => `${e}`, r.type = e, r.match = (n) => il(n) && n.type === e, r;
}
function Aa(e) {
  return qe(e) ? jr(e, () => {
  }) : e;
}
function un(e, t, r) {
  return e.has(t) ? e.get(t) : e.set(t, r(t)).get(t);
}
var fo = "RTK_autoBatch", hr = () => (e) => ({
  payload: e,
  meta: {
    [fo]: !0
  }
});
function gl(e) {
  const t = {}, r = [];
  let n;
  const i = {
    addCase(s, o) {
      const a = typeof s == "string" ? s : s.type;
      if (!a)
        throw new Error(et(28));
      if (a in t)
        throw new Error(et(29));
      return t[a] = o, i;
    },
    addAsyncThunk(s, o) {
      return o.pending && (t[s.pending.type] = o.pending), o.rejected && (t[s.rejected.type] = o.rejected), o.fulfilled && (t[s.fulfilled.type] = o.fulfilled), o.settled && r.push({
        matcher: s.settled,
        reducer: o.settled
      }), i;
    },
    addMatcher(s, o) {
      return r.push({
        matcher: s,
        reducer: o
      }), i;
    },
    addDefaultCase(s) {
      return n = s, i;
    }
  };
  return e(i), [t, r, n];
}
function Rp(e) {
  return typeof e == "function";
}
function se(e, t) {
  let [r, n, i] = gl(t), s;
  if (Rp(e))
    s = () => Aa(e());
  else {
    const a = Aa(e);
    s = () => a;
  }
  function o(a = s(), c) {
    let u = [r[c.type], ...n.filter(({
      matcher: l
    }) => l(c)).map(({
      reducer: l
    }) => l)];
    return u.filter((l) => !!l).length === 0 && (u = [i]), u.reduce((l, d) => {
      if (d)
        if (Te(l)) {
          const g = d(l, c);
          return g === void 0 ? l : g;
        } else {
          if (qe(l))
            return jr(l, (p) => d(p, c));
          {
            const p = d(l, c);
            if (p === void 0) {
              if (l === null)
                return l;
              throw Error("A case reducer on a non-draftable value must not return undefined");
            }
            return p;
          }
        }
      return l;
    }, a);
  }
  return o.getInitialState = s, o;
}
var ml = (e, t) => Ep(e) ? e.match(t) : e(t);
function tt(...e) {
  return (t) => e.some((r) => ml(r, t));
}
function Ir(...e) {
  return (t) => e.every((r) => ml(r, t));
}
function hi(e, t) {
  if (!e || !e.meta) return !1;
  const r = typeof e.meta.requestId == "string", n = t.indexOf(e.meta.requestStatus) > -1;
  return r && n;
}
function Nr(e) {
  return typeof e[0] == "function" && "pending" in e[0] && "fulfilled" in e[0] && "rejected" in e[0];
}
function ho(...e) {
  return e.length === 0 ? (t) => hi(t, ["pending"]) : Nr(e) ? tt(...e.map((t) => t.pending)) : ho()(e[0]);
}
function Jt(...e) {
  return e.length === 0 ? (t) => hi(t, ["rejected"]) : Nr(e) ? tt(...e.map((t) => t.rejected)) : Jt()(e[0]);
}
function pi(...e) {
  const t = (r) => r && r.meta && r.meta.rejectedWithValue;
  return e.length === 0 ? Ir(Jt(...e), t) : Nr(e) ? Ir(Jt(...e), t) : pi()(e[0]);
}
function gt(...e) {
  return e.length === 0 ? (t) => hi(t, ["fulfilled"]) : Nr(e) ? tt(...e.map((t) => t.fulfilled)) : gt()(e[0]);
}
function Ps(...e) {
  return e.length === 0 ? (t) => hi(t, ["pending", "fulfilled", "rejected"]) : Nr(e) ? tt(...e.flatMap((t) => [t.pending, t.rejected, t.fulfilled])) : Ps()(e[0]);
}
var qp = "ModuleSymbhasOwnPr-0123456789ABCDEFGHNRVfgctiUvz_KqYTJkLxpZXIjQW", po = (e = 21) => {
  let t = "", r = e;
  for (; r--; )
    t += qp[Math.random() * 64 | 0];
  return t;
}, Op = ["name", "message", "stack", "code"], Bi = class {
  constructor(e, t) {
    H(this, "payload");
    H(this, "meta");
    /*
    type-only property to distinguish between RejectWithValue and FulfillWithMeta
    does not exist at runtime
    */
    H(this, "_type");
    this.payload = e, this.meta = t;
  }
}, xa = class {
  constructor(e, t) {
    H(this, "payload");
    H(this, "meta");
    /*
    type-only property to distinguish between RejectWithValue and FulfillWithMeta
    does not exist at runtime
    */
    H(this, "_type");
    this.payload = e, this.meta = t;
  }
}, Fp = (e) => {
  if (typeof e == "object" && e !== null) {
    const t = {};
    for (const r of Op)
      typeof e[r] == "string" && (t[r] = e[r]);
    return t;
  }
  return {
    message: String(e)
  };
}, ka = "External signal was aborted", ne = /* @__PURE__ */ (() => {
  function e(t, r, n) {
    const i = w(t + "/fulfilled", (c, u, l, d) => ({
      payload: c,
      meta: {
        ...d || {},
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
    })), o = w(t + "/rejected", (c, u, l, d, p) => ({
      payload: d,
      error: (n && n.serializeError || Fp)(c || "Rejected"),
      meta: {
        ...p || {},
        arg: l,
        requestId: u,
        rejectedWithValue: !!d,
        requestStatus: "rejected",
        aborted: (c == null ? void 0 : c.name) === "AbortError",
        condition: (c == null ? void 0 : c.name) === "ConditionError"
      }
    }));
    function a(c, {
      signal: u
    } = {}) {
      return (l, d, p) => {
        const g = n != null && n.idGenerator ? n.idGenerator(c) : po(), h = new AbortController();
        let f, m;
        function C(b) {
          m = b, h.abort();
        }
        u && (u.aborted ? C(ka) : u.addEventListener("abort", () => C(ka), {
          once: !0
        }));
        const k = (async function() {
          var v, O;
          let b;
          try {
            let _ = (v = n == null ? void 0 : n.condition) == null ? void 0 : v.call(n, c, {
              getState: d,
              extra: p
            });
            if (Tp(_) && (_ = await _), _ === !1 || h.signal.aborted)
              throw {
                name: "ConditionError",
                message: "Aborted due to condition callback returning false."
              };
            const $ = new Promise((A, x) => {
              f = () => {
                x({
                  name: "AbortError",
                  message: m || "Aborted"
                });
              }, h.signal.addEventListener("abort", f, {
                once: !0
              });
            });
            l(s(g, c, (O = n == null ? void 0 : n.getPendingMeta) == null ? void 0 : O.call(n, {
              requestId: g,
              arg: c
            }, {
              getState: d,
              extra: p
            }))), b = await Promise.race([$, Promise.resolve(r(c, {
              dispatch: l,
              getState: d,
              extra: p,
              requestId: g,
              signal: h.signal,
              abort: C,
              rejectWithValue: ((A, x) => new Bi(A, x)),
              fulfillWithValue: ((A, x) => new xa(A, x))
            })).then((A) => {
              if (A instanceof Bi)
                throw A;
              return A instanceof xa ? i(A.payload, g, c, A.meta) : i(A, g, c);
            })]);
          } catch (_) {
            b = _ instanceof Bi ? o(null, g, c, _.payload, _.meta) : o(_, g, c);
          } finally {
            f && h.signal.removeEventListener("abort", f);
          }
          return n && !n.dispatchConditionRejection && o.match(b) && b.meta.condition || l(b), b;
        })();
        return Object.assign(k, {
          abort: C,
          requestId: g,
          arg: c,
          unwrap() {
            return k.then(Dp);
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
function Dp(e) {
  if (e.meta && e.meta.rejectedWithValue)
    throw e.payload;
  if (e.error)
    throw e.error;
  return e.payload;
}
function Tp(e) {
  return e !== null && typeof e == "object" && typeof e.then == "function";
}
var _p = /* @__PURE__ */ Symbol.for("rtk-slice-createasyncthunk");
function Mp(e, t) {
  return `${e}/${t}`;
}
function Pp({
  creators: e
} = {}) {
  var r;
  const t = (r = e == null ? void 0 : e.asyncThunk) == null ? void 0 : r[_p];
  return function(i) {
    const {
      name: s,
      reducerPath: o = s
    } = i;
    if (!s)
      throw new Error(et(11));
    const a = (typeof i.reducers == "function" ? i.reducers($p()) : i.reducers) || {}, c = Object.keys(a), u = {
      sliceCaseReducersByName: {},
      sliceCaseReducersByType: {},
      actionCreators: {},
      sliceMatchers: []
    }, l = {
      addCase(S, v) {
        const O = typeof S == "string" ? S : S.type;
        if (!O)
          throw new Error(et(12));
        if (O in u.sliceCaseReducersByType)
          throw new Error(et(13));
        return u.sliceCaseReducersByType[O] = v, l;
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
      const v = a[S], O = {
        reducerName: S,
        type: Mp(s, S),
        createNotation: typeof i.reducers == "function"
      };
      Lp(v) ? jp(O, v, l, t) : Vp(O, v, l);
    });
    function d() {
      const [S = {}, v = [], O = void 0] = typeof i.extraReducers == "function" ? gl(i.extraReducers) : [i.extraReducers], _ = {
        ...S,
        ...u.sliceCaseReducersByType
      };
      return se(i.initialState, ($) => {
        for (let A in _)
          $.addCase(A, _[A]);
        for (let A of u.sliceMatchers)
          $.addMatcher(A.matcher, A.reducer);
        for (let A of v)
          $.addMatcher(A.matcher, A.reducer);
        O && $.addDefaultCase(O);
      });
    }
    const p = (S) => S, g = /* @__PURE__ */ new Map(), h = /* @__PURE__ */ new WeakMap();
    let f;
    function m(S, v) {
      return f || (f = d()), f(S, v);
    }
    function C() {
      return f || (f = d()), f.getInitialState();
    }
    function k(S, v = !1) {
      function O($) {
        let A = $[S];
        return typeof A > "u" && v && (A = un(h, O, C)), A;
      }
      function _($ = p) {
        const A = un(g, v, () => /* @__PURE__ */ new WeakMap());
        return un(A, $, () => {
          const x = {};
          for (const [I, D] of Object.entries(i.selectors ?? {}))
            x[I] = Up(D, $, () => un(h, $, C), v);
          return x;
        });
      }
      return {
        reducerPath: S,
        getSelectors: _,
        get selectors() {
          return _(O);
        },
        selectSlice: O
      };
    }
    const b = {
      name: s,
      reducer: m,
      actions: u.actionCreators,
      caseReducers: u.sliceCaseReducersByName,
      getInitialState: C,
      ...k(o),
      injectInto(S, {
        reducerPath: v,
        ...O
      } = {}) {
        const _ = v ?? o;
        return S.inject({
          reducerPath: _,
          reducer: m
        }, O), {
          ...b,
          ...k(_, !0)
        };
      }
    };
    return b;
  };
}
function Up(e, t, r, n) {
  function i(s, ...o) {
    let a = t(s);
    return typeof a > "u" && n && (a = r()), e(a, ...o);
  }
  return i.unwrapped = e, i;
}
var Vt = /* @__PURE__ */ Pp();
function $p() {
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
function Vp({
  type: e,
  reducerName: t,
  createNotation: r
}, n, i) {
  let s, o;
  if ("reducer" in n) {
    if (r && !Qp(n))
      throw new Error(et(17));
    s = n.reducer, o = n.prepare;
  } else
    s = n;
  i.addCase(e, s).exposeCaseReducer(t, s).exposeAction(t, o ? w(e, o) : w(e));
}
function Lp(e) {
  return e._reducerDefinitionType === "asyncThunk";
}
function Qp(e) {
  return e._reducerDefinitionType === "reducerWithPrepare";
}
function jp({
  type: e,
  reducerName: t
}, r, n, i) {
  if (!i)
    throw new Error(et(18));
  const {
    payloadCreator: s,
    fulfilled: o,
    pending: a,
    rejected: c,
    settled: u,
    options: l
  } = r, d = i(e, s, l);
  n.exposeAction(t, d), o && n.addCase(d.fulfilled, o), a && n.addCase(d.pending, a), c && n.addCase(d.rejected, c), u && n.addMatcher(d.settled, u), n.exposeCaseReducer(t, {
    fulfilled: o || ln,
    pending: a || ln,
    rejected: c || ln,
    settled: u || ln
  });
}
function ln() {
}
function et(e) {
  return `Minified Redux Toolkit error #${e}; visit https://redux-toolkit.js.org/Errors?code=${e} for the full message or use the non-minified dev environment for full errors. `;
}
const yl = (e) => {
  var t;
  return ((t = e.commercePagination) == null ? void 0 : t.principal.perPage) || 0;
}, Np = (e, t) => {
  var r, n;
  return ((n = (r = e.commercePagination) == null ? void 0 : r.recommendations[t]) == null ? void 0 : n.perPage) || 0;
}, vl = (e) => {
  var t;
  return ((t = e.commercePagination) == null ? void 0 : t.principal.totalEntries) || 0;
}, zp = (e, t) => {
  var r, n;
  return ((n = (r = e.commercePagination) == null ? void 0 : r.recommendations[t]) == null ? void 0 : n.totalEntries) || 0;
}, Bp = (e) => e.productListing.responseId, Sl = (e) => {
  var t, r;
  return ((t = e.productListing) == null ? void 0 : t.results.length) || ((r = e.productListing) == null ? void 0 : r.products.length) || 0;
}, Hp = fe((e) => ({
  total: vl(e),
  current: Sl(e)
}), ({ current: e, total: t }) => e < t), { getOwnPropertyNames: Yp, getOwnPropertySymbols: Wp } = Object, { hasOwnProperty: Gp } = Object.prototype;
function Hi(e, t) {
  return function(n, i, s) {
    return e(n, i, s) && t(n, i, s);
  };
}
function dn(e) {
  return function(r, n, i) {
    if (!r || !n || typeof r != "object" || typeof n != "object")
      return e(r, n, i);
    const { cache: s } = i, o = s.get(r), a = s.get(n);
    if (o && a)
      return o === n && a === r;
    s.set(r, n), s.set(n, r);
    const c = e(r, n, i);
    return s.delete(r), s.delete(n), c;
  };
}
function Ea(e) {
  return Yp(e).concat(Wp(e));
}
const Kp = (
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  Object.hasOwn || ((e, t) => Gp.call(e, t))
), Jp = "__v", Zp = "__o", Xp = "_owner", { getOwnPropertyDescriptor: Ra, keys: qa } = Object, Pt = (
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  Object.is || function(t, r) {
    return t === r ? t !== 0 || 1 / t === 1 / r : t !== t && r !== r;
  }
);
function eg(e, t) {
  return e === t;
}
function tg(e, t) {
  return e.byteLength === t.byteLength && Zn(new Uint8Array(e), new Uint8Array(t));
}
function rg(e, t, r) {
  let n = e.length;
  if (t.length !== n)
    return !1;
  for (; n-- > 0; )
    if (!r.equals(e[n], t[n], n, n, e, t, r))
      return !1;
  return !0;
}
function ng(e, t) {
  return e.byteLength === t.byteLength && Zn(new Uint8Array(e.buffer, e.byteOffset, e.byteLength), new Uint8Array(t.buffer, t.byteOffset, t.byteLength));
}
function ig(e, t) {
  return Pt(e.getTime(), t.getTime());
}
function sg(e, t) {
  return e.name === t.name && e.message === t.message && e.cause === t.cause && e.stack === t.stack;
}
function Oa(e, t, r) {
  const n = e.size;
  if (n !== t.size)
    return !1;
  if (!n)
    return !0;
  const i = new Array(n), s = e.entries();
  let o, a, c = 0;
  for (; (o = s.next()) && !o.done; ) {
    const u = t.entries();
    let l = !1, d = 0;
    for (; (a = u.next()) && !a.done; ) {
      if (i[d]) {
        d++;
        continue;
      }
      const p = o.value, g = a.value;
      if (r.equals(p[0], g[0], c, d, e, t, r) && r.equals(p[1], g[1], p[0], g[0], e, t, r)) {
        l = i[d] = !0;
        break;
      }
      d++;
    }
    if (!l)
      return !1;
    c++;
  }
  return !0;
}
function og(e, t, r) {
  const n = qa(e);
  let i = n.length;
  if (qa(t).length !== i)
    return !1;
  for (; i-- > 0; )
    if (!wl(e, t, r, n[i]))
      return !1;
  return !0;
}
function pr(e, t, r) {
  const n = Ea(e);
  let i = n.length;
  if (Ea(t).length !== i)
    return !1;
  let s, o, a;
  for (; i-- > 0; )
    if (s = n[i], !wl(e, t, r, s) || (o = Ra(e, s), a = Ra(t, s), (o || a) && (!o || !a || o.configurable !== a.configurable || o.enumerable !== a.enumerable || o.writable !== a.writable)))
      return !1;
  return !0;
}
function ag(e, t) {
  return Pt(e.valueOf(), t.valueOf());
}
function cg(e, t) {
  return e.source === t.source && e.flags === t.flags;
}
function Fa(e, t, r) {
  const n = e.size;
  if (n !== t.size)
    return !1;
  if (!n)
    return !0;
  const i = new Array(n), s = e.values();
  let o, a;
  for (; (o = s.next()) && !o.done; ) {
    const c = t.values();
    let u = !1, l = 0;
    for (; (a = c.next()) && !a.done; ) {
      if (!i[l] && r.equals(o.value, a.value, o.value, a.value, e, t, r)) {
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
function Zn(e, t) {
  let r = e.byteLength;
  if (t.byteLength !== r || e.byteOffset !== t.byteOffset)
    return !1;
  for (; r-- > 0; )
    if (e[r] !== t[r])
      return !1;
  return !0;
}
function ug(e, t) {
  return e.hostname === t.hostname && e.pathname === t.pathname && e.protocol === t.protocol && e.port === t.port && e.hash === t.hash && e.username === t.username && e.password === t.password;
}
function wl(e, t, r, n) {
  return (n === Xp || n === Zp || n === Jp) && (e.$$typeof || t.$$typeof) ? !0 : Kp(t, n) && r.equals(e[n], t[n], n, n, e, t, r);
}
const lg = Object.prototype.toString;
function dg(e) {
  const t = gg(e), { areArraysEqual: r, areDatesEqual: n, areFunctionsEqual: i, areMapsEqual: s, areNumbersEqual: o, areObjectsEqual: a, areRegExpsEqual: c, areSetsEqual: u, getUnsupportedCustomComparator: l } = e;
  return function(p, g, h) {
    if (p === g)
      return !0;
    if (p == null || g == null)
      return !1;
    const f = typeof p;
    if (f !== typeof g)
      return !1;
    if (f !== "object")
      return f === "number" || f === "bigint" ? o(p, g, h) : f === "function" ? i(p, g, h) : !1;
    const m = p.constructor;
    if (m !== g.constructor)
      return !1;
    if (m === Object)
      return a(p, g, h);
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
    const C = lg.call(p), k = t[C];
    if (k)
      return k(p, g, h);
    const b = l && l(p, g, h, C);
    return b ? b(p, g, h) : !1;
  };
}
function fg({ circular: e, createCustomConfig: t, strict: r }) {
  let n = {
    areArrayBuffersEqual: tg,
    areArraysEqual: r ? pr : rg,
    areDataViewsEqual: ng,
    areDatesEqual: ig,
    areErrorsEqual: sg,
    areFunctionsEqual: eg,
    areMapsEqual: r ? Hi(Oa, pr) : Oa,
    areNumbersEqual: Pt,
    areObjectsEqual: r ? pr : og,
    arePrimitiveWrappersEqual: ag,
    areRegExpsEqual: cg,
    areSetsEqual: r ? Hi(Fa, pr) : Fa,
    areTypedArraysEqual: r ? Hi(Zn, pr) : Zn,
    areUrlsEqual: ug,
    getUnsupportedCustomComparator: void 0
  };
  if (t && (n = Object.assign({}, n, t(n))), e) {
    const i = dn(n.areArraysEqual), s = dn(n.areMapsEqual), o = dn(n.areObjectsEqual), a = dn(n.areSetsEqual);
    n = Object.assign({}, n, {
      areArraysEqual: i,
      areMapsEqual: s,
      areObjectsEqual: o,
      areSetsEqual: a
    });
  }
  return n;
}
function hg(e) {
  return function(t, r, n, i, s, o, a) {
    return e(t, r, a);
  };
}
function pg({ circular: e, comparator: t, createState: r, equals: n, strict: i }) {
  if (r)
    return function(a, c) {
      const { cache: u = e ? /* @__PURE__ */ new WeakMap() : void 0, meta: l } = r();
      return t(a, c, {
        cache: u,
        equals: n,
        meta: l,
        strict: i
      });
    };
  if (e)
    return function(a, c) {
      return t(a, c, {
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
  return function(a, c) {
    return t(a, c, s);
  };
}
function gg({ areArrayBuffersEqual: e, areArraysEqual: t, areDataViewsEqual: r, areDatesEqual: n, areErrorsEqual: i, areFunctionsEqual: s, areMapsEqual: o, areNumbersEqual: a, areObjectsEqual: c, arePrimitiveWrappersEqual: u, areRegExpsEqual: l, areSetsEqual: d, areTypedArraysEqual: p, areUrlsEqual: g }) {
  return {
    "[object Arguments]": c,
    "[object Array]": t,
    "[object ArrayBuffer]": e,
    "[object AsyncGeneratorFunction]": s,
    "[object BigInt]": a,
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
    "[object Map]": o,
    "[object Number]": u,
    "[object Object]": (h, f, m) => (
      // The exception for value comparison is custom `Promise`-like class instances. These should
      // be treated the same as standard `Promise` objects, which means strict equality, and if
      // it reaches this point then that strict equality comparison has already failed.
      typeof h.then != "function" && typeof f.then != "function" && c(h, f, m)
    ),
    // For RegExp, the properties are not enumerable, and therefore will give false positives if
    // tested like a standard object.
    "[object RegExp]": l,
    "[object Set]": d,
    "[object String]": u,
    "[object URL]": g,
    "[object Uint8Array]": p,
    "[object Uint8ClampedArray]": p,
    "[object Uint16Array]": p,
    "[object Uint32Array]": p
  };
}
nt();
nt({ strict: !0 });
nt({ circular: !0 });
nt({
  circular: !0,
  strict: !0
});
nt({
  createInternalComparator: () => Pt
});
nt({
  strict: !0,
  createInternalComparator: () => Pt
});
nt({
  circular: !0,
  createInternalComparator: () => Pt
});
nt({
  circular: !0,
  createInternalComparator: () => Pt,
  strict: !0
});
function nt(e = {}) {
  const { circular: t = !1, createInternalComparator: r, createState: n, strict: i = !1 } = e, s = fg(e), o = dg(s), a = r ? r(o) : hg(o);
  return pg({ circular: t, comparator: o, createState: n, equals: a, strict: i });
}
function mg(e, t) {
  return e.length !== t.length ? !1 : e.every((r) => t.findIndex((n) => yg(r, n)) !== -1);
}
const yg = nt({
  createCustomConfig: (e) => ({
    ...e,
    areArraysEqual: mg
  })
});
function vg(e) {
  const { activeValue: t, ancestryMap: r } = Sg(e);
  return t ? wg(t, r) : [];
}
function Sg(e) {
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
function wg(e, t) {
  const r = [];
  if (!e)
    return [];
  let n = e;
  do
    r.unshift(n), n = t.get(n);
  while (n);
  return r;
}
function bg() {
  return {
    principal: gi(),
    recommendations: {}
  };
}
function gi() {
  return {
    page: 0,
    perPage: 0,
    totalEntries: 0,
    totalPages: 0
  };
}
var Qe;
(function(e) {
  e.Relevance = "relevance", e.Fields = "fields";
})(Qe || (Qe = {}));
var Us;
(function(e) {
  e.Ascending = "asc", e.Descending = "desc";
})(Us || (Us = {}));
const $s = () => ({
  by: Qe.Relevance
});
new z({
  options: {
    required: !1
  },
  values: {
    by: new Er({ enum: Qe, required: !0 }),
    fields: new ae({
      each: new z({
        values: {
          field: new Q({ required: !0 }),
          direction: new Er({ enum: Us }),
          displayName: new Q()
        }
      })
    })
  }
});
function Fn() {
  return {
    appliedSort: $s(),
    availableSorts: [$s()]
  };
}
const Cg = () => ({
  query: ""
}), Ig = (e) => e.commerceSearch.responseId, bl = (e) => {
  var t, r;
  return ((t = e.commerceSearch) == null ? void 0 : t.results.length) || ((r = e.commerceSearch) == null ? void 0 : r.products.length) || 0;
}, Ag = fe((e) => ({
  total: vl(e),
  current: bl(e)
}), ({ current: e, total: t }) => e < t), go = (e) => {
  var t;
  return ((t = e.commerceQuery) == null ? void 0 : t.query) ?? "";
}, xg = (e, t) => {
  var r;
  return ee((r = t.queryCorrection) == null ? void 0 : r.correctedQuery) ? go(e) : t.queryCorrection.correctedQuery;
};
var Da;
(function(e) {
  e.responseIdSelector = Cl(Ig);
})(Da || (Da = {}));
var Ta;
(function(e) {
  e.responseIdSelector = Cl(Bp);
})(Ta || (Ta = {}));
function Cl(e) {
  return (t) => e(t[Bh]);
}
function Il(e) {
  if (typeof e != "object" || !e)
    return e;
  try {
    return JSON.parse(JSON.stringify(e));
  } catch {
    return e;
  }
}
function zr(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var at = {}, Lt = {}, _a;
function kg() {
  if (_a) return Lt;
  _a = 1;
  var e = Lt && Lt.__assign || function() {
    return e = Object.assign || function(n) {
      for (var i, s = 1, o = arguments.length; s < o; s++) {
        i = arguments[s];
        for (var a in i) Object.prototype.hasOwnProperty.call(i, a) && (n[a] = i[a]);
      }
      return n;
    }, e.apply(this, arguments);
  };
  Object.defineProperty(Lt, "__esModule", { value: !0 });
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
  return Lt.getSanitizedOptions = r, Lt;
}
var fn = {}, Ve = {}, hn = {}, pn = {}, gn = {}, Ma;
function Eg() {
  if (Ma) return gn;
  Ma = 1, Object.defineProperty(gn, "__esModule", { value: !0 });
  function e(t) {
    var r = Math.random() * t;
    return Math.round(r);
  }
  return gn.fullJitter = e, gn;
}
var mn = {}, Pa;
function Rg() {
  if (Pa) return mn;
  Pa = 1, Object.defineProperty(mn, "__esModule", { value: !0 });
  function e(t) {
    return t;
  }
  return mn.noJitter = e, mn;
}
var Ua;
function qg() {
  if (Ua) return pn;
  Ua = 1, Object.defineProperty(pn, "__esModule", { value: !0 });
  var e = Eg(), t = Rg();
  function r(n) {
    switch (n.jitter) {
      case "full":
        return e.fullJitter;
      case "none":
      default:
        return t.noJitter;
    }
  }
  return pn.JitterFactory = r, pn;
}
var $a;
function Al() {
  if ($a) return hn;
  $a = 1, Object.defineProperty(hn, "__esModule", { value: !0 });
  var e = qg(), t = (
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
          var n = this.options.startingDelay, i = this.options.timeMultiple, s = this.numOfDelayedAttempts, o = n * Math.pow(i, s);
          return Math.min(o, this.options.maxDelay);
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
  return hn.Delay = t, hn;
}
var Va;
function Og() {
  if (Va) return Ve;
  Va = 1;
  var e = Ve && Ve.__extends || /* @__PURE__ */ (function() {
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
  })(), t = Ve && Ve.__awaiter || function(s, o, a, c) {
    function u(l) {
      return l instanceof a ? l : new a(function(d) {
        d(l);
      });
    }
    return new (a || (a = Promise))(function(l, d) {
      function p(f) {
        try {
          h(c.next(f));
        } catch (m) {
          d(m);
        }
      }
      function g(f) {
        try {
          h(c.throw(f));
        } catch (m) {
          d(m);
        }
      }
      function h(f) {
        f.done ? l(f.value) : u(f.value).then(p, g);
      }
      h((c = c.apply(s, o || [])).next());
    });
  }, r = Ve && Ve.__generator || function(s, o) {
    var a = { label: 0, sent: function() {
      if (l[0] & 1) throw l[1];
      return l[1];
    }, trys: [], ops: [] }, c, u, l, d;
    return d = { next: p(0), throw: p(1), return: p(2) }, typeof Symbol == "function" && (d[Symbol.iterator] = function() {
      return this;
    }), d;
    function p(h) {
      return function(f) {
        return g([h, f]);
      };
    }
    function g(h) {
      if (c) throw new TypeError("Generator is already executing.");
      for (; a; ) try {
        if (c = 1, u && (l = h[0] & 2 ? u.return : h[0] ? u.throw || ((l = u.return) && l.call(u), 0) : u.next) && !(l = l.call(u, h[1])).done) return l;
        switch (u = 0, l && (h = [h[0] & 2, l.value]), h[0]) {
          case 0:
          case 1:
            l = h;
            break;
          case 4:
            return a.label++, { value: h[1], done: !1 };
          case 5:
            a.label++, u = h[1], h = [0];
            continue;
          case 7:
            h = a.ops.pop(), a.trys.pop();
            continue;
          default:
            if (l = a.trys, !(l = l.length > 0 && l[l.length - 1]) && (h[0] === 6 || h[0] === 2)) {
              a = 0;
              continue;
            }
            if (h[0] === 3 && (!l || h[1] > l[0] && h[1] < l[3])) {
              a.label = h[1];
              break;
            }
            if (h[0] === 6 && a.label < l[1]) {
              a.label = l[1], l = h;
              break;
            }
            if (l && a.label < l[2]) {
              a.label = l[2], a.ops.push(h);
              break;
            }
            l[2] && a.ops.pop(), a.trys.pop();
            continue;
        }
        h = o.call(s, a);
      } catch (f) {
        h = [6, f], u = 0;
      } finally {
        c = l = 0;
      }
      if (h[0] & 5) throw h[1];
      return { value: h[0] ? h[1] : void 0, done: !0 };
    }
  };
  Object.defineProperty(Ve, "__esModule", { value: !0 });
  var n = Al(), i = (
    /** @class */
    (function(s) {
      e(o, s);
      function o() {
        return s !== null && s.apply(this, arguments) || this;
      }
      return o.prototype.apply = function() {
        return t(this, void 0, void 0, function() {
          return r(this, function(a) {
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
    })(n.Delay)
  );
  return Ve.SkipFirstDelay = i, Ve;
}
var Qt = {}, La;
function Fg() {
  if (La) return Qt;
  La = 1;
  var e = Qt && Qt.__extends || /* @__PURE__ */ (function() {
    var n = function(i, s) {
      return n = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(o, a) {
        o.__proto__ = a;
      } || function(o, a) {
        for (var c in a) a.hasOwnProperty(c) && (o[c] = a[c]);
      }, n(i, s);
    };
    return function(i, s) {
      n(i, s);
      function o() {
        this.constructor = i;
      }
      i.prototype = s === null ? Object.create(s) : (o.prototype = s.prototype, new o());
    };
  })();
  Object.defineProperty(Qt, "__esModule", { value: !0 });
  var t = Al(), r = (
    /** @class */
    (function(n) {
      e(i, n);
      function i() {
        return n !== null && n.apply(this, arguments) || this;
      }
      return i;
    })(t.Delay)
  );
  return Qt.AlwaysDelay = r, Qt;
}
var Qa;
function Dg() {
  if (Qa) return fn;
  Qa = 1, Object.defineProperty(fn, "__esModule", { value: !0 });
  var e = Og(), t = Fg();
  function r(i, s) {
    var o = n(i);
    return o.setAttemptNumber(s), o;
  }
  fn.DelayFactory = r;
  function n(i) {
    return i.delayFirstAttempt ? new t.AlwaysDelay(i) : new e.SkipFirstDelay(i);
  }
  return fn;
}
var ja;
function Tg() {
  if (ja) return at;
  ja = 1;
  var e = at && at.__awaiter || function(o, a, c, u) {
    function l(d) {
      return d instanceof c ? d : new c(function(p) {
        p(d);
      });
    }
    return new (c || (c = Promise))(function(d, p) {
      function g(m) {
        try {
          f(u.next(m));
        } catch (C) {
          p(C);
        }
      }
      function h(m) {
        try {
          f(u.throw(m));
        } catch (C) {
          p(C);
        }
      }
      function f(m) {
        m.done ? d(m.value) : l(m.value).then(g, h);
      }
      f((u = u.apply(o, a || [])).next());
    });
  }, t = at && at.__generator || function(o, a) {
    var c = { label: 0, sent: function() {
      if (d[0] & 1) throw d[1];
      return d[1];
    }, trys: [], ops: [] }, u, l, d, p;
    return p = { next: g(0), throw: g(1), return: g(2) }, typeof Symbol == "function" && (p[Symbol.iterator] = function() {
      return this;
    }), p;
    function g(f) {
      return function(m) {
        return h([f, m]);
      };
    }
    function h(f) {
      if (u) throw new TypeError("Generator is already executing.");
      for (; c; ) try {
        if (u = 1, l && (d = f[0] & 2 ? l.return : f[0] ? l.throw || ((d = l.return) && d.call(l), 0) : l.next) && !(d = d.call(l, f[1])).done) return d;
        switch (l = 0, d && (f = [f[0] & 2, d.value]), f[0]) {
          case 0:
          case 1:
            d = f;
            break;
          case 4:
            return c.label++, { value: f[1], done: !1 };
          case 5:
            c.label++, l = f[1], f = [0];
            continue;
          case 7:
            f = c.ops.pop(), c.trys.pop();
            continue;
          default:
            if (d = c.trys, !(d = d.length > 0 && d[d.length - 1]) && (f[0] === 6 || f[0] === 2)) {
              c = 0;
              continue;
            }
            if (f[0] === 3 && (!d || f[1] > d[0] && f[1] < d[3])) {
              c.label = f[1];
              break;
            }
            if (f[0] === 6 && c.label < d[1]) {
              c.label = d[1], d = f;
              break;
            }
            if (d && c.label < d[2]) {
              c.label = d[2], c.ops.push(f);
              break;
            }
            d[2] && c.ops.pop(), c.trys.pop();
            continue;
        }
        f = a.call(o, c);
      } catch (m) {
        f = [6, m], l = 0;
      } finally {
        u = d = 0;
      }
      if (f[0] & 5) throw f[1];
      return { value: f[0] ? f[1] : void 0, done: !0 };
    }
  };
  Object.defineProperty(at, "__esModule", { value: !0 });
  var r = kg(), n = Dg();
  function i(o, a) {
    return a === void 0 && (a = {}), e(this, void 0, void 0, function() {
      var c, u;
      return t(this, function(l) {
        switch (l.label) {
          case 0:
            return c = r.getSanitizedOptions(a), u = new s(o, c), [4, u.execute()];
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
                return a = n.DelayFactory(this.options, this.attemptNumber), [4, a.apply()];
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
  return at;
}
Tg();
function Br(e, t = "prod", r = "platform") {
  const n = t === "prod" ? "" : t, i = r === "platform" ? "" : `.${r}`;
  return `https://${e}${i}.org${n}.coveo.com`;
}
function mo(e, t, r = "prod") {
  return e ?? Br(t, r);
}
function sr(e, t = "prod") {
  return `${Br(e, t)}/rest/search/v2`;
}
function _g(e, t = "prod") {
  return `${Br(e, t, "analytics")}/rest/organizations/${e}/events/v1`;
}
const je = (e) => e.error !== void 0;
function Mg(e, t = "prod") {
  return `${Br(e, t)}/rest/organizations/${e}/commerce/v2`;
}
var _e;
(function(e) {
  e.CHILD_PRODUCT = "childProduct", e.PRODUCT = "product", e.SPOTLIGHT = "spotlight";
})(_e || (_e = {}));
var Dn = { exports: {} }, Pg = Dn.exports, Na;
function Ug() {
  return Na || (Na = 1, (function(e, t) {
    (function(r, n) {
      e.exports = n();
    })(Pg, (function() {
      var r = 1e3, n = 6e4, i = 36e5, s = "millisecond", o = "second", a = "minute", c = "hour", u = "day", l = "week", d = "month", p = "quarter", g = "year", h = "date", f = "Invalid Date", m = /^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/, C = /\[([^\]]+)]|YYYY|YY|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g, k = { name: "en", weekdays: "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"), months: "January_February_March_April_May_June_July_August_September_October_November_December".split("_"), ordinal: function(F) {
        var U = ["th", "st", "nd", "rd"], y = F % 100;
        return "[" + F + (U[(y - 20) % 10] || U[y] || U[0]) + "]";
      } }, b = function(F, U, y) {
        var q = String(F);
        return !q || q.length >= U ? F : "" + Array(U + 1 - q.length).join(y) + F;
      }, S = { s: b, z: function(F) {
        var U = -F.utcOffset(), y = Math.abs(U), q = Math.floor(y / 60), E = y % 60;
        return (U <= 0 ? "+" : "-") + b(q, 2, "0") + ":" + b(E, 2, "0");
      }, m: function F(U, y) {
        if (U.date() < y.date()) return -F(y, U);
        var q = 12 * (y.year() - U.year()) + (y.month() - U.month()), E = U.clone().add(q, d), T = y - E < 0, L = U.clone().add(q + (T ? -1 : 1), d);
        return +(-(q + (y - E) / (T ? E - L : L - E)) || 0);
      }, a: function(F) {
        return F < 0 ? Math.ceil(F) || 0 : Math.floor(F);
      }, p: function(F) {
        return { M: d, y: g, w: l, d: u, D: h, h: c, m: a, s: o, ms: s, Q: p }[F] || String(F || "").toLowerCase().replace(/s$/, "");
      }, u: function(F) {
        return F === void 0;
      } }, v = "en", O = {};
      O[v] = k;
      var _ = "$isDayjsObject", $ = function(F) {
        return F instanceof D || !(!F || !F[_]);
      }, A = function F(U, y, q) {
        var E;
        if (!U) return v;
        if (typeof U == "string") {
          var T = U.toLowerCase();
          O[T] && (E = T), y && (O[T] = y, E = T);
          var L = U.split("-");
          if (!E && L.length > 1) return F(L[0]);
        } else {
          var N = U.name;
          O[N] = U, E = N;
        }
        return !q && E && (v = E), E || !q && v;
      }, x = function(F, U) {
        if ($(F)) return F.clone();
        var y = typeof U == "object" ? U : {};
        return y.date = F, y.args = arguments, new D(y);
      }, I = S;
      I.l = A, I.i = $, I.w = function(F, U) {
        return x(F, { locale: U.$L, utc: U.$u, x: U.$x, $offset: U.$offset });
      };
      var D = (function() {
        function F(y) {
          this.$L = A(y.locale, null, !0), this.parse(y), this.$x = this.$x || y.x || {}, this[_] = !0;
        }
        var U = F.prototype;
        return U.parse = function(y) {
          this.$d = (function(q) {
            var E = q.date, T = q.utc;
            if (E === null) return /* @__PURE__ */ new Date(NaN);
            if (I.u(E)) return /* @__PURE__ */ new Date();
            if (E instanceof Date) return new Date(E);
            if (typeof E == "string" && !/Z$/i.test(E)) {
              var L = E.match(m);
              if (L) {
                var N = L[2] - 1 || 0, J = (L[7] || "0").substring(0, 3);
                return T ? new Date(Date.UTC(L[1], N, L[3] || 1, L[4] || 0, L[5] || 0, L[6] || 0, J)) : new Date(L[1], N, L[3] || 1, L[4] || 0, L[5] || 0, L[6] || 0, J);
              }
            }
            return new Date(E);
          })(y), this.init();
        }, U.init = function() {
          var y = this.$d;
          this.$y = y.getFullYear(), this.$M = y.getMonth(), this.$D = y.getDate(), this.$W = y.getDay(), this.$H = y.getHours(), this.$m = y.getMinutes(), this.$s = y.getSeconds(), this.$ms = y.getMilliseconds();
        }, U.$utils = function() {
          return I;
        }, U.isValid = function() {
          return this.$d.toString() !== f;
        }, U.isSame = function(y, q) {
          var E = x(y);
          return this.startOf(q) <= E && E <= this.endOf(q);
        }, U.isAfter = function(y, q) {
          return x(y) < this.startOf(q);
        }, U.isBefore = function(y, q) {
          return this.endOf(q) < x(y);
        }, U.$g = function(y, q, E) {
          return I.u(y) ? this[q] : this.set(E, y);
        }, U.unix = function() {
          return Math.floor(this.valueOf() / 1e3);
        }, U.valueOf = function() {
          return this.$d.getTime();
        }, U.startOf = function(y, q) {
          var E = this, T = !!I.u(q) || q, L = I.p(y), N = function(le, ce) {
            var K = I.w(E.$u ? Date.UTC(E.$y, ce, le) : new Date(E.$y, ce, le), E);
            return T ? K : K.endOf(u);
          }, J = function(le, ce) {
            return I.w(E.toDate()[le].apply(E.toDate("s"), (T ? [0, 0, 0, 0] : [23, 59, 59, 999]).slice(ce)), E);
          }, W = this.$W, re = this.$M, B = this.$D, X = "set" + (this.$u ? "UTC" : "");
          switch (L) {
            case g:
              return T ? N(1, 0) : N(31, 11);
            case d:
              return T ? N(1, re) : N(0, re + 1);
            case l:
              var Y = this.$locale().weekStart || 0, Z = (W < Y ? W + 7 : W) - Y;
              return N(T ? B - Z : B + (6 - Z), re);
            case u:
            case h:
              return J(X + "Hours", 0);
            case c:
              return J(X + "Minutes", 1);
            case a:
              return J(X + "Seconds", 2);
            case o:
              return J(X + "Milliseconds", 3);
            default:
              return this.clone();
          }
        }, U.endOf = function(y) {
          return this.startOf(y, !1);
        }, U.$set = function(y, q) {
          var E, T = I.p(y), L = "set" + (this.$u ? "UTC" : ""), N = (E = {}, E[u] = L + "Date", E[h] = L + "Date", E[d] = L + "Month", E[g] = L + "FullYear", E[c] = L + "Hours", E[a] = L + "Minutes", E[o] = L + "Seconds", E[s] = L + "Milliseconds", E)[T], J = T === u ? this.$D + (q - this.$W) : q;
          if (T === d || T === g) {
            var W = this.clone().set(h, 1);
            W.$d[N](J), W.init(), this.$d = W.set(h, Math.min(this.$D, W.daysInMonth())).$d;
          } else N && this.$d[N](J);
          return this.init(), this;
        }, U.set = function(y, q) {
          return this.clone().$set(y, q);
        }, U.get = function(y) {
          return this[I.p(y)]();
        }, U.add = function(y, q) {
          var E, T = this;
          y = Number(y);
          var L = I.p(q), N = function(re) {
            var B = x(T);
            return I.w(B.date(B.date() + Math.round(re * y)), T);
          };
          if (L === d) return this.set(d, this.$M + y);
          if (L === g) return this.set(g, this.$y + y);
          if (L === u) return N(1);
          if (L === l) return N(7);
          var J = (E = {}, E[a] = n, E[c] = i, E[o] = r, E)[L] || 1, W = this.$d.getTime() + y * J;
          return I.w(W, this);
        }, U.subtract = function(y, q) {
          return this.add(-1 * y, q);
        }, U.format = function(y) {
          var q = this, E = this.$locale();
          if (!this.isValid()) return E.invalidDate || f;
          var T = y || "YYYY-MM-DDTHH:mm:ssZ", L = I.z(this), N = this.$H, J = this.$m, W = this.$M, re = E.weekdays, B = E.months, X = E.meridiem, Y = function(ce, K, te, de) {
            return ce && (ce[K] || ce(q, T)) || te[K].slice(0, de);
          }, Z = function(ce) {
            return I.s(N % 12 || 12, ce, "0");
          }, le = X || function(ce, K, te) {
            var de = ce < 12 ? "AM" : "PM";
            return te ? de.toLowerCase() : de;
          };
          return T.replace(C, (function(ce, K) {
            return K || (function(te) {
              switch (te) {
                case "YY":
                  return String(q.$y).slice(-2);
                case "YYYY":
                  return I.s(q.$y, 4, "0");
                case "M":
                  return W + 1;
                case "MM":
                  return I.s(W + 1, 2, "0");
                case "MMM":
                  return Y(E.monthsShort, W, B, 3);
                case "MMMM":
                  return Y(B, W);
                case "D":
                  return q.$D;
                case "DD":
                  return I.s(q.$D, 2, "0");
                case "d":
                  return String(q.$W);
                case "dd":
                  return Y(E.weekdaysMin, q.$W, re, 2);
                case "ddd":
                  return Y(E.weekdaysShort, q.$W, re, 3);
                case "dddd":
                  return re[q.$W];
                case "H":
                  return String(N);
                case "HH":
                  return I.s(N, 2, "0");
                case "h":
                  return Z(1);
                case "hh":
                  return Z(2);
                case "a":
                  return le(N, J, !0);
                case "A":
                  return le(N, J, !1);
                case "m":
                  return String(J);
                case "mm":
                  return I.s(J, 2, "0");
                case "s":
                  return String(q.$s);
                case "ss":
                  return I.s(q.$s, 2, "0");
                case "SSS":
                  return I.s(q.$ms, 3, "0");
                case "Z":
                  return L;
              }
              return null;
            })(ce) || L.replace(":", "");
          }));
        }, U.utcOffset = function() {
          return 15 * -Math.round(this.$d.getTimezoneOffset() / 15);
        }, U.diff = function(y, q, E) {
          var T, L = this, N = I.p(q), J = x(y), W = (J.utcOffset() - this.utcOffset()) * n, re = this - J, B = function() {
            return I.m(L, J);
          };
          switch (N) {
            case g:
              T = B() / 12;
              break;
            case d:
              T = B();
              break;
            case p:
              T = B() / 3;
              break;
            case l:
              T = (re - W) / 6048e5;
              break;
            case u:
              T = (re - W) / 864e5;
              break;
            case c:
              T = re / i;
              break;
            case a:
              T = re / n;
              break;
            case o:
              T = re / r;
              break;
            default:
              T = re;
          }
          return E ? T : I.a(T);
        }, U.daysInMonth = function() {
          return this.endOf(d).$D;
        }, U.$locale = function() {
          return O[this.$L];
        }, U.locale = function(y, q) {
          if (!y) return this.$L;
          var E = this.clone(), T = A(y, q, !0);
          return T && (E.$L = T), E;
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
        }, F;
      })(), V = D.prototype;
      return x.prototype = V, [["$ms", s], ["$s", o], ["$m", a], ["$H", c], ["$W", u], ["$M", d], ["$y", g], ["$D", h]].forEach((function(F) {
        V[F[1]] = function(U) {
          return this.$g(U, F[0], F[1]);
        };
      })), x.extend = function(F, U) {
        return F.$i || (F(U, D, x), F.$i = !0), x;
      }, x.locale = A, x.isDayjs = $, x.unix = function(F) {
        return x(1e3 * F);
      }, x.en = O[v], x.Ls = O, x.p = {}, x;
    }));
  })(Dn)), Dn.exports;
}
var $g = Ug();
const Ne = /* @__PURE__ */ zr($g);
var Tn = { exports: {} }, Vg = Tn.exports, za;
function Lg() {
  return za || (za = 1, (function(e, t) {
    (function(r, n) {
      e.exports = n();
    })(Vg, (function() {
      var r = "month", n = "quarter";
      return function(i, s) {
        var o = s.prototype;
        o.quarter = function(u) {
          return this.$utils().u(u) ? Math.ceil((this.month() + 1) / 3) : this.month(this.month() % 3 + 3 * (u - 1));
        };
        var a = o.add;
        o.add = function(u, l) {
          return u = Number(u), this.$utils().p(l) === n ? this.add(3 * u, r) : a.bind(this)(u, l);
        };
        var c = o.startOf;
        o.startOf = function(u, l) {
          var d = this.$utils(), p = !!d.u(l) || l;
          if (d.p(u) === n) {
            var g = this.quarter() - 1;
            return p ? this.month(3 * g).startOf(r).startOf("day") : this.month(3 * g + 2).endOf(r).endOf("day");
          }
          return c.bind(this)(u, l);
        };
      };
    }));
  })(Tn)), Tn.exports;
}
var Qg = Lg();
const jg = /* @__PURE__ */ zr(Qg);
var _n = { exports: {} }, Ng = _n.exports, Ba;
function zg() {
  return Ba || (Ba = 1, (function(e, t) {
    (function(r, n) {
      e.exports = n();
    })(Ng, (function() {
      var r = { LTS: "h:mm:ss A", LT: "h:mm A", L: "MM/DD/YYYY", LL: "MMMM D, YYYY", LLL: "MMMM D, YYYY h:mm A", LLLL: "dddd, MMMM D, YYYY h:mm A" }, n = /(\[[^[]*\])|([-_:/.,()\s]+)|(A|a|Q|YYYY|YY?|ww?|MM?M?M?|Do|DD?|hh?|HH?|mm?|ss?|S{1,3}|z|ZZ?)/g, i = /\d/, s = /\d\d/, o = /\d\d?/, a = /\d*[^-_:/,()\s\d]+/, c = {}, u = function(m) {
        return (m = +m) + (m > 68 ? 1900 : 2e3);
      }, l = function(m) {
        return function(C) {
          this[m] = +C;
        };
      }, d = [/[+-]\d\d:?(\d\d)?|Z/, function(m) {
        (this.zone || (this.zone = {})).offset = (function(C) {
          if (!C || C === "Z") return 0;
          var k = C.match(/([+-]|\d\d)/g), b = 60 * k[1] + (+k[2] || 0);
          return b === 0 ? 0 : k[0] === "+" ? -b : b;
        })(m);
      }], p = function(m) {
        var C = c[m];
        return C && (C.indexOf ? C : C.s.concat(C.f));
      }, g = function(m, C) {
        var k, b = c.meridiem;
        if (b) {
          for (var S = 1; S <= 24; S += 1) if (m.indexOf(b(S, 0, C)) > -1) {
            k = S > 12;
            break;
          }
        } else k = m === (C ? "pm" : "PM");
        return k;
      }, h = { A: [a, function(m) {
        this.afternoon = g(m, !1);
      }], a: [a, function(m) {
        this.afternoon = g(m, !0);
      }], Q: [i, function(m) {
        this.month = 3 * (m - 1) + 1;
      }], S: [i, function(m) {
        this.milliseconds = 100 * +m;
      }], SS: [s, function(m) {
        this.milliseconds = 10 * +m;
      }], SSS: [/\d{3}/, function(m) {
        this.milliseconds = +m;
      }], s: [o, l("seconds")], ss: [o, l("seconds")], m: [o, l("minutes")], mm: [o, l("minutes")], H: [o, l("hours")], h: [o, l("hours")], HH: [o, l("hours")], hh: [o, l("hours")], D: [o, l("day")], DD: [s, l("day")], Do: [a, function(m) {
        var C = c.ordinal, k = m.match(/\d+/);
        if (this.day = k[0], C) for (var b = 1; b <= 31; b += 1) C(b).replace(/\[|\]/g, "") === m && (this.day = b);
      }], w: [o, l("week")], ww: [s, l("week")], M: [o, l("month")], MM: [s, l("month")], MMM: [a, function(m) {
        var C = p("months"), k = (p("monthsShort") || C.map((function(b) {
          return b.slice(0, 3);
        }))).indexOf(m) + 1;
        if (k < 1) throw new Error();
        this.month = k % 12 || k;
      }], MMMM: [a, function(m) {
        var C = p("months").indexOf(m) + 1;
        if (C < 1) throw new Error();
        this.month = C % 12 || C;
      }], Y: [/[+-]?\d+/, l("year")], YY: [s, function(m) {
        this.year = u(m);
      }], YYYY: [/\d{4}/, l("year")], Z: d, ZZ: d };
      function f(m) {
        var C, k;
        C = m, k = c && c.formats;
        for (var b = (m = C.replace(/(\[[^\]]+])|(LTS?|l{1,4}|L{1,4})/g, (function(x, I, D) {
          var V = D && D.toUpperCase();
          return I || k[D] || r[D] || k[V].replace(/(\[[^\]]+])|(MMMM|MM|DD|dddd)/g, (function(F, U, y) {
            return U || y.slice(1);
          }));
        }))).match(n), S = b.length, v = 0; v < S; v += 1) {
          var O = b[v], _ = h[O], $ = _ && _[0], A = _ && _[1];
          b[v] = A ? { regex: $, parser: A } : O.replace(/^\[|\]$/g, "");
        }
        return function(x) {
          for (var I = {}, D = 0, V = 0; D < S; D += 1) {
            var F = b[D];
            if (typeof F == "string") V += F.length;
            else {
              var U = F.regex, y = F.parser, q = x.slice(V), E = U.exec(q)[0];
              y.call(I, E), x = x.replace(E, "");
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
      return function(m, C, k) {
        k.p.customParseFormat = !0, m && m.parseTwoDigitYear && (u = m.parseTwoDigitYear);
        var b = C.prototype, S = b.parse;
        b.parse = function(v) {
          var O = v.date, _ = v.utc, $ = v.args;
          this.$u = _;
          var A = $[1];
          if (typeof A == "string") {
            var x = $[2] === !0, I = $[3] === !0, D = x || I, V = $[2];
            I && (V = $[2]), c = this.$locale(), !x && V && (c = k.Ls[V]), this.$d = (function(q, E, T, L) {
              try {
                if (["x", "X"].indexOf(E) > -1) return new Date((E === "X" ? 1e3 : 1) * q);
                var N = f(E)(q), J = N.year, W = N.month, re = N.day, B = N.hours, X = N.minutes, Y = N.seconds, Z = N.milliseconds, le = N.zone, ce = N.week, K = /* @__PURE__ */ new Date(), te = re || (J || W ? 1 : K.getDate()), de = J || K.getFullYear(), he = 0;
                J && !W || (he = W > 0 ? W - 1 : K.getMonth());
                var Ae, ge = B || 0, Oe = X || 0, me = Y || 0, Ee = Z || 0;
                return le ? new Date(Date.UTC(de, he, te, ge, Oe, me, Ee + 60 * le.offset * 1e3)) : T ? new Date(Date.UTC(de, he, te, ge, Oe, me, Ee)) : (Ae = new Date(de, he, te, ge, Oe, me, Ee), ce && (Ae = L(Ae).week(ce).toDate()), Ae);
              } catch {
                return /* @__PURE__ */ new Date("");
              }
            })(O, A, _, k), this.init(), V && V !== !0 && (this.$L = this.locale(V).$L), D && O != this.format(A) && (this.$d = /* @__PURE__ */ new Date("")), c = {};
          } else if (A instanceof Array) for (var F = A.length, U = 1; U <= F; U += 1) {
            $[1] = A[U - 1];
            var y = k.apply(this, $);
            if (y.isValid()) {
              this.$d = y.$d, this.$L = y.$L, this.init();
              break;
            }
            U === F && (this.$d = /* @__PURE__ */ new Date(""));
          }
          else S.call(this, v);
        };
      };
    }));
  })(_n)), _n.exports;
}
var Bg = zg();
const Hg = /* @__PURE__ */ zr(Bg);
Ne.extend(Hg);
const xl = "YYYY/MM/DD@HH:mm:ss", Yg = "1401-01-01";
function Xn(e, t) {
  const r = Ne(e, t);
  return !r.isValid() && !t ? Ne(e, xl) : r;
}
function kl(e) {
  return e.format(xl);
}
function Wg(e, t) {
  const r = Xn(e, t);
  if (!r.isValid()) {
    const n = ". Please provide a date format string in the configuration options. See https://day.js.org/docs/en/parse/string-format for more information.", i = ` with the format "${t}"`;
    throw new Error(`Could not parse the provided date "${e}"${t ? i : n}`);
  }
  El(r);
}
function El(e) {
  if (e.isBefore(Yg))
    throw new Error(`Date is before year 1401, which is unsupported by the API: ${e}`);
}
Ne.extend(jg);
const Rl = ["past", "now", "next"], ql = [
  "minute",
  "hour",
  "day",
  "week",
  "month",
  "quarter",
  "year"
], Gg = (e) => {
  const t = e === "now";
  return {
    amount: new G({ required: !t, min: 1 }),
    unit: new Q({
      required: !t,
      constrainTo: ql
    }),
    period: new Q({
      required: !0,
      constrainTo: Rl
    })
  };
};
function Ha(e) {
  if (typeof e == "string" && !Tr(e))
    throw new Error(`The value "${e}" is not respecting the relative date format "period-amount-unit"`);
  const t = typeof e == "string" ? Dl(e) : e;
  new yt(Gg(t.period)).validate(t);
  const r = Ol(t), n = JSON.stringify(t);
  if (!r.isValid())
    throw new Error(`Date is invalid: ${n}`);
  El(r);
}
function Kg(e) {
  const { period: t, amount: r, unit: n } = e;
  switch (t) {
    case "past":
    case "next":
      return `${t}-${r}-${n}`;
    case "now":
      return t;
  }
}
function Ol(e) {
  const { period: t, amount: r, unit: n } = e;
  switch (t) {
    case "past":
      return Ne().subtract(r, n);
    case "next":
      return Ne().add(r, n);
    case "now":
      return Ne();
  }
}
function Vs(e) {
  return kl(Ol(Dl(e)));
}
function Fl(e) {
  return e.toLocaleLowerCase().split("-");
}
function Tr(e) {
  const [t, r, n] = Fl(e);
  if (t === "now")
    return !0;
  if (!Rl.includes(t) || !ql.includes(n))
    return !1;
  const i = parseInt(r, 10);
  return !(Number.isNaN(i) || i <= 0);
}
function Jg(e) {
  return !!e && typeof e == "object" && "period" in e;
}
function Dl(e) {
  const [t, r, n] = Fl(e);
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
}), Ue = new Q({
  required: !0,
  emptyAllowed: !0
}), Zg = new Q({
  required: !1,
  emptyAllowed: !0
}), Xg = new ae({
  each: j,
  required: !0
}), em = new Q({
  required: !1,
  emptyAllowed: !1,
  regex: /^\d+\.\d+\.\d+$/
}), tm = new Q({
  required: !1,
  emptyAllowed: !1,
  regex: /^[a-zA-Z0-9_\-.]{1,100}$/
}), rm = new Q({
  required: !0,
  emptyAllowed: !1,
  regex: /^[a-zA-Z0-9_\-.]{1,100}$/
}), it = ({ message: e, name: t, stack: r }) => ({ message: e, name: t, stack: r }), ze = (e, t) => {
  if ("required" in t)
    return {
      payload: new yt({
        value: t
      }).validate({ value: e }).value
    };
  const i = new z({
    options: { required: !0 },
    values: t
  }).validate(e);
  if (i)
    throw new Zu(i);
  return { payload: e };
}, R = (e, t) => {
  try {
    return ze(e, t);
  } catch (r) {
    return {
      payload: e,
      error: it(r)
    };
  }
}, yo = "3.53.1", nm = ["@coveo/atomic", "@coveo/quantic"], Yi = () => ve, Tl = () => j, _l = w("configuration/updateBasicConfiguration", (e) => R(e, {
  accessToken: ve,
  environment: new Q({
    required: !1,
    constrainTo: ["prod", "hipaa", "stg", "dev"]
  }),
  organizationId: ve
})), im = w("configuration/updateSearchConfiguration", (e) => R(e, {
  proxyBaseUrl: new Q({ required: !1, url: !0 }),
  pipeline: new Q({ required: !1, emptyAllowed: !0 }),
  searchHub: ve,
  timezone: ve,
  locale: ve,
  authenticationProviders: new ae({
    required: !1,
    each: j
  })
})), Mn = {
  enabled: new ie({ default: !0 }),
  originContext: Yi(),
  originLevel2: Yi(),
  originLevel3: Yi(),
  proxyBaseUrl: new Q({ required: !1, url: !0 }),
  runtimeEnvironment: new Ie(),
  anonymous: new ie({ default: !1 }),
  deviceId: ve,
  userDisplayName: ve,
  documentLocation: ve,
  trackingId: tm,
  analyticsMode: new Q({
    constrainTo: ["legacy", "next"],
    required: !1,
    default: "next"
  }),
  source: new z({
    options: { required: !1 },
    values: nm.reduce((e, t) => (e[t] = em, e), {})
  })
}, sm = w("configuration/updateAnalyticsConfiguration", (e) => R(e, Mn)), om = w("configuration/analytics/disable"), am = w("configuration/analytics/enable"), cm = w("configuration/analytics/originlevel2", (e) => R(e, { originLevel2: Tl() })), um = w("configuration/analytics/originlevel3", (e) => R(e, { originLevel3: Tl() })), lm = w("knowledge/setAgentId", (e) => R(e, new Q({ required: !0 }))), dm = w("commerce/configuration/updateBasicConfiguration", (e) => R(e, {
  accessToken: ve,
  environment: new Q({
    required: !1,
    constrainTo: ["prod", "hipaa", "stg", "dev"]
  }),
  organizationId: ve
})), fm = w("commerce/configuration/updateProxyBaseUrl", (e) => R(e, {
  proxyBaseUrl: new Q({ required: !1, url: !0 })
})), hm = w("commerce/configuration/updateAnalyticsConfiguration", (e) => R(e, {
  enabled: Mn.enabled,
  proxyBaseUrl: Mn.proxyBaseUrl,
  source: Mn.source,
  trackingId: rm
})), pm = w("commerce/configuration/analytics/disable"), gm = w("commerce/configuration/analytics/enable"), mm = () => ({
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
se(mm(), (e) => e.addCase(dm, (t, r) => {
  Ya(t, r.payload);
}).addCase(_l, (t, r) => {
  Ya(t, r.payload);
}).addCase(fm, (t, r) => {
  ym(t, r.payload);
}).addCase(hm, (t, r) => {
  vm(t, r.payload);
}).addCase(pm, (t) => {
  t.analytics.enabled = !1;
}).addCase(gm, (t) => {
  t.analytics.enabled = !0;
}));
function Ya(e, t) {
  ee(t.accessToken) || (e.accessToken = t.accessToken), e.environment = t.environment ?? "prod", ee(t.organizationId) || (e.organizationId = t.organizationId);
}
function ym(e, t) {
  ee(t.proxyBaseUrl) || (e.commerce.apiBaseUrl = t.proxyBaseUrl);
}
function vm(e, t) {
  ee(t.enabled) || (e.analytics.enabled = t.enabled), ee(t.proxyBaseUrl) || (e.analytics.apiBaseUrl = t.proxyBaseUrl), ee(t.source) || (e.analytics.source = t.source), ee(t.trackingId) || (e.analytics.trackingId = t.trackingId);
}
function mi(e) {
  return e.currency;
}
const Sm = (e, t) => ({
  currency: mi(t.commerceContext),
  products: bm(t.cart),
  transaction: e
}), wm = (e, t) => ({
  currency: mi(t.commerceContext),
  ...e
}), vo = fe((e) => e.cart, (e) => e.cartItems, (e, t) => t.map((r) => e[r])), bm = fe(vo, (e) => e.map(({ quantity: t, ...r }) => ({
  quantity: t,
  product: r
}))), Ml = {
  productId: j,
  quantity: new G({
    required: !0,
    min: 0
  }),
  name: new Q({ required: !1 }),
  price: new G({ required: !1, min: 0 })
}, Pl = new ae({
  each: new z({
    values: {
      ...Ml
    }
  })
}), Cm = {
  items: Pl
}, Im = w("commerce/cart/setItems", (e) => R(e, Pl)), Am = w("commerce/cart/updateItemQuantity", (e) => R(e, Ml)), xm = w("commerce/cart/purchase");
ne("commerce/cart/emit/purchaseEvent", async (e, { extra: t, getState: r }) => {
  const n = Sm(e, r()), { relay: i } = t;
  i.emit("ec.purchase", n);
});
ne("commerce/cart/emit/cartActionEvent", async (e, { extra: t, getState: r }) => {
  const n = wm(e, r()), { relay: i } = t;
  i.emit("ec.cartAction", n);
});
fe(vo, (e) => e.reduce((t, r) => t + r.quantity, 0));
fe(vo, (e) => e.reduce((t, r) => t + r.price * r.quantity, 0));
function ei(e) {
  return `${e.productId},${e.name},${e.price}`;
}
const Wi = () => ({
  cartItems: [],
  cart: {},
  purchasedItems: [],
  purchased: {}
}), km = (e) => Ul(e.cartItems, e.cart), Em = (e) => Ul(e.purchasedItems, e.purchased);
function Ul(e, t) {
  const r = e.reduce((n, i) => {
    const { productId: s, quantity: o } = t[i];
    return s in n || (n[s] = {
      productId: s,
      quantity: 0
    }), n[s].quantity += o, n;
  }, {});
  return [...Object.values(r)];
}
se(Wi(), (e) => {
  e.addCase(Im, (t, { payload: r }) => {
    const { cart: n, cartItems: i } = r.reduce((s, o) => {
      const a = ei(o);
      return {
        cartItems: [...s.cartItems, a],
        cart: {
          ...s.cart,
          [a]: o
        },
        purchasedItems: [],
        purchased: {}
      };
    }, Wi());
    Wa(t, i, n);
  }).addCase(Am, (t, { payload: r }) => {
    const n = ei(r);
    if (!(n in t.cart)) {
      Rm(r, t);
      return;
    }
    if (r.quantity <= 0) {
      qm(r, t);
      return;
    }
    t.cart[n] = r;
  }).addCase(xm, (t) => {
    Om(t);
    const { cart: r, cartItems: n } = Wi();
    Wa(t, n, r);
  });
});
function Wa(e, t, r) {
  e.cartItems = t, e.cart = r;
}
function Rm(e, t) {
  if (e.quantity <= 0)
    return;
  const r = ei(e);
  t.cartItems = [...t.cartItems, r], t.cart[r] = e;
}
function qm(e, t) {
  const r = ei(e);
  t.cartItems = t.cartItems.filter((n) => n !== r), delete t.cart[r];
}
function Om(e) {
  for (const t of e.cartItems) {
    if (t in e.purchased) {
      e.purchased[t].quantity += e.cart[t].quantity;
      continue;
    }
    e.purchasedItems = [...e.purchasedItems, t], e.purchased[t] = e.cart[t];
  }
}
const Fm = Intl.supportedValuesOf("currency"), Dm = new Q({
  required: !0,
  emptyAllowed: !1,
  constrainTo: Fm
}), $l = {
  url: j
}, Vl = {
  latitude: new G({ min: -90, max: 90, required: !0 }),
  longitude: new G({ min: -180, max: 180, required: !0 })
}, Tm = {
  custom: new z({
    options: { required: !1 }
  })
}, Ll = {
  language: j,
  country: j,
  currency: Dm,
  view: new z({
    options: { required: !0 },
    values: $l
  }),
  location: new z({
    options: { required: !1 },
    values: Vl
  }),
  custom: new z({
    options: { required: !1 }
  })
}, Ut = w("commerce/context/set", (e) => R(e, Ll)), st = w("commerce/context/setView", (e) => R(e, $l)), _m = w("commerce/context/setLocation", (e) => R(e, Vl)), Mm = w("commerce/context/setCustom", (e) => R({ custom: e }, Tm)), Pm = () => ({
  language: "",
  country: "",
  currency: "",
  view: {
    url: ""
  }
});
se(Pm(), (e) => {
  e.addCase(Ut, (t, { payload: r }) => r).addCase(st, (t, { payload: r }) => {
    t.view = r;
  }).addCase(_m, (t, { payload: r }) => {
    t.location = r;
  }).addCase(Mm, (t, { payload: r }) => {
    t.custom = r.custom;
  });
});
const Ql = () => ({
  correctedQuery: "",
  corrections: [],
  originalQuery: ""
}), yi = fe((e) => e.source, (e) => Object.entries(e).map(([t, r]) => `${t}@${r}`).concat(`@coveo/headless@${yo}`)), Hr = (e, t) => {
  const { view: r, location: n, custom: i, ...s } = e.commerceContext;
  return {
    accessToken: e.configuration.accessToken,
    url: e.configuration.commerce.apiBaseUrl ?? Mg(e.configuration.organizationId, e.configuration.environment),
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
      cart: km(e.cart),
      source: yi(e.configuration.analytics),
      ...i ? { custom: i } : {}
    }
  };
}, jl = (e, t, r) => ({
  ...Hr(e, t),
  ...Um(e, r)
}), Um = (e, t) => {
  var n, i;
  const r = t ? (n = e.commercePagination) == null ? void 0 : n.recommendations[t] : (i = e.commercePagination) == null ? void 0 : i.principal;
  return r && {
    page: r.page,
    ...r.perPage && {
      perPage: r.perPage
    }
  };
}, $t = (e, t) => ({
  ...jl(e, t),
  facets: [...$m(e)],
  ...e.commerceSort && {
    sort: Vm(e.commerceSort.appliedSort)
  }
});
function $m(e) {
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
function Vm(e) {
  return e.by === Qe.Relevance ? {
    sortCriteria: Qe.Relevance
  } : {
    sortCriteria: Qe.Fields,
    fields: e.fields.map(({ name: t, direction: r }) => ({
      field: t,
      direction: r
    }))
  };
}
const Lm = w("commerce/facets/core/updateNumberOfValues", (e) => R(e, {
  facetId: j,
  numberOfValues: new G({ required: !0, min: 1 })
})), Qm = w("commerce/facets/core/updateIsFieldExpanded", (e) => R(e, {
  facetId: j,
  isFieldExpanded: new ie({ required: !0 })
})), vi = w("commerce/facets/core/clearAll"), So = w("commerce/facets/core/deleteAll"), Si = w("commerce/facets/core/deselectAllValues", (e) => R(e, {
  facetId: j
})), jm = w("commerce/facets/core/updateFreezeCurrentValues", (e) => R(e, {
  facetId: j,
  freezeCurrentValues: new ie({ required: !0 })
})), Nl = w("commerce/facets/core/updateAutoSelectionForAll", (e) => R(e, {
  allow: new ie({ required: !0 })
})), wi = {
  slotId: Zg
}, Nm = {
  ...wi,
  pageSize: new G({ required: !0, min: 0 })
}, zl = w("commerce/pagination/setPageSize", (e) => R(e, Nm)), zm = {
  ...wi,
  page: new G({ required: !0, min: 0 })
}, wo = w("commerce/pagination/selectPage", (e) => R(e, zm)), Bl = w("commerce/pagination/nextPage", (e) => R(e, wi)), Hl = w("commerce/pagination/previousPage", (e) => R(e, wi)), Bm = w("commerce/pagination/registerRecommendationsSlot", (e) => R(e, {
  slotId: j
})), bi = w("commerce/query/update", (e) => R(e, {
  query: new Q()
})), Yl = w("commerce/triggers/query/updateIgnore", (e) => R(e, {
  q: new Q({ emptyAllowed: !0, required: !0 })
})), Wl = w("commerce/triggers/query/applyModification", (e) => R(e, new z({
  values: { originalQuery: ve, modification: ve }
})));
let Gl = class {
  constructor(t) {
    H(this, "config");
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
    return je(t.response) ? this.rejectWithValue(t.response.error) : null;
  }
  async processQueryCorrectionsOrContinue(t) {
    const r = this.getState(), n = this.getSuccessResponse(t);
    if (!n || !r.didYouMean)
      return null;
    const { queryCorrection: i } = n;
    if (!(!ee(i) && !ee(i.correctedQuery)))
      return null;
    const { correctedQuery: o, originalQuery: a } = n.queryCorrection;
    return this.onUpdateQueryForCorrection(o ?? ""), {
      ...t,
      response: {
        ...n
      },
      queryExecuted: xg(r, n),
      originalQuery: a ?? ""
    };
  }
  async processQueryTriggersOrContinue(t) {
    var a, c;
    const r = this.getSuccessResponse(t);
    if (!r)
      return null;
    const n = ((a = r.triggers.find((u) => u.type === "query")) == null ? void 0 : a.content) || "";
    if (!n)
      return null;
    if (((c = this.getState().triggers) == null ? void 0 : c.queryModification.queryToIgnore) === n)
      return this.dispatch(Yl({ q: "" })), null;
    const s = this.getCurrentQuery(), o = await this.automaticallyRetryQueryWithTriggerModification(n, t.enableResults);
    return je(o.response) ? this.rejectWithValue(o.response.error) : {
      ...o,
      response: {
        ...o.response.success
      },
      originalQuery: s
    };
  }
  async automaticallyRetryQueryWithTriggerModification(t, r) {
    return this.dispatch(Wl({
      newQuery: t,
      originalQuery: this.getCurrentQuery()
    })), this.onUpdateQueryForCorrection(t), await this.fetchFromAPI({
      ...$t(this.getState(), this.navigatorContext),
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
    return je(t.response) ? null : t.response.success;
  }
  get extra() {
    return this.config.extra;
  }
  onUpdateQueryForCorrection(t) {
    this.dispatch(bi({ query: t }));
  }
};
const Re = ne("commerce/search/executeSearch", async (e = {}, t) => {
  const { getState: r } = t, n = r(), { navigatorContext: i } = t.extra, s = $t(n, i), o = go(n), a = new Gl(t), c = await a.fetchFromAPI({
    ...s,
    query: o,
    enableResults: !!(e != null && e.enableResults)
  });
  return a.process(c);
}), Gi = ne("commerce/search/fetchMoreProducts", async (e = {}, t) => {
  const { getState: r } = t, n = r(), { navigatorContext: i } = t.extra;
  if (!Ag(n))
    return null;
  const o = yl(n), c = bl(n) / o, u = go(n), l = $t(n, i), d = new Gl(t), p = await d.fetchFromAPI({
    ...l,
    query: u,
    page: c,
    enableResults: !!(e != null && e.enableResults)
  });
  return d.process(p);
});
ne("commerce/search/prepareForSearchWithQuery", (e, t) => {
  const { dispatch: r } = t;
  R(e, {
    query: new Q(),
    clearFilters: new ie()
  }), e.clearFilters && r(So()), r(Nl({ allow: !0 })), r(bi({
    query: e.query
  })), r(wo({ page: 0 }));
});
const Ki = ne("commerce/search/fetchInstantProducts", async (e, { getState: t, rejectWithValue: r, extra: n }) => {
  const i = t(), { apiClient: s, navigatorContext: o } = n, { q: a } = e, c = await s.productSuggestions({
    ...Hr(i, o),
    query: a
  });
  return je(c) ? r(c.error) : {
    response: { ...c.success, products: c.success.products }
  };
}), Hm = {
  child: new z({
    options: { required: !0 },
    values: {
      permanentid: new Q({ required: !0 })
    }
  })
}, Ym = w("commerce/search/promoteChildToParent", (e) => R(e, Hm));
function Wm() {
  return {
    wasCorrectedTo: "",
    queryCorrection: Ql(),
    originalQuery: ""
  };
}
se(Wm(), (e) => {
  e.addCase(Re.pending, (t) => {
    t.queryCorrection = Ql(), t.wasCorrectedTo = "";
  }).addCase(Re.fulfilled, (t, r) => {
    var i, s;
    const { queryCorrection: n } = r.payload.response;
    t.originalQuery = r.payload.originalQuery, t.wasCorrectedTo = (n == null ? void 0 : n.correctedQuery) ?? "", t.queryCorrection = {
      correctedQuery: (n == null ? void 0 : n.correctedQuery) ?? ((i = n == null ? void 0 : n.corrections[0]) == null ? void 0 : i.correctedQuery) ?? "",
      wordCorrections: ((s = n == null ? void 0 : n.corrections[0]) == null ? void 0 : s.wordCorrections) ?? []
    };
  });
});
function Pn() {
  return [];
}
const Me = ne("commerce/productListing/fetch", async (e, { getState: t, rejectWithValue: r, extra: { apiClient: n, navigatorContext: i } }) => {
  const s = t(), o = $t(s, i), a = await n.getProductListing({
    ...o,
    enableResults: !!(e != null && e.enableResults)
  });
  return je(a) ? r(a.error) : {
    response: a.success
  };
}), Ji = ne("commerce/productListing/fetchMoreProducts", async (e, { getState: t, rejectWithValue: r, extra: { apiClient: n, navigatorContext: i } }) => {
  const s = t();
  if (!Hp(s))
    return null;
  const a = yl(s), u = Sl(s) / a, l = await n.getProductListing({
    ...$t(s, i),
    enableResults: !!(e != null && e.enableResults),
    page: u
  });
  return je(l) ? r(l.error) : {
    response: l.success
  };
}), Gm = {
  child: new z({
    options: { required: !0 },
    values: {
      permanentid: new Q({ required: !0 })
    }
  })
}, Km = w("commerce/productListing/promoteChildToParent", (e) => R(e, Gm)), Kl = {
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
  page: new G({ min: 0 }),
  perPage: new G({ min: 1 })
}, or = w("commerce/productListingParameters/restore", (e) => R(e, Kl)), Jm = {
  q: new Q(),
  ...Kl
}, vt = w("commerce/searchParameters/restore", (e) => R(e, Jm));
se(Pn(), (e) => {
  e.addCase(Me.fulfilled, Ga).addCase(Re.fulfilled, Ga).addCase(vt, Ka).addCase(or, Ka).addCase(st, () => Pn()).addCase(Ut, () => Pn());
});
function Ga(e, t) {
  return t.payload.response.facets.map((r) => r.facetId);
}
function Ka(e, t) {
  return [
    ...Object.keys(t.payload.f ?? {}),
    ...Object.keys(t.payload.lf ?? {}),
    ...Object.keys(t.payload.nf ?? {}),
    ...Object.keys(t.payload.df ?? {}),
    ...Object.keys(t.payload.cf ?? {}),
    ...Object.keys(t.payload.mnf ?? {})
  ];
}
const ue = j, bo = {
  facetId: ue,
  captions: new z({ options: { required: !1 } }),
  numberOfValues: new G({ required: !1, min: 1 }),
  query: new Q({ required: !1, emptyAllowed: !0 })
}, Zm = {
  path: new ae({
    required: !0,
    each: j
  }),
  displayValue: Ue,
  rawValue: Ue,
  count: new G({ required: !0, min: 0 })
}, Co = w("categoryFacet/selectSearchResult", (e) => R(e, {
  facetId: ue,
  value: new z({ values: Zm })
})), Xm = w("categoryFacetSearch/register", (e) => R(e, bo));
function ey() {
  return {};
}
function Io(e, t, r) {
  const { facetId: n } = t;
  if (e[n])
    return;
  const i = !1, s = { ...Zt, ...t }, o = r();
  e[n] = {
    options: s,
    isLoading: i,
    response: o,
    initialNumberOfValues: s.numberOfValues,
    requestId: ""
  };
}
function Jl(e, t) {
  const { facetId: r, ...n } = t, i = e[r];
  i && (i.options = { ...i.options, ...n });
}
function ti(e, t, r) {
  const n = e[t];
  n && (n.requestId = r, n.isLoading = !0);
}
function ri(e, t) {
  const r = e[t];
  r && (r.isLoading = !1);
}
function Ao(e, t, r) {
  const { facetId: n } = t, i = e[n];
  i && (i.requestId = "", i.isLoading = !1, i.response = r(), i.options.numberOfValues = i.initialNumberOfValues, i.options.query = Zt.query);
}
function Ar(e, t) {
  Object.keys(e).forEach((r) => Ao(e, { facetId: r }, t));
}
const Zt = {
  captions: {},
  numberOfValues: 10,
  query: ""
};
function ar(e) {
  return Object.values(e).map((t) => t.request);
}
function Zl(e, t) {
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
function Ja(e) {
  return ar(e).map((t) => {
    const n = t.currentValues.some(({ state: i }) => i !== "idle");
    return t.generateAutomaticRanges && !n ? { ...t, currentValues: [] } : t;
  });
}
const Xl = {
  alphanumericDescending: { type: "alphanumeric", order: "descending" },
  alphanumericNaturalDescending: {
    type: "alphanumericNatural",
    order: "descending"
  }
};
function ty(e) {
  return ar(e).map((t) => {
    const r = Xl[t.sortCriteria];
    return r ? {
      ...t,
      sortCriteria: r
    } : t;
  });
}
function ry(e) {
  return [
    ...ty(e.facetSet ?? {}),
    ...Ja(e.numericFacetSet ?? {}),
    ...Ja(e.dateFacetSet ?? {}),
    ...ar(e.categoryFacetSet ?? {})
  ];
}
function ny(e) {
  return ry(e).filter(({ facetId: t }) => {
    var r, n;
    return ((n = (r = e.facetOptions) == null ? void 0 : r.facets[t]) == null ? void 0 : n.enabled) ?? !0;
  });
}
function ed(e) {
  return Zl(ny(e), e.facetOrder ?? []);
}
const iy = 1, _r = 5e3;
let Zi = class td {
  static set(t, r, n) {
    let i, s, o;
    n && (s = /* @__PURE__ */ new Date(), s.setTime(s.getTime() + n));
    const a = window.location.hostname, c = /^(\d{1,3}\.){3}\d{1,3}$/, u = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/;
    c.test(a) || u.test(a) || a.indexOf(".") === -1 ? Xi(t, r, s) : (o = a.split("."), i = o[o.length - 2] + "." + o[o.length - 1], Xi(t, r, s, i));
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
    td.set(t, "", -1);
  }
};
function Xi(e, t, r, n) {
  document.cookie = `${e}=${t}` + (r ? `;expires=${r.toUTCString()}` : "") + (n ? `;domain=${n}` : "") + ";path=/;SameSite=Lax" + (window.location.protocol === "https:" ? ";Secure" : "");
}
function sy() {
  return typeof navigator < "u";
}
function oy() {
  try {
    return typeof localStorage < "u";
  } catch {
    return !1;
  }
}
function ay() {
  try {
    return typeof sessionStorage < "u";
  } catch {
    return !1;
  }
}
function cy() {
  return !!(sy() && navigator.cookieEnabled);
}
function uy() {
  return oy() ? localStorage : cy() ? new ly() : ay() ? sessionStorage : new dy();
}
var Xe;
let ly = (Xe = class {
  getItem(t) {
    return Zi.get(`${Xe.prefix}${t}`);
  }
  removeItem(t) {
    Zi.erase(`${Xe.prefix}${t}`);
  }
  setItem(t, r, n) {
    Zi.set(`${Xe.prefix}${t}`, r, n);
  }
}, H(Xe, "prefix", "coveo_"), Xe), dy = class {
  getItem(t) {
    return null;
  }
  removeItem(t) {
  }
  setItem(t, r) {
  }
};
const yn = "__coveo.analytics.history", fy = 20, hy = 1e3 * 60, py = 75;
var Le;
let cr = (Le = class {
  constructor(t) {
    H(this, "store");
    this.store = t || uy();
  }
  static getInstance(t) {
    return Le.instance || (Le.instance = new Le(t)), Le.instance;
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
      const t = this.store.getItem(yn);
      return t && typeof t == "string" ? JSON.parse(t) : [];
    } catch {
      return [];
    }
  }
  async getHistoryWithInternalTimeAsync() {
    try {
      const t = await this.store.getItem(yn);
      return t ? JSON.parse(t) : [];
    } catch {
      return [];
    }
  }
  setHistory(t) {
    try {
      this.store.setItem(yn, JSON.stringify(t.slice(0, fy)));
    } catch {
    }
  }
  clear() {
    try {
      this.store.removeItem(yn);
    } catch {
    }
  }
  getMostRecentElement() {
    const t = this.getHistoryWithInternalTime();
    return Array.isArray(t) ? t.sort((n, i) => (i.internalTime || 0) - (n.internalTime || 0))[0] : null;
  }
  cropQueryElement(t) {
    return t.name && t.value && t.name.toLowerCase() === "query" && (t.value = t.value.slice(0, py)), t;
  }
  isValidEntry(t) {
    const r = this.getMostRecentElement();
    return r && r.value === t.value ? (t.internalTime || 0) - (r.internalTime || 0) > hy : !0;
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
}, H(Le, "instance", null), Le);
function We(e, t) {
  var r = {};
  for (var n in e) Object.prototype.hasOwnProperty.call(e, n) && t.indexOf(n) < 0 && (r[n] = e[n]);
  if (e != null && typeof Object.getOwnPropertySymbols == "function")
    for (var i = 0, n = Object.getOwnPropertySymbols(e); i < n.length; i++)
      t.indexOf(n[i]) < 0 && Object.prototype.propertyIsEnumerable.call(e, n[i]) && (r[n[i]] = e[n[i]]);
  return r;
}
function M(e, t, r, n) {
  function i(s) {
    return s instanceof r ? s : new r(function(o) {
      o(s);
    });
  }
  return new (r || (r = Promise))(function(s, o) {
    function a(l) {
      try {
        u(n.next(l));
      } catch (d) {
        o(d);
      }
    }
    function c(l) {
      try {
        u(n.throw(l));
      } catch (d) {
        o(d);
      }
    }
    function u(l) {
      l.done ? s(l.value) : i(l.value).then(a, c);
    }
    u((n = n.apply(e, t || [])).next());
  });
}
var oe;
(function(e) {
  e.search = "search", e.click = "click", e.custom = "custom", e.view = "view", e.collect = "collect";
})(oe || (oe = {}));
function Ls() {
  return typeof window < "u";
}
function xo() {
  return typeof navigator < "u";
}
function Qs() {
  return typeof document < "u";
}
function js() {
  try {
    return typeof localStorage < "u";
  } catch {
    return !1;
  }
}
function gy() {
  try {
    return typeof sessionStorage < "u";
  } catch {
    return !1;
  }
}
function rd() {
  return xo() && navigator.cookieEnabled;
}
const my = [oe.click, oe.custom, oe.search, oe.view], yy = (e, t) => my.indexOf(e) !== -1 ? Object.assign({ language: Qs() ? document.documentElement.lang : "unknown", userAgent: xo() ? navigator.userAgent : "unknown" }, t) : t;
class xr {
  static set(t, r, n) {
    var i, s, o, a;
    n && (s = /* @__PURE__ */ new Date(), s.setTime(s.getTime() + n)), a = window.location.hostname, a.indexOf(".") === -1 ? Za(t, r, s) : (o = a.split("."), i = o[o.length - 2] + "." + o[o.length - 1], Za(t, r, s, i));
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
    xr.set(t, "", -1);
  }
}
function Za(e, t, r, n) {
  document.cookie = `${e}=${t}` + (r ? `;expires=${r.toUTCString()}` : "") + (n ? `;domain=${n}` : "") + ";path=/;SameSite=Lax";
}
function vy() {
  return js() ? localStorage : rd() ? new Et() : gy() ? sessionStorage : new Ci();
}
class Et {
  getItem(t) {
    return xr.get(`${Et.prefix}${t}`);
  }
  removeItem(t) {
    xr.erase(`${Et.prefix}${t}`);
  }
  setItem(t, r, n) {
    xr.set(`${Et.prefix}${t}`, r, n);
  }
}
Et.prefix = "coveo_";
class Sy {
  constructor() {
    this.cookieStorage = new Et();
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
class Ci {
  getItem(t) {
    return null;
  }
  removeItem(t) {
  }
  setItem(t, r) {
  }
}
const vn = "__coveo.analytics.history", wy = 20, by = 1e3 * 60, Cy = 75;
class nd {
  constructor(t) {
    this.store = t || vy();
  }
  addElement(t) {
    t.internalTime = (/* @__PURE__ */ new Date()).getTime(), t = this.cropQueryElement(this.stripEmptyQuery(t));
    let r = this.getHistoryWithInternalTime();
    r != null ? this.isValidEntry(t) && this.setHistory([t].concat(r)) : this.setHistory([t]);
  }
  addElementAsync(t) {
    return M(this, void 0, void 0, function* () {
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
    return M(this, void 0, void 0, function* () {
      const t = yield this.getHistoryWithInternalTimeAsync();
      return this.stripEmptyQueries(this.stripInternalTime(t));
    });
  }
  getHistoryWithInternalTime() {
    try {
      const t = this.store.getItem(vn);
      return t && typeof t == "string" ? JSON.parse(t) : [];
    } catch {
      return [];
    }
  }
  getHistoryWithInternalTimeAsync() {
    return M(this, void 0, void 0, function* () {
      try {
        const t = yield this.store.getItem(vn);
        return t ? JSON.parse(t) : [];
      } catch {
        return [];
      }
    });
  }
  setHistory(t) {
    try {
      this.store.setItem(vn, JSON.stringify(t.slice(0, wy)));
    } catch {
    }
  }
  clear() {
    try {
      this.store.removeItem(vn);
    } catch {
    }
  }
  getMostRecentElement() {
    let t = this.getHistoryWithInternalTime();
    return Array.isArray(t) ? t.sort((n, i) => (i.internalTime || 0) - (n.internalTime || 0))[0] : null;
  }
  cropQueryElement(t) {
    return t.name && t.value && t.name.toLowerCase() === "query" && (t.value = t.value.slice(0, Cy)), t;
  }
  isValidEntry(t) {
    let r = this.getMostRecentElement();
    return r && r.value == t.value ? (t.internalTime || 0) - (r.internalTime || 0) > by : !0;
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
const Iy = (e, t) => M(void 0, void 0, void 0, function* () {
  return e === oe.view ? (yield Ay(t.contentIdValue), Object.assign({ location: window.location.toString(), referrer: document.referrer, title: document.title }, t)) : t;
}), Ay = (e) => M(void 0, void 0, void 0, function* () {
  const t = new nd(), r = {
    name: "PageView",
    value: e,
    time: (/* @__PURE__ */ new Date()).toISOString()
  };
  yield t.addElementAsync(r);
});
let Sn;
const xy = new Uint8Array(16);
function ky() {
  if (!Sn && (Sn = typeof crypto < "u" && crypto.getRandomValues && crypto.getRandomValues.bind(crypto), !Sn))
    throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");
  return Sn(xy);
}
var Ey = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;
function ni(e) {
  return typeof e == "string" && Ey.test(e);
}
const Se = [];
for (let e = 0; e < 256; ++e)
  Se.push((e + 256).toString(16).slice(1));
function id(e, t = 0) {
  return Se[e[t + 0]] + Se[e[t + 1]] + Se[e[t + 2]] + Se[e[t + 3]] + "-" + Se[e[t + 4]] + Se[e[t + 5]] + "-" + Se[e[t + 6]] + Se[e[t + 7]] + "-" + Se[e[t + 8]] + Se[e[t + 9]] + "-" + Se[e[t + 10]] + Se[e[t + 11]] + Se[e[t + 12]] + Se[e[t + 13]] + Se[e[t + 14]] + Se[e[t + 15]];
}
function Ry(e) {
  if (!ni(e))
    throw TypeError("Invalid UUID");
  let t;
  const r = new Uint8Array(16);
  return r[0] = (t = parseInt(e.slice(0, 8), 16)) >>> 24, r[1] = t >>> 16 & 255, r[2] = t >>> 8 & 255, r[3] = t & 255, r[4] = (t = parseInt(e.slice(9, 13), 16)) >>> 8, r[5] = t & 255, r[6] = (t = parseInt(e.slice(14, 18), 16)) >>> 8, r[7] = t & 255, r[8] = (t = parseInt(e.slice(19, 23), 16)) >>> 8, r[9] = t & 255, r[10] = (t = parseInt(e.slice(24, 36), 16)) / 1099511627776 & 255, r[11] = t / 4294967296 & 255, r[12] = t >>> 24 & 255, r[13] = t >>> 16 & 255, r[14] = t >>> 8 & 255, r[15] = t & 255, r;
}
function qy(e) {
  e = unescape(encodeURIComponent(e));
  const t = [];
  for (let r = 0; r < e.length; ++r)
    t.push(e.charCodeAt(r));
  return t;
}
const Oy = "6ba7b810-9dad-11d1-80b4-00c04fd430c8", Fy = "6ba7b811-9dad-11d1-80b4-00c04fd430c8";
function Dy(e, t, r) {
  function n(i, s, o, a) {
    var c;
    if (typeof i == "string" && (i = qy(i)), typeof s == "string" && (s = Ry(s)), ((c = s) === null || c === void 0 ? void 0 : c.length) !== 16)
      throw TypeError("Namespace must be array-like (16 iterable integer values, 0-255)");
    let u = new Uint8Array(16 + i.length);
    if (u.set(s), u.set(i, s.length), u = r(u), u[6] = u[6] & 15 | t, u[8] = u[8] & 63 | 128, o) {
      a = a || 0;
      for (let l = 0; l < 16; ++l)
        o[a + l] = u[l];
      return o;
    }
    return id(u);
  }
  try {
    n.name = e;
  } catch {
  }
  return n.DNS = Oy, n.URL = Fy, n;
}
const Ty = typeof crypto < "u" && crypto.randomUUID && crypto.randomUUID.bind(crypto);
var Xa = {
  randomUUID: Ty
};
function es(e, t, r) {
  if (Xa.randomUUID && !e)
    return Xa.randomUUID();
  e = e || {};
  const n = e.random || (e.rng || ky)();
  return n[6] = n[6] & 15 | 64, n[8] = n[8] & 63 | 128, id(n);
}
function _y(e, t, r, n) {
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
function ts(e, t) {
  return e << t | e >>> 32 - t;
}
function My(e) {
  const t = [1518500249, 1859775393, 2400959708, 3395469782], r = [1732584193, 4023233417, 2562383102, 271733878, 3285377520];
  if (typeof e == "string") {
    const o = unescape(encodeURIComponent(e));
    e = [];
    for (let a = 0; a < o.length; ++a)
      e.push(o.charCodeAt(a));
  } else Array.isArray(e) || (e = Array.prototype.slice.call(e));
  e.push(128);
  const n = e.length / 4 + 2, i = Math.ceil(n / 16), s = new Array(i);
  for (let o = 0; o < i; ++o) {
    const a = new Uint32Array(16);
    for (let c = 0; c < 16; ++c)
      a[c] = e[o * 64 + c * 4] << 24 | e[o * 64 + c * 4 + 1] << 16 | e[o * 64 + c * 4 + 2] << 8 | e[o * 64 + c * 4 + 3];
    s[o] = a;
  }
  s[i - 1][14] = (e.length - 1) * 8 / Math.pow(2, 32), s[i - 1][14] = Math.floor(s[i - 1][14]), s[i - 1][15] = (e.length - 1) * 8 & 4294967295;
  for (let o = 0; o < i; ++o) {
    const a = new Uint32Array(80);
    for (let g = 0; g < 16; ++g)
      a[g] = s[o][g];
    for (let g = 16; g < 80; ++g)
      a[g] = ts(a[g - 3] ^ a[g - 8] ^ a[g - 14] ^ a[g - 16], 1);
    let c = r[0], u = r[1], l = r[2], d = r[3], p = r[4];
    for (let g = 0; g < 80; ++g) {
      const h = Math.floor(g / 20), f = ts(c, 5) + _y(h, u, l, d) + p + t[h] + a[g] >>> 0;
      p = d, d = l, l = ts(u, 30) >>> 0, u = c, c = f;
    }
    r[0] = r[0] + c >>> 0, r[1] = r[1] + u >>> 0, r[2] = r[2] + l >>> 0, r[3] = r[3] + d >>> 0, r[4] = r[4] + p >>> 0;
  }
  return [r[0] >> 24 & 255, r[0] >> 16 & 255, r[0] >> 8 & 255, r[0] & 255, r[1] >> 24 & 255, r[1] >> 16 & 255, r[1] >> 8 & 255, r[1] & 255, r[2] >> 24 & 255, r[2] >> 16 & 255, r[2] >> 8 & 255, r[2] & 255, r[3] >> 24 & 255, r[3] >> 16 & 255, r[3] >> 8 & 255, r[3] & 255, r[4] >> 24 & 255, r[4] >> 16 & 255, r[4] >> 8 & 255, r[4] & 255];
}
const Py = Dy("v5", 80, My);
var ec = Py;
const sd = "2.30.56", Uy = {
  pageview: "pageview",
  event: "event"
};
class Tt {
  constructor(t, r) {
    if (!ni(t))
      throw Error("Not a valid uuid");
    this.clientId = t, this.creationDate = Math.floor(r / 1e3);
  }
  toString() {
    return this.clientId.replace(/-/g, "") + "." + this.creationDate.toString();
  }
  get expired() {
    const t = Math.floor(Date.now() / 1e3) - this.creationDate;
    return t < 0 || t > Tt.expirationTime;
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
    return ni(s) ? new Tt(s, Number.parseInt(i) * 1e3) : null;
  }
}
Tt.cvo_cid = "cvo_cid";
Tt.expirationTime = 120;
const $e = Object.keys;
function wn(e) {
  return e !== null && typeof e == "object" && !Array.isArray(e);
}
const rs = 128, od = 192, tc = 224, rc = 240;
function $y(e) {
  return (e & 248) === rc ? 4 : (e & rc) === tc ? 3 : (e & tc) === od ? 2 : 1;
}
function Vy(e, t) {
  if (t < 0 || e.length <= t)
    return e;
  let r = e.indexOf("%", t - 2);
  for (r < 0 || r > t ? r = t : t = r; r > 2 && e.charAt(r - 3) == "%"; ) {
    const n = Number.parseInt(e.substring(r - 2, r), 16);
    if ((n & rs) != rs)
      break;
    if (r -= 3, (n & od) != rs) {
      t - r >= $y(n) * 3 && (r = t);
      break;
    }
  }
  return e.substring(0, r);
}
const nc = {
  id: "svc_ticket_id",
  subject: "svc_ticket_subject",
  description: "svc_ticket_description",
  category: "svc_ticket_category",
  productId: "svc_ticket_product_id",
  custom: "svc_ticket_custom"
}, Ly = $e(nc).map((e) => nc[e]), Qy = [...Ly].join("|"), jy = new RegExp(`^(${Qy}$)`), Ny = {
  svcAction: "svc_action",
  svcActionData: "svc_action_data"
}, zy = (e) => jy.test(e), By = [zy], ic = {
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
}, sc = {
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
}, ii = {
  id: "ti",
  revenue: "tr",
  tax: "tt",
  shipping: "ts",
  coupon: "tcc",
  affiliation: "ta",
  step: "cos",
  option: "col"
}, Hy = [
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
], Ns = {
  id: "quoteId",
  affiliation: "quoteAffiliation"
}, zs = {
  id: "reviewId",
  rating: "reviewRating",
  comment: "reviewComment"
}, Yy = {
  add: ke,
  bookmark_add: ke,
  bookmark_remove: ke,
  click: ke,
  checkout: ke,
  checkout_option: ke,
  detail: ke,
  impression: ke,
  remove: ke,
  refund: Object.assign(Object.assign({}, ke), ii),
  purchase: Object.assign(Object.assign({}, ke), ii),
  quickview: ke,
  quote: Object.assign(Object.assign({}, ke), Ns),
  review: Object.assign(Object.assign({}, ke), zs)
}, Wy = $e(ic).map((e) => ic[e]), Gy = $e(sc).map((e) => sc[e]), Ky = $e(ke).map((e) => ke[e]), Jy = $e(ii).map((e) => ii[e]), Zy = $e(zs).map((e) => zs[e]), Xy = $e(Ns).map((e) => Ns[e]), ev = [...Wy, "custom"].join("|"), tv = [...Gy, "custom"].join("|"), ad = "(pr[0-9]+)", cd = "(il[0-9]+pi[0-9]+)", rv = new RegExp(`^${ad}(${ev})$`), nv = new RegExp(`^(${cd}(${tv}))|(il[0-9]+nm)$`), iv = new RegExp(`^(${Ky.join("|")})$`), sv = new RegExp(`^(${Jy.join("|")})$`), ov = new RegExp(`^${ad}custom$`), av = new RegExp(`^${cd}custom$`), cv = new RegExp(`^(${[...Hy, ...Zy, ...Xy].join("|")})$`), uv = (e) => rv.test(e), lv = (e) => nv.test(e), dv = (e) => iv.test(e), fv = (e) => sv.test(e), hv = (e) => cv.test(e), pv = [
  lv,
  uv,
  dv,
  fv,
  hv
], gv = [ov, av], mv = {
  anonymizeIp: "aip"
}, yv = {
  eventCategory: "ec",
  eventAction: "ea",
  eventLabel: "el",
  eventValue: "ev",
  page: "dp",
  visitorId: "cid",
  clientId: "cid",
  userId: "uid",
  currencyCode: "cu"
}, vv = {
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
}, Sv = [
  "contentId",
  "contentIdKey",
  "contentType",
  "searchHub",
  "tab",
  "searchUid",
  "permanentId",
  "contentLocale",
  "trackingId"
], wv = Object.assign(Object.assign(Object.assign(Object.assign({}, mv), yv), vv), Sv.reduce((e, t) => Object.assign(Object.assign({}, e), { [t]: t }), {})), Bs = Object.assign(Object.assign({}, wv), Ny), bv = (e) => {
  const t = !!e.action && Yy[e.action] || {};
  return $e(e).reduce((r, n) => {
    const i = t[n] || Bs[n] || n;
    return Object.assign(Object.assign({}, r), { [i]: e[n] });
  }, {});
}, Cv = $e(Bs).map((e) => Bs[e]), Iv = (e) => Cv.indexOf(e) !== -1, Av = (e) => e === "custom", xv = (e) => [...pv, ...By, Iv, Av].some((t) => t(e)), kv = (e) => $e(e).reduce((t, r) => {
  const n = Ev(r);
  return n ? Object.assign(Object.assign({}, t), Rv(n, e[r])) : Object.assign(Object.assign({}, t), { [r]: e[r] });
}, {}), Ev = (e) => {
  let t;
  return [...gv].every((r) => {
    var n;
    return t = (n = r.exec(e)) === null || n === void 0 ? void 0 : n[1], !t;
  }), t;
}, Rv = (e, t) => $e(t).reduce((r, n) => Object.assign(Object.assign({}, r), { [`${e}${n}`]: t[n] }), {});
class qv {
  constructor(t) {
    this.opts = t;
  }
  sendEvent(t, r) {
    return M(this, void 0, void 0, function* () {
      if (!this.isAvailable())
        throw new Error('navigator.sendBeacon is not supported in this browser. Consider adding a polyfill like "sendbeacon-polyfill".');
      const { baseUrl: n, preprocessRequest: i } = this.opts, s = yield this.getQueryParamsForEventType(t), { url: o, payload: a } = yield this.preProcessRequestAsPotentialJSONString(`${n}/analytics/${t}?${s}`, r, i), c = this.encodeForEventType(t, a), u = new Blob([c], {
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
  preProcessRequestAsPotentialJSONString(t, r, n) {
    return M(this, void 0, void 0, function* () {
      let i = t, s = r;
      if (n) {
        const o = yield n({ url: t, body: JSON.stringify(r) }, "analyticsBeacon"), { url: a, body: c } = o;
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
  encodeForEventType(t, r) {
    return this.isEventTypeLegacy(t) ? this.encodeEventToJson(t, r) : this.encodeEventToJson(t, r, this.opts.token);
  }
  getQueryParamsForEventType(t) {
    return M(this, void 0, void 0, function* () {
      const { token: r, visitorIdProvider: n } = this.opts, i = yield n.getCurrentVisitorId();
      return [
        r && this.isEventTypeLegacy(t) ? `access_token=${r}` : "",
        i ? `visitorId=${i}` : "",
        "discardVisitInfo=true"
      ].filter((s) => !!s).join("&");
    });
  }
  isEventTypeLegacy(t) {
    return [oe.click, oe.custom, oe.search, oe.view].indexOf(t) !== -1;
  }
  encodeEventToJson(t, r, n) {
    let i = `${t}Event=${encodeURIComponent(JSON.stringify(r))}`;
    return n && (i = `access_token=${encodeURIComponent(n)}&${i}`), i;
  }
}
class Ov {
  sendEvent(t, r) {
    return M(this, void 0, void 0, function* () {
      return Promise.resolve();
    });
  }
  deleteHttpCookieVisitorId() {
    return M(this, void 0, void 0, function* () {
      return Promise.resolve();
    });
  }
}
const oc = globalThis.fetch;
class ud {
  constructor(t) {
    this.opts = t;
  }
  sendEvent(t, r) {
    return M(this, void 0, void 0, function* () {
      const { baseUrl: n, visitorIdProvider: i, preprocessRequest: s } = this.opts, o = this.shouldAppendVisitorId(t) ? yield this.getVisitorIdParam() : "", a = {
        url: `${n}/analytics/${t}${o}`,
        credentials: "include",
        mode: "cors",
        headers: this.getHeaders(),
        method: "POST",
        body: JSON.stringify(r)
      }, c = Object.assign(Object.assign({}, a), s ? yield s(a, "analyticsFetch") : {}), { url: u } = c, l = We(c, ["url"]);
      let d;
      try {
        d = yield oc(u, l);
      } catch (p) {
        console.error("An error has occured when sending the event.", p);
        return;
      }
      if (d.ok) {
        const p = yield d.json();
        return p.visitorId && i.setCurrentVisitorId(p.visitorId), p;
      } else {
        try {
          d.json();
        } catch {
        }
        throw console.error(`An error has occured when sending the "${t}" event.`, d, r), new Error(`An error has occurred when sending the "${t}" event. Check the console logs for more details.`);
      }
    });
  }
  deleteHttpCookieVisitorId() {
    return M(this, void 0, void 0, function* () {
      const { baseUrl: t } = this.opts, r = `${t}/analytics/visit`;
      yield oc(r, { headers: this.getHeaders(), method: "DELETE" });
    });
  }
  shouldAppendVisitorId(t) {
    return [oe.click, oe.custom, oe.search, oe.view].indexOf(t) !== -1;
  }
  getVisitorIdParam() {
    return M(this, void 0, void 0, function* () {
      const { visitorIdProvider: t } = this.opts, r = yield t.getCurrentVisitorId();
      return r ? `?visitor=${r}` : "";
    });
  }
  getHeaders() {
    const { token: t } = this.opts;
    return Object.assign(Object.assign({}, t ? { Authorization: `Bearer ${t}` } : {}), { "Content-Type": "application/json" });
  }
}
class Fv {
  constructor(t, r) {
    js() && rd() ? this.storage = new Sy() : js() ? this.storage = localStorage : (console.warn("BrowserRuntime detected no valid storage available.", this), this.storage = new Ci()), this.client = new ud(t), this.beaconClient = new qv(t), window.addEventListener("beforeunload", () => {
      const n = r();
      for (let { eventType: i, payload: s } of n)
        this.beaconClient.sendEvent(i, s);
    });
  }
  getClientDependingOnEventType(t) {
    return t === "click" && this.beaconClient.isAvailable() ? this.beaconClient : this.client;
  }
}
class Dv {
  constructor(t, r) {
    this.storage = r || new Ci(), this.client = new ud(t);
  }
  getClientDependingOnEventType(t) {
    return this.client;
  }
}
class ld {
  constructor() {
    this.storage = new Ci(), this.client = new Ov();
  }
  getClientDependingOnEventType(t) {
    return this.client;
  }
}
const Tv = "xx", _v = (e) => (e == null ? void 0 : e.startsWith(Tv)) || !1, Mv = `
        We've detected you're using React Native but have not provided the corresponding runtime, 
        for an optimal experience please use the "coveo.analytics/react-native" subpackage.
        Follow the Readme on how to set it up: https://github.com/coveo/coveo.analytics.js#using-react-native
    `;
function Pv() {
  return typeof navigator < "u" && navigator.product == "ReactNative";
}
const Uv = ["1", 1, "yes", !0];
function Hs() {
  const e = [];
  return Ls() && e.push(window.doNotTrack), xo() && e.push(navigator.doNotTrack, navigator.msDoNotTrack, navigator.globalPrivacyControl), e.some((t) => Uv.indexOf(t) !== -1);
}
const dd = "v15", fd = {
  default: "https://analytics.cloud.coveo.com/rest/ua"
};
function $v(e = fd.default, t = dd, r = !1) {
  if (e = e.replace(/\/$/, ""), r)
    return `${e}/${t}`;
  const n = e.endsWith("/rest") || e.endsWith("/rest/ua");
  return `${e}${n ? "" : "/rest"}/${t}`;
}
const Vv = "38824e1f-37f5-42d3-8372-a4b8fa9df946";
class Un {
  get defaultOptions() {
    return {
      endpoint: fd.default,
      isCustomEndpoint: !1,
      token: "",
      version: dd,
      beforeSendHooks: [],
      afterSendHooks: []
    };
  }
  get version() {
    return sd;
  }
  constructor(t) {
    if (this.acceptedLinkReferrers = [], !t)
      throw new Error("You have to pass options to this constructor");
    this.options = Object.assign(Object.assign({}, this.defaultOptions), t), this.visitorId = "", this.bufferedRequests = [], this.beforeSendHooks = [Iy, yy].concat(this.options.beforeSendHooks), this.afterSendHooks = this.options.afterSendHooks, this.eventTypeMapping = {};
    const r = {
      baseUrl: this.baseUrl,
      token: this.options.token,
      visitorIdProvider: this,
      preprocessRequest: this.options.preprocessRequest
    };
    Hs() ? this.runtime = new ld() : this.runtime = this.options.runtimeEnvironment || this.initRuntime(r), this.addEventTypeMapping(oe.view, { newEventType: oe.view, addClientIdParameter: !0 }), this.addEventTypeMapping(oe.click, { newEventType: oe.click, addClientIdParameter: !0 }), this.addEventTypeMapping(oe.custom, { newEventType: oe.custom, addClientIdParameter: !0 }), this.addEventTypeMapping(oe.search, { newEventType: oe.search, addClientIdParameter: !0 });
  }
  initRuntime(t) {
    return Ls() && Qs() ? new Fv(t, () => {
      const r = [...this.bufferedRequests];
      return this.bufferedRequests = [], r;
    }) : (Pv() && console.warn(Mv), new Dv(t));
  }
  get storage() {
    return this.runtime.storage;
  }
  determineVisitorId() {
    return M(this, void 0, void 0, function* () {
      try {
        return Ls() && this.extractClientIdFromLink(window.location.href) || (yield this.storage.getItem("visitorId")) || es();
      } catch (t) {
        return console.log("Could not get visitor ID from the current runtime environment storage. Using a random ID instead.", t), es();
      }
    });
  }
  getCurrentVisitorId() {
    return M(this, void 0, void 0, function* () {
      if (!this.visitorId) {
        const t = yield this.determineVisitorId();
        yield this.setCurrentVisitorId(t);
      }
      return this.visitorId;
    });
  }
  setCurrentVisitorId(t) {
    return M(this, void 0, void 0, function* () {
      this.visitorId = t, yield this.storage.setItem("visitorId", t);
    });
  }
  setClientId(t, r) {
    return M(this, void 0, void 0, function* () {
      if (ni(t))
        this.setCurrentVisitorId(t.toLowerCase());
      else {
        if (!r)
          throw Error("Cannot generate uuid client id without a specific namespace string.");
        this.setCurrentVisitorId(ec(t, ec(r, Vv)));
      }
    });
  }
  getParameters(t, ...r) {
    return M(this, void 0, void 0, function* () {
      return yield this.resolveParameters(t, ...r);
    });
  }
  getPayload(t, ...r) {
    return M(this, void 0, void 0, function* () {
      const n = yield this.resolveParameters(t, ...r);
      return yield this.resolvePayloadForParameters(t, n);
    });
  }
  get currentVisitorId() {
    return typeof (this.visitorId || this.storage.getItem("visitorId")) != "string" && this.setCurrentVisitorId(es()), this.visitorId;
  }
  set currentVisitorId(t) {
    this.visitorId = t, this.storage.setItem("visitorId", t);
  }
  extractClientIdFromLink(t) {
    if (Hs())
      return null;
    try {
      const r = new URL(t).searchParams.get(Tt.cvo_cid);
      if (r == null)
        return null;
      const n = Tt.fromString(r);
      return !n || !Qs() || !n.validate(document.referrer, this.acceptedLinkReferrers) ? null : n.clientId;
    } catch {
    }
    return null;
  }
  resolveParameters(t, ...r) {
    return M(this, void 0, void 0, function* () {
      const { variableLengthArgumentsNames: n = [], addVisitorIdParameter: i = !1, usesMeasurementProtocol: s = !1, addClientIdParameter: o = !1 } = this.eventTypeMapping[t] || {};
      return yield [
        (g) => n.length > 0 ? this.parseVariableArgumentsPayload(n, g) : g[0],
        (g) => M(this, void 0, void 0, function* () {
          return Object.assign(Object.assign({}, g), { visitorId: i ? yield this.getCurrentVisitorId() : "" });
        }),
        (g) => M(this, void 0, void 0, function* () {
          return o ? Object.assign(Object.assign({}, g), { clientId: yield this.getCurrentVisitorId() }) : g;
        }),
        (g) => s ? this.ensureAnonymousUserWhenUsingApiKey(g) : g,
        (g) => this.beforeSendHooks.reduce((h, f) => M(this, void 0, void 0, function* () {
          const m = yield h;
          return yield f(t, m);
        }), g)
      ].reduce((g, h) => M(this, void 0, void 0, function* () {
        const f = yield g;
        return yield h(f);
      }), Promise.resolve(r));
    });
  }
  resolvePayloadForParameters(t, r) {
    return M(this, void 0, void 0, function* () {
      const { usesMeasurementProtocol: n = !1 } = this.eventTypeMapping[t] || {};
      return yield [
        (d) => this.setTrackingIdIfTrackingIdNotPresent(d),
        (d) => this.removeEmptyPayloadValues(d, t),
        (d) => this.validateParams(d, t),
        (d) => n ? bv(d) : d,
        (d) => n ? this.removeUnknownParameters(d) : d,
        (d) => n ? this.processCustomParameters(d) : this.mapCustomParametersToCustomData(d)
      ].reduce((d, p) => M(this, void 0, void 0, function* () {
        const g = yield d;
        return yield p(g);
      }), Promise.resolve(r));
    });
  }
  makeEvent(t, ...r) {
    return M(this, void 0, void 0, function* () {
      const { newEventType: n = t } = this.eventTypeMapping[t] || {}, i = yield this.resolveParameters(t, ...r), s = yield this.resolvePayloadForParameters(t, i);
      return {
        eventType: n,
        payload: s,
        log: (o) => M(this, void 0, void 0, function* () {
          return this.bufferedRequests.push({
            eventType: n,
            payload: Object.assign(Object.assign({}, s), o)
          }), yield Promise.all(this.afterSendHooks.map((a) => a(t, Object.assign(Object.assign({}, i), o)))), yield this.deferExecution(), yield this.sendFromBuffer();
        })
      };
    });
  }
  sendEvent(t, ...r) {
    return M(this, void 0, void 0, function* () {
      return (yield this.makeEvent(t, ...r)).log({});
    });
  }
  deferExecution() {
    return new Promise((t) => setTimeout(t, 0));
  }
  sendFromBuffer() {
    return M(this, void 0, void 0, function* () {
      const t = this.bufferedRequests.shift();
      if (t) {
        const { eventType: r, payload: n } = t;
        return this.runtime.getClientDependingOnEventType(r).sendEvent(r, n);
      }
    });
  }
  clear() {
    this.storage.removeItem("visitorId"), new nd().clear();
  }
  deleteHttpOnlyVisitorId() {
    this.runtime.client.deleteHttpCookieVisitorId();
  }
  makeSearchEvent(t) {
    return M(this, void 0, void 0, function* () {
      return this.makeEvent(oe.search, t);
    });
  }
  sendSearchEvent(t) {
    return M(this, void 0, void 0, function* () {
      var { searchQueryUid: r } = t, n = We(t, ["searchQueryUid"]);
      return (yield this.makeSearchEvent(n)).log({ searchQueryUid: r });
    });
  }
  makeClickEvent(t) {
    return M(this, void 0, void 0, function* () {
      return this.makeEvent(oe.click, t);
    });
  }
  sendClickEvent(t) {
    return M(this, void 0, void 0, function* () {
      var { searchQueryUid: r } = t, n = We(t, ["searchQueryUid"]);
      return (yield this.makeClickEvent(n)).log({ searchQueryUid: r });
    });
  }
  makeCustomEvent(t) {
    return M(this, void 0, void 0, function* () {
      return this.makeEvent(oe.custom, t);
    });
  }
  sendCustomEvent(t) {
    return M(this, void 0, void 0, function* () {
      var { lastSearchQueryUid: r } = t, n = We(t, ["lastSearchQueryUid"]);
      return (yield this.makeCustomEvent(n)).log({ lastSearchQueryUid: r });
    });
  }
  makeViewEvent(t) {
    return M(this, void 0, void 0, function* () {
      return this.makeEvent(oe.view, t);
    });
  }
  sendViewEvent(t) {
    return M(this, void 0, void 0, function* () {
      return (yield this.makeViewEvent(t)).log({});
    });
  }
  getVisit() {
    return M(this, void 0, void 0, function* () {
      const r = yield (yield fetch(`${this.baseUrl}/analytics/visit`)).json();
      return this.visitorId = r.visitorId, r;
    });
  }
  getHealth() {
    return M(this, void 0, void 0, function* () {
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
      const o = r[i];
      if (typeof o == "string")
        n[t[i]] = o;
      else if (typeof o == "object")
        return Object.assign(Object.assign({}, n), o);
    }
    return n;
  }
  isKeyAllowedEmpty(t, r) {
    return ({
      [oe.search]: ["queryText"]
    }[t] || []).indexOf(r) !== -1;
  }
  removeEmptyPayloadValues(t, r) {
    const n = (i) => typeof i < "u" && i !== null && i !== "";
    return Object.keys(t).filter((i) => this.isKeyAllowedEmpty(r, i) || n(t[i])).reduce((i, s) => Object.assign(Object.assign({}, i), { [s]: t[s] }), {});
  }
  removeUnknownParameters(t) {
    return Object.keys(t).filter((n) => {
      if (xv(n))
        return !0;
      console.log(n, "is not processed by coveoua");
    }).reduce((n, i) => Object.assign(Object.assign({}, n), { [i]: t[i] }), {});
  }
  processCustomParameters(t) {
    const { custom: r } = t, n = We(t, ["custom"]);
    let i = {};
    r && wn(r) && (i = this.lowercaseKeys(r));
    const s = kv(n);
    return Object.assign(Object.assign({}, i), s);
  }
  mapCustomParametersToCustomData(t) {
    const { custom: r } = t, n = We(t, ["custom"]);
    if (r && wn(r)) {
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
    const { anonymizeIp: n } = t, i = We(t, ["anonymizeIp"]);
    return n !== void 0 && ["0", "false", "undefined", "null", "{}", "[]", ""].indexOf(`${n}`.toLowerCase()) == -1 && (i.anonymizeIp = 1), (r == oe.view || r == oe.click || r == oe.search || r == oe.custom) && (i.originLevel3 = this.limit(i.originLevel3, 1024)), r == oe.view && (i.location = this.limit(i.location, 1024)), (r == "pageview" || r == "event") && (i.referrer = this.limit(i.referrer, 2048), i.location = this.limit(i.location, 2048), i.page = this.limit(i.page, 2048)), i;
  }
  ensureAnonymousUserWhenUsingApiKey(t) {
    const { userId: r } = t, n = We(t, ["userId"]);
    return _v(this.options.token) && !r ? (n.userId = "anonymous", n) : t;
  }
  setTrackingIdIfTrackingIdNotPresent(t) {
    const { trackingId: r } = t, n = We(t, ["trackingId"]);
    return r ? t : (n.hasOwnProperty("custom") && wn(n.custom) && (n.custom.hasOwnProperty("context_website") || n.custom.hasOwnProperty("siteName")) && (n.trackingId = n.custom.context_website || n.custom.siteName), n.hasOwnProperty("customData") && wn(n.customData) && (n.customData.hasOwnProperty("context_website") || n.customData.hasOwnProperty("siteName")) && (n.trackingId = n.customData.context_website || n.customData.siteName), n);
  }
  limit(t, r) {
    return typeof t == "string" ? Vy(t, r) : t;
  }
  get baseUrl() {
    return $v(this.options.endpoint, this.options.version, this.options.isCustomEndpoint);
  }
}
var Ge;
(function(e) {
  e.contextChanged = "contextChanged", e.expandToFullUI = "expandToFullUI", e.openUserActions = "openUserActions", e.showPrecedingSessions = "showPrecedingSessions", e.showFollowingSessions = "showFollowingSessions", e.clickViewedDocument = "clickViewedDocument", e.clickPageView = "clickPageView", e.createArticle = "createArticle";
})(Ge || (Ge = {}));
var P;
(function(e) {
  e.interfaceLoad = "interfaceLoad", e.interfaceChange = "interfaceChange", e.didyoumeanAutomatic = "didyoumeanAutomatic", e.didyoumeanClick = "didyoumeanClick", e.resultsSort = "resultsSort", e.searchboxSubmit = "searchboxSubmit", e.searchboxClear = "searchboxClear", e.searchboxAsYouType = "searchboxAsYouType", e.breadcrumbFacet = "breadcrumbFacet", e.breadcrumbResetAll = "breadcrumbResetAll", e.documentQuickview = "documentQuickview", e.documentOpen = "documentOpen", e.omniboxAnalytics = "omniboxAnalytics", e.omniboxFromLink = "omniboxFromLink", e.searchFromLink = "searchFromLink", e.triggerNotify = "notify", e.triggerExecute = "execute", e.triggerQuery = "query", e.undoTriggerQuery = "undoQuery", e.triggerRedirect = "redirect", e.pagerResize = "pagerResize", e.pagerNumber = "pagerNumber", e.pagerNext = "pagerNext", e.pagerPrevious = "pagerPrevious", e.pagerScrolling = "pagerScrolling", e.staticFilterClearAll = "staticFilterClearAll", e.staticFilterSelect = "staticFilterSelect", e.staticFilterDeselect = "staticFilterDeselect", e.facetClearAll = "facetClearAll", e.facetSearch = "facetSearch", e.facetSelect = "facetSelect", e.facetSelectAll = "facetSelectAll", e.facetDeselect = "facetDeselect", e.facetExclude = "facetExclude", e.facetUnexclude = "facetUnexclude", e.facetUpdateSort = "facetUpdateSort", e.facetShowMore = "showMoreFacetResults", e.facetShowLess = "showLessFacetResults", e.queryError = "query", e.queryErrorBack = "errorBack", e.queryErrorClear = "errorClearQuery", e.queryErrorRetry = "errorRetry", e.recommendation = "recommendation", e.recommendationInterfaceLoad = "recommendationInterfaceLoad", e.recommendationOpen = "recommendationOpen", e.likeSmartSnippet = "likeSmartSnippet", e.dislikeSmartSnippet = "dislikeSmartSnippet", e.expandSmartSnippet = "expandSmartSnippet", e.collapseSmartSnippet = "collapseSmartSnippet", e.openSmartSnippetFeedbackModal = "openSmartSnippetFeedbackModal", e.closeSmartSnippetFeedbackModal = "closeSmartSnippetFeedbackModal", e.sendSmartSnippetReason = "sendSmartSnippetReason", e.expandSmartSnippetSuggestion = "expandSmartSnippetSuggestion", e.collapseSmartSnippetSuggestion = "collapseSmartSnippetSuggestion", e.showMoreSmartSnippetSuggestion = "showMoreSmartSnippetSuggestion", e.showLessSmartSnippetSuggestion = "showLessSmartSnippetSuggestion", e.openSmartSnippetSource = "openSmartSnippetSource", e.openSmartSnippetSuggestionSource = "openSmartSnippetSuggestionSource", e.openSmartSnippetInlineLink = "openSmartSnippetInlineLink", e.openSmartSnippetSuggestionInlineLink = "openSmartSnippetSuggestionInlineLink", e.recentQueryClick = "recentQueriesClick", e.clearRecentQueries = "clearRecentQueries", e.recentResultClick = "recentResultClick", e.clearRecentResults = "clearRecentResults", e.noResultsBack = "noResultsBack", e.showMoreFoldedResults = "showMoreFoldedResults", e.showLessFoldedResults = "showLessFoldedResults", e.copyToClipboard = "copyToClipboard", e.caseSendEmail = "Case.SendEmail", e.feedItemTextPost = "FeedItem.TextPost", e.caseAttach = "caseAttach", e.caseDetach = "caseDetach", e.retryGeneratedAnswer = "retryGeneratedAnswer", e.likeGeneratedAnswer = "likeGeneratedAnswer", e.dislikeGeneratedAnswer = "dislikeGeneratedAnswer", e.openGeneratedAnswerSource = "openGeneratedAnswerSource", e.generatedAnswerOpenInlineLink = "generatedAnswerOpenInlineLink", e.generatedAnswerStreamEnd = "generatedAnswerStreamEnd", e.generatedAnswerSourceHover = "generatedAnswerSourceHover", e.generatedAnswerCopyToClipboard = "generatedAnswerCopyToClipboard", e.generatedAnswerHideAnswers = "generatedAnswerHideAnswers", e.generatedAnswerShowAnswers = "generatedAnswerShowAnswers", e.generatedAnswerExpand = "generatedAnswerExpand", e.generatedAnswerCollapse = "generatedAnswerCollapse", e.generatedAnswerFeedbackSubmit = "generatedAnswerFeedbackSubmit", e.rephraseGeneratedAnswer = "rephraseGeneratedAnswer", e.generatedAnswerFeedbackSubmitV2 = "generatedAnswerFeedbackSubmitV2", e.generatedAnswerCitationClick = "generatedAnswerCitationClick", e.generatedAnswerFollowupOpenSource = "generatedAnswerFollowupOpenSource", e.generatedAnswerCitationDocumentAttach = "generatedAnswerCitationDocumentAttach";
})(P || (P = {}));
const ac = {
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
  [Ge.expandToFullUI]: "interface",
  [Ge.openUserActions]: "User Actions",
  [Ge.showPrecedingSessions]: "User Actions",
  [Ge.showFollowingSessions]: "User Actions",
  [Ge.clickViewedDocument]: "User Actions",
  [Ge.clickPageView]: "User Actions",
  [Ge.createArticle]: "createArticle"
};
class cc {
  constructor() {
    this.runtime = new ld(), this.currentVisitorId = "";
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
    return this.makeEvent(oe.search);
  }
  sendSearchEvent() {
    return Promise.resolve();
  }
  makeClickEvent() {
    return this.makeEvent(oe.click);
  }
  sendClickEvent() {
    return Promise.resolve();
  }
  makeCustomEvent() {
    return this.makeEvent(oe.custom);
  }
  sendCustomEvent() {
    return Promise.resolve();
  }
  makeViewEvent() {
    return this.makeEvent(oe.view);
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
    return sd;
  }
}
function Lv(e) {
  let t = "";
  return e.filter((r) => {
    const n = r !== t;
    return t = r, n;
  });
}
function Qv(e) {
  return e.map((t) => t.replace(/;/g, ""));
}
function hd(e) {
  const r = e.join(";");
  return r.length <= 256 ? r : hd(e.slice(1));
}
const uc = (e) => {
  const t = Qv(e), r = Lv(t);
  return hd(r);
};
function lc(e) {
  const t = typeof e.partialQueries == "string" ? e.partialQueries : uc(e.partialQueries), r = typeof e.suggestions == "string" ? e.suggestions : uc(e.suggestions);
  return Object.assign(Object.assign({}, e), {
    partialQueries: t,
    suggestions: r
  });
}
class jv {
  constructor(t, r) {
    this.opts = t, this.provider = r;
    const n = t.enableAnalytics === !1 || Hs();
    this.coveoAnalyticsClient = n ? new cc() : new Un(t);
  }
  disable() {
    this.coveoAnalyticsClient = new cc();
  }
  enable() {
    this.coveoAnalyticsClient = new Un(this.opts);
  }
  makeInterfaceLoad() {
    return this.makeSearchEvent(P.interfaceLoad);
  }
  logInterfaceLoad() {
    return M(this, void 0, void 0, function* () {
      return (yield this.makeInterfaceLoad()).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeRecommendationInterfaceLoad() {
    return this.makeSearchEvent(P.recommendationInterfaceLoad);
  }
  logRecommendationInterfaceLoad() {
    return M(this, void 0, void 0, function* () {
      return (yield this.makeRecommendationInterfaceLoad()).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeRecommendation() {
    return this.makeCustomEvent(P.recommendation);
  }
  logRecommendation() {
    return M(this, void 0, void 0, function* () {
      return (yield this.makeRecommendation()).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeRecommendationOpen(t, r) {
    return this.makeClickEvent(P.recommendationOpen, t, r);
  }
  logRecommendationOpen(t, r) {
    return M(this, void 0, void 0, function* () {
      return (yield this.makeRecommendationOpen(t, r)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeStaticFilterClearAll(t) {
    return this.makeSearchEvent(P.staticFilterClearAll, t);
  }
  logStaticFilterClearAll(t) {
    return M(this, void 0, void 0, function* () {
      return (yield this.makeStaticFilterClearAll(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeStaticFilterSelect(t) {
    return this.makeSearchEvent(P.staticFilterSelect, t);
  }
  logStaticFilterSelect(t) {
    return M(this, void 0, void 0, function* () {
      return (yield this.makeStaticFilterSelect(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeStaticFilterDeselect(t) {
    return this.makeSearchEvent(P.staticFilterDeselect, t);
  }
  logStaticFilterDeselect(t) {
    return M(this, void 0, void 0, function* () {
      return (yield this.makeStaticFilterDeselect(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeFetchMoreResults() {
    return this.makeCustomEvent(P.pagerScrolling, { type: "getMoreResults" });
  }
  logFetchMoreResults() {
    return M(this, void 0, void 0, function* () {
      return (yield this.makeFetchMoreResults()).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeInterfaceChange(t) {
    return this.makeSearchEvent(P.interfaceChange, t);
  }
  logInterfaceChange(t) {
    return M(this, void 0, void 0, function* () {
      return (yield this.makeInterfaceChange(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeDidYouMeanAutomatic() {
    return this.makeSearchEvent(P.didyoumeanAutomatic);
  }
  logDidYouMeanAutomatic() {
    return M(this, void 0, void 0, function* () {
      return (yield this.makeDidYouMeanAutomatic()).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeDidYouMeanClick() {
    return this.makeSearchEvent(P.didyoumeanClick);
  }
  logDidYouMeanClick() {
    return M(this, void 0, void 0, function* () {
      return (yield this.makeDidYouMeanClick()).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeResultsSort(t) {
    return this.makeSearchEvent(P.resultsSort, t);
  }
  logResultsSort(t) {
    return M(this, void 0, void 0, function* () {
      return (yield this.makeResultsSort(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeSearchboxSubmit() {
    return this.makeSearchEvent(P.searchboxSubmit);
  }
  logSearchboxSubmit() {
    return M(this, void 0, void 0, function* () {
      return (yield this.makeSearchboxSubmit()).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeSearchboxClear() {
    return this.makeSearchEvent(P.searchboxClear);
  }
  logSearchboxClear() {
    return M(this, void 0, void 0, function* () {
      return (yield this.makeSearchboxClear()).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeSearchboxAsYouType() {
    return this.makeSearchEvent(P.searchboxAsYouType);
  }
  logSearchboxAsYouType() {
    return M(this, void 0, void 0, function* () {
      return (yield this.makeSearchboxAsYouType()).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeBreadcrumbFacet(t) {
    return this.makeSearchEvent(P.breadcrumbFacet, t);
  }
  logBreadcrumbFacet(t) {
    return M(this, void 0, void 0, function* () {
      return (yield this.makeBreadcrumbFacet(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeBreadcrumbResetAll() {
    return this.makeSearchEvent(P.breadcrumbResetAll);
  }
  logBreadcrumbResetAll() {
    return M(this, void 0, void 0, function* () {
      return (yield this.makeBreadcrumbResetAll()).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeDocumentQuickview(t, r) {
    return this.makeClickEvent(P.documentQuickview, t, r);
  }
  logDocumentQuickview(t, r) {
    return M(this, void 0, void 0, function* () {
      return (yield this.makeDocumentQuickview(t, r)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeDocumentOpen(t, r) {
    return this.makeClickEvent(P.documentOpen, t, r);
  }
  logDocumentOpen(t, r) {
    return M(this, void 0, void 0, function* () {
      return (yield this.makeDocumentOpen(t, r)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeOmniboxAnalytics(t) {
    return this.makeSearchEvent(P.omniboxAnalytics, lc(t));
  }
  logOmniboxAnalytics(t) {
    return M(this, void 0, void 0, function* () {
      return (yield this.makeOmniboxAnalytics(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeOmniboxFromLink(t) {
    return this.makeSearchEvent(P.omniboxFromLink, lc(t));
  }
  logOmniboxFromLink(t) {
    return M(this, void 0, void 0, function* () {
      return (yield this.makeOmniboxFromLink(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeSearchFromLink() {
    return this.makeSearchEvent(P.searchFromLink);
  }
  logSearchFromLink() {
    return M(this, void 0, void 0, function* () {
      return (yield this.makeSearchFromLink()).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeTriggerNotify(t) {
    return this.makeCustomEvent(P.triggerNotify, t);
  }
  logTriggerNotify(t) {
    return M(this, void 0, void 0, function* () {
      return (yield this.makeTriggerNotify(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeTriggerExecute(t) {
    return this.makeCustomEvent(P.triggerExecute, t);
  }
  logTriggerExecute(t) {
    return M(this, void 0, void 0, function* () {
      return (yield this.makeTriggerExecute(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeTriggerQuery() {
    return this.makeCustomEvent(P.triggerQuery, { query: this.provider.getSearchEventRequestPayload().queryText }, "queryPipelineTriggers");
  }
  logTriggerQuery() {
    return M(this, void 0, void 0, function* () {
      return (yield this.makeTriggerQuery()).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeUndoTriggerQuery(t) {
    return this.makeSearchEvent(P.undoTriggerQuery, t);
  }
  logUndoTriggerQuery(t) {
    return M(this, void 0, void 0, function* () {
      return (yield this.makeUndoTriggerQuery(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeTriggerRedirect(t) {
    return this.makeCustomEvent(P.triggerRedirect, Object.assign(Object.assign({}, t), { query: this.provider.getSearchEventRequestPayload().queryText }));
  }
  logTriggerRedirect(t) {
    return M(this, void 0, void 0, function* () {
      return (yield this.makeTriggerRedirect(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makePagerResize(t) {
    return this.makeCustomEvent(P.pagerResize, t);
  }
  logPagerResize(t) {
    return M(this, void 0, void 0, function* () {
      return (yield this.makePagerResize(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makePagerNumber(t) {
    return this.makeCustomEvent(P.pagerNumber, t);
  }
  logPagerNumber(t) {
    return M(this, void 0, void 0, function* () {
      return (yield this.makePagerNumber(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makePagerNext(t) {
    return this.makeCustomEvent(P.pagerNext, t);
  }
  logPagerNext(t) {
    return M(this, void 0, void 0, function* () {
      return (yield this.makePagerNext(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makePagerPrevious(t) {
    return this.makeCustomEvent(P.pagerPrevious, t);
  }
  logPagerPrevious(t) {
    return M(this, void 0, void 0, function* () {
      return (yield this.makePagerPrevious(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makePagerScrolling() {
    return this.makeCustomEvent(P.pagerScrolling);
  }
  logPagerScrolling() {
    return M(this, void 0, void 0, function* () {
      return (yield this.makePagerScrolling()).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeFacetClearAll(t) {
    return this.makeSearchEvent(P.facetClearAll, t);
  }
  logFacetClearAll(t) {
    return M(this, void 0, void 0, function* () {
      return (yield this.makeFacetClearAll(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeFacetSearch(t) {
    return this.makeSearchEvent(P.facetSearch, t);
  }
  logFacetSearch(t) {
    return M(this, void 0, void 0, function* () {
      return (yield this.makeFacetSearch(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeFacetSelect(t) {
    return this.makeSearchEvent(P.facetSelect, t);
  }
  logFacetSelect(t) {
    return M(this, void 0, void 0, function* () {
      return (yield this.makeFacetSelect(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeFacetDeselect(t) {
    return this.makeSearchEvent(P.facetDeselect, t);
  }
  logFacetDeselect(t) {
    return M(this, void 0, void 0, function* () {
      return (yield this.makeFacetDeselect(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeFacetExclude(t) {
    return this.makeSearchEvent(P.facetExclude, t);
  }
  logFacetExclude(t) {
    return M(this, void 0, void 0, function* () {
      return (yield this.makeFacetExclude(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeFacetUnexclude(t) {
    return this.makeSearchEvent(P.facetUnexclude, t);
  }
  logFacetUnexclude(t) {
    return M(this, void 0, void 0, function* () {
      return (yield this.makeFacetUnexclude(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeFacetSelectAll(t) {
    return this.makeSearchEvent(P.facetSelectAll, t);
  }
  logFacetSelectAll(t) {
    return M(this, void 0, void 0, function* () {
      return (yield this.makeFacetSelectAll(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeFacetUpdateSort(t) {
    return this.makeSearchEvent(P.facetUpdateSort, t);
  }
  logFacetUpdateSort(t) {
    return M(this, void 0, void 0, function* () {
      return (yield this.makeFacetUpdateSort(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeFacetShowMore(t) {
    return this.makeCustomEvent(P.facetShowMore, t);
  }
  logFacetShowMore(t) {
    return M(this, void 0, void 0, function* () {
      return (yield this.makeFacetShowMore(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeFacetShowLess(t) {
    return this.makeCustomEvent(P.facetShowLess, t);
  }
  logFacetShowLess(t) {
    return M(this, void 0, void 0, function* () {
      return (yield this.makeFacetShowLess(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeQueryError(t) {
    return this.makeCustomEvent(P.queryError, t);
  }
  logQueryError(t) {
    return M(this, void 0, void 0, function* () {
      return (yield this.makeQueryError(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeQueryErrorBack() {
    return M(this, void 0, void 0, function* () {
      const t = yield this.makeCustomEvent(P.queryErrorBack);
      return {
        description: t.description,
        log: () => M(this, void 0, void 0, function* () {
          return yield t.log({ searchUID: this.provider.getSearchUID() }), this.logSearchEvent(P.queryErrorBack);
        })
      };
    });
  }
  logQueryErrorBack() {
    return M(this, void 0, void 0, function* () {
      return (yield this.makeQueryErrorBack()).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeQueryErrorRetry() {
    return M(this, void 0, void 0, function* () {
      const t = yield this.makeCustomEvent(P.queryErrorRetry);
      return {
        description: t.description,
        log: () => M(this, void 0, void 0, function* () {
          return yield t.log({ searchUID: this.provider.getSearchUID() }), this.logSearchEvent(P.queryErrorRetry);
        })
      };
    });
  }
  logQueryErrorRetry() {
    return M(this, void 0, void 0, function* () {
      return (yield this.makeQueryErrorRetry()).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeQueryErrorClear() {
    return M(this, void 0, void 0, function* () {
      const t = yield this.makeCustomEvent(P.queryErrorClear);
      return {
        description: t.description,
        log: () => M(this, void 0, void 0, function* () {
          return yield t.log({ searchUID: this.provider.getSearchUID() }), this.logSearchEvent(P.queryErrorClear);
        })
      };
    });
  }
  logQueryErrorClear() {
    return M(this, void 0, void 0, function* () {
      return (yield this.makeQueryErrorClear()).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeLikeSmartSnippet() {
    return this.makeCustomEvent(P.likeSmartSnippet);
  }
  logLikeSmartSnippet() {
    return M(this, void 0, void 0, function* () {
      return (yield this.makeLikeSmartSnippet()).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeDislikeSmartSnippet() {
    return this.makeCustomEvent(P.dislikeSmartSnippet);
  }
  logDislikeSmartSnippet() {
    return M(this, void 0, void 0, function* () {
      return (yield this.makeDislikeSmartSnippet()).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeExpandSmartSnippet() {
    return this.makeCustomEvent(P.expandSmartSnippet);
  }
  logExpandSmartSnippet() {
    return M(this, void 0, void 0, function* () {
      return (yield this.makeExpandSmartSnippet()).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeCollapseSmartSnippet() {
    return this.makeCustomEvent(P.collapseSmartSnippet);
  }
  logCollapseSmartSnippet() {
    return M(this, void 0, void 0, function* () {
      return (yield this.makeCollapseSmartSnippet()).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeOpenSmartSnippetFeedbackModal() {
    return this.makeCustomEvent(P.openSmartSnippetFeedbackModal);
  }
  logOpenSmartSnippetFeedbackModal() {
    return M(this, void 0, void 0, function* () {
      return (yield this.makeOpenSmartSnippetFeedbackModal()).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeCloseSmartSnippetFeedbackModal() {
    return this.makeCustomEvent(P.closeSmartSnippetFeedbackModal);
  }
  logCloseSmartSnippetFeedbackModal() {
    return M(this, void 0, void 0, function* () {
      return (yield this.makeCloseSmartSnippetFeedbackModal()).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeSmartSnippetFeedbackReason(t, r) {
    return this.makeCustomEvent(P.sendSmartSnippetReason, { reason: t, details: r });
  }
  logSmartSnippetFeedbackReason(t, r) {
    return M(this, void 0, void 0, function* () {
      return (yield this.makeSmartSnippetFeedbackReason(t, r)).log({
        searchUID: this.provider.getSearchUID()
      });
    });
  }
  makeExpandSmartSnippetSuggestion(t) {
    return this.makeCustomEvent(P.expandSmartSnippetSuggestion, "documentId" in t ? t : { documentId: t });
  }
  logExpandSmartSnippetSuggestion(t) {
    return M(this, void 0, void 0, function* () {
      return (yield this.makeExpandSmartSnippetSuggestion(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeCollapseSmartSnippetSuggestion(t) {
    return this.makeCustomEvent(P.collapseSmartSnippetSuggestion, "documentId" in t ? t : { documentId: t });
  }
  logCollapseSmartSnippetSuggestion(t) {
    return M(this, void 0, void 0, function* () {
      return (yield this.makeCollapseSmartSnippetSuggestion(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeShowMoreSmartSnippetSuggestion(t) {
    return this.makeCustomEvent(P.showMoreSmartSnippetSuggestion, t);
  }
  logShowMoreSmartSnippetSuggestion(t) {
    return M(this, void 0, void 0, function* () {
      return (yield this.makeShowMoreSmartSnippetSuggestion(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeShowLessSmartSnippetSuggestion(t) {
    return this.makeCustomEvent(P.showLessSmartSnippetSuggestion, t);
  }
  logShowLessSmartSnippetSuggestion(t) {
    return M(this, void 0, void 0, function* () {
      return (yield this.makeShowLessSmartSnippetSuggestion(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeOpenSmartSnippetSource(t, r) {
    return this.makeClickEvent(P.openSmartSnippetSource, t, r);
  }
  logOpenSmartSnippetSource(t, r) {
    return M(this, void 0, void 0, function* () {
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
    return M(this, void 0, void 0, function* () {
      return (yield this.makeCopyToClipboard(t, r)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  logOpenSmartSnippetSuggestionSource(t, r) {
    return M(this, void 0, void 0, function* () {
      return (yield this.makeOpenSmartSnippetSuggestionSource(t, r)).log({
        searchUID: this.provider.getSearchUID()
      });
    });
  }
  makeOpenSmartSnippetInlineLink(t, r) {
    return this.makeClickEvent(P.openSmartSnippetInlineLink, t, { contentIDKey: r.contentIDKey, contentIDValue: r.contentIDValue }, r);
  }
  logOpenSmartSnippetInlineLink(t, r) {
    return M(this, void 0, void 0, function* () {
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
    return M(this, void 0, void 0, function* () {
      return (yield this.makeOpenSmartSnippetSuggestionInlineLink(t, r)).log({
        searchUID: this.provider.getSearchUID()
      });
    });
  }
  makeRecentQueryClick() {
    return this.makeSearchEvent(P.recentQueryClick);
  }
  logRecentQueryClick() {
    return M(this, void 0, void 0, function* () {
      return (yield this.makeRecentQueryClick()).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeClearRecentQueries() {
    return this.makeCustomEvent(P.clearRecentQueries);
  }
  logClearRecentQueries() {
    return M(this, void 0, void 0, function* () {
      return (yield this.makeClearRecentQueries()).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeRecentResultClick(t, r) {
    return this.makeCustomEvent(P.recentResultClick, { info: t, identifier: r });
  }
  logRecentResultClick(t, r) {
    return M(this, void 0, void 0, function* () {
      return (yield this.makeRecentResultClick(t, r)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeClearRecentResults() {
    return this.makeCustomEvent(P.clearRecentResults);
  }
  logClearRecentResults() {
    return M(this, void 0, void 0, function* () {
      return (yield this.makeClearRecentResults()).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeNoResultsBack() {
    return this.makeSearchEvent(P.noResultsBack);
  }
  logNoResultsBack() {
    return M(this, void 0, void 0, function* () {
      return (yield this.makeNoResultsBack()).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeShowMoreFoldedResults(t, r) {
    return this.makeClickEvent(P.showMoreFoldedResults, t, r);
  }
  logShowMoreFoldedResults(t, r) {
    return M(this, void 0, void 0, function* () {
      return (yield this.makeShowMoreFoldedResults(t, r)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeShowLessFoldedResults() {
    return this.makeCustomEvent(P.showLessFoldedResults);
  }
  logShowLessFoldedResults() {
    return M(this, void 0, void 0, function* () {
      return (yield this.makeShowLessFoldedResults()).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeEventDescription(t, r) {
    var n;
    return { actionCause: r, customData: (n = t.payload) === null || n === void 0 ? void 0 : n.customData };
  }
  makeCustomEvent(t, r) {
    return M(this, arguments, void 0, function* (n, i, s = ac[n]) {
      this.coveoAnalyticsClient.getParameters;
      const o = Object.assign(Object.assign({}, this.provider.getBaseMetadata()), i), a = Object.assign(Object.assign({}, yield this.getBaseEventRequest(o)), { eventType: s, eventValue: n }), c = yield this.coveoAnalyticsClient.makeCustomEvent(a);
      return {
        description: this.makeEventDescription(c, n),
        log: ({ searchUID: u }) => c.log({ lastSearchQueryUid: u })
      };
    });
  }
  logCustomEvent(t, r) {
    return M(this, arguments, void 0, function* (n, i, s = ac[n]) {
      return (yield this.makeCustomEvent(n, i, s)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeCustomEventWithType(t, r, n) {
    return M(this, void 0, void 0, function* () {
      const i = Object.assign(Object.assign({}, this.provider.getBaseMetadata()), n), s = Object.assign(Object.assign({}, yield this.getBaseEventRequest(i)), {
        eventType: r,
        eventValue: t
      }), o = yield this.coveoAnalyticsClient.makeCustomEvent(s);
      return {
        description: this.makeEventDescription(o, t),
        log: ({ searchUID: a }) => o.log({ lastSearchQueryUid: a })
      };
    });
  }
  logCustomEventWithType(t, r, n) {
    return M(this, void 0, void 0, function* () {
      return (yield this.makeCustomEventWithType(t, r, n)).log({
        searchUID: this.provider.getSearchUID()
      });
    });
  }
  logSearchEvent(t, r) {
    return M(this, void 0, void 0, function* () {
      return (yield this.makeSearchEvent(t, r)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeSearchEvent(t, r) {
    return M(this, void 0, void 0, function* () {
      const n = yield this.getBaseSearchEventRequest(t, r), i = yield this.coveoAnalyticsClient.makeSearchEvent(n);
      return {
        description: this.makeEventDescription(i, t),
        log: ({ searchUID: s }) => i.log({ searchQueryUid: s })
      };
    });
  }
  makeClickEvent(t, r, n, i) {
    return M(this, void 0, void 0, function* () {
      const s = Object.assign(Object.assign(Object.assign({}, r), yield this.getBaseEventRequest(Object.assign(Object.assign({}, n), i))), { queryPipeline: this.provider.getPipeline(), actionCause: t }), o = yield this.coveoAnalyticsClient.makeClickEvent(s);
      return {
        description: this.makeEventDescription(o, t),
        log: ({ searchUID: a }) => o.log({ searchQueryUid: a })
      };
    });
  }
  logClickEvent(t, r, n, i) {
    return M(this, void 0, void 0, function* () {
      return (yield this.makeClickEvent(t, r, n, i)).log({
        searchUID: this.provider.getSearchUID()
      });
    });
  }
  getBaseSearchEventRequest(t, r) {
    return M(this, void 0, void 0, function* () {
      var n, i;
      return Object.assign(Object.assign(Object.assign({}, yield this.getBaseEventRequest(Object.assign(Object.assign({}, r), (i = (n = this.provider).getGeneratedAnswerMetadata) === null || i === void 0 ? void 0 : i.call(n)))), this.provider.getSearchEventRequestPayload()), { queryPipeline: this.provider.getPipeline(), actionCause: t });
    });
  }
  getBaseEventRequest(t) {
    return M(this, void 0, void 0, function* () {
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
    return this.coveoAnalyticsClient instanceof Un ? this.coveoAnalyticsClient.getCurrentVisitorId() : void 0;
  }
  getSplitTestRun() {
    const t = this.provider.getSplitTestRunName ? this.provider.getSplitTestRunName() : "", r = this.provider.getSplitTestRunVersion ? this.provider.getSplitTestRunVersion() : "";
    return Object.assign(Object.assign({}, t && { splitTestRunName: t }), r && { splitTestRunVersion: r });
  }
  makeLikeGeneratedAnswer(t) {
    return this.makeCustomEvent(P.likeGeneratedAnswer, t);
  }
  logLikeGeneratedAnswer(t) {
    return M(this, void 0, void 0, function* () {
      return (yield this.makeLikeGeneratedAnswer(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeDislikeGeneratedAnswer(t) {
    return this.makeCustomEvent(P.dislikeGeneratedAnswer, t);
  }
  logDislikeGeneratedAnswer(t) {
    return M(this, void 0, void 0, function* () {
      return (yield this.makeDislikeGeneratedAnswer(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeOpenGeneratedAnswerSource(t) {
    return this.makeCustomEvent(P.openGeneratedAnswerSource, t);
  }
  logOpenGeneratedAnswerSource(t) {
    return M(this, void 0, void 0, function* () {
      return (yield this.makeOpenGeneratedAnswerSource(t)).log({
        searchUID: this.provider.getSearchUID()
      });
    });
  }
  makeGeneratedAnswerOpenInlineLink(t) {
    return this.makeCustomEvent(P.generatedAnswerOpenInlineLink, t);
  }
  logGeneratedAnswerOpenInlineLink(t) {
    return M(this, void 0, void 0, function* () {
      return (yield this.makeGeneratedAnswerOpenInlineLink(t)).log({
        searchUID: this.provider.getSearchUID()
      });
    });
  }
  makeGeneratedAnswerCitationClick(t, r) {
    return this.makeClickEvent(P.generatedAnswerCitationClick, Object.assign(Object.assign({}, t), { documentPosition: 1 }), { contentIDKey: r.documentId.contentIdKey, contentIDValue: r.documentId.contentIdValue }, r);
  }
  logGeneratedAnswerCitationClick(t, r) {
    return M(this, void 0, void 0, function* () {
      return (yield this.makeGeneratedAnswerCitationClick(t, r)).log({
        searchUID: this.provider.getSearchUID()
      });
    });
  }
  makeGeneratedAnswerFollowupOpenSource(t) {
    return this.makeCustomEvent(P.generatedAnswerFollowupOpenSource, t);
  }
  logGeneratedAnswerFollowupOpenSource(t) {
    return M(this, void 0, void 0, function* () {
      return (yield this.makeGeneratedAnswerFollowupOpenSource(t)).log({
        searchUID: this.provider.getSearchUID()
      });
    });
  }
  makeGeneratedAnswerSourceHover(t) {
    return this.makeCustomEvent(P.generatedAnswerSourceHover, t);
  }
  logGeneratedAnswerSourceHover(t) {
    return M(this, void 0, void 0, function* () {
      return (yield this.makeGeneratedAnswerSourceHover(t)).log({
        searchUID: this.provider.getSearchUID()
      });
    });
  }
  makeGeneratedAnswerCopyToClipboard(t) {
    return this.makeCustomEvent(P.generatedAnswerCopyToClipboard, t);
  }
  logGeneratedAnswerCopyToClipboard(t) {
    return M(this, void 0, void 0, function* () {
      return (yield this.makeGeneratedAnswerCopyToClipboard(t)).log({
        searchUID: this.provider.getSearchUID()
      });
    });
  }
  makeGeneratedAnswerHideAnswers(t) {
    return this.makeCustomEvent(P.generatedAnswerHideAnswers, t);
  }
  logGeneratedAnswerHideAnswers(t) {
    return M(this, void 0, void 0, function* () {
      return (yield this.makeGeneratedAnswerHideAnswers(t)).log({
        searchUID: this.provider.getSearchUID()
      });
    });
  }
  makeGeneratedAnswerShowAnswers(t) {
    return this.makeCustomEvent(P.generatedAnswerShowAnswers, t);
  }
  logGeneratedAnswerShowAnswers(t) {
    return M(this, void 0, void 0, function* () {
      return (yield this.makeGeneratedAnswerShowAnswers(t)).log({
        searchUID: this.provider.getSearchUID()
      });
    });
  }
  makeGeneratedAnswerExpand(t) {
    return this.makeCustomEvent(P.generatedAnswerExpand, t);
  }
  logGeneratedAnswerExpand(t) {
    return M(this, void 0, void 0, function* () {
      return (yield this.makeGeneratedAnswerExpand(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeGeneratedAnswerCollapse(t) {
    return this.makeCustomEvent(P.generatedAnswerCollapse, t);
  }
  logGeneratedAnswerCollapse(t) {
    return M(this, void 0, void 0, function* () {
      return (yield this.makeGeneratedAnswerCollapse(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeGeneratedAnswerFeedbackSubmit(t) {
    return this.makeCustomEvent(P.generatedAnswerFeedbackSubmit, t);
  }
  logGeneratedAnswerFeedbackSubmit(t) {
    return M(this, void 0, void 0, function* () {
      return (yield this.makeGeneratedAnswerFeedbackSubmit(t)).log({
        searchUID: this.provider.getSearchUID()
      });
    });
  }
  makeGeneratedAnswerFeedbackSubmitV2(t) {
    return this.makeCustomEvent(P.generatedAnswerFeedbackSubmitV2, t);
  }
  logGeneratedAnswerFeedbackSubmitV2(t) {
    return M(this, void 0, void 0, function* () {
      return (yield this.makeGeneratedAnswerFeedbackSubmitV2(t)).log({
        searchUID: this.provider.getSearchUID()
      });
    });
  }
  makeRephraseGeneratedAnswer(t) {
    return this.makeSearchEvent(P.rephraseGeneratedAnswer, t);
  }
  logRephraseGeneratedAnswer(t) {
    return M(this, void 0, void 0, function* () {
      return (yield this.makeRephraseGeneratedAnswer(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeRetryGeneratedAnswer() {
    return this.makeSearchEvent(P.retryGeneratedAnswer);
  }
  logRetryGeneratedAnswer() {
    return M(this, void 0, void 0, function* () {
      return (yield this.makeRetryGeneratedAnswer()).log({ searchUID: this.provider.getSearchUID() });
    });
  }
  makeGeneratedAnswerStreamEnd(t) {
    return this.makeCustomEvent(P.generatedAnswerStreamEnd, t);
  }
  logGeneratedAnswerStreamEnd(t) {
    return M(this, void 0, void 0, function* () {
      return (yield this.makeGeneratedAnswerStreamEnd(t)).log({ searchUID: this.provider.getSearchUID() });
    });
  }
}
const dc = Object.assign({}, Uy);
Object.keys(dc).map((e) => dc[e]);
var fc;
(function(e) {
  e.click = "click", e.flowStart = "flowStart";
})(fc || (fc = {}));
var hc;
(function(e) {
  e.enterInterface = "ticket_create_start", e.fieldUpdate = "ticket_field_update", e.fieldSuggestionClick = "ticket_classification_click", e.documentSuggestionClick = "documentSuggestionClick", e.documentSuggestionQuickview = "documentSuggestionQuickview", e.suggestionRate = "suggestion_rate", e.nextCaseStep = "ticket_next_stage", e.caseCancelled = "ticket_cancel", e.caseSolved = "ticket_cancel", e.caseCreated = "ticket_create";
})(hc || (hc = {}));
var pc;
(function(e) {
  e.quit = "Quit", e.solved = "Solved";
})(pc || (pc = {}));
const Nv = (e) => new Un(e).getCurrentVisitorId(), zv = (e, t) => typeof t == "function" ? (...r) => {
  const n = Il(r[0]);
  try {
    return t.apply(t, r);
  } catch (i) {
    return e.error(i, "Error in analytics preprocessRequest. Returning original request."), n;
  }
} : void 0, Bv = (e, t) => (...r) => {
  const n = Il(r[1]);
  try {
    return t.apply(t, r);
  } catch (i) {
    return e.error(i, "Error in analytics hook. Returning original request."), n;
  }
}, Hv = 1, Yv = 20, pd = 5, Wv = 1, gd = 8;
function md() {
  return {
    desiredCount: pd,
    numberOfValues: gd,
    set: {}
  };
}
const Gv = (e, t) => {
  var r;
  return (r = e.categoryFacetSet[t]) == null ? void 0 : r.request;
}, yd = (e, t) => {
  const r = Gv(e, t);
  return vg((r == null ? void 0 : r.currentValues) ?? []);
};
function vd() {
  return {};
}
function Kv(e, t) {
  return { request: e, tabs: t };
}
function ko() {
  return {};
}
function Jv(e, t) {
  return { request: e, tabs: t };
}
function Eo() {
  return {};
}
function Zv(e, t) {
  return { request: e, hasBreadcrumbs: !0, tabs: t };
}
function Ro() {
  return {};
}
function Xv(e) {
  return {
    facetSet: e.facetSet ?? Ro(),
    categoryFacetSet: e.categoryFacetSet ?? vd(),
    dateFacetSet: e.dateFacetSet ?? ko(),
    numericFacetSet: e.numericFacetSet ?? Eo(),
    automaticFacetSet: e.automaticFacetSet ?? md()
  };
}
const eS = (e) => {
  const t = [];
  return nS(e).forEach((r, n) => {
    const i = dS(e, r.facetId), s = uS(r, n + 1);
    if (rS(r)) {
      if (!!!yd(e, r.facetId).length)
        return;
      t.push({
        ...s,
        ...aS(e, r.facetId),
        facetType: i,
        state: "selected"
      });
      return;
    }
    r.currentValues.forEach((o, a) => {
      if (o.state === "idle")
        return;
      const c = gc(o, a + 1, i), u = tS(r) ? mc(o) : sS(o);
      t.push({
        ...s,
        ...c,
        ...u
      });
    });
  }), iS(e).forEach((r, n) => {
    const i = cS(r, n + 1);
    r.values.forEach((s, o) => {
      if (s.state === "idle")
        return;
      const a = gc(s, o + 1, "specific"), c = mc(s);
      t.push({
        ...i,
        ...a,
        ...c
      });
    });
  }), t;
}, tS = (e) => e.type === "specific", rS = (e) => e.type === "hierarchical", nS = (e) => [
  ...Object.values(e.facetSet),
  ...Object.values(e.categoryFacetSet),
  ...Object.values(e.dateFacetSet),
  ...Object.values(e.numericFacetSet)
].map((t) => t.request), iS = (e) => [...Object.values(e.automaticFacetSet.set)].map((t) => t.response), gc = (e, t, r) => ({
  state: e.state,
  valuePosition: t,
  facetType: r
}), sS = (e) => ({
  displayValue: `${e.start}..${e.end}`,
  value: `${e.start}..${e.end}`,
  start: e.start,
  end: e.end,
  endInclusive: e.endInclusive
}), mc = (e) => ({
  displayValue: e.value,
  value: e.value
}), oS = (e, t) => yd(e, t).map((n) => n.value).join(";"), aS = (e, t) => {
  const n = oS(e, t);
  return {
    value: n,
    valuePosition: 1,
    displayValue: n
  };
}, cS = (e, t) => ({
  title: Sd(e.field, e.field),
  field: e.field,
  id: e.field,
  facetPosition: t
}), uS = (e, t) => ({
  title: Sd(e.field, e.facetId),
  field: e.field,
  id: e.facetId,
  facetPosition: t
}), Sd = (e, t) => `${e}_${t}`, lS = (e, t) => {
  var r, n, i, s, o;
  return ((r = e.facetSet[t]) == null ? void 0 : r.request) || ((n = e.categoryFacetSet[t]) == null ? void 0 : n.request) || ((i = e.dateFacetSet[t]) == null ? void 0 : i.request) || ((s = e.numericFacetSet[t]) == null ? void 0 : s.request) || ((o = e.automaticFacetSet.set[t]) == null ? void 0 : o.response);
}, dS = (e, t) => {
  const r = lS(e, t);
  return r ? r.type : "specific";
}, fS = (e) => e.configuration.search.locale, hS = (e) => e.configuration.search.timezone, pS = (e) => {
  var t, r;
  return (r = (t = e.configuration) == null ? void 0 : t.knowledge) == null ? void 0 : r.agentId;
}, si = (e) => {
  var t, r, n, i;
  if (gS(e) || mS(e))
    return (t = e.generatedAnswer) == null ? void 0 : t.answerId;
  if (yS(e))
    return (i = (n = (r = e.search) == null ? void 0 : r.response) == null ? void 0 : n.extendedResults) == null ? void 0 : i.generativeQuestionAnsweringId;
}, gS = (e) => {
  var t;
  return "answer" in e && "generatedAnswer" in e && !ee((t = e.generatedAnswer) == null ? void 0 : t.answerConfigurationId);
}, mS = (e) => {
  const t = pS(e);
  return "generatedAnswer" in e && typeof t == "string" && t.trim().length > 0;
}, yS = (e) => "search" in e && e.search !== void 0 && typeof e.search == "object", vS = (e) => {
  var t;
  return (t = e.generatedAnswer) == null ? void 0 : t.fieldsToIncludeInCitations;
}, SS = (e) => {
  var t;
  return (t = e.followUpAnswers) == null ? void 0 : t.conversationId;
}, wS = (e) => {
  var t;
  return (t = e.generatedAnswer) == null ? void 0 : t.citations;
}, bS = (e) => {
  var t;
  return (t = e.followUpAnswers) == null ? void 0 : t.followUpAnswers;
}, CS = fe(bS, (e) => e == null ? void 0 : e.flatMap((t) => t.citations)), IS = (e, t) => t;
fe(wS, CS, IS, (e, t, r) => (e == null ? void 0 : e.find((n) => n.id === r)) ?? (t == null ? void 0 : t.find((n) => n.id === r)));
const ur = () => ({
  q: "",
  enableQuerySyntax: !1
});
function Ys() {
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
function ht() {
  return {
    response: {
      results: [],
      searchUid: "",
      totalCountFiltered: 0,
      facets: [],
      generateAutomaticFacets: { facets: [] },
      queryCorrections: [],
      triggers: [],
      questionAnswer: Ys(),
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
    questionAnswer: Ys(),
    extendedResults: {},
    searchAction: void 0
  };
}
var Ws;
(function(e) {
  e.Ascending = "ascending", e.Descending = "descending";
})(Ws || (Ws = {}));
var Ze;
(function(e) {
  e.Relevancy = "relevancy", e.QRE = "qre", e.Date = "date", e.Field = "field", e.NoSort = "nosort";
})(Ze || (Ze = {}));
const wd = (e) => {
  if (nl(e))
    return e.map((t) => wd(t)).join(",");
  switch (e.by) {
    case Ze.Relevancy:
    case Ze.QRE:
    case Ze.NoSort:
      return e.by;
    case Ze.Date:
      return `date ${e.order}`;
    case Ze.Field:
      return `@${e.field} ${e.order}`;
    default:
      return "";
  }
}, AS = () => ({
  by: Ze.Relevancy
});
new z({
  values: {
    by: new Er({ enum: Ze, required: !0 }),
    order: new Er({ enum: Ws }),
    field: new Q()
  }
});
function bd() {
  return wd(AS());
}
const Cd = () => "default", xS = (e) => {
  const t = e.configuration.search.locale.split("-")[0];
  return !t || t.length !== 2 ? "en" : t;
};
class kS {
  constructor(t) {
    H(this, "getState");
    H(this, "state");
    this.getState = t, this.state = t();
  }
  getLanguage() {
    return xS(this.state);
  }
  getBaseMetadata() {
    const { context: t, configuration: r } = this.state, n = (t == null ? void 0 : t.contextValues) || {}, i = {};
    for (const [s, o] of Object.entries(n)) {
      const a = `context_${s}`;
      i[a] = o;
    }
    return r.analytics.analyticsMode === "legacy" && (i.coveoHeadlessVersion = yo), i;
  }
  getOriginContext() {
    return this.state.configuration.analytics.originContext;
  }
  getOriginLevel1() {
    return this.state.searchHub || Cd();
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
const kr = class kr extends kS {
  constructor() {
    super(...arguments);
    H(this, "getFacetRequest", (r) => {
      var n, i, s, o, a, c, u, l, d, p;
      return ((i = (n = this.state.facetSet) == null ? void 0 : n[r]) == null ? void 0 : i.request) || ((o = (s = this.state.categoryFacetSet) == null ? void 0 : s[r]) == null ? void 0 : o.request) || ((c = (a = this.state.dateFacetSet) == null ? void 0 : a[r]) == null ? void 0 : c.request) || ((l = (u = this.state.numericFacetSet) == null ? void 0 : u[r]) == null ? void 0 : l.request) || ((p = (d = this.state.automaticFacetSet) == null ? void 0 : d.set[r]) == null ? void 0 : p.response);
    });
  }
  getFacetState() {
    return eS(Xv(this.getState()));
  }
  getPipeline() {
    var r;
    return this.state.pipeline || ((r = this.state.search) == null ? void 0 : r.response.pipeline) || kr.fallbackPipelineName;
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
    return ((n = r.search) == null ? void 0 : n.searchResponseId) || ((i = r.search) == null ? void 0 : i.response.searchUid) || ht().response.searchUid;
  }
  getSplitTestRunName() {
    var r;
    return (r = this.state.search) == null ? void 0 : r.response.splitTestRun;
  }
  getSplitTestRunVersion() {
    var i;
    const r = !!this.getSplitTestRunName(), n = ((i = this.state.search) == null ? void 0 : i.response.pipeline) || this.state.pipeline || kr.fallbackPipelineName;
    return r ? n : void 0;
  }
  getBaseMetadata() {
    const r = this.getState(), n = super.getBaseMetadata(), i = si(r);
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
      resultsSortBy: this.state.sortCriteria ?? bd()
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
    const i = (u = this.state.querySuggest) == null ? void 0 : u[r], s = i.completions.map((l) => l.expression), o = i.partialQueries.length - 1, a = i.partialQueries[o] || "", c = i.responseId;
    return {
      ...this.getBaseMetadata(),
      suggestionRanking: s.indexOf(n),
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
    return ((r = this.state.query) == null ? void 0 : r.q) || ur().q;
  }
  get responseTime() {
    var r;
    return ((r = this.state.search) == null ? void 0 : r.duration) || ht().duration;
  }
  get numberOfResults() {
    var r;
    return ((r = this.state.search) == null ? void 0 : r.response.totalCountFiltered) || ht().response.totalCountFiltered;
  }
};
H(kr, "fallbackPipelineName", "default");
let Xt = kr;
const ES = ({ logger: e, getState: t, analyticsClientMiddleware: r = (s, o) => o, preprocessRequest: n, provider: i }) => {
  const s = t(), o = s.configuration.accessToken, a = s.configuration.analytics.apiBaseUrl ?? Br(s.configuration.organizationId, s.configuration.environment, "analytics"), c = s.configuration.analytics.runtimeEnvironment, u = s.configuration.analytics.enabled, l = new jv({
    token: o,
    endpoint: a,
    runtimeEnvironment: c,
    preprocessRequest: zv(e, n),
    beforeSendHooks: [
      Bv(e, r),
      (d, p) => (e.info({
        ...p,
        type: d,
        endpoint: a,
        token: o
      }, "Analytics request"), p)
    ]
  }, i);
  return u || l.disable(), l;
}, yc = () => {
  const t = cr.getInstance().getHistory().reverse().find((r) => r.name === "PageView" && r.value);
  return t ? t.value : "";
}, qo = async (e, t) => {
  const r = e.analyticsMode === "next";
  return {
    analytics: {
      clientId: await Nv(e),
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
      ...yc() && { pageId: yc() },
      ...r && e.trackingId && { trackingId: e.trackingId },
      capture: r,
      ...r && { source: yi(e) }
    }
  };
}, Oo = async (e, t) => {
  var r, n, i, s;
  return {
    accessToken: e.configuration.accessToken,
    organizationId: e.configuration.organizationId,
    url: e.configuration.search.apiBaseUrl ?? sr(e.configuration.organizationId, e.configuration.environment),
    locale: e.configuration.search.locale,
    debug: e.debug,
    tab: e.configuration.analytics.originLevel2,
    referrer: e.configuration.analytics.originLevel3,
    timezone: e.configuration.search.timezone,
    ...e.configuration.analytics.enabled && {
      actionsHistory: cr.getInstance().getHistory()
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
    ...e.configuration.analytics.enabled && await qo(e.configuration.analytics, t),
    ...e.excerptLength && !ee(e.excerptLength.length) && {
      excerptLength: e.excerptLength.length
    },
    ...e.configuration.search.authenticationProviders.length && {
      authentication: e.configuration.search.authenticationProviders.join(",")
    }
  };
}, Ii = (e, t, r) => ({
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
    source: yi(e)
  }
}), Id = (e, t, r) => {
  var n, i, s, o;
  return {
    accessToken: e.configuration.accessToken,
    organizationId: e.configuration.organizationId,
    url: e.configuration.search.apiBaseUrl ?? sr(e.configuration.organizationId, e.configuration.environment),
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
    ...e.configuration.analytics.enabled && Ii(e.configuration.analytics, t, r),
    ...e.excerptLength && !ee(e.excerptLength.length) && {
      excerptLength: e.excerptLength.length
    },
    ...e.configuration.search.authenticationProviders.length && {
      authentication: e.configuration.search.authenticationProviders.join(",")
    }
  };
}, RS = fe((e) => e.staticFilterSet, (e) => Object.values(e || {}).map((r) => {
  const n = r.values.filter((s) => s.state === "selected" && !!s.expression.trim()), i = n.map((s) => s.expression).join(" OR ");
  return n.length > 1 ? `(${i})` : i;
}));
function qS(e) {
  return e.type === "dateRange";
}
function Ad(e) {
  return `start${e}`;
}
function xd(e) {
  return `end${e}`;
}
const kd = () => ({
  dateFacetValueMap: {}
});
function OS(e, t, r) {
  let n = e.start, i = e.end;
  return Tr(n) && (n = Vs(n), r.dateFacetValueMap[t][Ad(n)] = e.start), Tr(i) && (i = Vs(i), r.dateFacetValueMap[t][xd(i)] = e.end), { ...e, start: n, end: i };
}
function Ed(e, t) {
  if (qS(e)) {
    const { facetId: r, currentValues: n } = e;
    return t.dateFacetValueMap[r] = {}, {
      ...e,
      currentValues: n.map((i) => OS(i, r, t))
    };
  }
  return e;
}
function Ai(e) {
  var n;
  const t = kd();
  return { request: {
    ...e,
    facets: (n = e.facets) == null ? void 0 : n.map((i) => Ed(i, t))
  }, mappings: t };
}
function FS(e, t, r) {
  return {
    ...e,
    start: r.dateFacetValueMap[t][Ad(e.start)] || e.start,
    end: r.dateFacetValueMap[t][xd(e.end)] || e.end
  };
}
function DS(e, t) {
  return e.facetId in t.dateFacetValueMap;
}
function TS(e, t) {
  return DS(e, t) ? {
    ...e,
    values: e.values.map((r) => FS(r, e.facetId, t))
  } : e;
}
function Rd(e, t) {
  var r;
  return "success" in e ? { success: {
    ...e.success,
    facets: (r = e.success.facets) == null ? void 0 : r.map((i) => TS(i, t))
  } } : e;
}
const mt = async (e, t, r) => {
  var a;
  const n = Od(e), i = _S(e), s = MS(e), o = e.configuration.analytics.analyticsMode === "legacy" ? await Oo(e, r) : Id(e, t, r);
  return Ai({
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
    ...n && { cq: n },
    ...i.length && { facets: i },
    ...e.pagination && {
      numberOfResults: qd(e),
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
function qd(e) {
  return e.pagination ? e.pagination.firstResult + e.pagination.numberOfResults > _r ? _r - e.pagination.firstResult : e.pagination.numberOfResults : void 0;
}
function _S(e) {
  return Zl(US(e), e.facetOrder ?? []);
}
function MS(e) {
  var r;
  const t = (r = e.automaticFacetSet) == null ? void 0 : r.set;
  return t ? Object.values(t).map((n) => n.response).map(PS).filter((n) => n.currentValues.length > 0) : void 0;
}
function PS(e) {
  const { field: t, label: r, values: n } = e, i = n.filter((s) => s.state === "selected");
  return {
    field: t,
    label: r,
    currentValues: i
  };
}
function US(e) {
  return $S(e).filter(({ facetId: t }) => {
    var r, n;
    return ((n = (r = e.facetOptions) == null ? void 0 : r.facets[t]) == null ? void 0 : n.enabled) ?? !0;
  });
}
function $S(e) {
  return [
    ...VS(e.facetSet ?? {}),
    ...vc(e.numericFacetSet ?? {}),
    ...vc(e.dateFacetSet ?? {}),
    ...ar(e.categoryFacetSet ?? {})
  ];
}
function VS(e) {
  return ar(e).map((t) => {
    const r = Xl[t.sortCriteria];
    return r ? {
      ...t,
      sortCriteria: r
    } : t;
  });
}
function vc(e) {
  return ar(e).map((t) => {
    const r = t.currentValues, n = r.some(({ state: s }) => s !== "idle"), i = r.some((s) => s.previousState);
    return t.generateAutomaticRanges && !n && !i ? { ...t, currentValues: [] } : t;
  });
}
function Od(e) {
  var s;
  const t = ((s = e.advancedSearchQueries) == null ? void 0 : s.cq.trim()) || "", r = Object.values(e.tabSet || {}).find((o) => o.isActive), n = (r == null ? void 0 : r.expression.trim()) || "", i = RS(e);
  return [t, n, ...i].filter((o) => !!o).join(" AND ");
}
const LS = async (e, t, r, n) => {
  const i = t.categoryFacetSearchSet[e].options, s = t.categoryFacetSet[e].request, { captions: o, query: a, numberOfValues: c } = i, { field: u, delimitingCharacter: l, basePath: d, filterFacetCount: p } = s, g = QS(s), h = g.length ? [g] : [], f = `*${a}*`;
  return {
    url: t.configuration.search.apiBaseUrl ?? sr(t.configuration.organizationId, t.configuration.environment),
    accessToken: t.configuration.accessToken,
    organizationId: t.configuration.organizationId,
    ...t.configuration.search.authenticationProviders.length && {
      authentication: t.configuration.search.authenticationProviders.join(",")
    },
    basePath: d,
    captions: o,
    numberOfValues: c,
    query: f,
    field: u,
    delimitingCharacter: l,
    ignorePaths: h,
    filterFacetCount: p,
    type: "hierarchical",
    ...n ? {} : {
      searchContext: (await mt(t, r)).request
    }
  };
}, QS = (e) => {
  const t = [];
  let r = e.currentValues[0];
  for (; r; )
    t.push(r.value), r = r.children[0];
  return t;
}, jS = async (e, t, r, n) => {
  const { captions: i, query: s, numberOfValues: o } = t.facetSearchSet[e].options, { field: a, currentValues: c, filterFacetCount: u } = t.facetSet[e].request, l = c.filter((p) => p.state !== "idle").map((p) => p.value), d = `*${s}*`;
  return {
    url: t.configuration.search.apiBaseUrl ?? sr(t.configuration.organizationId, t.configuration.environment),
    accessToken: t.configuration.accessToken,
    organizationId: t.configuration.organizationId,
    ...t.configuration.search.authenticationProviders && {
      authentication: t.configuration.search.authenticationProviders.join(",")
    },
    captions: i,
    numberOfValues: o,
    query: d,
    field: a,
    ignoreValues: l,
    filterFacetCount: u,
    type: "specific",
    ...n ? {} : {
      searchContext: (await mt(t, r)).request
    }
  };
}, Fd = (e) => async (t, { getState: r, extra: { apiClient: n, validatePayload: i, navigatorContext: s } }) => {
  const o = r();
  let a;
  i(t, j), NS(o, t) ? a = await jS(t, o, s, e) : a = await LS(t, o, s, e);
  const c = await n.facetSearch(a);
  return { facetId: t, response: c };
};
ne("facetSearch/executeSearch", Fd(!1));
ne("facetSearch/executeSearch", Fd(!0));
const Dd = w("facetSearch/clearResults", (e) => R(e, { facetId: ue })), NS = (e, t) => e.facetSearchSet !== void 0 && e.facetSet !== void 0 && e.facetSet[t] !== void 0, Td = {
  facetId: ue,
  value: new z({
    values: {
      displayValue: Ue,
      rawValue: Ue,
      count: new G({ required: !0, min: 0 })
    }
  })
}, zS = w("facetSearch/register", (e) => R(e, bo)), _d = w("facetSearch/update", (e) => R(e, bo)), xi = w("facetSearch/toggleSelectValue", (e) => R(e, Td)), ki = w("facetSearch/toggleExcludeValue", (e) => R(e, Td)), BS = (e, t, r) => ({
  ...Hr(t, r),
  query: t.querySet[e]
}), HS = w("commerce/querySuggest/clear", (e) => R(e, { id: j })), Rt = ne("commerce/querySuggest/fetch", async (e, { getState: t, rejectWithValue: r, extra: { apiClient: n, validatePayload: i, navigatorContext: s } }) => {
  i(e, {
    id: j
  });
  const o = t(), a = BS(e.id, o, s), c = await n.querySuggest(a);
  return je(c) ? r(c.error) : {
    id: e.id,
    query: a.query,
    ...c.success
  };
}), YS = w("commerce/querySuggest/register", (e) => R(e, {
  id: j,
  count: new G({ min: 0 })
})), Md = w("commerce/querySuggest/selectSuggestion", (e) => R(e, {
  id: j,
  expression: Ue
})), WS = (e, t, r, n) => {
  var v, O;
  const i = t.categoryFacetSearchSet[e].options.query, s = `*${i}*`, o = (v = t.commerceFacetSet[Gs(e)]) == null ? void 0 : v.request, a = o && GS(o) ? o && KS(o) : [], c = a.length ? [a] : [], u = r ? i : (O = t.commerceQuery) == null ? void 0 : O.query, l = t.categoryFacetSearchSet[e].options.numberOfValues, { url: d, accessToken: p, organizationId: g, trackingId: h, language: f, country: m, currency: C, clientId: k, context: b, ...S } = $t(t, n);
  return {
    url: d,
    accessToken: p,
    organizationId: g,
    facetId: Gs(e),
    facetQuery: r ? "*" : s,
    numberOfValues: l,
    ignorePaths: c,
    trackingId: h,
    language: f,
    country: m,
    currency: C,
    clientId: k,
    context: b,
    query: u,
    ...!r && { ...S }
  };
};
function GS(e) {
  return e.type === "hierarchical";
}
const KS = (e) => {
  const t = [];
  let r = e.values[0];
  for (; r; )
    t.push(r.value), r = r.children[0];
  return t;
}, JS = (e, t, r, n) => {
  var k;
  const i = t.facetSearchSet[e].options.query, s = t.facetSearchSet[e].options.numberOfValues, o = `*${i}*`, a = r ? i : (k = t.commerceQuery) == null ? void 0 : k.query, { url: c, accessToken: u, organizationId: l, trackingId: d, language: p, country: g, currency: h, clientId: f, context: m, ...C } = $t(t, n);
  return {
    url: c,
    accessToken: u,
    organizationId: l,
    facetId: Gs(e),
    facetQuery: r ? "*" : o,
    numberOfValues: s,
    trackingId: d,
    language: p,
    country: g,
    currency: h,
    clientId: f,
    context: m,
    query: a,
    ...!r && { ...C }
  };
}, Pd = (e) => async ({ facetId: t, facetSearchType: r }, { getState: n, extra: { validatePayload: i, navigatorContext: s, apiClient: o } }) => {
  const a = n();
  i(t, j);
  const c = ZS(a, t) || XS(a, t) ? JS(t, a, e, s) : WS(t, a, e, s), u = await o.facetSearch(c, r);
  return { facetId: t, response: u };
}, Ht = ne("commerce/facetSearch/executeSearch", Pd(!1)), qt = ne("commerce/facetSearch/facetFieldSuggest", Pd(!0)), ZS = (e, t) => "facetSearchSet" in e && e.facetSearchSet[t] !== void 0 && e.commerceFacetSet[t] !== void 0, XS = (e, t) => "fieldSuggestionsOrder" in e ? e.fieldSuggestionsOrder.some((r) => r.facetId === t && r.type === "regular") : !1, oi = "field_suggestion:";
function Gs(e) {
  return e.startsWith(oi) ? e.slice(oi.length) : e;
}
function _t(e) {
  return e.startsWith(oi) ? e : `${oi}${e}`;
}
function Ud(e, t, r) {
  const { facetId: n, response: i } = t, s = e[n];
  s && s.requestId === r && (s.isLoading = !1, "success" in i && (s.response = i.success));
}
function $d(e, t, r, n) {
  const { facetId: i, response: s } = t, o = _t(i);
  let a = e[o];
  if (!a)
    Io(e, { facetId: o }, n), a = e[o];
  else if (a.requestId !== r)
    return;
  a.isLoading = !1, "success" in s && (a.response = s.success);
}
function ew(e, t, r, n) {
  if (t.fieldSuggestionsFacets)
    for (const i of t.fieldSuggestionsFacets)
      i.facetId in e || i.type !== "regular" || (e[i.facetId] = {
        options: {
          ...Zt,
          query: t.query ?? ""
        },
        isLoading: !1,
        response: n(),
        initialNumberOfValues: Zt.numberOfValues,
        requestId: r
      });
}
function tw(e, t, r, n) {
  if (t.fieldSuggestionsFacets)
    for (const i of t.fieldSuggestionsFacets) {
      const s = _t(i.facetId);
      s in e || i.type !== "hierarchical" || (e[s] = {
        options: {
          ...Zt,
          query: t.query ?? ""
        },
        isLoading: !1,
        response: n(),
        initialNumberOfValues: Zt.numberOfValues,
        requestId: r
      });
    }
}
se(ey(), (e) => {
  e.addCase(Xm, (t, r) => {
    const n = r.payload;
    Io(t, n, jt);
  }).addCase(_d, (t, r) => {
    Jl(t, r.payload);
  }).addCase(Ht.pending, (t, r) => {
    const { facetId: n } = r.meta.arg;
    ti(t, n, r.meta.requestId);
  }).addCase(qt.pending, (t, r) => {
    const { facetId: n } = r.meta.arg;
    ti(t, n, r.meta.requestId);
  }).addCase(Ht.rejected, (t, r) => {
    const { facetId: n } = r.meta.arg;
    ri(t, n);
  }).addCase(qt.rejected, (t, r) => {
    const { facetId: n } = r.meta.arg;
    ri(t, _t(n));
  }).addCase(Ht.fulfilled, (t, r) => {
    Ud(t, r.payload, r.meta.requestId);
  }).addCase(qt.fulfilled, (t, r) => {
    $d(t, r.payload, r.meta.requestId, jt);
  }).addCase(Rt.fulfilled, (t, r) => {
    tw(t, r.payload, r.meta.requestId, jt);
  }).addCase(Dd, (t, { payload: { facetId: r } }) => {
    Ao(t, { facetId: r }, jt);
  }).addCase(Me.fulfilled, (t) => Ar(t, jt)).addCase(Re.fulfilled, (t) => Ar(t, jt));
});
function jt() {
  return {
    moreValuesAvailable: !1,
    values: []
  };
}
function rw() {
  return {};
}
se(rw(), (e) => {
  e.addCase(zS, (t, r) => {
    const n = r.payload;
    Io(t, n, Ct);
  }).addCase(_d, (t, r) => {
    Jl(t, r.payload);
  }).addCase(Ht.pending, (t, r) => {
    const { facetId: n } = r.meta.arg;
    ti(t, n, r.meta.requestId);
  }).addCase(qt.pending, (t, r) => {
    const { facetId: n } = r.meta.arg;
    ti(t, _t(n), r.meta.requestId);
  }).addCase(Ht.rejected, (t, r) => {
    const { facetId: n } = r.meta.arg;
    ri(t, n);
  }).addCase(qt.rejected, (t, r) => {
    const { facetId: n } = r.meta.arg;
    ri(t, _t(n));
  }).addCase(Ht.fulfilled, (t, r) => {
    Ud(t, r.payload, r.meta.requestId);
  }).addCase(qt.fulfilled, (t, r) => {
    $d(t, r.payload, r.meta.requestId, Ct);
  }).addCase(Rt.fulfilled, (t, r) => {
    ew(t, r.payload, r.meta.requestId, Ct);
  }).addCase(Dd, (t, { payload: r }) => {
    Ao(t, r, Ct);
  }).addCase(Me.fulfilled, (t) => Ar(t, Ct)).addCase(Re.fulfilled, (t) => Ar(t, Ct)).addCase(st, (t) => Ar(t, Ct));
});
function Ct() {
  return {
    moreValuesAvailable: !1,
    values: []
  };
}
const Yr = w("breadcrumb/deselectAll"), Vd = w("breadcrumb/deselectAllNonBreadcrumbs"), Wr = w("facetOptions/update", (e = { freezeFacetOrder: !0 }) => R(e, {
  freezeFacetOrder: new ie({ required: !1 })
})), nw = w("facetOptions/facet/enable", (e) => R(e, ue)), Ei = w("facetOptions/facet/disable", (e) => R(e, ue)), Fo = (e, t) => {
  var r;
  return typeof e == "object" && Object.keys({ ...e }).length === 0 || !t || !e ? !0 : (r = e.excluded) != null && r.includes(t) ? !1 : !!(e.included && (e.included.length === 0 || e.included.includes(t)) || e.excluded && !e.included);
}, iw = w("history/undo"), sw = w("history/redo"), lt = w("history/snapshot");
ne("history/back", async (e, { dispatch: t }) => {
  t(iw()), await t(ot());
});
ne("history/forward", async (e, { dispatch: t }) => {
  t(sw()), await t(ot());
});
const ot = ne("history/change", async (e, { getState: t }) => t().history.present);
function ow() {
  const e = typeof window < "u";
  return {
    sendMessage(t) {
      e && window.postMessage(t, "*");
    }
  };
}
const aw = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/i;
function cw(e) {
  return typeof e == "string" && aw.test(e);
}
const we = [];
for (let e = 0; e < 256; ++e)
  we.push((e + 256).toString(16).slice(1));
function uw(e, t = 0) {
  return (we[e[t + 0]] + we[e[t + 1]] + we[e[t + 2]] + we[e[t + 3]] + "-" + we[e[t + 4]] + we[e[t + 5]] + "-" + we[e[t + 6]] + we[e[t + 7]] + "-" + we[e[t + 8]] + we[e[t + 9]] + "-" + we[e[t + 10]] + we[e[t + 11]] + we[e[t + 12]] + we[e[t + 13]] + we[e[t + 14]] + we[e[t + 15]]).toLowerCase();
}
let ns;
const lw = new Uint8Array(16);
function dw() {
  if (!ns) {
    if (typeof crypto > "u" || !crypto.getRandomValues)
      throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");
    ns = crypto.getRandomValues.bind(crypto);
  }
  return ns(lw);
}
const fw = typeof crypto < "u" && crypto.randomUUID && crypto.randomUUID.bind(crypto), Sc = { randomUUID: fw };
function hw(e, t, r) {
  var i;
  e = e || {};
  const n = e.random ?? ((i = e.rng) == null ? void 0 : i.call(e)) ?? dw();
  if (n.length < 16)
    throw new Error("Random bytes length must be >= 16");
  return n[6] = n[6] & 15 | 64, n[8] = n[8] & 63 | 128, uw(n);
}
function pw(e, t, r) {
  return Sc.randomUUID && !e ? Sc.randomUUID() : hw(e);
}
async function gw({ config: e, environment: t, event: r, listenerManager: n }) {
  const { url: i, token: s, mode: o } = e;
  if (o !== "disabled")
    return n.call(r), t.send(i, s, r);
}
const Ld = "2.1.1", is = 128, Qd = 192, wc = 224, bc = 240, mw = 248;
function yw(e) {
  return (e & mw) === bc ? 4 : (e & bc) === wc ? 3 : (e & wc) === Qd ? 2 : 1;
}
function vw(e, t) {
  if (t < 0 || e.length <= t)
    return e;
  let r = e.indexOf("%", t - 2);
  for (r < 0 || r > t ? r = t : t = r; r > 2 && e.charAt(r - 3) == "%"; ) {
    const n = Number.parseInt(e.substring(r - 2, r), 16);
    if ((n & is) != is)
      break;
    if (r -= 3, (n & Qd) != is) {
      t - r >= yw(n) * 3 && (r = t);
      break;
    }
  }
  return e.substring(0, r);
}
function Sw(e) {
  const { trackingId: t } = e;
  return { trackingId: t };
}
function ww(e) {
  return (e.source || []).concat([`relay@${Ld}`]);
}
function jd(e, t, r) {
  const { getReferrer: n, getLocation: i, getUserAgent: s } = r, o = Sw(t), a = r.getClientId();
  return Object.freeze({
    type: e,
    config: o,
    ts: Date.now(),
    source: ww(t),
    clientId: a,
    userAgent: s(),
    referrer: Cc(n()),
    location: Cc(i())
  });
}
function Cc(e) {
  return e !== null ? vw(e, 1024) : null;
}
function bw(e, t, r, n) {
  return {
    ...t,
    meta: jd(e, r, n)
  };
}
const Cw = "*";
function Iw() {
  const e = [];
  function t({ type: c, callback: u }) {
    return e.findIndex((l) => l.type === c && l.callback === u);
  }
  function r(c, u) {
    return c.type === "*" || u === c.type;
  }
  function n(c) {
    return t(c) < 0 && e.push(c), () => a(c.type, c.callback);
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
    if (c === Cw)
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
    add: n,
    call: i,
    remove: a
  };
}
function Ic({ url: e, token: t, trackingId: r, ...n }) {
  return Object.freeze({
    url: e,
    token: t,
    trackingId: r,
    ...!!n.mode && { mode: n.mode },
    ...!!n.source && { source: n.source },
    ...!!n.environment && { environment: n.environment }
  });
}
function Aw(e) {
  let t = Ic(e);
  return {
    get: () => t,
    update: (r) => {
      t = Ic({ ...t, ...r });
    }
  };
}
const ss = xw();
function xw() {
  const e = "coveo_", t = (r) => {
    const n = r.split(".").slice(-2);
    return n.length == 2 ? n.join(".") : "";
  };
  return {
    getItem(r) {
      const n = `${e}${r}=`, i = document.cookie.split(";");
      for (const s of i) {
        const o = s.replace(/^\s+/, "");
        if (o.lastIndexOf(n, 0) === 0)
          return o.substring(n.length, o.length);
      }
      return null;
    },
    setItem(r, n, i) {
      const s = t(window.location.hostname), o = `;expires=${new Date((/* @__PURE__ */ new Date()).getTime() + i).toUTCString()}`, a = s ? `;domain=${s}` : "";
      document.cookie = `${e}${r}=${n}${o}${a};path=/;SameSite=Lax`;
    },
    removeItem(r) {
      this.setItem(r, "", -1);
    }
  };
}
function kw() {
  return {
    getItem(e) {
      return ss.getItem(e) || localStorage.getItem(e);
    },
    removeItem(e) {
      ss.removeItem(e), localStorage.removeItem(e);
    },
    setItem(e, t) {
      localStorage.setItem(e, t), ss.setItem(e, t, 31556952e3);
    }
  };
}
const Ac = "visitorId";
function Ew() {
  const e = document.referrer;
  return e === "" ? null : e;
}
function Nd() {
  const e = kw();
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
      ow().sendMessage({ kind: "EVENT_PROTOCOL", event: n, url: t, token: r });
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
    getReferrer: () => Ew(),
    getLocation: () => window.location.href,
    getUserAgent: () => navigator.userAgent,
    getClientId: () => {
      const t = e.getItem(Ac);
      if (t && cw(t))
        return t;
      const r = pw();
      return e.setItem(Ac, r), r;
    }
  };
}
function Rw() {
  try {
    const e = "__storage_test__";
    return localStorage.setItem(e, e), localStorage.removeItem(e), !0;
  } catch (e) {
    return e instanceof DOMException && e.name === "QuotaExceededError" && // acknowledge QuotaExceededError only if there's something already stored
    localStorage && localStorage.length !== 0;
  }
}
function qw() {
  return {
    runtime: "null",
    send: () => Promise.resolve(void 0),
    getReferrer: () => null,
    getLocation: () => null,
    getUserAgent: () => null,
    getClientId: () => ""
  };
}
function Ow(e) {
  const t = e.get().mode !== "disabled", r = e.get().environment, n = qw();
  return t && r ? {
    ...r,
    runtime: "custom"
  } : t && Fw() && Rw() ? Nd() : n;
}
function Fw() {
  try {
    return typeof window == "object";
  } catch {
    return !1;
  }
}
function Dw(e) {
  return {
    get: () => Object.freeze(Ow(e))
  };
}
function Tw(e) {
  const t = Aw(e), r = Iw(), n = Dw(t);
  return {
    emit: async (i, s) => {
      const o = t.get(), a = n.get(), c = bw(i, s, o, a);
      return gw({
        config: o,
        environment: a,
        event: c,
        listenerManager: r
      });
    },
    getMeta: (i) => jd(i, t.get(), n.get()),
    on: (i, s) => r.add({ type: i, callback: s }),
    off: (i, s) => r.remove(i, s),
    updateConfig: (i) => t.update(i),
    version: Ld
  };
}
function _w() {
  return typeof window < "u" && typeof document < "u";
}
const Mw = fe((e) => e.configuration.organizationId, (e) => e.configuration.environment, (e) => e.configuration.accessToken, (e) => e.configuration.analytics, (e) => yi(e.configuration.analytics), (e, t) => t, (e, t, r, { trackingId: n, apiBaseUrl: i, enabled: s }, o, a) => {
  const c = Uw(a);
  return Tw({
    mode: s ? "emit" : "disabled",
    url: i ?? _g(e, t),
    token: r,
    trackingId: n ?? null,
    source: o,
    environment: c
  });
}), Pw = {
  getClientId: () => "",
  getLocation: () => null,
  getReferrer: () => null,
  getUserAgent: () => null,
  send: async () => {
  }
}, Uw = (e) => {
  if (!e)
    return;
  const t = e();
  return {
    ..._w() ? Nd() : Pw,
    getClientId: () => t.clientId,
    getLocation: () => t.location,
    getReferrer: () => t.referrer,
    getUserAgent: () => t.userAgent
  };
}, $w = () => "";
function Vw(e, t) {
  return {
    ...new Xt(t).getBaseMetadata(),
    actionCause: e,
    type: e
  };
}
function Lw(e) {
  return Object.assign(e, { instantlyCallable: !0 });
}
function Qw(e, t) {
  const r = (s) => {
    const o = ne(e, s);
    return Lw(Object.assign(o, {
      type: o.typePrefix
    }));
  }, n = r(async (s, { getState: o, extra: a }) => {
    const { analyticsClientMiddleware: c, preprocessRequest: u, logger: l } = a;
    return await (await t({
      getState: o,
      analyticsClientMiddleware: c,
      preprocessRequest: u,
      logger: l
    })).log({ state: o(), extra: a });
  });
  return Object.assign(n, {
    prepare: async ({ getState: s, analyticsClientMiddleware: o, preprocessRequest: a, logger: c }) => {
      const { description: u, log: l } = await t({
        getState: s,
        analyticsClientMiddleware: o,
        preprocessRequest: a,
        logger: c
      });
      return {
        description: u,
        action: r(async (d, { getState: p, extra: g }) => await l({ state: p(), extra: g }))
      };
    }
  }), n;
}
const jw = (e, t, r) => {
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
    return Bw(s);
  }
  return n;
}, Nw = (e) => e.configuration.analytics.analyticsMode === "legacy", zw = (e) => e.configuration.analytics.analyticsMode === "next", Bw = ({ prefix: e, __legacy__getBuilder: t, __legacy__provider: r, analyticsPayloadBuilder: n, analyticsType: i, analyticsConfigurator: s, providerClass: o }) => (r ?? (r = (a) => new o(a)), Qw(e, async ({ getState: a, analyticsClientMiddleware: c, preprocessRequest: u, logger: l }) => {
  const d = [], p = {
    log: async ({ state: C }) => {
      for (const k of d)
        await k(C);
    }
  }, g = a(), h = s({
    getState: a,
    logger: l,
    analyticsClientMiddleware: c,
    preprocessRequest: u,
    provider: r(a)
  }), f = await t(h, a());
  p.description = f == null ? void 0 : f.description, d.push(async (C) => {
    Nw(C) && await Hw(f, r, C, l, h.coveoAnalyticsClient);
  });
  const { emit: m } = Mw(g);
  return d.push(async (C) => {
    if (zw(C) && i && n) {
      const k = n(C);
      await Ww(m, i, k);
    }
  }), p;
}));
async function Hw(e, t, r, n, i) {
  t(() => r);
  const s = await (e == null ? void 0 : e.log({
    searchUID: t(() => r).getSearchUID()
  }));
  n.info({ client: i, response: s }, "Analytics response");
}
const St = jw((e) => ES({
  ...e,
  provider: e.provider || new Xt(e.getState)
}), (e) => e, Xt), Yw = {
  urihash: new Q(),
  sourcetype: new Q(),
  permanentid: new Q()
};
new z({ values: Yw }), new Q({ required: !1, emptyAllowed: !0 });
async function Ww(e, t, r) {
  await e(t, r);
}
var er;
(function(e) {
  e.interfaceLoad = "interfaceLoad", e.interfaceChange = "interfaceChange", e.didYouMeanAutomatic = "didYouMeanAutomatic", e.didYouMeanClick = "didYouMeanClick", e.resultsSort = "resultsSort", e.searchboxSubmit = "searchboxSubmit", e.searchboxAsYouType = "searchboxAsYouType", e.breadcrumbFacet = "breadcrumbFacet", e.breadcrumbResetAll = "breadcrumbResetAll", e.documentOpen = "documentOpen", e.omniboxAnalytics = "omniboxAnalytics", e.omniboxFromLink = "omniboxFromLink", e.searchFromLink = "searchFromLink", e.triggerQuery = "query", e.browseResults = "browseResults", e.staticFilterDeselect = "staticFilterDeselect", e.facetClearAll = "facetClearAll", e.facetSelect = "facetSelect", e.facetDeselect = "facetDeselect", e.facetExclude = "facetExclude", e.facetUnexclude = "facetUnexclude", e.facetUpdateSort = "facetUpdateSort", e.documentSuggestion = "documentSuggestion", e.facetShowMore = "showMoreFacetResults", e.facetShowLess = "showLessFacetResults", e.queryError = "query", e.recommendationInterfaceLoad = "recommendationInterfaceLoad", e.likeSmartSnippet = "likeSmartSnippet", e.dislikeSmartSnippet = "dislikeSmartSnippet", e.expandSmartSnippet = "expandSmartSnippet", e.collapseSmartSnippet = "collapseSmartSnippet", e.openSmartSnippetFeedbackModal = "openSmartSnippetFeedbackModal", e.closeSmartSnippetFeedbackModal = "closeSmartSnippetFeedbackModal", e.sendSmartSnippetReason = "sendSmartSnippetReason", e.expandSmartSnippetSuggestion = "expandSmartSnippetSuggestion", e.collapseSmartSnippetSuggestion = "collapseSmartSnippetSuggestion", e.openSmartSnippetSource = "openSmartSnippetSource", e.openSmartSnippetSuggestionSource = "openSmartSnippetSuggestionSource", e.showMoreFoldedResults = "showMoreFoldedResults", e.showLessFoldedResults = "showLessFoldedResults", e.copyToClipboard = "copyToClipboard", e.caseSendEmail = "Case.SendEmail", e.feedItemTextPost = "FeedItem.TextPost", e.caseAttach = "caseAttach", e.caseDetach = "caseDetach", e.generatedAnswerCitationDocumentAttach = "generatedAnswerCitationDocumentAttach", e.retryGeneratedAnswer = "retryGeneratedAnswer", e.likeGeneratedAnswer = "likeGeneratedAnswer", e.dislikeGeneratedAnswer = "dislikeGeneratedAnswer", e.openGeneratedAnswerSource = "openGeneratedAnswerSource", e.generatedAnswerStreamEnd = "generatedAnswerStreamEnd", e.contextChanged = "contextChanged", e.generatedAnswerSourceHover = "generatedAnswerSourceHover", e.generatedAnswerFeedbackSubmit = "generatedAnswerFeedbackSubmit", e.generatedAnswerHideAnswers = "generatedAnswerHideAnswers", e.generatedAnswerShowAnswers = "generatedAnswerShowAnswers", e.generatedAnswerExpand = "generatedAnswerExpand", e.generatedAnswerCollapse = "generatedAnswerCollapse", e.generatedAnswerCopyToClipboard = "generatedAnswerCopyToClipboard", e.expandToFullUI = "expandToFullUI", e.createArticle = "createArticle", e.recentQueriesClick = "recentQueriesClick", e.clearRecentQueries = "clearRecentQueries";
})(er || (er = {}));
const zd = w("facet/updateFacetAutoSelection", (e) => R(e, {
  allow: new ie({ required: !0 })
}));
class Gw extends Xt {
  constructor(r) {
    super(r);
    H(this, "getState");
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
    return this.activeInstantResultQuery ?? ur().q;
  }
  get responseTime() {
    var r;
    return ((r = this.activeInstantResultCache) == null ? void 0 : r.duration) ?? ht().duration;
  }
  get numberOfResults() {
    var r;
    return ((r = this.activeInstantResultCache) == null ? void 0 : r.totalCountFiltered) ?? ht().response.totalCountFiltered;
  }
  getSearchUID() {
    var n;
    return ((n = this.activeInstantResultCache) == null ? void 0 : n.searchUid) || super.getSearchUID();
  }
}
const Kw = () => St("analytics/instantResult/searchboxAsYouType", (e) => e.makeSearchboxAsYouType(), (e) => new Gw(e)), Jw = () => ({
  actionCause: er.searchboxAsYouType
}), Do = {
  id: j
}, Zw = {
  ...Do,
  q: Ue
};
w("instantResults/register", (e) => R(e, Do));
const Bd = w("instantResults/updateQuery", (e) => R(e, Zw));
w("instantResults/clearExpired", (e) => R(e, Do));
const Ri = new G({ required: !0, min: 0 }), Xw = w("pagination/registerNumberOfResults", (e) => R(e, Ri)), eb = w("pagination/updateNumberOfResults", (e) => R(e, Ri)), tb = w("pagination/registerPage", (e) => R(e, Ri)), Hd = w("pagination/updatePage", (e) => R(e, Ri)), rb = w("pagination/nextPage"), nb = w("pagination/previousPage"), qi = w("query/updateQuery", (e) => R(e, {
  q: new Q(),
  enableQuerySyntax: new ie()
})), $n = () => ({
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
}), xc = () => St("search/logFetchMoreResults", (e) => e.makeFetchMoreResults()), Yt = (e) => St("search/queryError", (t, r) => {
  var n, i, s, o;
  return t.makeQueryError({
    query: ((n = r.query) == null ? void 0 : n.q) || ur().q,
    aq: ((i = r.advancedSearchQueries) == null ? void 0 : i.aq) || $n().aq,
    cq: ((s = r.advancedSearchQueries) == null ? void 0 : s.cq) || $n().cq,
    dq: ((o = r.advancedSearchQueries) == null ? void 0 : o.dq) || $n().dq,
    errorType: e.type,
    errorMessage: e.message
  });
}), Yd = (e) => e.success !== void 0, pt = (e) => e.error !== void 0;
w("didYouMean/enable");
w("didYouMean/disable");
w("didYouMean/automaticCorrections/disable");
w("didYouMean/automaticCorrections/enable");
const To = w("didYouMean/correction", (e) => R(e, j));
w("didYouMean/automaticCorrections/mode", (e) => R(e, new Q({
  constrainTo: ["next", "legacy"],
  emptyAllowed: !1,
  required: !0
})));
const kc = () => St("analytics/didyoumean/automatic", (e) => e.makeDidYouMeanAutomatic()), ib = () => ({
  actionCause: er.didYouMeanAutomatic
});
function sb() {
  return {
    contextValues: {}
  };
}
const ob = () => !1;
function ab() {
  return {
    contextValues: {}
  };
}
function Wd() {
  return { enabled: !0, tabs: {} };
}
function Gd() {
  return {
    freezeFacetOrder: !1,
    facets: {}
  };
}
function _o() {
  return {
    firstResult: 0,
    defaultNumberOfResults: 10,
    numberOfResults: 10,
    totalCountFiltered: 0
  };
}
function Mo() {
  return {};
}
function cb() {
  return {};
}
function ub() {
  return {};
}
function dt(e) {
  return {
    context: e.context || sb(),
    dictionaryFieldContext: e.dictionaryFieldContext || ab(),
    facetSet: e.facetSet || Ro(),
    numericFacetSet: e.numericFacetSet || Eo(),
    dateFacetSet: e.dateFacetSet || ko(),
    categoryFacetSet: e.categoryFacetSet || vd(),
    automaticFacetSet: e.automaticFacetSet ?? md(),
    pagination: e.pagination || _o(),
    query: e.query || ur(),
    tabSet: e.tabSet || ub(),
    advancedSearchQueries: e.advancedSearchQueries || $n(),
    staticFilterSet: e.staticFilterSet || cb(),
    querySet: e.querySet || Mo(),
    sortCriteria: e.sortCriteria || bd(),
    pipeline: e.pipeline || $w(),
    searchHub: e.searchHub || Cd(),
    facetOptions: e.facetOptions || Gd(),
    facetOrder: e.facetOrder ?? Pn(),
    debug: e.debug ?? ob()
  };
}
new z({
  values: {
    undoneQuery: Ue
  },
  options: { required: !0 }
});
const lb = () => St("analytics/trigger/query", (e, t) => {
  var r;
  return (r = t.triggers) != null && r.queryModification.newQuery ? e.makeTriggerQuery() : null;
}), Kd = w("trigger/query/ignore", (e) => R(e, new Q({ emptyAllowed: !0, required: !0 }))), Jd = w("trigger/query/modification", (e) => R(e, new z({
  values: { originalQuery: ve, modification: ve }
}))), tr = async (e, t) => {
  var a;
  const r = hb(e), n = ed(e), i = db(e), s = await Oo(e, t), o = () => e.pagination ? e.pagination.firstResult + e.pagination.numberOfResults > _r ? _r - e.pagination.firstResult : e.pagination.numberOfResults : void 0;
  return Ai({
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
function db(e) {
  var r;
  const t = (r = e.automaticFacetSet) == null ? void 0 : r.set;
  return t ? Object.values(t).map((n) => n.response).map(fb).filter((n) => n.currentValues.length > 0) : void 0;
}
function fb(e) {
  const { field: t, label: r, values: n } = e, i = n.filter((s) => s.state === "selected");
  return {
    field: t,
    label: r,
    currentValues: i
  };
}
function hb(e) {
  var s;
  const t = ((s = e.advancedSearchQueries) == null ? void 0 : s.cq.trim()) || "", r = Object.values(e.tabSet || {}).find((o) => o.isActive), n = (r == null ? void 0 : r.expression.trim()) || "", i = pb(e);
  return [t, n, ...i].filter((o) => !!o).join(" AND ");
}
function pb(e) {
  return Object.values(e.staticFilterSet || {}).map((r) => {
    const n = r.values.filter((s) => s.state === "selected" && !!s.expression.trim()), i = n.map((s) => s.expression).join(" OR ");
    return n.length > 1 ? `(${i})` : i;
  });
}
let Gr = class {
  constructor(t, r = (n) => {
    this.dispatch(qi({ q: n }));
  }) {
    H(this, "config");
    H(this, "onUpdateQueryForCorrection");
    this.config = t, this.onUpdateQueryForCorrection = r;
  }
  async fetchFromAPI({ mappings: t, request: r }, n) {
    var c;
    const i = Date.now(), s = Rd(await this.extra.apiClient.search(r, n), t), o = Date.now() - i, a = ((c = this.getState().query) == null ? void 0 : c.q) || "";
    return { response: s, duration: o, queryExecuted: a, requestExecuted: r };
  }
  async process(t) {
    return this.processQueryErrorOrContinue(t) ?? await this.processQueryCorrectionsOrContinue(t) ?? await this.processQueryTriggersOrContinue(t) ?? this.processSuccessResponse(t);
  }
  processQueryErrorOrContinue(t) {
    return pt(t.response) ? (this.dispatch(Yt(t.response.error)), this.rejectWithValue(t.response.error)) : null;
  }
  async processQueryCorrectionsOrContinue(t) {
    const r = this.getState(), n = this.getSuccessResponse(t);
    if (!n || !r.didYouMean)
      return null;
    const { enableDidYouMean: i, automaticallyCorrectQuery: s } = r.didYouMean, { results: o, queryCorrections: a, queryCorrection: c } = n;
    if (!i || !s)
      return null;
    const u = o.length === 0 && a && a.length !== 0, l = !ee(c) && !ee(c.correctedQuery);
    if (!u && !l)
      return null;
    const p = u ? await this.processLegacyDidYouMeanAutoCorrection(t) : this.processModernDidYouMeanAutoCorrection(t);
    return this.dispatch(lt(dt(this.getState()))), p;
  }
  async processLegacyDidYouMeanAutoCorrection(t) {
    const r = this.getCurrentQuery(), n = this.getSuccessResponse(t);
    if (!n.queryCorrections)
      return null;
    const { correctedQuery: i } = n.queryCorrections[0], s = await this.automaticallyRetryQueryWithCorrection(i);
    return pt(s.response) ? (this.dispatch(Yt(s.response.error)), this.rejectWithValue(s.response.error)) : (this.logOriginalAnalyticsQueryBeforeAutoCorrection(t), this.dispatch(lt(dt(this.getState()))), {
      ...s,
      response: {
        ...s.response.success,
        queryCorrections: n.queryCorrections
      },
      automaticallyCorrected: !0,
      originalQuery: r,
      analyticsAction: kc()
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
      analyticsAction: kc()
    };
  }
  logOriginalAnalyticsQueryBeforeAutoCorrection(t) {
    var i;
    const r = this.getState(), n = this.getSuccessResponse(t);
    (i = this.analyticsAction) == null || i.call(this)(this.dispatch, () => this.getStateAfterResponse(t.queryExecuted, t.duration, r, n), this.extra);
  }
  async processQueryTriggersOrContinue(t) {
    var a, c;
    const r = this.getSuccessResponse(t);
    if (!r)
      return null;
    const n = ((a = r.triggers.find((u) => u.type === "query")) == null ? void 0 : a.content) || "";
    if (!n)
      return null;
    if (((c = this.getState().triggers) == null ? void 0 : c.queryModification.queryToIgnore) === n)
      return this.dispatch(Kd("")), null;
    this.analyticsAction && await this.dispatch(this.analyticsAction);
    const s = this.getCurrentQuery(), o = await this.automaticallyRetryQueryWithTriggerModification(n);
    return pt(o.response) ? (this.dispatch(Yt(o.response.error)), this.rejectWithValue(o.response.error)) : (this.dispatch(lt(dt(this.getState()))), {
      ...o,
      response: {
        ...o.response.success
      },
      automaticallyCorrected: !1,
      originalQuery: s,
      analyticsAction: lb()
    });
  }
  getStateAfterResponse(t, r, n, i) {
    var s;
    return {
      ...n,
      query: {
        q: t,
        enableQuerySyntax: ((s = n.query) == null ? void 0 : s.enableQuerySyntax) ?? ur().enableQuerySyntax
      },
      search: {
        ...ht(),
        duration: r,
        response: i,
        results: i.results
      }
    };
  }
  processSuccessResponse(t) {
    return this.dispatch(lt(dt(this.getState()))), {
      ...t,
      response: this.getSuccessResponse(t),
      automaticallyCorrected: !1,
      originalQuery: this.getCurrentQuery(),
      analyticsAction: this.analyticsAction
    };
  }
  getSuccessResponse(t) {
    return Yd(t.response) ? t.response.success : null;
  }
  async automaticallyRetryQueryWithCorrection(t) {
    this.onUpdateQueryForCorrection(t);
    const r = await this.fetchFromAPI(await tr(this.getState()), { origin: "mainSearch" });
    return this.dispatch(To(t)), r;
  }
  async automaticallyRetryQueryWithTriggerModification(t) {
    return this.dispatch(Jd({
      newQuery: t,
      originalQuery: this.getCurrentQuery()
    })), this.onUpdateQueryForCorrection(t), await this.fetchFromAPI(await tr(this.getState()), { origin: "mainSearch" });
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
  return await Po(r, t, e);
});
ne("search/fetchPage", async (e, t) => {
  const r = t.getState();
  return await ef(r, t, e);
});
ne("search/fetchMoreResults", async (e, t) => {
  const r = t.getState();
  return await tf(t, r);
});
ne("search/fetchFacetValues", async (e, t) => {
  const r = t.getState();
  return await vb(t, e, r);
});
ne("search/fetchInstantResults", async (e, t) => Xd(e, t));
const gb = async (e, t) => {
  var n, i;
  const r = await tr(e, t);
  return r.request = {
    ...r.request,
    firstResult: (((n = e.pagination) == null ? void 0 : n.firstResult) ?? 0) + (((i = e.search) == null ? void 0 : i.results.length) ?? 0)
  }, r;
}, mb = async (e, t, r) => {
  const n = await Oo(e);
  return Ai({
    ...n,
    ...e.didYouMean && {
      enableDidYouMean: e.didYouMean.enableDidYouMean
    },
    numberOfResults: r,
    q: t
  });
}, yb = async (e, t) => {
  const r = await tr(e, t);
  return r.request.numberOfResults = 0, r;
}, Zd = (e) => {
  var t;
  e.configuration.analytics.enabled && cr.getInstance().addElement({
    name: "Query",
    ...((t = e.query) == null ? void 0 : t.q) && {
      value: e.query.q
    },
    time: JSON.stringify(/* @__PURE__ */ new Date())
  });
};
async function Xd(e, t) {
  R(e, {
    id: j,
    q: j,
    maxResultsPerQuery: new G({
      required: !0,
      min: 1
    }),
    cacheTimeout: new G()
  });
  const { q: r, maxResultsPerQuery: n } = e, i = t.getState(), s = new Gr({ ...t, analyticsAction: Kw() }, (u) => {
    t.dispatch(Bd({ q: u, id: e.id }));
  }), o = await mb(i, r, n), a = await s.fetchFromAPI(o, {
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
async function ef(e, t, r) {
  Zd(e);
  const { analyticsClientMiddleware: n, preprocessRequest: i, logger: s } = t.extra, { description: o } = await r.prepare({
    getState: () => t.getState(),
    analyticsClientMiddleware: n,
    preprocessRequest: i,
    logger: s
  }), a = new Gr({
    ...t,
    analyticsAction: r
  }), c = await tr(e, o), u = await a.fetchFromAPI(c, { origin: "mainSearch" });
  return await a.process(u);
}
async function tf(e, t) {
  const { analyticsClientMiddleware: r, preprocessRequest: n, logger: i } = e.extra, { description: s } = await xc().prepare({
    getState: () => e.getState(),
    analyticsClientMiddleware: r,
    preprocessRequest: n,
    logger: i
  }), o = new Gr({
    ...e,
    analyticsAction: xc()
  }), a = await gb(t, s), c = await o.fetchFromAPI(a, { origin: "mainSearch" });
  return await o.process(c);
}
async function vb(e, t, r) {
  const { analyticsClientMiddleware: n, preprocessRequest: i, logger: s } = e.extra, { description: o } = await t.prepare({
    getState: () => e.getState(),
    analyticsClientMiddleware: n,
    preprocessRequest: i,
    logger: s
  }), a = new Gr({ ...e, analyticsAction: t }), c = await yb(r, o), u = await a.fetchFromAPI(c, {
    origin: "facetValues"
  });
  return await a.process(u);
}
async function Po(e, t, r) {
  Zd(e);
  const { analyticsClientMiddleware: n, preprocessRequest: i, logger: s } = t.extra, { description: o } = await r.prepare({
    getState: () => t.getState(),
    analyticsClientMiddleware: n,
    preprocessRequest: i,
    logger: s
  }), a = await tr(e, o), c = new Gr({ ...t, analyticsAction: r }), u = await c.fetchFromAPI(a, { origin: "mainSearch" });
  return await c.process(u);
}
class Kr {
  constructor(t, r = (n) => {
    this.dispatch(qi({ q: n }));
  }) {
    H(this, "config");
    H(this, "onUpdateQueryForCorrection");
    this.config = t, this.onUpdateQueryForCorrection = r;
  }
  async fetchFromAPI({ mappings: t, request: r }, n) {
    var c;
    const i = Date.now(), s = Rd(await this.extra.apiClient.search(r, n), t), o = Date.now() - i, a = ((c = this.getState().query) == null ? void 0 : c.q) || "";
    return { response: s, duration: o, queryExecuted: a, requestExecuted: r };
  }
  async process(t) {
    return this.processQueryErrorOrContinue(t) ?? await this.processQueryCorrectionsOrContinue(t) ?? await this.processQueryTriggersOrContinue(t) ?? this.processSuccessResponse(t);
  }
  processQueryErrorOrContinue(t) {
    return pt(t.response) ? (this.dispatch(Yt(t.response.error)), this.rejectWithValue(t.response.error)) : null;
  }
  async processQueryCorrectionsOrContinue(t) {
    const r = this.getState(), n = this.getSuccessResponse(t);
    if (!n || !r.didYouMean)
      return null;
    const { enableDidYouMean: i, automaticallyCorrectQuery: s } = r.didYouMean, { results: o, queryCorrections: a, queryCorrection: c } = n;
    if (!i)
      return null;
    if (!s)
      return !ee(c) && !ee(c.correctedQuery) ? this.processModernDidYouMeanAutoCorrection(t) : null;
    const u = o.length === 0 && a && a.length !== 0, l = !ee(c) && !ee(c.correctedQuery);
    if (!u && !l)
      return null;
    const p = u ? await this.processLegacyDidYouMeanAutoCorrection(t) : this.processModernDidYouMeanAutoCorrection(t);
    return this.dispatch(lt(dt(this.getState()))), p;
  }
  async processLegacyDidYouMeanAutoCorrection(t) {
    const r = this.getCurrentQuery(), n = this.getSuccessResponse(t);
    if (!n.queryCorrections)
      return null;
    const { correctedQuery: i } = n.queryCorrections[0], s = await this.automaticallyRetryQueryWithCorrection(i);
    return pt(s.response) ? (this.dispatch(Yt(s.response.error)), this.rejectWithValue(s.response.error)) : (this.dispatch(lt(dt(this.getState()))), {
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
    var a, c;
    const r = this.getSuccessResponse(t);
    if (!r)
      return null;
    const n = ((a = r.triggers.find((u) => u.type === "query")) == null ? void 0 : a.content) || "";
    if (!n)
      return null;
    if (((c = this.getState().triggers) == null ? void 0 : c.queryModification.queryToIgnore) === n)
      return this.dispatch(Kd("")), null;
    const s = this.getCurrentQuery(), o = await this.automaticallyRetryQueryWithTriggerModification(n);
    return pt(o.response) ? (this.dispatch(Yt(o.response.error)), this.rejectWithValue(o.response.error)) : (this.dispatch(lt(dt(this.getState()))), {
      ...o,
      response: {
        ...o.response.success
      },
      automaticallyCorrected: !1,
      originalQuery: s
    });
  }
  processSuccessResponse(t) {
    return this.dispatch(lt(dt(this.getState()))), {
      ...t,
      response: this.getSuccessResponse(t),
      automaticallyCorrected: !1,
      originalQuery: this.getCurrentQuery()
    };
  }
  getSuccessResponse(t) {
    return Yd(t.response) ? t.response.success : null;
  }
  async automaticallyRetryQueryWithCorrection(t) {
    this.onUpdateQueryForCorrection(t);
    const r = this.getState(), { actionCause: n } = ib(), i = await this.fetchFromAPI(await mt(r, this.extra.navigatorContext, {
      actionCause: n
    }), { origin: "mainSearch" });
    return this.dispatch(To(t)), i;
  }
  async automaticallyRetryQueryWithTriggerModification(t) {
    return this.dispatch(Jd({
      newQuery: t,
      originalQuery: this.getCurrentQuery()
    })), this.onUpdateQueryForCorrection(t), await this.fetchFromAPI(await mt(this.getState(), this.extra.navigatorContext), { origin: "mainSearch" });
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
  R(e, {
    q: new Q(),
    enableQuerySyntax: new ie(),
    clearFilters: new ie()
  }), e.clearFilters && (r(Yr()), r(Vd())), r(zd({ allow: !0 })), r(qi({ q: e.q, enableQuerySyntax: e.enableQuerySyntax })), r(Hd(1));
});
const Sb = w("search/updateSearchAction"), Pe = ne("search/executeSearch", async (e, t) => {
  const r = t.getState();
  if (r.configuration.analytics.analyticsMode === "legacy")
    return Po(r, t, e.legacy);
  nf(r);
  const n = e.next ? sf(e.next) : void 0, i = await mt(r, t.extra.navigatorContext, n), s = new Kr({ ...t, analyticsAction: n ?? {} }), o = await s.fetchFromAPI(i, {
    origin: "mainSearch"
  });
  return await s.process(o);
}), Vn = ne("search/fetchPage", async (e, t) => {
  const r = t.getState();
  if (nf(r), r.configuration.analytics.analyticsMode === "legacy" || !e.next)
    return ef(r, t, e.legacy);
  const n = new Kr({
    ...t,
    analyticsAction: e.next
  }), i = await mt(r, t.extra.navigatorContext, e.next), s = await n.fetchFromAPI(i, { origin: "mainSearch" });
  return await n.process(s);
}), os = ne("search/fetchMoreResults", async (e, t) => {
  const r = t.getState();
  if (r.configuration.analytics.analyticsMode === "legacy")
    return tf(t, r);
  const n = Vw(er.browseResults, t.getState), i = new Kr({
    ...t,
    analyticsAction: n
  }), s = await wb(r, t.extra.navigatorContext, n), o = await i.fetchFromAPI(s, { origin: "mainSearch" });
  return await i.process(o);
}), rf = ne("search/fetchFacetValues", async (e, t) => {
  const r = t.getState();
  if (r.configuration.analytics.analyticsMode === "legacy")
    return Po(r, t, e.legacy);
  const n = new Kr({ ...t, analyticsAction: {} }), i = await Cb(r, t.extra.navigatorContext), s = await n.fetchFromAPI(i, {
    origin: "facetValues"
  });
  return await n.process(s);
});
ne("search/fetchInstantResults", async (e, t) => {
  const r = t.getState();
  if (r.configuration.analytics.analyticsMode === "legacy")
    return Xd(e, t);
  R(e, {
    id: j,
    q: j,
    maxResultsPerQuery: new G({
      required: !0,
      min: 1
    }),
    cacheTimeout: new G()
  });
  const { q: n, maxResultsPerQuery: i } = e, s = sf(Jw()), o = await bb(r, t.extra.navigatorContext, n, i, s), a = new Kr({ ...t, analyticsAction: s }, (l) => {
    t.dispatch(Bd({ q: l, id: e.id }));
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
const wb = async (e, t, r) => {
  var i, s;
  const n = await mt(e, t, r);
  return n.request = {
    ...n.request,
    firstResult: (((i = e.pagination) == null ? void 0 : i.firstResult) ?? 0) + (((s = e.search) == null ? void 0 : s.results.length) ?? 0)
  }, n;
}, bb = async (e, t, r, n, i) => {
  const s = Id(e, t, i);
  return Ai({
    ...s,
    ...e.didYouMean && {
      enableDidYouMean: e.didYouMean.enableDidYouMean
    },
    numberOfResults: n,
    q: r
  });
}, Cb = async (e, t, r) => {
  const n = await mt(e, t, r);
  return n.request.numberOfResults = 0, n;
}, nf = (e) => {
  var t;
  e.configuration.analytics.enabled && cr.getInstance().addElement({
    name: "Query",
    ...((t = e.query) == null ? void 0 : t.q) && {
      value: e.query.q
    },
    time: JSON.stringify(/* @__PURE__ */ new Date())
  });
}, sf = (e) => ({
  actionCause: e.actionCause,
  type: e.actionCause
}), of = {
  q: new Q(),
  enableQuerySyntax: new ie(),
  aq: new Q(),
  cq: new Q(),
  firstResult: new G({ min: 0 }),
  numberOfResults: new G({ min: 0 }),
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
}, wt = w("searchParameters/restore", (e) => R(e, of)), Ib = w("searchParameters/restoreTab", (e) => R(e, j));
w("tab/register", (e) => {
  const t = new z({
    values: {
      id: j,
      expression: Ue
    }
  });
  return R(e, t);
});
const Jr = w("tab/updateActiveTab", (e) => R(e, j));
function Uo(e, t) {
  var s;
  const { facetId: r, criterion: n } = t, i = (s = e[r]) == null ? void 0 : s.request;
  i && (i.sortCriteria = n);
}
function gr(e) {
  e && (e.currentValues = e.currentValues.map((t) => ({
    ...t,
    previousState: t.state !== "idle" ? t.state : void 0,
    state: "idle"
  })), e.preventAutoSelect = !0);
}
function Ab(e, t) {
  e && (e.numberOfValues = t);
}
const af = new Q({
  regex: /^[a-zA-Z0-9-_]+$/
}), cf = new Q({ required: !0 });
new ae({
  each: new Q()
});
new Q();
const uf = new ie(), lf = new G({ min: 0 }), $o = new G({ min: 1 }), df = new ie({
  required: !0
}), xb = new z(), kb = new Q(), Eb = {
  captions: xb,
  numberOfValues: $o,
  query: kb
};
new z({
  values: Eb
});
const Rb = new z({
  options: { required: !1 },
  values: {
    type: new Q({
      constrainTo: ["simple"],
      emptyAllowed: !1,
      required: !0
    }),
    values: new ae({
      required: !0,
      max: 25,
      each: new Q({ emptyAllowed: !1, required: !0 })
    })
  }
}), qb = new ae({
  min: 1,
  max: 25,
  required: !1,
  each: new Q({ emptyAllowed: !1, required: !0 })
}), lr = {
  value: j,
  numberOfResults: new G({ min: 0 }),
  state: j
}, Ob = {
  facetId: ue,
  field: new Q({ required: !0, emptyAllowed: !0 }),
  tabs: new z({
    options: {
      required: !1
    },
    values: {
      included: new ae({ each: new Q() }),
      excluded: new ae({ each: new Q() })
    }
  }),
  activeTab: new Q({ required: !1 }),
  filterFacetCount: new ie({ required: !1 }),
  injectionDepth: new G({ required: !1, min: 0 }),
  numberOfValues: new G({ required: !1, min: 1 }),
  sortCriteria: new Ie({ required: !1 }),
  resultsMustMatch: new Ie({ required: !1 }),
  allowedValues: Rb,
  customSort: qb
}, ff = w("facet/register", (e) => R(e, Ob)), hf = w("facet/toggleSelectValue", (e) => R(e, {
  facetId: ue,
  selection: new z({ values: lr })
})), pf = w("facet/toggleExcludeValue", (e) => R(e, {
  facetId: ue,
  selection: new z({ values: lr })
})), Oi = w("facet/deselectAll", (e) => R(e, ue)), Fb = w("facet/updateSortCriterion", (e) => R(e, {
  facetId: ue,
  criterion: new Ie({ required: !0 })
})), Db = w("facet/updateNumberOfValues", (e) => R(e, {
  facetId: ue,
  numberOfValues: new G({ required: !0, min: 1 })
})), Tb = w("facet/updateIsFieldExpanded", (e) => R(e, {
  facetId: ue,
  isFieldExpanded: new ie({ required: !0 })
})), _b = w("facet/updateFreezeCurrentValues", (e) => R(e, {
  facetId: ue,
  freezeCurrentValues: new ie({ required: !0 })
}));
se(Ro(), (e) => {
  e.addCase(ff, (t, r) => {
    const { facetId: n, tabs: i } = r.payload;
    n in t || (t[n] = Zv(Pb(r.payload), i));
  }).addCase(ot.fulfilled, (t, r) => {
    if (r.payload && Object.keys(r.payload.facetSet).length !== 0)
      return r.payload.facetSet;
  }).addCase(wt, (t, r) => {
    const n = r.payload.f || {}, i = r.payload.fExcluded || {};
    Object.keys(t).forEach((o) => {
      const { request: a } = t[o], c = n[o] || [], u = i[o] || [], l = c.length + u.length, d = a.currentValues.filter((p) => !c.includes(p.value) && !u.includes(p.value));
      a.currentValues = [
        ...c.map(Rc),
        ...u.map(qc),
        ...d.map(Ub)
      ], a.preventAutoSelect = l > 0, a.numberOfValues = Math.max(l, a.numberOfValues);
    });
  }).addCase(hf, (t, r) => {
    var c;
    const { facetId: n, selection: i } = r.payload, s = (c = t[n]) == null ? void 0 : c.request;
    if (!s)
      return;
    s.preventAutoSelect = !0;
    const o = s.currentValues.find((u) => u.value === i.value);
    if (!o) {
      bn(s, i);
      return;
    }
    const a = o.state === "selected";
    o.previousState = o.state, o.state = a ? "idle" : "selected", s.freezeCurrentValues = !0;
  }).addCase(pf, (t, r) => {
    var c;
    const { facetId: n, selection: i } = r.payload, s = (c = t[n]) == null ? void 0 : c.request;
    if (!s)
      return;
    s.preventAutoSelect = !0;
    const o = s.currentValues.find((u) => u.value === i.value);
    if (!o) {
      bn(s, i);
      return;
    }
    const a = o.state === "excluded";
    o.previousState = o.state, o.state = a ? "idle" : "excluded", s.freezeCurrentValues = !0;
  }).addCase(_b, (t, r) => {
    var o;
    const { facetId: n, freezeCurrentValues: i } = r.payload, s = (o = t[n]) == null ? void 0 : o.request;
    s && (s.freezeCurrentValues = i);
  }).addCase(Oi, (t, r) => {
    var n;
    gr((n = t[r.payload]) == null ? void 0 : n.request);
  }).addCase(Yr, (t) => {
    Object.values(t).filter((r) => r.hasBreadcrumbs).forEach(({ request: r }) => gr(r));
  }).addCase(Vd, (t) => {
    Object.values(t).filter((r) => !r.hasBreadcrumbs).forEach(({ request: r }) => gr(r));
  }).addCase(zd, (t, r) => Object.values(t).forEach((n) => {
    n.request.preventAutoSelect = !r.payload.allow;
  })).addCase(Fb, (t, r) => {
    Uo(t, r.payload);
  }).addCase(Db, (t, r) => {
    var s;
    const { facetId: n, numberOfValues: i } = r.payload;
    Ab((s = t[n]) == null ? void 0 : s.request, i);
  }).addCase(Tb, (t, r) => {
    var o;
    const { facetId: n, isFieldExpanded: i } = r.payload, s = (o = t[n]) == null ? void 0 : o.request;
    s && (s.isFieldExpanded = i);
  }).addCase(Pe.fulfilled, (t, r) => {
    r.payload.response.facets.forEach((i) => {
      var s;
      return Ec((s = t[i.facetId]) == null ? void 0 : s.request, i);
    });
  }).addCase(rf.fulfilled, (t, r) => {
    r.payload.response.facets.forEach((i) => {
      var s;
      return Ec((s = t[i.facetId]) == null ? void 0 : s.request, i);
    });
  }).addCase(xi, (t, r) => {
    var l;
    const { facetId: n, value: i } = r.payload, s = (l = t[n]) == null ? void 0 : l.request;
    if (!s)
      return;
    const { rawValue: o } = i, { currentValues: a } = s, c = a.find((d) => d.value === o);
    if (c) {
      c.state = "selected";
      return;
    }
    const u = Rc(o);
    bn(s, u), s.freezeCurrentValues = !0, s.preventAutoSelect = !0;
  }).addCase(ki, (t, r) => {
    var l;
    const { facetId: n, value: i } = r.payload, s = (l = t[n]) == null ? void 0 : l.request;
    if (!s)
      return;
    const { rawValue: o } = i, { currentValues: a } = s, c = a.find((d) => d.value === o);
    if (c) {
      c.state = "excluded";
      return;
    }
    const u = qc(o);
    bn(s, u), s.freezeCurrentValues = !0, s.preventAutoSelect = !0;
  }).addCase(Ei, (t, r) => {
    if (!(r.payload in t))
      return;
    const { request: n } = t[r.payload];
    gr(n);
  }).addCase(Jr, (t, r) => {
    const n = r.payload;
    Object.keys(t).forEach((i) => {
      var a, c, u, l;
      const s = t[i];
      (((c = (a = s.tabs) == null ? void 0 : a.included) == null ? void 0 : c.length) || ((l = (u = s.tabs) == null ? void 0 : u.excluded) == null ? void 0 : l.length)) && !Fo(s.tabs, n) && gr(s.request);
    });
  });
});
function bn(e, t) {
  const { currentValues: r } = e, n = r.findIndex((s) => s.state === "idle"), i = n === -1 ? r.length : n;
  e.currentValues.splice(i, 0, t), n > -1 && e.currentValues.pop(), e.numberOfValues = e.currentValues.length;
}
function Ec(e, t) {
  e && (e.currentValues = t.values.map(gf), e.freezeCurrentValues = !1, e.preventAutoSelect = !1);
}
const Mb = {
  filterFacetCount: !0,
  injectionDepth: 1e3,
  numberOfValues: 8,
  sortCriteria: "automatic",
  resultsMustMatch: "atLeastOneValue"
};
function Pb(e) {
  return {
    ...Mb,
    type: "specific",
    currentValues: [],
    freezeCurrentValues: !1,
    isFieldExpanded: !1,
    preventAutoSelect: !1,
    ...e
  };
}
function gf(e) {
  const { value: t, state: r } = e;
  return { value: t, state: r };
}
function Rc(e) {
  return { value: e, state: "selected" };
}
function qc(e) {
  return { value: e, state: "excluded" };
}
function Ub(e) {
  return { ...e, state: "idle" };
}
const mf = {
  filterFacetCount: !0,
  injectionDepth: 1e3,
  numberOfValues: 8,
  sortCriteria: "ascending",
  rangeAlgorithm: "even",
  resultsMustMatch: "atLeastOneValue"
};
function yf(e, t) {
  const { request: r } = t, { facetId: n } = r;
  if (n in e)
    return;
  const i = If(r);
  r.numberOfValues = i, e[n] = t;
}
function vf(e, t, r) {
  var i;
  const n = (i = e[t]) == null ? void 0 : i.request;
  n && (n.currentValues = r, n.numberOfValues = If(n));
}
function Sf(e, t, r) {
  var o;
  const n = (o = e[t]) == null ? void 0 : o.request;
  if (!n)
    return;
  const i = ai(n.currentValues, r);
  if (!i)
    return;
  const s = i.state === "selected";
  i.previousState = i.state, i.state = s ? "idle" : "selected", n.preventAutoSelect = !0;
}
function wf(e, t, r) {
  var o;
  const n = (o = e[t]) == null ? void 0 : o.request;
  if (!n)
    return;
  const i = ai(n.currentValues, r);
  if (!i)
    return;
  const s = i.state === "excluded";
  i.previousState = i.state, i.state = s ? "idle" : "excluded", n.preventAutoSelect = !0;
}
function ft(e, t) {
  var n;
  const r = (n = e[t]) == null ? void 0 : n.request;
  r && r.currentValues.forEach((i) => {
    i.state !== "idle" && (i.previousState = i.state), i.state = "idle";
  });
}
function bf(e, t) {
  Object.entries(e).forEach(([r, { request: n }]) => {
    const i = t[r] || [];
    n.currentValues.forEach((a) => (!!ai(i, a) ? a.state = "selected" : typeof t == "object" && r in t && a.state !== "idle" && (a.previousState = a.state, a.state = "idle"), a));
    const s = i.filter((a) => !ai(n.currentValues, a)), o = n.currentValues;
    o.push(...s), n.numberOfValues = Math.max(n.numberOfValues, o.length);
  });
}
function Cf(e, t, r) {
  t.forEach((n) => {
    var a;
    const i = n.facetId, s = (a = e[i]) == null ? void 0 : a.request;
    if (!s)
      return;
    const o = r(n.values);
    s.currentValues = o, s.preventAutoSelect = !1;
  });
}
function ai(e, t) {
  const { start: r, end: n } = t;
  return e.find((i) => i.start === r && i.end === n);
}
function Cn(e, t) {
  const { start: r, end: n, endInclusive: i } = t;
  return e.find((s) => s.start === r && s.end === n && s.endInclusive === i);
}
function If(e) {
  const { generateAutomaticRanges: t, currentValues: r, numberOfValues: n } = e;
  return t ? Math.max(n, r.length) : r.length;
}
function $b(e) {
  const t = Oc(e.start, e), r = Oc(e.end, e), n = e.endInclusive ?? !1, i = e.state ?? "idle";
  return {
    start: t,
    end: r,
    endInclusive: n,
    state: i
  };
}
function Oc(e, t) {
  const { dateFormat: r } = t;
  return Jg(e) ? (Ha(e), Kg(e)) : typeof e == "string" && Tr(e) ? (Ha(e), e) : (Wg(e, r), kl(Xn(e, r)));
}
const Af = w("rangeFacet/updateSortCriterion", (e) => R(e, {
  facetId: ue,
  criterion: new Ie({ required: !0 })
})), Zr = {
  state: j,
  start: new G({ required: !0 }),
  end: new G({ required: !0 }),
  endInclusive: new ie({ required: !0 }),
  numberOfResults: new G({ required: !0, min: 0 })
}, bt = {
  start: j,
  end: j,
  endInclusive: new ie({ required: !0 }),
  state: j,
  numberOfResults: new G({ required: !0, min: 0 })
}, xf = (e) => ({
  facetId: ue,
  selection: typeof e.start == "string" ? new z({ values: bt }) : new z({ values: Zr })
}), Vb = {
  start: j,
  end: j,
  endInclusive: new ie({ required: !0 }),
  state: j
}, Lb = {
  facetId: ue,
  field: j,
  tabs: new z({
    options: {
      required: !1
    },
    values: {
      included: new ae({ each: new Q() }),
      excluded: new ae({ each: new Q() })
    }
  }),
  activeTab: new Q({ required: !1 }),
  currentValues: new ae({
    required: !1,
    each: new z({ values: Vb })
  }),
  generateAutomaticRanges: new ie({ required: !0 }),
  filterFacetCount: new ie({ required: !1 }),
  injectionDepth: new G({ required: !1, min: 0 }),
  numberOfValues: new G({ required: !1, min: 1 }),
  sortCriteria: new Ie({ required: !1 }),
  rangeAlgorithm: new Ie({ required: !1 })
};
function Fc(e) {
  return Tr(e) ? Vs(e) : e;
}
function Vo(e) {
  e.currentValues && e.currentValues.forEach((t) => {
    const { start: r, end: n } = $b(t);
    if (Xn(Fc(r)).isAfter(Xn(Fc(n))))
      throw new Error(`The start value is greater than the end value for the date range ${t.start} to ${t.end}`);
  });
}
const kf = w("dateFacet/register", (e) => {
  try {
    return ze(e, Lb), Vo(e), { payload: e, error: null };
  } catch (t) {
    return { payload: e, error: it(t) };
  }
}), Lo = w("dateFacet/toggleSelectValue", (e) => R(e, {
  facetId: ue,
  selection: new z({ values: bt })
})), Qo = w("dateFacet/toggleExcludeValue", (e) => R(e, {
  facetId: ue,
  selection: new z({ values: bt })
})), Ef = w("dateFacet/updateFacetValues", (e) => {
  try {
    return ze(e, {
      facetId: ue,
      values: new ae({
        each: new z({ values: bt })
      })
    }), Vo({ currentValues: e.values }), { payload: e, error: null };
  } catch (t) {
    return { payload: e, error: it(t) };
  }
}), Qb = Af, jb = Oi;
se(ko(), (e) => {
  e.addCase(kf, (t, r) => {
    const { payload: n } = r, { tabs: i } = n, s = Nb(n);
    yf(t, Kv(s, i));
  }).addCase(ot.fulfilled, (t, r) => {
    var n;
    return ((n = r.payload) == null ? void 0 : n.dateFacetSet) ?? t;
  }).addCase(wt, (t, r) => {
    const n = r.payload.df || {};
    bf(t, n);
  }).addCase(Lo, (t, r) => {
    const { facetId: n, selection: i } = r.payload;
    Sf(t, n, i);
  }).addCase(Qo, (t, r) => {
    const { facetId: n, selection: i } = r.payload;
    wf(t, n, i);
  }).addCase(Ef, (t, r) => {
    const { facetId: n, values: i } = r.payload;
    vf(t, n, i);
  }).addCase(jb, (t, r) => {
    ft(t, r.payload);
  }).addCase(Yr, (t) => {
    Object.keys(t).forEach((r) => {
      ft(t, r);
    });
  }).addCase(Qb, (t, r) => {
    Uo(t, r.payload);
  }).addCase(Pe.fulfilled, (t, r) => {
    const n = r.payload.response.facets;
    Cf(t, n, jo);
  }).addCase(Ei, (t, r) => {
    ft(t, r.payload);
  }).addCase(Jr, (t, r) => {
    const n = r.payload;
    Object.keys(t).forEach((i) => {
      var a, c, u, l;
      const s = t[i];
      (((c = (a = s.tabs) == null ? void 0 : a.included) == null ? void 0 : c.length) || ((l = (u = s.tabs) == null ? void 0 : u.excluded) == null ? void 0 : l.length)) && !Fo(s.tabs, n) && ft(t, i);
    });
  });
});
function Nb(e) {
  return {
    ...mf,
    currentValues: [],
    preventAutoSelect: !1,
    type: "dateRange",
    ...e
  };
}
function jo(e) {
  return e.map((t) => {
    const { numberOfResults: r, ...n } = t;
    return n;
  });
}
const zb = {
  state: j,
  start: new G({ required: !0 }),
  end: new G({ required: !0 }),
  endInclusive: new ie({ required: !0 })
}, Bb = {
  facetId: ue,
  field: j,
  tabs: new z({
    options: {
      required: !1
    },
    values: {
      included: new ae({ each: new Q() }),
      excluded: new ae({ each: new Q() })
    }
  }),
  activeTab: new Q({ required: !1 }),
  currentValues: new ae({
    required: !1,
    each: new z({ values: zb })
  }),
  generateAutomaticRanges: new ie({ required: !0 }),
  filterFacetCount: new ie({ required: !1 }),
  injectionDepth: new G({ required: !1, min: 0 }),
  numberOfValues: new G({ required: !1, min: 1 }),
  sortCriteria: new Ie({ required: !1 }),
  rangeAlgorithm: new Ie({ required: !1 })
};
function No(e) {
  e.currentValues && e.currentValues.forEach(({ start: t, end: r }) => {
    if (t > r)
      throw new Error(`The start value is greater than the end value for the numeric range ${t} to ${r}`);
  });
}
const Rf = w("numericFacet/register", (e) => {
  try {
    return R(e, Bb), No(e), { payload: e, error: null };
  } catch (t) {
    return { payload: e, error: it(t) };
  }
}), zo = w("numericFacet/toggleSelectValue", (e) => R(e, {
  facetId: ue,
  selection: new z({ values: Zr })
})), Bo = w("numericFacet/toggleExcludeValue", (e) => R(e, {
  facetId: ue,
  selection: new z({ values: Zr })
})), qf = w("numericFacet/updateFacetValues", (e) => {
  try {
    return ze(e, {
      facetId: ue,
      values: new ae({
        each: new z({ values: Zr })
      })
    }), No({ currentValues: e.values }), { payload: e, error: null };
  } catch (t) {
    return { payload: e, error: it(t) };
  }
}), Hb = Af, Yb = Oi;
se(Eo(), (e) => {
  e.addCase(Rf, (t, r) => {
    const { payload: n } = r, { tabs: i } = n, s = Wb(n);
    yf(t, Jv(s, i));
  }).addCase(ot.fulfilled, (t, r) => {
    var n;
    return ((n = r.payload) == null ? void 0 : n.numericFacetSet) ?? t;
  }).addCase(wt, (t, r) => {
    const n = r.payload.nf || {};
    bf(t, n);
  }).addCase(zo, (t, r) => {
    const { facetId: n, selection: i } = r.payload;
    Sf(t, n, i);
  }).addCase(Bo, (t, r) => {
    const { facetId: n, selection: i } = r.payload;
    wf(t, n, i);
  }).addCase(qf, (t, r) => {
    const { facetId: n, values: i } = r.payload;
    vf(t, n, i);
  }).addCase(Yb, (t, r) => {
    ft(t, r.payload);
  }).addCase(Yr, (t) => {
    Object.keys(t).forEach((r) => {
      ft(t, r);
    });
  }).addCase(Hb, (t, r) => {
    Uo(t, r.payload);
  }).addCase(Pe.fulfilled, (t, r) => {
    const n = r.payload.response.facets;
    Cf(t, n, Of);
  }).addCase(Ei, (t, r) => {
    ft(t, r.payload);
  }).addCase(Jr, (t, r) => {
    const n = r.payload;
    Object.keys(t).forEach((i) => {
      var a, c, u, l;
      const s = t[i];
      (((c = (a = s.tabs) == null ? void 0 : a.included) == null ? void 0 : c.length) || ((l = (u = s.tabs) == null ? void 0 : u.excluded) == null ? void 0 : l.length)) && !Fo(s.tabs, n) && ft(t, i);
    });
  });
});
function Wb(e) {
  return {
    ...mf,
    currentValues: [],
    preventAutoSelect: !1,
    type: "numericalRange",
    ...e
  };
}
function Of(e) {
  return e.map((t) => {
    const { numberOfResults: r, ...n } = t;
    return n;
  });
}
const Gb = {
  state: new Ie({ required: !0 }),
  numberOfResults: new G({ required: !0, min: 0 }),
  value: new Q({ required: !0, emptyAllowed: !0 }),
  path: new ae({ required: !0, each: j }),
  moreValuesAvailable: new ie({ required: !1 })
};
function Ho(e) {
  e.children.forEach((t) => {
    Ho(t);
  }), ze({
    state: e.state,
    numberOfResults: e.numberOfResults,
    value: e.value,
    path: e.path,
    moreValuesAvailable: e.moreValuesAvailable
  }, Gb);
}
const Kb = w("commerce/facets/categoryFacet/updateNumberOfValues", (e) => R(e, {
  facetId: j,
  numberOfValues: new G({ required: !1, min: 1 })
})), Yo = w("commerce/facets/categoryFacet/toggleSelectValue", (e) => {
  try {
    return ze(e.facetId, j), Ho(e.selection), { payload: e, error: null };
  } catch (t) {
    return { payload: e, error: it(t) };
  }
}), Wo = w("commerce/facets/dateFacet/toggleSelectValue", (e) => R(e, {
  facetId: j,
  selection: new z({ values: bt })
})), Go = w("commerce/facets/dateFacet/toggleExcludeValue", (e) => R(e, {
  facetId: j,
  selection: new z({ values: bt })
})), Jb = w("commerce/facets/dateFacet/updateValues", (e) => {
  try {
    return ze(e, {
      facetId: j,
      values: new ae({
        each: new z({ values: bt })
      })
    }), Vo({ currentValues: e.values }), { payload: e, error: null };
  } catch (t) {
    return { payload: e, error: it(t) };
  }
}), Ko = w("commerce/facets/locationFacet/toggleSelectValue", (e) => R(e, {
  facetId: j,
  selection: new z({ values: lr })
})), Fi = w("commerce/facets/numericFacet/toggleSelectValue", (e) => R(e, {
  facetId: j,
  selection: new z({
    values: Ti
  })
})), Di = w("commerce/facets/numericFacet/toggleExcludeValue", (e) => R(e, {
  facetId: j,
  selection: new z({
    values: Ti
  })
})), Zb = w("commerce/facets/numericFacet/updateValues", (e) => {
  try {
    return ze(e, {
      facetId: j,
      values: new ae({
        each: new z({ values: Ti })
      })
    }), No({ currentValues: e.values }), { payload: e, error: null };
  } catch (t) {
    return { payload: e, error: it(t) };
  }
}), Jo = w("commerce/facets/numericFacet/updateManualRange", (e) => ze(e, {
  facetId: j,
  ...Ti
})), Ti = {
  state: new Q({
    required: !0,
    constrainTo: ["idle", "selected", "excluded"]
  }),
  start: new G({ required: !0 }),
  end: new G({ required: !0 }),
  endInclusive: new ie({ required: !0 })
}, Zo = w("commerce/facets/regularFacet/toggleExcludeValue", (e) => R(e, {
  facetId: j,
  selection: new z({ values: lr })
})), Xo = w("commerce/facets/regularFacet/toggleSelectValue", (e) => R(e, {
  facetId: j,
  selection: new z({ values: lr })
}));
function Dc(e, t) {
  for (const r of Object.keys(e))
    delete e[r];
  t.payload.f && Tc(e, t.payload.f, "regular"), t.payload.lf && Tc(e, t.payload.lf, "location"), t.payload.nf && _c(e, t.payload.nf, "numericalRange"), t.payload.mnf && Xb(e, t.payload.mnf), t.payload.df && _c(e, t.payload.df, "dateRange"), t.payload.cf && eC(e, t.payload.cf);
}
function Tc(e, t, r) {
  const n = Object.entries(t);
  for (const [i, s] of n)
    e[i] = {
      request: {
        ..._i(i),
        type: r,
        values: s.map((o) => {
          const a = {
            ...ea(),
            value: o
          };
          switch (r) {
            case "regular":
              return a;
            case "location":
              return a;
          }
        })
      }
    };
}
function _c(e, t, r) {
  const n = Object.entries(t);
  for (const [i, s] of n)
    e[i] = {
      request: {
        ..._i(i),
        type: r,
        values: s.map((o) => {
          const a = {
            start: o.start,
            end: o.end,
            endInclusive: o.endInclusive,
            ...ea()
          };
          switch (r) {
            case "dateRange":
              return a;
            case "numericalRange":
              return a;
          }
        })
      }
    };
}
function Xb(e, t) {
  const r = Object.entries(t);
  for (const [n, i] of r)
    e[n] = {
      request: {
        ..._i(n),
        type: "numericalRange",
        interval: "continuous",
        values: i.map((s) => ({
          start: s.start,
          end: s.end,
          endInclusive: s.endInclusive,
          ...ea()
        }))
      }
    };
}
function eC(e, t) {
  const r = Object.entries(t);
  for (const [n, i] of r)
    e[n] = {
      request: {
        ..._i(n),
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
    }, Ff(e[n].request, i);
}
function _i(e) {
  return {
    facetId: e,
    field: e,
    isFieldExpanded: !1,
    preventAutoSelect: !1
  };
}
function ea() {
  return {
    state: "selected",
    isAutoSelected: !1,
    isSuggested: !1,
    moreValuesAvailable: !0
  };
}
function tC(e) {
  return { state: "selected", value: e };
}
function Ff(e, t, r) {
  e.values = rC(t), e.numberOfValues = r, e.preventAutoSelect = !0;
}
function rC(e) {
  if (!e.length)
    return [];
  const t = ci(e[0]);
  let r = t;
  const [n, ...i] = e;
  for (const s of i) {
    const o = ci(s);
    r.children.push(o), r = o;
  }
  return r.state = "selected", [t];
}
function ci(e) {
  return {
    children: [],
    state: "idle",
    value: e
  };
}
function nC() {
  return {};
}
se(nC(), (e) => {
  e.addCase(Me.fulfilled, Mc).addCase(Re.fulfilled, Mc).addCase(qt.fulfilled, (t, r) => Pc(t, _t(r.payload.facetId))).addCase(Rt.fulfilled, (t, r) => {
    if (r.payload.fieldSuggestionsFacets)
      for (const { facetId: n } of r.payload.fieldSuggestionsFacets)
        Pc(t, _t(n));
  }).addCase(Xo, (t, r) => {
    var a;
    const { facetId: n, selection: i } = r.payload, s = (a = t[n]) == null ? void 0 : a.request;
    if (!s || !In(s))
      return;
    s.preventAutoSelect = !0;
    const o = s.values.find((c) => c.value === i.value);
    if (!o) {
      He(s, i);
      return;
    }
    Be(o, "select"), s.freezeCurrentValues = !0;
  }).addCase(Ko, (t, r) => {
    var a;
    const { facetId: n, selection: i } = r.payload, s = (a = t[n]) == null ? void 0 : a.request;
    if (!s || !iC(s))
      return;
    const o = s.values.find((c) => c.value === i.value);
    if (!o) {
      He(s, i);
      return;
    }
    Be(o, "select");
  }).addCase(Fi, (t, r) => {
    var a;
    const { facetId: n, selection: i } = r.payload, s = (a = t[n]) == null ? void 0 : a.request;
    if (!s || !as(s))
      return;
    s.preventAutoSelect = !0;
    const o = Cn(s.values, i);
    if (!o) {
      He(s, i);
      return;
    }
    if (Be(o, "select"), s.numberOfValues = s.initialNumberOfValues, s.interval === "continuous" && o.state === "idle") {
      s.values = [];
      return;
    }
  }).addCase(Wo, (t, r) => {
    var a;
    const { facetId: n, selection: i } = r.payload, s = (a = t[n]) == null ? void 0 : a.request;
    if (!s || !cs(s))
      return;
    s.preventAutoSelect = !0;
    const o = Cn(s.values, i);
    if (!o) {
      He(s, i);
      return;
    }
    Be(o, "select");
  }).addCase(Yo, (t, r) => {
    var l;
    const { facetId: n, selection: i } = r.payload, s = (l = t[n]) == null ? void 0 : l.request;
    if (!Ln(s))
      return;
    const { path: o } = i, a = o.slice(0, o.length - 1), c = sC(s, a);
    let u = c.find((d) => d.value === i.value);
    u || (u = ci(i.value), c.push(u)), u.state = u.state === "idle" ? "selected" : "idle", u.state === "selected" && (s.numberOfValues = s.initialNumberOfValues, s.retrieveCount = s.initialNumberOfValues);
  }).addCase(Zo, (t, r) => {
    var a;
    const { facetId: n, selection: i } = r.payload, s = (a = t[n]) == null ? void 0 : a.request;
    if (!s || !In(s))
      return;
    s.preventAutoSelect = !0;
    const o = s.values.find((c) => c.value === i.value);
    if (!o) {
      He(s, i);
      return;
    }
    Be(o, "exclude"), s.freezeCurrentValues = !0;
  }).addCase(Di, (t, r) => {
    var a;
    const { facetId: n, selection: i } = r.payload, s = (a = t[n]) == null ? void 0 : a.request;
    if (!s || !as(s))
      return;
    s.preventAutoSelect = !0;
    const o = Cn(s.values, i);
    if (!o) {
      He(s, i);
      return;
    }
    if (Be(o, "exclude"), s.numberOfValues = s.initialNumberOfValues, s.interval === "continuous" && o.state === "idle") {
      s.values = [];
      return;
    }
  }).addCase(Go, (t, r) => {
    var a;
    const { facetId: n, selection: i } = r.payload, s = (a = t[n]) == null ? void 0 : a.request;
    if (!s || !cs(s))
      return;
    s.preventAutoSelect = !0;
    const o = Cn(s.values, i);
    if (!o) {
      He(s, i);
      return;
    }
    Be(o, "exclude"), s.numberOfValues = s.initialNumberOfValues;
  }).addCase(Kb, (t, r) => {
    var o;
    const { facetId: n, numberOfValues: i } = r.payload, s = (o = t[n]) == null ? void 0 : o.request;
    Ln(s) && lC(s, i);
  }).addCase(xi, (t, r) => {
    var c;
    const { facetId: n, value: i } = r.payload, s = (c = t[n]) == null ? void 0 : c.request;
    if (!s || !In(s))
      return;
    const { rawValue: o } = i;
    s.freezeCurrentValues = !0, s.preventAutoSelect = !0;
    const a = s.values.find((u) => u.value === o);
    if (!a) {
      He(s, tC(o));
      return;
    }
    Be(a, "select");
  }).addCase(ki, (t, r) => {
    var c;
    const { facetId: n, value: i } = r.payload, s = (c = t[n]) == null ? void 0 : c.request;
    if (!s || !In(s))
      return;
    const { rawValue: o } = i;
    s.freezeCurrentValues = !0, s.preventAutoSelect = !0;
    const a = s.values.find((u) => u.value === o);
    if (!a) {
      He(s, { state: "excluded", value: o });
      return;
    }
    Be(a, "exclude");
  }).addCase(Co, (t, r) => {
    var a;
    const { facetId: n, value: i } = r.payload, s = (a = t[n]) == null ? void 0 : a.request;
    if (!Ln(s))
      return;
    const o = [...i.path, i.rawValue];
    Ff(s, o, s.initialNumberOfValues);
  }).addCase(Zb, (t, r) => {
    var o;
    const { facetId: n, values: i } = r.payload, s = (o = t[n]) == null ? void 0 : o.request;
    !s || !as(s) || (s.values = i, s.numberOfValues = i.length);
  }).addCase(Jb, (t, r) => {
    var o;
    const { facetId: n, values: i } = r.payload, s = (o = t[n]) == null ? void 0 : o.request;
    !s || !cs(s) || (s.values = jo(i), s.numberOfValues = i.length);
  }).addCase(Lm, (t, r) => {
    var o;
    const { facetId: n, numberOfValues: i } = r.payload, s = (o = t[n]) == null ? void 0 : o.request;
    s && (s.numberOfValues = i);
  }).addCase(Qm, (t, r) => {
    var o;
    const { facetId: n, isFieldExpanded: i } = r.payload, s = (o = t[n]) == null ? void 0 : o.request;
    s && (s.isFieldExpanded = i);
  }).addCase(Nl, (t, r) => Object.values(t).forEach((n) => {
    n.request.preventAutoSelect = !r.payload.allow;
  })).addCase(jm, (t, r) => {
    var o;
    const { facetId: n, freezeCurrentValues: i } = r.payload, s = (o = t[n]) == null ? void 0 : o.request;
    s && (s.freezeCurrentValues = i);
  }).addCase(Si, (t, r) => {
    var s;
    const { facetId: n } = r.payload, i = (s = t[n]) == null ? void 0 : s.request;
    i && Ks(i);
  }).addCase(Jo, (t, r) => {
    var s;
    const { facetId: n } = r.payload, i = (s = t[n]) == null ? void 0 : s.request;
    i && Ks(i);
  }).addCase(vi, uC).addCase(So, us).addCase(Ut, us).addCase(st, us).addCase(vt, Dc).addCase(or, Dc);
});
function In(e) {
  return e.type === "regular";
}
function iC(e) {
  return e.type === "location";
}
function as(e) {
  return e.type === "numericalRange";
}
function cs(e) {
  return e.type === "dateRange";
}
function Ln(e) {
  return (e == null ? void 0 : e.type) === "hierarchical";
}
function Mc(e, t) {
  const r = new Set(Object.keys(e)), n = t.payload.response.facets;
  for (const i of n)
    oC(e, i, r);
  for (const i of r)
    delete e[i];
}
function Pc(e, t) {
  var n;
  let r = (n = e[t]) == null ? void 0 : n.request;
  r || (e[t] = { request: {} }, r = e[t].request, r.initialNumberOfValues = 10, r.values = []);
}
function Ks(e) {
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
function sC(e, t) {
  let r = e.values;
  for (const n of t) {
    let i = r[0];
    (!i || n !== i.value) && (i = ci(n), r.length = 0, r.push(i)), i.state = "idle", r = i.children;
  }
  return r;
}
function Be(e, t) {
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
function oC(e, t, r) {
  var s;
  const n = t.facetId ?? t.field;
  let i = (s = e[n]) == null ? void 0 : s.request;
  i ? r.delete(n) : (e[n] = { request: {} }, i = e[n].request), i.initialNumberOfValues === void 0 && (i.initialNumberOfValues = t.numberOfValues), i.facetId = n, i.displayName = t.displayName, i.numberOfValues = t.numberOfValues, i.field = t.field, i.type = t.type, i.values = aC(t) ?? [], i.freezeCurrentValues = !1, i.preventAutoSelect = !1, t.type === "hierarchical" && Ln(i) ? i.delimitingCharacter = t.delimitingCharacter : t.type === "numericalRange" && (i.interval = t.interval, t.domain && (i.domain = {
    min: t.domain.min,
    max: t.domain.max,
    increment: t.domain.increment
  }));
}
function aC(e) {
  switch (e.type) {
    case "numericalRange":
      return Of(e.values);
    case "dateRange":
      return jo(e.values);
    case "hierarchical":
      return e.values.map(Df);
    case "regular":
      return e.values.map(gf);
    case "location":
      return e.values.map(cC);
    default:
      return;
  }
}
function Df(e) {
  const t = e.children.map(Df), { state: r, value: n } = e;
  return {
    children: t,
    state: r,
    value: n
  };
}
function cC(e) {
  const { value: t, state: r } = e;
  return { value: t, state: r };
}
function He(e, t) {
  const { values: r } = e, n = r.findIndex((s) => s.state === "idle"), i = n === -1 ? r.length : n;
  e.values.splice(i, 0, t), n > -1 && e.values.pop(), e.numberOfValues = e.values.length;
}
function uC(e) {
  Object.values(e).forEach((t) => Ks(t.request));
}
function us(e) {
  Object.values(e).forEach((t) => {
    t.request.values = [];
  });
}
function lC(e, t) {
  e.numberOfValues = t, e.retrieveCount = t;
}
function dC() {
  return [];
}
se(dC(), (e) => {
  e.addCase(Rt.fulfilled, (t, r) => r.payload.fieldSuggestionsFacets ?? []);
});
function fC() {
  return {};
}
se(fC(), (e) => e.addCase(Jo, (t, r) => {
  const { facetId: n, ...i } = r.payload;
  t[n] = { manualRange: i };
}).addCase(Di, (t, r) => {
  An(t, r.payload.facetId);
}).addCase(Fi, (t, r) => {
  An(t, r.payload.facetId);
}).addCase(Si, (t, r) => {
  An(t, r.payload.facetId);
}).addCase(vt, (t, r) => {
  Uc(t, r.payload.mnf);
}).addCase(or, (t, r) => {
  Uc(t, r.payload.mnf);
}).addCase(vi, (t) => {
  for (const r of Object.keys(t))
    An(t, r);
}));
const An = (e, t) => {
  e[t] && (e[t] = { manualRange: void 0 });
}, Uc = (e, t) => {
  for (const r of Object.keys(e))
    delete e[r];
  t && Object.entries(t).forEach(([r, n]) => {
    const i = n[0];
    e[r] = { manualRange: i };
  });
}, Tf = {
  slotId: j,
  productId: new Q({ required: !1, emptyAllowed: !1 })
}, _f = (e, t) => {
  var r;
  return e.recommendations && ((r = e.recommendations[t]) == null ? void 0 : r.products.length) || 0;
}, hC = fe((e, t) => ({
  total: zp(e, t),
  current: _f(e, t)
}), ({ current: e, total: t }) => e < t), Mf = (e, t, r, n) => {
  const i = jl(t, r, e);
  return {
    ...i,
    context: {
      ...i.context,
      ...n ? { product: { productId: n } } : {},
      purchased: Em(t.cart)
    },
    slotId: e
  };
}, Qn = ne("commerce/recommendations/fetch", async (e, { getState: t, rejectWithValue: r, extra: { apiClient: n, navigatorContext: i } }) => {
  const { slotId: s, productId: o } = e, a = Mf(s, t(), i, o), c = await n.getRecommendations(a);
  return je(c) ? r(c.error) : {
    response: c.success
  };
}), ls = ne("commerce/recommendations/fetchMore", async (e, { getState: t, rejectWithValue: r, extra: { apiClient: n, navigatorContext: i } }) => {
  const s = e.slotId, o = t();
  if (hC(o, s))
    return null;
  const c = Np(o, s), l = _f(o, s) / c, d = {
    ...Mf(s, o, i),
    page: l
  }, p = await n.getRecommendations(d);
  return je(p) ? r(p.error) : {
    response: p.success
  };
}), pC = w("commerce/recommendations/registerSlot", (e) => R(e, Tf)), gC = {
  child: new z({
    options: { required: !0 },
    values: {
      permanentid: new Q({ required: !0 })
    }
  }),
  ...Tf
}, mC = w("commerce/recommendations/promoteChildToParent", (e) => R(e, gC)), ta = w("commerce/sort/apply", (e) => R(e, {
  by: new Er({
    enum: Qe,
    required: !0
  })
}));
se(bg(), (e) => {
  e.addCase(Bl, (t, r) => {
    var i;
    const n = xn(t, (i = r.payload) == null ? void 0 : i.slotId);
    n && n.page < n.totalPages - 1 && ++n.page;
  }).addCase(Hl, (t, r) => {
    var i;
    const n = xn(t, (i = r.payload) == null ? void 0 : i.slotId);
    n && n.page > 0 && --n.page;
  }).addCase(wo, (t, r) => {
    const n = xn(t, r.payload.slotId);
    n && r.payload.page >= 0 && r.payload.page < n.totalPages && (n.page = r.payload.page);
  }).addCase(zl, (t, r) => {
    const n = xn(t, r.payload.slotId);
    n && (n.page = 0, n.perPage = r.payload.pageSize);
  }).addCase(Me.fulfilled, (t, r) => {
    t.principal = r.payload.response.pagination;
  }).addCase(Re.fulfilled, (t, r) => {
    t.principal = r.payload.response.pagination;
  }).addCase(Qn.fulfilled, (t, r) => {
    t.recommendations[r.meta.arg.slotId] = r.payload.response.pagination;
  }).addCase(Bm, (t, r) => {
    const n = r.payload.slotId;
    n in t.recommendations || (t.recommendations[n] = gi());
  }).addCase(vi, Fe).addCase(Si, Fe).addCase(Xo, Fe).addCase(Zo, Fe).addCase(Ko, Fe).addCase(Fi, Fe).addCase(Di, Fe).addCase(Wo, Fe).addCase(Go, Fe).addCase(Yo, Fe).addCase(ta, Fe).addCase(Ut, Fe).addCase(st, Fe).addCase(vt, $c).addCase(or, $c);
});
function xn(e, t) {
  return t ? e.recommendations[t] : e.principal;
}
function Fe(e) {
  e.principal.page = gi().page;
}
function $c(e, t) {
  t.payload.page ? e.principal.page = t.payload.page : e.principal.page = gi().page, t.payload.perPage && (e.principal.perPage = t.payload.perPage);
}
const Xr = w("app/setError"), ds = () => ({
  error: null,
  isLoading: !1,
  requestId: "",
  responseId: "",
  facets: [],
  products: [],
  results: []
});
se(ds(), (e) => {
  e.addCase(Me.rejected, (t, r) => {
    fs(t, r.payload);
  }).addCase(Ji.rejected, (t, r) => {
    fs(t, r.payload);
  }).addCase(Me.fulfilled, (t, r) => {
    const n = Qc(r.payload);
    Vc(t, r.payload.response), t.products = jc(r.payload.response.products, n, r.payload.response.responseId), t.results = Nc(r.payload.response.results, n, r.payload.response.responseId);
  }).addCase(Ji.fulfilled, (t, r) => {
    if (!r.payload)
      return;
    const n = Qc(r.payload);
    Vc(t, r.payload.response), t.products = t.products.concat(jc(r.payload.response.products, n, r.payload.response.responseId)), t.results = t.results.concat(Nc(r.payload.response.results, n, r.payload.response.responseId));
  }).addCase(Me.pending, (t, r) => {
    Lc(t, r.meta.requestId);
  }).addCase(Ji.pending, (t, r) => {
    Lc(t, r.meta.requestId);
  }).addCase(Km, (t, r) => {
    const n = t.results.length > 0 ? t.results : t.products;
    let i;
    const s = n.findIndex((p) => p.resultType === _e.SPOTLIGHT ? !1 : (i = p.children.find((g) => g.permanentid === r.payload.child.permanentid), !!i)), o = n[s];
    if (s === -1 || i === void 0 || o.resultType === _e.SPOTLIGHT)
      return;
    const a = o.responseId, c = o.position, { children: u, totalNumberOfChildren: l } = o, d = {
      ...i,
      resultType: _e.PRODUCT,
      children: u,
      totalNumberOfChildren: l,
      position: c,
      responseId: a
    };
    n.splice(s, 1, d);
  }).addCase(st, () => ds()).addCase(Ut, () => ds()).addCase(Xr, (t, r) => {
    fs(t, r.payload);
  });
});
function fs(e, t) {
  e.error = t || null, e.isLoading = !1;
}
function Vc(e, t) {
  e.error = null, e.facets = t.facets, e.responseId = t.responseId, e.isLoading = !1;
}
function Lc(e, t) {
  e.isLoading = !0, e.requestId = t;
}
function Qc(e) {
  const t = e.response.pagination;
  return t.page * t.perPage;
}
function jc(e, t, r) {
  return e.map((n, i) => Pf(n, t + i + 1, r));
}
function Nc(e, t, r) {
  return e.map((n, i) => yC(n, t + i + 1, r));
}
function yC(e, t, r) {
  return e.resultType === _e.SPOTLIGHT ? vC(e, t, r) : Pf(e, t, r);
}
function Pf(e, t, r) {
  const n = e.children.some((a) => a.permanentid === e.permanentid);
  if (e.children.length === 0 || n)
    return { ...e, position: t, responseId: r };
  const { children: i, totalNumberOfChildren: s, ...o } = e;
  return {
    ...e,
    children: [o, ...i],
    position: t,
    responseId: r
  };
}
function vC(e, t, r) {
  return {
    ...e,
    position: t,
    responseId: r
  };
}
se(Cg(), (e) => {
  e.addCase(bi, (t, r) => ({
    ...t,
    ...r.payload
  })).addCase(vt, (t, r) => {
    t.query = r.payload.q ?? "";
  }).addCase(Md, (t, r) => {
    t.query = r.payload.expression;
  });
});
const SC = () => ({}), wC = () => ({
  headline: "",
  error: null,
  isLoading: !1,
  responseId: "",
  products: [],
  productId: void 0
});
se(SC(), (e) => {
  e.addCase(pC, (t, r) => {
    const n = r.payload.slotId, i = r.payload.productId;
    if (!(n in t)) {
      if (!i) {
        t[n] = zc();
        return;
      }
      t[n] = zc({ productId: i });
    }
  }).addCase(Qn.rejected, (t, r) => {
    hs(t, r.meta.arg.slotId, r.payload);
  }).addCase(ls.rejected, (t, r) => {
    hs(t, r.meta.arg.slotId, r.payload);
  }).addCase(Qn.fulfilled, (t, r) => {
    const n = r.meta.arg.slotId, i = r.payload.response;
    Bc(t, n, i);
    const s = t[n];
    if (!s)
      return;
    const o = Yc(r.payload);
    s.products = i.products.map((a, c) => Wc(a, o + c + 1, i.responseId));
  }).addCase(ls.fulfilled, (t, r) => {
    if (!r.payload)
      return;
    const n = r.meta.arg.slotId, i = r.payload.response;
    Bc(t, n, i);
    const s = t[n];
    if (!s)
      return;
    const o = Yc(r.payload);
    s.products = s.products.concat(i.products.map((a, c) => Wc(a, o + c + 1, i.responseId)));
  }).addCase(Qn.pending, (t, r) => {
    Hc(t, r.meta.arg.slotId);
  }).addCase(ls.pending, (t, r) => {
    Hc(t, r.meta.arg.slotId);
  }).addCase(mC, (t, r) => {
    const n = t[r.payload.slotId];
    if (!n)
      return;
    const { products: i } = n;
    let s;
    const o = i.findIndex((p) => (s = p.children.find((g) => g.permanentid === r.payload.child.permanentid), !!s));
    if (o === -1 || s === void 0)
      return;
    const a = i[o].responseId, c = i[o].position, { children: u, totalNumberOfChildren: l } = i[o], d = {
      ...s,
      resultType: _e.PRODUCT,
      children: u,
      totalNumberOfChildren: l,
      position: c,
      responseId: a
    };
    i.splice(o, 1, d);
  }).addCase(Xr, (t, r) => {
    Object.keys(t).forEach((n) => {
      hs(t, n, r.payload);
    });
  });
});
function zc(e) {
  return {
    ...wC(),
    ...e
  };
}
function hs(e, t, r) {
  const n = e[t];
  n && (n.error = r ?? null, n.isLoading = !1);
}
function Bc(e, t, r) {
  const n = e[t];
  n && (n.error = null, n.headline = r.headline, n.responseId = r.responseId, n.isLoading = !1);
}
function Hc(e, t) {
  const r = e[t];
  r && (r.isLoading = !0);
}
function Yc(e) {
  const t = e.response.pagination;
  return t.page * t.perPage;
}
function Wc(e, t, r) {
  const n = e.children.some((a) => a.permanentid === e.permanentid);
  if (e.children.length === 0 || n)
    return { ...e, position: t, responseId: r };
  const { children: i, totalNumberOfChildren: s, ...o } = e;
  return {
    ...e,
    children: [o, ...i],
    position: t,
    responseId: r
  };
}
const ps = () => ({
  error: null,
  isLoading: !1,
  requestId: "",
  responseId: "",
  products: [],
  results: [],
  facets: [],
  queryExecuted: ""
});
se(ps(), (e) => {
  e.addCase(Re.rejected, (t, r) => {
    Gc(t, r.payload);
  }).addCase(Gi.rejected, (t, r) => {
    Gc(t, r.payload);
  }).addCase(Re.fulfilled, (t, r) => {
    const n = Zc(r.payload);
    Jc(t, r.payload.response, r.payload.queryExecuted), t.products = r.payload.response.products.map((i, s) => Js(i, n + s + 1, r.payload.response.responseId)), t.results = Xc(r.payload.response.results, n, r.payload.response.responseId);
  }).addCase(Gi.fulfilled, (t, r) => {
    if (!r.payload)
      return;
    const n = Zc(r.payload);
    Jc(t, r.payload.response, r.payload.queryExecuted), t.products = t.products.concat(r.payload.response.products.map((i, s) => {
      var o;
      return Js(i, n + s + 1, (o = r.payload) == null ? void 0 : o.response.responseId);
    })), t.results = t.results.concat(Xc(r.payload.response.results, n, r.payload.response.responseId));
  }).addCase(Re.pending, (t, r) => {
    Kc(t, r.meta.requestId);
  }).addCase(Gi.pending, (t, r) => {
    Kc(t, r.meta.requestId);
  }).addCase(Ym, (t, r) => {
    const n = t.results.length > 0 ? t.results : t.products;
    let i;
    const s = n.findIndex((p) => p.resultType === _e.SPOTLIGHT ? !1 : (i = p.children.find((g) => g.permanentid === r.payload.child.permanentid), !!i)), o = n[s];
    if (s === -1 || i === void 0 || o.resultType === _e.SPOTLIGHT)
      return;
    const a = o.responseId, c = o.position, { children: u, totalNumberOfChildren: l } = o, d = {
      ...i,
      resultType: _e.PRODUCT,
      children: u,
      totalNumberOfChildren: l,
      position: c,
      responseId: a
    };
    n.splice(s, 1, d);
  }).addCase(st, () => ps()).addCase(Ut, () => ps()).addCase(Xr, (t, r) => {
    t.error = r.payload, t.isLoading = !1;
  });
});
function Gc(e, t) {
  e.error = t || null, e.isLoading = !1;
}
function Kc(e, t) {
  e.isLoading = !0, e.requestId = t;
}
function Jc(e, t, r) {
  e.error = null, e.facets = t.facets, e.responseId = t.responseId, e.isLoading = !1, e.queryExecuted = r ?? "";
}
function Zc(e) {
  const t = e.response.pagination;
  return t.page * t.perPage;
}
function Js(e, t, r) {
  const n = e.children.some((a) => a.permanentid === e.permanentid);
  if (e.children.length === 0 || n)
    return { ...e, position: t, responseId: r };
  const { children: i, totalNumberOfChildren: s, ...o } = e;
  return {
    ...e,
    children: [o, ...i],
    position: t,
    responseId: r
  };
}
function Xc(e, t, r) {
  return e.map((n, i) => bC(n, t + i + 1, r));
}
function bC(e, t, r) {
  return e.resultType === _e.SPOTLIGHT ? CC(e, t, r) : Js(e, t, r);
}
function CC(e, t, r) {
  return {
    ...e,
    position: t,
    responseId: r
  };
}
se(Fn(), (e) => {
  e.addCase(ta, (t, r) => {
    t.appliedSort = r.payload;
  }).addCase(Me.fulfilled, eu).addCase(Re.fulfilled, eu).addCase(Ut, Fn).addCase(st, Fn).addCase(vt, ru).addCase(or, ru);
});
function eu(e, t) {
  const r = t.payload.response;
  e.appliedSort = tu(r.sort.appliedSort), e.availableSorts = r.sort.availableSorts.map(tu);
}
const tu = (e) => e.sortCriteria === Qe.Relevance ? $s() : {
  by: Qe.Fields,
  fields: (e.fields || []).map(({ field: t, direction: r, displayName: n }) => ({
    name: t,
    direction: r,
    displayName: n
  }))
};
function ru(e, t) {
  if (t.payload.sortCriteria) {
    e.appliedSort = t.payload.sortCriteria;
    return;
  }
  e.appliedSort = Fn().appliedSort;
}
function nu(e) {
  return e.query = "", e.queryModification = {
    originalQuery: "",
    newQuery: "",
    queryToIgnore: e.queryModification.queryToIgnore
  }, e;
}
function iu(e, t) {
  const r = [], n = [], i = [], s = [];
  return t.forEach((o) => {
    switch (o.type) {
      case "redirect":
        r.push(o.content);
        break;
      case "query":
        n.push(o.content);
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
  }), e.redirectTo = r[0] ?? "", e.query = e.queryModification.newQuery, e.executions = i, e.notifications = s, e;
}
function IC(e, t) {
  return e.queryModification = { ...t, queryToIgnore: "" }, e;
}
function AC(e, t) {
  return e.queryModification.queryToIgnore = t, e;
}
const xC = () => ({
  redirectTo: "",
  query: "",
  executions: [],
  notifications: [],
  queryModification: { originalQuery: "", newQuery: "", queryToIgnore: "" }
});
se(xC(), (e) => e.addCase(Re.pending, nu).addCase(Re.fulfilled, (t, r) => iu(t, r.payload.response.triggers)).addCase(Me.pending, nu).addCase(Me.fulfilled, (t, r) => iu(t, r.payload.response.triggers)).addCase(Wl, (t, r) => IC(t, r.payload)).addCase(Yl, (t, r) => AC(t, r.payload.q)));
se(yo, (e) => e);
var kC = class extends Error {
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
    H(this, "issues");
    this.name = "SchemaError", this.issues = t;
  }
}, rt = "uninitialized", Zs = "pending", wr = "fulfilled", br = "rejected";
function su(e) {
  return {
    status: e,
    isUninitialized: e === rt,
    isLoading: e === Zs,
    isSuccess: e === wr,
    isError: e === br
  };
}
var ou = Gt;
function Uf(e, t) {
  if (e === t || !(ou(e) && ou(t) || Array.isArray(e) && Array.isArray(t)))
    return t;
  const r = Object.keys(t), n = Object.keys(e);
  let i = r.length === n.length;
  const s = Array.isArray(t) ? [] : {};
  for (const o of r)
    s[o] = Uf(e[o], t[o]), i && (i = e[o] === s[o]);
  return i ? e : s;
}
function Xs(e, t, r) {
  return e.reduce((n, i, s) => (t(i, s) && n.push(r(i, s)), n), []).flat();
}
function EC(e) {
  return new RegExp("(^|:)//").test(e);
}
function RC() {
  return typeof document > "u" ? !0 : document.visibilityState !== "hidden";
}
function ra(e) {
  return e != null;
}
function au(e) {
  return [...(e == null ? void 0 : e.values()) ?? []].filter(ra);
}
function qC() {
  return typeof navigator > "u" || navigator.onLine === void 0 ? !0 : navigator.onLine;
}
var OC = (e) => e.replace(/\/$/, ""), FC = (e) => e.replace(/^\//, "");
function DC(e, t) {
  if (!e)
    return t;
  if (!t)
    return e;
  if (EC(t))
    return t;
  const r = e.endsWith("/") || !t.startsWith("?") ? "/" : "";
  return e = OC(e), t = FC(t), `${e}${r}${t}`;
}
function ui(e, t, r) {
  return e.has(t) ? e.get(t) : e.set(t, r(t)).get(t);
}
var eo = () => /* @__PURE__ */ new Map(), TC = (e) => {
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
}, _C = (...e) => {
  for (const r of e) if (r.aborted) return AbortSignal.abort(r.reason);
  const t = new AbortController();
  for (const r of e)
    r.addEventListener("abort", () => t.abort(r.reason), {
      signal: t.signal,
      once: !0
    });
  return t.signal;
}, cu = (...e) => fetch(...e), MC = (e) => e.status >= 200 && e.status <= 299, PC = (e) => (
  /*applicat*/
  /ion\/(vnd\.api\+)?json/.test(e.get("content-type") || "")
);
function uu(e) {
  if (!Gt(e))
    return e;
  const t = {
    ...e
  };
  for (const [r, n] of Object.entries(t))
    n === void 0 && delete t[r];
  return t;
}
var UC = (e) => typeof e == "object" && (Gt(e) || Array.isArray(e) || typeof e.toJSON == "function");
function $C({
  baseUrl: e,
  prepareHeaders: t = (d) => d,
  fetchFn: r = cu,
  paramsSerializer: n,
  isJsonContentType: i = PC,
  jsonContentType: s = "application/json",
  jsonReplacer: o,
  timeout: a,
  responseHandler: c,
  validateStatus: u,
  ...l
} = {}) {
  return typeof fetch > "u" && r === cu && console.warn("Warning: `fetch` is not available. Please supply a custom `fetchFn` property to use `fetchBaseQuery` on SSR environments."), async (p, g, h) => {
    const {
      getState: f,
      extra: m,
      endpoint: C,
      forced: k,
      type: b
    } = g;
    let S, {
      url: v,
      headers: O = new Headers(l.headers),
      params: _ = void 0,
      responseHandler: $ = c ?? "json",
      validateStatus: A = u ?? MC,
      timeout: x = a,
      ...I
    } = typeof p == "string" ? {
      url: p
    } : p, D = {
      ...l,
      signal: x ? _C(g.signal, TC(x)) : g.signal,
      ...I
    };
    O = new Headers(uu(O)), D.headers = await t(O, {
      getState: f,
      arg: p,
      extra: m,
      endpoint: C,
      forced: k,
      type: b,
      extraOptions: h
    }) || O;
    const V = UC(D.body);
    if (D.body != null && !V && typeof D.body != "string" && D.headers.delete("content-type"), !D.headers.has("content-type") && V && D.headers.set("content-type", s), V && i(D.headers) && (D.body = JSON.stringify(D.body, o)), D.headers.has("accept") || ($ === "json" ? D.headers.set("accept", "application/json") : $ === "text" && D.headers.set("accept", "text/plain, text/html, */*")), _) {
      const L = ~v.indexOf("?") ? "&" : "?", N = n ? n(_) : new URLSearchParams(uu(_));
      v += L + N;
    }
    v = DC(e, v);
    const F = new Request(v, D);
    S = {
      request: new Request(v, D)
    };
    let y;
    try {
      y = await r(F);
    } catch (L) {
      return {
        error: {
          status: (L instanceof Error || typeof DOMException < "u" && L instanceof DOMException) && L.name === "TimeoutError" ? "TIMEOUT_ERROR" : "FETCH_ERROR",
          error: String(L)
        },
        meta: S
      };
    }
    const q = y.clone();
    S.response = q;
    let E, T = "";
    try {
      let L;
      if (await Promise.all([
        d(y, $).then((N) => E = N, (N) => L = N),
        // see https://github.com/node-fetch/node-fetch/issues/665#issuecomment-538995182
        // we *have* to "use up" both streams at the same time or they will stop running in node-fetch scenarios
        q.text().then((N) => T = N, () => {
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
    return A(y, E) ? {
      data: E,
      meta: S
    } : {
      error: {
        status: y.status,
        data: E
      },
      meta: S
    };
  };
  async function d(p, g) {
    if (typeof g == "function")
      return g(p);
    if (g === "content-type" && (g = i(p.headers) ? "json" : "text"), g === "json") {
      const h = await p.text();
      return h.length ? JSON.parse(h) : null;
    }
    return p.text();
  }
}
var Wt = class {
  constructor(e, t = void 0) {
    H(this, "value");
    H(this, "meta");
    this.value = e, this.meta = t;
  }
};
async function VC(e = 0, t = 5, r) {
  const n = Math.min(e, t), i = ~~((Math.random() + 0.4) * (300 << n));
  await new Promise((s, o) => {
    const a = setTimeout(() => s(), i);
    if (r) {
      const c = () => {
        clearTimeout(a), o(new Error("Aborted"));
      };
      r.aborted ? (clearTimeout(a), o(new Error("Aborted"))) : r.addEventListener("abort", c, {
        once: !0
      });
    }
  });
}
function $f(e, t) {
  throw Object.assign(new Wt({
    error: e,
    meta: t
  }), {
    throwImmediately: !0
  });
}
function gs(e) {
  e.aborted && $f({
    status: "CUSTOM_ERROR",
    error: "Aborted"
  });
}
var lu = {}, LC = (e, t) => async (r, n, i) => {
  const s = [5, (t || lu).maxRetries, (i || lu).maxRetries].filter((l) => l !== void 0), [o] = s.slice(-1), c = {
    maxRetries: o,
    backoff: VC,
    retryCondition: (l, d, {
      attempt: p
    }) => p <= o,
    ...t,
    ...i
  };
  let u = 0;
  for (; ; ) {
    gs(n.signal);
    try {
      const l = await e(r, n, i);
      if (l.error)
        throw new Wt(l);
      return l;
    } catch (l) {
      if (u++, l.throwImmediately) {
        if (l instanceof Wt)
          return l.value;
        throw l;
      }
      if (l instanceof Wt) {
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
      gs(n.signal);
      try {
        await c.backoff(u, c.maxRetries, n.signal);
      } catch (d) {
        throw gs(n.signal), d;
      }
    }
  }
}, QC = /* @__PURE__ */ Object.assign(LC, {
  fail: $f
}), Mi = "__rtkq/", jC = "online", NC = "offline", Vf = "focused", na = /* @__PURE__ */ w(`${Mi}${Vf}`), Lf = /* @__PURE__ */ w(`${Mi}un${Vf}`), ia = /* @__PURE__ */ w(`${Mi}${jC}`), Qf = /* @__PURE__ */ w(`${Mi}${NC}`), en = "query", jf = "mutation", Nf = "infinitequery";
function Pi(e) {
  return e.type === en;
}
function zC(e) {
  return e.type === jf;
}
function Ui(e) {
  return e.type === Nf;
}
function li(e) {
  return Pi(e) || Ui(e);
}
function sa(e, t, r, n, i, s) {
  const o = BC(e) ? e(t, r, n, i) : e;
  return o ? Xs(o, ra, (a) => s(zf(a))) : [];
}
function BC(e) {
  return typeof e == "function";
}
function zf(e) {
  return typeof e == "string" ? {
    type: e
  } : e;
}
function HC(e, t) {
  return e.catch(t);
}
var rr = (e, t) => e.endpointDefinitions[t], Mr = /* @__PURE__ */ Symbol("forceQueryFn"), to = (e) => typeof e[Mr] == "function";
function YC({
  serializeQueryArgs: e,
  queryThunk: t,
  infiniteQueryThunk: r,
  mutationThunk: n,
  api: i,
  context: s,
  getInternalState: o
}) {
  const a = (S) => {
    var v;
    return (v = o(S)) == null ? void 0 : v.runningQueries;
  }, c = (S) => {
    var v;
    return (v = o(S)) == null ? void 0 : v.runningMutations;
  }, {
    unsubscribeQueryResult: u,
    removeMutationResult: l,
    updateSubscriptionOptions: d
  } = i.internalActions;
  return {
    buildInitiateQuery: C,
    buildInitiateInfiniteQuery: k,
    buildInitiateMutation: b,
    getRunningQueryThunk: p,
    getRunningMutationThunk: g,
    getRunningQueriesThunk: h,
    getRunningMutationsThunk: f
  };
  function p(S, v) {
    return (O) => {
      var A;
      const _ = rr(s, S), $ = e({
        queryArgs: v,
        endpointDefinition: _,
        endpointName: S
      });
      return (A = a(O)) == null ? void 0 : A.get($);
    };
  }
  function g(S, v) {
    return (O) => {
      var _;
      return (_ = c(O)) == null ? void 0 : _.get(v);
    };
  }
  function h() {
    return (S) => au(a(S));
  }
  function f() {
    return (S) => au(c(S));
  }
  function m(S, v) {
    const O = (_, {
      subscribe: $ = !0,
      forceRefetch: A,
      subscriptionOptions: x,
      [Mr]: I,
      ...D
    } = {}) => (V, F) => {
      var Y;
      const U = e({
        queryArgs: _,
        endpointDefinition: v,
        endpointName: S
      });
      let y;
      const q = {
        ...D,
        type: en,
        subscribe: $,
        forceRefetch: A,
        subscriptionOptions: x,
        endpointName: S,
        originalArgs: _,
        queryCacheKey: U,
        [Mr]: I
      };
      if (Pi(v))
        y = t(q);
      else {
        const {
          direction: Z,
          initialPageParam: le,
          refetchCachedPages: ce
        } = D;
        y = r({
          ...q,
          // Supply these even if undefined. This helps with a field existence
          // check over in `buildSlice.ts`
          direction: Z,
          initialPageParam: le,
          refetchCachedPages: ce
        });
      }
      const E = i.endpoints[S].select(_), T = V(y), L = E(F()), {
        requestId: N,
        abort: J
      } = T, W = L.requestId !== N, re = (Y = a(V)) == null ? void 0 : Y.get(U), B = () => E(F()), X = Object.assign(I ? (
        // a query has been forced (upsertQueryData)
        // -> we want to resolve it once data has been written with the data that will be written
        T.then(B)
      ) : W && !re ? (
        // a query has been skipped due to a condition and we do not have any currently running query
        // -> we want to resolve it immediately with the current data
        Promise.resolve(L)
      ) : (
        // query just started or one is already in flight
        // -> wait for the running query, then resolve with data from after that
        Promise.all([re, T]).then(B)
      ), {
        arg: _,
        requestId: N,
        subscriptionOptions: x,
        queryCacheKey: U,
        abort: J,
        async unwrap() {
          const Z = await X;
          if (Z.isError)
            throw Z.error;
          return Z.data;
        },
        refetch: (Z) => V(O(_, {
          subscribe: !1,
          forceRefetch: !0,
          ...Z
        })),
        unsubscribe() {
          $ && V(u({
            queryCacheKey: U,
            requestId: N
          }));
        },
        updateSubscriptionOptions(Z) {
          X.subscriptionOptions = Z, V(d({
            endpointName: S,
            requestId: N,
            queryCacheKey: U,
            options: Z
          }));
        }
      });
      if (!re && !W && !I) {
        const Z = a(V);
        Z.set(U, X), X.then(() => {
          Z.delete(U);
        });
      }
      return X;
    };
    return O;
  }
  function C(S, v) {
    return m(S, v);
  }
  function k(S, v) {
    return m(S, v);
  }
  function b(S) {
    return (v, {
      track: O = !0,
      fixedCacheKey: _
    } = {}) => ($, A) => {
      const x = n({
        type: "mutation",
        endpointName: S,
        originalArgs: v,
        track: O,
        fixedCacheKey: _
      }), I = $(x), {
        requestId: D,
        abort: V,
        unwrap: F
      } = I, U = HC(I.unwrap().then((T) => ({
        data: T
      })), (T) => ({
        error: T
      })), y = () => {
        $(l({
          requestId: D,
          fixedCacheKey: _
        }));
      }, q = Object.assign(U, {
        arg: I.arg,
        requestId: D,
        abort: V,
        unwrap: F,
        reset: y
      }), E = c($);
      return E.set(D, q), q.then(() => {
        E.delete(D);
      }), _ && (E.set(_, q), q.then(() => {
        E.get(_) === q && E.delete(_);
      })), q;
    };
  }
}
var Bf = class extends kC {
  constructor(t, r, n, i) {
    super(t);
    H(this, "value");
    H(this, "schemaName");
    H(this, "_bqMeta");
    this.value = r, this.schemaName = n, this._bqMeta = i;
  }
}, It = (e, t) => Array.isArray(e) ? e.includes(t) : !!e;
async function At(e, t, r, n) {
  const i = await e["~standard"].validate(t);
  if (i.issues)
    throw new Bf(i.issues, t, r, n);
  return i.value;
}
function du(e) {
  return e;
}
var mr = (e = {}) => ({
  ...e,
  [fo]: !0
});
function WC({
  reducerPath: e,
  baseQuery: t,
  context: {
    endpointDefinitions: r
  },
  serializeQueryArgs: n,
  api: i,
  assertTagType: s,
  selectors: o,
  onSchemaFailure: a,
  catchSchemaFailure: c,
  skipSchemaValidation: u
}) {
  const l = (I, D, V, F) => (U, y) => {
    const q = r[I], E = n({
      queryArgs: D,
      endpointDefinition: q,
      endpointName: I
    });
    if (U(i.internalActions.queryResultPatched({
      queryCacheKey: E,
      patches: V
    })), !F)
      return;
    const T = i.endpoints[I].select(D)(
      // Work around TS 4.1 mismatch
      y()
    ), L = sa(q.providesTags, T.data, void 0, D, {}, s);
    U(i.internalActions.updateProvidedBy([{
      queryCacheKey: E,
      providedTags: L
    }]));
  };
  function d(I, D, V = 0) {
    const F = [D, ...I];
    return V && F.length > V ? F.slice(0, -1) : F;
  }
  function p(I, D, V = 0) {
    const F = [...I, D];
    return V && F.length > V ? F.slice(1) : F;
  }
  const g = (I, D, V, F = !0) => (U, y) => {
    const E = i.endpoints[I].select(D)(
      // Work around TS 4.1 mismatch
      y()
    ), T = {
      patches: [],
      inversePatches: [],
      undo: () => U(i.util.patchQueryData(I, D, T.inversePatches, F))
    };
    if (E.status === rt)
      return T;
    let L;
    if ("data" in E)
      if (qe(E.data)) {
        const [N, J, W] = hl(E.data, V);
        T.patches.push(...J), T.inversePatches.push(...W), L = N;
      } else
        L = V(E.data), T.patches.push({
          op: "replace",
          path: [],
          value: L
        }), T.inversePatches.push({
          op: "replace",
          path: [],
          value: E.data
        });
    return T.patches.length === 0 || U(i.util.patchQueryData(I, D, T.patches, F)), T;
  }, h = (I, D, V) => (F) => F(i.endpoints[I].initiate(D, {
    subscribe: !1,
    forceRefetch: !0,
    [Mr]: () => ({
      data: V
    })
  })), f = (I, D) => I.query && I[D] ? I[D] : du, m = async (I, {
    signal: D,
    abort: V,
    rejectWithValue: F,
    fulfillWithValue: U,
    dispatch: y,
    getState: q,
    extra: E
  }) => {
    var W, re;
    const T = r[I.endpointName], {
      metaSchema: L,
      skipSchemaValidation: N = u
    } = T, J = I.type === en;
    try {
      let B = du;
      const X = {
        signal: D,
        abort: V,
        dispatch: y,
        getState: q,
        extra: E,
        endpoint: I.endpointName,
        type: I.type,
        forced: J ? C(I, q()) : void 0,
        queryCacheKey: J ? I.queryCacheKey : void 0
      }, Y = J ? I[Mr] : void 0;
      let Z;
      const le = async (K, te, de, he) => {
        if (te == null && K.pages.length)
          return Promise.resolve({
            data: K
          });
        const Ae = {
          queryArg: I.originalArgs,
          pageParam: te
        }, ge = await ce(Ae), Oe = he ? d : p;
        return {
          data: {
            pages: Oe(K.pages, ge.data, de),
            pageParams: Oe(K.pageParams, te, de)
          },
          meta: ge.meta
        };
      };
      async function ce(K) {
        let te;
        const {
          extraOptions: de,
          argSchema: he,
          rawResponseSchema: Ae,
          responseSchema: ge
        } = T;
        if (he && !It(N, "arg") && (K = await At(
          he,
          K,
          "argSchema",
          {}
          // we don't have a meta yet, so we can't pass it
        )), Y ? te = Y() : T.query ? (B = f(T, "transformResponse"), te = await t(T.query(K), X, de)) : te = await T.queryFn(K, X, de, (Ee) => t(Ee, X, de)), typeof process < "u", te.error) throw new Wt(te.error, te.meta);
        let {
          data: Oe
        } = te;
        Ae && !It(N, "rawResponse") && (Oe = await At(Ae, te.data, "rawResponseSchema", te.meta));
        let me = await B(Oe, te.meta, K);
        return ge && !It(N, "response") && (me = await At(ge, me, "responseSchema", te.meta)), {
          ...te,
          data: me
        };
      }
      if (J && "infiniteQueryOptions" in T) {
        const {
          infiniteQueryOptions: K
        } = T, {
          maxPages: te = 1 / 0
        } = K, de = I.refetchCachedPages ?? K.refetchCachedPages ?? !0;
        let he;
        const Ae = {
          pages: [],
          pageParams: []
        }, ge = (W = o.selectQueryEntry(q(), I.queryCacheKey)) == null ? void 0 : W.data, me = /* arg.forceRefetch */ C(I, q()) && !I.direction || !ge ? Ae : ge;
        if ("direction" in I && I.direction && me.pages.length) {
          const Ee = I.direction === "backward", Qi = (Ee ? Hf : ro)(K, me, I.originalArgs);
          he = await le(me, Qi, te, Ee);
        } else {
          const {
            initialPageParam: Ee = K.initialPageParam
          } = I, on = (ge == null ? void 0 : ge.pageParams) ?? [], Qi = on[0] ?? Ee, Lh = on.length;
          if (he = await le(me, Qi, te), Y && (he = {
            data: he.data.pages[0]
          }), de)
            for (let fa = 1; fa < Lh; fa++) {
              const Qh = ro(K, he.data, I.originalArgs);
              he = await le(he.data, Qh, te);
            }
        }
        Z = he;
      } else
        Z = await ce(I.originalArgs);
      return L && !It(N, "meta") && Z.meta && (Z.meta = await At(L, Z.meta, "metaSchema", Z.meta)), U(Z.data, mr({
        fulfilledTimeStamp: Date.now(),
        baseQueryMeta: Z.meta
      }));
    } catch (B) {
      let X = B;
      if (X instanceof Wt) {
        let Y = f(T, "transformErrorResponse");
        const {
          rawErrorResponseSchema: Z,
          errorResponseSchema: le
        } = T;
        let {
          value: ce,
          meta: K
        } = X;
        try {
          Z && !It(N, "rawErrorResponse") && (ce = await At(Z, ce, "rawErrorResponseSchema", K)), L && !It(N, "meta") && (K = await At(L, K, "metaSchema", K));
          let te = await Y(ce, K, I.originalArgs);
          return le && !It(N, "errorResponse") && (te = await At(le, te, "errorResponseSchema", K)), F(te, mr({
            baseQueryMeta: K
          }));
        } catch (te) {
          X = te;
        }
      }
      try {
        if (X instanceof Bf) {
          const Y = {
            endpoint: I.endpointName,
            arg: I.originalArgs,
            type: I.type,
            queryCacheKey: J ? I.queryCacheKey : void 0
          };
          (re = T.onSchemaFailure) == null || re.call(T, X, Y), a == null || a(X, Y);
          const {
            catchSchemaFailure: Z = c
          } = T;
          if (Z)
            return F(Z(X, Y), mr({
              baseQueryMeta: X._bqMeta
            }));
        }
      } catch (Y) {
        X = Y;
      }
      throw console.error(X), X;
    }
  };
  function C(I, D) {
    const V = o.selectQueryEntry(D, I.queryCacheKey), F = o.selectConfig(D).refetchOnMountOrArgChange, U = V == null ? void 0 : V.fulfilledTimeStamp, y = I.forceRefetch ?? (I.subscribe && F);
    return y ? y === !0 || (Number(/* @__PURE__ */ new Date()) - Number(U)) / 1e3 >= y : !1;
  }
  const k = () => ne(`${e}/executeQuery`, m, {
    getPendingMeta({
      arg: D
    }) {
      const V = r[D.endpointName];
      return mr({
        startedTimeStamp: Date.now(),
        ...Ui(V) ? {
          direction: D.direction
        } : {}
      });
    },
    condition(D, {
      getState: V
    }) {
      var N;
      const F = V(), U = o.selectQueryEntry(F, D.queryCacheKey), y = U == null ? void 0 : U.fulfilledTimeStamp, q = D.originalArgs, E = U == null ? void 0 : U.originalArgs, T = r[D.endpointName], L = D.direction;
      return to(D) ? !0 : (U == null ? void 0 : U.status) === "pending" ? !1 : C(D, F) || Pi(T) && ((N = T == null ? void 0 : T.forceRefetch) != null && N.call(T, {
        currentArg: q,
        previousArg: E,
        endpointState: U,
        state: F
      })) ? !0 : !(y && !L);
    },
    dispatchConditionRejection: !0
  }), b = k(), S = k(), v = ne(`${e}/executeMutation`, m, {
    getPendingMeta() {
      return mr({
        startedTimeStamp: Date.now()
      });
    }
  }), O = (I) => "force" in I, _ = (I) => "ifOlderThan" in I, $ = (I, D, V = {}) => (F, U) => {
    const y = O(V) && V.force, q = _(V) && V.ifOlderThan, E = (L = !0) => {
      const N = {
        forceRefetch: L,
        subscribe: !1
      };
      return i.endpoints[I].initiate(D, N);
    }, T = i.endpoints[I].select(D)(U());
    if (y)
      F(E());
    else if (q) {
      const L = T == null ? void 0 : T.fulfilledTimeStamp;
      if (!L) {
        F(E());
        return;
      }
      (Number(/* @__PURE__ */ new Date()) - Number(new Date(L))) / 1e3 >= q && F(E());
    } else
      F(E(!1));
  };
  function A(I) {
    return (D) => {
      var V, F;
      return ((F = (V = D == null ? void 0 : D.meta) == null ? void 0 : V.arg) == null ? void 0 : F.endpointName) === I;
    };
  }
  function x(I, D) {
    return {
      matchPending: Ir(ho(I), A(D)),
      matchFulfilled: Ir(gt(I), A(D)),
      matchRejected: Ir(Jt(I), A(D))
    };
  }
  return {
    queryThunk: b,
    mutationThunk: v,
    infiniteQueryThunk: S,
    prefetch: $,
    updateQueryData: g,
    upsertQueryData: h,
    patchQueryData: l,
    buildMatchThunkActions: x
  };
}
function ro(e, {
  pages: t,
  pageParams: r
}, n) {
  const i = t.length - 1;
  return e.getNextPageParam(t[i], t, r[i], r, n);
}
function Hf(e, {
  pages: t,
  pageParams: r
}, n) {
  var i;
  return (i = e.getPreviousPageParam) == null ? void 0 : i.call(e, t[0], t, r[0], r, n);
}
function Yf(e, t, r, n) {
  return sa(r[e.meta.arg.endpointName][t], gt(e) ? e.payload : void 0, pi(e) ? e.payload : void 0, e.meta.arg.originalArgs, "baseQueryMeta" in e.meta ? e.meta.baseQueryMeta : void 0, n);
}
function fu(e) {
  return Te(e) ? dl(e) : e;
}
function kn(e, t, r) {
  const n = e[t];
  n && r(n);
}
function Pr(e) {
  return ("arg" in e ? e.arg.fixedCacheKey : e.fixedCacheKey) ?? e.requestId;
}
function hu(e, t, r) {
  const n = e[Pr(t)];
  n && r(n);
}
var En = {};
function GC({
  reducerPath: e,
  queryThunk: t,
  mutationThunk: r,
  serializeQueryArgs: n,
  context: {
    endpointDefinitions: i,
    apiUid: s,
    extractRehydrationInfo: o,
    hasRehydrationInfo: a
  },
  assertTagType: c,
  config: u
}) {
  const l = w(`${e}/resetApiState`);
  function d(A, x, I, D) {
    var V;
    A[V = x.queryCacheKey] ?? (A[V] = {
      status: rt,
      endpointName: x.endpointName
    }), kn(A, x.queryCacheKey, (F) => {
      F.status = Zs, F.requestId = I && F.requestId ? (
        // for `upsertQuery` **updates**, keep the current `requestId`
        F.requestId
      ) : (
        // for normal queries or `upsertQuery` **inserts** always update the `requestId`
        D.requestId
      ), x.originalArgs !== void 0 && (F.originalArgs = x.originalArgs), F.startedTimeStamp = D.startedTimeStamp;
      const U = i[D.arg.endpointName];
      Ui(U) && "direction" in x && (F.direction = x.direction);
    });
  }
  function p(A, x, I, D) {
    kn(A, x.arg.queryCacheKey, (V) => {
      if (V.requestId !== x.requestId && !D) return;
      const {
        merge: F
      } = i[x.arg.endpointName];
      if (V.status = wr, F)
        if (V.data !== void 0) {
          const {
            fulfilledTimeStamp: U,
            arg: y,
            baseQueryMeta: q,
            requestId: E
          } = x;
          let T = jr(V.data, (L) => F(L, I, {
            arg: y.originalArgs,
            baseQueryMeta: q,
            fulfilledTimeStamp: U,
            requestId: E
          }));
          V.data = T;
        } else
          V.data = I;
      else
        V.data = i[x.arg.endpointName].structuralSharing ?? !0 ? Uf(Te(V.data) ? tp(V.data) : V.data, I) : I;
      delete V.error, V.fulfilledTimeStamp = x.fulfilledTimeStamp;
    });
  }
  const g = Vt({
    name: `${e}/queries`,
    initialState: En,
    reducers: {
      removeQueryResult: {
        reducer(A, {
          payload: {
            queryCacheKey: x
          }
        }) {
          delete A[x];
        },
        prepare: hr()
      },
      cacheEntriesUpserted: {
        reducer(A, x) {
          for (const I of x.payload) {
            const {
              queryDescription: D,
              value: V
            } = I;
            d(A, D, !0, {
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
              V,
              // We know we're upserting here
              !0
            );
          }
        },
        prepare: (A) => ({
          payload: A.map((D) => {
            const {
              endpointName: V,
              arg: F,
              value: U
            } = D, y = i[V];
            return {
              queryDescription: {
                type: en,
                endpointName: V,
                originalArgs: D.arg,
                queryCacheKey: n({
                  queryArgs: F,
                  endpointDefinition: y,
                  endpointName: V
                })
              },
              value: U
            };
          }),
          meta: {
            [fo]: !0,
            requestId: po(),
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
          kn(A, x, (D) => {
            D.data = ba(D.data, I.concat());
          });
        },
        prepare: hr()
      }
    },
    extraReducers(A) {
      A.addCase(t.pending, (x, {
        meta: I,
        meta: {
          arg: D
        }
      }) => {
        const V = to(D);
        d(x, D, V, I);
      }).addCase(t.fulfilled, (x, {
        meta: I,
        payload: D
      }) => {
        const V = to(I.arg);
        p(x, I, D, V);
      }).addCase(t.rejected, (x, {
        meta: {
          condition: I,
          arg: D,
          requestId: V
        },
        error: F,
        payload: U
      }) => {
        kn(x, D.queryCacheKey, (y) => {
          if (!I) {
            if (y.requestId !== V) return;
            y.status = br, y.error = U ?? F;
          }
        });
      }).addMatcher(a, (x, I) => {
        const {
          queries: D
        } = o(I);
        for (const [V, F] of Object.entries(D))
          // do not rehydrate entries that were currently in flight.
          ((F == null ? void 0 : F.status) === wr || (F == null ? void 0 : F.status) === br) && (x[V] = F);
      });
    }
  }), h = Vt({
    name: `${e}/mutations`,
    initialState: En,
    reducers: {
      removeMutationResult: {
        reducer(A, {
          payload: x
        }) {
          const I = Pr(x);
          I in A && delete A[I];
        },
        prepare: hr()
      }
    },
    extraReducers(A) {
      A.addCase(r.pending, (x, {
        meta: I,
        meta: {
          requestId: D,
          arg: V,
          startedTimeStamp: F
        }
      }) => {
        V.track && (x[Pr(I)] = {
          requestId: D,
          status: Zs,
          endpointName: V.endpointName,
          startedTimeStamp: F
        });
      }).addCase(r.fulfilled, (x, {
        payload: I,
        meta: D
      }) => {
        D.arg.track && hu(x, D, (V) => {
          V.requestId === D.requestId && (V.status = wr, V.data = I, V.fulfilledTimeStamp = D.fulfilledTimeStamp);
        });
      }).addCase(r.rejected, (x, {
        payload: I,
        error: D,
        meta: V
      }) => {
        V.arg.track && hu(x, V, (F) => {
          F.requestId === V.requestId && (F.status = br, F.error = I ?? D);
        });
      }).addMatcher(a, (x, I) => {
        const {
          mutations: D
        } = o(I);
        for (const [V, F] of Object.entries(D))
          // do not rehydrate entries that were currently in flight.
          ((F == null ? void 0 : F.status) === wr || (F == null ? void 0 : F.status) === br) && // only rehydrate endpoints that were persisted using a `fixedCacheKey`
          V !== (F == null ? void 0 : F.requestId) && (x[V] = F);
      });
    }
  }), f = {
    tags: {},
    keys: {}
  }, m = Vt({
    name: `${e}/invalidation`,
    initialState: f,
    reducers: {
      updateProvidedBy: {
        reducer(A, x) {
          var I, D, V;
          for (const {
            queryCacheKey: F,
            providedTags: U
          } of x.payload) {
            C(A, F);
            for (const {
              type: y,
              id: q
            } of U) {
              const E = (D = (I = A.tags)[y] ?? (I[y] = {}))[V = q || "__internal_without_id"] ?? (D[V] = []);
              E.includes(F) || E.push(F);
            }
            A.keys[F] = U;
          }
        },
        prepare: hr()
      }
    },
    extraReducers(A) {
      A.addCase(g.actions.removeQueryResult, (x, {
        payload: {
          queryCacheKey: I
        }
      }) => {
        C(x, I);
      }).addMatcher(a, (x, I) => {
        var V, F, U;
        const {
          provided: D
        } = o(I);
        for (const [y, q] of Object.entries(D.tags ?? {}))
          for (const [E, T] of Object.entries(q)) {
            const L = (F = (V = x.tags)[y] ?? (V[y] = {}))[U = E || "__internal_without_id"] ?? (F[U] = []);
            for (const N of T)
              L.includes(N) || L.push(N), x.keys[N] = D.keys[N];
          }
      }).addMatcher(tt(gt(t), pi(t)), (x, I) => {
        k(x, [I]);
      }).addMatcher(g.actions.cacheEntriesUpserted.match, (x, I) => {
        const D = I.payload.map(({
          queryDescription: V,
          value: F
        }) => ({
          type: "UNKNOWN",
          payload: F,
          meta: {
            requestStatus: "fulfilled",
            requestId: "UNKNOWN",
            arg: V
          }
        }));
        k(x, D);
      });
    }
  });
  function C(A, x) {
    var D;
    const I = fu(A.keys[x] ?? []);
    for (const V of I) {
      const F = V.type, U = V.id ?? "__internal_without_id", y = (D = A.tags[F]) == null ? void 0 : D[U];
      y && (A.tags[F][U] = fu(y).filter((q) => q !== x));
    }
    delete A.keys[x];
  }
  function k(A, x) {
    const I = x.map((D) => {
      const V = Yf(D, "providesTags", i, c), {
        queryCacheKey: F
      } = D.meta.arg;
      return {
        queryCacheKey: F,
        providedTags: V
      };
    });
    m.caseReducers.updateProvidedBy(A, m.actions.updateProvidedBy(I));
  }
  const b = Vt({
    name: `${e}/subscriptions`,
    initialState: En,
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
    initialState: En,
    reducers: {
      subscriptionsUpdated: {
        reducer(A, x) {
          return ba(A, x.payload);
        },
        prepare: hr()
      }
    }
  }), v = Vt({
    name: `${e}/config`,
    initialState: {
      online: qC(),
      focused: RC(),
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
      A.addCase(ia, (x) => {
        x.online = !0;
      }).addCase(Qf, (x) => {
        x.online = !1;
      }).addCase(na, (x) => {
        x.focused = !0;
      }).addCase(Lf, (x) => {
        x.focused = !1;
      }).addMatcher(a, (x) => ({
        ...x
      }));
    }
  }), O = Xh({
    queries: g.reducer,
    mutations: h.reducer,
    provided: m.reducer,
    subscriptions: S.reducer,
    config: v.reducer
  }), _ = (A, x) => O(l.match(x) ? void 0 : A, x), $ = {
    ...v.actions,
    ...g.actions,
    ...b.actions,
    ...S.actions,
    ...h.actions,
    ...m.actions,
    resetApiState: l
  };
  return {
    reducer: _,
    actions: $
  };
}
var ms = /* @__PURE__ */ Symbol.for("RTKQ/skipToken"), Wf = {
  status: rt
}, pu = /* @__PURE__ */ jr(Wf, () => {
}), gu = /* @__PURE__ */ jr(Wf, () => {
});
function KC({
  serializeQueryArgs: e,
  reducerPath: t,
  createSelector: r
}) {
  const n = (b) => pu, i = (b) => gu;
  return {
    buildQuerySelector: p,
    buildInfiniteQuerySelector: g,
    buildMutationSelector: h,
    selectInvalidatedBy: f,
    selectCachedArgsForQuery: m,
    selectApiState: o,
    selectQueries: a,
    selectMutations: u,
    selectQueryEntry: c,
    selectConfig: l
  };
  function s(b) {
    return {
      ...b,
      ...su(b.status)
    };
  }
  function o(b) {
    return b[t];
  }
  function a(b) {
    var S;
    return (S = o(b)) == null ? void 0 : S.queries;
  }
  function c(b, S) {
    var v;
    return (v = a(b)) == null ? void 0 : v[S];
  }
  function u(b) {
    var S;
    return (S = o(b)) == null ? void 0 : S.mutations;
  }
  function l(b) {
    var S;
    return (S = o(b)) == null ? void 0 : S.config;
  }
  function d(b, S, v) {
    return (O) => {
      if (O === ms)
        return r(n, v);
      const _ = e({
        queryArgs: O,
        endpointDefinition: S,
        endpointName: b
      });
      return r((A) => c(A, _) ?? pu, v);
    };
  }
  function p(b, S) {
    return d(b, S, s);
  }
  function g(b, S) {
    const {
      infiniteQueryOptions: v
    } = S;
    function O(_) {
      const $ = {
        ..._,
        ...su(_.status)
      }, {
        isLoading: A,
        isError: x,
        direction: I
      } = $, D = I === "forward", V = I === "backward";
      return {
        ...$,
        hasNextPage: C(v, $.data, $.originalArgs),
        hasPreviousPage: k(v, $.data, $.originalArgs),
        isFetchingNextPage: A && D,
        isFetchingPreviousPage: A && V,
        isFetchNextPageError: x && D,
        isFetchPreviousPageError: x && V
      };
    }
    return d(b, S, O);
  }
  function h() {
    return ((b) => {
      let S;
      return typeof b == "object" ? S = Pr(b) ?? ms : S = b, r(S === ms ? i : (_) => {
        var $, A;
        return ((A = ($ = o(_)) == null ? void 0 : $.mutations) == null ? void 0 : A[S]) ?? gu;
      }, s);
    });
  }
  function f(b, S) {
    const v = b[t], O = /* @__PURE__ */ new Set(), _ = Xs(S, ra, zf);
    for (const $ of _) {
      const A = v.provided.tags[$.type];
      if (!A)
        continue;
      let x = ($.id !== void 0 ? (
        // id given: invalidate all queries that provide this type & id
        A[$.id]
      ) : (
        // no id: invalidate all queries that provide this type
        Object.values(A).flat()
      )) ?? [];
      for (const I of x)
        O.add(I);
    }
    return Array.from(O.values()).flatMap(($) => {
      const A = v.queries[$];
      return A ? {
        queryCacheKey: $,
        endpointName: A.endpointName,
        originalArgs: A.originalArgs
      } : [];
    });
  }
  function m(b, S) {
    return Xs(Object.values(a(b)), (v) => (v == null ? void 0 : v.endpointName) === S && v.status !== rt, (v) => v.originalArgs);
  }
  function C(b, S, v) {
    return S ? ro(b, S, v) != null : !1;
  }
  function k(b, S, v) {
    return !S || !b.getPreviousPageParam ? !1 : Hf(b, S, v) != null;
  }
}
var Nt = WeakMap ? /* @__PURE__ */ new WeakMap() : void 0, mu = ({
  endpointName: e,
  queryArgs: t
}) => {
  let r = "";
  const n = Nt == null ? void 0 : Nt.get(t);
  if (typeof n == "string")
    r = n;
  else {
    const i = JSON.stringify(t, (s, o) => (o = typeof o == "bigint" ? {
      $bigint: o.toString()
    } : o, o = Gt(o) ? Object.keys(o).sort().reduce((a, c) => (a[c] = o[c], a), {}) : o, o));
    Gt(t) && (Nt == null || Nt.set(t, i)), r = i;
  }
  return `${e}(${r})`;
};
function JC(...e) {
  return function(r) {
    const n = Jn((u) => {
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
        let l = mu;
        if ("serializeQueryArgs" in u.endpointDefinition) {
          const d = u.endpointDefinition.serializeQueryArgs;
          l = (p) => {
            const g = d(p);
            return typeof g == "string" ? g : mu({
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
      apiUid: po(),
      extractRehydrationInfo: n,
      hasRehydrationInfo: Jn((u) => n(u) != null)
    }, o = {
      injectEndpoints: c,
      enhanceEndpoints({
        addTagTypes: u,
        endpoints: l
      }) {
        if (u)
          for (const d of u)
            i.tagTypes.includes(d) || i.tagTypes.push(d);
        if (l)
          for (const [d, p] of Object.entries(l))
            typeof p == "function" ? p(rr(s, d)) : Object.assign(rr(s, d) || {}, p);
        return o;
      }
    }, a = e.map((u) => u.init(o, i, s));
    function c(u) {
      const l = u.endpoints({
        query: (d) => ({
          ...d,
          type: en
        }),
        mutation: (d) => ({
          ...d,
          type: jf
        }),
        infiniteQuery: (d) => ({
          ...d,
          type: Nf
        })
      });
      for (const [d, p] of Object.entries(l)) {
        if (u.overrideExisting !== !0 && d in s.endpointDefinitions) {
          if (u.overrideExisting === "throw")
            throw new Error(et(39));
          continue;
        }
        s.endpointDefinitions[d] = p;
        for (const g of a)
          g.injectEndpoint(d, p);
      }
      return o;
    }
    return o.injectEndpoints({
      endpoints: r.endpoints
    });
  };
}
function Ye(e, ...t) {
  return Object.assign(e, ...t);
}
var ZC = ({
  api: e,
  queryThunk: t,
  internalState: r,
  mwApi: n
}) => {
  const i = `${e.reducerPath}/subscriptions`;
  let s = null, o = null;
  const {
    updateSubscriptionOptions: a,
    unsubscribeQueryResult: c
  } = e.internalActions, u = (f, m) => {
    if (a.match(m)) {
      const {
        queryCacheKey: k,
        requestId: b,
        options: S
      } = m.payload, v = f.get(k);
      return v != null && v.has(b) && v.set(b, S), !0;
    }
    if (c.match(m)) {
      const {
        queryCacheKey: k,
        requestId: b
      } = m.payload, S = f.get(k);
      return S && S.delete(b), !0;
    }
    if (e.internalActions.removeQueryResult.match(m))
      return f.delete(m.payload.queryCacheKey), !0;
    if (t.pending.match(m)) {
      const {
        meta: {
          arg: k,
          requestId: b
        }
      } = m, S = ui(f, k.queryCacheKey, eo);
      return k.subscribe && S.set(b, k.subscriptionOptions ?? S.get(b) ?? {}), !0;
    }
    let C = !1;
    if (t.rejected.match(m)) {
      const {
        meta: {
          condition: k,
          arg: b,
          requestId: S
        }
      } = m;
      if (k && b.subscribe) {
        const v = ui(f, b.queryCacheKey, eo);
        v.set(S, b.subscriptionOptions ?? v.get(S) ?? {}), C = !0;
      }
    }
    return C;
  }, l = () => r.currentSubscriptions, g = {
    getSubscriptions: l,
    getSubscriptionCount: (f) => {
      const C = l().get(f);
      return (C == null ? void 0 : C.size) ?? 0;
    },
    isRequestSubscribed: (f, m) => {
      var k;
      const C = l();
      return !!((k = C == null ? void 0 : C.get(f)) != null && k.get(m));
    }
  };
  function h(f) {
    return JSON.parse(JSON.stringify(Object.fromEntries([...f].map(([m, C]) => [m, Object.fromEntries(C)]))));
  }
  return (f, m) => {
    if (s || (s = h(r.currentSubscriptions)), e.util.resetApiState.match(f))
      return s = {}, r.currentSubscriptions.clear(), o = null, [!0, !1];
    if (e.internalActions.internal_getRTKQSubscriptions.match(f))
      return [!1, g];
    const C = u(r.currentSubscriptions, f);
    let k = !0;
    if (C) {
      o || (o = setTimeout(() => {
        const v = h(r.currentSubscriptions), [, O] = hl(s, () => v);
        m.next(e.internalActions.subscriptionsUpdated(O)), s = v, o = null;
      }, 500));
      const b = typeof f.type == "string" && !!f.type.startsWith(i), S = t.rejected.match(f) && f.meta.condition && !!f.meta.arg.subscribe;
      k = !b && !S;
    }
    return [k, !1];
  };
}, XC = 2147483647 / 1e3 - 1, eI = ({
  reducerPath: e,
  api: t,
  queryThunk: r,
  context: n,
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
    cacheEntriesUpserted: d
  } = t.internalActions, p = tt(l.match, r.fulfilled, r.rejected, d.match);
  function g(b) {
    const S = i.currentSubscriptions.get(b);
    return S ? S.size > 0 : !1;
  }
  const h = {};
  function f(b) {
    var S;
    for (const v of b.values())
      (S = v == null ? void 0 : v.abort) == null || S.call(v);
  }
  const m = (b, S) => {
    const v = S.getState(), O = o(v);
    if (p(b)) {
      let _;
      if (d.match(b))
        _ = b.payload.map(($) => $.queryDescription.queryCacheKey);
      else {
        const {
          queryCacheKey: $
        } = l.match(b) ? b.payload : b.meta.arg;
        _ = [$];
      }
      C(_, S, O);
    }
    if (t.util.resetApiState.match(b)) {
      for (const [_, $] of Object.entries(h))
        $ && clearTimeout($), delete h[_];
      f(i.runningQueries), f(i.runningMutations);
    }
    if (n.hasRehydrationInfo(b)) {
      const {
        queries: _
      } = n.extractRehydrationInfo(b);
      C(Object.keys(_), S, O);
    }
  };
  function C(b, S, v) {
    const O = S.getState();
    for (const _ of b) {
      const $ = s(O, _);
      $ != null && $.endpointName && k(_, $.endpointName, S, v);
    }
  }
  function k(b, S, v, O) {
    const _ = rr(n, S), $ = (_ == null ? void 0 : _.keepUnusedDataFor) ?? O.keepUnusedDataFor;
    if ($ === 1 / 0)
      return;
    const A = Math.max(0, Math.min($, XC));
    if (!g(b)) {
      const x = h[b];
      x && clearTimeout(x), h[b] = setTimeout(() => {
        if (!g(b)) {
          const I = s(v.getState(), b);
          if (I != null && I.endpointName) {
            const D = v.dispatch(a(I.endpointName, I.originalArgs));
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
}, yu = new Error("Promise never resolved before cacheEntryRemoved."), tI = ({
  api: e,
  reducerPath: t,
  context: r,
  queryThunk: n,
  mutationThunk: i,
  internalState: s,
  selectors: {
    selectQueryEntry: o,
    selectApiState: a
  }
}) => {
  const c = Ps(n), u = Ps(i), l = gt(n, i), d = {}, {
    removeQueryResult: p,
    removeMutationResult: g,
    cacheEntriesUpserted: h
  } = e.internalActions;
  function f(v, O, _) {
    const $ = d[v];
    $ != null && $.valueResolved && ($.valueResolved({
      data: O,
      meta: _
    }), delete $.valueResolved);
  }
  function m(v) {
    const O = d[v];
    O && (delete d[v], O.cacheEntryRemoved());
  }
  function C(v) {
    const {
      arg: O,
      requestId: _
    } = v.meta, {
      endpointName: $,
      originalArgs: A
    } = O;
    return [$, A, _];
  }
  const k = (v, O, _) => {
    const $ = b(v);
    function A(x, I, D, V) {
      const F = o(_, I), U = o(O.getState(), I);
      !F && U && S(x, V, I, O, D);
    }
    if (n.pending.match(v)) {
      const [x, I, D] = C(v);
      A(x, $, D, I);
    } else if (h.match(v))
      for (const {
        queryDescription: x,
        value: I
      } of v.payload) {
        const {
          endpointName: D,
          originalArgs: V,
          queryCacheKey: F
        } = x;
        A(D, F, v.meta.requestId, V), f(F, I, {});
      }
    else if (i.pending.match(v)) {
      if (O.getState()[t].mutations[$]) {
        const [I, D, V] = C(v);
        S(I, D, $, O, V);
      }
    } else if (l(v))
      f($, v.payload, v.meta.baseQueryMeta);
    else if (p.match(v) || g.match(v))
      m($);
    else if (e.util.resetApiState.match(v))
      for (const x of Object.keys(d))
        m(x);
  };
  function b(v) {
    return c(v) ? v.meta.arg.queryCacheKey : u(v) ? v.meta.arg.fixedCacheKey ?? v.meta.requestId : p.match(v) ? v.payload.queryCacheKey : g.match(v) ? Pr(v.payload) : "";
  }
  function S(v, O, _, $, A) {
    const x = rr(r, v), I = x == null ? void 0 : x.onCacheEntryAdded;
    if (!I) return;
    const D = {}, V = new Promise((T) => {
      D.cacheEntryRemoved = T;
    }), F = Promise.race([new Promise((T) => {
      D.valueResolved = T;
    }), V.then(() => {
      throw yu;
    })]);
    F.catch(() => {
    }), d[_] = D;
    const U = e.endpoints[v].select(li(x) ? O : _), y = $.dispatch((T, L, N) => N), q = {
      ...$,
      getCacheEntry: () => U($.getState()),
      requestId: A,
      extra: y,
      updateCachedData: li(x) ? (T) => $.dispatch(e.util.updateQueryData(v, O, T)) : void 0,
      cacheDataLoaded: F,
      cacheEntryRemoved: V
    }, E = I(O, q);
    Promise.resolve(E).catch((T) => {
      if (T !== yu)
        throw T;
    });
  }
  return k;
}, rI = ({
  api: e,
  context: {
    apiUid: t
  },
  reducerPath: r
}) => (n, i) => {
  e.util.resetApiState.match(n) && i.dispatch(e.internalActions.middlewareRegistered(t));
}, nI = ({
  reducerPath: e,
  context: t,
  context: {
    endpointDefinitions: r
  },
  mutationThunk: n,
  queryThunk: i,
  api: s,
  assertTagType: o,
  refetchQuery: a,
  internalState: c
}) => {
  const {
    removeQueryResult: u
  } = s.internalActions, l = tt(gt(n), pi(n)), d = tt(gt(i, n), Jt(i, n));
  let p = [], g = 0;
  const h = (C, k) => {
    (i.pending.match(C) || n.pending.match(C)) && g++, d(C) && (g = Math.max(0, g - 1)), l(C) ? m(Yf(C, "invalidatesTags", r, o), k) : d(C) ? m([], k) : s.util.invalidateTags.match(C) && m(sa(C.payload, void 0, void 0, void 0, void 0, o), k);
  };
  function f() {
    return g > 0;
  }
  function m(C, k) {
    const b = k.getState(), S = b[e];
    if (p.push(...C), S.config.invalidationBehavior === "delayed" && f())
      return;
    const v = p;
    if (p = [], v.length === 0) return;
    const O = s.util.selectInvalidatedBy(b, v);
    t.batch(() => {
      const _ = Array.from(O.values());
      for (const {
        queryCacheKey: $
      } of _) {
        const A = S.queries[$], x = ui(c.currentSubscriptions, $, eo);
        A && (x.size === 0 ? k.dispatch(u({
          queryCacheKey: $
        })) : A.status !== rt && k.dispatch(a(A)));
      }
    });
  }
  return h;
}, iI = ({
  reducerPath: e,
  queryThunk: t,
  api: r,
  refetchQuery: n,
  internalState: i
}) => {
  const {
    currentPolls: s,
    currentSubscriptions: o
  } = i, a = /* @__PURE__ */ new Set();
  let c = null;
  const u = (m, C) => {
    (r.internalActions.updateSubscriptionOptions.match(m) || r.internalActions.unsubscribeQueryResult.match(m)) && l(m.payload.queryCacheKey, C), (t.pending.match(m) || t.rejected.match(m) && m.meta.condition) && l(m.meta.arg.queryCacheKey, C), (t.fulfilled.match(m) || t.rejected.match(m) && !m.meta.condition) && d(m.meta.arg, C), r.util.resetApiState.match(m) && (h(), c && (clearTimeout(c), c = null), a.clear());
  };
  function l(m, C) {
    a.add(m), c || (c = setTimeout(() => {
      for (const k of a)
        p({
          queryCacheKey: k
        }, C);
      a.clear(), c = null;
    }, 0));
  }
  function d({
    queryCacheKey: m
  }, C) {
    const k = C.getState()[e], b = k.queries[m], S = o.get(m);
    if (!b || b.status === rt) return;
    const {
      lowestPollingInterval: v,
      skipPollingIfUnfocused: O
    } = f(S);
    if (!Number.isFinite(v)) return;
    const _ = s.get(m);
    _ != null && _.timeout && (clearTimeout(_.timeout), _.timeout = void 0);
    const $ = Date.now() + v;
    s.set(m, {
      nextPollTimestamp: $,
      pollingInterval: v,
      timeout: setTimeout(() => {
        (k.config.focused || !O) && C.dispatch(n(b)), d({
          queryCacheKey: m
        }, C);
      }, v)
    });
  }
  function p({
    queryCacheKey: m
  }, C) {
    const b = C.getState()[e].queries[m], S = o.get(m);
    if (!b || b.status === rt)
      return;
    const {
      lowestPollingInterval: v
    } = f(S);
    if (!Number.isFinite(v)) {
      g(m);
      return;
    }
    const O = s.get(m), _ = Date.now() + v;
    (!O || _ < O.nextPollTimestamp) && d({
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
  function f(m = /* @__PURE__ */ new Map()) {
    let C = !1, k = Number.POSITIVE_INFINITY;
    for (const b of m.values())
      b.pollingInterval && (k = Math.min(b.pollingInterval, k), C = b.skipPollingIfUnfocused || C);
    return {
      lowestPollingInterval: k,
      skipPollingIfUnfocused: C
    };
  }
  return u;
}, sI = ({
  api: e,
  context: t,
  queryThunk: r,
  mutationThunk: n
}) => {
  const i = ho(r, n), s = Jt(r, n), o = gt(r, n), a = {};
  return (u, l) => {
    var d, p;
    if (i(u)) {
      const {
        requestId: g,
        arg: {
          endpointName: h,
          originalArgs: f
        }
      } = u.meta, m = rr(t, h), C = m == null ? void 0 : m.onQueryStarted;
      if (C) {
        const k = {}, b = new Promise((_, $) => {
          k.resolve = _, k.reject = $;
        });
        b.catch(() => {
        }), a[g] = k;
        const S = e.endpoints[h].select(li(m) ? f : g), v = l.dispatch((_, $, A) => A), O = {
          ...l,
          getCacheEntry: () => S(l.getState()),
          requestId: g,
          extra: v,
          updateCachedData: li(m) ? (_) => l.dispatch(e.util.updateQueryData(h, f, _)) : void 0,
          queryFulfilled: b
        };
        C(f, O);
      }
    } else if (o(u)) {
      const {
        requestId: g,
        baseQueryMeta: h
      } = u.meta;
      (d = a[g]) == null || d.resolve({
        data: u.payload,
        meta: h
      }), delete a[g];
    } else if (s(u)) {
      const {
        requestId: g,
        rejectedWithValue: h,
        baseQueryMeta: f
      } = u.meta;
      (p = a[g]) == null || p.reject({
        error: u.payload ?? u.error,
        isUnhandledError: !h,
        meta: f
      }), delete a[g];
    }
  };
}, oI = ({
  reducerPath: e,
  context: t,
  api: r,
  refetchQuery: n,
  internalState: i
}) => {
  const {
    removeQueryResult: s
  } = r.internalActions, o = (c, u) => {
    na.match(c) && a(u, "refetchOnFocus"), ia.match(c) && a(u, "refetchOnReconnect");
  };
  function a(c, u) {
    const l = c.getState()[e], d = l.queries, p = i.currentSubscriptions;
    t.batch(() => {
      for (const g of p.keys()) {
        const h = d[g], f = p.get(g);
        if (!f || !h) continue;
        const m = [...f.values()];
        (m.some((k) => k[u] === !0) || m.every((k) => k[u] === void 0) && l.config[u]) && (f.size === 0 ? c.dispatch(s({
          queryCacheKey: g
        })) : h.status !== rt && c.dispatch(n(h)));
      }
    });
  }
  return o;
};
function aI(e) {
  const {
    reducerPath: t,
    queryThunk: r,
    api: n,
    context: i,
    getInternalState: s
  } = e, {
    apiUid: o
  } = i, a = {
    invalidateTags: w(`${t}/invalidateTags`)
  }, c = (p) => p.type.startsWith(`${t}/`), u = [rI, eI, nI, iI, tI, sI];
  return {
    middleware: (p) => {
      let g = !1;
      const h = s(p.dispatch), f = {
        ...e,
        internalState: h,
        refetchQuery: d,
        isThisApiSliceAction: c,
        mwApi: p
      }, m = u.map((b) => b(f)), C = ZC(f), k = oI(f);
      return (b) => (S) => {
        if (!il(S))
          return b(S);
        g || (g = !0, p.dispatch(n.internalActions.middlewareRegistered(o)));
        const v = {
          ...p,
          next: b
        }, O = p.getState(), [_, $] = C(S, v, O);
        let A;
        if (_ ? A = b(S) : A = $, p.getState()[t] && (k(S, v, O), c(S) || i.hasRehydrationInfo(S)))
          for (const x of m)
            x(S, v, O);
        return A;
      };
    },
    actions: a
  };
  function d(p) {
    return e.api.endpoints[p.endpointName].initiate(p.originalArgs, {
      subscribe: !1,
      forceRefetch: !0
    });
  }
}
var vu = /* @__PURE__ */ Symbol(), cI = ({
  createSelector: e = fe
} = {}) => ({
  name: vu,
  init(t, {
    baseQuery: r,
    tagTypes: n,
    reducerPath: i,
    serializeQueryArgs: s,
    keepUnusedDataFor: o,
    refetchOnMountOrArgChange: a,
    refetchOnFocus: c,
    refetchOnReconnect: u,
    invalidationBehavior: l,
    onSchemaFailure: d,
    catchSchemaFailure: p,
    skipSchemaValidation: g
  }, h) {
    yp();
    const f = (Y) => Y;
    Object.assign(t, {
      reducerPath: i,
      endpoints: {},
      internalActions: {
        onOnline: ia,
        onOffline: Qf,
        onFocus: na,
        onFocusLost: Lf
      },
      util: {}
    });
    const m = KC({
      serializeQueryArgs: s,
      reducerPath: i,
      createSelector: e
    }), {
      selectInvalidatedBy: C,
      selectCachedArgsForQuery: k,
      buildQuerySelector: b,
      buildInfiniteQuerySelector: S,
      buildMutationSelector: v
    } = m;
    Ye(t.util, {
      selectInvalidatedBy: C,
      selectCachedArgsForQuery: k
    });
    const {
      queryThunk: O,
      infiniteQueryThunk: _,
      mutationThunk: $,
      patchQueryData: A,
      updateQueryData: x,
      upsertQueryData: I,
      prefetch: D,
      buildMatchThunkActions: V
    } = WC({
      baseQuery: r,
      reducerPath: i,
      context: h,
      api: t,
      serializeQueryArgs: s,
      assertTagType: f,
      selectors: m,
      onSchemaFailure: d,
      catchSchemaFailure: p,
      skipSchemaValidation: g
    }), {
      reducer: F,
      actions: U
    } = GC({
      context: h,
      queryThunk: O,
      mutationThunk: $,
      serializeQueryArgs: s,
      reducerPath: i,
      assertTagType: f,
      config: {
        refetchOnFocus: c,
        refetchOnReconnect: u,
        refetchOnMountOrArgChange: a,
        keepUnusedDataFor: o,
        reducerPath: i,
        invalidationBehavior: l
      }
    });
    Ye(t.util, {
      patchQueryData: A,
      updateQueryData: x,
      upsertQueryData: I,
      prefetch: D,
      resetApiState: U.resetApiState,
      upsertQueryEntries: U.cacheEntriesUpserted
    }), Ye(t.internalActions, U);
    const y = /* @__PURE__ */ new WeakMap(), q = (Y) => ui(y, Y, () => ({
      currentSubscriptions: /* @__PURE__ */ new Map(),
      currentPolls: /* @__PURE__ */ new Map(),
      runningQueries: /* @__PURE__ */ new Map(),
      runningMutations: /* @__PURE__ */ new Map()
    })), {
      buildInitiateQuery: E,
      buildInitiateInfiniteQuery: T,
      buildInitiateMutation: L,
      getRunningMutationThunk: N,
      getRunningMutationsThunk: J,
      getRunningQueriesThunk: W,
      getRunningQueryThunk: re
    } = YC({
      queryThunk: O,
      mutationThunk: $,
      infiniteQueryThunk: _,
      api: t,
      serializeQueryArgs: s,
      context: h,
      getInternalState: q
    });
    Ye(t.util, {
      getRunningMutationThunk: N,
      getRunningMutationsThunk: J,
      getRunningQueryThunk: re,
      getRunningQueriesThunk: W
    });
    const {
      middleware: B,
      actions: X
    } = aI({
      reducerPath: i,
      context: h,
      queryThunk: O,
      mutationThunk: $,
      infiniteQueryThunk: _,
      api: t,
      assertTagType: f,
      selectors: m,
      getRunningQueryThunk: re,
      getInternalState: q
    });
    return Ye(t.util, X), Ye(t, {
      reducer: F,
      middleware: B
    }), {
      name: vu,
      injectEndpoint(Y, Z) {
        var K;
        const ce = (K = t.endpoints)[Y] ?? (K[Y] = {});
        Pi(Z) && Ye(ce, {
          name: Y,
          select: b(Y, Z),
          initiate: E(Y, Z)
        }, V(O, Y)), zC(Z) && Ye(ce, {
          name: Y,
          select: v(),
          initiate: L(Y)
        }, V($, Y)), Ui(Z) && Ye(ce, {
          name: Y,
          select: S(Y, Z),
          initiate: T(Y, Z)
        }, V(O, Y));
      }
    };
  }
}), uI = /* @__PURE__ */ JC(cI());
const Gf = (e) => e.query, lI = (e) => {
  var t;
  return (t = e.query) == null ? void 0 : t.enableQuerySyntax;
};
fe((e) => {
  var t;
  return (t = Gf(e)) == null ? void 0 : t.q;
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
const Kf = (e, t, r) => St({
  prefix: "analytics/generatedAnswer/streamEnd",
  __legacy__getBuilder: (n, i) => {
    const s = t ?? si(i);
    if (!s)
      return null;
    const o = SS(i);
    return n.makeGeneratedAnswerStreamEnd({
      generativeQuestionAnsweringId: s,
      answerGenerated: e,
      answerTextIsEmpty: r,
      ...o && { conversationId: o }
    });
  },
  analyticsType: "Rga.AnswerReceived",
  analyticsPayloadBuilder: (n) => ({
    answerId: t ?? si(n) ?? "",
    answerGenerated: e ?? !1
  })
}), Jf = (e) => St({
  prefix: "analytics/generatedAnswer/responseLinked",
  __legacy__getBuilder: () => null,
  analyticsType: "Rga.ResponseLinked",
  analyticsPayloadBuilder: (t) => {
    var n, i;
    return {
      answerId: si(t) ?? "",
      responseId: ((n = t.search) == null ? void 0 : n.searchResponseId) || ((i = t.search) == null ? void 0 : i.response.searchUid) || ""
    };
  }
}), dI = fe((e) => e.advancedSearchQueries, (e) => {
  if (!e)
    return {};
  const { aq: t, cq: r, dq: n, lq: i } = e;
  return {
    ...t && { aq: t },
    ...r && { cq: r },
    ...n && { dq: n },
    ...i && { lq: i }
  };
}), fI = (e) => e.context, hI = (e) => e.pipeline, pI = fe((e) => e.search, (e) => {
  var t;
  return ((t = e == null ? void 0 : e.searchAction) == null ? void 0 : t.actionCause) || "";
}), gI = (e) => e.searchHub, Zf = fe((e) => e, (e) => {
  if (!e)
    return "";
  for (const t in e)
    if (e[t].isActive)
      return e[t].id;
  return "";
});
fe((e) => e, (e) => {
  const t = Zf(e);
  return t && e ? e[t].expression : "";
});
const mI = (e) => {
  if (!(!e.dictionaryFieldContext || !Object.keys(e.dictionaryFieldContext.contextValues).length))
    return e.dictionaryFieldContext.contextValues;
}, yI = (e) => {
  var t;
  return (t = e.excerptLength) == null ? void 0 : t.length;
}, vI = (e) => {
  const { freezeFacetOrder: t } = e.facetOptions ?? {};
  return t !== void 0 ? { freezeFacetOrder: t } : void 0;
}, SI = (e) => {
  if (e.folding)
    return {
      filterField: e.folding.fields.collection,
      childField: e.folding.fields.parent,
      parentField: e.folding.fields.child,
      filterFieldRange: e.folding.filterFieldRange
    };
}, wI = (e) => e.sortCriteria, bI = async (e) => {
  var t;
  return {
    accessToken: e.configuration.accessToken,
    organizationId: e.configuration.organizationId,
    url: mo(e.configuration.search.apiBaseUrl, e.configuration.organizationId, e.configuration.environment),
    streamId: (t = e.search.extendedResults) == null ? void 0 : t.generativeQuestionAnsweringId
  };
}, CI = (e, t) => {
  var _, $, A;
  const r = (_ = Gf(e)) == null ? void 0 : _.q, { aq: n, cq: i, dq: s, lq: o } = xI(e), a = fI(e), c = Ii(e.configuration.analytics, t, { actionCause: pI(e) }), u = gI(e), l = hI(e), d = vS(e) ?? [], p = II(e), g = Zf(e.tabSet) || "default", h = fS(e), f = hS(e), m = t.referrer || "", C = vI(e), k = wI(e), b = AI(e), S = yI(e), v = SI(e), O = mI(e);
  return {
    q: r,
    ...n && { aq: n },
    ...i && { cq: i },
    ...s && { dq: s },
    ...o && { lq: o },
    ...e.query && { enableQuerySyntax: lI(e) },
    ...(a == null ? void 0 : a.contextValues) && {
      context: a.contextValues
    },
    pipelineRuleParameters: {
      mlGenerativeQuestionAnswering: {
        responseFormat: e.generatedAnswer.responseFormat,
        citationsFieldToInclude: d
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
      numberOfResults: qd(e),
      firstResult: e.pagination.firstResult
    },
    tab: g,
    locale: h,
    timezone: f,
    ...e.debug !== void 0 && { debug: e.debug },
    referrer: m,
    ...b,
    ...v ?? {},
    ...S && { excerptLength: S },
    ...O && {
      dictionaryFieldContext: O
    },
    sortCriteria: k,
    ...C && { facetOptions: C },
    ...c,
    ...(($ = e.insightCaseContext) == null ? void 0 : $.caseContext) && {
      caseContext: (A = e.insightCaseContext) == null ? void 0 : A.caseContext
    }
  };
}, II = (e) => {
  var t;
  return (t = ed(e)) == null ? void 0 : t.map((r) => Ed(r, kd())).sort((r, n) => r.facetId > n.facetId ? 1 : n.facetId > r.facetId ? -1 : 0);
}, AI = (e) => ({
  actionsHistory: e.configuration.analytics.enabled ? cr.getInstance().getHistory() : []
}), xI = (e) => {
  const t = dI(e), r = Od(e);
  return {
    ...t,
    ...r && { cq: r }
  };
}, Xf = [
  "searching",
  "thinking",
  "answering"
];
function eh(e) {
  return e.toLowerCase();
}
const th = ["search", "generic"], kI = ["text/plain", "text/markdown"], zt = new Q({ required: !0 }), rh = new Q(), dr = new ie({ required: !0 }), nh = {
  id: zt,
  title: zt,
  uri: zt,
  permanentid: zt,
  clickUri: rh
}, oa = new Q({
  required: !0,
  constrainTo: kI
}), ih = new Q({
  required: !0,
  constrainTo: Xf
}), sh = (e) => ({
  ...e,
  name: eh(e.name)
});
w("generatedAnswer/setIsVisible", (e) => R(e, dr));
const EI = w("generatedAnswer/setAnswerId", (e) => R(e, j));
w("generatedAnswer/setAnswerGenerationMode", (e) => R(e, new Q({
  constrainTo: ["automatic", "manual"],
  required: !1,
  default: "automatic"
})));
w("generatedAnswer/setIsEnabled", (e) => R(e, dr));
const oh = w("generatedAnswer/updateMessage", (e) => R(e, {
  textDelta: zt
})), ah = w("generatedAnswer/updateCitations", (e) => R(e, {
  citations: new ae({
    required: !0,
    each: new z({
      values: nh
    })
  })
})), RI = w("generatedAnswer/updateError", (e) => R(e, {
  message: rh,
  code: new G({ min: 0 })
})), ch = w("generatedAnswer/resetAnswer");
w("generatedAnswer/like");
w("generatedAnswer/dislike");
w("generatedAnswer/feedbackModal/open");
w("generatedAnswer/expand");
w("generatedAnswer/collapse");
w("generatedAnswer/setId", (e) => R(e, {
  id: new Q({
    required: !0
  })
}));
w("generatedAnswer/feedbackModal/close");
w("generatedAnswer/sendFeedback");
const ys = w("generatedAnswer/setIsLoading", (e) => R(e, dr)), Su = w("generatedAnswer/setIsStreaming", (e) => R(e, dr)), uh = w("generatedAnswer/setAnswerContentFormat", (e) => R(e, oa));
w("generatedAnswer/updateResponseFormat", (e) => R(e, {
  contentFormat: new ae({
    each: oa,
    default: ["text/plain"]
  })
}));
w("knowledge/updateAnswerConfigurationId", (e) => R(e, zt));
w("generatedAnswer/registerFieldsToIncludeInCitations", (e) => R(e, Xg));
const qI = w("generatedAnswer/setIsAnswerGenerated", (e) => R(e, dr)), lh = w("generatedAnswer/setCannotAnswer", (e) => R(e, dr)), OI = w("generatedAnswer/setAnswerApiQueryParams", (e) => R(e, new z({})));
w("generatedAnswer/startStep", (e) => R(sh(e), {
  name: ih,
  startedAt: new G({ min: 0, required: !0 })
}));
w("generatedAnswer/finishStep", (e) => R(sh(e), {
  name: ih,
  finishedAt: new G({ min: 0, required: !0 })
}));
w("generatedAnswer/startToolCall", (e) => R(e, {
  toolCallName: j,
  startedAt: new G({ min: 0, required: !0 }),
  toolCallId: j
}));
w("generatedAnswer/finishToolCall", (e) => R(e, {
  finishedAt: new G({ min: 0, required: !0 }),
  toolCallId: j
}));
w("generatedAnswer/toolCallArgs", (e) => R(e, {
  toolCallId: j,
  args: new z({ options: { required: !0 } }),
  type: new Q({
    required: !0,
    constrainTo: th
  })
}));
ne("generatedAnswer/streamAnswer", async (e, t) => {
  var g;
  const r = t.getState(), { dispatch: n, extra: i, getState: s } = t, { search: o } = s(), { queryExecuted: a } = o, { setAbortControllerRef: c } = e, u = await bI(r), l = (h, f) => {
    switch (h) {
      case "genqa.headerMessageType": {
        const m = JSON.parse(f);
        n(uh(m.contentFormat));
        break;
      }
      case "genqa.messageType":
        n(oh(JSON.parse(f)));
        break;
      case "genqa.citationsType":
        n(ah(JSON.parse(f)));
        break;
      case "genqa.endOfStreamType": {
        const m = JSON.parse(f).answerGenerated, { answerId: C, answer: k } = s().generatedAnswer, S = a.length !== 0 && !m, v = !(k != null && k.trim());
        n(lh(S)), n(Su(!1)), n(qI(m)), n(Kf(m, C, m ? v : void 0)), n(Jf());
        break;
      }
      default:
        r.debug && i.logger.warn(`Unknown payloadType: "${h}"`);
    }
  };
  n(ys(!0));
  const d = (h) => h.streamId === t.getState().search.extendedResults.generativeQuestionAnsweringId, p = (g = i.streamingClient) == null ? void 0 : g.streamGeneratedAnswer(u, {
    write: (h) => {
      d(u) && (n(ys(!1)), h.payload && h.payloadType && l(h.payloadType, h.payload));
    },
    abort: (h) => {
      d(u) && n(RI(h));
    },
    close: () => {
      d(u) && n(Su(!1));
    },
    resetAnswer: () => {
      d(u) && n(ch());
    }
  });
  p ? c(p) : n(ys(!1));
});
ne("generatedAnswer/generateAnswer", async (e, { getState: t, dispatch: r, extra: { navigatorContext: n, logger: i } }) => {
  r(ch());
  const s = t();
  if (s.generatedAnswer.isEnabled === !1) {
    i.warn("[WARNING] The generateAnswer action was dispatched while the generated answer is disabled. No answer will be generated. Enable the generated answer before dispatching generateAnswer.");
    return;
  }
  if (s.generatedAnswer.answerConfigurationId) {
    const o = CI(s, n);
    r(OI(o)), await r(GI(o));
  } else
    i.warn("[WARNING] Missing answerConfigurationId in engine configuration. The generateAnswer action requires an answer configuration ID to use CRGA with the Answer API.");
});
async function FI(e, t) {
  const r = e.getReader();
  let n;
  for (; !(n = await r.read()).done; )
    t(n.value);
}
var kt;
(function(e) {
  e[e.NewLine = 10] = "NewLine", e[e.CarriageReturn = 13] = "CarriageReturn", e[e.Space = 32] = "Space", e[e.Colon = 58] = "Colon";
})(kt || (kt = {}));
function DI(e) {
  let t, r, n, i = !1;
  return function(o) {
    t === void 0 ? (t = o, r = 0, n = -1) : t = MI(t, o);
    const a = t.length;
    let c = 0;
    for (; r < a; ) {
      i && (t[r] === kt.NewLine && (c = ++r), i = !1);
      let u = -1;
      for (; r < a && u === -1; ++r)
        switch (t[r]) {
          case kt.Colon:
            n === -1 && (n = r - c);
            break;
          case kt.CarriageReturn:
            i = !0, u = r;
            break;
          case kt.NewLine:
            u = r;
            break;
        }
      if (u === -1)
        break;
      e(t.subarray(c, u), n), c = r, n = -1;
    }
    c === a ? t = void 0 : c !== 0 && (t = t.subarray(c), r -= c);
  };
}
function TI(e, t, r) {
  let n = wu();
  const i = new TextDecoder();
  return function(o, a) {
    if (o.length === 0)
      r == null || r(n), n = wu();
    else if (a > 0) {
      const c = i.decode(o.subarray(0, a)), u = a + (o[a + 1] === kt.Space ? 2 : 1), l = i.decode(o.subarray(u));
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
          _I(l, n, t);
          break;
      }
    }
  };
}
function _I(e, t, r) {
  const n = parseInt(e, 10);
  Number.isNaN(n) || r(t.retry = n);
}
function MI(e, t) {
  const r = new Uint8Array(e.length + t.length);
  return r.set(e), r.set(t, e.length), r;
}
function wu() {
  return {
    data: "",
    event: "",
    id: "",
    retry: void 0
  };
}
const no = "text/event-stream", PI = 1e3, bu = "last-event-id";
function Cu() {
  return typeof window < "u";
}
function UI(e, { signal: t, headers: r, onopen: n, onmessage: i, onclose: s, onerror: o, openWhenHidden: a, fetch: c, ...u }) {
  return new Promise((l, d) => {
    const p = { ...r };
    p.accept || (p.accept = no);
    let g;
    function h() {
      g == null || g.abort(), document.hidden || S();
    }
    !a && Cu() && document.addEventListener("visibilitychange", h);
    let f = PI, m;
    function C() {
      Cu() && document.removeEventListener("visibilitychange", h), clearTimeout(m), g == null || g.abort();
    }
    t == null || t.addEventListener("abort", () => {
      C(), l();
    });
    const k = c ?? fetch, b = n ?? $I;
    async function S() {
      var v;
      g = AbortController ? new AbortController() : null;
      try {
        const O = await k(e, {
          ...u,
          headers: p,
          signal: g == null ? void 0 : g.signal
        });
        await b(O), await FI(O.body, DI(TI((_) => {
          _ ? p[bu] = _ : delete p[bu];
        }, (_) => {
          f = _;
        }, i))), s == null || s(), C(), l();
      } catch (O) {
        if (!((v = g == null ? void 0 : g.signal) != null && v.aborted))
          try {
            const _ = (o == null ? void 0 : o(O)) ?? f;
            clearTimeout(m), m = setTimeout(S, _);
          } catch (_) {
            C(), d(_);
          }
      }
    }
    S();
  });
}
function $I(e) {
  const t = e.headers.get("content-type");
  if (!(t != null && t.startsWith(no)))
    throw new Error(`Expected content-type to be ${no}, Actual: ${t}`);
}
const VI = async (e, t, r) => {
  var u;
  const n = t.getState(), { accessToken: i, environment: s, organizationId: o } = n.configuration, a = n.generatedAnswer.answerConfigurationId, c = {
    ...e,
    headers: {
      ...(e == null ? void 0 : e.headers) || {},
      Authorization: `Bearer ${i}`
    }
  };
  try {
    const l = mo((u = n.configuration.search) == null ? void 0 : u.apiBaseUrl, o, s);
    return $C({
      baseUrl: `${l}/rest/organizations/${o}/answer/v1/configs/${a}`
    })(c, t, r);
  } catch (l) {
    return { error: l };
  }
}, LI = uI({
  reducerPath: "answer",
  baseQuery: QC(VI, { maxRetries: 3 }),
  endpoints: () => ({})
}), QI = (e, t) => {
  const { contentFormat: r } = t;
  e.contentFormat = r, e.isStreaming = !0, e.isLoading = !1;
}, jI = (e, t) => {
  const { textDelta: r } = t;
  if (typeof r != "string")
    return;
  const n = e.answer;
  !(n != null && n.trim()) && !r.trim() || (e.answer = n != null && n.trim() ? n.concat(r) : r);
}, NI = (e, t) => {
  e.citations = t.citations;
}, zI = (e, t) => {
  e.generated = t.answerGenerated, e.isStreaming = !1;
}, BI = (e, t) => {
  const r = t.errorMessage || "Unknown error occurred";
  e.error = {
    message: r,
    code: t.code
  }, e.isStreaming = !1, e.isLoading = !1, console.error(`Generated answer error: ${r} (code: ${t.code})`);
}, HI = (e, t, r) => {
  var s;
  const n = JSON.parse(e.data);
  n.finishReason === "ERROR" && n.errorMessage && BI(t, n);
  const i = n.payload.length ? JSON.parse(n.payload) : {};
  switch (n.payloadType) {
    case "genqa.headerMessageType":
      i.contentFormat && (QI(t, i), r(uh(i.contentFormat)));
      break;
    case "genqa.messageType":
      typeof i.textDelta == "string" && (jI(t, i), r(oh({ textDelta: i.textDelta })));
      break;
    case "genqa.citationsType":
      i.citations && (NI(t, i), r(ah({ citations: i.citations })));
      break;
    case "genqa.endOfStreamType": {
      zI(t, i);
      const o = t.answerId, a = i.answerGenerated ?? !1, c = a ? !((s = t.answer) != null && s.trim()) : void 0;
      r(Kf(a, o, c)), r(Jf());
      break;
    }
  }
}, YI = (e, t, r, n) => {
  if (!e || !t || !r)
    throw new Error("Missing required parameters for answer endpoint");
  const i = `/rest/organizations/${t}`, s = n ? `insight/v1/configs/${n}/answer` : "answer/v1/configs";
  return `${e}${i}/${s}/${r}/generate`;
}, WI = LI.injectEndpoints({
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
        const { configuration: o, generatedAnswer: a, insightConfiguration: c } = r(), { organizationId: u, environment: l, accessToken: d } = o, p = mo(o.search.apiBaseUrl, u, l), g = YI(p, u, a.answerConfigurationId, c == null ? void 0 : c.insightId);
        await UI(g, {
          method: "POST",
          body: JSON.stringify(t),
          headers: {
            Authorization: `Bearer ${d}`,
            Accept: "application/json",
            "Content-Type": "application/json",
            "Accept-Encoding": "*"
          },
          fetch,
          onopen: async (h) => {
            const f = h.headers.get("x-answer-id");
            f && i((m) => {
              m.answerId = f, s(EI(f));
            });
          },
          onmessage: (h) => {
            i((f) => {
              HI(h, f, s);
            });
          },
          onerror: (h) => {
            throw h;
          },
          onclose: () => {
            i((h) => {
              s(lh(!h.generated));
            });
          }
        });
      }
    })
  })
}), GI = (e) => WI.endpoints.getAnswer.initiate(e);
var jn = { exports: {} }, KI = jn.exports, Iu;
function JI() {
  return Iu || (Iu = 1, (function(e, t) {
    (function(r, n) {
      e.exports = n();
    })(KI, (function() {
      var r = { year: 0, month: 1, day: 2, hour: 3, minute: 4, second: 5 }, n = {};
      return function(i, s, o) {
        var a, c = function(p, g, h) {
          h === void 0 && (h = {});
          var f = new Date(p), m = (function(C, k) {
            k === void 0 && (k = {});
            var b = k.timeZoneName || "short", S = C + "|" + b, v = n[S];
            return v || (v = new Intl.DateTimeFormat("en-US", { hour12: !1, timeZone: C, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", timeZoneName: b }), n[S] = v), v;
          })(g, h);
          return m.formatToParts(f);
        }, u = function(p, g) {
          for (var h = c(p, g), f = [], m = 0; m < h.length; m += 1) {
            var C = h[m], k = C.type, b = C.value, S = r[k];
            S >= 0 && (f[S] = parseInt(b, 10));
          }
          var v = f[3], O = v === 24 ? 0 : v, _ = f[0] + "-" + f[1] + "-" + f[2] + " " + O + ":" + f[4] + ":" + f[5] + ":000", $ = +p;
          return (o.utc(_).valueOf() - ($ -= $ % 1e3)) / 6e4;
        }, l = s.prototype;
        l.tz = function(p, g) {
          p === void 0 && (p = a);
          var h, f = this.utcOffset(), m = this.toDate(), C = m.toLocaleString("en-US", { timeZone: p }), k = Math.round((m - new Date(C)) / 1e3 / 60), b = 15 * -Math.round(m.getTimezoneOffset() / 15) - k;
          if (!Number(b)) h = this.utcOffset(0, g);
          else if (h = o(C, { locale: this.$L }).$set("millisecond", this.$ms).utcOffset(b, !0), g) {
            var S = h.utcOffset();
            h = h.add(f - S, "minute");
          }
          return h.$x.$timezone = p, h;
        }, l.offsetName = function(p) {
          var g = this.$x.$timezone || o.tz.guess(), h = c(this.valueOf(), g, { timeZoneName: p }).find((function(f) {
            return f.type.toLowerCase() === "timezonename";
          }));
          return h && h.value;
        };
        var d = l.startOf;
        l.startOf = function(p, g) {
          if (!this.$x || !this.$x.$timezone) return d.call(this, p, g);
          var h = o(this.format("YYYY-MM-DD HH:mm:ss:SSS"), { locale: this.$L });
          return d.call(h, p, g).tz(this.$x.$timezone, !0);
        }, o.tz = function(p, g, h) {
          var f = h && g, m = h || g || a, C = u(+o(), m);
          if (typeof p != "string") return o(p).tz(m);
          var k = (function(O, _, $) {
            var A = O - 60 * _ * 1e3, x = u(A, $);
            if (_ === x) return [A, _];
            var I = u(A -= 60 * (x - _) * 1e3, $);
            return x === I ? [A, x] : [O - 60 * Math.min(x, I) * 1e3, Math.max(x, I)];
          })(o.utc(p, f).valueOf(), C, m), b = k[0], S = k[1], v = o(b).utcOffset(S);
          return v.$x.$timezone = m, v;
        }, o.tz.guess = function() {
          return Intl.DateTimeFormat().resolvedOptions().timeZone;
        }, o.tz.setDefault = function(p) {
          a = p;
        };
      };
    }));
  })(jn)), jn.exports;
}
var ZI = JI();
const XI = /* @__PURE__ */ zr(ZI);
var Nn = { exports: {} }, eA = Nn.exports, Au;
function tA() {
  return Au || (Au = 1, (function(e, t) {
    (function(r, n) {
      e.exports = n();
    })(eA, (function() {
      var r = "minute", n = /[+-]\d\d(?::?\d\d)?/g, i = /([+-]|\d\d)/g;
      return function(s, o, a) {
        var c = o.prototype;
        a.utc = function(f) {
          var m = { date: f, utc: !0, args: arguments };
          return new o(m);
        }, c.utc = function(f) {
          var m = a(this.toDate(), { locale: this.$L, utc: !0 });
          return f ? m.add(this.utcOffset(), r) : m;
        }, c.local = function() {
          return a(this.toDate(), { locale: this.$L, utc: !1 });
        };
        var u = c.parse;
        c.parse = function(f) {
          f.utc && (this.$u = !0), this.$utils().u(f.$offset) || (this.$offset = f.$offset), u.call(this, f);
        };
        var l = c.init;
        c.init = function() {
          if (this.$u) {
            var f = this.$d;
            this.$y = f.getUTCFullYear(), this.$M = f.getUTCMonth(), this.$D = f.getUTCDate(), this.$W = f.getUTCDay(), this.$H = f.getUTCHours(), this.$m = f.getUTCMinutes(), this.$s = f.getUTCSeconds(), this.$ms = f.getUTCMilliseconds();
          } else l.call(this);
        };
        var d = c.utcOffset;
        c.utcOffset = function(f, m) {
          var C = this.$utils().u;
          if (C(f)) return this.$u ? 0 : C(this.$offset) ? d.call(this) : this.$offset;
          if (typeof f == "string" && (f = (function(v) {
            v === void 0 && (v = "");
            var O = v.match(n);
            if (!O) return null;
            var _ = ("" + O[0]).match(i) || ["-", 0, 0], $ = _[0], A = 60 * +_[1] + +_[2];
            return A === 0 ? 0 : $ === "+" ? A : -A;
          })(f), f === null)) return this;
          var k = Math.abs(f) <= 16 ? 60 * f : f;
          if (k === 0) return this.utc(m);
          var b = this.clone();
          if (m) return b.$offset = k, b.$u = !1, b;
          var S = this.$u ? this.toDate().getTimezoneOffset() : -1 * this.utcOffset();
          return (b = this.local().add(k + S, r)).$offset = k, b.$x.$localOffset = S, b;
        };
        var p = c.format;
        c.format = function(f) {
          var m = f || (this.$u ? "YYYY-MM-DDTHH:mm:ss[Z]" : "");
          return p.call(this, m);
        }, c.valueOf = function() {
          var f = this.$utils().u(this.$offset) ? 0 : this.$offset + (this.$x.$localOffset || this.$d.getTimezoneOffset());
          return this.$d.valueOf() - 6e4 * f;
        }, c.isUTC = function() {
          return !!this.$u;
        }, c.toISOString = function() {
          return this.toDate().toISOString();
        }, c.toString = function() {
          return this.toDate().toUTCString();
        };
        var g = c.toDate;
        c.toDate = function(f) {
          return f === "s" && this.$offset ? a(this.format("YYYY-MM-DD HH:mm:ss:SSS")).toDate() : g.call(this);
        };
        var h = c.diff;
        c.diff = function(f, m, C) {
          if (f && this.$u === f.$u) return h.call(this, f, m, C);
          var k = this.local(), b = a(f).local();
          return h.call(k, b, m, C);
        };
      };
    }));
  })(Nn)), Nn.exports;
}
var rA = tA();
const nA = /* @__PURE__ */ zr(rA);
Ne.extend(nA);
Ne.extend(XI);
const iA = () => ({
  organizationId: "",
  accessToken: "",
  search: {
    locale: "en-US",
    timezone: Ne.tz.guess(),
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
}), sA = /(^|; )Coveo-Pendragon=([^;]*)/, oA = /(^|; )Coveo-SearchAgentDebug=([^;]*)/;
function aA() {
  var e;
  return typeof window > "u" ? !1 : ((e = sA.exec(document.cookie)) == null ? void 0 : e.pop()) || null;
}
function cA() {
  return typeof window > "u" ? !1 : oA.test(document.cookie);
}
se(iA(), (e) => e.addCase(_l, (t, r) => {
  uA(t, r.payload);
}).addCase(im, (t, r) => {
  lA(t, r.payload);
}).addCase(sm, (t, r) => {
  dA(t, r.payload);
}).addCase(om, (t) => {
  t.analytics.enabled = !1;
}).addCase(am, (t) => {
  t.analytics.enabled = !0;
}).addCase(cm, (t, r) => {
  t.analytics.originLevel2 = r.payload.originLevel2;
}).addCase(um, (t, r) => {
  t.analytics.originLevel3 = r.payload.originLevel3;
}).addCase(Jr, (t, r) => {
  t.analytics.originLevel2 = r.payload;
}).addCase(Ib, (t, r) => {
  t.analytics.originLevel2 = r.payload;
}).addCase(wt, (t, r) => {
  ee(r.payload.tab) || (t.analytics.originLevel2 = r.payload.tab);
}).addCase(lm, (t, { payload: r }) => {
  fA(t, r);
}));
function uA(e, t) {
  ee(t.accessToken) || (e.accessToken = t.accessToken), e.environment = t.environment ?? "prod", ee(t.organizationId) || (e.organizationId = t.organizationId);
}
function lA(e, t) {
  ee(t.proxyBaseUrl) || (e.search.apiBaseUrl = t.proxyBaseUrl), ee(t.locale) || (e.search.locale = t.locale), ee(t.timezone) || (e.search.timezone = t.timezone), ee(t.authenticationProviders) || (e.search.authenticationProviders = t.authenticationProviders);
}
function dA(e, t) {
  ee(t.enabled) || (e.analytics.enabled = t.enabled), ee(t.originContext) || (e.analytics.originContext = t.originContext), ee(t.originLevel2) || (e.analytics.originLevel2 = t.originLevel2), ee(t.originLevel3) || (e.analytics.originLevel3 = t.originLevel3), ee(t.proxyBaseUrl) || (e.analytics.apiBaseUrl = t.proxyBaseUrl), ee(t.trackingId) || (e.analytics.trackingId = t.trackingId), ee(t.analyticsMode) || (e.analytics.analyticsMode = t.analyticsMode), ee(t.source) || (e.analytics.source = t.source);
  try {
    const r = aA();
    r && (e.analytics.analyticsMode = "next", e.analytics.trackingId = r);
  } catch {
  }
  ee(t.runtimeEnvironment) || (e.analytics.runtimeEnvironment = t.runtimeEnvironment), ee(t.anonymous) || (e.analytics.anonymous = t.anonymous), ee(t.deviceId) || (e.analytics.deviceId = t.deviceId), ee(t.userDisplayName) || (e.analytics.userDisplayName = t.userDisplayName), ee(t.documentLocation) || (e.analytics.documentLocation = t.documentLocation);
}
function fA(e, t) {
  e.knowledge.agentId = t;
  try {
    cA() && (e.knowledge.debugAgentSession = !0);
  } catch {
  }
}
const hA = new Q({ required: !0 }), dh = new Q({
  required: !0,
  constrainTo: Xf
}), fh = (e) => ({
  ...e,
  name: eh(e.name)
});
w("followUpAnswers/setIsEnabled", (e) => R(e, new ie({ required: !0 })));
w("followUpAnswers/setFollowUpAnswersConversationId", (e) => R(e, j));
w("followUpAnswers/setFollowUpAnswersConversationToken", (e) => R(e, j));
w("followUpAnswers/clearFollowUpAnswersConversationToken");
w("followUpAnswers/createFollowUpAnswer", (e) => R(e, {
  question: j
}));
w("followUpAnswers/setActiveFollowUpAnswerId", (e) => R(e, j));
w("followUpAnswers/setFollowUpAnswerContentFormat", (e) => R(e, {
  contentFormat: oa,
  answerId: j
}));
w("followUpAnswers/setFollowUpIsLoading", (e) => R(e, {
  isLoading: new ie({ required: !0 }),
  answerId: j
}));
w("followUpAnswers/setFollowUpIsStreaming", (e) => R(e, {
  isStreaming: new ie({ required: !0 }),
  answerId: j
}));
w("followUpAnswers/followUpMessageChunkReceived", (e) => R(e, {
  textDelta: hA,
  answerId: j
}));
w("followUpAnswers/followUpCitationsReceived", (e) => R(e, {
  citations: new ae({
    required: !0,
    each: new z({
      values: nh
    })
  }),
  answerId: j
}));
w("followUpAnswers/followUpCompleted", (e) => R(e, {
  answerId: j,
  cannotAnswer: new ie({ required: !1 })
}));
w("followUpAnswers/followUpFailed", (e) => R(e, {
  message: new Q(),
  code: new G({ min: 0 }),
  answerId: j
}));
w("followUpAnswers/activeFollowUpStartFailed", (e) => R(e, {
  message: new Q()
}));
w("followUpAnswers/likeFollowUp", (e) => R(e, {
  answerId: j
}));
w("followUpAnswers/dislikeFollowUp", (e) => R(e, {
  answerId: j
}));
w("followUpAnswers/submitFollowUpFeedback", (e) => R(e, {
  answerId: j
}));
w("followUpAnswers/resetFollowUpAnswers");
w("followUpAnswers/stepStarted", (e) => R(fh(e), {
  answerId: j,
  name: dh,
  startedAt: new G({ min: 0, required: !0 })
}));
w("followUpAnswers/stepFinished", (e) => R(fh(e), {
  answerId: j,
  name: dh,
  finishedAt: new G({ min: 0, required: !0 })
}));
w("followUpAnswers/startToolCall", (e) => R(e, {
  answerId: j,
  toolCallName: j,
  startedAt: new G({ min: 0, required: !0 }),
  toolCallId: j
}));
w("followUpAnswers/finishToolCall", (e) => R(e, {
  answerId: j,
  finishedAt: new G({ min: 0, required: !0 }),
  toolCallId: j
}));
w("followUpAnswers/toolCallArgs", (e) => R(e, {
  answerId: j,
  toolCallId: j,
  args: new z({ options: { required: !0 } }),
  type: new Q({
    required: !0,
    constrainTo: th
  })
}));
var ut;
(function(e) {
  e[e.SseMaxDurationExceeded = 1e3] = "SseMaxDurationExceeded", e[e.SseFollowUpNotSupported = 1001] = "SseFollowUpNotSupported", e[e.ConversationNotFound = 1002] = "ConversationNotFound", e[e.SseModelsNotAvailable = 1003] = "SseModelsNotAvailable", e[e.SseInternalError = 1004] = "SseInternalError", e[e.SseTurnLimitReached = 1005] = "SseTurnLimitReached";
})(ut || (ut = {}));
ut.SseMaxDurationExceeded, ut.SseFollowUpNotSupported, ut.ConversationNotFound, ut.SseModelsNotAvailable, ut.SseInternalError, ut.SseTurnLimitReached;
var yr = { exports: {} }, vs, xu;
function pA() {
  if (xu) return vs;
  xu = 1;
  function e(r) {
    try {
      return JSON.stringify(r);
    } catch {
      return '"[Circular]"';
    }
  }
  vs = t;
  function t(r, n, i) {
    var s = i && i.stringify || e, o = 1;
    if (typeof r == "object" && r !== null) {
      var a = n.length + o;
      if (a === 1) return r;
      var c = new Array(a);
      c[0] = s(r);
      for (var u = 1; u < a; u++)
        c[u] = s(n[u]);
      return c.join(" ");
    }
    if (typeof r != "string")
      return r;
    var l = n.length;
    if (l === 0) return r;
    for (var d = "", p = 1 - o, g = -1, h = r && r.length || 0, f = 0; f < h; ) {
      if (r.charCodeAt(f) === 37 && f + 1 < h) {
        switch (g = g > -1 ? g : 0, r.charCodeAt(f + 1)) {
          case 100:
          // 'd'
          case 102:
            if (p >= l || n[p] == null) break;
            g < f && (d += r.slice(g, f)), d += Number(n[p]), g = f + 2, f++;
            break;
          case 105:
            if (p >= l || n[p] == null) break;
            g < f && (d += r.slice(g, f)), d += Math.floor(Number(n[p])), g = f + 2, f++;
            break;
          case 79:
          // 'O'
          case 111:
          // 'o'
          case 106:
            if (p >= l || n[p] === void 0) break;
            g < f && (d += r.slice(g, f));
            var m = typeof n[p];
            if (m === "string") {
              d += "'" + n[p] + "'", g = f + 2, f++;
              break;
            }
            if (m === "function") {
              d += n[p].name || "<anonymous>", g = f + 2, f++;
              break;
            }
            d += s(n[p]), g = f + 2, f++;
            break;
          case 115:
            if (p >= l)
              break;
            g < f && (d += r.slice(g, f)), d += String(n[p]), g = f + 2, f++;
            break;
          case 37:
            g < f && (d += r.slice(g, f)), d += "%", g = f + 2, f++, p--;
            break;
        }
        ++p;
      }
      ++f;
    }
    return g === -1 ? r : (g < h && (d += r.slice(g)), d);
  }
  return vs;
}
var ku;
function gA() {
  if (ku) return yr.exports;
  ku = 1;
  const e = pA();
  yr.exports = l;
  const t = F().console || {}, r = {
    mapHttpRequest: _,
    mapHttpResponse: _,
    wrapRequestSerializer: $,
    wrapResponseSerializer: $,
    wrapErrorSerializer: $,
    req: _,
    res: _,
    err: v,
    errWithCause: v
  };
  function n(y, q) {
    return y === "silent" ? 1 / 0 : q.levels.values[y];
  }
  const i = Symbol("pino.logFuncs"), s = Symbol("pino.hierarchy"), o = {
    error: "log",
    fatal: "error",
    warn: "error",
    info: "log",
    debug: "log",
    trace: "log"
  };
  function a(y, q) {
    const E = {
      logger: q,
      parent: y[s]
    };
    q[s] = E;
  }
  function c(y, q, E) {
    const T = {};
    q.forEach((L) => {
      T[L] = E[L] ? E[L] : t[L] || t[o[L] || "log"] || A;
    }), y[i] = T;
  }
  function u(y, q) {
    return Array.isArray(y) ? y.filter(function(T) {
      return T !== "!stdSerializers.err";
    }) : y === !0 ? Object.keys(q) : !1;
  }
  function l(y) {
    y = y || {}, y.browser = y.browser || {};
    const q = y.browser.transmit;
    if (q && typeof q.send != "function")
      throw Error("pino: transmit option must have a send function");
    const E = y.browser.write || t;
    y.browser.write && (y.browser.asObject = !0);
    const T = y.serializers || {}, L = u(y.browser.serialize, T);
    let N = y.browser.serialize;
    Array.isArray(y.browser.serialize) && y.browser.serialize.indexOf("!stdSerializers.err") > -1 && (N = !1);
    const J = Object.keys(y.customLevels || {}), W = ["error", "fatal", "warn", "info", "debug", "trace"].concat(J);
    typeof E == "function" && W.forEach(function(K) {
      E[K] = E;
    }), (y.enabled === !1 || y.browser.disabled) && (y.level = "silent");
    const re = y.level || "info", B = Object.create(E);
    B.log || (B.log = A), c(B, W, E), a({}, B), Object.defineProperty(B, "levelVal", {
      get: Y
    }), Object.defineProperty(B, "level", {
      get: Z,
      set: le
    });
    const X = {
      transmit: q,
      serialize: L,
      asObject: y.browser.asObject,
      asObjectBindingsOnly: y.browser.asObjectBindingsOnly,
      formatters: y.browser.formatters,
      reportCaller: y.browser.reportCaller,
      levels: W,
      timestamp: O(y),
      messageKey: y.messageKey || "msg",
      onChild: y.onChild || A
    };
    B.levels = d(y), B.level = re, B.isLevelEnabled = function(K) {
      return this.levels.values[K] ? this.levels.values[K] >= this.levels.values[this.level] : !1;
    }, B.setMaxListeners = B.getMaxListeners = B.emit = B.addListener = B.on = B.prependListener = B.once = B.prependOnceListener = B.removeListener = B.removeAllListeners = B.listeners = B.listenerCount = B.eventNames = B.write = B.flush = A, B.serializers = T, B._serialize = L, B._stdErrSerialize = N, B.child = function(...K) {
      return ce.call(this, X, ...K);
    }, q && (B._logEvent = S());
    function Y() {
      return n(this.level, this);
    }
    function Z() {
      return this._level;
    }
    function le(K) {
      if (K !== "silent" && !this.levels.values[K])
        throw Error("unknown level " + K);
      this._level = K, h(this, X, B, "error"), h(this, X, B, "fatal"), h(this, X, B, "warn"), h(this, X, B, "info"), h(this, X, B, "debug"), h(this, X, B, "trace"), J.forEach((te) => {
        h(this, X, B, te);
      });
    }
    function ce(K, te, de) {
      if (!te)
        throw new Error("missing bindings for child Pino");
      de = de || {}, L && te.serializers && (de.serializers = te.serializers);
      const he = de.serializers;
      if (L && he) {
        var Ae = Object.assign({}, T, he), ge = y.browser.serialize === !0 ? Object.keys(Ae) : L;
        delete te.serializers, k([te], ge, Ae, this._stdErrSerialize);
      }
      function Oe(Ee) {
        this._childLevel = (Ee._childLevel | 0) + 1, this.bindings = te, Ae && (this.serializers = Ae, this._serialize = ge), q && (this._logEvent = S(
          [].concat(Ee._logEvent.bindings, te)
        ));
      }
      Oe.prototype = this;
      const me = new Oe(this);
      return a(this, me), me.child = function(...Ee) {
        return ce.call(this, K, ...Ee);
      }, me.level = de.level || this.level, K.onChild(me), me;
    }
    return B;
  }
  function d(y) {
    const q = y.customLevels || {}, E = Object.assign({}, l.levels.values, q), T = Object.assign({}, l.levels.labels, p(q));
    return {
      values: E,
      labels: T
    };
  }
  function p(y) {
    const q = {};
    return Object.keys(y).forEach(function(E) {
      q[y[E]] = E;
    }), q;
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
  }, l.stdSerializers = r, l.stdTimeFunctions = Object.assign({}, { nullTime: x, epochTime: I, unixTime: D, isoTime: V });
  function g(y) {
    const q = [];
    y.bindings && q.push(y.bindings);
    let E = y[s];
    for (; E.parent; )
      E = E.parent, E.logger.bindings && q.push(E.logger.bindings);
    return q.reverse();
  }
  function h(y, q, E, T) {
    if (Object.defineProperty(y, T, {
      value: n(y.level, E) > n(T, E) ? A : E[i][T],
      writable: !0,
      enumerable: !0,
      configurable: !0
    }), y[T] === A) {
      if (!q.transmit) return;
      const N = q.transmit.level || y.level, J = n(N, E);
      if (n(T, E) < J) return;
    }
    y[T] = m(y, q, E, T);
    const L = g(y);
    L.length !== 0 && (y[T] = f(L, y[T]));
  }
  function f(y, q) {
    return function() {
      return q.apply(this, [...y, ...arguments]);
    };
  }
  function m(y, q, E, T) {
    return /* @__PURE__ */ (function(L) {
      return function() {
        const J = q.timestamp(), W = new Array(arguments.length), re = Object.getPrototypeOf && Object.getPrototypeOf(this) === t ? t : this;
        for (var B = 0; B < W.length; B++) W[B] = arguments[B];
        var X = !1;
        if (q.serialize && (k(W, this._serialize, this.serializers, this._stdErrSerialize), X = !0), q.asObject || q.formatters) {
          const Y = C(this, T, W, J, q);
          if (q.reportCaller && Y && Y.length > 0 && Y[0] && typeof Y[0] == "object")
            try {
              const Z = U();
              Z && (Y[0].caller = Z);
            } catch {
            }
          L.call(re, ...Y);
        } else {
          if (q.reportCaller)
            try {
              const Y = U();
              Y && W.push(Y);
            } catch {
            }
          L.apply(re, W);
        }
        if (q.transmit) {
          const Y = q.transmit.level || y._level, Z = n(Y, E), le = n(T, E);
          if (le < Z) return;
          b(this, {
            ts: J,
            methodLevel: T,
            methodValue: le,
            transmitValue: E.levels.values[q.transmit.level || y._level],
            send: q.transmit.send,
            val: n(y._level, E)
          }, W, X);
        }
      };
    })(y[i][T]);
  }
  function C(y, q, E, T, L) {
    const {
      level: N,
      log: J = (Y) => Y
    } = L.formatters || {}, W = E.slice();
    let re = W[0];
    const B = {};
    let X = (y._childLevel | 0) + 1;
    if (X < 1 && (X = 1), T && (B.time = T), N) {
      const Y = N(q, y.levels.values[q]);
      Object.assign(B, Y);
    } else
      B.level = y.levels.values[q];
    if (L.asObjectBindingsOnly) {
      if (re !== null && typeof re == "object")
        for (; X-- && typeof W[0] == "object"; )
          Object.assign(B, W.shift());
      return [J(B), ...W];
    } else {
      if (re !== null && typeof re == "object") {
        for (; X-- && typeof W[0] == "object"; )
          Object.assign(B, W.shift());
        re = W.length ? e(W.shift(), W) : void 0;
      } else typeof re == "string" && (re = e(W.shift(), W));
      return re !== void 0 && (B[L.messageKey] = re), [J(B)];
    }
  }
  function k(y, q, E, T) {
    for (const L in y)
      if (T && y[L] instanceof Error)
        y[L] = l.stdSerializers.err(y[L]);
      else if (typeof y[L] == "object" && !Array.isArray(y[L]) && q)
        for (const N in y[L])
          q.indexOf(N) > -1 && N in E && (y[L][N] = E[N](y[L][N]));
  }
  function b(y, q, E, T = !1) {
    const L = q.send, N = q.ts, J = q.methodLevel, W = q.methodValue, re = q.val, B = y._logEvent.bindings;
    T || k(
      E,
      y._serialize || Object.keys(y.serializers),
      y.serializers,
      y._stdErrSerialize === void 0 ? !0 : y._stdErrSerialize
    ), y._logEvent.ts = N, y._logEvent.messages = E.filter(function(X) {
      return B.indexOf(X) === -1;
    }), y._logEvent.level.label = J, y._logEvent.level.value = W, L(J, y._logEvent, re), y._logEvent = S(B);
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
    const q = {
      type: y.constructor.name,
      msg: y.message,
      stack: y.stack
    };
    for (const E in y)
      q[E] === void 0 && (q[E] = y[E]);
    return q;
  }
  function O(y) {
    return typeof y.timestamp == "function" ? y.timestamp : y.timestamp === !1 ? x : I;
  }
  function _() {
    return {};
  }
  function $(y) {
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
  function V() {
    return new Date(Date.now()).toISOString();
  }
  function F() {
    function y(q) {
      return typeof q < "u" && q;
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
  yr.exports.default = l, yr.exports.pino = l;
  function U() {
    const y = new Error().stack;
    if (!y) return null;
    const q = y.split(`
`);
    for (let E = 1; E < q.length; E++) {
      const T = q[E].trim();
      if (/(^at\s+)?(createWrap|LOG|set\s*\(|asObject|Object\.apply|Function\.apply)/.test(T) || T.indexOf("browser.js") !== -1 || T.indexOf("node:internal") !== -1 || T.indexOf("node_modules") !== -1) continue;
      let L = T.match(/\((.*?):(\d+):(\d+)\)/);
      if (L || (L = T.match(/at\s+(.*?):(\d+):(\d+)/)), L) {
        const N = L[1], J = L[2], W = L[3];
        return N + ":" + J + ":" + W;
      }
    }
    return null;
  }
  return yr.exports;
}
gA();
const mA = {
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
new yt({
  ...mA,
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
    values: Ll
  }),
  cart: new z({
    values: Cm
  }),
  proxyBaseUrl: new Q({ required: !1, url: !0 })
});
fe((e, t) => e.commerceFacetSet[t], (e) => e == null ? void 0 : e.request);
fe((e) => e.commerceSearch.facets, (e, t) => t in e.commerceFacetSet, (e, t) => t, (e, t, r) => {
  const n = e.find((i) => i.facetId === r);
  if (n && t)
    return n;
});
const nr = {
  facetId: ue,
  field: j,
  tabs: new z({
    options: {
      required: !1
    },
    values: {
      included: new ae({ each: new Q() }),
      excluded: new ae({ each: new Q() })
    }
  }),
  activeTab: new Q({ required: !1 }),
  delimitingCharacter: new Q({ required: !1, emptyAllowed: !0 }),
  filterFacetCount: new ie({ required: !1 }),
  injectionDepth: new G({ required: !1, min: 0 }),
  numberOfValues: new G({ required: !1, min: 1 }),
  sortCriteria: new Ie({ required: !1 }),
  basePath: new ae({ required: !1, each: j }),
  filterByBasePath: new ie({ required: !1 })
}, yA = w("categoryFacet/register", (e) => R(e, nr)), vA = w("categoryFacet/toggleSelectValue", (e) => {
  try {
    return ze(e.facetId, j), Ho(e.selection), { payload: e, error: null };
  } catch (t) {
    return { payload: e, error: it(t) };
  }
}), SA = w("categoryFacet/deselectAll", (e) => R(e, nr.facetId));
w("categoryFacet/updateNumberOfValues", (e) => R(e, {
  facetId: nr.facetId,
  numberOfValues: nr.numberOfValues
}));
w("categoryFacet/updateSortCriterion", (e) => R(e, {
  facetId: nr.facetId,
  criterion: new Ie()
}));
w("categoryFacet/updateBasePath", (e) => R(e, {
  facetId: nr.facetId,
  basePath: new ae({ each: j })
}));
se(Gd(), (e) => {
  e.addCase(Wr, (t, r) => ({ ...t, ...r.payload })).addCase(Pe.fulfilled, (t) => {
    t.freezeFacetOrder = !1;
  }).addCase(Pe.rejected, (t) => {
    t.freezeFacetOrder = !1;
  }).addCase(ot.fulfilled, (t, r) => {
    var n;
    return ((n = r.payload) == null ? void 0 : n.facetOptions) ?? t;
  }).addCase(yA, (t, r) => {
    const { facetId: n, tabs: i } = r.payload;
    Rn(i, t, n);
  }).addCase(ff, (t, r) => {
    const { facetId: n, tabs: i } = r.payload;
    Rn(i, t, n);
  }).addCase(kf, (t, r) => {
    const { facetId: n, tabs: i } = r.payload;
    Rn(i, t, n);
  }).addCase(Rf, (t, r) => {
    const { facetId: n, tabs: i } = r.payload;
    Rn(i, t, n);
  }).addCase(nw, (t, r) => {
    t.facets[r.payload].enabled = !0;
  }).addCase(Ei, (t, r) => {
    t.facets[r.payload].enabled = !1;
  }).addCase(wt, (t, r) => {
    [
      ...Object.keys(r.payload.f ?? {}),
      ...Object.keys(r.payload.fExcluded ?? {}),
      ...Object.keys(r.payload.cf ?? {}),
      ...Object.keys(r.payload.nf ?? {}),
      ...Object.keys(r.payload.df ?? {})
    ].forEach((n) => {
      n in t || (t.facets[n] = Wd()), t.facets[n].enabled = !0;
    });
  });
});
function Rn(e, t, r) {
  const n = {
    ...Wd(),
    tabs: e ?? {}
  };
  t.facets[r] = n;
}
const hh = w("rangeFacet/executeToggleSelect", (e) => R(e, xf(e.selection))), ph = w("rangeFacet/executeToggleExclude", (e) => R(e, xf(e.selection))), gh = {
  facetId: ue,
  selection: new z({ values: bt })
};
ne("dateFacet/executeToggleSelect", (e, { dispatch: t, extra: { validatePayload: r } }) => {
  r(e, gh), t(Lo(e)), t(hh(e)), t(Wr());
});
ne("dateFacet/executeToggleExclude", (e, { dispatch: t, extra: { validatePayload: r } }) => {
  r(e, gh), t(Qo(e)), t(ph(e)), t(Wr());
});
function Ss(e, t) {
  const r = t.payload ?? null;
  r && (e.response = ht().response, e.results = [], e.questionAnswer = Ys()), e.error = r, e.isLoading = !1;
}
function io(e, t) {
  e.error = null, e.response = t.payload.response, e.queryExecuted = t.payload.queryExecuted, e.duration = t.payload.duration, e.isLoading = !1;
}
function wA(e, t) {
  io(e, t), e.results = t.payload.response.results.map((r) => ({
    ...r,
    searchUid: t.payload.response.searchUid
  })), e.searchResponseId = t.payload.response.searchUid, e.questionAnswer = t.payload.response.questionAnswer, e.extendedResults = t.payload.response.extendedResults;
}
function Eu(e, t) {
  e.isLoading = !0, e.searchAction = t.meta.arg.next, e.requestId = t.meta.requestId;
}
function bA(e, t) {
  e.isLoading = !0, e.searchAction = { actionCause: er.browseResults }, e.requestId = t.meta.requestId;
}
se(ht(), (e) => {
  e.addCase(Pe.rejected, (t, r) => Ss(t, r)), e.addCase(os.rejected, (t, r) => Ss(t, r)), e.addCase(Vn.rejected, (t, r) => Ss(t, r)), e.addCase(Pe.fulfilled, (t, r) => {
    wA(t, r);
  }), e.addCase(os.fulfilled, (t, r) => {
    io(t, r), t.results = [
      ...t.results,
      ...r.payload.response.results.map((n) => ({
        ...n,
        searchUid: r.payload.response.searchUid
      }))
    ];
  }), e.addCase(Vn.fulfilled, (t, r) => {
    io(t, r), t.results = [
      ...r.payload.response.results.map((n) => ({
        ...n,
        searchUid: r.payload.response.searchUid
      }))
    ];
  }), e.addCase(rf.fulfilled, (t, r) => {
    t.response.facets = r.payload.response.facets, t.response.searchUid = r.payload.response.searchUid;
  }), e.addCase(Pe.pending, Eu), e.addCase(os.pending, bA), e.addCase(Vn.pending, Eu), e.addCase(Sb, (t, r) => {
    t.searchAction = r.payload;
  }), e.addCase(Xr, (t, r) => {
    t.error = r.payload, t.isLoading = !1;
  });
});
const mh = [
  "idle",
  "selected",
  "excluded"
], yh = [
  "ascending",
  "descending"
], vh = [
  "even",
  "equiprobable"
], CA = {
  start: new Q(),
  end: new Q(),
  endInclusive: new ie(),
  state: new Q({ constrainTo: mh })
};
new yt({
  facetId: af,
  field: cf,
  tabs: new z({
    options: {
      required: !1
    },
    values: {
      included: new ae({ each: new Q() }),
      excluded: new ae({ each: new Q() })
    }
  }),
  generateAutomaticRanges: df,
  filterFacetCount: uf,
  injectionDepth: lf,
  numberOfValues: $o,
  currentValues: new ae({
    each: new z({ values: CA })
  }),
  sortCriteria: new Q({ constrainTo: yh }),
  rangeAlgorithm: new Q({ constrainTo: vh })
});
const Sh = {
  facetId: ue,
  selection: new z({ values: Zr })
};
ne("numericFacet/executeToggleSelect", (e, { dispatch: t, extra: { validatePayload: r } }) => {
  r(e, Sh), t(zo(e)), t(hh(e)), t(Wr());
});
ne("numericFacet/executeToggleExclude", (e, { dispatch: t, extra: { validatePayload: r } }) => {
  r(e, Sh), t(Bo(e)), t(ph(e)), t(Wr());
});
const IA = [
  "allValues",
  "atLeastOneValue"
], AA = {
  start: new G(),
  end: new G(),
  endInclusive: new ie(),
  state: new Q({ constrainTo: mh })
};
new yt({
  facetId: af,
  tabs: new z({
    options: {
      required: !1
    },
    values: {
      included: new ae({ each: new Q() }),
      excluded: new ae({ each: new Q() })
    }
  }),
  field: cf,
  generateAutomaticRanges: df,
  filterFacetCount: uf,
  injectionDepth: lf,
  numberOfValues: $o,
  currentValues: new ae({
    each: new z({ values: AA })
  }),
  sortCriteria: new Q({ constrainTo: yh }),
  resultsMustMatch: new Q({ constrainTo: IA }),
  rangeAlgorithm: new Q({ constrainTo: vh })
});
const aa = {
  id: j
}, wh = {
  ...aa,
  query: Ue
}, xA = w("commerce/instantProducts/clearExpired", (e) => R(e, aa)), kA = {
  child: new z({
    options: { required: !0 },
    values: {
      permanentid: new Q({ required: !0 })
    }
  }),
  ...wh
}, EA = w("commerce/instantProducts/promoteChildToParent", (e) => R(e, kA)), RA = w("commerce/instantProducts/register", (e) => R(e, aa)), qA = w("commerce/instantProducts/updateQuery", (e) => R(e, wh));
function OA(e) {
  return e ? e.expiresAt && Date.now() >= e.expiresAt : !1;
}
const FA = (e, t) => {
  const { id: r } = e;
  if (!t[r])
    return t[r] = { q: "", cache: {} }, t;
}, DA = (e, t) => {
  const { q: r, id: n } = e;
  r && (t[n].q = r);
}, TA = (e, t) => {
  const { id: r } = e;
  Object.entries(t[r].cache).forEach(([n, i]) => {
    OA(i) && delete t[r].cache[n];
  });
}, _A = (e, t, r) => {
  for (const i in t)
    for (const s in t[i].cache)
      t[i].cache[s].isActive = !1;
  if (!so(e, t)) {
    UA(e, t, r);
    return;
  }
  const n = so(e, t);
  n.isLoading = !0, n.isActive = !0, n.error = null;
}, MA = (e, t, r) => {
  const { id: n, q: i, searchUid: s, cacheTimeout: o, totalCountFiltered: a, duration: c } = e;
  t[n].cache[i] = {
    ...so(e, t),
    ...r,
    isActive: !0,
    searchUid: s,
    isLoading: !1,
    error: null,
    expiresAt: o ? o + Date.now() : 0,
    totalCountFiltered: a,
    duration: c
  };
}, PA = (e, t) => {
  const { id: r, q: n, error: i } = e;
  t[r].cache[n].error = i || null, t[r].cache[n].isLoading = !1, t[r].cache[n].isActive = !1;
}, so = (e, t) => {
  const { q: r, id: n } = e;
  return t[n].cache[r] || null;
}, UA = (e, t, r) => {
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
function $A() {
  return {};
}
se($A(), (e) => {
  e.addCase(RA, (t, r) => {
    FA(r.payload, t);
  }).addCase(qA, (t, r) => {
    DA({ ...r.payload, q: r.payload.query }, t);
  }).addCase(xA, (t, r) => {
    TA(r.payload, t);
  }).addCase(Ki.pending, (t, r) => {
    _A(r.meta.arg, t, { products: [] });
  }).addCase(Ki.fulfilled, (t, r) => {
    const { response: { products: n, responseId: i, pagination: { totalEntries: s } } } = r.payload;
    MA({
      duration: 0,
      searchUid: i,
      totalCountFiltered: s,
      ...r.meta.arg
    }, t, {
      products: n.map((o, a) => VA(o, a + 1, i))
    });
  }).addCase(Ki.rejected, (t, r) => {
    PA(r.meta.arg, t);
  }).addCase(EA, (t, r) => {
    const n = t[r.payload.id].cache[r.payload.query];
    if (!n)
      return;
    const i = n.products;
    let s;
    const o = i.findIndex((g) => (s = g.children.find((h) => h.permanentid === r.payload.child.permanentid), !!s));
    if (o === -1 || s === void 0)
      return;
    const a = i[o].responseId, c = i[o].position, { children: u, totalNumberOfChildren: l } = i[o], d = {
      ...s,
      resultType: _e.PRODUCT,
      children: u,
      totalNumberOfChildren: l,
      position: c,
      responseId: a
    }, p = [...i];
    p.splice(o, 1, d), n.products = p;
  });
});
function VA(e, t, r) {
  const n = e.children.some((a) => a.permanentid === e.permanentid);
  if (e.children.length === 0 || n)
    return { ...e, position: t, responseId: r };
  const { children: i, totalNumberOfChildren: s, ...o } = e;
  return {
    ...e,
    children: [o, ...i],
    position: t,
    responseId: r
  };
}
ne("commerce/product/view", async (e, { extra: t, getState: r }) => {
  const { relay: n } = t, s = { currency: mi(r().commerceContext), product: e };
  n.emit("ec.productView", s);
});
ne("commerce/product/click", async (e, { extra: t, getState: r }) => {
  const { relay: n } = t, s = { currency: mi(r().commerceContext), ...e };
  n.emit("ec.productClick", s);
});
const LA = {
  placementIds: new ae({
    required: !1,
    min: 1,
    each: j
  }),
  productId: ve
}, QA = w("commerce/productEnrichment/registerOptions"), jA = (e, t, r) => {
  const n = Hr(t, r);
  return {
    ...n,
    context: {
      ...n.context,
      ...e.productId ? { product: { productId: e.productId } } : {}
    },
    placementIds: e.placementIds
  };
}, ws = ne("commerce/productEnrichment/fetchBadges", async (e, { getState: t, rejectWithValue: r, extra: { apiClient: n, navigatorContext: i } }) => {
  R(e, LA);
  const s = jA(e, t(), i), o = await n.getBadges(s);
  return "error" in o ? r(o.error) : {
    response: o.success
  };
});
function NA() {
  return {
    products: [],
    isLoading: !1,
    error: null,
    productId: void 0,
    placementIds: []
  };
}
se(NA(), (e) => {
  e.addCase(QA, (t, r) => {
    t.productId = r.payload.productId, t.placementIds = r.payload.placementIds ?? [];
  }).addCase(ws.pending, (t) => {
    t.isLoading = !0, t.error = null;
  }).addCase(ws.fulfilled, (t, r) => {
    BA(t), t.products = r.payload.response.products;
  }).addCase(ws.rejected, (t, r) => {
    zA(t, r.payload);
  });
});
function zA(e, t) {
  e.error = t || null, e.isLoading = !1, e.products = [];
}
function BA(e) {
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
function Ru() {
  return {};
}
se(Ru(), (e) => {
  e.addCase(Bl, (t, r) => HA(t, r.payload)).addCase(Hl, (t, r) => YA(t, r.payload)).addCase(wo, (t, r) => WA(t, r.payload)).addCase(zl, (t, r) => GA(t, r.payload)).addCase(ta, (t, r) => KA(t, r.payload)).addCase(bi, (t, r) => JA(t, r.payload)).addCase(vi, (t) => qu(t)).addCase(So, (t) => qu(t)).addCase(Si, (t, r) => ZA(t, r.payload)).addCase(Yo, (t, r) => XA(t, r.payload)).addCase(Co, (t, r) => e0(t, r)).addCase(Xo, (t, r) => t0(t, r.payload)).addCase(Zo, (t, r) => n0(t, r.payload)).addCase(xi, (t, r) => r0(t, r)).addCase(ki, (t, r) => i0(t, r)).addCase(Fi, (t, r) => s0(t, r.payload)).addCase(Di, (t, r) => o0(t, r.payload)).addCase(Jo, (t, r) => a0(t, r.payload)).addCase(Wo, (t, r) => c0(t, r.payload)).addCase(Go, (t, r) => u0(t, r.payload)).addCase(Ko, (t, r) => l0(t, r.payload)).addCase(st, Ru).addCase(or, (t, r) => (t = r.payload, t)).addCase(vt, (t, r) => (t = r.payload, t));
});
const HA = (e, t) => {
  if ((t == null ? void 0 : t.slotId) === void 0) {
    if (e.page !== void 0) {
      e.page++;
      return;
    }
    e.page = 1;
  }
}, YA = (e, t) => {
  if ((t == null ? void 0 : t.slotId) === void 0) {
    if (e.page !== void 0 && e.page > 1) {
      e.page--;
      return;
    }
    e.page = void 0;
  }
}, WA = (e, t) => {
  (t == null ? void 0 : t.slotId) === void 0 && (e.page = t.page > 0 ? t.page : void 0);
}, GA = (e, t) => {
  if ((t == null ? void 0 : t.slotId) === void 0) {
    if (e.page = void 0, t.pageSize === 0) {
      e.perPage = void 0;
      return;
    }
    e.perPage = t.pageSize;
  }
}, KA = (e, t) => {
  e.page = void 0, e.sortCriteria = t;
}, JA = (e, t) => {
  e.page = void 0;
  const { query: r } = t;
  if (r === void 0 || r.trim() === "") {
    e.q = void 0;
    return;
  }
  e.q = r;
}, qu = (e) => {
  e.page = void 0, e.cf = void 0, e.df = void 0, e.dfExcluded = void 0, e.lf = void 0, e.mnf = void 0, e.mnfExcluded = void 0, e.nf = void 0, e.nfExcluded = void 0, e.f = void 0, e.fExcluded = void 0;
}, ZA = (e, t) => {
  const { facetId: r } = t;
  e.page = void 0, e.cf && (delete e.cf[r], Object.keys(e.cf).length === 0 && delete e.cf), e.df && (delete e.df[r], Object.keys(e.df).length === 0 && delete e.df), e.dfExcluded && (delete e.dfExcluded[r], Object.keys(e.dfExcluded).length === 0 && delete e.dfExcluded), e.lf && (delete e.lf[r], Object.keys(e.lf).length === 0 && delete e.lf), e.mnf && (delete e.mnf[r], Object.keys(e.mnf).length === 0 && delete e.mnf), e.mnfExcluded && (delete e.mnfExcluded[r], Object.keys(e.mnfExcluded).length === 0 && delete e.mnfExcluded), e.nf && (delete e.nf[r], Object.keys(e.nf).length === 0 && delete e.nf), e.nfExcluded && (delete e.nfExcluded[r], Object.keys(e.nfExcluded).length === 0 && delete e.nfExcluded), e.f && (delete e.f[r], Object.keys(e.f).length === 0 && delete e.f), e.fExcluded && (delete e.fExcluded[r], Object.keys(e.fExcluded).length === 0 && delete e.fExcluded);
}, XA = (e, t) => {
  if (e.page = void 0, t.selection.state === "selected") {
    e.cf ?? (e.cf = {}), delete e.cf[t.facetId], Object.keys(e.cf).length === 0 && (e.cf = void 0);
    return;
  }
  e.cf ?? (e.cf = {}), e.cf[t.facetId] = t.selection.path;
}, e0 = (e, t) => {
  const r = t.payload;
  e.page = void 0, e.cf ?? (e.cf = {}), e.cf[r.facetId] = [...r.value.path, r.value.rawValue];
}, t0 = (e, t) => {
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
}, r0 = (e, t) => {
  const r = t.payload;
  e.page = void 0, Mt(e, "fExcluded", e.fExcluded, r.facetId, r.value.rawValue), e.f ?? (e.f = {}), e.f[r.facetId] = [
    ...e.f[r.facetId] ?? [],
    r.value.rawValue
  ];
}, n0 = (e, t) => {
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
}, i0 = (e, t) => {
  const r = t.payload;
  e.page = void 0, Mt(e, "f", e.f, r.facetId, r.value.rawValue), e.fExcluded ?? (e.fExcluded = {}), e.fExcluded[r.facetId] = [
    ...e.fExcluded[r.facetId] ?? [],
    r.value.rawValue
  ];
}, s0 = (e, t) => {
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
}, o0 = (e, t) => {
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
}, a0 = (e, t) => {
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
}, c0 = (e, t) => {
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
}, u0 = (e, t) => {
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
}, l0 = (e, t) => {
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
    const s = r[n].filter((o) => o.start !== i.start || o.end !== i.end || o.endInclusive !== i.endInclusive);
    r[n] = s, r[n].length === 0 && delete r[n], Object.keys(r).length === 0 && (e[t] = void 0);
  }
}, d0 = new G({
  min: Wv,
  default: gd,
  required: !1
}), f0 = new G({
  min: Hv,
  max: Yv,
  default: pd,
  required: !1
}), h0 = {
  desiredCount: f0,
  numberOfValues: d0
};
w("automaticFacet/setOptions", (e) => R(e, h0));
w("automaticFacet/deselectAll", (e) => R(e, ue));
const p0 = j, g0 = w("automaticFacet/toggleSelectValue", (e) => R(e, {
  field: p0,
  selection: new z({ values: lr })
}));
se(_o(), (e) => {
  e.addCase(Xw, (t, r) => {
    const n = bs(t), i = r.payload;
    t.defaultNumberOfResults = t.numberOfResults = i, t.firstResult = vr(n, i);
  }).addCase(eb, (t, r) => {
    t.numberOfResults = r.payload, t.firstResult = 0;
  }).addCase(Jr, (t) => {
    t.firstResult = 0;
  }).addCase(tb, (t, r) => {
    const n = r.payload;
    t.firstResult = vr(n, t.numberOfResults);
  }).addCase(Hd, (t, r) => {
    const n = r.payload;
    t.firstResult = vr(n, t.numberOfResults);
  }).addCase(nb, (t) => {
    const r = bs(t), n = Math.max(r - 1, iy);
    t.firstResult = vr(n, t.numberOfResults);
  }).addCase(rb, (t) => {
    const r = bs(t), n = m0(t), i = Math.min(r + 1, n);
    t.firstResult = vr(i, t.numberOfResults);
  }).addCase(ot.fulfilled, (t, r) => {
    r.payload && (t.numberOfResults = r.payload.pagination.numberOfResults, t.firstResult = r.payload.pagination.firstResult);
  }).addCase(wt, (t, r) => {
    t.firstResult = r.payload.firstResult ?? t.firstResult, t.numberOfResults = r.payload.numberOfResults ?? t.defaultNumberOfResults;
  }).addCase(Pe.fulfilled, (t, r) => {
    const { response: n } = r.payload;
    t.totalCountFiltered = n.totalCountFiltered;
  }).addCase(Vn.fulfilled, (t, r) => {
    const { response: n } = r.payload;
    t.totalCountFiltered = n.totalCountFiltered;
  }).addCase(Oi, (t) => {
    xe(t);
  }).addCase(Qo, (t) => {
    xe(t);
  }).addCase(pf, (t) => {
    xe(t);
  }).addCase(Bo, (t) => {
    xe(t);
  }).addCase(ki, (t) => {
    xe(t);
  }).addCase(hf, (t) => {
    xe(t);
  }).addCase(SA, (t) => {
    xe(t);
  }).addCase(vA, (t) => {
    xe(t);
  }).addCase(Co, (t) => {
    xe(t);
  }).addCase(Lo, (t) => {
    xe(t);
  }).addCase(zo, (t) => {
    xe(t);
  }).addCase(Yr, (t) => {
    xe(t);
  }).addCase(Ef, (t) => {
    xe(t);
  }).addCase(qf, (t) => {
    xe(t);
  }).addCase(xi, (t) => {
    xe(t);
  }).addCase(g0, (t) => {
    xe(t);
  });
});
function xe(e) {
  e.firstResult = _o().firstResult;
}
function bs(e) {
  const { firstResult: t, numberOfResults: r } = e;
  return y0(t, r);
}
function m0(e) {
  const { totalCountFiltered: t, numberOfResults: r } = e;
  return v0(t, r);
}
function vr(e, t) {
  return (e - 1) * t;
}
function y0(e, t) {
  return Math.round(e / t) + 1;
}
function v0(e, t) {
  const r = Math.min(e, _r);
  return Math.ceil(r / t);
}
new yt({
  parameters: new z({
    options: { required: !0 },
    values: of
  })
});
new yt({
  fragment: new Q()
});
fe((e) => e.productListing.facets, (e, t) => t in e.commerceFacetSet, (e, t) => t, (e, t, r) => {
  const n = e.find((i) => i.facetId === r);
  if (n && t)
    return n;
});
const bh = {
  queries: new ae({
    required: !0,
    each: new Q({ emptyAllowed: !1 })
  }),
  maxLength: new G({ required: !0, min: 1, default: 10 })
}, S0 = w("recentQueries/registerRecentQueries", (e) => R(e, bh)), w0 = w("recentQueries/clearRecentQueries"), b0 = w("commerce/recentQueries/clear"), C0 = w("commerce/recentQueries/register", (e) => R(e, bh));
function Ch() {
  return {
    queries: [],
    maxLength: 10
  };
}
se(Ch(), (e) => {
  e.addCase(S0, Ih).addCase(w0, Ah).addCase(Pe.fulfilled, (t, r) => {
    const n = r.payload.queryExecuted, i = r.payload.response.results;
    !n.length || !i.length || xh(n, t);
  });
});
function Ih(e, t) {
  e.queries = Array.from(new Set(t.payload.queries.map((r) => r.trim().toLowerCase()))).slice(0, t.payload.maxLength), e.maxLength = t.payload.maxLength;
}
function Ah(e) {
  e.queries = [];
}
function xh(e, t) {
  const r = e.trim().toLowerCase();
  if (r === "")
    return;
  const n = Array.from(new Set(t.queries.filter((i) => i.trim().toLowerCase() !== r))).slice(0, t.maxLength - 1);
  t.queries = [r, ...n];
}
se(Ch(), (e) => {
  e.addCase(C0, Ih).addCase(b0, Ah).addCase(Re.fulfilled, (t, r) => {
    const n = r.payload.queryExecuted, i = r.payload.response.products;
    !n.length || !i.length || xh(n, t);
  });
});
const $i = {
  id: j,
  query: Ue
}, I0 = w("querySet/register", (e) => R(e, $i)), A0 = w("querySet/update", (e) => R(e, $i)), x0 = w("commerce/querySet/register", (e) => R(e, $i)), k0 = w("commerce/querySet/update", (e) => R(e, $i));
se(Mo(), (e) => {
  e.addCase(x0, (t, r) => R0(t, r.payload)).addCase(k0, (t, r) => {
    const { id: n, query: i } = r.payload;
    Ou(t, n, i);
  }).addCase(Md, (t, r) => {
    const { id: n, expression: i } = r.payload;
    Ou(t, n, i);
  }).addCase(Re.fulfilled, (t, r) => {
    const { queryExecuted: n } = r.payload;
    kh(t, n);
  }).addCase(vt, E0);
});
function E0(e, t) {
  ee(t.payload.q) || kh(e, t.payload.q);
}
function kh(e, t) {
  Object.keys(e).forEach((r) => {
    e[r] = t;
  });
}
const Ou = (e, t, r) => {
  t in e && (e[t] = r);
}, R0 = (e, t) => {
  const { id: r, query: n } = t;
  r in e || (e[r] = n);
};
function Eh(e, t) {
  const r = t.id;
  r in e || (e[r] = q0(t));
}
function Rh(e, t) {
  const r = e[t.meta.arg.id];
  r && (r.currentRequestId = t.meta.requestId, r.isLoading = !0);
}
function qh(e, t) {
  const r = e[t.meta.arg.id];
  r && (r.error = t.payload || null, r.isLoading = !1);
}
function Oh(e, t) {
  const r = e[t.id];
  r && (r.responseId = "", r.completions = [], r.partialQueries = []);
}
function q0(e) {
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
const Fh = () => ({});
se(Fh(), (e) => e.addCase(YS, (t, r) => {
  Eh(t, r.payload);
}).addCase(Rt.pending, Rh).addCase(Rt.fulfilled, (t, r) => {
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
}).addCase(Rt.rejected, qh).addCase(HS, (t, r) => {
  Oh(t, r.payload);
}));
const tn = {
  id: j
}, O0 = w("querySuggest/register", (e) => R(e, {
  ...tn,
  count: new G({ min: 0 })
})), F0 = w("querySuggest/unregister", (e) => R(e, tn)), Dh = w("querySuggest/selectSuggestion", (e) => R(e, {
  ...tn,
  expression: Ue
})), D0 = w("querySuggest/clear", (e) => R(e, tn)), Cs = ne("querySuggest/fetch", async (e, { getState: t, rejectWithValue: r, extra: { apiClient: n, validatePayload: i, navigatorContext: s } }) => {
  i(e, tn);
  const o = e.id, a = await T0(o, t(), s), c = await n.querySuggest(a);
  return pt(c) ? r(c.error) : {
    id: o,
    q: a.q,
    ...c.success
  };
}), T0 = async (e, t, r) => ({
  accessToken: t.configuration.accessToken,
  organizationId: t.configuration.organizationId,
  url: t.configuration.search.apiBaseUrl ?? sr(t.configuration.organizationId, t.configuration.environment),
  count: t.querySuggest[e].count,
  q: t.querySet[e],
  locale: t.configuration.search.locale,
  timezone: t.configuration.search.timezone,
  actionsHistory: t.configuration.analytics.enabled ? cr.getInstance().getHistory() : [],
  ...t.context && { context: t.context.contextValues },
  ...t.pipeline && { pipeline: t.pipeline },
  ...t.searchHub && { searchHub: t.searchHub },
  tab: t.configuration.analytics.originLevel2,
  ...t.configuration.analytics.enabled && {
    ...t.configuration.analytics.enabled && t.configuration.analytics.analyticsMode === "legacy" ? await qo(t.configuration.analytics) : Ii(t.configuration.analytics, r)
  },
  ...t.configuration.search.authenticationProviders.length && {
    authentication: t.configuration.search.authenticationProviders.join(",")
  }
});
se(ur(), (e) => e.addCase(qi, (t, r) => ({ ...t, ...r.payload })).addCase(To, (t, r) => {
  t.q = r.payload;
}).addCase(Dh, (t, r) => {
  t.q = r.payload.expression;
}).addCase(ot.fulfilled, (t, r) => {
  var n;
  return ((n = r.payload) == null ? void 0 : n.query) ?? t;
}).addCase(wt, (t, r) => {
  t.q = r.payload.q ?? t.q, t.enableQuerySyntax = r.payload.enableQuerySyntax ?? t.enableQuerySyntax;
}));
se(Mo(), (e) => {
  e.addCase(I0, (t, r) => M0(t, r.payload)).addCase(A0, (t, r) => {
    const { id: n, query: i } = r.payload;
    Is(t, n, i);
  }).addCase(Dh, (t, r) => {
    const { id: n, expression: i } = r.payload;
    Is(t, n, i);
  }).addCase(Pe.fulfilled, (t, r) => {
    const { queryExecuted: n } = r.payload;
    Th(t, n);
  }).addCase(wt, _0).addCase(ot.fulfilled, (t, r) => {
    if (r.payload)
      for (const [n, i] of Object.entries(r.payload.querySet))
        Is(t, n, i);
  });
});
function _0(e, t) {
  ee(t.payload.q) || Th(e, t.payload.q);
}
function Th(e, t) {
  Object.keys(e).forEach((r) => {
    e[r] = t;
  });
}
const Is = (e, t, r) => {
  t in e && (e[t] = r);
}, M0 = (e, t) => {
  const { id: r, query: n } = t;
  r in e || (e[r] = n);
};
se(Fh(), (e) => e.addCase(O0, (t, r) => {
  Eh(t, r.payload);
}).addCase(F0, (t, r) => {
  delete t[r.payload.id];
}).addCase(Cs.pending, Rh).addCase(Cs.fulfilled, (t, r) => {
  const n = t[r.meta.arg.id];
  if (!n || r.meta.requestId !== n.currentRequestId)
    return;
  const { q: i } = r.payload;
  i && n.partialQueries.push(i.replace(/;/, encodeURIComponent(";"))), n.responseId = r.payload.responseId, n.completions = r.payload.completions, n.isLoading = !1, n.error = null;
}).addCase(Cs.rejected, qh).addCase(D0, (t, r) => {
  Oh(t, r.payload);
}).addCase(Xr, (t, r) => {
  Object.keys(t).forEach((n) => {
    const i = t[n];
    i && (i.error = r.payload, i.isLoading = !1);
  });
}));
const As = {
  open: new Q(),
  close: new Q()
}, P0 = {
  id: j,
  highlightOptions: new z({
    values: {
      notMatchDelimiters: new z({
        values: As
      }),
      exactMatchDelimiters: new z({
        values: As
      }),
      correctionDelimiters: new z({
        values: As
      })
    }
  }),
  clearFilters: new ie()
}, { id: U0, highlightOptions: $0, clearFilters: V0 } = P0, L0 = {
  id: U0,
  highlightOptions: $0,
  clearFilters: V0,
  enableResults: new ie()
}, Q0 = (e, t) => {
  const r = Hr(e, t);
  return {
    ...r,
    context: {
      ...r.context,
      capture: !1
    },
    query: e.commerceQuery.query
  };
}, xs = ne("commerce/standaloneSearchBox/fetchRedirect", async (e, { getState: t, rejectWithValue: r, extra: { apiClient: n, navigatorContext: i } }) => {
  R(e, { id: new Q({ emptyAllowed: !1 }) });
  const s = t(), o = Q0(s, i), a = await n.plan(o);
  return je(a) ? r(a.error) : a.success.redirect || "";
}), j0 = w("commerce/standaloneSearchBox/register", (e) => R(e, {
  id: j,
  redirectionUrl: j,
  overwrite: new ie({ required: !1 })
})), N0 = w("commerce/standaloneSearchBox/updateRedirectionUrl", (e) => R(e, {
  id: j,
  redirectionUrl: j
})), z0 = w("commerce/standaloneSearchBox/reset", (e) => R(e, {
  id: j
}));
function B0() {
  return {};
}
se(B0(), (e) => e.addCase(j0, (t, r) => {
  const { id: n, redirectionUrl: i, overwrite: s } = r.payload;
  !s && n in t || (t[n] = Fu(i));
}).addCase(N0, (t, r) => {
  const { id: n, redirectionUrl: i } = r.payload, s = t[n];
  s && (s.defaultRedirectionUrl = i);
}).addCase(z0, (t, r) => {
  const { id: n } = r.payload, i = t[n];
  if (i) {
    t[n] = Fu(i.defaultRedirectionUrl);
    return;
  }
}).addCase(xs.pending, (t, r) => {
  const n = t[r.meta.arg.id];
  n && (n.isLoading = !0);
}).addCase(xs.fulfilled, (t, r) => {
  const n = r.payload, i = t[r.meta.arg.id];
  i && (i.redirectTo = n || i.defaultRedirectionUrl, i.isLoading = !1);
}).addCase(xs.rejected, (t, r) => {
  const n = t[r.meta.arg.id];
  n && (n.isLoading = !1);
}));
function Fu(e) {
  return {
    defaultRedirectionUrl: e,
    redirectTo: "",
    isLoading: !1
  };
}
new yt({
  ...L0,
  redirectionUrl: new Q({
    required: !0,
    emptyAllowed: !1
  }),
  overwrite: new ie({
    required: !1
  })
});
const Vi = (e, t) => {
  const r = e;
  return ee(r[t]) ? ee(e.additionalFields[t]) ? null : e.additionalFields[t] : r[t];
}, H0 = (e) => (t) => e.every((r) => !ee(Vi(t, r))), Y0 = (e) => (t) => e.every((r) => ee(Vi(t, r))), W0 = (e, t) => (r) => {
  const n = _h(e, r);
  return t.some((i) => n.some((s) => `${s}`.toLowerCase() === i.toLowerCase()));
}, G0 = (e, t) => (r) => {
  const n = _h(e, r);
  return t.every((i) => n.every((s) => `${s}`.toLowerCase() !== i.toLowerCase()));
}, _h = (e, t) => {
  const r = Vi(t, e);
  return nl(r) ? r : [r];
}, ca = {
  getProductProperty: Vi,
  fieldsMustBeDefined: H0,
  fieldsMustNotBeDefined: Y0,
  fieldMustMatch: W0,
  fieldMustNotMatch: G0
};
function K0(e) {
  return e.type === "redirect";
}
class J0 {
  constructor(t) {
    H(this, "response");
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
    const t = this.response.preprocessingOutput.triggers.filter(K0);
    return t.length ? t[0].content : null;
  }
}
const Z0 = w("standaloneSearchBox/register", (e) => R(e, {
  id: j,
  redirectionUrl: j,
  overwrite: new ie({ required: !1 })
})), X0 = w("standaloneSearchBox/updateRedirectionUrl", (e) => R(e, {
  id: j,
  redirectionUrl: j
})), ex = w("standaloneSearchBox/reset", (e) => R(e, {
  id: j
})), tx = w("standaloneSearchBox/updateAnalyticsToSearchFromLink", (e) => R(e, { id: j })), rx = w("standaloneSearchBox/updateAnalyticsToOmniboxFromLink"), ks = ne("standaloneSearchBox/fetchRedirect", async (e, { dispatch: t, getState: r, rejectWithValue: n, extra: { apiClient: i, validatePayload: s, navigatorContext: o } }) => {
  s(e, { id: new Q({ emptyAllowed: !1 }) });
  const a = await ix(r(), o), c = await i.plan(a);
  if (pt(c))
    return n(c.error);
  const { redirectionUrl: u } = new J0(c.success);
  return u && t(nx(u)), u || "";
}), nx = (e) => St("analytics/standaloneSearchBox/redirect", (t) => t.makeTriggerRedirect({ redirectedTo: e })), ix = async (e, t) => ({
  accessToken: e.configuration.accessToken,
  organizationId: e.configuration.organizationId,
  url: e.configuration.search.apiBaseUrl ?? sr(e.configuration.organizationId, e.configuration.environment),
  locale: e.configuration.search.locale,
  timezone: e.configuration.search.timezone,
  q: e.query.q,
  ...e.context && { context: e.context.contextValues },
  ...e.pipeline && { pipeline: e.pipeline },
  ...e.searchHub && { searchHub: e.searchHub },
  ...e.query.enableQuerySyntax !== void 0 && {
    enableQuerySyntax: e.query.enableQuerySyntax
  },
  ...e.configuration.analytics.enabled && e.configuration.analytics.analyticsMode === "legacy" ? await qo(e.configuration.analytics) : Ii(e.configuration.analytics, t),
  ...e.configuration.search.authenticationProviders.length && {
    authentication: e.configuration.search.authenticationProviders.join(",")
  }
});
function sx() {
  return {};
}
se(sx(), (e) => e.addCase(Z0, (t, r) => {
  const { id: n, redirectionUrl: i, overwrite: s } = r.payload;
  !s && n in t || (t[n] = Es(i));
}).addCase(ex, (t, r) => {
  const { id: n } = r.payload, i = t[n];
  if (i) {
    t[n] = Es(i.defaultRedirectionUrl);
    return;
  }
}).addCase(X0, (t, r) => {
  const { id: n, redirectionUrl: i } = r.payload;
  n in t && (t[n] = Es(i));
}).addCase(ks.pending, (t, r) => {
  const n = t[r.meta.arg.id];
  n && (n.isLoading = !0);
}).addCase(ks.fulfilled, (t, r) => {
  const n = r.payload, i = t[r.meta.arg.id];
  i && (i.redirectTo = n || i.defaultRedirectionUrl, i.isLoading = !1);
}).addCase(ks.rejected, (t, r) => {
  const n = t[r.meta.arg.id];
  n && (n.isLoading = !1);
}).addCase(tx, (t, r) => {
  const n = t[r.payload.id];
  n && (n.analytics.cause = "searchFromLink");
}).addCase(rx, (t, r) => {
  const n = t[r.payload.id];
  n && (n.analytics.cause = "omniboxFromLink", n.analytics.metadata = r.payload.metadata);
}));
function Es(e) {
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
const Du = "demo-product-color-swatches", ox = "swatch_hex", ax = 5, cx = 3, ux = "atomic/resolveResult", lx = "atomic/selectChildProduct";
function Tu(e, t) {
  return new CustomEvent(e, {
    detail: t,
    bubbles: !0,
    cancelable: !0,
    composed: !0
  });
}
function _u(e) {
  return e.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}
function Mh(e) {
  if (Array.isArray(e)) {
    for (const n of e) {
      const i = Mh(n);
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
function Ph(e, t) {
  return ca.getProductProperty(e, t);
}
function Mu(e, t) {
  return t ? Mh(Ph(e, t)) : null;
}
function dx(e) {
  var r;
  const t = Ph(e, "ec_color");
  return typeof t == "string" && t.trim() ? t.trim() : ((r = e.ec_name) == null ? void 0 : r.trim()) || "Color option";
}
function Pu(e) {
  const t = /* @__PURE__ */ new Set(), r = [];
  for (const n of e)
    !n.permanentid || t.has(n.permanentid) || (t.add(n.permanentid), r.push(n));
  return r;
}
function fx(e) {
  const t = e.children ?? [];
  return t.length > 0 ? Pu(t) : Pu([e]);
}
class hx extends HTMLElement {
  constructor() {
    super(...arguments);
    H(this, "shadow", this.attachShadow({ mode: "open" }));
    H(this, "activeSwatchColor", "");
    H(this, "currentProduct", null);
    H(this, "swatches", []);
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
    return ((r = this.getAttribute("field")) == null ? void 0 : r.trim()) || ((n = this.getAttribute("swatch-field")) == null ? void 0 : n.trim()) || ox;
  }
  get maxVisible() {
    const r = Number.parseInt(this.getAttribute("max-visible") ?? "", 10);
    return Number.isFinite(r) && r > 0 ? r : ax;
  }
  resolveProductContext() {
    let r = null;
    return this.dispatchEvent(
      Tu(ux, (n) => {
        r = n;
      })
    ), r;
  }
  buildSwatchItems(r) {
    const n = fx(r), i = /* @__PURE__ */ new Map();
    for (const s of n) {
      const o = Mu(s, this.field);
      !o || i.has(o) || i.set(o, {
        child: s,
        color: o,
        label: dx(s)
      });
    }
    return [...i.values()];
  }
  refresh(r = 0) {
    const n = this.resolveProductContext();
    if (!n) {
      if (r + 1 < cx) {
        queueMicrotask(() => this.refresh(r + 1));
        return;
      }
      this.hidden = !0, this.currentProduct = null, this.swatches = [], this.activeSwatchColor = "", this.shadow.replaceChildren();
      return;
    }
    if (this.currentProduct = n, this.activeSwatchColor = Mu(n, this.field) ?? "", this.swatches = this.buildSwatchItems(n), this.swatches.length <= 1) {
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
      Tu(lx, {
        child: n.child
      })
    ));
  }
  bindSwatchEvents() {
    const r = this.shadow.querySelectorAll("button[data-child-id]"), n = this.shadow.querySelector('button[data-action="open-product-page"]');
    for (const i of r) {
      const s = i.dataset.childId;
      s && (i.addEventListener("mouseenter", () => this.selectChild(s)), i.addEventListener("focus", () => this.selectChild(s)), i.addEventListener("touchstart", (o) => {
        o.preventDefault(), o.stopPropagation(), this.selectChild(s);
      }), i.addEventListener("click", (o) => {
        o.preventDefault(), o.stopPropagation(), this.selectChild(s);
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
      const s = _u(i.child.permanentid), o = _u(i.label), a = i.color === this.activeSwatchColor;
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
customElements.get(Du) || customElements.define(Du, hx);
const Uu = "demo-product-size-selector", px = "ec_size", gx = "swatch_hex", mx = "ADD TO BAG:", $u = "Add to bag", yx = "default title", vx = 3, Sx = "atomic/resolveResult", wx = ["xxs", "xs", "s", "m", "l", "xl", "xxl"], bx = new Map(
  wx.map((e, t) => [e, t])
);
function Cx(e, t) {
  return new CustomEvent(e, {
    detail: t,
    bubbles: !0,
    cancelable: !0,
    composed: !0
  });
}
function ct(e) {
  return e.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}
function ua(e) {
  if (Array.isArray(e)) {
    for (const r of e) {
      const n = ua(r);
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
function Vu(e) {
  return !!(e && e.trim() && e.trim().toLowerCase() !== yx);
}
function Lu(e) {
  return bx.get(e.trim().toLowerCase()) ?? Number.POSITIVE_INFINITY;
}
function Ix(e) {
  const t = ua(e);
  if (!t)
    return null;
  const r = t.match(/^#?([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i);
  return r ? `#${r[1]}` : null;
}
function Uh(e, t) {
  return ca.getProductProperty(e, t);
}
function Qu(e, t) {
  return t ? ua(Uh(e, t)) : null;
}
function ju(e, t) {
  return t ? Ix(Uh(e, t)) : null;
}
function Nu(e) {
  const t = /* @__PURE__ */ new Set(), r = [];
  for (const n of e)
    !n.permanentid || t.has(n.permanentid) || (t.add(n.permanentid), r.push(n));
  return r;
}
function Ax(e) {
  const t = e.children ?? [];
  return t.length > 0 ? Nu(t) : Nu([e]);
}
function xx(e) {
  const t = e.ec_promo_price;
  if (typeof t == "number")
    return t;
  const r = e.ec_price;
  return typeof r == "number" ? r : void 0;
}
class kx extends HTMLElement {
  constructor() {
    super(...arguments);
    H(this, "shadow", this.attachShadow({ mode: "open" }));
    H(this, "currentProduct", null);
    H(this, "sizes", []);
    H(this, "selectedSizeKey", "");
    H(this, "addToBagChild", null);
    H(this, "hoverTarget", null);
    H(this, "removeVisibilityBindings", null);
    H(this, "restoreOverlayContainerPosition", null);
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
    return ((r = this.getAttribute("field")) == null ? void 0 : r.trim()) || ((n = this.getAttribute("size-field")) == null ? void 0 : n.trim()) || px;
  }
  get swatchField() {
    var r;
    return ((r = this.getAttribute("swatch-field")) == null ? void 0 : r.trim()) || gx;
  }
  get label() {
    var r;
    return ((r = this.getAttribute("label")) == null ? void 0 : r.trim()) || mx;
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
      const o = s == null ? void 0 : s.relatedTarget;
      o instanceof Node && r.contains(o) || this.setOverlayVisible(!1);
    };
    r.addEventListener("mouseenter", n), r.addEventListener("mouseleave", i), r.addEventListener("focusin", n), r.addEventListener("focusout", i), r.addEventListener("touchstart", n, { passive: !0 }), this.removeVisibilityBindings = () => {
      r.removeEventListener("mouseenter", n), r.removeEventListener("mouseleave", i), r.removeEventListener("focusin", n), r.removeEventListener("focusout", i), r.removeEventListener("touchstart", n);
    };
  }
  resolveProductContext() {
    let r = null;
    return this.dispatchEvent(
      Cx(Sx, (n) => {
        r = n;
      })
    ), r;
  }
  getActiveSwatchProducts(r) {
    const n = ju(r, this.swatchField), i = Ax(r);
    if (!n)
      return i;
    const s = i.filter(
      (o) => ju(o, this.swatchField) === n
    );
    return s.length > 0 ? s : i;
  }
  buildSizeItems(r) {
    const n = [], i = /* @__PURE__ */ new Set();
    let s = 0;
    for (const o of r) {
      const a = Qu(o, this.field);
      if (!Vu(a))
        continue;
      const c = a.toLowerCase();
      i.has(c) || (i.add(c), n.push({
        child: o,
        discoveryIndex: s,
        key: c,
        label: a
      }), s += 1);
    }
    return n.sort((o, a) => {
      const c = Lu(o.label), u = Lu(a.label);
      return c !== u ? c - u : o.discoveryIndex - a.discoveryIndex;
    });
  }
  refresh(r = 0) {
    var a, c;
    const n = this.resolveProductContext();
    if (!n) {
      if (r + 1 < vx) {
        queueMicrotask(() => this.refresh(r + 1));
        return;
      }
      this.hidden = !0, this.currentProduct = null, this.sizes = [], this.selectedSizeKey = "", this.shadow.replaceChildren();
      return;
    }
    this.currentProduct = n;
    const i = this.getActiveSwatchProducts(n);
    this.sizes = this.buildSizeItems(i), this.addToBagChild = i[0] ?? null;
    const s = Qu(n, this.field), o = Vu(s) ? s.toLowerCase() : "";
    if (this.selectedSizeKey = ((a = this.sizes.find((u) => u.key === o)) == null ? void 0 : a.key) || ((c = this.sizes[0]) == null ? void 0 : c.key) || "", this.sizes.length === 0 && !this.addToBagChild) {
      this.hidden = !0, this.removeAttribute("data-has-sizes"), this.addToBagChild = null, this.shadow.replaceChildren();
      return;
    }
    this.hidden = !1, this.toggleAttribute("data-has-sizes", this.sizes.length > 0), this.render();
  }
  createDataLayerPayload(r, n) {
    var a;
    const i = xx(r), s = [r.ec_color, n].filter(Boolean).join(" / ") || r.ec_name || r.permanentid;
    return {
      event: "add_to_cart",
      ecommerce: {
        items: [{
          item_id: r.ec_product_id || r.permanentid,
          item_name: r.ec_name || ((a = this.currentProduct) == null ? void 0 : a.ec_name) || r.permanentid,
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
    const n = this.sizes.find((o) => o.key === r);
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
      s && i.addEventListener("click", (o) => {
        o.preventDefault(), o.stopPropagation(), this.handleSizeClick(s);
      });
    }
    n == null || n.addEventListener("click", (i) => {
      i.preventDefault(), i.stopPropagation(), this.handleAddToBagClick();
    });
  }
  render() {
    var n, i;
    const r = (i = (n = this.addToBagChild) == null ? void 0 : n.ec_name) != null && i.trim() ? `Add ${this.addToBagChild.ec_name.trim()} to bag` : $u;
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
              <div class="label">${ct(this.label)}</div>
              <div class="sizes" role="list">
                ${this.sizes.map((s) => {
      const o = s.key === this.selectedSizeKey;
      return `
                      <button
                        type="button"
                        class="size${o ? " size-active" : ""}"
                        data-size-key="${ct(s.key)}"
                        aria-label="Add size ${ct(s.label)} to bag"
                        aria-pressed="${String(o)}"
                        title="Add size ${ct(s.label)} to bag"
                      >${ct(s.label)}</button>
                    `;
    }).join("")}
              </div>
            ` : `
              <button
                type="button"
                class="cta-button"
                data-action="add-to-bag"
                aria-label="${ct(r)}"
                title="${ct(r)}"
              >${ct($u)}</button>
            `}
      </div>
    `, this.bindSizeEvents();
  }
}
customElements.get(Uu) || customElements.define(Uu, kx);
const fr = "style_group_siblings", oo = "demo/selectSiblingProduct", Ex = "atomic/resolveResult";
function be(e) {
  return typeof e == "string" || typeof e == "number" ? `${e}`.trim() : "";
}
function Rx(e) {
  return Array.isArray(e) ? e.map(be).filter(Boolean) : [];
}
function qx(e) {
  const t = typeof e == "number" ? e : Number.parseFloat(be(e));
  return Number.isFinite(t) ? t : void 0;
}
function $h(e) {
  const t = be(e).match(/^#?([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i);
  return t ? `#${t[1]}` : "";
}
function Ox(e) {
  if (!e || typeof e != "object" || Array.isArray(e))
    return null;
  const t = e, r = be(t.variantId), n = be(t.sku), i = be(t.size);
  if (!r && !n)
    return null;
  const s = {
    variantId: r,
    sku: n,
    size: i
  }, o = qx(t.price);
  return o !== void 0 && (s.price = o), s;
}
function Fx(e) {
  if (!e || typeof e != "object" || Array.isArray(e))
    return null;
  const t = e, r = be(t.productId), n = be(t.handle);
  return !r && !n ? null : {
    productId: r,
    handle: n,
    title: be(t.title),
    images: Rx(t.images),
    variants: Array.isArray(t.variants) ? t.variants.map(Ox).filter((i) => !!i) : [],
    colourName: be(t.colourName),
    colourCode: be(t.colourCode),
    swatchHex: $h(t.swatchHex),
    styleCode: be(t.styleCode)
  };
}
function zu(e) {
  if (typeof e == "string")
    try {
      const t = JSON.parse(e);
      return Array.isArray(t) ? t : [];
    } catch {
      return [];
    }
  return Array.isArray(e) && e.some((t) => typeof t == "object") ? e : [];
}
function la(e, t) {
  return ca.getProductProperty(e, t);
}
function rn(e, t = fr) {
  const r = la(e, t), n = Array.isArray(r) && r.every((s) => typeof s == "string") ? r.flatMap(zu) : zu(r), i = /* @__PURE__ */ new Set();
  return n.reduce((s, o) => {
    const a = Fx(o), c = a ? a.productId || a.handle : "";
    return !a || !c || i.has(c) || (i.add(c), s.push(a)), s;
  }, []);
}
function ao(e) {
  const t = be(e).toLowerCase();
  return t.split("/").filter(Boolean).at(-1) ?? t;
}
function Dx(e) {
  const t = e.match(/\/products\/([^/?#]+)/i);
  return t != null && t[1] ? decodeURIComponent(t[1]).toLowerCase() : "";
}
function Rs(e, t) {
  for (const r of t) {
    const n = la(e, r), i = Array.isArray(n) ? n.map(be).find(Boolean) ?? "" : be(n);
    if (i)
      return i;
  }
  return "";
}
function nn(e, t) {
  if (t.length === 0)
    return null;
  const r = [e.ec_product_id, e.permanentid].map(ao).filter(Boolean), n = t.find((d) => r.includes(ao(d.productId)));
  if (n)
    return n;
  const i = Dx(e.clickUri ?? ""), s = t.find((d) => d.handle.toLowerCase() === i);
  if (s)
    return s;
  const o = Rs(e, ["colour_code"]).toLowerCase(), a = t.find((d) => d.colourCode.toLowerCase() === o);
  if (o && a)
    return a;
  const c = $h(Rs(e, ["swatch_hex"])).toLowerCase(), u = t.find((d) => d.swatchHex.toLowerCase() === c);
  if (c && u)
    return u;
  const l = Rs(e, ["colour_name", "ec_color"]).toLowerCase();
  return t.find((d) => d.colourName.toLowerCase() === l) ?? t[0] ?? null;
}
function sn(e) {
  let t = null;
  return e.dispatchEvent(
    new CustomEvent(Ex, {
      detail: (r) => {
        t = r;
      },
      bubbles: !0,
      cancelable: !0,
      composed: !0
    })
  ), t;
}
function Vh(e) {
  return ao(e.ec_product_id || e.permanentid);
}
function Tx(e, t, r) {
  e.dispatchEvent(
    new CustomEvent(oo, {
      detail: {
        sibling: r,
        sourceProductId: Vh(t)
      },
      bubbles: !0,
      composed: !0
    })
  );
}
function Li(e, t, r) {
  const n = Vh(t), i = (s) => {
    const o = s.detail;
    o.sourceProductId === n && r(o.sibling);
  };
  return document.addEventListener(oo, i), () => document.removeEventListener(oo, i);
}
function da(e, t) {
  var s;
  const r = encodeURIComponent(t.handle), n = (s = e.clickUri) == null ? void 0 : s.trim();
  if (!n)
    return `/products/${r}`;
  const i = n.replace(/(\/products\/)[^/?#]+/i, `$1${r}`);
  return i === n ? `/products/${r}` : i;
}
function _x(e) {
  for (const t of ["ec_images", "ec_thumbnails", "imageurl"]) {
    const r = la(e, t), n = Array.isArray(r) ? r.map(be).filter(Boolean) : [be(r)].filter(Boolean);
    if (n.length > 0)
      return n;
  }
  return [];
}
const Bu = "demo-product-sibling-image";
class Mx extends HTMLElement {
  constructor() {
    super(...arguments);
    H(this, "shadow", this.attachShadow({ mode: "open" }));
    H(this, "product", null);
    H(this, "activeSibling", null);
    H(this, "activeImageIndex", 0);
    H(this, "removeSelectionListener", null);
  }
  connectedCallback() {
    queueMicrotask(() => this.refresh());
  }
  disconnectedCallback() {
    var r;
    (r = this.removeSelectionListener) == null || r.call(this), this.removeSelectionListener = null;
  }
  refresh() {
    var n, i;
    if (this.product = sn(this), !this.product) {
      this.hidden = !0;
      return;
    }
    const r = ((n = this.getAttribute("field")) == null ? void 0 : n.trim()) || fr;
    this.activeSibling = nn(this.product, rn(this.product, r)), this.activeImageIndex = 0, (i = this.removeSelectionListener) == null || i.call(this), this.removeSelectionListener = Li(this, this.product, (s) => {
      this.activeSibling = s, this.activeImageIndex = 0, this.render();
    }), this.render();
  }
  get images() {
    var r;
    return this.product ? (r = this.activeSibling) != null && r.images.length ? this.activeSibling.images : _x(this.product) : [];
  }
  selectImage(r, n) {
    const i = this.images;
    i.length <= 1 || (this.activeImageIndex = (r + i.length) % i.length, this.render(), n && queueMicrotask(() => {
      var s;
      (s = this.shadow.querySelector(`button[data-action="${n}"]`)) == null || s.focus();
    }));
  }
  render() {
    var l;
    if (!this.product)
      return;
    const r = this.images, n = r[this.activeImageIndex];
    if (!n) {
      this.hidden = !0, this.shadow.replaceChildren();
      return;
    }
    this.hidden = !1;
    const i = this.activeSibling ? da(this.product, this.activeSibling) : this.product.clickUri, s = ((l = this.activeSibling) == null ? void 0 : l.title) || this.product.ec_name || "", o = document.createElement("div");
    o.className = "gallery", o.tabIndex = 0, o.setAttribute("role", "region"), o.setAttribute("aria-roledescription", "carousel"), o.setAttribute("aria-label", `${s} image gallery`), o.addEventListener("keydown", (d) => {
      d.key === "ArrowLeft" && (d.preventDefault(), this.selectImage(this.activeImageIndex - 1, "previous-image")), d.key === "ArrowRight" && (d.preventDefault(), this.selectImage(this.activeImageIndex + 1, "next-image"));
    });
    const a = document.createElement("a");
    a.href = i || "#", a.addEventListener("click", (d) => d.stopPropagation());
    const c = document.createElement("img");
    if (c.src = n, c.alt = s, c.loading = "lazy", c.setAttribute("aria-label", r.length > 1 ? `${s}, image ${this.activeImageIndex + 1} of ${r.length}` : s), a.append(c), o.append(a), r.length > 1) {
      const d = document.createElement("button");
      d.type = "button", d.className = "carousel-control carousel-previous", d.dataset.action = "previous-image", d.setAttribute("aria-label", "Show previous product image"), d.textContent = "‹", d.addEventListener("click", (f) => {
        f.preventDefault(), f.stopPropagation(), this.selectImage(this.activeImageIndex - 1, "previous-image");
      });
      const p = document.createElement("button");
      p.type = "button", p.className = "carousel-control carousel-next", p.dataset.action = "next-image", p.setAttribute("aria-label", "Show next product image"), p.textContent = "›", p.addEventListener("click", (f) => {
        f.preventDefault(), f.stopPropagation(), this.selectImage(this.activeImageIndex + 1, "next-image");
      });
      const g = document.createElement("div");
      g.className = "carousel-pagination", g.setAttribute("aria-label", "Select product image"), r.forEach((f, m) => {
        const C = document.createElement("button"), k = m === this.activeImageIndex;
        C.type = "button", C.className = `carousel-dot${k ? " carousel-dot-active" : ""}`, C.dataset.imageIndex = String(m), C.setAttribute("aria-label", `Show product image ${m + 1} of ${r.length}`), C.setAttribute("aria-current", k ? "true" : "false"), C.addEventListener("click", (b) => {
          b.preventDefault(), b.stopPropagation(), this.selectImage(m);
        }), g.append(C);
      });
      const h = document.createElement("span");
      h.className = "carousel-status", h.setAttribute("aria-live", "polite"), h.textContent = `Showing image ${this.activeImageIndex + 1} of ${r.length}`, o.append(d, p, g, h);
    }
    const u = document.createElement("style");
    u.textContent = `
      :host { display: block; inline-size: 100%; block-size: 100%; min-block-size: 0; }
      .gallery { position: relative; inline-size: 100%; block-size: 100%; min-block-size: 0; outline: none; }
      .gallery:focus-visible { outline: 2px solid #111827; outline-offset: 2px; }
      a { display: block; inline-size: 100%; block-size: 100%; }
      img { display: block; inline-size: 100%; block-size: 100%; object-fit: var(--demo-sibling-image-fit, cover); object-position: center; }
      .carousel-control { appearance: none; display: grid; position: absolute; inset-block-start: 50%; z-index: 1; inline-size: 2.25rem; block-size: 2.25rem; place-items: center; border: 1px solid rgb(17 24 39 / 18%); border-radius: 999px; background: rgb(255 255 255 / 92%); color: #111827; cursor: pointer; font-size: 1.35rem; line-height: 1; opacity: 0; transform: translateY(-50%); transition: opacity 120ms ease, background 120ms ease, transform 120ms ease; }
      .carousel-previous { inset-inline-start: .5rem; }
      .carousel-next { inset-inline-end: .5rem; }
      .gallery:hover .carousel-control, .carousel-control:focus-visible { opacity: 1; }
      .carousel-control:hover { background: #fff; transform: translateY(-50%) scale(1.05); }
      .carousel-control:focus-visible { outline: 2px solid #111827; outline-offset: 2px; }
      .carousel-pagination { display: flex; position: absolute; inset-inline-start: 50%; inset-block-end: .6rem; z-index: 1; gap: .35rem; transform: translateX(-50%); }
      .carousel-dot { appearance: none; inline-size: .45rem; block-size: .45rem; border: 1px solid rgb(17 24 39 / 35%); border-radius: 999px; background: rgb(255 255 255 / 85%); cursor: pointer; padding: 0; transition: background 120ms ease, transform 120ms ease; }
      .carousel-dot:hover, .carousel-dot:focus-visible { transform: scale(1.25); }
      .carousel-dot-active { background: #111827; border-color: #111827; }
      .carousel-dot:focus-visible { outline: 2px solid #111827; outline-offset: 2px; }
      .carousel-status { position: absolute; inline-size: 1px; block-size: 1px; overflow: hidden; clip: rect(0 0 0 0); clip-path: inset(50%); white-space: nowrap; }
      @media (hover: none), (pointer: coarse) { .carousel-control { opacity: 1; } }
    `, this.shadow.replaceChildren(u, o);
  }
}
customElements.get(Bu) || customElements.define(Bu, Mx);
const Hu = "demo-product-sibling-link";
class Px extends HTMLElement {
  constructor() {
    super(...arguments);
    H(this, "shadow", this.attachShadow({ mode: "open" }));
    H(this, "product", null);
    H(this, "activeSibling", null);
    H(this, "removeSelectionListener", null);
  }
  connectedCallback() {
    queueMicrotask(() => this.refresh());
  }
  disconnectedCallback() {
    var r;
    (r = this.removeSelectionListener) == null || r.call(this), this.removeSelectionListener = null;
  }
  refresh() {
    var n, i;
    if (this.product = sn(this), !this.product) {
      this.hidden = !0;
      return;
    }
    const r = ((n = this.getAttribute("field")) == null ? void 0 : n.trim()) || fr;
    this.activeSibling = nn(this.product, rn(this.product, r)), (i = this.removeSelectionListener) == null || i.call(this), this.removeSelectionListener = Li(this, this.product, (s) => {
      this.activeSibling = s, this.render();
    }), this.hidden = !1, this.render();
  }
  render() {
    var i;
    if (!this.product)
      return;
    const r = document.createElement("a");
    r.href = this.activeSibling ? da(this.product, this.activeSibling) : this.product.clickUri, r.textContent = ((i = this.activeSibling) == null ? void 0 : i.title) || this.product.ec_name || "", r.addEventListener("click", (s) => s.stopPropagation());
    const n = document.createElement("style");
    n.textContent = ":host { display: block; } a { color: inherit; font: inherit; font-weight: inherit; text-decoration: none; } a:hover { text-decoration: underline; } a:focus-visible { outline: 2px solid currentColor; outline-offset: 2px; }", this.shadow.replaceChildren(n, r);
  }
}
customElements.get(Hu) || customElements.define(Hu, Px);
const Yu = "demo-product-sibling-price", Ux = "USD", $x = "en-US";
function Vx(e) {
  return e ? [...new Set(e.variants.flatMap((t) => t.price === void 0 ? [] : [t.price]))].filter((t) => Number.isFinite(t)).sort((t, r) => t - r) : [];
}
class Lx extends HTMLElement {
  constructor() {
    super(...arguments);
    H(this, "shadow", this.attachShadow({ mode: "open" }));
    H(this, "product", null);
    H(this, "activeSibling", null);
    H(this, "removeSelectionListener", null);
  }
  connectedCallback() {
    queueMicrotask(() => this.refresh());
  }
  disconnectedCallback() {
    var r;
    (r = this.removeSelectionListener) == null || r.call(this), this.removeSelectionListener = null;
  }
  get currency() {
    var n;
    const r = (n = this.getAttribute("currency")) == null ? void 0 : n.trim().toUpperCase();
    return r && /^[A-Z]{3}$/.test(r) ? r : Ux;
  }
  get locale() {
    var r;
    return ((r = this.getAttribute("locale")) == null ? void 0 : r.trim()) || $x;
  }
  refresh() {
    var n, i;
    if (this.product = sn(this), !this.product) {
      this.hidden = !0;
      return;
    }
    const r = ((n = this.getAttribute("field")) == null ? void 0 : n.trim()) || fr;
    this.activeSibling = nn(this.product, rn(this.product, r)), (i = this.removeSelectionListener) == null || i.call(this), this.removeSelectionListener = Li(this, this.product, (s) => {
      this.activeSibling = s, this.render();
    }), this.render();
  }
  get prices() {
    var i, s;
    const r = Vx(this.activeSibling);
    if (r.length > 0)
      return r;
    const n = ((i = this.product) == null ? void 0 : i.ec_promo_price) ?? ((s = this.product) == null ? void 0 : s.ec_price);
    return typeof n == "number" && Number.isFinite(n) ? [n] : [];
  }
  format(r) {
    return new Intl.NumberFormat(this.locale, {
      style: "currency",
      currency: this.currency
    }).format(r);
  }
  render() {
    const r = this.prices;
    if (r.length === 0) {
      this.hidden = !0, this.shadow.replaceChildren();
      return;
    }
    this.hidden = !1;
    const n = r.length === 1 ? this.format(r[0]) : `From ${this.format(r[0])}`, i = document.createElement("span");
    i.className = "price", i.textContent = n, i.setAttribute("aria-label", n);
    const s = document.createElement("style");
    s.textContent = ":host { display: block; } .price { color: #111827; font-size: 1.125rem; font-weight: 700; line-height: 1.5; }", this.shadow.replaceChildren(s, i);
  }
}
customElements.get(Yu) || customElements.define(Yu, Lx);
const Wu = "demo-product-sibling-size-selector", Qx = "ADD TO BAG:", Gu = ["xxs", "xs", "s", "m", "l", "xl", "xxl"];
function Sr(e) {
  return e.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}
class jx extends HTMLElement {
  constructor() {
    super(...arguments);
    H(this, "shadow", this.attachShadow({ mode: "open" }));
    H(this, "product", null);
    H(this, "activeSibling", null);
    H(this, "selectedVariantId", "");
    H(this, "hoverTarget", null);
    H(this, "removeSelectionListener", null);
    H(this, "removeVisibilityBindings", null);
    H(this, "restoreOverlayContainerPosition", null);
  }
  connectedCallback() {
    this.prepareInteractionTarget(), this.bindVisibilityState(), queueMicrotask(() => this.refresh());
  }
  disconnectedCallback() {
    var r, n, i;
    (r = this.removeSelectionListener) == null || r.call(this), (n = this.removeVisibilityBindings) == null || n.call(this), (i = this.restoreOverlayContainerPosition) == null || i.call(this), this.removeSelectionListener = null, this.removeVisibilityBindings = null, this.restoreOverlayContainerPosition = null;
  }
  get label() {
    var r;
    return ((r = this.getAttribute("label")) == null ? void 0 : r.trim()) || Qx;
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
  bindVisibilityState() {
    const r = this.hoverTarget;
    if (!r)
      return;
    const n = () => this.setAttribute("data-visible", "true"), i = (s) => {
      (s == null ? void 0 : s.relatedTarget) instanceof Node && r.contains(s.relatedTarget) || this.removeAttribute("data-visible");
    };
    r.addEventListener("mouseenter", n), r.addEventListener("mouseleave", i), r.addEventListener("focusin", n), r.addEventListener("focusout", i), r.addEventListener("touchstart", n, { passive: !0 }), this.removeVisibilityBindings = () => {
      r.removeEventListener("mouseenter", n), r.removeEventListener("mouseleave", i), r.removeEventListener("focusin", n), r.removeEventListener("focusout", i), r.removeEventListener("touchstart", n);
    };
  }
  refresh() {
    var n, i;
    if (this.product = sn(this), !this.product) {
      this.hide();
      return;
    }
    const r = ((n = this.getAttribute("field")) == null ? void 0 : n.trim()) || fr;
    this.setActiveSibling(nn(this.product, rn(this.product, r))), (i = this.removeSelectionListener) == null || i.call(this), this.removeSelectionListener = Li(this, this.product, (s) => {
      this.setActiveSibling(s);
    });
  }
  setActiveSibling(r) {
    var i, s;
    this.activeSibling = r;
    const n = this.sortedVariants;
    if (this.selectedVariantId = ((i = n[0]) == null ? void 0 : i.variantId) || ((s = n[0]) == null ? void 0 : s.sku) || "", n.length === 0) {
      this.hide();
      return;
    }
    this.hidden = !1, this.render();
  }
  get sortedVariants() {
    var n;
    const r = /* @__PURE__ */ new Set();
    return (((n = this.activeSibling) == null ? void 0 : n.variants) ?? []).filter((i) => {
      const s = i.size.trim().toLowerCase();
      return !s || r.has(s) ? !1 : (r.add(s), !0);
    }).sort((i, s) => {
      const o = Gu.indexOf(i.size.trim().toLowerCase()), a = Gu.indexOf(s.size.trim().toLowerCase());
      return (o < 0 ? Number.MAX_SAFE_INTEGER : o) - (a < 0 ? Number.MAX_SAFE_INTEGER : a);
    });
  }
  hide() {
    this.hidden = !0, this.shadow.replaceChildren();
  }
  pushAddToCart(r) {
    if (!this.activeSibling)
      return;
    this.selectedVariantId = r.variantId || r.sku, this.setActiveState();
    const n = r.price, i = {
      event: "add_to_cart",
      ecommerce: {
        items: [
          {
            item_id: r.sku || r.variantId,
            item_name: this.activeSibling.title,
            item_group_id: this.activeSibling.productId,
            item_variant: [this.activeSibling.colourName, r.size].filter(Boolean).join(" / "),
            quantity: 1,
            color: this.activeSibling.colourName,
            size: r.size,
            ...n === void 0 ? {} : { price: n }
          }
        ],
        ...n === void 0 ? {} : { value: n }
      }
    }, s = window.dataLayer ?? [];
    s.push(i), window.dataLayer = s;
  }
  setActiveState() {
    for (const r of this.shadow.querySelectorAll("button[data-variant-id]")) {
      const n = r.dataset.variantId === this.selectedVariantId;
      r.classList.toggle("size-active", n), r.setAttribute("aria-pressed", String(n));
    }
  }
  bindEvents() {
    for (const r of this.shadow.querySelectorAll("button[data-variant-id]")) {
      const n = r.dataset.variantId, i = this.sortedVariants.find((s) => (s.variantId || s.sku) === n);
      r.addEventListener("click", (s) => {
        s.preventDefault(), s.stopPropagation(), i && this.pushAddToCart(i);
      });
    }
  }
  render() {
    const r = this.sortedVariants;
    this.shadow.innerHTML = `
      <style>
        :host { display: block; position: absolute; inset-inline: 0; bottom: 0; z-index: 1; max-height: 0; opacity: 0; overflow: hidden; pointer-events: none; transform: translateY(100%); transition: max-height 180ms ease, opacity 160ms ease, transform 180ms ease; }
        :host([data-visible='true']) { max-height: 8rem; opacity: 1; pointer-events: auto; transform: translateY(0); }
        @media (hover: none), (pointer: coarse) { :host { max-height: 8rem; opacity: 1; pointer-events: auto; transform: translateY(0); transition: none; } }
        .panel { pointer-events: auto; padding: .55rem .35rem .45rem; background: linear-gradient(to top, rgba(255,255,255,.98), rgba(255,255,255,.88)); text-align: center; }
        .label { color: #111827; font-size: .78rem; font-weight: 800; letter-spacing: .08em; margin-bottom: .3rem; text-transform: uppercase; }
        .sizes { display: flex; flex-wrap: wrap; justify-content: center; gap: .35rem .5rem; }
        .size { appearance: none; border: 0; background: transparent; color: #111827; cursor: pointer; font-size: .78rem; font-weight: 700; letter-spacing: .02em; min-inline-size: 1.8rem; padding: .12rem .1rem; text-transform: uppercase; transition: color 120ms ease, transform 120ms ease; }
        .size:hover { transform: translateY(-1px); }
        .size:focus-visible { outline: 2px solid #111827; outline-offset: 2px; }
        .size-active { color: #6b7280; }
      </style>
      <div class="panel" aria-label="Add to bag options">
        <div class="label">${Sr(this.label)}</div>
        <div class="sizes" role="list">
          ${r.map((n) => {
      const i = n.variantId || n.sku, s = i === this.selectedVariantId;
      return `<button type="button" class="size${s ? " size-active" : ""}" data-variant-id="${Sr(i)}" aria-label="Add size ${Sr(n.size)} to bag" aria-pressed="${String(s)}" title="Add size ${Sr(n.size)} to bag">${Sr(n.size)}</button>`;
    }).join("")}
        </div>
      </div>
    `, this.bindEvents();
  }
}
customElements.get(Wu) || customElements.define(Wu, jx);
const Ku = "demo-product-sibling-swatches", Nx = 5, zx = 3;
function Ju(e) {
  return e.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}
class Bx extends HTMLElement {
  constructor() {
    super(...arguments);
    H(this, "shadow", this.attachShadow({ mode: "open" }));
    H(this, "currentProduct", null);
    H(this, "siblings", []);
    H(this, "activeProductId", "");
  }
  static get observedAttributes() {
    return ["field", "max-visible"];
  }
  connectedCallback() {
    queueMicrotask(() => this.refresh());
  }
  attributeChangedCallback() {
    this.isConnected && queueMicrotask(() => this.refresh());
  }
  get field() {
    var r;
    return ((r = this.getAttribute("field")) == null ? void 0 : r.trim()) || fr;
  }
  get maxVisible() {
    const r = Number.parseInt(this.getAttribute("max-visible") ?? "", 10);
    return Number.isFinite(r) && r > 0 ? r : Nx;
  }
  refresh(r = 0) {
    var i, s;
    const n = sn(this);
    if (!n) {
      if (r + 1 < zx) {
        queueMicrotask(() => this.refresh(r + 1));
        return;
      }
      this.hide();
      return;
    }
    if (this.currentProduct = n, this.siblings = rn(n, this.field).filter((o) => o.swatchHex), this.activeProductId = ((i = nn(n, this.siblings)) == null ? void 0 : i.productId) ?? ((s = this.siblings[0]) == null ? void 0 : s.productId) ?? "", this.siblings.length <= 1) {
      this.hide();
      return;
    }
    this.hidden = !1, this.render();
  }
  hide() {
    this.hidden = !0, this.siblings = [], this.activeProductId = "", this.shadow.replaceChildren();
  }
  selectSibling(r) {
    const n = this.siblings.find((i) => i.productId === r);
    !n || n.productId === this.activeProductId || (this.activeProductId = n.productId, this.setActiveState(), this.currentProduct && Tx(this, this.currentProduct, n));
  }
  setActiveState() {
    for (const r of this.shadow.querySelectorAll("button[data-product-id]")) {
      const n = r.dataset.productId === this.activeProductId;
      r.classList.toggle("swatch-active", n), r.setAttribute("aria-pressed", String(n));
    }
  }
  openSelectedProduct() {
    if (!this.currentProduct)
      return;
    const r = this.siblings.find((n) => n.productId === this.activeProductId);
    r && window.location.assign(da(this.currentProduct, r));
  }
  bindEvents() {
    var r;
    for (const n of this.shadow.querySelectorAll("button[data-product-id]")) {
      const i = n.dataset.productId;
      i && (n.addEventListener("mouseenter", () => this.selectSibling(i)), n.addEventListener("focus", () => this.selectSibling(i)), n.addEventListener("click", (s) => {
        s.preventDefault(), s.stopPropagation(), this.selectSibling(i);
      }), n.addEventListener("touchstart", (s) => {
        s.preventDefault(), s.stopPropagation(), this.selectSibling(i);
      }));
    }
    (r = this.shadow.querySelector('button[data-action="open-product-page"]')) == null || r.addEventListener(
      "click",
      (n) => {
        n.preventDefault(), n.stopPropagation(), this.openSelectedProduct();
      }
    );
  }
  render() {
    const r = this.siblings.slice(0, this.maxVisible), n = this.siblings.length - r.length;
    this.shadow.innerHTML = `
      <style>
        :host { display: block; }
        .swatches { display: flex; flex-wrap: wrap; align-items: center; gap: .5rem; min-height: 2rem; }
        .swatch { inline-size: 2rem; block-size: 2rem; border-radius: .4rem; border: 1px solid #d1d5db; background: var(--swatch-color); padding: 0; cursor: pointer; transition: transform 120ms ease, border-color 120ms ease, box-shadow 120ms ease, outline-color 120ms ease; }
        .swatch:hover { transform: translateY(-1px); }
        .swatch:focus-visible { outline: 2px solid #0d6efd; outline-offset: 2px; }
        .swatch-active { border-color: #0d6efd; outline: 2px solid #0d6efd; outline-offset: 1px; }
        .count-button { appearance: none; border: 0; background: transparent; color: #374151; padding: 0; cursor: pointer; font-size: .9rem; font-weight: 600; line-height: 1; }
        .count-button:hover, .count-button:focus-visible { color: #0d6efd; }
      </style>
      <div class="swatches" aria-label="Available colors" role="list">
        ${r.map((i) => {
      const s = Ju(i.colourName || i.title || "Color option"), o = i.productId === this.activeProductId;
      return `<button type="button" class="swatch${o ? " swatch-active" : ""}" data-product-id="${Ju(i.productId)}" aria-label="Show ${s}" aria-pressed="${String(o)}" title="${s}" style="--swatch-color: ${i.swatchHex}"></button>`;
    }).join("")}
        ${n > 0 ? `<button type="button" class="count-button" data-action="open-product-page" aria-label="View ${n} more colors" title="View more colors">+${n}</button>` : ""}
      </div>
    `, this.bindEvents();
  }
}
customElements.get(Ku) || customElements.define(Ku, Bx);
