
var currentStatus = {};

function setStatus(sha, value)
{
	currentStatus[sha] = {...(currentStatus[sha] || {}), ...value};
}

var prevScroll = {};

function scroll(event = false)
{
	app.setThrottle('dom-scroll', function(){

		const scrollTop = event?.target?.scrollTop || template._contentRight().firstElementChild.scrollTop;
		const visibleItems = dom.calculateVisibleItems(handlebarsContext.page.view, scrollTop);

		if(prevScroll.start !== visibleItems.start || prevScroll.end !== visibleItems.end)
		{
			threads.clean('folderThumbnails');

			for(const sha in currentStatus)
			{
				const status = currentStatus[sha];

				if((status.index >= visibleItems.start && status.index <= visibleItems.end) || status.forceSize)
				{
					addToQueue(sha);
				}
			}
		}

		prevScroll = visibleItems;

	}, 50, 100);
}

function addToQueue(sha)
{
	const status = currentStatus[sha] || {};
	const {path, folderSha, forceSize, thumbnails, progress} = status;

	if(thumbnails || progress)
	{
		threads.job('folderThumbnails', {key: sha, useThreads: 0.2}, async function() {

			if(thumbnails)
			{
				setStatus(sha, {
					thumbnails: false,
				});
			}

			if(progress)
			{
				setStatus(sha, {
					progress: false,
				});
			}

			if(thumbnails)
			{
				const images = [
					{cache: false, path: '', sha: folderSha+'-0'},
					{cache: false, path: '', sha: folderSha+'-1'},
					{cache: false, path: '', sha: folderSha+'-2'},
					{cache: false, path: '', sha: folderSha+'-3'},
				];

				const file = fileManager.file(path, {fromThumbnailsGeneration: true, subtask: true});
				const _images = await file.images(4, false, true);

				await dom._getFolderThumbnails(file, images, _images, path, folderSha, true, forceSize);

				file.destroy();
			}

			if(progress)
			{
				try
				{
					const _progress = await reading.progress.get(path, true, true);
					dom.addProgressToDom(folderSha, _progress, (progress === 1));
				}
				catch(error)
				{
				}
			}

			return;

		}).catch(function(error) {

			dom.compressedError(error, false);
			
		});
	}
}

async function event()
{
	app.event(template._contentRight().firstElementChild, 'scroll', scroll);

	await app.sleep(200);
	scroll();
}

function reset()
{
	threads.clean('folderThumbnails');
	currentStatus = {};
	prevScroll = {};
}

module.exports = {
	reset,
	event,
	setStatus,
	get currentStatus() {return currentStatus},
}