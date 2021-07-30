{{{必須留白}}}
{{{必須留白}}}
@action
set{{{functionName}}}(...items) {
    const self = this;
    if(param !== undefined) {
        this.{{{fieldName}}}.length = 0;
        this.{{{fieldName}}}.push(...items.map((each) => each instanceof {{{fieldClass}}} ? each : new {{{fieldClass}}}({...each,parentNode:self})));
    } else {
        this.{{{fieldName}}} = {{{defaultValue}}};
    }
}

get{{{functionName}}}() {
    if(this.{{{fieldName}}} !== undefined) {
        return this.{{{fieldName}}};
    } else {
        return [];
    }
}

@action
clean{{{functionName}}}(){
    this.{{{fieldName}}}.length = 0;
}

@action
push{{{functionName}}}(...item) {
    const self = this;
    this.{{{fieldName}}}.push(...item.map((each) => each instanceof {{{fieldClass}}} ? each : new {{{fieldClass}}}({...each,parentNode:self})));
}

@action
push{{{functionName}}}ByIndex(index, ...param) {
    const self = this;
    Util.insertToArray(this.{{{fieldName}}},index, ...param.map((each) => each instanceof {{{fieldClass}}} ? each : new {{{fieldClass}}}({...each,parentNode:self})));
}

@action
remove{{{functionName}}}ByIndex(...indexes) {
    for (const index of indexes) {
        if (index < -1 && this.{{{fieldName}}}.length < index) {
            Util.appendError(`7821, index ${index} is not valid length ==>`, this.{{{fieldName}}}.length, `index ==>`, index);
            return;
        }
    }
    _.pullAt(this.{{{fieldName}}}, indexes);
}

@action
remove{{{functionName}}}(...items) {
    const indexes = [];
    for (const item of items) {
        indexes.push(_.indexOf(this.{{{fieldName}}}, item));
    }
    this.remove{{{functionName}}}ByIndex(...indexes);
}




