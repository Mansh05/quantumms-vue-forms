import {FormBuilder} from './form_builder.js';
import { ArrayResource, ControlResource, GroupResource, AbstractResource } from "./quantum_forms.js";
import QuantumValidators from "./quantum_validators.js";

const a = new FormBuilder({})
const b = QuantumValidators.required
