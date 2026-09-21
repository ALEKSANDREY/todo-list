import { useEffect, useState } from 'react';

/**
 * Stash the `beforeinstallprompt` event and expose an install trigger.
 * Returns { canInstall, promptInstall }.
 */
export default function usePwaInstall() {
  const [deferred, setDeferred] = useState(null);

  useEffect(() => {
    const onPrompt = (event) => {
      event.preventDefault();
      setDeferred(event);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  const promptInstall = async () => {
    if (!deferred) return false;
    deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    return true;
  };

  return { canInstall: Boolean(deferred), promptInstall };
}
