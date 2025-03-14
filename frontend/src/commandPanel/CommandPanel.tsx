import React from 'react';
import './CommandPanel.css';
import { useAppContext } from '../App';
import { postAdvanceTimeCycle, postResetUnits } from './command.service';

const CommandPanel: React.FC = () => {
    const { setMessage } = useAppContext();

    const handleAdvanceTimeCycle = async (cycles: number) => {
        console.log(`Advancing ${cycles} time cycle(s)`);
        await postAdvanceTimeCycle(cycles);
        setMessage("refetch please");
    };

    const handleResetUnits = async ()=>{
        await postResetUnits();
        setMessage("refetch please");
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