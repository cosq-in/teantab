import { useTea } from './store';
import Onboarding from './screens/Onboarding';
import Home from './screens/Home';
import Thread from './screens/Thread';
import Dossier from './screens/Dossier';
import WebThread from './screens/WebThread';
import Me from './screens/Me';
import FileFlag from './screens/FileFlag';

export default function App() {
  const t = useTea();
  const v = t.view;
  return (
    <div className="stage"><div className="phone">
      <div className="cloud" style={{ left: '8%', top: '14%', width: 90, height: 34, animation: 'drift 8s ease-in-out infinite alternate' }} />
      <div className="cloud" style={{ right: '6%', top: '30%', width: 110, height: 30, animation: 'drift 10s ease-in-out infinite alternate-reverse' }} />
      {t.onboard ? <Onboarding t={t} /> : (
        <>
          <Home t={t} />
          {v && (
            <div className="col panel" style={{ position: 'absolute', inset: 0, background: 'var(--cream)', zIndex: 5, animation: 'slide .25s ease-out' }}>
              <div className="grass" style={{ flex: 'none', height: 22 }} />
              {v.k === 'thread' && <Thread t={t} id={v.id} />}
              {v.k === 'dossier' && <Dossier t={t} id={v.id} />}
              {v.k === 'web' && <WebThread t={t} id={v.id} />}
              {v.k === 'me' && <Me t={t} />}
              {v.k === 'file' && <FileFlag t={t} />}
            </div>
          )}
          {!v && <div className="panel-empty"><div className="px" style={{ fontSize: 28 }}>pick some tea</div><div style={{ maxWidth: 320, fontSize: 15, lineHeight: 1.5, color: 'var(--sub)' }}>Open a thread to read and reply, tap a client to see their record, or flag one of your own.</div></div>}
        </>
      )}
    </div></div>
  );
}
