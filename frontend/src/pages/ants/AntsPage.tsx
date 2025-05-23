import React from 'react';
import { useColonyStore } from '../../contexts/colonyStore';
import { Ant } from '../../gameLogic/baseClasses/Ant';
import './antsPage.css';
import deleteIcon from './delete_icon.png'; // Import the delete icon

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
    const { updateColony, ants } = useColonyStore();

    const handleDelete = async () => {
        console.log(`Deleting unit with id: ${ant.id}`);
        updateColony({
            ants: ants.filter((a) => a.id !== ant.id),
        });
    };
    
    return (
        <div className={`unit-bubble ${ant.type.toLowerCase()}`}>
            <button className="delete-button" onClick={handleDelete}>
                <img src={deleteIcon} alt="X" width="15" height="15" />
            </button>
            <h4>{ant.type} {ant.name}</h4>
            <p>Age: {ant.age} {ant.age <= 1 ? 'day' : 'days'} </p>
            <p>Task: {ant.task}</p>
        </div>
    );
};

export default AntsPage;