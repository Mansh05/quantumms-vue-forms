import { ReplaySubject, BehaviorSubject, Subject } from 'rxjs'

const validateForm = (validators, object) => {
    object.errors = {};
    let validity = true;
    validators.forEach(validator => {
       const valid = validator(object);
       if (valid) {
           object.errors = { ...object.errors, ...valid };
           validity = false;
       }
    });
    return validity;
};

export class AbstractResource {
    _value;
    _errors;
    _childrenValidity = {};
    name;
    valid = false;
    touched = false;
    validators = [];
    valueChanges = new Subject();
    statusChanges = new Subject();
    options = {
        change: (event) => {
            this.onChange(event)
        },
        keyup: () => {
            this.onChange(event)
        },
        blur: (event) => this.onTouch(event)
    };

    onChange(event) {
        this.setValue(event.currentTarget.value);
        this.changeStatus();
    }

    setValue(value) {
        this._value = value;
        this.updateValidators();
        this.valueChanges.next(value);
    }

    changeStatus() {
        this.statusChanges.next(true);
        if (this._parent) {
            this._parent.onTouch({});
        }
    }

    touchChildren() {
        // Make a deep recursive one
        Object.values(this.controls).forEach(control => {
            control.onTouch();
        });
    }

    addValidator(validator) {
        if (validator instanceof Array) {
            this.validators = this.validators.concat(validator);
        } else {
            this.validators.push(validator);
        }
    }

    updateValidators(validChild = true) {
        this.valid = validChild && validateForm(this.validators, this);
        if (this._parent) {
            this._parent._childrenValidity[this.name] = this.valid;
            this._parent.updateValidators(!this.checkParentsValidations());
        }
    }

    checkParentsValidations() {
       return Object.values(this._parent._childrenValidity).some(vo => !vo)
    }

    onTouch(event, value = true) {
        this.touched = value;
        // if (this._value && this._value !== '') { this.touched = value; }
        this.changeStatus();
    }

    setOnlyValues(value) {
        this._value = value;
        this.updateParent();
    }

    patchValue(value, name) {
        this._value[name] = value;
        this.updateParent();
        this.valueChanges.next(this._value);
        this.statusChanges.next(false);
    }

    updateParent() {
        if (this._parent) {
            this._parent.patchValue(this.value, this.name);
        } else {
            this.statusChanges.next(true);
        }
    }

    get(name) {
       return this.controls[name];
    }

    get value() {
        return this._value;
    }

    set errors(value) {
        this._errors = value;
    }

    get errors() {
        return this._errors;
    }

    set parent(parent) {
        this._parent = parent;
    }
}

export class ControlResource extends AbstractResource {
    _parent;

    constructor(val = null, parent = null, name) {
        super();
        this._parent = parent;
        this.name = name;
        this.setOnlyValues(val);
    }

    setValue(value) {
        this.setOnlyValues(value);
        this.updateValidators();
        this.valueChanges.next(value);
    }
}

export class GroupResource extends AbstractResource {
    _parent;
    controls = {};

    constructor(val = {}, parent = null, name) {
        super();
        this._parent = parent;
        this.name = name;
        this.setOnlyValues(val);
    }

    setControl(name, type, value) {
        this.controls[name] = new type(value, this, name);
        return this.controls[name];
    }
}

export class ArrayResource extends AbstractResource {
    _parent;
    length = 0;
    controls = {};

    constructor(val = [], parent, name) {
        super();
        this._parent = parent;
        this.name = name;
        this.setOnlyValues(val);
    }

    setControl(value, type) {
        this.updateLength(new type(value, this, this.length.toString()));
        return this.controls[(this.length - 1).toString()];
    }

    get array_controls() {
        return Object.values(this.controls);
    }

    updateLength(value) {
        this.controls[this.length.toString()] = value;
        this.length++;
    }

    push(control) {
        this.updatePushedData(control);
        control.updateParent();
    }

    concat(controls) {
        controls.forEach(control => {
            this.updatePushedData(control);
            control.updateParent();
        });
    }

    updatePushedData(control) {
        control.name = this.length.toString();
        control.parent = this;
        this.updateLength(control);
    }

    removeAt(index) {
        delete this.controls[index];
        this.length--;
        this.value.splice(index, 1);
        this.updateParent();
    }
}
