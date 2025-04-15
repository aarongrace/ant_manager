import React, { useEffect } from 'react';
import deleteIcon from './delete_icon.png'; // Import the delete icon
import { useColonyStore } from '../../contexts/colonyStore';
import { Ant } from '../../baseClasses/Ant';
import './antsPage.css'

const AntsPage: React.FC = () => {

    const { ants } = useColonyStore();

    return (
        <div>
            <h3>Ants in the Colony</h3>
            <div className="unit-panel">
                {ants.map(ant => (
                    <UnitBubble key={ant.id} ant={ant} />
                ))}
            </div>
        </div>
    );
};

const UnitBubble: React.FC<{ ant: Ant }> = ({ ant: ant }) => {

    // const updateTask = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    //     const newTask = event.target.value as TaskType;
    //     if (ant instanceof AdultUnit) {
    //         ant.task = newTask;
    //         await ant.update();
    //     }
    //     refetchUnits();
    // };

    const handleDelete = async () => {
        console.log(`Deleting unit with id: ${ant.id}`);
        // await deleteUnit(ant.id);
        // refetchUnits();
    };
    
    return (
        <div className={`unit-bubble ${ant.type.toLowerCase()}`}>
            <button className="delete-button" onClick={handleDelete}>
                <img src={deleteIcon} alt="X" width="15" height="15" />
            </button>
            <h4>{ant.type} {ant.name}</h4>
            <p>Age: {ant.age} {ant.age <= 1 ? 'day' : 'days'} </p>
            <p>Task: {ant.task}</p>
            <p>Position: ({ant.position.x}, {ant.position.y})</p>
        </div>
    );
};

export default AntsPage;