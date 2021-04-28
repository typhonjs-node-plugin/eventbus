function e(e,t){return function(e,t){return t.get?t.get.call(e):t.value}(e,s(e,t,"get"))}function t(e,t,r){return function(e,t,s){if(t.set)t.set.call(e,s);else{if(!t.writable)throw new TypeError("attempted to set read only private field");t.value=s}}(e,s(e,t,"set"),r),r}function s(e,t,s){if(!t.has(e))throw new TypeError("attempted to "+s+" private field on non-instance");return t.get(e)}var r=new WeakMap,n=new WeakMap;class i{constructor(){r.set(this,{writable:!0,value:void 0}),n.set(this,{writable:!0,value:void 0})}static initialize(s,o){if(void 0!==o&&"string"!=typeof o)throw new TypeError("'name' is not a string");const a=new i;return t(a,r,s),t(a,n,void 0===o?s.name:o),{destroy:function(){a.isDestroyed||(t(a,r,null),this&&(this.eventbusSecure=void 0))},setEventbus:function(s,i){if(void 0!==i&&"string"!=typeof i)throw new TypeError("'name' is not a string");a.isDestroyed||(void 0===i&&e(a,n)===e(a,r).name?t(a,n,s.name):void 0!==i&&t(a,n,i),t(a,r,s))},eventbusSecure:a}}*keys(t){if(this.isDestroyed)throw new ReferenceError("This EventbusSecure instance has been destroyed.");for(const s of e(this,r).keys(t))yield s}get isDestroyed(){return null===e(this,r)}get name(){if(this.isDestroyed)throw new ReferenceError("This EventbusSecure instance has been destroyed.");return e(this,n)}trigger(t){if(this.isDestroyed)throw new ReferenceError("This EventbusSecure instance has been destroyed.");return e(this,r).trigger(...arguments),this}triggerAsync(t){if(this.isDestroyed)throw new ReferenceError("This EventbusSecure instance has been destroyed.");return e(this,r).triggerAsync(...arguments)}triggerDefer(t){if(this.isDestroyed)throw new ReferenceError("This EventbusSecure instance has been destroyed.");return e(this,r).triggerDefer(...arguments),this}triggerSync(t){if(this.isDestroyed)throw new ReferenceError("This EventbusSecure instance has been destroyed.");return e(this,r).triggerSync(...arguments)}}const o=/\s+/;function a(e,t,s,r,n){let i,c=0;if(s&&"object"==typeof s){void 0!==r&&"context"in n&&void 0===n.context&&(n.context=r);for(i=h(s);c<i.length;c++)t=a(e,t,i[c],s[i[c]],n)}else if(s&&o.test(s))for(i=s.split(o);c<i.length;c++)t=e(t,i[c],r,n);else t=e(t,s,r,n);return t}function c(e){const t=e.name;return""!==t?`[${t}] `:""}const h=e=>null===e||"object"!=typeof e?[]:Object.keys(e);function l(e,t,s,r){const n=r.after,i=r.count+1;if(s){const r=e[t]=u(i,(function(){return s.apply(this,arguments)}),(()=>{n(t,r)}));r._callback=s}return e}const u=function(e,t,s){let r;return function(...n){return--e>0&&(r=t.apply(this,n)),e<=1&&(s&&s.apply(this,n),s=void 0,t=void 0),r}};var f=new WeakMap,d=new WeakMap;class y{constructor(e){f.set(this,{writable:!0,value:void 0}),d.set(this,{writable:!0,value:void 0}),t(this,f,e)}before(t,s,r,n,i=!1){if(this.isDestroyed)throw new ReferenceError("This EventbusProxy instance has been destroyed.");if(!Number.isInteger(t))throw new TypeError("'count' is not an integer");const o={};if(e(this,f).isGuarded(s,o))return console.warn(`@typhonjs-plugin/eventbus ${c(this)}- before() failed as event name(s) are guarded: ${JSON.stringify(o.names)}`),this;const h=a(l,{},s,r,{count:t,after:this.off.bind(this)});return"string"==typeof s&&null==n&&(r=void 0),this.on(h,r,n,i)}createSecure(t){if(this.isDestroyed)throw new ReferenceError("This EventbusProxy instance has been destroyed.");return i.initialize(e(this,f),t)}destroy(){null!==e(this,f)&&this.off(),t(this,d,void 0),t(this,f,null)}*entries(t){if(this.isDestroyed)throw new ReferenceError("This EventbusProxy instance has been destroyed.");for(const s of e(this,f).entries(t))yield s}get eventCount(){if(this.isDestroyed)throw new ReferenceError("This EventbusProxy instance has been destroyed.");return e(this,f).eventCount}get callbackCount(){if(this.isDestroyed)throw new ReferenceError("This EventbusProxy instance has been destroyed.");return e(this,f).callbackCount}*keys(t){if(this.isDestroyed)throw new ReferenceError("This EventbusProxy instance has been destroyed.");for(const s of e(this,f).keys(t))yield s}get isDestroyed(){return null===e(this,f)}get name(){if(this.isDestroyed)throw new ReferenceError("This EventbusProxy instance has been destroyed.");return`proxy-${e(this,f).name}`}get proxyEventCount(){if(this.isDestroyed)throw new ReferenceError("This EventbusProxy instance has been destroyed.");return e(this,d)?Object.keys(e(this,d)).length:0}get proxyCallbackCount(){if(this.isDestroyed)throw new ReferenceError("This EventbusProxy instance has been destroyed.");if(!e(this,d))return 0;let t=0;for(const s in e(this,d))t+=e(this,d)[s].length;return t}isGuarded(t,s={}){if(this.isDestroyed)throw new ReferenceError("This EventbusProxy instance has been destroyed.");return e(this,f).isGuarded(t,s)}off(s,r,n){if(this.isDestroyed)throw new ReferenceError("This EventbusProxy instance has been destroyed.");return t(this,d,a(g,e(this,d)||{},s,r,{context:n,eventbus:e(this,f)})),this}on(s,r,n,i=!1){if(this.isDestroyed)throw new ReferenceError("This EventbusProxy instance has been destroyed.");const o={};if(e(this,f).isGuarded(s,o))return console.warn(`@typhonjs-plugin/eventbus ${c(this)}- on() failed as event name(s) are guarded: ${JSON.stringify(o.names)}`),this;const h={context:n,ctx:this,guarded:i};return t(this,d,a(b,e(this,d)||{},s,r,h)),e(this,f).on(s,r,h.ctx,i),this}once(t,s,r,n=!1){if(this.isDestroyed)throw new ReferenceError("This EventbusProxy instance has been destroyed.");const i={};if(e(this,f).isGuarded(t,i))return console.warn(`@typhonjs-plugin/eventbus ${c(this)}- once() failed as event name(s) are guarded: ${JSON.stringify(i.names)}`),this;const o=a(l,{},t,s,{count:1,after:this.off.bind(this)});return"string"==typeof t&&null==r&&(s=void 0),this.on(o,s,r,n)}*proxyEntries(t){if(this.isDestroyed)throw new ReferenceError("This EventbusProxy instance has been destroyed.");if(void 0!==t&&!(t instanceof RegExp))throw new TypeError("'regex' is not a RegExp");if(e(this,d))if(t){for(const s in e(this,d))if(t.test(s))for(const t of e(this,d)[s])yield[s,t.callback,t.context,t.guarded]}else for(const t in e(this,d))for(const s of e(this,d)[t])yield[t,s.callback,s.context,s.guarded]}*proxyKeys(t){if(this.isDestroyed)throw new ReferenceError("This EventbusProxy instance has been destroyed.");if(void 0!==t&&!(t instanceof RegExp))throw new TypeError("'regex' is not a RegExp");if(e(this,d))if(t)for(const s in e(this,d))t.test(s)&&(yield s);else for(const t in e(this,d))yield t}trigger(t){if(this.isDestroyed)throw new ReferenceError("This EventbusProxy instance has been destroyed.");return e(this,f).trigger(...arguments),this}triggerAsync(t){if(this.isDestroyed)throw new ReferenceError("This EventbusProxy instance has been destroyed.");return e(this,f).triggerAsync(...arguments)}triggerDefer(t){if(this.isDestroyed)throw new ReferenceError("This EventbusProxy instance has been destroyed.");return e(this,f).triggerDefer(...arguments),this}triggerSync(t){if(this.isDestroyed)throw new ReferenceError("This EventbusProxy instance has been destroyed.");return e(this,f).triggerSync(...arguments)}}const g=(e,t,s,r)=>{if(!e)return;const n=r.context,i=r.eventbus,o=t?[t]:h(e);for(let r=0;r<o.length;r++){const a=e[t=o[r]];if(!a)break;const c=[];for(let e=0;e<a.length;e++){const t=a[e];(s&&s!==t.callback&&s!==t.callback._callback||n&&n!==t.context)&&c.push(t)}c.length?e[t]=c:(i.off(t,s,n),delete e[t])}return e},b=(e,t,s,r)=>{if(s){const n=e[t]||(e[t]=[]),i=r.context,o=r.ctx,a="boolean"==typeof r.guarded&&r.guarded;r.ctx=i||o,n.push({callback:s,context:i,ctx:r.ctx,guarded:a})}return e};var v=new WeakMap,w=new WeakMap;class p{constructor(e=""){if(v.set(this,{writable:!0,value:""}),w.set(this,{writable:!0,value:void 0}),"string"!=typeof e)throw new TypeError("'name' is not a string");t(this,v,e),this._listeners=void 0,this._listenId=void 0,this._listeningTo=void 0}before(e,t,s,r,n=!1){if(!Number.isInteger(e))throw new TypeError("'count' is not an integer");const i={};if(this.isGuarded(t,i))return console.warn(`@typhonjs-plugin/eventbus ${c(this)}- before() failed as event name(s) are guarded: ${JSON.stringify(i.names)}`),this;const o=a(l,{},t,s,{count:e,after:this.off.bind(this)});return"string"==typeof t&&null==r&&(s=void 0),this.on(o,s,r,n)}createProxy(){return new y(this)}createSecure(e){return i.initialize(this,e)}*entries(t){if(void 0!==t&&!(t instanceof RegExp))throw new TypeError("'regex' is not a RegExp");if(e(this,w))if(t){for(const s in e(this,w))if(t.test(s))for(const t of e(this,w)[s])yield[s,t.callback,t.context,t.guarded]}else for(const t in e(this,w))for(const s of e(this,w)[t])yield[t,s.callback,s.context,s.guarded]}get eventCount(){return e(this,w)?Object.keys(e(this,w)).length:0}get callbackCount(){if(!e(this,w))return 0;let t=0;for(const s in e(this,w))t+=e(this,w)[s].length;return t}isGuarded(t,s={}){return s.names=[],s.guarded=!1,a(S,s,t,void 0,{events:e(this,w)}).guarded}*keys(t){if(void 0!==t&&!(t instanceof RegExp))throw new TypeError("'regex' is not a RegExp");if(e(this,w))if(t)for(const s in e(this,w))t.test(s)&&(yield s);else for(const t in e(this,w))yield t}get name(){return e(this,v)}listenTo(e,t,s){if(!e)return this;const r={};if(I(e,t,r))return console.warn(`@typhonjs-plugin/eventbus ${c(this)}- listenTo() failed as event name(s) are guarded for target object: ${JSON.stringify(r.names)}`),this;const n=e._listenId||(e._listenId=N("l")),i=this._listeningTo||(this._listeningTo={});let o=x=i[n];o||(this._listenId||(this._listenId=N("l")),o=x=i[n]=new P(this,e));const a=O(e,t,s,this);if(x=void 0,a)throw a;return o.interop&&o.on(t,s),this}listenToBefore(e,t,s,r){if(!Number.isInteger(e))throw new TypeError("'count' is not an integer");const n=a(l,{},s,r,{count:e,after:this.stopListening.bind(this,t)});return this.listenTo(t,n)}listenToOnce(e,t,s){const r=a(l,{},t,s,{count:1,after:this.stopListening.bind(this,e)});return this.listenTo(e,r)}off(s,r,n){return e(this,w)?(t(this,w,a(_,e(this,w),s,r,{context:n,listeners:this._listeners})),this):this}on(s,r,n,i=!1){const o={};return this.isGuarded(s,o)?(console.warn(`@typhonjs-plugin/eventbus ${c(this)}- on() failed as event name(s) are guarded: ${JSON.stringify(o.names)}`),this):(t(this,w,a(A,e(this,w)||{},s,r,{context:n,ctx:this,guarded:i,listening:x})),x&&((this._listeners||(this._listeners={}))[x.id]=x,x.interop=!1),this)}once(e,t,s,r=!1){const n={};if(this.isGuarded(e,n))return console.warn(`@typhonjs-plugin/eventbus ${c(this)}- once() failed as event name(s) are guarded: ${JSON.stringify(n.names)}`),this;const i=a(l,{},e,t,{count:1,after:this.off.bind(this)});return"string"==typeof e&&null==s&&(t=void 0),this.on(i,t,s,r)}stopListening(e,t,s){const r=this._listeningTo;if(!r)return this;const n=e?[e._listenId]:h(r);for(let e=0;e<n.length;e++){const i=r[n[e]];if(!i)break;i.obj.off(t,s,this),i.interop&&i.off(t,s)}return this}trigger(t){if(!e(this,w))return this;const s=Math.max(0,arguments.length-1),r=new Array(s);for(let e=0;e<s;e++)r[e]=arguments[e+1];return $(j,M,e(this,w),t,void 0,r),this}async triggerAsync(t){if(!e(this,w))return;const s=Math.max(0,arguments.length-1),r=new Array(s);for(let e=0;e<s;e++)r[e]=arguments[e+1];const n=$(j,W,e(this,w),t,void 0,r);return void 0!==n?Array.isArray(n)?Promise.all(n).then((e=>{let t=[];for(const s of e)Array.isArray(s)?t=t.concat(s):void 0!==s&&t.push(s);return t.length>1?t:1===t.length?t[0]:void 0})):n:void 0}triggerDefer(e){return setTimeout((()=>{this.trigger(...arguments)}),0),this}triggerSync(t){if(!e(this,w))return;const s=Math.max(0,arguments.length-1),r=new Array(s);for(let e=0;e<s;e++)r[e]=arguments[e+1];return $(j,C,e(this,w),t,void 0,r)}}let x;var E=new WeakMap,k=new WeakMap,T=new WeakMap,m=new WeakMap,D=new WeakMap,R=new WeakMap;class P{constructor(e,s){E.set(this,{writable:!0,value:void 0}),k.set(this,{writable:!0,value:void 0}),T.set(this,{writable:!0,value:void 0}),m.set(this,{writable:!0,value:void 0}),D.set(this,{writable:!0,value:void 0}),R.set(this,{writable:!0,value:0}),t(this,k,e._listenId),t(this,T,e),t(this,m,s),t(this,D,!0)}cleanup(){delete e(this,T)._listeningTo[e(this,m)._listenId],e(this,D)||delete e(this,m)._listeners[e(this,k)]}get id(){return e(this,k)}get interop(){return e(this,D)}get obj(){return e(this,m)}incrementCount(){t(this,R,+e(this,R)+1)}on(s,r,n){return t(this,E,a(A,e(this,E)||{},s,r,{context:n,ctx:this,listening:this})),this}off(s,r){let n;e(this,D)?(t(this,E,a(_,e(this,E),s,r,{context:void 0,listeners:void 0})),n=!e(this,E)):(t(this,R,+e(this,R)-1),n=0===e(this,R)),n&&this.cleanup()}set interop(e){if("boolean"!=typeof e)throw new TypeError("'value' is not a boolean");t(this,D,e)}}const S=(e,t,s,r)=>{const n=r.events;if(n){const s=n[t];if(Array.isArray(s))for(const r of s)if(r.guarded)return e.names.push(t),e.guarded=!0,e}return e},_=(e,t,s,r)=>{if(!e)return;const n=r.context,i=r.listeners;let o,a=0;if(t||n||s){for(o=t?[t]:h(e);a<o.length;a++){const r=e[t=o[a]];if(!r)break;const i=[];for(let e=0;e<r.length;e++){const o=r[e];if(s&&s!==o.callback&&s!==o.callback._callback||n&&n!==o.context)i.push(o);else{const e=o.listening;e&&e.off(t,s)}}i.length?e[t]=i:delete e[t]}return e}for(o=h(i);a<o.length;a++)i[o[a]].cleanup()},A=(e,t,s,r)=>{if(s){const n=e[t]||(e[t]=[]),i=r.context,o=r.ctx,a=r.listening,c="boolean"==typeof r.guarded&&r.guarded;a&&a.incrementCount(),n.push({callback:s,context:i,ctx:i||o,guarded:c,listening:a})}return e},$=(e,t,s,r,n,i)=>{let a,c,h=0;if(r&&o.test(r))for(c=r.split(o);h<c.length;h++){const r=e(t,s,c[h],n,i),o=Array.isArray(a)?2:void 0!==a?1:0;if(Array.isArray(r))switch(o){case 0:a=r;break;case 1:a=[a].concat(r);break;case 2:a=a.concat(r)}else if(void 0!==r)switch(o){case 0:a=r;break;case 1:{const e=[a];e.push(r),a=e;break}case 2:a.push(r)}}else a=e(t,s,r,n,i);return a},j=(e,t,s,r,n)=>{let i;if(t){const r=t[s];let o=t.all;r&&o&&(o=o.slice()),r&&(i=e(r,n)),o&&(i=e(o,[s].concat(n)))}return i},M=(e,t)=>{let s,r=-1;const n=t[0],i=t[1],o=t[2],a=e.length;switch(t.length){case 0:for(;++r<a;)(s=e[r]).callback.call(s.ctx);return;case 1:for(;++r<a;)(s=e[r]).callback.call(s.ctx,n);return;case 2:for(;++r<a;)(s=e[r]).callback.call(s.ctx,n,i);return;case 3:for(;++r<a;)(s=e[r]).callback.call(s.ctx,n,i,o);return;default:for(;++r<a;)(s=e[r]).callback.apply(s.ctx,t);return}},W=async(e,t)=>{let s,r=-1;const n=t[0],i=t[1],o=t[2],a=e.length,c=[];switch(t.length){case 0:for(;++r<a;){const t=(s=e[r]).callback.call(s.ctx);void 0!==t&&c.push(t)}break;case 1:for(;++r<a;){const t=(s=e[r]).callback.call(s.ctx,n);void 0!==t&&c.push(t)}break;case 2:for(;++r<a;){const t=(s=e[r]).callback.call(s.ctx,n,i);void 0!==t&&c.push(t)}break;case 3:for(;++r<a;){const t=(s=e[r]).callback.call(s.ctx,n,i,o);void 0!==t&&c.push(t)}break;default:for(;++r<a;){const n=(s=e[r]).callback.apply(s.ctx,t);void 0!==n&&c.push(n)}}return c.length>1?Promise.all(c).then((e=>{const t=e.filter((e=>void 0!==e));switch(t.length){case 0:return;case 1:return t[0];default:return t}})):1===c.length?c[0]:void 0},C=(e,t)=>{let s,r=-1;const n=t[0],i=t[1],o=t[2],a=e.length,c=[];switch(t.length){case 0:for(;++r<a;){const t=(s=e[r]).callback.call(s.ctx);void 0!==t&&c.push(t)}break;case 1:for(;++r<a;){const t=(s=e[r]).callback.call(s.ctx,n);void 0!==t&&c.push(t)}break;case 2:for(;++r<a;){const t=(s=e[r]).callback.call(s.ctx,n,i);void 0!==t&&c.push(t)}break;case 3:for(;++r<a;){const t=(s=e[r]).callback.call(s.ctx,n,i,o);void 0!==t&&c.push(t)}break;default:for(;++r<a;){const n=(s=e[r]).callback.apply(s.ctx,t);void 0!==n&&c.push(n)}}return c.length>1?c:1===c.length?c[0]:void 0},I=(e,t,s={})=>{let r=!1;try{const n=e.isGuarded(t,s);"boolean"==typeof n&&(r=n)}catch(e){r=!1,s.names=[],s.guarded=!1}return r},O=(e,t,s,r)=>{try{e.on(t,s,r)}catch(e){return e}};let G=0;const N=(e="")=>{const t=""+ ++G;return e?`${e}${t}`:t},J=new p("mainEventbus"),z=new p("pluginEventbus"),L=new p("testEventbus");export default p;export{y as EventbusProxy,i as EventbusSecure,J as eventbus,z as pluginEventbus,L as testEventbus};
//# sourceMappingURL=Eventbus.js.map
