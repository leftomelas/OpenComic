var buttonCancel, buttonPulsed;

function eventsTab(activeTab = false)
{
	/*if(activeTab)
	{
		let tabsContent = dom.query('.tabs-content .tabs-'+activeTab);
		console.log(tabsContent._this)
		tabsContent.addClass('active');
		tabsContent.siblings('.active').removeClass('active');

		let tabs = dom.query('.tabs > div > div[data-name="'+activeTab+'"]');
		tabs.addClass('active');
		tabs.siblings('.active').removeClass('active');
	}*/

	app.event('.tabs:not(.not-tab-events) > div > div', 'click', _eventsTab, {capture: false});

	let tabs = document.querySelectorAll('.tabs > div > div');

	for(let i = 0, len = tabs.length; i < len; i++)
	{
		tabs[i].dataset.index = i;
	}

	let tabsContent = document.querySelectorAll('.tabs-content > .active');

	for(let i = 0, len = tabsContent.length; i < len; i++)
	{
		tabsContent[i].parentElement.style.height = tabsContent[i].getBoundingClientRect().height+'px';
	}

}

var eventsTabST = false;

function _eventsTab(event)
{
	if(!this.classList.contains('active') && !eventsTabST)
	{
		gamepad.cleanBrowsableItems(gamepad.currentKey());

		let current = this.parentElement.querySelector('.active');
		let currentIndex = +current.dataset.index;
		let currentName = current.dataset.name;

		let index = +this.dataset.index;
		let name = this.dataset.name;
		let onEndAnimation = this.dataset.onEndAnimation;

		current.classList.remove('active');
		this.classList.add('active');

		let parent = current.parentElement.parentElement.parentElement;

		let tabsContent = parent.querySelector('.tabs-content');
		let currentContent = parent.querySelector('.tabs-content .tabs-'+currentName);
		let content = parent.querySelector('.tabs-content .tabs-'+name);

		let classShow = currentIndex > index ? 'show-from-left' : 'show-from-right';
		let classRemove = currentIndex > index ? 'hide-to-right' : 'hide-to-left';

		currentContent.classList.add(classRemove, 'show');
		currentContent.classList.remove('active');

		eventsTabST = setTimeout(function(){

			content.classList.add(classShow, 'active');

			tabsContent.style.height = content.getBoundingClientRect().height+'px';

			eventsTabST = setTimeout(function(){

				content.classList.remove(classShow);
				currentContent.classList.remove(classRemove, 'show');

				if(onEndAnimation)
					eval(onEndAnimation);

				eventsTabST = false;

			}, 250);

		}, 250);
	}
}

function buttonDown()
{
	this.classList.remove('p', 'c', 'd');
	this.classList.add('a');
	clearTimeout(eventHoverTimeout);
	buttonCancel = false;
	buttonPulsed = true;
}

function buttonUp()
{
	if(!buttonCancel)
	{
		this.classList.remove('a', 'c', 'd');
		this.classList.add('p');
	}

	buttonPulsed = false;
}

function buttonOut()
{
	if(buttonPulsed)
	{
		buttonCancel = true;
		this.classList.remove('a', 'p', 'd');
		this.classList.add('c');
		buttonPulsed = false;
	}
}

function floatingActionButtonDown()
{
	this.classList.remove('p', 'c', 'd');
	this.classList.add('a');
	clearTimeout(eventHoverTimeout);
	buttonCancel = false;
	buttonPulsed = true;
}

function floatingActionButtonUp()
{
	if(!buttonCancel)
	{
		this.classList.remove('a', 'c', 'd');
		this.classList.add('p');
	}

	buttonPulsed = false;
}

function floatingActionButtonOut()
{
	if(buttonPulsed)
	{
		buttonCancel = true;

		this.classList.remove('a', 'p', 'd');
		this.classList.add('c');

		buttonPulsed = false;
	}
}

function eventButton()
{
	let buttons = document.querySelectorAll('.button');

	app.event(buttons, 'mousedown touchstart', buttonDown);
	app.event(buttons, 'mouseup touchend', buttonUp);
	app.event(buttons, 'mouseout', buttonOut);

	let floatingActionButton = document.querySelectorAll('.floating-action-button');

	app.event(floatingActionButton, 'mousedown touchstart', floatingActionButtonDown);
	app.event(floatingActionButton, 'mouseup touchend', floatingActionButtonUp);
	app.event(floatingActionButton, 'mouseleave', floatingActionButtonOut);
}

var eventHoverTimeout, eventHoverTimeoutThis, eventHoverTimeoutActive = false, showedHoverText = false, currentPageX, currentPageY;

function hoverEnter()
{
	eventHoverTimeoutActive = true;

	eventHoverTimeoutThis = this;

	//eventHoverTimeout = setTimeout('events.showHoverText()', 300);
}

function hoverLeave()
{
	hideHoverText();
}

function documentLeave()
{
	hideHoverText();

	clearTimeout(eventHoverTimeout);
}

function windowDown()
{
	hideHoverText();
}

function windowMove1()
{
	if(eventHoverTimeout === false && !eventHoverTimeoutActive) return;

	clearTimeout(eventHoverTimeout);
	eventHoverTimeout = false;

	if(eventHoverTimeoutActive)
		eventHoverTimeout = setTimeout('events.showHoverText()', 300);
	else
		hideHoverText();
}

function windowMove2(event)
{
	currentPageX = app.pageX(event);
	currentPageY = app.pageY(event);
}

function eventHover()
{
	let hoverText = document.querySelectorAll('.hover-text');

	app.event(hoverText, 'mouseenter', hoverEnter);
	app.event(hoverText, 'mouseleave', hoverLeave);

	app.event(document, 'mouseleave', documentLeave);

	app.event(window, 'mousedown touchstart', windowDown);
	app.event(window, 'mousemove', windowMove1);
	app.event(window, 'mousemove touchstart touchmove', windowMove2);
}

switchRemoveAnimeST = false;

function switchRemoveAnime()
{
	clearTimeout(switchRemoveAnimeST);

	switchRemoveAnimeST = setTimeout(function(){

		let switchs = document.querySelectorAll('.switch.animeOn, .switch.animeOff');

		for(let i = 0, len = switchs.length; i < len; i++)
		{
			switchs[i].classList.remove('animeOn', 'animeOff');
		}

	}, 1000);
}

function swiftClick()
{
	if(this.classList.contains('a'))
	{
		this.dataset.value = 0;
		this.classList.add('animeOff');
		this.classList.remove('a', 'animeOn');
		callbackString(this.getAttribute('off'));
	}
	else
	{
		this.dataset.value = 1;
		this.classList.add('a', 'animeOn');
		this.classList.remove('animeOff');
		callbackString(this.getAttribute('on'));
	}

	switchRemoveAnime();
}

function eventSwitch()
{
	app.event('.switch', 'click', swiftClick);
}

function checkboxClick()
{
	let input = this.querySelector('input');

	if(this.classList.contains('active'))
	{
		this.classList.remove('active');
		input.value = 0;
	}
	else
	{
		this.classList.add('active');
		input.value = 1;
	}

	this.classList.remove('activeAnimation');
	this.getBoundingClientRect();
	this.classList.add('activeAnimation');
}

function eventCheckbox()
{
	app.event('.checkbox', 'click', checkboxClick);
}

var rangeMoveStepST = false;

function rangeMoveStep(This, stepToSum = 1)
{
	clearTimeout(rangeMoveStepST);

	let range = This.querySelector('input[type="range"]');

	if(range)
	{
		let value = +range.value;
		let step = +range.getAttribute('step') || 1;

		range.value = value + (step * stepToSum);

		_eventRange.call(range, {type: 'gamepad'});
	}

	rangeClipPath(range.closest('.simple-slider'), true)

	rangeMoveStepST = setTimeout(function(){

		rangeRemoveClipPath(range.closest('.simple-slider'))

	}, 1000);
}

function hasRangeReset(input, range)
{
	let sliderReset = dom.this(range).siblings('.simple-slider-text').find('.slider-reset')._this[0];

	if(sliderReset && sliderReset.dataset.default !== undefined)
	{
		let value = input.value;

		if(value != sliderReset.dataset.default)
			sliderReset.classList.add('active');
		else
			sliderReset.classList.remove('active');
	}
}

function hasMinDisables(input, range)
{
	let minDisables = range.closest('.simple-slider.simple-slider-min-disables');

	if(minDisables)
	{
		let text = dom.this(range).siblings('.simple-slider-text')._this[0].firstElementChild;
		let value = +input.value;
		let min = +input.getAttribute('min') || 0;

		if(text)
		{
			if(value == min)
				text.style.textDecoration = 'line-through';
			else
				text.style.textDecoration = '';
		}
	}
}

function resetRange(This)
{
	let input = dom.this(This).closest('.simple-slider-text').siblings('.range').find('input')._this[0];
	input.value = This.dataset.default;
	if(input) _eventRange.call(input, {type: 'change'});
}

function goRange(input, value, end = true)
{
	input.value = value;
	if(input) _eventRange.call(input, {type: end ? 'change' : 'none'});
}

function rangePosition(input, range, percent = false)
{
	let value = +input.value;
	let min = +input.getAttribute('min') || 0;
	let max = +input.getAttribute('max');
	let step = input.getAttribute('step') || 1;

	if(percent === false)
		percent = (value - min) / (max - min) * 100;

	if(isNaN(percent))
		percent = 0;

	range.querySelector('.range-line').style.width = percent+'%';
	range.querySelector('.range-point').style.left = percent+'%';

	if(step && (max - min) / step <= 60) // Only show steps if has less 60
	{
		let rangeSteps = range.querySelectorAll('.range-steps > div');
		let len = rangeSteps.length;

		let total = Math.round((max - min) / step);

		if(len > 0)
		{
			for(let i = 0; i < len; i++)
			{
				if(i * step > (value - min))
					rangeSteps[i].classList.remove('active');
				else
					rangeSteps[i].classList.add('active');
			}
		}
		else
		{
			let steps = '';

			for(let i = 0; i <= total; i++)
			{
				steps += '<div'+(i * step > (value - min) ? '' : ' class="active"')+' style="left: '+(i / total * 100)+'%"></div>';
			}

			range.querySelector('.range-steps').innerHTML = steps;
		}
	}

	return percent;
}

function _eventRange(event, percent = false)
{
	let range = this.closest('.range');
	let onrange = this.getAttribute('onrange');

	let value;
	let text = value = this.value;

	let step = this.getAttribute('step');

	percent = rangePosition(this, range, percent);
	hasRangeReset(this, range);
	hasMinDisables(this, range);

	if(step)
	{
		let num = text.replace(/.*?(\.|$)/, '').length;
		let steps = step.replace(/.*?(\.|$)/, '').length;

		if(steps != 0)
			text = text+(text.match(/\./) ? '' : '.')+('0'.repeat(steps - num));
	}

	if(event.type != 'none')
	{
		let callback = hb.compile(onrange)({
			value: value,
			toEnd: (event.type == 'input' ? 'false' : 'true'),
		});

		callbackString(callback);
	}

	let simpleSliderText = dom.this(range).siblings('.simple-slider-text')._this[0];
	simpleSliderText.querySelector('div:not(.range-percent) > span').innerHTML = text;

	let rangePercent = simpleSliderText.querySelector('.range-percent > span');
	if(rangePercent) rangePercent.innerHTML = Math.round(percent)+'%';
}

function rangeStart(event)
{
	rangeClipPath(this.closest('.simple-slider'));
}

function rangeEnd(event)
{
	rangeRemoveClipPath(this.closest('.simple-slider'));
}

var rangePrecise = {active: false};

function rangePreciseStart(event)
{
	event.preventDefault();

	let list = false;
	let _list = this.getAttribute('list');

	if(_list)
	{
		list = [];
		_list = document.querySelectorAll('#'+_list+' > option');

		for(let i = 0, len = _list.length; i < len; i++)
		{
			list.push(+_list[i].value);
		}
	}

	let rect = this.getBoundingClientRect();

	rect = {
		width: rect.width - 20,
		left: rect.left + 10,
		right: rect.left + 10,
	};

	let startPercent = (app.pageX(event) - rect.left) / rect.width * 100;

	rangePrecise = {
		active: true,
		this: this,
		value: this.value,
		precision: +this.dataset.precision,
		max: +this.getAttribute('max'),
		min: +this.getAttribute('min'),
		steps: +this.getAttribute('steps'),
		rect: rect,
		startPercent: startPercent,
		pageX: app.pageX(event),
		pageY: app.pageY(event),
		list: list,
	};

	rangePreciseMove(event);
}

function rangePreciseMove(event)
{
	if(rangePrecise.active)
	{
		let pageX = app.pageX(event);

		let percent = rangePrecise.startPercent + (((pageX - rangePrecise.pageX) / rangePrecise.rect.width * 100) / rangePrecise.precision);

		if(percent > 100) percent = 100;
		else if(percent < 0) percent = 0;

		let _percent = percent / 100;

		let value = rangePrecise.value;

		if(rangePrecise.list)
		{
			let len = rangePrecise.list.length;
			value = rangePrecise.list[Math.round((len-1)*_percent)];
			percent = Math.round((len-1)*_percent) / (len - 1) * 100;
		}
		else
		{
			value = rangePrecise.min + ((rangePrecise.max - rangePrecise.min) * _percent);
			percent = false;
		}

		if(rangePrecise.this.value != value)
		{
			rangePrecise.this.value = value;

			_eventRange.call(rangePrecise.this, event, percent);
		}
	}
}

function rangePreciseEnd(event)
{
	if(rangePrecise.active)
	{
		rangeRemoveClipPath(rangePrecise.this.closest('.simple-slider'));

		rangePrecise = {active: false};
	}
}

function eventRange(query = '')
{
	let inputs = document.querySelectorAll(query+' .range input');

	app.event(inputs, 'change input', _eventRange);
	app.event(inputs, 'touchstart mousedown', rangeStart);
	app.event(inputs, 'touchend mouseup', rangeEnd);

	let inputsPrecise = document.querySelectorAll(query+' .range input.precise-range');

	app.event(inputsPrecise, 'touchstart mousedown', rangePreciseStart);
	app.event(window, 'touchmove mousemove', rangePreciseMove);
	app.event(window, 'touchend mouseup', rangePreciseEnd);

	let ranges = document.querySelectorAll(query+' .range');

	for(let i = 0, len = ranges.length; i < len; i++)
	{
		let range = ranges[i];
		let input = range.querySelector('input');

		rangePosition(input, range);
		hasRangeReset(input, range);
		hasMinDisables(input, range);
	}
}

function rangeClipPath(range, moveToTop = false)
{
	let menu = range.closest('.menu');
	let toClipPath = range.closest('.menu-simple, .dialog');

	if(toClipPath && !toClipPath.dataset.clipPath)
	{
		let menuGamepad = menu ? menu.classList.contains('menu-gamepad') : false;

		let clipPath = range.dataset.clipPath ? range.closest(range.dataset.clipPath) : range;
		clipPath.classList.add('clip-path');

		let margin = clipPath.dataset.margin ? clipPath.dataset.margin.split(',') : [0, 0, 0, 0];

		margin = {
			top: +margin[0],
			right: +margin[1],
			bottom: +margin[2],
			left: +margin[3],
		};

		let rect = toClipPath.getBoundingClientRect();
		let rectClipPath = clipPath.getBoundingClientRect();

		let rectRange = {
			left: rectClipPath.left + (menuGamepad ? 0 : 12) - margin.left,
			right: rectClipPath.right - (menuGamepad ? 0 : 13) + margin.right,
			top: rectClipPath.top - 6 - margin.top,
			bottom: rectClipPath.bottom - 6 + margin.bottom,
			width: rectClipPath.width - (menuGamepad ? 0 : 25) + margin.left + margin.right,
			height: rectClipPath.height + margin.top + margin.bottom,
		};

		let left = rectRange.left - rect.left;
		let right = rect.right - rectRange.right;
		let top = rectRange.top - rect.top;
		let bottom = rect.bottom - rectRange.bottom;

		// if(moveToTop) menu.style.transform = 'translateY(-'+(rectRange.top - 56)+'px)';
		toClipPath.dataset.clipPath = '1';
		toClipPath.style.clipPath = 'inset('+top+'px '+right+'px '+bottom+'px '+left+'px round 14px)';

		dom.this(toClipPath).siblings('.menu-close, .dialog-close').css({cssText: 'opacity: 0 !important'});

		dom.this(toClipPath).siblings('.menu-clip-path-shadow, .dialog-clip-path-shadow').css({
			opacity: 1,
			left: rectRange.left+'px',
			top: rectRange.top+'px',
			width: rectRange.width+'px',
			height: rectRange.height+'px',
		});
	}
}

function rangeRemoveClipPath(range)
{
	let clipPath = range.dataset.clipPath ? range.closest(range.dataset.clipPath) : range;
	clipPath.classList.remove('clip-path');

	let menu = range.closest('.menu');
	let toClipPath = range.closest('.menu-simple, .dialog');

	if(toClipPath)
	{
		if(menu) menu.style.transform = '';
		toClipPath.dataset.clipPath = '';
		toClipPath.style.clipPath = '';

		dom.this(toClipPath).siblings('.menu-close, .menu-clip-path-shadow, .dialog-close, .dialog-clip-path-shadow', true).css({opacity: ''});
	}
}

function events()
{
	eventHover();
	eventButton();
	eventSwitch();
	eventCheckbox();
	eventInput();
	eventRange();
	eventsTab();
	eventSelect(false);
}

function showHoverText()
{
	const parent = document.querySelector('.global-elements .hover');
	const hover = document.querySelector('.global-elements .hover > div');
	hover.innerHTML = eventHoverTimeoutThis.getAttribute('hover-text');

	const rect = eventHoverTimeoutThis.getBoundingClientRect();
	const hoverRect = hover.getBoundingClientRect();

	let left = rect.left + (rect.width / 2);
	let top = rect.top + rect.height;

	if(left < (hoverRect.width / 2) + 8)
		left = (hoverRect.width / 2) + 8;
	else if(left + (hoverRect.width / 2) + 8 > window.innerWidth)
		left = window.innerWidth - (hoverRect.width / 2) - 8;


	if(top + 60 > window.innerHeight)
	{
		parent.classList.remove('d', 'd-i');
		parent.classList.add('a-i');

		parent.style.top = '';
		parent.style.bottom = (window.innerHeight - rect.top)+'px';
		parent.style.left = left+'px';
	}
	else
	{
		parent.classList.remove('d', 'd-i');
		parent.classList.add('a');

		parent.style.bottom = '';
		parent.style.top = top+'px';
		parent.style.left = left+'px';
	}

	showedHoverText = true;
}

function hideHoverText()
{
	eventHoverTimeoutActive = false;

	if(showedHoverText)
	{
		eventHoverTimeoutActive = false;

		$('.global-elements .hover.a-i').removeClass('a-i').addClass('d-i');
		$('.global-elements .hover.a').removeClass('a').addClass('d');

		showedHoverText = false;
	}
}

function eventSelect(animation = true)
{
	let selects = document.querySelectorAll('.select');

	for(let i = 0, len = selects.length; i < len; i++)
	{
		let select = selects[i];

		let text = select.querySelector('.text');

		if(text)
		{
			let _text = text.innerHTML.trim();

			if(_text && !select.classList.contains('not-placeholder'))
			{
				text.style.opacity = 1;
				select.classList.add(animation ? 'have-select' : 'have-select-wa');
			}
			else
			{
				text.style.opacity = 0;
				select.classList.remove('have-select', 'have-select-wa');
			}
		}
	}
}

let currentSelect = {};

function showSelect(This, menu = false, insideMenu = false, ajustWidth = false)
{
	selectThis = This;
	This.classList.add('active');

	let text = This.querySelector('.text');

	if(text)
	{
		let _text = text.innerHTML.trim();

		if(!_text)
		{
			text.style.opacity = 1;
			text.innerHTML = '...';
		}
	}

	if(ajustWidth)
	{
		let menuSimple = document.querySelector('#'+menu+' .menu-simple');

		if(menuSimple)
			menuSimple.style.width = (ajustWidth === 1 ? This.firstElementChild : This).getBoundingClientRect().width+'px';
	}

	if(menu)
		activeMenu('#'+menu, This.firstElementChild, 'autoExact', 'autoExact', insideMenu);

	currentSelect = {
		this: This,
		menu: menu,
	};
}

function hideSelect(insideMenu = false)
{
	let This = currentSelect.this;
	This.classList.remove('active');

	let text = This.querySelector('.text');

	if(text)
	{
		let _text = text.innerHTML.trim();

		if(_text == '...')
		{
			text.style.opacity = 0;
			text.innerHTML = '';
		}
	}

	if(currentSelect.menu)
		desactiveMenu('#'+currentSelect.menu, This.firstElementChild, insideMenu);
}

function select(This)
{
	dom.this(This).parents('.menu-simple').find('.menu-simple-element.s', true).removeClass('s');
	This.classList.add('s');
}

var fromGamepadMenu = false;

async function activeMenu(query, query2 = false, posX = 'left', posY = 'top', insideMenu = false)
{
	let menu = document.querySelector(query);
	let menuSimple = menu.querySelector('.menu-simple');
	let menuSimpleContent = menu.querySelector('.menu-simple-content');
	let menuClose = menu.querySelector('.menu-close');

	let top = 0,
		left = 0,
		right = 0,
		bottom = 0,
		height = 0,
		width = 0;

	if(query2)
	{
		let button = (typeof query2 === 'string' ? document.querySelector(query2) : query2);
		let rect = button.getBoundingClientRect();

		top = rect.top;
		left = rect.left;
		right = rect.right;
		bottom = rect.bottom;
		height = rect.height;
		width = rect.width;
	}

	for(let i = 0, len = menu.children.length; i < len; i++)
	{
		const child = menu.children[i];

		if(!child.classList.contains('menu-close'))
		{
			child.classList.remove('d');
			child.classList.add('a');
		}
	}

	let pos = {
		left: 0,
		right: 0,
		top: 0,
		bottom: 0,
	};

	// X
	if(posX == 'auto' || posX == 'autoExact')
	{
		if(left + (width / 2) < window.innerWidth / 2)
			posX = (posX == 'autoExact' ? 'leftExact' : 'left');
		else
			posX = (posX == 'autoExact' ? 'rightExact' : 'right');
	}

	if(posX == 'left' || posX == 'leftExact')
	{
		pos.right = '';
		pos.left = (left - (posX == 'leftExact' ? 0 : 8));
	}
	else
	{
		pos.right = window.innerWidth - right;
		pos.left = '';
	}

	// Y
	let autoY = false;

	if(posY == 'auto' || posY == 'autoExact')
	{
		if(top + (height / 2) < window.innerHeight / 2)
			posY = (posY == 'autoExact' ? 'topExact' : 'top');
		else
			posY = (posY == 'autoExact' ? 'bottomExact' : 'bottom');

		autoY = true;
	}

	if(posY == 'top' || posY == 'topExact' || posY == 'gamepad')
	{
		pos.bottom = '';
		pos.top = (bottom + (posY == 'topExact' ? 0 : 8));
	}
	else
	{
		pos.bottom = window.innerHeight - top;
		pos.top = '';
	}

	dom.this(menuSimple).css({
		left: pos.left ? pos.left+'px' : '',
		right: pos.right ? pos.right+'px' : '',
		top: pos.top ? pos.top+'px' : '',
		bottom: pos.bottom ? pos.bottom+'px' : '',
	});

	if(autoY)
	{
		let menuHeight = pos.top ? (window.innerHeight - pos.top - 24) : (window.innerHeight - pos.bottom - 16 - 48);

		menuSimple.style.maxHeight = menuHeight+'px';
		menuSimpleContent.style.maxHeight = (menuHeight - 16)+'px';
	}
	else
	{
		menuSimple.style.maxHeight = '';
		menuSimpleContent.style.maxHeight = '';
	}

	// Transform origin
	menuSimple.classList.remove('bottom', 'top', 'center');
	menuSimple.classList.add((posY == 'gamepad' || posX == 'gamepad' ? 'center' : (posY == 'top' || posY == 'topExact') ? 'top' : 'bottom'));

	if(posX == 'gamepad')
		menu.classList.add('menu-gamepad');
	else
		menu.classList.remove('menu-gamepad');

	fromGamepadMenu = (posX == 'gamepad' && posY == 'gamepad') ? true : false;

	if(!insideMenu) shortcuts.pause();
	gamepad.updateBrowsableItems('menu');

	await app.sleep(5);
	menuClose.classList.remove('d');
	menuClose.classList.add('a');

	if(!menuClose.getAttribute('onclick'))
		addCloseEvents(menuClose);
}

async function activeContextMenu(query)
{
	let menu = (typeof query === 'string' ? document.querySelector(query) : query);
	let menuClose = menu.querySelector('.menu-close');
	dom.this(menu).children('*:not(.menu-close)', true).removeClass('d').addClass('a');

	let menuSimple = menu.querySelector('.menu-simple');
	let menuSimpleContent = menu.querySelector('.menu-simple-content');
	let rect = menuSimpleContent.firstElementChild.getBoundingClientRect();
	let height = rect.height + 16;

	let pos, pos2;

	if(currentPageX + rect.width + 16 < window.innerWidth)
		pos = 'left';
	else
		pos = 'right';

	if(currentPageY + height + 16 < window.innerHeight || currentPageY < height + 16 + titleBar.height())
		pos2 = 'top';
	else
		pos2 = 'bottom';

	let _menuSimple = dom.this(menuSimple);

	_menuSimple.css({
		right: (pos == 'left') ? '' : ((window.innerWidth - currentPageX) + 4)+'px',
		left: (pos == 'left') ? (currentPageX + 4)+'px' : '',
		bottom: (pos2 == 'top') ? '' : ((window.innerHeight - currentPageY) + 4)+'px',
		top: (pos2 == 'top') ? (currentPageY + 4)+'px' : '',
	}).class((pos2 == 'top') ? true : false, 'top').class((pos2 == 'top') ? false : true, 'bottom');

	if(pos2 === 'top' && !(currentPageY + height + 16 < window.innerHeight))
		menuSimpleContent.style.maxHeight = (window.innerHeight - currentPageY - 32)+'px';
	else
		menuSimpleContent.style.maxHeight = '';

	menu.classList.remove('menu-gamepad');

	await app.sleep(5);
	menuClose.classList.remove('d');
	menuClose.classList.add('a');

	if(!menuClose.getAttribute('onclick'))
		addCloseEvents(menuClose);
}

async function addCloseEvents(menuClose)
{
	app.event(menuClose, 'mousedown', menuCloseEvent);
}

async function menuCloseEvent(event)
{
	const menu = this.closest('.menu');
	if(menu) desactiveMenu(menu);
}

async function desactiveMenu(query, query2 = false, insideMenu = false)
{
	await app.sleep(5);

	if(typeof query === 'string')
		dom.queryAll(query).children(false, true).removeClass('a').addClass('d');
	else
		dom.this(query).children(false, true).removeClass('a').addClass('d');

	if(query2)
	{
		let elements = (typeof query2 === 'string' ? document.querySelectorAll(query2) : [query2]);

		for(let i = 0, len = elements.length; i < len; i++)
		{
			let element = elements[i];

			if(element.classList.contains('p') || element.classList.contains('c') || element.classList.contains('a'))
			{
				element.classList.remove('p', 'c', 'a');
				element.classList.add('d');
			}
		}
	}

	if(insideMenu)
	{
		gamepad.updateBrowsableItems('menu');
	}
	else
	{
		if(!onReading)
			gamepad.updateBrowsableItemsPrevKey();
		else
			gamepad.cleanBrowsableItems();

		shortcuts.play();
	}

	if(fromGamepadMenu)
		gamepad.showMenu();
}

// Dialogs
var dialogST = false, closeDialogST = false;

function dialog(config)
{
	clearTimeout(dialogST);
	clearTimeout(closeDialogST);

	config.width = (config.width) ? config.width : 280;
	config.buttonsInNewLine = config.buttonsInNewLine;
	config.onClose = config.onClose || '';

	handlebarsContext.dialog = config;

	closeDialog();

	gamepad.updateBrowsableItems('dialog');

	dom.query('.dialogs').append(template.load('dialog.html'));

	onReading = false;
	generateAppMenu();
}

function closeDialog()
{
	clearTimeout(closeDialogST);

	dom.queryAll('.dialogs .dialog').css({zIndex: 119});
	let toRemove = dom.queryAll('.dialogs .dialog, .dialogs .dialog-close, .dialogs .dialog-clip-path-shadow').addClass('hide');

	closeDialogST = setTimeout(function(){

		toRemove.remove();

	}, 400);

	if(!onReading)
		gamepad.updateBrowsableItemsPrevKey();
	else
		gamepad.cleanBrowsableItems();

	onReading = _onReading;
	generateAppMenu();
}

// Snackbar
var snackbarQueue = [],
	snackbarCurrent = false,
	snackbarST = false;

function snackbar(config)
{
	if(!snackbarCurrent)
	{
		clearTimeout(snackbarST);

		snackbarCurrent = config;

		let duration = config.duration;

		if(duration > 10)
			duration = 10;
		else if(duration < 4)
			duration = 4;

		handlebarsContext.snackbar = config;
		$('.snackbars').html(template.load('snackbar.html'));

		snackbarST = setTimeout(function() {

			$('.snackbars .snackbar').addClass('hide');

			snackbarST = setTimeout(function() {

				$('.snackbars .snackbar').remove();

				snackbarCurrent = false;

				if(snackbarQueue.length > 0)
				{
					var config = snackbarQueue.shift();

					snackbar(config);
				}

			}, 300);

		}, duration * 1000);
	}
	else	
	{
		let isset = false;

		for(let key in snackbarQueue)
		{
			if(config.key == snackbarQueue[key].key)
			{
				isset = true;

				if(config.update)
					snackbarQueue[key] = config;
			}
		}

		if(!isset && (!snackbarCurrent || (snackbarCurrent.key != config.key || (config.update && !config.updateShown))))
		{
			snackbarQueue.push(config);
		}
		else if(!isset && snackbarCurrent.key == config.key && config.updateShown)
		{
			let snackbarText = document.querySelector('.snackbars .snackbar-text');
			if(snackbarText) snackbarText.innerHTML = config.text;
		}
	}
}

function closeSnackbar()
{
	clearTimeout(snackbarST);

	$('.snackbars .snackbar').addClass('hide');

	snackbarST = setTimeout(function() {

		$('.snackbars .snackbar').remove();

		snackbarCurrent = false;

		if(snackbarQueue.length > 0)
		{
			var config = snackbarQueue.shift();

			snackbar(config);
		}

	}, 300);

}

function inputFocus(event, animation = true)
{
	let parent = this.closest('.input');
	let placeholder = parent.querySelector('.placeholder');

	let placeholderWidth = document.querySelector('.placeholder-width');
	placeholderWidth.innerHTML = placeholder.innerHTML;
	placeholderWidth = placeholderWidth.getBoundingClientRect().width + 8;

	let translate = Math.round(placeholderWidth / 2);

	this.dataset.translate = translate;
	this.dataset.placeholderWidth = placeholderWidth;

	if(!animation)
	{
		placeholder.style.transition = '0s';
		dom.this(parent).find('.inputBorder .top div, .inputBorder .top span', true).css({'transition': '0s'});
	}

	let top = parent.querySelector('.inputBorder .top');
	let div = top.querySelector('div');
	let span = top.querySelector('span');

	div.style.width = translate+'px';
	div.style.transform = 'translate(-'+translate+'px, 0px) scaleY(1)';

	span.style.width =  (top.getBoundingClientRect().width - translate)+'px';
	span.style.transform = 'translate('+translate+'px, 0px) scaleY(1)';

	parent.classList.add('active');

	if(!animation)
	{
		setTimeout(function(){

			placeholder.style.transition = '';
			dom.this(parent).find('.inputBorder .top div, .inputBorder .top span', true).css({'transition': ''});

		}, 100, this);
	}
}

function inputBlur()
{
	let parent = this.closest('.input');
	let div = parent.querySelector('.inputBorder .top div');
	let span = parent.querySelector('.inputBorder .top span');

	if(this !== document.activeElement)
	{
		parent.classList.remove('active');

		if(!this.value)
		{
			parent.classList.remove('haveText');

			div.style.transform = '';
			span.style.transform = '';
		}
		else
		{
			parent.classList.add('haveText');

			let translate = this.dataset.translate;

			div.style.transform = 'translate(-'+translate+'px, 0px) scaleY(0.3333333)';
			span.style.transform = 'translate('+translate+'px, 0px) scaleY(0.3333333)';
		}
	}
}

function inputKeydown(event)
{
	let key = event.keyCode;

	if(key == 13)
	{
		let onEnter = this.dataset.onEnter;
		if(onEnter) $.globalEval(onEnter);
	}
}

function eventInput()
{
	let inputs = document.querySelectorAll('.input input, .input textarea');

	app.event(inputs, 'focus', inputFocus);
	app.event(inputs, 'blur', inputBlur);
	app.event(inputs, 'keydown', inputKeydown);

	for(let i = 0, len = inputs.length; i < len; i++)
	{
		if(!inputs[i].dataset.first)
		{
			inputFocus.call(inputs[i], false, false);
			inputBlur.call(inputs[i]);

			inputs[i].dataset.first = 1;
		}
	}
	
}

function focus(query, end = true)
{
	let input = document.querySelector(query);

	if(input)
	{
		let len = input.value.length;

		if(end && input.type != 'number') input.setSelectionRange(len, len);
		input.focus();
	}
}

function loadingProgress(loading, progress = 0)
{
	if(!loading) return;

	const strokes = {
		96: {
			array: 499,
		},
		48: {
			array: 411,
		},
		36: {
			array: 368,
		},
		24: {
			array: 343,
		},
	}

	let size = 96;

	if(loading.classList.contains('loading96'))
		size = 96;
	else if(loading.classList.contains('loading48'))
		size = 48;
	else if(loading.classList.contains('loading36'))
		size = 36;
	else if(loading.classList.contains('loading24'))
		size = 24;

	const stroke = strokes[size];

	const svg = loading.querySelector('.loading svg');

	if(svg)
	{
		svg.style.animation = 'none';
		svg.style.transform = 'rotate(-90deg)';
	}

	const circle = loading.querySelector('.loading circle');

	if(circle)
	{
		const now = Date.now();
		const prevNow = +loading.dataset.prevNow || false;
		const prevProgress = +loading.dataset.prevProgress || 0;

		let speed = prevNow ? Math.round(now - prevNow) : 0;
		if(speed > 300) speed = 300;

		if(prevProgress > progress && prevProgress !== 1)
			progress = prevProgress;

		loading.dataset.prevNow = now;
		loading.dataset.prevProgress = progress;

		circle.style.animation = 'none';
		circle.style.transition = 'stroke-dashoffset '+speed+'ms linear';
		circle.style.strokeDashoffset = 300;
		circle.style.strokeDasharray = 301 + ((stroke.array - 301) * progress);
	}
}

function buttonLoading(button, progress = false)
{
	if(!button) return;

	const children = button.firstElementChild;
	let loading = children.querySelector('.button-loading');

	if(progress)
	{
		if(!loading)
		{
			children.insertAdjacentHTML('beforeend', template.load('loading.button.html'));
			loading = children.querySelector('.button-loading');
		}

		if(progress !== true)
			loadingProgress(loading.querySelector('.loading'), progress);
	}
	else
	{
		if(loading)
			loading.remove();
	}
}

module.exports = {
	eventButton: eventButton,
	eventHover: eventHover,
	eventRange: eventRange,
	eventSelect: eventSelect,
	eventSwitch: eventSwitch,
	eventCheckbox: eventCheckbox,
	eventInput: eventInput,
	eventsTab: eventsTab,
	events: events,
	focus: focus,
	showHoverText: showHoverText,
	hideHoverText: hideHoverText,
	showSelect: showSelect,
	hideSelect: hideSelect,
	select: select,
	activeMenu: activeMenu,
	activeContextMenu: activeContextMenu,
	desactiveMenu: desactiveMenu,
	dialog: dialog,
	closeDialog: closeDialog,
	snackbar: snackbar,
	closeSnackbar: closeSnackbar,
	checkboxClick: checkboxClick,
	rangeMoveStep: rangeMoveStep,
	resetRange: resetRange,
	goRange: goRange,
	loadingProgress: loadingProgress,
	buttonLoading: buttonLoading,
};