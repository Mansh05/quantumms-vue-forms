const requiredValidator = (control) => {
    return (control.value && control.value !== '') || control.value === false ? null : { required: true }
};

const patternValidator = (pattern, error = 'pattern') => {
    return (control) => {
        return pattern.test(control.value) ? null : { [error]: true }
    }
};

const QuantumValidators = {
    required: requiredValidator,
    pattern: patternValidator
};

export default QuantumValidators;