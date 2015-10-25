var fileInput = document.querySelector("#fileInput");
var imgEl = document.querySelector("#imgEl");
var setFormat = "";
var origFileName = "";
var usePerc = document.getElementById("usePerc");
var imageWidthPX = document.getElementById("imageWidthPX");
var imageHeightPX = document.getElementById("imageHeightPX");
var imageSizePerc = document.getElementById("imageSizePerc");
var dlLink = document.getElementById("download");
var closeWarning = document.getElementById("closeWarning");
var imageQual = document.getElementById("imageQuality");
var imageQualEl = document.getElementsByName("imageFormat");

var fileReaders = [];

//disable percentage
imageSizePerc.disabled = true;

dlLink.style.visibility = "hidden";

var isChrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
var isFF = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;

if (!isChrome && !isFF)
{
	var bWarning = document.getElementsByClassName("browserWarning");
	bWarning[0].style.visibility = "visible";
}

function Main() {}
var main = new Main();

Main.prototype.inputFiles = function(argFiles)
{
	var files = fileInput.files;	
	var size = [];//image size array
	var filesLength = files.length;
	var fileNames = [];

	for (var i in files)
	{
		if (typeof files[i] == "object")
		{
			fileNames.push(files[i].name);
		}
	}

	// for (var i in files)
	// {	
	var rFunc = function(i)
	{
		var nextIterate = i + 1;
		if (typeof files[i] == "object")
		{
			origFileName = files[i].name;
			var reader = new FileReader();
			reader.onload = function(e)
		    {
				main.drawToCanvas(reader.result, fileNames[i]);

				if (i < filesLength)
				{
					rFunc(nextIterate);
				}
			};
			reader.readAsDataURL(files[i]);
		}
		if (i < filesLength)
		{
			rFunc(nextIterate);
		}
	}
	rFunc(0);
	// }

	fileInput.value = "";//clear the file input to be able to use the same file

};

Main.prototype.drawToCanvas = function(imgSrc, fileName)
{
	var cvs = document.getElementById('canvasImage');
	var ctx = cvs.getContext('2d');
	var img = new Image;
	img.onload = function()
	{
		var imgSize = main.calcImageSize(img);

		img.width = imgSize[0];
		img.height = imgSize[1];

		cvs.width = img.width;
		cvs.height = img.height;
	  	ctx.drawImage(img,0,0); // Or at whatever offset you like
	  	main.rotateImage("180", cvs, ctx, img, fileName)
	};
	img.src = imgSrc;
};

Main.prototype.rotateImage = function(rotationType, cvs, ctx, img, fileName)
{
	var rotation = document.getElementsByName("rotation");

	for (var i in rotation)
	{
		if (typeof rotation[i] == "object")
		{
			if (rotation[i].checked)
			{
				rotationType = rotation[i].value;
			}
		}
	}

	var cvs2 = document.getElementById('canvasImage');
	ctx.clearRect(0, 0, cvs.width, cvs.height);
	cvs = null;

	switch(rotationType)
	{
		case "none":
			cvs2.width = img.width;
			cvs2.height = img.height;
			ctx.rotate(0 * Math.PI / 180);
			ctx.drawImage(img, 0, 0, img.width, img.height);
			break;
		case "90CW":
			cvs2.width = img.height;
			cvs2.height = img.width;
			ctx.rotate(90 * Math.PI / 180);
			ctx.drawImage(img, 0, -img.height, img.width, img.height);
			break;
		case "180":
			cvs2.width = img.width;
			cvs2.height = img.height;
			ctx.rotate(180 * Math.PI / 180);
			ctx.drawImage(img, -img.width, -img.height, img.width, img.height);
			break;
		case "90CCW":
			cvs2.width = img.height;
			cvs2.height = img.width;
			ctx.rotate(270 * Math.PI / 180);
			ctx.drawImage(img, -img.width, 0, img.width, img.height);
			break;
		default: 
			break;
	}

	var jpg = document.getElementById("formatJpg");
	var png = document.getElementById("formatPng");
	var format = "image/jpeg";//default
	var quality = document.getElementById("imageQuality").value / 100;

	if (jpg.checked)
	{
		setFormat = "jpg";
		format = jpg.value;
	}
	if (png.checked)
	{
		setFormat = "png"
		format = png.value;
	}

	var dataUrl = cvs2.toDataURL(format, quality);
	main.download(dataUrl, fileName);
};

Main.prototype.calcImageSize = function(image)
{
	imageWidthPXVal = imageWidthPX.value;
	imageHeightPXVal = imageHeightPX.value;
	imageSizePercVal = imageSizePerc.value;
	
	var resizeType = "px";

	if (usePerc.checked)
	{
		resizeType = "perc";
	}

	if (resizeType == "px")
	{
		//if one side is not set then scale proportionally
		if (imageHeightPXVal == 0 || imageHeightPXVal.length == 0)
		{
			var origWidth = image.width;
			var propSize = imageWidthPXVal / origWidth;

			imageHeightPXVal = Math.floor(image.height * propSize);
		}

		if (imageWidthPXVal == 0 || imageWidthPXVal.length == 0)
		{
			var origHeight = image.height;
			var propSize = imageHeightPXVal / origHeight;

			imageWidthPXVal = Math.floor(image.width * propSize);
		}

		if ((imageWidthPXVal == 0 || imageWidthPXVal.length == 0) && (imageHeightPXVal == 0 || imageHeightPXVal.length == 0))
		{
			imageWidthPXVal = image.width;
			imageHeightPXVal = image.height;
		}

		return [imageWidthPXVal, imageHeightPXVal];
	}
	else if (resizeType == "perc")
	{
		image.width = Math.floor((image.width * imageSizePercVal) / 100);
		image.height = Math.floor((image.height * imageSizePercVal) / 100);
	}

	return [image.width, image.height];
};

Main.prototype.download = function(dataUrl, imageName)
{
	var fileName = "";
	if (document.getElementById("outputFileName").value.length == 0)
	{
		fileName = imageName.substr(0, imageName.lastIndexOf('.'));
	}
	else
	{
		fileName = document.getElementById("outputFileName").value
	}

	dlLink.download = fileName + "." + setFormat;
	dlLink.href = dataUrl;
	dlLink.target = "_blank";

	dlLink.click();
};

fileInput.addEventListener("change", function(e)
{
	main.inputFiles();
});

usePerc.addEventListener("change", function()
{
	imageWidthPX.disabled = false;
	imageHeightPX.disabled = false;
	imageSizePerc.disabled = true;

	if (usePerc.checked)
	{
		imageWidthPX.disabled = true;
		imageHeightPX.disabled = true;
		imageSizePerc.disabled = false;
	}
});

closeWarning.addEventListener("click", function() 
{
	var parNode = this.parentNode;
	parNode.parentNode.removeChild(parNode);
});

	for (i in imageQualEl)
	{
		if (typeof imageQualEl[i] == "object")
		{
			imageQualEl[i].onclick = function()
			{
				if (this.id == "formatJpg")
				{
					imageQual.disabled = false;
				}
				else if (this.id == "formatPng")
				{
					imageQual.disabled = true;
				}
			};
		}
	}