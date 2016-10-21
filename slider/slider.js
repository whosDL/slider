var option = {
    num:5,    //slider数量
    sliderId:"slider",    //slider的id
    sliderMedia:"sliderMedia",    //slider媒体查询的id
    itemId:[],    //对应的物件盒子Id的前缀
    basePath:"",    //slider图片的保存路径
    switchTime:5000,    //slider切换时间
    transformTime:1000, //slider过渡时间
};
//函数节流
function throttle(method,context){
    clearTimeout(method.tId);
    method.tId=setTimeout(function(){
        method.call(context);
    },500);
}

var EventHandler = function(){
    //监听浏览器窗口大小变化
    window.onresize = function(){
        throttle(function(){
            if(media.testBreak()){
                slider.refreshImg();
            };
        },window)
    }
};

var Media = (function(){
    var mediaCatcher = /@media\s*screen\s*and\s*(?:\(\s*((?:max)?(?:min)?)-width:(\d*)px\)\s*){0,3}\n?\s*\{\n?\s*\[(.*)\]\n?\s*\}/g;
    var resolutions;

    //构造函数
    Media = function(){
        //获取媒体查询
        var MediaObj = document.getElementById(option.sliderMedia);
        //解析媒体查询
        var mediaText = MediaObj.innerHTML;
        this.sliderMedia = [];
        while(resolutions = mediaCatcher.exec(mediaText)){
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
            this.sliderMedia.push(breakPoint);
        }
        //移除媒体查询对象
        MediaObj.parentNode.removeChild(MediaObj);
        //匹配断点
        this.testBreak();
    };

    //返回与当前分辨率匹配的断点对象
    Media.prototype.testBreak = function(){
        this.width = document.documentElement.clientWidth|| document.body.clientWidth;
        var hasChanged = false,difference = 3000,tempBreak;
        for (var i = 0; i < this.sliderMedia.length; i++) {
            if (this.width<=this.sliderMedia[i].max && this.width>=this.sliderMedia[i].min && difference>this.sliderMedia[i].max-this.sliderMedia[i].min) {
                difference = this.sliderMedia[i].max - this.sliderMedia[i].min;
                tempBreak = this.sliderMedia[i];
            }
        }
        if(this.curBreak != tempBreak){
            this.curBreak = tempBreak;
            hasChanged = true;
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
    var timer,  //计时器
        currIndex,  //当前slider序号（从0开始）
        preIndex,   //正在离开的slider序号
        switching = false;  //表示是否正在于切换中
    //获取slider元素
    var sliderNode = document.getElementById(option.sliderId);
    var sliderUl = sliderNode.getElementsByTagName("ul")[0];
    //设置slider图片
    Slider = function(){
        this.sliders = sliderUl.getElementsByTagName("li");
        //设置图片
        this.curImg = media.curBreak.imgs;
        for (var i = 0; i < this.sliders.length; i++) {
            var imgNode = document.createElement('img');
            imgNode.setAttribute("src", option.basePath + this.curImg[i]);
            this.sliders[i].appendChild(imgNode);
        }
        //设置类名
        for (var i = 0; i < this.sliders.length; i++) {
            this.sliders[i].setAttribute("class","ready");
        }
        this.sliders[0].setAttribute("class","curr");
        currIndex = 0;
        this.refreshImg();
        this.play();
    };

    //更新slider图片
    Slider.prototype.refreshImg = function(){
        this.curImg = media.curBreak.imgs;
        for (var i = 0; i < this.sliders.length; i++) {
            this.sliders[i].getElementsByTagName("img")[0].setAttribute("src", option.basePath + this.curImg[i]);
        }
    };

    //播放slider
    Slider.prototype.switchTo = function(index){
        var that = this;
        if (index == currIndex) {
            return; //阻止切换至当前slider
        } else if (switching == true) {
            return; //阻止切换过程中触发
        } else {
            //切出slider
            this.sliders[currIndex].setAttribute("class","out");
            //进入切换状态
            switching = true;
            preIndex = currIndex;
            //重置slider
            setTimeout(function(){
                that.sliders[preIndex].setAttribute("class","reset");
                that.sliders[preIndex].setAttribute("class","ready");
                //接触切换状态
                switching = false;
            },option.transformTime);
            //切入slider
            this.sliders[index].setAttribute("class","curr");
            currIndex = index;
            this.play();
        }
    };

    //播放
    Slider.prototype.play = function(){
        var that = this;
        timer = setTimeout(function(){
            if (currIndex == that.sliders.length - 1) {
                that.switchTo(0);
            } else {
                that.switchTo(currIndex + 1);
            }
        },option.switchTime);
    };

    //下一张
    Slider.prototype.toNext = function(){
        if (currIndex == this.sliders.length - 1) {
            this.switchTo(0);
        } else {
            this.switchTo(currIndex + 1);
        }
    }

    //上一张
    Slider.prototype.toPre = function(){
        if (currIndex == 0) {
            this.switchTo(this.sliders.length - 1);
        } else {
            this.switchTo(currIndex - 1);
        }
    }

    return Slider;
})();

//实例化
var media = new Media();
var slider = new Slider();
var eventHandler = new EventHandler();