var sitesScripts = {};

function loadSiteScript(site)
{
	if(!sitesScripts[site])
	{
		const siteData = app.copy(trackingSites.site(site));

		if(siteData)
		{
			siteData.config.access.pass = storage.safe.decrypt(siteData.config.access.pass);
			siteData.config.access.token = storage.safe.decrypt(siteData.config.access.token);
			siteData.config.session.token = storage.safe.decrypt(siteData.config.session.token);
			siteData.config.session.refreshToken = storage.safe.decrypt(siteData.config.session.refreshToken);

			sitesScripts[site] = require(siteData.script);
			sitesScripts[site].setSiteData(siteData);
		}
	}
}

function setSiteData(site)
{
	const siteData = app.copy(trackingSites.site(site));

	if(siteData)
	{
		siteData.config.access.pass = storage.safe.decrypt(siteData.config.access.pass);
		siteData.config.access.token = storage.safe.decrypt(siteData.config.access.token);
		siteData.config.session.token = storage.safe.decrypt(siteData.config.session.token);
		siteData.config.session.refreshToken = storage.safe.decrypt(siteData.config.session.refreshToken);

		loadSiteScript(site);
		sitesScripts[site].setSiteData(siteData);
	}
}

var tracked = {}, trackST = [], trackIndex = 0;

async function track(chapter = false, volume = false, onlySite = false)
{
	let fromDialog = false;

	if(chapter !== false || volume !== false)
	{
		fromDialog = true;
	}
	else
	{
		chapter = getChapter();
		volume = getVolume();
	}

	const _trackingSites = trackingSites.list(true);

	let haveToTracking = false;

	for(let key in _trackingSites)
	{
		if(_trackingSites[key].tracking.active)
			haveToTracking = true;
	}

	if(haveToTracking)
	{
		if(chapter === false && volume === false)
		{
			$('.bar-right-buttons .button-tracking-sites').html('sync_problem').addClass('tracking-problem');
		}
		else
		{
			if(!fromDialog)
				$('.bar-right-buttons .button-tracking-sites').html('sync').removeClass('tracking-problem');

			const indexMainPathA = dom.indexMainPathA();
			const readingCurrentPath = reading.readingCurrentPath();

			let allTracked = true;

			for(let key in _trackingSites)
			{
				const site = _trackingSites[key];
				let prevTracked = false;

				if(tracked[indexMainPathA] && tracked[indexMainPathA][site.key])
				{
					for(let key2 in tracked[indexMainPathA][site.key])
					{
						if(readingCurrentPath == tracked[indexMainPathA][site.key][key2])
						{
							prevTracked = true;

							break;
						}
					}
				}

				if(site.config.session.valid && ((onlySite && onlySite == site.key) || (site.tracking.active && !prevTracked && !onlySite)))
					allTracked = false;
			}

			let chapters = '??';
			let volumes = '??';

			const tracking = storage.getKey('tracking', indexMainPathA);

			for(let site in tracking)
			{
				if(!onlySite || onlySite == site)
				{
					let data = tracking[site];

					if(data.chapters)
						chapters = data.chapters;

					if(data.volumes)
						volumes = data.volumes;

					if(Date.now() - data.lastUpdatedChapters > 604800000) // One week
					{
						console.log('Get chapters and volumes number');

						const data = (await sitesScripts[site].getComicData()) || {};
						setTrackingChapters(site, indexMainPathA, data.chapters, data.volumes);
					}
				}
			}

			if(!allTracked)
			{
				trackST[trackIndex] = setTimeout(function(vars) {

					console.log('Tracking');

					for(let key in _trackingSites)
					{
						const site = _trackingSites[key];
						let prevTracked = false;

						if(tracked[indexMainPathA] && tracked[indexMainPathA][site.key])
						{
							for(let key2 in tracked[indexMainPathA][site.key])
							{
								if(readingCurrentPath == tracked[indexMainPathA][site.key][key2])
								{
									prevTracked = true;

									break;
								}
							}
						}

						if(site.config.session.valid && ((vars.onlySite && vars.onlySite == site.key) || (site.tracking.active && !prevTracked && !vars.onlySite)))
						{
							if(!tracked[indexMainPathA]) tracked[indexMainPathA] = {};
							if(!tracked[indexMainPathA][site.key]) tracked[indexMainPathA][site.key] = [];
							tracked[indexMainPathA][site.key].push(readingCurrentPath);

							loadSiteScript(site.key);

							sitesScripts[site.key].track({
								id: site.tracking.id,
								chapters: vars.chapter,
								volumes: vars.volume,
							});
						}
					}

				}, 6500, { // 6.5 seconds to track
					chapter: chapter,
					volume: volume,
					onlySite: onlySite,
				});

				// Remove prev

				events.snackbar({
					key: 'trackingConfirm',
					text: language.reading.tracking.marked+': '+(chapter !== false ? language.reading.tracking.chapter+' '+chapter+'/'+chapters : '')+(volume !== false ? (chapter !== false ? ' · ' : '')+language.reading.tracking.volume+': '+volume+'/'+volumes : ''),
					duration: 6,
					update: true,
					buttons: [
						{
							text: language.buttons.dismiss,
							function: 'events.closeSnackbar();',
						},
						{
							text: language.buttons.undo,
							function: 'events.closeSnackbar(); clearTimeout(tracking.trackST()['+trackIndex+'])',
						},
					],
				});

				trackIndex++;
			}
		}
	}
}

function saveSiteConfig(site, key, value)
{
	const siteData = trackingSites.site(site);
	const configSites = storage.getKey('config', 'trackingSites');

	siteData.config[key] = value;

	configSites[site] = siteData.config;
	storage.updateVar('config', 'trackingSites', configSites);

	setSiteData(site);
}

function configTracking(site = '', force = false)
{
	const siteData = trackingSites.site(site, true);
	if(!siteData) return;

	if($('#tracking-sites, .bar-right-buttons .button-tracking-sites').length >= 2)
	{
		reading.magnifyingGlassControl(2);
		events.desactiveMenu('#tracking-sites', '.bar-right-buttons .button-tracking-sites');
	}

	loadSiteScript(site);

	if(siteData.config.session.valid && siteData.tracking.id)
	{
		currentTrackingDialog(site);
	}
	else if(siteData.config.session.valid)
	{
		searchDialog(site);
	}
	else
	{
		login(site, true);
	}
}

// Execute site login function
async function login(site, fromConfig = false)
{
	const siteData = trackingSites.site(site);
	if(!siteData) return;

	loadSiteScript(site);

	const session = await sitesScripts[site].login();

	if(session.valid)
	{
		setSessionToken(site, session);
		
		if(fromConfig)
			configTracking(site, true);
		else
			tracking.track();
	}
	else
	{
		invalidateSession(site, true, true);
	}
}

// Refresh tokens
async function refreshTokens(force = false)
{
	const _trackingSites = trackingSites.list(true);
	const time = app.time();

	for(let key in _trackingSites)
	{
		const siteData = _trackingSites[key];
		const site = siteData.key;
		const currentSession = siteData.config.session;

		// Check if session is valid and refresh token if needed
		if(currentSession.valid && currentSession.refreshToken && (force || !currentSession.expires || (currentSession.expires - currentSession.expiresIn / 2) < time))
		{
			loadSiteScript(site);

			sitesScripts[site].refreshToken().then(function(session) {

				if(session.valid)
					setSessionToken(site, session);
				else
					invalidateSession(site, true);

			});	
		}
	}
}

// Save session token
function setSessionToken(site = '', session = {})
{
	session.expiresIn = (session.expiresIn || !session.refreshToken) ? session.expiresIn : 3600;
	const expires = (session.expiresIn ? app.time() + session.expiresIn : 0);

	saveSiteConfig(site, 'session', {
		valid: true,
		token: storage.safe.encrypt(session.token),
		refreshToken: storage.safe.encrypt(session.refreshToken),
		expires: expires,
		expiresIn: session.expiresIn,
	});
}

// Remove session token
function invalidateSession(site = '', loginDialog = false, fromConfig = false)
{
	saveSiteConfig(site, 'session', {valid: false, token: '', refreshToken: '', expires: 0, expiresIn: 0});

	if(loginDialog)
		invalidTokenDialog(site, fromConfig);
}

// Active and deactivate tracking site
function activeAndDeactivateTrackingSite(site = '', active = false)
{
	const _tracking = storage.getKey('tracking', dom.indexMainPathA()) || {};

	if(_tracking[site])
		_tracking[site].active = active;

	storage.updateVar('tracking', dom.indexMainPathA(), _tracking);
}

// Current dialog
async function currentTrackingDialog(site)
{
	const siteData = trackingSites.site(site, true);
	if(!siteData) return;

	loadSiteScript(site);

	events.dialog({
		header: false,
		width: 500,
		height: (!siteData.trackingChapter || !siteData.trackingVolume) ? 446 : 526,
		content: template.load('loading.html'),
		buttons: false,
	});

	const path = dom.indexMainPathA();

	const data = await sitesScripts[site].getComicData(siteData.tracking.id);
	if(data === null) return; // Invalid session

	data.url = siteData.pageUrl.replace('{{siteId}}', siteData.tracking.id);
	handlebarsContext.trackingResult = data;
	handlebarsContext.siteData = siteData;

	if(!handlebarsContext.trackingResult.chapters)
		handlebarsContext.trackingResult.chapters = '??';

	if(!handlebarsContext.trackingResult.volumes)
		handlebarsContext.trackingResult.volumes = '??';

	setTrackingChapters(site, path, data.chapters, data.volumes);

	$('.dialog-text').html(template.load('dialog.tracking.current.tracking.html'));

	events.events();
}

// Login dialogs
var getRedirectResultResolve = false;

async function getRedirectResult(site, url)
{
	const siteData = trackingSites.site(site);
	if(!siteData) return;

	events.dialog({
		header: hb.compile(language.dialog.auth.loginTo)({siteName: siteData.name}),
		width: 400,
		height: false,
		content: '<div style="height: 72px;">'+template.load('loading.html')+'</div>',
		onClose: 'tracking.handleOpenUrl();',
		buttons: [
			{
				text: language.buttons.cancel,
				function: 'events.closeDialog(); tracking.handleOpenUrl();',
			},
			{
				text: language.dialog.auth.manualLogin,
				function: 'events.closeDialog(); tracking.getTokenDialog(\''+site+'\');',
			}
		],
	});

	console.log('getRedirectResult', url);
	electron.shell.openExternal(url);

	return new Promise(function(resolve){
		getRedirectResultResolve = resolve;
	});
}

async function getTokenDialog(site = '', done = false)
{
	if(done)
	{
		const token = $('.input-token').val();
		const url = !/^(?:https?|opencomic):\/\//.test(token) ? 'opencomic://tracking/'+(!/=/.test(token) ? 'token=' : '')+token : token;

		tracking.handleOpenUrl(new URL(url));
	}
	else
	{
		const siteData = trackingSites.site(site);
		if(!siteData) return;

		if(!handlebarsContext.tracking) handlebarsContext.tracking = {};
		handlebarsContext.tracking.getTokenInput = hb.compile(language.dialog.tracking.getTokenInput)({siteName: siteData.name});

		events.dialog({
			header: hb.compile(language.dialog.tracking.getTokenHeader)({siteName: siteData.name}),
			width: 400,
			height: false,
			content: template.load('dialog.tracking.sites.token.html'),
			onClose: 'tracking.handleOpenUrl();',
			buttons: [
				{
					text: language.buttons.cancel,
					function: 'events.closeDialog(); tracking.handleOpenUrl();',
				},
				{
					text: language.buttons.ok,
					function: 'events.closeDialog(); tracking.getTokenDialog(\''+site+'\', true);',
				}
			],
		});

		events.focus('.input-token');
		events.eventInput();
	}
}

function invalidTokenDialog(site, fromConfig = false)
{
	const siteData = trackingSites.site(site);

	events.dialog({
		header: hb.compile(language.dialog.auth.sessionExpired)({siteName: siteData.name}),
		width: 400,
		height: false,
		content: hb.compile(language.dialog.auth.loginAgain)({siteName: siteData.name}),
		buttons: [
			{
				text: language.buttons.cancel,
				function: 'events.closeDialog();',
			},
			{
				text: language.buttons.ok,
				function: 'events.closeDialog(); tracking.login(\''+site+'\', '+(fromConfig ? 'true' : 'false')+');',
			}
		],
	});
}

// Search functions
function searchDialog(site)
{
	const siteData = trackingSites.site(site);

	if(!handlebarsContext.tracking) handlebarsContext.tracking = {};
	handlebarsContext.tracking.serachIn = hb.compile(language.dialog.tracking.serachIn)({siteName: siteData.name});

	handlebarsContext.trackingSiteKey = site;

	events.dialog({
		header: false,
		width: 500,
		height: 400,
		content: template.load('dialog.tracking.search.html'),
		buttons: false,
	});

	events.focus('.input-search');
	events.eventInput();

	const title = getTitle();
	searchComic(site, title);
}

async function searchComic(site, title = false)
{
	if(!title)
		title = getTitle();

	loadSiteScript(site);

	handlebarsContext.trackingSiteKey = site;

	const results = await sitesScripts[site].searchComic(title);
	if(results === null) return; // Invalid session

	handlebarsContext.trackingResults = results;

	$('.tracking-search').html(template.load('dialog.tracking.search.results.html'));
}

searchInputST = false;

function searchInput(site)
{
	clearTimeout(searchInputST);

	$('.tracking-search').html(template.load('loading.html'));

	searchInputST = setTimeout(function(site){

		const title = $('.input-search').val();
		searchComic(site, title);

	}, 300, site);
}

function setTrackingId(site, siteId)
{
	events.closeDialog();

	const _tracking = storage.getKey('tracking', dom.indexMainPathA()) || {};

	_tracking[site] = {
		id: siteId,
		active: true,
	};

	storage.updateVar('tracking', dom.indexMainPathA(), _tracking);

	if(tracked[dom.indexMainPathA()] && tracked[dom.indexMainPathA()][site])
		tracked[dom.indexMainPathA()][site] = [];

	tracking.track();

	// Snackbar here
}

function setTrackingChapters(site, path, chapters = false, volumes = false)
{
	const _tracking = storage.getKey('tracking', path) || {};

	_tracking[site].chapters = chapters || false;
	_tracking[site].volumes = volumes || false;
	_tracking[site].lastUpdatedChapters = Date.now();

	storage.updateVar('tracking', dom.indexMainPathA(), _tracking);
}

// Others dialogs
function addChapterNumberDialog(done = false, onlySite = false)
{
	if(done)
	{
		let chapter = +$('.input-chapter').val();
		let volume = +$('.input-volume').val();

		if(chapter < 1)
			chapter = false;

		if(volume < 1)
			volume = false;
	
		if(chapter !== false || volume !== false)
		{
			tracking.track(chapter, volume, onlySite);
		}
	}
	else
	{
		if($('#tracking-sites, .bar-right-buttons .button-tracking-sites').length >= 2)
		{
			reading.magnifyingGlassControl(2);
			events.desactiveMenu('#tracking-sites', '.bar-right-buttons .button-tracking-sites');
		}

		events.dialog({
			header: language.dialog.tracking.setHeader,
			width: 400,
			height: false,
			content: template.load('dialog.tracking.sites.chapter.number.html'),
			buttons: [
				{
					text: language.buttons.cancel,
					function: 'events.closeDialog();',
				},
				{
					text: language.buttons.ok,
					function: 'events.closeDialog(); tracking.addChapterNumberDialog(true);',
				}
			],
		});

		events.focus('.input-chapter');
		events.eventInput();
	}
}

// Scraping functions
function getTitle()
{
	let title = '';

	if(reading.readingCurrentPath() && compatible.compressed(reading.readingCurrentPath()))
		title = reading.readingCurrentPath() ? p.basename(reading.readingCurrentPath()).replace(/\.[^/.]+$/, '') : '';
	else
		title = dom.indexMainPathA() ? p.basename(dom.indexMainPathA()) : '';

	// Try detect end of name
	title = title.replace(/[\.\-_:;].*/, '', title).trim();

	// return only first 4 words to avoid incorrect words from the end of the filename
	title = title.split(/\s+/).splice(0, 4).join(' ');

	return title;
}

function getChapter()
{
	const regexs = [
		/chapters?|episodes?|issues?/, // English
		/caps?|cap[íi]tulos?|episodios/, // Spanish
		/cap[íi]tols?|episodis?/, // Catalan
	];

	const regexsMin = [
		/ch?|ep?/, // English
	];

	let name;

	if(reading.readingCurrentPath())
		name = p.basename(reading.readingCurrentPath());
	else
		return false;

	let chapter = extract(new RegExp('('+joinRegexs(regexs).source+')'+/[\.\-_:;\s]*(\d+)/.source, 'iu'), name, 2);

	if(!chapter)
	{
		chapter = extract(new RegExp(/(^|[\.\-_:;\s])/.source+'('+joinRegexs(regexsMin).source+')'+/[\.\-_:;\s]*(\d+)/.source, 'iu'), name, 3);

		if(!chapter) // Start with chapter number
			chapter = extract(/^\s*([0-9]+)/iu, name, 1);

		if(!chapter)
		{
			const volume = getVolume();

 			if(!volume) // Has a 1 or 4 digit number (Only if no volume are detected)
				chapter = extract(/\s([0-9]{1,4})(?:\s|\.|$)/iu, name, 1);
		}
	}

	if(!chapter && /^\d+$/.test(name)) // the folder name is numeric
		chapter = name;

	return chapter > 0 ? +chapter : false;
}

function getVolume()
{
	const regexs = [
		/volumes?/, // English
		/tomos?|volumen|volumenes/, // Spanish
		/toms?/, // Catalan
	];

	const regexsMin = [
		/vo?|vol/, // English
	];

	let name;

	if(reading.readingCurrentPath())
		name = p.basename(reading.readingCurrentPath());
	else
		return false;

	let volume = extract(new RegExp('('+joinRegexs(regexs).source+')'+/[\.\-_:;\s]*(\d+)/.source, 'iu'), name, 2);

	if(!volume)
		volume = extract(new RegExp(/(^|[\.\-_:;\s])/.source+'('+joinRegexs(regexsMin).source+')'+/[\.\-_:;\s]*(\d+)/.source, 'iu'), name, 3);

	return volume > 0 ? +volume : false;
}

function handleOpenUrl(url = false)
{
	if(!getRedirectResultResolve) return;
	if(!url) url = new URL('opencomic://tracking');

	getRedirectResultResolve(url);
	getRedirectResultResolve = false;
}

function scriptsPath(site = '')
{
	return p.join(appDir, 'scripts/tracking/'+site);
}

function start()
{
	refreshTokens();
	setInterval(refreshTokens, 60 * 60 * 12 * 1000); // Every 12 hours
}

module.exports = {
	scriptsPath: scriptsPath,
	configTracking: configTracking,
	setSessionToken: setSessionToken,
	invalidateSession: invalidateSession,
	addChapterNumberDialog: addChapterNumberDialog,
	getRedirectResult: getRedirectResult,
	getTokenDialog: getTokenDialog,
	invalidTokenDialog: invalidTokenDialog,
	searchDialog: searchDialog,
	getTitle: getTitle,
	login: login,
	refreshTokens: refreshTokens,
	searchInput: searchInput,
	setTrackingId: setTrackingId,
	track: track,
	trackST: function(){return trackST},
	getChapter: getChapter,
	getVolume: getVolume,
	activeAndDeactivateTrackingSite: activeAndDeactivateTrackingSite,
	tracked: function(){return tracked},
	handleOpenUrl: handleOpenUrl,
	start: start,
};
