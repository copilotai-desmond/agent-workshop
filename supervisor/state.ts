import { Annotation, MessagesAnnotation } from "@langchain/langgraph";

export const graphState = Annotation.Root({
    ...MessagesAnnotation.spec,
    currentLocation: Annotation<string>,
    possibleDestinations: Annotation<string[]>({
        reducer: (a, b) => a.concat(b),
        default: () => [],
    }),
});

export type GraphState = typeof graphState.State;

export const workerState = Annotation.Root({
    currentLocation: Annotation<string>,
    possibleDetainations: Annotation<string[]>({
        reducer: (a, b) => a.concat(b),
        default: () => [],
    }),
});
export type WorkerState = typeof workerState.State;