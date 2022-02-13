let words = [];
let allowed = [];
let guessIndex = 0;
let charIndex = 0;
let target = '';
let played = false;
let win = false;
let language = 'eng';
const keyboard_eng = ['qwertyuiop', 'asdfghjkl', '!zxcvbnm@'];
const keyboard_heb = ['קראטוןםפ@',
    'שדגכעיחלךף', '!זסבהנמצתץ'];
let keyboard = [];
init();
function init() {
    words = language === 'eng' ? words_eng : words_heb;
    allowed = language === 'eng' ? allowed_eng : allowed_heb;
    keyboard = language === 'eng' ? keyboard_eng : keyboard_heb;
    guessIndex = 0;
    charIndex = 0;
    win = false;
    document.getElementById('wordwas').innerText = '';
    target = words[Math.floor(Math.random() * words.length)];
    if (played) {
        let letters = document.getElementsByClassName("letter");
        for (const letter of letters) {
            letter.value = '';
            letter.className = 'letter';
        }
        for (const key of document.getElementById('virtualKey').children) {
            key.style['background-color']  = '';
        }
    } else {
        document.getElementById('langSelect').addEventListener('change', function() {
            changeLanguage(this.value);
        });
        const keyEle = document.getElementById('virtualKey');
        for (const row of keyboard) {
            for (const key of row) {
                let ele = document.createElement('input');
                ele.type = 'button';
                switch (key) {
                    case '!':
                        ele.onclick = enter;
                        ele.id = 'enter';
                        ele.value = 'Enter';
                        break;
                    case '@':
                        ele.onclick = del;
                        ele.id = 'backspace';
                        ele.value = '\u232B';
                        break;
                    default:
                        ele.onclick = function () {
                            input(this.id);
                        };
                        ele.id = key;
                        ele.value = key;
                }
                keyEle.appendChild(ele)
            }
            keyEle.appendChild(document.createElement('br'))
        }
        const guesses = document.getElementById('guesses');
        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 5; j++) {
                let ele = document.createElement('input');
                ele.disabled = true;
                ele.id = i + '-' + j;
                ele.className = 'letter';
                guesses.appendChild(ele);
            }
            guesses.appendChild(document.createElement('br'))
        }
    }
    played = true;
    document.getElementById('body').style['display'] = 'block';
}
function input(char) {
    if (win) {
        return
    }
    const langIndex = language === 'eng' ? charIndex : 4 - charIndex;
    document.getElementById(guessIndex + '-' + langIndex).value = char;
    charIndex += 1;
}

function del() {
    if (charIndex > 0) {
        const langIndex = language === 'eng' ? charIndex - 1 : 4 - charIndex + 1;
        document.getElementById(guessIndex + '-' + (langIndex)).value = ' ';
        charIndex -= 1;
    }
}

function enter() {
    if (charIndex < 5) {
        return;
    }
    let input = '';
    let charCount = {};
    for (let i = 0; i < 5; i++) {
        let ele = document.getElementById(guessIndex + '-' + i);
        input += ele.value;
    }
    if (language === 'heb') {
        input = [...input].reverse().join('');
    }
    for (const char of target) {
        charCount[char] = charCount[char] === undefined ? 1 : charCount[char] + 1
    }
    if (allowed.indexOf(input.toLowerCase()) === -1) {
        let ele = document.getElementById('badword');
        ele.classList.add('show');
        setTimeout(function(){ ele.className = ele.className.replace("show", ""); }, 2000);
        return
    }
    for (let [i, char] of Object.entries(input)) {
        const langIndex = language === 'eng' ? i : 4 - i;
        let ele = document.getElementById(guessIndex + '-' + langIndex);
        if (char === target[i] && charCount[char]) {
            // green
            ele.className = 'letter letterHit';
            charCount[char] = charCount[char] - 1;
            document.getElementById(char).style['background-color']  = '#6aaa64'
        }
    }
    for (let [i, char] of Object.entries(input)) {
        const langIndex = language === 'eng' ? i : 4 - i;
        let ele = document.getElementById(guessIndex + '-' + langIndex);
        if (ele.className.indexOf('letterHit') !== -1) {
            continue
        }
        if (target.indexOf(char) !== -1 && charCount[char]) {
            // yellow
            ele.className = 'letter letterSemiHit';
            charCount[char] = charCount[char] - 1;
            const key = document.getElementById(char);
            if (key.style['background-color'] !== '#6aaa64') {
                key.style['background-color'] = '#c9b458';
            }
        }
        else {
            // grey
            ele.className = 'letter letterMiss';
            const keyEle = document.getElementById(char);
            if (!keyEle.style['background-color']) {
                document.getElementById(char).style['background-color'] = '#787c7e';
            }
        }
    }
    guessIndex += 1;
    charIndex = 0;
    if (input === target) {
        $("#winModal").modal();
        document.getElementById("winText").innerHTML = 'You guessed <b>' + target + '</b>! And it only took you ' + guessIndex + ' attempts';
    }
    else if (guessIndex > 5) {
        $("#loseModal").modal();
        document.getElementById("loseText").innerHTML = 'The word was <b>' + target + '</b>. You were THIS close!';
    }
}

function changeLanguage(lang) {
    language = lang;
    for (const eleId of ['virtualKey', 'guesses']) {
        const ele = document.getElementById(eleId);
        while (ele.firstChild) {
            ele.removeChild(ele.firstChild);
        }
    }
    played = false;
    init()
}

function changeMode() {
    const switchEle = document.getElementById('lightSwitch');
    const body = document.getElementById('body');
    const modals = document.getElementsByClassName('modal-content');
    const keys =  document.getElementById('virtualKey').children;
    if (switchEle.checked) {
        body.className = 'dark';
        for (const modal of Array.from(modals).concat(Array.from(keys))) {
            modal.className = modal.className + ' dark-modal';
        }
    } else {
        body.className = '';
        for (const modal of Array.from(modals).concat(Array.from(keys))) {
            modal.className = modal.className.replace(' dark-modal', '');
        }
    }
}

document.addEventListener('keydown', function(event) {
    const regex = language === 'eng' ? /[a-z]/i : /[\u05D0-\u05EA]/;
    if(event.key === 'Backspace') {
        del();
    } else if(event.key === 'Enter') {
        enter();
        event.stopPropagation();
        event.preventDefault();
    } else if (event.key.length === 1 && (event.key.match(regex))) {
        input(event.key)
    }

});