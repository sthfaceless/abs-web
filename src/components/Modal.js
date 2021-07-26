import {useContext} from "react";
import {ApplicationContext} from "components/ABSApplication";

export default function Modal() {
    const {context, updateContext} = useContext(ApplicationContext);
    const closeModal = () => updateContext({...context, modal: {...context.modal, active: false}});
    return (<div className={"modal" + (context.modal.active ? ' is-active' : '')}>
        <div className="modal-background"
             onClick={() => closeModal()}></div>
        <div className="modal-card">
            <div className="modal-card-head">
                {context.modal.title}
            </div>
            <div className="modal-card-body">
                {context.modal.content}
            </div>
            <div className="modal-card-foot">{context.modal.footer}</div>
        </div>
        <button className="modal-close is-large" aria-label="close"
                onClick={() => closeModal()}></button>
    </div>)
}