import { ArrayResource, ControlResource, GroupResource } from "./quantum_forms";
import QuantumValidators from "./quantum_validators";

export class FormBuilder {
    group = new GroupResource();
    current_object = {};

    constructor(controls = {}, name = 'root') {
        this.build_object(controls, this.group, name);
        this.updateAllValidators(this.group.controls);
        return this.group
    }

    updateAllValidators(controls) {
        Object.keys(controls).forEach(vo =>{
            if (controls[vo] instanceof GroupResource) {
                this.updateAllValidators(controls[vo].controls);
            } else {
                controls[vo].updateValidators();
            }
        });
    }

    build_object(controls, parent) {
        this.current_object = controls;
        Object.keys(controls).forEach(control => {
            if (control !== 'validators_reference' ) {
                if (controls[control] instanceof Array) {
                    const value = parent.setControl(control, ArrayResource);
                    this.build_array(controls[control], value)
                }else if (controls[control] instanceof Object) {
                    const value =  parent.setControl(control, GroupResource);
                    this.addValidators(value, control);
                    this.build_object(controls[control], value)
                } else {
                    this.build_control(control, parent, controls[control]);
                }
            }
        });
    }

    build_array(controls, parent) {
        controls.forEach(control => {
            if (controls[control] instanceof Array) {
                const value = parent.setControl(undefined, ArrayResource);
                this.build_array(control, value)
            }
            else if (control instanceof Object) {
                const value = parent.setControl(undefined, GroupResource);
                this.addValidators(value, control);
                this.build_object(control, value)
            } else {
                this.build_control(control, parent, control);
            }
        });
    }

    build_control(control, parent, value) {
        const val = parent.setControl(control, ControlResource, value);
        this.addValidators(val, control);
    };

    addValidators(control, name) {
        if (!this.current_object.validators_reference) { return }
        const options = this.current_object.validators_reference;

        if (!options.neglect || (options.neglect !== 'all' && !options.neglect[name])) {
            control.addValidator(QuantumValidators.required);
        }

        if (options[name]) {
            control.addValidator(options[name]);
        }
        return true;
    }
}