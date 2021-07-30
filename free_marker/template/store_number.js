{{必須留白}}
{{必須留白}}
get{{functionName}}() {
    return this.{{fieldName}};
}

@action
remove{{functionName}}() {
    this.{{fieldName}} = {{{defaultValue}}};
}

@action
set{{functionName}}(param) {
    if(param !== undefined) {
        this.{{fieldName}} = param;
    } else {
        this.{{fieldName}} = {{{defaultValue}}};
    }
}

