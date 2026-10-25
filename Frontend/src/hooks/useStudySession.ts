import { useContext } from "react";
import { StudySessionContext } from "./studySessionContext";

export function useStudySession() {
  const context = useContext(StudySessionContext);
  if (!context) {
    throw new Error("useStudySession must be used inside StudySessionProvider");
  }
  return context;
}
