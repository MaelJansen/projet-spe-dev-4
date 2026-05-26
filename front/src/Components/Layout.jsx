import FileManager from './FileManager';
import FileContent from './FileContent';
import Chat from './Chat';

function Layout() {
  return (
    <div className="grid min-h-screen grid-cols-12 content-start gap-4 bg-gray-50 p-4">
      <div className="col-span-2">
        <FileManager />
      </div>
      <div className="col-span-7">
        <FileContent />
      </div>
      <div className="col-span-3">
        <Chat />
      </div>
    </div>
  );
}

export default Layout;
