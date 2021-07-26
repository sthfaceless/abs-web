import {useState, useContext} from 'react';
import KpPanel from "components/kp/KpPanel";
import {ApplicationContext} from "components/ABSApplication";

export const knowledgePatternTypes = {
    CONJUNCTS: 'Conjuncts',
    DISJUNCTS: 'Disjuncts',
    QUANTS: 'Quants'
}
const kpPanels = {
    [knowledgePatternTypes.CONJUNCTS]: <KpPanel key={knowledgePatternTypes.CONJUNCTS} kpType={knowledgePatternTypes.CONJUNCTS} kpTypes={knowledgePatternTypes}/>,
    [knowledgePatternTypes.DISJUNCTS]: <KpPanel key={knowledgePatternTypes.DISJUNCTS} kpType={knowledgePatternTypes.DISJUNCTS} kpTypes={knowledgePatternTypes}/>,
    [knowledgePatternTypes.QUANTS]: <KpPanel key={knowledgePatternTypes.QUANTS} kpType={knowledgePatternTypes.QUANTS} kpTypes={knowledgePatternTypes}/>
}
export default function KP() {
    const [kpType, setKpType] = useState(knowledgePatternTypes.CONJUNCTS);
    const {context, updateContext} = useContext(ApplicationContext);
    return (<div className={'kp-container'}>
            <h1 className={'kp-container__title title'}>
                Reconciliation
            </h1>
            <div className="kp-container__tab-links tabs">
                <ul>
                    {Object.values(knowledgePatternTypes).map(type =>
                        <li key={type} className={kpType === type ? ' is-active' : ''}>
                            <a href={'#'}
                               className={"panel__tab-link"}
                               onClick={() => setKpType(type)}>{type}</a>
                        </li>
                    )}
                </ul>
            </div>
            {kpPanels[kpType]}
        </div>
    );
}