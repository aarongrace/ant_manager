import { Link } from "react-router-dom";
import "./guide.css"; // Import the CSS file for styling

const Guide = () => {
  return (
    <div className="guide-container">
      <h1 className="guide-title">Game Guide</h1>
      <div className="guide-columns">
        {/* Objectives Column */}
        <div className="guide-column">
          <h2 className="guide-subtitle">Objectives</h2>
          <ul className="guide-list">
            <li>Train ants to defend your colony and gather resources.</li>
            <li>Food is necessary for survival and generating new ants.</li>
            <li>Chitin can be exchanged for perks in the shop.</li>
            <li>Join clans and compete on the leaderboard.</li>
          </ul>
        </div>

        {/* Controls Column */}
        <div className="guide-column">
          <h2 className="guide-subtitle">Controls</h2>
          <ul className="guide-list">
            <li>Click on food source to assign ant to collect.</li>
            <li>Click on enemy to assign ant to attack.</li>
            <li>Right click on food or enemy to unassign.</li>
            <br />
            <li>Click a task icon to assign an ant to the task.</li>
            <li>Hover over a task icon to show task indicator.</li>
            <li>Right-click a task icon to set the assigned ant to idle.</li>
            <br />
            <li>Hold Control to show all task indicators.</li>
            <li>When control is pressed, drag to select ants.</li>
            <li>Alternatively, click on an ant to select it.</li>
            <li>When selected, click to set target:</li>
            <ul>
              <li>  Closest food source when collecting.</li>
              <li>  Closest enemy when attacking.</li>
              <li>  Target anchor point when patrolling.</li>
            </ul>
          </ul>
        </div>
      </div>

      <Link to="/dashboard" className="guide-back-button">
        Back to Dashboard
      </Link>
    </div>
  );
};

export default Guide;