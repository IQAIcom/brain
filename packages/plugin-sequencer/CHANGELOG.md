# @iqai/plugin-heartbeat

## 0.2.2

### Patch Changes

- 0de694c: - Improves context handling, now we are passing 1. the pretext of model being in sequencer cycle in memory 2. reason why its calling a action 3. output of the action - we have this before but now a bit differently formatted
  - Fixes parallel tool execution losing context due to race condition
  - Fixes memory sometimes not getting added due to id conflicts, now it should be added even tho we are calling same tool multiple times

## 0.2.1

### Patch Changes

- fb3f873: Fixes embedding missmatch error

## 0.2.0

### Minor Changes

- b9407e5: Update Eliza packages to 0.25.9

## 0.1.11

### Patch Changes

- f0a8af5: create bamm plugin

## 0.1.10

### Patch Changes

- ccadcf8: Update packages for improved performance

## 0.1.9

### Patch Changes

- e7b604d: Adds heartbeat plugin
- 3d146e7: Fix twitter posting in heartbeat plugin
