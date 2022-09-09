const self = window.currentComponent;

self.properties({
    connected() {
        this.setAttribute("contenteditable","false");
        this.cursor = document.createElement("cursor");
        const allow = this.getAttribute("allow"),
            sandbox = this.getAttribute("sandbox"),
            iframe = this.shadowRoot.querySelector("iframe");
        if(allow!=null) iframe.setAttribute("allow",allow);
        if(sandbox!=null) iframe.setAttribute("sandbox",sandbox);
        [...this.shadowRoot.querySelectorAll("pre code[slot]")].forEach((textarea) => {
            textarea.setAttribute("spellcheck","false");
            textarea.setAttribute("contenteditable","true");
            textarea.addEventListener("beforeinput",(event) => {
                textarea.previousTextContent = textarea.textContent;
            })
            textarea.addEventListener("input",(event) => {
                event.stopImmediatePropagation();
                this.cursor.node = textarea;
                const outer = textarea.textContent.length >= textarea.previousTextContent.length ? textarea.textContent : textarea.previousTextContent,
                    inner = textarea.textContent.length > textarea.previousTextContent.length ? textarea.previousTextContent : textarea.textContent;
                for(let i=0;i<outer.length;i++) {
                    if(outer[i]!==inner[i]) {
                        textarea.offset = i + 1;
                        break;
                    }
                }
                const {target} = event,
                    name = target.getAttribute("slot"),
                    slot = this.querySelector(`slot[name="${name}"]`);
                if(name==="javascript") {
                    try {
                        iframe.contentWindow.eval(target.textContent);
                        slot.innerText = target.textContent;
                        this.render();
                    } catch(e) {
                        iframe.contentWindow.console.error(e+"");
                    }
                } else {
                    slot.innerText = target.textContent;
                    this.render();
                }
            });
            textarea.addEventListener("paste",(event) => {
                event.stopImmediatePropagation();
            })
        });
        let lastError;
        const console = iframe.contentWindow.console = this.shadowRoot.getElementById("console"),
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
            if(arg===lastError) return;
            lastError = arg;
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
            };
        iframe.contentWindow.console.clear();
        Object.entries(slots).forEach(([key,value]) => {
            const hasSlot = this.hasAttribute(key) ? this.getAttribute(key)||true : null;
            if(hasSlot!==null) {
                if(!value) {
                    value = slots[key] = document.createElement("slot");
                    value.setAttribute("name",key);
                    this.appendChild(value);
                }
            }
            const slot = this.shadowRoot.querySelector(`[slot="${key}"]`);
            if(value) {
                slot.innerText = value.textContent;
                [...value.attributes].forEach((attr) => {
                    slot.setAttribute(attr.name,attr.value);
                })
            }
            slot.parentElement.style.display = "";
            if(hasSlot==null) {
                slot.parentElement.style.display = "none";
            } else if(!hasSlot) {
                slot.setAttribute("readonly","");
                slot.setAttribute("disabled","");
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
            iframe.contentDocument.body.innerHTML = body.textContent;
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
            let node, offset
            for(const child of this.cursor.node.childNodes) {
                node = child;
                if(node.textContent.length>this.cursor.node.offset) {
                    offset = node.textContent.length - this.cursor.node.offset;
                    break;
                }
                if(node.textContent.length===this.cursor.node.offset) {
                    offset = this.cursor.node.offset;
                    break;
                }
                this.cursor.node.offset -= node.textContent.length;
            }
            if(node) {
                node = node.firstChild||node;
                if(offset===undefined && node.nodeType===Node.TEXT_NODE) offset = node.textContent.length;
                range.setStart(node,offset);
            }
            // loop through child node textContent up to the index
            // set the range at the last node + remainder of index
        }
    }
})