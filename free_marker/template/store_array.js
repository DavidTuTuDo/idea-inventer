{{{必須留白}}}
{{{必須留白}}}
@action
set{{{functionName}}}(...param) {
    const self = this;
    if(param !== undefined) {
        this.{{{fieldName}}}.length = 0;
        this.{{{fieldName}}}.push(...param.map((each) => new {{{fieldClass}}}({...each,parentNode:self})));
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
remove{{{functionName}}}(){
    this.{{{fieldName}}}.length = 0;
}

@action
push{{{functionName}}}(...param) {
    const self = this;
    if(_.isArray(param)) {
        this.{{{fieldName}}}.push(...param.map((each) => new {{{fieldClass}}}({...each,parentNode:self})));
    }
}

@action
push{{{functionName}}}ByIndex(index, ...param) {
    const self = this;
    if(param !== undefined) {
        Util.insertToArray(this.{{{fieldName}}},index, ...param.map((each) => new {{{fieldClass}}}({...each,parentNode:self})));
    }
}

@action
remove{{{functionName}}}ByIndex(index) {

}


