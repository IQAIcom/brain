---
"@iqai/plugin-sequencer": patch
---
- Improves context handling, now we are passing 
	1. the pretext of model being in sequencer cycle in memory
	2. reason why its calling a action
	3. output of the action - we have this before but now a bit differently formatted
- Fixes parallel tool execution losing context due to race condition
- Fixes memory sometimes not getting added due to id conflicts, now it should be added even tho we are calling same tool multiple times
