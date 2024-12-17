document.addEventListener('DOMContentLoaded', function () {
    const enableBtn = document.getElementById('enable-btn');
    const disableBtn = document.getElementById('disable-btn');
    const modeBtn = document.getElementById('mode-btn');

    chrome.storage.local.get('mode', function (data) {
        if (data && data.mode === 'aggressive') {
            disableBtn.remove();
            enableBtn.remove();
            modeBtn.innerText = '🌸';
            modeBtn.style.fontSize = '20px';
            modeBtn.removeEventListener('click', modeHandler);
            return;
        }
    });

    chrome.storage.local.get('state', function (data) {
        if (data.state) {
            switch (data.state) {
                case 'enabled':
                    enableBtn.style.display = 'none';
                    disableBtn.style.display = 'block';
                    return;
                case 'disabled':
                    disableBtn.style.display = 'none';
                    enableBtn.style.display = 'block';
                    return;
                default:
                    console.error('Unknown state:', data.state);
                    break;
            }
        }
    });
  
    enableBtn.style.display = 'none';
  
    enableBtn.addEventListener('click', function () {
        chrome.runtime.sendMessage({ action: 'enableExtension' });
        enableBtn.style.display = 'none';
        disableBtn.style.display = 'block';
    });
  
    disableBtn.addEventListener('click', function () {
        chrome.runtime.sendMessage({ action: 'disableExtension' });
        disableBtn.style.display = 'none';
        enableBtn.style.display = 'block';
    });

    const modeHandler = function () {
        const reply = prompt('Enable this mode will prevent you from disabling the extension. If you want to reset, reinstall this extension. Are you sure? (YES/no)');
        if (reply === 'YES') {
            chrome.storage.local.set({ mode: 'aggressive' });
            chrome.runtime.sendMessage({ action: 'enableExtension' });
            location.reload();
        }
    };

    modeBtn.addEventListener('click', modeHandler);
});