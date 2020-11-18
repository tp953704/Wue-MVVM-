// 訂閱器用來儲存被劫持資料的 watchers 依賴，通知者
export class Dep {
    constructor() {
        console.log(1)
        this.subs = [];
    }
    addSub(watcher){
        console.log(watcher)
        this.subs.push(watcher);
    }
    noitify(){
        this.subs.forEach((watcher)=>{
            watcher.update();
        })
    }
}