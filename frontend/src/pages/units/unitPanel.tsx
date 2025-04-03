import React, { useEffect } from 'react';
import { getAllowedTasks, TaskType, Unit, AdultUnit, BroodUnit, deleteUnit, fetchUnits } from './units.service';
import './unitPanel.css';
import deleteIcon from './delete_icon.png'; // Import the delete icon

const UnitPanel: React.FC = () => {


    return (
        <div>
            <h3>Ant Colony Status</h3>
            {/* <div className="unit-panel">
                {units.map(unit => (
                    <UnitBubble key={unit.id} unit={unit} />
                ))}
            </div> */}
        </div>
    );
};

// const UnitBubble: React.FC<{ unit: Unit }> = ({ unit }) => {
//     const { units, setUnits, refetchUnits } = useUnitsContext();

//     const updateTask = async (event: React.ChangeEvent<HTMLSelectElement>) => {
//         const newTask = event.target.value as TaskType;
//         if (unit instanceof AdultUnit) {
//             unit.task = newTask;
//             await unit.update();
//         }
//         refetchUnits();
//     };

//     const handleDelete = async () => {
//         console.log(`Deleting unit with id: ${unit.id}`);
//         await deleteUnit(unit.id);
//         refetchUnits();
//     };
    
// // for god knows what reason instanceof is not working randomly
//     // const unitClassification = unit instanceof AdultUnit ? unit.unit_type : (unit as BroodUnit).stage_type;

//     // okay for whatever reason, changing the units.service.ts even trivially breaks the objects that were stored in 3000 and likely resets them to plain Unit instead of specific types. Refreshing works
//     // for god knows what reason instanceof is not working randomly
//     // const unitClassification = unit instanceof AdultUnit ? unit.unit_type : (unit as BroodUnit).stage_type;

//     // okay for whatever reason, changing the units.service.ts even trivially breaks the objects that were stored in 3000 and likely resets them to plain Unit instead of specific types. Refreshing works
//     var unitClassification = ""; 
//     if ('unit_type' in unit) {
//         unitClassification = (unit as AdultUnit).unit_type;
//     } else if ('stage_type' in unit) {
//         unitClassification = (unit as BroodUnit).stage_type;
//     } else {
//         console.log("here is the unit");
//         console.log(unit);
//         throw new Error("Invalid unit type");
//     }

//     return (
//         <div className={`unit-bubble ${unitClassification.toLowerCase()}`}>
//             <button className="delete-button" onClick={handleDelete}>
//                 <img src={deleteIcon} alt="X" width="15" height="15" />
//             </button>
//             <h4>{unitClassification} {unit.name}</h4>
//             {unit instanceof AdultUnit && <p>Productivity: {unit.productivity}</p>}
//             {unit instanceof BroodUnit && <p>Potential: {unit.potential}</p>}
//             <p>Age: {unit.age} {unit.age <= 1 ? 'day' : 'days'} </p>
//             {unit instanceof AdultUnit && (
//                 <div className="task-container">
//                     <p>Task:</p>
//                     <select value={unit.task} onChange={updateTask}>
//                         {getAllowedTasks(unit.unit_type).map(task => (
//                             <option key={task} value={task}>{task}</option>
//                         ))}
//                     </select>
//                 </div>
//             )}
//         </div>
//     );
// };

export default UnitPanel;