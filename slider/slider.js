var option = {
	num:5,	//slider数量
	sliderId:slider,	//slider的id
	reactive:["sliderMedia"],	//slider上每个物件的媒体查询的id
	// reactive:["sliderMedia","sliderTextMedia"],	//slider上每个物件的媒体查询的id
	switchTime:5000,	//slider切换时间
}

var Media = (function(){
	var mediaCatcher = /@media\s*screen\s*and\s*(?:\(\s*((?:max)?(?:min)?)-width:(\d*)px\)\s*){0,3}\n?\s*\{\n?\s*(.*)\n?\s*\}/g;
	var resolutions;

	//构造函数
	Media = function(){
		for (var i = 0; i < option.reactive.length; i++) {
			//获取媒体查询
			var Media = document.getElementById(option.reactive[i]);
			//解析媒体查询
			var mediaText = Media.innerHTML;
			this[option.reactive[i]] = [];
			//循环获取每个媒体查询内容
			while(resolutions = mediaCatcher.exec(mediaText)){
				//创建断点对象
				var breakPoint = new BreakPoint(resolutions[resolutions.length - 1]);

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
				this[option.reactive[i]].push(breakPoint);
			}
		}
	};

	return Media;
})();

var BreakPoint = function(images){
	this.max = "";
	this.min = "";
	this.imgs = images;
};

var media = new Media();