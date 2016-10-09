var a = document.getElementById('alpha');
var b = document.getElementById('beta');
var c = document.getElementById('gamma');
var cube = document.getElementById('cube');
window.addEventListener('deviceorientation',function(e){
	throttle(function(){
		a.innerHTML = e.alpha;
		b.innerHTML = e.beta;
		c.innerHTML = e.gamma;
		var rb = e.beta - 90;
		var ra = -e.alpha;
		var rc = -e.gamma;
		cube.style.transform = "translateZ(-800px) rotateX(" + rb +"deg) rotateY(" + ra + "deg) rotateZ(" + rc + "deg)";
	},this);
},false);

//函数节流
function throttle(method,context){
    clearTimeout(method.tId);
    method.tId=setTimeout(function(){
        method.call(context);
    },30);
}

