{{{必須留白}}}
{{{必須留白}}}
async fetch{{{functionName}}}() {
    const result = await remoter.fetch(this.getUrlOf{{{functionName}}}(), this.ruleOf{{{functionName}}}());
    /** this.state = LOADING, STABLE, ERROR, EMPTY, CACHE   */
}

getUrlOf{{{functionName}}}(){
    return `{{{fieldUrl}}}`;
}

ruleOf{{{functionName}}}(){
    /** override in concrete class */
}


async post{{{functionName}}}(param) {

}

async posts{{{functionName}}}(...param) {

}

async patch{{{functionName}}}(uid, param) {

}

async delete{{{functionName}}}ById(uid) {

}

async delete{{{functionName}}}All() {

}


