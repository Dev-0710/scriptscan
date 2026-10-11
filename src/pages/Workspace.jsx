import { useDocumentContext } from '../context/DocumentContext';
import WorkspaceView from '../components/WorkspaceView';

export default function Workspace() {
  const { activeDocument } = useDocumentContext();

  if (!activeDocument) return <div className="p-8 text-center text-gray-500">No document selected.</div>;

  return <WorkspaceView activeDocument={activeDocument} />;
}
