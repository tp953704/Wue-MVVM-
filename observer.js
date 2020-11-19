import {Dep} from './dep.js';
// 對DATA做監聽
// data:{
//    a:1,
//    b:{c:3}
// }
export function observe(data){
    if(!data || typeof data !=='object'){
        return ;
    }
    Object.keys(data).forEach((key)=>{
        ReactiveDefine(data,key,data[key],Dep)
    })
}
function ReactiveDefine(data,key,val){
    const dep = new Dep();
    observe(val);
    Object.defineProperty(data,key,{
        configurable:false,
        enumerable:true,
        get(){
            Dep.target && dep.addSub(Dep.target);
            return val;
        },
        set(newValue){
            val=newValue;
            observe(newValue)
            dep.noitify()
        }
    })
}
