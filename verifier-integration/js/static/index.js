const base_url = window.location.origin+window.location.pathname;

window.onload = () => {
    const qrBtnEl = document.querySelector('.btn-qr');
    const qrCodeEl = document.querySelector('#qrcode');

    qrBtnEl.addEventListener('click', (e) => {
        makeDisabled(qrBtnEl, false)

        fetch(base_url+'api/sign-in')
            .then(r => Promise.all([Promise.resolve(r.headers.get('x-id')), r.json()]))
            .then(([id, data]) => {
                console.log(data)
                makeQr(qrCodeEl, data)
                handleDisplay(qrCodeEl, true)
                handleDisplay(qrBtnEl, false);
                return id
            })
            .catch(err => console.log(err));

    });

}

function makeQr(el, data) {
    return new QRCode(el, {
        text: JSON.stringify(data),
        width: 300,
        height: 300,
        colorDark: "#000",
        colorLight: "#e9e9e9",
        correctLevel: QRCode.CorrectLevel.H
    });
}

function handleDisplay(el, needShow, display = 'block') {
    el.style.display = needShow ? display : 'none';
}

function makeDisabled(el, disabled, cls = 'disabled') {
    if (disabled) {
        el.disabled = true
        el.classList.add(cls);
    } else {
        el.classList.remove(cls);
        el.disabled = false;
    }
}