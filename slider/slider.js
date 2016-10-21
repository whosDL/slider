var option = {
    num: 5,    //slider数量
    sliderId: "slider",    //slider的id
    sliderMedia: "sliderMedia",    //slider媒体查询的id
    basePath: "images/",    //slider图片的保存路径
    switchTime: 5000,    //slider切换时间
    transformTime: 1000, //slider过渡时间
    dots: true, //是否启用导航点
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

    //监听鼠标点击事件
    window.onclick = function(e){
        if (e.target.dataset.index) {
            slider.switchTo(parseInt(e.target.dataset.index));
            return;
        }

        switch(e.target.id){
            case "forward":
                slider.toNext();
                break;
            case "back":
                slider.toPre();
                break;
        }
    }

    //滑动切换
    var touch = [];
    document.getElementById(option.sliderId).addEventListener("touchstart",function(e){
        touch[0] = e;
    },false);
    document.getElementById(option.sliderId).addEventListener("touchend",function(e){
        touch[1] = e;
        var x1 = touch[0].changedTouches[0].clientX,
            x2 = touch[1].changedTouches[0].clientX,
            y1 = touch[0].changedTouches[0].clientY,
            y2 = touch[1].changedTouches[0].clientY;
        if (Math.abs((y2-y1)/(x2-x1))<=1) {
            if (x1<x2) {
                slider.toPre();
            } else {
                slider.toNext();
            }
        }
    },false);
};

var Media = (function(){
    var mediaCatcher = /@media\s*screen\s*and\s*(?:\(\s*((?:max)?(?:min)?)-width:(\d*)px\)\s*){0,3}\n?\s*\{\n?\s*\[(.*)\]\n?\s*\}/g;
    var resolutions;
    //获取媒体查询
    var MediaObj = document.getElementById(option.sliderMedia);
    //解析媒体查询
    var mediaText = MediaObj.innerHTML;

    //构造函数
    Media = function(){
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
        switching = false,  //表示是否正在于切换中
        //获取slider元素
        sliderNode = document.getElementById(option.sliderId);
    var sliderUl = document.getElementById("sliderimg");
    var sliders = sliderUl.getElementsByTagName("li");

    //设置slider图片
    Slider = function(){
        this.sliders = sliders;
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

        //创建导航点
        if (option.dots) {
            var sliderDotsUl = document.createElement("ul");
            sliderNode.appendChild(sliderDotsUl);
            sliderDotsUl.setAttribute("class","sliderdots");
            for (var i = 0; i < sliders.length; i++) {
                sliderDotsUl.appendChild(document.createElement("li")).dataset.index = i;
            };
            this.sliderDots = sliderDotsUl.getElementsByTagName("li");
            this.sliderDots[0].setAttribute("class","currdot")
        };

        //创建前进后退按钮
        if (option.btn) {

        }

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
        clearTimeout(timer);
        var that = this;
        if (index == currIndex) {
            return; //阻止切换至当前slider
        } else if (switching == true) {
            return; //阻止切换过程中触发
        } else {
            //进入切换状态
            switching = true;
            //切出slider
            this.sliders[currIndex].setAttribute("class","out");
            //切换点
            if (option.dots) {
                this.sliderDots[currIndex].setAttribute("class","");
                this.sliderDots[index].setAttribute("class","currdot")
            }
            
            preIndex = currIndex;
            //重置slider
            setTimeout(function(){
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