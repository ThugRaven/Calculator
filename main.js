const keys = document.querySelectorAll('.key');
const displayTop = document.querySelector('.display--top');
const displayBottom = document.querySelector('.display--bottom');
const historyBtn = document.querySelector('.button--history');
const historyClearBtn = document.querySelector('.button--clear');
const historyPanel = document.querySelector('.calc__history');
const historyList = document.querySelector('.history__list');
const historyText = document.querySelector('.history__text');
const backdrop = document.querySelector('.backdrop');

keys.forEach((btn) => {
	btn.addEventListener('click', (e) => {
		// Prevent mouse focused keys from clicking when pressing Enter
		if (disableEnter) {
			return;
		}
		keyClick(e.target.dataset.key);
	});
});

document.addEventListener('keydown', (e) => {
	if (e.key === 'Enter') {
		disableEnter = true;
		clearTimeout(enterTimeout);
		enterTimeout = setTimeout(() => {
			disableEnter = false;
		}, 50);
	}
	if (!isNaN(parseFloat(e.key))) {
		onKeyClick(e.key);
		keyClick(e.key);
		return;
	}
	switch (e.key) {
		case 'Delete':
			onKeyClick('CE');
			clearEntry();
			break;
		case 'Escape':
			onKeyClick('C');
			clear();
			break;
		case 'Backspace':
			onKeyClick('BS');
			backspace();
			break;
		case '/':
			onKeyClick('÷');
			selectOperation('÷');
			break;
		case '*':
			onKeyClick('×');
			selectOperation('×');
			break;
		case '-':
			onKeyClick('-');
			selectOperation('-');
			break;
		case '+':
			onKeyClick('+');
			selectOperation('+');
			break;
		case '=':
			onKeyClick('=');
			equals();
			break;
		case 'Enter':
			onKeyClick('=');
			equals();
			break;
		case 'NEG':
			negate();
			break;
		case ',':
			onKeyClick(',');
			addComma();
			break;
		default:
			break;
	}
});

historyBtn.addEventListener('click', () => {
	showHistory = !showHistory;
	backdrop.style.display = 'block';
	displayHistoryPanel();
});

historyClearBtn.addEventListener('click', () => {
	clearHistory();
	updateHistoryText();
});

backdrop.addEventListener('click', () => {
	showHistory = false;
	displayHistoryPanel();
	backdrop.style.display = 'none';
});

historyPanel.addEventListener('animationend', (e) => {
	if (e.animationName == 'hideHistory') {
		historyPanel.style.display = 'none';
	}
});

const numberFormatter = new Intl.NumberFormat(undefined, {
	style: 'decimal',
	maximumFractionDigits: 0,
});

let topDisplayText = '';
let bottomDisplayText = '';
let number = '';
let op = '';
let newNumber = false;
let topMemory = null;
let topSecondMemory = null;
let bottomMemory = 0;
let isFloat = false;
let history = [];
let showHistory = false;
let disableEnter = false;
let enterTimeout = setTimeout(() => {
	disableEnter = false;
}, 50);
let numberAbove = false;

function onKeyClick(key) {
	let keyElem = document.querySelector(`[data-key="${key}"]`);
	keyElem.classList.add('active');
	setTimeout(() => {
		keyElem.classList.remove('active');
	}, 50);
}

function keyClick(key) {
	if (!isNaN(key)) {
		addNumber(key);
		updateBottomDisplay();
	}

	switch (key) {
		case 'CE':
			clearEntry();
			break;
		case 'C':
			clear();
			break;
		case 'BS':
			backspace();
			break;
		case '÷':
			selectOperation('÷');
			break;
		case '×':
			selectOperation('×');
			break;
		case '-':
			selectOperation('-');
			break;
		case '+':
			selectOperation('+');
			break;
		case '=':
			equals();
			break;
		case 'NEG':
			negate();
			break;
		case ',':
			addComma();
			break;
		default:
			break;
	}
}

function addNumber(key) {
	number = key;

	if (newNumber) {
		bottomMemory = 0;
		isFloat = false;
		newNumber = false;
	}

	if (bottomMemory.toString().length >= 16) {
		displayBottom.textContent = bottomMemory;
		return;
	}
	if (bottomMemory == 0 && !isFloat) {
		if (number === '0') {
			return;
		} else {
			bottomMemory = '';
		}
	}

	bottomMemory = bottomMemory.toString() + number;
}

function clearEntry() {
	bottomMemory = 0;
	isFloat = false;
	updateBottomDisplay();
}
function clear() {
	bottomMemory = 0;
	topMemory = null;
	topSecondMemory = null;
	isFloat = false;
	updateBottomDisplay();
	updateTopDisplay(null);
}

function backspace() {
	if (bottomMemory.toString().length <= 1) {
		bottomMemory = 0;
		updateBottomDisplay();
		return;
	}
	bottomMemory = bottomMemory.toString().slice(0, -1);
	updateBottomDisplay();
}

function selectOperation(operation) {
	op = operation;
	topMemory = bottomMemory;
	topSecondMemory = null;
	updateTopDisplay(`${topMemory} ${op}`);
	newNumber = true;
}

function equals() {
	let a;
	let b;
	if (topSecondMemory == null) {
		a = parseFloat(topMemory);
		b = parseFloat(bottomMemory);
	} else {
		a = parseFloat(bottomMemory);
		b = parseFloat(topSecondMemory);
	}
	let result = 0;
	if (topMemory != null) {
		switch (op) {
			case '÷':
				result = a / b;
				break;
			case '×':
				result = a * b;
				break;
			case '-':
				result = a - b;
				break;
			case '+':
				result = a + b;
				break;
			default:
				break;
		}
		if (topSecondMemory == null) {
			topSecondMemory = bottomMemory;
		}
		updateTopDisplay(`${a} ${op} ${b} =`);
		newNumber = true;
		bottomMemory = result;
		updateBottomDisplay();
		if (history.length > 20) {
			history.pop();
		}
		history.unshift({
			a,
			op,
			b,
			result,
		});
		updateHistory();
	}
}

function negate() {
	bottomMemory = bottomMemory * -1;
	updateBottomDisplay();
}

function addComma() {
	if (bottomMemory.toString().indexOf('.') != -1) {
		return;
	}
	bottomMemory = bottomMemory + '.';
	isFloat = true;
	updateBottomDisplay();
}

function updateBottomDisplay() {
	if (bottomMemory.toString().indexOf('.') == -1) {
		isFloat = false;
	}
	[integer, decimal] = bottomMemory.toString().split('.');
	if (decimal == null) {
		if (bottomMemory > 1e20) {
			numberAbove = true;
		}
		displayBottom.textContent = numberAbove
			? integer
			: numberFormatter.format(integer);
		return changeFontSize();
	}
	displayBottom.textContent = `${
		numberAbove ? integer : numberFormatter.format(integer)
	}.${decimal}`;
	return changeFontSize();
}

function changeFontSize() {
	let widthCalc = document
		.querySelector('.calc__buttons')
		.getBoundingClientRect().width;
	let widthDisplay = displayBottom.getBoundingClientRect().width;

	let fontSize = parseFloat(
		window.getComputedStyle(displayBottom).getPropertyValue('font-size'),
	);
	let fontSizeDefault = parseFloat(
		window.getComputedStyle(displayBottom).getPropertyValue('--fs-display'),
	);

	let idealSize = widthCalc / (widthDisplay + 10);

	displayBottom.style.fontSize =
		Math.min(fontSizeDefault, fontSize * idealSize) + 'px';
}

function updateTopDisplay(value) {
	if (value == null) {
		displayTop.innerHTML = '&nbsp';
		return;
	}
	displayTop.textContent = value;
}

function displayHistoryPanel() {
	if (showHistory) {
		historyPanel.style.animationName = 'showHistory';
		historyPanel.style.animationDuration = '200ms';
		historyPanel.style.display = 'flex';
	} else {
		historyPanel.style.animationDuration = '100ms';
		historyPanel.style.animationName = 'hideHistory';
	}
}

function updateHistory() {
	if (historyList.children.length < 20) {
		for (let i = 0; i < historyList.children.length; i++) {
			const el = historyList.children[i];
			const test = history[i + 1];
			el.removeEventListener('click', test.handleClick);
		}
		historyList.replaceChildren();
		history.forEach((data, index) => {
			if (index == 20) {
				return;
			}

			let item = document.createElement('li');
			item.classList.add('history__item');

			let spanEquation = document.createElement('span');
			spanEquation.textContent = `${data.a} ${data.op} ${data.b} =`;

			let spanResult = document.createElement('span');
			spanResult.classList.add('history__result');
			spanResult.textContent = data.result;

			item.appendChild(spanEquation);
			item.appendChild(spanResult);

			this.handleClick = function () {
				topMemory = data.a;
				topSecondMemory = data.b;
				bottomMemory = data.result;
				updateTopDisplay(`${data.a} ${data.op} ${data.b} =`);
				updateBottomDisplay();
			};

			this.handleClick = this.handleClick.bind(this);
			item.addEventListener('click', this.handleClick);
			history[index].handleClick = this.handleClick;
			historyList.appendChild(item);
		});
	} else {
		for (let i = 0; i < historyList.children.length; i++) {
			const el = historyList.children[i];
			const test = history[i + 1];
			el.removeEventListener('click', test.handleClick);
		}
		const historyItems = historyList.children;
		history.forEach((data, index) => {
			if (index == 20) {
				return;
			}

			historyItems[index].querySelector(
				'span',
			).textContent = `${data.a} ${data.op} ${data.b} =`;

			historyItems[index].querySelector('.history__result').textContent =
				data.result;

			this.handleClick = function () {
				topMemory = data.a;
				topSecondMemory = data.b;
				bottomMemory = data.result;
				updateTopDisplay(`${data.a} ${data.op} ${data.b} =`);
				updateBottomDisplay();
			};

			this.handleClick = this.handleClick.bind(this);
			historyItems[index].addEventListener('click', this.handleClick);
			history[index].handleClick = this.handleClick;
		});
	}
	updateHistoryText();
}

function clearHistory() {
	for (let i = 0; i < historyList.children.length; i++) {
		const el = historyList.children[i];
		const test = history[i];
		el.removeEventListener('click', test.handleClick);
	}
	historyList.replaceChildren();
	history = [];
}

function updateHistoryText() {
	if (history.length) {
		historyText.style.display = 'none';
		historyClearBtn.style.display = 'flex';
	} else {
		historyText.style.display = 'flex';
		historyClearBtn.style.display = 'none';
	}
}
