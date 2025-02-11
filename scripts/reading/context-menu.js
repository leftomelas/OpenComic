
function show(gamepad = false)
{
	const saveImages = (reading.isCanvas() || reading.isEbook()) ? false : true;
	dom.queryAll('.separator-save-images, .reading-context-menu-save-image, .reading-context-menu-save-all-images, .reading-context-menu-save-bookmarks-images, .reading-context-menu-save-all-bookmarks-images, .reading-context-menu-set-as-poster, .reading-context-menu-set-as-poster-folders').css({display: saveImages ? '' : 'none'});

	if(gamepad)
		events.activeMenu('#reading-context-menu', false, 'gamepad');
	else
		events.activeContextMenu('#reading-context-menu');
}

function getVars()
{
	const indexPathA = dom.indexPathA();
	const currentPath = onReading ? reading.readingCurrentPath() : indexPathA;
	const pathIsFolder = (currentPath && fs.existsSync(currentPath) && fs.statSync(currentPath).isDirectory()) ? true : false;

	return {
		currentPath: currentPath,
		pathIsFolder: pathIsFolder,
	};
}

function openFileLocation()
{
	const vars = getVars();

	if(vars.pathIsFolder)
		electron.shell.openPath(vars.currentPath)
	else
		electron.shell.showItemInFolder(fileManager.firstCompressedFile(vars.currentPath))
}

function aboutFile()
{
	const vars = getVars();

	dom.fileInfo.show(vars.pathIsFolder ? vars.currentPath : fileManager.lastCompressedFile(vars.currentPath));
}

function getCurrentImage()
{
	const currentIndex = reading.currentIndex() - 1;

	const images = reading.images();
	const imagesData = reading.imagesData();

	for(let key in images)
	{
		if(currentIndex == imagesData[key].position)
			return images[key].path;
	}

	return false;	
}

function setAsPoster()
{
	const image = getCurrentImage();
	if(!image) return;

	dom.poster.setAsPoster(image);
}

function setAsPosterFolders()
{
	const image = getCurrentImage();
	if(!image) return;

	dom.poster.setAsPosterFolders(image, dom.indexMainPathA());
}

function generateFileName(path, page, leadingZeros, fileName)
{
	// Parent folder name
	let parentFolderName = p.dirname(p.dirname(path));
	let ext1 = p.extname(parentFolderName);
	parentFolderName = p.basename(parentFolderName, (ext1 && ext1.length < 6 ? ext1 : ''));

	// Current file/folder name
	let folderName = p.dirname(path);
	let ext2 = p.extname(folderName);
	folderName = p.basename(folderName, (ext2 && ext2.length < 6 ? ext2 : ''));

	const extension = p.extname(path);
	const imageName = p.basename(path, extension);

	fileName = fileName.replace(/\[parentFolder(?:Name)?\]/, parentFolderName);
	fileName = fileName.replace(/\[folder(?:Name)?\]/, folderName);
	fileName = fileName.replace(/\[image(?:Name)?\]/, imageName);
	fileName = fileName.replace(/\[page\]/, String(page).padStart(leadingZeros, '0'));
	fileName = fileName.replace(/\[pageInt\]/, page);

	let ext3 = p.extname(fileName);
	if(!ext3 || ext3.length >= 6) fileName += extension;

	return fileName;
}

function genearteFilePath(saveTo, fileName)
{
	let path = p.join(saveTo, fileName);

	const extension = p.extname(fileName);
	const imageName = p.basename(fileName, extension);

	for(let i = 1; i < 100; i++)
	{
		if(!fs.existsSync(path))
			break;

		path = p.join(saveTo, imageName+' ('+i+')'+extension);
	}

	return path;
}

function saveImage()
{
	const position = reading.currentImagePosition();
	saveAllImages(position);
}

function saveAllImages(position = false)
{
	const images = reading.images();
	const imagesData = reading.imagesData();

	const toSave = [];
	let highestPage = 0;

	for(let key in images)
	{
		const path = images[key].path;

		if(position === false || position == imagesData[key].position)
			toSave.push({path: path, page: key});

		if(+key > highestPage)
			highestPage = +key;
	}

	saveImages(toSave, String(highestPage).length);
}

function saveBookmarksImages(loadBookmarks = false)
{
	saveAllBookmarksImages(loadBookmarks, true);
}

function saveAllBookmarksImages(loadBookmarks = false, onlyCurrent = false)
{
	if(loadBookmarks) reading.loadBookmarks();
	const bookmarks = handlebarsContext.bookmarks;

	const toSave = [];
	let highestPage = 0;

	for(let i = 0, len = bookmarks.length; i < len; i++)
	{
		const folder = bookmarks[i];

		if((!onlyCurrent || folder.current) && !folder.continueReading)
		{
			for(let i = 0, len = folder.bookmarks.length; i < len; i++)
			{
				const bookmark = folder.bookmarks[i];

				toSave.push({path: bookmark.path, page: bookmark.index});

				if(bookmark.index > highestPage)
					highestPage = bookmark.index;
			}
		}
	}

	saveImages(toSave, String(highestPage).length);
}

function saveImages(toSave = [], leadingZeros = 3)
{
	if(config.saveImageToFolder)
	{
		fileManager.macosStartAccessingSecurityScopedResource(config.saveImageFolder);
		_saveImages(toSave, leadingZeros, config.saveImageFolder, config.saveImageTemplate);
	}
	else
	{
		const saveDialog = macosMAS ? saveDialogDirectory : saveDialogFile;

		saveDialog(async function(saveTo, fileName){

			_saveImages(toSave, leadingZeros, saveTo, fileName);

		});
	}

}

async function _saveImages(toSave = [], leadingZeros = 3, saveTo, fileName)
{
	const currentTime = new Date();
	let first = '';

	if(toSave.length)
	{
		let file = fileManager.file(p.dirname(toSave[0].path));
		await file.makeAvailable(toSave);
		file.destroy();

		for(let i = 0, len = toSave.length; i < len; i++)
		{
			const image = toSave[i];
			const realPath = fileManager.realPath(image.path);
			const saveImageTo = genearteFilePath(saveTo, generateFileName(image.path, image.page, leadingZeros, fileName));
			if(first === '') first = saveImageTo;

			if(!fs.existsSync(saveImageTo))
			{
				fs.copyFileSync(realPath, saveImageTo);
				fs.utimes(saveImageTo, currentTime, currentTime, function(){});
			}
		}
	
		events.snackbar({
			key: 'saveAllImages',
			text: language.global.contextMenu.saveImagesMessage,
			duration: 6,
			buttons: [
				{
					text: language.global.open,
					function: 'electron.shell.showItemInFolder(\''+escapeQuotes(escapeBackSlash(first), 'simples')+'\');',
				},
			],
		});
	}
	else
	{
		console.error('No images to save');
	}
}

function saveDialogFile(callback)
{
	electronRemote.dialog.showSaveDialog({properties: ['openDirectory', 'createDirectory'], buttonLabel: language.buttons.save, defaultPath: config.saveImageTemplate}).then(function(result) {

		if(!result.canceled && result.filePath)
			callback(p.dirname(result.filePath), p.basename(result.filePath));

	});
}

function saveDialogDirectory(callback)
{
	electronRemote.dialog.showOpenDialog({properties: ['openDirectory', 'createDirectory'], buttonLabel: language.buttons.save}).then(function(files) {

		if(files.filePaths && files.filePaths[0] && fs.statSync(files.filePaths[0]).isDirectory())
			callback(files.filePaths[0], (config.saveImageTemplate === '[parentFolder] - [folder] - [image] - [page]' ? '[folder] - [image] - [page]' : config.saveImageTemplate));

	});
}

module.exports = {
	show: show,
	openFileLocation: openFileLocation,
	aboutFile: aboutFile,
	setAsPoster: setAsPoster,
	setAsPosterFolders: setAsPosterFolders,
	saveImage: saveImage,
	saveAllImages: saveAllImages,
	saveBookmarksImages: saveBookmarksImages,
	saveAllBookmarksImages: saveAllBookmarksImages,
};