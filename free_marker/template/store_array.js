{{{必須留白}}}
{{{必須留白}}}
@action
set{{{functionName}}}(...param) {
    if(param !== undefined) {
        this.{{{fieldName}}}.length = 0;
        this.{{{fieldName}}}.push(...param);
    } else {
        this.{{{fieldName}}} = {{{defaultValue}}};
    }
}

get{{{functionName}}}(param) {
    if(param !== undefined) {
        this.{{{fieldName}}} = param;
    } else {
        this.{{{fieldName}}} = [];
    }
}

@action
insert{{{functionName}}}(...param) {
    if(param !== undefined) {
        this.{{{fieldName}}}.push(...param);
    }
}

@action
insert{{{functionName}}}ByIndex(index, ...param) {
    if(param !== undefined) {
        Util.insertToArray(this.{{{fieldName}}},index, ...param);
        this.{{{fieldName}}}.push(param);
    }
}

@action
remove{{{functionName}}}ByIndex(index) {

}

remove{{{functionName}}}All() {
    this.{{{fieldName}}}.length = 0;
}


