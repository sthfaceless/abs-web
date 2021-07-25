import {useState} from 'react';
import KpPanel from "./KpPanel";

export const knowledgePatternTypes = {
    CONJUCTS: 'Conjucts',
    DISJUNCTS: 'Disjuncts',
    QUANTS: 'Quants'
}
export default function KP() {
    const [kpType, setKpType] = useState(knowledgePatternTypes.CONJUCTS);
    return (<div className={'kp-container'}>
            <h1 className={'kp-container__title title'}>
                Inconsistency checking
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
            <KpPanel kpType={kpType} kpTypes={knowledgePatternTypes}/>
        </div>
    );
}