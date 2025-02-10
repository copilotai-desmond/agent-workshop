import { END, Send, START, StateGraph } from "@langchain/langgraph";
import { glob } from "glob";
import { graphState, GraphState } from "./state";
import { orchestratorNode, orchestratorNodeName } from "./orchestrator.node";
import { syncthesizerNode, synthesizerNodeName } from "./synthesizer.node";
import { generateWorkerNode } from "./worker.node";


function generateAssignWorkersNode(nodes: string[]) {
    return function (state: GraphState): Send[] {
        return nodes.map((node) => new Send(node, { currentLocation: state.currentLocation }));
    }
}

export async function getAgent() {
    // Import all of the possible agents from the agents directory
    const fileNames = await glob('./agents/**/*/agent.ts');
    const nodes = fileNames.map(async (fileName, idx) => {
        const module = await import(`${__dirname}/../${fileName}`);
        const agent = module.agent;
        const fileNameSegments = fileName.split('/');
        const agentName = fileNameSegments[fileNameSegments.length - 2];
        return [`node-${agentName}`, agent];
    });

    const graphBuilder = new StateGraph(graphState);
    
    //#region --------- Uncomment the following to dynamically add all of our agent nodes ------------
    // const nodeNames: string[] = [];
    // for (const [name, node] of await Promise.all(nodes)) {
    //     nodeNames.push(name);
    //     const worker = generateWorkerNode(name, node);
    //     graphBuilder
    //         .addNode(name, worker)
    //         .addEdge(name, synthesizerNodeName);
    // }

    // graphBuilder.addConditionalEdges(
    //     orchestratorNodeName,
    //     (state: GraphState) => {
    //         return state.currentLocation ? generateAssignWorkersNode(nodeNames)(state) : END
    //     },
    //     // @ts-ignore
    //     [END, ...nodeNames]
    // );
    //#endregion --------- Uncomment the following to dynamically add all of our agent nodes ------------
    
    return graphBuilder.compile();  
}