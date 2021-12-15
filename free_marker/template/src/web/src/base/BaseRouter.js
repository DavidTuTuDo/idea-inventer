class BaseRouter {

    currentRoute = '/';

    currentParam = [];

    isEditMode = false;

    setCurrentRoute = (route) => {
        this.currentRoute = route;
        this.isEditMode = false;
    }

    routeTo(component,path) {
        if (component !== undefined && component.props !== undefined  && component.props.history !== undefined) {
            const history = component.props.history;
            history.push(path);
            this.setCurrentRoute(path);
        }
    }

    getEditorRouteString = () => {
        const segment = this.currentRoute.split('/');
        const newbie = segment.map(
            (each, index) => {
                return index === 1 ? `${each}editor` : each
            })
        return newbie.join('/');
    }

    getDeEditorRouteString = () => {
        const segment = this.currentRoute.split('/');
        const newbie = segment.map(
            (each, index) => {
                return index === 1 ? this.getDeEditorString(each) : each
            })
        return newbie.join('/');
    }

    getDeEditorString(string) {
        const segment = string.split('editor');
        return segment.shift();
    }

    gotoEditPage = (component) => {
        this.isEditMode = !this.isEditMode;
        const {history} = component.props;
        const route = this.isEditMode ? this.getEditorRouteString() : this.getDeEditorRouteString();
        this.currentRoute = route;
        history.push(route);
    };

    setCurrentParam = (...param) => {
        this.currentParam.length = 0
        this.currentParam.push(...param);
    }

}

export default BaseRouter;
