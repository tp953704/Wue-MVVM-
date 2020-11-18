import { Dep } from "./dep.js";

export class Watcher{
    constructor(data, exp ,cb){
        this.$data = data;
        this.$exp = exp;
        this.$cb = cb;
        this.init();
    }
    update(){
        this.run();
    }
    init(){
        this._hasInit = false;
        this.value = this.get();
        this._hasInit = true;
    }
    run(){
        const newValue = this.get();
        const oldValue = this.value;
        console.log(newValue)
        if(newValue!==oldValue){
            this.value = newValue;
            
            this.$cb.call(this.$data,newValue,oldValue)
        }
    }
    get(){
        !this._hasInit && (Dep.target = this)
        const value = this._getDataVal(this.$exp);
        Dep.target = null;
        return value;
    }
    _getDataVal(exp){
        let value = this.$data;
        exp = exp.split('.');
        exp.forEach((k)=>{
            value = value[k];
        })
        return value
    }
}