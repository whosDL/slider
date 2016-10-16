var option = {
	num:5,	//slider数量
	sliderId:"slider",	//slider的id
	sliderMedia:"sliderMedia",	//slider媒体查询的id
	itemId:[],	//对应的物件盒子Id的前缀
	basePath:"",	//slider图片的保存路径
	switchTime:5000,	//slider切换时间
}

var EventHandler = function(){
	window.resize = function(){
		if(media.testBreak()){
			slider.refreshImg();
		};
	}
};

var Media = (function(){
	var mediaCatcher = /@media\s*screen\s*and\s*(?:\(\s*((?:max)?(?:min)?)-width:(\d*)px\)\s*){0,3}\n?\s*\{\n?\s*\[(.*)\]\n?\s*\}/g;
	var resolutions,difference;

	//构造函数
	Media = function(){
		//获取媒体查询
		var MediaObj = document.getElementById(option.sliderMedia);
		//解析媒体查询
		var mediaText = MediaObj.innerHTML;
		this.sliderMedia = [];
		//循环获取每个媒体查询内容
		while(resolutions = mediaCatcher.exec(mediaText)){
			//创建断点对象
			var breakPoint = new BreakPoint(resolutions[resolutions.length - 1]);
			//写入max和min
			switch(resolutions.length){
				case 4:
					breakPoint[resolutions[1]] = resolutions[2];
					break;
				case 6:
					breakPoint[resolutions[1]] = resolutions[2];
					breakPoint[resolutions[3]] = resolutions[4];
					break;
			}
			//保存断点对象
			this.sliderMedia.push(breakPoint);
		}
		//移除媒体查询对象
		MediaObj.parentNode.removeChild(MediaObj);
		//保存了与当前分辨率匹配的断点对象
		this.curBreak = this.testBreak();
	};

	//返回与当前分辨率匹配的断点对象
	Media.prototype.testBreak = function(){
		this.Width = window.innerWidth|| document.documentElement.clientWidth|| document.body.clientWidth;
		var hasChanged = false;
		for (var i = 0; i < this.sliderMedia.length; i++) {
			if (this.Width<this.sliderMedia[i].max && this.width>this.sliderMedia[i].min && difference > this.sliderMedia[i].max - this.sliderMedia[i].min) {
				difference = this.sliderMedia[i].max - this.sliderMedia[i].min;
				this.curBreak = this.sliderMedia[i];
				hasChanged = true;
			}
		}
		return hasChanged;
	}

	return Media;
})();
//这个对象中包含一些与option.sliderMedia中的项同名的媒体查询对象
//每个媒体查询对象都有一系列断点对象
//每个断点对象有三个属性，max保存了最大分辨率，min保存了最小分辨率，imgs是一个含有该断点下所有图片名的数组。

//断点对象构造函数
var BreakPoint = function(images){
	this.max = 3000;
	this.min = 0;
	this.imgs = images.split(",");
};

var Slider = (function(){
	var sliderNode = document.getElementById(option.sliderId);
	var sliderUl = sliderNode.getElementsByTagName("ul")[0];
	var sliders = sliderUl.getElementsByTagName("li");
	Slider = function(){
		for (var i = 0; i < sliders.length; i++) {
			var imgNode = document.createElement('img');
			imgNode.src = option.basePath + curImg[i];
			sliders[i].appendChild(imgNode);
		}
	};

	//更新slider图片
	Slider.prototype.refreshImg = function(){
		for (var i = 0; i < sliders.length; i++) {
			sliders[i].getElementsByTagName("img").src = basePath + curImg[i];
		}
	}
	return Slider;
})();

//实例化
var media = new Media();
var slider = new Slider();
var eventHandler = new EventHandler();