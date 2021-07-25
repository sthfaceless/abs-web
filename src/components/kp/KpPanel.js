import {useState} from 'react';
import KpPanelModifiers from "components/kp/KpPanelModifiers";
import InputEstimations from "./InputEstimations";
import requestInconsistencyChecking from "utils/httputils";

const estimationTypes = {
    INTERVAL: 'Interval',
    POINT: 'Point'
}

const requestStatus = {
    NON_REQUESTED: 0,
    WAITING: 1,
    ERROR: 2,
    SUCCESS_INCONSISTENCY: 3,
    SUCCESS_NOT_INCONSISTED: 4
}

const getDefaultFields = (kpType, kpTypes) => {
    return kpType === kpTypes.QUANTS ? {} : {
        [0]: {
            value: {
                [0]: 1,
                [1]: 1
            },
            valid: true,
            className: 'is-success'
        }
    }
}

const isVisibleInput = (index, kpType, kpTypes) => {
    return kpType === kpTypes.QUANTS || (index !== 0);
}

export default function KpPanel(props) {
    const [estimationType, setEstimationType] = useState(estimationTypes.INTERVAL);
    const [baseNumber, setBaseNumber] = useState(3);
    const [status, setStatus] = useState(requestStatus.NON_REQUESTED);
    const [fields, setFields] = useState(getDefaultFields(props.kpType, props.kpTypes));
    const [validForm, setValidForm] = useState(false);
    const variablesEvaluation = {
        [props.kpTypes.CONJUCTS]: (baseNumber, index) => [...Array(baseNumber).keys()].map(
            j => ((1 << j) & index) ? 'x_{' + (j + 1) + '}' : '')
            .reduce((a, b) => a + b) || '\\emptyset',
        [props.kpTypes.DISJUNCTS]: (baseNumber, index) => [...Array(baseNumber).keys()]
            .map(j => ((1 << j) & index) ? 'x_{' + (j + 1) + '}' : '')
            .reduce((a, b) => a + b) || '\\emptyset',
        [props.kpTypes.QUANTS]: (baseNumber, index) => [...Array(baseNumber).keys()]
            .map(j => (((1 << j) & index) ? '' : '\\bar ') + 'x_{' + (j + 1) + '}')
            .reduce((a, b) => a + b),
    }
    const checkFieldValue = (value) => {
        if (!/^[0-9]+(\.[0-9]+)?$/.test(value))
            return false;
        value = Number.parseFloat(value);
        if (0 > value || value > 1.0)
            return false;
        return true
    }
    const updateValid = (valid) => {
        if (valid !== validForm)
            setValidForm(valid);
    }
    const validateForm = (__fields, __baseNumber = baseNumber) => {
        if (!__fields || (Object.keys(__fields).length < (1 << __baseNumber)))
            updateValid(false);

        for (let i = 0; i < 1 << __baseNumber; i++)
            if (!__fields[i] || !__fields[i].valid) {
                updateValid(false);
                return;
            }
        updateValid(true);
    }
    const getValueObject = (firstValue, secondValue, type = estimationType) => {
        return {
            ...{[0]: firstValue}, ...(type === estimationTypes.INTERVAL ? {[1]: secondValue} : {})
        }
    }
    const isValidFields = (firstValue, secondValue, type = estimationType) => {
        return checkFieldValue(firstValue)
            && (type === estimationTypes.POINT || (checkFieldValue(secondValue) && (secondValue - firstValue) >= 0));
    }
    const getClassName = (firstValue, secondValue, type = estimationType) => {
        if (isValidFields(firstValue, secondValue, type))
            return 'is-success';
        else if (!firstValue || (!secondValue && type === estimationTypes.INTERVAL))
            return 'is-dark';
        else
            return 'is-danger';
    }
    const updateValue = (fieldValue, num, index) => {
        const firstValue = (num === 0) ? fieldValue : (fields[index] ? fields[index].value[0] : '');
        const secondValue = (num === 1) ? fieldValue : (fields[index] ? fields[index].value[1] : '');
        const value = getValueObject(firstValue, secondValue);
        const valid = isValidFields(firstValue, secondValue);
        const className = getClassName(firstValue, secondValue);
        const __fields = {...fields, [index]: {value, valid, className}};
        setFields(__fields);
        validateForm(__fields);
    }
    const updateBaseNumber = (update) => {
        let __baseNumber = baseNumber + update;
        __baseNumber = Math.max(__baseNumber, 1);
        __baseNumber = Math.min(__baseNumber, 10);
        setBaseNumber(__baseNumber);
        const __fields = Object.keys(fields).splice(0, 1 << __baseNumber).reduce(
            (prevFields, key) => {
                return {...prevFields, [key]: fields[key]}
            }, {});
        setFields(__fields);
        validateForm(__fields, __baseNumber);
    }
    const updateEstimationType = (type) => {
        const __fields = Object.keys(fields).reduce((prevFields, key) => {
            const value = getValueObject(fields[key].value[0], fields[key].value[1], type);
            const valid = isValidFields(fields[key].value[0], fields[key].value[1], type);
            const className = getClassName(fields[key].value[0], fields[key].value[1], type);
            return {...prevFields, [key]: {value, valid, className}}
        }, {});
        setEstimationType(type);
        setFields(__fields);
        validateForm(__fields);
    }
    const validate = () => {
        validateForm(fields);
        if (!validForm || !(status === requestStatus.NON_REQUESTED || status === requestStatus.ERROR))
            return
        const data = Object.keys(fields).slice(0, 1 << baseNumber).reduce((prevData, key) => {
            return {...prevData, [key]: fields[key].value}
        }, {});
        data.type = props.kpType.toLowerCase();
        data.estimationType = estimationType.toLowerCase();
        setStatus(requestStatus.WAITING);
        requestInconsistencyChecking(data,
            (result) => {
                if (result.result)
                    setStatus(requestStatus.SUCCESS_INCONSISTENCY);
                else
                    setStatus(requestStatus.SUCCESS_NOT_INCONSISTED);
            },
            (error) => {
                setStatus(requestStatus.ERROR);
            })
    }
    const cleanState = () => {
        setStatus(requestStatus.NON_REQUESTED);
        setFields(getDefaultFields(props.kpType, props.kpTypes));
        validateForm({});
    }
    const modifyState = () => {
        setStatus(requestStatus.NON_REQUESTED);
        validateForm(fields)
    }
    return <>
        <KpPanelModifiers estimationTypes={estimationTypes} estimationType={estimationType}
                          updateEstimationType={updateEstimationType}
                          baseNumber={baseNumber} updateBaseNumber={updateBaseNumber}/>
        <div className={'kp-container__tab'}>
            {[...Array((1 << baseNumber)).keys()].map(index => {
                const variables = variablesEvaluation[props.kpType](baseNumber, index);
                const expression = '$p_{' + variables + '}$';
                return (isVisibleInput(index, props.kpType, props.kpTypes) &&
                    <InputEstimations expression={expression} key={index} estimationType={estimationType}
                                      estimationTypes={estimationTypes}
                                      modificable={status === requestStatus.NON_REQUESTED}
                                      updateValue={(value, num) => updateValue(value, num, index)}
                                      firstValue={(fields[index] && fields[index].value[0]) ? fields[index].value[0] : ''}
                                      secondValue={(fields[index] && fields[index].value[1]) ? fields[index].value[1] : ''}
                                      className={fields[index] ? fields[index].className : 'is-dark'}/>);
            })}
        </div>
        <div className="kp-container__validate level">
            <div className="level-left">
                <div
                    className={"button kp-container__validate__submit " + (validForm && (status === requestStatus.NON_REQUESTED || status === requestStatus.ERROR)
                        ? 'is-purple' : 'is-grey')}
                    onClick={() => validate()}>Validate
                </div>
            </div>
            <div className="level-right">
                <div className="kp-container__result">
                    {status === requestStatus.WAITING && <progress className="progress is-small is-primary"/>}
                    {status === requestStatus.ERROR && <p className="has-text-danger">Server error</p>}
                    {status === requestStatus.SUCCESS_INCONSISTENCY &&
                    <p className="has-text-success">Data is inconsistent!</p>}
                    {status === requestStatus.SUCCESS_NOT_INCONSISTED &&
                    <p className="has-text-danger-dark">Data is not inconsistent!</p>}
                </div>
                {status !== requestStatus.NON_REQUESTED &&
                <div className="kp-container__requested">
                    <div className="button is-purple kp-container__requested__state-changer"
                         onClick={() => modifyState()}>Modify
                    </div>
                    <div className="button is-grey-light kp-container__requested__state-changer"
                         onClick={() => cleanState()}>Clean
                    </div>
                </div>}
            </div>
        </div>
    </>
}