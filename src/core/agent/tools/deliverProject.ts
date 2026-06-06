import { AgentActionContext } from '../ToolRegistry';
import { useCoreStore } from '../../../integration/store/coreStore';
import { useTeamStore } from '../../../integration/store/teamStore';
import { AGENTIC_SETS, getAgentSet } from '../../../data/agents';

export function deliverProject(agent: AgentActionContext, args: { output: string; imageCount?: number }): boolean {
  const store = useCoreStore.getState();
  const { output, imageCount } = args;

  // FIX #15: Only lead agent can deliver — check against actual team lead index
  const teamId = useTeamStore.getState().selectedAgentSetId;
  const activeSet = getAgentSet(teamId, useTeamStore.getState().customSystems);
  if (agent.data.index !== activeSet.leadAgent.index) return false;

  // VALIDATION: Only allowed in working or done (regeneration) phases
  if (store.phase !== 'working' && store.phase !== 'done') return false;
  
  // SAFETY: Prevent project delivery if subagents are still working (skip in 'done' phase — it's a regeneration)
  const pendingTasks = store.phase === 'done' ? [] : store.tasks.filter(t => t.status === 'in_progress' || t.status === 'on_hold');
  if (pendingTasks.length > 0) {
    const names = pendingTasks.map(t => t.title).join(', ');
    agent.appendHistory({
      role: 'user',
      content: `[SYSTEM] You cannot deliver the project yet. There are pending tasks: ${names}. All subagents must finish their work first.`,
      metadata: { internal: true }
    });
    return false;
  }

  const activeTeam = activeSet;
  const isMultimodal = activeTeam?.outputType && activeTeam.outputType !== 'text';

  if (isMultimodal) {
    store.setIsGeneratingAsset(true);
    // Pass imageCount into pendingOutputParams so AgentBrain can use it
    if (imageCount && imageCount > 1) {
      store.setPendingOutputParams({ ...store.pendingOutputParams, imageCount });
    }
    // We don't set phase to 'done' yet, AgentHost will handle generation then set phase to done.
  } else {
    store.setFinalOutput(output);
    store.setPhase('done');
  }
  
  // Mark remaining active tasks for this agent as done
  store.tasks.filter(t => t.assignedAgentId === agent.data.index && t.status === 'in_progress')
    .forEach(t => store.updateTaskStatus(t.id, 'done'));
    
  store.addLogEntry({ agentIndex: agent.data.index, action: 'delivered final project results', taskId: undefined });
  
  return true;
}
