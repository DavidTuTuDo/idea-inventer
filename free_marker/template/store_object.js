{{{必須留白}}}
{{{必須留白}}}
@action
set{{{functionName}}}(param) {
    if(param !== undefined) {
        this.{{{fieldName}}} = new {{{fieldClass}}}({...param,parentNode:this});
    } else {
        this.{{{fieldName}}} = new {{{fieldClass}}}();
    }
}

get{{{functionName}}}() {
    if(this.{{{fieldName}}} !== undefined) {
        return this.{{{fieldName}}};
    } else {
        return new {{{fieldClass}}}();
    }
}


