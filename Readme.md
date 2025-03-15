# Game Overview
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


# Frontend Setup

The frontend uses **React** with two main components: **CommandPanel** and **UnitPanel**. These communicate via **App Context**, which is important as the units have to be refethced once the commands are sent to the backend which updates the units

#### Key Components

1. **CommandPanel**  
   - Sends requests to the backend to trigger actions (e.g., advancing the time cycle or resetting the units).
   
2. **UnitPanel**  
   - Displays unit information (adults and broods) and allowing for operations such as changing tasks or kicking specific ants out of the colony

# Backend Setup

The backend is built with **FastAPI**, which handles all routes and business logic. The main router connects to various other routers, including the **unit router**, and will eventually handle **resources** and **buildings** routers as well.

#### Main Router

- The **main router** is responsible for processing a **POST** request to advance the time cycle. This is the only operation it handles at the moment.
- The **main router** only connects to the **unit router** right now, but in the future, other routers for buildings and resources will be implemented.

#### Unit Router

- The **unit router** handles actions specific to **units** (adults and broods). It supports **GET** and **DELETE** operations, while **POST** and **PUT** requests are restricted to specific unit categories.
- Once the time cycle is advanced, the **unit router** fetches the updated unit data and returns it to the frontend for re-rendering.

This setup ensures clear separation of concerns, with the **main router** handling time advancement and coordination with other routers, while the **unit router** focuses on unit-specific actions.

- The **unit router** supports **GET** and **DELETE** operations for both the **units/** endpoint and the category-specific routers. It forwards **GET** and **DELETE** requests to the appropriate category router based on the unit ID.
- However, **PUT** and **POST** operations are restricted and can only be performed on the specific category router for that unit type (e.g., adults or broods).


## unit_base_class.py
the base class from which broods and adults will inherit
importantly, it keeps a global counter of ids, which increment whenever a new unit is created
the id is assigned with model validator so that the id does not have to be declared when generating a new object

# Development Notes
The conversion between camel case and snake case is NOT automatic when sending data between frontend and backend. Please only use snake case for all class fields relating to backend data such as tasks or units!!! Mismatches in field names will result in **422 Unprocessable Entity** when sending objects.

# Versions

## 2.0
The whole project has been completely refactored such that all game behavior related functions are relegated to the backend
Instead of creating new units and sending them to the backend, the new approach is to have the frontend send a message to advance the time cycle to the main router, which then deals with the logic
This is so that Unit objects would not be passed back and forth between the front end and the back end, which causes endless headaches with pydantic, as the front end class declarations do not clearly line up with those from the back end. Deserialization and serialization work extremely poorly when dealing with abstract classes and inheritance, as pydantic requires precision