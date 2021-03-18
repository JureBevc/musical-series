class Sequence{
    vars = [];
    expressions = {};
    initial_scope = {}
    scope = {}

    initWithSelf(){
        this.vars = Object.keys(this.expressions);
        Object.assign(this.scope, this.initial_scope);
    }

    init(expressions, scope){
        this.vars = Object.keys(expressions);
        this.expressions = expressions;
        this.initial_scope = scope;
        Object.assign(this.scope, this.initial_scope);
    }

    next_iter(note_index){
        this.scope["note_index"] = note_index;
        let new_scope = {};
        Object.assign(new_scope, this.initial_scope);
        for(var i = 0; i < this.vars.length; i++){
            let var_name = this.vars[i];
            new_scope[var_name] = math.evaluate(this.expressions[var_name], this.scope);
        }
        this.scope = new_scope;
        return this.scope["note"];
    }
}