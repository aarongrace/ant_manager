# Ant Manager
![demo](./ant_manager_demo.gif)
## Game Overview
This game simulates a colony of ants. Players manages two main types of units:

### Adult Units
Adult units are the mature members of the colony with specific roles. They include:

- **Queens**: Responsible for reproduction.
- **Workers**: Forage for supplies and build structures. (yet to be implemented)
- **Soldiers**: Patrol and forage.(yet to be implemented)

### Brood Units
Brood units are the developmental stages of ants. They include:

1. **Egg**
   Fertilized egg which contains an embryo
   - **Duration**:  3 to 5 days.
2. **Larva**  
   The ant baby starts to be fed by workers and grows quickly (cared_by not yet implemented)
   - **Duration**: 1 to 3 weeks.
3. **Pupa**  
   No longer actively feeding or moving. Larva undergoes metamorphosis
   - **Duration**: 1 to 2 weeks

Brood units mature into adult units through these stages, and once fully mature, they can take on roles like **Workers**, **Soldiers**, or **Queens**. The roles are determined by chance, and they each start out with a random task, except for the queen, which always starts out laying eggs

## How to Run the Application
##### Activate .venv
Navigate to the root folder of the project and activate the python virtual environment:

   - On macOS/Linux:
     ```bash
     source .venv/bin/activate
     ```
   - On Windows:
     ```bash
     .\.venv\Scripts\activate
     ```

##### Staring the Frontend and Backend
Run ```npm start``` in the root folder, which will launch the npm concurrently module. The frontend should be hosted at ```http://localhost:3000``` and the backend at ```http://localhost:8000```.

If there are missing modules, use ```npm install``` to install them.

### Frontend Setup

The frontend uses **React** with several key components and features, including **React Router** for navigation and **Contexts** for global state management.

#### React Router Setup

The application uses **React Router** to manage navigation between different pages. The following routes are defined:

1. `/` - **Dashboard**  
   - Displays a placeholder dashboard for the application.

2. `/profile` - **Profile**  
   - Displays a placeholder profile page for the user.

3. `/units` - **UnitPanel**  
   - Displays unit information (adults and broods) and allows for operations such as changing tasks or removing specific ants from the colony.

The navigation links are displayed in the header, allowing users to switch between these pages seamlessly.

#### Contexts

The application uses **React Context** to manage global state. Two contexts are defined:

1. **UnitsContext**  
   - Manages the state of all units (adults and broods) in the colony.
   - Provides the following:
     - `units`: The current list of units.
     - `setUnits`: A function to update the list of units.
     - `refetchUnits`: A function to fetch the latest units from the backend.
   - This context is used across components like `UnitPanel` and `CommandPanel` to ensure consistent and centralized state management.

2. **MessageContext** (Currently Unused)  
   - Previously used for app-wide messaging, but its functionality has been replaced by `UnitsContext`. It remains in the codebase but is not actively used.

---

### Key Components

1. **CommandPanel**  
   - Sends requests to the backend to trigger actions (e.g., advancing the time cycle or resetting the units).
- Uses `UnitsContext` to refetch the updated list of units after backend operations.
   
2. **UnitPanel**  
   - Displays unit information (adults and broods) and allows for operations such as changing tasks or removing specific ants from the colony.
   - Uses `UnitsContext` to access and manage the global `units` state.

3. **Dashboard**  
   - A placeholder component rendered at the `/` route.

4. **Profile**  
   - A placeholder component rendered at the `/profile` route.

---

### Backend Setup

The backend is built with **FastAPI**, which handles all routes and business logic. The main router connects to various other routers, including the **unit router**, and will eventually handle **resources** and **buildings** routers as well.

#### Main Router

- The **main router** is responsible for processing a **POST** request to advance the time cycle. This is the only operation it handles at the moment.
- The **main router** only connects to the **unit router** right now, but in the future, other routers for buildings and resources will be implemented.

#### Unit Router

- The **unit router** handles actions specific to **units** (adults and broods). It supports **GET** and **DELETE** operations, while **POST** and **PUT** requests are restricted to specific unit categories.
- Once the "advance" message is received , the **unit router** cycles through the units and call the advance_time_cycle() of each. After the units have been updated, the main router returns the ready message, which then allows the units to be refetched.

This setup ensures clear separation of concerns, with the **main router** handling time advancement and coordination with other routers, while the **unit router** focuses on unit-specific actions.

- The **unit router** supports **GET** and **DELETE** operations for both the **units/** endpoint and the category-specific routers. It forwards **GET** and **DELETE** requests to the appropriate category router based on the unit ID.
- However, **PUT** and **POST** operations are restricted and can only be performed on the specific category router for that unit type (e.g., adults or broods).

#### Adults API

This file defines the API endpoints and logic for managing adult units in the ant colony simulation. It uses FastAPI to handle HTTP requests and Pydantic for data validation.

##### AdultUnit Class
- Represents an adult unit with attributes: `unit_type`, `productivity`, and `task`.
- Includes `field_validator` for `productivity` to ensure it is between 1 and 100.
- Includes `field_validator` for `task` to ensure it is valid for the unit type.
- Defines the `advance_time_cycle` method to handle the aging and task execution of adult units.

##### advance_time_cycle Method
- Increments the age of the adult unit.
- Uses a random chance to determine if the unit dies based on its `death_factor`.
- Calls `do_tasks` to perform the unit's assigned task.

##### get_death_factor Method
- Returns the death factor based on the unit type:
  - **Queen**: 12000 (16.4 years)
  - **Worker**: 400 (6.6 months)
  - **Soldier**: 600 (10 months)
  - **Default**: 1000

##### do_tasks Method
- Uses a random chance to determine if the unit performs its task.
- If the task is `lay_eggs`, calls `lay_egg`.

##### lay_egg Method
- Adds new brood units based on the number of eggs laid.

### Broods API

This file defines the API endpoints and logic for managing brood units in the ant colony simulation. It uses FastAPI to handle HTTP requests and Pydantic for data validation.


##### BroodUnit Class
- Represents a brood unit with attributes: `stage_type`, `caredBy`, and `potential`.
- Includes a `field_validator` for `potential` to ensure it is between 1 and 100.
- Defines the `advance_time_cycle` method to handle the maturation process of brood units.

##### advance_time_cycle Method
- Increments the age of the brood unit.
- Uses a random chance to determine if the unit matures to the next stage.
  - **Egg to Larva**: 3 to 5 days.
  - **Larva to Pupa**: 1 to 3 weeks.
  - **Pupa to Adult**: 1 to 2 weeks.
- Calls `transform_to_adult` when the unit matures from pupa to adult.

##### transform_to_adult Method
- Determines the type of adult unit (Queen, Soldier, Worker) based on random chance.
- Assigns a task to the new adult unit.
- Adds the new adult unit and removes the matured brood unit from the list.


## Development Notes
The conversion between camel case and snake case is NOT automatic when sending data between frontend and backend. Please only use snake case for all class fields relating to backend data such as tasks or units!!! Mismatches in field names will result in **422 Unprocessable Entity** when sending objects.

### npm Modules
If you want to install a npm module for the frontend, you need to cd to the frontend folder and install it there with npm install .... The npm package.json and node modules in the root folder are only used for concurrently and installing packages there might confuse VSCode into thinking that certain modules are enabled for the frontend when they are not

## Versions

### 2.0
The whole project has been completely refactored such that all game behavior related functions are relegated to the backend
Instead of creating new units and sending them to the backend, the new approach is to have the frontend send a message to advance the time cycle to the main router, which then deals with the logic
This is so that Unit objects would not be passed back and forth between the front end and the back end, which causes endless headaches with pydantic, as the front end class declarations do not clearly line up with those from the back end. Deserialization and serialization work extremely poorly when dealing with abstract classes and inheritance, as pydantic requires precision