import { BaseMessage } from "@langchain/core/messages";
import { Annotation, messagesStateReducer } from "@langchain/langgraph";

export const StateAnnotation = Annotation.Root({
  // Messags seen so far in the conversation
  messages: Annotation<BaseMessage[]>({ reducer: messagesStateReducer, default: () => [] }),
  // The name of the human
  name: Annotation<string>,
  // The human's favorite city
  favoriteCity: Annotation<string>,
});

export type State = typeof StateAnnotation.State;