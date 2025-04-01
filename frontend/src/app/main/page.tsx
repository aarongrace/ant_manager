'use client'
import usePlayerStatsStore from "../../context/playerStatsStore";
import { useShallow } from "zustand/shallow";

const Main = () => {
    // get current state of player stats that we care about
    const { ants, food, maxAnts, updateStats } = usePlayerStatsStore(useShallow((state) => ({
        ants: state.ants,
        food: state.food,
        maxAnts: state.maxAnts,
        updateStats: state.updateStats
    }))); // need the useShallow to avoid recursive infinite loops

    const addAnt = () => {
        if (ants < maxAnts && food > 0) {
            updateStats("food", food - 1);
            updateStats("ants", ants + 1);
        }
    }

    return (
        <div className="p-3 flex justify-center items-center flex-col">
            <p>User must be authenticated in order to be here but we haven't learned user auth yet</p>
            <img src="/ant.png" onClick={addAnt} className="transition-transform duration-300 hover:scale-110 cursor-pointer"/>
        </div>
    )
}

export default Main;
