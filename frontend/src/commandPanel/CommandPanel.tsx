import React, { use } from 'react';
import './commandPanel.css';
import { useMessageContext, useUnitsContext } from '../App';
import { postAdvanceTimeCycle, postResetUnits } from './command.service';

const CommandPanel: React.FC = () => {
    // const { setMessage } = useMessageContext();
    const { units, setUnits, refetchUnits } = useUnitsContext();

    const handleAdvanceTimeCycle = async (cycles: number) => {
        console.log(`Advancing ${cycles} time cycle(s)`);
        await postAdvanceTimeCycle(cycles);
        refetchUnits();
    };

    const handleResetUnits = async ()=>{
        await postResetUnits();
        refetchUnits();
    }

    return (
        <div className="command-panel">
            <button onClick={() => handleAdvanceTimeCycle(1)}>Advance one day</button>
            <button onClick={() => handleAdvanceTimeCycle(5)}>Advance five days</button>
            <button onClick={() => handleAdvanceTimeCycle(20)}>Advance twenty days</button>
            <button onClick={() => handleResetUnits()}>Reset units</button>

        </div>
    );
};

export default CommandPanel;