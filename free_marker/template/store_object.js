{{{必須留白}}}
{{{必須留白}}}
@action
set{{{functionName}}}(param) {
    if(param !== undefined) {
        this.{{{fieldName}}}.initial({...param,parentNode:this});
    } else {
        this.{{{fieldName}}}.clear();
    }
}

@action
remove{{functionName}}() {
    this.{{{fieldName}}}.clear();
}

get{{{functionName}}}() {
    return this.{{{fieldName}}};
}


