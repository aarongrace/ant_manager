overall
units are divided into adults (queen, worker, soldier) and broods(eggs, larvae pupa)
the former have unit_types while the latter has only stage_types

### backend

Get and delete operations are allowed for the units/ endpoint 
but put and post operations can only be done for its specific category

## unit_base_class.py
the base class from which broods and adults will inherit
importantly, it keeps a global counter of ids, which increment whenever a new unit is created
the id is assigned with model validator so that the id does not have to be declared when generating a new object


### todos
there needs to be a better way for 