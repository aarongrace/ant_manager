import React from 'react';
import './CommandPanel.css';
import { useAppContext } from '../App';
import { postAdvanceTimeCycle } from './command.service';

const CommandPanel: React.FC = () => {
    const { setMessage } = useAppContext();

    const handleAdvanceTimeCycle = async () => {
        console.log("Advancing one time cycle");
        await postAdvanceTimeCycle(1);
        setMessage("advance time cycle");
    };

    return (
        <div className="command-panel">
            <button onClick={handleAdvanceTimeCycle}>Advance one time cycle</button>
        </div>
    );
};

export default CommandPanel;