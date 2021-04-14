{{{必須留白}}}
{{{必須留白}}}
async fetch() {
    /** this.state = loading, stable, error,   */
    try {
        this.setState(`loading`);
        this.fromJson(this.filter(((await this.fetchValue(`{{{fieldUrl}}}`)).val())));
        this.setState(`stable`);
    } catch(error) {
        this.setErrorMsg(error.message);
        this.setState(`error`);
    }
}

{{{缺少POST}}}
{{{缺少PATCH}}}
{{{必須DELETE}}}


