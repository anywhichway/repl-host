function css_sanitize(css) {
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.style.width = "10px";
    iframe.style.height = "10px";
    document.body.appendChild(iframe);
    const style = iframe.contentDocument.createElement('style');
    style.innerHTML = css;
    iframe.contentDocument.head.appendChild(style);
    const sheet = style.sheet,
        result = Array.from(style.sheet.cssRules).map(rule => rule.cssText || '').join('\n');
    iframe.remove();
    return result;
}

self.properties({
    initialize() {
        this.addEventListener("keydown",(event) => {
            event.stopImmediatePropagation();
        })
    },
    connected() {
        this.setAttribute("contenteditable","false");
        this.cursor = document.createElement("cursor");
        const iframe = this.shadowRoot.querySelector("iframe");
        [...this.shadowRoot.querySelectorAll("pre code[slot]")].forEach((textarea) => {
            textarea.addEventListener("beforeinput",(event) => {
                textarea.previousTextContent = textarea.textContent;
            })
            textarea.addEventListener("input",(event) => {
                event.stopImmediatePropagation();
                this.cursor.node = textarea;
                if(textarea.getAttribute("slot")==="css") {
                    textarea.normalize();
                    // textarea.innerText =  css_sanitize(textarea.textContent); // started breaking in v8, not sure why
                }
                const {target} = event,
                    name = target.getAttribute("slot"),
                    slot = this.querySelector(`slot[name="${name}"]`);
                if(name==="javascript") {
                    try {
                        iframe.contentWindow.eval(target.textContent);
                    } catch(e) {
                        iframe.contentWindow.console.error(e+"");
                    }
                }
                const outer = textarea.textContent.length >= textarea.previousTextContent.length ? textarea.textContent : textarea.previousTextContent,
                    inner = textarea.textContent.length > textarea.previousTextContent.length ? textarea.previousTextContent : textarea.textContent;
                for(let i=0;i<outer.length;i++) {
                    if(outer[i]!==inner[i]) {
                        textarea.start = textarea.textContent.substring(0,i+1);
                        break;
                    }
                }
                slot.innerText = target.textContent;
                this.render();
            });
            textarea.addEventListener("paste",(event) => {
                event.stopImmediatePropagation();
            })
            textarea.addEventListener("click",(event) => {
                event.stopImmediatePropagation();
            })
        });
        let lastError;
        const console = iframe.contentWindow.console = this.shadowRoot.querySelector("div.console"),
            log = (color,...args) => {
                const div = iframe.contentDocument.createElement("div");
                div.style.color = color;
                args.forEach((arg) => {
                    const span = iframe.contentDocument.createElement("span");
                    if(arg && typeof(arg)==="object") {
                        try {
                            span.innerText = JSON.stringify(arg);
                        } catch (e) {
                            span.innerText = arg;
                        }
                    } else {
                        span.innerText = arg;
                    }
                    div.appendChild(span);
                });
                console.appendChild(div);
            };
        console.log = (...args) => log("black",...args);
        console.warn = (...args) => log("orange",...args);
        console.error = (arg) => {
            if(arg+""===lastError) return;
            lastError = arg+"";
            log("red",arg);
        }
        console.clear = () => console.innerHTML = "";
    },
    render() {
        const iframe = this.shadowRoot.querySelector("iframe"),
            slots = {
                head: this.querySelector('slot[name="head"]'),
                css: this.querySelector('slot[name="css"]'),
                body: this.querySelector('slot[name="body"]'),
                javascript: this.querySelector('slot[name="javascript"]')
            },
            style = this.querySelector('slot[name="replstyle"]');
        if(style) {
            this.shadowRoot.getElementById("replstyle").innerHTML = style.textContent;
        }
        ["allow","allowfullscren","allowpaymentrequest","csp","sandbox"].forEach((name) => {
            const value = this.getAttribute(name);
            if(value!=null) iframe.setAttribute(name,value)
        });
        iframe.contentWindow.console.clear();
        Object.entries(slots).forEach(([key,value]) => {
            const hasSlot = this.hasAttribute(key) ? this.getAttribute(key)||true : "false";
            if(hasSlot==="false") {
                this.querySelector(`slot[name=${key}]`)?.remove();
            } else {
                if(!value) {
                    value = slots[key] = document.createElement("slot");
                    value.setAttribute("name",key);
                    this.appendChild(value);
                }
            }
            const slot = this.shadowRoot.querySelector(`[slot="${key}"]`);
            slot.setAttribute("spellcheck","false");
            let hidden;
            if(value) {
                const readonly = value.getAttribute("readonly")==="true"||value.getAttribute("readonly")===""||hasSlot==="readonly";
                if(!readonly) slot.setAttribute("contenteditable","true");
                if(key==="body") {
                    slot.innerText = value.innerHTML;
                } else {
                    slot.innerText = value.textContent;
                }
                hidden = value.hasAttribute("hidden") && value.getAttribute("hidden")!=="false";
                if(hidden) slot.parentElement.style.display = "none";
            }
            if(!hidden) slot.parentElement.style.display = "";
            if(hasSlot==="false") {
                slot.parentElement.style.display = "none";
            } else if(hasSlot==="readonly" || hasSlot==="disabled") {
                slot.setAttribute("readonly","");
                slot.setAttribute("disabled","");
                slot.setAttribute("contenteditable","false");
            } else if(hasSlot==="hidden") {
                slot.parentElement.style.display = "none";
            }
        })
        iframe.contentDocument.head.innerHTML = "";
        if(slots.head) {
            const head = this.shadowRoot.querySelector('[slot="head"]');
            hljs.highlightElement(head);
            iframe.contentDocument.head.innerHTML = head.textContent;
        }
        if(slots.css) {
            const css = this.shadowRoot.querySelector('[slot="css"]'),
                style = document.createElement("style");
            style.innerText = css.textContent;
            hljs.highlightElement(css);
            iframe.contentDocument.head.appendChild(style);
        }
        iframe.contentDocument.body.innerHTML = "";
        if(slots.body) {
            const body = this.shadowRoot.querySelector('[slot="body"]');
            [...slots.body.attributes].forEach((attr) => {
                if(attr.name!=="name") iframe.contentDocument.body.setAttribute(attr.name,attr.value);
            });
            hljs.highlightElement(body);
            iframe.contentDocument.body.innerHTML = body.innerText;
        }
        if(slots.javascript) {
            const javascript = this.shadowRoot.querySelector('[slot="javascript"]'),
                script = document.createElement("script");
            [...slots.javascript.attributes].forEach((attr) => {
                if(attr.name!=="name") script.setAttribute(attr.name,attr.value);
            });
            script.innerHTML = javascript.textContent;
            hljs.highlightElement(javascript);
            iframe.contentDocument.body.appendChild(script);
        }
        if(this.cursor.node) {
            const selection = document.getSelection();
            selection.extend(this.cursor.node);
            const range = selection.getRangeAt(0);
            let offset, text = this.cursor.node.start;
            const findNode = (node) => {
                for(const child of node.childNodes) {
                    node = child;
                    if(node.textContent.length>=text.length) {
                        if(node.childNodes.length>0) {
                            node = findNode(node);
                            if(text.length===0) break;
                        } else {
                            offset = text.length;
                            if(this.cursor.node.previousTextContent.length>this.cursor.node.textContent.length) {
                                --offset;
                            }
                        }
                        break;
                    }
                    if(text.startsWith(node.textContent)) {
                        text = text.substring(node.textContent.length);
                        if(text.length===0) {
                            offset = 1;
                            break;
                        }
                    }
                }
                return node;
            }
            const node = findNode(this.cursor.node);
            if(node) {
                if(offset===undefined && node.nodeType===Node.TEXT_NODE) offset = node.textContent.length;
                range.setStart(node,offset);
            }
            // loop through child node textContent up to the index
            // set the range at the last node + remainder of index
        }
    }
})



