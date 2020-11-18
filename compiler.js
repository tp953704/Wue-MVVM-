import { Watcher } from './watcher.js';

// 需要編譯的元素轉為Fragment 的形式處理
export class Complier {
    constructor(el, data) {
        this.$el = el;
        this.$data = data;
        if(this.$el){
            let domEl = document.querySelector(this.$el);
            this.$fragment = this.nodeFragment(domEl);
            this.init();
            domEl.appendChild(this.$fragment);
        }
    }
    init(){
        this.complieElement(this.$fragment);
    }
    // Fragment
    nodeFragment(el){
        const fg = document.createDocumentFragment();
        let child = null;
        while(child = el.firstChild){
            fg.appendChild(child);
        }
        return fg;
    }
    // 分析節點類型
    complieElement(el){
        const childNodes = el.childNodes;
        const self = this;
        childNodes.forEach((node)=>{
            if(isElementNode(node)){
                self.complie(node)
            }
            if(isTextNode(node)){
                self.complieText(node)
            }
            if(hasChild(node)){
                self.complieElement(node)
            }
        })
    }
    // 編譯不同節點
    complie(node){
        const attrs = node.attributes;
        const self = this;
        [...attrs].forEach((attr)=>{
            const attrName = attr.name;
            // 判斷是否為 v- 開頭的屬性
            if (isDirective(attrName)) {
                const dir = attrName.substring(2); // 指令名稱
                const exp = attr.value; // 指令內容
                // 事件屬性
                if (isEventDirective(dir)) {
                    directives['eventHandler'](node, self._getDataVal(exp), dir, self.$data);
                // 一般
                } else {
                    new Watcher(this.$data, exp, function(value) {
                        directives[dir](node, value);
                    });
                    directives[dir](node, self._getDataVal(exp));
                }
                // 移除專用屬性
                node.removeAttribute(attrName);
            }
        })
    }
    complieText(node) {
        const text = node.textContent,
              self = this,
              reg = /\{\{(.*)\}\}/;
        if (reg.test(text)) {
            const { exps, value } = self.render(text.trim(), self.$data);
            directives.text(node, value);
            exps.forEach((exp) => {
                new Watcher(this.$data, exp, function() {
                    const { value } = self.render(text.trim(), self.$data);
                    directives.text(node, value);
                });
            });
        }
    }
    _getDataVal(exp){
        let val = this.$data;
        exp = exp.split('.');
        exp.forEach((k) => {
          val = val[k];
        });
        return val;
    }
    removeWrapper(arr) {
        let ret = [];
        arr.forEach((exp) => {
          ret.push(exp.replace(/[\{|\}]/g, '').trim());
        });
        return ret;
    }
      
    render(str, data) {
        const self = this;
        let exps = null;
        str = String(str);
        const t = function(str) {
            const re = /\{\{\s*([^\}]+)?\s*\}\}/g;
            exps = self.removeWrapper(str.match(re));
            str = str.replace(re, '" + data.$1 + "');
            return new Function('data', 'return "'+ str +'";');
        };
        let r = t(str);
        return {
            exps,
            value: r(data)
        };
    }
}


// By htmlpraser2(https://astexplorer.net/) 判斷方法
const isElementNode = (node) => {
    return node.nodeType === 1;
}
const isTextNode = (node) => {
    return node.nodeType === 3;
}
const isDirective = (attrName)=>{
    return attrName.indexOf('w-') == 0;
}
const isEventDirective = (dir)=>{
    return dir.indexOf('on') === 0;
}
const hasChild = (node) => {
    return node.childNodes && node.childNodes.length;
}

/* 指令清單 */
const directives = {
    text(node, value){
        node.textContent = value;
    },
    html(node, value){
        node.innerhtml = value;
    },
    show(node, value){
        node.style.display = Boolean(value) ? null : 'none';
    },
    eventHandler(node, value,dir,data){
        const eventType = dir.split(':')[1];
        const fn = value;
        if (eventType && fn) {
            node.addEventListener(eventType, fn.bind(data), false);
        }
    }
}