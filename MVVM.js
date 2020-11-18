import {observe} from "./observer.js";
import {Complier} from "./compiler.js";
import {Dep} from './dep.js';

export class MVVM{
    constructor(options){
        this.$Dep = Dep;
        this.$options=options;
        this.$data = this.$options.data;
        this.$compute = this.$options.computed;
        this.$methods = this.$options.methods;
        // 先將所有資料綁定到 MVVM 實例上
        this.walk(this.$data,(key)=>{this._proxyData(key)})
        this.walk(this.$compute,(key)=>{this._proxyComputed(key)})
        this.walk(this.$methods,(key)=>{this._proxyMethods(key)})
        // 再進行初始化，因為 Compiler 必須用到所有的 computed 跟 methods
         this.$el = this.$options.el || document.body;
        this.init();
    }
    init(){
        // console.log([this.$el, document.body])
        new observe(this.$data);
        new Complier(this.$el,this)
    }
    walk(data,fn){
        return Object.keys(data).forEach(fn);
    }
    _proxyData(key){
        const self = this;
        Object.defineProperty(self,key,{
            enumerable:true,
            configurable:false,
            get(){
                return self.$data[key];
            },
            set(nV){
                self.$data[key] = nV;
            }
        })
    }
    _proxyComputed(key){
        const self = this;
        const computed = this.computed;
        if(typeof computed === 'object'){
            Object.defineProperty(self, key, {
                get: typeof computed[key] === 'function' 
                        ? computed[key]
                        : computed[key].get,
                set: typeof computed[key] !== 'function'
                        ? computed[key].set
                        : function() {}
            });
        }
    }
    _proxyMethods(key){
        const self = this;
        const methods = this.$method;
        if (typeof methods === 'object') {
            Object.defineProperty(self, key, {
              get: typeof methods[key] === 'function' 
                      ? () => methods[key] 
                      : function() {},
              set: function() {}
            });
        }
    }
}