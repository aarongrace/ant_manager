overall
units are divided into adults (queen, worker, soldier) and broods(eggs, larvae pupa)
the former have unit_types while the latter has only stage_types

### backend

Get and delete operations are allowed for the units/ endpoint  as well as the category routers
but put and post operations can only be done for its specific category

## unit_base_class.py
the base class from which broods and adults will inherit
importantly, it keeps a global counter of ids, which increment whenever a new unit is created
the id is assigned with model validator so that the id does not have to be declared when generating a new object

### note
the conversion between camel case and snake case is NOT automatic when sending data between frontend and backend. Please only use snake case for all class fields


### todos
there needs to be a better way for 




### Versions

## 2.0
The whole project has been completely refactored such that all game behavior related functions are relegated to the backend
Instead of creating new units and sending them to the backend, the new approach is to have the frontend send a message to advance the time cycle to the main router, which then deals with the logic
This is so that Unit objects would not be passed back and forth between the front end and the back end, which causes endless headaches with pydantic, as the front end class declarations do not clearly line up with those from the back end. Deserialization and serialization work extremely poorly when dealing with abstract classes and inheritance, as pydantic requires precision